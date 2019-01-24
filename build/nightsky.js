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

},{"defined":4,"seed-random":5,"simplex-noise":6}],2:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");

const settings = {
  dimensions: [2048, 1300]
};

function createBackgroundStars(width, height) {
  const stars = [];
  const count = random.rangeFloor(200, 400);

  for (let i = 0; i < count; i++) {
    stars.push({
      x: random.range(0, width),
      y: random.range(0, height),
      radius: random.rangeFloor(3, 5),
      opacity: random.range(5, 9) / 10
    });
  }

  return stars;
}

function createStarCluster(width, height) {
  const stars = [];
  const count = random.rangeFloor(1000, 1500);
  const spread = width / 10;
  const x = random.range(200, width - 200);

  for (let i = 0; i < count; i++) {
    const distribution = random.gaussian();
    stars.push({
      x: random.range(x - spread * distribution, x + spread * distribution),
      y: random.range(0, height / 3 * 2),
      radius: random.rangeFloor(3, 5),
      opacity: random.range(5, 9) / 10
    });
  }
  return stars;
}

function createHills(width, height) {
  const hills = [];
  const count = random.range(2, 4);
  const totalHorizonHeight = height * 0.6;
  const segmentHeigt = totalHorizonHeight / count;

  for (let i = 0; i < count; i++) {
    const points = [];
    const offset = i * segmentHeigt;
    const baseY = totalHorizonHeight + offset;
    const maxOffsetTop = baseY - segmentHeigt / 5;
    const maxOffsetBottom = baseY + segmentHeigt / 5;
    const numberOfPeaks = random.range(8, 18);
    const averagePeakWidth = width / numberOfPeaks;

    for (let x = 0; x <= width + averagePeakWidth; x += averagePeakWidth) {
      points.push({
        x,
        y: random.range(maxOffsetTop, maxOffsetBottom)
      });
    }

    hills.push({ points, top: maxOffsetTop, bottom: baseY + segmentHeigt });
  }
  return hills;
}

const sketch = () => {
  const hue = random.rangeFloor(200, 290); // restrict to blues/purples
  return ({ context, width, height }) => {
    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);

    function drawCircleAsDiamond({ x, y, radius }, fill) {
      context.beginPath();
      context.fillStyle = fill;
      context.moveTo(x - radius, y);
      context.lineTo(x, y - radius);
      context.lineTo(x + radius, y);
      context.lineTo(x, y + radius);
      context.fill();
    }

    function backgroundStars() {
      createBackgroundStars(width, height).forEach(star =>
        drawCircleAsDiamond(
          star,
          `rgba(255, 250, 240, ${random.range(5, 9) / 10})`
        )
      );
    }

    function milkyway() {
      createStarCluster(width, height).forEach(star =>
        drawCircleAsDiamond(
          star,
          `rgba(255, 250, 240, ${random.range(5, 9) / 10})`
        )
      );
    }

    function backgroundGradient() {
      const gradient = context.createLinearGradient(
        width / 2,
        0,
        width / 2,
        height
      );

      gradient.addColorStop(0, `hsl(${hue}, 20%, 10%`);
      gradient.addColorStop(0.5, `hsl(${hue}, 30%, 20%`);
      gradient.addColorStop(1, `hsl(${hue}, 40%, 30%`);

      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
    }

    function accent() {
      const x = width / 2;
      const y = height / 6 * 5;
      const r = x;
      const gradient = context.createRadialGradient(
        x, // circle1 x
        y, // circle1 y
        random.range(100, x / 4), // circle1 r
        x, // circle2 x
        y, // circle2 y
        r
      );

      const hue = random.rangeFloor(0, 260);

      gradient.addColorStop(0, `hsla(${hue}, 80%, 80%, 0.5`);
      gradient.addColorStop(
        random.range(3, 7) / 10,
        `hsla(${hue}, 80%, 80%, 0`
      );
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
    }

    function horizon() {
      const hills = createHills(width, height);
      hills.forEach(({ points, top, bottom }) => {
        const gradient = context.createLinearGradient(
          width / 2,
          top,
          width / 2,
          bottom
        );

        gradient.addColorStop(0, `hsl(${hue}, 10%, 10%)`);
        gradient.addColorStop(1, `hsl(${hue}, 10%, 20%)`);

        context.fillStyle = gradient;
        context.beginPath();
        context.moveTo(0, height);
        points.forEach(point => {
          context.lineTo(point.x, point.y);
        });
        context.lineTo(width, height);
        context.fill();
      });
    }

    backgroundGradient();
    accent();
    backgroundStars();
    milkyway();
    horizon();
  };
};

canvasSketch(sketch, settings);

},{"canvas-sketch":2,"canvas-sketch-util/random":1}],8:[function(require,module,exports){
(function (global){

global.CANVAS_SKETCH_DEFAULT_STORAGE_KEY = window.location.href;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[7,8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC11dGlsL3JhbmRvbS5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2Rpc3Qvbm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvbm9kZV9tb2R1bGVzL2RlZmluZWQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL25vZGVfbW9kdWxlcy9vYmplY3QtYXNzaWduL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvZGlzdC9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9ub2RlX21vZHVsZXMvcmlnaHQtbm93L2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL25vZGVfbW9kdWxlcy9pcy1wcm9taXNlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvZGlzdC9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9ub2RlX21vZHVsZXMvaXMtZG9tL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvZGlzdC9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9saWIvdXRpbC5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2Rpc3Qvbm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvbm9kZV9tb2R1bGVzL2RlZXAtZXF1YWwvbGliL2tleXMuanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL25vZGVfbW9kdWxlcy9kZWVwLWVxdWFsL2xpYi9pc19hcmd1bWVudHMuanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL25vZGVfbW9kdWxlcy9kZWVwLWVxdWFsL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvZGlzdC9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9ub2RlX21vZHVsZXMvZGF0ZWZvcm1hdC9saWIvZGF0ZWZvcm1hdC5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2Rpc3Qvbm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvbm9kZV9tb2R1bGVzL3JlcGVhdC1zdHJpbmcvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL25vZGVfbW9kdWxlcy9wYWQtbGVmdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2Rpc3Qvbm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvbGliL3NhdmUuanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2xpYi9hY2Nlc3NpYmlsaXR5LmpzIiwibm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvZGlzdC9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9saWIvY29yZS9rZXlib2FyZFNob3J0Y3V0cy5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2Rpc3Qvbm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvbGliL3BhcGVyLXNpemVzLmpzIiwibm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvZGlzdC9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9saWIvZGlzdGFuY2VzLmpzIiwibm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvZGlzdC9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9saWIvY29yZS9yZXNpemVDYW52YXMuanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL25vZGVfbW9kdWxlcy9nZXQtY2FudmFzLWNvbnRleHQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2xpYi9jb3JlL2NyZWF0ZUNhbnZhcy5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2Rpc3Qvbm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvbGliL2NvcmUvU2tldGNoTWFuYWdlci5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2Rpc3Qvbm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvbGliL2NhbnZhcy1za2V0Y2guanMiLCJub2RlX21vZHVsZXMvY29udmVydC1sZW5ndGgvY29udmVydC1sZW5ndGguanMiLCJub2RlX21vZHVsZXMvZGVmaW5lZC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zZWVkLXJhbmRvbS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGV4LW5vaXNlL3NpbXBsZXgtbm9pc2UuanMiLCJzcmMvbmlnaHRza3kuanMiLCJjYW52YXMtc2tldGNoLWNsaS9pbmplY3RlZC9zdG9yYWdlLWtleS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0lDeFVBLFdBQWMsR0FBRyxZQUFZO1FBQ3pCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3ZDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsRUFBRSxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN2RDtLQUNKLENBQUM7O0lDSkY7Ozs7OztJQVFBLElBQUkscUJBQXFCLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixDQUFDO0lBQ3pELElBQUksY0FBYyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDO0lBQ3JELElBQUksZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQzs7SUFFN0QsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFO0tBQ3RCLElBQUksR0FBRyxLQUFLLElBQUksSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFO01BQ3RDLE1BQU0sSUFBSSxTQUFTLENBQUMsdURBQXVELENBQUMsQ0FBQztNQUM3RTs7S0FFRCxPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNuQjs7SUFFRCxTQUFTLGVBQWUsR0FBRztLQUMxQixJQUFJO01BQ0gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7T0FDbkIsT0FBTyxLQUFLLENBQUM7T0FDYjs7Ozs7TUFLRCxJQUFJLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztNQUM5QixLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO01BQ2hCLElBQUksTUFBTSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTtPQUNqRCxPQUFPLEtBQUssQ0FBQztPQUNiOzs7TUFHRCxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7TUFDZixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO09BQzVCLEtBQUssQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztPQUN4QztNQUNELElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUU7T0FDL0QsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDaEIsQ0FBQyxDQUFDO01BQ0gsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLFlBQVksRUFBRTtPQUNyQyxPQUFPLEtBQUssQ0FBQztPQUNiOzs7TUFHRCxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7TUFDZixzQkFBc0IsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsTUFBTSxFQUFFO09BQzFELEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUM7T0FDdkIsQ0FBQyxDQUFDO01BQ0gsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNoRCxzQkFBc0IsRUFBRTtPQUN6QixPQUFPLEtBQUssQ0FBQztPQUNiOztNQUVELE9BQU8sSUFBSSxDQUFDO01BQ1osQ0FBQyxPQUFPLEdBQUcsRUFBRTs7TUFFYixPQUFPLEtBQUssQ0FBQztNQUNiO0tBQ0Q7O0lBRUQsZ0JBQWMsR0FBRyxlQUFlLEVBQUUsR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLFVBQVUsTUFBTSxFQUFFLE1BQU0sRUFBRTtLQUM5RSxJQUFJLElBQUksQ0FBQztLQUNULElBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUMxQixJQUFJLE9BQU8sQ0FBQzs7S0FFWixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtNQUMxQyxJQUFJLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztNQUU1QixLQUFLLElBQUksR0FBRyxJQUFJLElBQUksRUFBRTtPQUNyQixJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFO1FBQ25DLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDcEI7T0FDRDs7TUFFRCxJQUFJLHFCQUFxQixFQUFFO09BQzFCLE9BQU8sR0FBRyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUN0QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN4QyxJQUFJLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7U0FDNUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNsQztRQUNEO09BQ0Q7TUFDRDs7S0FFRCxPQUFPLEVBQUUsQ0FBQztLQUNWLENBQUM7Ozs7Ozs7O0lDekZGLFdBQWM7TUFDWixjQUFNLENBQUMsV0FBVztNQUNsQixjQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsR0FBRyxTQUFTLEdBQUcsR0FBRztRQUN0QyxPQUFPLFdBQVcsQ0FBQyxHQUFHLEVBQUU7T0FDekIsR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLFNBQVMsR0FBRyxHQUFHO1FBQzdCLE9BQU8sQ0FBQyxJQUFJLElBQUk7T0FDakI7O0lDTkgsZUFBYyxHQUFHLFNBQVMsQ0FBQzs7SUFFM0IsU0FBUyxTQUFTLENBQUMsR0FBRyxFQUFFO01BQ3RCLE9BQU8sQ0FBQyxDQUFDLEdBQUcsS0FBSyxPQUFPLEdBQUcsS0FBSyxRQUFRLElBQUksT0FBTyxHQUFHLEtBQUssVUFBVSxDQUFDLElBQUksT0FBTyxHQUFHLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQztLQUMxRzs7SUNKRCxTQUFjLEdBQUcsT0FBTTs7SUFFdkIsU0FBUyxNQUFNLEVBQUUsR0FBRyxFQUFFO01BQ3BCLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRO1VBQ25DLEtBQUs7VUFDTCxDQUFDLE9BQU8sTUFBTSxLQUFLLFFBQVEsSUFBSSxPQUFPLE1BQU0sQ0FBQyxJQUFJLEtBQUssUUFBUTthQUMzRCxHQUFHLFlBQVksTUFBTSxDQUFDLElBQUk7WUFDM0IsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxRQUFRLEtBQUssUUFBUTthQUNoQyxPQUFPLEdBQUcsQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDO0tBQ3pDOztJQ0xNLFNBQVMsZUFBZ0I7UUFDOUIsT0FBTyxPQUFPLE1BQVAsS0FBa0IsV0FBbEIsSUFBaUMsTUFBQSxDQUFPOzs7QUFHakQsSUFBTyxTQUFTLFlBQWE7UUFDM0IsT0FBTyxPQUFPLFFBQVAsS0FBb0I7OztBQUc3QixJQUFPLFNBQVMsZUFBZ0IsS0FBSztRQUNuQyxPQUFPLE9BQU8sR0FBQSxDQUFJLEtBQVgsS0FBcUIsVUFBckIsSUFBbUMsT0FBTyxHQUFBLENBQUksVUFBWCxLQUEwQixVQUE3RCxJQUEyRSxPQUFPLEdBQUEsQ0FBSSxVQUFYLEtBQTBCOzs7QUFHOUcsSUFBTyxTQUFTLFNBQVUsU0FBUztRQUNqQyxPQUFPLEtBQUEsQ0FBTSxRQUFOLElBQWtCLFNBQUEsQ0FBVSxJQUFWLENBQWUsT0FBQSxDQUFRLFNBQXpDLElBQXNELE9BQU8sT0FBQSxDQUFRLFVBQWYsS0FBOEI7Ozs7SUNqQjdGLE9BQU8sR0FBRyxjQUFjLEdBQUcsT0FBTyxNQUFNLENBQUMsSUFBSSxLQUFLLFVBQVU7UUFDeEQsTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7O0lBRXZCLFlBQVksR0FBRyxJQUFJLENBQUM7SUFDcEIsU0FBUyxJQUFJLEVBQUUsR0FBRyxFQUFFO01BQ2xCLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztNQUNkLEtBQUssSUFBSSxHQUFHLElBQUksR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7TUFDcEMsT0FBTyxJQUFJLENBQUM7S0FDYjs7Ozs7SUNSRCxJQUFJLHNCQUFzQixHQUFHLENBQUMsVUFBVTtNQUN0QyxPQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7S0FDakQsR0FBRyxJQUFJLG9CQUFvQixDQUFDOztJQUU3QixPQUFPLEdBQUcsY0FBYyxHQUFHLHNCQUFzQixHQUFHLFNBQVMsR0FBRyxXQUFXLENBQUM7O0lBRTVFLGlCQUFpQixHQUFHLFNBQVMsQ0FBQztJQUM5QixTQUFTLFNBQVMsQ0FBQyxNQUFNLEVBQUU7TUFDekIsT0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksb0JBQW9CLENBQUM7S0FDdkU7SUFFRCxtQkFBbUIsR0FBRyxXQUFXLENBQUM7SUFDbEMsU0FBUyxXQUFXLENBQUMsTUFBTSxDQUFDO01BQzFCLE9BQU8sTUFBTTtRQUNYLE9BQU8sTUFBTSxJQUFJLFFBQVE7UUFDekIsT0FBTyxNQUFNLENBQUMsTUFBTSxJQUFJLFFBQVE7UUFDaEMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUM7UUFDdEQsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDO1FBQzdELEtBQUssQ0FBQztLQUNUOzs7OztJQ25CRCxJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQzs7OztJQUluQyxJQUFJLFNBQVMsR0FBRyxjQUFjLEdBQUcsVUFBVSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtNQUNqRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksR0FBRyxFQUFFLENBQUM7O01BRXJCLElBQUksTUFBTSxLQUFLLFFBQVEsRUFBRTtRQUN2QixPQUFPLElBQUksQ0FBQzs7T0FFYixNQUFNLElBQUksTUFBTSxZQUFZLElBQUksSUFBSSxRQUFRLFlBQVksSUFBSSxFQUFFO1FBQzdELE9BQU8sTUFBTSxDQUFDLE9BQU8sRUFBRSxLQUFLLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7OztPQUloRCxNQUFNLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxRQUFRLElBQUksT0FBTyxNQUFNLElBQUksUUFBUSxJQUFJLE9BQU8sUUFBUSxJQUFJLFFBQVEsRUFBRTtRQUMzRixPQUFPLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxLQUFLLFFBQVEsR0FBRyxNQUFNLElBQUksUUFBUSxDQUFDOzs7Ozs7OztPQVEvRCxNQUFNO1FBQ0wsT0FBTyxRQUFRLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztPQUN6QztNQUNGOztJQUVELFNBQVMsaUJBQWlCLENBQUMsS0FBSyxFQUFFO01BQ2hDLE9BQU8sS0FBSyxLQUFLLElBQUksSUFBSSxLQUFLLEtBQUssU0FBUyxDQUFDO0tBQzlDOztJQUVELFNBQVMsUUFBUSxFQUFFLENBQUMsRUFBRTtNQUNwQixJQUFJLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxLQUFLLFFBQVEsSUFBSSxPQUFPLENBQUMsQ0FBQyxNQUFNLEtBQUssUUFBUSxFQUFFLE9BQU8sS0FBSyxDQUFDO01BQzlFLElBQUksT0FBTyxDQUFDLENBQUMsSUFBSSxLQUFLLFVBQVUsSUFBSSxPQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssVUFBVSxFQUFFO1FBQ2pFLE9BQU8sS0FBSyxDQUFDO09BQ2Q7TUFDRCxJQUFJLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsRUFBRSxPQUFPLEtBQUssQ0FBQztNQUMzRCxPQUFPLElBQUksQ0FBQztLQUNiOztJQUVELFNBQVMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFO01BQzVCLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQztNQUNYLElBQUksaUJBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1FBQzlDLE9BQU8sS0FBSyxDQUFDOztNQUVmLElBQUksQ0FBQyxDQUFDLFNBQVMsS0FBSyxDQUFDLENBQUMsU0FBUyxFQUFFLE9BQU8sS0FBSyxDQUFDOzs7TUFHOUMsSUFBSSxZQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDbEIsSUFBSSxDQUFDLFlBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRTtVQUNuQixPQUFPLEtBQUssQ0FBQztTQUNkO1FBQ0QsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkIsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkIsT0FBTyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztPQUM5QjtNQUNELElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQ2YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRTtVQUNoQixPQUFPLEtBQUssQ0FBQztTQUNkO1FBQ0QsSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxLQUFLLENBQUM7UUFDeEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1VBQzdCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLEtBQUssQ0FBQztTQUNqQztRQUNELE9BQU8sSUFBSSxDQUFDO09BQ2I7TUFDRCxJQUFJO1FBQ0YsSUFBSSxFQUFFLEdBQUcsSUFBVSxDQUFDLENBQUMsQ0FBQztZQUNsQixFQUFFLEdBQUcsSUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQ3hCLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixPQUFPLEtBQUssQ0FBQztPQUNkOzs7TUFHRCxJQUFJLEVBQUUsQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDLE1BQU07UUFDeEIsT0FBTyxLQUFLLENBQUM7O01BRWYsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO01BQ1YsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDOztNQUVWLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDbkMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztVQUNoQixPQUFPLEtBQUssQ0FBQztPQUNoQjs7O01BR0QsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNuQyxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1osSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLE9BQU8sS0FBSyxDQUFDO09BQ3BEO01BQ0QsT0FBTyxPQUFPLENBQUMsS0FBSyxPQUFPLENBQUMsQ0FBQztLQUM5Qjs7OztJQzdGRDs7Ozs7Ozs7Ozs7Ozs7SUFjQSxDQUFDLFNBQVMsTUFBTSxFQUFFOztNQUdoQixJQUFJLFVBQVUsR0FBRyxDQUFDLFdBQVc7VUFDekIsSUFBSSxLQUFLLEdBQUcsa0VBQWtFLENBQUM7VUFDL0UsSUFBSSxRQUFRLEdBQUcsc0lBQXNJLENBQUM7VUFDdEosSUFBSSxZQUFZLEdBQUcsYUFBYSxDQUFDOzs7VUFHakMsT0FBTyxVQUFVLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRTs7O1lBR3JDLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7Y0FDM0UsSUFBSSxHQUFHLElBQUksQ0FBQztjQUNaLElBQUksR0FBRyxTQUFTLENBQUM7YUFDbEI7O1lBRUQsSUFBSSxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQzs7WUFFeEIsR0FBRyxFQUFFLElBQUksWUFBWSxJQUFJLENBQUMsRUFBRTtjQUMxQixJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDdkI7O1lBRUQsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUU7Y0FDZixNQUFNLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQzthQUNqQzs7WUFFRCxJQUFJLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQzs7O1lBRzdFLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLElBQUksU0FBUyxLQUFLLE1BQU0sSUFBSSxTQUFTLEtBQUssTUFBTSxFQUFFO2NBQ2hELElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2NBQ3JCLEdBQUcsR0FBRyxJQUFJLENBQUM7Y0FDWCxJQUFJLFNBQVMsS0FBSyxNQUFNLEVBQUU7Z0JBQ3hCLEdBQUcsR0FBRyxJQUFJLENBQUM7ZUFDWjthQUNGOztZQUVELElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxRQUFRLEdBQUcsS0FBSyxDQUFDO1lBQy9CLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUMzQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDMUIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQzVCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDNUIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsRUFBRSxDQUFDO1lBQzlCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQztZQUM5QixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxFQUFFLENBQUM7WUFDbkMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUMzQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEIsSUFBSSxDQUFDLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNCLElBQUksS0FBSyxHQUFHO2NBQ1YsQ0FBQyxLQUFLLENBQUM7Y0FDUCxFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztjQUNaLEdBQUcsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Y0FDakMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Y0FDckMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDO2NBQ1gsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2NBQ2hCLEdBQUcsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7Y0FDbkMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7Y0FDeEMsRUFBRSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2NBQ3hCLElBQUksRUFBRSxDQUFDO2NBQ1AsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRTtjQUNsQixFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDO2NBQ3ZCLENBQUMsS0FBSyxDQUFDO2NBQ1AsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7Y0FDWixDQUFDLEtBQUssQ0FBQztjQUNQLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO2NBQ1osQ0FBQyxLQUFLLENBQUM7Y0FDUCxFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztjQUNaLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztjQUNmLENBQUMsS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7Y0FDN0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2NBQzFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztjQUMxRSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Y0FDMUUsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2NBQzFFLENBQUMsS0FBSyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUM7Y0FDeEcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDN0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6ZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDL0tBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsInZhciBzZWVkUmFuZG9tID0gcmVxdWlyZSgnc2VlZC1yYW5kb20nKTtcbnZhciBTaW1wbGV4Tm9pc2UgPSByZXF1aXJlKCdzaW1wbGV4LW5vaXNlJyk7XG52YXIgZGVmaW5lZCA9IHJlcXVpcmUoJ2RlZmluZWQnKTtcblxuZnVuY3Rpb24gY3JlYXRlUmFuZG9tIChkZWZhdWx0U2VlZCkge1xuICBkZWZhdWx0U2VlZCA9IGRlZmluZWQoZGVmYXVsdFNlZWQsIG51bGwpO1xuICB2YXIgZGVmYXVsdFJhbmRvbSA9IE1hdGgucmFuZG9tO1xuICB2YXIgY3VycmVudFNlZWQ7XG4gIHZhciBjdXJyZW50UmFuZG9tO1xuICB2YXIgbm9pc2VHZW5lcmF0b3I7XG4gIHZhciBfbmV4dEdhdXNzaWFuID0gbnVsbDtcbiAgdmFyIF9oYXNOZXh0R2F1c3NpYW4gPSBmYWxzZTtcblxuICBzZXRTZWVkKGRlZmF1bHRTZWVkKTtcblxuICByZXR1cm4ge1xuICAgIHZhbHVlOiB2YWx1ZSxcbiAgICBjcmVhdGVSYW5kb206IGZ1bmN0aW9uIChkZWZhdWx0U2VlZCkge1xuICAgICAgcmV0dXJuIGNyZWF0ZVJhbmRvbShkZWZhdWx0U2VlZCk7XG4gICAgfSxcbiAgICBzZXRTZWVkOiBzZXRTZWVkLFxuICAgIGdldFNlZWQ6IGdldFNlZWQsXG4gICAgZ2V0UmFuZG9tU2VlZDogZ2V0UmFuZG9tU2VlZCxcbiAgICB2YWx1ZU5vblplcm86IHZhbHVlTm9uWmVybyxcbiAgICBwZXJtdXRlTm9pc2U6IHBlcm11dGVOb2lzZSxcbiAgICBub2lzZTFEOiBub2lzZTFELFxuICAgIG5vaXNlMkQ6IG5vaXNlMkQsXG4gICAgbm9pc2UzRDogbm9pc2UzRCxcbiAgICBub2lzZTREOiBub2lzZTRELFxuICAgIHNpZ246IHNpZ24sXG4gICAgYm9vbGVhbjogYm9vbGVhbixcbiAgICBjaGFuY2U6IGNoYW5jZSxcbiAgICByYW5nZTogcmFuZ2UsXG4gICAgcmFuZ2VGbG9vcjogcmFuZ2VGbG9vcixcbiAgICBwaWNrOiBwaWNrLFxuICAgIHNodWZmbGU6IHNodWZmbGUsXG4gICAgb25DaXJjbGU6IG9uQ2lyY2xlLFxuICAgIGluc2lkZUNpcmNsZTogaW5zaWRlQ2lyY2xlLFxuICAgIG9uU3BoZXJlOiBvblNwaGVyZSxcbiAgICBpbnNpZGVTcGhlcmU6IGluc2lkZVNwaGVyZSxcbiAgICBxdWF0ZXJuaW9uOiBxdWF0ZXJuaW9uLFxuICAgIHdlaWdodGVkOiB3ZWlnaHRlZCxcbiAgICB3ZWlnaHRlZFNldDogd2VpZ2h0ZWRTZXQsXG4gICAgd2VpZ2h0ZWRTZXRJbmRleDogd2VpZ2h0ZWRTZXRJbmRleCxcbiAgICBnYXVzc2lhbjogZ2F1c3NpYW5cbiAgfTtcblxuICBmdW5jdGlvbiBzZXRTZWVkIChzZWVkLCBvcHQpIHtcbiAgICBpZiAodHlwZW9mIHNlZWQgPT09ICdudW1iZXInIHx8IHR5cGVvZiBzZWVkID09PSAnc3RyaW5nJykge1xuICAgICAgY3VycmVudFNlZWQgPSBzZWVkO1xuICAgICAgY3VycmVudFJhbmRvbSA9IHNlZWRSYW5kb20oY3VycmVudFNlZWQsIG9wdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN1cnJlbnRTZWVkID0gdW5kZWZpbmVkO1xuICAgICAgY3VycmVudFJhbmRvbSA9IGRlZmF1bHRSYW5kb207XG4gICAgfVxuICAgIG5vaXNlR2VuZXJhdG9yID0gY3JlYXRlTm9pc2UoKTtcbiAgICBfbmV4dEdhdXNzaWFuID0gbnVsbDtcbiAgICBfaGFzTmV4dEdhdXNzaWFuID0gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiB2YWx1ZSAoKSB7XG4gICAgcmV0dXJuIGN1cnJlbnRSYW5kb20oKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHZhbHVlTm9uWmVybyAoKSB7XG4gICAgdmFyIHUgPSAwO1xuICAgIHdoaWxlICh1ID09PSAwKSB1ID0gdmFsdWUoKTtcbiAgICByZXR1cm4gdTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFNlZWQgKCkge1xuICAgIHJldHVybiBjdXJyZW50U2VlZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFJhbmRvbVNlZWQgKCkge1xuICAgIHZhciBzZWVkID0gU3RyaW5nKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMDAwMDApKTtcbiAgICByZXR1cm4gc2VlZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZU5vaXNlICgpIHtcbiAgICByZXR1cm4gbmV3IFNpbXBsZXhOb2lzZShjdXJyZW50UmFuZG9tKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBlcm11dGVOb2lzZSAoKSB7XG4gICAgbm9pc2VHZW5lcmF0b3IgPSBjcmVhdGVOb2lzZSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gbm9pc2UxRCAoeCwgZnJlcXVlbmN5LCBhbXBsaXR1ZGUpIHtcbiAgICBpZiAoIWlzRmluaXRlKHgpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCd4IGNvbXBvbmVudCBmb3Igbm9pc2UoKSBtdXN0IGJlIGZpbml0ZScpO1xuICAgIGZyZXF1ZW5jeSA9IGRlZmluZWQoZnJlcXVlbmN5LCAxKTtcbiAgICBhbXBsaXR1ZGUgPSBkZWZpbmVkKGFtcGxpdHVkZSwgMSk7XG4gICAgcmV0dXJuIGFtcGxpdHVkZSAqIG5vaXNlR2VuZXJhdG9yLm5vaXNlMkQoeCAqIGZyZXF1ZW5jeSwgMCk7XG4gIH1cblxuICBmdW5jdGlvbiBub2lzZTJEICh4LCB5LCBmcmVxdWVuY3ksIGFtcGxpdHVkZSkge1xuICAgIGlmICghaXNGaW5pdGUoeCkpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ggY29tcG9uZW50IGZvciBub2lzZSgpIG11c3QgYmUgZmluaXRlJyk7XG4gICAgaWYgKCFpc0Zpbml0ZSh5KSkgdGhyb3cgbmV3IFR5cGVFcnJvcigneSBjb21wb25lbnQgZm9yIG5vaXNlKCkgbXVzdCBiZSBmaW5pdGUnKTtcbiAgICBmcmVxdWVuY3kgPSBkZWZpbmVkKGZyZXF1ZW5jeSwgMSk7XG4gICAgYW1wbGl0dWRlID0gZGVmaW5lZChhbXBsaXR1ZGUsIDEpO1xuICAgIHJldHVybiBhbXBsaXR1ZGUgKiBub2lzZUdlbmVyYXRvci5ub2lzZTJEKHggKiBmcmVxdWVuY3ksIHkgKiBmcmVxdWVuY3kpO1xuICB9XG5cbiAgZnVuY3Rpb24gbm9pc2UzRCAoeCwgeSwgeiwgZnJlcXVlbmN5LCBhbXBsaXR1ZGUpIHtcbiAgICBpZiAoIWlzRmluaXRlKHgpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCd4IGNvbXBvbmVudCBmb3Igbm9pc2UoKSBtdXN0IGJlIGZpbml0ZScpO1xuICAgIGlmICghaXNGaW5pdGUoeSkpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3kgY29tcG9uZW50IGZvciBub2lzZSgpIG11c3QgYmUgZmluaXRlJyk7XG4gICAgaWYgKCFpc0Zpbml0ZSh6KSkgdGhyb3cgbmV3IFR5cGVFcnJvcigneiBjb21wb25lbnQgZm9yIG5vaXNlKCkgbXVzdCBiZSBmaW5pdGUnKTtcbiAgICBmcmVxdWVuY3kgPSBkZWZpbmVkKGZyZXF1ZW5jeSwgMSk7XG4gICAgYW1wbGl0dWRlID0gZGVmaW5lZChhbXBsaXR1ZGUsIDEpO1xuICAgIHJldHVybiBhbXBsaXR1ZGUgKiBub2lzZUdlbmVyYXRvci5ub2lzZTNEKFxuICAgICAgeCAqIGZyZXF1ZW5jeSxcbiAgICAgIHkgKiBmcmVxdWVuY3ksXG4gICAgICB6ICogZnJlcXVlbmN5XG4gICAgKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vaXNlNEQgKHgsIHksIHosIHcsIGZyZXF1ZW5jeSwgYW1wbGl0dWRlKSB7XG4gICAgaWYgKCFpc0Zpbml0ZSh4KSkgdGhyb3cgbmV3IFR5cGVFcnJvcigneCBjb21wb25lbnQgZm9yIG5vaXNlKCkgbXVzdCBiZSBmaW5pdGUnKTtcbiAgICBpZiAoIWlzRmluaXRlKHkpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCd5IGNvbXBvbmVudCBmb3Igbm9pc2UoKSBtdXN0IGJlIGZpbml0ZScpO1xuICAgIGlmICghaXNGaW5pdGUoeikpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ogY29tcG9uZW50IGZvciBub2lzZSgpIG11c3QgYmUgZmluaXRlJyk7XG4gICAgaWYgKCFpc0Zpbml0ZSh3KSkgdGhyb3cgbmV3IFR5cGVFcnJvcigndyBjb21wb25lbnQgZm9yIG5vaXNlKCkgbXVzdCBiZSBmaW5pdGUnKTtcbiAgICBmcmVxdWVuY3kgPSBkZWZpbmVkKGZyZXF1ZW5jeSwgMSk7XG4gICAgYW1wbGl0dWRlID0gZGVmaW5lZChhbXBsaXR1ZGUsIDEpO1xuICAgIHJldHVybiBhbXBsaXR1ZGUgKiBub2lzZUdlbmVyYXRvci5ub2lzZTREKFxuICAgICAgeCAqIGZyZXF1ZW5jeSxcbiAgICAgIHkgKiBmcmVxdWVuY3ksXG4gICAgICB6ICogZnJlcXVlbmN5LFxuICAgICAgdyAqIGZyZXF1ZW5jeVxuICAgICk7XG4gIH1cblxuICBmdW5jdGlvbiBzaWduICgpIHtcbiAgICByZXR1cm4gYm9vbGVhbigpID8gMSA6IC0xO1xuICB9XG5cbiAgZnVuY3Rpb24gYm9vbGVhbiAoKSB7XG4gICAgcmV0dXJuIHZhbHVlKCkgPiAwLjU7XG4gIH1cblxuICBmdW5jdGlvbiBjaGFuY2UgKG4pIHtcbiAgICBuID0gZGVmaW5lZChuLCAwLjUpO1xuICAgIGlmICh0eXBlb2YgbiAhPT0gJ251bWJlcicpIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4cGVjdGVkIG4gdG8gYmUgYSBudW1iZXInKTtcbiAgICByZXR1cm4gdmFsdWUoKSA8IG47XG4gIH1cblxuICBmdW5jdGlvbiByYW5nZSAobWluLCBtYXgpIHtcbiAgICBpZiAobWF4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIG1heCA9IG1pbjtcbiAgICAgIG1pbiA9IDA7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBtaW4gIT09ICdudW1iZXInIHx8IHR5cGVvZiBtYXggIT09ICdudW1iZXInKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBhbGwgYXJndW1lbnRzIHRvIGJlIG51bWJlcnMnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWUoKSAqIChtYXggLSBtaW4pICsgbWluO1xuICB9XG5cbiAgZnVuY3Rpb24gcmFuZ2VGbG9vciAobWluLCBtYXgpIHtcbiAgICBpZiAobWF4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIG1heCA9IG1pbjtcbiAgICAgIG1pbiA9IDA7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBtaW4gIT09ICdudW1iZXInIHx8IHR5cGVvZiBtYXggIT09ICdudW1iZXInKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBhbGwgYXJndW1lbnRzIHRvIGJlIG51bWJlcnMnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gTWF0aC5mbG9vcihyYW5nZShtaW4sIG1heCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gcGljayAoYXJyYXkpIHtcbiAgICBpZiAoYXJyYXkubGVuZ3RoID09PSAwKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgIHJldHVybiBhcnJheVtyYW5nZUZsb29yKDAsIGFycmF5Lmxlbmd0aCldO1xuICB9XG5cbiAgZnVuY3Rpb24gc2h1ZmZsZSAoYXJyKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIEFycmF5LCBnb3QgJyArIHR5cGVvZiBhcnIpO1xuICAgIH1cblxuICAgIHZhciByYW5kO1xuICAgIHZhciB0bXA7XG4gICAgdmFyIGxlbiA9IGFyci5sZW5ndGg7XG4gICAgdmFyIHJldCA9IGFyci5zbGljZSgpO1xuICAgIHdoaWxlIChsZW4pIHtcbiAgICAgIHJhbmQgPSBNYXRoLmZsb29yKHZhbHVlKCkgKiBsZW4tLSk7XG4gICAgICB0bXAgPSByZXRbbGVuXTtcbiAgICAgIHJldFtsZW5dID0gcmV0W3JhbmRdO1xuICAgICAgcmV0W3JhbmRdID0gdG1wO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgZnVuY3Rpb24gb25DaXJjbGUgKHJhZGl1cywgb3V0KSB7XG4gICAgcmFkaXVzID0gZGVmaW5lZChyYWRpdXMsIDEpO1xuICAgIG91dCA9IG91dCB8fCBbXTtcbiAgICB2YXIgdGhldGEgPSB2YWx1ZSgpICogMi4wICogTWF0aC5QSTtcbiAgICBvdXRbMF0gPSByYWRpdXMgKiBNYXRoLmNvcyh0aGV0YSk7XG4gICAgb3V0WzFdID0gcmFkaXVzICogTWF0aC5zaW4odGhldGEpO1xuICAgIHJldHVybiBvdXQ7XG4gIH1cblxuICBmdW5jdGlvbiBpbnNpZGVDaXJjbGUgKHJhZGl1cywgb3V0KSB7XG4gICAgcmFkaXVzID0gZGVmaW5lZChyYWRpdXMsIDEpO1xuICAgIG91dCA9IG91dCB8fCBbXTtcbiAgICBvbkNpcmNsZSgxLCBvdXQpO1xuICAgIHZhciByID0gcmFkaXVzICogTWF0aC5zcXJ0KHZhbHVlKCkpO1xuICAgIG91dFswXSAqPSByO1xuICAgIG91dFsxXSAqPSByO1xuICAgIHJldHVybiBvdXQ7XG4gIH1cblxuICBmdW5jdGlvbiBvblNwaGVyZSAocmFkaXVzLCBvdXQpIHtcbiAgICByYWRpdXMgPSBkZWZpbmVkKHJhZGl1cywgMSk7XG4gICAgb3V0ID0gb3V0IHx8IFtdO1xuICAgIHZhciB1ID0gdmFsdWUoKSAqIE1hdGguUEkgKiAyO1xuICAgIHZhciB2ID0gdmFsdWUoKSAqIDIgLSAxO1xuICAgIHZhciBwaGkgPSB1O1xuICAgIHZhciB0aGV0YSA9IE1hdGguYWNvcyh2KTtcbiAgICBvdXRbMF0gPSByYWRpdXMgKiBNYXRoLnNpbih0aGV0YSkgKiBNYXRoLmNvcyhwaGkpO1xuICAgIG91dFsxXSA9IHJhZGl1cyAqIE1hdGguc2luKHRoZXRhKSAqIE1hdGguc2luKHBoaSk7XG4gICAgb3V0WzJdID0gcmFkaXVzICogTWF0aC5jb3ModGhldGEpO1xuICAgIHJldHVybiBvdXQ7XG4gIH1cblxuICBmdW5jdGlvbiBpbnNpZGVTcGhlcmUgKHJhZGl1cywgb3V0KSB7XG4gICAgcmFkaXVzID0gZGVmaW5lZChyYWRpdXMsIDEpO1xuICAgIG91dCA9IG91dCB8fCBbXTtcbiAgICB2YXIgdSA9IHZhbHVlKCkgKiBNYXRoLlBJICogMjtcbiAgICB2YXIgdiA9IHZhbHVlKCkgKiAyIC0gMTtcbiAgICB2YXIgayA9IHZhbHVlKCk7XG5cbiAgICB2YXIgcGhpID0gdTtcbiAgICB2YXIgdGhldGEgPSBNYXRoLmFjb3Modik7XG4gICAgdmFyIHIgPSByYWRpdXMgKiBNYXRoLmNicnQoayk7XG4gICAgb3V0WzBdID0gciAqIE1hdGguc2luKHRoZXRhKSAqIE1hdGguY29zKHBoaSk7XG4gICAgb3V0WzFdID0gciAqIE1hdGguc2luKHRoZXRhKSAqIE1hdGguc2luKHBoaSk7XG4gICAgb3V0WzJdID0gciAqIE1hdGguY29zKHRoZXRhKTtcbiAgICByZXR1cm4gb3V0O1xuICB9XG5cbiAgZnVuY3Rpb24gcXVhdGVybmlvbiAob3V0KSB7XG4gICAgb3V0ID0gb3V0IHx8IFtdO1xuICAgIHZhciB1MSA9IHZhbHVlKCk7XG4gICAgdmFyIHUyID0gdmFsdWUoKTtcbiAgICB2YXIgdTMgPSB2YWx1ZSgpO1xuXG4gICAgdmFyIHNxMSA9IE1hdGguc3FydCgxIC0gdTEpO1xuICAgIHZhciBzcTIgPSBNYXRoLnNxcnQodTEpO1xuXG4gICAgdmFyIHRoZXRhMSA9IE1hdGguUEkgKiAyICogdTI7XG4gICAgdmFyIHRoZXRhMiA9IE1hdGguUEkgKiAyICogdTM7XG5cbiAgICB2YXIgeCA9IE1hdGguc2luKHRoZXRhMSkgKiBzcTE7XG4gICAgdmFyIHkgPSBNYXRoLmNvcyh0aGV0YTEpICogc3ExO1xuICAgIHZhciB6ID0gTWF0aC5zaW4odGhldGEyKSAqIHNxMjtcbiAgICB2YXIgdyA9IE1hdGguY29zKHRoZXRhMikgKiBzcTI7XG4gICAgb3V0WzBdID0geDtcbiAgICBvdXRbMV0gPSB5O1xuICAgIG91dFsyXSA9IHo7XG4gICAgb3V0WzNdID0gdztcbiAgICByZXR1cm4gb3V0O1xuICB9XG5cbiAgZnVuY3Rpb24gd2VpZ2h0ZWRTZXQgKHNldCkge1xuICAgIHNldCA9IHNldCB8fCBbXTtcbiAgICBpZiAoc2V0Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIHNldFt3ZWlnaHRlZFNldEluZGV4KHNldCldLnZhbHVlO1xuICB9XG5cbiAgZnVuY3Rpb24gd2VpZ2h0ZWRTZXRJbmRleCAoc2V0KSB7XG4gICAgc2V0ID0gc2V0IHx8IFtdO1xuICAgIGlmIChzZXQubGVuZ3RoID09PSAwKSByZXR1cm4gLTE7XG4gICAgcmV0dXJuIHdlaWdodGVkKHNldC5tYXAoZnVuY3Rpb24gKHMpIHtcbiAgICAgIHJldHVybiBzLndlaWdodDtcbiAgICB9KSk7XG4gIH1cblxuICBmdW5jdGlvbiB3ZWlnaHRlZCAod2VpZ2h0cykge1xuICAgIHdlaWdodHMgPSB3ZWlnaHRzIHx8IFtdO1xuICAgIGlmICh3ZWlnaHRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIC0xO1xuICAgIHZhciB0b3RhbFdlaWdodCA9IDA7XG4gICAgdmFyIGk7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgd2VpZ2h0cy5sZW5ndGg7IGkrKykge1xuICAgICAgdG90YWxXZWlnaHQgKz0gd2VpZ2h0c1tpXTtcbiAgICB9XG5cbiAgICBpZiAodG90YWxXZWlnaHQgPD0gMCkgdGhyb3cgbmV3IEVycm9yKCdXZWlnaHRzIG11c3Qgc3VtIHRvID4gMCcpO1xuXG4gICAgdmFyIHJhbmRvbSA9IHZhbHVlKCkgKiB0b3RhbFdlaWdodDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgd2VpZ2h0cy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHJhbmRvbSA8IHdlaWdodHNbaV0pIHtcbiAgICAgICAgcmV0dXJuIGk7XG4gICAgICB9XG4gICAgICByYW5kb20gLT0gd2VpZ2h0c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICBmdW5jdGlvbiBnYXVzc2lhbiAobWVhbiwgc3RhbmRhcmREZXJpdmF0aW9uKSB7XG4gICAgbWVhbiA9IGRlZmluZWQobWVhbiwgMCk7XG4gICAgc3RhbmRhcmREZXJpdmF0aW9uID0gZGVmaW5lZChzdGFuZGFyZERlcml2YXRpb24sIDEpO1xuXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL29wZW5qZGstbWlycm9yL2pkazd1LWpkay9ibG9iL2Y0ZDgwOTU3ZTg5YTE5YTI5YmI5Zjk4MDdkMmEyODM1MWVkN2Y3ZGYvc3JjL3NoYXJlL2NsYXNzZXMvamF2YS91dGlsL1JhbmRvbS5qYXZhI0w0OTZcbiAgICBpZiAoX2hhc05leHRHYXVzc2lhbikge1xuICAgICAgX2hhc05leHRHYXVzc2lhbiA9IGZhbHNlO1xuICAgICAgdmFyIHJlc3VsdCA9IF9uZXh0R2F1c3NpYW47XG4gICAgICBfbmV4dEdhdXNzaWFuID0gbnVsbDtcbiAgICAgIHJldHVybiBtZWFuICsgc3RhbmRhcmREZXJpdmF0aW9uICogcmVzdWx0O1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdjEgPSAwO1xuICAgICAgdmFyIHYyID0gMDtcbiAgICAgIHZhciBzID0gMDtcbiAgICAgIGRvIHtcbiAgICAgICAgdjEgPSB2YWx1ZSgpICogMiAtIDE7IC8vIGJldHdlZW4gLTEgYW5kIDFcbiAgICAgICAgdjIgPSB2YWx1ZSgpICogMiAtIDE7IC8vIGJldHdlZW4gLTEgYW5kIDFcbiAgICAgICAgcyA9IHYxICogdjEgKyB2MiAqIHYyO1xuICAgICAgfSB3aGlsZSAocyA+PSAxIHx8IHMgPT09IDApO1xuICAgICAgdmFyIG11bHRpcGxpZXIgPSBNYXRoLnNxcnQoLTIgKiBNYXRoLmxvZyhzKSAvIHMpO1xuICAgICAgX25leHRHYXVzc2lhbiA9ICh2MiAqIG11bHRpcGxpZXIpO1xuICAgICAgX2hhc05leHRHYXVzc2lhbiA9IHRydWU7XG4gICAgICByZXR1cm4gbWVhbiArIHN0YW5kYXJkRGVyaXZhdGlvbiAqICh2MSAqIG11bHRpcGxpZXIpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZVJhbmRvbSgpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50c1tpXSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gYXJndW1lbnRzW2ldO1xuICAgIH1cbn07XG4iLCIvKlxub2JqZWN0LWFzc2lnblxuKGMpIFNpbmRyZSBTb3JodXNcbkBsaWNlbnNlIE1JVFxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbnZhciBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xudmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciBwcm9wSXNFbnVtZXJhYmxlID0gT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcblxuZnVuY3Rpb24gdG9PYmplY3QodmFsKSB7XG5cdGlmICh2YWwgPT09IG51bGwgfHwgdmFsID09PSB1bmRlZmluZWQpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdPYmplY3QuYXNzaWduIGNhbm5vdCBiZSBjYWxsZWQgd2l0aCBudWxsIG9yIHVuZGVmaW5lZCcpO1xuXHR9XG5cblx0cmV0dXJuIE9iamVjdCh2YWwpO1xufVxuXG5mdW5jdGlvbiBzaG91bGRVc2VOYXRpdmUoKSB7XG5cdHRyeSB7XG5cdFx0aWYgKCFPYmplY3QuYXNzaWduKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gRGV0ZWN0IGJ1Z2d5IHByb3BlcnR5IGVudW1lcmF0aW9uIG9yZGVyIGluIG9sZGVyIFY4IHZlcnNpb25zLlxuXG5cdFx0Ly8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9NDExOFxuXHRcdHZhciB0ZXN0MSA9IG5ldyBTdHJpbmcoJ2FiYycpOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1uZXctd3JhcHBlcnNcblx0XHR0ZXN0MVs1XSA9ICdkZSc7XG5cdFx0aWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRlc3QxKVswXSA9PT0gJzUnKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9MzA1NlxuXHRcdHZhciB0ZXN0MiA9IHt9O1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgMTA7IGkrKykge1xuXHRcdFx0dGVzdDJbJ18nICsgU3RyaW5nLmZyb21DaGFyQ29kZShpKV0gPSBpO1xuXHRcdH1cblx0XHR2YXIgb3JkZXIyID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGVzdDIpLm1hcChmdW5jdGlvbiAobikge1xuXHRcdFx0cmV0dXJuIHRlc3QyW25dO1xuXHRcdH0pO1xuXHRcdGlmIChvcmRlcjIuam9pbignJykgIT09ICcwMTIzNDU2Nzg5Jykge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTMwNTZcblx0XHR2YXIgdGVzdDMgPSB7fTtcblx0XHQnYWJjZGVmZ2hpamtsbW5vcHFyc3QnLnNwbGl0KCcnKS5mb3JFYWNoKGZ1bmN0aW9uIChsZXR0ZXIpIHtcblx0XHRcdHRlc3QzW2xldHRlcl0gPSBsZXR0ZXI7XG5cdFx0fSk7XG5cdFx0aWYgKE9iamVjdC5rZXlzKE9iamVjdC5hc3NpZ24oe30sIHRlc3QzKSkuam9pbignJykgIT09XG5cdFx0XHRcdCdhYmNkZWZnaGlqa2xtbm9wcXJzdCcpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0Ly8gV2UgZG9uJ3QgZXhwZWN0IGFueSBvZiB0aGUgYWJvdmUgdG8gdGhyb3csIGJ1dCBiZXR0ZXIgdG8gYmUgc2FmZS5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzaG91bGRVc2VOYXRpdmUoKSA/IE9iamVjdC5hc3NpZ24gOiBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcblx0dmFyIGZyb207XG5cdHZhciB0byA9IHRvT2JqZWN0KHRhcmdldCk7XG5cdHZhciBzeW1ib2xzO1xuXG5cdGZvciAodmFyIHMgPSAxOyBzIDwgYXJndW1lbnRzLmxlbmd0aDsgcysrKSB7XG5cdFx0ZnJvbSA9IE9iamVjdChhcmd1bWVudHNbc10pO1xuXG5cdFx0Zm9yICh2YXIga2V5IGluIGZyb20pIHtcblx0XHRcdGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGZyb20sIGtleSkpIHtcblx0XHRcdFx0dG9ba2V5XSA9IGZyb21ba2V5XTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7XG5cdFx0XHRzeW1ib2xzID0gZ2V0T3duUHJvcGVydHlTeW1ib2xzKGZyb20pO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzeW1ib2xzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmIChwcm9wSXNFbnVtZXJhYmxlLmNhbGwoZnJvbSwgc3ltYm9sc1tpXSkpIHtcblx0XHRcdFx0XHR0b1tzeW1ib2xzW2ldXSA9IGZyb21bc3ltYm9sc1tpXV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdG87XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPVxuICBnbG9iYWwucGVyZm9ybWFuY2UgJiZcbiAgZ2xvYmFsLnBlcmZvcm1hbmNlLm5vdyA/IGZ1bmN0aW9uIG5vdygpIHtcbiAgICByZXR1cm4gcGVyZm9ybWFuY2Uubm93KClcbiAgfSA6IERhdGUubm93IHx8IGZ1bmN0aW9uIG5vdygpIHtcbiAgICByZXR1cm4gK25ldyBEYXRlXG4gIH1cbiIsIm1vZHVsZS5leHBvcnRzID0gaXNQcm9taXNlO1xuXG5mdW5jdGlvbiBpc1Byb21pc2Uob2JqKSB7XG4gIHJldHVybiAhIW9iaiAmJiAodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJykgJiYgdHlwZW9mIG9iai50aGVuID09PSAnZnVuY3Rpb24nO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBpc05vZGVcblxuZnVuY3Rpb24gaXNOb2RlICh2YWwpIHtcbiAgcmV0dXJuICghdmFsIHx8IHR5cGVvZiB2YWwgIT09ICdvYmplY3QnKVxuICAgID8gZmFsc2VcbiAgICA6ICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JyAmJiB0eXBlb2Ygd2luZG93Lk5vZGUgPT09ICdvYmplY3QnKVxuICAgICAgPyAodmFsIGluc3RhbmNlb2Ygd2luZG93Lk5vZGUpXG4gICAgICA6ICh0eXBlb2YgdmFsLm5vZGVUeXBlID09PSAnbnVtYmVyJykgJiZcbiAgICAgICAgKHR5cGVvZiB2YWwubm9kZU5hbWUgPT09ICdzdHJpbmcnKVxufVxuIiwiLy8gVE9ETzogV2UgY2FuIHJlbW92ZSBhIGh1Z2UgY2h1bmsgb2YgYnVuZGxlIHNpemUgYnkgdXNpbmcgYSBzbWFsbGVyXG4vLyB1dGlsaXR5IG1vZHVsZSBmb3IgY29udmVydGluZyB1bml0cy5cbmltcG9ydCBpc0RPTSBmcm9tICdpcy1kb20nO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2xpZW50QVBJICgpIHtcbiAgcmV0dXJuIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvd1snY2FudmFzLXNrZXRjaC1jbGknXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQnJvd3NlciAoKSB7XG4gIHJldHVybiB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNXZWJHTENvbnRleHQgKGN0eCkge1xuICByZXR1cm4gdHlwZW9mIGN0eC5jbGVhciA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgY3R4LmNsZWFyQ29sb3IgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGN0eC5idWZmZXJEYXRhID09PSAnZnVuY3Rpb24nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNDYW52YXMgKGVsZW1lbnQpIHtcbiAgcmV0dXJuIGlzRE9NKGVsZW1lbnQpICYmIC9jYW52YXMvaS50ZXN0KGVsZW1lbnQubm9kZU5hbWUpICYmIHR5cGVvZiBlbGVtZW50LmdldENvbnRleHQgPT09ICdmdW5jdGlvbic7XG59XG4iLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSB0eXBlb2YgT2JqZWN0LmtleXMgPT09ICdmdW5jdGlvbidcbiAgPyBPYmplY3Qua2V5cyA6IHNoaW07XG5cbmV4cG9ydHMuc2hpbSA9IHNoaW07XG5mdW5jdGlvbiBzaGltIChvYmopIHtcbiAgdmFyIGtleXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikga2V5cy5wdXNoKGtleSk7XG4gIHJldHVybiBrZXlzO1xufVxuIiwidmFyIHN1cHBvcnRzQXJndW1lbnRzQ2xhc3MgPSAoZnVuY3Rpb24oKXtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhcmd1bWVudHMpXG59KSgpID09ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBzdXBwb3J0c0FyZ3VtZW50c0NsYXNzID8gc3VwcG9ydGVkIDogdW5zdXBwb3J0ZWQ7XG5cbmV4cG9ydHMuc3VwcG9ydGVkID0gc3VwcG9ydGVkO1xuZnVuY3Rpb24gc3VwcG9ydGVkKG9iamVjdCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkgPT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG59O1xuXG5leHBvcnRzLnVuc3VwcG9ydGVkID0gdW5zdXBwb3J0ZWQ7XG5mdW5jdGlvbiB1bnN1cHBvcnRlZChvYmplY3Qpe1xuICByZXR1cm4gb2JqZWN0ICYmXG4gICAgdHlwZW9mIG9iamVjdCA9PSAnb2JqZWN0JyAmJlxuICAgIHR5cGVvZiBvYmplY3QubGVuZ3RoID09ICdudW1iZXInICYmXG4gICAgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgJ2NhbGxlZScpICYmXG4gICAgIU9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChvYmplY3QsICdjYWxsZWUnKSB8fFxuICAgIGZhbHNlO1xufTtcbiIsInZhciBwU2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG52YXIgb2JqZWN0S2V5cyA9IHJlcXVpcmUoJy4vbGliL2tleXMuanMnKTtcbnZhciBpc0FyZ3VtZW50cyA9IHJlcXVpcmUoJy4vbGliL2lzX2FyZ3VtZW50cy5qcycpO1xuXG52YXIgZGVlcEVxdWFsID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYWN0dWFsLCBleHBlY3RlZCwgb3B0cykge1xuICBpZiAoIW9wdHMpIG9wdHMgPSB7fTtcbiAgLy8gNy4xLiBBbGwgaWRlbnRpY2FsIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgYXMgZGV0ZXJtaW5lZCBieSA9PT0uXG4gIGlmIChhY3R1YWwgPT09IGV4cGVjdGVkKSB7XG4gICAgcmV0dXJuIHRydWU7XG5cbiAgfSBlbHNlIGlmIChhY3R1YWwgaW5zdGFuY2VvZiBEYXRlICYmIGV4cGVjdGVkIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgIHJldHVybiBhY3R1YWwuZ2V0VGltZSgpID09PSBleHBlY3RlZC5nZXRUaW1lKCk7XG5cbiAgLy8gNy4zLiBPdGhlciBwYWlycyB0aGF0IGRvIG5vdCBib3RoIHBhc3MgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnLFxuICAvLyBlcXVpdmFsZW5jZSBpcyBkZXRlcm1pbmVkIGJ5ID09LlxuICB9IGVsc2UgaWYgKCFhY3R1YWwgfHwgIWV4cGVjdGVkIHx8IHR5cGVvZiBhY3R1YWwgIT0gJ29iamVjdCcgJiYgdHlwZW9mIGV4cGVjdGVkICE9ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIG9wdHMuc3RyaWN0ID8gYWN0dWFsID09PSBleHBlY3RlZCA6IGFjdHVhbCA9PSBleHBlY3RlZDtcblxuICAvLyA3LjQuIEZvciBhbGwgb3RoZXIgT2JqZWN0IHBhaXJzLCBpbmNsdWRpbmcgQXJyYXkgb2JqZWN0cywgZXF1aXZhbGVuY2UgaXNcbiAgLy8gZGV0ZXJtaW5lZCBieSBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGFzIHZlcmlmaWVkXG4gIC8vIHdpdGggT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKSwgdGhlIHNhbWUgc2V0IG9mIGtleXNcbiAgLy8gKGFsdGhvdWdoIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZSBvcmRlciksIGVxdWl2YWxlbnQgdmFsdWVzIGZvciBldmVyeVxuICAvLyBjb3JyZXNwb25kaW5nIGtleSwgYW5kIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS4gTm90ZTogdGhpc1xuICAvLyBhY2NvdW50cyBmb3IgYm90aCBuYW1lZCBhbmQgaW5kZXhlZCBwcm9wZXJ0aWVzIG9uIEFycmF5cy5cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gb2JqRXF1aXYoYWN0dWFsLCBleHBlY3RlZCwgb3B0cyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWRPck51bGwodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGlzQnVmZmVyICh4KSB7XG4gIGlmICgheCB8fCB0eXBlb2YgeCAhPT0gJ29iamVjdCcgfHwgdHlwZW9mIHgubGVuZ3RoICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuICBpZiAodHlwZW9mIHguY29weSAhPT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgeC5zbGljZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoeC5sZW5ndGggPiAwICYmIHR5cGVvZiB4WzBdICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gb2JqRXF1aXYoYSwgYiwgb3B0cykge1xuICB2YXIgaSwga2V5O1xuICBpZiAoaXNVbmRlZmluZWRPck51bGwoYSkgfHwgaXNVbmRlZmluZWRPck51bGwoYikpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvLyBhbiBpZGVudGljYWwgJ3Byb3RvdHlwZScgcHJvcGVydHkuXG4gIGlmIChhLnByb3RvdHlwZSAhPT0gYi5wcm90b3R5cGUpIHJldHVybiBmYWxzZTtcbiAgLy9+fn5JJ3ZlIG1hbmFnZWQgdG8gYnJlYWsgT2JqZWN0LmtleXMgdGhyb3VnaCBzY3Jld3kgYXJndW1lbnRzIHBhc3NpbmcuXG4gIC8vICAgQ29udmVydGluZyB0byBhcnJheSBzb2x2ZXMgdGhlIHByb2JsZW0uXG4gIGlmIChpc0FyZ3VtZW50cyhhKSkge1xuICAgIGlmICghaXNBcmd1bWVudHMoYikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgYSA9IHBTbGljZS5jYWxsKGEpO1xuICAgIGIgPSBwU2xpY2UuY2FsbChiKTtcbiAgICByZXR1cm4gZGVlcEVxdWFsKGEsIGIsIG9wdHMpO1xuICB9XG4gIGlmIChpc0J1ZmZlcihhKSkge1xuICAgIGlmICghaXNCdWZmZXIoYikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgIGZvciAoaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoYVtpXSAhPT0gYltpXSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB0cnkge1xuICAgIHZhciBrYSA9IG9iamVjdEtleXMoYSksXG4gICAgICAgIGtiID0gb2JqZWN0S2V5cyhiKTtcbiAgfSBjYXRjaCAoZSkgey8vaGFwcGVucyB3aGVuIG9uZSBpcyBhIHN0cmluZyBsaXRlcmFsIGFuZCB0aGUgb3RoZXIgaXNuJ3RcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gaGF2aW5nIHRoZSBzYW1lIG51bWJlciBvZiBvd25lZCBwcm9wZXJ0aWVzIChrZXlzIGluY29ycG9yYXRlc1xuICAvLyBoYXNPd25Qcm9wZXJ0eSlcbiAgaWYgKGthLmxlbmd0aCAhPSBrYi5sZW5ndGgpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvL3RoZSBzYW1lIHNldCBvZiBrZXlzIChhbHRob3VnaCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWUgb3JkZXIpLFxuICBrYS5zb3J0KCk7XG4gIGtiLnNvcnQoKTtcbiAgLy9+fn5jaGVhcCBrZXkgdGVzdFxuICBmb3IgKGkgPSBrYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGlmIChrYVtpXSAhPSBrYltpXSlcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvL2VxdWl2YWxlbnQgdmFsdWVzIGZvciBldmVyeSBjb3JyZXNwb25kaW5nIGtleSwgYW5kXG4gIC8vfn5+cG9zc2libHkgZXhwZW5zaXZlIGRlZXAgdGVzdFxuICBmb3IgKGkgPSBrYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGtleSA9IGthW2ldO1xuICAgIGlmICghZGVlcEVxdWFsKGFba2V5XSwgYltrZXldLCBvcHRzKSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0eXBlb2YgYSA9PT0gdHlwZW9mIGI7XG59XG4iLCIvKlxuICogRGF0ZSBGb3JtYXQgMS4yLjNcbiAqIChjKSAyMDA3LTIwMDkgU3RldmVuIExldml0aGFuIDxzdGV2ZW5sZXZpdGhhbi5jb20+XG4gKiBNSVQgbGljZW5zZVxuICpcbiAqIEluY2x1ZGVzIGVuaGFuY2VtZW50cyBieSBTY290dCBUcmVuZGEgPHNjb3R0LnRyZW5kYS5uZXQ+XG4gKiBhbmQgS3JpcyBLb3dhbCA8Y2l4YXIuY29tL35rcmlzLmtvd2FsLz5cbiAqXG4gKiBBY2NlcHRzIGEgZGF0ZSwgYSBtYXNrLCBvciBhIGRhdGUgYW5kIGEgbWFzay5cbiAqIFJldHVybnMgYSBmb3JtYXR0ZWQgdmVyc2lvbiBvZiB0aGUgZ2l2ZW4gZGF0ZS5cbiAqIFRoZSBkYXRlIGRlZmF1bHRzIHRvIHRoZSBjdXJyZW50IGRhdGUvdGltZS5cbiAqIFRoZSBtYXNrIGRlZmF1bHRzIHRvIGRhdGVGb3JtYXQubWFza3MuZGVmYXVsdC5cbiAqL1xuXG4oZnVuY3Rpb24oZ2xvYmFsKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgZGF0ZUZvcm1hdCA9IChmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0b2tlbiA9IC9kezEsNH18bXsxLDR9fHl5KD86eXkpP3woW0hoTXNUdF0pXFwxP3xbTGxvU1pXTl18XCJbXlwiXSpcInwnW14nXSonL2c7XG4gICAgICB2YXIgdGltZXpvbmUgPSAvXFxiKD86W1BNQ0VBXVtTRFBdVHwoPzpQYWNpZmljfE1vdW50YWlufENlbnRyYWx8RWFzdGVybnxBdGxhbnRpYykgKD86U3RhbmRhcmR8RGF5bGlnaHR8UHJldmFpbGluZykgVGltZXwoPzpHTVR8VVRDKSg/OlstK11cXGR7NH0pPylcXGIvZztcbiAgICAgIHZhciB0aW1lem9uZUNsaXAgPSAvW14tK1xcZEEtWl0vZztcbiAgXG4gICAgICAvLyBSZWdleGVzIGFuZCBzdXBwb3J0aW5nIGZ1bmN0aW9ucyBhcmUgY2FjaGVkIHRocm91Z2ggY2xvc3VyZVxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChkYXRlLCBtYXNrLCB1dGMsIGdtdCkge1xuICBcbiAgICAgICAgLy8gWW91IGNhbid0IHByb3ZpZGUgdXRjIGlmIHlvdSBza2lwIG90aGVyIGFyZ3MgKHVzZSB0aGUgJ1VUQzonIG1hc2sgcHJlZml4KVxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSAmJiBraW5kT2YoZGF0ZSkgPT09ICdzdHJpbmcnICYmICEvXFxkLy50ZXN0KGRhdGUpKSB7XG4gICAgICAgICAgbWFzayA9IGRhdGU7XG4gICAgICAgICAgZGF0ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICBcbiAgICAgICAgZGF0ZSA9IGRhdGUgfHwgbmV3IERhdGU7XG4gIFxuICAgICAgICBpZighKGRhdGUgaW5zdGFuY2VvZiBEYXRlKSkge1xuICAgICAgICAgIGRhdGUgPSBuZXcgRGF0ZShkYXRlKTtcbiAgICAgICAgfVxuICBcbiAgICAgICAgaWYgKGlzTmFOKGRhdGUpKSB7XG4gICAgICAgICAgdGhyb3cgVHlwZUVycm9yKCdJbnZhbGlkIGRhdGUnKTtcbiAgICAgICAgfVxuICBcbiAgICAgICAgbWFzayA9IFN0cmluZyhkYXRlRm9ybWF0Lm1hc2tzW21hc2tdIHx8IG1hc2sgfHwgZGF0ZUZvcm1hdC5tYXNrc1snZGVmYXVsdCddKTtcbiAgXG4gICAgICAgIC8vIEFsbG93IHNldHRpbmcgdGhlIHV0Yy9nbXQgYXJndW1lbnQgdmlhIHRoZSBtYXNrXG4gICAgICAgIHZhciBtYXNrU2xpY2UgPSBtYXNrLnNsaWNlKDAsIDQpO1xuICAgICAgICBpZiAobWFza1NsaWNlID09PSAnVVRDOicgfHwgbWFza1NsaWNlID09PSAnR01UOicpIHtcbiAgICAgICAgICBtYXNrID0gbWFzay5zbGljZSg0KTtcbiAgICAgICAgICB1dGMgPSB0cnVlO1xuICAgICAgICAgIGlmIChtYXNrU2xpY2UgPT09ICdHTVQ6Jykge1xuICAgICAgICAgICAgZ210ID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgXG4gICAgICAgIHZhciBfID0gdXRjID8gJ2dldFVUQycgOiAnZ2V0JztcbiAgICAgICAgdmFyIGQgPSBkYXRlW18gKyAnRGF0ZSddKCk7XG4gICAgICAgIHZhciBEID0gZGF0ZVtfICsgJ0RheSddKCk7XG4gICAgICAgIHZhciBtID0gZGF0ZVtfICsgJ01vbnRoJ10oKTtcbiAgICAgICAgdmFyIHkgPSBkYXRlW18gKyAnRnVsbFllYXInXSgpO1xuICAgICAgICB2YXIgSCA9IGRhdGVbXyArICdIb3VycyddKCk7XG4gICAgICAgIHZhciBNID0gZGF0ZVtfICsgJ01pbnV0ZXMnXSgpO1xuICAgICAgICB2YXIgcyA9IGRhdGVbXyArICdTZWNvbmRzJ10oKTtcbiAgICAgICAgdmFyIEwgPSBkYXRlW18gKyAnTWlsbGlzZWNvbmRzJ10oKTtcbiAgICAgICAgdmFyIG8gPSB1dGMgPyAwIDogZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpO1xuICAgICAgICB2YXIgVyA9IGdldFdlZWsoZGF0ZSk7XG4gICAgICAgIHZhciBOID0gZ2V0RGF5T2ZXZWVrKGRhdGUpO1xuICAgICAgICB2YXIgZmxhZ3MgPSB7XG4gICAgICAgICAgZDogICAgZCxcbiAgICAgICAgICBkZDogICBwYWQoZCksXG4gICAgICAgICAgZGRkOiAgZGF0ZUZvcm1hdC5pMThuLmRheU5hbWVzW0RdLFxuICAgICAgICAgIGRkZGQ6IGRhdGVGb3JtYXQuaTE4bi5kYXlOYW1lc1tEICsgN10sXG4gICAgICAgICAgbTogICAgbSArIDEsXG4gICAgICAgICAgbW06ICAgcGFkKG0gKyAxKSxcbiAgICAgICAgICBtbW06ICBkYXRlRm9ybWF0LmkxOG4ubW9udGhOYW1lc1ttXSxcbiAgICAgICAgICBtbW1tOiBkYXRlRm9ybWF0LmkxOG4ubW9udGhOYW1lc1ttICsgMTJdLFxuICAgICAgICAgIHl5OiAgIFN0cmluZyh5KS5zbGljZSgyKSxcbiAgICAgICAgICB5eXl5OiB5LFxuICAgICAgICAgIGg6ICAgIEggJSAxMiB8fCAxMixcbiAgICAgICAgICBoaDogICBwYWQoSCAlIDEyIHx8IDEyKSxcbiAgICAgICAgICBIOiAgICBILFxuICAgICAgICAgIEhIOiAgIHBhZChIKSxcbiAgICAgICAgICBNOiAgICBNLFxuICAgICAgICAgIE1NOiAgIHBhZChNKSxcbiAgICAgICAgICBzOiAgICBzLFxuICAgICAgICAgIHNzOiAgIHBhZChzKSxcbiAgICAgICAgICBsOiAgICBwYWQoTCwgMyksXG4gICAgICAgICAgTDogICAgcGFkKE1hdGgucm91bmQoTCAvIDEwKSksXG4gICAgICAgICAgdDogICAgSCA8IDEyID8gZGF0ZUZvcm1hdC5pMThuLnRpbWVOYW1lc1swXSA6IGRhdGVGb3JtYXQuaTE4bi50aW1lTmFtZXNbMV0sXG4gICAgICAgICAgdHQ6ICAgSCA8IDEyID8gZGF0ZUZvcm1hdC5pMThuLnRpbWVOYW1lc1syXSA6IGRhdGVGb3JtYXQuaTE4bi50aW1lTmFtZXNbM10sXG4gICAgICAgICAgVDogICAgSCA8IDEyID8gZGF0ZUZvcm1hdC5pMThuLnRpbWVOYW1lc1s0XSA6IGRhdGVGb3JtYXQuaTE4bi50aW1lTmFtZXNbNV0sXG4gICAgICAgICAgVFQ6ICAgSCA8IDEyID8gZGF0ZUZvcm1hdC5pMThuLnRpbWVOYW1lc1s2XSA6IGRhdGVGb3JtYXQuaTE4bi50aW1lTmFtZXNbN10sXG4gICAgICAgICAgWjogICAgZ210ID8gJ0dNVCcgOiB1dGMgPyAnVVRDJyA6IChTdHJpbmcoZGF0ZSkubWF0Y2godGltZXpvbmUpIHx8IFsnJ10pLnBvcCgpLnJlcGxhY2UodGltZXpvbmVDbGlwLCAnJyksXG4gICAgICAgICAgbzogICAgKG8gPiAwID8gJy0nIDogJysnKSArIHBhZChNYXRoLmZsb29yKE1hdGguYWJzKG8pIC8gNjApICogMTAwICsgTWF0aC5hYnMobykgJSA2MCwgNCksXG4gICAgICAgICAgUzogICAgWyd0aCcsICdzdCcsICduZCcsICdyZCddW2QgJSAxMCA+IDMgPyAwIDogKGQgJSAxMDAgLSBkICUgMTAgIT0gMTApICogZCAlIDEwXSxcbiAgICAgICAgICBXOiAgICBXLFxuICAgICAgICAgIE46ICAgIE5cbiAgICAgICAgfTtcbiAgXG4gICAgICAgIHJldHVybiBtYXNrLnJlcGxhY2UodG9rZW4sIGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgICAgIGlmIChtYXRjaCBpbiBmbGFncykge1xuICAgICAgICAgICAgcmV0dXJuIGZsYWdzW21hdGNoXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG1hdGNoLnNsaWNlKDEsIG1hdGNoLmxlbmd0aCAtIDEpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkoKTtcblxuICBkYXRlRm9ybWF0Lm1hc2tzID0ge1xuICAgICdkZWZhdWx0JzogICAgICAgICAgICAgICAnZGRkIG1tbSBkZCB5eXl5IEhIOk1NOnNzJyxcbiAgICAnc2hvcnREYXRlJzogICAgICAgICAgICAgJ20vZC95eScsXG4gICAgJ21lZGl1bURhdGUnOiAgICAgICAgICAgICdtbW0gZCwgeXl5eScsXG4gICAgJ2xvbmdEYXRlJzogICAgICAgICAgICAgICdtbW1tIGQsIHl5eXknLFxuICAgICdmdWxsRGF0ZSc6ICAgICAgICAgICAgICAnZGRkZCwgbW1tbSBkLCB5eXl5JyxcbiAgICAnc2hvcnRUaW1lJzogICAgICAgICAgICAgJ2g6TU0gVFQnLFxuICAgICdtZWRpdW1UaW1lJzogICAgICAgICAgICAnaDpNTTpzcyBUVCcsXG4gICAgJ2xvbmdUaW1lJzogICAgICAgICAgICAgICdoOk1NOnNzIFRUIFonLFxuICAgICdpc29EYXRlJzogICAgICAgICAgICAgICAneXl5eS1tbS1kZCcsXG4gICAgJ2lzb1RpbWUnOiAgICAgICAgICAgICAgICdISDpNTTpzcycsXG4gICAgJ2lzb0RhdGVUaW1lJzogICAgICAgICAgICd5eXl5LW1tLWRkXFwnVFxcJ0hIOk1NOnNzbycsXG4gICAgJ2lzb1V0Y0RhdGVUaW1lJzogICAgICAgICdVVEM6eXl5eS1tbS1kZFxcJ1RcXCdISDpNTTpzc1xcJ1pcXCcnLFxuICAgICdleHBpcmVzSGVhZGVyRm9ybWF0JzogICAnZGRkLCBkZCBtbW0geXl5eSBISDpNTTpzcyBaJ1xuICB9O1xuXG4gIC8vIEludGVybmF0aW9uYWxpemF0aW9uIHN0cmluZ3NcbiAgZGF0ZUZvcm1hdC5pMThuID0ge1xuICAgIGRheU5hbWVzOiBbXG4gICAgICAnU3VuJywgJ01vbicsICdUdWUnLCAnV2VkJywgJ1RodScsICdGcmknLCAnU2F0JyxcbiAgICAgICdTdW5kYXknLCAnTW9uZGF5JywgJ1R1ZXNkYXknLCAnV2VkbmVzZGF5JywgJ1RodXJzZGF5JywgJ0ZyaWRheScsICdTYXR1cmRheSdcbiAgICBdLFxuICAgIG1vbnRoTmFtZXM6IFtcbiAgICAgICdKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsICdPY3QnLCAnTm92JywgJ0RlYycsXG4gICAgICAnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsICdKdWx5JywgJ0F1Z3VzdCcsICdTZXB0ZW1iZXInLCAnT2N0b2JlcicsICdOb3ZlbWJlcicsICdEZWNlbWJlcidcbiAgICBdLFxuICAgIHRpbWVOYW1lczogW1xuICAgICAgJ2EnLCAncCcsICdhbScsICdwbScsICdBJywgJ1AnLCAnQU0nLCAnUE0nXG4gICAgXVxuICB9O1xuXG5mdW5jdGlvbiBwYWQodmFsLCBsZW4pIHtcbiAgdmFsID0gU3RyaW5nKHZhbCk7XG4gIGxlbiA9IGxlbiB8fCAyO1xuICB3aGlsZSAodmFsLmxlbmd0aCA8IGxlbikge1xuICAgIHZhbCA9ICcwJyArIHZhbDtcbiAgfVxuICByZXR1cm4gdmFsO1xufVxuXG4vKipcbiAqIEdldCB0aGUgSVNPIDg2MDEgd2VlayBudW1iZXJcbiAqIEJhc2VkIG9uIGNvbW1lbnRzIGZyb21cbiAqIGh0dHA6Ly90ZWNoYmxvZy5wcm9jdXJpb3Mubmwvay9uNjE4L25ld3Mvdmlldy8zMzc5Ni8xNDg2My9DYWxjdWxhdGUtSVNPLTg2MDEtd2Vlay1hbmQteWVhci1pbi1qYXZhc2NyaXB0Lmh0bWxcbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IGBkYXRlYFxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5mdW5jdGlvbiBnZXRXZWVrKGRhdGUpIHtcbiAgLy8gUmVtb3ZlIHRpbWUgY29tcG9uZW50cyBvZiBkYXRlXG4gIHZhciB0YXJnZXRUaHVyc2RheSA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCBkYXRlLmdldERhdGUoKSk7XG5cbiAgLy8gQ2hhbmdlIGRhdGUgdG8gVGh1cnNkYXkgc2FtZSB3ZWVrXG4gIHRhcmdldFRodXJzZGF5LnNldERhdGUodGFyZ2V0VGh1cnNkYXkuZ2V0RGF0ZSgpIC0gKCh0YXJnZXRUaHVyc2RheS5nZXREYXkoKSArIDYpICUgNykgKyAzKTtcblxuICAvLyBUYWtlIEphbnVhcnkgNHRoIGFzIGl0IGlzIGFsd2F5cyBpbiB3ZWVrIDEgKHNlZSBJU08gODYwMSlcbiAgdmFyIGZpcnN0VGh1cnNkYXkgPSBuZXcgRGF0ZSh0YXJnZXRUaHVyc2RheS5nZXRGdWxsWWVhcigpLCAwLCA0KTtcblxuICAvLyBDaGFuZ2UgZGF0ZSB0byBUaHVyc2RheSBzYW1lIHdlZWtcbiAgZmlyc3RUaHVyc2RheS5zZXREYXRlKGZpcnN0VGh1cnNkYXkuZ2V0RGF0ZSgpIC0gKChmaXJzdFRodXJzZGF5LmdldERheSgpICsgNikgJSA3KSArIDMpO1xuXG4gIC8vIENoZWNrIGlmIGRheWxpZ2h0LXNhdmluZy10aW1lLXN3aXRjaCBvY2N1cnJlZCBhbmQgY29ycmVjdCBmb3IgaXRcbiAgdmFyIGRzID0gdGFyZ2V0VGh1cnNkYXkuZ2V0VGltZXpvbmVPZmZzZXQoKSAtIGZpcnN0VGh1cnNkYXkuZ2V0VGltZXpvbmVPZmZzZXQoKTtcbiAgdGFyZ2V0VGh1cnNkYXkuc2V0SG91cnModGFyZ2V0VGh1cnNkYXkuZ2V0SG91cnMoKSAtIGRzKTtcblxuICAvLyBOdW1iZXIgb2Ygd2Vla3MgYmV0d2VlbiB0YXJnZXQgVGh1cnNkYXkgYW5kIGZpcnN0IFRodXJzZGF5XG4gIHZhciB3ZWVrRGlmZiA9ICh0YXJnZXRUaHVyc2RheSAtIGZpcnN0VGh1cnNkYXkpIC8gKDg2NDAwMDAwKjcpO1xuICByZXR1cm4gMSArIE1hdGguZmxvb3Iod2Vla0RpZmYpO1xufVxuXG4vKipcbiAqIEdldCBJU08tODYwMSBudW1lcmljIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkYXkgb2YgdGhlIHdlZWtcbiAqIDEgKGZvciBNb25kYXkpIHRocm91Z2ggNyAoZm9yIFN1bmRheSlcbiAqIFxuICogQHBhcmFtICB7T2JqZWN0fSBgZGF0ZWBcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuZnVuY3Rpb24gZ2V0RGF5T2ZXZWVrKGRhdGUpIHtcbiAgdmFyIGRvdyA9IGRhdGUuZ2V0RGF5KCk7XG4gIGlmKGRvdyA9PT0gMCkge1xuICAgIGRvdyA9IDc7XG4gIH1cbiAgcmV0dXJuIGRvdztcbn1cblxuLyoqXG4gKiBraW5kLW9mIHNob3J0Y3V0XG4gKiBAcGFyYW0gIHsqfSB2YWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZnVuY3Rpb24ga2luZE9mKHZhbCkge1xuICBpZiAodmFsID09PSBudWxsKSB7XG4gICAgcmV0dXJuICdudWxsJztcbiAgfVxuXG4gIGlmICh2YWwgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiAndW5kZWZpbmVkJztcbiAgfVxuXG4gIGlmICh0eXBlb2YgdmFsICE9PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiB0eXBlb2YgdmFsO1xuICB9XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsKSkge1xuICAgIHJldHVybiAnYXJyYXknO1xuICB9XG5cbiAgcmV0dXJuIHt9LnRvU3RyaW5nLmNhbGwodmFsKVxuICAgIC5zbGljZSg4LCAtMSkudG9Mb3dlckNhc2UoKTtcbn07XG5cblxuXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGRhdGVGb3JtYXQ7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBkYXRlRm9ybWF0O1xuICB9IGVsc2Uge1xuICAgIGdsb2JhbC5kYXRlRm9ybWF0ID0gZGF0ZUZvcm1hdDtcbiAgfVxufSkodGhpcyk7XG4iLCIvKiFcbiAqIHJlcGVhdC1zdHJpbmcgPGh0dHBzOi8vZ2l0aHViLmNvbS9qb25zY2hsaW5rZXJ0L3JlcGVhdC1zdHJpbmc+XG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LTIwMTUsIEpvbiBTY2hsaW5rZXJ0LlxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBSZXN1bHRzIGNhY2hlXG4gKi9cblxudmFyIHJlcyA9ICcnO1xudmFyIGNhY2hlO1xuXG4vKipcbiAqIEV4cG9zZSBgcmVwZWF0YFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gcmVwZWF0O1xuXG4vKipcbiAqIFJlcGVhdCB0aGUgZ2l2ZW4gYHN0cmluZ2AgdGhlIHNwZWNpZmllZCBgbnVtYmVyYFxuICogb2YgdGltZXMuXG4gKlxuICogKipFeGFtcGxlOioqXG4gKlxuICogYGBganNcbiAqIHZhciByZXBlYXQgPSByZXF1aXJlKCdyZXBlYXQtc3RyaW5nJyk7XG4gKiByZXBlYXQoJ0EnLCA1KTtcbiAqIC8vPT4gQUFBQUFcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBgc3RyaW5nYCBUaGUgc3RyaW5nIHRvIHJlcGVhdFxuICogQHBhcmFtIHtOdW1iZXJ9IGBudW1iZXJgIFRoZSBudW1iZXIgb2YgdGltZXMgdG8gcmVwZWF0IHRoZSBzdHJpbmdcbiAqIEByZXR1cm4ge1N0cmluZ30gUmVwZWF0ZWQgc3RyaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIHJlcGVhdChzdHIsIG51bSkge1xuICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdleHBlY3RlZCBhIHN0cmluZycpO1xuICB9XG5cbiAgLy8gY292ZXIgY29tbW9uLCBxdWljayB1c2UgY2FzZXNcbiAgaWYgKG51bSA9PT0gMSkgcmV0dXJuIHN0cjtcbiAgaWYgKG51bSA9PT0gMikgcmV0dXJuIHN0ciArIHN0cjtcblxuICB2YXIgbWF4ID0gc3RyLmxlbmd0aCAqIG51bTtcbiAgaWYgKGNhY2hlICE9PSBzdHIgfHwgdHlwZW9mIGNhY2hlID09PSAndW5kZWZpbmVkJykge1xuICAgIGNhY2hlID0gc3RyO1xuICAgIHJlcyA9ICcnO1xuICB9IGVsc2UgaWYgKHJlcy5sZW5ndGggPj0gbWF4KSB7XG4gICAgcmV0dXJuIHJlcy5zdWJzdHIoMCwgbWF4KTtcbiAgfVxuXG4gIHdoaWxlIChtYXggPiByZXMubGVuZ3RoICYmIG51bSA+IDEpIHtcbiAgICBpZiAobnVtICYgMSkge1xuICAgICAgcmVzICs9IHN0cjtcbiAgICB9XG5cbiAgICBudW0gPj49IDE7XG4gICAgc3RyICs9IHN0cjtcbiAgfVxuXG4gIHJlcyArPSBzdHI7XG4gIHJlcyA9IHJlcy5zdWJzdHIoMCwgbWF4KTtcbiAgcmV0dXJuIHJlcztcbn1cbiIsIi8qIVxuICogcGFkLWxlZnQgPGh0dHBzOi8vZ2l0aHViLmNvbS9qb25zY2hsaW5rZXJ0L3BhZC1sZWZ0PlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNC0yMDE1LCBKb24gU2NobGlua2VydC5cbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciByZXBlYXQgPSByZXF1aXJlKCdyZXBlYXQtc3RyaW5nJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFkTGVmdChzdHIsIG51bSwgY2gpIHtcbiAgc3RyID0gc3RyLnRvU3RyaW5nKCk7XG5cbiAgaWYgKHR5cGVvZiBudW0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxuXG4gIGlmIChjaCA9PT0gMCkge1xuICAgIGNoID0gJzAnO1xuICB9IGVsc2UgaWYgKGNoKSB7XG4gICAgY2ggPSBjaC50b1N0cmluZygpO1xuICB9IGVsc2Uge1xuICAgIGNoID0gJyAnO1xuICB9XG5cbiAgcmV0dXJuIHJlcGVhdChjaCwgbnVtIC0gc3RyLmxlbmd0aCkgKyBzdHI7XG59O1xuIiwiaW1wb3J0IGRhdGVmb3JtYXQgZnJvbSAnZGF0ZWZvcm1hdCc7XG5pbXBvcnQgYXNzaWduIGZyb20gJ29iamVjdC1hc3NpZ24nO1xuaW1wb3J0IHBhZExlZnQgZnJvbSAncGFkLWxlZnQnO1xuaW1wb3J0IHsgZ2V0Q2xpZW50QVBJIH0gZnJvbSAnLi91dGlsJztcblxuY29uc3Qgbm9vcCA9ICgpID0+IHt9O1xubGV0IGxpbms7XG5cbi8vIEFsdGVybmF0aXZlIHNvbHV0aW9uIGZvciBzYXZpbmcgZmlsZXMsXG4vLyBhIGJpdCBzbG93ZXIgYW5kIGRvZXMgbm90IHdvcmsgaW4gU2FmYXJpXG4vLyBmdW5jdGlvbiBmZXRjaEJsb2JGcm9tRGF0YVVSTCAoZGF0YVVSTCkge1xuLy8gICByZXR1cm4gd2luZG93LmZldGNoKGRhdGFVUkwpLnRoZW4ocmVzID0+IHJlcy5ibG9iKCkpO1xuLy8gfVxuXG5jb25zdCBzdXBwb3J0ZWRFbmNvZGluZ3MgPSBbXG4gICdpbWFnZS9wbmcnLFxuICAnaW1hZ2UvanBlZycsXG4gICdpbWFnZS93ZWJwJ1xuXTtcblxuZXhwb3J0IGZ1bmN0aW9uIGV4cG9ydENhbnZhcyAoY2FudmFzLCBvcHQgPSB7fSkge1xuICBjb25zdCBlbmNvZGluZyA9IG9wdC5lbmNvZGluZyB8fCAnaW1hZ2UvcG5nJztcbiAgaWYgKCFzdXBwb3J0ZWRFbmNvZGluZ3MuaW5jbHVkZXMoZW5jb2RpbmcpKSB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgY2FudmFzIGVuY29kaW5nICR7ZW5jb2Rpbmd9YCk7XG4gIGxldCBleHRlbnNpb24gPSAoZW5jb2Rpbmcuc3BsaXQoJy8nKVsxXSB8fCAnJykucmVwbGFjZSgvanBlZy9pLCAnanBnJyk7XG4gIGlmIChleHRlbnNpb24pIGV4dGVuc2lvbiA9IGAuJHtleHRlbnNpb259YC50b0xvd2VyQ2FzZSgpO1xuICByZXR1cm4ge1xuICAgIGV4dGVuc2lvbixcbiAgICB0eXBlOiBlbmNvZGluZyxcbiAgICBkYXRhVVJMOiBjYW52YXMudG9EYXRhVVJMKGVuY29kaW5nLCBvcHQuZW5jb2RpbmdRdWFsaXR5KVxuICB9O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVCbG9iRnJvbURhdGFVUkwgKGRhdGFVUkwpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgY29uc3Qgc3BsaXRJbmRleCA9IGRhdGFVUkwuaW5kZXhPZignLCcpO1xuICAgIGlmIChzcGxpdEluZGV4ID09PSAtMSkge1xuICAgICAgcmVzb2x2ZShuZXcgd2luZG93LkJsb2IoKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGJhc2U2NCA9IGRhdGFVUkwuc2xpY2Uoc3BsaXRJbmRleCArIDEpO1xuICAgIGNvbnN0IGJ5dGVTdHJpbmcgPSB3aW5kb3cuYXRvYihiYXNlNjQpO1xuICAgIGNvbnN0IG1pbWVNYXRjaCA9IC9kYXRhOihbXjsrXSk7Ly5leGVjKGRhdGFVUkwpO1xuICAgIGNvbnN0IG1pbWUgPSAobWltZU1hdGNoID8gbWltZU1hdGNoWzFdIDogJycpIHx8IHVuZGVmaW5lZDtcbiAgICBjb25zdCBhYiA9IG5ldyBBcnJheUJ1ZmZlcihieXRlU3RyaW5nLmxlbmd0aCk7XG4gICAgY29uc3QgaWEgPSBuZXcgVWludDhBcnJheShhYik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBieXRlU3RyaW5nLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpYVtpXSA9IGJ5dGVTdHJpbmcuY2hhckNvZGVBdChpKTtcbiAgICB9XG4gICAgcmVzb2x2ZShuZXcgd2luZG93LkJsb2IoWyBhYiBdLCB7IHR5cGU6IG1pbWUgfSkpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhdmVEYXRhVVJMIChkYXRhVVJMLCBvcHRzID0ge30pIHtcbiAgcmV0dXJuIGNyZWF0ZUJsb2JGcm9tRGF0YVVSTChkYXRhVVJMKVxuICAgIC50aGVuKGJsb2IgPT4gc2F2ZUJsb2IoYmxvYiwgb3B0cykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2F2ZUJsb2IgKGJsb2IsIG9wdHMgPSB7fSkge1xuICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgb3B0cyA9IGFzc2lnbih7IGV4dGVuc2lvbjogJycsIHByZWZpeDogJycsIHN1ZmZpeDogJycgfSwgb3B0cyk7XG4gICAgY29uc3QgZmlsZW5hbWUgPSByZXNvbHZlRmlsZW5hbWUob3B0cyk7XG5cbiAgICBjb25zdCBjbGllbnQgPSBnZXRDbGllbnRBUEkoKTtcbiAgICBpZiAoY2xpZW50ICYmIHR5cGVvZiBjbGllbnQuc2F2ZUJsb2IgPT09ICdmdW5jdGlvbicgJiYgY2xpZW50Lm91dHB1dCkge1xuICAgICAgLy8gbmF0aXZlIHNhdmluZyB1c2luZyBhIENMSSB0b29sXG4gICAgICByZXR1cm4gY2xpZW50LnNhdmVCbG9iKGJsb2IsIGFzc2lnbih7fSwgb3B0cywgeyBmaWxlbmFtZSB9KSlcbiAgICAgICAgLnRoZW4oZXYgPT4gcmVzb2x2ZShldikpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBmb3JjZSBkb3dubG9hZFxuICAgICAgaWYgKCFsaW5rKSB7XG4gICAgICAgIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgIGxpbmsuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICAgICAgICBsaW5rLnRhcmdldCA9ICdfYmxhbmsnO1xuICAgICAgfVxuICAgICAgbGluay5kb3dubG9hZCA9IGZpbGVuYW1lO1xuICAgICAgbGluay5ocmVmID0gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxpbmspO1xuICAgICAgbGluay5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgICBsaW5rLm9uY2xpY2sgPSBub29wO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB3aW5kb3cuVVJMLnJldm9rZU9iamVjdFVSTChibG9iKTtcbiAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGxpbmspO1xuICAgICAgICAgIGxpbmsucmVtb3ZlQXR0cmlidXRlKCdocmVmJyk7XG4gICAgICAgICAgcmVzb2x2ZSh7IGZpbGVuYW1lLCBjbGllbnQ6IGZhbHNlIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgICBsaW5rLmNsaWNrKCk7XG4gICAgfVxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhdmVGaWxlIChkYXRhLCBvcHRzID0ge30pIHtcbiAgY29uc3QgcGFydHMgPSBBcnJheS5pc0FycmF5KGRhdGEpID8gZGF0YSA6IFsgZGF0YSBdO1xuICBjb25zdCBibG9iID0gbmV3IHdpbmRvdy5CbG9iKHBhcnRzLCB7IHR5cGU6IG9wdHMudHlwZSB8fCAnJyB9KTtcbiAgcmV0dXJuIHNhdmVCbG9iKGJsb2IsIG9wdHMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RmlsZU5hbWUgKCkge1xuICBjb25zdCBkYXRlRm9ybWF0U3RyID0gYHl5eXkubW0uZGQtSEguTU0uc3NgO1xuICByZXR1cm4gZGF0ZWZvcm1hdChuZXcgRGF0ZSgpLCBkYXRlRm9ybWF0U3RyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldERlZmF1bHRGaWxlIChwcmVmaXggPSAnJywgc3VmZml4ID0gJycsIGV4dCkge1xuICAvLyBjb25zdCBkYXRlRm9ybWF0U3RyID0gYHl5eXkubW0uZGQtSEguTU0uc3NgO1xuICBjb25zdCBkYXRlRm9ybWF0U3RyID0gYHl5eXktbW0tZGQgJ2F0JyBoLk1NLnNzIFRUYDtcbiAgcmV0dXJuIGAke3ByZWZpeH0ke2RhdGVmb3JtYXQobmV3IERhdGUoKSwgZGF0ZUZvcm1hdFN0cil9JHtzdWZmaXh9JHtleHR9YDtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUZpbGVuYW1lIChvcHQgPSB7fSkge1xuICBvcHQgPSBhc3NpZ24oe30sIG9wdCk7XG5cbiAgLy8gQ3VzdG9tIGZpbGVuYW1lIGZ1bmN0aW9uXG4gIGlmICh0eXBlb2Ygb3B0LmZpbGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gb3B0LmZpbGUob3B0KTtcbiAgfSBlbHNlIGlmIChvcHQuZmlsZSkge1xuICAgIHJldHVybiBvcHQuZmlsZTtcbiAgfVxuXG4gIGxldCBmcmFtZSA9IG51bGw7XG4gIGxldCBleHRlbnNpb24gPSAnJztcbiAgaWYgKHR5cGVvZiBvcHQuZXh0ZW5zaW9uID09PSAnc3RyaW5nJykgZXh0ZW5zaW9uID0gb3B0LmV4dGVuc2lvbjtcblxuICBpZiAodHlwZW9mIG9wdC5mcmFtZSA9PT0gJ251bWJlcicpIHtcbiAgICBsZXQgdG90YWxGcmFtZXM7XG4gICAgaWYgKHR5cGVvZiBvcHQudG90YWxGcmFtZXMgPT09ICdudW1iZXInKSB7XG4gICAgICB0b3RhbEZyYW1lcyA9IG9wdC50b3RhbEZyYW1lcztcbiAgICB9IGVsc2Uge1xuICAgICAgdG90YWxGcmFtZXMgPSBNYXRoLm1heCgxMDAwLCBvcHQuZnJhbWUpO1xuICAgIH1cbiAgICBmcmFtZSA9IHBhZExlZnQoU3RyaW5nKG9wdC5mcmFtZSksIFN0cmluZyh0b3RhbEZyYW1lcykubGVuZ3RoLCAnMCcpO1xuICB9XG5cbiAgY29uc3QgbGF5ZXJTdHIgPSBpc0Zpbml0ZShvcHQudG90YWxMYXllcnMpICYmIGlzRmluaXRlKG9wdC5sYXllcikgJiYgb3B0LnRvdGFsTGF5ZXJzID4gMSA/IGAke29wdC5sYXllcn1gIDogJyc7XG4gIGlmIChmcmFtZSAhPSBudWxsKSB7XG4gICAgcmV0dXJuIFsgbGF5ZXJTdHIsIGZyYW1lIF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJy0nKSArIGV4dGVuc2lvbjtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBkZWZhdWx0RmlsZU5hbWUgPSBvcHQudGltZVN0YW1wO1xuICAgIHJldHVybiBbIG9wdC5wcmVmaXgsIG9wdC5uYW1lIHx8IGRlZmF1bHRGaWxlTmFtZSwgbGF5ZXJTdHIsIG9wdC5oYXNoLCBvcHQuc3VmZml4IF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJy0nKSArIGV4dGVuc2lvbjtcbiAgfVxufVxuIiwiLy8gSGFuZGxlIHNvbWUgY29tbW9uIHR5cG9zXG5jb25zdCBjb21tb25UeXBvcyA9IHtcbiAgZGltZW5zaW9uOiAnZGltZW5zaW9ucycsXG4gIGFuaW1hdGVkOiAnYW5pbWF0ZScsXG4gIGFuaW1hdGluZzogJ2FuaW1hdGUnLFxuICB1bml0OiAndW5pdHMnLFxuICBQNTogJ3A1JyxcbiAgcGl4ZWxsYXRlZDogJ3BpeGVsYXRlZCcsXG4gIGxvb3Bpbmc6ICdsb29wJyxcbiAgcGl4ZWxQZXJJbmNoOiAncGl4ZWxzJ1xufTtcblxuLy8gSGFuZGxlIGFsbCBvdGhlciB0eXBvc1xuY29uc3QgYWxsS2V5cyA9IFtcbiAgJ2RpbWVuc2lvbnMnLCAndW5pdHMnLCAncGl4ZWxzUGVySW5jaCcsICdvcmllbnRhdGlvbicsXG4gICdzY2FsZVRvRml0JywgJ3NjYWxlVG9WaWV3JywgJ2JsZWVkJywgJ3BpeGVsUmF0aW8nLFxuICAnZXhwb3J0UGl4ZWxSYXRpbycsICdtYXhQaXhlbFJhdGlvJywgJ3NjYWxlQ29udGV4dCcsXG4gICdyZXNpemVDYW52YXMnLCAnc3R5bGVDYW52YXMnLCAnY2FudmFzJywgJ2NvbnRleHQnLCAnYXR0cmlidXRlcycsXG4gICdwYXJlbnQnLCAnZmlsZScsICduYW1lJywgJ3ByZWZpeCcsICdzdWZmaXgnLCAnYW5pbWF0ZScsICdwbGF5aW5nJyxcbiAgJ2xvb3AnLCAnZHVyYXRpb24nLCAndG90YWxGcmFtZXMnLCAnZnBzJywgJ3BsYXliYWNrUmF0ZScsICd0aW1lU2NhbGUnLFxuICAnZnJhbWUnLCAndGltZScsICdmbHVzaCcsICdwaXhlbGF0ZWQnLCAnaG90a2V5cycsICdwNScsICdpZCcsXG4gICdzY2FsZVRvRml0UGFkZGluZycsICdkYXRhJywgJ3BhcmFtcycsICdlbmNvZGluZycsICdlbmNvZGluZ1F1YWxpdHknXG5dO1xuXG4vLyBUaGlzIGlzIGZhaXJseSBvcGluaW9uYXRlZCBhbmQgZm9yY2VzIHVzZXJzIHRvIHVzZSB0aGUgJ2RhdGEnIHBhcmFtZXRlclxuLy8gaWYgdGhleSB3YW50IHRvIHBhc3MgYWxvbmcgbm9uLXNldHRpbmcgb2JqZWN0cy4uLlxuZXhwb3J0IGNvbnN0IGNoZWNrU2V0dGluZ3MgPSAoc2V0dGluZ3MpID0+IHtcbiAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHNldHRpbmdzKTtcbiAga2V5cy5mb3JFYWNoKGtleSA9PiB7XG4gICAgaWYgKGtleSBpbiBjb21tb25UeXBvcykge1xuICAgICAgY29uc3QgYWN0dWFsID0gY29tbW9uVHlwb3Nba2V5XTtcbiAgICAgIGNvbnNvbGUud2FybihgW2NhbnZhcy1za2V0Y2hdIENvdWxkIG5vdCByZWNvZ25pemUgdGhlIHNldHRpbmcgXCIke2tleX1cIiwgZGlkIHlvdSBtZWFuIFwiJHthY3R1YWx9XCI/YCk7XG4gICAgfSBlbHNlIGlmICghYWxsS2V5cy5pbmNsdWRlcyhrZXkpKSB7XG4gICAgICBjb25zb2xlLndhcm4oYFtjYW52YXMtc2tldGNoXSBDb3VsZCBub3QgcmVjb2duaXplIHRoZSBzZXR0aW5nIFwiJHtrZXl9XCJgKTtcbiAgICB9XG4gIH0pO1xufTtcbiIsImltcG9ydCB7IGdldENsaWVudEFQSSB9IGZyb20gJy4uL3V0aWwnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAob3B0ID0ge30pIHtcbiAgY29uc3QgaGFuZGxlciA9IGV2ID0+IHtcbiAgICBpZiAoIW9wdC5lbmFibGVkKCkpIHJldHVybjtcblxuICAgIGNvbnN0IGNsaWVudCA9IGdldENsaWVudEFQSSgpO1xuICAgIGlmIChldi5rZXlDb2RlID09PSA4MyAmJiAhZXYuYWx0S2V5ICYmIChldi5tZXRhS2V5IHx8IGV2LmN0cmxLZXkpKSB7XG4gICAgICAvLyBDbWQgKyBTXG4gICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgb3B0LnNhdmUoZXYpO1xuICAgIH0gZWxzZSBpZiAoZXYua2V5Q29kZSA9PT0gMzIpIHtcbiAgICAgIC8vIFNwYWNlXG4gICAgICAvLyBUT0RPOiB3aGF0IHRvIGRvIHdpdGggdGhpcz8ga2VlcCBpdCwgb3IgcmVtb3ZlIGl0P1xuICAgICAgb3B0LnRvZ2dsZVBsYXkoZXYpO1xuICAgIH0gZWxzZSBpZiAoY2xpZW50ICYmICFldi5hbHRLZXkgJiYgZXYua2V5Q29kZSA9PT0gNzUgJiYgKGV2Lm1ldGFLZXkgfHwgZXYuY3RybEtleSkpIHtcbiAgICAgIC8vIENtZCArIEssIG9ubHkgd2hlbiBjYW52YXMtc2tldGNoLWNsaSBpcyB1c2VkXG4gICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgb3B0LmNvbW1pdChldik7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGF0dGFjaCA9ICgpID0+IHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGhhbmRsZXIpO1xuICB9O1xuXG4gIGNvbnN0IGRldGFjaCA9ICgpID0+IHtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGhhbmRsZXIpO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgYXR0YWNoLFxuICAgIGRldGFjaFxuICB9O1xufVxuIiwiY29uc3QgZGVmYXVsdFVuaXRzID0gJ21tJztcblxuY29uc3QgZGF0YSA9IFtcbiAgLy8gQ29tbW9uIFBhcGVyIFNpemVzXG4gIC8vIChNb3N0bHkgTm9ydGgtQW1lcmljYW4gYmFzZWQpXG4gIFsgJ3Bvc3RjYXJkJywgMTAxLjYsIDE1Mi40IF0sXG4gIFsgJ3Bvc3Rlci1zbWFsbCcsIDI4MCwgNDMwIF0sXG4gIFsgJ3Bvc3RlcicsIDQ2MCwgNjEwIF0sXG4gIFsgJ3Bvc3Rlci1sYXJnZScsIDYxMCwgOTEwIF0sXG4gIFsgJ2J1c2luZXNzLWNhcmQnLCA1MC44LCA4OC45IF0sXG5cbiAgLy8gUGhvdG9ncmFwaGljIFByaW50IFBhcGVyIFNpemVzXG4gIFsgJzJyJywgNjQsIDg5IF0sXG4gIFsgJzNyJywgODksIDEyNyBdLFxuICBbICc0cicsIDEwMiwgMTUyIF0sXG4gIFsgJzVyJywgMTI3LCAxNzggXSwgLy8gNeKAs3g34oCzXG4gIFsgJzZyJywgMTUyLCAyMDMgXSwgLy8gNuKAs3g44oCzXG4gIFsgJzhyJywgMjAzLCAyNTQgXSwgLy8gOOKAs3gxMOKAs1xuICBbICcxMHInLCAyNTQsIDMwNSBdLCAvLyAxMOKAs3gxMuKAs1xuICBbICcxMXInLCAyNzksIDM1NiBdLCAvLyAxMeKAs3gxNOKAs1xuICBbICcxMnInLCAzMDUsIDM4MSBdLFxuXG4gIC8vIFN0YW5kYXJkIFBhcGVyIFNpemVzXG4gIFsgJ2EwJywgODQxLCAxMTg5IF0sXG4gIFsgJ2ExJywgNTk0LCA4NDEgXSxcbiAgWyAnYTInLCA0MjAsIDU5NCBdLFxuICBbICdhMycsIDI5NywgNDIwIF0sXG4gIFsgJ2E0JywgMjEwLCAyOTcgXSxcbiAgWyAnYTUnLCAxNDgsIDIxMCBdLFxuICBbICdhNicsIDEwNSwgMTQ4IF0sXG4gIFsgJ2E3JywgNzQsIDEwNSBdLFxuICBbICdhOCcsIDUyLCA3NCBdLFxuICBbICdhOScsIDM3LCA1MiBdLFxuICBbICdhMTAnLCAyNiwgMzcgXSxcbiAgWyAnMmEwJywgMTE4OSwgMTY4MiBdLFxuICBbICc0YTAnLCAxNjgyLCAyMzc4IF0sXG4gIFsgJ2IwJywgMTAwMCwgMTQxNCBdLFxuICBbICdiMScsIDcwNywgMTAwMCBdLFxuICBbICdiMSsnLCA3MjAsIDEwMjAgXSxcbiAgWyAnYjInLCA1MDAsIDcwNyBdLFxuICBbICdiMisnLCA1MjAsIDcyMCBdLFxuICBbICdiMycsIDM1MywgNTAwIF0sXG4gIFsgJ2I0JywgMjUwLCAzNTMgXSxcbiAgWyAnYjUnLCAxNzYsIDI1MCBdLFxuICBbICdiNicsIDEyNSwgMTc2IF0sXG4gIFsgJ2I3JywgODgsIDEyNSBdLFxuICBbICdiOCcsIDYyLCA4OCBdLFxuICBbICdiOScsIDQ0LCA2MiBdLFxuICBbICdiMTAnLCAzMSwgNDQgXSxcbiAgWyAnYjExJywgMjIsIDMyIF0sXG4gIFsgJ2IxMicsIDE2LCAyMiBdLFxuICBbICdjMCcsIDkxNywgMTI5NyBdLFxuICBbICdjMScsIDY0OCwgOTE3IF0sXG4gIFsgJ2MyJywgNDU4LCA2NDggXSxcbiAgWyAnYzMnLCAzMjQsIDQ1OCBdLFxuICBbICdjNCcsIDIyOSwgMzI0IF0sXG4gIFsgJ2M1JywgMTYyLCAyMjkgXSxcbiAgWyAnYzYnLCAxMTQsIDE2MiBdLFxuICBbICdjNycsIDgxLCAxMTQgXSxcbiAgWyAnYzgnLCA1NywgODEgXSxcbiAgWyAnYzknLCA0MCwgNTcgXSxcbiAgWyAnYzEwJywgMjgsIDQwIF0sXG4gIFsgJ2MxMScsIDIyLCAzMiBdLFxuICBbICdjMTInLCAxNiwgMjIgXSxcblxuICAvLyBVc2UgaW5jaGVzIGZvciBOb3J0aCBBbWVyaWNhbiBzaXplcyxcbiAgLy8gYXMgaXQgcHJvZHVjZXMgbGVzcyBmbG9hdCBwcmVjaXNpb24gZXJyb3JzXG4gIFsgJ2hhbGYtbGV0dGVyJywgNS41LCA4LjUsICdpbicgXSxcbiAgWyAnbGV0dGVyJywgOC41LCAxMSwgJ2luJyBdLFxuICBbICdsZWdhbCcsIDguNSwgMTQsICdpbicgXSxcbiAgWyAnanVuaW9yLWxlZ2FsJywgNSwgOCwgJ2luJyBdLFxuICBbICdsZWRnZXInLCAxMSwgMTcsICdpbicgXSxcbiAgWyAndGFibG9pZCcsIDExLCAxNywgJ2luJyBdLFxuICBbICdhbnNpLWEnLCA4LjUsIDExLjAsICdpbicgXSxcbiAgWyAnYW5zaS1iJywgMTEuMCwgMTcuMCwgJ2luJyBdLFxuICBbICdhbnNpLWMnLCAxNy4wLCAyMi4wLCAnaW4nIF0sXG4gIFsgJ2Fuc2ktZCcsIDIyLjAsIDM0LjAsICdpbicgXSxcbiAgWyAnYW5zaS1lJywgMzQuMCwgNDQuMCwgJ2luJyBdLFxuICBbICdhcmNoLWEnLCA5LCAxMiwgJ2luJyBdLFxuICBbICdhcmNoLWInLCAxMiwgMTgsICdpbicgXSxcbiAgWyAnYXJjaC1jJywgMTgsIDI0LCAnaW4nIF0sXG4gIFsgJ2FyY2gtZCcsIDI0LCAzNiwgJ2luJyBdLFxuICBbICdhcmNoLWUnLCAzNiwgNDgsICdpbicgXSxcbiAgWyAnYXJjaC1lMScsIDMwLCA0MiwgJ2luJyBdLFxuICBbICdhcmNoLWUyJywgMjYsIDM4LCAnaW4nIF0sXG4gIFsgJ2FyY2gtZTMnLCAyNywgMzksICdpbicgXVxuXTtcblxuZXhwb3J0IGRlZmF1bHQgZGF0YS5yZWR1Y2UoKGRpY3QsIHByZXNldCkgPT4ge1xuICBjb25zdCBpdGVtID0ge1xuICAgIHVuaXRzOiBwcmVzZXRbM10gfHwgZGVmYXVsdFVuaXRzLFxuICAgIGRpbWVuc2lvbnM6IFsgcHJlc2V0WzFdLCBwcmVzZXRbMl0gXVxuICB9O1xuICBkaWN0W3ByZXNldFswXV0gPSBpdGVtO1xuICBkaWN0W3ByZXNldFswXS5yZXBsYWNlKC8tL2csICcgJyldID0gaXRlbTtcbiAgcmV0dXJuIGRpY3Q7XG59LCB7fSk7XG4iLCJpbXBvcnQgcGFwZXJTaXplcyBmcm9tICcuL3BhcGVyLXNpemVzJztcbmltcG9ydCBjb252ZXJ0TGVuZ3RoIGZyb20gJ2NvbnZlcnQtbGVuZ3RoJztcblxuZXhwb3J0IGZ1bmN0aW9uIGdldERpbWVuc2lvbnNGcm9tUHJlc2V0IChkaW1lbnNpb25zLCB1bml0c1RvID0gJ3B4JywgcGl4ZWxzUGVySW5jaCA9IDcyKSB7XG4gIGlmICh0eXBlb2YgZGltZW5zaW9ucyA9PT0gJ3N0cmluZycpIHtcbiAgICBjb25zdCBrZXkgPSBkaW1lbnNpb25zLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKCEoa2V5IGluIHBhcGVyU2l6ZXMpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSBkaW1lbnNpb24gcHJlc2V0IFwiJHtkaW1lbnNpb25zfVwiIGlzIG5vdCBzdXBwb3J0ZWQgb3IgY291bGQgbm90IGJlIGZvdW5kOyB0cnkgdXNpbmcgYTQsIGEzLCBwb3N0Y2FyZCwgbGV0dGVyLCBldGMuYClcbiAgICB9XG4gICAgY29uc3QgcHJlc2V0ID0gcGFwZXJTaXplc1trZXldO1xuICAgIHJldHVybiBwcmVzZXQuZGltZW5zaW9ucy5tYXAoZCA9PiB7XG4gICAgICByZXR1cm4gY29udmVydERpc3RhbmNlKGQsIHByZXNldC51bml0cywgdW5pdHNUbywgcGl4ZWxzUGVySW5jaCk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGRpbWVuc2lvbnM7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnREaXN0YW5jZSAoZGltZW5zaW9uLCB1bml0c0Zyb20gPSAncHgnLCB1bml0c1RvID0gJ3B4JywgcGl4ZWxzUGVySW5jaCA9IDcyKSB7XG4gIHJldHVybiBjb252ZXJ0TGVuZ3RoKGRpbWVuc2lvbiwgdW5pdHNGcm9tLCB1bml0c1RvLCB7XG4gICAgcGl4ZWxzUGVySW5jaCxcbiAgICBwcmVjaXNpb246IDQsXG4gICAgcm91bmRQaXhlbDogdHJ1ZVxuICB9KTtcbn1cbiIsImltcG9ydCBkZWZpbmVkIGZyb20gJ2RlZmluZWQnO1xuaW1wb3J0IHsgZ2V0RGltZW5zaW9uc0Zyb21QcmVzZXQsIGNvbnZlcnREaXN0YW5jZSB9IGZyb20gJy4uL2Rpc3RhbmNlcyc7XG5pbXBvcnQgeyBpc0Jyb3dzZXIgfSBmcm9tICcuLi91dGlsJztcblxuZnVuY3Rpb24gY2hlY2tJZkhhc0RpbWVuc2lvbnMgKHNldHRpbmdzKSB7XG4gIGlmICghc2V0dGluZ3MuZGltZW5zaW9ucykgcmV0dXJuIGZhbHNlO1xuICBpZiAodHlwZW9mIHNldHRpbmdzLmRpbWVuc2lvbnMgPT09ICdzdHJpbmcnKSByZXR1cm4gdHJ1ZTtcbiAgaWYgKEFycmF5LmlzQXJyYXkoc2V0dGluZ3MuZGltZW5zaW9ucykgJiYgc2V0dGluZ3MuZGltZW5zaW9ucy5sZW5ndGggPj0gMikgcmV0dXJuIHRydWU7XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gZ2V0UGFyZW50U2l6ZSAocHJvcHMsIHNldHRpbmdzKSB7XG4gIC8vIFdoZW4gbm8geyBkaW1lbnNpb24gfSBpcyBwYXNzZWQgaW4gbm9kZSwgd2UgZGVmYXVsdCB0byBIVE1MIGNhbnZhcyBzaXplXG4gIGlmICghaXNCcm93c2VyKCkpIHtcbiAgICByZXR1cm4gWyAzMDAsIDE1MCBdO1xuICB9XG5cbiAgbGV0IGVsZW1lbnQgPSBzZXR0aW5ncy5wYXJlbnQgfHwgd2luZG93O1xuXG4gIGlmIChlbGVtZW50ID09PSB3aW5kb3cgfHxcbiAgICAgIGVsZW1lbnQgPT09IGRvY3VtZW50IHx8XG4gICAgICBlbGVtZW50ID09PSBkb2N1bWVudC5ib2R5KSB7XG4gICAgcmV0dXJuIFsgd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCBdO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IHsgd2lkdGgsIGhlaWdodCB9ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICByZXR1cm4gWyB3aWR0aCwgaGVpZ2h0IF07XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVzaXplQ2FudmFzIChwcm9wcywgc2V0dGluZ3MpIHtcbiAgbGV0IHdpZHRoLCBoZWlnaHQ7XG4gIGxldCBzdHlsZVdpZHRoLCBzdHlsZUhlaWdodDtcbiAgbGV0IGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQ7XG5cbiAgY29uc3QgYnJvd3NlciA9IGlzQnJvd3NlcigpO1xuICBjb25zdCBkaW1lbnNpb25zID0gc2V0dGluZ3MuZGltZW5zaW9ucztcbiAgY29uc3QgaGFzRGltZW5zaW9ucyA9IGNoZWNrSWZIYXNEaW1lbnNpb25zKHNldHRpbmdzKTtcbiAgY29uc3QgZXhwb3J0aW5nID0gcHJvcHMuZXhwb3J0aW5nO1xuICBsZXQgc2NhbGVUb0ZpdCA9IGhhc0RpbWVuc2lvbnMgPyBzZXR0aW5ncy5zY2FsZVRvRml0ICE9PSBmYWxzZSA6IGZhbHNlO1xuICBsZXQgc2NhbGVUb1ZpZXcgPSAoIWV4cG9ydGluZyAmJiBoYXNEaW1lbnNpb25zKSA/IHNldHRpbmdzLnNjYWxlVG9WaWV3IDogdHJ1ZTtcbiAgLy8gaW4gbm9kZSwgY2FuY2VsIGJvdGggb2YgdGhlc2Ugb3B0aW9uc1xuICBpZiAoIWJyb3dzZXIpIHNjYWxlVG9GaXQgPSBzY2FsZVRvVmlldyA9IGZhbHNlO1xuICBjb25zdCB1bml0cyA9IHNldHRpbmdzLnVuaXRzO1xuICBjb25zdCBwaXhlbHNQZXJJbmNoID0gKHR5cGVvZiBzZXR0aW5ncy5waXhlbHNQZXJJbmNoID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZShzZXR0aW5ncy5waXhlbHNQZXJJbmNoKSkgPyBzZXR0aW5ncy5waXhlbHNQZXJJbmNoIDogNzI7XG4gIGNvbnN0IGJsZWVkID0gZGVmaW5lZChzZXR0aW5ncy5ibGVlZCwgMCk7XG5cbiAgY29uc3QgZGV2aWNlUGl4ZWxSYXRpbyA9IGJyb3dzZXIgPyB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA6IDE7XG4gIGNvbnN0IGJhc2VQaXhlbFJhdGlvID0gc2NhbGVUb1ZpZXcgPyBkZXZpY2VQaXhlbFJhdGlvIDogMTtcblxuICBsZXQgcGl4ZWxSYXRpbywgZXhwb3J0UGl4ZWxSYXRpbztcblxuICAvLyBJZiBhIHBpeGVsIHJhdGlvIGlzIHNwZWNpZmllZCwgd2Ugd2lsbCB1c2UgaXQuXG4gIC8vIE90aGVyd2lzZTpcbiAgLy8gIC0+IElmIGRpbWVuc2lvbiBpcyBzcGVjaWZpZWQsIHVzZSBiYXNlIHJhdGlvIChpLmUuIHNpemUgZm9yIGV4cG9ydClcbiAgLy8gIC0+IElmIG5vIGRpbWVuc2lvbiBpcyBzcGVjaWZpZWQsIHVzZSBkZXZpY2UgcmF0aW8gKGkuZS4gc2l6ZSBmb3Igc2NyZWVuKVxuICBpZiAodHlwZW9mIHNldHRpbmdzLnBpeGVsUmF0aW8gPT09ICdudW1iZXInICYmIGlzRmluaXRlKHNldHRpbmdzLnBpeGVsUmF0aW8pKSB7XG4gICAgLy8gV2hlbiB7IHBpeGVsUmF0aW8gfSBpcyBzcGVjaWZpZWQsIGl0J3MgYWxzbyB1c2VkIGFzIGRlZmF1bHQgZXhwb3J0UGl4ZWxSYXRpby5cbiAgICBwaXhlbFJhdGlvID0gc2V0dGluZ3MucGl4ZWxSYXRpbztcbiAgICBleHBvcnRQaXhlbFJhdGlvID0gZGVmaW5lZChzZXR0aW5ncy5leHBvcnRQaXhlbFJhdGlvLCBwaXhlbFJhdGlvKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoaGFzRGltZW5zaW9ucykge1xuICAgICAgLy8gV2hlbiBhIGRpbWVuc2lvbiBpcyBzcGVjaWZpZWQsIHVzZSB0aGUgYmFzZSByYXRpbyByYXRoZXIgdGhhbiBzY3JlZW4gcmF0aW9cbiAgICAgIHBpeGVsUmF0aW8gPSBiYXNlUGl4ZWxSYXRpbztcbiAgICAgIC8vIERlZmF1bHQgdG8gYSBwaXhlbCByYXRpbyBvZiAxIHNvIHRoYXQgeW91IGVuZCB1cCB3aXRoIHRoZSBzYW1lIGRpbWVuc2lvblxuICAgICAgLy8geW91IHNwZWNpZmllZCwgaS5lLiBbIDUwMCwgNTAwIF0gaXMgZXhwb3J0ZWQgYXMgNTAweDUwMCBweFxuICAgICAgZXhwb3J0UGl4ZWxSYXRpbyA9IGRlZmluZWQoc2V0dGluZ3MuZXhwb3J0UGl4ZWxSYXRpbywgMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE5vIGRpbWVuc2lvbiBpcyBzcGVjaWZpZWQsIGFzc3VtZSBmdWxsLXNjcmVlbiBzaXppbmdcbiAgICAgIHBpeGVsUmF0aW8gPSBkZXZpY2VQaXhlbFJhdGlvO1xuICAgICAgLy8gRGVmYXVsdCB0byBzY3JlZW4gcGl4ZWwgcmF0aW8sIHNvIHRoYXQgaXQncyBsaWtlIHRha2luZyBhIGRldmljZSBzY3JlZW5zaG90XG4gICAgICBleHBvcnRQaXhlbFJhdGlvID0gZGVmaW5lZChzZXR0aW5ncy5leHBvcnRQaXhlbFJhdGlvLCBwaXhlbFJhdGlvKTtcbiAgICB9XG4gIH1cblxuICAvLyBDbGFtcCBwaXhlbCByYXRpb1xuICBpZiAodHlwZW9mIHNldHRpbmdzLm1heFBpeGVsUmF0aW8gPT09ICdudW1iZXInICYmIGlzRmluaXRlKHNldHRpbmdzLm1heFBpeGVsUmF0aW8pKSB7XG4gICAgcGl4ZWxSYXRpbyA9IE1hdGgubWluKHNldHRpbmdzLm1heFBpeGVsUmF0aW8sIHBpeGVsUmF0aW8pO1xuICAgIGV4cG9ydFBpeGVsUmF0aW8gPSBNYXRoLm1pbihzZXR0aW5ncy5tYXhQaXhlbFJhdGlvLCBleHBvcnRQaXhlbFJhdGlvKTtcbiAgfVxuXG4gIC8vIEhhbmRsZSBleHBvcnQgcGl4ZWwgcmF0aW9cbiAgaWYgKGV4cG9ydGluZykge1xuICAgIHBpeGVsUmF0aW8gPSBleHBvcnRQaXhlbFJhdGlvO1xuICB9XG5cbiAgLy8gcGFyZW50V2lkdGggPSB0eXBlb2YgcGFyZW50V2lkdGggPT09ICd1bmRlZmluZWQnID8gZGVmYXVsdE5vZGVTaXplWzBdIDogcGFyZW50V2lkdGg7XG4gIC8vIHBhcmVudEhlaWdodCA9IHR5cGVvZiBwYXJlbnRIZWlnaHQgPT09ICd1bmRlZmluZWQnID8gZGVmYXVsdE5vZGVTaXplWzFdIDogcGFyZW50SGVpZ2h0O1xuXG4gIGxldCBbIHBhcmVudFdpZHRoLCBwYXJlbnRIZWlnaHQgXSA9IGdldFBhcmVudFNpemUocHJvcHMsIHNldHRpbmdzKTtcbiAgbGV0IHRyaW1XaWR0aCwgdHJpbUhlaWdodDtcblxuICAvLyBZb3UgY2FuIHNwZWNpZnkgYSBkaW1lbnNpb25zIGluIHBpeGVscyBvciBjbS9tL2luL2V0Y1xuICBpZiAoaGFzRGltZW5zaW9ucykge1xuICAgIGNvbnN0IHJlc3VsdCA9IGdldERpbWVuc2lvbnNGcm9tUHJlc2V0KGRpbWVuc2lvbnMsIHVuaXRzLCBwaXhlbHNQZXJJbmNoKTtcbiAgICBjb25zdCBoaWdoZXN0ID0gTWF0aC5tYXgocmVzdWx0WzBdLCByZXN1bHRbMV0pO1xuICAgIGNvbnN0IGxvd2VzdCA9IE1hdGgubWluKHJlc3VsdFswXSwgcmVzdWx0WzFdKTtcbiAgICBpZiAoc2V0dGluZ3Mub3JpZW50YXRpb24pIHtcbiAgICAgIGNvbnN0IGxhbmRzY2FwZSA9IHNldHRpbmdzLm9yaWVudGF0aW9uID09PSAnbGFuZHNjYXBlJztcbiAgICAgIHdpZHRoID0gbGFuZHNjYXBlID8gaGlnaGVzdCA6IGxvd2VzdDtcbiAgICAgIGhlaWdodCA9IGxhbmRzY2FwZSA/IGxvd2VzdCA6IGhpZ2hlc3Q7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdpZHRoID0gcmVzdWx0WzBdO1xuICAgICAgaGVpZ2h0ID0gcmVzdWx0WzFdO1xuICAgIH1cblxuICAgIHRyaW1XaWR0aCA9IHdpZHRoO1xuICAgIHRyaW1IZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICAvLyBBcHBseSBibGVlZCB3aGljaCBpcyBhc3N1bWVkIHRvIGJlIGluIHRoZSBzYW1lIHVuaXRzXG4gICAgd2lkdGggKz0gYmxlZWQgKiAyO1xuICAgIGhlaWdodCArPSBibGVlZCAqIDI7XG4gIH0gZWxzZSB7XG4gICAgd2lkdGggPSBwYXJlbnRXaWR0aDtcbiAgICBoZWlnaHQgPSBwYXJlbnRIZWlnaHQ7XG4gICAgdHJpbVdpZHRoID0gd2lkdGg7XG4gICAgdHJpbUhlaWdodCA9IGhlaWdodDtcbiAgfVxuXG4gIC8vIFJlYWwgc2l6ZSBpbiBwaXhlbHMgYWZ0ZXIgUFBJIGlzIHRha2VuIGludG8gYWNjb3VudFxuICBsZXQgcmVhbFdpZHRoID0gd2lkdGg7XG4gIGxldCByZWFsSGVpZ2h0ID0gaGVpZ2h0O1xuICBpZiAoaGFzRGltZW5zaW9ucyAmJiB1bml0cykge1xuICAgIC8vIENvbnZlcnQgdG8gZGlnaXRhbC9waXhlbCB1bml0cyBpZiBuZWNlc3NhcnlcbiAgICByZWFsV2lkdGggPSBjb252ZXJ0RGlzdGFuY2Uod2lkdGgsIHVuaXRzLCAncHgnLCBwaXhlbHNQZXJJbmNoKTtcbiAgICByZWFsSGVpZ2h0ID0gY29udmVydERpc3RhbmNlKGhlaWdodCwgdW5pdHMsICdweCcsIHBpeGVsc1BlckluY2gpO1xuICB9XG5cbiAgLy8gSG93IGJpZyB0byBzZXQgdGhlICd2aWV3JyBvZiB0aGUgY2FudmFzIGluIHRoZSBicm93c2VyIChpLmUuIHN0eWxlKVxuICBzdHlsZVdpZHRoID0gTWF0aC5yb3VuZChyZWFsV2lkdGgpO1xuICBzdHlsZUhlaWdodCA9IE1hdGgucm91bmQocmVhbEhlaWdodCk7XG5cbiAgLy8gSWYgd2Ugd2lzaCB0byBzY2FsZSB0aGUgdmlldyB0byB0aGUgYnJvd3NlciB3aW5kb3dcbiAgaWYgKHNjYWxlVG9GaXQgJiYgIWV4cG9ydGluZyAmJiBoYXNEaW1lbnNpb25zKSB7XG4gICAgY29uc3QgYXNwZWN0ID0gd2lkdGggLyBoZWlnaHQ7XG4gICAgY29uc3Qgd2luZG93QXNwZWN0ID0gcGFyZW50V2lkdGggLyBwYXJlbnRIZWlnaHQ7XG4gICAgY29uc3Qgc2NhbGVUb0ZpdFBhZGRpbmcgPSBkZWZpbmVkKHNldHRpbmdzLnNjYWxlVG9GaXRQYWRkaW5nLCA0MCk7XG4gICAgY29uc3QgbWF4V2lkdGggPSBNYXRoLnJvdW5kKHBhcmVudFdpZHRoIC0gc2NhbGVUb0ZpdFBhZGRpbmcgKiAyKTtcbiAgICBjb25zdCBtYXhIZWlnaHQgPSBNYXRoLnJvdW5kKHBhcmVudEhlaWdodCAtIHNjYWxlVG9GaXRQYWRkaW5nICogMik7XG4gICAgaWYgKHN0eWxlV2lkdGggPiBtYXhXaWR0aCB8fCBzdHlsZUhlaWdodCA+IG1heEhlaWdodCkge1xuICAgICAgaWYgKHdpbmRvd0FzcGVjdCA+IGFzcGVjdCkge1xuICAgICAgICBzdHlsZUhlaWdodCA9IG1heEhlaWdodDtcbiAgICAgICAgc3R5bGVXaWR0aCA9IE1hdGgucm91bmQoc3R5bGVIZWlnaHQgKiBhc3BlY3QpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3R5bGVXaWR0aCA9IG1heFdpZHRoO1xuICAgICAgICBzdHlsZUhlaWdodCA9IE1hdGgucm91bmQoc3R5bGVXaWR0aCAvIGFzcGVjdCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY2FudmFzV2lkdGggPSBzY2FsZVRvVmlldyA/IE1hdGgucm91bmQocGl4ZWxSYXRpbyAqIHN0eWxlV2lkdGgpIDogTWF0aC5yb3VuZChwaXhlbFJhdGlvICogcmVhbFdpZHRoKTtcbiAgY2FudmFzSGVpZ2h0ID0gc2NhbGVUb1ZpZXcgPyBNYXRoLnJvdW5kKHBpeGVsUmF0aW8gKiBzdHlsZUhlaWdodCkgOiBNYXRoLnJvdW5kKHBpeGVsUmF0aW8gKiByZWFsSGVpZ2h0KTtcblxuICBjb25zdCB2aWV3cG9ydFdpZHRoID0gc2NhbGVUb1ZpZXcgPyBNYXRoLnJvdW5kKHN0eWxlV2lkdGgpIDogTWF0aC5yb3VuZChyZWFsV2lkdGgpO1xuICBjb25zdCB2aWV3cG9ydEhlaWdodCA9IHNjYWxlVG9WaWV3ID8gTWF0aC5yb3VuZChzdHlsZUhlaWdodCkgOiBNYXRoLnJvdW5kKHJlYWxIZWlnaHQpO1xuXG4gIGNvbnN0IHNjYWxlWCA9IGNhbnZhc1dpZHRoIC8gd2lkdGg7XG4gIGNvbnN0IHNjYWxlWSA9IGNhbnZhc0hlaWdodCAvIGhlaWdodDtcblxuICAvLyBBc3NpZ24gdG8gY3VycmVudCBwcm9wc1xuICByZXR1cm4ge1xuICAgIGJsZWVkLFxuICAgIHBpeGVsUmF0aW8sXG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0LFxuICAgIGRpbWVuc2lvbnM6IFsgd2lkdGgsIGhlaWdodCBdLFxuICAgIHVuaXRzOiB1bml0cyB8fCAncHgnLFxuICAgIHNjYWxlWCxcbiAgICBzY2FsZVksXG4gICAgdmlld3BvcnRXaWR0aCxcbiAgICB2aWV3cG9ydEhlaWdodCxcbiAgICBjYW52YXNXaWR0aCxcbiAgICBjYW52YXNIZWlnaHQsXG4gICAgdHJpbVdpZHRoLFxuICAgIHRyaW1IZWlnaHQsXG4gICAgc3R5bGVXaWR0aCxcbiAgICBzdHlsZUhlaWdodFxuICB9O1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBnZXRDYW52YXNDb250ZXh0XG5mdW5jdGlvbiBnZXRDYW52YXNDb250ZXh0ICh0eXBlLCBvcHRzKSB7XG4gIGlmICh0eXBlb2YgdHlwZSAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdtdXN0IHNwZWNpZnkgdHlwZSBzdHJpbmcnKVxuICB9XG5cbiAgb3B0cyA9IG9wdHMgfHwge31cblxuICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJyAmJiAhb3B0cy5jYW52YXMpIHtcbiAgICByZXR1cm4gbnVsbCAvLyBjaGVjayBmb3IgTm9kZVxuICB9XG5cbiAgdmFyIGNhbnZhcyA9IG9wdHMuY2FudmFzIHx8IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gIGlmICh0eXBlb2Ygb3B0cy53aWR0aCA9PT0gJ251bWJlcicpIHtcbiAgICBjYW52YXMud2lkdGggPSBvcHRzLndpZHRoXG4gIH1cbiAgaWYgKHR5cGVvZiBvcHRzLmhlaWdodCA9PT0gJ251bWJlcicpIHtcbiAgICBjYW52YXMuaGVpZ2h0ID0gb3B0cy5oZWlnaHRcbiAgfVxuXG4gIHZhciBhdHRyaWJzID0gb3B0c1xuICB2YXIgZ2xcbiAgdHJ5IHtcbiAgICB2YXIgbmFtZXMgPSBbIHR5cGUgXVxuICAgIC8vIHByZWZpeCBHTCBjb250ZXh0c1xuICAgIGlmICh0eXBlLmluZGV4T2YoJ3dlYmdsJykgPT09IDApIHtcbiAgICAgIG5hbWVzLnB1c2goJ2V4cGVyaW1lbnRhbC0nICsgdHlwZSlcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBnbCA9IGNhbnZhcy5nZXRDb250ZXh0KG5hbWVzW2ldLCBhdHRyaWJzKVxuICAgICAgaWYgKGdsKSByZXR1cm4gZ2xcbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBnbCA9IG51bGxcbiAgfVxuICByZXR1cm4gKGdsIHx8IG51bGwpIC8vIGVuc3VyZSBudWxsIG9uIGZhaWxcbn1cbiIsImltcG9ydCBhc3NpZ24gZnJvbSAnb2JqZWN0LWFzc2lnbic7XG5pbXBvcnQgZ2V0Q2FudmFzQ29udGV4dCBmcm9tICdnZXQtY2FudmFzLWNvbnRleHQnO1xuaW1wb3J0IHsgaXNCcm93c2VyIH0gZnJvbSAnLi4vdXRpbCc7XG5cbmZ1bmN0aW9uIGNyZWF0ZUNhbnZhc0VsZW1lbnQgKCkge1xuICBpZiAoIWlzQnJvd3NlcigpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJdCBhcHBlYXJzIHlvdSBhcmUgcnVuaW5nIGZyb20gTm9kZS5qcyBvciBhIG5vbi1icm93c2VyIGVudmlyb25tZW50LiBUcnkgcGFzc2luZyBpbiBhbiBleGlzdGluZyB7IGNhbnZhcyB9IGludGVyZmFjZSBpbnN0ZWFkLicpO1xuICB9XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlQ2FudmFzIChzZXR0aW5ncyA9IHt9KSB7XG4gIGxldCBjb250ZXh0LCBjYW52YXM7XG4gIGxldCBvd25zQ2FudmFzID0gZmFsc2U7XG4gIGlmIChzZXR0aW5ncy5jYW52YXMgIT09IGZhbHNlKSB7XG4gICAgLy8gRGV0ZXJtaW5lIHRoZSBjYW52YXMgYW5kIGNvbnRleHQgdG8gY3JlYXRlXG4gICAgY29udGV4dCA9IHNldHRpbmdzLmNvbnRleHQ7XG4gICAgaWYgKCFjb250ZXh0IHx8IHR5cGVvZiBjb250ZXh0ID09PSAnc3RyaW5nJykge1xuICAgICAgbGV0IG5ld0NhbnZhcyA9IHNldHRpbmdzLmNhbnZhcztcbiAgICAgIGlmICghbmV3Q2FudmFzKSB7XG4gICAgICAgIG5ld0NhbnZhcyA9IGNyZWF0ZUNhbnZhc0VsZW1lbnQoKTtcbiAgICAgICAgb3duc0NhbnZhcyA9IHRydWU7XG4gICAgICB9XG4gICAgICBjb25zdCB0eXBlID0gY29udGV4dCB8fCAnMmQnO1xuICAgICAgaWYgKHR5cGVvZiBuZXdDYW52YXMuZ2V0Q29udGV4dCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSBzcGVjaWZpZWQgeyBjYW52YXMgfSBlbGVtZW50IGRvZXMgbm90IGhhdmUgYSBnZXRDb250ZXh0KCkgZnVuY3Rpb24sIG1heWJlIGl0IGlzIG5vdCBhIDxjYW52YXM+IHRhZz9gKTtcbiAgICAgIH1cbiAgICAgIGNvbnRleHQgPSBnZXRDYW52YXNDb250ZXh0KHR5cGUsIGFzc2lnbih7fSwgc2V0dGluZ3MuYXR0cmlidXRlcywgeyBjYW52YXM6IG5ld0NhbnZhcyB9KSk7XG4gICAgICBpZiAoIWNvbnRleHQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgYXQgY2FudmFzLmdldENvbnRleHQoJyR7dHlwZX0nKSAtIHRoZSBicm93c2VyIG1heSBub3Qgc3VwcG9ydCB0aGlzIGNvbnRleHQsIG9yIGEgZGlmZmVyZW50IGNvbnRleHQgbWF5IGFscmVhZHkgYmUgaW4gdXNlIHdpdGggdGhpcyBjYW52YXMuYCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY2FudmFzID0gY29udGV4dC5jYW52YXM7XG4gICAgLy8gRW5zdXJlIGNvbnRleHQgbWF0Y2hlcyB1c2VyJ3MgY2FudmFzIGV4cGVjdGF0aW9uc1xuICAgIGlmIChzZXR0aW5ncy5jYW52YXMgJiYgY2FudmFzICE9PSBzZXR0aW5ncy5jYW52YXMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIHsgY2FudmFzIH0gYW5kIHsgY29udGV4dCB9IHNldHRpbmdzIG11c3QgcG9pbnQgdG8gdGhlIHNhbWUgdW5kZXJseWluZyBjYW52YXMgZWxlbWVudCcpO1xuICAgIH1cblxuICAgIC8vIEFwcGx5IHBpeGVsYXRpb24gdG8gY2FudmFzIGlmIG5lY2Vzc2FyeSwgdGhpcyBpcyBtb3N0bHkgYSBjb252ZW5pZW5jZSB1dGlsaXR5XG4gICAgaWYgKHNldHRpbmdzLnBpeGVsYXRlZCkge1xuICAgICAgY29udGV4dC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICAgIGNvbnRleHQubW96SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gICAgICBjb250ZXh0Lm9JbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICAgIGNvbnRleHQud2Via2l0SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gICAgICBjb250ZXh0Lm1zSW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gICAgICBjYW52YXMuc3R5bGVbJ2ltYWdlLXJlbmRlcmluZyddID0gJ3BpeGVsYXRlZCc7XG4gICAgfVxuICB9XG4gIHJldHVybiB7IGNhbnZhcywgY29udGV4dCwgb3duc0NhbnZhcyB9O1xufVxuIiwiaW1wb3J0IGRlZmluZWQgZnJvbSAnZGVmaW5lZCc7XG5pbXBvcnQgYXNzaWduIGZyb20gJ29iamVjdC1hc3NpZ24nO1xuaW1wb3J0IHJpZ2h0Tm93IGZyb20gJ3JpZ2h0LW5vdyc7XG5pbXBvcnQgaXNQcm9taXNlIGZyb20gJ2lzLXByb21pc2UnO1xuaW1wb3J0IHsgaXNCcm93c2VyLCBpc1dlYkdMQ29udGV4dCwgaXNDYW52YXMsIGdldENsaWVudEFQSSB9IGZyb20gJy4uL3V0aWwnO1xuaW1wb3J0IGRlZXBFcXVhbCBmcm9tICdkZWVwLWVxdWFsJztcbmltcG9ydCB7IHNhdmVGaWxlLCBzYXZlRGF0YVVSTCwgZ2V0RmlsZU5hbWUsIGV4cG9ydENhbnZhcyB9IGZyb20gJy4uL3NhdmUnO1xuaW1wb3J0IHsgY2hlY2tTZXR0aW5ncyB9IGZyb20gJy4uL2FjY2Vzc2liaWxpdHknO1xuXG5pbXBvcnQga2V5Ym9hcmRTaG9ydGN1dHMgZnJvbSAnLi9rZXlib2FyZFNob3J0Y3V0cyc7XG5pbXBvcnQgcmVzaXplQ2FudmFzIGZyb20gJy4vcmVzaXplQ2FudmFzJztcbmltcG9ydCBjcmVhdGVDYW52YXMgZnJvbSAnLi9jcmVhdGVDYW52YXMnO1xuXG5jbGFzcyBTa2V0Y2hNYW5hZ2VyIHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHRoaXMuX3NldHRpbmdzID0ge307XG4gICAgdGhpcy5fcHJvcHMgPSB7fTtcbiAgICB0aGlzLl9za2V0Y2ggPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fcmFmID0gbnVsbDtcblxuICAgIC8vIFNvbWUgaGFja3kgdGhpbmdzIHJlcXVpcmVkIHRvIGdldCBhcm91bmQgcDUuanMgc3RydWN0dXJlXG4gICAgdGhpcy5fbGFzdFJlZHJhd1Jlc3VsdCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9pc1A1UmVzaXppbmcgPSBmYWxzZTtcblxuICAgIHRoaXMuX2tleWJvYXJkU2hvcnRjdXRzID0ga2V5Ym9hcmRTaG9ydGN1dHMoe1xuICAgICAgZW5hYmxlZDogKCkgPT4gdGhpcy5zZXR0aW5ncy5ob3RrZXlzICE9PSBmYWxzZSxcbiAgICAgIHNhdmU6IChldikgPT4ge1xuICAgICAgICBpZiAoZXYuc2hpZnRLZXkpIHtcbiAgICAgICAgICBpZiAodGhpcy5wcm9wcy5yZWNvcmRpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuZW5kUmVjb3JkKCk7XG4gICAgICAgICAgICB0aGlzLnJ1bigpO1xuICAgICAgICAgIH0gZWxzZSB0aGlzLnJlY29yZCgpO1xuICAgICAgICB9IGVsc2UgdGhpcy5leHBvcnRGcmFtZSgpO1xuICAgICAgfSxcbiAgICAgIHRvZ2dsZVBsYXk6ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucGxheWluZykgdGhpcy5wYXVzZSgpO1xuICAgICAgICBlbHNlIHRoaXMucGxheSgpO1xuICAgICAgfSxcbiAgICAgIGNvbW1pdDogKGV2KSA9PiB7XG4gICAgICAgIHRoaXMuZXhwb3J0RnJhbWUoeyBjb21taXQ6IHRydWUgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLl9hbmltYXRlSGFuZGxlciA9ICgpID0+IHRoaXMuYW5pbWF0ZSgpO1xuXG4gICAgdGhpcy5fcmVzaXplSGFuZGxlciA9ICgpID0+IHtcbiAgICAgIGNvbnN0IGNoYW5nZWQgPSB0aGlzLnJlc2l6ZSgpO1xuICAgICAgLy8gT25seSByZS1yZW5kZXIgd2hlbiBzaXplIGFjdHVhbGx5IGNoYW5nZXNcbiAgICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGdldCBza2V0Y2ggKCkge1xuICAgIHJldHVybiB0aGlzLl9za2V0Y2g7XG4gIH1cblxuICBnZXQgc2V0dGluZ3MgKCkge1xuICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgfVxuXG4gIGdldCBwcm9wcyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3BzO1xuICB9XG5cbiAgX2NvbXB1dGVQbGF5aGVhZCAoY3VycmVudFRpbWUsIGR1cmF0aW9uKSB7XG4gICAgY29uc3QgaGFzRHVyYXRpb24gPSB0eXBlb2YgZHVyYXRpb24gPT09ICdudW1iZXInICYmIGlzRmluaXRlKGR1cmF0aW9uKTtcbiAgICByZXR1cm4gaGFzRHVyYXRpb24gPyBjdXJyZW50VGltZSAvIGR1cmF0aW9uIDogMDtcbiAgfVxuXG4gIF9jb21wdXRlRnJhbWUgKHBsYXloZWFkLCB0aW1lLCB0b3RhbEZyYW1lcywgZnBzKSB7XG4gICAgcmV0dXJuIChpc0Zpbml0ZSh0b3RhbEZyYW1lcykgJiYgdG90YWxGcmFtZXMgPiAxKVxuICAgICAgPyBNYXRoLmZsb29yKHBsYXloZWFkICogKHRvdGFsRnJhbWVzIC0gMSkpXG4gICAgICA6IE1hdGguZmxvb3IoZnBzICogdGltZSk7XG4gIH1cblxuICBfY29tcHV0ZUN1cnJlbnRGcmFtZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbXB1dGVGcmFtZShcbiAgICAgIHRoaXMucHJvcHMucGxheWhlYWQsIHRoaXMucHJvcHMudGltZSxcbiAgICAgIHRoaXMucHJvcHMudG90YWxGcmFtZXMsIHRoaXMucHJvcHMuZnBzXG4gICAgKTtcbiAgfVxuXG4gIF9nZXRTaXplUHJvcHMgKCkge1xuICAgIGNvbnN0IHByb3BzID0gdGhpcy5wcm9wcztcbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGg6IHByb3BzLndpZHRoLFxuICAgICAgaGVpZ2h0OiBwcm9wcy5oZWlnaHQsXG4gICAgICBwaXhlbFJhdGlvOiBwcm9wcy5waXhlbFJhdGlvLFxuICAgICAgY2FudmFzV2lkdGg6IHByb3BzLmNhbnZhc1dpZHRoLFxuICAgICAgY2FudmFzSGVpZ2h0OiBwcm9wcy5jYW52YXNIZWlnaHQsXG4gICAgICB2aWV3cG9ydFdpZHRoOiBwcm9wcy52aWV3cG9ydFdpZHRoLFxuICAgICAgdmlld3BvcnRIZWlnaHQ6IHByb3BzLnZpZXdwb3J0SGVpZ2h0XG4gICAgfTtcbiAgfVxuXG4gIHJ1biAoKSB7XG4gICAgaWYgKCF0aGlzLnNrZXRjaCkgdGhyb3cgbmV3IEVycm9yKCdzaG91bGQgd2FpdCB1bnRpbCBza2V0Y2ggaXMgbG9hZGVkIGJlZm9yZSB0cnlpbmcgdG8gcGxheSgpJyk7XG5cbiAgICAvLyBTdGFydCBhbiBhbmltYXRpb24gZnJhbWUgbG9vcCBpZiBuZWNlc3NhcnlcbiAgICBpZiAodGhpcy5zZXR0aW5ncy5wbGF5aW5nICE9PSBmYWxzZSkge1xuICAgICAgdGhpcy5wbGF5KCk7XG4gICAgfVxuXG4gICAgLy8gTGV0J3MgbGV0IHRoaXMgd2FybmluZyBoYW5nIGFyb3VuZCBmb3IgYSBmZXcgdmVyc2lvbnMuLi5cbiAgICBpZiAodHlwZW9mIHRoaXMuc2tldGNoLmRpc3Bvc2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnNvbGUud2FybignSW4gY2FudmFzLXNrZXRjaEAwLjAuMjMgdGhlIGRpc3Bvc2UoKSBldmVudCBoYXMgYmVlbiByZW5hbWVkIHRvIHVubG9hZCgpJyk7XG4gICAgfVxuXG4gICAgLy8gSW4gY2FzZSB3ZSBhcmVuJ3QgcGxheWluZyBvciBhbmltYXRlZCwgbWFrZSBzdXJlIHdlIHN0aWxsIHRyaWdnZXIgYmVnaW4gbWVzc2FnZS4uLlxuICAgIGlmICghdGhpcy5wcm9wcy5zdGFydGVkKSB7XG4gICAgICB0aGlzLl9zaWduYWxCZWdpbigpO1xuICAgICAgdGhpcy5wcm9wcy5zdGFydGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBSZW5kZXIgYW4gaW5pdGlhbCBmcmFtZVxuICAgIHRoaXMudGljaygpO1xuICAgIHRoaXMucmVuZGVyKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwbGF5ICgpIHtcbiAgICBsZXQgYW5pbWF0ZSA9IHRoaXMuc2V0dGluZ3MuYW5pbWF0ZTtcbiAgICBpZiAoJ2FuaW1hdGlvbicgaW4gdGhpcy5zZXR0aW5ncykge1xuICAgICAgYW5pbWF0ZSA9IHRydWU7XG4gICAgICBjb25zb2xlLndhcm4oJ1tjYW52YXMtc2tldGNoXSB7IGFuaW1hdGlvbiB9IGhhcyBiZWVuIHJlbmFtZWQgdG8geyBhbmltYXRlIH0nKTtcbiAgICB9XG4gICAgaWYgKCFhbmltYXRlKSByZXR1cm47XG4gICAgaWYgKCFpc0Jyb3dzZXIoKSkge1xuICAgICAgY29uc29sZS5lcnJvcignW2NhbnZhcy1za2V0Y2hdIFdBUk46IFVzaW5nIHsgYW5pbWF0ZSB9IGluIE5vZGUuanMgaXMgbm90IHlldCBzdXBwb3J0ZWQnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMucHJvcHMucGxheWluZykgcmV0dXJuO1xuICAgIGlmICghdGhpcy5wcm9wcy5zdGFydGVkKSB7XG4gICAgICB0aGlzLl9zaWduYWxCZWdpbigpO1xuICAgICAgdGhpcy5wcm9wcy5zdGFydGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBjb25zb2xlLmxvZygncGxheScsIHRoaXMucHJvcHMudGltZSlcblxuICAgIC8vIFN0YXJ0IGEgcmVuZGVyIGxvb3BcbiAgICB0aGlzLnByb3BzLnBsYXlpbmcgPSB0cnVlO1xuICAgIGlmICh0aGlzLl9yYWYgIT0gbnVsbCkgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX3JhZik7XG4gICAgdGhpcy5fbGFzdFRpbWUgPSByaWdodE5vdygpO1xuICAgIHRoaXMuX3JhZiA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fYW5pbWF0ZUhhbmRsZXIpO1xuICB9XG5cbiAgcGF1c2UgKCkge1xuICAgIGlmICh0aGlzLnByb3BzLnJlY29yZGluZykgdGhpcy5lbmRSZWNvcmQoKTtcbiAgICB0aGlzLnByb3BzLnBsYXlpbmcgPSBmYWxzZTtcblxuICAgIGlmICh0aGlzLl9yYWYgIT0gbnVsbCAmJiBpc0Jyb3dzZXIoKSkge1xuICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX3JhZik7XG4gICAgfVxuICB9XG5cbiAgdG9nZ2xlUGxheSAoKSB7XG4gICAgaWYgKHRoaXMucHJvcHMucGxheWluZykgdGhpcy5wYXVzZSgpO1xuICAgIGVsc2UgdGhpcy5wbGF5KCk7XG4gIH1cblxuICAvLyBTdG9wIGFuZCByZXNldCB0byBmcmFtZSB6ZXJvXG4gIHN0b3AgKCkge1xuICAgIHRoaXMucGF1c2UoKTtcbiAgICB0aGlzLnByb3BzLmZyYW1lID0gMDtcbiAgICB0aGlzLnByb3BzLnBsYXloZWFkID0gMDtcbiAgICB0aGlzLnByb3BzLnRpbWUgPSAwO1xuICAgIHRoaXMucHJvcHMuZGVsdGFUaW1lID0gMDtcbiAgICB0aGlzLnByb3BzLnN0YXJ0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgcmVjb3JkICgpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5yZWNvcmRpbmcpIHJldHVybjtcbiAgICBpZiAoIWlzQnJvd3NlcigpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbY2FudmFzLXNrZXRjaF0gV0FSTjogUmVjb3JkaW5nIGZyb20gTm9kZS5qcyBpcyBub3QgeWV0IHN1cHBvcnRlZCcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuc3RvcCgpO1xuICAgIHRoaXMucHJvcHMucGxheWluZyA9IHRydWU7XG4gICAgdGhpcy5wcm9wcy5yZWNvcmRpbmcgPSB0cnVlO1xuXG4gICAgY29uc3QgZnJhbWVJbnRlcnZhbCA9IDEgLyB0aGlzLnByb3BzLmZwcztcbiAgICAvLyBSZW5kZXIgZWFjaCBmcmFtZSBpbiB0aGUgc2VxdWVuY2VcbiAgICBpZiAodGhpcy5fcmFmICE9IG51bGwpIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9yYWYpO1xuICAgIGNvbnN0IHRpY2sgPSAoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMucHJvcHMucmVjb3JkaW5nKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICB0aGlzLnByb3BzLmRlbHRhVGltZSA9IGZyYW1lSW50ZXJ2YWw7XG4gICAgICB0aGlzLnRpY2soKTtcbiAgICAgIHJldHVybiB0aGlzLmV4cG9ydEZyYW1lKHsgc2VxdWVuY2U6IHRydWUgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGlmICghdGhpcy5wcm9wcy5yZWNvcmRpbmcpIHJldHVybjsgLy8gd2FzIGNhbmNlbGxlZCBiZWZvcmVcbiAgICAgICAgICB0aGlzLnByb3BzLmRlbHRhVGltZSA9IDA7XG4gICAgICAgICAgdGhpcy5wcm9wcy5mcmFtZSsrO1xuICAgICAgICAgIGlmICh0aGlzLnByb3BzLmZyYW1lIDwgdGhpcy5wcm9wcy50b3RhbEZyYW1lcykge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy50aW1lICs9IGZyYW1lSW50ZXJ2YWw7XG4gICAgICAgICAgICB0aGlzLnByb3BzLnBsYXloZWFkID0gdGhpcy5fY29tcHV0ZVBsYXloZWFkKHRoaXMucHJvcHMudGltZSwgdGhpcy5wcm9wcy5kdXJhdGlvbik7XG4gICAgICAgICAgICB0aGlzLl9yYWYgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRpY2spO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRmluaXNoZWQgcmVjb3JkaW5nJyk7XG4gICAgICAgICAgICB0aGlzLl9zaWduYWxFbmQoKTtcbiAgICAgICAgICAgIHRoaXMuZW5kUmVjb3JkKCk7XG4gICAgICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICAgICAgICAgIHRoaXMucnVuKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gVHJpZ2dlciBhIHN0YXJ0IGV2ZW50IGJlZm9yZSB3ZSBiZWdpbiByZWNvcmRpbmdcbiAgICBpZiAoIXRoaXMucHJvcHMuc3RhcnRlZCkge1xuICAgICAgdGhpcy5fc2lnbmFsQmVnaW4oKTtcbiAgICAgIHRoaXMucHJvcHMuc3RhcnRlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgdGhpcy5fcmFmID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aWNrKTtcbiAgfVxuXG4gIF9zaWduYWxCZWdpbiAoKSB7XG4gICAgaWYgKHRoaXMuc2tldGNoICYmIHR5cGVvZiB0aGlzLnNrZXRjaC5iZWdpbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5fd3JhcENvbnRleHRTY2FsZShwcm9wcyA9PiB0aGlzLnNrZXRjaC5iZWdpbihwcm9wcykpO1xuICAgIH1cbiAgfVxuXG4gIF9zaWduYWxFbmQgKCkge1xuICAgIGlmICh0aGlzLnNrZXRjaCAmJiB0eXBlb2YgdGhpcy5za2V0Y2guZW5kID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLl93cmFwQ29udGV4dFNjYWxlKHByb3BzID0+IHRoaXMuc2tldGNoLmVuZChwcm9wcykpO1xuICAgIH1cbiAgfVxuXG4gIGVuZFJlY29yZCAoKSB7XG4gICAgaWYgKHRoaXMuX3JhZiAhPSBudWxsICYmIGlzQnJvd3NlcigpKSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fcmFmKTtcbiAgICB0aGlzLnByb3BzLnJlY29yZGluZyA9IGZhbHNlO1xuICAgIHRoaXMucHJvcHMuZGVsdGFUaW1lID0gMDtcbiAgICB0aGlzLnByb3BzLnBsYXlpbmcgPSBmYWxzZTtcbiAgfVxuXG4gIGV4cG9ydEZyYW1lIChvcHQgPSB7fSkge1xuICAgIGlmICghdGhpcy5za2V0Y2gpIHJldHVybiBQcm9taXNlLmFsbChbXSk7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnNrZXRjaC5wcmVFeHBvcnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuc2tldGNoLnByZUV4cG9ydCgpO1xuICAgIH1cblxuICAgIC8vIE9wdGlvbnMgZm9yIGV4cG9ydCBmdW5jdGlvblxuICAgIGxldCBleHBvcnRPcHRzID0gYXNzaWduKHtcbiAgICAgIHNlcXVlbmNlOiBvcHQuc2VxdWVuY2UsXG4gICAgICBmcmFtZTogb3B0LnNlcXVlbmNlID8gdGhpcy5wcm9wcy5mcmFtZSA6IHVuZGVmaW5lZCxcbiAgICAgIGZpbGU6IHRoaXMuc2V0dGluZ3MuZmlsZSxcbiAgICAgIG5hbWU6IHRoaXMuc2V0dGluZ3MubmFtZSxcbiAgICAgIHByZWZpeDogdGhpcy5zZXR0aW5ncy5wcmVmaXgsXG4gICAgICBzdWZmaXg6IHRoaXMuc2V0dGluZ3Muc3VmZml4LFxuICAgICAgZW5jb2Rpbmc6IHRoaXMuc2V0dGluZ3MuZW5jb2RpbmcsXG4gICAgICBlbmNvZGluZ1F1YWxpdHk6IHRoaXMuc2V0dGluZ3MuZW5jb2RpbmdRdWFsaXR5LFxuICAgICAgdGltZVN0YW1wOiBnZXRGaWxlTmFtZSgpLFxuICAgICAgdG90YWxGcmFtZXM6IGlzRmluaXRlKHRoaXMucHJvcHMudG90YWxGcmFtZXMpID8gTWF0aC5tYXgoMTAwLCB0aGlzLnByb3BzLnRvdGFsRnJhbWVzKSA6IDEwMDBcbiAgICB9KTtcblxuICAgIGNvbnN0IGNsaWVudCA9IGdldENsaWVudEFQSSgpO1xuICAgIGxldCBwID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgaWYgKGNsaWVudCAmJiBvcHQuY29tbWl0ICYmIHR5cGVvZiBjbGllbnQuY29tbWl0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zdCBjb21taXRPcHRzID0gYXNzaWduKHt9LCBleHBvcnRPcHRzKTtcbiAgICAgIGNvbnN0IGhhc2ggPSBjbGllbnQuY29tbWl0KGNvbW1pdE9wdHMpO1xuICAgICAgaWYgKGlzUHJvbWlzZShoYXNoKSkgcCA9IGhhc2g7XG4gICAgICBlbHNlIHAgPSBQcm9taXNlLnJlc29sdmUoaGFzaCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHAudGhlbihoYXNoID0+IHtcbiAgICAgIHJldHVybiB0aGlzLl9kb0V4cG9ydEZyYW1lKGFzc2lnbih7fSwgZXhwb3J0T3B0cywgeyBoYXNoOiBoYXNoIHx8ICcnIH0pKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9kb0V4cG9ydEZyYW1lIChleHBvcnRPcHRzID0ge30pIHtcbiAgICB0aGlzLl9wcm9wcy5leHBvcnRpbmcgPSB0cnVlO1xuXG4gICAgLy8gUmVzaXplIHRvIG91dHB1dCByZXNvbHV0aW9uXG4gICAgdGhpcy5yZXNpemUoKTtcblxuICAgIC8vIERyYXcgYXQgdGhpcyBvdXRwdXQgcmVzb2x1dGlvblxuICAgIGxldCBkcmF3UmVzdWx0ID0gdGhpcy5yZW5kZXIoKTtcblxuICAgIC8vIFRoZSBzZWxmIG93bmVkIGNhbnZhcyAobWF5IGJlIHVuZGVmaW5lZC4uLiEpXG4gICAgY29uc3QgY2FudmFzID0gdGhpcy5wcm9wcy5jYW52YXM7XG5cbiAgICAvLyBHZXQgbGlzdCBvZiByZXN1bHRzIGZyb20gcmVuZGVyXG4gICAgaWYgKHR5cGVvZiBkcmF3UmVzdWx0ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgZHJhd1Jlc3VsdCA9IFsgY2FudmFzIF07XG4gICAgfVxuICAgIGRyYXdSZXN1bHQgPSBbXS5jb25jYXQoZHJhd1Jlc3VsdCkuZmlsdGVyKEJvb2xlYW4pO1xuXG4gICAgLy8gVHJhbnNmb3JtIHRoZSBjYW52YXMvZmlsZSBkZXNjcmlwdG9ycyBpbnRvIGEgY29uc2lzdGVudCBmb3JtYXQsXG4gICAgLy8gYW5kIHB1bGwgb3V0IGFueSBkYXRhIFVSTHMgZnJvbSBjYW52YXMgZWxlbWVudHNcbiAgICBkcmF3UmVzdWx0ID0gZHJhd1Jlc3VsdC5tYXAocmVzdWx0ID0+IHtcbiAgICAgIGNvbnN0IGhhc0RhdGFPYmplY3QgPSB0eXBlb2YgcmVzdWx0ID09PSAnb2JqZWN0JyAmJiByZXN1bHQgJiYgKCdkYXRhJyBpbiByZXN1bHQgfHwgJ2RhdGFVUkwnIGluIHJlc3VsdCk7XG4gICAgICBjb25zdCBkYXRhID0gaGFzRGF0YU9iamVjdCA/IHJlc3VsdC5kYXRhIDogcmVzdWx0O1xuICAgICAgY29uc3Qgb3B0cyA9IGhhc0RhdGFPYmplY3QgPyBhc3NpZ24oe30sIHJlc3VsdCwgeyBkYXRhIH0pIDogeyBkYXRhIH07XG4gICAgICBpZiAoaXNDYW52YXMoZGF0YSkpIHtcbiAgICAgICAgY29uc3QgZW5jb2RpbmcgPSBvcHRzLmVuY29kaW5nIHx8IGV4cG9ydE9wdHMuZW5jb2Rpbmc7XG4gICAgICAgIGNvbnN0IGVuY29kaW5nUXVhbGl0eSA9IGRlZmluZWQob3B0cy5lbmNvZGluZ1F1YWxpdHksIGV4cG9ydE9wdHMuZW5jb2RpbmdRdWFsaXR5LCAwLjk1KTtcbiAgICAgICAgY29uc3QgeyBkYXRhVVJMLCBleHRlbnNpb24sIHR5cGUgfSA9IGV4cG9ydENhbnZhcyhkYXRhLCB7IGVuY29kaW5nLCBlbmNvZGluZ1F1YWxpdHkgfSk7XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKG9wdHMsIHsgZGF0YVVSTCwgZXh0ZW5zaW9uLCB0eXBlIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG9wdHM7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBOb3cgcmV0dXJuIHRvIHJlZ3VsYXIgcmVuZGVyaW5nIG1vZGVcbiAgICB0aGlzLl9wcm9wcy5leHBvcnRpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnJlc2l6ZSgpO1xuICAgIHRoaXMucmVuZGVyKCk7XG5cbiAgICAvLyBBbmQgbm93IHdlIGNhbiBzYXZlIGVhY2ggcmVzdWx0XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKGRyYXdSZXN1bHQubWFwKChyZXN1bHQsIGksIGxheWVyTGlzdCkgPT4ge1xuICAgICAgLy8gQnkgZGVmYXVsdCwgaWYgcmVuZGVyaW5nIG11bHRpcGxlIGxheWVycyB3ZSB3aWxsIGdpdmUgdGhlbSBpbmRpY2VzXG4gICAgICBjb25zdCBjdXJPcHQgPSBhc3NpZ24oe30sIGV4cG9ydE9wdHMsIHJlc3VsdCwgeyBsYXllcjogaSwgdG90YWxMYXllcnM6IGxheWVyTGlzdC5sZW5ndGggfSk7XG4gICAgICBjb25zdCBkYXRhID0gcmVzdWx0LmRhdGE7XG4gICAgICBpZiAocmVzdWx0LmRhdGFVUkwpIHtcbiAgICAgICAgY29uc3QgZGF0YVVSTCA9IHJlc3VsdC5kYXRhVVJMO1xuICAgICAgICBkZWxldGUgY3VyT3B0LmRhdGFVUkw7IC8vIGF2b2lkIHNlbmRpbmcgZW50aXJlIGJhc2U2NCBkYXRhIGFyb3VuZFxuICAgICAgICByZXR1cm4gc2F2ZURhdGFVUkwoZGF0YVVSTCwgY3VyT3B0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBzYXZlRmlsZShkYXRhLCBjdXJPcHQpO1xuICAgICAgfVxuICAgIH0pKS50aGVuKGV2ID0+IHtcbiAgICAgIGlmIChldi5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGV2ZW50V2l0aE91dHB1dCA9IGV2LmZpbmQoZSA9PiBlLm91dHB1dE5hbWUpO1xuICAgICAgICBjb25zdCBpc0NsaWVudCA9IGV2LnNvbWUoZSA9PiBlLmNsaWVudCk7XG4gICAgICAgIGxldCBpdGVtO1xuICAgICAgICAvLyBtYW55IGZpbGVzLCBqdXN0IGxvZyBob3cgbWFueSB3ZXJlIGV4cG9ydGVkXG4gICAgICAgIGlmIChldi5sZW5ndGggPiAxKSBpdGVtID0gZXYubGVuZ3RoO1xuICAgICAgICAvLyBpbiBDTEksIHdlIGtub3cgZXhhY3QgcGF0aCBkaXJuYW1lXG4gICAgICAgIGVsc2UgaWYgKGV2ZW50V2l0aE91dHB1dCkgaXRlbSA9IGAke2V2ZW50V2l0aE91dHB1dC5vdXRwdXROYW1lfS8ke2V2WzBdLmZpbGVuYW1lfWA7XG4gICAgICAgIC8vIGluIGJyb3dzZXIsIHdlIGNhbiBvbmx5IGtub3cgaXQgd2VudCB0byBcImJyb3dzZXIgZG93bmxvYWQgZm9sZGVyXCJcbiAgICAgICAgZWxzZSBpdGVtID0gYCR7ZXZbMF0uZmlsZW5hbWV9YDtcbiAgICAgICAgbGV0IG9mU2VxID0gJyc7XG4gICAgICAgIGlmIChleHBvcnRPcHRzLnNlcXVlbmNlKSB7XG4gICAgICAgICAgY29uc3QgaGFzVG90YWxGcmFtZXMgPSBpc0Zpbml0ZSh0aGlzLnByb3BzLnRvdGFsRnJhbWVzKTtcbiAgICAgICAgICBvZlNlcSA9IGhhc1RvdGFsRnJhbWVzID8gYCAoZnJhbWUgJHtleHBvcnRPcHRzLmZyYW1lICsgMX0gLyAke3RoaXMucHJvcHMudG90YWxGcmFtZXN9KWAgOiBgIChmcmFtZSAke2V4cG9ydE9wdHMuZnJhbWV9KWA7XG4gICAgICAgIH0gZWxzZSBpZiAoZXYubGVuZ3RoID4gMSkge1xuICAgICAgICAgIG9mU2VxID0gYCBmaWxlc2A7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2xpZW50ID0gaXNDbGllbnQgPyAnY2FudmFzLXNrZXRjaC1jbGknIDogJ2NhbnZhcy1za2V0Y2gnO1xuICAgICAgICBjb25zb2xlLmxvZyhgJWNbJHtjbGllbnR9XSVjIEV4cG9ydGVkICVjJHtpdGVtfSVjJHtvZlNlcX1gLCAnY29sb3I6ICM4ZThlOGU7JywgJ2NvbG9yOiBpbml0aWFsOycsICdmb250LXdlaWdodDogYm9sZDsnLCAnZm9udC13ZWlnaHQ6IGluaXRpYWw7Jyk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHRoaXMuc2tldGNoLnBvc3RFeHBvcnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5za2V0Y2gucG9zdEV4cG9ydCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX3dyYXBDb250ZXh0U2NhbGUgKGNiKSB7XG4gICAgdGhpcy5fcHJlUmVuZGVyKCk7XG4gICAgY2IodGhpcy5wcm9wcyk7XG4gICAgdGhpcy5fcG9zdFJlbmRlcigpO1xuICB9XG5cbiAgX3ByZVJlbmRlciAoKSB7XG4gICAgY29uc3QgcHJvcHMgPSB0aGlzLnByb3BzO1xuXG4gICAgLy8gU2NhbGUgY29udGV4dCBmb3IgdW5pdCBzaXppbmdcbiAgICBpZiAoIXRoaXMucHJvcHMuZ2wgJiYgcHJvcHMuY29udGV4dCAmJiAhcHJvcHMucDUpIHtcbiAgICAgIHByb3BzLmNvbnRleHQuc2F2ZSgpO1xuICAgICAgaWYgKHRoaXMuc2V0dGluZ3Muc2NhbGVDb250ZXh0ICE9PSBmYWxzZSkge1xuICAgICAgICBwcm9wcy5jb250ZXh0LnNjYWxlKHByb3BzLnNjYWxlWCwgcHJvcHMuc2NhbGVZKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHByb3BzLnA1KSB7XG4gICAgICBwcm9wcy5wNS5zY2FsZShwcm9wcy5zY2FsZVggLyBwcm9wcy5waXhlbFJhdGlvLCBwcm9wcy5zY2FsZVkgLyBwcm9wcy5waXhlbFJhdGlvKTtcbiAgICB9XG4gIH1cblxuICBfcG9zdFJlbmRlciAoKSB7XG4gICAgY29uc3QgcHJvcHMgPSB0aGlzLnByb3BzO1xuXG4gICAgaWYgKCF0aGlzLnByb3BzLmdsICYmIHByb3BzLmNvbnRleHQgJiYgIXByb3BzLnA1KSB7XG4gICAgICBwcm9wcy5jb250ZXh0LnJlc3RvcmUoKTtcbiAgICB9XG5cbiAgICAvLyBGbHVzaCBieSBkZWZhdWx0LCB0aGlzIG1heSBiZSByZXZpc2l0ZWQgYXQgYSBsYXRlciBwb2ludC5cbiAgICAvLyBXZSBkbyB0aGlzIHRvIGVuc3VyZSB0b0RhdGFVUkwgY2FuIGJlIGNhbGxlZCBpbW1lZGlhdGVseSBhZnRlci5cbiAgICAvLyBNb3N0IGxpa2VseSBicm93c2VycyBhbHJlYWR5IGhhbmRsZSB0aGlzLCBzbyB3ZSBtYXkgcmV2aXNpdCB0aGlzIGFuZFxuICAgIC8vIHJlbW92ZSBpdCBpZiBpdCBpbXByb3ZlcyBwZXJmb3JtYW5jZSB3aXRob3V0IGFueSB1c2FiaWxpdHkgaXNzdWVzLlxuICAgIGlmIChwcm9wcy5nbCAmJiB0aGlzLnNldHRpbmdzLmZsdXNoICE9PSBmYWxzZSAmJiAhcHJvcHMucDUpIHtcbiAgICAgIHByb3BzLmdsLmZsdXNoKCk7XG4gICAgfVxuICB9XG5cbiAgdGljayAoKSB7XG4gICAgaWYgKHRoaXMuc2tldGNoICYmIHR5cGVvZiB0aGlzLnNrZXRjaC50aWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLl9wcmVSZW5kZXIoKTtcbiAgICAgIHRoaXMuc2tldGNoLnRpY2sodGhpcy5wcm9wcyk7XG4gICAgICB0aGlzLl9wb3N0UmVuZGVyKCk7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyICgpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5wNSkge1xuICAgICAgdGhpcy5fbGFzdFJlZHJhd1Jlc3VsdCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMucHJvcHMucDUucmVkcmF3KCk7XG4gICAgICByZXR1cm4gdGhpcy5fbGFzdFJlZHJhd1Jlc3VsdDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuc3VibWl0RHJhd0NhbGwoKTtcbiAgICB9XG4gIH1cblxuICBzdWJtaXREcmF3Q2FsbCAoKSB7XG4gICAgaWYgKCF0aGlzLnNrZXRjaCkgcmV0dXJuO1xuXG4gICAgY29uc3QgcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgIHRoaXMuX3ByZVJlbmRlcigpO1xuXG4gICAgbGV0IGRyYXdSZXN1bHQ7XG5cbiAgICBpZiAodHlwZW9mIHRoaXMuc2tldGNoID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBkcmF3UmVzdWx0ID0gdGhpcy5za2V0Y2gocHJvcHMpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMuc2tldGNoLnJlbmRlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZHJhd1Jlc3VsdCA9IHRoaXMuc2tldGNoLnJlbmRlcihwcm9wcyk7XG4gICAgfVxuXG4gICAgdGhpcy5fcG9zdFJlbmRlcigpO1xuXG4gICAgcmV0dXJuIGRyYXdSZXN1bHQ7XG4gIH1cblxuICB1cGRhdGUgKG9wdCA9IHt9KSB7XG4gICAgLy8gQ3VycmVudGx5IHVwZGF0ZSgpIGlzIG9ubHkgZm9jdXNlZCBvbiByZXNpemluZyxcbiAgICAvLyBidXQgbGF0ZXIgd2Ugd2lsbCBzdXBwb3J0IG90aGVyIG9wdGlvbnMgbGlrZSBzd2l0Y2hpbmdcbiAgICAvLyBmcmFtZXMgYW5kIHN1Y2guXG4gICAgY29uc3Qgbm90WWV0U3VwcG9ydGVkID0gW1xuICAgICAgJ2FuaW1hdGUnXG4gICAgXTtcblxuICAgIE9iamVjdC5rZXlzKG9wdCkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgaWYgKG5vdFlldFN1cHBvcnRlZC5pbmRleE9mKGtleSkgPj0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNvcnJ5LCB0aGUgeyAke2tleX0gfSBvcHRpb24gaXMgbm90IHlldCBzdXBwb3J0ZWQgd2l0aCB1cGRhdGUoKS5gKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IG9sZENhbnZhcyA9IHRoaXMuX3NldHRpbmdzLmNhbnZhcztcbiAgICBjb25zdCBvbGRDb250ZXh0ID0gdGhpcy5fc2V0dGluZ3MuY29udGV4dDtcblxuICAgIC8vIE1lcmdlIG5ldyBvcHRpb25zIGludG8gc2V0dGluZ3NcbiAgICBmb3IgKGxldCBrZXkgaW4gb3B0KSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IG9wdFtrZXldO1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3VuZGVmaW5lZCcpIHsgLy8gaWdub3JlIHVuZGVmaW5lZFxuICAgICAgICB0aGlzLl9zZXR0aW5nc1trZXldID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTWVyZ2UgaW4gdGltZSBwcm9wc1xuICAgIGNvbnN0IHRpbWVPcHRzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5fc2V0dGluZ3MsIG9wdCk7XG4gICAgaWYgKCd0aW1lJyBpbiBvcHQgJiYgJ2ZyYW1lJyBpbiBvcHQpIHRocm93IG5ldyBFcnJvcignWW91IHNob3VsZCBzcGVjaWZ5IHsgdGltZSB9IG9yIHsgZnJhbWUgfSBidXQgbm90IGJvdGgnKTtcbiAgICBlbHNlIGlmICgndGltZScgaW4gb3B0KSBkZWxldGUgdGltZU9wdHMuZnJhbWU7XG4gICAgZWxzZSBpZiAoJ2ZyYW1lJyBpbiBvcHQpIGRlbGV0ZSB0aW1lT3B0cy50aW1lO1xuICAgIGlmICgnZHVyYXRpb24nIGluIG9wdCAmJiAndG90YWxGcmFtZXMnIGluIG9wdCkgdGhyb3cgbmV3IEVycm9yKCdZb3Ugc2hvdWxkIHNwZWNpZnkgeyBkdXJhdGlvbiB9IG9yIHsgdG90YWxGcmFtZXMgfSBidXQgbm90IGJvdGgnKTtcbiAgICBlbHNlIGlmICgnZHVyYXRpb24nIGluIG9wdCkgZGVsZXRlIHRpbWVPcHRzLnRvdGFsRnJhbWVzO1xuICAgIGVsc2UgaWYgKCd0b3RhbEZyYW1lcycgaW4gb3B0KSBkZWxldGUgdGltZU9wdHMuZHVyYXRpb247XG5cbiAgICAvLyBNZXJnZSBpbiB1c2VyIGRhdGEgd2l0aG91dCBjb3B5aW5nXG4gICAgaWYgKCdkYXRhJyBpbiBvcHQpIHRoaXMuX3Byb3BzLmRhdGEgPSBvcHQuZGF0YTtcblxuICAgIGNvbnN0IHRpbWVQcm9wcyA9IHRoaXMuZ2V0VGltZVByb3BzKHRpbWVPcHRzKTtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMuX3Byb3BzLCB0aW1lUHJvcHMpO1xuXG4gICAgLy8gSWYgZWl0aGVyIGNhbnZhcyBvciBjb250ZXh0IGlzIGNoYW5nZWQsIHdlIHNob3VsZCByZS11cGRhdGVcbiAgICBpZiAob2xkQ2FudmFzICE9PSB0aGlzLl9zZXR0aW5ncy5jYW52YXMgfHwgb2xkQ29udGV4dCAhPT0gdGhpcy5fc2V0dGluZ3MuY29udGV4dCkge1xuICAgICAgY29uc3QgeyBjYW52YXMsIGNvbnRleHQgfSA9IGNyZWF0ZUNhbnZhcyh0aGlzLl9zZXR0aW5ncyk7XG5cbiAgICAgIHRoaXMucHJvcHMuY2FudmFzID0gY2FudmFzO1xuICAgICAgdGhpcy5wcm9wcy5jb250ZXh0ID0gY29udGV4dDtcblxuICAgICAgLy8gRGVsZXRlIG9yIGFkZCBhICdnbCcgcHJvcCBmb3IgY29udmVuaWVuY2VcbiAgICAgIHRoaXMuX3NldHVwR0xLZXkoKTtcblxuICAgICAgLy8gUmUtbW91bnQgdGhlIG5ldyBjYW52YXMgaWYgaXQgaGFzIG5vIHBhcmVudFxuICAgICAgdGhpcy5fYXBwZW5kQ2FudmFzSWZOZWVkZWQoKTtcbiAgICB9XG5cbiAgICAvLyBTcGVjaWFsIGNhc2UgdG8gc3VwcG9ydCBQNS5qc1xuICAgIGlmIChvcHQucDUgJiYgdHlwZW9mIG9wdC5wNSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5wcm9wcy5wNSA9IG9wdC5wNTtcbiAgICAgIHRoaXMucHJvcHMucDUuZHJhdyA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX2lzUDVSZXNpemluZykgcmV0dXJuO1xuICAgICAgICB0aGlzLl9sYXN0UmVkcmF3UmVzdWx0ID0gdGhpcy5zdWJtaXREcmF3Q2FsbCgpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgcGxheWluZyBzdGF0ZSBpZiBuZWNlc3NhcnlcbiAgICBpZiAoJ3BsYXlpbmcnIGluIG9wdCkge1xuICAgICAgaWYgKG9wdC5wbGF5aW5nKSB0aGlzLnBsYXkoKTtcbiAgICAgIGVsc2UgdGhpcy5wYXVzZSgpO1xuICAgIH1cblxuICAgIGNoZWNrU2V0dGluZ3ModGhpcy5fc2V0dGluZ3MpO1xuXG4gICAgLy8gRHJhdyBuZXcgZnJhbWVcbiAgICB0aGlzLnJlc2l6ZSgpO1xuICAgIHRoaXMucmVuZGVyKCk7XG4gICAgcmV0dXJuIHRoaXMucHJvcHM7XG4gIH1cblxuICByZXNpemUgKCkge1xuICAgIGNvbnN0IG9sZFNpemVzID0gdGhpcy5fZ2V0U2l6ZVByb3BzKCk7XG5cbiAgICBjb25zdCBzZXR0aW5ncyA9IHRoaXMuc2V0dGluZ3M7XG4gICAgY29uc3QgcHJvcHMgPSB0aGlzLnByb3BzO1xuXG4gICAgLy8gUmVjb21wdXRlIG5ldyBwcm9wZXJ0aWVzIGJhc2VkIG9uIGN1cnJlbnQgc2V0dXBcbiAgICBjb25zdCBuZXdQcm9wcyA9IHJlc2l6ZUNhbnZhcyhwcm9wcywgc2V0dGluZ3MpO1xuXG4gICAgLy8gQXNzaWduIHRvIGN1cnJlbnQgcHJvcHNcbiAgICBPYmplY3QuYXNzaWduKHRoaXMuX3Byb3BzLCBuZXdQcm9wcyk7XG5cbiAgICAvLyBOb3cgd2UgYWN0dWFsbHkgdXBkYXRlIHRoZSBjYW52YXMgd2lkdGgvaGVpZ2h0IGFuZCBzdHlsZSBwcm9wc1xuICAgIGNvbnN0IHtcbiAgICAgIHBpeGVsUmF0aW8sXG4gICAgICBjYW52YXNXaWR0aCxcbiAgICAgIGNhbnZhc0hlaWdodCxcbiAgICAgIHN0eWxlV2lkdGgsXG4gICAgICBzdHlsZUhlaWdodFxuICAgIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgLy8gVXBkYXRlIGNhbnZhcyBzZXR0aW5nc1xuICAgIGNvbnN0IGNhbnZhcyA9IHRoaXMucHJvcHMuY2FudmFzO1xuICAgIGlmIChjYW52YXMgJiYgc2V0dGluZ3MucmVzaXplQ2FudmFzICE9PSBmYWxzZSkge1xuICAgICAgaWYgKHByb3BzLnA1KSB7XG4gICAgICAgIC8vIFA1LmpzIHNwZWNpZmljIGVkZ2UgY2FzZVxuICAgICAgICBpZiAoY2FudmFzLndpZHRoICE9PSBjYW52YXNXaWR0aCB8fCBjYW52YXMuaGVpZ2h0ICE9PSBjYW52YXNIZWlnaHQpIHtcbiAgICAgICAgICB0aGlzLl9pc1A1UmVzaXppbmcgPSB0cnVlO1xuICAgICAgICAgIC8vIFRoaXMgY2F1c2VzIGEgcmUtZHJhdyA6XFwgc28gd2UgaWdub3JlIGRyYXdzIGluIHRoZSBtZWFuIHRpbWUuLi4gc29ydGEgaGFja3lcbiAgICAgICAgICBwcm9wcy5wNS5waXhlbERlbnNpdHkocGl4ZWxSYXRpbyk7XG4gICAgICAgICAgcHJvcHMucDUucmVzaXplQ2FudmFzKGNhbnZhc1dpZHRoIC8gcGl4ZWxSYXRpbywgY2FudmFzSGVpZ2h0IC8gcGl4ZWxSYXRpbywgZmFsc2UpO1xuICAgICAgICAgIHRoaXMuX2lzUDVSZXNpemluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBGb3JjZSBjYW52YXMgc2l6ZVxuICAgICAgICBpZiAoY2FudmFzLndpZHRoICE9PSBjYW52YXNXaWR0aCkgY2FudmFzLndpZHRoID0gY2FudmFzV2lkdGg7XG4gICAgICAgIGlmIChjYW52YXMuaGVpZ2h0ICE9PSBjYW52YXNIZWlnaHQpIGNhbnZhcy5oZWlnaHQgPSBjYW52YXNIZWlnaHQ7XG4gICAgICB9XG4gICAgICAvLyBVcGRhdGUgY2FudmFzIHN0eWxlXG4gICAgICBpZiAoaXNCcm93c2VyKCkgJiYgc2V0dGluZ3Muc3R5bGVDYW52YXMgIT09IGZhbHNlKSB7XG4gICAgICAgIGNhbnZhcy5zdHlsZS53aWR0aCA9IGAke3N0eWxlV2lkdGh9cHhgO1xuICAgICAgICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gYCR7c3R5bGVIZWlnaHR9cHhgO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IG5ld1NpemVzID0gdGhpcy5fZ2V0U2l6ZVByb3BzKCk7XG4gICAgbGV0IGNoYW5nZWQgPSAhZGVlcEVxdWFsKG9sZFNpemVzLCBuZXdTaXplcyk7XG4gICAgaWYgKGNoYW5nZWQpIHtcbiAgICAgIHRoaXMuX3NpemVDaGFuZ2VkKCk7XG4gICAgfVxuICAgIHJldHVybiBjaGFuZ2VkO1xuICB9XG5cbiAgX3NpemVDaGFuZ2VkICgpIHtcbiAgICAvLyBTZW5kIHJlc2l6ZSBldmVudCB0byBza2V0Y2hcbiAgICBpZiAodGhpcy5za2V0Y2ggJiYgdHlwZW9mIHRoaXMuc2tldGNoLnJlc2l6ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5za2V0Y2gucmVzaXplKHRoaXMucHJvcHMpO1xuICAgIH1cbiAgfVxuXG4gIGFuaW1hdGUgKCkge1xuICAgIGlmICghdGhpcy5wcm9wcy5wbGF5aW5nKSByZXR1cm47XG4gICAgaWYgKCFpc0Jyb3dzZXIoKSkge1xuICAgICAgY29uc29sZS5lcnJvcignW2NhbnZhcy1za2V0Y2hdIFdBUk46IEFuaW1hdGlvbiBpbiBOb2RlLmpzIGlzIG5vdCB5ZXQgc3VwcG9ydGVkJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX3JhZiA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fYW5pbWF0ZUhhbmRsZXIpO1xuXG4gICAgbGV0IG5vdyA9IHJpZ2h0Tm93KCk7XG5cbiAgICBjb25zdCBmcHMgPSB0aGlzLnByb3BzLmZwcztcbiAgICBjb25zdCBmcmFtZUludGVydmFsTVMgPSAxMDAwIC8gZnBzO1xuICAgIGxldCBkZWx0YVRpbWVNUyA9IG5vdyAtIHRoaXMuX2xhc3RUaW1lO1xuXG4gICAgY29uc3QgZHVyYXRpb24gPSB0aGlzLnByb3BzLmR1cmF0aW9uO1xuICAgIGNvbnN0IGhhc0R1cmF0aW9uID0gdHlwZW9mIGR1cmF0aW9uID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZShkdXJhdGlvbik7XG5cbiAgICBsZXQgaXNOZXdGcmFtZSA9IHRydWU7XG4gICAgY29uc3QgcGxheWJhY2tSYXRlID0gdGhpcy5zZXR0aW5ncy5wbGF5YmFja1JhdGU7XG4gICAgaWYgKHBsYXliYWNrUmF0ZSA9PT0gJ2ZpeGVkJykge1xuICAgICAgZGVsdGFUaW1lTVMgPSBmcmFtZUludGVydmFsTVM7XG4gICAgfSBlbHNlIGlmIChwbGF5YmFja1JhdGUgPT09ICd0aHJvdHRsZScpIHtcbiAgICAgIGlmIChkZWx0YVRpbWVNUyA+IGZyYW1lSW50ZXJ2YWxNUykge1xuICAgICAgICBub3cgPSBub3cgLSAoZGVsdGFUaW1lTVMgJSBmcmFtZUludGVydmFsTVMpO1xuICAgICAgICB0aGlzLl9sYXN0VGltZSA9IG5vdztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlzTmV3RnJhbWUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbGFzdFRpbWUgPSBub3c7XG4gICAgfVxuXG4gICAgY29uc3QgZGVsdGFUaW1lID0gZGVsdGFUaW1lTVMgLyAxMDAwO1xuICAgIGxldCBuZXdUaW1lID0gdGhpcy5wcm9wcy50aW1lICsgZGVsdGFUaW1lICogdGhpcy5wcm9wcy50aW1lU2NhbGU7XG5cbiAgICAvLyBIYW5kbGUgcmV2ZXJzZSB0aW1lIHNjYWxlXG4gICAgaWYgKG5ld1RpbWUgPCAwICYmIGhhc0R1cmF0aW9uKSB7XG4gICAgICBuZXdUaW1lID0gZHVyYXRpb24gKyBuZXdUaW1lO1xuICAgIH1cblxuICAgIC8vIFJlLXN0YXJ0IGFuaW1hdGlvblxuICAgIGxldCBpc0ZpbmlzaGVkID0gZmFsc2U7XG4gICAgbGV0IGlzTG9vcFN0YXJ0ID0gZmFsc2U7XG5cbiAgICBjb25zdCBsb29waW5nID0gdGhpcy5zZXR0aW5ncy5sb29wICE9PSBmYWxzZTtcblxuICAgIGlmIChoYXNEdXJhdGlvbiAmJiBuZXdUaW1lID49IGR1cmF0aW9uKSB7XG4gICAgICAvLyBSZS1zdGFydCBhbmltYXRpb25cbiAgICAgIGlmIChsb29waW5nKSB7XG4gICAgICAgIGlzTmV3RnJhbWUgPSB0cnVlO1xuICAgICAgICBuZXdUaW1lID0gbmV3VGltZSAlIGR1cmF0aW9uO1xuICAgICAgICBpc0xvb3BTdGFydCA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpc05ld0ZyYW1lID0gZmFsc2U7XG4gICAgICAgIG5ld1RpbWUgPSBkdXJhdGlvbjtcbiAgICAgICAgaXNGaW5pc2hlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3NpZ25hbEVuZCgpO1xuICAgIH1cblxuICAgIGlmIChpc05ld0ZyYW1lKSB7XG4gICAgICB0aGlzLnByb3BzLmRlbHRhVGltZSA9IGRlbHRhVGltZTtcbiAgICAgIHRoaXMucHJvcHMudGltZSA9IG5ld1RpbWU7XG4gICAgICB0aGlzLnByb3BzLnBsYXloZWFkID0gdGhpcy5fY29tcHV0ZVBsYXloZWFkKG5ld1RpbWUsIGR1cmF0aW9uKTtcbiAgICAgIGNvbnN0IGxhc3RGcmFtZSA9IHRoaXMucHJvcHMuZnJhbWU7XG4gICAgICB0aGlzLnByb3BzLmZyYW1lID0gdGhpcy5fY29tcHV0ZUN1cnJlbnRGcmFtZSgpO1xuICAgICAgaWYgKGlzTG9vcFN0YXJ0KSB0aGlzLl9zaWduYWxCZWdpbigpO1xuICAgICAgaWYgKGxhc3RGcmFtZSAhPT0gdGhpcy5wcm9wcy5mcmFtZSkgdGhpcy50aWNrKCk7XG4gICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgdGhpcy5wcm9wcy5kZWx0YVRpbWUgPSAwO1xuICAgIH1cblxuICAgIGlmIChpc0ZpbmlzaGVkKSB7XG4gICAgICB0aGlzLnBhdXNlKCk7XG4gICAgfVxuICB9XG5cbiAgZGlzcGF0Y2ggKGNiKSB7XG4gICAgaWYgKHR5cGVvZiBjYiAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgbmV3IEVycm9yKCdtdXN0IHBhc3MgZnVuY3Rpb24gaW50byBkaXNwYXRjaCgpJyk7XG4gICAgY2IodGhpcy5wcm9wcyk7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIG1vdW50ICgpIHtcbiAgICB0aGlzLl9hcHBlbmRDYW52YXNJZk5lZWRlZCgpO1xuICB9XG5cbiAgdW5tb3VudCAoKSB7XG4gICAgaWYgKGlzQnJvd3NlcigpKSB7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5fcmVzaXplSGFuZGxlcik7XG4gICAgICB0aGlzLl9rZXlib2FyZFNob3J0Y3V0cy5kZXRhY2goKTtcbiAgICB9XG4gICAgaWYgKHRoaXMucHJvcHMuY2FudmFzLnBhcmVudEVsZW1lbnQpIHtcbiAgICAgIHRoaXMucHJvcHMuY2FudmFzLnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5wcm9wcy5jYW52YXMpO1xuICAgIH1cbiAgfVxuXG4gIF9hcHBlbmRDYW52YXNJZk5lZWRlZCAoKSB7XG4gICAgaWYgKCFpc0Jyb3dzZXIoKSkgcmV0dXJuO1xuICAgIGlmICh0aGlzLnNldHRpbmdzLnBhcmVudCAhPT0gZmFsc2UgJiYgKHRoaXMucHJvcHMuY2FudmFzICYmICF0aGlzLnByb3BzLmNhbnZhcy5wYXJlbnRFbGVtZW50KSkge1xuICAgICAgY29uc3QgZGVmYXVsdFBhcmVudCA9IHRoaXMuc2V0dGluZ3MucGFyZW50IHx8IGRvY3VtZW50LmJvZHk7XG4gICAgICBkZWZhdWx0UGFyZW50LmFwcGVuZENoaWxkKHRoaXMucHJvcHMuY2FudmFzKTtcbiAgICB9XG4gIH1cblxuICBfc2V0dXBHTEtleSAoKSB7XG4gICAgaWYgKHRoaXMucHJvcHMuY29udGV4dCkge1xuICAgICAgaWYgKGlzV2ViR0xDb250ZXh0KHRoaXMucHJvcHMuY29udGV4dCkpIHtcbiAgICAgICAgdGhpcy5fcHJvcHMuZ2wgPSB0aGlzLnByb3BzLmNvbnRleHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWxldGUgdGhpcy5fcHJvcHMuZ2w7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0VGltZVByb3BzIChzZXR0aW5ncyA9IHt9KSB7XG4gICAgLy8gR2V0IHRpbWluZyBkYXRhXG4gICAgbGV0IGR1cmF0aW9uID0gc2V0dGluZ3MuZHVyYXRpb247XG4gICAgbGV0IHRvdGFsRnJhbWVzID0gc2V0dGluZ3MudG90YWxGcmFtZXM7XG4gICAgY29uc3QgdGltZVNjYWxlID0gZGVmaW5lZChzZXR0aW5ncy50aW1lU2NhbGUsIDEpO1xuICAgIGNvbnN0IGZwcyA9IGRlZmluZWQoc2V0dGluZ3MuZnBzLCAyNCk7XG4gICAgY29uc3QgaGFzRHVyYXRpb24gPSB0eXBlb2YgZHVyYXRpb24gPT09ICdudW1iZXInICYmIGlzRmluaXRlKGR1cmF0aW9uKTtcbiAgICBjb25zdCBoYXNUb3RhbEZyYW1lcyA9IHR5cGVvZiB0b3RhbEZyYW1lcyA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUodG90YWxGcmFtZXMpO1xuXG4gICAgY29uc3QgdG90YWxGcmFtZXNGcm9tRHVyYXRpb24gPSBoYXNEdXJhdGlvbiA/IE1hdGguZmxvb3IoZnBzICogZHVyYXRpb24pIDogdW5kZWZpbmVkO1xuICAgIGNvbnN0IGR1cmF0aW9uRnJvbVRvdGFsRnJhbWVzID0gaGFzVG90YWxGcmFtZXMgPyAodG90YWxGcmFtZXMgLyBmcHMpIDogdW5kZWZpbmVkO1xuICAgIGlmIChoYXNEdXJhdGlvbiAmJiBoYXNUb3RhbEZyYW1lcyAmJiB0b3RhbEZyYW1lc0Zyb21EdXJhdGlvbiAhPT0gdG90YWxGcmFtZXMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignWW91IHNob3VsZCBzcGVjaWZ5IGVpdGhlciBkdXJhdGlvbiBvciB0b3RhbEZyYW1lcywgYnV0IG5vdCBib3RoLiBPciwgdGhleSBtdXN0IG1hdGNoIGV4YWN0bHkuJyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBzZXR0aW5ncy5kaW1lbnNpb25zID09PSAndW5kZWZpbmVkJyAmJiB0eXBlb2Ygc2V0dGluZ3MudW5pdHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjb25zb2xlLndhcm4oYFlvdSd2ZSBzcGVjaWZpZWQgYSB7IHVuaXRzIH0gc2V0dGluZyBidXQgbm8geyBkaW1lbnNpb24gfSwgc28gdGhlIHVuaXRzIHdpbGwgYmUgaWdub3JlZC5gKTtcbiAgICB9XG5cbiAgICB0b3RhbEZyYW1lcyA9IGRlZmluZWQodG90YWxGcmFtZXMsIHRvdGFsRnJhbWVzRnJvbUR1cmF0aW9uLCBJbmZpbml0eSk7XG4gICAgZHVyYXRpb24gPSBkZWZpbmVkKGR1cmF0aW9uLCBkdXJhdGlvbkZyb21Ub3RhbEZyYW1lcywgSW5maW5pdHkpO1xuXG4gICAgY29uc3Qgc3RhcnRUaW1lID0gc2V0dGluZ3MudGltZTtcbiAgICBjb25zdCBzdGFydEZyYW1lID0gc2V0dGluZ3MuZnJhbWU7XG4gICAgY29uc3QgaGFzU3RhcnRUaW1lID0gdHlwZW9mIHN0YXJ0VGltZSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoc3RhcnRUaW1lKTtcbiAgICBjb25zdCBoYXNTdGFydEZyYW1lID0gdHlwZW9mIHN0YXJ0RnJhbWUgPT09ICdudW1iZXInICYmIGlzRmluaXRlKHN0YXJ0RnJhbWUpO1xuXG4gICAgLy8gc3RhcnQgYXQgemVybyB1bmxlc3MgdXNlciBzcGVjaWZpZXMgZnJhbWUgb3IgdGltZSAoYnV0IG5vdCBib3RoIG1pc21hdGNoZWQpXG4gICAgbGV0IHRpbWUgPSAwO1xuICAgIGxldCBmcmFtZSA9IDA7XG4gICAgbGV0IHBsYXloZWFkID0gMDtcbiAgICBpZiAoaGFzU3RhcnRUaW1lICYmIGhhc1N0YXJ0RnJhbWUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignWW91IHNob3VsZCBzcGVjaWZ5IGVpdGhlciBzdGFydCBmcmFtZSBvciB0aW1lLCBidXQgbm90IGJvdGguJyk7XG4gICAgfSBlbHNlIGlmIChoYXNTdGFydFRpbWUpIHtcbiAgICAgIC8vIFVzZXIgc3BlY2lmaWVzIHRpbWUsIHdlIGluZmVyIGZyYW1lcyBmcm9tIEZQU1xuICAgICAgdGltZSA9IHN0YXJ0VGltZTtcbiAgICAgIHBsYXloZWFkID0gdGhpcy5fY29tcHV0ZVBsYXloZWFkKHRpbWUsIGR1cmF0aW9uKTtcbiAgICAgIGZyYW1lID0gdGhpcy5fY29tcHV0ZUZyYW1lKFxuICAgICAgICBwbGF5aGVhZCwgdGltZSxcbiAgICAgICAgdG90YWxGcmFtZXMsIGZwc1xuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKGhhc1N0YXJ0RnJhbWUpIHtcbiAgICAgIC8vIFVzZXIgc3BlY2lmaWVzIGZyYW1lIG51bWJlciwgd2UgaW5mZXIgdGltZSBmcm9tIEZQU1xuICAgICAgZnJhbWUgPSBzdGFydEZyYW1lO1xuICAgICAgdGltZSA9IGZyYW1lIC8gZnBzO1xuICAgICAgcGxheWhlYWQgPSB0aGlzLl9jb21wdXRlUGxheWhlYWQodGltZSwgZHVyYXRpb24pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBwbGF5aGVhZCxcbiAgICAgIHRpbWUsXG4gICAgICBmcmFtZSxcbiAgICAgIGR1cmF0aW9uLFxuICAgICAgdG90YWxGcmFtZXMsXG4gICAgICBmcHMsXG4gICAgICB0aW1lU2NhbGVcbiAgICB9O1xuICB9XG5cbiAgc2V0dXAgKHNldHRpbmdzID0ge30pIHtcbiAgICBpZiAodGhpcy5za2V0Y2gpIHRocm93IG5ldyBFcnJvcignTXVsdGlwbGUgc2V0dXAoKSBjYWxscyBub3QgeWV0IHN1cHBvcnRlZC4nKTtcblxuICAgIHRoaXMuX3NldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgc2V0dGluZ3MsIHRoaXMuX3NldHRpbmdzKTtcblxuICAgIGNoZWNrU2V0dGluZ3ModGhpcy5fc2V0dGluZ3MpO1xuXG4gICAgLy8gR2V0IGluaXRpYWwgY2FudmFzICYgY29udGV4dFxuICAgIGNvbnN0IHsgY29udGV4dCwgY2FudmFzIH0gPSBjcmVhdGVDYW52YXModGhpcy5fc2V0dGluZ3MpO1xuXG4gICAgY29uc3QgdGltZVByb3BzID0gdGhpcy5nZXRUaW1lUHJvcHModGhpcy5fc2V0dGluZ3MpO1xuXG4gICAgLy8gSW5pdGlhbCByZW5kZXIgc3RhdGUgZmVhdHVyZXNcbiAgICB0aGlzLl9wcm9wcyA9IHtcbiAgICAgIC4uLnRpbWVQcm9wcyxcbiAgICAgIGNhbnZhcyxcbiAgICAgIGNvbnRleHQsXG4gICAgICBkZWx0YVRpbWU6IDAsXG4gICAgICBzdGFydGVkOiBmYWxzZSxcbiAgICAgIGV4cG9ydGluZzogZmFsc2UsXG4gICAgICBwbGF5aW5nOiBmYWxzZSxcbiAgICAgIHJlY29yZGluZzogZmFsc2UsXG4gICAgICBzZXR0aW5nczogdGhpcy5zZXR0aW5ncyxcbiAgICAgIGRhdGE6IHRoaXMuc2V0dGluZ3MuZGF0YSxcblxuICAgICAgLy8gRXhwb3J0IHNvbWUgc3BlY2lmaWMgYWN0aW9ucyB0byB0aGUgc2tldGNoXG4gICAgICByZW5kZXI6ICgpID0+IHRoaXMucmVuZGVyKCksXG4gICAgICB0b2dnbGVQbGF5OiAoKSA9PiB0aGlzLnRvZ2dsZVBsYXkoKSxcbiAgICAgIGRpc3BhdGNoOiAoY2IpID0+IHRoaXMuZGlzcGF0Y2goY2IpLFxuICAgICAgdGljazogKCkgPT4gdGhpcy50aWNrKCksXG4gICAgICByZXNpemU6ICgpID0+IHRoaXMucmVzaXplKCksXG4gICAgICB1cGRhdGU6IChvcHQpID0+IHRoaXMudXBkYXRlKG9wdCksXG4gICAgICBleHBvcnRGcmFtZTogb3B0ID0+IHRoaXMuZXhwb3J0RnJhbWUob3B0KSxcbiAgICAgIHJlY29yZDogKCkgPT4gdGhpcy5yZWNvcmQoKSxcbiAgICAgIHBsYXk6ICgpID0+IHRoaXMucGxheSgpLFxuICAgICAgcGF1c2U6ICgpID0+IHRoaXMucGF1c2UoKSxcbiAgICAgIHN0b3A6ICgpID0+IHRoaXMuc3RvcCgpXG4gICAgfTtcblxuICAgIC8vIEZvciBXZWJHTCBza2V0Y2hlcywgYSBnbCB2YXJpYWJsZSByZWFkcyBhIGJpdCBiZXR0ZXJcbiAgICB0aGlzLl9zZXR1cEdMS2V5KCk7XG5cbiAgICAvLyBUcmlnZ2VyIGluaXRpYWwgcmVzaXplIG5vdyBzbyB0aGF0IGNhbnZhcyBpcyBhbHJlYWR5IHNpemVkXG4gICAgLy8gYnkgdGhlIHRpbWUgd2UgbG9hZCB0aGUgc2tldGNoXG4gICAgdGhpcy5yZXNpemUoKTtcbiAgfVxuXG4gIGxvYWRBbmRSdW4gKGNhbnZhc1NrZXRjaCwgbmV3U2V0dGluZ3MpIHtcbiAgICByZXR1cm4gdGhpcy5sb2FkKGNhbnZhc1NrZXRjaCwgbmV3U2V0dGluZ3MpLnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy5ydW4oKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0pO1xuICB9XG5cbiAgdW5sb2FkICgpIHtcbiAgICB0aGlzLnBhdXNlKCk7XG4gICAgaWYgKCF0aGlzLnNrZXRjaCkgcmV0dXJuO1xuICAgIGlmICh0eXBlb2YgdGhpcy5za2V0Y2gudW5sb2FkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLl93cmFwQ29udGV4dFNjYWxlKHByb3BzID0+IHRoaXMuc2tldGNoLnVubG9hZChwcm9wcykpO1xuICAgIH1cbiAgICB0aGlzLl9za2V0Y2ggPSBudWxsO1xuICB9XG5cbiAgZGVzdHJveSAoKSB7XG4gICAgdGhpcy51bmxvYWQoKTtcbiAgICB0aGlzLnVubW91bnQoKTtcbiAgfVxuXG4gIGxvYWQgKGNyZWF0ZVNrZXRjaCwgbmV3U2V0dGluZ3MpIHtcbiAgICAvLyBVc2VyIGRpZG4ndCBzcGVjaWZ5IGEgZnVuY3Rpb25cbiAgICBpZiAodHlwZW9mIGNyZWF0ZVNrZXRjaCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgZnVuY3Rpb24gbXVzdCB0YWtlIGluIGEgZnVuY3Rpb24gYXMgdGhlIGZpcnN0IHBhcmFtZXRlci4gRXhhbXBsZTpcXG4gIGNhbnZhc1NrZXRjaGVyKCgpID0+IHsgLi4uIH0sIHNldHRpbmdzKScpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnNrZXRjaCkge1xuICAgICAgdGhpcy51bmxvYWQoKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG5ld1NldHRpbmdzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy51cGRhdGUobmV3U2V0dGluZ3MpO1xuICAgIH1cblxuICAgIC8vIFRoaXMgaXMgYSBiaXQgb2YgYSB0cmlja3kgY2FzZTsgd2Ugc2V0IHVwIHRoZSBhdXRvLXNjYWxpbmcgaGVyZVxuICAgIC8vIGluIGNhc2UgdGhlIHVzZXIgZGVjaWRlcyB0byByZW5kZXIgYW55dGhpbmcgdG8gdGhlIGNvbnRleHQgKmJlZm9yZSogdGhlXG4gICAgLy8gcmVuZGVyKCkgZnVuY3Rpb24uLi4gSG93ZXZlciwgdXNlcnMgc2hvdWxkIGluc3RlYWQgdXNlIGJlZ2luKCkgZnVuY3Rpb24gZm9yIHRoYXQuXG4gICAgdGhpcy5fcHJlUmVuZGVyKCk7XG5cbiAgICBsZXQgcHJlbG9hZCA9IFByb21pc2UucmVzb2x2ZSgpO1xuXG4gICAgLy8gQmVjYXVzZSBvZiBQNS5qcydzIHVudXN1YWwgc3RydWN0dXJlLCB3ZSBoYXZlIHRvIGRvIGEgYml0IG9mXG4gICAgLy8gbGlicmFyeS1zcGVjaWZpYyBjaGFuZ2VzIHRvIHN1cHBvcnQgaXQgcHJvcGVybHkuXG4gICAgaWYgKHRoaXMuc2V0dGluZ3MucDUpIHtcbiAgICAgIGlmICghaXNCcm93c2VyKCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdbY2FudmFzLXNrZXRjaF0gRVJST1I6IFVzaW5nIHA1LmpzIGluIE5vZGUuanMgaXMgbm90IHN1cHBvcnRlZCcpO1xuICAgICAgfVxuICAgICAgcHJlbG9hZCA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICBsZXQgUDVDb25zdHJ1Y3RvciA9IHRoaXMuc2V0dGluZ3MucDU7XG4gICAgICAgIGxldCBwcmVsb2FkO1xuICAgICAgICBpZiAoUDVDb25zdHJ1Y3Rvci5wNSkge1xuICAgICAgICAgIHByZWxvYWQgPSBQNUNvbnN0cnVjdG9yLnByZWxvYWQ7XG4gICAgICAgICAgUDVDb25zdHJ1Y3RvciA9IFA1Q29uc3RydWN0b3IucDU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgc2tldGNoIHNldHVwOyBkaXNhYmxlIGxvb3AsIHNldCBzaXppbmcsIGV0Yy5cbiAgICAgICAgY29uc3QgcDVTa2V0Y2ggPSBwNSA9PiB7XG4gICAgICAgICAgLy8gSG9vayBpbiBwcmVsb2FkIGlmIG5lY2Vzc2FyeVxuICAgICAgICAgIGlmIChwcmVsb2FkKSBwNS5wcmVsb2FkID0gKCkgPT4gcHJlbG9hZChwNSk7XG4gICAgICAgICAgcDUuc2V0dXAgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICBjb25zdCBpc0dMID0gdGhpcy5zZXR0aW5ncy5jb250ZXh0ID09PSAnd2ViZ2wnO1xuICAgICAgICAgICAgY29uc3QgcmVuZGVyZXIgPSBpc0dMID8gcDUuV0VCR0wgOiBwNS5QMkQ7XG4gICAgICAgICAgICBwNS5ub0xvb3AoKTtcbiAgICAgICAgICAgIHA1LnBpeGVsRGVuc2l0eShwcm9wcy5waXhlbFJhdGlvKTtcbiAgICAgICAgICAgIHA1LmNyZWF0ZUNhbnZhcyhwcm9wcy52aWV3cG9ydFdpZHRoLCBwcm9wcy52aWV3cG9ydEhlaWdodCwgcmVuZGVyZXIpO1xuICAgICAgICAgICAgaWYgKGlzR0wgJiYgdGhpcy5zZXR0aW5ncy5hdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICAgIHA1LnNldEF0dHJpYnV0ZXModGhpcy5zZXR0aW5ncy5hdHRyaWJ1dGVzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy51cGRhdGUoeyBwNSwgY2FudmFzOiBwNS5jYW52YXMsIGNvbnRleHQ6IHA1Ll9yZW5kZXJlci5kcmF3aW5nQ29udGV4dCB9KTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFN1cHBvcnQgZ2xvYmFsIGFuZCBpbnN0YW5jZSBQNS5qcyBtb2Rlc1xuICAgICAgICBpZiAodHlwZW9mIFA1Q29uc3RydWN0b3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBuZXcgUDVDb25zdHJ1Y3RvcihwNVNrZXRjaCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cuY3JlYXRlQ2FudmFzICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ7IHA1IH0gc2V0dGluZyBpcyBwYXNzZWQgYnV0IGNhbid0IGZpbmQgcDUuanMgaW4gZ2xvYmFsICh3aW5kb3cpIHNjb3BlLiBNYXliZSB5b3UgZGlkIG5vdCBjcmVhdGUgaXQgZ2xvYmFsbHk/XFxubmV3IHA1KCk7IC8vIDwtLSBhdHRhY2hlcyB0byBnbG9iYWwgc2NvcGVcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHA1U2tldGNoKHdpbmRvdyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBwcmVsb2FkLnRoZW4oKCkgPT4ge1xuICAgICAgLy8gTG9hZCB0aGUgdXNlcidzIHNrZXRjaFxuICAgICAgbGV0IGxvYWRlciA9IGNyZWF0ZVNrZXRjaCh0aGlzLnByb3BzKTtcbiAgICAgIGlmICghaXNQcm9taXNlKGxvYWRlcikpIHtcbiAgICAgICAgbG9hZGVyID0gUHJvbWlzZS5yZXNvbHZlKGxvYWRlcik7XG4gICAgICB9XG4gICAgICByZXR1cm4gbG9hZGVyO1xuICAgIH0pLnRoZW4oc2tldGNoID0+IHtcbiAgICAgIGlmICghc2tldGNoKSBza2V0Y2ggPSB7fTtcbiAgICAgIHRoaXMuX3NrZXRjaCA9IHNrZXRjaDtcblxuICAgICAgLy8gT25jZSB0aGUgc2tldGNoIGlzIGxvYWRlZCB3ZSBjYW4gYWRkIHRoZSBldmVudHNcbiAgICAgIGlmIChpc0Jyb3dzZXIoKSkge1xuICAgICAgICB0aGlzLl9rZXlib2FyZFNob3J0Y3V0cy5hdHRhY2goKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuX3Jlc2l6ZUhhbmRsZXIpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9wb3N0UmVuZGVyKCk7XG5cbiAgICAgIC8vIFRoZSBpbml0aWFsIHJlc2l6ZSgpIGluIHRoZSBjb25zdHJ1Y3RvciB3aWxsIG5vdCBoYXZlXG4gICAgICAvLyB0cmlnZ2VyZWQgYSByZXNpemUoKSBldmVudCBvbiB0aGUgc2tldGNoLCBzaW5jZSBpdCB3YXMgYmVmb3JlXG4gICAgICAvLyB0aGUgc2tldGNoIHdhcyBsb2FkZWQuIFNvIHdlIHNlbmQgdGhlIHNpZ25hbCBoZXJlLCBhbGxvd2luZ1xuICAgICAgLy8gdXNlcnMgdG8gcmVhY3QgdG8gdGhlIGluaXRpYWwgc2l6ZSBiZWZvcmUgZmlyc3QgcmVuZGVyLlxuICAgICAgdGhpcy5fc2l6ZUNoYW5nZWQoKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICBjb25zb2xlLndhcm4oJ0NvdWxkIG5vdCBzdGFydCBza2V0Y2gsIHRoZSBhc3luYyBsb2FkaW5nIGZ1bmN0aW9uIHJlamVjdGVkIHdpdGggYW4gZXJyb3I6XFxuICAgIEVycm9yOiAnICsgZXJyLm1lc3NhZ2UpO1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNrZXRjaE1hbmFnZXI7XG4iLCJpbXBvcnQgU2tldGNoTWFuYWdlciBmcm9tICcuL2NvcmUvU2tldGNoTWFuYWdlcic7XG5pbXBvcnQgUGFwZXJTaXplcyBmcm9tICcuL3BhcGVyLXNpemVzJztcbmltcG9ydCB7IGdldENsaWVudEFQSSB9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQgZGVmaW5lZCBmcm9tICdkZWZpbmVkJztcblxuY29uc3QgQ0FDSEUgPSAnaG90LWlkLWNhY2hlJztcbmNvbnN0IHJ1bnRpbWVDb2xsaXNpb25zID0gW107XG5cbmZ1bmN0aW9uIGlzSG90UmVsb2FkICgpIHtcbiAgY29uc3QgY2xpZW50ID0gZ2V0Q2xpZW50QVBJKCk7XG4gIHJldHVybiBjbGllbnQgJiYgY2xpZW50LmhvdDtcbn1cblxuZnVuY3Rpb24gY2FjaGVHZXQgKGlkKSB7XG4gIGNvbnN0IGNsaWVudCA9IGdldENsaWVudEFQSSgpO1xuICBpZiAoIWNsaWVudCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgY2xpZW50W0NBQ0hFXSA9IGNsaWVudFtDQUNIRV0gfHwge307XG4gIHJldHVybiBjbGllbnRbQ0FDSEVdW2lkXTtcbn1cblxuZnVuY3Rpb24gY2FjaGVQdXQgKGlkLCBkYXRhKSB7XG4gIGNvbnN0IGNsaWVudCA9IGdldENsaWVudEFQSSgpO1xuICBpZiAoIWNsaWVudCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgY2xpZW50W0NBQ0hFXSA9IGNsaWVudFtDQUNIRV0gfHwge307XG4gIGNsaWVudFtDQUNIRV1baWRdID0gZGF0YTtcbn1cblxuZnVuY3Rpb24gZ2V0VGltZVByb3AgKG9sZE1hbmFnZXIsIG5ld1NldHRpbmdzKSB7XG4gIC8vIFN0YXRpYyBza2V0Y2hlcyBpZ25vcmUgdGhlIHRpbWUgcGVyc2lzdGVuY3lcbiAgcmV0dXJuIG5ld1NldHRpbmdzLmFuaW1hdGUgPyB7IHRpbWU6IG9sZE1hbmFnZXIucHJvcHMudGltZSB9IDogdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBjYW52YXNTa2V0Y2ggKHNrZXRjaCwgc2V0dGluZ3MgPSB7fSkge1xuICBpZiAoc2V0dGluZ3MucDUpIHtcbiAgICBpZiAoc2V0dGluZ3MuY2FudmFzIHx8IChzZXR0aW5ncy5jb250ZXh0ICYmIHR5cGVvZiBzZXR0aW5ncy5jb250ZXh0ICE9PSAnc3RyaW5nJykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW4geyBwNSB9IG1vZGUsIHlvdSBjYW4ndCBwYXNzIHlvdXIgb3duIGNhbnZhcyBvciBjb250ZXh0LCB1bmxlc3MgdGhlIGNvbnRleHQgaXMgYSBcIndlYmdsXCIgb3IgXCIyZFwiIHN0cmluZ2ApO1xuICAgIH1cblxuICAgIC8vIERvIG5vdCBjcmVhdGUgYSBjYW52YXMgb24gc3RhcnR1cCwgc2luY2UgUDUuanMgZG9lcyB0aGF0IGZvciB1c1xuICAgIGNvbnN0IGNvbnRleHQgPSB0eXBlb2Ygc2V0dGluZ3MuY29udGV4dCA9PT0gJ3N0cmluZycgPyBzZXR0aW5ncy5jb250ZXh0IDogZmFsc2U7XG4gICAgc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBzZXR0aW5ncywgeyBjYW52YXM6IGZhbHNlLCBjb250ZXh0IH0pO1xuICB9XG5cbiAgY29uc3QgaXNIb3QgPSBpc0hvdFJlbG9hZCgpO1xuICBsZXQgaG90SUQ7XG4gIGlmIChpc0hvdCkge1xuICAgIC8vIFVzZSBhIG1hZ2ljIG5hbWUgYnkgZGVmYXVsdCwgZm9yY2UgdXNlciB0byBkZWZpbmUgZWFjaCBza2V0Y2ggaWYgdGhleVxuICAgIC8vIHJlcXVpcmUgbW9yZSB0aGFuIG9uZSBpbiBhbiBhcHBsaWNhdGlvbi4gT3BlbiB0byBvdGhlciBpZGVhcyBvbiBob3cgdG8gdGFja2xlXG4gICAgLy8gdGhpcyBhcyB3ZWxsLi4uXG4gICAgaG90SUQgPSBkZWZpbmVkKHNldHRpbmdzLmlkLCAnJF9fREVGQVVMVF9DQU5WQVNfU0tFVENIX0lEX18kJyk7XG4gIH1cbiAgbGV0IGlzSW5qZWN0aW5nID0gaXNIb3QgJiYgdHlwZW9mIGhvdElEID09PSAnc3RyaW5nJztcblxuICBpZiAoaXNJbmplY3RpbmcgJiYgcnVudGltZUNvbGxpc2lvbnMuaW5jbHVkZXMoaG90SUQpKSB7XG4gICAgY29uc29sZS53YXJuKGBXYXJuaW5nOiBZb3UgaGF2ZSBtdWx0aXBsZSBjYWxscyB0byBjYW52YXNTa2V0Y2goKSBpbiAtLWhvdCBtb2RlLiBZb3UgbXVzdCBwYXNzIHVuaXF1ZSB7IGlkIH0gc3RyaW5ncyBpbiBzZXR0aW5ncyB0byBlbmFibGUgaG90IHJlbG9hZCBhY3Jvc3MgbXVsdGlwbGUgc2tldGNoZXMuIGAsIGhvdElEKTtcbiAgICBpc0luamVjdGluZyA9IGZhbHNlO1xuICB9XG5cbiAgbGV0IHByZWxvYWQgPSBQcm9taXNlLnJlc29sdmUoKTtcblxuICBpZiAoaXNJbmplY3RpbmcpIHtcbiAgICAvLyBNYXJrIHRoaXMgYXMgYWxyZWFkeSBzcG90dGVkIGluIHRoaXMgcnVudGltZSBpbnN0YW5jZVxuICAgIHJ1bnRpbWVDb2xsaXNpb25zLnB1c2goaG90SUQpO1xuXG4gICAgY29uc3QgcHJldmlvdXNEYXRhID0gY2FjaGVHZXQoaG90SUQpO1xuICAgIGlmIChwcmV2aW91c0RhdGEpIHtcbiAgICAgIGNvbnN0IG5leHQgPSAoKSA9PiB7XG4gICAgICAgIC8vIEdyYWIgbmV3IHByb3BzIGZyb20gb2xkIHNrZXRjaCBpbnN0YW5jZVxuICAgICAgICBjb25zdCBuZXdQcm9wcyA9IGdldFRpbWVQcm9wKHByZXZpb3VzRGF0YS5tYW5hZ2VyLCBzZXR0aW5ncyk7XG4gICAgICAgIC8vIERlc3Ryb3kgdGhlIG9sZCBpbnN0YW5jZVxuICAgICAgICBwcmV2aW91c0RhdGEubWFuYWdlci5kZXN0cm95KCk7XG4gICAgICAgIC8vIFBhc3MgYWxvbmcgbmV3IHByb3BzXG4gICAgICAgIHJldHVybiBuZXdQcm9wcztcbiAgICAgIH07XG5cbiAgICAgIC8vIE1vdmUgYWxvbmcgdGhlIG5leHQgZGF0YS4uLlxuICAgICAgcHJlbG9hZCA9IHByZXZpb3VzRGF0YS5sb2FkLnRoZW4obmV4dCkuY2F0Y2gobmV4dCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHByZWxvYWQudGhlbihuZXdQcm9wcyA9PiB7XG4gICAgY29uc3QgbWFuYWdlciA9IG5ldyBTa2V0Y2hNYW5hZ2VyKCk7XG4gICAgbGV0IHJlc3VsdDtcbiAgICBpZiAoc2tldGNoKSB7XG4gICAgICAvLyBNZXJnZSB3aXRoIGluY29taW5nIGRhdGFcbiAgICAgIHNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgc2V0dGluZ3MsIG5ld1Byb3BzKTtcblxuICAgICAgLy8gQXBwbHkgc2V0dGluZ3MgYW5kIGNyZWF0ZSBhIGNhbnZhc1xuICAgICAgbWFuYWdlci5zZXR1cChzZXR0aW5ncyk7XG5cbiAgICAgIC8vIE1vdW50IHRvIERPTVxuICAgICAgbWFuYWdlci5tb3VudCgpO1xuXG4gICAgICAvLyBsb2FkIHRoZSBza2V0Y2ggZmlyc3RcbiAgICAgIHJlc3VsdCA9IG1hbmFnZXIubG9hZEFuZFJ1bihza2V0Y2gpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgPSBQcm9taXNlLnJlc29sdmUobWFuYWdlcik7XG4gICAgfVxuICAgIGlmIChpc0luamVjdGluZykge1xuICAgICAgY2FjaGVQdXQoaG90SUQsIHsgbG9hZDogcmVzdWx0LCBtYW5hZ2VyIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9KTtcbn1cblxuLy8gVE9ETzogRmlndXJlIG91dCBhIG5pY2Ugd2F5IHRvIGV4cG9ydCB0aGluZ3MuXG5jYW52YXNTa2V0Y2guY2FudmFzU2tldGNoID0gY2FudmFzU2tldGNoO1xuY2FudmFzU2tldGNoLlBhcGVyU2l6ZXMgPSBQYXBlclNpemVzO1xuXG5leHBvcnQgZGVmYXVsdCBjYW52YXNTa2V0Y2g7XG4iLCJ2YXIgZGVmaW5lZCA9IHJlcXVpcmUoJ2RlZmluZWQnKTtcbnZhciB1bml0cyA9IFsgJ21tJywgJ2NtJywgJ20nLCAncGMnLCAncHQnLCAnaW4nLCAnZnQnLCAncHgnIF07XG5cbnZhciBjb252ZXJzaW9ucyA9IHtcbiAgLy8gbWV0cmljXG4gIG06IHtcbiAgICBzeXN0ZW06ICdtZXRyaWMnLFxuICAgIGZhY3RvcjogMVxuICB9LFxuICBjbToge1xuICAgIHN5c3RlbTogJ21ldHJpYycsXG4gICAgZmFjdG9yOiAxIC8gMTAwXG4gIH0sXG4gIG1tOiB7XG4gICAgc3lzdGVtOiAnbWV0cmljJyxcbiAgICBmYWN0b3I6IDEgLyAxMDAwXG4gIH0sXG4gIC8vIGltcGVyaWFsXG4gIHB0OiB7XG4gICAgc3lzdGVtOiAnaW1wZXJpYWwnLFxuICAgIGZhY3RvcjogMSAvIDcyXG4gIH0sXG4gIHBjOiB7XG4gICAgc3lzdGVtOiAnaW1wZXJpYWwnLFxuICAgIGZhY3RvcjogMSAvIDZcbiAgfSxcbiAgaW46IHtcbiAgICBzeXN0ZW06ICdpbXBlcmlhbCcsXG4gICAgZmFjdG9yOiAxXG4gIH0sXG4gIGZ0OiB7XG4gICAgc3lzdGVtOiAnaW1wZXJpYWwnLFxuICAgIGZhY3RvcjogMTJcbiAgfVxufTtcblxuY29uc3QgYW5jaG9ycyA9IHtcbiAgbWV0cmljOiB7XG4gICAgdW5pdDogJ20nLFxuICAgIHJhdGlvOiAxIC8gMC4wMjU0XG4gIH0sXG4gIGltcGVyaWFsOiB7XG4gICAgdW5pdDogJ2luJyxcbiAgICByYXRpbzogMC4wMjU0XG4gIH1cbn07XG5cbmZ1bmN0aW9uIHJvdW5kICh2YWx1ZSwgZGVjaW1hbHMpIHtcbiAgcmV0dXJuIE51bWJlcihNYXRoLnJvdW5kKHZhbHVlICsgJ2UnICsgZGVjaW1hbHMpICsgJ2UtJyArIGRlY2ltYWxzKTtcbn1cblxuZnVuY3Rpb24gY29udmVydERpc3RhbmNlICh2YWx1ZSwgZnJvbVVuaXQsIHRvVW5pdCwgb3B0cykge1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnbnVtYmVyJyB8fCAhaXNGaW5pdGUodmFsdWUpKSB0aHJvdyBuZXcgRXJyb3IoJ1ZhbHVlIG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyJyk7XG4gIGlmICghZnJvbVVuaXQgfHwgIXRvVW5pdCkgdGhyb3cgbmV3IEVycm9yKCdNdXN0IHNwZWNpZnkgZnJvbSBhbmQgdG8gdW5pdHMnKTtcblxuICBvcHRzID0gb3B0cyB8fCB7fTtcbiAgdmFyIHBpeGVsc1BlckluY2ggPSBkZWZpbmVkKG9wdHMucGl4ZWxzUGVySW5jaCwgOTYpO1xuICB2YXIgcHJlY2lzaW9uID0gb3B0cy5wcmVjaXNpb247XG4gIHZhciByb3VuZFBpeGVsID0gb3B0cy5yb3VuZFBpeGVsICE9PSBmYWxzZTtcblxuICBmcm9tVW5pdCA9IGZyb21Vbml0LnRvTG93ZXJDYXNlKCk7XG4gIHRvVW5pdCA9IHRvVW5pdC50b0xvd2VyQ2FzZSgpO1xuXG4gIGlmICh1bml0cy5pbmRleE9mKGZyb21Vbml0KSA9PT0gLTEpIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBmcm9tIHVuaXQgXCInICsgZnJvbVVuaXQgKyAnXCIsIG11c3QgYmUgb25lIG9mOiAnICsgdW5pdHMuam9pbignLCAnKSk7XG4gIGlmICh1bml0cy5pbmRleE9mKHRvVW5pdCkgPT09IC0xKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZnJvbSB1bml0IFwiJyArIHRvVW5pdCArICdcIiwgbXVzdCBiZSBvbmUgb2Y6ICcgKyB1bml0cy5qb2luKCcsICcpKTtcblxuICBpZiAoZnJvbVVuaXQgPT09IHRvVW5pdCkge1xuICAgIC8vIFdlIGRvbid0IG5lZWQgdG8gY29udmVydCBmcm9tIEEgdG8gQiBzaW5jZSB0aGV5IGFyZSB0aGUgc2FtZSBhbHJlYWR5XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgdmFyIHRvRmFjdG9yID0gMTtcbiAgdmFyIGZyb21GYWN0b3IgPSAxO1xuICB2YXIgaXNUb1BpeGVsID0gZmFsc2U7XG5cbiAgaWYgKGZyb21Vbml0ID09PSAncHgnKSB7XG4gICAgZnJvbUZhY3RvciA9IDEgLyBwaXhlbHNQZXJJbmNoO1xuICAgIGZyb21Vbml0ID0gJ2luJztcbiAgfVxuICBpZiAodG9Vbml0ID09PSAncHgnKSB7XG4gICAgaXNUb1BpeGVsID0gdHJ1ZTtcbiAgICB0b0ZhY3RvciA9IHBpeGVsc1BlckluY2g7XG4gICAgdG9Vbml0ID0gJ2luJztcbiAgfVxuXG4gIHZhciBmcm9tVW5pdERhdGEgPSBjb252ZXJzaW9uc1tmcm9tVW5pdF07XG4gIHZhciB0b1VuaXREYXRhID0gY29udmVyc2lvbnNbdG9Vbml0XTtcblxuICAvLyBzb3VyY2UgdG8gYW5jaG9yIGluc2lkZSBzb3VyY2UncyBzeXN0ZW1cbiAgdmFyIGFuY2hvciA9IHZhbHVlICogZnJvbVVuaXREYXRhLmZhY3RvciAqIGZyb21GYWN0b3I7XG5cbiAgLy8gaWYgc3lzdGVtcyBkaWZmZXIsIGNvbnZlcnQgb25lIHRvIGFub3RoZXJcbiAgaWYgKGZyb21Vbml0RGF0YS5zeXN0ZW0gIT09IHRvVW5pdERhdGEuc3lzdGVtKSB7XG4gICAgLy8gcmVndWxhciAnbScgdG8gJ2luJyBhbmQgc28gZm9ydGhcbiAgICBhbmNob3IgKj0gYW5jaG9yc1tmcm9tVW5pdERhdGEuc3lzdGVtXS5yYXRpbztcbiAgfVxuXG4gIHZhciByZXN1bHQgPSBhbmNob3IgLyB0b1VuaXREYXRhLmZhY3RvciAqIHRvRmFjdG9yO1xuICBpZiAoaXNUb1BpeGVsICYmIHJvdW5kUGl4ZWwpIHtcbiAgICByZXN1bHQgPSBNYXRoLnJvdW5kKHJlc3VsdCk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHByZWNpc2lvbiA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUocHJlY2lzaW9uKSkge1xuICAgIHJlc3VsdCA9IHJvdW5kKHJlc3VsdCwgcHJlY2lzaW9uKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbnZlcnREaXN0YW5jZTtcbm1vZHVsZS5leHBvcnRzLnVuaXRzID0gdW5pdHM7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoYXJndW1lbnRzW2ldICE9PSB1bmRlZmluZWQpIHJldHVybiBhcmd1bWVudHNbaV07XG4gICAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciB3aWR0aCA9IDI1NjsvLyBlYWNoIFJDNCBvdXRwdXQgaXMgMCA8PSB4IDwgMjU2XHJcbnZhciBjaHVua3MgPSA2Oy8vIGF0IGxlYXN0IHNpeCBSQzQgb3V0cHV0cyBmb3IgZWFjaCBkb3VibGVcclxudmFyIGRpZ2l0cyA9IDUyOy8vIHRoZXJlIGFyZSA1MiBzaWduaWZpY2FudCBkaWdpdHMgaW4gYSBkb3VibGVcclxudmFyIHBvb2wgPSBbXTsvLyBwb29sOiBlbnRyb3B5IHBvb2wgc3RhcnRzIGVtcHR5XHJcbnZhciBHTE9CQUwgPSB0eXBlb2YgZ2xvYmFsID09PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IGdsb2JhbDtcclxuXHJcbi8vXHJcbi8vIFRoZSBmb2xsb3dpbmcgY29uc3RhbnRzIGFyZSByZWxhdGVkIHRvIElFRUUgNzU0IGxpbWl0cy5cclxuLy9cclxudmFyIHN0YXJ0ZGVub20gPSBNYXRoLnBvdyh3aWR0aCwgY2h1bmtzKSxcclxuICAgIHNpZ25pZmljYW5jZSA9IE1hdGgucG93KDIsIGRpZ2l0cyksXHJcbiAgICBvdmVyZmxvdyA9IHNpZ25pZmljYW5jZSAqIDIsXHJcbiAgICBtYXNrID0gd2lkdGggLSAxO1xyXG5cclxuXHJcbnZhciBvbGRSYW5kb20gPSBNYXRoLnJhbmRvbTtcclxuXHJcbi8vXHJcbi8vIHNlZWRyYW5kb20oKVxyXG4vLyBUaGlzIGlzIHRoZSBzZWVkcmFuZG9tIGZ1bmN0aW9uIGRlc2NyaWJlZCBhYm92ZS5cclxuLy9cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzZWVkLCBvcHRpb25zKSB7XHJcbiAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5nbG9iYWwgPT09IHRydWUpIHtcclxuICAgIG9wdGlvbnMuZ2xvYmFsID0gZmFsc2U7XHJcbiAgICBNYXRoLnJhbmRvbSA9IG1vZHVsZS5leHBvcnRzKHNlZWQsIG9wdGlvbnMpO1xyXG4gICAgb3B0aW9ucy5nbG9iYWwgPSB0cnVlO1xyXG4gICAgcmV0dXJuIE1hdGgucmFuZG9tO1xyXG4gIH1cclxuICB2YXIgdXNlX2VudHJvcHkgPSAob3B0aW9ucyAmJiBvcHRpb25zLmVudHJvcHkpIHx8IGZhbHNlO1xyXG4gIHZhciBrZXkgPSBbXTtcclxuXHJcbiAgLy8gRmxhdHRlbiB0aGUgc2VlZCBzdHJpbmcgb3IgYnVpbGQgb25lIGZyb20gbG9jYWwgZW50cm9weSBpZiBuZWVkZWQuXHJcbiAgdmFyIHNob3J0c2VlZCA9IG1peGtleShmbGF0dGVuKFxyXG4gICAgdXNlX2VudHJvcHkgPyBbc2VlZCwgdG9zdHJpbmcocG9vbCldIDpcclxuICAgIDAgaW4gYXJndW1lbnRzID8gc2VlZCA6IGF1dG9zZWVkKCksIDMpLCBrZXkpO1xyXG5cclxuICAvLyBVc2UgdGhlIHNlZWQgdG8gaW5pdGlhbGl6ZSBhbiBBUkM0IGdlbmVyYXRvci5cclxuICB2YXIgYXJjNCA9IG5ldyBBUkM0KGtleSk7XHJcblxyXG4gIC8vIE1peCB0aGUgcmFuZG9tbmVzcyBpbnRvIGFjY3VtdWxhdGVkIGVudHJvcHkuXHJcbiAgbWl4a2V5KHRvc3RyaW5nKGFyYzQuUyksIHBvb2wpO1xyXG5cclxuICAvLyBPdmVycmlkZSBNYXRoLnJhbmRvbVxyXG5cclxuICAvLyBUaGlzIGZ1bmN0aW9uIHJldHVybnMgYSByYW5kb20gZG91YmxlIGluIFswLCAxKSB0aGF0IGNvbnRhaW5zXHJcbiAgLy8gcmFuZG9tbmVzcyBpbiBldmVyeSBiaXQgb2YgdGhlIG1hbnRpc3NhIG9mIHRoZSBJRUVFIDc1NCB2YWx1ZS5cclxuXHJcbiAgcmV0dXJuIGZ1bmN0aW9uKCkgeyAgICAgICAgIC8vIENsb3N1cmUgdG8gcmV0dXJuIGEgcmFuZG9tIGRvdWJsZTpcclxuICAgIHZhciBuID0gYXJjNC5nKGNodW5rcyksICAgICAgICAgICAgIC8vIFN0YXJ0IHdpdGggYSBudW1lcmF0b3IgbiA8IDIgXiA0OFxyXG4gICAgICAgIGQgPSBzdGFydGRlbm9tLCAgICAgICAgICAgICAgICAgLy8gICBhbmQgZGVub21pbmF0b3IgZCA9IDIgXiA0OC5cclxuICAgICAgICB4ID0gMDsgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgYW5kIG5vICdleHRyYSBsYXN0IGJ5dGUnLlxyXG4gICAgd2hpbGUgKG4gPCBzaWduaWZpY2FuY2UpIHsgICAgICAgICAgLy8gRmlsbCB1cCBhbGwgc2lnbmlmaWNhbnQgZGlnaXRzIGJ5XHJcbiAgICAgIG4gPSAobiArIHgpICogd2lkdGg7ICAgICAgICAgICAgICAvLyAgIHNoaWZ0aW5nIG51bWVyYXRvciBhbmRcclxuICAgICAgZCAqPSB3aWR0aDsgICAgICAgICAgICAgICAgICAgICAgIC8vICAgZGVub21pbmF0b3IgYW5kIGdlbmVyYXRpbmcgYVxyXG4gICAgICB4ID0gYXJjNC5nKDEpOyAgICAgICAgICAgICAgICAgICAgLy8gICBuZXcgbGVhc3Qtc2lnbmlmaWNhbnQtYnl0ZS5cclxuICAgIH1cclxuICAgIHdoaWxlIChuID49IG92ZXJmbG93KSB7ICAgICAgICAgICAgIC8vIFRvIGF2b2lkIHJvdW5kaW5nIHVwLCBiZWZvcmUgYWRkaW5nXHJcbiAgICAgIG4gLz0gMjsgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGxhc3QgYnl0ZSwgc2hpZnQgZXZlcnl0aGluZ1xyXG4gICAgICBkIC89IDI7ICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICByaWdodCB1c2luZyBpbnRlZ2VyIE1hdGggdW50aWxcclxuICAgICAgeCA+Pj49IDE7ICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgd2UgaGF2ZSBleGFjdGx5IHRoZSBkZXNpcmVkIGJpdHMuXHJcbiAgICB9XHJcbiAgICByZXR1cm4gKG4gKyB4KSAvIGQ7ICAgICAgICAgICAgICAgICAvLyBGb3JtIHRoZSBudW1iZXIgd2l0aGluIFswLCAxKS5cclxuICB9O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMucmVzZXRHbG9iYWwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgTWF0aC5yYW5kb20gPSBvbGRSYW5kb207XHJcbn07XHJcblxyXG4vL1xyXG4vLyBBUkM0XHJcbi8vXHJcbi8vIEFuIEFSQzQgaW1wbGVtZW50YXRpb24uICBUaGUgY29uc3RydWN0b3IgdGFrZXMgYSBrZXkgaW4gdGhlIGZvcm0gb2ZcclxuLy8gYW4gYXJyYXkgb2YgYXQgbW9zdCAod2lkdGgpIGludGVnZXJzIHRoYXQgc2hvdWxkIGJlIDAgPD0geCA8ICh3aWR0aCkuXHJcbi8vXHJcbi8vIFRoZSBnKGNvdW50KSBtZXRob2QgcmV0dXJucyBhIHBzZXVkb3JhbmRvbSBpbnRlZ2VyIHRoYXQgY29uY2F0ZW5hdGVzXHJcbi8vIHRoZSBuZXh0IChjb3VudCkgb3V0cHV0cyBmcm9tIEFSQzQuICBJdHMgcmV0dXJuIHZhbHVlIGlzIGEgbnVtYmVyIHhcclxuLy8gdGhhdCBpcyBpbiB0aGUgcmFuZ2UgMCA8PSB4IDwgKHdpZHRoIF4gY291bnQpLlxyXG4vL1xyXG4vKiogQGNvbnN0cnVjdG9yICovXHJcbmZ1bmN0aW9uIEFSQzQoa2V5KSB7XHJcbiAgdmFyIHQsIGtleWxlbiA9IGtleS5sZW5ndGgsXHJcbiAgICAgIG1lID0gdGhpcywgaSA9IDAsIGogPSBtZS5pID0gbWUuaiA9IDAsIHMgPSBtZS5TID0gW107XHJcblxyXG4gIC8vIFRoZSBlbXB0eSBrZXkgW10gaXMgdHJlYXRlZCBhcyBbMF0uXHJcbiAgaWYgKCFrZXlsZW4pIHsga2V5ID0gW2tleWxlbisrXTsgfVxyXG5cclxuICAvLyBTZXQgdXAgUyB1c2luZyB0aGUgc3RhbmRhcmQga2V5IHNjaGVkdWxpbmcgYWxnb3JpdGhtLlxyXG4gIHdoaWxlIChpIDwgd2lkdGgpIHtcclxuICAgIHNbaV0gPSBpKys7XHJcbiAgfVxyXG4gIGZvciAoaSA9IDA7IGkgPCB3aWR0aDsgaSsrKSB7XHJcbiAgICBzW2ldID0gc1tqID0gbWFzayAmIChqICsga2V5W2kgJSBrZXlsZW5dICsgKHQgPSBzW2ldKSldO1xyXG4gICAgc1tqXSA9IHQ7XHJcbiAgfVxyXG5cclxuICAvLyBUaGUgXCJnXCIgbWV0aG9kIHJldHVybnMgdGhlIG5leHQgKGNvdW50KSBvdXRwdXRzIGFzIG9uZSBudW1iZXIuXHJcbiAgKG1lLmcgPSBmdW5jdGlvbihjb3VudCkge1xyXG4gICAgLy8gVXNpbmcgaW5zdGFuY2UgbWVtYmVycyBpbnN0ZWFkIG9mIGNsb3N1cmUgc3RhdGUgbmVhcmx5IGRvdWJsZXMgc3BlZWQuXHJcbiAgICB2YXIgdCwgciA9IDAsXHJcbiAgICAgICAgaSA9IG1lLmksIGogPSBtZS5qLCBzID0gbWUuUztcclxuICAgIHdoaWxlIChjb3VudC0tKSB7XHJcbiAgICAgIHQgPSBzW2kgPSBtYXNrICYgKGkgKyAxKV07XHJcbiAgICAgIHIgPSByICogd2lkdGggKyBzW21hc2sgJiAoKHNbaV0gPSBzW2ogPSBtYXNrICYgKGogKyB0KV0pICsgKHNbal0gPSB0KSldO1xyXG4gICAgfVxyXG4gICAgbWUuaSA9IGk7IG1lLmogPSBqO1xyXG4gICAgcmV0dXJuIHI7XHJcbiAgICAvLyBGb3Igcm9idXN0IHVucHJlZGljdGFiaWxpdHkgZGlzY2FyZCBhbiBpbml0aWFsIGJhdGNoIG9mIHZhbHVlcy5cclxuICAgIC8vIFNlZSBodHRwOi8vd3d3LnJzYS5jb20vcnNhbGFicy9ub2RlLmFzcD9pZD0yMDA5XHJcbiAgfSkod2lkdGgpO1xyXG59XHJcblxyXG4vL1xyXG4vLyBmbGF0dGVuKClcclxuLy8gQ29udmVydHMgYW4gb2JqZWN0IHRyZWUgdG8gbmVzdGVkIGFycmF5cyBvZiBzdHJpbmdzLlxyXG4vL1xyXG5mdW5jdGlvbiBmbGF0dGVuKG9iaiwgZGVwdGgpIHtcclxuICB2YXIgcmVzdWx0ID0gW10sIHR5cCA9ICh0eXBlb2Ygb2JqKVswXSwgcHJvcDtcclxuICBpZiAoZGVwdGggJiYgdHlwID09ICdvJykge1xyXG4gICAgZm9yIChwcm9wIGluIG9iaikge1xyXG4gICAgICB0cnkgeyByZXN1bHQucHVzaChmbGF0dGVuKG9ialtwcm9wXSwgZGVwdGggLSAxKSk7IH0gY2F0Y2ggKGUpIHt9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiAocmVzdWx0Lmxlbmd0aCA/IHJlc3VsdCA6IHR5cCA9PSAncycgPyBvYmogOiBvYmogKyAnXFwwJyk7XHJcbn1cclxuXHJcbi8vXHJcbi8vIG1peGtleSgpXHJcbi8vIE1peGVzIGEgc3RyaW5nIHNlZWQgaW50byBhIGtleSB0aGF0IGlzIGFuIGFycmF5IG9mIGludGVnZXJzLCBhbmRcclxuLy8gcmV0dXJucyBhIHNob3J0ZW5lZCBzdHJpbmcgc2VlZCB0aGF0IGlzIGVxdWl2YWxlbnQgdG8gdGhlIHJlc3VsdCBrZXkuXHJcbi8vXHJcbmZ1bmN0aW9uIG1peGtleShzZWVkLCBrZXkpIHtcclxuICB2YXIgc3RyaW5nc2VlZCA9IHNlZWQgKyAnJywgc21lYXIsIGogPSAwO1xyXG4gIHdoaWxlIChqIDwgc3RyaW5nc2VlZC5sZW5ndGgpIHtcclxuICAgIGtleVttYXNrICYgal0gPVxyXG4gICAgICBtYXNrICYgKChzbWVhciBePSBrZXlbbWFzayAmIGpdICogMTkpICsgc3RyaW5nc2VlZC5jaGFyQ29kZUF0KGorKykpO1xyXG4gIH1cclxuICByZXR1cm4gdG9zdHJpbmcoa2V5KTtcclxufVxyXG5cclxuLy9cclxuLy8gYXV0b3NlZWQoKVxyXG4vLyBSZXR1cm5zIGFuIG9iamVjdCBmb3IgYXV0b3NlZWRpbmcsIHVzaW5nIHdpbmRvdy5jcnlwdG8gaWYgYXZhaWxhYmxlLlxyXG4vL1xyXG4vKiogQHBhcmFtIHtVaW50OEFycmF5PX0gc2VlZCAqL1xyXG5mdW5jdGlvbiBhdXRvc2VlZChzZWVkKSB7XHJcbiAgdHJ5IHtcclxuICAgIEdMT0JBTC5jcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKHNlZWQgPSBuZXcgVWludDhBcnJheSh3aWR0aCkpO1xyXG4gICAgcmV0dXJuIHRvc3RyaW5nKHNlZWQpO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHJldHVybiBbK25ldyBEYXRlLCBHTE9CQUwsIEdMT0JBTC5uYXZpZ2F0b3IgJiYgR0xPQkFMLm5hdmlnYXRvci5wbHVnaW5zLFxyXG4gICAgICAgICAgICBHTE9CQUwuc2NyZWVuLCB0b3N0cmluZyhwb29sKV07XHJcbiAgfVxyXG59XHJcblxyXG4vL1xyXG4vLyB0b3N0cmluZygpXHJcbi8vIENvbnZlcnRzIGFuIGFycmF5IG9mIGNoYXJjb2RlcyB0byBhIHN0cmluZ1xyXG4vL1xyXG5mdW5jdGlvbiB0b3N0cmluZyhhKSB7XHJcbiAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoMCwgYSk7XHJcbn1cclxuXHJcbi8vXHJcbi8vIFdoZW4gc2VlZHJhbmRvbS5qcyBpcyBsb2FkZWQsIHdlIGltbWVkaWF0ZWx5IG1peCBhIGZldyBiaXRzXHJcbi8vIGZyb20gdGhlIGJ1aWx0LWluIFJORyBpbnRvIHRoZSBlbnRyb3B5IHBvb2wuICBCZWNhdXNlIHdlIGRvXHJcbi8vIG5vdCB3YW50IHRvIGludGVmZXJlIHdpdGggZGV0ZXJtaW5zdGljIFBSTkcgc3RhdGUgbGF0ZXIsXHJcbi8vIHNlZWRyYW5kb20gd2lsbCBub3QgY2FsbCBNYXRoLnJhbmRvbSBvbiBpdHMgb3duIGFnYWluIGFmdGVyXHJcbi8vIGluaXRpYWxpemF0aW9uLlxyXG4vL1xyXG5taXhrZXkoTWF0aC5yYW5kb20oKSwgcG9vbCk7XHJcbiIsIi8qXG4gKiBBIGZhc3QgamF2YXNjcmlwdCBpbXBsZW1lbnRhdGlvbiBvZiBzaW1wbGV4IG5vaXNlIGJ5IEpvbmFzIFdhZ25lclxuXG5CYXNlZCBvbiBhIHNwZWVkLWltcHJvdmVkIHNpbXBsZXggbm9pc2UgYWxnb3JpdGhtIGZvciAyRCwgM0QgYW5kIDREIGluIEphdmEuXG5XaGljaCBpcyBiYXNlZCBvbiBleGFtcGxlIGNvZGUgYnkgU3RlZmFuIEd1c3RhdnNvbiAoc3RlZ3VAaXRuLmxpdS5zZSkuXG5XaXRoIE9wdGltaXNhdGlvbnMgYnkgUGV0ZXIgRWFzdG1hbiAocGVhc3RtYW5AZHJpenpsZS5zdGFuZm9yZC5lZHUpLlxuQmV0dGVyIHJhbmsgb3JkZXJpbmcgbWV0aG9kIGJ5IFN0ZWZhbiBHdXN0YXZzb24gaW4gMjAxMi5cblxuXG4gQ29weXJpZ2h0IChjKSAyMDE4IEpvbmFzIFdhZ25lclxuXG4gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gU09GVFdBUkUuXG4gKi9cbihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBGMiA9IDAuNSAqIChNYXRoLnNxcnQoMy4wKSAtIDEuMCk7XG4gIHZhciBHMiA9ICgzLjAgLSBNYXRoLnNxcnQoMy4wKSkgLyA2LjA7XG4gIHZhciBGMyA9IDEuMCAvIDMuMDtcbiAgdmFyIEczID0gMS4wIC8gNi4wO1xuICB2YXIgRjQgPSAoTWF0aC5zcXJ0KDUuMCkgLSAxLjApIC8gNC4wO1xuICB2YXIgRzQgPSAoNS4wIC0gTWF0aC5zcXJ0KDUuMCkpIC8gMjAuMDtcblxuICBmdW5jdGlvbiBTaW1wbGV4Tm9pc2UocmFuZG9tT3JTZWVkKSB7XG4gICAgdmFyIHJhbmRvbTtcbiAgICBpZiAodHlwZW9mIHJhbmRvbU9yU2VlZCA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICByYW5kb20gPSByYW5kb21PclNlZWQ7XG4gICAgfVxuICAgIGVsc2UgaWYgKHJhbmRvbU9yU2VlZCkge1xuICAgICAgcmFuZG9tID0gYWxlYShyYW5kb21PclNlZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByYW5kb20gPSBNYXRoLnJhbmRvbTtcbiAgICB9XG4gICAgdGhpcy5wID0gYnVpbGRQZXJtdXRhdGlvblRhYmxlKHJhbmRvbSk7XG4gICAgdGhpcy5wZXJtID0gbmV3IFVpbnQ4QXJyYXkoNTEyKTtcbiAgICB0aGlzLnBlcm1Nb2QxMiA9IG5ldyBVaW50OEFycmF5KDUxMik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA1MTI7IGkrKykge1xuICAgICAgdGhpcy5wZXJtW2ldID0gdGhpcy5wW2kgJiAyNTVdO1xuICAgICAgdGhpcy5wZXJtTW9kMTJbaV0gPSB0aGlzLnBlcm1baV0gJSAxMjtcbiAgICB9XG5cbiAgfVxuICBTaW1wbGV4Tm9pc2UucHJvdG90eXBlID0ge1xuICAgIGdyYWQzOiBuZXcgRmxvYXQzMkFycmF5KFsxLCAxLCAwLFxuICAgICAgLTEsIDEsIDAsXG4gICAgICAxLCAtMSwgMCxcblxuICAgICAgLTEsIC0xLCAwLFxuICAgICAgMSwgMCwgMSxcbiAgICAgIC0xLCAwLCAxLFxuXG4gICAgICAxLCAwLCAtMSxcbiAgICAgIC0xLCAwLCAtMSxcbiAgICAgIDAsIDEsIDEsXG5cbiAgICAgIDAsIC0xLCAxLFxuICAgICAgMCwgMSwgLTEsXG4gICAgICAwLCAtMSwgLTFdKSxcbiAgICBncmFkNDogbmV3IEZsb2F0MzJBcnJheShbMCwgMSwgMSwgMSwgMCwgMSwgMSwgLTEsIDAsIDEsIC0xLCAxLCAwLCAxLCAtMSwgLTEsXG4gICAgICAwLCAtMSwgMSwgMSwgMCwgLTEsIDEsIC0xLCAwLCAtMSwgLTEsIDEsIDAsIC0xLCAtMSwgLTEsXG4gICAgICAxLCAwLCAxLCAxLCAxLCAwLCAxLCAtMSwgMSwgMCwgLTEsIDEsIDEsIDAsIC0xLCAtMSxcbiAgICAgIC0xLCAwLCAxLCAxLCAtMSwgMCwgMSwgLTEsIC0xLCAwLCAtMSwgMSwgLTEsIDAsIC0xLCAtMSxcbiAgICAgIDEsIDEsIDAsIDEsIDEsIDEsIDAsIC0xLCAxLCAtMSwgMCwgMSwgMSwgLTEsIDAsIC0xLFxuICAgICAgLTEsIDEsIDAsIDEsIC0xLCAxLCAwLCAtMSwgLTEsIC0xLCAwLCAxLCAtMSwgLTEsIDAsIC0xLFxuICAgICAgMSwgMSwgMSwgMCwgMSwgMSwgLTEsIDAsIDEsIC0xLCAxLCAwLCAxLCAtMSwgLTEsIDAsXG4gICAgICAtMSwgMSwgMSwgMCwgLTEsIDEsIC0xLCAwLCAtMSwgLTEsIDEsIDAsIC0xLCAtMSwgLTEsIDBdKSxcbiAgICBub2lzZTJEOiBmdW5jdGlvbih4aW4sIHlpbikge1xuICAgICAgdmFyIHBlcm1Nb2QxMiA9IHRoaXMucGVybU1vZDEyO1xuICAgICAgdmFyIHBlcm0gPSB0aGlzLnBlcm07XG4gICAgICB2YXIgZ3JhZDMgPSB0aGlzLmdyYWQzO1xuICAgICAgdmFyIG4wID0gMDsgLy8gTm9pc2UgY29udHJpYnV0aW9ucyBmcm9tIHRoZSB0aHJlZSBjb3JuZXJzXG4gICAgICB2YXIgbjEgPSAwO1xuICAgICAgdmFyIG4yID0gMDtcbiAgICAgIC8vIFNrZXcgdGhlIGlucHV0IHNwYWNlIHRvIGRldGVybWluZSB3aGljaCBzaW1wbGV4IGNlbGwgd2UncmUgaW5cbiAgICAgIHZhciBzID0gKHhpbiArIHlpbikgKiBGMjsgLy8gSGFpcnkgZmFjdG9yIGZvciAyRFxuICAgICAgdmFyIGkgPSBNYXRoLmZsb29yKHhpbiArIHMpO1xuICAgICAgdmFyIGogPSBNYXRoLmZsb29yKHlpbiArIHMpO1xuICAgICAgdmFyIHQgPSAoaSArIGopICogRzI7XG4gICAgICB2YXIgWDAgPSBpIC0gdDsgLy8gVW5za2V3IHRoZSBjZWxsIG9yaWdpbiBiYWNrIHRvICh4LHkpIHNwYWNlXG4gICAgICB2YXIgWTAgPSBqIC0gdDtcbiAgICAgIHZhciB4MCA9IHhpbiAtIFgwOyAvLyBUaGUgeCx5IGRpc3RhbmNlcyBmcm9tIHRoZSBjZWxsIG9yaWdpblxuICAgICAgdmFyIHkwID0geWluIC0gWTA7XG4gICAgICAvLyBGb3IgdGhlIDJEIGNhc2UsIHRoZSBzaW1wbGV4IHNoYXBlIGlzIGFuIGVxdWlsYXRlcmFsIHRyaWFuZ2xlLlxuICAgICAgLy8gRGV0ZXJtaW5lIHdoaWNoIHNpbXBsZXggd2UgYXJlIGluLlxuICAgICAgdmFyIGkxLCBqMTsgLy8gT2Zmc2V0cyBmb3Igc2Vjb25kIChtaWRkbGUpIGNvcm5lciBvZiBzaW1wbGV4IGluIChpLGopIGNvb3Jkc1xuICAgICAgaWYgKHgwID4geTApIHtcbiAgICAgICAgaTEgPSAxO1xuICAgICAgICBqMSA9IDA7XG4gICAgICB9IC8vIGxvd2VyIHRyaWFuZ2xlLCBYWSBvcmRlcjogKDAsMCktPigxLDApLT4oMSwxKVxuICAgICAgZWxzZSB7XG4gICAgICAgIGkxID0gMDtcbiAgICAgICAgajEgPSAxO1xuICAgICAgfSAvLyB1cHBlciB0cmlhbmdsZSwgWVggb3JkZXI6ICgwLDApLT4oMCwxKS0+KDEsMSlcbiAgICAgIC8vIEEgc3RlcCBvZiAoMSwwKSBpbiAoaSxqKSBtZWFucyBhIHN0ZXAgb2YgKDEtYywtYykgaW4gKHgseSksIGFuZFxuICAgICAgLy8gYSBzdGVwIG9mICgwLDEpIGluIChpLGopIG1lYW5zIGEgc3RlcCBvZiAoLWMsMS1jKSBpbiAoeCx5KSwgd2hlcmVcbiAgICAgIC8vIGMgPSAoMy1zcXJ0KDMpKS82XG4gICAgICB2YXIgeDEgPSB4MCAtIGkxICsgRzI7IC8vIE9mZnNldHMgZm9yIG1pZGRsZSBjb3JuZXIgaW4gKHgseSkgdW5za2V3ZWQgY29vcmRzXG4gICAgICB2YXIgeTEgPSB5MCAtIGoxICsgRzI7XG4gICAgICB2YXIgeDIgPSB4MCAtIDEuMCArIDIuMCAqIEcyOyAvLyBPZmZzZXRzIGZvciBsYXN0IGNvcm5lciBpbiAoeCx5KSB1bnNrZXdlZCBjb29yZHNcbiAgICAgIHZhciB5MiA9IHkwIC0gMS4wICsgMi4wICogRzI7XG4gICAgICAvLyBXb3JrIG91dCB0aGUgaGFzaGVkIGdyYWRpZW50IGluZGljZXMgb2YgdGhlIHRocmVlIHNpbXBsZXggY29ybmVyc1xuICAgICAgdmFyIGlpID0gaSAmIDI1NTtcbiAgICAgIHZhciBqaiA9IGogJiAyNTU7XG4gICAgICAvLyBDYWxjdWxhdGUgdGhlIGNvbnRyaWJ1dGlvbiBmcm9tIHRoZSB0aHJlZSBjb3JuZXJzXG4gICAgICB2YXIgdDAgPSAwLjUgLSB4MCAqIHgwIC0geTAgKiB5MDtcbiAgICAgIGlmICh0MCA+PSAwKSB7XG4gICAgICAgIHZhciBnaTAgPSBwZXJtTW9kMTJbaWkgKyBwZXJtW2pqXV0gKiAzO1xuICAgICAgICB0MCAqPSB0MDtcbiAgICAgICAgbjAgPSB0MCAqIHQwICogKGdyYWQzW2dpMF0gKiB4MCArIGdyYWQzW2dpMCArIDFdICogeTApOyAvLyAoeCx5KSBvZiBncmFkMyB1c2VkIGZvciAyRCBncmFkaWVudFxuICAgICAgfVxuICAgICAgdmFyIHQxID0gMC41IC0geDEgKiB4MSAtIHkxICogeTE7XG4gICAgICBpZiAodDEgPj0gMCkge1xuICAgICAgICB2YXIgZ2kxID0gcGVybU1vZDEyW2lpICsgaTEgKyBwZXJtW2pqICsgajFdXSAqIDM7XG4gICAgICAgIHQxICo9IHQxO1xuICAgICAgICBuMSA9IHQxICogdDEgKiAoZ3JhZDNbZ2kxXSAqIHgxICsgZ3JhZDNbZ2kxICsgMV0gKiB5MSk7XG4gICAgICB9XG4gICAgICB2YXIgdDIgPSAwLjUgLSB4MiAqIHgyIC0geTIgKiB5MjtcbiAgICAgIGlmICh0MiA+PSAwKSB7XG4gICAgICAgIHZhciBnaTIgPSBwZXJtTW9kMTJbaWkgKyAxICsgcGVybVtqaiArIDFdXSAqIDM7XG4gICAgICAgIHQyICo9IHQyO1xuICAgICAgICBuMiA9IHQyICogdDIgKiAoZ3JhZDNbZ2kyXSAqIHgyICsgZ3JhZDNbZ2kyICsgMV0gKiB5Mik7XG4gICAgICB9XG4gICAgICAvLyBBZGQgY29udHJpYnV0aW9ucyBmcm9tIGVhY2ggY29ybmVyIHRvIGdldCB0aGUgZmluYWwgbm9pc2UgdmFsdWUuXG4gICAgICAvLyBUaGUgcmVzdWx0IGlzIHNjYWxlZCB0byByZXR1cm4gdmFsdWVzIGluIHRoZSBpbnRlcnZhbCBbLTEsMV0uXG4gICAgICByZXR1cm4gNzAuMCAqIChuMCArIG4xICsgbjIpO1xuICAgIH0sXG4gICAgLy8gM0Qgc2ltcGxleCBub2lzZVxuICAgIG5vaXNlM0Q6IGZ1bmN0aW9uKHhpbiwgeWluLCB6aW4pIHtcbiAgICAgIHZhciBwZXJtTW9kMTIgPSB0aGlzLnBlcm1Nb2QxMjtcbiAgICAgIHZhciBwZXJtID0gdGhpcy5wZXJtO1xuICAgICAgdmFyIGdyYWQzID0gdGhpcy5ncmFkMztcbiAgICAgIHZhciBuMCwgbjEsIG4yLCBuMzsgLy8gTm9pc2UgY29udHJpYnV0aW9ucyBmcm9tIHRoZSBmb3VyIGNvcm5lcnNcbiAgICAgIC8vIFNrZXcgdGhlIGlucHV0IHNwYWNlIHRvIGRldGVybWluZSB3aGljaCBzaW1wbGV4IGNlbGwgd2UncmUgaW5cbiAgICAgIHZhciBzID0gKHhpbiArIHlpbiArIHppbikgKiBGMzsgLy8gVmVyeSBuaWNlIGFuZCBzaW1wbGUgc2tldyBmYWN0b3IgZm9yIDNEXG4gICAgICB2YXIgaSA9IE1hdGguZmxvb3IoeGluICsgcyk7XG4gICAgICB2YXIgaiA9IE1hdGguZmxvb3IoeWluICsgcyk7XG4gICAgICB2YXIgayA9IE1hdGguZmxvb3IoemluICsgcyk7XG4gICAgICB2YXIgdCA9IChpICsgaiArIGspICogRzM7XG4gICAgICB2YXIgWDAgPSBpIC0gdDsgLy8gVW5za2V3IHRoZSBjZWxsIG9yaWdpbiBiYWNrIHRvICh4LHkseikgc3BhY2VcbiAgICAgIHZhciBZMCA9IGogLSB0O1xuICAgICAgdmFyIFowID0gayAtIHQ7XG4gICAgICB2YXIgeDAgPSB4aW4gLSBYMDsgLy8gVGhlIHgseSx6IGRpc3RhbmNlcyBmcm9tIHRoZSBjZWxsIG9yaWdpblxuICAgICAgdmFyIHkwID0geWluIC0gWTA7XG4gICAgICB2YXIgejAgPSB6aW4gLSBaMDtcbiAgICAgIC8vIEZvciB0aGUgM0QgY2FzZSwgdGhlIHNpbXBsZXggc2hhcGUgaXMgYSBzbGlnaHRseSBpcnJlZ3VsYXIgdGV0cmFoZWRyb24uXG4gICAgICAvLyBEZXRlcm1pbmUgd2hpY2ggc2ltcGxleCB3ZSBhcmUgaW4uXG4gICAgICB2YXIgaTEsIGoxLCBrMTsgLy8gT2Zmc2V0cyBmb3Igc2Vjb25kIGNvcm5lciBvZiBzaW1wbGV4IGluIChpLGosaykgY29vcmRzXG4gICAgICB2YXIgaTIsIGoyLCBrMjsgLy8gT2Zmc2V0cyBmb3IgdGhpcmQgY29ybmVyIG9mIHNpbXBsZXggaW4gKGksaixrKSBjb29yZHNcbiAgICAgIGlmICh4MCA+PSB5MCkge1xuICAgICAgICBpZiAoeTAgPj0gejApIHtcbiAgICAgICAgICBpMSA9IDE7XG4gICAgICAgICAgajEgPSAwO1xuICAgICAgICAgIGsxID0gMDtcbiAgICAgICAgICBpMiA9IDE7XG4gICAgICAgICAgajIgPSAxO1xuICAgICAgICAgIGsyID0gMDtcbiAgICAgICAgfSAvLyBYIFkgWiBvcmRlclxuICAgICAgICBlbHNlIGlmICh4MCA+PSB6MCkge1xuICAgICAgICAgIGkxID0gMTtcbiAgICAgICAgICBqMSA9IDA7XG4gICAgICAgICAgazEgPSAwO1xuICAgICAgICAgIGkyID0gMTtcbiAgICAgICAgICBqMiA9IDA7XG4gICAgICAgICAgazIgPSAxO1xuICAgICAgICB9IC8vIFggWiBZIG9yZGVyXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGkxID0gMDtcbiAgICAgICAgICBqMSA9IDA7XG4gICAgICAgICAgazEgPSAxO1xuICAgICAgICAgIGkyID0gMTtcbiAgICAgICAgICBqMiA9IDA7XG4gICAgICAgICAgazIgPSAxO1xuICAgICAgICB9IC8vIFogWCBZIG9yZGVyXG4gICAgICB9XG4gICAgICBlbHNlIHsgLy8geDA8eTBcbiAgICAgICAgaWYgKHkwIDwgejApIHtcbiAgICAgICAgICBpMSA9IDA7XG4gICAgICAgICAgajEgPSAwO1xuICAgICAgICAgIGsxID0gMTtcbiAgICAgICAgICBpMiA9IDA7XG4gICAgICAgICAgajIgPSAxO1xuICAgICAgICAgIGsyID0gMTtcbiAgICAgICAgfSAvLyBaIFkgWCBvcmRlclxuICAgICAgICBlbHNlIGlmICh4MCA8IHowKSB7XG4gICAgICAgICAgaTEgPSAwO1xuICAgICAgICAgIGoxID0gMTtcbiAgICAgICAgICBrMSA9IDA7XG4gICAgICAgICAgaTIgPSAwO1xuICAgICAgICAgIGoyID0gMTtcbiAgICAgICAgICBrMiA9IDE7XG4gICAgICAgIH0gLy8gWSBaIFggb3JkZXJcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaTEgPSAwO1xuICAgICAgICAgIGoxID0gMTtcbiAgICAgICAgICBrMSA9IDA7XG4gICAgICAgICAgaTIgPSAxO1xuICAgICAgICAgIGoyID0gMTtcbiAgICAgICAgICBrMiA9IDA7XG4gICAgICAgIH0gLy8gWSBYIFogb3JkZXJcbiAgICAgIH1cbiAgICAgIC8vIEEgc3RlcCBvZiAoMSwwLDApIGluIChpLGosaykgbWVhbnMgYSBzdGVwIG9mICgxLWMsLWMsLWMpIGluICh4LHkseiksXG4gICAgICAvLyBhIHN0ZXAgb2YgKDAsMSwwKSBpbiAoaSxqLGspIG1lYW5zIGEgc3RlcCBvZiAoLWMsMS1jLC1jKSBpbiAoeCx5LHopLCBhbmRcbiAgICAgIC8vIGEgc3RlcCBvZiAoMCwwLDEpIGluIChpLGosaykgbWVhbnMgYSBzdGVwIG9mICgtYywtYywxLWMpIGluICh4LHkseiksIHdoZXJlXG4gICAgICAvLyBjID0gMS82LlxuICAgICAgdmFyIHgxID0geDAgLSBpMSArIEczOyAvLyBPZmZzZXRzIGZvciBzZWNvbmQgY29ybmVyIGluICh4LHkseikgY29vcmRzXG4gICAgICB2YXIgeTEgPSB5MCAtIGoxICsgRzM7XG4gICAgICB2YXIgejEgPSB6MCAtIGsxICsgRzM7XG4gICAgICB2YXIgeDIgPSB4MCAtIGkyICsgMi4wICogRzM7IC8vIE9mZnNldHMgZm9yIHRoaXJkIGNvcm5lciBpbiAoeCx5LHopIGNvb3Jkc1xuICAgICAgdmFyIHkyID0geTAgLSBqMiArIDIuMCAqIEczO1xuICAgICAgdmFyIHoyID0gejAgLSBrMiArIDIuMCAqIEczO1xuICAgICAgdmFyIHgzID0geDAgLSAxLjAgKyAzLjAgKiBHMzsgLy8gT2Zmc2V0cyBmb3IgbGFzdCBjb3JuZXIgaW4gKHgseSx6KSBjb29yZHNcbiAgICAgIHZhciB5MyA9IHkwIC0gMS4wICsgMy4wICogRzM7XG4gICAgICB2YXIgejMgPSB6MCAtIDEuMCArIDMuMCAqIEczO1xuICAgICAgLy8gV29yayBvdXQgdGhlIGhhc2hlZCBncmFkaWVudCBpbmRpY2VzIG9mIHRoZSBmb3VyIHNpbXBsZXggY29ybmVyc1xuICAgICAgdmFyIGlpID0gaSAmIDI1NTtcbiAgICAgIHZhciBqaiA9IGogJiAyNTU7XG4gICAgICB2YXIga2sgPSBrICYgMjU1O1xuICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBjb250cmlidXRpb24gZnJvbSB0aGUgZm91ciBjb3JuZXJzXG4gICAgICB2YXIgdDAgPSAwLjYgLSB4MCAqIHgwIC0geTAgKiB5MCAtIHowICogejA7XG4gICAgICBpZiAodDAgPCAwKSBuMCA9IDAuMDtcbiAgICAgIGVsc2Uge1xuICAgICAgICB2YXIgZ2kwID0gcGVybU1vZDEyW2lpICsgcGVybVtqaiArIHBlcm1ba2tdXV0gKiAzO1xuICAgICAgICB0MCAqPSB0MDtcbiAgICAgICAgbjAgPSB0MCAqIHQwICogKGdyYWQzW2dpMF0gKiB4MCArIGdyYWQzW2dpMCArIDFdICogeTAgKyBncmFkM1tnaTAgKyAyXSAqIHowKTtcbiAgICAgIH1cbiAgICAgIHZhciB0MSA9IDAuNiAtIHgxICogeDEgLSB5MSAqIHkxIC0gejEgKiB6MTtcbiAgICAgIGlmICh0MSA8IDApIG4xID0gMC4wO1xuICAgICAgZWxzZSB7XG4gICAgICAgIHZhciBnaTEgPSBwZXJtTW9kMTJbaWkgKyBpMSArIHBlcm1bamogKyBqMSArIHBlcm1ba2sgKyBrMV1dXSAqIDM7XG4gICAgICAgIHQxICo9IHQxO1xuICAgICAgICBuMSA9IHQxICogdDEgKiAoZ3JhZDNbZ2kxXSAqIHgxICsgZ3JhZDNbZ2kxICsgMV0gKiB5MSArIGdyYWQzW2dpMSArIDJdICogejEpO1xuICAgICAgfVxuICAgICAgdmFyIHQyID0gMC42IC0geDIgKiB4MiAtIHkyICogeTIgLSB6MiAqIHoyO1xuICAgICAgaWYgKHQyIDwgMCkgbjIgPSAwLjA7XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFyIGdpMiA9IHBlcm1Nb2QxMltpaSArIGkyICsgcGVybVtqaiArIGoyICsgcGVybVtrayArIGsyXV1dICogMztcbiAgICAgICAgdDIgKj0gdDI7XG4gICAgICAgIG4yID0gdDIgKiB0MiAqIChncmFkM1tnaTJdICogeDIgKyBncmFkM1tnaTIgKyAxXSAqIHkyICsgZ3JhZDNbZ2kyICsgMl0gKiB6Mik7XG4gICAgICB9XG4gICAgICB2YXIgdDMgPSAwLjYgLSB4MyAqIHgzIC0geTMgKiB5MyAtIHozICogejM7XG4gICAgICBpZiAodDMgPCAwKSBuMyA9IDAuMDtcbiAgICAgIGVsc2Uge1xuICAgICAgICB2YXIgZ2kzID0gcGVybU1vZDEyW2lpICsgMSArIHBlcm1bamogKyAxICsgcGVybVtrayArIDFdXV0gKiAzO1xuICAgICAgICB0MyAqPSB0MztcbiAgICAgICAgbjMgPSB0MyAqIHQzICogKGdyYWQzW2dpM10gKiB4MyArIGdyYWQzW2dpMyArIDFdICogeTMgKyBncmFkM1tnaTMgKyAyXSAqIHozKTtcbiAgICAgIH1cbiAgICAgIC8vIEFkZCBjb250cmlidXRpb25zIGZyb20gZWFjaCBjb3JuZXIgdG8gZ2V0IHRoZSBmaW5hbCBub2lzZSB2YWx1ZS5cbiAgICAgIC8vIFRoZSByZXN1bHQgaXMgc2NhbGVkIHRvIHN0YXkganVzdCBpbnNpZGUgWy0xLDFdXG4gICAgICByZXR1cm4gMzIuMCAqIChuMCArIG4xICsgbjIgKyBuMyk7XG4gICAgfSxcbiAgICAvLyA0RCBzaW1wbGV4IG5vaXNlLCBiZXR0ZXIgc2ltcGxleCByYW5rIG9yZGVyaW5nIG1ldGhvZCAyMDEyLTAzLTA5XG4gICAgbm9pc2U0RDogZnVuY3Rpb24oeCwgeSwgeiwgdykge1xuICAgICAgdmFyIHBlcm0gPSB0aGlzLnBlcm07XG4gICAgICB2YXIgZ3JhZDQgPSB0aGlzLmdyYWQ0O1xuXG4gICAgICB2YXIgbjAsIG4xLCBuMiwgbjMsIG40OyAvLyBOb2lzZSBjb250cmlidXRpb25zIGZyb20gdGhlIGZpdmUgY29ybmVyc1xuICAgICAgLy8gU2tldyB0aGUgKHgseSx6LHcpIHNwYWNlIHRvIGRldGVybWluZSB3aGljaCBjZWxsIG9mIDI0IHNpbXBsaWNlcyB3ZSdyZSBpblxuICAgICAgdmFyIHMgPSAoeCArIHkgKyB6ICsgdykgKiBGNDsgLy8gRmFjdG9yIGZvciA0RCBza2V3aW5nXG4gICAgICB2YXIgaSA9IE1hdGguZmxvb3IoeCArIHMpO1xuICAgICAgdmFyIGogPSBNYXRoLmZsb29yKHkgKyBzKTtcbiAgICAgIHZhciBrID0gTWF0aC5mbG9vcih6ICsgcyk7XG4gICAgICB2YXIgbCA9IE1hdGguZmxvb3IodyArIHMpO1xuICAgICAgdmFyIHQgPSAoaSArIGogKyBrICsgbCkgKiBHNDsgLy8gRmFjdG9yIGZvciA0RCB1bnNrZXdpbmdcbiAgICAgIHZhciBYMCA9IGkgLSB0OyAvLyBVbnNrZXcgdGhlIGNlbGwgb3JpZ2luIGJhY2sgdG8gKHgseSx6LHcpIHNwYWNlXG4gICAgICB2YXIgWTAgPSBqIC0gdDtcbiAgICAgIHZhciBaMCA9IGsgLSB0O1xuICAgICAgdmFyIFcwID0gbCAtIHQ7XG4gICAgICB2YXIgeDAgPSB4IC0gWDA7IC8vIFRoZSB4LHkseix3IGRpc3RhbmNlcyBmcm9tIHRoZSBjZWxsIG9yaWdpblxuICAgICAgdmFyIHkwID0geSAtIFkwO1xuICAgICAgdmFyIHowID0geiAtIFowO1xuICAgICAgdmFyIHcwID0gdyAtIFcwO1xuICAgICAgLy8gRm9yIHRoZSA0RCBjYXNlLCB0aGUgc2ltcGxleCBpcyBhIDREIHNoYXBlIEkgd29uJ3QgZXZlbiB0cnkgdG8gZGVzY3JpYmUuXG4gICAgICAvLyBUbyBmaW5kIG91dCB3aGljaCBvZiB0aGUgMjQgcG9zc2libGUgc2ltcGxpY2VzIHdlJ3JlIGluLCB3ZSBuZWVkIHRvXG4gICAgICAvLyBkZXRlcm1pbmUgdGhlIG1hZ25pdHVkZSBvcmRlcmluZyBvZiB4MCwgeTAsIHowIGFuZCB3MC5cbiAgICAgIC8vIFNpeCBwYWlyLXdpc2UgY29tcGFyaXNvbnMgYXJlIHBlcmZvcm1lZCBiZXR3ZWVuIGVhY2ggcG9zc2libGUgcGFpclxuICAgICAgLy8gb2YgdGhlIGZvdXIgY29vcmRpbmF0ZXMsIGFuZCB0aGUgcmVzdWx0cyBhcmUgdXNlZCB0byByYW5rIHRoZSBudW1iZXJzLlxuICAgICAgdmFyIHJhbmt4ID0gMDtcbiAgICAgIHZhciByYW5reSA9IDA7XG4gICAgICB2YXIgcmFua3ogPSAwO1xuICAgICAgdmFyIHJhbmt3ID0gMDtcbiAgICAgIGlmICh4MCA+IHkwKSByYW5reCsrO1xuICAgICAgZWxzZSByYW5reSsrO1xuICAgICAgaWYgKHgwID4gejApIHJhbmt4Kys7XG4gICAgICBlbHNlIHJhbmt6Kys7XG4gICAgICBpZiAoeDAgPiB3MCkgcmFua3grKztcbiAgICAgIGVsc2UgcmFua3crKztcbiAgICAgIGlmICh5MCA+IHowKSByYW5reSsrO1xuICAgICAgZWxzZSByYW5reisrO1xuICAgICAgaWYgKHkwID4gdzApIHJhbmt5Kys7XG4gICAgICBlbHNlIHJhbmt3Kys7XG4gICAgICBpZiAoejAgPiB3MCkgcmFua3orKztcbiAgICAgIGVsc2UgcmFua3crKztcbiAgICAgIHZhciBpMSwgajEsIGsxLCBsMTsgLy8gVGhlIGludGVnZXIgb2Zmc2V0cyBmb3IgdGhlIHNlY29uZCBzaW1wbGV4IGNvcm5lclxuICAgICAgdmFyIGkyLCBqMiwgazIsIGwyOyAvLyBUaGUgaW50ZWdlciBvZmZzZXRzIGZvciB0aGUgdGhpcmQgc2ltcGxleCBjb3JuZXJcbiAgICAgIHZhciBpMywgajMsIGszLCBsMzsgLy8gVGhlIGludGVnZXIgb2Zmc2V0cyBmb3IgdGhlIGZvdXJ0aCBzaW1wbGV4IGNvcm5lclxuICAgICAgLy8gc2ltcGxleFtjXSBpcyBhIDQtdmVjdG9yIHdpdGggdGhlIG51bWJlcnMgMCwgMSwgMiBhbmQgMyBpbiBzb21lIG9yZGVyLlxuICAgICAgLy8gTWFueSB2YWx1ZXMgb2YgYyB3aWxsIG5ldmVyIG9jY3VyLCBzaW5jZSBlLmcuIHg+eT56PncgbWFrZXMgeDx6LCB5PHcgYW5kIHg8d1xuICAgICAgLy8gaW1wb3NzaWJsZS4gT25seSB0aGUgMjQgaW5kaWNlcyB3aGljaCBoYXZlIG5vbi16ZXJvIGVudHJpZXMgbWFrZSBhbnkgc2Vuc2UuXG4gICAgICAvLyBXZSB1c2UgYSB0aHJlc2hvbGRpbmcgdG8gc2V0IHRoZSBjb29yZGluYXRlcyBpbiB0dXJuIGZyb20gdGhlIGxhcmdlc3QgbWFnbml0dWRlLlxuICAgICAgLy8gUmFuayAzIGRlbm90ZXMgdGhlIGxhcmdlc3QgY29vcmRpbmF0ZS5cbiAgICAgIGkxID0gcmFua3ggPj0gMyA/IDEgOiAwO1xuICAgICAgajEgPSByYW5reSA+PSAzID8gMSA6IDA7XG4gICAgICBrMSA9IHJhbmt6ID49IDMgPyAxIDogMDtcbiAgICAgIGwxID0gcmFua3cgPj0gMyA/IDEgOiAwO1xuICAgICAgLy8gUmFuayAyIGRlbm90ZXMgdGhlIHNlY29uZCBsYXJnZXN0IGNvb3JkaW5hdGUuXG4gICAgICBpMiA9IHJhbmt4ID49IDIgPyAxIDogMDtcbiAgICAgIGoyID0gcmFua3kgPj0gMiA/IDEgOiAwO1xuICAgICAgazIgPSByYW5reiA+PSAyID8gMSA6IDA7XG4gICAgICBsMiA9IHJhbmt3ID49IDIgPyAxIDogMDtcbiAgICAgIC8vIFJhbmsgMSBkZW5vdGVzIHRoZSBzZWNvbmQgc21hbGxlc3QgY29vcmRpbmF0ZS5cbiAgICAgIGkzID0gcmFua3ggPj0gMSA/IDEgOiAwO1xuICAgICAgajMgPSByYW5reSA+PSAxID8gMSA6IDA7XG4gICAgICBrMyA9IHJhbmt6ID49IDEgPyAxIDogMDtcbiAgICAgIGwzID0gcmFua3cgPj0gMSA/IDEgOiAwO1xuICAgICAgLy8gVGhlIGZpZnRoIGNvcm5lciBoYXMgYWxsIGNvb3JkaW5hdGUgb2Zmc2V0cyA9IDEsIHNvIG5vIG5lZWQgdG8gY29tcHV0ZSB0aGF0LlxuICAgICAgdmFyIHgxID0geDAgLSBpMSArIEc0OyAvLyBPZmZzZXRzIGZvciBzZWNvbmQgY29ybmVyIGluICh4LHkseix3KSBjb29yZHNcbiAgICAgIHZhciB5MSA9IHkwIC0gajEgKyBHNDtcbiAgICAgIHZhciB6MSA9IHowIC0gazEgKyBHNDtcbiAgICAgIHZhciB3MSA9IHcwIC0gbDEgKyBHNDtcbiAgICAgIHZhciB4MiA9IHgwIC0gaTIgKyAyLjAgKiBHNDsgLy8gT2Zmc2V0cyBmb3IgdGhpcmQgY29ybmVyIGluICh4LHkseix3KSBjb29yZHNcbiAgICAgIHZhciB5MiA9IHkwIC0gajIgKyAyLjAgKiBHNDtcbiAgICAgIHZhciB6MiA9IHowIC0gazIgKyAyLjAgKiBHNDtcbiAgICAgIHZhciB3MiA9IHcwIC0gbDIgKyAyLjAgKiBHNDtcbiAgICAgIHZhciB4MyA9IHgwIC0gaTMgKyAzLjAgKiBHNDsgLy8gT2Zmc2V0cyBmb3IgZm91cnRoIGNvcm5lciBpbiAoeCx5LHosdykgY29vcmRzXG4gICAgICB2YXIgeTMgPSB5MCAtIGozICsgMy4wICogRzQ7XG4gICAgICB2YXIgejMgPSB6MCAtIGszICsgMy4wICogRzQ7XG4gICAgICB2YXIgdzMgPSB3MCAtIGwzICsgMy4wICogRzQ7XG4gICAgICB2YXIgeDQgPSB4MCAtIDEuMCArIDQuMCAqIEc0OyAvLyBPZmZzZXRzIGZvciBsYXN0IGNvcm5lciBpbiAoeCx5LHosdykgY29vcmRzXG4gICAgICB2YXIgeTQgPSB5MCAtIDEuMCArIDQuMCAqIEc0O1xuICAgICAgdmFyIHo0ID0gejAgLSAxLjAgKyA0LjAgKiBHNDtcbiAgICAgIHZhciB3NCA9IHcwIC0gMS4wICsgNC4wICogRzQ7XG4gICAgICAvLyBXb3JrIG91dCB0aGUgaGFzaGVkIGdyYWRpZW50IGluZGljZXMgb2YgdGhlIGZpdmUgc2ltcGxleCBjb3JuZXJzXG4gICAgICB2YXIgaWkgPSBpICYgMjU1O1xuICAgICAgdmFyIGpqID0gaiAmIDI1NTtcbiAgICAgIHZhciBrayA9IGsgJiAyNTU7XG4gICAgICB2YXIgbGwgPSBsICYgMjU1O1xuICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBjb250cmlidXRpb24gZnJvbSB0aGUgZml2ZSBjb3JuZXJzXG4gICAgICB2YXIgdDAgPSAwLjYgLSB4MCAqIHgwIC0geTAgKiB5MCAtIHowICogejAgLSB3MCAqIHcwO1xuICAgICAgaWYgKHQwIDwgMCkgbjAgPSAwLjA7XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFyIGdpMCA9IChwZXJtW2lpICsgcGVybVtqaiArIHBlcm1ba2sgKyBwZXJtW2xsXV1dXSAlIDMyKSAqIDQ7XG4gICAgICAgIHQwICo9IHQwO1xuICAgICAgICBuMCA9IHQwICogdDAgKiAoZ3JhZDRbZ2kwXSAqIHgwICsgZ3JhZDRbZ2kwICsgMV0gKiB5MCArIGdyYWQ0W2dpMCArIDJdICogejAgKyBncmFkNFtnaTAgKyAzXSAqIHcwKTtcbiAgICAgIH1cbiAgICAgIHZhciB0MSA9IDAuNiAtIHgxICogeDEgLSB5MSAqIHkxIC0gejEgKiB6MSAtIHcxICogdzE7XG4gICAgICBpZiAodDEgPCAwKSBuMSA9IDAuMDtcbiAgICAgIGVsc2Uge1xuICAgICAgICB2YXIgZ2kxID0gKHBlcm1baWkgKyBpMSArIHBlcm1bamogKyBqMSArIHBlcm1ba2sgKyBrMSArIHBlcm1bbGwgKyBsMV1dXV0gJSAzMikgKiA0O1xuICAgICAgICB0MSAqPSB0MTtcbiAgICAgICAgbjEgPSB0MSAqIHQxICogKGdyYWQ0W2dpMV0gKiB4MSArIGdyYWQ0W2dpMSArIDFdICogeTEgKyBncmFkNFtnaTEgKyAyXSAqIHoxICsgZ3JhZDRbZ2kxICsgM10gKiB3MSk7XG4gICAgICB9XG4gICAgICB2YXIgdDIgPSAwLjYgLSB4MiAqIHgyIC0geTIgKiB5MiAtIHoyICogejIgLSB3MiAqIHcyO1xuICAgICAgaWYgKHQyIDwgMCkgbjIgPSAwLjA7XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFyIGdpMiA9IChwZXJtW2lpICsgaTIgKyBwZXJtW2pqICsgajIgKyBwZXJtW2trICsgazIgKyBwZXJtW2xsICsgbDJdXV1dICUgMzIpICogNDtcbiAgICAgICAgdDIgKj0gdDI7XG4gICAgICAgIG4yID0gdDIgKiB0MiAqIChncmFkNFtnaTJdICogeDIgKyBncmFkNFtnaTIgKyAxXSAqIHkyICsgZ3JhZDRbZ2kyICsgMl0gKiB6MiArIGdyYWQ0W2dpMiArIDNdICogdzIpO1xuICAgICAgfVxuICAgICAgdmFyIHQzID0gMC42IC0geDMgKiB4MyAtIHkzICogeTMgLSB6MyAqIHozIC0gdzMgKiB3MztcbiAgICAgIGlmICh0MyA8IDApIG4zID0gMC4wO1xuICAgICAgZWxzZSB7XG4gICAgICAgIHZhciBnaTMgPSAocGVybVtpaSArIGkzICsgcGVybVtqaiArIGozICsgcGVybVtrayArIGszICsgcGVybVtsbCArIGwzXV1dXSAlIDMyKSAqIDQ7XG4gICAgICAgIHQzICo9IHQzO1xuICAgICAgICBuMyA9IHQzICogdDMgKiAoZ3JhZDRbZ2kzXSAqIHgzICsgZ3JhZDRbZ2kzICsgMV0gKiB5MyArIGdyYWQ0W2dpMyArIDJdICogejMgKyBncmFkNFtnaTMgKyAzXSAqIHczKTtcbiAgICAgIH1cbiAgICAgIHZhciB0NCA9IDAuNiAtIHg0ICogeDQgLSB5NCAqIHk0IC0gejQgKiB6NCAtIHc0ICogdzQ7XG4gICAgICBpZiAodDQgPCAwKSBuNCA9IDAuMDtcbiAgICAgIGVsc2Uge1xuICAgICAgICB2YXIgZ2k0ID0gKHBlcm1baWkgKyAxICsgcGVybVtqaiArIDEgKyBwZXJtW2trICsgMSArIHBlcm1bbGwgKyAxXV1dXSAlIDMyKSAqIDQ7XG4gICAgICAgIHQ0ICo9IHQ0O1xuICAgICAgICBuNCA9IHQ0ICogdDQgKiAoZ3JhZDRbZ2k0XSAqIHg0ICsgZ3JhZDRbZ2k0ICsgMV0gKiB5NCArIGdyYWQ0W2dpNCArIDJdICogejQgKyBncmFkNFtnaTQgKyAzXSAqIHc0KTtcbiAgICAgIH1cbiAgICAgIC8vIFN1bSB1cCBhbmQgc2NhbGUgdGhlIHJlc3VsdCB0byBjb3ZlciB0aGUgcmFuZ2UgWy0xLDFdXG4gICAgICByZXR1cm4gMjcuMCAqIChuMCArIG4xICsgbjIgKyBuMyArIG40KTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gYnVpbGRQZXJtdXRhdGlvblRhYmxlKHJhbmRvbSkge1xuICAgIHZhciBpO1xuICAgIHZhciBwID0gbmV3IFVpbnQ4QXJyYXkoMjU2KTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgMjU2OyBpKyspIHtcbiAgICAgIHBbaV0gPSBpO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgMjU1OyBpKyspIHtcbiAgICAgIHZhciByID0gaSArIH5+KHJhbmRvbSgpICogKDI1NiAtIGkpKTtcbiAgICAgIHZhciBhdXggPSBwW2ldO1xuICAgICAgcFtpXSA9IHBbcl07XG4gICAgICBwW3JdID0gYXV4O1xuICAgIH1cbiAgICByZXR1cm4gcDtcbiAgfVxuICBTaW1wbGV4Tm9pc2UuX2J1aWxkUGVybXV0YXRpb25UYWJsZSA9IGJ1aWxkUGVybXV0YXRpb25UYWJsZTtcblxuICBmdW5jdGlvbiBhbGVhKCkge1xuICAgIC8vIEpvaGFubmVzIEJhYWfDuGUgPGJhYWdvZUBiYWFnb2UuY29tPiwgMjAxMFxuICAgIHZhciBzMCA9IDA7XG4gICAgdmFyIHMxID0gMDtcbiAgICB2YXIgczIgPSAwO1xuICAgIHZhciBjID0gMTtcblxuICAgIHZhciBtYXNoID0gbWFzaGVyKCk7XG4gICAgczAgPSBtYXNoKCcgJyk7XG4gICAgczEgPSBtYXNoKCcgJyk7XG4gICAgczIgPSBtYXNoKCcgJyk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgczAgLT0gbWFzaChhcmd1bWVudHNbaV0pO1xuICAgICAgaWYgKHMwIDwgMCkge1xuICAgICAgICBzMCArPSAxO1xuICAgICAgfVxuICAgICAgczEgLT0gbWFzaChhcmd1bWVudHNbaV0pO1xuICAgICAgaWYgKHMxIDwgMCkge1xuICAgICAgICBzMSArPSAxO1xuICAgICAgfVxuICAgICAgczIgLT0gbWFzaChhcmd1bWVudHNbaV0pO1xuICAgICAgaWYgKHMyIDwgMCkge1xuICAgICAgICBzMiArPSAxO1xuICAgICAgfVxuICAgIH1cbiAgICBtYXNoID0gbnVsbDtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdCA9IDIwOTE2MzkgKiBzMCArIGMgKiAyLjMyODMwNjQzNjUzODY5NjNlLTEwOyAvLyAyXi0zMlxuICAgICAgczAgPSBzMTtcbiAgICAgIHMxID0gczI7XG4gICAgICByZXR1cm4gczIgPSB0IC0gKGMgPSB0IHwgMCk7XG4gICAgfTtcbiAgfVxuICBmdW5jdGlvbiBtYXNoZXIoKSB7XG4gICAgdmFyIG4gPSAweGVmYzgyNDlkO1xuICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBkYXRhID0gZGF0YS50b1N0cmluZygpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG4gKz0gZGF0YS5jaGFyQ29kZUF0KGkpO1xuICAgICAgICB2YXIgaCA9IDAuMDI1MTk2MDMyODI0MTY5MzggKiBuO1xuICAgICAgICBuID0gaCA+Pj4gMDtcbiAgICAgICAgaCAtPSBuO1xuICAgICAgICBoICo9IG47XG4gICAgICAgIG4gPSBoID4+PiAwO1xuICAgICAgICBoIC09IG47XG4gICAgICAgIG4gKz0gaCAqIDB4MTAwMDAwMDAwOyAvLyAyXjMyXG4gICAgICB9XG4gICAgICByZXR1cm4gKG4gPj4+IDApICogMi4zMjgzMDY0MzY1Mzg2OTYzZS0xMDsgLy8gMl4tMzJcbiAgICB9O1xuICB9XG5cbiAgLy8gYW1kXG4gIGlmICh0eXBlb2YgZGVmaW5lICE9PSAndW5kZWZpbmVkJyAmJiBkZWZpbmUuYW1kKSBkZWZpbmUoZnVuY3Rpb24oKSB7cmV0dXJuIFNpbXBsZXhOb2lzZTt9KTtcbiAgLy8gY29tbW9uIGpzXG4gIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIGV4cG9ydHMuU2ltcGxleE5vaXNlID0gU2ltcGxleE5vaXNlO1xuICAvLyBicm93c2VyXG4gIGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB3aW5kb3cuU2ltcGxleE5vaXNlID0gU2ltcGxleE5vaXNlO1xuICAvLyBub2RlanNcbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTaW1wbGV4Tm9pc2U7XG4gIH1cblxufSkoKTtcbiIsImNvbnN0IGNhbnZhc1NrZXRjaCA9IHJlcXVpcmUoXCJjYW52YXMtc2tldGNoXCIpO1xuY29uc3QgcmFuZG9tID0gcmVxdWlyZShcImNhbnZhcy1za2V0Y2gtdXRpbC9yYW5kb21cIik7XG5cbmNvbnN0IHNldHRpbmdzID0ge1xuICBkaW1lbnNpb25zOiBbMjA0OCwgMTMwMF1cbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZUJhY2tncm91bmRTdGFycyh3aWR0aCwgaGVpZ2h0KSB7XG4gIGNvbnN0IHN0YXJzID0gW107XG4gIGNvbnN0IGNvdW50ID0gcmFuZG9tLnJhbmdlRmxvb3IoMjAwLCA0MDApO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgIHN0YXJzLnB1c2goe1xuICAgICAgeDogcmFuZG9tLnJhbmdlKDAsIHdpZHRoKSxcbiAgICAgIHk6IHJhbmRvbS5yYW5nZSgwLCBoZWlnaHQpLFxuICAgICAgcmFkaXVzOiByYW5kb20ucmFuZ2VGbG9vcigzLCA1KSxcbiAgICAgIG9wYWNpdHk6IHJhbmRvbS5yYW5nZSg1LCA5KSAvIDEwXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gc3RhcnM7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVN0YXJDbHVzdGVyKHdpZHRoLCBoZWlnaHQpIHtcbiAgY29uc3Qgc3RhcnMgPSBbXTtcbiAgY29uc3QgY291bnQgPSByYW5kb20ucmFuZ2VGbG9vcigxMDAwLCAxNTAwKTtcbiAgY29uc3Qgc3ByZWFkID0gd2lkdGggLyAxMDtcbiAgY29uc3QgeCA9IHJhbmRvbS5yYW5nZSgyMDAsIHdpZHRoIC0gMjAwKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICBjb25zdCBkaXN0cmlidXRpb24gPSByYW5kb20uZ2F1c3NpYW4oKTtcbiAgICBzdGFycy5wdXNoKHtcbiAgICAgIHg6IHJhbmRvbS5yYW5nZSh4IC0gc3ByZWFkICogZGlzdHJpYnV0aW9uLCB4ICsgc3ByZWFkICogZGlzdHJpYnV0aW9uKSxcbiAgICAgIHk6IHJhbmRvbS5yYW5nZSgwLCBoZWlnaHQgLyAzICogMiksXG4gICAgICByYWRpdXM6IHJhbmRvbS5yYW5nZUZsb29yKDMsIDUpLFxuICAgICAgb3BhY2l0eTogcmFuZG9tLnJhbmdlKDUsIDkpIC8gMTBcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gc3RhcnM7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUhpbGxzKHdpZHRoLCBoZWlnaHQpIHtcbiAgY29uc3QgaGlsbHMgPSBbXTtcbiAgY29uc3QgY291bnQgPSByYW5kb20ucmFuZ2UoMiwgNCk7XG4gIGNvbnN0IHRvdGFsSG9yaXpvbkhlaWdodCA9IGhlaWdodCAqIDAuNjtcbiAgY29uc3Qgc2VnbWVudEhlaWd0ID0gdG90YWxIb3Jpem9uSGVpZ2h0IC8gY291bnQ7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgY29uc3QgcG9pbnRzID0gW107XG4gICAgY29uc3Qgb2Zmc2V0ID0gaSAqIHNlZ21lbnRIZWlndDtcbiAgICBjb25zdCBiYXNlWSA9IHRvdGFsSG9yaXpvbkhlaWdodCArIG9mZnNldDtcbiAgICBjb25zdCBtYXhPZmZzZXRUb3AgPSBiYXNlWSAtIHNlZ21lbnRIZWlndCAvIDU7XG4gICAgY29uc3QgbWF4T2Zmc2V0Qm90dG9tID0gYmFzZVkgKyBzZWdtZW50SGVpZ3QgLyA1O1xuICAgIGNvbnN0IG51bWJlck9mUGVha3MgPSByYW5kb20ucmFuZ2UoOCwgMTgpO1xuICAgIGNvbnN0IGF2ZXJhZ2VQZWFrV2lkdGggPSB3aWR0aCAvIG51bWJlck9mUGVha3M7XG5cbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8PSB3aWR0aCArIGF2ZXJhZ2VQZWFrV2lkdGg7IHggKz0gYXZlcmFnZVBlYWtXaWR0aCkge1xuICAgICAgcG9pbnRzLnB1c2goe1xuICAgICAgICB4LFxuICAgICAgICB5OiByYW5kb20ucmFuZ2UobWF4T2Zmc2V0VG9wLCBtYXhPZmZzZXRCb3R0b20pXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBoaWxscy5wdXNoKHsgcG9pbnRzLCB0b3A6IG1heE9mZnNldFRvcCwgYm90dG9tOiBiYXNlWSArIHNlZ21lbnRIZWlndCB9KTtcbiAgfVxuICByZXR1cm4gaGlsbHM7XG59XG5cbmNvbnN0IHNrZXRjaCA9ICgpID0+IHtcbiAgY29uc3QgaHVlID0gcmFuZG9tLnJhbmdlRmxvb3IoMjAwLCAyOTApOyAvLyByZXN0cmljdCB0byBibHVlcy9wdXJwbGVzXG4gIHJldHVybiAoeyBjb250ZXh0LCB3aWR0aCwgaGVpZ2h0IH0pID0+IHtcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IFwiYmxhY2tcIjtcbiAgICBjb250ZXh0LmZpbGxSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuXG4gICAgZnVuY3Rpb24gZHJhd0NpcmNsZUFzRGlhbW9uZCh7IHgsIHksIHJhZGl1cyB9LCBmaWxsKSB7XG4gICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBmaWxsO1xuICAgICAgY29udGV4dC5tb3ZlVG8oeCAtIHJhZGl1cywgeSk7XG4gICAgICBjb250ZXh0LmxpbmVUbyh4LCB5IC0gcmFkaXVzKTtcbiAgICAgIGNvbnRleHQubGluZVRvKHggKyByYWRpdXMsIHkpO1xuICAgICAgY29udGV4dC5saW5lVG8oeCwgeSArIHJhZGl1cyk7XG4gICAgICBjb250ZXh0LmZpbGwoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBiYWNrZ3JvdW5kU3RhcnMoKSB7XG4gICAgICBjcmVhdGVCYWNrZ3JvdW5kU3RhcnMod2lkdGgsIGhlaWdodCkuZm9yRWFjaChzdGFyID0+XG4gICAgICAgIGRyYXdDaXJjbGVBc0RpYW1vbmQoXG4gICAgICAgICAgc3RhcixcbiAgICAgICAgICBgcmdiYSgyNTUsIDI1MCwgMjQwLCAke3JhbmRvbS5yYW5nZSg1LCA5KSAvIDEwfSlgXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWlsa3l3YXkoKSB7XG4gICAgICBjcmVhdGVTdGFyQ2x1c3Rlcih3aWR0aCwgaGVpZ2h0KS5mb3JFYWNoKHN0YXIgPT5cbiAgICAgICAgZHJhd0NpcmNsZUFzRGlhbW9uZChcbiAgICAgICAgICBzdGFyLFxuICAgICAgICAgIGByZ2JhKDI1NSwgMjUwLCAyNDAsICR7cmFuZG9tLnJhbmdlKDUsIDkpIC8gMTB9KWBcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBiYWNrZ3JvdW5kR3JhZGllbnQoKSB7XG4gICAgICBjb25zdCBncmFkaWVudCA9IGNvbnRleHQuY3JlYXRlTGluZWFyR3JhZGllbnQoXG4gICAgICAgIHdpZHRoIC8gMixcbiAgICAgICAgMCxcbiAgICAgICAgd2lkdGggLyAyLFxuICAgICAgICBoZWlnaHRcbiAgICAgICk7XG5cbiAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgwLCBgaHNsKCR7aHVlfSwgMjAlLCAxMCVgKTtcbiAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgwLjUsIGBoc2woJHtodWV9LCAzMCUsIDIwJWApO1xuICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDEsIGBoc2woJHtodWV9LCA0MCUsIDMwJWApO1xuXG4gICAgICBjb250ZXh0LmZpbGxTdHlsZSA9IGdyYWRpZW50O1xuICAgICAgY29udGV4dC5maWxsUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhY2NlbnQoKSB7XG4gICAgICBjb25zdCB4ID0gd2lkdGggLyAyO1xuICAgICAgY29uc3QgeSA9IGhlaWdodCAvIDYgKiA1O1xuICAgICAgY29uc3QgciA9IHg7XG4gICAgICBjb25zdCBncmFkaWVudCA9IGNvbnRleHQuY3JlYXRlUmFkaWFsR3JhZGllbnQoXG4gICAgICAgIHgsIC8vIGNpcmNsZTEgeFxuICAgICAgICB5LCAvLyBjaXJjbGUxIHlcbiAgICAgICAgcmFuZG9tLnJhbmdlKDEwMCwgeCAvIDQpLCAvLyBjaXJjbGUxIHJcbiAgICAgICAgeCwgLy8gY2lyY2xlMiB4XG4gICAgICAgIHksIC8vIGNpcmNsZTIgeVxuICAgICAgICByXG4gICAgICApO1xuXG4gICAgICBjb25zdCBodWUgPSByYW5kb20ucmFuZ2VGbG9vcigwLCAyNjApO1xuXG4gICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMCwgYGhzbGEoJHtodWV9LCA4MCUsIDgwJSwgMC41YCk7XG4gICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoXG4gICAgICAgIHJhbmRvbS5yYW5nZSgzLCA3KSAvIDEwLFxuICAgICAgICBgaHNsYSgke2h1ZX0sIDgwJSwgODAlLCAwYFxuICAgICAgKTtcbiAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gZ3JhZGllbnQ7XG4gICAgICBjb250ZXh0LmZpbGxSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhvcml6b24oKSB7XG4gICAgICBjb25zdCBoaWxscyA9IGNyZWF0ZUhpbGxzKHdpZHRoLCBoZWlnaHQpO1xuICAgICAgaGlsbHMuZm9yRWFjaCgoeyBwb2ludHMsIHRvcCwgYm90dG9tIH0pID0+IHtcbiAgICAgICAgY29uc3QgZ3JhZGllbnQgPSBjb250ZXh0LmNyZWF0ZUxpbmVhckdyYWRpZW50KFxuICAgICAgICAgIHdpZHRoIC8gMixcbiAgICAgICAgICB0b3AsXG4gICAgICAgICAgd2lkdGggLyAyLFxuICAgICAgICAgIGJvdHRvbVxuICAgICAgICApO1xuXG4gICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgwLCBgaHNsKCR7aHVlfSwgMTAlLCAxMCUpYCk7XG4gICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgxLCBgaHNsKCR7aHVlfSwgMTAlLCAyMCUpYCk7XG5cbiAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBncmFkaWVudDtcbiAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgY29udGV4dC5tb3ZlVG8oMCwgaGVpZ2h0KTtcbiAgICAgICAgcG9pbnRzLmZvckVhY2gocG9pbnQgPT4ge1xuICAgICAgICAgIGNvbnRleHQubGluZVRvKHBvaW50LngsIHBvaW50LnkpO1xuICAgICAgICB9KTtcbiAgICAgICAgY29udGV4dC5saW5lVG8od2lkdGgsIGhlaWdodCk7XG4gICAgICAgIGNvbnRleHQuZmlsbCgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgYmFja2dyb3VuZEdyYWRpZW50KCk7XG4gICAgYWNjZW50KCk7XG4gICAgYmFja2dyb3VuZFN0YXJzKCk7XG4gICAgbWlsa3l3YXkoKTtcbiAgICBob3Jpem9uKCk7XG4gIH07XG59O1xuXG5jYW52YXNTa2V0Y2goc2tldGNoLCBzZXR0aW5ncyk7XG4iLCJcbmdsb2JhbC5DQU5WQVNfU0tFVENIX0RFRkFVTFRfU1RPUkFHRV9LRVkgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiJdfQ==
