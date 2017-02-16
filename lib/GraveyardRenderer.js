var RuneTx = RuneTx || {};

RuneTx.GraveyardRenderer = function(parentLayer, props) {
  props = props || {};
  this._parentLayer = parentLayer;
  this._discardsAllowed = props.discardsAllowed || 3;
  this._x = props.graveOffsets.x;
  this._y = props.graveOffsets.y;
  this._graveOffsets = props.graveOffsets ?
    { x:Math.floor(props.graveOffsets.x  / C64Style.CELLWIDTH),
      y:Math.floor(props.graveOffsets.y  / C64Style.CELLHEIGHT)} :
    {x:1,y:17};
  this._width = (this._graveOffsets.x + 4 * this._discardsAllowed + 2) * C64Style.CELLWIDTH;
  this._height = (this._graveOffsets.y + 8) * C64Style.CELLHEIGHT;
};

RuneTx.GraveyardRenderer.prototype.drawGraveyard = function() {
  var i, x, y;
  for (i = 0; i < this._discardsAllowed; i++) {
    this._drawGrave(this._graveOffsets.x + i * 4 + 2, this._graveOffsets.y + 3);
  }
  // draw dirt
  for (x = this._graveOffsets.x + 1 ; x < this._graveOffsets.x + 4 * this._discardsAllowed + 2; x++) {
    this._parentLayer.drawSymbol("BLOCK", x, this._graveOffsets.y + 6, "#281900");
    this._parentLayer.drawSymbol("BLOCK", x, this._graveOffsets.y + 7, "#281900");
  }

  // draw border
  this._parentLayer.drawSymbol("ROUNDED_CORNER_TOP_LEFT", this._graveOffsets.x, this._graveOffsets.y, C64Style.Color.WHITE);
  this._parentLayer.drawSymbol("ROUNDED_CORNER_TOP_RIGHT", this._graveOffsets.x + 4 * this._discardsAllowed + 2, this._graveOffsets.y, C64Style.Color.WHITE);
  this._parentLayer.drawSymbol("ROUNDED_CORNER_BOTTOM_LEFT", this._graveOffsets.x, this._graveOffsets.y + 8, C64Style.Color.WHITE);
  this._parentLayer.drawSymbol("ROUNDED_CORNER_BOTTOM_RIGHT", this._graveOffsets.x + 4 * this._discardsAllowed + 2, this._graveOffsets.y + 8, C64Style.Color.WHITE);

  for (x = this._graveOffsets.x + 1; x < this._graveOffsets.x + 4 * this._discardsAllowed + 2; x++) {
    this._parentLayer.drawSymbol("BAR_67", x, this._graveOffsets.y, C64Style.Color.WHITE);
    this._parentLayer.drawSymbol("BAR_67", x, this._graveOffsets.y + 8, C64Style.Color.WHITE);
  }
  for (y = this._graveOffsets.y + 1; y < this._graveOffsets.y + 8; y++) {
    this._parentLayer.drawSymbol("|", this._graveOffsets.x, y, C64Style.Color.WHITE);
    this._parentLayer.drawSymbol("|", this._graveOffsets.x + 4 * this._discardsAllowed + 2, y, C64Style.Color.WHITE);
  }

  if (this._discardsAllowed > 1) {
    this._parentLayer.writeText("Graveyard", this._graveOffsets.x + 1, this._graveOffsets.y + 1, C64Style.Color.GREY);
  }
};

RuneTx.GraveyardRenderer.prototype._drawGrave = function(x, y) {
  this._parentLayer.drawSymbol("ROUNDED_CORNER_FILLED_TOP_LEFT", x, y, C64Style.Color.DARKGREY);
  this._parentLayer.drawSymbol("BAR_120", x + 1, y, C64Style.Color.BLACK, C64Style.Color.DARKGREY);
  this._parentLayer.drawSymbol("ROUNDED_CORNER_FILLED_TOP_RIGHT", x + 2, y, C64Style.Color.DARKGREY);
  this._parentLayer.drawSymbol("PIPE_117", x, y + 1, C64Style.Color.BLACK, C64Style.Color.DARKGREY);
  this._parentLayer.drawSymbol("BLOCK", x + 1, y + 1, C64Style.Color.DARKGREY);
  this._parentLayer.drawSymbol("PIPE_118", x + 2, y + 1, C64Style.Color.BLACK, C64Style.Color.DARKGREY);
  this._parentLayer.drawSymbol("PIPE_117", x, y + 2, C64Style.Color.BLACK, C64Style.Color.DARKGREY);
  this._parentLayer.drawSymbol("BLOCK", x + 1, y + 2, C64Style.Color.DARKGREY);
  this._parentLayer.drawSymbol("PIPE_118", x + 2, y + 2, C64Style.Color.BLACK, C64Style.Color.DARKGREY);
};

RuneTx.GraveyardRenderer.prototype.getX = function() {return this._x;};
RuneTx.GraveyardRenderer.prototype.getY = function() {return this._y;};
RuneTx.GraveyardRenderer.prototype.getWidth = function() {return this._width;};
RuneTx.GraveyardRenderer.prototype.getHeight = function() {return this._height;};
