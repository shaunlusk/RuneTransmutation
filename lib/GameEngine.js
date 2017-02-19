var RuneTx = RuneTx || {};

RuneTx.GameEngine = function(props) {
  props = props || {};
  this._screenContext = props.screenContext;
  this._backgroundLayer = props.backgroundLayer;
  this._foregroundLayer = props.foregroundLayer;
  this._floatLayer = props.floatLayer;
  this._textFloatLayer = props.textFloatLayer;
  this._levelDefinitions = props.levelDefinitions;
  this._boardOffsetX = props.boardOffsetX || 0;
  this._boardOffsetY = props.boardOffsetY || 0;
  this._discardsAllowed = props.discardsAllowed || 3;
  this._currentDiscards = 0;
  this._graveOffsetX = props.graveOffsetX || 1 *  C64Style.CELLWIDTH;
  this._graveOffsetY = props.graveOffsetY || 18 * C64Style.CELLHEIGHT;
  this._cellWidth = 16;
  this._cellHeight = 16;
  this._currentLevelDefinition = null;
  this._level = 0;
  this._currentRune = null;
  this._currentRuneElement = null;
  this._board = null;
  this._pixRenderer = new C64Style.PixRenderer(this._screenContext.getScaleX(), this._screenContext.getScaleY());
  this._graveyardRenderer = new RuneTx.GraveyardRenderer(
    this._backgroundLayer,
    this._foregroundLayer,
    {
      pixRenderer: this._pixRenderer,
      discardsAllowed:this._discardsAllowed,
      graveOffsetX:this._graveOffsetX,
      graveOffsetY:this._graveOffsetY,
    }
  );
  this._runeOffsetX = 8;
  this._runeOffsetY = 8;

  this._msgElement = new C64Style.TextElement(this._screenContext, this._textFloatLayer, {scaleX:2, scaleY:2, hidden:true});
  this._textFloatLayer.addElement(this._msgElement);
  this._msgElementYOrigin = -32;
  this._msgElementYTarget = 66;

  // next level button
  this._continueButton = new C64Style.TextButton(this._screenContext, this._textFloatLayer, {
    text: "CONTINUE",
    color: C64Style.Color.LIGHTGREEN,
    backgroundColor: C64Style.Color.BLACK,
    x:124, y:92,
    hidden:true,
    onClick:this._nextLevel.bind(this)
  });
  this._textFloatLayer.addElement(this._continueButton);

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
    this._endRoundSuccess();
  } else {
    console.log("LOSE");
    this._currentRuneElement = null;
  }
};

RuneTx.GameEngine.prototype._endRoundSuccess = function() {
  // stop responding to input
  this._betweenLevels = true;
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

  setTimeout(this._continueButton.show.bind(this._continueButton), 1100);
};

RuneTx.GameEngine.prototype._nextLevel = function() {
  this._backgroundLayer.clearLayer();
  this._foregroundLayer.clearLayer();
  this._floatLayer.clearLayer();

  this._continueButton.hide();
  this._msgElement.hide();

  this._level++;

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
    this._msgElement.hide();
    this._floatLayer.clearLayer();
    this._betweenLevels = false;
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
  if (!this._currentRuneElement) return;
  this._currentRuneElement.setX(event.data.x - this._runeOffsetX);
  this._currentRuneElement.setY(event.data.y - this._runeOffsetY);
};

RuneTx.GameEngine.prototype.handleMouseClick = function(event) {
  if (this._betweenLevels) return;
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
  // remove from float layer
  this._floatLayer.removeElement(this._currentRuneElement);

  // set rune on graveyard
  this._graveyardRenderer.disposeRune(this._currentRuneElement);

  this._currentDiscards++;

  // if current discards === discards allowed, end game
  // else, generate new rune
  if (this._currentDiscards === this._discardsAllowed) {
    this._endRound(false);
  } else {
    this.generateRune();
  }

};
