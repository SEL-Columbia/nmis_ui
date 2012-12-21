(function() {

  (function() {
    return NMIS.SectorDataTable = (function() {
      var createIn, dataTableDraw, dt, getSelect, handleHeadRowClick, nullMarker, resizeColumns, setDtMaxHeight, table, tableSwitcher, _createTbody, _createThead;
      dt = void 0;
      table = void 0;
      tableSwitcher = void 0;
      createIn = function(tableWrap, env, _opts) {
        var columns, data, dataTableDraw, opts;
        opts = _.extend({
          sScrollY: 120
        }, _opts);
        data = NMIS.dataForSector(env.sector.slug);
        if (env.subsector === undefined) {
          throw new Error("Subsector is undefined");
        }
        env.subsector = env.sector.getSubsector(env.subsector.slug);
        columns = env.subsector.columns();
        if (tableSwitcher) {
          tableSwitcher.remove();
        }
        tableSwitcher = $("<select />");
        _.each(env.sector.subGroups(), function(sg) {
          return $("<option />").val(sg.slug).text(sg.name).appendTo(tableSwitcher);
        });
        table = $("<table />").addClass("facility-dt").append(_createThead(columns)).append(_createTbody(columns, data));
        tableWrap.append(table);
        dataTableDraw = function(s) {
          dt = table.dataTable({
            sScrollY: s,
            bDestroy: true,
            bScrollCollapse: false,
            bPaginate: false,
            fnDrawCallback: function() {
              var newSelectDiv, ts;
              newSelectDiv = void 0;
              ts = void 0;
              $(".dataTables_info", tableWrap).remove();
              if ($(".dtSelect", tableWrap).get(0) === undefined) {
                ts = getSelect();
                newSelectDiv = $("<div />", {
                  "class": "dataTables_filter dtSelect left"
                }).html($("<p />").text("Grouping:").append(ts));
                $(".dataTables_filter", tableWrap).parents().eq(0).prepend(newSelectDiv);
                ts.val(env.subsector.slug);
                return ts.change(function() {
                  var nextUrl, ssSlug;
                  ssSlug = $(this).val();
                  nextUrl = NMIS.urlFor(_.extend({}, env, {
                    subsector: env.sector.getSubsector(ssSlug)
                  }));
                  return dashboard.setLocation(nextUrl);
                });
              }
            }
          });
          return tableWrap;
        };
        dataTableDraw(opts.sScrollY);
        table.delegate("tr", "click", function() {
          return dashboard.setLocation(NMIS.urlFor(_.extend({}, NMIS.Env(), {
            facility: $(this).data("rowData")
          })));
        });
        return table;
      };
      getSelect = function() {
        return tableSwitcher.clone();
      };
      setDtMaxHeight = function(ss) {
        var h1, h2, tw;
        tw = void 0;
        h1 = void 0;
        h2 = void 0;
        tw = dataTableDraw(ss);
        h1 = $(".dataTables_scrollHead", tw).height();
        h2 = $(".dataTables_filter", tw).height();
        ss = ss - (h1 + h2);
        return dataTableDraw(ss);
      };
      handleHeadRowClick = function() {
        var column, indicatorSlug, newEnv, newUrl;
        column = $(this).data("column");
        indicatorSlug = column.slug;
        if (!!indicatorSlug) {
          newEnv = _.extend({}, NMIS.Env(), {
            indicator: indicatorSlug
          });
          if (!newEnv.subsector) {
            newEnv.subsector = _.first(newEnv.sector.subGroups());
          }
          newUrl = NMIS.urlFor(newEnv);
          return dashboard.setLocation(newUrl);
        }
      };
      _createThead = function(cols) {
        var row, startsWithType;
        row = $("<tr />");
        startsWithType = cols[0].name === "Type";
        _.each(cols, function(col, ii) {
          if (ii === 1 && !startsWithType) {
            $("<th />").text("Type").appendTo(row);
          }
          return row.append($("<th />").text(col.name).data("column", col));
        });
        row.delegate("th", "click", handleHeadRowClick);
        return $("<thead />").html(row);
      };
      nullMarker = function() {
        return $("<span />").html("&mdash;").addClass("null-marker");
      };
      resizeColumns = function() {
        if (!!dt) {
          return dt.fnAdjustColumnSizing();
        }
      };
      _createTbody = function(cols, rows) {
        var tbody;
        tbody = $("<tbody />");
        _.each(rows, function(r) {
          var row, startsWithType;
          row = $("<tr />");
          if (r._id === undefined) {
            console.error("Facility does not have '_id' defined:", r);
          } else {
            row.data("row-data", r._id);
          }
          startsWithType = cols[0].name === "Type";
          _.each(cols, function(c, ii) {
            var ftype, td, z;
            if (ii === 1 && !startsWithType) {
              ftype = r.facility_type || r.education_type || r.water_source_type || "unk";
              $("<td />").attr("title", ftype).addClass("type-icon").html($("<span />").addClass("icon").addClass(ftype).html($("<span />").text(ftype))).appendTo(row);
            }
            z = r[c.slug] || nullMarker();
            td = NMIS.DisplayValue.inTdElem(r, c, $("<td />"));
            return row.append(td);
          });
          return tbody.append(row);
        });
        return tbody;
      };
      dataTableDraw = function() {};
      return {
        createIn: createIn,
        setDtMaxHeight: setDtMaxHeight,
        getSelect: getSelect,
        resizeColumns: resizeColumns
      };
    })();
  })();

  (function() {
    return NMIS.FacilityTables = (function() {
      var classesStr, createForSector, createForSectors, div, hasClickAction, highlightColumn, sectorNav, select, _createHeadRow, _createNavigation, _createRow;
      div = void 0;
      sectorNav = void 0;
      createForSectors = function(sArr, _opts) {
        var opts;
        opts = _.extend({
          callback: function() {},
          sectorCallback: function() {},
          indicatorClickCallback: function() {}
        }, _opts);
        if (div === undefined) {
          div = $("<div />").addClass("facility-display-wrap");
        }
        div.empty();
        _.each(sArr, function(s) {
          return div.append(createForSector(s, opts));
        });
        if (opts.callback) {
          opts.callback.call(this, div);
        }
        return div;
      };
      select = function(sector, subsector) {
        var sectorElem;
        if (sectorNav !== undefined) {
          sectorNav.find("a.active").removeClass("active");
          sectorNav.find(".sub-sector-link-" + subsector.slug).addClass("active");
        }
        div.find("td, th").hide();
        sectorElem = div.find(".facility-display").filter(function() {
          return $(this).data("sector") === sector.slug;
        }).eq(0);
        return sectorElem.find(".subgroup-all, .subgroup-" + subsector.slug).show();
      };
      createForSector = function(s, opts) {
        var cols, dobj, iDiv, orderedFacilities, sector, tbody;
        tbody = $("<tbody />");
        sector = NMIS.Sectors.pluck(s);
        iDiv = $("<div />").addClass("facility-display").data("sector", sector.slug);
        cols = sector.getColumns().sort(function(a, b) {
          return a.display_order - b.display_order;
        });
        orderedFacilities = NMIS.dataForSector(sector.slug);
        dobj = NMIS.dataObjForSector(sector.slug);
        _.each(dobj, function(facility, fid) {
          return _createRow(facility, cols, fid).appendTo(tbody);
        });
        $("<table />").append(_createHeadRow(sector, cols, opts)).append(tbody).appendTo(iDiv);
        opts.sectorCallback.call(this, sector, iDiv, _createNavigation, div);
        return iDiv;
      };
      _createRow = function(facility, cols, facility_id) {
        var tr;
        tr = $("<tr />").data("facility-id", facility_id);
        _.each(cols, function(col, i) {
          var rawval, slug, val;
          slug = col.slug;
          rawval = facility[slug];
          return val = NMIS.DisplayValue(rawval, $("<td />", {
            "class": classesStr(col)
          })).appendTo(tr);
        });
        return tr;
      };
      _createNavigation = function(sector, _hrefCb) {
        var sgl, subgroups;
        sectorNav = $("<p />").addClass("facility-sectors-navigation");
        subgroups = sector.subGroups();
        sgl = subgroups.length;
        _.each(subgroups, function(sg, i) {
          var href;
          href = _hrefCb(sg);
          $("<a />", {
            href: href
          }).text(sg.name).data("subsector", sg.slug).addClass("sub-sector-link").addClass("sub-sector-link-" + sg.slug).appendTo(sectorNav);
          if (i < sgl - 1) {
            return $("<span />").text(" | ").appendTo(sectorNav);
          }
        });
        return sectorNav;
      };
      classesStr = function(col) {
        var clss;
        clss = ["data-cell"];
        _.each(col.subgroups, function(sg) {
          return clss.push("subgroup-" + sg);
        });
        return clss.join(" ");
      };
      hasClickAction = function(col, carr) {
        return !!(!!col.click_actions && col.click_actions.indexOf(col));
      };
      _createHeadRow = function(sector, cols, opts) {
        var tr;
        tr = $("<tr />");
        _.each(cols, function(col, i) {
          var th;
          th = $("<th />", {
            "class": classesStr(col)
          }).data("col", col);
          if (!!col.clickable) {
            th.html($("<a />", {
              href: "#"
            }).text(col.name).data("col", col));
          } else {
            th.text(col.name);
          }
          return th.appendTo(tr);
        });
        tr.delegate("a", "click", function(evt) {
          opts.indicatorClickCallback.call($(this).data("col"));
          return false;
        });
        return $("<thead />").html(tr);
      };
      highlightColumn = function(column, _opts) {
        var ind, table, th;
        div.find(".highlighted").removeClass("highlighted");
        th = div.find("th").filter(function() {
          return $(this).data("col").slug === column.slug;
        }).eq(0);
        table = th.parents("table").eq(0);
        ind = th.index();
        return table.find("tr").each(function() {
          return $(this).children().eq(ind).addClass("highlighted");
        });
      };
      return {
        createForSectors: createForSectors,
        highlightColumn: highlightColumn,
        select: select
      };
    })();
  })();

}).call(this);
