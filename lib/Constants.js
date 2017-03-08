var RuneTx = RuneTx || {};

RuneTx.EventType = {
  "PLACE_RUNE":"PLACE_RUNE",
  "LINE_CLEAR":"LINE_CLEAR",
  "LEVEL_CLEAR":"LEVEL_CLEAR",
  "UPDATE_LEVEL":"UPDATE_LEVEL",
  "UPDATE_SCORE":"UPDATE_SCORE",
  "UPDATE_HIGHSCORE":"UPDATE_HIGHSCORE",
  "GAME_OVER":"GAME_OVER"
};

RuneTx.StorageKey = {
  "HIGHSCORE":"RuneTx.highScore",
  "SCORE":"RuneTx.score",
  "LEVEL":"RuneTx.level",
  "BOARD_STATE":"RuneTx.boardState",
  "LEVEL_DEFINITIONS_VERSION":"RuneTx.levelDefinitionsVersion",
  "DISCARDED_RUNES":"RuneTx.discardedRunes",
  "BETWEEN_LEVELS":"RuneTx.betweenLevels",
  "CURRENT_RUNE":"RuneTx.currentRune"
};
