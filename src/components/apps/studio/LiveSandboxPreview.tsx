import React, { useState } from 'react';
import { Play, Sparkles, RefreshCw, Eye, Code } from 'lucide-react';
import { CharacterRegexScript, CharacterTheme, CharacterHudConfig } from '../../../types/character';
import { applyRegexScripts } from '../../../core/regex/regexEngine';
import { CharacterHudWidget } from '../chat/CharacterHudWidget';

interface LiveSandboxPreviewProps {
  charName: string;
  userName?: string;
  regexScripts: CharacterRegexScript[];
  customTheme?: CharacterTheme;
  hudConfig?: CharacterHudConfig;
  variables?: Record<string, any>;
}

const SAMPLE_TEMPLATES = [
  {
    title: '深度思考与对话',
    text: `<think>
正在分析与用户的交互上下文...
对方似乎有些疲倦，我应该用轻柔的语调回应。
</think>
*轻轻为你拉好披肩，目光柔和*
今天辛苦了，{{user}}。先喝口温水休息一下吧？`
  },
  {
    title: '动作心理描写',
    text: `*指尖在桌面轻轻叩击，发出清脆微响*
（要是他知道那个秘密，还会像现在这样看着我吗...）
“别担心，无论发生什么，我都会在你身边的。”`
  },
  {
    title: '复杂 Markdown 与代码块',
    text: `*递上一份整理好的卷宗*
我已经帮你查好了核心参数：
\`\`\`json
{
  "status": "ready",
  "syncTime": "2026-09-21"
}
\`\`\`
请问需要立即执行同步协议吗？`
  }
];

export const LiveSandboxPreview: React.FC<LiveSandboxPreviewProps> = ({
  charName,
  userName = '你',
  regexScripts,
  customTheme,
  hudConfig,
  variables
}) => {
  const [inputText, setInputText] = useState(SAMPLE_TEMPLATES[0].text);
  const [activeView, setActiveView] = useState<'preview' | 'htmlCode'>('preview');

  const transformedHtml = applyRegexScripts(inputText, regexScripts, {
    charName: charName || '角色名',
    userName: userName || '用户'
  });

  const previewChatBg = customTheme?.chatBg || '#FAF9FD';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      {/* Top Banner with Quick Sample Selectors */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.02), 0 2px 6px rgba(0,0,0,0.04)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color={customTheme?.accentColor || '#5A6B5C'} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#2D3748' }}>对局与渲染沙盒</span>
          <span style={{ fontSize: '11px', color: '#718096' }}>
            （激活规则：{regexScripts.filter((s) => !s.disabled && s.placement !== 'user_input').length} 条）
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {SAMPLE_TEMPLATES.map((tpl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setInputText(tpl.text)}
              style={{
                fontSize: '11px',
                padding: '4px 8px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#F7FAFC',
                color: '#4A5568',
                cursor: 'pointer'
              }}
            >
              {tpl.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Area */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
          flex: 1,
          minHeight: '380px'
        }}
      >
        {/* Left: Raw Text Input */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#4A5568' }}>
              原始 AI 文本输出 (Raw Text)
            </span>
            <button
              type="button"
              onClick={() => setInputText('')}
              style={{
                fontSize: '11px',
                color: '#A0AEC0',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              清空
            </button>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="在这里输入或粘贴 AI 的原始输出内容..."
            style={{
              flex: 1,
              width: '100%',
              padding: '10px 12px',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '12px',
              lineHeight: 1.6,
              color: '#2D3748',
              resize: 'none',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Right: Rendered HTML Preview & Code Toggle */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: previewChatBg,
            borderRadius: '16px',
            padding: '14px',
            border: '1px solid rgba(0,0,0,0.05)',
            boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.02)',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#4A5568' }}>
                真机微聊效果实时仿真
              </span>
            </div>
            <div style={{ display: 'flex', gap: '4px', backgroundColor: '#EDF2F7', padding: '2px', borderRadius: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveView('preview')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: activeView === 'preview' ? 600 : 400,
                  backgroundColor: activeView === 'preview' ? '#FFFFFF' : 'transparent',
                  color: activeView === 'preview' ? '#2D3748' : '#718096',
                  cursor: 'pointer'
                }}
              >
                <Eye size={12} /> 视图
              </button>
              <button
                type="button"
                onClick={() => setActiveView('htmlCode')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: activeView === 'htmlCode' ? 600 : 400,
                  backgroundColor: activeView === 'htmlCode' ? '#FFFFFF' : 'transparent',
                  color: activeView === 'htmlCode' ? '#2D3748' : '#718096',
                  cursor: 'pointer'
                }}
              >
                <Code size={12} /> HTML 源码
              </button>
            </div>
          </div>

          {/* Mount HUD in sandbox preview */}
          {hudConfig?.enabled && (
            <div style={{ marginBottom: '8px' }}>
              <CharacterHudWidget
                charName={charName}
                hudConfig={hudConfig}
                theme={customTheme}
                variables={variables}
              />
            </div>
          )}

          <div
            style={{
              flex: 1,
              backgroundColor: customTheme?.bubbleBg || '#FFFFFF',
              color: customTheme?.bubbleTextColor || '#2D3748',
              borderRadius: '12px',
              padding: '14px',
              border: customTheme?.bubbleBorder || '1px solid #E2E8F0',
              overflowY: 'auto',
              boxShadow: customTheme?.bubbleShadow || '0 2px 8px rgba(0,0,0,0.02)'
            }}
          >
            {activeView === 'preview' ? (
              <div
                style={{
                  fontSize: '13px',
                  lineHeight: 1.6,
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap'
                }}
                dangerouslySetInnerHTML={{ __html: transformedHtml }}
              />
            ) : (
              <pre
                style={{
                  margin: 0,
                  fontSize: '11px',
                  fontFamily: 'Consolas, Monaco, monospace',
                  color: '#4A5568',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}
              >
                {transformedHtml}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
