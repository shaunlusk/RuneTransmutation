var RuneTx = RuneTx || {};

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
    this.storage.put(RuneTx.StorageKey.HIGHSCORE, value);
  },
  updateScore : function(value) {
    this.storage.put(RuneTx.StorageKey.SCORE, value);
  },
  updateLevel : function(value) {
    this.storage.put(RuneTx.StorageKey.LEVEL, value);
  }
};
