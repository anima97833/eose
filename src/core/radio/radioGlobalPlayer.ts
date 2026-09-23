import Hls from 'hls.js';
import { RadioStation, PRESET_STATIONS } from './radioService';
import {
  loadLastStationId,
  saveLastStationId,
  loadRadioVolume,
  saveRadioVolume,
} from './radioThemeStorage';

export interface RadioPlayerState {
  currentStation: RadioStation;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  isMuted: boolean;
  errorMsg: string | null;
}

type Listener = (state: RadioPlayerState) => void;

class RadioGlobalPlayer {
  private audio: HTMLAudioElement | null = null;
  private hls: Hls | null = null;
  private listeners: Set<Listener> = new Set();

  private state: RadioPlayerState = {
    currentStation: PRESET_STATIONS[0],
    isPlaying: false,
    isLoading: false,
    volume: 0.8,
    isMuted: false,
    errorMsg: null,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      const lastId = loadLastStationId();
      const initialStation = PRESET_STATIONS.find((s) => s.id === lastId) || PRESET_STATIONS[0];
      const initialVol = loadRadioVolume();

      this.state.currentStation = initialStation;
      this.state.volume = initialVol;

      this.initAudio();
    }
  }

  private initAudio() {
    if (typeof window === 'undefined') return;
    const audio = new Audio();
    audio.preload = 'none';
    audio.volume = this.state.volume;
    try {
      (audio as any).referrerPolicy = 'no-referrer';
    } catch {}

    audio.addEventListener('waiting', () => {
      this.updateState({ isLoading: true });
    });
    audio.addEventListener('canplay', () => {
      this.updateState({ isLoading: false });
    });
    audio.addEventListener('playing', () => {
      this.updateState({ isLoading: false, isPlaying: true, errorMsg: null });
    });
    audio.addEventListener('pause', () => {
      this.updateState({ isPlaying: false });
    });

    this.audio = audio;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): RadioPlayerState {
    return this.state;
  }

  private updateState(partial: Partial<RadioPlayerState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((listener) => listener(this.state));
  }

  public playStation(station: RadioStation) {
    this.updateState({
      currentStation: station,
      errorMsg: null,
    });
    saveLastStationId(station.id);
    this.playStreamUrl(station.streamUrl, station.backupStreamUrl);
  }

  public togglePlay() {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      this.playStreamUrl(
        this.state.currentStation.streamUrl,
        this.state.currentStation.backupStreamUrl
      );
    }
  }

  public pause() {
    if (this.audio) {
      this.audio.pause();
    }
    this.updateState({ isPlaying: false });
  }

  public playStreamUrl(url: string, backupUrl?: string) {
    if (!this.audio) this.initAudio();
    const audio = this.audio;
    if (!audio) return;

    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }

    this.updateState({ isLoading: true, errorMsg: null });

    const onPlayFail = () => {
      if (backupUrl && audio.src !== backupUrl) {
        console.warn('Primary stream failed, attempting backup stream:', backupUrl);
        this.playStreamUrl(backupUrl);
      } else {
        this.updateState({
          isLoading: false,
          isPlaying: false,
          errorMsg: '电台网络连接微弱，请轻拨换台',
        });
      }
    };

    if (url.includes('.m3u8')) {
      if (audio.canPlayType('application/vnd.apple.mpegurl')) {
        audio.src = url;
        audio.load();
        audio.play().then(() => this.updateState({ isPlaying: true })).catch(onPlayFail);
      } else if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(audio);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          audio.play().then(() => this.updateState({ isPlaying: true })).catch(onPlayFail);
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            hls.destroy();
            this.hls = null;
            onPlayFail();
          }
        });
        this.hls = hls;
      } else {
        audio.src = url;
        audio.load();
        audio.play().then(() => this.updateState({ isPlaying: true })).catch(onPlayFail);
      }
    } else {
      audio.src = url;
      audio.load();
      audio.play().then(() => this.updateState({ isPlaying: true })).catch(onPlayFail);
    }
  }

  public nextStation(stationList: RadioStation[] = PRESET_STATIONS) {
    const currIdx = stationList.findIndex((s) => s.id === this.state.currentStation.id);
    const nextIdx = (currIdx + 1) % stationList.length;
    this.playStation(stationList[nextIdx]);
  }

  public prevStation(stationList: RadioStation[] = PRESET_STATIONS) {
    const currIdx = stationList.findIndex((s) => s.id === this.state.currentStation.id);
    const prevIdx = (currIdx - 1 + stationList.length) % stationList.length;
    this.playStation(stationList[prevIdx]);
  }

  public setVolume(val: number) {
    const clamped = Math.max(0, Math.min(1, val));
    this.updateState({ volume: clamped, isMuted: clamped === 0 });
    if (this.audio) {
      this.audio.volume = this.state.isMuted ? 0 : clamped;
    }
    saveRadioVolume(clamped);
  }

  public toggleMute() {
    const nextMuted = !this.state.isMuted;
    this.updateState({ isMuted: nextMuted });
    if (this.audio) {
      this.audio.volume = nextMuted ? 0 : this.state.volume;
    }
  }
}

export const radioGlobalPlayer = new RadioGlobalPlayer();
