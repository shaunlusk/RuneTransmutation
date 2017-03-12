var C64Style = C64Style || {};

/**
* Animation frame interface used by sprites.
* These are intended to be lightweight, and purpose built for the type of Sprite.
* @interface AnimationFrame
* @see C64Style.ImageSprite
* @see C64Style.PixSprite
*/
C64Style.AnimationFrame = function() {};

/** Return the duration to display this frame.
* @returns {number}
*/
C64Style.AnimationFrame.prototype.getDuration = function() {throw new Error("getDuration Not Implemented on this AnimationFrame");};

/** Base element for displaying animations.<br />
* <b>Extends</b> {@link C64Style.GfxElement} <br />
* <p>Animation is provided through an array of frames.  Each frame will be shown for a specified duration; after that duration, the next frame is shown.
* Animation can be looped, or terminated.</p>
* <p>Animation lifetime of a Sprite can be controlled through the parameters, ttl (Time-to-live), loop (boolean, loop or not), and Loops-to-Live.
* If any of these parameters causes the Sprite's animation to stop, an event, C64Style.EventType.SPRITE_ANIMATION_DONE, will be emitted. </p>
* <p>Note that if the animation stops, the sprite itself will remain on screen; if no longer needed, it must be explicitly hidden or removed.</p>
* <p>This is an abstract class; you must provide an implementation that overrides renderFrame(), and AnimationFrames that describe what should be rendered.</p>
* Current Implementations: {@link C64Style.ImageSprite}, {@link C64Style.PixSprite}
* @constructor
* @param {C64Style.Screen} screenContext The parent screen
* @param {C64Style.GfxLayer} parentLayer The parent layer.
* @param {Object} props The properties for this ImageSprite.<br />
*   from GfxElement:
*   <ul>
*     <li>scaleX - integer - Horizontal scale of this element.  Independent of screen scale.</li>
*     <li>scaleY - integer - Vertical scale of this element.  Independent of screen scale.</li>
*     <li>hidden - boolean - Whether to hide this element.</li>
*     <li>x - number - The X coordinate for this element.</li>
*     <li>y - number - The Y coordinate for this element.</li>
*     <li>zIndex - number - The z-index; elements with higher zIndex values will be drawn later than those with lower values (drawn on top of those with lower values).</li>
*   </ul>
*   for Sprite:
*   <ul>
*     <li>frames - Array - Optional. An array of C64Style.AnimationFrame's. Default: empty array
*     <li>ttl - number - Optional. Time-to-live.  The time (milliseconds) to continue the Sprites animation.  Default: -1 (unlimited time)
*     <li>loop - boolean - Optional.  Whether to loop the animation or not. Default: true.
*     <li>loopsToLive - integer - Optional. If loop is true, the number of loops to execute.  Default: -1 (unlimited loops)
*     <li>freezeFrameIdx - integer - Optional.
*        When animation completes, switch to the frame indicated by the freeze frame index
*        (referring to the index of the frame in the frames array). Default: -1 (don't change frames when animation stops, stay with the final frame)
*   </ul>
* @see C64Style.GfxElement
* @see C64Style.AnimationFrame
* @see C64Style.ImageSprite
* @see C64Style.PixSprite
*/
C64Style.Sprite = function(screenContext, parentLayer, props) {
  props = props || {};
  C64Style.GfxElement.call(this, screenContext, parentLayer, props);

  this._frames = props.frames || [];
  this._ttl = props.ttl || -1;
  this._loop = props.loop === false ? false : true;
  this._loopsToLive = props.loopsToLive || -1;
  this._freezeFrameIdx = props.freezeFrameIdx || -1;

  this._fidx = 0;
  this._currentFrameElapsed = 0;
  this._done = false;
  this._loopCount = 0;
  this._elapsed = 0;

  this._eventListeners[C64Style.EventType.SPRITE_ANIMATION_DONE] = [];
};

C64Style.Sprite.prototype = new C64Style.GfxElement();
C64Style.Sprite.prototype.constructor = C64Style.Sprite;

/** Returns the frames for this Sprite.
* @returns {Array}
*/
C64Style.Sprite.prototype.getFrames = function() {return this._frames;};

/** Sets the frames for this Sprite.
* @param {Array} frames
*/
C64Style.Sprite.prototype.setFrames = function(frames) {this._frames = frames;};

/** Adds a frame to this Sprite's frame array.
* @param {AnimationFrame} frame
*/
C64Style.Sprite.prototype.addFrame = function(frame) {this._frames.push(frame);};

/** Returns this Sprite's Time-to-Live (milliseconds) for animation.
* @returns {number}
*/
C64Style.Sprite.prototype.getTtl = function() {return this._ttl;};

/** Sets this Sprite's Time-to-Live (milliseconds) for animation.
* @param {number} ttl
*/
C64Style.Sprite.prototype.setTtl = function(ttl) {this._ttl = ttl;};

/** Returns whether this Sprite is set to loop.
* @returns {boolean}
*/
C64Style.Sprite.prototype.doesLoop = function() {return this._loop;};

/** Set whether this Sprite should loop.
* @param {boolean} loop
*/
C64Style.Sprite.prototype.setDoLoop = function(loop) {this._loop = loop;};

/** Returns the number of times this Sprite will loop.
* @returns {integer}
*/
C64Style.Sprite.prototype.getLoopsToLive = function() {return this._loopsToLive;};

/** Sets the number of times this Sprite will loop.
* @param {integer} loopsToLive
*/
C64Style.Sprite.prototype.setLoopsToLive = function(loopsToLive) {this._loopsToLive = loopsToLive;};

/** Returns whether this Sprite has completed all animation loops.
* @returns {boolean}
*/
C64Style.Sprite.prototype.isDone = function() {return this._done;};

/** Set whether this Sprite is done.  If done, will immediately emit event: C64Style.EventType.SPRITE_ANIMATION_DONE
* @param {boolean} done
*/
C64Style.Sprite.prototype.setDone = function(done) {
  this._done = done;
  if (done) this.doEndOfAnimation();
};

/** Returns the freeze frame index for this Sprite
* @returns {integer}
*/
C64Style.Sprite.prototype.getFreezeFrameIndex = function() {return this._freezeFrameIdx;};

/** Sets the freeze frame index for this Sprite.
* @param {integer} idx
*/
C64Style.Sprite.prototype.setFreezeFrameIndex = function(idx) {this._freezeFrameIdx = idx;};

/** Returns the current number of times the Sprite has looped.
* @returns {integer}
*/
C64Style.Sprite.prototype.getLoopCount = function() {return this._loopCount;};

/** Returns the current frame index.
* @returns {integer}
*/
C64Style.Sprite.prototype.getCurrentFrameIndex = function() {return this._fidx;};

/** Manually sets the current frame index.
* @param {integer} idx
*/
C64Style.Sprite.prototype.setCurrentFrameIndex = function(idx) {
  this._fidx = idx;
  this.setDirty(true);
};

/** Resets the Sprite state - This will restart the Sprite animation if it stopped.
*/
C64Style.Sprite.prototype.reset = function() {
  this._fidx = 0;
  this._currentFrameElapsed = 0;
  this._done = false;
  this._loopCount = 0;
  this._elapsed = 0;
};

/** Updates the state of the Sprite, if necessary.
* @param {number} time The current time (milliseconds).
* @param {number} diff The difference between the previous render cycle and the current cycle (milliseconds).
*/
C64Style.Sprite.prototype.update = function (time,diff) {
  C64Style.GfxElement.prototype.update.call(this, time, diff);

  if (this._frames.length === 0 || this._done) return null;

  if (this._ttl > -1) {
    this._elapsed += diff;
    if (this._elapsed >= this._ttl){
      this._done = true;
    }
  }

  this._currentFrameElapsed += diff;
  if (this._currentFrameElapsed >= this._frames[this._fidx].getDuration()) {
    while (this._currentFrameElapsed >= this._frames[this._fidx].getDuration()) {
      this._currentFrameElapsed -= this._frames[this._fidx].getDuration();
      this._fidx++;
      if (this._fidx === this._frames.length) {
        this._fidx = 0;
        this._loopCount++;
        if (!this._loop) {
          this._done = true;
          if (this._freezeFrameIdx > -1) this._fidx = this._freezeFrameIdx;
        } else if (this._loopsToLive > -1 && this._loopCount >= this._loopsToLive) {
          this._done = true;
        }
      }
    }
    this.setDirty(true);
  }
  if (this._done) {
    this.doEndOfAnimation();
  }
  if (this.isDirty()) return this;

  return null;
};

/** Render the current frame of the sprite, if the Sprite is dirty.
* @param {number} time The current time (milliseconds).
* @param {number} diff The difference between the previous render cycle and the current cycle (milliseconds).
*/
C64Style.Sprite.prototype.render = function(time,diff) {
  if (!this.isHidden() && this.isDirty()) {
    this.renderFrame(time, diff, this._frames[this._fidx]);
  }

  C64Style.GfxElement.prototype.render.call(this, time, diff);
};

/** Render the specified AnimationFrame.  <br />
* <b>Sub-classes MUST implement this method. </b>
* @abstract
* @param {number} time The current time (milliseconds).
* @param {number} diff The difference between the previous render cycle and the current cycle (milliseconds).
* @param {C64Style.AnimationFrame} frame The frame to be rendered.
*/
C64Style.Sprite.prototype.renderFrame = function(time, diff, frame) {

};

/** @private */
C64Style.Sprite.prototype.doEndOfAnimation = function() {
  var event = new C64Style.Event(
    C64Style.EventType.SPRITE_ANIMATION_DONE,
    {
      element:this
    }
  );
  this.notify(event);
};