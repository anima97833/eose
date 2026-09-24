import React, { useState, useRef } from 'react';
import { ArrowLeft, Check, Trash2, Camera, Upload } from 'lucide-react';
import { CharacterProfile } from '../../../types/character';

interface CharacterEditorProps {
  initialCharacter?: CharacterProfile | null;
  onSave: (character: CharacterProfile) => void;
  onDelete?: (id: string) => void;
  onBack: () => void;
}

export const CharacterEditor: React.FC<CharacterEditorProps> = ({
  initialCharacter,
  onSave,
  onDelete,
  onBack,
}) => {
  const isEditing = Boolean(initialCharacter);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState<string>(initialCharacter?.name || '');
  const [avatar, setAvatar] = useState<string>(initialCharacter?.avatar || '');
  const [title, setTitle] = useState<string>(initialCharacter?.title || '');
  const [persona, setPersona] = useState<string>(initialCharacter?.persona || '');
  const [tone, setTone] = useState<string>(initialCharacter?.tone || '');
  const [wakeTime, setWakeTime] = useState<string>(initialCharacter?.wakeTime || '08:00');
  const [sleepTime, setSleepTime] = useState<string>(initialCharacter?.sleepTime || '23:30');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择有效的图片文件！');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setAvatar(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('请填写角色姓名');
      return;
    }

    const savedChar: CharacterProfile = {
      id: initialCharacter?.id || `char_${Date.now()}`,
      name: name.trim(),
      avatar: avatar.trim(),
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
        {/* 自定义头像上传区 (移除预设头像，允许用户自主上传保存到 IndexedDB) */}
        <div
          className="nm-card-sm"
          style={{
            padding: '16px 14px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="nm-card"
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              cursor: 'pointer',
              position: 'relative',
              boxShadow: 'inset 2px 2px 5px rgba(166, 180, 200, 0.4), inset -2px -2px 5px rgba(255, 255, 255, 0.9)',
              border: '2px solid rgba(255, 255, 255, 0.8)',
            }}
            title="点击上传自定义头像"
          >
            {avatar ? (
              <>
                <img
                  src={avatar}
                  alt="角色头像"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                >
                  <Camera size={20} color="#ffffff" />
                  <span style={{ fontSize: '10px', color: '#ffffff', marginTop: '2px' }}>更换</span>
                </div>
              </>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--nm-text-sub)',
                  gap: '4px',
                }}
              >
                <Camera size={26} strokeWidth={1.8} />
                <span style={{ fontSize: '10px', fontWeight: 600 }}>上传头像</span>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="nm-rebound-btn"
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--nm-primary)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '8px',
              }}
            >
              <Upload size={13} />
              <span>{avatar ? '更换自定义头像' : '选取本地相片作为头像'}</span>
            </button>
            <div style={{ fontSize: '10px', color: 'var(--nm-text-sub)', marginTop: '2px' }}>
              头像将直接安全保存于本机的 IndexedDB 数据库中
            </div>
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
