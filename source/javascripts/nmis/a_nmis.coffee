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