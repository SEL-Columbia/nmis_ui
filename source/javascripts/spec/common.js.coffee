describe "nmis modules existence", ->
  it "has modules defined", ->
    expectDefined = (x)-> expect(x).toBeDefined()
    expectDefined NMIS
    expectDefined NMIS.Tabulation
    expectDefined NMIS.clear
    expectDefined NMIS.Sectors
    expectDefined NMIS.validateData
    expectDefined NMIS.dataForSector
    expectDefined NMIS.data
    expectDefined NMIS.FacilityPopup
    expectDefined NMIS.Breadcrumb
    expectDefined NMIS.IconSwitcher
    expectDefined NMIS.MapMgr

  it "can be initted", ->
    first_result = NMIS.init data2,
      iconSwitcher: false
      sectors: sectors2
    expect(first_result).toBeTruthy()
