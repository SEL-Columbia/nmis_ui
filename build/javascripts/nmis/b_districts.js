(function() {
  var Module, ModuleFile, NoOpFetch, headers, _sanitizeStr;

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
          return nav = $('.lga-nav').on('submit', 'form', function(evt) {
            var d;
            d = NMIS.findDistrictById(nav.find('select').val());
            dashboard.setLocation(NMIS.urlFor.extendEnv({
              state: d.group,
              lga: d
            }));
            evt.preventDefault();
            return false;
          });
        } else {
          return nav;
        }
      }
    };
  })();

  (function() {
    var display_in_header, load_districts;
    display_in_header = function(s) {
      var brand, logo, title;
      title = s.title;
      $('title').html(title);
      brand = $('.brand');
      logo = brand.find('.logo').detach();
      brand.empty().append(logo).append(title);
      return headers('header').find("span").text(s.id);
    };
    /* NMIS.load_districts should be moved here.
    */

    load_districts = function(group_list, district_list) {
      var d, district, districts, g, get_group_by_id, group, group_names, groups, groupsObj, grp_details, new_select, optgroup, states, submit_button, zones, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref;
      group_names = [];
      groups = [];
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
      districts = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = district_list.length; _i < _len; _i++) {
          district = district_list[_i];
          d = new NMIS.District(district);
          d.set_group(get_group_by_id(d.group));
          _results.push(d);
        }
        return _results;
      })();
      groupsObj = {};
      for (_i = 0, _len = groups.length; _i < _len; _i++) {
        g = groups[_i];
        groupsObj[g.id] = g;
      }
      for (_j = 0, _len1 = groups.length; _j < _len1; _j++) {
        group = groups[_j];
        group.assignParentGroup(groupsObj);
      }
      for (_k = 0, _len2 = groups.length; _k < _len2; _k++) {
        group = groups[_k];
        group.assignLevel();
      }
      zones = [];
      states = [];
      for (_l = 0, _len3 = groups.length; _l < _len3; _l++) {
        g = groups[_l];
        if (g.group === void 0) {
          zones.push(g);
        } else {
          states.push(g);
        }
      }
      NMIS._zones_ = zones.sort(function(a, b) {
        if (b != null) {
          return a.label > b.label;
        }
      });
      NMIS._states_ = states.sort(function(a, b) {
        if (b != null) {
          return a.label > b.label;
        }
      });
      new_select = $('<select>', {
        id: 'lga-select',
        title: 'Select a district'
      });
      for (_m = 0, _len4 = groups.length; _m < _len4; _m++) {
        group = groups[_m];
        optgroup = $('<optgroup>', {
          label: group.label
        });
        _ref = group.districts;
        for (_n = 0, _len5 = _ref.length; _n < _len5; _n++) {
          d = _ref[_n];
          optgroup.append($('<option>', d.html_params));
        }
        new_select.append(optgroup);
      }
      /*
          We will want to hang on to these districts for later, and give them
          a nice name when we find a good home for them.
      */

      NMIS._districts_ = districts;
      NMIS._groups_ = groups;
      submit_button = headers('nav').find("input[type='submit']").detach();
      headers('nav').find('form div').eq(0).empty().html(new_select).append(submit_button);
      return new_select.chosen();
    };
    return NMIS.load_schema = function(data_src) {
      var deferred, getSchema, schema_url;
      schema_url = "" + data_src + "schema.json";
      deferred = new $.Deferred;
      $("a.brand").attr("href", NMIS.url_root);
      getSchema = $.ajax({
        url: schema_url,
        dataType: "json",
        cache: false
      });
      getSchema.done(function(schema) {
        var districts_module, dname, durl;
        display_in_header(schema);
        Module.DEFAULT_MODULES = (function() {
          var _ref, _results;
          _ref = schema.defaults;
          _results = [];
          for (dname in _ref) {
            durl = _ref[dname];
            _results.push(new Module(dname, durl));
          }
          return _results;
        })();
        if ((schema.districts != null) && (schema.groups != null)) {
          load_districts(schema.groups, schema.districts);
          return deferred.resolve();
        } else {
          districts_module = (function() {
            var mf, _i, _len, _ref;
            _ref = Module.DEFAULT_MODULES;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              mf = _ref[_i];
              if (mf.name === "geo/districts") {
                return mf;
              }
            }
          })();
          return districts_module.fetch().done(function(_arg) {
            var districts, groups;
            groups = _arg.groups, districts = _arg.districts;
            load_districts(groups, districts);
            return deferred.resolve();
          });
        }
      });
      getSchema.fail(function(e) {
        return deferred.reject("Schema file not loaded");
      });
      return deferred.promise();
    };
  })();

  (function() {
    return NMIS.findDistrictById = function(district_id) {
      var d, existing, _i, _len, _ref;
      if (district_id == null) {
        district_id = false;
      }
      /*
          this is called on form submit, for example
      */

      existing = false;
      if (district_id) {
        _ref = NMIS._districts_;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          d = _ref[_i];
          if (d.id === district_id) {
            existing = d;
          }
        }
      }
      return existing;
    };
  })();

  NMIS.DataRecord = (function() {

    function DataRecord(lga, obj) {
      this.lga = lga;
      this.value = obj.value;
      this.source = obj.source;
      this.id = obj.id;
    }

    return DataRecord;

  })();

  NoOpFetch = (function() {

    function NoOpFetch(id) {
      this.id = id;
    }

    NoOpFetch.prototype.fetch = function() {
      var cb, dfd,
        _this = this;
      dfd = new $.Deferred();
      cb = function() {
        var msg;
        msg = "" + this.id + " messed up.";
        return dfd.reject(msg);
      };
      window.setTimeout(cb, 500);
      dfd.fail(function() {
        return console.error("failure: " + _this.id);
      });
      return dfd.promise();
    };

    return NoOpFetch;

  })();

  NMIS.District = (function() {

    function District(d) {
      var f_param, slug, _ref;
      _.extend(this, d);
      if (!this.name) {
        this.name = this.label;
      }
      _ref = d.url_code.split("/"), this.group_slug = _ref[0], this.slug = _ref[1];
      if (this.files == null) {
        this.files = [];
      }
      this.module_files = (function() {
        var _ref1, _results;
        _ref1 = this.files;
        _results = [];
        for (slug in _ref1) {
          f_param = _ref1[slug];
          _results.push(new Module(slug, f_param, this));
        }
        return _results;
      }).call(this);
      this.latLng = this.lat_lng;
      this.id = [this.group_slug, this.local_id].join("_");
      this.html_params = {
        text: this.name,
        value: this.id
      };
    }

    District.prototype.defaultSammyUrl = function() {
      return "" + NMIS.url_root + "#/" + this.group_slug + "/" + this.slug + "/summary";
    };

    District.prototype.sectors_data_loader = function() {
      var fetcher, _fetcher;
      _fetcher = this.get_data_module("presentation/sectors");
      fetcher = _fetcher.fetch();
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
      var mf, _i, _j, _len, _len1, _ref, _ref1;
      _ref = this.module_files;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        mf = _ref[_i];
        if (mf.name === module) {
          return mf;
        }
      }
      _ref1 = Module.DEFAULT_MODULES;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        mf = _ref1[_j];
        if (mf.name === module) {
          return mf;
        }
      }
      throw new Error("Module not found: " + module);
    };

    District.prototype.has_data_module = function(module) {
      try {
        return !!this.get_data_module(module);
      } catch (e) {
        return false;
      }
    };

    District.prototype.loadData = function() {
      var dfd, loader,
        _this = this;
      dfd = $.Deferred();
      loader = this.get_data_module("data/lga_data").fetch();
      loader.done(function(results) {
        var d;
        _this.lga_data = (function() {
          var _i, _len, _ref, _results;
          _ref = results.data;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            d = _ref[_i];
            _results.push(new NMIS.DataRecord(this, d));
          }
          return _results;
        }).call(_this);
        return dfd.resolve(_this.lga_data);
      });
      return dfd.promise();
    };

    District.prototype.loadVariables = function() {
      var dfd,
        _this = this;
      dfd = $.Deferred();
      this.get_data_module("variables/variables").fetch().done(function(results) {
        NMIS.variables.clear();
        NMIS.variables.load(results);
        return dfd.resolve(NMIS.variables);
      });
      return dfd.promise();
    };

    District.prototype.lookupRecord = function(id) {
      var datum, matches, _i, _len, _ref;
      matches = [];
      _ref = this.lga_data;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        datum = _ref[_i];
        if (datum.id === id) {
          matches.push(datum);
        }
      }
      return matches[0];
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
      this.groupId = details.group;
      this.children = [];
    }

    Group.prototype.add_district = function(d) {
      this.districts.push(d);
      this.children.push(d);
      if (this.slug == null) {
        this.slug = d.group_slug;
      }
      this.districts = this.districts.sort(function(a, b) {
        if (b != null) {
          return a.label > b.label;
        }
      });
      this.children = this.children.sort(function(a, b) {
        if (b != null) {
          return a.label > b.label;
        }
      });
      return true;
    };

    Group.prototype.assignParentGroup = function(allGroups) {
      if (this.groupId && allGroups[this.groupId]) {
        this.group = allGroups[this.groupId];
        return this.group.children.push(this);
      }
    };

    Group.prototype.assignLevel = function() {
      return this._level = this.ancestors().length - 1;
    };

    Group.prototype.ancestors = function() {
      var g, ps;
      ps = [];
      g = this;
      while (g !== void 0) {
        ps.push(g);
        g = g.group;
      }
      return ps;
    };

    return Group;

  })();

  _sanitizeStr = function(str) {
    return ("" + str).toLowerCase().replace(/\W/, "_").replace(/__/g, "_");
  };

  Module = (function() {

    Module.DEFAULT_MODULES = [];

    function Module(id, file_param, district) {
      var fp;
      this.id = id;
      if (_.isArray(file_param)) {
        this.files = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = file_param.length; _i < _len; _i++) {
            fp = file_param[_i];
            _results.push(new ModuleFile(fp, district));
          }
          return _results;
        })();
      } else {
        this.filename = file_param;
        this.files = [new ModuleFile(file_param, district)];
      }
      this.name = this.id;
    }

    Module.prototype.sanitizedId = function() {
      if (!this._sanitizedId) {
        this._sanitizedId = _sanitizeStr(this.name);
      }
      return this._sanitizedId;
    };

    Module.prototype.fetch = function() {
      var f;
      return $.when.apply(null, (function() {
        var _i, _len, _ref, _results;
        _ref = this.files;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          f = _ref[_i];
          _results.push(f.fetch());
        }
        return _results;
      }).call(this));
    };

    return Module;

  })();

  ModuleFile = (function() {

    function ModuleFile(filename, district) {
      var devnull, mid_url, _ref;
      this.filename = filename;
      this.district = district;
      try {
        _ref = this.filename.match(/(.*)\.(json|csv)/), devnull = _ref[0], this.name = _ref[1], this.file_type = _ref[2];
      } catch (e) {
        throw new Error("ModuleFile Filetype not recognized: " + this.filename);
      }
      mid_url = this.district != null ? "" + this.district.data_root + "/" : "";
      this.url = "" + NMIS._data_src_root_url + mid_url + this.filename;
    }

    ModuleFile.prototype.fetch = function() {
      return NMIS.DataLoader.fetch(this.url);
    };

    return ModuleFile;

  })();

}).call(this);
