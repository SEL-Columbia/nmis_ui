do ->
  ###
  When "summary" is activated/deactivated, the open/close callbacks are called
  ###
  panelOpen = ->
    NMIS.LocalNav.show()
    $("#conditional-content").show()

  panelClose = ->
    NMIS.LocalNav.hide()
    $("#conditional-content").hide()

  NMIS.panels.getPanel("summary").addCallbacks open: panelOpen, close: panelClose

summaryMap = false

NMIS.loadSummary = (s) ->
  # called before the data is loaded into the page.
  # this prepares the dom and launches the AJAX requests.
  lga_code = "#{s.params.state}/#{s.params.lga}"
  lga = NMIS.getDistrictByUrlCode(lga_code)
  state = lga.group

  fetchers = {}

  googleMapsLoad = NMIS.loadGoogleMaps()

  # todo datamod
  if lga.has_data_module("presentation/summary_sectors")
    # todo datamod
    fetchers.summary_sectors = NMIS.DataLoader.fetch(lga.module_url("presentation/summary_sectors"))

  # todo datamod
  fetchers.lga_data = lga.loadData()  if lga.has_data_module("data/lga_data")
  fetchers.variables = lga.loadVariables()

  fetchersDone = $.when_O(fetchers)
  fetchersDone.done (results)->
    googleMapsLoad.done -> launchGoogleMapSummaryView(lga)
    launch_summary s.params, state, lga, results

  launchGoogleMapSummaryView = (lga)->
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
        _rDelay 1, ->
          google.maps.event.trigger summaryMap, "resize"
          summaryMap.setCenter new google.maps.LatLng(ll[1], ll[0]), mapZoom

class TmpSector
  constructor: (s)->
    @slug = s.id
    @name = s.name

launch_summary = (params, state, lga, query_results={})->
  summary_sectors_results = query_results.summary_sectors
  summary_sectors = summary_sectors_results.sectors
  relevant_data = summary_sectors_results.relevant_data
  NMIS.panels.changePanel "summary"
  NMIS.DisplayWindow.setDWHeight()
  overviewObj =
    name: "Overview"
    slug: "overview"

  view_details = summary_sectors_results.view_details
  current_sector = new TmpSector(s) for s in view_details when s.id is params.sector
  current_sector = overviewObj unless current_sector
  NMIS.Env
    mode:
      name: "Summary"
      slug: "summary"
    state: state
    lga: lga
    sector: current_sector

  NMIS.Breadcrumb.clear()

  bcKeys = "state lga mode sector subsector indicator".split(" ")
  NMIS.Breadcrumb.setLevels NMIS._prepBreadcrumbValues NMIS.Env(), bcKeys, state: state, lga: lga
  NMIS.LocalNav.markActive ["mode:summary", "sector:" + NMIS.Env().sector.slug]
  NMIS.LocalNav.iterate (sectionType, buttonName, a) ->
    o = {}
    o[sectionType] = buttonName
    a.attr "href", NMIS.urlFor.extendEnv o
  do ->
    ###
    how can we do this better?
    ###
    content_div = $('.content')
    if content_div.find('#conditional-content').length == 0
      context = {}
      context.summary_sectors = summary_sectors
      context.lga = lga
      cc_div = $ '<div>', id: 'conditional-content'
      for sector_view_panel in view_details
        sector_window = $("<div>", class: "lga")
        sector_window.html("<div class='display-window-bar breadcrumb'></div>")
        sector_window_inner_wrap = $("<div>", class:'cwrap').appendTo(sector_window)
        sector_id = sector_view_panel.id
        sector_window.addClass sector_id
        context.summary_sector = context.summary_sectors[sector_id]
        context.view_panel = sector_view_panel
        for module in sector_view_panel.modules
          sectorPanel = do ->
            spanStr = (content="&mdash;", cls="")-> "<span class='#{cls}' style='text-transform:none'>#{content}</span>"
            establish_template_display_panels()
            context.relevant_data = relevant_data[sector_id]?[module]
            div = $('<div>')
            context.lookupName = (id)->
              if id
                vrb = NMIS.variables.find id
                if vrb
                  spanStr vrb.name, "variable-name"
                else
                  spanStr id, "warn-missing"
              else
                spanStr "No variable id", "warn-missing"
            context.lookupValue = (id, defaultValue=null)->
              record = lga.lookupRecord(id)
              if record
                spanStr record.value, "found"
              else if id
                spanStr "&ndash;", "warn-missing", "Missing value for id: #{id}"
              else
                spanStr "&cross;", "warn-missing", "Missing ID"
            if __display_panels[module]?
              panel = __display_panels[module]
              panel.build div, context
            else
              div.html template_not_found(module)
            div
          sector_window_inner_wrap.append sectorPanel
        sector_window.appendTo cc_div
      $('.content').append(cc_div)
  do ->
    sector = NMIS.Env().sector
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

# identical to _.delay except switches the order of the parameters
_rDelay = (i, fn)-> _.delay fn, i