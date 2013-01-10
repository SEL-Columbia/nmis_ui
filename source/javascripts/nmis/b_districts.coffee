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
          log "val", nav.find('select').val()
          NMIS.select_district nav.find('select').val()
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

  NMIS.load_schema = (data_src)->
    schema_url = "#{data_src}schema.json"
    deferred = new $.Deferred
    $.getJSON "#{data_src}schema.json", (schema)->
      display_in_header schema
      NMIS.ModuleFile.DEFAULT_MODULES[dname] = new NMIS.ModuleFile(durl) for dname, durl of schema.defaults
      if schema.districts_json?
        districts_module = new NMIS.ModuleFile(schema.districts_json)
        districts_module.fetch().done (dl)->
          NMIS.load_districts dl.groups, dl.districts
          deferred.resolve()
      else if schema.districts? and schema.groups?
        NMIS.load_districts schema.groups, schema.districts
        deferred.resolve()
      else
        deferred.fail()
    deferred.promise()

do ->
  NMIS.load_districts = (group_list, district_list)->
    group_names = []
    groups = []
    districts = []

    get_group_by_id = (grp_id)->
      grp_found = false
      grp_found = grp for grp in groups when grp.id is grp_id
      grp_found

    groups = (new NMIS.Group(grp_details) for grp_details in group_list)

    for district in district_list
      d = new NMIS.District district
      d.set_group get_group_by_id d.group
      districts.push d

    new_select = $ '<select>', id: 'lga-select', title: 'Select a district'
    for group in groups
      optgroup = $ '<optgroup>', label: group.name
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
    new_select.chosen()

do ->
  NMIS.select_district = (district_id=false)->
    ###
    this is called on form submit, for example
    ###
    existing = false
    if district_id
      existing = d for d in NMIS._districts_ when d.id is district_id
    # $.cookie "selected-district", if existing then district_id else ""
    if existing
      NMIS._lgaFacilitiesDataUrl_ = "#{existing.data_root}/facilities.json"
      dashboard.setLocation NMIS.urlFor state: existing.group.slug, lga: existing.slug

class NMIS.District
  constructor: (d)->
    _.extend @, d
    [@group_slug, @slug] = d.url_code.split("/")
    # change everything over to @lat_lng at a later time?
    @data_modules = [] unless @data_modules?
    @module_files = (new NMIS.ModuleFile(f, @) for f in @data_modules)
    @latLng = @lat_lng
    @html_params =
      text: @label
      value: @id
  module_url: (module_name)->
    @get_data_module(module_name).url
  sectors_data_loader: ()->
    # if @has_data_module("sectors")
    #   fetcher = NMIS.DataLoader.fetch @module_url("sectors")
    # else
    fetcher = @get_data_module("sectors").fetch()
    fetcher.done (s)->
      NMIS.loadSectors s.sectors,
        default:
          name: "Overview"
          slug: "overview"
    fetcher

  get_data_module: (module)->
    match = m for m in @module_files when m.name is module
    unless match?
      # log "GETTING DEFAULT #{module}", DEFAULT_MODULES, module in DEFAULT_MODULES
      match = NMIS.ModuleFile.DEFAULT_MODULES[module]
    throw new Error("Module not found: #{module}") unless match?
    match

  has_data_module: (module)->
    try
      !!@get_data_module module
    catch e
      false

  set_group: (@group)-> @group.add_district @

NMIS.getDistrictByUrlCode = (url_code)->
  matching_district = false
  matching_district = d for d in NMIS._districts_ when d.url_code is url_code
  throw new Error "District: #{url_code} not found" unless matching_district
  matching_district

class NMIS.Group
  constructor: (details)->
    @districts = []
    @label = details.label
    @id = details.id
  add_district: (d)->
    @districts.push d
    @slug = d.group_slug unless @slug?
    @districts = @districts.sort (a, b)-> a.label > b.label if b?
    true

class NMIS.ModuleFile
  constructor: (@filename, district)->
    try
      [devnull, @name, @file_type] = @filename.match(/(.*)\.(json|csv)/)
    catch e
      throw new Error("Filetype not recognized: #{@filename}")
    throw new Error "No data_src_root_url" unless NMIS._data_src_root_url?
    mid_url = if district? then "#{district.data_root}/" else ""
    @url = "#{NMIS._data_src_root_url}#{mid_url}#{@filename}"
  fetch: ()-> NMIS.DataLoader.fetch @url

NMIS.ModuleFile.DEFAULT_MODULES = {}
