$.when_O = (arg_O)->
  ###
  When handling multiple $.Defferreds,

  $.when(...) receives a list and then passes
  a list of arguments.

  This mini plugin receives an object of named deferreds
  and resolves with an object with the results.

  Example:

  var shows = {
    "simpsons": $.getJSON(simpsons_shows),
    "southPark": $.getJSON(southpark_shows)
  };

  $.when_O(shows).done(function(showResults){
    var showNames = [];
    if(showResults.familyGuy) showNames.push("Family Guy")
    if(showResults.simpsons) showNames.push("Simpsons")
    if(showResults.southPark) showNames.push("South Park")

    console.log(showNames);
    //  ["Simpsons", "South Park"]
  });

  ###

  defferred = new $.Deferred

  promises = []
  finished = {}

  for key, val of arg_O
    promises.push val
    finished[key] = false

  $.when.apply(null, promises).done ()->
    results = {}
    for key, val of arg_O
      ###
      in $.getJSON, for example, I want to access the parsedJSON object so
      I don't want to finish everything until all success callback have been
      called.
      ###
      val.done (result)->
        finished[key] = true
        results[key] = result

        ###
        Continue if all are finished.
        ###
        completed = false
        completed = true for k, fin of finished when fin
        defferred.resolve results if completed

  defferred

_.templateSettings =
  escape: /<{-([\s\S]+?)}>/g
  evaluate: /<{([\s\S]+?)}>/g
  interpolate: /<{=([\s\S]+?)}>/g

url_root = "#{window.location.pathname}"
url_root = url_root.replace("index.html", "") if !!~ url_root.indexOf "index.html"

NMIS.url_root = url_root

@dashboard = $.sammy("body", ->
  @get "^$", -> dashboard.setLocation "#{url_root}#/state/lga"
  @get "#{url_root}#/:state/:lga/?", ->
    # when user lands at this base page, they will
    # be redirected to a default section (ie. "summary")
    dashboard.setLocation "#{url_root}#/#{@params.state}/#{@params.lga}/summary/"
)

@dashboard.get "#{url_root}#data=(.*)", ()->
  data_src = @params.splat[0]
  $.cookie "data-source", data_src
  @redirect "#{url_root}"

$(".page-header").remove()

#
#//NMIS.DisplayWindow.showTitle('tables')
#
NMIS.DisplayWindow.init ".content",
  offsetElems: ".topbar .fill .container"
  sizeCookie: true
  callbacks:
    resize: [(animate, sizeName) ->
      switch sizeName
        when "full"
          NMIS.DisplayWindow.showTitle "tables"
        when "middle"
          NMIS.DisplayWindow.showTitle "bar"
        when "minimized"
          NMIS.DisplayWindow.showTitle "bar"
    ]

overviewObj =
  name: "Overview"
  slug: "overview"

NMIS.init()
wElems = NMIS.DisplayWindow.getElems()
NMIS._wElems = wElems

#
#initializing a Sammy.js object, called "dashboard".
#This will route URLs and handle links to pre-routed URLs.
#
#routes are defined in nmis_facilities.js and nmis_summary.js by:
#    dashboard.get("/url/:variable", callback);
#
#URL actions can be triggered by calling:
#    dashboard.setLocation("/url/hello");
#

#
#NMIS.LocalNav is the navigation element at the top of the page.
#URLs are rebuilt as the user navigates through the page.
#
NMIS.LocalNav.init wElems.wrap,
  sections: [[["mode:summary", "LGA Summary", "#"], ["mode:facilities", "Facility Detail", "#"]], [["sector:overview", "Overview", "#"], ["sector:health", "Health", "#"], ["sector:education", "Education", "#"], ["sector:water", "Water", "#"]]]

NMIS.urlFor = (_o) ->
  o = _.extend(
    #defaults
    root: "#{NMIS.url_root}#"
    mode: "summary"
  , _o)
  return "#{NMIS.url_root}#?error"  if not o.lga or not o.state
  uu = (_pushAsDefined = (obj, keyList) ->
    key = undefined
    i = undefined
    l = undefined
    arr = []
    item = undefined
    i = 0
    l = keyList.length

    while i < l
      key = keyList[i]
      item = obj[key]
      unless not item
        return ["/error"]  if item is false
        arr.push (if item.slug is `undefined` then item else item.slug)
      else
        return arr
      i++
    arr
  )(o, ["root", "state", "lga", "mode", "sector", "subsector", "indicator"]).join("/")
  uu += "?facility=" + o.facilityId  unless not o.facilityId
  uu

NMIS._prepBreadcrumbValues = (e, keys, env) ->
  i = undefined
  l = undefined
  key = undefined
  val = undefined
  name = undefined
  arr = []
  i = 0
  l = keys.length

  while i < l
    key = keys[i]
    val = e[key]
    if val isnt `undefined`
      name = val.name or val.slug or val
      env[key] = val
      arr.push [name, NMIS.urlFor(env)]
    else
      return arr
    i++
  arr
