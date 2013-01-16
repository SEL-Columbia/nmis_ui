(function() {

  NMIS.loadGoogleMaps = (function() {
    var googleMapsDfd, loadStarted;
    loadStarted = false;
    googleMapsDfd = $.Deferred();
    window.googleMapsLoaded = function() {
      if ((typeof google !== "undefined" && google !== null ? google.maps : void 0) != null) {
        return googleMapsDfd.resolve(google.maps);
      } else {
        return googleMapsDfd.reject({}, "error", "Failed to load Google Maps");
      }
    };
    return function() {
      var s;
      if (!loadStarted) {
        loadStarted = true;
        s = document.createElement("script");
        s.src = "http://maps.googleapis.com/maps/api/js?sensor=false&callback=googleMapsLoaded";
        document.body.appendChild(s);
      }
      return googleMapsDfd.promise();
    };
  })();

  NMIS.loadOpenLayers = function(url) {
    if (url == null) {
      url = "javascripts/OpenLayers.js";
    }
    return $.ajax({
      url: url,
      dataType: "script",
      cache: false
    });
  };

  NMIS.loadGmapsAndOpenlayers = (function() {
    var launchDfd, scriptsStarted;
    launchDfd = $.Deferred();
    scriptsStarted = false;
    return function() {
      var gmLoad;
      if (!scriptsStarted) {
        scriptsStarted = true;
        gmLoad = NMIS.loadGoogleMaps();
        gmLoad.done(function(gmaps) {
          var olLoad;
          olLoad = NMIS.loadOpenLayers();
          olLoad.done(function(ol) {
            return launchDfd.resolve();
          });
          return olLoad.fail(function(o, err, message) {
            return launchDfd.reject(o, err, message);
          });
        });
        gmLoad.fail(function(o, err, message) {
          return launchDfd.reject(o, err, message);
        });
      }
      return launchDfd.promise();
    };
  })();

  NMIS.launchOpenLayers = (function() {
    var context, defaultOpts, launch, launchDfd, loadingMessageElement, mapElem, opts, scriptsAreLoaded, scriptsFinished, scriptsStarted;
    launchDfd = $.Deferred();
    scriptsStarted = false;
    scriptsFinished = false;
    mapElem = void 0;
    opts = void 0;
    context = {};
    loadingMessageElement = false;
    defaultOpts = {
      elem: "#map",
      centroid: {
        lat: 0.000068698255561324,
        lng: 0.000083908685869343
      },
      olImgPath: "/static/openlayers/default/img/",
      tileUrl: "http://b.tiles.mapbox.com/modilabs/",
      layers: [["Nigeria", "nigeria_base"]],
      overlays: [],
      defaultLayer: "google",
      layerSwitcher: true,
      loadingElem: false,
      loadingMessage: "Please be patient while this map loads...",
      zoom: 6,
      maxExtent: [-20037500, -20037500, 20037500, 20037500],
      restrictedExtent: [-4783.9396188051, 463514.13943762, 1707405.4936624, 1625356.9691642]
    };
    scriptsAreLoaded = function() {
      var googleMap, googleSat, ifDefined, mapId, mapLayerArray, mapserver, ob, options, re;
      ifDefined = function(str) {
        if (str === "" || str === undefined) {
          return undefined;
        } else {
          return str;
        }
      };
      if (!!loadingMessageElement) {
        loadingMessageElement.hide();
      }
      OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
      OpenLayers.ImgPath = opts.olImgPath;
      ob = opts.maxExtent;
      re = opts.restrictedExtent;
      options = {
        projection: new OpenLayers.Projection("EPSG:900913"),
        displayProjection: new OpenLayers.Projection("EPSG:4326"),
        units: "m",
        maxResolution: 156543.0339,
        restrictedExtent: new OpenLayers.Bounds(re[0], re[1], re[2], re[3]),
        maxExtent: new OpenLayers.Bounds(ob[0], ob[1], ob[2], ob[3])
      };
      mapId = mapElem.get(0).id;
      mapserver = opts.tileUrl;
      mapLayerArray = [];
      context.mapLayers = {};
      $.each(opts.overlays, function(k, ldata) {
        var ml;
        ml = new OpenLayers.Layer.TMS(ldata[0], [mapserver], {
          layername: ldata[1],
          type: "png",
          transparent: "true",
          isBaseLayer: false
        });
        mapLayerArray.push(ml);
        return context.mapLayers[ldata[1]] = ml;
      });
      $.each(opts.layers, function(k, ldata) {
        var ml;
        ml = new OpenLayers.Layer.TMS(ldata[0], [mapserver], {
          layername: ldata[1],
          type: "png"
        });
        mapLayerArray.push(ml);
        return context.mapLayers[ldata[1]] = ml;
      });
      context.waxLayerDict = {};
      context.activeWax;
      if (!mapId) {
        mapId = mapElem.get(0).id = "-openlayers-map-elem";
      }
      context.map = new OpenLayers.Map(mapId, options);
      window.__map = context.map;
      googleSat = new OpenLayers.Layer.Google("Google", {
        type: "satellite"
      });
      googleMap = new OpenLayers.Layer.Google("Roads", {
        type: "roadmap"
      });
      mapLayerArray.push(googleSat, googleMap);
      context.map.addLayers(mapLayerArray);
      if (opts.defaultLayer === "google") {
        context.map.setBaseLayer(googleSat);
      }
      if (opts.layerSwitcher) {
        context.map.addControl(new OpenLayers.Control.LayerSwitcher());
      }
      return scriptsFinished = true;
    };
    return launch = function(_opts) {
      var gmLoad;
      if (opts === undefined) {
        opts = $.extend({}, defaultOpts, _opts);
      }
      if (mapElem === undefined) {
        mapElem = $(opts.elem);
      }
      if (!!opts.loadingElem && !!opts.loadingMessage) {
        loadingMessageElement = $(opts.loadingElem).text(opts.loadingMessage).show();
      }
      if (!scriptsStarted) {
        scriptsStarted = true;
        gmLoad = NMIS.loadGoogleMaps();
        gmLoad.done(function(gmaps) {
          var olLoad;
          olLoad = NMIS.loadOpenLayers();
          olLoad.done(function(ol) {
            scriptsAreLoaded();
            return launchDfd.resolve();
          });
          return olLoad.fail(function(o, err, message) {
            return launchDfd.reject(o, err, message);
          });
        });
        gmLoad.fail(function(o, err, message) {
          return launchDfd.reject(o, err, message);
        });
      }
      return launchDfd.promise();
    };
  })();

}).call(this);
