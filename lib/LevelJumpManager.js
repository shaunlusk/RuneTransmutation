var RuneTx = RuneTx || {};

// var ljConfig = {
//   "rows" : 5,
//   "cols" : 34,
//   "scaleX" : 2,
//   "scaleY" : 2,
//   "borderColor" : C64Style.Color.DARKGREY,
//   "borderSize" : 2,
//   "backgroundColor" : C64Style.Color.BLACK
// };

RuneTx.LevelJumpManager = function(props) {
  this._level = 1;
  this._levelMin = props.levelMin || 1;
  this._levelMax = props.levelMax || 30;
  this._gameEngine = props.gameEngine;

  this._screenContext = new C64Style.Screen(props.targetElement, {
    "rows" : props.rows || 3,
    "cols" : props.cols || 34,
    "scaleX" : props.scaleX || 2,
    "scaleY" : props.scaleY || 2,
    "borderColor" : props.borderColor || C64Style.Color.DARKGREY,
    "borderSize" : props.borderSize || 2,
    "backgroundColor" : props.backgroundColor || C64Style.Color.BLACK
  });
  this._screenContext.initialize();

  this._textColor = props.textColor || C64Style.Color.WHITE;
  this._layer = this._screenContext.createLayer("GfxLayer");
  this._text = props.text || "Jump to Level:";
  this._textOffsetX = props.textOffsetX || 1 * C64Style.CELLWIDTH;
  this._textOffsetY = props.textOffsetY || 1 * C64Style.CELLHEIGHT;

  this._textElement = new C64Style.TextElement(this._screenContext, this._layer, {
    text: this._text,
    color: this._textColor,
    backgroundColor: C64Style.Color.BLACK,
    x: this._textOffsetX,
    y: this._textOffsetY,
    onClick:this._decrement.bind(this)
  });
  this._layer.addElement(this._textElement);

  this._leftButton = new C64Style.TextButton(this._screenContext, this._layer, {
    text: "<",
    color: this._textColor,
    backgroundColor: C64Style.Color.BLACK,
    x: this._textOffsetX + ((this._text.length + 2) * C64Style.CELLWIDTH),
    y: this._textOffsetY - (1 * C64Style.CELLHEIGHT),
    onClick:this._decrement.bind(this)
  });
  this._layer.addElement(this._leftButton);

  this._rightButton = new C64Style.TextButton(this._screenContext, this._layer, {
    text: ">",
    color: this._textColor,
    backgroundColor: C64Style.Color.BLACK,
    x: this._textOffsetX + ((this._text.length + 8) * C64Style.CELLWIDTH),
    y: this._textOffsetY - (1 * C64Style.CELLHEIGHT),
    onClick:this._increment.bind(this)
  });
  this._layer.addElement(this._rightButton);

  this._goButton = new C64Style.TextButton(this._screenContext, this._layer, {
    text: "GO",
    color: this._textColor,
    backgroundColor: C64Style.Color.BLACK,
    x: this._textOffsetX + ((this._text.length + 12) * C64Style.CELLWIDTH),
    y: this._textOffsetY - (1 * C64Style.CELLHEIGHT),
    onClick:this._go.bind(this)
  });
  this._layer.addElement(this._goButton);

  this._textElement = new C64Style.TextElement(this._screenContext, this._layer, {
    text: this._level.toString(),
    color: this._textColor,
    backgroundColor: C64Style.Color.BLACK,
    x: this._textOffsetX + ((this._text.length + 6) * C64Style.CELLWIDTH),
    y: this._textOffsetY,
    onClick:this._decrement.bind(this)
  });
  this._layer.addElement(this._textElement);

  this._screenContext.render();
};

RuneTx.LevelJumpManager.prototype._decrement = function() {
  if (this._level === this._levelMin) return;
  this._level--;
  if (this._level === 9) this._textElement.setX(this._textElement.getX() + 4);
  this._textElement.setText(this._level.toString());
};

RuneTx.LevelJumpManager.prototype._increment = function() {
  if (this._level === this._levelMax) return;
  this._level++;
  if (this._level === 10) this._textElement.setX(this._textElement.getX() - 4);
  this._textElement.setText(this._level.toString());
};

RuneTx.LevelJumpManager.prototype._go = function() {
  this._gameEngine.jumpToLevel(this._level - 1);
};
