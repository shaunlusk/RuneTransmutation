var RuneTx = RuneTx || {};

RuneTx.GameLoader = {
  storage : shaunlusk.LocalStorage,

  getHighScore : function() {
    return this.storage.get(RuneTx.StorageKey.HIGHSCORE) || 0;
  }
};
