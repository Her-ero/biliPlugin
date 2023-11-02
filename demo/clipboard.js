// const ClipboardVal = `${titleStr}	${url}	${datetimeStr}`
// const ClipboardVal = `${likeCountNum}	${coinCountNum}	${collectCountNum}	${shareCountNum}	${commentCountNum}	${dmCountNum}`
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