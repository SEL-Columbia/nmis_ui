
/*
Facilities:
*/


(function() {
  var displayFacilitySector, displayOverview, ensure_dw_resize_set, facilitiesMode, prepare_data_for_pie_graph, resizeDisplayWindowAndFacilityTable, withFacilityMapDrawnForDistrict, _rDelay, _standardBcSlugs,
    __hasProp = {}.hasOwnProperty,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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

  facilitiesMode = {
    name: "Facility Detail",
    slug: "facilities"
  };

  _standardBcSlugs = "state lga mode sector subsector indicator".split(" ");

  NMIS.Env.onChange(function(next, prev) {
    var addIcons, featureAllIcons, featureIconsOfSector, hideFacility, highlightFacility, loadLgaData, repositionMapToDistrictBounds,
      _this = this;
    if (this.changingToSlug("mode", "facilities")) {
      NMIS.panels.changePanel("facilities");
    }
    if (this.usingSlug("mode", "facilities")) {
      NMIS.LocalNav.markActive(["mode:facilities", "sector:" + next.sector.slug]);
      NMIS.Breadcrumb.clear();
      NMIS.Breadcrumb.setLevels(NMIS._prepBreadcrumbValues(next, _standardBcSlugs, {
        state: next.state,
        lga: next.lga
      }));
      NMIS.activeSector(next.sector);
      NMIS.DisplayWindow.setDWHeight("calculate");
      NMIS.LocalNav.iterate(function(sectionType, buttonName, a) {
        var env;
        env = _.extend({}, next, {
          subsector: false
        });
        env[sectionType] = buttonName;
        return a.attr("href", NMIS.urlFor(env));
      });
      /*
          determine which map changes should be made
      */

      if (this.changing("lga") || this.changingToSlug("mode", "facilities")) {
        repositionMapToDistrictBounds = true;
        addIcons = true;
      }
      if (this.changing("sector")) {
        if (next.sector.slug === "overview") {
          featureAllIcons = true;
        } else {
          featureIconsOfSector = next.sector;
        }
      }
      if (this.changing("facility")) {
        if (next.facility) {
          highlightFacility = next.facility;
        } else {
          hideFacility = true;
        }
      }
      if (this.usingSlug("sector", "overview")) {
        loadLgaData = true;
      }
      resizeDisplayWindowAndFacilityTable();
      this.change.done(function() {
        if (next.sector.slug === "overview") {
          displayOverview(next.lga);
        } else {
          displayFacilitySector(next.lga, NMIS.Env());
        }
        return withFacilityMapDrawnForDistrict(next.lga).done(function(nmisMapContext) {
          if (repositionMapToDistrictBounds) {
            nmisMapContext.fitDistrictBounds(next.lga);
          }
          if (addIcons) {
            nmisMapContext.addIcons();
          }
          if (featureAllIcons) {
            nmisMapContext.featureAllIcons();
          }
          if (featureIconsOfSector) {
            nmisMapContext.featureIconsOfSector(featureIconsOfSector);
          }
          if (highlightFacility) {
            NMIS.FacilitySelector.activate({
              id: highlightFacility
            });
          }
          if (hideFacility) {
            return NMIS.FacilityPopup.hide();
          }
        });
      });
      return (function() {
        var district, fetchers;
        district = next.lga;
        fetchers = {
          presentation_facilities: district.loadFacilitiesPresentation(),
          data_facilities: district.loadFacilitiesData(),
          variableList: district.loadVariables()
        };
        if (loadLgaData && district.has_data_module("data/lga_data")) {
          fetchers.lga_data = district.loadData();
        }
        return $.when_O(fetchers).done(function() {
          return _this.changeDone();
        });
      })();
    }
  });

  ensure_dw_resize_set = _.once(function() {
    return NMIS.DisplayWindow.addCallback("resize", function(tf, size) {
      if (size === "middle" || size === "full") {
        return resizeDisplayWindowAndFacilityTable();
      }
    });
  });

  NMIS.launch_facilities = function() {
    var district, paramName, params, val, _ref;
    params = {};
    params.facility = (function() {
      var urlEnd;
      urlEnd = ("" + window.location).split("?")[1];
      if (urlEnd) {
        return urlEnd.match(/facility=([0-9a-f-]+)$/);
      }
    })();
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
    if (params.sector === "overview") {
      params.sector = undefined;
    }
    /*
      We ALWAYS need to load the sectors first (either cached or not) in order
      to determine if the sector is valid.
    */

    return district.sectors_data_loader().done(function() {
      return NMIS.Env((function() {
        /*
              This self-invoking function returns and sets the environment
              object which we will be using for the page view.
        */

        var e;
        e = {
          lga: district,
          state: district.group,
          mode: facilitiesMode,
          sector: NMIS.Sectors.pluck(params.sector)
        };
        if (params.subsector) {
          e.subsector = e.sector.getSubsector(params.subsector);
        }
        if (params.indicator) {
          e.indicator = e.sector.getIndicator(params.indicator);
        }
        if (params.facility) {
          e.facility = params.facility;
        }
        return e;
      })());
    });
  };

  NMIS.mapClick = function() {
    if (NMIS.FacilitySelector.isActive()) {
      NMIS.FacilitySelector.deselect();
      return dashboard.setLocation(NMIS.urlFor.extendEnv({
        facility: false
      }));
    }
  };

  withFacilityMapDrawnForDistrict = (function() {
    var $elem, district, elem, gmap, nmisMapContext, _addIconsAndListeners, _createMap;
    gmap = false;
    $elem = elem = false;
    district = false;
    _createMap = function() {
      gmap = new google.maps.Map(elem, {
        streetViewControl: false,
        panControl: false,
        mapTypeControlOptions: {
          mapTypeIds: ["roadmap", "satellite", "terrain", "OSM"]
        },
        mapTypeId: google.maps.MapTypeId["SATELLITE"]
      });
      google.maps.event.addListener(gmap, "click", NMIS.mapClick);
      gmap.overlayMapTypes.insertAt(0, (function() {
        var maxZoom, name, tileset;
        tileset = "nigeria_overlays_white";
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
      return gmap.mapTypes.set("OSM", new google.maps.ImageMapType({
        getTileUrl: function(c, z) {
          return "http://tile.openstreetmap.org/" + z + "/" + c.x + "/" + c.y + ".png";
        },
        tileSize: new google.maps.Size(256, 256),
        name: "OSM",
        maxZoom: 18
      }));
    };
    _addIconsAndListeners = function() {
      var iconURLData, markerClick, markerMouseout, markerMouseover;
      iconURLData = function(item) {
        var filenm, iconFiles, slug, status;
        slug = void 0;
        status = item.status;
        if (status === "custom") {
          return item._custom_png_data;
        }
        slug = item.iconSlug || item.sector.slug;
        iconFiles = {
          education: "education.png",
          health: "health.png",
          water: "water.png",
          "default": "book_green_wb.png?default"
        };
        filenm = iconFiles[slug] || iconFiles["default"];
        return ["" + NMIS.settings.pathToMapIcons + "/icons_f/" + status + "_" + filenm, 32, 24];
      };
      markerClick = function() {
        var sslug;
        sslug = NMIS.activeSector().slug;
        if (sslug === this.nmis.item.sector.slug || sslug === "overview") {
          return dashboard.setLocation(NMIS.urlFor.extendEnv({
            facility: this.nmis.id
          }));
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
      NMIS.IconSwitcher.setCallback("createMapItem", function(item, id, itemList) {
        var $gm, iconData, ih, iurl, iw, mI, _ref;
        if (!!item._ll && !this.mapItem(id)) {
          $gm = google.maps;
          item.iconSlug = item.iconType || item.sector.slug;
          if (!item.status) {
            item.status = "normal";
          }
          _ref = iconURLData(item), iurl = _ref[0], iw = _ref[1], ih = _ref[2];
          iconData = {
            url: iurl,
            size: new $gm.Size(iw, ih)
          };
          mI = {
            latlng: new $gm.LatLng(item._ll[0], item._ll[1]),
            icon: new $gm.MarkerImage(iconData.url, iconData.size)
          };
          mI.marker = new $gm.Marker({
            position: mI.latlng,
            map: gmap,
            icon: mI.icon
          });
          mI.marker.setZIndex((item.status === "normal" ? 99 : 11));
          mI.marker.nmis = {
            item: item,
            id: id
          };
          $gm.event.addListener(mI.marker, "click", markerClick);
          $gm.event.addListener(mI.marker, "mouseover", markerMouseover);
          $gm.event.addListener(mI.marker, "mouseout", markerMouseout);
          return this.mapItem(id, mI);
        }
      });
      NMIS.IconSwitcher.createAll();
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
    nmisMapContext = (function() {
      var addIcons, createMap, featureAllIcons, featureIconsOfSector, fitDistrictBounds, selectFacility;
      createMap = function() {
        return _createMap();
      };
      addIcons = function() {
        return _addIconsAndListeners();
      };
      fitDistrictBounds = function(_district) {
        var bounds, neLat, neLng, swLat, swLng, _ref;
        if (_district == null) {
          _district = false;
        }
        if (_district) {
          district = _district;
        }
        if (!gmap) {
          createMap();
        }
        if (!gmap) {
          throw new Error("Google map [gmap] is not initialized.");
        }
        _ref = district.latLngBounds(), swLat = _ref[0], swLng = _ref[1], neLat = _ref[2], neLng = _ref[3];
        bounds = new google.maps.LatLngBounds(new google.maps.LatLng(swLat, swLng), new google.maps.LatLng(neLat, neLng));
        return gmap.fitBounds(bounds);
      };
      featureAllIcons = function() {
        return NMIS.IconSwitcher.shiftStatus(function() {
          return "normal";
        });
      };
      featureIconsOfSector = function(sector) {
        return NMIS.IconSwitcher.shiftStatus(function(id, item) {
          if (item.sector.slug === sector.slug) {
            return "normal";
          } else {
            return "background";
          }
        });
      };
      selectFacility = function(fac) {
        return NMIS.IconSwitcher.shiftStatus(function(id, item) {
          if (item.id === id) {
            return "normal";
          } else {
            return "background";
          }
        });
      };
      return {
        createMap: createMap,
        addIcons: addIcons,
        fitDistrictBounds: fitDistrictBounds,
        featureAllIcons: featureAllIcons,
        featureIconsOfSector: featureIconsOfSector,
        selectFacility: selectFacility
      };
    })();
    return function(_district) {
      /*
          This function is set to "withFacilityMapDrawnForDistrict" but always executed in this scope.
      */

      var dfd, existingMapDistrictId;
      dfd = $.Deferred();
      $elem = $(NMIS._wElems.elem0);
      district = _district;
      elem = $elem.get(0);
      existingMapDistrictId = $elem.data("districtId");
      NMIS.loadGoogleMaps().done(function() {
        return dfd.resolve(nmisMapContext);
      });
      return dfd.promise();
    };
  })();

  resizeDisplayWindowAndFacilityTable = function() {
    var ah, bar, cf;
    ah = NMIS._wElems.elem1.height();
    bar = $(".display-window-bar", NMIS._wElems.elem1).outerHeight();
    cf = $(".clearfix", NMIS._wElems.elem1).eq(0).height();
    return NMIS.SectorDataTable.setDtMaxHeight(ah - bar - cf - 18);
  };

  displayOverview = function(district) {
    var c, d, displayTitle, facCount, item, obj, profileVariables, s;
    profileVariables = district.facilitiesPresentation.profile_indicator_ids;
    NMIS._wElems.elem1content.empty();
    displayTitle = "Facility Detail: " + district.label + " » Overview";
    NMIS.DisplayWindow.setTitle(displayTitle);
    NMIS.IconSwitcher.shiftStatus(function(id, item) {
      return "normal";
    });
    obj = {
      lgaName: "" + district.name + ", " + district.group.name
    };
    obj.profileData = (function() {
      var outp, value, variable, vv;
      outp = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = profileVariables.length; _i < _len; _i++) {
          vv = profileVariables[_i];
          variable = district.variableSet.find(vv);
          value = district.lookupRecord(vv);
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
          if (!__hasProp.call(_ref1, d)) continue;
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
    return NMIS._wElems.elem1content.html(_.template($("#facilities-overview").html(), obj));
  };

  displayFacilitySector = function(lga, e) {
    var defaultSubsector, displayTitle, eModded, tableElem, twrap;
    if (__indexOf.call(e, 'subsector') < 0 || !NMIS.FacilitySelector.isActive()) {
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
    defaultSubsector = e.sector.subGroups()[0];
    eModded = __indexOf.call(e, 'subsector') < 0 ? _.extend({}, e, {
      subsector: defaultSubsector
    }) : e;
    tableElem = NMIS.SectorDataTable.createIn(lga, twrap, eModded, {
      sScrollY: 1000
    }).addClass("bs");
    if (!!e.indicator) {
      return (function() {
        var mm, obj, pcWrap;
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
          var column, pieChartDisplayDefinitions, piechartFalse, piechartTrue, sector, tabulations;
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
  };

  prepare_data_for_pie_graph = function(pieWrap, legend, data, _opts) {
    /*
      creates a graph with some default options.
      if we want to customize stuff (ie. have behavior that changes based on
      different input) then we should work it into the "_opts" parameter.
    */

    var defaultOpts, gid, hover_off, hover_on, item, opts, pie, pvals, r, rearranged_vals, rearranged_vals2, val, _i, _len;
    if (!(gid = $(pieWrap).eq(0).prop("id"))) {
      $(pieWrap).prop("id", "pie-wrap");
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
    rearranged_vals2 = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = legend.length; _i < _len; _i++) {
        val = legend[_i];
        _results.push(val.value = data[val.key]);
      }
      return _results;
    })();
    pvals = {
      values: [],
      colors: [],
      legend: []
    };
    rearranged_vals.sort(function(a, b) {
      return b.value - a.value;
    });
    for (_i = 0, _len = rearranged_vals.length; _i < _len; _i++) {
      item = rearranged_vals[_i];
      if (item.value > 0) {
        pvals.values.push(item.value);
        pvals.colors.push(item.color);
        pvals.legend.push("%% - " + item.legend + " (##)");
      }
    }
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
