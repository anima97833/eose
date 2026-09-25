import React from 'react';
import { playClickSound } from './soundSynthesizer';

export const FOCUS_PRESETS = [15, 25, 30, 45, 50, 60];
export const SHORT_BREAK_PRESETS = [3, 5, 10];
export const LONG_BREAK_PRESETS = [15, 20, 30];

export interface CustomDurationSectionProps {
  title: string;
  value: number;
  presets: number[];
  min: number;
  max: number;
  stepPresets?: number[];
  onSelect: (val: number) => void;
}

export const CustomDurationSection: React.FC<CustomDurationSectionProps> = ({
  title,
  value,
  presets,
  min,
  max,
  stepPresets = [1, 5],
  onSelect,
}) => {
  const isPreset = presets.includes(value);

  const handleStep = (delta: number) => {
    playClickSound();
    const next = Math.max(min, Math.min(max, value + delta));
    onSelect(next);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      const clamped = Math.max(min, Math.min(max, val));
      onSelect(clamped);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* 头部标题与当前值 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: '#446652', fontWeight: 600 }}>{title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {!isPreset && (
            <span
              style={{
                fontSize: '10px',
                color: '#3A8259',
                backgroundColor: 'rgba(215, 235, 220, 0.6)',
                padding: '1px 6px',
                borderRadius: '8px',
                fontWeight: 600,
              }}
            >
              自定义
            </span>
          )}
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#245239',
              backgroundColor: 'rgba(215, 235, 220, 0.9)',
              padding: '2px 8px',
              borderRadius: '10px',
              border: '1px solid rgba(160, 185, 170, 0.45)',
            }}
          >
            {value} 分钟
          </span>
        </div>
      </div>

      {/* 常用预设选项胶囊 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${presets.length}, 1fr)`,
          gap: '6px',
        }}
      >
        {presets.map((dur) => {
          const isSelected = value === dur;
          return (
            <button
              key={dur}
              type="button"
              onClick={() => {
                playClickSound();
                onSelect(dur);
              }}
              style={{
                padding: '7px 0',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 700,
                transition: 'all 0.15s ease',
                backgroundColor: isSelected ? '#3A8259' : '#EDF5EE',
                color: isSelected ? '#FFFFFF' : '#4E7D63',
                boxShadow: isSelected
                  ? 'inset 2px 2px 5px rgba(25, 60, 40, 0.5), inset -2px -2px 5px rgba(255, 255, 255, 0.2)'
                  : '2px 2px 6px rgba(160, 185, 170, 0.45), -2px -2px 6px rgba(255, 255, 255, 0.9)',
              }}
            >
              {dur}
            </button>
          );
        })}
      </div>

      {/* 自定义微调控制器：+/- 步进与直接数字编辑 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(215, 235, 220, 0.45)',
          borderRadius: '12px',
          padding: '5px 8px',
          border: '1px solid rgba(160, 185, 170, 0.35)',
        }}
      >
        <span style={{ fontSize: '11px', color: '#527760', fontWeight: 600 }}>
          自定义微调:
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* -5 快捷微调 */}
          {stepPresets.includes(5) && (
            <button
              type="button"
              onClick={() => handleStep(-5)}
              disabled={value <= min}
              style={{
                padding: '3px 6px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#EDF5EE',
                color: '#446652',
                fontSize: '10px',
                fontWeight: 700,
                cursor: value <= min ? 'not-allowed' : 'pointer',
                opacity: value <= min ? 0.4 : 1,
                boxShadow: '1px 1px 3px rgba(160, 185, 170, 0.4)',
              }}
              title="减 5 分钟"
            >
              -5
            </button>
          )}

          {/* -1 微调按键 */}
          <button
            type="button"
            onClick={() => handleStep(-1)}
            disabled={value <= min}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '7px',
              border: 'none',
              backgroundColor: '#EDF5EE',
              color: '#345E44',
              fontSize: '14px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: value <= min ? 'not-allowed' : 'pointer',
              opacity: value <= min ? 0.4 : 1,
              boxShadow: '1px 1px 3px rgba(160, 185, 170, 0.4)',
            }}
          >
            -
          </button>

          {/* 数字直接输入框 */}
          <input
            type="number"
            min={min}
            max={max}
            value={value}
            onChange={handleInputChange}
            style={{
              width: '44px',
              height: '24px',
              borderRadius: '8px',
              border: '1px solid rgba(160, 185, 170, 0.5)',
              backgroundColor: '#FFFFFF',
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: 700,
              color: '#1E3D2A',
              outline: 'none',
              boxShadow: 'inset 1px 1px 3px rgba(160, 185, 170, 0.4)',
            }}
          />

          <span style={{ fontSize: '10px', color: '#557962', fontWeight: 600 }}>分</span>

          {/* +1 微调按键 */}
          <button
            type="button"
            onClick={() => handleStep(1)}
            disabled={value >= max}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '7px',
              border: 'none',
              backgroundColor: '#EDF5EE',
              color: '#345E44',
              fontSize: '14px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: value >= max ? 'not-allowed' : 'pointer',
              opacity: value >= max ? 0.4 : 1,
              boxShadow: '1px 1px 3px rgba(160, 185, 170, 0.4)',
            }}
          >
            +
          </button>

          {/* +5 快捷微调 */}
          {stepPresets.includes(5) && (
            <button
              type="button"
              onClick={() => handleStep(5)}
              disabled={value >= max}
              style={{
                padding: '3px 6px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#EDF5EE',
                color: '#446652',
                fontSize: '10px',
                fontWeight: 700,
                cursor: value >= max ? 'not-allowed' : 'pointer',
                opacity: value >= max ? 0.4 : 1,
                boxShadow: '1px 1px 3px rgba(160, 185, 170, 0.4)',
              }}
              title="加 5 分钟"
            >
              +5
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
