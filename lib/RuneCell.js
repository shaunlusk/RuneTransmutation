var RuneTx = RuneTx || {};

RuneTx.RuneCell = function(depth, colors) {
  this._depth = depth;
  this._depthIndex = 0;
  this._colors = colors;
  this._currentRune = null;
};

RuneTx.RuneCell.prototype.getDepth = function() { return this._depth; };
RuneTx.RuneCell.prototype.getDepthIndex = function() { return this._depthIndex; };

RuneTx.RuneCell.prototype.getColor = function() { return this._colors[this._depthIndex]; };
RuneTx.RuneCell.prototype.getRune = function() { return this._currentRune; };
