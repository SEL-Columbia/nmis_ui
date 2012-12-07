(function() {
  var env;

  $(".url-for").each(function() {
    var d;
    d = $(this).data("urlFor");
    return $(this).attr("href", NMIS.urlFor(_.extend({
      lga: lga.slug,
      state: state.slug
    }, d)));
  });

  env = {
    root: "" + NMIS.url_root + "#",
    state: state,
    lga: lga
  };

  NMIS.Breadcrumb.init("p.bc", {
    levels: [[state.name, env.root], [lga.name, ("" + NMIS.url_root + "#/") + state.slug + "/" + lga.slug + "/"]]
  });

  /*
  Run the app.
  */


  dashboard.run();

}).call(this);
