# RuneTransmutation
## A simple puzzle game

Requires shaunlusk/C64Style.  Install with bower:

    bower install

The goal of the game is to transform the color of the board.  Each rune placed
  on the board will change the color of the board under the rune.  Early levels
  only require changing the color of each board tile once (from darkgrey to blue), but higher levels
  may require changing the board color two or more times.  Refer to the transmute
  guide underneath the current level indicator.

  The board starts empty, except for a starting rune (ingwaz, a diamond shape).
  Any rune can be placed adjacent to the starting rune.  **__To place a rune, click in a free space adjacent to
  one or more compatible runes that are already on the board.__**

  In order to place a rune, the rune must match either the color or symbol of all adjacent runes.

**__Desktop Machines:__**
  If you have a mouse, the current rune will follow the mouse movement.
  Click to drop the rune on the board at the current mouse location (if adjacent runes are compatible),
  or in the graveyard.

**__Mobile:__**
  The current rune will reside in a box in the top left corner.
  Touch the board next to a color/symbol matching rune on the board to place the rune,
  or touch the graveyard to discard the rune.

**__Clearing Lines:__**
  When an entire row or column is filled with runes, all runes in that row
  or column will disappear, leaving the underlying board color as it was. Use this to your advantage
  to free up space on the board.

**__Graveyard:__**
  If you are unable to place a rune on the board, you may click on the graveyard
  to discard the rune.  Use this option sparingly, as one the graveyard is full, any
  further discards will end the game.

**__Losing:__**
  The game will be lost if a rune is discarded when the graveyard is full,
  or if all runes are cleared from the board, but the board has not been transformed to the target color
  (where it would be impossible to place any further runes).

**__Special Runes:__**
  Two special runes exist: "wild card" runes and "eraser" runes.

**__Wild Card Runes:__**
  These runes (ingwaz, a diamond shape) match any runes regardless of color or shape.
  The starting rune is a wild rune.  Rarely, you may be given a wild rune as your current placeable rune.
  It can be placed next to any other rune or runes, and any subsequent runes may be placed next to it,
  so use it wisely!

**__Eraser Runes:__**
  Rarely, you may be given one of these runes (gebo, an 'X' shape).
  They will destroy any other rune. Place them on top
  of a current rune on the board to destroy that rune, leaving the underlying board color. OR, place the rune in the
  graveyard to remove the last rune placed in the graveyard.

**__Tips:__**
  Each level increases difficulty by adding additional rune symbols, or colors, that can pop up.  Higher
  levels will require each board tile to be transmuted multiple times.  
  Be careful! Many rune symbols are similar (but not identical!) to others.  Likewise, at higher levels
  color shades may be similar as well.

A current version of the game is hosted at https://shaunlusk.github.io/RuneTransmutation
