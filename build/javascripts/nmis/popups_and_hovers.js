(function() {
  var _getNameFromFacility;

  _getNameFromFacility = function(f) {
    return f.name || f.facility_name || f.school_name;
  };

  NMIS.FacilityHover = (function() {
    var getPixelOffset, hide, hoverOverlay, hoverOverlayWrap, show, wh;
    hoverOverlayWrap = void 0;
    hoverOverlay = void 0;
    wh = 90;
    getPixelOffset = function(marker, map) {
      var nw, pixelOffset, scale, worldCoordinate, worldCoordinateNW;
      scale = Math.pow(2, map.getZoom());
      nw = new google.maps.LatLng(map.getBounds().getNorthEast().lat(), map.getBounds().getSouthWest().lng());
      worldCoordinateNW = map.getProjection().fromLatLngToPoint(nw);
      worldCoordinate = map.getProjection().fromLatLngToPoint(marker.getPosition());
      return pixelOffset = new google.maps.Point(Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale), Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale));
    };
    show = function(marker, opts) {
      var img, map, obj;
      if (opts === undefined) {
        opts = {};
      }
      map = marker.map;
      if (!opts.insertBefore) {
        opts.insertBefore = map.getDiv();
      }
      if (!hoverOverlayWrap) {
        hoverOverlayWrap = $("<div />").addClass("hover-overlay-wrap");
        hoverOverlayWrap.insertBefore(opts.insertBefore);
      }
      if (!opts.pOffset) {
        opts.pOffset = getPixelOffset(marker, map);
      }
      if (!opts.item) {
        opts.item = marker.nmis.item;
      }
      if (!opts.item.s3_photo_id) {
        opts.item.s3_photo_id = "none:none";
      }
      obj = {
        top: opts.pOffset.y + 10,
        left: opts.pOffset.x - 25,
        arrowLeft: 22,
        name: _getNameFromFacility(opts.item),
        community: opts.item.community,
        title: opts.item.id,
        img_thumb: NMIS.S3Photos.url(opts.item.s3_photo_id, 200)
      };
      hoverOverlay = $(Mustache.to_html($("#facility-hover").eq(0).html().replace(/<{/g, "{{").replace(/\}>/g, "}}"), obj));
      if (!!opts.addClass) {
        hoverOverlay.addClass(opts.addClass);
      }
      img = $("<img />").load(function() {
        var $this;
        $this = $(this);
        if ($this.width() > $this.height()) {
          $this.width(wh);
        } else {
          $this.height(wh);
        }
        return $this.css({
          marginTop: -.5 * $this.height(),
          marginLeft: -.5 * $this.width()
        });
      }).attr("src", NMIS.S3Photos.url(opts.item.s3_photo_id, 90));
      hoverOverlay.find("div.photothumb").html(img);
      return hoverOverlayWrap.html(hoverOverlay);
    };
    hide = function(delay) {
      if (!!hoverOverlay) {
        return hoverOverlay.hide();
      }
    };
    return {
      show: show,
      hide: hide
    };
  })();

  NMIS.FacilityPopup = (function() {
    var div, facility_popup;
    div = void 0;
    facility_popup = function(facility, opts) {
      var defaultSubgroup, obj, s, sdiv, showDataForSector, subgroups, tmplHtml;
      if (opts === undefined) {
        opts = {};
      }
      if (!!div) {
        div.remove();
      }
      obj = _.extend({
        thumbnail_url: function() {
          return NMIS.S3Photos.url(this.s3_photo_id || "none1:none2", 200);
        },
        image_url: function() {
          return NMIS.S3Photos.url(this.s3_photo_id || "none1:none2", "0");
        },
        name: _getNameFromFacility(facility)
      }, facility);
      subgroups = facility.sector.subGroups();
      defaultSubgroup = subgroups[0];
      obj.sector_data = _.map(subgroups, function(o, i, arr) {
        return _.extend({}, o, {
          variables: _.map(facility.sector.columnsInSubGroup(o.slug), function(oo, ii, oiarr) {
            return NMIS.DisplayValue.special(facility[oo.slug], oo);
          })
        });
      });
      tmplHtml = $._template("#facility-popup", obj);
      div = $(tmplHtml);
      s = div.find("select");
      sdiv = div.find(".fac-content");
      showDataForSector = (function(slug) {
        return sdiv.find("> div").hide().filter(function(d, dd) {
          return $(dd).data("sectorSlug") === slug;
        }).show();
      });
      showDataForSector(defaultSubgroup.slug);
      s.change(function() {
        return showDataForSector($(this).val());
      });
      div.addClass("fac-popup");
      div.dialog({
        width: 500,
        height: 300,
        resizable: false,
        close: function() {
          return NMIS.FacilitySelector.deselect();
        }
      });
      if (!!opts.addClass) {
        div.addClass(opts.addClass);
      }
      return div;
    };
    facility_popup.hide = function() {
      return $(".fac-popup").remove();
    };
    return facility_popup;
  })();

}).call(this);
