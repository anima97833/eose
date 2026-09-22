export const MOOD_FORTUNE_APP_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>心事抽签筒</title>
  <style>
    :root {
      --nm-bg: #E9EEF5;
      --nm-primary: #5096C6;
      --nm-text: #334257;
      --nm-sub: #7D8CA3;
      --nm-convex: 5px 5px 12px rgba(160, 175, 195, 0.55), -5px -5px 12px rgba(255, 255, 255, 0.95);
      --nm-inset: inset 3px 3px 7px rgba(150, 168, 190, 0.7), inset -3px -3px 7px rgba(255, 255, 255, 0.95);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Segoe UI", Roboto, sans-serif; }
    body {
      background-color: var(--nm-bg);
      color: var(--nm-text);
      min-height: 100vh;
      padding: 18px 16px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justifyContent: space-between;
      user-select: none;
      -webkit-user-select: none;
    }
    .header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .title {
      font-size: 16px;
      font-weight: 800;
      color: var(--nm-text);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .btn-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--nm-bg);
      border: none;
      box-shadow: var(--nm-convex);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--nm-sub);
      font-size: 14px;
      font-weight: 700;
      outline: none;
      transition: transform 0.1s;
    }
    .btn-circle:active {
      box-shadow: var(--nm-inset);
      transform: scale(0.95);
    }
    .main-stage {
      flex: 1;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justifyContent: center;
      gap: 18px;
    }
    /* 拟物抽签筒 */
    .tube-container {
      width: 110px;
      height: 140px;
      background: var(--nm-bg);
      border-radius: 24px;
      box-shadow: 8px 8px 18px rgba(160, 175, 195, 0.6), -8px -8px 18px rgba(255, 255, 255, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.6);
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justifyContent: flex-end;
      padding-bottom: 16px;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .tube-container.shaking {
      animation: shake 0.5s ease-in-out infinite alternate;
    }
    @keyframes shake {
      0% { transform: rotate(-8deg) translateY(-4px); }
      100% { transform: rotate(8deg) translateY(4px); }
    }
    .sticks {
      position: absolute;
      top: -24px;
      display: flex;
      gap: 5px;
    }
    .stick {
      width: 6px;
      height: 48px;
      background: #D9A066;
      border-radius: 3px 3px 0 0;
      box-shadow: 1px 1px 3px rgba(0,0,0,0.15);
    }
    .stick.active {
      background: #E85A71;
      height: 58px;
      transform: translateY(-8px);
      transition: all 0.3s;
    }
    .tube-label {
      font-size: 13px;
      font-weight: 800;
      color: var(--nm-primary);
      letter-spacing: 1px;
    }
    /* 结果卡片 */
    .result-card {
      width: 100%;
      background: var(--nm-bg);
      border-radius: 20px;
      box-shadow: var(--nm-convex);
      padding: 16px 18px;
      display: none;
      flex-direction: column;
      gap: 8px;
      animation: fadeIn 0.3s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fortune-badge {
      align-self: flex-start;
      background: linear-gradient(135deg, #5CA4D5 0%, #468EC0 100%);
      color: #fff;
      font-size: 12px;
      font-weight: 800;
      padding: 3px 10px;
      border-radius: 12px;
      box-shadow: 0 2px 6px rgba(70, 142, 192, 0.4);
    }
    .fortune-quote {
      font-size: 14px;
      font-weight: 700;
      color: var(--nm-text);
      line-height: 1.4;
    }
    .ai-reply-box {
      margin-top: 4px;
      padding: 10px 12px;
      background: rgba(255, 255, 255, 0.4);
      border-radius: 14px;
      font-size: 12px;
      color: #4A5B73;
      line-height: 1.6;
      min-height: 38px;
      position: relative;
    }
    /* 抽签主按键 */
    .action-btn {
      width: 100%;
      height: 48px;
      border-radius: 24px;
      background: var(--nm-bg);
      border: none;
      box-shadow: 6px 6px 14px rgba(160, 175, 195, 0.55), -5px -5px 14px rgba(255, 255, 255, 0.95);
      color: var(--nm-primary);
      font-size: 15px;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      outline: none;
      transition: all 0.15s;
    }
    .action-btn:active {
      box-shadow: var(--nm-inset);
      transform: scale(0.98);
    }
    .action-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .history-list {
      width: 100%;
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-height: 120px;
      overflow-y: auto;
    }
    .history-item {
      font-size: 11px;
      padding: 6px 10px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.35);
      color: var(--nm-sub);
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>

  <!-- 顶栏 -->
  <div class="header">
    <div class="title">
      <span>🎋</span>
      <span>心事抽签盲盒</span>
    </div>
    <div style="display:flex; gap:8px;">
      <button class="btn-circle" id="btn-history-toggle" title="查看历史记录">📜</button>
      <button class="btn-circle" id="btn-close" title="返回桌面">✕</button>
    </div>
  </div>

  <!-- 主舞台 -->
  <div class="main-stage">
    <div class="tube-container" id="tube">
      <div class="sticks">
        <div class="stick" style="transform: rotate(-10deg);"></div>
        <div class="stick active" id="stick-active"></div>
        <div class="stick" style="transform: rotate(8deg);"></div>
      </div>
      <div class="tube-label">心事签</div>
    </div>

    <!-- 结果卡片 -->
    <div class="result-card" id="result-card">
      <div class="fortune-badge" id="fortune-badge">大吉 · 灵感涌动</div>
      <div class="fortune-quote" id="fortune-quote">所思所念，皆有回响。</div>
      <div class="ai-reply-box" id="ai-reply-box">正在请伴侣为你解签...</div>
    </div>

    <!-- 历史记录面板 -->
    <div class="history-list" id="history-list" style="display:none;"></div>
  </div>

  <!-- 底部操作键 -->
  <button class="action-btn" id="btn-draw">
    <span>✨</span>
    <span id="draw-text">摇一摇抽心事签</span>
  </button>

  <script>
    const FORTUNES = [
      { badge: "上上签 · 灵感涌动", quote: "万物生长，今日所想之念皆有回音。" },
      { badge: "大吉 · 岁岁温柔", quote: "日出有盼，日落有念，平安喜乐常伴心间。" },
      { badge: "温润签 · 岁月静好", quote: "慢下来，生活自会给你最甜的答案。" },
      { badge: "开颜签 · 惊喜相逢", quote: "不期而遇的幸运，正快马加鞭向你奔来。" },
      { badge: "清风签 · 悠然自得", quote: "心若轻盈，哪怕细微碎屑亦是诗意浪漫。" }
    ];

    const tube = document.getElementById('tube');
    const btnDraw = document.getElementById('btn-draw');
    const drawText = document.getElementById('draw-text');
    const resultCard = document.getElementById('result-card');
    const fortuneBadge = document.getElementById('fortune-badge');
    const fortuneQuote = document.getElementById('fortune-quote');
    const aiReplyBox = document.getElementById('ai-reply-box');
    const btnClose = document.getElementById('btn-close');
    const btnHistory = document.getElementById('btn-history-toggle');
    const historyList = document.getElementById('history-list');

    let isDrawing = false;
    let showingHistory = false;

    // 1. 关闭应用返回桌面
    btnClose.addEventListener('click', function() {
      if (window.AiPhone && window.AiPhone.app) {
        window.AiPhone.app.close();
      }
    });

    // 2. 抽签全流程与 SDK 联动
    btnDraw.addEventListener('click', async function() {
      if (isDrawing) return;
      isDrawing = true;
      btnDraw.disabled = true;
      drawText.textContent = "祈愿摇签中...";
      tube.classList.add('shaking');
      resultCard.style.display = 'none';

      // 震动动画 900ms
      setTimeout(async function() {
        tube.classList.remove('shaking');
        const picked = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];

        fortuneBadge.textContent = picked.badge;
        fortuneQuote.textContent = picked.quote;
        aiReplyBox.textContent = "🌟 正在联络 AI 伴侣倾听并解签...";
        resultCard.style.display = 'flex';

        // 调用 AiPhone SDK
        if (window.AiPhone) {
          try {
            // A. 读取当前角色
            const chars = await window.AiPhone.characters.list();
            const activeChar = chars && chars.length > 0 ? chars[0] : null;
            const charName = activeChar ? activeChar.name : "小手机伴侣";
            const charId = activeChar ? activeChar.id : undefined;

            // B. 调用大模型生成伴侣专属解签
            const prompt = "我刚刚在小手机抽到了心事签：【" + picked.badge + "】“" + picked.quote + "”，请你用你独有的性格和语气，为我写一段充满灵气、温暖心田的专属解签寄语吧！";
            const res = await window.AiPhone.ai.generate({
              prompt: prompt,
              characterId: charId
            });

            const replyContent = res && res.content ? res.content : ("【" + charName + "的祝福】愿你抽中的好运全都能兑现，天天开心！");
            aiReplyBox.textContent = replyContent;

            // C. 写入自定义 APP 私有数据库
            await window.AiPhone.db.create('fortunes', {
              badge: picked.badge,
              quote: picked.quote,
              reply: replyContent,
              charName: charName,
              timeStr: new Date().toLocaleTimeString()
            });

            // D. 在小手机桌面点亮未读红点
            await window.AiPhone.notifications.setBadge(1);

            // E. 触发宿主轻拟物 Toast 提示
            await window.AiPhone.ui.toast("解签完成！愿今日温暖伴你~");

          } catch (e) {
            aiReplyBox.textContent = "【伴侣解签】愿万事顺意，今天的你闪闪发光！";
            console.error(e);
          }
        }

        drawText.textContent = "再次抽签";
        btnDraw.disabled = false;
        isDrawing = false;
      }, 900);
    });

    // 3. 历史记录切换
    btnHistory.addEventListener('click', async function() {
      showingHistory = !showingHistory;
      historyList.style.display = showingHistory ? 'flex' : 'none';

      if (showingHistory && window.AiPhone && window.AiPhone.db) {
        const list = await window.AiPhone.db.list('fortunes');
        historyList.innerHTML = '';
        if (!list || list.length === 0) {
          historyList.innerHTML = '<div style="font-size:11px; color:#888; text-align:center;">暂无抽签历史</div>';
        } else {
          list.slice(0, 5).forEach(function(item) {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = '<span>' + (item.badge || '心事签') + '</span><span>' + (item.timeStr || '') + '</span>';
            historyList.appendChild(div);
          });
        }
      }
    });
  </script>
</body>
</html>`;
