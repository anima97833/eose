import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Camera, Sparkles, Clock, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { RPGItem } from '../../../../core/rpg/types';
import { getAllItemImages, saveItemImage, deleteItemImage } from '../../../../core/rpg/itemImageStorage';
import { WishWandIcon } from './WishWandIcon';

interface InventorySheetProps {
  items: RPGItem[];
  wishVouchers?: number;
  onToggleEquip: (id: string) => void;
  onUseConsumable: (id: string) => void;
  onRedeemWish?: (id: string) => void;
  onChangeWishVouchers?: (delta: number) => void;
  onAddItem: (item: RPGItem) => void;
  onDeleteItem: (id: string) => void;
  onClose: () => void;
}

export const InventorySheet: React.FC<InventorySheetProps> = ({
  items,
  wishVouchers = 15,
  onToggleEquip,
  onUseConsumable,
  onRedeemWish,
  onChangeWishVouchers,
  onAddItem,
  onDeleteItem,
  onClose,
}) => {
  // 当前选项卡：装备 (gear) 或 心愿 (wish)
  const [tab, setTab] = useState<'gear' | 'wish'>('gear');
  // 当前分页（每页最多 3 个物品）
  const [page, setPage] = useState(1);
  
  // IndexedDB 中的物品大图映射：{ [itemId]: base64DataUrl }
  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  
  // 弹窗与新增状态
  const [isAdding, setIsAdding] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RPGItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 新增表单状态
  const [newName, setNewName] = useState('');
  const [newEffect, setNewEffect] = useState('');
  const [newCount, setNewCount] = useState(1);
  const [newImageData, setNewImageData] = useState<string | null>(null);
  const [newIconEmoji, setNewIconEmoji] = useState('🎁');
  // 心愿专属表单状态
  const [newWishCost, setNewWishCost] = useState(10);
  const [newWishNote, setNewWishNote] = useState('');

  // 文件上传引用
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeUploadItemIdRef = useRef<string | null>(null);
  const newAddFileInputRef = useRef<HTMLInputElement | null>(null);

  // 显示简短提示 (<= 5 字)
  const showToast = (msg: string) => {
    setToastMsg(msg.slice(0, 5));
    setTimeout(() => {
      setToastMsg(null);
    }, 1800);
  };

  // 初始化从 IndexedDB 加载全部物品自定义大图
  useEffect(() => {
    let isMounted = true;
    getAllItemImages().then((map) => {
      if (isMounted) {
        setImageMap(map);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 处理单个卡片上传/更换大图至 IndexedDB
  const handleTriggerUpload = (itemId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    activeUploadItemIdRef.current = itemId;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const itemId = activeUploadItemIdRef.current;
    if (!file || !itemId) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      await saveItemImage(itemId, dataUrl);
      setImageMap((prev) => ({ ...prev, [itemId]: dataUrl }));
      showToast('图片已存入');
    };
    reader.readAsDataURL(file);

    // 重置 input 以允许再次选择同名文件
    e.target.value = '';
  };

  // 新增表单的图片上传
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

  // 创建新物品或心愿
  const handleCreate = async () => {
    if (!newName.trim()) return;
    const isWish = tab === 'wish';
    const id = isWish ? `wish_${Date.now()}` : `item_${Date.now()}`;
    const newItem: RPGItem = {
      id,
      name: newName.trim(), // 心愿允许完整名称
      type: tab,
      icon: isWish ? '🪄' : (newIconEmoji.trim() || '🛡️'),
      effect: isWish ? (newWishNote.trim() || '期待实现的愿望') : (newEffect.trim() || '属性加成'),
      equipped: false,
      wishVouchersCost: isWish ? Math.max(1, Number(newWishCost) || 10) : undefined,
      lockedUntil: isWish ? Date.now() + 7 * 24 * 3600 * 1000 : undefined, // 7 天冷静期
      wishNote: isWish ? newWishNote.trim() : undefined,
      isAchieved: false,
    };

    // 如果上传了大图，存入 IndexedDB
    if (newImageData) {
      await saveItemImage(id, newImageData);
      setImageMap((prev) => ({ ...prev, [id]: newImageData }));
    }

    onAddItem(newItem);
    showToast(isWish ? '心愿已许下' : '添加成功');
    setNewName('');
    setNewEffect('');
    setNewWishNote('');
    setNewWishCost(10);
    setNewImageData(null);
    setNewCount(1);
    setIsAdding(false);
  };

  // 兑换心愿
  const handleRedeem = (item: RPGItem) => {
    const cost = item.wishVouchersCost || 10;
    if (wishVouchers < cost) {
      showToast(`还差 ${cost - wishVouchers} 张券`);
      return;
    }
    if (onRedeemWish) {
      onRedeemWish(item.id);
    }
    setSelectedItem((prev) => prev ? { ...prev, isAchieved: true, achievedAt: Date.now() } : null);
    showToast('✨ 愿望成真！');
  };

  // 删除物品（同时清理 IndexedDB 图片）
  const handleDelete = async (itemId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await deleteItemImage(itemId);
    setImageMap((prev) => {
      const copy = { ...prev };
      delete copy[itemId];
      return copy;
    });
    onDeleteItem(itemId);
    if (selectedItem?.id === itemId) {
      setSelectedItem(null);
    }
    showToast('已移除');
  };

  // 清除单个物品自定义图片并恢复默认
  const handleClearImage = async (itemId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await deleteItemImage(itemId);
    setImageMap((prev) => {
      const copy = { ...prev };
      delete copy[itemId];
      return copy;
    });
    showToast('已清图片');
  };

  const filteredItems = items.filter((item) =>
    tab === 'gear' ? item.type === 'gear' : (item.type === 'wish' || item.type === 'consumable')
  );

  // 严格要求：一页最多 3 个（不折行堆叠）
  const ITEMS_PER_PAGE = 3;
  type SlotItem = { isAddSlot: false; item: RPGItem } | { isAddSlot: true; id: string };
  const allSlots: SlotItem[] = [
    ...filteredItems.map((it) => ({ isAddSlot: false as const, item: it })),
    { isAddSlot: true as const, id: '__ADD_SLOT__' },
  ];
  const totalPages = Math.max(1, Math.ceil(allSlots.length / ITEMS_PER_PAGE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const currentPageSlots = allSlots.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );


  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 85,
        background: 'rgba(38, 30, 55, 0.55)',
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
            background: 'rgba(58, 43, 85, 0.95)',
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

      {/* 主抽屉弹窗（参考图2卡片滑出形态） */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxHeight: '84%',
          background: '#BAC0F4',
          borderTopLeftRadius: '26px',
          borderTopRightRadius: '26px',
          border: '3px solid #50446F',
          borderBottom: 'none',
          boxShadow: '0 -10px 35px rgba(45, 35, 70, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          animation: 'slideUpSpring 0.35s cubic-bezier(0.18, 0.9, 0.32, 1.25)',
        }}
      >
        {/* ================= 顶部文件夹式选项卡（对齐参考图 Donut / Outfit） ================= */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            padding: '0 14px',
            marginTop: '-36px',
            gap: '8px',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* 装备 Tab */}
          <button
            onClick={() => {
              setTab('gear');
              setPage(1);
              setIsAdding(false);
            }}
            style={{
              padding: '8px 24px 7px',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              border: '3px solid #50446F',
              borderBottom: tab === 'gear' ? 'none' : '3px solid #50446F',
              background: tab === 'gear' ? '#BAC0F4' : '#8F97D3',
              color: tab === 'gear' ? '#3B2E58' : '#4E436D',
              fontWeight: 900,
              fontSize: '15px',
              cursor: 'pointer',
              fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
              boxShadow: tab === 'gear' ? 'none' : 'inset 0 -3px 6px rgba(0,0,0,0.12)',
              position: 'relative',
              transition: 'all 0.15s ease',
            }}
          >
            装备
          </button>

          {/* 心愿 Tab (替换原补给) */}
          <button
            onClick={() => {
              setTab('wish');
              setPage(1);
              setIsAdding(false);
            }}
            style={{
              padding: '8px 20px 7px',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              border: '3px solid #50446F',
              borderBottom: tab === 'wish' ? 'none' : '3px solid #50446F',
              background: tab === 'wish' ? '#BAC0F4' : '#8F97D3',
              color: tab === 'wish' ? '#3B2E58' : '#4E436D',
              fontWeight: 900,
              fontSize: '15px',
              cursor: 'pointer',
              fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
              boxShadow: tab === 'wish' ? 'none' : 'inset 0 -3px 6px rgba(0,0,0,0.12)',
              position: 'relative',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <WishWandIcon size={16} />
            <span>心愿</span>
            {tab !== 'wish' && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#EF4444',
                  border: '2px solid #50446F',
                }}
              />
            )}
          </button>

          {/* 右侧关闭按钮 */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <button
              onClick={onClose}
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                border: '2px solid #50446F',
                background: '#FFF9E6',
                color: '#50446F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 0 #50446F',
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* ================= 新增自定义物品面板 ================= */}
        {isAdding && (
          <div
            style={{
              margin: '10px 14px 4px',
              padding: '12px',
              background: '#FFFFFF',
              borderRadius: '18px',
              border: '2.5px solid #50446F',
              boxShadow: '0 4px 10px rgba(80, 68, 111, 0.15)',
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
              {/* 点击上传大图预览槽 */}
              <div
                onClick={() => newAddFileInputRef.current?.click()}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '14px',
                  border: '2px dashed #8F97D3',
                  background: '#F7F8FE',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  flexShrink: 0,
                  position: 'relative',
                }}
              >
                {newImageData ? (
                  <img
                    src={newImageData}
                    alt="preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <>
                    <Camera size={18} color="#6C72B9" />
                    <span style={{ fontSize: '10px', color: '#6C72B9', fontWeight: 800, marginTop: '2px' }}>
                      选图
                    </span>
                  </>
                )}
              </div>

              {/* 物品名与效果/心愿自拟项 */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    placeholder={tab === 'wish' ? "心愿名称 (如: 降噪耳机、大餐)" : "名称(<=5字)"}
                    maxLength={tab === 'wish' ? 20 : 5}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: '10px',
                      border: '1.5px solid #50446F',
                      fontSize: '12px',
                      fontWeight: 700,
                      outline: 'none',
                      color: '#3B2E58',
                    }}
                  />
                  {tab === 'gear' && (
                    <input
                      type="text"
                      placeholder="表情"
                      maxLength={2}
                      value={newIconEmoji}
                      onChange={(e) => setNewIconEmoji(e.target.value)}
                      style={{
                        width: '42px',
                        textAlign: 'center',
                        padding: '6px 4px',
                        borderRadius: '10px',
                        border: '1.5px solid #50446F',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                  )}
                </div>

                {tab === 'wish' ? (
                  <>
                    {/* 心愿自拟券数输入区 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '11px',
                          fontWeight: 800,
                          color: '#713F12',
                        }}
                      >
                        <WishWandIcon size={14} />
                        <span>心愿券:</span>
                      </div>
                      <input
                        type="number"
                        min={1}
                        max={999}
                        value={newWishCost}
                        onChange={(e) => setNewWishCost(Math.max(1, parseInt(e.target.value) || 1))}
                        style={{
                          width: '54px',
                          padding: '4px 6px',
                          textAlign: 'center',
                          borderRadius: '8px',
                          border: '1.5px solid #D97706',
                          background: '#FEF9C3',
                          fontSize: '12px',
                          fontWeight: 900,
                          color: '#78350F',
                          outline: 'none',
                        }}
                      />
                      {/* 快捷自拟气泡 */}
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {[5, 10, 20, 50].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setNewWishCost(v)}
                            style={{
                              padding: '2px 5px',
                              borderRadius: '6px',
                              border: '1px solid #D97706',
                              background: newWishCost === v ? '#FDE047' : '#FFFFFF',
                              color: '#713F12',
                              fontSize: '10px',
                              fontWeight: 800,
                              cursor: 'pointer',
                            }}
                          >
                            {v}张
                          </button>
                        ))}
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="许愿寄语 (如: 达成目标后奖励自己)"
                      maxLength={25}
                      value={newWishNote}
                      onChange={(e) => setNewWishNote(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '5px 8px',
                        borderRadius: '8px',
                        border: '1.5px solid #50446F',
                        fontSize: '11px',
                        outline: 'none',
                        color: '#3B2E58',
                        boxSizing: 'border-box',
                      }}
                    />

                    <div style={{ fontSize: '9px', color: '#B45309', fontWeight: 600 }}>
                      🔒 拟定后进入 7 天防冲动冷静期，期间不可调低券数
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      placeholder="加成或描述 (<=5字)"
                      maxLength={5}
                      value={newEffect}
                      onChange={(e) => setNewEffect(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        borderRadius: '10px',
                        border: '1.5px solid #50446F',
                        fontSize: '12px',
                        outline: 'none',
                        color: '#3B2E58',
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  borderRadius: '12px',
                  background: newName.trim() ? '#4ADE80' : '#E2E8F0',
                  color: newName.trim() ? '#14532D' : '#94A3B8',
                  border: '2px solid #50446F',
                  fontWeight: 900,
                  fontSize: '13px',
                  cursor: newName.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: '0 2px 0 #50446F',
                }}
              >
                {tab === 'wish' ? '许下心愿' : '保存新物'}
              </button>
              <button
                onClick={() => setIsAdding(false)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '12px',
                  background: '#F1F5F9',
                  color: '#64748B',
                  border: '2px solid #50446F',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 0 #50446F',
                }}
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* ================= 核心 3 列网格卡片（单行 3 格，绝不挤压） ================= */}
        <div
          style={{
            padding: '14px 14px 10px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            alignItems: 'stretch',
          }}
        >
          {currentPageSlots.map((slot, idx) => {
            // 如果是添物品槽位
            if (slot.isAddSlot) {
              return (
                <div
                  key="add_slot"
                  onClick={() => setIsAdding(true)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.45)',
                    borderRadius: '20px',
                    border: '2.5px dashed #8F97D3',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px 8px',
                    cursor: 'pointer',
                    minHeight: '168px',
                    gap: '8px',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      border: '2px solid #50446F',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#50446F',
                      boxShadow: '0 2px 0 #50446F',
                    }}
                  >
                    <Plus size={22} />
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 900,
                      color: '#4E436D',
                      fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
                    }}
                  >
                    添物品
                  </span>
                </div>
              );
            }

            // 正常物品卡片
            const item = slot.item;
            const hasCustomImage = !!imageMap[item.id] || !!item.imageUrl;
            const imgSrc = imageMap[item.id] || item.imageUrl;
            const isEquipped = !!item.equipped;
            const isSpecialGlow = idx === 2;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                style={{
                  background: isEquipped ? '#F0FDF4' : '#FFFFFF',
                  borderRadius: '20px',
                  border: isEquipped
                    ? '2.5px solid #82D852'
                    : isSpecialGlow
                    ? '2.5px solid #67C8F2'
                    : '2.5px solid #F5B6BC',
                  boxShadow: isEquipped
                    ? '0 4px 12px rgba(130, 216, 82, 0.35)'
                    : '0 4px 8px rgba(80, 68, 111, 0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '8px 6px 10px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '168px',
                  justifyContent: 'space-between',
                  transition: 'transform 0.12s ease',
                }}
              >
                {/* 顶部右侧：更换大图相机小徽章 */}
                <button
                  type="button"
                  onClick={(e) => handleTriggerUpload(item.id, e)}
                  title="上传图片"
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    zIndex: 15,
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.92)',
                    border: '1.5px solid #50446F',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  }}
                >
                  <Camera size={11} color="#50446F" />
                </button>

                {/* 顶部左侧：删除快捷微标 */}
                <button
                  type="button"
                  onClick={(e) => handleDelete(item.id, e)}
                  title="删除物品"
                  style={{
                    position: 'absolute',
                    top: '5px',
                    left: '5px',
                    zIndex: 15,
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.92)',
                    border: '1.5px solid #F87171',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  }}
                >
                  <Trash2 size={10} color="#EF4444" />
                </button>

                {/* ================= 1. 大图在上 (Big Image Container) ================= */}
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    borderRadius: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    background: isEquipped
                      ? 'radial-gradient(circle, #DCFCE7 30%, #F0FDF4 100%)'
                      : isSpecialGlow
                      ? 'radial-gradient(circle, #E0F2FE 30%, #BAE6FD 100%)'
                      : 'radial-gradient(circle, #FFF1F2 30%, #FFE4E6 100%)',
                  }}
                >
                  {/* 光芒射线纹理效果 (SVG 装饰) */}
                  <svg
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0.28,
                      pointerEvents: 'none',
                    }}
                    viewBox="0 0 100 100"
                  >
                    <g fill={isSpecialGlow ? '#38BDF8' : isEquipped ? '#4ADE80' : '#FB7185'}>
                      <polygon points="50,50 38,0 62,0" />
                      <polygon points="50,50 100,38 100,62" />
                      <polygon points="50,50 62,100 38,100" />
                      <polygon points="50,50 0,62 0,38" />
                      <polygon points="50,50 82,18 95,30" />
                      <polygon points="50,50 95,70 82,82" />
                      <polygon points="50,50 18,82 5,70" />
                      <polygon points="50,50 5,30 18,18" />
                    </g>
                  </svg>

                  {/* 用户已上传的真实大图 (存储在 IndexedDB 中) */}
                  {hasCustomImage ? (
                    <img
                      src={imgSrc}
                      alt={item.name}
                      style={{
                        width: '88%',
                        height: '88%',
                        objectFit: 'contain',
                        zIndex: 2,
                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))',
                      }}
                    />
                  ) : (
                    /* 默认大尺寸手绘质感 Emoji/矢量表现 */
                    <div
                      style={{
                        fontSize: '44px',
                        zIndex: 2,
                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.12))',
                        userSelect: 'none',
                      }}
                    >
                      {item.icon}
                    </div>
                  )}

                  {/* 心愿 7 天冷静期保护微标 (置于大图内部左下角，绝不脱出压盖下方按钮) */}
                  {tab === 'wish' && !item.isAchieved && item.lockedUntil && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '5px',
                        left: '5px',
                        zIndex: 10,
                        padding: '2px 5px',
                        borderRadius: '6px',
                        background: 'rgba(59, 46, 88, 0.9)',
                        color: '#FEF08A',
                        fontSize: '9px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                      }}
                    >
                      <Clock size={9} color="#FEF08A" />
                      <span>
                        {Date.now() < item.lockedUntil
                          ? `剩${Math.max(1, Math.ceil((item.lockedUntil - Date.now()) / (24 * 3600 * 1000)))}天`
                          : '可圆满'}
                      </span>
                    </div>
                  )}
                </div>

                {/* ================= 2. 文字在下 (Text & Action Button) ================= */}
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: '6px',
                    gap: '4px',
                  }}
                >
                  {/* 物品/心愿名称 */}
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#42325E',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                      fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
                    }}
                  >
                    {item.name}
                  </span>

                  {/* 底部胶囊按键：心愿模式展示自拟心愿券数目 */}
                  {item.type === 'gear' ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleEquip(item.id);
                      }}
                      style={{
                        width: '100%',
                        padding: '4px 0',
                        borderRadius: '14px',
                        border: isEquipped ? '1.5px solid #65A30D' : '1.5px solid #D9A05B',
                        background: isEquipped ? '#D9F99D' : '#FEF3C7',
                        color: isEquipped ? '#365314' : '#78350F',
                        fontSize: '11px',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: isEquipped ? '0 2px 0 #65A30D' : '0 2px 0 #D9A05B',
                        transition: 'all 0.1s ease',
                      }}
                    >
                      {isEquipped ? '已穿戴' : '穿戴'}
                    </button>
                  ) : (
                    /* 心愿模式下的专属心愿券胶囊按钮 (点击查看与兑换) */
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                      style={{
                        width: '100%',
                        padding: '4px 0',
                        borderRadius: '14px',
                        border: item.isAchieved ? '1.5px solid #65A30D' : '1.5px solid #D97706',
                        background: item.isAchieved
                          ? '#D9F99D'
                          : 'linear-gradient(135deg, #FEF08A, #FDE047)',
                        color: item.isAchieved ? '#365314' : '#78350F',
                        fontSize: '11px',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: item.isAchieved ? '0 2px 0 #65A30D' : '0 2px 0 #D97706',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px',
                        transition: 'all 0.1s ease',
                      }}
                    >
                      {item.isAchieved ? (
                        <>
                          <CheckCircle2 size={11} color="#365314" />
                          <span>已圆满</span>
                        </>
                      ) : (
                        <>
                          <WishWandIcon size={13} />
                          <span>{item.wishVouchersCost || 10} 张</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= 底部轻拟物便签翻页器 ================= */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              padding: '4px 14px 18px',
            }}
          >
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: safePage <= 1 ? '#D1D5DB' : '#FFFFFF',
                color: safePage <= 1 ? '#9CA3AF' : '#50446F',
                border: '2px solid #50446F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
                boxShadow: safePage <= 1 ? 'none' : '0 2px 0 #50446F',
                transition: 'all 0.1s ease',
              }}
            >
              <ChevronLeft size={18} />
            </button>

            <div
              style={{
                padding: '4px 14px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.75)',
                border: '1.5px solid #50446F',
                fontSize: '12px',
                fontWeight: 900,
                color: '#50446F',
                boxShadow: '0 2px 0 rgba(80, 68, 111, 0.15)',
                fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
              }}
            >
              第 {safePage} / {totalPages} 页
            </div>

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: safePage >= totalPages ? '#D1D5DB' : '#FFFFFF',
                color: safePage >= totalPages ? '#9CA3AF' : '#50446F',
                border: '2px solid #50446F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
                boxShadow: safePage >= totalPages ? 'none' : '0 2px 0 #50446F',
                transition: 'all 0.1s ease',
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* ================= 物品详情与图片管理微弹窗 ================= */}
        {selectedItem && (
          <div
            onClick={() => setSelectedItem(null)}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 90,
              background: 'rgba(38, 30, 55, 0.6)',
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
                background: '#FFFFFF',
                borderRadius: '24px',
                border: '3px solid #50446F',
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
                onClick={() => setSelectedItem(null)}
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

              {/* 大图展示区 */}
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '18px',
                  border: '2px solid #50446F',
                  background: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {imageMap[selectedItem.id] || selectedItem.imageUrl ? (
                  <img
                    src={imageMap[selectedItem.id] || selectedItem.imageUrl}
                    alt={selectedItem.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <span style={{ fontSize: '42px' }}>{selectedItem.icon}</span>
                )}
              </div>

              {/* 物品名称与加成 */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#3B2E58' }}>
                  {selectedItem.name}
                </div>
                <div style={{ fontSize: '12px', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                  {selectedItem.effect}
                </div>
              </div>

              {/* 心愿券与冷静期信息展示 */}
              {selectedItem.type !== 'gear' && (
                <div
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '14px',
                    background: '#FEF9C3',
                    border: '1.5px solid #F59E0B',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    boxSizing: 'border-box',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 900, color: '#78350F', fontSize: '12px' }}>
                      <WishWandIcon size={15} />
                      <span>兑换门槛: {selectedItem.wishVouchersCost || 10} 张</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#B45309', fontWeight: 800 }}>
                      持有: {wishVouchers} 张
                    </span>
                  </div>

                  {selectedItem.lockedUntil && (
                    <div style={{ fontSize: '10px', color: '#92400E', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={11} color="#B45309" />
                      <span>
                        {Date.now() < selectedItem.lockedUntil
                          ? `7天防冲动冷静期中 · 剩余 ${Math.max(1, Math.ceil((selectedItem.lockedUntil - Date.now()) / (24 * 3600 * 1000)))} 天`
                          : '✨ 冷静期已满，理性审视后依然心动，随时兑换！'}
                      </span>
                    </div>
                  )}

                  {selectedItem.wishNote && (
                    <div style={{ fontSize: '11px', color: '#4B5563', fontStyle: 'italic', marginTop: '2px' }}>
                      “{selectedItem.wishNote}”
                    </div>
                  )}
                </div>
              )}

              {/* 图片操作按键 */}
              <div style={{ width: '100%', display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleTriggerUpload(selectedItem.id)}
                  style={{
                    flex: 1,
                    padding: '7px 0',
                    borderRadius: '12px',
                    background: '#818CF8',
                    color: '#FFFFFF',
                    border: '2px solid #50446F',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 0 #50446F',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <Camera size={13} />
                  <span>传大图</span>
                </button>

                {(imageMap[selectedItem.id] || selectedItem.imageUrl) && (
                  <button
                    onClick={() => handleClearImage(selectedItem.id)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '12px',
                      background: '#F1F5F9',
                      color: '#EF4444',
                      border: '2px solid #50446F',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 2px 0 #50446F',
                    }}
                  >
                    恢复默认
                  </button>
                )}
              </div>

              {/* 穿戴/心愿券兑换按键 (替换原使用按钮) */}
              <div style={{ width: '100%', display: 'flex', gap: '8px' }}>
                {selectedItem.type === 'gear' ? (
                  <button
                    onClick={() => {
                      onToggleEquip(selectedItem.id);
                      setSelectedItem((prev) => prev ? { ...prev, equipped: !prev.equipped } : null);
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: '14px',
                      border: '2px solid #50446F',
                      background: selectedItem.equipped ? '#FCA5A5' : '#86EFAC',
                      color: selectedItem.equipped ? '#7F1D1D' : '#14532D',
                      fontSize: '13px',
                      fontWeight: 900,
                      cursor: 'pointer',
                      boxShadow: '0 2px 0 #50446F',
                    }}
                  >
                    {selectedItem.equipped ? '卸下' : '穿戴'}
                  </button>
                ) : selectedItem.isAchieved ? (
                  <button
                    disabled
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: '14px',
                      border: '2px solid #50446F',
                      background: '#D9F99D',
                      color: '#365314',
                      fontSize: '13px',
                      fontWeight: 900,
                      boxShadow: '0 2px 0 #50446F',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <CheckCircle2 size={15} color="#365314" />
                    <span>愿望已圆满达成</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleRedeem(selectedItem)}
                    disabled={wishVouchers < (selectedItem.wishVouchersCost || 10)}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: '14px',
                      border: '2px solid #50446F',
                      background: wishVouchers >= (selectedItem.wishVouchersCost || 10)
                        ? 'linear-gradient(135deg, #FDE047, #F59E0B)'
                        : '#E2E8F0',
                      color: wishVouchers >= (selectedItem.wishVouchersCost || 10)
                        ? '#78350F'
                        : '#94A3B8',
                      fontSize: '13px',
                      fontWeight: 900,
                      cursor: wishVouchers >= (selectedItem.wishVouchersCost || 10) ? 'pointer' : 'not-allowed',
                      boxShadow: '0 2px 0 #50446F',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <WishWandIcon size={16} />
                    <span>
                      {wishVouchers >= (selectedItem.wishVouchersCost || 10)
                        ? `消耗 ${selectedItem.wishVouchersCost || 10} 张券兑换`
                        : `还差 ${(selectedItem.wishVouchersCost || 10) - wishVouchers} 张心愿券`}
                    </span>
                  </button>
                )}

                <button
                  onClick={() => handleDelete(selectedItem.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '14px',
                    border: '2px solid #50446F',
                    background: '#FEE2E2',
                    color: '#DC2626',
                    fontSize: '13px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 2px 0 #50446F',
                  }}
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 动画关键帧 */}
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
