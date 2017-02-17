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
  this._discardsAllowed = props.discardsAllowed || 3;
  this._currentDiscards = 0;
  this._graveOffsets = props.graveOffsets || {x:1,y:17};
  this._cellWidth = 16;
  this._cellHeight = 16;
  this._currentLevelDefinition = null;
  this._level = 1;
  this._currentRune = null;
  this._currentRuneElement = null;
  this._board = null;
  this._pixRenderer = new C64Style.PixRenderer(screenContext.getScaleX(), screenContext.getScaleY());
  this._graveyardRenderer = new RuneTx.GraveyardRenderer(backgroundLayer, {discardsAllowed:this._discardsAllowed, graveOffsets:this._graveOffsets});
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
  this._createGameBoard(this._levelDefinitions[level]);
};

RuneTx.GameEngine.prototype._createGameBoard = function(levelDefinition) {
  var bg = this._createBackground(levelDefinition);
  var fg = this._createForeground(levelDefinition);
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
    startingRuneY : levelDefinition.startingRuneY,
    discardsAllowed : this._discardsAllowed,
    graveOffsets : this._graveOffsets
  };
  this._board = new RuneTx.GameBoard(this._screenContext, bg, fg, props);
};

RuneTx.GameEngine.prototype._createBackground = function(levelDefinition) {
  return new RuneTx.BoardBackground(this._screenContext, this._backgroundLayer, {
    boardOffsetX : this._boardOffsetX,
    boardOffsetY : this._boardOffsetY,
    rows: levelDefinition.rows,
    cols: levelDefinition.cols,
    boardColors : levelDefinition.boardColors,
    discardsAllowed : this._discardsAllowed,
    graveyardRenderer : this._graveyardRenderer
  });
};

RuneTx.GameEngine.prototype._createForeground = function(levelDefinition) {
  return new RuneTx.BoardForeground(this._screenContext, this._foregroundLayer, {
    boardOffsetX : this._boardOffsetX,
    boardOffsetY : this._boardOffsetY,
    rows: levelDefinition.rows,
    cols: levelDefinition.cols,
    cellWidth : this._cellWidth,
    cellHeight : this._cellHeight,
    pixRenderer : this._pixRenderer,
    graveOffsets : this._graveOffsets
  });
};

RuneTx.GameEngine.prototype.startRound = function(level) {
  this._currentLevelDefinition = this._levelDefinitions[level];
  this.createGameBoard(level);
  this.generateRune();
};

RuneTx.GameEngine.prototype._endRound = function(win) {
  if (win) {
    console.log("WIN");
  } else {
    console.log("LOSE");
  }
};

RuneTx.GameEngine.prototype.handleMouseMove = function(event) {
  if (!this._currentRuneElement) return;
  this._currentRuneElement.setX(event.data.x - this._runeOffsetX);
  this._currentRuneElement.setY(event.data.y - this._runeOffsetY);
};

RuneTx.GameEngine.prototype.handleMouseClick = function(event) {
  this._handleGraveyardClick(event);
  this._handleBoardClick(event);

};

RuneTx.GameEngine.prototype._handleGraveyardClick = function(event) {
  if (this._clickIsOnGraveyard(event)) {
    this._disposeRune();
  }
};

RuneTx.GameEngine.prototype._handleBoardClick = function(event) {
  var boardCoords = this._getBoardCoords(event);
  // if rune can be placed at coords
  if (this._board.runeFitsAt(this._currentRune, boardCoords.x, boardCoords.y)) {
    // apply rune
    this._board.placeRune(this._currentRune, boardCoords.x, boardCoords.y);
    this._floatLayer.removeElement(this._currentRuneElement);

    this._board.removeCompleteLines();

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

RuneTx.GameEngine.prototype._clickIsOnGraveyard = function(event) {
  return (
    event.data.x > this._graveyardRenderer.getX() &&
    event.data.x < this._graveyardRenderer.getWidth() &&
    event.data.y > this._graveyardRenderer.getY() &&
    event.data.y < this._graveyardRenderer.getHeight()
  );
};

RuneTx.GameEngine.prototype._getBoardCoords = function(event) {
  return {
    x: Math.floor((event.data.x - this._boardOffsetX) / this._cellWidth),
    y: Math.floor((event.data.y - this._boardOffsetY) / this._cellHeight),
  };
};

RuneTx.GameEngine.prototype._disposeRune = function() {
  // set rune on graveyard

  // remove from float layer
  this._floatLayer.removeElement(this._currentRuneElement);

  this._currentDiscards++;

  // if current discards === discards allowed, end game
  // else, generate new rune
  if (this._currentDiscards === this._discardsAllowed) {
    this._endRound(false);
  } else {
    this.generateRune();
  }

};
