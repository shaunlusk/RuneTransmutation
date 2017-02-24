var RuneTx = RuneTx || {};

RuneTx.GameSaverKey = {
  "HIGHSCORE":"RuneTx.highScore",
  "SCORE":"RuneTx.score",
  "LEVEL":"RuneTx.level"
};

RuneTx.GameSaver = {
  storage : shaunlusk.LocalStorage,

  saveGame : function(gameEngine) {
    // scores
    this.updateScore(gameEngine.getScore());
    this.updateHighScore(gameEngine.getHighScore());

    // level
    this.updateLevel(gameEngine.getLevel());

    // graveyard state

    // board state
  },
  updateHighScore : function(value) {
    storage.put(RuneTx.GameSaverKey.HIGHSCORE, value);
  },
  updateScore : function(value) {
    storage.put(RuneTx.GameSaverKey.SCORE, value);
  },
  updateLevel : function(value) {
    storage.put(RuneTx.GameSaverKey.LEVEL, value);
  }
};
