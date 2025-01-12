// ==UserScript==
// @name          自动复制粘贴信息
// @version       1.0.1
// @description   自动复制粘贴信息
// @author        Her-ero
// @namespace     https://github.com/Her-ero
// @supportURL    https://github.com/Her-ero/biliPlugin



// @match         *://tieba.baidu.com/p/*
// @include       *://tieba.baidu.com/p/*
// @icon          
// @grant         none
// @run-at        document-end
// @license       MPL-2.0
// ==/UserScript==
(async function () {
'use strict';
// let styleNode = document.createElement("style");
// styleNode.setAttribute("type", "text/css");
// styleNode.innerHTML = `
// `;
// let headNode = document.querySelector('head');
// headNode.appendChild(styleNode)

    let refreshCount = 0;
    // 刷新的时间间隔
    const DELAY_TIME_MS = 2400; // 2000-3000

    function voiceNotice(freq) {
        // 创建 AudioContext
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // 创建 OscillatorNode，用于生成音频信号
        const oscillator = audioCtx.createOscillator();
        // 创建一个GainNode,它可以控制音频的总音量
        const gainNode = audioCtx.createGain();

        // 把音量，音调和终节点进行关联
        oscillator.connect(gainNode);
        // audioCtx.destination返回AudioDestinationNode对象，表示当前audio context中所有节点的最终节点，一般表示音频渲染设备
        gainNode.connect(audioCtx.destination);

        // 设置音频参数
        oscillator.type = 'sine'; // 波形类型
        oscillator.frequency.value = freq; // 频率（Hz）

        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        // 0.01秒后音量为1
        gainNode.gain.linearRampToValueAtTime(0.9, audioCtx.currentTime + 0.01);

        // 开始播放
        oscillator.start();
        // 1秒内声音慢慢降低，是个不错的停止声音的方法
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
        // 1秒后完全停止声音
        oscillator.stop(audioCtx.currentTime + 1);
    }

    // 获取页面中第一个<h1>标签内的文本
    const titleStr = document.querySelector('.core_title_txt').title;

    // 获取当前页面的URL，并去除查询字符串参数
    const url = window.location.href.split('?')[0];
   
    // https://www.bilibili.com/video/BV19a4y1g7fe
    // const pathname = window.location.pathname;
    // BV: BV19a4y1g7fe
    // const BV = pathname.split('/')[2]


    // let titleStr = document.querySelector('h1').title
    // let viewCountNum = videoData.data.stat.view
    // let dmCountNum = videoData.data.stat.danmaku
    // // let datetimeStr = '' // 时间
    // let datetimeStr = datetimeEl.innerText // 时间
    // let likeCountNum = videoData.data.stat.like // 点赞
    // let coinCountNum = videoData.data.stat.coin // 投币
    // let favoriteCountNum = videoData.data.stat.favorite // 收藏
    // let shareCountNum = videoData.data.stat.share // 分享
    // let commentCountNum = videoData.data.stat.reply // 评论
    // let followerCountNum = 0 // 粉丝数

    console.log('----------------------------------------')
    console.log('titleStr: ', titleStr)
    console.log('url: ', url)


    /* clipboard start */
    const formData1 = `${titleStr}	${url}`
    // const ClipboardVal = `${viewCountNum}	${dmCountNum}	${likeCountNum}	${coinCountNum}	${favoriteCountNum}	${shareCountNum}	${commentCountNum}`
    // const ClipboardVal = `${datetimeStr}	${titleStr}	${commentCountNum}	${url}`
    // const formData1 = `${upName}	${titleStr}	${url}	${datetimeStr}	${viewCountNum}	${EngageCountNum}`
    // const formData2 = `${upName}	${titleStr}	${url}	${viewCountNum}	${datetimeStr}	${commentCountNum}`
    /**
     * 舆情报告B站
     */
    const formYuQing = `平台: 贴吧
产品：
回复：

${titleStr}
${url}

内容：
`
    /**
     * 标题、链接
     */
    const formData3 = `标题：${titleStr}\n${url}`

    // 申请使用剪切板权限
    navigator.permissions.query({ name: 'clipboard-write' }).then(function (result) {
        // 可能是 'granted', 'denied' or 'prompt':
        if (result.state === 'granted') {
            // 可以使用权限
            // 进行clipboard的操作
            // navigator.clipboard.writeText(ClipboardValAuto).then(
            //     function () {
            //         /* clipboard successfully set */
            //         // 成功设置了剪切板
            //         voiceNotice(196.00)
            //     },
            //     function () {
            //         /* clipboard write failed */
            //         // 剪切板内容写入失败
            //     }
            // );
        } else if (result.state === 'prompt') {
            // 弹窗弹框申请使用权限
        } else {
            // 如果被拒绝，请不要做任何操作。
        }
    });
    /* clipboard end */

    // 添加按钮
    const createButton = (id, text, zIndex, left, fontSize, position, clickHandler) => {
        const button = document.createElement("button");
        Object.assign(button.style, {
            zIndex,
            left,
            position,
            fontSize,
        });
        button.id = id;
        button.textContent = text;
        button.addEventListener("click", clickHandler);
        return button;
    };

    const handleButtonClick = (clipboardValue) => {
        // alert(clipboardValue);
        navigator.permissions.query({ name: 'clipboard-write' }).then(result => {
            if (result.state === 'granted') {
                navigator.clipboard.writeText(clipboardValue).then(
                    () => voiceNotice(349.23),
                    () => console.error("Clipboard write failed")
                );
            }
        });
    };

    const button1 = createButton("getInfoBtn1", "填表数据1", '1111', '0', '16px', 'absolute', () => handleButtonClick(formData1));
    // const button2 = createButton("getInfoBtn2", "填表数据2", '1111', '5.5%', '16px', 'absolute', () => handleButtonClick(formData2));
    // const button3 = createButton("getInfoBtn2", "舆情报告", '1111', '10.5%', '16px', 'absolute', () => handleButtonClick(formYuQing));
    // const button4 = createButton("getInfoBtn2", "标题链接", '1111', '16%', '16px', 'absolute', () => handleButtonClick(formData3));

    document.body.insertAdjacentElement('afterbegin', button1);
    // document.body.insertAdjacentElement('afterbegin', button2);
    // document.body.insertAdjacentElement('afterbegin', button3);
    // document.body.insertAdjacentElement('afterbegin', button4);
})()