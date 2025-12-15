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
    lanxuetang = new Image();
backgroundImage.src = 'images/封面.jpg';
npc.src = 'images/系统.png';
lanxuetang.src = 'images/兰雪堂.jpg';

// 正方形参数
var squareSize = 300; // 正方形边长
var squareX = W/2-squareSize-180/4, squareY=H/2-squareSize/2; // 正方形位置

// 按钮相关
var mapBtn = new Button('map'),
    setBtn = new Button('set'),
    newStoryBtn = new Button('newStory'),
    oldMemoryBtn = new Button('oldMemory'),
    clearMemoryBtn = new Button('clearMemory');

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

  canvas.addEventListener('click', mapHandler);
  canvas.addEventListener('click', setHandler);
}

// 绘制初始页面的按钮
function drawButton(){
  buttonStyle('新的故事', W / 8 * 5 + 5, 120 * 2 + 5, W / 8 * 7 - 5, 120 * 2 + 60 - 5, newStoryBtn);
  buttonStyle('旧的回忆', W / 8 * 5 + 5, 120 * 2 + 60 + 5, W / 8 * 7 - 5, 120 * 2 + 2 * 60 - 5, oldMemoryBtn);
  buttonStyle('清除回忆', W / 8 * 5 + 5, 120 * 2 + 2 * 60 + 5, W / 8 * 7 - 5, 120 * 2 + 3 * 60 - 5, clearMemoryBtn);

  canvas.addEventListener('click', newStoryHandler);
  canvas.addEventListener('click', oldMemoryHandler);
  canvas.addEventListener('click', clearMemoryHandler);
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

// 针对中文的自动换行函数
function wrapText(context, text, x, y, maxWidth, lineHeight) {
    // 将文本分割为字符数组（支持中文）
    const chars = text.split('');
    let line = '';
    
    for (let i = 0; i < chars.length; i++) {
        const char = chars[i];
        const testLine = line + char;
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        
        // 如果当前行宽度超过最大宽度，则绘制当前行并开始新行
        if (testWidth > maxWidth && line.length > 0) {
            context.fillText(line, x, y);
            line = char;  // 开始新行
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    
    // 绘制最后一行
    if (line.length > 0) {
        context.fillText(line, x, y);
    }
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
    // context.fillText(text, 35, H / 2 + 115);
    wrapText(context, text, 35, H / 2 + 115, 900, 35);

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

  npcConvercation(text);

  // 创建新的点击事件
  clickHandler = function(e) {
    const loc = windowToCanvas(canvas, e.clientX, e.clientY);
    const x = loc.x;
    const y = loc.y;
      
    // 判断是否点击了对话框区域
    if(x > 20 && x < 940 && y > H / 2 + 100 && y < H / 2 + 240) {
      endDialogSequence();
      canvas.removeEventListener('click', clickHandler);
    }
  };
    
  // 绑定点击事件
  canvas.addEventListener('click', clickHandler);
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
      eyeAnimation.isAnimating = true;
      
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
    text = '欢迎来到拙政园。我是您的园境引导者，受时空砚台所托，陪您走完这段园林之旅。集齐五处景点印记，就能解锁专属惊喜。'
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

// 场景过渡【++】可以尝试一下用精灵实现
function transition(text) {
  return new Promise((resolve) => {
    let opacity = 0;
    let phase = 'fadeIn'; // 三个阶段: fadeIn → hold → fadeOut → clear
    let startTime = null;
    
    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const fadeDuration = 1000; // 每个淡入淡出阶段1秒
        const holdDuration = 500; // 保持显示1.5秒
        
        if (phase === 'fadeIn') {
            // 淡入阶段：透明度0 → 1
            opacity = Math.min(elapsed / fadeDuration, 1);
            
            if (opacity >= 1) {
                opacity = 1;
                phase = 'hold';
                startTime = timestamp; // 重置计时器
            }
        } 
        else if (phase === 'hold') {
            // 保持阶段：维持完全可见
            if (elapsed >= holdDuration) {
                phase = 'fadeOut';
                startTime = timestamp; // 重置计时器
            }
        }
        else if (phase === 'fadeOut') {
            // 淡出阶段：透明度1 → 0
            opacity = Math.max(1 - (elapsed / fadeDuration), 0);
            
            if (opacity <= 0) {
                opacity = 0;
                phase = 'clear';
            }
        }
        
        // 绘制当前帧
        context.clearRect(0, 0, W, H);
        
        // 绘制黑色背景
        context.fillStyle = 'rgba(0, 0, 0, 1)';
        context.fillRect(0, 0, W, H);
        
        // 绘制文字（根据当前透明度）
        if (phase !== 'clear') {
            context.save();
            context.font = "70px 'HanChengBoBoXingJian', sans-serif";
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            context.fillText(text, W / 2, H / 2);
            context.restore();
        }
        
        // 淡出完成后清屏
        if (phase === 'clear') {
            resolve(); // Promise完成
            return;
        }
        
        requestAnimationFrame(animate);
    }
    
    // 加载字体并开始动画
    document.fonts.load("70px 'HanChengBoBoXingJian'").then(() => {
        requestAnimationFrame(animate);
    });
  });
}

// 新的记忆界面
function newStory(){
  console.log("newStory");
  clear(canvas);

  canvas.removeEventListener('click', newStoryHandler);
  canvas.removeEventListener('click', oldMemoryHandler);
  canvas.removeEventListener('click', clearMemoryHandler);

  context.drawImage(backgroundImage, 0, 0, W, H);

  text = '每到一处核心景点，您先观一段园景轶事，答一道小问题，答对即可解锁印记。咱们先从入园第一站——兰雪堂走起，那边正有新雪初融的景致呢。';

  npcConvercation(text);

  // 创建新的点击事件
  clickHandler = function(e) {
    const loc = windowToCanvas(canvas, e.clientX, e.clientY);
    const x = loc.x;
    const y = loc.y;
      
    // 判断是否点击了对话框区域
    if(x > 20 && x < 940 && y > H / 2 + 100 && y < H / 2 + 240) {
      canvas.removeEventListener('click', clickHandler);
      transition('场景1：兰雪堂——初品雅韵').then(() => {
        console.log('场景切换完成');
        clear(canvas);
        context.drawImage(lanxuetang, 0, 0, W, H);
        drawSwapButton();
        console.log(text);
        
        text = '这兰雪堂是东部园区的门户，您先看看这段视频，了解它的妙处。';

        npcConvercation(text);
        // 创建新的点击事件
        clickHandler = function(e) {
          const loc = windowToCanvas(canvas, e.clientX, e.clientY);
          const x = loc.x;
          const y = loc.y;
            
          // 判断是否点击了对话框区域
          if(x > 20 && x < 940 && y > H / 2 + 100 && y < H / 2 + 240) {
            console.log('play video');
            // 【++】视频的播放以及游戏的实现
          }
        };
        
        // 绑定点击事件
        canvas.addEventListener('click', clickHandler);

      });
    }
  };
    
  // 绑定点击事件
  canvas.addEventListener('click', clickHandler);

}

// 旧的回忆界面
function oldMemory(){
  console.log("oldMemory");
}

// 清除回忆界面
function clearMemory(){
  console.log('clearMemory');

  // 【++】弹出二次提醒框

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
function conversationHandler(e) { conversitionClick(text, e); }

// 处理页面按钮点击
function buttonClick(button, e){
  // 获取当前坐标
  loc = windowToCanvas(canvas, e.clientX, e.clientY);
  x = loc.x;
  y = loc.y;

  // 判断点击坐标是否在按钮区域
  if (x > button.startPoint.x && x < button.endPoint.x && y > button.startPoint.y && y < button.endPoint.y) {
    // playSound("click");

    switch(button.id){
      case "map":
        console.log('map');
        break;
      case "set":
        console.log('set');
        break;
      case "newStory":
        newStory();
        break;
      case "oldMemory":
        oldMemory();
        break;
      case 'clearMemory':
        clearMemory();
        break;
    }
  }
}

// 定义具名函数
function mapHandler(e) { buttonClick(mapBtn, e); }
function setHandler(e) { buttonClick(setBtn, e); }
function newStoryHandler(e) { buttonClick(newStoryBtn, e); }
function oldMemoryHandler(e) { buttonClick(oldMemoryBtn, e); }
function clearMemoryHandler(e) { buttonClick(clearMemoryBtn, e); }

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

