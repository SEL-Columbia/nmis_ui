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
    mapLoadFn = -> $.getScript "http://maps.googleapis.com/maps/api/js?sensor=false&callback=#{callbackStr}"
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
        dashboard.setLocation NMIS.urlFor(NMIS.Env.extend(facilityId: false))

    # Externally callable functions:
    activate: activate
    isActive: isActive
    deselect: deselect

do ->
  NMIS.DataLoader = do ->
    fetchLocalStorage = (url) ->
      p = undefined
      data = undefined
      stringData = localStorage.getItem(url)
      if stringData
        data = JSON.parse(stringData)
        $.getJSON(url).then (d) ->
          localStorage.removeItem url
          localStorage.setItem url, JSON.stringify(d)

        $.Deferred().resolve [data]
      else
        p = new $.Deferred()
        $.getJSON(url).then (d) ->
          localStorage.setItem url, JSON.stringify(d)
          p.resolve [d]
        p.promise()

    fetch = (url) -> $.getJSON url
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
      elem = $("<ul />",
        id: "local-nav"
        class: "nav"
      )
      wrap = $("<div />",
        class: "row ln-wrap"
      ).css(
        position: "absolute"
        top: 82
        left: 56
        "z-index": 99
      ).html(elem)
      $(".content").eq(0).prepend wrap
      _.each opts.sections, (section, i) ->
        if i isnt 0
          $("<li />",
            class: "small spacer"
          ).html("&nbsp;").appendTo elem
        _.each section, (arr) ->
          code = arr[0].split(":")
          buttonSections[code[0]] = {}  if buttonSections[code[0]] is `undefined`
          a = $("<a />",
            href: arr[2]
            text: arr[1]
          )
          buttonSections[code[0]][code[1]] = a
          $("<li />").html(a).appendTo elem


      submenu = $("<ul />").addClass("submenu").appendTo(elem)
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
    displaySubmenu: displaySubmenu
    hideSubmenu: hideSubmenu
    markActive: markActive

#