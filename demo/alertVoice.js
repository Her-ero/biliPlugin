/**
 * 利用HTML5 Web Audio API给网页JS交互增加声音
 * https://www.zhangxinxu.com/wordpress/2017/06/html5-web-audio-api-js-ux-voice/?from=timeline
 */


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


// 停止播放（可选）
// setTimeout(function() {
//   oscillator.stop();
// }, 1000); // 停止播放在 1 秒后
