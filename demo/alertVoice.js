// 创建 AudioContext
var audioContext = new (window.AudioContext || window.webkitAudioContext)();

// 创建 OscillatorNode，用于生成音频信号
var oscillator = audioContext.createOscillator();

// 设置音频参数
oscillator.type = 'sine'; // 波形类型
oscillator.frequency.value = 1000; // 频率（Hz）

// 连接到音频输出
oscillator.connect(audioContext.destination);

// 开始播放
oscillator.start();

// 停止播放（可选）
setTimeout(function() {
  oscillator.stop();
}, 1000); // 停止播放在 1 秒后
