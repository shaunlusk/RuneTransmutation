var RuneTx = RuneTx || {};

RuneTx.GraveyardRenderer = function(backgroundLayer, foregroundLayer, props) {
  props = props || {};
  this._backgroundLayer = backgroundLayer;
  this._foregroundLayer = foregroundLayer;
  this._pixRenderer = props.pixRenderer;
  this._discardsAllowed = props.discardsAllowed || 3;
  this._currentDiscards = 0;
  this._runeTiles = [];
  this._runeElements = [];
  this._x = props.graveOffsetX;
  this._y = props.graveOffsetY;
  this._cellX = Math.floor(props.graveOffsetX  / C64Style.CELLWIDTH);
  this._cellY = Math.floor(props.graveOffsetY  / C64Style.CELLHEIGHT);
  this._cellWidth = 4 * this._discardsAllowed + 2;
  this._cellHeight = 8;
  this._width = (this._cellX + this._cellWidth) * C64Style.CELLWIDTH;
  this._height = (this._cellY + this._cellHeight) * C64Style.CELLHEIGHT;
  this._graveOffsets = [];
  this._initGraveOffsets();
};

RuneTx.GraveyardRenderer.prototype._initGraveOffsets = function() {
  for (var i = 0; i < this._discardsAllowed; i++) {
    this._graveOffsets.push({
      cellX : this._cellX + i * 4 + 2,
      cellY : this._cellY + 3,
      runeX : this._x + (i * 4 * C64Style.CELLWIDTH) + (3 * C64Style.CELLWIDTH) - 4,
      runeY : this._y + 4 * C64Style.CELLHEIGHT - 2
    });
  }
};

RuneTx.GraveyardRenderer.prototype.getDiscardedRunes = function() {
  return this._runeTiles;
};

RuneTx.GraveyardRenderer.prototype.drawGraveyard = function() {
  var i, x, y;
  for (i = 0; i < this._discardsAllowed; i++) {
    this._drawGrave(this._graveOffsets[i].cellX, this._graveOffsets[i].cellY);
  }
  // draw dirt
  for (x = this._cellX + 1 ; x < this._cellX + 4 * this._discardsAllowed + 2; x++) {
    this._backgroundLayer.drawSymbol("BLOCK", x, this._cellY + 6, "#281900");
    this._backgroundLayer.drawSymbol("BLOCK", x, this._cellY + 7, "#281900");
  }

  this._backgroundLayer.drawBorder(this.getCellX(), this.getCellY(), this.getCellWidth(), this.getCellHeight(), C64Style.Color.WHITE);

  if (this._discardsAllowed > 1) {
    this._backgroundLayer.writeText("Graveyard", this._cellX + 1, this._cellY + 1, C64Style.Color.GREY);
  }
};

RuneTx.GraveyardRenderer.prototype._drawGrave = function(x, y) {
  this._backgroundLayer.drawSymbol("ROUNDED_CORNER_FILLED_TOP_LEFT", x, y, C64Style.Color.DARKGREY);
  this._backgroundLayer.drawSymbol("BAR_120", x + 1, y, C64Style.Color.BLACK, C64Style.Color.DARKGREY);
  this._backgroundLayer.drawSymbol("ROUNDED_CORNER_FILLED_TOP_RIGHT", x + 2, y, C64Style.Color.DARKGREY);
  this._backgroundLayer.drawSymbol("PIPE_117", x, y + 1, C64Style.Color.BLACK, C64Style.Color.DARKGREY);
  this._backgroundLayer.drawSymbol("BLOCK", x + 1, y + 1, C64Style.Color.DARKGREY);
  this._backgroundLayer.drawSymbol("PIPE_118", x + 2, y + 1, C64Style.Color.BLACK, C64Style.Color.DARKGREY);
  this._backgroundLayer.drawSymbol("PIPE_117", x, y + 2, C64Style.Color.BLACK, C64Style.Color.DARKGREY);
  this._backgroundLayer.drawSymbol("BLOCK", x + 1, y + 2, C64Style.Color.DARKGREY);
  this._backgroundLayer.drawSymbol("PIPE_118", x + 2, y + 2, C64Style.Color.BLACK, C64Style.Color.DARKGREY);
};

RuneTx.GraveyardRenderer.prototype.getX = function() {return this._x;};
RuneTx.GraveyardRenderer.prototype.getY = function() {return this._y;};
RuneTx.GraveyardRenderer.prototype.getWidth = function() {return this._width;};
RuneTx.GraveyardRenderer.prototype.getHeight = function() {return this._height;};
RuneTx.GraveyardRenderer.prototype.getCellX = function() {return this._cellX;};
RuneTx.GraveyardRenderer.prototype.getCellY = function() {return this._cellY;};
RuneTx.GraveyardRenderer.prototype.getCellWidth = function() {return this._cellWidth;};
RuneTx.GraveyardRenderer.prototype.getCellHeight = function() {return this._cellHeight;};

RuneTx.GraveyardRenderer.prototype.disposeRune = function(runeTile, runeElement) {
  this._runeTiles.push(runeTile);
  this._runeElements.push(runeElement);

  // NOTE: although we have just 'shown' this element, because it is removed from the float layer before this, and
  // added here during the same render cycle, it will no longer be dirty and so won't be drawn.
  // One way to mitigate this is to move it into place.
  // Ideally, we would have an event or something that could be utilized to set the element dirty again.
  // Or perhaps don't need a float layer? just keep everything on foregroundLayer?
  runeElement.moveTo(this._graveOffsets[this._currentDiscards].runeX, this._graveOffsets[this._currentDiscards].runeY, 120);
  this._foregroundLayer.addElement(runeElement);
  runeElement._parentLayer = this._foregroundLayer;
  runeElement._canvasContext = this._foregroundLayer.getCanvasContext();
  runeElement.show();
  this._currentDiscards++;
};

RuneTx.GraveyardRenderer.prototype.reset = function() {
  this._currentDiscards = 0;
  this._runeElements.forEach(function(rune) {
    this._foregroundLayer.removeElement(rune);
  }.bind(this));
  this._runeElements = [];
  this._runeTiles = [];
};
