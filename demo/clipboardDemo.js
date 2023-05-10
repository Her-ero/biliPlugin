// ==UserScript==
// @name          Demo
// @version       0.0.1
// @description   test
// @author        1
// @namespace     1
// @match         *://www.bilibili.com/video/*
// @include       *://www.bilibili.com/video/*
// @icon          https://static.hdslb.com/images/favicon.ico
// @grant         none
// @run-at        document-end
// @license       MPL-2.0
// ==/UserScript==
(function () {
    'use strict';
    let refreshCount = 0

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

    const timer = setInterval(function () {
        // setTimeout(function() {

        if (refreshCount >= 4) {
            clearInterval(timer)
        }

        let titleStr = document.querySelector('h1').title
        let viewCountNum = 0
        let dmCountNum = 0
        let datetimeStr = ''
        let likeCountNum = 0
        let coinCountNum = 0
        let collectCountNum = 0
        let shareCountNum = 0
        let commentCountNum = 0

        const viewElement = document.querySelector('.view.item')
        const dmElement = document.querySelector('.dm.item')
        const datetimeEl = document.querySelector('.pudate-ip.item').querySelector('.pudate')

        const likeRaw = document.querySelector('.like .info-text').innerText
        const coinRaw = document.querySelector('.coin .info-text').innerText
        const collectRaw = document.querySelector('.collect .info-text').innerText
        const shareRaw = document.querySelector('#share-btn-outer .info-text').innerText

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
        datetimeStr = datetimeEl.title
        likeCountNum = getCountNum(likeRaw)
        coinCountNum = getCountNum(coinRaw)
        collectCountNum = getCountNum(collectRaw)
        shareCountNum = getCountNum(shareRaw)
        if (commentCountElm && commentCountElm.textContent) {
            commentCountNum = Number(commentCountElm.textContent)
        }

        console.log('----------------------------------------')
        console.log('titleStr: ', titleStr)
        console.log('viewCountNum: ', viewCountNum)
        console.log('dmCountNum: ', dmCountNum)
        console.log('datetimeStr: ', datetimeStr)
        console.log('likeCountNum: ', likeCountNum)
        console.log('coinCountNum: ', coinCountNum)
        console.log('collectCountNum: ', collectCountNum)
        console.log('shareCountNum: ', shareCountNum)
        console.log('commentCountNum:', commentCountNum)

        // viewElement.childNodes[1].textContent = viewCountNum
        // dmElement.childNodes[1].textContent = dmCountNum

        const EngageCountNum = dmCountNum + likeCountNum + coinCountNum + collectCountNum + shareCountNum + commentCountNum
        console.log('互动数:', EngageCountNum)
        const url = `${window.location.origin}${window.location.pathname}`

        // const ClipboardVal = `${titleStr}	${url}	${datetimeStr}`
        const ClipboardVal = `${datetimeStr}	${titleStr}	${commentCountNum}	${url}`
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

        if (refreshCount === 0) {
            const newElement = `<span id="bofang" title="播放" class="item" style="color: #E11"><b>播放：${viewCountNum}</b></span><span id="hudong" title="互动" class="item" style="color: #E11"><b>互动：${EngageCountNum}</b></span><span id="pinglun" title="评论" class="item" style="color: #00AEEC"><b>评论：${commentCountNum}</b></span><span id="danmu" title="弹幕" class="item" style="color: #2bb291"><b>弹幕：${dmCountNum}</b></span>`
            dataList.insertAdjacentHTML('afterbegin', newElement)
        } else {
            const engElement = document.querySelector('#hudong')
            const commentEl = document.querySelector('#pinglun')
            engElement.innerHTML = `<b>互动：${EngageCountNum}</b>`
            commentEl.innerHTML = `<b>评论：${commentCountNum}</b>`
        }
        refreshCount += 1

        // console.log('--------------------[End]--------------------')       
    }, 2000)
})()

// navigator.permissions.query({ name: 'clipboard-read' }).then(function (result) {
//     // 可能是 'granted', 'denied' or 'prompt':
//     if (result.state === 'granted') {
//         // 可以使用权限
//         // 进行clipboard的操作
//         navigator.clipboard
//             .readText()
//             .then(text => {
//                 console.log('复制粘贴文本: ', text);
//             })
//             .catch(err => {
//                 // 读取剪切板内容失败
//                 console.error('Failed to read clipboard contents: ', err)
//             });
//     } else if (result.state === 'prompt') {
//         // 弹窗弹框申请使用权限
//     } else {
//         // 如果被拒绝，请不要做任何操作。
//     }
// })