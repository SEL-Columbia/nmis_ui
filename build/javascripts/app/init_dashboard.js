(function() {
  var overviewObj, url_root, wElems;

  $.when_O = function(arg_O) {
    /*
      When handling multiple $.Defferreds,
    
      $.when(...) receives a list and then passes
      a list of arguments.
    
      This mini plugin receives an object of named deferreds
      and resolves with an object with the results.
    
      Example:
    
      var shows = {
        "simpsons": $.getJSON(simpsons_shows),
        "southPark": $.getJSON(southpark_shows)
      };
    
      $.when_O(shows).done(function(showResults){
        var showNames = [];
        if(showResults.familyGuy) showNames.push("Family Guy")
        if(showResults.simpsons) showNames.push("Simpsons")
        if(showResults.southPark) showNames.push("South Park")
    
        console.log(showNames);
        //  ["Simpsons", "South Park"]
      });
    */

    var defferred, finished, key, promises, val;
    defferred = new $.Deferred;
    promises = [];
    finished = {};
    for (key in arg_O) {
      val = arg_O[key];
      promises.push(val);
      finished[key] = false;
    }
    $.when.apply(null, promises).done(function() {
      var results, _results;
      results = {};
      _results = [];
      for (key in arg_O) {
        val = arg_O[key];
        /*
              in $.getJSON, for example, I want to access the parsedJSON object so
              I don't want to finish everything until all success callback have been
              called.
        */

        _results.push((function() {
          var local_key;
          local_key = key;
          return val.done(function(result) {
            var completed, fin, k;
            finished[local_key] = true;
            results[local_key] = result;
            /*
                      Continue iff all are finished.
            */

            completed = true;
            for (k in finished) {
              fin = finished[k];
              if (!fin) {
                completed = false;
              }
            }
            if (completed) {
              return defferred.resolve(results);
            }
          });
        })());
      }
      return _results;
    });
    return defferred;
  };

  _.templateSettings = {
    escape: /<{-([\s\S]+?)}>/g,
    evaluate: /<{([\s\S]+?)}>/g,
    interpolate: /<{=([\s\S]+?)}>/g
  };

  url_root = "" + window.location.pathname;

  if (!!~url_root.indexOf("index.html")) {
    url_root = url_root.replace("index.html", "");
  }

  NMIS.url_root = url_root;

  this.dashboard = $.sammy("body", function() {
    this.get("^$", function() {
      return dashboard.setLocation("" + url_root + "#/state/lga");
    });
    return this.get("" + url_root + "#/:state/:lga/?", function() {
      return dashboard.setLocation("" + url_root + "#/" + this.params.state + "/" + this.params.lga + "/summary/");
    });
  });

  this.dashboard.get("" + url_root + "#data=(.*)", function() {
    var data_src;
    data_src = this.params.splat[0];
    $.cookie("data-source", data_src);
    return this.redirect("" + url_root);
  });

  $(".page-header").remove();

  NMIS.DisplayWindow.init(".content", {
    offsetElems: ".topbar .fill .container",
    sizeCookie: true,
    callbacks: {
      resize: [
        function(animate, sizeName) {
          switch (sizeName) {
            case "full":
              return NMIS.DisplayWindow.showTitle("tables");
            case "middle":
              return NMIS.DisplayWindow.showTitle("bar");
            case "minimized":
              return NMIS.DisplayWindow.showTitle("bar");
          }
        }
      ]
    }
  });

  overviewObj = {
    name: "Overview",
    slug: "overview"
  };

  NMIS.init();

  wElems = NMIS.DisplayWindow.getElems();

  NMIS._wElems = wElems;

  NMIS.LocalNav.init(wElems.wrap, {
    sections: [[["mode:summary", "LGA Summary", "#"], ["mode:facilities", "Facility Detail", "#"]], [["sector:overview", "Overview", "#"], ["sector:health", "Health", "#"], ["sector:education", "Education", "#"], ["sector:water", "Water", "#"]]]
  });

  NMIS.urlFor = function(_o) {
    var o, uu, _pushAsDefined;
    o = _.extend({
      root: "" + NMIS.url_root + "#",
      mode: "summary"
    }, _o);
    if (!o.lga || !o.state) {
      return "" + NMIS.url_root + "#?error";
    }
    uu = (_pushAsDefined = function(obj, keyList) {
      var arr, i, item, key, l;
      key = void 0;
      i = void 0;
      l = void 0;
      arr = [];
      item = void 0;
      i = 0;
      l = keyList.length;
      while (i < l) {
        key = keyList[i];
        item = obj[key];
        if (!!item) {
          if (item === false) {
            return ["/error"];
          }
          arr.push((item.slug === undefined ? item : item.slug));
        } else {
          return arr;
        }
        i++;
      }
      return arr;
    })(o, ["root", "state", "lga", "mode", "sector", "subsector", "indicator"]).join("/");
    if (!!o.facilityId) {
      uu += "?facility=" + o.facilityId;
    }
    return uu;
  };

  NMIS._prepBreadcrumbValues = function(e, keys, env) {
    var arr, i, key, l, name, val;
    i = void 0;
    l = void 0;
    key = void 0;
    val = void 0;
    name = void 0;
    arr = [];
    i = 0;
    l = keys.length;
    while (i < l) {
      key = keys[i];
      val = e[key];
      if (val !== undefined) {
        name = val.name || val.slug || val;
        env[key] = val;
        arr.push([name, NMIS.urlFor(env)]);
      } else {
        return arr;
      }
      i++;
    }
    return arr;
  };

}).call(this);
