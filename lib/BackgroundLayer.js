var RuneTx = RuneTx || {};

RuneTx.BackgroundLayer = function(screenContext, canvas, props) {
  props = props || {};
  C64Style.TextLayer.call(this, screenContext, canvas, props);
};

// TODO - fix this in C64Style
RuneTx.BackgroundLayer.prototype = new C64Style.TextLayer({
  getScaleX:function() {return 0;},
  getScaleY:function() {return 0;}
}, null, {characterRenderer:{}, textPrompt:{}});
RuneTx.BackgroundLayer.prototype.constructor = RuneTx.BackgroundLayer;

RuneTx.BackgroundLayer.prototype.drawBorder = function(x, y, width, height, color) {
  var xm = x + width;
  var ym = y + height;
  this.drawSymbol("ROUNDED_CORNER_TOP_LEFT", x, y, color);
  this.drawSymbol("ROUNDED_CORNER_TOP_RIGHT", xm, y, color);
  this.drawSymbol("ROUNDED_CORNER_BOTTOM_LEFT", x, ym, color);
  this.drawSymbol("ROUNDED_CORNER_BOTTOM_RIGHT", xm, ym, color);

  for (var xi = x + 1; xi < xm; xi++) {
    this.drawSymbol("BAR_67", xi, y, color);
    this.drawSymbol("BAR_67", xi, ym, color);
  }
  for (yi = y + 1; yi < ym; yi++) {
    this.drawSymbol("|", x, yi, color);
    this.drawSymbol("|", xm, yi, color);
  }
};
