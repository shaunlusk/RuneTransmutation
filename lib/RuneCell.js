var RuneTx = RuneTx || {};

RuneTx.RuneCell = function(depth) {
  this._maxDepth = depth;
  this._depthIndex = 0;
  this._runeTile = null;
  this._changedLastIncrement = false;
};

RuneTx.RuneCell.restore = function(cell) {
  var runeCell = new RuneTx.RuneCell(cell._maxDepth);
  runeCell._depthIndex = cell._depthIndex;
  runeCell._depthIndex = cell._depthIndex;
  runeCell._changedLastIncrement = cell._changedLastIncrement;
  runeCell._runeTile = cell._runeTile ? new RuneTx.RuneTile(cell._runeTile._rune, cell._runeTile._color) : null;
  return runeCell;
};

RuneTx.RuneCell.prototype.getMaxDepth = function() { return this._maxDepth; };
RuneTx.RuneCell.prototype.getDepth = function() { return this._depthIndex; };
RuneTx.RuneCell.prototype.setDepth = function(depth) { this._depthIndex = depth; };
RuneTx.RuneCell.prototype.incrementDepth = function() {
  var newDepth = (this._depthIndex < this._maxDepth - 1 ? this._depthIndex + 1 : this._depthIndex);
  this._changedLastIncrement = newDepth !== this._depthIndex;
  this._depthIndex = newDepth;
};

RuneTx.RuneCell.prototype.getRuneTile = function() { return this._runeTile; };
RuneTx.RuneCell.prototype.setRuneTile = function(runeTile) { this._runeTile = runeTile; };

RuneTx.RuneCell.prototype.isComplete = function() { return this._depthIndex === this._maxDepth - 1;};
RuneTx.RuneCell.prototype.changedLastIncrement = function() { return this._changedLastIncrement;};
