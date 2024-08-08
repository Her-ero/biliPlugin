// ==UserScript==
// @name          自动复制粘贴视频信息
// @version       1.0.1
// @description   自动复制粘贴视频信息
// @author        Her-ero
// @namespace     https://github.com/Her-ero
// @supportURL    https://github.com/Her-ero/biliPlugin



// @match         *://www.bilibili.com/video/*
// @include       *://www.bilibili.com/video/*
// @icon          https://static.hdslb.com/images/favicon.ico
// @grant         none
// @run-at        document-end
// @license       MPL-2.0
// ==/UserScript==
(async function () {
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

    // 拿数字1
    function getNumberStr(val) {
        console.log('getNumberStr: ', val)
        return val.match(/\d+(\.\d+)?/)
        // return val.replace(/[^\d]/g, '')
        // return val.replace(/\d+(\.\d+)?/, '')
        // const res = val.match(/\d+(\.\d+)?/)
        // return res ? res[0] : '0'
    }

    // 拿数字2
    function getNumber2(val) {
        console.log('getNumber2: ', val)
        return Number(val.replace(/[^\d]/g, ''))
        // return val.replace(/\d+(\.\d+)?/, '')
        // return val.match(/\d+(\.\d+)?/))
    }

    // https://www.bilibili.com/video/BV19a4y1g7fe
    const pathname = window.location.pathname;
    // BV: BV19a4y1g7fe
    const BV = pathname.split('/')[2]

    async function getVideoData(BVID) {
        const response = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${BVID}`)
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
    const videoData = await getVideoData(BV)
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
    console.log('EngageCountNum: ', EngageCountNum)

    /* clipboard start */
    // const ClipboardVal = `${titleStr}	${url}	${datetimeStr}`
    // const ClipboardVal = `${viewCountNum}	${dmCountNum}	${likeCountNum}	${coinCountNum}	${favoriteCountNum}	${shareCountNum}	${commentCountNum}`
    // const ClipboardVal = `${datetimeStr}	${titleStr}	${commentCountNum}	${url}`
    const ClipboardVal = `${upName}	${titleStr}	${url}	${datetimeStr}	${viewCountNum}	${EngageCountNum}`
    // 申请使用剪切板权限
    navigator.permissions.query({ name: 'clipboard-write' }).then(function (result) {
        // 可能是 'granted', 'denied' or 'prompt':
        if (result.state === 'granted') {
            // 可以使用权限
            // 进行clipboard的操作
            navigator.clipboard.writeText(ClipboardVal).then(
                function () {
                    /* clipboard successfully set */
                    // 成功设置了剪切板
                    voiceNotice(196.00)
                },
                function () {
                    /* clipboard write failed */
                    // 剪切板内容写入失败
                }
            );
        } else if (result.state === 'prompt') {
            // 弹窗弹框申请使用权限
        } else {
            // 如果被拒绝，请不要做任何操作。
        }
    });
    /* clipboard end */

    const newElement = `<span id="bofang" title="播放" class="item" style="color: #E11"><b>播:${viewCountNum}</b></span><span id="danmu" title="弹幕" class="item" style="color: #9c27b0"><b>弹:${dmCountNum}</b></span><span id="pinglun" title="评论" class="item" style="color: #2bb291"><b>评:${commentCountNum}</b></span><span id="hudong" title="互动" class="item" style="color: #007FEC"><b>互:${EngageCountNum}</b></span>`

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

    const button = document.createElement("button")
    button.id = "getInfoBtn";
    // button.className = "follow-btn-inner";
    button.textContent = "复制数据";
    button.style.zIndex = '1111'
    button.style.position = 'fixed'
    button.style.fontSize = '20px'
    button.addEventListener("click", function () {
        // 在这里编写您的预设代码
        alert(ClipboardVal);
        navigator.permissions.query({ name: 'clipboard-write' }).then(function (result) {
            // 可能是 'granted', 'denied' or 'prompt':
            if (result.state === 'granted') {
                // 可以使用权限
                // 进行clipboard的操作
                navigator.clipboard.writeText(ClipboardVal).then(
                    function () {
                        /* clipboard successfully set */
                        // 成功设置了剪切板
                        voiceNotice(349.23)
                    },
                    function () {
                        /* clipboard write failed */
                        // 剪切板内容写入失败
                    }
                );
            } else if (result.state === 'prompt') {
                // 弹窗弹框申请使用权限
            } else {
                // 如果被拒绝，请不要做任何操作。
            }
        });
    });
    // 替换为要添加按钮的目标元素的ID
    const targetElement = document.querySelector('body');
    targetElement.insertAdjacentElement('afterbegin', button);

})()