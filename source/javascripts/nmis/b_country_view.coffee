do ->
  activateNavigation = (wrap)->
    navId = "#zone-navigation"
    unless wrap.hasClass("zone-nav-activated")
      wrap.on "click", "#{navId} a.state-link", (evt)->
        ul = $(@).parents("li").eq(0).find("ul")
        isShowing = ul.hasClass "showing"
        wrap.find("#{navId} .showing").removeClass("showing")
        ul.addClass "showing" unless isShowing
        false
    wrap.addClass "zone-nav-activated"

  cvp = false
  countryViewPanel = ()->
    wrap = $(".content")
    unless cvp
      cvp = $("<div>", class: "country-view")
      activateNavigation wrap
    if cvp.closest("html").length is 0
      cvp.appendTo(".content")
    cvp

  panelOpen = ()->
    NMIS.LocalNav.hide()
    data =
      title: "Nigeria"
      zones: NMIS._zones_
    countryViewPanel().html $._template "#country-view-tmpl", data
    # cvp.find("#map").hide()

  panelClose = ()->
    countryViewPanel().detach()

  NMIS.panels.getPanel("country_view").addCallbacks open: panelOpen, close: panelClose

do ->
  NMIS.CountryView = ()->
    NMIS.panels.changePanel "country_view"
