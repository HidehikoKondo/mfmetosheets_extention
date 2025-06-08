window.onload = function () {
    // ボタンを設置
    createbutton();
};

// ボタンを作成する関数
function createbutton() {
    const button = document.createElement("button");
    button.textContent = "MF to Sheets";
    button.id = "get-data-button";
    button.style.position = "fixed";
    button.style.top = "10px";
    button.style.right = "10px";
    button.style.zIndex = 1000;
    button.style.background = "#34A853"; // 追加
    button.style.color = "#fff";         // 追加
    button.style.border = "1px solid #34A853"; // 追加
    button.style.fontSize = "16px"; // 追加
    button.style.fontWeight = "bold"; // 追加
    button.style.padding = "20px 20px"; // 追加
    button.style.borderRadius = "5px"; // 追加
    button.addEventListener("click", buttonClick);

    // ボタンをbodyに追加
    document.body.appendChild(button);
}

// ボタンをクリック時の処理
function buttonClick() {
    // 送信前に確認ダイアログを表示
    var jsondata = createData();
    var htmldata = jsonToHtmlTable(jsondata);
    sendToSheet(htmldata);
}

// jsonデータをhtmlのtableタグに変換する
function jsonToHtmlTable(data) {
    // ヘッダー行を出力しない
    let html = "<table border='1'>";

    // データ行のみを作成
    data.forEach(item => {
        html += "<tr>";
        Object.values(item).forEach(value => {
            html += `<td>${value}</td>`;
        });
        html += "</tr>";
    });

    html += "</table>";
    return html;
}

//background.jsの関数の呼び出し（メッセージ送信）
function sendToBackgroundFunction() {
    // urlをたたく
    chrome.runtime.sendMessage({
        action: "sendToGAS",
        text: "こんにちは、GAS！"
    }, response => {
        console.log(response.status);
    });
}

// クリップボードにコピーしてシートを開く
function sendToSheet(htmldata) {
    // Blobを作成し、ClipboardItemでクリップボードにHTMLとしてコピー
    const blob = new Blob([htmldata], { type: "text/html" });
    const clipboardItem = new ClipboardItem({ "text/html": blob });

    navigator.clipboard.write([clipboardItem]).then(() => {
        alert("HTMLテーブルがクリップボードにコピーされました。");
        // スプレッドシートを開くか確認
        if (confirm("スプレッドシートを開きますか？")) {
            window.open("https://docs.google.com/spreadsheets/d/1N8T54Jk55rgr363fwwkwt5WVdEALPKNuSRWEzdPYex4/edit?gid=381636472#gid=381636472", "_blank");
        }
    }).catch(err => {
        console.error("クリップボードへのコピーに失敗しました:", err);
    });
}

// テーブルから受け取ったデータをjsonデータにする
function createData() {
    // getdatraを実行
    const data = getTableData();

    // JSONに変換
    //    const jsonData = JSON.stringify(data, null, 2);

    // 対象のデータをピックアップ
    const filteredData = filterData(data);


    return filteredData
}




// テーブルからデータを取得する関数
function getTableData() {
    const table = document.getElementById("cf-detail-table");
    const rows = table.querySelectorAll("tr");
    const data = [];

    // 1行目をヘッダーとして取得
    const headerCells = rows[0].querySelectorAll("th, td");
    const headers = ["subject", "date", "content", "amount", "bank", "category1", "category2", "memo", "transfer", "delete"];

    // 2行目以降をデータとして格納
    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].querySelectorAll("td, th");
        if (cells.length === 0) continue;
        const rowData = {};
        cells.forEach((cell, idx) => {
            let value = cell.textContent.trim();
            // date列の場合、曜日（例：(土)）を削除
            if (headers[idx] === "date") {
                value = value.replace(/\([日月火水木金土]\)/, "");
            }
            rowData[headers[idx]] = value;
        });
        data.push(rowData);
    }

    return data;
}


// 対象のデータをピックアップ
function filterData(data) {
    //bankが「オリコカード」「PayPay銀行」のデータをピックアップ（副業用）
    const filteredData = data.filter(item => {
        return item.bank === "オリコカード" || item.bank === "PayPay銀行";
    });
    console.log("Filtered Data:", filteredData);
    return filteredData;
}
