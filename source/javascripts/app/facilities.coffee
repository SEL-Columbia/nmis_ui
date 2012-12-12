###
Facilities:
###
launch_facilities = ->
  params = {}
  params.facilityId = ("" + window.location.search).match(/facility=(\d+)/)[1]  if ("" + window.location.search).match(/facility=(\d+)/)
  $("#conditional-content").hide()
  _.each @params, (param, pname) ->
    params[pname] = param.replace("/", "")  if $.type(param) is "string" and param isnt ""

  district = NMIS.getDistrictByUrlCode("#{params.state}/#{params.lga}")
  NMIS._currentDistrict = district
  params.sector = `undefined`  if params.sector is "overview"
  get_sectorsReq().done ->
    prepFacilities params
    if "facilities" not in district.data_modules
      throw "'facilities' is not a listed data_module for #{district.url_code}"
    facilities_req = NMIS.DataLoader.fetch district.module_url("facilities")
    if "variables" in district.data_modules
      variables_req = NMIS.DataLoader.fetch district.module_url("variables")
    else
      variables_req = NMIS.DataLoader.fetch NMIS._defaultVariableUrl_
    if "profile_data" in district.data_modules
      profile_data_req = NMIS.DataLoader.fetch district.module_url("profile_data")
    $.when(facilities_req, variables_req, profile_data_req).done (req1, req2, req3) ->
      lgaData = req1[0]
      variableData = req2[0]
      profileData = req3[0].profile_data
      launchFacilities lgaData, variableData, profileData , params

NMIS.launch_facilities = launch_facilities


prepFacilities = (params) ->
  NMIS.DisplayWindow.setVisibility true
  facilitiesMode =
    name: "Facility Detail"
    slug: "facilities"

  lga = NMIS.getDistrictByUrlCode("#{params.state}/#{params.lga}")
  state = lga.group

  e =
    state: state
    lga: lga
    mode: facilitiesMode
    sector: NMIS.Sectors.pluck(params.sector)

  e.subsector = e.sector.getSubsector(params.subsector)
  e.indicator = e.sector.getIndicator(params.indicator)
  bcValues = NMIS._prepBreadcrumbValues(e, "state lga mode sector subsector indicator".split(" "),
    state: state
    lga: lga
  )
  NMIS.LocalNav.markActive ["mode:facilities", "sector:" + e.sector.slug]
  NMIS.Breadcrumb.clear()
  NMIS.Breadcrumb.setLevels bcValues
  NMIS.LocalNav.iterate (sectionType, buttonName, a) ->
    env = _.extend({}, e,
      subsector: false
    )
    env[sectionType] = buttonName
    a.attr "href", NMIS.urlFor(env)


mustachify = (id, obj) ->
  Mustache.to_html $("#" + id).eq(0).html().replace(/<{/g, "{{").replace(/\}>/g, "}}"), obj

resizeDisplayWindowAndFacilityTable = ->
  ah = NMIS._wElems.elem1.height()
  bar = $(".display-window-bar", NMIS._wElems.elem1).outerHeight()
  cf = $(".clearfix", NMIS._wElems.elem1).eq(0).height()
  NMIS.SectorDataTable.setDtMaxHeight ah - bar - cf - 18

###
The beast: launchFacilities--
###
launchFacilities = (lgaData, variableData, profileData, params) ->
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
        "./images/icons_f/#{status}_#{iconFiles[slug] or iconFiles.default}"
      slug = undefined
      status = item.status
      return item._custom_png_data  if status is "custom"
      slug = item.iconSlug or item.sector.slug
      [sectorIconURL(slug, status), 32, 24]
    markerClick = ->
      sslug = NMIS.activeSector().slug
      if sslug is @nmis.item.sector.slug or sslug is "overview"
        dashboard.setLocation NMIS.urlFor(_.extend(NMIS.Env(),
          facilityId: @nmis.id
        ))
    markerMouseover = ->
      sslug = NMIS.activeSector().slug
      NMIS.FacilityHover.show this  if @nmis.item.sector.slug is sslug or sslug is "overview"
    markerMouseout = ->
      NMIS.FacilityHover.hide()
    mapClick = ->
      if NMIS.FacilitySelector.isActive()
        NMIS.FacilitySelector.deselect()
        dashboard.setLocation NMIS.urlFor(_.extend(NMIS.Env(),
          facilityId: false
        ))
    ll = _.map(lga.lat_lng.split(","), (x) ->
      +x
    )
    unless not facilitiesMap
      _.delay (->
        if lga.bounds
          facilitiesMap.fitBounds lga.bounds
        else
          facilitiesMap.setCenter new google.maps.LatLng(ll[0], ll[1])
        google.maps.event.trigger facilitiesMap, "resize"
      ), 1
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
        iconData = (iconDataForItem = (i) ->
          i.iconSlug = i.iconType or i.sector.slug
          td = iconURLData(i)
          url: td[0]
          size: new $gm.Size(td[1], td[2])
        )(item)
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
    _.delay (->
      google.maps.event.trigger facilitiesMap, "resize"
      facilitiesMap.fitBounds bounds
    ), 1
    NMIS.IconSwitcher.setCallback "shiftMapItemStatus", (item, id) ->
      mapItem = @mapItem(id)
      unless not mapItem
        icon = mapItem.marker.getIcon()
        icon.url = iconURLData(item)[0]
        mapItem.marker.setIcon icon

  lgaData.profileData = {}  if lgaData.profileData is `undefined`
  lgaData.profileData.gps = value: "40.809587 -73.953223 183.0 4.0"  if lgaData.profileData.gps is `undefined`
  facilities = lgaData.facilities
  sectors = variableData.sectors
  sector = NMIS.Sectors.pluck(params.sector)
  e =
    state: state
    lga: lga
    mode: "facilities"
    sector: sector
    subsector: sector.getSubsector(params.subsector)
    indicator: sector.getIndicator(params.indicator)
    facilityId: params.facilityId

  dTableHeight = undefined
  NMIS.Env e
  NMIS.activeSector sector
  NMIS.loadFacilities facilities
  if e.sector isnt `undefined` and e.subsector is `undefined`
    e.subsector = _.first(e.sector.subGroups())
    e.subsectorUndefined = true
  MapMgr_opts =
    llString: lgaData.profileData.gps.value
    elem: NMIS._wElems.elem0

  mapZoom = 8
  if NMIS.MapMgr.isLoaded()
    createFacilitiesMap()
  else
    NMIS.MapMgr.addLoadCallback createFacilitiesMap
    NMIS.MapMgr.init()
  if window.dwResizeSet is `undefined`
    window.dwResizeSet = true
    NMIS.DisplayWindow.addCallback "resize", (tf, size) ->
      resizeDisplayWindowAndFacilityTable()  if size is "middle" or size is "full"

  NMIS.DisplayWindow.setDWHeight "calculate"
  
  # resizeDataTable(NMIS.DisplayWindow.getSize());
  if e.sector.slug is "overview"
    NMIS._wElems.elem1content.empty()
    displayTitle = "Facility Detail: " + lga.name + " Overview"
    NMIS.DisplayWindow.setTitle displayTitle
    NMIS.IconSwitcher.shiftStatus (id, item) ->
      "normal"

    obj =
      facCount: "15"
      lgaName: "" + lga.label + ", " + lga.group.label
      overviewSectors: []
      profileData: _.map(profileData, (d) ->
        val = ""
        if d[1] is null or d[1] is `undefined`
          val = DisplayValue.raw("--")[0]
        else if d[1].value isnt `undefined`
          val = DisplayValue.raw(d[1].value)[0]
        else
          val = DisplayValue.raw("--")
        name: d[0]
        value: val
      )

    _.each NMIS.Sectors.all(), (s) ->
      c = 0
      _.each NMIS.data(), (d) ->
        c++  if d.sector is s

      obj.overviewSectors.push
        name: s.name
        slug: s.slug
        url: NMIS.urlFor(_.extend(NMIS.Env(),
          sector: s
          subsector: false
        ))
        counts: c

    NMIS._wElems.elem1content.html mustachify("facilities-overview", obj)
  else
    if !!e.subsectorUndefined or not NMIS.FacilitySelector.isActive()
      NMIS.IconSwitcher.shiftStatus (id, item) ->
        (if item.sector is e.sector then "normal" else "background")

    displayTitle = "Facility Detail: " + lga.name + " " + e.sector.name
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
      (->
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
        mm = $(mustachify("indicator-feature", obj))
        mm.find("a.close").click ->
          xx = NMIS.urlFor(_.extend({}, e,
            indicator: false
          ))
          dashboard.setLocation xx
          false

        mm.prependTo NMIS._wElems.elem1content
        ((pcWrap) ->
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
            createOurGraph pcWrap, pieChartDisplayDefinitions, tabulations, {}
        ) mm.find(".raph-circle").get(0)
      )()
  resizeDisplayWindowAndFacilityTable()
  NMIS.FacilitySelector.activate id: e.facilityId  unless not e.facilityId
facilitiesMapCreated = undefined
facilitiesMap = undefined

###
TODO: something about these NMIS.DataLoader
###
get_lgaDataReq = ()->
  _lgaDataReq = NMIS.DataLoader.fetch NMIS._lgaFacilitiesDataUrl_
  _lgaDataReq
get_variableDataReq = ()->
  _variableDataReq = NMIS.DataLoader.fetch NMIS._defaultVariableUrl_
  _variableDataReq
get_sectorsReq = ()->
  _sectorReq = NMIS.DataLoader.fetch NMIS._defaultSectorUrl_
  _sectorReq.done (s)->
    NMIS.loadSectors s.sectors,
      default:
        name: "Overview"
        slug: "overview"
  _sectorReq

dashboard.get "#{NMIS.url_root}#/:state/:lga/facilities/?(#.*)?", NMIS.launch_facilities
dashboard.get "#{NMIS.url_root}#/:state/:lga/facilities/:sector/?(#.*)?", NMIS.launch_facilities
dashboard.get "#{NMIS.url_root}#/:state/:lga/facilities/:sector/:subsector/?(#.*)?", NMIS.launch_facilities
dashboard.get "#{NMIS.url_root}#/:state/:lga/facilities/:sector/:subsector/:indicator/?(#.*)?", NMIS.launch_facilities
