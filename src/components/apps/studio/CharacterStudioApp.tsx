import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Sparkles, Upload, User, Trash2, Edit3, ChevronRight } from 'lucide-react';
import { db } from '../../../core/storage/db';
import { CharacterProfile } from '../../../types/character';
import { PRESET_REGEX_SCRIPTS } from '../../../core/regex/regexEngine';
import { parseCharacterCardFromPng } from '../../../core/character/pngCardParser';
import { JIANG_QIWANG_PRESET } from '../../../core/character/presetJiangQiwang';
import { CharacterWorkspace } from './CharacterWorkspace';

interface CharacterStudioAppProps {
  onBack: () => void;
}

export const CharacterStudioApp: React.FC<CharacterStudioAppProps> = ({ onBack }) => {
  const [characters, setCharacters] = useState<CharacterProfile[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCharacters = async () => {
    try {
      let list = await db.characters.toArray();
      // If Jiang Qiwang card does not exist yet, auto seed it into DB
      const hasJiang = list.some((c) => c.id === 'char_jiang_qiwang' || c.name === '江岐望');
      if (!hasJiang) {
        await db.characters.put(JIANG_QIWANG_PRESET);
        list = await db.characters.toArray();
      }
      setCharacters(list);
    } catch (e) {
      console.error('Failed to load characters:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCharacters();
  }, []);

  const handleCreateNew = async () => {
    const newChar: CharacterProfile = {
      id: `char_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: '新创角色',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=' + Date.now(),
      description: '等待完善的拟真角色设定',
      persona: '温柔细致，善于倾听。',
      worldScenario: '现代都市与未来科技交织的静谧角落。',
      firstMessage: '你好呀，很高兴能在此时此刻遇见你。',
      dialogueExamples: '<START>\n{{user}}: 你好\n{{char}}: *微笑着轻轻点头* 你好呀。',
      regexScripts: [...PRESET_REGEX_SCRIPTS], // default with full ST presets
      createdAt: Date.now()
    };
    await db.characters.put(newChar);
    await loadCharacters();
    setSelectedCharacter(newChar);
  };

  const handleSaveCharacter = async (updated: CharacterProfile) => {
    await db.characters.put(updated);
    await loadCharacters();
    setSelectedCharacter(updated);
  };

  const handleDeleteCharacter = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确认删除该角色卡吗？此操作无法撤销。')) {
      await db.characters.delete(id);
      if (selectedCharacter?.id === id) {
        setSelectedCharacter(null);
      }
      await loadCharacters();
    }
  };

  const handleImportCard = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.name.toLowerCase().endsWith('.png')) {
        const parsed = await parseCharacterCardFromPng(file);
        if (!parsed) throw new Error('无法从 PNG 中读取角色卡数据');

        // Create object url for avatar from PNG itself
        const avatarUrl = URL.createObjectURL(file);

        const newChar: CharacterProfile = {
          id: `char_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: parsed.name || '导入角色',
          avatar: avatarUrl,
          description: parsed.description || '导入自酒馆 PNG 卡片',
          persona: parsed.persona || '',
          worldScenario: parsed.worldScenario || '',
          firstMessage: parsed.firstMessage || '',
          dialogueExamples: parsed.dialogueExamples || '',
          alternateGreetings: parsed.alternateGreetings || [],
          regexScripts: parsed.regexScripts || [...PRESET_REGEX_SCRIPTS],
          customTheme: parsed.customTheme,
          hudConfig: parsed.hudConfig,
          variables: parsed.variables,
          createdAt: Date.now()
        };

        await db.characters.put(newChar);
        await loadCharacters();
        setSelectedCharacter(newChar);
        alert(`成功导入酒馆神仙卡【${newChar.name}】！已完整提取立绘、人设、状态栏 HUD 与正则流水线！`);
      } else {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const raw = JSON.parse(event.target?.result as string);
            const data = raw.data || raw;
            const ext = data.extensions || {};
            const newChar: CharacterProfile = {
              id: `char_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              name: data.name || '导入角色',
              avatar: data.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${data.name || Date.now()}`,
              description: data.description || '导入自酒馆卡',
              persona: data.personality || data.description || '',
              worldScenario: data.scenario || '',
              firstMessage: data.first_mes || '',
              dialogueExamples: data.mes_example || '',
              alternateGreetings: data.alternate_greetings || [],
              regexScripts: ext.regex_scripts || [...PRESET_REGEX_SCRIPTS],
              customTheme: ext.custom_theme,
              hudConfig: ext.hud_config,
              variables: ext.variables,
              createdAt: Date.now()
            };
            await db.characters.put(newChar);
            await loadCharacters();
            setSelectedCharacter(newChar);
            alert(`成功导入角色卡【${newChar.name}】！`);
          } catch (err: any) {
            alert('导入失败: ' + err.message);
          }
        };
        reader.readAsText(file);
      }
    } catch (err: any) {
      alert('导入失败: ' + err.message);
    }
  };

  if (selectedCharacter) {
    return (
      <CharacterWorkspace
        character={selectedCharacter}
        onSave={handleSaveCharacter}
        onBack={() => {
          setSelectedCharacter(null);
          loadCharacters();
        }}
      />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#FAF9FD',
        boxSizing: 'border-box'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          backgroundColor: '#FAF9FD',
          borderBottom: '1px solid rgba(0,0,0,0.06)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onBack}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4A5568'
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#2D3748', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>角色工坊</span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  backgroundColor: '#EDF5EE',
                  color: '#2F855A',
                  padding: '2px 6px',
                  borderRadius: '6px'
                }}
              >
                Studio
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#718096' }}>
              构建高自由度角色设定 · 正则表达式美化流水线
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '12px',
              border: '1px solid #CBD5E0',
              backgroundColor: '#FFFFFF',
              color: '#4A5568',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
            }}
          >
            <Upload size={14} /> 导入卡片 (JSON/PNG)
            <input
              type="file"
              accept=".json,.png"
              onChange={handleImportCard}
              style={{ display: 'none' }}
            />
          </label>
          <button
            onClick={handleCreateNew}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              backgroundColor: '#5A6B5C',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(90, 107, 92, 0.3)'
            }}
          >
            <Plus size={15} /> 创造角色
          </button>
        </div>
      </div>

      {/* Main List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#A0AEC0', fontSize: '13px' }}>
            正在加载角色卡库...
          </div>
        ) : characters.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px dashed #CBD5E0'
            }}
          >
            <Sparkles size={40} color="#CBD5E0" style={{ margin: '0 auto 12px auto' }} />
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#4A5568' }}>
              暂未创建角色
            </div>
            <div style={{ fontSize: '12px', color: '#A0AEC0', marginTop: '6px', maxWidth: '300px', margin: '6px auto 16px auto' }}>
              点击上方“创造角色”或“导入卡片”，即可定制拥有专属正则表达式和富文本排版的人物。
            </div>
            <button
              onClick={handleCreateNew}
              style={{
                padding: '8px 18px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#5A6B5C',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              立刻新建
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {characters.map((char) => (
              <div
                key={char.id}
                onClick={() => setSelectedCharacter(char)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '18px',
                  padding: '16px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={char.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + char.id}
                    alt={char.name}
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      objectFit: 'cover',
                      backgroundColor: '#EDF5EE'
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#2D3748' }}>
                        {char.name}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteCharacter(char.id, e)}
                        style={{
                          border: 'none',
                          background: 'none',
                          color: '#CBD5E0',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#718096',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginTop: '2px'
                      }}
                    >
                      {char.description || '暂无描述'}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '12px',
                    paddingTop: '10px',
                    borderTop: '1px dashed #EDF2F7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#EDF5EE',
                        color: '#2F855A',
                        fontWeight: 600
                      }}
                    >
                      正则规则: {char.regexScripts?.length || 0} 条
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '11px', color: '#5A6B5C', fontWeight: 600 }}>
                    <span>进入工坊</span>
                    <ChevronRight size={13} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
