
// 例: 拡張機能内で呼び出す
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "sendToGAS") {
        // ここでGASにデータを送信する処理を実装
        console.log("メッセージを受け取りました");
        sendResponse({ status: "送信しました" });
        return true;
    }
});
