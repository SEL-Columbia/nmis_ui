###
This file is meant to initialize the NMIS object which includes
independently testable modules.
###
@NMIS = {} unless @NMIS?

_.templateSettings =
  escape: /<{-([\s\S]+?)}>/g
  evaluate: /<{([\s\S]+?)}>/g
  interpolate: /<{=([\s\S]+?)}>/g

do ->
  ###
  the internal "value" function takes a value and returns a 1-2 item list:
  The second returned item (when present) is a class name that should be added
  to the display element.

    examples:
  
    value(null)
    //  ["--", "val-null"]
  
    value(0)
    //  ["0"]
  
    value(true)
    //  ["Yes"]
  ###
  value = (v) ->
    r = [v]
    if v is `undefined`
      r = ["&mdash;", "val-undefined"]
    else if v is null
      r = ["null", "val-null"]
    else if v is true
      r = ["Yes"]
    else if v is false
      r = ["No"]
    else unless isNaN(+v)
      r = [round_down(v)]
    else if $.type(v) is "string"
      r = [NMIS.HackCaps(v)] 
    r

  ###
  The main function, "NMIS.DisplayValue" receives an element
  and displays the appropriate value.
  ###
  DisplayValue = (d, element) ->
    res = value(d)
    element.addClass res[1] if res[1]?
    element.html res[0]
    element

  DisplayValue.raw = value

  # Sometimes, indicators require special classes
  DisplayValue.special = (v, indicator) ->
    r = value(v)
    o =
      name: indicator.name
      classes: ""
      value: r[0]

    classes = ""
    if indicator.display_style is "checkmark_true"
      classes = "label "
      if v is true
        classes += "chk-yes"
      else if v is false
        classes += "chk-no"
      else
        classes += "chk-null"
    else if indicator.display_style is "checkmark_false"
      classes = "label "
      if v is true
        classes += "chk-no"
      else if v is false
        classes += "chk-yes"
      else
        classes += "chk-null"
    o.classes = classes
    o

  # displaying values directly in a TD element (with a wrapping span)
  DisplayValue.inTdElem = (facility, indicator, elem) ->
    vv = facility[indicator.slug]
    c = value(vv)
    chkY = indicator.display_style is "checkmark_true"
    chkN = indicator.display_style is "checkmark_false"
    if chkY or chkN
      oclasses = "label "
      if $.type(vv) is "boolean"
        if vv
          oclasses += (if chkY then "chk-yes" else "chk-no")
        else
          oclasses += (if chkY then "chk-no" else "chk-yes")
      else
        oclasses += "chk-null"
      c[0] = $("<span />").addClass(oclasses).html(c[0])
    elem.html c[0]

  round_down = (v, decimals=2) ->
    d = Math.pow(10, decimals)
    Math.floor(v * d) / d

  NMIS.DisplayValue = DisplayValue

error = (message, opts={})-> log.error message
NMIS.error = error
