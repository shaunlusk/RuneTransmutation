var RuneTx = RuneTx || {};

RuneTx.GameEngine = function(screenContext, backgroundLayer, foregroundLayer, floatLayer, props) {
  props = props || {};
  this._screenContext = screenContext;
  this._backgroundLayer = backgroundLayer;
  this._foregroundLayer = foregroundLayer;
  this._floatLayer = floatLayer;
  this._levelDefinitions = props.levelDefinitions;
  this._boardOffsetX = props.boardOffsetX || 0;
  this._boardOffsetY = props.boardOffsetY || 0;
  this._currentLevelDefinition = null;
  this._level = 1;
  this._currentRune = null;
  this._currentRuneElement = null;
  this._board = null;
  this._pixRenderer = new C64Style.PixRenderer(screenContext.getScaleX(), screenContext.getScaleY());
};

RuneTx.GameEngine.prototype.generateRune = function() {
  var runes = this._currentLevelDefinition.runes;
  var rune = runes[RuneTx.random(runes.length - 1)];
  var colors = this._currentLevelDefinition.runeColors;
  var color = colors[RuneTx.random(colors.length - 1)];
  this._currentRune = new RuneTx.RuneTile(rune, color);
  var props = {
    scaleX : 2,
    scaleY : 2,
    pixPathArray : RuneTx.runes[rune],
    pixRenderer : this._pixRenderer
  };
  this._currentRuneElement = new C64Style.PixElement(this._screenContext, this._floatLayer, props);
  this._floatLayer.add(this._currentRuneElement);
};

RuneTx.GameEngine.prototype.createGameBoard = function(level) {
  this._createGameBoard(this._screenContext, this._backgroundLayer, this._foregroundLayer, this._levelDefinition[this.level]);
};

RuneTx.GameEngine.prototype._createGameBoard = function(screenContext, backgroundLayer, foregroundLayer, levelDefinition) {
  var props = {
    rows: levelDefinition.rows,
    cols: levelDefinition.cols,
    boardColors: levelDefinition.boardColors,
    runeColors: levelDefinition.runeColors,
    pixRenderer : this._pixRenderer
  };
  this._board = new RuneTx.GameBoard(screenContext, backgroundLayer, foregroundLayer, props);
};

RuneTx.GameEngine.prototype.startRound = function(level) {
  this._currentLevelDefinition = level;
  this.createGameBoard(level);
  this.generateRune();
};

RuneTx.GameEngine.prototype._endRound = function(win) {

};

RuneTx.GameEngine.prototype.handleMouseMove = function(event) {

};

RuneTx.GameEngine.prototype.handleMouseClick = function(event) {
  var boardCoords = this._getBoardCoords(event);
  // if rune can be placed at coords
  if (this._board.runeFitsAt(this._currentRune, boardCoords.x, boardCoords.y)) {
    // apply rune
    this._board.placeRune(this._currentRune, boardCoords.x, boardCoords.y);
    this._floatLayer.remove(this._currentRuneElement);

    if (this._board._checkWinCondition()) {
      this._endRound(true);
    }
    else if (this._board._checkLoseCondition()) {
      this._endRound(false);
    } else {
      generateRune();
    }
  }
};

RuneTx.GameEngine.prototype._getBoardCoords = function(event) {

};
