(function(){
    var data, opts;

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
NMIS.Env = Env;

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
NMIS.Sectors = Sectors;

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
NMIS.Tabulation = Tabulation;


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
NMIS.DisplayWindow = DisplayWindow;


    NMIS.init = function(_data, _opts) {
        opts = _.extend({
            iconSwitcher: true,
            sectors: false
        }, _opts);
        data = {};
        if(!!opts.sectors) {
            NMIS.loadSectors(opts.sectors);
        }
        NMIS.loadFacilities(_data);
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

    NMIS.loadSectors = function(_sectors, opts){
        Sectors.init(_sectors, opts);
    }
    NMIS.loadFacilities = function(_data, opts) {
        _.each(_data, function(val, key){
            var id = val._id || key;
            data[id] = cloneParse(val);
        });
    }
    NMIS.clear = function() {
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
    NMIS.validateData = function() {
        Sectors.validate();
        _(data).each(ensureUniqueId);
        _(data).each(ensureLatLng);
        return true;
    }
    var _s;
    NMIS.activeSector = function (s) {
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
    NMIS.dataForSector = function(sectorSlug) {
        var sector = Sectors.pluck(sectorSlug);
        return _(data).filter(function(datum, id){
            return datum.sector.slug === sector.slug;
        });
    }
    NMIS.dataObjForSector = function(sectorSlug) {
        var sector = Sectors.pluck(sectorSlug);
        var o = {};
        _(data).each(function(datum, id){
            if(datum.sector.slug === sector.slug) {
                o[id] = datum;
            }
        });
        return o;
    }
    NMIS.data = function(){
      return data;
    };
})();
