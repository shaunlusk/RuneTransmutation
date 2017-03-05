var RuneTx = RuneTx || {};

RuneTx.RuneTile = function(rune, color) {
  this._rune = rune;
  this._color = color;
};

RuneTx.RuneTile.prototype.getRune = function() { return this._rune; };
RuneTx.RuneTile.prototype.getColor = function() { return this._color; };

RuneTx.RuneTile.prototype.equals = function(other) {
  return (this.getRune() === other.getRune()) && (this.getColor() === other.getColor());
};
