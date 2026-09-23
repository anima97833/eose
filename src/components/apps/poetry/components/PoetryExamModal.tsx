import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  RotateCcw,
  Award,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Mic,
  MicOff,
  PenTool,
  BookOpen,
  Volume2,
  Clock,
  Send,
  AlertCircle,
  Trophy,
} from 'lucide-react';
import { SavedPoemRecord, PoetryExamQuestion } from '../../../../core/poetry/poetryTypes';
import { generateExamQuestion, getRankBadgeInfo, calculateKejuRank } from '../../../../core/poetry/clozeEngine';
import {
  calculateRecommendedRecitationSeconds,
  evaluatePoetryRecitation,
  RecitationEvaluationResult,
  createSpeechRecognizer,
  isWebSpeechSupported,
} from '../../../../core/poetry/recitationEngine';
import { rewardPoetryMasteryToRPG, recordPoemModePassed } from '../../../../core/poetry/poetryStorage';

interface PoetryExamModalProps {
  poem: SavedPoemRecord;
  onClose: () => void;
  onExamSuccess: (poemId: string) => void;
  onToast?: (msg: string) => void;
}

type ExamMode = 'cloze' | 'dictation' | 'recitation';

export const PoetryExamModal: React.FC<PoetryExamModalProps> = ({
  poem,
  onClose,
  onExamSuccess,
  onToast,
}) => {
  const [mode, setMode] = useState<ExamMode>('cloze');
  // 记录本诗词已通过的关卡集合（三关任选通过两关即算熟背）
  const [passedModes, setPassedModes] = useState<Set<ExamMode>>(
    () => new Set(poem.passedExamModes || [])
  );
  const [isPassed, setIsPassed] = useState<boolean>(
    (poem.passedExamModes?.length || 0) >= 2 || poem.status === 'mastered'
  );
  const [rpgRewardText, setRpgRewardText] = useState<string | null>(null);

  // 触发单关卡考核通过并累计“三通二”熟背判定
  const handleModePassed = async (currentMode: ExamMode) => {
    try {
      const res = await recordPoemModePassed(poem.id, currentMode);
      const newPassedSet = new Set(res.poem.passedExamModes || []);
      setPassedModes(newPassedSet);

      const modeNames: Record<ExamMode, string> = {
        cloze: '乡试·选字',
        dictation: '省试·默写',
        recitation: '殿试·背诵',
      };

      if (res.isNewlyMastered || newPassedSet.size >= 2) {
        // 达到通过两关及以上 -> 正式达成熟背认证！
        setIsPassed(true);
        onExamSuccess(poem.id);
        const reward = rewardPoetryMasteryToRPG();
        const notice = `🏆 金榜题名！达成两关考核，正式认证为【已熟背】！获得：${reward.message}`;
        setRpgRewardText(notice);
        if (onToast) onToast(notice);
      } else {
        // 仅通过 1 关
        const notice = `✨「${modeNames[currentMode]}」考核通过！(当前 1/2 关，还需通过剩余任一关即可熟背认证)`;
        setRpgRewardText(notice);
        if (onToast) onToast(notice);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ================= 1. 乡试 · 选字填空状态 =================
  const [clozeExam, setClozeExam] = useState<PoetryExamQuestion>(() => generateExamQuestion(poem));
  const [activeBlankIndex, setActiveBlankIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [errorOption, setErrorOption] = useState<string | null>(null);
  const [combo, setCombo] = useState<number>(0);

  const currentBlank = clozeExam.blanks[activeBlankIndex];
  const totalBlanks = clozeExam.totalBlanks;

  const handleRestartCloze = () => {
    setClozeExam(generateExamQuestion(poem));
    setActiveBlankIndex(0);
    setUserAnswers({});
    setErrorOption(null);
    setIsPassed(false);
    setCombo(0);
  };

  const handleSelectOption = (char: string) => {
    if (isPassed || !currentBlank) return;

    if (char === currentBlank.correctChar) {
      const newAnswers = { ...userAnswers, [activeBlankIndex]: char };
      setUserAnswers(newAnswers);
      setErrorOption(null);
      setCombo((prev) => prev + 1);

      if (activeBlankIndex + 1 < totalBlanks) {
        setActiveBlankIndex((prev) => prev + 1);
      } else {
        handleModePassed('cloze');
      }
    } else {
      setErrorOption(char);
      setCombo(0);
      setTimeout(() => setErrorOption(null), 700);
    }
  };

  // ================= 2. 省试 · 挥毫默写状态 =================
  const [dictationInput, setDictationInput] = useState<string>('');
  const [dictationResult, setDictationResult] = useState<RecitationEvaluationResult | null>(null);

  const handleSubmitDictation = () => {
    if (!dictationInput.trim()) {
      if (onToast) onToast('请先挥毫默写全诗正文');
      return;
    }
    const evalRes = evaluatePoetryRecitation(dictationInput, poem.content);
    setDictationResult(evalRes);
    if (evalRes.passed) {
      handleModePassed('dictation');
    }
  };

  const handleRestartDictation = () => {
    setDictationInput('');
    setDictationResult(null);
    setIsPassed(false);
  };

  // ================= 3. 殿试 · 登楼背诵状态 =================
  const recRecommendation = useMemo(
    () => calculateRecommendedRecitationSeconds(poem.content),
    [poem.content]
  );
  const [timeLimit, setTimeLimit] = useState<number>(recRecommendation.recommendedSeconds);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(recRecommendation.recommendedSeconds);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recitedTranscript, setRecitedTranscript] = useState<string>('');
  const [recitationResult, setRecitationResult] = useState<RecitationEvaluationResult | null>(null);
  const [recitationError, setRecitationError] = useState<string | null>(null);

  const recognizerRef = useRef<{ start: () => void; stop: () => void; isSupported: boolean } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleStartRecitation = () => {
    setRecitationResult(null);
    setRecitedTranscript('');
    setRecitationError(null);
    setIsPassed(false);
    setSecondsRemaining(timeLimit);

    const recognizer = createSpeechRecognizer(
      (text) => {
        setRecitedTranscript(text);
      },
      (err) => {
        setRecitationError(err);
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      },
      () => {
        // onEnd
      }
    );

    recognizerRef.current = recognizer;
    recognizer.start();
    setIsRecording(true);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleStopAndEvaluate();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStopAndEvaluate = (manualTranscript?: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }
    setIsRecording(false);

    const textToEval = manualTranscript ?? recitedTranscript;
    const evalRes = evaluatePoetryRecitation(textToEval, poem.content);
    setRecitationResult(evalRes);
    if (evalRes.passed) {
      handleModePassed('recitation');
    }
  };

  const handleRestartRecitation = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognizerRef.current) recognizerRef.current.stop();
    setIsRecording(false);
    setRecitedTranscript('');
    setRecitationResult(null);
    setRecitationError(null);
    setIsPassed(false);
    setSecondsRemaining(timeLimit);
  };

  const currentRank = calculateKejuRank(poem.quizPassCount + (isPassed ? 1 : 0));
  const badgeInfo = getRankBadgeInfo(currentRank);

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
          maxWidth: '400px',
          maxHeight: '94vh',
          backgroundColor: '#FAF5EB',
          borderRadius: 22,
          border: '2.5px solid #B0894C',
          boxShadow: '0 24px 50px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* 顶部卷轴提梁与标题栏 */}
        <div
          style={{
            background: 'linear-gradient(180deg, #F3EBD8 0%, #FAEDD9 100%)',
            padding: '12px 16px 8px',
            borderBottom: '1.5px solid #D8C7A5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '18px' }}>📜</span>
            <div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 900,
                  color: '#451A03',
                  fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", cursive, sans-serif',
                }}
              >
                科举熟背考核 · {poem.title}
              </div>
              <div style={{ fontSize: '10.5px', color: '#78350F' }}>
                [{poem.dynasty}] {poem.author} · 晋位阶「{badgeInfo.label}」
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#78350F',
              cursor: 'pointer',
              padding: 4,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ================= 三级科举考核模式切换选项卡 ================= */}
        <div
          style={{
            display: 'flex',
            background: '#EFE5D0',
            padding: '4px 8px',
            borderBottom: '1px solid #D8C7A5',
            gap: 4,
          }}
        >
          <button
            type="button"
            onClick={() => setMode('cloze')}
            style={{
              flex: 1,
              padding: '6px 4px',
              borderRadius: 8,
              border: mode === 'cloze' ? '1.5px solid #B0894C' : '1px solid transparent',
              background: mode === 'cloze' ? '#FFFFFF' : 'transparent',
              color: mode === 'cloze' ? '#991B1B' : '#78350F',
              fontSize: '11px',
              fontWeight: mode === 'cloze' ? 900 : 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              boxShadow: mode === 'cloze' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <BookOpen size={12} />
            <span>乡试·选字</span>
            {passedModes.has('cloze') && (
              <span style={{ color: '#16A34A', fontWeight: 900, fontSize: '11px' }}>✓</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMode('dictation')}
            style={{
              flex: 1,
              padding: '6px 4px',
              borderRadius: 8,
              border: mode === 'dictation' ? '1.5px solid #B0894C' : '1px solid transparent',
              background: mode === 'dictation' ? '#FFFFFF' : 'transparent',
              color: mode === 'dictation' ? '#991B1B' : '#78350F',
              fontSize: '11px',
              fontWeight: mode === 'dictation' ? 900 : 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              boxShadow: mode === 'dictation' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <PenTool size={12} />
            <span>省试·默写</span>
            {passedModes.has('dictation') && (
              <span style={{ color: '#16A34A', fontWeight: 900, fontSize: '11px' }}>✓</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMode('recitation')}
            style={{
              flex: 1,
              padding: '6px 4px',
              borderRadius: 8,
              border: mode === 'recitation' ? '1.5px solid #B0894C' : '1px solid transparent',
              background: mode === 'recitation' ? '#FFFFFF' : 'transparent',
              color: mode === 'recitation' ? '#991B1B' : '#78350F',
              fontSize: '11px',
              fontWeight: mode === 'recitation' ? 900 : 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              boxShadow: mode === 'recitation' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <Mic size={12} />
            <span>殿试·背诵</span>
            {passedModes.has('recitation') && (
              <span style={{ color: '#16A34A', fontWeight: 900, fontSize: '11px' }}>✓</span>
            )}
          </button>
        </div>

        {/* ================= 熟背两关进度指示条 ================= */}
        <div
          style={{
            padding: '7px 14px 5px',
            backgroundColor: '#FAF5EB',
            borderBottom: '1px solid #EAE0CD',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: 800 }}>
            <span style={{ color: '#78350F' }}>
              熟背认证进度: <b style={{ color: passedModes.size >= 2 ? '#059669' : '#D97706' }}>{Math.min(2, passedModes.size)} / 2 关</b> (三关通过两关即算熟背)
            </span>
            {passedModes.size >= 2 ? (
              <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: 2, fontSize: '11px' }}>
                <CheckCircle2 size={12} /> 已达成熟背
              </span>
            ) : (
              <span style={{ color: '#D97706', fontSize: '10.5px' }}>
                还需通过 {2 - Math.min(2, passedModes.size)} 关
              </span>
            )}
          </div>

          <div
            style={{
              width: '100%',
              height: '5px',
              borderRadius: '3px',
              backgroundColor: '#E5DAC9',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.min(100, (passedModes.size / 2) * 100)}%`,
                height: '100%',
                background: passedModes.size >= 2
                  ? 'linear-gradient(90deg, #10B981, #059669)'
                  : 'linear-gradient(90deg, #F59E0B, #D97706)',
                borderRadius: '3px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* 熟背通关与 RPG 奖励高光横幅 */}
        {rpgRewardText && isPassed && (
          <div
            style={{
              margin: '8px 14px 0',
              padding: '6px 12px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
              border: '1.5px solid #F59E0B',
              color: '#92400E',
              fontSize: '11.5px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 6px rgba(245, 158, 11, 0.25)',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <Trophy size={15} color="#D97706" />
            <span>{rpgRewardText}</span>
          </div>
        )}

        {/* ================= 模式内容区域 ================= */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 16px' }}>
          {/* ================= 模式 1: 乡试·抠字填空 ================= */}
          {mode === 'cloze' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* 诗句题目展示 */}
              <div
                style={{
                  padding: '14px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 14,
                  border: '1px solid #D8C7A5',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'center' }}>
                  {poem.content.map((line, lIdx) => (
                    <div
                      key={lIdx}
                      style={{
                        fontSize: '17px',
                        letterSpacing: '2px',
                        color: '#292524',
                        fontFamily: '"Songti SC", "SimSun", "STSong", serif, sans-serif',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        lineHeight: 1.8,
                      }}
                    >
                      {Array.from(line).map((char, cIdx) => {
                        const targetBlank = clozeExam.blanks.find(
                          (b) => b.lineIndex === lIdx && b.charIndex === cIdx
                        );
                        if (!targetBlank) {
                          return <span key={cIdx}>{char}</span>;
                        }

                        const blankIdx = clozeExam.blanks.indexOf(targetBlank);
                        const isCurrent = blankIdx === activeBlankIndex && !isPassed;
                        const filledChar = userAnswers[blankIdx];

                        return (
                          <span
                            key={cIdx}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '28px',
                              height: '28px',
                              margin: '0 2px',
                              borderRadius: 6,
                              fontSize: '16px',
                              fontWeight: 900,
                              backgroundColor: filledChar
                                ? '#ECFDF5'
                                : isCurrent
                                ? '#FEF08A'
                                : '#F1F5F9',
                              border: filledChar
                                ? '1.5px solid #10B981'
                                : isCurrent
                                ? '2px solid #F59E0B'
                                : '1px dashed #94A3B8',
                              color: filledChar ? '#065F46' : '#1E293B',
                              boxShadow: isCurrent ? '0 0 6px rgba(245, 158, 11, 0.45)' : 'none',
                              transform: isCurrent ? 'scale(1.08)' : 'none',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {filledChar || (isCurrent ? '?' : '')}
                          </span>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* 候选字选择区 */}
              {!isPassed && currentBlank && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#78350F',
                      fontWeight: 800,
                      textAlign: 'center',
                    }}
                  >
                    请为第 <b>{activeBlankIndex + 1}</b> 空点睛破题 (共 {totalBlanks} 空):
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {currentBlank.options.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectOption(opt)}
                        style={{
                          height: '46px',
                          borderRadius: 12,
                          border: errorOption === opt ? '2px solid #DC2626' : '1.5px solid #B0894C',
                          backgroundColor: errorOption === opt ? '#FEE2E2' : '#FFFFFF',
                          color: errorOption === opt ? '#B91C1C' : '#292524',
                          fontSize: '18px',
                          fontWeight: 900,
                          cursor: 'pointer',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.06)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 通关或重来按钮 */}
              {isPassed && (
                <div style={{ textAlign: 'center', marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={handleRestartCloze}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 12,
                      border: '1.5px solid #D8C7A5',
                      backgroundColor: '#FFFFFF',
                      color: '#78350F',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <RotateCcw size={13} />
                    <span>再刷一卷</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= 模式 2: 省试·挥毫默写 ================= */}
          {mode === 'dictation' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: '11px', color: '#78350F', fontWeight: 600 }}>
                💡 <b>纯净默写帖</b>：请在此一气呵成默写全诗。系统自动忽略标点空格，以全诗文字顺序比对批阅。
              </div>

              {/* 默写输入框 */}
              {!dictationResult && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <textarea
                    rows={6}
                    value={dictationInput}
                    onChange={(e) => setDictationInput(e.target.value)}
                    placeholder="落墨默写此处...&#10;例：床前明月光，疑是地上霜。举头望山月，低头思故乡。"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 12,
                      border: '1.5px solid #D8C7A5',
                      backgroundColor: '#FFFFFF',
                      fontSize: '14px',
                      color: '#292524',
                      lineHeight: 1.7,
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: '"Songti SC", "SimSun", "STSong", serif, sans-serif',
                    }}
                  />

                  <button
                    type="button"
                    onClick={handleSubmitDictation}
                    style={{
                      padding: '10px 0',
                      borderRadius: 12,
                      border: '1.5px solid #991B1B',
                      background: 'linear-gradient(180deg, #DC2626 0%, #B91C1C 100%)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      boxShadow: '0 3px 8px rgba(185, 28, 28, 0.35)',
                    }}
                  >
                    <Send size={15} />
                    <span>呈卷批阅 (Submit)</span>
                  </button>
                </div>
              )}

              {/* 批阅报告与逐字比对 */}
              {dictationResult && (
                <div
                  style={{
                    padding: '12px 14px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 14,
                    border: dictationResult.passed ? '2px solid #10B981' : '2px solid #EF4444',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: dictationResult.passed ? '#059669' : '#DC2626' }}>
                      {dictationResult.passed ? '🏆 默写金榜题名！' : '❌ 默写尚有疏漏'}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 900, color: '#78350F' }}>
                      契合度: <b>{dictationResult.similarity}%</b>
                    </div>
                  </div>

                  {/* 逐句逐字对照 */}
                  <div
                    style={{
                      padding: '8px 10px',
                      backgroundColor: '#FAF5EB',
                      borderRadius: 10,
                      lineHeight: 1.8,
                      fontSize: '15px',
                      fontFamily: '"Songti SC", "SimSun", "STSong", serif, sans-serif',
                      textAlign: 'center',
                    }}
                  >
                    {dictationResult.lineDiffs.map((line, lIdx) => (
                      <div key={lIdx}>
                        {line.map((item, cIdx) => (
                          <span
                            key={cIdx}
                            style={{
                              color: item.isPunctuation
                                ? '#94A3B8'
                                : item.matched
                                ? '#059669'
                                : '#DC2626',
                              backgroundColor: !item.matched && !item.isPunctuation ? '#FEE2E2' : 'transparent',
                              borderRadius: 3,
                              fontWeight: item.matched ? 600 : 900,
                            }}
                          >
                            {item.char}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={handleRestartDictation}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        borderRadius: 10,
                        border: '1.5px solid #D8C7A5',
                        backgroundColor: '#F3EBD8',
                        color: '#78350F',
                        fontSize: '12.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      重新默写
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= 模式 3: 殿试·登楼背诵 ================= */}
          {mode === 'recitation' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* 模式说明与时间配置 */}
              {!isRecording && !recitationResult && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div
                    style={{
                      padding: '10px 12px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: 12,
                      border: '1.5px solid #D8C7A5',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#78350F' }}>
                        ⏳ 规定背诵时限:
                      </span>
                      <span style={{ fontSize: '15px', fontWeight: 900, color: '#DC2626' }}>
                        {timeLimit} 秒
                      </span>
                    </div>

                    {/* 轻拟物滑动调节滑块 (10s ~ 180s) */}
                    <input
                      type="range"
                      min={10}
                      max={180}
                      step={5}
                      value={timeLimit}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setTimeLimit(val);
                        setSecondsRemaining(val);
                      }}
                      style={{
                        width: '100%',
                        accentColor: '#DC2626',
                        cursor: 'pointer',
                      }}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94A3B8' }}>
                      <span>10秒 (极速)</span>
                      <span>推荐: {recRecommendation.recommendedSeconds}秒 ({recRecommendation.charCount}字)</span>
                      <span>180秒 (慢品)</span>
                    </div>
                  </div>

                  {recitationError && (
                    <div
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        backgroundColor: '#FEE2E2',
                        border: '1px solid #FCA5A5',
                        color: '#B91C1C',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <AlertCircle size={14} />
                      <span>{recitationError}</span>
                    </div>
                  )}

                  {/* 开启麦克风背诵大按钮 */}
                  <button
                    type="button"
                    onClick={handleStartRecitation}
                    style={{
                      height: '52px',
                      borderRadius: 26,
                      border: '2px solid #7F1D1D',
                      background: 'linear-gradient(180deg, #EF4444 0%, #B91C1C 100%)',
                      color: '#FFFFFF',
                      fontSize: '16px',
                      fontWeight: 900,
                      letterSpacing: '1px',
                      fontFamily: '"ZCOOL KuaiLe", "Yuanti SC", "YouYuan", cursive, sans-serif',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 6px 16px rgba(185, 28, 28, 0.4)',
                    }}
                  >
                    <Mic size={20} strokeWidth={2.6} />
                    <span>登楼起诵 (开启麦克风)</span>
                  </button>
                </div>
              )}

              {/* 背诵录音进行中界面 */}
              {isRecording && (
                <div
                  style={{
                    padding: '16px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 16,
                    border: '2px solid #DC2626',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 12,
                    boxShadow: '0 4px 15px rgba(220, 38, 38, 0.15)',
                  }}
                >
                  {/* 倒计时大时钟 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={18} color="#DC2626" />
                    <span
                      style={{
                        fontSize: '26px',
                        fontWeight: 900,
                        color: secondsRemaining <= 5 ? '#DC2626' : '#1E293B',
                        fontFamily: 'monospace',
                        animation: secondsRemaining <= 5 ? 'pulse 0.5s infinite' : 'none',
                      }}
                    >
                      {secondsRemaining}s
                    </span>
                  </div>

                  {/* 麦克风动效光晕 */}
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      backgroundColor: '#FEE2E2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#DC2626',
                      boxShadow: '0 0 16px rgba(239, 68, 68, 0.5)',
                      animation: 'pulse 1.2s infinite',
                    }}
                  >
                    <Mic size={26} />
                  </div>

                  <div style={{ fontSize: '11px', color: '#78350F', fontWeight: 600 }}>
                    🎙️ 正在实时聆听... 请清晰朗诵全诗
                  </div>

                  {/* 实时听写文本框 */}
                  <div
                    style={{
                      width: '100%',
                      minHeight: '48px',
                      padding: '8px 10px',
                      backgroundColor: '#FAF5EB',
                      borderRadius: 10,
                      border: '1px solid #D8C7A5',
                      fontSize: '12px',
                      color: '#44403C',
                      lineHeight: 1.5,
                      boxSizing: 'border-box',
                    }}
                  >
                    {recitedTranscript || <span style={{ color: '#A8A29E' }}>朗诵词将实时呈现在此...</span>}
                  </div>

                  {/* 提前背完按钮 */}
                  <button
                    type="button"
                    onClick={() => handleStopAndEvaluate()}
                    style={{
                      width: '100%',
                      padding: '10px 0',
                      borderRadius: 14,
                      border: '1.5px solid #15803D',
                      background: 'linear-gradient(180deg, #22C55E 0%, #15803D 100%)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 900,
                      cursor: 'pointer',
                      boxShadow: '0 3px 8px rgba(34, 197, 94, 0.3)',
                    }}
                  >
                    背诵完毕，提早呈卷
                  </button>
                </div>
              )}

              {/* 批阅结果报告卡 */}
              {recitationResult && (
                <div
                  style={{
                    padding: '12px 14px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 14,
                    border: recitationResult.passed ? '2px solid #10B981' : '2px solid #EF4444',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: recitationResult.passed ? '#059669' : '#DC2626' }}>
                      {recitationResult.passed ? '🏆 殿试吟诵通关！' : '❌ 背诵契合度未达标'}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 900, color: '#78350F' }}>
                      契合度: <b>{recitationResult.similarity}%</b> (≥85%通关)
                    </div>
                  </div>

                  {/* 逐字逐句对照 */}
                  <div
                    style={{
                      padding: '8px 10px',
                      backgroundColor: '#FAF5EB',
                      borderRadius: 10,
                      lineHeight: 1.8,
                      fontSize: '15px',
                      fontFamily: '"Songti SC", "SimSun", "STSong", serif, sans-serif',
                      textAlign: 'center',
                    }}
                  >
                    {recitationResult.lineDiffs.map((line, lIdx) => (
                      <div key={lIdx}>
                        {line.map((item, cIdx) => (
                          <span
                            key={cIdx}
                            style={{
                              color: item.isPunctuation
                                ? '#94A3B8'
                                : item.matched
                                ? '#059669'
                                : '#DC2626',
                              backgroundColor: !item.matched && !item.isPunctuation ? '#FEE2E2' : 'transparent',
                              borderRadius: 3,
                              fontWeight: item.matched ? 600 : 900,
                            }}
                          >
                            {item.char}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleRestartRecitation}
                    style={{
                      padding: '8px 0',
                      borderRadius: 10,
                      border: '1.5px solid #D8C7A5',
                      backgroundColor: '#F3EBD8',
                      color: '#78350F',
                      fontSize: '12.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    重新背诵
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
