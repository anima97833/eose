import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Camera } from 'lucide-react';
import { RPGItem } from '../../../../core/rpg/types';
import { getAllItemImages, saveItemImage, deleteItemImage } from '../../../../core/rpg/itemImageStorage';

interface InventorySheetProps {
  items: RPGItem[];
  onToggleEquip: (id: string) => void;
  onUseConsumable: (id: string) => void;
  onAddItem: (item: RPGItem) => void;
  onDeleteItem: (id: string) => void;
  onClose: () => void;
}

export const InventorySheet: React.FC<InventorySheetProps> = ({
  items,
  onToggleEquip,
  onUseConsumable,
  onAddItem,
  onDeleteItem,
  onClose,
}) => {
  // 当前选项卡：装备 (Outfit) 或 补给 (Donut)
  const [tab, setTab] = useState<'gear' | 'consumable'>('gear');
  
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

  // 创建新物品
  const handleCreate = async () => {
    if (!newName.trim()) return;
    const id = `item_${Date.now()}`;
    const newItem: RPGItem = {
      id,
      name: newName.trim().slice(0, 5), // <= 5 字
      type: tab,
      icon: newIconEmoji.trim() || (tab === 'gear' ? '🛡️' : '🍰'),
      effect: newEffect.trim().slice(0, 10) || (tab === 'gear' ? '属性加成' : '恢复状态'),
      equipped: false,
      count: tab === 'consumable' ? Math.max(1, Number(newCount) || 1) : undefined,
    };

    // 如果上传了大图，存入 IndexedDB
    if (newImageData) {
      await saveItemImage(id, newImageData);
      setImageMap((prev) => ({ ...prev, [id]: newImageData }));
    }

    onAddItem(newItem);
    showToast('添加成功');
    setNewName('');
    setNewEffect('');
    setNewImageData(null);
    setNewCount(1);
    setIsAdding(false);
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
    showToast('物品已删除');
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

  const filteredItems = items.filter((item) => item.type === tab);

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

          {/* 补给 Tab */}
          <button
            onClick={() => {
              setTab('consumable');
              setIsAdding(false);
            }}
            style={{
              padding: '8px 24px 7px',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              border: '3px solid #50446F',
              borderBottom: tab === 'consumable' ? 'none' : '3px solid #50446F',
              background: tab === 'consumable' ? '#BAC0F4' : '#8F97D3',
              color: tab === 'consumable' ? '#3B2E58' : '#4E436D',
              fontWeight: 900,
              fontSize: '15px',
              cursor: 'pointer',
              fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
              boxShadow: tab === 'consumable' ? 'none' : 'inset 0 -3px 6px rgba(0,0,0,0.12)',
              position: 'relative',
              transition: 'all 0.15s ease',
            }}
          >
            补给
            {/* 参考图右上角红色提醒圆点 */}
            {tab !== 'consumable' && (
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

          {/* 右侧操作按钮组：新增 & 关闭 */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <button
              onClick={() => setIsAdding(!isAdding)}
              style={{
                padding: '4px 12px',
                borderRadius: '12px',
                border: '2px solid #50446F',
                background: isAdding ? '#F87171' : '#FFF9E6',
                color: isAdding ? '#FFFFFF' : '#50446F',
                fontWeight: 800,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                boxShadow: '0 2px 0 #50446F',
              }}
            >
              {isAdding ? <X size={12} /> : <Plus size={12} />}
              <span>{isAdding ? '取消' : '添物品'}</span>
            </button>

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

              {/* 物品名与效果 */}
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
                      borderRadius: '10px',
                      border: '1.5px solid #50446F',
                      fontSize: '12px',
                      fontWeight: 700,
                      outline: 'none',
                      color: '#3B2E58',
                    }}
                  />
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
                </div>

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
                  {tab === 'consumable' && (
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={newCount}
                      onChange={(e) => setNewCount(parseInt(e.target.value) || 1)}
                      style={{
                        width: '46px',
                        padding: '6px 4px',
                        textAlign: 'center',
                        borderRadius: '10px',
                        border: '1.5px solid #50446F',
                        fontSize: '12px',
                        fontWeight: 700,
                        outline: 'none',
                      }}
                    />
                  )}
                </div>
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
                保存新物
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

        {/* ================= 核心 3 列网格卡片（文字在下，大图在上） ================= */}
        <div
          style={{
            padding: '12px 14px 28px',
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            maxHeight: '62vh',
          }}
        >
          {filteredItems.map((item, idx) => {
            const hasCustomImage = !!imageMap[item.id] || !!item.imageUrl;
            const imgSrc = imageMap[item.id] || item.imageUrl;
            const isEquipped = !!item.equipped;

            // 针对参考图的斑斓背景色：第3、6张青色太阳光芒，已装备绿色高亮
            const isSpecialGlow = idx === 2 || idx === 5;

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
                  padding: '8px 6px 9px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.12s ease',
                }}
              >
                {/* 顶部右侧：更换大图相机小徽章 */}
                <button
                  onClick={(e) => handleTriggerUpload(item.id, e)}
                  title="上传图片"
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    zIndex: 5,
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.88)',
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
                  onClick={(e) => handleDelete(item.id, e)}
                  title="删除物品"
                  style={{
                    position: 'absolute',
                    top: '5px',
                    left: '5px',
                    zIndex: 5,
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.88)',
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
                    // 渐变与光芒背景（对齐参考图中的阳光射线条纹与浅色圆环）
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
                  {/* 物品名称 (<= 5 字) */}
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

                  {/* 底部胶囊按键 (严密对齐参考图中的 Equip / Equipped / 按钮样式) */}
                  {item.type === 'gear' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleEquip(item.id);
                      }}
                      style={{
                        width: '100%',
                        padding: '4px 0',
                        borderRadius: '14px',
                        border: isEquipped ? '1.5px solid #65A30D' : '1.5px solid #D9A05B',
                        background: isEquipped
                          ? '#D9F99D' // 对应参考图中的草莓蛋糕绿色 Equipped
                          : '#FEF3C7', // 对应参考图中的米黄 Equip 胶囊
                        color: isEquipped ? '#365314' : '#78350F',
                        fontSize: '11px',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: isEquipped
                          ? '0 2px 0 #65A30D'
                          : '0 2px 0 #D9A05B',
                        transition: 'all 0.1s ease',
                      }}
                    >
                      {isEquipped ? '已穿戴' : '穿戴'}
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUseConsumable(item.id);
                      }}
                      disabled={!item.count || item.count <= 0}
                      style={{
                        width: '100%',
                        padding: '4px 0',
                        borderRadius: '14px',
                        border: '1.5px solid #D9A05B',
                        background: item.count && item.count > 0 ? '#FEF3C7' : '#E2E8F0',
                        color: item.count && item.count > 0 ? '#78350F' : '#94A3B8',
                        fontSize: '11px',
                        fontWeight: 900,
                        cursor: item.count && item.count > 0 ? 'pointer' : 'not-allowed',
                        boxShadow: '0 2px 0 #D9A05B',
                      }}
                    >
                      {item.count ? `使用(${item.count})` : '已耗尽'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* 网格末尾：添物品快捷卡片 */}
          <div
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
              minHeight: '130px',
              gap: '6px',
              transition: 'background 0.15s ease',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
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
              <Plus size={20} />
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 900,
                color: '#4E436D',
                fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", sans-serif',
              }}
            >
              添物品
            </span>
          </div>
        </div>

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

              {/* 穿戴/使用按键 */}
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
                ) : (
                  <button
                    onClick={() => {
                      onUseConsumable(selectedItem.id);
                      setSelectedItem(null);
                    }}
                    disabled={!selectedItem.count || selectedItem.count <= 0}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: '14px',
                      border: '2px solid #50446F',
                      background: '#FEF08A',
                      color: '#713F12',
                      fontSize: '13px',
                      fontWeight: 900,
                      cursor: 'pointer',
                      boxShadow: '0 2px 0 #50446F',
                    }}
                  >
                    使用
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
