loadMapLayers = ()->
  if NMIS._mapLayersModule_?
    NMIS._mapLayersModule_.fetch()
  else
    dfd = $.Deferred()
    dfd.reject "map_layers not found"
    dfd.promise()

do ->
  activateNavigation = (wrap)->
    navId = "#zone-navigation"
    unless wrap.hasClass("zone-nav-activated")
      wrap.on "click", "#{navId} a.state-link", (evt)->
        ul = $(@).parents("li").eq(0).find("ul")
        isShowing = ul.hasClass "showing"
        wrap.find("#{navId} .showing").removeClass("showing")
        ul.addClass "showing" unless isShowing
        false
    wrap.addClass "zone-nav-activated"

  cvp = false
  countryViewPanel = ()->
    wrap = $(".content")
    unless cvp
      cvp = $("<div>", class: "country-view")
      activateNavigation wrap
    if cvp.closest("html").length is 0
      cvp.appendTo(".content")
    cvp

  panelOpen = ()->
    NMIS.LocalNav.hide()
    NMIS.Breadcrumb.clear()
    NMIS.Breadcrumb.setLevels [["Country View", "/"]]
    data =
      title: "Nigeria"
      zones: NMIS._zones_
    countryViewPanel().html $._template "#country-view-tmpl", data
    # cvp.find("#map").hide()

  panelClose = ()->
    countryViewPanel().detach()

  NMIS.panels.getPanel("country_view").addCallbacks open: panelOpen, close: panelClose

NMIS.MainMdgMap = do ->
  mdgLayers = []

  changeLayer = (slug)->
    log "change ", slug

  launchCountryMapInElem = (eselector)->
    layerIdsAndNames = []
    $elem = $(eselector).css width: 680, height: 476, position: 'absolute'
    launcher = NMIS.loadOpenLayers()
    launcher.done ()->
      elem = $elem.get(0)
      mapId = "nmis-ol-country-map"
      $elem.prop 'id', mapId
      [reA, reB, reC, reD] = [-4783.9396188051, 463514.13943762, 1707405.4936624, 1625356.9691642]
      [meA, meB, meC, meD] = [-20037500, -20037500, 20037500, 20037500]

      OpenLayers.ImgPath = "openlayers/default/img/"
      OpenLayers.IMAGE_RELOAD_ATTEMPTS = 0

      googProj = new OpenLayers.Projection("EPSG:900913")
      dispProj = new OpenLayers.Projection("EPSG:4326")

      options =
        projection: googProj
        displayProjection: dispProj
        units: "m"
        maxResolution: 156543.0339
        restrictedExtent: new OpenLayers.Bounds(reA, reB, reC, reD)
        maxExtent: new OpenLayers.Bounds(meA, meB, meC, meD)

      centroid =
        lat: 649256.11813719
        lng: 738031.10112355

      options.centroid = new OpenLayers.LonLat centroid.lng, centroid.lat
      zoom = 6
      options.zoom = zoom

      overlays = [["Boundaries", "nigeria_base"]]

      map = new OpenLayers.Map mapId, options
      mapserver = ["http://b.tiles.mapbox.com/modilabs/"]
      mapLayers = {}
      mapLayerArray = for [layerName, layerId] in overlays
        mapLayers[layerId] = new OpenLayers.Layer.TMS layerName, mapserver,
          layername: layerId
          type: "png"
          transparent: "true"
          isBaseLayer: false
      for mdgL in mdgLayers
        do ->
          curMdgL = mdgL
          mlx = new OpenLayers.Layer.TMS curMdgL.name, mapserver,
            layername: curMdgL.slug
            type: "png"
          mapLayerArray.push mlx
          curMdgL.onSelect = ()-> map.setBaseLayer mlx

      map.addLayers mapLayerArray
      map.setBaseLayer mapLayers.nigeria_base

      map.setCenter new OpenLayers.LonLat(options.centroid.lng, options.centroid.lat), zoom
      map.addControl new OpenLayers.Control.LayerSwitcher()

    launcher.fail ()->
      log "LAUNCHER FAIL! Scripts not loaded"

  createLayerSwitcher = do ->
    layersWitoutMdg = []
    layersByMdg = {}
    mdgs = []
    sb = false
    layersBySlug = {}
    plsSelectMsg = "Please select an indicator map..."

    class MDGLayer
      constructor: ({@data_source, @description, @display_order,
                      @sector_string, @mdg, @slug, @legend_data,
                      @indicator_key, @level_key, @id, @name})->
        mdgLayers.push @
        layersBySlug[@slug] = @
        mdgs.push @mdg unless @mdg in mdgs
        if @mdg
          layersByMdg[@mdg] = []  unless layersByMdg[@mdg]
          layersByMdg[@mdg].push @
        else
          layersWitoutMdg.push @

      $option: ->
        $ "<option>", value: @slug, text: @name

    onSelect: ()->
    selectBoxChange = ()->
      layersBySlug[$(@).val()].onSelect()

    createSelectBox = ->
      sb = $ "<select>", title: plsSelectMsg, style: "width:100%", change: selectBoxChange
      for mdg in mdgs.sort() when mdg?
        sb.append og = $ "<optgroup>", label: "MDG #{mdg}"
        og.append layer.$option()  for layer in layersByMdg[mdg]
      sb

    (mlData, selectBoxWrap)->
      new MDGLayer mld  for mld in mlData
      selectBoxWrap.html(createSelectBox()).children().chosen()

  launchCountryMapInElem: launchCountryMapInElem
  createLayerSwitcher: createLayerSwitcher

do ->
  NMIS.CountryView = ()->
    NMIS.panels.changePanel "country_view"
    ml = loadMapLayers()
    ml.done (mlData)->
      $(".resizing-map").show()
      mdgLayerSelectBox = $(".layer-nav")
      NMIS.MainMdgMap.createLayerSwitcher mlData, mdgLayerSelectBox
      NMIS.MainMdgMap.launchCountryMapInElem ".home-map", mlData
    ml.fail (msg)->
      $(".resizing-map").hide()
