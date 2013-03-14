headers = do ->
  header = false
  nav = false
  (what)->
    if what is "header"
      if !header
        header = $('.data-src').on 'click', 'a', ()-> false
      else
        header
    else if what is "nav"
      if !nav
        nav = $('.lga-nav').on 'submit', 'form', (evt)->
          d = NMIS.findDistrictById nav.find('select').val()
          dashboard.setLocation NMIS.urlFor.extendEnv state: d.group, lga: d
          evt.preventDefault()
          return false
      else
        nav

do ->
  display_in_header = (s)->
    title = s.title
    $('title').html(title)
    brand = $('.brand')
    logo = brand.find('.logo').detach()
    brand.empty().append(logo).append(title)
    headers('header').find("span").text(s.id)

  district_select = false

  ### NMIS.load_districts should be moved here. ###
  load_districts = (group_list, district_list)->
    group_names = []
    groups = []

    get_group_by_id = (grp_id)->
      grp_found = false
      grp_found = grp for grp in groups when grp.id is grp_id
      grp_found

    groups = (new NMIS.Group(grp_details) for grp_details in group_list)

    districts = for district in district_list
      d = new NMIS.District district
      d.set_group get_group_by_id d.group
      d

    groupsObj = {}
    groupsObj[g.id] = g  for g in groups
    group.assignParentGroup groupsObj  for group in groups
    group.assignLevel() for group in groups

    zones = []
    states = []

    for g in groups
      if g.group is undefined
        zones.push g
      else
        states.push g

    NMIS._zones_ = zones.sort (a, b)-> a.label > b.label if b?
    NMIS._states_ = states.sort (a, b)-> a.label > b.label if b?

    new_select = $ '<select>', id: 'lga-select', title: 'Select a district'
    for group in groups
      optgroup = $ '<optgroup>', label: group.label
      optgroup.append $ '<option>', d.html_params for d in group.districts
      new_select.append optgroup

    ###
    We will want to hang on to these districts for later, and give them
    a nice name when we find a good home for them.
    ###
    NMIS._districts_ = districts
    NMIS._groups_ = groups

    # already_selected = $.cookie "selected-district"
    # if already_selected?
    #   new_select.val already_selected
    #   NMIS.select_district already_selected

    submit_button = headers('nav').find("input[type='submit']").detach()
    headers('nav').find('form div').eq(0).empty().html(new_select).append(submit_button)
    district_select = new_select.chosen()

  NMIS.districtDropdownSelect = (district=false)->
    if district and district_select
      district_select.val(district.id).trigger "liszt:updated"

  NMIS.load_schema = (data_src)->
    schema_url = "#{data_src}schema.json"
    deferred = new $.Deferred
    # Change root url of logo to the root url of the dashboard.
    $("a.brand").attr "href", NMIS.url_root
    getSchema = $.ajax(url: schema_url, dataType: "json", cache: false)
    getSchema.done (schema)->
      display_in_header schema
      NMIS._mapLayersModule_ = new Module "Map Layers", schema.map_layers  if schema.map_layers
      Module.DEFAULT_MODULES = (new Module(dname, durl) for dname, durl of schema.defaults)

      if schema.districts? and schema.groups?
        load_districts schema.groups, schema.districts
        deferred.resolve()
      else
        districts_module = do ->
          for mf in Module.DEFAULT_MODULES when mf.name is "geo/districts"
            return mf
        districts_module.fetch().done ({groups, districts})->
          load_districts groups, districts
          deferred.resolve()
    getSchema.fail (e)-> deferred.reject "Schema file not loaded"
    deferred.promise()

do ->
  NMIS.findDistrictById = (district_id=false)->
    ###
    this is called on form submit, for example
    ###
    existing = false
    if district_id
      existing = d for d in NMIS._districts_ when d.id is district_id
    # $.cookie "selected-district", if existing then district_id else ""
    # if existing
    #   NMIS._lgaFacilitiesDataUrl_ = "#{existing.data_root}/facilities.json"
    #   dashboard.setLocation NMIS.urlFor state: existing.group.slug, lga: existing.slug
    existing

class NMIS.DataRecord
  constructor: (@lga, obj)->
    @value = obj.value
    @source = obj.source
    @id = obj.id

  displayValue: ->
    variable = @variable()
    if variable.data_type is "percent"
      value = NMIS.DisplayValue.raw(@value * 100, variable)[0]
      "#{value}%"
    else
      value = NMIS.DisplayValue.raw(@value)[0]
      value

  variable: ->
    NMIS.variables.find @id

class NoOpFetch
  constructor: (@id)->
  fetch: ()->
    dfd = new $.Deferred()
    cb = ()->
      msg = "#{@id} messed up."
      dfd.reject(msg)
    window.setTimeout cb, 500
    dfd.fail ()=> console.error("failure: #{@id}")
    dfd.promise()

class NMIS.District
  constructor: (d)->
    _.extend @, d
    @name = @label unless @name
    @active = !!d.active
    [@group_slug, @slug] = d.url_code.split("/")
    @files = [] unless @files?
    @module_files = (new Module(slug, f_param, @) for slug, f_param of @files)
    @latLng = @lat_lng
    @id = [@group_slug, @local_id].join("_")
    @html_params =
      text: @name
      value: @id
    @html_params.disabled = "disabled"  unless @active
  defaultSammyUrl: ()->
    "#{NMIS.url_root}#/#{@group_slug}/#{@slug}/summary"
  sectors_data_loader: ()->
    # todo datamod
    _fetcher = @get_data_module("presentation/sectors")
    fetcher = _fetcher.fetch()
    fetcher.done (s)->
      NMIS.loadSectors s.sectors,
        default:
          name: "Overview"
          slug: "overview"
    fetcher

  get_data_module: (module)->
    for mf in @module_files when mf.name is module
      return mf
    for mf in Module.DEFAULT_MODULES when mf.name is module
      return mf
    throw new Error("Module not found: #{module}")
    # new NoOpFetch(module)
    # match = m for m in @module_files when m.name is module
    # unless match?
    #   # log "GETTING DEFAULT #{module}", DEFAULT_MODULES, module in DEFAULT_MODULES
    #   match = Module.DEFAULT_MODULES[module]
    # throw new Error("Module not found: #{module}") unless match?
    # match

  has_data_module: (module)->
    try
      !!@get_data_module module
    catch e
      false

  loadData: ()->
    dfd = $.Deferred()
    # todo datamod/data
    loader = @get_data_module("data/lga_data").fetch()
    loader.done (results)=>
      @lga_data = for d in results.data
        new NMIS.DataRecord @, d

      dfd.resolve @lga_data
    dfd.promise()

  loadVariables: ()->
    dfd = $.Deferred()
    # todo datamod/variables
    @get_data_module("variables/variables").fetch().done (results)=>
      NMIS.variables.clear()
      NMIS.variables.load results
      dfd.resolve NMIS.variables
    dfd.promise()

  lookupRecord: (id)->
    matches = []
    matches.push datum  for datum in @lga_data when datum.id is id
    matches[0]

  set_group: (@group)-> @group.add_district @

NMIS.getDistrictByUrlCode = (url_code)->
  matching_district = false
  matching_district = d for d in NMIS._districts_ when d.url_code is url_code
  throw new Error "District: #{url_code} not found" unless matching_district
  matching_district

class NMIS.Group
  constructor: (details)->
    @districts = []
    @name = @label = details.label
    @id = details.id
    @groupId = details.group
    @children = []
  add_district: (d)->
    @districts.push d
    @children.push d
    @slug = d.group_slug unless @slug?
    @districts = @districts.sort (a, b)-> a.label > b.label if b?
    @children = @children.sort (a, b)-> a.label > b.label if b?
    true
  activeDistrictsCount: ->
    i = 0
    i++  for district in @districts when district.active
    i
  assignParentGroup: (allGroups)->
    if @groupId and allGroups[@groupId]
      @group = allGroups[@groupId]
      @group.children.push @
  assignLevel: ()->
    @_level = @ancestors().length - 1
  ancestors: ()->
    ps = []
    g = @
    while g isnt undefined
      ps.push g
      g = g.group
    ps

_sanitizeStr = (str)->
  "#{str}".toLowerCase().replace(/\W/, "_").replace(/__/g, "_")

class Module
  @DEFAULT_MODULES = []
  constructor: (@id, file_param, district)->
    if _.isArray(file_param)
      @files = (new ModuleFile(fp, district) for fp in file_param)
    else
      @filename = file_param
      @files = [new ModuleFile(file_param, district)]
    @name = @id
  sanitizedId: ()->
    @_sanitizedId = _sanitizeStr @name  unless @_sanitizedId
    @_sanitizedId
  fetch: ()->
    $.when.apply null, (f.fetch() for f in @files)

class ModuleFile
  constructor: (@filename, @district)->
    try
      [devnull, @name, @file_type] = @filename.match(/(.*)\.(json|csv)/)
    catch e
      throw new Error("ModuleFile Filetype not recognized: #{@filename}")
    mid_url = if @district? then "#{@district.data_root}/" else ""
    @url = "#{NMIS._data_src_root_url}#{mid_url}#{@filename}"
  fetch: ()->
    NMIS.DataLoader.fetch @url
    # log "odfule #{@url}"
