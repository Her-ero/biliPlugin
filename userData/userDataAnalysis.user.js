// ==UserScript==
// @name          B站UP主数据分析
// @version       3.5.0
// @description   辅助分析B站UP主的相关数据
// @author        Her-ero
// @namespace     https://github.com/Her-ero
// @supportURL    https://github.com/Her-ero/biliPlugin
// @homepageURL   https://github.com/Her-ero/biliPlugin/tree/main/userData
// @downloadURL   https://her-ero.github.io/biliPlugin/userData/userDataAnalysis.user.js
// @updateURL     https://her-ero.github.io/biliPlugin/userData/userDataAnalysis.user.js
// @match         *://space.bilibili.com/*/upload/video
// @include       *://space.bilibili.com/*/upload/video
// @icon          https://static.hdslb.com/images/favicon.ico
// @grant         none
// @run-at        document-end
// @license       MPL-2.0
// ==/UserScript==
(async function () {
'use strict';
console.log(`----Start Tool----`)

let styleNode = document.createElement("style");
styleNode.setAttribute("type", "text/css");
styleNode.innerHTML = `
.nav-statistics__item.jumpable,
.nav-statistics__item {
margin-left:0!important;
}
#myData {
background: #F0F0F0;
color: #000;
}
#myData.ctr {
display: flex;
}
#myData .item {
padding: 1px 3px;
}
#myData .item:not(:first-child) {

}
#myData .item .item-word {
margin-bottom: 5px;
font-size: 13px;
}
#myData .item .item-num {
font-size: 14px;
}
/*橙色*/
.t1 {
color: #e98c00!important;
}
/*紫色*/
.t2 {
color: #8a00fd!important;
}
/*蓝色*/
.t3 {
color: #00aeec!important;
}
/*绿色*/
.t4 {
color: #00b136!important;
}
/*黑色*/
.t5 {
color: #000!important;
}
/*红色*/
.t6 {
color: #F00!important;
}
`;

    let headNode = document.querySelector('head');
    headNode.appendChild(styleNode)

    // 刷新计数
    let refreshCount = 0;
    // 视频列表
    let videoList = [];
    // 视频数
    let totalVideo = 0;
    // 近5视频播放计数
    let videoPlayCount5 = 0;
    // 近30视频播放计数
    let videoPlayCount30 = 0;
    // // 近5视频评论计数
    // let videoCommentCount5 = 0
    // // 近30视频评论计数
    // let videoCommentCount30 = 0
    // // 近5视频弹幕计数
    // let videoDanmuCount5 = 0
    // // 近30视频弹幕计数
    // let videoDanmuCount30 = 0
    // 平均播放数量
    let videoAvgViews = 0;
    // 首页近30视频平均播放量
    let avgPlayVideo30 = 0;
    // 近5条视频平均播放量
    let avgPlayVideo5 = 0;
    // 平均赞数量
    let videoAvgLikes = 0;
    // 播放/粉丝
    let viewsPerFollowers = 0;
    // 均赞/均播（4%激励指标）
    let avgLikesPerAvgViews = 0;

    function getRandomInt({ min = 0, max = 1, }) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function playColorCalc(num) {
        // 橙色
        if (num > 99999) {
            return 't1'
        }
        // 紫色
        if (num > 49999) {
            return 't2'
        }
        // 蓝色
        if (num > 19999) {
            return 't3'
        }
        // 绿色
        if (num > 9999) {
            return 't4'
        }
        // 黑色
        if (num > 4999) {
            return 't5'
        }
        // 红色
        return 't6'
    }

    function likeColorCalc(num) {
        // 橙色
        if (num > 999) {
            return 't1'
        }
        // 紫色
        if (num > 799) {
            return 't2'
        }
        // 蓝色
        if (num > 499) {
            return 't3'
        }
        // 绿色
        if (num > 299) {
            return 't4'
        }
        // 黑色
        if (num > 199) {
            return 't5'
        }
        // 红色
        return 't6'
    }

    function bonusColorCalc(num) {
        // 橙色
        if (num > 0.05) {
            return 't1'
        }
        // 紫色
        if (num > 0.04) {
            return 't2'
        }
        // 蓝色
        if (num > 0.03) {
            return 't3'
        }
        // 绿色
        if (num > 0.02) {
            return 't4'
        }
        // 黑色
        if (num > 0.01) {
            return 't5'
        }
        // 红色
        return 't6'
    }

    function danmuColorCalc(num) {
        // 橙色
        if (num > 499) {
            return 't1'
        }
        // 紫色
        if (num > 149) {
            return 't2'
        }
        // 蓝色
        if (num > 49) {
            return 't3'
        }
        // 绿色
        if (num > 29) {
            return 't4'
        }
        // 黑色
        if (num > 9) {
            return 't5'
        }
        // 红色
        return 't6'
    }

    function CommentColorCalc(num) {
        // 橙色
        if (num > 299) {
            return 't1'
        }
        // 紫色
        if (num > 149) {
            return 't2'
        }
        // 蓝色
        if (num > 49) {
            return 't3'
        }
        // 绿色
        if (num > 29) {
            return 't4'
        }
        // 黑色
        if (num > 9) {
            return 't5'
        }
        // 红色
        return 't6'
    }

    function formatNum(x) {
        return Number.parseFloat(x).toFixed(0);
    }

    /**
     *
     * @param str
     * @returns {number}
     */
    function convertStr(str = '') {
        if (str.includes('万')) {
            return parseFloat(str) * 10000;
        } else {
            return parseFloat(str);
        }
    }

    async function getData1(uid) {
        // Default options are marked with *
        const response = await fetch(`https://api.bilibili.com/x/space/arc/search?mid=${uid}`);
        return response.json();
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
        const response = await fetch(`https://api.bilibili.com/x/relation/stat?vmid=${uid}`);
        return response.json();
    }

    await new Promise(resolve => setTimeout(resolve, getRandomInt({
        min: 800,
        max: 1200,
    })));

    const timer = setInterval(async function() {
        if (refreshCount >= 2) {
            clearInterval(timer)
        }
        refreshCount += 1;
        console.log(`这是第${refreshCount}次刷数据`);

        // UP名字
        const idName = document.querySelector('.nickname').innerText;
        // n-statistics
        // n-data n-gz// 关注
        const dataPanel = document.querySelector('.nav-statistics');
        // 粉丝
        // const followers = dataPanel.children[1].title.replace(/[^\d]/g, '');
        const followers = document.querySelectorAll('.nav-statistics__item.jumpable')[1].children[1].title.replace(/[^\d]/g, '');
        const followerCount = document.querySelectorAll('.nav-statistics__item.jumpable')[1].children[1]
        followerCount.innerText = followers
        // 点赞
        // const likes = dataPanel.children[2].title.slice(12).replace(/[^\d]/g, '');
        // document.querySelector('.nav-statistics').children[0]
        // dataPanel.children[2]
        const likes = dataPanel.children[2].children[1].title.match(/([\d,]+)/g, '')[3].replaceAll(',', '')
        // 总播放
        // const views = document.querySelector('.nav-statistics').children[2].children[1].title.match(/([\d,]+)/g, '')[0].replace(',', '')
        const views = dataPanel.children[3].children[1].title.match(/([\d,]+)/g, '')[0].replaceAll(',', '')

        // 总视频数 从标签处获得
        totalVideo = document.querySelector('.side-nav__item__sub-text').innerText || 0;

        // "/39668304/video"
        const pathname = window.location.pathname;
        const uid = pathname.split('/')[1]

        // 拿关注和粉丝数
        // const upDataRes = await getData2(uid)
        // console.log('UP data: ', upDataRes.data)

        // 视频容器节点
        const videoUl = document.querySelector('.video-list.grid-mode');
        // const videoli1 = videoUl.children[0].querySelector('span.play')
        // videoli1.children[1].innerText
        const videoList = Array.from(videoUl.children);

        // 循环读取
        videoList.forEach((item, index) => {
            const currVideoViewText = item.querySelector('.bili-cover-card__stat').innerText;
            if (index < 5) {
                // console.log(currVideoViewText)
                videoPlayCount5 += convertStr(currVideoViewText)
            }
            if (index < 30) {
                // console.log(convertStr(currVideoViewText))
                videoPlayCount30 += convertStr(currVideoViewText)
            }
        })

        // 平均播放数量
        videoAvgViews = formatNum(Number(views) / Number(totalVideo));
        // 首页近30视频平均播放量
        avgPlayVideo30 = formatNum(videoPlayCount30 / videoList.length);
        // 近5条视频平均播放量
        avgPlayVideo5 = formatNum(videoPlayCount5 / (videoList.length < 5 ? videoList.length : 5));
        // 平均赞数量
        videoAvgLikes = formatNum(Number(likes) / Number(totalVideo));
        // 播放/粉丝
        viewsPerFollowers = formatNum(Number(views) / Number(followers));
        // 均赞/均播（4%激励指标）
        // new Intl.NumberFormat("zh-CN", {style: "percent", minimumFractionDigits: 2}).format(num);
        avgLikesPerAvgViews = new Intl.NumberFormat("zh-CN", {style: "percent", minimumFractionDigits: 2}).format(Number(videoAvgLikes) / Number(videoAvgViews));

        const dataElement = `<div class="item">
<p class="item-word"><span>均播</span></p>
<span class="item-num ${playColorCalc(videoAvgViews)}">${videoAvgViews}</span>
</div>

<div class="item">
<p class="item-word"><span>近30</span></p>
<span class="item-num ${playColorCalc(avgPlayVideo30)}">${avgPlayVideo30}</span>
</div>

<div class="item">
<p class="item-word"><span>近5播</span></p>
<span class="item-num ${playColorCalc(avgPlayVideo5)}">${avgPlayVideo5}</span>
</div>

<div class="item">
<p class="item-word"><span>均赞</span></p>
<span class="item-num ${likeColorCalc(videoAvgLikes)}">${videoAvgLikes}</span>
</div>

<div class="item">
<p class="item-word"><span>赞/播</span></p>
<span class="item-num ${bonusColorCalc(Number(videoAvgLikes) / Number(videoAvgViews))}">${avgLikesPerAvgViews}</span>
</div>
`
        const newDiv = `<div id="myData" class="ctr">${dataElement}</div>`;

        const info = `
        【UP: ${idName}】
        全投稿平均播放: ${videoAvgViews}
        最近30条视频均播: ${avgPlayVideo30}
        最近5条视频均播: ${avgPlayVideo5}
        平均点赞: ${videoAvgLikes}
        
        总播放量/粉丝数: ${viewsPerFollowers}
        
        视频总数: ${totalVideo}
        全投稿平均播放: ${videoAvgViews}
        粉丝数: ${followers}
        总播放量: ${views}
        总点赞数: ${likes}
        平均点赞: ${videoAvgLikes}
        
        首页视频数: ${videoList.length}
        最近30条视频总播: ${videoPlayCount30}
        最近30条视频均播: ${avgPlayVideo30}
        
        最近5条视频总播: ${videoPlayCount5}
        最近5条视频均播: ${avgPlayVideo5}
        `
        console.log(info)

        if (refreshCount === 1) {
            dataPanel.insertAdjacentHTML('beforeend', newDiv)
        } else {
            const myDataEl = document.querySelector('#myData');
            myDataEl.innerHTML = dataElement
        }

        // 近5视频播放计数
        videoPlayCount5 = 0;
        // 近30视频播放计数
        videoPlayCount30 = 0;


    }, getRandomInt({ min: 900, max: 2521,}))

})()

        // const info = `
        // 【UP: ${idName}】
        // 全投稿平均播放: ${videoAvgViews}
        // 最近30条视频均播: ${avgPlayVideo30}
        // 最近5条视频均播: ${avgPlayVideo5}
        // 平均点赞: ${videoAvgLikes}
        
        // 总播放量/粉丝数: ${viewsPerFollowers}
        
        // 视频总数: ${totalVideo}
        // 全投稿平均播放: ${videoAvgViews}
        // 粉丝数: ${followers}
        // 总播放量: ${views}
        // 总点赞数: ${likes}
        // 平均点赞: ${videoAvgLikes}
        
        // 首页视频数: ${videoList.length}
        // 最近30条视频总播: ${videoPlayCount30}
        // 最近30条视频均播: ${avgPlayVideo30}
        // 最近30条视频平均弹幕: ${avgDanmuVideo30}
        // 最近30条视频平均评论: ${avgCommentVideo30}
        
        // 最近5条视频总播: ${videoPlayCount5}
        // 最近5条视频均播: ${avgPlayVideo5}
        // 最近5条视频平均弹幕: ${avgDanmuVideo5}
        // 最近5条视频平均评论: ${avgCommentVideo5}
        // `
        // console.log(info)