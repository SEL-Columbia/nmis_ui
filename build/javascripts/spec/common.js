(function() {

  describe("nmis modules existence", function() {
    it("has modules defined", function() {
      var em, expectDefined, _i, _len, _ref, _results;
      expectDefined = function(x) {
        return expect(x).toBeDefined();
      };
      _ref = NMIS.expected_modules;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        em = _ref[_i];
        _results.push(expectDefined(NMIS[em]));
      }
      return _results;
    });
    return it("can be initted", function() {
      var first_result;
      first_result = NMIS.init(data2, {
        iconSwitcher: false,
        sectors: sectors2
      });
      return expect(first_result).toBeTruthy();
    });
  });

}).call(this);
