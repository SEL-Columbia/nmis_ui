(function() {

  describe("nmis modules existence", function() {
    it("has modules defined", function() {
      var expectDefined;
      expectDefined = function(x) {
        return expect(x).toBeDefined();
      };
      expectDefined(NMIS);
      expectDefined(NMIS.Tabulation);
      expectDefined(NMIS.clear);
      expectDefined(NMIS.Sectors);
      expectDefined(NMIS.validateData);
      expectDefined(NMIS.dataForSector);
      expectDefined(NMIS.data);
      expectDefined(NMIS.FacilityPopup);
      expectDefined(NMIS.Breadcrumb);
      expectDefined(NMIS.IconSwitcher);
      return expectDefined(NMIS.MapMgr);
    });
    return it("can be initted", function() {
      var first_result;
      first_result = NMIS.init(data2, {
        iconSwitcher: false,
        sectors: sectors2
      });
      return expect(first_result).toBeTruthy();
    });
  });

}).call(this);
