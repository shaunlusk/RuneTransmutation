var RuneTx = RuneTx || {};

RuneTx.BoardBackground = function(screenContext, parentLayer, props) {
  props = props || {};
  this._screenContext = screenContext;
  this._parentLayer = parentLayer;
  this._rows = props.rows || 9;
  this._cols = props.cols || 9;
  this._graveyardRenderer = props.graveyardRenderer;
  this._boardOffsetX = props.boardOffsetX ? Math.floor(props.boardOffsetX / C64Style.CELLWIDTH) : 0;
  this._boardOffsetY = props.boardOffsetY ? Math.floor(props.boardOffsetY / C64Style.CELLHEIGHT) : 0;
  this._boardColors = props.boardColors;
  this._m = [];
  this._initialize();
};

RuneTx.BoardBackground.prototype._initialize = function() {
  for (var y = 0; y < this._rows; y++) {
    this._m.push([]);
    for (var x = 0; x < this._cols; x++) {
      this._m[y].push(0);
    }
  }
};

RuneTx.BoardBackground.prototype.draw = function() {
  this._drawBoard();
  this._graveyardRenderer.drawGraveyard();
};

RuneTx.BoardBackground.prototype._drawBoard = function() {
  for (var y = 0; y < this._rows; y++) {
    for (var x = 0; x < this._cols; x++) {
      var tx = this._boardOffsetX + x * 2;
      var ty = this._boardOffsetY + y * 2;
      this._parentLayer.drawSymbol("CHECKER_BOARD", tx, ty, this._boardColors[this._m[y][x]]);
      this._parentLayer.drawSymbol("CHECKER_BOARD", tx + 1, ty, this._boardColors[this._m[y][x]]);
      this._parentLayer.drawSymbol("CHECKER_BOARD", tx, ty + 1, this._boardColors[this._m[y][x]]);
      this._parentLayer.drawSymbol("CHECKER_BOARD", tx + 1, ty + 1, this._boardColors[this._m[y][x]]);
    }
  }
};

RuneTx.BoardBackground.prototype.placeRune = function(runeTile, x, y) {
  this._m[y][x]++;
  if (this._m[y][x] === this._boardColors.length) this._m[y][x] = this._boardColors.length - 1;
};
