###
I'm moving modules into this file wrapped in "do ->" (self-executing functions)
until they play well together (and I ensure they don't over-depend on other modules.)
..doing this instead of splitting them into individual files.
###

do ->
  Breadcrumb = do ->
    levels = []
    elem = false
    context = {}

    init = (_elem, opts={}) ->
      elem = $(_elem).eq(0)

      opts.draw = true  unless opts.draw?
      setLevels opts.levels, false  if opts.levels?
      draw()  unless not opts.draw
    clear = ->
      elem.empty()  if elem
      levels = []
    setLevels = (new_levels=[], needs_draw=true) ->
      levels[i] = level for level, i in new_levels when level?
      draw()  if needs_draw
      context
    setLevel = (ln, d) ->
      levels[ln] = d
      context
    draw = ->
      throw new Error "Breadcrumb: elem is undefined" unless elem?
      elem.empty()
      splitter = $("<span>").text("/")
      for [txt, href, fn], i in levels
        splitter.clone().appendTo elem  if i isnt 0
        a = $("<a>").text(txt).attr("href", href)
        a.click fn if fn?
        a.appendTo elem
      elem

    init: init
    setLevels: setLevels
    setLevel: setLevel
    draw: draw
    _levels: -> levels
    clear: clear

  NMIS.Breadcrumb = Breadcrumb


do ->
  NMIS.S3Photos = do ->
    s3Root = "http://nmisstatic.s3.amazonaws.com/facimg"
    url: (s3id, size=0)->
      [code, id] = s3id.split ":"
      "#{s3Root}/#{code}/#{size}/#{id}.jpg"

do ->
  capitalize = (str) ->
    unless str
      ""
    else
      str[0].toUpperCase() + str.slice(1)
  NMIS.HackCaps = (str)->
    if $.type(str) is "string"
      output = []
      for section in str.split "_"
        output.push capitalize section
      output.join ' '
    else
      str

do ->
  NMIS.MapMgr = do->
    opts = {}
    started = false
    finished = false
    callbackStr = "NMIS.MapMgr.loaded"
    elem = false
    fakse = false
    loadCallbacks = []
    mapLoadFn = -> NMIS.loadGoogleMaps()
    addLoadCallback = (cb) -> loadCallbacks.push cb
    isLoaded = -> finished
    clear = -> started = finished = false
    loaded = ->
      cb.call(opts) for cb in loadCallbacks
      loadCallbacks = []
      finished = true

    init = (_opts)->
      return true  if started

      if _opts isnt `undefined`
        opts = _.extend(
          #defaults
          launch: true
          fake: false
          fakeDelay: 3000
          mapLoadFn: false
          elem: "body"
          defaultMapType: "SATELLITE"
          loadCallbacks: []
        , _opts)
        loadCallbacks = Array::concat.apply(loadCallbacks, opts.loadCallbacks)
        fake = !!opts.fake
        mapLoadFn = opts.mapLoadFn  if opts.mapLoadFn
      else
        fake = false
      started = true
      unless fake
        mapLoadFn()
      else
        _.delay loaded, opts.fakeDelay
      started

    mapboxLayer = (options) ->
      throw (new Error("Google Maps has not yet loaded into the page."))  if typeof google is "undefined"
      new google.maps.ImageMapType(
        getTileUrl: (coord, z) ->
          # Y coordinate is flipped in Mapbox, compared to Google
          # Simplistic predictable hashing
          "http://b.tiles.mapbox.com/v3/modilabs." + options.tileset + "/" + z + "/" + coord.x + "/" + coord.y + ".png?updated=1331159407403"

        name: options.name
        alt: options.name
        tileSize: new google.maps.Size(256, 256)
        isPng: true
        minZoom: 0
        maxZoom: options.maxZoom or 17
      )

    # Externally callable functions:
    init: init
    clear: clear
    loaded: loaded
    isLoaded: isLoaded
    mapboxLayer: mapboxLayer
    addLoadCallback: addLoadCallback

do ->
  NMIS.IconSwitcher = do ->
    context = {}
    callbacks = ["createMapItem", "shiftMapItemStatus", "statusShiftDone", "hideMapItem", "showMapItem", "setMapItemVisibility"]
    mapItems = {}

    init = (_opts) ->
      noop = ->
      items = {}
      context = _.extend(
        items: {}
        mapItem: mapItem
      , _opts)
      _.each callbacks, (cbname) ->
        context[cbname] = noop  if context[cbname] is `undefined`

    mapItem = (id, value) ->
      if !value?
        mapItems[id]
      else
        mapItems[id] = value
    hideItem = (item) ->
      item.hidden = true
    showItem = (item) ->
      item.hidden = false
    setVisibility = (item, tf) ->
      unless not tf
        unless item.hidden
          item.hidden = true
          context.setMapItemVisibility.call item, false, item, context.items
          return true
      else
        unless not item.hidden
          item.hidden = false
          context.setMapItemVisibility.call item, true, item, context.items
          return true
      false
    iterate = (cb) ->
      _.each context.items, (item, id, itemset) ->
        cb.apply context, [item, id, itemset]

    shiftStatus = (fn) ->
      iterate (item, id) ->
        status = fn.call(context, id, item, context.items)
        visChange = setVisibility(item, status is false)
        statusChange = false
        if status is `undefined`
          #do nothing
        else if status is false
          item.status = `undefined`
        else if item.status isnt status
          item._prevStatus = status
          item.status = status
          statusChange = true
        context.shiftMapItemStatus item, id  if statusChange or visChange

      context.statusShiftDone()
    all = ->
      _.values context.items
    setCallback = (cbName, cb) ->
      context[cbName] = cb  if callbacks.indexOf(cbName) isnt -1
    filterStatus = (status) ->
      _.filter context.items, (item) ->
        item.status is status

    filterStatusNot = (status) ->
      _.filter context.items, (item) ->
        item.status isnt status

    allShowing = ->
      filterStatusNot `undefined`
    createAll = ->
      iterate context.createMapItem
    clear = ->
      log "Clearing IconSwitcher"
      context = {}

    # Externally callable functions:
    init: init
    clear: clear
    allShowing: allShowing
    createAll: createAll
    filterStatus: filterStatus
    filterStatusNot: filterStatusNot
    all: all
    setCallback: setCallback
    shiftStatus: shiftStatus
    iterate: iterate

do ->
  NMIS.FacilitySelector = do->
    active = false

    isActive = -> active
    activate = (params) ->
      fId = params.id
      NMIS.IconSwitcher.shiftStatus (id, item) ->
        if id isnt fId
          "background"
        else
          active = true
          "normal"
      facility = false
      facility = val for key, val of NMIS.data() when key is params.id

      # facility = _.find(NMIS.data(), (val, key) ->
      #   key is params.id
      # )
      NMIS.FacilityPopup facility
    deselect = ->
      if active
        sector = NMIS.activeSector()
        NMIS.IconSwitcher.shiftStatus (id, item) ->
          (if item.sector is sector then "normal" else "background")
        active = false
        dashboard.setLocation NMIS.urlFor(NMIS.Env.extend(facility: false))
        NMIS.FacilityPopup.hide()
    # Externally callable functions:
    activate: activate
    isActive: isActive
    deselect: deselect

do ->
  NMIS.DataLoader = do ->
    ajaxJsonQuery = (url, cache=true)->
      $.ajax(url: url, dataType: "json", cache: cache)
    fetchLocalStorage = (url) ->
      p     =!1
      data  =!1
      stringData = localStorage.getItem(url)
      if stringData
        data = JSON.parse(stringData)
        ajaxJsonQuery(url).then (d)->
          localStorage.removeItem url
          localStorage.setItem url, JSON.stringify(d)

        $.Deferred().resolve [data]
      else
        p = new $.Deferred()
        ajaxJsonQuery(url).then (d)->
          localStorage.setItem url, JSON.stringify(d)
          p.resolve [d]
        p.promise()

    fetch = (url) -> ajaxJsonQuery url, false
    # Until localStorage fecthing works, just use $.getJSON
    fetch: fetch

do ->
  NMIS.LocalNav = do ->
    elem = undefined
    wrap = undefined
    opts = undefined
    buttonSections = {}
    submenu = undefined

    init = (selector, _opts) ->
      wrap = $(selector)
      opts = _.extend(
        sections: []
      , _opts)
      elem = $ "<ul />", id: "local-nav", class: "nav"
      wrap = $("<div />", class: "row ln-wrap")
        .css(
          position: "absolute"
          top: 82
          left: 56
          "z-index": 99
        ).html(elem)
      $(".content").eq(0).prepend wrap
      spacer = $("<li>", {class: "small spacer", html: "&nbsp;"})
      for section, i in opts.sections
        spacer.clone().appendTo(elem)  if i isnt 0
        for [id, text, url] in section
          arr = [id, text, url]
          [section_code, section_id] = id.split ":"
          buttonSections[section_code] = {} if buttonSections[section_code] is undefined
          a = $("<a>", href:url, text:text)
          buttonSections[section_code][section_id] = a
          $("<li>", html: a).appendTo(elem)
      submenu = $("<ul>", class: "submenu").appendTo(elem)

    hide = ()->
      wrap.detach()

    show = ()->
      if wrap.closest("html").length is 0
        $(".content").eq(0).prepend wrap

    getNavLink = (code) ->
      _x = code.split(":")
      section = _x[0]
      name = _x[1]
      buttonSections[section][name]
    markActive = (codesArray) ->
      wrap.find(".active").removeClass "active"
      _.each codesArray, (code) ->
        getNavLink(code).parents("li").eq(0).addClass "active"

    clear = ->
      wrap.empty()
      wrap = `undefined`
      elem = `undefined`
      buttonSections = {}
      submenu = `undefined`
    hideSubmenu = ->
      submenu.hide()
    displaySubmenu = (nlcode, a, _opts) ->
      navLink = getNavLink(nlcode)
      lpos = navLink.parents("li").eq(0).position().left
      submenu.hide().empty().css left: lpos
      _.each a, (aa) ->
        $("<li />").html($("<a />",
          text: aa[0]
          href: aa[1]
        )).appendTo submenu

      submenu.show()
    iterate = (cb) ->
      _.each buttonSections, (buttons, sectionName) ->
        _.each buttons, (button, buttonName) ->
          cb.apply this, [sectionName, buttonName, button]


    init: init
    clear: clear
    iterate: iterate
    hide: hide
    show: show
    displaySubmenu: displaySubmenu
    hideSubmenu: hideSubmenu
    markActive: markActive

do ->
  NMIS.Tabulation = do ->
    init = -> true
    filterBySector = (sector) ->
      sector = NMIS.Sectors.pluck(sector)
      _.filter NMIS.data(), (d) ->
        d.sector is sector

    sectorSlug = (sector, slug, keys) ->
      occurrences = {}
      values = _(filterBySector(sector)).chain().pluck(slug).map((v) ->
        "" + v
      ).value()
      keys = _.uniq(values).sort()  if keys is `undefined`
      _.each keys, (key) ->
        occurrences[key] = 0

      _.each values, (d) ->
        occurrences[d]++  if occurrences[d] isnt `undefined`

      occurrences
    sectorSlugAsArray = (sector, slug, keys) ->
      occurrences = sectorSlug.apply(this, arguments)
      keys = _.keys(occurrences).sort()  if keys is `undefined`
      _(keys).map (key) ->
        occurrences: "" + key
        value: occurrences[key]

    init: init
    sectorSlug: sectorSlug
    sectorSlugAsArray: sectorSlugAsArray

do ->
  NMIS.Env = do ->
    env = false
    env_accessor = (arg)->
      if arg?
        set_env arg
      else
        get_env()

    get_env = ()->
      throw new Error("NMIS.Env is not set") unless env
      _.extend {}, env
    set_env = (_env)-> env = _.extend {}, _env

    env_accessor.extend = (o)->
      e = if env then env else {}
      _.extend({}, e, o)

    env_accessor


NMIS.panels = do ->
  panels = {}
  currentPanel = false

  class Panel
    constructor: (@id)->
      @_callbacks = {}
    addCallbacks: (obj={})->
      @addCallback name, cb  for own name, cb of obj
      @
    addCallback: (name, cb)->
      @_callbacks[name] = []  unless @_callbacks[name]
      @_callbacks[name].push cb
      @
    _triggerCallback: (name, nextPanel)->
      cb.call window, name, @, nextPanel  for cb in @_callbacks[name] or []
      @

  getPanel = (id)->
    panels[id] = new Panel id  if not panels[id]
    panels[id]

  changePanel = (id)->
    nextPanel = panels[id]
    if not nextPanel
      throw new Error "Panel not found: #{id}"
    else if nextPanel isnt currentPanel
      currentPanel._triggerCallback 'close', nextPanel  if currentPanel
      nextPanel._triggerCallback 'open', currentPanel
      currentPanel = nextPanel
      panels[id]
    else
      false

  ensurePanel = (id)->
    throw new Error "NMIS.panels.ensurePanel('#{id}') Error: Panel does not exist"  unless panels[id]

  getPanel: getPanel
  changePanel: changePanel
  ensurePanel: ensurePanel
  currentPanelId: ()-> currentPanel?.id
  allPanels: ()-> (v for k, v of panels)

do ->
  NMIS.DisplayWindow = do ->
    elem = undefined
    elem1 = undefined
    elem0 = undefined
    elem1content = undefined
    opts = undefined
    visible = undefined
    hbuttons = undefined
    titleElems = {}
    curSize = undefined
    resizerSet = false
    resized = undefined
    curTitle = undefined
    initted = false
    contentWrap = false

    init = (_elem, _opts) ->
      initted = true
      clear()  if opts isnt `undefined`
      unless resizerSet
        resizerSet = true
        $(window).resize _.throttle resized, 1000
      contentWrap = $ _elem
      elem = $("<div />").appendTo contentWrap
      #default options:
      opts = _.extend(
        height: 100
        clickSizes: [["full", "Table Only"], ["middle", "Split"], ["minimized", "Map Only"]]
        size: "middle"
        sizeCookie: false
        callbacks: {}
        visible: false
        heights:
          full: Infinity
          middle: 280
          minimized: 46
        allowHide: true
        padding: 10
      , _opts)

      elem0 = $("<div />").addClass("elem0").appendTo(elem)
      elem1 = $("<div />").addClass("elem1").appendTo(elem)

      visible = !!opts.visible
      setVisibility visible, false

      opts.size = $.cookie("displayWindowSize") or opts.size  if opts.sizeCookie
      elem.addClass "display-window-wrap"
      elem1.addClass "display-window-content"
      createHeaderBar().appendTo elem1
      elem1content = $("<div />").addClass("elem1-content").appendTo(elem1)

      setSize opts.size

    setDWHeight = (height) ->
      if height is `undefined`
        height = "auto"
      else height = fullHeight()  if height is "calculate"
      elem.height height
      elem0.height height
    setTitle = (t, tt) ->
      _.each titleElems, (e) -> e.text t
      if tt isnt `undefined`
        $("head title").text "NMIS: " + tt
      else
        $("head title").text "NMIS: " + t
    showTitle = (i) ->
      curTitle = i
      _.each titleElems, (e, key) ->
        if key is i
          e.show()
        else
          e.hide()

    addCallback = (cbname, cb) ->
      opts.callbacks[cbname] = []  if opts.callbacks[cbname] is `undefined`
      opts.callbacks[cbname].push cb

    setBarHeight = (h, animate, cb) ->
      if animate
        elem1.animate
          height: h
        ,
          duration: 200
          complete: cb

      else
        elem1.css height: h
        (cb or ->
        )()

    setSize = (_size, animate) ->
      size = undefined
      if opts.heights[_size] isnt `undefined`
        size = opts.heights[_size]
        size = fullHeight()  if size is Infinity
        $.cookie "displayWindowSize", _size
        setBarHeight size, animate, ->
          elem1.removeClass "size-" + curSize  unless not curSize
          elem1.addClass "size-" + _size
          curSize = _size

      if opts.callbacks[_size] isnt `undefined`
        _.each opts.callbacks[_size], (cb) ->
          cb animate

      if opts.callbacks.resize isnt `undefined`
        _.each opts.callbacks.resize, (cb) ->
          cb animate, _size, elem, elem1, elem1content

      hbuttons.find(".primary").removeClass "primary"
      hbuttons.find(".clicksize." + _size).addClass "primary"

    setVisibility = (tf) ->
      css = {}
      visible = !!tf
      unless visible
        css =
          left: "1000em"
          display: "none"
      else
        css =
          left: "0"
          display: "block"
      elem0.css css
      elem1.css css

    ensureInitialized = ()-> throw new Error("NMIS.DisplayWindow is not initialized") unless initted

    hide = ()->
      setVisibility false
      ensureInitialized()
      elem.detach()
    show = ()->
      setVisibility true
      ensureInitialized()
      unless elem.inDom()
        contentWrap.append elem
    addTitle = (key, jqElem) ->
      titleElems[key] = jqElem
      showTitle key  if curTitle is key
    createHeaderBar = ->
      hbuttons = $("<span />") #.addClass('print-hide-inline');
      _.each opts.clickSizes, ([size, desc]) ->
        $("<a />").attr("class", "btn small clicksize #{size}")
            .text(desc)
            .attr("title", desc)
            .click(-> setSize(size, false))
            .appendTo hbuttons

      titleElems.bar = $("<h3 />").addClass("bar-title").hide()
      $("<div />", class: "display-window-bar breadcrumb")
          .css(margin: 0)
          .append(titleElems.bar)
          .append hbuttons

    clear = ->
      elem isnt `undefined` and elem.empty()
      titleElems = {}

    getElems = ->
      wrap: elem
      elem0: elem0
      elem1: elem1
      elem1content: elem1content

    fullHeight = ->
      # gets the available height of the DisplayWindow wrap (everything except the header.)
      oh = 0
      $(opts.offsetElems).each -> oh += $(this).height()
      $(window).height() - oh - opts.padding

    elem1contentHeight = ->
      padding = 30
      elem1.height() - hbuttons.height() - padding

    resized = ->
      # this function is throttled
      if visible and curSize isnt "full"
        fh = fullHeight()
        elem.stop true, false
        elem.animate height: fh
        elem0.stop true, false
        elem0.animate height: fh

    init: init
    clear: clear
    setSize: setSize
    getSize: ->
      curSize

    setVisibility: setVisibility
    hide: hide
    show: show
    addCallback: addCallback
    setDWHeight: setDWHeight
    addTitle: addTitle
    setTitle: setTitle
    showTitle: showTitle
    elem1contentHeight: elem1contentHeight
    getElems: getElems

#