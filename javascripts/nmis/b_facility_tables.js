(function() {

  (function() {
    return NMIS.SectorDataTable = (function() {
      /*
          This creates the facilities data table.
      
          (seen at #/state/district/facilites/health)
          [wrapper element className: ".facility-table-wrap"]
      */

      var createIn, dataTableDraw, dt, getSelect, handleHeadRowClick, nullMarker, resizeColumns, setDtMaxHeight, table, tableSwitcher, _createTbody, _createThead;
      dt = void 0;
      table = void 0;
      tableSwitcher = void 0;
      createIn = function(district, tableWrap, env, _opts) {
        var columns, data, dataTableDraw, opts;
        opts = _.extend({
          sScrollY: 120
        }, _opts);
        data = district.facilityDataForSector(env.sector.slug);
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
          return dashboard.setLocation(NMIS.urlFor.extendEnv({
            facility: $(this).data("rowData")
          }));
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
        var column, env, ind, newUrl;
        column = $(this).data("column");
        ind = NMIS.Env().sector.getIndicator(column.slug);
        if (ind && ind.clickable) {
          env = NMIS.Env.extend({
            indicator: ind.slug
          });
          if (!env.subsector) {
            env.subsector = env.sector.subGroups()[0];
          }
          newUrl = NMIS.urlFor(env);
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
          if (r.id === undefined) {
            console.error("Facility does not have an ID defined:", r);
          } else {
            row.data("row-data", r.id);
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

}).call(this);
