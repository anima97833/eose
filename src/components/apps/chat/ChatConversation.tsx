import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, UserCheck, AlertCircle } from 'lucide-react';
import { CharacterProfile } from '../../../types/character';
import { ChatMessageItem } from '../../../types/chat';
import { getStorage } from '../../../core/storage';
import { createLLMAdapter } from '../../../core/llm';
import { applyRegexScripts } from '../../../core/regex/regexEngine';
import { CharacterHudWidget } from './CharacterHudWidget';

interface ChatConversationProps {
  character: CharacterProfile;
  onBack: () => void;
  onOpenPersona: (character: CharacterProfile) => void;
  onOpenSettings?: () => void;
}

export const ChatConversation: React.FC<ChatConversationProps> = ({
  character,
  onBack,
  onOpenPersona,
  onOpenSettings,
}) => {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [streamingText, setStreamingText] = useState<string>('');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const storage = getStorage();

  const loadHistory = async () => {
    const msgs = await storage.getMessages(character.id);
    if (msgs.length === 0) {
      // 初始问候语
      const initMsg: ChatMessageItem = {
        id: `msg_init_${character.id}`,
        characterId: character.id,
        sender: 'assistant',
        content: `嗨！我是【${character.name}】。小手机一直在身边，随时都可以和我说话哦~`,
        timestamp: Date.now(),
      };
      await storage.saveMessage(initMsg);
      setMessages([initMsg]);
    } else {
      setMessages(msgs);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [character.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, isTyping]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessageItem = {
      id: `msg_user_${Date.now()}`,
      characterId: character.id,
      sender: 'user',
      content: text,
      timestamp: Date.now(),
    };

    // 写入本地数据库并刷新列表
    await storage.saveMessage(userMsg);
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    setInputText('');
    setErrorNotice(null);
    setIsTyping(true);
    setStreamingText('');

    try {
      const settings = await storage.getSettings();
      // 取主区配置或分支配置
      const routeConfig = settings.primary.baseUrl ? settings.primary : settings.branch;

      if (!routeConfig.baseUrl || !routeConfig.apiKey) {
        setIsTyping(false);
        setErrorNotice('尚未配置 Base URL 或 API Key，请点击前往设置');
        return;
      }

      const adapter = createLLMAdapter(routeConfig);

      // 组装 Prompt：系统人设 + 最近上下文历史
      const systemPrompt = `你现在正在与用户进行微信即时通讯对话。你的角色姓名是【${character.name}】。
身份标签：${character.title || '好友'}。
核心人设设定：${character.persona || '温柔知心陪伴'}。
说话风格与语气：${character.tone || '自然随和'}。
日常作息：早晨 ${character.wakeTime || '08:00'} 清醒，深夜 ${character.sleepTime || '23:30'} 入睡。
当前现实时间：${new Date().toLocaleTimeString()}。
请完全沉浸在此人设中与用户像微信好友一样交流，回复简洁自然，不要输出多余的系统说明。`;

      const apiMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...updatedMessages.slice(-10).map((m) => ({
          role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.content,
        })),
      ];

      let fullReply = '';
      await adapter.sendMessage(apiMessages, (chunk) => {
        fullReply += chunk;
        setStreamingText(fullReply);
      });

      const assistantMsg: ChatMessageItem = {
        id: `msg_ai_${Date.now()}`,
        characterId: character.id,
        sender: 'assistant',
        content: fullReply || streamingText || '（静静地听你诉说并点头）',
        timestamp: Date.now(),
      };

      await storage.saveMessage(assistantMsg);
      setMessages([...updatedMessages, assistantMsg]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorNotice(`发送失败: ${msg}`);
    } finally {
      setIsTyping(false);
      setStreamingText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const customTheme = character.customTheme;
  const chatBgColor = customTheme?.chatBg || 'var(--nm-bg)';

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: chatBgColor,
        overflow: 'hidden',
        position: 'relative',
        transition: 'background-color 0.3s ease',
      }}
    >
      {/* 顶部会话导航栏 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px 8px',
          borderBottom: '1px solid rgba(166, 180, 200, 0.25)',
          backgroundColor: customTheme?.chatBg ? 'rgba(255,255,255,0.7)' : 'var(--nm-bg)',
          backdropFilter: 'blur(8px)',
          zIndex: 10,
        }}
      >
        <button
          type="button"
          onClick={onBack}
          className="nm-rebound-btn nm-btn-circle"
          style={{ width: '38px', height: '38px' }}
          title="返回消息列表"
        >
          <ArrowLeft size={18} strokeWidth={2.3} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--nm-text-main)', margin: 0 }}>
            {character.name}
          </h2>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: isTyping ? (customTheme?.accentColor || 'var(--nm-primary)') : 'var(--nm-text-sub)',
              transition: 'color 0.2s ease',
            }}
          >
            {isTyping ? '对方正在输入...' : (character.status || '在线')}
          </span>
        </div>

        {/* 角色人设卡快捷编辑入口 */}
        <button
          type="button"
          onClick={() => onOpenPersona(character)}
          className="nm-rebound-btn nm-btn-circle"
          style={{ width: '38px', height: '38px', color: customTheme?.accentColor || 'var(--nm-primary)' }}
          title="查看/编辑人设卡"
        >
          <UserCheck size={18} strokeWidth={2.2} />
        </button>
      </div>

      {/* 异常提示卡片 */}
      {errorNotice && (
        <div
          style={{
            margin: '8px 16px 0',
            padding: '8px 12px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 94, 126, 0.08)',
            border: '1px solid rgba(255, 94, 126, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            fontSize: '11px',
            color: 'var(--nm-accent-red)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>{errorNotice}</span>
          </div>
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="nm-rebound-btn nm-card-sm"
              style={{
                padding: '3px 8px',
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--nm-primary)',
                borderRadius: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              去设置
            </button>
          )}
        </div>
      )}

      {/* 角色专属前端状态栏 (HUD Widget) */}
      <div style={{ marginTop: '8px' }}>
        <CharacterHudWidget
          charName={character.name}
          hudConfig={character.hudConfig}
          theme={character.customTheme}
          variables={character.variables}
        />
      </div>

      {/* 消息气泡流 */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
        className="no-scrollbar"
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                gap: '8px',
              }}
            >
              {/* 角色头像 */}
              {!isUser && (
                <div
                  className="nm-card-sm"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    flexShrink: 0,
                  }}
                >
                  {character.avatar || '🌸'}
                </div>
              )}

              {/* 气泡内容 */}
              <div
                className={isUser ? 'nm-card-sm' : 'nm-card'}
                style={{
                  maxWidth: '74%',
                  padding: '10px 14px',
                  borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  fontSize: '13px',
                  lineHeight: 1.5,
                  wordBreak: 'break-word',
                  backgroundColor: isUser
                    ? '#5096C6'
                    : (customTheme?.bubbleBg || 'var(--nm-bg)'),
                  color: isUser
                    ? '#FFFFFF'
                    : (customTheme?.bubbleTextColor || 'var(--nm-text-main)'),
                  boxShadow: isUser
                    ? '3px 3px 8px rgba(80, 150, 198, 0.4), -3px -3px 8px rgba(255, 255, 255, 0.8)'
                    : (customTheme?.bubbleShadow || 'var(--nm-convex-sm)'),
                  border: !isUser && customTheme?.bubbleBorder ? customTheme.bubbleBorder : 'none',
                }}
              >
                {isUser ? (
                  msg.content
                ) : (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: applyRegexScripts(msg.content, character.regexScripts, {
                        charName: character.name,
                        userName: '我',
                      }),
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* 流式打字实时反馈 */}
        {isTyping && streamingText && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <div
              className="nm-card-sm"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                flexShrink: 0,
              }}
            >
              {character.avatar || '🌸'}
            </div>
            <div
              className="nm-card"
              style={{
                maxWidth: '74%',
                padding: '10px 14px',
                borderRadius: '4px 16px 16px 16px',
                fontSize: '13px',
                lineHeight: 1.5,
                wordBreak: 'break-word',
                backgroundColor: 'var(--nm-bg)',
                color: 'var(--nm-text-main)',
                boxShadow: 'var(--nm-convex-sm)',
              }}
            >
              {streamingText}
              <span style={{ display: 'inline-block', width: '4px', height: '14px', backgroundColor: 'var(--nm-primary)', marginLeft: '4px', verticalAlign: 'middle' }} />
            </div>
          </div>
        )}

        {/* 等待打字三点脉冲 */}
        {isTyping && !streamingText && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              className="nm-card-sm"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                flexShrink: 0,
              }}
            >
              {character.avatar || '🌸'}
            </div>
            <div
              className="nm-card-sm"
              style={{
                padding: '10px 14px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span className="typing-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--nm-primary)' }} />
              <span className="typing-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--nm-primary)', animationDelay: '0.2s' }} />
              <span className="typing-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--nm-primary)', animationDelay: '0.4s' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 底部输入栏 */}
      <div
        style={{
          padding: '8px 14px calc(var(--sab) + 8px)',
          borderTop: '1px solid rgba(166, 180, 200, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'var(--nm-bg)',
        }}
      >
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="发消息..."
            className="nm-input"
            style={{
              fontSize: '13px',
              padding: '9px 14px',
              borderRadius: '20px',
            }}
          />
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={!inputText.trim() || isTyping}
          className="nm-rebound-btn nm-btn-circle"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            color: inputText.trim() ? '#5096C6' : 'var(--nm-text-muted)',
            flexShrink: 0,
          }}
          title="发送"
        >
          <Send size={16} strokeWidth={2.5} style={{ marginLeft: '2px' }} />
        </button>
      </div>
    </div>
  );
};
