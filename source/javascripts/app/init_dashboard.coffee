
NMIS.url_root = do ->
  url_root = "#{window.location.pathname}"
  url_root = url_root.replace("index.html", "") if !!~ url_root.indexOf "index.html"
  url_root

###

initializing a Sammy.js object, called "dashboard".
This will route URLs and handle links to pre-routed URLs.

routes are defined in nmis_facilities.js and nmis_summary.js by:
   dashboard.get("/url/:variable", callback);

URL actions can be triggered by calling:
   dashboard.setLocation("/url/hello");

###

@dashboard = $.sammy("body", ->
  @get "#{NMIS.url_root}#/:state/:lga/?", ->
    # when user lands at this base page, they will
    # be redirected to a default section (ie. "summary")
    dashboard.setLocation "#{NMIS.url_root}#/#{@params.state}/#{@params.lga}/summary/"
)

#
#//NMIS.DisplayWindow.showTitle('tables')
#

NMIS.DisplayWindow.init ".content",
  offsetElems: ".topbar .fill .container"
  sizeCookie: true
  # callbacks:
  #   resize: [(animate, sizeName) ->
  #     switch sizeName
  #       when "full"
  #         NMIS.DisplayWindow.showTitle "tables"
  #       when "middle"
  #         NMIS.DisplayWindow.showTitle "bar"
  #       when "minimized"
  #         NMIS.DisplayWindow.showTitle "bar"
  #   ]

overviewObj =
  name: "Overview"
  slug: "overview"

NMIS.init()
wElems = NMIS.DisplayWindow.getElems()
NMIS._wElems = wElems

NMIS.LocalNav.init wElems.wrap,
  sections: [[["mode:summary", "LGA Summary", "#"], ["mode:facilities", "Facility Detail", "#"]], [["sector:overview", "Overview", "#"], ["sector:health", "Health", "#"], ["sector:education", "Education", "#"], ["sector:water", "Water", "#"]]]

do ->
  pushAsDefined = (o, keyList)->
    arr = []
    for key in keyList
      item = o[key]
      unless not item
        arr.push (if item.slug is `undefined` then item else item.slug)
      else
        return arr
    arr
  NMIS.urlFor = (o) ->
    o.root = "#{NMIS.url_root}#" unless o.root?
    o.mode = "summary" unless o.mode?
    return "#{NMIS.url_root}#?error"  if not o.lga or not o.state
    klist = ["root", "state", "lga", "mode", "sector", "subsector", "indicator"]
    builtUrl = pushAsDefined(o, klist).join "/"
    builtUrl += "?facility=" + o.facility  unless not o.facility
    builtUrl

NMIS._prepBreadcrumbValues = (e, keys, env) ->
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

NMIS.Breadcrumb.init "p.bc",
  levels: []

do ->
  dashboard.get NMIS.url_root, NMIS.CountryView
  dashboard.get "#{NMIS.url_root}#/", NMIS.CountryView

dashboard.get "#{NMIS.url_root}#/:state/:lga/facilities/?(#.*)?", NMIS.launch_facilities
dashboard.get "#{NMIS.url_root}#/:state/:lga/facilities/:sector/?(#.*)?", NMIS.launch_facilities
dashboard.get "#{NMIS.url_root}#/:state/:lga/facilities/:sector/:subsector/?(#.*)?", NMIS.launch_facilities
dashboard.get "#{NMIS.url_root}#/:state/:lga/facilities/:sector/:subsector/:indicator/?(#.*)?", NMIS.launch_facilities

dashboard.get "#{NMIS.url_root}#/:state/:lga/summary/?(#.*)?", NMIS.loadSummary
dashboard.get "#{NMIS.url_root}#/:state/:lga/summary/:sector/?(#.*)?", NMIS.loadSummary
dashboard.get "#{NMIS.url_root}#/:state/:lga/summary/:sector/:subsector/?(#.*)?", NMIS.loadSummary
dashboard.get "#{NMIS.url_root}#/:state/:lga/summary/:sector/:subsector/:indicator/?(#.*)?", NMIS.loadSummary

do ->
  ###
  If the url has a search string that includes "?data=xyz", then this
  will assign the data-source cookie to the value and then redirect to
  the URL without the data-source in it.
  ###
  srchStr = "#{window.location.search}"
  unless -1 is srchStr.indexOf "data="
    href = "#{window.location.href}"
    hash = "#{window.location.hash}"
    [ss, ssData] = srchStr.match /data=(.*)$/
    $.cookie "data-source", ssData  if ssData
    newUrl = href.split("?")[0]
    newUrl += hash  if hash
    window.location.href = newUrl

data_src = $.cookie "data-source"
default_data_source_url = "./path_to_generic_data_source/"
data_src = default_data_source_url  unless data_src?
NMIS._data_src_root_url = data_src

# After document has loaded, load "schema" and when that is complete, run sammy.
$ ->
  NMIS.load_schema(data_src).done ()-> dashboard.run()
