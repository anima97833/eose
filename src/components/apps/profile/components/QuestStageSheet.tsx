import React, { useState, useRef } from 'react';
import { X, Sparkles, Gift } from 'lucide-react';
import { QuestMilestone } from '../../../../core/rpg/questTypes';
import {
  loadMilestoneQuests,
  saveMilestoneQuests,
  resetMilestoneQuests,
  generateMilestonesWithAI,
} from '../../../../core/rpg/questStorage';

interface QuestStageSheetProps {
  onRewardCoins: (coins: number) => void;
  onRewardExp?: (exp: number) => void;
  onClose: () => void;
  currentJobName?: string;
}

export const QuestStageSheet: React.FC<QuestStageSheetProps> = ({
  onRewardCoins,
  onRewardExp,
  onClose,
  currentJobName = '探索者',
}) => {
  const [milestones, setMilestones] = useState<QuestMilestone[]>(loadMilestoneQuests);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiGoalInput, setAiGoalInput] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 鼠标拖拽平滑滚动
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const scrollTopRef = useRef(0);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  // 领取奖励
  const handleClaim = (milestone: QuestMilestone) => {
    if (milestone.status !== 'claimable') return;

    // 发放数值奖励（作为底层游戏化激励）
    if (milestone.reward.amount) {
      onRewardCoins(milestone.reward.amount);
    } else {
      onRewardCoins(50);
    }
    showToast('已获犒劳');

    // 默认给 100 EXP
    if (onRewardExp) {
      onRewardExp(100);
    }

    // 更新状态为已领取，并将下一阶段激活为进行中
    const nextList = milestones.map((m, idx) => {
      if (m.id === milestone.id) {
        return { ...m, status: 'claimed' as const };
      }
      return m;
    });

    // 自动解锁下一个锁定任务
    const currentIdx = nextList.findIndex((m) => m.id === milestone.id);
    if (currentIdx >= 0 && currentIdx + 1 < nextList.length) {
      if (nextList[currentIdx + 1].status === 'locked') {
        nextList[currentIdx + 1] = {
          ...nextList[currentIdx + 1],
          status: 'claimable',
        };
      }
    }

    setMilestones(nextList);
    saveMilestoneQuests(nextList);
  };

  // AI 动态生成 5-8 步关卡计划并直接替换原有内容
  const handleGenerateAi = async () => {
    if (!aiGoalInput.trim()) return;
    setIsAiGenerating(true);
    try {
      const generated = await generateMilestonesWithAI({
        userLevel: 1,
        currentJob: currentJobName,
        attributes: {},
        userGoal: aiGoalInput,
      });

      // 彻底替换掉原有关卡，换上全新的 5-8 步可执行计划
      setMilestones(generated);
      saveMilestoneQuests(generated);
      setShowAiModal(false);
      setAiGoalInput('');
      showToast('计划已生成');
    } catch (err) {
      showToast('生成失败');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // 计算当前完成进度 (Max 条)
  const claimedCount = milestones.filter((m) => m.status === 'claimed').length;
  const progressPercent = Math.min(100, Math.round((claimedCount / milestones.length) * 100));

  // 背景色彩映射 (深度还原图2：明黄、浅紫、浅粉、浅青)
  const getRightCardColor = (bg: QuestMilestone['rightCardBg']) => {
    switch (bg) {
      case 'yellow':
        return {
          bg: '#FFF3CE', // 图2第5关奶油明黄
          border: '#502A24',
          pillBg: '#65B741',
        };
      case 'purple':
        return {
          bg: '#EAE3F7', // 图2第6、7、8关香芋浅紫
          border: '#502A24',
          pillBg: '#65B741',
        };
      case 'rose':
        return {
          bg: '#FFE8E2', // 柔嫩浅粉
          border: '#502A24',
          pillBg: '#65B741',
        };
      case 'cyan':
      default:
        return {
          bg: '#DDF4F2',
          border: '#502A24',
          pillBg: '#65B741',
        };
    }
  };

  // 鼠标拖拽事件
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startYRef.current = e.pageY - (scrollRef.current?.offsetTop || 0);
    scrollTopRef.current = scrollRef.current?.scrollTop || 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    e.preventDefault();
    const y = e.pageY - (scrollRef.current.offsetTop || 0);
    const walk = (y - startYRef.current) * 1.5;
    scrollRef.current.scrollTop = scrollTopRef.current - walk;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(25, 20, 20, 0.45)',
        backdropFilter: 'blur(5px)',
        animation: 'fadeIn 0.2s ease-out',
        padding: '12px 10px',
      }}
      onClick={onClose}
    >
      {/* 弹窗主看板 (深度对齐图2关卡进阶长卷) */}
      <div
        style={{
          width: '100%',
          maxWidth: '340px',
          maxHeight: '90vh',
          background: 'linear-gradient(180deg, #FBF6EC 0%, #F5ECDD 100%)',
          borderRadius: '22px',
          border: '3px solid #502A24',
          boxShadow: '0 12px 32px rgba(80, 42, 36, 0.35), inset 0 2px 0 rgba(255, 255, 255, 0.9)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflow: 'hidden',
          paddingBottom: '14px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= 顶部缎带条 (深度还原图2：Hadiah Naik Level 珊瑚红缎带) ================= */}
        <div
          style={{
            width: '100%',
            padding: '12px 14px 6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* 右上角关闭按钮 */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              right: '12px',
              top: '10px',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#FAF4E8',
              border: '2px solid #502A24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 0 #502A24',
              zIndex: 20,
            }}
          >
            <X size={16} color="#502A24" strokeWidth={3} />
          </button>

          {/* 左上角 AI 定制入口胶囊 (预留 AI 接口) */}
          <button
            onClick={() => setShowAiModal(true)}
            style={{
              position: 'absolute',
              left: '12px',
              top: '10px',
              padding: '4px 8px',
              borderRadius: '12px',
              background: '#FFF3CE',
              border: '2px solid #502A24',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              boxShadow: '0 2px 0 #502A24',
              zIndex: 20,
              fontSize: '11px',
              fontWeight: 900,
              color: '#502A24',
            }}
          >
            <Sparkles size={13} color="#D97706" />
            <span>AI定制</span>
          </button>

          {/* 珊瑚红折叠缎带主体 */}
          <div
            style={{
              position: 'relative',
              width: '180px',
              height: '38px',
              background: 'linear-gradient(180deg, #F27866 0%, #E85D48 100%)',
              borderRadius: '8px',
              border: '2.5px solid #502A24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 0 #502A24',
              marginTop: '4px',
            }}
          >
            {/* 缎带左翼 */}
            <div
              style={{
                position: 'absolute',
                left: '-14px',
                top: '4px',
                width: '18px',
                height: '26px',
                background: '#D94D38',
                border: '2.5px solid #502A24',
                borderRight: 'none',
                borderRadius: '4px 0 0 4px',
                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 35% 50%)',
                zIndex: -1,
              }}
            />
            {/* 缎带右翼 */}
            <div
              style={{
                position: 'absolute',
                right: '-14px',
                top: '4px',
                width: '18px',
                height: '26px',
                background: '#D94D38',
                border: '2.5px solid #502A24',
                borderLeft: 'none',
                borderRadius: '0 4px 4px 0',
                clipPath: 'polygon(0 0, 100% 0, 65% 50%, 100% 100%, 0 100%)',
                zIndex: -1,
              }}
            />

            <span
              style={{
                fontSize: '17px',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '1px',
                fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
                textShadow: '0 1.5px 0 #502A24',
              }}
            >
              进阶之路
            </span>
          </div>

          {/* ================= 进度条：Max 绿色长胶囊条 (深度对齐图2) ================= */}
          <div
            style={{
              width: '90%',
              maxWidth: '280px',
              height: '24px',
              background: '#2F5927', // 图2深绿底壳
              borderRadius: '12px',
              border: '2px solid #502A24',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              padding: '2px',
              marginTop: '10px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
            }}
          >
            {/* 内部高亮充能进度 */}
            <div
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: 'linear-gradient(180deg, #99E25A 0%, #6EB937 100%)',
                borderRadius: '8px',
                transition: 'width 0.4s ease',
              }}
            />

            {/* 居中文字 Max */}
            <span
              style={{
                position: 'absolute',
                width: '100%',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '0.5px',
                textShadow: '0 1px 2px rgba(0,0,0,0.6)',
              }}
            >
              {progressPercent === 100 ? 'MAX' : `${progressPercent}%`}
            </span>

            {/* 右侧金色礼盒图标 (对齐图2) */}
            <div
              style={{
                position: 'absolute',
                right: '3px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#FFD166',
                border: '1.5px solid #502A24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Gift size={12} color="#502A24" />
            </div>
          </div>
        </div>

        {/* ================= 关卡阶段垂直推进轨 (深度还原图2左右卡片结构与绿轴) ================= */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            width: '100%',
            flex: 1,
            overflowY: 'auto',
            padding: '10px 14px 20px',
            position: 'relative',
            cursor: 'grab',
            userSelect: 'none',
          }}
        >
          {/* 左侧垂直绿色时间轴线 (对齐图2绿色主干) */}
          <div
            style={{
              position: 'absolute',
              left: '32px',
              top: '20px',
              bottom: '20px',
              width: '8px',
              background: 'linear-gradient(180deg, #76C843 0%, #5EAA32 100%)',
              border: '2px solid #502A24',
              borderRadius: '4px',
              zIndex: 1,
            }}
          />

          {/* 阶段卡片列表 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 2 }}>
            {milestones.map((m) => {
              const rightStyle = getRightCardColor(m.rightCardBg);
              const isClaimable = m.status === 'claimable';
              const isClaimed = m.status === 'claimed';

              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    position: 'relative',
                    zIndex: 2,
                  }}
                >
                  {/* 1. 关卡阶段圆盘徽章 (对齐图2的 5, 6, 7, 8 圆形路标) */}
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#FFFDF5',
                      border: '2.5px solid #502A24',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '15px',
                      fontWeight: 900,
                      color: '#2F5927',
                      boxShadow: '0 2px 0 #502A24',
                      flexShrink: 0,
                      zIndex: 5,
                    }}
                  >
                    {m.stageNumber}
                  </div>

                  {/* 2. 左侧卡片 (深度还原图2：浅青色薄荷泡泡卡片 Buka kunci bidang) */}
                  <div
                    style={{
                      width: '105px',
                      background: '#D2F3EE', // 图2同款浅青色
                      border: '2px solid #502A24',
                      borderRadius: '14px',
                      padding: '8px 6px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2.5px 0 #502A24',
                      flexShrink: 0,
                      minHeight: '82px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 900,
                        color: '#1C5C55',
                        marginBottom: '4px',
                        textAlign: 'center',
                      }}
                    >
                      {m.targetTitle}
                    </span>

                    {/* 目标设施/物品插槽 (图2中的料理锅与加号) */}
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: '#FAF4E8',
                        border: '2px solid #502A24',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.15)',
                      }}
                    >
                      {m.targetIcon}
                    </div>

                    <span
                      style={{
                        fontSize: '9px',
                        color: '#34524F',
                        fontWeight: 700,
                        marginTop: '4px',
                        textAlign: 'center',
                        lineHeight: 1.1,
                      }}
                    >
                      {m.targetDesc}
                    </span>
                  </div>

                  {/* 3. 中间加号连接符 (对齐图2手绘白色 + 号) */}
                  <span
                    style={{
                      fontSize: '18px',
                      fontWeight: 900,
                      color: '#502A24',
                      textShadow: '0 1px 0 #FFFFFF',
                      flexShrink: 0,
                    }}
                  >
                    +
                  </span>

                  {/* 4. 右侧奖励卡片 (深度还原图2：明黄/淡紫等多彩糖果色) */}
                  <div
                    style={{
                      flex: 1,
                      background: rightStyle.bg,
                      border: `2px solid ${rightStyle.border}`,
                      borderRadius: '14px',
                      padding: '8px 8px 6px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 2.5px 0 #502A24',
                      position: 'relative',
                      minHeight: '82px',
                    }}
                  >
                    {/* 气泡标签 (如图2第5关的 "Tampilan baru!" 新外观气泡) */}
                    {m.reward.badgeText && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '6px',
                          background: '#FFFFFF',
                          border: '1.5px solid #502A24',
                          borderRadius: '8px',
                          padding: '1px 5px',
                          fontSize: '9px',
                          fontWeight: 900,
                          color: '#502A24',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        }}
                      >
                        {m.reward.badgeText}
                      </div>
                    )}

                    {/* 奖励图形与现实微犒劳标签 (如 🥤 喝罐饮料 1瓶 / 🎮 玩十分钟) */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '2px 0',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '20px' }}>{m.reward.icon}</span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 900,
                            color: '#502A24',
                            fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
                          }}
                        >
                          {m.reward.name}
                        </span>
                      </div>
                      {m.reward.label && m.reward.label !== m.reward.name && (
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 800,
                            color: '#7A5A46',
                            marginTop: '-1px',
                          }}
                        >
                          {m.reward.label}
                        </span>
                      )}
                    </div>

                    {/* 绿色胶囊领取按钮 (对齐图2：Klaim 绿胶囊按键与红点) */}
                    <button
                      onClick={() => handleClaim(m)}
                      disabled={!isClaimable}
                      style={{
                        width: '82%',
                        padding: '4px 0',
                        borderRadius: '12px',
                        border: '2px solid #2B571B',
                        background: isClaimed
                          ? '#D1D5DB'
                          : isClaimable
                          ? 'linear-gradient(180deg, #74C547 0%, #57A62F 100%)'
                          : '#E5E7EB',
                        color: isClaimed ? '#6B7280' : isClaimable ? '#FFFFFF' : '#9CA3AF',
                        fontSize: '11px',
                        fontWeight: 900,
                        cursor: isClaimable ? 'pointer' : 'default',
                        boxShadow: isClaimable ? '0 2px 0 #2B571B' : 'none',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span>
                        {isClaimed ? '已达成' : isClaimable ? '领奖励' : '进行中'}
                      </span>

                      {/* 待领取红点角标 (对齐图2 Klaim 按钮右上角小红点) */}
                      {isClaimable && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '-3px',
                            right: '-3px',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#EF4444',
                            border: '1.5px solid #FFFFFF',
                          }}
                        />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= AI 定制任务弹窗 (预留 AI 接口) ================= */}
        {showAiModal && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 30,
              background: 'rgba(0, 0, 0, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
            onClick={() => setShowAiModal(false)}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '280px',
                background: '#FAF4E8',
                borderRadius: '16px',
                border: '2.5px solid #502A24',
                padding: '14px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#502A24' }}>
                  AI关卡定制
                </span>
                <button
                  onClick={() => setShowAiModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#502A24' }}
                >
                  <X size={16} />
                </button>
              </div>

              <span style={{ fontSize: '11px', color: '#7A5A46', fontWeight: 700 }}>
                输入现实目标，AI 拆解为5-8步计划：
              </span>

              <input
                type="text"
                value={aiGoalInput}
                onChange={(e) => setAiGoalInput(e.target.value)}
                placeholder="现实目标 (<=15字)"
                maxLength={15}
                style={{
                  padding: '7px 10px',
                  borderRadius: '10px',
                  border: '1.5px solid #502A24',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleGenerateAi}
                  disabled={isAiGenerating || !aiGoalInput.trim()}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: '10px',
                    background: aiGoalInput.trim()
                      ? 'linear-gradient(180deg, #F27866 0%, #E85D48 100%)'
                      : '#D1D5DB',
                    border: '2px solid #502A24',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '12px',
                    cursor: isAiGenerating || !aiGoalInput.trim() ? 'default' : 'pointer',
                    boxShadow: '0 2px 0 #502A24',
                  }}
                >
                  {isAiGenerating ? '生成中...' : '生成计划'}
                </button>

                <button
                  onClick={() => {
                    const def = resetMilestoneQuests();
                    setMilestones(def);
                    setShowAiModal(false);
                    showToast('已重置');
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: '#FFFFFF',
                    border: '2px solid #502A24',
                    color: '#502A24',
                    fontWeight: 900,
                    fontSize: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 0 #502A24',
                  }}
                >
                  重置
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 轻量 Toast 提示 */}
        {toastMsg && (
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              background: '#502A24',
              color: '#FFFFFF',
              padding: '5px 14px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 900,
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              zIndex: 60,
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {toastMsg}
          </div>
        )}
      </div>
    </div>
  );
};
