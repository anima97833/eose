import { CharacterProfile, CharacterRegexScript } from '../../types/character';

/**
 * Parses PNG binary buffer in browser and extracts SillyTavern character card metadata
 */
export async function parseCharacterCardFromPng(file: File): Promise<Partial<CharacterProfile> | null> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const dataView = new DataView(arrayBuffer);

  // Validate PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] !== 0x89 ||
    bytes[1] !== 0x50 ||
    bytes[2] !== 0x4e ||
    bytes[3] !== 0x47 ||
    bytes[4] !== 0x0d ||
    bytes[5] !== 0x0a ||
    bytes[6] !== 0x1a ||
    bytes[7] !== 0x0a
  ) {
    throw new Error('不是标准的 PNG 图像文件');
  }

  let pos = 8;
  let rawJsonStr: string | null = null;

  while (pos < bytes.length) {
    const length = dataView.getUint32(pos, false);
    const type = String.fromCharCode(
      bytes[pos + 4],
      bytes[pos + 5],
      bytes[pos + 6],
      bytes[pos + 7]
    );

    if (type === 'tEXt') {
      const chunkData = bytes.subarray(pos + 8, pos + 8 + length);
      // Find null separator
      let nullIdx = -1;
      for (let i = 0; i < chunkData.length; i++) {
        if (chunkData[i] === 0) {
          nullIdx = i;
          break;
        }
      }

      if (nullIdx !== -1) {
        let keyword = '';
        for (let i = 0; i < nullIdx; i++) {
          keyword += String.fromCharCode(chunkData[i]);
        }

        if (keyword === 'chara' || keyword === 'ccv3') {
          const textBytes = chunkData.subarray(nullIdx + 1);
          let base64 = '';
          for (let i = 0; i < textBytes.length; i++) {
            base64 += String.fromCharCode(textBytes[i]);
          }
          try {
            // decode utf-8 from base64
            const binaryString = atob(base64);
            const binaryLen = binaryString.length;
            const utf8Bytes = new Uint8Array(binaryLen);
            for (let i = 0; i < binaryLen; i++) {
              utf8Bytes[i] = binaryString.charCodeAt(i);
            }
            const decoder = new TextDecoder('utf-8');
            rawJsonStr = decoder.decode(utf8Bytes);
            break;
          } catch (e) {
            console.error('Base64 decode failed for tEXt chunk:', e);
          }
        }
      }
    }

    pos += 12 + length;
  }

  if (!rawJsonStr) {
    throw new Error('未在 PNG 图片元数据中检测到酒馆角色卡 (chara/ccv3) 数据块');
  }

  const raw = JSON.parse(rawJsonStr);
  const data = raw.data || raw;
  const ext = data.extensions || {};

  // Extract and format regex scripts
  const regexScripts: CharacterRegexScript[] = [];
  if (Array.isArray(ext.regex_scripts)) {
    for (const r of ext.regex_scripts) {
      regexScripts.push({
        id: r.id || `regex_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        scriptName: r.scriptName || r.name || '未命名规则',
        findRegex: r.findRegex || '',
        replaceString: r.replaceString || '',
        placement: 'display',
        disabled: r.disabled ?? false,
        description: r.description
      });
    }
  }

  return {
    name: data.name || '未知角色',
    persona: data.personality || data.description || '',
    description: data.description || '',
    worldScenario: data.scenario || '',
    firstMessage: data.first_mes || '',
    dialogueExamples: data.mes_example || '',
    alternateGreetings: data.alternate_greetings || [],
    regexScripts,
    variables: ext.variables || {},
    customTheme: {
      name: '自定义导入主题',
      chatBg: '#1A202C',
      bubbleBg: '#2D3748',
      bubbleTextColor: '#E2E8F0',
      accentColor: '#ED64A6'
    },
    hudConfig: {
      enabled: true,
      layout: 'compass',
      showAffection: true,
      showMood: true,
      showLocation: true
    }
  };
}
