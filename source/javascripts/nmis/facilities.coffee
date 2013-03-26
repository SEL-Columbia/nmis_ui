###
Facilities:
###

do ->
  panelOpen = ()->
    NMIS.DisplayWindow.show()
    NMIS.LocalNav.show()

  panelClose = ()->
    NMIS.DisplayWindow.hide()
    NMIS.LocalNav.hide()

  NMIS.panels.getPanel("facilities").addCallbacks open: panelOpen, close: panelClose

facilitiesMode =
  name: "Facility Detail"
  slug: "facilities"

# used in the breadcrumb
_standardBcSlugs = "state lga mode sector subsector indicator".split(" ")

NMIS.Env.onChange (next, prev)->
  # log "Changing mode"  if @changing "mode"
  # log "Changing LGA"  if @changing "lga"

  if @changingToSlug "mode", "facilities"
    log "Changing to facilities"
    # This runs only when the environment is *changing to* the "mode" of "facilities"
    NMIS.panels.changePanel "facilities"

  if @usingSlug "mode", "facilities"
    # This runs when the upcoming environment matches "mode" of "facilities"
    NMIS.LocalNav.markActive ["mode:facilities", "sector:#{next.sector.slug}"]

    NMIS.Breadcrumb.clear()
    breadcrumbValues = NMIS._prepBreadcrumbValues next, _standardBcSlugs, state: next.state, lga: next.lga
    NMIS.Breadcrumb.setLevels breadcrumbValues

    NMIS.LocalNav.iterate (sectionType, buttonName, a) ->
      env = _.extend {}, next, subsector: false
      env[sectionType] = buttonName
      a.attr "href", NMIS.urlFor env

NMIS.launch_facilities = ->

  params = {}

  params.facility = ("" + window.location.search).match(/facility=(\d+)/)[1]  if ("" + window.location.search).match(/facility=(\d+)/)

  for own paramName, val of @params when $.type(val) is "string" and val isnt ""
    params[paramName] = val.replace "/", ""

  district = NMIS.getDistrictByUrlCode "#{params.state}/#{params.lga}"
  NMIS.districtDropdownSelect district

  NMIS._currentDistrict = district
  params.sector = `undefined`  if params.sector is "overview"
  ###
  We ALWAYS need to load the sectors first (either cached or not) in order
  to determine if the sector is valid.
  ###
  district.sectors_data_loader().done ->
    # once the sectors are downloaded, we can set the environment
    # variables.

    # and ensure the correct DOM elements exists and are visible
    NMIS.panels.changePanel "facilities"

    NMIS.Env do ->
      ###
      This self-invoking function returns and sets the environment
      object which we will be using for the page view.
      ###
      e =
        lga: district
        state: district.group
        mode: facilitiesMode
        sector: NMIS.Sectors.pluck params.sector

      e.subsector = e.sector.getSubsector params.subsector  if params.subsector
      e.indicator = e.sector.getIndicator params.indicator  if params.indicator
      e

    do ->
      # Now that the page is ready, we can load in the
      # data modules necessary for the facilities view
      fetchers = {}
      for mod in ["variables/variables",
                  "presentation/facilities",
                  "data/facilities", "data/lga_data"]
        dmod = district.get_data_module mod
        fetchers[dmod.sanitizedId()] = dmod.fetch()

      fetchers.lga_data = district.loadData()  if district.has_data_module("data/lga_data")
      fetchers.variableList = district.loadVariables()

      $.when_O(fetchers).done (results)->
        log "Ready to launch!", results
        # launchFacilities(results, params)

@mustachify = (id, obj) ->
  Mustache.to_html $("#" + id).eq(0).html().replace(/<{/g, "{{").replace(/\}>/g, "}}"), obj

resizeDisplayWindowAndFacilityTable = ->
  ah = NMIS._wElems.elem1.height()
  bar = $(".display-window-bar", NMIS._wElems.elem1).outerHeight()
  cf = $(".clearfix", NMIS._wElems.elem1).eq(0).height()
  NMIS.SectorDataTable.setDtMaxHeight ah - bar - cf - 18

###
The beast: launchFacilities--
###
facilitiesMap = false

launchFacilities = (results, params) ->
  facilities = results.data_facilities
  variableData = results.variables_variables
  facPresentation = results.presentation_facilities
  profileVariables = facPresentation.profile_indicator_ids

  lga = NMIS._currentDistrict
  state = NMIS._currentDistrict.group
  createFacilitiesMap = ->
    
    # OSM google maps layer code from:
    # http://wiki.openstreetmap.org/wiki/Google_Maps_Example#Example_Using_Google_Maps_API_V3
    iconURLData = (item) ->
      sectorIconURL = (slug, status) ->
        iconFiles =
          education: "education.png"
          health: "health.png"
          water: "water.png"
          default: "book_green_wb.png"
        "#{NMIS.settings.pathToMapIcons}/icons_f/#{status}_#{iconFiles[slug] or iconFiles.default}"
      slug = undefined
      status = item.status
      return item._custom_png_data  if status is "custom"
      slug = item.iconSlug or item.sector.slug
      [sectorIconURL(slug, status), 32, 24]
    markerClick = ->
      sslug = NMIS.activeSector().slug
      if sslug is @nmis.item.sector.slug or sslug is "overview"
        dashboard.setLocation NMIS.urlFor _.extend NMIS.Env(), facility: @nmis.id
    markerMouseover = ->
      sslug = NMIS.activeSector().slug
      NMIS.FacilityHover.show this  if @nmis.item.sector.slug is sslug or sslug is "overview"
    markerMouseout = ->
      NMIS.FacilityHover.hide()
    mapClick = ->
      if NMIS.FacilitySelector.isActive()
        NMIS.FacilitySelector.deselect()
        dashboard.setLocation NMIS.urlFor(_.extend(NMIS.Env(),
          facility: false
        ))
    ll = (+x for x in lga.lat_lng.split(","))
    unless not facilitiesMap
      _rDelay 1, ->
        if lga.bounds
          facilitiesMap.fitBounds lga.bounds
        else
          facilitiesMap.setCenter new google.maps.LatLng(ll[0], ll[1])
        google.maps.event.trigger facilitiesMap, "resize"
      return
    else
      facilitiesMap = new google.maps.Map(NMIS._wElems.elem0.get(0),
        zoom: mapZoom
        center: new google.maps.LatLng(ll[0], ll[1])
        streetViewControl: false
        panControl: false
        mapTypeControlOptions:
          mapTypeIds: ["roadmap", "satellite", "terrain", "OSM"]

        mapTypeId: google.maps.MapTypeId["SATELLITE"]
      )
      facilitiesMap.overlayMapTypes.insertAt 0, NMIS.MapMgr.mapboxLayer(
        tileset: "nigeria_overlays_white"
        name: "Nigeria"
      )
    facilitiesMap.mapTypes.set "OSM", new google.maps.ImageMapType(
      getTileUrl: (coord, zoom) ->
        "http://tile.openstreetmap.org/#{zoom}/#{coord.x}/#{coord.y}.png"

      tileSize: new google.maps.Size(256, 256)
      name: "OSM"
      maxZoom: 18
    )
    bounds = new google.maps.LatLngBounds()
    google.maps.event.addListener facilitiesMap, "click", mapClick
    NMIS.IconSwitcher.setCallback "createMapItem", (item, id, itemList) ->
      if !!item._ll and not @mapItem(id)
        $gm = google.maps
        item.iconSlug = item.iconType or item.sector.slug
        td = iconURLData(item)

        iconData =
          url: td[0]
          size: new $gm.Size(td[1], td[2])

        mI =
          latlng: new $gm.LatLng(item._ll[0], item._ll[1])
          icon: new $gm.MarkerImage(iconData.url, iconData.size)

        mI.marker = new $gm.Marker(
          position: mI.latlng
          map: facilitiesMap
          icon: mI.icon
        )
        mI.marker.setZIndex (if item.status is "normal" then 99 else 11)
        mI.marker.nmis =
          item: item
          id: id

        google.maps.event.addListener mI.marker, "click", markerClick
        google.maps.event.addListener mI.marker, "mouseover", markerMouseover
        google.maps.event.addListener mI.marker, "mouseout", markerMouseout
        bounds.extend mI.latlng
        @mapItem id, mI

    NMIS.IconSwitcher.createAll()
    lga.bounds = bounds
    _rDelay 1, ->
      google.maps.event.trigger facilitiesMap, "resize"
      facilitiesMap.fitBounds bounds
    NMIS.IconSwitcher.setCallback "shiftMapItemStatus", (item, id) ->
      mapItem = @mapItem(id)
      unless not mapItem
        icon = mapItem.marker.getIcon()
        icon.url = iconURLData(item)[0]
        mapItem.marker.setIcon icon

  # sectors = variableData.sectors
  sector = NMIS.Sectors.pluck(params.sector)
  e =
    state: state
    lga: lga
    mode: "facilities"
    sector: sector
    subsector: sector.getSubsector(params.subsector)
    indicator: sector.getIndicator(params.indicator)
    facility: params.facility

  dTableHeight = undefined
  NMIS.Env e
  NMIS.activeSector sector
  NMIS.loadFacilities facilities
  if e.sector isnt `undefined` and e.subsector is `undefined`
    e.subsector = _.first(e.sector.subGroups())
    e.subsectorUndefined = true
  MapMgr_opts =
    # llString: lgaData.profileData.gps.value
    elem: NMIS._wElems.elem0

  mapZoom = 8
  mapLoader = NMIS.loadGoogleMaps()
  mapLoader.done ()-> createFacilitiesMap()

  # NMIS.MapMgr.init()

  if window.dwResizeSet is `undefined`
    window.dwResizeSet = true
    NMIS.DisplayWindow.addCallback "resize", (tf, size) ->
      resizeDisplayWindowAndFacilityTable()  if size is "middle" or size is "full"

  NMIS.DisplayWindow.setDWHeight "calculate"
  
  # resizeDataTable(NMIS.DisplayWindow.getSize());
  if e.sector.slug is "overview"
    NMIS._wElems.elem1content.empty()
    displayTitle = "Facility Detail: #{lga.label} » Overview"
    NMIS.DisplayWindow.setTitle displayTitle
    NMIS.IconSwitcher.shiftStatus (id, item) ->
      "normal"

    obj =
      lgaName: "#{lga.name}, #{lga.group.name}"

    obj.profileData = do ->
      outp = for vv in profileVariables
        variable = NMIS.variables.find(vv)
        value = lga.lookupRecord vv
        name: variable?.name
        value: value?.value
      outp

    facCount = 0
    obj.overviewSectors = for s in NMIS.Sectors.all()
      c = 0
      c++ for d, item of NMIS.data() when item.sector is s
      facCount += c

      name: s.name
      slug: s.slug
      url: NMIS.urlFor(_.extend(NMIS.Env(), sector: s, subsector: false))
      counts: c
    obj.facCount = facCount

    NMIS._wElems.elem1content.html _.template($("#facilities-overview").html(), obj)
  else
    if !!e.subsectorUndefined or not NMIS.FacilitySelector.isActive()
      NMIS.IconSwitcher.shiftStatus (id, item) ->
        (if item.sector is e.sector then "normal" else "background")

    displayTitle = "Facility Detail: #{lga.label} » #{e.sector.name}"
    NMIS.DisplayWindow.setTitle displayTitle, displayTitle + " - " + e.subsector.name  unless not e.subsector
    
    #        NMIS.DisplayWindow.unsetTempSize(true);
    NMIS._wElems.elem1content.empty()
    twrap = $("<div />",
      class: "facility-table-wrap"
    ).append($("<div />").attr("class", "clearfix").html("&nbsp;")).appendTo(NMIS._wElems.elem1content)
    tableElem = NMIS.SectorDataTable.createIn(twrap, e,
      sScrollY: 1000
    ).addClass("bs")
    unless not e.indicator
      do ->
        if e.indicator.iconify_png_url
          NMIS.IconSwitcher.shiftStatus (id, item) ->
            if item.sector is e.sector
              item._custom_png_data = e.indicator.customIconForItem(item)
              "custom"
            else
              "background"

        return  if e.indicator.click_actions.length is 0
        $(".indicator-feature").remove()
        obj = _.extend({}, e.indicator)
        mm = $ _.template($("#indicator-feature").html(), obj)
        mm.find("a.close").click ->
          dashboard.setLocation NMIS.urlFor _.extend({}, e, indicator: false)
          false

        mm.prependTo NMIS._wElems.elem1content

        pcWrap = mm.find(".raph-circle").get(0)
        do ->
          sector = e.sector
          column = e.indicator
          piechartTrue = _.include(column.click_actions, "piechart_true")
          piechartFalse = _.include(column.click_actions, "piechart_false")
          pieChartDisplayDefinitions = undefined
          if piechartTrue
            pieChartDisplayDefinitions = [
              legend: "No"
              color: "#ff5555"
              key: "false"
            ,
              legend: "Yes"
              color: "#21c406"
              key: "true"
            ,
              legend: "Undefined"
              color: "#999"
              key: "undefined"
            ]
          else if piechartFalse
            pieChartDisplayDefinitions = [
              legend: "Yes"
              color: "#ff5555"
              key: "true"
            ,
              legend: "No"
              color: "#21c406"
              key: "false"
            ,
              legend: "Undefined"
              color: "#999"
              key: "undefined"
            ]
          unless not pieChartDisplayDefinitions
            tabulations = NMIS.Tabulation.sectorSlug(sector.slug, column.slug, "true false undefined".split(" "))
            prepare_data_for_pie_graph pcWrap, pieChartDisplayDefinitions, tabulations, {}
  resizeDisplayWindowAndFacilityTable()
  NMIS.FacilitySelector.activate id: e.facility  unless not e.facility

prepare_data_for_pie_graph = (pieWrap, legend, data, _opts) ->
  ###
  creates a graph with some default options.
  if we want to customize stuff (ie. have behavior that changes based on
  different input) then we should work it into the "_opts" parameter.
  ###
  gid = $(pieWrap).get(0).id
  unless gid
    $(pieWrap).attr "id", "pie-wrap"
    gid = "pie-wrap"
  defaultOpts =
    x: 50
    y: 40
    r: 35
    font: "12px 'Fontin Sans', Fontin-Sans, sans-serif"

  opts = $.extend({}, defaultOpts, _opts)
  rearranged_vals = $.map legend, (val) -> $.extend val, value: data[val.key]
  values = []
  colors = []
  legend = []
  rearranged_vals.sort (a, b) -> b.value - a.value

  for item in rearranged_vals
    if item.value > 0
      values.push item.value
      colors.push item.color
      legend.push "%% - #{item.legend} (##)"

  pvals =
    values: values
    colors: colors
    legend: legend

  ###
  NOTE: hack to get around a graphael bug!
  if there is only one color the chart will
  use the default value (Raphael.fn.g.colors[0])
  here, we will set it to whatever the highest
  value that we have is
  ###
  Raphael.fn.g.colors[0] = pvals.colors[0]
  #

  r = Raphael(gid)
  r.g.txtattr.font = opts.font
  pie = r.g.piechart(opts.x, opts.y, opts.r, pvals.values,
    colors: pvals.colors
    legend: pvals.legend
    legendpos: "east"
  )
  hover_on = ->
    @sector.stop()
    @sector.scale 1.1, 1.1, @cx, @cy
    if @label
      @label[0].stop()
      @label[0].scale 1.4
      @label[1].attr "font-weight": 800
  hover_off = ->
    @sector.animate
      scale: [1, 1, @cx, @cy]
    , 500, "bounce"
    if @label
      @label[0].animate
        scale: 1
      , 500, "bounce"
      @label[1].attr "font-weight": 400
  pie.hover hover_on, hover_off
  r


# identical to _.delay except switches the order of the parameters
_rDelay = (i, fn)-> _.delay fn, i