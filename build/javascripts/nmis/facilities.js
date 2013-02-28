
/*
Facilities:
*/


(function() {
  var facilitiesMap, launchFacilities, prepFacilities, prepare_data_for_pie_graph, resizeDisplayWindowAndFacilityTable, _rDelay,
    __hasProp = {}.hasOwnProperty;

  (function() {
    var panelClose, panelOpen;
    panelOpen = function() {
      NMIS.DisplayWindow.show();
      return NMIS.LocalNav.show();
    };
    panelClose = function() {
      NMIS.DisplayWindow.hide();
      return NMIS.LocalNav.hide();
    };
    return NMIS.panels.getPanel("facilities").addCallbacks({
      open: panelOpen,
      close: panelClose
    });
  })();

  NMIS.launch_facilities = function() {
    var district, paramName, params, val, _ref;
    params = {};
    if (("" + window.location.search).match(/facility=(\d+)/)) {
      params.facility = ("" + window.location.search).match(/facility=(\d+)/)[1];
    }
    _ref = this.params;
    for (paramName in _ref) {
      if (!__hasProp.call(_ref, paramName)) continue;
      val = _ref[paramName];
      if ($.type(val) === "string" && val !== "") {
        params[paramName] = val.replace("/", "");
      }
    }
    district = NMIS.getDistrictByUrlCode("" + params.state + "/" + params.lga);
    NMIS.districtDropdownSelect(district);
    NMIS._currentDistrict = district;
    if (params.sector === "overview") {
      params.sector = undefined;
    }
    return district.sectors_data_loader().done(function() {
      var dmod, fetchers, mod, _i, _len, _ref1;
      prepFacilities(params);
      fetchers = {};
      _ref1 = ["variables/variables", "presentation/facilities", "data/facilities", "data/lga_data"];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        mod = _ref1[_i];
        dmod = district.get_data_module(mod);
        fetchers[dmod.sanitizedId()] = dmod.fetch();
      }
      if (district.has_data_module("data/lga_data")) {
        fetchers.lga_data = district.loadData();
      }
      fetchers.variableList = district.loadVariables();
      return $.when_O(fetchers).done(function(results) {
        return launchFacilities(results, params);
      });
    });
  };

  prepFacilities = function(params) {
    var bcValues, e, facilitiesMode, lga, state;
    NMIS.panels.changePanel("facilities");
    facilitiesMode = {
      name: "Facility Detail",
      slug: "facilities"
    };
    lga = NMIS.getDistrictByUrlCode("" + params.state + "/" + params.lga);
    state = lga.group;
    e = {
      state: state,
      lga: lga,
      mode: facilitiesMode,
      sector: NMIS.Sectors.pluck(params.sector)
    };
    e.subsector = e.sector.getSubsector(params.subsector);
    e.indicator = e.sector.getIndicator(params.indicator);
    bcValues = NMIS._prepBreadcrumbValues(e, "state lga mode sector subsector indicator".split(" "), {
      state: state,
      lga: lga
    });
    NMIS.LocalNav.markActive(["mode:facilities", "sector:" + e.sector.slug]);
    NMIS.Breadcrumb.clear();
    NMIS.Breadcrumb.setLevels(bcValues);
    return NMIS.LocalNav.iterate(function(sectionType, buttonName, a) {
      var env;
      env = _.extend({}, e, {
        subsector: false
      });
      env[sectionType] = buttonName;
      return a.attr("href", NMIS.urlFor(env));
    });
  };

  this.mustachify = function(id, obj) {
    return Mustache.to_html($("#" + id).eq(0).html().replace(/<{/g, "{{").replace(/\}>/g, "}}"), obj);
  };

  resizeDisplayWindowAndFacilityTable = function() {
    var ah, bar, cf;
    ah = NMIS._wElems.elem1.height();
    bar = $(".display-window-bar", NMIS._wElems.elem1).outerHeight();
    cf = $(".clearfix", NMIS._wElems.elem1).eq(0).height();
    return NMIS.SectorDataTable.setDtMaxHeight(ah - bar - cf - 18);
  };

  /*
  The beast: launchFacilities--
  */


  facilitiesMap = false;

  launchFacilities = function(results, params) {
    var MapMgr_opts, c, createFacilitiesMap, d, dTableHeight, displayTitle, e, facCount, facPresentation, facilities, item, lga, mapLoader, mapZoom, obj, profileVariables, s, sector, state, tableElem, twrap, variableData;
    facilities = results.data_facilities;
    variableData = results.variables_variables;
    facPresentation = results.presentation_facilities;
    profileVariables = facPresentation.profile_indicator_ids;
    lga = NMIS._currentDistrict;
    state = NMIS._currentDistrict.group;
    createFacilitiesMap = function() {
      var bounds, iconURLData, ll, mapClick, markerClick, markerMouseout, markerMouseover, x;
      iconURLData = function(item) {
        var sectorIconURL, slug, status;
        sectorIconURL = function(slug, status) {
          var iconFiles;
          iconFiles = {
            education: "education.png",
            health: "health.png",
            water: "water.png",
            "default": "book_green_wb.png"
          };
          return "./images/icons_f/" + status + "_" + (iconFiles[slug] || iconFiles["default"]);
        };
        slug = void 0;
        status = item.status;
        if (status === "custom") {
          return item._custom_png_data;
        }
        slug = item.iconSlug || item.sector.slug;
        return [sectorIconURL(slug, status), 32, 24];
      };
      markerClick = function() {
        var sslug;
        sslug = NMIS.activeSector().slug;
        if (sslug === this.nmis.item.sector.slug || sslug === "overview") {
          return dashboard.setLocation(NMIS.urlFor(_.extend(NMIS.Env(), {
            facility: this.nmis.id
          })));
        }
      };
      markerMouseover = function() {
        var sslug;
        sslug = NMIS.activeSector().slug;
        if (this.nmis.item.sector.slug === sslug || sslug === "overview") {
          return NMIS.FacilityHover.show(this);
        }
      };
      markerMouseout = function() {
        return NMIS.FacilityHover.hide();
      };
      mapClick = function() {
        if (NMIS.FacilitySelector.isActive()) {
          NMIS.FacilitySelector.deselect();
          return dashboard.setLocation(NMIS.urlFor(_.extend(NMIS.Env(), {
            facility: false
          })));
        }
      };
      ll = (function() {
        var _i, _len, _ref, _results;
        _ref = lga.lat_lng.split(",");
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          x = _ref[_i];
          _results.push(+x);
        }
        return _results;
      })();
      if (!!facilitiesMap) {
        _rDelay(1, function() {
          if (lga.bounds) {
            facilitiesMap.fitBounds(lga.bounds);
          } else {
            facilitiesMap.setCenter(new google.maps.LatLng(ll[0], ll[1]));
          }
          return google.maps.event.trigger(facilitiesMap, "resize");
        });
        return;
      } else {
        facilitiesMap = new google.maps.Map(NMIS._wElems.elem0.get(0), {
          zoom: mapZoom,
          center: new google.maps.LatLng(ll[0], ll[1]),
          streetViewControl: false,
          panControl: false,
          mapTypeControlOptions: {
            mapTypeIds: ["roadmap", "satellite", "terrain", "OSM"]
          },
          mapTypeId: google.maps.MapTypeId["SATELLITE"]
        });
        facilitiesMap.overlayMapTypes.insertAt(0, NMIS.MapMgr.mapboxLayer({
          tileset: "nigeria_overlays_white",
          name: "Nigeria"
        }));
      }
      facilitiesMap.mapTypes.set("OSM", new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
          return "http://tile.openstreetmap.org/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
        },
        tileSize: new google.maps.Size(256, 256),
        name: "OSM",
        maxZoom: 18
      }));
      bounds = new google.maps.LatLngBounds();
      google.maps.event.addListener(facilitiesMap, "click", mapClick);
      NMIS.IconSwitcher.setCallback("createMapItem", function(item, id, itemList) {
        var $gm, iconData, mI, td;
        if (!!item._ll && !this.mapItem(id)) {
          $gm = google.maps;
          item.iconSlug = item.iconType || item.sector.slug;
          td = iconURLData(item);
          iconData = {
            url: td[0],
            size: new $gm.Size(td[1], td[2])
          };
          mI = {
            latlng: new $gm.LatLng(item._ll[0], item._ll[1]),
            icon: new $gm.MarkerImage(iconData.url, iconData.size)
          };
          mI.marker = new $gm.Marker({
            position: mI.latlng,
            map: facilitiesMap,
            icon: mI.icon
          });
          mI.marker.setZIndex((item.status === "normal" ? 99 : 11));
          mI.marker.nmis = {
            item: item,
            id: id
          };
          google.maps.event.addListener(mI.marker, "click", markerClick);
          google.maps.event.addListener(mI.marker, "mouseover", markerMouseover);
          google.maps.event.addListener(mI.marker, "mouseout", markerMouseout);
          bounds.extend(mI.latlng);
          return this.mapItem(id, mI);
        }
      });
      NMIS.IconSwitcher.createAll();
      lga.bounds = bounds;
      _rDelay(1, function() {
        google.maps.event.trigger(facilitiesMap, "resize");
        return facilitiesMap.fitBounds(bounds);
      });
      return NMIS.IconSwitcher.setCallback("shiftMapItemStatus", function(item, id) {
        var icon, mapItem;
        mapItem = this.mapItem(id);
        if (!!mapItem) {
          icon = mapItem.marker.getIcon();
          icon.url = iconURLData(item)[0];
          return mapItem.marker.setIcon(icon);
        }
      });
    };
    sector = NMIS.Sectors.pluck(params.sector);
    e = {
      state: state,
      lga: lga,
      mode: "facilities",
      sector: sector,
      subsector: sector.getSubsector(params.subsector),
      indicator: sector.getIndicator(params.indicator),
      facility: params.facility
    };
    dTableHeight = void 0;
    NMIS.Env(e);
    NMIS.activeSector(sector);
    NMIS.loadFacilities(facilities);
    if (e.sector !== undefined && e.subsector === undefined) {
      e.subsector = _.first(e.sector.subGroups());
      e.subsectorUndefined = true;
    }
    MapMgr_opts = {
      elem: NMIS._wElems.elem0
    };
    mapZoom = 8;
    mapLoader = NMIS.loadGoogleMaps();
    mapLoader.done(function() {
      return createFacilitiesMap();
    });
    if (window.dwResizeSet === undefined) {
      window.dwResizeSet = true;
      NMIS.DisplayWindow.addCallback("resize", function(tf, size) {
        if (size === "middle" || size === "full") {
          return resizeDisplayWindowAndFacilityTable();
        }
      });
    }
    NMIS.DisplayWindow.setDWHeight("calculate");
    if (e.sector.slug === "overview") {
      NMIS._wElems.elem1content.empty();
      displayTitle = "Facility Detail: " + lga.label + " » Overview";
      NMIS.DisplayWindow.setTitle(displayTitle);
      NMIS.IconSwitcher.shiftStatus(function(id, item) {
        return "normal";
      });
      obj = {
        lgaName: "" + lga.name + ", " + lga.group.name
      };
      obj.profileData = (function() {
        var outp, value, variable, vv;
        outp = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = profileVariables.length; _i < _len; _i++) {
            vv = profileVariables[_i];
            variable = NMIS.variables.find(vv);
            value = lga.lookupRecord(vv);
            _results.push({
              name: variable != null ? variable.name : void 0,
              value: value != null ? value.value : void 0
            });
          }
          return _results;
        })();
        return outp;
      })();
      facCount = 0;
      obj.overviewSectors = (function() {
        var _i, _len, _ref, _ref1, _results;
        _ref = NMIS.Sectors.all();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          s = _ref[_i];
          c = 0;
          _ref1 = NMIS.data();
          for (d in _ref1) {
            item = _ref1[d];
            if (item.sector === s) {
              c++;
            }
          }
          facCount += c;
          _results.push({
            name: s.name,
            slug: s.slug,
            url: NMIS.urlFor(_.extend(NMIS.Env(), {
              sector: s,
              subsector: false
            })),
            counts: c
          });
        }
        return _results;
      })();
      obj.facCount = facCount;
      NMIS._wElems.elem1content.html(_.template($("#facilities-overview").html(), obj));
    } else {
      if (!!e.subsectorUndefined || !NMIS.FacilitySelector.isActive()) {
        NMIS.IconSwitcher.shiftStatus(function(id, item) {
          if (item.sector === e.sector) {
            return "normal";
          } else {
            return "background";
          }
        });
      }
      displayTitle = "Facility Detail: " + lga.label + " » " + e.sector.name;
      if (!!e.subsector) {
        NMIS.DisplayWindow.setTitle(displayTitle, displayTitle + " - " + e.subsector.name);
      }
      NMIS._wElems.elem1content.empty();
      twrap = $("<div />", {
        "class": "facility-table-wrap"
      }).append($("<div />").attr("class", "clearfix").html("&nbsp;")).appendTo(NMIS._wElems.elem1content);
      tableElem = NMIS.SectorDataTable.createIn(twrap, e, {
        sScrollY: 1000
      }).addClass("bs");
      if (!!e.indicator) {
        (function() {
          var mm, pcWrap;
          if (e.indicator.iconify_png_url) {
            NMIS.IconSwitcher.shiftStatus(function(id, item) {
              if (item.sector === e.sector) {
                item._custom_png_data = e.indicator.customIconForItem(item);
                return "custom";
              } else {
                return "background";
              }
            });
          }
          if (e.indicator.click_actions.length === 0) {
            return;
          }
          $(".indicator-feature").remove();
          obj = _.extend({}, e.indicator);
          mm = $(_.template($("#indicator-feature").html(), obj));
          mm.find("a.close").click(function() {
            dashboard.setLocation(NMIS.urlFor(_.extend({}, e, {
              indicator: false
            })));
            return false;
          });
          mm.prependTo(NMIS._wElems.elem1content);
          pcWrap = mm.find(".raph-circle").get(0);
          return (function() {
            var column, pieChartDisplayDefinitions, piechartFalse, piechartTrue, tabulations;
            sector = e.sector;
            column = e.indicator;
            piechartTrue = _.include(column.click_actions, "piechart_true");
            piechartFalse = _.include(column.click_actions, "piechart_false");
            pieChartDisplayDefinitions = void 0;
            if (piechartTrue) {
              pieChartDisplayDefinitions = [
                {
                  legend: "No",
                  color: "#ff5555",
                  key: "false"
                }, {
                  legend: "Yes",
                  color: "#21c406",
                  key: "true"
                }, {
                  legend: "Undefined",
                  color: "#999",
                  key: "undefined"
                }
              ];
            } else if (piechartFalse) {
              pieChartDisplayDefinitions = [
                {
                  legend: "Yes",
                  color: "#ff5555",
                  key: "true"
                }, {
                  legend: "No",
                  color: "#21c406",
                  key: "false"
                }, {
                  legend: "Undefined",
                  color: "#999",
                  key: "undefined"
                }
              ];
            }
            if (!!pieChartDisplayDefinitions) {
              tabulations = NMIS.Tabulation.sectorSlug(sector.slug, column.slug, "true false undefined".split(" "));
              return prepare_data_for_pie_graph(pcWrap, pieChartDisplayDefinitions, tabulations, {});
            }
          })();
        })();
      }
    }
    resizeDisplayWindowAndFacilityTable();
    if (!!e.facility) {
      return NMIS.FacilitySelector.activate({
        id: e.facility
      });
    }
  };

  prepare_data_for_pie_graph = function(pieWrap, legend, data, _opts) {
    /*
      creates a graph with some default options.
      if we want to customize stuff (ie. have behavior that changes based on
      different input) then we should work it into the "_opts" parameter.
    */

    var colors, defaultOpts, gid, hover_off, hover_on, item, opts, pie, pvals, r, rearranged_vals, values, _i, _len;
    gid = $(pieWrap).get(0).id;
    if (!gid) {
      $(pieWrap).attr("id", "pie-wrap");
      gid = "pie-wrap";
    }
    defaultOpts = {
      x: 50,
      y: 40,
      r: 35,
      font: "12px 'Fontin Sans', Fontin-Sans, sans-serif"
    };
    opts = $.extend({}, defaultOpts, _opts);
    rearranged_vals = $.map(legend, function(val) {
      return $.extend(val, {
        value: data[val.key]
      });
    });
    values = [];
    colors = [];
    legend = [];
    rearranged_vals.sort(function(a, b) {
      return b.value - a.value;
    });
    for (_i = 0, _len = rearranged_vals.length; _i < _len; _i++) {
      item = rearranged_vals[_i];
      if (item.value > 0) {
        values.push(item.value);
        colors.push(item.color);
        legend.push("%% - " + item.legend + " (##)");
      }
    }
    pvals = {
      values: values,
      colors: colors,
      legend: legend
    };
    /*
      NOTE: hack to get around a graphael bug!
      if there is only one color the chart will
      use the default value (Raphael.fn.g.colors[0])
      here, we will set it to whatever the highest
      value that we have is
    */

    Raphael.fn.g.colors[0] = pvals.colors[0];
    r = Raphael(gid);
    r.g.txtattr.font = opts.font;
    pie = r.g.piechart(opts.x, opts.y, opts.r, pvals.values, {
      colors: pvals.colors,
      legend: pvals.legend,
      legendpos: "east"
    });
    hover_on = function() {
      this.sector.stop();
      this.sector.scale(1.1, 1.1, this.cx, this.cy);
      if (this.label) {
        this.label[0].stop();
        this.label[0].scale(1.4);
        return this.label[1].attr({
          "font-weight": 800
        });
      }
    };
    hover_off = function() {
      this.sector.animate({
        scale: [1, 1, this.cx, this.cy]
      }, 500, "bounce");
      if (this.label) {
        this.label[0].animate({
          scale: 1
        }, 500, "bounce");
        return this.label[1].attr({
          "font-weight": 400
        });
      }
    };
    pie.hover(hover_on, hover_off);
    return r;
  };

  _rDelay = function(i, fn) {
    return _.delay(fn, i);
  };

}).call(this);
