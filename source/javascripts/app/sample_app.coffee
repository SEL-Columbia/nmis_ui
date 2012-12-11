$(".url-for").each ->
  d = $(this).data("urlFor")
  $(this).attr "href", NMIS.urlFor(_.extend(
    lga: lga.slug
    state: state.slug
  , d))

env =
  root: "#{NMIS.url_root}#"
  state: state
  lga: lga

NMIS.Breadcrumb.init "p.bc",
  levels: [[state.name, env.root], [lga.name, "#{NMIS.url_root}#/" + state.slug + "/" + lga.slug + "/"]]
