import React, { useState } from 'react';
import {
  X,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Sliders,
  Minus,
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { CharacterProfile } from '../../../types/character';
import { CharacterAvatar } from './CharacterAvatar';

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
        backgroundColor: 'rgba(25, 33, 44, 0.42)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        animation: 'nmFadeIn 0.22s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          maxHeight: '84vh',
          backgroundColor: 'var(--nm-bg, #E9EEF5)',
          borderTopLeftRadius: '26px',
          borderTopRightRadius: '26px',
          boxShadow: '0 -10px 30px var(--nm-shadow), inset 0 1.5px 0 var(--nm-light)',
          borderTop: '1.5px solid rgba(255, 255, 255, 0.85)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'nmSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          color: 'var(--nm-text-main, #334257)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部把手与标题栏 */}
        <div
          style={{
            padding: '12px 18px 10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderBottom: '1px solid rgba(166, 180, 200, 0.25)',
            position: 'relative',
          }}
        >
          {/* 顶部把手内凹槽 */}
          <div
            style={{
              width: '40px',
              height: '5px',
              borderRadius: '3px',
              backgroundColor: 'var(--nm-bg-darker, #DFE5EF)',
              boxShadow: 'var(--nm-inset-xs)',
              marginBottom: '10px',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CharacterAvatar
                avatar={character.avatar}
                name={character.name}
                size={28}
                style={{
                  boxShadow: 'var(--nm-convex-xs)',
                  border: '1px solid rgba(255, 255, 255, 0.85)',
                }}
              />
              <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--nm-text-main)' }}>
                对话偏好与模型调优
              </span>
              <span style={{ fontSize: '11px', color: 'var(--nm-text-sub)', fontWeight: 600 }}>
                ({character.name})
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="nm-rebound-btn nm-btn-circle"
              style={{
                width: '30px',
                height: '30px',
                color: 'var(--nm-text-sub)',
                boxShadow: 'var(--nm-convex-xs)',
              }}
              title="关闭"
            >
              <X size={16} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* 抽屉滚动内容主体 */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 18px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
          className="no-scrollbar"
        >
          {/* ================= 【模块一 (参考图2): 剧情模式切换】 ================= */}
          <div
            className="nm-card-sm"
            style={{
              padding: '14px 16px',
              backgroundColor: 'var(--nm-bg)',
              boxShadow: 'var(--nm-convex-sm)',
              borderRadius: '18px',
              border: '1px solid rgba(255, 255, 255, 0.7)',
            }}
          >
            {/* 1.1 线上剧情模式 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--nm-text-main)' }}>
                  线上剧情模式
                </div>
                <div style={{ fontSize: '11px', color: 'var(--nm-text-sub)', marginTop: '2px' }}>
                  模拟即时通讯网络聊天，网感化用语与日常互动
                </div>
              </div>

              {/* 轻拟物深度内雕凹槽 Toggle 开关 */}
              <div
                onClick={() => setOnlineStoryMode(!onlineStoryMode)}
                style={{
                  width: '50px',
                  height: '28px',
                  borderRadius: '14px',
                  backgroundColor: onlineStoryMode ? 'var(--nm-accent-green, #38D39F)' : 'var(--nm-bg-darker)',
                  boxShadow: onlineStoryMode
                    ? 'inset 2px 2px 4px rgba(0, 100, 60, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.4)'
                    : 'inset 2px 2px 5px rgba(166, 180, 200, 0.65), inset -2px -2px 5px rgba(255, 255, 255, 0.95)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.25s ease, box-shadow 0.25s ease',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--nm-bg)',
                    position: 'absolute',
                    top: '3px',
                    left: onlineStoryMode ? '25px' : '3px',
                    boxShadow: '2px 2px 5px rgba(166, 180, 200, 0.55), -2px -2px 5px rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.7)',
                    transition: 'left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                />
              </div>
            </div>

            {/* 轻拟物凹槽分割线 */}
            <div
              style={{
                height: '1px',
                backgroundColor: 'rgba(166, 180, 200, 0.2)',
                boxShadow: '0 1px 0 rgba(255, 255, 255, 0.7)',
                margin: '12px 0',
              }}
            />

            {/* 1.2 线下剧情模式 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--nm-text-main)' }}>
                  线下剧情模式
                </div>
                <div style={{ fontSize: '11px', color: 'var(--nm-text-sub)', marginTop: '2px' }}>
                  模拟面对面同场互动，描写动作、神态与环境气氛
                </div>
              </div>

              {/* 轻拟物深度内雕凹槽 Toggle 开关 */}
              <div
                onClick={() => setOfflineStoryMode(!offlineStoryMode)}
                style={{
                  width: '50px',
                  height: '28px',
                  borderRadius: '14px',
                  backgroundColor: offlineStoryMode ? 'var(--nm-accent-green, #38D39F)' : 'var(--nm-bg-darker)',
                  boxShadow: offlineStoryMode
                    ? 'inset 2px 2px 4px rgba(0, 100, 60, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.4)'
                    : 'inset 2px 2px 5px rgba(166, 180, 200, 0.65), inset -2px -2px 5px rgba(255, 255, 255, 0.95)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.25s ease, box-shadow 0.25s ease',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--nm-bg)',
                    position: 'absolute',
                    top: '3px',
                    left: offlineStoryMode ? '25px' : '3px',
                    boxShadow: '2px 2px 5px rgba(166, 180, 200, 0.55), -2px -2px 5px rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.7)',
                    transition: 'left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* ================= 【模块二 (参考图3): 上下文记忆与高级参数】 ================= */}
          <div
            className="nm-card-sm"
            style={{
              padding: '14px 16px',
              backgroundColor: 'var(--nm-bg)',
              boxShadow: 'var(--nm-convex-sm)',
              borderRadius: '18px',
              border: '1px solid rgba(255, 255, 255, 0.7)',
            }}
          >
            {/* 上下文记忆条目数 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--nm-text-main)' }}>
                  上下文记忆条目
                </div>
                <div style={{ fontSize: '11px', color: 'var(--nm-text-sub)', marginTop: '2px' }}>
                  AI 对话推理时抓取的历史消息数量
                </div>
              </div>

              {/* 轻拟物步进器：内凹显示框 + 两侧外凸实体按键 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => setContextItemsCount((prev) => Math.max(1, prev - 1))}
                  className="nm-rebound-btn nm-btn-circle"
                  style={{
                    width: '28px',
                    height: '28px',
                    boxShadow: 'var(--nm-convex-xs)',
                    color: 'var(--nm-text-main)',
                  }}
                  title="减少条目"
                >
                  <Minus size={13} strokeWidth={2.5} />
                </button>

                <div
                  style={{
                    width: '46px',
                    height: '28px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--nm-bg-darker)',
                    boxShadow: 'var(--nm-inset-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(166, 180, 200, 0.2)',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--nm-primary)' }}>
                    {contextItemsCount}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setContextItemsCount((prev) => Math.min(50, prev + 1))}
                  className="nm-rebound-btn nm-btn-circle"
                  style={{
                    width: '28px',
                    height: '28px',
                    boxShadow: 'var(--nm-convex-xs)',
                    color: 'var(--nm-text-main)',
                  }}
                  title="增加条目"
                >
                  <Plus size={13} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* 轻拟物分割线 */}
            <div
              style={{
                height: '1px',
                backgroundColor: 'rgba(166, 180, 200, 0.2)',
                boxShadow: '0 1px 0 rgba(255, 255, 255, 0.7)',
                margin: '14px 0 12px',
              }}
            />

            {/* 🔥 AI 语气与模型高级参数折叠标题栏 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--nm-accent-orange)' }}>
                    🔥 AI 语气与模型高级参数
                  </span>
                  <HelpCircle size={14} color="var(--nm-accent-orange)" />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--nm-text-sub)', marginTop: '2px' }}>
                  精细调节采样温度、防复读惩罚与词汇多样性
                </div>
              </div>

              {/* 展开/收起按钮 */}
              <button
                type="button"
                onClick={() => setIsAdvancedParamsOpen(!isAdvancedParamsOpen)}
                className="nm-rebound-btn"
                style={{
                  borderRadius: '10px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  boxShadow: 'var(--nm-convex-xs)',
                  color: isAdvancedParamsOpen ? 'var(--nm-primary)' : 'var(--nm-text-sub)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <span>{isAdvancedParamsOpen ? '收起' : '展开'}</span>
                {isAdvancedParamsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>

            {/* 折叠区域内容：机械控制台内凹底座 */}
            {isAdvancedParamsOpen && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '14px',
                  backgroundColor: 'var(--nm-bg-darker)',
                  borderRadius: '14px',
                  boxShadow: 'var(--nm-inset-sm)',
                  border: '1px solid rgba(166, 180, 200, 0.3)',
                }}
              >
                {/* 语气旋钮控制台标头 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Sliders size={14} color="var(--nm-accent-orange)" />
                    <span style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--nm-text-main)' }}>
                      语气旋钮调校台
                    </span>
                  </div>

                  {/* 拟物小胶囊徽章 */}
                  <div
                    style={{
                      backgroundColor: 'var(--nm-bg)',
                      boxShadow: 'var(--nm-convex-xs)',
                      borderRadius: '999px',
                      padding: '2px 8px',
                      fontSize: '10px',
                      color: 'var(--nm-text-sub)',
                      fontWeight: 700,
                    }}
                  >
                    推荐参数已配平
                  </div>
                </div>

                <div
                  style={{
                    height: '1px',
                    backgroundColor: 'rgba(166, 180, 200, 0.25)',
                    boxShadow: '0 1px 0 rgba(255, 255, 255, 0.6)',
                    marginBottom: '12px',
                  }}
                />

                {/* 1. 采样温度 */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--nm-text-main)' }}>
                      🌡️ 采样温度 (Temperature): <span style={{ color: 'var(--nm-primary)' }}>{temperature}</span>
                    </div>
                    <span style={{ fontSize: '10.5px', color: 'var(--nm-accent-green)', fontWeight: 700 }}>
                      鲜活生动
                    </span>
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--nm-text-sub)', margin: '2px 0 6px' }}>
                    越低越严谨理智，越高情绪越丰富生动。
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.5"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="nm-range-slider"
                  />
                </div>

                {/* 2. 防复读惩罚 */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--nm-text-main)' }}>
                      🚫 防复读惩罚 (Presence Penalty): <span style={{ color: 'var(--nm-primary)' }}>{presencePenalty}</span>
                    </div>
                    <span style={{ fontSize: '10.5px', color: 'var(--nm-accent-green)', fontWeight: 700 }}>
                      杜绝循环
                    </span>
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--nm-text-sub)', margin: '2px 0 6px' }}>
                    提高该值会抑制 AI 重复已说过的话式或口癖。
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.05"
                    value={presencePenalty}
                    onChange={(e) => setPresencePenalty(parseFloat(e.target.value))}
                    className="nm-range-slider"
                  />
                </div>

                {/* 3. 词汇多样性 */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--nm-text-main)' }}>
                      🎯 词汇多样性 (Top P): <span style={{ color: 'var(--nm-primary)' }}>{topP}</span>
                    </div>
                    <span style={{ fontSize: '10.5px', color: 'var(--nm-accent-green)', fontWeight: 700 }}>
                      词库广阔
                    </span>
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--nm-text-sub)', margin: '2px 0 6px' }}>
                    核采样概率阈值，决定可选词汇的丰富程度。
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={topP}
                    onChange={(e) => setTopP(parseFloat(e.target.value))}
                    className="nm-range-slider"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ================= 【模块三 (参考图4): 背景设置】 ================= */}
          <div
            className="nm-card-sm"
            style={{
              padding: '14px 16px',
              backgroundColor: 'var(--nm-bg)',
              boxShadow: 'var(--nm-convex-sm)',
              borderRadius: '18px',
              border: '1px solid rgba(255, 255, 255, 0.7)',
            }}
          >
            {/* 背景设置 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--nm-text-main)' }}>
                  背景设置
                </div>
                <div style={{ fontSize: '11px', color: 'var(--nm-text-sub)', marginTop: '2px' }}>
                  自定义聊天界面底纹与拟物色调
                </div>
              </div>

              {/* 轻拟物浮雕按键组 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => alert('【UI预留】更换背景功能将在后续版本接入')}
                  className="nm-rebound-btn"
                  style={{
                    padding: '5px 12px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--nm-primary)',
                    boxShadow: 'var(--nm-convex-xs)',
                  }}
                >
                  更换背景
                </button>
                <button
                  type="button"
                  onClick={() => alert('【UI预留】已恢复默认背景')}
                  className="nm-rebound-btn"
                  style={{
                    padding: '5px 12px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--nm-text-sub)',
                    boxShadow: 'var(--nm-convex-xs)',
                  }}
                >
                  恢复默认
                </button>
              </div>
            </div>

            {/* 轻拟物分割线 */}
            <div
              style={{
                height: '1px',
                backgroundColor: 'rgba(166, 180, 200, 0.2)',
                boxShadow: '0 1px 0 rgba(255, 255, 255, 0.7)',
                margin: '14px 0 12px',
              }}
            />

            {/* 背景透明度 */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--nm-text-main)' }}>
                  背景透明度
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--nm-primary)' }}>
                  {bgOpacity}%
                </div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--nm-text-sub)', margin: '2px 0 8px' }}>
                调节背景图层的透光与漫反射强度
              </div>

              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={bgOpacity}
                onChange={(e) => setBgOpacity(Number(e.target.value))}
                className="nm-range-slider"
              />
            </div>
          </div>

          {/* ================= 【模块四 (参考图5): 清空聊天记录危险区】 ================= */}
          <div
            className="nm-card-sm"
            style={{
              padding: '14px 16px',
              backgroundColor: 'var(--nm-bg)',
              boxShadow: 'var(--nm-convex-sm)',
              borderRadius: '18px',
              border: '1px solid rgba(255, 94, 126, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--nm-accent-red)' }}>
                清空聊天记录
              </div>
              <div style={{ fontSize: '11px', color: 'var(--nm-text-sub)', marginTop: '2px' }}>
                清空与该角色的所有历史对话（本地数据）
              </div>
            </div>

            {/* 实体轻拟物危险按键 */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`【UI预留提示】确定要清空与【${character.name}】的全部历史记录吗？`)) {
                  alert('【UI预留提示】已触发清空模拟交互');
                }
              }}
              className="nm-rebound-btn"
              style={{
                backgroundColor: 'var(--nm-bg)',
                color: 'var(--nm-accent-red)',
                borderRadius: '10px',
                padding: '7px 16px',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.5px',
                boxShadow: '3px 3px 8px rgba(255, 94, 126, 0.28), -3px -3px 8px rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(255, 94, 126, 0.25)',
              }}
            >
              清空
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes nmFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes nmSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        /* 纯轻拟物定制凹槽滑轨与悬浮滑钮 */
        .nm-range-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: var(--nm-bg-darker, #DFE5EF);
          box-shadow: inset 1.5px 2px 4px rgba(166, 180, 200, 0.7), inset -1.5px -2px 4px rgba(255, 255, 255, 0.9);
          outline: none;
          margin: 6px 0;
          cursor: pointer;
        }

        .nm-range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--nm-bg, #E9EEF5);
          box-shadow: 2px 2px 5px rgba(166, 180, 200, 0.65), -2px -2px 5px rgba(255, 255, 255, 0.95);
          border: 1.5px solid rgba(255, 255, 255, 0.85);
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .nm-range-slider::-webkit-slider-thumb:hover {
          transform: scale(1.12);
        }

        .nm-range-slider::-webkit-slider-thumb:active {
          transform: scale(0.95);
          box-shadow: inset 2px 2px 4px rgba(166, 180, 200, 0.7), inset -2px -2px 4px rgba(255, 255, 255, 0.9);
        }

        .nm-range-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--nm-bg, #E9EEF5);
          box-shadow: 2px 2px 5px rgba(166, 180, 200, 0.65), -2px -2px 5px rgba(255, 255, 255, 0.95);
          border: 1.5px solid rgba(255, 255, 255, 0.85);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
