import React, { useState } from 'react';
import { X, Play, Check, Sparkles } from 'lucide-react';
import { CharacterRegexScript } from '../../../types/character';
import { PRESET_REGEX_SCRIPTS, validateRegex, applyRegexScripts } from '../../../core/regex/regexEngine';

interface RegexScriptEditorModalProps {
  script?: CharacterRegexScript;
  onSave: (script: CharacterRegexScript) => void;
  onClose: () => void;
}

export const RegexScriptEditorModal: React.FC<RegexScriptEditorModalProps> = ({
  script,
  onSave,
  onClose
}) => {
  const [name, setName] = useState(script?.scriptName || '');
  const [findRegex, setFindRegex] = useState(script?.findRegex || '');
  const [replaceString, setReplaceString] = useState(script?.replaceString || '');
  const [placement, setPlacement] = useState<'display' | 'ai_output' | 'user_input' | 'all'>(
    script?.placement || 'display'
  );
  const [disabled, setDisabled] = useState(script?.disabled ?? false);

  // Quick test within modal
  const [testText, setTestText] = useState('这是测试文本：*轻轻地抬起头*，看着窗外。<think>思考中：今天天气真好</think> “早安。”');
  const [testResult, setTestResult] = useState('');

  const validation = validateRegex(findRegex);

  const handleTestRun = () => {
    if (!validation.isValid) {
      setTestResult(`正则语法错误: ${validation.error}`);
      return;
    }
    const tempScript: CharacterRegexScript = {
      id: 'temp',
      scriptName: name || '测试规则',
      findRegex,
      replaceString,
      placement,
      disabled: false
    };
    const res = applyRegexScripts(testText, [tempScript], {
      charName: '测试角色',
      userName: '我'
    });
    setTestResult(res);
  };

  const handleApplyPreset = (preset: typeof PRESET_REGEX_SCRIPTS[0]) => {
    setName(preset.scriptName);
    setFindRegex(preset.findRegex);
    setReplaceString(preset.replaceString);
    setPlacement(preset.placement);
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('请输入规则名称');
      return;
    }
    if (!findRegex.trim()) {
      alert('请输入正则表达式模式');
      return;
    }
    if (!validation.isValid) {
      alert(`正则表达式格式不合法: ${validation.error}`);
      return;
    }

    onSave({
      id: script?.id || `regex_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      scriptName: name.trim(),
      findRegex: findRegex.trim(),
      replaceString,
      placement,
      disabled
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '88vh',
          backgroundColor: '#FAF9FD',
          borderRadius: '24px',
          padding: '22px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.8)',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '12px',
                backgroundColor: '#EDF5EE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.06), inset -2px -2px 5px rgba(255,255,255,0.8)'
              }}
            >
              <Sparkles size={18} color="#5A6B5C" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px', color: '#2D3748' }}>
                {script ? '编辑正则规则' : '新增正则美化规则'}
              </div>
              <div style={{ fontSize: '11px', color: '#718096' }}>SillyTavern 兼容正则表达式与 HTML 模板渲染</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: '#A0AEC0',
              padding: '6px',
              borderRadius: '50%'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Presets Bar */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#4A5568', marginBottom: '6px' }}>
            快捷加载常用预设 (Presets):
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {PRESET_REGEX_SCRIPTS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                style={{
                  fontSize: '11px',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#4A5568',
                  cursor: 'pointer',
                  boxShadow: '1px 2px 4px rgba(0,0,0,0.04)'
                }}
              >
                {preset.scriptName}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Rule Name */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4A5568', marginBottom: '4px' }}>
              规则名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：动作括号高亮 / 深度思考折叠框"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Regex Pattern */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#4A5568' }}>
                查找正则 (Regex Pattern)
              </label>
              <span style={{ fontSize: '10px', color: validation.isValid ? '#38A169' : '#E53E3E' }}>
                {validation.isValid ? '✓ 语法有效' : `✗ ${validation.error}`}
              </span>
            </div>
            <input
              type="text"
              value={findRegex}
              onChange={(e) => setFindRegex(e.target.value)}
              placeholder="例如: /<think>([\\s\\S]*?)<\\/think>/gi 或 \\*(.*?)\\*"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '12px',
                border: `1px solid ${validation.isValid ? '#E2E8F0' : '#FEB2B2'}`,
                backgroundColor: '#FFFFFF',
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: '12px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ fontSize: '10px', color: '#A0AEC0', marginTop: '3px' }}>
              支持 `/模式/修饰符` 格式（如 `/.../gi`），或直接填写正则字符串（默认使用 global+multiline）。
            </div>
          </div>

          {/* Replace Template */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4A5568', marginBottom: '4px' }}>
              替换模板 (HTML Beautifier Template)
            </label>
            <textarea
              rows={4}
              value={replaceString}
              onChange={(e) => setReplaceString(e.target.value)}
              placeholder="支持 $1, $2, {{char}}, {{user}} 及自定义 HTML 标签与 style 属性"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: '12px',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ fontSize: '10px', color: '#718096', marginTop: '2px' }}>
              💡 宏变量提示：<code>$1</code>、<code>$2</code> (正则捕获组)，<code>{'{{char}}'}</code> (角色名)，<code>{'{{user}}'}</code> (用户名)
            </div>
          </div>

          {/* Placement & Status */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4A5568', marginBottom: '4px' }}>
                生效范围
              </label>
              <select
                value={placement}
                onChange={(e) => setPlacement(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  fontSize: '12px',
                  outline: 'none'
                }}
              >
                <option value="display">仅渲染展示 (Display HTML)</option>
                <option value="ai_output">仅AI输出 (AI Output)</option>
                <option value="user_input">仅用户输入 (User Input)</option>
                <option value="all">全流水线生效 (All)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '16px' }}>
              <input
                type="checkbox"
                id="disableCheck"
                checked={disabled}
                onChange={(e) => setDisabled(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="disableCheck" style={{ fontSize: '12px', color: '#4A5568', cursor: 'pointer' }}>
                临时禁用该规则
              </label>
            </div>
          </div>

          {/* Fast Sandbox within Modal */}
          <div
            style={{
              marginTop: '6px',
              padding: '12px',
              borderRadius: '14px',
              backgroundColor: '#F7FAFC',
              border: '1px dashed #CBD5E0'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#4A5568' }}>即时单则模拟测试</span>
              <button
                type="button"
                onClick={handleTestRun}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  border: 'none',
                  backgroundColor: '#EDF5EE',
                  color: '#2F855A',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 8px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <Play size={12} /> 运行测试
              </button>
            </div>
            <input
              type="text"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="测试用原始文本"
              style={{
                width: '100%',
                padding: '6px 8px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontSize: '11px',
                boxSizing: 'border-box',
                marginBottom: '6px'
              }}
            />
            {testResult && (
              <div style={{ marginTop: '6px' }}>
                <div style={{ fontSize: '10px', color: '#A0AEC0', marginBottom: '2px' }}>渲染效果预演：</div>
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                    lineHeight: 1.5,
                    color: '#2D3748'
                  }}
                  dangerouslySetInnerHTML={{ __html: testResult }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 18px',
              borderRadius: '12px',
              border: '1px solid #CBD5E0',
              backgroundColor: '#FFFFFF',
              color: '#4A5568',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '9px 20px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#5A6B5C',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 10px rgba(90, 107, 92, 0.3)'
            }}
          >
            <Check size={16} /> 保存规则
          </button>
        </div>
      </div>
    </div>
  );
};
