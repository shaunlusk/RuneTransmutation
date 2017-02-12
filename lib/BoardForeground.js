var RuneTx = RuneTx || {};

RuneTx.BoardForeground = function(screenContext, parentLayer, rows, cols) {
  this._screenContext = screenContext;
  this._parentLayer = parentLayer;
  this._rows = rows;
  this._cols = cols;
  this._m = [];
  this._initialize();
};

RuneTx.BoardForeground.prototype._initialize = function() {
  for (var y = 0; y < this._rows; y++) {
    this._m[y].push([]);
    for (var x = 0; x < this._cols; x++) {
      this._m[y][x].push();
    }
  }
};

RuneTx.BoardForeground.prototype.draw = function() {
  for (var y = 0; y < this._rows; y++) {
    for (var x = 0; x < this._cols; x++) {
      
    }
  }
};

RuneTx.BoardForeground.prototype.placeRune = function(x, y, runeTile) {

};
