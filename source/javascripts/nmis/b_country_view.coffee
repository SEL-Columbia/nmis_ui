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

_changeLayer = false

NMIS.MainMdgMap = do ->
  changeLayer = (slug)->
    log "change ", slug

  launchMapInElem = (eselector)->
    layerIdsAndNames = []
    $(eselector).css width: 400, height: 400, position: 'absolute'
    launcher = NMIS.loadGmapsAndOpenlayers()
      # defaultLayer: ''
      # layers: layerIdsAndNames
      # loadingMessage: 'Please be patient while this map loads'
      # loadingElem: '.map-loading-message'
      # layerSwitcher: false
      # elem: eselector
    launcher.done ()->
      log "LAUNCHER DONE! Scripts loaded"
    launcher.fail ()->
      log "LAUNCHER FAIL! Scripts not loaded"

  createLayerSwitcher = do ->
    layersWitoutMdg = []
    layersByMdg = {}
    mdgLayers = []
    mdgs = []
    sb = false
    plsSelectMsg = "Please select an indicator map..."

    class MDGLayer
      constructor: ({@data_source, @description, @display_order,
                      @sector_string, @mdg, @slug, @legend_data,
                      @indicator_key, @level_key, @id, @name})->
        mdgLayers.push @
        mdgs.push @mdg unless @mdg in mdgs
        if @mdg
          layersByMdg[@mdg] = []  unless layersByMdg[@mdg]
          layersByMdg[@mdg].push @
        else
          layersWitoutMdg.push @

      $option: ->
        $ "<option>", value: @slug, text: @name

    selectBoxChange = ()-> changeLayer $(@).val()

    createSelectBox = ->
      sb = $ "<select>", title: plsSelectMsg, style: "width:100%", change: selectBoxChange
      for mdg in mdgs.sort() when mdg?
        sb.append og = $ "<optgroup>", label: "MDG #{mdg}"
        og.append layer.$option()  for layer in layersByMdg[mdg]
      sb

    (mlData, selectBoxWrap)->
      new MDGLayer mld  for mld in mlData
      selectBoxWrap.html(createSelectBox()).children().chosen()

  launchMapInElem: launchMapInElem
  createLayerSwitcher: createLayerSwitcher

do ->
  NMIS.CountryView = ()->
    NMIS.panels.changePanel "country_view"
    ml = loadMapLayers()
    ml.done (mlData)->
      $(".resizing-map").show()
      mdgLayerSelectBox = $(".layer-nav")
      NMIS.MainMdgMap.createLayerSwitcher mlData, mdgLayerSelectBox
      NMIS.MainMdgMap.launchMapInElem ".home-map"
    ml.fail (msg)->
      $(".resizing-map").hide()
