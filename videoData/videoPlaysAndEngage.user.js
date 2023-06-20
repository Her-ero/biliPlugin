// ==UserScript==
// @name          B站视频播放量和互动量
// @version       1.5.2
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
.video-info-v1 .video-data .video-data-list .item {
margin-right: 7px;
}
.pudate-text {
color: #222;
}
`;
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

    const timer = setInterval(function () {
        // setTimeout(function() {

        if (refreshCount >= 4) {
            clearInterval(timer)
        }

        let viewCountNum = 0
        let dmCountNum = 0
        let likeCountNum = 0
        let coinCountNum = 0
        let collectCountNum = 0
        let shareCountNum = 0
        let commentCountNum = 0
        let followerCountNum = 0

        const upNameElm = document.querySelector('.up-name').childNodes[0];
        const upName = upNameElm.textContent.trim();

        const viewElement = document.querySelector('.view.item')
        const dmElement = document.querySelector('.dm.item')
        const likeRaw = document.querySelector('.video-like-info.video-toolbar-item-text').innerText
        const coinRaw = document.querySelector('.video-coin-info.video-toolbar-item-text').innerText
        const collectRaw = document.querySelector('.video-fav-info.video-toolbar-item-text').innerText
        const shareRaw = document.querySelector('.video-share-wrap.video-toolbar-left-item').children[0].innerText

        const dataList = document.querySelector('.video-data-list')
        const commentCountElm = document.querySelector('.total-reply')

        // console.log('viewElement:', viewElement)
        // console.log('dmElement:', dmElement)
        // console.log('likeRaw: ', likeRaw)
        // console.log('coinRaw: ', coinRaw)
        // console.log('collectRaw: ', collectRaw)
        // console.log('shareRaw: ', shareRaw)
        // console.log('commentCountElm: ', commentCountElm)
        console.log(`--------------------[Start ${refreshCount + 1}]--------------------`)

        viewCountNum = getNumber2(viewElement.title)
        dmCountNum = getNumber2(dmElement.title)
        likeCountNum = getCountNum(likeRaw)
        coinCountNum = getCountNum(coinRaw)
        collectCountNum = getCountNum(collectRaw)
        shareCountNum = getCountNum(shareRaw)
        // commentCountNum = Number(commentCountElm.textContent)
        if (commentCountElm && commentCountElm.textContent) {
            commentCountNum = Number(commentCountElm.textContent)
        }

        console.log('----------------------------------------')
        console.log('viewCountNum: ', viewCountNum)
        console.log('dmCountNum: ', dmCountNum)
        console.log('likeCountNum: ', likeCountNum)
        console.log('coinCountNum: ', coinCountNum)
        console.log('collectCountNum: ', collectCountNum)
        console.log('shareCountNum: ', shareCountNum)
        console.log('commentCountNum:', commentCountNum)

        // viewElement.childNodes[1].textContent = viewCountNum
        // dmElement.childNodes[1].textContent = dmCountNum

        const EngageCountNum = dmCountNum + likeCountNum + coinCountNum + collectCountNum + shareCountNum + commentCountNum
        console.log('互动数:', EngageCountNum)

        // <span id="follow" title="粉丝数" class="item" style="color: #ecd200"><b>互动: ${followerCountNum}</b></span>
        if (refreshCount <= 0) {
            const newElement = `<span id="bofang" title="播放" class="item" style="color: #E11"><b>播: ${viewCountNum}</b></span><span id="danmu" title="弹幕" class="item" style="color: #9c27b0"><b>弹幕: ${dmCountNum}</b></span><span id="pinglun" title="评论" class="item" style="color: #2bb291"><b>评: ${commentCountNum}</b></span><span id="hudong" title="互动" class="item" style="color: #007FEC"><b>互动: ${EngageCountNum}</b></span>`
            dataList.insertAdjacentHTML('afterbegin', newElement)
        } else {
            const commentEl = document.querySelector('#pinglun')
            const engElement = document.querySelector('#hudong')
            commentEl.innerHTML = `<b>评: ${commentCountNum}</b>`
            engElement.innerHTML = `<b>互动: ${EngageCountNum}</b>`
        }
        refreshCount += 1
        // const cpright = document.querySelector('.copyright.item');
        // cpright.innerHTML = '';
        // console.log('--------------------[End]--------------------')
    }, 2000)
})()