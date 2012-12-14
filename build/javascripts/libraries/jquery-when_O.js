(function() {

  $.when_O = function(arg_O) {
    /*
      When handling multiple $.Defferreds,
    
      $.when(...) receives a list and then passes
      a list of arguments.
    
      This mini plugin receives an object of named deferreds
      and resolves with an object with the results.
    
      Example:
    
      var shows = {
        "simpsons": $.getJSON(simpsons_shows),
        "southPark": $.getJSON(southpark_shows)
      };
    
      $.when_O(shows).done(function(showResults){
        var showNames = [];
        if(showResults.familyGuy) showNames.push("Family Guy")
        if(showResults.simpsons) showNames.push("Simpsons")
        if(showResults.southPark) showNames.push("South Park")
    
        console.log(showNames);
        //  ["Simpsons", "South Park"]
      });
    */

    var defferred, finished, key, promises, val;
    defferred = new $.Deferred;
    promises = [];
    finished = {};
    for (key in arg_O) {
      val = arg_O[key];
      promises.push(val);
      finished[key] = false;
    }
    $.when.apply(null, promises).done(function() {
      var results, _results;
      results = {};
      _results = [];
      for (key in arg_O) {
        val = arg_O[key];
        /*
              in $.getJSON, for example, I want to access the parsedJSON object so
              I don't want to finish everything until all success callback have been
              called.
        */

        _results.push((function() {
          var local_key;
          local_key = key;
          return val.done(function(result) {
            var completed, fin, k;
            finished[local_key] = true;
            results[local_key] = result;
            /*
                      Continue iff all are finished.
            */

            completed = true;
            for (k in finished) {
              fin = finished[k];
              if (!fin) {
                completed = false;
              }
            }
            if (completed) {
              return defferred.resolve(results);
            }
          });
        })());
      }
      return _results;
    });
    return defferred;
  };

}).call(this);
