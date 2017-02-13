var RuneTx = RuneTx || {};

RuneTx.BoardForeground = function(screenContext, parentLayer, props) {
  props = props || {};
  this._screenContext = screenContext;
  this._parentLayer = parentLayer;
  this._pixRenderer = props.pixRenderer;
  this._boardOffsetX = props.boardOffsetX;
  this._boardOffsetY = props.boardOffsetY;
  this._cellWidth = props.cellWidth;
  this._cellHeight = props.cellHeight;
  this._rows = props.rows || 9;
  this._cols = props.cols || 9;
  this._m = [];
  this._initialize();
};

RuneTx.BoardForeground.prototype._initialize = function() {
  for (var y = 0; y < this._rows; y++) {
    this._m.push([]);
    for (var x = 0; x < this._cols; x++) {
      this._m[y].push(null);
    }
  }
};

RuneTx.BoardForeground.prototype.draw = function() {

};

RuneTx.BoardForeground.prototype.placeRune = function(runeTile, x, y) {
  var props = {
    x: this._boardOffsetX + x * this._cellWidth,
    y: this._boardOffsetY + y * this._cellHeight,
    pixPathArray : RuneTx.runes[runeTile.getRune()],
    pixRenderer : this._pixRenderer,
    defaultPalette : [runeTile.getColor()]
  };
  var element = new C64Style.PixElement(this._screenContext, this._parentLayer, props);
  this._parentLayer.addElement(element);
  this._m[y][x] = element;
};
