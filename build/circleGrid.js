(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var seedRandom = require('seed-random');
var SimplexNoise = require('simplex-noise');
var defined = require('defined');

function createRandom (defaultSeed) {
  defaultSeed = defined(defaultSeed, null);
  var defaultRandom = Math.random;
  var currentSeed;
  var currentRandom;
  var noiseGenerator;
  var _nextGaussian = null;
  var _hasNextGaussian = false;

  setSeed(defaultSeed);

  return {
    value: value,
    createRandom: function (defaultSeed) {
      return createRandom(defaultSeed);
    },
    setSeed: setSeed,
    getSeed: getSeed,
    getRandomSeed: getRandomSeed,
    valueNonZero: valueNonZero,
    permuteNoise: permuteNoise,
    noise1D: noise1D,
    noise2D: noise2D,
    noise3D: noise3D,
    noise4D: noise4D,
    sign: sign,
    boolean: boolean,
    chance: chance,
    range: range,
    rangeFloor: rangeFloor,
    pick: pick,
    shuffle: shuffle,
    onCircle: onCircle,
    insideCircle: insideCircle,
    onSphere: onSphere,
    insideSphere: insideSphere,
    quaternion: quaternion,
    weighted: weighted,
    weightedSet: weightedSet,
    weightedSetIndex: weightedSetIndex,
    gaussian: gaussian
  };

  function setSeed (seed, opt) {
    if (typeof seed === 'number' || typeof seed === 'string') {
      currentSeed = seed;
      currentRandom = seedRandom(currentSeed, opt);
    } else {
      currentSeed = undefined;
      currentRandom = defaultRandom;
    }
    noiseGenerator = createNoise();
    _nextGaussian = null;
    _hasNextGaussian = false;
  }

  function value () {
    return currentRandom();
  }

  function valueNonZero () {
    var u = 0;
    while (u === 0) u = value();
    return u;
  }

  function getSeed () {
    return currentSeed;
  }

  function getRandomSeed () {
    var seed = String(Math.floor(Math.random() * 1000000));
    return seed;
  }

  function createNoise () {
    return new SimplexNoise(currentRandom);
  }

  function permuteNoise () {
    noiseGenerator = createNoise();
  }

  function noise1D (x, frequency, amplitude) {
    if (!isFinite(x)) throw new TypeError('x component for noise() must be finite');
    frequency = defined(frequency, 1);
    amplitude = defined(amplitude, 1);
    return amplitude * noiseGenerator.noise2D(x * frequency, 0);
  }

  function noise2D (x, y, frequency, amplitude) {
    if (!isFinite(x)) throw new TypeError('x component for noise() must be finite');
    if (!isFinite(y)) throw new TypeError('y component for noise() must be finite');
    frequency = defined(frequency, 1);
    amplitude = defined(amplitude, 1);
    return amplitude * noiseGenerator.noise2D(x * frequency, y * frequency);
  }

  function noise3D (x, y, z, frequency, amplitude) {
    if (!isFinite(x)) throw new TypeError('x component for noise() must be finite');
    if (!isFinite(y)) throw new TypeError('y component for noise() must be finite');
    if (!isFinite(z)) throw new TypeError('z component for noise() must be finite');
    frequency = defined(frequency, 1);
    amplitude = defined(amplitude, 1);
    return amplitude * noiseGenerator.noise3D(
      x * frequency,
      y * frequency,
      z * frequency
    );
  }

  function noise4D (x, y, z, w, frequency, amplitude) {
    if (!isFinite(x)) throw new TypeError('x component for noise() must be finite');
    if (!isFinite(y)) throw new TypeError('y component for noise() must be finite');
    if (!isFinite(z)) throw new TypeError('z component for noise() must be finite');
    if (!isFinite(w)) throw new TypeError('w component for noise() must be finite');
    frequency = defined(frequency, 1);
    amplitude = defined(amplitude, 1);
    return amplitude * noiseGenerator.noise4D(
      x * frequency,
      y * frequency,
      z * frequency,
      w * frequency
    );
  }

  function sign () {
    return boolean() ? 1 : -1;
  }

  function boolean () {
    return value() > 0.5;
  }

  function chance (n) {
    n = defined(n, 0.5);
    if (typeof n !== 'number') throw new TypeError('expected n to be a number');
    return value() < n;
  }

  function range (min, max) {
    if (max === undefined) {
      max = min;
      min = 0;
    }

    if (typeof min !== 'number' || typeof max !== 'number') {
      throw new TypeError('Expected all arguments to be numbers');
    }

    return value() * (max - min) + min;
  }

  function rangeFloor (min, max) {
    if (max === undefined) {
      max = min;
      min = 0;
    }

    if (typeof min !== 'number' || typeof max !== 'number') {
      throw new TypeError('Expected all arguments to be numbers');
    }

    return Math.floor(range(min, max));
  }

  function pick (array) {
    if (array.length === 0) return undefined;
    return array[rangeFloor(0, array.length)];
  }

  function shuffle (arr) {
    if (!Array.isArray(arr)) {
      throw new TypeError('Expected Array, got ' + typeof arr);
    }

    var rand;
    var tmp;
    var len = arr.length;
    var ret = arr.slice();
    while (len) {
      rand = Math.floor(value() * len--);
      tmp = ret[len];
      ret[len] = ret[rand];
      ret[rand] = tmp;
    }
    return ret;
  }

  function onCircle (radius, out) {
    radius = defined(radius, 1);
    out = out || [];
    var theta = value() * 2.0 * Math.PI;
    out[0] = radius * Math.cos(theta);
    out[1] = radius * Math.sin(theta);
    return out;
  }

  function insideCircle (radius, out) {
    radius = defined(radius, 1);
    out = out || [];
    onCircle(1, out);
    var r = radius * Math.sqrt(value());
    out[0] *= r;
    out[1] *= r;
    return out;
  }

  function onSphere (radius, out) {
    radius = defined(radius, 1);
    out = out || [];
    var u = value() * Math.PI * 2;
    var v = value() * 2 - 1;
    var phi = u;
    var theta = Math.acos(v);
    out[0] = radius * Math.sin(theta) * Math.cos(phi);
    out[1] = radius * Math.sin(theta) * Math.sin(phi);
    out[2] = radius * Math.cos(theta);
    return out;
  }

  function insideSphere (radius, out) {
    radius = defined(radius, 1);
    out = out || [];
    var u = value() * Math.PI * 2;
    var v = value() * 2 - 1;
    var k = value();

    var phi = u;
    var theta = Math.acos(v);
    var r = radius * Math.cbrt(k);
    out[0] = r * Math.sin(theta) * Math.cos(phi);
    out[1] = r * Math.sin(theta) * Math.sin(phi);
    out[2] = r * Math.cos(theta);
    return out;
  }

  function quaternion (out) {
    out = out || [];
    var u1 = value();
    var u2 = value();
    var u3 = value();

    var sq1 = Math.sqrt(1 - u1);
    var sq2 = Math.sqrt(u1);

    var theta1 = Math.PI * 2 * u2;
    var theta2 = Math.PI * 2 * u3;

    var x = Math.sin(theta1) * sq1;
    var y = Math.cos(theta1) * sq1;
    var z = Math.sin(theta2) * sq2;
    var w = Math.cos(theta2) * sq2;
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
  }

  function weightedSet (set) {
    set = set || [];
    if (set.length === 0) return null;
    return set[weightedSetIndex(set)].value;
  }

  function weightedSetIndex (set) {
    set = set || [];
    if (set.length === 0) return -1;
    return weighted(set.map(function (s) {
      return s.weight;
    }));
  }

  function weighted (weights) {
    weights = weights || [];
    if (weights.length === 0) return -1;
    var totalWeight = 0;
    var i;

    for (i = 0; i < weights.length; i++) {
      totalWeight += weights[i];
    }

    if (totalWeight <= 0) throw new Error('Weights must sum to > 0');

    var random = value() * totalWeight;
    for (i = 0; i < weights.length; i++) {
      if (random < weights[i]) {
        return i;
      }
      random -= weights[i];
    }
    return 0;
  }

  function gaussian (mean, standardDerivation) {
    mean = defined(mean, 0);
    standardDerivation = defined(standardDerivation, 1);

    // https://github.com/openjdk-mirror/jdk7u-jdk/blob/f4d80957e89a19a29bb9f9807d2a28351ed7f7df/src/share/classes/java/util/Random.java#L496
    if (_hasNextGaussian) {
      _hasNextGaussian = false;
      var result = _nextGaussian;
      _nextGaussian = null;
      return mean + standardDerivation * result;
    } else {
      var v1 = 0;
      var v2 = 0;
      var s = 0;
      do {
        v1 = value() * 2 - 1; // between -1 and 1
        v2 = value() * 2 - 1; // between -1 and 1
        s = v1 * v1 + v2 * v2;
      } while (s >= 1 || s === 0);
      var multiplier = Math.sqrt(-2 * Math.log(s) / s);
      _nextGaussian = (v2 * multiplier);
      _hasNextGaussian = true;
      return mean + standardDerivation * (v1 * multiplier);
    }
  }
}

module.exports = createRandom();

},{"defined":4,"seed-random":6,"simplex-noise":7}],2:[function(require,module,exports){
(function (global){
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('convert-length')) :
    typeof define === 'function' && define.amd ? define(['convert-length'], factory) :
    (global.canvasSketch = factory(null));
}(this, (function (convertLength) {

    convertLength = convertLength && convertLength.hasOwnProperty('default') ? convertLength['default'] : convertLength;

    var defined = function () {
        for (var i = 0; i < arguments.length; i++) {
            if (arguments[i] !== undefined) return arguments[i];
        }
    };

    /*
    object-assign
    (c) Sindre Sorhus
    @license MIT
    */
    /* eslint-disable no-unused-vars */
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var propIsEnumerable = Object.prototype.propertyIsEnumerable;

    function toObject(val) {
    	if (val === null || val === undefined) {
    		throw new TypeError('Object.assign cannot be called with null or undefined');
    	}

    	return Object(val);
    }

    function shouldUseNative() {
    	try {
    		if (!Object.assign) {
    			return false;
    		}

    		// Detect buggy property enumeration order in older V8 versions.

    		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
    		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
    		test1[5] = 'de';
    		if (Object.getOwnPropertyNames(test1)[0] === '5') {
    			return false;
    		}

    		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
    		var test2 = {};
    		for (var i = 0; i < 10; i++) {
    			test2['_' + String.fromCharCode(i)] = i;
    		}
    		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
    			return test2[n];
    		});
    		if (order2.join('') !== '0123456789') {
    			return false;
    		}

    		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
    		var test3 = {};
    		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
    			test3[letter] = letter;
    		});
    		if (Object.keys(Object.assign({}, test3)).join('') !==
    				'abcdefghijklmnopqrst') {
    			return false;
    		}

    		return true;
    	} catch (err) {
    		// We don't expect any of the above to throw, but better to be safe.
    		return false;
    	}
    }

    var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
    	var from;
    	var to = toObject(target);
    	var symbols;

    	for (var s = 1; s < arguments.length; s++) {
    		from = Object(arguments[s]);

    		for (var key in from) {
    			if (hasOwnProperty.call(from, key)) {
    				to[key] = from[key];
    			}
    		}

    		if (getOwnPropertySymbols) {
    			symbols = getOwnPropertySymbols(from);
    			for (var i = 0; i < symbols.length; i++) {
    				if (propIsEnumerable.call(from, symbols[i])) {
    					to[symbols[i]] = from[symbols[i]];
    				}
    			}
    		}
    	}

    	return to;
    };

    var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var browser =
      commonjsGlobal.performance &&
      commonjsGlobal.performance.now ? function now() {
        return performance.now()
      } : Date.now || function now() {
        return +new Date
      };

    var isPromise_1 = isPromise;

    function isPromise(obj) {
      return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
    }

    var isDom = isNode;

    function isNode (val) {
      return (!val || typeof val !== 'object')
        ? false
        : (typeof window === 'object' && typeof window.Node === 'object')
          ? (val instanceof window.Node)
          : (typeof val.nodeType === 'number') &&
            (typeof val.nodeName === 'string')
    }

    function getClientAPI() {
        return typeof window !== 'undefined' && window['canvas-sketch-cli'];
    }

    function isBrowser() {
        return typeof document !== 'undefined';
    }

    function isWebGLContext(ctx) {
        return typeof ctx.clear === 'function' && typeof ctx.clearColor === 'function' && typeof ctx.bufferData === 'function';
    }

    function isCanvas(element) {
        return isDom(element) && /canvas/i.test(element.nodeName) && typeof element.getContext === 'function';
    }

    var keys = createCommonjsModule(function (module, exports) {
    exports = module.exports = typeof Object.keys === 'function'
      ? Object.keys : shim;

    exports.shim = shim;
    function shim (obj) {
      var keys = [];
      for (var key in obj) keys.push(key);
      return keys;
    }
    });
    var keys_1 = keys.shim;

    var is_arguments = createCommonjsModule(function (module, exports) {
    var supportsArgumentsClass = (function(){
      return Object.prototype.toString.call(arguments)
    })() == '[object Arguments]';

    exports = module.exports = supportsArgumentsClass ? supported : unsupported;

    exports.supported = supported;
    function supported(object) {
      return Object.prototype.toString.call(object) == '[object Arguments]';
    }
    exports.unsupported = unsupported;
    function unsupported(object){
      return object &&
        typeof object == 'object' &&
        typeof object.length == 'number' &&
        Object.prototype.hasOwnProperty.call(object, 'callee') &&
        !Object.prototype.propertyIsEnumerable.call(object, 'callee') ||
        false;
    }});
    var is_arguments_1 = is_arguments.supported;
    var is_arguments_2 = is_arguments.unsupported;

    var deepEqual_1 = createCommonjsModule(function (module) {
    var pSlice = Array.prototype.slice;



    var deepEqual = module.exports = function (actual, expected, opts) {
      if (!opts) opts = {};
      // 7.1. All identical values are equivalent, as determined by ===.
      if (actual === expected) {
        return true;

      } else if (actual instanceof Date && expected instanceof Date) {
        return actual.getTime() === expected.getTime();

      // 7.3. Other pairs that do not both pass typeof value == 'object',
      // equivalence is determined by ==.
      } else if (!actual || !expected || typeof actual != 'object' && typeof expected != 'object') {
        return opts.strict ? actual === expected : actual == expected;

      // 7.4. For all other Object pairs, including Array objects, equivalence is
      // determined by having the same number of owned properties (as verified
      // with Object.prototype.hasOwnProperty.call), the same set of keys
      // (although not necessarily the same order), equivalent values for every
      // corresponding key, and an identical 'prototype' property. Note: this
      // accounts for both named and indexed properties on Arrays.
      } else {
        return objEquiv(actual, expected, opts);
      }
    };

    function isUndefinedOrNull(value) {
      return value === null || value === undefined;
    }

    function isBuffer (x) {
      if (!x || typeof x !== 'object' || typeof x.length !== 'number') return false;
      if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
        return false;
      }
      if (x.length > 0 && typeof x[0] !== 'number') return false;
      return true;
    }

    function objEquiv(a, b, opts) {
      var i, key;
      if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
        return false;
      // an identical 'prototype' property.
      if (a.prototype !== b.prototype) return false;
      //~~~I've managed to break Object.keys through screwy arguments passing.
      //   Converting to array solves the problem.
      if (is_arguments(a)) {
        if (!is_arguments(b)) {
          return false;
        }
        a = pSlice.call(a);
        b = pSlice.call(b);
        return deepEqual(a, b, opts);
      }
      if (isBuffer(a)) {
        if (!isBuffer(b)) {
          return false;
        }
        if (a.length !== b.length) return false;
        for (i = 0; i < a.length; i++) {
          if (a[i] !== b[i]) return false;
        }
        return true;
      }
      try {
        var ka = keys(a),
            kb = keys(b);
      } catch (e) {//happens when one is a string literal and the other isn't
        return false;
      }
      // having the same number of owned properties (keys incorporates
      // hasOwnProperty)
      if (ka.length != kb.length)
        return false;
      //the same set of keys (although not necessarily the same order),
      ka.sort();
      kb.sort();
      //~~~cheap key test
      for (i = ka.length - 1; i >= 0; i--) {
        if (ka[i] != kb[i])
          return false;
      }
      //equivalent values for every corresponding key, and
      //~~~possibly expensive deep test
      for (i = ka.length - 1; i >= 0; i--) {
        key = ka[i];
        if (!deepEqual(a[key], b[key], opts)) return false;
      }
      return typeof a === typeof b;
    }
    });

    var dateformat = createCommonjsModule(function (module, exports) {
    /*
     * Date Format 1.2.3
     * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
     * MIT license
     *
     * Includes enhancements by Scott Trenda <scott.trenda.net>
     * and Kris Kowal <cixar.com/~kris.kowal/>
     *
     * Accepts a date, a mask, or a date and a mask.
     * Returns a formatted version of the given date.
     * The date defaults to the current date/time.
     * The mask defaults to dateFormat.masks.default.
     */

    (function(global) {

      var dateFormat = (function() {
          var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZWN]|"[^"]*"|'[^']*'/g;
          var timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
          var timezoneClip = /[^-+\dA-Z]/g;
      
          // Regexes and supporting functions are cached through closure
          return function (date, mask, utc, gmt) {
      
            // You can't provide utc if you skip other args (use the 'UTC:' mask prefix)
            if (arguments.length === 1 && kindOf(date) === 'string' && !/\d/.test(date)) {
              mask = date;
              date = undefined;
            }
      
            date = date || new Date;
      
            if(!(date instanceof Date)) {
              date = new Date(date);
            }
      
            if (isNaN(date)) {
              throw TypeError('Invalid date');
            }
      
            mask = String(dateFormat.masks[mask] || mask || dateFormat.masks['default']);
      
            // Allow setting the utc/gmt argument via the mask
            var maskSlice = mask.slice(0, 4);
            if (maskSlice === 'UTC:' || maskSlice === 'GMT:') {
              mask = mask.slice(4);
              utc = true;
              if (maskSlice === 'GMT:') {
                gmt = true;
              }
            }
      
            var _ = utc ? 'getUTC' : 'get';
            var d = date[_ + 'Date']();
            var D = date[_ + 'Day']();
            var m = date[_ + 'Month']();
            var y = date[_ + 'FullYear']();
            var H = date[_ + 'Hours']();
            var M = date[_ + 'Minutes']();
            var s = date[_ + 'Seconds']();
            var L = date[_ + 'Milliseconds']();
            var o = utc ? 0 : date.getTimezoneOffset();
            var W = getWeek(date);
            var N = getDayOfWeek(date);
            var flags = {
              d:    d,
              dd:   pad(d),
              ddd:  dateFormat.i18n.dayNames[D],
              dddd: dateFormat.i18n.dayNames[D + 7],
              m:    m + 1,
              mm:   pad(m + 1),
              mmm:  dateFormat.i18n.monthNames[m],
              mmmm: dateFormat.i18n.monthNames[m + 12],
              yy:   String(y).slice(2),
              yyyy: y,
              h:    H % 12 || 12,
              hh:   pad(H % 12 || 12),
              H:    H,
              HH:   pad(H),
              M:    M,
              MM:   pad(M),
              s:    s,
              ss:   pad(s),
              l:    pad(L, 3),
              L:    pad(Math.round(L / 10)),
              t:    H < 12 ? dateFormat.i18n.timeNames[0] : dateFormat.i18n.timeNames[1],
              tt:   H < 12 ? dateFormat.i18n.timeNames[2] : dateFormat.i18n.timeNames[3],
              T:    H < 12 ? dateFormat.i18n.timeNames[4] : dateFormat.i18n.timeNames[5],
              TT:   H < 12 ? dateFormat.i18n.timeNames[6] : dateFormat.i18n.timeNames[7],
              Z:    gmt ? 'GMT' : utc ? 'UTC' : (String(date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
              o:    (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
              S:    ['th', 'st', 'nd', 'rd'][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10],
              W:    W,
              N:    N
            };
      
            return mask.replace(token, function (match) {
              if (match in flags) {
                return flags[match];
              }
              return match.slice(1, match.length - 1);
            });
          };
        })();

      dateFormat.masks = {
        'default':               'ddd mmm dd yyyy HH:MM:ss',
        'shortDate':             'm/d/yy',
        'mediumDate':            'mmm d, yyyy',
        'longDate':              'mmmm d, yyyy',
        'fullDate':              'dddd, mmmm d, yyyy',
        'shortTime':             'h:MM TT',
        'mediumTime':            'h:MM:ss TT',
        'longTime':              'h:MM:ss TT Z',
        'isoDate':               'yyyy-mm-dd',
        'isoTime':               'HH:MM:ss',
        'isoDateTime':           'yyyy-mm-dd\'T\'HH:MM:sso',
        'isoUtcDateTime':        'UTC:yyyy-mm-dd\'T\'HH:MM:ss\'Z\'',
        'expiresHeaderFormat':   'ddd, dd mmm yyyy HH:MM:ss Z'
      };

      // Internationalization strings
      dateFormat.i18n = {
        dayNames: [
          'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
          'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
        ],
        monthNames: [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
          'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
        ],
        timeNames: [
          'a', 'p', 'am', 'pm', 'A', 'P', 'AM', 'PM'
        ]
      };

    function pad(val, len) {
      val = String(val);
      len = len || 2;
      while (val.length < len) {
        val = '0' + val;
      }
      return val;
    }

    /**
     * Get the ISO 8601 week number
     * Based on comments from
     * http://techblog.procurios.nl/k/n618/news/view/33796/14863/Calculate-ISO-8601-week-and-year-in-javascript.html
     *
     * @param  {Object} `date`
     * @return {Number}
     */
    function getWeek(date) {
      // Remove time components of date
      var targetThursday = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      // Change date to Thursday same week
      targetThursday.setDate(targetThursday.getDate() - ((targetThursday.getDay() + 6) % 7) + 3);

      // Take January 4th as it is always in week 1 (see ISO 8601)
      var firstThursday = new Date(targetThursday.getFullYear(), 0, 4);

      // Change date to Thursday same week
      firstThursday.setDate(firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3);

      // Check if daylight-saving-time-switch occurred and correct for it
      var ds = targetThursday.getTimezoneOffset() - firstThursday.getTimezoneOffset();
      targetThursday.setHours(targetThursday.getHours() - ds);

      // Number of weeks between target Thursday and first Thursday
      var weekDiff = (targetThursday - firstThursday) / (86400000*7);
      return 1 + Math.floor(weekDiff);
    }

    /**
     * Get ISO-8601 numeric representation of the day of the week
     * 1 (for Monday) through 7 (for Sunday)
     * 
     * @param  {Object} `date`
     * @return {Number}
     */
    function getDayOfWeek(date) {
      var dow = date.getDay();
      if(dow === 0) {
        dow = 7;
      }
      return dow;
    }

    /**
     * kind-of shortcut
     * @param  {*} val
     * @return {String}
     */
    function kindOf(val) {
      if (val === null) {
        return 'null';
      }

      if (val === undefined) {
        return 'undefined';
      }

      if (typeof val !== 'object') {
        return typeof val;
      }

      if (Array.isArray(val)) {
        return 'array';
      }

      return {}.toString.call(val)
        .slice(8, -1).toLowerCase();
    }


      if (typeof undefined === 'function' && undefined.amd) {
        undefined(function () {
          return dateFormat;
        });
      } else {
        module.exports = dateFormat;
      }
    })(commonjsGlobal);
    });

    /*!
     * repeat-string <https://github.com/jonschlinkert/repeat-string>
     *
     * Copyright (c) 2014-2015, Jon Schlinkert.
     * Licensed under the MIT License.
     */

    /**
     * Results cache
     */

    var res = '';
    var cache;

    /**
     * Expose `repeat`
     */

    var repeatString = repeat;

    /**
     * Repeat the given `string` the specified `number`
     * of times.
     *
     * **Example:**
     *
     * ```js
     * var repeat = require('repeat-string');
     * repeat('A', 5);
     * //=> AAAAA
     * ```
     *
     * @param {String} `string` The string to repeat
     * @param {Number} `number` The number of times to repeat the string
     * @return {String} Repeated string
     * @api public
     */

    function repeat(str, num) {
      if (typeof str !== 'string') {
        throw new TypeError('expected a string');
      }

      // cover common, quick use cases
      if (num === 1) return str;
      if (num === 2) return str + str;

      var max = str.length * num;
      if (cache !== str || typeof cache === 'undefined') {
        cache = str;
        res = '';
      } else if (res.length >= max) {
        return res.substr(0, max);
      }

      while (max > res.length && num > 1) {
        if (num & 1) {
          res += str;
        }

        num >>= 1;
        str += str;
      }

      res += str;
      res = res.substr(0, max);
      return res;
    }

    var padLeft = function padLeft(str, num, ch) {
      str = str.toString();

      if (typeof num === 'undefined') {
        return str;
      }

      if (ch === 0) {
        ch = '0';
      } else if (ch) {
        ch = ch.toString();
      } else {
        ch = ' ';
      }

      return repeatString(ch, num - str.length) + str;
    };

    var noop = function () {};
    var link;
    var supportedEncodings = ['image/png','image/jpeg','image/webp'];
    function exportCanvas(canvas, opt) {
        if ( opt === void 0 ) opt = {};

        var encoding = opt.encoding || 'image/png';
        if (!supportedEncodings.includes(encoding)) 
            { throw new Error(("Invalid canvas encoding " + encoding)); }
        var extension = (encoding.split('/')[1] || '').replace(/jpeg/i, 'jpg');
        if (extension) 
            { extension = ("." + extension).toLowerCase(); }
        return {
            extension: extension,
            type: encoding,
            dataURL: canvas.toDataURL(encoding, opt.encodingQuality)
        };
    }

    function createBlobFromDataURL(dataURL) {
        return new Promise(function (resolve) {
            var splitIndex = dataURL.indexOf(',');
            if (splitIndex === -1) {
                resolve(new window.Blob());
                return;
            }
            var base64 = dataURL.slice(splitIndex + 1);
            var byteString = window.atob(base64);
            var mimeMatch = /data:([^;+]);/.exec(dataURL);
            var mime = (mimeMatch ? mimeMatch[1] : '') || undefined;
            var ab = new ArrayBuffer(byteString.length);
            var ia = new Uint8Array(ab);
            for (var i = 0;i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            resolve(new window.Blob([ab], {
                type: mime
            }));
        });
    }

    function saveDataURL(dataURL, opts) {
        if ( opts === void 0 ) opts = {};

        return createBlobFromDataURL(dataURL).then(function (blob) { return saveBlob(blob, opts); });
    }

    function saveBlob(blob, opts) {
        if ( opts === void 0 ) opts = {};

        return new Promise(function (resolve) {
            opts = objectAssign({
                extension: '',
                prefix: '',
                suffix: ''
            }, opts);
            var filename = resolveFilename(opts);
            var client = getClientAPI();
            if (client && typeof client.saveBlob === 'function' && client.output) {
                return client.saveBlob(blob, objectAssign({}, opts, {
                    filename: filename
                })).then(function (ev) { return resolve(ev); });
            } else {
                if (!link) {
                    link = document.createElement('a');
                    link.style.visibility = 'hidden';
                    link.target = '_blank';
                }
                link.download = filename;
                link.href = window.URL.createObjectURL(blob);
                document.body.appendChild(link);
                link.onclick = (function () {
                    link.onclick = noop;
                    setTimeout(function () {
                        window.URL.revokeObjectURL(blob);
                        document.body.removeChild(link);
                        link.removeAttribute('href');
                        resolve({
                            filename: filename,
                            client: false
                        });
                    });
                });
                link.click();
            }
        });
    }

    function saveFile(data, opts) {
        if ( opts === void 0 ) opts = {};

        var parts = Array.isArray(data) ? data : [data];
        var blob = new window.Blob(parts, {
            type: opts.type || ''
        });
        return saveBlob(blob, opts);
    }

    function getFileName() {
        var dateFormatStr = "yyyy.mm.dd-HH.MM.ss";
        return dateformat(new Date(), dateFormatStr);
    }

    function resolveFilename(opt) {
        if ( opt === void 0 ) opt = {};

        opt = objectAssign({}, opt);
        if (typeof opt.file === 'function') {
            return opt.file(opt);
        } else if (opt.file) {
            return opt.file;
        }
        var frame = null;
        var extension = '';
        if (typeof opt.extension === 'string') 
            { extension = opt.extension; }
        if (typeof opt.frame === 'number') {
            var totalFrames;
            if (typeof opt.totalFrames === 'number') {
                totalFrames = opt.totalFrames;
            } else {
                totalFrames = Math.max(1000, opt.frame);
            }
            frame = padLeft(String(opt.frame), String(totalFrames).length, '0');
        }
        var layerStr = isFinite(opt.totalLayers) && isFinite(opt.layer) && opt.totalLayers > 1 ? ("" + (opt.layer)) : '';
        if (frame != null) {
            return [layerStr,frame].filter(Boolean).join('-') + extension;
        } else {
            var defaultFileName = opt.timeStamp;
            return [opt.prefix,opt.name || defaultFileName,layerStr,opt.hash,opt.suffix].filter(Boolean).join('-') + extension;
        }
    }

    var commonTypos = {
        dimension: 'dimensions',
        animated: 'animate',
        animating: 'animate',
        unit: 'units',
        P5: 'p5',
        pixellated: 'pixelated',
        looping: 'loop',
        pixelPerInch: 'pixels'
    };
    var allKeys = ['dimensions','units','pixelsPerInch','orientation','scaleToFit',
        'scaleToView','bleed','pixelRatio','exportPixelRatio','maxPixelRatio','scaleContext',
        'resizeCanvas','styleCanvas','canvas','context','attributes','parent','file',
        'name','prefix','suffix','animate','playing','loop','duration','totalFrames',
        'fps','playbackRate','timeScale','frame','time','flush','pixelated','hotkeys',
        'p5','id','scaleToFitPadding','data','params','encoding','encodingQuality'];
    var checkSettings = function (settings) {
        var keys = Object.keys(settings);
        keys.forEach(function (key) {
            if (key in commonTypos) {
                var actual = commonTypos[key];
                console.warn(("[canvas-sketch] Could not recognize the setting \"" + key + "\", did you mean \"" + actual + "\"?"));
            } else if (!allKeys.includes(key)) {
                console.warn(("[canvas-sketch] Could not recognize the setting \"" + key + "\""));
            }
        });
    };

    function keyboardShortcuts (opt) {
        if ( opt === void 0 ) opt = {};

        var handler = function (ev) {
            if (!opt.enabled()) 
                { return; }
            var client = getClientAPI();
            if (ev.keyCode === 83 && !ev.altKey && (ev.metaKey || ev.ctrlKey)) {
                ev.preventDefault();
                opt.save(ev);
            } else if (ev.keyCode === 32) {
                opt.togglePlay(ev);
            } else if (client && !ev.altKey && ev.keyCode === 75 && (ev.metaKey || ev.ctrlKey)) {
                ev.preventDefault();
                opt.commit(ev);
            }
        };
        var attach = function () {
            window.addEventListener('keydown', handler);
        };
        var detach = function () {
            window.removeEventListener('keydown', handler);
        };
        return {
            attach: attach,
            detach: detach
        };
    }

    var defaultUnits = 'mm';
    var data = [['postcard',101.6,152.4],['poster-small',280,430],['poster',460,610],
        ['poster-large',610,910],['business-card',50.8,88.9],['2r',64,89],['3r',89,127],
        ['4r',102,152],['5r',127,178],['6r',152,203],['8r',203,254],['10r',254,305],['11r',
        279,356],['12r',305,381],['a0',841,1189],['a1',594,841],['a2',420,594],['a3',
        297,420],['a4',210,297],['a5',148,210],['a6',105,148],['a7',74,105],['a8',52,
        74],['a9',37,52],['a10',26,37],['2a0',1189,1682],['4a0',1682,2378],['b0',1000,
        1414],['b1',707,1000],['b1+',720,1020],['b2',500,707],['b2+',520,720],['b3',353,
        500],['b4',250,353],['b5',176,250],['b6',125,176],['b7',88,125],['b8',62,88],
        ['b9',44,62],['b10',31,44],['b11',22,32],['b12',16,22],['c0',917,1297],['c1',
        648,917],['c2',458,648],['c3',324,458],['c4',229,324],['c5',162,229],['c6',114,
        162],['c7',81,114],['c8',57,81],['c9',40,57],['c10',28,40],['c11',22,32],['c12',
        16,22],['half-letter',5.5,8.5,'in'],['letter',8.5,11,'in'],['legal',8.5,14,'in'],
        ['junior-legal',5,8,'in'],['ledger',11,17,'in'],['tabloid',11,17,'in'],['ansi-a',
        8.5,11.0,'in'],['ansi-b',11.0,17.0,'in'],['ansi-c',17.0,22.0,'in'],['ansi-d',
        22.0,34.0,'in'],['ansi-e',34.0,44.0,'in'],['arch-a',9,12,'in'],['arch-b',12,18,
        'in'],['arch-c',18,24,'in'],['arch-d',24,36,'in'],['arch-e',36,48,'in'],['arch-e1',
        30,42,'in'],['arch-e2',26,38,'in'],['arch-e3',27,39,'in']];
    var paperSizes = data.reduce(function (dict, preset) {
        var item = {
            units: preset[3] || defaultUnits,
            dimensions: [preset[1],preset[2]]
        };
        dict[preset[0]] = item;
        dict[preset[0].replace(/-/g, ' ')] = item;
        return dict;
    }, {})

    function getDimensionsFromPreset(dimensions, unitsTo, pixelsPerInch) {
        if ( unitsTo === void 0 ) unitsTo = 'px';
        if ( pixelsPerInch === void 0 ) pixelsPerInch = 72;

        if (typeof dimensions === 'string') {
            var key = dimensions.toLowerCase();
            if (!(key in paperSizes)) {
                throw new Error(("The dimension preset \"" + dimensions + "\" is not supported or could not be found; try using a4, a3, postcard, letter, etc."));
            }
            var preset = paperSizes[key];
            return preset.dimensions.map(function (d) { return convertDistance(d, preset.units, unitsTo, pixelsPerInch); });
        } else {
            return dimensions;
        }
    }

    function convertDistance(dimension, unitsFrom, unitsTo, pixelsPerInch) {
        if ( unitsFrom === void 0 ) unitsFrom = 'px';
        if ( unitsTo === void 0 ) unitsTo = 'px';
        if ( pixelsPerInch === void 0 ) pixelsPerInch = 72;

        return convertLength(dimension, unitsFrom, unitsTo, {
            pixelsPerInch: pixelsPerInch,
            precision: 4,
            roundPixel: true
        });
    }

    function checkIfHasDimensions(settings) {
        if (!settings.dimensions) 
            { return false; }
        if (typeof settings.dimensions === 'string') 
            { return true; }
        if (Array.isArray(settings.dimensions) && settings.dimensions.length >= 2) 
            { return true; }
        return false;
    }

    function getParentSize(props, settings) {
        if (!isBrowser()) {
            return [300,150];
        }
        var element = settings.parent || window;
        if (element === window || element === document || element === document.body) {
            return [window.innerWidth,window.innerHeight];
        } else {
            var ref = element.getBoundingClientRect();
            var width = ref.width;
            var height = ref.height;
            return [width,height];
        }
    }

    function resizeCanvas(props, settings) {
        var width, height;
        var styleWidth, styleHeight;
        var canvasWidth, canvasHeight;
        var browser = isBrowser();
        var dimensions = settings.dimensions;
        var hasDimensions = checkIfHasDimensions(settings);
        var exporting = props.exporting;
        var scaleToFit = hasDimensions ? settings.scaleToFit !== false : false;
        var scaleToView = !exporting && hasDimensions ? settings.scaleToView : true;
        if (!browser) 
            { scaleToFit = (scaleToView = false); }
        var units = settings.units;
        var pixelsPerInch = typeof settings.pixelsPerInch === 'number' && isFinite(settings.pixelsPerInch) ? settings.pixelsPerInch : 72;
        var bleed = defined(settings.bleed, 0);
        var devicePixelRatio = browser ? window.devicePixelRatio : 1;
        var basePixelRatio = scaleToView ? devicePixelRatio : 1;
        var pixelRatio, exportPixelRatio;
        if (typeof settings.pixelRatio === 'number' && isFinite(settings.pixelRatio)) {
            pixelRatio = settings.pixelRatio;
            exportPixelRatio = defined(settings.exportPixelRatio, pixelRatio);
        } else {
            if (hasDimensions) {
                pixelRatio = basePixelRatio;
                exportPixelRatio = defined(settings.exportPixelRatio, 1);
            } else {
                pixelRatio = devicePixelRatio;
                exportPixelRatio = defined(settings.exportPixelRatio, pixelRatio);
            }
        }
        if (typeof settings.maxPixelRatio === 'number' && isFinite(settings.maxPixelRatio)) {
            pixelRatio = Math.min(settings.maxPixelRatio, pixelRatio);
            exportPixelRatio = Math.min(settings.maxPixelRatio, exportPixelRatio);
        }
        if (exporting) {
            pixelRatio = exportPixelRatio;
        }
        var ref = getParentSize(props, settings);
        var parentWidth = ref[0];
        var parentHeight = ref[1];
        var trimWidth, trimHeight;
        if (hasDimensions) {
            var result = getDimensionsFromPreset(dimensions, units, pixelsPerInch);
            var highest = Math.max(result[0], result[1]);
            var lowest = Math.min(result[0], result[1]);
            if (settings.orientation) {
                var landscape = settings.orientation === 'landscape';
                width = landscape ? highest : lowest;
                height = landscape ? lowest : highest;
            } else {
                width = result[0];
                height = result[1];
            }
            trimWidth = width;
            trimHeight = height;
            width += bleed * 2;
            height += bleed * 2;
        } else {
            width = parentWidth;
            height = parentHeight;
            trimWidth = width;
            trimHeight = height;
        }
        var realWidth = width;
        var realHeight = height;
        if (hasDimensions && units) {
            realWidth = convertDistance(width, units, 'px', pixelsPerInch);
            realHeight = convertDistance(height, units, 'px', pixelsPerInch);
        }
        styleWidth = Math.round(realWidth);
        styleHeight = Math.round(realHeight);
        if (scaleToFit && !exporting && hasDimensions) {
            var aspect = width / height;
            var windowAspect = parentWidth / parentHeight;
            var scaleToFitPadding = defined(settings.scaleToFitPadding, 40);
            var maxWidth = Math.round(parentWidth - scaleToFitPadding * 2);
            var maxHeight = Math.round(parentHeight - scaleToFitPadding * 2);
            if (styleWidth > maxWidth || styleHeight > maxHeight) {
                if (windowAspect > aspect) {
                    styleHeight = maxHeight;
                    styleWidth = Math.round(styleHeight * aspect);
                } else {
                    styleWidth = maxWidth;
                    styleHeight = Math.round(styleWidth / aspect);
                }
            }
        }
        canvasWidth = scaleToView ? Math.round(pixelRatio * styleWidth) : Math.round(pixelRatio * realWidth);
        canvasHeight = scaleToView ? Math.round(pixelRatio * styleHeight) : Math.round(pixelRatio * realHeight);
        var viewportWidth = scaleToView ? Math.round(styleWidth) : Math.round(realWidth);
        var viewportHeight = scaleToView ? Math.round(styleHeight) : Math.round(realHeight);
        var scaleX = canvasWidth / width;
        var scaleY = canvasHeight / height;
        return {
            bleed: bleed,
            pixelRatio: pixelRatio,
            width: width,
            height: height,
            dimensions: [width,height],
            units: units || 'px',
            scaleX: scaleX,
            scaleY: scaleY,
            viewportWidth: viewportWidth,
            viewportHeight: viewportHeight,
            canvasWidth: canvasWidth,
            canvasHeight: canvasHeight,
            trimWidth: trimWidth,
            trimHeight: trimHeight,
            styleWidth: styleWidth,
            styleHeight: styleHeight
        };
    }

    var getCanvasContext_1 = getCanvasContext;
    function getCanvasContext (type, opts) {
      if (typeof type !== 'string') {
        throw new TypeError('must specify type string')
      }

      opts = opts || {};

      if (typeof document === 'undefined' && !opts.canvas) {
        return null // check for Node
      }

      var canvas = opts.canvas || document.createElement('canvas');
      if (typeof opts.width === 'number') {
        canvas.width = opts.width;
      }
      if (typeof opts.height === 'number') {
        canvas.height = opts.height;
      }

      var attribs = opts;
      var gl;
      try {
        var names = [ type ];
        // prefix GL contexts
        if (type.indexOf('webgl') === 0) {
          names.push('experimental-' + type);
        }

        for (var i = 0; i < names.length; i++) {
          gl = canvas.getContext(names[i], attribs);
          if (gl) return gl
        }
      } catch (e) {
        gl = null;
      }
      return (gl || null) // ensure null on fail
    }

    function createCanvasElement() {
        if (!isBrowser()) {
            throw new Error('It appears you are runing from Node.js or a non-browser environment. Try passing in an existing { canvas } interface instead.');
        }
        return document.createElement('canvas');
    }

    function createCanvas(settings) {
        if ( settings === void 0 ) settings = {};

        var context, canvas;
        var ownsCanvas = false;
        if (settings.canvas !== false) {
            context = settings.context;
            if (!context || typeof context === 'string') {
                var newCanvas = settings.canvas;
                if (!newCanvas) {
                    newCanvas = createCanvasElement();
                    ownsCanvas = true;
                }
                var type = context || '2d';
                if (typeof newCanvas.getContext !== 'function') {
                    throw new Error("The specified { canvas } element does not have a getContext() function, maybe it is not a <canvas> tag?");
                }
                context = getCanvasContext_1(type, objectAssign({}, settings.attributes, {
                    canvas: newCanvas
                }));
                if (!context) {
                    throw new Error(("Failed at canvas.getContext('" + type + "') - the browser may not support this context, or a different context may already be in use with this canvas."));
                }
            }
            canvas = context.canvas;
            if (settings.canvas && canvas !== settings.canvas) {
                throw new Error('The { canvas } and { context } settings must point to the same underlying canvas element');
            }
            if (settings.pixelated) {
                context.imageSmoothingEnabled = false;
                context.mozImageSmoothingEnabled = false;
                context.oImageSmoothingEnabled = false;
                context.webkitImageSmoothingEnabled = false;
                context.msImageSmoothingEnabled = false;
                canvas.style['image-rendering'] = 'pixelated';
            }
        }
        return {
            canvas: canvas,
            context: context,
            ownsCanvas: ownsCanvas
        };
    }

    var SketchManager = function SketchManager() {
        var this$1 = this;

        this._settings = {};
        this._props = {};
        this._sketch = undefined;
        this._raf = null;
        this._lastRedrawResult = undefined;
        this._isP5Resizing = false;
        this._keyboardShortcuts = keyboardShortcuts({
            enabled: function () { return this$1.settings.hotkeys !== false; },
            save: function (ev) {
                if (ev.shiftKey) {
                    if (this$1.props.recording) {
                        this$1.endRecord();
                        this$1.run();
                    } else 
                        { this$1.record(); }
                } else 
                    { this$1.exportFrame(); }
            },
            togglePlay: function () {
                if (this$1.props.playing) 
                    { this$1.pause(); }
                 else 
                    { this$1.play(); }
            },
            commit: function (ev) {
                this$1.exportFrame({
                    commit: true
                });
            }
        });
        this._animateHandler = (function () { return this$1.animate(); });
        this._resizeHandler = (function () {
            var changed = this$1.resize();
            if (changed) {
                this$1.render();
            }
        });
    };

    var prototypeAccessors = { sketch: { configurable: true },settings: { configurable: true },props: { configurable: true } };
    prototypeAccessors.sketch.get = function () {
        return this._sketch;
    };
    prototypeAccessors.settings.get = function () {
        return this._settings;
    };
    prototypeAccessors.props.get = function () {
        return this._props;
    };
    SketchManager.prototype._computePlayhead = function _computePlayhead (currentTime, duration) {
        var hasDuration = typeof duration === 'number' && isFinite(duration);
        return hasDuration ? currentTime / duration : 0;
    };
    SketchManager.prototype._computeFrame = function _computeFrame (playhead, time, totalFrames, fps) {
        return isFinite(totalFrames) && totalFrames > 1 ? Math.floor(playhead * (totalFrames - 1)) : Math.floor(fps * time);
    };
    SketchManager.prototype._computeCurrentFrame = function _computeCurrentFrame () {
        return this._computeFrame(this.props.playhead, this.props.time, this.props.totalFrames, this.props.fps);
    };
    SketchManager.prototype._getSizeProps = function _getSizeProps () {
        var props = this.props;
        return {
            width: props.width,
            height: props.height,
            pixelRatio: props.pixelRatio,
            canvasWidth: props.canvasWidth,
            canvasHeight: props.canvasHeight,
            viewportWidth: props.viewportWidth,
            viewportHeight: props.viewportHeight
        };
    };
    SketchManager.prototype.run = function run () {
        if (!this.sketch) 
            { throw new Error('should wait until sketch is loaded before trying to play()'); }
        if (this.settings.playing !== false) {
            this.play();
        }
        if (typeof this.sketch.dispose === 'function') {
            console.warn('In canvas-sketch@0.0.23 the dispose() event has been renamed to unload()');
        }
        if (!this.props.started) {
            this._signalBegin();
            this.props.started = true;
        }
        this.tick();
        this.render();
        return this;
    };
    SketchManager.prototype.play = function play () {
        var animate = this.settings.animate;
        if ('animation' in this.settings) {
            animate = true;
            console.warn('[canvas-sketch] { animation } has been renamed to { animate }');
        }
        if (!animate) 
            { return; }
        if (!isBrowser()) {
            console.error('[canvas-sketch] WARN: Using { animate } in Node.js is not yet supported');
            return;
        }
        if (this.props.playing) 
            { return; }
        if (!this.props.started) {
            this._signalBegin();
            this.props.started = true;
        }
        this.props.playing = true;
        if (this._raf != null) 
            { window.cancelAnimationFrame(this._raf); }
        this._lastTime = browser();
        this._raf = window.requestAnimationFrame(this._animateHandler);
    };
    SketchManager.prototype.pause = function pause () {
        if (this.props.recording) 
            { this.endRecord(); }
        this.props.playing = false;
        if (this._raf != null && isBrowser()) {
            window.cancelAnimationFrame(this._raf);
        }
    };
    SketchManager.prototype.togglePlay = function togglePlay () {
        if (this.props.playing) 
            { this.pause(); }
         else 
            { this.play(); }
    };
    SketchManager.prototype.stop = function stop () {
        this.pause();
        this.props.frame = 0;
        this.props.playhead = 0;
        this.props.time = 0;
        this.props.deltaTime = 0;
        this.props.started = false;
        this.render();
    };
    SketchManager.prototype.record = function record () {
            var this$1 = this;

        if (this.props.recording) 
            { return; }
        if (!isBrowser()) {
            console.error('[canvas-sketch] WARN: Recording from Node.js is not yet supported');
            return;
        }
        this.stop();
        this.props.playing = true;
        this.props.recording = true;
        var frameInterval = 1 / this.props.fps;
        if (this._raf != null) 
            { window.cancelAnimationFrame(this._raf); }
        var tick = function () {
            if (!this$1.props.recording) 
                { return Promise.resolve(); }
            this$1.props.deltaTime = frameInterval;
            this$1.tick();
            return this$1.exportFrame({
                sequence: true
            }).then(function () {
                if (!this$1.props.recording) 
                    { return; }
                this$1.props.deltaTime = 0;
                this$1.props.frame++;
                if (this$1.props.frame < this$1.props.totalFrames) {
                    this$1.props.time += frameInterval;
                    this$1.props.playhead = this$1._computePlayhead(this$1.props.time, this$1.props.duration);
                    this$1._raf = window.requestAnimationFrame(tick);
                } else {
                    console.log('Finished recording');
                    this$1._signalEnd();
                    this$1.endRecord();
                    this$1.stop();
                    this$1.run();
                }
            });
        };
        if (!this.props.started) {
            this._signalBegin();
            this.props.started = true;
        }
        this._raf = window.requestAnimationFrame(tick);
    };
    SketchManager.prototype._signalBegin = function _signalBegin () {
            var this$1 = this;

        if (this.sketch && typeof this.sketch.begin === 'function') {
            this._wrapContextScale(function (props) { return this$1.sketch.begin(props); });
        }
    };
    SketchManager.prototype._signalEnd = function _signalEnd () {
            var this$1 = this;

        if (this.sketch && typeof this.sketch.end === 'function') {
            this._wrapContextScale(function (props) { return this$1.sketch.end(props); });
        }
    };
    SketchManager.prototype.endRecord = function endRecord () {
        if (this._raf != null && isBrowser()) 
            { window.cancelAnimationFrame(this._raf); }
        this.props.recording = false;
        this.props.deltaTime = 0;
        this.props.playing = false;
    };
    SketchManager.prototype.exportFrame = function exportFrame (opt) {
            var this$1 = this;
            if ( opt === void 0 ) opt = {};

        if (!this.sketch) 
            { return Promise.all([]); }
        if (typeof this.sketch.preExport === 'function') {
            this.sketch.preExport();
        }
        var exportOpts = objectAssign({
            sequence: opt.sequence,
            frame: opt.sequence ? this.props.frame : undefined,
            file: this.settings.file,
            name: this.settings.name,
            prefix: this.settings.prefix,
            suffix: this.settings.suffix,
            encoding: this.settings.encoding,
            encodingQuality: this.settings.encodingQuality,
            timeStamp: getFileName(),
            totalFrames: isFinite(this.props.totalFrames) ? Math.max(100, this.props.totalFrames) : 1000
        });
        var client = getClientAPI();
        var p = Promise.resolve();
        if (client && opt.commit && typeof client.commit === 'function') {
            var commitOpts = objectAssign({}, exportOpts);
            var hash = client.commit(commitOpts);
            if (isPromise_1(hash)) 
                { p = hash; }
             else 
                { p = Promise.resolve(hash); }
        }
        return p.then(function (hash) { return this$1._doExportFrame(objectAssign({}, exportOpts, {
            hash: hash || ''
        })); });
    };
    SketchManager.prototype._doExportFrame = function _doExportFrame (exportOpts) {
            var this$1 = this;
            if ( exportOpts === void 0 ) exportOpts = {};

        this._props.exporting = true;
        this.resize();
        var drawResult = this.render();
        var canvas = this.props.canvas;
        if (typeof drawResult === 'undefined') {
            drawResult = [canvas];
        }
        drawResult = [].concat(drawResult).filter(Boolean);
        drawResult = drawResult.map(function (result) {
            var hasDataObject = typeof result === 'object' && result && ('data' in result || 'dataURL' in result);
            var data = hasDataObject ? result.data : result;
            var opts = hasDataObject ? objectAssign({}, result, {
                data: data
            }) : {
                data: data
            };
            if (isCanvas(data)) {
                var encoding = opts.encoding || exportOpts.encoding;
                var encodingQuality = defined(opts.encodingQuality, exportOpts.encodingQuality, 0.95);
                var ref = exportCanvas(data, {
                    encoding: encoding,
                    encodingQuality: encodingQuality
                });
                    var dataURL = ref.dataURL;
                    var extension = ref.extension;
                    var type = ref.type;
                return Object.assign(opts, {
                    dataURL: dataURL,
                    extension: extension,
                    type: type
                });
            } else {
                return opts;
            }
        });
        this._props.exporting = false;
        this.resize();
        this.render();
        return Promise.all(drawResult.map(function (result, i, layerList) {
            var curOpt = objectAssign({}, exportOpts, result, {
                layer: i,
                totalLayers: layerList.length
            });
            var data = result.data;
            if (result.dataURL) {
                var dataURL = result.dataURL;
                delete curOpt.dataURL;
                return saveDataURL(dataURL, curOpt);
            } else {
                return saveFile(data, curOpt);
            }
        })).then(function (ev) {
            if (ev.length > 0) {
                var eventWithOutput = ev.find(function (e) { return e.outputName; });
                var isClient = ev.some(function (e) { return e.client; });
                var item;
                if (ev.length > 1) 
                    { item = ev.length; }
                 else if (eventWithOutput) 
                    { item = (eventWithOutput.outputName) + "/" + (ev[0].filename); }
                 else 
                    { item = "" + (ev[0].filename); }
                var ofSeq = '';
                if (exportOpts.sequence) {
                    var hasTotalFrames = isFinite(this$1.props.totalFrames);
                    ofSeq = hasTotalFrames ? (" (frame " + (exportOpts.frame + 1) + " / " + (this$1.props.totalFrames) + ")") : (" (frame " + (exportOpts.frame) + ")");
                } else if (ev.length > 1) {
                    ofSeq = " files";
                }
                var client = isClient ? 'canvas-sketch-cli' : 'canvas-sketch';
                console.log(("%c[" + client + "]%c Exported %c" + item + "%c" + ofSeq), 'color: #8e8e8e;', 'color: initial;', 'font-weight: bold;', 'font-weight: initial;');
            }
            if (typeof this$1.sketch.postExport === 'function') {
                this$1.sketch.postExport();
            }
        });
    };
    SketchManager.prototype._wrapContextScale = function _wrapContextScale (cb) {
        this._preRender();
        cb(this.props);
        this._postRender();
    };
    SketchManager.prototype._preRender = function _preRender () {
        var props = this.props;
        if (!this.props.gl && props.context && !props.p5) {
            props.context.save();
            if (this.settings.scaleContext !== false) {
                props.context.scale(props.scaleX, props.scaleY);
            }
        } else if (props.p5) {
            props.p5.scale(props.scaleX / props.pixelRatio, props.scaleY / props.pixelRatio);
        }
    };
    SketchManager.prototype._postRender = function _postRender () {
        var props = this.props;
        if (!this.props.gl && props.context && !props.p5) {
            props.context.restore();
        }
        if (props.gl && this.settings.flush !== false && !props.p5) {
            props.gl.flush();
        }
    };
    SketchManager.prototype.tick = function tick () {
        if (this.sketch && typeof this.sketch.tick === 'function') {
            this._preRender();
            this.sketch.tick(this.props);
            this._postRender();
        }
    };
    SketchManager.prototype.render = function render () {
        if (this.props.p5) {
            this._lastRedrawResult = undefined;
            this.props.p5.redraw();
            return this._lastRedrawResult;
        } else {
            return this.submitDrawCall();
        }
    };
    SketchManager.prototype.submitDrawCall = function submitDrawCall () {
        if (!this.sketch) 
            { return; }
        var props = this.props;
        this._preRender();
        var drawResult;
        if (typeof this.sketch === 'function') {
            drawResult = this.sketch(props);
        } else if (typeof this.sketch.render === 'function') {
            drawResult = this.sketch.render(props);
        }
        this._postRender();
        return drawResult;
    };
    SketchManager.prototype.update = function update (opt) {
            var this$1 = this;
            if ( opt === void 0 ) opt = {};

        var notYetSupported = ['animate'];
        Object.keys(opt).forEach(function (key) {
            if (notYetSupported.indexOf(key) >= 0) {
                throw new Error(("Sorry, the { " + key + " } option is not yet supported with update()."));
            }
        });
        var oldCanvas = this._settings.canvas;
        var oldContext = this._settings.context;
        for (var key in opt) {
            var value = opt[key];
            if (typeof value !== 'undefined') {
                this$1._settings[key] = value;
            }
        }
        var timeOpts = Object.assign({}, this._settings, opt);
        if ('time' in opt && 'frame' in opt) 
            { throw new Error('You should specify { time } or { frame } but not both'); }
         else if ('time' in opt) 
            { delete timeOpts.frame; }
         else if ('frame' in opt) 
            { delete timeOpts.time; }
        if ('duration' in opt && 'totalFrames' in opt) 
            { throw new Error('You should specify { duration } or { totalFrames } but not both'); }
         else if ('duration' in opt) 
            { delete timeOpts.totalFrames; }
         else if ('totalFrames' in opt) 
            { delete timeOpts.duration; }
        if ('data' in opt) 
            { this._props.data = opt.data; }
        var timeProps = this.getTimeProps(timeOpts);
        Object.assign(this._props, timeProps);
        if (oldCanvas !== this._settings.canvas || oldContext !== this._settings.context) {
            var ref = createCanvas(this._settings);
                var canvas = ref.canvas;
                var context = ref.context;
            this.props.canvas = canvas;
            this.props.context = context;
            this._setupGLKey();
            this._appendCanvasIfNeeded();
        }
        if (opt.p5 && typeof opt.p5 !== 'function') {
            this.props.p5 = opt.p5;
            this.props.p5.draw = (function () {
                if (this$1._isP5Resizing) 
                    { return; }
                this$1._lastRedrawResult = this$1.submitDrawCall();
            });
        }
        if ('playing' in opt) {
            if (opt.playing) 
                { this.play(); }
             else 
                { this.pause(); }
        }
        checkSettings(this._settings);
        this.resize();
        this.render();
        return this.props;
    };
    SketchManager.prototype.resize = function resize () {
        var oldSizes = this._getSizeProps();
        var settings = this.settings;
        var props = this.props;
        var newProps = resizeCanvas(props, settings);
        Object.assign(this._props, newProps);
        var ref = this.props;
            var pixelRatio = ref.pixelRatio;
            var canvasWidth = ref.canvasWidth;
            var canvasHeight = ref.canvasHeight;
            var styleWidth = ref.styleWidth;
            var styleHeight = ref.styleHeight;
        var canvas = this.props.canvas;
        if (canvas && settings.resizeCanvas !== false) {
            if (props.p5) {
                if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
                    this._isP5Resizing = true;
                    props.p5.pixelDensity(pixelRatio);
                    props.p5.resizeCanvas(canvasWidth / pixelRatio, canvasHeight / pixelRatio, false);
                    this._isP5Resizing = false;
                }
            } else {
                if (canvas.width !== canvasWidth) 
                    { canvas.width = canvasWidth; }
                if (canvas.height !== canvasHeight) 
                    { canvas.height = canvasHeight; }
            }
            if (isBrowser() && settings.styleCanvas !== false) {
                canvas.style.width = styleWidth + "px";
                canvas.style.height = styleHeight + "px";
            }
        }
        var newSizes = this._getSizeProps();
        var changed = !deepEqual_1(oldSizes, newSizes);
        if (changed) {
            this._sizeChanged();
        }
        return changed;
    };
    SketchManager.prototype._sizeChanged = function _sizeChanged () {
        if (this.sketch && typeof this.sketch.resize === 'function') {
            this.sketch.resize(this.props);
        }
    };
    SketchManager.prototype.animate = function animate () {
        if (!this.props.playing) 
            { return; }
        if (!isBrowser()) {
            console.error('[canvas-sketch] WARN: Animation in Node.js is not yet supported');
            return;
        }
        this._raf = window.requestAnimationFrame(this._animateHandler);
        var now = browser();
        var fps = this.props.fps;
        var frameIntervalMS = 1000 / fps;
        var deltaTimeMS = now - this._lastTime;
        var duration = this.props.duration;
        var hasDuration = typeof duration === 'number' && isFinite(duration);
        var isNewFrame = true;
        var playbackRate = this.settings.playbackRate;
        if (playbackRate === 'fixed') {
            deltaTimeMS = frameIntervalMS;
        } else if (playbackRate === 'throttle') {
            if (deltaTimeMS > frameIntervalMS) {
                now = now - deltaTimeMS % frameIntervalMS;
                this._lastTime = now;
            } else {
                isNewFrame = false;
            }
        } else {
            this._lastTime = now;
        }
        var deltaTime = deltaTimeMS / 1000;
        var newTime = this.props.time + deltaTime * this.props.timeScale;
        if (newTime < 0 && hasDuration) {
            newTime = duration + newTime;
        }
        var isFinished = false;
        var isLoopStart = false;
        var looping = this.settings.loop !== false;
        if (hasDuration && newTime >= duration) {
            if (looping) {
                isNewFrame = true;
                newTime = newTime % duration;
                isLoopStart = true;
            } else {
                isNewFrame = false;
                newTime = duration;
                isFinished = true;
            }
            this._signalEnd();
        }
        if (isNewFrame) {
            this.props.deltaTime = deltaTime;
            this.props.time = newTime;
            this.props.playhead = this._computePlayhead(newTime, duration);
            var lastFrame = this.props.frame;
            this.props.frame = this._computeCurrentFrame();
            if (isLoopStart) 
                { this._signalBegin(); }
            if (lastFrame !== this.props.frame) 
                { this.tick(); }
            this.render();
            this.props.deltaTime = 0;
        }
        if (isFinished) {
            this.pause();
        }
    };
    SketchManager.prototype.dispatch = function dispatch (cb) {
        if (typeof cb !== 'function') 
            { throw new Error('must pass function into dispatch()'); }
        cb(this.props);
        this.render();
    };
    SketchManager.prototype.mount = function mount () {
        this._appendCanvasIfNeeded();
    };
    SketchManager.prototype.unmount = function unmount () {
        if (isBrowser()) {
            window.removeEventListener('resize', this._resizeHandler);
            this._keyboardShortcuts.detach();
        }
        if (this.props.canvas.parentElement) {
            this.props.canvas.parentElement.removeChild(this.props.canvas);
        }
    };
    SketchManager.prototype._appendCanvasIfNeeded = function _appendCanvasIfNeeded () {
        if (!isBrowser()) 
            { return; }
        if (this.settings.parent !== false && (this.props.canvas && !this.props.canvas.parentElement)) {
            var defaultParent = this.settings.parent || document.body;
            defaultParent.appendChild(this.props.canvas);
        }
    };
    SketchManager.prototype._setupGLKey = function _setupGLKey () {
        if (this.props.context) {
            if (isWebGLContext(this.props.context)) {
                this._props.gl = this.props.context;
            } else {
                delete this._props.gl;
            }
        }
    };
    SketchManager.prototype.getTimeProps = function getTimeProps (settings) {
            if ( settings === void 0 ) settings = {};

        var duration = settings.duration;
        var totalFrames = settings.totalFrames;
        var timeScale = defined(settings.timeScale, 1);
        var fps = defined(settings.fps, 24);
        var hasDuration = typeof duration === 'number' && isFinite(duration);
        var hasTotalFrames = typeof totalFrames === 'number' && isFinite(totalFrames);
        var totalFramesFromDuration = hasDuration ? Math.floor(fps * duration) : undefined;
        var durationFromTotalFrames = hasTotalFrames ? totalFrames / fps : undefined;
        if (hasDuration && hasTotalFrames && totalFramesFromDuration !== totalFrames) {
            throw new Error('You should specify either duration or totalFrames, but not both. Or, they must match exactly.');
        }
        if (typeof settings.dimensions === 'undefined' && typeof settings.units !== 'undefined') {
            console.warn("You've specified a { units } setting but no { dimension }, so the units will be ignored.");
        }
        totalFrames = defined(totalFrames, totalFramesFromDuration, Infinity);
        duration = defined(duration, durationFromTotalFrames, Infinity);
        var startTime = settings.time;
        var startFrame = settings.frame;
        var hasStartTime = typeof startTime === 'number' && isFinite(startTime);
        var hasStartFrame = typeof startFrame === 'number' && isFinite(startFrame);
        var time = 0;
        var frame = 0;
        var playhead = 0;
        if (hasStartTime && hasStartFrame) {
            throw new Error('You should specify either start frame or time, but not both.');
        } else if (hasStartTime) {
            time = startTime;
            playhead = this._computePlayhead(time, duration);
            frame = this._computeFrame(playhead, time, totalFrames, fps);
        } else if (hasStartFrame) {
            frame = startFrame;
            time = frame / fps;
            playhead = this._computePlayhead(time, duration);
        }
        return {
            playhead: playhead,
            time: time,
            frame: frame,
            duration: duration,
            totalFrames: totalFrames,
            fps: fps,
            timeScale: timeScale
        };
    };
    SketchManager.prototype.setup = function setup (settings) {
            var this$1 = this;
            if ( settings === void 0 ) settings = {};

        if (this.sketch) 
            { throw new Error('Multiple setup() calls not yet supported.'); }
        this._settings = Object.assign({}, settings, this._settings);
        checkSettings(this._settings);
        var ref = createCanvas(this._settings);
            var context = ref.context;
            var canvas = ref.canvas;
        var timeProps = this.getTimeProps(this._settings);
        this._props = Object.assign({}, timeProps,
            {canvas: canvas,
            context: context,
            deltaTime: 0,
            started: false,
            exporting: false,
            playing: false,
            recording: false,
            settings: this.settings,
            data: this.settings.data,
            render: function () { return this$1.render(); },
            togglePlay: function () { return this$1.togglePlay(); },
            dispatch: function (cb) { return this$1.dispatch(cb); },
            tick: function () { return this$1.tick(); },
            resize: function () { return this$1.resize(); },
            update: function (opt) { return this$1.update(opt); },
            exportFrame: function (opt) { return this$1.exportFrame(opt); },
            record: function () { return this$1.record(); },
            play: function () { return this$1.play(); },
            pause: function () { return this$1.pause(); },
            stop: function () { return this$1.stop(); }});
        this._setupGLKey();
        this.resize();
    };
    SketchManager.prototype.loadAndRun = function loadAndRun (canvasSketch, newSettings) {
            var this$1 = this;

        return this.load(canvasSketch, newSettings).then(function () {
            this$1.run();
            return this$1;
        });
    };
    SketchManager.prototype.unload = function unload () {
            var this$1 = this;

        this.pause();
        if (!this.sketch) 
            { return; }
        if (typeof this.sketch.unload === 'function') {
            this._wrapContextScale(function (props) { return this$1.sketch.unload(props); });
        }
        this._sketch = null;
    };
    SketchManager.prototype.destroy = function destroy () {
        this.unload();
        this.unmount();
    };
    SketchManager.prototype.load = function load (createSketch, newSettings) {
            var this$1 = this;

        if (typeof createSketch !== 'function') {
            throw new Error('The function must take in a function as the first parameter. Example:\n  canvasSketcher(() => { ... }, settings)');
        }
        if (this.sketch) {
            this.unload();
        }
        if (typeof newSettings !== 'undefined') {
            this.update(newSettings);
        }
        this._preRender();
        var preload = Promise.resolve();
        if (this.settings.p5) {
            if (!isBrowser()) {
                throw new Error('[canvas-sketch] ERROR: Using p5.js in Node.js is not supported');
            }
            preload = new Promise(function (resolve) {
                var P5Constructor = this$1.settings.p5;
                var preload;
                if (P5Constructor.p5) {
                    preload = P5Constructor.preload;
                    P5Constructor = P5Constructor.p5;
                }
                var p5Sketch = function (p5) {
                    if (preload) 
                        { p5.preload = (function () { return preload(p5); }); }
                    p5.setup = (function () {
                        var props = this$1.props;
                        var isGL = this$1.settings.context === 'webgl';
                        var renderer = isGL ? p5.WEBGL : p5.P2D;
                        p5.noLoop();
                        p5.pixelDensity(props.pixelRatio);
                        p5.createCanvas(props.viewportWidth, props.viewportHeight, renderer);
                        if (isGL && this$1.settings.attributes) {
                            p5.setAttributes(this$1.settings.attributes);
                        }
                        this$1.update({
                            p5: p5,
                            canvas: p5.canvas,
                            context: p5._renderer.drawingContext
                        });
                        resolve();
                    });
                };
                if (typeof P5Constructor === 'function') {
                    new P5Constructor(p5Sketch);
                } else {
                    if (typeof window.createCanvas !== 'function') {
                        throw new Error("{ p5 } setting is passed but can't find p5.js in global (window) scope. Maybe you did not create it globally?\nnew p5(); // <-- attaches to global scope");
                    }
                    p5Sketch(window);
                }
            });
        }
        return preload.then(function () {
            var loader = createSketch(this$1.props);
            if (!isPromise_1(loader)) {
                loader = Promise.resolve(loader);
            }
            return loader;
        }).then(function (sketch) {
            if (!sketch) 
                { sketch = {}; }
            this$1._sketch = sketch;
            if (isBrowser()) {
                this$1._keyboardShortcuts.attach();
                window.addEventListener('resize', this$1._resizeHandler);
            }
            this$1._postRender();
            this$1._sizeChanged();
            return this$1;
        }).catch(function (err) {
            console.warn('Could not start sketch, the async loading function rejected with an error:\n    Error: ' + err.message);
            throw err;
        });
    };

    Object.defineProperties( SketchManager.prototype, prototypeAccessors );

    var CACHE = 'hot-id-cache';
    var runtimeCollisions = [];
    function isHotReload() {
        var client = getClientAPI();
        return client && client.hot;
    }

    function cacheGet(id) {
        var client = getClientAPI();
        if (!client) 
            { return undefined; }
        client[CACHE] = client[CACHE] || {};
        return client[CACHE][id];
    }

    function cachePut(id, data) {
        var client = getClientAPI();
        if (!client) 
            { return undefined; }
        client[CACHE] = client[CACHE] || {};
        client[CACHE][id] = data;
    }

    function getTimeProp(oldManager, newSettings) {
        return newSettings.animate ? {
            time: oldManager.props.time
        } : undefined;
    }

    function canvasSketch(sketch, settings) {
        if ( settings === void 0 ) settings = {};

        if (settings.p5) {
            if (settings.canvas || settings.context && typeof settings.context !== 'string') {
                throw new Error("In { p5 } mode, you can't pass your own canvas or context, unless the context is a \"webgl\" or \"2d\" string");
            }
            var context = typeof settings.context === 'string' ? settings.context : false;
            settings = Object.assign({}, settings, {
                canvas: false,
                context: context
            });
        }
        var isHot = isHotReload();
        var hotID;
        if (isHot) {
            hotID = defined(settings.id, '$__DEFAULT_CANVAS_SKETCH_ID__$');
        }
        var isInjecting = isHot && typeof hotID === 'string';
        if (isInjecting && runtimeCollisions.includes(hotID)) {
            console.warn("Warning: You have multiple calls to canvasSketch() in --hot mode. You must pass unique { id } strings in settings to enable hot reload across multiple sketches. ", hotID);
            isInjecting = false;
        }
        var preload = Promise.resolve();
        if (isInjecting) {
            runtimeCollisions.push(hotID);
            var previousData = cacheGet(hotID);
            if (previousData) {
                var next = function () {
                    var newProps = getTimeProp(previousData.manager, settings);
                    previousData.manager.destroy();
                    return newProps;
                };
                preload = previousData.load.then(next).catch(next);
            }
        }
        return preload.then(function (newProps) {
            var manager = new SketchManager();
            var result;
            if (sketch) {
                settings = Object.assign({}, settings, newProps);
                manager.setup(settings);
                manager.mount();
                result = manager.loadAndRun(sketch);
            } else {
                result = Promise.resolve(manager);
            }
            if (isInjecting) {
                cachePut(hotID, {
                    load: result,
                    manager: manager
                });
            }
            return result;
        });
    }

    canvasSketch.canvasSketch = canvasSketch;
    canvasSketch.PaperSizes = paperSizes;

    return canvasSketch;

})));


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"convert-length":3}],3:[function(require,module,exports){
var defined = require('defined');
var units = [ 'mm', 'cm', 'm', 'pc', 'pt', 'in', 'ft', 'px' ];

var conversions = {
  // metric
  m: {
    system: 'metric',
    factor: 1
  },
  cm: {
    system: 'metric',
    factor: 1 / 100
  },
  mm: {
    system: 'metric',
    factor: 1 / 1000
  },
  // imperial
  pt: {
    system: 'imperial',
    factor: 1 / 72
  },
  pc: {
    system: 'imperial',
    factor: 1 / 6
  },
  in: {
    system: 'imperial',
    factor: 1
  },
  ft: {
    system: 'imperial',
    factor: 12
  }
};

const anchors = {
  metric: {
    unit: 'm',
    ratio: 1 / 0.0254
  },
  imperial: {
    unit: 'in',
    ratio: 0.0254
  }
};

function round (value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function convertDistance (value, fromUnit, toUnit, opts) {
  if (typeof value !== 'number' || !isFinite(value)) throw new Error('Value must be a finite number');
  if (!fromUnit || !toUnit) throw new Error('Must specify from and to units');

  opts = opts || {};
  var pixelsPerInch = defined(opts.pixelsPerInch, 96);
  var precision = opts.precision;
  var roundPixel = opts.roundPixel !== false;

  fromUnit = fromUnit.toLowerCase();
  toUnit = toUnit.toLowerCase();

  if (units.indexOf(fromUnit) === -1) throw new Error('Invalid from unit "' + fromUnit + '", must be one of: ' + units.join(', '));
  if (units.indexOf(toUnit) === -1) throw new Error('Invalid from unit "' + toUnit + '", must be one of: ' + units.join(', '));

  if (fromUnit === toUnit) {
    // We don't need to convert from A to B since they are the same already
    return value;
  }

  var toFactor = 1;
  var fromFactor = 1;
  var isToPixel = false;

  if (fromUnit === 'px') {
    fromFactor = 1 / pixelsPerInch;
    fromUnit = 'in';
  }
  if (toUnit === 'px') {
    isToPixel = true;
    toFactor = pixelsPerInch;
    toUnit = 'in';
  }

  var fromUnitData = conversions[fromUnit];
  var toUnitData = conversions[toUnit];

  // source to anchor inside source's system
  var anchor = value * fromUnitData.factor * fromFactor;

  // if systems differ, convert one to another
  if (fromUnitData.system !== toUnitData.system) {
    // regular 'm' to 'in' and so forth
    anchor *= anchors[fromUnitData.system].ratio;
  }

  var result = anchor / toUnitData.factor * toFactor;
  if (isToPixel && roundPixel) {
    result = Math.round(result);
  } else if (typeof precision === 'number' && isFinite(precision)) {
    result = round(result, precision);
  }
  return result;
}

module.exports = convertDistance;
module.exports.units = units;

},{"defined":4}],4:[function(require,module,exports){
module.exports = function () {
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] !== undefined) return arguments[i];
    }
};

},{}],5:[function(require,module,exports){
module.exports=[["#69d2e7","#a7dbd8","#e0e4cc","#f38630","#fa6900"],["#fe4365","#fc9d9a","#f9cdad","#c8c8a9","#83af9b"],["#ecd078","#d95b43","#c02942","#542437","#53777a"],["#556270","#4ecdc4","#c7f464","#ff6b6b","#c44d58"],["#774f38","#e08e79","#f1d4af","#ece5ce","#c5e0dc"],["#e8ddcb","#cdb380","#036564","#033649","#031634"],["#490a3d","#bd1550","#e97f02","#f8ca00","#8a9b0f"],["#594f4f","#547980","#45ada8","#9de0ad","#e5fcc2"],["#00a0b0","#6a4a3c","#cc333f","#eb6841","#edc951"],["#e94e77","#d68189","#c6a49a","#c6e5d9","#f4ead5"],["#3fb8af","#7fc7af","#dad8a7","#ff9e9d","#ff3d7f"],["#d9ceb2","#948c75","#d5ded9","#7a6a53","#99b2b7"],["#ffffff","#cbe86b","#f2e9e1","#1c140d","#cbe86b"],["#efffcd","#dce9be","#555152","#2e2633","#99173c"],["#343838","#005f6b","#008c9e","#00b4cc","#00dffc"],["#413e4a","#73626e","#b38184","#f0b49e","#f7e4be"],["#ff4e50","#fc913a","#f9d423","#ede574","#e1f5c4"],["#99b898","#fecea8","#ff847c","#e84a5f","#2a363b"],["#655643","#80bca3","#f6f7bd","#e6ac27","#bf4d28"],["#00a8c6","#40c0cb","#f9f2e7","#aee239","#8fbe00"],["#351330","#424254","#64908a","#e8caa4","#cc2a41"],["#554236","#f77825","#d3ce3d","#f1efa5","#60b99a"],["#ff9900","#424242","#e9e9e9","#bcbcbc","#3299bb"],["#5d4157","#838689","#a8caba","#cad7b2","#ebe3aa"],["#8c2318","#5e8c6a","#88a65e","#bfb35a","#f2c45a"],["#fad089","#ff9c5b","#f5634a","#ed303c","#3b8183"],["#ff4242","#f4fad2","#d4ee5e","#e1edb9","#f0f2eb"],["#d1e751","#ffffff","#000000","#4dbce9","#26ade4"],["#f8b195","#f67280","#c06c84","#6c5b7b","#355c7d"],["#1b676b","#519548","#88c425","#bef202","#eafde6"],["#bcbdac","#cfbe27","#f27435","#f02475","#3b2d38"],["#5e412f","#fcebb6","#78c0a8","#f07818","#f0a830"],["#452632","#91204d","#e4844a","#e8bf56","#e2f7ce"],["#eee6ab","#c5bc8e","#696758","#45484b","#36393b"],["#f0d8a8","#3d1c00","#86b8b1","#f2d694","#fa2a00"],["#f04155","#ff823a","#f2f26f","#fff7bd","#95cfb7"],["#2a044a","#0b2e59","#0d6759","#7ab317","#a0c55f"],["#bbbb88","#ccc68d","#eedd99","#eec290","#eeaa88"],["#b9d7d9","#668284","#2a2829","#493736","#7b3b3b"],["#b3cc57","#ecf081","#ffbe40","#ef746f","#ab3e5b"],["#a3a948","#edb92e","#f85931","#ce1836","#009989"],["#67917a","#170409","#b8af03","#ccbf82","#e33258"],["#e8d5b7","#0e2430","#fc3a51","#f5b349","#e8d5b9"],["#aab3ab","#c4cbb7","#ebefc9","#eee0b7","#e8caaf"],["#300030","#480048","#601848","#c04848","#f07241"],["#ab526b","#bca297","#c5ceae","#f0e2a4","#f4ebc3"],["#607848","#789048","#c0d860","#f0f0d8","#604848"],["#a8e6ce","#dcedc2","#ffd3b5","#ffaaa6","#ff8c94"],["#3e4147","#fffedf","#dfba69","#5a2e2e","#2a2c31"],["#b6d8c0","#c8d9bf","#dadabd","#ecdbbc","#fedcba"],["#fc354c","#29221f","#13747d","#0abfbc","#fcf7c5"],["#1c2130","#028f76","#b3e099","#ffeaad","#d14334"],["#edebe6","#d6e1c7","#94c7b6","#403b33","#d3643b"],["#cc0c39","#e6781e","#c8cf02","#f8fcc1","#1693a7"],["#dad6ca","#1bb0ce","#4f8699","#6a5e72","#563444"],["#a7c5bd","#e5ddcb","#eb7b59","#cf4647","#524656"],["#fdf1cc","#c6d6b8","#987f69","#e3ad40","#fcd036"],["#5c323e","#a82743","#e15e32","#c0d23e","#e5f04c"],["#230f2b","#f21d41","#ebebbc","#bce3c5","#82b3ae"],["#b9d3b0","#81bda4","#b28774","#f88f79","#f6aa93"],["#3a111c","#574951","#83988e","#bcdea5","#e6f9bc"],["#5e3929","#cd8c52","#b7d1a3","#dee8be","#fcf7d3"],["#1c0113","#6b0103","#a30006","#c21a01","#f03c02"],["#382f32","#ffeaf2","#fcd9e5","#fbc5d8","#f1396d"],["#e3dfba","#c8d6bf","#93ccc6","#6cbdb5","#1a1f1e"],["#000000","#9f111b","#b11623","#292c37","#cccccc"],["#c1b398","#605951","#fbeec2","#61a6ab","#accec0"],["#8dccad","#988864","#fea6a2","#f9d6ac","#ffe9af"],["#f6f6f6","#e8e8e8","#333333","#990100","#b90504"],["#1b325f","#9cc4e4","#e9f2f9","#3a89c9","#f26c4f"],["#5e9fa3","#dcd1b4","#fab87f","#f87e7b","#b05574"],["#951f2b","#f5f4d7","#e0dfb1","#a5a36c","#535233"],["#413d3d","#040004","#c8ff00","#fa023c","#4b000f"],["#eff3cd","#b2d5ba","#61ada0","#248f8d","#605063"],["#2d2d29","#215a6d","#3ca2a2","#92c7a3","#dfece6"],["#cfffdd","#b4dec1","#5c5863","#a85163","#ff1f4c"],["#4e395d","#827085","#8ebe94","#ccfc8e","#dc5b3e"],["#9dc9ac","#fffec7","#f56218","#ff9d2e","#919167"],["#a1dbb2","#fee5ad","#faca66","#f7a541","#f45d4c"],["#ffefd3","#fffee4","#d0ecea","#9fd6d2","#8b7a5e"],["#a8a7a7","#cc527a","#e8175d","#474747","#363636"],["#ffedbf","#f7803c","#f54828","#2e0d23","#f8e4c1"],["#f8edd1","#d88a8a","#474843","#9d9d93","#c5cfc6"],["#f38a8a","#55443d","#a0cab5","#cde9ca","#f1edd0"],["#4e4d4a","#353432","#94ba65","#2790b0","#2b4e72"],["#0ca5b0","#4e3f30","#fefeeb","#f8f4e4","#a5b3aa"],["#a70267","#f10c49","#fb6b41","#f6d86b","#339194"],["#9d7e79","#ccac95","#9a947c","#748b83","#5b756c"],["#edf6ee","#d1c089","#b3204d","#412e28","#151101"],["#046d8b","#309292","#2fb8ac","#93a42a","#ecbe13"],["#4d3b3b","#de6262","#ffb88c","#ffd0b3","#f5e0d3"],["#fffbb7","#a6f6af","#66b6ab","#5b7c8d","#4f2958"],["#ff003c","#ff8a00","#fabe28","#88c100","#00c176"],["#fcfef5","#e9ffe1","#cdcfb7","#d6e6c3","#fafbe3"],["#9cddc8","#bfd8ad","#ddd9ab","#f7af63","#633d2e"],["#30261c","#403831","#36544f","#1f5f61","#0b8185"],["#d1313d","#e5625c","#f9bf76","#8eb2c5","#615375"],["#ffe181","#eee9e5","#fad3b2","#ffba7f","#ff9c97"],["#aaff00","#ffaa00","#ff00aa","#aa00ff","#00aaff"],["#c2412d","#d1aa34","#a7a844","#a46583","#5a1e4a"]]
},{}],6:[function(require,module,exports){
(function (global){
'use strict';

var width = 256;// each RC4 output is 0 <= x < 256
var chunks = 6;// at least six RC4 outputs for each double
var digits = 52;// there are 52 significant digits in a double
var pool = [];// pool: entropy pool starts empty
var GLOBAL = typeof global === 'undefined' ? window : global;

//
// The following constants are related to IEEE 754 limits.
//
var startdenom = Math.pow(width, chunks),
    significance = Math.pow(2, digits),
    overflow = significance * 2,
    mask = width - 1;


var oldRandom = Math.random;

//
// seedrandom()
// This is the seedrandom function described above.
//
module.exports = function(seed, options) {
  if (options && options.global === true) {
    options.global = false;
    Math.random = module.exports(seed, options);
    options.global = true;
    return Math.random;
  }
  var use_entropy = (options && options.entropy) || false;
  var key = [];

  // Flatten the seed string or build one from local entropy if needed.
  var shortseed = mixkey(flatten(
    use_entropy ? [seed, tostring(pool)] :
    0 in arguments ? seed : autoseed(), 3), key);

  // Use the seed to initialize an ARC4 generator.
  var arc4 = new ARC4(key);

  // Mix the randomness into accumulated entropy.
  mixkey(tostring(arc4.S), pool);

  // Override Math.random

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.

  return function() {         // Closure to return a random double:
    var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
        d = startdenom,                 //   and denominator d = 2 ^ 48.
        x = 0;                          //   and no 'extra last byte'.
    while (n < significance) {          // Fill up all significant digits by
      n = (n + x) * width;              //   shifting numerator and
      d *= width;                       //   denominator and generating a
      x = arc4.g(1);                    //   new least-significant-byte.
    }
    while (n >= overflow) {             // To avoid rounding up, before adding
      n /= 2;                           //   last byte, shift everything
      d /= 2;                           //   right using integer Math until
      x >>>= 1;                         //   we have exactly the desired bits.
    }
    return (n + x) / d;                 // Form the number within [0, 1).
  };
};

module.exports.resetGlobal = function () {
  Math.random = oldRandom;
};

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
/** @constructor */
function ARC4(key) {
  var t, keylen = key.length,
      me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

  // The empty key [] is treated as [0].
  if (!keylen) { key = [keylen++]; }

  // Set up S using the standard key scheduling algorithm.
  while (i < width) {
    s[i] = i++;
  }
  for (i = 0; i < width; i++) {
    s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
    s[j] = t;
  }

  // The "g" method returns the next (count) outputs as one number.
  (me.g = function(count) {
    // Using instance members instead of closure state nearly doubles speed.
    var t, r = 0,
        i = me.i, j = me.j, s = me.S;
    while (count--) {
      t = s[i = mask & (i + 1)];
      r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
    }
    me.i = i; me.j = j;
    return r;
    // For robust unpredictability discard an initial batch of values.
    // See http://www.rsa.com/rsalabs/node.asp?id=2009
  })(width);
}

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
function flatten(obj, depth) {
  var result = [], typ = (typeof obj)[0], prop;
  if (depth && typ == 'o') {
    for (prop in obj) {
      try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
    }
  }
  return (result.length ? result : typ == 's' ? obj : obj + '\0');
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
function mixkey(seed, key) {
  var stringseed = seed + '', smear, j = 0;
  while (j < stringseed.length) {
    key[mask & j] =
      mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
  }
  return tostring(key);
}

//
// autoseed()
// Returns an object for autoseeding, using window.crypto if available.
//
/** @param {Uint8Array=} seed */
function autoseed(seed) {
  try {
    GLOBAL.crypto.getRandomValues(seed = new Uint8Array(width));
    return tostring(seed);
  } catch (e) {
    return [+new Date, GLOBAL, GLOBAL.navigator && GLOBAL.navigator.plugins,
            GLOBAL.screen, tostring(pool)];
  }
}

//
// tostring()
// Converts an array of charcodes to a string
//
function tostring(a) {
  return String.fromCharCode.apply(0, a);
}

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to intefere with determinstic PRNG state later,
// seedrandom will not call Math.random on its own again after
// initialization.
//
mixkey(Math.random(), pool);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],7:[function(require,module,exports){
/*
 * A fast javascript implementation of simplex noise by Jonas Wagner

Based on a speed-improved simplex noise algorithm for 2D, 3D and 4D in Java.
Which is based on example code by Stefan Gustavson (stegu@itn.liu.se).
With Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
Better rank ordering method by Stefan Gustavson in 2012.


 Copyright (c) 2018 Jonas Wagner

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */
(function() {
  'use strict';

  var F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
  var G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
  var F3 = 1.0 / 3.0;
  var G3 = 1.0 / 6.0;
  var F4 = (Math.sqrt(5.0) - 1.0) / 4.0;
  var G4 = (5.0 - Math.sqrt(5.0)) / 20.0;

  function SimplexNoise(randomOrSeed) {
    var random;
    if (typeof randomOrSeed == 'function') {
      random = randomOrSeed;
    }
    else if (randomOrSeed) {
      random = alea(randomOrSeed);
    } else {
      random = Math.random;
    }
    this.p = buildPermutationTable(random);
    this.perm = new Uint8Array(512);
    this.permMod12 = new Uint8Array(512);
    for (var i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }

  }
  SimplexNoise.prototype = {
    grad3: new Float32Array([1, 1, 0,
      -1, 1, 0,
      1, -1, 0,

      -1, -1, 0,
      1, 0, 1,
      -1, 0, 1,

      1, 0, -1,
      -1, 0, -1,
      0, 1, 1,

      0, -1, 1,
      0, 1, -1,
      0, -1, -1]),
    grad4: new Float32Array([0, 1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1,
      0, -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1,
      1, 0, 1, 1, 1, 0, 1, -1, 1, 0, -1, 1, 1, 0, -1, -1,
      -1, 0, 1, 1, -1, 0, 1, -1, -1, 0, -1, 1, -1, 0, -1, -1,
      1, 1, 0, 1, 1, 1, 0, -1, 1, -1, 0, 1, 1, -1, 0, -1,
      -1, 1, 0, 1, -1, 1, 0, -1, -1, -1, 0, 1, -1, -1, 0, -1,
      1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1, 0,
      -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1, 0]),
    noise2D: function(xin, yin) {
      var permMod12 = this.permMod12;
      var perm = this.perm;
      var grad3 = this.grad3;
      var n0 = 0; // Noise contributions from the three corners
      var n1 = 0;
      var n2 = 0;
      // Skew the input space to determine which simplex cell we're in
      var s = (xin + yin) * F2; // Hairy factor for 2D
      var i = Math.floor(xin + s);
      var j = Math.floor(yin + s);
      var t = (i + j) * G2;
      var X0 = i - t; // Unskew the cell origin back to (x,y) space
      var Y0 = j - t;
      var x0 = xin - X0; // The x,y distances from the cell origin
      var y0 = yin - Y0;
      // For the 2D case, the simplex shape is an equilateral triangle.
      // Determine which simplex we are in.
      var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
      if (x0 > y0) {
        i1 = 1;
        j1 = 0;
      } // lower triangle, XY order: (0,0)->(1,0)->(1,1)
      else {
        i1 = 0;
        j1 = 1;
      } // upper triangle, YX order: (0,0)->(0,1)->(1,1)
      // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
      // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
      // c = (3-sqrt(3))/6
      var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
      var y1 = y0 - j1 + G2;
      var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
      var y2 = y0 - 1.0 + 2.0 * G2;
      // Work out the hashed gradient indices of the three simplex corners
      var ii = i & 255;
      var jj = j & 255;
      // Calculate the contribution from the three corners
      var t0 = 0.5 - x0 * x0 - y0 * y0;
      if (t0 >= 0) {
        var gi0 = permMod12[ii + perm[jj]] * 3;
        t0 *= t0;
        n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0); // (x,y) of grad3 used for 2D gradient
      }
      var t1 = 0.5 - x1 * x1 - y1 * y1;
      if (t1 >= 0) {
        var gi1 = permMod12[ii + i1 + perm[jj + j1]] * 3;
        t1 *= t1;
        n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1);
      }
      var t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t2 >= 0) {
        var gi2 = permMod12[ii + 1 + perm[jj + 1]] * 3;
        t2 *= t2;
        n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2);
      }
      // Add contributions from each corner to get the final noise value.
      // The result is scaled to return values in the interval [-1,1].
      return 70.0 * (n0 + n1 + n2);
    },
    // 3D simplex noise
    noise3D: function(xin, yin, zin) {
      var permMod12 = this.permMod12;
      var perm = this.perm;
      var grad3 = this.grad3;
      var n0, n1, n2, n3; // Noise contributions from the four corners
      // Skew the input space to determine which simplex cell we're in
      var s = (xin + yin + zin) * F3; // Very nice and simple skew factor for 3D
      var i = Math.floor(xin + s);
      var j = Math.floor(yin + s);
      var k = Math.floor(zin + s);
      var t = (i + j + k) * G3;
      var X0 = i - t; // Unskew the cell origin back to (x,y,z) space
      var Y0 = j - t;
      var Z0 = k - t;
      var x0 = xin - X0; // The x,y,z distances from the cell origin
      var y0 = yin - Y0;
      var z0 = zin - Z0;
      // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
      // Determine which simplex we are in.
      var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
      var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
      if (x0 >= y0) {
        if (y0 >= z0) {
          i1 = 1;
          j1 = 0;
          k1 = 0;
          i2 = 1;
          j2 = 1;
          k2 = 0;
        } // X Y Z order
        else if (x0 >= z0) {
          i1 = 1;
          j1 = 0;
          k1 = 0;
          i2 = 1;
          j2 = 0;
          k2 = 1;
        } // X Z Y order
        else {
          i1 = 0;
          j1 = 0;
          k1 = 1;
          i2 = 1;
          j2 = 0;
          k2 = 1;
        } // Z X Y order
      }
      else { // x0<y0
        if (y0 < z0) {
          i1 = 0;
          j1 = 0;
          k1 = 1;
          i2 = 0;
          j2 = 1;
          k2 = 1;
        } // Z Y X order
        else if (x0 < z0) {
          i1 = 0;
          j1 = 1;
          k1 = 0;
          i2 = 0;
          j2 = 1;
          k2 = 1;
        } // Y Z X order
        else {
          i1 = 0;
          j1 = 1;
          k1 = 0;
          i2 = 1;
          j2 = 1;
          k2 = 0;
        } // Y X Z order
      }
      // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
      // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
      // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
      // c = 1/6.
      var x1 = x0 - i1 + G3; // Offsets for second corner in (x,y,z) coords
      var y1 = y0 - j1 + G3;
      var z1 = z0 - k1 + G3;
      var x2 = x0 - i2 + 2.0 * G3; // Offsets for third corner in (x,y,z) coords
      var y2 = y0 - j2 + 2.0 * G3;
      var z2 = z0 - k2 + 2.0 * G3;
      var x3 = x0 - 1.0 + 3.0 * G3; // Offsets for last corner in (x,y,z) coords
      var y3 = y0 - 1.0 + 3.0 * G3;
      var z3 = z0 - 1.0 + 3.0 * G3;
      // Work out the hashed gradient indices of the four simplex corners
      var ii = i & 255;
      var jj = j & 255;
      var kk = k & 255;
      // Calculate the contribution from the four corners
      var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
      if (t0 < 0) n0 = 0.0;
      else {
        var gi0 = permMod12[ii + perm[jj + perm[kk]]] * 3;
        t0 *= t0;
        n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0 + grad3[gi0 + 2] * z0);
      }
      var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
      if (t1 < 0) n1 = 0.0;
      else {
        var gi1 = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]] * 3;
        t1 *= t1;
        n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1 + grad3[gi1 + 2] * z1);
      }
      var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
      if (t2 < 0) n2 = 0.0;
      else {
        var gi2 = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]] * 3;
        t2 *= t2;
        n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2 + grad3[gi2 + 2] * z2);
      }
      var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
      if (t3 < 0) n3 = 0.0;
      else {
        var gi3 = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]] * 3;
        t3 *= t3;
        n3 = t3 * t3 * (grad3[gi3] * x3 + grad3[gi3 + 1] * y3 + grad3[gi3 + 2] * z3);
      }
      // Add contributions from each corner to get the final noise value.
      // The result is scaled to stay just inside [-1,1]
      return 32.0 * (n0 + n1 + n2 + n3);
    },
    // 4D simplex noise, better simplex rank ordering method 2012-03-09
    noise4D: function(x, y, z, w) {
      var perm = this.perm;
      var grad4 = this.grad4;

      var n0, n1, n2, n3, n4; // Noise contributions from the five corners
      // Skew the (x,y,z,w) space to determine which cell of 24 simplices we're in
      var s = (x + y + z + w) * F4; // Factor for 4D skewing
      var i = Math.floor(x + s);
      var j = Math.floor(y + s);
      var k = Math.floor(z + s);
      var l = Math.floor(w + s);
      var t = (i + j + k + l) * G4; // Factor for 4D unskewing
      var X0 = i - t; // Unskew the cell origin back to (x,y,z,w) space
      var Y0 = j - t;
      var Z0 = k - t;
      var W0 = l - t;
      var x0 = x - X0; // The x,y,z,w distances from the cell origin
      var y0 = y - Y0;
      var z0 = z - Z0;
      var w0 = w - W0;
      // For the 4D case, the simplex is a 4D shape I won't even try to describe.
      // To find out which of the 24 possible simplices we're in, we need to
      // determine the magnitude ordering of x0, y0, z0 and w0.
      // Six pair-wise comparisons are performed between each possible pair
      // of the four coordinates, and the results are used to rank the numbers.
      var rankx = 0;
      var ranky = 0;
      var rankz = 0;
      var rankw = 0;
      if (x0 > y0) rankx++;
      else ranky++;
      if (x0 > z0) rankx++;
      else rankz++;
      if (x0 > w0) rankx++;
      else rankw++;
      if (y0 > z0) ranky++;
      else rankz++;
      if (y0 > w0) ranky++;
      else rankw++;
      if (z0 > w0) rankz++;
      else rankw++;
      var i1, j1, k1, l1; // The integer offsets for the second simplex corner
      var i2, j2, k2, l2; // The integer offsets for the third simplex corner
      var i3, j3, k3, l3; // The integer offsets for the fourth simplex corner
      // simplex[c] is a 4-vector with the numbers 0, 1, 2 and 3 in some order.
      // Many values of c will never occur, since e.g. x>y>z>w makes x<z, y<w and x<w
      // impossible. Only the 24 indices which have non-zero entries make any sense.
      // We use a thresholding to set the coordinates in turn from the largest magnitude.
      // Rank 3 denotes the largest coordinate.
      i1 = rankx >= 3 ? 1 : 0;
      j1 = ranky >= 3 ? 1 : 0;
      k1 = rankz >= 3 ? 1 : 0;
      l1 = rankw >= 3 ? 1 : 0;
      // Rank 2 denotes the second largest coordinate.
      i2 = rankx >= 2 ? 1 : 0;
      j2 = ranky >= 2 ? 1 : 0;
      k2 = rankz >= 2 ? 1 : 0;
      l2 = rankw >= 2 ? 1 : 0;
      // Rank 1 denotes the second smallest coordinate.
      i3 = rankx >= 1 ? 1 : 0;
      j3 = ranky >= 1 ? 1 : 0;
      k3 = rankz >= 1 ? 1 : 0;
      l3 = rankw >= 1 ? 1 : 0;
      // The fifth corner has all coordinate offsets = 1, so no need to compute that.
      var x1 = x0 - i1 + G4; // Offsets for second corner in (x,y,z,w) coords
      var y1 = y0 - j1 + G4;
      var z1 = z0 - k1 + G4;
      var w1 = w0 - l1 + G4;
      var x2 = x0 - i2 + 2.0 * G4; // Offsets for third corner in (x,y,z,w) coords
      var y2 = y0 - j2 + 2.0 * G4;
      var z2 = z0 - k2 + 2.0 * G4;
      var w2 = w0 - l2 + 2.0 * G4;
      var x3 = x0 - i3 + 3.0 * G4; // Offsets for fourth corner in (x,y,z,w) coords
      var y3 = y0 - j3 + 3.0 * G4;
      var z3 = z0 - k3 + 3.0 * G4;
      var w3 = w0 - l3 + 3.0 * G4;
      var x4 = x0 - 1.0 + 4.0 * G4; // Offsets for last corner in (x,y,z,w) coords
      var y4 = y0 - 1.0 + 4.0 * G4;
      var z4 = z0 - 1.0 + 4.0 * G4;
      var w4 = w0 - 1.0 + 4.0 * G4;
      // Work out the hashed gradient indices of the five simplex corners
      var ii = i & 255;
      var jj = j & 255;
      var kk = k & 255;
      var ll = l & 255;
      // Calculate the contribution from the five corners
      var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0;
      if (t0 < 0) n0 = 0.0;
      else {
        var gi0 = (perm[ii + perm[jj + perm[kk + perm[ll]]]] % 32) * 4;
        t0 *= t0;
        n0 = t0 * t0 * (grad4[gi0] * x0 + grad4[gi0 + 1] * y0 + grad4[gi0 + 2] * z0 + grad4[gi0 + 3] * w0);
      }
      var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1 - w1 * w1;
      if (t1 < 0) n1 = 0.0;
      else {
        var gi1 = (perm[ii + i1 + perm[jj + j1 + perm[kk + k1 + perm[ll + l1]]]] % 32) * 4;
        t1 *= t1;
        n1 = t1 * t1 * (grad4[gi1] * x1 + grad4[gi1 + 1] * y1 + grad4[gi1 + 2] * z1 + grad4[gi1 + 3] * w1);
      }
      var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2 - w2 * w2;
      if (t2 < 0) n2 = 0.0;
      else {
        var gi2 = (perm[ii + i2 + perm[jj + j2 + perm[kk + k2 + perm[ll + l2]]]] % 32) * 4;
        t2 *= t2;
        n2 = t2 * t2 * (grad4[gi2] * x2 + grad4[gi2 + 1] * y2 + grad4[gi2 + 2] * z2 + grad4[gi2 + 3] * w2);
      }
      var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3 - w3 * w3;
      if (t3 < 0) n3 = 0.0;
      else {
        var gi3 = (perm[ii + i3 + perm[jj + j3 + perm[kk + k3 + perm[ll + l3]]]] % 32) * 4;
        t3 *= t3;
        n3 = t3 * t3 * (grad4[gi3] * x3 + grad4[gi3 + 1] * y3 + grad4[gi3 + 2] * z3 + grad4[gi3 + 3] * w3);
      }
      var t4 = 0.6 - x4 * x4 - y4 * y4 - z4 * z4 - w4 * w4;
      if (t4 < 0) n4 = 0.0;
      else {
        var gi4 = (perm[ii + 1 + perm[jj + 1 + perm[kk + 1 + perm[ll + 1]]]] % 32) * 4;
        t4 *= t4;
        n4 = t4 * t4 * (grad4[gi4] * x4 + grad4[gi4 + 1] * y4 + grad4[gi4 + 2] * z4 + grad4[gi4 + 3] * w4);
      }
      // Sum up and scale the result to cover the range [-1,1]
      return 27.0 * (n0 + n1 + n2 + n3 + n4);
    }
  };

  function buildPermutationTable(random) {
    var i;
    var p = new Uint8Array(256);
    for (i = 0; i < 256; i++) {
      p[i] = i;
    }
    for (i = 0; i < 255; i++) {
      var r = i + ~~(random() * (256 - i));
      var aux = p[i];
      p[i] = p[r];
      p[r] = aux;
    }
    return p;
  }
  SimplexNoise._buildPermutationTable = buildPermutationTable;

  function alea() {
    // Johannes Baagøe <baagoe@baagoe.com>, 2010
    var s0 = 0;
    var s1 = 0;
    var s2 = 0;
    var c = 1;

    var mash = masher();
    s0 = mash(' ');
    s1 = mash(' ');
    s2 = mash(' ');

    for (var i = 0; i < arguments.length; i++) {
      s0 -= mash(arguments[i]);
      if (s0 < 0) {
        s0 += 1;
      }
      s1 -= mash(arguments[i]);
      if (s1 < 0) {
        s1 += 1;
      }
      s2 -= mash(arguments[i]);
      if (s2 < 0) {
        s2 += 1;
      }
    }
    mash = null;
    return function() {
      var t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32
      s0 = s1;
      s1 = s2;
      return s2 = t - (c = t | 0);
    };
  }
  function masher() {
    var n = 0xefc8249d;
    return function(data) {
      data = data.toString();
      for (var i = 0; i < data.length; i++) {
        n += data.charCodeAt(i);
        var h = 0.02519603282416938 * n;
        n = h >>> 0;
        h -= n;
        h *= n;
        n = h >>> 0;
        h -= n;
        n += h * 0x100000000; // 2^32
      }
      return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
    };
  }

  // amd
  if (typeof define !== 'undefined' && define.amd) define(function() {return SimplexNoise;});
  // common js
  if (typeof exports !== 'undefined') exports.SimplexNoise = SimplexNoise;
  // browser
  else if (typeof window !== 'undefined') window.SimplexNoise = SimplexNoise;
  // nodejs
  if (typeof module !== 'undefined') {
    module.exports = SimplexNoise;
  }

})();

},{}],8:[function(require,module,exports){
const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");

// 632231
random.setSeed(random.getRandomSeed());
// console.log(random.getSeed());

const settings = {
  dimensions: [2048, 2048],
  suffix: `-seed-${random.getSeed()}`
};

const createGrid = (gridWidth, gridHeight, offsetX, offsetY, palette) => {
  const count = 10;
  const squares = [];

  for (let i = 0; i < count; i++) {
    for (let j = 0; j < count; j++) {
      squares.push({
        position: [
          Math.ceil(offsetX + gridWidth / count * i),
          Math.ceil(offsetY + gridHeight / count * j)
        ],
        w: Math.ceil(gridWidth / count),
        h: Math.ceil(gridHeight / count),
        color: random.pick(palette),
        stroke: random.pick(palette)
      });
    }
  }

  return squares;
};

const sketch = () => {
  const colorCount = random.rangeFloor(3, 5);
  const palette = random.shuffle(random.pick(palettes).slice(0, colorCount));
  const background = palette.pop();
  const margin = 400;

  return ({ context, width, height }) => {
    const points = createGrid(
      width - margin * 2,
      height - margin * 2,
      margin,
      margin,
      palette
    ).filter(() => random.value() >= 0.2);
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    function drawArc(x, y, w, h) {
      const corner = random.value();
      if (corner < 0.2) {
        context.moveTo(x + w, y + h); // bottom right
        context.arc(x + w, y + h, w, 1.5 * Math.PI, Math.PI, true);
        return;
      }
      if (corner < 0.4) {
        context.moveTo(x, y + h); // bottom left
        context.arc(x, y + h, w, 1.5 * Math.PI, 2 * Math.PI, false);
        return;
      }
      if (corner < 0.6) {
        context.moveTo(x, y); // top left
        context.arc(x, y, w, 0, 0.5 * Math.PI, false);
        return;
      }
      if (corner < 0.8) {
        context.moveTo(x + w, y); // top right
        context.arc(x + w, y, w, Math.PI, 0.5 * Math.PI, true);
        return;
      }
      if (corner < 0.85) {
        context.moveTo(x + w, y); // top right
        context.arc(x + w, y, w, 0.5 * Math.PI, 1.5 * Math.PI, false); // 180 degrees
        return;
      }
      if (corner < 0.9) {
        context.moveTo(x, y); // top left
        context.arc(x, y, w, 0, Math.PI, false); // 180 degrees
        return;
      }
      if (corner < 0.95) {
        context.moveTo(x, y + h); // bottom left
        context.arc(x, y + h, w, 1.5 * Math.PI, 0.5 * Math.PI, false); // 180 degrees
        return;
      }
      if (corner < 1) {
        context.moveTo(x + w, y + h); // bottom right
        context.arc(x + w, y + h, w, 1.5 * Math.PI, 0.5 * Math.PI, false); // 180 degrees
        return;
      }
    }

    points.forEach(data => {
      const { position: [x, y], color, w, h } = data;

      context.beginPath();
      context.fillStyle = color;
      drawArc(x, y, w, h);
      context.fill();
    });
  };
};

canvasSketch(sketch, settings);

},{"canvas-sketch":2,"canvas-sketch-util/random":1,"nice-color-palettes":5}],9:[function(require,module,exports){
(function (global){

global.CANVAS_SKETCH_DEFAULT_STORAGE_KEY = window.location.href;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[8,9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC11dGlsL3JhbmRvbS5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2Rpc3Qvbm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvbm9kZV9tb2R1bGVzL2RlZmluZWQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL25vZGVfbW9kdWxlcy9vYmplY3QtYXNzaWduL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvZGlzdC9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9ub2RlX21vZHVsZXMvcmlnaHQtbm93L2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL25vZGVfbW9kdWxlcy9pcy1wcm9taXNlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvZGlzdC9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9ub2RlX21vZHVsZXMvaXMtZG9tL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvZGlzdC9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9saWIvdXRpbC5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2Rpc3Qvbm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvbm9kZV9tb2R1bGVzL2RlZXAtZXF1YWwvbGliL2tleXMuanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL25vZGVfbW9kdWxlcy9kZWVwLWVxdWFsL2xpYi9pc19hcmd1bWVudHMuanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL25vZGVfbW9kdWxlcy9kZWVwLWVxdWFsL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvZGlzdC9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9ub2RlX21vZHVsZXMvZGF0ZWZvcm1hdC9saWIvZGF0ZWZvcm1hdC5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2Rpc3Qvbm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvbm9kZV9tb2R1bGVzL3JlcGVhdC1zdHJpbmcvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL25vZGVfbW9kdWxlcy9wYWQtbGVmdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2Rpc3Qvbm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvbGliL3NhdmUuanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2xpYi9hY2Nlc3NpYmlsaXR5LmpzIiwibm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvZGlzdC9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9saWIvY29yZS9rZXlib2FyZFNob3J0Y3V0cy5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2Rpc3Qvbm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvbGliL3BhcGVyLXNpemVzLmpzIiwibm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvZGlzdC9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9saWIvZGlzdGFuY2VzLmpzIiwibm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvZGlzdC9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9saWIvY29yZS9yZXNpemVDYW52YXMuanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL25vZGVfbW9kdWxlcy9nZXQtY2FudmFzLWNvbnRleHQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2xpYi9jb3JlL2NyZWF0ZUNhbnZhcy5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2Rpc3Qvbm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvbGliL2NvcmUvU2tldGNoTWFuYWdlci5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2Rpc3Qvbm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvbGliL2NhbnZhcy1za2V0Y2guanMiLCJub2RlX21vZHVsZXMvY29udmVydC1sZW5ndGgvY29udmVydC1sZW5ndGguanMiLCJub2RlX21vZHVsZXMvZGVmaW5lZC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9uaWNlLWNvbG9yLXBhbGV0dGVzLzEwMC5qc29uIiwibm9kZV9tb2R1bGVzL3NlZWQtcmFuZG9tL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZXgtbm9pc2Uvc2ltcGxleC1ub2lzZS5qcyIsInNyYy9jaXJjbGVHcmlkLmpzIiwiY2FudmFzLXNrZXRjaC1jbGkvaW5qZWN0ZWQvc3RvcmFnZS1rZXkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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RSxDQUFDLENBQUM7Y0FDZixDQUFDLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO2NBQzdCLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztjQUMxRSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Y0FDMUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2NBQzFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztjQUMxRSxDQUFDLEtBQUssR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDO2NBQ3hHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzdLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDemRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM1R0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwidmFyIHNlZWRSYW5kb20gPSByZXF1aXJlKCdzZWVkLXJhbmRvbScpO1xudmFyIFNpbXBsZXhOb2lzZSA9IHJlcXVpcmUoJ3NpbXBsZXgtbm9pc2UnKTtcbnZhciBkZWZpbmVkID0gcmVxdWlyZSgnZGVmaW5lZCcpO1xuXG5mdW5jdGlvbiBjcmVhdGVSYW5kb20gKGRlZmF1bHRTZWVkKSB7XG4gIGRlZmF1bHRTZWVkID0gZGVmaW5lZChkZWZhdWx0U2VlZCwgbnVsbCk7XG4gIHZhciBkZWZhdWx0UmFuZG9tID0gTWF0aC5yYW5kb207XG4gIHZhciBjdXJyZW50U2VlZDtcbiAgdmFyIGN1cnJlbnRSYW5kb207XG4gIHZhciBub2lzZUdlbmVyYXRvcjtcbiAgdmFyIF9uZXh0R2F1c3NpYW4gPSBudWxsO1xuICB2YXIgX2hhc05leHRHYXVzc2lhbiA9IGZhbHNlO1xuXG4gIHNldFNlZWQoZGVmYXVsdFNlZWQpO1xuXG4gIHJldHVybiB7XG4gICAgdmFsdWU6IHZhbHVlLFxuICAgIGNyZWF0ZVJhbmRvbTogZnVuY3Rpb24gKGRlZmF1bHRTZWVkKSB7XG4gICAgICByZXR1cm4gY3JlYXRlUmFuZG9tKGRlZmF1bHRTZWVkKTtcbiAgICB9LFxuICAgIHNldFNlZWQ6IHNldFNlZWQsXG4gICAgZ2V0U2VlZDogZ2V0U2VlZCxcbiAgICBnZXRSYW5kb21TZWVkOiBnZXRSYW5kb21TZWVkLFxuICAgIHZhbHVlTm9uWmVybzogdmFsdWVOb25aZXJvLFxuICAgIHBlcm11dGVOb2lzZTogcGVybXV0ZU5vaXNlLFxuICAgIG5vaXNlMUQ6IG5vaXNlMUQsXG4gICAgbm9pc2UyRDogbm9pc2UyRCxcbiAgICBub2lzZTNEOiBub2lzZTNELFxuICAgIG5vaXNlNEQ6IG5vaXNlNEQsXG4gICAgc2lnbjogc2lnbixcbiAgICBib29sZWFuOiBib29sZWFuLFxuICAgIGNoYW5jZTogY2hhbmNlLFxuICAgIHJhbmdlOiByYW5nZSxcbiAgICByYW5nZUZsb29yOiByYW5nZUZsb29yLFxuICAgIHBpY2s6IHBpY2ssXG4gICAgc2h1ZmZsZTogc2h1ZmZsZSxcbiAgICBvbkNpcmNsZTogb25DaXJjbGUsXG4gICAgaW5zaWRlQ2lyY2xlOiBpbnNpZGVDaXJjbGUsXG4gICAgb25TcGhlcmU6IG9uU3BoZXJlLFxuICAgIGluc2lkZVNwaGVyZTogaW5zaWRlU3BoZXJlLFxuICAgIHF1YXRlcm5pb246IHF1YXRlcm5pb24sXG4gICAgd2VpZ2h0ZWQ6IHdlaWdodGVkLFxuICAgIHdlaWdodGVkU2V0OiB3ZWlnaHRlZFNldCxcbiAgICB3ZWlnaHRlZFNldEluZGV4OiB3ZWlnaHRlZFNldEluZGV4LFxuICAgIGdhdXNzaWFuOiBnYXVzc2lhblxuICB9O1xuXG4gIGZ1bmN0aW9uIHNldFNlZWQgKHNlZWQsIG9wdCkge1xuICAgIGlmICh0eXBlb2Ygc2VlZCA9PT0gJ251bWJlcicgfHwgdHlwZW9mIHNlZWQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjdXJyZW50U2VlZCA9IHNlZWQ7XG4gICAgICBjdXJyZW50UmFuZG9tID0gc2VlZFJhbmRvbShjdXJyZW50U2VlZCwgb3B0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3VycmVudFNlZWQgPSB1bmRlZmluZWQ7XG4gICAgICBjdXJyZW50UmFuZG9tID0gZGVmYXVsdFJhbmRvbTtcbiAgICB9XG4gICAgbm9pc2VHZW5lcmF0b3IgPSBjcmVhdGVOb2lzZSgpO1xuICAgIF9uZXh0R2F1c3NpYW4gPSBudWxsO1xuICAgIF9oYXNOZXh0R2F1c3NpYW4gPSBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHZhbHVlICgpIHtcbiAgICByZXR1cm4gY3VycmVudFJhbmRvbSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gdmFsdWVOb25aZXJvICgpIHtcbiAgICB2YXIgdSA9IDA7XG4gICAgd2hpbGUgKHUgPT09IDApIHUgPSB2YWx1ZSgpO1xuICAgIHJldHVybiB1O1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0U2VlZCAoKSB7XG4gICAgcmV0dXJuIGN1cnJlbnRTZWVkO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UmFuZG9tU2VlZCAoKSB7XG4gICAgdmFyIHNlZWQgPSBTdHJpbmcoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwMDAwMCkpO1xuICAgIHJldHVybiBzZWVkO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlTm9pc2UgKCkge1xuICAgIHJldHVybiBuZXcgU2ltcGxleE5vaXNlKGN1cnJlbnRSYW5kb20pO1xuICB9XG5cbiAgZnVuY3Rpb24gcGVybXV0ZU5vaXNlICgpIHtcbiAgICBub2lzZUdlbmVyYXRvciA9IGNyZWF0ZU5vaXNlKCk7XG4gIH1cblxuICBmdW5jdGlvbiBub2lzZTFEICh4LCBmcmVxdWVuY3ksIGFtcGxpdHVkZSkge1xuICAgIGlmICghaXNGaW5pdGUoeCkpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ggY29tcG9uZW50IGZvciBub2lzZSgpIG11c3QgYmUgZmluaXRlJyk7XG4gICAgZnJlcXVlbmN5ID0gZGVmaW5lZChmcmVxdWVuY3ksIDEpO1xuICAgIGFtcGxpdHVkZSA9IGRlZmluZWQoYW1wbGl0dWRlLCAxKTtcbiAgICByZXR1cm4gYW1wbGl0dWRlICogbm9pc2VHZW5lcmF0b3Iubm9pc2UyRCh4ICogZnJlcXVlbmN5LCAwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vaXNlMkQgKHgsIHksIGZyZXF1ZW5jeSwgYW1wbGl0dWRlKSB7XG4gICAgaWYgKCFpc0Zpbml0ZSh4KSkgdGhyb3cgbmV3IFR5cGVFcnJvcigneCBjb21wb25lbnQgZm9yIG5vaXNlKCkgbXVzdCBiZSBmaW5pdGUnKTtcbiAgICBpZiAoIWlzRmluaXRlKHkpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCd5IGNvbXBvbmVudCBmb3Igbm9pc2UoKSBtdXN0IGJlIGZpbml0ZScpO1xuICAgIGZyZXF1ZW5jeSA9IGRlZmluZWQoZnJlcXVlbmN5LCAxKTtcbiAgICBhbXBsaXR1ZGUgPSBkZWZpbmVkKGFtcGxpdHVkZSwgMSk7XG4gICAgcmV0dXJuIGFtcGxpdHVkZSAqIG5vaXNlR2VuZXJhdG9yLm5vaXNlMkQoeCAqIGZyZXF1ZW5jeSwgeSAqIGZyZXF1ZW5jeSk7XG4gIH1cblxuICBmdW5jdGlvbiBub2lzZTNEICh4LCB5LCB6LCBmcmVxdWVuY3ksIGFtcGxpdHVkZSkge1xuICAgIGlmICghaXNGaW5pdGUoeCkpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ggY29tcG9uZW50IGZvciBub2lzZSgpIG11c3QgYmUgZmluaXRlJyk7XG4gICAgaWYgKCFpc0Zpbml0ZSh5KSkgdGhyb3cgbmV3IFR5cGVFcnJvcigneSBjb21wb25lbnQgZm9yIG5vaXNlKCkgbXVzdCBiZSBmaW5pdGUnKTtcbiAgICBpZiAoIWlzRmluaXRlKHopKSB0aHJvdyBuZXcgVHlwZUVycm9yKCd6IGNvbXBvbmVudCBmb3Igbm9pc2UoKSBtdXN0IGJlIGZpbml0ZScpO1xuICAgIGZyZXF1ZW5jeSA9IGRlZmluZWQoZnJlcXVlbmN5LCAxKTtcbiAgICBhbXBsaXR1ZGUgPSBkZWZpbmVkKGFtcGxpdHVkZSwgMSk7XG4gICAgcmV0dXJuIGFtcGxpdHVkZSAqIG5vaXNlR2VuZXJhdG9yLm5vaXNlM0QoXG4gICAgICB4ICogZnJlcXVlbmN5LFxuICAgICAgeSAqIGZyZXF1ZW5jeSxcbiAgICAgIHogKiBmcmVxdWVuY3lcbiAgICApO1xuICB9XG5cbiAgZnVuY3Rpb24gbm9pc2U0RCAoeCwgeSwgeiwgdywgZnJlcXVlbmN5LCBhbXBsaXR1ZGUpIHtcbiAgICBpZiAoIWlzRmluaXRlKHgpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCd4IGNvbXBvbmVudCBmb3Igbm9pc2UoKSBtdXN0IGJlIGZpbml0ZScpO1xuICAgIGlmICghaXNGaW5pdGUoeSkpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3kgY29tcG9uZW50IGZvciBub2lzZSgpIG11c3QgYmUgZmluaXRlJyk7XG4gICAgaWYgKCFpc0Zpbml0ZSh6KSkgdGhyb3cgbmV3IFR5cGVFcnJvcigneiBjb21wb25lbnQgZm9yIG5vaXNlKCkgbXVzdCBiZSBmaW5pdGUnKTtcbiAgICBpZiAoIWlzRmluaXRlKHcpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCd3IGNvbXBvbmVudCBmb3Igbm9pc2UoKSBtdXN0IGJlIGZpbml0ZScpO1xuICAgIGZyZXF1ZW5jeSA9IGRlZmluZWQoZnJlcXVlbmN5LCAxKTtcbiAgICBhbXBsaXR1ZGUgPSBkZWZpbmVkKGFtcGxpdHVkZSwgMSk7XG4gICAgcmV0dXJuIGFtcGxpdHVkZSAqIG5vaXNlR2VuZXJhdG9yLm5vaXNlNEQoXG4gICAgICB4ICogZnJlcXVlbmN5LFxuICAgICAgeSAqIGZyZXF1ZW5jeSxcbiAgICAgIHogKiBmcmVxdWVuY3ksXG4gICAgICB3ICogZnJlcXVlbmN5XG4gICAgKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNpZ24gKCkge1xuICAgIHJldHVybiBib29sZWFuKCkgPyAxIDogLTE7XG4gIH1cblxuICBmdW5jdGlvbiBib29sZWFuICgpIHtcbiAgICByZXR1cm4gdmFsdWUoKSA+IDAuNTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNoYW5jZSAobikge1xuICAgIG4gPSBkZWZpbmVkKG4sIDAuNSk7XG4gICAgaWYgKHR5cGVvZiBuICE9PSAnbnVtYmVyJykgdGhyb3cgbmV3IFR5cGVFcnJvcignZXhwZWN0ZWQgbiB0byBiZSBhIG51bWJlcicpO1xuICAgIHJldHVybiB2YWx1ZSgpIDwgbjtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJhbmdlIChtaW4sIG1heCkge1xuICAgIGlmIChtYXggPT09IHVuZGVmaW5lZCkge1xuICAgICAgbWF4ID0gbWluO1xuICAgICAgbWluID0gMDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG1pbiAhPT0gJ251bWJlcicgfHwgdHlwZW9mIG1heCAhPT0gJ251bWJlcicpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGFsbCBhcmd1bWVudHMgdG8gYmUgbnVtYmVycycpO1xuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZSgpICogKG1heCAtIG1pbikgKyBtaW47XG4gIH1cblxuICBmdW5jdGlvbiByYW5nZUZsb29yIChtaW4sIG1heCkge1xuICAgIGlmIChtYXggPT09IHVuZGVmaW5lZCkge1xuICAgICAgbWF4ID0gbWluO1xuICAgICAgbWluID0gMDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG1pbiAhPT0gJ251bWJlcicgfHwgdHlwZW9mIG1heCAhPT0gJ251bWJlcicpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGFsbCBhcmd1bWVudHMgdG8gYmUgbnVtYmVycycpO1xuICAgIH1cblxuICAgIHJldHVybiBNYXRoLmZsb29yKHJhbmdlKG1pbiwgbWF4KSk7XG4gIH1cblxuICBmdW5jdGlvbiBwaWNrIChhcnJheSkge1xuICAgIGlmIChhcnJheS5sZW5ndGggPT09IDApIHJldHVybiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIGFycmF5W3JhbmdlRmxvb3IoMCwgYXJyYXkubGVuZ3RoKV07XG4gIH1cblxuICBmdW5jdGlvbiBzaHVmZmxlIChhcnIpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgQXJyYXksIGdvdCAnICsgdHlwZW9mIGFycik7XG4gICAgfVxuXG4gICAgdmFyIHJhbmQ7XG4gICAgdmFyIHRtcDtcbiAgICB2YXIgbGVuID0gYXJyLmxlbmd0aDtcbiAgICB2YXIgcmV0ID0gYXJyLnNsaWNlKCk7XG4gICAgd2hpbGUgKGxlbikge1xuICAgICAgcmFuZCA9IE1hdGguZmxvb3IodmFsdWUoKSAqIGxlbi0tKTtcbiAgICAgIHRtcCA9IHJldFtsZW5dO1xuICAgICAgcmV0W2xlbl0gPSByZXRbcmFuZF07XG4gICAgICByZXRbcmFuZF0gPSB0bXA7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBmdW5jdGlvbiBvbkNpcmNsZSAocmFkaXVzLCBvdXQpIHtcbiAgICByYWRpdXMgPSBkZWZpbmVkKHJhZGl1cywgMSk7XG4gICAgb3V0ID0gb3V0IHx8IFtdO1xuICAgIHZhciB0aGV0YSA9IHZhbHVlKCkgKiAyLjAgKiBNYXRoLlBJO1xuICAgIG91dFswXSA9IHJhZGl1cyAqIE1hdGguY29zKHRoZXRhKTtcbiAgICBvdXRbMV0gPSByYWRpdXMgKiBNYXRoLnNpbih0aGV0YSk7XG4gICAgcmV0dXJuIG91dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluc2lkZUNpcmNsZSAocmFkaXVzLCBvdXQpIHtcbiAgICByYWRpdXMgPSBkZWZpbmVkKHJhZGl1cywgMSk7XG4gICAgb3V0ID0gb3V0IHx8IFtdO1xuICAgIG9uQ2lyY2xlKDEsIG91dCk7XG4gICAgdmFyIHIgPSByYWRpdXMgKiBNYXRoLnNxcnQodmFsdWUoKSk7XG4gICAgb3V0WzBdICo9IHI7XG4gICAgb3V0WzFdICo9IHI7XG4gICAgcmV0dXJuIG91dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uU3BoZXJlIChyYWRpdXMsIG91dCkge1xuICAgIHJhZGl1cyA9IGRlZmluZWQocmFkaXVzLCAxKTtcbiAgICBvdXQgPSBvdXQgfHwgW107XG4gICAgdmFyIHUgPSB2YWx1ZSgpICogTWF0aC5QSSAqIDI7XG4gICAgdmFyIHYgPSB2YWx1ZSgpICogMiAtIDE7XG4gICAgdmFyIHBoaSA9IHU7XG4gICAgdmFyIHRoZXRhID0gTWF0aC5hY29zKHYpO1xuICAgIG91dFswXSA9IHJhZGl1cyAqIE1hdGguc2luKHRoZXRhKSAqIE1hdGguY29zKHBoaSk7XG4gICAgb3V0WzFdID0gcmFkaXVzICogTWF0aC5zaW4odGhldGEpICogTWF0aC5zaW4ocGhpKTtcbiAgICBvdXRbMl0gPSByYWRpdXMgKiBNYXRoLmNvcyh0aGV0YSk7XG4gICAgcmV0dXJuIG91dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluc2lkZVNwaGVyZSAocmFkaXVzLCBvdXQpIHtcbiAgICByYWRpdXMgPSBkZWZpbmVkKHJhZGl1cywgMSk7XG4gICAgb3V0ID0gb3V0IHx8IFtdO1xuICAgIHZhciB1ID0gdmFsdWUoKSAqIE1hdGguUEkgKiAyO1xuICAgIHZhciB2ID0gdmFsdWUoKSAqIDIgLSAxO1xuICAgIHZhciBrID0gdmFsdWUoKTtcblxuICAgIHZhciBwaGkgPSB1O1xuICAgIHZhciB0aGV0YSA9IE1hdGguYWNvcyh2KTtcbiAgICB2YXIgciA9IHJhZGl1cyAqIE1hdGguY2JydChrKTtcbiAgICBvdXRbMF0gPSByICogTWF0aC5zaW4odGhldGEpICogTWF0aC5jb3MocGhpKTtcbiAgICBvdXRbMV0gPSByICogTWF0aC5zaW4odGhldGEpICogTWF0aC5zaW4ocGhpKTtcbiAgICBvdXRbMl0gPSByICogTWF0aC5jb3ModGhldGEpO1xuICAgIHJldHVybiBvdXQ7XG4gIH1cblxuICBmdW5jdGlvbiBxdWF0ZXJuaW9uIChvdXQpIHtcbiAgICBvdXQgPSBvdXQgfHwgW107XG4gICAgdmFyIHUxID0gdmFsdWUoKTtcbiAgICB2YXIgdTIgPSB2YWx1ZSgpO1xuICAgIHZhciB1MyA9IHZhbHVlKCk7XG5cbiAgICB2YXIgc3ExID0gTWF0aC5zcXJ0KDEgLSB1MSk7XG4gICAgdmFyIHNxMiA9IE1hdGguc3FydCh1MSk7XG5cbiAgICB2YXIgdGhldGExID0gTWF0aC5QSSAqIDIgKiB1MjtcbiAgICB2YXIgdGhldGEyID0gTWF0aC5QSSAqIDIgKiB1MztcblxuICAgIHZhciB4ID0gTWF0aC5zaW4odGhldGExKSAqIHNxMTtcbiAgICB2YXIgeSA9IE1hdGguY29zKHRoZXRhMSkgKiBzcTE7XG4gICAgdmFyIHogPSBNYXRoLnNpbih0aGV0YTIpICogc3EyO1xuICAgIHZhciB3ID0gTWF0aC5jb3ModGhldGEyKSAqIHNxMjtcbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgb3V0WzJdID0gejtcbiAgICBvdXRbM10gPSB3O1xuICAgIHJldHVybiBvdXQ7XG4gIH1cblxuICBmdW5jdGlvbiB3ZWlnaHRlZFNldCAoc2V0KSB7XG4gICAgc2V0ID0gc2V0IHx8IFtdO1xuICAgIGlmIChzZXQubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gc2V0W3dlaWdodGVkU2V0SW5kZXgoc2V0KV0udmFsdWU7XG4gIH1cblxuICBmdW5jdGlvbiB3ZWlnaHRlZFNldEluZGV4IChzZXQpIHtcbiAgICBzZXQgPSBzZXQgfHwgW107XG4gICAgaWYgKHNldC5sZW5ndGggPT09IDApIHJldHVybiAtMTtcbiAgICByZXR1cm4gd2VpZ2h0ZWQoc2V0Lm1hcChmdW5jdGlvbiAocykge1xuICAgICAgcmV0dXJuIHMud2VpZ2h0O1xuICAgIH0pKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHdlaWdodGVkICh3ZWlnaHRzKSB7XG4gICAgd2VpZ2h0cyA9IHdlaWdodHMgfHwgW107XG4gICAgaWYgKHdlaWdodHMubGVuZ3RoID09PSAwKSByZXR1cm4gLTE7XG4gICAgdmFyIHRvdGFsV2VpZ2h0ID0gMDtcbiAgICB2YXIgaTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCB3ZWlnaHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0b3RhbFdlaWdodCArPSB3ZWlnaHRzW2ldO1xuICAgIH1cblxuICAgIGlmICh0b3RhbFdlaWdodCA8PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ1dlaWdodHMgbXVzdCBzdW0gdG8gPiAwJyk7XG5cbiAgICB2YXIgcmFuZG9tID0gdmFsdWUoKSAqIHRvdGFsV2VpZ2h0O1xuICAgIGZvciAoaSA9IDA7IGkgPCB3ZWlnaHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAocmFuZG9tIDwgd2VpZ2h0c1tpXSkge1xuICAgICAgICByZXR1cm4gaTtcbiAgICAgIH1cbiAgICAgIHJhbmRvbSAtPSB3ZWlnaHRzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdhdXNzaWFuIChtZWFuLCBzdGFuZGFyZERlcml2YXRpb24pIHtcbiAgICBtZWFuID0gZGVmaW5lZChtZWFuLCAwKTtcbiAgICBzdGFuZGFyZERlcml2YXRpb24gPSBkZWZpbmVkKHN0YW5kYXJkRGVyaXZhdGlvbiwgMSk7XG5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vb3Blbmpkay1taXJyb3IvamRrN3UtamRrL2Jsb2IvZjRkODA5NTdlODlhMTlhMjliYjlmOTgwN2QyYTI4MzUxZWQ3ZjdkZi9zcmMvc2hhcmUvY2xhc3Nlcy9qYXZhL3V0aWwvUmFuZG9tLmphdmEjTDQ5NlxuICAgIGlmIChfaGFzTmV4dEdhdXNzaWFuKSB7XG4gICAgICBfaGFzTmV4dEdhdXNzaWFuID0gZmFsc2U7XG4gICAgICB2YXIgcmVzdWx0ID0gX25leHRHYXVzc2lhbjtcbiAgICAgIF9uZXh0R2F1c3NpYW4gPSBudWxsO1xuICAgICAgcmV0dXJuIG1lYW4gKyBzdGFuZGFyZERlcml2YXRpb24gKiByZXN1bHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB2MSA9IDA7XG4gICAgICB2YXIgdjIgPSAwO1xuICAgICAgdmFyIHMgPSAwO1xuICAgICAgZG8ge1xuICAgICAgICB2MSA9IHZhbHVlKCkgKiAyIC0gMTsgLy8gYmV0d2VlbiAtMSBhbmQgMVxuICAgICAgICB2MiA9IHZhbHVlKCkgKiAyIC0gMTsgLy8gYmV0d2VlbiAtMSBhbmQgMVxuICAgICAgICBzID0gdjEgKiB2MSArIHYyICogdjI7XG4gICAgICB9IHdoaWxlIChzID49IDEgfHwgcyA9PT0gMCk7XG4gICAgICB2YXIgbXVsdGlwbGllciA9IE1hdGguc3FydCgtMiAqIE1hdGgubG9nKHMpIC8gcyk7XG4gICAgICBfbmV4dEdhdXNzaWFuID0gKHYyICogbXVsdGlwbGllcik7XG4gICAgICBfaGFzTmV4dEdhdXNzaWFuID0gdHJ1ZTtcbiAgICAgIHJldHVybiBtZWFuICsgc3RhbmRhcmREZXJpdmF0aW9uICogKHYxICogbXVsdGlwbGllcik7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlUmFuZG9tKCk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoYXJndW1lbnRzW2ldICE9PSB1bmRlZmluZWQpIHJldHVybiBhcmd1bWVudHNbaV07XG4gICAgfVxufTtcbiIsIi8qXG5vYmplY3QtYXNzaWduXG4oYykgU2luZHJlIFNvcmh1c1xuQGxpY2Vuc2UgTUlUXG4qL1xuXG4ndXNlIHN0cmljdCc7XG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xudmFyIGdldE93blByb3BlcnR5U3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIHByb3BJc0VudW1lcmFibGUgPSBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG5mdW5jdGlvbiB0b09iamVjdCh2YWwpIHtcblx0aWYgKHZhbCA9PT0gbnVsbCB8fCB2YWwgPT09IHVuZGVmaW5lZCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ09iamVjdC5hc3NpZ24gY2Fubm90IGJlIGNhbGxlZCB3aXRoIG51bGwgb3IgdW5kZWZpbmVkJyk7XG5cdH1cblxuXHRyZXR1cm4gT2JqZWN0KHZhbCk7XG59XG5cbmZ1bmN0aW9uIHNob3VsZFVzZU5hdGl2ZSgpIHtcblx0dHJ5IHtcblx0XHRpZiAoIU9iamVjdC5hc3NpZ24pIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBEZXRlY3QgYnVnZ3kgcHJvcGVydHkgZW51bWVyYXRpb24gb3JkZXIgaW4gb2xkZXIgVjggdmVyc2lvbnMuXG5cblx0XHQvLyBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvdjgvaXNzdWVzL2RldGFpbD9pZD00MTE4XG5cdFx0dmFyIHRlc3QxID0gbmV3IFN0cmluZygnYWJjJyk7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLW5ldy13cmFwcGVyc1xuXHRcdHRlc3QxWzVdID0gJ2RlJztcblx0XHRpZiAoT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGVzdDEpWzBdID09PSAnNScpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvdjgvaXNzdWVzL2RldGFpbD9pZD0zMDU2XG5cdFx0dmFyIHRlc3QyID0ge307XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG5cdFx0XHR0ZXN0MlsnXycgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGkpXSA9IGk7XG5cdFx0fVxuXHRcdHZhciBvcmRlcjIgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0ZXN0MikubWFwKGZ1bmN0aW9uIChuKSB7XG5cdFx0XHRyZXR1cm4gdGVzdDJbbl07XG5cdFx0fSk7XG5cdFx0aWYgKG9yZGVyMi5qb2luKCcnKSAhPT0gJzAxMjM0NTY3ODknKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9MzA1NlxuXHRcdHZhciB0ZXN0MyA9IHt9O1xuXHRcdCdhYmNkZWZnaGlqa2xtbm9wcXJzdCcuc3BsaXQoJycpLmZvckVhY2goZnVuY3Rpb24gKGxldHRlcikge1xuXHRcdFx0dGVzdDNbbGV0dGVyXSA9IGxldHRlcjtcblx0XHR9KTtcblx0XHRpZiAoT2JqZWN0LmtleXMoT2JqZWN0LmFzc2lnbih7fSwgdGVzdDMpKS5qb2luKCcnKSAhPT1cblx0XHRcdFx0J2FiY2RlZmdoaWprbG1ub3BxcnN0Jykge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHQvLyBXZSBkb24ndCBleHBlY3QgYW55IG9mIHRoZSBhYm92ZSB0byB0aHJvdywgYnV0IGJldHRlciB0byBiZSBzYWZlLlxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNob3VsZFVzZU5hdGl2ZSgpID8gT2JqZWN0LmFzc2lnbiA6IGZ1bmN0aW9uICh0YXJnZXQsIHNvdXJjZSkge1xuXHR2YXIgZnJvbTtcblx0dmFyIHRvID0gdG9PYmplY3QodGFyZ2V0KTtcblx0dmFyIHN5bWJvbHM7XG5cblx0Zm9yICh2YXIgcyA9IDE7IHMgPCBhcmd1bWVudHMubGVuZ3RoOyBzKyspIHtcblx0XHRmcm9tID0gT2JqZWN0KGFyZ3VtZW50c1tzXSk7XG5cblx0XHRmb3IgKHZhciBrZXkgaW4gZnJvbSkge1xuXHRcdFx0aWYgKGhhc093blByb3BlcnR5LmNhbGwoZnJvbSwga2V5KSkge1xuXHRcdFx0XHR0b1trZXldID0gZnJvbVtrZXldO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChnZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHtcblx0XHRcdHN5bWJvbHMgPSBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZnJvbSk7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHN5bWJvbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKHByb3BJc0VudW1lcmFibGUuY2FsbChmcm9tLCBzeW1ib2xzW2ldKSkge1xuXHRcdFx0XHRcdHRvW3N5bWJvbHNbaV1dID0gZnJvbVtzeW1ib2xzW2ldXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0bztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9XG4gIGdsb2JhbC5wZXJmb3JtYW5jZSAmJlxuICBnbG9iYWwucGVyZm9ybWFuY2Uubm93ID8gZnVuY3Rpb24gbm93KCkge1xuICAgIHJldHVybiBwZXJmb3JtYW5jZS5ub3coKVxuICB9IDogRGF0ZS5ub3cgfHwgZnVuY3Rpb24gbm93KCkge1xuICAgIHJldHVybiArbmV3IERhdGVcbiAgfVxuIiwibW9kdWxlLmV4cG9ydHMgPSBpc1Byb21pc2U7XG5cbmZ1bmN0aW9uIGlzUHJvbWlzZShvYmopIHtcbiAgcmV0dXJuICEhb2JqICYmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyB8fCB0eXBlb2Ygb2JqID09PSAnZnVuY3Rpb24nKSAmJiB0eXBlb2Ygb2JqLnRoZW4gPT09ICdmdW5jdGlvbic7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGlzTm9kZVxuXG5mdW5jdGlvbiBpc05vZGUgKHZhbCkge1xuICByZXR1cm4gKCF2YWwgfHwgdHlwZW9mIHZhbCAhPT0gJ29iamVjdCcpXG4gICAgPyBmYWxzZVxuICAgIDogKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnICYmIHR5cGVvZiB3aW5kb3cuTm9kZSA9PT0gJ29iamVjdCcpXG4gICAgICA/ICh2YWwgaW5zdGFuY2VvZiB3aW5kb3cuTm9kZSlcbiAgICAgIDogKHR5cGVvZiB2YWwubm9kZVR5cGUgPT09ICdudW1iZXInKSAmJlxuICAgICAgICAodHlwZW9mIHZhbC5ub2RlTmFtZSA9PT0gJ3N0cmluZycpXG59XG4iLCIvLyBUT0RPOiBXZSBjYW4gcmVtb3ZlIGEgaHVnZSBjaHVuayBvZiBidW5kbGUgc2l6ZSBieSB1c2luZyBhIHNtYWxsZXJcbi8vIHV0aWxpdHkgbW9kdWxlIGZvciBjb252ZXJ0aW5nIHVuaXRzLlxuaW1wb3J0IGlzRE9NIGZyb20gJ2lzLWRvbSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDbGllbnRBUEkgKCkge1xuICByZXR1cm4gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93WydjYW52YXMtc2tldGNoLWNsaSddO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNCcm93c2VyICgpIHtcbiAgcmV0dXJuIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1dlYkdMQ29udGV4dCAoY3R4KSB7XG4gIHJldHVybiB0eXBlb2YgY3R4LmNsZWFyID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBjdHguY2xlYXJDb2xvciA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgY3R4LmJ1ZmZlckRhdGEgPT09ICdmdW5jdGlvbic7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NhbnZhcyAoZWxlbWVudCkge1xuICByZXR1cm4gaXNET00oZWxlbWVudCkgJiYgL2NhbnZhcy9pLnRlc3QoZWxlbWVudC5ub2RlTmFtZSkgJiYgdHlwZW9mIGVsZW1lbnQuZ2V0Q29udGV4dCA9PT0gJ2Z1bmN0aW9uJztcbn1cbiIsImV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHR5cGVvZiBPYmplY3Qua2V5cyA9PT0gJ2Z1bmN0aW9uJ1xuICA/IE9iamVjdC5rZXlzIDogc2hpbTtcblxuZXhwb3J0cy5zaGltID0gc2hpbTtcbmZ1bmN0aW9uIHNoaW0gKG9iaikge1xuICB2YXIga2V5cyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSBrZXlzLnB1c2goa2V5KTtcbiAgcmV0dXJuIGtleXM7XG59XG4iLCJ2YXIgc3VwcG9ydHNBcmd1bWVudHNDbGFzcyA9IChmdW5jdGlvbigpe1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyZ3VtZW50cylcbn0pKCkgPT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHN1cHBvcnRzQXJndW1lbnRzQ2xhc3MgPyBzdXBwb3J0ZWQgOiB1bnN1cHBvcnRlZDtcblxuZXhwb3J0cy5zdXBwb3J0ZWQgPSBzdXBwb3J0ZWQ7XG5mdW5jdGlvbiBzdXBwb3J0ZWQob2JqZWN0KSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PSAnW29iamVjdCBBcmd1bWVudHNdJztcbn07XG5cbmV4cG9ydHMudW5zdXBwb3J0ZWQgPSB1bnN1cHBvcnRlZDtcbmZ1bmN0aW9uIHVuc3VwcG9ydGVkKG9iamVjdCl7XG4gIHJldHVybiBvYmplY3QgJiZcbiAgICB0eXBlb2Ygb2JqZWN0ID09ICdvYmplY3QnICYmXG4gICAgdHlwZW9mIG9iamVjdC5sZW5ndGggPT0gJ251bWJlcicgJiZcbiAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCAnY2FsbGVlJykgJiZcbiAgICAhT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKG9iamVjdCwgJ2NhbGxlZScpIHx8XG4gICAgZmFsc2U7XG59O1xuIiwidmFyIHBTbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbnZhciBvYmplY3RLZXlzID0gcmVxdWlyZSgnLi9saWIva2V5cy5qcycpO1xudmFyIGlzQXJndW1lbnRzID0gcmVxdWlyZSgnLi9saWIvaXNfYXJndW1lbnRzLmpzJyk7XG5cbnZhciBkZWVwRXF1YWwgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChhY3R1YWwsIGV4cGVjdGVkLCBvcHRzKSB7XG4gIGlmICghb3B0cykgb3B0cyA9IHt9O1xuICAvLyA3LjEuIEFsbCBpZGVudGljYWwgdmFsdWVzIGFyZSBlcXVpdmFsZW50LCBhcyBkZXRlcm1pbmVkIGJ5ID09PS5cbiAgaWYgKGFjdHVhbCA9PT0gZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcblxuICB9IGVsc2UgaWYgKGFjdHVhbCBpbnN0YW5jZW9mIERhdGUgJiYgZXhwZWN0ZWQgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgcmV0dXJuIGFjdHVhbC5nZXRUaW1lKCkgPT09IGV4cGVjdGVkLmdldFRpbWUoKTtcblxuICAvLyA3LjMuIE90aGVyIHBhaXJzIHRoYXQgZG8gbm90IGJvdGggcGFzcyB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcsXG4gIC8vIGVxdWl2YWxlbmNlIGlzIGRldGVybWluZWQgYnkgPT0uXG4gIH0gZWxzZSBpZiAoIWFjdHVhbCB8fCAhZXhwZWN0ZWQgfHwgdHlwZW9mIGFjdHVhbCAhPSAnb2JqZWN0JyAmJiB0eXBlb2YgZXhwZWN0ZWQgIT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gb3B0cy5zdHJpY3QgPyBhY3R1YWwgPT09IGV4cGVjdGVkIDogYWN0dWFsID09IGV4cGVjdGVkO1xuXG4gIC8vIDcuNC4gRm9yIGFsbCBvdGhlciBPYmplY3QgcGFpcnMsIGluY2x1ZGluZyBBcnJheSBvYmplY3RzLCBlcXVpdmFsZW5jZSBpc1xuICAvLyBkZXRlcm1pbmVkIGJ5IGhhdmluZyB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcyAoYXMgdmVyaWZpZWRcbiAgLy8gd2l0aCBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwpLCB0aGUgc2FtZSBzZXQgb2Yga2V5c1xuICAvLyAoYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyKSwgZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5XG4gIC8vIGNvcnJlc3BvbmRpbmcga2V5LCBhbmQgYW4gaWRlbnRpY2FsICdwcm90b3R5cGUnIHByb3BlcnR5LiBOb3RlOiB0aGlzXG4gIC8vIGFjY291bnRzIGZvciBib3RoIG5hbWVkIGFuZCBpbmRleGVkIHByb3BlcnRpZXMgb24gQXJyYXlzLlxuICB9IGVsc2Uge1xuICAgIHJldHVybiBvYmpFcXVpdihhY3R1YWwsIGV4cGVjdGVkLCBvcHRzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZE9yTnVsbCh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gaXNCdWZmZXIgKHgpIHtcbiAgaWYgKCF4IHx8IHR5cGVvZiB4ICE9PSAnb2JqZWN0JyB8fCB0eXBlb2YgeC5sZW5ndGggIT09ICdudW1iZXInKSByZXR1cm4gZmFsc2U7XG4gIGlmICh0eXBlb2YgeC5jb3B5ICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiB4LnNsaWNlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh4Lmxlbmd0aCA+IDAgJiYgdHlwZW9mIHhbMF0gIT09ICdudW1iZXInKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBvYmpFcXVpdihhLCBiLCBvcHRzKSB7XG4gIHZhciBpLCBrZXk7XG4gIGlmIChpc1VuZGVmaW5lZE9yTnVsbChhKSB8fCBpc1VuZGVmaW5lZE9yTnVsbChiKSlcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS5cbiAgaWYgKGEucHJvdG90eXBlICE9PSBiLnByb3RvdHlwZSkgcmV0dXJuIGZhbHNlO1xuICAvL35+fkkndmUgbWFuYWdlZCB0byBicmVhayBPYmplY3Qua2V5cyB0aHJvdWdoIHNjcmV3eSBhcmd1bWVudHMgcGFzc2luZy5cbiAgLy8gICBDb252ZXJ0aW5nIHRvIGFycmF5IHNvbHZlcyB0aGUgcHJvYmxlbS5cbiAgaWYgKGlzQXJndW1lbnRzKGEpKSB7XG4gICAgaWYgKCFpc0FyZ3VtZW50cyhiKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBhID0gcFNsaWNlLmNhbGwoYSk7XG4gICAgYiA9IHBTbGljZS5jYWxsKGIpO1xuICAgIHJldHVybiBkZWVwRXF1YWwoYSwgYiwgb3B0cyk7XG4gIH1cbiAgaWYgKGlzQnVmZmVyKGEpKSB7XG4gICAgaWYgKCFpc0J1ZmZlcihiKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgZm9yIChpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChhW2ldICE9PSBiW2ldKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHRyeSB7XG4gICAgdmFyIGthID0gb2JqZWN0S2V5cyhhKSxcbiAgICAgICAga2IgPSBvYmplY3RLZXlzKGIpO1xuICB9IGNhdGNoIChlKSB7Ly9oYXBwZW5zIHdoZW4gb25lIGlzIGEgc3RyaW5nIGxpdGVyYWwgYW5kIHRoZSBvdGhlciBpc24ndFxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGtleXMgaW5jb3Jwb3JhdGVzXG4gIC8vIGhhc093blByb3BlcnR5KVxuICBpZiAoa2EubGVuZ3RoICE9IGtiLmxlbmd0aClcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vdGhlIHNhbWUgc2V0IG9mIGtleXMgKGFsdGhvdWdoIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZSBvcmRlciksXG4gIGthLnNvcnQoKTtcbiAga2Iuc29ydCgpO1xuICAvL35+fmNoZWFwIGtleSB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgaWYgKGthW2ldICE9IGtiW2ldKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5IGNvcnJlc3BvbmRpbmcga2V5LCBhbmRcbiAgLy9+fn5wb3NzaWJseSBleHBlbnNpdmUgZGVlcCB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAga2V5ID0ga2FbaV07XG4gICAgaWYgKCFkZWVwRXF1YWwoYVtrZXldLCBiW2tleV0sIG9wdHMpKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHR5cGVvZiBhID09PSB0eXBlb2YgYjtcbn1cbiIsIi8qXG4gKiBEYXRlIEZvcm1hdCAxLjIuM1xuICogKGMpIDIwMDctMjAwOSBTdGV2ZW4gTGV2aXRoYW4gPHN0ZXZlbmxldml0aGFuLmNvbT5cbiAqIE1JVCBsaWNlbnNlXG4gKlxuICogSW5jbHVkZXMgZW5oYW5jZW1lbnRzIGJ5IFNjb3R0IFRyZW5kYSA8c2NvdHQudHJlbmRhLm5ldD5cbiAqIGFuZCBLcmlzIEtvd2FsIDxjaXhhci5jb20vfmtyaXMua293YWwvPlxuICpcbiAqIEFjY2VwdHMgYSBkYXRlLCBhIG1hc2ssIG9yIGEgZGF0ZSBhbmQgYSBtYXNrLlxuICogUmV0dXJucyBhIGZvcm1hdHRlZCB2ZXJzaW9uIG9mIHRoZSBnaXZlbiBkYXRlLlxuICogVGhlIGRhdGUgZGVmYXVsdHMgdG8gdGhlIGN1cnJlbnQgZGF0ZS90aW1lLlxuICogVGhlIG1hc2sgZGVmYXVsdHMgdG8gZGF0ZUZvcm1hdC5tYXNrcy5kZWZhdWx0LlxuICovXG5cbihmdW5jdGlvbihnbG9iYWwpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBkYXRlRm9ybWF0ID0gKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHRva2VuID0gL2R7MSw0fXxtezEsNH18eXkoPzp5eSk/fChbSGhNc1R0XSlcXDE/fFtMbG9TWldOXXxcIlteXCJdKlwifCdbXiddKicvZztcbiAgICAgIHZhciB0aW1lem9uZSA9IC9cXGIoPzpbUE1DRUFdW1NEUF1UfCg/OlBhY2lmaWN8TW91bnRhaW58Q2VudHJhbHxFYXN0ZXJufEF0bGFudGljKSAoPzpTdGFuZGFyZHxEYXlsaWdodHxQcmV2YWlsaW5nKSBUaW1lfCg/OkdNVHxVVEMpKD86Wy0rXVxcZHs0fSk/KVxcYi9nO1xuICAgICAgdmFyIHRpbWV6b25lQ2xpcCA9IC9bXi0rXFxkQS1aXS9nO1xuICBcbiAgICAgIC8vIFJlZ2V4ZXMgYW5kIHN1cHBvcnRpbmcgZnVuY3Rpb25zIGFyZSBjYWNoZWQgdGhyb3VnaCBjbG9zdXJlXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGRhdGUsIG1hc2ssIHV0YywgZ210KSB7XG4gIFxuICAgICAgICAvLyBZb3UgY2FuJ3QgcHJvdmlkZSB1dGMgaWYgeW91IHNraXAgb3RoZXIgYXJncyAodXNlIHRoZSAnVVRDOicgbWFzayBwcmVmaXgpXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxICYmIGtpbmRPZihkYXRlKSA9PT0gJ3N0cmluZycgJiYgIS9cXGQvLnRlc3QoZGF0ZSkpIHtcbiAgICAgICAgICBtYXNrID0gZGF0ZTtcbiAgICAgICAgICBkYXRlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gIFxuICAgICAgICBkYXRlID0gZGF0ZSB8fCBuZXcgRGF0ZTtcbiAgXG4gICAgICAgIGlmKCEoZGF0ZSBpbnN0YW5jZW9mIERhdGUpKSB7XG4gICAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKGRhdGUpO1xuICAgICAgICB9XG4gIFxuICAgICAgICBpZiAoaXNOYU4oZGF0ZSkpIHtcbiAgICAgICAgICB0aHJvdyBUeXBlRXJyb3IoJ0ludmFsaWQgZGF0ZScpO1xuICAgICAgICB9XG4gIFxuICAgICAgICBtYXNrID0gU3RyaW5nKGRhdGVGb3JtYXQubWFza3NbbWFza10gfHwgbWFzayB8fCBkYXRlRm9ybWF0Lm1hc2tzWydkZWZhdWx0J10pO1xuICBcbiAgICAgICAgLy8gQWxsb3cgc2V0dGluZyB0aGUgdXRjL2dtdCBhcmd1bWVudCB2aWEgdGhlIG1hc2tcbiAgICAgICAgdmFyIG1hc2tTbGljZSA9IG1hc2suc2xpY2UoMCwgNCk7XG4gICAgICAgIGlmIChtYXNrU2xpY2UgPT09ICdVVEM6JyB8fCBtYXNrU2xpY2UgPT09ICdHTVQ6Jykge1xuICAgICAgICAgIG1hc2sgPSBtYXNrLnNsaWNlKDQpO1xuICAgICAgICAgIHV0YyA9IHRydWU7XG4gICAgICAgICAgaWYgKG1hc2tTbGljZSA9PT0gJ0dNVDonKSB7XG4gICAgICAgICAgICBnbXQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICBcbiAgICAgICAgdmFyIF8gPSB1dGMgPyAnZ2V0VVRDJyA6ICdnZXQnO1xuICAgICAgICB2YXIgZCA9IGRhdGVbXyArICdEYXRlJ10oKTtcbiAgICAgICAgdmFyIEQgPSBkYXRlW18gKyAnRGF5J10oKTtcbiAgICAgICAgdmFyIG0gPSBkYXRlW18gKyAnTW9udGgnXSgpO1xuICAgICAgICB2YXIgeSA9IGRhdGVbXyArICdGdWxsWWVhciddKCk7XG4gICAgICAgIHZhciBIID0gZGF0ZVtfICsgJ0hvdXJzJ10oKTtcbiAgICAgICAgdmFyIE0gPSBkYXRlW18gKyAnTWludXRlcyddKCk7XG4gICAgICAgIHZhciBzID0gZGF0ZVtfICsgJ1NlY29uZHMnXSgpO1xuICAgICAgICB2YXIgTCA9IGRhdGVbXyArICdNaWxsaXNlY29uZHMnXSgpO1xuICAgICAgICB2YXIgbyA9IHV0YyA/IDAgOiBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XG4gICAgICAgIHZhciBXID0gZ2V0V2VlayhkYXRlKTtcbiAgICAgICAgdmFyIE4gPSBnZXREYXlPZldlZWsoZGF0ZSk7XG4gICAgICAgIHZhciBmbGFncyA9IHtcbiAgICAgICAgICBkOiAgICBkLFxuICAgICAgICAgIGRkOiAgIHBhZChkKSxcbiAgICAgICAgICBkZGQ6ICBkYXRlRm9ybWF0LmkxOG4uZGF5TmFtZXNbRF0sXG4gICAgICAgICAgZGRkZDogZGF0ZUZvcm1hdC5pMThuLmRheU5hbWVzW0QgKyA3XSxcbiAgICAgICAgICBtOiAgICBtICsgMSxcbiAgICAgICAgICBtbTogICBwYWQobSArIDEpLFxuICAgICAgICAgIG1tbTogIGRhdGVGb3JtYXQuaTE4bi5tb250aE5hbWVzW21dLFxuICAgICAgICAgIG1tbW06IGRhdGVGb3JtYXQuaTE4bi5tb250aE5hbWVzW20gKyAxMl0sXG4gICAgICAgICAgeXk6ICAgU3RyaW5nKHkpLnNsaWNlKDIpLFxuICAgICAgICAgIHl5eXk6IHksXG4gICAgICAgICAgaDogICAgSCAlIDEyIHx8IDEyLFxuICAgICAgICAgIGhoOiAgIHBhZChIICUgMTIgfHwgMTIpLFxuICAgICAgICAgIEg6ICAgIEgsXG4gICAgICAgICAgSEg6ICAgcGFkKEgpLFxuICAgICAgICAgIE06ICAgIE0sXG4gICAgICAgICAgTU06ICAgcGFkKE0pLFxuICAgICAgICAgIHM6ICAgIHMsXG4gICAgICAgICAgc3M6ICAgcGFkKHMpLFxuICAgICAgICAgIGw6ICAgIHBhZChMLCAzKSxcbiAgICAgICAgICBMOiAgICBwYWQoTWF0aC5yb3VuZChMIC8gMTApKSxcbiAgICAgICAgICB0OiAgICBIIDwgMTIgPyBkYXRlRm9ybWF0LmkxOG4udGltZU5hbWVzWzBdIDogZGF0ZUZvcm1hdC5pMThuLnRpbWVOYW1lc1sxXSxcbiAgICAgICAgICB0dDogICBIIDwgMTIgPyBkYXRlRm9ybWF0LmkxOG4udGltZU5hbWVzWzJdIDogZGF0ZUZvcm1hdC5pMThuLnRpbWVOYW1lc1szXSxcbiAgICAgICAgICBUOiAgICBIIDwgMTIgPyBkYXRlRm9ybWF0LmkxOG4udGltZU5hbWVzWzRdIDogZGF0ZUZvcm1hdC5pMThuLnRpbWVOYW1lc1s1XSxcbiAgICAgICAgICBUVDogICBIIDwgMTIgPyBkYXRlRm9ybWF0LmkxOG4udGltZU5hbWVzWzZdIDogZGF0ZUZvcm1hdC5pMThuLnRpbWVOYW1lc1s3XSxcbiAgICAgICAgICBaOiAgICBnbXQgPyAnR01UJyA6IHV0YyA/ICdVVEMnIDogKFN0cmluZyhkYXRlKS5tYXRjaCh0aW1lem9uZSkgfHwgWycnXSkucG9wKCkucmVwbGFjZSh0aW1lem9uZUNsaXAsICcnKSxcbiAgICAgICAgICBvOiAgICAobyA+IDAgPyAnLScgOiAnKycpICsgcGFkKE1hdGguZmxvb3IoTWF0aC5hYnMobykgLyA2MCkgKiAxMDAgKyBNYXRoLmFicyhvKSAlIDYwLCA0KSxcbiAgICAgICAgICBTOiAgICBbJ3RoJywgJ3N0JywgJ25kJywgJ3JkJ11bZCAlIDEwID4gMyA/IDAgOiAoZCAlIDEwMCAtIGQgJSAxMCAhPSAxMCkgKiBkICUgMTBdLFxuICAgICAgICAgIFc6ICAgIFcsXG4gICAgICAgICAgTjogICAgTlxuICAgICAgICB9O1xuICBcbiAgICAgICAgcmV0dXJuIG1hc2sucmVwbGFjZSh0b2tlbiwgZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAgICAgaWYgKG1hdGNoIGluIGZsYWdzKSB7XG4gICAgICAgICAgICByZXR1cm4gZmxhZ3NbbWF0Y2hdO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbWF0Y2guc2xpY2UoMSwgbWF0Y2gubGVuZ3RoIC0gMSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSgpO1xuXG4gIGRhdGVGb3JtYXQubWFza3MgPSB7XG4gICAgJ2RlZmF1bHQnOiAgICAgICAgICAgICAgICdkZGQgbW1tIGRkIHl5eXkgSEg6TU06c3MnLFxuICAgICdzaG9ydERhdGUnOiAgICAgICAgICAgICAnbS9kL3l5JyxcbiAgICAnbWVkaXVtRGF0ZSc6ICAgICAgICAgICAgJ21tbSBkLCB5eXl5JyxcbiAgICAnbG9uZ0RhdGUnOiAgICAgICAgICAgICAgJ21tbW0gZCwgeXl5eScsXG4gICAgJ2Z1bGxEYXRlJzogICAgICAgICAgICAgICdkZGRkLCBtbW1tIGQsIHl5eXknLFxuICAgICdzaG9ydFRpbWUnOiAgICAgICAgICAgICAnaDpNTSBUVCcsXG4gICAgJ21lZGl1bVRpbWUnOiAgICAgICAgICAgICdoOk1NOnNzIFRUJyxcbiAgICAnbG9uZ1RpbWUnOiAgICAgICAgICAgICAgJ2g6TU06c3MgVFQgWicsXG4gICAgJ2lzb0RhdGUnOiAgICAgICAgICAgICAgICd5eXl5LW1tLWRkJyxcbiAgICAnaXNvVGltZSc6ICAgICAgICAgICAgICAgJ0hIOk1NOnNzJyxcbiAgICAnaXNvRGF0ZVRpbWUnOiAgICAgICAgICAgJ3l5eXktbW0tZGRcXCdUXFwnSEg6TU06c3NvJyxcbiAgICAnaXNvVXRjRGF0ZVRpbWUnOiAgICAgICAgJ1VUQzp5eXl5LW1tLWRkXFwnVFxcJ0hIOk1NOnNzXFwnWlxcJycsXG4gICAgJ2V4cGlyZXNIZWFkZXJGb3JtYXQnOiAgICdkZGQsIGRkIG1tbSB5eXl5IEhIOk1NOnNzIFonXG4gIH07XG5cbiAgLy8gSW50ZXJuYXRpb25hbGl6YXRpb24gc3RyaW5nc1xuICBkYXRlRm9ybWF0LmkxOG4gPSB7XG4gICAgZGF5TmFtZXM6IFtcbiAgICAgICdTdW4nLCAnTW9uJywgJ1R1ZScsICdXZWQnLCAnVGh1JywgJ0ZyaScsICdTYXQnLFxuICAgICAgJ1N1bmRheScsICdNb25kYXknLCAnVHVlc2RheScsICdXZWRuZXNkYXknLCAnVGh1cnNkYXknLCAnRnJpZGF5JywgJ1NhdHVyZGF5J1xuICAgIF0sXG4gICAgbW9udGhOYW1lczogW1xuICAgICAgJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJywgJ09jdCcsICdOb3YnLCAnRGVjJyxcbiAgICAgICdKYW51YXJ5JywgJ0ZlYnJ1YXJ5JywgJ01hcmNoJywgJ0FwcmlsJywgJ01heScsICdKdW5lJywgJ0p1bHknLCAnQXVndXN0JywgJ1NlcHRlbWJlcicsICdPY3RvYmVyJywgJ05vdmVtYmVyJywgJ0RlY2VtYmVyJ1xuICAgIF0sXG4gICAgdGltZU5hbWVzOiBbXG4gICAgICAnYScsICdwJywgJ2FtJywgJ3BtJywgJ0EnLCAnUCcsICdBTScsICdQTSdcbiAgICBdXG4gIH07XG5cbmZ1bmN0aW9uIHBhZCh2YWwsIGxlbikge1xuICB2YWwgPSBTdHJpbmcodmFsKTtcbiAgbGVuID0gbGVuIHx8IDI7XG4gIHdoaWxlICh2YWwubGVuZ3RoIDwgbGVuKSB7XG4gICAgdmFsID0gJzAnICsgdmFsO1xuICB9XG4gIHJldHVybiB2YWw7XG59XG5cbi8qKlxuICogR2V0IHRoZSBJU08gODYwMSB3ZWVrIG51bWJlclxuICogQmFzZWQgb24gY29tbWVudHMgZnJvbVxuICogaHR0cDovL3RlY2hibG9nLnByb2N1cmlvcy5ubC9rL242MTgvbmV3cy92aWV3LzMzNzk2LzE0ODYzL0NhbGN1bGF0ZS1JU08tODYwMS13ZWVrLWFuZC15ZWFyLWluLWphdmFzY3JpcHQuaHRtbFxuICpcbiAqIEBwYXJhbSAge09iamVjdH0gYGRhdGVgXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIGdldFdlZWsoZGF0ZSkge1xuICAvLyBSZW1vdmUgdGltZSBjb21wb25lbnRzIG9mIGRhdGVcbiAgdmFyIHRhcmdldFRodXJzZGF5ID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIGRhdGUuZ2V0RGF0ZSgpKTtcblxuICAvLyBDaGFuZ2UgZGF0ZSB0byBUaHVyc2RheSBzYW1lIHdlZWtcbiAgdGFyZ2V0VGh1cnNkYXkuc2V0RGF0ZSh0YXJnZXRUaHVyc2RheS5nZXREYXRlKCkgLSAoKHRhcmdldFRodXJzZGF5LmdldERheSgpICsgNikgJSA3KSArIDMpO1xuXG4gIC8vIFRha2UgSmFudWFyeSA0dGggYXMgaXQgaXMgYWx3YXlzIGluIHdlZWsgMSAoc2VlIElTTyA4NjAxKVxuICB2YXIgZmlyc3RUaHVyc2RheSA9IG5ldyBEYXRlKHRhcmdldFRodXJzZGF5LmdldEZ1bGxZZWFyKCksIDAsIDQpO1xuXG4gIC8vIENoYW5nZSBkYXRlIHRvIFRodXJzZGF5IHNhbWUgd2Vla1xuICBmaXJzdFRodXJzZGF5LnNldERhdGUoZmlyc3RUaHVyc2RheS5nZXREYXRlKCkgLSAoKGZpcnN0VGh1cnNkYXkuZ2V0RGF5KCkgKyA2KSAlIDcpICsgMyk7XG5cbiAgLy8gQ2hlY2sgaWYgZGF5bGlnaHQtc2F2aW5nLXRpbWUtc3dpdGNoIG9jY3VycmVkIGFuZCBjb3JyZWN0IGZvciBpdFxuICB2YXIgZHMgPSB0YXJnZXRUaHVyc2RheS5nZXRUaW1lem9uZU9mZnNldCgpIC0gZmlyc3RUaHVyc2RheS5nZXRUaW1lem9uZU9mZnNldCgpO1xuICB0YXJnZXRUaHVyc2RheS5zZXRIb3Vycyh0YXJnZXRUaHVyc2RheS5nZXRIb3VycygpIC0gZHMpO1xuXG4gIC8vIE51bWJlciBvZiB3ZWVrcyBiZXR3ZWVuIHRhcmdldCBUaHVyc2RheSBhbmQgZmlyc3QgVGh1cnNkYXlcbiAgdmFyIHdlZWtEaWZmID0gKHRhcmdldFRodXJzZGF5IC0gZmlyc3RUaHVyc2RheSkgLyAoODY0MDAwMDAqNyk7XG4gIHJldHVybiAxICsgTWF0aC5mbG9vcih3ZWVrRGlmZik7XG59XG5cbi8qKlxuICogR2V0IElTTy04NjAxIG51bWVyaWMgcmVwcmVzZW50YXRpb24gb2YgdGhlIGRheSBvZiB0aGUgd2Vla1xuICogMSAoZm9yIE1vbmRheSkgdGhyb3VnaCA3IChmb3IgU3VuZGF5KVxuICogXG4gKiBAcGFyYW0gIHtPYmplY3R9IGBkYXRlYFxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5mdW5jdGlvbiBnZXREYXlPZldlZWsoZGF0ZSkge1xuICB2YXIgZG93ID0gZGF0ZS5nZXREYXkoKTtcbiAgaWYoZG93ID09PSAwKSB7XG4gICAgZG93ID0gNztcbiAgfVxuICByZXR1cm4gZG93O1xufVxuXG4vKipcbiAqIGtpbmQtb2Ygc2hvcnRjdXRcbiAqIEBwYXJhbSAgeyp9IHZhbFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiBraW5kT2YodmFsKSB7XG4gIGlmICh2YWwgPT09IG51bGwpIHtcbiAgICByZXR1cm4gJ251bGwnO1xuICB9XG5cbiAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuICd1bmRlZmluZWQnO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB2YWwgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWw7XG4gIH1cblxuICBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XG4gICAgcmV0dXJuICdhcnJheSc7XG4gIH1cblxuICByZXR1cm4ge30udG9TdHJpbmcuY2FsbCh2YWwpXG4gICAgLnNsaWNlKDgsIC0xKS50b0xvd2VyQ2FzZSgpO1xufTtcblxuXG5cbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZShmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gZGF0ZUZvcm1hdDtcbiAgICB9KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGRhdGVGb3JtYXQ7XG4gIH0gZWxzZSB7XG4gICAgZ2xvYmFsLmRhdGVGb3JtYXQgPSBkYXRlRm9ybWF0O1xuICB9XG59KSh0aGlzKTtcbiIsIi8qIVxuICogcmVwZWF0LXN0cmluZyA8aHR0cHM6Ly9naXRodWIuY29tL2pvbnNjaGxpbmtlcnQvcmVwZWF0LXN0cmluZz5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQtMjAxNSwgSm9uIFNjaGxpbmtlcnQuXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFJlc3VsdHMgY2FjaGVcbiAqL1xuXG52YXIgcmVzID0gJyc7XG52YXIgY2FjaGU7XG5cbi8qKlxuICogRXhwb3NlIGByZXBlYXRgXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSByZXBlYXQ7XG5cbi8qKlxuICogUmVwZWF0IHRoZSBnaXZlbiBgc3RyaW5nYCB0aGUgc3BlY2lmaWVkIGBudW1iZXJgXG4gKiBvZiB0aW1lcy5cbiAqXG4gKiAqKkV4YW1wbGU6KipcbiAqXG4gKiBgYGBqc1xuICogdmFyIHJlcGVhdCA9IHJlcXVpcmUoJ3JlcGVhdC1zdHJpbmcnKTtcbiAqIHJlcGVhdCgnQScsIDUpO1xuICogLy89PiBBQUFBQVxuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGBzdHJpbmdgIFRoZSBzdHJpbmcgdG8gcmVwZWF0XG4gKiBAcGFyYW0ge051bWJlcn0gYG51bWJlcmAgVGhlIG51bWJlciBvZiB0aW1lcyB0byByZXBlYXQgdGhlIHN0cmluZ1xuICogQHJldHVybiB7U3RyaW5nfSBSZXBlYXRlZCBzdHJpbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gcmVwZWF0KHN0ciwgbnVtKSB7XG4gIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4cGVjdGVkIGEgc3RyaW5nJyk7XG4gIH1cblxuICAvLyBjb3ZlciBjb21tb24sIHF1aWNrIHVzZSBjYXNlc1xuICBpZiAobnVtID09PSAxKSByZXR1cm4gc3RyO1xuICBpZiAobnVtID09PSAyKSByZXR1cm4gc3RyICsgc3RyO1xuXG4gIHZhciBtYXggPSBzdHIubGVuZ3RoICogbnVtO1xuICBpZiAoY2FjaGUgIT09IHN0ciB8fCB0eXBlb2YgY2FjaGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgY2FjaGUgPSBzdHI7XG4gICAgcmVzID0gJyc7XG4gIH0gZWxzZSBpZiAocmVzLmxlbmd0aCA+PSBtYXgpIHtcbiAgICByZXR1cm4gcmVzLnN1YnN0cigwLCBtYXgpO1xuICB9XG5cbiAgd2hpbGUgKG1heCA+IHJlcy5sZW5ndGggJiYgbnVtID4gMSkge1xuICAgIGlmIChudW0gJiAxKSB7XG4gICAgICByZXMgKz0gc3RyO1xuICAgIH1cblxuICAgIG51bSA+Pj0gMTtcbiAgICBzdHIgKz0gc3RyO1xuICB9XG5cbiAgcmVzICs9IHN0cjtcbiAgcmVzID0gcmVzLnN1YnN0cigwLCBtYXgpO1xuICByZXR1cm4gcmVzO1xufVxuIiwiLyohXG4gKiBwYWQtbGVmdCA8aHR0cHM6Ly9naXRodWIuY29tL2pvbnNjaGxpbmtlcnQvcGFkLWxlZnQ+XG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LTIwMTUsIEpvbiBTY2hsaW5rZXJ0LlxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHJlcGVhdCA9IHJlcXVpcmUoJ3JlcGVhdC1zdHJpbmcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYWRMZWZ0KHN0ciwgbnVtLCBjaCkge1xuICBzdHIgPSBzdHIudG9TdHJpbmcoKTtcblxuICBpZiAodHlwZW9mIG51bSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gc3RyO1xuICB9XG5cbiAgaWYgKGNoID09PSAwKSB7XG4gICAgY2ggPSAnMCc7XG4gIH0gZWxzZSBpZiAoY2gpIHtcbiAgICBjaCA9IGNoLnRvU3RyaW5nKCk7XG4gIH0gZWxzZSB7XG4gICAgY2ggPSAnICc7XG4gIH1cblxuICByZXR1cm4gcmVwZWF0KGNoLCBudW0gLSBzdHIubGVuZ3RoKSArIHN0cjtcbn07XG4iLCJpbXBvcnQgZGF0ZWZvcm1hdCBmcm9tICdkYXRlZm9ybWF0JztcbmltcG9ydCBhc3NpZ24gZnJvbSAnb2JqZWN0LWFzc2lnbic7XG5pbXBvcnQgcGFkTGVmdCBmcm9tICdwYWQtbGVmdCc7XG5pbXBvcnQgeyBnZXRDbGllbnRBUEkgfSBmcm9tICcuL3V0aWwnO1xuXG5jb25zdCBub29wID0gKCkgPT4ge307XG5sZXQgbGluaztcblxuLy8gQWx0ZXJuYXRpdmUgc29sdXRpb24gZm9yIHNhdmluZyBmaWxlcyxcbi8vIGEgYml0IHNsb3dlciBhbmQgZG9lcyBub3Qgd29yayBpbiBTYWZhcmlcbi8vIGZ1bmN0aW9uIGZldGNoQmxvYkZyb21EYXRhVVJMIChkYXRhVVJMKSB7XG4vLyAgIHJldHVybiB3aW5kb3cuZmV0Y2goZGF0YVVSTCkudGhlbihyZXMgPT4gcmVzLmJsb2IoKSk7XG4vLyB9XG5cbmNvbnN0IHN1cHBvcnRlZEVuY29kaW5ncyA9IFtcbiAgJ2ltYWdlL3BuZycsXG4gICdpbWFnZS9qcGVnJyxcbiAgJ2ltYWdlL3dlYnAnXG5dO1xuXG5leHBvcnQgZnVuY3Rpb24gZXhwb3J0Q2FudmFzIChjYW52YXMsIG9wdCA9IHt9KSB7XG4gIGNvbnN0IGVuY29kaW5nID0gb3B0LmVuY29kaW5nIHx8ICdpbWFnZS9wbmcnO1xuICBpZiAoIXN1cHBvcnRlZEVuY29kaW5ncy5pbmNsdWRlcyhlbmNvZGluZykpIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBjYW52YXMgZW5jb2RpbmcgJHtlbmNvZGluZ31gKTtcbiAgbGV0IGV4dGVuc2lvbiA9IChlbmNvZGluZy5zcGxpdCgnLycpWzFdIHx8ICcnKS5yZXBsYWNlKC9qcGVnL2ksICdqcGcnKTtcbiAgaWYgKGV4dGVuc2lvbikgZXh0ZW5zaW9uID0gYC4ke2V4dGVuc2lvbn1gLnRvTG93ZXJDYXNlKCk7XG4gIHJldHVybiB7XG4gICAgZXh0ZW5zaW9uLFxuICAgIHR5cGU6IGVuY29kaW5nLFxuICAgIGRhdGFVUkw6IGNhbnZhcy50b0RhdGFVUkwoZW5jb2RpbmcsIG9wdC5lbmNvZGluZ1F1YWxpdHkpXG4gIH07XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUJsb2JGcm9tRGF0YVVSTCAoZGF0YVVSTCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBjb25zdCBzcGxpdEluZGV4ID0gZGF0YVVSTC5pbmRleE9mKCcsJyk7XG4gICAgaWYgKHNwbGl0SW5kZXggPT09IC0xKSB7XG4gICAgICByZXNvbHZlKG5ldyB3aW5kb3cuQmxvYigpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgYmFzZTY0ID0gZGF0YVVSTC5zbGljZShzcGxpdEluZGV4ICsgMSk7XG4gICAgY29uc3QgYnl0ZVN0cmluZyA9IHdpbmRvdy5hdG9iKGJhc2U2NCk7XG4gICAgY29uc3QgbWltZU1hdGNoID0gL2RhdGE6KFteOytdKTsvLmV4ZWMoZGF0YVVSTCk7XG4gICAgY29uc3QgbWltZSA9IChtaW1lTWF0Y2ggPyBtaW1lTWF0Y2hbMV0gOiAnJykgfHwgdW5kZWZpbmVkO1xuICAgIGNvbnN0IGFiID0gbmV3IEFycmF5QnVmZmVyKGJ5dGVTdHJpbmcubGVuZ3RoKTtcbiAgICBjb25zdCBpYSA9IG5ldyBVaW50OEFycmF5KGFiKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVTdHJpbmcubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlhW2ldID0gYnl0ZVN0cmluZy5jaGFyQ29kZUF0KGkpO1xuICAgIH1cbiAgICByZXNvbHZlKG5ldyB3aW5kb3cuQmxvYihbIGFiIF0sIHsgdHlwZTogbWltZSB9KSk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2F2ZURhdGFVUkwgKGRhdGFVUkwsIG9wdHMgPSB7fSkge1xuICByZXR1cm4gY3JlYXRlQmxvYkZyb21EYXRhVVJMKGRhdGFVUkwpXG4gICAgLnRoZW4oYmxvYiA9PiBzYXZlQmxvYihibG9iLCBvcHRzKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzYXZlQmxvYiAoYmxvYiwgb3B0cyA9IHt9KSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICBvcHRzID0gYXNzaWduKHsgZXh0ZW5zaW9uOiAnJywgcHJlZml4OiAnJywgc3VmZml4OiAnJyB9LCBvcHRzKTtcbiAgICBjb25zdCBmaWxlbmFtZSA9IHJlc29sdmVGaWxlbmFtZShvcHRzKTtcblxuICAgIGNvbnN0IGNsaWVudCA9IGdldENsaWVudEFQSSgpO1xuICAgIGlmIChjbGllbnQgJiYgdHlwZW9mIGNsaWVudC5zYXZlQmxvYiA9PT0gJ2Z1bmN0aW9uJyAmJiBjbGllbnQub3V0cHV0KSB7XG4gICAgICAvLyBuYXRpdmUgc2F2aW5nIHVzaW5nIGEgQ0xJIHRvb2xcbiAgICAgIHJldHVybiBjbGllbnQuc2F2ZUJsb2IoYmxvYiwgYXNzaWduKHt9LCBvcHRzLCB7IGZpbGVuYW1lIH0pKVxuICAgICAgICAudGhlbihldiA9PiByZXNvbHZlKGV2KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGZvcmNlIGRvd25sb2FkXG4gICAgICBpZiAoIWxpbmspIHtcbiAgICAgICAgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgbGluay5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gICAgICAgIGxpbmsudGFyZ2V0ID0gJ19ibGFuayc7XG4gICAgICB9XG4gICAgICBsaW5rLmRvd25sb2FkID0gZmlsZW5hbWU7XG4gICAgICBsaW5rLmhyZWYgPSB3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobGluayk7XG4gICAgICBsaW5rLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGxpbmsub25jbGljayA9IG5vb3A7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHdpbmRvdy5VUkwucmV2b2tlT2JqZWN0VVJMKGJsb2IpO1xuICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQobGluayk7XG4gICAgICAgICAgbGluay5yZW1vdmVBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgICAgICAgICByZXNvbHZlKHsgZmlsZW5hbWUsIGNsaWVudDogZmFsc2UgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICAgIGxpbmsuY2xpY2soKTtcbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2F2ZUZpbGUgKGRhdGEsIG9wdHMgPSB7fSkge1xuICBjb25zdCBwYXJ0cyA9IEFycmF5LmlzQXJyYXkoZGF0YSkgPyBkYXRhIDogWyBkYXRhIF07XG4gIGNvbnN0IGJsb2IgPSBuZXcgd2luZG93LkJsb2IocGFydHMsIHsgdHlwZTogb3B0cy50eXBlIHx8ICcnIH0pO1xuICByZXR1cm4gc2F2ZUJsb2IoYmxvYiwgb3B0cyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRGaWxlTmFtZSAoKSB7XG4gIGNvbnN0IGRhdGVGb3JtYXRTdHIgPSBgeXl5eS5tbS5kZC1ISC5NTS5zc2A7XG4gIHJldHVybiBkYXRlZm9ybWF0KG5ldyBEYXRlKCksIGRhdGVGb3JtYXRTdHIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVmYXVsdEZpbGUgKHByZWZpeCA9ICcnLCBzdWZmaXggPSAnJywgZXh0KSB7XG4gIC8vIGNvbnN0IGRhdGVGb3JtYXRTdHIgPSBgeXl5eS5tbS5kZC1ISC5NTS5zc2A7XG4gIGNvbnN0IGRhdGVGb3JtYXRTdHIgPSBgeXl5eS1tbS1kZCAnYXQnIGguTU0uc3MgVFRgO1xuICByZXR1cm4gYCR7cHJlZml4fSR7ZGF0ZWZvcm1hdChuZXcgRGF0ZSgpLCBkYXRlRm9ybWF0U3RyKX0ke3N1ZmZpeH0ke2V4dH1gO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlRmlsZW5hbWUgKG9wdCA9IHt9KSB7XG4gIG9wdCA9IGFzc2lnbih7fSwgb3B0KTtcblxuICAvLyBDdXN0b20gZmlsZW5hbWUgZnVuY3Rpb25cbiAgaWYgKHR5cGVvZiBvcHQuZmlsZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBvcHQuZmlsZShvcHQpO1xuICB9IGVsc2UgaWYgKG9wdC5maWxlKSB7XG4gICAgcmV0dXJuIG9wdC5maWxlO1xuICB9XG5cbiAgbGV0IGZyYW1lID0gbnVsbDtcbiAgbGV0IGV4dGVuc2lvbiA9ICcnO1xuICBpZiAodHlwZW9mIG9wdC5leHRlbnNpb24gPT09ICdzdHJpbmcnKSBleHRlbnNpb24gPSBvcHQuZXh0ZW5zaW9uO1xuXG4gIGlmICh0eXBlb2Ygb3B0LmZyYW1lID09PSAnbnVtYmVyJykge1xuICAgIGxldCB0b3RhbEZyYW1lcztcbiAgICBpZiAodHlwZW9mIG9wdC50b3RhbEZyYW1lcyA9PT0gJ251bWJlcicpIHtcbiAgICAgIHRvdGFsRnJhbWVzID0gb3B0LnRvdGFsRnJhbWVzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0b3RhbEZyYW1lcyA9IE1hdGgubWF4KDEwMDAsIG9wdC5mcmFtZSk7XG4gICAgfVxuICAgIGZyYW1lID0gcGFkTGVmdChTdHJpbmcob3B0LmZyYW1lKSwgU3RyaW5nKHRvdGFsRnJhbWVzKS5sZW5ndGgsICcwJyk7XG4gIH1cblxuICBjb25zdCBsYXllclN0ciA9IGlzRmluaXRlKG9wdC50b3RhbExheWVycykgJiYgaXNGaW5pdGUob3B0LmxheWVyKSAmJiBvcHQudG90YWxMYXllcnMgPiAxID8gYCR7b3B0LmxheWVyfWAgOiAnJztcbiAgaWYgKGZyYW1lICE9IG51bGwpIHtcbiAgICByZXR1cm4gWyBsYXllclN0ciwgZnJhbWUgXS5maWx0ZXIoQm9vbGVhbikuam9pbignLScpICsgZXh0ZW5zaW9uO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGRlZmF1bHRGaWxlTmFtZSA9IG9wdC50aW1lU3RhbXA7XG4gICAgcmV0dXJuIFsgb3B0LnByZWZpeCwgb3B0Lm5hbWUgfHwgZGVmYXVsdEZpbGVOYW1lLCBsYXllclN0ciwgb3B0Lmhhc2gsIG9wdC5zdWZmaXggXS5maWx0ZXIoQm9vbGVhbikuam9pbignLScpICsgZXh0ZW5zaW9uO1xuICB9XG59XG4iLCIvLyBIYW5kbGUgc29tZSBjb21tb24gdHlwb3NcbmNvbnN0IGNvbW1vblR5cG9zID0ge1xuICBkaW1lbnNpb246ICdkaW1lbnNpb25zJyxcbiAgYW5pbWF0ZWQ6ICdhbmltYXRlJyxcbiAgYW5pbWF0aW5nOiAnYW5pbWF0ZScsXG4gIHVuaXQ6ICd1bml0cycsXG4gIFA1OiAncDUnLFxuICBwaXhlbGxhdGVkOiAncGl4ZWxhdGVkJyxcbiAgbG9vcGluZzogJ2xvb3AnLFxuICBwaXhlbFBlckluY2g6ICdwaXhlbHMnXG59O1xuXG4vLyBIYW5kbGUgYWxsIG90aGVyIHR5cG9zXG5jb25zdCBhbGxLZXlzID0gW1xuICAnZGltZW5zaW9ucycsICd1bml0cycsICdwaXhlbHNQZXJJbmNoJywgJ29yaWVudGF0aW9uJyxcbiAgJ3NjYWxlVG9GaXQnLCAnc2NhbGVUb1ZpZXcnLCAnYmxlZWQnLCAncGl4ZWxSYXRpbycsXG4gICdleHBvcnRQaXhlbFJhdGlvJywgJ21heFBpeGVsUmF0aW8nLCAnc2NhbGVDb250ZXh0JyxcbiAgJ3Jlc2l6ZUNhbnZhcycsICdzdHlsZUNhbnZhcycsICdjYW52YXMnLCAnY29udGV4dCcsICdhdHRyaWJ1dGVzJyxcbiAgJ3BhcmVudCcsICdmaWxlJywgJ25hbWUnLCAncHJlZml4JywgJ3N1ZmZpeCcsICdhbmltYXRlJywgJ3BsYXlpbmcnLFxuICAnbG9vcCcsICdkdXJhdGlvbicsICd0b3RhbEZyYW1lcycsICdmcHMnLCAncGxheWJhY2tSYXRlJywgJ3RpbWVTY2FsZScsXG4gICdmcmFtZScsICd0aW1lJywgJ2ZsdXNoJywgJ3BpeGVsYXRlZCcsICdob3RrZXlzJywgJ3A1JywgJ2lkJyxcbiAgJ3NjYWxlVG9GaXRQYWRkaW5nJywgJ2RhdGEnLCAncGFyYW1zJywgJ2VuY29kaW5nJywgJ2VuY29kaW5nUXVhbGl0eSdcbl07XG5cbi8vIFRoaXMgaXMgZmFpcmx5IG9waW5pb25hdGVkIGFuZCBmb3JjZXMgdXNlcnMgdG8gdXNlIHRoZSAnZGF0YScgcGFyYW1ldGVyXG4vLyBpZiB0aGV5IHdhbnQgdG8gcGFzcyBhbG9uZyBub24tc2V0dGluZyBvYmplY3RzLi4uXG5leHBvcnQgY29uc3QgY2hlY2tTZXR0aW5ncyA9IChzZXR0aW5ncykgPT4ge1xuICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoc2V0dGluZ3MpO1xuICBrZXlzLmZvckVhY2goa2V5ID0+IHtcbiAgICBpZiAoa2V5IGluIGNvbW1vblR5cG9zKSB7XG4gICAgICBjb25zdCBhY3R1YWwgPSBjb21tb25UeXBvc1trZXldO1xuICAgICAgY29uc29sZS53YXJuKGBbY2FudmFzLXNrZXRjaF0gQ291bGQgbm90IHJlY29nbml6ZSB0aGUgc2V0dGluZyBcIiR7a2V5fVwiLCBkaWQgeW91IG1lYW4gXCIke2FjdHVhbH1cIj9gKTtcbiAgICB9IGVsc2UgaWYgKCFhbGxLZXlzLmluY2x1ZGVzKGtleSkpIHtcbiAgICAgIGNvbnNvbGUud2FybihgW2NhbnZhcy1za2V0Y2hdIENvdWxkIG5vdCByZWNvZ25pemUgdGhlIHNldHRpbmcgXCIke2tleX1cImApO1xuICAgIH1cbiAgfSk7XG59O1xuIiwiaW1wb3J0IHsgZ2V0Q2xpZW50QVBJIH0gZnJvbSAnLi4vdXRpbCc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChvcHQgPSB7fSkge1xuICBjb25zdCBoYW5kbGVyID0gZXYgPT4ge1xuICAgIGlmICghb3B0LmVuYWJsZWQoKSkgcmV0dXJuO1xuXG4gICAgY29uc3QgY2xpZW50ID0gZ2V0Q2xpZW50QVBJKCk7XG4gICAgaWYgKGV2LmtleUNvZGUgPT09IDgzICYmICFldi5hbHRLZXkgJiYgKGV2Lm1ldGFLZXkgfHwgZXYuY3RybEtleSkpIHtcbiAgICAgIC8vIENtZCArIFNcbiAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBvcHQuc2F2ZShldik7XG4gICAgfSBlbHNlIGlmIChldi5rZXlDb2RlID09PSAzMikge1xuICAgICAgLy8gU3BhY2VcbiAgICAgIC8vIFRPRE86IHdoYXQgdG8gZG8gd2l0aCB0aGlzPyBrZWVwIGl0LCBvciByZW1vdmUgaXQ/XG4gICAgICBvcHQudG9nZ2xlUGxheShldik7XG4gICAgfSBlbHNlIGlmIChjbGllbnQgJiYgIWV2LmFsdEtleSAmJiBldi5rZXlDb2RlID09PSA3NSAmJiAoZXYubWV0YUtleSB8fCBldi5jdHJsS2V5KSkge1xuICAgICAgLy8gQ21kICsgSywgb25seSB3aGVuIGNhbnZhcy1za2V0Y2gtY2xpIGlzIHVzZWRcbiAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBvcHQuY29tbWl0KGV2KTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgYXR0YWNoID0gKCkgPT4ge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgaGFuZGxlcik7XG4gIH07XG5cbiAgY29uc3QgZGV0YWNoID0gKCkgPT4ge1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgaGFuZGxlcik7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBhdHRhY2gsXG4gICAgZGV0YWNoXG4gIH07XG59XG4iLCJjb25zdCBkZWZhdWx0VW5pdHMgPSAnbW0nO1xuXG5jb25zdCBkYXRhID0gW1xuICAvLyBDb21tb24gUGFwZXIgU2l6ZXNcbiAgLy8gKE1vc3RseSBOb3J0aC1BbWVyaWNhbiBiYXNlZClcbiAgWyAncG9zdGNhcmQnLCAxMDEuNiwgMTUyLjQgXSxcbiAgWyAncG9zdGVyLXNtYWxsJywgMjgwLCA0MzAgXSxcbiAgWyAncG9zdGVyJywgNDYwLCA2MTAgXSxcbiAgWyAncG9zdGVyLWxhcmdlJywgNjEwLCA5MTAgXSxcbiAgWyAnYnVzaW5lc3MtY2FyZCcsIDUwLjgsIDg4LjkgXSxcblxuICAvLyBQaG90b2dyYXBoaWMgUHJpbnQgUGFwZXIgU2l6ZXNcbiAgWyAnMnInLCA2NCwgODkgXSxcbiAgWyAnM3InLCA4OSwgMTI3IF0sXG4gIFsgJzRyJywgMTAyLCAxNTIgXSxcbiAgWyAnNXInLCAxMjcsIDE3OCBdLCAvLyA14oCzeDfigLNcbiAgWyAnNnInLCAxNTIsIDIwMyBdLCAvLyA24oCzeDjigLNcbiAgWyAnOHInLCAyMDMsIDI1NCBdLCAvLyA44oCzeDEw4oCzXG4gIFsgJzEwcicsIDI1NCwgMzA1IF0sIC8vIDEw4oCzeDEy4oCzXG4gIFsgJzExcicsIDI3OSwgMzU2IF0sIC8vIDEx4oCzeDE04oCzXG4gIFsgJzEycicsIDMwNSwgMzgxIF0sXG5cbiAgLy8gU3RhbmRhcmQgUGFwZXIgU2l6ZXNcbiAgWyAnYTAnLCA4NDEsIDExODkgXSxcbiAgWyAnYTEnLCA1OTQsIDg0MSBdLFxuICBbICdhMicsIDQyMCwgNTk0IF0sXG4gIFsgJ2EzJywgMjk3LCA0MjAgXSxcbiAgWyAnYTQnLCAyMTAsIDI5NyBdLFxuICBbICdhNScsIDE0OCwgMjEwIF0sXG4gIFsgJ2E2JywgMTA1LCAxNDggXSxcbiAgWyAnYTcnLCA3NCwgMTA1IF0sXG4gIFsgJ2E4JywgNTIsIDc0IF0sXG4gIFsgJ2E5JywgMzcsIDUyIF0sXG4gIFsgJ2ExMCcsIDI2LCAzNyBdLFxuICBbICcyYTAnLCAxMTg5LCAxNjgyIF0sXG4gIFsgJzRhMCcsIDE2ODIsIDIzNzggXSxcbiAgWyAnYjAnLCAxMDAwLCAxNDE0IF0sXG4gIFsgJ2IxJywgNzA3LCAxMDAwIF0sXG4gIFsgJ2IxKycsIDcyMCwgMTAyMCBdLFxuICBbICdiMicsIDUwMCwgNzA3IF0sXG4gIFsgJ2IyKycsIDUyMCwgNzIwIF0sXG4gIFsgJ2IzJywgMzUzLCA1MDAgXSxcbiAgWyAnYjQnLCAyNTAsIDM1MyBdLFxuICBbICdiNScsIDE3NiwgMjUwIF0sXG4gIFsgJ2I2JywgMTI1LCAxNzYgXSxcbiAgWyAnYjcnLCA4OCwgMTI1IF0sXG4gIFsgJ2I4JywgNjIsIDg4IF0sXG4gIFsgJ2I5JywgNDQsIDYyIF0sXG4gIFsgJ2IxMCcsIDMxLCA0NCBdLFxuICBbICdiMTEnLCAyMiwgMzIgXSxcbiAgWyAnYjEyJywgMTYsIDIyIF0sXG4gIFsgJ2MwJywgOTE3LCAxMjk3IF0sXG4gIFsgJ2MxJywgNjQ4LCA5MTcgXSxcbiAgWyAnYzInLCA0NTgsIDY0OCBdLFxuICBbICdjMycsIDMyNCwgNDU4IF0sXG4gIFsgJ2M0JywgMjI5LCAzMjQgXSxcbiAgWyAnYzUnLCAxNjIsIDIyOSBdLFxuICBbICdjNicsIDExNCwgMTYyIF0sXG4gIFsgJ2M3JywgODEsIDExNCBdLFxuICBbICdjOCcsIDU3LCA4MSBdLFxuICBbICdjOScsIDQwLCA1NyBdLFxuICBbICdjMTAnLCAyOCwgNDAgXSxcbiAgWyAnYzExJywgMjIsIDMyIF0sXG4gIFsgJ2MxMicsIDE2LCAyMiBdLFxuXG4gIC8vIFVzZSBpbmNoZXMgZm9yIE5vcnRoIEFtZXJpY2FuIHNpemVzLFxuICAvLyBhcyBpdCBwcm9kdWNlcyBsZXNzIGZsb2F0IHByZWNpc2lvbiBlcnJvcnNcbiAgWyAnaGFsZi1sZXR0ZXInLCA1LjUsIDguNSwgJ2luJyBdLFxuICBbICdsZXR0ZXInLCA4LjUsIDExLCAnaW4nIF0sXG4gIFsgJ2xlZ2FsJywgOC41LCAxNCwgJ2luJyBdLFxuICBbICdqdW5pb3ItbGVnYWwnLCA1LCA4LCAnaW4nIF0sXG4gIFsgJ2xlZGdlcicsIDExLCAxNywgJ2luJyBdLFxuICBbICd0YWJsb2lkJywgMTEsIDE3LCAnaW4nIF0sXG4gIFsgJ2Fuc2ktYScsIDguNSwgMTEuMCwgJ2luJyBdLFxuICBbICdhbnNpLWInLCAxMS4wLCAxNy4wLCAnaW4nIF0sXG4gIFsgJ2Fuc2ktYycsIDE3LjAsIDIyLjAsICdpbicgXSxcbiAgWyAnYW5zaS1kJywgMjIuMCwgMzQuMCwgJ2luJyBdLFxuICBbICdhbnNpLWUnLCAzNC4wLCA0NC4wLCAnaW4nIF0sXG4gIFsgJ2FyY2gtYScsIDksIDEyLCAnaW4nIF0sXG4gIFsgJ2FyY2gtYicsIDEyLCAxOCwgJ2luJyBdLFxuICBbICdhcmNoLWMnLCAxOCwgMjQsICdpbicgXSxcbiAgWyAnYXJjaC1kJywgMjQsIDM2LCAnaW4nIF0sXG4gIFsgJ2FyY2gtZScsIDM2LCA0OCwgJ2luJyBdLFxuICBbICdhcmNoLWUxJywgMzAsIDQyLCAnaW4nIF0sXG4gIFsgJ2FyY2gtZTInLCAyNiwgMzgsICdpbicgXSxcbiAgWyAnYXJjaC1lMycsIDI3LCAzOSwgJ2luJyBdXG5dO1xuXG5leHBvcnQgZGVmYXVsdCBkYXRhLnJlZHVjZSgoZGljdCwgcHJlc2V0KSA9PiB7XG4gIGNvbnN0IGl0ZW0gPSB7XG4gICAgdW5pdHM6IHByZXNldFszXSB8fCBkZWZhdWx0VW5pdHMsXG4gICAgZGltZW5zaW9uczogWyBwcmVzZXRbMV0sIHByZXNldFsyXSBdXG4gIH07XG4gIGRpY3RbcHJlc2V0WzBdXSA9IGl0ZW07XG4gIGRpY3RbcHJlc2V0WzBdLnJlcGxhY2UoLy0vZywgJyAnKV0gPSBpdGVtO1xuICByZXR1cm4gZGljdDtcbn0sIHt9KTtcbiIsImltcG9ydCBwYXBlclNpemVzIGZyb20gJy4vcGFwZXItc2l6ZXMnO1xuaW1wb3J0IGNvbnZlcnRMZW5ndGggZnJvbSAnY29udmVydC1sZW5ndGgnO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGltZW5zaW9uc0Zyb21QcmVzZXQgKGRpbWVuc2lvbnMsIHVuaXRzVG8gPSAncHgnLCBwaXhlbHNQZXJJbmNoID0gNzIpIHtcbiAgaWYgKHR5cGVvZiBkaW1lbnNpb25zID09PSAnc3RyaW5nJykge1xuICAgIGNvbnN0IGtleSA9IGRpbWVuc2lvbnMudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAoIShrZXkgaW4gcGFwZXJTaXplcykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIGRpbWVuc2lvbiBwcmVzZXQgXCIke2RpbWVuc2lvbnN9XCIgaXMgbm90IHN1cHBvcnRlZCBvciBjb3VsZCBub3QgYmUgZm91bmQ7IHRyeSB1c2luZyBhNCwgYTMsIHBvc3RjYXJkLCBsZXR0ZXIsIGV0Yy5gKVxuICAgIH1cbiAgICBjb25zdCBwcmVzZXQgPSBwYXBlclNpemVzW2tleV07XG4gICAgcmV0dXJuIHByZXNldC5kaW1lbnNpb25zLm1hcChkID0+IHtcbiAgICAgIHJldHVybiBjb252ZXJ0RGlzdGFuY2UoZCwgcHJlc2V0LnVuaXRzLCB1bml0c1RvLCBwaXhlbHNQZXJJbmNoKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZGltZW5zaW9ucztcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29udmVydERpc3RhbmNlIChkaW1lbnNpb24sIHVuaXRzRnJvbSA9ICdweCcsIHVuaXRzVG8gPSAncHgnLCBwaXhlbHNQZXJJbmNoID0gNzIpIHtcbiAgcmV0dXJuIGNvbnZlcnRMZW5ndGgoZGltZW5zaW9uLCB1bml0c0Zyb20sIHVuaXRzVG8sIHtcbiAgICBwaXhlbHNQZXJJbmNoLFxuICAgIHByZWNpc2lvbjogNCxcbiAgICByb3VuZFBpeGVsOiB0cnVlXG4gIH0pO1xufVxuIiwiaW1wb3J0IGRlZmluZWQgZnJvbSAnZGVmaW5lZCc7XG5pbXBvcnQgeyBnZXREaW1lbnNpb25zRnJvbVByZXNldCwgY29udmVydERpc3RhbmNlIH0gZnJvbSAnLi4vZGlzdGFuY2VzJztcbmltcG9ydCB7IGlzQnJvd3NlciB9IGZyb20gJy4uL3V0aWwnO1xuXG5mdW5jdGlvbiBjaGVja0lmSGFzRGltZW5zaW9ucyAoc2V0dGluZ3MpIHtcbiAgaWYgKCFzZXR0aW5ncy5kaW1lbnNpb25zKSByZXR1cm4gZmFsc2U7XG4gIGlmICh0eXBlb2Ygc2V0dGluZ3MuZGltZW5zaW9ucyA9PT0gJ3N0cmluZycpIHJldHVybiB0cnVlO1xuICBpZiAoQXJyYXkuaXNBcnJheShzZXR0aW5ncy5kaW1lbnNpb25zKSAmJiBzZXR0aW5ncy5kaW1lbnNpb25zLmxlbmd0aCA+PSAyKSByZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBnZXRQYXJlbnRTaXplIChwcm9wcywgc2V0dGluZ3MpIHtcbiAgLy8gV2hlbiBubyB7IGRpbWVuc2lvbiB9IGlzIHBhc3NlZCBpbiBub2RlLCB3ZSBkZWZhdWx0IHRvIEhUTUwgY2FudmFzIHNpemVcbiAgaWYgKCFpc0Jyb3dzZXIoKSkge1xuICAgIHJldHVybiBbIDMwMCwgMTUwIF07XG4gIH1cblxuICBsZXQgZWxlbWVudCA9IHNldHRpbmdzLnBhcmVudCB8fCB3aW5kb3c7XG5cbiAgaWYgKGVsZW1lbnQgPT09IHdpbmRvdyB8fFxuICAgICAgZWxlbWVudCA9PT0gZG9jdW1lbnQgfHxcbiAgICAgIGVsZW1lbnQgPT09IGRvY3VtZW50LmJvZHkpIHtcbiAgICByZXR1cm4gWyB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0IF07XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHJldHVybiBbIHdpZHRoLCBoZWlnaHQgXTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZXNpemVDYW52YXMgKHByb3BzLCBzZXR0aW5ncykge1xuICBsZXQgd2lkdGgsIGhlaWdodDtcbiAgbGV0IHN0eWxlV2lkdGgsIHN0eWxlSGVpZ2h0O1xuICBsZXQgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodDtcblxuICBjb25zdCBicm93c2VyID0gaXNCcm93c2VyKCk7XG4gIGNvbnN0IGRpbWVuc2lvbnMgPSBzZXR0aW5ncy5kaW1lbnNpb25zO1xuICBjb25zdCBoYXNEaW1lbnNpb25zID0gY2hlY2tJZkhhc0RpbWVuc2lvbnMoc2V0dGluZ3MpO1xuICBjb25zdCBleHBvcnRpbmcgPSBwcm9wcy5leHBvcnRpbmc7XG4gIGxldCBzY2FsZVRvRml0ID0gaGFzRGltZW5zaW9ucyA/IHNldHRpbmdzLnNjYWxlVG9GaXQgIT09IGZhbHNlIDogZmFsc2U7XG4gIGxldCBzY2FsZVRvVmlldyA9ICghZXhwb3J0aW5nICYmIGhhc0RpbWVuc2lvbnMpID8gc2V0dGluZ3Muc2NhbGVUb1ZpZXcgOiB0cnVlO1xuICAvLyBpbiBub2RlLCBjYW5jZWwgYm90aCBvZiB0aGVzZSBvcHRpb25zXG4gIGlmICghYnJvd3Nlcikgc2NhbGVUb0ZpdCA9IHNjYWxlVG9WaWV3ID0gZmFsc2U7XG4gIGNvbnN0IHVuaXRzID0gc2V0dGluZ3MudW5pdHM7XG4gIGNvbnN0IHBpeGVsc1BlckluY2ggPSAodHlwZW9mIHNldHRpbmdzLnBpeGVsc1BlckluY2ggPT09ICdudW1iZXInICYmIGlzRmluaXRlKHNldHRpbmdzLnBpeGVsc1BlckluY2gpKSA/IHNldHRpbmdzLnBpeGVsc1BlckluY2ggOiA3MjtcbiAgY29uc3QgYmxlZWQgPSBkZWZpbmVkKHNldHRpbmdzLmJsZWVkLCAwKTtcblxuICBjb25zdCBkZXZpY2VQaXhlbFJhdGlvID0gYnJvd3NlciA/IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIDogMTtcbiAgY29uc3QgYmFzZVBpeGVsUmF0aW8gPSBzY2FsZVRvVmlldyA/IGRldmljZVBpeGVsUmF0aW8gOiAxO1xuXG4gIGxldCBwaXhlbFJhdGlvLCBleHBvcnRQaXhlbFJhdGlvO1xuXG4gIC8vIElmIGEgcGl4ZWwgcmF0aW8gaXMgc3BlY2lmaWVkLCB3ZSB3aWxsIHVzZSBpdC5cbiAgLy8gT3RoZXJ3aXNlOlxuICAvLyAgLT4gSWYgZGltZW5zaW9uIGlzIHNwZWNpZmllZCwgdXNlIGJhc2UgcmF0aW8gKGkuZS4gc2l6ZSBmb3IgZXhwb3J0KVxuICAvLyAgLT4gSWYgbm8gZGltZW5zaW9uIGlzIHNwZWNpZmllZCwgdXNlIGRldmljZSByYXRpbyAoaS5lLiBzaXplIGZvciBzY3JlZW4pXG4gIGlmICh0eXBlb2Ygc2V0dGluZ3MucGl4ZWxSYXRpbyA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoc2V0dGluZ3MucGl4ZWxSYXRpbykpIHtcbiAgICAvLyBXaGVuIHsgcGl4ZWxSYXRpbyB9IGlzIHNwZWNpZmllZCwgaXQncyBhbHNvIHVzZWQgYXMgZGVmYXVsdCBleHBvcnRQaXhlbFJhdGlvLlxuICAgIHBpeGVsUmF0aW8gPSBzZXR0aW5ncy5waXhlbFJhdGlvO1xuICAgIGV4cG9ydFBpeGVsUmF0aW8gPSBkZWZpbmVkKHNldHRpbmdzLmV4cG9ydFBpeGVsUmF0aW8sIHBpeGVsUmF0aW8pO1xuICB9IGVsc2Uge1xuICAgIGlmIChoYXNEaW1lbnNpb25zKSB7XG4gICAgICAvLyBXaGVuIGEgZGltZW5zaW9uIGlzIHNwZWNpZmllZCwgdXNlIHRoZSBiYXNlIHJhdGlvIHJhdGhlciB0aGFuIHNjcmVlbiByYXRpb1xuICAgICAgcGl4ZWxSYXRpbyA9IGJhc2VQaXhlbFJhdGlvO1xuICAgICAgLy8gRGVmYXVsdCB0byBhIHBpeGVsIHJhdGlvIG9mIDEgc28gdGhhdCB5b3UgZW5kIHVwIHdpdGggdGhlIHNhbWUgZGltZW5zaW9uXG4gICAgICAvLyB5b3Ugc3BlY2lmaWVkLCBpLmUuIFsgNTAwLCA1MDAgXSBpcyBleHBvcnRlZCBhcyA1MDB4NTAwIHB4XG4gICAgICBleHBvcnRQaXhlbFJhdGlvID0gZGVmaW5lZChzZXR0aW5ncy5leHBvcnRQaXhlbFJhdGlvLCAxKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTm8gZGltZW5zaW9uIGlzIHNwZWNpZmllZCwgYXNzdW1lIGZ1bGwtc2NyZWVuIHNpemluZ1xuICAgICAgcGl4ZWxSYXRpbyA9IGRldmljZVBpeGVsUmF0aW87XG4gICAgICAvLyBEZWZhdWx0IHRvIHNjcmVlbiBwaXhlbCByYXRpbywgc28gdGhhdCBpdCdzIGxpa2UgdGFraW5nIGEgZGV2aWNlIHNjcmVlbnNob3RcbiAgICAgIGV4cG9ydFBpeGVsUmF0aW8gPSBkZWZpbmVkKHNldHRpbmdzLmV4cG9ydFBpeGVsUmF0aW8sIHBpeGVsUmF0aW8pO1xuICAgIH1cbiAgfVxuXG4gIC8vIENsYW1wIHBpeGVsIHJhdGlvXG4gIGlmICh0eXBlb2Ygc2V0dGluZ3MubWF4UGl4ZWxSYXRpbyA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoc2V0dGluZ3MubWF4UGl4ZWxSYXRpbykpIHtcbiAgICBwaXhlbFJhdGlvID0gTWF0aC5taW4oc2V0dGluZ3MubWF4UGl4ZWxSYXRpbywgcGl4ZWxSYXRpbyk7XG4gICAgZXhwb3J0UGl4ZWxSYXRpbyA9IE1hdGgubWluKHNldHRpbmdzLm1heFBpeGVsUmF0aW8sIGV4cG9ydFBpeGVsUmF0aW8pO1xuICB9XG5cbiAgLy8gSGFuZGxlIGV4cG9ydCBwaXhlbCByYXRpb1xuICBpZiAoZXhwb3J0aW5nKSB7XG4gICAgcGl4ZWxSYXRpbyA9IGV4cG9ydFBpeGVsUmF0aW87XG4gIH1cblxuICAvLyBwYXJlbnRXaWR0aCA9IHR5cGVvZiBwYXJlbnRXaWR0aCA9PT0gJ3VuZGVmaW5lZCcgPyBkZWZhdWx0Tm9kZVNpemVbMF0gOiBwYXJlbnRXaWR0aDtcbiAgLy8gcGFyZW50SGVpZ2h0ID0gdHlwZW9mIHBhcmVudEhlaWdodCA9PT0gJ3VuZGVmaW5lZCcgPyBkZWZhdWx0Tm9kZVNpemVbMV0gOiBwYXJlbnRIZWlnaHQ7XG5cbiAgbGV0IFsgcGFyZW50V2lkdGgsIHBhcmVudEhlaWdodCBdID0gZ2V0UGFyZW50U2l6ZShwcm9wcywgc2V0dGluZ3MpO1xuICBsZXQgdHJpbVdpZHRoLCB0cmltSGVpZ2h0O1xuXG4gIC8vIFlvdSBjYW4gc3BlY2lmeSBhIGRpbWVuc2lvbnMgaW4gcGl4ZWxzIG9yIGNtL20vaW4vZXRjXG4gIGlmIChoYXNEaW1lbnNpb25zKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gZ2V0RGltZW5zaW9uc0Zyb21QcmVzZXQoZGltZW5zaW9ucywgdW5pdHMsIHBpeGVsc1BlckluY2gpO1xuICAgIGNvbnN0IGhpZ2hlc3QgPSBNYXRoLm1heChyZXN1bHRbMF0sIHJlc3VsdFsxXSk7XG4gICAgY29uc3QgbG93ZXN0ID0gTWF0aC5taW4ocmVzdWx0WzBdLCByZXN1bHRbMV0pO1xuICAgIGlmIChzZXR0aW5ncy5vcmllbnRhdGlvbikge1xuICAgICAgY29uc3QgbGFuZHNjYXBlID0gc2V0dGluZ3Mub3JpZW50YXRpb24gPT09ICdsYW5kc2NhcGUnO1xuICAgICAgd2lkdGggPSBsYW5kc2NhcGUgPyBoaWdoZXN0IDogbG93ZXN0O1xuICAgICAgaGVpZ2h0ID0gbGFuZHNjYXBlID8gbG93ZXN0IDogaGlnaGVzdDtcbiAgICB9IGVsc2Uge1xuICAgICAgd2lkdGggPSByZXN1bHRbMF07XG4gICAgICBoZWlnaHQgPSByZXN1bHRbMV07XG4gICAgfVxuXG4gICAgdHJpbVdpZHRoID0gd2lkdGg7XG4gICAgdHJpbUhlaWdodCA9IGhlaWdodDtcblxuICAgIC8vIEFwcGx5IGJsZWVkIHdoaWNoIGlzIGFzc3VtZWQgdG8gYmUgaW4gdGhlIHNhbWUgdW5pdHNcbiAgICB3aWR0aCArPSBibGVlZCAqIDI7XG4gICAgaGVpZ2h0ICs9IGJsZWVkICogMjtcbiAgfSBlbHNlIHtcbiAgICB3aWR0aCA9IHBhcmVudFdpZHRoO1xuICAgIGhlaWdodCA9IHBhcmVudEhlaWdodDtcbiAgICB0cmltV2lkdGggPSB3aWR0aDtcbiAgICB0cmltSGVpZ2h0ID0gaGVpZ2h0O1xuICB9XG5cbiAgLy8gUmVhbCBzaXplIGluIHBpeGVscyBhZnRlciBQUEkgaXMgdGFrZW4gaW50byBhY2NvdW50XG4gIGxldCByZWFsV2lkdGggPSB3aWR0aDtcbiAgbGV0IHJlYWxIZWlnaHQgPSBoZWlnaHQ7XG4gIGlmIChoYXNEaW1lbnNpb25zICYmIHVuaXRzKSB7XG4gICAgLy8gQ29udmVydCB0byBkaWdpdGFsL3BpeGVsIHVuaXRzIGlmIG5lY2Vzc2FyeVxuICAgIHJlYWxXaWR0aCA9IGNvbnZlcnREaXN0YW5jZSh3aWR0aCwgdW5pdHMsICdweCcsIHBpeGVsc1BlckluY2gpO1xuICAgIHJlYWxIZWlnaHQgPSBjb252ZXJ0RGlzdGFuY2UoaGVpZ2h0LCB1bml0cywgJ3B4JywgcGl4ZWxzUGVySW5jaCk7XG4gIH1cblxuICAvLyBIb3cgYmlnIHRvIHNldCB0aGUgJ3ZpZXcnIG9mIHRoZSBjYW52YXMgaW4gdGhlIGJyb3dzZXIgKGkuZS4gc3R5bGUpXG4gIHN0eWxlV2lkdGggPSBNYXRoLnJvdW5kKHJlYWxXaWR0aCk7XG4gIHN0eWxlSGVpZ2h0ID0gTWF0aC5yb3VuZChyZWFsSGVpZ2h0KTtcblxuICAvLyBJZiB3ZSB3aXNoIHRvIHNjYWxlIHRoZSB2aWV3IHRvIHRoZSBicm93c2VyIHdpbmRvd1xuICBpZiAoc2NhbGVUb0ZpdCAmJiAhZXhwb3J0aW5nICYmIGhhc0RpbWVuc2lvbnMpIHtcbiAgICBjb25zdCBhc3BlY3QgPSB3aWR0aCAvIGhlaWdodDtcbiAgICBjb25zdCB3aW5kb3dBc3BlY3QgPSBwYXJlbnRXaWR0aCAvIHBhcmVudEhlaWdodDtcbiAgICBjb25zdCBzY2FsZVRvRml0UGFkZGluZyA9IGRlZmluZWQoc2V0dGluZ3Muc2NhbGVUb0ZpdFBhZGRpbmcsIDQwKTtcbiAgICBjb25zdCBtYXhXaWR0aCA9IE1hdGgucm91bmQocGFyZW50V2lkdGggLSBzY2FsZVRvRml0UGFkZGluZyAqIDIpO1xuICAgIGNvbnN0IG1heEhlaWdodCA9IE1hdGgucm91bmQocGFyZW50SGVpZ2h0IC0gc2NhbGVUb0ZpdFBhZGRpbmcgKiAyKTtcbiAgICBpZiAoc3R5bGVXaWR0aCA+IG1heFdpZHRoIHx8IHN0eWxlSGVpZ2h0ID4gbWF4SGVpZ2h0KSB7XG4gICAgICBpZiAod2luZG93QXNwZWN0ID4gYXNwZWN0KSB7XG4gICAgICAgIHN0eWxlSGVpZ2h0ID0gbWF4SGVpZ2h0O1xuICAgICAgICBzdHlsZVdpZHRoID0gTWF0aC5yb3VuZChzdHlsZUhlaWdodCAqIGFzcGVjdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHlsZVdpZHRoID0gbWF4V2lkdGg7XG4gICAgICAgIHN0eWxlSGVpZ2h0ID0gTWF0aC5yb3VuZChzdHlsZVdpZHRoIC8gYXNwZWN0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjYW52YXNXaWR0aCA9IHNjYWxlVG9WaWV3ID8gTWF0aC5yb3VuZChwaXhlbFJhdGlvICogc3R5bGVXaWR0aCkgOiBNYXRoLnJvdW5kKHBpeGVsUmF0aW8gKiByZWFsV2lkdGgpO1xuICBjYW52YXNIZWlnaHQgPSBzY2FsZVRvVmlldyA/IE1hdGgucm91bmQocGl4ZWxSYXRpbyAqIHN0eWxlSGVpZ2h0KSA6IE1hdGgucm91bmQocGl4ZWxSYXRpbyAqIHJlYWxIZWlnaHQpO1xuXG4gIGNvbnN0IHZpZXdwb3J0V2lkdGggPSBzY2FsZVRvVmlldyA/IE1hdGgucm91bmQoc3R5bGVXaWR0aCkgOiBNYXRoLnJvdW5kKHJlYWxXaWR0aCk7XG4gIGNvbnN0IHZpZXdwb3J0SGVpZ2h0ID0gc2NhbGVUb1ZpZXcgPyBNYXRoLnJvdW5kKHN0eWxlSGVpZ2h0KSA6IE1hdGgucm91bmQocmVhbEhlaWdodCk7XG5cbiAgY29uc3Qgc2NhbGVYID0gY2FudmFzV2lkdGggLyB3aWR0aDtcbiAgY29uc3Qgc2NhbGVZID0gY2FudmFzSGVpZ2h0IC8gaGVpZ2h0O1xuXG4gIC8vIEFzc2lnbiB0byBjdXJyZW50IHByb3BzXG4gIHJldHVybiB7XG4gICAgYmxlZWQsXG4gICAgcGl4ZWxSYXRpbyxcbiAgICB3aWR0aCxcbiAgICBoZWlnaHQsXG4gICAgZGltZW5zaW9uczogWyB3aWR0aCwgaGVpZ2h0IF0sXG4gICAgdW5pdHM6IHVuaXRzIHx8ICdweCcsXG4gICAgc2NhbGVYLFxuICAgIHNjYWxlWSxcbiAgICB2aWV3cG9ydFdpZHRoLFxuICAgIHZpZXdwb3J0SGVpZ2h0LFxuICAgIGNhbnZhc1dpZHRoLFxuICAgIGNhbnZhc0hlaWdodCxcbiAgICB0cmltV2lkdGgsXG4gICAgdHJpbUhlaWdodCxcbiAgICBzdHlsZVdpZHRoLFxuICAgIHN0eWxlSGVpZ2h0XG4gIH07XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGdldENhbnZhc0NvbnRleHRcbmZ1bmN0aW9uIGdldENhbnZhc0NvbnRleHQgKHR5cGUsIG9wdHMpIHtcbiAgaWYgKHR5cGVvZiB0eXBlICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ211c3Qgc3BlY2lmeSB0eXBlIHN0cmluZycpXG4gIH1cblxuICBvcHRzID0gb3B0cyB8fCB7fVxuXG4gIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnICYmICFvcHRzLmNhbnZhcykge1xuICAgIHJldHVybiBudWxsIC8vIGNoZWNrIGZvciBOb2RlXG4gIH1cblxuICB2YXIgY2FudmFzID0gb3B0cy5jYW52YXMgfHwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcbiAgaWYgKHR5cGVvZiBvcHRzLndpZHRoID09PSAnbnVtYmVyJykge1xuICAgIGNhbnZhcy53aWR0aCA9IG9wdHMud2lkdGhcbiAgfVxuICBpZiAodHlwZW9mIG9wdHMuaGVpZ2h0ID09PSAnbnVtYmVyJykge1xuICAgIGNhbnZhcy5oZWlnaHQgPSBvcHRzLmhlaWdodFxuICB9XG5cbiAgdmFyIGF0dHJpYnMgPSBvcHRzXG4gIHZhciBnbFxuICB0cnkge1xuICAgIHZhciBuYW1lcyA9IFsgdHlwZSBdXG4gICAgLy8gcHJlZml4IEdMIGNvbnRleHRzXG4gICAgaWYgKHR5cGUuaW5kZXhPZignd2ViZ2wnKSA9PT0gMCkge1xuICAgICAgbmFtZXMucHVzaCgnZXhwZXJpbWVudGFsLScgKyB0eXBlKVxuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGdsID0gY2FudmFzLmdldENvbnRleHQobmFtZXNbaV0sIGF0dHJpYnMpXG4gICAgICBpZiAoZ2wpIHJldHVybiBnbFxuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIGdsID0gbnVsbFxuICB9XG4gIHJldHVybiAoZ2wgfHwgbnVsbCkgLy8gZW5zdXJlIG51bGwgb24gZmFpbFxufVxuIiwiaW1wb3J0IGFzc2lnbiBmcm9tICdvYmplY3QtYXNzaWduJztcbmltcG9ydCBnZXRDYW52YXNDb250ZXh0IGZyb20gJ2dldC1jYW52YXMtY29udGV4dCc7XG5pbXBvcnQgeyBpc0Jyb3dzZXIgfSBmcm9tICcuLi91dGlsJztcblxuZnVuY3Rpb24gY3JlYXRlQ2FudmFzRWxlbWVudCAoKSB7XG4gIGlmICghaXNCcm93c2VyKCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0l0IGFwcGVhcnMgeW91IGFyZSBydW5pbmcgZnJvbSBOb2RlLmpzIG9yIGEgbm9uLWJyb3dzZXIgZW52aXJvbm1lbnQuIFRyeSBwYXNzaW5nIGluIGFuIGV4aXN0aW5nIHsgY2FudmFzIH0gaW50ZXJmYWNlIGluc3RlYWQuJyk7XG4gIH1cbiAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVDYW52YXMgKHNldHRpbmdzID0ge30pIHtcbiAgbGV0IGNvbnRleHQsIGNhbnZhcztcbiAgbGV0IG93bnNDYW52YXMgPSBmYWxzZTtcbiAgaWYgKHNldHRpbmdzLmNhbnZhcyAhPT0gZmFsc2UpIHtcbiAgICAvLyBEZXRlcm1pbmUgdGhlIGNhbnZhcyBhbmQgY29udGV4dCB0byBjcmVhdGVcbiAgICBjb250ZXh0ID0gc2V0dGluZ3MuY29udGV4dDtcbiAgICBpZiAoIWNvbnRleHQgfHwgdHlwZW9mIGNvbnRleHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBsZXQgbmV3Q2FudmFzID0gc2V0dGluZ3MuY2FudmFzO1xuICAgICAgaWYgKCFuZXdDYW52YXMpIHtcbiAgICAgICAgbmV3Q2FudmFzID0gY3JlYXRlQ2FudmFzRWxlbWVudCgpO1xuICAgICAgICBvd25zQ2FudmFzID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHR5cGUgPSBjb250ZXh0IHx8ICcyZCc7XG4gICAgICBpZiAodHlwZW9mIG5ld0NhbnZhcy5nZXRDb250ZXh0ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIHNwZWNpZmllZCB7IGNhbnZhcyB9IGVsZW1lbnQgZG9lcyBub3QgaGF2ZSBhIGdldENvbnRleHQoKSBmdW5jdGlvbiwgbWF5YmUgaXQgaXMgbm90IGEgPGNhbnZhcz4gdGFnP2ApO1xuICAgICAgfVxuICAgICAgY29udGV4dCA9IGdldENhbnZhc0NvbnRleHQodHlwZSwgYXNzaWduKHt9LCBzZXR0aW5ncy5hdHRyaWJ1dGVzLCB7IGNhbnZhczogbmV3Q2FudmFzIH0pKTtcbiAgICAgIGlmICghY29udGV4dCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCBhdCBjYW52YXMuZ2V0Q29udGV4dCgnJHt0eXBlfScpIC0gdGhlIGJyb3dzZXIgbWF5IG5vdCBzdXBwb3J0IHRoaXMgY29udGV4dCwgb3IgYSBkaWZmZXJlbnQgY29udGV4dCBtYXkgYWxyZWFkeSBiZSBpbiB1c2Ugd2l0aCB0aGlzIGNhbnZhcy5gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjYW52YXMgPSBjb250ZXh0LmNhbnZhcztcbiAgICAvLyBFbnN1cmUgY29udGV4dCBtYXRjaGVzIHVzZXIncyBjYW52YXMgZXhwZWN0YXRpb25zXG4gICAgaWYgKHNldHRpbmdzLmNhbnZhcyAmJiBjYW52YXMgIT09IHNldHRpbmdzLmNhbnZhcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgeyBjYW52YXMgfSBhbmQgeyBjb250ZXh0IH0gc2V0dGluZ3MgbXVzdCBwb2ludCB0byB0aGUgc2FtZSB1bmRlcmx5aW5nIGNhbnZhcyBlbGVtZW50Jyk7XG4gICAgfVxuXG4gICAgLy8gQXBwbHkgcGl4ZWxhdGlvbiB0byBjYW52YXMgaWYgbmVjZXNzYXJ5LCB0aGlzIGlzIG1vc3RseSBhIGNvbnZlbmllbmNlIHV0aWxpdHlcbiAgICBpZiAoc2V0dGluZ3MucGl4ZWxhdGVkKSB7XG4gICAgICBjb250ZXh0LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuICAgICAgY29udGV4dC5tb3pJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICAgIGNvbnRleHQub0ltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuICAgICAgY29udGV4dC53ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICAgIGNvbnRleHQubXNJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICAgIGNhbnZhcy5zdHlsZVsnaW1hZ2UtcmVuZGVyaW5nJ10gPSAncGl4ZWxhdGVkJztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHsgY2FudmFzLCBjb250ZXh0LCBvd25zQ2FudmFzIH07XG59XG4iLCJpbXBvcnQgZGVmaW5lZCBmcm9tICdkZWZpbmVkJztcbmltcG9ydCBhc3NpZ24gZnJvbSAnb2JqZWN0LWFzc2lnbic7XG5pbXBvcnQgcmlnaHROb3cgZnJvbSAncmlnaHQtbm93JztcbmltcG9ydCBpc1Byb21pc2UgZnJvbSAnaXMtcHJvbWlzZSc7XG5pbXBvcnQgeyBpc0Jyb3dzZXIsIGlzV2ViR0xDb250ZXh0LCBpc0NhbnZhcywgZ2V0Q2xpZW50QVBJIH0gZnJvbSAnLi4vdXRpbCc7XG5pbXBvcnQgZGVlcEVxdWFsIGZyb20gJ2RlZXAtZXF1YWwnO1xuaW1wb3J0IHsgc2F2ZUZpbGUsIHNhdmVEYXRhVVJMLCBnZXRGaWxlTmFtZSwgZXhwb3J0Q2FudmFzIH0gZnJvbSAnLi4vc2F2ZSc7XG5pbXBvcnQgeyBjaGVja1NldHRpbmdzIH0gZnJvbSAnLi4vYWNjZXNzaWJpbGl0eSc7XG5cbmltcG9ydCBrZXlib2FyZFNob3J0Y3V0cyBmcm9tICcuL2tleWJvYXJkU2hvcnRjdXRzJztcbmltcG9ydCByZXNpemVDYW52YXMgZnJvbSAnLi9yZXNpemVDYW52YXMnO1xuaW1wb3J0IGNyZWF0ZUNhbnZhcyBmcm9tICcuL2NyZWF0ZUNhbnZhcyc7XG5cbmNsYXNzIFNrZXRjaE1hbmFnZXIge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgdGhpcy5fc2V0dGluZ3MgPSB7fTtcbiAgICB0aGlzLl9wcm9wcyA9IHt9O1xuICAgIHRoaXMuX3NrZXRjaCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9yYWYgPSBudWxsO1xuXG4gICAgLy8gU29tZSBoYWNreSB0aGluZ3MgcmVxdWlyZWQgdG8gZ2V0IGFyb3VuZCBwNS5qcyBzdHJ1Y3R1cmVcbiAgICB0aGlzLl9sYXN0UmVkcmF3UmVzdWx0ID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX2lzUDVSZXNpemluZyA9IGZhbHNlO1xuXG4gICAgdGhpcy5fa2V5Ym9hcmRTaG9ydGN1dHMgPSBrZXlib2FyZFNob3J0Y3V0cyh7XG4gICAgICBlbmFibGVkOiAoKSA9PiB0aGlzLnNldHRpbmdzLmhvdGtleXMgIT09IGZhbHNlLFxuICAgICAgc2F2ZTogKGV2KSA9PiB7XG4gICAgICAgIGlmIChldi5zaGlmdEtleSkge1xuICAgICAgICAgIGlmICh0aGlzLnByb3BzLnJlY29yZGluZykge1xuICAgICAgICAgICAgdGhpcy5lbmRSZWNvcmQoKTtcbiAgICAgICAgICAgIHRoaXMucnVuKCk7XG4gICAgICAgICAgfSBlbHNlIHRoaXMucmVjb3JkKCk7XG4gICAgICAgIH0gZWxzZSB0aGlzLmV4cG9ydEZyYW1lKCk7XG4gICAgICB9LFxuICAgICAgdG9nZ2xlUGxheTogKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5wbGF5aW5nKSB0aGlzLnBhdXNlKCk7XG4gICAgICAgIGVsc2UgdGhpcy5wbGF5KCk7XG4gICAgICB9LFxuICAgICAgY29tbWl0OiAoZXYpID0+IHtcbiAgICAgICAgdGhpcy5leHBvcnRGcmFtZSh7IGNvbW1pdDogdHJ1ZSB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuX2FuaW1hdGVIYW5kbGVyID0gKCkgPT4gdGhpcy5hbmltYXRlKCk7XG5cbiAgICB0aGlzLl9yZXNpemVIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgY29uc3QgY2hhbmdlZCA9IHRoaXMucmVzaXplKCk7XG4gICAgICAvLyBPbmx5IHJlLXJlbmRlciB3aGVuIHNpemUgYWN0dWFsbHkgY2hhbmdlc1xuICAgICAgaWYgKGNoYW5nZWQpIHtcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZ2V0IHNrZXRjaCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NrZXRjaDtcbiAgfVxuXG4gIGdldCBzZXR0aW5ncyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICB9XG5cbiAgZ2V0IHByb3BzICgpIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvcHM7XG4gIH1cblxuICBfY29tcHV0ZVBsYXloZWFkIChjdXJyZW50VGltZSwgZHVyYXRpb24pIHtcbiAgICBjb25zdCBoYXNEdXJhdGlvbiA9IHR5cGVvZiBkdXJhdGlvbiA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoZHVyYXRpb24pO1xuICAgIHJldHVybiBoYXNEdXJhdGlvbiA/IGN1cnJlbnRUaW1lIC8gZHVyYXRpb24gOiAwO1xuICB9XG5cbiAgX2NvbXB1dGVGcmFtZSAocGxheWhlYWQsIHRpbWUsIHRvdGFsRnJhbWVzLCBmcHMpIHtcbiAgICByZXR1cm4gKGlzRmluaXRlKHRvdGFsRnJhbWVzKSAmJiB0b3RhbEZyYW1lcyA+IDEpXG4gICAgICA/IE1hdGguZmxvb3IocGxheWhlYWQgKiAodG90YWxGcmFtZXMgLSAxKSlcbiAgICAgIDogTWF0aC5mbG9vcihmcHMgKiB0aW1lKTtcbiAgfVxuXG4gIF9jb21wdXRlQ3VycmVudEZyYW1lICgpIHtcbiAgICByZXR1cm4gdGhpcy5fY29tcHV0ZUZyYW1lKFxuICAgICAgdGhpcy5wcm9wcy5wbGF5aGVhZCwgdGhpcy5wcm9wcy50aW1lLFxuICAgICAgdGhpcy5wcm9wcy50b3RhbEZyYW1lcywgdGhpcy5wcm9wcy5mcHNcbiAgICApO1xuICB9XG5cbiAgX2dldFNpemVQcm9wcyAoKSB7XG4gICAgY29uc3QgcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiB7XG4gICAgICB3aWR0aDogcHJvcHMud2lkdGgsXG4gICAgICBoZWlnaHQ6IHByb3BzLmhlaWdodCxcbiAgICAgIHBpeGVsUmF0aW86IHByb3BzLnBpeGVsUmF0aW8sXG4gICAgICBjYW52YXNXaWR0aDogcHJvcHMuY2FudmFzV2lkdGgsXG4gICAgICBjYW52YXNIZWlnaHQ6IHByb3BzLmNhbnZhc0hlaWdodCxcbiAgICAgIHZpZXdwb3J0V2lkdGg6IHByb3BzLnZpZXdwb3J0V2lkdGgsXG4gICAgICB2aWV3cG9ydEhlaWdodDogcHJvcHMudmlld3BvcnRIZWlnaHRcbiAgICB9O1xuICB9XG5cbiAgcnVuICgpIHtcbiAgICBpZiAoIXRoaXMuc2tldGNoKSB0aHJvdyBuZXcgRXJyb3IoJ3Nob3VsZCB3YWl0IHVudGlsIHNrZXRjaCBpcyBsb2FkZWQgYmVmb3JlIHRyeWluZyB0byBwbGF5KCknKTtcblxuICAgIC8vIFN0YXJ0IGFuIGFuaW1hdGlvbiBmcmFtZSBsb29wIGlmIG5lY2Vzc2FyeVxuICAgIGlmICh0aGlzLnNldHRpbmdzLnBsYXlpbmcgIT09IGZhbHNlKSB7XG4gICAgICB0aGlzLnBsYXkoKTtcbiAgICB9XG5cbiAgICAvLyBMZXQncyBsZXQgdGhpcyB3YXJuaW5nIGhhbmcgYXJvdW5kIGZvciBhIGZldyB2ZXJzaW9ucy4uLlxuICAgIGlmICh0eXBlb2YgdGhpcy5za2V0Y2guZGlzcG9zZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc29sZS53YXJuKCdJbiBjYW52YXMtc2tldGNoQDAuMC4yMyB0aGUgZGlzcG9zZSgpIGV2ZW50IGhhcyBiZWVuIHJlbmFtZWQgdG8gdW5sb2FkKCknKTtcbiAgICB9XG5cbiAgICAvLyBJbiBjYXNlIHdlIGFyZW4ndCBwbGF5aW5nIG9yIGFuaW1hdGVkLCBtYWtlIHN1cmUgd2Ugc3RpbGwgdHJpZ2dlciBiZWdpbiBtZXNzYWdlLi4uXG4gICAgaWYgKCF0aGlzLnByb3BzLnN0YXJ0ZWQpIHtcbiAgICAgIHRoaXMuX3NpZ25hbEJlZ2luKCk7XG4gICAgICB0aGlzLnByb3BzLnN0YXJ0ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIFJlbmRlciBhbiBpbml0aWFsIGZyYW1lXG4gICAgdGhpcy50aWNrKCk7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHBsYXkgKCkge1xuICAgIGxldCBhbmltYXRlID0gdGhpcy5zZXR0aW5ncy5hbmltYXRlO1xuICAgIGlmICgnYW5pbWF0aW9uJyBpbiB0aGlzLnNldHRpbmdzKSB7XG4gICAgICBhbmltYXRlID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUud2FybignW2NhbnZhcy1za2V0Y2hdIHsgYW5pbWF0aW9uIH0gaGFzIGJlZW4gcmVuYW1lZCB0byB7IGFuaW1hdGUgfScpO1xuICAgIH1cbiAgICBpZiAoIWFuaW1hdGUpIHJldHVybjtcbiAgICBpZiAoIWlzQnJvd3NlcigpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbY2FudmFzLXNrZXRjaF0gV0FSTjogVXNpbmcgeyBhbmltYXRlIH0gaW4gTm9kZS5qcyBpcyBub3QgeWV0IHN1cHBvcnRlZCcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5wcm9wcy5wbGF5aW5nKSByZXR1cm47XG4gICAgaWYgKCF0aGlzLnByb3BzLnN0YXJ0ZWQpIHtcbiAgICAgIHRoaXMuX3NpZ25hbEJlZ2luKCk7XG4gICAgICB0aGlzLnByb3BzLnN0YXJ0ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIGNvbnNvbGUubG9nKCdwbGF5JywgdGhpcy5wcm9wcy50aW1lKVxuXG4gICAgLy8gU3RhcnQgYSByZW5kZXIgbG9vcFxuICAgIHRoaXMucHJvcHMucGxheWluZyA9IHRydWU7XG4gICAgaWYgKHRoaXMuX3JhZiAhPSBudWxsKSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fcmFmKTtcbiAgICB0aGlzLl9sYXN0VGltZSA9IHJpZ2h0Tm93KCk7XG4gICAgdGhpcy5fcmFmID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLl9hbmltYXRlSGFuZGxlcik7XG4gIH1cblxuICBwYXVzZSAoKSB7XG4gICAgaWYgKHRoaXMucHJvcHMucmVjb3JkaW5nKSB0aGlzLmVuZFJlY29yZCgpO1xuICAgIHRoaXMucHJvcHMucGxheWluZyA9IGZhbHNlO1xuXG4gICAgaWYgKHRoaXMuX3JhZiAhPSBudWxsICYmIGlzQnJvd3NlcigpKSB7XG4gICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fcmFmKTtcbiAgICB9XG4gIH1cblxuICB0b2dnbGVQbGF5ICgpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5wbGF5aW5nKSB0aGlzLnBhdXNlKCk7XG4gICAgZWxzZSB0aGlzLnBsYXkoKTtcbiAgfVxuXG4gIC8vIFN0b3AgYW5kIHJlc2V0IHRvIGZyYW1lIHplcm9cbiAgc3RvcCAoKSB7XG4gICAgdGhpcy5wYXVzZSgpO1xuICAgIHRoaXMucHJvcHMuZnJhbWUgPSAwO1xuICAgIHRoaXMucHJvcHMucGxheWhlYWQgPSAwO1xuICAgIHRoaXMucHJvcHMudGltZSA9IDA7XG4gICAgdGhpcy5wcm9wcy5kZWx0YVRpbWUgPSAwO1xuICAgIHRoaXMucHJvcHMuc3RhcnRlZCA9IGZhbHNlO1xuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICByZWNvcmQgKCkge1xuICAgIGlmICh0aGlzLnByb3BzLnJlY29yZGluZykgcmV0dXJuO1xuICAgIGlmICghaXNCcm93c2VyKCkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tjYW52YXMtc2tldGNoXSBXQVJOOiBSZWNvcmRpbmcgZnJvbSBOb2RlLmpzIGlzIG5vdCB5ZXQgc3VwcG9ydGVkJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zdG9wKCk7XG4gICAgdGhpcy5wcm9wcy5wbGF5aW5nID0gdHJ1ZTtcbiAgICB0aGlzLnByb3BzLnJlY29yZGluZyA9IHRydWU7XG5cbiAgICBjb25zdCBmcmFtZUludGVydmFsID0gMSAvIHRoaXMucHJvcHMuZnBzO1xuICAgIC8vIFJlbmRlciBlYWNoIGZyYW1lIGluIHRoZSBzZXF1ZW5jZVxuICAgIGlmICh0aGlzLl9yYWYgIT0gbnVsbCkgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX3JhZik7XG4gICAgY29uc3QgdGljayA9ICgpID0+IHtcbiAgICAgIGlmICghdGhpcy5wcm9wcy5yZWNvcmRpbmcpIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgIHRoaXMucHJvcHMuZGVsdGFUaW1lID0gZnJhbWVJbnRlcnZhbDtcbiAgICAgIHRoaXMudGljaygpO1xuICAgICAgcmV0dXJuIHRoaXMuZXhwb3J0RnJhbWUoeyBzZXF1ZW5jZTogdHJ1ZSB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgaWYgKCF0aGlzLnByb3BzLnJlY29yZGluZykgcmV0dXJuOyAvLyB3YXMgY2FuY2VsbGVkIGJlZm9yZVxuICAgICAgICAgIHRoaXMucHJvcHMuZGVsdGFUaW1lID0gMDtcbiAgICAgICAgICB0aGlzLnByb3BzLmZyYW1lKys7XG4gICAgICAgICAgaWYgKHRoaXMucHJvcHMuZnJhbWUgPCB0aGlzLnByb3BzLnRvdGFsRnJhbWVzKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLnRpbWUgKz0gZnJhbWVJbnRlcnZhbDtcbiAgICAgICAgICAgIHRoaXMucHJvcHMucGxheWhlYWQgPSB0aGlzLl9jb21wdXRlUGxheWhlYWQodGhpcy5wcm9wcy50aW1lLCB0aGlzLnByb3BzLmR1cmF0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuX3JhZiA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGljayk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdGaW5pc2hlZCByZWNvcmRpbmcnKTtcbiAgICAgICAgICAgIHRoaXMuX3NpZ25hbEVuZCgpO1xuICAgICAgICAgICAgdGhpcy5lbmRSZWNvcmQoKTtcbiAgICAgICAgICAgIHRoaXMuc3RvcCgpO1xuICAgICAgICAgICAgdGhpcy5ydW4oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBUcmlnZ2VyIGEgc3RhcnQgZXZlbnQgYmVmb3JlIHdlIGJlZ2luIHJlY29yZGluZ1xuICAgIGlmICghdGhpcy5wcm9wcy5zdGFydGVkKSB7XG4gICAgICB0aGlzLl9zaWduYWxCZWdpbigpO1xuICAgICAgdGhpcy5wcm9wcy5zdGFydGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0aGlzLl9yYWYgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRpY2spO1xuICB9XG5cbiAgX3NpZ25hbEJlZ2luICgpIHtcbiAgICBpZiAodGhpcy5za2V0Y2ggJiYgdHlwZW9mIHRoaXMuc2tldGNoLmJlZ2luID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLl93cmFwQ29udGV4dFNjYWxlKHByb3BzID0+IHRoaXMuc2tldGNoLmJlZ2luKHByb3BzKSk7XG4gICAgfVxuICB9XG5cbiAgX3NpZ25hbEVuZCAoKSB7XG4gICAgaWYgKHRoaXMuc2tldGNoICYmIHR5cGVvZiB0aGlzLnNrZXRjaC5lbmQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuX3dyYXBDb250ZXh0U2NhbGUocHJvcHMgPT4gdGhpcy5za2V0Y2guZW5kKHByb3BzKSk7XG4gICAgfVxuICB9XG5cbiAgZW5kUmVjb3JkICgpIHtcbiAgICBpZiAodGhpcy5fcmFmICE9IG51bGwgJiYgaXNCcm93c2VyKCkpIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9yYWYpO1xuICAgIHRoaXMucHJvcHMucmVjb3JkaW5nID0gZmFsc2U7XG4gICAgdGhpcy5wcm9wcy5kZWx0YVRpbWUgPSAwO1xuICAgIHRoaXMucHJvcHMucGxheWluZyA9IGZhbHNlO1xuICB9XG5cbiAgZXhwb3J0RnJhbWUgKG9wdCA9IHt9KSB7XG4gICAgaWYgKCF0aGlzLnNrZXRjaCkgcmV0dXJuIFByb21pc2UuYWxsKFtdKTtcbiAgICBpZiAodHlwZW9mIHRoaXMuc2tldGNoLnByZUV4cG9ydCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5za2V0Y2gucHJlRXhwb3J0KCk7XG4gICAgfVxuXG4gICAgLy8gT3B0aW9ucyBmb3IgZXhwb3J0IGZ1bmN0aW9uXG4gICAgbGV0IGV4cG9ydE9wdHMgPSBhc3NpZ24oe1xuICAgICAgc2VxdWVuY2U6IG9wdC5zZXF1ZW5jZSxcbiAgICAgIGZyYW1lOiBvcHQuc2VxdWVuY2UgPyB0aGlzLnByb3BzLmZyYW1lIDogdW5kZWZpbmVkLFxuICAgICAgZmlsZTogdGhpcy5zZXR0aW5ncy5maWxlLFxuICAgICAgbmFtZTogdGhpcy5zZXR0aW5ncy5uYW1lLFxuICAgICAgcHJlZml4OiB0aGlzLnNldHRpbmdzLnByZWZpeCxcbiAgICAgIHN1ZmZpeDogdGhpcy5zZXR0aW5ncy5zdWZmaXgsXG4gICAgICBlbmNvZGluZzogdGhpcy5zZXR0aW5ncy5lbmNvZGluZyxcbiAgICAgIGVuY29kaW5nUXVhbGl0eTogdGhpcy5zZXR0aW5ncy5lbmNvZGluZ1F1YWxpdHksXG4gICAgICB0aW1lU3RhbXA6IGdldEZpbGVOYW1lKCksXG4gICAgICB0b3RhbEZyYW1lczogaXNGaW5pdGUodGhpcy5wcm9wcy50b3RhbEZyYW1lcykgPyBNYXRoLm1heCgxMDAsIHRoaXMucHJvcHMudG90YWxGcmFtZXMpIDogMTAwMFxuICAgIH0pO1xuXG4gICAgY29uc3QgY2xpZW50ID0gZ2V0Q2xpZW50QVBJKCk7XG4gICAgbGV0IHAgPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICBpZiAoY2xpZW50ICYmIG9wdC5jb21taXQgJiYgdHlwZW9mIGNsaWVudC5jb21taXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnN0IGNvbW1pdE9wdHMgPSBhc3NpZ24oe30sIGV4cG9ydE9wdHMpO1xuICAgICAgY29uc3QgaGFzaCA9IGNsaWVudC5jb21taXQoY29tbWl0T3B0cyk7XG4gICAgICBpZiAoaXNQcm9taXNlKGhhc2gpKSBwID0gaGFzaDtcbiAgICAgIGVsc2UgcCA9IFByb21pc2UucmVzb2x2ZShoYXNoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcC50aGVuKGhhc2ggPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuX2RvRXhwb3J0RnJhbWUoYXNzaWduKHt9LCBleHBvcnRPcHRzLCB7IGhhc2g6IGhhc2ggfHwgJycgfSkpO1xuICAgIH0pO1xuICB9XG5cbiAgX2RvRXhwb3J0RnJhbWUgKGV4cG9ydE9wdHMgPSB7fSkge1xuICAgIHRoaXMuX3Byb3BzLmV4cG9ydGluZyA9IHRydWU7XG5cbiAgICAvLyBSZXNpemUgdG8gb3V0cHV0IHJlc29sdXRpb25cbiAgICB0aGlzLnJlc2l6ZSgpO1xuXG4gICAgLy8gRHJhdyBhdCB0aGlzIG91dHB1dCByZXNvbHV0aW9uXG4gICAgbGV0IGRyYXdSZXN1bHQgPSB0aGlzLnJlbmRlcigpO1xuXG4gICAgLy8gVGhlIHNlbGYgb3duZWQgY2FudmFzIChtYXkgYmUgdW5kZWZpbmVkLi4uISlcbiAgICBjb25zdCBjYW52YXMgPSB0aGlzLnByb3BzLmNhbnZhcztcblxuICAgIC8vIEdldCBsaXN0IG9mIHJlc3VsdHMgZnJvbSByZW5kZXJcbiAgICBpZiAodHlwZW9mIGRyYXdSZXN1bHQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBkcmF3UmVzdWx0ID0gWyBjYW52YXMgXTtcbiAgICB9XG4gICAgZHJhd1Jlc3VsdCA9IFtdLmNvbmNhdChkcmF3UmVzdWx0KS5maWx0ZXIoQm9vbGVhbik7XG5cbiAgICAvLyBUcmFuc2Zvcm0gdGhlIGNhbnZhcy9maWxlIGRlc2NyaXB0b3JzIGludG8gYSBjb25zaXN0ZW50IGZvcm1hdCxcbiAgICAvLyBhbmQgcHVsbCBvdXQgYW55IGRhdGEgVVJMcyBmcm9tIGNhbnZhcyBlbGVtZW50c1xuICAgIGRyYXdSZXN1bHQgPSBkcmF3UmVzdWx0Lm1hcChyZXN1bHQgPT4ge1xuICAgICAgY29uc3QgaGFzRGF0YU9iamVjdCA9IHR5cGVvZiByZXN1bHQgPT09ICdvYmplY3QnICYmIHJlc3VsdCAmJiAoJ2RhdGEnIGluIHJlc3VsdCB8fCAnZGF0YVVSTCcgaW4gcmVzdWx0KTtcbiAgICAgIGNvbnN0IGRhdGEgPSBoYXNEYXRhT2JqZWN0ID8gcmVzdWx0LmRhdGEgOiByZXN1bHQ7XG4gICAgICBjb25zdCBvcHRzID0gaGFzRGF0YU9iamVjdCA/IGFzc2lnbih7fSwgcmVzdWx0LCB7IGRhdGEgfSkgOiB7IGRhdGEgfTtcbiAgICAgIGlmIChpc0NhbnZhcyhkYXRhKSkge1xuICAgICAgICBjb25zdCBlbmNvZGluZyA9IG9wdHMuZW5jb2RpbmcgfHwgZXhwb3J0T3B0cy5lbmNvZGluZztcbiAgICAgICAgY29uc3QgZW5jb2RpbmdRdWFsaXR5ID0gZGVmaW5lZChvcHRzLmVuY29kaW5nUXVhbGl0eSwgZXhwb3J0T3B0cy5lbmNvZGluZ1F1YWxpdHksIDAuOTUpO1xuICAgICAgICBjb25zdCB7IGRhdGFVUkwsIGV4dGVuc2lvbiwgdHlwZSB9ID0gZXhwb3J0Q2FudmFzKGRhdGEsIHsgZW5jb2RpbmcsIGVuY29kaW5nUXVhbGl0eSB9KTtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24ob3B0cywgeyBkYXRhVVJMLCBleHRlbnNpb24sIHR5cGUgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gb3B0cztcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIE5vdyByZXR1cm4gdG8gcmVndWxhciByZW5kZXJpbmcgbW9kZVxuICAgIHRoaXMuX3Byb3BzLmV4cG9ydGluZyA9IGZhbHNlO1xuICAgIHRoaXMucmVzaXplKCk7XG4gICAgdGhpcy5yZW5kZXIoKTtcblxuICAgIC8vIEFuZCBub3cgd2UgY2FuIHNhdmUgZWFjaCByZXN1bHRcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoZHJhd1Jlc3VsdC5tYXAoKHJlc3VsdCwgaSwgbGF5ZXJMaXN0KSA9PiB7XG4gICAgICAvLyBCeSBkZWZhdWx0LCBpZiByZW5kZXJpbmcgbXVsdGlwbGUgbGF5ZXJzIHdlIHdpbGwgZ2l2ZSB0aGVtIGluZGljZXNcbiAgICAgIGNvbnN0IGN1ck9wdCA9IGFzc2lnbih7fSwgZXhwb3J0T3B0cywgcmVzdWx0LCB7IGxheWVyOiBpLCB0b3RhbExheWVyczogbGF5ZXJMaXN0Lmxlbmd0aCB9KTtcbiAgICAgIGNvbnN0IGRhdGEgPSByZXN1bHQuZGF0YTtcbiAgICAgIGlmIChyZXN1bHQuZGF0YVVSTCkge1xuICAgICAgICBjb25zdCBkYXRhVVJMID0gcmVzdWx0LmRhdGFVUkw7XG4gICAgICAgIGRlbGV0ZSBjdXJPcHQuZGF0YVVSTDsgLy8gYXZvaWQgc2VuZGluZyBlbnRpcmUgYmFzZTY0IGRhdGEgYXJvdW5kXG4gICAgICAgIHJldHVybiBzYXZlRGF0YVVSTChkYXRhVVJMLCBjdXJPcHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNhdmVGaWxlKGRhdGEsIGN1ck9wdCk7XG4gICAgICB9XG4gICAgfSkpLnRoZW4oZXYgPT4ge1xuICAgICAgaWYgKGV2Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgZXZlbnRXaXRoT3V0cHV0ID0gZXYuZmluZChlID0+IGUub3V0cHV0TmFtZSk7XG4gICAgICAgIGNvbnN0IGlzQ2xpZW50ID0gZXYuc29tZShlID0+IGUuY2xpZW50KTtcbiAgICAgICAgbGV0IGl0ZW07XG4gICAgICAgIC8vIG1hbnkgZmlsZXMsIGp1c3QgbG9nIGhvdyBtYW55IHdlcmUgZXhwb3J0ZWRcbiAgICAgICAgaWYgKGV2Lmxlbmd0aCA+IDEpIGl0ZW0gPSBldi5sZW5ndGg7XG4gICAgICAgIC8vIGluIENMSSwgd2Uga25vdyBleGFjdCBwYXRoIGRpcm5hbWVcbiAgICAgICAgZWxzZSBpZiAoZXZlbnRXaXRoT3V0cHV0KSBpdGVtID0gYCR7ZXZlbnRXaXRoT3V0cHV0Lm91dHB1dE5hbWV9LyR7ZXZbMF0uZmlsZW5hbWV9YDtcbiAgICAgICAgLy8gaW4gYnJvd3Nlciwgd2UgY2FuIG9ubHkga25vdyBpdCB3ZW50IHRvIFwiYnJvd3NlciBkb3dubG9hZCBmb2xkZXJcIlxuICAgICAgICBlbHNlIGl0ZW0gPSBgJHtldlswXS5maWxlbmFtZX1gO1xuICAgICAgICBsZXQgb2ZTZXEgPSAnJztcbiAgICAgICAgaWYgKGV4cG9ydE9wdHMuc2VxdWVuY2UpIHtcbiAgICAgICAgICBjb25zdCBoYXNUb3RhbEZyYW1lcyA9IGlzRmluaXRlKHRoaXMucHJvcHMudG90YWxGcmFtZXMpO1xuICAgICAgICAgIG9mU2VxID0gaGFzVG90YWxGcmFtZXMgPyBgIChmcmFtZSAke2V4cG9ydE9wdHMuZnJhbWUgKyAxfSAvICR7dGhpcy5wcm9wcy50b3RhbEZyYW1lc30pYCA6IGAgKGZyYW1lICR7ZXhwb3J0T3B0cy5mcmFtZX0pYDtcbiAgICAgICAgfSBlbHNlIGlmIChldi5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgb2ZTZXEgPSBgIGZpbGVzYDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjbGllbnQgPSBpc0NsaWVudCA/ICdjYW52YXMtc2tldGNoLWNsaScgOiAnY2FudmFzLXNrZXRjaCc7XG4gICAgICAgIGNvbnNvbGUubG9nKGAlY1ske2NsaWVudH1dJWMgRXhwb3J0ZWQgJWMke2l0ZW19JWMke29mU2VxfWAsICdjb2xvcjogIzhlOGU4ZTsnLCAnY29sb3I6IGluaXRpYWw7JywgJ2ZvbnQtd2VpZ2h0OiBib2xkOycsICdmb250LXdlaWdodDogaW5pdGlhbDsnKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgdGhpcy5za2V0Y2gucG9zdEV4cG9ydCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLnNrZXRjaC5wb3N0RXhwb3J0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfd3JhcENvbnRleHRTY2FsZSAoY2IpIHtcbiAgICB0aGlzLl9wcmVSZW5kZXIoKTtcbiAgICBjYih0aGlzLnByb3BzKTtcbiAgICB0aGlzLl9wb3N0UmVuZGVyKCk7XG4gIH1cblxuICBfcHJlUmVuZGVyICgpIHtcbiAgICBjb25zdCBwcm9wcyA9IHRoaXMucHJvcHM7XG5cbiAgICAvLyBTY2FsZSBjb250ZXh0IGZvciB1bml0IHNpemluZ1xuICAgIGlmICghdGhpcy5wcm9wcy5nbCAmJiBwcm9wcy5jb250ZXh0ICYmICFwcm9wcy5wNSkge1xuICAgICAgcHJvcHMuY29udGV4dC5zYXZlKCk7XG4gICAgICBpZiAodGhpcy5zZXR0aW5ncy5zY2FsZUNvbnRleHQgIT09IGZhbHNlKSB7XG4gICAgICAgIHByb3BzLmNvbnRleHQuc2NhbGUocHJvcHMuc2NhbGVYLCBwcm9wcy5zY2FsZVkpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAocHJvcHMucDUpIHtcbiAgICAgIHByb3BzLnA1LnNjYWxlKHByb3BzLnNjYWxlWCAvIHByb3BzLnBpeGVsUmF0aW8sIHByb3BzLnNjYWxlWSAvIHByb3BzLnBpeGVsUmF0aW8pO1xuICAgIH1cbiAgfVxuXG4gIF9wb3N0UmVuZGVyICgpIHtcbiAgICBjb25zdCBwcm9wcyA9IHRoaXMucHJvcHM7XG5cbiAgICBpZiAoIXRoaXMucHJvcHMuZ2wgJiYgcHJvcHMuY29udGV4dCAmJiAhcHJvcHMucDUpIHtcbiAgICAgIHByb3BzLmNvbnRleHQucmVzdG9yZSgpO1xuICAgIH1cblxuICAgIC8vIEZsdXNoIGJ5IGRlZmF1bHQsIHRoaXMgbWF5IGJlIHJldmlzaXRlZCBhdCBhIGxhdGVyIHBvaW50LlxuICAgIC8vIFdlIGRvIHRoaXMgdG8gZW5zdXJlIHRvRGF0YVVSTCBjYW4gYmUgY2FsbGVkIGltbWVkaWF0ZWx5IGFmdGVyLlxuICAgIC8vIE1vc3QgbGlrZWx5IGJyb3dzZXJzIGFscmVhZHkgaGFuZGxlIHRoaXMsIHNvIHdlIG1heSByZXZpc2l0IHRoaXMgYW5kXG4gICAgLy8gcmVtb3ZlIGl0IGlmIGl0IGltcHJvdmVzIHBlcmZvcm1hbmNlIHdpdGhvdXQgYW55IHVzYWJpbGl0eSBpc3N1ZXMuXG4gICAgaWYgKHByb3BzLmdsICYmIHRoaXMuc2V0dGluZ3MuZmx1c2ggIT09IGZhbHNlICYmICFwcm9wcy5wNSkge1xuICAgICAgcHJvcHMuZ2wuZmx1c2goKTtcbiAgICB9XG4gIH1cblxuICB0aWNrICgpIHtcbiAgICBpZiAodGhpcy5za2V0Y2ggJiYgdHlwZW9mIHRoaXMuc2tldGNoLnRpY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuX3ByZVJlbmRlcigpO1xuICAgICAgdGhpcy5za2V0Y2gudGljayh0aGlzLnByb3BzKTtcbiAgICAgIHRoaXMuX3Bvc3RSZW5kZXIoKTtcbiAgICB9XG4gIH1cblxuICByZW5kZXIgKCkge1xuICAgIGlmICh0aGlzLnByb3BzLnA1KSB7XG4gICAgICB0aGlzLl9sYXN0UmVkcmF3UmVzdWx0ID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5wcm9wcy5wNS5yZWRyYXcoKTtcbiAgICAgIHJldHVybiB0aGlzLl9sYXN0UmVkcmF3UmVzdWx0O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5zdWJtaXREcmF3Q2FsbCgpO1xuICAgIH1cbiAgfVxuXG4gIHN1Ym1pdERyYXdDYWxsICgpIHtcbiAgICBpZiAoIXRoaXMuc2tldGNoKSByZXR1cm47XG5cbiAgICBjb25zdCBwcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgdGhpcy5fcHJlUmVuZGVyKCk7XG5cbiAgICBsZXQgZHJhd1Jlc3VsdDtcblxuICAgIGlmICh0eXBlb2YgdGhpcy5za2V0Y2ggPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGRyYXdSZXN1bHQgPSB0aGlzLnNrZXRjaChwcm9wcyk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5za2V0Y2gucmVuZGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBkcmF3UmVzdWx0ID0gdGhpcy5za2V0Y2gucmVuZGVyKHByb3BzKTtcbiAgICB9XG5cbiAgICB0aGlzLl9wb3N0UmVuZGVyKCk7XG5cbiAgICByZXR1cm4gZHJhd1Jlc3VsdDtcbiAgfVxuXG4gIHVwZGF0ZSAob3B0ID0ge30pIHtcbiAgICAvLyBDdXJyZW50bHkgdXBkYXRlKCkgaXMgb25seSBmb2N1c2VkIG9uIHJlc2l6aW5nLFxuICAgIC8vIGJ1dCBsYXRlciB3ZSB3aWxsIHN1cHBvcnQgb3RoZXIgb3B0aW9ucyBsaWtlIHN3aXRjaGluZ1xuICAgIC8vIGZyYW1lcyBhbmQgc3VjaC5cbiAgICBjb25zdCBub3RZZXRTdXBwb3J0ZWQgPSBbXG4gICAgICAnYW5pbWF0ZSdcbiAgICBdO1xuXG4gICAgT2JqZWN0LmtleXMob3B0KS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICBpZiAobm90WWV0U3VwcG9ydGVkLmluZGV4T2Yoa2V5KSA+PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgU29ycnksIHRoZSB7ICR7a2V5fSB9IG9wdGlvbiBpcyBub3QgeWV0IHN1cHBvcnRlZCB3aXRoIHVwZGF0ZSgpLmApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3Qgb2xkQ2FudmFzID0gdGhpcy5fc2V0dGluZ3MuY2FudmFzO1xuICAgIGNvbnN0IG9sZENvbnRleHQgPSB0aGlzLl9zZXR0aW5ncy5jb250ZXh0O1xuXG4gICAgLy8gTWVyZ2UgbmV3IG9wdGlvbnMgaW50byBzZXR0aW5nc1xuICAgIGZvciAobGV0IGtleSBpbiBvcHQpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gb3B0W2tleV07XG4gICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAndW5kZWZpbmVkJykgeyAvLyBpZ25vcmUgdW5kZWZpbmVkXG4gICAgICAgIHRoaXMuX3NldHRpbmdzW2tleV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNZXJnZSBpbiB0aW1lIHByb3BzXG4gICAgY29uc3QgdGltZU9wdHMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLl9zZXR0aW5ncywgb3B0KTtcbiAgICBpZiAoJ3RpbWUnIGluIG9wdCAmJiAnZnJhbWUnIGluIG9wdCkgdGhyb3cgbmV3IEVycm9yKCdZb3Ugc2hvdWxkIHNwZWNpZnkgeyB0aW1lIH0gb3IgeyBmcmFtZSB9IGJ1dCBub3QgYm90aCcpO1xuICAgIGVsc2UgaWYgKCd0aW1lJyBpbiBvcHQpIGRlbGV0ZSB0aW1lT3B0cy5mcmFtZTtcbiAgICBlbHNlIGlmICgnZnJhbWUnIGluIG9wdCkgZGVsZXRlIHRpbWVPcHRzLnRpbWU7XG4gICAgaWYgKCdkdXJhdGlvbicgaW4gb3B0ICYmICd0b3RhbEZyYW1lcycgaW4gb3B0KSB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBzaG91bGQgc3BlY2lmeSB7IGR1cmF0aW9uIH0gb3IgeyB0b3RhbEZyYW1lcyB9IGJ1dCBub3QgYm90aCcpO1xuICAgIGVsc2UgaWYgKCdkdXJhdGlvbicgaW4gb3B0KSBkZWxldGUgdGltZU9wdHMudG90YWxGcmFtZXM7XG4gICAgZWxzZSBpZiAoJ3RvdGFsRnJhbWVzJyBpbiBvcHQpIGRlbGV0ZSB0aW1lT3B0cy5kdXJhdGlvbjtcblxuICAgIC8vIE1lcmdlIGluIHVzZXIgZGF0YSB3aXRob3V0IGNvcHlpbmdcbiAgICBpZiAoJ2RhdGEnIGluIG9wdCkgdGhpcy5fcHJvcHMuZGF0YSA9IG9wdC5kYXRhO1xuXG4gICAgY29uc3QgdGltZVByb3BzID0gdGhpcy5nZXRUaW1lUHJvcHModGltZU9wdHMpO1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5fcHJvcHMsIHRpbWVQcm9wcyk7XG5cbiAgICAvLyBJZiBlaXRoZXIgY2FudmFzIG9yIGNvbnRleHQgaXMgY2hhbmdlZCwgd2Ugc2hvdWxkIHJlLXVwZGF0ZVxuICAgIGlmIChvbGRDYW52YXMgIT09IHRoaXMuX3NldHRpbmdzLmNhbnZhcyB8fCBvbGRDb250ZXh0ICE9PSB0aGlzLl9zZXR0aW5ncy5jb250ZXh0KSB7XG4gICAgICBjb25zdCB7IGNhbnZhcywgY29udGV4dCB9ID0gY3JlYXRlQ2FudmFzKHRoaXMuX3NldHRpbmdzKTtcblxuICAgICAgdGhpcy5wcm9wcy5jYW52YXMgPSBjYW52YXM7XG4gICAgICB0aGlzLnByb3BzLmNvbnRleHQgPSBjb250ZXh0O1xuXG4gICAgICAvLyBEZWxldGUgb3IgYWRkIGEgJ2dsJyBwcm9wIGZvciBjb252ZW5pZW5jZVxuICAgICAgdGhpcy5fc2V0dXBHTEtleSgpO1xuXG4gICAgICAvLyBSZS1tb3VudCB0aGUgbmV3IGNhbnZhcyBpZiBpdCBoYXMgbm8gcGFyZW50XG4gICAgICB0aGlzLl9hcHBlbmRDYW52YXNJZk5lZWRlZCgpO1xuICAgIH1cblxuICAgIC8vIFNwZWNpYWwgY2FzZSB0byBzdXBwb3J0IFA1LmpzXG4gICAgaWYgKG9wdC5wNSAmJiB0eXBlb2Ygb3B0LnA1ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLnByb3BzLnA1ID0gb3B0LnA1O1xuICAgICAgdGhpcy5wcm9wcy5wNS5kcmF3ID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5faXNQNVJlc2l6aW5nKSByZXR1cm47XG4gICAgICAgIHRoaXMuX2xhc3RSZWRyYXdSZXN1bHQgPSB0aGlzLnN1Ym1pdERyYXdDYWxsKCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSBwbGF5aW5nIHN0YXRlIGlmIG5lY2Vzc2FyeVxuICAgIGlmICgncGxheWluZycgaW4gb3B0KSB7XG4gICAgICBpZiAob3B0LnBsYXlpbmcpIHRoaXMucGxheSgpO1xuICAgICAgZWxzZSB0aGlzLnBhdXNlKCk7XG4gICAgfVxuXG4gICAgY2hlY2tTZXR0aW5ncyh0aGlzLl9zZXR0aW5ncyk7XG5cbiAgICAvLyBEcmF3IG5ldyBmcmFtZVxuICAgIHRoaXMucmVzaXplKCk7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgICByZXR1cm4gdGhpcy5wcm9wcztcbiAgfVxuXG4gIHJlc2l6ZSAoKSB7XG4gICAgY29uc3Qgb2xkU2l6ZXMgPSB0aGlzLl9nZXRTaXplUHJvcHMoKTtcblxuICAgIGNvbnN0IHNldHRpbmdzID0gdGhpcy5zZXR0aW5ncztcbiAgICBjb25zdCBwcm9wcyA9IHRoaXMucHJvcHM7XG5cbiAgICAvLyBSZWNvbXB1dGUgbmV3IHByb3BlcnRpZXMgYmFzZWQgb24gY3VycmVudCBzZXR1cFxuICAgIGNvbnN0IG5ld1Byb3BzID0gcmVzaXplQ2FudmFzKHByb3BzLCBzZXR0aW5ncyk7XG5cbiAgICAvLyBBc3NpZ24gdG8gY3VycmVudCBwcm9wc1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5fcHJvcHMsIG5ld1Byb3BzKTtcblxuICAgIC8vIE5vdyB3ZSBhY3R1YWxseSB1cGRhdGUgdGhlIGNhbnZhcyB3aWR0aC9oZWlnaHQgYW5kIHN0eWxlIHByb3BzXG4gICAgY29uc3Qge1xuICAgICAgcGl4ZWxSYXRpbyxcbiAgICAgIGNhbnZhc1dpZHRoLFxuICAgICAgY2FudmFzSGVpZ2h0LFxuICAgICAgc3R5bGVXaWR0aCxcbiAgICAgIHN0eWxlSGVpZ2h0XG4gICAgfSA9IHRoaXMucHJvcHM7XG5cbiAgICAvLyBVcGRhdGUgY2FudmFzIHNldHRpbmdzXG4gICAgY29uc3QgY2FudmFzID0gdGhpcy5wcm9wcy5jYW52YXM7XG4gICAgaWYgKGNhbnZhcyAmJiBzZXR0aW5ncy5yZXNpemVDYW52YXMgIT09IGZhbHNlKSB7XG4gICAgICBpZiAocHJvcHMucDUpIHtcbiAgICAgICAgLy8gUDUuanMgc3BlY2lmaWMgZWRnZSBjYXNlXG4gICAgICAgIGlmIChjYW52YXMud2lkdGggIT09IGNhbnZhc1dpZHRoIHx8IGNhbnZhcy5oZWlnaHQgIT09IGNhbnZhc0hlaWdodCkge1xuICAgICAgICAgIHRoaXMuX2lzUDVSZXNpemluZyA9IHRydWU7XG4gICAgICAgICAgLy8gVGhpcyBjYXVzZXMgYSByZS1kcmF3IDpcXCBzbyB3ZSBpZ25vcmUgZHJhd3MgaW4gdGhlIG1lYW4gdGltZS4uLiBzb3J0YSBoYWNreVxuICAgICAgICAgIHByb3BzLnA1LnBpeGVsRGVuc2l0eShwaXhlbFJhdGlvKTtcbiAgICAgICAgICBwcm9wcy5wNS5yZXNpemVDYW52YXMoY2FudmFzV2lkdGggLyBwaXhlbFJhdGlvLCBjYW52YXNIZWlnaHQgLyBwaXhlbFJhdGlvLCBmYWxzZSk7XG4gICAgICAgICAgdGhpcy5faXNQNVJlc2l6aW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEZvcmNlIGNhbnZhcyBzaXplXG4gICAgICAgIGlmIChjYW52YXMud2lkdGggIT09IGNhbnZhc1dpZHRoKSBjYW52YXMud2lkdGggPSBjYW52YXNXaWR0aDtcbiAgICAgICAgaWYgKGNhbnZhcy5oZWlnaHQgIT09IGNhbnZhc0hlaWdodCkgY2FudmFzLmhlaWdodCA9IGNhbnZhc0hlaWdodDtcbiAgICAgIH1cbiAgICAgIC8vIFVwZGF0ZSBjYW52YXMgc3R5bGVcbiAgICAgIGlmIChpc0Jyb3dzZXIoKSAmJiBzZXR0aW5ncy5zdHlsZUNhbnZhcyAhPT0gZmFsc2UpIHtcbiAgICAgICAgY2FudmFzLnN0eWxlLndpZHRoID0gYCR7c3R5bGVXaWR0aH1weGA7XG4gICAgICAgIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBgJHtzdHlsZUhlaWdodH1weGA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgbmV3U2l6ZXMgPSB0aGlzLl9nZXRTaXplUHJvcHMoKTtcbiAgICBsZXQgY2hhbmdlZCA9ICFkZWVwRXF1YWwob2xkU2l6ZXMsIG5ld1NpemVzKTtcbiAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgdGhpcy5fc2l6ZUNoYW5nZWQoKTtcbiAgICB9XG4gICAgcmV0dXJuIGNoYW5nZWQ7XG4gIH1cblxuICBfc2l6ZUNoYW5nZWQgKCkge1xuICAgIC8vIFNlbmQgcmVzaXplIGV2ZW50IHRvIHNrZXRjaFxuICAgIGlmICh0aGlzLnNrZXRjaCAmJiB0eXBlb2YgdGhpcy5za2V0Y2gucmVzaXplID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLnNrZXRjaC5yZXNpemUodGhpcy5wcm9wcyk7XG4gICAgfVxuICB9XG5cbiAgYW5pbWF0ZSAoKSB7XG4gICAgaWYgKCF0aGlzLnByb3BzLnBsYXlpbmcpIHJldHVybjtcbiAgICBpZiAoIWlzQnJvd3NlcigpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbY2FudmFzLXNrZXRjaF0gV0FSTjogQW5pbWF0aW9uIGluIE5vZGUuanMgaXMgbm90IHlldCBzdXBwb3J0ZWQnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fcmFmID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLl9hbmltYXRlSGFuZGxlcik7XG5cbiAgICBsZXQgbm93ID0gcmlnaHROb3coKTtcblxuICAgIGNvbnN0IGZwcyA9IHRoaXMucHJvcHMuZnBzO1xuICAgIGNvbnN0IGZyYW1lSW50ZXJ2YWxNUyA9IDEwMDAgLyBmcHM7XG4gICAgbGV0IGRlbHRhVGltZU1TID0gbm93IC0gdGhpcy5fbGFzdFRpbWU7XG5cbiAgICBjb25zdCBkdXJhdGlvbiA9IHRoaXMucHJvcHMuZHVyYXRpb247XG4gICAgY29uc3QgaGFzRHVyYXRpb24gPSB0eXBlb2YgZHVyYXRpb24gPT09ICdudW1iZXInICYmIGlzRmluaXRlKGR1cmF0aW9uKTtcblxuICAgIGxldCBpc05ld0ZyYW1lID0gdHJ1ZTtcbiAgICBjb25zdCBwbGF5YmFja1JhdGUgPSB0aGlzLnNldHRpbmdzLnBsYXliYWNrUmF0ZTtcbiAgICBpZiAocGxheWJhY2tSYXRlID09PSAnZml4ZWQnKSB7XG4gICAgICBkZWx0YVRpbWVNUyA9IGZyYW1lSW50ZXJ2YWxNUztcbiAgICB9IGVsc2UgaWYgKHBsYXliYWNrUmF0ZSA9PT0gJ3Rocm90dGxlJykge1xuICAgICAgaWYgKGRlbHRhVGltZU1TID4gZnJhbWVJbnRlcnZhbE1TKSB7XG4gICAgICAgIG5vdyA9IG5vdyAtIChkZWx0YVRpbWVNUyAlIGZyYW1lSW50ZXJ2YWxNUyk7XG4gICAgICAgIHRoaXMuX2xhc3RUaW1lID0gbm93O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaXNOZXdGcmFtZSA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9sYXN0VGltZSA9IG5vdztcbiAgICB9XG5cbiAgICBjb25zdCBkZWx0YVRpbWUgPSBkZWx0YVRpbWVNUyAvIDEwMDA7XG4gICAgbGV0IG5ld1RpbWUgPSB0aGlzLnByb3BzLnRpbWUgKyBkZWx0YVRpbWUgKiB0aGlzLnByb3BzLnRpbWVTY2FsZTtcblxuICAgIC8vIEhhbmRsZSByZXZlcnNlIHRpbWUgc2NhbGVcbiAgICBpZiAobmV3VGltZSA8IDAgJiYgaGFzRHVyYXRpb24pIHtcbiAgICAgIG5ld1RpbWUgPSBkdXJhdGlvbiArIG5ld1RpbWU7XG4gICAgfVxuXG4gICAgLy8gUmUtc3RhcnQgYW5pbWF0aW9uXG4gICAgbGV0IGlzRmluaXNoZWQgPSBmYWxzZTtcbiAgICBsZXQgaXNMb29wU3RhcnQgPSBmYWxzZTtcblxuICAgIGNvbnN0IGxvb3BpbmcgPSB0aGlzLnNldHRpbmdzLmxvb3AgIT09IGZhbHNlO1xuXG4gICAgaWYgKGhhc0R1cmF0aW9uICYmIG5ld1RpbWUgPj0gZHVyYXRpb24pIHtcbiAgICAgIC8vIFJlLXN0YXJ0IGFuaW1hdGlvblxuICAgICAgaWYgKGxvb3BpbmcpIHtcbiAgICAgICAgaXNOZXdGcmFtZSA9IHRydWU7XG4gICAgICAgIG5ld1RpbWUgPSBuZXdUaW1lICUgZHVyYXRpb247XG4gICAgICAgIGlzTG9vcFN0YXJ0ID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlzTmV3RnJhbWUgPSBmYWxzZTtcbiAgICAgICAgbmV3VGltZSA9IGR1cmF0aW9uO1xuICAgICAgICBpc0ZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fc2lnbmFsRW5kKCk7XG4gICAgfVxuXG4gICAgaWYgKGlzTmV3RnJhbWUpIHtcbiAgICAgIHRoaXMucHJvcHMuZGVsdGFUaW1lID0gZGVsdGFUaW1lO1xuICAgICAgdGhpcy5wcm9wcy50aW1lID0gbmV3VGltZTtcbiAgICAgIHRoaXMucHJvcHMucGxheWhlYWQgPSB0aGlzLl9jb21wdXRlUGxheWhlYWQobmV3VGltZSwgZHVyYXRpb24pO1xuICAgICAgY29uc3QgbGFzdEZyYW1lID0gdGhpcy5wcm9wcy5mcmFtZTtcbiAgICAgIHRoaXMucHJvcHMuZnJhbWUgPSB0aGlzLl9jb21wdXRlQ3VycmVudEZyYW1lKCk7XG4gICAgICBpZiAoaXNMb29wU3RhcnQpIHRoaXMuX3NpZ25hbEJlZ2luKCk7XG4gICAgICBpZiAobGFzdEZyYW1lICE9PSB0aGlzLnByb3BzLmZyYW1lKSB0aGlzLnRpY2soKTtcbiAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICB0aGlzLnByb3BzLmRlbHRhVGltZSA9IDA7XG4gICAgfVxuXG4gICAgaWYgKGlzRmluaXNoZWQpIHtcbiAgICAgIHRoaXMucGF1c2UoKTtcbiAgICB9XG4gIH1cblxuICBkaXNwYXRjaCAoY2IpIHtcbiAgICBpZiAodHlwZW9mIGNiICE9PSAnZnVuY3Rpb24nKSB0aHJvdyBuZXcgRXJyb3IoJ211c3QgcGFzcyBmdW5jdGlvbiBpbnRvIGRpc3BhdGNoKCknKTtcbiAgICBjYih0aGlzLnByb3BzKTtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgbW91bnQgKCkge1xuICAgIHRoaXMuX2FwcGVuZENhbnZhc0lmTmVlZGVkKCk7XG4gIH1cblxuICB1bm1vdW50ICgpIHtcbiAgICBpZiAoaXNCcm93c2VyKCkpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLl9yZXNpemVIYW5kbGVyKTtcbiAgICAgIHRoaXMuX2tleWJvYXJkU2hvcnRjdXRzLmRldGFjaCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy5wcm9wcy5jYW52YXMucGFyZW50RWxlbWVudCkge1xuICAgICAgdGhpcy5wcm9wcy5jYW52YXMucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLnByb3BzLmNhbnZhcyk7XG4gICAgfVxuICB9XG5cbiAgX2FwcGVuZENhbnZhc0lmTmVlZGVkICgpIHtcbiAgICBpZiAoIWlzQnJvd3NlcigpKSByZXR1cm47XG4gICAgaWYgKHRoaXMuc2V0dGluZ3MucGFyZW50ICE9PSBmYWxzZSAmJiAodGhpcy5wcm9wcy5jYW52YXMgJiYgIXRoaXMucHJvcHMuY2FudmFzLnBhcmVudEVsZW1lbnQpKSB7XG4gICAgICBjb25zdCBkZWZhdWx0UGFyZW50ID0gdGhpcy5zZXR0aW5ncy5wYXJlbnQgfHwgZG9jdW1lbnQuYm9keTtcbiAgICAgIGRlZmF1bHRQYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy5wcm9wcy5jYW52YXMpO1xuICAgIH1cbiAgfVxuXG4gIF9zZXR1cEdMS2V5ICgpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5jb250ZXh0KSB7XG4gICAgICBpZiAoaXNXZWJHTENvbnRleHQodGhpcy5wcm9wcy5jb250ZXh0KSkge1xuICAgICAgICB0aGlzLl9wcm9wcy5nbCA9IHRoaXMucHJvcHMuY29udGV4dDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLl9wcm9wcy5nbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRUaW1lUHJvcHMgKHNldHRpbmdzID0ge30pIHtcbiAgICAvLyBHZXQgdGltaW5nIGRhdGFcbiAgICBsZXQgZHVyYXRpb24gPSBzZXR0aW5ncy5kdXJhdGlvbjtcbiAgICBsZXQgdG90YWxGcmFtZXMgPSBzZXR0aW5ncy50b3RhbEZyYW1lcztcbiAgICBjb25zdCB0aW1lU2NhbGUgPSBkZWZpbmVkKHNldHRpbmdzLnRpbWVTY2FsZSwgMSk7XG4gICAgY29uc3QgZnBzID0gZGVmaW5lZChzZXR0aW5ncy5mcHMsIDI0KTtcbiAgICBjb25zdCBoYXNEdXJhdGlvbiA9IHR5cGVvZiBkdXJhdGlvbiA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoZHVyYXRpb24pO1xuICAgIGNvbnN0IGhhc1RvdGFsRnJhbWVzID0gdHlwZW9mIHRvdGFsRnJhbWVzID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSh0b3RhbEZyYW1lcyk7XG5cbiAgICBjb25zdCB0b3RhbEZyYW1lc0Zyb21EdXJhdGlvbiA9IGhhc0R1cmF0aW9uID8gTWF0aC5mbG9vcihmcHMgKiBkdXJhdGlvbikgOiB1bmRlZmluZWQ7XG4gICAgY29uc3QgZHVyYXRpb25Gcm9tVG90YWxGcmFtZXMgPSBoYXNUb3RhbEZyYW1lcyA/ICh0b3RhbEZyYW1lcyAvIGZwcykgOiB1bmRlZmluZWQ7XG4gICAgaWYgKGhhc0R1cmF0aW9uICYmIGhhc1RvdGFsRnJhbWVzICYmIHRvdGFsRnJhbWVzRnJvbUR1cmF0aW9uICE9PSB0b3RhbEZyYW1lcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3Ugc2hvdWxkIHNwZWNpZnkgZWl0aGVyIGR1cmF0aW9uIG9yIHRvdGFsRnJhbWVzLCBidXQgbm90IGJvdGguIE9yLCB0aGV5IG11c3QgbWF0Y2ggZXhhY3RseS4nKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHNldHRpbmdzLmRpbWVuc2lvbnMgPT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBzZXR0aW5ncy51bml0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNvbnNvbGUud2FybihgWW91J3ZlIHNwZWNpZmllZCBhIHsgdW5pdHMgfSBzZXR0aW5nIGJ1dCBubyB7IGRpbWVuc2lvbiB9LCBzbyB0aGUgdW5pdHMgd2lsbCBiZSBpZ25vcmVkLmApO1xuICAgIH1cblxuICAgIHRvdGFsRnJhbWVzID0gZGVmaW5lZCh0b3RhbEZyYW1lcywgdG90YWxGcmFtZXNGcm9tRHVyYXRpb24sIEluZmluaXR5KTtcbiAgICBkdXJhdGlvbiA9IGRlZmluZWQoZHVyYXRpb24sIGR1cmF0aW9uRnJvbVRvdGFsRnJhbWVzLCBJbmZpbml0eSk7XG5cbiAgICBjb25zdCBzdGFydFRpbWUgPSBzZXR0aW5ncy50aW1lO1xuICAgIGNvbnN0IHN0YXJ0RnJhbWUgPSBzZXR0aW5ncy5mcmFtZTtcbiAgICBjb25zdCBoYXNTdGFydFRpbWUgPSB0eXBlb2Ygc3RhcnRUaW1lID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZShzdGFydFRpbWUpO1xuICAgIGNvbnN0IGhhc1N0YXJ0RnJhbWUgPSB0eXBlb2Ygc3RhcnRGcmFtZSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoc3RhcnRGcmFtZSk7XG5cbiAgICAvLyBzdGFydCBhdCB6ZXJvIHVubGVzcyB1c2VyIHNwZWNpZmllcyBmcmFtZSBvciB0aW1lIChidXQgbm90IGJvdGggbWlzbWF0Y2hlZClcbiAgICBsZXQgdGltZSA9IDA7XG4gICAgbGV0IGZyYW1lID0gMDtcbiAgICBsZXQgcGxheWhlYWQgPSAwO1xuICAgIGlmIChoYXNTdGFydFRpbWUgJiYgaGFzU3RhcnRGcmFtZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3Ugc2hvdWxkIHNwZWNpZnkgZWl0aGVyIHN0YXJ0IGZyYW1lIG9yIHRpbWUsIGJ1dCBub3QgYm90aC4nKTtcbiAgICB9IGVsc2UgaWYgKGhhc1N0YXJ0VGltZSkge1xuICAgICAgLy8gVXNlciBzcGVjaWZpZXMgdGltZSwgd2UgaW5mZXIgZnJhbWVzIGZyb20gRlBTXG4gICAgICB0aW1lID0gc3RhcnRUaW1lO1xuICAgICAgcGxheWhlYWQgPSB0aGlzLl9jb21wdXRlUGxheWhlYWQodGltZSwgZHVyYXRpb24pO1xuICAgICAgZnJhbWUgPSB0aGlzLl9jb21wdXRlRnJhbWUoXG4gICAgICAgIHBsYXloZWFkLCB0aW1lLFxuICAgICAgICB0b3RhbEZyYW1lcywgZnBzXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAoaGFzU3RhcnRGcmFtZSkge1xuICAgICAgLy8gVXNlciBzcGVjaWZpZXMgZnJhbWUgbnVtYmVyLCB3ZSBpbmZlciB0aW1lIGZyb20gRlBTXG4gICAgICBmcmFtZSA9IHN0YXJ0RnJhbWU7XG4gICAgICB0aW1lID0gZnJhbWUgLyBmcHM7XG4gICAgICBwbGF5aGVhZCA9IHRoaXMuX2NvbXB1dGVQbGF5aGVhZCh0aW1lLCBkdXJhdGlvbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHBsYXloZWFkLFxuICAgICAgdGltZSxcbiAgICAgIGZyYW1lLFxuICAgICAgZHVyYXRpb24sXG4gICAgICB0b3RhbEZyYW1lcyxcbiAgICAgIGZwcyxcbiAgICAgIHRpbWVTY2FsZVxuICAgIH07XG4gIH1cblxuICBzZXR1cCAoc2V0dGluZ3MgPSB7fSkge1xuICAgIGlmICh0aGlzLnNrZXRjaCkgdGhyb3cgbmV3IEVycm9yKCdNdWx0aXBsZSBzZXR1cCgpIGNhbGxzIG5vdCB5ZXQgc3VwcG9ydGVkLicpO1xuXG4gICAgdGhpcy5fc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBzZXR0aW5ncywgdGhpcy5fc2V0dGluZ3MpO1xuXG4gICAgY2hlY2tTZXR0aW5ncyh0aGlzLl9zZXR0aW5ncyk7XG5cbiAgICAvLyBHZXQgaW5pdGlhbCBjYW52YXMgJiBjb250ZXh0XG4gICAgY29uc3QgeyBjb250ZXh0LCBjYW52YXMgfSA9IGNyZWF0ZUNhbnZhcyh0aGlzLl9zZXR0aW5ncyk7XG5cbiAgICBjb25zdCB0aW1lUHJvcHMgPSB0aGlzLmdldFRpbWVQcm9wcyh0aGlzLl9zZXR0aW5ncyk7XG5cbiAgICAvLyBJbml0aWFsIHJlbmRlciBzdGF0ZSBmZWF0dXJlc1xuICAgIHRoaXMuX3Byb3BzID0ge1xuICAgICAgLi4udGltZVByb3BzLFxuICAgICAgY2FudmFzLFxuICAgICAgY29udGV4dCxcbiAgICAgIGRlbHRhVGltZTogMCxcbiAgICAgIHN0YXJ0ZWQ6IGZhbHNlLFxuICAgICAgZXhwb3J0aW5nOiBmYWxzZSxcbiAgICAgIHBsYXlpbmc6IGZhbHNlLFxuICAgICAgcmVjb3JkaW5nOiBmYWxzZSxcbiAgICAgIHNldHRpbmdzOiB0aGlzLnNldHRpbmdzLFxuICAgICAgZGF0YTogdGhpcy5zZXR0aW5ncy5kYXRhLFxuXG4gICAgICAvLyBFeHBvcnQgc29tZSBzcGVjaWZpYyBhY3Rpb25zIHRvIHRoZSBza2V0Y2hcbiAgICAgIHJlbmRlcjogKCkgPT4gdGhpcy5yZW5kZXIoKSxcbiAgICAgIHRvZ2dsZVBsYXk6ICgpID0+IHRoaXMudG9nZ2xlUGxheSgpLFxuICAgICAgZGlzcGF0Y2g6IChjYikgPT4gdGhpcy5kaXNwYXRjaChjYiksXG4gICAgICB0aWNrOiAoKSA9PiB0aGlzLnRpY2soKSxcbiAgICAgIHJlc2l6ZTogKCkgPT4gdGhpcy5yZXNpemUoKSxcbiAgICAgIHVwZGF0ZTogKG9wdCkgPT4gdGhpcy51cGRhdGUob3B0KSxcbiAgICAgIGV4cG9ydEZyYW1lOiBvcHQgPT4gdGhpcy5leHBvcnRGcmFtZShvcHQpLFxuICAgICAgcmVjb3JkOiAoKSA9PiB0aGlzLnJlY29yZCgpLFxuICAgICAgcGxheTogKCkgPT4gdGhpcy5wbGF5KCksXG4gICAgICBwYXVzZTogKCkgPT4gdGhpcy5wYXVzZSgpLFxuICAgICAgc3RvcDogKCkgPT4gdGhpcy5zdG9wKClcbiAgICB9O1xuXG4gICAgLy8gRm9yIFdlYkdMIHNrZXRjaGVzLCBhIGdsIHZhcmlhYmxlIHJlYWRzIGEgYml0IGJldHRlclxuICAgIHRoaXMuX3NldHVwR0xLZXkoKTtcblxuICAgIC8vIFRyaWdnZXIgaW5pdGlhbCByZXNpemUgbm93IHNvIHRoYXQgY2FudmFzIGlzIGFscmVhZHkgc2l6ZWRcbiAgICAvLyBieSB0aGUgdGltZSB3ZSBsb2FkIHRoZSBza2V0Y2hcbiAgICB0aGlzLnJlc2l6ZSgpO1xuICB9XG5cbiAgbG9hZEFuZFJ1biAoY2FudmFzU2tldGNoLCBuZXdTZXR0aW5ncykge1xuICAgIHJldHVybiB0aGlzLmxvYWQoY2FudmFzU2tldGNoLCBuZXdTZXR0aW5ncykudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLnJ1bigpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSk7XG4gIH1cblxuICB1bmxvYWQgKCkge1xuICAgIHRoaXMucGF1c2UoKTtcbiAgICBpZiAoIXRoaXMuc2tldGNoKSByZXR1cm47XG4gICAgaWYgKHR5cGVvZiB0aGlzLnNrZXRjaC51bmxvYWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuX3dyYXBDb250ZXh0U2NhbGUocHJvcHMgPT4gdGhpcy5za2V0Y2gudW5sb2FkKHByb3BzKSk7XG4gICAgfVxuICAgIHRoaXMuX3NrZXRjaCA9IG51bGw7XG4gIH1cblxuICBkZXN0cm95ICgpIHtcbiAgICB0aGlzLnVubG9hZCgpO1xuICAgIHRoaXMudW5tb3VudCgpO1xuICB9XG5cbiAgbG9hZCAoY3JlYXRlU2tldGNoLCBuZXdTZXR0aW5ncykge1xuICAgIC8vIFVzZXIgZGlkbid0IHNwZWNpZnkgYSBmdW5jdGlvblxuICAgIGlmICh0eXBlb2YgY3JlYXRlU2tldGNoICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBmdW5jdGlvbiBtdXN0IHRha2UgaW4gYSBmdW5jdGlvbiBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyLiBFeGFtcGxlOlxcbiAgY2FudmFzU2tldGNoZXIoKCkgPT4geyAuLi4gfSwgc2V0dGluZ3MpJyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2tldGNoKSB7XG4gICAgICB0aGlzLnVubG9hZCgpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgbmV3U2V0dGluZ3MgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLnVwZGF0ZShuZXdTZXR0aW5ncyk7XG4gICAgfVxuXG4gICAgLy8gVGhpcyBpcyBhIGJpdCBvZiBhIHRyaWNreSBjYXNlOyB3ZSBzZXQgdXAgdGhlIGF1dG8tc2NhbGluZyBoZXJlXG4gICAgLy8gaW4gY2FzZSB0aGUgdXNlciBkZWNpZGVzIHRvIHJlbmRlciBhbnl0aGluZyB0byB0aGUgY29udGV4dCAqYmVmb3JlKiB0aGVcbiAgICAvLyByZW5kZXIoKSBmdW5jdGlvbi4uLiBIb3dldmVyLCB1c2VycyBzaG91bGQgaW5zdGVhZCB1c2UgYmVnaW4oKSBmdW5jdGlvbiBmb3IgdGhhdC5cbiAgICB0aGlzLl9wcmVSZW5kZXIoKTtcblxuICAgIGxldCBwcmVsb2FkID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5cbiAgICAvLyBCZWNhdXNlIG9mIFA1LmpzJ3MgdW51c3VhbCBzdHJ1Y3R1cmUsIHdlIGhhdmUgdG8gZG8gYSBiaXQgb2ZcbiAgICAvLyBsaWJyYXJ5LXNwZWNpZmljIGNoYW5nZXMgdG8gc3VwcG9ydCBpdCBwcm9wZXJseS5cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5wNSkge1xuICAgICAgaWYgKCFpc0Jyb3dzZXIoKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1tjYW52YXMtc2tldGNoXSBFUlJPUjogVXNpbmcgcDUuanMgaW4gTm9kZS5qcyBpcyBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICB9XG4gICAgICBwcmVsb2FkID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgIGxldCBQNUNvbnN0cnVjdG9yID0gdGhpcy5zZXR0aW5ncy5wNTtcbiAgICAgICAgbGV0IHByZWxvYWQ7XG4gICAgICAgIGlmIChQNUNvbnN0cnVjdG9yLnA1KSB7XG4gICAgICAgICAgcHJlbG9hZCA9IFA1Q29uc3RydWN0b3IucHJlbG9hZDtcbiAgICAgICAgICBQNUNvbnN0cnVjdG9yID0gUDVDb25zdHJ1Y3Rvci5wNTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSBza2V0Y2ggc2V0dXA7IGRpc2FibGUgbG9vcCwgc2V0IHNpemluZywgZXRjLlxuICAgICAgICBjb25zdCBwNVNrZXRjaCA9IHA1ID0+IHtcbiAgICAgICAgICAvLyBIb29rIGluIHByZWxvYWQgaWYgbmVjZXNzYXJ5XG4gICAgICAgICAgaWYgKHByZWxvYWQpIHA1LnByZWxvYWQgPSAoKSA9PiBwcmVsb2FkKHA1KTtcbiAgICAgICAgICBwNS5zZXR1cCA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIGNvbnN0IGlzR0wgPSB0aGlzLnNldHRpbmdzLmNvbnRleHQgPT09ICd3ZWJnbCc7XG4gICAgICAgICAgICBjb25zdCByZW5kZXJlciA9IGlzR0wgPyBwNS5XRUJHTCA6IHA1LlAyRDtcbiAgICAgICAgICAgIHA1Lm5vTG9vcCgpO1xuICAgICAgICAgICAgcDUucGl4ZWxEZW5zaXR5KHByb3BzLnBpeGVsUmF0aW8pO1xuICAgICAgICAgICAgcDUuY3JlYXRlQ2FudmFzKHByb3BzLnZpZXdwb3J0V2lkdGgsIHByb3BzLnZpZXdwb3J0SGVpZ2h0LCByZW5kZXJlcik7XG4gICAgICAgICAgICBpZiAoaXNHTCAmJiB0aGlzLnNldHRpbmdzLmF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgICAgcDUuc2V0QXR0cmlidXRlcyh0aGlzLnNldHRpbmdzLmF0dHJpYnV0ZXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSh7IHA1LCBjYW52YXM6IHA1LmNhbnZhcywgY29udGV4dDogcDUuX3JlbmRlcmVyLmRyYXdpbmdDb250ZXh0IH0pO1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgIH07XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gU3VwcG9ydCBnbG9iYWwgYW5kIGluc3RhbmNlIFA1LmpzIG1vZGVzXG4gICAgICAgIGlmICh0eXBlb2YgUDVDb25zdHJ1Y3RvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIG5ldyBQNUNvbnN0cnVjdG9yKHA1U2tldGNoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHdpbmRvdy5jcmVhdGVDYW52YXMgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInsgcDUgfSBzZXR0aW5nIGlzIHBhc3NlZCBidXQgY2FuJ3QgZmluZCBwNS5qcyBpbiBnbG9iYWwgKHdpbmRvdykgc2NvcGUuIE1heWJlIHlvdSBkaWQgbm90IGNyZWF0ZSBpdCBnbG9iYWxseT9cXG5uZXcgcDUoKTsgLy8gPC0tIGF0dGFjaGVzIHRvIGdsb2JhbCBzY29wZVwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcDVTa2V0Y2god2luZG93KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByZWxvYWQudGhlbigoKSA9PiB7XG4gICAgICAvLyBMb2FkIHRoZSB1c2VyJ3Mgc2tldGNoXG4gICAgICBsZXQgbG9hZGVyID0gY3JlYXRlU2tldGNoKHRoaXMucHJvcHMpO1xuICAgICAgaWYgKCFpc1Byb21pc2UobG9hZGVyKSkge1xuICAgICAgICBsb2FkZXIgPSBQcm9taXNlLnJlc29sdmUobG9hZGVyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsb2FkZXI7XG4gICAgfSkudGhlbihza2V0Y2ggPT4ge1xuICAgICAgaWYgKCFza2V0Y2gpIHNrZXRjaCA9IHt9O1xuICAgICAgdGhpcy5fc2tldGNoID0gc2tldGNoO1xuXG4gICAgICAvLyBPbmNlIHRoZSBza2V0Y2ggaXMgbG9hZGVkIHdlIGNhbiBhZGQgdGhlIGV2ZW50c1xuICAgICAgaWYgKGlzQnJvd3NlcigpKSB7XG4gICAgICAgIHRoaXMuX2tleWJvYXJkU2hvcnRjdXRzLmF0dGFjaCgpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5fcmVzaXplSGFuZGxlcik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3Bvc3RSZW5kZXIoKTtcblxuICAgICAgLy8gVGhlIGluaXRpYWwgcmVzaXplKCkgaW4gdGhlIGNvbnN0cnVjdG9yIHdpbGwgbm90IGhhdmVcbiAgICAgIC8vIHRyaWdnZXJlZCBhIHJlc2l6ZSgpIGV2ZW50IG9uIHRoZSBza2V0Y2gsIHNpbmNlIGl0IHdhcyBiZWZvcmVcbiAgICAgIC8vIHRoZSBza2V0Y2ggd2FzIGxvYWRlZC4gU28gd2Ugc2VuZCB0aGUgc2lnbmFsIGhlcmUsIGFsbG93aW5nXG4gICAgICAvLyB1c2VycyB0byByZWFjdCB0byB0aGUgaW5pdGlhbCBzaXplIGJlZm9yZSBmaXJzdCByZW5kZXIuXG4gICAgICB0aGlzLl9zaXplQ2hhbmdlZCgpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgIGNvbnNvbGUud2FybignQ291bGQgbm90IHN0YXJ0IHNrZXRjaCwgdGhlIGFzeW5jIGxvYWRpbmcgZnVuY3Rpb24gcmVqZWN0ZWQgd2l0aCBhbiBlcnJvcjpcXG4gICAgRXJyb3I6ICcgKyBlcnIubWVzc2FnZSk7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2tldGNoTWFuYWdlcjtcbiIsImltcG9ydCBTa2V0Y2hNYW5hZ2VyIGZyb20gJy4vY29yZS9Ta2V0Y2hNYW5hZ2VyJztcbmltcG9ydCBQYXBlclNpemVzIGZyb20gJy4vcGFwZXItc2l6ZXMnO1xuaW1wb3J0IHsgZ2V0Q2xpZW50QVBJIH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCBkZWZpbmVkIGZyb20gJ2RlZmluZWQnO1xuXG5jb25zdCBDQUNIRSA9ICdob3QtaWQtY2FjaGUnO1xuY29uc3QgcnVudGltZUNvbGxpc2lvbnMgPSBbXTtcblxuZnVuY3Rpb24gaXNIb3RSZWxvYWQgKCkge1xuICBjb25zdCBjbGllbnQgPSBnZXRDbGllbnRBUEkoKTtcbiAgcmV0dXJuIGNsaWVudCAmJiBjbGllbnQuaG90O1xufVxuXG5mdW5jdGlvbiBjYWNoZUdldCAoaWQpIHtcbiAgY29uc3QgY2xpZW50ID0gZ2V0Q2xpZW50QVBJKCk7XG4gIGlmICghY2xpZW50KSByZXR1cm4gdW5kZWZpbmVkO1xuICBjbGllbnRbQ0FDSEVdID0gY2xpZW50W0NBQ0hFXSB8fCB7fTtcbiAgcmV0dXJuIGNsaWVudFtDQUNIRV1baWRdO1xufVxuXG5mdW5jdGlvbiBjYWNoZVB1dCAoaWQsIGRhdGEpIHtcbiAgY29uc3QgY2xpZW50ID0gZ2V0Q2xpZW50QVBJKCk7XG4gIGlmICghY2xpZW50KSByZXR1cm4gdW5kZWZpbmVkO1xuICBjbGllbnRbQ0FDSEVdID0gY2xpZW50W0NBQ0hFXSB8fCB7fTtcbiAgY2xpZW50W0NBQ0hFXVtpZF0gPSBkYXRhO1xufVxuXG5mdW5jdGlvbiBnZXRUaW1lUHJvcCAob2xkTWFuYWdlciwgbmV3U2V0dGluZ3MpIHtcbiAgLy8gU3RhdGljIHNrZXRjaGVzIGlnbm9yZSB0aGUgdGltZSBwZXJzaXN0ZW5jeVxuICByZXR1cm4gbmV3U2V0dGluZ3MuYW5pbWF0ZSA/IHsgdGltZTogb2xkTWFuYWdlci5wcm9wcy50aW1lIH0gOiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGNhbnZhc1NrZXRjaCAoc2tldGNoLCBzZXR0aW5ncyA9IHt9KSB7XG4gIGlmIChzZXR0aW5ncy5wNSkge1xuICAgIGlmIChzZXR0aW5ncy5jYW52YXMgfHwgKHNldHRpbmdzLmNvbnRleHQgJiYgdHlwZW9mIHNldHRpbmdzLmNvbnRleHQgIT09ICdzdHJpbmcnKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbiB7IHA1IH0gbW9kZSwgeW91IGNhbid0IHBhc3MgeW91ciBvd24gY2FudmFzIG9yIGNvbnRleHQsIHVubGVzcyB0aGUgY29udGV4dCBpcyBhIFwid2ViZ2xcIiBvciBcIjJkXCIgc3RyaW5nYCk7XG4gICAgfVxuXG4gICAgLy8gRG8gbm90IGNyZWF0ZSBhIGNhbnZhcyBvbiBzdGFydHVwLCBzaW5jZSBQNS5qcyBkb2VzIHRoYXQgZm9yIHVzXG4gICAgY29uc3QgY29udGV4dCA9IHR5cGVvZiBzZXR0aW5ncy5jb250ZXh0ID09PSAnc3RyaW5nJyA/IHNldHRpbmdzLmNvbnRleHQgOiBmYWxzZTtcbiAgICBzZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIHNldHRpbmdzLCB7IGNhbnZhczogZmFsc2UsIGNvbnRleHQgfSk7XG4gIH1cblxuICBjb25zdCBpc0hvdCA9IGlzSG90UmVsb2FkKCk7XG4gIGxldCBob3RJRDtcbiAgaWYgKGlzSG90KSB7XG4gICAgLy8gVXNlIGEgbWFnaWMgbmFtZSBieSBkZWZhdWx0LCBmb3JjZSB1c2VyIHRvIGRlZmluZSBlYWNoIHNrZXRjaCBpZiB0aGV5XG4gICAgLy8gcmVxdWlyZSBtb3JlIHRoYW4gb25lIGluIGFuIGFwcGxpY2F0aW9uLiBPcGVuIHRvIG90aGVyIGlkZWFzIG9uIGhvdyB0byB0YWNrbGVcbiAgICAvLyB0aGlzIGFzIHdlbGwuLi5cbiAgICBob3RJRCA9IGRlZmluZWQoc2V0dGluZ3MuaWQsICckX19ERUZBVUxUX0NBTlZBU19TS0VUQ0hfSURfXyQnKTtcbiAgfVxuICBsZXQgaXNJbmplY3RpbmcgPSBpc0hvdCAmJiB0eXBlb2YgaG90SUQgPT09ICdzdHJpbmcnO1xuXG4gIGlmIChpc0luamVjdGluZyAmJiBydW50aW1lQ29sbGlzaW9ucy5pbmNsdWRlcyhob3RJRCkpIHtcbiAgICBjb25zb2xlLndhcm4oYFdhcm5pbmc6IFlvdSBoYXZlIG11bHRpcGxlIGNhbGxzIHRvIGNhbnZhc1NrZXRjaCgpIGluIC0taG90IG1vZGUuIFlvdSBtdXN0IHBhc3MgdW5pcXVlIHsgaWQgfSBzdHJpbmdzIGluIHNldHRpbmdzIHRvIGVuYWJsZSBob3QgcmVsb2FkIGFjcm9zcyBtdWx0aXBsZSBza2V0Y2hlcy4gYCwgaG90SUQpO1xuICAgIGlzSW5qZWN0aW5nID0gZmFsc2U7XG4gIH1cblxuICBsZXQgcHJlbG9hZCA9IFByb21pc2UucmVzb2x2ZSgpO1xuXG4gIGlmIChpc0luamVjdGluZykge1xuICAgIC8vIE1hcmsgdGhpcyBhcyBhbHJlYWR5IHNwb3R0ZWQgaW4gdGhpcyBydW50aW1lIGluc3RhbmNlXG4gICAgcnVudGltZUNvbGxpc2lvbnMucHVzaChob3RJRCk7XG5cbiAgICBjb25zdCBwcmV2aW91c0RhdGEgPSBjYWNoZUdldChob3RJRCk7XG4gICAgaWYgKHByZXZpb3VzRGF0YSkge1xuICAgICAgY29uc3QgbmV4dCA9ICgpID0+IHtcbiAgICAgICAgLy8gR3JhYiBuZXcgcHJvcHMgZnJvbSBvbGQgc2tldGNoIGluc3RhbmNlXG4gICAgICAgIGNvbnN0IG5ld1Byb3BzID0gZ2V0VGltZVByb3AocHJldmlvdXNEYXRhLm1hbmFnZXIsIHNldHRpbmdzKTtcbiAgICAgICAgLy8gRGVzdHJveSB0aGUgb2xkIGluc3RhbmNlXG4gICAgICAgIHByZXZpb3VzRGF0YS5tYW5hZ2VyLmRlc3Ryb3koKTtcbiAgICAgICAgLy8gUGFzcyBhbG9uZyBuZXcgcHJvcHNcbiAgICAgICAgcmV0dXJuIG5ld1Byb3BzO1xuICAgICAgfTtcblxuICAgICAgLy8gTW92ZSBhbG9uZyB0aGUgbmV4dCBkYXRhLi4uXG4gICAgICBwcmVsb2FkID0gcHJldmlvdXNEYXRhLmxvYWQudGhlbihuZXh0KS5jYXRjaChuZXh0KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcHJlbG9hZC50aGVuKG5ld1Byb3BzID0+IHtcbiAgICBjb25zdCBtYW5hZ2VyID0gbmV3IFNrZXRjaE1hbmFnZXIoKTtcbiAgICBsZXQgcmVzdWx0O1xuICAgIGlmIChza2V0Y2gpIHtcbiAgICAgIC8vIE1lcmdlIHdpdGggaW5jb21pbmcgZGF0YVxuICAgICAgc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBzZXR0aW5ncywgbmV3UHJvcHMpO1xuXG4gICAgICAvLyBBcHBseSBzZXR0aW5ncyBhbmQgY3JlYXRlIGEgY2FudmFzXG4gICAgICBtYW5hZ2VyLnNldHVwKHNldHRpbmdzKTtcblxuICAgICAgLy8gTW91bnQgdG8gRE9NXG4gICAgICBtYW5hZ2VyLm1vdW50KCk7XG5cbiAgICAgIC8vIGxvYWQgdGhlIHNrZXRjaCBmaXJzdFxuICAgICAgcmVzdWx0ID0gbWFuYWdlci5sb2FkQW5kUnVuKHNrZXRjaCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdCA9IFByb21pc2UucmVzb2x2ZShtYW5hZ2VyKTtcbiAgICB9XG4gICAgaWYgKGlzSW5qZWN0aW5nKSB7XG4gICAgICBjYWNoZVB1dChob3RJRCwgeyBsb2FkOiByZXN1bHQsIG1hbmFnZXIgfSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0pO1xufVxuXG4vLyBUT0RPOiBGaWd1cmUgb3V0IGEgbmljZSB3YXkgdG8gZXhwb3J0IHRoaW5ncy5cbmNhbnZhc1NrZXRjaC5jYW52YXNTa2V0Y2ggPSBjYW52YXNTa2V0Y2g7XG5jYW52YXNTa2V0Y2guUGFwZXJTaXplcyA9IFBhcGVyU2l6ZXM7XG5cbmV4cG9ydCBkZWZhdWx0IGNhbnZhc1NrZXRjaDtcbiIsInZhciBkZWZpbmVkID0gcmVxdWlyZSgnZGVmaW5lZCcpO1xudmFyIHVuaXRzID0gWyAnbW0nLCAnY20nLCAnbScsICdwYycsICdwdCcsICdpbicsICdmdCcsICdweCcgXTtcblxudmFyIGNvbnZlcnNpb25zID0ge1xuICAvLyBtZXRyaWNcbiAgbToge1xuICAgIHN5c3RlbTogJ21ldHJpYycsXG4gICAgZmFjdG9yOiAxXG4gIH0sXG4gIGNtOiB7XG4gICAgc3lzdGVtOiAnbWV0cmljJyxcbiAgICBmYWN0b3I6IDEgLyAxMDBcbiAgfSxcbiAgbW06IHtcbiAgICBzeXN0ZW06ICdtZXRyaWMnLFxuICAgIGZhY3RvcjogMSAvIDEwMDBcbiAgfSxcbiAgLy8gaW1wZXJpYWxcbiAgcHQ6IHtcbiAgICBzeXN0ZW06ICdpbXBlcmlhbCcsXG4gICAgZmFjdG9yOiAxIC8gNzJcbiAgfSxcbiAgcGM6IHtcbiAgICBzeXN0ZW06ICdpbXBlcmlhbCcsXG4gICAgZmFjdG9yOiAxIC8gNlxuICB9LFxuICBpbjoge1xuICAgIHN5c3RlbTogJ2ltcGVyaWFsJyxcbiAgICBmYWN0b3I6IDFcbiAgfSxcbiAgZnQ6IHtcbiAgICBzeXN0ZW06ICdpbXBlcmlhbCcsXG4gICAgZmFjdG9yOiAxMlxuICB9XG59O1xuXG5jb25zdCBhbmNob3JzID0ge1xuICBtZXRyaWM6IHtcbiAgICB1bml0OiAnbScsXG4gICAgcmF0aW86IDEgLyAwLjAyNTRcbiAgfSxcbiAgaW1wZXJpYWw6IHtcbiAgICB1bml0OiAnaW4nLFxuICAgIHJhdGlvOiAwLjAyNTRcbiAgfVxufTtcblxuZnVuY3Rpb24gcm91bmQgKHZhbHVlLCBkZWNpbWFscykge1xuICByZXR1cm4gTnVtYmVyKE1hdGgucm91bmQodmFsdWUgKyAnZScgKyBkZWNpbWFscykgKyAnZS0nICsgZGVjaW1hbHMpO1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0RGlzdGFuY2UgKHZhbHVlLCBmcm9tVW5pdCwgdG9Vbml0LCBvcHRzKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdudW1iZXInIHx8ICFpc0Zpbml0ZSh2YWx1ZSkpIHRocm93IG5ldyBFcnJvcignVmFsdWUgbXVzdCBiZSBhIGZpbml0ZSBudW1iZXInKTtcbiAgaWYgKCFmcm9tVW5pdCB8fCAhdG9Vbml0KSB0aHJvdyBuZXcgRXJyb3IoJ011c3Qgc3BlY2lmeSBmcm9tIGFuZCB0byB1bml0cycpO1xuXG4gIG9wdHMgPSBvcHRzIHx8IHt9O1xuICB2YXIgcGl4ZWxzUGVySW5jaCA9IGRlZmluZWQob3B0cy5waXhlbHNQZXJJbmNoLCA5Nik7XG4gIHZhciBwcmVjaXNpb24gPSBvcHRzLnByZWNpc2lvbjtcbiAgdmFyIHJvdW5kUGl4ZWwgPSBvcHRzLnJvdW5kUGl4ZWwgIT09IGZhbHNlO1xuXG4gIGZyb21Vbml0ID0gZnJvbVVuaXQudG9Mb3dlckNhc2UoKTtcbiAgdG9Vbml0ID0gdG9Vbml0LnRvTG93ZXJDYXNlKCk7XG5cbiAgaWYgKHVuaXRzLmluZGV4T2YoZnJvbVVuaXQpID09PSAtMSkgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGZyb20gdW5pdCBcIicgKyBmcm9tVW5pdCArICdcIiwgbXVzdCBiZSBvbmUgb2Y6ICcgKyB1bml0cy5qb2luKCcsICcpKTtcbiAgaWYgKHVuaXRzLmluZGV4T2YodG9Vbml0KSA9PT0gLTEpIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBmcm9tIHVuaXQgXCInICsgdG9Vbml0ICsgJ1wiLCBtdXN0IGJlIG9uZSBvZjogJyArIHVuaXRzLmpvaW4oJywgJykpO1xuXG4gIGlmIChmcm9tVW5pdCA9PT0gdG9Vbml0KSB7XG4gICAgLy8gV2UgZG9uJ3QgbmVlZCB0byBjb252ZXJ0IGZyb20gQSB0byBCIHNpbmNlIHRoZXkgYXJlIHRoZSBzYW1lIGFscmVhZHlcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICB2YXIgdG9GYWN0b3IgPSAxO1xuICB2YXIgZnJvbUZhY3RvciA9IDE7XG4gIHZhciBpc1RvUGl4ZWwgPSBmYWxzZTtcblxuICBpZiAoZnJvbVVuaXQgPT09ICdweCcpIHtcbiAgICBmcm9tRmFjdG9yID0gMSAvIHBpeGVsc1BlckluY2g7XG4gICAgZnJvbVVuaXQgPSAnaW4nO1xuICB9XG4gIGlmICh0b1VuaXQgPT09ICdweCcpIHtcbiAgICBpc1RvUGl4ZWwgPSB0cnVlO1xuICAgIHRvRmFjdG9yID0gcGl4ZWxzUGVySW5jaDtcbiAgICB0b1VuaXQgPSAnaW4nO1xuICB9XG5cbiAgdmFyIGZyb21Vbml0RGF0YSA9IGNvbnZlcnNpb25zW2Zyb21Vbml0XTtcbiAgdmFyIHRvVW5pdERhdGEgPSBjb252ZXJzaW9uc1t0b1VuaXRdO1xuXG4gIC8vIHNvdXJjZSB0byBhbmNob3IgaW5zaWRlIHNvdXJjZSdzIHN5c3RlbVxuICB2YXIgYW5jaG9yID0gdmFsdWUgKiBmcm9tVW5pdERhdGEuZmFjdG9yICogZnJvbUZhY3RvcjtcblxuICAvLyBpZiBzeXN0ZW1zIGRpZmZlciwgY29udmVydCBvbmUgdG8gYW5vdGhlclxuICBpZiAoZnJvbVVuaXREYXRhLnN5c3RlbSAhPT0gdG9Vbml0RGF0YS5zeXN0ZW0pIHtcbiAgICAvLyByZWd1bGFyICdtJyB0byAnaW4nIGFuZCBzbyBmb3J0aFxuICAgIGFuY2hvciAqPSBhbmNob3JzW2Zyb21Vbml0RGF0YS5zeXN0ZW1dLnJhdGlvO1xuICB9XG5cbiAgdmFyIHJlc3VsdCA9IGFuY2hvciAvIHRvVW5pdERhdGEuZmFjdG9yICogdG9GYWN0b3I7XG4gIGlmIChpc1RvUGl4ZWwgJiYgcm91bmRQaXhlbCkge1xuICAgIHJlc3VsdCA9IE1hdGgucm91bmQocmVzdWx0KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgcHJlY2lzaW9uID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZShwcmVjaXNpb24pKSB7XG4gICAgcmVzdWx0ID0gcm91bmQocmVzdWx0LCBwcmVjaXNpb24pO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY29udmVydERpc3RhbmNlO1xubW9kdWxlLmV4cG9ydHMudW5pdHMgPSB1bml0cztcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHNbaV0gIT09IHVuZGVmaW5lZCkgcmV0dXJuIGFyZ3VtZW50c1tpXTtcbiAgICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHM9W1tcIiM2OWQyZTdcIixcIiNhN2RiZDhcIixcIiNlMGU0Y2NcIixcIiNmMzg2MzBcIixcIiNmYTY5MDBcIl0sW1wiI2ZlNDM2NVwiLFwiI2ZjOWQ5YVwiLFwiI2Y5Y2RhZFwiLFwiI2M4YzhhOVwiLFwiIzgzYWY5YlwiXSxbXCIjZWNkMDc4XCIsXCIjZDk1YjQzXCIsXCIjYzAyOTQyXCIsXCIjNTQyNDM3XCIsXCIjNTM3NzdhXCJdLFtcIiM1NTYyNzBcIixcIiM0ZWNkYzRcIixcIiNjN2Y0NjRcIixcIiNmZjZiNmJcIixcIiNjNDRkNThcIl0sW1wiIzc3NGYzOFwiLFwiI2UwOGU3OVwiLFwiI2YxZDRhZlwiLFwiI2VjZTVjZVwiLFwiI2M1ZTBkY1wiXSxbXCIjZThkZGNiXCIsXCIjY2RiMzgwXCIsXCIjMDM2NTY0XCIsXCIjMDMzNjQ5XCIsXCIjMDMxNjM0XCJdLFtcIiM0OTBhM2RcIixcIiNiZDE1NTBcIixcIiNlOTdmMDJcIixcIiNmOGNhMDBcIixcIiM4YTliMGZcIl0sW1wiIzU5NGY0ZlwiLFwiIzU0Nzk4MFwiLFwiIzQ1YWRhOFwiLFwiIzlkZTBhZFwiLFwiI2U1ZmNjMlwiXSxbXCIjMDBhMGIwXCIsXCIjNmE0YTNjXCIsXCIjY2MzMzNmXCIsXCIjZWI2ODQxXCIsXCIjZWRjOTUxXCJdLFtcIiNlOTRlNzdcIixcIiNkNjgxODlcIixcIiNjNmE0OWFcIixcIiNjNmU1ZDlcIixcIiNmNGVhZDVcIl0sW1wiIzNmYjhhZlwiLFwiIzdmYzdhZlwiLFwiI2RhZDhhN1wiLFwiI2ZmOWU5ZFwiLFwiI2ZmM2Q3ZlwiXSxbXCIjZDljZWIyXCIsXCIjOTQ4Yzc1XCIsXCIjZDVkZWQ5XCIsXCIjN2E2YTUzXCIsXCIjOTliMmI3XCJdLFtcIiNmZmZmZmZcIixcIiNjYmU4NmJcIixcIiNmMmU5ZTFcIixcIiMxYzE0MGRcIixcIiNjYmU4NmJcIl0sW1wiI2VmZmZjZFwiLFwiI2RjZTliZVwiLFwiIzU1NTE1MlwiLFwiIzJlMjYzM1wiLFwiIzk5MTczY1wiXSxbXCIjMzQzODM4XCIsXCIjMDA1ZjZiXCIsXCIjMDA4YzllXCIsXCIjMDBiNGNjXCIsXCIjMDBkZmZjXCJdLFtcIiM0MTNlNGFcIixcIiM3MzYyNmVcIixcIiNiMzgxODRcIixcIiNmMGI0OWVcIixcIiNmN2U0YmVcIl0sW1wiI2ZmNGU1MFwiLFwiI2ZjOTEzYVwiLFwiI2Y5ZDQyM1wiLFwiI2VkZTU3NFwiLFwiI2UxZjVjNFwiXSxbXCIjOTliODk4XCIsXCIjZmVjZWE4XCIsXCIjZmY4NDdjXCIsXCIjZTg0YTVmXCIsXCIjMmEzNjNiXCJdLFtcIiM2NTU2NDNcIixcIiM4MGJjYTNcIixcIiNmNmY3YmRcIixcIiNlNmFjMjdcIixcIiNiZjRkMjhcIl0sW1wiIzAwYThjNlwiLFwiIzQwYzBjYlwiLFwiI2Y5ZjJlN1wiLFwiI2FlZTIzOVwiLFwiIzhmYmUwMFwiXSxbXCIjMzUxMzMwXCIsXCIjNDI0MjU0XCIsXCIjNjQ5MDhhXCIsXCIjZThjYWE0XCIsXCIjY2MyYTQxXCJdLFtcIiM1NTQyMzZcIixcIiNmNzc4MjVcIixcIiNkM2NlM2RcIixcIiNmMWVmYTVcIixcIiM2MGI5OWFcIl0sW1wiI2ZmOTkwMFwiLFwiIzQyNDI0MlwiLFwiI2U5ZTllOVwiLFwiI2JjYmNiY1wiLFwiIzMyOTliYlwiXSxbXCIjNWQ0MTU3XCIsXCIjODM4Njg5XCIsXCIjYThjYWJhXCIsXCIjY2FkN2IyXCIsXCIjZWJlM2FhXCJdLFtcIiM4YzIzMThcIixcIiM1ZThjNmFcIixcIiM4OGE2NWVcIixcIiNiZmIzNWFcIixcIiNmMmM0NWFcIl0sW1wiI2ZhZDA4OVwiLFwiI2ZmOWM1YlwiLFwiI2Y1NjM0YVwiLFwiI2VkMzAzY1wiLFwiIzNiODE4M1wiXSxbXCIjZmY0MjQyXCIsXCIjZjRmYWQyXCIsXCIjZDRlZTVlXCIsXCIjZTFlZGI5XCIsXCIjZjBmMmViXCJdLFtcIiNkMWU3NTFcIixcIiNmZmZmZmZcIixcIiMwMDAwMDBcIixcIiM0ZGJjZTlcIixcIiMyNmFkZTRcIl0sW1wiI2Y4YjE5NVwiLFwiI2Y2NzI4MFwiLFwiI2MwNmM4NFwiLFwiIzZjNWI3YlwiLFwiIzM1NWM3ZFwiXSxbXCIjMWI2NzZiXCIsXCIjNTE5NTQ4XCIsXCIjODhjNDI1XCIsXCIjYmVmMjAyXCIsXCIjZWFmZGU2XCJdLFtcIiNiY2JkYWNcIixcIiNjZmJlMjdcIixcIiNmMjc0MzVcIixcIiNmMDI0NzVcIixcIiMzYjJkMzhcIl0sW1wiIzVlNDEyZlwiLFwiI2ZjZWJiNlwiLFwiIzc4YzBhOFwiLFwiI2YwNzgxOFwiLFwiI2YwYTgzMFwiXSxbXCIjNDUyNjMyXCIsXCIjOTEyMDRkXCIsXCIjZTQ4NDRhXCIsXCIjZThiZjU2XCIsXCIjZTJmN2NlXCJdLFtcIiNlZWU2YWJcIixcIiNjNWJjOGVcIixcIiM2OTY3NThcIixcIiM0NTQ4NGJcIixcIiMzNjM5M2JcIl0sW1wiI2YwZDhhOFwiLFwiIzNkMWMwMFwiLFwiIzg2YjhiMVwiLFwiI2YyZDY5NFwiLFwiI2ZhMmEwMFwiXSxbXCIjZjA0MTU1XCIsXCIjZmY4MjNhXCIsXCIjZjJmMjZmXCIsXCIjZmZmN2JkXCIsXCIjOTVjZmI3XCJdLFtcIiMyYTA0NGFcIixcIiMwYjJlNTlcIixcIiMwZDY3NTlcIixcIiM3YWIzMTdcIixcIiNhMGM1NWZcIl0sW1wiI2JiYmI4OFwiLFwiI2NjYzY4ZFwiLFwiI2VlZGQ5OVwiLFwiI2VlYzI5MFwiLFwiI2VlYWE4OFwiXSxbXCIjYjlkN2Q5XCIsXCIjNjY4Mjg0XCIsXCIjMmEyODI5XCIsXCIjNDkzNzM2XCIsXCIjN2IzYjNiXCJdLFtcIiNiM2NjNTdcIixcIiNlY2YwODFcIixcIiNmZmJlNDBcIixcIiNlZjc0NmZcIixcIiNhYjNlNWJcIl0sW1wiI2EzYTk0OFwiLFwiI2VkYjkyZVwiLFwiI2Y4NTkzMVwiLFwiI2NlMTgzNlwiLFwiIzAwOTk4OVwiXSxbXCIjNjc5MTdhXCIsXCIjMTcwNDA5XCIsXCIjYjhhZjAzXCIsXCIjY2NiZjgyXCIsXCIjZTMzMjU4XCJdLFtcIiNlOGQ1YjdcIixcIiMwZTI0MzBcIixcIiNmYzNhNTFcIixcIiNmNWIzNDlcIixcIiNlOGQ1YjlcIl0sW1wiI2FhYjNhYlwiLFwiI2M0Y2JiN1wiLFwiI2ViZWZjOVwiLFwiI2VlZTBiN1wiLFwiI2U4Y2FhZlwiXSxbXCIjMzAwMDMwXCIsXCIjNDgwMDQ4XCIsXCIjNjAxODQ4XCIsXCIjYzA0ODQ4XCIsXCIjZjA3MjQxXCJdLFtcIiNhYjUyNmJcIixcIiNiY2EyOTdcIixcIiNjNWNlYWVcIixcIiNmMGUyYTRcIixcIiNmNGViYzNcIl0sW1wiIzYwNzg0OFwiLFwiIzc4OTA0OFwiLFwiI2MwZDg2MFwiLFwiI2YwZjBkOFwiLFwiIzYwNDg0OFwiXSxbXCIjYThlNmNlXCIsXCIjZGNlZGMyXCIsXCIjZmZkM2I1XCIsXCIjZmZhYWE2XCIsXCIjZmY4Yzk0XCJdLFtcIiMzZTQxNDdcIixcIiNmZmZlZGZcIixcIiNkZmJhNjlcIixcIiM1YTJlMmVcIixcIiMyYTJjMzFcIl0sW1wiI2I2ZDhjMFwiLFwiI2M4ZDliZlwiLFwiI2RhZGFiZFwiLFwiI2VjZGJiY1wiLFwiI2ZlZGNiYVwiXSxbXCIjZmMzNTRjXCIsXCIjMjkyMjFmXCIsXCIjMTM3NDdkXCIsXCIjMGFiZmJjXCIsXCIjZmNmN2M1XCJdLFtcIiMxYzIxMzBcIixcIiMwMjhmNzZcIixcIiNiM2UwOTlcIixcIiNmZmVhYWRcIixcIiNkMTQzMzRcIl0sW1wiI2VkZWJlNlwiLFwiI2Q2ZTFjN1wiLFwiIzk0YzdiNlwiLFwiIzQwM2IzM1wiLFwiI2QzNjQzYlwiXSxbXCIjY2MwYzM5XCIsXCIjZTY3ODFlXCIsXCIjYzhjZjAyXCIsXCIjZjhmY2MxXCIsXCIjMTY5M2E3XCJdLFtcIiNkYWQ2Y2FcIixcIiMxYmIwY2VcIixcIiM0Zjg2OTlcIixcIiM2YTVlNzJcIixcIiM1NjM0NDRcIl0sW1wiI2E3YzViZFwiLFwiI2U1ZGRjYlwiLFwiI2ViN2I1OVwiLFwiI2NmNDY0N1wiLFwiIzUyNDY1NlwiXSxbXCIjZmRmMWNjXCIsXCIjYzZkNmI4XCIsXCIjOTg3ZjY5XCIsXCIjZTNhZDQwXCIsXCIjZmNkMDM2XCJdLFtcIiM1YzMyM2VcIixcIiNhODI3NDNcIixcIiNlMTVlMzJcIixcIiNjMGQyM2VcIixcIiNlNWYwNGNcIl0sW1wiIzIzMGYyYlwiLFwiI2YyMWQ0MVwiLFwiI2ViZWJiY1wiLFwiI2JjZTNjNVwiLFwiIzgyYjNhZVwiXSxbXCIjYjlkM2IwXCIsXCIjODFiZGE0XCIsXCIjYjI4Nzc0XCIsXCIjZjg4Zjc5XCIsXCIjZjZhYTkzXCJdLFtcIiMzYTExMWNcIixcIiM1NzQ5NTFcIixcIiM4Mzk4OGVcIixcIiNiY2RlYTVcIixcIiNlNmY5YmNcIl0sW1wiIzVlMzkyOVwiLFwiI2NkOGM1MlwiLFwiI2I3ZDFhM1wiLFwiI2RlZThiZVwiLFwiI2ZjZjdkM1wiXSxbXCIjMWMwMTEzXCIsXCIjNmIwMTAzXCIsXCIjYTMwMDA2XCIsXCIjYzIxYTAxXCIsXCIjZjAzYzAyXCJdLFtcIiMzODJmMzJcIixcIiNmZmVhZjJcIixcIiNmY2Q5ZTVcIixcIiNmYmM1ZDhcIixcIiNmMTM5NmRcIl0sW1wiI2UzZGZiYVwiLFwiI2M4ZDZiZlwiLFwiIzkzY2NjNlwiLFwiIzZjYmRiNVwiLFwiIzFhMWYxZVwiXSxbXCIjMDAwMDAwXCIsXCIjOWYxMTFiXCIsXCIjYjExNjIzXCIsXCIjMjkyYzM3XCIsXCIjY2NjY2NjXCJdLFtcIiNjMWIzOThcIixcIiM2MDU5NTFcIixcIiNmYmVlYzJcIixcIiM2MWE2YWJcIixcIiNhY2NlYzBcIl0sW1wiIzhkY2NhZFwiLFwiIzk4ODg2NFwiLFwiI2ZlYTZhMlwiLFwiI2Y5ZDZhY1wiLFwiI2ZmZTlhZlwiXSxbXCIjZjZmNmY2XCIsXCIjZThlOGU4XCIsXCIjMzMzMzMzXCIsXCIjOTkwMTAwXCIsXCIjYjkwNTA0XCJdLFtcIiMxYjMyNWZcIixcIiM5Y2M0ZTRcIixcIiNlOWYyZjlcIixcIiMzYTg5YzlcIixcIiNmMjZjNGZcIl0sW1wiIzVlOWZhM1wiLFwiI2RjZDFiNFwiLFwiI2ZhYjg3ZlwiLFwiI2Y4N2U3YlwiLFwiI2IwNTU3NFwiXSxbXCIjOTUxZjJiXCIsXCIjZjVmNGQ3XCIsXCIjZTBkZmIxXCIsXCIjYTVhMzZjXCIsXCIjNTM1MjMzXCJdLFtcIiM0MTNkM2RcIixcIiMwNDAwMDRcIixcIiNjOGZmMDBcIixcIiNmYTAyM2NcIixcIiM0YjAwMGZcIl0sW1wiI2VmZjNjZFwiLFwiI2IyZDViYVwiLFwiIzYxYWRhMFwiLFwiIzI0OGY4ZFwiLFwiIzYwNTA2M1wiXSxbXCIjMmQyZDI5XCIsXCIjMjE1YTZkXCIsXCIjM2NhMmEyXCIsXCIjOTJjN2EzXCIsXCIjZGZlY2U2XCJdLFtcIiNjZmZmZGRcIixcIiNiNGRlYzFcIixcIiM1YzU4NjNcIixcIiNhODUxNjNcIixcIiNmZjFmNGNcIl0sW1wiIzRlMzk1ZFwiLFwiIzgyNzA4NVwiLFwiIzhlYmU5NFwiLFwiI2NjZmM4ZVwiLFwiI2RjNWIzZVwiXSxbXCIjOWRjOWFjXCIsXCIjZmZmZWM3XCIsXCIjZjU2MjE4XCIsXCIjZmY5ZDJlXCIsXCIjOTE5MTY3XCJdLFtcIiNhMWRiYjJcIixcIiNmZWU1YWRcIixcIiNmYWNhNjZcIixcIiNmN2E1NDFcIixcIiNmNDVkNGNcIl0sW1wiI2ZmZWZkM1wiLFwiI2ZmZmVlNFwiLFwiI2QwZWNlYVwiLFwiIzlmZDZkMlwiLFwiIzhiN2E1ZVwiXSxbXCIjYThhN2E3XCIsXCIjY2M1MjdhXCIsXCIjZTgxNzVkXCIsXCIjNDc0NzQ3XCIsXCIjMzYzNjM2XCJdLFtcIiNmZmVkYmZcIixcIiNmNzgwM2NcIixcIiNmNTQ4MjhcIixcIiMyZTBkMjNcIixcIiNmOGU0YzFcIl0sW1wiI2Y4ZWRkMVwiLFwiI2Q4OGE4YVwiLFwiIzQ3NDg0M1wiLFwiIzlkOWQ5M1wiLFwiI2M1Y2ZjNlwiXSxbXCIjZjM4YThhXCIsXCIjNTU0NDNkXCIsXCIjYTBjYWI1XCIsXCIjY2RlOWNhXCIsXCIjZjFlZGQwXCJdLFtcIiM0ZTRkNGFcIixcIiMzNTM0MzJcIixcIiM5NGJhNjVcIixcIiMyNzkwYjBcIixcIiMyYjRlNzJcIl0sW1wiIzBjYTViMFwiLFwiIzRlM2YzMFwiLFwiI2ZlZmVlYlwiLFwiI2Y4ZjRlNFwiLFwiI2E1YjNhYVwiXSxbXCIjYTcwMjY3XCIsXCIjZjEwYzQ5XCIsXCIjZmI2YjQxXCIsXCIjZjZkODZiXCIsXCIjMzM5MTk0XCJdLFtcIiM5ZDdlNzlcIixcIiNjY2FjOTVcIixcIiM5YTk0N2NcIixcIiM3NDhiODNcIixcIiM1Yjc1NmNcIl0sW1wiI2VkZjZlZVwiLFwiI2QxYzA4OVwiLFwiI2IzMjA0ZFwiLFwiIzQxMmUyOFwiLFwiIzE1MTEwMVwiXSxbXCIjMDQ2ZDhiXCIsXCIjMzA5MjkyXCIsXCIjMmZiOGFjXCIsXCIjOTNhNDJhXCIsXCIjZWNiZTEzXCJdLFtcIiM0ZDNiM2JcIixcIiNkZTYyNjJcIixcIiNmZmI4OGNcIixcIiNmZmQwYjNcIixcIiNmNWUwZDNcIl0sW1wiI2ZmZmJiN1wiLFwiI2E2ZjZhZlwiLFwiIzY2YjZhYlwiLFwiIzViN2M4ZFwiLFwiIzRmMjk1OFwiXSxbXCIjZmYwMDNjXCIsXCIjZmY4YTAwXCIsXCIjZmFiZTI4XCIsXCIjODhjMTAwXCIsXCIjMDBjMTc2XCJdLFtcIiNmY2ZlZjVcIixcIiNlOWZmZTFcIixcIiNjZGNmYjdcIixcIiNkNmU2YzNcIixcIiNmYWZiZTNcIl0sW1wiIzljZGRjOFwiLFwiI2JmZDhhZFwiLFwiI2RkZDlhYlwiLFwiI2Y3YWY2M1wiLFwiIzYzM2QyZVwiXSxbXCIjMzAyNjFjXCIsXCIjNDAzODMxXCIsXCIjMzY1NDRmXCIsXCIjMWY1ZjYxXCIsXCIjMGI4MTg1XCJdLFtcIiNkMTMxM2RcIixcIiNlNTYyNWNcIixcIiNmOWJmNzZcIixcIiM4ZWIyYzVcIixcIiM2MTUzNzVcIl0sW1wiI2ZmZTE4MVwiLFwiI2VlZTllNVwiLFwiI2ZhZDNiMlwiLFwiI2ZmYmE3ZlwiLFwiI2ZmOWM5N1wiXSxbXCIjYWFmZjAwXCIsXCIjZmZhYTAwXCIsXCIjZmYwMGFhXCIsXCIjYWEwMGZmXCIsXCIjMDBhYWZmXCJdLFtcIiNjMjQxMmRcIixcIiNkMWFhMzRcIixcIiNhN2E4NDRcIixcIiNhNDY1ODNcIixcIiM1YTFlNGFcIl1dIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIHdpZHRoID0gMjU2Oy8vIGVhY2ggUkM0IG91dHB1dCBpcyAwIDw9IHggPCAyNTZcclxudmFyIGNodW5rcyA9IDY7Ly8gYXQgbGVhc3Qgc2l4IFJDNCBvdXRwdXRzIGZvciBlYWNoIGRvdWJsZVxyXG52YXIgZGlnaXRzID0gNTI7Ly8gdGhlcmUgYXJlIDUyIHNpZ25pZmljYW50IGRpZ2l0cyBpbiBhIGRvdWJsZVxyXG52YXIgcG9vbCA9IFtdOy8vIHBvb2w6IGVudHJvcHkgcG9vbCBzdGFydHMgZW1wdHlcclxudmFyIEdMT0JBTCA9IHR5cGVvZiBnbG9iYWwgPT09ICd1bmRlZmluZWQnID8gd2luZG93IDogZ2xvYmFsO1xyXG5cclxuLy9cclxuLy8gVGhlIGZvbGxvd2luZyBjb25zdGFudHMgYXJlIHJlbGF0ZWQgdG8gSUVFRSA3NTQgbGltaXRzLlxyXG4vL1xyXG52YXIgc3RhcnRkZW5vbSA9IE1hdGgucG93KHdpZHRoLCBjaHVua3MpLFxyXG4gICAgc2lnbmlmaWNhbmNlID0gTWF0aC5wb3coMiwgZGlnaXRzKSxcclxuICAgIG92ZXJmbG93ID0gc2lnbmlmaWNhbmNlICogMixcclxuICAgIG1hc2sgPSB3aWR0aCAtIDE7XHJcblxyXG5cclxudmFyIG9sZFJhbmRvbSA9IE1hdGgucmFuZG9tO1xyXG5cclxuLy9cclxuLy8gc2VlZHJhbmRvbSgpXHJcbi8vIFRoaXMgaXMgdGhlIHNlZWRyYW5kb20gZnVuY3Rpb24gZGVzY3JpYmVkIGFib3ZlLlxyXG4vL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNlZWQsIG9wdGlvbnMpIHtcclxuICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmdsb2JhbCA9PT0gdHJ1ZSkge1xyXG4gICAgb3B0aW9ucy5nbG9iYWwgPSBmYWxzZTtcclxuICAgIE1hdGgucmFuZG9tID0gbW9kdWxlLmV4cG9ydHMoc2VlZCwgb3B0aW9ucyk7XHJcbiAgICBvcHRpb25zLmdsb2JhbCA9IHRydWU7XHJcbiAgICByZXR1cm4gTWF0aC5yYW5kb207XHJcbiAgfVxyXG4gIHZhciB1c2VfZW50cm9weSA9IChvcHRpb25zICYmIG9wdGlvbnMuZW50cm9weSkgfHwgZmFsc2U7XHJcbiAgdmFyIGtleSA9IFtdO1xyXG5cclxuICAvLyBGbGF0dGVuIHRoZSBzZWVkIHN0cmluZyBvciBidWlsZCBvbmUgZnJvbSBsb2NhbCBlbnRyb3B5IGlmIG5lZWRlZC5cclxuICB2YXIgc2hvcnRzZWVkID0gbWl4a2V5KGZsYXR0ZW4oXHJcbiAgICB1c2VfZW50cm9weSA/IFtzZWVkLCB0b3N0cmluZyhwb29sKV0gOlxyXG4gICAgMCBpbiBhcmd1bWVudHMgPyBzZWVkIDogYXV0b3NlZWQoKSwgMyksIGtleSk7XHJcblxyXG4gIC8vIFVzZSB0aGUgc2VlZCB0byBpbml0aWFsaXplIGFuIEFSQzQgZ2VuZXJhdG9yLlxyXG4gIHZhciBhcmM0ID0gbmV3IEFSQzQoa2V5KTtcclxuXHJcbiAgLy8gTWl4IHRoZSByYW5kb21uZXNzIGludG8gYWNjdW11bGF0ZWQgZW50cm9weS5cclxuICBtaXhrZXkodG9zdHJpbmcoYXJjNC5TKSwgcG9vbCk7XHJcblxyXG4gIC8vIE92ZXJyaWRlIE1hdGgucmFuZG9tXHJcblxyXG4gIC8vIFRoaXMgZnVuY3Rpb24gcmV0dXJucyBhIHJhbmRvbSBkb3VibGUgaW4gWzAsIDEpIHRoYXQgY29udGFpbnNcclxuICAvLyByYW5kb21uZXNzIGluIGV2ZXJ5IGJpdCBvZiB0aGUgbWFudGlzc2Egb2YgdGhlIElFRUUgNzU0IHZhbHVlLlxyXG5cclxuICByZXR1cm4gZnVuY3Rpb24oKSB7ICAgICAgICAgLy8gQ2xvc3VyZSB0byByZXR1cm4gYSByYW5kb20gZG91YmxlOlxyXG4gICAgdmFyIG4gPSBhcmM0LmcoY2h1bmtzKSwgICAgICAgICAgICAgLy8gU3RhcnQgd2l0aCBhIG51bWVyYXRvciBuIDwgMiBeIDQ4XHJcbiAgICAgICAgZCA9IHN0YXJ0ZGVub20sICAgICAgICAgICAgICAgICAvLyAgIGFuZCBkZW5vbWluYXRvciBkID0gMiBeIDQ4LlxyXG4gICAgICAgIHggPSAwOyAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBhbmQgbm8gJ2V4dHJhIGxhc3QgYnl0ZScuXHJcbiAgICB3aGlsZSAobiA8IHNpZ25pZmljYW5jZSkgeyAgICAgICAgICAvLyBGaWxsIHVwIGFsbCBzaWduaWZpY2FudCBkaWdpdHMgYnlcclxuICAgICAgbiA9IChuICsgeCkgKiB3aWR0aDsgICAgICAgICAgICAgIC8vICAgc2hpZnRpbmcgbnVtZXJhdG9yIGFuZFxyXG4gICAgICBkICo9IHdpZHRoOyAgICAgICAgICAgICAgICAgICAgICAgLy8gICBkZW5vbWluYXRvciBhbmQgZ2VuZXJhdGluZyBhXHJcbiAgICAgIHggPSBhcmM0LmcoMSk7ICAgICAgICAgICAgICAgICAgICAvLyAgIG5ldyBsZWFzdC1zaWduaWZpY2FudC1ieXRlLlxyXG4gICAgfVxyXG4gICAgd2hpbGUgKG4gPj0gb3ZlcmZsb3cpIHsgICAgICAgICAgICAgLy8gVG8gYXZvaWQgcm91bmRpbmcgdXAsIGJlZm9yZSBhZGRpbmdcclxuICAgICAgbiAvPSAyOyAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgbGFzdCBieXRlLCBzaGlmdCBldmVyeXRoaW5nXHJcbiAgICAgIGQgLz0gMjsgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIHJpZ2h0IHVzaW5nIGludGVnZXIgTWF0aCB1bnRpbFxyXG4gICAgICB4ID4+Pj0gMTsgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICB3ZSBoYXZlIGV4YWN0bHkgdGhlIGRlc2lyZWQgYml0cy5cclxuICAgIH1cclxuICAgIHJldHVybiAobiArIHgpIC8gZDsgICAgICAgICAgICAgICAgIC8vIEZvcm0gdGhlIG51bWJlciB3aXRoaW4gWzAsIDEpLlxyXG4gIH07XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5yZXNldEdsb2JhbCA9IGZ1bmN0aW9uICgpIHtcclxuICBNYXRoLnJhbmRvbSA9IG9sZFJhbmRvbTtcclxufTtcclxuXHJcbi8vXHJcbi8vIEFSQzRcclxuLy9cclxuLy8gQW4gQVJDNCBpbXBsZW1lbnRhdGlvbi4gIFRoZSBjb25zdHJ1Y3RvciB0YWtlcyBhIGtleSBpbiB0aGUgZm9ybSBvZlxyXG4vLyBhbiBhcnJheSBvZiBhdCBtb3N0ICh3aWR0aCkgaW50ZWdlcnMgdGhhdCBzaG91bGQgYmUgMCA8PSB4IDwgKHdpZHRoKS5cclxuLy9cclxuLy8gVGhlIGcoY291bnQpIG1ldGhvZCByZXR1cm5zIGEgcHNldWRvcmFuZG9tIGludGVnZXIgdGhhdCBjb25jYXRlbmF0ZXNcclxuLy8gdGhlIG5leHQgKGNvdW50KSBvdXRwdXRzIGZyb20gQVJDNC4gIEl0cyByZXR1cm4gdmFsdWUgaXMgYSBudW1iZXIgeFxyXG4vLyB0aGF0IGlzIGluIHRoZSByYW5nZSAwIDw9IHggPCAod2lkdGggXiBjb3VudCkuXHJcbi8vXHJcbi8qKiBAY29uc3RydWN0b3IgKi9cclxuZnVuY3Rpb24gQVJDNChrZXkpIHtcclxuICB2YXIgdCwga2V5bGVuID0ga2V5Lmxlbmd0aCxcclxuICAgICAgbWUgPSB0aGlzLCBpID0gMCwgaiA9IG1lLmkgPSBtZS5qID0gMCwgcyA9IG1lLlMgPSBbXTtcclxuXHJcbiAgLy8gVGhlIGVtcHR5IGtleSBbXSBpcyB0cmVhdGVkIGFzIFswXS5cclxuICBpZiAoIWtleWxlbikgeyBrZXkgPSBba2V5bGVuKytdOyB9XHJcblxyXG4gIC8vIFNldCB1cCBTIHVzaW5nIHRoZSBzdGFuZGFyZCBrZXkgc2NoZWR1bGluZyBhbGdvcml0aG0uXHJcbiAgd2hpbGUgKGkgPCB3aWR0aCkge1xyXG4gICAgc1tpXSA9IGkrKztcclxuICB9XHJcbiAgZm9yIChpID0gMDsgaSA8IHdpZHRoOyBpKyspIHtcclxuICAgIHNbaV0gPSBzW2ogPSBtYXNrICYgKGogKyBrZXlbaSAlIGtleWxlbl0gKyAodCA9IHNbaV0pKV07XHJcbiAgICBzW2pdID0gdDtcclxuICB9XHJcblxyXG4gIC8vIFRoZSBcImdcIiBtZXRob2QgcmV0dXJucyB0aGUgbmV4dCAoY291bnQpIG91dHB1dHMgYXMgb25lIG51bWJlci5cclxuICAobWUuZyA9IGZ1bmN0aW9uKGNvdW50KSB7XHJcbiAgICAvLyBVc2luZyBpbnN0YW5jZSBtZW1iZXJzIGluc3RlYWQgb2YgY2xvc3VyZSBzdGF0ZSBuZWFybHkgZG91YmxlcyBzcGVlZC5cclxuICAgIHZhciB0LCByID0gMCxcclxuICAgICAgICBpID0gbWUuaSwgaiA9IG1lLmosIHMgPSBtZS5TO1xyXG4gICAgd2hpbGUgKGNvdW50LS0pIHtcclxuICAgICAgdCA9IHNbaSA9IG1hc2sgJiAoaSArIDEpXTtcclxuICAgICAgciA9IHIgKiB3aWR0aCArIHNbbWFzayAmICgoc1tpXSA9IHNbaiA9IG1hc2sgJiAoaiArIHQpXSkgKyAoc1tqXSA9IHQpKV07XHJcbiAgICB9XHJcbiAgICBtZS5pID0gaTsgbWUuaiA9IGo7XHJcbiAgICByZXR1cm4gcjtcclxuICAgIC8vIEZvciByb2J1c3QgdW5wcmVkaWN0YWJpbGl0eSBkaXNjYXJkIGFuIGluaXRpYWwgYmF0Y2ggb2YgdmFsdWVzLlxyXG4gICAgLy8gU2VlIGh0dHA6Ly93d3cucnNhLmNvbS9yc2FsYWJzL25vZGUuYXNwP2lkPTIwMDlcclxuICB9KSh3aWR0aCk7XHJcbn1cclxuXHJcbi8vXHJcbi8vIGZsYXR0ZW4oKVxyXG4vLyBDb252ZXJ0cyBhbiBvYmplY3QgdHJlZSB0byBuZXN0ZWQgYXJyYXlzIG9mIHN0cmluZ3MuXHJcbi8vXHJcbmZ1bmN0aW9uIGZsYXR0ZW4ob2JqLCBkZXB0aCkge1xyXG4gIHZhciByZXN1bHQgPSBbXSwgdHlwID0gKHR5cGVvZiBvYmopWzBdLCBwcm9wO1xyXG4gIGlmIChkZXB0aCAmJiB0eXAgPT0gJ28nKSB7XHJcbiAgICBmb3IgKHByb3AgaW4gb2JqKSB7XHJcbiAgICAgIHRyeSB7IHJlc3VsdC5wdXNoKGZsYXR0ZW4ob2JqW3Byb3BdLCBkZXB0aCAtIDEpKTsgfSBjYXRjaCAoZSkge31cclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIChyZXN1bHQubGVuZ3RoID8gcmVzdWx0IDogdHlwID09ICdzJyA/IG9iaiA6IG9iaiArICdcXDAnKTtcclxufVxyXG5cclxuLy9cclxuLy8gbWl4a2V5KClcclxuLy8gTWl4ZXMgYSBzdHJpbmcgc2VlZCBpbnRvIGEga2V5IHRoYXQgaXMgYW4gYXJyYXkgb2YgaW50ZWdlcnMsIGFuZFxyXG4vLyByZXR1cm5zIGEgc2hvcnRlbmVkIHN0cmluZyBzZWVkIHRoYXQgaXMgZXF1aXZhbGVudCB0byB0aGUgcmVzdWx0IGtleS5cclxuLy9cclxuZnVuY3Rpb24gbWl4a2V5KHNlZWQsIGtleSkge1xyXG4gIHZhciBzdHJpbmdzZWVkID0gc2VlZCArICcnLCBzbWVhciwgaiA9IDA7XHJcbiAgd2hpbGUgKGogPCBzdHJpbmdzZWVkLmxlbmd0aCkge1xyXG4gICAga2V5W21hc2sgJiBqXSA9XHJcbiAgICAgIG1hc2sgJiAoKHNtZWFyIF49IGtleVttYXNrICYgal0gKiAxOSkgKyBzdHJpbmdzZWVkLmNoYXJDb2RlQXQoaisrKSk7XHJcbiAgfVxyXG4gIHJldHVybiB0b3N0cmluZyhrZXkpO1xyXG59XHJcblxyXG4vL1xyXG4vLyBhdXRvc2VlZCgpXHJcbi8vIFJldHVybnMgYW4gb2JqZWN0IGZvciBhdXRvc2VlZGluZywgdXNpbmcgd2luZG93LmNyeXB0byBpZiBhdmFpbGFibGUuXHJcbi8vXHJcbi8qKiBAcGFyYW0ge1VpbnQ4QXJyYXk9fSBzZWVkICovXHJcbmZ1bmN0aW9uIGF1dG9zZWVkKHNlZWQpIHtcclxuICB0cnkge1xyXG4gICAgR0xPQkFMLmNyeXB0by5nZXRSYW5kb21WYWx1ZXMoc2VlZCA9IG5ldyBVaW50OEFycmF5KHdpZHRoKSk7XHJcbiAgICByZXR1cm4gdG9zdHJpbmcoc2VlZCk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgcmV0dXJuIFsrbmV3IERhdGUsIEdMT0JBTCwgR0xPQkFMLm5hdmlnYXRvciAmJiBHTE9CQUwubmF2aWdhdG9yLnBsdWdpbnMsXHJcbiAgICAgICAgICAgIEdMT0JBTC5zY3JlZW4sIHRvc3RyaW5nKHBvb2wpXTtcclxuICB9XHJcbn1cclxuXHJcbi8vXHJcbi8vIHRvc3RyaW5nKClcclxuLy8gQ29udmVydHMgYW4gYXJyYXkgb2YgY2hhcmNvZGVzIHRvIGEgc3RyaW5nXHJcbi8vXHJcbmZ1bmN0aW9uIHRvc3RyaW5nKGEpIHtcclxuICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseSgwLCBhKTtcclxufVxyXG5cclxuLy9cclxuLy8gV2hlbiBzZWVkcmFuZG9tLmpzIGlzIGxvYWRlZCwgd2UgaW1tZWRpYXRlbHkgbWl4IGEgZmV3IGJpdHNcclxuLy8gZnJvbSB0aGUgYnVpbHQtaW4gUk5HIGludG8gdGhlIGVudHJvcHkgcG9vbC4gIEJlY2F1c2Ugd2UgZG9cclxuLy8gbm90IHdhbnQgdG8gaW50ZWZlcmUgd2l0aCBkZXRlcm1pbnN0aWMgUFJORyBzdGF0ZSBsYXRlcixcclxuLy8gc2VlZHJhbmRvbSB3aWxsIG5vdCBjYWxsIE1hdGgucmFuZG9tIG9uIGl0cyBvd24gYWdhaW4gYWZ0ZXJcclxuLy8gaW5pdGlhbGl6YXRpb24uXHJcbi8vXHJcbm1peGtleShNYXRoLnJhbmRvbSgpLCBwb29sKTtcclxuIiwiLypcbiAqIEEgZmFzdCBqYXZhc2NyaXB0IGltcGxlbWVudGF0aW9uIG9mIHNpbXBsZXggbm9pc2UgYnkgSm9uYXMgV2FnbmVyXG5cbkJhc2VkIG9uIGEgc3BlZWQtaW1wcm92ZWQgc2ltcGxleCBub2lzZSBhbGdvcml0aG0gZm9yIDJELCAzRCBhbmQgNEQgaW4gSmF2YS5cbldoaWNoIGlzIGJhc2VkIG9uIGV4YW1wbGUgY29kZSBieSBTdGVmYW4gR3VzdGF2c29uIChzdGVndUBpdG4ubGl1LnNlKS5cbldpdGggT3B0aW1pc2F0aW9ucyBieSBQZXRlciBFYXN0bWFuIChwZWFzdG1hbkBkcml6emxlLnN0YW5mb3JkLmVkdSkuXG5CZXR0ZXIgcmFuayBvcmRlcmluZyBtZXRob2QgYnkgU3RlZmFuIEd1c3RhdnNvbiBpbiAyMDEyLlxuXG5cbiBDb3B5cmlnaHQgKGMpIDIwMTggSm9uYXMgV2FnbmVyXG5cbiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiBTT0ZUV0FSRS5cbiAqL1xuKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyIEYyID0gMC41ICogKE1hdGguc3FydCgzLjApIC0gMS4wKTtcbiAgdmFyIEcyID0gKDMuMCAtIE1hdGguc3FydCgzLjApKSAvIDYuMDtcbiAgdmFyIEYzID0gMS4wIC8gMy4wO1xuICB2YXIgRzMgPSAxLjAgLyA2LjA7XG4gIHZhciBGNCA9IChNYXRoLnNxcnQoNS4wKSAtIDEuMCkgLyA0LjA7XG4gIHZhciBHNCA9ICg1LjAgLSBNYXRoLnNxcnQoNS4wKSkgLyAyMC4wO1xuXG4gIGZ1bmN0aW9uIFNpbXBsZXhOb2lzZShyYW5kb21PclNlZWQpIHtcbiAgICB2YXIgcmFuZG9tO1xuICAgIGlmICh0eXBlb2YgcmFuZG9tT3JTZWVkID09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJhbmRvbSA9IHJhbmRvbU9yU2VlZDtcbiAgICB9XG4gICAgZWxzZSBpZiAocmFuZG9tT3JTZWVkKSB7XG4gICAgICByYW5kb20gPSBhbGVhKHJhbmRvbU9yU2VlZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJhbmRvbSA9IE1hdGgucmFuZG9tO1xuICAgIH1cbiAgICB0aGlzLnAgPSBidWlsZFBlcm11dGF0aW9uVGFibGUocmFuZG9tKTtcbiAgICB0aGlzLnBlcm0gPSBuZXcgVWludDhBcnJheSg1MTIpO1xuICAgIHRoaXMucGVybU1vZDEyID0gbmV3IFVpbnQ4QXJyYXkoNTEyKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDUxMjsgaSsrKSB7XG4gICAgICB0aGlzLnBlcm1baV0gPSB0aGlzLnBbaSAmIDI1NV07XG4gICAgICB0aGlzLnBlcm1Nb2QxMltpXSA9IHRoaXMucGVybVtpXSAlIDEyO1xuICAgIH1cblxuICB9XG4gIFNpbXBsZXhOb2lzZS5wcm90b3R5cGUgPSB7XG4gICAgZ3JhZDM6IG5ldyBGbG9hdDMyQXJyYXkoWzEsIDEsIDAsXG4gICAgICAtMSwgMSwgMCxcbiAgICAgIDEsIC0xLCAwLFxuXG4gICAgICAtMSwgLTEsIDAsXG4gICAgICAxLCAwLCAxLFxuICAgICAgLTEsIDAsIDEsXG5cbiAgICAgIDEsIDAsIC0xLFxuICAgICAgLTEsIDAsIC0xLFxuICAgICAgMCwgMSwgMSxcblxuICAgICAgMCwgLTEsIDEsXG4gICAgICAwLCAxLCAtMSxcbiAgICAgIDAsIC0xLCAtMV0pLFxuICAgIGdyYWQ0OiBuZXcgRmxvYXQzMkFycmF5KFswLCAxLCAxLCAxLCAwLCAxLCAxLCAtMSwgMCwgMSwgLTEsIDEsIDAsIDEsIC0xLCAtMSxcbiAgICAgIDAsIC0xLCAxLCAxLCAwLCAtMSwgMSwgLTEsIDAsIC0xLCAtMSwgMSwgMCwgLTEsIC0xLCAtMSxcbiAgICAgIDEsIDAsIDEsIDEsIDEsIDAsIDEsIC0xLCAxLCAwLCAtMSwgMSwgMSwgMCwgLTEsIC0xLFxuICAgICAgLTEsIDAsIDEsIDEsIC0xLCAwLCAxLCAtMSwgLTEsIDAsIC0xLCAxLCAtMSwgMCwgLTEsIC0xLFxuICAgICAgMSwgMSwgMCwgMSwgMSwgMSwgMCwgLTEsIDEsIC0xLCAwLCAxLCAxLCAtMSwgMCwgLTEsXG4gICAgICAtMSwgMSwgMCwgMSwgLTEsIDEsIDAsIC0xLCAtMSwgLTEsIDAsIDEsIC0xLCAtMSwgMCwgLTEsXG4gICAgICAxLCAxLCAxLCAwLCAxLCAxLCAtMSwgMCwgMSwgLTEsIDEsIDAsIDEsIC0xLCAtMSwgMCxcbiAgICAgIC0xLCAxLCAxLCAwLCAtMSwgMSwgLTEsIDAsIC0xLCAtMSwgMSwgMCwgLTEsIC0xLCAtMSwgMF0pLFxuICAgIG5vaXNlMkQ6IGZ1bmN0aW9uKHhpbiwgeWluKSB7XG4gICAgICB2YXIgcGVybU1vZDEyID0gdGhpcy5wZXJtTW9kMTI7XG4gICAgICB2YXIgcGVybSA9IHRoaXMucGVybTtcbiAgICAgIHZhciBncmFkMyA9IHRoaXMuZ3JhZDM7XG4gICAgICB2YXIgbjAgPSAwOyAvLyBOb2lzZSBjb250cmlidXRpb25zIGZyb20gdGhlIHRocmVlIGNvcm5lcnNcbiAgICAgIHZhciBuMSA9IDA7XG4gICAgICB2YXIgbjIgPSAwO1xuICAgICAgLy8gU2tldyB0aGUgaW5wdXQgc3BhY2UgdG8gZGV0ZXJtaW5lIHdoaWNoIHNpbXBsZXggY2VsbCB3ZSdyZSBpblxuICAgICAgdmFyIHMgPSAoeGluICsgeWluKSAqIEYyOyAvLyBIYWlyeSBmYWN0b3IgZm9yIDJEXG4gICAgICB2YXIgaSA9IE1hdGguZmxvb3IoeGluICsgcyk7XG4gICAgICB2YXIgaiA9IE1hdGguZmxvb3IoeWluICsgcyk7XG4gICAgICB2YXIgdCA9IChpICsgaikgKiBHMjtcbiAgICAgIHZhciBYMCA9IGkgLSB0OyAvLyBVbnNrZXcgdGhlIGNlbGwgb3JpZ2luIGJhY2sgdG8gKHgseSkgc3BhY2VcbiAgICAgIHZhciBZMCA9IGogLSB0O1xuICAgICAgdmFyIHgwID0geGluIC0gWDA7IC8vIFRoZSB4LHkgZGlzdGFuY2VzIGZyb20gdGhlIGNlbGwgb3JpZ2luXG4gICAgICB2YXIgeTAgPSB5aW4gLSBZMDtcbiAgICAgIC8vIEZvciB0aGUgMkQgY2FzZSwgdGhlIHNpbXBsZXggc2hhcGUgaXMgYW4gZXF1aWxhdGVyYWwgdHJpYW5nbGUuXG4gICAgICAvLyBEZXRlcm1pbmUgd2hpY2ggc2ltcGxleCB3ZSBhcmUgaW4uXG4gICAgICB2YXIgaTEsIGoxOyAvLyBPZmZzZXRzIGZvciBzZWNvbmQgKG1pZGRsZSkgY29ybmVyIG9mIHNpbXBsZXggaW4gKGksaikgY29vcmRzXG4gICAgICBpZiAoeDAgPiB5MCkge1xuICAgICAgICBpMSA9IDE7XG4gICAgICAgIGoxID0gMDtcbiAgICAgIH0gLy8gbG93ZXIgdHJpYW5nbGUsIFhZIG9yZGVyOiAoMCwwKS0+KDEsMCktPigxLDEpXG4gICAgICBlbHNlIHtcbiAgICAgICAgaTEgPSAwO1xuICAgICAgICBqMSA9IDE7XG4gICAgICB9IC8vIHVwcGVyIHRyaWFuZ2xlLCBZWCBvcmRlcjogKDAsMCktPigwLDEpLT4oMSwxKVxuICAgICAgLy8gQSBzdGVwIG9mICgxLDApIGluIChpLGopIG1lYW5zIGEgc3RlcCBvZiAoMS1jLC1jKSBpbiAoeCx5KSwgYW5kXG4gICAgICAvLyBhIHN0ZXAgb2YgKDAsMSkgaW4gKGksaikgbWVhbnMgYSBzdGVwIG9mICgtYywxLWMpIGluICh4LHkpLCB3aGVyZVxuICAgICAgLy8gYyA9ICgzLXNxcnQoMykpLzZcbiAgICAgIHZhciB4MSA9IHgwIC0gaTEgKyBHMjsgLy8gT2Zmc2V0cyBmb3IgbWlkZGxlIGNvcm5lciBpbiAoeCx5KSB1bnNrZXdlZCBjb29yZHNcbiAgICAgIHZhciB5MSA9IHkwIC0gajEgKyBHMjtcbiAgICAgIHZhciB4MiA9IHgwIC0gMS4wICsgMi4wICogRzI7IC8vIE9mZnNldHMgZm9yIGxhc3QgY29ybmVyIGluICh4LHkpIHVuc2tld2VkIGNvb3Jkc1xuICAgICAgdmFyIHkyID0geTAgLSAxLjAgKyAyLjAgKiBHMjtcbiAgICAgIC8vIFdvcmsgb3V0IHRoZSBoYXNoZWQgZ3JhZGllbnQgaW5kaWNlcyBvZiB0aGUgdGhyZWUgc2ltcGxleCBjb3JuZXJzXG4gICAgICB2YXIgaWkgPSBpICYgMjU1O1xuICAgICAgdmFyIGpqID0gaiAmIDI1NTtcbiAgICAgIC8vIENhbGN1bGF0ZSB0aGUgY29udHJpYnV0aW9uIGZyb20gdGhlIHRocmVlIGNvcm5lcnNcbiAgICAgIHZhciB0MCA9IDAuNSAtIHgwICogeDAgLSB5MCAqIHkwO1xuICAgICAgaWYgKHQwID49IDApIHtcbiAgICAgICAgdmFyIGdpMCA9IHBlcm1Nb2QxMltpaSArIHBlcm1bampdXSAqIDM7XG4gICAgICAgIHQwICo9IHQwO1xuICAgICAgICBuMCA9IHQwICogdDAgKiAoZ3JhZDNbZ2kwXSAqIHgwICsgZ3JhZDNbZ2kwICsgMV0gKiB5MCk7IC8vICh4LHkpIG9mIGdyYWQzIHVzZWQgZm9yIDJEIGdyYWRpZW50XG4gICAgICB9XG4gICAgICB2YXIgdDEgPSAwLjUgLSB4MSAqIHgxIC0geTEgKiB5MTtcbiAgICAgIGlmICh0MSA+PSAwKSB7XG4gICAgICAgIHZhciBnaTEgPSBwZXJtTW9kMTJbaWkgKyBpMSArIHBlcm1bamogKyBqMV1dICogMztcbiAgICAgICAgdDEgKj0gdDE7XG4gICAgICAgIG4xID0gdDEgKiB0MSAqIChncmFkM1tnaTFdICogeDEgKyBncmFkM1tnaTEgKyAxXSAqIHkxKTtcbiAgICAgIH1cbiAgICAgIHZhciB0MiA9IDAuNSAtIHgyICogeDIgLSB5MiAqIHkyO1xuICAgICAgaWYgKHQyID49IDApIHtcbiAgICAgICAgdmFyIGdpMiA9IHBlcm1Nb2QxMltpaSArIDEgKyBwZXJtW2pqICsgMV1dICogMztcbiAgICAgICAgdDIgKj0gdDI7XG4gICAgICAgIG4yID0gdDIgKiB0MiAqIChncmFkM1tnaTJdICogeDIgKyBncmFkM1tnaTIgKyAxXSAqIHkyKTtcbiAgICAgIH1cbiAgICAgIC8vIEFkZCBjb250cmlidXRpb25zIGZyb20gZWFjaCBjb3JuZXIgdG8gZ2V0IHRoZSBmaW5hbCBub2lzZSB2YWx1ZS5cbiAgICAgIC8vIFRoZSByZXN1bHQgaXMgc2NhbGVkIHRvIHJldHVybiB2YWx1ZXMgaW4gdGhlIGludGVydmFsIFstMSwxXS5cbiAgICAgIHJldHVybiA3MC4wICogKG4wICsgbjEgKyBuMik7XG4gICAgfSxcbiAgICAvLyAzRCBzaW1wbGV4IG5vaXNlXG4gICAgbm9pc2UzRDogZnVuY3Rpb24oeGluLCB5aW4sIHppbikge1xuICAgICAgdmFyIHBlcm1Nb2QxMiA9IHRoaXMucGVybU1vZDEyO1xuICAgICAgdmFyIHBlcm0gPSB0aGlzLnBlcm07XG4gICAgICB2YXIgZ3JhZDMgPSB0aGlzLmdyYWQzO1xuICAgICAgdmFyIG4wLCBuMSwgbjIsIG4zOyAvLyBOb2lzZSBjb250cmlidXRpb25zIGZyb20gdGhlIGZvdXIgY29ybmVyc1xuICAgICAgLy8gU2tldyB0aGUgaW5wdXQgc3BhY2UgdG8gZGV0ZXJtaW5lIHdoaWNoIHNpbXBsZXggY2VsbCB3ZSdyZSBpblxuICAgICAgdmFyIHMgPSAoeGluICsgeWluICsgemluKSAqIEYzOyAvLyBWZXJ5IG5pY2UgYW5kIHNpbXBsZSBza2V3IGZhY3RvciBmb3IgM0RcbiAgICAgIHZhciBpID0gTWF0aC5mbG9vcih4aW4gKyBzKTtcbiAgICAgIHZhciBqID0gTWF0aC5mbG9vcih5aW4gKyBzKTtcbiAgICAgIHZhciBrID0gTWF0aC5mbG9vcih6aW4gKyBzKTtcbiAgICAgIHZhciB0ID0gKGkgKyBqICsgaykgKiBHMztcbiAgICAgIHZhciBYMCA9IGkgLSB0OyAvLyBVbnNrZXcgdGhlIGNlbGwgb3JpZ2luIGJhY2sgdG8gKHgseSx6KSBzcGFjZVxuICAgICAgdmFyIFkwID0gaiAtIHQ7XG4gICAgICB2YXIgWjAgPSBrIC0gdDtcbiAgICAgIHZhciB4MCA9IHhpbiAtIFgwOyAvLyBUaGUgeCx5LHogZGlzdGFuY2VzIGZyb20gdGhlIGNlbGwgb3JpZ2luXG4gICAgICB2YXIgeTAgPSB5aW4gLSBZMDtcbiAgICAgIHZhciB6MCA9IHppbiAtIFowO1xuICAgICAgLy8gRm9yIHRoZSAzRCBjYXNlLCB0aGUgc2ltcGxleCBzaGFwZSBpcyBhIHNsaWdodGx5IGlycmVndWxhciB0ZXRyYWhlZHJvbi5cbiAgICAgIC8vIERldGVybWluZSB3aGljaCBzaW1wbGV4IHdlIGFyZSBpbi5cbiAgICAgIHZhciBpMSwgajEsIGsxOyAvLyBPZmZzZXRzIGZvciBzZWNvbmQgY29ybmVyIG9mIHNpbXBsZXggaW4gKGksaixrKSBjb29yZHNcbiAgICAgIHZhciBpMiwgajIsIGsyOyAvLyBPZmZzZXRzIGZvciB0aGlyZCBjb3JuZXIgb2Ygc2ltcGxleCBpbiAoaSxqLGspIGNvb3Jkc1xuICAgICAgaWYgKHgwID49IHkwKSB7XG4gICAgICAgIGlmICh5MCA+PSB6MCkge1xuICAgICAgICAgIGkxID0gMTtcbiAgICAgICAgICBqMSA9IDA7XG4gICAgICAgICAgazEgPSAwO1xuICAgICAgICAgIGkyID0gMTtcbiAgICAgICAgICBqMiA9IDE7XG4gICAgICAgICAgazIgPSAwO1xuICAgICAgICB9IC8vIFggWSBaIG9yZGVyXG4gICAgICAgIGVsc2UgaWYgKHgwID49IHowKSB7XG4gICAgICAgICAgaTEgPSAxO1xuICAgICAgICAgIGoxID0gMDtcbiAgICAgICAgICBrMSA9IDA7XG4gICAgICAgICAgaTIgPSAxO1xuICAgICAgICAgIGoyID0gMDtcbiAgICAgICAgICBrMiA9IDE7XG4gICAgICAgIH0gLy8gWCBaIFkgb3JkZXJcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaTEgPSAwO1xuICAgICAgICAgIGoxID0gMDtcbiAgICAgICAgICBrMSA9IDE7XG4gICAgICAgICAgaTIgPSAxO1xuICAgICAgICAgIGoyID0gMDtcbiAgICAgICAgICBrMiA9IDE7XG4gICAgICAgIH0gLy8gWiBYIFkgb3JkZXJcbiAgICAgIH1cbiAgICAgIGVsc2UgeyAvLyB4MDx5MFxuICAgICAgICBpZiAoeTAgPCB6MCkge1xuICAgICAgICAgIGkxID0gMDtcbiAgICAgICAgICBqMSA9IDA7XG4gICAgICAgICAgazEgPSAxO1xuICAgICAgICAgIGkyID0gMDtcbiAgICAgICAgICBqMiA9IDE7XG4gICAgICAgICAgazIgPSAxO1xuICAgICAgICB9IC8vIFogWSBYIG9yZGVyXG4gICAgICAgIGVsc2UgaWYgKHgwIDwgejApIHtcbiAgICAgICAgICBpMSA9IDA7XG4gICAgICAgICAgajEgPSAxO1xuICAgICAgICAgIGsxID0gMDtcbiAgICAgICAgICBpMiA9IDA7XG4gICAgICAgICAgajIgPSAxO1xuICAgICAgICAgIGsyID0gMTtcbiAgICAgICAgfSAvLyBZIFogWCBvcmRlclxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpMSA9IDA7XG4gICAgICAgICAgajEgPSAxO1xuICAgICAgICAgIGsxID0gMDtcbiAgICAgICAgICBpMiA9IDE7XG4gICAgICAgICAgajIgPSAxO1xuICAgICAgICAgIGsyID0gMDtcbiAgICAgICAgfSAvLyBZIFggWiBvcmRlclxuICAgICAgfVxuICAgICAgLy8gQSBzdGVwIG9mICgxLDAsMCkgaW4gKGksaixrKSBtZWFucyBhIHN0ZXAgb2YgKDEtYywtYywtYykgaW4gKHgseSx6KSxcbiAgICAgIC8vIGEgc3RlcCBvZiAoMCwxLDApIGluIChpLGosaykgbWVhbnMgYSBzdGVwIG9mICgtYywxLWMsLWMpIGluICh4LHkseiksIGFuZFxuICAgICAgLy8gYSBzdGVwIG9mICgwLDAsMSkgaW4gKGksaixrKSBtZWFucyBhIHN0ZXAgb2YgKC1jLC1jLDEtYykgaW4gKHgseSx6KSwgd2hlcmVcbiAgICAgIC8vIGMgPSAxLzYuXG4gICAgICB2YXIgeDEgPSB4MCAtIGkxICsgRzM7IC8vIE9mZnNldHMgZm9yIHNlY29uZCBjb3JuZXIgaW4gKHgseSx6KSBjb29yZHNcbiAgICAgIHZhciB5MSA9IHkwIC0gajEgKyBHMztcbiAgICAgIHZhciB6MSA9IHowIC0gazEgKyBHMztcbiAgICAgIHZhciB4MiA9IHgwIC0gaTIgKyAyLjAgKiBHMzsgLy8gT2Zmc2V0cyBmb3IgdGhpcmQgY29ybmVyIGluICh4LHkseikgY29vcmRzXG4gICAgICB2YXIgeTIgPSB5MCAtIGoyICsgMi4wICogRzM7XG4gICAgICB2YXIgejIgPSB6MCAtIGsyICsgMi4wICogRzM7XG4gICAgICB2YXIgeDMgPSB4MCAtIDEuMCArIDMuMCAqIEczOyAvLyBPZmZzZXRzIGZvciBsYXN0IGNvcm5lciBpbiAoeCx5LHopIGNvb3Jkc1xuICAgICAgdmFyIHkzID0geTAgLSAxLjAgKyAzLjAgKiBHMztcbiAgICAgIHZhciB6MyA9IHowIC0gMS4wICsgMy4wICogRzM7XG4gICAgICAvLyBXb3JrIG91dCB0aGUgaGFzaGVkIGdyYWRpZW50IGluZGljZXMgb2YgdGhlIGZvdXIgc2ltcGxleCBjb3JuZXJzXG4gICAgICB2YXIgaWkgPSBpICYgMjU1O1xuICAgICAgdmFyIGpqID0gaiAmIDI1NTtcbiAgICAgIHZhciBrayA9IGsgJiAyNTU7XG4gICAgICAvLyBDYWxjdWxhdGUgdGhlIGNvbnRyaWJ1dGlvbiBmcm9tIHRoZSBmb3VyIGNvcm5lcnNcbiAgICAgIHZhciB0MCA9IDAuNiAtIHgwICogeDAgLSB5MCAqIHkwIC0gejAgKiB6MDtcbiAgICAgIGlmICh0MCA8IDApIG4wID0gMC4wO1xuICAgICAgZWxzZSB7XG4gICAgICAgIHZhciBnaTAgPSBwZXJtTW9kMTJbaWkgKyBwZXJtW2pqICsgcGVybVtra11dXSAqIDM7XG4gICAgICAgIHQwICo9IHQwO1xuICAgICAgICBuMCA9IHQwICogdDAgKiAoZ3JhZDNbZ2kwXSAqIHgwICsgZ3JhZDNbZ2kwICsgMV0gKiB5MCArIGdyYWQzW2dpMCArIDJdICogejApO1xuICAgICAgfVxuICAgICAgdmFyIHQxID0gMC42IC0geDEgKiB4MSAtIHkxICogeTEgLSB6MSAqIHoxO1xuICAgICAgaWYgKHQxIDwgMCkgbjEgPSAwLjA7XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFyIGdpMSA9IHBlcm1Nb2QxMltpaSArIGkxICsgcGVybVtqaiArIGoxICsgcGVybVtrayArIGsxXV1dICogMztcbiAgICAgICAgdDEgKj0gdDE7XG4gICAgICAgIG4xID0gdDEgKiB0MSAqIChncmFkM1tnaTFdICogeDEgKyBncmFkM1tnaTEgKyAxXSAqIHkxICsgZ3JhZDNbZ2kxICsgMl0gKiB6MSk7XG4gICAgICB9XG4gICAgICB2YXIgdDIgPSAwLjYgLSB4MiAqIHgyIC0geTIgKiB5MiAtIHoyICogejI7XG4gICAgICBpZiAodDIgPCAwKSBuMiA9IDAuMDtcbiAgICAgIGVsc2Uge1xuICAgICAgICB2YXIgZ2kyID0gcGVybU1vZDEyW2lpICsgaTIgKyBwZXJtW2pqICsgajIgKyBwZXJtW2trICsgazJdXV0gKiAzO1xuICAgICAgICB0MiAqPSB0MjtcbiAgICAgICAgbjIgPSB0MiAqIHQyICogKGdyYWQzW2dpMl0gKiB4MiArIGdyYWQzW2dpMiArIDFdICogeTIgKyBncmFkM1tnaTIgKyAyXSAqIHoyKTtcbiAgICAgIH1cbiAgICAgIHZhciB0MyA9IDAuNiAtIHgzICogeDMgLSB5MyAqIHkzIC0gejMgKiB6MztcbiAgICAgIGlmICh0MyA8IDApIG4zID0gMC4wO1xuICAgICAgZWxzZSB7XG4gICAgICAgIHZhciBnaTMgPSBwZXJtTW9kMTJbaWkgKyAxICsgcGVybVtqaiArIDEgKyBwZXJtW2trICsgMV1dXSAqIDM7XG4gICAgICAgIHQzICo9IHQzO1xuICAgICAgICBuMyA9IHQzICogdDMgKiAoZ3JhZDNbZ2kzXSAqIHgzICsgZ3JhZDNbZ2kzICsgMV0gKiB5MyArIGdyYWQzW2dpMyArIDJdICogejMpO1xuICAgICAgfVxuICAgICAgLy8gQWRkIGNvbnRyaWJ1dGlvbnMgZnJvbSBlYWNoIGNvcm5lciB0byBnZXQgdGhlIGZpbmFsIG5vaXNlIHZhbHVlLlxuICAgICAgLy8gVGhlIHJlc3VsdCBpcyBzY2FsZWQgdG8gc3RheSBqdXN0IGluc2lkZSBbLTEsMV1cbiAgICAgIHJldHVybiAzMi4wICogKG4wICsgbjEgKyBuMiArIG4zKTtcbiAgICB9LFxuICAgIC8vIDREIHNpbXBsZXggbm9pc2UsIGJldHRlciBzaW1wbGV4IHJhbmsgb3JkZXJpbmcgbWV0aG9kIDIwMTItMDMtMDlcbiAgICBub2lzZTREOiBmdW5jdGlvbih4LCB5LCB6LCB3KSB7XG4gICAgICB2YXIgcGVybSA9IHRoaXMucGVybTtcbiAgICAgIHZhciBncmFkNCA9IHRoaXMuZ3JhZDQ7XG5cbiAgICAgIHZhciBuMCwgbjEsIG4yLCBuMywgbjQ7IC8vIE5vaXNlIGNvbnRyaWJ1dGlvbnMgZnJvbSB0aGUgZml2ZSBjb3JuZXJzXG4gICAgICAvLyBTa2V3IHRoZSAoeCx5LHosdykgc3BhY2UgdG8gZGV0ZXJtaW5lIHdoaWNoIGNlbGwgb2YgMjQgc2ltcGxpY2VzIHdlJ3JlIGluXG4gICAgICB2YXIgcyA9ICh4ICsgeSArIHogKyB3KSAqIEY0OyAvLyBGYWN0b3IgZm9yIDREIHNrZXdpbmdcbiAgICAgIHZhciBpID0gTWF0aC5mbG9vcih4ICsgcyk7XG4gICAgICB2YXIgaiA9IE1hdGguZmxvb3IoeSArIHMpO1xuICAgICAgdmFyIGsgPSBNYXRoLmZsb29yKHogKyBzKTtcbiAgICAgIHZhciBsID0gTWF0aC5mbG9vcih3ICsgcyk7XG4gICAgICB2YXIgdCA9IChpICsgaiArIGsgKyBsKSAqIEc0OyAvLyBGYWN0b3IgZm9yIDREIHVuc2tld2luZ1xuICAgICAgdmFyIFgwID0gaSAtIHQ7IC8vIFVuc2tldyB0aGUgY2VsbCBvcmlnaW4gYmFjayB0byAoeCx5LHosdykgc3BhY2VcbiAgICAgIHZhciBZMCA9IGogLSB0O1xuICAgICAgdmFyIFowID0gayAtIHQ7XG4gICAgICB2YXIgVzAgPSBsIC0gdDtcbiAgICAgIHZhciB4MCA9IHggLSBYMDsgLy8gVGhlIHgseSx6LHcgZGlzdGFuY2VzIGZyb20gdGhlIGNlbGwgb3JpZ2luXG4gICAgICB2YXIgeTAgPSB5IC0gWTA7XG4gICAgICB2YXIgejAgPSB6IC0gWjA7XG4gICAgICB2YXIgdzAgPSB3IC0gVzA7XG4gICAgICAvLyBGb3IgdGhlIDREIGNhc2UsIHRoZSBzaW1wbGV4IGlzIGEgNEQgc2hhcGUgSSB3b24ndCBldmVuIHRyeSB0byBkZXNjcmliZS5cbiAgICAgIC8vIFRvIGZpbmQgb3V0IHdoaWNoIG9mIHRoZSAyNCBwb3NzaWJsZSBzaW1wbGljZXMgd2UncmUgaW4sIHdlIG5lZWQgdG9cbiAgICAgIC8vIGRldGVybWluZSB0aGUgbWFnbml0dWRlIG9yZGVyaW5nIG9mIHgwLCB5MCwgejAgYW5kIHcwLlxuICAgICAgLy8gU2l4IHBhaXItd2lzZSBjb21wYXJpc29ucyBhcmUgcGVyZm9ybWVkIGJldHdlZW4gZWFjaCBwb3NzaWJsZSBwYWlyXG4gICAgICAvLyBvZiB0aGUgZm91ciBjb29yZGluYXRlcywgYW5kIHRoZSByZXN1bHRzIGFyZSB1c2VkIHRvIHJhbmsgdGhlIG51bWJlcnMuXG4gICAgICB2YXIgcmFua3ggPSAwO1xuICAgICAgdmFyIHJhbmt5ID0gMDtcbiAgICAgIHZhciByYW5reiA9IDA7XG4gICAgICB2YXIgcmFua3cgPSAwO1xuICAgICAgaWYgKHgwID4geTApIHJhbmt4Kys7XG4gICAgICBlbHNlIHJhbmt5Kys7XG4gICAgICBpZiAoeDAgPiB6MCkgcmFua3grKztcbiAgICAgIGVsc2UgcmFua3orKztcbiAgICAgIGlmICh4MCA+IHcwKSByYW5reCsrO1xuICAgICAgZWxzZSByYW5rdysrO1xuICAgICAgaWYgKHkwID4gejApIHJhbmt5Kys7XG4gICAgICBlbHNlIHJhbmt6Kys7XG4gICAgICBpZiAoeTAgPiB3MCkgcmFua3krKztcbiAgICAgIGVsc2UgcmFua3crKztcbiAgICAgIGlmICh6MCA+IHcwKSByYW5reisrO1xuICAgICAgZWxzZSByYW5rdysrO1xuICAgICAgdmFyIGkxLCBqMSwgazEsIGwxOyAvLyBUaGUgaW50ZWdlciBvZmZzZXRzIGZvciB0aGUgc2Vjb25kIHNpbXBsZXggY29ybmVyXG4gICAgICB2YXIgaTIsIGoyLCBrMiwgbDI7IC8vIFRoZSBpbnRlZ2VyIG9mZnNldHMgZm9yIHRoZSB0aGlyZCBzaW1wbGV4IGNvcm5lclxuICAgICAgdmFyIGkzLCBqMywgazMsIGwzOyAvLyBUaGUgaW50ZWdlciBvZmZzZXRzIGZvciB0aGUgZm91cnRoIHNpbXBsZXggY29ybmVyXG4gICAgICAvLyBzaW1wbGV4W2NdIGlzIGEgNC12ZWN0b3Igd2l0aCB0aGUgbnVtYmVycyAwLCAxLCAyIGFuZCAzIGluIHNvbWUgb3JkZXIuXG4gICAgICAvLyBNYW55IHZhbHVlcyBvZiBjIHdpbGwgbmV2ZXIgb2NjdXIsIHNpbmNlIGUuZy4geD55Pno+dyBtYWtlcyB4PHosIHk8dyBhbmQgeDx3XG4gICAgICAvLyBpbXBvc3NpYmxlLiBPbmx5IHRoZSAyNCBpbmRpY2VzIHdoaWNoIGhhdmUgbm9uLXplcm8gZW50cmllcyBtYWtlIGFueSBzZW5zZS5cbiAgICAgIC8vIFdlIHVzZSBhIHRocmVzaG9sZGluZyB0byBzZXQgdGhlIGNvb3JkaW5hdGVzIGluIHR1cm4gZnJvbSB0aGUgbGFyZ2VzdCBtYWduaXR1ZGUuXG4gICAgICAvLyBSYW5rIDMgZGVub3RlcyB0aGUgbGFyZ2VzdCBjb29yZGluYXRlLlxuICAgICAgaTEgPSByYW5reCA+PSAzID8gMSA6IDA7XG4gICAgICBqMSA9IHJhbmt5ID49IDMgPyAxIDogMDtcbiAgICAgIGsxID0gcmFua3ogPj0gMyA/IDEgOiAwO1xuICAgICAgbDEgPSByYW5rdyA+PSAzID8gMSA6IDA7XG4gICAgICAvLyBSYW5rIDIgZGVub3RlcyB0aGUgc2Vjb25kIGxhcmdlc3QgY29vcmRpbmF0ZS5cbiAgICAgIGkyID0gcmFua3ggPj0gMiA/IDEgOiAwO1xuICAgICAgajIgPSByYW5reSA+PSAyID8gMSA6IDA7XG4gICAgICBrMiA9IHJhbmt6ID49IDIgPyAxIDogMDtcbiAgICAgIGwyID0gcmFua3cgPj0gMiA/IDEgOiAwO1xuICAgICAgLy8gUmFuayAxIGRlbm90ZXMgdGhlIHNlY29uZCBzbWFsbGVzdCBjb29yZGluYXRlLlxuICAgICAgaTMgPSByYW5reCA+PSAxID8gMSA6IDA7XG4gICAgICBqMyA9IHJhbmt5ID49IDEgPyAxIDogMDtcbiAgICAgIGszID0gcmFua3ogPj0gMSA/IDEgOiAwO1xuICAgICAgbDMgPSByYW5rdyA+PSAxID8gMSA6IDA7XG4gICAgICAvLyBUaGUgZmlmdGggY29ybmVyIGhhcyBhbGwgY29vcmRpbmF0ZSBvZmZzZXRzID0gMSwgc28gbm8gbmVlZCB0byBjb21wdXRlIHRoYXQuXG4gICAgICB2YXIgeDEgPSB4MCAtIGkxICsgRzQ7IC8vIE9mZnNldHMgZm9yIHNlY29uZCBjb3JuZXIgaW4gKHgseSx6LHcpIGNvb3Jkc1xuICAgICAgdmFyIHkxID0geTAgLSBqMSArIEc0O1xuICAgICAgdmFyIHoxID0gejAgLSBrMSArIEc0O1xuICAgICAgdmFyIHcxID0gdzAgLSBsMSArIEc0O1xuICAgICAgdmFyIHgyID0geDAgLSBpMiArIDIuMCAqIEc0OyAvLyBPZmZzZXRzIGZvciB0aGlyZCBjb3JuZXIgaW4gKHgseSx6LHcpIGNvb3Jkc1xuICAgICAgdmFyIHkyID0geTAgLSBqMiArIDIuMCAqIEc0O1xuICAgICAgdmFyIHoyID0gejAgLSBrMiArIDIuMCAqIEc0O1xuICAgICAgdmFyIHcyID0gdzAgLSBsMiArIDIuMCAqIEc0O1xuICAgICAgdmFyIHgzID0geDAgLSBpMyArIDMuMCAqIEc0OyAvLyBPZmZzZXRzIGZvciBmb3VydGggY29ybmVyIGluICh4LHkseix3KSBjb29yZHNcbiAgICAgIHZhciB5MyA9IHkwIC0gajMgKyAzLjAgKiBHNDtcbiAgICAgIHZhciB6MyA9IHowIC0gazMgKyAzLjAgKiBHNDtcbiAgICAgIHZhciB3MyA9IHcwIC0gbDMgKyAzLjAgKiBHNDtcbiAgICAgIHZhciB4NCA9IHgwIC0gMS4wICsgNC4wICogRzQ7IC8vIE9mZnNldHMgZm9yIGxhc3QgY29ybmVyIGluICh4LHkseix3KSBjb29yZHNcbiAgICAgIHZhciB5NCA9IHkwIC0gMS4wICsgNC4wICogRzQ7XG4gICAgICB2YXIgejQgPSB6MCAtIDEuMCArIDQuMCAqIEc0O1xuICAgICAgdmFyIHc0ID0gdzAgLSAxLjAgKyA0LjAgKiBHNDtcbiAgICAgIC8vIFdvcmsgb3V0IHRoZSBoYXNoZWQgZ3JhZGllbnQgaW5kaWNlcyBvZiB0aGUgZml2ZSBzaW1wbGV4IGNvcm5lcnNcbiAgICAgIHZhciBpaSA9IGkgJiAyNTU7XG4gICAgICB2YXIgamogPSBqICYgMjU1O1xuICAgICAgdmFyIGtrID0gayAmIDI1NTtcbiAgICAgIHZhciBsbCA9IGwgJiAyNTU7XG4gICAgICAvLyBDYWxjdWxhdGUgdGhlIGNvbnRyaWJ1dGlvbiBmcm9tIHRoZSBmaXZlIGNvcm5lcnNcbiAgICAgIHZhciB0MCA9IDAuNiAtIHgwICogeDAgLSB5MCAqIHkwIC0gejAgKiB6MCAtIHcwICogdzA7XG4gICAgICBpZiAodDAgPCAwKSBuMCA9IDAuMDtcbiAgICAgIGVsc2Uge1xuICAgICAgICB2YXIgZ2kwID0gKHBlcm1baWkgKyBwZXJtW2pqICsgcGVybVtrayArIHBlcm1bbGxdXV1dICUgMzIpICogNDtcbiAgICAgICAgdDAgKj0gdDA7XG4gICAgICAgIG4wID0gdDAgKiB0MCAqIChncmFkNFtnaTBdICogeDAgKyBncmFkNFtnaTAgKyAxXSAqIHkwICsgZ3JhZDRbZ2kwICsgMl0gKiB6MCArIGdyYWQ0W2dpMCArIDNdICogdzApO1xuICAgICAgfVxuICAgICAgdmFyIHQxID0gMC42IC0geDEgKiB4MSAtIHkxICogeTEgLSB6MSAqIHoxIC0gdzEgKiB3MTtcbiAgICAgIGlmICh0MSA8IDApIG4xID0gMC4wO1xuICAgICAgZWxzZSB7XG4gICAgICAgIHZhciBnaTEgPSAocGVybVtpaSArIGkxICsgcGVybVtqaiArIGoxICsgcGVybVtrayArIGsxICsgcGVybVtsbCArIGwxXV1dXSAlIDMyKSAqIDQ7XG4gICAgICAgIHQxICo9IHQxO1xuICAgICAgICBuMSA9IHQxICogdDEgKiAoZ3JhZDRbZ2kxXSAqIHgxICsgZ3JhZDRbZ2kxICsgMV0gKiB5MSArIGdyYWQ0W2dpMSArIDJdICogejEgKyBncmFkNFtnaTEgKyAzXSAqIHcxKTtcbiAgICAgIH1cbiAgICAgIHZhciB0MiA9IDAuNiAtIHgyICogeDIgLSB5MiAqIHkyIC0gejIgKiB6MiAtIHcyICogdzI7XG4gICAgICBpZiAodDIgPCAwKSBuMiA9IDAuMDtcbiAgICAgIGVsc2Uge1xuICAgICAgICB2YXIgZ2kyID0gKHBlcm1baWkgKyBpMiArIHBlcm1bamogKyBqMiArIHBlcm1ba2sgKyBrMiArIHBlcm1bbGwgKyBsMl1dXV0gJSAzMikgKiA0O1xuICAgICAgICB0MiAqPSB0MjtcbiAgICAgICAgbjIgPSB0MiAqIHQyICogKGdyYWQ0W2dpMl0gKiB4MiArIGdyYWQ0W2dpMiArIDFdICogeTIgKyBncmFkNFtnaTIgKyAyXSAqIHoyICsgZ3JhZDRbZ2kyICsgM10gKiB3Mik7XG4gICAgICB9XG4gICAgICB2YXIgdDMgPSAwLjYgLSB4MyAqIHgzIC0geTMgKiB5MyAtIHozICogejMgLSB3MyAqIHczO1xuICAgICAgaWYgKHQzIDwgMCkgbjMgPSAwLjA7XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFyIGdpMyA9IChwZXJtW2lpICsgaTMgKyBwZXJtW2pqICsgajMgKyBwZXJtW2trICsgazMgKyBwZXJtW2xsICsgbDNdXV1dICUgMzIpICogNDtcbiAgICAgICAgdDMgKj0gdDM7XG4gICAgICAgIG4zID0gdDMgKiB0MyAqIChncmFkNFtnaTNdICogeDMgKyBncmFkNFtnaTMgKyAxXSAqIHkzICsgZ3JhZDRbZ2kzICsgMl0gKiB6MyArIGdyYWQ0W2dpMyArIDNdICogdzMpO1xuICAgICAgfVxuICAgICAgdmFyIHQ0ID0gMC42IC0geDQgKiB4NCAtIHk0ICogeTQgLSB6NCAqIHo0IC0gdzQgKiB3NDtcbiAgICAgIGlmICh0NCA8IDApIG40ID0gMC4wO1xuICAgICAgZWxzZSB7XG4gICAgICAgIHZhciBnaTQgPSAocGVybVtpaSArIDEgKyBwZXJtW2pqICsgMSArIHBlcm1ba2sgKyAxICsgcGVybVtsbCArIDFdXV1dICUgMzIpICogNDtcbiAgICAgICAgdDQgKj0gdDQ7XG4gICAgICAgIG40ID0gdDQgKiB0NCAqIChncmFkNFtnaTRdICogeDQgKyBncmFkNFtnaTQgKyAxXSAqIHk0ICsgZ3JhZDRbZ2k0ICsgMl0gKiB6NCArIGdyYWQ0W2dpNCArIDNdICogdzQpO1xuICAgICAgfVxuICAgICAgLy8gU3VtIHVwIGFuZCBzY2FsZSB0aGUgcmVzdWx0IHRvIGNvdmVyIHRoZSByYW5nZSBbLTEsMV1cbiAgICAgIHJldHVybiAyNy4wICogKG4wICsgbjEgKyBuMiArIG4zICsgbjQpO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBidWlsZFBlcm11dGF0aW9uVGFibGUocmFuZG9tKSB7XG4gICAgdmFyIGk7XG4gICAgdmFyIHAgPSBuZXcgVWludDhBcnJheSgyNTYpO1xuICAgIGZvciAoaSA9IDA7IGkgPCAyNTY7IGkrKykge1xuICAgICAgcFtpXSA9IGk7XG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCAyNTU7IGkrKykge1xuICAgICAgdmFyIHIgPSBpICsgfn4ocmFuZG9tKCkgKiAoMjU2IC0gaSkpO1xuICAgICAgdmFyIGF1eCA9IHBbaV07XG4gICAgICBwW2ldID0gcFtyXTtcbiAgICAgIHBbcl0gPSBhdXg7XG4gICAgfVxuICAgIHJldHVybiBwO1xuICB9XG4gIFNpbXBsZXhOb2lzZS5fYnVpbGRQZXJtdXRhdGlvblRhYmxlID0gYnVpbGRQZXJtdXRhdGlvblRhYmxlO1xuXG4gIGZ1bmN0aW9uIGFsZWEoKSB7XG4gICAgLy8gSm9oYW5uZXMgQmFhZ8O4ZSA8YmFhZ29lQGJhYWdvZS5jb20+LCAyMDEwXG4gICAgdmFyIHMwID0gMDtcbiAgICB2YXIgczEgPSAwO1xuICAgIHZhciBzMiA9IDA7XG4gICAgdmFyIGMgPSAxO1xuXG4gICAgdmFyIG1hc2ggPSBtYXNoZXIoKTtcbiAgICBzMCA9IG1hc2goJyAnKTtcbiAgICBzMSA9IG1hc2goJyAnKTtcbiAgICBzMiA9IG1hc2goJyAnKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBzMCAtPSBtYXNoKGFyZ3VtZW50c1tpXSk7XG4gICAgICBpZiAoczAgPCAwKSB7XG4gICAgICAgIHMwICs9IDE7XG4gICAgICB9XG4gICAgICBzMSAtPSBtYXNoKGFyZ3VtZW50c1tpXSk7XG4gICAgICBpZiAoczEgPCAwKSB7XG4gICAgICAgIHMxICs9IDE7XG4gICAgICB9XG4gICAgICBzMiAtPSBtYXNoKGFyZ3VtZW50c1tpXSk7XG4gICAgICBpZiAoczIgPCAwKSB7XG4gICAgICAgIHMyICs9IDE7XG4gICAgICB9XG4gICAgfVxuICAgIG1hc2ggPSBudWxsO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0ID0gMjA5MTYzOSAqIHMwICsgYyAqIDIuMzI4MzA2NDM2NTM4Njk2M2UtMTA7IC8vIDJeLTMyXG4gICAgICBzMCA9IHMxO1xuICAgICAgczEgPSBzMjtcbiAgICAgIHJldHVybiBzMiA9IHQgLSAoYyA9IHQgfCAwKTtcbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIG1hc2hlcigpIHtcbiAgICB2YXIgbiA9IDB4ZWZjODI0OWQ7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGRhdGEgPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbiArPSBkYXRhLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIHZhciBoID0gMC4wMjUxOTYwMzI4MjQxNjkzOCAqIG47XG4gICAgICAgIG4gPSBoID4+PiAwO1xuICAgICAgICBoIC09IG47XG4gICAgICAgIGggKj0gbjtcbiAgICAgICAgbiA9IGggPj4+IDA7XG4gICAgICAgIGggLT0gbjtcbiAgICAgICAgbiArPSBoICogMHgxMDAwMDAwMDA7IC8vIDJeMzJcbiAgICAgIH1cbiAgICAgIHJldHVybiAobiA+Pj4gMCkgKiAyLjMyODMwNjQzNjUzODY5NjNlLTEwOyAvLyAyXi0zMlxuICAgIH07XG4gIH1cblxuICAvLyBhbWRcbiAgaWYgKHR5cGVvZiBkZWZpbmUgIT09ICd1bmRlZmluZWQnICYmIGRlZmluZS5hbWQpIGRlZmluZShmdW5jdGlvbigpIHtyZXR1cm4gU2ltcGxleE5vaXNlO30pO1xuICAvLyBjb21tb24ganNcbiAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykgZXhwb3J0cy5TaW1wbGV4Tm9pc2UgPSBTaW1wbGV4Tm9pc2U7XG4gIC8vIGJyb3dzZXJcbiAgZWxzZSBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHdpbmRvdy5TaW1wbGV4Tm9pc2UgPSBTaW1wbGV4Tm9pc2U7XG4gIC8vIG5vZGVqc1xuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFNpbXBsZXhOb2lzZTtcbiAgfVxuXG59KSgpO1xuIiwiY29uc3QgY2FudmFzU2tldGNoID0gcmVxdWlyZShcImNhbnZhcy1za2V0Y2hcIik7XG5jb25zdCByYW5kb20gPSByZXF1aXJlKFwiY2FudmFzLXNrZXRjaC11dGlsL3JhbmRvbVwiKTtcbmNvbnN0IHBhbGV0dGVzID0gcmVxdWlyZShcIm5pY2UtY29sb3ItcGFsZXR0ZXNcIik7XG5cbi8vIDYzMjIzMVxucmFuZG9tLnNldFNlZWQocmFuZG9tLmdldFJhbmRvbVNlZWQoKSk7XG4vLyBjb25zb2xlLmxvZyhyYW5kb20uZ2V0U2VlZCgpKTtcblxuY29uc3Qgc2V0dGluZ3MgPSB7XG4gIGRpbWVuc2lvbnM6IFsyMDQ4LCAyMDQ4XSxcbiAgc3VmZml4OiBgLXNlZWQtJHtyYW5kb20uZ2V0U2VlZCgpfWBcbn07XG5cbmNvbnN0IGNyZWF0ZUdyaWQgPSAoZ3JpZFdpZHRoLCBncmlkSGVpZ2h0LCBvZmZzZXRYLCBvZmZzZXRZLCBwYWxldHRlKSA9PiB7XG4gIGNvbnN0IGNvdW50ID0gMTA7XG4gIGNvbnN0IHNxdWFyZXMgPSBbXTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IGNvdW50OyBqKyspIHtcbiAgICAgIHNxdWFyZXMucHVzaCh7XG4gICAgICAgIHBvc2l0aW9uOiBbXG4gICAgICAgICAgTWF0aC5jZWlsKG9mZnNldFggKyBncmlkV2lkdGggLyBjb3VudCAqIGkpLFxuICAgICAgICAgIE1hdGguY2VpbChvZmZzZXRZICsgZ3JpZEhlaWdodCAvIGNvdW50ICogailcbiAgICAgICAgXSxcbiAgICAgICAgdzogTWF0aC5jZWlsKGdyaWRXaWR0aCAvIGNvdW50KSxcbiAgICAgICAgaDogTWF0aC5jZWlsKGdyaWRIZWlnaHQgLyBjb3VudCksXG4gICAgICAgIGNvbG9yOiByYW5kb20ucGljayhwYWxldHRlKSxcbiAgICAgICAgc3Ryb2tlOiByYW5kb20ucGljayhwYWxldHRlKVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHNxdWFyZXM7XG59O1xuXG5jb25zdCBza2V0Y2ggPSAoKSA9PiB7XG4gIGNvbnN0IGNvbG9yQ291bnQgPSByYW5kb20ucmFuZ2VGbG9vcigzLCA1KTtcbiAgY29uc3QgcGFsZXR0ZSA9IHJhbmRvbS5zaHVmZmxlKHJhbmRvbS5waWNrKHBhbGV0dGVzKS5zbGljZSgwLCBjb2xvckNvdW50KSk7XG4gIGNvbnN0IGJhY2tncm91bmQgPSBwYWxldHRlLnBvcCgpO1xuICBjb25zdCBtYXJnaW4gPSA0MDA7XG5cbiAgcmV0dXJuICh7IGNvbnRleHQsIHdpZHRoLCBoZWlnaHQgfSkgPT4ge1xuICAgIGNvbnN0IHBvaW50cyA9IGNyZWF0ZUdyaWQoXG4gICAgICB3aWR0aCAtIG1hcmdpbiAqIDIsXG4gICAgICBoZWlnaHQgLSBtYXJnaW4gKiAyLFxuICAgICAgbWFyZ2luLFxuICAgICAgbWFyZ2luLFxuICAgICAgcGFsZXR0ZVxuICAgICkuZmlsdGVyKCgpID0+IHJhbmRvbS52YWx1ZSgpID49IDAuMik7XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBiYWNrZ3JvdW5kO1xuICAgIGNvbnRleHQuZmlsbFJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG5cbiAgICBmdW5jdGlvbiBkcmF3QXJjKHgsIHksIHcsIGgpIHtcbiAgICAgIGNvbnN0IGNvcm5lciA9IHJhbmRvbS52YWx1ZSgpO1xuICAgICAgaWYgKGNvcm5lciA8IDAuMikge1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyh4ICsgdywgeSArIGgpOyAvLyBib3R0b20gcmlnaHRcbiAgICAgICAgY29udGV4dC5hcmMoeCArIHcsIHkgKyBoLCB3LCAxLjUgKiBNYXRoLlBJLCBNYXRoLlBJLCB0cnVlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGNvcm5lciA8IDAuNCkge1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyh4LCB5ICsgaCk7IC8vIGJvdHRvbSBsZWZ0XG4gICAgICAgIGNvbnRleHQuYXJjKHgsIHkgKyBoLCB3LCAxLjUgKiBNYXRoLlBJLCAyICogTWF0aC5QSSwgZmFsc2UpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoY29ybmVyIDwgMC42KSB7XG4gICAgICAgIGNvbnRleHQubW92ZVRvKHgsIHkpOyAvLyB0b3AgbGVmdFxuICAgICAgICBjb250ZXh0LmFyYyh4LCB5LCB3LCAwLCAwLjUgKiBNYXRoLlBJLCBmYWxzZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChjb3JuZXIgPCAwLjgpIHtcbiAgICAgICAgY29udGV4dC5tb3ZlVG8oeCArIHcsIHkpOyAvLyB0b3AgcmlnaHRcbiAgICAgICAgY29udGV4dC5hcmMoeCArIHcsIHksIHcsIE1hdGguUEksIDAuNSAqIE1hdGguUEksIHRydWUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoY29ybmVyIDwgMC44NSkge1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyh4ICsgdywgeSk7IC8vIHRvcCByaWdodFxuICAgICAgICBjb250ZXh0LmFyYyh4ICsgdywgeSwgdywgMC41ICogTWF0aC5QSSwgMS41ICogTWF0aC5QSSwgZmFsc2UpOyAvLyAxODAgZGVncmVlc1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoY29ybmVyIDwgMC45KSB7XG4gICAgICAgIGNvbnRleHQubW92ZVRvKHgsIHkpOyAvLyB0b3AgbGVmdFxuICAgICAgICBjb250ZXh0LmFyYyh4LCB5LCB3LCAwLCBNYXRoLlBJLCBmYWxzZSk7IC8vIDE4MCBkZWdyZWVzXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChjb3JuZXIgPCAwLjk1KSB7XG4gICAgICAgIGNvbnRleHQubW92ZVRvKHgsIHkgKyBoKTsgLy8gYm90dG9tIGxlZnRcbiAgICAgICAgY29udGV4dC5hcmMoeCwgeSArIGgsIHcsIDEuNSAqIE1hdGguUEksIDAuNSAqIE1hdGguUEksIGZhbHNlKTsgLy8gMTgwIGRlZ3JlZXNcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGNvcm5lciA8IDEpIHtcbiAgICAgICAgY29udGV4dC5tb3ZlVG8oeCArIHcsIHkgKyBoKTsgLy8gYm90dG9tIHJpZ2h0XG4gICAgICAgIGNvbnRleHQuYXJjKHggKyB3LCB5ICsgaCwgdywgMS41ICogTWF0aC5QSSwgMC41ICogTWF0aC5QSSwgZmFsc2UpOyAvLyAxODAgZGVncmVlc1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgcG9pbnRzLmZvckVhY2goZGF0YSA9PiB7XG4gICAgICBjb25zdCB7IHBvc2l0aW9uOiBbeCwgeV0sIGNvbG9yLCB3LCBoIH0gPSBkYXRhO1xuXG4gICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBjb2xvcjtcbiAgICAgIGRyYXdBcmMoeCwgeSwgdywgaCk7XG4gICAgICBjb250ZXh0LmZpbGwoKTtcbiAgICB9KTtcbiAgfTtcbn07XG5cbmNhbnZhc1NrZXRjaChza2V0Y2gsIHNldHRpbmdzKTtcbiIsIlxuZ2xvYmFsLkNBTlZBU19TS0VUQ0hfREVGQVVMVF9TVE9SQUdFX0tFWSA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuIl19
