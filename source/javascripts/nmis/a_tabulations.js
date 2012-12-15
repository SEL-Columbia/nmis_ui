// (function(){
// var Sectors = (function(){
//     var sectors, defaultSector;
//     function changeKey(o, key) {
//         o['_' + key] = o[key];
//         delete(o[key]);
//         return o;
//     }
//     function Sector(d){
//         changeKey(d, 'subgroups');
//         changeKey(d, 'columns');
//         changeKey(d, 'default');
//         $.extend(this, d);
//     }
//     Sector.prototype.subGroups = function() {
//         if(!this._subgroups) { return []; }
//         return this._subgroups;
//     }
//     Sector.prototype.subSectors = function() {
//         return this.subGroups();
//     }
//     Sector.prototype.getColumns = function() {
//         if(!this._columns) { return []; }
//         function displayOrderSort(a,b) { return (a.display_order > b.display_order) ? 1 : -1 }
//         return this._columns.sort(displayOrderSort);
//     }
//     Sector.prototype.columnsInSubGroup = function(sgSlug) {
//         return _.filter(this.getColumns(), function(sg){
//             return !!_.find(sg.subgroups, function(f){return f==sgSlug});
//         });
//     }
//     Sector.prototype.getIndicators = function() {
//         return this._columns || [];
//     }
//     Sector.prototype.isDefault = function() {
//         return !!this._default;
//     }
//     Sector.prototype.getSubsector = function(query) {
//         if(!query) { return; }
//         var ssSlug = query.slug || query;
//         var ssI = 0, ss = this.subSectors(), ssL = ss.length;
//         for(;ssI < ssL; ssI++) {
//             if(ss[ssI].slug === ssSlug) {
//                 return new SubSector(this, ss[ssI]);
//             }
//         }
//     }
//     Sector.prototype.getIndicator = function(query) {
//         if(!query) { return; }
//         var islug = query.slug || query;
//         var ssI = 0, ss = this.getIndicators(), ssL = ss.length;
//         for(;ssI < ssL; ssI++) {
//             if(ss[ssI].slug === islug) {
//                 return new Indicator(this, ss[ssI]);
//             }
//         }
//     }
//     //
//     // The Indicator ans SubSector objects might be unnecessary.
//     // We can see if the provide any benefit at some point down the line.
//     //
//     function SubSector(sector, opts) {
//         this.sector = sector;
//         _.extend(this, opts);
//     }
//     SubSector.prototype.columns = function(){
//         var _ssSlug = this.slug;
//         return _.filter(this.sector.getColumns(), function(t){
//             return !!_.find(t.subgroups, function(tt){return tt==_ssSlug;})
//         });
//     };
//     function Indicator(sector, opts) {
//         this.sector = sector;
//         _.extend(this, opts);
//     }
//     Indicator.prototype.customIconForItem = function(item) {
//         return [this.iconify_png_url+item[this.slug]+".png", 32, 24];
//     }
//     function init(_sectors, opts) {
//         if(!!opts && !!opts['default']) {
//             defaultSector = new Sector(_.extend(opts['default'], {'default': true}));
//         }
//         sectors = _(_sectors).chain()
//                         .clone()
//                         .map(function(s){return new Sector(_.extend({}, s));})
//                         .value();
//         return true;
//     }
//     function clear() {
//         sectors = [];
//     }
//     function pluck(slug) {
//         return _(sectors).chain()
//                 .filter(function(s){return s.slug == slug;})
//                 .first()
//                 .value() || defaultSector;
//     }
//     function all() {
//         return sectors;
//     }
//     function validate() {
//         if(!sectors instanceof Array)
//             warn("Sectors must be defined as an array");
//         if(sectors.length===0)
//             warn("Sectors array is empty");
//         _.each(sectors, function(sector){
//             if(sector.name === undefined) { warn("Sector name must be defined."); }
//             if(sector.slug === undefined) { warn("Sector slug must be defined."); }
//         });
//         var slugs = _(sectors).pluck('slug');
//         if(slugs.length !== _(slugs).uniq().length) {
//             warn("Sector slugs must not be reused");
//         }
//         // $(this.columns).each(function(i, val){
//         //   var name = val.name;
//         //   var slug = val.slug;
//         //   name === undefined && warn("Each column needs a slug", this);
//         //   slug === undefined && warn("Each column needs a name", this);
//         // });
//         return true;
//     }
//     function slugs() {
//         return _.pluck(sectors, 'slug');
//     }
//     return {
//         init: init,
//         pluck: pluck,
//         slugs: slugs,
//         all: all,
//         validate: validate,
//         clear: clear
//     };
// })();
// NMIS.Sectors = Sectors;
// })();


(function(){
    var data, opts;

    //uses: data, opts
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

    //uses: NMIS.Sectors
    NMIS.loadSectors = function(_sectors, opts){
        NMIS.Sectors.init(_sectors, opts);
    }

    //uses: data
    NMIS.loadFacilities = function(_data, opts) {
        _.each(_data, function(val, key){
            var id = val._id || key;
            data[id] = cloneParse(val);
        });
    }

    //uses: data
    NMIS.clear = function() {
        data = [];
        NMIS.Sectors.clear();
    }

    //uses: NMIS.Sectors, data
    NMIS.validateData = function() {
        NMIS.Sectors.validate();
        _(data).each(function(datum){
          if(datum._uid === undefined) {
              datum._uid = _.uniqueId('fp');
          }
        });
        _(data).each(function(datum){
          if(datum._latlng === undefined && datum.gps !== undefined) {
              var llArr = datum.gps.split(' ');
              datum._latlng = [ llArr[0], llArr[1] ];
          }
        });
        return true;
    }

    //uses: _s
    var _s;
    NMIS.activeSector = function (s) {
        if(s===undefined) {
            return _s;
        } else {
            _s = s;
        }
    }

    //uses: NMIS.Sectors
    function cloneParse(d) {
      var datum = _.clone(d);
    	if(datum.gps===undefined) {
    	    datum._ll = false;
    	} else {
    	    var ll = datum.gps.split(' ');
    	    datum._ll = [ll[0], ll[1]];
    	}
    	var sslug = datum.sector.toLowerCase();
    	datum.sector = NMIS.Sectors.pluck(sslug);
    	return datum;
    }

    //uses: NMIS.Sectors, data
    NMIS.dataForSector = function(sectorSlug) {
        var sector = NMIS.Sectors.pluck(sectorSlug);
        return _(data).filter(function(datum, id){
            return datum.sector.slug === sector.slug;
        });
    }

    //uses: NMIS.Sectors, data
    NMIS.dataObjForSector = function(sectorSlug) {
        var sector = NMIS.Sectors.pluck(sectorSlug);
        var o = {};
        _(data).each(function(datum, id){
            if(datum.sector.slug === sector.slug) {
                o[id] = datum;
            }
        });
        return o;
    }

    //uses: data
    NMIS.data = function(){
      return data;
    };
})();
