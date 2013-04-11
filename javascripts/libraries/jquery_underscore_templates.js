
/*
$._template is a shorthand used to combine jquery and underscore-templating to make it quick
and easy-to-build templates.

These two lines are roughly equivalent:
  $._template("#name-template-id", {name:"Alex"}, options)
  _.template($("#name-template-id").html(), {name:"Alex"}, options)

This would expect that you have something like this in the page:
  <script type='text/template' id='name-template-id'>
    <h1>Hello, <%= name %>!</h1>
  </script>
*/


(function() {
  var check_for_required, dom_is_ready, needs_check_for_required, required_templates, _get_template, _template, _templates,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _templates = {};

  _get_template = function(selector) {
    var q;
    q = $(selector);
    if (q.length === 0) {
      throw new Error("Attention: '" + selector + "' template does not exist.");
    }
    return q.html();
  };

  _template = function(selector, data, options) {
    if (data == null) {
      data = {};
    }
    if (options == null) {
      options = {};
    }
    _templates[selector] || (_templates[selector] = _get_template(selector));
    return _.template(_templates[selector], data, options);
  };

  $._template = _template;

  /*
  The $._template.require function allows you to write code that depends on
  a given template being loaded into the page.
  
  Its use is optional.
  It would be convenient for preparing for edge cases.
  */


  required_templates = [];

  dom_is_ready = false;

  needs_check_for_required = false;

  _template.require = function(templates) {
    var tname, _i, _len;
    needs_check_for_required = true;
    if (!(templates instanceof Array)) {
      templates = [templates];
    }
    for (_i = 0, _len = templates.length; _i < _len; _i++) {
      tname = templates[_i];
      if (__indexOf.call(required_templates, tname) < 0) {
        required_templates.push(tname);
      }
    }
    if (dom_is_ready) {
      return check_for_required();
    }
  };

  check_for_required = function() {
    var missing_templates, tid, _i, _len;
    missing_templates = [];
    for (_i = 0, _len = required_templates.length; _i < _len; _i++) {
      tid = required_templates[_i];
      if ($(tid).length === 0) {
        missing_templates.push(tid);
      }
    }
    if ($(tid).length === 0) {
      throw new Error("Attention: " + missing_templates.length + " missing template(s): '" + (missing_templates.join(', ')) + "'");
    }
  };

  $(function() {
    dom_is_ready = true;
    if (needs_check_for_required) {
      return _.defer(check_for_required);
    }
  });

}).call(this);
