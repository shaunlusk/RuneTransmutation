var RuneTx = RuneTx || {};

RuneTx.GameBoard = function(screenContext, backgroundLayer, foregroundLayer, props) {
  props = props || {};
  this._screenContext = screenContext;
  this._backgroundLayer = backgroundLayer;
  this._foregroundLayer = foregroundLayer;
  this._boardOffsetX = props.boardOffsetX || 0;
  this._boardOffsetY = props.boardOffsetY || 0;
  this._rows = props.rows || 9;
  this._cols = props.cols || 9;
  this._pixRenderer = props.pixRenderer;
  this._boardColors = props.boardColors || [C64Style.Color.GREY, C64Style.Color.LIGHTBLUE];
  this._background = null;
  this._m = [];
  this._initialize();
};

RuneTx.GameBoard.dirOffsets = [{x:0,y:-1}, {x:1,y:0}, {x:0,y:1}, {x:-1,y:0}];

RuneTx.GameBoard.prototype._initialize = function() {
  this._initializeMatrix();
  this._createBackground();
  this._createForeground();
  this._background.draw();
};

RuneTx.BoardBackground.prototype._initializeMatrix = function() {
  for (var y = 0; y < this._rows; y++) {
    this._m.push([]);
    for (var x = 0; x < this._cols; x++) {
      this._m[y].push(new RuneTx.RuneCell(this._boardColors.length));
    }
  }
};

RuneTx.GameBoard.prototype._createBackground = function() {
  this._background = new RuneTx.BoardBackground(this._screenContext, this._backgroundLayer, {
    boardOffsetX : this._boardOffsetX,
    boardOffsetY : this._boardOffsetY,
    rows:this._rows,
    cols:this._cols,
    boardColors:this._boardColors
  });
};

RuneTx.GameBoard.prototype._createForeground = function() {

};

RuneTx.GameBoard.prototype.placeRune = function(runeTile, x, y) {

};

RuneTx.GameBoard.prototype.runeFitsAt = function(runeTile, x, y) {
  if (!this.isInBounds(x, y)) return false;
  for (var i = 0; i < RuneTx.GameBoard.dirOffsets.length; i++) {
    var tx = x + RuneTx.GameBoard.dirOffsets[i].x;
    var ty = y + RuneTx.GameBoard.dirOffsets[i].y;
    if (!this.runeCanBePlacedAdjacent(runeTile, tx, ty)) return false;
  }
  return true;
};

RuneTx.GameBoard.prototype.runeCanBePlacedAdjacent = function(runeTile, x, y) {
  if (!this.isInBounds(x, y)) return true;
  var adjacentRune = this.getRuneCellAt(x, y).getRuneTile();
  if (runeTile.getColor() === adjacentRune.getColor() || runeTile.getRune() === adjacentRune.getRune()) {
    return true;
  }
  return false;
};



RuneTx.GameBoard.prototype.isInBounds = function(x, y) {
  if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) return true;
  return false;
};

RuneTx.GameBoard.prototype.getRuneCellAt = function(x, y) {
  return this._m[y][x];
};

RuneTx.GameBoard.prototype.checkWinCondition = function() {

};

RuneTx.GameBoard.prototype.checkLoseCondition = function() {

};
