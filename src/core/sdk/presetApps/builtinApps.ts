export const CALCULATOR_APP_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>拟物计算器</title>
  <style>
    :root {
      --nm-bg: #E9EEF5;
      --nm-primary: #5096C6;
      --nm-text: #334257;
      --nm-sub: #7D8CA3;
      --nm-convex: 5px 5px 12px rgba(160, 175, 195, 0.55), -5px -5px 12px rgba(255, 255, 255, 0.95);
      --nm-inset: inset 3px 3px 6px rgba(150, 168, 190, 0.7), inset -3px -3px 6px rgba(255, 255, 255, 0.95);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body {
      background-color: var(--nm-bg);
      color: var(--nm-text);
      min-height: 100vh;
      padding: 16px;
      display: flex;
      flex-direction: column;
      justifyContent: space-between;
      user-select: none;
      -webkit-user-select: none;
    }
    .header {
      display: flex;
      justifyContent: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .title { font-size: 15px; font-weight: 800; color: var(--nm-text); }
    .btn-circle {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--nm-bg);
      border: none;
      box-shadow: var(--nm-convex);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--nm-sub);
      outline: none;
      font-weight: 700;
    }
    .btn-circle:active { box-shadow: var(--nm-inset); transform: scale(0.95); }
    /* 拟物凹陷屏幕 */
    .screen {
      width: 100%;
      height: 74px;
      background: var(--nm-bg);
      border-radius: 18px;
      box-shadow: var(--nm-inset);
      padding: 12px 18px;
      display: flex;
      flex-direction: column;
      justifyContent: flex-end;
      align-items: flex-end;
      overflow: hidden;
      margin-bottom: 16px;
    }
    .expr { font-size: 13px; color: var(--nm-sub); min-height: 16px; }
    .val { font-size: 28px; font-weight: 800; color: var(--nm-text); }
    /* 键盘网格 */
    .keypad {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      flex: 1;
      align-content: center;
    }
    .key {
      height: 52px;
      border-radius: 18px;
      background: var(--nm-bg);
      border: none;
      box-shadow: var(--nm-convex);
      color: var(--nm-text);
      font-size: 18px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      outline: none;
      transition: all 0.1s;
    }
    .key:active { box-shadow: var(--nm-inset); transform: scale(0.94); }
    .key.op { color: var(--nm-primary); font-size: 20px; }
    .key.eq { background: linear-gradient(135deg, #5CA4D5 0%, #468EC0 100%); color: #fff; box-shadow: 0 4px 10px rgba(70, 142, 192, 0.45); }
    .key.clear { color: #E85A71; }
  </style>
</head>
<body>
  <div class="header">
    <span class="title">🧮 拟物经典计算器</span>
    <button class="btn-circle" id="btn-close">✕</button>
  </div>

  <div class="screen">
    <div class="expr" id="expr"></div>
    <div class="val" id="val">0</div>
  </div>

  <div class="keypad">
    <button class="key clear" data-val="C">C</button>
    <button class="key op" data-val="±">±</button>
    <button class="key op" data-val="%">%</button>
    <button class="key op" data-val="÷">÷</button>

    <button class="key" data-val="7">7</button>
    <button class="key" data-val="8">8</button>
    <button class="key" data-val="9">9</button>
    <button class="key op" data-val="×">×</button>

    <button class="key" data-val="4">4</button>
    <button class="key" data-val="5">5</button>
    <button class="key" data-val="6">6</button>
    <button class="key op" data-val="-">-</button>

    <button class="key" data-val="1">1</button>
    <button class="key" data-val="2">2</button>
    <button class="key" data-val="3">3</button>
    <button class="key op" data-val="+">+</button>

    <button class="key" data-val="0" style="grid-column: span 2; border-radius: 20px;">0</button>
    <button class="key" data-val=".">.</button>
    <button class="key eq" data-val="=">=</button>
  </div>

  <script>
    const valEl = document.getElementById('val');
    const exprEl = document.getElementById('expr');
    document.getElementById('btn-close').onclick = () => window.AiPhone?.app?.close();

    let cur = '0', prev = '', op = '';

    document.querySelectorAll('.key').forEach(btn => {
      btn.onclick = () => {
        const v = btn.dataset.val;
        if (!v) return;

        if (v === 'C') {
          cur = '0'; prev = ''; op = '';
        } else if (v === '±') {
          cur = String(-parseFloat(cur) || 0);
        } else if (v === '%') {
          cur = String(parseFloat(cur) / 100 || 0);
        } else if (['+', '-', '×', '÷'].includes(v)) {
          prev = cur; op = v; cur = '0';
        } else if (v === '=') {
          if (op && prev) {
            const a = parseFloat(prev), b = parseFloat(cur);
            let r = 0;
            if (op === '+') r = a + b;
            if (op === '-') r = a - b;
            if (op === '×') r = a * b;
            if (op === '÷') r = b === 0 ? 'Error' : a / b;
            exprEl.textContent = prev + ' ' + op + ' ' + cur;
            cur = String(Math.round(r * 1000000) / 1000000);
            op = ''; prev = '';
            window.AiPhone?.ui?.toast('计算结果: ' + cur);
          }
        } else {
          if (cur === '0' && v !== '.') cur = v;
          else if (v === '.' && cur.includes('.')) return;
          else cur += v;
        }

        valEl.textContent = cur;
        if (op && prev) exprEl.textContent = prev + ' ' + op;
        else if (!exprEl.textContent.includes('=')) exprEl.textContent = '';
      };
    });
  </script>
</body>
</html>`;
