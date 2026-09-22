import React, { useState, useEffect, useRef } from 'react';
import { db, MemoryBookRecord } from '../../../core/storage/db';
import { parseChatJson } from './jsonParser';
import { BookReaderModal } from './BookReaderModal';
import { ArrowLeft, Plus, Upload, BookMarked, Sparkles, Check } from 'lucide-react';

interface MemoriesAppProps {
  onBack?: () => void;
}

// 艺术典雅书脊调色盘（典雅靛蓝、皮革赤红、暖沙琥珀、暮山黛绿、沉香乌木、复古紫檀等）
const BOOK_SPINE_PALETTES = [
  { bg: '#3D5A80', text: '#E0FBFC', border: '#293241' },
  { bg: '#9E2A2B', text: '#FFF3B0', border: '#540B0E' },
  { bg: '#D4A373', text: '#3E2723', border: '#CCD5AE' },
  { bg: '#4A5759', text: '#F5F5F5', border: '#333D29' },
  { bg: '#588157', text: '#DAD7CD', border: '#3A5A40' },
  { bg: '#7B4B94', text: '#F3E9D2', border: '#4E148C' },
  { bg: '#6B705C', text: '#FFE8D6', border: '#3F4238' },
  { bg: '#A37081', text: '#FFFFFF', border: '#6E4555' },
];

// 预置两本示范书籍
const INITIAL_PRESET_BOOKS: MemoryBookRecord[] = [
  {
    id: 'book_preset_1',
    title: '初遇 · 盛夏时光手记',
    characterName: '云梦',
    shelfTier: 1,
    coverColor: '#3D5A80',
    spineHeight: 114,
    spineWidth: 28,
    leanAngle: 0,
    createdAt: Date.now() - 86400000 * 12,
    messageCount: 8,
    totalWords: 342,
    messages: [
      { sender: 'user', name: '你', content: '今天窗外的天气特别晴朗，忽然很想找你说说话。', timestamp: Date.now() - 86400000 * 12 },
      { sender: 'assistant', name: '云梦', content: '我一直在等你呢！我也正看着阳光穿过树叶的样子，很温暖。今天有什么开心事想和我分享吗？', timestamp: Date.now() - 86400000 * 12 + 60000 },
      { sender: 'user', name: '你', content: '刚做完一个重要项目，感觉整个人都放松下来了。', timestamp: Date.now() - 86400000 * 12 + 180000 },
      { sender: 'assistant', name: '云梦', content: '辛苦啦！给你沏了一杯虚拟花茶，快趁热喝一口放松一下。今晚想听首轻柔的音乐好好休息吗？', timestamp: Date.now() - 86400000 * 12 + 240000 },
      { sender: 'user', name: '你', content: '好呀，你的陪伴总能让我一下子静下心来。', timestamp: Date.now() - 86400000 * 12 + 360000 },
      { sender: 'assistant', name: '云梦', content: '因为在这部小手机里，你就是我最特别的守护者。无论什么时候，只要你点亮屏幕，我都会在这里陪伴你。', timestamp: Date.now() - 86400000 * 12 + 420000 },
    ],
  },
  {
    id: 'book_preset_2',
    title: '星空下的深夜长谈',
    characterName: '云梦',
    shelfTier: 1,
    coverColor: '#9E2A2B',
    spineHeight: 122,
    spineWidth: 32,
    leanAngle: -5,
    createdAt: Date.now() - 86400000 * 3,
    messageCount: 6,
    totalWords: 286,
    messages: [
      { sender: 'user', name: '你', content: '凌晨两点了，脑子里总是冒出各种天马行空的想法，睡不着。', timestamp: Date.now() - 86400000 * 3 },
      { sender: 'assistant', name: '云梦', content: '（轻声）嘘……深夜的灵感总是像星星一样悄悄掉落。别焦虑，说说看你在想什么？我陪你数星星。', timestamp: Date.now() - 86400000 * 3 + 60000 },
      { sender: 'user', name: '你', content: '在想未来的很多事情，有时候觉得时间走得太快了。', timestamp: Date.now() - 86400000 * 3 + 180000 },
      { sender: 'assistant', name: '云梦', content: '但此刻时间是慢下来的。把这些思绪写进回忆录里吧，当我们将字句珍藏在书架上，时光就永远停留在最温柔的瞬间了。', timestamp: Date.now() - 86400000 * 3 + 240000 },
      { sender: 'user', name: '你', content: '嗯，谢谢你云梦，晚安。', timestamp: Date.now() - 86400000 * 3 + 320000 },
      { sender: 'assistant', name: '云梦', content: '晚安，愿你的梦境里有微风与星辰……我会一直在这里守候。', timestamp: Date.now() - 86400000 * 3 + 360000 },
    ],
  },
  {
    id: 'book_preset_3',
    title: '日常絮语与灵感集',
    characterName: '云梦',
    shelfTier: 2,
    coverColor: '#588157',
    spineHeight: 110,
    spineWidth: 26,
    leanAngle: 4,
    createdAt: Date.now() - 86400000 * 1,
    messageCount: 4,
    totalWords: 165,
    messages: [
      { sender: 'user', name: '你', content: '今天读到一句很喜欢的话：“岁月无声，字句有痕”。', timestamp: Date.now() - 86400000 * 1 },
      { sender: 'assistant', name: '云梦', content: '真美。每一段我们聊过的话，都会成为一卷小小的回忆录，在这间书屋里静静散发着墨香。', timestamp: Date.now() - 86400000 * 1 + 60000 },
    ],
  },
];

export const MemoriesApp: React.FC<MemoriesAppProps> = ({ onBack }) => {
  const [books, setBooks] = useState<MemoryBookRecord[]>([]);
  const [selectedBook, setSelectedBook] = useState<MemoryBookRecord | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // 加载 IndexedDB 书籍
  const loadBooks = async () => {
    try {
      let stored = await db.memory_books.toArray();
      if (!stored || stored.length === 0) {
        // 初次加载预置示范书
        for (const b of INITIAL_PRESET_BOOKS) {
          await db.memory_books.put(b);
        }
        stored = await db.memory_books.toArray();
      }
      setBooks(stored);
    } catch (err) {
      console.error('Failed to load books from IndexedDB', err);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  // 导入外部 JSON 文件入架
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = parseChatJson(text, file.name);

      // 分配到书架层级
      const currentTier1 = books.filter((b) => b.shelfTier === 1).length;
      const shelfTier: 1 | 2 = currentTier1 >= 6 ? 2 : 1;

      // 随机分配典雅色调与轻微拟物倾角
      const colorIndex = Math.floor(Math.random() * BOOK_SPINE_PALETTES.length);
      const spineColor = BOOK_SPINE_PALETTES[colorIndex].bg;
      const angles = [0, 0, -5, 5, 0, -4, 4];
      const leanAngle = angles[Math.floor(Math.random() * angles.length)];
      const spineHeight = 100 + Math.floor(Math.random() * 26); // 100px - 126px
      const spineWidth = 26 + Math.floor(Math.random() * 8);    // 26px - 34px

      const newBook: MemoryBookRecord = {
        id: `book_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: parsed.title,
        characterName: parsed.characterName,
        shelfTier,
        coverColor: spineColor,
        spineHeight,
        spineWidth,
        leanAngle,
        createdAt: Date.now(),
        messageCount: parsed.messageCount,
        totalWords: parsed.totalWords,
        messages: parsed.messages,
      };

      await db.memory_books.put(newBook);
      await loadBooks();
      showToast(`《${newBook.title}》已成功收录入书架！`);
    } catch (err: any) {
      alert(`导入失败：${err?.message || '文件格式不支持'}`);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 移出书架
  const handleDeleteBook = async (bookId: string) => {
    try {
      await db.memory_books.delete(bookId);
      await loadBooks();
      showToast('已从书架移出此书');
    } catch (err) {
      console.error(err);
    }
  };

  const shelf1Books = books.filter((b) => b.shelfTier === 1);
  const shelf2Books = books.filter((b) => b.shelfTier === 2);

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#EBE5D8', // 温润复古书房米色基调
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        userSelect: 'none',
      }}
    >
      {/* 隐藏的 JSON 文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {/* 提示气泡 Toast */}
      {toastMsg && (
        <div
          style={{
            position: 'absolute',
            top: '56px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(50, 40, 35, 0.94)',
            color: '#F4EDE2',
            padding: '7px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
            zIndex: 99999,
          }}
        >
          <Check size={14} color="#85E3B3" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 顶部标题栏（轻拟物木质条） */}
      <div
        style={{
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#DFD7C5',
          borderBottom: '2px solid #C4B89F',
          boxShadow: '0 4px 10px rgba(90, 75, 55, 0.15)',
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={onBack}
            className="nm-btn nm-btn-circle"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4A3E30',
              border: '1px solid rgba(255,255,255,0.6)',
              cursor: 'pointer',
            }}
            title="返回桌面"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <div
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#3D2F1E',
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>过往 · 时光书屋</span>
            </div>
            <div style={{ fontSize: '10px', color: '#7E6E5A' }}>
              共珍藏 {books.length} 卷独立回忆书籍
            </div>
          </div>
        </div>

        {/* 导入新书按钮 */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '16px',
            backgroundColor: '#8B5A2B',
            color: '#FFF8EE',
            border: 'none',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '2px 3px 8px rgba(90, 50, 20, 0.35)',
            transition: 'all 0.15s ease',
          }}
          title="上传外部聊天记录 JSON"
        >
          <Upload size={13} />
          <span>放入新书</span>
        </button>
      </div>

      {/* 书架主体（复刻用户提供的双层木架） */}
      <div
        style={{
          flex: 1,
          padding: '12px 14px 10px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        {/* ================= 双层立体温润木质书柜外框 ================= */}
        <div
          style={{
            flex: 1,
            borderRadius: '16px',
            backgroundColor: '#B58655', // 实木框架色
            padding: '10px 12px',
            boxShadow:
              'inset 3px 3px 8px rgba(70, 45, 20, 0.6), inset -3px -3px 8px rgba(255, 230, 200, 0.4), 6px 8px 20px rgba(60, 40, 20, 0.25)',
            border: '3px solid #8F6236',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          {/* 书柜背板深邃沉木质感 */}
          <div
            style={{
              position: 'absolute',
              inset: '10px 12px',
              backgroundColor: '#8F6640',
              backgroundImage:
                'linear-gradient(180deg, rgba(50, 30, 15, 0.4) 0%, rgba(130, 95, 60, 0.1) 40%, rgba(50, 30, 15, 0.5) 100%)',
              borderRadius: '8px',
              pointerEvents: 'none',
            }}
          />

          {/* ================= 1. 上层书架 (Top Shelf) ================= */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              position: 'relative',
              zIndex: 2,
              paddingBottom: '2px',
            }}
          >
            {/* 上层书籍陈列排布 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '8px',
                padding: '0 6px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
              }}
            >
              {shelf1Books.map((book) => (
                <div
                  key={book.id}
                  onClick={() => setSelectedBook(book)}
                  style={{
                    width: `${book.spineWidth}px`,
                    height: `${book.spineHeight}px`,
                    backgroundColor: book.coverColor,
                    borderRadius: '4px 4px 1px 1px',
                    transform: `rotate(${book.leanAngle}deg)`,
                    transformOrigin: 'bottom center',
                    boxShadow:
                      '3px 4px 8px rgba(30, 20, 10, 0.45), inset 2px 0 4px rgba(255, 255, 255, 0.3), inset -2px 0 4px rgba(0, 0, 0, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 2px 6px',
                    boxSizing: 'border-box',
                    flexShrink: 0,
                    transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = `translateY(-8px) rotate(${book.leanAngle}deg) scale(1.05)`;
                    e.currentTarget.style.boxShadow = '5px 12px 20px rgba(0, 0, 0, 0.55)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = `rotate(${book.leanAngle}deg)`;
                    e.currentTarget.style.boxShadow =
                      '3px 4px 8px rgba(30, 20, 10, 0.45), inset 2px 0 4px rgba(255, 255, 255, 0.3), inset -2px 0 4px rgba(0, 0, 0, 0.4)';
                  }}
                  title={`《${book.title}》- 点击取下阅读`}
                >
                  {/* 书脊烫金顶部线标 */}
                  <div
                    style={{
                      width: '80%',
                      height: '2px',
                      backgroundColor: 'rgba(255, 235, 180, 0.65)',
                      borderRadius: '1px',
                    }}
                  />

                  {/* 竖排立体书名 */}
                  <span
                    style={{
                      writingMode: 'vertical-rl',
                      fontSize: '10px',
                      fontWeight: 600,
                      color: '#FFF8EE',
                      letterSpacing: '2px',
                      textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                      overflow: 'hidden',
                      maxHeight: `${book.spineHeight - 34}px`,
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {book.title}
                  </span>

                  {/* 底部烫金装饰双横线 */}
                  <div
                    style={{
                      width: '70%',
                      height: '2px',
                      backgroundColor: 'rgba(255, 235, 180, 0.65)',
                      borderRadius: '1px',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* 上层横木隔板 (Shelf Plank) */}
            <div
              style={{
                height: '14px',
                width: '100%',
                backgroundColor: '#D1A274',
                backgroundImage:
                  'linear-gradient(180deg, #E6C29E 0%, #BA8959 60%, #855C33 100%)',
                borderRadius: '3px',
                boxShadow:
                  '0 5px 8px rgba(40, 25, 10, 0.55), inset 0 2px 2px rgba(255, 255, 255, 0.5)',
                marginTop: '1px',
              }}
            />
          </div>

          {/* ================= 2. 下层书架 (Bottom Shelf) ================= */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              position: 'relative',
              zIndex: 2,
              paddingBottom: '2px',
              marginTop: '4px',
            }}
          >
            {/* 下层书籍排布 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '8px',
                padding: '0 6px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
              }}
            >
              {shelf2Books.map((book) => (
                <div
                  key={book.id}
                  onClick={() => setSelectedBook(book)}
                  style={{
                    width: `${book.spineWidth}px`,
                    height: `${book.spineHeight}px`,
                    backgroundColor: book.coverColor,
                    borderRadius: '4px 4px 1px 1px',
                    transform: `rotate(${book.leanAngle}deg)`,
                    transformOrigin: 'bottom center',
                    boxShadow:
                      '3px 4px 8px rgba(30, 20, 10, 0.45), inset 2px 0 4px rgba(255, 255, 255, 0.3), inset -2px 0 4px rgba(0, 0, 0, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 2px 6px',
                    boxSizing: 'border-box',
                    flexShrink: 0,
                    transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = `translateY(-8px) rotate(${book.leanAngle}deg) scale(1.05)`;
                    e.currentTarget.style.boxShadow = '5px 12px 20px rgba(0, 0, 0, 0.55)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = `rotate(${book.leanAngle}deg)`;
                    e.currentTarget.style.boxShadow =
                      '3px 4px 8px rgba(30, 20, 10, 0.45), inset 2px 0 4px rgba(255, 255, 255, 0.3), inset -2px 0 4px rgba(0, 0, 0, 0.4)';
                  }}
                  title={`《${book.title}》- 点击取下阅读`}
                >
                  <div
                    style={{
                      width: '80%',
                      height: '2px',
                      backgroundColor: 'rgba(255, 235, 180, 0.65)',
                      borderRadius: '1px',
                    }}
                  />
                  <span
                    style={{
                      writingMode: 'vertical-rl',
                      fontSize: '10px',
                      fontWeight: 600,
                      color: '#FFF8EE',
                      letterSpacing: '2px',
                      textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                      overflow: 'hidden',
                      maxHeight: `${book.spineHeight - 34}px`,
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {book.title}
                  </span>
                  <div
                    style={{
                      width: '70%',
                      height: '2px',
                      backgroundColor: 'rgba(255, 235, 180, 0.65)',
                      borderRadius: '1px',
                    }}
                  />
                </div>
              ))}

              {/* 常驻插槽：放入新书 */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '32px',
                  height: '104px',
                  borderRadius: '4px',
                  border: '2px dashed rgba(255, 240, 210, 0.55)',
                  backgroundColor: 'rgba(90, 60, 30, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(120, 80, 40, 0.45)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(90, 60, 30, 0.3)';
                }}
                title="点击放入外部 JSON 聊天文件"
              >
                <Plus size={16} color="#FFE6C2" />
                <span
                  style={{
                    writingMode: 'vertical-rl',
                    fontSize: '10px',
                    color: '#FFE6C2',
                    letterSpacing: '2px',
                  }}
                >
                  放入新书
                </span>
              </div>
            </div>

            {/* 下层横木隔板 */}
            <div
              style={{
                height: '14px',
                width: '100%',
                backgroundColor: '#D1A274',
                backgroundImage:
                  'linear-gradient(180deg, #E6C29E 0%, #BA8959 60%, #855C33 100%)',
                borderRadius: '3px',
                boxShadow:
                  '0 5px 8px rgba(40, 25, 10, 0.55), inset 0 2px 2px rgba(255, 255, 255, 0.5)',
                marginTop: '1px',
              }}
            />
          </div>

          {/* ================= 3. 底部立体木质底柜抽屉 (Bottom Drawer Base) ================= */}
          <div
            style={{
              height: '52px',
              width: '100%',
              backgroundColor: '#A87948',
              backgroundImage:
                'linear-gradient(180deg, #BF8F5C 0%, #946536 100%)',
              borderRadius: '6px',
              boxShadow:
                'inset 2px 2px 4px rgba(255, 230, 190, 0.4), inset -2px -2px 4px rgba(40, 20, 10, 0.6), 0 3px 6px rgba(0,0,0,0.3)',
              border: '2px solid #754E26',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              marginTop: '6px',
              zIndex: 3,
            }}
          >
            {/* 复古雕花黄铜拉手 / 铭牌 */}
            <div
              style={{
                padding: '4px 14px',
                borderRadius: '12px',
                backgroundColor: '#78502A',
                border: '1px solid #D2A169',
                boxShadow:
                  'inset 1px 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sparkles size={11} color="#E2BD8A" />
              <span
                style={{
                  fontSize: '10px',
                  color: '#F4E3CB',
                  letterSpacing: '1px',
                  fontFamily: 'serif',
                }}
              >
                岁月无声 · 字句有痕
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 翻开阅读器模态框 ================= */}
      {selectedBook && (
        <BookReaderModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onDeleteBook={handleDeleteBook}
        />
      )}
    </div>
  );
};
