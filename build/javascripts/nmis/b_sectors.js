(function() {
  var Indicator, Sector, SubSector, all, clear, defaultSector, init, pluck, sectors, slugs, validate,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty;

  sectors = null;

  defaultSector = null;

  Sector = (function() {

    function Sector(d) {
      var changed_keys, k, val;
      changed_keys = "subgroups columns default".split(' ');
      for (k in d) {
        val = d[k];
        this[__indexOf.call(changed_keys, k) >= 0 ? "_" + k : k] = val;
      }
    }

    Sector.prototype.subGroups = function() {
      if (this._subgroups != null) {
        return this._subgroups;
      } else {
        return [];
      }
    };

    Sector.prototype.subSectors = Sector.prototype.subGroups;

    Sector.prototype.getColumns = function() {
      if (!this._columns) {
        return [];
      }
      return this._columns.sort(function(a, b) {
        if (a.display_order > b.display_order) {
          return 1;
        } else {
          return -1;
        }
      });
    };

    Sector.prototype.columnsInSubGroup = function(sgSlug) {
      return _.filter(this.getColumns(), function(sg) {
        return !!_.find(sg.subgroups, function(f) {
          return f === sgSlug;
        });
      });
    };

    Sector.prototype.getIndicators = function() {
      return this._columns || [];
    };

    Sector.prototype.isDefault = function() {
      return !!this._default;
    };

    Sector.prototype.getSubsector = function(query) {
      var ss, ssI, ssL, ssSlug;
      if (!query) {
        return;
      }
      ssSlug = query.slug || query;
      ssI = 0;
      ss = this.subSectors();
      ssL = ss.length;
      while (ssI < ssL) {
        if (ss[ssI].slug === ssSlug) {
          return new SubSector(this, ss[ssI]);
        }
        ssI++;
      }
    };

    Sector.prototype.getIndicator = function(query) {
      var indicator, islug;
      if (!query) {
        return;
      }
      islug = query.slug || query;
      if ((function() {
        var _i, _len, _ref, _results;
        _ref = this.getIndicators();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          indicator = _ref[_i];
          _results.push(indicator.slug === islug);
        }
        return _results;
      }).call(this)) {
        return new Indicator(this, indicator);
      }
    };

    return Sector;

  })();

  SubSector = (function() {

    function SubSector(sector, opts) {
      var k, val;
      this.sector = sector;
      for (k in opts) {
        val = opts[k];
        this[k] = val;
      }
    }

    SubSector.prototype.columns = function() {
      var matches, t, tt, _i, _j, _len, _len1, _ref, _ref1;
      matches = [];
      _ref = this.sector.getColumns();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        t = _ref[_i];
        _ref1 = t.subgroups;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          tt = _ref1[_j];
          if (tt === this.slug) {
            matches.push(t);
          }
        }
      }
      return matches;
    };

    return SubSector;

  })();

  Indicator = (function() {

    function Indicator(sector, opts) {
      var k, val;
      this.sector = sector;
      for (k in opts) {
        if (!__hasProp.call(opts, k)) continue;
        val = opts[k];
        this[k] = val;
      }
    }

    Indicator.prototype.customIconForItem = function(item) {
      return ["" + this.iconify_png_url + item[this.slug] + ".png", 32, 24];
    };

    return Indicator;

  })();

  init = function(_sectors, opts) {
    if (!!opts && !!opts["default"]) {
      defaultSector = new Sector(_.extend(opts["default"], {
        "default": true
      }));
    }
    sectors = _(_sectors).chain().clone().map(function(s) {
      return new Sector(_.extend({}, s));
    }).value();
    return true;
  };

  clear = function() {
    return sectors = [];
  };

  pluck = function(slug) {
    return _(sectors).chain().filter(function(s) {
      return s.slug === slug;
    }).first().value() || defaultSector;
  };

  all = function() {
    return sectors;
  };

  validate = function() {
    var slugs;
    if (!sectors instanceof Array) {
      warn("Sectors must be defined as an array");
    }
    if (sectors.length === 0) {
      warn("Sectors array is empty");
    }
    _.each(sectors, function(sector) {
      if (sector.name === undefined) {
        warn("Sector name must be defined.");
      }
      if (sector.slug === undefined) {
        return warn("Sector slug must be defined.");
      }
    });
    slugs = _(sectors).pluck("slug");
    if (slugs.length !== _(slugs).uniq().length) {
      warn("Sector slugs must not be reused");
    }
    return true;
  };

  slugs = function() {
    return _.pluck(sectors, "slug");
  };

  NMIS.Sectors = {
    init: init,
    pluck: pluck,
    slugs: slugs,
    all: all,
    validate: validate,
    clear: clear
  };

}).call(this);
