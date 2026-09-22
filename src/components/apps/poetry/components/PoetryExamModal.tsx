import React, { useState, useMemo } from 'react';
import { X, RotateCcw, Award, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { SavedPoemRecord, PoetryExamQuestion } from '../../../../core/poetry/poetryTypes';
import { generateExamQuestion, getRankBadgeInfo, calculateKejuRank } from '../../../../core/poetry/clozeEngine';

interface PoetryExamModalProps {
  poem: SavedPoemRecord;
  onClose: () => void;
  onExamSuccess: (poemId: string) => void;
}

export const PoetryExamModal: React.FC<PoetryExamModalProps> = ({
  poem,
  onClose,
  onExamSuccess,
}) => {
  // 生成考卷题目
  const [exam, setExam] = useState<PoetryExamQuestion>(() => generateExamQuestion(poem));
  // 当前正在考核的空位索引
  const [activeBlankIndex, setActiveBlankIndex] = useState<number>(0);
  // 用户当前答案映射: blankIndex -> chosenChar
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  // 错误震动动画反馈状态
  const [errorOption, setErrorOption] = useState<string | null>(null);
  // 是否通关完成
  const [isPassed, setIsPassed] = useState<boolean>(false);
  // 连击计数
  const [combo, setCombo] = useState<number>(0);

  const currentBlank = exam.blanks[activeBlankIndex];
  const totalBlanks = exam.totalBlanks;

  const currentRank = calculateKejuRank(poem.quizPassCount + (isPassed ? 1 : 0));
  const badgeInfo = getRankBadgeInfo(currentRank);

  // 重新生成考题
  const handleRestart = () => {
    setExam(generateExamQuestion(poem));
    setActiveBlankIndex(0);
    setUserAnswers({});
    setErrorOption(null);
    setIsPassed(false);
    setCombo(0);
  };

  // 选择填空字
  const handleSelectOption = (char: string) => {
    if (isPassed || !currentBlank) return;

    if (char === currentBlank.correctChar) {
      // 答对
      const newAnswers = { ...userAnswers, [activeBlankIndex]: char };
      setUserAnswers(newAnswers);
      setErrorOption(null);
      setCombo((prev) => prev + 1);

      if (activeBlankIndex + 1 < totalBlanks) {
        setActiveBlankIndex((prev) => prev + 1);
      } else {
        // 全部通过！
        setIsPassed(true);
        onExamSuccess(poem.id);
      }
    } else {
      // 答错
      setErrorOption(char);
      setCombo(0);
      setTimeout(() => setErrorOption(null), 700);
    }
  };

  // 撤销上一填空
  const handleUndo = () => {
    if (activeBlankIndex > 0 && !isPassed) {
      const prevIdx = activeBlankIndex - 1;
      const newAns = { ...userAnswers };
      delete newAns[prevIdx];
      setUserAnswers(newAns);
      setActiveBlankIndex(prevIdx);
      setErrorOption(null);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(20, 16, 12, 0.78)',
        backdropFilter: 'blur(10px)',
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease',
      }}
    >
      {/* 科举试卷卷轴主体 */}
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          maxHeight: '92vh',
          backgroundColor: '#faf5eb',
          borderRadius: 20,
          border: '2px solid #b0894c',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* 顶部卷轴提梁与标题栏 */}
        <div
          style={{
            background: 'linear-gradient(180deg, #f3ebd8 0%, #faefe0 100%)',
            padding: '14px 16px 10px',
            borderBottom: '1.5px solid #dfd1bd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: badgeInfo.color,
                background: badgeInfo.bg,
                border: `1px solid ${badgeInfo.border}`,
                padding: '1px 6px',
                borderRadius: 4,
              }}
            >
              {badgeInfo.label}
            </span>
            <span
              style={{
                fontWeight: 700,
                color: '#2a2016',
                fontFamily: '"Songti SC", "SimSun", serif',
                fontSize: '0.98rem',
              }}
            >
              科举殿试 · 挖词通关
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: 4,
              cursor: 'pointer',
              color: '#8b7a66',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 题头与进度指示 */}
        <div
          style={{
            padding: '10px 16px 6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f9f3e5',
            borderBottom: '1px dashed #e6dbca',
          }}
        >
          <div style={{ fontSize: '0.82rem', color: '#6e5e4d', fontWeight: 600 }}>
            《{poem.title}》· {poem.author}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {combo >= 2 && !isPassed && (
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: '#dc2626',
                  animation: 'pulse 1s infinite',
                }}
              >
                连中 {combo} 题!
              </span>
            )}

            <span
              style={{
                fontSize: '0.76rem',
                color: '#9e8769',
                fontWeight: 600,
              }}
            >
              进度: {Math.min(activeBlankIndex + (isPassed ? 1 : 0), totalBlanks)} / {totalBlanks}
            </span>
          </div>
        </div>

        {/* 试卷诗句卷轴区 */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            background: '#faf6ee',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            position: 'relative',
          }}
        >
          {/* 通关大红朱印盖章浮层 */}
          {isPassed && (
            <div
              style={{
                position: 'absolute',
                top: 20,
                right: 24,
                zIndex: 10,
                border: '3px solid #b91c1c',
                borderRadius: 8,
                padding: '6px 12px',
                color: '#b91c1c',
                fontSize: '1.05rem',
                fontWeight: 900,
                letterSpacing: '0.15em',
                transform: 'rotate(-12deg) scale(1.05)',
                backgroundColor: 'rgba(254, 242, 242, 0.95)',
                boxShadow: '0 4px 14px rgba(185, 28, 28, 0.3)',
                animation: 'stampIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                userSelect: 'none',
              }}
            >
              ★ 御批·熟背 ★
            </div>
          )}

          {/* 逐句排版渲染，并高亮挖空 */}
          {poem.content.map((line, lIdx) => {
            const lineBlank = exam.blanks.find((b) => b.lineIndex === lIdx);

            return (
              <div
                key={lIdx}
                style={{
                  fontFamily: '"Songti SC", "SimSun", serif',
                  fontSize: '1.08rem',
                  lineHeight: 1.8,
                  color: '#2a221a',
                  letterSpacing: '0.06em',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                {Array.from(line).map((char, cIdx) => {
                  const isThisBlank = lineBlank && lineBlank.charIndex === cIdx;

                  if (!isThisBlank) {
                    return <span key={cIdx}>{char}</span>;
                  }

                  const bIndex = exam.blanks.findIndex(
                    (b) => b.lineIndex === lIdx && b.charIndex === cIdx
                  );
                  const answeredChar = userAnswers[bIndex];
                  const isActive = activeBlankIndex === bIndex && !isPassed;

                  return (
                    <span
                      key={cIdx}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '28px',
                        height: '30px',
                        margin: '0 2px',
                        borderRadius: 6,
                        fontWeight: 800,
                        fontSize: '1.05rem',
                        transition: 'all 0.2s ease',
                        border: answeredChar
                          ? '1.5px solid #059669'
                          : isActive
                          ? '2px solid #b91c1c'
                          : '1.5px dashed #c0b29c',
                        backgroundColor: answeredChar
                          ? '#ecfdf5'
                          : isActive
                          ? '#fef2f2'
                          : '#f0e8d8',
                        color: answeredChar
                          ? '#047857'
                          : isActive
                          ? '#b91c1c'
                          : '#a4937d',
                        boxShadow: isActive
                          ? '0 0 8px rgba(185, 28, 28, 0.3)'
                          : 'none',
                      }}
                    >
                      {answeredChar ? answeredChar : isActive ? '?' : '·'}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* 答题控制与备选字区 */}
        <div
          style={{
            background: 'linear-gradient(180deg, #f7efe0 0%, #f3e6d1 100%)',
            borderTop: '1.5px solid #dfd2bd',
            padding: '14px 16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {!isPassed ? (
            <>
              {/* 答题提示词 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontSize: '0.82rem',
                    color: '#6e5a44',
                    fontWeight: 700,
                  }}
                >
                  请点选第 {activeBlankIndex + 1} 句关键诗眼：
                </span>

                {activeBlankIndex > 0 && (
                  <button
                    type="button"
                    onClick={handleUndo}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#8b7250',
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    撤销上一字
                  </button>
                )}
              </div>

              {/* 4 个古典木印字块候选 */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 10,
                }}
              >
                {currentBlank?.options.map((char) => {
                  const isWrong = errorOption === char;

                  return (
                    <button
                      key={char}
                      type="button"
                      onClick={() => handleSelectOption(char)}
                      style={{
                        height: '46px',
                        border: isWrong
                          ? '2px solid #dc2626'
                          : '1.5px solid #c8b79f',
                        borderRadius: 10,
                        backgroundColor: isWrong ? '#fee2e2' : '#ffffff',
                        color: isWrong ? '#b91c1c' : '#292015',
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        fontFamily: '"Songti SC", "SimSun", serif',
                        cursor: 'pointer',
                        boxShadow:
                          '0 3px 6px rgba(120, 95, 65, 0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
                        transition: 'transform 0.1s ease, border-color 0.15s ease',
                      }}
                      onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
                      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      {char}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* 通关成功庆贺区 */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                textAlign: 'center',
                padding: '4px 0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles color="#d97706" size={20} />
                <span
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: '#991b1b',
                    fontFamily: '"Songti SC", "SimSun", serif',
                  }}
                >
                  金榜题名 · 全篇通关！
                </span>
                <Sparkles color="#d97706" size={20} />
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#68543f' }}>
                已将此篇晋升为「熟背·金榜」，累计通关 {poem.quizPassCount + 1} 次
              </p>

              <div style={{ display: 'flex', gap: 10, marginTop: 6, width: '100%' }}>
                <button
                  type="button"
                  onClick={handleRestart}
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '9px 12px',
                    borderRadius: 10,
                    border: '1px solid #d4c5af',
                    background: '#fcfaf5',
                    color: '#6d5a45',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <RotateCcw size={15} />
                  <span>再试一次</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '9px 12px',
                    borderRadius: 10,
                    border: '1px solid #b91c1c',
                    background: 'linear-gradient(180deg, #dc2626 0%, #b91c1c 100%)',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 3px 8px rgba(185, 28, 28, 0.3)',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>荣登金榜</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
