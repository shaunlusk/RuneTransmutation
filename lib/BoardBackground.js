var RuneTx = RuneTx || {};

RuneTx.BoardBackground = function(screenContext, parentLayer, props) {
  props = props || {};
  this._screenContext = screenContext;
  this._parentLayer = parentLayer;
  this._rows = props.rows || 9;
  this._cols = props.cols || 9;
  this._boardOffsetX = props.boardOffsetX ? Math.floor(props.boardOffsetX / C64Style.CELLWIDTH) : 0;
  this._boardOffsetY = props.boardOffsetY ? Math.floor(props.boardOffsetY / C64Style.CELLHEIGHT) : 0;
  this._boardColors = props.boardColors;
  this._discardsAllowed = props.discardsAllowed || 3;
  this._graveOffsets = props.graveOffsets || [{x:3,y:17},{x:7,y:17},{x:11,y:17}];
  this._m = [];
  this._initialize();
};

RuneTx.BoardBackground.prototype._initialize = function() {
  for (var y = 0; y < this._rows; y++) {
    this._m.push([]);
    for (var x = 0; x < this._cols; x++) {
      this._m[y].push(0);
    }
  }
};

RuneTx.BoardBackground.prototype.draw = function() {
  this._drawBoard();
  this._drawGraveyard();
};

RuneTx.BoardBackground.prototype._drawBoard = function() {
  for (var y = 0; y < this._rows; y++) {
    for (var x = 0; x < this._cols; x++) {
      var tx = this._boardOffsetX + x * 2;
      var ty = this._boardOffsetY + y * 2;
      this._parentLayer.drawSymbol("CHECKER_BOARD", tx, ty, this._boardColors[this._m[y][x]]);
      this._parentLayer.drawSymbol("CHECKER_BOARD", tx + 1, ty, this._boardColors[this._m[y][x]]);
      this._parentLayer.drawSymbol("CHECKER_BOARD", tx, ty + 1, this._boardColors[this._m[y][x]]);
      this._parentLayer.drawSymbol("CHECKER_BOARD", tx + 1, ty + 1, this._boardColors[this._m[y][x]]);
    }
  }
};

RuneTx.BoardBackground.prototype._drawGraveyard = function() {
  var i, x, y;
  for (i = 0; i < this._discardsAllowed; i++) {
    this._drawGrave(this._graveOffsets[i].x, this._graveOffsets[i].y);
  }
  // draw dirt
  for (x = this._graveOffsets[0].x - 1; x < this._graveOffsets[this._discardsAllowed - 1].x + 4; x++) {
    this._parentLayer.drawSymbol("BLOCK", x, this._graveOffsets[0].y + 3, "#281900");
    this._parentLayer.drawSymbol("BLOCK", x, this._graveOffsets[0].y + 4, "#281900");
  }

  // draw border
  this._parentLayer.drawSymbol("ROUNDED_CORNER_TOP_LEFT", this._graveOffsets[0].x - 2, this._graveOffsets[0].y - 3, C64Style.Color.WHITE);
  this._parentLayer.drawSymbol("ROUNDED_CORNER_TOP_RIGHT", this._graveOffsets[this._discardsAllowed - 1].x + 4, this._graveOffsets[0].y - 3, C64Style.Color.WHITE);
  this._parentLayer.drawSymbol("ROUNDED_CORNER_BOTTOM_LEFT", this._graveOffsets[0].x - 2,  this._graveOffsets[0].y + 5, C64Style.Color.WHITE);
  this._parentLayer.drawSymbol("ROUNDED_CORNER_BOTTOM_RIGHT", this._graveOffsets[this._discardsAllowed - 1].x + 4,  this._graveOffsets[0].y + 5, C64Style.Color.WHITE);

  for (x = this._graveOffsets[0].x - 1; x < this._graveOffsets[this._discardsAllowed - 1].x + 4; x++) {
    this._parentLayer.drawSymbol("BAR_67", x, this._graveOffsets[0].y - 3, C64Style.Color.WHITE);
    this._parentLayer.drawSymbol("BAR_67", x, this._graveOffsets[0].y + 5, C64Style.Color.WHITE);
  }
  for (y = this._graveOffsets[0].y - 2; y < this._graveOffsets[0].y + 5; y++) {
    this._parentLayer.drawSymbol("|", this._graveOffsets[0].x - 2, y, C64Style.Color.WHITE);
    this._parentLayer.drawSymbol("|", this._graveOffsets[this._discardsAllowed - 1].x + 4, y, C64Style.Color.WHITE);
  }

  this._parentLayer.writeText("Graveyard", this._graveOffsets[0].x, this._graveOffsets[0].y - 2, C64Style.Color.GREY);
};

RuneTx.BoardBackground.prototype._drawGrave = function(x, y) {
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

RuneTx.BoardBackground.prototype.placeRune = function(runeTile, x, y) {
  this._m[y][x]++;
  if (this._m[y][x] === this._boardColors.length) this._m[y][x] = this._boardColors.length - 1;
};
