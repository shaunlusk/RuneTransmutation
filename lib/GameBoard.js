var RuneTx = RuneTx || {};

RuneTx.GameBoard = function(screenContext, backgroundLayer, foregroundLayer, props) {
  props = props || {};
  this._screenContext = screenContext;
  this._backgroundLayer = backgroundLayer;
  this._foregroundLayer = foregroundLayer;
  this._boardOffsetX = props.boardOffsetX || 0;
  this._boardOffsetY = props.boardOffsetY || 0;
  this._cellWidth = props.cellWidth;
  this._cellHeight = props.cellHeight;
  this._rows = props.rows || 9;
  this._cols = props.cols || 9;
  this._pixRenderer = props.pixRenderer;
  this._boardColors = props.boardColors || [C64Style.Color.GREY, C64Style.Color.LIGHTBLUE];
  this._startingRune = props.startingRune || "ingwaz";
  this._startingRuneTile = new RuneTx.RuneTile(this._startingRune, C64Style.Color.WHITE);
  this._startingRuneX = props.startingRuneX || 0;
  this._startingRuneY = props.startingRuneY || 0;
  this._cellCount = this._rows * this._cols;
  this._background = null;
  this._foreground = null;
  this._m = [];
  this._initialize();
};

RuneTx.GameBoard.dirOffsets = [{x:0,y:-1}, {x:1,y:0}, {x:0,y:1}, {x:-1,y:0}];

RuneTx.GameBoard.prototype._initialize = function() {
  this._initializeMatrix();
  this._createBackground();
  this._createForeground();
  this.placeRune(this._startingRuneTile, this._startingRuneX, this._startingRuneY);
  this._background.draw();
};

RuneTx.GameBoard.prototype._initializeMatrix = function() {
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
  this._foreground = new RuneTx.BoardForeground(this._screenContext, this._foregroundLayer, {
    boardOffsetX : this._boardOffsetX,
    boardOffsetY : this._boardOffsetY,
    rows : this._rows,
    cols : this._cols,
    cellWidth : this._cellWidth,
    cellHeight : this._cellHeight,
    pixRenderer : this._pixRenderer
  });
};

RuneTx.GameBoard.prototype.placeRune = function(runeTile, x, y) {
  var cell = this.getRuneCellAt(x,y);
  cell.setRuneTile(runeTile);
  cell.incrementDepth();
  this._background.placeRune(runeTile, x, y);
  this._background.draw();
  this._foreground.placeRune(runeTile, x, y);
};

RuneTx.GameBoard.prototype.runeFitsAt = function(runeTile, x, y) {
  if (!this.isInBounds(x, y)) return false;
  if (this.getRuneCellAt(x, y).getRuneTile()) return false;
  var emptyCount = 0;
  for (var i = 0; i < RuneTx.GameBoard.dirOffsets.length; i++) {
    var tx = x + RuneTx.GameBoard.dirOffsets[i].x;
    var ty = y + RuneTx.GameBoard.dirOffsets[i].y;
    if (!this.isInBounds(tx, ty)) {
      emptyCount++;
      continue;
    }
    var adjacentRune = this.getRuneCellAt(tx, ty).getRuneTile();
    if (adjacentRune === null) {
      emptyCount++;
      continue;
    }
    if (!this.runeCanBePlacedAdjacent(runeTile, adjacentRune)) return false;
  }
  if (emptyCount === 4) return false;
  return true;
};

RuneTx.GameBoard.prototype.runeCanBePlacedAdjacent = function(runeTile, adjacentRune) {
  if (adjacentRune === this._startingRuneTile) return true;
  if (runeTile.getColor() === adjacentRune.getColor() || runeTile.getRune() === adjacentRune.getRune()) {
    return true;
  }
  return false;
};

RuneTx.GameBoard.prototype.isInBounds = function(x, y) {
  if (x >= 0 && x < this._cols && y >= 0 && y < this._rows) return true;
  return false;
};

RuneTx.GameBoard.prototype.getRuneCellAt = function(x, y) {
  return this._m[y][x];
};

RuneTx.GameBoard.prototype.checkWinCondition = function() {
  var completeCount = 0;
  for (var y = 0; y < this._rows; y++) {
    for (var x = 0; x < this._cols; x++) {
      var cell = this.getRuneCellAt(x,y);
      if (cell.isComplete()) completeCount++;
    }
  }
  return completeCount === this._cellCount;
};

RuneTx.GameBoard.prototype.checkLoseCondition = function() {
  var completeCount = 0;
  for (var y = 0; y < this._rows; y++) {
    for (var x = 0; x < this._cols; x++) {
      var cell = this.getRuneCellAt(x,y);
      if (cell.getRuneTile()) completeCount++;
    }
  }
  return completeCount === this._cellCount;
};
