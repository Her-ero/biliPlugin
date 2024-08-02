// ==UserScript==
// @name          B站视频播放量和互动量
// @version       1.7.1
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
    // 刷新的时间间隔
    const DELAY_TIME_MS = 2400; // 2000-3000
    let headNode = document.querySelector('head');
    headNode.appendChild(styleNode)

    let refreshCount = 0;

    // 四舍五入
    function formatNumToStr(x) {
        return Number.parseFloat(x).toFixed(0);
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

    // 字符数字处理
    function getCountNum(str) {
        if (str === '点赞' || str === '投币' || str === '收藏' || str === '分享') {
            return 0
        } else if (str.indexOf('万') !== -1) {
            return Number(getNumberStr(str)[0]) * 10000
        } else {
            return Number(getNumberStr(str)[0])
        }
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

    // https://www.bilibili.com/video/BV19a4y1g7fe
    const pathname = window.location.pathname;
    // BV: BV19a4y1g7fe
    const BV = pathname.split('/')[2]

    async function getVideoData(BVID) {
        const response = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${BVID}`)
        return response.json();
    }

    const dataList = document.querySelector('.video-info-detail-list')
    const videoData = await getVideoData(BV)
    console.log('view: ', videoData.data)


    let titleStr = document.querySelector('h1').title
    let viewCountNum = videoData.data.stat.view
    let dmCountNum = videoData.data.stat.danmaku
    let datetimeStr = '' // 时间
    let likeCountNum = videoData.data.stat.like // 点赞
    let coinCountNum = videoData.data.stat.coin // 投币
    let favoriteCountNum = videoData.data.stat.favorite // 收藏
    let shareCountNum = videoData.data.stat.share // 分享
    let commentCountNum = videoData.data.stat.reply // 评论
    let followerCountNum = 0 // 粉丝数

    console.log('----------------------------------------')
    console.log('viewCountNum: ', viewCountNum)
    console.log('dmCountNum: ', dmCountNum)
    console.log('likeCountNum: ', likeCountNum)
    console.log('coinCountNum: ', coinCountNum)
    console.log('collectCountNum: ', favoriteCountNum)
    console.log('shareCountNum: ', shareCountNum)
    console.log('commentCountNum: ', commentCountNum)

    let EngageCountNum = dmCountNum + likeCountNum + coinCountNum + favoriteCountNum + shareCountNum + commentCountNum

    console.log('EngageCountNum: ', EngageCountNum)

    const newElement = `<span id="bofang" title="播放" class="item" style="color: #E11"><b>播:${viewCountNum}</b></span><span id="danmu" title="弹幕" class="item" style="color: #9c27b0"><b>弹:${dmCountNum}</b></span><span id="pinglun" title="评论" class="item" style="color: #2bb291"><b>评:${commentCountNum}</b></span><span id="hudong" title="互动" class="item" style="color: #007FEC"><b>互:${EngageCountNum}</b></span>`

    const timer1 = setInterval(function () {
        if (refreshCount >= 4) {
            clearInterval(timer1)
        }
        console.log(`--------------------[Start ${refreshCount + 1}]--------------------`)

        if (refreshCount <= 0) {
            dataList.insertAdjacentHTML('afterbegin', newElement)
        } else {
            const viewEl = document.querySelector('#bofang')
            if (!viewEl) {
                dataList.insertAdjacentHTML('afterbegin', newElement)
            }
        }
        refreshCount += 1
    }, DELAY_TIME_MS)
    return
})()