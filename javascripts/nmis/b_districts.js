(function() {
  var Module, ModuleFile, NoOpFetch, headers,
    __hasProp = {}.hasOwnProperty,
    __slice = [].slice;

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
    var display_in_header, district_select, load_districts;
    display_in_header = function(s) {
      var brand, logo, title;
      title = s.title;
      $('title').html(title);
      brand = $('.brand');
      logo = brand.find('.logo').detach();
      brand.empty().append(logo).append(title);
      return headers('header').find("span").text(s.id);
    };
    district_select = false;
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
      return district_select = new_select.chosen();
    };
    NMIS.districtDropdownSelect = function(district) {
      if (district == null) {
        district = false;
      }
      if (district && district_select) {
        return district_select.val(district.id).trigger("liszt:updated");
      }
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
        if (schema.map_layers) {
          NMIS._mapLayersModule_ = new Module("Map Layers", schema.map_layers);
        }
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

    DataRecord.prototype.displayValue = function() {
      var value, variable;
      variable = this.variable();
      if (variable.data_type === "percent") {
        value = NMIS.DisplayValue.raw(this.value * 100, variable)[0];
        return "" + value + "%";
      } else {
        value = NMIS.DisplayValue.raw(this.value)[0];
        return value;
      }
    };

    DataRecord.prototype.variable = function() {
      return this.lga.variableSet.find(this.id);
    };

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
      this.active = !!d.active;
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
      this._fetchesInProgress = {};
      this.latLng = this.lat_lng;
      this.sector_gap_sheets = d.sector_gap_sheets || {};
      this.id = [this.group_slug, this.local_id].join("_");
      this.html_params = {
        text: this.name,
        value: this.id
      };
      if (!this.active) {
        this.html_params.disabled = "disabled";
      }
    }

    District.prototype.llArr = function() {
      var coord, _i, _len, _ref, _results;
      _ref = this.latLng.split(",");
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        coord = _ref[_i];
        _results.push(+coord);
      }
      return _results;
    };

    District.prototype.latLngBounds = function() {
      var lat, lng, smallLat, smallLng, _ref;
      if (!this._latLngBounds && this.bounds) {
        this._latLngBounds = this.bounds.split(/\s|,/);
      } else if (!this._latLngBounds) {
        log("Approximating district lat-lng bounds. You can set district's bounding box in districts.json by\nsetting the value of \"bounds\" to comma separated coordinates.\nFormat: \"SW-lat,SW-lng,NE-lat,NE-lng\"\nExample: \"6.645,7.612,6.84,7.762\"");
        smallLat = 0.075;
        smallLng = 0.1;
        _ref = this.llArr(), lat = _ref[0], lng = _ref[1];
        this._latLngBounds = [lat - smallLat, lng - smallLng, lat + smallLat, lng + smallLng];
      }
      return this._latLngBounds;
    };

    District.prototype.defaultSammyUrl = function() {
      return "" + NMIS.url_root + "#/" + this.group_slug + "/" + this.slug + "/summary";
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

    District.prototype._fetchModuleOnce = function(resultAttribute, moduleId, cb) {
      var dfd,
        _this = this;
      if (cb == null) {
        cb = false;
      }
      if (this[resultAttribute]) {
        return $.Deferred().resolve().promise();
      } else if (this._fetchesInProgress[resultAttribute]) {
        return this._fetchesInProgress[resultAttribute];
      } else {
        dfd = $.Deferred();
        this.get_data_module(moduleId).fetch().done(function(results) {
          _this[resultAttribute] = cb ? cb(results) : results;
          return dfd.resolve();
        });
        return this._fetchesInProgress[resultAttribute] = dfd.promise();
      }
    };

    District.prototype.sectors_data_loader = function() {
      var _this = this;
      return this._fetchModuleOnce("__sectors_TODO", "presentation/sectors", function(results) {
        return NMIS.loadSectors(results.sectors, {
          "default": {
            name: "overview",
            slug: "overview"
          }
        });
      });
    };

    District.prototype.loadFacilitiesData = function() {
      var _this = this;
      return this._fetchModuleOnce("facilityData", "data/facilities", function(results) {
        var clonedFacilitiesById, datum, fac, facKey, key, parsedMatch, val;
        NMIS.loadFacilities(results);
        clonedFacilitiesById = {};
        for (facKey in results) {
          if (!__hasProp.call(results, facKey)) continue;
          fac = results[facKey];
          datum = {};
          for (key in fac) {
            if (!__hasProp.call(fac, key)) continue;
            val = fac[key];
            if (key === "gps") {
              datum._ll = (function() {
                var ll;
                if (val && (ll = typeof val.split === "function" ? val.split(" ") : void 0)) {
                  return [ll[0], ll[1]];
                }
              })();
            } else if (key === "sector") {
              datum.sector = NMIS.Sectors.pluck(val.toLowerCase());
            } else {
              if (_.isString(val)) {
                if (val.match(/^true$/i)) {
                  val = true;
                } else if (val.match(/^false$/i)) {
                  val = false;
                } else if (val === "" || val.match(/^na$/i)) {
                  val = undefined;
                } else {
                  if (!val.match(/[a-zA-Z]/) && !isNaN((parsedMatch = parseFloat(val)))) {
                    val = parsedMatch;
                  }
                }
              }
              datum[key] = val;
            }
          }
          if (!datum.id) {
            datum.id = fac._id || fac.X_id || facKey;
          }
          clonedFacilitiesById[datum.id] = datum;
        }
        return clonedFacilitiesById;
      });
    };

    District.prototype.facilityDataForSector = function(sectorSlug) {
      var fac, facId, _ref, _results;
      _ref = this.facilityData;
      _results = [];
      for (facId in _ref) {
        if (!__hasProp.call(_ref, facId)) continue;
        fac = _ref[facId];
        if (fac.sector.slug === sectorSlug) {
          _results.push(fac);
        }
      }
      return _results;
    };

    District.prototype.loadData = function() {
      var _this = this;
      return this._fetchModuleOnce("lga_data", "data/lga_data", function(results) {
        var arr, d, key, val, _i, _len, _ref, _results;
        arr = [];
        if (results.data) {
          arr = results.data;
        } else if (results.length === 1) {
          _ref = results[0];
          for (key in _ref) {
            if (!__hasProp.call(_ref, key)) continue;
            val = _ref[key];
            arr.push({
              id: key,
              value: val
            });
          }
        } else {
          arr = results;
        }
        _results = [];
        for (_i = 0, _len = arr.length; _i < _len; _i++) {
          d = arr[_i];
          _results.push(new NMIS.DataRecord(_this, d));
        }
        return _results;
      });
    };

    District.prototype.loadVariables = function() {
      var _this = this;
      return this._fetchModuleOnce("variableSet", "variables/variables", function(results) {
        return new NMIS.VariableSet(results);
      });
    };

    District.prototype.loadFacilitiesPresentation = function() {
      return this._fetchModuleOnce("facilitiesPresentation", "presentation/facilities");
    };

    District.prototype.loadSummarySectors = function() {
      return this._fetchModuleOnce("ssData", "presentation/summary_sectors");
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
      this.name = this.label = details.label;
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

    Group.prototype.activeDistrictsCount = function() {
      var district, i, _i, _len, _ref;
      i = 0;
      _ref = this.districts;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        district = _ref[_i];
        if (district.active) {
          i++;
        }
      }
      return i;
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

    Module.prototype.fetch = function() {
      var dfd, f;
      if (this.files.length > 1) {
        dfd = $.Deferred();
        $.when.apply(null, (function() {
          var _i, _len, _ref, _results;
          _ref = this.files;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            f = _ref[_i];
            _results.push(f.fetch());
          }
          return _results;
        }).call(this)).done(function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return dfd.resolve(Array.prototype.concat.apply([], args));
        });
        return dfd.promise();
      } else if (this.files.length === 1) {
        return this.files[0].fetch();
      }
    };

    return Module;

  })();

  csv.settings.parseFloat = false;

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
      if (this.filename.match(/^https?:/)) {
        this.url = this.filename;
      } else {
        this.url = "" + NMIS._data_src_root_url + mid_url + this.filename;
      }
    }

    ModuleFile.prototype.fetch = function() {
      var dfd;
      if (/\.csv$/.test(this.url)) {
        dfd = $.Deferred();
        $.ajax({
          url: this.url
        }).done(function(results) {
          return dfd.resolve(csv(results).toObjects());
        });
        return dfd;
      } else if (/\.json$/.test(this.url)) {
        return NMIS.DataLoader.fetch(this.url);
      } else {
        throw new Error("Unknown action");
      }
    };

    return ModuleFile;

  })();

}).call(this);
