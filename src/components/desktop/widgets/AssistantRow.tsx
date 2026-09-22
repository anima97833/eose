import React from 'react';
import { Sparkles, Mic } from 'lucide-react';

interface AssistantRowProps {
  onVoiceClick?: () => void;
  onSparkClick?: () => void;
}

export const AssistantRow: React.FC<AssistantRowProps> = ({ onVoiceClick, onSparkClick }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: '2px 0',
      }}
    >
      {/* 纯图标：AI 灵感/火花（带物理回弹） */}
      <button
        type="button"
        onClick={onSparkClick}
        className="nm-rebound-btn nm-btn-circle"
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          color: '#5096C6',
          boxShadow: '3px 3px 7px rgba(166, 180, 200, 0.5), -3px -3px 7px rgba(255, 255, 255, 0.95)',
        }}
        title="AI 灵感"
      >
        <Sparkles size={18} strokeWidth={2.2} />
      </button>

      {/* 纯图标：实时语音通话/麦克风（带物理回弹） */}
      <button
        type="button"
        onClick={onVoiceClick}
        className="nm-rebound-btn nm-btn-circle"
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          color: '#52647A',
          boxShadow: '3px 3px 7px rgba(166, 180, 200, 0.5), -3px -3px 7px rgba(255, 255, 255, 0.95)',
        }}
        title="语音连麦"
      >
        <Mic size={18} strokeWidth={2.2} />
      </button>
    </div>
  );
};
