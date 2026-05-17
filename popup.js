function scrapeTransactions() {
    const rows = document.querySelectorAll('div.mt-transaction');
    if (rows.length === 0) return null;

    // 「2026年5月」形式の年月を取得
    const yearMonthText = document.querySelector('[uib-datepicker-popup]')?.innerText?.trim() ?? '';
    const ymMatch = yearMonthText.match(/(\d{4})年(\d{1,2})月/);
    const year  = ymMatch ? ymMatch[1] : '';
    const month = ymMatch ? ymMatch[2].padStart(2, '0') : '';

    const results = [];

    rows.forEach(row => {
        const day      = row.querySelector('.date.ng-binding')?.innerText?.trim() ?? '';
        const date     = year && month && day ? `${year}-${month}-${day.padStart(2, '0')}` : day;
        const desc     = row.querySelector('.description.ng-binding')?.innerText?.trim() ?? '';
        const category = row.querySelector('.category.ng-binding')?.innerText?.trim() ?? '';

        // amount欄は内部にアイコン要素があるためテキストノードだけ取得する
        const amountEl = row.querySelector('.amount.ng-binding');
        const amount = amountEl
            ? Array.from(amountEl.childNodes)
                .filter(n => n.nodeType === Node.TEXT_NODE)
                .map(n => n.textContent.trim())
                .filter(t => t)
                .join('')
            : '';

        results.push([date, desc, category, amount]);
    });

    return results.map(cols => cols.join('\t')).join('\n');
}

document.getElementById('scrapeButton').addEventListener('click', async () => {
    const status = document.getElementById('status');
    status.textContent = '実行中...';

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scrapeTransactions,
    });

    if (!result) {
        status.textContent = '要素が見つかりませんでした。';
        return;
    }

    await navigator.clipboard.writeText(result);
    status.textContent = `コピーしました（${result.split('\n').length - 1}件）`;

    chrome.tabs.create({ url: 'https://docs.google.com/spreadsheets/d/1N8T54Jk55rgr363fwwkwt5WVdEALPKNuSRWEzdPYex4/edit?gid=1238016364#gid=1238016364' });
});
