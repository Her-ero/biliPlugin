// ==UserScript==
// @name          B站UP主数据分析
// @version       3.2.3
// @description   辅助分析B站UP主的相关数据
// @author        Her-ero
// @namespace     https://github.com/Her-ero
// @supportURL    https://github.com/Her-ero/biliPlugin
// @homepageURL   https://github.com/Her-ero/biliPlugin/tree/main/userData
// @downloadURL   https://her-ero.github.io/biliPlugin/userData/userDataAnalysis.user.js
// @updateURL     https://her-ero.github.io/biliPlugin/userData/userDataAnalysis.user.js
// @match         *://space.bilibili.com/*/video
// @include       *://space.bilibili.com/*/video
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
.n {
  margin-bottom: 75px;
}
.n .n-statistics {
display: flex;
}
.n .n-inner {
height: auto!important;
padding: 0 0px 0 4px!important;
}
.n .n-data {
width: 52px;
border-left: 1px solid #ccc;
}
.n .n-data:not(:first-child) {

}
.n .n-btn {
  margin-right: 2px;
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
    let refreshCount = 0
    // 视频列表
    let videoList = []
    // 视频数
    let totalVideo = 0
    // 近5视频播放计数
    let videoPlayCount5 = 0
    // 近30视频播放计数
    let videoPlayCount30 = 0
    // // 近5视频评论计数
    // let videoCommentCount5 = 0
    // // 近30视频评论计数
    // let videoCommentCount30 = 0
    // // 近5视频弹幕计数
    // let videoDanmuCount5 = 0
    // // 近30视频弹幕计数
    // let videoDanmuCount30 = 0

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
        min: 0,
        max: 1000,
    })));

    const timer = setInterval(async function() {
        if (refreshCount >= 2) {
            clearInterval(timer)
        }
        refreshCount += 1;
        console.log(`这是第${refreshCount}次刷数据`);

        // UP名字
        const idName = document.querySelector('#h-name').innerText;
        // n-statistics
        // n-data n-gz// 关注
        const dataPanel = document.querySelector('.n-statistics');
        // 粉丝
        const followers = dataPanel.children[1].title.replace(/[^\d]/g, '');
        // 点赞
        const likes = dataPanel.children[2].title.replace(/[^\d]/g, '');
        // 总播放
        const views = dataPanel.children[3].title.replace(/[^\d]/g, '');

        // 总视频数 从标签处获得
        totalVideo = document.querySelector('.contribution-list').children[0].children[1].innerText || 0;

        // "/39668304/video"
        const pathname = window.location.pathname;
        const uid = pathname.split('/')[1]

        // 拿关注和粉丝数
        // const upDataRes = await getData2(uid)
        // console.log('UP data: ', upDataRes.data)

        // 视频容器节点
        const videoUl = document.querySelector('ul.cube-list');
        // const videoli1 = videoUl.children[0].querySelector('span.play')
        // videoli1.children[1].innerText
        const videoUlArr = Array.from(videoUl.children);

        // 循环读取
        videoUlArr.forEach((item, index) => {
            const currVideoViewText = item.querySelector('span.play').children[1].innerText;
            if (index < 5) {
                // console.log(currVideoViewText)
                videoPlayCount5 += convertStr(currVideoViewText)
            }
            if (index < 30) {
                // console.log(convertStr(currVideoViewText))
                videoPlayCount30 += convertStr(currVideoViewText)
            }
        })

        // 近5条视频平均播放量
        const avgPlayVideo5 = formatNum(videoPlayCount5 / (videoUlArr.length < 5 ? videoUlArr.length : 5));
        // 首页近30视频平均播放量
        const avgPlayVideo30 = formatNum(videoPlayCount30 / videoUlArr.length);
        // 平均播放数量
        const videoAvgViews = formatNum(Number(views) / Number(totalVideo));
        // 平均赞数量
        const videoAvgLikes = formatNum(Number(likes) / Number(totalVideo));
        // 播放/粉丝
        const viewsPerFollowers = formatNum(Number(views) / Number(followers));

        const dataElement = `<div class="n-data">
<p class="n-data-k"><b>均播</b></p><b class="n-data-v ${playColorCalc(videoAvgViews)}">${videoAvgViews}</b>
</div><div class="n-data">
<p class="n-data-k"><b>近30</b></p><b class="n-data-v ${playColorCalc(avgPlayVideo30)}">${avgPlayVideo30}</b>
</div>
<div class="n-data">
<p class="n-data-k"><b>近5播</b></p><b class="n-data-v ${playColorCalc(avgPlayVideo5)}">${avgPlayVideo5}</b>
</div>
<div class="n-data">
<p class="n-data-k"><b>均赞</b></p><b class="n-data-v ${likeColorCalc(videoAvgLikes)}">${videoAvgLikes}</b>
</div>
<div class="n-data" style="border-left: 1px solid #000;">
<p class="n-data-k">播/粉</p><p class="n-data-v">${viewsPerFollowers}</p>
</div>
`
        const newDiv = `<div id="myData" class="n-statistics" style="border-left: 1px solid #000;">${dataElement}</div>`;

        if (refreshCount === 1) {
            dataPanel.insertAdjacentHTML('beforeend', newDiv)
        } else {
            const myDataEl = document.querySelector('#myData');
            myDataEl.innerHTML = dataElement
        }

      // 视频数
      totalVideo = 0;
      // 近5视频播放计数
      videoPlayCount5 = 0;
      // 近30视频播放计数
      videoPlayCount30 = 0;

    }, getRandomInt({ min: 100, max: 2552,}))

    // return

    /*fetch(`https://api.bilibili.com/x/space/wbi/arc/search?mid=${uid}`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        },
        timeout: 5000,
    })
    .then((response) => {
      console.log(`response: `, response)
      return response.json()
    })
    .then(res => {
        // console.log('-------------------------')
        // console.log(res.data)
        // videoList.add(res.data.list.vlist)
        videoList = res.data.list.vlist
        totalVideo = res.data.page.count
        // console.log('videoList: ', videoList)
        videoList.forEach((item, index, arr) => {
            // console.log(item)
            // console.log(item.play)
            if (index <= 4) {
                videoPlayCount5 += item.play
                videoDanmuCount5 += item.video_review
                videoCommentCount5 += item.comment
            }
            videoPlayCount30 += item.play
            videoDanmuCount30 += item.video_review
            videoCommentCount30 += item.comment
        })
    })
    .then(() => {
        // console.log('-----------拿到数据了-----------')
        const timer = setInterval(function () {
            console.log(`--------------------[Start ${refreshCount + 1}]--------------------`)
            if (refreshCount >= 2) {
                clearInterval(timer)
            }
            refreshCount += 1
            if (videoList.length === 0) {
                return
            }

            // console.log('videoPlayCount5: ', videoPlayCount5)
            // console.log('videoPlayCount30: ', videoPlayCount30)

            // 首页近30视频平均播放量
            const avgPlayVideo30 = formatNum(videoPlayCount30 / videoList.length)
            // 首页近30视频平均弹幕量
            const avgDanmuVideo30 = formatNum(videoDanmuCount30 / videoList.length)
            // 首页近30视频平均评论量
            const avgCommentVideo30 = formatNum(videoCommentCount30 / videoList.length)

            // 近5条视频平均播放量
            const avgPlayVideo5 = formatNum(videoPlayCount5 / (videoList.length < 5 ? videoList.length : 5))
            // 近5条视频平均弹幕量
            const avgDanmuVideo5 = formatNum(videoDanmuCount5 / (videoList.length < 5 ? videoList.length : 5))
            // 近5条视频平均评论量
            const avgCommentVideo5 = formatNum(videoCommentCount5 / (videoList.length < 5 ? videoList.length : 5))

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
最近30条视频平均弹幕: ${avgDanmuVideo30}
最近30条视频平均评论: ${avgCommentVideo30}

最近5条视频总播: ${videoPlayCount5}
最近5条视频均播: ${avgPlayVideo5}
最近5条视频平均弹幕: ${avgDanmuVideo5}
最近5条视频平均评论: ${avgCommentVideo5}
`
            console.log(info)

            const dataElement = `<div class="n-data">
<p class="n-data-k"><b>均播</b></p><b class="n-data-v ${playColorCalc(videoAvgViews)}">${videoAvgViews}</b>
</div>
<div class="n-data">
<p class="n-data-k"><b>近30</b></p><b class="n-data-v ${playColorCalc(avgPlayVideo30)}">${avgPlayVideo30}</b>
</div>
<div class="n-data">
<p class="n-data-k"><b>近5播</b></p><b class="n-data-v ${playColorCalc(avgPlayVideo5)}">${avgPlayVideo5}</b>
</div>
<div class="n-data">
<p class="n-data-k"><b>均赞</b></p><b class="n-data-v ${likeColorCalc(videoAvgLikes)}">${videoAvgLikes}</b>
</div>
<div class="n-data" style="border-left: 1px solid #000;">
<p class="n-data-k"><b>近30弹幕</b></p><b class="n-data-v ${danmuColorCalc(avgDanmuVideo30)}">${avgDanmuVideo30}</b>
</div>
<div class="n-data">
<p class="n-data-k"><b>近5弹幕</b></p><b class="n-data-v ${danmuColorCalc(avgDanmuVideo5)}">${avgDanmuVideo5}</b>
</div>
<div class="n-data">
<p class="n-data-k"><b>近30评论</b></p><b class="n-data-v ${CommentColorCalc(avgCommentVideo30)}">${avgCommentVideo30}</b>
</div>
<div class="n-data">
<p class="n-data-k"><b>近5评论</b></p><b class="n-data-v ${CommentColorCalc(avgCommentVideo5)}">${avgCommentVideo5}</b>
</div>
<div class="n-data" style="border-left: 1px solid #000;">
<p class="n-data-k">播/粉</p><p class="n-data-v">${viewsPerFollowers}</p>
</div>
`
            const newDiv = `<div id="myData" class="n-statistics" style="border-left: 1px solid #000;">${dataElement}</div>
`;
            if (refreshCount === 1) {
                dataPanel.insertAdjacentHTML('beforeend', newDiv)
            } else {
                const myDataEl = document.querySelector('#myData')
                myDataEl.innerHTML = dataElement
            }
            // 1200
        }, 1200)
    })
    .catch((e) => {
      console.log('Err: ', e)
    })*/
})()