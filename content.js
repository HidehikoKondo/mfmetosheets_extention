
const MAX_CLICKS = 7;

// 収支合計表示エリアを作成・管理する
function createOrGetSummaryPanel() {
    let panel = document.getElementById('mt-summary-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'mt-summary-panel';
        panel.style.cssText = [
            'position: fixed',
            'bottom: 16px',
            'left: 16px',
            'z-index: 99999',
            'background: rgba(255,255,255,0.95)',
            'border: 1px solid #ccc',
            'border-radius: 8px',
            'padding: 10px 16px',
            'font-size: 14px',
            'font-family: sans-serif',
            'box-shadow: 0 2px 8px rgba(0,0,0,0.2)',
            'min-width: 160px',
            'line-height: 1.6',
        ].join(';');
        document.body.appendChild(panel);
    }
    return panel;
}

function parseAmount(text) {
    // 例: "+¥12,345" / "-¥6,789" / "¥1,234"
    const cleaned = text.replace(/[¥,\s]/g, '');
    const num = parseFloat(cleaned.replace(/[^0-9.\-+]/g, ''));
    return isNaN(num) ? 0 : num;
}

function calcAndShowSummary() {
    if (location.pathname !== '/app/vault') return;

    const panel = createOrGetSummaryPanel();
    const rows = document.querySelectorAll('div.mt-transaction');

    if (rows.length === 0) {
        panel.innerHTML = '<span style="color:#888">取引なし</span>';
        return;
    }

    let income = 0;
    let expense = 0;

    rows.forEach(row => {
        const amountEl = row.querySelector('.amount.ng-binding');
        if (!amountEl) return;
        const rawText = Array.from(amountEl.childNodes)
            .filter(n => n.nodeType === Node.TEXT_NODE)
            .map(n => n.textContent.trim())
            .filter(t => t)
            .join('');
        const amount = parseAmount(rawText);
        if (amount >= 0) {
            income += amount;
        } else {
            expense += amount;
        }
    });

    const total = income + expense;
    const totalColor = total >= 0 ? '#1a56db' : '#e02424';
    const fmtSigned = n => (n >= 0 ? '+' : '-') + '¥' + Math.abs(Math.round(n)).toLocaleString('ja-JP');

    panel.innerHTML = `
        <div style="font-weight:bold;margin-bottom:4px">収支合計（${rows.length}件）</div>
        <div>収入: <span style="color:#1a56db">${fmtSigned(income)}</span></div>
        <div>支出: <span style="color:#e02424">${fmtSigned(expense)}</span></div>
        <div style="margin-top:4px;font-weight:bold">合計: <span style="color:${totalColor}">${fmtSigned(total)}</span></div>
    `;
}

// 定期的に合計を再計算（もっと見るで要素が増えるため）
let summaryIntervalId = null;

function startSummaryInterval() {
    if (summaryIntervalId !== null) clearInterval(summaryIntervalId);
    calcAndShowSummary();
    summaryIntervalId = setInterval(calcAndShowSummary, 1500);
}

function stopSummaryInterval() {
    if (summaryIntervalId !== null) {
        clearInterval(summaryIntervalId);
        summaryIntervalId = null;
    }
    const panel = document.getElementById('mt-summary-panel');
    if (panel) panel.remove();
}
const MORE_SELECTOR = 'a.ani-e-reveal-03.t-btn.t-btn-toggle.t-btn-small.ng-binding';
const ARROW_SELECTORS = [
    'div.cursor-pointer.arrow-square.prev.icon-left-arrow.pull-left',
    'div.cursor-pointer.arrow-square.next.icon-right-arrow.pull-right',
];

let currentIntervalId = null;

function startClickingMore() {
    if (currentIntervalId !== null) {
        clearInterval(currentIntervalId);
    }

    let clickCount = 0;
    currentIntervalId = setInterval(() => {
        const target = document.querySelector(MORE_SELECTOR);
        if (target) {
            target.click();
            clickCount++;
            console.log(`もっと見るボタンがクリックされました (${clickCount}/${MAX_CLICKS})`);
            if (clickCount >= MAX_CLICKS) {
                clearInterval(currentIntervalId);
                currentIntervalId = null;
                console.log("最大クリック回数に達しました。処理を停止します。");
            }
        }
    }, 1000);
}

// 矢印ボタンのクリックをトリガーにする
document.addEventListener('click', (e) => {
    const isArrow = ARROW_SELECTORS.some(sel => e.target.matches(sel));
    if (isArrow) {
        console.log("矢印ボタンがクリックされました。もっと見る処理を開始します。");
        startClickingMore();
    }
});

function applyContentStyle() {
    const id = setInterval(() => {
        const el = document.querySelector('div.column.center.content');
        if (el) {
            el.style.maxWidth = '1440px';
            clearInterval(id);
        }
    }, 500);
}

// URLを定期監視して /app/vault への遷移を検知する
let lastPathname = location.pathname;

setInterval(() => {
    const current = location.pathname;
    if (current !== lastPathname) {
        lastPathname = current;
        if (current === '/app/vault') {
            console.log("/app/vault を検知しました。もっと見る処理を開始します。");
            startClickingMore();
            applyContentStyle();
            startSummaryInterval();
        } else {
            stopSummaryInterval();
        }
    }
}, 500);

// 初回ロード時（直接 /app/vault を開いた場合）
if (location.pathname === '/app/vault') {
    console.log("/app/vault を検知しました。もっと見る処理を開始します。");
    startClickingMore();
    applyContentStyle();
    startSummaryInterval();
}

