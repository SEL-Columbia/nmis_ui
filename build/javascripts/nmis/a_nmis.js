
/*
I'm moving modules into this file wrapped in "do ->" (self-executing functions)
until they play well together (and I ensure they don't over-depend on other modules.)
..doing this instead of splitting them into individual files.
*/


(function() {

  (function() {
    var Breadcrumb;
    Breadcrumb = (function() {
      var clear, context, draw, elem, init, levels, setLevel, setLevels;
      levels = [];
      elem = false;
      context = {};
      init = function(_elem, opts) {
        if (opts == null) {
          opts = {};
        }
        elem = $(_elem).eq(0);
        if (opts.draw == null) {
          opts.draw = true;
        }
        if (opts.levels != null) {
          setLevels(opts.levels, false);
        }
        if (!!opts.draw) {
          return draw();
        }
      };
      clear = function() {
        if (elem) {
          elem.empty();
        }
        return levels = [];
      };
      setLevels = function(new_levels, needs_draw) {
        var i, level, _i, _len;
        if (new_levels == null) {
          new_levels = [];
        }
        if (needs_draw == null) {
          needs_draw = true;
        }
        for (i = _i = 0, _len = new_levels.length; _i < _len; i = ++_i) {
          level = new_levels[i];
          if (level != null) {
            levels[i] = level;
          }
        }
        if (needs_draw) {
          draw();
        }
        return context;
      };
      setLevel = function(ln, d) {
        levels[ln] = d;
        return context;
      };
      draw = function() {
        var a, fn, href, i, splitter, txt, _i, _len, _ref;
        if (elem == null) {
          throw new Error("Breadcrumb: elem is undefined");
        }
        elem.empty();
        splitter = $("<span>").text("/");
        for (i = _i = 0, _len = levels.length; _i < _len; i = ++_i) {
          _ref = levels[i], txt = _ref[0], href = _ref[1], fn = _ref[2];
          if (i !== 0) {
            splitter.clone().appendTo(elem);
          }
          a = $("<a>").text(txt).attr("href", href);
          if (fn != null) {
            a.click(fn);
          }
          a.appendTo(elem);
        }
        return elem;
      };
      return {
        init: init,
        setLevels: setLevels,
        setLevel: setLevel,
        draw: draw,
        _levels: function() {
          return levels;
        },
        clear: clear
      };
    })();
    return NMIS.Breadcrumb = Breadcrumb;
  })();

  (function() {
    return NMIS.S3Photos = (function() {
      var s3Root;
      s3Root = "http://nmisstatic.s3.amazonaws.com/facimg";
      return {
        url: function(s3id, size) {
          var code, id, _ref;
          if (size == null) {
            size = 0;
          }
          _ref = s3id.split(":"), code = _ref[0], id = _ref[1];
          return "" + s3Root + "/" + code + "/" + size + "/" + id + ".jpg";
        }
      };
    })();
  })();

  (function() {
    var capitalize;
    capitalize = function(str) {
      if (!str) {
        return "";
      } else {
        return str[0].toUpperCase() + str.slice(1);
      }
    };
    return NMIS.HackCaps = function(str) {
      var output, section, _i, _len, _ref;
      if ($.type(str) === "string") {
        output = [];
        _ref = str.split("_");
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          section = _ref[_i];
          output.push(capitalize(section));
        }
        return output.join(' ');
      } else {
        return str;
      }
    };
  })();

  (function() {
    return NMIS.MapMgr = (function() {
      var addLoadCallback, callbackStr, clear, elem, fakse, finished, init, isLoaded, loadCallbacks, loaded, mapLoadFn, mapboxLayer, opts, started;
      opts = {};
      started = false;
      finished = false;
      callbackStr = "NMIS.MapMgr.loaded";
      elem = false;
      fakse = false;
      loadCallbacks = [];
      mapLoadFn = function() {
        return $.getScript("http://maps.googleapis.com/maps/api/js?sensor=false&callback=" + callbackStr);
      };
      addLoadCallback = function(cb) {
        return loadCallbacks.push(cb);
      };
      isLoaded = function() {
        return finished;
      };
      clear = function() {
        return started = finished = false;
      };
      loaded = function() {
        var cb, _i, _len;
        for (_i = 0, _len = loadCallbacks.length; _i < _len; _i++) {
          cb = loadCallbacks[_i];
          cb.call(opts);
        }
        loadCallbacks = [];
        return finished = true;
      };
      init = function(_opts) {
        var fake;
        if (started) {
          return true;
        }
        if (_opts !== undefined) {
          opts = _.extend({
            launch: true,
            fake: false,
            fakeDelay: 3000,
            mapLoadFn: false,
            elem: "body",
            defaultMapType: "SATELLITE",
            loadCallbacks: []
          }, _opts);
          loadCallbacks = Array.prototype.concat.apply(loadCallbacks, opts.loadCallbacks);
          fake = !!opts.fake;
          if (opts.mapLoadFn) {
            mapLoadFn = opts.mapLoadFn;
          }
        } else {
          fake = false;
        }
        started = true;
        if (!fake) {
          mapLoadFn();
        } else {
          _.delay(loaded, opts.fakeDelay);
        }
        return started;
      };
      mapboxLayer = function(options) {
        if (typeof google === "undefined") {
          throw new Error("Google Maps has not yet loaded into the page.");
        }
        return new google.maps.ImageMapType({
          getTileUrl: function(coord, z) {
            return "http://b.tiles.mapbox.com/v3/modilabs." + options.tileset + "/" + z + "/" + coord.x + "/" + coord.y + ".png?updated=1331159407403";
          },
          name: options.name,
          alt: options.name,
          tileSize: new google.maps.Size(256, 256),
          isPng: true,
          minZoom: 0,
          maxZoom: options.maxZoom || 17
        });
      };
      return {
        init: init,
        clear: clear,
        loaded: loaded,
        isLoaded: isLoaded,
        mapboxLayer: mapboxLayer,
        addLoadCallback: addLoadCallback
      };
    })();
  })();

  (function() {
    return NMIS.IconSwitcher = (function() {
      var all, allShowing, callbacks, clear, context, createAll, filterStatus, filterStatusNot, hideItem, init, iterate, mapItem, mapItems, setCallback, setVisibility, shiftStatus, showItem;
      context = {};
      callbacks = ["createMapItem", "shiftMapItemStatus", "statusShiftDone", "hideMapItem", "showMapItem", "setMapItemVisibility"];
      mapItems = {};
      init = function(_opts) {
        var items, noop;
        noop = function() {};
        items = {};
        context = _.extend({
          items: {},
          mapItem: mapItem
        }, _opts);
        return _.each(callbacks, function(cbname) {
          if (context[cbname] === undefined) {
            return context[cbname] = noop;
          }
        });
      };
      mapItem = function(id, value) {
        if (!(value != null)) {
          return mapItems[id];
        } else {
          return mapItems[id] = value;
        }
      };
      hideItem = function(item) {
        return item.hidden = true;
      };
      showItem = function(item) {
        return item.hidden = false;
      };
      setVisibility = function(item, tf) {
        if (!!tf) {
          if (!item.hidden) {
            item.hidden = true;
            context.setMapItemVisibility.call(item, false, item, context.items);
            return true;
          }
        } else {
          if (!!item.hidden) {
            item.hidden = false;
            context.setMapItemVisibility.call(item, true, item, context.items);
            return true;
          }
        }
        return false;
      };
      iterate = function(cb) {
        return _.each(context.items, function(item, id, itemset) {
          return cb.apply(context, [item, id, itemset]);
        });
      };
      shiftStatus = function(fn) {
        iterate(function(item, id) {
          var status, statusChange, visChange;
          status = fn.call(context, id, item, context.items);
          visChange = setVisibility(item, status === false);
          statusChange = false;
          if (status === undefined) {

          } else if (status === false) {
            item.status = undefined;
          } else if (item.status !== status) {
            item._prevStatus = status;
            item.status = status;
            statusChange = true;
          }
          if (statusChange || visChange) {
            return context.shiftMapItemStatus(item, id);
          }
        });
        return context.statusShiftDone();
      };
      all = function() {
        return _.values(context.items);
      };
      setCallback = function(cbName, cb) {
        if (callbacks.indexOf(cbName) !== -1) {
          return context[cbName] = cb;
        }
      };
      filterStatus = function(status) {
        return _.filter(context.items, function(item) {
          return item.status === status;
        });
      };
      filterStatusNot = function(status) {
        return _.filter(context.items, function(item) {
          return item.status !== status;
        });
      };
      allShowing = function() {
        return filterStatusNot(undefined);
      };
      createAll = function() {
        return iterate(context.createMapItem);
      };
      clear = function() {
        log("Clearing IconSwitcher");
        return context = {};
      };
      return {
        init: init,
        clear: clear,
        allShowing: allShowing,
        createAll: createAll,
        filterStatus: filterStatus,
        filterStatusNot: filterStatusNot,
        all: all,
        setCallback: setCallback,
        shiftStatus: shiftStatus,
        iterate: iterate
      };
    })();
  })();

  (function() {
    return NMIS.FacilitySelector = (function() {
      var activate, active, deselect, isActive;
      active = false;
      isActive = function() {
        return active;
      };
      activate = function(params) {
        var fId, facility, key, val, _ref;
        fId = params.id;
        NMIS.IconSwitcher.shiftStatus(function(id, item) {
          if (id !== fId) {
            return "background";
          } else {
            active = true;
            return "normal";
          }
        });
        facility = false;
        _ref = NMIS.data();
        for (key in _ref) {
          val = _ref[key];
          if (key === params.id) {
            facility = val;
          }
        }
        return NMIS.FacilityPopup(facility);
      };
      deselect = function() {
        var sector;
        if (active) {
          sector = NMIS.activeSector();
          NMIS.IconSwitcher.shiftStatus(function(id, item) {
            if (item.sector === sector) {
              return "normal";
            } else {
              return "background";
            }
          });
          active = false;
          return dashboard.setLocation(NMIS.urlFor(NMIS.Env.extend({
            facilityId: false
          })));
        }
      };
      return {
        activate: activate,
        isActive: isActive,
        deselect: deselect
      };
    })();
  })();

  (function() {
    return NMIS.DataLoader = (function() {
      var fetch, fetchLocalStorage;
      fetchLocalStorage = function(url) {
        var data, p, stringData;
        p = void 0;
        data = void 0;
        stringData = localStorage.getItem(url);
        if (stringData) {
          data = JSON.parse(stringData);
          $.getJSON(url).then(function(d) {
            localStorage.removeItem(url);
            return localStorage.setItem(url, JSON.stringify(d));
          });
          return $.Deferred().resolve([data]);
        } else {
          p = new $.Deferred();
          $.getJSON(url).then(function(d) {
            localStorage.setItem(url, JSON.stringify(d));
            return p.resolve([d]);
          });
          return p.promise();
        }
      };
      fetch = function(url) {
        return $.getJSON(url);
      };
      return {
        fetch: fetch
      };
    })();
  })();

  (function() {
    return NMIS.LocalNav = (function() {
      var buttonSections, clear, displaySubmenu, elem, getNavLink, hideSubmenu, init, iterate, markActive, opts, submenu, wrap;
      elem = void 0;
      wrap = void 0;
      opts = void 0;
      buttonSections = {};
      submenu = void 0;
      init = function(selector, _opts) {
        wrap = $(selector);
        opts = _.extend({
          sections: []
        }, _opts);
        elem = $("<ul />", {
          id: "local-nav",
          "class": "nav"
        });
        wrap = $("<div />", {
          "class": "row ln-wrap"
        }).css({
          position: "absolute",
          top: 82,
          left: 56,
          "z-index": 99
        }).html(elem);
        $(".content").eq(0).prepend(wrap);
        _.each(opts.sections, function(section, i) {
          if (i !== 0) {
            $("<li />", {
              "class": "small spacer"
            }).html("&nbsp;").appendTo(elem);
          }
          return _.each(section, function(arr) {
            var a, code;
            code = arr[0].split(":");
            if (buttonSections[code[0]] === undefined) {
              buttonSections[code[0]] = {};
            }
            a = $("<a />", {
              href: arr[2],
              text: arr[1]
            });
            buttonSections[code[0]][code[1]] = a;
            return $("<li />").html(a).appendTo(elem);
          });
        });
        return submenu = $("<ul />").addClass("submenu").appendTo(elem);
      };
      getNavLink = function(code) {
        var name, section, _x;
        _x = code.split(":");
        section = _x[0];
        name = _x[1];
        return buttonSections[section][name];
      };
      markActive = function(codesArray) {
        wrap.find(".active").removeClass("active");
        return _.each(codesArray, function(code) {
          return getNavLink(code).parents("li").eq(0).addClass("active");
        });
      };
      clear = function() {
        wrap.empty();
        wrap = undefined;
        elem = undefined;
        buttonSections = {};
        return submenu = undefined;
      };
      hideSubmenu = function() {
        return submenu.hide();
      };
      displaySubmenu = function(nlcode, a, _opts) {
        var lpos, navLink;
        navLink = getNavLink(nlcode);
        lpos = navLink.parents("li").eq(0).position().left;
        submenu.hide().empty().css({
          left: lpos
        });
        _.each(a, function(aa) {
          return $("<li />").html($("<a />", {
            text: aa[0],
            href: aa[1]
          })).appendTo(submenu);
        });
        return submenu.show();
      };
      iterate = function(cb) {
        return _.each(buttonSections, function(buttons, sectionName) {
          return _.each(buttons, function(button, buttonName) {
            return cb.apply(this, [sectionName, buttonName, button]);
          });
        });
      };
      return {
        init: init,
        clear: clear,
        iterate: iterate,
        displaySubmenu: displaySubmenu,
        hideSubmenu: hideSubmenu,
        markActive: markActive
      };
    })();
  })();

  (function() {
    return NMIS.Tabulation = (function() {
      var filterBySector, init, sectorSlug, sectorSlugAsArray;
      init = function() {
        return true;
      };
      filterBySector = function(sector) {
        sector = NMIS.Sectors.pluck(sector);
        return _.filter(NMIS.data(), function(d) {
          return d.sector === sector;
        });
      };
      sectorSlug = function(sector, slug, keys) {
        var occurrences, values;
        occurrences = {};
        values = _(filterBySector(sector)).chain().pluck(slug).map(function(v) {
          return "" + v;
        }).value();
        if (keys === undefined) {
          keys = _.uniq(values).sort();
        }
        _.each(keys, function(key) {
          return occurrences[key] = 0;
        });
        _.each(values, function(d) {
          if (occurrences[d] !== undefined) {
            return occurrences[d]++;
          }
        });
        return occurrences;
      };
      sectorSlugAsArray = function(sector, slug, keys) {
        var occurrences;
        occurrences = sectorSlug.apply(this, arguments_);
        if (keys === undefined) {
          keys = _.keys(occurrences).sort();
        }
        return _(keys).map(function(key) {
          return {
            occurrences: "" + key,
            value: occurrences[key]
          };
        });
      };
      return {
        init: init,
        sectorSlug: sectorSlug,
        sectorSlugAsArray: sectorSlugAsArray
      };
    })();
  })();

  (function() {
    return NMIS.Env = (function() {
      var env, env_accessor, get_env, set_env;
      env = false;
      env_accessor = function(arg) {
        if (arg != null) {
          return set_env(arg);
        } else {
          return get_env();
        }
      };
      get_env = function() {
        if (!env) {
          throw new Error("NMIS.Env is not set");
        }
        return _.extend({}, env);
      };
      set_env = function(_env) {
        return env = _.extend({}, _env);
      };
      env_accessor.extend = function(o) {
        return _.extend(get_env(), o);
      };
      return env_accessor;
    })();
  })();

}).call(this);
