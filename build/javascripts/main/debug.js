(function() {

  if (!((window.console != null) && (console.log != null))) {
    (function() {
      var console, length, methods, noop, _results;
      noop = function() {};
      methods = ["assert", "clear", "count", "debug", "dir", "dirxml", "error", "exception", "group", "groupCollapsed", "groupEnd", "info", "log", "markTimeline", "profile", "profileEnd", "markTimeline", "table", "time", "timeEnd", "timeStamp", "trace", "warn"];
      length = methods.length;
      console = window.console = {};
      _results = [];
      while (length--) {
        _results.push(console[methods[length]] = noop);
      }
      return _results;
    })();
  }

  this.log = function() {
    log.history = log.history || [];
    log.history.push(arguments);
    if (window.console) {
      return console.log.apply(console, Array.prototype.slice.call(arguments));
    }
  };

  this.log.error = function() {
    if (window.console) {
      return console.error.apply(console, Array.prototype.slice.call(arguments));
    }
  };

}).call(this);
