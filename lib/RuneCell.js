var RuneTx = RuneTx || {};

RuneTx.RuneCell = function(depth) {
  this._maxDepth = depth;
  this._depthIndex = 0;
  this._runeTile = null;
};

RuneTx.RuneCell.prototype.getMaxDepth = function() { return this._maxDepth; };
RuneTx.RuneCell.prototype.getDepth = function() { return this._depthIndex; };
RuneTx.RuneCell.prototype.setDepth = function(depth) { this._depthIndex = depth; };
RuneTx.RuneCell.prototype.incrementDepth = function() { this._depthIndex = this._depthIndex < this._maxDepth ? this._depthIndex++ : this._depthIndex; };

RuneTx.RuneCell.prototype.getRuneTile = function() { return this._runeTile; };
RuneTx.RuneCell.prototype.setRuneTile = function(runeTile) { this._runeTile = runeTile; };

RuneTx.RuneCell.prototype.isComplete = function() { return this._depthIndex === this._maxDepth;};
