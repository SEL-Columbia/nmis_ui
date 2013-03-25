(function() {
  var loadMapLayers,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  loadMapLayers = function() {
    var dfd;
    if (NMIS._mapLayersModule_ != null) {
      return NMIS._mapLayersModule_.fetch();
    } else {
      dfd = $.Deferred();
      dfd.reject("map_layers not found");
      return dfd.promise();
    }
  };

  (function() {
    var activateNavigation, countryViewPanel, cvp, panelClose, panelOpen;
    activateNavigation = function(wrap) {
      var navId;
      navId = "#zone-navigation";
      if (!wrap.hasClass("zone-nav-activated")) {
        wrap.on("click", "" + navId + " a.state-link", function(evt) {
          var isShowing, ul;
          ul = $(this).parents("li").eq(0).find("ul");
          isShowing = ul.hasClass("showing");
          wrap.find("" + navId + " .showing").removeClass("showing");
          if (!isShowing) {
            ul.addClass("showing");
          }
          return false;
        });
      }
      return wrap.addClass("zone-nav-activated");
    };
    cvp = false;
    countryViewPanel = function() {
      var wrap;
      wrap = $(".content");
      if (!cvp) {
        cvp = $("<div>", {
          "class": "country-view"
        });
        activateNavigation(wrap);
      }
      if (cvp.closest("html").length === 0) {
        cvp.appendTo(".content");
      }
      return cvp;
    };
    panelOpen = function() {
      var data;
      NMIS.LocalNav.hide();
      NMIS.Breadcrumb.clear();
      NMIS.Breadcrumb.setLevels([["Country View", "/"]]);
      data = {
        title: "Nigeria",
        zones: NMIS._zones_
      };
      return countryViewPanel().html($._template("#country-view-tmpl", data));
    };
    panelClose = function() {
      return countryViewPanel().detach();
    };
    return NMIS.panels.getPanel("country_view").addCallbacks({
      open: panelOpen,
      close: panelClose
    });
  })();

  NMIS.MainMdgMap = (function() {
    var changeLayer, createLayerSwitcher, launchCountryMapInElem, mdgLayers;
    mdgLayers = [];
    changeLayer = function(slug) {
      return log("change ", slug);
    };
    launchCountryMapInElem = function(eselector) {
      var $elem, launcher, layerIdsAndNames;
      layerIdsAndNames = [];
      $elem = $(eselector).css({
        width: 680,
        height: 476,
        position: 'absolute'
      });
      launcher = NMIS.loadOpenLayers();
      launcher.done(function() {
        var centroid, dispProj, elem, googProj, layerId, layerName, map, mapId, mapLayerArray, mapLayers, mapserver, mdgL, meA, meB, meC, meD, options, overlays, reA, reB, reC, reD, zoom, _fn, _i, _len, _ref, _ref1;
        OpenLayers._getScriptLocation = function() {
          return NMIS.settings.openLayersRoot;
        };
        $(".map-loading-message").hide();
        elem = $elem.get(0);
        mapId = "nmis-ol-country-map";
        $elem.prop('id', mapId);
        _ref = [-4783.9396188051, 463514.13943762, 1707405.4936624, 1625356.9691642], reA = _ref[0], reB = _ref[1], reC = _ref[2], reD = _ref[3];
        _ref1 = [-20037500, -20037500, 20037500, 20037500], meA = _ref1[0], meB = _ref1[1], meC = _ref1[2], meD = _ref1[3];
        OpenLayers.ImgPath = "" + NMIS.settings.openLayersRoot + "theme/default/img/";
        OpenLayers.IMAGE_RELOAD_ATTEMPTS = 0;
        googProj = new OpenLayers.Projection("EPSG:900913");
        dispProj = new OpenLayers.Projection("EPSG:4326");
        options = {
          projection: googProj,
          displayProjection: dispProj,
          units: "m",
          maxResolution: 156543.0339,
          restrictedExtent: new OpenLayers.Bounds(reA, reB, reC, reD),
          maxExtent: new OpenLayers.Bounds(meA, meB, meC, meD),
          numZoomLevels: 11
        };
        centroid = {
          lat: 649256.11813719,
          lng: 738031.10112355
        };
        options.centroid = new OpenLayers.LonLat(centroid.lng, centroid.lat);
        zoom = 6;
        options.zoom = zoom;
        overlays = [["Boundaries", "nigeria_base"]];
        map = new OpenLayers.Map(mapId, options);
        mapserver = ["http://b.tiles.mapbox.com/modilabs/"];
        mapLayers = {};
        mapLayerArray = (function() {
          var _i, _len, _ref2, _results;
          _results = [];
          for (_i = 0, _len = overlays.length; _i < _len; _i++) {
            _ref2 = overlays[_i], layerName = _ref2[0], layerId = _ref2[1];
            _results.push(mapLayers[layerId] = new OpenLayers.Layer.TMS(layerName, mapserver, {
              layername: layerId,
              type: "png",
              transparent: "true",
              isBaseLayer: false
            }));
          }
          return _results;
        })();
        _fn = function() {
          var curMdgL, mlx;
          curMdgL = mdgL;
          mlx = new OpenLayers.Layer.TMS(curMdgL.name, mapserver, {
            layername: curMdgL.slug,
            type: "png"
          });
          mapLayerArray.push(mlx);
          return curMdgL.onSelect = function() {
            map.setBaseLayer(mlx);
            return this.show_description();
          };
        };
        for (_i = 0, _len = mdgLayers.length; _i < _len; _i++) {
          mdgL = mdgLayers[_i];
          _fn();
        }
        map.addLayers(mapLayerArray);
        map.setBaseLayer(mapLayers.nigeria_base);
        map.setCenter(new OpenLayers.LonLat(options.centroid.lng, options.centroid.lat), zoom);
        return map.addControl(new OpenLayers.Control.LayerSwitcher());
      });
      return launcher.fail(function() {
        return log("LAUNCHER FAIL! Scripts not loaded");
      });
    };
    createLayerSwitcher = (function() {
      var MDGLayer, createSelectBox, layersByMdg, layersBySlug, layersWitoutMdg, mdgs, plsSelectMsg, sb, selectBoxChange;
      layersWitoutMdg = [];
      layersByMdg = {};
      mdgs = [];
      sb = false;
      layersBySlug = {};
      plsSelectMsg = "Please select an indicator map...";
      MDGLayer = (function() {

        function MDGLayer(_arg) {
          var _ref;
          this.data_source = _arg.data_source, this.description = _arg.description, this.display_order = _arg.display_order, this.sector_string = _arg.sector_string, this.mdg = _arg.mdg, this.slug = _arg.slug, this.legend_data = _arg.legend_data, this.indicator_key = _arg.indicator_key, this.level_key = _arg.level_key, this.id = _arg.id, this.name = _arg.name;
          mdgLayers.push(this);
          layersBySlug[this.slug] = this;
          if (_ref = this.mdg, __indexOf.call(mdgs, _ref) < 0) {
            mdgs.push(this.mdg);
          }
          if (this.mdg) {
            if (!layersByMdg[this.mdg]) {
              layersByMdg[this.mdg] = [];
            }
            layersByMdg[this.mdg].push(this);
          } else {
            layersWitoutMdg.push(this);
          }
        }

        MDGLayer.prototype.show_description = function() {
          var descWrap, goalText;
          descWrap = $(".mn-iiwrap");
          goalText = NMIS.mdgGoalText(this.mdg);
          descWrap.find(".mdg-display").html(goalText);
          return descWrap.find("div.layer-description").html($("<p>", {
            text: this.description
          }));
        };

        MDGLayer.prototype.$option = function() {
          return $("<option>", {
            value: this.slug,
            text: this.name
          });
        };

        return MDGLayer;

      })();
      ({
        onSelect: function() {}
      });
      selectBoxChange = function() {
        return layersBySlug[$(this).val()].onSelect();
      };
      createSelectBox = function() {
        var layer, mdg, og, _i, _j, _len, _len1, _ref, _ref1;
        sb = $("<select>", {
          title: plsSelectMsg,
          style: "width:100%",
          change: selectBoxChange
        });
        _ref = mdgs.sort();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          mdg = _ref[_i];
          if (!(mdg != null)) {
            continue;
          }
          sb.append(og = $("<optgroup>", {
            label: "MDG " + mdg
          }));
          _ref1 = layersByMdg[mdg];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            layer = _ref1[_j];
            og.append(layer.$option());
          }
        }
        return sb;
      };
      return function(mlData, selectBoxWrap) {
        var mld, _i, _len;
        for (_i = 0, _len = mlData.length; _i < _len; _i++) {
          mld = mlData[_i];
          new MDGLayer(mld);
        }
        return selectBoxWrap.html(createSelectBox()).children().chosen();
      };
    })();
    return {
      launchCountryMapInElem: launchCountryMapInElem,
      createLayerSwitcher: createLayerSwitcher
    };
  })();

  (function() {
    return NMIS.mdgGoalText = function(gn) {
      return ["Goal 1 &raquo; Eradicate extreme poverty and hunger", "Goal 2 &raquo; Achieve universal primary education", "Goal 3 &raquo; Promote gender equality and empower women", "Goal 4 &raquo; Reduce child mortality rates", "Goal 5 &raquo; Improve maternal health", "Goal 6 &raquo; Combat HIV/AIDS, malaria, and other diseases", "Goal 7 &raquo; Ensure environmental sustainability", "Goal 8 &raquo; Develop a global partnership for development"][gn - 1];
    };
  })();

  (function() {
    return NMIS.CountryView = function() {
      var ml;
      NMIS.panels.changePanel("country_view");
      ml = loadMapLayers();
      ml.done(function(mlData) {
        var mdgLayerSelectBox;
        $(".resizing-map").show();
        mdgLayerSelectBox = $(".layer-nav");
        NMIS.MainMdgMap.createLayerSwitcher(mlData, mdgLayerSelectBox);
        return NMIS.MainMdgMap.launchCountryMapInElem(".home-map", mlData);
      });
      return ml.fail(function(msg) {
        return $(".resizing-map").hide();
      });
    };
  })();

}).call(this);
