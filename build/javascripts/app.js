(function() {
  var overviewObj, url_root, wElems;

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

  NMIS.loadSectors(sectorData, {
    "default": {
      name: "Overview",
      slug: "overview"
    }
  });

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

/*
Facilities:
*/


(function() {
  var facilitiesMap, facilitiesMapCreated, launchFacilities, launch_facilities, lgaDataReq, mustachify, prepFacilities, resizeDisplayWindowAndFacilityTable, variableDataReq;

  launch_facilities = function() {
    var params;
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
    if (params.sector === "overview") {
      params.sector = undefined;
    }
    prepFacilities(params);
    return $.when(lgaDataReq, variableDataReq).done(function(req1, req2) {
      var lgaData, variableData;
      lgaData = req1[0];
      variableData = req2[0];
      return launchFacilities(lgaData, variableData, params);
    });
  };

  NMIS.launch_facilities = launch_facilities;

  prepFacilities = function(params) {
    var bcValues, e, facilitiesMode;
    NMIS.DisplayWindow.setVisibility(true);
    facilitiesMode = {
      name: "Facility Detail",
      slug: "facilities"
    };
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
    var MapMgr_opts, createFacilitiesMap, dTableHeight, displayTitle, e, facilities, mapZoom, obj, sector, sectors, tableElem, twrap;
    createFacilitiesMap = function() {
      var bounds, facilitiesMap, iconURLData, ll, mapClick, markerClick, markerMouseout, markerMouseover;
      iconURLData = function(item) {
        var sectorIconURL, slug, status;
        sectorIconURL = function(slug, status) {
          var iconFiles, url;
          iconFiles = {
            education: "education.png",
            health: "health.png",
            water: "water.png",
            "default": "book_green_wb.png"
          };
          url = "./images/icons_f/" + status + "_" + (iconFiles[slug] || iconFiles["default"]);
          return url;
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
      state: state.slug,
      lga: lga.slug,
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


  lgaDataReq = NMIS.DataLoader.fetch("" + NMIS.url_root + "pvt_data/facility_data.json");

  variableDataReq = NMIS.DataLoader.fetch("" + NMIS.url_root + "pvt_data/facility_variables.json");

  dashboard.get("" + NMIS.url_root + "#/:state/:lga/facilities/?(#.*)?", NMIS.launch_facilities);

  dashboard.get("" + NMIS.url_root + "#/:state/:lga/facilities/:sector/?(#.*)?", NMIS.launch_facilities);

  dashboard.get("" + NMIS.url_root + "#/:state/:lga/facilities/:sector/:subsector/?(#.*)?", NMIS.launch_facilities);

  dashboard.get("" + NMIS.url_root + "#/:state/:lga/facilities/:sector/:subsector/:indicator/?(#.*)?", NMIS.launch_facilities);

}).call(this);
(function() {
  var loadSummary, summaryMap;

  loadSummary = function(s) {
    var bcValues, displayConditionalContent, initSummaryMap, params, _env;
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
    NMIS.DisplayWindow.setVisibility(false);
    NMIS.DisplayWindow.setDWHeight();
    params = s.params;
    _env = {
      mode: {
        name: "Summary",
        slug: "summary"
      },
      state: state,
      lga: lga,
      sector: NMIS.Sectors.pluck(params.sector) || overviewObj
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
    return (displayConditionalContent = function(sector) {
      var cc;
      cc = $("#conditional-content").hide();
      cc.find(">div").hide();
      cc.find(">div.lga." + sector.slug).show();
      return cc.show();
    })(_env.sector);
  };

  summaryMap = void 0;

  dashboard.get("" + NMIS.url_root + "#/:state/:lga/summary/?(#.*)?", loadSummary);

  dashboard.get("" + NMIS.url_root + "#/:state/:lga/summary/:sector/?(#.*)?", loadSummary);

  dashboard.get("" + NMIS.url_root + "#/:state/:lga/summary/:sector/:subsector/?(#.*)?", loadSummary);

  dashboard.get("" + NMIS.url_root + "#/:state/:lga/summary/:sector/:subsector/:indicator/?(#.*)?", loadSummary);

}).call(this);
(function() {
  var env;

  $(".url-for").each(function() {
    var d;
    d = $(this).data("urlFor");
    return $(this).attr("href", NMIS.urlFor(_.extend({
      lga: lga.slug,
      state: state.slug
    }, d)));
  });

  env = {
    root: "" + NMIS.url_root + "#",
    state: state,
    lga: lga
  };

  NMIS.Breadcrumb.init("p.bc", {
    levels: [[state.name, env.root], [lga.name, ("" + NMIS.url_root + "#/") + state.slug + "/" + lga.slug + "/"]]
  });

  /*
  Run the app.
  */


  dashboard.run();

}).call(this);





