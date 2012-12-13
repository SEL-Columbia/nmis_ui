header = $('.data-src')
nav = $('.lga-nav')
throw new Error("Cannot initialize data-source-selector") unless header.get(0)?

default_data_source =
  name: "Sample data"
  url: "./sample_data"

header.on 'click', 'a', (evt)->
  false

select_data_source = ()->
  
set_default_data_source = ->
  header.find("span").text default_data_source.name

display_in_header = (s)->
  title = s.title
  $('title').html(title)
  brand = $('.brand')
  logo = brand.find('.logo').detach()
  brand.empty().append(logo).append(title)
  header.find("span").text(s.id)

load_data_source = (root_url, cb)->
  $.getJSON "#{root_url}schema.json", (schema)->
    display_in_header schema
    load_districts schema.districts
    NMIS._defaultSectorUrl_ = root_url + schema.defaults.sectors if schema.defaults?.sectors?
    NMIS._defaultVariableUrl_ = root_url + schema.defaults.variables if schema.defaults?.variables?
    cb()

clear_data_source = ->
  header.find("span").html("&hellip;")

data_src = $.cookie("data-source")
data_src = default_data_source.url unless data_src?
load_data_source data_src, ()->
  ###
  At this point the districts will have loaded.
  ###
  dashboard.run()

NMIS._data_src_root_url = data_src

class District
  constructor: (d)->
    _.extend @, d
    [@group_slug, @slug] = d.url_code.split("/")
    # change everything over to @lat_lng at a later time?
    @latLng = @lat_lng
    @html_params =
      text: @label
      value: @id
  module_url: (module_name)->
    "#{NMIS._data_src_root_url}#{@data_root}/#{module_name}.json"
  sectors_data_loader: ()->
    # if @has_data_module("sectors")
    #   fetcher = NMIS.DataLoader.fetch @module_url("sectors")
    # else
    fetcher = NMIS.DataLoader.fetch(NMIS._defaultSectorUrl_)
    fetcher.done (s)->
      NMIS.loadSectors s.sectors,
        default:
          name: "Overview"
          slug: "overview"
    fetcher

  has_data_module: (module)-> module in @data_modules
  set_group: (@group)-> @group.add_district @

class Group
  constructor: (@name)->
    @districts = []
    @label = @name
  add_district: (d)->
    @districts.push d
    @slug = d.group_slug unless @slug?
    @districts = @districts.sort (a, b)-> a.label > b.label if b?
    true

select_district = -> # no-op

nav.on 'submit', 'form', (evt)->
  select_district nav.find('select').val()
  false

load_districts = (district_list)->
  group_names = []
  groups = []
  districts = []
  get_or_create_group = (name)->
    if name not in group_names
      g = new Group(name)
      groups.push g
    else
      for group in groups
        g = group if group.name is name
    g
  for district in district_list
    d = new District district
    d.set_group get_or_create_group d.group
    districts.push d
  new_select = $ '<select>',
    id: 'lga-select'
    title: 'Select a district'
  for group in groups
    optgroup = $ '<optgroup>',
      label: group.name
    $('<option>', d.html_params).appendTo(optgroup) for d in group.districts
    optgroup.appendTo new_select

  ###
  We will want to hang on to these districts for later, and give them
  a nice name when we find a good home for them.
  ###
  NMIS._districts_ = districts
  NMIS._groups_ = groups

  select_district = (district_id)->
    ###
    this is called on form submit, for example
    ###
    existing = false
    existing = d for d in districts when d.id is district_id
    $.cookie "selected-district", if existing then district_id else false
    unless existing?
      NMIS._lgaFacilitiesDataUrl_ = "#{existing.data_root}/facilities.json"

  already_selected = $.cookie "selected-district"
  if already_selected?
    new_select.val already_selected
    select_district already_selected

  submit_button = nav.find("input[type='submit']").detach()
  nav.find('form div').eq(0).empty().html(new_select).append(submit_button)
  new_select.chosen()


load_sectors = (url)->
  q = NMIS.DataLoader.fetch url
  q.done (s)->
    NMIS.loadSectors s.sectors,
      default:
        name: "Overview"
        slug: "overview"
  q

load_variables = (url)->
  NMIS._defaultVariableUrl_ = url
  NMIS.DataLoader.fetch url


NMIS.getDistrictByUrlCode = (url_code)->
  matching_district = false
  for district in NMIS._districts_
    matching_district = district if district.url_code is url_code
  throw "District: #{url_code} not found" unless matching_district
  matching_district