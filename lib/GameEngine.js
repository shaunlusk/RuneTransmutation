var RuneTx = RuneTx || {};

RuneTx.GameEngine = function(props) {
  props = props || {};
  this._debug = true;
  this._screenContext = props.screenContext;
  this._backgroundLayer = props.backgroundLayer;
  this._foregroundLayer = props.foregroundLayer;
  this._floatLayer = props.floatLayer;
  this._textFloatLayer = props.textFloatLayer;
  this._levelDefinitions = props.levelDefinitions;
  this._levelDefinitionsVersion = props.levelDefinitionsVersion;
  this._boardOffsetX = props.boardOffsetX || 0;
  this._boardOffsetY = props.boardOffsetY || 0;
  this._discardsAllowed = props.discardsAllowed || 3;
  this._currentDiscards = 0;
  this._betweenLevels = false;
  this._generateWildRunePct = props.generateWildRunePct || 0.02;
  this._wildRuneTile = null;
  this._wildRuneElement = null;
  this._wildRuneBoxY = props.wildRuneBoxY || 10;
  this._generateRuneDestroyer = props.generateRuneDestroyer || 0.02;
  this._destructionRune = props.destructionRune || new RuneTx.RuneTile("gebo", C64Style.Color.WHITE);
  this._destructionRuneElement = null;
  this._destructionRuneBoxY = props.destructionRuneBoxY || 14;
  this._graveOffsetX = props.graveOffsetX || 1 *  C64Style.CELLWIDTH;
  this._graveOffsetY = props.graveOffsetY || 20 * C64Style.CELLHEIGHT;
  this._newGameButtonOffsetX = props.newGameButtonOffsetX || 18 *  C64Style.CELLWIDTH;
  this._newGameButtonOffsetY = props.newGameButtonOffsetY || 31 * C64Style.CELLHEIGHT;
  this._cellWidth = 16;
  this._cellHeight = 16;
  this._currentLevelDefinition = null;
  this._level = 0;
  this._currentRune = null;
  this._currentRuneElement = null;
  this._currentRuneStartX = props.currentRuneStartX || 8;
  this._currentRuneStartY = props.currentRuneStartY || 32;
  this._board = null;
  this._gameStateDirty = false;
  this._hasMouse = false;
  this._firstMouseEvent = null;
  this._runeIsMoving = false;
  this._pixRenderer = new C64Style.PixRenderer(this._screenContext.getScaleX(), this._screenContext.getScaleY());
  this._graveyardRenderer = new RuneTx.GraveyardRenderer(
    this._backgroundLayer,
    this._foregroundLayer,
    {
      gameEngine:this,
      screenContext: this._screenContext,
      pixRenderer: this._pixRenderer,
      discardsAllowed:this._discardsAllowed,
      graveOffsetX:this._graveOffsetX,
      graveOffsetY:this._graveOffsetY,
    }
  );
  this._scoreRenderer = new RuneTx.ScoreRenderer(
    this,
    this._backgroundLayer,
    this._graveyardRenderer.getCellX() + this._graveyardRenderer.getCellWidth() + 2,
    this._graveyardRenderer.getCellY(),
    this._graveyardRenderer.getCellX() + this._graveyardRenderer.getCellWidth() + 2,
    this._graveyardRenderer.getCellY() + 4
  );
  this._levelRenderer = new RuneTx.LevelRenderer({
    engineContext:this,
    layer:this._backgroundLayer,
    offsetX:this._screenContext.getCols() - 7,
    offsetY:3
  });
  this._runeOffsetX = 8;
  this._runeOffsetY = 8;

  this._msgElement = new C64Style.TextElement(this._screenContext, this._textFloatLayer, {scaleX:2, scaleY:2, hidden:true});
  this._textFloatLayer.addElement(this._msgElement);
  this._msgElementYOrigin = -32;
  this._msgElementYTarget = 66;

  // next level button
  var continueString = "CONTINUE";
  this._continueButtonX = C64Style.CELLWIDTH * ((this._screenContext.getCols() - (continueString.length + 2)) / 2);
  this._continueButtonY = 92;
  this._continueButton = new C64Style.TextButton(this._screenContext, this._textFloatLayer, {
    text: continueString,
    color: C64Style.Color.LIGHTGREEN,
    backgroundColor: C64Style.Color.BLACK,
    x:this._continueButtonX, y: -64,
    hidden:true,
    onClick:this._nextLevel.bind(this)
  });
  this._textFloatLayer.addElement(this._continueButton);

  this._newGameButton = new C64Style.TextButton(this._screenContext, this._textFloatLayer, {
    text: "NEW GAME",
    color: C64Style.Color.LIGHTGREEN,
    backgroundColor: C64Style.Color.BLACK,
    x:this._newGameButtonOffsetX,
    y:this._newGameButtonOffsetY,
    onClick:this._startNewGame.bind(this)
  });
  this._textFloatLayer.addElement(this._newGameButton);

  this._eventListeners = {
    "PLACE_RUNE":[],
    "LINE_CLEAR":[],
    "LEVEL_CLEAR":[],
    "UPDATE_LEVEL":[],
    "UPDATE_SCORE":[],
    "UPDATE_HIGHSCORE":[],
    "GAME_OVER":[]
  };

  screen.on(C64Style.EventType.MOUSE_MOVE, this.handleMouseMove.bind(this));
  screen.on(C64Style.EventType.MOUSE_UP, this.handleMouseClick.bind(this));
  this.on(RuneTx.EventType.PLACE_RUNE, this._scoreRenderer.handlePlaceRune.bind(this._scoreRenderer));
  this.on(RuneTx.EventType.PLACE_RUNE, this._setGameStateDirty.bind(this, true));
  this.on(RuneTx.EventType.LINE_CLEAR, this._scoreRenderer.handleLineClear.bind(this._scoreRenderer));
  this.on(RuneTx.EventType.LEVEL_CLEAR, this._scoreRenderer.handleLevelClear.bind(this._scoreRenderer));
  this.on(RuneTx.EventType.UPDATE_LEVEL, this._scoreRenderer.handleUpdateLevel.bind(this._scoreRenderer));
  this.on(RuneTx.EventType.UPDATE_LEVEL, this._setGameStateDirty.bind(this, true));
  this.on(RuneTx.EventType.UPDATE_HIGHSCORE, this.handleUpdateHighScore.bind(this));
  screen.on(C64Style.EventType.AFTER_RENDER, this._updateSaveGame.bind(this));
  this.on(RuneTx.EventType.UPDATE_LEVEL, this._levelRenderer.handleUpdateLevel.bind(this));

  this._loadHighScore();
  this._drawScoreBox();
  this._drawGraveyard();
  this._drawLevel();
  this._drawRuneBox();
};

RuneTx.GameEngine.prototype.getLevel = function() {return this._level;};
RuneTx.GameEngine.prototype.getScore = function() {return this._scoreRenderer.getScore();};
RuneTx.GameEngine.prototype.getHighScore = function() {return this._scoreRenderer.getHighScore();};
RuneTx.GameEngine.prototype.getDestructionRune = function() {return this._destructionRune;};
RuneTx.GameEngine.prototype.setBetweenLevels = function(bool) {
  this._betweenLevels = bool;
  RuneTx.GameStorage.updateBetweenLevels(bool);
};
RuneTx.GameEngine.prototype.isBetweenLevels = function() {return this._betweenLevels;};

RuneTx.GameEngine.prototype._drawStuff = function() {
  this._drawRuneBox();
  this._drawLevel();
  this._drawColorDepthGuide();
  this._drawWildRuneBox();
  this._drawDestructionRuneBox();
  this._drawScoreBox();
  this._drawGraveyard();
  this._drawTitle();
};

RuneTx.GameEngine.prototype._drawScoreBox = function() {
  this._scoreRenderer.drawScoreBoxes();
};

RuneTx.GameEngine.prototype._drawGraveyard = function() {
  this._graveyardRenderer.drawGraveyard();
};

RuneTx.GameEngine.prototype._drawLevel = function() {
  this._levelRenderer.draw();
};

RuneTx.GameEngine.prototype._drawRuneBox = function() {
  this._backgroundLayer.drawBorder(0, 3, 3, 3, C64Style.Color.WHITE);
};

RuneTx.GameEngine.prototype._drawTitle = function() {
  var str = "Rune Transmutation";
  var width = str.length;
  var x = Math.floor((this._screenContext.getCols() - width) / 2);
  this._backgroundLayer.writeText(str, x, 1, C64Style.Color.WHITE);
};

RuneTx.GameEngine.prototype._drawColorDepthGuide = function() {
  var width = 2 + 2 * (this._currentLevelDefinition.boardColors.length - 1);
  var x = this._screenContext.getCols() - width - 1;
  var y = 7;
  this._backgroundLayer.drawBorder(x, y, width, 2, C64Style.Color.WHITE);
  x++;
  this._backgroundLayer.drawSymbol("CHECKER_BOARD", x, y + 1, this._currentLevelDefinition.boardColors[0]);
  for (var i = 1; i < this._currentLevelDefinition.boardColors.length; i++) {
    x++;
    this._backgroundLayer.drawSymbol(">", x, y + 1, C64Style.Color.WHITE);
    x++;
    this._backgroundLayer.drawSymbol("CHECKER_BOARD", x, y + 1, this._currentLevelDefinition.boardColors[i]);
  }
};

RuneTx.GameEngine.prototype._drawWildRuneBox = function() {
  var str = "Wild";
  var width = str.length + 4;
  var x = this._screenContext.getCols() - width - 1;
  var y = this._wildRuneBoxY;
  this._wildRuneElement = RuneTx.createElementFromRune(this._wildRuneTile, this._screenContext, this._foregroundLayer, {
    x: C64Style.CELLWIDTH * (x + str.length + 2),
    y: C64Style.CELLHEIGHT * (y + 1)
  });
  this._backgroundLayer.drawBorder(x, y, width, 3, C64Style.Color.WHITE);
  this._backgroundLayer.writeText(str, x + 1, y + 1, C64Style.Color.WHITE);
};

RuneTx.GameEngine.prototype._drawDestructionRuneBox = function() {
  var str = "Erase";
  var width = str.length + 4;
  var x = this._screenContext.getCols() - width - 1;
  var y = this._destructionRuneBoxY;
  this._destructionRuneElement = RuneTx.createElementFromRune(this._destructionRune, this._screenContext, this._foregroundLayer, {
    x: C64Style.CELLWIDTH * (x + str.length + 2),
    y: C64Style.CELLHEIGHT * (y + 1)
  });
  this._backgroundLayer.drawBorder(x, y, width, 3, C64Style.Color.WHITE);
  this._backgroundLayer.writeText(str, x + 1, y + 1, C64Style.Color.WHITE);
};

RuneTx.GameEngine.prototype._startNewGame = function() {
  console.log("NEWGAME");
  this._level = 0;
  this._currentDiscards = 0;
  this._msgElement.hide();
  this.setBetweenLevels(false);
  if (this._currentRuneElement) this._floatLayer.removeElement(this._currentRuneElement);
  this._currentRune = null;
  this._currentRuneElement = null;
  this._graveyardRenderer.reset();
  this._scoreRenderer.reset();
  this._board.cleanUp();
  this.clearBoardLayers();
  RuneTx.GameStorage.clearCurrentGame();
  this._newGameButton._setActive(false);
  this._newGameButton.moveTo(this._newGameButtonOffsetX, this._newGameButtonOffsetY, 120);
  this.startRound(0);
};

RuneTx.GameEngine.prototype.clearBoardLayers = function() {
  this._backgroundLayer.clearLayer();
  this._foregroundLayer.clearLayer();
  this._floatLayer.clearLayer();
};

RuneTx.GameEngine.prototype.generateRune = function() {
  var pct = Math.random();
  if (pct < this._generateWildRunePct) {
    this._currentRune = this._wildRuneTile;
  } else {
    pct = Math.random();
    if (pct < this._generateRuneDestroyer) {
      this._currentRune = new RuneTx.RuneTile(this._destructionRune.getRune(), this._destructionRune.getColor());
    } else {
      var runes = this._currentLevelDefinition.runes;
      var rune = runes[RuneTx.random(runes.length - 1)];
      var colors = this._currentLevelDefinition.runeColors;
      var color = colors[RuneTx.random(colors.length - 1)];
      this._currentRune = new RuneTx.RuneTile(rune, color);
    }
  }

  RuneTx.GameStorage.updateCurrentRune(this._currentRune);

  this._instantiateCurrentRune();

  if (this._hasMouse) {
    var mouseX = this._screenContext.getMouseX();
    var mouseY = this._screenContext.getMouseY();
    if (mouseX > -1 && mouseY > -1) {
      this._currentRuneElement.moveTo(
        this._screenContext.getUnScaledX(mouseX) - this._runeOffsetX,
        this._screenContext.getUnScaledY(mouseY) - this._runeOffsetY,
        150
      );
    }
  }
};

RuneTx.GameEngine.prototype._instantiateCurrentRune = function() {
  this._currentRuneElement = RuneTx.createElementFromRune(
    this._currentRune,
    this._screenContext,
    this._floatLayer,
    {
      x:this._currentRuneStartX,
      y:this._currentRuneStartY,
      pixRenderer:this._pixRenderer
    }
  );
};

RuneTx.GameEngine.prototype.createGameBoard = function(level) {
  this._createGameBoard(this._levelDefinitions[level]);
};

RuneTx.GameEngine.prototype.restoreGameBoard = function(level) {
  this._createGameBoard(this._levelDefinitions[level], true);
};

RuneTx.GameEngine.prototype._createGameBoard = function(levelDefinition, restore) {
  var bg = this._createBackground(levelDefinition);
  var fg = this._createForeground(levelDefinition);
  var props = {
    screenContext : this._screenContext,
    gameEngine : this,
    boardBackground : bg,
    boardForeground : fg,
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
    isRestore:restore
  };
  this._board = new RuneTx.GameBoard(props);
};

RuneTx.GameEngine.prototype._createBackground = function(levelDefinition) {
  return new RuneTx.BoardBackground(this._screenContext, this._backgroundLayer, {
    boardOffsetX : this._boardOffsetX,
    boardOffsetY : this._boardOffsetY,
    rows: levelDefinition.rows,
    cols: levelDefinition.cols,
    boardColors : levelDefinition.boardColors,
    discardsAllowed : this._discardsAllowed
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
  this._wildRuneTile = new RuneTx.RuneTile(this._currentLevelDefinition.startingRune, C64Style.Color.WHITE);
  this.createGameBoard(level);
  this._drawStuff();
  this.generateRune();
  this.notify(new C64Style.Event(RuneTx.EventType.UPDATE_LEVEL, {level:level}));
};

RuneTx.GameEngine.prototype._endRound = function(win) {
  // stop responding to input
  this.setBetweenLevels(true);

  if (win) {
    this._endRoundSuccess();
  } else {
    console.log("LOSE");
    this._currentRuneElement = null;
    this._endRoundFailure();
  }
};

RuneTx.GameEngine.prototype._endRoundFailure = function() {
  this.notify(new C64Style.Event(RuneTx.EventType.GAME_OVER, {}));
  this._setGameStateDirty(false);
  RuneTx.GameStorage.clearCurrentGame();

  // fade layers
  this._dimFloatLayer();

  // show level complete text
  var msg = "Game Over!";
  var x = ((this._screenContext.getWidth() / this._screenContext.getScaleX()) - (msg.length * C64Style.CELLWIDTH * this._msgElement.getElementScaleX())) / 2;
  this.moveMessage(
    msg,
    C64Style.Color.ORANGE,
    C64Style.Color.RED,
    x, this._msgElementYOrigin,
    x, this._msgElementYTarget,
    1000
  );

  setTimeout(function() {
    this._newGameButton.moveTo(this._continueButtonX, this._continueButtonY, 120);
  }.bind(this), 1100);

};

RuneTx.GameEngine.prototype._endGame = function() {
  this.notify(new C64Style.Event(RuneTx.EventType.GAME_OVER, {}));
  this._setGameStateDirty(false);
  RuneTx.GameStorage.clearCurrentGame();

  // fade layers
  this._dimFloatLayer();

  // show level complete text
  var msg = "Game Over!";
  var x = ((this._screenContext.getWidth() / this._screenContext.getScaleX()) - (msg.length * C64Style.CELLWIDTH * this._msgElement.getElementScaleX())) / 2;
  this.moveMessage(
    msg,
    C64Style.Color.LIGHTBLUE,
    C64Style.Color.BLUE,
    x, this._msgElementYOrigin,
    x, this._msgElementYTarget,
    1000
  );

  setTimeout(function() {
    this._newGameButton.moveTo(this._continueButtonX, this._continueButtonY, 120);
  }.bind(this), 1100);

};

RuneTx.GameEngine.prototype._endRoundSuccess = function() {
  this.notify(new C64Style.Event(RuneTx.EventType.LEVEL_CLEAR, {}));

  this._newGameButton.hide();
  // fade layers
  this._dimFloatLayer();

  // show level complete text
  var msg = "Level Complete!";
  var x = ((this._screenContext.getWidth() / this._screenContext.getScaleX()) - (msg.length * C64Style.CELLWIDTH * this._msgElement.getElementScaleX())) / 2;
  this.moveMessage(
    msg,
    C64Style.Color.LIGHTGREEN,
    C64Style.Color.BLUE,
    x, this._msgElementYOrigin,
    x, this._msgElementYTarget,
    1000
  );

  setTimeout(function() {
    this._continueButton.setY(this._continueButtonY);
    this._continueButton.show();
  }.bind(this), 1100);
};

RuneTx.GameEngine.prototype._nextLevel = function() {
  if (this._currentRuneElement) this._floatLayer.removeElement(this._currentRuneElement);
  if (this._wildRuneElement) this._foregroundLayer.removeElement(this._wildRuneElement);
  if (this._destructionRuneElement) this._foregroundLayer.removeElement(this._destructionRuneElement);
  this._currentRune = null;
  this._currentRuneElement = null;
  this._board.cleanUp();
  this.clearBoardLayers();

  this._continueButton.hide();
  this._continueButton.setY(-64);
  this._msgElement.hide();

  this._level++;

  if (this._level === this._levelDefinitions.length) {
    this._endGame();
    return;
  }

  var msg = "Level " + (this._level + 1);
  var x = ((this._screenContext.getWidth() / this._screenContext.getScaleX()) - (msg.length * C64Style.CELLWIDTH * this._msgElement.getElementScaleX())) / 2;
  this.moveMessage(
    msg,
    C64Style.Color.LIGHTGREEN,
    C64Style.Color.BLUE,
    x, this._msgElementYOrigin,
    x, this._msgElementYTarget,
    1000
  );

  setTimeout(function() {
    this._newGameButton.show();
    this._msgElement.hide();
    this._floatLayer.clearLayer();
    this.setBetweenLevels(false);
    this.startRound(this._level);
  }.bind(this), 2800);
};


RuneTx.GameEngine.prototype.moveMessage = function(msg, color, backgroundColor, sx, sy, tx, ty, moveDuration) {
  this._msgElement.setText(msg);
  this._msgElement.setColor(color);
  this._msgElement.setBackgroundColor(backgroundColor);
  this._msgElement.setX(sx);
  this._msgElement.setY(sy);

  this._msgElement.moveTo(tx, ty, moveDuration);
  this._msgElement.show();
};

RuneTx.GameEngine.prototype._dimFloatLayer = function() {
  this._dimLayer(this._floatLayer, 0.65, 20, 20);
};

RuneTx.GameEngine.prototype._dimLayer = function(layer, amount, steps, interval) {
  var stepAmount = amount / steps;
  setTimeout(this._dimStep.bind(this, layer, stepAmount, stepAmount, steps, interval), interval);

};
RuneTx.GameEngine.prototype._dimStep = function(layer, amount, stepAmount, steps, interval) {
  var canvasContext = layer.getCanvasContext();
  canvasContext.clearRect(0, 0, layer.getWidth(), layer.getHeight());
  canvasContext.fillStyle = "rgba(0,0,0," + amount + ")";
  canvasContext.fillRect(0, 0, layer.getWidth(), layer.getHeight());
  if (steps > 0) {
    setTimeout(this._dimStep.bind(this, layer, amount + stepAmount, stepAmount, steps - 1, interval), interval);
  }
};

RuneTx.GameEngine.prototype.handleMouseMove = function(event) {
  if (!this._firstMouseEvent) {
    this._firstMouseEvent = event.type;
    this._hasMouse = true;
  }
  if (this._currentRuneElement && !this._runeIsMoving && this._hasMouse) {
    this._currentRuneElement.setX(event.data.x - this._runeOffsetX);
    this._currentRuneElement.setY(event.data.y - this._runeOffsetY);
  }
};

RuneTx.GameEngine.prototype.handleMouseClick = function(event) {
  if (!this._firstMouseEvent) this._firstMouseEvent = event.type;
  if (this.isBetweenLevels() || this._runeIsMoving) return;
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
    this._runeIsMoving = true;
    this._currentRuneElement.moveTo(
      this._boardOffsetX + boardCoords.x * this._cellWidth,
      this._boardOffsetY + boardCoords.y * this._cellHeight,
      this._hasMouse ? 50 : 160,
      this._runeMoveCallback.bind(this, boardCoords));
  }
};

RuneTx.GameEngine.prototype._runeMoveCallback = function(boardCoords) {
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
  this._runeIsMoving = false;
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
  // remove from float layer
  this._floatLayer.removeElement(this._currentRuneElement);

  // this is a hack to ensure that the element is moved to the fg layer only after all
  // render operations have completed on the float layer.
  // Ideally, we need to have onNextFrame event handling on the screen class.
  setTimeout(function() {
    // if current discards === discards allowed, end game
    if (this._currentDiscards === this._discardsAllowed && !this._currentRune.equals(this._destructionRune)) {
      this._endRound(false);
    } else {
      // set rune on graveyard
      this._graveyardRenderer.disposeRune(this._currentRune, this._currentRuneElement);
      this._currentDiscards = this._graveyardRenderer.getCurrentDiscards();
      this._setGameStateDirty(true);
      this.generateRune();
    }
  }.bind(this), 15);
};

/** Add an event handler to the engine.
* @param {C64Style.EventType} eventType The type of the event.
* @param {Function} callback The handler to call when the specified event type occurs
*/
RuneTx.GameEngine.prototype.on = function(eventType, callback) {
  if (!this._eventListeners[eventType]) {
    this._eventListeners[eventType] = [];
  }
  this._eventListeners[eventType].push(callback);
};

/** Clear all event handlers for a given event type.
* @param {C64Style.EventType} eventType The type of the event.
*/
RuneTx.GameEngine.prototype.clearEventHandlers = function(eventType) {
  if (!this._eventListeners[eventType]) {
    throw new Error("Unknown event type:" + eventType);
  }
  this._eventListeners[eventType] = [];
};

/** Notify event handlers when an event has occured.
* @param {C64Style.Event} event The event that occured
*/
RuneTx.GameEngine.prototype.notify = function(event) {
  if (this._debug) {
    console.log("DEBUG EventType:" + event.type);
    console.log("DEBUG Data:", event.data);
  }
  if (!this._eventListeners[event.type]) {
    throw new Error("Unknown event type:" + event.type);
  }
  for (var i = 0; i < this._eventListeners[event.type].length; i++) {
    if (C64Style.isFunction(this._eventListeners[event.type][i])) this._eventListeners[event.type][i](event);
  }
};

RuneTx.GameEngine.prototype.handleUpdateHighScore = function(event) {
  RuneTx.GameStorage.updateHighScore(event.data.highScore);
};

RuneTx.GameEngine.prototype._loadHighScore = function() {
  this._scoreRenderer.setHighScore(RuneTx.GameStorage.getHighScore());
};

RuneTx.GameEngine.prototype.loadSavedGame = function() {
  if (this._validateLevelDefinitions()) {
    // this._drawRuneBox();

    // load & apply level
    var level = RuneTx.GameStorage.getLevel();
    this._level = level;
    this._currentLevelDefinition = this._levelDefinitions[level];
    this._wildRuneTile = new RuneTx.RuneTile(this._currentLevelDefinition.startingRune, C64Style.Color.WHITE);
    this.restoreGameBoard(level);
    // this._drawLevel();
    // this._drawColorDepthGuide();
    // this._drawWildRuneBox();
    // this._drawDestructionRuneBox();

    // load & apply gameboard state
    var boardState = RuneTx.GameStorage.getBoardState();
    this._board.restoreGame(boardState);

    // load & apply score
    this._scoreRenderer.setScore(RuneTx.GameStorage.getScore());
    this._scoreRenderer.setLevel(level);
    // this._drawScoreBox();

    // load & apply graveyard state
    var discardedRunes = RuneTx.GameStorage.getDiscardedRunes() || [];
    this._currentDiscards = discardedRunes.length;
    this._graveyardRenderer.restoreDiscardedRunes(discardedRunes);
    // this._drawGraveyard();

    this._drawStuff();

    this._betweenLevels = RuneTx.GameStorage.getBetweenLevels();
    console.log("Load betweenLevels value:" + this._betweenLevels);
    if (this._betweenLevels) {
      this._endRoundSuccess();
    } else {
      this._currentRune = RuneTx.GameStorage.getCurrentRune();
      if (this._currentRune) {
        this._instantiateCurrentRune();
      } else {
        this.generateRune();
      }
    }
  } else {
    // get rid of bad save data
    RuneTx.GameStorage.clearCurrentGame();

    // save current version # of level definitions
    RuneTx.GameStorage.updateLevelDefinitionsVersion(this._levelDefinitionsVersion);

    gameEngine.startRound(0);
  }
};

RuneTx.GameEngine.prototype._validateLevelDefinitions = function() {
  var version = RuneTx.GameStorage.getLevelDefinitionsVersion();
  return version === this._levelDefinitionsVersion;
};

RuneTx.GameEngine.prototype.initializeSaveGame = function() {
  RuneTx.GameStorage.updateLevelDefinitionsVersion(this._levelDefinitionsVersion);
  RuneTx.GameStorage.updateLevel(this._level);
};

RuneTx.GameEngine.prototype._updateSaveGame = function() {
  if (this._gameStateDirty) {
    setTimeout(this._updateSaveGame_action.bind(this), 1);
  }
};

RuneTx.GameEngine.prototype._updateSaveGame_action = function() {
  console.log("update game state...");
  RuneTx.GameStorage.updateBoardState(this._board);
  RuneTx.GameStorage.updateScore(this._scoreRenderer.getScore());
  RuneTx.GameStorage.updateLevel(this._level);
  RuneTx.GameStorage.updateDiscardedRunes(this._graveyardRenderer.getDiscardedRunes());
  console.log("save game betweenLevels value:" + this._betweenLevels);
  RuneTx.GameStorage.updateBetweenLevels(this.isBetweenLevels());
  RuneTx.GameStorage.updateCurrentRune(this._currentRune);

  this._gameStateDirty = false;
};

RuneTx.GameEngine.prototype._setGameStateDirty = function(bool) {
  if (bool) console.log("game dirty");
  this._gameStateDirty = bool;
};
