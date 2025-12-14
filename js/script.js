/*
  Function:XX
  Author  :sxy
  Date    :20240904
  Version :1.0
*/

// ..................变量/常量声明区...................
var canvas = document.getElementById('myCanvas'), //获取canvas元素
    context = canvas.getContext('2d'); //获取2d画图环境

let W = canvas.width,
    H = canvas.height;

// 三次睁眼动画
var eyeAnimation = {
  isAnimating: true,
  totalTime: 4000, // 动画总时长(毫秒)
  startTime: 0,
  currentPhase: 0, // 当前阶段：0-第一次睁眼，1-第一次闭眼，2-第二次睁眼，3-第二次闭眼，4-第三次睁眼
  totalPhases: 5, // 总共5个阶段
  arcHeight: 0, // 当前弧高
  skipHandler: null, // 点击跳过处理器
  clickEventAdded: false
};

// 图片资源
var backgroundImage = new Image(),
    npc = new Image();
backgroundImage.src = 'images/封面.jpg';
npc.src = 'images/系统.png';

// 正方形参数
var squareSize = 300; // 正方形边长
var squareX = W/2-squareSize-180/4, squareY=H/2-squareSize/2; // 正方形位置

// 按钮相关
var mapBtn = new Button('map'),
    setBtn = new Button('set'),
    startBtn = new Button('newStory'),
    oldBtn = new Button('memary'),
    clearBtn = new Button('clear');

// 对话相关
var loc = {
  x: 0,
  y: 0
};
var x, y, nextText, clickHandler = null;
var text = new Array();

// ..................函数定义区.......................

// .....自定义函数区.....
// 绘制黑色弧线区域
function drawBlackArcRegions(arcHeight) {
  var centerY = H / 2;
  
  // 上部分的黑色区域
  context.save();
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(0, centerY);
  
  // 绘制上半部分的弧线
  if (arcHeight > 0) {
    var cp1x = W / 4;
    var cp1y = centerY - arcHeight;
    var cp2x = W * 3 / 4;
    var cp2y = centerY - arcHeight;
    
    context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, W, centerY);
  } else {
    context.lineTo(W, centerY);
  }
  
  context.lineTo(W, 0);
  context.closePath();
  context.fillStyle = '#000';
  context.fill();
  context.restore();
  
  // 下部分的黑色区域（完全对称）
  context.save();
  context.beginPath();
  context.moveTo(0, H);
  context.lineTo(0, centerY);
  
  if (arcHeight > 0) {
    var cp1x = W / 4;
    var cp1y = centerY + arcHeight;
    var cp2x = W * 3 / 4;
    var cp2y = centerY + arcHeight;
    
    context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, W, centerY);
  } else {
    context.lineTo(W, centerY);
  }
  
  context.lineTo(W, H);
  context.closePath();
  context.fillStyle = '#000';
  context.fill();
  context.restore();
}

// 画出带正方形突出的背景
function drawBackgroundWithSquare(){
  context.drawImage(backgroundImage, 0, 0, W, H);
  // 透明度为0.5的蒙版
  drawDarkMask();

  // 清除正方形的蒙版
  context.save();
  context.globalCompositeOperation = 'destination-out';

  context.fillStyle='rgba(255, 255, 255, 1)';
  
  context.fillRect(squareX, squareY, squareSize, squareSize);
  context.restore();
    
  // 在中心正方形位置绘制原始背景图（未暗化）
  context.save();

  // 使用clip裁剪区域
  context.beginPath();
  context.rect(squareX, squareY, squareSize, squareSize);
  context.clip();

  // 在这个裁剪区域内绘制原始背景图
  context.globalAlpha = 1;
  context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  context.restore();
}

// 绘制页面上方的按钮
function drawSwapButton(){
  buttonStyle('设置', W - W / 8 + 5, 5, W - 5, 60 - 5, setBtn);
  buttonStyle('地图', W / 4 * 3 + 5, 5, W - W / 8 - 5, 60 - 5, mapBtn);
}

// 绘制初始页面的按钮
function drawButton(){
  buttonStyle('新的故事', W / 8 * 5 + 5, 120 * 2 + 5, W / 8 * 7 - 5, 120 * 2 + 60 - 5, startBtn);
  buttonStyle('旧的回忆', W / 8 * 5 + 5, 120 * 2 + 60 + 5, W / 8 * 7 - 5, 120 * 2 + 2 * 60 - 5, oldBtn);
  buttonStyle('清除回忆', W / 8 * 5 + 5, 120 * 2 + 2 * 60 + 5, W / 8 * 7 - 5, 120 * 2 + 3 * 60 - 5, clearBtn);
}

// 绘制文字
function drawText(){
  document.fonts.load("70px 'HanChengBoBoXingJian'").then(() => {
    context.save();

    // 创建颜色节点
    const colorStops = [
      { position: 0, color: '#ff6161ff'},
      { position: 0.2, color: '#ffcc8dff'},
      { position: 0.4, color: '#F7DC6F' },
      { position: 0.6, color: '#d8ffa4ff' },
      { position: 0.8, color: '#86e7c7ff' },
      { position: 1, color: '#8abdffff' }
    ];

    context.font = "70px 'HanChengBoBoXingJian', sans-serif";
    const text = "园林小百科";
    const metrics = context.measureText(text);
    const textWidth = metrics.width;

    // 计算文字实际位置和尺寸
    const textX = W / 4 * 3;
    const textY = 120 + 60;
    const fontSize = 70; // 根据字体设置

    // 计算文字边界框
    const bounds = {
        left: textX - textWidth / 2,
        top: textY - fontSize / 2,
        right: textX + textWidth / 2,
        bottom: textY + fontSize / 2,
        width: textWidth,
        height: fontSize
    };

    // 创建对角线渐变（左上到右下）
    const gradient = context.createLinearGradient(
        bounds.left, bounds.top,
        bounds.right, bounds.bottom
    );

    // 添加颜色节点
    colorStops.forEach(stop => {
        gradient.addColorStop(stop.position, stop.color);
    });

    // 应用渐变
    context.fillStyle = gradient;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    context.fillText(text, textX, textY);

    context.restore();
  });
}

// 人物对话框
function npcConvercation(text){
  // 清除对话框区域
  context.clearRect(20, H / 2 + 100, 920, 140);
  // 绘制npc图片
  context.drawImage(npc, W / 20, H / 2, 130, 130);

  // 绘制对话框
  context.fillStyle='rgba(251, 232, 213, 1)';
  context.fillRect(20, H / 2 + 100, 920, 140);
  
  // 绘制文字
  document.fonts.load("30px 'HanChengBoBoXingJian'").then(() => {
    context.save();
    
    context.font="30px 'HanChengBoBoXingJian', sans-serif";
    context.textAlign='left';
    context.textBaseline='top';
    context.fillStyle='rgba(11, 9, 9, 1)';
    context.fillText(text, 35, H / 2 + 115);
    text = [];

    context.restore();
  });
  document.fonts.load("20px 'HanChengBoBoXingJian'").then(() => {
    context.save();
    
    context.font="20px 'HanChengBoBoXingJian', sans-serif";
    context.textAlign='right';
    context.textBaseline='bottom';
    context.fillStyle='rgba(11, 9, 9, 1)';
    context.fillText('>>继续', W-35, H / 2 + 240 - 15);

    context.restore();
  });
}

// 对话框（加点击版）
function npcConvercationWithClick(text){
  npcConvercation(text);

  canvas.addEventListener('click', conversationHandler);
}

// 初始对话及初始页面
function drawInit(){
  clickHandler = null;
  
  function showDialog() {
    // 清除旧的点击事件
    if (clickHandler) {
      canvas.removeEventListener('click', clickHandler);
    }
    
    // 检查是否还有对话要显示
    if (text.length === 0) {
      // 所有对话已显示，清理并显示初始页面
      clickHandler = null;
      endDialogSequence();
      return;
    }
    
    // 显示数组的第一个元素
    const currentText = text[0];
    npcConvercation(currentText);
    
    // 创建新的点击事件
    clickHandler = function(e) {
      const loc = windowToCanvas(canvas, e.clientX, e.clientY);
      const x = loc.x;
      const y = loc.y;
      
      // 判断是否点击了对话框区域
      if(x > 20 && x < 940 && y > H / 2 + 100 && y < H / 2 + 240) {
        // 移除当前显示的元素（数组的第一个）
        text.shift(); // 直接从原数组中移除
        // 显示下一句
        showDialog();
      }
    };
    
    // 绑定点击事件
    canvas.addEventListener('click', clickHandler);
  }
  
  // 开始显示对话（从第一个开始）
  showDialog();
}

// 初始页面 
function endDialogSequence() {
  // 清理事件监听器
  if (clickHandler) {
    canvas.removeEventListener('click', clickHandler);
    clickHandler = null;
  }
    
  // 显示初始页面
  clear(canvas);
  drawBackgroundWithSquare();
  drawSwapButton();
  drawText();
  drawButton();
}

// 绘制睁眼动画
function drawEyeAnimation(progress) {
  // 清空画布
  clear(canvas);
  
  // 绘制背景图
  if (backgroundImage.complete) {
    context.drawImage(backgroundImage, 0, 0, W, H);
  }
  
  // 根据当前阶段计算弧高
  var phaseProgress = progress * eyeAnimation.totalPhases;
  eyeAnimation.currentPhase = Math.floor(phaseProgress);
  var phaseLocalProgress = phaseProgress - eyeAnimation.currentPhase;
  
  var targetArcHeight = 0;
  
  switch (eyeAnimation.currentPhase) {
    case 0: // 第一次睁眼（弧度较小）
      targetArcHeight = 80 * easeOutSine(phaseLocalProgress);
      break;
      
    case 1: // 第一次闭眼
      targetArcHeight = 80 * (1 - easeInSine(phaseLocalProgress));
      break;
      
    case 2: // 第二次睁眼（弧度较大）
      targetArcHeight = 180 * easeOutSine(phaseLocalProgress);
      break;
      
    case 3: // 第二次闭眼
      targetArcHeight = 180 * (1 - easeInSine(phaseLocalProgress));
      break;
      
    case 4: // 第三次睁眼（没有黑色）
      // 弧高从180逐渐增加到非常大，使黑色区域被推出画布
      targetArcHeight = 180 + 500 * easeOutSine(phaseLocalProgress);
      break;
  }
  
  eyeAnimation.arcHeight = targetArcHeight;
  
  // 绘制黑色弧线区域
  drawBlackArcRegions(eyeAnimation.arcHeight);
}

// 动画更新函数
function updateAnimation(timestamp) {
  // timestamp为requestAnimationFrame的回调参数，浏览器自动提供
  if (!eyeAnimation.startTime) {
    eyeAnimation.startTime = timestamp;
  }

  // 只在第一次进入updateAnimation时添加点击事件
  if (!eyeAnimation.clickEventAdded) {
    eyeAnimation.clickEventAdded = true; // 标记已添加
    
    // 添加一次性点击事件
    eyeAnimation.skipHandler = function skipAnimation(e) {
      console.log('点击跳过动画');
      
      // 立即结束动画
      eyeAnimation.isAnimating = false;
      
      // 移除点击事件（一次性事件）
      if (eyeAnimation.skipHandler) {
        canvas.removeEventListener('click', eyeAnimation.skipHandler);
        eyeAnimation.skipHandler = null;
      }
      
      // 立即显示初始页面
      finishAnimation();
    };
    
    // 绑定点击事件
    canvas.addEventListener('click', eyeAnimation.skipHandler);
  }

  var elapsed = timestamp - eyeAnimation.startTime;
  var progress = Math.min(elapsed / eyeAnimation.totalTime, 1);
  
  if (eyeAnimation.isAnimating) {
    if (progress < 0.05) {
      // 刚开始：全黑
      context.fillStyle='rgba(0, 0, 0, 1)';
      context.fillRect(0, 0, W, H);
    } else if (progress < 0.99) {
      // 绘制三次睁眼动画
      drawEyeAnimation(progress);
    }
    
    if (progress >= 1) {
      // 动画自然结束
      finishAnimation();
    } else {
      // 继续动画
      requestAnimationFrame(updateAnimation);
    }
  }
}

// 动画结束的统一处理函数
function finishAnimation() {
  // 清理点击事件（确保被移除）
  if (eyeAnimation.skipHandler) {
    canvas.removeEventListener('click', eyeAnimation.skipHandler);
    eyeAnimation.skipHandler = null;
  }
  
  // 重置动画状态
  eyeAnimation.isAnimating = false;
  eyeAnimation.startTime = 0;
  
  // 动画结束后显示初始页面
  clear(canvas);
  if (backgroundImage.complete) {
    context.drawImage(backgroundImage, 0, 0, W, H);
    text = [
      '你终于醒了，欢迎来到拙政园！',
      '你穿越了，我是你的系统。', 
      '在这里你可以了解关于许多中国古代建筑的特色，放松身心。', 
      '跟着地图走，走到最后一站有惊喜哦！'
    ];
    drawInit();
  }
}

// 缓动函数
function easeOutSine(t) {
  return Math.sin(t * Math.PI / 2);
}

function easeInSine(t) {
  return 1 - Math.cos(t * Math.PI / 2);
}

// .....事件响应函数区.....

// 处理对话点击事件
function conversitionClick(text, e){
  // 获取当前坐标
  loc = windowToCanvas(canvas, e.clientX, e.clientY);
  x = loc.x;
  y = loc.y;

  // 判断当前坐标是否在对话框区域
  if(x > 20 && x < 940 && y > H / 2 + 100 && y < H / 2 + 240){
    console.log('click conversation');
    npcConvercation(text);
    canvas.removeEventListener('click', conversationHandler);
  }
}
function conversationHandler(e) { conversitionClick(nextText, e); }

// // 处理页面按钮点击
// function buttonClick(button, e){
//   // 获取当前坐标
//   loc = windowToCanvas(canvas, e.clientX, e.clientY);
//   x = loc.x;
//   y = loc.y;

//   // 判断点击坐标是否在按钮区域
//   if (x > button.startPoint.x && x < button.endPoint.x && y > button.startPoint.y && y < button.endPoint.y) {
//     playSound("click");

//     switch(button.id){
//       case "begin":
//         beginGame();
//         break;
//       case "continue":
//         continueGame();
//         break;
//       case "clear":
//         clearGame();
//         break;
//       case "zanting":
//         // 只有在游戏进行中才能点击暂停按钮
//         if (currentPage === 'playing') {
//           zantingGame();
//         }
//         break;
//     }
//   }
// }

// // 定义具名函数
// function beginHandler(e) { buttonClick(beginButton, e); }
// function continueHandler(e) { buttonClick(continueButton, e); }
// function clearHandler(e) { buttonClick(clearButton, e); }
// function zantingHandler(e) { buttonClick(zanting, e); }
// function continueHandler2(e) { buttonClick(continueButton2, e); }

// .....初始化函数区.....
function init() {
  resumeGame();
  backgroundImage.onload = function() {
    // 先为全黑
    context.fillStyle='rgba(0, 0, 0, 1)';
    context.fillRect(0, 0, W, H);
    
    // 延迟开始动画
    setTimeout(() => {
      eyeAnimation.startTime = performance.now();
      requestAnimationFrame(updateAnimation);
    }, 500);
  };
}

// ..................页面初始化入口....................
saveDrawingSurface();
init();

