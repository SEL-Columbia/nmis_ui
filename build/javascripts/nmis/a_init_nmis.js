
/*
This file is meant to initialize the NMIS object which includes
independently testable modules.
*/


(function() {
  var error;

  if (this.NMIS == null) {
    this.NMIS = {};
  }

  _.templateSettings = {
    escape: /<{-([\s\S]+?)}>/g,
    evaluate: /<{([\s\S]+?)}>/g,
    interpolate: /<{=([\s\S]+?)}>/g
  };

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
    value = function(v) {
      var r;
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
        r = [round_down(v)];
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
