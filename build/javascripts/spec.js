var isCommonJS = typeof window == "undefined" && typeof exports == "object";

/**
 * Top level namespace for Jasmine, a lightweight JavaScript BDD/spec/testing framework.
 *
 * @namespace
 */
var jasmine = {};
if (isCommonJS) exports.jasmine = jasmine;
/**
 * @private
 */
jasmine.unimplementedMethod_ = function() {
  throw new Error("unimplemented method");
};

/**
 * Use <code>jasmine.undefined</code> instead of <code>undefined</code>, since <code>undefined</code> is just
 * a plain old variable and may be redefined by somebody else.
 *
 * @private
 */
jasmine.undefined = jasmine.___undefined___;

/**
 * Show diagnostic messages in the console if set to true
 *
 */
jasmine.VERBOSE = false;

/**
 * Default interval in milliseconds for event loop yields (e.g. to allow network activity or to refresh the screen with the HTML-based runner). Small values here may result in slow test running. Zero means no updates until all tests have completed.
 *
 */
jasmine.DEFAULT_UPDATE_INTERVAL = 250;

/**
 * Default timeout interval in milliseconds for waitsFor() blocks.
 */
jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;

/**
 * By default exceptions thrown in the context of a test are caught by jasmine so that it can run the remaining tests in the suite.
 * Set to false to let the exception bubble up in the browser.
 *
 */
jasmine.CATCH_EXCEPTIONS = true;

jasmine.getGlobal = function() {
  function getGlobal() {
    return this;
  }

  return getGlobal();
};

/**
 * Allows for bound functions to be compared.  Internal use only.
 *
 * @ignore
 * @private
 * @param base {Object} bound 'this' for the function
 * @param name {Function} function to find
 */
jasmine.bindOriginal_ = function(base, name) {
  var original = base[name];
  if (original.apply) {
    return function() {
      return original.apply(base, arguments);
    };
  } else {
    // IE support
    return jasmine.getGlobal()[name];
  }
};

jasmine.setTimeout = jasmine.bindOriginal_(jasmine.getGlobal(), 'setTimeout');
jasmine.clearTimeout = jasmine.bindOriginal_(jasmine.getGlobal(), 'clearTimeout');
jasmine.setInterval = jasmine.bindOriginal_(jasmine.getGlobal(), 'setInterval');
jasmine.clearInterval = jasmine.bindOriginal_(jasmine.getGlobal(), 'clearInterval');

jasmine.MessageResult = function(values) {
  this.type = 'log';
  this.values = values;
  this.trace = new Error(); // todo: test better
};

jasmine.MessageResult.prototype.toString = function() {
  var text = "";
  for (var i = 0; i < this.values.length; i++) {
    if (i > 0) text += " ";
    if (jasmine.isString_(this.values[i])) {
      text += this.values[i];
    } else {
      text += jasmine.pp(this.values[i]);
    }
  }
  return text;
};

jasmine.ExpectationResult = function(params) {
  this.type = 'expect';
  this.matcherName = params.matcherName;
  this.passed_ = params.passed;
  this.expected = params.expected;
  this.actual = params.actual;
  this.message = this.passed_ ? 'Passed.' : params.message;

  var trace = (params.trace || new Error(this.message));
  this.trace = this.passed_ ? '' : trace;
};

jasmine.ExpectationResult.prototype.toString = function () {
  return this.message;
};

jasmine.ExpectationResult.prototype.passed = function () {
  return this.passed_;
};

/**
 * Getter for the Jasmine environment. Ensures one gets created
 */
jasmine.getEnv = function() {
  var env = jasmine.currentEnv_ = jasmine.currentEnv_ || new jasmine.Env();
  return env;
};

/**
 * @ignore
 * @private
 * @param value
 * @returns {Boolean}
 */
jasmine.isArray_ = function(value) {
  return jasmine.isA_("Array", value);
};

/**
 * @ignore
 * @private
 * @param value
 * @returns {Boolean}
 */
jasmine.isString_ = function(value) {
  return jasmine.isA_("String", value);
};

/**
 * @ignore
 * @private
 * @param value
 * @returns {Boolean}
 */
jasmine.isNumber_ = function(value) {
  return jasmine.isA_("Number", value);
};

/**
 * @ignore
 * @private
 * @param {String} typeName
 * @param value
 * @returns {Boolean}
 */
jasmine.isA_ = function(typeName, value) {
  return Object.prototype.toString.apply(value) === '[object ' + typeName + ']';
};

/**
 * Pretty printer for expecations.  Takes any object and turns it into a human-readable string.
 *
 * @param value {Object} an object to be outputted
 * @returns {String}
 */
jasmine.pp = function(value) {
  var stringPrettyPrinter = new jasmine.StringPrettyPrinter();
  stringPrettyPrinter.format(value);
  return stringPrettyPrinter.string;
};

/**
 * Returns true if the object is a DOM Node.
 *
 * @param {Object} obj object to check
 * @returns {Boolean}
 */
jasmine.isDomNode = function(obj) {
  return obj.nodeType > 0;
};

/**
 * Returns a matchable 'generic' object of the class type.  For use in expecations of type when values don't matter.
 *
 * @example
 * // don't care about which function is passed in, as long as it's a function
 * expect(mySpy).toHaveBeenCalledWith(jasmine.any(Function));
 *
 * @param {Class} clazz
 * @returns matchable object of the type clazz
 */
jasmine.any = function(clazz) {
  return new jasmine.Matchers.Any(clazz);
};

/**
 * Returns a matchable subset of a JSON object. For use in expectations when you don't care about all of the
 * attributes on the object.
 *
 * @example
 * // don't care about any other attributes than foo.
 * expect(mySpy).toHaveBeenCalledWith(jasmine.objectContaining({foo: "bar"});
 *
 * @param sample {Object} sample
 * @returns matchable object for the sample
 */
jasmine.objectContaining = function (sample) {
    return new jasmine.Matchers.ObjectContaining(sample);
};

/**
 * Jasmine Spies are test doubles that can act as stubs, spies, fakes or when used in an expecation, mocks.
 *
 * Spies should be created in test setup, before expectations.  They can then be checked, using the standard Jasmine
 * expectation syntax. Spies can be checked if they were called or not and what the calling params were.
 *
 * A Spy has the following fields: wasCalled, callCount, mostRecentCall, and argsForCall (see docs).
 *
 * Spies are torn down at the end of every spec.
 *
 * Note: Do <b>not</b> call new jasmine.Spy() directly - a spy must be created using spyOn, jasmine.createSpy or jasmine.createSpyObj.
 *
 * @example
 * // a stub
 * var myStub = jasmine.createSpy('myStub');  // can be used anywhere
 *
 * // spy example
 * var foo = {
 *   not: function(bool) { return !bool; }
 * }
 *
 * // actual foo.not will not be called, execution stops
 * spyOn(foo, 'not');

 // foo.not spied upon, execution will continue to implementation
 * spyOn(foo, 'not').andCallThrough();
 *
 * // fake example
 * var foo = {
 *   not: function(bool) { return !bool; }
 * }
 *
 * // foo.not(val) will return val
 * spyOn(foo, 'not').andCallFake(function(value) {return value;});
 *
 * // mock example
 * foo.not(7 == 7);
 * expect(foo.not).toHaveBeenCalled();
 * expect(foo.not).toHaveBeenCalledWith(true);
 *
 * @constructor
 * @see spyOn, jasmine.createSpy, jasmine.createSpyObj
 * @param {String} name
 */
jasmine.Spy = function(name) {
  /**
   * The name of the spy, if provided.
   */
  this.identity = name || 'unknown';
  /**
   *  Is this Object a spy?
   */
  this.isSpy = true;
  /**
   * The actual function this spy stubs.
   */
  this.plan = function() {
  };
  /**
   * Tracking of the most recent call to the spy.
   * @example
   * var mySpy = jasmine.createSpy('foo');
   * mySpy(1, 2);
   * mySpy.mostRecentCall.args = [1, 2];
   */
  this.mostRecentCall = {};

  /**
   * Holds arguments for each call to the spy, indexed by call count
   * @example
   * var mySpy = jasmine.createSpy('foo');
   * mySpy(1, 2);
   * mySpy(7, 8);
   * mySpy.mostRecentCall.args = [7, 8];
   * mySpy.argsForCall[0] = [1, 2];
   * mySpy.argsForCall[1] = [7, 8];
   */
  this.argsForCall = [];
  this.calls = [];
};

/**
 * Tells a spy to call through to the actual implemenatation.
 *
 * @example
 * var foo = {
 *   bar: function() { // do some stuff }
 * }
 *
 * // defining a spy on an existing property: foo.bar
 * spyOn(foo, 'bar').andCallThrough();
 */
jasmine.Spy.prototype.andCallThrough = function() {
  this.plan = this.originalValue;
  return this;
};

/**
 * For setting the return value of a spy.
 *
 * @example
 * // defining a spy from scratch: foo() returns 'baz'
 * var foo = jasmine.createSpy('spy on foo').andReturn('baz');
 *
 * // defining a spy on an existing property: foo.bar() returns 'baz'
 * spyOn(foo, 'bar').andReturn('baz');
 *
 * @param {Object} value
 */
jasmine.Spy.prototype.andReturn = function(value) {
  this.plan = function() {
    return value;
  };
  return this;
};

/**
 * For throwing an exception when a spy is called.
 *
 * @example
 * // defining a spy from scratch: foo() throws an exception w/ message 'ouch'
 * var foo = jasmine.createSpy('spy on foo').andThrow('baz');
 *
 * // defining a spy on an existing property: foo.bar() throws an exception w/ message 'ouch'
 * spyOn(foo, 'bar').andThrow('baz');
 *
 * @param {String} exceptionMsg
 */
jasmine.Spy.prototype.andThrow = function(exceptionMsg) {
  this.plan = function() {
    throw exceptionMsg;
  };
  return this;
};

/**
 * Calls an alternate implementation when a spy is called.
 *
 * @example
 * var baz = function() {
 *   // do some stuff, return something
 * }
 * // defining a spy from scratch: foo() calls the function baz
 * var foo = jasmine.createSpy('spy on foo').andCall(baz);
 *
 * // defining a spy on an existing property: foo.bar() calls an anonymnous function
 * spyOn(foo, 'bar').andCall(function() { return 'baz';} );
 *
 * @param {Function} fakeFunc
 */
jasmine.Spy.prototype.andCallFake = function(fakeFunc) {
  this.plan = fakeFunc;
  return this;
};

/**
 * Resets all of a spy's the tracking variables so that it can be used again.
 *
 * @example
 * spyOn(foo, 'bar');
 *
 * foo.bar();
 *
 * expect(foo.bar.callCount).toEqual(1);
 *
 * foo.bar.reset();
 *
 * expect(foo.bar.callCount).toEqual(0);
 */
jasmine.Spy.prototype.reset = function() {
  this.wasCalled = false;
  this.callCount = 0;
  this.argsForCall = [];
  this.calls = [];
  this.mostRecentCall = {};
};

jasmine.createSpy = function(name) {

  var spyObj = function() {
    spyObj.wasCalled = true;
    spyObj.callCount++;
    var args = jasmine.util.argsToArray(arguments);
    spyObj.mostRecentCall.object = this;
    spyObj.mostRecentCall.args = args;
    spyObj.argsForCall.push(args);
    spyObj.calls.push({object: this, args: args});
    return spyObj.plan.apply(this, arguments);
  };

  var spy = new jasmine.Spy(name);

  for (var prop in spy) {
    spyObj[prop] = spy[prop];
  }

  spyObj.reset();

  return spyObj;
};

/**
 * Determines whether an object is a spy.
 *
 * @param {jasmine.Spy|Object} putativeSpy
 * @returns {Boolean}
 */
jasmine.isSpy = function(putativeSpy) {
  return putativeSpy && putativeSpy.isSpy;
};

/**
 * Creates a more complicated spy: an Object that has every property a function that is a spy.  Used for stubbing something
 * large in one call.
 *
 * @param {String} baseName name of spy class
 * @param {Array} methodNames array of names of methods to make spies
 */
jasmine.createSpyObj = function(baseName, methodNames) {
  if (!jasmine.isArray_(methodNames) || methodNames.length === 0) {
    throw new Error('createSpyObj requires a non-empty array of method names to create spies for');
  }
  var obj = {};
  for (var i = 0; i < methodNames.length; i++) {
    obj[methodNames[i]] = jasmine.createSpy(baseName + '.' + methodNames[i]);
  }
  return obj;
};

/**
 * All parameters are pretty-printed and concatenated together, then written to the current spec's output.
 *
 * Be careful not to leave calls to <code>jasmine.log</code> in production code.
 */
jasmine.log = function() {
  var spec = jasmine.getEnv().currentSpec;
  spec.log.apply(spec, arguments);
};

/**
 * Function that installs a spy on an existing object's method name.  Used within a Spec to create a spy.
 *
 * @example
 * // spy example
 * var foo = {
 *   not: function(bool) { return !bool; }
 * }
 * spyOn(foo, 'not'); // actual foo.not will not be called, execution stops
 *
 * @see jasmine.createSpy
 * @param obj
 * @param methodName
 * @returns a Jasmine spy that can be chained with all spy methods
 */
var spyOn = function(obj, methodName) {
  return jasmine.getEnv().currentSpec.spyOn(obj, methodName);
};
if (isCommonJS) exports.spyOn = spyOn;

/**
 * Creates a Jasmine spec that will be added to the current suite.
 *
 * // TODO: pending tests
 *
 * @example
 * it('should be true', function() {
 *   expect(true).toEqual(true);
 * });
 *
 * @param {String} desc description of this specification
 * @param {Function} func defines the preconditions and expectations of the spec
 */
var it = function(desc, func) {
  return jasmine.getEnv().it(desc, func);
};
if (isCommonJS) exports.it = it;

/**
 * Creates a <em>disabled</em> Jasmine spec.
 *
 * A convenience method that allows existing specs to be disabled temporarily during development.
 *
 * @param {String} desc description of this specification
 * @param {Function} func defines the preconditions and expectations of the spec
 */
var xit = function(desc, func) {
  return jasmine.getEnv().xit(desc, func);
};
if (isCommonJS) exports.xit = xit;

/**
 * Starts a chain for a Jasmine expectation.
 *
 * It is passed an Object that is the actual value and should chain to one of the many
 * jasmine.Matchers functions.
 *
 * @param {Object} actual Actual value to test against and expected value
 */
var expect = function(actual) {
  return jasmine.getEnv().currentSpec.expect(actual);
};
if (isCommonJS) exports.expect = expect;

/**
 * Defines part of a jasmine spec.  Used in cominbination with waits or waitsFor in asynchrnous specs.
 *
 * @param {Function} func Function that defines part of a jasmine spec.
 */
var runs = function(func) {
  jasmine.getEnv().currentSpec.runs(func);
};
if (isCommonJS) exports.runs = runs;

/**
 * Waits a fixed time period before moving to the next block.
 *
 * @deprecated Use waitsFor() instead
 * @param {Number} timeout milliseconds to wait
 */
var waits = function(timeout) {
  jasmine.getEnv().currentSpec.waits(timeout);
};
if (isCommonJS) exports.waits = waits;

/**
 * Waits for the latchFunction to return true before proceeding to the next block.
 *
 * @param {Function} latchFunction
 * @param {String} optional_timeoutMessage
 * @param {Number} optional_timeout
 */
var waitsFor = function(latchFunction, optional_timeoutMessage, optional_timeout) {
  jasmine.getEnv().currentSpec.waitsFor.apply(jasmine.getEnv().currentSpec, arguments);
};
if (isCommonJS) exports.waitsFor = waitsFor;

/**
 * A function that is called before each spec in a suite.
 *
 * Used for spec setup, including validating assumptions.
 *
 * @param {Function} beforeEachFunction
 */
var beforeEach = function(beforeEachFunction) {
  jasmine.getEnv().beforeEach(beforeEachFunction);
};
if (isCommonJS) exports.beforeEach = beforeEach;

/**
 * A function that is called after each spec in a suite.
 *
 * Used for restoring any state that is hijacked during spec execution.
 *
 * @param {Function} afterEachFunction
 */
var afterEach = function(afterEachFunction) {
  jasmine.getEnv().afterEach(afterEachFunction);
};
if (isCommonJS) exports.afterEach = afterEach;

/**
 * Defines a suite of specifications.
 *
 * Stores the description and all defined specs in the Jasmine environment as one suite of specs. Variables declared
 * are accessible by calls to beforeEach, it, and afterEach. Describe blocks can be nested, allowing for specialization
 * of setup in some tests.
 *
 * @example
 * // TODO: a simple suite
 *
 * // TODO: a simple suite with a nested describe block
 *
 * @param {String} description A string, usually the class under test.
 * @param {Function} specDefinitions function that defines several specs.
 */
var describe = function(description, specDefinitions) {
  return jasmine.getEnv().describe(description, specDefinitions);
};
if (isCommonJS) exports.describe = describe;

/**
 * Disables a suite of specifications.  Used to disable some suites in a file, or files, temporarily during development.
 *
 * @param {String} description A string, usually the class under test.
 * @param {Function} specDefinitions function that defines several specs.
 */
var xdescribe = function(description, specDefinitions) {
  return jasmine.getEnv().xdescribe(description, specDefinitions);
};
if (isCommonJS) exports.xdescribe = xdescribe;


// Provide the XMLHttpRequest class for IE 5.x-6.x:
jasmine.XmlHttpRequest = (typeof XMLHttpRequest == "undefined") ? function() {
  function tryIt(f) {
    try {
      return f();
    } catch(e) {
    }
    return null;
  }

  var xhr = tryIt(function() {
    return new ActiveXObject("Msxml2.XMLHTTP.6.0");
  }) ||
    tryIt(function() {
      return new ActiveXObject("Msxml2.XMLHTTP.3.0");
    }) ||
    tryIt(function() {
      return new ActiveXObject("Msxml2.XMLHTTP");
    }) ||
    tryIt(function() {
      return new ActiveXObject("Microsoft.XMLHTTP");
    });

  if (!xhr) throw new Error("This browser does not support XMLHttpRequest.");

  return xhr;
} : XMLHttpRequest;
/**
 * @namespace
 */
jasmine.util = {};

/**
 * Declare that a child class inherit it's prototype from the parent class.
 *
 * @private
 * @param {Function} childClass
 * @param {Function} parentClass
 */
jasmine.util.inherit = function(childClass, parentClass) {
  /**
   * @private
   */
  var subclass = function() {
  };
  subclass.prototype = parentClass.prototype;
  childClass.prototype = new subclass();
};

jasmine.util.formatException = function(e) {
  var lineNumber;
  if (e.line) {
    lineNumber = e.line;
  }
  else if (e.lineNumber) {
    lineNumber = e.lineNumber;
  }

  var file;

  if (e.sourceURL) {
    file = e.sourceURL;
  }
  else if (e.fileName) {
    file = e.fileName;
  }

  var message = (e.name && e.message) ? (e.name + ': ' + e.message) : e.toString();

  if (file && lineNumber) {
    message += ' in ' + file + ' (line ' + lineNumber + ')';
  }

  return message;
};

jasmine.util.htmlEscape = function(str) {
  if (!str) return str;
  return str.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

jasmine.util.argsToArray = function(args) {
  var arrayOfArgs = [];
  for (var i = 0; i < args.length; i++) arrayOfArgs.push(args[i]);
  return arrayOfArgs;
};

jasmine.util.extend = function(destination, source) {
  for (var property in source) destination[property] = source[property];
  return destination;
};

/**
 * Environment for Jasmine
 *
 * @constructor
 */
jasmine.Env = function() {
  this.currentSpec = null;
  this.currentSuite = null;
  this.currentRunner_ = new jasmine.Runner(this);

  this.reporter = new jasmine.MultiReporter();

  this.updateInterval = jasmine.DEFAULT_UPDATE_INTERVAL;
  this.defaultTimeoutInterval = jasmine.DEFAULT_TIMEOUT_INTERVAL;
  this.lastUpdate = 0;
  this.specFilter = function() {
    return true;
  };

  this.nextSpecId_ = 0;
  this.nextSuiteId_ = 0;
  this.equalityTesters_ = [];

  // wrap matchers
  this.matchersClass = function() {
    jasmine.Matchers.apply(this, arguments);
  };
  jasmine.util.inherit(this.matchersClass, jasmine.Matchers);

  jasmine.Matchers.wrapInto_(jasmine.Matchers.prototype, this.matchersClass);
};


jasmine.Env.prototype.setTimeout = jasmine.setTimeout;
jasmine.Env.prototype.clearTimeout = jasmine.clearTimeout;
jasmine.Env.prototype.setInterval = jasmine.setInterval;
jasmine.Env.prototype.clearInterval = jasmine.clearInterval;

/**
 * @returns an object containing jasmine version build info, if set.
 */
jasmine.Env.prototype.version = function () {
  if (jasmine.version_) {
    return jasmine.version_;
  } else {
    throw new Error('Version not set');
  }
};

/**
 * @returns string containing jasmine version build info, if set.
 */
jasmine.Env.prototype.versionString = function() {
  if (!jasmine.version_) {
    return "version unknown";
  }

  var version = this.version();
  var versionString = version.major + "." + version.minor + "." + version.build;
  if (version.release_candidate) {
    versionString += ".rc" + version.release_candidate;
  }
  versionString += " revision " + version.revision;
  return versionString;
};

/**
 * @returns a sequential integer starting at 0
 */
jasmine.Env.prototype.nextSpecId = function () {
  return this.nextSpecId_++;
};

/**
 * @returns a sequential integer starting at 0
 */
jasmine.Env.prototype.nextSuiteId = function () {
  return this.nextSuiteId_++;
};

/**
 * Register a reporter to receive status updates from Jasmine.
 * @param {jasmine.Reporter} reporter An object which will receive status updates.
 */
jasmine.Env.prototype.addReporter = function(reporter) {
  this.reporter.addReporter(reporter);
};

jasmine.Env.prototype.execute = function() {
  this.currentRunner_.execute();
};

jasmine.Env.prototype.describe = function(description, specDefinitions) {
  var suite = new jasmine.Suite(this, description, specDefinitions, this.currentSuite);

  var parentSuite = this.currentSuite;
  if (parentSuite) {
    parentSuite.add(suite);
  } else {
    this.currentRunner_.add(suite);
  }

  this.currentSuite = suite;

  var declarationError = null;
  try {
    specDefinitions.call(suite);
  } catch(e) {
    declarationError = e;
  }

  if (declarationError) {
    this.it("encountered a declaration exception", function() {
      throw declarationError;
    });
  }

  this.currentSuite = parentSuite;

  return suite;
};

jasmine.Env.prototype.beforeEach = function(beforeEachFunction) {
  if (this.currentSuite) {
    this.currentSuite.beforeEach(beforeEachFunction);
  } else {
    this.currentRunner_.beforeEach(beforeEachFunction);
  }
};

jasmine.Env.prototype.currentRunner = function () {
  return this.currentRunner_;
};

jasmine.Env.prototype.afterEach = function(afterEachFunction) {
  if (this.currentSuite) {
    this.currentSuite.afterEach(afterEachFunction);
  } else {
    this.currentRunner_.afterEach(afterEachFunction);
  }

};

jasmine.Env.prototype.xdescribe = function(desc, specDefinitions) {
  return {
    execute: function() {
    }
  };
};

jasmine.Env.prototype.it = function(description, func) {
  var spec = new jasmine.Spec(this, this.currentSuite, description);
  this.currentSuite.add(spec);
  this.currentSpec = spec;

  if (func) {
    spec.runs(func);
  }

  return spec;
};

jasmine.Env.prototype.xit = function(desc, func) {
  return {
    id: this.nextSpecId(),
    runs: function() {
    }
  };
};

jasmine.Env.prototype.compareObjects_ = function(a, b, mismatchKeys, mismatchValues) {
  if (a.__Jasmine_been_here_before__ === b && b.__Jasmine_been_here_before__ === a) {
    return true;
  }

  a.__Jasmine_been_here_before__ = b;
  b.__Jasmine_been_here_before__ = a;

  var hasKey = function(obj, keyName) {
    return obj !== null && obj[keyName] !== jasmine.undefined;
  };

  for (var property in b) {
    if (!hasKey(a, property) && hasKey(b, property)) {
      mismatchKeys.push("expected has key '" + property + "', but missing from actual.");
    }
  }
  for (property in a) {
    if (!hasKey(b, property) && hasKey(a, property)) {
      mismatchKeys.push("expected missing key '" + property + "', but present in actual.");
    }
  }
  for (property in b) {
    if (property == '__Jasmine_been_here_before__') continue;
    if (!this.equals_(a[property], b[property], mismatchKeys, mismatchValues)) {
      mismatchValues.push("'" + property + "' was '" + (b[property] ? jasmine.util.htmlEscape(b[property].toString()) : b[property]) + "' in expected, but was '" + (a[property] ? jasmine.util.htmlEscape(a[property].toString()) : a[property]) + "' in actual.");
    }
  }

  if (jasmine.isArray_(a) && jasmine.isArray_(b) && a.length != b.length) {
    mismatchValues.push("arrays were not the same length");
  }

  delete a.__Jasmine_been_here_before__;
  delete b.__Jasmine_been_here_before__;
  return (mismatchKeys.length === 0 && mismatchValues.length === 0);
};

jasmine.Env.prototype.equals_ = function(a, b, mismatchKeys, mismatchValues) {
  mismatchKeys = mismatchKeys || [];
  mismatchValues = mismatchValues || [];

  for (var i = 0; i < this.equalityTesters_.length; i++) {
    var equalityTester = this.equalityTesters_[i];
    var result = equalityTester(a, b, this, mismatchKeys, mismatchValues);
    if (result !== jasmine.undefined) return result;
  }

  if (a === b) return true;

  if (a === jasmine.undefined || a === null || b === jasmine.undefined || b === null) {
    return (a == jasmine.undefined && b == jasmine.undefined);
  }

  if (jasmine.isDomNode(a) && jasmine.isDomNode(b)) {
    return a === b;
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() == b.getTime();
  }

  if (a.jasmineMatches) {
    return a.jasmineMatches(b);
  }

  if (b.jasmineMatches) {
    return b.jasmineMatches(a);
  }

  if (a instanceof jasmine.Matchers.ObjectContaining) {
    return a.matches(b);
  }

  if (b instanceof jasmine.Matchers.ObjectContaining) {
    return b.matches(a);
  }

  if (jasmine.isString_(a) && jasmine.isString_(b)) {
    return (a == b);
  }

  if (jasmine.isNumber_(a) && jasmine.isNumber_(b)) {
    return (a == b);
  }

  if (typeof a === "object" && typeof b === "object") {
    return this.compareObjects_(a, b, mismatchKeys, mismatchValues);
  }

  //Straight check
  return (a === b);
};

jasmine.Env.prototype.contains_ = function(haystack, needle) {
  if (jasmine.isArray_(haystack)) {
    for (var i = 0; i < haystack.length; i++) {
      if (this.equals_(haystack[i], needle)) return true;
    }
    return false;
  }
  return haystack.indexOf(needle) >= 0;
};

jasmine.Env.prototype.addEqualityTester = function(equalityTester) {
  this.equalityTesters_.push(equalityTester);
};
/** No-op base class for Jasmine reporters.
 *
 * @constructor
 */
jasmine.Reporter = function() {
};

//noinspection JSUnusedLocalSymbols
jasmine.Reporter.prototype.reportRunnerStarting = function(runner) {
};

//noinspection JSUnusedLocalSymbols
jasmine.Reporter.prototype.reportRunnerResults = function(runner) {
};

//noinspection JSUnusedLocalSymbols
jasmine.Reporter.prototype.reportSuiteResults = function(suite) {
};

//noinspection JSUnusedLocalSymbols
jasmine.Reporter.prototype.reportSpecStarting = function(spec) {
};

//noinspection JSUnusedLocalSymbols
jasmine.Reporter.prototype.reportSpecResults = function(spec) {
};

//noinspection JSUnusedLocalSymbols
jasmine.Reporter.prototype.log = function(str) {
};

/**
 * Blocks are functions with executable code that make up a spec.
 *
 * @constructor
 * @param {jasmine.Env} env
 * @param {Function} func
 * @param {jasmine.Spec} spec
 */
jasmine.Block = function(env, func, spec) {
  this.env = env;
  this.func = func;
  this.spec = spec;
};

jasmine.Block.prototype.execute = function(onComplete) {
  if (!jasmine.CATCH_EXCEPTIONS) {
    this.func.apply(this.spec);
  }
  else {
    try {
      this.func.apply(this.spec);
    } catch (e) {
      this.spec.fail(e);
    }
  }
  onComplete();
};
/** JavaScript API reporter.
 *
 * @constructor
 */
jasmine.JsApiReporter = function() {
  this.started = false;
  this.finished = false;
  this.suites_ = [];
  this.results_ = {};
};

jasmine.JsApiReporter.prototype.reportRunnerStarting = function(runner) {
  this.started = true;
  var suites = runner.topLevelSuites();
  for (var i = 0; i < suites.length; i++) {
    var suite = suites[i];
    this.suites_.push(this.summarize_(suite));
  }
};

jasmine.JsApiReporter.prototype.suites = function() {
  return this.suites_;
};

jasmine.JsApiReporter.prototype.summarize_ = function(suiteOrSpec) {
  var isSuite = suiteOrSpec instanceof jasmine.Suite;
  var summary = {
    id: suiteOrSpec.id,
    name: suiteOrSpec.description,
    type: isSuite ? 'suite' : 'spec',
    children: []
  };
  
  if (isSuite) {
    var children = suiteOrSpec.children();
    for (var i = 0; i < children.length; i++) {
      summary.children.push(this.summarize_(children[i]));
    }
  }
  return summary;
};

jasmine.JsApiReporter.prototype.results = function() {
  return this.results_;
};

jasmine.JsApiReporter.prototype.resultsForSpec = function(specId) {
  return this.results_[specId];
};

//noinspection JSUnusedLocalSymbols
jasmine.JsApiReporter.prototype.reportRunnerResults = function(runner) {
  this.finished = true;
};

//noinspection JSUnusedLocalSymbols
jasmine.JsApiReporter.prototype.reportSuiteResults = function(suite) {
};

//noinspection JSUnusedLocalSymbols
jasmine.JsApiReporter.prototype.reportSpecResults = function(spec) {
  this.results_[spec.id] = {
    messages: spec.results().getItems(),
    result: spec.results().failedCount > 0 ? "failed" : "passed"
  };
};

//noinspection JSUnusedLocalSymbols
jasmine.JsApiReporter.prototype.log = function(str) {
};

jasmine.JsApiReporter.prototype.resultsForSpecs = function(specIds){
  var results = {};
  for (var i = 0; i < specIds.length; i++) {
    var specId = specIds[i];
    results[specId] = this.summarizeResult_(this.results_[specId]);
  }
  return results;
};

jasmine.JsApiReporter.prototype.summarizeResult_ = function(result){
  var summaryMessages = [];
  var messagesLength = result.messages.length;
  for (var messageIndex = 0; messageIndex < messagesLength; messageIndex++) {
    var resultMessage = result.messages[messageIndex];
    summaryMessages.push({
      text: resultMessage.type == 'log' ? resultMessage.toString() : jasmine.undefined,
      passed: resultMessage.passed ? resultMessage.passed() : true,
      type: resultMessage.type,
      message: resultMessage.message,
      trace: {
        stack: resultMessage.passed && !resultMessage.passed() ? resultMessage.trace.stack : jasmine.undefined
      }
    });
  }

  return {
    result : result.result,
    messages : summaryMessages
  };
};

/**
 * @constructor
 * @param {jasmine.Env} env
 * @param actual
 * @param {jasmine.Spec} spec
 */
jasmine.Matchers = function(env, actual, spec, opt_isNot) {
  this.env = env;
  this.actual = actual;
  this.spec = spec;
  this.isNot = opt_isNot || false;
  this.reportWasCalled_ = false;
};

// todo: @deprecated as of Jasmine 0.11, remove soon [xw]
jasmine.Matchers.pp = function(str) {
  throw new Error("jasmine.Matchers.pp() is no longer supported, please use jasmine.pp() instead!");
};

// todo: @deprecated Deprecated as of Jasmine 0.10. Rewrite your custom matchers to return true or false. [xw]
jasmine.Matchers.prototype.report = function(result, failing_message, details) {
  throw new Error("As of jasmine 0.11, custom matchers must be implemented differently -- please see jasmine docs");
};

jasmine.Matchers.wrapInto_ = function(prototype, matchersClass) {
  for (var methodName in prototype) {
    if (methodName == 'report') continue;
    var orig = prototype[methodName];
    matchersClass.prototype[methodName] = jasmine.Matchers.matcherFn_(methodName, orig);
  }
};

jasmine.Matchers.matcherFn_ = function(matcherName, matcherFunction) {
  return function() {
    var matcherArgs = jasmine.util.argsToArray(arguments);
    var result = matcherFunction.apply(this, arguments);

    if (this.isNot) {
      result = !result;
    }

    if (this.reportWasCalled_) return result;

    var message;
    if (!result) {
      if (this.message) {
        message = this.message.apply(this, arguments);
        if (jasmine.isArray_(message)) {
          message = message[this.isNot ? 1 : 0];
        }
      } else {
        var englishyPredicate = matcherName.replace(/[A-Z]/g, function(s) { return ' ' + s.toLowerCase(); });
        message = "Expected " + jasmine.pp(this.actual) + (this.isNot ? " not " : " ") + englishyPredicate;
        if (matcherArgs.length > 0) {
          for (var i = 0; i < matcherArgs.length; i++) {
            if (i > 0) message += ",";
            message += " " + jasmine.pp(matcherArgs[i]);
          }
        }
        message += ".";
      }
    }
    var expectationResult = new jasmine.ExpectationResult({
      matcherName: matcherName,
      passed: result,
      expected: matcherArgs.length > 1 ? matcherArgs : matcherArgs[0],
      actual: this.actual,
      message: message
    });
    this.spec.addMatcherResult(expectationResult);
    return jasmine.undefined;
  };
};




/**
 * toBe: compares the actual to the expected using ===
 * @param expected
 */
jasmine.Matchers.prototype.toBe = function(expected) {
  return this.actual === expected;
};

/**
 * toNotBe: compares the actual to the expected using !==
 * @param expected
 * @deprecated as of 1.0. Use not.toBe() instead.
 */
jasmine.Matchers.prototype.toNotBe = function(expected) {
  return this.actual !== expected;
};

/**
 * toEqual: compares the actual to the expected using common sense equality. Handles Objects, Arrays, etc.
 *
 * @param expected
 */
jasmine.Matchers.prototype.toEqual = function(expected) {
  return this.env.equals_(this.actual, expected);
};

/**
 * toNotEqual: compares the actual to the expected using the ! of jasmine.Matchers.toEqual
 * @param expected
 * @deprecated as of 1.0. Use not.toEqual() instead.
 */
jasmine.Matchers.prototype.toNotEqual = function(expected) {
  return !this.env.equals_(this.actual, expected);
};

/**
 * Matcher that compares the actual to the expected using a regular expression.  Constructs a RegExp, so takes
 * a pattern or a String.
 *
 * @param expected
 */
jasmine.Matchers.prototype.toMatch = function(expected) {
  return new RegExp(expected).test(this.actual);
};

/**
 * Matcher that compares the actual to the expected using the boolean inverse of jasmine.Matchers.toMatch
 * @param expected
 * @deprecated as of 1.0. Use not.toMatch() instead.
 */
jasmine.Matchers.prototype.toNotMatch = function(expected) {
  return !(new RegExp(expected).test(this.actual));
};

/**
 * Matcher that compares the actual to jasmine.undefined.
 */
jasmine.Matchers.prototype.toBeDefined = function() {
  return (this.actual !== jasmine.undefined);
};

/**
 * Matcher that compares the actual to jasmine.undefined.
 */
jasmine.Matchers.prototype.toBeUndefined = function() {
  return (this.actual === jasmine.undefined);
};

/**
 * Matcher that compares the actual to null.
 */
jasmine.Matchers.prototype.toBeNull = function() {
  return (this.actual === null);
};

/**
 * Matcher that boolean not-nots the actual.
 */
jasmine.Matchers.prototype.toBeTruthy = function() {
  return !!this.actual;
};


/**
 * Matcher that boolean nots the actual.
 */
jasmine.Matchers.prototype.toBeFalsy = function() {
  return !this.actual;
};


/**
 * Matcher that checks to see if the actual, a Jasmine spy, was called.
 */
jasmine.Matchers.prototype.toHaveBeenCalled = function() {
  if (arguments.length > 0) {
    throw new Error('toHaveBeenCalled does not take arguments, use toHaveBeenCalledWith');
  }

  if (!jasmine.isSpy(this.actual)) {
    throw new Error('Expected a spy, but got ' + jasmine.pp(this.actual) + '.');
  }

  this.message = function() {
    return [
      "Expected spy " + this.actual.identity + " to have been called.",
      "Expected spy " + this.actual.identity + " not to have been called."
    ];
  };

  return this.actual.wasCalled;
};

/** @deprecated Use expect(xxx).toHaveBeenCalled() instead */
jasmine.Matchers.prototype.wasCalled = jasmine.Matchers.prototype.toHaveBeenCalled;

/**
 * Matcher that checks to see if the actual, a Jasmine spy, was not called.
 *
 * @deprecated Use expect(xxx).not.toHaveBeenCalled() instead
 */
jasmine.Matchers.prototype.wasNotCalled = function() {
  if (arguments.length > 0) {
    throw new Error('wasNotCalled does not take arguments');
  }

  if (!jasmine.isSpy(this.actual)) {
    throw new Error('Expected a spy, but got ' + jasmine.pp(this.actual) + '.');
  }

  this.message = function() {
    return [
      "Expected spy " + this.actual.identity + " to not have been called.",
      "Expected spy " + this.actual.identity + " to have been called."
    ];
  };

  return !this.actual.wasCalled;
};

/**
 * Matcher that checks to see if the actual, a Jasmine spy, was called with a set of parameters.
 *
 * @example
 *
 */
jasmine.Matchers.prototype.toHaveBeenCalledWith = function() {
  var expectedArgs = jasmine.util.argsToArray(arguments);
  if (!jasmine.isSpy(this.actual)) {
    throw new Error('Expected a spy, but got ' + jasmine.pp(this.actual) + '.');
  }
  this.message = function() {
    if (this.actual.callCount === 0) {
      // todo: what should the failure message for .not.toHaveBeenCalledWith() be? is this right? test better. [xw]
      return [
        "Expected spy " + this.actual.identity + " to have been called with " + jasmine.pp(expectedArgs) + " but it was never called.",
        "Expected spy " + this.actual.identity + " not to have been called with " + jasmine.pp(expectedArgs) + " but it was."
      ];
    } else {
      return [
        "Expected spy " + this.actual.identity + " to have been called with " + jasmine.pp(expectedArgs) + " but was called with " + jasmine.pp(this.actual.argsForCall),
        "Expected spy " + this.actual.identity + " not to have been called with " + jasmine.pp(expectedArgs) + " but was called with " + jasmine.pp(this.actual.argsForCall)
      ];
    }
  };

  return this.env.contains_(this.actual.argsForCall, expectedArgs);
};

/** @deprecated Use expect(xxx).toHaveBeenCalledWith() instead */
jasmine.Matchers.prototype.wasCalledWith = jasmine.Matchers.prototype.toHaveBeenCalledWith;

/** @deprecated Use expect(xxx).not.toHaveBeenCalledWith() instead */
jasmine.Matchers.prototype.wasNotCalledWith = function() {
  var expectedArgs = jasmine.util.argsToArray(arguments);
  if (!jasmine.isSpy(this.actual)) {
    throw new Error('Expected a spy, but got ' + jasmine.pp(this.actual) + '.');
  }

  this.message = function() {
    return [
      "Expected spy not to have been called with " + jasmine.pp(expectedArgs) + " but it was",
      "Expected spy to have been called with " + jasmine.pp(expectedArgs) + " but it was"
    ];
  };

  return !this.env.contains_(this.actual.argsForCall, expectedArgs);
};

/**
 * Matcher that checks that the expected item is an element in the actual Array.
 *
 * @param {Object} expected
 */
jasmine.Matchers.prototype.toContain = function(expected) {
  return this.env.contains_(this.actual, expected);
};

/**
 * Matcher that checks that the expected item is NOT an element in the actual Array.
 *
 * @param {Object} expected
 * @deprecated as of 1.0. Use not.toContain() instead.
 */
jasmine.Matchers.prototype.toNotContain = function(expected) {
  return !this.env.contains_(this.actual, expected);
};

jasmine.Matchers.prototype.toBeLessThan = function(expected) {
  return this.actual < expected;
};

jasmine.Matchers.prototype.toBeGreaterThan = function(expected) {
  return this.actual > expected;
};

/**
 * Matcher that checks that the expected item is equal to the actual item
 * up to a given level of decimal precision (default 2).
 *
 * @param {Number} expected
 * @param {Number} precision
 */
jasmine.Matchers.prototype.toBeCloseTo = function(expected, precision) {
  if (!(precision === 0)) {
    precision = precision || 2;
  }
  return Math.abs(expected - this.actual) < (Math.pow(10, -precision) / 2);
};

/**
 * Matcher that checks that the expected exception was thrown by the actual.
 *
 * @param {String} expected
 */
jasmine.Matchers.prototype.toThrow = function(expected) {
  var result = false;
  var exception;
  if (typeof this.actual != 'function') {
    throw new Error('Actual is not a function');
  }
  try {
    this.actual();
  } catch (e) {
    exception = e;
  }
  if (exception) {
    result = (expected === jasmine.undefined || this.env.equals_(exception.message || exception, expected.message || expected));
  }

  var not = this.isNot ? "not " : "";

  this.message = function() {
    if (exception && (expected === jasmine.undefined || !this.env.equals_(exception.message || exception, expected.message || expected))) {
      return ["Expected function " + not + "to throw", expected ? expected.message || expected : "an exception", ", but it threw", exception.message || exception].join(' ');
    } else {
      return "Expected function to throw an exception.";
    }
  };

  return result;
};

jasmine.Matchers.Any = function(expectedClass) {
  this.expectedClass = expectedClass;
};

jasmine.Matchers.Any.prototype.jasmineMatches = function(other) {
  if (this.expectedClass == String) {
    return typeof other == 'string' || other instanceof String;
  }

  if (this.expectedClass == Number) {
    return typeof other == 'number' || other instanceof Number;
  }

  if (this.expectedClass == Function) {
    return typeof other == 'function' || other instanceof Function;
  }

  if (this.expectedClass == Object) {
    return typeof other == 'object';
  }

  return other instanceof this.expectedClass;
};

jasmine.Matchers.Any.prototype.jasmineToString = function() {
  return '<jasmine.any(' + this.expectedClass + ')>';
};

jasmine.Matchers.ObjectContaining = function (sample) {
  this.sample = sample;
};

jasmine.Matchers.ObjectContaining.prototype.jasmineMatches = function(other, mismatchKeys, mismatchValues) {
  mismatchKeys = mismatchKeys || [];
  mismatchValues = mismatchValues || [];

  var env = jasmine.getEnv();

  var hasKey = function(obj, keyName) {
    return obj != null && obj[keyName] !== jasmine.undefined;
  };

  for (var property in this.sample) {
    if (!hasKey(other, property) && hasKey(this.sample, property)) {
      mismatchKeys.push("expected has key '" + property + "', but missing from actual.");
    }
    else if (!env.equals_(this.sample[property], other[property], mismatchKeys, mismatchValues)) {
      mismatchValues.push("'" + property + "' was '" + (other[property] ? jasmine.util.htmlEscape(other[property].toString()) : other[property]) + "' in expected, but was '" + (this.sample[property] ? jasmine.util.htmlEscape(this.sample[property].toString()) : this.sample[property]) + "' in actual.");
    }
  }

  return (mismatchKeys.length === 0 && mismatchValues.length === 0);
};

jasmine.Matchers.ObjectContaining.prototype.jasmineToString = function () {
  return "<jasmine.objectContaining(" + jasmine.pp(this.sample) + ")>";
};
// Mock setTimeout, clearTimeout
// Contributed by Pivotal Computer Systems, www.pivotalsf.com

jasmine.FakeTimer = function() {
  this.reset();

  var self = this;
  self.setTimeout = function(funcToCall, millis) {
    self.timeoutsMade++;
    self.scheduleFunction(self.timeoutsMade, funcToCall, millis, false);
    return self.timeoutsMade;
  };

  self.setInterval = function(funcToCall, millis) {
    self.timeoutsMade++;
    self.scheduleFunction(self.timeoutsMade, funcToCall, millis, true);
    return self.timeoutsMade;
  };

  self.clearTimeout = function(timeoutKey) {
    self.scheduledFunctions[timeoutKey] = jasmine.undefined;
  };

  self.clearInterval = function(timeoutKey) {
    self.scheduledFunctions[timeoutKey] = jasmine.undefined;
  };

};

jasmine.FakeTimer.prototype.reset = function() {
  this.timeoutsMade = 0;
  this.scheduledFunctions = {};
  this.nowMillis = 0;
};

jasmine.FakeTimer.prototype.tick = function(millis) {
  var oldMillis = this.nowMillis;
  var newMillis = oldMillis + millis;
  this.runFunctionsWithinRange(oldMillis, newMillis);
  this.nowMillis = newMillis;
};

jasmine.FakeTimer.prototype.runFunctionsWithinRange = function(oldMillis, nowMillis) {
  var scheduledFunc;
  var funcsToRun = [];
  for (var timeoutKey in this.scheduledFunctions) {
    scheduledFunc = this.scheduledFunctions[timeoutKey];
    if (scheduledFunc != jasmine.undefined &&
        scheduledFunc.runAtMillis >= oldMillis &&
        scheduledFunc.runAtMillis <= nowMillis) {
      funcsToRun.push(scheduledFunc);
      this.scheduledFunctions[timeoutKey] = jasmine.undefined;
    }
  }

  if (funcsToRun.length > 0) {
    funcsToRun.sort(function(a, b) {
      return a.runAtMillis - b.runAtMillis;
    });
    for (var i = 0; i < funcsToRun.length; ++i) {
      try {
        var funcToRun = funcsToRun[i];
        this.nowMillis = funcToRun.runAtMillis;
        funcToRun.funcToCall();
        if (funcToRun.recurring) {
          this.scheduleFunction(funcToRun.timeoutKey,
              funcToRun.funcToCall,
              funcToRun.millis,
              true);
        }
      } catch(e) {
      }
    }
    this.runFunctionsWithinRange(oldMillis, nowMillis);
  }
};

jasmine.FakeTimer.prototype.scheduleFunction = function(timeoutKey, funcToCall, millis, recurring) {
  this.scheduledFunctions[timeoutKey] = {
    runAtMillis: this.nowMillis + millis,
    funcToCall: funcToCall,
    recurring: recurring,
    timeoutKey: timeoutKey,
    millis: millis
  };
};

/**
 * @namespace
 */
jasmine.Clock = {
  defaultFakeTimer: new jasmine.FakeTimer(),

  reset: function() {
    jasmine.Clock.assertInstalled();
    jasmine.Clock.defaultFakeTimer.reset();
  },

  tick: function(millis) {
    jasmine.Clock.assertInstalled();
    jasmine.Clock.defaultFakeTimer.tick(millis);
  },

  runFunctionsWithinRange: function(oldMillis, nowMillis) {
    jasmine.Clock.defaultFakeTimer.runFunctionsWithinRange(oldMillis, nowMillis);
  },

  scheduleFunction: function(timeoutKey, funcToCall, millis, recurring) {
    jasmine.Clock.defaultFakeTimer.scheduleFunction(timeoutKey, funcToCall, millis, recurring);
  },

  useMock: function() {
    if (!jasmine.Clock.isInstalled()) {
      var spec = jasmine.getEnv().currentSpec;
      spec.after(jasmine.Clock.uninstallMock);

      jasmine.Clock.installMock();
    }
  },

  installMock: function() {
    jasmine.Clock.installed = jasmine.Clock.defaultFakeTimer;
  },

  uninstallMock: function() {
    jasmine.Clock.assertInstalled();
    jasmine.Clock.installed = jasmine.Clock.real;
  },

  real: {
    setTimeout: jasmine.getGlobal().setTimeout,
    clearTimeout: jasmine.getGlobal().clearTimeout,
    setInterval: jasmine.getGlobal().setInterval,
    clearInterval: jasmine.getGlobal().clearInterval
  },

  assertInstalled: function() {
    if (!jasmine.Clock.isInstalled()) {
      throw new Error("Mock clock is not installed, use jasmine.Clock.useMock()");
    }
  },

  isInstalled: function() {
    return jasmine.Clock.installed == jasmine.Clock.defaultFakeTimer;
  },

  installed: null
};
jasmine.Clock.installed = jasmine.Clock.real;

//else for IE support
jasmine.getGlobal().setTimeout = function(funcToCall, millis) {
  if (jasmine.Clock.installed.setTimeout.apply) {
    return jasmine.Clock.installed.setTimeout.apply(this, arguments);
  } else {
    return jasmine.Clock.installed.setTimeout(funcToCall, millis);
  }
};

jasmine.getGlobal().setInterval = function(funcToCall, millis) {
  if (jasmine.Clock.installed.setInterval.apply) {
    return jasmine.Clock.installed.setInterval.apply(this, arguments);
  } else {
    return jasmine.Clock.installed.setInterval(funcToCall, millis);
  }
};

jasmine.getGlobal().clearTimeout = function(timeoutKey) {
  if (jasmine.Clock.installed.clearTimeout.apply) {
    return jasmine.Clock.installed.clearTimeout.apply(this, arguments);
  } else {
    return jasmine.Clock.installed.clearTimeout(timeoutKey);
  }
};

jasmine.getGlobal().clearInterval = function(timeoutKey) {
  if (jasmine.Clock.installed.clearTimeout.apply) {
    return jasmine.Clock.installed.clearInterval.apply(this, arguments);
  } else {
    return jasmine.Clock.installed.clearInterval(timeoutKey);
  }
};

/**
 * @constructor
 */
jasmine.MultiReporter = function() {
  this.subReporters_ = [];
};
jasmine.util.inherit(jasmine.MultiReporter, jasmine.Reporter);

jasmine.MultiReporter.prototype.addReporter = function(reporter) {
  this.subReporters_.push(reporter);
};

(function() {
  var functionNames = [
    "reportRunnerStarting",
    "reportRunnerResults",
    "reportSuiteResults",
    "reportSpecStarting",
    "reportSpecResults",
    "log"
  ];
  for (var i = 0; i < functionNames.length; i++) {
    var functionName = functionNames[i];
    jasmine.MultiReporter.prototype[functionName] = (function(functionName) {
      return function() {
        for (var j = 0; j < this.subReporters_.length; j++) {
          var subReporter = this.subReporters_[j];
          if (subReporter[functionName]) {
            subReporter[functionName].apply(subReporter, arguments);
          }
        }
      };
    })(functionName);
  }
})();
/**
 * Holds results for a set of Jasmine spec. Allows for the results array to hold another jasmine.NestedResults
 *
 * @constructor
 */
jasmine.NestedResults = function() {
  /**
   * The total count of results
   */
  this.totalCount = 0;
  /**
   * Number of passed results
   */
  this.passedCount = 0;
  /**
   * Number of failed results
   */
  this.failedCount = 0;
  /**
   * Was this suite/spec skipped?
   */
  this.skipped = false;
  /**
   * @ignore
   */
  this.items_ = [];
};

/**
 * Roll up the result counts.
 *
 * @param result
 */
jasmine.NestedResults.prototype.rollupCounts = function(result) {
  this.totalCount += result.totalCount;
  this.passedCount += result.passedCount;
  this.failedCount += result.failedCount;
};

/**
 * Adds a log message.
 * @param values Array of message parts which will be concatenated later.
 */
jasmine.NestedResults.prototype.log = function(values) {
  this.items_.push(new jasmine.MessageResult(values));
};

/**
 * Getter for the results: message & results.
 */
jasmine.NestedResults.prototype.getItems = function() {
  return this.items_;
};

/**
 * Adds a result, tracking counts (total, passed, & failed)
 * @param {jasmine.ExpectationResult|jasmine.NestedResults} result
 */
jasmine.NestedResults.prototype.addResult = function(result) {
  if (result.type != 'log') {
    if (result.items_) {
      this.rollupCounts(result);
    } else {
      this.totalCount++;
      if (result.passed()) {
        this.passedCount++;
      } else {
        this.failedCount++;
      }
    }
  }
  this.items_.push(result);
};

/**
 * @returns {Boolean} True if <b>everything</b> below passed
 */
jasmine.NestedResults.prototype.passed = function() {
  return this.passedCount === this.totalCount;
};
/**
 * Base class for pretty printing for expectation results.
 */
jasmine.PrettyPrinter = function() {
  this.ppNestLevel_ = 0;
};

/**
 * Formats a value in a nice, human-readable string.
 *
 * @param value
 */
jasmine.PrettyPrinter.prototype.format = function(value) {
  if (this.ppNestLevel_ > 40) {
    throw new Error('jasmine.PrettyPrinter: format() nested too deeply!');
  }

  this.ppNestLevel_++;
  try {
    if (value === jasmine.undefined) {
      this.emitScalar('undefined');
    } else if (value === null) {
      this.emitScalar('null');
    } else if (value === jasmine.getGlobal()) {
      this.emitScalar('<global>');
    } else if (value.jasmineToString) {
      this.emitScalar(value.jasmineToString());
    } else if (typeof value === 'string') {
      this.emitString(value);
    } else if (jasmine.isSpy(value)) {
      this.emitScalar("spy on " + value.identity);
    } else if (value instanceof RegExp) {
      this.emitScalar(value.toString());
    } else if (typeof value === 'function') {
      this.emitScalar('Function');
    } else if (typeof value.nodeType === 'number') {
      this.emitScalar('HTMLNode');
    } else if (value instanceof Date) {
      this.emitScalar('Date(' + value + ')');
    } else if (value.__Jasmine_been_here_before__) {
      this.emitScalar('<circular reference: ' + (jasmine.isArray_(value) ? 'Array' : 'Object') + '>');
    } else if (jasmine.isArray_(value) || typeof value == 'object') {
      value.__Jasmine_been_here_before__ = true;
      if (jasmine.isArray_(value)) {
        this.emitArray(value);
      } else {
        this.emitObject(value);
      }
      delete value.__Jasmine_been_here_before__;
    } else {
      this.emitScalar(value.toString());
    }
  } finally {
    this.ppNestLevel_--;
  }
};

jasmine.PrettyPrinter.prototype.iterateObject = function(obj, fn) {
  for (var property in obj) {
    if (property == '__Jasmine_been_here_before__') continue;
    fn(property, obj.__lookupGetter__ ? (obj.__lookupGetter__(property) !== jasmine.undefined && 
                                         obj.__lookupGetter__(property) !== null) : false);
  }
};

jasmine.PrettyPrinter.prototype.emitArray = jasmine.unimplementedMethod_;
jasmine.PrettyPrinter.prototype.emitObject = jasmine.unimplementedMethod_;
jasmine.PrettyPrinter.prototype.emitScalar = jasmine.unimplementedMethod_;
jasmine.PrettyPrinter.prototype.emitString = jasmine.unimplementedMethod_;

jasmine.StringPrettyPrinter = function() {
  jasmine.PrettyPrinter.call(this);

  this.string = '';
};
jasmine.util.inherit(jasmine.StringPrettyPrinter, jasmine.PrettyPrinter);

jasmine.StringPrettyPrinter.prototype.emitScalar = function(value) {
  this.append(value);
};

jasmine.StringPrettyPrinter.prototype.emitString = function(value) {
  this.append("'" + value + "'");
};

jasmine.StringPrettyPrinter.prototype.emitArray = function(array) {
  this.append('[ ');
  for (var i = 0; i < array.length; i++) {
    if (i > 0) {
      this.append(', ');
    }
    this.format(array[i]);
  }
  this.append(' ]');
};

jasmine.StringPrettyPrinter.prototype.emitObject = function(obj) {
  var self = this;
  this.append('{ ');
  var first = true;

  this.iterateObject(obj, function(property, isGetter) {
    if (first) {
      first = false;
    } else {
      self.append(', ');
    }

    self.append(property);
    self.append(' : ');
    if (isGetter) {
      self.append('<getter>');
    } else {
      self.format(obj[property]);
    }
  });

  this.append(' }');
};

jasmine.StringPrettyPrinter.prototype.append = function(value) {
  this.string += value;
};
jasmine.Queue = function(env) {
  this.env = env;

  // parallel to blocks. each true value in this array means the block will
  // get executed even if we abort
  this.ensured = [];
  this.blocks = [];
  this.running = false;
  this.index = 0;
  this.offset = 0;
  this.abort = false;
};

jasmine.Queue.prototype.addBefore = function(block, ensure) {
  if (ensure === jasmine.undefined) {
    ensure = false;
  }

  this.blocks.unshift(block);
  this.ensured.unshift(ensure);
};

jasmine.Queue.prototype.add = function(block, ensure) {
  if (ensure === jasmine.undefined) {
    ensure = false;
  }

  this.blocks.push(block);
  this.ensured.push(ensure);
};

jasmine.Queue.prototype.insertNext = function(block, ensure) {
  if (ensure === jasmine.undefined) {
    ensure = false;
  }

  this.ensured.splice((this.index + this.offset + 1), 0, ensure);
  this.blocks.splice((this.index + this.offset + 1), 0, block);
  this.offset++;
};

jasmine.Queue.prototype.start = function(onComplete) {
  this.running = true;
  this.onComplete = onComplete;
  this.next_();
};

jasmine.Queue.prototype.isRunning = function() {
  return this.running;
};

jasmine.Queue.LOOP_DONT_RECURSE = true;

jasmine.Queue.prototype.next_ = function() {
  var self = this;
  var goAgain = true;

  while (goAgain) {
    goAgain = false;
    
    if (self.index < self.blocks.length && !(this.abort && !this.ensured[self.index])) {
      var calledSynchronously = true;
      var completedSynchronously = false;

      var onComplete = function () {
        if (jasmine.Queue.LOOP_DONT_RECURSE && calledSynchronously) {
          completedSynchronously = true;
          return;
        }

        if (self.blocks[self.index].abort) {
          self.abort = true;
        }

        self.offset = 0;
        self.index++;

        var now = new Date().getTime();
        if (self.env.updateInterval && now - self.env.lastUpdate > self.env.updateInterval) {
          self.env.lastUpdate = now;
          self.env.setTimeout(function() {
            self.next_();
          }, 0);
        } else {
          if (jasmine.Queue.LOOP_DONT_RECURSE && completedSynchronously) {
            goAgain = true;
          } else {
            self.next_();
          }
        }
      };
      self.blocks[self.index].execute(onComplete);

      calledSynchronously = false;
      if (completedSynchronously) {
        onComplete();
      }
      
    } else {
      self.running = false;
      if (self.onComplete) {
        self.onComplete();
      }
    }
  }
};

jasmine.Queue.prototype.results = function() {
  var results = new jasmine.NestedResults();
  for (var i = 0; i < this.blocks.length; i++) {
    if (this.blocks[i].results) {
      results.addResult(this.blocks[i].results());
    }
  }
  return results;
};


/**
 * Runner
 *
 * @constructor
 * @param {jasmine.Env} env
 */
jasmine.Runner = function(env) {
  var self = this;
  self.env = env;
  self.queue = new jasmine.Queue(env);
  self.before_ = [];
  self.after_ = [];
  self.suites_ = [];
};

jasmine.Runner.prototype.execute = function() {
  var self = this;
  if (self.env.reporter.reportRunnerStarting) {
    self.env.reporter.reportRunnerStarting(this);
  }
  self.queue.start(function () {
    self.finishCallback();
  });
};

jasmine.Runner.prototype.beforeEach = function(beforeEachFunction) {
  beforeEachFunction.typeName = 'beforeEach';
  this.before_.splice(0,0,beforeEachFunction);
};

jasmine.Runner.prototype.afterEach = function(afterEachFunction) {
  afterEachFunction.typeName = 'afterEach';
  this.after_.splice(0,0,afterEachFunction);
};


jasmine.Runner.prototype.finishCallback = function() {
  this.env.reporter.reportRunnerResults(this);
};

jasmine.Runner.prototype.addSuite = function(suite) {
  this.suites_.push(suite);
};

jasmine.Runner.prototype.add = function(block) {
  if (block instanceof jasmine.Suite) {
    this.addSuite(block);
  }
  this.queue.add(block);
};

jasmine.Runner.prototype.specs = function () {
  var suites = this.suites();
  var specs = [];
  for (var i = 0; i < suites.length; i++) {
    specs = specs.concat(suites[i].specs());
  }
  return specs;
};

jasmine.Runner.prototype.suites = function() {
  return this.suites_;
};

jasmine.Runner.prototype.topLevelSuites = function() {
  var topLevelSuites = [];
  for (var i = 0; i < this.suites_.length; i++) {
    if (!this.suites_[i].parentSuite) {
      topLevelSuites.push(this.suites_[i]);
    }
  }
  return topLevelSuites;
};

jasmine.Runner.prototype.results = function() {
  return this.queue.results();
};
/**
 * Internal representation of a Jasmine specification, or test.
 *
 * @constructor
 * @param {jasmine.Env} env
 * @param {jasmine.Suite} suite
 * @param {String} description
 */
jasmine.Spec = function(env, suite, description) {
  if (!env) {
    throw new Error('jasmine.Env() required');
  }
  if (!suite) {
    throw new Error('jasmine.Suite() required');
  }
  var spec = this;
  spec.id = env.nextSpecId ? env.nextSpecId() : null;
  spec.env = env;
  spec.suite = suite;
  spec.description = description;
  spec.queue = new jasmine.Queue(env);

  spec.afterCallbacks = [];
  spec.spies_ = [];

  spec.results_ = new jasmine.NestedResults();
  spec.results_.description = description;
  spec.matchersClass = null;
};

jasmine.Spec.prototype.getFullName = function() {
  return this.suite.getFullName() + ' ' + this.description + '.';
};


jasmine.Spec.prototype.results = function() {
  return this.results_;
};

/**
 * All parameters are pretty-printed and concatenated together, then written to the spec's output.
 *
 * Be careful not to leave calls to <code>jasmine.log</code> in production code.
 */
jasmine.Spec.prototype.log = function() {
  return this.results_.log(arguments);
};

jasmine.Spec.prototype.runs = function (func) {
  var block = new jasmine.Block(this.env, func, this);
  this.addToQueue(block);
  return this;
};

jasmine.Spec.prototype.addToQueue = function (block) {
  if (this.queue.isRunning()) {
    this.queue.insertNext(block);
  } else {
    this.queue.add(block);
  }
};

/**
 * @param {jasmine.ExpectationResult} result
 */
jasmine.Spec.prototype.addMatcherResult = function(result) {
  this.results_.addResult(result);
};

jasmine.Spec.prototype.expect = function(actual) {
  var positive = new (this.getMatchersClass_())(this.env, actual, this);
  positive.not = new (this.getMatchersClass_())(this.env, actual, this, true);
  return positive;
};

/**
 * Waits a fixed time period before moving to the next block.
 *
 * @deprecated Use waitsFor() instead
 * @param {Number} timeout milliseconds to wait
 */
jasmine.Spec.prototype.waits = function(timeout) {
  var waitsFunc = new jasmine.WaitsBlock(this.env, timeout, this);
  this.addToQueue(waitsFunc);
  return this;
};

/**
 * Waits for the latchFunction to return true before proceeding to the next block.
 *
 * @param {Function} latchFunction
 * @param {String} optional_timeoutMessage
 * @param {Number} optional_timeout
 */
jasmine.Spec.prototype.waitsFor = function(latchFunction, optional_timeoutMessage, optional_timeout) {
  var latchFunction_ = null;
  var optional_timeoutMessage_ = null;
  var optional_timeout_ = null;

  for (var i = 0; i < arguments.length; i++) {
    var arg = arguments[i];
    switch (typeof arg) {
      case 'function':
        latchFunction_ = arg;
        break;
      case 'string':
        optional_timeoutMessage_ = arg;
        break;
      case 'number':
        optional_timeout_ = arg;
        break;
    }
  }

  var waitsForFunc = new jasmine.WaitsForBlock(this.env, optional_timeout_, latchFunction_, optional_timeoutMessage_, this);
  this.addToQueue(waitsForFunc);
  return this;
};

jasmine.Spec.prototype.fail = function (e) {
  var expectationResult = new jasmine.ExpectationResult({
    passed: false,
    message: e ? jasmine.util.formatException(e) : 'Exception',
    trace: { stack: e.stack }
  });
  this.results_.addResult(expectationResult);
};

jasmine.Spec.prototype.getMatchersClass_ = function() {
  return this.matchersClass || this.env.matchersClass;
};

jasmine.Spec.prototype.addMatchers = function(matchersPrototype) {
  var parent = this.getMatchersClass_();
  var newMatchersClass = function() {
    parent.apply(this, arguments);
  };
  jasmine.util.inherit(newMatchersClass, parent);
  jasmine.Matchers.wrapInto_(matchersPrototype, newMatchersClass);
  this.matchersClass = newMatchersClass;
};

jasmine.Spec.prototype.finishCallback = function() {
  this.env.reporter.reportSpecResults(this);
};

jasmine.Spec.prototype.finish = function(onComplete) {
  this.removeAllSpies();
  this.finishCallback();
  if (onComplete) {
    onComplete();
  }
};

jasmine.Spec.prototype.after = function(doAfter) {
  if (this.queue.isRunning()) {
    this.queue.add(new jasmine.Block(this.env, doAfter, this), true);
  } else {
    this.afterCallbacks.unshift(doAfter);
  }
};

jasmine.Spec.prototype.execute = function(onComplete) {
  var spec = this;
  if (!spec.env.specFilter(spec)) {
    spec.results_.skipped = true;
    spec.finish(onComplete);
    return;
  }

  this.env.reporter.reportSpecStarting(this);

  spec.env.currentSpec = spec;

  spec.addBeforesAndAftersToQueue();

  spec.queue.start(function () {
    spec.finish(onComplete);
  });
};

jasmine.Spec.prototype.addBeforesAndAftersToQueue = function() {
  var runner = this.env.currentRunner();
  var i;

  for (var suite = this.suite; suite; suite = suite.parentSuite) {
    for (i = 0; i < suite.before_.length; i++) {
      this.queue.addBefore(new jasmine.Block(this.env, suite.before_[i], this));
    }
  }
  for (i = 0; i < runner.before_.length; i++) {
    this.queue.addBefore(new jasmine.Block(this.env, runner.before_[i], this));
  }
  for (i = 0; i < this.afterCallbacks.length; i++) {
    this.queue.add(new jasmine.Block(this.env, this.afterCallbacks[i], this), true);
  }
  for (suite = this.suite; suite; suite = suite.parentSuite) {
    for (i = 0; i < suite.after_.length; i++) {
      this.queue.add(new jasmine.Block(this.env, suite.after_[i], this), true);
    }
  }
  for (i = 0; i < runner.after_.length; i++) {
    this.queue.add(new jasmine.Block(this.env, runner.after_[i], this), true);
  }
};

jasmine.Spec.prototype.explodes = function() {
  throw 'explodes function should not have been called';
};

jasmine.Spec.prototype.spyOn = function(obj, methodName, ignoreMethodDoesntExist) {
  if (obj == jasmine.undefined) {
    throw "spyOn could not find an object to spy upon for " + methodName + "()";
  }

  if (!ignoreMethodDoesntExist && obj[methodName] === jasmine.undefined) {
    throw methodName + '() method does not exist';
  }

  if (!ignoreMethodDoesntExist && obj[methodName] && obj[methodName].isSpy) {
    throw new Error(methodName + ' has already been spied upon');
  }

  var spyObj = jasmine.createSpy(methodName);

  this.spies_.push(spyObj);
  spyObj.baseObj = obj;
  spyObj.methodName = methodName;
  spyObj.originalValue = obj[methodName];

  obj[methodName] = spyObj;

  return spyObj;
};

jasmine.Spec.prototype.removeAllSpies = function() {
  for (var i = 0; i < this.spies_.length; i++) {
    var spy = this.spies_[i];
    spy.baseObj[spy.methodName] = spy.originalValue;
  }
  this.spies_ = [];
};

/**
 * Internal representation of a Jasmine suite.
 *
 * @constructor
 * @param {jasmine.Env} env
 * @param {String} description
 * @param {Function} specDefinitions
 * @param {jasmine.Suite} parentSuite
 */
jasmine.Suite = function(env, description, specDefinitions, parentSuite) {
  var self = this;
  self.id = env.nextSuiteId ? env.nextSuiteId() : null;
  self.description = description;
  self.queue = new jasmine.Queue(env);
  self.parentSuite = parentSuite;
  self.env = env;
  self.before_ = [];
  self.after_ = [];
  self.children_ = [];
  self.suites_ = [];
  self.specs_ = [];
};

jasmine.Suite.prototype.getFullName = function() {
  var fullName = this.description;
  for (var parentSuite = this.parentSuite; parentSuite; parentSuite = parentSuite.parentSuite) {
    fullName = parentSuite.description + ' ' + fullName;
  }
  return fullName;
};

jasmine.Suite.prototype.finish = function(onComplete) {
  this.env.reporter.reportSuiteResults(this);
  this.finished = true;
  if (typeof(onComplete) == 'function') {
    onComplete();
  }
};

jasmine.Suite.prototype.beforeEach = function(beforeEachFunction) {
  beforeEachFunction.typeName = 'beforeEach';
  this.before_.unshift(beforeEachFunction);
};

jasmine.Suite.prototype.afterEach = function(afterEachFunction) {
  afterEachFunction.typeName = 'afterEach';
  this.after_.unshift(afterEachFunction);
};

jasmine.Suite.prototype.results = function() {
  return this.queue.results();
};

jasmine.Suite.prototype.add = function(suiteOrSpec) {
  this.children_.push(suiteOrSpec);
  if (suiteOrSpec instanceof jasmine.Suite) {
    this.suites_.push(suiteOrSpec);
    this.env.currentRunner().addSuite(suiteOrSpec);
  } else {
    this.specs_.push(suiteOrSpec);
  }
  this.queue.add(suiteOrSpec);
};

jasmine.Suite.prototype.specs = function() {
  return this.specs_;
};

jasmine.Suite.prototype.suites = function() {
  return this.suites_;
};

jasmine.Suite.prototype.children = function() {
  return this.children_;
};

jasmine.Suite.prototype.execute = function(onComplete) {
  var self = this;
  this.queue.start(function () {
    self.finish(onComplete);
  });
};
jasmine.WaitsBlock = function(env, timeout, spec) {
  this.timeout = timeout;
  jasmine.Block.call(this, env, null, spec);
};

jasmine.util.inherit(jasmine.WaitsBlock, jasmine.Block);

jasmine.WaitsBlock.prototype.execute = function (onComplete) {
  if (jasmine.VERBOSE) {
    this.env.reporter.log('>> Jasmine waiting for ' + this.timeout + ' ms...');
  }
  this.env.setTimeout(function () {
    onComplete();
  }, this.timeout);
};
/**
 * A block which waits for some condition to become true, with timeout.
 *
 * @constructor
 * @extends jasmine.Block
 * @param {jasmine.Env} env The Jasmine environment.
 * @param {Number} timeout The maximum time in milliseconds to wait for the condition to become true.
 * @param {Function} latchFunction A function which returns true when the desired condition has been met.
 * @param {String} message The message to display if the desired condition hasn't been met within the given time period.
 * @param {jasmine.Spec} spec The Jasmine spec.
 */
jasmine.WaitsForBlock = function(env, timeout, latchFunction, message, spec) {
  this.timeout = timeout || env.defaultTimeoutInterval;
  this.latchFunction = latchFunction;
  this.message = message;
  this.totalTimeSpentWaitingForLatch = 0;
  jasmine.Block.call(this, env, null, spec);
};
jasmine.util.inherit(jasmine.WaitsForBlock, jasmine.Block);

jasmine.WaitsForBlock.TIMEOUT_INCREMENT = 10;

jasmine.WaitsForBlock.prototype.execute = function(onComplete) {
  if (jasmine.VERBOSE) {
    this.env.reporter.log('>> Jasmine waiting for ' + (this.message || 'something to happen'));
  }
  var latchFunctionResult;
  try {
    latchFunctionResult = this.latchFunction.apply(this.spec);
  } catch (e) {
    this.spec.fail(e);
    onComplete();
    return;
  }

  if (latchFunctionResult) {
    onComplete();
  } else if (this.totalTimeSpentWaitingForLatch >= this.timeout) {
    var message = 'timed out after ' + this.timeout + ' msec waiting for ' + (this.message || 'something to happen');
    this.spec.fail({
      name: 'timeout',
      message: message
    });

    this.abort = true;
    onComplete();
  } else {
    this.totalTimeSpentWaitingForLatch += jasmine.WaitsForBlock.TIMEOUT_INCREMENT;
    var self = this;
    this.env.setTimeout(function() {
      self.execute(onComplete);
    }, jasmine.WaitsForBlock.TIMEOUT_INCREMENT);
  }
};

jasmine.version_= {
  "major": 1,
  "minor": 2,
  "build": 0,
  "revision": 1343710612
};
jasmine.HtmlReporterHelpers = {};

jasmine.HtmlReporterHelpers.createDom = function(type, attrs, childrenVarArgs) {
  var el = document.createElement(type);

  for (var i = 2; i < arguments.length; i++) {
    var child = arguments[i];

    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else {
      if (child) {
        el.appendChild(child);
      }
    }
  }

  for (var attr in attrs) {
    if (attr == "className") {
      el[attr] = attrs[attr];
    } else {
      el.setAttribute(attr, attrs[attr]);
    }
  }

  return el;
};

jasmine.HtmlReporterHelpers.getSpecStatus = function(child) {
  var results = child.results();
  var status = results.passed() ? 'passed' : 'failed';
  if (results.skipped) {
    status = 'skipped';
  }

  return status;
};

jasmine.HtmlReporterHelpers.appendToSummary = function(child, childElement) {
  var parentDiv = this.dom.summary;
  var parentSuite = (typeof child.parentSuite == 'undefined') ? 'suite' : 'parentSuite';
  var parent = child[parentSuite];

  if (parent) {
    if (typeof this.views.suites[parent.id] == 'undefined') {
      this.views.suites[parent.id] = new jasmine.HtmlReporter.SuiteView(parent, this.dom, this.views);
    }
    parentDiv = this.views.suites[parent.id].element;
  }

  parentDiv.appendChild(childElement);
};


jasmine.HtmlReporterHelpers.addHelpers = function(ctor) {
  for(var fn in jasmine.HtmlReporterHelpers) {
    ctor.prototype[fn] = jasmine.HtmlReporterHelpers[fn];
  }
};

jasmine.HtmlReporter = function(_doc) {
  var self = this;
  var doc = _doc || window.document;

  var reporterView;

  var dom = {};

  // Jasmine Reporter Public Interface
  self.logRunningSpecs = false;

  self.reportRunnerStarting = function(runner) {
    var specs = runner.specs() || [];

    if (specs.length == 0) {
      return;
    }

    createReporterDom(runner.env.versionString());
    doc.body.appendChild(dom.reporter);
    setExceptionHandling();

    reporterView = new jasmine.HtmlReporter.ReporterView(dom);
    reporterView.addSpecs(specs, self.specFilter);
  };

  self.reportRunnerResults = function(runner) {
    reporterView && reporterView.complete();
  };

  self.reportSuiteResults = function(suite) {
    reporterView.suiteComplete(suite);
  };

  self.reportSpecStarting = function(spec) {
    if (self.logRunningSpecs) {
      self.log('>> Jasmine Running ' + spec.suite.description + ' ' + spec.description + '...');
    }
  };

  self.reportSpecResults = function(spec) {
    reporterView.specComplete(spec);
  };

  self.log = function() {
    var console = jasmine.getGlobal().console;
    if (console && console.log) {
      if (console.log.apply) {
        console.log.apply(console, arguments);
      } else {
        console.log(arguments); // ie fix: console.log.apply doesn't exist on ie
      }
    }
  };

  self.specFilter = function(spec) {
    if (!focusedSpecName()) {
      return true;
    }

    return spec.getFullName().indexOf(focusedSpecName()) === 0;
  };

  return self;

  function focusedSpecName() {
    var specName;

    (function memoizeFocusedSpec() {
      if (specName) {
        return;
      }

      var paramMap = [];
      var params = jasmine.HtmlReporter.parameters(doc);

      for (var i = 0; i < params.length; i++) {
        var p = params[i].split('=');
        paramMap[decodeURIComponent(p[0])] = decodeURIComponent(p[1]);
      }

      specName = paramMap.spec;
    })();

    return specName;
  }

  function createReporterDom(version) {
    dom.reporter = self.createDom('div', { id: 'HTMLReporter', className: 'jasmine_reporter' },
      dom.banner = self.createDom('div', { className: 'banner' },
        self.createDom('span', { className: 'title' }, "Jasmine "),
        self.createDom('span', { className: 'version' }, version)),

      dom.symbolSummary = self.createDom('ul', {className: 'symbolSummary'}),
      dom.alert = self.createDom('div', {className: 'alert'},
        self.createDom('span', { className: 'exceptions' },
          self.createDom('label', { className: 'label', 'for': 'no_try_catch' }, 'No try/catch'),
          self.createDom('input', { id: 'no_try_catch', type: 'checkbox' }))),
      dom.results = self.createDom('div', {className: 'results'},
        dom.summary = self.createDom('div', { className: 'summary' }),
        dom.details = self.createDom('div', { id: 'details' }))
    );
  }

  function noTryCatch() {
    return window.location.search.match(/catch=false/);
  }

  function searchWithCatch() {
    var params = jasmine.HtmlReporter.parameters(window.document);
    var removed = false;
    var i = 0;

    while (!removed && i < params.length) {
      if (params[i].match(/catch=/)) {
        params.splice(i, 1);
        removed = true;
      }
      i++;
    }
    if (jasmine.CATCH_EXCEPTIONS) {
      params.push("catch=false");
    }

    return params.join("&");
  }

  function setExceptionHandling() {
    var chxCatch = document.getElementById('no_try_catch');

    if (noTryCatch()) {
      chxCatch.setAttribute('checked', true);
      jasmine.CATCH_EXCEPTIONS = false;
    }
    chxCatch.onclick = function() {
      window.location.search = searchWithCatch();
    };
  }
};
jasmine.HtmlReporter.parameters = function(doc) {
  var paramStr = doc.location.search.substring(1);
  var params = [];

  if (paramStr.length > 0) {
    params = paramStr.split('&');
  }
  return params;
}
jasmine.HtmlReporter.sectionLink = function(sectionName) {
  var link = '?';
  var params = [];

  if (sectionName) {
    params.push('spec=' + encodeURIComponent(sectionName));
  }
  if (!jasmine.CATCH_EXCEPTIONS) {
    params.push("catch=false");
  }
  if (params.length > 0) {
    link += params.join("&");
  }

  return link;
};
jasmine.HtmlReporterHelpers.addHelpers(jasmine.HtmlReporter);
jasmine.HtmlReporter.ReporterView = function(dom) {
  this.startedAt = new Date();
  this.runningSpecCount = 0;
  this.completeSpecCount = 0;
  this.passedCount = 0;
  this.failedCount = 0;
  this.skippedCount = 0;

  this.createResultsMenu = function() {
    this.resultsMenu = this.createDom('span', {className: 'resultsMenu bar'},
      this.summaryMenuItem = this.createDom('a', {className: 'summaryMenuItem', href: "#"}, '0 specs'),
      ' | ',
      this.detailsMenuItem = this.createDom('a', {className: 'detailsMenuItem', href: "#"}, '0 failing'));

    this.summaryMenuItem.onclick = function() {
      dom.reporter.className = dom.reporter.className.replace(/ showDetails/g, '');
    };

    this.detailsMenuItem.onclick = function() {
      showDetails();
    };
  };

  this.addSpecs = function(specs, specFilter) {
    this.totalSpecCount = specs.length;

    this.views = {
      specs: {},
      suites: {}
    };

    for (var i = 0; i < specs.length; i++) {
      var spec = specs[i];
      this.views.specs[spec.id] = new jasmine.HtmlReporter.SpecView(spec, dom, this.views);
      if (specFilter(spec)) {
        this.runningSpecCount++;
      }
    }
  };

  this.specComplete = function(spec) {
    this.completeSpecCount++;

    if (isUndefined(this.views.specs[spec.id])) {
      this.views.specs[spec.id] = new jasmine.HtmlReporter.SpecView(spec, dom);
    }

    var specView = this.views.specs[spec.id];

    switch (specView.status()) {
      case 'passed':
        this.passedCount++;
        break;

      case 'failed':
        this.failedCount++;
        break;

      case 'skipped':
        this.skippedCount++;
        break;
    }

    specView.refresh();
    this.refresh();
  };

  this.suiteComplete = function(suite) {
    var suiteView = this.views.suites[suite.id];
    if (isUndefined(suiteView)) {
      return;
    }
    suiteView.refresh();
  };

  this.refresh = function() {

    if (isUndefined(this.resultsMenu)) {
      this.createResultsMenu();
    }

    // currently running UI
    if (isUndefined(this.runningAlert)) {
      this.runningAlert = this.createDom('a', { href: jasmine.HtmlReporter.sectionLink(), className: "runningAlert bar" });
      dom.alert.appendChild(this.runningAlert);
    }
    this.runningAlert.innerHTML = "Running " + this.completeSpecCount + " of " + specPluralizedFor(this.totalSpecCount);

    // skipped specs UI
    if (isUndefined(this.skippedAlert)) {
      this.skippedAlert = this.createDom('a', { href: jasmine.HtmlReporter.sectionLink(), className: "skippedAlert bar" });
    }

    this.skippedAlert.innerHTML = "Skipping " + this.skippedCount + " of " + specPluralizedFor(this.totalSpecCount) + " - run all";

    if (this.skippedCount === 1 && isDefined(dom.alert)) {
      dom.alert.appendChild(this.skippedAlert);
    }

    // passing specs UI
    if (isUndefined(this.passedAlert)) {
      this.passedAlert = this.createDom('span', { href: jasmine.HtmlReporter.sectionLink(), className: "passingAlert bar" });
    }
    this.passedAlert.innerHTML = "Passing " + specPluralizedFor(this.passedCount);

    // failing specs UI
    if (isUndefined(this.failedAlert)) {
      this.failedAlert = this.createDom('span', {href: "?", className: "failingAlert bar"});
    }
    this.failedAlert.innerHTML = "Failing " + specPluralizedFor(this.failedCount);

    if (this.failedCount === 1 && isDefined(dom.alert)) {
      dom.alert.appendChild(this.failedAlert);
      dom.alert.appendChild(this.resultsMenu);
    }

    // summary info
    this.summaryMenuItem.innerHTML = "" + specPluralizedFor(this.runningSpecCount);
    this.detailsMenuItem.innerHTML = "" + this.failedCount + " failing";
  };

  this.complete = function() {
    dom.alert.removeChild(this.runningAlert);

    this.skippedAlert.innerHTML = "Ran " + this.runningSpecCount + " of " + specPluralizedFor(this.totalSpecCount) + " - run all";

    if (this.failedCount === 0) {
      dom.alert.appendChild(this.createDom('span', {className: 'passingAlert bar'}, "Passing " + specPluralizedFor(this.passedCount)));
    } else {
      showDetails();
    }

    dom.banner.appendChild(this.createDom('span', {className: 'duration'}, "finished in " + ((new Date().getTime() - this.startedAt.getTime()) / 1000) + "s"));
  };

  return this;

  function showDetails() {
    if (dom.reporter.className.search(/showDetails/) === -1) {
      dom.reporter.className += " showDetails";
    }
  }

  function isUndefined(obj) {
    return typeof obj === 'undefined';
  }

  function isDefined(obj) {
    return !isUndefined(obj);
  }

  function specPluralizedFor(count) {
    var str = count + " spec";
    if (count > 1) {
      str += "s"
    }
    return str;
  }

};

jasmine.HtmlReporterHelpers.addHelpers(jasmine.HtmlReporter.ReporterView);


jasmine.HtmlReporter.SpecView = function(spec, dom, views) {
  this.spec = spec;
  this.dom = dom;
  this.views = views;

  this.symbol = this.createDom('li', { className: 'pending' });
  this.dom.symbolSummary.appendChild(this.symbol);

  this.summary = this.createDom('div', { className: 'specSummary' },
    this.createDom('a', {
      className: 'description',
      href: jasmine.HtmlReporter.sectionLink(this.spec.getFullName()),
      title: this.spec.getFullName()
    }, this.spec.description)
  );

  this.detail = this.createDom('div', { className: 'specDetail' },
      this.createDom('a', {
        className: 'description',
        href: '?spec=' + encodeURIComponent(this.spec.getFullName()),
        title: this.spec.getFullName()
      }, this.spec.getFullName())
  );
};

jasmine.HtmlReporter.SpecView.prototype.status = function() {
  return this.getSpecStatus(this.spec);
};

jasmine.HtmlReporter.SpecView.prototype.refresh = function() {
  this.symbol.className = this.status();

  switch (this.status()) {
    case 'skipped':
      break;

    case 'passed':
      this.appendSummaryToSuiteDiv();
      break;

    case 'failed':
      this.appendSummaryToSuiteDiv();
      this.appendFailureDetail();
      break;
  }
};

jasmine.HtmlReporter.SpecView.prototype.appendSummaryToSuiteDiv = function() {
  this.summary.className += ' ' + this.status();
  this.appendToSummary(this.spec, this.summary);
};

jasmine.HtmlReporter.SpecView.prototype.appendFailureDetail = function() {
  this.detail.className += ' ' + this.status();

  var resultItems = this.spec.results().getItems();
  var messagesDiv = this.createDom('div', { className: 'messages' });

  for (var i = 0; i < resultItems.length; i++) {
    var result = resultItems[i];

    if (result.type == 'log') {
      messagesDiv.appendChild(this.createDom('div', {className: 'resultMessage log'}, result.toString()));
    } else if (result.type == 'expect' && result.passed && !result.passed()) {
      messagesDiv.appendChild(this.createDom('div', {className: 'resultMessage fail'}, result.message));

      if (result.trace.stack) {
        messagesDiv.appendChild(this.createDom('div', {className: 'stackTrace'}, result.trace.stack));
      }
    }
  }

  if (messagesDiv.childNodes.length > 0) {
    this.detail.appendChild(messagesDiv);
    this.dom.details.appendChild(this.detail);
  }
};

jasmine.HtmlReporterHelpers.addHelpers(jasmine.HtmlReporter.SpecView);jasmine.HtmlReporter.SuiteView = function(suite, dom, views) {
  this.suite = suite;
  this.dom = dom;
  this.views = views;

  this.element = this.createDom('div', { className: 'suite' },
    this.createDom('a', { className: 'description', href: jasmine.HtmlReporter.sectionLink(this.suite.getFullName()) }, this.suite.description)
  );

  this.appendToSummary(this.suite, this.element);
};

jasmine.HtmlReporter.SuiteView.prototype.status = function() {
  return this.getSpecStatus(this.suite);
};

jasmine.HtmlReporter.SuiteView.prototype.refresh = function() {
  this.element.className += " " + this.status();
};

jasmine.HtmlReporterHelpers.addHelpers(jasmine.HtmlReporter.SuiteView);

/* @deprecated Use jasmine.HtmlReporter instead
 */
jasmine.TrivialReporter = function(doc) {
  this.document = doc || document;
  this.suiteDivs = {};
  this.logRunningSpecs = false;
};

jasmine.TrivialReporter.prototype.createDom = function(type, attrs, childrenVarArgs) {
  var el = document.createElement(type);

  for (var i = 2; i < arguments.length; i++) {
    var child = arguments[i];

    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else {
      if (child) { el.appendChild(child); }
    }
  }

  for (var attr in attrs) {
    if (attr == "className") {
      el[attr] = attrs[attr];
    } else {
      el.setAttribute(attr, attrs[attr]);
    }
  }

  return el;
};

jasmine.TrivialReporter.prototype.reportRunnerStarting = function(runner) {
  var showPassed, showSkipped;

  this.outerDiv = this.createDom('div', { id: 'TrivialReporter', className: 'jasmine_reporter' },
      this.createDom('div', { className: 'banner' },
        this.createDom('div', { className: 'logo' },
            this.createDom('span', { className: 'title' }, "Jasmine"),
            this.createDom('span', { className: 'version' }, runner.env.versionString())),
        this.createDom('div', { className: 'options' },
            "Show ",
            showPassed = this.createDom('input', { id: "__jasmine_TrivialReporter_showPassed__", type: 'checkbox' }),
            this.createDom('label', { "for": "__jasmine_TrivialReporter_showPassed__" }, " passed "),
            showSkipped = this.createDom('input', { id: "__jasmine_TrivialReporter_showSkipped__", type: 'checkbox' }),
            this.createDom('label', { "for": "__jasmine_TrivialReporter_showSkipped__" }, " skipped")
            )
          ),

      this.runnerDiv = this.createDom('div', { className: 'runner running' },
          this.createDom('a', { className: 'run_spec', href: '?' }, "run all"),
          this.runnerMessageSpan = this.createDom('span', {}, "Running..."),
          this.finishedAtSpan = this.createDom('span', { className: 'finished-at' }, ""))
      );

  this.document.body.appendChild(this.outerDiv);

  var suites = runner.suites();
  for (var i = 0; i < suites.length; i++) {
    var suite = suites[i];
    var suiteDiv = this.createDom('div', { className: 'suite' },
        this.createDom('a', { className: 'run_spec', href: '?spec=' + encodeURIComponent(suite.getFullName()) }, "run"),
        this.createDom('a', { className: 'description', href: '?spec=' + encodeURIComponent(suite.getFullName()) }, suite.description));
    this.suiteDivs[suite.id] = suiteDiv;
    var parentDiv = this.outerDiv;
    if (suite.parentSuite) {
      parentDiv = this.suiteDivs[suite.parentSuite.id];
    }
    parentDiv.appendChild(suiteDiv);
  }

  this.startedAt = new Date();

  var self = this;
  showPassed.onclick = function(evt) {
    if (showPassed.checked) {
      self.outerDiv.className += ' show-passed';
    } else {
      self.outerDiv.className = self.outerDiv.className.replace(/ show-passed/, '');
    }
  };

  showSkipped.onclick = function(evt) {
    if (showSkipped.checked) {
      self.outerDiv.className += ' show-skipped';
    } else {
      self.outerDiv.className = self.outerDiv.className.replace(/ show-skipped/, '');
    }
  };
};

jasmine.TrivialReporter.prototype.reportRunnerResults = function(runner) {
  var results = runner.results();
  var className = (results.failedCount > 0) ? "runner failed" : "runner passed";
  this.runnerDiv.setAttribute("class", className);
  //do it twice for IE
  this.runnerDiv.setAttribute("className", className);
  var specs = runner.specs();
  var specCount = 0;
  for (var i = 0; i < specs.length; i++) {
    if (this.specFilter(specs[i])) {
      specCount++;
    }
  }
  var message = "" + specCount + " spec" + (specCount == 1 ? "" : "s" ) + ", " + results.failedCount + " failure" + ((results.failedCount == 1) ? "" : "s");
  message += " in " + ((new Date().getTime() - this.startedAt.getTime()) / 1000) + "s";
  this.runnerMessageSpan.replaceChild(this.createDom('a', { className: 'description', href: '?'}, message), this.runnerMessageSpan.firstChild);

  this.finishedAtSpan.appendChild(document.createTextNode("Finished at " + new Date().toString()));
};

jasmine.TrivialReporter.prototype.reportSuiteResults = function(suite) {
  var results = suite.results();
  var status = results.passed() ? 'passed' : 'failed';
  if (results.totalCount === 0) { // todo: change this to check results.skipped
    status = 'skipped';
  }
  this.suiteDivs[suite.id].className += " " + status;
};

jasmine.TrivialReporter.prototype.reportSpecStarting = function(spec) {
  if (this.logRunningSpecs) {
    this.log('>> Jasmine Running ' + spec.suite.description + ' ' + spec.description + '...');
  }
};

jasmine.TrivialReporter.prototype.reportSpecResults = function(spec) {
  var results = spec.results();
  var status = results.passed() ? 'passed' : 'failed';
  if (results.skipped) {
    status = 'skipped';
  }
  var specDiv = this.createDom('div', { className: 'spec '  + status },
      this.createDom('a', { className: 'run_spec', href: '?spec=' + encodeURIComponent(spec.getFullName()) }, "run"),
      this.createDom('a', {
        className: 'description',
        href: '?spec=' + encodeURIComponent(spec.getFullName()),
        title: spec.getFullName()
      }, spec.description));


  var resultItems = results.getItems();
  var messagesDiv = this.createDom('div', { className: 'messages' });
  for (var i = 0; i < resultItems.length; i++) {
    var result = resultItems[i];

    if (result.type == 'log') {
      messagesDiv.appendChild(this.createDom('div', {className: 'resultMessage log'}, result.toString()));
    } else if (result.type == 'expect' && result.passed && !result.passed()) {
      messagesDiv.appendChild(this.createDom('div', {className: 'resultMessage fail'}, result.message));

      if (result.trace.stack) {
        messagesDiv.appendChild(this.createDom('div', {className: 'stackTrace'}, result.trace.stack));
      }
    }
  }

  if (messagesDiv.childNodes.length > 0) {
    specDiv.appendChild(messagesDiv);
  }

  this.suiteDivs[spec.suite.id].appendChild(specDiv);
};

jasmine.TrivialReporter.prototype.log = function() {
  var console = jasmine.getGlobal().console;
  if (console && console.log) {
    if (console.log.apply) {
      console.log.apply(console, arguments);
    } else {
      console.log(arguments); // ie fix: console.log.apply doesn't exist on ie
    }
  }
};

jasmine.TrivialReporter.prototype.getLocation = function() {
  return this.document.location;
};

jasmine.TrivialReporter.prototype.specFilter = function(spec) {
  var paramMap = {};
  var params = this.getLocation().search.substring(1).split('&');
  for (var i = 0; i < params.length; i++) {
    var p = params[i].split('=');
    paramMap[decodeURIComponent(p[0])] = decodeURIComponent(p[1]);
  }

  if (!paramMap.spec) {
    return true;
  }
  return spec.getFullName().indexOf(paramMap.spec) === 0;
};
var sampleData = {
    "facility_variables": {
        "overview": [],
        "sectors": [
            {
                "subgroups": [
                    {
                        "name": "All",
                        "slug": "all"
                    },
                    {
                        "name": "Subsector 2",
                        "slug": "ss2"
                    }
                ],
                "name": "Health",
                "columns": [
                    {
                        "descriptive_name": "name",
                        "description": "name",
                        "display_order": 0,
                        "name": "name",
                        "clickable": false,
                        "slug": "name",
                        "subgroups": [
                            "all"
                        ]
                    },
                    {
                        "descriptive_name": "s1v1",
                        "description": "s2v1",
                        "display_order": 1,
                        "name": "s1v1",
                        "clickable": false,
                        "slug": "s1v1",
                        "subgroups": [
                            "all",
                            "ss2"
                        ]
                    },
                    {
                        "descriptive_name": "s1v3",
                        "description": "s2v3",
                        "display_order": 2,
                        "name": "s1v3",
                        "clickable": false,
                        "slug": "s1v3",
                        "subgroups": [
                            "all",
                            "ss2"
                        ]
                    },
                    {
                        "descriptive_name": "s1v5",
                        "description": "s2v5",
                        "display_order": 3,
                        "name": "s1v5",
                        "clickable": false,
                        "slug": "s1v5",
                        "subgroups": [
                            "all",
                            "ss2"
                        ]
                    }
                ],
                "slug": "health"
            },
            {
                "subgroups": [
                    {
                        "name": "All",
                        "slug": "all"
                    },
                    {
                        "name": "Subsector 1",
                        "slug": "ss1"
                    }
                ],
                "name": "Education",
                "columns": [
                    {
                        "descriptive_name": "name",
                        "description": "name",
                        "display_order": 0,
                        "name": "name",
                        "clickable": false,
                        "slug": "name",
                        "subgroups": [
                            "all"
                        ]
                    },
                    {
                        "descriptive_name": "s1v1",
                        "description": "s1v1",
                        "display_order": 1,
                        "name": "s1v1",
                        "clickable": false,
                        "slug": "s1v1",
                        "subgroups": [
                            "all",
                            "ss1"
                        ]
                    },
                    {
                        "descriptive_name": "s1v3",
                        "description": "s1v3",
                        "display_order": 2,
                        "name": "s1v3",
                        "clickable": false,
                        "slug": "s1v3",
                        "subgroups": [
                            "all",
                            "ss1"
                        ]
                    },
                    {
                        "descriptive_name": "s1v5",
                        "description": "s1v5",
                        "display_order": 3,
                        "name": "s1v5",
                        "clickable": false,
                        "slug": "s1v5",
                        "subgroups": [
                            "all",
                            "ss1"
                        ]
                    }
                ],
                "slug": "education"
            },
            {
                "subgroups": [
                    {
                        "name": "All",
                        "slug": "all"
                    },
                    {
                        "name": "Subsector 1",
                        "slug": "ss1"
                    },
                    {
                        "name": "Subsector 2",
                        "slug": "ss2"
                    }
                ],
                "name": "Water",
                "columns": [
                    {
                        "descriptive_name": "name",
                        "description": "name",
                        "display_order": 0,
                        "name": "name",
                        "clickable": false,
                        "slug": "name",
                        "subgroups": [
                            "all"
                        ]
                    },
                    {
                        "descriptive_name": "s3v1",
                        "description": "s3v1",
                        "display_order": 1,
                        "name": "s3v1",
                        "clickable": false,
                        "slug": "s3v1",
                        "subgroups": [
                            "all",
                            "ss1"
                        ]
                    },
                    {
                        "descriptive_name": "s3v3",
                        "description": "s3v3",
                        "display_order": 2,
                        "name": "s3v3",
                        "clickable": false,
                        "slug": "s3v3",
                        "subgroups": [
                            "all",
                            "ss2"
                        ]
                    },
                    {
                        "descriptive_name": "s3v5",
                        "description": "s3v5",
                        "display_order": 3,
                        "name": "s3v5",
                        "clickable": false,
                        "slug": "s3v5",
                        "subgroups": [
                            "all",
                            "ss1"
                        ]
                    }
                ],
                "slug": "water"
            }
        ]
    },
    "data": {
        "facilities": {
            "31": {
                "sector": "Education",
                "name": "name1",
                "students": 110,
                "tsr_should_be": 0.23,
                "teachers": 25,
                "ts_ratio": 0.22727272727272727,
                "s1v6": 0.41,
                "s1v4": 0.35,
                "s1v5": 0.18,
                "s1v2": 7.65,
                "s1v3": 3.88,
                "s1v1": 8.5
            },
            "32": {
                "sector": "Education",
                "name": "name1",
                "students": 95,
                "tsr_should_be": 0.37,
                "teachers": 35,
                "ts_ratio": 0.3684210526315789,
                "s1v6": 8.33,
                "s1v4": 9.23,
                "s1v5": 3.73,
                "s1v2": 6.33,
                "s1v3": 6.33,
                "s1v1": 4.4
            },
            "33": {
                "sector": "Education",
                "name": "name1",
                "students": 60,
                "tsr_should_be": 0.58,
                "teachers": 35,
                "ts_ratio": 0.5833333333333334,
                "s1v6": 3.28,
                "s1v4": 9.26,
                "s1v5": 7.73,
                "s1v2": 6.28,
                "s1v3": 0.33,
                "s1v1": 5.83
            },
            "34": {
                "sector": "Education",
                "name": "name1",
                "students": 90,
                "tsr_should_be": 0.5,
                "teachers": 45,
                "ts_ratio": 0.5,
                "s1v6": 8.06,
                "s1v4": 2.82,
                "s1v5": 5.3,
                "s1v2": 7.98,
                "s1v3": 2.46,
                "s1v1": 3.01
            },
            "35": {
                "sector": "Education",
                "name": "name1",
                "students": 100,
                "tsr_should_be": 0.3,
                "teachers": 30,
                "ts_ratio": 0.3,
                "s1v6": 0.62,
                "s1v4": 4.18,
                "s1v5": 0.42,
                "s1v2": 9,
                "s1v3": 6.35,
                "s1v1": 1.17
            },
            "36": {
                "sector": "Education",
                "name": "name1",
                "students": 70,
                "tsr_should_be": 0.57,
                "teachers": 40,
                "ts_ratio": 0.5714285714285714,
                "s1v6": 2.54,
                "s1v4": 5.83,
                "s1v5": 6.33,
                "s1v2": 1.55,
                "s1v3": 7.14,
                "s1v1": 0.44
            },
            "37": {
                "sector": "Education",
                "name": "name1",
                "students": 70,
                "tsr_should_be": 0.64,
                "teachers": 45,
                "ts_ratio": 0.6428571428571429,
                "s1v6": 6.94,
                "s1v4": 5.67,
                "s1v5": 7.86,
                "s1v2": 5.05,
                "s1v3": 7.09,
                "s1v1": 9.28
            },
            "38": {
                "sector": "Education",
                "name": "name1",
                "students": 140,
                "tsr_should_be": 0.14,
                "teachers": 20,
                "ts_ratio": 0.14285714285714285,
                "s1v6": 1.1,
                "s1v4": 6.81,
                "s1v5": 6.73,
                "s1v2": 8.39,
                "s1v3": 9.98,
                "s1v1": 2.95
            },
            "39": {
                "sector": "Education",
                "name": "name1",
                "students": 75,
                "tsr_should_be": 0.07,
                "teachers": 5,
                "ts_ratio": 0.06666666666666667,
                "s1v6": 6.27,
                "s1v4": 0.62,
                "s1v5": 9.06,
                "s1v2": 9.66,
                "s1v3": 5.11,
                "s1v1": 4.84
            },
            "40": {
                "sector": "Education",
                "name": "name1",
                "students": 65,
                "tsr_should_be": 0.23,
                "teachers": 15,
                "ts_ratio": 0.23076923076923078,
                "s1v6": 7.55,
                "s1v4": 7.01,
                "s1v5": 8.86,
                "s1v2": 4.58,
                "s1v3": 0.87,
                "s1v1": 9.95
            },
            "41": {
                "sector": "Health",
                "name": "name1",
                "s2v1": 1.8,
                "s2v3": 9.45,
                "s2v2": 5.37,
                "s2v5": 4.97,
                "s2v4": 2.46,
                "s2v6": 2.35
            },
            "42": {
                "sector": "Health",
                "name": "name1",
                "s2v1": 5.45,
                "s2v3": 8.32,
                "s2v2": 3.58,
                "s2v5": 4.21,
                "s2v4": 0.48,
                "s2v6": 3.27
            },
            "43": {
                "sector": "Health",
                "name": "name1",
                "s2v1": 1.81,
                "s2v3": 9.21,
                "s2v2": 8.49,
                "s2v5": 5.92,
                "s2v4": 5.74,
                "s2v6": 4.15
            },
            "44": {
                "sector": "Health",
                "name": "name1",
                "s2v1": 2.18,
                "s2v3": 7.41,
                "s2v2": 0.54,
                "s2v5": 1.33,
                "s2v4": 3.42,
                "s2v6": 5.67
            },
            "45": {
                "sector": "Health",
                "name": "name1",
                "s2v1": 3.7,
                "s2v3": 4.34,
                "s2v2": 8,
                "s2v5": 2.96,
                "s2v4": 4.35,
                "s2v6": 6.39
            },
            "46": {
                "sector": "Health",
                "name": "name1",
                "s2v1": 9.32,
                "s2v3": 8.04,
                "s2v2": 9.98,
                "s2v5": 1.73,
                "s2v4": 5.19,
                "s2v6": 9.54
            },
            "47": {
                "sector": "Health",
                "name": "name1",
                "s2v1": 4.78,
                "s2v3": 6.33,
                "s2v2": 0.51,
                "s2v5": 4.41,
                "s2v4": 1.57,
                "s2v6": 7.54
            },
            "48": {
                "sector": "Health",
                "name": "name1",
                "s2v1": 0.71,
                "s2v3": 4.93,
                "s2v2": 9.18,
                "s2v5": 9.01,
                "s2v4": 5.23,
                "s2v6": 0.41
            },
            "49": {
                "sector": "Health",
                "name": "name1",
                "s2v1": 4.46,
                "s2v3": 3.26,
                "s2v2": 3.16,
                "s2v5": 5.64,
                "s2v4": 0.16,
                "s2v6": 8.08
            },
            "50": {
                "sector": "Health",
                "name": "name1",
                "s2v1": 2.48,
                "s2v3": 1.29,
                "s2v2": 3.05,
                "s2v5": 3.75,
                "s2v4": 7.55,
                "s2v6": 2.03
            },
            "51": {
                "sector": "Water",
                "name": "name1",
                "s3v4": 0.36,
                "s3v5": 6.77,
                "s3v6": 3.82,
                "s3v1": 0.1,
                "s3v2": 8.56,
                "s3v3": 1.91
            },
            "52": {
                "sector": "Water",
                "name": "name1",
                "s3v4": 3.75,
                "s3v5": 9.09,
                "s3v6": 7.29,
                "s3v1": 5.45,
                "s3v2": 9.98,
                "s3v3": 7.56
            },
            "53": {
                "sector": "Water",
                "name": "name1",
                "s3v4": 7.28,
                "s3v5": 2,
                "s3v6": 6.49,
                "s3v1": 1.4,
                "s3v2": 4.75,
                "s3v3": 9.37
            },
            "54": {
                "sector": "Water",
                "name": "name1",
                "s3v4": 1.67,
                "s3v5": 0.06,
                "s3v6": 0.76,
                "s3v1": 6.6,
                "s3v2": 5.01,
                "s3v3": 2.41
            },
            "55": {
                "sector": "Water",
                "name": "name1",
                "s3v4": 0.63,
                "s3v5": 8.06,
                "s3v6": 5.32,
                "s3v1": 5.24,
                "s3v2": 8.72,
                "s3v3": 7.8
            },
            "56": {
                "sector": "Water",
                "name": "name1",
                "s3v4": 3.37,
                "s3v5": 6.96,
                "s3v6": 3.78,
                "s3v1": 7.02,
                "s3v2": 8.02,
                "s3v3": 7.52
            },
            "57": {
                "sector": "Water",
                "name": "name1",
                "s3v4": 9.07,
                "s3v5": 7.12,
                "s3v6": 6.29,
                "s3v1": 3.01,
                "s3v2": 2.49,
                "s3v3": 7.67
            },
            "58": {
                "sector": "Water",
                "name": "name1",
                "s3v4": 5.64,
                "s3v5": 1.26,
                "s3v6": 9.34,
                "s3v1": 7.34,
                "s3v2": 9.24,
                "s3v3": 3.31
            },
            "59": {
                "sector": "Water",
                "name": "name1",
                "s3v4": 2.71,
                "s3v5": 3.54,
                "s3v6": 2.31,
                "s3v1": 6.09,
                "s3v2": 1.1,
                "s3v3": 0.33
            },
            "60": {
                "sector": "Water",
                "name": "name1",
                "s3v4": 6.31,
                "s3v5": 1.07,
                "s3v6": 2.81,
                "s3v1": 1.36,
                "s3v2": 9.49,
                "s3v3": 6.52
            }
        },
        "stateName": "State1",
        "profileData": {},
        "lgaName": "LGA2"
    }
};

var sectors2 = sampleData.facility_variables.sectors;

var sl = sectors2.length, sli = 0;
var data2 = _.map(sampleData.data.facilities, function(i, key){
    return _.extend({}, i, {
        '_uid': key,
        'sector': sectors2[sli++ % sl].slug
    });
});

var data = [];
var sectors = [], _sectors = ["Agriculture", "Education", "Health", "Water"];
_.each(_sectors, function(s){
    sectors.push({
        name: s,
        slug: s.toLowerCase()
    });
});
_.times(40, function(i){
    data.push({
        sector: sectors[i%4].slug,
        something: i%3==0
    });
});

var reqPath = "health",
		urlRoot = "/nmis~/",
		stateName = "Enugu",
		state = {
			name: "Enugu",
			slug: "enugu"
		},
		lga = {
			name: "Isi-Uzo",
			slug: "isi_uzo",
			latLng: "7.687256,6.745281"
		},
		profileData = [[["LGA Chairman", {"source": "LGA Management Survey, 2011 (LGA)", "value": "Doctor Sam C Ugwu"}], ["LGA Secretary", {"source": "LGA Management Survey, 2011 (LGA)", "value": "Sylvester O Ugwuagbo"}], ["Population (2006)", {"source": "Population Census, 2006 (LGA)", "value": "148597"}], ["Area (square km)", {"source": "GADM, 2011 (National)", "value": "327.1"}], ["Distance from capital (km)", {"source": "LGA Management Survey, 2011 (LGA)", "value": "45"}]]][0],
		lgaName = "Isi-Uzo",
		lgaUniqueSlug = "enugu_isi_uzo";

var sectorData = [{"subgroups": [{"display_order": 26, "name": "General", "slug": "general"}], "name": "Water", "columns": [{"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Functional", "name": "Functional", "display_style": "checkmark_true", "display_order": 4, "description": "The water source can be either functional, or not functional.", "clickable": true, "slug": "water_functional", "subgroups": ["general"]}, {"click_actions": ["tabulate"], "descriptive_name": "Reason for breakdown", "name": "Reason Broken", "display_order": 5, "description": "This is the reason that the water source is not functional.", "clickable": true, "slug": "breakdown", "subgroups": ["general"]}, {"click_actions": ["tabulate"], "iconify_png_url": "./images/status_icons/global/", "descriptive_name": "Lift Mechanism", "name": "Lift Mechanism", "display_order": 6, "description": "The primary/main lift mechanism for the water source. A lift mechanism is the way water is brought to the surface for people to use and can include a variety of methods, such as diesel pumps, hand pumps, animal powered pumps etc. ", "clickable": true, "slug": "lift_mechanism", "subgroups": ["general"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/false/", "descriptive_name": "Fees for use", "name": "Fees for use", "display_style": "checkmark_true", "display_order": 7, "description": "The water source requires payment in order for someone to use/draw water.", "clickable": true, "slug": "pay_for_water_yn", "subgroups": ["general"]}, {"click_actions": ["tabulate"], "descriptive_name": "Distribution Type", "name": "Distribution Type", "display_order": 8, "description": "The distribution type refers to whether this water source is distributed at a single point, or multiple points. For multiple point distributions, the type also classifies whether the water points served by the water source are roughly within 100 meters, within 1000 meters (1 km), or beyond 1 kilometer.", "clickable": true, "slug": "distribution_type", "subgroups": ["general"]}, {"click_actions": ["tabulate"], "descriptive_name": "Community", "name": "Community", "display_order": 0, "description": "The community this water source is in.", "clickable": true, "slug": "community", "subgroups": ["general"]}, {"click_actions": ["tabulate"], "descriptive_name": "Ward", "name": "Ward", "display_order": 1, "description": "The ward this water source is in.", "clickable": true, "slug": "ward", "subgroups": ["general"]}, {"click_actions": ["tabulate"], "descriptive_name": "Type of water source", "name": "Type", "display_order": 2, "description": "The type/kind of water source, such as borehole, protected dug well, developed/protected spring water, or a rainwater harvesting scheme.", "clickable": true, "slug": "water_source_type", "subgroups": ["general"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Improved", "name": "Improved", "display_style": "checkmark_true", "display_order": 3, "description": "The water source can be either improved, or unimproved.", "clickable": true, "slug": "is_improved", "subgroups": ["general"]}], "slug": "water"}, {"subgroups": [{"display_order": 15, "name": "Snapshot", "slug": "snapshot"}, {"display_order": 16, "name": "Access", "slug": "access"}, {"display_order": 17, "name": "Participation", "slug": "participation"}, {"display_order": 18, "name": "Infrastructure: Water and Sanitation", "slug": "water_and_sanitation"}, {"display_order": 19, "name": "Infrastructure: Building Structure", "slug": "building_structure"}, {"display_order": 20, "name": "Infrastructure: Health and Safety", "slug": "health_and_safety"}, {"display_order": 21, "name": "Infrastructure: Learning Environment", "slug": "learning_environment"}, {"display_order": 22, "name": "Furniture", "slug": "furniture"}, {"display_order": 23, "name": "Adequacy of Staffing", "slug": "adequacy_of_staffing"}, {"display_order": 24, "name": "Institutional Development", "slug": "institutional_development"}, {"display_order": 25, "name": "Curriculum Issues", "slug": "curriculum"}], "name": "Education", "columns": [{"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Proportion of children with basic numeracy skills (TBD)", "name": "Proportion of children who can do basic numeracy (TBD)", "display_style": "checkmark_true", "display_order": 37, "description": "This is the proportion of children at the school who demonstrate  adequate ability to perform and understand basic maths.\n", "clickable": true, "slug": "pupil_tchr_ratio", "subgroups": ["learning_outcomes"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Proportion of children with life skills (TBD)", "name": "Proportion of children who can do life skills (TBD)", "display_style": "checkmark_true", "display_order": 38, "description": "This is the proportion of children at the school who demonstrate  adequate ability to acquire knowledge and to develop attitudes and skills which support the adoption of healthy behaviours.", "clickable": true, "slug": "pupil_tchr_ratio", "subgroups": ["learning_outcomes"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Provides exercise books to students", "name": "Exercise books provided", "display_style": "checkmark_true", "display_order": 32, "description": "The school gives its students exercise books", "clickable": true, "slug": "provide_exercise_books_yn", "subgroups": ["curriculum"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Provides pens/pencils to students", "name": "Pens/pencils provided", "display_style": "checkmark_true", "display_order": 33, "description": "The school gives its students pens and pencils", "clickable": true, "slug": "provide_pens_yn", "subgroups": ["curriculum"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Teachers guide for every subject", "name": "Teaching guidebook for every teacher for every subject", "display_style": "checkmark_true", "display_order": 34, "description": "Teachers at the school have a Ministry of Education issued/approved teacher's guide or syllabus for all subjects", "clickable": true, "slug": "teacher_guide_yn", "subgroups": ["curriculum"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Functioning library", "name": "Functioning Library", "display_style": "checkmark_true", "display_order": 35, "description": "The school has a room or building that houses books and other materials students and staff can access.", "clickable": true, "slug": "functioning_library_yn", "subgroups": ["curriculum"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Proportion of children with basic literacy ", "name": "Proportion of children who can do basic literacy (TBD)", "display_style": "checkmark_true", "display_order": 36, "description": "This is the proportion of children at the school who demonstrate  adequate ability to read and write.\n", "clickable": true, "slug": "pupil_tchr_ratio", "subgroups": ["learning_outcomes"]}, {"click_actions": ["tabulate"], "descriptive_name": "Total number of teachers", "name": "Total number of teachers", "display_order": 27, "description": "This is the total number of teachers in each school.", "clickable": true, "slug": "num_tchrs_total", "subgroups": ["adequacy_of_staffing"]}, {"click_actions": ["tabulate"], "descriptive_name": "Pupil to bench ratio", "name": "Pupil to bench ratio", "display_order": 28, "description": "This is the ratio of the number of students at the school to the number of benches available at the school.", "clickable": true, "slug": "pupil_bench_ratio", "subgroups": ["furniture"]}, {"click_actions": ["tabulate"], "descriptive_name": "Pupil to desk ratio", "name": "Pupil to desk ratio", "display_order": 29, "description": "This is the ratio of the number of students at the school to the number of desks avaiable ", "clickable": true, "slug": "pupil_desk_ratio", "subgroups": ["furniture"]}, {"click_actions": ["piechart_false", "iconify"], "iconify_png_url": "./images/status_icons/false/", "descriptive_name": "Delayed teacher payments in the past 12 months", "name": "Delayed teacher payments in the past 12 months", "display_style": "checkmark_false", "display_order": 30, "description": "Teachers were not paid on time at least once in the last 12 months", "clickable": true, "slug": "tchr_pay_delay", "subgroups": ["institutional_development"]}, {"click_actions": ["piechart_false", "iconify"], "iconify_png_url": "./images/status_icons/false/", "descriptive_name": "Multi-grade classrooms", "name": "Multi-grade classrooms", "display_style": "checkmark_false", "display_order": 25, "description": "The school has classrooms that are used for more than one class on a regular basis.  ", "clickable": true, "slug": "multigrade_classrms", "subgroups": ["learning_environment"]}, {"click_actions": ["tabulate"], "descriptive_name": "Teachers who participated in training in the past 12 months", "name": "Teachers who participated in training in the past 12 months", "display_order": 26, "description": "This is the  number of teachers at the school who attended a training or were sent for training in the past 12 months", "clickable": true, "slug": "num_tchrs_attended_training", "subgroups": ["adequacy_of_staffing"]}, {"click_actions": ["piechart_false", "iconify"], "iconify_png_url": "./images/status_icons/false/", "descriptive_name": "Double shifts", "name": "Double shifts", "display_style": "checkmark_false", "display_order": 24, "description": "The school teaches in shifts throughout the day. If the school operates in a single shift, only one group of students is being taught during the day. If another group of students comes after the first group has finished and uses the same classrooms and facilities, the school operates in double shifts.  Schools can have morning and afternoon shifts or they can have shifts that overlap. ", "clickable": true, "slug": "two_shifts_yn", "subgroups": ["learning_environment"]}, {"click_actions": ["piechart_false", "iconify"], "iconify_png_url": "./images/status_icons/false/", "descriptive_name": "Missed teacher payments in past 12 months", "name": "Missed teacher payments in the past 12 months", "display_style": "checkmark_false", "display_order": 31, "description": "Teachers were not paid at all at least once in the last 12 months", "clickable": true, "slug": "tchr_pay_miss", "subgroups": ["institutional_development"]}, {"click_actions": ["tabulate"], "descriptive_name": "Pupil to toilet ratio", "name": "Pupil to toilet ratio", "display_order": 18, "description": "This is the proportion of students to toilets at each school.", "clickable": true, "slug": "pupil_toilet_ratio_facility", "subgroups": ["water_and_sanitation"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Dispensary/health clinic", "name": "Dispensary / Health Clinic", "display_style": "checkmark_true", "display_order": 19, "description": "The school has a health clinic for students and staff. The aim behind this indicator is to find out whether the school is prepared to manage very basic injuries that happen to students or staff. A school is counted as having a health clinic if the respondnet explicitly said there is a health clinic for students and staff.  ", "clickable": true, "slug": "access_clinic_dispensary", "subgroups": ["health_and_safety"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "First aid kit ONLY (not a health clinic)", "name": "First-aid kit only (no health clinic)", "display_style": "checkmark_true", "display_order": 20, "description": "The school has a first aid kit that can be used for students and staff.  The aim behind this indicator is to find out whether the school is is prepared to manage very basic injuries that happen to students or staff. A school is counted as having a first aid kit if the respondnet explicitly said there is a first aid kit for students and staff. The school does not have a health clinic but just a first aid kit.", "clickable": true, "slug": "access_first_aid", "subgroups": ["health_and_safety"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Wall/fence in good condition", "name": "Wall/fence in good condition", "display_style": "checkmark_true", "display_order": 21, "description": "The school's boundary wall or fence or some other demarcation of the school area is in good condition. Assessment of the condition of the  school's fences/boundary walls condition is not based on a measurement but on the respondent's knowledge of and subjective judgement of the fence/wall condition.", "clickable": true, "slug": "wall_fence_good_condi", "subgroups": ["health_and_safety"]}, {"click_actions": ["tabulate"], "descriptive_name": "Pupil to classroom ratio", "name": "Pupil to classroom ratio", "display_order": 22, "description": "This is the ratio of the number of students at the school to the number of classrooms available.", "clickable": true, "slug": "pupil_classrm_ratio", "subgroups": ["learning_environment"]}, {"click_actions": ["piechart_false", "iconify"], "iconify_png_url": "./images/status_icons/false/", "descriptive_name": "Teach outside because there are not enough classrooms", "name": "Teach outside because there are not enough classrooms", "display_style": "checkmark_false", "display_order": 23, "description": "The school does not have enough classrooms and as a result some classes are held outside.", "clickable": true, "slug": "class_held_outside", "subgroups": ["learning_environment"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Gender separated toilets", "name": "Gender-separated toilet(s)", "display_style": "checkmark_true", "display_order": 17, "description": "School has separate toilets for boys and girls. Gender separated toilets are defined as those that are only for women or girls and other facilities only for men or boys. If  toilets are shared and are for use by women, girls, men and boys then the school does not have gender separated toilets. ", "clickable": true, "slug": "gender_separated_toilets_yn", "subgroups": ["water_and_sanitation"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Access to improved sanitation/toilet", "name": "Access to improved sanitation/toilet", "display_style": "checkmark_true", "display_order": 16, "description": "School had access to improved sanitation/toilets for at least three weeks in the month before data was collected. It is assumed that improved sanitation reduces the risk of contact with waste and thus leads to a reduction in certain diseases. Improved sanitation is defined as sewers or septic tanks, poor-flush latrines and simple pit or ventilated improved pit latrines that are not for public use and are meant for use by staff and students.", "clickable": true, "slug": "education_improved_sanitation", "subgroups": ["water_and_sanitation"]}, {"click_actions": ["tabulate"], "descriptive_name": "Textbook to pupil ratio", "name": "Textbook to pupil ratio", "display_order": 11, "description": "This is the ratio of the number of textbooks at the schools to the number of textbooks.", "clickable": true, "slug": "textbook_to_pupil_ratio", "subgroups": ["snapshot", "curriculum"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Follows the national UBE curriculum", "name": "Follow the national UBE curriculum", "display_style": "checkmark_true", "display_order": 12, "description": "The school uses the Ministry of Education issued/approved curriculum for all subjects", "clickable": true, "slug": "natl_curriculum_yn", "subgroups": ["snapshot"]}, {"click_actions": ["piechart_false", "iconify"], "iconify_png_url": "./images/status_icons/false/", "descriptive_name": "More than 1km from nearest secondary school", "name": "Farther than 1km from nearest secondary school", "display_style": "checkmark_false", "display_order": 13, "description": "The primary school is more than 1 km from the nearest secondary school. This indicator measures how easily students can access secondary education. The assumption is that students are more likely to attend secondary schools if they are easily accessible and are not located very far away from where the primary school or catchment area is.", "clickable": true, "slug": "school_1kmplus_secondary_school", "subgroups": ["access"]}, {"click_actions": ["piechart_false", "iconify"], "iconify_png_url": "./images/status_icons/false/", "descriptive_name": "More than 20% of students living more than 3km away from school", "name": "More than 20% students living farther than 3km from school", "display_style": "checkmark_false", "display_order": 14, "description": "The school has>20% students who live more than 3kms away. This indicator measures how easily students can access a school. The assumption is that students are more likely to attend school if they do not live very far away from the school or if the school is within a reasonable distance from where the population it serves live.", "clickable": true, "slug": "students_living_3kmplus_school", "subgroups": ["access"]}, {"click_actions": ["tabulate"], "descriptive_name": "Ratio boys to girls ", "name": "Ratio boys to girls", "display_order": 15, "description": "The ratio of boys to girls enrolled at the school. The indicator is a ratio of the number of  enrolled boys to enrolled girls, regardless of ages. It measures the equality of educational opportunity, measured in terms of school enrolment, for boys and girls", "clickable": true, "slug": "male_to_female_student_ratio", "subgroups": ["participation"]}, {"descriptive_name": "School name", "description": "School Name", "display_order": 0, "name": "Name", "clickable": false, "slug": "school_name", "subgroups": ["snapshot", "access", "participation", "water_and_sanitation", "building_structure", "health_and_safety", "learning_environment", "furniture", "adequacy_of_staffing", "institutional_development", "curriculum"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Access to power", "name": "Access to power", "display_style": "checkmark_true", "display_order": 1, "description": "School had power for at least three weeks in the month before the data was collected. Access to power is defined as having power for at least three weeks in the month before the data was collected. This indicator measures how consistent and reliable the school's power source is.   If there was always at least one working power source in the month before data collection and if the school had power for 5 or more hours a day then the school is considered as having reliable and consistent power. ", "clickable": true, "slug": "power_access", "subgroups": ["building_structure"]}, {"click_actions": ["tabulate"], "descriptive_name": "Number of classrooms needing minor repair", "name": "Classroom(s) that need minor repairs", "display_order": 2, "description": "Number of classrooms at the school that are in need of only minor repairs ", "clickable": true, "slug": "num_classrms_need_min_repairs", "subgroups": ["building_structure"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Roof in good condition", "name": "Roof in good condition", "display_style": "checkmark_true", "display_order": 3, "description": "School buildings have rooves that are described as being in good condition. Assessment of the school buildings rooves' condition is not based on a measurement but on the respondent's knowledge of and subjective judgement of the rooves condition.", "clickable": true, "slug": "covered_roof_good_condi", "subgroups": ["building_structure"]}, {"click_actions": ["tabulate"], "descriptive_name": "Pupitl to teacher ratio", "name": "Pupil to teacher ratio", "display_order": 4, "description": "The ratio of pupils to teachers at the school", "clickable": true, "slug": "pupil_tchr_ratio", "subgroups": ["adequacy_of_staffing"]}, {"click_actions": ["tabulate"], "descriptive_name": "Teacher to non-teaching staff ratio", "name": "Teacher to non-teaching staff", "display_order": 5, "description": "This is the ratio of staff at the school who teach (teachers who are in permanent or temporary/part-time positions and both qualified and unqualified teachers) and do not teach (non-teaching staff are the number of male and female staff who do not teach and are classified as pay scale grade 7 and up).  ", "clickable": true, "slug": "teacher_nonteachingstaff_ratio", "subgroups": ["adequacy_of_staffing"]}, {"click_actions": ["piechart_false", "iconify"], "iconify_png_url": "./images/status_icons/false/", "descriptive_name": "Farther than 1km from catchment area", "name": "Farther than 1km from catchment area", "display_style": "checkmark_false", "display_order": 6, "description": "The school is more than 1 km from the catchment area/areas it is supposed to serve. This indicator measures how easily students can access a school.", "clickable": true, "slug": "school_1kmplus_catchment_area", "subgroups": ["snapshot", "access"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Access to potable water", "name": "Access to potable water", "display_style": "checkmark_true", "display_order": 7, "description": "School had potable water, without interruption, for at least three weeks in the past month. The indicator monitors access to safe water sources based on the assumption that\nsuch sources are more likely to provide safe water and reduce the incidence of diseases caused by drinking/using unsafe water.", "clickable": true, "slug": "potable_water", "subgroups": ["snapshot", "water_and_sanitation"]}, {"click_actions": ["tabulate"], "descriptive_name": "Number of classrooms needing major repair", "name": "Classroom(s) that need major repairs", "display_order": 8, "description": "Number of classrooms at the school that are in need of major repair. ", "clickable": true, "slug": "num_classrms_need_maj_repairs", "subgroups": ["snapshot", "building_structure"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Chalkboards in every classroom", "name": "Chalkboards in every classroom", "display_style": "checkmark_true", "display_order": 9, "description": "Every classroom at the school has a chalkboard", "clickable": true, "slug": "chalkboard_each_classroom_yn", "subgroups": ["snapshot", "furniture"]}, {"click_actions": ["tabulate"], "descriptive_name": "Qualified teachers (with NCE)", "name": "Qualified teachers (with NCE)", "display_order": 10, "description": "This is the number of teachers at the school who have an NCE", "clickable": true, "slug": "num_tchrs_with_nce", "subgroups": ["snapshot", "adequacy_of_staffing"]}], "slug": "education"}, {"subgroups": [{"display_order": 0, "name": "Snapshot", "slug": "snapshot"}, {"display_order": 1, "name": "Staffing", "slug": "staffing"}, {"display_order": 2, "name": "Maternal Health: Antenatal", "slug": "maternal_antenatal"}, {"display_order": 3, "name": "Maternal Health: Obstetrics (1)", "slug": "maternal_obstetrics1"}, {"display_order": 4, "name": "Maternal Health: Obstetrics (2)", "slug": "maternal_obstetrics2"}, {"display_order": 5, "name": "Maternal Health: Family Planning", "slug": "maternal_famplan"}, {"display_order": 6, "name": "Child Nutrition", "slug": "child_nutrition"}, {"display_order": 7, "name": "Child Immunization", "slug": "child_immunization"}, {"display_order": 8, "name": "Malaria", "slug": "malaria"}, {"display_order": 9, "name": "Medicines", "slug": "medicines"}, {"display_order": 10, "name": "Diagnostics", "slug": "diagnostics"}, {"display_order": 11, "name": "Infrastructure", "slug": "infrastructure"}, {"display_order": 12, "name": "Tuberculosis", "slug": "TB"}, {"display_order": 13, "name": "HIV", "slug": "HIV"}, {"display_order": 14, "name": "Curative Care", "slug": "curative_care"}], "name": "Health", "columns": [{"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Mobile Coverage", "name": "Mobile Coverage", "display_style": "checkmark_true", "display_order": 92, "description": "Facility has a currently functioning mobile coverage on the premises.", "clickable": true, "slug": "mobile_signal_funct_yn", "subgroups": ["infrastructure"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Power", "name": "Power", "display_style": "checkmark_true", "display_order": 93, "description": "Facility has access to a power source that is currently functional.", "clickable": true, "slug": "power_access_and_functional", "subgroups": ["infrastructure"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "TB testing", "name": "TB testing", "display_style": "checkmark_true", "display_order": 94, "description": "Facility offers testing of tuberculosis with microscopy.", "clickable": true, "slug": "lab_tests_tb_microscopy_calc", "subgroups": ["TB"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "TB treatment", "name": "TB treatment", "display_style": "checkmark_true", "display_order": 95, "description": "Facility offers treatment of tuberculosis.", "clickable": true, "slug": "tb_treatment_yn", "subgroups": ["TB"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "HIV Testing", "name": "HIV Testing", "display_style": "checkmark_true", "display_order": 96, "description": "Facility offers testing of HIV.", "clickable": true, "slug": "lab_tests_hiv_testing_calc", "subgroups": ["HIV"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "PMTCT", "name": "PMTCT", "display_style": "checkmark_true", "display_order": 97, "description": "Facility offers PMTCT services.", "clickable": true, "slug": "hiv_tx_srvcs_pmtct_services_calc", "subgroups": ["HIV"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "ARV Treatment", "name": "ARV Treatment", "display_style": "checkmark_true", "display_order": 98, "description": "Facility offers anti-retroviral (ARV) drugs to treat HIV/AIDS.", "clickable": true, "slug": "hiv_treatment_yn", "subgroups": ["HIV"]}, {"click_actions": ["piechart_false", "iconify"], "iconify_png_url": "./images/status_icons/false/", "descriptive_name": "Drug Stock Outs", "name": "Drug Stock Outs", "display_style": "checkmark_false", "display_order": 99, "description": "Facility has had a stockout of essental medications (antimalarials, antidiarrheals or antibiotics) for at least one week in the month prior to data collection.", "clickable": true, "slug": "essential_meds_stockout", "subgroups": ["curative_care"]}, {"click_actions": ["piechart_false", "iconify"], "iconify_png_url": "./images/status_icons/false/", "descriptive_name": "User fees", "name": "User fees", "display_style": "checkmark_false", "display_order": 100, "description": "Facility charges fees for health services.", "clickable": true, "slug": "health_no_user_fees", "subgroups": ["curative_care"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "IV treatments available", "name": "IV treatments available", "display_style": "checkmark_true", "display_order": 101, "description": "Facility has IV treatments available.", "clickable": true, "slug": "iv_medications_yn", "subgroups": ["curative_care"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "24/7 Curative Care", "name": "24/7 Curative Care", "display_style": "checkmark_true", "display_order": 102, "description": "Facility offers curative care 24 hours a day, 7 days a week.", "clickable": true, "slug": "facility_open_247_yn", "subgroups": ["curative_care"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Inpatient Care", "name": "Inpatient Care", "display_style": "checkmark_true", "display_order": 103, "description": "Facility offers inpatient care.", "clickable": true, "slug": "inpatient_care_yn", "subgroups": ["curative_care"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Potable water", "name": "Potable water", "display_style": "checkmark_true", "display_order": 90, "description": "Facility has access to potable water source that is currently functional.", "clickable": true, "slug": "potable_water_access", "subgroups": ["infrastructure"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Toilets/latrines", "name": "Toilets/latrines", "display_style": "checkmark_true", "display_order": 91, "description": "Facility had access to toilets/latrines for at least three weeks in the month prior to data collection.", "clickable": true, "slug": "improved_sanitation_and_functional", "subgroups": ["infrastructure"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "No user fees for malaria treatment", "name": "No user fees for malaria treatment", "display_style": "checkmark_true", "display_order": 64, "description": "Facility does not charge any user fees for malaria treatment", "clickable": true, "slug": "paid_services_malaria_treatment", "subgroups": ["malaria"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Antimalarials", "name": "Antimalarials", "display_style": "checkmark_true", "display_order": 65, "description": "Facility has antimalarial drugs available.", "clickable": true, "slug": "medication_anti_malarials", "subgroups": ["medicines"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Antibiotics", "name": "Antibiotics", "display_style": "checkmark_true", "display_order": 66, "description": "Facility has oral antibiotics available.", "clickable": true, "slug": "oral_antibiotics_calc", "subgroups": ["medicines"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Antihistamines", "name": "Antihistamines", "display_style": "checkmark_true", "display_order": 67, "description": "Facility has antihistamines available.", "clickable": true, "slug": "medication_antihistamines", "subgroups": ["medicines"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Anticonvulsant", "name": "Anticonvulsant", "display_style": "checkmark_true", "display_order": 68, "description": "Facility has anticonvulsants available.", "clickable": true, "slug": "emoc_parenteral_anticonvulsant", "subgroups": ["medicines"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Mebendazole", "name": "Mebendazole", "display_style": "checkmark_true", "display_order": 69, "description": "Facility has mebendazole available.", "clickable": true, "slug": "child_health_mebendazole", "subgroups": ["medicines"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Iron", "name": "Iron", "display_style": "checkmark_true", "display_order": 70, "description": "Facility has iron tablets available.", "clickable": true, "slug": "medication_iron_tablets", "subgroups": ["medicines"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Folic Acid", "name": "Folic Acid", "display_style": "checkmark_true", "display_order": 71, "description": "Facility has folic acid available.", "clickable": true, "slug": "medication_folic_acid", "subgroups": ["medicines"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "IV fluid", "name": "IV fluid", "display_style": "checkmark_true", "display_order": 72, "description": "Facility has IV fluids available.", "clickable": true, "slug": "medication_iv_fluid", "subgroups": ["medicines"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "IV antibiotics", "name": "IV antibiotics", "display_style": "checkmark_true", "display_order": 73, "description": "Facility has IV antibiotics available.", "clickable": true, "slug": "iv_antibiotics_yn_calc", "subgroups": ["medicines"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Uterotonics", "name": "Uterotonics", "display_style": "checkmark_true", "display_order": 74, "description": "Facility has IV or IM uterotonics.", "clickable": true, "slug": "uterotonics_yn_calc", "subgroups": ["medicines"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "BP machine", "name": "BP machine", "display_style": "checkmark_true", "display_order": 75, "description": "Facility has a blood pressure (BP) machine.", "clickable": true, "slug": "equipment_bp_machine", "subgroups": ["basic_equipment"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Thermometer", "name": "Thermometer", "display_style": "checkmark_true", "display_order": 76, "description": "Facility has a thermometer.", "clickable": true, "slug": "equipment_thermometr", "subgroups": ["basic_equipment"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Weighing scale", "name": "Weighing scale", "display_style": "checkmark_true", "display_order": 77, "description": "Facility has a weighing scale.", "clickable": true, "slug": "scale_yn", "subgroups": ["basic_equipment"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Sterilizer", "name": "Sterilizer", "display_style": "checkmark_true", "display_order": 78, "description": "Facility has a sterilizer.", "clickable": true, "slug": "equipment_sterilizer", "subgroups": ["basic_equipment"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Latex gloves", "name": "Latex gloves", "display_style": "checkmark_true", "display_order": 79, "description": "Facility has latex gloves available.", "clickable": true, "slug": "supplies_available_latex_gloves", "subgroups": ["basic_equipment"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Ice pack", "name": "Ice pack", "display_style": "checkmark_true", "display_order": 80, "description": "Facility has ice packs for cold storage.", "clickable": true, "slug": "vaccines_icepack_calc", "subgroups": ["basic_equipment"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Refrigerator", "name": "Refrigerator", "display_style": "checkmark_true", "display_order": 81, "description": "Faciilty has a refrigerator for cold storage.", "clickable": true, "slug": "equipment_refrigerator", "subgroups": ["basic_equipment"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Oxygen", "name": "Oxygen", "display_style": "checkmark_true", "display_order": 82, "description": "Facility has an oxygen tank.", "clickable": true, "slug": "compr_oc_oxygen_tank", "subgroups": ["basic_equipment"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Power", "name": "Power", "display_style": "checkmark_true", "display_order": 83, "description": "Facility has access to a power source that is currently functional.", "clickable": true, "slug": "power_access_and_functional", "subgroups": ["basic_equipment"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Malaria testing (microscopy or RDT)", "name": "Malaria testing (microscopy or RDT)", "display_style": "checkmark_true", "display_order": 84, "description": "Facility offers either malaria rapid diagnostic test (RDT) or malaria microscopy.", "clickable": true, "slug": "malaria_testing", "subgroups": ["diagnostics"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Urinalysis", "name": "Urinalysis", "display_style": "checkmark_true", "display_order": 85, "description": "Facility can perform urinalysis.", "clickable": true, "slug": "lab_tests_urine_testing_calc", "subgroups": ["diagnostics"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Pregnancy test", "name": "Pregnancy test", "display_style": "checkmark_true", "display_order": 86, "description": "Facility offers pregnancy testing.", "clickable": true, "slug": "lab_tests_pregnancy_calc", "subgroups": ["diagnostics"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "stool", "name": "stool", "display_style": "checkmark_true", "display_order": 87, "description": "Facility offers laboratory testing of stool.", "clickable": true, "slug": "lab_tests_stool_calc", "subgroups": ["diagnostics"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Hemoglobin", "name": "Hemoglobin", "display_style": "checkmark_true", "display_order": 88, "description": "Facility can perform measurement of a patient's hemoglobin.", "clickable": true, "slug": "lab_tests_hemoglobin_testing_calc", "subgroups": ["diagnostics"]}, {"descriptive_name": "Lab technicians", "description": "Number of full-time lab technicians on staff at the facility.", "display_order": 89, "name": "Lab technicians", "clickable": true, "slug": "num_lab_techs_fulltime", "subgroups": ["diagnostics"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Insecticide Treated Nets", "name": "Insecticide Treated Nets", "display_style": "checkmark_true", "display_order": 62, "description": "Facility has insecticide treated bednets (ITNs) available.", "clickable": true, "slug": "has_itns", "subgroups": ["malaria"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Malaria prevention during pregnancy", "name": "Malaria prevention during pregnancy", "display_style": "checkmark_true", "display_order": 63, "description": "Facility has available sulphadoxine pyrimethamine (SP or fansidar) for prevention of malaria during pregancy.", "clickable": true, "slug": "malaria_treatment_sulphadoxine", "subgroups": ["malaria"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "ACT", "name": "ACT", "display_style": "checkmark_true", "display_order": 61, "description": "Facility has artemisinin-based combination therapy (ACT) available.", "clickable": true, "slug": "malaria_treatment_artemisinin", "subgroups": ["malaria"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Tetanus", "name": "Tetanus", "display_style": "checkmark_true", "display_order": 53, "description": "Facility offers tetanus vaccination.", "clickable": true, "slug": "child_health_tetanus_immun_calc", "subgroups": ["child_immunization"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Hep B", "name": "Hep B", "display_style": "checkmark_true", "display_order": 54, "description": "Facility offers hepatitis B vaccination.", "clickable": true, "slug": "child_health_hepb_immunization_calc", "subgroups": ["child_immunization"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "BCG", "name": "BCG", "display_style": "checkmark_true", "display_order": 55, "description": "Facility offers BCG vaccination.", "clickable": true, "slug": "child_health_bcg_immunization_calc", "subgroups": ["child_immunization"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Yellow Fever", "name": "Yellow Fever", "display_style": "checkmark_true", "display_order": 56, "description": "Facility offers yellow fever vaccination.", "clickable": true, "slug": "child_health_yellow_fever_immun_calc", "subgroups": ["child_immunization"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "CSM", "name": "CSM", "display_style": "checkmark_true", "display_order": 57, "description": "Facility offers CSM vaccination.", "clickable": true, "slug": "child_health_csm_immunization_calc", "subgroups": ["child_immunization"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Ice pack", "name": "Ice pack", "display_style": "checkmark_true", "display_order": 58, "description": "Facility has ice packs for cold storage.", "clickable": true, "slug": "vaccines_icepack_calc", "subgroups": ["child_immunization"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Refrigerator", "name": "Refrigerator", "display_style": "checkmark_true", "display_order": 59, "description": "Faciilty has a refrigerator for cold storage.", "clickable": true, "slug": "equipment_refrigerator", "subgroups": ["child_immunization"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "RDT or Microscopy", "name": "RDT or Microscopy", "display_style": "checkmark_true", "display_order": 60, "description": "Facility offers testing for malaria either with rapid diagnostic tests (RDTs) or microscopy.", "clickable": true, "slug": "malaria_testing", "subgroups": ["malaria"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Growth monitoring", "name": "Growth monitoring", "display_style": "checkmark_true", "display_order": 48, "description": "Facility offers growth monitoring of children.", "clickable": true, "slug": "child_health_growth_monitor", "subgroups": ["child_nutrition"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Hemoglobin Kit", "name": "Hemoglobin Kit", "display_style": "checkmark_true", "display_order": 49, "description": "Facility can perform measurement of a patient's hemoglobin.", "clickable": true, "slug": "lab_tests_hemoglobin_testing_calc", "subgroups": ["child_nutrition"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Measles", "name": "Measles", "display_style": "checkmark_true", "display_order": 50, "description": "Facility offers measles vaccination.", "clickable": true, "slug": "child_health_measles_immun_calc", "subgroups": ["child_immunization"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Polio", "name": "Polio", "display_style": "checkmark_true", "display_order": 51, "description": "Facility offers oral polio vaccination.", "clickable": true, "slug": "child_health_opv_immuization_calc", "subgroups": ["child_immunization"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "DPT3", "name": "DPT3", "display_style": "checkmark_true", "display_order": 52, "description": "Facility offers DPT3 vaccination.", "clickable": true, "slug": "child_health_dpt_immunization_calc", "subgroups": ["child_immunization"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Blood Transfusion", "name": "Blood Transfusion", "display_style": "checkmark_true", "display_order": 39, "description": "Facility has the capacity to perform safe blood transfusion.", "clickable": true, "slug": "compr_oc_blood_transfusions", "subgroups": ["maternal_obstetrics2"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Cesarian section", "name": "Cesarian section", "display_style": "checkmark_true", "display_order": 40, "description": "Facility has the capacity to perform c-section.", "clickable": true, "slug": "compr_oc_c_sections", "subgroups": ["maternal_obstetrics1"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Condoms", "name": "Condoms", "display_style": "checkmark_true", "display_order": 41, "description": "Facility has condoms available.", "clickable": true, "slug": "condoms_yn", "subgroups": ["maternal_famplan"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Oral contraceptives", "name": "Oral contraceptives", "display_style": "checkmark_true", "display_order": 42, "description": "Facility has oral contraceptive pills available.", "clickable": true, "slug": "family_planning_pill_calc_calc", "subgroups": ["maternal_famplan"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Injectables", "name": "Injectables", "display_style": "checkmark_true", "display_order": 43, "description": "Facility has injectable contraceptive methods available.", "clickable": true, "slug": "family_planning_injectables_calc_calc", "subgroups": ["maternal_famplan"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "IUD", "name": "IUD", "display_style": "checkmark_true", "display_order": 44, "description": "Facility has intrauterine devices for long-term contraception available.", "clickable": true, "slug": "family_planning_iud_calc", "subgroups": ["maternal_famplan"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Implant", "name": "Implant", "display_style": "checkmark_true", "display_order": 45, "description": "Facility has contraceptive implants available.", "clickable": true, "slug": "family_planning_implants_calc", "subgroups": ["maternal_famplan"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Permanent methods", "name": "Permanent methods", "display_style": "checkmark_true", "display_order": 46, "description": "Facility offers permanent contraceptive methods (i.e., tubal ligation, vasectomy).", "clickable": true, "slug": "sterilization_yn_calc", "subgroups": ["maternal_famplan"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Weighing scale", "name": "Weighing scale", "display_style": "checkmark_true", "display_order": 47, "description": "Facility has a weighing scale.", "clickable": true, "slug": "scale_yn", "subgroups": ["child_nutrition"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Delivery Services 24/7", "name": "Delivery Services 24/7", "display_style": "checkmark_true", "display_order": 38, "description": "Facility can perform deliveries 24 hours a day, seven days a week.", "clickable": true, "slug": "maternal_health_delivery_services_24_7", "subgroups": ["maternal_obstetrics1"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Skilled birth attendant 4", "name": "Skilled birth attendant 4", "display_style": "checkmark_true", "display_order": 34, "description": "Facility has at least four skilled birth attendants (doctor, midwife or nurse-midwife) on staff.", "clickable": true, "slug": "at_least_four_skilled_birth_attendants", "subgroups": ["maternal_obstetrics2"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Vacuum Extractor", "name": "Vacuum Extractor", "display_style": "checkmark_true", "display_order": 35, "description": "Facility has a vacuum extractor.", "clickable": true, "slug": "emoc_vacuum_extractor", "subgroups": ["maternal_obstetrics1"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Forceps", "name": "Forceps", "display_style": "checkmark_true", "display_order": 36, "description": "Facility has obstetric forceps (for deliveries).", "clickable": true, "slug": "emoc_forceps", "subgroups": ["maternal_obstetrics1"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Power", "name": "Power", "display_style": "checkmark_true", "display_order": 37, "description": "Facility has access to a power source that is currently functional.", "clickable": true, "slug": "power_access_and_functional", "subgroups": ["maternal_obstetrics1"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Parenteral anti-convulsants", "name": "Parenteral anti-convulsants", "display_style": "checkmark_true", "display_order": 30, "description": "Facility has IV or IM anticonvulsants.", "clickable": true, "slug": "emoc_parenteral_anticonvulsant", "subgroups": ["maternal_obstetrics2"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Skilled birth attendant 1", "name": "Skilled birth attendant 1", "display_style": "checkmark_true", "display_order": 31, "description": "Facility has at least one skilled birth attendant (doctor, midwife or nurse-midwife) on staff.", "clickable": true, "slug": "skilled_birth_attendant", "subgroups": ["maternal_obstetrics2"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Skilled birth attendant 2", "name": "Skilled birth attendant 2", "display_style": "checkmark_true", "display_order": 32, "description": "Facility has at least two skilled birth attendants (doctor, midwife or nurse-midwife) on staff.", "clickable": true, "slug": "at_least_two_skilled_birth_attendants", "subgroups": ["maternal_obstetrics2"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Skilled birth attendant 3", "name": "Skilled birth attendant 3", "display_style": "checkmark_true", "display_order": 33, "description": "Facility has at least three skilled birth attendants (doctor, midwife or nurse-midwife) on staff.", "clickable": true, "slug": "at_least_three_skilled_birth_attendants", "subgroups": ["maternal_obstetrics2"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Uterotonics", "name": "Uterotonics", "display_style": "checkmark_true", "display_order": 28, "description": "Facility has uterotonics available.", "clickable": true, "slug": "uterotonics_yn_calc", "subgroups": ["maternal_obstetrics2"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Antishock garment", "name": "Antishock garment", "display_style": "checkmark_true", "display_order": 29, "description": "Facility has an anti-shock garment.", "clickable": true, "slug": "antishock_garment_yn", "subgroups": ["maternal_obstetrics2"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "IV Antibiotics", "name": "IV Antibiotics", "display_style": "checkmark_true", "display_order": 27, "description": "Facility has IV antibiotics available.", "clickable": true, "slug": "iv_antibiotics_yn_calc", "subgroups": ["maternal_obstetrics1"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Mobile Coverage", "name": "Mobile Coverage", "display_style": "checkmark_true", "display_order": 26, "description": "Facility has a currently functioning mobile coverage on the premises.", "clickable": true, "slug": "mobile_signal_funct_yn", "subgroups": ["maternal_obstetrics1"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Iron", "name": "Iron", "display_style": "checkmark_true", "display_order": 18, "description": "Facility has iron tablets available.", "clickable": true, "slug": "medication_iron_tablets", "subgroups": ["maternal_antenatal"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Folic Acid", "name": "Folic Acid", "display_style": "checkmark_true", "display_order": 19, "description": "Facility has folic acid available.", "clickable": true, "slug": "medication_folic_acid", "subgroups": ["maternal_antenatal"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Weighing scale", "name": "Weighing scale", "display_style": "checkmark_true", "display_order": 20, "description": "Facility has a weighing scale.", "clickable": true, "slug": "scale_yn", "subgroups": ["maternal_antenatal"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "BP machine", "name": "BP machine", "display_style": "checkmark_true", "display_order": 21, "description": "Facility has a blood pressure (BP) machine.", "clickable": true, "slug": "equipment_bp_machine", "subgroups": ["maternal_antenatal"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "PMTCT", "name": "PMTCT", "display_style": "checkmark_true", "display_order": 22, "description": "Facility offers PMTCT services.", "clickable": true, "slug": "hiv_tx_srvcs_pmtct_services_calc", "subgroups": ["maternal_antenatal"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Hemoglobin Measurement", "name": "Hemoglobin Measurement", "display_style": "checkmark_true", "display_order": 23, "description": "Facility can perform measurement of a patient's hemoglobin.", "clickable": true, "slug": "lab_tests_hemoglobin_testing_calc", "subgroups": ["maternal_antenatal"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Urinalysis", "name": "Urinalysis", "display_style": "checkmark_true", "display_order": 24, "description": "Facility can perform urinalysis.", "clickable": true, "slug": "lab_tests_urine_testing_calc", "subgroups": ["maternal_antenatal"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Access to Emergency Transport", "name": "Access to Emergency Transport", "display_style": "checkmark_true", "display_order": 25, "description": "Facility has access to emergency transport that is currently functional.", "clickable": true, "slug": "emergency_transport_currently_functioning", "subgroups": ["maternal_obstetrics1"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "SP (IPT for Malaria)", "name": "SP (IPT for Malaria)", "display_style": "checkmark_true", "display_order": 16, "description": "Facility provides antenatal care including sulphadoxine pyrimethamine (SP or fansidar) for the prevention of malaria during pregancy.", "clickable": true, "slug": "sulpha_and_antenatal", "subgroups": ["maternal_antenatal"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Insecticide Treated Nets", "name": "Insecticide Treated Nets", "display_style": "checkmark_true", "display_order": 17, "description": "Facility has insecticide treated bednets (ITNs) available.", "clickable": true, "slug": "has_itns", "subgroups": ["maternal_antenatal"]}, {"descriptive_name": "Doctors", "description": "Number of full-time doctors on staff at the facility.", "display_order": 13, "name": "Doctors", "clickable": true, "slug": "num_doctors_fulltime", "subgroups": ["staffing"]}, {"descriptive_name": "Lab technicians", "description": "Number of full-time lab technicians on staff at the facility.", "display_order": 14, "name": "Lab technicians", "clickable": true, "slug": "num_lab_techs_fulltime", "subgroups": ["staffing"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Salaried staff paid during last period", "name": "Salaried staff paid during last period", "display_style": "checkmark_true", "display_order": 15, "description": "Salary staff at the facility were paid their salaries during the last payment/financial period before data was collected.", "clickable": true, "slug": "staff_paid_lastmth_yn", "subgroups": ["staffing"]}, {"descriptive_name": "Midwives and Nurse-midwives", "description": "Number of full-time midwives and nurse-midwives on staff at the facility.", "display_order": 12, "name": "Midwives and Nurse-midwives", "clickable": true, "slug": "num_nursemidwives_fulltime", "subgroups": ["staffing"]}, {"descriptive_name": "Nurses", "description": "Number of full-time nurses on staff at the facility.", "display_order": 11, "name": "Nurses", "clickable": true, "slug": "num_nurses_fulltime", "subgroups": ["staffing"]}, {"descriptive_name": "CHEWs and JCHEWs", "description": "Number of full-time community health extension workers (CHEWs) and junior community health extension workers (JCHEWs) on staff at the facility.", "display_order": 10, "name": "CHEWs and JCHEWs", "clickable": true, "slug": "num_chews_total", "subgroups": ["staffing", ""]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Power", "name": "Power", "display_style": "checkmark_true", "display_order": 8, "description": "Facility has access to a power source that is currently functional.", "clickable": true, "slug": "power_access_and_functional", "subgroups": ["snapshot"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Comprehensive EmOC", "name": "Comprehensive EmOC", "display_style": "checkmark_true", "display_order": 9, "description": "Facility offers comprehensive  emergency obstetric care 24 hours a day, seven days a week. This includes all the components of Basic Emergency Obstetric Care with the addition of the ability to perform Caesarian Section and blood transfusion", "clickable": true, "slug": "comprehensive_obstetrics_yn", "subgroups": ["snapshot"]}, {"descriptive_name": "CHOs, CHEWs and JCHEWs", "description": "Number of full-time community health officers (CHOs), community health extension workers (CHEWs) and junior community health extension workers (JCHEWs) on staff at the facility.", "display_order": 7, "name": "CHOs, CHEWs and JCHEWs", "clickable": true, "slug": "num_chews_and_chos", "subgroups": ["snapshot"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "24/7 Curative Care", "name": "24/7 Curative Care", "display_style": "checkmark_true", "display_order": 2, "description": "Facility offers curative care 24 hours a day, 7 days a week.", "clickable": true, "slug": "facility_open_247_yn", "subgroups": ["snapshot"]}, {"click_actions": ["piechart_false", "iconify"], "iconify_png_url": "./images/status_icons/false/", "descriptive_name": "Drug Stock Outs", "name": "Drug Stock Outs", "display_style": "checkmark_false", "display_order": 3, "description": "Facility has had a stockout of essental medications (antimalarials, antidiarrheals or antibiotics) for at least one week in the month prior to data collection.", "clickable": true, "slug": "essential_meds_stockout", "subgroups": ["snapshot"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Skilled birth attendant", "name": "Skilled birth attendant", "display_style": "checkmark_true", "display_order": 6, "description": "Facility has at least one skilled birth attendant (doctor, midwife or nurse-midwife) on staff.", "clickable": true, "slug": "skilled_birth_attendant", "subgroups": ["snapshot"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Adequate Staffing", "name": "Adequate Staffing", "display_style": "checkmark_true", "display_order": 5, "description": "The facility's staffing meets Nigerian minimum standards for a facility of its type.", "clickable": true, "slug": "n/a", "subgroups": ["snapshot"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Access to Emergency Transport", "name": "Access to Emergency Transport", "display_style": "checkmark_true", "display_order": 4, "description": "Facility has access to emergency transport that is currently functional.", "clickable": true, "slug": "emergency_transport_currently_functioning", "subgroups": ["snapshot"]}, {"descriptive_name": "Name", "name": "Name", "display_order": 0, "clickable": false, "slug": "facility_name", "subgroups": ["snapshot", "staffing", "", "maternal_antenatal", "maternal_obstetrics1", "maternal_obstetrics2", "maternal_famplan", "child_nutrition", "child_immunization", "malaria", "medicines", "basic_equipment", "diagnostics", "infrastructure", "TB", "HIV", "curative_care"]}, {"click_actions": ["piechart_true", "iconify"], "iconify_png_url": "./images/status_icons/true/", "descriptive_name": "Delivery Services 24/7", "name": "Delivery Services 24/7", "display_style": "checkmark_true", "display_order": 1, "description": "Facility can perform deliveries 24 hours a day, seven days a week.", "clickable": true, "slug": "maternal_health_delivery_services_24_7", "subgroups": ["snapshot"]}], "slug": "health"}];
(function() {

  describe("nmis modules existence", function() {
    it("has modules defined", function() {
      var expectDefined;
      expectDefined = function(x) {
        return expect(x).toBeDefined();
      };
      expectDefined(NMIS);
      expectDefined(NMIS.Tabulation);
      expectDefined(NMIS.clear);
      expectDefined(NMIS.Sectors);
      expectDefined(NMIS.validateData);
      expectDefined(NMIS.dataForSector);
      expectDefined(NMIS.data);
      expectDefined(NMIS.FacilityPopup);
      expectDefined(NMIS.Breadcrumb);
      expectDefined(NMIS.IconSwitcher);
      return expectDefined(NMIS.MapMgr);
    });
    return it("can be initted", function() {
      var first_result;
      first_result = NMIS.init(data2, {
        iconSwitcher: false,
        sectors: sectors2
      });
      return expect(first_result).toBeTruthy();
    });
  });

}).call(this);
(function() {
  var mmgrDefaultOpts, start;

  describe("nmis", function() {
    beforeEach(function() {
      return NMIS.init(data, {
        iconSwitcher: false,
        sectors: sectors
      });
    });
    afterEach(function() {
      return NMIS.clear();
    });
    it("has tabulations_works", function() {
      var array_expected, array_result, result, with_keylist, with_keylist_expected;
      result = NMIS.Tabulation.sectorSlug("education", "something");
      expect(result).toEqual({
        "false": 7,
        "true": 3
      });
      array_result = NMIS.Tabulation.sectorSlugAsArray("education", "something");
      array_expected = [
        {
          occurrences: 'false',
          value: 7
        }, {
          occurrences: 'true',
          value: 3
        }
      ];
      expect(array_result).toEqual(array_expected);
      with_keylist = NMIS.Tabulation.sectorSlug("education", "something", ["true", "false", "maybe"]);
      with_keylist_expected = {
        'true': 3,
        'false': 7,
        'maybe': 0
      };
      return expect(with_keylist).toEqual(with_keylist_expected);
    });
    return it("has nmis.sectors", function() {
      expect(NMIS.Sectors.all().length).toBe(4);
      return expect(NMIS.Sectors.pluck('health').slug).toBe('health');
    });
  });

  describe("nmis_data", function() {
    return it("has validation", function() {
      NMIS.init(data2, {
        iconSwitcher: false,
        sectors: sectors2
      });
      expect(NMIS.validateData()).toBeTruthy();
      return expect(NMIS.dataForSector('health').length).toBe(10);
    });
  });

  describe("popup_works", function() {
    return it("has a popup", function() {
      var exFacility;
      NMIS.init(data2, {
        iconSwitcher: false,
        sectors: sectors2
      });
      exFacility = NMIS.data()[0];
      NMIS.FacilityPopup(exFacility, {
        addClass: 'test-elem'
      });
      return $('.ui-dialog').remove();
    });
  });

  describe("breadcrumbs", function() {
    beforeEach(function() {
      NMIS.Breadcrumb.clear();
      return NMIS.Breadcrumb.init('p.bc');
    });
    afterEach(function() {
      return NMIS.Breadcrumb.clear();
    });
    return it("can set breadcrumb", function() {
      var bc_levels;
      expect(NMIS.Breadcrumb._levels().length).toBe(0);
      bc_levels = [["Country", "/country"], ["State", "/country"], ["District", "/country/district"]];
      NMIS.Breadcrumb.setLevels(bc_levels);
      expect(NMIS.Breadcrumb._levels().length).toBe(3);
      NMIS.Breadcrumb.setLevel(2, ["LGA", "/country/lga"]);
      return NMIS.Breadcrumb.draw();
    });
  });

  describe("map_icons", function() {
    beforeEach(function() {
      return this.simpleItems = {
        item1: {
          sector: "health",
          name: "Clinic"
        },
        item2: {
          sector: "health",
          name: "Dispensary"
        },
        item3: {
          sector: "education",
          name: "Primary School"
        },
        item4: {
          sector: "education",
          name: "Secondary School"
        }
      };
    });
    it("has icon_manager", function() {
      NMIS.IconSwitcher.init({
        items: this.simpleItems
      });
      expect(NMIS.IconSwitcher.allShowing().length).toBe(0);
      NMIS.IconSwitcher.shiftStatus(function(id, item) {
        return "normal";
      });
      expect(NMIS.IconSwitcher.allShowing().length).toBe(4);
      NMIS.IconSwitcher.shiftStatus(function(id, item) {
        return false;
      });
      expect(NMIS.IconSwitcher.allShowing().length).toBe(0);
      expect(NMIS.IconSwitcher.all().length).toBe(4);
      expect(NMIS.IconSwitcher.filterStatus('normal').length).toBe(0);
      NMIS.IconSwitcher.shiftStatus(function(id, item) {
        return "normal";
      });
      expect(NMIS.IconSwitcher.all().length).toBe(4);
      expect(NMIS.IconSwitcher.filterStatus('normal').length).toBe(4);
      NMIS.IconSwitcher.shiftStatus(function(id, item) {
        if (item.name === "Dispensary") {
          return "normal";
        } else {
          return false;
        }
      });
      expect(NMIS.IconSwitcher.filterStatus('normal').length).toBe(1);
      expect(NMIS.IconSwitcher.allShowing().length).toBe(1);
      NMIS.IconSwitcher.shiftStatus(function(id, item) {
        if (item.name !== "Dispensary") {
          return "normal";
        } else {
          return false;
        }
      });
      expect(NMIS.IconSwitcher.filterStatus('normal').length).toBe(3);
      return expect(NMIS.IconSwitcher.allShowing().length).toBe(3);
    });
    return it("has iconswitcher callbacks working", function() {
      var hideCounter, newCounter;
      NMIS.IconSwitcher.init({
        items: this.simpleItems
      });
      newCounter = 0;
      hideCounter = 0;
      NMIS.IconSwitcher.setCallback("shiftMapItemStatus", function() {
        return newCounter++;
      });
      NMIS.IconSwitcher.setCallback("setMapItemVisibility", function(tf) {
        if (!tf) {
          return hideCounter++;
        }
      });
      NMIS.IconSwitcher.shiftStatus(function(id, item) {
        return "normal";
      });
      expect(newCounter).toBe(4);
      expect(hideCounter).toBe(0);
      NMIS.IconSwitcher.shiftStatus(function(id, item) {
        return false;
      });
      return expect(hideCounter).toBe(4);
    });
  });

  describe("map_icons_with_working_data", function() {
    beforeEach(function() {
      NMIS.init(data2, {
        iconSwitcher: false,
        sectors: sectors2
      });
      return NMIS.IconSwitcher.init({
        items: data2
      });
    });
    afterEach(function() {
      NMIS.IconSwitcher.clear();
      return NMIS.clear();
    });
    return it("icon_manager2", function() {
      expect(NMIS.IconSwitcher.all().length).toBe(30);
      return expect(NMIS.IconSwitcher.allShowing().length).toBe(0);
    });
  });

  mmgrDefaultOpts = {
    fake: true,
    fakeDelay: 0
  };

  start = function() {};

  describe("map manager", function() {
    beforeEach(function() {
      return this.mInit = NMIS.MapMgr.init(mmgrDefaultOpts);
    });
    afterEach(function() {
      return NMIS.MapMgr.clear();
    });
    it("has working map manager", function() {
      NMIS.MapMgr.addLoadCallback(function() {
        return start();
      });
      expect(this.mInit).toBeDefined();
      return expect(NMIS.MapMgr.isLoaded()).not.toBeTruthy();
    });
    return it("can be loaded twice without probs", function() {
      expect(NMIS.MapMgr.init(mmgrDefaultOpts)).toBeTruthy();
      return expect(NMIS.MapMgr.init(mmgrDefaultOpts)).toBeTruthy();
    });
  });

  describe("misc", function() {
    return it("has mapmgr playing nicely with other modules", function() {
      var value;
      value = 0;
      expect(value).toBe(0);
      NMIS.MapMgr.init({
        fake: true,
        fakeDelay: 0,
        loadCallbacks: [
          function() {
            return value++;
          }
        ]
      });
      return window.setTimeout((function() {
        expect(value).toBe(1);
        return log(value);
      }), 0);
    });
  });

}).call(this);





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
