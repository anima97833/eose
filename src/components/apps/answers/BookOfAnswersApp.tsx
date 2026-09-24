import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Sparkles, ScrollText, X, RotateCcw } from 'lucide-react';
import { NM } from '../storyword/storyWordNeumorphism';

interface AnswerRecord {
  id: string;
  question: string;
  answerCn: string;
  answerEn: string;
  page: number;
  timeStr: string;
}

const STORAGE_KEY = 'neumorphic_answers_book_history_v1';

// 原版精选《答案之书》权威经典中英双语词库
const ANSWERS_CORPUS = [
  { cn: '退一步海阔天空', en: 'Take a step back' },
  { cn: '勇敢迈出第一步', en: 'Take the first step bravely' },
  { cn: '毫无疑问', en: 'Without a doubt' },
  { cn: '静候最佳时机', en: 'Wait for the right moment' },
  { cn: '放手去搏', en: 'Go for it' },
  { cn: '答案显而易见', en: 'The answer is obvious' },
  { cn: '顺其自然', en: 'Let nature take its course' },
  { cn: '不要犹豫', en: 'Do not hesitate' },
  { cn: '另辟蹊径', en: 'Find another way' },
  { cn: '听从内心的第一直觉', en: 'Trust your first instinct' },
  { cn: '放下执念', en: 'Let it go' },
  { cn: '全力以赴', en: 'Give it your all' },
  { cn: '暂且搁置一下', en: 'Set it aside for now' },
  { cn: '结果会让你惊喜', en: 'The result will surprise you' },
  { cn: '珍惜眼前所拥有的', en: 'Cherish what you have' },
  { cn: '不要抱有不切实际的幻想', en: 'Do not cling to illusions' },
  { cn: '现在还不是时候', en: 'Now is not the time' },
  { cn: '你需要更多的耐心', en: 'More patience is required' },
  { cn: '换个角度看问题', en: 'Look from a different angle' },
  { cn: '大胆说出你的想法', en: 'Speak your mind boldly' },
  { cn: '其实你心里早有答案', en: 'You already know the answer' },
  { cn: '保持沉默是更好的选择', en: 'Silence is a better choice' },
  { cn: '去问问值得信赖的人', en: 'Ask someone you trust' },
  { cn: '给彼此一点空间', en: 'Give each other some space' },
  { cn: '立即行动，不要拖延', en: 'Act now, do not delay' },
  { cn: '别让过去的遗憾困扰你', en: 'Leave the past behind' },
  { cn: '准备好迎接新变化', en: 'Prepare for changes' },
  { cn: '相信一切都是最好的安排', en: 'Trust the timing of your life' },
  { cn: '坚守你的底线', en: 'Hold on to your principles' },
  { cn: '这件事值得你的付出', en: 'It is worth your effort' },
  { cn: '不要太在意别人的评价', en: 'Do not care what others think' },
  { cn: '学会拒绝', en: 'Learn to say no' },
  { cn: '专注于手头当下的事', en: 'Focus on the present moment' },
  { cn: '前方有惊喜在等你', en: 'A pleasant surprise awaits' },
  { cn: '先好好睡一觉', en: 'Get a good night\'s sleep first' },
  { cn: '不要为了妥协而妥协', en: 'Never settle' },
  { cn: '做最坏的打算，抱最好的希望', en: 'Hope for best, prepare for worst' },
  { cn: '结局会比你想的更好', en: 'It will end better than you think' },
  { cn: '遵循你的常识', en: 'Follow common sense' },
  { cn: '不要回头', en: 'Never look back' },
];

const PRESET_QUESTIONS = [
  { label: '💼 换工作？', text: '我该换工作吗？' },
  { label: '💌 去表白？', text: '今晚要去表白吗？' },
  { label: '🛍️ 买不买？', text: '要不要买下它？' },
  { label: '🔥 坚持吗？', text: '应该继续坚持吗？' },
  { label: '🍀 顺利吗？', text: '明天会一切顺利吗？' },
];

interface BookOfAnswersAppProps {
  onBack: () => void;
}

export const BookOfAnswersApp: React.FC<BookOfAnswersAppProps> = ({ onBack }) => {
  const [question, setQuestion] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<{
    cn: string;
    en: string;
    page: number;
    recordedQuestion: string;
  } | null>(null);

  const [history, setHistory] = useState<AnswerRecord[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 读取本地历史手账
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setHistory(JSON.parse(raw));
      }
    } catch (e) {
      console.warn('Failed to load answers history:', e);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2200);
  };

  // 翻开 / 合上《答案之书》
  const handleToggleFlip = () => {
    if (isFlipping) return;

    if (isRevealed) {
      // 当前已翻开 -> 点击合上书本，准备下一次提问
      setIsRevealed(false);
      setQuestion('');
      return;
    }

    // 执行翻开抽签
    const finalQuestion = question.trim() || '我心中的困惑';
    setIsFlipping(true);

    setTimeout(() => {
      const picked = ANSWERS_CORPUS[Math.floor(Math.random() * ANSWERS_CORPUS.length)];
      const page = Math.floor(Math.random() * 320) + 12;

      setCurrentAnswer({
        cn: picked.cn,
        en: picked.en,
        page,
        recordedQuestion: finalQuestion,
      });

      setIsFlipping(false);
      setIsRevealed(true);

      // 保存至手账纪录
      const newRecord: AnswerRecord = {
        id: `ans_${Date.now()}`,
        question: finalQuestion,
        answerCn: picked.cn,
        answerEn: picked.en,
        page,
        timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const updatedHistory = [newRecord, ...history.slice(0, 24)];
      setHistory(updatedHistory);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      } catch (e) {
        console.warn(e);
      }

      showToast(`已翻开第 ${page} 页：${picked.cn}`);
    }, 450);
  };

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: NM.bg,
        color: NM.textMain,
        boxSizing: 'border-box',
        padding: '14px 16px 18px',
        overflowX: 'hidden',
        overflowY: 'auto',
        position: 'relative',
      }}
    >
      {/* 顶部标题栏 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: NM.cardBg,
            border: NM.borderLight,
            boxShadow: NM.convexSm,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: NM.textSub,
          }}
          title="返回桌面"
        >
          <ArrowLeft size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BookOpen size={18} color="#C59A4E" />
          <span style={{ fontSize: '16px', fontWeight: 800, color: NM.textMain, letterSpacing: '0.5px' }}>
            答案之书
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsHistoryOpen(true)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: NM.cardBg,
            border: NM.borderLight,
            boxShadow: NM.convexSm,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#C59A4E',
          }}
          title="启示手账"
        >
          <ScrollText size={18} />
        </button>
      </div>

      {/* 主舞台：精装书本与输入 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          width: '100%',
          margin: '10px 0',
        }}
      >
        {/* 实体轻拟物精装书 */}
        <div
          onClick={handleToggleFlip}
          style={{
            width: '100%',
            maxWidth: '280px',
            height: '210px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #F9FBFE 0%, #E2E8F0 100%)',
            boxShadow: isFlipping
              ? NM.insetSm
              : '8px 8px 22px rgba(150, 168, 190, 0.6), -7px -7px 18px rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.9)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            cursor: 'pointer',
            transform: isFlipping ? 'scale(0.96) rotateY(-15deg)' : 'scale(1)',
            transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxSizing: 'border-box',
            userSelect: 'none',
          }}
        >
          {/* 书脊立体凹线 */}
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: 0,
              bottom: 0,
              width: '4px',
              background: 'linear-gradient(to right, rgba(0,0,0,0.06), rgba(255,255,255,0.7))',
              borderRadius: '2px',
            }}
          />

          {/* 烫金虚线框 */}
          <div
            style={{
              position: 'absolute',
              inset: '10px',
              border: '1px dashed rgba(197, 154, 78, 0.45)',
              borderRadius: '10px',
              pointerEvents: 'none',
            }}
          />

          {!isRevealed ? (
            /* 封面正面 */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Sparkles size={28} color="#C59A4E" style={{ marginBottom: '6px' }} />
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  letterSpacing: '2px',
                  color: '#8F6927',
                  textTransform: 'uppercase',
                  marginBottom: '2px',
                }}
              >
                The Book of Answers
              </div>
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  color: NM.textMain,
                  letterSpacing: '3px',
                  marginBottom: '6px',
                }}
              >
                答案之书
              </div>
              <div style={{ fontSize: '11px', color: NM.textSub, lineHeight: 1.5 }}>
                轻触书本或下方按键<br />
                闭眼默念，答案自现
              </div>
            </div>
          ) : (
            /* 翻开内页呈现 */
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                animation: 'pageAppear 0.3s ease-out',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px dashed rgba(197, 154, 78, 0.35)',
                  paddingBottom: '5px',
                }}
              >
                <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#8F6927', letterSpacing: '1px' }}>
                  PAGE {currentAnswer?.page || 138}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    color: NM.textSub,
                    maxWidth: '160px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  🤔 {currentAnswer?.recordedQuestion}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  gap: '4px',
                  margin: '8px 0',
                }}
              >
                <div
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 800,
                    letterSpacing: '1.5px',
                    color: '#8F6927',
                    textTransform: 'uppercase',
                  }}
                >
                  {currentAnswer?.en}
                </div>
                <div
                  style={{
                    fontSize: '22px',
                    fontWeight: 900,
                    color: NM.textMain,
                    letterSpacing: '1.5px',
                    lineHeight: 1.35,
                    textShadow: '0 1px 2px rgba(255,255,255,0.8)',
                  }}
                >
                  {currentAnswer?.cn}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.65)',
                  borderRadius: '8px',
                  padding: '5px 8px',
                  fontSize: '10.5px',
                  color: '#4A5B73',
                  textAlign: 'center',
                  lineHeight: 1.4,
                  border: '1px solid rgba(255, 255, 255, 0.7)',
                }}
              >
                🍃 答案已然显现，去印证你内心的抉择。
              </div>
            </div>
          )}
        </div>

        {/* 步骤 1: 困惑输入与快捷预设 */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleToggleFlip();
              }
            }}
            placeholder="写下你此刻纠结的问题 (或点击下方预设)"
            maxLength={40}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '12px',
              backgroundColor: NM.cardBg,
              border: NM.borderSoft,
              boxShadow: NM.insetSm,
              fontSize: '12.5px',
              color: NM.textMain,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />

          {/* 预设胶囊按钮 (原生 React 点击受控填入) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
            {PRESET_QUESTIONS.map((item) => (
              <button
                key={item.text}
                type="button"
                onClick={() => setQuestion(item.text)}
                style={{
                  padding: '5px 11px',
                  borderRadius: '12px',
                  backgroundColor: NM.cardBg,
                  border: NM.borderLight,
                  boxShadow: NM.convexXs,
                  fontSize: '11px',
                  fontWeight: 600,
                  color: question === item.text ? '#8F6927' : NM.textSub,
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 步骤 2: 翻开 / 合上操作大按钮 */}
      <button
        type="button"
        onClick={handleToggleFlip}
        disabled={isFlipping}
        style={{
          width: '100%',
          height: '46px',
          borderRadius: '23px',
          backgroundColor: NM.cardBg,
          border: NM.borderLight,
          boxShadow: isFlipping ? NM.insetSm : NM.convexSm,
          color: '#8F6927',
          fontSize: '15px',
          fontWeight: 800,
          cursor: isFlipping ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          outline: 'none',
          transition: 'all 0.15s',
          flexShrink: 0,
          userSelect: 'none',
        }}
      >
        {isRevealed ? (
          <>
            <RotateCcw size={16} />
            <span>合上书本 · 再问一次</span>
          </>
        ) : (
          <>
            <BookOpen size={16} />
            <span>{isFlipping ? '正在翻开命运之页...' : '翻开指引之页'}</span>
          </>
        )}
      </button>

      {/* 历史记录手账抽屉弹窗 */}
      {isHistoryOpen && (
        <div
          style={{
            position: 'absolute',
            inset: '12px',
            backgroundColor: NM.cardBg,
            borderRadius: '18px',
            boxShadow: NM.convexLg,
            border: NM.borderLight,
            padding: '14px',
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: NM.borderSoft,
              paddingBottom: '8px',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#8F6927' }}>
              📜 启示手账纪录
            </span>
            <button
              type="button"
              onClick={() => setIsHistoryOpen(false)}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: NM.bgInset,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: NM.textSub,
              }}
            >
              <X size={15} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: NM.textMuted, fontSize: '11px' }}>
                暂无历史问答记录，快去翻开第一页吧！
              </div>
            ) : (
              history.map((rec) => (
                <div
                  key={rec.id}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    backgroundColor: NM.bgInset,
                    boxShadow: NM.insetXs,
                    fontSize: '11px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3px',
                  }}
                >
                  <div style={{ color: NM.textSub }}>
                    问：{rec.question} <span style={{ fontSize: '9px', color: NM.textMuted }}>({rec.timeStr})</span>
                  </div>
                  <div style={{ fontWeight: 800, color: NM.textMain }}>
                    答：{rec.answerCn} ({rec.answerEn}) · P{rec.page}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 提示 Toast */}
      {toastMsg && (
        <div
          style={{
            position: 'absolute',
            top: '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(51, 66, 87, 0.92)',
            color: '#FFFFFF',
            padding: '7px 16px',
            borderRadius: '20px',
            fontSize: '11.5px',
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
            zIndex: 100,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {toastMsg}
        </div>
      )}

      <style>{`
        @keyframes pageAppear {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
