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
    button.addEventListener("click", buttonClick);

    // ボタンをbodyに追加
    document.body.appendChild(button);
}

// ボタンをクリック時の処理
function buttonClick() {
    // 送信前に確認ダイアログを表示
    if (confirm("データをスプレッドシートに送信しますか？")) {
        var jsondata = createData();
        sendToSheet(jsondata);
    }
}

// スプレッドシートAPIへ送信する関数
function sendToSheet(jsondata) {
    // ここにGoogle Apps Script等で発行したAPIのURLを記載してください
    const apiUrl = "https://script.google.com/macros/s/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/exec";

    fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: jsondata
    })
        .then(response => response.json())
        .then(result => {
            console.log("送信結果:", result);
            alert("データを送信しました");
        })
        .catch(error => {
            console.error("送信エラー:", error);
            alert("送信に失敗しました");
        });
}

// テーブルから受け取ったデータをjsonデータにする
function createData() {
    // getdatraを実行
    const data = getTableData();
    // JSONに変換
    const jsonData = JSON.stringify(data, null, 2);
    // JSONをコンソールに出力
    console.log(jsonData);

    return jsonData
}


// テーブルからデータを取得する関数
function getTableData() {
    const table = document.getElementById("cf-detail-table");
    const rows = table.querySelectorAll("tr");
    const data = [];

    // 1行目をヘッダーとして取得
    const headerCells = rows[0].querySelectorAll("th, td");
    const headers = ["calc", "date", "content", "amount", "bank", "category1", "exchange", "category", "memo", "delete"];

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


