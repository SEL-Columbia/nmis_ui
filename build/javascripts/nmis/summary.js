(function() {
  var DisplayPanel, TmpSector, UnderscoreTemplateDisplayPanel, establish_template_display_panels, launch_summary, summaryMap, template_not_found, __display_panels, _rDelay, _tdps,
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

  summaryMap = false;

  NMIS.loadSummary = function(s) {
    var fetchers, fetchersDone, googleMapsLoad, launchGoogleMapSummaryView, lga, lga_code, state;
    lga_code = "" + s.params.state + "/" + s.params.lga;
    lga = NMIS.getDistrictByUrlCode(lga_code);
    NMIS.districtDropdownSelect(lga);
    state = lga.group;
    fetchers = {};
    googleMapsLoad = NMIS.loadGoogleMaps();
    if (lga.has_data_module("presentation/summary_sectors")) {
      fetchers.summary_sectors = lga.get_data_module("presentation/summary_sectors").fetch();
    }
    if (lga.has_data_module("data/lga_data")) {
      fetchers.lga_data = lga.loadData();
    }
    fetchers.variables = lga.loadVariables();
    fetchersDone = $.when_O(fetchers);
    fetchersDone.done(function(results) {
      googleMapsLoad.done(function() {
        return launchGoogleMapSummaryView(lga);
      });
      return launch_summary(s.params, state, lga, results);
    });
    return launchGoogleMapSummaryView = function(lga) {
      var $mapDiv, ll, mapDiv, mapZoom, x;
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
      mapZoom = 9;
      if (mapDiv) {
        if (!summaryMap) {
          summaryMap = new google.maps.Map(mapDiv, {
            zoom: mapZoom,
            center: new google.maps.LatLng(ll[1], ll[0]),
            streetViewControl: false,
            panControl: false,
            mapTypeControl: false,
            mapTypeId: google.maps.MapTypeId.HYBRID
          });
          summaryMap.mapTypes.set("ng_base_map", NMIS.MapMgr.mapboxLayer({
            tileset: "nigeria_base",
            name: "Nigeria"
          }));
          summaryMap.setMapTypeId("ng_base_map");
          return _rDelay(1, function() {
            google.maps.event.trigger(summaryMap, "resize");
            return summaryMap.setCenter(new google.maps.LatLng(ll[1], ll[0]), mapZoom);
          });
        }
      }
    };
  };

  TmpSector = (function() {

    function TmpSector(s) {
      this.slug = s.id;
      this.name = s.name;
    }

    return TmpSector;

  })();

  launch_summary = function(params, state, lga, query_results) {
    var bcKeys, current_sector, overviewObj, relevant_data, s, summary_sectors, summary_sectors_results, view_details, _i, _len;
    if (query_results == null) {
      query_results = {};
    }
    summary_sectors_results = query_results.summary_sectors;
    summary_sectors = summary_sectors_results.sectors;
    relevant_data = summary_sectors_results.relevant_data;
    NMIS.panels.changePanel("summary");
    NMIS.DisplayWindow.setDWHeight();
    overviewObj = {
      name: "Overview",
      slug: "overview"
    };
    view_details = summary_sectors_results.view_details;
    for (_i = 0, _len = view_details.length; _i < _len; _i++) {
      s = view_details[_i];
      if (s.id === params.sector) {
        current_sector = new TmpSector(s);
      }
    }
    if (!current_sector) {
      current_sector = overviewObj;
    }
    NMIS.Env({
      mode: {
        name: "Summary",
        slug: "summary"
      },
      state: state,
      lga: lga,
      sector: current_sector
    });
    NMIS.Breadcrumb.clear();
    bcKeys = "state lga mode sector subsector indicator".split(" ");
    NMIS.Breadcrumb.setLevels(NMIS._prepBreadcrumbValues(NMIS.Env(), bcKeys, {
      state: state,
      lga: lga
    }));
    NMIS.LocalNav.markActive(["mode:summary", "sector:" + NMIS.Env().sector.slug]);
    NMIS.LocalNav.iterate(function(sectionType, buttonName, a) {
      var o;
      o = {};
      o[sectionType] = buttonName;
      return a.attr("href", NMIS.urlFor.extendEnv(o));
    });
    (function() {
      /*
          how can we do this better?
      */

      var cc_div, content_div, context, module, sectorPanel, sector_id, sector_view_panel, sector_window, sector_window_inner_wrap, _j, _k, _len1, _len2, _ref;
      content_div = $('.content');
      if (content_div.find('#conditional-content').length === 0) {
        context = {};
        context.summary_sectors = summary_sectors;
        context.lga = lga;
        cc_div = $('<div>', {
          id: 'conditional-content'
        });
        for (_j = 0, _len1 = view_details.length; _j < _len1; _j++) {
          sector_view_panel = view_details[_j];
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
          _ref = sector_view_panel.modules;
          for (_k = 0, _len2 = _ref.length; _k < _len2; _k++) {
            module = _ref[_k];
            sectorPanel = (function() {
              var div, panel, spanStr, _ref1;
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
              context.relevant_data = (_ref1 = relevant_data[sector_id]) != null ? _ref1[module] : void 0;
              div = $('<div>');
              context.lookupName = function(id, section_name) {
                var context_name, vrb;
                if (id) {
                  vrb = NMIS.variables.find(id);
                  if (vrb) {
                    if ("context" in vrb && vrb.context !== null) {
                      if (sector_id in vrb.context) {
                        if (section_name in vrb.context[sector_id]) {
                          context_name = vrb.context[sector_id][section_name]['name'];
                        } else {
                          context_name = vrb.context[sector_id]['name'];
                        }
                      } else {
                        context_name = vrb.name;
                      }
                    } else {
                      context_name = vrb.name;
                    }
                    return spanStr(context_name, "variable-name");
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
        return $('.content').append(cc_div);
      }
    })();
    return (function() {
      var cc, sector;
      sector = NMIS.Env().sector;
      cc = $("#conditional-content").hide();
      cc.find(">div").hide();
      cc.find(">div.lga." + sector.slug).show();
      return cc.show();
    })();
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
