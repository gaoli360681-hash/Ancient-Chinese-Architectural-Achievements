// .....借用已有函数.....

// 鼠标位置在canvas坐标系下的坐标值
function windowToCanvas(canvas, x, y) {
    var mystyle = window.getComputedStyle(canvas);
    var bbox = canvas.getBoundingClientRect();
    // 平移到canvas(含padding, border)
    x -= bbox.left;
    y -= bbox.top;
    //再平移到canvas(不含padding, border):两种写法均可
    //    x -= parseFloat(mystyle['border-left-width']);
    //    y -= parseFloat(mystyle['border-top-width']);
    //    x -= parseFloat(mystyle['padding-left']);
    //    y -= parseFloat(mystyle['padding-top']);
    //    写法2
    x -= parseFloat(mystyle.borderLeftWidth);
    y -= parseFloat(mystyle.borderTopWidth);
    x -= parseFloat(mystyle.paddingLeft);
    y -= parseFloat(mystyle.paddingTop);
    // 当canvas元素和drawing surface尺寸不一致，缩放drawing surface
    x *= (parseFloat(mystyle['width']) / canvas.width);
    y *= (parseFloat(mystyle['height']) / canvas.height);
    return {
        x: x,
        y: y
    };
}

// 清屏
function clear(canvas) {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

// 保存和恢复绘图表面
function saveDrawingSurface() {
    drawingSurfaceImageData = context.getImageData(0, 0,
        canvas.width,
        canvas.height);
}

function restoreDrawingSurface() {
    context.putImageData(drawingSurfaceImageData, 0, 0);
}

// 检查对象是否为空，返回true/false
function checkNullObj(obj) {
    return Object.keys(obj).length === 0
}

// 暗化50%
function drawDarkMask() {
  context.save();
  context.fillStyle = "rgba(0,0,0,0.5)"; // 暗化 50%
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.restore();
}

// 恢复100%
function resumeGame() {
  restoreDrawingSurface();
}

// 按钮样式和文字
function buttonStyle(text, x1, y1, x2, y2, button){
  const isHovering = button.hover;
    
  // 如果悬停，放大110%
  if (isHovering) {
    const width = x2 - x1;
    const height = y2 - y1;
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    
    x1 = centerX - width * 0.55;  // 110% / 2
    x2 = centerX + width * 0.55;
    y1 = centerY - height * 0.55;
    y2 = centerY + height * 0.55;
  }

  button.updateStartPoint({x: x1, y: y1});
  button.updateEndPoint({x: x2, y: y2});
  // context.save();
  // context.fillStyle='rgba(0, 0, 0, 1)';
  // context.fillRect(x1, y1, x2-x1, y2-y1);
  // context.restore();
  
  document.fonts.load("48px 'HanChengBoBoXingJian'").then(() => {
    context.save();
    
    context.font="48px 'HanChengBoBoXingJian', sans-serif";
    context.textAlign='center';
    context.textBaseline='middle';
    context.fillStyle='rgba(255, 255, 255, 1)';
    context.fillText(text, (x1+x2)/2, (y1+y2)/2);

    context.restore();
  });
}