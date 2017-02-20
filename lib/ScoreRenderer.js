var RuneTx = RuneTx || {};

RuneTx.ScoreRenderer = function(layer, offsetX, offsetY) {
  this._layer = layer;
  this._offsetX = offsetX;
  this._offsetY = offsetY;
};

RuneTx.ScoreRenderer.prototype.drawScoreBox = function() {
  this._layer.drawBorder(this._offsetX, this._offsetY, 9, 4, C64Style.Color.WHITE);
  this._layer.writeText("Score", this._offsetX + 1, this._offsetY + 1, C64Style.Color.WHITE);
};

RuneTx.ScoreRenderer.prototype.updateScore = function(score) {

};
