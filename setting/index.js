window.onload = function () {
	main();
}
async function main() {
	const dom_screenshot = document.getElementById('dom-screenshot');
	const area_screenshot = document.getElementById('area-screenshot');

	// 界面文字设置
	document.getElementById('model-label').innerText = chrome.i18n.getMessage('modelLabel');
	document.getElementById('model-option-file').innerText = chrome.i18n.getMessage('modelOptionFile');
	dom_screenshot.innerHTML = chrome.i18n.getMessage('domScreenshotDesc')+'(Alt+Shift+D)';
	area_screenshot.innerHTML = chrome.i18n.getMessage('areaScreenshotDesc')+'(Alt+Shift+Q)';

	// 存储用户设置和回显设置逻辑
	const model_input = document.getElementById('model');

	// 回显设置过的数据
	const storage_data = await chrome.storage.sync.get(["model"]);
	model_input.value = storage_data.model || "file";

	// 保存设置
	model_input.addEventListener('change', async (event) => {
		const value = event.target.value;
		console.log("value: ", value)
		// 将设置存入本地
		await chrome.storage.sync.set({ model: value });

		// 弹出通知
		chrome.notifications.create(null, {
			type: 'basic',
			iconUrl: '../icons/48.png',
			title: chrome.i18n.getMessage('msgTitle'),
			message: chrome.i18n.getMessage('saveSuccessMsg') + `: ${value}`,

		})
	});

	// dom 截图
	dom_screenshot.addEventListener('click', () => {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			// 通知 content.js 提供选择 dom 的功能
			chrome.tabs.sendMessage(tabs[0].id, { type: 'select-dom' });
		});

		// 关闭面板 
		window.close();
	});

	// 区域截图
	area_screenshot.addEventListener('click', () => {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			// 通知 content.js 区域截图
			chrome.tabs.sendMessage(tabs[0].id, { type: 'area-screenshot' });
		});
		// 关闭面板 
		window.close();
	});
}
