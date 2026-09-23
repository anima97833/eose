import React, { useState } from 'react';
import { X, Camera, Sparkles, MapPin, Calendar, Clock, Users } from 'lucide-react';
import { CheckInSpot, SpotCategory, SPOT_CATEGORIES } from '../../../../core/compass/types';
import { checkInAtLocation } from '../../../../core/compass/compassStorage';

interface CheckInModalProps {
  lat: number;
  lng: number;
  altitude?: number;
  initialSpot?: CheckInSpot | null;
  onClose: () => void;
  onSuccess: (result: { spotName: string; isNew: boolean }) => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  lat,
  lng,
  altitude,
  initialSpot,
  onClose,
  onSuccess,
}) => {
  const now = new Date();
  const defaultDate = now.toISOString().slice(0, 10);
  const defaultTime = now.toTimeString().slice(0, 5);

  const [name, setName] = useState<string>(initialSpot ? initialSpot.name : '');
  const [category, setCategory] = useState<SpotCategory>(initialSpot ? initialSpot.category : 'cafe');
  const [customDate, setCustomDate] = useState<string>(defaultDate);
  const [customTime, setCustomTime] = useState<string>(defaultTime);
  const [companions, setCompanions] = useState<string>(initialSpot?.companions || '独自漫步');
  const [note, setNote] = useState<string>(initialSpot?.note || '');
  const [photos, setPhotos] = useState<string[]>(initialSpot?.photos ? [...initialSpot.photos] : []);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 处理图片选择
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const b64 = loadEvt.target?.result as string;
      if (b64) setPhotos((prev) => [...prev, b64].slice(0, 3));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const finalName = name.trim() || `${SPOT_CATEGORIES[category].name} · ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;

    const { isNew } = checkInAtLocation({
      name: finalName,
      category,
      lat,
      lng,
      altitude,
      note: note.trim(),
      photos,
      customDate: customDate.trim() || defaultDate,
      customTime: customTime.trim() || defaultTime,
      companions: companions.trim() || '独自漫步',
    });

    onSuccess({
      spotName: finalName,
      isNew,
    });
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(5px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0 0 12px',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '92%',
          maxHeight: '85%',
          overflowY: 'auto',
          backgroundColor: '#ebf1f8',
          borderRadius: '24px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25), inset 1px 1px 2px #ffffff',
          padding: '18px 16px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          animation: 'slideUpModal 0.25s ease-out',
        }}
      >
        <style>{`
          @keyframes slideUpModal {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>

        {/* 标题栏 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#5096C6',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '2px 2px 6px rgba(80, 150, 198, 0.4)',
              }}
            >
              <MapPin size={16} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#1a202c' }}>
                户外探索打卡
              </div>
              <div style={{ fontSize: '11px', color: '#718096' }}>
                经纬度：{lat.toFixed(4)}, {lng.toFixed(4)}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: 'none',
              background: '#e0e7f1',
              boxShadow: '2px 2px 5px rgba(166, 180, 200, 0.6), -2px -2px 5px #ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#718096',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* 地点名称输入 */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#4a5568', marginBottom: '4px', display: 'block' }}>
              地点名称 / 秘密坐标昵称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：街角那家猫咖、晨跑的湖畔步道"
              maxLength={24}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '12px',
                border: 'none',
                background: '#e2ebf5',
                boxShadow: 'inset 2px 2px 5px rgba(166, 180, 200, 0.6), inset -2px -2px 5px #ffffff',
                fontSize: '13px',
                color: '#2d3748',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 分类标签选择 */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#4a5568', marginBottom: '6px', display: 'block' }}>
              地点类型
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {(Object.keys(SPOT_CATEGORIES) as SpotCategory[]).map((catKey) => {
                const item = SPOT_CATEGORIES[catKey];
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    style={{
                      padding: '6px 4px',
                      borderRadius: '12px',
                      border: isSelected ? `1.5px solid ${item.color}` : '1.5px solid transparent',
                      background: isSelected ? item.bgLight : '#e6edf6',
                      boxShadow: isSelected
                        ? 'inset 2px 2px 4px rgba(166, 180, 200, 0.5)'
                        : '2px 2px 5px rgba(166, 180, 200, 0.5), -2px -2px 5px #ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>{item.icon}</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: isSelected ? item.color : '#4a5568' }}>
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 打卡日期与时刻 */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#4a5568', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={13} color="#5096C6" />
              <span>打卡日期与时刻</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
              {/* 日期选择 */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#e2ebf5',
                    boxShadow: 'inset 2px 2px 5px rgba(166, 180, 200, 0.6), inset -2px -2px 5px #ffffff',
                    fontSize: '12px',
                    color: '#2d3748',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* 时间选择 */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#e2ebf5',
                    boxShadow: 'inset 2px 2px 5px rgba(166, 180, 200, 0.6), inset -2px -2px 5px #ffffff',
                    fontSize: '12px',
                    color: '#2d3748',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>
          </div>

          {/* 随行人员 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#4a5568', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users size={13} color="#5096C6" />
                <span>随行人员</span>
              </label>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>支持自由输入或快捷点选</span>
            </div>

            <input
              type="text"
              value={companions}
              onChange={(e) => setCompanions(e.target.value)}
              placeholder="例如：独自一人、和伴侣、三两好友"
              maxLength={20}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '12px',
                border: 'none',
                background: '#e2ebf5',
                boxShadow: 'inset 2px 2px 5px rgba(166, 180, 200, 0.6), inset -2px -2px 5px #ffffff',
                fontSize: '12px',
                color: '#2d3748',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            {/* 随行人员快捷气泡 */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
              {['🚶 独自一人', '💖 和伴侣', '👥 好友同行', '👨‍👩‍👧 家庭出游'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setCompanions(tag)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '10px',
                    border: 'none',
                    background: companions === tag ? '#e6f7ff' : '#e6edf6',
                    color: companions === tag ? '#096dd9' : '#5a6b82',
                    boxShadow: companions === tag
                      ? 'inset 1px 1px 3px rgba(9, 109, 217, 0.25)'
                      : '2px 2px 4px rgba(166, 180, 200, 0.4), -1px -1px 3px #ffffff',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 心情随笔 */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#4a5568', marginBottom: '4px', display: 'block' }}>
              手账心得 / 回忆备忘
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="写下此刻的天气、心情，或者和伴侣在此散步的微小碎碎念..."
              rows={2}
              maxLength={120}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '12px',
                border: 'none',
                background: '#e2ebf5',
                boxShadow: 'inset 2px 2px 5px rgba(166, 180, 200, 0.6), inset -2px -2px 5px #ffffff',
                fontSize: '12px',
                color: '#2d3748',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'none',
              }}
            />
          </div>

          {/* 现场拍照 / 图片上传 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  background: '#e6edf6',
                  boxShadow: '2px 2px 5px rgba(166, 180, 200, 0.5), -2px -2px 5px #ffffff',
                  fontSize: '11px',
                  color: '#4a5568',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Camera size={13} color="#5096C6" />
                <span>添加现场照片</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
              </label>

              {/* 缩略图预览 */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {photos.map((src, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: '1px 2px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    <img src={src} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: '4px',
              width: '100%',
              padding: '10px 0',
              borderRadius: '16px',
              border: 'none',
              background: 'linear-gradient(135deg, #5096C6, #36729e)',
              boxShadow: '3px 4px 10px rgba(80, 150, 198, 0.5), -2px -2px 6px #ffffff',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'transform 0.1s ease',
            }}
          >
            <Sparkles size={16} />
            <span>完成打卡 · 点亮此街区</span>
          </button>
        </form>
      </div>
    </div>
  );
};
