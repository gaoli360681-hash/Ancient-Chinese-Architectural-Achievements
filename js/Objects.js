class Button{
  constructor(text) {
    this.startPoint = {
      x: 0,
      y: 0
    };
    this.endPoint = {
      x: 0,
      y: 0
    };
    this.id = text;
    this.hover = false;
  }

  updateStartPoint(startPoint){
    this.startPoint = {
        x: startPoint.x,
        y: startPoint.y
    };
  }

  updateEndPoint(endPoint){
    this.endPoint = {
        x: endPoint.x,
        y: endPoint.y
    };
  }
  
  containsPoint(x, y) {
    return x > this.startPoint.x && x < this.endPoint.x && 
           y > this.startPoint.y && y < this.endPoint.y;
  }
}

class Piece{
  constructor(image, sizeX, sizeY){
    this.image = image;   // 原图片
    this.pieces = [];           // 拼图块
    this.selectPiece = null;  // 当前选中的拼图块
    this.sizeX = sizeX;         // 拼图的列数
    this.sizeY = sizeY;         // 拼图的行数
    this.pieceW = 0;        // 拼图块的宽
    this.pieceH = 0;       // 拼图块的高
  }

  initPieces(){
    // 图片块的原始尺寸
    this.pieceW = this.image.width / this.sizeX;
    this.pieceH = this.image.height / this.sizeY;
    this.createPieces();
    this.shufflePieces();
  }

  // 创建拼图块
  createPieces(){
    this.pieces = [];

    for (let y = 0; y < this.sizeY; y++) {
      for (let x = 0; x < this.sizeX; x++) {
        this.pieces.push({
          sx: x * this.pieceW, // 在原图片中的x坐标
          sy: y * this.pieceH, // 在原图片中的y坐标
          dx: 200 + x * this.pieceW, // 对canvas的x
          dy: 150 + y * this.pieceH, // 对canvas的y
          currentX: x, // 当前的网格列
          currentY: y, // 当前的网格行
          rightX: x, // 正确的网格列
          rightY: y  // 正确的网格行
        });
      }
    }
  }

  // 打乱拼图块
  shufflePieces(){
    for (let i = this.pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.pieces[i].dx, this.pieces[j].dx] = [this.pieces[j].dx, this.pieces[i].dx];
      [this.pieces[i].dy, this.pieces[j].dy] = [this.pieces[j].dy, this.pieces[i].dy];

      [this.pieces[i].currentX, this.pieces[j].currentX] = [this.pieces[j].currentX, this.pieces[i].currentX];
      [this.pieces[i].currentY, this.pieces[j].currentY] = [this.pieces[j].currentY, this.pieces[i].currentY];
    }
  }

  // 计算网格布局
  wangge(canvas) {
    const aspect = this.image.width / this.image.height;
    let targetW = Math.min(canvas.width * 0.7, this.image.width);
    let targetH = targetW / aspect;

    if (targetH > canvas.height * 0.7) {
      targetH = canvas.height * 0.7;
      targetW = targetH * aspect;
    }

    const startX = (canvas.width - targetW) / 2;    // 居中网格左上角的x
    const startY = (canvas.height - targetH) / 2 + 30;   // 居中网格左上角的y
    const cellW = targetW / this.sizeX;  // 网格的宽
    const cellH = targetH / this.sizeY;  // 网格的高

    return { startX, startY, cellW,  cellH };
  }

  draw(canvas){
    console.log("draw");
    if (!this.image.complete) return;

    const context = canvas.getContext('2d');
    clear(canvas);
    context.save();
    context.fillStyle='rgba(81, 81, 81, 1)';
    context.fillRect(0, 0, W, H);
    context.restore();

    // 提示文字
    document.fonts.load("50px 'HanChengBoBoXingJian'").then(() => {
      context.font="50px 'HanChengBoBoXingJian', sans-serif";
      context.fillStyle = 'rgba(255, 255, 255, 1)';
      context.textAlign = 'center';
      context.fillText('完成拼图', canvas.width / 2, 45);
      context.font="35px 'HanChengBoBoXingJian', sans-serif";
      context.fillStyle = '#ffffffd6';
      const hint = this.selectPiece ? '已选中一块，再点击另一块进行交换' : '提示：点击两块进行交换，复原图片';
      context.fillText(hint, canvas.width / 2, 75);
      context.font="25px 'HanChengBoBoXingJian', sans-serif";
      context.fillStyle = '#ffffffc1';
      context.fillText('选中块会以黄色边框高亮，完成后自动进入下一步', canvas.width / 2, 100);
    });

    // 绘制网格背景
    const layout = this.wangge(canvas);
    for (let r = 0; r < this.sizeY; r++) {
      for (let c = 0; c < this.sizeX; c++) {
        context.strokeStyle = '#ddd';
        context.strokeRect(
          layout.startX + c * layout.cellW,
          layout.startY + r * layout.cellH,
          layout.cellW,
          layout.cellH
        );
      }
    }

    this.pieces.forEach(piece => {
      piece.dx = layout.startX + piece.currentX * layout.cellW;
      piece.dy = layout.startY + piece.currentY * layout.cellH;

      context.drawImage(  // 截取部分并等比放大或缩小进行绘制
        this.image,  // 原图片
        piece.sx, piece.sy, // 在原图片的位置
        this.pieceW, this.pieceH,   // 原本尺寸
        piece.dx, piece.dy,   // 要绘制的位置
        layout.cellW, layout.cellH   // 网格的尺寸，也是要绘制的尺寸
      );

      context.strokeStyle = 'grey';

      context.strokeRect(piece.dx, piece.dy, layout.cellW, layout.cellH);
    });

    // 高点选中的拼图块
    if (this.selectPiece) {
      const dx = layout.startX + this.selectPiece.currentX * layout.cellW;
      const dy = layout.startY + this.selectPiece.currentY * layout.cellH;

      context.strokeStyle = 'yellow';
      context.lineWidth = 4;
      context.strokeRect(dx, dy, layout.cellW, layout.cellH);
      context.lineWidth = 1;
    }
  }

  // 处理点击拼图块事件
  clickHandler(canvas, e){
    console.log('click');
    const loc = windowToCanvas(canvas, e.clientX, e.clientY);
    const x = loc.x;
    const y = loc.y;

    const layout = this.wangge(canvas);

    // 查找被选中的拼图块，find返回第一个为true的元素
    const clickedPiece = this.pieces.find(piece => {
      const dx = layout.startX + piece.currentX * layout.cellW;
      const dy = layout.startY + piece.currentY * layout.cellH;

      return x > dx && x < dx + layout.cellW && y > dy && y < dy + layout.cellH;
    });

    if (clickedPiece) {
      if (!this.selectPiece) {
        // 第一次选中，选中
        this.selectPiece = clickedPiece;
        this.draw(canvas);
      } else {
        // 第二次选中，则交换两个拼图块
        const tempX = this.selectPiece.currentX;
        const tempY = this.selectPiece.currentY;

        this.selectPiece.currentX = clickedPiece.currentX;
        this.selectPiece.currentY = clickedPiece.currentY;

        clickedPiece.currentX = tempX;
        clickedPiece.currentY = tempY;

        this.selectPiece = null;
        this.draw(canvas);

        if (this.checkComplete()) {
          console.log('complete');
          return;
        }
      }
    }
  }

  // 检查是否完成拼图
  checkComplete(){
    console.log('check');
    return this.pieces.every(p => p.currentX === p.rightX && p.currentY === p.rightY);
  }
}