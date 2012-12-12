$(".url-for").each ->
  d = $(this).data("urlFor")
  $(this).attr "href", NMIS.urlFor(_.extend(
    lga: lga.slug
    state: state.slug
  , d))

# env =
#   root: "#{NMIS.url_root}#"
#   state: state
#   lga: lga
NMIS.Breadcrumb.init "p.bc",
  levels: []

@dashboard.get "/", ()->
  @redirect "#{NMIS.url_root}#/#{NMIS._districts_[0].url_code}"
