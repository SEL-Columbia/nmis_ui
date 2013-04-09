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

  NMIS.VariableSet = (function() {

    function VariableSet(variables) {
      var list, v, vrb, _i, _len;
      log("created new variable set for lga");
      this.variablesById = {};
      list = variables.list;
      for (_i = 0, _len = list.length; _i < _len; _i++) {
        v = list[_i];
        vrb = new Variable(v);
        if (vrb.id) {
          this.variablesById[vrb.id] = vrb;
        }
      }
    }

    VariableSet.prototype.ids = function() {
      var key, val, _ref, _results;
      _ref = this.variablesById;
      _results = [];
      for (key in _ref) {
        val = _ref[key];
        _results.push(key);
      }
      return _results;
    };

    VariableSet.prototype.find = function(id) {
      return this.variablesById[id];
    };

    return VariableSet;

  })();

}).call(this);
