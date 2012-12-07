//= require "jasmine/jasmine"
//= require "jasmine/jasmine-html"
//= require_tree "./spec_data"
//= require_tree "./spec"

// Take a look at this page to learn about jasmine testing with coffeescript
//  ## http://coffeescriptcookbook.com/chapters/testing/testing_with_jasmine

// one can modify tests in this file (for example):
//  ## source/javascripts/spec/common.js.coffee

(function() {
  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.updateInterval = 1000;

  var htmlReporter = new jasmine.HtmlReporter();

  jasmineEnv.addReporter(htmlReporter);

  jasmineEnv.specFilter = function(spec) {
    return htmlReporter.specFilter(spec);
  };

  var currentWindowOnload = window.onload;

  window.onload = function() {
    if (currentWindowOnload) {
      currentWindowOnload();
    }
    execJasmine();
  };

  function execJasmine() {
    jasmineEnv.execute();
  }

})();