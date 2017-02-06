var RuneTx = RuneTx || {};

RuneTx.RuneTile = function(rune, color) {
  this._rune = rune;
  this._color = color;
};

RuneTx.RuneTile.prototype.getRune = function() { return this._rune; };
RuneTx.RuneTile.prototype.getColor = function() { return this._color; };
