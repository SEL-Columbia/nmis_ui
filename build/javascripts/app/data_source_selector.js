(function() {
  var DEFAULT_MODULES, District, Group, ModuleFile, clear_data_source, data_src, default_data_source, display_in_header, header, load_districts, load_sectors, nav, select_data_source, select_district, set_default_data_source,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  header = $('.data-src');

  nav = $('.lga-nav');

  if (header.get(0) == null) {
    throw new Error("Cannot initialize data-source-selector");
  }

  default_data_source = {
    name: "Sample data",
    url: "./sample_data"
  };

  header.on('click', 'a', function(evt) {
    return false;
  });

  select_data_source = function() {};

  set_default_data_source = function() {
    return header.find("span").text(default_data_source.name);
  };

  display_in_header = function(s) {
    var brand, logo, title;
    title = s.title;
    $('title').html(title);
    brand = $('.brand');
    logo = brand.find('.logo').detach();
    brand.empty().append(logo).append(title);
    return header.find("span").text(s.id);
  };

  clear_data_source = function() {
    return header.find("span").html("&hellip;");
  };

  data_src = $.cookie("data-source");

  if (data_src == null) {
    data_src = default_data_source.url;
  }

  NMIS._data_src_root_url = data_src;

  DEFAULT_MODULES = {};

  $(function() {
    return $.getJSON("" + data_src + "schema.json", function(schema) {
      var dname, durl, _ref;
      display_in_header(schema);
      load_districts(schema.districts);
      _ref = schema.defaults;
      for (dname in _ref) {
        durl = _ref[dname];
        DEFAULT_MODULES[dname] = new ModuleFile(durl);
      }
      /*
          This launches the application:
      */

      return dashboard.run();
    });
  });

  ModuleFile = (function() {

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

  District = (function() {

    function District(d) {
      var f, _ref;
      _.extend(this, d);
      _ref = d.url_code.split("/"), this.group_slug = _ref[0], this.slug = _ref[1];
      this.module_files = (function() {
        var _i, _len, _ref1, _results;
        _ref1 = this.data_modules;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          f = _ref1[_i];
          _results.push(new ModuleFile(f, this));
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
        match = DEFAULT_MODULES[module];
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

  Group = (function() {

    function Group(name) {
      this.name = name;
      this.districts = [];
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

  select_district = function() {};

  nav.on('submit', 'form', function(evt) {
    select_district(nav.find('select').val());
    return false;
  });

  load_districts = function(district_list) {
    var already_selected, d, district, districts, get_or_create_group, group, group_names, groups, new_select, optgroup, submit_button, _i, _j, _k, _len, _len1, _len2, _ref;
    group_names = [];
    groups = [];
    districts = [];
    get_or_create_group = function(name) {
      var g, group, _i, _len;
      if (__indexOf.call(group_names, name) < 0) {
        g = new Group(name);
        groups.push(g);
      } else {
        for (_i = 0, _len = groups.length; _i < _len; _i++) {
          group = groups[_i];
          if (group.name === name) {
            g = group;
          }
        }
      }
      return g;
    };
    for (_i = 0, _len = district_list.length; _i < _len; _i++) {
      district = district_list[_i];
      d = new District(district);
      d.set_group(get_or_create_group(d.group));
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
    submit_button = nav.find("input[type='submit']").detach();
    nav.find('form div').eq(0).empty().html(new_select).append(submit_button);
    return new_select.chosen();
  };

  load_sectors = function(url) {
    var q;
    q = NMIS.DataLoader.fetch(url);
    q.done(function(s) {
      return NMIS.loadSectors(s.sectors, {
        "default": {
          name: "Overview",
          slug: "overview"
        }
      });
    });
    return q;
  };

  NMIS.getDistrictByUrlCode = function(url_code) {
    var district, matching_district, _i, _len, _ref;
    matching_district = false;
    _ref = NMIS._districts_;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      district = _ref[_i];
      if (district.url_code === url_code) {
        matching_district = district;
      }
    }
    if (!matching_district) {
      throw "District: " + url_code + " not found";
    }
    return matching_district;
  };

}).call(this);
