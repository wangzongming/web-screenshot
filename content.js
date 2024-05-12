
// 聚焦 dom 的遮罩
var maskDom = createMask();
// 聚焦的dom类名
var focusDomClass;
// 鼠标是否按下状态
var isMousedown = false;
// 是否为选择模式，可以使用鼠标指针选择字段进行编辑,由平台程序改变 
var isSelectModel = false;
// 为防止页面上面有禁止冒泡的元素。所以使用 mouse 实现点击监听
window.globalClickMouseDowned = null;
window.globalClickDownTime = null;


/** 各类鼠标事件监听 **/
document.addEventListener("mousedown", listenerMousedown);
document.addEventListener("mouseup", listenerMouseup);
document.addEventListener("mousemove", listenerMousemove);

function listenerMousedown(event) {
    if (!isSelectModel) return;
    isMousedown = true;
    maskDom.style.display = "none"
    // send({
    //     type: "mouseDown",
    //     event: {
    //         which: event.which,
    //         pageX: event.pageX,
    //         pageY: event.pageY,
    //         clientX: event.clientX,
    //         clientY: event.clientY,
    //         screenX: event.screenX,
    //         screenY: event.screenY,
    //     },
    // });

    if (event.which === 1) {
        window.globalClickMouseDowned = true;
        window.globalClickDownTime = new Date().getTime();
    }
};

function listenerMouseup(event) {
    if (!isSelectModel) return;
    isMousedown = false;
    // send({
    //     type: "_mouseup",
    //     event: {
    //         which: event.which,
    //         pageX: event.pageX,
    //         pageY: event.pageY,
    //         clientX: event.clientX,
    //         clientY: event.clientY,
    //         screenX: event.screenX,
    //         screenY: event.screenY,
    //     },
    // });
    // console.log('event:', event);
    if (window.globalClickMouseDowned && event.which === 1) {
        window.globalClickMouseDowned = false;
        const now = new Date().getTime();
        if (now - window.globalClickDownTime < 300) {

            console.log('点击');

            // const sendData = {
            //     type: "_webviewClickCB",
            //     event: {
            //         pageX: event.pageX,
            //         pageY: event.pageY,
            //         path: event.path.map((item) => {
            //             const datasetObj = item.dataset;
            //             const dataset = {};
            //             for (let key in datasetObj) {
            //                 dataset[key] = datasetObj[key];
            //             }
            //             return {
            //                 className: typeof item.className === "string" ? item.className : "",
            //                 dataset: dataset,
            //             };
            //         }),
            //         target: {
            //             className: typeof event.target.className === "string" ? event.target.className : "",
            //             childNodes: getChildNodes(event.target.childNodes),
            //         },
            //     },
            // };
            // send(sendData);
        }
    }
};

function listenerMousemove(event) {
    if (!isSelectModel) return;
    /**
     * 鼠标移入时的高亮处理  
     */
    if (!isMousedown) {
        // 拿到鼠标移入的元素集合
        const paths = document.elementsFromPoint(event.x, event.y);
        // 这里取第一个就行
        const target = paths[0];
        if (target) {
            // 拿到元素的坐标信息
            const targetDomInfo = target.getBoundingClientRect();
            const h = targetDomInfo.height, w = targetDomInfo.width,
                l = targetDomInfo.left, t = targetDomInfo.top;
            maskDom.style.width = w + "px";
            maskDom.style.height = h + "px";
            maskDom.style.left = l + "px";
            maskDom.style.top = t + "px";
            maskDom.style.display = "block";
        } else {
            maskDom.style.display = "none";
        }

        console.log("target:", target);
    }

    // send({
    //     type: "_mousemove",
    //     event: {
    //         which: event.which,
    //         pageX: event.pageX,
    //         pageY: event.pageY,
    //         clientX: event.clientX,
    //         clientY: event.clientY,
    //         screenX: event.screenX,
    //         screenY: event.screenY,
    //     },
    // });
};

/**
 * 创建一个dom遮罩层
*/
function createMask() {
    const mask = document.createElement("div");
    mask.className = "_qnn-dom-mask_";
    mask.style.background = "rgb(3, 132, 253, 0.22)";
    mask.style.position = "fixed";
    mask.style.display = "none";
    mask.style.pointerEvents = "none";
    document.body.appendChild(mask);
    return mask;
}

/**
 * 监听 service-worker.js 发来的消息
*/
chrome.runtime.onMessage.addListener((req, sender, res) => {
    if (req.type === 'select-dom') {
        // 返回出去 dom 的坐标和尺寸信息 
        res({ x: 0, y: 0, h: 0, w: 0 })
    }
    return true
})


const text = chrome.i18n.getMessage("test", "小明");
console.log('text', text)
// const data = await chrome.storage.sync.get(["wrap_path", "submit_path", "is_open", "code_type", "model", "click_path"]);

