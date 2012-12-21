describe "nmis modules existence", ->
  it "has modules defined", ->
    expectDefined = (x)-> expect(x).toBeDefined()
    expectDefined(NMIS[em]) for em in NMIS.expected_modules

  it "can be initted", ->
    first_result = NMIS.init data2,
      iconSwitcher: false
      sectors: sectors2
    expect(first_result).toBeTruthy()
