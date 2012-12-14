(function() {
  var data_src, default_data_source_url, overviewObj, url_root, wElems;

  url_root = "" + window.location.pathname;

  if (!!~url_root.indexOf("index.html")) {
    url_root = url_root.replace("index.html", "");
  }

  NMIS.url_root = url_root;

  /*
  
  initializing a Sammy.js object, called "dashboard".
  This will route URLs and handle links to pre-routed URLs.
  
  routes are defined in nmis_facilities.js and nmis_summary.js by:
     dashboard.get("/url/:variable", callback);
  
  URL actions can be triggered by calling:
     dashboard.setLocation("/url/hello");
  */


  this.dashboard = $.sammy("body", function() {
    return this.get("" + NMIS.url_root + "#/:state/:lga/?", function() {
      return dashboard.setLocation("" + url_root + "#/" + this.params.state + "/" + this.params.lga + "/summary/");
    });
  });

  NMIS.DisplayWindow.init(".content", {
    offsetElems: ".topbar .fill .container",
    sizeCookie: true,
    callbacks: {
      resize: [
        function(animate, sizeName) {
          switch (sizeName) {
            case "full":
              return NMIS.DisplayWindow.showTitle("tables");
            case "middle":
              return NMIS.DisplayWindow.showTitle("bar");
            case "minimized":
              return NMIS.DisplayWindow.showTitle("bar");
          }
        }
      ]
    }
  });

  overviewObj = {
    name: "Overview",
    slug: "overview"
  };

  NMIS.init();

  wElems = NMIS.DisplayWindow.getElems();

  NMIS._wElems = wElems;

  NMIS.LocalNav.init(wElems.wrap, {
    sections: [[["mode:summary", "LGA Summary", "#"], ["mode:facilities", "Facility Detail", "#"]], [["sector:overview", "Overview", "#"], ["sector:health", "Health", "#"], ["sector:education", "Education", "#"], ["sector:water", "Water", "#"]]]
  });

  NMIS.urlFor = function(o) {
    var uu, _pushAsDefined;
    if (o.root == null) {
      o.root = "" + NMIS.url_root + "#";
    }
    if (o.mode == null) {
      o.mode = "summary";
    }
    if (!o.lga || !o.state) {
      return "" + NMIS.url_root + "#?error";
    }
    uu = (_pushAsDefined = function(obj, keyList) {
      var arr, i, item, key, l;
      key = void 0;
      i = void 0;
      l = void 0;
      arr = [];
      item = void 0;
      i = 0;
      l = keyList.length;
      while (i < l) {
        key = keyList[i];
        item = obj[key];
        if (!!item) {
          if (item === false) {
            return ["/error"];
          }
          arr.push((item.slug === undefined ? item : item.slug));
        } else {
          return arr;
        }
        i++;
      }
      return arr;
    })(o, ["root", "state", "lga", "mode", "sector", "subsector", "indicator"]).join("/");
    if (!!o.facilityId) {
      uu += "?facility=" + o.facilityId;
    }
    return uu;
  };

  NMIS._prepBreadcrumbValues = function(e, keys, env) {
    var arr, i, key, l, name, val;
    arr = [];
    i = 0;
    l = keys.length;
    while (i < l) {
      key = keys[i];
      val = e[key];
      if (val !== undefined) {
        name = val.name || val.slug || val;
        env[key] = val;
        arr.push([name, NMIS.urlFor(env)]);
      } else {
        return arr;
      }
      i++;
    }
    return arr;
  };

  NMIS.Breadcrumb.init("p.bc", {
    levels: []
  });

  dashboard.get("" + NMIS.url_root + "#/:state/:lga/facilities/?(#.*)?", NMIS.launch_facilities);

  dashboard.get("" + NMIS.url_root + "#/:state/:lga/facilities/:sector/?(#.*)?", NMIS.launch_facilities);

  dashboard.get("" + NMIS.url_root + "#/:state/:lga/facilities/:sector/:subsector/?(#.*)?", NMIS.launch_facilities);

  dashboard.get("" + NMIS.url_root + "#/:state/:lga/facilities/:sector/:subsector/:indicator/?(#.*)?", NMIS.launch_facilities);

  dashboard.get("" + NMIS.url_root + "#/:state/:lga/summary/?(#.*)?", NMIS.loadSummary);

  dashboard.get("" + NMIS.url_root + "#/:state/:lga/summary/:sector/?(#.*)?", NMIS.loadSummary);

  dashboard.get("" + NMIS.url_root + "#/:state/:lga/summary/:sector/:subsector/?(#.*)?", NMIS.loadSummary);

  dashboard.get("" + NMIS.url_root + "#/:state/:lga/summary/:sector/:subsector/:indicator/?(#.*)?", NMIS.loadSummary);

  data_src = $.cookie("data-source");

  default_data_source_url = "./path_to_generic_data_source/";

  if (data_src == null) {
    data_src = default_data_source_url;
  }

  NMIS._data_src_root_url = data_src;

  this.dashboard.get("" + NMIS.url_root + "#data=(.*)", function() {
    data_src = this.params.splat[0];
    $.cookie("data-source", data_src);
    return this.redirect("" + NMIS.url_root);
  });

  $(function() {
    return NMIS.load_schema(data_src).done(function() {
      return dashboard.run();
    });
  });

}).call(this);
