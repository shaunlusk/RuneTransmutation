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
  this._cellWidth = 16;
  this._cellHeight = 16;
  this._currentLevelDefinition = null;
  this._level = 1;
  this._currentRune = null;
  this._currentRuneElement = null;
  this._board = null;
  this._pixRenderer = new C64Style.PixRenderer(screenContext.getScaleX(), screenContext.getScaleY());
  this._runeOffsetX = 8;
  this._runeOffsetY = 8;
  screen.on(C64Style.EventType.MOUSE_MOVE, this.handleMouseMove.bind(this));
  screen.on(C64Style.EventType.MOUSE_UP, this.handleMouseClick.bind(this));
};

RuneTx.GameEngine.prototype.generateRune = function() {
  var runes = this._currentLevelDefinition.runes;
  var rune = runes[RuneTx.random(runes.length - 1)];
  var colors = this._currentLevelDefinition.runeColors;
  var color = colors[RuneTx.random(colors.length - 1)];
  this._currentRune = new RuneTx.RuneTile(rune, color);
  var props = {
    pixPathArray : RuneTx.runes[rune],
    pixRenderer : this._pixRenderer,
    defaultPalette : [color]
  };
  this._currentRuneElement = new C64Style.PixElement(this._screenContext, this._floatLayer, props);
  this._floatLayer.addElement(this._currentRuneElement);
  var mouseX = this._screenContext.getMouseX();
  var mouseY = this._screenContext.getMouseY();
  if (mouseX > -1 && mouseY > -1) {
    this._currentRuneElement.moveTo(
      this._screenContext.getUnScaledX(mouseX) - this._runeOffsetX,
      this._screenContext.getUnScaledY(mouseY) - this._runeOffsetY,
      150
    );
  }
};

RuneTx.GameEngine.prototype.createGameBoard = function(level) {
  this._createGameBoard(this._screenContext, this._backgroundLayer, this._foregroundLayer, this._levelDefinitions[level]);
};

RuneTx.GameEngine.prototype._createGameBoard = function(screenContext, backgroundLayer, foregroundLayer, levelDefinition) {
  var props = {
    rows: levelDefinition.rows,
    cols: levelDefinition.cols,
    boardColors: levelDefinition.boardColors,
    boardOffsetX : this._boardOffsetX,
    boardOffsetY : this._boardOffsetY,
    pixRenderer : this._pixRenderer,
    cellWidth : this._cellWidth,
    cellHeight : this._cellHeight,
    startingRune : levelDefinition.startingRune,
    startingRuneX : levelDefinition.startingRuneX,
    startingRuneY : levelDefinition.startingRuneY
  };
  this._board = new RuneTx.GameBoard(screenContext, backgroundLayer, foregroundLayer, props);
};

RuneTx.GameEngine.prototype.startRound = function(level) {
  this._currentLevelDefinition = this._levelDefinitions[level];
  this.createGameBoard(level);
  this.generateRune();
};

RuneTx.GameEngine.prototype._endRound = function(win) {

};

RuneTx.GameEngine.prototype.handleMouseMove = function(event) {
  if (!this._currentRuneElement) return;
  this._currentRuneElement.setX(event.data.x - this._runeOffsetX);
  this._currentRuneElement.setY(event.data.y - this._runeOffsetY);
};

RuneTx.GameEngine.prototype.handleMouseClick = function(event) {
  var boardCoords = this._getBoardCoords(event);
  // if rune can be placed at coords
  if (this._board.runeFitsAt(this._currentRune, boardCoords.x, boardCoords.y)) {
    // apply rune
    this._board.placeRune(this._currentRune, boardCoords.x, boardCoords.y);
    this._floatLayer.removeElement(this._currentRuneElement);

    if (this._board.checkWinCondition()) {
      this._endRound(true);
    }
    else if (this._board.checkLoseCondition()) {
      this._endRound(false);
    } else {
      this.generateRune();
    }
  }
};

RuneTx.GameEngine.prototype._getBoardCoords = function(event) {
  return {
    x: Math.floor((event.data.x - this._boardOffsetX) / this._cellWidth),
    y: Math.floor((event.data.y - this._boardOffsetY) / this._cellHeight),
  };
};
