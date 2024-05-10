
main();

var is_open = false;
async function main() {
	const close_INPUT = document.getElementById('close');
	const open_INPUT = document.getElementById('open');
	const wrapPath_INPUT = document.getElementById('wrapPath');
	const clickPath_INPUT = document.getElementById('clickPath');
	const submit_path_INPUT = document.getElementById('submit_path');
	const codeType_INPUT = document.getElementById('codeType');
	const model_INPUT = document.getElementById('model');
	const submit_BUTTON = document.getElementById('submit');
	
	
	const data = await chrome.storage.sync.get(["wrap_path", "is_open", "code_type", "submit_path", "model", "click_path"]);
	wrapPath_INPUT.value = data.wrap_path || "#input";
	submit_path_INPUT.value = data.submit_path || "#submit";
	codeType_INPUT.value = data.code_type || "9004";
	model_INPUT.value = data.model || "default";
	clickPath_INPUT.value = data.click_path || ""; 
	is_open = data.is_open;
	
	if (data.is_open) {
		close_INPUT.checked = false;
		open_INPUT.checked = true;
	} else {
		open_INPUT.checked = false;
		close_INPUT.checked = true;
	} 

	close_INPUT.addEventListener('click', () => {
		open_INPUT.checked = false;
		is_open = false;
	});

	open_INPUT.addEventListener('click', () => {
		close_INPUT.checked = false;
		is_open = true;
	});

	submit_BUTTON.addEventListener('click', async () => {
		const wrapPath = wrapPath_INPUT.value;
		const submit_path = submit_path_INPUT.value;
		const codeType = codeType_INPUT.value;
		const model = model_INPUT.value;
		const click_path = clickPath_INPUT.value;
		// console.log(wrapPath);

		// 将设置存入本地
		await chrome.storage.sync.set({
			wrap_path: wrapPath,
			submit_path: submit_path,
			is_open: is_open, 
			code_type: codeType,
			model: model,
			click_path: click_path
		});

		// 弹出通知
		chrome.notifications.create(null, {
			type: 'basic',
			iconUrl: '../logo.png',
			title: '提示',
			message: '保存成功'
		}, () => {
			// 关闭面板 
			window.close();
		})
	});
}
