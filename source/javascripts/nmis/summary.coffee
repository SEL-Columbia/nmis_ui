summaryMap = false

NMIS.loadSummary = (s) ->
  lga_code = "#{s.params.state}/#{s.params.lga}"
  lga = NMIS.getDistrictByUrlCode(lga_code)
  state = lga.group
  initSummaryMap = ->
    $mapDiv = $(".profile-box .map").eq(0)
    mapDiv = $mapDiv.get(0)
    ll = (+x for x in lga.latLng.split(","))
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

  fetchers = {}
  if lga.has_data_module("summary")
    fetchers.summary = NMIS.DataLoader.fetch(lga.module_url("summary"))
  if lga.has_data_module("summary_sectors")
    fetchers.summary_sectors = NMIS.DataLoader.fetch(lga.module_url("summary_sectors"))
  $.when_O(fetchers).done (results)->
    launch_summary(s.params, state, lga, results)

class TmpSector
  constructor: (s)->
    @slug = s.id
    @name = s.name

launch_summary = (params, state, lga, query_results={})->
  summary_data = query_results.summary
  summary_sectors = query_results.summary_sectors
  NMIS.DisplayWindow.setVisibility false
  NMIS.DisplayWindow.setDWHeight()
  overviewObj =
    name: "Overview"
    slug: "overview"

  current_sector = new TmpSector(s) for s in summary_data.view_details when s.id is params.sector
  current_sector = overviewObj unless current_sector
  _env =
    mode:
      name: "Summary"
      slug: "summary"
    state: state
    lga: lga
    sector: current_sector

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
  do ->
    ###
    how can we do this better?
    ###
    content_div = $('.content')
    if content_div.find('#conditional-content').length == 0
      context = {}
      context.summary_data = summary_data
      context.summary_sectors = summary_sectors
      context.lga = lga
      cc_div = $ '<div>', id: 'conditional-content'
      for sector_view_panel in summary_data.view_details
        sector_window = $("<div>", class: "lga")
        sector_window.html("<div class='display-window-bar breadcrumb'></div>")
        sector_window_inner_wrap = $("<div>", class:'cwrap').appendTo(sector_window)
        sector_id = sector_view_panel.id
        sector_window.addClass sector_id
        context.summary_sector = context.summary_sectors[sector_id]
        context.view_panel = sector_view_panel
        for module in sector_view_panel.modules
          sector_window_inner_wrap.append create_sector_panel(sector_id, module, context)
        sector_window.appendTo cc_div
      $('.content').append(cc_div)
  do ->
    sector = _env.sector
    cc = $("#conditional-content").hide()
    cc.find(">div").hide()
    cc.find(">div.lga." + sector.slug).show()
    cc.show()

__display_panels = {}
class DisplayPanel
  constructor: ()->
  build: ()->

class UnderscoreTemplateDisplayPanel extends DisplayPanel
  constructor: (module, elem)->
    @template_html = elem.html()
  build: (elem, context={})->
    elem.append _.template(@template_html, context)

template_not_found = (name)-> "<h2>Template '#{name}' not found</h2>"

_tdps = false
establish_template_display_panels = ()->
  unless _tdps
    $('script.display-panel').each ()->
      $this = $(this)
      module = $this.data('module')
      __display_panels[module] = new UnderscoreTemplateDisplayPanel(module, $this)
    _tdps = true

create_sector_panel = (sector_id, module, context)->
  establish_template_display_panels()
  context.relevant_data = context.summary_data.data?[sector_id]?[module]
  div = $('<div>')
  if __display_panels[module]?
    panel = __display_panels[module]
    panel.build div, context
  else
    div.html template_not_found(module)
  div
