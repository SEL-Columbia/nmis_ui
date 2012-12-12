loadSummary = (s) ->
  lga_code = "#{s.params.state}/#{s.params.lga}"
  lga = NMIS.getDistrictByUrlCode(lga_code)
  state = lga.group
  initSummaryMap = ->
    $mapDiv = $(".profile-box .map").eq(0)
    mapDiv = $mapDiv.get(0)
    ll = _.map(lga.latLng.split(","), (x) ->
      +x
    )
    mapZoom = 9
    if mapDiv
      unless summaryMap
        summaryMap = new google.maps.Map(mapDiv,
          zoom: mapZoom
          center: new google.maps.LatLng(ll[1], ll[0])
          streetViewControl: false
          panControl: false
          mapTypeControl: false
          mapTypeId: google.maps.MapTypeId.HYBRID
        )
        summaryMap.mapTypes.set "ng_base_map", NMIS.MapMgr.mapboxLayer(
          tileset: "nigeria_base"
          name: "Nigeria"
        )
        summaryMap.setMapTypeId "ng_base_map"
      _.delay (->
        google.maps.event.trigger summaryMap, "resize"
        summaryMap.setCenter new google.maps.LatLng(ll[1], ll[0]), mapZoom
      ), 1
  if NMIS.MapMgr.isLoaded()
    initSummaryMap()
  else
    NMIS.MapMgr.addLoadCallback initSummaryMap
    NMIS.MapMgr.init()
  NMIS.DisplayWindow.setVisibility false
  NMIS.DisplayWindow.setDWHeight()
  params = s.params
  overviewObj =
    name: "Overview"
    slug: "overview"
  _env =
    mode:
      name: "Summary"
      slug: "summary"

    state: state
    lga: lga
    sector: NMIS.Sectors.pluck(params.sector) or overviewObj

  bcValues = NMIS._prepBreadcrumbValues(_env, "state lga mode sector subsector indicator".split(" "),
    state: state
    lga: lga
  )
  NMIS.Breadcrumb.clear()
  NMIS.Breadcrumb.setLevels bcValues
  NMIS.LocalNav.markActive ["mode:summary", "sector:" + _env.sector.slug]
  NMIS.LocalNav.iterate (sectionType, buttonName, a) ->
    env = _.extend({}, _env)
    env[sectionType] = buttonName
    a.attr "href", NMIS.urlFor(env)

  (displayConditionalContent = (sector) ->
    cc = $("#conditional-content").hide()
    cc.find(">div").hide()
    cc.find(">div.lga." + sector.slug).show()
    cc.show()
  ) _env.sector

summaryMap = undefined

dashboard.get "#{NMIS.url_root}#/:state/:lga/summary/?(#.*)?", loadSummary
dashboard.get "#{NMIS.url_root}#/:state/:lga/summary/:sector/?(#.*)?", loadSummary
dashboard.get "#{NMIS.url_root}#/:state/:lga/summary/:sector/:subsector/?(#.*)?", loadSummary
dashboard.get "#{NMIS.url_root}#/:state/:lga/summary/:sector/:subsector/:indicator/?(#.*)?", loadSummary
