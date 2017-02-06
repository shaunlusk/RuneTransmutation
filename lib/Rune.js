var RuneTx = RuneTx || {};

RuneTx.Rune = function(name, pixArray) {
  this._name = name;
  this._pixArray = pixArray;
};

RuneTx.Rune.getName = function() {return this._name;};
RuneTx.Rune.getPixArray = function() {return this._pixArray;};
