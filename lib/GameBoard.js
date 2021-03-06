var RuneTx = RuneTx || {};

RuneTx.GameBoard = function(props) {
  props = props || {};
  this._gameEngine = props.gameEngine;
  this._screenContext = props.screenContext;
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
  this._discardsAllowed = props.discardsAllowed || 3;
  this._cellCount = this._rows * this._cols;
  this._background = props.boardBackground;
  this._foreground = props.boardForeground;
  this._m = [];
  this._initialize(props.isRestore);
};

RuneTx.GameBoard.dirOffsets = [{x:0,y:-1}, {x:1,y:0}, {x:0,y:1}, {x:-1,y:0}];

RuneTx.GameBoard.prototype._initialize = function(isRestore) {
  this._initializeMatrix();
  if (!isRestore) {
    if (this._startingRuneX.length) {
      for(var i = 0; i < this._startingRuneX.length; i++) {
        this._placeRune(this._startingRuneTile, this._startingRuneX[i], this._startingRuneY[i]);
      }
    } else {
      this._placeRune(this._startingRuneTile, this._startingRuneX, this._startingRuneY);
    }
  }
};

RuneTx.GameBoard.prototype._initializeMatrix = function() {
  for (var y = 0; y < this._rows; y++) {
    this._m.push([]);
    for (var x = 0; x < this._cols; x++) {
      this._m[y].push(new RuneTx.RuneCell(this._boardColors.length));
    }
  }
};

RuneTx.GameBoard.prototype.placeRune = function(runeTile, x, y) {
  var cell = this._placeRune(runeTile, x, y);
  this._gameEngine.notify(new C64Style.Event(RuneTx.EventType.PLACE_RUNE, {cell:cell}));
};

RuneTx.GameBoard.prototype._placeRune = function(runeTile, x, y) {
  var cell = this.getRuneCellAt(x,y);
  if (runeTile.equals(this._gameEngine.getDestructionRune())) {
    cell.setRuneTile(null);
    this._foreground.removeRune(x, y);
  } else {
    cell.setRuneTile(runeTile);
    cell.incrementDepth();
    this._background.placeRune(runeTile, x, y);
    this._foreground.placeRune(runeTile, x, y);
  }
  return cell;
};

RuneTx.GameBoard.prototype.runeFitsAt = function(runeTile, x, y) {
  if (!this.isInBounds(x, y)) return false;
  var tile = this.getRuneCellAt(x, y).getRuneTile();
  if (tile && runeTile.equals(this._gameEngine.getDestructionRune())) return true;
  if (tile) return false;
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
  if (runeTile.equals(this._startingRuneTile)) return true;
  if (adjacentRune.equals(this._startingRuneTile)) return true;
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
  var completeCount = 0, emptyCount = 0;
  for (var y = 0; y < this._rows; y++) {
    for (var x = 0; x < this._cols; x++) {
      var cell = this.getRuneCellAt(x,y);
      if (cell.getRuneTile()) completeCount++;
      else emptyCount++;
    }
  }
  return completeCount === this._cellCount || emptyCount === this._cellCount;
};


RuneTx.GameBoard.prototype.removeCompleteLines = function() {
  var rowsToRemove = this._getRowsToRemove();
  var colsToRemove = this._getColsToRemove();
  this._removeLines(rowsToRemove);
  this._removeLines(colsToRemove);
};

RuneTx.GameBoard.prototype._getRowsToRemove = function() {
  var row, rows = [];
  for (var y = 0; y < this._rows; y++) {
    row = [];
    for (var x = 0; x < this._cols; x++) {
      var cell = this.getRuneCellAt(x,y);
      if (cell.getRuneTile()) row.push({x:x, y:y});
    }
    if (row.length === this._cols) rows.push(row);
  }
  return rows;
};

RuneTx.GameBoard.prototype._getColsToRemove = function() {
  var col, cols = [];
  for (var x = 0; x < this._cols; x++) {
    col = [];
    for (var y = 0; y < this._rows; y++) {
      var cell = this.getRuneCellAt(x,y);
      if (cell.getRuneTile()) col.push({x:x, y:y});
    }
    if (col.length === this._rows) cols.push(col);
  }
  return cols;
};

RuneTx.GameBoard.prototype._removeLines = function(lineArray) {
  lineArray.forEach(this._removeLine.bind(this));
};

RuneTx.GameBoard.prototype._removeLine = function(line) {
  line.forEach(function(coords) {
    this.getRuneCellAt(coords.x, coords.y).setRuneTile(null);
    this._foreground.removeRune(coords.x, coords.y);
  }.bind(this));
  this._gameEngine.notify(new C64Style.Event(RuneTx.EventType.LINE_CLEAR, {line:line}));
};


RuneTx.GameBoard.prototype.__dumpRuneTiles = function() {
  var tiles = [];
  for (var y = 0; y < this._rows; y++) {
    for (var x = 0; x < this._cols; x++) {
      var cell = this.getRuneCellAt(x,y);
      if (cell.getRuneTile()) tiles.push({x:x, y:y, rune:cell.getRuneTile().getRune()});
    }
  }
  tiles.forEach(function(tile) {
    console.log(tile);
  });
};

RuneTx.GameBoard.prototype.cleanUp = function() {
  this._foreground.removeAllRunes();
};

RuneTx.GameBoard.prototype.restoreGame = function(boardState) {
  this._startingRune = new RuneTx.RuneTile(boardState.startingRune._rune, boardState.startingRune._color);
  var cells = boardState.cells;
  if (cells.length > 0) {
    for (var y = 0; y < this._rows; y++) {
      for (var x = 0; x < this._cols; x++) {
        var cell = RuneTx.RuneCell.restore(cells[y][x]);
        this._m[y][x] = cell;
        this._background.setDepthIndex(x, y, cell.getDepth());
        if (cell.getRuneTile()) this._foreground.restoreRune(cell.getRuneTile(), x, y);
      }
    }
    this._background.draw();
  }
};

RuneTx.GameBoard.prototype.getBoardState = function() {
  return {
    cells:this._m,
    startingRune:this._startingRune
  };
};
