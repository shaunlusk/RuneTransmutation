var RuneTx = RuneTx || {};

RuneTx.ScoreRenderer = function(engineContext, layer, offsetX, offsetY, highScoreOffsetX, highScoreOffsetY) {
  this._engineContext = engineContext;
  this._layer = layer;
  this._offsetX = offsetX;
  this._offsetY = offsetY;
  this._highScoreOffsetX = highScoreOffsetX;
  this._highScoreOffsetY = highScoreOffsetY;
  this._boxWidth = 11;
  this._boxHeight = 3;
  this._scoreOffsetX = this._boxWidth;
  this._scoreOffsetY = 2;
  this._score = 0;
  this._highScore = 0;
  this._level = 0;
};

RuneTx.ScoreRenderer.prototype.getScore = function() {return this._score;};
RuneTx.ScoreRenderer.prototype.getHighScore = function() {return this._highScore;};
RuneTx.ScoreRenderer.prototype.getLevelForScore = function() {return this._level + 1;};

// For restore purposes only.  Also, changes here do not immediately cause the scores to be redrawn on the screen
RuneTx.ScoreRenderer.prototype.setScore = function(score) {this._score = score;};
RuneTx.ScoreRenderer.prototype.setHighScore = function(highScore) {this._highScore = highScore;};
RuneTx.ScoreRenderer.prototype.setLevel = function(level) {this._level = level;};

RuneTx.ScoreRenderer.prototype.drawScoreBoxes = function() {
  this.drawScoreBox();
  this.drawHighScoreBox();
};

RuneTx.ScoreRenderer.prototype.drawScoreBox = function() {
  this._layer.drawBorder(this._offsetX, this._offsetY, this._boxWidth, this._boxHeight, C64Style.Color.WHITE);
  this._layer.writeText("Score", this._offsetX + 1, this._offsetY + 1, C64Style.Color.WHITE);
  this._drawScore();
};

RuneTx.ScoreRenderer.prototype.drawHighScoreBox = function() {
  this._layer.drawBorder(this._highScoreOffsetX, this._highScoreOffsetY, this._boxWidth, this._boxHeight, C64Style.Color.WHITE);
  this._layer.writeText("High Score", this._highScoreOffsetX + 1, this._highScoreOffsetY + 1, C64Style.Color.WHITE);
  this._drawHighScore();
};

RuneTx.ScoreRenderer.prototype._drawScore = function() {
  var str = this._score.toString();
  this._layer.writeText(str, this._scoreOffsetX + this._offsetX - str.length, this._scoreOffsetY + this._offsetY, C64Style.Color.WHITE, C64Style.Color.BLACK);
};

RuneTx.ScoreRenderer.prototype._drawHighScore = function(event) {
  var str = this._highScore.toString();
  this._layer.writeText(str, this._scoreOffsetX + this._highScoreOffsetX - str.length, this._scoreOffsetY + this._highScoreOffsetY, C64Style.Color.WHITE, C64Style.Color.BLACK);
};

RuneTx.ScoreRenderer.prototype.handlePlaceRune = function(event) {
  var cell = event.data.cell;
  if (cell.changedLastIncrement()) {
    this._addToScore(RuneTx.Config.Score.Placement[cell.getDepth() - 1] * this.getLevelForScore());
  }
};

RuneTx.ScoreRenderer.prototype.handleLineClear = function(event) {
  var cell = event.data.cell;
  this._addToScore(RuneTx.Config.Score.LineClear * this.getLevelForScore());
};

RuneTx.ScoreRenderer.prototype.handleLevelClear = function(event) {
  var cell = event.data.cell;
  this._addToScore(RuneTx.Config.Score.LevelClear * this.getLevelForScore());
};

RuneTx.ScoreRenderer.prototype.handleUpdateLevel = function(event) {
  this._level = event.data.level + 1;
};

RuneTx.ScoreRenderer.prototype._addToScore = function(amount) {
  this._score += amount;
  this._drawScore();
  if (this._score > this._highScore) {
    this._highScore = this._score;
    this._engineContext.notify(new C64Style.Event(RuneTx.EventType.UPDATE_HIGHSCORE, {highScore:this._highScore}));
    this._drawHighScore();
  }
};

RuneTx.ScoreRenderer.prototype.reset = function() {
  this._score = 0;
  this._level = 0;
};
