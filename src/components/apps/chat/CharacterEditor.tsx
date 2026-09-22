import React, { useState } from 'react';
import { ArrowLeft, Check, Trash2 } from 'lucide-react';
import { CharacterProfile } from '../../../types/character';

interface CharacterEditorProps {
  initialCharacter?: CharacterProfile | null;
  onSave: (character: CharacterProfile) => void;
  onDelete?: (id: string) => void;
  onBack: () => void;
}

const AVATAR_OPTIONS = ['🌸', '☕', '🐱', '🌙', '🎨', '🌿', '🦊', '⚡', '🧸', '✨'];

export const CharacterEditor: React.FC<CharacterEditorProps> = ({
  initialCharacter,
  onSave,
  onDelete,
  onBack,
}) => {
  const isEditing = Boolean(initialCharacter);

  const [name, setName] = useState<string>(initialCharacter?.name || '');
  const [avatar, setAvatar] = useState<string>(initialCharacter?.avatar || '🌸');
  const [title, setTitle] = useState<string>(initialCharacter?.title || '');
  const [persona, setPersona] = useState<string>(initialCharacter?.persona || '');
  const [tone, setTone] = useState<string>(initialCharacter?.tone || '');
  const [wakeTime, setWakeTime] = useState<string>(initialCharacter?.wakeTime || '08:00');
  const [sleepTime, setSleepTime] = useState<string>(initialCharacter?.sleepTime || '23:30');

  const handleSave = () => {
    if (!name.trim()) {
      alert('请填写角色姓名');
      return;
    }

    const savedChar: CharacterProfile = {
      id: initialCharacter?.id || `char_${Date.now()}`,
      name: name.trim(),
      avatar,
      title: title.trim(),
      persona: persona.trim(),
      tone: tone.trim(),
      wakeTime,
      sleepTime,
      status: initialCharacter?.status || '在线',
    };

    onSave(savedChar);
  };

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--nm-bg)',
        overflow: 'hidden',
      }}
    >
      {/* 顶部标题导航 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px 8px',
          borderBottom: '1px solid rgba(166, 180, 200, 0.25)',
        }}
      >
        <button
          type="button"
          onClick={onBack}
          className="nm-rebound-btn nm-btn-circle"
          style={{ width: '38px', height: '38px' }}
          title="返回"
        >
          <ArrowLeft size={18} strokeWidth={2.3} />
        </button>

        <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--nm-text-main)', margin: 0 }}>
          {isEditing ? '编辑角色人设卡' : '新建角色人设卡'}
        </h2>

        <button
          type="button"
          onClick={handleSave}
          className="nm-rebound-btn nm-btn-circle"
          style={{ width: '38px', height: '38px', color: 'var(--nm-primary)' }}
          title="保存人设"
        >
          <Check size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* 表单内容区 */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
        className="no-scrollbar"
      >
        {/* 头像选择 */}
        <div
          className="nm-card-sm"
          style={{
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {/* 当前大头像环 */}
          <div
            className="nm-card"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
            }}
          >
            {avatar}
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '4px',
            }}
          >
            {AVATAR_OPTIONS.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => setAvatar(av)}
                className={`nm-rebound-btn nm-btn-circle ${avatar === av ? 'active' : ''}`}
                style={{
                  width: '32px',
                  height: '32px',
                  fontSize: '15px',
                }}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* 基础身份 */}
        <div
          className="nm-card-sm"
          style={{
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--nm-text-sub)' }}>
              角色姓名 *
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="nm-input"
              placeholder="例如: 云梦"
              style={{ marginTop: '4px', fontSize: '12px', padding: '8px 12px' }}
            />
          </div>

          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--nm-text-sub)' }}>
              身份称谓 / 一句话标签
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="nm-input"
              placeholder="例如: 青梅竹马 · 治愈系"
              style={{ marginTop: '4px', fontSize: '12px', padding: '8px 12px' }}
            />
          </div>
        </div>

        {/* 核心人设设定 (System Prompt) */}
        <div
          className="nm-card-sm"
          style={{
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--nm-text-sub)' }}>
            核心人设详细设定 (注入大模型 Prompt) *
          </span>
          <textarea
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            className="nm-input"
            rows={5}
            placeholder="写下你对角色的性格定义、背景身世、与你的专属关系等（大模型将严格遵循该设定进行陪伴回复）..."
            style={{
              fontSize: '11px',
              padding: '10px 12px',
              resize: 'none',
              lineHeight: 1.5,
            }}
          />
        </div>

        {/* 说话风格与口癖 */}
        <div
          className="nm-card-sm"
          style={{
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--nm-text-sub)' }}>
            说话语气风格 / 口癖
          </span>
          <input
            type="text"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="nm-input"
            placeholder="例如: 语气轻快、温柔、偶尔调皮撒娇"
            style={{ fontSize: '11px', padding: '8px 12px' }}
          />
        </div>

        {/* 作息时间设定 */}
        <div
          className="nm-card-sm"
          style={{
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--nm-text-sub)' }}>
            日常作息规律
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--nm-text-muted)', fontWeight: 600 }}>
                早晨清醒
              </span>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="nm-input"
                style={{ marginTop: '4px', fontSize: '12px', padding: '6px 10px' }}
              />
            </div>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--nm-text-muted)', fontWeight: 600 }}>
                深夜入睡
              </span>
              <input
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                className="nm-input"
                style={{ marginTop: '4px', fontSize: '12px', padding: '6px 10px' }}
              />
            </div>
          </div>
        </div>

        {/* 删除角色按钮 */}
        {isEditing && onDelete && initialCharacter && (
          <button
            type="button"
            onClick={() => {
              if (confirm(`确定删除角色【${initialCharacter.name}】吗？相关聊天记录也会被移除。`)) {
                onDelete(initialCharacter.id);
              }
            }}
            className="nm-rebound-btn nm-card-sm"
            style={{
              padding: '10px',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--nm-accent-red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Trash2 size={15} />
            删除该角色
          </button>
        )}
      </div>
    </div>
  );
};
