do ->
  NMIS.SectorDataTable = do ->
    dt = undefined
    table = undefined
    tableSwitcher = undefined

    createIn = (tableWrap, env, _opts) ->
      opts = _.extend(
        sScrollY: 120
      , _opts)
      data = NMIS.dataForSector(env.sector.slug)
      throw (new Error("Subsector is undefined"))  if env.subsector is `undefined`
      env.subsector = env.sector.getSubsector(env.subsector.slug)
      columns = env.subsector.columns()
      tableSwitcher.remove()  if tableSwitcher
      tableSwitcher = $("<select />")
      _.each env.sector.subGroups(), (sg) ->
        $("<option />").val(sg.slug).text(sg.name).appendTo tableSwitcher

      table = $("<table />").addClass("facility-dt").append(_createThead(columns)).append(_createTbody(columns, data))
      tableWrap.append table
      dataTableDraw = (s) ->
        dt = table.dataTable(
          sScrollY: s
          bDestroy: true
          bScrollCollapse: false
          bPaginate: false
          fnDrawCallback: ->
            newSelectDiv = undefined
            ts = undefined
            $(".dataTables_info", tableWrap).remove()
            if $(".dtSelect", tableWrap).get(0) is `undefined`
              ts = getSelect()
              newSelectDiv = $("<div />",
                class: "dataTables_filter dtSelect left"
              ).html($("<p />").text("Grouping:").append(ts))
              $(".dataTables_filter", tableWrap).parents().eq(0).prepend newSelectDiv
              ts.val env.subsector.slug
              ts.change ->
                ssSlug = $(this).val()
                nextUrl = NMIS.urlFor(_.extend({}, env,
                  subsector: env.sector.getSubsector(ssSlug)
                ))
                dashboard.setLocation nextUrl

        )
        tableWrap

      dataTableDraw opts.sScrollY
      table.delegate "tr", "click", ->
        dashboard.setLocation NMIS.urlFor(_.extend({}, NMIS.Env(),
          facility: $(this).data("rowData")
        ))

      table

    getSelect = -> tableSwitcher.clone()

    setDtMaxHeight = (ss) ->
      tw = undefined
      h1 = undefined
      h2 = undefined
      tw = dataTableDraw(ss)
    
      # console.group("heights");
      # log("DEST: ", ss);
      h1 = $(".dataTables_scrollHead", tw).height()
    
      # log(".dataTables_scrollHead: ", h);
      h2 = $(".dataTables_filter", tw).height()
    
      # log(".dataTables_filter: ", h2);
      ss = ss - (h1 + h2)
    
      # log("sScrollY: ", ss);
      dataTableDraw ss
  
    # log(".dataTables_wrapper: ", $('.dataTables_wrapper').height());
    # console.groupEnd();
    handleHeadRowClick = ->
      column = $(this).data("column")
      indicatorSlug = column.slug
      unless not indicatorSlug
        newEnv = _.extend({}, NMIS.Env(),
          indicator: indicatorSlug
        )
        newEnv.subsector = _.first(newEnv.sector.subGroups())  unless newEnv.subsector
        newUrl = NMIS.urlFor(newEnv)
        dashboard.setLocation newUrl

    _createThead = (cols) ->
      row = $("<tr />")
      startsWithType = cols[0].name is "Type"
      _.each cols, (col, ii) ->
        $("<th />").text("Type").appendTo row  if ii is 1 and not startsWithType
        row.append $("<th />").text(col.name).data("column", col)

      row.delegate "th", "click", handleHeadRowClick
      $("<thead />").html row

    nullMarker = ->
      $("<span />").html("&mdash;").addClass "null-marker"

    resizeColumns = ->
      dt.fnAdjustColumnSizing()  unless not dt

    _createTbody = (cols, rows) ->
      tbody = $("<tbody />")
      _.each rows, (r) ->
        row = $("<tr />")
        if r._id is `undefined`
          console.error "Facility does not have '_id' defined:", r
        else
          row.data "row-data", r._id
        startsWithType = cols[0].name is "Type"
        _.each cols, (c, ii) ->
        
          # quick fixes in this function scope will need to be redone.
          if ii is 1 and not startsWithType
            ftype = r.facility_type or r.education_type or r.water_source_type or "unk"
            $("<td />").attr("title", ftype).addClass("type-icon").html($("<span />").addClass("icon").addClass(ftype).html($("<span />").text(ftype))).appendTo row
          z = r[c.slug] or nullMarker()
        
          # if(!NMIS.DisplayValue) throw new Error("No DisplayValue")
          td = NMIS.DisplayValue.inTdElem(r, c, $("<td />"))
          row.append td

        tbody.append row

      tbody

    dataTableDraw = ->

    createIn: createIn
    setDtMaxHeight: setDtMaxHeight
    getSelect: getSelect
    resizeColumns: resizeColumns

do ->
  NMIS.FacilityTables = do ->
    div = undefined
    sectorNav = undefined

    createForSectors = (sArr, _opts) ->
      opts = _.extend(
      
        #default options
        callback: ->

        sectorCallback: ->

        indicatorClickCallback: ->
      , _opts)
      div = $("<div />").addClass("facility-display-wrap")  if div is `undefined`
      div.empty()
      _.each sArr, (s) ->
        div.append createForSector(s, opts)

      opts.callback.call this, div  if opts.callback
      div
    select = (sector, subsector) ->
      if sectorNav isnt `undefined`
        sectorNav.find("a.active").removeClass "active"
        sectorNav.find(".sub-sector-link-" + subsector.slug).addClass "active"
      div.find("td, th").hide()
      sectorElem = div.find(".facility-display").filter(->
        $(this).data("sector") is sector.slug
      ).eq(0)
      sectorElem.find(".subgroup-all, .subgroup-" + subsector.slug).show()
    createForSector = (s, opts) ->
      tbody = $("<tbody />")
      sector = NMIS.Sectors.pluck(s)
      iDiv = $("<div />").addClass("facility-display").data("sector", sector.slug)
      cols = sector.getColumns().sort((a, b) ->
        a.display_order - b.display_order
      )
      orderedFacilities = NMIS.dataForSector(sector.slug)
      dobj = NMIS.dataObjForSector(sector.slug)
      _.each dobj, (facility, fid) ->
        _createRow(facility, cols, fid).appendTo tbody

      $("<table />").append(_createHeadRow(sector, cols, opts)).append(tbody).appendTo iDiv
      opts.sectorCallback.call this, sector, iDiv, _createNavigation, div
      iDiv
    _createRow = (facility, cols, facility_id) ->
      tr = $("<tr />").data("facility-id", facility_id)
      _.each cols, (col, i) ->
        slug = col.slug
        rawval = facility[slug]
        val = NMIS.DisplayValue(rawval, $("<td />",
          class: classesStr(col)
        )).appendTo(tr)

      tr
    _createNavigation = (sector, _hrefCb) ->
      sectorNav = $("<p />").addClass("facility-sectors-navigation")
      subgroups = sector.subGroups()
      sgl = subgroups.length
      _.each subgroups, (sg, i) ->
        href = _hrefCb(sg)
        $("<a />",
          href: href
        ).text(sg.name).data("subsector", sg.slug).addClass("sub-sector-link").addClass("sub-sector-link-" + sg.slug).appendTo sectorNav
        $("<span />").text(" | ").appendTo sectorNav  if i < sgl - 1

      sectorNav
    classesStr = (col) ->
      clss = ["data-cell"]
      _.each col.subgroups, (sg) ->
        clss.push "subgroup-" + sg

      clss.join " "
    hasClickAction = (col, carr) ->
      !!(!!col.click_actions and col.click_actions.indexOf(col))
    _createHeadRow = (sector, cols, opts) ->
      tr = $("<tr />")
      _.each cols, (col, i) ->
        th = $("<th />",
          class: classesStr(col)
        ).data("col", col)
        unless not col.clickable
          th.html $("<a />",
            href: "#"
          ).text(col.name).data("col", col)
        else
          th.text col.name
        th.appendTo tr

      tr.delegate "a", "click", (evt) ->
        opts.indicatorClickCallback.call $(this).data("col")
        false

      $("<thead />").html tr
    highlightColumn = (column, _opts) ->
    
      # var opts = _.extend({
      #     highlightClass: 'fuchsia'
      # }, _opts);
      div.find(".highlighted").removeClass "highlighted"
      th = div.find("th").filter(->
        $(this).data("col").slug is column.slug
      ).eq(0)
      table = th.parents("table").eq(0)
      ind = th.index()
      table.find("tr").each ->
        $(this).children().eq(ind).addClass "highlighted"
  
    createForSectors: createForSectors
    highlightColumn: highlightColumn
    select: select
