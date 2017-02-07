var RuneTx = RuneTx || {};

RuneTx.GameBoard = function(screenContext, backgroundLayer, foregroundLayer, props) {
  props = props || {};
  this._screenContext = screenContext;
  this._backgroundLayer = backgroundLayer;
  this._foregroundLayer = foregroundLayer;
  this._boardOffsetX = props.boardOffsetX || 0;
  this._boardOffsetY = props.boardOffsetY || 0;
  this._rows = props.rows || 9;
  this._cols = props.cols || 9;
  this._pixRenderer = props.pixRenderer;
  this._boardColors = props.boardColors || [C64Style.Color.GREY, C64Style.Color.LIGHTBLUE];
  this._initialize();
};

RuneTx.GameBoard.prototype._initialize = function() {

};

RuneTx.GameBoard.prototype._createBackground = function() {

};

RuneTx.GameBoard.prototype._createForeground = function() {

};

RuneTx.GameBoard.prototype.placeRune = function(runeTile, x, y) {

};
