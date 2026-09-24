import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, MessageSquare, Users, UserPlus, ChevronRight } from 'lucide-react';
import { CharacterProfile, INITIAL_CHARACTERS } from '../../../types/character';
import { getStorage } from '../../../core/storage';
import { ChatMessageItem } from '../../../types/chat';
import { CharacterEditor } from './CharacterEditor';
import { ChatConversation } from './ChatConversation';
import { CharacterAvatar } from './CharacterAvatar';

interface ChatAppProps {
  onBack: () => void;
  onOpenSettings?: () => void;
}

export const ChatApp: React.FC<ChatAppProps> = ({ onBack, onOpenSettings }) => {
  const [characters, setCharacters] = useState<CharacterProfile[]>(INITIAL_CHARACTERS);
  const [activeTab, setActiveTab] = useState<'chats' | 'contacts'>('chats');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<CharacterProfile | null | 'new'>(null);
  const [lastMessagesMap, setLastMessagesMap] = useState<Record<string, ChatMessageItem | undefined>>({});

  const storage = getStorage();

  const refreshCharacters = async () => {
    const chars = await storage.getCharacters();
    setCharacters(chars);

    // 预加载各会话最新一条消息摘要
    const map: Record<string, ChatMessageItem | undefined> = {};
    for (const c of chars) {
      const msgs = await storage.getMessages(c.id);
      if (msgs.length > 0) {
        map[c.id] = msgs[msgs.length - 1];
      }
    }
    setLastMessagesMap(map);
  };

  useEffect(() => {
    refreshCharacters();
  }, []);

  // 保存角色人设卡
  const handleSaveCharacter = async (char: CharacterProfile) => {
    await storage.saveCharacter(char);
    await refreshCharacters();
    setEditingCharacter(null);
  };

  // 删除角色
  const handleDeleteCharacter = async (id: string) => {
    await storage.deleteCharacter(id);
    await refreshCharacters();
    if (activeChatId === id) setActiveChatId(null);
    setEditingCharacter(null);
  };

  const activeChatChar = characters.find((c) => c.id === activeChatId);

  // 1. 具体会话视窗
  if (activeChatChar) {
    return (
      <ChatConversation
        character={activeChatChar}
        onBack={() => {
          setActiveChatId(null);
          refreshCharacters();
        }}
        onOpenPersona={(c) => setEditingCharacter(c)}
        onOpenSettings={onOpenSettings}
      />
    );
  }

  // 2. 角色人设卡编辑视窗
  if (editingCharacter !== null) {
    return (
      <CharacterEditor
        initialCharacter={editingCharacter === 'new' ? null : editingCharacter}
        onSave={handleSaveCharacter}
        onDelete={handleDeleteCharacter}
        onBack={() => setEditingCharacter(null)}
      />
    );
  }

  // 3. 仿微信主界面
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--nm-bg)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* 顶部标题栏 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px 8px',
          borderBottom: '1px solid rgba(166, 180, 200, 0.25)',
        }}
      >
        <button
          type="button"
          onClick={onBack}
          className="nm-rebound-btn nm-btn-circle"
          style={{ width: '38px', height: '38px' }}
          title="返回桌面"
        >
          <ArrowLeft size={18} strokeWidth={2.3} />
        </button>

        <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--nm-text-main)', margin: 0 }}>
          {activeTab === 'chats' ? '微信消息' : '通讯录'}
        </h2>

        {activeTab === 'contacts' ? (
          <button
            type="button"
            onClick={() => setEditingCharacter('new')}
            className="nm-rebound-btn nm-btn-circle"
            style={{ width: '38px', height: '38px', color: 'var(--nm-primary)' }}
            title="添加角色人设卡"
          >
            <UserPlus size={18} strokeWidth={2.3} />
          </button>
        ) : (
          <div style={{ width: '38px' }} />
        )}
      </div>

      {/* 列表滚动区 */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
        className="no-scrollbar"
      >
        {/* A. 消息会话列表 */}
        {activeTab === 'chats' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {characters.map((char) => {
              const lastMsg = lastMessagesMap[char.id];
              return (
                <div
                  key={char.id}
                  onClick={() => setActiveChatId(char.id)}
                  className="nm-rebound-btn nm-card-sm"
                  style={{
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    borderRadius: '16px',
                  }}
                >
                  <CharacterAvatar
                    avatar={char.avatar}
                    name={char.name}
                    size={42}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--nm-text-main)' }}>
                        {char.name}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--nm-text-sub)' }}>
                        {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--nm-text-sub)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {lastMsg?.content || '点击开启会话...'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* B. 通讯录角色列表 */}
        {activeTab === 'contacts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* + 添加角色人设卡 */}
            <div
              onClick={() => setEditingCharacter('new')}
              className="nm-rebound-btn nm-card-sm"
              style={{
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                borderRadius: '16px',
                color: 'var(--nm-primary)',
              }}
            >
              <div
                className="nm-btn-primary"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Plus size={18} strokeWidth={2.6} color="#FFFFFF" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13px', fontWeight: 800 }}>添加角色人设卡</span>
                <span style={{ fontSize: '10px', color: 'var(--nm-text-sub)' }}>配置专属人设 Prompt、作息与性格</span>
              </div>
            </div>

            <div style={{ marginTop: '6px', fontSize: '10px', fontWeight: 700, color: 'var(--nm-text-muted)', paddingLeft: '4px' }}>
              我的角色好友 ({characters.length})
            </div>

            {characters.map((char) => (
              <div
                key={char.id}
                onClick={() => setEditingCharacter(char)}
                className="nm-rebound-btn nm-card-sm"
                style={{
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  borderRadius: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CharacterAvatar
                    avatar={char.avatar}
                    name={char.name}
                    size={38}
                  />

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--nm-text-main)' }}>
                      {char.name}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--nm-text-sub)' }}>
                      {char.title || '角色档案'}
                    </span>
                  </div>
                </div>

                <ChevronRight size={16} color="var(--nm-text-sub)" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部仿微信双 Tab 栏 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          padding: '6px 16px calc(var(--sab) + 6px)',
          borderTop: '1px solid rgba(166, 180, 200, 0.25)',
          backgroundColor: 'var(--nm-bg)',
          gap: '12px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('chats')}
          className={`nm-rebound-btn ${activeTab === 'chats' ? 'nm-card-sm' : ''}`}
          style={{
            padding: '7px 0',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 800,
            color: activeTab === 'chats' ? 'var(--nm-primary)' : 'var(--nm-text-sub)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: activeTab === 'chats' ? 'var(--nm-convex-sm)' : 'none',
          }}
        >
          <MessageSquare size={16} strokeWidth={2.2} />
          消息
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contacts')}
          className={`nm-rebound-btn ${activeTab === 'contacts' ? 'nm-card-sm' : ''}`}
          style={{
            padding: '7px 0',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 800,
            color: activeTab === 'contacts' ? 'var(--nm-primary)' : 'var(--nm-text-sub)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: activeTab === 'contacts' ? 'var(--nm-convex-sm)' : 'none',
          }}
        >
          <Users size={16} strokeWidth={2.2} />
          通讯录
        </button>
      </div>
    </div>
  );
};
