import React, { useState } from 'react';
import { StoryClozeChallenge } from '../../../../core/storyword/storyWordTypes';
import { submitClozeAnswer, ClozeAnswerResult } from '../../../../core/storyword/storyClozeEngine';
import { speakWord } from '../../../../core/storyword/storyWordStorage';
import { NM } from '../storyWordNeumorphism';
import { Sparkles, Volume2, CheckCircle, XCircle, Zap } from 'lucide-react';

interface StoryClozeCardProps {
  challenge: StoryClozeChallenge;
  onChallengeComplete: (challengeId: string, result: ClozeAnswerResult) => void;
}

export const StoryClozeCard: React.FC<StoryClozeCardProps> = ({
  challenge,
  onChallengeComplete,
}) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(challenge.selectedWord || null);
  const [result, setResult] = useState<ClozeAnswerResult | null>(
    challenge.isAnswered ? { isCorrect: !!challenge.isCorrect } : null
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSelectOption = async (word: string) => {
    if (challenge.isAnswered || submitting) return;
    setSubmitting(true);
    setSelectedWord(word);

    // 发音
    speakWord(word);

    const res = await submitClozeAnswer(challenge, word);
    setResult(res);
    setSubmitting(false);
    onChallengeComplete(challenge.id, res);
  };

  return (
    <div
      style={{
        margin: '20px 0',
        padding: '16px',
        borderRadius: '16px',
        backgroundColor: NM.cardBg,
        boxShadow: challenge.isAnswered
          ? challenge.isCorrect
            ? `0 0 0 2px ${NM.emerald}, ${NM.convexSm}`
            : `0 0 0 2px ${NM.rose}, ${NM.convexSm}`
          : NM.convex,
        border: NM.borderLight,
        transition: 'all 0.3s ease',
      }}
    >
      {/* 顶部标题栏 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#fff',
              background: 'linear-gradient(135deg, #D97706, #B45309)',
              boxShadow: NM.convexXs,
            }}
          >
            爽点关卡
          </span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: NM.textMain }}>
            剧情互动通关
          </span>
        </div>

        {challenge.isAnswered && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: 700,
              color: challenge.isCorrect ? NM.emerald : NM.rose,
            }}
          >
            {challenge.isCorrect ? (
              <>
                <CheckCircle size={14} /> 爽点爆发
              </>
            ) : (
              <>
                <XCircle size={14} /> 跌入低谷
              </>
            )}
          </div>
        )}
      </div>

      {/* 句子互动填空上下文 */}
      <div
        style={{
          fontSize: '15px',
          lineHeight: '1.8',
          color: NM.textMain,
          padding: '12px',
          borderRadius: '12px',
          backgroundColor: NM.bgInset,
          boxShadow: NM.insetSm,
          marginBottom: '14px',
        }}
      >
        <span>{challenge.sentenceBefore}</span>
        <span
          style={{
            display: 'inline-block',
            margin: '0 6px',
            padding: '2px 10px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 700,
            color: challenge.isAnswered
              ? challenge.isCorrect
                ? NM.emerald
                : NM.rose
              : NM.amber,
            backgroundColor: NM.cardBg,
            boxShadow: NM.insetXs,
            borderBottom: `2px solid ${challenge.isAnswered ? (challenge.isCorrect ? NM.emerald : NM.rose) : NM.amber}`,
          }}
        >
          {challenge.isAnswered ? challenge.targetWord.word : '____？'}
        </span>
        {challenge.isAnswered && (
          <span style={{ color: NM.textMain }}>{challenge.sentenceAfter}</span>
        )}
      </div>

      {/* 选项组 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
        }}
      >
        {challenge.options.map(opt => {
          const isSelected = selectedWord === opt.word;
          const isTarget = opt.word.toLowerCase() === challenge.targetWord.word.toLowerCase();

          let btnBg = NM.cardBg;
          let btnShadow = NM.convexXs;
          let btnBorder = NM.borderLight;
          let textColor = NM.textMain;

          if (challenge.isAnswered) {
            if (isTarget) {
              btnBg = '#E6F4EA';
              btnBorder = `1.5px solid ${NM.emerald}`;
              textColor = NM.emerald;
              btnShadow = NM.insetXs;
            } else if (isSelected && !challenge.isCorrect) {
              btnBg = '#FCE8E6';
              btnBorder = `1.5px solid ${NM.rose}`;
              textColor = NM.rose;
              btnShadow = NM.insetXs;
            } else {
              textColor = NM.textMuted;
            }
          }

          return (
            <button
              key={opt.word}
              disabled={challenge.isAnswered || submitting}
              onClick={() => handleSelectOption(opt.word)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '10px 12px',
                borderRadius: '12px',
                backgroundColor: btnBg,
                boxShadow: btnShadow,
                border: btnBorder,
                cursor: challenge.isAnswered ? 'default' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 700, color: textColor }}>
                  {opt.word}
                </span>
                <Volume2
                  size={13}
                  color={NM.textMuted}
                  style={{ opacity: 0.7 }}
                  onClick={e => {
                    e.stopPropagation();
                    speakWord(opt.word);
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: '11px',
                  color: NM.textMuted,
                  marginTop: '2px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%',
                }}
              >
                {opt.translation}
              </span>
            </button>
          );
        })}
      </div>

      {/* 结算奖励横幅 */}
      {challenge.isAnswered && result && (
        <div
          style={{
            marginTop: '12px',
            padding: '10px 12px',
            borderRadius: '10px',
            backgroundColor: challenge.isCorrect ? '#F0FDF4' : '#FFF1F2',
            border: `1px solid ${challenge.isCorrect ? '#BBF7D0' : '#FECDD3'}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} color={challenge.isCorrect ? NM.amber : NM.rose} />
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: challenge.isCorrect ? NM.gold : NM.rose,
                }}
              >
                {challenge.isCorrect ? '打脸成功 · 战力飙升！' : '剧情失手 · 收入错阁'}
              </span>
            </div>
            {result.reward && (
              <span style={{ fontSize: '12px', fontWeight: 700, color: NM.emerald }}>
                +{result.reward.expGain} EXP · +{result.reward.attrGain} {result.reward.attrKey}
              </span>
            )}
          </div>
          <div style={{ fontSize: '11px', color: NM.textSub, lineHeight: 1.5 }}>
            {challenge.explanation}
          </div>
        </div>
      )}
    </div>
  );
};
