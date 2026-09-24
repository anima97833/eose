export const MOOD_FORTUNE_APP_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>答案之书</title>
  <style>
    :root {
      --nm-bg: #EAEFF5;
      --nm-card: #EAEFF5;
      --nm-primary: #7A5C3E;
      --nm-gold: #C59A4E;
      --nm-gold-dark: #8F6927;
      --nm-text: #2C3545;
      --nm-sub: #7A899E;
      --nm-convex: 6px 6px 14px rgba(160, 175, 195, 0.55), -6px -6px 14px rgba(255, 255, 255, 0.95);
      --nm-convex-sm: 3px 3px 8px rgba(160, 175, 195, 0.45), -3px -3px 8px rgba(255, 255, 255, 0.95);
      --nm-inset: inset 3px 3px 7px rgba(150, 168, 190, 0.65), inset -3px -3px 7px rgba(255, 255, 255, 0.95);
      --nm-inset-sm: inset 2px 2px 5px rgba(150, 168, 190, 0.5), inset -2px -2px 5px rgba(255, 255, 255, 0.95);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Segoe UI", Roboto, Georgia, serif; }
    html, body {
      width: 100%;
      height: 100%;
      overflow-x: hidden;
      overflow-y: auto;
      background-color: var(--nm-bg);
      color: var(--nm-text);
    }
    body {
      padding: 14px 16px 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 12px;
      box-sizing: border-box;
    }
    /* 顶部导航 */
    .header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    }
    .title {
      font-size: 16px;
      font-weight: 800;
      color: var(--nm-text);
      display: flex;
      align-items: center;
      gap: 6px;
      letter-spacing: 0.5px;
    }
    .header-btns {
      display: flex;
      gap: 8px;
    }
    .btn-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--nm-card);
      border: none;
      box-shadow: var(--nm-convex-sm);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--nm-sub);
      font-size: 15px;
      font-weight: 700;
      outline: none;
      transition: transform 0.1s, box-shadow 0.1s;
      user-select: none;
    }
    .btn-circle:active {
      box-shadow: var(--nm-inset-sm);
      transform: scale(0.95);
    }

    /* 主舞台 */
    .main-stage {
      flex: 1;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      position: relative;
    }

    /* 轻拟物精装书实体 */
    .book-container {
      width: 100%;
      max-width: 280px;
      height: 200px;
      perspective: 1000px;
      position: relative;
    }
    .book {
      width: 100%;
      height: 100%;
      border-radius: 16px;
      background: linear-gradient(135deg, #F8FAFD 0%, #E3E9F2 100%);
      box-shadow: 8px 8px 20px rgba(150, 168, 190, 0.6), -7px -7px 18px rgba(255, 255, 255, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.85);
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px;
      transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      cursor: pointer;
      user-select: none;
    }
    .book:active {
      transform: scale(0.98);
    }
    .book.flipping {
      transform: rotateY(-18deg) scale(0.96);
      filter: brightness(1.05);
    }

    /* 书籍封面装饰线条与烫金 */
    .book-spine {
      position: absolute;
      left: 12px;
      top: 0;
      bottom: 0;
      width: 4px;
      background: linear-gradient(to right, rgba(0,0,0,0.06), rgba(255,255,255,0.7));
      border-radius: 2px;
      pointer-events: none;
    }
    .book-border {
      position: absolute;
      inset: 10px;
      border: 1px dashed rgba(197, 154, 78, 0.45);
      border-radius: 10px;
      pointer-events: none;
    }
    .book-emblem {
      font-size: 24px;
      margin-bottom: 4px;
      filter: drop-shadow(0 2px 4px rgba(197, 154, 78, 0.3));
    }
    .book-en-title {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 2px;
      color: var(--nm-gold-dark);
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .book-cn-title {
      font-size: 20px;
      font-weight: 900;
      color: var(--nm-text);
      letter-spacing: 3px;
      margin-bottom: 4px;
    }
    .book-hint {
      font-size: 11px;
      color: var(--nm-sub);
      text-align: center;
      line-height: 1.4;
    }

    /* 翻开后的内页展示卡片 */
    .page-reveal {
      display: none;
      width: 100%;
      height: 100%;
      flex-direction: column;
      justify-content: space-between;
      animation: pageTurn 0.35s ease-out;
    }
    @keyframes pageTurn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px dashed rgba(197, 154, 78, 0.35);
      padding-bottom: 4px;
    }
    .page-num {
      font-size: 10px;
      font-weight: 800;
      color: var(--nm-gold-dark);
      letter-spacing: 1px;
    }
    .page-question-tag {
      font-size: 10.5px;
      color: var(--nm-sub);
      max-width: 160px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .page-body {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      margin: 8px 0;
      text-align: center;
    }
    .answer-en {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: var(--nm-gold-dark);
      text-transform: uppercase;
    }
    .answer-cn {
      font-size: 21px;
      font-weight: 900;
      color: var(--nm-text);
      letter-spacing: 1.5px;
      line-height: 1.35;
      text-shadow: 0 1px 2px rgba(255,255,255,0.8);
    }
    .ai-comment-box {
      background: rgba(255, 255, 255, 0.6);
      border-radius: 8px;
      padding: 5px 8px;
      font-size: 10.5px;
      color: #4A5B73;
      line-height: 1.4;
      border: 1px solid rgba(255, 255, 255, 0.7);
    }

    /* 输入区域 */
    .input-section {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .input-box {
      width: 100%;
      padding: 9px 12px;
      border-radius: 12px;
      background: var(--nm-card);
      border: 1px solid rgba(255, 255, 255, 0.6);
      box-shadow: var(--nm-inset);
      font-size: 12.5px;
      color: var(--nm-text);
      outline: none;
      box-sizing: border-box;
      transition: all 0.2s;
    }
    .input-box::placeholder {
      color: #9AA8BC;
    }
    .input-box:focus {
      border-color: rgba(197, 154, 78, 0.5);
    }

    /* 快捷问题胶囊 */
    .quick-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      justify-content: center;
    }
    .tag-btn {
      padding: 5px 11px;
      border-radius: 12px;
      background: var(--nm-card);
      border: none;
      box-shadow: var(--nm-convex-sm);
      font-size: 11px;
      color: var(--nm-sub);
      cursor: pointer;
      outline: none;
      transition: all 0.12s;
      user-select: none;
    }
    .tag-btn:hover {
      color: var(--nm-gold-dark);
    }
    .tag-btn:active {
      color: var(--nm-gold-dark);
      box-shadow: var(--nm-inset-sm);
      transform: scale(0.96);
    }

    /* 主翻书操作按钮 */
    .action-btn {
      width: 100%;
      height: 46px;
      border-radius: 23px;
      background: var(--nm-card);
      border: none;
      box-shadow: 6px 6px 14px rgba(160, 175, 195, 0.55), -5px -5px 14px rgba(255, 255, 255, 0.95);
      color: var(--nm-gold-dark);
      font-size: 14.5px;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      outline: none;
      transition: all 0.15s;
      flex-shrink: 0;
      user-select: none;
    }
    .action-btn:active {
      box-shadow: var(--nm-inset);
      transform: scale(0.98);
    }
    .action-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* 历史记录抽屉面板 */
    .history-drawer {
      display: none;
      position: absolute;
      inset: 0;
      background: var(--nm-card);
      border-radius: 18px;
      box-shadow: var(--nm-convex);
      padding: 14px;
      z-index: 20;
      flex-direction: column;
      gap: 8px;
    }
    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(0,0,0,0.06);
      padding-bottom: 6px;
    }
    .history-list {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .history-item {
      padding: 8px 10px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.45);
      font-size: 11px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .history-q {
      color: var(--nm-sub);
    }
    .history-a {
      font-weight: 800;
      color: var(--nm-text);
    }
  </style>
</head>
<body>

  <!-- 顶栏 -->
  <div class="header">
    <div class="title">
      <span>📖</span>
      <span>答案之书</span>
    </div>
    <div class="header-btns">
      <button type="button" class="btn-circle" id="btn-history" title="历史问答手账">📜</button>
      <button type="button" class="btn-circle" id="btn-close" title="退出">✕</button>
    </div>
  </div>

  <!-- 主舞台 -->
  <div class="main-stage">
    <!-- 实体精装书 (点击也可直接翻开) -->
    <div class="book-container">
      <div class="book" id="book-element" title="点击直接翻开指引之页">
        <div class="book-spine"></div>
        <div class="book-border"></div>

        <!-- 封面正面 (未翻开) -->
        <div id="cover-view" style="display:flex; flex-direction:column; align-items:center; text-align:center;">
          <div class="book-emblem">✨</div>
          <div class="book-en-title">The Book of Answers</div>
          <div class="book-cn-title">答案之书</div>
          <div class="book-hint" id="book-hint">轻触书本或下方按键<br>随心翻开，答案自现</div>
        </div>

        <!-- 内页展示 (翻开后) -->
        <div class="page-reveal" id="page-reveal">
          <div class="page-header">
            <span class="page-num" id="page-num">PAGE 138</span>
            <span class="page-question-tag" id="page-question-tag">🤔 未知困惑</span>
          </div>

          <div class="page-body">
            <div class="answer-en" id="answer-en">WAIT AND SEE</div>
            <div class="answer-cn" id="answer-cn">退一步海阔天空</div>
          </div>

          <div class="ai-comment-box" id="ai-comment-box">
            🍃 答案已落在心间，倾听你的第一直觉。
          </div>
        </div>
      </div>
    </div>

    <!-- 步骤 1: 用户困惑输入与快捷预设 -->
    <div class="input-section" id="input-section">
      <input
        type="text"
        class="input-box"
        id="question-input"
        placeholder="写下你此刻纠结的问题 (或点击下方预设)"
        maxlength="40"
        autocomplete="off"
      />
      <div class="quick-tags">
        <button type="button" class="tag-btn" data-question="我该换工作吗？">💼 换工作？</button>
        <button type="button" class="tag-btn" data-question="今晚要去表白吗？">💌 去表白？</button>
        <button type="button" class="tag-btn" data-question="要不要买下它？">🛍️ 买不买？</button>
        <button type="button" class="tag-btn" data-question="应该继续坚持吗？">🔥 坚持吗？</button>
        <button type="button" class="tag-btn" data-question="明天会一切顺利吗？">🍀 顺利吗？</button>
      </div>
    </div>

    <!-- 历史记录抽屉面板 -->
    <div class="history-drawer" id="history-drawer">
      <div class="history-header">
        <span style="font-size:12px; font-weight:800; color:var(--nm-gold-dark);">📜 启示手账纪录</span>
        <button type="button" class="btn-circle" style="width:26px; height:26px; font-size:12px;" id="btn-close-history">✕</button>
      </div>
      <div class="history-list" id="history-list-items"></div>
    </div>
  </div>

  <!-- 步骤 2: 翻开答案操作按钮 -->
  <button type="button" class="action-btn" id="btn-action">
    <span>📖</span>
    <span id="btn-text">翻开指引之页</span>
  </button>

  <script>
    // 原版精选《答案之书》权威经典词库 (中英双语)
    const ANSWERS_CORPUS = [
      { cn: "退一步海阔天空", en: "Take a step back" },
      { cn: "勇敢迈出第一步", en: "Take the first step bravely" },
      { cn: "毫无疑问", en: "Without a doubt" },
      { cn: "静候最佳时机", en: "Wait for the right moment" },
      { cn: "放手去搏", en: "Go for it" },
      { cn: "答案显而易见", en: "The answer is obvious" },
      { cn: "顺其自然", en: "Let nature take its course" },
      { cn: "不要犹豫", en: "Do not hesitate" },
      { cn: "另辟蹊径", en: "Find another way" },
      { cn: "听从内心的第一直觉", en: "Trust your first instinct" },
      { cn: "放下执念", en: "Let it go" },
      { cn: "全力以赴", en: "Give it your all" },
      { cn: "暂且搁置一下", en: "Set it aside for now" },
      { cn: "结果会让你惊喜", en: "The result will surprise you" },
      { cn: "珍惜眼前所拥有的", en: "Cherish what you have" },
      { cn: "不要抱有不切实际的幻想", en: "Do not cling to illusions" },
      { cn: "现在还不是时候", en: "Now is not the time" },
      { cn: "你需要更多的耐心", en: "More patience is required" },
      { cn: "换个角度看问题", en: "Look from a different angle" },
      { cn: "大胆说出你的想法", en: "Speak your mind boldly" },
      { cn: "其实你心里早有答案", en: "You already know the answer" },
      { cn: "保持沉默是更好的选择", en: "Silence is a better choice" },
      { cn: "去问问值得信赖的人", en: "Ask someone you trust" },
      { cn: "给彼此一点空间", en: "Give each other some space" },
      { cn: "立即行动，不要拖延", en: "Act now, do not delay" },
      { cn: "别让过去的遗憾困扰你", en: "Leave the past behind" },
      { cn: "准备好迎接新变化", en: "Prepare for changes" },
      { cn: "相信一切都是最好的安排", en: "Trust the timing of your life" },
      { cn: "坚守你的底线", en: "Hold on to your principles" },
      { cn: "这件事值得你的付出", en: "It is worth your effort" },
      { cn: "不要太在意别人的评价", en: "Do not care what others think" },
      { cn: "学会拒绝", en: "Learn to say no" },
      { cn: "专注于手头当下的事", en: "Focus on the present moment" },
      { cn: "前方有惊喜在等你", en: "A pleasant surprise awaits" },
      { cn: "先好好睡一觉", en: "Get a good night's sleep first" },
      { cn: "不要为了妥协而妥协", en: "Never settle" },
      { cn: "做最坏的打算，抱最好的希望", en: "Hope for best, prepare for worst" },
      { cn: "结局会比你想的更好", en: "It will end better than you think" },
      { cn: "遵循你的常识", en: "Follow common sense" },
      { cn: "不要回头", en: "Never look back" }
    ];

    const bookElement = document.getElementById('book-element');
    const coverView = document.getElementById('cover-view');
    const pageReveal = document.getElementById('page-reveal');
    const questionInput = document.getElementById('question-input');
    const btnAction = document.getElementById('btn-action');
    const btnText = document.getElementById('btn-text');
    const pageNum = document.getElementById('page-num');
    const pageQuestionTag = document.getElementById('page-question-tag');
    const answerCn = document.getElementById('answer-cn');
    const answerEn = document.getElementById('answer-en');
    const aiCommentBox = document.getElementById('ai-comment-box');
    const btnClose = document.getElementById('btn-close');
    const btnHistory = document.getElementById('btn-history');
    const btnCloseHistory = document.getElementById('btn-close-history');
    const historyDrawer = document.getElementById('history-drawer');
    const historyListItems = document.getElementById('history-list-items');

    let isRevealed = false;
    let isFlipping = false;

    // 1. 快捷预设按钮点击监听 (严密绑定 data-question)
    document.querySelectorAll('.tag-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const q = this.getAttribute('data-question') || this.innerText;
        if (questionInput) {
          questionInput.value = q.replace(/^[^\w\u4e00-\u9fa5]+/, '').trim();
          questionInput.focus();
        }
      });
    });

    // 2. 回车键快捷翻开
    if (questionInput) {
      questionInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          triggerFlip();
        }
      });
    }

    // 3. 核心翻开函数
    function triggerFlip() {
      if (isFlipping) return;

      if (isRevealed) {
        // 当前已是翻开状态 -> 合上书本，准备再问
        coverView.style.display = 'flex';
        pageReveal.style.display = 'none';
        btnText.textContent = "翻开指引之页";
        isRevealed = false;
        if (questionInput) {
          questionInput.value = "";
          questionInput.focus();
        }
        return;
      }

      // 执行翻书抽签
      const question = (questionInput && questionInput.value.trim()) || "我心中的困惑";
      isFlipping = true;
      btnAction.disabled = true;
      btnText.textContent = "正在翻开命运之页...";
      bookElement.classList.add('flipping');

      setTimeout(function() {
        try {
          bookElement.classList.remove('flipping');
          const picked = ANSWERS_CORPUS[Math.floor(Math.random() * ANSWERS_CORPUS.length)];
          const randomPage = Math.floor(Math.random() * 320) + 12;

          pageNum.textContent = "PAGE " + randomPage;
          pageQuestionTag.textContent = "🤔 " + question;
          answerCn.textContent = picked.cn;
          answerEn.textContent = picked.en;
          aiCommentBox.textContent = "🍃 答案已然显现，去印证你心中的抉择。";

          coverView.style.display = 'none';
          pageReveal.style.display = 'flex';
          isRevealed = true;
          btnText.textContent = "合上书本 · 再问一次";

          // 异步伴侣互动与历史存储 (完全防御包裹，不阻碍主界面)
          if (window.AiPhone) {
            try {
              if (window.AiPhone.db) {
                window.AiPhone.db.create('answers_history', {
                  question: question,
                  answerCn: picked.cn,
                  answerEn: picked.en,
                  page: randomPage,
                  timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }).catch(function() {});
              }

              if (window.AiPhone.characters && window.AiPhone.ai) {
                window.AiPhone.characters.list().then(function(chars) {
                  const activeChar = chars && chars.length > 0 ? chars[0] : null;
                  if (activeChar) {
                    const prompt = "我向《答案之书》询问了：【" + question + "】，翻开得到的答案是：【" + picked.cn + "】。请你以你的性格，用一两句充满灵气与鼓励的温柔短评回答我，字数在40字以内。";
                    window.AiPhone.ai.generate({
                      prompt: prompt,
                      characterId: activeChar.id
                    }).then(function(res) {
                      if (res && res.content) {
                        aiCommentBox.textContent = "【" + activeChar.name + "的启示】" + res.content;
                      }
                    }).catch(function() {});
                  }
                }).catch(function() {});
              }

              if (window.AiPhone.ui && window.AiPhone.ui.toast) {
                window.AiPhone.ui.toast("答案已显现：\"" + picked.cn + "\"").catch(function() {});
              }
            } catch (err) {
              console.warn("AiPhone optional sdk call error:", err);
            }
          }
        } finally {
          btnAction.disabled = false;
          isFlipping = false;
        }
      }, 550);
    }

    // 4. 绑定底部按键与书本本身的点击翻开
    btnAction.addEventListener('click', function(e) {
      e.preventDefault();
      triggerFlip();
    });

    bookElement.addEventListener('click', function(e) {
      e.preventDefault();
      triggerFlip();
    });

    // 5. 关闭应用返回桌面
    if (btnClose) {
      btnClose.addEventListener('click', function(e) {
        e.preventDefault();
        if (window.AiPhone && window.AiPhone.app) {
          window.AiPhone.app.close();
        }
      });
    }

    // 6. 历史记录手账抽屉
    if (btnHistory) {
      btnHistory.addEventListener('click', function(e) {
        e.preventDefault();
        historyDrawer.style.display = 'flex';
        historyListItems.innerHTML = '<div style="font-size:11px; color:#888; text-align:center; padding:10px;">读取历史记录中...</div>';

        if (window.AiPhone && window.AiPhone.db) {
          window.AiPhone.db.list('answers_history').then(function(list) {
            historyListItems.innerHTML = '';
            if (!list || list.length === 0) {
              historyListItems.innerHTML = '<div style="font-size:11px; color:#888; text-align:center; padding:20px;">暂无历史问答记录</div>';
            } else {
              list.slice(0, 15).forEach(function(item) {
                const div = document.createElement('div');
                div.className = 'history-item';
                div.innerHTML = '<div class="history-q">问：' + (item.question || '心事困惑') + ' <span style="font-size:9px; color:#aaa;">(' + (item.timeStr || '') + ')</span></div>' +
                                '<div class="history-a">答：' + (item.answerCn || '') + ' (' + (item.answerEn || '') + ')</div>';
                historyListItems.appendChild(div);
              });
            }
          }).catch(function() {
            historyListItems.innerHTML = '<div style="font-size:11px; color:#888; text-align:center; padding:20px;">暂无历史记录</div>';
          });
        } else {
          historyListItems.innerHTML = '<div style="font-size:11px; color:#888; text-align:center; padding:20px;">暂无历史记录</div>';
        }
      });
    }

    if (btnCloseHistory) {
      btnCloseHistory.addEventListener('click', function(e) {
        e.preventDefault();
        historyDrawer.style.display = 'none';
      });
    }
  </script>
</body>
</html>`;
