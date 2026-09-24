import React, { useState } from 'react';
import {
  X,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Flame,
  Thermometer,
  Ban,
  Target,
  Palette,
  RotateCcw,
  Trash2,
  Sliders,
} from 'lucide-react';
import { CharacterProfile } from '../../../types/character';

interface ChatPreferenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  character: CharacterProfile;
}

export const ChatPreferenceDrawer: React.FC<ChatPreferenceDrawerProps> = ({
  isOpen,
  onClose,
  character,
}) => {
  // ================= 严格参考图 2 ~ 图 5 的 UI 预留交互状态 =================
  // 图 2: 剧情模式
  const [onlineStoryMode, setOnlineStoryMode] = useState<boolean>(true);
  const [offlineStoryMode, setOfflineStoryMode] = useState<boolean>(false);

  // 图 3: 上下文记忆与高级参数
  const [contextItemsCount, setContextItemsCount] = useState<number>(15);
  const [isAdvancedParamsOpen, setIsAdvancedParamsOpen] = useState<boolean>(true);
  const [temperature, setTemperature] = useState<number>(0.8);
  const [presencePenalty, setPresencePenalty] = useState<number>(0.4);
  const [topP, setTopP] = useState<number>(0.95);

  // 图 4: 背景设置
  const [bgOpacity, setBgOpacity] = useState<number>(100);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        animation: 'fadeIn 0.25s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          maxHeight: '82vh',
          backgroundColor: '#faf8f5',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          boxShadow: '0 -12px 40px rgba(0,0,0,0.25)',
          borderTop: '1px solid rgba(255, 255, 255, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          color: '#334155',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部把手与标题栏 */}
        <div
          style={{
            padding: '12px 18px 8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
            position: 'relative',
          }}
        >
          {/* 顶部把手小横条 */}
          <div
            style={{
              width: '36px',
              height: '4px',
              borderRadius: '2px',
              backgroundColor: '#cbd5e1',
              marginBottom: '8px',
            }}
          />

          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>
                对话偏好与模型调优
              </span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                ({character.name})
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                border: 'none',
                backgroundColor: 'rgba(0,0,0,0.05)',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* 抽屉滚动内容主体 */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 18px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
          className="no-scrollbar"
        >
          {/* ================= 【模块一 (参考图2): 剧情模式切换】 ================= */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '14px 16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.9)',
              border: '1px solid #f1f5f9',
            }}
          >
            {/* 1.1 线上剧情模式 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                  线上剧情模式
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  模拟网络聊天，发表情包，用语网感化
                </div>
              </div>

              {/* iOS 轻拟物 Toggle 开关 */}
              <div
                onClick={() => setOnlineStoryMode(!onlineStoryMode)}
                style={{
                  width: '46px',
                  height: '26px',
                  borderRadius: '13px',
                  backgroundColor: onlineStoryMode ? '#34d399' : '#e2e8f0',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.25s ease',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    position: 'absolute',
                    top: '2px',
                    left: onlineStoryMode ? '22px' : '2px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    transition: 'left 0.25s ease',
                  }}
                />
              </div>
            </div>

            {/* 虚线分割线 */}
            <div
              style={{
                borderBottom: '1px dashed #e2e8f0',
                margin: '12px 0',
              }}
            />

            {/* 1.2 线下剧情模式 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                  线下剧情模式
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  模拟面对面互动，描写动作、神态、环境
                </div>
              </div>

              {/* iOS 轻拟物 Toggle 开关 */}
              <div
                onClick={() => setOfflineStoryMode(!offlineStoryMode)}
                style={{
                  width: '46px',
                  height: '26px',
                  borderRadius: '13px',
                  backgroundColor: offlineStoryMode ? '#34d399' : '#e2e8f0',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.25s ease',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    position: 'absolute',
                    top: '2px',
                    left: offlineStoryMode ? '22px' : '2px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    transition: 'left 0.25s ease',
                  }}
                />
              </div>
            </div>
          </div>

          {/* ================= 【模块二 (参考图3): 上下文记忆与高级参数】 ================= */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '14px 16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              border: '1px solid #f1f5f9',
            }}
          >
            {/* 上下文记忆条目 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                  上下文记忆条目
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  AI 读取的历史消息数量
                </div>
              </div>

              {/* 右侧数字输入框展示 */}
              <div
                style={{
                  width: '54px',
                  height: '32px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#334155',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
                }}
              >
                <input
                  type="number"
                  value={contextItemsCount}
                  onChange={(e) => setContextItemsCount(Number(e.target.value) || 15)}
                  style={{
                    width: '100%',
                    textAlign: 'center',
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontFamily: 'inherit',
                    fontWeight: 700,
                    color: '#334155',
                  }}
                />
              </div>
            </div>

            {/* 虚线分割线 */}
            <div style={{ borderBottom: '1px dashed #e2e8f0', margin: '14px 0 12px' }} />

            {/* 🔥 AI 语气与模型高级参数折叠标题栏 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#ea580c' }}>
                    🔥 AI 语气与模型高级参数
                  </span>
                  <HelpCircle size={14} color="#f97316" />
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  调节温度、防复读惩罚与词汇多样性
                </div>
              </div>

              {/* 展开/收起按钮 */}
              <button
                type="button"
                onClick={() => setIsAdvancedParamsOpen(!isAdvancedParamsOpen)}
                style={{
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  color: '#475569',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <span>{isAdvancedParamsOpen ? '收起' : '展开'}</span>
                {isAdvancedParamsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {/* 折叠区域内容 */}
            {isAdvancedParamsOpen && (
              <div
                style={{
                  marginTop: '14px',
                  padding: '14px',
                  backgroundColor: '#fffbeb',
                  borderRadius: '12px',
                  border: '1px solid #fef3c7',
                }}
              >
                {/* 语气旋钮调校子头 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sliders size={15} color="#d97706" />
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#92400e' }}>
                      语气旋钮调校
                    </span>
                  </div>

                  {/* 黄色胶囊徽章 */}
                  <div
                    style={{
                      backgroundColor: '#fef3c7',
                      border: '1px solid #fde68a',
                      borderRadius: '999px',
                      padding: '2px 8px',
                      fontSize: '10px',
                      color: '#b45309',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    <span>❓ 调参指南与衰基示例</span>
                  </div>
                </div>

                <div style={{ borderBottom: '1px dashed #fde68a', marginBottom: '12px' }} />

                {/* 1. 采样温度 */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#78350f' }}>
                      🌡️ 采样温度 (Temperature): {temperature}
                    </div>
                    <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>
                      鲜活自然(推荐)
                    </span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#92400e', margin: '3px 0 6px' }}>
                    数值越低越严谨理智，数值越高情绪越丰富、表达越生动奇趣。
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.5"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#f97316',
                      cursor: 'pointer',
                    }}
                  />
                </div>

                {/* 2. 防复读惩罚 */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#78350f' }}>
                      🚫 防复读惩罚 (Presence Penalty): {presencePenalty}
                    </div>
                    <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>
                      杜绝车轱辘话(推荐)
                    </span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#92400e', margin: '3px 0 6px' }}>
                    提高该值会强烈抑制角色重复已说过的句式、口癖或称呼。
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.05"
                    value={presencePenalty}
                    onChange={(e) => setPresencePenalty(parseFloat(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#f97316',
                      cursor: 'pointer',
                    }}
                  />
                </div>

                {/* 3. 词汇多样性 */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#78350f' }}>
                      🎯 词汇多样性 (Top P): {topP}
                    </div>
                    <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>
                      词汇丰富(推荐)
                    </span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#92400e', margin: '3px 0 6px' }}>
                    核采样概率阈值，决定候选词汇库的宽广度。
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={topP}
                    onChange={(e) => setTopP(parseFloat(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#f97316',
                      cursor: 'pointer',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ================= 【模块三 (参考图4): 背景设置】 ================= */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '14px 16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              border: '1px solid #f1f5f9',
            }}
          >
            {/* 背景设置 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                  背景设置
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  更换聊天页面背景，支持图片和颜色
                </div>
              </div>

              {/* 按钮组 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => alert('【UI预留】更换背景功能将在后续版本接入')}
                  style={{
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fde68a',
                    color: '#92400e',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  更换背景
                </button>
                <button
                  type="button"
                  onClick={() => alert('【UI预留】已恢复默认背景')}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    color: '#64748b',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  恢复默认
                </button>
              </div>
            </div>

            {/* 虚线分割线 */}
            <div style={{ borderBottom: '1px dashed #e2e8f0', margin: '14px 0 12px' }} />

            {/* 背景透明度 */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                  背景透明度
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#475569' }}>
                  {bgOpacity}%
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 8px' }}>
                调节背景图片的透明度
              </div>

              {/* 草绿色轻拟物滑块 */}
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={bgOpacity}
                onChange={(e) => setBgOpacity(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#65a30d', // 草绿色
                  cursor: 'pointer',
                }}
              />
            </div>
          </div>

          {/* ================= 【模块四 (参考图5): 清空聊天记录危险区】 ================= */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '14px 16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              border: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#c2410c' }}>
                清空聊天记录
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                清空与该名士的所有历史对话记录（不可恢复）
              </div>
            </div>

            {/* 珊瑚红/砖橙色拟物按钮 */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`【UI预留提示】确定要清空与【${character.name}】的全部历史记录吗？`)) {
                  alert('【UI预留提示】已触发清空模拟交互');
                }
              }}
              style={{
                backgroundColor: '#ea580c',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '7px 18px',
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '1px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(234, 88, 12, 0.4)',
              }}
            >
              清空
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
