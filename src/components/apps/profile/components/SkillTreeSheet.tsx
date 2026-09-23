import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Camera, Check, Lock, Unlock, Sparkles } from 'lucide-react';
import { RPGSkillNode } from '../../../../core/rpg/types';
import { getAllSkillImages, saveSkillImage, deleteSkillImage } from '../../../../core/rpg/skillImageStorage';

interface SkillTreeSheetProps {
  skills: RPGSkillNode[];
  onToggleUnlock: (id: string) => void;
  onAddSkill: (skill: RPGSkillNode) => void;
  onDeleteSkill: (id: string) => void;
  onClose: () => void;
}

// 分支元数据配置
const BRANCH_CONFIG: Record<
  'INT' | 'STR' | 'DEX' | 'SPI' | 'CON' | 'CHA',
  { label: string; color: string; bgBadge: string; defaultEmoji: string }
> = {
  INT: { label: '智力', color: '#1E9E88', bgBadge: '#E6F7F3', defaultEmoji: '🧪' },
  STR: { label: '力量', color: '#E05D44', bgBadge: '#FDEEEB', defaultEmoji: '🥊' },
  DEX: { label: '敏捷', color: '#D97706', bgBadge: '#FEF3C7', defaultEmoji: '⚡' },
  SPI: { label: '精神', color: '#7C3AED', bgBadge: '#F5F3FF', defaultEmoji: '🔮' },
  CON: { label: '体质', color: '#059669', bgBadge: '#ECFDF5', defaultEmoji: '🛡️' },
  CHA: { label: '魅力', color: '#DB2777', bgBadge: '#FDF2F8', defaultEmoji: '✨' },
};

export const SkillTreeSheet: React.FC<SkillTreeSheetProps> = ({
  skills,
  onToggleUnlock,
  onAddSkill,
  onDeleteSkill,
  onClose,
}) => {
  // 分类筛选（保留现有分类：全部 + 六维属性）
  const [selectedBranch, setSelectedBranch] = useState<
    'ALL' | 'INT' | 'STR' | 'DEX' | 'SPI' | 'CON' | 'CHA'
  >('ALL');

  // IndexedDB 技能大图映射：{ [skillId]: base64DataUrl }
  const [skillImageMap, setSkillImageMap] = useState<Record<string, string>>({});

  // 弹窗与新增状态
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<RPGSkillNode | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 新增表单状态
  const [newName, setNewName] = useState('');
  const [newBranch, setNewBranch] = useState<'INT' | 'STR' | 'DEX' | 'SPI' | 'CON' | 'CHA'>('INT');
  const [newDesc, setNewDesc] = useState('');
  const [newImageData, setNewImageData] = useState<string | null>(null);

  // 文件上传引用
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeUploadSkillIdRef = useRef<string | null>(null);
  const newAddFileInputRef = useRef<HTMLInputElement | null>(null);

  // 提示 (<= 5 字)
  const showToast = (msg: string) => {
    setToastMsg(msg.slice(0, 5));
    setTimeout(() => {
      setToastMsg(null);
    }, 1800);
  };

  // 初始化从 IndexedDB 加载技能大图
  useEffect(() => {
    let isMounted = true;
    getAllSkillImages().then((map) => {
      if (isMounted) {
        setSkillImageMap(map);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 触发单个技能上传/更换大图
  const handleTriggerUpload = (skillId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    activeUploadSkillIdRef.current = skillId;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const skillId = activeUploadSkillIdRef.current;
    if (!file || !skillId) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      await saveSkillImage(skillId, dataUrl);
      setSkillImageMap((prev) => ({ ...prev, [skillId]: dataUrl }));
      showToast('图片已存入');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // 新增技能的图片选择
  const handleNewAddFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setNewImageData(reader.result as string);
      showToast('图片已读取');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // 创建新技能
  const handleCreate = async () => {
    if (!newName.trim()) return;
    const id = `skill_${Date.now()}`;
    const newSkill: RPGSkillNode = {
      id,
      name: newName.trim().slice(0, 5), // <= 5 字
      branch: newBranch,
      level: 1,
      unlocked: true,
      desc: newDesc.trim() || '日常专注积累习得',
      effect: `${BRANCH_CONFIG[newBranch]?.label || ''}+1`,
    };

    if (newImageData) {
      await saveSkillImage(id, newImageData);
      setSkillImageMap((prev) => ({ ...prev, [id]: newImageData }));
    }

    onAddSkill(newSkill);
    showToast('添加成功');
    setNewName('');
    setNewDesc('');
    setNewImageData(null);
    setIsAdding(false);
  };

  // 删除技能
  const handleDelete = async (skillId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await deleteSkillImage(skillId);
    setSkillImageMap((prev) => {
      const copy = { ...prev };
      delete copy[skillId];
      return copy;
    });
    onDeleteSkill(skillId);
    if (selectedSkill?.id === skillId) {
      setSelectedSkill(null);
    }
    showToast('技能已删除');
  };

  // 清除自定义图片并恢复默认
  const handleClearImage = async (skillId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await deleteSkillImage(skillId);
    setSkillImageMap((prev) => {
      const copy = { ...prev };
      delete copy[skillId];
      return copy;
    });
    showToast('已清图片');
  };

  // 分类过滤
  const filteredSkills =
    selectedBranch === 'ALL'
      ? skills
      : skills.filter((s) => s.branch === selectedBranch);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 85,
        background: 'rgba(28, 42, 36, 0.55)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'backdropFadeIn 0.25s ease-out',
      }}
      onClick={onClose}
    >
      {/* 隐藏的通用文件上传 input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* 轻浮动 Toast 提示 (<= 5 字) */}
      {toastMsg && (
        <div
          style={{
            position: 'absolute',
            top: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 120,
            background: 'rgba(26, 75, 66, 0.95)',
            color: '#FFFFFF',
            padding: '7px 18px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 800,
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
            border: '1.5px solid rgba(255, 255, 255, 0.4)',
            letterSpacing: '0.5px',
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* 主面板容器（对齐参考图：绿色复古标题栏 + 羊皮纸斜纹票券卡片） */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxHeight: '86%',
          background: '#EAE3D2', // 暖羊皮底色
          borderTopLeftRadius: '26px',
          borderTopRightRadius: '26px',
          border: '3px solid #1E5C50',
          borderBottom: 'none',
          boxShadow: '0 -10px 35px rgba(26, 75, 66, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          animation: 'slideUpSpring 0.35s cubic-bezier(0.18, 0.9, 0.32, 1.25)',
        }}
      >
        {/* ================= 1. 顶部墨绿大标题栏（对齐参考图 ANIMALS 顶栏） ================= */}
        <div
          style={{
            background: '#2A9D87', // 参考图标志性绿松石绿
            padding: '12px 16px',
            borderTopLeftRadius: '23px',
            borderTopRightRadius: '23px',
            borderBottom: '3px solid #1E5C50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          {/* 左侧：新增按键 (<= 5 字) */}
          <button
            onClick={() => setIsAdding(!isAdding)}
            style={{
              padding: '5px 12px',
              borderRadius: '12px',
              border: '2px solid #1E5C50',
              background: isAdding ? '#F87171' : '#FDF7EB',
              color: isAdding ? '#FFFFFF' : '#1E5C50',
              fontWeight: 900,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 0 #1E5C50',
            }}
          >
            {isAdding ? <X size={13} /> : <Plus size={13} />}
            <span>{isAdding ? '取消' : '添技能'}</span>
          </button>

          {/* 中间：圆润萌系主标题 */}
          <div
            style={{
              fontSize: '18px',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '1px',
              textShadow: '0 2px 0 #1E5C50',
              fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
            }}
          >
            技能树
          </div>

          {/* 右侧：参考图同款米白圆形关闭 X 按钮 */}
          <button
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: '2px solid #1E5C50',
              background: '#FDF7EB',
              color: '#1E5C50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 0 #1E5C50',
              fontWeight: 900,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ================= 2. 保留现有分类（六维分支横向卷轴 Tab） ================= */}
        <div
          className="no-scrollbar"
          style={{
            display: 'flex',
            gap: '6px',
            padding: '8px 14px',
            background: '#22806D',
            borderBottom: '2.5px solid #1E5C50',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {[
            { key: 'ALL', label: '全部' },
            { key: 'INT', label: '智力' },
            { key: 'STR', label: '力量' },
            { key: 'DEX', label: '敏捷' },
            { key: 'SPI', label: '精神' },
            { key: 'CON', label: '体质' },
            { key: 'CHA', label: '魅力' },
          ].map((cat) => {
            const isCurrent = selectedBranch === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => {
                  setSelectedBranch(cat.key as any);
                  setIsAdding(false);
                }}
                style={{
                  padding: '4px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid #14443B',
                  background: isCurrent ? '#FDF7EB' : 'rgba(20, 68, 59, 0.45)',
                  color: isCurrent ? '#14443B' : '#E6F7F3',
                  fontWeight: 900,
                  fontSize: '11px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isCurrent ? '0 2px 0 #14443B' : 'none',
                  transition: 'all 0.1s ease',
                  fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ================= 新增技能折叠表单 ================= */}
        {isAdding && (
          <div
            style={{
              margin: '10px 14px 4px',
              padding: '12px',
              background: '#FDF7EB',
              borderRadius: '16px',
              border: '2.5px solid #1E5C50',
              boxShadow: '0 4px 10px rgba(30, 92, 80, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <input
              type="file"
              ref={newAddFileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleNewAddFileChange}
            />

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {/* 点击上传大图槽 */}
              <div
                onClick={() => newAddFileInputRef.current?.click()}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '14px',
                  border: '2px dashed #2A9D87',
                  background: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {newImageData ? (
                  <img
                    src={newImageData}
                    alt="preview"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <>
                    <Camera size={18} color="#2A9D87" />
                    <span style={{ fontSize: '10px', color: '#2A9D87', fontWeight: 800, marginTop: '2px' }}>
                      选图
                    </span>
                  </>
                )}
              </div>

              {/* 字段输入 */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    placeholder="名称(<=5字)"
                    maxLength={5}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: '1.5px solid #1E5C50',
                      fontSize: '12px',
                      fontWeight: 700,
                      outline: 'none',
                    }}
                  />
                  <select
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value as any)}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '8px',
                      border: '1.5px solid #1E5C50',
                      fontSize: '12px',
                      fontWeight: 700,
                      outline: 'none',
                      background: '#FFFFFF',
                    }}
                  >
                    <option value="INT">智力</option>
                    <option value="STR">力量</option>
                    <option value="DEX">敏捷</option>
                    <option value="SPI">精神</option>
                    <option value="CON">体质</option>
                    <option value="CHA">魅力</option>
                  </select>
                </div>
              </div>
            </div>

            <input
              type="text"
              placeholder="简要描述(如: 掌握核心算法)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1.5px solid #1E5C50',
                fontSize: '12px',
                outline: 'none',
              }}
            />

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  borderRadius: '10px',
                  background: newName.trim() ? '#2A9D87' : '#D1D5DB',
                  color: newName.trim() ? '#FFFFFF' : '#9CA3AF',
                  border: '2px solid #1E5C50',
                  fontWeight: 900,
                  fontSize: '13px',
                  cursor: newName.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: '0 2px 0 #1E5C50',
                }}
              >
                保存技能
              </button>
              <button
                onClick={() => setIsAdding(false)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '10px',
                  background: '#E5E7EB',
                  color: '#4B5563',
                  border: '2px solid #1E5C50',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 0 #1E5C50',
                }}
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* ================= 3. 技能列表：左边文字，右边图片（对齐参考图） ================= */}
        <div
          style={{
            padding: '12px 14px 28px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxHeight: '64vh',
          }}
        >
          {filteredSkills.map((skill) => {
            const branchInfo = BRANCH_CONFIG[skill.branch] || BRANCH_CONFIG.INT;
            const hasCustomImage = !!skillImageMap[skill.id] || !!skill.imageUrl;
            const imgSrc = skillImageMap[skill.id] || skill.imageUrl;

            return (
              <div
                key={skill.id}
                onClick={() => setSelectedSkill(skill)}
                style={{
                  // 羊皮纸米黄底色 + 浅色对角细条纹（精准还原参考图背景）
                  background:
                    '#FDF8ED repeating-linear-gradient(45deg, rgba(224, 210, 185, 0.22) 0, rgba(224, 210, 185, 0.22) 8px, transparent 8px, transparent 16px)',
                  borderRadius: '18px',
                  border: '2.5px solid #2B231D',
                  boxShadow: '0 4px 10px rgba(43, 35, 29, 0.12)',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  position: 'relative',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  transition: 'transform 0.1s ease',
                }}
              >
                {/* 顶部右侧相机小徽标 (快速更换大图存至 IndexedDB) */}
                <button
                  onClick={(e) => handleTriggerUpload(skill.id, e)}
                  title="上传图片"
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    zIndex: 10,
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: '1.5px solid #2B231D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  }}
                >
                  <Camera size={12} color="#2B231D" />
                </button>

                {/* ================= 左边文字 (Left Text Content) ================= */}
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    minWidth: 0,
                  }}
                >
                  {/* 顶栏：瓶盖/宝石微标 + 属性加成与等级 (对齐参考图 200/400 样式) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: branchInfo.bgBadge,
                        padding: '2px 8px',
                        borderRadius: '8px',
                        border: `1px solid ${branchInfo.color}`,
                      }}
                    >
                      <span style={{ fontSize: '11px' }}>{branchInfo.defaultEmoji}</span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 900,
                          color: branchInfo.color,
                        }}
                      >
                        {skill.effect || `${branchInfo.label}+${skill.level}`}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        color: '#6B7280',
                      }}
                    >
                      Lv.{skill.level}
                    </span>
                  </div>

                  {/* 技能名称 (大号粗体，对齐参考图 TADPOLE / KITTEN) */}
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: 900,
                      color: '#2B231D',
                      letterSpacing: '0.5px',
                      fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {skill.name}
                  </div>

                  {/* 技能描述（对齐参考图大写/紧凑字形说明） */}
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#5C4A3E',
                      lineHeight: '1.3',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {skill.desc || '专注积累习得，强化核心效能。'}
                  </div>

                  {/* 底部解锁状态切换胶囊 (<= 5 字) */}
                  <div style={{ marginTop: '4px', display: 'flex', gap: '6px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleUnlock(skill.id);
                      }}
                      style={{
                        padding: '3px 10px',
                        borderRadius: '10px',
                        border: skill.unlocked ? '1.5px solid #059669' : '1.5px solid #9CA3AF',
                        background: skill.unlocked ? '#D1FAE5' : '#F3F4F6',
                        color: skill.unlocked ? '#065F46' : '#6B7280',
                        fontSize: '10px',
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        boxShadow: skill.unlocked ? '0 1.5px 0 #059669' : 'none',
                      }}
                    >
                      {skill.unlocked ? <Check size={11} /> : <Lock size={11} />}
                      <span>{skill.unlocked ? '已解锁' : '未解锁'}</span>
                    </button>
                  </div>
                </div>

                {/* ================= 右边图片 (Right Big Image, 对齐参考图插画) ================= */}
                <div
                  style={{
                    width: '94px',
                    height: '94px',
                    flexShrink: 0,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* 用户上传的高清真实大图 (存储在 IndexedDB 中) */}
                  {hasCustomImage ? (
                    <img
                      src={imgSrc}
                      alt={skill.name}
                      style={{
                        width: '90%',
                        height: '90%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.18))',
                      }}
                    />
                  ) : (
                    /* 默认生动萌系矢量插画 / Emoji 表现 */
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }}
                    >
                      {/* 背景柔和光圈 */}
                      <div
                        style={{
                          position: 'absolute',
                          width: '74px',
                          height: '74px',
                          borderRadius: '50%',
                          background: branchInfo.bgBadge,
                          opacity: 0.8,
                        }}
                      />
                      <span
                        style={{
                          fontSize: '48px',
                          zIndex: 2,
                          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))',
                          userSelect: 'none',
                        }}
                      >
                        {branchInfo.defaultEmoji}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= 4. 技能卡片管理弹窗 (上传大图/恢复默认/删除) ================= */}
        {selectedSkill && (
          <div
            onClick={() => setSelectedSkill(null)}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 90,
              background: 'rgba(28, 42, 36, 0.65)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '18px',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '280px',
                background: '#FDF7EB',
                borderRadius: '24px',
                border: '3px solid #1E5C50',
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setSelectedSkill(null)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>

              {/* 右侧大图预览槽 */}
              <div
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '18px',
                  border: '2px solid #1E5C50',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {skillImageMap[selectedSkill.id] || selectedSkill.imageUrl ? (
                  <img
                    src={skillImageMap[selectedSkill.id] || selectedSkill.imageUrl}
                    alt={selectedSkill.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <span style={{ fontSize: '46px' }}>
                    {BRANCH_CONFIG[selectedSkill.branch]?.defaultEmoji || '✨'}
                  </span>
                )}
              </div>

              {/* 技能信息 */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#1E5C50' }}>
                  {selectedSkill.name}
                </div>
                <div style={{ fontSize: '12px', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                  {selectedSkill.effect || '属性加成'}
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '3px' }}>
                  {selectedSkill.desc}
                </div>
              </div>

              {/* 图片上传与恢复默认按键 */}
              <div style={{ width: '100%', display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleTriggerUpload(selectedSkill.id)}
                  style={{
                    flex: 1,
                    padding: '7px 0',
                    borderRadius: '12px',
                    background: '#2A9D87',
                    color: '#FFFFFF',
                    border: '2px solid #1E5C50',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 0 #1E5C50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <Camera size={13} />
                  <span>传大图</span>
                </button>

                {(skillImageMap[selectedSkill.id] || selectedSkill.imageUrl) && (
                  <button
                    onClick={() => handleClearImage(selectedSkill.id)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '12px',
                      background: '#FEE2E2',
                      color: '#EF4444',
                      border: '2px solid #1E5C50',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 2px 0 #1E5C50',
                    }}
                  >
                    恢复默认
                  </button>
                )}
              </div>

              {/* 解锁切换与删除按键 */}
              <div style={{ width: '100%', display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    onToggleUnlock(selectedSkill.id);
                    setSelectedSkill((prev) => prev ? { ...prev, unlocked: !prev.unlocked } : null);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: '12px',
                    border: '2px solid #1E5C50',
                    background: selectedSkill.unlocked ? '#D1FAE5' : '#FEF3C7',
                    color: selectedSkill.unlocked ? '#065F46' : '#92400E',
                    fontSize: '13px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 2px 0 #1E5C50',
                  }}
                >
                  {selectedSkill.unlocked ? '已解锁' : '点击解锁'}
                </button>

                <button
                  onClick={() => handleDelete(selectedSkill.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '12px',
                    border: '2px solid #1E5C50',
                    background: '#FEE2E2',
                    color: '#DC2626',
                    fontSize: '13px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 2px 0 #1E5C50',
                  }}
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 动画定义 */}
      <style>{`
        @keyframes slideUpSpring {
          0% {
            transform: translateY(100%);
            opacity: 0.4;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes backdropFadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
