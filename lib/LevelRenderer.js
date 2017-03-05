var RuneTx = RuneTx || {};

RuneTx.LevelRenderer = function(props) {
  props = props || {};
  this._engineContext = props.engineContext;
  this._layer = props.layer;
  this._offsetX = props.offsetX;
  this._offsetY = props.offsetY;
  this._boxWidth = 6;
  this._boxHeight = 3;
  this._levelOffsetX = this._boxWidth;
  this._levelOffsetY = 2;
};

RuneTx.LevelRenderer.prototype.draw = function() {
  this._layer.drawBorder(this._offsetX, this._offsetY, this._boxWidth, this._boxHeight, C64Style.Color.WHITE);
  this._layer.writeText("Level", this._offsetX + 1, this._offsetY + 1, C64Style.Color.WHITE);
  this._drawLevel();
};

RuneTx.LevelRenderer.prototype._drawLevel = function() {
  var str = (this._engineContext.getLevel() + 1).toString();
  this._layer.writeText(str, this._levelOffsetX + this._offsetX - str.length, this._levelOffsetY + this._offsetY, C64Style.Color.WHITE, C64Style.Color.BLACK);
};

RuneTx.LevelRenderer.prototype.handleUpdateLevel = function() {
  this._drawLevel();
};
