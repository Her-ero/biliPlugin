// ==UserScript==
// @name          B站视频播放量和互动量
// @version       1.9.3
// @description   辅助查看B站视频的播放量和互动量
// @author        Her-ero
// @namespace     https://github.com/Her-ero
// @supportURL    https://github.com/Her-ero/biliPlugin
// @homepageURL   https://github.com/Her-ero/biliPlugin/tree/main/videoData
// @downloadURL   https://her-ero.github.io/biliPlugin/videoData/videoPlaysAndEngage.user.js
// @updateURL     https://her-ero.github.io/biliPlugin/videoData/videoPlaysAndEngage.user.js
// @match         *://www.bilibili.com/video/*
// @include       *://www.bilibili.com/video/*
// @icon          https://static.hdslb.com/images/favicon.ico
// @grant         none
// @run-at        document-end
// @license       MPL-2.0
// ==/UserScript==
(async function () {

const pathname = window.location.pathname;

'use strict';
let styleNode = document.createElement("style");
styleNode.setAttribute("type", "text/css");
styleNode.innerHTML = `
.video-info-detail-list.video-info-detail-content .item {
margin-right: 3px;
}
.video-info-detail-list.video-info-detail-content .item.dm {
margin-right: 2px;
}
.video-info-detail-list.video-info-detail-content .item .dm-icon {
margin-right: -2px;
transform: scale(0.8);
}
.video-info-detail-list.video-info-detail-content .item .view-icon {
margin-right: -2px;
transform: scale(0.8);
}
.video-info-detail-list.video-info-detail-content .item.pubdate-ip .pubdate-ip-text {
color: #041a97;
font-weight: bold;
}
.video-info-detail-list.video-info-detail-content .item .video-argue-inner.pure-text.neutral .remark-icon {
margin-right: -2px;
transform: scale(0.8);
}
.video-info-detail-list.video-info-detail-content .item .copyright-icon {
margin-right: -2px;
transform: scale(0.8);
}
.video-info-detail-list.video-info-detail-content {
/*height: auto;*/
}
`;
let headNode = document.querySelector('head');
headNode.appendChild(styleNode)

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

    /**
     * 获取用户信息
     * @returns {Object} 用户信息对象
     * @property {number} code - 返回码
     * @property {string} message - 返回消息
     * @property {number} ttl - 有效期
     * @property {Object} data - 数据对象
     * @property {number} data.mid - 用户ID
     * @property {number} data.following - 关注数
     * @property {number} data.whisper - 悄悄话数
     * @property {number} data.black - 黑名单数
     * @property {number} data.follower - 粉丝数
     */
    async function getData2(uid) {
        const response = await fetch(`https://api.bilibili.com/x/relation/stat?vmid=${uid}`)
        return response.json();
    }
    
    async function getVideoData({BV, AV}) {
        if (BV) {
            const response = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${BV}`)
            return response.json();
        }
        const response = await fetch(`https://api.bilibili.com/x/web-interface/view?aid=${AV}`)
        return response.json();
    }



    const url = `${window.location.origin}${window.location.pathname}`
    const upNameElm = document.querySelector('.up-name')
    let upName = ''
    if (upNameElm) {
        upName = upNameElm.childNodes[0].textContent.trim()
    }

    const dataList = document.querySelector('.video-info-detail-list')
    const datetimeEl = document.querySelector('.pubdate-ip-text')
    
    // 检查页面是av还是BV
    // https://www.bilibili.com/video/av113775831220963/
    const match = pathname.match(/av(\d+)/);
    let videoData = null
    // 如果匹配成功，提取数字
    if (match) {
        const avNum = match[1];
        console.log(avNum); // 输出: 113775831220963
        videoData = await getVideoData({AV: avNum})
    } else {
        // https://www.bilibili.com/video/BV19a4y1g7fe
        // const pathname = window.location.pathname;
        // BV: BV19a4y1g7fe
        const BV = pathname.split('/')[2]
        videoData = await getVideoData({BV: BV})
    }
    console.log('view: ', videoData.data)

    let titleStr = document.querySelector('h1').title
    let viewCountNum = videoData.data.stat.view
    let dmCountNum = videoData.data.stat.danmaku
    // let datetimeStr = '' // 时间
    let datetimeStr = datetimeEl.innerText // 时间
    let likeCountNum = videoData.data.stat.like // 点赞
    let coinCountNum = videoData.data.stat.coin // 投币
    let favoriteCountNum = videoData.data.stat.favorite // 收藏
    let shareCountNum = videoData.data.stat.share // 分享
    let commentCountNum = videoData.data.stat.reply // 评论
    let followerCountNum = 0 // 粉丝数

    console.log('----------------------------------------')
    console.log('viewCountNum: ', viewCountNum)
    console.log('dmCountNum: ', dmCountNum)
    console.log('datetimeStr: ', datetimeStr)
    console.log('likeCountNum: ', likeCountNum)
    console.log('coinCountNum: ', coinCountNum)
    console.log('collectCountNum: ', favoriteCountNum)
    console.log('shareCountNum: ', shareCountNum)
    console.log('commentCountNum: ', commentCountNum)

    let EngageCountNum = dmCountNum + likeCountNum + coinCountNum + favoriteCountNum + shareCountNum + commentCountNum
    // console.log('EngageCountNum: ', EngageCountNum)

    /* clipboard start */
    // const ClipboardVal = `${titleStr}	${url}	${datetimeStr}`
    // const ClipboardVal = `${viewCountNum}	${dmCountNum}	${likeCountNum}	${coinCountNum}	${favoriteCountNum}	${shareCountNum}	${commentCountNum}`
    // const ClipboardVal = `${datetimeStr}	${titleStr}	${commentCountNum}	${url}`
    const formData1 = `${upName}	${titleStr}	${url}	${datetimeStr}	${viewCountNum}	${EngageCountNum}`
    // const formData1 = `${upName}	${titleStr}	${url}	${datetimeStr}	${viewCountNum}	${EngageCountNum}	${commentCountNum}	${dmCountNum}	${likeCountNum}	${coinCountNum}	${favoriteCountNum}	${shareCountNum}`
    const formData2 = `${upName}	${titleStr}	${url}	${viewCountNum}	${datetimeStr}	${commentCountNum}`
    /**
     * 舆情报告B站
     */
    const formYuQing = `标题：${titleStr}
VV: ${viewCountNum}，Eng: ${EngageCountNum}
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
    // 弹 评 赞 币 藏 转

    const newElement = `<span id="bofang" title="播放" class="item" style="color: #E11"><b>播:${viewCountNum}</b></span><span id="hudong" title="互动" class="item" style="color: #007FEC"><b>互:${EngageCountNum}</b></span><span id="danmu" title="弹幕" class="item" style="color: #9c27b0"><b>弹:${dmCountNum}</b></span><span id="pinglun" title="评论" class="item" style="color: #9c27b0"><b>评:${commentCountNum}</b></span><span id="zan" title="赞" class="item" style="color: #9c27b0"><b>赞:${likeCountNum}</b></span><span id="bi" title="投币" class="item" style="color: #9c27b0"><b>币:${coinCountNum}</b></span><span id="cang" title="收藏" class="item" style="color: #9c27b0"><b>藏:${favoriteCountNum}</b></span><span id="zhuan" title="转发" class="item" style="color: #9c27b0"><b>转:${shareCountNum}</b></span>`

    const timer1 = setInterval(function () {
        if (refreshCount >= 4) {
            clearInterval(timer1)
        }
        console.log(`--------------------[Start ${refreshCount + 1}]--------------------`)

        if (refreshCount <= 0) {
            dataList.insertAdjacentHTML('afterbegin', newElement)
            // 隐藏弹幕显示
            var dmTarget = document.querySelector('.dm.item')
            dmTarget.style.display = 'none'
        } else {
            const viewEl = document.querySelector('#bofang')
            if (!viewEl) {
                dataList.insertAdjacentHTML('afterbegin', newElement)
            }
        }
        refreshCount += 1
    }, DELAY_TIME_MS)

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
    const button2 = createButton("getInfoBtn2", "填表数据2", '1111', '5.5%', '16px', 'absolute', () => handleButtonClick(formData2));
    const button3 = createButton("getInfoBtn2", "舆情报告", '1111', '10.5%', '16px', 'absolute', () => handleButtonClick(formYuQing));
    const button4 = createButton("getInfoBtn2", "标题链接", '1111', '16%', '16px', 'absolute', () => handleButtonClick(formData3));

    document.body.insertAdjacentElement('afterbegin', button1);
    document.body.insertAdjacentElement('afterbegin', button2);
    document.body.insertAdjacentElement('afterbegin', button3);
    document.body.insertAdjacentElement('afterbegin', button4);
    return
})()