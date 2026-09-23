import React, { useState } from 'react';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Edit2,
  Code,
  User,
  Sparkles,
  Download,
  Upload,
  CheckCircle,
  Eye,
  Sliders,
  Palette,
  Layout,
  Check,
  RefreshCw,
} from 'lucide-react';
import {
  CharacterProfile,
  CharacterRegexScript,
  CharacterTheme,
  CharacterHudConfig
} from '../../../types/character';
import { PRESET_REGEX_SCRIPTS } from '../../../core/regex/regexEngine';
import { RegexScriptEditorModal } from './RegexScriptEditorModal';
import { LiveSandboxPreview } from './LiveSandboxPreview';
import { fetchColormindPalette, hexToRgb, rgbToHex } from '../../../core/theme/colormindService';

interface CharacterWorkspaceProps {
  character: CharacterProfile;
  onSave: (updated: CharacterProfile) => void;
  onBack: () => void;
}

// 4 Preset Visual Themes
const PRESET_THEMES: Array<{ name: string; theme: CharacterTheme; icon: string }> = [
  {
    name: '🌸 治愈樱粉 (Romantic Blossom)',
    icon: '🌸',
    theme: {
      name: '治愈樱粉',
      chatBg: '#FFF5F7',
      bubbleBg: '#FFFFFF',
      bubbleTextColor: '#2D3748',
      bubbleBorder: '1px solid #FED7E2',
      bubbleShadow: '0 4px 14px rgba(237, 100, 166, 0.08), inset 0 1px 2px #FFFFFF',
      accentColor: '#ED64A6',
      actionTextColor: '#D53F8C'
    }
  },
  {
    name: '☕ 静谧冷咖 (Calm Espresso)',
    icon: '☕',
    theme: {
      name: '静谧冷咖',
      chatBg: '#F7F5F0',
      bubbleBg: '#FFFFFF',
      bubbleTextColor: '#2D3748',
      bubbleBorder: '1px solid #E2D9D0',
      bubbleShadow: '0 4px 14px rgba(140, 123, 112, 0.08), inset 0 1px 2px #FFFFFF',
      accentColor: '#8C7B70',
      actionTextColor: '#6B584C'
    }
  },
  {
    name: '🔮 赛博终端 (Cyber Matrix)',
    icon: '🔮',
    theme: {
      name: '赛博终端',
      chatBg: '#1A202C',
      bubbleBg: '#2D3748',
      bubbleTextColor: '#E2E8F0',
      bubbleBorder: '1px solid #4A5568',
      bubbleShadow: '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255,255,255,0.08)',
      accentColor: '#4FD1C5',
      actionTextColor: '#38B2AC'
    }
  },
  {
    name: '📜 复古羊皮手记 (Vintage Parchment)',
    icon: '📜',
    theme: {
      name: '复古羊皮手记',
      chatBg: '#FAF7EE',
      bubbleBg: '#FFFDF9',
      bubbleTextColor: '#4A3B32',
      bubbleBorder: '1px solid #E8DECA',
      bubbleShadow: '0 4px 14px rgba(180, 150, 120, 0.1), inset 0 1px 2px #FFFFFF',
      accentColor: '#B7791F',
      actionTextColor: '#975A16'
    }
  }
];

export const CharacterWorkspace: React.FC<CharacterWorkspaceProps> = ({
  character: initialChar,
  onSave,
  onBack
}) => {
  const [character, setCharacter] = useState<CharacterProfile>({
    ...initialChar,
    hudConfig: initialChar.hudConfig || {
      enabled: true,
      layout: 'compass',
      showAffection: true,
      showMood: true,
      showLocation: true
    },
    variables: initialChar.variables || {
      affection: 60,
      mood: '浅笑陪伴',
      moodIcon: '🌸',
      location: '午后阳光回廊',
      dress: '素雅米白毛衣',
      whisperQuote: '无论什么时候，我都在这里。'
    }
  });

  const [activeTab, setActiveTab] = useState<'profile' | 'regex' | 'hud' | 'sandbox' | 'io'>('profile');

  // JSON variable text input state
  const [jsonText, setJsonText] = useState(
    JSON.stringify(character.variables || {}, null, 2)
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Regex modal state
  const [editingScript, setEditingScript] = useState<CharacterRegexScript | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  // Field updates
  const updateField = <K extends keyof CharacterProfile>(key: K, value: CharacterProfile[K]) => {
    setCharacter((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = () => {
    onSave(character);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  // Theme application
  const handleApplyTheme = (theme: CharacterTheme) => {
    updateField('customTheme', theme);
  };

  const [isGeneratingCharTheme, setIsGeneratingCharTheme] = useState(false);

  // 调用 Colormind 基于角色特征生成专属羁绊色盘
  const handleAIColormindCharacterTheme = async () => {
    setIsGeneratingCharTheme(true);
    try {
      const seedHex = character.customTheme?.accentColor || '#ED64A6';
      const seedRgb = hexToRgb(seedHex);
      const palette = await fetchColormindPalette({
        model: 'ui',
        input: [seedRgb, 'N', 'N', 'N', 'N'],
      });
      const chatBg = rgbToHex(palette[0]);
      const bubbleTextColor = rgbToHex(palette[3]);
      const accentColor = rgbToHex(palette[2]);
      const actionTextColor = rgbToHex(palette[4]);
      const generatedTheme: CharacterTheme = {
        name: `AI 羁绊印象 · ${character.name || '专属'}`,
        chatBg,
        bubbleBg: '#FFFFFF',
        bubbleTextColor,
        bubbleBorder: `1px solid ${accentColor}33`,
        bubbleShadow: `0 4px 14px ${accentColor}18, inset 0 1px 2px #FFFFFF`,
        accentColor,
        actionTextColor,
      };
      handleApplyTheme(generatedTheme);
    } catch {
      // 容灾由 service 兜底
    } finally {
      setIsGeneratingCharTheme(false);
    }
  };

  // Variable JSON change handler
  const handleJsonChange = (text: string) => {
    setJsonText(text);
    try {
      const parsed = JSON.parse(text);
      setJsonError(null);
      updateField('variables', parsed);
    } catch (err: any) {
      setJsonError(err.message);
    }
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      setJsonError(null);
      updateField('variables', parsed);
    } catch (err: any) {
      setJsonError('JSON 格式有误，无法排版: ' + err.message);
    }
  };

  // Regex scripts operations
  const handleAddOrUpdateScript = (script: CharacterRegexScript) => {
    const scripts = character.regexScripts || [];
    const index = scripts.findIndex((s) => s.id === script.id);
    let newScripts: CharacterRegexScript[];
    if (index >= 0) {
      newScripts = [...scripts];
      newScripts[index] = script;
    } else {
      newScripts = [...scripts, script];
    }
    updateField('regexScripts', newScripts);
    setIsModalOpen(false);
    setEditingScript(null);
  };

  const handleDeleteScript = (id: string) => {
    const scripts = (character.regexScripts || []).filter((s) => s.id !== id);
    updateField('regexScripts', scripts);
  };

  const handleToggleScript = (id: string) => {
    const scripts = (character.regexScripts || []).map((s) =>
      s.id === id ? { ...s, disabled: !s.disabled } : s
    );
    updateField('regexScripts', scripts);
  };

  const handleLoadAllPresets = () => {
    if (confirm('是否加载全部 5 组 SillyTavern 官方级预设规则？')) {
      const existing = character.regexScripts || [];
      updateField('regexScripts', [...existing, ...PRESET_REGEX_SCRIPTS]);
    }
  };

  // Import / Export JSON
  const handleExportJson = () => {
    const jsonStr = JSON.stringify(
      {
        spec: 'chara_card_v2',
        spec_version: '2.0',
        data: {
          name: character.name,
          description: character.description,
          personality: character.persona,
          scenario: character.worldScenario,
          first_mes: character.firstMessage || '',
          mes_example: character.dialogueExamples,
          alternate_greetings: character.alternateGreetings || [],
          extensions: {
            regex_scripts: character.regexScripts || [],
            custom_theme: character.customTheme || {},
            hud_config: character.hudConfig || {},
            variables: character.variables || {}
          }
        }
      },
      null,
      2
    );
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character.name || 'character'}_card.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = JSON.parse(event.target?.result as string);
        const data = raw.data || raw;
        const ext = data.extensions || {};
        const importedVars = ext.variables || { affection: 60, mood: '良好' };
        setCharacter((prev) => ({
          ...prev,
          name: data.name || prev.name,
          description: data.description || prev.description,
          persona: data.personality || prev.persona,
          worldScenario: data.scenario || prev.worldScenario,
          firstMessage: data.first_mes || prev.firstMessage,
          dialogueExamples: data.mes_example || prev.dialogueExamples,
          alternateGreetings: data.alternate_greetings || prev.alternateGreetings,
          regexScripts: ext.regex_scripts || prev.regexScripts || [],
          customTheme: ext.custom_theme || prev.customTheme,
          hudConfig: ext.hud_config || prev.hudConfig,
          variables: importedVars
        }));
        setJsonText(JSON.stringify(importedVars, null, 2));
        alert('导入成功！已更新角色设定、专属前端、HUD 及正则规则。');
      } catch (err: any) {
        alert(`导入失败: 解析 JSON 出现错误: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

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
      {/* Top Navbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          backgroundColor: '#FAF9FD',
          borderBottom: '1px solid rgba(0,0,0,0.06)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#2D3748' }}>
              {character.name || '未命名角色'}
            </div>
            <div style={{ fontSize: '11px', color: '#718096' }}>
              角色专属前端 · 正则流水线 · 状态栏工作台
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {savedNotice && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                color: '#38A169',
                fontWeight: 600
              }}
            >
              <CheckCircle size={14} /> 已保存
            </span>
          )}
          <button
            onClick={handleSaveAll}
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
              boxShadow: '0 3px 8px rgba(90, 107, 92, 0.3)'
            }}
          >
            <Save size={14} /> 保存到本地
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          padding: '10px 14px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          overflowX: 'auto'
        }}
      >
        {[
          { key: 'profile', label: '基本人设', icon: User },
          { key: 'hud', label: '专属前端/HUD', icon: Palette },
          { key: 'regex', label: `正则美化 (${character.regexScripts?.length || 0})`, icon: Sparkles },
          { key: 'sandbox', label: '对局沙盒', icon: Eye },
          { key: 'io', label: '导入/导出', icon: Download }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '10px',
                border: 'none',
                fontSize: '12px',
                fontWeight: isActive ? 600 : 500,
                backgroundColor: isActive ? '#EDF5EE' : 'transparent',
                color: isActive ? '#2F855A' : '#718096',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Tab Contents */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px' }}>
        {/* Tab 1: Profile */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '720px' }}>
            <div style={{ display: 'flex', gap: '14px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4A5568', marginBottom: '4px' }}>
                  角色名字 (Name)
                </label>
                <input
                  type="text"
                  value={character.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4A5568', marginBottom: '4px' }}>
                  头像链接或路径 (Avatar)
                </label>
                <input
                  type="text"
                  value={character.avatar}
                  onChange={(e) => updateField('avatar', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4A5568', marginBottom: '4px' }}>
                角色一句话简介 (Short Description)
              </label>
              <input
                type="text"
                value={character.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4A5568', marginBottom: '4px' }}>
                首条问候语 (First Message / Greeting)
              </label>
              <textarea
                rows={3}
                value={character.firstMessage || ''}
                onChange={(e) => updateField('firstMessage', e.target.value)}
                placeholder="初次相遇时角色说出的第一句话，支持动作描写与对话"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  fontSize: '12px',
                  lineHeight: 1.5,
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4A5568', marginBottom: '4px' }}>
                角色核心人设 (Personality / Persona)
              </label>
              <textarea
                rows={5}
                value={character.persona}
                onChange={(e) => updateField('persona', e.target.value)}
                placeholder="性格、外貌特征、说话方式、习惯、与用户的关系等"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  fontSize: '12px',
                  lineHeight: 1.5,
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4A5568', marginBottom: '4px' }}>
                世界观与场景设定 (World Scenario)
              </label>
              <textarea
                rows={3}
                value={character.worldScenario || ''}
                onChange={(e) => updateField('worldScenario', e.target.value)}
                placeholder="所处环境、背景世界观、特殊设定"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  fontSize: '12px',
                  lineHeight: 1.5,
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Custom HUD & Theme */}
        {activeTab === 'hud' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '780px' }}>
            {/* 1. Theme Presets */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#2D3748', marginBottom: '4px' }}>
                角色专属视觉主题 (Visual Atmosphere)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#718096' }}>
                  点击一键套用精心调配的专属聊天室氛围、气泡配色与微拟物阴影。
                </div>
                <button
                  type="button"
                  onClick={handleAIColormindCharacterTheme}
                  disabled={isGeneratingCharTheme}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: isGeneratingCharTheme ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 6px rgba(139, 92, 246, 0.3)',
                    flexShrink: 0,
                  }}
                >
                  {isGeneratingCharTheme ? (
                    <RefreshCw size={12} className="animate-spin" />
                  ) : (
                    <Sparkles size={12} />
                  )}
                  <span>{isGeneratingCharTheme ? 'Colormind 推算中...' : '🎲 AI 专属羁绊色盘'}</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                {PRESET_THEMES.map((item, idx) => {
                  const isSelected = character.customTheme?.name === item.theme.name;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleApplyTheme(item.theme)}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        border: `2px solid ${isSelected ? item.theme.accentColor : '#E2E8F0'}`,
                        backgroundColor: item.theme.chatBg,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: item.theme.bubbleTextColor }}>
                          {item.name}
                        </span>
                        {isSelected && <Check size={14} color={item.theme.accentColor} />}
                      </div>
                      <div
                        style={{
                          backgroundColor: item.theme.bubbleBg,
                          color: item.theme.bubbleTextColor,
                          border: item.theme.bubbleBorder,
                          borderRadius: '8px',
                          padding: '6px 10px',
                          fontSize: '11px',
                          boxShadow: item.theme.bubbleShadow
                        }}
                      >
                        气泡效果预览 (Tap to Apply)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. HUD Switch and Config */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#2D3748' }}>
                    前端专属状态栏 (Custom HUD Widget)
                  </div>
                  <div style={{ fontSize: '11px', color: '#718096' }}>
                    在微聊对话顶部常驻角色的心动罗盘、心境与所在位置徽章。
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="hudToggle"
                    checked={character.hudConfig?.enabled ?? true}
                    onChange={(e) =>
                      updateField('hudConfig', {
                        ...(character.hudConfig || { enabled: true }),
                        enabled: e.target.checked
                      })
                    }
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <label htmlFor="hudToggle" style={{ fontSize: '12px', fontWeight: 600, color: '#4A5568', cursor: 'pointer' }}>
                    启用顶部状态栏
                  </label>
                </div>
              </div>

              {character.hudConfig?.enabled && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '12px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 10px',
                      backgroundColor: '#F7FAFC',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#4A5568',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={character.hudConfig.showAffection !== false}
                      onChange={(e) =>
                        updateField('hudConfig', {
                          ...character.hudConfig!,
                          showAffection: e.target.checked
                        })
                      }
                    />
                    <span>显示好感度刻度条</span>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 10px',
                      backgroundColor: '#F7FAFC',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#4A5568',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={character.hudConfig.showMood !== false}
                      onChange={(e) =>
                        updateField('hudConfig', {
                          ...character.hudConfig!,
                          showMood: e.target.checked
                        })
                      }
                    />
                    <span>显示当前心情徽章</span>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 10px',
                      backgroundColor: '#F7FAFC',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#4A5568',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={character.hudConfig.showLocation !== false}
                      onChange={(e) =>
                        updateField('hudConfig', {
                          ...character.hudConfig!,
                          showLocation: e.target.checked
                        })
                      }
                    />
                    <span>显示场景地点徽章</span>
                  </label>
                </div>
              )}
            </div>

            {/* 3. Variables JSON Editor */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#2D3748' }}>
                    MVU 状态变量表 (Init Variables JSON)
                  </div>
                  <div style={{ fontSize: '11px', color: '#718096' }}>
                    定义角色的动态数值与状态（好感度、心情、穿搭、所在场景等），可直接编写扩展。
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={handleFormatJson}
                    style={{
                      fontSize: '11px',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E0',
                      backgroundColor: '#F8FAFC',
                      color: '#4A5568',
                      cursor: 'pointer'
                    }}
                  >
                    格式化 JSON
                  </button>
                </div>
              </div>

              {jsonError && (
                <div style={{ fontSize: '11px', color: '#E53E3E', marginBottom: '6px', fontWeight: 600 }}>
                  ✗ JSON 解析报错: {jsonError}
                </div>
              )}

              <textarea
                rows={9}
                value={jsonText}
                onChange={(e) => handleJsonChange(e.target.value)}
                placeholder="{\n  &quot;affection&quot;: 75,\n  &quot;mood&quot;: &quot;心动&quot;,\n  &quot;location&quot;: &quot;校园长廊&quot;\n}"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: `1px solid ${jsonError ? '#FEB2B2' : '#E2E8F0'}`,
                  backgroundColor: '#1E222B',
                  color: '#A0AEC0',
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '12px',
                  lineHeight: 1.5,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        )}

        {/* Tab 3: Regex scripts list & management */}
        {activeTab === 'regex' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '780px' }}>
            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#2D3748' }}>
                  正则表达式与 HTML 美化流水线
                </div>
                <div style={{ fontSize: '11px', color: '#718096' }}>
                  按由上至下的顺序执行。支持捕获组、思考标签折叠、动作斜体、心理对话与微聊气泡增强。
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleLoadAllPresets}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E0',
                    backgroundColor: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#4A5568',
                    cursor: 'pointer'
                  }}
                >
                  <Sparkles size={13} color="#2F855A" /> 加载常用预设
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingScript(undefined as any);
                    setIsModalOpen(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 14px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#5A6B5C',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(90, 107, 92, 0.3)'
                  }}
                >
                  <Plus size={14} /> 新建规则
                </button>
              </div>
            </div>

            {/* Rules list */}
            {(!character.regexScripts || character.regexScripts.length === 0) ? (
              <div
                style={{
                  padding: '36px 20px',
                  textAlign: 'center',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px dashed #CBD5E0'
                }}
              >
                <Sparkles size={32} color="#A0AEC0" style={{ margin: '0 auto 8px auto' }} />
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#4A5568' }}>
                  暂未添加正则表达式美化脚本
                </div>
                <div style={{ fontSize: '11px', color: '#A0AEC0', marginTop: '4px' }}>
                  您可以点击右上角“加载常用预设”或“新建规则”为该角色配置个性化输出修饰。
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {character.regexScripts.map((rule, idx) => (
                  <div
                    key={rule.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '14px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      opacity: rule.disabled ? 0.6 : 1,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#A0AEC0',
                          width: '20px'
                        }}
                      >
                        #{idx + 1}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#2D3748' }}>
                            {rule.scriptName}
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              borderRadius: '6px',
                              backgroundColor: rule.placement === 'display' ? '#EBF8FF' : '#FEFCBF',
                              color: rule.placement === 'display' ? '#2B6CB0' : '#B7791F'
                            }}
                          >
                            {rule.placement === 'display' ? '渲染展示' : rule.placement === 'ai_output' ? 'AI输出' : rule.placement === 'user_input' ? '用户输入' : '全流水线'}
                          </span>
                          {rule.disabled && (
                            <span style={{ fontSize: '10px', color: '#E53E3E', fontWeight: 600 }}>
                              [已停用]
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            fontFamily: 'Consolas, Monaco, monospace',
                            color: '#718096',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            marginTop: '2px'
                          }}
                        >
                          正则: {rule.findRegex}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleScript(rule.id)}
                        style={{
                          fontSize: '11px',
                          padding: '4px 8px',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          backgroundColor: rule.disabled ? '#F7FAFC' : '#EDF5EE',
                          color: rule.disabled ? '#A0AEC0' : '#2F855A',
                          cursor: 'pointer'
                        }}
                      >
                        {rule.disabled ? '启用' : '已启用'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingScript(rule);
                          setIsModalOpen(true);
                        }}
                        style={{
                          border: 'none',
                          background: 'none',
                          color: '#4A5568',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteScript(rule.id)}
                        style={{
                          border: 'none',
                          background: 'none',
                          color: '#E53E3E',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Sandbox */}
        {activeTab === 'sandbox' && (
          <div style={{ height: 'calc(100% - 10px)' }}>
            <LiveSandboxPreview
              charName={character.name}
              regexScripts={character.regexScripts || []}
              customTheme={character.customTheme}
              hudConfig={character.hudConfig}
              variables={character.variables}
            />
          </div>
        )}

        {/* Tab 5: Import / Export */}
        {activeTab === 'io' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px' }}>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#2D3748', marginBottom: '6px' }}>
                导出当前角色卡 (SillyTavern JSON)
              </div>
              <div style={{ fontSize: '12px', color: '#718096', marginBottom: '14px', lineHeight: 1.5 }}>
                将当前角色的名称、人设、问候语、对话示例以及专属的<strong>专属主题样式、HUD状态栏与正则表达式流水线</strong>打包导出为 SillyTavern 兼容卡规范 JSON 文件。
              </div>
              <button
                type="button"
                onClick={handleExportJson}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#5A6B5C',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Download size={14} /> 导出为 JSON 卡片
              </button>
            </div>

            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#2D3748', marginBottom: '6px' }}>
                导入已有酒馆卡片 (Import Character Card)
              </div>
              <div style={{ fontSize: '12px', color: '#718096', marginBottom: '14px', lineHeight: 1.5 }}>
                选择本地的 <code>.json</code> 角色卡文件，系统将自动解包并载入人设信息与携带的专属前端主题、状态栏与正则替换规则。
              </div>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E0',
                  backgroundColor: '#F8FAFC',
                  color: '#2D3748',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Upload size={14} /> 选择 JSON 文件导入
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJson}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Script Editor Modal */}
      {isModalOpen && (
        <RegexScriptEditorModal
          script={editingScript || undefined}
          onSave={handleAddOrUpdateScript}
          onClose={() => {
            setIsModalOpen(false);
            setEditingScript(null);
          }}
        />
      )}
    </div>
  );
};
