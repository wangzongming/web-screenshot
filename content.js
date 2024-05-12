
// 聚焦 dom 的遮罩
var maskDom = createMask();
// 是否为选择模式，可以使用鼠标指针选择字段进行编辑,由平台程序改变 
var isSelectModel = false;
// 鼠标是否按下状态
var isMousedown = false;
var target = null;
// 为防止页面上面有禁止冒泡的元素。所以使用 mouse 实现点击监听
window.globalClickMouseDowned = null;
window.globalClickDownTime = null;


/** 各类鼠标事件监听 **/
document.addEventListener("mousedown", listenerMousedown);
document.addEventListener("mouseup", listenerMouseup);
document.addEventListener("mousemove", listenerMousemove);


function listenerMousedown(event) {
    if (!isSelectModel) return;
    target.style.pointerEvents = "none";

    isMousedown = true;
    if (event.which === 1) {
        window.globalClickMouseDowned = true;
        window.globalClickDownTime = new Date().getTime();
    }
};

async function listenerMouseup(event) {
    if (!isSelectModel) return;
    isMousedown = false;
    target.style.pointerEvents = "auto";


    // 点击某个 dom
    if (window.globalClickMouseDowned && event.which === 1) {
        window.globalClickMouseDowned = false;
        const now = new Date().getTime();
        if (now - window.globalClickDownTime < 300) {
            
            // 关闭 选择模式
            isSelectModel = false;
            maskDom.style.display = "none";
            
            const infos = {
                x: parseInt(maskDom.style.left),
                y: parseInt(maskDom.style.top),
                w: parseInt(maskDom.style.width),
                h: parseInt(maskDom.style.height)
            };
            // console.log('dom infos: ', infos);
            // 返回整个屏幕截图
            const screen_image = await chrome.runtime.sendMessage({ type: "screenshot" });
            if (!screen_image.image) {
                alert(chrome.i18n.getMessage('errorMsg'))
                return;
            }
            const crop_image = await crop(screen_image.image, infos);
            copy_img_to_clipboard(crop_image);

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
        target = paths[0];
        // console.log("target:", target);
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
    }
};
/**
 * 图片裁剪
 * @param image base64
 * @param opts {x,y,w,h}
 * @return Promise<base64>
*/
function crop(image, opts) {
    return new Promise((resolve, reject) => {
        const x = opts.x, y = opts.y;
        const w = opts.w, h = opts.h;
        const format = opts.format || 'png';
        const canvas = document.createElement('canvas');
        canvas.width = w
        canvas.height = h
        document.body.append(canvas);

        const img = new Image()
        img.onload = () => {
            const context = canvas.getContext('2d')
            context.drawImage(img,
                x, y,
                w, h,
                0, 0,
                w, h
            )
            const cropped = canvas.toDataURL(`image/${format}`)
            canvas.remove();
            resolve(cropped)
        }
        img.src = image
    });

}

/**
 * 将图片复制进用户粘贴板
 * @param image base64
*/
async function copy_img_to_clipboard(image) {
    const storage_data = await chrome.storage.sync.get(["model"]);
    const model = storage_data.model || "file";;
    // 复制都用户粘贴板中
    if (model === 'base64') {
        navigator.clipboard.writeText(image);
    } else if (model === 'file') {
        const [header, base64] = image.split(',')
        const [_, type] = /data:(.*);base64/.exec(header)
        const binary = atob(base64)
        const array = Array.from({ length: binary.length })
            .map((_, index) => binary.charCodeAt(index))
        navigator.clipboard.write([
            new ClipboardItem({
                // 这里只能写入 png
                'image/png': new Blob([new Uint8Array(array)], { type: 'image/png' })
            })
        ])
    }
}

/**
 * 创建一个dom遮罩层
*/
function createMask() {
    const mask = document.createElement("div");
    // 必须让鼠标指针能够穿透 mask 元素
    mask.style.pointerEvents = "none";
    mask.style.background = "rgb(3, 132, 253, 0.22)";
    mask.style.position = "fixed";
    mask.style.zIndex = 9999999999999;
    mask.style.display = "none";
    document.body.appendChild(mask);
    return mask;
}

/**
 * 监听 service-worker、setting/index.js 发来的消息
*/
chrome.runtime.onMessage.addListener(async (req, sender, res) => {
    if (req.type === 'select-dom') {
        // 启动选择dom截图
        isSelectModel = true;
    }
    if (req.type === 'area-screenshot') {
        // 启动选择区域截图
        area_screenshot();
    }
    return true
})

/**
 * 进行区域截图
*/
async function area_screenshot() {
    // 返回整个屏幕截图
    const screen_image = await chrome.runtime.sendMessage({ type: "screenshot" });
    if (!screen_image.image) {
        alert(chrome.i18n.getMessage('errorMsg'))
        return;
    }
    const image_container = document.createElement('div');
    image_container.style.width = "100vw";
    image_container.style.height = "100vh";
    image_container.style.position = "fixed";
    image_container.style.left = "0px";
    image_container.style.top = "0px";
    image_container.style.zIndex = 9999999999999;
    document.body.append(image_container);
    const image_dom = document.createElement('img');
    image_dom.src = screen_image.image;
    image_dom.style.maxWidth = "100%";
    image_container.append(image_dom);

    const infos = {};
    const destroy_ins = new Cropper(image_dom, {
        autoCrop: true,
        autoCropArea: 0.001,
        zoomOnTouch: false,
        zoomOnWheel: false,
        movable: false,
        rotatable: false,
        zoomable: false,
        crop(event) {
            infos.x = event.detail.x, infos.y = event.detail.y,
                infos.w = event.detail.width, infos.h = event.detail.height;
        },
        async cropend() {
            const crop_image = await crop(screen_image.image, infos);
            copy_img_to_clipboard(crop_image);
            // 别忘记注销掉刚刚我们产生的对象
            destroy_ins.destroy();
            image_container.remove();
        },
    });
}
