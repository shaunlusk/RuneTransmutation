var RuneTx = RuneTx || {};

RuneTx.ScoreRenderer = function(layer, offsetX, offsetY) {
  this._layer = layer;
  this._offsetX = offsetX;
  this._offsetY = offsetY;
  this._boxWidth = 9;
  this._boxHeight = 3;
  this._scoreOffsetX = offsetX + this._boxWidth;
  this._scoreOffsetY = offsetY + 2;
  this._score = 0;
  this._level = 0;
};

RuneTx.ScoreRenderer.prototype.getScore = function() {return this._score;};

RuneTx.ScoreRenderer.prototype.drawScoreBox = function() {
  this._layer.drawBorder(this._offsetX, this._offsetY, this._boxWidth, this._boxHeight, C64Style.Color.WHITE);
  this._layer.writeText("Score", this._offsetX + 1, this._offsetY + 1, C64Style.Color.WHITE);
  this._drawScore();
};

RuneTx.ScoreRenderer.prototype._drawScore = function() {
  var str = this._score.toString();
  this._layer.writeText(str, this._scoreOffsetX - str.length, this._scoreOffsetY, C64Style.Color.WHITE, C64Style.Color.BLACK);
};

RuneTx.ScoreRenderer.prototype.handlePlaceRune = function(event) {
  var cell = event.data.cell;
  if (cell.changedLastIncrement()) {
    this._score += RuneTx.Config.Score.Placement[cell.getDepth() - 1] * this._level;
    this._drawScore();
  }
};

RuneTx.ScoreRenderer.prototype.handleLineClear = function(event) {
  var cell = event.data.cell;
  this._score += RuneTx.Config.Score.LineClear * this._level;
  this._drawScore();
};

RuneTx.ScoreRenderer.prototype.handleLevelClear = function(event) {
  var cell = event.data.cell;
  this._score += RuneTx.Config.Score.LevelClear * this._level;
  this._drawScore();
};

RuneTx.ScoreRenderer.prototype.handleUpdateLevel = function(event) {
  this._level = event.data.level + 1;
};
