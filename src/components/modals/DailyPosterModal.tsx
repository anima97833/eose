import React, { useEffect, useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Image as ImageIcon,
  Sunrise,
  Aperture
} from 'lucide-react';
import { PosterRecord } from '../../core/poster/posterTypes';
import { 
  getTodayActivePosters, 
  isTodayDismissed, 
  markTodayDismissed, 
  savePoster,
  formatDateYMD
} from '../../core/poster/posterStorage';
import { PosterCardView } from '../apps/camera/PosterCardView';
import '../apps/camera/posterAlbum.css';

interface DailyPosterModalProps {
  onOpenAlbum?: () => void;
  forceOpen?: boolean;
  onClose?: () => void;
}

export const DailyPosterModal: React.FC<DailyPosterModalProps> = ({
  onOpenAlbum,
  forceOpen = false,
  onClose,
}) => {
  const [activePosters, setActivePosters] = useState<PosterRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkTodayShowcase = async () => {
    try {
      setLoading(true);
      const posters = await getTodayActivePosters();
      setActivePosters(posters);

      if (forceOpen) {
        setIsOpen(posters.length > 0);
      } else {
        const dismissed = isTodayDismissed();
        if (posters.length > 0 && !dismissed) {
          setIsOpen(true);
        } else {
          setIsOpen(false);
        }
      }
    } catch (err) {
      console.error('[DailyPosterModal] 加载今日海报展映失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkTodayShowcase();

    const handlePosterUpdate = () => {
      checkTodayShowcase();
    };
    window.addEventListener('cloudfly_posters_updated', handlePosterUpdate);
    return () => {
      window.removeEventListener('cloudfly_posters_updated', handlePosterUpdate);
    };
  }, [forceOpen]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : activePosters.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < activePosters.length - 1 ? prev + 1 : 0));
  };

  const handleToggleItem = async (posterId: string, itemId: string) => {
    const poster = activePosters.find((p) => p.id === posterId);
    if (!poster || !poster.backItems) return;

    const updatedItems = poster.backItems.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    const updatedPoster: PosterRecord = {
      ...poster,
      backItems: updatedItems,
    };

    setActivePosters((prev) =>
      prev.map((p) => (p.id === posterId ? updatedPoster : p))
    );

    await savePoster(updatedPoster);
  };

  const handleMarkDismissed = () => {
    markTodayDismissed();
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleGoToAlbum = () => {
    markTodayDismissed();
    setIsOpen(false);
    if (onClose) onClose();
    if (onOpenAlbum) onOpenAlbum();
  };

  if (!isOpen || loading || activePosters.length === 0) {
    return null;
  }

  const currentPoster = activePosters[currentIndex] || activePosters[0];

  return (
    <div className="pa-modal-overlay" onClick={() => { setIsOpen(false); if (onClose) onClose(); }}>
      <div 
        className="pa-modal-box"
        style={{ maxWidth: 350, padding: '16px 16px 14px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题与关闭 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sunrise size={16} color="#d97706" />
            <span style={{ fontSize: 14, fontWeight: 800, color: '#1e293b' }}>
              今日提醒
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#b45309', background: 'rgba(217,119,6,0.12)', padding: '1px 6px', borderRadius: 8 }}>
              {currentIndex + 1}/{activePosters.length}
            </span>
          </div>

          <button
            type="button"
            className="pa-btn-icon"
            style={{ width: 26, height: 26, borderRadius: 6 }}
            onClick={() => {
              setIsOpen(false);
              if (onClose) onClose();
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* 海报视窗 */}
        <div style={{ position: 'relative', width: '100%', margin: '4px 0' }}>
          {activePosters.length > 1 && (
            <button
              type="button"
              className="pa-btn-icon"
              style={{ position: 'absolute', left: -8, top: '50%', transform: 'translateY(-50%)', zIndex: 30, width: 30, height: 30, borderRadius: '50%', background: '#ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
              onClick={handlePrev}
            >
              <ChevronLeft size={16} />
            </button>
          )}

          <PosterCardView
            poster={currentPoster}
            interactive={true}
            onToggleItem={handleToggleItem}
            style={{ minHeight: 330, height: 340 }}
          />

          {activePosters.length > 1 && (
            <button
              type="button"
              className="pa-btn-icon"
              style={{ position: 'absolute', right: -8, top: '50%', transform: 'translateY(-50%)', zIndex: 30, width: 30, height: 30, borderRadius: '50%', background: '#ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
              onClick={handleNext}
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* 底部简洁操作按键 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
          <button
            type="button"
            className="pa-btn pa-btn-secondary"
            style={{ padding: '8px 0' }}
            onClick={handleGoToAlbum}
          >
            <Aperture size={14} />
            <span>进入刻时</span>
          </button>

          <button
            type="button"
            className="pa-btn pa-btn-primary"
            style={{ padding: '8px 0' }}
            onClick={handleMarkDismissed}
          >
            <Check size={14} />
            <span>今日已阅</span>
          </button>
        </div>
      </div>
    </div>
  );
};
