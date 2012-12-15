(function() {
  var DisplayPanel, TmpSector, UnderscoreTemplateDisplayPanel, create_sector_panel, establish_template_display_panels, launch_summary, summaryMap, template_not_found, __display_panels, _tdps,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  NMIS.loadSummary = function(s) {
    var fetchers, initSummaryMap, lga, lga_code, state;
    lga_code = "" + s.params.state + "/" + s.params.lga;
    lga = NMIS.getDistrictByUrlCode(lga_code);
    state = lga.group;
    initSummaryMap = function() {
      var $mapDiv, ll, mapDiv, mapZoom, summaryMap;
      $mapDiv = $(".profile-box .map").eq(0);
      mapDiv = $mapDiv.get(0);
      ll = _.map(lga.latLng.split(","), function(x) {
        return +x;
      });
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
        }
        return _.delay((function() {
          google.maps.event.trigger(summaryMap, "resize");
          return summaryMap.setCenter(new google.maps.LatLng(ll[1], ll[0]), mapZoom);
        }), 1);
      }
    };
    if (NMIS.MapMgr.isLoaded()) {
      initSummaryMap();
    } else {
      NMIS.MapMgr.addLoadCallback(initSummaryMap);
      NMIS.MapMgr.init();
    }
    fetchers = {};
    if (lga.has_data_module("summary")) {
      fetchers.summary = NMIS.DataLoader.fetch(lga.module_url("summary"));
    }
    if (lga.has_data_module("summary_sectors")) {
      fetchers.summary_sectors = NMIS.DataLoader.fetch(lga.module_url("summary_sectors"));
    }
    return $.when_O(fetchers).done(function(results) {
      return launch_summary(s.params, state, lga, results);
    });
  };

  TmpSector = (function() {

    function TmpSector(s) {
      this.slug = s.id;
      this.name = s.name;
    }

    return TmpSector;

  })();

  launch_summary = function(params, state, lga, query_results) {
    var bcValues, current_sector, overviewObj, s, summary_data, summary_sectors, _env, _i, _len, _ref;
    if (query_results == null) {
      query_results = {};
    }
    summary_data = query_results.summary;
    summary_sectors = query_results.summary_sectors;
    NMIS.DisplayWindow.setVisibility(false);
    NMIS.DisplayWindow.setDWHeight();
    overviewObj = {
      name: "Overview",
      slug: "overview"
    };
    _ref = summary_data.view_details;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      s = _ref[_i];
      if (s.id === params.sector) {
        current_sector = new TmpSector(s);
      }
    }
    if (!current_sector) {
      current_sector = overviewObj;
    }
    _env = {
      mode: {
        name: "Summary",
        slug: "summary"
      },
      state: state,
      lga: lga,
      sector: current_sector
    };
    bcValues = NMIS._prepBreadcrumbValues(_env, "state lga mode sector subsector indicator".split(" "), {
      state: state,
      lga: lga
    });
    NMIS.Breadcrumb.clear();
    NMIS.Breadcrumb.setLevels(bcValues);
    NMIS.LocalNav.markActive(["mode:summary", "sector:" + _env.sector.slug]);
    NMIS.LocalNav.iterate(function(sectionType, buttonName, a) {
      var env;
      env = _.extend({}, _env);
      env[sectionType] = buttonName;
      return a.attr("href", NMIS.urlFor(env));
    });
    (function() {
      /*
          how can we do this better?
      */

      var cc_div, content_div, context, module, sector_id, sector_view_panel, sector_window, sector_window_inner_wrap, _j, _k, _len1, _len2, _ref1, _ref2;
      content_div = $('.content');
      if (content_div.find('#conditional-content').length === 0) {
        context = {};
        context.summary_data = summary_data;
        context.summary_sectors = summary_sectors;
        context.lga = lga;
        cc_div = $('<div>', {
          id: 'conditional-content'
        });
        _ref1 = summary_data.view_details;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          sector_view_panel = _ref1[_j];
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
          _ref2 = sector_view_panel.modules;
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            module = _ref2[_k];
            sector_window_inner_wrap.append(create_sector_panel(sector_id, module, context));
          }
          sector_window.appendTo(cc_div);
        }
        return $('.content').append(cc_div);
      }
    })();
    return (function() {
      var cc, sector;
      sector = _env.sector;
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

  create_sector_panel = function(sector_id, module, context) {
    var div, panel, _ref, _ref1;
    establish_template_display_panels();
    context.relevant_data = (_ref = context.summary_data.data) != null ? (_ref1 = _ref[sector_id]) != null ? _ref1[module] : void 0 : void 0;
    div = $('<div>');
    if (__display_panels[module] != null) {
      panel = __display_panels[module];
      panel.build(div, context);
    } else {
      div.html(template_not_found(module));
    }
    return div;
  };

  summaryMap = void 0;

}).call(this);