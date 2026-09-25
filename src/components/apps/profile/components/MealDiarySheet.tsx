import React, { useState, useEffect, useRef } from 'react';
import { X, Star, Plus, Camera, ChevronLeft, ChevronRight, Edit3, Trash2 } from 'lucide-react';
import { RPGMealRecord } from '../../../../core/storage/db';
import {
  getAllMealRecords,
  saveMealRecord,
  deleteMealRecord,
  resetMealRecords,
  DEFAULT_MEALS,
} from '../../../../core/rpg/mealStorage';
import { compressImageFile } from '../../../../utils/imageCompressor';
import {
  FlowerWagashiSVG,
  ManjuSVG,
  RabbitWagashiSVG,
  SakuraMochiSVG,
  FruitWagashiSVG,
  RaindropMochiSVG,
  StrawberryGiftSVG,
  GiftSetSVG,
  WagashiShopSVG,
  StarredRibbonBowSVG,
} from './WagashiIllustrations';
import { MealRouletteView } from './MealRouletteView';

interface MealDiarySheetProps {
  onClose: () => void;
}

const MEAL_TYPE_NAMES: Record<RPGMealRecord['mealType'], string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '加餐',
};

// 预设图腾渲染器（放大尺寸）
const renderPresetIllustration = (badgeKey?: string, size = 66) => {
  switch (badgeKey) {
    case 'flower':
      return <FlowerWagashiSVG size={size} />;
    case 'manju':
      return <ManjuSVG size={size} />;
    case 'rabbit':
      return <RabbitWagashiSVG size={size} />;
    case 'sakura':
      return <SakuraMochiSVG size={size} />;
    case 'fruit':
      return <FruitWagashiSVG size={size} />;
    case 'raindrop':
      return <RaindropMochiSVG size={size} />;
    case 'strawberry':
      return <StrawberryGiftSVG size={size} />;
    case 'giftset':
      return <GiftSetSVG size={size} />;
    case 'shop':
      return <WagashiShopSVG size={size} />;
    default:
      return <RabbitWagashiSVG size={size} />;
  }
};

export const MealDiarySheet: React.FC<MealDiarySheetProps> = ({ onClose }) => {
  const [records, setRecords] = useState<RPGMealRecord[]>([]);
  // 视图模式：'sheet' (手账看板) | 'roulette' (大转盘今天吃什么)
  const [currentView, setCurrentView] = useState<'sheet' | 'roulette'>('sheet');
  // 问题3：初始不选中任何特定食物，只有用户主动点击某个食物才出现上方横幅
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  // 编辑 / 新增模态框状态
  const [isEditing, setIsEditing] = useState(false);
  const [editingSlotIndex, setEditingSlotIndex] = useState<number>(0);
  const [formDate, setFormDate] = useState('');
  const [formMealType, setFormMealType] = useState<RPGMealRecord['mealType']>('lunch');
  const [formDishName, setFormDishName] = useState('');
  const [formRating, setFormRating] = useState<number>(3);
  const [formReview, setFormReview] = useState('');
  const [formImageData, setFormImageData] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  // 初始化从 IndexedDB 加载记录，初始不自动展开上方横幅
  useEffect(() => {
    getAllMealRecords().then((list) => {
      setRecords(list);
    });
  }, []);

  // 9个槽位映射
  const slotList: (RPGMealRecord | null)[] = Array.from({ length: 9 }, (_, idx) => {
    return records.find((r) => r.slotIndex === idx) || null;
  });

  // 当前选中的菜式（只有点击特定食物才非空）
  const selectedRecord = selectedMealId ? records.find((r) => r.id === selectedMealId) : null;

  // 问题2：快捷添加新食物
  const handleOpenAddNewMeal = () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(
      today.getDate()
    ).padStart(2, '0')}`;

    // 优先选择第一个空槽位，若全满则默认替换选中或第0槽
    const firstEmpty = slotList.findIndex((s) => s === null);
    const targetSlot = firstEmpty >= 0 ? firstEmpty : (selectedRecord ? (selectedRecord.slotIndex ?? 0) : 0);

    setEditingSlotIndex(targetSlot);
    setFormDate(dateStr);
    setFormMealType(targetSlot < 3 ? 'breakfast' : targetSlot < 6 ? 'lunch' : 'dinner');
    setFormDishName('');
    setFormRating(3);
    setFormReview('');
    setFormImageData(null);
    setIsEditing(true);
  };

  // 从大转盘天选结果一键代入记一餐
  const handleOpenAddFromRoulette = (dishName: string, mealType: RPGMealRecord['mealType']) => {
    setCurrentView('sheet');
    const today = new Date();
    const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(
      today.getDate()
    ).padStart(2, '0')}`;

    const firstEmpty = slotList.findIndex((s) => s === null);
    const targetSlot = firstEmpty >= 0 ? firstEmpty : 0;

    setEditingSlotIndex(targetSlot);
    setFormDate(dateStr);
    setFormMealType(mealType);
    setFormDishName(dishName.slice(0, 5));
    setFormRating(3);
    setFormReview('来自大转盘的天选美味！');
    setFormImageData(null);
    setIsEditing(true);
  };

  // 打开编辑当前选中的菜式
  const handleOpenEditSelected = () => {
    if (!selectedRecord) return;
    setEditingSlotIndex(selectedRecord.slotIndex ?? 0);
    setFormDate(selectedRecord.date);
    setFormMealType(selectedRecord.mealType);
    setFormDishName(selectedRecord.dishName);
    setFormRating(selectedRecord.rating);
    setFormReview(selectedRecord.review);
    setFormImageData(selectedRecord.imageData || null);
    setIsEditing(true);
  };

  // 点击空槽位新增
  const handleOpenAddSlot = (slotIdx: number) => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(
      today.getDate()
    ).padStart(2, '0')}`;

    setEditingSlotIndex(slotIdx);
    setFormDate(dateStr);
    setFormMealType(slotIdx < 3 ? 'breakfast' : slotIdx < 6 ? 'lunch' : 'dinner');
    setFormDishName('');
    setFormRating(3);
    setFormReview('');
    setFormImageData(null);
    setIsEditing(true);
  };

  // 处理图片文件上传至 IndexedDB（强制客户端 WebP 高清压缩，避免原图撑爆存储）
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedDataUrl = await compressImageFile(file, {
        maxDimension: 1080,
        quality: 0.82,
        mimeType: 'image/webp',
      });
      setFormImageData(compressedDataUrl);
    } catch (err) {
      console.warn('[MealDiary] 图片压缩异常:', err);
    }
  };

  // 保存记录（支持自定义日期、菜名、星级、一句话评价）
  const handleSaveForm = async () => {
    if (!formDishName.trim()) {
      showToast('请填菜名');
      return;
    }

    const newRecord: RPGMealRecord = {
      id: selectedRecord && slotList[editingSlotIndex]?.id === selectedRecord.id
        ? selectedRecord.id
        : `meal_${Date.now()}`,
      date: formDate.trim() || '2026.09.22', // 问题1：日期可自由修改与保存
      mealType: formMealType,
      dishName: formDishName.trim().slice(0, 5),
      rating: formRating,
      review: formReview.trim() || '美味可口，幸福治愈。',
      imageData: formImageData || undefined,
      slotIndex: editingSlotIndex,
      updatedAt: Date.now(),
    };

    await saveMealRecord(newRecord);
    const updated = await getAllMealRecords();
    setRecords(updated);
    setSelectedMealId(newRecord.id); // 保存后联动展示上方横条
    setIsEditing(false);
    showToast('已记录');
  };

  // 删除当前菜式
  const handleDeleteSelected = async () => {
    if (!slotList[editingSlotIndex]) return;
    await deleteMealRecord(slotList[editingSlotIndex]!.id);
    const updated = await getAllMealRecords();
    setRecords(updated);
    setSelectedMealId(null);
    setIsEditing(false);
    showToast('已删除');
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        background: 'rgba(25, 20, 20, 0.45)',
        backdropFilter: 'blur(5px)',
        paddingTop: '46px', // 顶部预留安全距离，彻底避免遮挡移动端状态栏与灵动岛通知
        paddingBottom: '16px',
        paddingLeft: '10px',
        paddingRight: '10px',
        overflowY: 'auto', // 屏幕较矮时支持平滑纵向轻微滑动
        WebkitOverflowScrolling: 'touch',
        boxSizing: 'border-box',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '352px',
          margin: 'auto 0', // 空间充裕时居中，空间紧张时顶贴paddingTop，绝不发生顶部负溢出裁切
          background: 'linear-gradient(180deg, #FFFDF8 0%, #FFF5F7 100%)',
          borderRadius: '24px',
          border: '3px solid #502428',
          boxShadow: '0 12px 32px rgba(80, 36, 40, 0.35)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflow: 'hidden',
          padding: '10px 10px 10px',
          flexShrink: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= 方案 A：平滑横向视口滑动容器 ================= */}
        <div style={{ width: '100%', overflow: 'hidden' }}>
          <div
            style={{
              display: 'flex',
              width: '100%',
              alignItems: 'flex-start',
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: currentView === 'roulette' ? 'translateX(-100%)' : 'translateX(0%)',
            }}
          >
            {/* ====== Page 1: 九宫格手账看板 ====== */}
            <div
              style={{
                width: '100%',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* ================= 1. 上方横条（问题3：只有点击某个特定食物才会出现） ================= */}
              {selectedRecord ? (
          <div
            style={{
              width: '100%',
              background: '#FFF0F5',
              borderRadius: '16px',
              border: '2.5px solid #502428',
              padding: '6px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              position: 'relative',
              boxShadow: '0 3px 0 #502428',
              marginBottom: '8px',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {/* 点击关闭上方横条 */}
            <button
              onClick={() => setSelectedMealId(null)}
              style={{
                position: 'absolute',
                right: '-6px',
                top: '-6px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#F472B6',
                border: '2px solid #502428',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 0 #502428',
                zIndex: 30,
              }}
              title="收起横幅"
            >
              <X size={14} color="#FFFFFF" strokeWidth={3} />
            </button>

            {/* 左侧：食物大拱门窗格 + 缎带 */}
            <div
              style={{
                width: '60px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '50px',
                  borderRadius: '16px 16px 8px 8px',
                  background: '#FFFFFF',
                  border: '2px solid #502428',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {selectedRecord.imageData ? (
                  <img
                    src={selectedRecord.imageData}
                    alt="dish"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  renderPresetIllustration(selectedRecord.badgeKey, 48)
                )}
              </div>

              {/* 菜式名飘带 */}
              <div
                style={{
                  marginTop: '-5px',
                  background: 'linear-gradient(180deg, #93C5FD 0%, #60A5FA 100%)',
                  border: '1.5px solid #502428',
                  borderRadius: '6px',
                  padding: '1px 5px',
                  color: '#FFFFFF',
                  fontSize: '9px',
                  fontWeight: 900,
                  textShadow: '0 1px 0 #502428',
                  zIndex: 2,
                  whiteSpace: 'nowrap',
                }}
              >
                {selectedRecord.dishName}
              </div>
            </div>

            {/* 右侧：具体日期、美味星级与一句话评价 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {/* 具体日期展示 */}
                  <span
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 900,
                      color: '#502428',
                      fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
                    }}
                  >
                    {selectedRecord.date}
                  </span>
                  <span
                    style={{
                      fontSize: '9.5px',
                      fontWeight: 800,
                      color: '#DB2777',
                      background: '#FCE7F3',
                      padding: '1px 4px',
                      borderRadius: '5px',
                      border: '1px solid #502428',
                    }}
                  >
                    {MEAL_TYPE_NAMES[selectedRecord.mealType]}
                  </span>
                </div>

                {/* 编辑按键 */}
                <button
                  onClick={handleOpenEditSelected}
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #502428',
                    borderRadius: '7px',
                    padding: '1px 5px',
                    fontSize: '9.5px',
                    fontWeight: 900,
                    color: '#502428',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    marginRight: '12px',
                  }}
                >
                  <Edit3 size={9} />
                  <span>编辑</span>
                </button>
              </div>

              {/* 美味程度几颗星 (满分三星) */}
              <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    fill={i < selectedRecord.rating ? '#F59E0B' : '#E5E7EB'}
                    color={i < selectedRecord.rating ? '#B45309' : '#9CA3AF'}
                  />
                ))}
              </div>

              {/* 一句话评价气泡框 */}
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '7px',
                  border: '1.5px solid #502428',
                  padding: '2px 6px',
                  fontSize: '10.5px',
                  color: '#471B1E',
                  fontWeight: 700,
                  lineHeight: '1.25',
                  maxHeight: '30px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                “{selectedRecord.review}”
              </div>
            </div>
          </div>
        ) : (
          /* 未点击食物时展示标题栏与关闭、记一餐按键 */
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '2px 4px 6px',
            }}
          >
            {/* 左侧按钮组：一键添加新食物 + 方案 A 轮盘今天吃什么 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <button
                onClick={handleOpenAddNewMeal}
                style={{
                  background: '#FFF0F5',
                  border: '2px solid #502428',
                  borderRadius: '12px',
                  padding: '3px 9px',
                  fontSize: '11px',
                  fontWeight: 900,
                  color: '#DB2777',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  boxShadow: '0 2px 0 #502428',
                }}
              >
                <Plus size={13} strokeWidth={3} />
                <span>记一餐</span>
              </button>

              {/* 方案 A：轮盘图标按键，点击平滑滑入大转盘 */}
              <button
                onClick={() => setCurrentView('roulette')}
                title="今天吃什么？大转盘决定"
                style={{
                  background: '#FFFBEB',
                  border: '2px solid #502428',
                  borderRadius: '12px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 900,
                  color: '#B45309',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  boxShadow: '0 2px 0 #502428',
                  transition: 'transform 0.1s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <span style={{ fontSize: '13px', lineHeight: 1 }}>🎡</span>
                <span>吃什么</span>
              </button>
            </div>

            {/* 关闭看板 */}
            <button
              onClick={onClose}
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: '#FAF4E8',
                border: '2px solid #502428',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 0 #502428',
              }}
            >
              <X size={15} color="#502428" strokeWidth={3} />
            </button>
          </div>
        )}

        {/* ================= 2. 经典星纹粉红大蝴蝶结 + 悬垂蓝珍珠链 + 两侧斜向长绑带 (100% 深度还原图2原画) ================= */}
        <StarredRibbonBowSVG />

        {/* ================= 3. 主体 3x3 拱门窗格（适度优化高度，杜绝状态栏溢出遮挡） ================= */}
        <div
          style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px 8px',
            padding: '2px 2px 4px',
            position: 'relative',
          }}
        >
          {slotList.map((record, slotIdx) => {
            const isSelected = record && record.id === selectedMealId;
            const colIdx = slotIdx % 3;
            // 三列分色拱门背景（0: 抹茶青绿, 1: 晴空微蓝窗格, 2: 甜粉心动，对齐图2原画）
            const domeBg =
              colIdx === 0
                ? 'linear-gradient(180deg, #EBF8EE 0%, #D8F2DF 100%)'
                : colIdx === 1
                ? 'linear-gradient(180deg, #EFF7FF 0%, #DBEBFC 100%)'
                : 'linear-gradient(180deg, #FFF0F5 0%, #FCE3EC 100%)';

            if (!record) {
              // 空槽位：虚线拱门，点击直接新增
              return (
                <div
                  key={`empty_${slotIdx}`}
                  onClick={() => handleOpenAddSlot(slotIdx)}
                  style={{
                    height: '114px',
                    borderRadius: '24px 24px 10px 10px',
                    border: '2px dashed #C4B5A5',
                    background: 'rgba(255, 255, 255, 0.7)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#FCE7F3',
                      border: '1.5px solid #502428',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Plus size={16} color="#DB2777" strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: '10.5px', fontWeight: 900, color: '#9C7A5B' }}>
                    记一餐
                  </span>
                </div>
              );
            }

            return (
              <div
                key={record.id}
                onClick={() => setSelectedMealId(record.id)} // 问题3：点击触发上方横幅
                style={{
                  height: '114px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                  transition: 'transform 0.15s ease',
                }}
              >
                {/* 拱门窗格主体 (大图饱满、三列特色分色底衬、深褐边框) */}
                <div
                  style={{
                    width: '94px',
                    height: '76px',
                    borderRadius: '24px 24px 10px 10px',
                    background: domeBg,
                    border: isSelected ? '2.5px solid #DB2777' : '2px solid #502428',
                    boxShadow: isSelected
                      ? '0 0 0 2px #FBCFE8, 0 3px 6px rgba(219, 39, 119, 0.25)'
                      : '0 2px 0 #502428',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  {/* 用户自定义上传图片 / 预设手工立绘 (66px 大尺寸展现) */}
                  {record.imageData ? (
                    <img
                      src={record.imageData}
                      alt={record.dishName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    renderPresetIllustration(record.badgeKey, 66)
                  )}

                  {/* 右上角红点提示 +1 (对齐图2) */}
                  {slotIdx % 3 === 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '3px',
                        right: '4px',
                        background: '#EF4444',
                        color: '#FFFFFF',
                        border: '1px solid #502428',
                        borderRadius: '50%',
                        width: '13px',
                        height: '13px',
                        fontSize: '7.5px',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      +1
                    </div>
                  )}
                </div>

                {/* 下面为名称：粉色小缎带 */}
                <div
                  style={{
                    marginTop: '-6px',
                    background: '#FDF2F8',
                    border: '1.5px solid #502428',
                    borderRadius: '7px',
                    padding: '1.5px 7px',
                    fontSize: '10px',
                    fontWeight: 900,
                    color: '#831843',
                    textAlign: 'center',
                    maxWidth: '88px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    boxShadow: '0 1px 0 #502428',
                    zIndex: 2,
                  }}
                >
                  {record.dishName}
                </div>

                {/* 在下面为几颗星：美味程度金星标注 (满分三星) */}
                <div style={{ display: 'flex', gap: '1.5px', marginTop: '2px', alignItems: 'center' }}>
                  {Array.from({ length: record.rating }).map((_, i) => (
                    <Star key={i} size={12} fill="#F59E0B" color="#B45309" />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= 4. 底部分页指示器与左右翻页 (对齐图2) ================= */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            marginTop: '4px',
            width: '100%',
          }}
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              onClick={() => setActivePageIndex(i)}
              style={{
                width: i === activePageIndex ? '14px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: i === activePageIndex ? '#F472B6' : '#E5E7EB',
                border: '1px solid #502428',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* ====== Page 2: 大转盘今天吃什么 ====== */}
      <div
        style={{
          width: '100%',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <MealRouletteView
          records={records}
          onBack={() => setCurrentView('sheet')}
          onSelectMealToLog={handleOpenAddFromRoulette}
        />
      </div>
    </div>
  </div>

        {/* ================= 5. 编辑 / 新增菜品记录弹窗 ================= */}
        {isEditing && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 60,
              background: 'rgba(0, 0, 0, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
            onClick={() => setIsEditing(false)}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '295px',
                background: '#FAF4E8',
                borderRadius: '18px',
                border: '2.5px solid #502428',
                padding: '14px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#502428' }}>
                  记录美食
                </span>
                <button
                  onClick={() => setIsEditing(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#502428' }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* 上传图片槽 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    border: '2px dashed #9C7A5B',
                    background: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {formImageData ? (
                    <img src={formImageData} alt="dish" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Camera size={22} color="#9C7A5B" />
                  )}
                </div>
                <div style={{ fontSize: '11px', color: '#6B4A34', fontWeight: 700 }}>
                  点击选取菜品照片
                </div>
              </div>

              {/* 问题1：日期可自由修改 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#502428' }}>
                  记录日期:
                </span>
                <input
                  type="text"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  placeholder="日期 (如 2026.09.22)"
                  maxLength={12}
                  style={{
                    flex: 1,
                    padding: '5px 8px',
                    borderRadius: '8px',
                    border: '1.5px solid #502428',
                    fontSize: '12px',
                    outline: 'none',
                    fontWeight: 800,
                    color: '#502428',
                  }}
                />
              </div>

              {/* 问题2：选择存放槽位 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#502428' }}>
                  存放槽位:
                </span>
                <select
                  value={editingSlotIndex}
                  onChange={(e) => setEditingSlotIndex(Number(e.target.value))}
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    borderRadius: '8px',
                    border: '1.5px solid #502428',
                    fontSize: '11px',
                    outline: 'none',
                    fontWeight: 800,
                    background: '#FFFFFF',
                    color: '#502428',
                  }}
                >
                  {Array.from({ length: 9 }).map((_, idx) => (
                    <option key={idx} value={idx}>
                      第 {idx + 1} 格 {slotList[idx] ? `(${slotList[idx]?.dishName})` : '(空)'}
                    </option>
                  ))}
                </select>
              </div>

              {/* 餐别选择按钮组 (早餐 / 午餐 / 晚餐 / 加餐) */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFormMealType(type)}
                    style={{
                      flex: 1,
                      padding: '4px 0',
                      borderRadius: '8px',
                      border: '1.5px solid #502428',
                      background: formMealType === type ? '#F472B6' : '#FFFFFF',
                      color: formMealType === type ? '#FFFFFF' : '#502428',
                      fontSize: '11px',
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    {MEAL_TYPE_NAMES[type]}
                  </button>
                ))}
              </div>

              {/* 菜名输入 */}
              <input
                type="text"
                value={formDishName}
                onChange={(e) => setFormDishName(e.target.value)}
                placeholder="菜品名称 (<=5字)"
                maxLength={5}
                style={{
                  padding: '6px 8px',
                  borderRadius: '8px',
                  border: '1.5px solid #502428',
                  fontSize: '12px',
                  outline: 'none',
                  fontWeight: 700,
                }}
              />

              {/* 美味程度星级选择 (满分三星) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#502428' }}>
                  美味星级:
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 3].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFormRating(star)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <Star
                        size={20}
                        fill={star <= formRating ? '#F59E0B' : '#E5E7EB'}
                        color={star <= formRating ? '#B45309' : '#9CA3AF'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* 一句话评价 */}
              <input
                type="text"
                value={formReview}
                onChange={(e) => setFormReview(e.target.value)}
                placeholder="一句话评价 (如: 汤鲜味美)"
                maxLength={25}
                style={{
                  padding: '6px 8px',
                  borderRadius: '8px',
                  border: '1.5px solid #502428',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />

              {/* 操作按键组 */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  onClick={handleSaveForm}
                  style={{
                    flex: 1,
                    padding: '7px 0',
                    borderRadius: '10px',
                    background: '#F472B6',
                    border: '2px solid #502428',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 0 #502428',
                  }}
                >
                  保存
                </button>

                {slotList[editingSlotIndex] && (
                  <button
                    onClick={handleDeleteSelected}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '10px',
                      background: '#FEE2E2',
                      border: '2px solid #502428',
                      color: '#DC2626',
                      fontWeight: 900,
                      fontSize: '12px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 0 #502428',
                    }}
                  >
                    删除
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 轻量 Toast 提示 */}
        {toastMsg && (
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              background: '#502428',
              color: '#FFFFFF',
              padding: '5px 14px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 900,
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              zIndex: 70,
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
