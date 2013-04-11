(function() {
  var DisplayPanel, UnderscoreTemplateDisplayPanel, build_all_sector_summary_modules, establish_template_display_panels, launchGoogleMapSummaryView, launch_summary, template_not_found, __display_panels, _bcKeys, _rDelay, _tdps,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (function() {
    /*
      When "summary" is activated/deactivated, the open/close callbacks are called
    */

    var panelClose, panelOpen;
    panelOpen = function() {
      NMIS.LocalNav.show();
      return $("#conditional-content").show();
    };
    panelClose = function() {
      NMIS.LocalNav.hide();
      return $("#conditional-content").hide();
    };
    return NMIS.panels.getPanel("summary").addCallbacks({
      open: panelOpen,
      close: panelClose
    });
  })();

  _bcKeys = "state lga mode sector subsector indicator".split(" ");

  NMIS.Env.onChange(function(next, prev) {
    if (this.changing("lga")) {
      $("#conditional-content").remove();
    }
    if (this.changingToSlug("mode", "summary")) {
      NMIS.panels.changePanel("summary");
    }
    if (this.usingSlug("mode", "summary")) {
      NMIS.Breadcrumb.clear();
      NMIS.Breadcrumb.setLevels(NMIS._prepBreadcrumbValues(next, _bcKeys, {
        state: next.state,
        lga: next.lga
      }));
      NMIS.LocalNav.markActive(["mode:summary", "sector:" + next.sector.slug]);
      NMIS.LocalNav.iterate(function(sectionType, buttonName, a) {
        var o;
        o = {};
        o[sectionType] = buttonName;
        return a.attr("href", NMIS.urlFor.extendEnv(o));
      });
      if (this.usingSlug("sector", "overview") || this.changing("lga")) {
        return this.change.done(function(env) {
          return launchGoogleMapSummaryView(env.lga);
        });
      }
    }
  });

  NMIS.loadSummary = function(s) {
    var fetchers, googleMapsLoad, lga, lga_code, state;
    lga_code = "" + s.params.state + "/" + s.params.lga;
    lga = NMIS.getDistrictByUrlCode(lga_code);
    NMIS.districtDropdownSelect(lga);
    state = lga.group;
    fetchers = {};
    googleMapsLoad = NMIS.loadGoogleMaps();
    if (lga.has_data_module("presentation/summary_sectors")) {
      fetchers.summary_sectors = lga.loadSummarySectors();
      fetchers.summary_sectors.done(function() {
        var current_sector;
        current_sector = (function(vd) {
          var sector, _i, _len;
          for (_i = 0, _len = vd.length; _i < _len; _i++) {
            sector = vd[_i];
            if (sector.id === s.params.sector) {
              return {
                slug: sector.id,
                name: sector.name
              };
            }
          }
          return {
            name: "Overview",
            slug: "overview"
          };
        })(lga.ssData.view_details);
        return NMIS.Env({
          mode: {
            name: "Summary",
            slug: "summary"
          },
          state: state,
          lga: lga,
          sector: current_sector
        });
      });
    }
    if (lga.has_data_module("data/lga_data")) {
      fetchers.lga_data = lga.loadData();
    }
    fetchers.variables = lga.loadVariables();
    return $.when_O(fetchers).done(function(results) {
      launch_summary(s.params, state, lga, results);
      return googleMapsLoad.done(function() {
        return NMIS.Env.changeDone();
      });
    });
  };

  launchGoogleMapSummaryView = function(lga) {
    var $mapDiv, ll, mapDiv, mapZoom, summaryMap, x;
    $mapDiv = $(".profile-box .map").eq(0);
    mapDiv = $mapDiv.get(0);
    ll = (function() {
      var _i, _len, _ref, _results;
      _ref = lga.latLng.split(",");
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        x = _ref[_i];
        _results.push(+x);
      }
      return _results;
    })();
    mapZoom = lga.zoomLevel || 9;
    if (mapDiv) {
      summaryMap = new google.maps.Map(mapDiv, {
        zoom: mapZoom,
        center: new google.maps.LatLng(ll[1], ll[0]),
        streetViewControl: false,
        panControl: false,
        mapTypeControl: false,
        mapTypeId: google.maps.MapTypeId.HYBRID
      });
      summaryMap.mapTypes.set("ng_base_map", (function() {
        var maxZoom, name, tileset;
        tileset = "nigeria_base";
        name = "Nigeria";
        maxZoom = 17;
        return new google.maps.ImageMapType({
          getTileUrl: function(coord, z) {
            return "http://b.tiles.mapbox.com/v3/modilabs." + tileset + "/" + z + "/" + coord.x + "/" + coord.y + ".png";
          },
          name: name,
          alt: name,
          tileSize: new google.maps.Size(256, 256),
          isPng: true,
          minZoom: 0,
          maxZoom: maxZoom
        });
      })());
      summaryMap.setMapTypeId("ng_base_map");
      return _rDelay(1, function() {
        google.maps.event.trigger(summaryMap, "resize");
        return summaryMap.setCenter(new google.maps.LatLng(ll[1], ll[0]), mapZoom);
      });
    }
  };

  launch_summary = function(params, state, lga, query_results) {
    var cc, cc_div, content_div, relevant_data, sector, view_details;
    if (query_results == null) {
      query_results = {};
    }
    relevant_data = lga.ssData.relevant_data;
    NMIS.DisplayWindow.setDWHeight();
    view_details = lga.ssData.view_details;
    content_div = $('.content');
    if (content_div.find('#conditional-content').length === 0) {
      cc_div = build_all_sector_summary_modules(lga);
      cc_div.appendTo(content_div);
    }
    sector = NMIS.Env().sector;
    cc = $("#conditional-content").hide();
    cc.find(">div").hide();
    cc.find(">div.lga." + sector.slug).show();
    return cc.show();
  };

  build_all_sector_summary_modules = function(lga) {
    var cc_div, context, module, sectorPanel, sector_id, sector_view_panel, sector_window, sector_window_inner_wrap, _i, _j, _len, _len1, _ref, _ref1;
    cc_div = $('<div>', {
      id: 'conditional-content'
    });
    context = {
      lga: lga,
      summary_sectors: lga.ssData.sectors
    };
    _ref = lga.ssData.view_details;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      sector_view_panel = _ref[_i];
      sector_window = $("<div>", {
        "class": "lga"
      });
      sector_window.html("<div class='display-window-bar breadcrumb'></div>");
      sector_window_inner_wrap = $("<div>", {
        "class": 'cwrap'
      }).appendTo(sector_window);
      sector_id = sector_view_panel.id;
      sector_window.addClass(sector_id);
      context.summary_sector = context.summary_sectors[sector_id];
      context.view_panel = sector_view_panel;
      _ref1 = sector_view_panel.modules;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        module = _ref1[_j];
        sectorPanel = (function() {
          var div, panel, spanStr, _ref2;
          spanStr = function(content, cls) {
            if (content == null) {
              content = "&mdash;";
            }
            if (cls == null) {
              cls = "";
            }
            return "<span class='" + cls + "' style='text-transform:none'>" + content + "</span>";
          };
          establish_template_display_panels();
          context.relevant_data = (_ref2 = lga.ssData.relevant_data[sector_id]) != null ? _ref2[module] : void 0;
          div = $('<div>');
          context.lookupName = function(id, context) {
            var vrb;
            if (id) {
              vrb = lga.variableSet.find(id);
              if (vrb) {
                return spanStr(vrb.lookup("name", context), "variable-name");
              } else {
                return spanStr(id, "warn-missing");
              }
            } else {
              return spanStr("No variable id", "warn-missing");
            }
          };
          context.lookupValue = function(id, defaultValue) {
            var record;
            if (defaultValue == null) {
              defaultValue = null;
            }
            record = lga.lookupRecord(id);
            if (record) {
              return spanStr(record.displayValue(), "found");
            } else if (id) {
              return spanStr("&ndash;", "warn-missing", "Missing value for id: " + id);
            } else {
              return spanStr("&cross;", "warn-missing", "Missing ID");
            }
          };
          if (__display_panels[module] != null) {
            panel = __display_panels[module];
            panel.build(div, context);
          } else {
            div.html(template_not_found(module));
          }
          return div;
        })();
        sector_window_inner_wrap.append(sectorPanel);
      }
      sector_window.appendTo(cc_div);
    }
    return cc_div;
  };

  __display_panels = {};

  DisplayPanel = (function() {

    function DisplayPanel() {}

    DisplayPanel.prototype.build = function() {};

    return DisplayPanel;

  })();

  UnderscoreTemplateDisplayPanel = (function(_super) {

    __extends(UnderscoreTemplateDisplayPanel, _super);

    function UnderscoreTemplateDisplayPanel(module, elem) {
      this.template_html = elem.html();
    }

    UnderscoreTemplateDisplayPanel.prototype.build = function(elem, context) {
      if (context == null) {
        context = {};
      }
      return elem.append(_.template(this.template_html, context));
    };

    return UnderscoreTemplateDisplayPanel;

  })(DisplayPanel);

  template_not_found = function(name) {
    return "<h2>Template '" + name + "' not found</h2>";
  };

  _tdps = false;

  establish_template_display_panels = function() {
    if (!_tdps) {
      $('script.display-panel').each(function() {
        var $this, module;
        $this = $(this);
        module = $this.data('module');
        return __display_panels[module] = new UnderscoreTemplateDisplayPanel(module, $this);
      });
      return _tdps = true;
    }
  };

  _rDelay = function(i, fn) {
    return _.delay(fn, i);
  };

}).call(this);
