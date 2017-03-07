var RuneTx = RuneTx || {};

RuneTx.GameStorage = {
  storage : shaunlusk.LocalStorage,

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
  updateDiscardedRunes : function(runes) {
    this.storage.putObject(RuneTx.StorageKey.DISCARDED_RUNES, runes);
  },
  updateBetweenLevels : function(bool) {
    this.storage.put(RuneTx.StorageKey.BETWEEN_LEVELS, bool);
  },
  clearCurrentGame : function() {
    this.storage.remove(RuneTx.StorageKey.SCORE);
    this.storage.remove(RuneTx.StorageKey.LEVEL);
    this.storage.remove(RuneTx.StorageKey.BOARD_STATE);
    this.storage.remove(RuneTx.StorageKey.DISCARDED_RUNES);
    this.storage.remove(RuneTx.StorageKey.BETWEEN_LEVELS);
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
    var level = this.storage.get(RuneTx.StorageKey.LEVEL);
    return level ? parseInt(level) : 0;
  },

  getLevelDefinitionsVersion : function() {
    return this.storage.get(RuneTx.StorageKey.LEVEL_DEFINITIONS_VERSION);
  },

  getDiscardedRunes : function() {
    return this.storage.getObject(RuneTx.StorageKey.DISCARDED_RUNES);
  },

  getBetweenLevels : function() {
    return this.storage.get(RuneTx.StorageKey.BETWEEN_LEVELS) === "true" ? true : false;
  },

  savedGameExists : function() {
    // return false;
    return this.storage.get(RuneTx.StorageKey.BOARD_STATE) !== null;
  },

  _dumpSaveData:function() {
      console.log("Level Definition Version:", this.getLevelDefinitionsVersion());
      console.log("Score:", this.getScore());
      console.log("High Score:", this.getHighScore());
      console.log("Level:", this.getLevel());
      console.log("Board:", this.getBoardState());
      console.log("Discarded Runes:", this.getDiscardedRunes());
  }
};
