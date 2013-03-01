(function() {
  var Variable, variablesById;

  variablesById = {};

  Variable = (function() {

    function Variable(v) {
      var id;
      id = v.id || v.slug;
      this.id = id;
      this.name = v.name;
      this.data_type = v.data_type || "float";
      this.precision = v.precision || 2;
    }

    return Variable;

  })();

  NMIS.variables = (function() {
    var clear, find, ids, load;
    clear = function() {};
    load = function(variables) {
      var list, v, vrb, _i, _len, _results;
      list = variables.list;
      _results = [];
      for (_i = 0, _len = list.length; _i < _len; _i++) {
        v = list[_i];
        vrb = new Variable(v);
        if (vrb.id) {
          _results.push(variablesById[vrb.id] = vrb);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    ids = function() {
      var key, val, _results;
      _results = [];
      for (key in variablesById) {
        val = variablesById[key];
        _results.push(key);
      }
      return _results;
    };
    find = function(id) {
      return variablesById[id];
    };
    return {
      load: load,
      clear: clear,
      ids: ids,
      find: find
    };
  })();

}).call(this);
