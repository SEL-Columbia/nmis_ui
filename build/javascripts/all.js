var debugMode = true;

var NMIS = (function(){
    var data, opts;

var Breadcrumb = (function(){
    var levels = [];
    var elem;
    var context = {};

    function init(_elem, _opts) {
        elem = $(_elem).eq(0);
        var opts = _.extend({
            draw: true
        }, _opts);
        levels = _.extend(levels, (opts.levels || []));
        if(!!opts.draw) {
            draw();
        }
    }
    function clear() {
        if (elem !== undefined) {
            elem.empty();
        }
        levels = [];
    }
    function setLevels(_levels) {
        levels = _.extend(levels, (_levels || []));
        draw();
        return context;
    }
    function setLevel(ln, d) {
        levels[ln] = d;
        return context;
    }
    function draw() {
        if (elem !== undefined) {
            elem.empty();
        }
        var a;
        _.each(levels, function(level, i){
            if(i!==0) {
                $('<span />')
                    .text('/')
                    .appendTo(elem);
            }
            a = $('<a />')
                .text(level[0])
                .attr('href', level[1]);
            if(level.length > 2) { a.click(level[2]); }
            a.appendTo(elem);
        });
    }
    return {
        init: init,
        setLevels: setLevels,
        setLevel: setLevel,
        draw: draw,
        _levels: function(){return levels;},
        clear: clear
    }
})();

var MapMgr = (function(){
    var opts = {},
        started = false,
        finished = false,
        callbackStr = "NMIS.MapMgr.loaded",
        elem, fake,
        loadCallbacks = [];
    function init(_opts) {
        if(started) {
            return true;
        }
        //log("MapMgr initting");
        if(_opts!==undefined) {
            opts = _.extend({
                //defaults
                launch: true,
                fake: false,
                fakeDelay: 3000,
                mapLoadFn: false,
                elem: 'body',
                defaultMapType: 'SATELLITE',
                loadCallbacks: []
            }, _opts);
            loadCallbacks = Array.prototype.concat.apply(loadCallbacks, opts.loadCallbacks);
            fake = opts.fake;
            if(opts.mapLoadFn) {
                mapLoadFn = opts.mapLoadFn;
            }
        } else {
            fake = false;
        }
        started = true;
        if(!fake) {
            mapLoadFn();
        } else {
            _.delay(loaded, opts.fakeDelay);
        }
        return true;
    }
    var mapLoadFn = function() {
        $.getScript('http://maps.googleapis.com/maps/api/js?sensor=false&callback='+callbackStr)
    }
    function loaded() {
        var cb;
        finished = true;
        while(cb = loadCallbacks.pop()) {
            cb.call(opts);
        }
    }
    function mapboxLayer(options) {
        if(typeof google ==="undefined") {
            throw(new Error("Google Maps has not yet loaded into the page."));
        }
	    return new google.maps.ImageMapType({
	        getTileUrl: function(coord, z) {
	        // Y coordinate is flipped in Mapbox, compared to Google
	        // Simplistic predictable hashing
	        return 'http://b.tiles.mapbox.com/v3/modilabs.'
	            + options.tileset
	            + '/' + z
	            + '/' + coord.x
	            + '/' + coord.y + '.png?updated=1331159407403';
	        },
	        name: options.name,
	        alt: options.name,
	        tileSize: new google.maps.Size(256, 256),
	        isPng: true,
	        minZoom: 0,
	        maxZoom: options.maxZoom || 17
	    });
    }
    function addLoadCallback(cb) {
        loadCallbacks.push(cb);
    }
    function isLoaded() {
        return finished;
    }
    function clear() {
        started = finished = false;
    }
    return {
        init: init,
        clear: clear,
        loaded: loaded,
        isLoaded: isLoaded,
        mapboxLayer: mapboxLayer,
        addLoadCallback: addLoadCallback
    }
})();

var S3Photos = (function(){
    var s3Root = "http://nmisstatic.s3.amazonaws.com/facimg";
    function url(s3id, size) {
        if(!size) size = "0";
        var codes = s3id.split(":");
        return [s3Root,
            codes[0],
            size,
            codes[1] + ".jpg"].join("/");
    }
    return {
        url: url
    }
})();

var HackCaps = (function(){
    function capitalize(str) {
        if(!str) {
            return "";
        } else {
            return str[0].toUpperCase() + str.slice(1);
        }
    }

    return function(str){
        if($.type(str)==="string") {
            return _.map(str.split("_"), capitalize).join(" ");
        } else {
            return str;
        }
    }
})();

var FacilitySelector = (function(){
    var active = false;
    function activate(params){
        var fId = params.id;
        NMIS.IconSwitcher.shiftStatus(function(id, item) {
            if(id !== fId) {
                return "background";
            } else {
                active = true;
                return "normal";
            }
        });
        var facility = _.find(NMIS.data(), function(val, key){
            return key==params.id;
        });
        NMIS.FacilityPopup(facility);
    }
    function isActive(){
        return active;
    }
    function deselect() {
        if(active) {
            var sector = NMIS.activeSector();
            NMIS.IconSwitcher.shiftStatus(function(id, item) {
                return item.sector === sector ? "normal" : "background";
            });
            active = false;
            dashboard.setLocation(NMIS.urlFor(NMIS.Env.extend({facilityId: false})));
        }
    }
    return {
        activate: activate,
        isActive: isActive,
        deselect: deselect
    }
})();
var FacilityHover = (function(){
    var hoverOverlayWrap,
        hoverOverlay,
        wh = 90;

    function getPixelOffset(marker, map) {
        var scale = Math.pow(2, map.getZoom());
        var nw = new google.maps.LatLng(
            map.getBounds().getNorthEast().lat(),
            map.getBounds().getSouthWest().lng()
        );
        var worldCoordinateNW = map.getProjection().fromLatLngToPoint(nw);
        var worldCoordinate = map.getProjection().fromLatLngToPoint(marker.getPosition());
        return pixelOffset = new google.maps.Point(
            Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale),
            Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale)
        );
    }
    function show(marker, opts) {
        if (opts===undefined) { opts = {}; }
        var map = marker.map;
        if(!opts.insertBefore) { opts.insertBefore = map.getDiv(); }
        if(!hoverOverlayWrap) {
            hoverOverlayWrap = $('<div />').addClass('hover-overlay-wrap');
            hoverOverlayWrap.insertBefore(opts.insertBefore);
        }
        if(!opts.pOffset) { opts.pOffset = getPixelOffset(marker, map); }
        if(!opts.item) { opts.item = marker.nmis.item; }
        if(!opts.item.s3_photo_id) opts.item.s3_photo_id = "none:none";
        var obj = {
            top: opts.pOffset.y + 10,
            left: opts.pOffset.x - 25,
            arrowLeft: 22,
            name: _getNameFromFacility(opts.item),
            community: opts.item.community,
            title: opts.item.id,
            img_thumb: NMIS.S3Photos.url(opts.item.s3_photo_id, 200)
        };
        hoverOverlay = $(Mustache.to_html($('#facility-hover').eq(0).html().replace(/<{/g, '{{').replace(/\}>/g, '}}'), obj));
        if(!!opts.addClass) { hoverOverlay.addClass(opts.addClass); }
        var img = $('<img />').load(function(){
            var $this = $(this);
            if($this.width() > $this.height()) {
                $this.width(wh);
            } else {
                $this.height(wh);
            }
            $this.css({
                marginTop: -.5*$this.height(),
                marginLeft: -.5*$this.width()
            });
        }).attr('src', NMIS.S3Photos.url(opts.item.s3_photo_id, 90));
        hoverOverlay.find('div.photothumb').html(img);
        hoverOverlayWrap.html(hoverOverlay);
    }
    function hide(delay) {
        if(!!hoverOverlay) {
            hoverOverlay.hide();
        }
    }
    return {
        show: show,
        hide: hide
    }
})();
function _getNameFromFacility(f) {
    return f.name || f.facility_name || f.school_name
}

var FacilityPopup = (function(){
    var div;
    function make(facility, opts) {
        if(opts === undefined) { opts = {}; }
        if(!!div) { div.remove(); }
        var obj = _.extend({
            thumbnail_url: function() {
                return NMIS.S3Photos.url(this.s3_photo_id || 'none1:none2', 200);
            },
            image_url: function() {
                return NMIS.S3Photos.url(this.s3_photo_id || 'none1:none2', "0");
            },
            name: _getNameFromFacility(facility)
        }, facility);
        var subgroups = facility.sector.subGroups(),
            defaultSubgroup = subgroups[0];
        obj.sector_data = _.map(subgroups, function (o, i, arr) {
            return _.extend({}, o, {
                variables: _.map(facility.sector.columnsInSubGroup(o.slug), function (oo, ii, oiarr) {
                    return DisplayValue.special(facility[oo.slug], oo);
                })
            });
        });
        var tmplHtml = $('#facility-popup').eq(0).html().replace(/<{/g, '{{').replace(/\}>/g, '}}');
        div = jQuery(Mustache.to_html(tmplHtml, obj));
        var s = div.find('select'),
            sdiv = div.find('.fac-content'),
            showDataForSector = (function (slug) {
            sdiv.find('> div').hide()
                .filter(function(d, dd){
                    return $(dd).data('sectorSlug') === slug;
                }).show();
        });
        showDataForSector(defaultSubgroup.slug);
        s.change(function(){
            showDataForSector($(this).val());
        });
        div.addClass('fac-popup');
        div.dialog({
            width: 500,
            height: 300,
            resizable: false,
            close: function(){
                FacilitySelector.deselect();
            }
        });
        if(!!opts.addClass) {
            div.addClass(opts.addClass);
        }
        return div;
    }
    return make;
})();

var Env = (function(){
    var env = undefined;
    function EnvAccessor(arg) {
        if(arg===undefined) {
            return getEnv();
        } else {
            setEnv(arg);
        }
    }
    EnvAccessor.extend = function(o){
        return _.extend(getEnv(), o);
    }
    function setEnv(_env) {
        env = _.extend({}, _env);
    }
    function getEnv() {
        if(env === undefined) {
            throw new Error("NMIS.Env is not set");
        } else {
            return _.extend({}, env);
        }
    }
    return EnvAccessor;
})();

var Sectors = (function(){
    var sectors, defaultSector;
    function changeKey(o, key) {
        o['_' + key] = o[key];
        delete(o[key]);
        return o;
    }
    function Sector(d){
        changeKey(d, 'subgroups');
        changeKey(d, 'columns');
        changeKey(d, 'default');
        $.extend(this, d);
    }
    Sector.prototype.subGroups = function() {
        if(!this._subgroups) { return []; }
        return this._subgroups;
    }
    Sector.prototype.subSectors = function() {
        return this.subGroups();
    }
    Sector.prototype.getColumns = function() {
        if(!this._columns) { return []; }
        function displayOrderSort(a,b) { return (a.display_order > b.display_order) ? 1 : -1 }
        return this._columns.sort(displayOrderSort);
    }
    Sector.prototype.columnsInSubGroup = function(sgSlug) {
        return _.filter(this.getColumns(), function(sg){
            return !!_.find(sg.subgroups, function(f){return f==sgSlug});
        });
    }
    Sector.prototype.getIndicators = function() {
        return this._columns || [];
    }
    Sector.prototype.isDefault = function() {
        return !!this._default;
    }
    Sector.prototype.getSubsector = function(query) {
        if(!query) { return; }
        var ssSlug = query.slug || query;
        var ssI = 0, ss = this.subSectors(), ssL = ss.length;
        for(;ssI < ssL; ssI++) {
            if(ss[ssI].slug === ssSlug) {
                return new SubSector(this, ss[ssI]);
            }
        }
    }
    Sector.prototype.getIndicator = function(query) {
        if(!query) { return; }
        var islug = query.slug || query;
        var ssI = 0, ss = this.getIndicators(), ssL = ss.length;
        for(;ssI < ssL; ssI++) {
            if(ss[ssI].slug === islug) {
                return new Indicator(this, ss[ssI]);
            }
        }
    }
    //
    // The Indicator ans SubSector objects might be unnecessary.
    // We can see if the provide any benefit at some point down the line.
    //
    function SubSector(sector, opts) {
        this.sector = sector;
        _.extend(this, opts);
    }
    SubSector.prototype.columns = function(){
        var _ssSlug = this.slug;
        return _.filter(this.sector.getColumns(), function(t){
            return !!_.find(t.subgroups, function(tt){return tt==_ssSlug;})
        });
    };
    function Indicator(sector, opts) {
        this.sector = sector;
        _.extend(this, opts);
    }
    Indicator.prototype.customIconForItem = function(item) {
        return [this.iconify_png_url+item[this.slug]+".png", 32, 24];
    }
    function init(_sectors, opts) {
        if(!!opts && !!opts['default']) {
            defaultSector = new Sector(_.extend(opts['default'], {'default': true}));
        }
        sectors = _(_sectors).chain()
                        .clone()
                        .map(function(s){return new Sector(_.extend({}, s));})
                        .value();
        return true;
    }
    function clear() {
        sectors = [];
    }
    function pluck(slug) {
        return _(sectors).chain()
                .filter(function(s){return s.slug == slug;})
                .first()
                .value() || defaultSector;
    }
    function all() {
        return sectors;
    }
    function validate() {
        if(!sectors instanceof Array)
            warn("Sectors must be defined as an array");
        if(sectors.length===0)
            warn("Sectors array is empty");
        _.each(sectors, function(sector){
            if(sector.name === undefined) { warn("Sector name must be defined."); }
            if(sector.slug === undefined) { warn("Sector slug must be defined."); }
        });
        var slugs = _(sectors).pluck('slug');
        if(slugs.length !== _(slugs).uniq().length) {
            warn("Sector slugs must not be reused");
        }
        // $(this.columns).each(function(i, val){
        //   var name = val.name;
        //   var slug = val.slug;
        //   name === undefined && warn("Each column needs a slug", this);
        //   slug === undefined && warn("Each column needs a name", this);
        // });
        return true;
    }
    function slugs() {
        return _.pluck(sectors, 'slug');
    }
    return {
        init: init,
        pluck: pluck,
        slugs: slugs,
        all: all,
        validate: validate,
        clear: clear
    };
})();

var Tabulation = (function(){
    function init () {
        return true;
    }
    function filterBySector (sector) {
        var sector = Sectors.pluck(sector);
        return _.filter(NMIS.data(), function(d){
            return d.sector == sector;
        })
    }
    function sectorSlug (sector, slug, keys) {
        var occurrences = {};
        var values = _(filterBySector(sector)).chain()
                        .pluck(slug)
                        .map(function(v){
                            return '' + v;
                        })
                        .value();
        if(keys===undefined) keys = _.uniq(values).sort();
        _.each(keys, function(key) { occurrences[key] = 0; });
        _.each(values, function(d){
            if(occurrences[d] !== undefined)
                occurrences[d]++;
        });
        return occurrences;
    }
    function sectorSlugAsArray (sector, slug, keys) {
        var occurrences = sectorSlug.apply(this, arguments);
        if(keys===undefined) { keys = _.keys(occurrences).sort(); }
        return _(keys).map(function(key){
            return {
                occurrences: '' + key,
                value: occurrences[key]
            };
        });
    }
    return {
        init: init,
        sectorSlug: sectorSlug,
        sectorSlugAsArray: sectorSlugAsArray,
    };
})();

var DataLoader = (function(){
    function fetchLocalStorage(url){
  		var p, data, stringData = localStorage.getItem(url);
  		if(stringData) {
  			data = JSON.parse(stringData);
  			$.getJSON(url).then(function(d){
  			    localStorage.removeItem(url)
  				localStorage.setItem(url, JSON.stringify(d));
  			});
  			return $.Deferred().resolve([data]);
  		} else {
  			p = new $.Deferred();
  			$.getJSON(url).then(function(d){
  				localStorage.setItem(url, JSON.stringify(d));
  				p.resolve([d]);
  			});
  			return p.promise();
  		}
    }
    function fetch(url) {
        return $.getJSON(url);
    }
    return {
        fetch: fetch
    };
})();


var DisplayWindow = (function(){
    var elem, elem1, elem0, elem1content;
    var opts;
    var visible;
    var hbuttons;
    var titleElems = {};
    var curSize;
    var resizerSet;
    function init(_elem, _opts) {
        if(opts !== undefined) { clear(); }
        if(!resizerSet) {resizerSet=true; $(window).resize(resized);}
        elem = $('<div />').appendTo($(_elem));
        opts = _.extend({
            //default options:
            height: 100,
            clickSizes: [
                ['full', 'Table Only'],
                ['middle', 'Split'],
                ['minimized', 'Map Only']
            ],
            size: 'middle',
            sizeCookie: false,
            callbacks: {},
            visible: false,
            heights: {
                full: Infinity,
                middle: 280,
                minimized: 46
            },
            allowHide: true,
            padding: 10
        }, _opts);
        elem0 = $('<div />')
            .addClass('elem0')
            .appendTo(elem);
        elem1 = $('<div />')
            .addClass('elem1')
            .appendTo(elem);
        visible = !!opts.visible;
        setVisibility(visible, false);
        if(opts.sizeCookie) {
            opts.size = $.cookie("displayWindowSize") || opts.size;
        }

        elem.addClass('display-window-wrap');
        elem1.addClass('display-window-content');

        createHeaderBar()
            .appendTo(elem1);
        elem1content = $('<div />')
            .addClass('elem1-content')
            .appendTo(elem1);
        setSize(opts.size);
    }
    var resized = _.throttle(function(){
        if(curSize!=="full") {
            var fh = fullHeight();
            elem.stop(true, false);
            elem.animate({height: fh});
            elem0.stop(true, false);
            elem0.animate({height: fh});
        }
    }, 1000);
    function setDWHeight(height) {
        if (height===undefined) {
            height = 'auto';
        } else if (height === "calculate") {
            height = fullHeight();
        }
        elem.height(height);
        elem0.height(height);
    }
    function setTitle(t, tt) {
        _.each(titleElems, function(e){
            e.text(t);
        });
        if(tt!== undefined) {
            $('head title').text('NMIS: '+ tt);
        } else {
            $('head title').text('NMIS: '+ t);
        }
    }
    var curTitle;
    function showTitle(i) {
        curTitle = i;
        _.each(titleElems, function(e, key){
            if(key===i) {
                e.show();
            } else {
                e.hide();
            }
        });
    }
    function addCallback(cbname, cb) {
        if(opts.callbacks[cbname]===undefined) {
            opts.callbacks[cbname] = [];
        }
        opts.callbacks[cbname].push(cb);
    }
    function setBarHeight(h, animate, cb) {
        if(animate) {
            elem1.animate({
                height: h
            }, {
                duration: 200,
                complete: cb
            });
        } else {
            elem1.css({
                height: h
            });
            (cb || function(){})();
        }
    }
    // var prevSize, sizeTempSet = false;
    // function setTempSize(size, animate) {
    //     prevSize = curSize;
    //     sizeTempSet = true;
    //     setSize(size, animate);
    // }
    // function unsetTempSize(animate) {
    //     if(sizeTempSet) {
    //         setSize(prevSize, animate);
    //         prevSize = undefined;
    //         sizeTempSet = false;
    //     }
    // }
    function setSize(_size, animate) {
        var size;
        if(opts.heights[_size] !== undefined) {
            size = opts.heights[_size];
            if(size === Infinity) {
                size = fullHeight();
            }
            $.cookie("displayWindowSize", _size);
            setBarHeight(size, animate, function(){
                if(!!curSize) elem1.removeClass('size-'+curSize);
                elem1.addClass('size-'+_size);
                curSize = _size;
            });
        }
        if(opts.callbacks[_size] !== undefined) {
            _.each(opts.callbacks[_size], function(cb){
                cb(animate);
            });
        }
        if(opts.callbacks.resize !== undefined) {
            _.each(opts.callbacks.resize, function(cb){
                cb(animate, _size, elem, elem1, elem1content);
            });
        }
        hbuttons.find('.primary')
            .removeClass('primary');
        hbuttons.find('.clicksize.'+_size)
            .addClass('primary');
    }
    function setVisibility(tf) {
        var css = {};
        if(!tf) {
            css = {'left': '1000em', display: 'none'};
        } else {
            css = {'left': '0', display: 'block'};
        }
        elem0.css(css);
        elem1.css(css);
    }
    function addTitle(key, jqElem) {
        titleElems[key] = jqElem;
        if(curTitle===key) {
            showTitle(key);
        }
    }
    function createHeaderBar() {
        hbuttons = $('<span />'); //.addClass('print-hide-inline');
        _.each(opts.clickSizes, function(sizeArr){
            var size = sizeArr[0],
                desc = sizeArr[1];
            $('<a />')
                .attr('class', 'btn small clicksize ' + size)
                .text(desc)
                .attr('title', desc)
                .click(function(){
                    setSize(size, false)
                })
                .appendTo(hbuttons);
        });
        titleElems.bar = $('<h3 />').addClass('bar-title').hide();
        return $('<div />', {'class': 'display-window-bar breadcrumb'})
            .css({'margin':0})
            .append(titleElems.bar)
            .append(hbuttons);
    }
    function clear(){
        elem !== undefined && elem.empty();
        titleElems = {};
    }
    function getElems() {
        return {
            wrap: elem,
            elem0: elem0,
            elem1: elem1,
            elem1content: elem1content
        }
    }
    function fullHeight() {
        // gets the available height of the DisplayWindow wrap (everything except the header.)
        var oh = 0;
        $(opts.offsetElems).each(function(){ oh += $(this).height(); });
        return $(window).height() - oh - opts.padding;
    }
    function elem1contentHeight() {
        var padding = 30;
        return elem1.height() - hbuttons.height() - padding;
    }
    return {
        init: init,
        clear: clear,
        setSize: setSize,
        getSize: function(){return curSize},
        setVisibility: setVisibility,
//        setTempSize: setTempSize,
//        unsetTempSize: unsetTempSize,
        addCallback: addCallback,
        setDWHeight: setDWHeight,
        addTitle: addTitle,
        setTitle: setTitle,
        showTitle: showTitle,
        elem1contentHeight: elem1contentHeight,
        getElems: getElems
    };
})();

var IconSwitcher = (function(){
    var context = {};
    var callbacks = ["createMapItem",
                        "shiftMapItemStatus",
                        "statusShiftDone",
                        "hideMapItem",
                        "showMapItem",
                        "setMapItemVisibility"];
    function init(_opts) {
        //log("IconSwitcher initting");
        var noop = function(){};
        var items = {};
        context = _.extend({
            items: {},
            mapItem: mapItem
        }, _opts);
        _.each(callbacks, function(cbname){
            if(context[cbname]===undefined) { context[cbname] = noop; }
        });
    }
    var mapItems = {};
    function mapItem(id, value) {
        if(arguments.length===1) {
            //get mapItem
            return mapItems[id];
        } else if(arguments.length===2) {
            //set mapItem
            mapItems[id] = value;
        }
    }
    function hideItem(item) {
        item.hidden = true;
    }
    function showItem(item) {
        item.hidden = false;
    }
    function setVisibility(item, tf) {
        if(!!tf) {
            if(!item.hidden) {
                item.hidden = true;
                context.setMapItemVisibility.call(item, false, item, context.items);
                return true;
            }
        } else {
            if(!!item.hidden) {
                item.hidden = false;
                context.setMapItemVisibility.call(item, true, item, context.items);
                return true;
            }
        }
        return false;
    }
    function iterate(cb) {
        _.each(context.items, function(item, id, itemset){
            cb.apply(context, [item, id, itemset]);
        });
    }
    function shiftStatus(fn) {
        iterate(function(item, id){
            var status = fn.call(context, id, item, context.items);
            var visChange = setVisibility(item, status === false),
                statusChange = false;
            if(status === undefined) {
                //do nothing
            } else if(status === false) {
                item.status = undefined;
            } else if(item.status !== status) {
                item._prevStatus = status;
                item.status = status;
                statusChange = true;
            }
            if(statusChange || visChange) {
                context.shiftMapItemStatus(item, id);
            }
        });
        context.statusShiftDone();
    }
    function all() { return _.values(context.items); }
    function setCallback(cbName, cb) {
        if(callbacks.indexOf(cbName) !== -1) {
            context[cbName] = cb;
        }
    }
    function filterStatus(status) {
        return _.filter(context.items, function(item){ return item.status === status; });
    }
    function filterStatusNot(status) {
        return _.filter(context.items, function(item){ return item.status !== status; });
    }
    function allShowing() {
        return filterStatusNot(undefined);
    }
    function createAll() {
        iterate(context.createMapItem);
    }
    function clear() {
        context = {};
    }
    return {
        init: init,
        clear: clear,
        allShowing: allShowing,
        createAll: createAll,
        filterStatus: filterStatus,
        filterStatusNot: filterStatusNot,
        all: all,
        setCallback: setCallback,
        shiftStatus: shiftStatus,
        iterate: iterate
    }
})();

var LocalNav = (function(){
    var elem, wrap, opts;
    var buttonSections = {};
    var submenu;
    function init(selector, _opts) {
        wrap = $(selector);
        opts = _.extend({
            sections: []
        }, _opts);
        elem = $('<ul />', {'id': 'local-nav', 'class': 'nav'});
        wrap = $('<div />', {'class': 'row ln-wrap'})
                .css({'position':'absolute','top':82,'left':56,'z-index':99})
                .html(elem);
        $('.content').eq(0).prepend(wrap);
        _.each(opts.sections, function(section, i){
            if(i!==0) {
                $("<li />", {'class': 'small spacer'})
                    .html('&nbsp;')
                    .appendTo(elem);
            }
            _.each(section, function(arr){
                var code = arr[0].split(":");
                if(buttonSections[code[0]]===undefined) {buttonSections[code[0]] = {};}
                var a = $('<a />', {'href':arr[2], 'text': arr[1]});
                buttonSections[code[0]][code[1]] = a;
                $('<li />').html(a)
                    .appendTo(elem);
            });
        });
        submenu = $('<ul />')
            .addClass('submenu')
            .appendTo(elem);
    }
    function getNavLink(code) {
        var _x = code.split(":"),
            section = _x[0],
            name = _x[1];
        return buttonSections[section][name];
    }
    function markActive(codesArray) {
        wrap.find('.active').removeClass('active');
        _.each(codesArray, function(code){
            getNavLink(code).parents('li').eq(0).addClass('active')
        });
    }
    function clear() {
        wrap.empty();
        wrap = undefined;
        elem = undefined;
        buttonSections = {};
        submenu = undefined;
    }
    function hideSubmenu() {
        submenu.hide();
    }
    function displaySubmenu(nlcode, a, _opts) {
        var navLink = getNavLink(nlcode);
        var lpos = navLink.parents('li').eq(0).position().left;
        submenu.hide()
                .empty()
                .css({'left': lpos});
        _.each(a, function(aa){
            $('<li />')
                .html($('<a />', {text: aa[0], 'href': aa[1]}))
                .appendTo(submenu);
        });
        submenu.show();
    }
    function iterate(cb) {
        _.each(buttonSections, function(buttons, sectionName){
            _.each(buttons, function(button, buttonName){
                cb.apply(this, [sectionName, buttonName, button])
            });
        });
    }
    return {
        init: init,
        clear: clear,
        iterate: iterate,
        displaySubmenu: displaySubmenu,
        hideSubmenu: hideSubmenu,
        markActive: markActive
    }
})();

    function init(_data, _opts) {
        opts = _.extend({
            iconSwitcher: true,
            sectors: false
        }, _opts);
        data = {};
        if(!!opts.sectors) {
            loadSectors(opts.sectors);
        }
        loadFacilities(_data);
    	if(opts.iconSwitcher) {
            NMIS.IconSwitcher.init({
        	    items: data,
        	    statusShiftDone: function(){
        	        var tally = {};
    	            _.each(this.items, function(item){
    	                if(!tally[item.status]) {
    	                    tally[item.status]=0;
    	                }
    	                tally[item.status]++;
    	            });
//    	            log(JSON.stringify(tally));
        	    }
        	});
        }
        return true;
    }
    function loadSectors(_sectors, opts){
        Sectors.init(_sectors, opts);
    }
    function loadFacilities(_data, opts) {
        _.each(_data, function(val, key){
            var id = val._id || key;
            data[id] = cloneParse(val);
        });
    }
    function clear() {
        data = [];
        Sectors.clear();
    }
    function ensureUniqueId(datum) {
        if(datum._uid === undefined) {
            datum._uid = _.uniqueId('fp');
        }
    }
    function ensureLatLng(datum) {
        if(datum._latlng === undefined && datum.gps !== undefined) {
            var llArr = datum.gps.split(' ');
            datum._latlng = [ llArr[0], llArr[1] ];
        }
    }
    function validateData() {
        Sectors.validate();
        _(data).each(ensureUniqueId);
        _(data).each(ensureLatLng);
        return true;
    }
    var _s;
    function activeSector(s) {
        if(s===undefined) {
            return _s;
        } else {
            _s = s;
        }
    }
    function cloneParse(d) {
        var datum = _.clone(d);
    	if(datum.gps===undefined) {
    	    datum._ll = false;
    	} else {
    	    var ll = datum.gps.split(' ');
    	    datum._ll = [ll[0], ll[1]];
    	}
    	var sslug = datum.sector.toLowerCase();
    	datum.sector = Sectors.pluck(sslug);
    	return datum;
    }
    function dataForSector(sectorSlug) {
        var sector = Sectors.pluck(sectorSlug);
        return _(data).filter(function(datum, id){
            return datum.sector.slug === sector.slug;
        });
    }
    function dataObjForSector(sectorSlug) {
        var sector = Sectors.pluck(sectorSlug);
        var o = {};
        _(data).each(function(datum, id){
            if(datum.sector.slug === sector.slug) {
                o[id] = datum;
            }
        });
        return o;
    }
    return {
        Sectors: Sectors,
        Tabulation: Tabulation,
        IconSwitcher: IconSwitcher,
        LocalNav: LocalNav,
        Breadcrumb: Breadcrumb,
        DisplayWindow: DisplayWindow,
//        SectorDataTable: SectorDataTable,
        DataLoader: DataLoader,
        FacilityPopup: FacilityPopup,
        FacilityHover: FacilityHover,
        FacilitySelector: FacilitySelector,
        HackCaps: HackCaps,
        MapMgr: MapMgr,
        Env: Env,
        S3Photos: S3Photos,
        activeSector: activeSector,
        data: function(){return data;},
        dataForSector: dataForSector,
        dataObjForSector: dataObjForSector,
        validateData: validateData,
        loadSectors: loadSectors,
        loadFacilities: loadFacilities,
        init: init,
        clear: clear
    }
})();
var DisplayValue = (function(){
    function roundDown(v, i) {
    	var c = 2;
    	var d = Math.pow(10, c);
    	return Math.floor(v * d) / d;
    }
    function Value(v) {
        if(v===undefined) {
            return ["&mdash;", 'val-undefined'];
    	} else if (v===null) {
            return ["null", 'val-null'];
        } else if (v===true) {
    	    return ["Yes"];
    	} else if (v===false) {
    	    return ["No"];
    	} else if (!isNaN(+v)) {
    	    return [roundDown(v)];
    	} else if ($.type(v) === "string") {
    	    return [NMIS.HackCaps(v)]
    	}
        return [v];
    }
    function DisplayInElement(d, td) {
        var res = Value(d);
        if (d[1]!==undefined) td.addClass(res[1]);
        return td.html(res[0]);
    }
    DisplayInElement.raw = Value;
    DisplayInElement.special = function(v, indicator) {
        var r = Value(v),
            o = {name: indicator.name, classes: "", value: r[0]};
        if(indicator.display_style==="checkmark_true") {
            o.classes = "label ";
            if(v===true) {
                o.classes += "chk-yes";
            } else if(v===false) {
                o.classes += "chk-no";
            } else {
                o.classes += "chk-null";
            }
        } else if(indicator.display_style==="checkmark_false") {
            o.classes = "label ";
            if(v===true) {
                o.classes += "chk-no";
            } else if(v===false) {
                o.classes += "chk-yes";
            } else {
                o.classes += "chk-null";
            }
        }
        return o;
    }
    DisplayInElement.inTdElem = function(facility, indicator, elem) {
        var vv = facility[indicator.slug],
            c = Value(vv);
        var chkY = indicator.display_style === "checkmark_true",
            chkN = indicator.display_style === "checkmark_false";

        if(chkY || chkN) {
            var oclasses = "label ";
            if($.type(vv)==="boolean") {
                if(vv) {
                    oclasses += chkY ? "chk-yes" : "chk-no";
                } else {
                    oclasses += chkY ? "chk-no" : "chk-yes";
                }
            } else {
                oclasses += "chk-null";
            }
            c[0] = $('<span />').addClass(oclasses).html(c[0]);
        }
        return elem.html(c[0]);
    }

    return DisplayInElement;
})();

var SectorDataTable = (function(){
    var dt, table;
    var tableSwitcher;
    var dataTableDraw = function(){};
    function createIn(tableWrap, env, _opts) {
        var opts = _.extend({
            sScrollY: 120
        }, _opts);
        var data = NMIS.dataForSector(env.sector.slug);
        if(env.subsector===undefined) {
            throw(new Error("Subsector is undefined"));
        }
        env.subsector = env.sector.getSubsector(env.subsector.slug);
        var columns = env.subsector.columns();

        if(tableSwitcher) {tableSwitcher.remove();}
        tableSwitcher = $('<select />');
        _.each(env.sector.subGroups(), function(sg){
            $('<option />').val(sg.slug).text(sg.name).appendTo(tableSwitcher);
        });
        table = $('<table />')
            .addClass('facility-dt')
            .append(_createThead(columns))
            .append(_createTbody(columns, data));
        tableWrap.append(table);
        dataTableDraw = function(s){
            dt = table.dataTable({
                sScrollY: s,
                bDestroy: true,
                bScrollCollapse: false,
                bPaginate: false,
                fnDrawCallback: function() {
                    var newSelectDiv, ts;
                    $('.dataTables_info', tableWrap).remove();
                    if($('.dtSelect', tableWrap).get(0)===undefined) {
                        ts = getSelect();
                        newSelectDiv = $('<div />', {'class': 'dataTables_filter dtSelect left'})
                                            .html($('<p />').text("Grouping:").append(ts));
                        $('.dataTables_filter', tableWrap).parents().eq(0)
                                .prepend(newSelectDiv);
                        ts.val(env.subsector.slug);
                        ts.change(function(){
                            var ssSlug = $(this).val();
                            var nextUrl = NMIS.urlFor(_.extend({},
                                            env,
                                            {subsector: env.sector.getSubsector(ssSlug)}));
                            dashboard.setLocation(nextUrl);
                        });
                    }
                }
            });
            return tableWrap;
        }
        dataTableDraw(opts.sScrollY);
        table.delegate('tr', 'click', function(){
            dashboard.setLocation(NMIS.urlFor(_.extend({}, NMIS.Env(), {facilityId: $(this).data('rowData')})));
        });
        return table;
    }
    function getSelect() {
        return tableSwitcher.clone();
    }
    function setDtMaxHeight(ss) {
        var tw, h1, h2;
        tw = dataTableDraw(ss);
        // console.group("heights");
        // log("DEST: ", ss);
        h1 = $('.dataTables_scrollHead', tw).height();
        // log(".dataTables_scrollHead: ", h);
        h2 = $('.dataTables_filter', tw).height();
        // log(".dataTables_filter: ", h2);
        ss = ss - (h1 + h2);
        // log("sScrollY: ", ss);
        dataTableDraw(ss);
        // log(".dataTables_wrapper: ", $('.dataTables_wrapper').height());
        // console.groupEnd();
    }
    function handleHeadRowClick() {
        var column = $(this).data('column');
        var indicatorSlug = column.slug;
        if(!!indicatorSlug) {
            var newEnv = _.extend({}, NMIS.Env(), {
                indicator: indicatorSlug
            });
            if(!newEnv.subsector) {
                newEnv.subsector = _.first(newEnv.sector.subGroups());
            }
            var newUrl = NMIS.urlFor(newEnv);
            dashboard.setLocation(newUrl);
        }
    }
    function _createThead(cols) {
        var row = $('<tr />');
        var startsWithType = cols[0].name=="Type";
        _.each(cols, function(col, ii){
            if(ii===1 && !startsWithType) {
                $('<th />').text('Type').appendTo(row);
            }
            row.append($('<th />').text(col.name).data('column', col));
        });
        row.delegate('th', 'click', handleHeadRowClick);
        return $('<thead />').html(row);
    }
    function nullMarker() {
        return $('<span />').html('&mdash;').addClass('null-marker');
    }
    function resizeColumns() {
        if(!!dt) dt.fnAdjustColumnSizing();
    }
    function _createTbody(cols, rows) {
        var tbody = $('<tbody />');
        _.each(rows, function(r){
            var row = $('<tr />');
            if (r._id === undefined) {
              console.error("Facility does not have '_id' defined:", r);
            } else {
              row.data("row-data", r._id);
            }
            var startsWithType = cols[0].name=="Type";
            _.each(cols, function(c, ii){
                // quick fixes in this function scope will need to be redone.
                if(ii===1 && !startsWithType) {
                    var ftype = r.facility_type || r.education_type || r.water_source_type || "unk";
                    $('<td />').attr('title', ftype).addClass('type-icon').html($('<span />').addClass('icon').addClass(ftype).html($('<span />').text(ftype))).appendTo(row);
                }
                var z = r[c.slug] || nullMarker();
                var td = DisplayValue.inTdElem(r, c, $('<td />'));
                row.append(td);
            });
            tbody.append(row);
        });
        return tbody;
    }
    return {
        createIn: createIn,
        setDtMaxHeight: setDtMaxHeight,
        getSelect: getSelect,
        resizeColumns: resizeColumns
    }
})();

var FacilityTables = (function(){
    var div;
    function createForSectors(sArr, _opts) {
        var opts = _.extend({
            //default options
            callback: function(){},
            sectorCallback: function(){},
            indicatorClickCallback: function(){}
        }, _opts);
        if(div===undefined) {
            div = $('<div />').addClass('facility-display-wrap');
        }
        div.empty();
        _.each(sArr, function(s){
            div.append(createForSector(s, opts));
        });
        if(opts.callback) {
            opts.callback.call(this, div);
        }
        return div;
    }
    function select(sector, subsector) {
        if(sectorNav!==undefined) {
            sectorNav.find('a.active').removeClass('active');
            sectorNav.find('.sub-sector-link-' + subsector.slug)
                .addClass('active')
        }
        div.find('td, th').hide();
        var sectorElem = div.find('.facility-display').filter(function(){
            return $(this).data('sector') === sector.slug;
        }).eq(0);
        sectorElem.find('.subgroup-all, .subgroup-'+subsector.slug).show();
    }
    function createForSector(s, opts) {
        var tbody = $('<tbody />');
        var sector = NMIS.Sectors.pluck(s);
        var iDiv = $('<div />')
                        .addClass('facility-display')
                        .data('sector', sector.slug);
        var cols = sector.getColumns().sort(function(a,b){return a.display_order-b.display_order;});

        var orderedFacilities = NMIS.dataForSector(sector.slug);
        var dobj = NMIS.dataObjForSector(sector.slug);
        _.each(dobj, function(facility, fid){
            _createRow(facility, cols, fid)
                .appendTo(tbody);
        });
        $('<table />')
            .append(_createHeadRow(sector, cols, opts))
            .append(tbody)
            .appendTo(iDiv);
        opts.sectorCallback.call(this, sector, iDiv, _createNavigation, div);
        return iDiv;
    }
    function _createRow(facility, cols, facilityId) {
        var tr = $('<tr />').data('facility-id', facilityId);
        _.each(cols, function(col, i){
            var slug = col.slug;
            var rawval = facility[slug];
            var val = DisplayValue(rawval, $('<td />', {'class': classesStr(col)})).appendTo(tr);
        });
        return tr;
    }
    var sectorNav;
    function _createNavigation(sector, _hrefCb) {
        sectorNav = $('<p />').addClass('facility-sectors-navigation');
        var subgroups = sector.subGroups(),
            sgl = subgroups.length;
        _.each(subgroups, function(sg, i){
            var href = _hrefCb(sg);
            $('<a />', {href: href})
                .text(sg.name)
                .data('subsector', sg.slug)
                .addClass('sub-sector-link')
                .addClass('sub-sector-link-'+sg.slug)
                .appendTo(sectorNav);
            if(i < sgl - 1)
                $('<span />').text(' | ').appendTo(sectorNav);
        });
        return sectorNav;
    }
    function classesStr(col) {
        var clss = ['data-cell'];
        _.each(col.subgroups, function(sg){
            clss.push('subgroup-'+sg);
        });
        return clss.join(' ');
    }
    function hasClickAction(col, carr) {
    	return !!(!!col.click_actions && col.click_actions.indexOf(col));
    }
    function _createHeadRow(sector, cols, opts) {
        var tr = $('<tr />');
        _.each(cols, function(col, i){
	    var th = $('<th />', {'class': classesStr(col)})
	        .data('col', col);
	    if (!!col.clickable) {
    		th.html($('<a />', {href: '#'}).text(col.name).data('col',col));
	    } else {
    		th.text(col.name);
	    }
	    th.appendTo(tr);
        });
        tr.delegate('a', 'click', function(evt){
            opts.indicatorClickCallback.call($(this).data('col'));
            return false;
        });
        return $('<thead />').html(tr);
    }
    function highlightColumn(column, _opts) {
        // var opts = _.extend({
        //     highlightClass: 'fuchsia'
        // }, _opts);
        div.find('.highlighted').removeClass('highlighted');
        var th = div.find('th').filter(function(){
            return ($(this).data('col').slug === column.slug)
        }).eq(0);
        var table = th.parents('table').eq(0);
        var ind = th.index();
        table.find('tr').each(function(){
            $(this).children().eq(ind).addClass('highlighted');
        });
//        log(column, '.subgroup-'+column.slug, );
    }
    return {
        createForSectors: createForSectors,
        highlightColumn: highlightColumn,
        select: select
    };
})();

if("undefined" !== typeof NMIS) {
    NMIS.SectorDataTable = SectorDataTable;
    NMIS.FacilityTables = FacilityTables;
} else {
    $(function(){
        if(NMIS) {
            NMIS.SectorDataTable = SectorDataTable;
            NMIS.FacilityTables = FacilityTables;
        }
    });
}
;
(function() {

  if (!((window.console != null) && (console.log != null))) {
    (function() {
      var console, length, methods, noop, _results;
      noop = function() {};
      methods = ["assert", "clear", "count", "debug", "dir", "dirxml", "error", "exception", "group", "groupCollapsed", "groupEnd", "info", "log", "markTimeline", "profile", "profileEnd", "markTimeline", "table", "time", "timeEnd", "timeStamp", "trace", "warn"];
      length = methods.length;
      console = window.console = {};
      _results = [];
      while (length--) {
        _results.push(console[methods[length]] = noop);
      }
      return _results;
    })();
  }

  this.log = function() {
    log.history = log.history || [];
    log.history.push(arguments);
    if (window.console) {
      return console.log.apply(console, Array.prototype.slice.call(arguments));
    }
  };

}).call(this);


