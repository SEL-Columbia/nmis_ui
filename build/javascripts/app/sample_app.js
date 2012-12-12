(function() {

  $(".url-for").each(function() {
    var d;
    d = $(this).data("urlFor");
    return $(this).attr("href", NMIS.urlFor(_.extend({
      lga: lga.slug,
      state: state.slug
    }, d)));
  });

  NMIS.Breadcrumb.init("p.bc", {
    levels: []
  });

  this.dashboard.get("/", function() {
    return this.redirect("" + NMIS.url_root + "#/" + NMIS._districts_[0].url_code);
  });

}).call(this);
