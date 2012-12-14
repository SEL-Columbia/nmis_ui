###
I'm moving modules into this file wrapped in "do ->" (self-executing functions)
until they play well together (and I ensure they don't over-depend on other modules.)

Doing this instead of splitting them into their own files.
###

do ->
  Breadcrumb = do ->
    levels = []
    elem = false
    context = {}

    init = (_elem, opts) ->
      elem = $(_elem).eq(0)

      opts.draw = true  unless opts.draw?
      setLevels opts.levels, false  if opts.levels?
      draw()  unless not opts.draw
    clear = ->
      elem.empty()  if elem isnt `undefined`
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

    # returns all MapMgr's externally callable functions
    init: init
    clear: clear
    loaded: loaded
    isLoaded: isLoaded
    mapboxLayer: mapboxLayer
    addLoadCallback: addLoadCallback

#