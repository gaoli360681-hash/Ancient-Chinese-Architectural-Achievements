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