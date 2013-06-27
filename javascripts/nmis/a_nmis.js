
/*
I'm moving modules into this file wrapped in "do ->" (self-executing functions)
until they play well together (and I ensure they don't over-depend on other modules.)
..doing this instead of splitting them into individual files.
*/


(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty;

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
    NMIS.S3Photos = (function() {
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
    return NMIS.S3orFormhubPhotoUrl = function(item, size_code) {
      var fh_pid, sizes;
      sizes = {
        "90": "-small",
        "200": "-medium"
      };
      if (item.formhub_photo_id) {
        fh_pid = ("" + item.formhub_photo_id).replace(".jpg", "");
        if (__indexOf.call(sizes, size_code) >= 0) {
          fh_pid = "" + fh_pid + sizes[size_code];
        }
        return "https://formhub.s3.amazonaws.com/ossap/attachments/" + fh_pid + ".jpg";
      } else if (item.s3_photo_id) {
        return NMIS.S3Photos.url(item.s3_photo_id, size_code);
      }
    };
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

  NMIS.FacilitySelector = (function() {
    /*
      NMIS.FacilitySelector handles actions that pertain to selecting a facility.
    
      Usage:
        NMIS.FacilitySelector.activate id: 1234
        NMIS.FacilitySelector.deselect()
        NMIS.FacilitySelector.isActive() #returns boolean
    */

    var activate, active, deselect, isActive;
    active = false;
    isActive = function() {
      return active;
    };
    activate = function(params) {
      var fId, facility, key, lga, val, _ref;
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
      lga = NMIS.Env().lga;
      _ref = lga.facilityData;
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
        dashboard.setLocation(NMIS.urlFor(NMIS.Env.extend({
          facility: false
        })));
        return NMIS.FacilityPopup.hide();
      }
    };
    return {
      activate: activate,
      isActive: isActive,
      deselect: deselect
    };
  })();

  (function() {
    return NMIS.DataLoader = (function() {
      var ajaxJsonQuery, fetch, fetchLocalStorage;
      ajaxJsonQuery = function(url, cache) {
        if (cache == null) {
          cache = true;
        }
        return $.ajax({
          url: url,
          dataType: "json",
          cache: cache
        });
      };
      fetchLocalStorage = function(url) {
        var data, p, stringData;
        p = !1;
        data = !1;
        stringData = localStorage.getItem(url);
        if (stringData) {
          data = JSON.parse(stringData);
          ajaxJsonQuery(url).then(function(d) {
            localStorage.removeItem(url);
            return localStorage.setItem(url, JSON.stringify(d));
          });
          return $.Deferred().resolve([data]);
        } else {
          p = new $.Deferred();
          ajaxJsonQuery(url).then(function(d) {
            localStorage.setItem(url, JSON.stringify(d));
            return p.resolve([d]);
          });
          return p.promise();
        }
      };
      fetch = function(url) {
        return ajaxJsonQuery(url, false);
      };
      return {
        fetch: fetch
      };
    })();
  })();

  (function() {
    return NMIS.LocalNav = (function() {
      /*
          NMIS.LocalNav is the navigation boxes that shows up on top of the map.
          > It has "buttonSections", each with buttons inside. These buttons are defined
            when they are passed as arguments to NMIS.LocalNav.init(...)
      
          > It is structured to make it easy to assign the buttons to point to URLs
            relative to the active LGA. It is also meant to be easy to change which
            buttons are active by passing values to NMIS.LocalNav.markActive(...)
      
            An example value passed to markActive:
              NMIS.LocalNav.markActive(["mode:facilities", "sector:health"])
                ** this would "select" facilities and health **
      
          > You can also run NMIS.LocalNav.iterate to run through each button, changing
            the href to something appropriate given the current page state.
      
          [wrapper element className: ".local-nav"]
      */

      var buttonSections, clear, displaySubmenu, elem, getNavLink, hide, hideSubmenu, init, iterate, markActive, opts, show, submenu, wrap;
      elem = void 0;
      wrap = void 0;
      opts = void 0;
      buttonSections = {};
      submenu = void 0;
      init = function(selector, _opts) {
        var a, arr, i, id, section, section_code, section_id, spacer, text, url, _i, _j, _len, _len1, _ref, _ref1, _ref2;
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
        spacer = $("<li>", {
          "class": "small spacer",
          html: "&nbsp;"
        });
        _ref = opts.sections;
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          section = _ref[i];
          if (i !== 0) {
            spacer.clone().appendTo(elem);
          }
          for (_j = 0, _len1 = section.length; _j < _len1; _j++) {
            _ref1 = section[_j], id = _ref1[0], text = _ref1[1], url = _ref1[2];
            arr = [id, text, url];
            _ref2 = id.split(":"), section_code = _ref2[0], section_id = _ref2[1];
            if (buttonSections[section_code] === void 0) {
              buttonSections[section_code] = {};
            }
            a = $("<a>", {
              href: url,
              text: text
            });
            buttonSections[section_code][section_id] = a;
            $("<li>", {
              html: a
            }).appendTo(elem);
          }
        }
        return submenu = $("<ul>", {
          "class": "submenu"
        }).appendTo(elem);
      };
      hide = function() {
        return wrap.detach();
      };
      show = function() {
        if (wrap.closest("html").length === 0) {
          return $(".content").eq(0).prepend(wrap);
        }
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
        hide: hide,
        show: show,
        displaySubmenu: displaySubmenu,
        hideSubmenu: hideSubmenu,
        markActive: markActive
      };
    })();
  })();

  (function() {
    return NMIS.Tabulation = (function() {
      /*
          This is only currently used in the pie chart graphing of facility indicators.
      */

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
        occurrences = sectorSlug.apply(this, arguments);
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
      /*
          NMIS.Env() gets-or-sets the page state.
      
          It also provides the option to trigger callbacks which are run in a
          special context upon each change of the page-state (each time NMIS.Env() is set)
      */

      var EnvContext, changeCbs, env, env_accessor, get_env, set_env, _latestChangeDeferred;
      env = false;
      changeCbs = [];
      _latestChangeDeferred = false;
      EnvContext = (function() {

        function EnvContext(next, prev) {
          this.next = next;
          this.prev = prev;
        }

        EnvContext.prototype.usingSlug = function(what, whatSlug) {
          return this._matchingSlug(what, whatSlug);
        };

        EnvContext.prototype.changingToSlug = function(what, whatSlug) {
          return !this._matchingSlug(what, whatSlug, false) && this._matchingSlug(what, whatSlug);
        };

        EnvContext.prototype.changing = function(what) {
          return this._getSlug(what) !== this._getSlug(what, false);
        };

        EnvContext.prototype.changeDone = function() {
          var _ref;
          return (_ref = this._deferred) != null ? _ref.resolve(this.next) : void 0;
        };

        EnvContext.prototype._matchingSlug = function(what, whatSlug, checkNext) {
          if (checkNext == null) {
            checkNext = true;
          }
          return this._getSlug(what, checkNext) === whatSlug;
        };

        EnvContext.prototype._getSlug = function(what, checkNext) {
          var checkEnv, obj;
          if (checkNext == null) {
            checkNext = true;
          }
          checkEnv = checkNext ? this.next : this.prev;
          obj = checkEnv[what];
          return "" + (obj && obj.slug ? obj.slug : obj);
        };

        return EnvContext;

      })();
      env_accessor = function(arg) {
        if (arg != null) {
          return set_env(arg);
        } else {
          return get_env();
        }
      };
      get_env = function() {
        if (env) {
          return _.extend({}, env);
        } else {
          return null;
        }
      };
      set_env = function(_env) {
        var changeCb, context, _i, _len, _results;
        context = new EnvContext(_.extend({}, _env), env);
        context._deferred = _latestChangeDeferred = $.Deferred();
        context.change = _latestChangeDeferred.promise();
        env = context.next;
        _results = [];
        for (_i = 0, _len = changeCbs.length; _i < _len; _i++) {
          changeCb = changeCbs[_i];
          _results.push(changeCb.call(context, context.next, context.prev));
        }
        return _results;
      };
      env_accessor.extend = function(o) {
        var e;
        e = env ? env : {};
        return _.extend({}, e, o);
      };
      env_accessor.onChange = function(cb) {
        return changeCbs.push(cb);
      };
      env_accessor.changeDone = function() {
        if (_latestChangeDeferred) {
          return _latestChangeDeferred.resolve(env);
        }
      };
      return env_accessor;
    })();
  })();

  NMIS.panels = (function() {
    /*
      NMIS.panels provides a basic way to define HTML DOM-related behavior when navigating from
      one section of the site to another. (e.g. "summary" to "facilities".)
    */

    var Panel, changePanel, currentPanel, ensurePanel, getPanel, panels;
    panels = {};
    currentPanel = false;
    Panel = (function() {

      function Panel(id) {
        this.id = id;
        this._callbacks = {};
      }

      Panel.prototype.addCallbacks = function(obj) {
        var cb, name;
        if (obj == null) {
          obj = {};
        }
        for (name in obj) {
          if (!__hasProp.call(obj, name)) continue;
          cb = obj[name];
          this.addCallback(name, cb);
        }
        return this;
      };

      Panel.prototype.addCallback = function(name, cb) {
        if (!this._callbacks[name]) {
          this._callbacks[name] = [];
        }
        this._callbacks[name].push(cb);
        return this;
      };

      Panel.prototype._triggerCallback = function(name, nextPanel) {
        var cb, _i, _len, _ref;
        _ref = this._callbacks[name] || [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          cb = _ref[_i];
          cb.call(window, name, this, nextPanel);
        }
        return this;
      };

      return Panel;

    })();
    getPanel = function(id) {
      if (!panels[id]) {
        panels[id] = new Panel(id);
      }
      return panels[id];
    };
    changePanel = function(id) {
      var nextPanel;
      nextPanel = panels[id];
      if (!nextPanel) {
        throw new Error("Panel not found: " + id);
      } else if (nextPanel !== currentPanel) {
        if (currentPanel) {
          currentPanel._triggerCallback('close', nextPanel);
        }
        nextPanel._triggerCallback('open', currentPanel);
        currentPanel = nextPanel;
        return panels[id];
      } else {
        return false;
      }
    };
    ensurePanel = function(id) {
      if (!panels[id]) {
        throw new Error("NMIS.panels.ensurePanel('" + id + "') Error: Panel does not exist");
      }
    };
    return {
      getPanel: getPanel,
      changePanel: changePanel,
      ensurePanel: ensurePanel,
      currentPanelId: function() {
        return currentPanel != null ? currentPanel.id : void 0;
      },
      allPanels: function() {
        var k, v, _results;
        _results = [];
        for (k in panels) {
          v = panels[k];
          _results.push(v);
        }
        return _results;
      }
    };
  })();

  (function() {
    return NMIS.DisplayWindow = (function() {
      /*
          NMIS.DisplayWindow builds and provides access to the multi-part structure of
          the facilities view.
      */

      var addCallback, addTitle, clear, contentWrap, createHeaderBar, curSize, curTitle, elem, elem0, elem1, elem1content, elem1contentHeight, ensureInitialized, fullHeight, getElems, hbuttons, hide, init, initted, opts, resized, resizerSet, setBarHeight, setDWHeight, setSize, setTitle, setVisibility, show, showTitle, titleElems, visible;
      elem = void 0;
      elem1 = void 0;
      elem0 = void 0;
      elem1content = void 0;
      opts = void 0;
      visible = void 0;
      hbuttons = void 0;
      titleElems = {};
      curSize = void 0;
      resizerSet = false;
      resized = void 0;
      curTitle = void 0;
      initted = false;
      contentWrap = false;
      init = function(_elem, _opts) {
        initted = true;
        if (opts !== undefined) {
          clear();
        }
        if (!resizerSet) {
          resizerSet = true;
          $(window).resize(_.throttle(resized, 1000));
        }
        contentWrap = $(_elem);
        elem = $("<div />").appendTo(contentWrap);
        opts = _.extend({
          height: 100,
          clickSizes: [["full", "Table Only"], ["middle", "Split"], ["minimized", "Map Only"]],
          size: "middle",
          sizeCookie: false,
          callbacks: {},
          visible: false,
          heights: {
            full: Infinity,
            middle: 280,
            minimized: 46
          },
          allowHide: true,
          padding: 10
        }, _opts);
        elem0 = $("<div />").addClass("elem0").appendTo(elem);
        elem1 = $("<div />").addClass("elem1").appendTo(elem);
        visible = !!opts.visible;
        setVisibility(visible, false);
        if (opts.sizeCookie) {
          opts.size = $.cookie("displayWindowSize") || opts.size;
        }
        elem.addClass("display-window-wrap");
        elem1.addClass("display-window-content");
        createHeaderBar().appendTo(elem1);
        elem1content = $("<div />").addClass("elem1-content").appendTo(elem1);
        return setSize(opts.size);
      };
      setDWHeight = function(height) {
        if (height === undefined) {
          height = "auto";
        } else {
          if (height === "calculate") {
            height = fullHeight();
          }
        }
        elem.height(height);
        return elem0.height(height);
      };
      setTitle = function(t, tt) {
        _.each(titleElems, function(e) {
          return e.text(t);
        });
        if (tt !== undefined) {
          return $("head title").text("NMIS: " + tt);
        } else {
          return $("head title").text("NMIS: " + t);
        }
      };
      showTitle = function(i) {
        curTitle = i;
        return _.each(titleElems, function(e, key) {
          if (key === i) {
            return e.show();
          } else {
            return e.hide();
          }
        });
      };
      addCallback = function(cbname, cb) {
        if (opts.callbacks[cbname] === undefined) {
          opts.callbacks[cbname] = [];
        }
        return opts.callbacks[cbname].push(cb);
      };
      setBarHeight = function(h, animate, cb) {
        if (animate) {
          return elem1.animate({
            height: h
          }, {
            duration: 200,
            complete: cb
          });
        } else {
          elem1.css({
            height: h
          });
          return (cb || function() {})();
        }
      };
      setSize = function(_size, animate) {
        var size;
        size = void 0;
        if (opts.heights[_size] !== undefined) {
          size = opts.heights[_size];
          if (size === Infinity) {
            size = fullHeight();
          }
          $.cookie("displayWindowSize", _size);
          setBarHeight(size, animate, function() {
            if (!!curSize) {
              elem1.removeClass("size-" + curSize);
            }
            elem1.addClass("size-" + _size);
            return curSize = _size;
          });
        }
        if (opts.callbacks[_size] !== undefined) {
          _.each(opts.callbacks[_size], function(cb) {
            return cb(animate);
          });
        }
        if (opts.callbacks.resize !== undefined) {
          _.each(opts.callbacks.resize, function(cb) {
            return cb(animate, _size, elem, elem1, elem1content);
          });
        }
        hbuttons.find(".primary").removeClass("primary");
        return hbuttons.find(".clicksize." + _size).addClass("primary");
      };
      setVisibility = function(tf) {
        var css;
        css = {};
        visible = !!tf;
        if (!visible) {
          css = {
            left: "1000em",
            display: "none"
          };
        } else {
          css = {
            left: "0",
            display: "block"
          };
        }
        elem0.css(css);
        return elem1.css(css);
      };
      ensureInitialized = function() {
        if (!initted) {
          throw new Error("NMIS.DisplayWindow is not initialized");
        }
      };
      hide = function() {
        setVisibility(false);
        ensureInitialized();
        return elem.detach();
      };
      show = function() {
        setVisibility(true);
        ensureInitialized();
        if (!elem.inDom()) {
          return contentWrap.append(elem);
        }
      };
      addTitle = function(key, jqElem) {
        titleElems[key] = jqElem;
        if (curTitle === key) {
          return showTitle(key);
        }
      };
      createHeaderBar = function() {
        hbuttons = $("<span />");
        _.each(opts.clickSizes, function(_arg) {
          var desc, size;
          size = _arg[0], desc = _arg[1];
          return $("<a />").attr("class", "btn small clicksize " + size).text(desc).attr("title", desc).click(function() {
            return setSize(size, false);
          }).appendTo(hbuttons);
        });
        titleElems.bar = $("<h3 />").addClass("bar-title").hide();
        return $("<div />", {
          "class": "display-window-bar breadcrumb"
        }).css({
          margin: 0
        }).append(titleElems.bar).append(hbuttons);
      };
      clear = function() {
        elem !== undefined && elem.empty();
        return titleElems = {};
      };
      getElems = function() {
        return {
          wrap: elem,
          elem0: elem0,
          elem1: elem1,
          elem1content: elem1content
        };
      };
      fullHeight = function() {
        var oh;
        oh = 0;
        $(opts.offsetElems).each(function() {
          return oh += $(this).height();
        });
        return $(window).height() - oh - opts.padding;
      };
      elem1contentHeight = function() {
        var padding;
        padding = 30;
        return elem1.height() - hbuttons.height() - padding;
      };
      resized = function() {
        var fh;
        if (visible && curSize !== "full") {
          fh = fullHeight();
          elem.stop(true, false);
          elem.animate({
            height: fh
          });
          elem0.stop(true, false);
          return elem0.animate({
            height: fh
          });
        }
      };
      return {
        init: init,
        clear: clear,
        setSize: setSize,
        getSize: function() {
          return curSize;
        },
        setVisibility: setVisibility,
        hide: hide,
        show: show,
        addCallback: addCallback,
        setDWHeight: setDWHeight,
        addTitle: addTitle,
        setTitle: setTitle,
        showTitle: showTitle,
        elem1contentHeight: elem1contentHeight,
        getElems: getElems
      };
    })();
  })();

}).call(this);
