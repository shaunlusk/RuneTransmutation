var RuneTx = RuneTx || {};

RuneTx.GameStorage = {
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
  },
  updateBoardState : function(board) {
    this.storage.putObject(RuneTx.StorageKey.BOARD_STATE, board.getBoardState());
  },
  updateLevelDefinitionsVersion : function(version) {
    this.storage.put(RuneTx.StorageKey.LEVEL_DEFINITIONS_VERSION, version);
  },
  clearCurrentGame : function() {
    this.storage.remove(RuneTx.StorageKey.SCORE);
    this.storage.remove(RuneTx.StorageKey.LEVEL);
    this.storage.remove(RuneTx.StorageKey.BOARD_STATE);
  },
  _clearAllData : function() {
    this.clearCurrentGame();
    this.storage.remove(RuneTx.StorageKey.LEVEL_DEFINITIONS_VERSION);
    this.storage.remove(RuneTx.StorageKey.HIGHSCORE);
  },

  getScore : function() {
    var score = this.storage.get(RuneTx.StorageKey.SCORE);
    return score ? parseInt(score) : 0;
  },

  getHighScore : function() {
    var highScore = this.storage.get(RuneTx.StorageKey.HIGHSCORE);
    return highScore ? parseInt(highScore) : 0;
  },

  getBoardState : function() {
      return this.storage.getObject(RuneTx.StorageKey.BOARD_STATE);
  },

  getLevel : function() {
    return parseInt(this.storage.get(RuneTx.StorageKey.LEVEL));
  },

  getLevelDefinitionsVersion : function() {
    return this.storage.get(RuneTx.StorageKey.LEVEL_DEFINITIONS_VERSION);
  },

  savedGameExists : function() {
    // return false;
    return this.storage.get(RuneTx.StorageKey.LEVEL_DEFINITIONS_VERSION) !== null;
  },

  _dumpSaveData:function() {
      console.log("Level Definition Version:", this.getLevelDefinitionsVersion());
      console.log("Score:", this.getScore());
      console.log("High Score:", this.getHighScore());
      console.log("Level:", this.getLevel());
      console.log("Board:", this.getBoardState());
  }
};
