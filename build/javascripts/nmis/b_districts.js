(function() {
  var headers;

  headers = (function() {
    var header, nav;
    header = false;
    nav = false;
    return function(what) {
      if (what === "header") {
        if (!header) {
          return header = $('.data-src').on('click', 'a', function() {
            return false;
          });
        } else {
          return header;
        }
      } else if (what === "nav") {
        if (!nav) {
          return nav = $('.lga-nav').on('submit', 'form', function() {
            return NMIS.select_district(nav.find('select').val());
          });
        } else {
          return nav;
        }
      }
    };
  })();

  (function() {
    var display_in_header;
    display_in_header = function(s) {
      var brand, logo, title;
      title = s.title;
      $('title').html(title);
      brand = $('.brand');
      logo = brand.find('.logo').detach();
      brand.empty().append(logo).append(title);
      return headers('header').find("span").text(s.id);
    };
    return NMIS.load_schema = function(data_src) {
      var deferred, schema_url;
      schema_url = "" + data_src + "schema.json";
      deferred = new $.Deferred;
      $.getJSON("" + data_src + "schema.json", function(schema) {
        var districts_module, dname, durl, _ref;
        display_in_header(schema);
        _ref = schema.defaults;
        for (dname in _ref) {
          durl = _ref[dname];
          NMIS.ModuleFile.DEFAULT_MODULES[dname] = new NMIS.ModuleFile(durl);
        }
        if (schema.districts_json != null) {
          districts_module = new NMIS.ModuleFile(schema.districts_json);
          return districts_module.fetch().done(function(dl) {
            NMIS.load_districts(dl.groups, dl.districts);
            return deferred.resolve();
          });
        } else if ((schema.districts != null) && (schema.groups != null)) {
          NMIS.load_districts(schema.groups, schema.districts);
          return deferred.resolve();
        } else {
          return deferred.fail();
        }
      });
      return deferred;
    };
  })();

  (function() {
    return NMIS.load_districts = function(group_list, district_list) {
      var already_selected, d, district, districts, get_group_by_id, group, group_names, groups, grp_details, new_select, optgroup, select_district, submit_button, _i, _j, _k, _len, _len1, _len2, _ref;
      group_names = [];
      groups = [];
      districts = [];
      get_group_by_id = function(grp_id) {
        var grp, grp_found, _i, _len;
        grp_found = false;
        for (_i = 0, _len = groups.length; _i < _len; _i++) {
          grp = groups[_i];
          if (grp.id === grp_id) {
            grp_found = grp;
          }
        }
        return grp_found;
      };
      groups = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = group_list.length; _i < _len; _i++) {
          grp_details = group_list[_i];
          _results.push(new NMIS.Group(grp_details));
        }
        return _results;
      })();
      for (_i = 0, _len = district_list.length; _i < _len; _i++) {
        district = district_list[_i];
        d = new NMIS.District(district);
        d.set_group(get_group_by_id(d.group));
        districts.push(d);
      }
      new_select = $('<select>', {
        id: 'lga-select',
        title: 'Select a district'
      });
      for (_j = 0, _len1 = groups.length; _j < _len1; _j++) {
        group = groups[_j];
        optgroup = $('<optgroup>', {
          label: group.name
        });
        _ref = group.districts;
        for (_k = 0, _len2 = _ref.length; _k < _len2; _k++) {
          d = _ref[_k];
          $('<option>', d.html_params).appendTo(optgroup);
        }
        optgroup.appendTo(new_select);
      }
      /*
          We will want to hang on to these districts for later, and give them
          a nice name when we find a good home for them.
      */

      NMIS._districts_ = districts;
      NMIS._groups_ = groups;
      select_district = function(district_id) {
        /*
              this is called on form submit, for example
        */

        var existing, _l, _len3;
        existing = false;
        for (_l = 0, _len3 = districts.length; _l < _len3; _l++) {
          d = districts[_l];
          if (d.id === district_id) {
            existing = d;
          }
        }
        $.cookie("selected-district", existing ? district_id : false);
        if (existing == null) {
          return NMIS._lgaFacilitiesDataUrl_ = "" + existing.data_root + "/facilities.json";
        }
      };
      already_selected = $.cookie("selected-district");
      if (already_selected != null) {
        new_select.val(already_selected);
        select_district(already_selected);
      }
      submit_button = headers('nav').find("input[type='submit']").detach();
      headers('nav').find('form div').eq(0).empty().html(new_select).append(submit_button);
      return new_select.chosen();
    };
  })();

  NMIS.District = (function() {

    function District(d) {
      var f, _ref;
      _.extend(this, d);
      _ref = d.url_code.split("/"), this.group_slug = _ref[0], this.slug = _ref[1];
      if (this.data_modules == null) {
        this.data_modules = [];
      }
      this.module_files = (function() {
        var _i, _len, _ref1, _results;
        _ref1 = this.data_modules;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          f = _ref1[_i];
          _results.push(new NMIS.ModuleFile(f, this));
        }
        return _results;
      }).call(this);
      this.latLng = this.lat_lng;
      this.html_params = {
        text: this.label,
        value: this.id
      };
    }

    District.prototype.module_url = function(module_name) {
      return this.get_data_module(module_name).url;
    };

    District.prototype.sectors_data_loader = function() {
      var fetcher;
      fetcher = this.get_data_module("sectors").fetch();
      fetcher.done(function(s) {
        return NMIS.loadSectors(s.sectors, {
          "default": {
            name: "Overview",
            slug: "overview"
          }
        });
      });
      return fetcher;
    };

    District.prototype.get_data_module = function(module) {
      var m, match, _i, _len, _ref;
      _ref = this.module_files;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        m = _ref[_i];
        if (m.name === module) {
          match = m;
        }
      }
      if (match == null) {
        match = NMIS.ModuleFile.DEFAULT_MODULES[module];
      }
      if (match == null) {
        throw new Error("Module not found: " + module);
      }
      return match;
    };

    District.prototype.has_data_module = function(module) {
      try {
        return !!this.get_data_module(module);
      } catch (e) {
        return false;
      }
    };

    District.prototype.set_group = function(group) {
      this.group = group;
      return this.group.add_district(this);
    };

    return District;

  })();

  NMIS.getDistrictByUrlCode = function(url_code) {
    var d, matching_district, _i, _len, _ref;
    matching_district = false;
    _ref = NMIS._districts_;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      d = _ref[_i];
      if (d.url_code === url_code) {
        matching_district = d;
      }
    }
    if (!matching_district) {
      throw new Error("District: " + url_code + " not found");
    }
    return matching_district;
  };

  NMIS.Group = (function() {

    function Group(details) {
      this.districts = [];
      this.label = details.label;
      this.id = details.id;
      this.label = this.name;
    }

    Group.prototype.add_district = function(d) {
      this.districts.push(d);
      if (this.slug == null) {
        this.slug = d.group_slug;
      }
      this.districts = this.districts.sort(function(a, b) {
        if (b != null) {
          return a.label > b.label;
        }
      });
      return true;
    };

    return Group;

  })();

  NMIS.ModuleFile = (function() {

    function ModuleFile(filename, district) {
      var devnull, mid_url, _ref;
      this.filename = filename;
      try {
        _ref = this.filename.match(/(.*)\.(json|csv)/), devnull = _ref[0], this.name = _ref[1], this.file_type = _ref[2];
      } catch (e) {
        throw new Error("Filetype not recognized: " + this.filename);
      }
      if (NMIS._data_src_root_url == null) {
        throw new Error("No data_src_root_url");
      }
      mid_url = district != null ? "" + district.data_root + "/" : "";
      this.url = "" + NMIS._data_src_root_url + mid_url + this.filename;
    }

    ModuleFile.prototype.fetch = function() {
      return NMIS.DataLoader.fetch(this.url);
    };

    return ModuleFile;

  })();

  NMIS.ModuleFile.DEFAULT_MODULES = {};

}).call(this);
