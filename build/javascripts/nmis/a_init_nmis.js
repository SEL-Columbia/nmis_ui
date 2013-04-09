
/*
This file is meant to initialize the NMIS object which includes
independently testable modules.
*/


(function() {
  var error;

  if (this.NMIS == null) {
    this.NMIS = {};
  }

  if (!this.NMIS.settings) {
    this.NMIS.settings = {
      openLayersRoot: "./openlayers/",
      pathToMapIcons: "./images"
    };
  }

  NMIS.expected_modules = ["Tabulation", "clear", "Sectors", "validateData", "data", "FacilityPopup", "Breadcrumb", "IconSwitcher", "MapMgr", "FacilityHover"];

  _.templateSettings = {
    escape: /<{-([\s\S]+?)}>/g,
    evaluate: /<{([\s\S]+?)}>/g,
    interpolate: /<{=([\s\S]+?)}>/g
  };

  (function() {
    /*
      This is the abdomen of the NMIS code. NMIS.init() initializes "data" and "opts"
      which were used a lot in the early versions.
    
      Many modules still access [facility-]data through NMIS.data()
    
      opts has more-or-less been replaced by NMIS.Env()
    */

    var cloneParse, data, opts;
    data = false;
    opts = false;
    NMIS.init = function(_data, _opts) {
      opts = _.extend({
        iconSwitcher: true,
        sectors: false
      }, _opts);
      data = {};
      if (!!opts.sectors) {
        NMIS.loadSectors(opts.sectors);
      }
      NMIS.loadFacilities(_data);
      if (opts.iconSwitcher) {
        NMIS.IconSwitcher.init({
          items: data,
          statusShiftDone: function() {
            var tally;
            tally = {};
            return _.each(this.items, function(item) {
              if (!tally[item.status]) {
                tally[item.status] = 0;
              }
              return tally[item.status]++;
            });
          }
        });
      }
      return true;
    };
    NMIS.loadSectors = function(_sectors, opts) {
      return NMIS.Sectors.init(_sectors, opts);
    };
    cloneParse = function(d) {
      var datum, ll, sslug;
      datum = _.clone(d);
      if (datum.gps === undefined) {
        datum._ll = false;
      } else {
        ll = datum.gps.split(" ");
        datum._ll = [ll[0], ll[1]];
      }
      sslug = datum.sector.toLowerCase();
      datum.sector = NMIS.Sectors.pluck(sslug);
      return datum;
    };
    NMIS.loadFacilities = function(_data, opts) {
      return _.each(_data, function(val, key) {
        var id;
        id = val._id || key;
        return data[id] = cloneParse(val);
      });
    };
    NMIS.clear = function() {
      data = [];
      return NMIS.Sectors.clear();
    };
    NMIS.validateData = function() {
      NMIS.Sectors.validate();
      _(data).each(function(datum) {
        if (datum._uid === undefined) {
          return datum._uid = _.uniqueId("fp");
        }
      });
      _(data).each(function(datum) {
        var llArr;
        if (datum._latlng === undefined && datum.gps !== undefined) {
          llArr = datum.gps.split(" ");
          return datum._latlng = [llArr[0], llArr[1]];
        }
      });
      return true;
    };
    NMIS.activeSector = (function() {
      var currentSector;
      currentSector = false;
      return function(sector) {
        if (sector === undefined) {
          return currentSector;
        } else {
          return currentSector = sector;
        }
      };
    })();
    NMIS.dataObjForSector = function(sectorSlug) {
      var o, sector;
      sector = NMIS.Sectors.pluck(sectorSlug);
      o = {};
      _(data).each(function(datum, id) {
        if (datum.sector.slug === sector.slug) {
          return o[id] = datum;
        }
      });
      return o;
    };
    return NMIS.data = function() {
      return data;
    };
  })();

  (function() {
    /*
      the internal "value" function takes a value and returns a 1-2 item list:
      The second returned item (when present) is a class name that should be added
      to the display element.
    
        examples:
      
        value(null)
        //  ["--", "val-null"]
      
        value(0)
        //  ["0"]
      
        value(true)
        //  ["Yes"]
    */

    var DisplayValue, round_down, value;
    value = function(v, variable) {
      var r;
      if (variable == null) {
        variable = {};
      }
      r = [v];
      if (v === undefined) {
        r = ["&mdash;", "val-undefined"];
      } else if (v === null) {
        r = ["null", "val-null"];
      } else if (v === true) {
        r = ["Yes"];
      } else if (v === false) {
        r = ["No"];
      } else if (!isNaN(+v)) {
        r = [round_down(v, variable.precision)];
      } else if ($.type(v) === "string") {
        r = [NMIS.HackCaps(v)];
      }
      return r;
    };
    /*
      The main function, "NMIS.DisplayValue" receives an element
      and displays the appropriate value.
    */

    DisplayValue = function(d, element) {
      var res;
      res = value(d);
      if (res[1] != null) {
        element.addClass(res[1]);
      }
      element.html(res[0]);
      return element;
    };
    DisplayValue.raw = value;
    DisplayValue.special = function(v, indicator) {
      var classes, o, r;
      r = value(v);
      o = {
        name: indicator.name,
        classes: "",
        value: r[0]
      };
      classes = "";
      if (indicator.display_style === "checkmark_true") {
        classes = "label ";
        if (v === true) {
          classes += "chk-yes";
        } else if (v === false) {
          classes += "chk-no";
        } else {
          classes += "chk-null";
        }
      } else if (indicator.display_style === "checkmark_false") {
        classes = "label ";
        if (v === true) {
          classes += "chk-no";
        } else if (v === false) {
          classes += "chk-yes";
        } else {
          classes += "chk-null";
        }
      }
      o.classes = classes;
      return o;
    };
    DisplayValue.inTdElem = function(facility, indicator, elem) {
      var c, chkN, chkY, oclasses, vv;
      vv = facility[indicator.slug];
      c = value(vv);
      chkY = indicator.display_style === "checkmark_true";
      chkN = indicator.display_style === "checkmark_false";
      if (chkY || chkN) {
        oclasses = "label ";
        if ($.type(vv) === "boolean") {
          if (vv) {
            oclasses += (chkY ? "chk-yes" : "chk-no");
          } else {
            oclasses += (chkY ? "chk-no" : "chk-yes");
          }
        } else {
          oclasses += "chk-null";
        }
        c[0] = $("<span />").addClass(oclasses).html(c[0]);
      }
      return elem.html(c[0]);
    };
    round_down = function(v, decimals) {
      var d;
      if (decimals == null) {
        decimals = 2;
      }
      d = Math.pow(10, decimals);
      return Math.floor(v * d) / d;
    };
    return NMIS.DisplayValue = DisplayValue;
  })();

  error = function(message, opts) {
    if (opts == null) {
      opts = {};
    }
    return log.error(message);
  };

  NMIS.error = error;

}).call(this);
