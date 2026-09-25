import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Zap, Check, MapPin, Plus, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { IScannerControls } from '@zxing/browser';
import { PhysicalBookRecord } from '../../../../core/books/bookTypes';
import {
  startCameraStream,
  stopCameraStream,
  playScannerBeep,
  createZXingReader,
  decodeBarcodeFromFile,
  normalizeISBN,
} from '../../../../core/books/scannerEngine';
import { fetchBookByISBN } from '../../../../core/books/bookApi';
import {
  getSavedPhysicalLocations,
  savePhysicalLocation,
  updatePhysicalLocation,
  deletePhysicalLocation,
} from '../../../../core/books/bookStorage';
import { NM } from '../bookNeumorphism';
import { LocationManagerModal } from './LocationManagerModal';
import { Settings } from 'lucide-react';

interface ContinuousScannerModalProps {
  onClose: () => void;
  onBookScanned: (book: PhysicalBookRecord) => void;
  onOpenManualAdd?: () => void;
}

// 供快捷测试演示的常见图书真实 ISBN
const SAMPLE_TEST_ISBNS = [
  { name: '《三体》', isbn: '9787536692930' },
  { name: '《解忧杂货店》', isbn: '9787544270878' },
  { name: '《活着》', isbn: '9787506365437' },
  { name: '《百年孤独》', isbn: '9787544253994' },
  { name: '《人类简史》', isbn: '9787508647357' },
];

export const ContinuousScannerModal: React.FC<ContinuousScannerModalProps> = ({
  onClose,
  onBookScanned,
  onOpenManualAdd,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedQueue, setScannedQueue] = useState<PhysicalBookRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDecodingPhoto, setIsDecodingPhoto] = useState<boolean>(false);

  // 物理书架位置
  const [locations, setLocations] = useState<string[]>(getSavedPhysicalLocations());
  const [currentLocation, setCurrentLocation] = useState<string>(locations[0] || '客厅书柜A1');
  const [isAddingLocation, setIsAddingLocation] = useState<boolean>(false);
  const [newLocationInput, setNewLocationInput] = useState<string>('');
  const [isLocManagerOpen, setIsLocManagerOpen] = useState<boolean>(false);

  const handleLocAdd = (name: string) => {
    savePhysicalLocation(name);
    const updated = getSavedPhysicalLocations();
    setLocations(updated);
    setCurrentLocation(name);
  };

  const handleLocUpdate = async (oldName: string, newName: string) => {
    await updatePhysicalLocation(oldName, newName);
    const updated = getSavedPhysicalLocations();
    setLocations(updated);
    if (currentLocation === oldName) setCurrentLocation(newName);
  };

  const handleLocDelete = async (name: string) => {
    await deletePhysicalLocation(name);
    const updated = getSavedPhysicalLocations();
    setLocations(updated);
    if (currentLocation === name) setCurrentLocation(updated[0] || '未归位');
  };

  // 手动输入 ISBN
  const [manualIsbn, setManualIsbn] = useState<string>('');

  // 防抖去重：记录最近扫过的 ISBN 及其扫入时间戳
  const recentScansRef = useRef<Map<string, number>>(new Map());

  // 处理扫到一个有效 ISBN
  const handleProcessISBN = async (rawIsbn: string) => {
    const cleanIsbn = normalizeISBN(rawIsbn);
    if (!cleanIsbn || cleanIsbn.length < 10) return;

    // 3 秒防重复扫描保护
    const now = Date.now();
    const lastScanTime = recentScansRef.current.get(cleanIsbn) || 0;
    if (now - lastScanTime < 3000) {
      return;
    }
    recentScansRef.current.set(cleanIsbn, now);

    // 播放经典条码枪清脆“哔！”音效
    playScannerBeep();
    setIsProcessing(true);

    try {
      const meta = await fetchBookByISBN(cleanIsbn);
      const newBook: PhysicalBookRecord = {
        id: `b_${cleanIsbn}_${Date.now()}`,
        isbn: cleanIsbn,
        title: meta.title || `图书 ${cleanIsbn}`,
        subtitle: meta.subtitle,
        author: meta.author || '佚名',
        publisher: meta.publisher || '待补充出版社',
        pubDate: meta.pubDate,
        price: meta.price || '¥39.00',
        coverUrl: meta.coverUrl,
        pageCount: meta.pageCount || 280,
        currentPage: 0,
        status: 'unread',
        physicalLocation: currentLocation,
        category: meta.category || '藏书',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onBookScanned(newBook);
      setScannedQueue((prev) => [newBook, ...prev]);
    } catch (err) {
      console.warn('[Scanner] 解析图书失败:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // 拍照 / 相册选图识别条形码
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsDecodingPhoto(true);
    try {
      const barcode = await decodeBarcodeFromFile(file);
      if (barcode) {
        await handleProcessISBN(barcode);
      } else {
        alert('未能从该照片中识别到清晰的图书条形码。\n\n💡 扫码技巧：\n1. 请对准图书背面的条形码（以 978 或 979 开头的 13 位数字）\n2. 拍摄时光线充足，尽量避免反光或折角\n3. 如果图书条码受损，可直接在下方输入框键入 13 位数字');
      }
    } catch (err) {
      console.warn('[Scanner] 照片识别异常:', err);
      alert('条形码识别处理失败，请重试');
    } finally {
      setIsDecodingPhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  // 启动高精度 ZXing 条形码连续扫描引擎
  useEffect(() => {
    let isActive = true;

    async function initCameraAndDetector() {
      if (!videoRef.current) return;

      try {
        const stream = await startCameraStream(videoRef.current);
        if (!isActive) {
          stopCameraStream(stream);
          return;
        }
        streamRef.current = stream;
        setHasCamera(true);

        // 初始化专业 ZXing 解码器（聚焦中国图书常见的 EAN-13、EAN-8、Code-128）
        const reader = createZXingReader();
        const controls = await reader.decodeFromVideoElement(
          videoRef.current,
          (result, error) => {
            if (!isActive) return;
            if (result) {
              const text = result.getText();
              if (text) {
                handleProcessISBN(text);
              }
            }
          }
        );

        if (!isActive) {
          controls.stop();
        } else {
          controlsRef.current = controls;
        }
      } catch (err: any) {
        console.warn('[Scanner] 启动摄像头或扫码引擎失败:', err);
        setHasCamera(false);
        setCameraError('未获得摄像头权限或设备无可用相机。您可点击“传图识码”上传条码照片，或直接手动输入 ISBN。');
      }
    }

    initCameraAndDetector();

    return () => {
      isActive = false;
      if (controlsRef.current) {
        try {
          controlsRef.current.stop();
        } catch {
          // ignore
        }
        controlsRef.current = null;
      }
      if (streamRef.current) {
        stopCameraStream(streamRef.current);
        streamRef.current = null;
      }
    };
  }, []);

  const handleAddNewLocation = () => {
    const clean = newLocationInput.trim();
    if (clean) {
      savePhysicalLocation(clean);
      setLocations(getSavedPhysicalLocations());
      setCurrentLocation(clean);
      setNewLocationInput('');
      setIsAddingLocation(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(30, 24, 16, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: NM.bg,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          maxHeight: '94%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -10px 40px rgba(180, 160, 130, 0.45)',
          borderTop: NM.borderLight,
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部轻拟物导航 */}
        <div
          style={{
            padding: '14px 18px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: NM.borderSoft,
            backgroundColor: NM.bg,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: NM.cardBg,
                boxShadow: NM.convexSm,
                border: NM.borderLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: NM.emerald,
              }}
            >
              <Zap size={17} />
            </span>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: NM.textMain,
                }}
              >
                连续扫码录书
              </h3>
              <p style={{ margin: '1px 0 0', fontSize: '0.72rem', color: NM.textSub }}>
                无需反复启闭相机 · 对准条码“哔”声连续录入
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* 隐藏的图片文件上传 input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isDecodingPhoto}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '0.74rem',
                fontWeight: 700,
                color: NM.primaryDark,
                backgroundColor: NM.cardBg,
                boxShadow: NM.convexSm,
                border: NM.borderLight,
                padding: '6px 11px',
                borderRadius: 14,
                cursor: isDecodingPhoto ? 'wait' : 'pointer',
                opacity: isDecodingPhoto ? 0.7 : 1,
              }}
              title="从相册选图或直接拍照识别图书条形码"
            >
              {isDecodingPhoto ? (
                <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <ImageIcon size={14} />
              )}
              <span>{isDecodingPhoto ? '识别中…' : '传图识码'}</span>
            </button>

            {scannedQueue.length > 0 && (
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#047857',
                  backgroundColor: '#ECFDF5',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  boxShadow: NM.convexXs,
                  padding: '3px 10px',
                  borderRadius: 14,
                }}
              >
                已入库 {scannedQueue.length} 本
              </span>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: NM.borderLight,
                backgroundColor: NM.cardBg,
                boxShadow: NM.convexSm,
                color: NM.textSub,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
              }}
              title="关闭"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 当前物理书架分配条（轻拟物内凹底座） */}
        <div
          style={{
            padding: '10px 16px',
            backgroundColor: NM.bgInset,
            boxShadow: NM.insetXs,
            borderBottom: NM.borderSoft,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.76rem', color: NM.textMain, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
              <MapPin size={14} color={NM.primary} />
              当前录入至：<b style={{ color: NM.primaryDark }}>{currentLocation}</b>
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                onClick={() => setIsLocManagerOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: NM.primaryDark,
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  fontWeight: 700,
                }}
                title="管理书架位置"
              >
                <Settings size={13} />
                <span>管理</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddingLocation(!isAddingLocation)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: NM.primaryDark,
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  fontWeight: 700,
                }}
              >
                <Plus size={13} />
                <span>新书架</span>
              </button>
            </div>
          </div>

          {/* 预设书架轻拟物胶囊快选 */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              scrollbarWidth: 'none',
              padding: '2px 0',
            }}
          >
            {locations.map((loc) => {
              const isSelected = currentLocation === loc;
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setCurrentLocation(loc)}
                  style={{
                    whiteSpace: 'nowrap',
                    fontSize: '0.74rem',
                    padding: '4px 10px',
                    borderRadius: 10,
                    border: NM.borderLight,
                    backgroundColor: isSelected ? '#FFFBEB' : NM.cardBg,
                    boxShadow: isSelected ? NM.insetXs : NM.convexXs,
                    color: isSelected ? NM.primaryDark : NM.textSub,
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {loc}
                </button>
              );
            })}
          </div>

          {/* 新增物理位置小输入框 */}
          {isAddingLocation && (
            <div
              style={{
                display: 'flex',
                gap: 6,
                marginTop: 4,
                backgroundColor: NM.cardBg,
                boxShadow: NM.insetSm,
                borderRadius: 10,
                padding: 3,
              }}
            >
              <input
                type="text"
                value={newLocationInput}
                onChange={(e) => setNewLocationInput(e.target.value)}
                placeholder="如: 书房西侧3层、二楼书箱…"
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  fontSize: '0.78rem',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: 'transparent',
                  outline: 'none',
                  color: NM.textMain,
                }}
              />
              <button
                type="button"
                onClick={handleAddNewLocation}
                style={{
                  padding: '4px 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                  color: '#FFFFFF',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                确定
              </button>
            </div>
          )}
        </div>

        {/* 摄像头取景器与激光扫描框 */}
        <div
          style={{
            position: 'relative',
            height: '220px',
            backgroundColor: '#1C1917',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 4px 14px rgba(0,0,0,0.6)',
          }}
        >
          {hasCamera ? (
            <video
              ref={videoRef}
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                padding: '20px',
                textAlign: 'center',
                color: '#E7E5E4',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertCircle size={28} color="#FBBF24" />
              <p style={{ margin: 0, fontSize: '0.78rem', maxWidth: '280px', lineHeight: 1.4 }}>
                {cameraError || '摄像头初始化中…'}
              </p>
            </div>
          )}

          {/* 拟物红外激光扫描框 */}
          <div
            style={{
              position: 'absolute',
              width: '260px',
              height: '130px',
              border: '2px dashed rgba(255, 255, 255, 0.75)',
              borderRadius: 14,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '6px',
            }}
          >
            {/* 四个高亮扫描边角 */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ width: 14, height: 14, borderTop: '3px solid #10B981', borderLeft: '3px solid #10B981', borderRadius: '3px 0 0 0' }} />
              <div style={{ width: 14, height: 14, borderTop: '3px solid #10B981', borderRight: '3px solid #10B981', borderRadius: '0 3px 0 0' }} />
            </div>

            {/* 动态激光扫描线 */}
            <div
              style={{
                height: '2px',
                backgroundColor: '#10B981',
                boxShadow: '0 0 8px #10B981, 0 0 16px #34D399',
                animation: 'scanLaser 1.8s infinite ease-in-out',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ width: 14, height: 14, borderBottom: '3px solid #10B981', borderLeft: '3px solid #10B981', borderRadius: '0 0 0 3px' }} />
              <div style={{ width: 14, height: 14, borderBottom: '3px solid #10B981', borderRight: '3px solid #10B981', borderRadius: '0 0 3px 0' }} />
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 8,
              fontSize: '0.72rem',
              color: 'rgba(255, 255, 255, 0.9)',
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              padding: '3px 10px',
              borderRadius: 12,
              pointerEvents: 'none',
            }}
          >
            将实体图书条形码置于框内
          </div>
        </div>

        {/* 快捷点击模拟扫码（方便在电脑端测试体验“哔哔”录入） */}
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: NM.bg,
            borderBottom: NM.borderSoft,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          <span style={{ fontSize: '0.72rem', color: NM.textSub, whiteSpace: 'nowrap', fontWeight: 600 }}>
            仿真条码点选：
          </span>
          {SAMPLE_TEST_ISBNS.map((item) => (
            <button
              key={item.isbn}
              type="button"
              onClick={() => handleProcessISBN(item.isbn)}
              style={{
                whiteSpace: 'nowrap',
                fontSize: '0.74rem',
                padding: '4px 10px',
                borderRadius: 10,
                border: NM.borderLight,
                backgroundColor: NM.cardBg,
                boxShadow: NM.convexXs,
                color: NM.textMain,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* 手动输入 ISBN 补录通道（轻拟物内凹槽） */}
        <div
          style={{
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderBottom: NM.borderSoft,
            backgroundColor: NM.bg,
          }}
        >
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: NM.bgInset,
              boxShadow: NM.insetSm,
              border: '1px solid rgba(255, 255, 255, 0.65)',
              borderRadius: 12,
              padding: '6px 10px',
            }}
          >
            <input
              type="text"
              value={manualIsbn}
              onChange={(e) => setManualIsbn(e.target.value)}
              placeholder="或手动输 13 位条码(如 9787536692930)…"
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: '0.8rem',
                color: NM.textMain,
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              if (manualIsbn.trim()) {
                handleProcessISBN(manualIsbn);
                setManualIsbn('');
              }
            }}
            style={{
              padding: '7px 16px',
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.65)',
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#FFFFFF',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '2px 3px 8px rgba(217, 119, 6, 0.35)',
            }}
          >
            录入
          </button>
        </div>

        {onOpenManualAdd && (
          <div style={{ padding: '6px 16px 8px', textAlign: 'center', backgroundColor: NM.bg, borderBottom: NM.borderSoft }}>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenManualAdd();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: NM.primaryDark,
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              无条形码或特殊古籍？点击切换至完整手动建档 &gt;
            </button>
          </div>
        )}

        {/* 刚刚已扫入的书籍流水队列（轻拟物卡片流） */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '10px 16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ fontSize: '0.76rem', color: NM.textSub, fontWeight: 700 }}>
            本次连续扫入清单 ({scannedQueue.length})
          </div>

          {scannedQueue.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '24px',
                color: NM.textMuted,
                fontSize: '0.8rem',
              }}
            >
              对准任意实体书后封条形码，即可开始连续秒级入库
            </div>
          ) : (
            scannedQueue.map((b) => (
              <div
                key={b.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  backgroundColor: NM.cardBg,
                  border: NM.borderLight,
                  borderRadius: 14,
                  padding: '8px 12px',
                  boxShadow: NM.convexSm,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 46,
                    backgroundColor: NM.bgInset,
                    borderRadius: 6,
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: NM.insetXs,
                  }}
                >
                  {b.coverUrl && (
                    <img
                      src={b.coverUrl}
                      alt={b.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => ((e.currentTarget as HTMLElement).style.display = 'none')}
                    />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      color: NM.textMain,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {b.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: NM.textSub, marginTop: 2 }}>
                    {b.author} · {b.price} · 放于 <b style={{ color: NM.primaryDark }}>{b.physicalLocation}</b>
                  </div>
                </div>

                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: '#ECFDF5',
                    color: '#047857',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: NM.convexXs,
                    flexShrink: 0,
                  }}
                >
                  <Check size={14} strokeWidth={2.4} />
                </span>
              </div>
            ))
          )}
        </div>

        {/* 物理书架编辑/删除管理模态框 */}
        {isLocManagerOpen && (
          <LocationManagerModal
            locations={locations}
            locationCounts={{ [currentLocation]: 1 }}
            onClose={() => setIsLocManagerOpen(false)}
            onAddLocation={handleLocAdd}
            onUpdateLocation={handleLocUpdate}
            onDeleteLocation={handleLocDelete}
          />
        )}
      </div>
    </div>
  );
};
