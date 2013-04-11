(function() {
  var mmgrDefaultOpts, start;

  describe("nmis", function() {
    beforeEach(function() {
      return NMIS.init(data, {
        iconSwitcher: false,
        sectors: sectors
      });
    });
    afterEach(function() {
      return NMIS.clear();
    });
    it("has tabulations_works", function() {
      var array_expected, array_result, result, with_keylist, with_keylist_expected;
      result = NMIS.Tabulation.sectorSlug("education", "something");
      expect(result).toEqual({
        "false": 7,
        "true": 3
      });
      array_result = NMIS.Tabulation.sectorSlugAsArray("education", "something");
      array_expected = [
        {
          occurrences: 'false',
          value: 7
        }, {
          occurrences: 'true',
          value: 3
        }
      ];
      expect(array_result).toEqual(array_expected);
      with_keylist = NMIS.Tabulation.sectorSlug("education", "something", ["true", "false", "maybe"]);
      with_keylist_expected = {
        'true': 3,
        'false': 7,
        'maybe': 0
      };
      return expect(with_keylist).toEqual(with_keylist_expected);
    });
    return it("has nmis.sectors", function() {
      expect(NMIS.Sectors.all().length).toBe(4);
      return expect(NMIS.Sectors.pluck('health').slug).toBe('health');
    });
  });

  describe("nmis_data", function() {
    return it("has validation", function() {
      NMIS.init(data2, {
        iconSwitcher: false,
        sectors: sectors2
      });
      expect(NMIS.validateData()).toBeTruthy();
      return expect(NMIS.dataForSector('health').length).toBe(10);
    });
  });

  describe("popup_works", function() {
    return it("has a popup", function() {
      var exFacility;
      NMIS.init(data2, {
        iconSwitcher: false,
        sectors: sectors2
      });
      exFacility = NMIS.data()[0];
      NMIS.FacilityPopup(exFacility, {
        addClass: 'test-elem'
      });
      return $('.ui-dialog').remove();
    });
  });

  describe("breadcrumbs", function() {
    beforeEach(function() {
      NMIS.Breadcrumb.clear();
      return NMIS.Breadcrumb.init('p.bc');
    });
    afterEach(function() {
      return NMIS.Breadcrumb.clear();
    });
    return it("can set breadcrumb", function() {
      var bc_levels;
      expect(NMIS.Breadcrumb._levels().length).toBe(0);
      bc_levels = [["Country", "/country"], ["State", "/country"], ["District", "/country/district"]];
      NMIS.Breadcrumb.setLevels(bc_levels);
      expect(NMIS.Breadcrumb._levels().length).toBe(3);
      NMIS.Breadcrumb.setLevel(2, ["LGA", "/country/lga"]);
      return NMIS.Breadcrumb.draw();
    });
  });

  describe("map_icons", function() {
    beforeEach(function() {
      return this.simpleItems = {
        item1: {
          sector: "health",
          name: "Clinic"
        },
        item2: {
          sector: "health",
          name: "Dispensary"
        },
        item3: {
          sector: "education",
          name: "Primary School"
        },
        item4: {
          sector: "education",
          name: "Secondary School"
        }
      };
    });
    it("has icon_manager", function() {
      NMIS.IconSwitcher.init({
        items: this.simpleItems
      });
      expect(NMIS.IconSwitcher.allShowing().length).toBe(0);
      NMIS.IconSwitcher.shiftStatus(function(id, item) {
        return "normal";
      });
      expect(NMIS.IconSwitcher.allShowing().length).toBe(4);
      NMIS.IconSwitcher.shiftStatus(function(id, item) {
        return false;
      });
      expect(NMIS.IconSwitcher.allShowing().length).toBe(0);
      expect(NMIS.IconSwitcher.all().length).toBe(4);
      expect(NMIS.IconSwitcher.filterStatus('normal').length).toBe(0);
      NMIS.IconSwitcher.shiftStatus(function(id, item) {
        return "normal";
      });
      expect(NMIS.IconSwitcher.all().length).toBe(4);
      expect(NMIS.IconSwitcher.filterStatus('normal').length).toBe(4);
      NMIS.IconSwitcher.shiftStatus(function(id, item) {
        if (item.name === "Dispensary") {
          return "normal";
        } else {
          return false;
        }
      });
      expect(NMIS.IconSwitcher.filterStatus('normal').length).toBe(1);
      expect(NMIS.IconSwitcher.allShowing().length).toBe(1);
      NMIS.IconSwitcher.shiftStatus(function(id, item) {
        if (item.name !== "Dispensary") {
          return "normal";
        } else {
          return false;
        }
      });
      expect(NMIS.IconSwitcher.filterStatus('normal').length).toBe(3);
      return expect(NMIS.IconSwitcher.allShowing().length).toBe(3);
    });
    return it("has iconswitcher callbacks working", function() {
      var hideCounter, newCounter;
      NMIS.IconSwitcher.init({
        items: this.simpleItems
      });
      newCounter = 0;
      hideCounter = 0;
      NMIS.IconSwitcher.setCallback("shiftMapItemStatus", function() {
        return newCounter++;
      });
      NMIS.IconSwitcher.setCallback("setMapItemVisibility", function(tf) {
        if (!tf) {
          return hideCounter++;
        }
      });
      NMIS.IconSwitcher.shiftStatus(function(id, item) {
        return "normal";
      });
      expect(newCounter).toBe(4);
      expect(hideCounter).toBe(0);
      NMIS.IconSwitcher.shiftStatus(function(id, item) {
        return false;
      });
      return expect(hideCounter).toBe(4);
    });
  });

  describe("map_icons_with_working_data", function() {
    beforeEach(function() {
      NMIS.init(data2, {
        iconSwitcher: false,
        sectors: sectors2
      });
      return NMIS.IconSwitcher.init({
        items: data2
      });
    });
    afterEach(function() {
      NMIS.IconSwitcher.clear();
      return NMIS.clear();
    });
    return it("icon_manager2", function() {
      expect(NMIS.IconSwitcher.all().length).toBe(30);
      return expect(NMIS.IconSwitcher.allShowing().length).toBe(0);
    });
  });

  mmgrDefaultOpts = {
    fake: true,
    fakeDelay: 0
  };

  start = function() {};

  describe("map manager", function() {
    beforeEach(function() {
      return this.mInit = NMIS.MapMgr.init(mmgrDefaultOpts);
    });
    afterEach(function() {
      return NMIS.MapMgr.clear();
    });
    it("has working map manager", function() {
      NMIS.MapMgr.addLoadCallback(function() {
        return start();
      });
      expect(this.mInit).toBeDefined();
      return expect(NMIS.MapMgr.isLoaded()).not.toBeTruthy();
    });
    return it("can be loaded twice without probs", function() {
      expect(NMIS.MapMgr.init(mmgrDefaultOpts)).toBeTruthy();
      return expect(NMIS.MapMgr.init(mmgrDefaultOpts)).toBeTruthy();
    });
  });

  describe("misc", function() {
    return it("has mapmgr playing nicely with other modules", function() {
      var value;
      value = 0;
      expect(value).toBe(0);
      NMIS.MapMgr.init({
        fake: true,
        fakeDelay: 0,
        loadCallbacks: [
          function() {
            return value++;
          }
        ]
      });
      return window.setTimeout((function() {
        expect(value).toBe(1);
        return log(value);
      }), 0);
    });
  });

}).call(this);
