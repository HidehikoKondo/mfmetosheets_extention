
const MAX_CLICKS = 7;
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
        }
    }
}, 500);

// 初回ロード時（直接 /app/vault を開いた場合）
if (location.pathname === '/app/vault') {
    console.log("/app/vault を検知しました。もっと見る処理を開始します。");
    startClickingMore();
    applyContentStyle();
}

