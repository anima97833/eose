export interface TileLayerOption {
  id: string;
  name: string;
  url: string;
  subdomains: string[];
  maxZoom: number;
  minZoom: number;
  attribution: string;
}

export const TILE_PROVIDERS: Record<string, TileLayerOption> = {
  osmStandard: {
    id: 'osmStandard',
    name: '开源真实街区 (无水印)',
    // OpenStreetMap 官方原生瓦片：完全无水印、包含真实城市街道与道路名称
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: ['a', 'b', 'c'],
    maxZoom: 19,
    minZoom: 3,
    attribution: '&copy; OpenStreetMap contributors',
  },
  osmHot: {
    id: 'osmHot',
    name: '人道救援清晰彩色版 (无水印)',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    subdomains: ['a', 'b', 'c'],
    maxZoom: 19,
    minZoom: 3,
    attribution: '&copy; OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team',
  },
};
