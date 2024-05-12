
chrome.runtime.onInstalled.addListener(() => {
    console.log("我被安装啦！")
});


chrome.action.onClicked.addListener(async (tab) => {
    // const res = await chrome.runtime.sendMessage({ type: 'select-dom' });
    // console.log("选择的 dom 信息: ", res)

    // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    //      chrome.tabs.sendMessage(tabs[0].id, { type: 'select-dom' }, function(res){
    //         console.log("选择的 dom 信息: ", res)
    //      });
    // });

    chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
        // 详细文档：https://developer.chrome.com/docs/extensions/reference/api/tabs?hl=zh-cn#method-captureVisibleTab
        chrome.tabs.captureVisibleTab(tab.windowId, { format: "png", quality: 100 }, (image) => {
            // 会返回 base64 图片
            console.log("image:", image) 
        })
    })


})