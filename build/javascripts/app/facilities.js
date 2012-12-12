
/*
Facilities:
*/


(function() {
  var facilitiesMap, facilitiesMapCreated, get_lgaDataReq, get_sectorsReq, get_variableDataReq, launchFacilities, launch_facilities, mustachify, prepFacilities, resizeDisplayWindowAndFacilityTable,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  launch_facilities = function() {
    var district, params;
    params = {};
    if (("" + window.location.search).match(/facility=(\d+)/)) {
      params.facilityId = ("" + window.location.search).match(/facility=(\d+)/)[1];
    }
    $("#conditional-content").hide();
    _.each(this.params, function(param, pname) {
      if ($.type(param) === "string" && param !== "") {
        return params[pname] = param.replace("/", "");
      }
    });
    district = NMIS.getDistrictByUrlCode("" + params.state + "/" + params.lga);
    NMIS._currentDistrict = district;
    log(NMIS._currentDistrict);
    if (params.sector === "overview") {
      params.sector = undefined;
    }
    return get_sectorsReq().done(function() {
      var facilities_req, profile_data_req, variables_req;
      prepFacilities(params);
      if (__indexOf.call(district.data_modules, "facilities") < 0) {
        throw "'facilities' is not a listed data_module for " + district.url_code;
      }
      facilities_req = NMIS.DataLoader.fetch(district.module_url("facilities"));
      if (__indexOf.call(district.data_modules, "variables") >= 0) {
        variables_req = NMIS.DataLoader.fetch(district.module_url("variables"));
      } else {
        variables_req = NMIS.DataLoader.fetch(NMIS._defaultVariableUrl_);
      }
      if (__indexOf.call(district.data_modules, "profile_data") >= 0) {
        profile_data_req = NMIS.DataLoader.fetch(district.module_url("profile_data"));
      }
      return $.when(facilities_req, variables_req, profile_data_req).done(function(req1, req2) {
        var lgaData, variableData;
        lgaData = req1[0];
        variableData = req2[0];
        return launchFacilities(lgaData, variableData, params);
      });
    });
  };

  NMIS.launch_facilities = launch_facilities;

  prepFacilities = function(params) {
    var bcValues, e, facilitiesMode, lga, state;
    NMIS.DisplayWindow.setVisibility(true);
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

  mustachify = function(id, obj) {
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


  launchFacilities = function(lgaData, variableData, params) {
    var MapMgr_opts, createFacilitiesMap, dTableHeight, displayTitle, e, facilities, lga, mapZoom, obj, sector, sectors, state, tableElem, twrap;
    lga = NMIS._currentDistrict;
    state = NMIS._currentDistrict.group;
    createFacilitiesMap = function() {
      var bounds, facilitiesMap, iconURLData, ll, mapClick, markerClick, markerMouseout, markerMouseover;
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
            facilityId: this.nmis.id
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
            facilityId: false
          })));
        }
      };
      ll = _.map(lga.latLng.split(","), function(x) {
        return +x;
      });
      if (!!facilitiesMap) {
        _.delay((function() {
          if (lga.bounds) {
            facilitiesMap.fitBounds(lga.bounds);
          } else {
            facilitiesMap.setCenter(new google.maps.LatLng(ll[0], ll[1]));
          }
          return google.maps.event.trigger(facilitiesMap, "resize");
        }), 1);
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
        var $gm, iconData, iconDataForItem, mI;
        if (!!item._ll && !this.mapItem(id)) {
          $gm = google.maps;
          iconData = (iconDataForItem = function(i) {
            var td;
            i.iconSlug = i.iconType || i.sector.slug;
            td = iconURLData(i);
            return {
              url: td[0],
              size: new $gm.Size(td[1], td[2])
            };
          })(item);
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
      _.delay((function() {
        google.maps.event.trigger(facilitiesMap, "resize");
        return facilitiesMap.fitBounds(bounds);
      }), 1);
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
    if (lgaData.profileData === undefined) {
      lgaData.profileData = {};
    }
    if (lgaData.profileData.gps === undefined) {
      lgaData.profileData.gps = {
        value: "40.809587 -73.953223 183.0 4.0"
      };
    }
    facilities = lgaData.facilities;
    sectors = variableData.sectors;
    sector = NMIS.Sectors.pluck(params.sector);
    e = {
      state: state,
      lga: lga,
      mode: "facilities",
      sector: sector,
      subsector: sector.getSubsector(params.subsector),
      indicator: sector.getIndicator(params.indicator),
      facilityId: params.facilityId
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
      llString: lgaData.profileData.gps.value,
      elem: NMIS._wElems.elem0
    };
    mapZoom = 8;
    if (NMIS.MapMgr.isLoaded()) {
      createFacilitiesMap();
    } else {
      NMIS.MapMgr.addLoadCallback(createFacilitiesMap);
      NMIS.MapMgr.init();
    }
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
      displayTitle = "Facility Detail: " + lga.name + " Overview";
      NMIS.DisplayWindow.setTitle(displayTitle);
      NMIS.IconSwitcher.shiftStatus(function(id, item) {
        return "normal";
      });
      obj = {
        facCount: "15",
        lgaName: "" + lga.name + ", " + state.name,
        overviewSectors: [],
        profileData: _.map(profileData, function(d) {
          var val;
          val = "";
          if (d[1] === null || d[1] === undefined) {
            val = DisplayValue.raw("--")[0];
          } else if (d[1].value !== undefined) {
            val = DisplayValue.raw(d[1].value)[0];
          } else {
            val = DisplayValue.raw("--");
          }
          return {
            name: d[0],
            value: val
          };
        })
      };
      _.each(NMIS.Sectors.all(), function(s) {
        var c;
        c = 0;
        _.each(NMIS.data(), function(d) {
          if (d.sector === s) {
            return c++;
          }
        });
        return obj.overviewSectors.push({
          name: s.name,
          slug: s.slug,
          url: NMIS.urlFor(_.extend(NMIS.Env(), {
            sector: s,
            subsector: false
          })),
          counts: c
        });
      });
      NMIS._wElems.elem1content.html(mustachify("facilities-overview", obj));
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
      displayTitle = "Facility Detail: " + lga.name + " " + e.sector.name;
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
          var mm;
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
          mm = $(mustachify("indicator-feature", obj));
          mm.find("a.close").click(function() {
            var xx;
            xx = NMIS.urlFor(_.extend({}, e, {
              indicator: false
            }));
            dashboard.setLocation(xx);
            return false;
          });
          mm.prependTo(NMIS._wElems.elem1content);
          return (function(pcWrap) {
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
              return createOurGraph(pcWrap, pieChartDisplayDefinitions, tabulations, {});
            }
          })(mm.find(".raph-circle").get(0));
        })();
      }
    }
    resizeDisplayWindowAndFacilityTable();
    if (!!e.facilityId) {
      return NMIS.FacilitySelector.activate({
        id: e.facilityId
      });
    }
  };

  facilitiesMapCreated = void 0;

  facilitiesMap = void 0;

  /*
  TODO: something about these NMIS.DataLoader
  */


  get_lgaDataReq = function() {
    var _lgaDataReq;
    _lgaDataReq = NMIS.DataLoader.fetch(NMIS._lgaFacilitiesDataUrl_);
    return _lgaDataReq;
  };

  get_variableDataReq = function() {
    var _variableDataReq;
    _variableDataReq = NMIS.DataLoader.fetch(NMIS._defaultVariableUrl_);
    return _variableDataReq;
  };

  get_sectorsReq = function() {
    var _sectorReq;
    _sectorReq = NMIS.DataLoader.fetch(NMIS._defaultSectorUrl_);
    _sectorReq.done(function(s) {
      return NMIS.loadSectors(s.sectors, {
        "default": {
          name: "Overview",
          slug: "overview"
        }
      });
    });
    return _sectorReq;
  };

  dashboard.get("" + NMIS.url_root + "#/:state/:lga/facilities/?(#.*)?", NMIS.launch_facilities);

  dashboard.get("" + NMIS.url_root + "#/:state/:lga/facilities/:sector/?(#.*)?", NMIS.launch_facilities);

  dashboard.get("" + NMIS.url_root + "#/:state/:lga/facilities/:sector/:subsector/?(#.*)?", NMIS.launch_facilities);

  dashboard.get("" + NMIS.url_root + "#/:state/:lga/facilities/:sector/:subsector/:indicator/?(#.*)?", NMIS.launch_facilities);

}).call(this);
