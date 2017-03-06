/** @namespace */
var C64Style = C64Style || {};

/** The Screen is the overriding container for all C64Style components.
* The Screen orchestrates updating and rendering its layers, propagates
* mouse events down to the layers, and notifies event listeners when events occur.
* @constructor
* @param {HTMLElement} targetDiv The target HTMLElement into which the screen and its layers will be built.
* @param {Object} config Supported configuration properties:
* <ul>
*   <li>scaleX - integer - the horizontal scale of the screen.  Default: 1</li>
*   <li>scaleY - integer - the horizontal scale of the screen.  Default: 1</li>
*   <li>cols - integer - The number of columns for the screen.  Width will be sized accordingly: cols * {@link C64Style.CELLWIDTH}.  Default: 40</li>
*   <li>rows - integer - The number of rows for the screen.  Height will be sized accordingly: rows * {@link C64Style.CELLHEIGHT}.  Default: 25</li>
*   <li>fpsElem - HTMLElement - Element to write Frames-per-second information to. </li>
*   <li>backgroundColor - Color - The color to set the screen background to. Default: C64Style.Color.BLUE</li>
*   <li>borderColor - Color - The color to set the screen border to. Default: C64Style.Color.LIGHTBLUE</li>
*   <li>borderSize - integer - The borderSize of the screen, in pixels. Default: 20</li>
* </ul>
*/
C64Style.Screen = function(targetDiv, config) {
  this._targetDiv = targetDiv;
  this._config = config || {};
  this._scaleX = this._config.scaleX || 1;
  this._scaleY = this._config.scaleY || 1;
  this._cols = this._config.cols || 40;
  this._rows = this._config.rows || 25;
  this._width = this._cols * this._scaleX * C64Style.CELLWIDTH;
  this._height = this._rows * this._scaleY * C64Style.CELLHEIGHT;
  this._fpsElem = this._config.fpsElem || null;
  this._showFps = true;
  this._avgTime = 0;
  this._last = 0;
  this._mouseX = -1;
  this._mouseY = -1;
  this._mouseRow = -1;
  this._mouseCol = -1;
  this._mouseMoved = false;
  this._paused = false;
  this._unpaused = false;

  this._backgroundColor = this._config.backgroundColor || C64Style.Color.BLUE;
  this._borderColor = this._config.borderColor || C64Style.Color.LIGHTBLUE;
  this._borderSize = this._config.borderSize || 20;

  this._fpsMonitorArray = [];
  this._fpsMonitorIndex = 0;

  this._layers = [];

  this._eventListeners = {
    "ELEMENT_MOVED" : [],
    "BEFORE_RENDER" : [],
    "AFTER_RENDER" : [],
    "ELEMENT_STARTED_MOVING" : [],
    "ELEMENT_STOPPED_MOVING" : [],
    "ELEMENT_COLLISION" : [],
    "ELEMENT_HIT_LEFT_EDGE" : [],
    "ELEMENT_HIT_RIGHT_EDGE" : [],
    "ELEMENT_HIT_TOP_EDGE" : [],
    "ELEMENT_HIT_BOTTOM_EDGE" : [],
    "SCREEN_PAUSED" : [],
    "SCREEN_RESUMED" : [],
    "MOUSE_MOVE" : [],
    "MOUSE_DOWN" : [],
    "MOUSE_UP" : [],
    "MOUSE_ENTER_ELEMENT" : [],
    "MOUSE_EXIT_ELEMENT" : [],
    "MOUSE_MOVE_OVER_ELEMENT" : [],
    "MOUSE_DOWN_ON_ELEMENT" : [],
    "MOUSE_UP_ON_ELEMENT" : [],
    "SPRITE_ANIMATION_DONE" : []
  };
};

C64Style.Screen.document = window.document;

/** Setup the screen on the page. Must be called prior to rendering.
*/
C64Style.Screen.prototype.initialize = function() {
  this._prepareDiv();
  this._setupEventListeners();
};

/** @private */
C64Style.Screen.prototype._prepareDiv = function() {
  this._targetDiv.style.width = this._width;
  this._targetDiv.style.height = this._height;
  this._targetDiv.style.backgroundColor = this._backgroundColor;
  this._targetDiv.style.border = this._borderSize + "px solid " + this._borderColor;
};

/** @private */
C64Style.Screen.prototype._setupEventListeners = function() {
  this._targetDiv.addEventListener("mouseup",this.handleMouseEvent.bind(this), true);
  this._targetDiv.addEventListener("mousedown",this.handleMouseEvent.bind(this), true);
  this._targetDiv.addEventListener("mousemove",this.handleMouseMoveEvent.bind(this), true);
  C64Style.Screen.document.addEventListener("visibilitychange", this.handleVisibilityChange.bind(this), false);
};

/** @private */
C64Style.Screen.prototype.handleVisibilityChange = function() {
  this._tabNotVisible = document.hidden;
  if (!this._tabNotVisible && !this._paused) {
    this._unpaused = true;
    requestAnimationFrame(this.render.bind(this));
  }
};

/** Add an event listener to the document.
* @param {string} event The type of event.
* @param {Function} listener The function to call when the event occurs.
*/
C64Style.Screen.prototype.addEventListener = function(event, listener) {
  C64Style.Screen.document.addEventListener(event,listener);
};

/** Set the background color.
* @param {string} color Any valid CSS color string, or C64Style.Color value.
*/
C64Style.Screen.prototype.setBackgroundColor = function(color) {
  this._backgroundColor = color;
  this._targetDiv.style.backgroundColor = color;
};

/** Return the current backgroundColor.
* @returns {string}
*/
C64Style.Screen.prototype.getBackgroundColor = function(color) {
  return this._backgroundColor;
};

/** Set the border color.
* @param {string} color Any valid CSS color string, or C64Style.Color value.
*/
C64Style.Screen.prototype.setBorderColor = function(color) {
  this._borderColor = color;
  this._targetDiv.style.border = this._borderSize + "px solid " + color;
};

/** Return the current border color.
* @returns {string}
*/
C64Style.Screen.prototype.getBorderColor = function() {
  return this._borderColor;
};

/** Set the border size.
* @param {integer} size The size for the border; will be interpretted as pixels.
*/
C64Style.Screen.prototype.setBorderSize = function(size) {
  this._borderSize = size;
  this._targetDiv.style.border = size + "px solid " + this._borderColor;
};

/** Return the current border size, in pixels.
* @returns {integer}
*/
C64Style.Screen.prototype.getBorderSize = function() {
  return this._borderSize;
};

/** Return the width.
* @returns {integer}
*/
C64Style.Screen.prototype.getWidth = function() {return this._width;};

/** Return the height.
* @returns {integer}
*/
C64Style.Screen.prototype.getHeight = function() {return this._height;};

/** Return the number of roww.
* @returns {integer}
*/
C64Style.Screen.prototype.getRows = function() {return this._rows;};

/** Return the number of columns.
* @returns {integer}
*/
C64Style.Screen.prototype.getCols = function() {return this._cols;};

/** Return the x-scale.
* @returns {integer}
*/
C64Style.Screen.prototype.getScaleX = function() {return this._scaleX;};

/** Return the y-scale.
* @returns {integer}
*/
C64Style.Screen.prototype.getScaleY = function() {return this._scaleY;};

/** Return the current x coordinate of the mouse.
* @returns {integer}
*/
C64Style.Screen.prototype.getMouseX = function() {return this._mouseX;};

/** Return the current y coordinate of the mouse.
* @returns {integer}
*/
C64Style.Screen.prototype.getMouseY = function() {return this._mouseY;};

/** Return the current row coordinate of the mouse.
* @returns {integer}
*/
C64Style.Screen.prototype.getMouseRow = function() {return this._mouseRow;};

/** Return the current column coordinate of the mouse.
* @returns {integer}
*/
C64Style.Screen.prototype.getMouseCol = function() {return this._mouseCol;};

/** Create a new {@link C64Style.Layer} and add it to this screen.  Layers will be rendered in FIFO order,
* so layers added later will be drawn on top of layers added earlier.
* @param {string} type The type of layer to add - either "TextLayer" or "GfxLayer"
* @see C64Style.Layer
* @see C64Style.TextLayer
* @see C64Style.GfxLayer
*/
C64Style.Screen.prototype.createLayer = function(type) {
  var canvas = document.createElement("CANVAS");
  this._targetDiv.appendChild(canvas);
  canvas.width = this._width;
  canvas.height = this._height;
  canvas.style.position = "absolute";
  var props = {
    width: this.getWidth(),
    height: this.getHeight()
  };

  var layer;
  switch(type) {
    case "TextLayer":
      layer = new C64Style.TextLayer(this, canvas, props);
      break;
    case "GfxLayer":
      layer = new C64Style.GfxLayer(this, canvas, props);
      break;
    default:
      throw new Error("Unrecognized Layer type:" + type);
  }

  this.addLayer(layer);
  return layer;
};

/** Add a new  {@link C64Style.Layer} to this screen.  The preferred method of adding layers
* is via the createLayer() method, but this will also work.
* Layers will be rendered in FIFO order,
* so layers added later will be drawn on top of layers added earlier.
* @param {C64Style.Layer} layer The layer to add to the screen.
* @see C64Style.Layer
* @see C64Style.TextLayer
* @see C64Style.GfxLayer
*/
C64Style.Screen.prototype.addLayer = function(layer) {
  this._layers.push(layer);
};

/** Return the array of layers.
* @returns {Array}
*/
C64Style.Screen.prototype.getLayers = function() {
  return this._layers;
};

/** Pause or unpause the screen.
* @param {boolean} boolean true = pause the screen; false = unpause the screen.
*/
C64Style.Screen.prototype.setPaused = function(boolean) {
  if (this._paused && !boolean) this._unpaused = true;
  this._paused = boolean;
  this.notify(
    new C64Style.Event(
      this._paused ? C64Style.EventType.SCREEN_PAUSED : C64Style.EventType.SCREEN_RESUMED
    )
  );
  if (!this._paused) requestAnimationFrame(this.render.bind(this));
};

/** Return whether the screen is paused
* @returns {boolean}
*/
C64Style.Screen.prototype.isPaused = function() {return this._paused;};

/** Add an event handler to the screen.
* @param {C64Style.EventType} eventType The type of the event.
* @param {Function} callback The handler to call when the specified event type occurs
*/
C64Style.Screen.prototype.on = function(eventType, callback) {
  if (!this._eventListeners[eventType]) {
    this._eventListeners[eventType] = [];
  }
  this._eventListeners[eventType].push(callback);
};

/** Clear all event handlers for a given event type.
* @param {C64Style.EventType} eventType The type of the event.
*/
C64Style.Screen.prototype.clearEventHandlers = function(eventType) {
  if (!this._eventListeners[eventType]) {
    throw new Error("Unknown event type:" + eventType);
  }
  this._eventListeners[eventType] = [];
};

/** Notify event handlers when an event has occured.
* @param {C64Style.Event} event The event that occured
*/
C64Style.Screen.prototype.notify = function(event) {
  if (!this._eventListeners[event.type]) {
    throw new Error("Unknown event type:" + event.type);
  }
  for (var i = 0; i < this._eventListeners[event.type].length; i++) {
    if (C64Style.isFunction(this._eventListeners[event.type][i])) this._eventListeners[event.type][i](event);
  }
};

/** Render the screen and all layers.
* @param {number} time The current time in milliseconds.
*/
C64Style.Screen.prototype.render = function(time) {
  time = time || 1;
  if (this._paused || this._tabNotVisible) return;
  if (this._unpaused) {
    this._unpaused = false;
    this._last = Math.floor(time) - 1;
  }
  time = Math.floor(time);
  var elapsed = Date.now();
  var diff = time - this._last;
  this._last = time;

  if (this._mouseMoved) {
    this._handleMouseMoveEvent(time);
  }

  this.notify(
    new C64Style.Event(C64Style.EventType.BEFORE_RENDER, {diff:diff}, time)
  );

  this._updateFps(diff);

  this._update(time,diff);
  this._render(time,diff);

  this.notify(
    new C64Style.Event(C64Style.EventType.AFTER_RENDER,  {diff:diff}, time)
  );

  elapsed = Date.now() - elapsed;
  if (this._showFps && this._fpsElem && this._fpsMonitorIndex === 0)
    this._fpsElem.innerHTML += "<br />Avg MS per frame: " + elapsed;

  requestAnimationFrame(this.render.bind(this));
};

/** @private */
C64Style.Screen.prototype._handleMouseMoveEvent = function(time) {
  var event = new C64Style.Event(
    C64Style.EventType.MOUSE_MOVE,
    {
      x : this.getUnScaledX(this._mouseX),
      y : this.getUnScaledX(this._mouseY),
      row : this._mouseRow,
      col : this._mouseCol,
      scaledX : this._mouseX,
      scaledY : this._mouseY,
    },
    time
  );
  this.notify(event);
  this.propagateMouseEventThroughLayers(event);
  this._mouseMoved = false;
};

/** @private */
C64Style.Screen.prototype._updateFps = function(diff) {
  if (this._showFps) {
    var fps = Math.floor(1000 / diff);
    if (this._fpsMonitorArray.length < 30){
      this._fpsMonitorArray.push(fps);
    } else {
      this._fpsMonitorArray[this._fpsMonitorIndex] = fps;
    }
    this._fpsMonitorIndex++;
    if (this._fpsMonitorIndex >= 30) this._fpsMonitorIndex = 0;

    var fpsa = 1;
    for (var i = 0; i < this._fpsMonitorArray.length; i++){
      fpsa += this._fpsMonitorArray[i] / 30;
    }
    if (this._fpsElem && this._fpsMonitorIndex === 0)
      this._fpsElem.innerHTML = "fps: " + Math.floor(fpsa);
  }
};

/** @private */
C64Style.Screen.prototype._update = function (time,diff) {
  for (var i = 0; i < this._layers.length; i++) {
    this._layers[i].update(time,diff);
  }
};

/** @private */
C64Style.Screen.prototype._render = function(time,diff) {
  for (var i = 0; i < this._layers.length; i++) {
    this._layers[i].render(time,diff);
  }
};

/** Handle a mouse move event.  This does not directly propagate the event to
* layers and elements; rather it will flag that a mouse movement has occured, and records its current location.
* The event will be propagated during the next render cycle.
* @param {Event} e The mouse event
*/
C64Style.Screen.prototype.handleMouseMoveEvent = function(e) {
  if (this._paused) return false;
  this._mouseMoved = true;
  var x = this.getXFromMouseEvent(e);
  var y = this.getYFromMouseEvent(e);

  if (x < 0 || x >= this._width || y < 0 || y >= this._height) {
    this._mouseX = -1;
    this._mouseY = -1;
    this._mouseRow = -1;
    this._mouseCol = -1;
    return false;
  }
  var row = this.getRowFromMouseEvent(e);
  var col = this.getColFromMouseEvent(e);
  this._mouseX = x;
  this._mouseY = y;
  this._mouseRow = row;
  this._mouseCol = col;
};

/** Handles mouse up and mouse down events; notifies any local handlers and propagates the event to all layers.
* @param {Event} e The mouse event
*/
C64Style.Screen.prototype.handleMouseEvent = function(e) {
  if (this._paused) return false;
  var scaledX = this.getXFromMouseEvent(e);
  var scaledY = this.getYFromMouseEvent(e);

  if (scaledX < 0 || scaledX >= this._width || scaledY < 0 || scaledY >= this._height) {
    return false;
  }
  var row = this.getRowFromMouseEvent(e);
  var col = this.getColFromMouseEvent(e);
  var x = this.getUnScaledX(scaledX);
  var y = this.getUnScaledY(scaledY);

  var type = e.type === "mouseup" ? C64Style.EventType.MOUSE_UP : C64Style.EventType.MOUSE_DOWN;
  var event = new C64Style.Event(
    type,
    {
      x : x,
      y : y,
      row : row,
      col : col,
      baseEvent : e,
      scaledX : scaledX,
      scaledY : scaledY
    });
  this.notify(event);

  // propagate through layers
  this.propagateMouseEventThroughLayers(event);

  if (e.button === 1) return false;
};

/** @private */
C64Style.Screen.prototype.propagateMouseEventThroughLayers = function(event) {
  for (var i = 0; i < this._layers.length; i++) {
    this._layers[i].handleMouseEvent(event);
  }
};

/** Return the x coordinate from a mouse event.  Accounts for screen position.
* @param {Event} e Mouse Event
*/
C64Style.Screen.prototype.getXFromMouseEvent = function(e) {
  return (e.pageX - (this._targetDiv.offsetLeft + this._borderSize));
};

/** Return the y coordinate from a mouse event.  Accounts for screen position.
* @param {Event} e Mouse Event
*/
C64Style.Screen.prototype.getYFromMouseEvent = function(e) {
  return (e.pageY - (this._targetDiv.offsetTop + this._borderSize));
};

/** Return an x value with scale removed.
* @param {Event} e Mouse Event
*/
C64Style.Screen.prototype.getUnScaledX = function(x) {
  return Math.floor(x / this._scaleX);
};

/** Return an x value with scale removed.
* @param {Event} e Mouse Event
*/
C64Style.Screen.prototype.getUnScaledY = function(y) {
  return Math.floor(y / this._scaleY);
};

/** Return the column coordinate from a mouse event.  Accounts for screen position.
* @param {Event} e Mouse Event
*/
C64Style.Screen.prototype.getColFromMouseEvent = function(e) {
  return Math.floor(this.getXFromMouseEvent(e) / (C64Style.CELLWIDTH * this._scaleX));
};

/** Return the row coordinate from a mouse event.  Accounts for screen position.
* @param {Event} e Mouse Event
*/
C64Style.Screen.prototype.getRowFromMouseEvent = function(e) {
  return Math.floor(this.getYFromMouseEvent(e) / (C64Style.CELLHEIGHT * this._scaleY));
};