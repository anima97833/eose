import React, { useState } from 'react';
import { Heart, MapPin, Smile, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { CharacterHudConfig, CharacterTheme } from '../../../types/character';

interface CharacterHudWidgetProps {
  charName: string;
  hudConfig?: CharacterHudConfig;
  theme?: CharacterTheme;
  variables?: Record<string, any>;
}

export const CharacterHudWidget: React.FC<CharacterHudWidgetProps> = ({
  charName,
  hudConfig,
  theme,
  variables = {}
}) => {
  const [collapsed, setCollapsed] = useState(false);

  // If HUD is not enabled or not defined, render nothing
  if (!hudConfig?.enabled) {
    return null;
  }

  // Extract variables with intelligent fallbacks
  const affection = typeof variables.affection === 'number' ? variables.affection : 60;
  const mood = variables.mood || '开心';
  const moodIcon = variables.moodIcon || '🌸';
  const location = variables.location || '静谧一角';
  const customTitle = hudConfig.customTitle || `${charName} 的心境罗盘`;

  const accentColor = theme?.accentColor || '#E53E3E';

  // Compact Collapsed Pill
  if (collapsed) {
    return (
      <div
        onClick={() => setCollapsed(false)}
        style={{
          margin: '0 16px 8px 16px',
          padding: '6px 14px',
          borderRadius: '20px',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04), inset 0 1px 2px rgba(255,255,255,0.8)',
          border: '1px solid rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Heart size={14} color={accentColor} fill={accentColor} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#4A5568' }}>
            {customTitle} ({affection}%)
          </span>
          <span style={{ fontSize: '11px', color: '#718096' }}>· {moodIcon} {mood}</span>
        </div>
        <ChevronDown size={14} color="#A0AEC0" />
      </div>
    );
  }

  return (
    <div
      style={{
        margin: '0 16px 8px 16px',
        padding: '10px 14px',
        borderRadius: '16px',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 4px 14px rgba(0,0,0,0.04), inset 0 1px 2px rgba(255,255,255,0.8)',
        border: '1px solid rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '6px',
              backgroundColor: `${accentColor}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sparkles size={12} color={accentColor} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#2D3748' }}>
            {customTitle}
          </span>
        </div>
        <div
          onClick={() => setCollapsed(true)}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#A0AEC0' }}
        >
          <ChevronUp size={14} />
        </div>
      </div>

      {/* Affection Bar */}
      {hudConfig.showAffection !== false && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#718096', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Heart size={12} color={accentColor} fill={accentColor} /> 好感羁绊
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: accentColor }}>
              {affection} / 100
            </span>
          </div>
          {/* Neumorphic Inset Groove Bar */}
          <div
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '6px',
              backgroundColor: '#EDF2F7',
              boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.12), inset -1px -1px 3px rgba(255,255,255,0.9)',
              overflow: 'hidden',
              padding: '1px',
              boxSizing: 'border-box'
            }}
          >
            <div
              style={{
                width: `${Math.min(100, Math.max(0, affection))}%`,
                height: '100%',
                borderRadius: '5px',
                background: `linear-gradient(90deg, ${accentColor}AA, ${accentColor})`,
                boxShadow: `0 0 6px ${accentColor}66`,
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>
      )}

      {/* Badges Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '2px' }}>
        {hudConfig.showMood !== false && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '8px',
              backgroundColor: '#F7FAFC',
              border: '1px solid #EDF2F7',
              fontSize: '11px',
              color: '#4A5568'
            }}
          >
            <span>{moodIcon}</span>
            <span>{mood}</span>
          </div>
        )}

        {hudConfig.showLocation !== false && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '8px',
              backgroundColor: '#F7FAFC',
              border: '1px solid #EDF2F7',
              fontSize: '11px',
              color: '#718096'
            }}
          >
            <MapPin size={11} color="#A0AEC0" />
            <span>{location}</span>
          </div>
        )}

        {variables.dress && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '8px',
              backgroundColor: '#F7FAFC',
              border: '1px solid #EDF2F7',
              fontSize: '11px',
              color: '#718096'
            }}
          >
            <span>👗 {variables.dress}</span>
          </div>
        )}
      </div>
    </div>
  );
};
