var shaunlusk = shaunlusk || {};

shaunlusk.LocalStorage = {
  _isAvailable : (function() {
    try {
	    var storage = window.localStorage,
			x = '__storage_test__';
  		storage.setItem(x, x);
  		storage.removeItem(x);
  		return true;
	   }
  	catch(e) {
  		return false;
  	}
  })(),

  get : function(key) {
    if (!this._isAvailable) return null;
    return window.localStorage.getItem(key);
  },

  put : function(key, value) {
    if (!this._isAvailable) return;
    if (typeof value !== "string") value = value.toString();
    window.localStorage.setItem(key, value);
  },

  getObject : function(key) {
    if (!this._isAvailable) return null;
    var value = window.localStorage.getItem(key);
    if (value) {
      try {
        value = JSON.parse(value);
      } catch (e) {}
    }
    return value;
  },

  putObject : function(key, value) {
    if (!this._isAvailable) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  },

  isAvailable : function() {return this._isAvailable;},

  remove : function(key) {
    if (!this._isAvailable) return;
    window.localStorage.removeItem(key);
  }
};
