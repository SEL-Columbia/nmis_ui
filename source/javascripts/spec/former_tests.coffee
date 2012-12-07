describe "nmis", ->
  beforeEach ->
    NMIS.init data,
      iconSwitcher: false
      sectors: sectors
  afterEach -> NMIS.clear()

  it "has tabulations_works", ->
    result = NMIS.Tabulation.sectorSlug "education", "something"
    expect(result).toEqual
      false: 7
      true: 3

    array_result = NMIS.Tabulation.sectorSlugAsArray "education", "something"
    array_expected = [{occurrences: 'false',value: 7}, {occurrences: 'true',value: 3}]
    expect(array_result).toEqual array_expected

    with_keylist = NMIS.Tabulation.sectorSlug "education", "something", ["true", "false", "maybe"]
    with_keylist_expected =
      'true': 3
      'false': 7
      'maybe': 0
    expect(with_keylist).toEqual with_keylist_expected

  it "has nmis.sectors", ->
    expect(NMIS.Sectors.all().length).toBe 4
    expect(NMIS.Sectors.pluck('health').slug).toBe 'health'

describe "nmis_data", ->
  it "has validation", ->
    NMIS.init data2,
      iconSwitcher: false
      sectors: sectors2
    expect(NMIS.validateData()).toBeTruthy()
    expect(NMIS.dataForSector('health').length).toBe 10

describe "popup_works", ->
  it "has a popup", ->
    NMIS.init data2,
      iconSwitcher: false
      sectors: sectors2
    exFacility = NMIS.data()[0]
    NMIS.FacilityPopup exFacility,
      addClass: 'test-elem'
    $('.ui-dialog').remove()

describe "breadcrumbs", ->
  beforeEach ->
    NMIS.Breadcrumb.clear()
    NMIS.Breadcrumb.init('p.bc')
  afterEach ->
    NMIS.Breadcrumb.clear()
  it "can set breadcrumb", ->
    expect(NMIS.Breadcrumb._levels().length).toBe(0)
    bc_levels = [["Country", "/country"], ["State", "/country"], ["District", "/country/district"]]
    NMIS.Breadcrumb.setLevels bc_levels
    expect(NMIS.Breadcrumb._levels().length).toBe(3)
    NMIS.Breadcrumb.setLevel 2, ["LGA", "/country/lga"]
    NMIS.Breadcrumb.draw()

describe "map_icons", ->
  beforeEach ->
    @simpleItems =
      item1:
        sector: "health"
        name: "Clinic"

      item2:
        sector: "health"
        name: "Dispensary"

      item3:
        sector: "education"
        name: "Primary School"

      item4:
        sector: "education"
        name: "Secondary School"
  it "has icon_manager", ->
    NMIS.IconSwitcher.init { items: this.simpleItems }
    expect(NMIS.IconSwitcher.allShowing().length).toBe(0)

    NMIS.IconSwitcher.shiftStatus (id, item)-> "normal"
    expect(NMIS.IconSwitcher.allShowing().length).toBe(4)

    NMIS.IconSwitcher.shiftStatus (id, item)-> false
    expect(NMIS.IconSwitcher.allShowing().length).toBe(0)

    expect(NMIS.IconSwitcher.all().length).toBe(4)
    expect(NMIS.IconSwitcher.filterStatus('normal').length).toBe(0)

    NMIS.IconSwitcher.shiftStatus (id, item)-> "normal"
    expect(NMIS.IconSwitcher.all().length).toBe(4)
    expect(NMIS.IconSwitcher.filterStatus('normal').length).toBe(4)

    NMIS.IconSwitcher.shiftStatus (id, item)-> if (item.name is "Dispensary") then "normal" else false
    expect(NMIS.IconSwitcher.filterStatus('normal').length).toBe(1)
    expect(NMIS.IconSwitcher.allShowing().length).toBe(1)

    NMIS.IconSwitcher.shiftStatus (id, item)-> if (item.name isnt "Dispensary") then "normal" else false
    expect(NMIS.IconSwitcher.filterStatus('normal').length).toBe(3)
    expect(NMIS.IconSwitcher.allShowing().length).toBe(3)

  it "has iconswitcher callbacks working", ->
    NMIS.IconSwitcher.init items: @simpleItems
    #reset all status to hidden and status:undefined.
    newCounter = 0
    hideCounter = 0
    
    NMIS.IconSwitcher.setCallback "shiftMapItemStatus", -> newCounter++
    NMIS.IconSwitcher.setCallback "setMapItemVisibility", (tf) -> hideCounter++  unless tf
    NMIS.IconSwitcher.shiftStatus (id, item) -> "normal"

    expect(newCounter).toBe(4)
    expect(hideCounter).toBe(0)

    NMIS.IconSwitcher.shiftStatus (id, item) -> false
    expect(hideCounter).toBe(4)

describe "map_icons_with_working_data", ->
  beforeEach ->
    NMIS.init data2,
      iconSwitcher: false
      sectors: sectors2

    NMIS.IconSwitcher.init items: data2

  afterEach ->
    NMIS.IconSwitcher.clear()
    NMIS.clear()

  it "icon_manager2", ->
    expect(NMIS.IconSwitcher.all().length).toBe(30)
    expect(NMIS.IconSwitcher.allShowing().length).toBe(0)

mmgrDefaultOpts =
  fake: true
  fakeDelay: 0

start = ()->
  # call the jasmine equivalent of qunit's "start"...

describe "map manager", ->
  beforeEach ->
    @mInit = NMIS.MapMgr.init(mmgrDefaultOpts)
  afterEach ->
    NMIS.MapMgr.clear()
  it "has working map manager", ->
    NMIS.MapMgr.addLoadCallback -> start()

    expect(@mInit).toBeDefined()
    expect(NMIS.MapMgr.isLoaded()).not.toBeTruthy()

  it "can be loaded twice without probs", ->
    expect(NMIS.MapMgr.init(mmgrDefaultOpts)).toBeTruthy()
    expect(NMIS.MapMgr.init(mmgrDefaultOpts)).toBeTruthy()

describe "misc", ->
  it "has mapmgr playing nicely with other modules", ->
    value = 0
    expect(value).toBe(0) #duh

    NMIS.MapMgr.init
      fake: true
      fakeDelay: 0
      loadCallbacks: [->
        value++
      ]

    window.setTimeout (->
      expect(value).toBe(1)
      log(value)
    ), 0
