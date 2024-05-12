
chrome.runtime.onInstalled.addListener(() => {
    // console.log("我被安装啦！")
});

// 监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "screenshot") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
            // 对页面截图
            chrome.tabs.captureVisibleTab(tab.windowId, { format: "png", quality: 100 }, (image) => {
                // 会返回 base64 图片 
                sendResponse({ image })
            })
        })
    }
    // 这里要返回 true 不然接收端收不到信息
    return true;
});

// 快捷键监听
chrome.commands.onCommand.addListener((command) => { 
    if (command === 'areaScreenshot') { 
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) { 
			chrome.tabs.sendMessage(tabs[0].id, { type: 'area-screenshot' });
		});
    }
    if (command === 'domScreenshot') {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) { 
			chrome.tabs.sendMessage(tabs[0].id, { type: 'select-dom' });
		});
    }
})