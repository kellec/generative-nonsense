(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var defined = require('defined');
var EPSILON = Number.EPSILON;

function clamp (value, min, max) {
  return min < max
    ? (value < min ? min : value > max ? max : value)
    : (value < max ? max : value > min ? min : value);
}

function clamp01 (v) {
  return clamp(v, 0, 1);
}

function lerp (min, max, t) {
  return min * (1 - t) + max * t;
}

function inverseLerp (min, max, t) {
  if (Math.abs(min - max) < EPSILON) return 0;
  else return (t - min) / (max - min);
}

function smoothstep (min, max, t) {
  var x = clamp(inverseLerp(min, max, t), 0, 1);
  return x * x * (3 - 2 * x);
}

function toFinite (n, defaultValue) {
  defaultValue = defined(defaultValue, 0);
  return typeof n === 'number' && isFinite(n) ? n : defaultValue;
}

function expandVector (dims) {
  if (typeof dims !== 'number') throw new TypeError('Expected dims argument');
  return function (p, defaultValue) {
    defaultValue = defined(defaultValue, 0);
    var scalar;
    if (p == null) {
      // No vector, create a default one
      scalar = defaultValue;
    } else if (typeof p === 'number' && isFinite(p)) {
      // Expand single channel to multiple vector
      scalar = p;
    }

    var out = [];
    var i;
    if (scalar == null) {
      for (i = 0; i < dims; i++) {
        out[i] = toFinite(p[i], defaultValue);
      }
    } else {
      for (i = 0; i < dims; i++) {
        out[i] = scalar;
      }
    }
    return out;
  };
}

function lerpArray (min, max, t, out) {
  out = out || [];
  if (min.length !== max.length) {
    throw new TypeError('min and max array are expected to have the same length');
  }
  for (var i = 0; i < min.length; i++) {
    out[i] = lerp(min[i], max[i], t);
  }
  return out;
}

function newArray (n, initialValue) {
  n = defined(n, 0);
  if (typeof n !== 'number') throw new TypeError('Expected n argument to be a number');
  var out = [];
  for (var i = 0; i < n; i++) out.push(initialValue);
  return out;
}

function linspace (n, opts) {
  n = defined(n, 0);
  if (typeof n !== 'number') throw new TypeError('Expected n argument to be a number');
  opts = opts || {};
  if (typeof opts === 'boolean') {
    opts = { endpoint: true };
  }
  var offset = defined(opts.offset, 0);
  if (opts.endpoint) {
    return newArray(n).map(function (_, i) {
      return n <= 1 ? 0 : ((i + offset) / (n - 1));
    });
  } else {
    return newArray(n).map(function (_, i) {
      return (i + offset) / n;
    });
  }
}

function lerpFrames (values, t, out) {
  t = clamp(t, 0, 1);

  var len = values.length - 1;
  var whole = t * len;
  var frame = Math.floor(whole);
  var fract = whole - frame;

  var nextFrame = Math.min(frame + 1, len);
  var a = values[frame % values.length];
  var b = values[nextFrame % values.length];
  if (typeof a === 'number' && typeof b === 'number') {
    return lerp(a, b, fract);
  } else if (Array.isArray(a) && Array.isArray(b)) {
    return lerpArray(a, b, fract, out);
  } else {
    throw new TypeError('Mismatch in value type of two array elements: ' + frame + ' and ' + nextFrame);
  }
}

function mod (a, b) {
  return ((a % b) + b) % b;
}

function degToRad (n) {
  return n * Math.PI / 180;
}

function radToDeg (n) {
  return n * 180 / Math.PI;
}

function fract (n) {
  return n - Math.floor(n);
}

function sign (n) {
  if (n > 0) return 1;
  else if (n < 0) return -1;
  else return 0;
}

function wrap (value, from, to) {
  if (typeof from !== 'number' || typeof to !== 'number') {
    throw new TypeError('Must specify "to" and "from" arguments as numbers');
  }
  // algorithm from http://stackoverflow.com/a/5852628/599884
  if (from > to) {
    var t = from;
    from = to;
    to = t;
  }
  var cycle = to - from;
  if (cycle === 0) {
    return to;
  }
  return value - cycle * Math.floor((value - from) / cycle);
}

// Specific function from Unity / ofMath, not sure its needed?
// function lerpWrap (a, b, t, min, max) {
//   return wrap(a + wrap(b - a, min, max) * t, min, max)
// }

function pingPong (t, length) {
  t = mod(t, length * 2);
  return length - Math.abs(t - length);
}

function damp (a, b, lambda, dt) {
  return lerp(a, b, 1 - Math.exp(-lambda * dt));
}

function dampArray (a, b, lambda, dt, out) {
  out = out || [];
  for (var i = 0; i < a.length; i++) {
    out[i] = damp(a[i], b[i], lambda, dt);
  }
  return out;
}

function mapRange (value, inputMin, inputMax, outputMin, outputMax, clamp) {
  // Reference:
  // https://openframeworks.cc/documentation/math/ofMath/
  if (Math.abs(inputMin - inputMax) < EPSILON) {
    return outputMin;
  } else {
    var outVal = ((value - inputMin) / (inputMax - inputMin) * (outputMax - outputMin) + outputMin);
    if (clamp) {
      if (outputMax < outputMin) {
        if (outVal < outputMax) outVal = outputMax;
        else if (outVal > outputMin) outVal = outputMin;
      } else {
        if (outVal > outputMax) outVal = outputMax;
        else if (outVal < outputMin) outVal = outputMin;
      }
    }
    return outVal;
  }
}

module.exports = {
  mod: mod,
  fract: fract,
  sign: sign,
  degToRad: degToRad,
  radToDeg: radToDeg,
  wrap: wrap,
  pingPong: pingPong,
  linspace: linspace,
  lerp: lerp,
  lerpArray: lerpArray,
  inverseLerp: inverseLerp,
  lerpFrames: lerpFrames,
  clamp: clamp,
  clamp01: clamp01,
  smoothstep: smoothstep,
  damp: damp,
  dampArray: dampArray,
  mapRange: mapRange,
  expand2D: expandVector(2),
  expand3D: expandVector(3),
  expand4D: expandVector(4)
};

},{"defined":6}],2:[function(require,module,exports){
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

},{"defined":6,"seed-random":8,"simplex-noise":9}],3:[function(require,module,exports){
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

},{"convert-length":5}],4:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var installedColorSpaces = [],
    undef = function undef(obj) {
    return typeof obj === 'undefined';
},
    channelRegExp = /\s*(\.\d+|\d+(?:\.\d+)?)(%)?\s*/,
    percentageChannelRegExp = /\s*(\.\d+|100|\d?\d(?:\.\d+)?)%\s*/,
    alphaChannelRegExp = /\s*(\.\d+|\d+(?:\.\d+)?)\s*/,
    cssColorRegExp = new RegExp('^(rgb|hsl|hsv)a?' + '\\(' + channelRegExp.source + ',' + channelRegExp.source + ',' + channelRegExp.source + '(?:,' + alphaChannelRegExp.source + ')?' + '\\)$', 'i');

function color(obj) {
    if (Array.isArray(obj)) {
        if (typeof obj[0] === 'string' && typeof color[obj[0]] === 'function') {
            // Assumed array from .toJSON()
            return new color[obj[0]](obj.slice(1, obj.length));
        } else if (obj.length === 4) {
            // Assumed 4 element int RGB array from canvas with all channels [0;255]
            return new color.RGB(obj[0] / 255, obj[1] / 255, obj[2] / 255, obj[3] / 255);
        }
    } else if (typeof obj === 'string') {
        var lowerCased = obj.toLowerCase();
        if (color.namedColors[lowerCased]) {
            obj = '#' + color.namedColors[lowerCased];
        }
        if (lowerCased === 'transparent') {
            obj = 'rgba(0,0,0,0)';
        }
        // Test for CSS rgb(....) string
        var matchCssSyntax = obj.match(cssColorRegExp);
        if (matchCssSyntax) {
            var colorSpaceName = matchCssSyntax[1].toUpperCase(),
                alpha = undef(matchCssSyntax[8]) ? matchCssSyntax[8] : parseFloat(matchCssSyntax[8]),
                hasHue = colorSpaceName[0] === 'H',
                firstChannelDivisor = matchCssSyntax[3] ? 100 : hasHue ? 360 : 255,
                secondChannelDivisor = matchCssSyntax[5] || hasHue ? 100 : 255,
                thirdChannelDivisor = matchCssSyntax[7] || hasHue ? 100 : 255;
            if (undef(color[colorSpaceName])) {
                throw new Error('color.' + colorSpaceName + ' is not installed.');
            }
            return new color[colorSpaceName](parseFloat(matchCssSyntax[2]) / firstChannelDivisor, parseFloat(matchCssSyntax[4]) / secondChannelDivisor, parseFloat(matchCssSyntax[6]) / thirdChannelDivisor, alpha);
        }
        // Assume hex syntax
        if (obj.length < 6) {
            // Allow CSS shorthand
            obj = obj.replace(/^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i, '$1$1$2$2$3$3');
        }
        // Split obj into red, green, and blue components
        var hexMatch = obj.match(/^#?([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])$/i);
        if (hexMatch) {
            return new color.RGB(parseInt(hexMatch[1], 16) / 255, parseInt(hexMatch[2], 16) / 255, parseInt(hexMatch[3], 16) / 255);
        }

        // No match so far. Lets try the less likely ones
        if (color.CMYK) {
            var cmykMatch = obj.match(new RegExp('^cmyk' + '\\(' + percentageChannelRegExp.source + ',' + percentageChannelRegExp.source + ',' + percentageChannelRegExp.source + ',' + percentageChannelRegExp.source + '\\)$', 'i'));
            if (cmykMatch) {
                return new color.CMYK(parseFloat(cmykMatch[1]) / 100, parseFloat(cmykMatch[2]) / 100, parseFloat(cmykMatch[3]) / 100, parseFloat(cmykMatch[4]) / 100);
            }
        }
    } else if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && obj.isColor) {
        return obj;
    }
    return false;
}

color.namedColors = {};

color.installColorSpace = function (colorSpaceName, propertyNames, config) {
    color[colorSpaceName] = function (a1) {
        // ...
        var args = Array.isArray(a1) ? a1 : arguments;
        propertyNames.forEach(function (propertyName, i) {
            var propertyValue = args[i];
            if (propertyName === 'alpha') {
                this._alpha = isNaN(propertyValue) || propertyValue > 1 ? 1 : propertyValue < 0 ? 0 : propertyValue;
            } else {
                if (isNaN(propertyValue)) {
                    throw new Error('[' + colorSpaceName + ']: Invalid color: (' + propertyNames.join(',') + ')');
                }
                if (propertyName === 'hue') {
                    this._hue = propertyValue < 0 ? propertyValue - Math.floor(propertyValue) : propertyValue % 1;
                } else {
                    this['_' + propertyName] = propertyValue < 0 ? 0 : propertyValue > 1 ? 1 : propertyValue;
                }
            }
        }, this);
    };
    color[colorSpaceName].propertyNames = propertyNames;

    var prototype = color[colorSpaceName].prototype;

    ['valueOf', 'hex', 'hexa', 'css', 'cssa'].forEach(function (methodName) {
        prototype[methodName] = prototype[methodName] || (colorSpaceName === 'RGB' ? prototype.hex : function () {
            return this.rgb()[methodName]();
        });
    });

    prototype.isColor = true;

    prototype.equals = function (otherColor, epsilon) {
        if (undef(epsilon)) {
            epsilon = 1e-10;
        }

        otherColor = otherColor[colorSpaceName.toLowerCase()]();

        for (var i = 0; i < propertyNames.length; i = i + 1) {
            if (Math.abs(this['_' + propertyNames[i]] - otherColor['_' + propertyNames[i]]) > epsilon) {
                return false;
            }
        }

        return true;
    };

    prototype.toJSON = function () {
        return [colorSpaceName].concat(propertyNames.map(function (propertyName) {
            return this['_' + propertyName];
        }, this));
    };

    for (var propertyName in config) {
        if (config.hasOwnProperty(propertyName)) {
            var matchFromColorSpace = propertyName.match(/^from(.*)$/);
            if (matchFromColorSpace) {
                color[matchFromColorSpace[1].toUpperCase()].prototype[colorSpaceName.toLowerCase()] = config[propertyName];
            } else {
                prototype[propertyName] = config[propertyName];
            }
        }
    }

    // It is pretty easy to implement the conversion to the same color space:
    prototype[colorSpaceName.toLowerCase()] = function () {
        return this;
    };
    prototype.toString = function () {
        return '[' + colorSpaceName + ' ' + propertyNames.map(function (propertyName) {
            return this['_' + propertyName];
        }, this).join(', ') + ']';
    };

    // Generate getters and setters
    propertyNames.forEach(function (propertyName) {
        var shortName = propertyName === 'black' ? 'k' : propertyName.charAt(0);
        prototype[propertyName] = prototype[shortName] = function (value, isDelta) {
            // Simple getter mode: color.red()
            if (typeof value === 'undefined') {
                return this['_' + propertyName];
            } else if (isDelta) {
                // Adjuster: color.red(+.2, true)
                return new this.constructor(propertyNames.map(function (otherPropertyName) {
                    return this['_' + otherPropertyName] + (propertyName === otherPropertyName ? value : 0);
                }, this));
            } else {
                // Setter: color.red(.2);
                return new this.constructor(propertyNames.map(function (otherPropertyName) {
                    return propertyName === otherPropertyName ? value : this['_' + otherPropertyName];
                }, this));
            }
        };
    });

    function installForeignMethods(targetColorSpaceName, sourceColorSpaceName) {
        var obj = {};
        obj[sourceColorSpaceName.toLowerCase()] = function () {
            return this.rgb()[sourceColorSpaceName.toLowerCase()]();
        };
        color[sourceColorSpaceName].propertyNames.forEach(function (propertyName) {
            var shortName = propertyName === 'black' ? 'k' : propertyName.charAt(0);
            obj[propertyName] = obj[shortName] = function (value, isDelta) {
                return this[sourceColorSpaceName.toLowerCase()]()[propertyName](value, isDelta);
            };
        });
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop) && color[targetColorSpaceName].prototype[prop] === undefined) {
                color[targetColorSpaceName].prototype[prop] = obj[prop];
            }
        }
    }

    installedColorSpaces.forEach(function (otherColorSpaceName) {
        installForeignMethods(colorSpaceName, otherColorSpaceName);
        installForeignMethods(otherColorSpaceName, colorSpaceName);
    });

    installedColorSpaces.push(colorSpaceName);
    return color;
};

color.pluginList = [];

color.use = function (plugin) {
    if (color.pluginList.indexOf(plugin) === -1) {
        this.pluginList.push(plugin);
        plugin(color);
    }
    return color;
};

color.installMethod = function (name, fn) {
    installedColorSpaces.forEach(function (colorSpace) {
        color[colorSpace].prototype[name] = fn;
    });
    return this;
};

color.installColorSpace('RGB', ['red', 'green', 'blue', 'alpha'], {
    hex: function hex() {
        var hexString = (Math.round(255 * this._red) * 0x10000 + Math.round(255 * this._green) * 0x100 + Math.round(255 * this._blue)).toString(16);
        return '#' + '00000'.substr(0, 6 - hexString.length) + hexString;
    },

    hexa: function hexa() {
        var alphaString = Math.round(this._alpha * 255).toString(16);
        return '#' + '00'.substr(0, 2 - alphaString.length) + alphaString + this.hex().substr(1, 6);
    },

    css: function css() {
        return 'rgb(' + Math.round(255 * this._red) + ',' + Math.round(255 * this._green) + ',' + Math.round(255 * this._blue) + ')';
    },

    cssa: function cssa() {
        return 'rgba(' + Math.round(255 * this._red) + ',' + Math.round(255 * this._green) + ',' + Math.round(255 * this._blue) + ',' + this._alpha + ')';
    }
});

var color_1 = color;

var XYZ = function XYZ(color) {
    color.installColorSpace('XYZ', ['x', 'y', 'z', 'alpha'], {
        fromRgb: function fromRgb() {
            // http://www.easyrgb.com/index.php?X=MATH&H=02#text2
            var convert = function convert(channel) {
                return channel > 0.04045 ? Math.pow((channel + 0.055) / 1.055, 2.4) : channel / 12.92;
            },
                r = convert(this._red),
                g = convert(this._green),
                b = convert(this._blue);

            // Reference white point sRGB D65:
            // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
            return new color.XYZ(r * 0.4124564 + g * 0.3575761 + b * 0.1804375, r * 0.2126729 + g * 0.7151522 + b * 0.0721750, r * 0.0193339 + g * 0.1191920 + b * 0.9503041, this._alpha);
        },

        rgb: function rgb() {
            // http://www.easyrgb.com/index.php?X=MATH&H=01#text1
            var x = this._x,
                y = this._y,
                z = this._z,
                convert = function convert(channel) {
                return channel > 0.0031308 ? 1.055 * Math.pow(channel, 1 / 2.4) - 0.055 : 12.92 * channel;
            };

            // Reference white point sRGB D65:
            // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
            return new color.RGB(convert(x * 3.2404542 + y * -1.5371385 + z * -0.4985314), convert(x * -0.9692660 + y * 1.8760108 + z * 0.0415560), convert(x * 0.0556434 + y * -0.2040259 + z * 1.0572252), this._alpha);
        },

        lab: function lab() {
            // http://www.easyrgb.com/index.php?X=MATH&H=07#text7
            var convert = function convert(channel) {
                return channel > 0.008856 ? Math.pow(channel, 1 / 3) : 7.787037 * channel + 4 / 29;
            },
                x = convert(this._x / 95.047),
                y = convert(this._y / 100.000),
                z = convert(this._z / 108.883);

            return new color.LAB(116 * y - 16, 500 * (x - y), 200 * (y - z), this._alpha);
        }
    });
};

var LAB = function LAB(color) {
    color.use(XYZ);

    color.installColorSpace('LAB', ['l', 'a', 'b', 'alpha'], {
        fromRgb: function fromRgb() {
            return this.xyz().lab();
        },

        rgb: function rgb() {
            return this.xyz().rgb();
        },

        xyz: function xyz() {
            // http://www.easyrgb.com/index.php?X=MATH&H=08#text8
            var convert = function convert(channel) {
                var pow = Math.pow(channel, 3);
                return pow > 0.008856 ? pow : (channel - 16 / 116) / 7.87;
            },
                y = (this._l + 16) / 116,
                x = this._a / 500 + y,
                z = y - this._b / 200;

            return new color.XYZ(convert(x) * 95.047, convert(y) * 100.000, convert(z) * 108.883, this._alpha);
        }
    });
};

var HSV = function HSV(color) {
    color.installColorSpace('HSV', ['hue', 'saturation', 'value', 'alpha'], {
        rgb: function rgb() {
            var hue = this._hue,
                saturation = this._saturation,
                value = this._value,
                i = Math.min(5, Math.floor(hue * 6)),
                f = hue * 6 - i,
                p = value * (1 - saturation),
                q = value * (1 - f * saturation),
                t = value * (1 - (1 - f) * saturation),
                red,
                green,
                blue;
            switch (i) {
                case 0:
                    red = value;
                    green = t;
                    blue = p;
                    break;
                case 1:
                    red = q;
                    green = value;
                    blue = p;
                    break;
                case 2:
                    red = p;
                    green = value;
                    blue = t;
                    break;
                case 3:
                    red = p;
                    green = q;
                    blue = value;
                    break;
                case 4:
                    red = t;
                    green = p;
                    blue = value;
                    break;
                case 5:
                    red = value;
                    green = p;
                    blue = q;
                    break;
            }
            return new color.RGB(red, green, blue, this._alpha);
        },

        hsl: function hsl() {
            var l = (2 - this._saturation) * this._value,
                sv = this._saturation * this._value,
                svDivisor = l <= 1 ? l : 2 - l,
                saturation;

            // Avoid division by zero when lightness approaches zero:
            if (svDivisor < 1e-9) {
                saturation = 0;
            } else {
                saturation = sv / svDivisor;
            }
            return new color.HSL(this._hue, saturation, l / 2, this._alpha);
        },

        fromRgb: function fromRgb() {
            // Becomes one.color.RGB.prototype.hsv
            var red = this._red,
                green = this._green,
                blue = this._blue,
                max = Math.max(red, green, blue),
                min = Math.min(red, green, blue),
                delta = max - min,
                hue,
                saturation = max === 0 ? 0 : delta / max,
                value = max;
            if (delta === 0) {
                hue = 0;
            } else {
                switch (max) {
                    case red:
                        hue = (green - blue) / delta / 6 + (green < blue ? 1 : 0);
                        break;
                    case green:
                        hue = (blue - red) / delta / 6 + 1 / 3;
                        break;
                    case blue:
                        hue = (red - green) / delta / 6 + 2 / 3;
                        break;
                }
            }
            return new color.HSV(hue, saturation, value, this._alpha);
        }
    });
};

var HSL = function HSL(color) {
    color.use(HSV);

    color.installColorSpace('HSL', ['hue', 'saturation', 'lightness', 'alpha'], {
        hsv: function hsv() {
            // Algorithm adapted from http://wiki.secondlife.com/wiki/Color_conversion_scripts
            var l = this._lightness * 2,
                s = this._saturation * (l <= 1 ? l : 2 - l),
                saturation;

            // Avoid division by zero when l + s is very small (approaching black):
            if (l + s < 1e-9) {
                saturation = 0;
            } else {
                saturation = 2 * s / (l + s);
            }

            return new color.HSV(this._hue, saturation, (l + s) / 2, this._alpha);
        },

        rgb: function rgb() {
            return this.hsv().rgb();
        },

        fromRgb: function fromRgb() {
            // Becomes one.color.RGB.prototype.hsv
            return this.hsv().hsl();
        }
    });
};

var CMYK = function CMYK(color) {
    color.installColorSpace('CMYK', ['cyan', 'magenta', 'yellow', 'black', 'alpha'], {
        rgb: function rgb() {
            return new color.RGB(1 - this._cyan * (1 - this._black) - this._black, 1 - this._magenta * (1 - this._black) - this._black, 1 - this._yellow * (1 - this._black) - this._black, this._alpha);
        },

        fromRgb: function fromRgb() {
            // Becomes one.color.RGB.prototype.cmyk
            // Adapted from http://www.javascripter.net/faq/rgb2cmyk.htm
            var red = this._red,
                green = this._green,
                blue = this._blue,
                cyan = 1 - red,
                magenta = 1 - green,
                yellow = 1 - blue,
                black = 1;
            if (red || green || blue) {
                black = Math.min(cyan, Math.min(magenta, yellow));
                cyan = (cyan - black) / (1 - black);
                magenta = (magenta - black) / (1 - black);
                yellow = (yellow - black) / (1 - black);
            } else {
                black = 1;
            }
            return new color.CMYK(cyan, magenta, yellow, black, this._alpha);
        }
    });
};

var namedColors = function namedColors(color) {
    color.namedColors = {
        aliceblue: 'f0f8ff',
        antiquewhite: 'faebd7',
        aqua: '0ff',
        aquamarine: '7fffd4',
        azure: 'f0ffff',
        beige: 'f5f5dc',
        bisque: 'ffe4c4',
        black: '000',
        blanchedalmond: 'ffebcd',
        blue: '00f',
        blueviolet: '8a2be2',
        brown: 'a52a2a',
        burlywood: 'deb887',
        cadetblue: '5f9ea0',
        chartreuse: '7fff00',
        chocolate: 'd2691e',
        coral: 'ff7f50',
        cornflowerblue: '6495ed',
        cornsilk: 'fff8dc',
        crimson: 'dc143c',
        cyan: '0ff',
        darkblue: '00008b',
        darkcyan: '008b8b',
        darkgoldenrod: 'b8860b',
        darkgray: 'a9a9a9',
        darkgrey: 'a9a9a9',
        darkgreen: '006400',
        darkkhaki: 'bdb76b',
        darkmagenta: '8b008b',
        darkolivegreen: '556b2f',
        darkorange: 'ff8c00',
        darkorchid: '9932cc',
        darkred: '8b0000',
        darksalmon: 'e9967a',
        darkseagreen: '8fbc8f',
        darkslateblue: '483d8b',
        darkslategray: '2f4f4f',
        darkslategrey: '2f4f4f',
        darkturquoise: '00ced1',
        darkviolet: '9400d3',
        deeppink: 'ff1493',
        deepskyblue: '00bfff',
        dimgray: '696969',
        dimgrey: '696969',
        dodgerblue: '1e90ff',
        firebrick: 'b22222',
        floralwhite: 'fffaf0',
        forestgreen: '228b22',
        fuchsia: 'f0f',
        gainsboro: 'dcdcdc',
        ghostwhite: 'f8f8ff',
        gold: 'ffd700',
        goldenrod: 'daa520',
        gray: '808080',
        grey: '808080',
        green: '008000',
        greenyellow: 'adff2f',
        honeydew: 'f0fff0',
        hotpink: 'ff69b4',
        indianred: 'cd5c5c',
        indigo: '4b0082',
        ivory: 'fffff0',
        khaki: 'f0e68c',
        lavender: 'e6e6fa',
        lavenderblush: 'fff0f5',
        lawngreen: '7cfc00',
        lemonchiffon: 'fffacd',
        lightblue: 'add8e6',
        lightcoral: 'f08080',
        lightcyan: 'e0ffff',
        lightgoldenrodyellow: 'fafad2',
        lightgray: 'd3d3d3',
        lightgrey: 'd3d3d3',
        lightgreen: '90ee90',
        lightpink: 'ffb6c1',
        lightsalmon: 'ffa07a',
        lightseagreen: '20b2aa',
        lightskyblue: '87cefa',
        lightslategray: '789',
        lightslategrey: '789',
        lightsteelblue: 'b0c4de',
        lightyellow: 'ffffe0',
        lime: '0f0',
        limegreen: '32cd32',
        linen: 'faf0e6',
        magenta: 'f0f',
        maroon: '800000',
        mediumaquamarine: '66cdaa',
        mediumblue: '0000cd',
        mediumorchid: 'ba55d3',
        mediumpurple: '9370d8',
        mediumseagreen: '3cb371',
        mediumslateblue: '7b68ee',
        mediumspringgreen: '00fa9a',
        mediumturquoise: '48d1cc',
        mediumvioletred: 'c71585',
        midnightblue: '191970',
        mintcream: 'f5fffa',
        mistyrose: 'ffe4e1',
        moccasin: 'ffe4b5',
        navajowhite: 'ffdead',
        navy: '000080',
        oldlace: 'fdf5e6',
        olive: '808000',
        olivedrab: '6b8e23',
        orange: 'ffa500',
        orangered: 'ff4500',
        orchid: 'da70d6',
        palegoldenrod: 'eee8aa',
        palegreen: '98fb98',
        paleturquoise: 'afeeee',
        palevioletred: 'd87093',
        papayawhip: 'ffefd5',
        peachpuff: 'ffdab9',
        peru: 'cd853f',
        pink: 'ffc0cb',
        plum: 'dda0dd',
        powderblue: 'b0e0e6',
        purple: '800080',
        rebeccapurple: '639',
        red: 'f00',
        rosybrown: 'bc8f8f',
        royalblue: '4169e1',
        saddlebrown: '8b4513',
        salmon: 'fa8072',
        sandybrown: 'f4a460',
        seagreen: '2e8b57',
        seashell: 'fff5ee',
        sienna: 'a0522d',
        silver: 'c0c0c0',
        skyblue: '87ceeb',
        slateblue: '6a5acd',
        slategray: '708090',
        slategrey: '708090',
        snow: 'fffafa',
        springgreen: '00ff7f',
        steelblue: '4682b4',
        tan: 'd2b48c',
        teal: '008080',
        thistle: 'd8bfd8',
        tomato: 'ff6347',
        turquoise: '40e0d0',
        violet: 'ee82ee',
        wheat: 'f5deb3',
        white: 'fff',
        whitesmoke: 'f5f5f5',
        yellow: 'ff0',
        yellowgreen: '9acd32'
    };
};

var clearer = function clearer(color) {
    color.installMethod('clearer', function (amount) {
        return this.alpha(isNaN(amount) ? -0.1 : -amount, true);
    });
};

var darken = function darken(color) {
    color.use(HSL);

    color.installMethod('darken', function (amount) {
        return this.lightness(isNaN(amount) ? -0.1 : -amount, true);
    });
};

var desaturate = function desaturate(color) {
    color.use(HSL);

    color.installMethod('desaturate', function (amount) {
        return this.saturation(isNaN(amount) ? -0.1 : -amount, true);
    });
};

var grayscale = function grayscale(color) {
    function gs() {
        /*jslint strict:false*/
        var rgb = this.rgb(),
            val = rgb._red * 0.3 + rgb._green * 0.59 + rgb._blue * 0.11;

        return new color.RGB(val, val, val, rgb._alpha);
    }

    color.installMethod('greyscale', gs).installMethod('grayscale', gs);
};

var lighten = function lighten(color) {
    color.use(HSL);

    color.installMethod('lighten', function (amount) {
        return this.lightness(isNaN(amount) ? 0.1 : amount, true);
    });
};

var mix = function mix(color) {
    color.installMethod('mix', function (otherColor, weight) {
        otherColor = color(otherColor).rgb();
        weight = 1 - (isNaN(weight) ? 0.5 : weight);

        var w = weight * 2 - 1,
            a = this._alpha - otherColor._alpha,
            weight1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2,
            weight2 = 1 - weight1,
            rgb = this.rgb();

        return new color.RGB(rgb._red * weight1 + otherColor._red * weight2, rgb._green * weight1 + otherColor._green * weight2, rgb._blue * weight1 + otherColor._blue * weight2, rgb._alpha * weight + otherColor._alpha * (1 - weight));
    });
};

var negate = function negate(color) {
    color.installMethod('negate', function () {
        var rgb = this.rgb();
        return new color.RGB(1 - rgb._red, 1 - rgb._green, 1 - rgb._blue, this._alpha);
    });
};

var opaquer = function opaquer(color) {
    color.installMethod('opaquer', function (amount) {
        return this.alpha(isNaN(amount) ? 0.1 : amount, true);
    });
};

var rotate = function rotate(color) {
    color.use(HSL);

    color.installMethod('rotate', function (degrees) {
        return this.hue((degrees || 0) / 360, true);
    });
};

var saturate = function saturate(color) {
    color.use(HSL);

    color.installMethod('saturate', function (amount) {
        return this.saturation(isNaN(amount) ? 0.1 : amount, true);
    });
};

// Adapted from http://gimp.sourcearchive.com/documentation/2.6.6-1ubuntu1/color-to-alpha_8c-source.html
// toAlpha returns a color where the values of the argument have been converted to alpha
var toAlpha = function toAlpha(color) {
    color.installMethod('toAlpha', function (color) {
        var me = this.rgb(),
            other = color(color).rgb(),
            epsilon = 1e-10,
            a = new color.RGB(0, 0, 0, me._alpha),
            channels = ['_red', '_green', '_blue'];

        channels.forEach(function (channel) {
            if (me[channel] < epsilon) {
                a[channel] = me[channel];
            } else if (me[channel] > other[channel]) {
                a[channel] = (me[channel] - other[channel]) / (1 - other[channel]);
            } else if (me[channel] > other[channel]) {
                a[channel] = (other[channel] - me[channel]) / other[channel];
            } else {
                a[channel] = 0;
            }
        });

        if (a._red > a._green) {
            if (a._red > a._blue) {
                me._alpha = a._red;
            } else {
                me._alpha = a._blue;
            }
        } else if (a._green > a._blue) {
            me._alpha = a._green;
        } else {
            me._alpha = a._blue;
        }

        if (me._alpha < epsilon) {
            return me;
        }

        channels.forEach(function (channel) {
            me[channel] = (me[channel] - other[channel]) / me._alpha + other[channel];
        });
        me._alpha *= a._alpha;

        return me;
    });
};

var onecolor = color_1.use(XYZ).use(LAB).use(HSV).use(HSL).use(CMYK)

// Convenience functions
.use(namedColors).use(clearer).use(darken).use(desaturate).use(grayscale).use(lighten).use(mix).use(negate).use(opaquer).use(rotate).use(saturate).use(toAlpha);

function getContrastRatio(foreground, background) {
  var backgroundOnWhite = alphaBlend(background, '#fff');
  var backgroundOnBlack = alphaBlend(background, '#000');

  var LWhite = getRelativeLuminance(backgroundOnWhite);
  var LBlack = getRelativeLuminance(backgroundOnBlack);
  var LForeground = getRelativeLuminance(foreground);

  if (LWhite < LForeground) {
    return getContrastRatioOpaque(foreground, backgroundOnWhite);
  } else if (LBlack > LForeground) {
    return getContrastRatioOpaque(foreground, backgroundOnBlack);
  } else {
    return 1;
  }
}

function alphaBlend(cssForeground, cssBackground) {
  var foreground = onecolor(cssForeground);
  var background = onecolor(cssBackground);
  var result = onecolor('#fff');
  var a = foreground.alpha();

  result._red = foreground._red * a + background._red * (1 - a);
  result._green = foreground._green * a + background._green * (1 - a);
  result._blue = foreground._blue * a + background._blue * (1 - a);

  return result;
}

function getContrastRatioOpaque(foreground, background) {
  var L1 = getRelativeLuminance(background);
  var L2 = getRelativeLuminance(alphaBlend(foreground, background));

  // https://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
}

function getRelativeLuminance(cssColor) {
  // https://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
  var color = onecolor(cssColor);

  var R = color._red <= 0.03928 ? color._red / 12.92 : Math.pow((color._red + 0.055) / 1.055, 2.4);
  var G = color._green <= 0.03928 ? color._green / 12.92 : Math.pow((color._green + 0.055) / 1.055, 2.4);
  var B = color._blue <= 0.03928 ? color._blue / 12.92 : Math.pow((color._blue + 0.055) / 1.055, 2.4);

  var L = 0.2126 * R + 0.7152 * G + 0.0722 * B;

  return L;
}

module.exports = getContrastRatio;

},{}],5:[function(require,module,exports){
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

},{"defined":6}],6:[function(require,module,exports){
module.exports = function () {
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] !== undefined) return arguments[i];
    }
};

},{}],7:[function(require,module,exports){
module.exports=[["#69d2e7","#a7dbd8","#e0e4cc","#f38630","#fa6900"],["#fe4365","#fc9d9a","#f9cdad","#c8c8a9","#83af9b"],["#ecd078","#d95b43","#c02942","#542437","#53777a"],["#556270","#4ecdc4","#c7f464","#ff6b6b","#c44d58"],["#774f38","#e08e79","#f1d4af","#ece5ce","#c5e0dc"],["#e8ddcb","#cdb380","#036564","#033649","#031634"],["#490a3d","#bd1550","#e97f02","#f8ca00","#8a9b0f"],["#594f4f","#547980","#45ada8","#9de0ad","#e5fcc2"],["#00a0b0","#6a4a3c","#cc333f","#eb6841","#edc951"],["#e94e77","#d68189","#c6a49a","#c6e5d9","#f4ead5"],["#3fb8af","#7fc7af","#dad8a7","#ff9e9d","#ff3d7f"],["#d9ceb2","#948c75","#d5ded9","#7a6a53","#99b2b7"],["#ffffff","#cbe86b","#f2e9e1","#1c140d","#cbe86b"],["#efffcd","#dce9be","#555152","#2e2633","#99173c"],["#343838","#005f6b","#008c9e","#00b4cc","#00dffc"],["#413e4a","#73626e","#b38184","#f0b49e","#f7e4be"],["#ff4e50","#fc913a","#f9d423","#ede574","#e1f5c4"],["#99b898","#fecea8","#ff847c","#e84a5f","#2a363b"],["#655643","#80bca3","#f6f7bd","#e6ac27","#bf4d28"],["#00a8c6","#40c0cb","#f9f2e7","#aee239","#8fbe00"],["#351330","#424254","#64908a","#e8caa4","#cc2a41"],["#554236","#f77825","#d3ce3d","#f1efa5","#60b99a"],["#ff9900","#424242","#e9e9e9","#bcbcbc","#3299bb"],["#5d4157","#838689","#a8caba","#cad7b2","#ebe3aa"],["#8c2318","#5e8c6a","#88a65e","#bfb35a","#f2c45a"],["#fad089","#ff9c5b","#f5634a","#ed303c","#3b8183"],["#ff4242","#f4fad2","#d4ee5e","#e1edb9","#f0f2eb"],["#d1e751","#ffffff","#000000","#4dbce9","#26ade4"],["#f8b195","#f67280","#c06c84","#6c5b7b","#355c7d"],["#1b676b","#519548","#88c425","#bef202","#eafde6"],["#bcbdac","#cfbe27","#f27435","#f02475","#3b2d38"],["#5e412f","#fcebb6","#78c0a8","#f07818","#f0a830"],["#452632","#91204d","#e4844a","#e8bf56","#e2f7ce"],["#eee6ab","#c5bc8e","#696758","#45484b","#36393b"],["#f0d8a8","#3d1c00","#86b8b1","#f2d694","#fa2a00"],["#f04155","#ff823a","#f2f26f","#fff7bd","#95cfb7"],["#2a044a","#0b2e59","#0d6759","#7ab317","#a0c55f"],["#bbbb88","#ccc68d","#eedd99","#eec290","#eeaa88"],["#b9d7d9","#668284","#2a2829","#493736","#7b3b3b"],["#b3cc57","#ecf081","#ffbe40","#ef746f","#ab3e5b"],["#a3a948","#edb92e","#f85931","#ce1836","#009989"],["#67917a","#170409","#b8af03","#ccbf82","#e33258"],["#e8d5b7","#0e2430","#fc3a51","#f5b349","#e8d5b9"],["#aab3ab","#c4cbb7","#ebefc9","#eee0b7","#e8caaf"],["#300030","#480048","#601848","#c04848","#f07241"],["#ab526b","#bca297","#c5ceae","#f0e2a4","#f4ebc3"],["#607848","#789048","#c0d860","#f0f0d8","#604848"],["#a8e6ce","#dcedc2","#ffd3b5","#ffaaa6","#ff8c94"],["#3e4147","#fffedf","#dfba69","#5a2e2e","#2a2c31"],["#b6d8c0","#c8d9bf","#dadabd","#ecdbbc","#fedcba"],["#fc354c","#29221f","#13747d","#0abfbc","#fcf7c5"],["#1c2130","#028f76","#b3e099","#ffeaad","#d14334"],["#edebe6","#d6e1c7","#94c7b6","#403b33","#d3643b"],["#cc0c39","#e6781e","#c8cf02","#f8fcc1","#1693a7"],["#dad6ca","#1bb0ce","#4f8699","#6a5e72","#563444"],["#a7c5bd","#e5ddcb","#eb7b59","#cf4647","#524656"],["#fdf1cc","#c6d6b8","#987f69","#e3ad40","#fcd036"],["#5c323e","#a82743","#e15e32","#c0d23e","#e5f04c"],["#230f2b","#f21d41","#ebebbc","#bce3c5","#82b3ae"],["#b9d3b0","#81bda4","#b28774","#f88f79","#f6aa93"],["#3a111c","#574951","#83988e","#bcdea5","#e6f9bc"],["#5e3929","#cd8c52","#b7d1a3","#dee8be","#fcf7d3"],["#1c0113","#6b0103","#a30006","#c21a01","#f03c02"],["#382f32","#ffeaf2","#fcd9e5","#fbc5d8","#f1396d"],["#e3dfba","#c8d6bf","#93ccc6","#6cbdb5","#1a1f1e"],["#000000","#9f111b","#b11623","#292c37","#cccccc"],["#c1b398","#605951","#fbeec2","#61a6ab","#accec0"],["#8dccad","#988864","#fea6a2","#f9d6ac","#ffe9af"],["#f6f6f6","#e8e8e8","#333333","#990100","#b90504"],["#1b325f","#9cc4e4","#e9f2f9","#3a89c9","#f26c4f"],["#5e9fa3","#dcd1b4","#fab87f","#f87e7b","#b05574"],["#951f2b","#f5f4d7","#e0dfb1","#a5a36c","#535233"],["#413d3d","#040004","#c8ff00","#fa023c","#4b000f"],["#eff3cd","#b2d5ba","#61ada0","#248f8d","#605063"],["#2d2d29","#215a6d","#3ca2a2","#92c7a3","#dfece6"],["#cfffdd","#b4dec1","#5c5863","#a85163","#ff1f4c"],["#4e395d","#827085","#8ebe94","#ccfc8e","#dc5b3e"],["#9dc9ac","#fffec7","#f56218","#ff9d2e","#919167"],["#a1dbb2","#fee5ad","#faca66","#f7a541","#f45d4c"],["#ffefd3","#fffee4","#d0ecea","#9fd6d2","#8b7a5e"],["#a8a7a7","#cc527a","#e8175d","#474747","#363636"],["#ffedbf","#f7803c","#f54828","#2e0d23","#f8e4c1"],["#f8edd1","#d88a8a","#474843","#9d9d93","#c5cfc6"],["#f38a8a","#55443d","#a0cab5","#cde9ca","#f1edd0"],["#4e4d4a","#353432","#94ba65","#2790b0","#2b4e72"],["#0ca5b0","#4e3f30","#fefeeb","#f8f4e4","#a5b3aa"],["#a70267","#f10c49","#fb6b41","#f6d86b","#339194"],["#9d7e79","#ccac95","#9a947c","#748b83","#5b756c"],["#edf6ee","#d1c089","#b3204d","#412e28","#151101"],["#046d8b","#309292","#2fb8ac","#93a42a","#ecbe13"],["#4d3b3b","#de6262","#ffb88c","#ffd0b3","#f5e0d3"],["#fffbb7","#a6f6af","#66b6ab","#5b7c8d","#4f2958"],["#ff003c","#ff8a00","#fabe28","#88c100","#00c176"],["#fcfef5","#e9ffe1","#cdcfb7","#d6e6c3","#fafbe3"],["#9cddc8","#bfd8ad","#ddd9ab","#f7af63","#633d2e"],["#30261c","#403831","#36544f","#1f5f61","#0b8185"],["#d1313d","#e5625c","#f9bf76","#8eb2c5","#615375"],["#ffe181","#eee9e5","#fad3b2","#ffba7f","#ff9c97"],["#aaff00","#ffaa00","#ff00aa","#aa00ff","#00aaff"],["#c2412d","#d1aa34","#a7a844","#a46583","#5a1e4a"],["#75616b","#bfcff7","#dce4f7","#f8f3bf","#d34017"],["#805841","#dcf7f3","#fffcdd","#ffd8d8","#f5a2a2"],["#379f7a","#78ae62","#bbb749","#e0fbac","#1f1c0d"],["#73c8a9","#dee1b6","#e1b866","#bd5532","#373b44"],["#caff42","#ebf7f8","#d0e0eb","#88abc2","#49708a"],["#7e5686","#a5aad9","#e8f9a2","#f8a13f","#ba3c3d"],["#82837e","#94b053","#bdeb07","#bffa37","#e0e0e0"],["#111625","#341931","#571b3c","#7a1e48","#9d2053"],["#312736","#d4838f","#d6abb1","#d9d9d9","#c4ffeb"],["#84b295","#eccf8d","#bb8138","#ac2005","#2c1507"],["#395a4f","#432330","#853c43","#f25c5e","#ffa566"],["#fde6bd","#a1c5ab","#f4dd51","#d11e48","#632f53"],["#6da67a","#77b885","#86c28b","#859987","#4a4857"],["#bed6c7","#adc0b4","#8a7e66","#a79b83","#bbb2a1"],["#058789","#503d2e","#d54b1a","#e3a72f","#f0ecc9"],["#e21b5a","#9e0c39","#333333","#fbffe3","#83a300"],["#261c21","#6e1e62","#b0254f","#de4126","#eb9605"],["#b5ac01","#ecba09","#e86e1c","#d41e45","#1b1521"],["#efd9b4","#d6a692","#a39081","#4d6160","#292522"],["#fbc599","#cdbb93","#9eae8a","#335650","#f35f55"],["#c75233","#c78933","#d6ceaa","#79b5ac","#5e2f46"],["#793a57","#4d3339","#8c873e","#d1c5a5","#a38a5f"],["#f2e3c6","#ffc6a5","#e6324b","#2b2b2b","#353634"],["#512b52","#635274","#7bb0a8","#a7dbab","#e4f5b1"],["#59b390","#f0ddaa","#e47c5d","#e32d40","#152b3c"],["#fdffd9","#fff0b8","#ffd6a3","#faad8e","#142f30"],["#11766d","#410936","#a40b54","#e46f0a","#f0b300"],["#11644d","#a0b046","#f2c94e","#f78145","#f24e4e"],["#c7fcd7","#d9d5a7","#d9ab91","#e6867a","#ed4a6a"],["#595643","#4e6b66","#ed834e","#ebcc6e","#ebe1c5"],["#331327","#991766","#d90f5a","#f34739","#ff6e27"],["#bf496a","#b39c82","#b8c99d","#f0d399","#595151"],["#f1396d","#fd6081","#f3ffeb","#acc95f","#8f9924"],["#efeecc","#fe8b05","#fe0557","#400403","#0aabba"],["#e5eaa4","#a8c4a2","#69a5a4","#616382","#66245b"],["#e9e0d1","#91a398","#33605a","#070001","#68462b"],["#e4ded0","#abccbd","#7dbeb8","#181619","#e32f21"],["#e0eff1","#7db4b5","#ffffff","#680148","#000000"],["#b7cbbf","#8c886f","#f9a799","#f4bfad","#f5dabd"],["#ffb884","#f5df98","#fff8d4","#c0d1c2","#2e4347"],["#6da67a","#99a66d","#a9bd68","#b5cc6a","#c0de5d"],["#b1e6d1","#77b1a9","#3d7b80","#270a33","#451a3e"],["#fc284f","#ff824a","#fea887","#f6e7f7","#d1d0d7"],["#ffab07","#e9d558","#72ad75","#0e8d94","#434d53"],["#311d39","#67434f","#9b8e7e","#c3ccaf","#a51a41"],["#5cacc4","#8cd19d","#cee879","#fcb653","#ff5254"],["#44749d","#c6d4e1","#ffffff","#ebe7e0","#bdb8ad"],["#cfb590","#9e9a41","#758918","#564334","#49281f"],["#e4e4c5","#b9d48b","#8d2036","#ce0a31","#d3e4c5"],["#ccf390","#e0e05a","#f7c41f","#fc930a","#ff003d"],["#807462","#a69785","#b8faff","#e8fdff","#665c49"],["#ec4401","#cc9b25","#13cd4a","#7b6ed6","#5e525c"],["#cc5d4c","#fffec6","#c7d1af","#96b49c","#5b5847"],["#e3e8cd","#bcd8bf","#d3b9a3","#ee9c92","#fe857e"],["#360745","#d61c59","#e7d84b","#efeac5","#1b8798"],["#2b222c","#5e4352","#965d62","#c7956d","#f2d974"],["#e7edea","#ffc52c","#fb0c06","#030d4f","#ceecef"],["#eb9c4d","#f2d680","#f3ffcf","#bac9a9","#697060"],["#fff3db","#e7e4d5","#d3c8b4","#c84648","#703e3b"],["#f5dd9d","#bcc499","#92a68a","#7b8f8a","#506266"],["#f2e8c4","#98d9b6","#3ec9a7","#2b879e","#616668"],["#041122","#259073","#7fda89","#c8e98e","#e6f99d"],["#c6cca5","#8ab8a8","#6b9997","#54787d","#615145"],["#4b1139","#3b4058","#2a6e78","#7a907c","#c9b180"],["#8d7966","#a8a39d","#d8c8b8","#e2ddd9","#f8f1e9"],["#2d1b33","#f36a71","#ee887a","#e4e391","#9abc8a"],["#95a131","#c8cd3b","#f6f1de","#f5b9ae","#ee0b5b"],["#79254a","#795c64","#79927d","#aeb18e","#e3cf9e"],["#429398","#6b5d4d","#b0a18f","#dfcdb4","#fbeed3"],["#1d1313","#24b694","#d22042","#a3b808","#30c4c9"],["#9d9e94","#c99e93","#f59d92","#e5b8ad","#d5d2c8"],["#f0ffc9","#a9da88","#62997a","#72243d","#3b0819"],["#322938","#89a194","#cfc89a","#cc883a","#a14016"],["#452e3c","#ff3d5a","#ffb969","#eaf27e","#3b8c88"],["#f06d61","#da825f","#c4975c","#a8ab7b","#8cbf99"],["#540045","#c60052","#ff714b","#eaff87","#acffe9"],["#2b2726","#0a516d","#018790","#7dad93","#bacca4"],["#027b7f","#ffa588","#d62957","#bf1e62","#572e4f"],["#23192d","#fd0a54","#f57576","#febf97","#f5ecb7"],["#fa6a64","#7a4e48","#4a4031","#f6e2bb","#9ec6b8"],["#a3c68c","#879676","#6e6662","#4f364a","#340735"],["#f6d76b","#ff9036","#d6254d","#ff5475","#fdeba9"],["#80a8a8","#909d9e","#a88c8c","#ff0d51","#7a8c89"],["#a32c28","#1c090b","#384030","#7b8055","#bca875"],["#6d9788","#1e2528","#7e1c13","#bf0a0d","#e6e1c2"],["#373737","#8db986","#acce91","#badb73","#efeae4"],["#280904","#680e34","#9a151a","#c21b12","#fc4b2a"],["#fb6900","#f63700","#004853","#007e80","#00b9bd"],["#e6b39a","#e6cba5","#ede3b4","#8b9e9b","#6d7578"],["#641f5e","#676077","#65ac92","#c2c092","#edd48e"],["#a69e80","#e0ba9b","#e7a97e","#d28574","#3b1922"],["#161616","#c94d65","#e7c049","#92b35a","#1f6764"],["#234d20","#36802d","#77ab59","#c9df8a","#f0f7da"],["#4b3e4d","#1e8c93","#dbd8a2","#c4ac30","#d74f33"],["#ff7474","#f59b71","#c7c77f","#e0e0a8","#f1f1c1"],["#e6eba9","#abbb9f","#6f8b94","#706482","#703d6f"],["#26251c","#eb0a44","#f2643d","#f2a73d","#a0e8b7"],["#fdcfbf","#feb89f","#e23d75","#5f0d3b","#742365"],["#230b00","#a29d7f","#d4cfa5","#f8ecd4","#aabe9b"],["#85847e","#ab6a6e","#f7345b","#353130","#cbcfb4"],["#d4f7dc","#dbe7b4","#dbc092","#e0846d","#f51441"],["#d3d5b0","#b5cea4","#9dc19d","#8c7c62","#71443f"],["#4f364c","#5e405f","#6b6b6b","#8f9e6f","#b1cf72"],["#bfcdb4","#f7e5bf","#ead2a4","#efb198","#7d5d4e"],["#6f5846","#a95a52","#e35b5d","#f18052","#ffa446"],["#ff3366","#c74066","#8f4d65","#575a65","#1f6764"],["#ffff99","#d9cc8c","#b39980","#8c6673","#663366"],["#c46564","#f0e999","#b8c99d","#9b726f","#eeb15b"],["#eeda95","#b7c27e","#9a927b","#8a6a6b","#805566"],["#62a07b","#4f8b89","#536c8d","#5c4f79","#613860"],["#1a081f","#4d1d4d","#05676e","#489c79","#ebc288"],["#f0f0d8","#b4debe","#77cca4","#666666","#b4df37"],["#ed6464","#bf6370","#87586c","#574759","#1a1b1c"],["#ccb24c","#f7d683","#fffdc0","#fffffd","#457d97"],["#7a5b3e","#fafafa","#fa4b00","#cdbdae","#1f1f1f"],["#566965","#948a71","#cc9476","#f2a176","#ff7373"],["#d31900","#ff6600","#fff2af","#7cb490","#000000"],["#d24858","#ea8676","#eab05e","#fdeecd","#493831"],["#ebeaa9","#ebc588","#7d2948","#3b0032","#0e0b29"],["#411f2d","#ac4147","#f88863","#ffc27f","#ffe29a"],["#e7e79d","#c0d890","#78a890","#606078","#d8a878"],["#9dbcbc","#f0f0af","#ff370f","#332717","#6bacbf"],["#063940","#195e63","#3e838c","#8ebdb6","#ece1c3"],["#e8c382","#b39d69","#a86b4c","#7d1a0c","#340a0b"],["#94654c","#f89fa1","#fabdbd","#fad6d6","#fefcd0"],["#595b5a","#14c3a2","#0de5a8","#7cf49a","#b8fd99"],["#cddbc2","#f7e4c6","#fb9274","#f5565b","#875346"],["#f0ddbd","#ba3622","#851e25","#520c30","#1c997f"],["#312c20","#494d4b","#7c7052","#b3a176","#e2cb92"],["#e7dd96","#e16639","#ad860a","#b7023f","#55024a"],["#574c41","#e36b6b","#e3a56b","#e3c77b","#96875a"],["#3f2c26","#dd423e","#a2a384","#eac388","#c5ad4b"],["#0a0310","#49007e","#ff005b","#ff7d10","#ffb238"],["#cdeccc","#edd269","#e88460","#f23460","#321d2e"],["#1f1f20","#2b4c7e","#567ebb","#606d80","#dce0e6"],["#f3e7d7","#f7d7cd","#f8c7c9","#e0c0c7","#c7b9c5"],["#ecbe13","#738c79","#6a6b5f","#2c2b26","#a43955"],["#dde0cf","#c6be9a","#ad8b32","#937460","#8c5b7b"],["#181419","#4a073c","#9e0b41","#cc3e18","#f0971c"],["#029daf","#e5d599","#ffc219","#f07c19","#e32551"],["#fff5de","#b8d9c8","#917081","#750e49","#4d002b"],["#4d3b36","#eb613b","#f98f6f","#c1d9cd","#f7eadc"],["#413040","#6c6368","#b9a173","#eaa353","#ffefa9"],["#ffcdb8","#fdeecf","#c8c696","#97bea9","#37260c"],["#213435","#46685b","#648a64","#a6b985","#e1e3ac"],["#ffffff","#fffaeb","#f0f0d8","#cfcfcf","#967c52"],["#e8d3a9","#e39b7d","#6e6460","#89b399","#bcbfa3"],["#ed5672","#160e32","#9eae8a","#cdbb93","#fbc599"],["#001449","#012677","#005bc5","#00b4fc","#17f9ff"],["#4dab8c","#542638","#8f244d","#c9306b","#e86f9e"],["#67be9b","#95d0b8","#fcfcd7","#f1db42","#f04158"],["#2b1719","#02483e","#057c46","#9bb61b","#f8be00"],["#ffff00","#ccd91a","#99b333","#668c4d","#336666"],["#130912","#3e1c33","#602749","#b14623","#f6921d"],["#e7eed0","#cad1c3","#948e99","#51425f","#2e1437"],["#e25858","#e9d6af","#ffffdd","#c0efd2","#384252"],["#e6a06f","#9e9c71","#5e8271","#33454e","#242739"],["#faf6d0","#c7d8ab","#909a92","#744f78","#30091e"],["#acdeb2","#e1eab5","#edad9e","#fe4b74","#390d2d"],["#42282c","#6ca19e","#84abaa","#ded1b6","#6d997a"],["#9f0a28","#d55c2b","#f6e7d3","#89a46f","#55203c"],["#418e8e","#5a4e3c","#c4d428","#d8e472","#e9ebbf"],["#1693a5","#45b5c4","#7ececa","#a0ded6","#c7ede8"],["#fdffd9","#73185e","#36bba6","#0c0d02","#8b911a"],["#a69a90","#4a403d","#fff1c1","#facf7d","#ea804c"],["#f7f3d5","#ffdabf","#fa9b9b","#e88087","#635063"],["#8a8780","#e6e5c4","#d6d1af","#e47267","#d7d8c5"],["#a7cd2c","#bada5f","#cee891","#e1f5c4","#50c8c6"],["#b2cba3","#e0df9f","#e7a83e","#9a736e","#ea525f"],["#aadead","#bbdead","#ccdead","#dddead","#eedead"],["#fc580c","#fc6b0a","#f8872e","#ffa927","#fdca49"],["#fa2e59","#ff703f","#f7bc05","#ecf6bb","#76bcad"],["#785d56","#be4c54","#c6b299","#e6d5c1","#fff4e3"],["#f0371a","#000000","#f7e6a6","#3e6b48","#b5b479"],["#cc2649","#992c4b","#66324c","#33384e","#003e4f"],["#ffabab","#ffdaab","#ddffab","#abe4ff","#d9abff"],["#f1e8b4","#b2bb91","#d7bf5e","#d16344","#83555e"],["#42393b","#75c9a3","#bac99a","#ffc897","#f7efa2"],["#a7321c","#ffdc68","#cc982a","#928941","#352504"],["#e0dc8b","#f6aa3d","#ed4c57","#574435","#6cc4b9"],["#000000","#001f36","#1c5560","#79ae92","#fbffcd"],["#f6c7b7","#f7a398","#fa7f77","#b42529","#000000"],["#c9d1d3","#f7f7f7","#9dd3df","#3b3737","#991818"],["#afc7b9","#ffe1c9","#fac7b4","#fca89d","#998b82"],["#fbfee5","#c91842","#98173d","#25232d","#a8e7ca"],["#f3e6bc","#f1c972","#f5886b","#72ae95","#5a3226"],["#fa8cb1","#fdc5c9","#fffee1","#cfb699","#9e6d4e"],["#674f23","#e48b69","#e1b365","#e5db84","#ffeeac"],["#dbd9b7","#c1c9c8","#a5b5ab","#949a8e","#615566"],["#f2cc67","#f38264","#f40034","#5f051f","#75baa8"],["#d9d4a8","#d15c57","#cc3747","#5c374b","#4a5f67"],["#84c1b1","#ad849a","#d64783","#fd135a","#40202a"],["#71dbd2","#eeffdb","#ade4b5","#d0eaa3","#fff18c"],["#b88000","#d56f00","#f15500","#ff2654","#ff0c71"],["#020304","#541f14","#938172","#cc9e61","#626266"],["#f4f4f4","#9ba657","#f0e5c9","#a68c69","#594433"],["#244242","#51bd9c","#a3e3b1","#ffe8b3","#ff2121"],["#1f0310","#442433","#a3d95b","#aae3ab","#f6f0bc"],["#00ccbe","#09a6a3","#9dbfaf","#edebc9","#fcf9d8"],["#4eb3de","#8de0a6","#fcf09f","#f27c7c","#de528c"],["#ff0092","#ffca1b","#b6ff00","#228dff","#ba01ff"],["#ffc870","#f7f7c6","#c8e3c5","#9cad9a","#755858"],["#4c3d31","#f18273","#f2bd76","#f4f5de","#c4ceb0"],["#84bfc3","#fff5d6","#ffb870","#d96153","#000511"],["#fffdc0","#b9d7a1","#fead26","#ca221f","#590f0c"],["#241811","#d4a979","#e3c88f","#c2c995","#a8bd95"],["#2197a3","#f71e6c","#f07868","#ebb970","#e7d3b0"],["#b2b39f","#c8c9b5","#dedfc5","#f5f7bd","#3d423c"],["#b31237","#f03813","#ff8826","#ffb914","#2c9fa3"],["#15212a","#99c9bd","#d7b89c","#feab8d","#f4c9a3"],["#002c2b","#ff3d00","#ffbc11","#0a837f","#076461"],["#f88f89","#eec276","#fbf6d0","#79c3aa","#1f0e1a"],["#bf2a23","#a6ad3c","#f0ce4e","#cf872e","#8a211d"],["#e2df9a","#ebe54d","#757449","#4b490b","#ff0051"],["#001848","#301860","#483078","#604878","#906090"],["#85a29e","#ffebbf","#f0d442","#f59330","#b22148"],["#79a687","#718063","#67594d","#4f2b38","#1d1016"],["#fe6c2b","#d43b2d","#9f102c","#340016","#020001"],["#e6e1cd","#c6d8c0","#d6b3b1","#f97992","#231b42"],["#69d0b3","#9bdab3","#b4dfb3","#cde4b3","#d9cf85"],["#75372d","#928854","#96a782","#d4ce9e","#d8523d"],["#651366","#a71a5b","#e7204e","#f76e2a","#f0c505"],["#ffffff","#a1c1be","#59554e","#f3f4e5","#e2e3d9"],["#332c26","#db1414","#e8591c","#7fb8b0","#c5e65c"],["#2f2bad","#ad2bad","#e42692","#f71568","#f7db15"],["#8e407a","#fe6962","#f9ba84","#eee097","#ffffe5"],["#45aab8","#e1d772","#faf4b1","#394240","#f06b50"],["#ccded2","#fffbd4","#f5ddbb","#e3b8b2","#a18093"],["#d1b68d","#87555c","#492d49","#51445f","#5a5c75"],["#539fa2","#72b1a4","#abccb1","#c4dbb4","#d4e2b6"],["#80d3bb","#bafdc2","#e5f3ba","#5c493d","#3a352f"],["#a8bcbd","#fcdcb3","#f88d87","#d65981","#823772"],["#ffe4aa","#fca699","#e2869b","#c9729f","#583b7e"],["#b5f4bc","#fff19e","#ffdc8a","#ffba6b","#ff6543"],["#ff4746","#e8da5e","#92b55f","#487d76","#4b4452"],["#002e34","#004443","#00755c","#00c16c","#90ff17"],["#101942","#80043a","#f60c49","#f09580","#fdf2b4"],["#0fc3e8","#0194be","#e2d397","#f07e13","#481800"],["#c9b849","#c96823","#be3100","#6f0b00","#241714"],["#9e1e4c","#ff1168","#25020f","#8f8f8f","#ececec"],["#272d4d","#b83564","#ff6a5a","#ffb350","#83b8aa"],["#c4ddd6","#d4ddd6","#e4ddd6","#e4e3cd","#ececdd"],["#4d4a4b","#f60069","#ff41a1","#ff90ab","#ffccd1"],["#1f0a1d","#334f53","#45936c","#9acc77","#e5ead4"],["#899aa1","#bda2a2","#fbbe9a","#fad889","#faf5c8"],["#4b538b","#15191d","#f7a21b","#e45635","#d60257"],["#706767","#e87474","#e6a37a","#d9c777","#c0dbab"],["#000000","#ff8830","#d1b8a0","#aeced2","#cbdcdf"],["#db5643","#1c0f0e","#70aa87","#9fb38f","#c5bd99"],["#36173d","#ff4845","#ff745f","#ffc55f","#ffec5e"],["#000706","#00272d","#134647","#0c7e7e","#bfac8b"],["#170132","#361542","#573e54","#85ae72","#bce1ab"],["#aab69b","#9e906e","#9684a3","#8870ff","#000000"],["#d8d8d8","#e2d9d8","#ecdad8","#f5dbd8","#ffdcd8"],["#c8d197","#d89845","#c54b2c","#473430","#11baac"],["#f8f8ec","#aedd2b","#066699","#0a5483","#02416d"],["#d7e8d5","#e6f0af","#e8ed76","#ffcd57","#4a3a47"],["#f1ecdf","#d4c9ad","#c7ba99","#000000","#f58723"],["#e9dfcc","#f3a36b","#cd5b51","#554865","#352630"],["#dacdbd","#f2b8a0","#ef97a3","#df5c7e","#d4486f"],["#565175","#538a95","#67b79e","#ffb727","#e4491c"],["#260729","#2a2344","#495168","#ccbd9e","#d8ccb2"],["#aef055","#e0ffc3","#25e4bc","#3f8978","#514442"],["#444444","#fcf7d1","#a9a17a","#b52c00","#8c0005"],["#f7f799","#e0d124","#f0823f","#bd374c","#443a37"],["#288d85","#b9d9b4","#d18e8f","#b05574","#f0a991"],["#dbda97","#efae54","#ef6771","#4b1d37","#977e77"],["#002930","#ffffff","#f8f0af","#ac4a00","#000000"],["#184848","#006060","#007878","#a8c030","#f0f0d8"],["#b9113f","#a8636e","#97b59d","#cfcca8","#ffe3b3"],["#c8ce13","#f8f5c1","#349e97","#2c0d1a","#de1a72"],["#913f33","#ff705f","#ffaa67","#ffdfab","#9fb9c2"],["#fee9a6","#fec0ab","#fa5894","#660860","#9380b7"],["#ed7b83","#ec8a90","#eba2a4","#e6d1ca","#eee9c7"],["#fcfdeb","#e3cebd","#c1a2a0","#725b75","#322030"],["#e04891","#e1b7ed","#f5e1e2","#d1e389","#b9de51"],["#d3c8b4","#d4f1db","#eecab1","#fe6c63","#240910"],["#43777a","#442432","#c02948","#d95b45","#ecd079"],["#edeccf","#f1c694","#dc6378","#207178","#101652"],["#95de90","#cef781","#f7c081","#ff7857","#6b6b6b"],["#edd58f","#c2bf92","#66ac92","#686077","#641f5e"],["#f4f8e6","#f2e9e6","#4a3d3d","#ff6161","#d8dec3"],["#f9ebf2","#f3e2e8","#fcd7da","#f58f9a","#3c363b"],["#736558","#fd65a0","#fef5c6","#aaf2e4","#31d5de"],["#f9f6ec","#88a1a8","#502940","#790614","#0d0c0c"],["#affbff","#d2fdfe","#fefac2","#febf97","#fe6960"],["#ffffff","#a1ac88","#757575","#464d70","#000000"],["#f2502c","#cad17a","#fcf59b","#91c494","#c42311"],["#2e1e45","#612a52","#ba3259","#ff695c","#ccbca1"],["#910142","#6c043c","#210123","#fef7d5","#0ec0c1"],["#204b5e","#426b65","#baab6a","#fbea80","#fdfac7"],["#8dc9b5","#f6f4c2","#ffc391","#ff695c","#8c315d"],["#e3ba6a","#bfa374","#6d756a","#4d686f","#364461"],["#fffab3","#a2e5d2","#63b397","#9dab34","#2c2321"],["#f7f1e1","#ffdbd7","#ffb2c1","#ce7095","#855e6e"],["#f7dece","#eed7c5","#ccccbb","#9ec4bb","#2d2e2c"],["#4180ab","#ffffff","#8ab3cf","#bdd1de","#e4ebf0"],["#43204a","#7f1e47","#422343","#c22047","#ea284b"],["#686466","#839cb5","#96d7eb","#b1e1e9","#f2e4f9"],["#ff275e","#e6bc56","#7f440a","#6a9277","#f8d9bd"],["#50232e","#f77c3e","#faba66","#fce185","#a2cca5"],["#b2d9f7","#487aa1","#3d3c3b","#7c8071","#dde3ca"],["#9c8680","#eb5e7f","#f98f6f","#dbbf6b","#c8eb6a"],["#482c21","#a73e2b","#d07e0e","#e9deb0","#2f615e"],["#e4e6c3","#88baa3","#ba1e4a","#63203d","#361f2d"],["#f7f6e4","#e2d5c1","#5f3711","#f6f6e2","#d4c098"],["#ffab03","#fc7f03","#fc3903","#d1024e","#a6026c"],["#c72546","#66424c","#768a4f","#b3c262","#d5ca98"],["#c3dfd7","#c8dfd2","#cddfcd","#d2dfc8","#d7dfc3"],["#0db2ac","#f5dd7e","#fc8d4d","#fc694d","#faba32"],["#e8de92","#810e0b","#febea3","#fce5b1","#f6f5da"],["#63594d","#b18272","#c2b291","#d6e4c3","#eae3d1"],["#dae2cb","#96c3a6","#6cb6a5","#221d34","#90425c"],["#917f6e","#efbc98","#efd2be","#efe1d1","#d9ddcd"],["#3f324d","#93c2b1","#ffeacc","#ff995e","#de1d6a"],["#f3d915","#e9e4bb","#bfd4b7","#a89907","#1a1c27"],["#042608","#2a5c0b","#808f12","#faedd9","#ea2a15"],["#dadad8","#fe6196","#ff2c69","#1ea49d","#cbe65b"],["#454545","#743455","#a22365","#d11174","#ff0084"],["#8c0e48","#80ab99","#e8dbad","#b39e58","#99822d"],["#796c86","#74aa9b","#91c68d","#ece488","#f6f5cd"],["#678d6c","#fc7d23","#fa3c08","#bd0a41","#772a53"],["#dbf73b","#c0cc39","#eb0258","#a6033f","#2b2628"],["#ffc2ce","#80b3ff","#fd6e8a","#a2122f","#693726"],["#ab505e","#d9a071","#cfc88f","#a5b090","#607873"],["#f9d423","#ede574","#e1f5c4","#add6bc","#79b7b4"],["#172c3c","#274862","#995052","#d96831","#e6b33d"],["#f8f69f","#bab986","#7c7b6c","#3e3e53","#000039"],["#f1ebeb","#eee8e8","#cacaca","#24c0eb","#5cceee"],["#e6e8e3","#d7dacf","#bec3bc","#8f9a9c","#65727a"],["#fffbf0","#968f4b","#7a6248","#ab9597","#030506"],["#efac41","#de8531","#b32900","#6c1305","#330a04"],["#72bca5","#f4ddb4","#f1ae2b","#bc0b27","#4a2512"],["#ebf2f2","#d0f2e7","#bcebdf","#ade0db","#d9dbdb"],["#f4e196","#a6bf91","#5f9982","#78576b","#400428"],["#615050","#776a6a","#ad9a6f","#f5f1e8","#fcfcfc"],["#b9340b","#cea45c","#c5be8b","#498379","#3f261c"],["#ddcaa2","#aebea3","#b97479","#d83957","#4e5c69"],["#141827","#62455b","#736681","#c1d9d0","#fffae3"],["#2f3559","#9a5071","#e394a7","#f1bbbb","#e6d8cb"],["#b877a8","#b8008a","#ff3366","#ffcc33","#ccff33"],["#171133","#581e44","#c5485a","#d4be99","#e0ffcc"],["#ff0f35","#f86254","#fea189","#f3d5a5","#bab997"],["#cfb698","#ff5d57","#dd0b64","#6f0550","#401c2a"],["#d1dbc8","#b8c2a0","#c97c7a","#da3754","#1f1106"],["#2b9eb3","#85cc9c","#bcd9a0","#edf79e","#fafad7"],["#f26b7a","#f0f2dc","#d9eb52","#8ac7de","#87796f"],["#bdbf90","#35352b","#e7e9c4","#ec6c2b","#feae4b"],["#eeccbb","#f1731f","#e03e36","#bd0d59","#730662"],["#ebe5b2","#f6f3c2","#f7c69f","#f89b7e","#b5a28b"],["#20130a","#142026","#123142","#3b657a","#e9f0c9"],["#9d9f89","#84af97","#8bc59b","#b2de93","#ccee8d"],["#ff9934","#ffc018","#f8fef4","#cde54e","#b3c631"],["#bda0a2","#ffe6db","#d1eaee","#cbc8b5","#efb0a9"],["#31827c","#95c68f","#f7e9aa","#fc8a80","#fd4e6d"],["#4d433d","#525c5a","#56877d","#8ccc81","#bade57"],["#6a3d5a","#66666e","#6d8d76","#b0c65a","#ebf74f"],["#353437","#53576b","#7a7b7c","#a39b7e","#e2c99f"],["#ff9966","#d99973","#b39980","#8c998c","#669999"],["#d1dab9","#92bea5","#6f646c","#671045","#31233e"],["#839074","#939e78","#a8a878","#061013","#cdcd76"],["#52423c","#ad5c70","#d3ad98","#edd4be","#b9c3c4"],["#ffcfad","#ffe4b8","#e6d1b1","#b8aa95","#5e5a54"],["#eb9d8d","#93865a","#a8bb9a","#c5cba6","#efd8a9"],["#a8c078","#a89048","#a84818","#61290e","#330c0c"],["#27081d","#47232c","#66997b","#a4ca8b","#d2e7aa"],["#ffe7bf","#ffc978","#c9c987","#d1a664","#c27b57"],["#000000","#ed0b65","#b2a700","#fcae11","#770493"],["#031c30","#5a3546","#b5485f","#fc6747","#fa8d3b"],["#a22c27","#4f2621","#9f8241","#ebd592","#929867"],["#8fc9b9","#d8d9c0","#d18e8f","#ab5c72","#91334f"],["#302727","#ba2d2d","#f2511b","#f2861b","#c7c730"],["#f9ded3","#fdd1b6","#fab4b6","#c7b6be","#89abb4"],["#7375a5","#21a3a3","#13c8b5","#6cf3d5","#2b364a"],["#820081","#fe59c2","#fe40b9","#fe1cac","#390039"],["#262525","#525252","#e6ddbc","#822626","#690202"],["#f3214e","#cf023b","#000000","#f4a854","#fff8bc"],["#482344","#2b5166","#429867","#fab243","#e02130"],["#a9b79e","#e8ddbd","#dba887","#c25848","#9d1d36"],["#6e9167","#ffdd8c","#ff8030","#cc4e00","#700808"],["#ff3366","#e64066","#cc4d66","#b35966","#996666"],["#331436","#7a1745","#cb4f57","#eb9961","#fcf4b6"],["#ec4b59","#9a2848","#130716","#fc8c77","#f8dfbd"],["#1f0b0c","#e7fccf","#d6c396","#b3544f","#300511"],["#f3dcb2","#facb97","#f59982","#ed616f","#f2116c"],["#f7ead9","#e1d2a9","#88b499","#619885","#67594e"],["#adeada","#bdeadb","#cdeadc","#ddeadd","#edeade"],["#666666","#abdb25","#999999","#ffffff","#cccccc"],["#210518","#3d1c33","#5e4b55","#7c917f","#93bd9a"],["#fdbf5c","#f69a0b","#d43a00","#9b0800","#1d2440"],["#fdf4b0","#a4dcb9","#5bcebf","#32b9be","#2e97b7"],["#8ba6ac","#d7d7b8","#e5e6c9","#f8f8ec","#bdcdd0"],["#295264","#fad9a6","#bd2f28","#89373d","#142433"],["#ecf8d4","#e0deab","#cb8e5f","#85685a","#0d0502"],["#a2c7bb","#dde29f","#ac8d49","#ac0d0d","#320606"],["#ff667c","#fbbaa4","#f9e5c0","#2c171c","#b6d0a0"],["#4b4b55","#f4324a","#ff516c","#fb9c5a","#fcc755"],["#ffad08","#edd75a","#73b06f","#0c8f8f","#405059"],["#a8ab84","#000000","#c6c99d","#0c0d05","#e7ebb0"],["#332e1d","#5ac7aa","#9adcb9","#fafcd3","#efeba9"],["#d45e80","#c6838c","#cfbf9e","#f7dea8","#f6be5f"],["#fce7d2","#e0dbbd","#c0ceaa","#fd8086","#eb5874"],["#fcf3e3","#ed4c87","#63526e","#6cbaa4","#f2ad5e"],["#d6d578","#b1bf63","#9dad42","#258a60","#0a3740"],["#d1f7ba","#dbdea6","#d1bd95","#8c686b","#391b4a"],["#e1e6e3","#bfd6c7","#c7bd93","#ff7876","#574b45"],["#abece4","#c4d004","#ff9f15","#fb7991","#926d40"],["#ffffff","#ff97ca","#ff348e","#be0049","#770021"],["#fb6f24","#8ca315","#5191c1","#1e6495","#0a4b75"],["#dfd0af","#e8acac","#a45785","#85586c","#a1c0a1"],["#470d3b","#7e2f56","#c0576f","#e48679","#febd84"],["#940533","#c0012a","#f5061d","#ff8800","#ffb300"],["#0c0636","#095169","#059b9a","#53ba83","#9fd86b"],["#de4c45","#d9764d","#cc9e8a","#c1c5c7","#ebdfc6"],["#d24d6c","#ad8484","#d9d5bb","#c1858f","#b05574"],["#a6988a","#88a19f","#6aabb5","#4bb4ca","#1ec3ea"],["#7f135f","#a0667a","#c2b895","#c4cab0","#c7dcca"],["#d9d9db","#b7ae8f","#978f84","#4a362f","#121210"],["#e9d7a9","#d2d09f","#d5a57f","#b56a65","#4b3132"],["#99cccc","#a8bdc2","#b8aeb8","#c79ead","#d78fa3"],["#060212","#fe5412","#fc1a1a","#795c06","#4f504f"],["#c3b68c","#6e5b54","#b94866","#afb7a0","#f4eed4"],["#5d917d","#fff9de","#cdd071","#b81c48","#632739"],["#fef0a5","#f8d28b","#e3b18b","#a78d9e","#74819d"],["#fcd8af","#fec49b","#fe9b91","#fd6084","#045071"],["#3c515d","#3d6868","#40957f","#a7c686","#fcee8c"],["#b7aea5","#f77014","#e33c08","#433d3d","#221d21"],["#2c2b4b","#a75293","#9c7a9d","#9ddacb","#f8dcb4"],["#edf3c5","#f2cc49","#b7be5f","#24b399","#2d1c28"],["#200e38","#6a0e47","#b50d57","#ff0d66","#dec790"],["#ebebab","#78bd91","#4d8f81","#9b4b54","#f22b56"],["#27191c","#2d3839","#114d4d","#6e9987","#e0e4ce"],["#f4fce2","#d3ebc7","#aabfaa","#bf9692","#fc0284"],["#941f1f","#ce6b5d","#ffefb9","#7b9971","#34502b"],["#0ccaba","#e3f5b7","#e6ae00","#d46700","#9e3f00"],["#ff7a24","#ff6d54","#f76d75","#e8728f","#c97ba5"],["#fcf6d2","#fcf6d2","#fbe2b9","#c6c39a","#281f20"],["#fcf9ce","#c4e0a6","#dea37a","#bd3737","#d54c4a"],["#f8db7e","#ec6349","#ce2340","#6f1b2c","#310a26"],["#b6d9c3","#c6a9ac","#d48299","#e64e81","#fd0a60"],["#95aa61","#121310","#f6f8ee","#d6e68a","#899752"],["#3f264d","#5d2747","#9f3647","#db4648","#fb9553"],["#f9f9e7","#505045","#161613","#c0a1ae","#c1e0e0"],["#689195","#050000","#ab8288","#cea4a6","#ffcdc5"],["#ffe6bd","#ffcc7a","#e68a6c","#8a2f62","#260016"],["#cad5ad","#f9df94","#f6a570","#e77a77","#54343f"],["#73c5aa","#c6c085","#f9a177","#f76157","#4c1b05"],["#cf3a69","#8f4254","#7caa96","#b6c474","#d4d489"],["#d46419","#b34212","#341405","#166665","#83870e"],["#1f2f3a","#98092b","#df931b","#e0daa3","#9fb982"],["#7e949e","#aec2ab","#ebcea0","#fc7765","#ff335f"],["#807070","#9a8fc8","#8dbdeb","#a5e6c8","#d9f5b5"],["#1a2b2b","#332222","#4d1a1a","#661111","#800909"],["#8d1042","#a25d47","#a08447","#97aa66","#b8b884"],["#f7f0ba","#e0dba4","#a9cba6","#7ebea3","#53a08e"],["#551bb3","#268fbe","#2cb8b2","#3ddb8f","#a9f04d"],["#0f132e","#19274e","#536d88","#b49b85","#eac195"],["#1c0b2b","#301c41","#413b6b","#5c65c0","#6f95ff"],["#0d0210","#4d3147","#866a80","#c9b7c7","#fffbff"],["#fffff7","#e9fccf","#d8fcb3","#b1fcb3","#89fcb3"],["#efece2","#81d7cd","#ff0048","#b13756","#5b1023"],["#020202","#493d3f","#bdb495","#f8f2ce","#d8d989"],["#d8f5d1","#9ddbca","#92b395","#726c81","#565164"],["#5a3938","#847b6d","#a3ab98","#d2d5af","#dfa49b"],["#88d1ca","#ded6c9","#e68a2e","#c90a00","#452b34"],["#bfe4cd","#ddb37d","#fa8331","#fb4848","#fd0a60"],["#e85a50","#feffd6","#5bb7b6","#010002","#fdf37a"],["#4a3333","#e1473f","#9a9088","#80b0ab","#dbd1b3"],["#f6eddc","#e3e5d7","#bdd6d2","#a5c8ca","#586875"],["#b68810","#301406","#7f9473","#d3c795","#c02c20"],["#423431","#f70b17","#050000","#9a8c29","#e7cba4"],["#eec77a","#e77155","#c71755","#7b3336","#5b9b9a"],["#404467","#5c627a","#a3b6a2","#b2ccaf","#fffaac"],["#939473","#4f784e","#2d5e4c","#13444d","#252326"],["#16c1c8","#49cccc","#7cd7cf","#aee1d3","#e1ecd6"],["#ef4335","#f68b36","#f2cd4f","#cae081","#88eed0"],["#524e4e","#ff2b73","#ff5a6a","#ff9563","#ffcd37"],["#d94052","#ee7e4c","#ead56c","#94c5a5","#898b75"],["#0f7d7e","#76b5a0","#fffdd1","#ff7575","#d33649"],["#3e3742","#825e65","#cc8383","#ebc4a9","#e6e0c5"],["#d0dccb","#d7c7be","#b3c5ba","#88c3b5","#6d6168"],["#f7f4e8","#daf3ea","#85e6c0","#6bb39b","#0b0b0d"],["#04394e","#00875e","#a7cc15","#f5cc17","#f56217"],["#2f1335","#620e5d","#9d007a","#ce3762","#ff6e49"],["#220114","#811628","#bd3038","#ff7e57","#f8b068"],["#fb545c","#99662d","#b7e1a1","#cdeda1","#fdf5a4"],["#33242b","#e30842","#fc4630","#ff9317","#c4ff0d"],["#f5c8bf","#e0d2c5","#cad9ca","#a7e3c1","#495453"],["#f0f0d8","#d8d8c0","#7a8370","#df8615","#f84600"],["#9e9e9e","#5ecde0","#00fff2","#c4ffc9","#e0e0e0"],["#541e35","#df5d2e","#ffb43e","#a4c972","#6bb38e"],["#58534c","#f1d3ab","#dbce79","#f95842","#0eaeab"],["#f6b149","#f8572d","#df2a33","#a22543","#6b312d"],["#ffffff","#000000","#ff006f","#ffb300","#fff538"],["#f5ea95","#fc8e5b","#fc5956","#c93e4f","#3d1734"],["#f1ffd5","#d6e6b7","#a35481","#b8136f","#ea0063"],["#cb6f84","#291d21","#5d544d","#cfccbb","#e1daca"],["#ff8d7b","#c88984","#947280","#d6b58c","#dcd392"],["#ffeec2","#fe9e8e","#f80174","#c4037a","#322c8e"],["#75727a","#997f87","#b88c87","#d39679","#f3a76d"],["#e0dcb8","#c4bc16","#918f61","#c21f40","#302c25"],["#3b3e37","#e19563","#9fb39b","#d39088","#f0ddb5"],["#22806b","#a89f1d","#facb4b","#fcaf14","#ed7615"],["#281b24","#d02941","#f57e67","#d9c9a5","#8cab94"],["#555231","#9c8c51","#bcac71","#e9db9c","#79927d"],["#d3dbd9","#a4bdbc","#ffdabf","#ffbf91","#ff9a52"],["#79aba2","#b4b943","#b7833a","#a04b26","#301e1a"],["#ebe7a7","#a7ebc9","#78b395","#917c67","#5e5953"],["#ff8591","#efaaa3","#8caaa2","#5a9b95","#44878f"],["#f5d393","#f39772","#eb6765","#261329","#1a0b2a"],["#e4f3d8","#afcacc","#ffa02e","#e80560","#331d4a"],["#af0745","#fa4069","#fe9c6b","#fcda90","#c8b080"],["#c39738","#ffff96","#7f4311","#5e4318","#361f00"],["#582770","#773d94","#943d8a","#c22760","#e81764"],["#281916","#e86786","#f4a1b5","#ffd2cb","#96b5ad"],["#d2d2d2","#58afb8","#269199","#ec225e","#020305"],["#81749c","#4d3e6b","#8daec3","#c5dfe0","#fcfce2"],["#b19676","#766862","#92bf9f","#e3d49c","#f9f0b7"],["#cbdad5","#89a7b1","#566981","#3a415a","#34344e"],["#001f21","#029b99","#ebe7b7","#de4f15","#ecc039"],["#fb6a3d","#fbe5ac","#361d20","#a2bc97","#f7cd67"],["#907071","#7bbda1","#a4d9a3","#c6d7a0","#fbdcb0"],["#8e3f65","#73738d","#72a5ae","#98e9d0","#d8ffcc"],["#d2fae2","#e6f8b1","#f6d5ad","#f6b794","#e59da0"],["#ad2003","#e0e6ae","#bdd3b6","#836868","#5f0609"],["#fe9600","#ffc501","#ffee4a","#77477e","#03001c"],["#5e3848","#666163","#a7b381","#cad197","#cde0bf"],["#2a1e1e","#503850","#aa6581","#f99fa9","#ffc5c1"],["#d1dc5a","#e0f7e0","#77f2de","#6ac5cb","#45444e"],["#400e28","#992f4d","#f25872","#f08e73","#e8b787"],["#741952","#fe3174","#f1c15d","#94bb68","#09a3ad"],["#942222","#bd3737","#d4cdad","#98c3a1","#25857d"],["#160d18","#23145b","#09456c","#026f6e","#1ca39e"],["#e5dac0","#bcb091","#9f7b51","#820d25","#4a0013"],["#cf0638","#fa6632","#fecd23","#0a996f","#0a6789"],["#ff4000","#ffefb5","#319190","#ffc803","#260d0d"],["#817a8a","#cdbbbb","#fcddc8","#fffeea","#efcaba"],["#c75f77","#fefab6","#77a493","#836177","#654b49"],["#cdb27b","#de7c04","#e4211b","#c00353","#5e2025"],["#2a0308","#924f1b","#e2ac3f","#f8ebbe","#7ba58d"],["#a2825c","#88d3ab","#f9fad2","#f5da7a","#ff985e"],["#9aedb5","#ab9a89","#a3606d","#4f2d4b","#291e40"],["#fe958f","#f3d7c2","#8bb6a3","#17a7a8","#122f51"],["#2f2e30","#e84b2c","#e6d839","#7cd164","#2eb8ac"],["#4acabb","#cbe5c0","#fcf9c2","#edc5bd","#84407b"],["#d6496c","#7db8a2","#d6dd90","#fffad3","#7e638c"],["#becec4","#688a7c","#9d7c5b","#e35241","#e49183"],["#281a1a","#4e2d28","#70454e","#ae736f","#dda8b0"],["#966c80","#96bda8","#bfd4ad","#f7d3a3","#eca36c"],["#fff4ce","#d0deb8","#ffa492","#ff7f81","#ff5c71"],["#420b58","#fc036c","#f1a20b","#8d9c09","#08807b"],["#4d4d4d","#637566","#a39c67","#d69e60","#ff704d"],["#cc8f60","#b7a075","#9eb48e","#8cc2a0","#77d4b6"],["#ec6363","#ec7963","#ecb163","#dfd487","#bdebca"],["#1c31a5","#101f78","#020f59","#010937","#000524"],["#3d2304","#7f6000","#deb069","#c41026","#3d0604"],["#efd8a4","#e8ae96","#e49d89","#e47f83","#a8c99e"],["#c0ffff","#60ecff","#fe5380","#ffbb5e","#fefefc"],["#c9ad9b","#ffbda1","#e05576","#703951","#452a37"],["#40122c","#656273","#59baa9","#d8f171","#fcffd9"],["#1a110e","#4e051c","#f7114b","#c4b432","#bcb7ab"],["#f5e1a4","#d9d593","#ee7f27","#bc162a","#302325"],["#f67968","#f67968","#f68c68","#f68c68","#f6a168"],["#8e978d","#97c4ad","#bfedbe","#e6fcd9","#cdf2d6"],["#fef1e0","#f6e6ce","#3b2e2a","#3f0632","#a47f1a"],["#2a8b8b","#75c58e","#bfff91","#dfe9a8","#ffd2bf"],["#96958a","#76877d","#88b8a9","#b2cbae","#dbddb4"],["#f0debb","#59a87d","#16453f","#091c1a","#541734"],["#8d9c9d","#e00b5b","#f5b04b","#fcdfbd","#45373e"],["#93ba85","#bda372","#f49859","#ff494b","#5e363f"],["#fff7bc","#fee78a","#f8a348","#e15244","#3a7b50"],["#eda08c","#876f55","#a19153","#b1b080","#b1ceaf"],["#c0b19e","#ffb48f","#f68b7b","#f6464a","#911440"],["#c92c2c","#cf6123","#f3c363","#f1e9bb","#5c483a"],["#faf4e0","#d2ff1f","#ffc300","#ff6a00","#3b0c2c"],["#ffffff","#5e9188","#3e5954","#253342","#232226"],["#110303","#c3062c","#ff194b","#8fa080","#708066"],["#b0da09","#f99400","#f00a5e","#b80090","#544f51"],["#eeaeaa","#daaeaa","#c6aeaa","#b2aeaa","#9eaeaa"],["#f2f2f2","#348e91","#1c5052","#213635","#0a0c0d"],["#282832","#77181e","#a92727","#c6d6d6","#dee7e7"],["#cde9ca","#ced89d","#dfba74","#e8a249","#575e55"],["#ffffc2","#f0ffc2","#e0ffc2","#d1ffc2","#c2ffc2"],["#615c5c","#e30075","#ff4a4a","#ffb319","#ebe8e8"],["#636363","#85827e","#d1b39f","#ffecd1","#ffd1b3"],["#ffffe5","#dffda7","#6ecf42","#31a252","#6b456c"],["#e0be7e","#e89d10","#db4b23","#382924","#136066"],["#670d0f","#f01945","#f36444","#ffce6f","#ffe3c9"],["#2f2c2b","#413726","#79451d","#d7621a","#fd8d32"],["#548c82","#d1ce95","#fcfade","#d55d63","#452d3d"],["#96b5a6","#fce1cb","#febeac","#4e383d","#d9434f"],["#2b2318","#524835","#56704b","#5d9e7e","#78b3a4"],["#becb7c","#84967e","#962c4c","#f05d67","#faa191"],["#d0d167","#fffcff","#e6dddc","#ff0c66","#969ba2"],["#2f003f","#be0001","#ff8006","#f3c75f","#e9cfaa"],["#b7b09e","#493443","#eb6077","#f0b49e","#f0e2be"],["#f7e6be","#e89a80","#a93545","#4d4143","#485755"],["#c3aaa5","#d76483","#ef9ca4","#ffc2bb","#f6e5cb"],["#010d23","#03223f","#038bbb","#fccb6f","#e19f41"],["#fb7968","#f9c593","#fafad4","#b0d1b2","#89b2a2"],["#3b5274","#9c667d","#ce938b","#e8cc9c","#e3e1b1"],["#d8c358","#6d0839","#d0e799","#25271e","#fbeff4"],["#d8d3ab","#b0b19f","#784d5f","#ba456a","#d04969"],["#89666d","#d2c29f","#e3a868","#f76f6d","#f2306d"],["#30182b","#f0f1bc","#60f0c0","#ff360e","#191f04"],["#4aedd7","#705647","#ed6d4a","#ffca64","#3fd97f"],["#330708","#e84624","#e87624","#e8a726","#e8d826"],["#f7c097","#829d74","#de3c2f","#eb5f07","#f18809"],["#f00065","#fa9f43","#f9fad2","#262324","#b3dbc8"],["#f46472","#f2ecc3","#fff9d8","#bed6ab","#999175"],["#c3d297","#ffffff","#c3b199","#3a2d19","#e8373e"],["#3b0503","#f67704","#f85313","#fedc57","#9ecfbc"],["#678c99","#b8c7cc","#fff1cf","#d6c292","#b59e67"],["#fdf2c5","#efe8b2","#c6d1a6","#82bfa0","#7a6f5d"],["#21203f","#fff1ce","#e7bfa5","#c5a898","#4b3c5d"],["#ef7270","#ee9f80","#f3ecbe","#cdaf7b","#59291b"],["#3a3232","#d83018","#f07848","#fdfcce","#c0d8d8"],["#352640","#92394b","#a9767a","#d1b4a2","#f1f2ce"],["#fcf7d7","#fea667","#ffe461","#c4c776","#f4d092"],["#07f9a2","#09c184","#0a8967","#0c5149","#0d192b"],["#aaaa91","#848478","#5e5e5e","#383845","#12122b"],["#fdec6f","#f2e9b0","#ecdfdb","#ede3fb","#fedfae"],["#829b86","#96b7a2","#a6aa56","#b4b969","#dfdb9c"],["#050003","#496940","#93842f","#ffa739","#fce07f"],["#7ebeb2","#d1f3db","#da9c3c","#bc1953","#7d144c"],["#6c788e","#a6aec1","#cfd5e1","#ededf2","#fcfdff"],["#471754","#991d5d","#f2445e","#f07951","#dec87a"],["#81657e","#3ea3af","#9fd9b3","#f0f6b9","#ff1d44"],["#f2ecdc","#574345","#e3dacb","#c5ffe5","#f5eed4"],["#e8608c","#71cbc4","#fff9f4","#cdd56e","#ffbd68"],["#382a2a","#ff3d3d","#ff9d7d","#e5ebbc","#8dc4b7"],["#d5d8c7","#d4d6ce","#d3d5d5","#d1d3dc","#d0d2e3"],["#622824","#2f0618","#412a9c","#1b66ff","#00cef5"],["#092b5a","#09738a","#78a890","#9ed1b7","#e7d9b4"],["#368986","#e79a32","#f84339","#d40f60","#005c81"],["#140d1a","#42142a","#ff2e5f","#ffd452","#faeeca"],["#dacdac","#f39708","#f85741","#0e9094","#1e1801"],["#a6e094","#e8e490","#f07360","#bf2a7f","#5c3d5b"],["#46294a","#ad4c6b","#e07767","#e0ae67","#d4e067"],["#10100f","#26503c","#849112","#9d4e0f","#840943"],["#ff9b8f","#ef7689","#9e6a90","#766788","#71556b"],["#2b2c30","#35313b","#453745","#613c4c","#ff1457"],["#edffb3","#99928e","#bfe3c3","#dbedc2","#fff2d4"],["#e1edd1","#aab69b","#9e906e","#b47941","#cf391d"],["#504375","#39324d","#ffe8ef","#c22557","#ed5887"],["#fffec7","#e1f5c4","#9dc9ac","#919167","#ff4e50"],["#e4ffd4","#ebe7a7","#edc68e","#a49e7e","#6e8f85"],["#3d0a49","#5015bd","#027fe9","#00caf8","#e0daf7"],["#a1a6aa","#bd928b","#de7571","#ff4e44","#282634"],["#f28a49","#f7e3b2","#e3967d","#57342d","#9dbfa4"],["#6ea49b","#d9d0ac","#6b8f0b","#7d3f60","#372b2e"],["#37ab98","#80bc96","#a6c88c","#e1ce8a","#37053b"],["#333237","#fb8351","#ffad64","#e9e2da","#add4d3"],["#d4cdc5","#5b88a5","#f4f4f2","#191013","#243a69"],["#24434b","#fc325b","#fa7f4b","#bfbc84","#63997a"],["#e5e6b8","#c6d4b8","#6ca6a3","#856a6a","#9c325c"],["#beed80","#59d999","#31ada1","#51647a","#453c5c"],["#3b331f","#ed6362","#ff8e65","#dceb5b","#58ce74"],["#d6ce8b","#8fd053","#02907d","#03453d","#2c1001"],["#402b30","#faddb4","#f4c790","#f2977e","#ba6868"],["#af162a","#95003a","#830024","#5a0e3d","#44021e"],["#e81e4a","#0b1d21","#078a85","#68baab","#edd5c5"],["#fb6066","#ffefc1","#fdd86e","#ffa463","#f66b40"],["#fa7785","#24211a","#d5d87d","#b1d4b6","#53cbbf"],["#9cd6c8","#f1ffcf","#f8df82","#fac055","#e57c3a"],["#3b4344","#51615b","#bbbd91","#f06f6b","#f12f5d"],["#b9030f","#9e0004","#70160e","#161917","#e1e3db"],["#f2e7d2","#f79eb1","#ae8fba","#4c5e91","#473469"],["#ff5252","#ff7752","#ff9a52","#ffb752","#5e405b"],["#c1ddc7","#f5e8c6","#bbcd77","#dc8051","#f4d279"],["#dfcccc","#ffd3d3","#ffa4a4","#d17878","#965959"],["#585d5d","#e06f72","#e7a17a","#e4b17d","#d1cbc0"],["#92b2a7","#6e7b8c","#b69198","#efa09b","#e7c7b0"],["#260d33","#003f69","#106b87","#157a8c","#b3aca4"],["#72bab0","#f0c69c","#d1284f","#9e0e30","#301a1a"],["#070705","#3e4b51","#6f737e","#89a09a","#c1c0ae"],["#4e3150","#c7777f","#b6dec1","#d6ecdf","#fbf6b5"],["#e4a691","#f7efd8","#c8c8a9","#556270","#273142"],["#e6626f","#efae78","#f5e19c","#a2ca8e","#66af91"],["#fbe4ae","#dacb8a","#897632","#392e0e","#6bb88a"],["#02fcf3","#a9e4cf","#cae0c8","#deddc4","#e8e7d2"],["#d0dcb3","#dabd90","#df7670","#f4065e","#837d72"],["#f5f5f5","#e9e9e9","#006666","#008584","#cccccc"],["#2eb3a1","#4fb37c","#79b36b","#a2ab5e","#bca95b"],["#594747","#6743a5","#7345d6","#2e2e2e","#bfab93"],["#efe2bf","#f5a489","#ef8184","#a76378","#a8c896"],["#4e031e","#5d2d4e","#5a4c6e","#447390","#05a1ad"],["#db3026","#e88a25","#f9e14b","#efed89","#7abf66"],["#f7f3cf","#c2e4cb","#36cecc","#27b1bf","#176585"],["#878286","#88b6a3","#bdba9e","#e2c18d","#e2bb64"],["#fe495f","#fe9d97","#fffec8","#d8fd94","#bded7e"],["#fab96b","#f19474","#ea777b","#94919a","#69a2a8"],["#322f3e","#e63c6d","#f5b494","#ede7a5","#abdecb"],["#c0b698","#647e37","#300013","#6e9a81","#d2c8a7"],["#259b9b","#6fbcaa","#b8d6b0","#feedbf","#ff1964"],["#17181f","#314d4a","#0b8770","#a6c288","#ebe68d"],["#e7ddd3","#c0c2bd","#9c9994","#29251c","#e6aa9f"],["#e72313","#fffcf7","#67b588","#65a675","#141325"],["#801245","#f4f4dd","#dcdbaf","#5d5c49","#3d3d34"],["#f8dac2","#f2a297","#f4436f","#ca1444","#142738"],["#61d4b0","#8ee696","#baf77c","#e8ff65","#ecedd5"],["#85b394","#a7ba59","#f0f0d8","#f0d890","#ae2f27"],["#a69a81","#e0d3b8","#eb9e6e","#eb6e6e","#706f6b"],["#edb886","#f1c691","#ffe498","#f9f9f1","#b9a58d"],["#87b091","#c4d4ab","#e0e0b6","#171430","#eff0d5"],["#3a3132","#0f4571","#386dbd","#009ddd","#05d3f8"],["#010300","#314c53","#5a7f78","#bbdec6","#f7f8fc"],["#02031a","#021b2b","#b10c43","#ff0841","#ebdfcc"],["#11091a","#2f2f4d","#626970","#bab195","#e8d18e"],["#463a2a","#5c4b37","#dddd92","#57c5c7","#00b5b9"],["#c9031a","#9d1722","#4a2723","#07a2a6","#ffeccb"],["#ff7c70","#f2dfb1","#b7c9a9","#674d69","#2e292e"],["#fff7e5","#fecdd0","#f8afb8","#f5a3af","#59483e"],["#5e0324","#692764","#7b7893","#7fb1a8","#94f9bf"],["#a9baae","#e6d0b1","#deb297","#c98d7b","#8a6662"],["#63072c","#910f43","#a65d53","#d59500","#f7f7a1"],["#fa3419","#f3e1b6","#7cbc9a","#23998e","#1d5e69"],["#6d165a","#a0346e","#ec5c8d","#ff8c91","#ffc4a6"],["#000000","#a69682","#7e9991","#737373","#d8770c"],["#decba0","#a0ab94","#6b9795","#594461","#6e1538"],["#240f03","#4b2409","#bd7a22","#e79022","#df621c"],["#a89d87","#bab100","#f91659","#b31d6a","#2e2444"],["#0e0036","#4c264b","#a04f62","#d2a391","#e6d7b8"],["#b9f8f0","#b6d3a5","#ee9b57","#ef2b41","#11130e"],["#1f0441","#fc1068","#fcab10","#f9ce07","#0ce3e8"],["#2a091c","#87758f","#85aab0","#a3c3b8","#e3edd2"],["#320139","#331b3b","#333e50","#5c6e6e","#f1debd"],["#211c33","#2b818c","#ffc994","#ed2860","#990069"],["#cc063e","#e83535","#fd9407","#e2d9c2","#10898b"],["#f75e50","#eac761","#e8df9c","#91c09e","#7d7769"],["#e5fec5","#c5fec6","#a3fec7","#29ffc9","#392a35"],["#e0eebd","#dae98a","#e17572","#ce1446","#2b0b16"],["#8fbfb9","#649ea7","#bddb88","#e0f3b2","#eefaa8"],["#06d9b6","#a4f479","#d4d323","#d13775","#9c3c86"],["#1a0c12","#f70a71","#ffdaa6","#ffb145","#74ab90"],["#648285","#b4a68e","#080d0d","#f3daaa","#a3c4c2"],["#a4f7d4","#9ae07d","#ada241","#a13866","#381c30"],["#fef7d5","#abee93","#2d938e","#0b4462","#f7a48b"],["#00686c","#32c2b9","#edecb3","#fad928","#ff9915"],["#cbe4ea","#ead1cb","#af9c98","#657275","#000000"],["#f3ffd2","#bff1ce","#82bda7","#6e837c","#2e0527"],["#484450","#466067","#459a96","#34baab","#c4c8c5"],["#fbffcc","#caf2be","#ddc996","#f67975","#f13565"],["#f5e3ae","#fff5d6","#e1e6d3","#b1ccc4","#4e5861"],["#e3604d","#d1c8a3","#acba9d","#7b5d5e","#c6ad71"],["#3b1a01","#a5cc7a","#dcffb6","#633b1c","#db3c6e"],["#000000","#7890a8","#304878","#181848","#f0a818"],["#ffe3b3","#ff9a52","#ff5252","#c91e5a","#3d2922"],["#bbaa9a","#849b95","#90856f","#b6554c","#d83a31"],["#e2e2b2","#49fecf","#370128","#e42355","#fe7945"],["#e4e2af","#ffa590","#e5cbb4","#fff1d7","#56413e"],["#f3b578","#f78376","#da4c66","#8f3c68","#3f3557"],["#f2ecb0","#ebb667","#d65c56","#823c3c","#1b1c26"],["#f1f7cd","#d3f7cd","#b5f7cd","#403a26","#81876c"],["#99db49","#069e8c","#211d19","#575048","#9e064a"],["#8f9044","#f8a523","#fc8020","#cf1500","#352f3d"],["#4b1623","#75233d","#c4594b","#f0b96b","#fdf57e"],["#7d677e","#4f2c4d","#360b41","#ccc9aa","#fafdea"],["#eed47f","#f2e0a0","#d8d8b2","#8cb0b0","#432332"],["#5c1b35","#d43f5d","#f2a772","#e8d890","#e2edb7"],["#40223c","#42988f","#b1c592","#f1ddba","#fb718a"],["#7e6762","#cf5a60","#f85a69","#f0b593","#e3dfbc"],["#300d28","#70615c","#8ca38b","#f7eeaa","#edb552"],["#caf729","#79dd7e","#2ecbaa","#21b6b6","#888dda"],["#f3ddb6","#d6bf93","#532728","#ced0ba","#f2efce"],["#412973","#753979","#b1476d","#eb9064","#bed9c8"],["#48586f","#ffffc0","#d6c496","#d62e2e","#283d3e"],["#68b2f8","#506ee5","#7037cd","#651f71","#1d0c20"],["#a7848b","#b88f93","#f5d5c6","#f9efd4","#b8cabe"],["#f9ebc4","#ffb391","#fc2f68","#472f5f","#08295e"],["#1f192f","#2d6073","#65b8a6","#b5e8c3","#f0f7da"],["#d3c6cc","#e2c3c6","#eecfc4","#f8e6c6","#ffffcc"],["#f8f8d6","#b3c67f","#5d7e62","#50595c","#fa3e3e"],["#723e4e","#b03851","#ef3353","#f17144","#f4b036"],["#c7003f","#f90050","#f96a00","#faab00","#daf204"],["#663333","#994d4d","#cc6666","#e6b280","#ffff99"],["#66ffff","#8cbfe6","#b380cc","#d940b3","#ff0099"],["#665c52","#74b3a7","#a3ccaf","#e6e1cf","#cc5b14"],["#53ac59","#3b8952","#0f684b","#03484c","#1c232e"],["#fea304","#909320","#125a44","#37192c","#220315"],["#c8cfae","#96b397","#525574","#5c3e62","#9b5f7b"],["#745e50","#ff948b","#fdaf8a","#fcd487","#f79585"],["#e4b302","#158fa2","#de4f3a","#722731","#bd1b43"],["#79d6b7","#ccd6bd","#d7c3ab","#f0afab","#f58696"],["#d3b390","#b8a38b","#a78b83","#c76b79","#f1416b"],["#f4fcb8","#dae681","#95a868","#452c18","#cc7254"],["#52493a","#7c8569","#a4ab80","#e8e0ae","#de733e"],["#111113","#d18681","#acbfb7","#f6ebdd","#8e6d86"],["#52baa7","#718f85","#ba5252","#fc0f52","#fc3d73"],["#edab8b","#f5ebb0","#dad061","#acc59d","#776c5a"],["#0b110d","#2c4d56","#c3aa72","#dc7612","#bd3200"],["#5a372c","#8b8b70","#98c7b0","#f0f0d8","#c94b0c"],["#ebe5ce","#ced1c0","#bad1c9","#8c162a","#660022"],["#090f13","#171f25","#752e2b","#c90a02","#f2eab7"],["#9ed99e","#f0dda6","#eb6427","#eb214e","#1a1623"],["#865a19","#c4b282","#85005b","#520647","#0e002f"],["#545454","#7b8a84","#8cbfaf","#ede7d5","#b7cc18"],["#fb573b","#4f393c","#8ea88d","#9cd0ac","#f4eb9e"],["#e5e5e5","#f1dbda","#fcd0cf","#cfbdbf","#a2a9af"],["#ffdeb3","#73bc91","#342220","#fc370c","#ff8716"],["#cccc66","#a6bf73","#80b380","#59a68c","#339999"],["#574d4f","#ffffff","#969091","#ffe999","#ffd952"],["#5f545c","#eb7072","#f5ba90","#f5e2b8","#a2caa5"],["#5e5473","#19b5a5","#ede89d","#ff6933","#ff0048"],["#edd8bb","#e2aa87","#fef7e1","#a2d3c7","#ef8e7d"],["#ceebd1","#b6deb9","#b1ccb4","#aebfaf","#a6ada7"],["#332d27","#8a0015","#e30224","#85725f","#fae1c0"],["#fdefb0","#e7a8b1","#b998b3","#77779d","#4771a3"],["#473334","#b3c8a7","#ffebb9","#e3536c","#da1a29"],["#fbb498","#f8c681","#bec47e","#9bb78f","#98908d"],["#dae5ab","#e9a385","#fa154b","#87313f","#604e48"],["#9d9382","#ffc1b2","#ffdbc8","#fff6c7","#dcd7c2"],["#cdb28a","#f9f4e3","#d4ddb1","#b1ba8e","#7a6448"],["#ff548f","#9061c2","#be80ff","#63d3ff","#02779e"],["#210210","#ee2853","#2b0215","#8f2f45","#d24d6c"],["#383939","#149c68","#38c958","#aee637","#fffedb"],["#bfe0c0","#160921","#f06e75","#f2af60","#d0d26f"],["#3b234a","#523961","#baafc4","#c3bbc9","#d4c7bf"],["#c95c7a","#de9153","#d6d644","#dcebaf","#14888b"],["#ffffea","#a795a5","#7a959e","#424e5e","#3b2b46"],["#addfd3","#eae3d0","#dbc4b6","#ffa5aa","#efd5c4"],["#f0c0a8","#f0d8a8","#a8c090","#789090","#787878"],["#f0f0f0","#d8d8d8","#c0c0a8","#604848","#484848"],["#000000","#1693a5","#d8d8c0","#f0f0d8","#ffffff"],["#ff1d44","#fbebaf","#74bf9d","#56a292","#1c8080"],["#ae0c3e","#afcca8","#f5eec3","#c7b299","#33211c"],["#ff8482","#ffb294","#f8d8a5","#91be95","#635a49"],["#000000","#8f1414","#e50e0e","#f3450f","#fcac03"],["#a88914","#91a566","#bed084","#e9e199","#faedca"],["#eddbc4","#a3c9a7","#ffb353","#ff6e4a","#5c5259"],["#413249","#ccc591","#e2b24c","#eb783f","#ff426a"],["#37193b","#e75a7a","#f59275","#f5c273","#aeb395"],["#880606","#d53d0c","#ff8207","#231d1e","#fcfcfc"],["#bad3c6","#f9d9ac","#fca483","#f18886","#7b7066"],["#e8d7a9","#8eaa94","#6b666d","#6c3751","#52223c"],["#e6e6e6","#aae6d9","#c8cbc1","#e6b0aa","#a1a1a1"],["#3b3f49","#fdfaeb","#faeddf","#f3c6b9","#f7a29e"],["#394736","#696b46","#b99555","#a8462d","#5c584c"],["#f23e02","#fef5c8","#00988d","#2c6b74","#013750"],["#f05c54","#a17457","#5c735e","#3d615b","#434247"],["#cce4d1","#d2e1a7","#d8de7d","#dedb53","#e4d829"],["#c5f7f0","#a9c2c9","#8e8ca3","#72577c","#562155"],["#fcbf6b","#a9ad94","#42302e","#f6daab","#dabd7b"],["#484848","#006465","#0f928c","#00c9d2","#beee3b"],["#e0da96","#badda3","#94e0b0","#a6b5ae","#b88bad"],["#e1c78c","#eda011","#db6516","#7a6949","#adad8e"],["#eb445b","#f5938b","#f0cdab","#f1e7c5","#b6d4bb"],["#c0d88c","#f7a472","#f07877","#fa2a3a","#0a5c5a"],["#d0cf75","#f8764e","#da2644","#90044a","#440a2a"],["#e6546b","#da8f72","#ffe792","#c9daa4","#8acbb5"],["#f8f4c4","#d5e0b5","#a5c3a7","#6d8b89","#47667b"],["#3e3433","#f07f83","#b29a78","#9eaf83","#75a480"],["#c5b89f","#feffd4","#9e2d4a","#450b1e","#21000f"],["#5e1f28","#8a2f2e","#ae5543","#f7bb75","#83764c"],["#eb7f7f","#eb9a7f","#ebb57f","#ebd07f","#ebeb7f"],["#fcbf6b","#e58634","#657a38","#afab50","#a9ccb9"],["#cee1d8","#f6eee0","#fda664","#f04842","#83563f"],["#e0d1ed","#f0b9cf","#e63c80","#c70452","#4b004c"],["#680a1d","#3f1719","#fcef9c","#e8b666","#ba2339"],["#343635","#d90057","#e88700","#77b8a6","#ffe2ba"],["#185b63","#c0261c","#ba460d","#c59538","#404040"],["#cb7ca2","#ed9da1","#c9e5af","#dceeb1","#fef9f6"],["#0d0f36","#294380","#69d2cd","#b9f1d6","#f1f6ce"],["#c9b8a8","#f8af8c","#a24d52","#5a3044","#391d34"],["#faefc2","#a4ac9d","#a27879","#a4626c","#f05d77"],["#5b1d99","#0074b4","#00b34c","#ffd41f","#fc6e3d"],["#079ea6","#1e0c42","#f0077b","#f5be58","#e3e0b3"],["#e46d29","#ba4c57","#4e3a3b","#a59571","#d0bc87"],["#f2eabc","#54736e","#194756","#080000","#ff3b58"],["#e2d9db","#f2e5f9","#d9e1df","#ff8a84","#fe6763"],["#f3d597","#b6d89c","#92ccb6","#f87887","#9e6b7c"],["#e6ac84","#ad9978","#619177","#161618","#594c2a"],["#eee5d6","#8f0006","#000000","#939185","#98a5ad"],["#bf9f88","#e8c8a1","#fce4be","#f6a68d","#f96153"],["#ffbd87","#ffd791","#f7e8a6","#d9e8ae","#bfe3c0"],["#e4e6c9","#e6dac6","#d6c3b9","#c2b48a","#b37883"],["#2b2823","#8fa691","#d4ceaa","#f9fadc","#cc3917"],["#e84d5b","#eae2cf","#b4ccb9","#26979f","#3b3b3b"],["#4d4250","#b66e6f","#cf8884","#e6a972","#f6d169"],["#11665f","#599476","#e4d673","#eb624f","#ac151c"],["#5c4152","#b4585d","#d97f76","#f7d0a9","#a1c0ae"],["#58706d","#4b5757","#7c8a6e","#b0b087","#e3e3d1"],["#f4e1b8","#9ec7b7","#acaa9b","#a5826e","#7e514b"],["#ede5ce","#fdf6e6","#ffe2ba","#f4b58a","#f7a168"],["#ff2121","#fd9a42","#c2fc63","#bcf7ef","#d7eefa"],["#806835","#f7f1cd","#6b9e8b","#a62121","#130d0d"],["#d9d766","#c5c376","#a48b86","#84567a","#643263"],["#6c3948","#ba5f6e","#cc8c82","#ded787","#f9eabf"],["#855f30","#9ec89a","#eaba68","#ff5248","#f6ffb3"],["#d3f7e9","#fcf3d2","#fbcf86","#fa7f46","#dd4538"],["#c3e6d4","#f4f0e5","#e0c4ae","#e1918e","#e15e6e"],["#d92d7a","#cd4472","#c25c6a","#b77463","#ac8c5e"]]
},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
const canvasSketch = require("canvas-sketch");
const { inverseLerp, lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes/1000.json");

const splitPalette = require("./util/splitPalette");
const interpolateColors = require("./util/interpolateColors");
const randomPointWithinCircle = require("./util/randomPointWithinCircle");
const drawCircle = require("./util/drawCircle");

random.setSeed(random.getRandomSeed());
console.log(random.getSeed());

const WIDTH = 4096;
const HEIGHT = 4096;

const settings = {
  dimensions: [WIDTH, HEIGHT],
  suffix: `-seed-${random.getSeed()}`
};

const circleMaskRadius = WIDTH / 3;
const circleMask = {
  x: WIDTH / 2,
  y: HEIGHT / 2,
  radius: circleMaskRadius
};

const { background, palette } = splitPalette(random.pick(palettes));
const colors = interpolateColors(palette, 50);

const CLUSTER_MIN = 20;
const CLUSTER_MAX = 40;
const SPREAD_MIN = -5;
const SPREAD_MAX = 5;
const MIN_COLOR_JITTER = -2;
const MAX_COLOR_JITTER = 2;
const STARTING_RADIUS = 6;
const MIN_DENSITY = 0.5;
const MAX_DENSITY = 0.8;
const PROBABILITY_TO_RENDER = 0.2;

const generate = () => {
  const particleCount = WIDTH / random.range(MIN_DENSITY, MAX_DENSITY);
  const points = [];

  while (points.length < particleCount) {
    const { x, y, radius } = randomPointWithinCircle(
      STARTING_RADIUS,
      WIDTH,
      HEIGHT,
      circleMask
    );

    const noise =
      random.noise2D(x / particleCount - 1, y / particleCount - 1) * 500;
    const cluster = Math.max(
      random.range(CLUSTER_MIN, CLUSTER_MAX),
      Math.round(inverseLerp(-1, 1, noise))
    );

    // based on the y position of the particle, pick the nearest colour from
    // our interpolated array of colours + a little bit of noise for texture
    const colorIndex = Math.round(
      lerp(0, colors.length, y / HEIGHT) +
        random.range(MIN_COLOR_JITTER, MAX_COLOR_JITTER)
    );
    const color = colors[Math.max(0, Math.min(colorIndex, colors.length))];

    const particles = [];

    // Each poinnt has a trail of particles
    for (let i = 1; i < cluster; i++) {
      // for each sub-particle on the trail randomly offset it with an index modifier
      const offset =
        random.range(SPREAD_MIN - i / cluster, SPREAD_MAX + i / cluster) * i;

      particles.push({
        x: x + offset,
        y,
        radius: Math.max(0.3, radius - radius / cluster * i),
        color: color
      });
    }

    points.push({
      x,
      y,
      radius,
      offset: random.range(SPREAD_MIN / cluster, SPREAD_MAX / cluster),
      particles,
      color
    });
  }

  return points;
};

const points = generate(WIDTH, HEIGHT, circleMask).filter(
  () => random.value() < PROBABILITY_TO_RENDER
);

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    points.forEach(point => {
      point.particles.forEach(particle => {
        drawCircle(particle, context);
      });
    });
  };
};

canvasSketch(sketch, settings);

},{"./util/drawCircle":11,"./util/interpolateColors":12,"./util/randomPointWithinCircle":14,"./util/splitPalette":15,"canvas-sketch":3,"canvas-sketch-util/math":1,"canvas-sketch-util/random":2,"nice-color-palettes/1000.json":7}],11:[function(require,module,exports){
module.exports = (circle, context) => {
  context.beginPath();
  if (circle.color) context.fillStyle = circle.color;
  context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
  context.fill();
};

},{}],12:[function(require,module,exports){
const lerpColor = require("./lerpHexColor");

module.exports = (palette, steps) => {
  const stepsBetweenColours = (steps - palette.length) / (palette.length - 1);
  const colors = [];

  for (let color = 0; color < palette.length; color++) {
    colors.push(palette[color]);
    if (!palette[color + 1]) break;
    for (let step = 0; step < stepsBetweenColours; step++) {
      const newColor = lerpColor(
        palette[color],
        palette[color + 1],
        step / stepsBetweenColours
      );
      colors.push(newColor);
    }
  }

  return colors;
};

},{"./lerpHexColor":13}],13:[function(require,module,exports){
module.exports = (a, b, amount) => {
  const ah = parseInt(a.replace(/#/g, ""), 16);
  const ar = ah >> 16;
  const ag = (ah >> 8) & 0xff;
  const ab = ah & 0xff;
  const bh = parseInt(b.replace(/#/g, ""), 16);
  const br = bh >> 16;
  const bg = (bh >> 8) & 0xff;
  const bb = bh & 0xff;
  const rr = ar + amount * (br - ar);
  const rg = ag + amount * (bg - ag);
  const rb = ab + amount * (bb - ab);

  return (
    "#" + (((1 << 24) + (rr << 16) + (rg << 8) + rb) | 0).toString(16).slice(1)
  );
};

},{}],14:[function(require,module,exports){
const random = require("canvas-sketch-util/random");

const isPointWithinCircle = (point, circleMask, tolerance = 20) => {
  var a = point.radius + circleMask.radius - tolerance;
  var x = point.x - circleMask.x;
  var y = point.y - circleMask.y;

  return a >= Math.sqrt(x * x + y * y);
};

const randomPointWithinCircle = (
  radius,
  canvasWidth,
  canvasHeight,
  circleMask
) => {
  const point = {
    x: random.range(0, canvasWidth),
    y: random.range(0, canvasHeight),
    radius
  };
  if (isPointWithinCircle(point, circleMask)) return point;

  return randomPointWithinCircle(radius, canvasWidth, canvasHeight, circleMask);
};

module.exports = randomPointWithinCircle;

},{"canvas-sketch-util/random":2}],15:[function(require,module,exports){
/**
 * Copyright 2019 Matt DesLauriers
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
const colorContrast = require("color-contrast");

module.exports = palette => {
  const maxContrast = true;
  let bestContrastIndex = 0;
  let bestContrast = maxContrast ? -Infinity : Infinity;
  for (let i = 0; i < palette.length; i++) {
    const a = palette[i];
    let sum = 0;
    // Get the sum of contrasts from this to all others
    for (let j = 0; j < palette.length; j++) {
      const b = palette[j];
      if (a === b) continue;
      sum += colorContrast(a, b);
    }
    if (maxContrast ? sum > bestContrast : sum < bestContrast) {
      bestContrast = sum;
      bestContrastIndex = i;
    }
  }
  let colors = palette.slice();
  const background = colors.splice(bestContrastIndex, 1);
  return {
    background,
    palette: colors
  };
};

},{"color-contrast":4}],16:[function(require,module,exports){
(function (global){

global.CANVAS_SKETCH_DEFAULT_STORAGE_KEY = window.location.href;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[10,16])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC11dGlsL21hdGguanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC11dGlsL3JhbmRvbS5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2Rpc3Qvbm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvbm9kZV9tb2R1bGVzL2RlZmluZWQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL25vZGVfbW9kdWxlcy9vYmplY3QtYXNzaWduL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvZGlzdC9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9ub2RlX21vZHVsZXMvcmlnaHQtbm93L2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL25vZGVfbW9kdWxlcy9pcy1wcm9taXNlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvZGlzdC9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9ub2RlX21vZHVsZXMvaXMtZG9tL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvZGlzdC9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9saWIvdXRpbC5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2Rpc3Qvbm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvbm9kZV9tb2R1bGVzL2RlZXAtZXF1YWwvbGliL2tleXMuanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL25vZGVfbW9kdWxlcy9kZWVwLWVxdWFsL2xpYi9pc19hcmd1bWVudHMuanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL25vZGVfbW9kdWxlcy9kZWVwLWVxdWFsL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvZGlzdC9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9ub2RlX21vZHVsZXMvZGF0ZWZvcm1hdC9saWIvZGF0ZWZvcm1hdC5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2Rpc3Qvbm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvbm9kZV9tb2R1bGVzL3JlcGVhdC1zdHJpbmcvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL25vZGVfbW9kdWxlcy9wYWQtbGVmdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2Rpc3Qvbm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvbGliL3NhdmUuanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2xpYi9hY2Nlc3NpYmlsaXR5LmpzIiwibm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvZGlzdC9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9saWIvY29yZS9rZXlib2FyZFNob3J0Y3V0cy5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2Rpc3Qvbm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvbGliL3BhcGVyLXNpemVzLmpzIiwibm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvZGlzdC9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9saWIvZGlzdGFuY2VzLmpzIiwibm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvZGlzdC9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9saWIvY29yZS9yZXNpemVDYW52YXMuanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL25vZGVfbW9kdWxlcy9nZXQtY2FudmFzLWNvbnRleHQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2xpYi9jb3JlL2NyZWF0ZUNhbnZhcy5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2Rpc3Qvbm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvbGliL2NvcmUvU2tldGNoTWFuYWdlci5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2Rpc3Qvbm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvbGliL2NhbnZhcy1za2V0Y2guanMiLCJub2RlX21vZHVsZXMvY29sb3ItY29udHJhc3QvZGlzdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb252ZXJ0LWxlbmd0aC9jb252ZXJ0LWxlbmd0aC5qcyIsIm5vZGVfbW9kdWxlcy9kZWZpbmVkL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL25pY2UtY29sb3ItcGFsZXR0ZXMvMTAwMC5qc29uIiwibm9kZV9tb2R1bGVzL3NlZWQtcmFuZG9tL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZXgtbm9pc2Uvc2ltcGxleC1ub2lzZS5qcyIsInNyYy9kaXNwZXJzaW9uMi5qcyIsInNyYy91dGlsL2RyYXdDaXJjbGUuanMiLCJzcmMvdXRpbC9pbnRlcnBvbGF0ZUNvbG9ycy5qcyIsInNyYy91dGlsL2xlcnBIZXhDb2xvci5qcyIsInNyYy91dGlsL3JhbmRvbVBvaW50V2l0aGluQ2lyY2xlLmpzIiwic3JjL3V0aWwvc3BsaXRQYWxldHRlLmpzIiwiY2FudmFzLXNrZXRjaC1jbGkvaW5qZWN0ZWQvc3RvcmFnZS1rZXkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7SUN4VUEsV0FB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqeUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzdLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDemRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNqQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwidmFyIGRlZmluZWQgPSByZXF1aXJlKCdkZWZpbmVkJyk7XG52YXIgRVBTSUxPTiA9IE51bWJlci5FUFNJTE9OO1xuXG5mdW5jdGlvbiBjbGFtcCAodmFsdWUsIG1pbiwgbWF4KSB7XG4gIHJldHVybiBtaW4gPCBtYXhcbiAgICA/ICh2YWx1ZSA8IG1pbiA/IG1pbiA6IHZhbHVlID4gbWF4ID8gbWF4IDogdmFsdWUpXG4gICAgOiAodmFsdWUgPCBtYXggPyBtYXggOiB2YWx1ZSA+IG1pbiA/IG1pbiA6IHZhbHVlKTtcbn1cblxuZnVuY3Rpb24gY2xhbXAwMSAodikge1xuICByZXR1cm4gY2xhbXAodiwgMCwgMSk7XG59XG5cbmZ1bmN0aW9uIGxlcnAgKG1pbiwgbWF4LCB0KSB7XG4gIHJldHVybiBtaW4gKiAoMSAtIHQpICsgbWF4ICogdDtcbn1cblxuZnVuY3Rpb24gaW52ZXJzZUxlcnAgKG1pbiwgbWF4LCB0KSB7XG4gIGlmIChNYXRoLmFicyhtaW4gLSBtYXgpIDwgRVBTSUxPTikgcmV0dXJuIDA7XG4gIGVsc2UgcmV0dXJuICh0IC0gbWluKSAvIChtYXggLSBtaW4pO1xufVxuXG5mdW5jdGlvbiBzbW9vdGhzdGVwIChtaW4sIG1heCwgdCkge1xuICB2YXIgeCA9IGNsYW1wKGludmVyc2VMZXJwKG1pbiwgbWF4LCB0KSwgMCwgMSk7XG4gIHJldHVybiB4ICogeCAqICgzIC0gMiAqIHgpO1xufVxuXG5mdW5jdGlvbiB0b0Zpbml0ZSAobiwgZGVmYXVsdFZhbHVlKSB7XG4gIGRlZmF1bHRWYWx1ZSA9IGRlZmluZWQoZGVmYXVsdFZhbHVlLCAwKTtcbiAgcmV0dXJuIHR5cGVvZiBuID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZShuKSA/IG4gOiBkZWZhdWx0VmFsdWU7XG59XG5cbmZ1bmN0aW9uIGV4cGFuZFZlY3RvciAoZGltcykge1xuICBpZiAodHlwZW9mIGRpbXMgIT09ICdudW1iZXInKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBkaW1zIGFyZ3VtZW50Jyk7XG4gIHJldHVybiBmdW5jdGlvbiAocCwgZGVmYXVsdFZhbHVlKSB7XG4gICAgZGVmYXVsdFZhbHVlID0gZGVmaW5lZChkZWZhdWx0VmFsdWUsIDApO1xuICAgIHZhciBzY2FsYXI7XG4gICAgaWYgKHAgPT0gbnVsbCkge1xuICAgICAgLy8gTm8gdmVjdG9yLCBjcmVhdGUgYSBkZWZhdWx0IG9uZVxuICAgICAgc2NhbGFyID0gZGVmYXVsdFZhbHVlO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHAgPT09ICdudW1iZXInICYmIGlzRmluaXRlKHApKSB7XG4gICAgICAvLyBFeHBhbmQgc2luZ2xlIGNoYW5uZWwgdG8gbXVsdGlwbGUgdmVjdG9yXG4gICAgICBzY2FsYXIgPSBwO1xuICAgIH1cblxuICAgIHZhciBvdXQgPSBbXTtcbiAgICB2YXIgaTtcbiAgICBpZiAoc2NhbGFyID09IG51bGwpIHtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBkaW1zOyBpKyspIHtcbiAgICAgICAgb3V0W2ldID0gdG9GaW5pdGUocFtpXSwgZGVmYXVsdFZhbHVlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChpID0gMDsgaSA8IGRpbXM7IGkrKykge1xuICAgICAgICBvdXRbaV0gPSBzY2FsYXI7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGxlcnBBcnJheSAobWluLCBtYXgsIHQsIG91dCkge1xuICBvdXQgPSBvdXQgfHwgW107XG4gIGlmIChtaW4ubGVuZ3RoICE9PSBtYXgubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignbWluIGFuZCBtYXggYXJyYXkgYXJlIGV4cGVjdGVkIHRvIGhhdmUgdGhlIHNhbWUgbGVuZ3RoJyk7XG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtaW4ubGVuZ3RoOyBpKyspIHtcbiAgICBvdXRbaV0gPSBsZXJwKG1pbltpXSwgbWF4W2ldLCB0KTtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG5mdW5jdGlvbiBuZXdBcnJheSAobiwgaW5pdGlhbFZhbHVlKSB7XG4gIG4gPSBkZWZpbmVkKG4sIDApO1xuICBpZiAodHlwZW9mIG4gIT09ICdudW1iZXInKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBuIGFyZ3VtZW50IHRvIGJlIGEgbnVtYmVyJyk7XG4gIHZhciBvdXQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyBpKyspIG91dC5wdXNoKGluaXRpYWxWYWx1ZSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbmZ1bmN0aW9uIGxpbnNwYWNlIChuLCBvcHRzKSB7XG4gIG4gPSBkZWZpbmVkKG4sIDApO1xuICBpZiAodHlwZW9mIG4gIT09ICdudW1iZXInKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBuIGFyZ3VtZW50IHRvIGJlIGEgbnVtYmVyJyk7XG4gIG9wdHMgPSBvcHRzIHx8IHt9O1xuICBpZiAodHlwZW9mIG9wdHMgPT09ICdib29sZWFuJykge1xuICAgIG9wdHMgPSB7IGVuZHBvaW50OiB0cnVlIH07XG4gIH1cbiAgdmFyIG9mZnNldCA9IGRlZmluZWQob3B0cy5vZmZzZXQsIDApO1xuICBpZiAob3B0cy5lbmRwb2ludCkge1xuICAgIHJldHVybiBuZXdBcnJheShuKS5tYXAoZnVuY3Rpb24gKF8sIGkpIHtcbiAgICAgIHJldHVybiBuIDw9IDEgPyAwIDogKChpICsgb2Zmc2V0KSAvIChuIC0gMSkpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuZXdBcnJheShuKS5tYXAoZnVuY3Rpb24gKF8sIGkpIHtcbiAgICAgIHJldHVybiAoaSArIG9mZnNldCkgLyBuO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGxlcnBGcmFtZXMgKHZhbHVlcywgdCwgb3V0KSB7XG4gIHQgPSBjbGFtcCh0LCAwLCAxKTtcblxuICB2YXIgbGVuID0gdmFsdWVzLmxlbmd0aCAtIDE7XG4gIHZhciB3aG9sZSA9IHQgKiBsZW47XG4gIHZhciBmcmFtZSA9IE1hdGguZmxvb3Iod2hvbGUpO1xuICB2YXIgZnJhY3QgPSB3aG9sZSAtIGZyYW1lO1xuXG4gIHZhciBuZXh0RnJhbWUgPSBNYXRoLm1pbihmcmFtZSArIDEsIGxlbik7XG4gIHZhciBhID0gdmFsdWVzW2ZyYW1lICUgdmFsdWVzLmxlbmd0aF07XG4gIHZhciBiID0gdmFsdWVzW25leHRGcmFtZSAlIHZhbHVlcy5sZW5ndGhdO1xuICBpZiAodHlwZW9mIGEgPT09ICdudW1iZXInICYmIHR5cGVvZiBiID09PSAnbnVtYmVyJykge1xuICAgIHJldHVybiBsZXJwKGEsIGIsIGZyYWN0KTtcbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGEpICYmIEFycmF5LmlzQXJyYXkoYikpIHtcbiAgICByZXR1cm4gbGVycEFycmF5KGEsIGIsIGZyYWN0LCBvdXQpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01pc21hdGNoIGluIHZhbHVlIHR5cGUgb2YgdHdvIGFycmF5IGVsZW1lbnRzOiAnICsgZnJhbWUgKyAnIGFuZCAnICsgbmV4dEZyYW1lKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBtb2QgKGEsIGIpIHtcbiAgcmV0dXJuICgoYSAlIGIpICsgYikgJSBiO1xufVxuXG5mdW5jdGlvbiBkZWdUb1JhZCAobikge1xuICByZXR1cm4gbiAqIE1hdGguUEkgLyAxODA7XG59XG5cbmZ1bmN0aW9uIHJhZFRvRGVnIChuKSB7XG4gIHJldHVybiBuICogMTgwIC8gTWF0aC5QSTtcbn1cblxuZnVuY3Rpb24gZnJhY3QgKG4pIHtcbiAgcmV0dXJuIG4gLSBNYXRoLmZsb29yKG4pO1xufVxuXG5mdW5jdGlvbiBzaWduIChuKSB7XG4gIGlmIChuID4gMCkgcmV0dXJuIDE7XG4gIGVsc2UgaWYgKG4gPCAwKSByZXR1cm4gLTE7XG4gIGVsc2UgcmV0dXJuIDA7XG59XG5cbmZ1bmN0aW9uIHdyYXAgKHZhbHVlLCBmcm9tLCB0bykge1xuICBpZiAodHlwZW9mIGZyb20gIT09ICdudW1iZXInIHx8IHR5cGVvZiB0byAhPT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNdXN0IHNwZWNpZnkgXCJ0b1wiIGFuZCBcImZyb21cIiBhcmd1bWVudHMgYXMgbnVtYmVycycpO1xuICB9XG4gIC8vIGFsZ29yaXRobSBmcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzU4NTI2MjgvNTk5ODg0XG4gIGlmIChmcm9tID4gdG8pIHtcbiAgICB2YXIgdCA9IGZyb207XG4gICAgZnJvbSA9IHRvO1xuICAgIHRvID0gdDtcbiAgfVxuICB2YXIgY3ljbGUgPSB0byAtIGZyb207XG4gIGlmIChjeWNsZSA9PT0gMCkge1xuICAgIHJldHVybiB0bztcbiAgfVxuICByZXR1cm4gdmFsdWUgLSBjeWNsZSAqIE1hdGguZmxvb3IoKHZhbHVlIC0gZnJvbSkgLyBjeWNsZSk7XG59XG5cbi8vIFNwZWNpZmljIGZ1bmN0aW9uIGZyb20gVW5pdHkgLyBvZk1hdGgsIG5vdCBzdXJlIGl0cyBuZWVkZWQ/XG4vLyBmdW5jdGlvbiBsZXJwV3JhcCAoYSwgYiwgdCwgbWluLCBtYXgpIHtcbi8vICAgcmV0dXJuIHdyYXAoYSArIHdyYXAoYiAtIGEsIG1pbiwgbWF4KSAqIHQsIG1pbiwgbWF4KVxuLy8gfVxuXG5mdW5jdGlvbiBwaW5nUG9uZyAodCwgbGVuZ3RoKSB7XG4gIHQgPSBtb2QodCwgbGVuZ3RoICogMik7XG4gIHJldHVybiBsZW5ndGggLSBNYXRoLmFicyh0IC0gbGVuZ3RoKTtcbn1cblxuZnVuY3Rpb24gZGFtcCAoYSwgYiwgbGFtYmRhLCBkdCkge1xuICByZXR1cm4gbGVycChhLCBiLCAxIC0gTWF0aC5leHAoLWxhbWJkYSAqIGR0KSk7XG59XG5cbmZ1bmN0aW9uIGRhbXBBcnJheSAoYSwgYiwgbGFtYmRhLCBkdCwgb3V0KSB7XG4gIG91dCA9IG91dCB8fCBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgb3V0W2ldID0gZGFtcChhW2ldLCBiW2ldLCBsYW1iZGEsIGR0KTtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG5mdW5jdGlvbiBtYXBSYW5nZSAodmFsdWUsIGlucHV0TWluLCBpbnB1dE1heCwgb3V0cHV0TWluLCBvdXRwdXRNYXgsIGNsYW1wKSB7XG4gIC8vIFJlZmVyZW5jZTpcbiAgLy8gaHR0cHM6Ly9vcGVuZnJhbWV3b3Jrcy5jYy9kb2N1bWVudGF0aW9uL21hdGgvb2ZNYXRoL1xuICBpZiAoTWF0aC5hYnMoaW5wdXRNaW4gLSBpbnB1dE1heCkgPCBFUFNJTE9OKSB7XG4gICAgcmV0dXJuIG91dHB1dE1pbjtcbiAgfSBlbHNlIHtcbiAgICB2YXIgb3V0VmFsID0gKCh2YWx1ZSAtIGlucHV0TWluKSAvIChpbnB1dE1heCAtIGlucHV0TWluKSAqIChvdXRwdXRNYXggLSBvdXRwdXRNaW4pICsgb3V0cHV0TWluKTtcbiAgICBpZiAoY2xhbXApIHtcbiAgICAgIGlmIChvdXRwdXRNYXggPCBvdXRwdXRNaW4pIHtcbiAgICAgICAgaWYgKG91dFZhbCA8IG91dHB1dE1heCkgb3V0VmFsID0gb3V0cHV0TWF4O1xuICAgICAgICBlbHNlIGlmIChvdXRWYWwgPiBvdXRwdXRNaW4pIG91dFZhbCA9IG91dHB1dE1pbjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChvdXRWYWwgPiBvdXRwdXRNYXgpIG91dFZhbCA9IG91dHB1dE1heDtcbiAgICAgICAgZWxzZSBpZiAob3V0VmFsIDwgb3V0cHV0TWluKSBvdXRWYWwgPSBvdXRwdXRNaW47XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvdXRWYWw7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1vZDogbW9kLFxuICBmcmFjdDogZnJhY3QsXG4gIHNpZ246IHNpZ24sXG4gIGRlZ1RvUmFkOiBkZWdUb1JhZCxcbiAgcmFkVG9EZWc6IHJhZFRvRGVnLFxuICB3cmFwOiB3cmFwLFxuICBwaW5nUG9uZzogcGluZ1BvbmcsXG4gIGxpbnNwYWNlOiBsaW5zcGFjZSxcbiAgbGVycDogbGVycCxcbiAgbGVycEFycmF5OiBsZXJwQXJyYXksXG4gIGludmVyc2VMZXJwOiBpbnZlcnNlTGVycCxcbiAgbGVycEZyYW1lczogbGVycEZyYW1lcyxcbiAgY2xhbXA6IGNsYW1wLFxuICBjbGFtcDAxOiBjbGFtcDAxLFxuICBzbW9vdGhzdGVwOiBzbW9vdGhzdGVwLFxuICBkYW1wOiBkYW1wLFxuICBkYW1wQXJyYXk6IGRhbXBBcnJheSxcbiAgbWFwUmFuZ2U6IG1hcFJhbmdlLFxuICBleHBhbmQyRDogZXhwYW5kVmVjdG9yKDIpLFxuICBleHBhbmQzRDogZXhwYW5kVmVjdG9yKDMpLFxuICBleHBhbmQ0RDogZXhwYW5kVmVjdG9yKDQpXG59O1xuIiwidmFyIHNlZWRSYW5kb20gPSByZXF1aXJlKCdzZWVkLXJhbmRvbScpO1xudmFyIFNpbXBsZXhOb2lzZSA9IHJlcXVpcmUoJ3NpbXBsZXgtbm9pc2UnKTtcbnZhciBkZWZpbmVkID0gcmVxdWlyZSgnZGVmaW5lZCcpO1xuXG5mdW5jdGlvbiBjcmVhdGVSYW5kb20gKGRlZmF1bHRTZWVkKSB7XG4gIGRlZmF1bHRTZWVkID0gZGVmaW5lZChkZWZhdWx0U2VlZCwgbnVsbCk7XG4gIHZhciBkZWZhdWx0UmFuZG9tID0gTWF0aC5yYW5kb207XG4gIHZhciBjdXJyZW50U2VlZDtcbiAgdmFyIGN1cnJlbnRSYW5kb207XG4gIHZhciBub2lzZUdlbmVyYXRvcjtcbiAgdmFyIF9uZXh0R2F1c3NpYW4gPSBudWxsO1xuICB2YXIgX2hhc05leHRHYXVzc2lhbiA9IGZhbHNlO1xuXG4gIHNldFNlZWQoZGVmYXVsdFNlZWQpO1xuXG4gIHJldHVybiB7XG4gICAgdmFsdWU6IHZhbHVlLFxuICAgIGNyZWF0ZVJhbmRvbTogZnVuY3Rpb24gKGRlZmF1bHRTZWVkKSB7XG4gICAgICByZXR1cm4gY3JlYXRlUmFuZG9tKGRlZmF1bHRTZWVkKTtcbiAgICB9LFxuICAgIHNldFNlZWQ6IHNldFNlZWQsXG4gICAgZ2V0U2VlZDogZ2V0U2VlZCxcbiAgICBnZXRSYW5kb21TZWVkOiBnZXRSYW5kb21TZWVkLFxuICAgIHZhbHVlTm9uWmVybzogdmFsdWVOb25aZXJvLFxuICAgIHBlcm11dGVOb2lzZTogcGVybXV0ZU5vaXNlLFxuICAgIG5vaXNlMUQ6IG5vaXNlMUQsXG4gICAgbm9pc2UyRDogbm9pc2UyRCxcbiAgICBub2lzZTNEOiBub2lzZTNELFxuICAgIG5vaXNlNEQ6IG5vaXNlNEQsXG4gICAgc2lnbjogc2lnbixcbiAgICBib29sZWFuOiBib29sZWFuLFxuICAgIGNoYW5jZTogY2hhbmNlLFxuICAgIHJhbmdlOiByYW5nZSxcbiAgICByYW5nZUZsb29yOiByYW5nZUZsb29yLFxuICAgIHBpY2s6IHBpY2ssXG4gICAgc2h1ZmZsZTogc2h1ZmZsZSxcbiAgICBvbkNpcmNsZTogb25DaXJjbGUsXG4gICAgaW5zaWRlQ2lyY2xlOiBpbnNpZGVDaXJjbGUsXG4gICAgb25TcGhlcmU6IG9uU3BoZXJlLFxuICAgIGluc2lkZVNwaGVyZTogaW5zaWRlU3BoZXJlLFxuICAgIHF1YXRlcm5pb246IHF1YXRlcm5pb24sXG4gICAgd2VpZ2h0ZWQ6IHdlaWdodGVkLFxuICAgIHdlaWdodGVkU2V0OiB3ZWlnaHRlZFNldCxcbiAgICB3ZWlnaHRlZFNldEluZGV4OiB3ZWlnaHRlZFNldEluZGV4LFxuICAgIGdhdXNzaWFuOiBnYXVzc2lhblxuICB9O1xuXG4gIGZ1bmN0aW9uIHNldFNlZWQgKHNlZWQsIG9wdCkge1xuICAgIGlmICh0eXBlb2Ygc2VlZCA9PT0gJ251bWJlcicgfHwgdHlwZW9mIHNlZWQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjdXJyZW50U2VlZCA9IHNlZWQ7XG4gICAgICBjdXJyZW50UmFuZG9tID0gc2VlZFJhbmRvbShjdXJyZW50U2VlZCwgb3B0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3VycmVudFNlZWQgPSB1bmRlZmluZWQ7XG4gICAgICBjdXJyZW50UmFuZG9tID0gZGVmYXVsdFJhbmRvbTtcbiAgICB9XG4gICAgbm9pc2VHZW5lcmF0b3IgPSBjcmVhdGVOb2lzZSgpO1xuICAgIF9uZXh0R2F1c3NpYW4gPSBudWxsO1xuICAgIF9oYXNOZXh0R2F1c3NpYW4gPSBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHZhbHVlICgpIHtcbiAgICByZXR1cm4gY3VycmVudFJhbmRvbSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gdmFsdWVOb25aZXJvICgpIHtcbiAgICB2YXIgdSA9IDA7XG4gICAgd2hpbGUgKHUgPT09IDApIHUgPSB2YWx1ZSgpO1xuICAgIHJldHVybiB1O1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0U2VlZCAoKSB7XG4gICAgcmV0dXJuIGN1cnJlbnRTZWVkO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UmFuZG9tU2VlZCAoKSB7XG4gICAgdmFyIHNlZWQgPSBTdHJpbmcoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwMDAwMCkpO1xuICAgIHJldHVybiBzZWVkO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlTm9pc2UgKCkge1xuICAgIHJldHVybiBuZXcgU2ltcGxleE5vaXNlKGN1cnJlbnRSYW5kb20pO1xuICB9XG5cbiAgZnVuY3Rpb24gcGVybXV0ZU5vaXNlICgpIHtcbiAgICBub2lzZUdlbmVyYXRvciA9IGNyZWF0ZU5vaXNlKCk7XG4gIH1cblxuICBmdW5jdGlvbiBub2lzZTFEICh4LCBmcmVxdWVuY3ksIGFtcGxpdHVkZSkge1xuICAgIGlmICghaXNGaW5pdGUoeCkpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ggY29tcG9uZW50IGZvciBub2lzZSgpIG11c3QgYmUgZmluaXRlJyk7XG4gICAgZnJlcXVlbmN5ID0gZGVmaW5lZChmcmVxdWVuY3ksIDEpO1xuICAgIGFtcGxpdHVkZSA9IGRlZmluZWQoYW1wbGl0dWRlLCAxKTtcbiAgICByZXR1cm4gYW1wbGl0dWRlICogbm9pc2VHZW5lcmF0b3Iubm9pc2UyRCh4ICogZnJlcXVlbmN5LCAwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vaXNlMkQgKHgsIHksIGZyZXF1ZW5jeSwgYW1wbGl0dWRlKSB7XG4gICAgaWYgKCFpc0Zpbml0ZSh4KSkgdGhyb3cgbmV3IFR5cGVFcnJvcigneCBjb21wb25lbnQgZm9yIG5vaXNlKCkgbXVzdCBiZSBmaW5pdGUnKTtcbiAgICBpZiAoIWlzRmluaXRlKHkpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCd5IGNvbXBvbmVudCBmb3Igbm9pc2UoKSBtdXN0IGJlIGZpbml0ZScpO1xuICAgIGZyZXF1ZW5jeSA9IGRlZmluZWQoZnJlcXVlbmN5LCAxKTtcbiAgICBhbXBsaXR1ZGUgPSBkZWZpbmVkKGFtcGxpdHVkZSwgMSk7XG4gICAgcmV0dXJuIGFtcGxpdHVkZSAqIG5vaXNlR2VuZXJhdG9yLm5vaXNlMkQoeCAqIGZyZXF1ZW5jeSwgeSAqIGZyZXF1ZW5jeSk7XG4gIH1cblxuICBmdW5jdGlvbiBub2lzZTNEICh4LCB5LCB6LCBmcmVxdWVuY3ksIGFtcGxpdHVkZSkge1xuICAgIGlmICghaXNGaW5pdGUoeCkpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ggY29tcG9uZW50IGZvciBub2lzZSgpIG11c3QgYmUgZmluaXRlJyk7XG4gICAgaWYgKCFpc0Zpbml0ZSh5KSkgdGhyb3cgbmV3IFR5cGVFcnJvcigneSBjb21wb25lbnQgZm9yIG5vaXNlKCkgbXVzdCBiZSBmaW5pdGUnKTtcbiAgICBpZiAoIWlzRmluaXRlKHopKSB0aHJvdyBuZXcgVHlwZUVycm9yKCd6IGNvbXBvbmVudCBmb3Igbm9pc2UoKSBtdXN0IGJlIGZpbml0ZScpO1xuICAgIGZyZXF1ZW5jeSA9IGRlZmluZWQoZnJlcXVlbmN5LCAxKTtcbiAgICBhbXBsaXR1ZGUgPSBkZWZpbmVkKGFtcGxpdHVkZSwgMSk7XG4gICAgcmV0dXJuIGFtcGxpdHVkZSAqIG5vaXNlR2VuZXJhdG9yLm5vaXNlM0QoXG4gICAgICB4ICogZnJlcXVlbmN5LFxuICAgICAgeSAqIGZyZXF1ZW5jeSxcbiAgICAgIHogKiBmcmVxdWVuY3lcbiAgICApO1xuICB9XG5cbiAgZnVuY3Rpb24gbm9pc2U0RCAoeCwgeSwgeiwgdywgZnJlcXVlbmN5LCBhbXBsaXR1ZGUpIHtcbiAgICBpZiAoIWlzRmluaXRlKHgpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCd4IGNvbXBvbmVudCBmb3Igbm9pc2UoKSBtdXN0IGJlIGZpbml0ZScpO1xuICAgIGlmICghaXNGaW5pdGUoeSkpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3kgY29tcG9uZW50IGZvciBub2lzZSgpIG11c3QgYmUgZmluaXRlJyk7XG4gICAgaWYgKCFpc0Zpbml0ZSh6KSkgdGhyb3cgbmV3IFR5cGVFcnJvcigneiBjb21wb25lbnQgZm9yIG5vaXNlKCkgbXVzdCBiZSBmaW5pdGUnKTtcbiAgICBpZiAoIWlzRmluaXRlKHcpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCd3IGNvbXBvbmVudCBmb3Igbm9pc2UoKSBtdXN0IGJlIGZpbml0ZScpO1xuICAgIGZyZXF1ZW5jeSA9IGRlZmluZWQoZnJlcXVlbmN5LCAxKTtcbiAgICBhbXBsaXR1ZGUgPSBkZWZpbmVkKGFtcGxpdHVkZSwgMSk7XG4gICAgcmV0dXJuIGFtcGxpdHVkZSAqIG5vaXNlR2VuZXJhdG9yLm5vaXNlNEQoXG4gICAgICB4ICogZnJlcXVlbmN5LFxuICAgICAgeSAqIGZyZXF1ZW5jeSxcbiAgICAgIHogKiBmcmVxdWVuY3ksXG4gICAgICB3ICogZnJlcXVlbmN5XG4gICAgKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNpZ24gKCkge1xuICAgIHJldHVybiBib29sZWFuKCkgPyAxIDogLTE7XG4gIH1cblxuICBmdW5jdGlvbiBib29sZWFuICgpIHtcbiAgICByZXR1cm4gdmFsdWUoKSA+IDAuNTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNoYW5jZSAobikge1xuICAgIG4gPSBkZWZpbmVkKG4sIDAuNSk7XG4gICAgaWYgKHR5cGVvZiBuICE9PSAnbnVtYmVyJykgdGhyb3cgbmV3IFR5cGVFcnJvcignZXhwZWN0ZWQgbiB0byBiZSBhIG51bWJlcicpO1xuICAgIHJldHVybiB2YWx1ZSgpIDwgbjtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJhbmdlIChtaW4sIG1heCkge1xuICAgIGlmIChtYXggPT09IHVuZGVmaW5lZCkge1xuICAgICAgbWF4ID0gbWluO1xuICAgICAgbWluID0gMDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG1pbiAhPT0gJ251bWJlcicgfHwgdHlwZW9mIG1heCAhPT0gJ251bWJlcicpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGFsbCBhcmd1bWVudHMgdG8gYmUgbnVtYmVycycpO1xuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZSgpICogKG1heCAtIG1pbikgKyBtaW47XG4gIH1cblxuICBmdW5jdGlvbiByYW5nZUZsb29yIChtaW4sIG1heCkge1xuICAgIGlmIChtYXggPT09IHVuZGVmaW5lZCkge1xuICAgICAgbWF4ID0gbWluO1xuICAgICAgbWluID0gMDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG1pbiAhPT0gJ251bWJlcicgfHwgdHlwZW9mIG1heCAhPT0gJ251bWJlcicpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGFsbCBhcmd1bWVudHMgdG8gYmUgbnVtYmVycycpO1xuICAgIH1cblxuICAgIHJldHVybiBNYXRoLmZsb29yKHJhbmdlKG1pbiwgbWF4KSk7XG4gIH1cblxuICBmdW5jdGlvbiBwaWNrIChhcnJheSkge1xuICAgIGlmIChhcnJheS5sZW5ndGggPT09IDApIHJldHVybiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIGFycmF5W3JhbmdlRmxvb3IoMCwgYXJyYXkubGVuZ3RoKV07XG4gIH1cblxuICBmdW5jdGlvbiBzaHVmZmxlIChhcnIpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgQXJyYXksIGdvdCAnICsgdHlwZW9mIGFycik7XG4gICAgfVxuXG4gICAgdmFyIHJhbmQ7XG4gICAgdmFyIHRtcDtcbiAgICB2YXIgbGVuID0gYXJyLmxlbmd0aDtcbiAgICB2YXIgcmV0ID0gYXJyLnNsaWNlKCk7XG4gICAgd2hpbGUgKGxlbikge1xuICAgICAgcmFuZCA9IE1hdGguZmxvb3IodmFsdWUoKSAqIGxlbi0tKTtcbiAgICAgIHRtcCA9IHJldFtsZW5dO1xuICAgICAgcmV0W2xlbl0gPSByZXRbcmFuZF07XG4gICAgICByZXRbcmFuZF0gPSB0bXA7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBmdW5jdGlvbiBvbkNpcmNsZSAocmFkaXVzLCBvdXQpIHtcbiAgICByYWRpdXMgPSBkZWZpbmVkKHJhZGl1cywgMSk7XG4gICAgb3V0ID0gb3V0IHx8IFtdO1xuICAgIHZhciB0aGV0YSA9IHZhbHVlKCkgKiAyLjAgKiBNYXRoLlBJO1xuICAgIG91dFswXSA9IHJhZGl1cyAqIE1hdGguY29zKHRoZXRhKTtcbiAgICBvdXRbMV0gPSByYWRpdXMgKiBNYXRoLnNpbih0aGV0YSk7XG4gICAgcmV0dXJuIG91dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluc2lkZUNpcmNsZSAocmFkaXVzLCBvdXQpIHtcbiAgICByYWRpdXMgPSBkZWZpbmVkKHJhZGl1cywgMSk7XG4gICAgb3V0ID0gb3V0IHx8IFtdO1xuICAgIG9uQ2lyY2xlKDEsIG91dCk7XG4gICAgdmFyIHIgPSByYWRpdXMgKiBNYXRoLnNxcnQodmFsdWUoKSk7XG4gICAgb3V0WzBdICo9IHI7XG4gICAgb3V0WzFdICo9IHI7XG4gICAgcmV0dXJuIG91dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uU3BoZXJlIChyYWRpdXMsIG91dCkge1xuICAgIHJhZGl1cyA9IGRlZmluZWQocmFkaXVzLCAxKTtcbiAgICBvdXQgPSBvdXQgfHwgW107XG4gICAgdmFyIHUgPSB2YWx1ZSgpICogTWF0aC5QSSAqIDI7XG4gICAgdmFyIHYgPSB2YWx1ZSgpICogMiAtIDE7XG4gICAgdmFyIHBoaSA9IHU7XG4gICAgdmFyIHRoZXRhID0gTWF0aC5hY29zKHYpO1xuICAgIG91dFswXSA9IHJhZGl1cyAqIE1hdGguc2luKHRoZXRhKSAqIE1hdGguY29zKHBoaSk7XG4gICAgb3V0WzFdID0gcmFkaXVzICogTWF0aC5zaW4odGhldGEpICogTWF0aC5zaW4ocGhpKTtcbiAgICBvdXRbMl0gPSByYWRpdXMgKiBNYXRoLmNvcyh0aGV0YSk7XG4gICAgcmV0dXJuIG91dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluc2lkZVNwaGVyZSAocmFkaXVzLCBvdXQpIHtcbiAgICByYWRpdXMgPSBkZWZpbmVkKHJhZGl1cywgMSk7XG4gICAgb3V0ID0gb3V0IHx8IFtdO1xuICAgIHZhciB1ID0gdmFsdWUoKSAqIE1hdGguUEkgKiAyO1xuICAgIHZhciB2ID0gdmFsdWUoKSAqIDIgLSAxO1xuICAgIHZhciBrID0gdmFsdWUoKTtcblxuICAgIHZhciBwaGkgPSB1O1xuICAgIHZhciB0aGV0YSA9IE1hdGguYWNvcyh2KTtcbiAgICB2YXIgciA9IHJhZGl1cyAqIE1hdGguY2JydChrKTtcbiAgICBvdXRbMF0gPSByICogTWF0aC5zaW4odGhldGEpICogTWF0aC5jb3MocGhpKTtcbiAgICBvdXRbMV0gPSByICogTWF0aC5zaW4odGhldGEpICogTWF0aC5zaW4ocGhpKTtcbiAgICBvdXRbMl0gPSByICogTWF0aC5jb3ModGhldGEpO1xuICAgIHJldHVybiBvdXQ7XG4gIH1cblxuICBmdW5jdGlvbiBxdWF0ZXJuaW9uIChvdXQpIHtcbiAgICBvdXQgPSBvdXQgfHwgW107XG4gICAgdmFyIHUxID0gdmFsdWUoKTtcbiAgICB2YXIgdTIgPSB2YWx1ZSgpO1xuICAgIHZhciB1MyA9IHZhbHVlKCk7XG5cbiAgICB2YXIgc3ExID0gTWF0aC5zcXJ0KDEgLSB1MSk7XG4gICAgdmFyIHNxMiA9IE1hdGguc3FydCh1MSk7XG5cbiAgICB2YXIgdGhldGExID0gTWF0aC5QSSAqIDIgKiB1MjtcbiAgICB2YXIgdGhldGEyID0gTWF0aC5QSSAqIDIgKiB1MztcblxuICAgIHZhciB4ID0gTWF0aC5zaW4odGhldGExKSAqIHNxMTtcbiAgICB2YXIgeSA9IE1hdGguY29zKHRoZXRhMSkgKiBzcTE7XG4gICAgdmFyIHogPSBNYXRoLnNpbih0aGV0YTIpICogc3EyO1xuICAgIHZhciB3ID0gTWF0aC5jb3ModGhldGEyKSAqIHNxMjtcbiAgICBvdXRbMF0gPSB4O1xuICAgIG91dFsxXSA9IHk7XG4gICAgb3V0WzJdID0gejtcbiAgICBvdXRbM10gPSB3O1xuICAgIHJldHVybiBvdXQ7XG4gIH1cblxuICBmdW5jdGlvbiB3ZWlnaHRlZFNldCAoc2V0KSB7XG4gICAgc2V0ID0gc2V0IHx8IFtdO1xuICAgIGlmIChzZXQubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gc2V0W3dlaWdodGVkU2V0SW5kZXgoc2V0KV0udmFsdWU7XG4gIH1cblxuICBmdW5jdGlvbiB3ZWlnaHRlZFNldEluZGV4IChzZXQpIHtcbiAgICBzZXQgPSBzZXQgfHwgW107XG4gICAgaWYgKHNldC5sZW5ndGggPT09IDApIHJldHVybiAtMTtcbiAgICByZXR1cm4gd2VpZ2h0ZWQoc2V0Lm1hcChmdW5jdGlvbiAocykge1xuICAgICAgcmV0dXJuIHMud2VpZ2h0O1xuICAgIH0pKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHdlaWdodGVkICh3ZWlnaHRzKSB7XG4gICAgd2VpZ2h0cyA9IHdlaWdodHMgfHwgW107XG4gICAgaWYgKHdlaWdodHMubGVuZ3RoID09PSAwKSByZXR1cm4gLTE7XG4gICAgdmFyIHRvdGFsV2VpZ2h0ID0gMDtcbiAgICB2YXIgaTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCB3ZWlnaHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0b3RhbFdlaWdodCArPSB3ZWlnaHRzW2ldO1xuICAgIH1cblxuICAgIGlmICh0b3RhbFdlaWdodCA8PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ1dlaWdodHMgbXVzdCBzdW0gdG8gPiAwJyk7XG5cbiAgICB2YXIgcmFuZG9tID0gdmFsdWUoKSAqIHRvdGFsV2VpZ2h0O1xuICAgIGZvciAoaSA9IDA7IGkgPCB3ZWlnaHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAocmFuZG9tIDwgd2VpZ2h0c1tpXSkge1xuICAgICAgICByZXR1cm4gaTtcbiAgICAgIH1cbiAgICAgIHJhbmRvbSAtPSB3ZWlnaHRzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdhdXNzaWFuIChtZWFuLCBzdGFuZGFyZERlcml2YXRpb24pIHtcbiAgICBtZWFuID0gZGVmaW5lZChtZWFuLCAwKTtcbiAgICBzdGFuZGFyZERlcml2YXRpb24gPSBkZWZpbmVkKHN0YW5kYXJkRGVyaXZhdGlvbiwgMSk7XG5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vb3Blbmpkay1taXJyb3IvamRrN3UtamRrL2Jsb2IvZjRkODA5NTdlODlhMTlhMjliYjlmOTgwN2QyYTI4MzUxZWQ3ZjdkZi9zcmMvc2hhcmUvY2xhc3Nlcy9qYXZhL3V0aWwvUmFuZG9tLmphdmEjTDQ5NlxuICAgIGlmIChfaGFzTmV4dEdhdXNzaWFuKSB7XG4gICAgICBfaGFzTmV4dEdhdXNzaWFuID0gZmFsc2U7XG4gICAgICB2YXIgcmVzdWx0ID0gX25leHRHYXVzc2lhbjtcbiAgICAgIF9uZXh0R2F1c3NpYW4gPSBudWxsO1xuICAgICAgcmV0dXJuIG1lYW4gKyBzdGFuZGFyZERlcml2YXRpb24gKiByZXN1bHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB2MSA9IDA7XG4gICAgICB2YXIgdjIgPSAwO1xuICAgICAgdmFyIHMgPSAwO1xuICAgICAgZG8ge1xuICAgICAgICB2MSA9IHZhbHVlKCkgKiAyIC0gMTsgLy8gYmV0d2VlbiAtMSBhbmQgMVxuICAgICAgICB2MiA9IHZhbHVlKCkgKiAyIC0gMTsgLy8gYmV0d2VlbiAtMSBhbmQgMVxuICAgICAgICBzID0gdjEgKiB2MSArIHYyICogdjI7XG4gICAgICB9IHdoaWxlIChzID49IDEgfHwgcyA9PT0gMCk7XG4gICAgICB2YXIgbXVsdGlwbGllciA9IE1hdGguc3FydCgtMiAqIE1hdGgubG9nKHMpIC8gcyk7XG4gICAgICBfbmV4dEdhdXNzaWFuID0gKHYyICogbXVsdGlwbGllcik7XG4gICAgICBfaGFzTmV4dEdhdXNzaWFuID0gdHJ1ZTtcbiAgICAgIHJldHVybiBtZWFuICsgc3RhbmRhcmREZXJpdmF0aW9uICogKHYxICogbXVsdGlwbGllcik7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlUmFuZG9tKCk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoYXJndW1lbnRzW2ldICE9PSB1bmRlZmluZWQpIHJldHVybiBhcmd1bWVudHNbaV07XG4gICAgfVxufTtcbiIsIi8qXG5vYmplY3QtYXNzaWduXG4oYykgU2luZHJlIFNvcmh1c1xuQGxpY2Vuc2UgTUlUXG4qL1xuXG4ndXNlIHN0cmljdCc7XG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xudmFyIGdldE93blByb3BlcnR5U3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIHByb3BJc0VudW1lcmFibGUgPSBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG5mdW5jdGlvbiB0b09iamVjdCh2YWwpIHtcblx0aWYgKHZhbCA9PT0gbnVsbCB8fCB2YWwgPT09IHVuZGVmaW5lZCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ09iamVjdC5hc3NpZ24gY2Fubm90IGJlIGNhbGxlZCB3aXRoIG51bGwgb3IgdW5kZWZpbmVkJyk7XG5cdH1cblxuXHRyZXR1cm4gT2JqZWN0KHZhbCk7XG59XG5cbmZ1bmN0aW9uIHNob3VsZFVzZU5hdGl2ZSgpIHtcblx0dHJ5IHtcblx0XHRpZiAoIU9iamVjdC5hc3NpZ24pIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBEZXRlY3QgYnVnZ3kgcHJvcGVydHkgZW51bWVyYXRpb24gb3JkZXIgaW4gb2xkZXIgVjggdmVyc2lvbnMuXG5cblx0XHQvLyBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvdjgvaXNzdWVzL2RldGFpbD9pZD00MTE4XG5cdFx0dmFyIHRlc3QxID0gbmV3IFN0cmluZygnYWJjJyk7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLW5ldy13cmFwcGVyc1xuXHRcdHRlc3QxWzVdID0gJ2RlJztcblx0XHRpZiAoT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGVzdDEpWzBdID09PSAnNScpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvdjgvaXNzdWVzL2RldGFpbD9pZD0zMDU2XG5cdFx0dmFyIHRlc3QyID0ge307XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG5cdFx0XHR0ZXN0MlsnXycgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGkpXSA9IGk7XG5cdFx0fVxuXHRcdHZhciBvcmRlcjIgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0ZXN0MikubWFwKGZ1bmN0aW9uIChuKSB7XG5cdFx0XHRyZXR1cm4gdGVzdDJbbl07XG5cdFx0fSk7XG5cdFx0aWYgKG9yZGVyMi5qb2luKCcnKSAhPT0gJzAxMjM0NTY3ODknKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9MzA1NlxuXHRcdHZhciB0ZXN0MyA9IHt9O1xuXHRcdCdhYmNkZWZnaGlqa2xtbm9wcXJzdCcuc3BsaXQoJycpLmZvckVhY2goZnVuY3Rpb24gKGxldHRlcikge1xuXHRcdFx0dGVzdDNbbGV0dGVyXSA9IGxldHRlcjtcblx0XHR9KTtcblx0XHRpZiAoT2JqZWN0LmtleXMoT2JqZWN0LmFzc2lnbih7fSwgdGVzdDMpKS5qb2luKCcnKSAhPT1cblx0XHRcdFx0J2FiY2RlZmdoaWprbG1ub3BxcnN0Jykge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHQvLyBXZSBkb24ndCBleHBlY3QgYW55IG9mIHRoZSBhYm92ZSB0byB0aHJvdywgYnV0IGJldHRlciB0byBiZSBzYWZlLlxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNob3VsZFVzZU5hdGl2ZSgpID8gT2JqZWN0LmFzc2lnbiA6IGZ1bmN0aW9uICh0YXJnZXQsIHNvdXJjZSkge1xuXHR2YXIgZnJvbTtcblx0dmFyIHRvID0gdG9PYmplY3QodGFyZ2V0KTtcblx0dmFyIHN5bWJvbHM7XG5cblx0Zm9yICh2YXIgcyA9IDE7IHMgPCBhcmd1bWVudHMubGVuZ3RoOyBzKyspIHtcblx0XHRmcm9tID0gT2JqZWN0KGFyZ3VtZW50c1tzXSk7XG5cblx0XHRmb3IgKHZhciBrZXkgaW4gZnJvbSkge1xuXHRcdFx0aWYgKGhhc093blByb3BlcnR5LmNhbGwoZnJvbSwga2V5KSkge1xuXHRcdFx0XHR0b1trZXldID0gZnJvbVtrZXldO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChnZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHtcblx0XHRcdHN5bWJvbHMgPSBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZnJvbSk7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHN5bWJvbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKHByb3BJc0VudW1lcmFibGUuY2FsbChmcm9tLCBzeW1ib2xzW2ldKSkge1xuXHRcdFx0XHRcdHRvW3N5bWJvbHNbaV1dID0gZnJvbVtzeW1ib2xzW2ldXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0bztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9XG4gIGdsb2JhbC5wZXJmb3JtYW5jZSAmJlxuICBnbG9iYWwucGVyZm9ybWFuY2Uubm93ID8gZnVuY3Rpb24gbm93KCkge1xuICAgIHJldHVybiBwZXJmb3JtYW5jZS5ub3coKVxuICB9IDogRGF0ZS5ub3cgfHwgZnVuY3Rpb24gbm93KCkge1xuICAgIHJldHVybiArbmV3IERhdGVcbiAgfVxuIiwibW9kdWxlLmV4cG9ydHMgPSBpc1Byb21pc2U7XG5cbmZ1bmN0aW9uIGlzUHJvbWlzZShvYmopIHtcbiAgcmV0dXJuICEhb2JqICYmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyB8fCB0eXBlb2Ygb2JqID09PSAnZnVuY3Rpb24nKSAmJiB0eXBlb2Ygb2JqLnRoZW4gPT09ICdmdW5jdGlvbic7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGlzTm9kZVxuXG5mdW5jdGlvbiBpc05vZGUgKHZhbCkge1xuICByZXR1cm4gKCF2YWwgfHwgdHlwZW9mIHZhbCAhPT0gJ29iamVjdCcpXG4gICAgPyBmYWxzZVxuICAgIDogKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnICYmIHR5cGVvZiB3aW5kb3cuTm9kZSA9PT0gJ29iamVjdCcpXG4gICAgICA/ICh2YWwgaW5zdGFuY2VvZiB3aW5kb3cuTm9kZSlcbiAgICAgIDogKHR5cGVvZiB2YWwubm9kZVR5cGUgPT09ICdudW1iZXInKSAmJlxuICAgICAgICAodHlwZW9mIHZhbC5ub2RlTmFtZSA9PT0gJ3N0cmluZycpXG59XG4iLCIvLyBUT0RPOiBXZSBjYW4gcmVtb3ZlIGEgaHVnZSBjaHVuayBvZiBidW5kbGUgc2l6ZSBieSB1c2luZyBhIHNtYWxsZXJcbi8vIHV0aWxpdHkgbW9kdWxlIGZvciBjb252ZXJ0aW5nIHVuaXRzLlxuaW1wb3J0IGlzRE9NIGZyb20gJ2lzLWRvbSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDbGllbnRBUEkgKCkge1xuICByZXR1cm4gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93WydjYW52YXMtc2tldGNoLWNsaSddO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNCcm93c2VyICgpIHtcbiAgcmV0dXJuIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1dlYkdMQ29udGV4dCAoY3R4KSB7XG4gIHJldHVybiB0eXBlb2YgY3R4LmNsZWFyID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBjdHguY2xlYXJDb2xvciA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgY3R4LmJ1ZmZlckRhdGEgPT09ICdmdW5jdGlvbic7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NhbnZhcyAoZWxlbWVudCkge1xuICByZXR1cm4gaXNET00oZWxlbWVudCkgJiYgL2NhbnZhcy9pLnRlc3QoZWxlbWVudC5ub2RlTmFtZSkgJiYgdHlwZW9mIGVsZW1lbnQuZ2V0Q29udGV4dCA9PT0gJ2Z1bmN0aW9uJztcbn1cbiIsImV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHR5cGVvZiBPYmplY3Qua2V5cyA9PT0gJ2Z1bmN0aW9uJ1xuICA/IE9iamVjdC5rZXlzIDogc2hpbTtcblxuZXhwb3J0cy5zaGltID0gc2hpbTtcbmZ1bmN0aW9uIHNoaW0gKG9iaikge1xuICB2YXIga2V5cyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSBrZXlzLnB1c2goa2V5KTtcbiAgcmV0dXJuIGtleXM7XG59XG4iLCJ2YXIgc3VwcG9ydHNBcmd1bWVudHNDbGFzcyA9IChmdW5jdGlvbigpe1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyZ3VtZW50cylcbn0pKCkgPT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHN1cHBvcnRzQXJndW1lbnRzQ2xhc3MgPyBzdXBwb3J0ZWQgOiB1bnN1cHBvcnRlZDtcblxuZXhwb3J0cy5zdXBwb3J0ZWQgPSBzdXBwb3J0ZWQ7XG5mdW5jdGlvbiBzdXBwb3J0ZWQob2JqZWN0KSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PSAnW29iamVjdCBBcmd1bWVudHNdJztcbn07XG5cbmV4cG9ydHMudW5zdXBwb3J0ZWQgPSB1bnN1cHBvcnRlZDtcbmZ1bmN0aW9uIHVuc3VwcG9ydGVkKG9iamVjdCl7XG4gIHJldHVybiBvYmplY3QgJiZcbiAgICB0eXBlb2Ygb2JqZWN0ID09ICdvYmplY3QnICYmXG4gICAgdHlwZW9mIG9iamVjdC5sZW5ndGggPT0gJ251bWJlcicgJiZcbiAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCAnY2FsbGVlJykgJiZcbiAgICAhT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKG9iamVjdCwgJ2NhbGxlZScpIHx8XG4gICAgZmFsc2U7XG59O1xuIiwidmFyIHBTbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbnZhciBvYmplY3RLZXlzID0gcmVxdWlyZSgnLi9saWIva2V5cy5qcycpO1xudmFyIGlzQXJndW1lbnRzID0gcmVxdWlyZSgnLi9saWIvaXNfYXJndW1lbnRzLmpzJyk7XG5cbnZhciBkZWVwRXF1YWwgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChhY3R1YWwsIGV4cGVjdGVkLCBvcHRzKSB7XG4gIGlmICghb3B0cykgb3B0cyA9IHt9O1xuICAvLyA3LjEuIEFsbCBpZGVudGljYWwgdmFsdWVzIGFyZSBlcXVpdmFsZW50LCBhcyBkZXRlcm1pbmVkIGJ5ID09PS5cbiAgaWYgKGFjdHVhbCA9PT0gZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcblxuICB9IGVsc2UgaWYgKGFjdHVhbCBpbnN0YW5jZW9mIERhdGUgJiYgZXhwZWN0ZWQgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgcmV0dXJuIGFjdHVhbC5nZXRUaW1lKCkgPT09IGV4cGVjdGVkLmdldFRpbWUoKTtcblxuICAvLyA3LjMuIE90aGVyIHBhaXJzIHRoYXQgZG8gbm90IGJvdGggcGFzcyB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcsXG4gIC8vIGVxdWl2YWxlbmNlIGlzIGRldGVybWluZWQgYnkgPT0uXG4gIH0gZWxzZSBpZiAoIWFjdHVhbCB8fCAhZXhwZWN0ZWQgfHwgdHlwZW9mIGFjdHVhbCAhPSAnb2JqZWN0JyAmJiB0eXBlb2YgZXhwZWN0ZWQgIT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gb3B0cy5zdHJpY3QgPyBhY3R1YWwgPT09IGV4cGVjdGVkIDogYWN0dWFsID09IGV4cGVjdGVkO1xuXG4gIC8vIDcuNC4gRm9yIGFsbCBvdGhlciBPYmplY3QgcGFpcnMsIGluY2x1ZGluZyBBcnJheSBvYmplY3RzLCBlcXVpdmFsZW5jZSBpc1xuICAvLyBkZXRlcm1pbmVkIGJ5IGhhdmluZyB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcyAoYXMgdmVyaWZpZWRcbiAgLy8gd2l0aCBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwpLCB0aGUgc2FtZSBzZXQgb2Yga2V5c1xuICAvLyAoYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyKSwgZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5XG4gIC8vIGNvcnJlc3BvbmRpbmcga2V5LCBhbmQgYW4gaWRlbnRpY2FsICdwcm90b3R5cGUnIHByb3BlcnR5LiBOb3RlOiB0aGlzXG4gIC8vIGFjY291bnRzIGZvciBib3RoIG5hbWVkIGFuZCBpbmRleGVkIHByb3BlcnRpZXMgb24gQXJyYXlzLlxuICB9IGVsc2Uge1xuICAgIHJldHVybiBvYmpFcXVpdihhY3R1YWwsIGV4cGVjdGVkLCBvcHRzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZE9yTnVsbCh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gaXNCdWZmZXIgKHgpIHtcbiAgaWYgKCF4IHx8IHR5cGVvZiB4ICE9PSAnb2JqZWN0JyB8fCB0eXBlb2YgeC5sZW5ndGggIT09ICdudW1iZXInKSByZXR1cm4gZmFsc2U7XG4gIGlmICh0eXBlb2YgeC5jb3B5ICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiB4LnNsaWNlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh4Lmxlbmd0aCA+IDAgJiYgdHlwZW9mIHhbMF0gIT09ICdudW1iZXInKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBvYmpFcXVpdihhLCBiLCBvcHRzKSB7XG4gIHZhciBpLCBrZXk7XG4gIGlmIChpc1VuZGVmaW5lZE9yTnVsbChhKSB8fCBpc1VuZGVmaW5lZE9yTnVsbChiKSlcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS5cbiAgaWYgKGEucHJvdG90eXBlICE9PSBiLnByb3RvdHlwZSkgcmV0dXJuIGZhbHNlO1xuICAvL35+fkkndmUgbWFuYWdlZCB0byBicmVhayBPYmplY3Qua2V5cyB0aHJvdWdoIHNjcmV3eSBhcmd1bWVudHMgcGFzc2luZy5cbiAgLy8gICBDb252ZXJ0aW5nIHRvIGFycmF5IHNvbHZlcyB0aGUgcHJvYmxlbS5cbiAgaWYgKGlzQXJndW1lbnRzKGEpKSB7XG4gICAgaWYgKCFpc0FyZ3VtZW50cyhiKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBhID0gcFNsaWNlLmNhbGwoYSk7XG4gICAgYiA9IHBTbGljZS5jYWxsKGIpO1xuICAgIHJldHVybiBkZWVwRXF1YWwoYSwgYiwgb3B0cyk7XG4gIH1cbiAgaWYgKGlzQnVmZmVyKGEpKSB7XG4gICAgaWYgKCFpc0J1ZmZlcihiKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgZm9yIChpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChhW2ldICE9PSBiW2ldKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHRyeSB7XG4gICAgdmFyIGthID0gb2JqZWN0S2V5cyhhKSxcbiAgICAgICAga2IgPSBvYmplY3RLZXlzKGIpO1xuICB9IGNhdGNoIChlKSB7Ly9oYXBwZW5zIHdoZW4gb25lIGlzIGEgc3RyaW5nIGxpdGVyYWwgYW5kIHRoZSBvdGhlciBpc24ndFxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGtleXMgaW5jb3Jwb3JhdGVzXG4gIC8vIGhhc093blByb3BlcnR5KVxuICBpZiAoa2EubGVuZ3RoICE9IGtiLmxlbmd0aClcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vdGhlIHNhbWUgc2V0IG9mIGtleXMgKGFsdGhvdWdoIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZSBvcmRlciksXG4gIGthLnNvcnQoKTtcbiAga2Iuc29ydCgpO1xuICAvL35+fmNoZWFwIGtleSB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgaWYgKGthW2ldICE9IGtiW2ldKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5IGNvcnJlc3BvbmRpbmcga2V5LCBhbmRcbiAgLy9+fn5wb3NzaWJseSBleHBlbnNpdmUgZGVlcCB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAga2V5ID0ga2FbaV07XG4gICAgaWYgKCFkZWVwRXF1YWwoYVtrZXldLCBiW2tleV0sIG9wdHMpKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHR5cGVvZiBhID09PSB0eXBlb2YgYjtcbn1cbiIsIi8qXG4gKiBEYXRlIEZvcm1hdCAxLjIuM1xuICogKGMpIDIwMDctMjAwOSBTdGV2ZW4gTGV2aXRoYW4gPHN0ZXZlbmxldml0aGFuLmNvbT5cbiAqIE1JVCBsaWNlbnNlXG4gKlxuICogSW5jbHVkZXMgZW5oYW5jZW1lbnRzIGJ5IFNjb3R0IFRyZW5kYSA8c2NvdHQudHJlbmRhLm5ldD5cbiAqIGFuZCBLcmlzIEtvd2FsIDxjaXhhci5jb20vfmtyaXMua293YWwvPlxuICpcbiAqIEFjY2VwdHMgYSBkYXRlLCBhIG1hc2ssIG9yIGEgZGF0ZSBhbmQgYSBtYXNrLlxuICogUmV0dXJucyBhIGZvcm1hdHRlZCB2ZXJzaW9uIG9mIHRoZSBnaXZlbiBkYXRlLlxuICogVGhlIGRhdGUgZGVmYXVsdHMgdG8gdGhlIGN1cnJlbnQgZGF0ZS90aW1lLlxuICogVGhlIG1hc2sgZGVmYXVsdHMgdG8gZGF0ZUZvcm1hdC5tYXNrcy5kZWZhdWx0LlxuICovXG5cbihmdW5jdGlvbihnbG9iYWwpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBkYXRlRm9ybWF0ID0gKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHRva2VuID0gL2R7MSw0fXxtezEsNH18eXkoPzp5eSk/fChbSGhNc1R0XSlcXDE/fFtMbG9TWldOXXxcIlteXCJdKlwifCdbXiddKicvZztcbiAgICAgIHZhciB0aW1lem9uZSA9IC9cXGIoPzpbUE1DRUFdW1NEUF1UfCg/OlBhY2lmaWN8TW91bnRhaW58Q2VudHJhbHxFYXN0ZXJufEF0bGFudGljKSAoPzpTdGFuZGFyZHxEYXlsaWdodHxQcmV2YWlsaW5nKSBUaW1lfCg/OkdNVHxVVEMpKD86Wy0rXVxcZHs0fSk/KVxcYi9nO1xuICAgICAgdmFyIHRpbWV6b25lQ2xpcCA9IC9bXi0rXFxkQS1aXS9nO1xuICBcbiAgICAgIC8vIFJlZ2V4ZXMgYW5kIHN1cHBvcnRpbmcgZnVuY3Rpb25zIGFyZSBjYWNoZWQgdGhyb3VnaCBjbG9zdXJlXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGRhdGUsIG1hc2ssIHV0YywgZ210KSB7XG4gIFxuICAgICAgICAvLyBZb3UgY2FuJ3QgcHJvdmlkZSB1dGMgaWYgeW91IHNraXAgb3RoZXIgYXJncyAodXNlIHRoZSAnVVRDOicgbWFzayBwcmVmaXgpXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxICYmIGtpbmRPZihkYXRlKSA9PT0gJ3N0cmluZycgJiYgIS9cXGQvLnRlc3QoZGF0ZSkpIHtcbiAgICAgICAgICBtYXNrID0gZGF0ZTtcbiAgICAgICAgICBkYXRlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gIFxuICAgICAgICBkYXRlID0gZGF0ZSB8fCBuZXcgRGF0ZTtcbiAgXG4gICAgICAgIGlmKCEoZGF0ZSBpbnN0YW5jZW9mIERhdGUpKSB7XG4gICAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKGRhdGUpO1xuICAgICAgICB9XG4gIFxuICAgICAgICBpZiAoaXNOYU4oZGF0ZSkpIHtcbiAgICAgICAgICB0aHJvdyBUeXBlRXJyb3IoJ0ludmFsaWQgZGF0ZScpO1xuICAgICAgICB9XG4gIFxuICAgICAgICBtYXNrID0gU3RyaW5nKGRhdGVGb3JtYXQubWFza3NbbWFza10gfHwgbWFzayB8fCBkYXRlRm9ybWF0Lm1hc2tzWydkZWZhdWx0J10pO1xuICBcbiAgICAgICAgLy8gQWxsb3cgc2V0dGluZyB0aGUgdXRjL2dtdCBhcmd1bWVudCB2aWEgdGhlIG1hc2tcbiAgICAgICAgdmFyIG1hc2tTbGljZSA9IG1hc2suc2xpY2UoMCwgNCk7XG4gICAgICAgIGlmIChtYXNrU2xpY2UgPT09ICdVVEM6JyB8fCBtYXNrU2xpY2UgPT09ICdHTVQ6Jykge1xuICAgICAgICAgIG1hc2sgPSBtYXNrLnNsaWNlKDQpO1xuICAgICAgICAgIHV0YyA9IHRydWU7XG4gICAgICAgICAgaWYgKG1hc2tTbGljZSA9PT0gJ0dNVDonKSB7XG4gICAgICAgICAgICBnbXQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICBcbiAgICAgICAgdmFyIF8gPSB1dGMgPyAnZ2V0VVRDJyA6ICdnZXQnO1xuICAgICAgICB2YXIgZCA9IGRhdGVbXyArICdEYXRlJ10oKTtcbiAgICAgICAgdmFyIEQgPSBkYXRlW18gKyAnRGF5J10oKTtcbiAgICAgICAgdmFyIG0gPSBkYXRlW18gKyAnTW9udGgnXSgpO1xuICAgICAgICB2YXIgeSA9IGRhdGVbXyArICdGdWxsWWVhciddKCk7XG4gICAgICAgIHZhciBIID0gZGF0ZVtfICsgJ0hvdXJzJ10oKTtcbiAgICAgICAgdmFyIE0gPSBkYXRlW18gKyAnTWludXRlcyddKCk7XG4gICAgICAgIHZhciBzID0gZGF0ZVtfICsgJ1NlY29uZHMnXSgpO1xuICAgICAgICB2YXIgTCA9IGRhdGVbXyArICdNaWxsaXNlY29uZHMnXSgpO1xuICAgICAgICB2YXIgbyA9IHV0YyA/IDAgOiBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XG4gICAgICAgIHZhciBXID0gZ2V0V2VlayhkYXRlKTtcbiAgICAgICAgdmFyIE4gPSBnZXREYXlPZldlZWsoZGF0ZSk7XG4gICAgICAgIHZhciBmbGFncyA9IHtcbiAgICAgICAgICBkOiAgICBkLFxuICAgICAgICAgIGRkOiAgIHBhZChkKSxcbiAgICAgICAgICBkZGQ6ICBkYXRlRm9ybWF0LmkxOG4uZGF5TmFtZXNbRF0sXG4gICAgICAgICAgZGRkZDogZGF0ZUZvcm1hdC5pMThuLmRheU5hbWVzW0QgKyA3XSxcbiAgICAgICAgICBtOiAgICBtICsgMSxcbiAgICAgICAgICBtbTogICBwYWQobSArIDEpLFxuICAgICAgICAgIG1tbTogIGRhdGVGb3JtYXQuaTE4bi5tb250aE5hbWVzW21dLFxuICAgICAgICAgIG1tbW06IGRhdGVGb3JtYXQuaTE4bi5tb250aE5hbWVzW20gKyAxMl0sXG4gICAgICAgICAgeXk6ICAgU3RyaW5nKHkpLnNsaWNlKDIpLFxuICAgICAgICAgIHl5eXk6IHksXG4gICAgICAgICAgaDogICAgSCAlIDEyIHx8IDEyLFxuICAgICAgICAgIGhoOiAgIHBhZChIICUgMTIgfHwgMTIpLFxuICAgICAgICAgIEg6ICAgIEgsXG4gICAgICAgICAgSEg6ICAgcGFkKEgpLFxuICAgICAgICAgIE06ICAgIE0sXG4gICAgICAgICAgTU06ICAgcGFkKE0pLFxuICAgICAgICAgIHM6ICAgIHMsXG4gICAgICAgICAgc3M6ICAgcGFkKHMpLFxuICAgICAgICAgIGw6ICAgIHBhZChMLCAzKSxcbiAgICAgICAgICBMOiAgICBwYWQoTWF0aC5yb3VuZChMIC8gMTApKSxcbiAgICAgICAgICB0OiAgICBIIDwgMTIgPyBkYXRlRm9ybWF0LmkxOG4udGltZU5hbWVzWzBdIDogZGF0ZUZvcm1hdC5pMThuLnRpbWVOYW1lc1sxXSxcbiAgICAgICAgICB0dDogICBIIDwgMTIgPyBkYXRlRm9ybWF0LmkxOG4udGltZU5hbWVzWzJdIDogZGF0ZUZvcm1hdC5pMThuLnRpbWVOYW1lc1szXSxcbiAgICAgICAgICBUOiAgICBIIDwgMTIgPyBkYXRlRm9ybWF0LmkxOG4udGltZU5hbWVzWzRdIDogZGF0ZUZvcm1hdC5pMThuLnRpbWVOYW1lc1s1XSxcbiAgICAgICAgICBUVDogICBIIDwgMTIgPyBkYXRlRm9ybWF0LmkxOG4udGltZU5hbWVzWzZdIDogZGF0ZUZvcm1hdC5pMThuLnRpbWVOYW1lc1s3XSxcbiAgICAgICAgICBaOiAgICBnbXQgPyAnR01UJyA6IHV0YyA/ICdVVEMnIDogKFN0cmluZyhkYXRlKS5tYXRjaCh0aW1lem9uZSkgfHwgWycnXSkucG9wKCkucmVwbGFjZSh0aW1lem9uZUNsaXAsICcnKSxcbiAgICAgICAgICBvOiAgICAobyA+IDAgPyAnLScgOiAnKycpICsgcGFkKE1hdGguZmxvb3IoTWF0aC5hYnMobykgLyA2MCkgKiAxMDAgKyBNYXRoLmFicyhvKSAlIDYwLCA0KSxcbiAgICAgICAgICBTOiAgICBbJ3RoJywgJ3N0JywgJ25kJywgJ3JkJ11bZCAlIDEwID4gMyA/IDAgOiAoZCAlIDEwMCAtIGQgJSAxMCAhPSAxMCkgKiBkICUgMTBdLFxuICAgICAgICAgIFc6ICAgIFcsXG4gICAgICAgICAgTjogICAgTlxuICAgICAgICB9O1xuICBcbiAgICAgICAgcmV0dXJuIG1hc2sucmVwbGFjZSh0b2tlbiwgZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAgICAgaWYgKG1hdGNoIGluIGZsYWdzKSB7XG4gICAgICAgICAgICByZXR1cm4gZmxhZ3NbbWF0Y2hdO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbWF0Y2guc2xpY2UoMSwgbWF0Y2gubGVuZ3RoIC0gMSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSgpO1xuXG4gIGRhdGVGb3JtYXQubWFza3MgPSB7XG4gICAgJ2RlZmF1bHQnOiAgICAgICAgICAgICAgICdkZGQgbW1tIGRkIHl5eXkgSEg6TU06c3MnLFxuICAgICdzaG9ydERhdGUnOiAgICAgICAgICAgICAnbS9kL3l5JyxcbiAgICAnbWVkaXVtRGF0ZSc6ICAgICAgICAgICAgJ21tbSBkLCB5eXl5JyxcbiAgICAnbG9uZ0RhdGUnOiAgICAgICAgICAgICAgJ21tbW0gZCwgeXl5eScsXG4gICAgJ2Z1bGxEYXRlJzogICAgICAgICAgICAgICdkZGRkLCBtbW1tIGQsIHl5eXknLFxuICAgICdzaG9ydFRpbWUnOiAgICAgICAgICAgICAnaDpNTSBUVCcsXG4gICAgJ21lZGl1bVRpbWUnOiAgICAgICAgICAgICdoOk1NOnNzIFRUJyxcbiAgICAnbG9uZ1RpbWUnOiAgICAgICAgICAgICAgJ2g6TU06c3MgVFQgWicsXG4gICAgJ2lzb0RhdGUnOiAgICAgICAgICAgICAgICd5eXl5LW1tLWRkJyxcbiAgICAnaXNvVGltZSc6ICAgICAgICAgICAgICAgJ0hIOk1NOnNzJyxcbiAgICAnaXNvRGF0ZVRpbWUnOiAgICAgICAgICAgJ3l5eXktbW0tZGRcXCdUXFwnSEg6TU06c3NvJyxcbiAgICAnaXNvVXRjRGF0ZVRpbWUnOiAgICAgICAgJ1VUQzp5eXl5LW1tLWRkXFwnVFxcJ0hIOk1NOnNzXFwnWlxcJycsXG4gICAgJ2V4cGlyZXNIZWFkZXJGb3JtYXQnOiAgICdkZGQsIGRkIG1tbSB5eXl5IEhIOk1NOnNzIFonXG4gIH07XG5cbiAgLy8gSW50ZXJuYXRpb25hbGl6YXRpb24gc3RyaW5nc1xuICBkYXRlRm9ybWF0LmkxOG4gPSB7XG4gICAgZGF5TmFtZXM6IFtcbiAgICAgICdTdW4nLCAnTW9uJywgJ1R1ZScsICdXZWQnLCAnVGh1JywgJ0ZyaScsICdTYXQnLFxuICAgICAgJ1N1bmRheScsICdNb25kYXknLCAnVHVlc2RheScsICdXZWRuZXNkYXknLCAnVGh1cnNkYXknLCAnRnJpZGF5JywgJ1NhdHVyZGF5J1xuICAgIF0sXG4gICAgbW9udGhOYW1lczogW1xuICAgICAgJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJywgJ09jdCcsICdOb3YnLCAnRGVjJyxcbiAgICAgICdKYW51YXJ5JywgJ0ZlYnJ1YXJ5JywgJ01hcmNoJywgJ0FwcmlsJywgJ01heScsICdKdW5lJywgJ0p1bHknLCAnQXVndXN0JywgJ1NlcHRlbWJlcicsICdPY3RvYmVyJywgJ05vdmVtYmVyJywgJ0RlY2VtYmVyJ1xuICAgIF0sXG4gICAgdGltZU5hbWVzOiBbXG4gICAgICAnYScsICdwJywgJ2FtJywgJ3BtJywgJ0EnLCAnUCcsICdBTScsICdQTSdcbiAgICBdXG4gIH07XG5cbmZ1bmN0aW9uIHBhZCh2YWwsIGxlbikge1xuICB2YWwgPSBTdHJpbmcodmFsKTtcbiAgbGVuID0gbGVuIHx8IDI7XG4gIHdoaWxlICh2YWwubGVuZ3RoIDwgbGVuKSB7XG4gICAgdmFsID0gJzAnICsgdmFsO1xuICB9XG4gIHJldHVybiB2YWw7XG59XG5cbi8qKlxuICogR2V0IHRoZSBJU08gODYwMSB3ZWVrIG51bWJlclxuICogQmFzZWQgb24gY29tbWVudHMgZnJvbVxuICogaHR0cDovL3RlY2hibG9nLnByb2N1cmlvcy5ubC9rL242MTgvbmV3cy92aWV3LzMzNzk2LzE0ODYzL0NhbGN1bGF0ZS1JU08tODYwMS13ZWVrLWFuZC15ZWFyLWluLWphdmFzY3JpcHQuaHRtbFxuICpcbiAqIEBwYXJhbSAge09iamVjdH0gYGRhdGVgXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIGdldFdlZWsoZGF0ZSkge1xuICAvLyBSZW1vdmUgdGltZSBjb21wb25lbnRzIG9mIGRhdGVcbiAgdmFyIHRhcmdldFRodXJzZGF5ID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIGRhdGUuZ2V0RGF0ZSgpKTtcblxuICAvLyBDaGFuZ2UgZGF0ZSB0byBUaHVyc2RheSBzYW1lIHdlZWtcbiAgdGFyZ2V0VGh1cnNkYXkuc2V0RGF0ZSh0YXJnZXRUaHVyc2RheS5nZXREYXRlKCkgLSAoKHRhcmdldFRodXJzZGF5LmdldERheSgpICsgNikgJSA3KSArIDMpO1xuXG4gIC8vIFRha2UgSmFudWFyeSA0dGggYXMgaXQgaXMgYWx3YXlzIGluIHdlZWsgMSAoc2VlIElTTyA4NjAxKVxuICB2YXIgZmlyc3RUaHVyc2RheSA9IG5ldyBEYXRlKHRhcmdldFRodXJzZGF5LmdldEZ1bGxZZWFyKCksIDAsIDQpO1xuXG4gIC8vIENoYW5nZSBkYXRlIHRvIFRodXJzZGF5IHNhbWUgd2Vla1xuICBmaXJzdFRodXJzZGF5LnNldERhdGUoZmlyc3RUaHVyc2RheS5nZXREYXRlKCkgLSAoKGZpcnN0VGh1cnNkYXkuZ2V0RGF5KCkgKyA2KSAlIDcpICsgMyk7XG5cbiAgLy8gQ2hlY2sgaWYgZGF5bGlnaHQtc2F2aW5nLXRpbWUtc3dpdGNoIG9jY3VycmVkIGFuZCBjb3JyZWN0IGZvciBpdFxuICB2YXIgZHMgPSB0YXJnZXRUaHVyc2RheS5nZXRUaW1lem9uZU9mZnNldCgpIC0gZmlyc3RUaHVyc2RheS5nZXRUaW1lem9uZU9mZnNldCgpO1xuICB0YXJnZXRUaHVyc2RheS5zZXRIb3Vycyh0YXJnZXRUaHVyc2RheS5nZXRIb3VycygpIC0gZHMpO1xuXG4gIC8vIE51bWJlciBvZiB3ZWVrcyBiZXR3ZWVuIHRhcmdldCBUaHVyc2RheSBhbmQgZmlyc3QgVGh1cnNkYXlcbiAgdmFyIHdlZWtEaWZmID0gKHRhcmdldFRodXJzZGF5IC0gZmlyc3RUaHVyc2RheSkgLyAoODY0MDAwMDAqNyk7XG4gIHJldHVybiAxICsgTWF0aC5mbG9vcih3ZWVrRGlmZik7XG59XG5cbi8qKlxuICogR2V0IElTTy04NjAxIG51bWVyaWMgcmVwcmVzZW50YXRpb24gb2YgdGhlIGRheSBvZiB0aGUgd2Vla1xuICogMSAoZm9yIE1vbmRheSkgdGhyb3VnaCA3IChmb3IgU3VuZGF5KVxuICogXG4gKiBAcGFyYW0gIHtPYmplY3R9IGBkYXRlYFxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5mdW5jdGlvbiBnZXREYXlPZldlZWsoZGF0ZSkge1xuICB2YXIgZG93ID0gZGF0ZS5nZXREYXkoKTtcbiAgaWYoZG93ID09PSAwKSB7XG4gICAgZG93ID0gNztcbiAgfVxuICByZXR1cm4gZG93O1xufVxuXG4vKipcbiAqIGtpbmQtb2Ygc2hvcnRjdXRcbiAqIEBwYXJhbSAgeyp9IHZhbFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiBraW5kT2YodmFsKSB7XG4gIGlmICh2YWwgPT09IG51bGwpIHtcbiAgICByZXR1cm4gJ251bGwnO1xuICB9XG5cbiAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuICd1bmRlZmluZWQnO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB2YWwgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWw7XG4gIH1cblxuICBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XG4gICAgcmV0dXJuICdhcnJheSc7XG4gIH1cblxuICByZXR1cm4ge30udG9TdHJpbmcuY2FsbCh2YWwpXG4gICAgLnNsaWNlKDgsIC0xKS50b0xvd2VyQ2FzZSgpO1xufTtcblxuXG5cbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZShmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gZGF0ZUZvcm1hdDtcbiAgICB9KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGRhdGVGb3JtYXQ7XG4gIH0gZWxzZSB7XG4gICAgZ2xvYmFsLmRhdGVGb3JtYXQgPSBkYXRlRm9ybWF0O1xuICB9XG59KSh0aGlzKTtcbiIsIi8qIVxuICogcmVwZWF0LXN0cmluZyA8aHR0cHM6Ly9naXRodWIuY29tL2pvbnNjaGxpbmtlcnQvcmVwZWF0LXN0cmluZz5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQtMjAxNSwgSm9uIFNjaGxpbmtlcnQuXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFJlc3VsdHMgY2FjaGVcbiAqL1xuXG52YXIgcmVzID0gJyc7XG52YXIgY2FjaGU7XG5cbi8qKlxuICogRXhwb3NlIGByZXBlYXRgXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSByZXBlYXQ7XG5cbi8qKlxuICogUmVwZWF0IHRoZSBnaXZlbiBgc3RyaW5nYCB0aGUgc3BlY2lmaWVkIGBudW1iZXJgXG4gKiBvZiB0aW1lcy5cbiAqXG4gKiAqKkV4YW1wbGU6KipcbiAqXG4gKiBgYGBqc1xuICogdmFyIHJlcGVhdCA9IHJlcXVpcmUoJ3JlcGVhdC1zdHJpbmcnKTtcbiAqIHJlcGVhdCgnQScsIDUpO1xuICogLy89PiBBQUFBQVxuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGBzdHJpbmdgIFRoZSBzdHJpbmcgdG8gcmVwZWF0XG4gKiBAcGFyYW0ge051bWJlcn0gYG51bWJlcmAgVGhlIG51bWJlciBvZiB0aW1lcyB0byByZXBlYXQgdGhlIHN0cmluZ1xuICogQHJldHVybiB7U3RyaW5nfSBSZXBlYXRlZCBzdHJpbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gcmVwZWF0KHN0ciwgbnVtKSB7XG4gIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4cGVjdGVkIGEgc3RyaW5nJyk7XG4gIH1cblxuICAvLyBjb3ZlciBjb21tb24sIHF1aWNrIHVzZSBjYXNlc1xuICBpZiAobnVtID09PSAxKSByZXR1cm4gc3RyO1xuICBpZiAobnVtID09PSAyKSByZXR1cm4gc3RyICsgc3RyO1xuXG4gIHZhciBtYXggPSBzdHIubGVuZ3RoICogbnVtO1xuICBpZiAoY2FjaGUgIT09IHN0ciB8fCB0eXBlb2YgY2FjaGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgY2FjaGUgPSBzdHI7XG4gICAgcmVzID0gJyc7XG4gIH0gZWxzZSBpZiAocmVzLmxlbmd0aCA+PSBtYXgpIHtcbiAgICByZXR1cm4gcmVzLnN1YnN0cigwLCBtYXgpO1xuICB9XG5cbiAgd2hpbGUgKG1heCA+IHJlcy5sZW5ndGggJiYgbnVtID4gMSkge1xuICAgIGlmIChudW0gJiAxKSB7XG4gICAgICByZXMgKz0gc3RyO1xuICAgIH1cblxuICAgIG51bSA+Pj0gMTtcbiAgICBzdHIgKz0gc3RyO1xuICB9XG5cbiAgcmVzICs9IHN0cjtcbiAgcmVzID0gcmVzLnN1YnN0cigwLCBtYXgpO1xuICByZXR1cm4gcmVzO1xufVxuIiwiLyohXG4gKiBwYWQtbGVmdCA8aHR0cHM6Ly9naXRodWIuY29tL2pvbnNjaGxpbmtlcnQvcGFkLWxlZnQ+XG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LTIwMTUsIEpvbiBTY2hsaW5rZXJ0LlxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHJlcGVhdCA9IHJlcXVpcmUoJ3JlcGVhdC1zdHJpbmcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYWRMZWZ0KHN0ciwgbnVtLCBjaCkge1xuICBzdHIgPSBzdHIudG9TdHJpbmcoKTtcblxuICBpZiAodHlwZW9mIG51bSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gc3RyO1xuICB9XG5cbiAgaWYgKGNoID09PSAwKSB7XG4gICAgY2ggPSAnMCc7XG4gIH0gZWxzZSBpZiAoY2gpIHtcbiAgICBjaCA9IGNoLnRvU3RyaW5nKCk7XG4gIH0gZWxzZSB7XG4gICAgY2ggPSAnICc7XG4gIH1cblxuICByZXR1cm4gcmVwZWF0KGNoLCBudW0gLSBzdHIubGVuZ3RoKSArIHN0cjtcbn07XG4iLCJpbXBvcnQgZGF0ZWZvcm1hdCBmcm9tICdkYXRlZm9ybWF0JztcbmltcG9ydCBhc3NpZ24gZnJvbSAnb2JqZWN0LWFzc2lnbic7XG5pbXBvcnQgcGFkTGVmdCBmcm9tICdwYWQtbGVmdCc7XG5pbXBvcnQgeyBnZXRDbGllbnRBUEkgfSBmcm9tICcuL3V0aWwnO1xuXG5jb25zdCBub29wID0gKCkgPT4ge307XG5sZXQgbGluaztcblxuLy8gQWx0ZXJuYXRpdmUgc29sdXRpb24gZm9yIHNhdmluZyBmaWxlcyxcbi8vIGEgYml0IHNsb3dlciBhbmQgZG9lcyBub3Qgd29yayBpbiBTYWZhcmlcbi8vIGZ1bmN0aW9uIGZldGNoQmxvYkZyb21EYXRhVVJMIChkYXRhVVJMKSB7XG4vLyAgIHJldHVybiB3aW5kb3cuZmV0Y2goZGF0YVVSTCkudGhlbihyZXMgPT4gcmVzLmJsb2IoKSk7XG4vLyB9XG5cbmNvbnN0IHN1cHBvcnRlZEVuY29kaW5ncyA9IFtcbiAgJ2ltYWdlL3BuZycsXG4gICdpbWFnZS9qcGVnJyxcbiAgJ2ltYWdlL3dlYnAnXG5dO1xuXG5leHBvcnQgZnVuY3Rpb24gZXhwb3J0Q2FudmFzIChjYW52YXMsIG9wdCA9IHt9KSB7XG4gIGNvbnN0IGVuY29kaW5nID0gb3B0LmVuY29kaW5nIHx8ICdpbWFnZS9wbmcnO1xuICBpZiAoIXN1cHBvcnRlZEVuY29kaW5ncy5pbmNsdWRlcyhlbmNvZGluZykpIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBjYW52YXMgZW5jb2RpbmcgJHtlbmNvZGluZ31gKTtcbiAgbGV0IGV4dGVuc2lvbiA9IChlbmNvZGluZy5zcGxpdCgnLycpWzFdIHx8ICcnKS5yZXBsYWNlKC9qcGVnL2ksICdqcGcnKTtcbiAgaWYgKGV4dGVuc2lvbikgZXh0ZW5zaW9uID0gYC4ke2V4dGVuc2lvbn1gLnRvTG93ZXJDYXNlKCk7XG4gIHJldHVybiB7XG4gICAgZXh0ZW5zaW9uLFxuICAgIHR5cGU6IGVuY29kaW5nLFxuICAgIGRhdGFVUkw6IGNhbnZhcy50b0RhdGFVUkwoZW5jb2RpbmcsIG9wdC5lbmNvZGluZ1F1YWxpdHkpXG4gIH07XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUJsb2JGcm9tRGF0YVVSTCAoZGF0YVVSTCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBjb25zdCBzcGxpdEluZGV4ID0gZGF0YVVSTC5pbmRleE9mKCcsJyk7XG4gICAgaWYgKHNwbGl0SW5kZXggPT09IC0xKSB7XG4gICAgICByZXNvbHZlKG5ldyB3aW5kb3cuQmxvYigpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgYmFzZTY0ID0gZGF0YVVSTC5zbGljZShzcGxpdEluZGV4ICsgMSk7XG4gICAgY29uc3QgYnl0ZVN0cmluZyA9IHdpbmRvdy5hdG9iKGJhc2U2NCk7XG4gICAgY29uc3QgbWltZU1hdGNoID0gL2RhdGE6KFteOytdKTsvLmV4ZWMoZGF0YVVSTCk7XG4gICAgY29uc3QgbWltZSA9IChtaW1lTWF0Y2ggPyBtaW1lTWF0Y2hbMV0gOiAnJykgfHwgdW5kZWZpbmVkO1xuICAgIGNvbnN0IGFiID0gbmV3IEFycmF5QnVmZmVyKGJ5dGVTdHJpbmcubGVuZ3RoKTtcbiAgICBjb25zdCBpYSA9IG5ldyBVaW50OEFycmF5KGFiKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVTdHJpbmcubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlhW2ldID0gYnl0ZVN0cmluZy5jaGFyQ29kZUF0KGkpO1xuICAgIH1cbiAgICByZXNvbHZlKG5ldyB3aW5kb3cuQmxvYihbIGFiIF0sIHsgdHlwZTogbWltZSB9KSk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2F2ZURhdGFVUkwgKGRhdGFVUkwsIG9wdHMgPSB7fSkge1xuICByZXR1cm4gY3JlYXRlQmxvYkZyb21EYXRhVVJMKGRhdGFVUkwpXG4gICAgLnRoZW4oYmxvYiA9PiBzYXZlQmxvYihibG9iLCBvcHRzKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzYXZlQmxvYiAoYmxvYiwgb3B0cyA9IHt9KSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICBvcHRzID0gYXNzaWduKHsgZXh0ZW5zaW9uOiAnJywgcHJlZml4OiAnJywgc3VmZml4OiAnJyB9LCBvcHRzKTtcbiAgICBjb25zdCBmaWxlbmFtZSA9IHJlc29sdmVGaWxlbmFtZShvcHRzKTtcblxuICAgIGNvbnN0IGNsaWVudCA9IGdldENsaWVudEFQSSgpO1xuICAgIGlmIChjbGllbnQgJiYgdHlwZW9mIGNsaWVudC5zYXZlQmxvYiA9PT0gJ2Z1bmN0aW9uJyAmJiBjbGllbnQub3V0cHV0KSB7XG4gICAgICAvLyBuYXRpdmUgc2F2aW5nIHVzaW5nIGEgQ0xJIHRvb2xcbiAgICAgIHJldHVybiBjbGllbnQuc2F2ZUJsb2IoYmxvYiwgYXNzaWduKHt9LCBvcHRzLCB7IGZpbGVuYW1lIH0pKVxuICAgICAgICAudGhlbihldiA9PiByZXNvbHZlKGV2KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGZvcmNlIGRvd25sb2FkXG4gICAgICBpZiAoIWxpbmspIHtcbiAgICAgICAgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgbGluay5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gICAgICAgIGxpbmsudGFyZ2V0ID0gJ19ibGFuayc7XG4gICAgICB9XG4gICAgICBsaW5rLmRvd25sb2FkID0gZmlsZW5hbWU7XG4gICAgICBsaW5rLmhyZWYgPSB3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobGluayk7XG4gICAgICBsaW5rLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGxpbmsub25jbGljayA9IG5vb3A7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHdpbmRvdy5VUkwucmV2b2tlT2JqZWN0VVJMKGJsb2IpO1xuICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQobGluayk7XG4gICAgICAgICAgbGluay5yZW1vdmVBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgICAgICAgICByZXNvbHZlKHsgZmlsZW5hbWUsIGNsaWVudDogZmFsc2UgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICAgIGxpbmsuY2xpY2soKTtcbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2F2ZUZpbGUgKGRhdGEsIG9wdHMgPSB7fSkge1xuICBjb25zdCBwYXJ0cyA9IEFycmF5LmlzQXJyYXkoZGF0YSkgPyBkYXRhIDogWyBkYXRhIF07XG4gIGNvbnN0IGJsb2IgPSBuZXcgd2luZG93LkJsb2IocGFydHMsIHsgdHlwZTogb3B0cy50eXBlIHx8ICcnIH0pO1xuICByZXR1cm4gc2F2ZUJsb2IoYmxvYiwgb3B0cyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRGaWxlTmFtZSAoKSB7XG4gIGNvbnN0IGRhdGVGb3JtYXRTdHIgPSBgeXl5eS5tbS5kZC1ISC5NTS5zc2A7XG4gIHJldHVybiBkYXRlZm9ybWF0KG5ldyBEYXRlKCksIGRhdGVGb3JtYXRTdHIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVmYXVsdEZpbGUgKHByZWZpeCA9ICcnLCBzdWZmaXggPSAnJywgZXh0KSB7XG4gIC8vIGNvbnN0IGRhdGVGb3JtYXRTdHIgPSBgeXl5eS5tbS5kZC1ISC5NTS5zc2A7XG4gIGNvbnN0IGRhdGVGb3JtYXRTdHIgPSBgeXl5eS1tbS1kZCAnYXQnIGguTU0uc3MgVFRgO1xuICByZXR1cm4gYCR7cHJlZml4fSR7ZGF0ZWZvcm1hdChuZXcgRGF0ZSgpLCBkYXRlRm9ybWF0U3RyKX0ke3N1ZmZpeH0ke2V4dH1gO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlRmlsZW5hbWUgKG9wdCA9IHt9KSB7XG4gIG9wdCA9IGFzc2lnbih7fSwgb3B0KTtcblxuICAvLyBDdXN0b20gZmlsZW5hbWUgZnVuY3Rpb25cbiAgaWYgKHR5cGVvZiBvcHQuZmlsZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBvcHQuZmlsZShvcHQpO1xuICB9IGVsc2UgaWYgKG9wdC5maWxlKSB7XG4gICAgcmV0dXJuIG9wdC5maWxlO1xuICB9XG5cbiAgbGV0IGZyYW1lID0gbnVsbDtcbiAgbGV0IGV4dGVuc2lvbiA9ICcnO1xuICBpZiAodHlwZW9mIG9wdC5leHRlbnNpb24gPT09ICdzdHJpbmcnKSBleHRlbnNpb24gPSBvcHQuZXh0ZW5zaW9uO1xuXG4gIGlmICh0eXBlb2Ygb3B0LmZyYW1lID09PSAnbnVtYmVyJykge1xuICAgIGxldCB0b3RhbEZyYW1lcztcbiAgICBpZiAodHlwZW9mIG9wdC50b3RhbEZyYW1lcyA9PT0gJ251bWJlcicpIHtcbiAgICAgIHRvdGFsRnJhbWVzID0gb3B0LnRvdGFsRnJhbWVzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0b3RhbEZyYW1lcyA9IE1hdGgubWF4KDEwMDAsIG9wdC5mcmFtZSk7XG4gICAgfVxuICAgIGZyYW1lID0gcGFkTGVmdChTdHJpbmcob3B0LmZyYW1lKSwgU3RyaW5nKHRvdGFsRnJhbWVzKS5sZW5ndGgsICcwJyk7XG4gIH1cblxuICBjb25zdCBsYXllclN0ciA9IGlzRmluaXRlKG9wdC50b3RhbExheWVycykgJiYgaXNGaW5pdGUob3B0LmxheWVyKSAmJiBvcHQudG90YWxMYXllcnMgPiAxID8gYCR7b3B0LmxheWVyfWAgOiAnJztcbiAgaWYgKGZyYW1lICE9IG51bGwpIHtcbiAgICByZXR1cm4gWyBsYXllclN0ciwgZnJhbWUgXS5maWx0ZXIoQm9vbGVhbikuam9pbignLScpICsgZXh0ZW5zaW9uO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGRlZmF1bHRGaWxlTmFtZSA9IG9wdC50aW1lU3RhbXA7XG4gICAgcmV0dXJuIFsgb3B0LnByZWZpeCwgb3B0Lm5hbWUgfHwgZGVmYXVsdEZpbGVOYW1lLCBsYXllclN0ciwgb3B0Lmhhc2gsIG9wdC5zdWZmaXggXS5maWx0ZXIoQm9vbGVhbikuam9pbignLScpICsgZXh0ZW5zaW9uO1xuICB9XG59XG4iLCIvLyBIYW5kbGUgc29tZSBjb21tb24gdHlwb3NcbmNvbnN0IGNvbW1vblR5cG9zID0ge1xuICBkaW1lbnNpb246ICdkaW1lbnNpb25zJyxcbiAgYW5pbWF0ZWQ6ICdhbmltYXRlJyxcbiAgYW5pbWF0aW5nOiAnYW5pbWF0ZScsXG4gIHVuaXQ6ICd1bml0cycsXG4gIFA1OiAncDUnLFxuICBwaXhlbGxhdGVkOiAncGl4ZWxhdGVkJyxcbiAgbG9vcGluZzogJ2xvb3AnLFxuICBwaXhlbFBlckluY2g6ICdwaXhlbHMnXG59O1xuXG4vLyBIYW5kbGUgYWxsIG90aGVyIHR5cG9zXG5jb25zdCBhbGxLZXlzID0gW1xuICAnZGltZW5zaW9ucycsICd1bml0cycsICdwaXhlbHNQZXJJbmNoJywgJ29yaWVudGF0aW9uJyxcbiAgJ3NjYWxlVG9GaXQnLCAnc2NhbGVUb1ZpZXcnLCAnYmxlZWQnLCAncGl4ZWxSYXRpbycsXG4gICdleHBvcnRQaXhlbFJhdGlvJywgJ21heFBpeGVsUmF0aW8nLCAnc2NhbGVDb250ZXh0JyxcbiAgJ3Jlc2l6ZUNhbnZhcycsICdzdHlsZUNhbnZhcycsICdjYW52YXMnLCAnY29udGV4dCcsICdhdHRyaWJ1dGVzJyxcbiAgJ3BhcmVudCcsICdmaWxlJywgJ25hbWUnLCAncHJlZml4JywgJ3N1ZmZpeCcsICdhbmltYXRlJywgJ3BsYXlpbmcnLFxuICAnbG9vcCcsICdkdXJhdGlvbicsICd0b3RhbEZyYW1lcycsICdmcHMnLCAncGxheWJhY2tSYXRlJywgJ3RpbWVTY2FsZScsXG4gICdmcmFtZScsICd0aW1lJywgJ2ZsdXNoJywgJ3BpeGVsYXRlZCcsICdob3RrZXlzJywgJ3A1JywgJ2lkJyxcbiAgJ3NjYWxlVG9GaXRQYWRkaW5nJywgJ2RhdGEnLCAncGFyYW1zJywgJ2VuY29kaW5nJywgJ2VuY29kaW5nUXVhbGl0eSdcbl07XG5cbi8vIFRoaXMgaXMgZmFpcmx5IG9waW5pb25hdGVkIGFuZCBmb3JjZXMgdXNlcnMgdG8gdXNlIHRoZSAnZGF0YScgcGFyYW1ldGVyXG4vLyBpZiB0aGV5IHdhbnQgdG8gcGFzcyBhbG9uZyBub24tc2V0dGluZyBvYmplY3RzLi4uXG5leHBvcnQgY29uc3QgY2hlY2tTZXR0aW5ncyA9IChzZXR0aW5ncykgPT4ge1xuICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoc2V0dGluZ3MpO1xuICBrZXlzLmZvckVhY2goa2V5ID0+IHtcbiAgICBpZiAoa2V5IGluIGNvbW1vblR5cG9zKSB7XG4gICAgICBjb25zdCBhY3R1YWwgPSBjb21tb25UeXBvc1trZXldO1xuICAgICAgY29uc29sZS53YXJuKGBbY2FudmFzLXNrZXRjaF0gQ291bGQgbm90IHJlY29nbml6ZSB0aGUgc2V0dGluZyBcIiR7a2V5fVwiLCBkaWQgeW91IG1lYW4gXCIke2FjdHVhbH1cIj9gKTtcbiAgICB9IGVsc2UgaWYgKCFhbGxLZXlzLmluY2x1ZGVzKGtleSkpIHtcbiAgICAgIGNvbnNvbGUud2FybihgW2NhbnZhcy1za2V0Y2hdIENvdWxkIG5vdCByZWNvZ25pemUgdGhlIHNldHRpbmcgXCIke2tleX1cImApO1xuICAgIH1cbiAgfSk7XG59O1xuIiwiaW1wb3J0IHsgZ2V0Q2xpZW50QVBJIH0gZnJvbSAnLi4vdXRpbCc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChvcHQgPSB7fSkge1xuICBjb25zdCBoYW5kbGVyID0gZXYgPT4ge1xuICAgIGlmICghb3B0LmVuYWJsZWQoKSkgcmV0dXJuO1xuXG4gICAgY29uc3QgY2xpZW50ID0gZ2V0Q2xpZW50QVBJKCk7XG4gICAgaWYgKGV2LmtleUNvZGUgPT09IDgzICYmICFldi5hbHRLZXkgJiYgKGV2Lm1ldGFLZXkgfHwgZXYuY3RybEtleSkpIHtcbiAgICAgIC8vIENtZCArIFNcbiAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBvcHQuc2F2ZShldik7XG4gICAgfSBlbHNlIGlmIChldi5rZXlDb2RlID09PSAzMikge1xuICAgICAgLy8gU3BhY2VcbiAgICAgIC8vIFRPRE86IHdoYXQgdG8gZG8gd2l0aCB0aGlzPyBrZWVwIGl0LCBvciByZW1vdmUgaXQ/XG4gICAgICBvcHQudG9nZ2xlUGxheShldik7XG4gICAgfSBlbHNlIGlmIChjbGllbnQgJiYgIWV2LmFsdEtleSAmJiBldi5rZXlDb2RlID09PSA3NSAmJiAoZXYubWV0YUtleSB8fCBldi5jdHJsS2V5KSkge1xuICAgICAgLy8gQ21kICsgSywgb25seSB3aGVuIGNhbnZhcy1za2V0Y2gtY2xpIGlzIHVzZWRcbiAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBvcHQuY29tbWl0KGV2KTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgYXR0YWNoID0gKCkgPT4ge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgaGFuZGxlcik7XG4gIH07XG5cbiAgY29uc3QgZGV0YWNoID0gKCkgPT4ge1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgaGFuZGxlcik7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBhdHRhY2gsXG4gICAgZGV0YWNoXG4gIH07XG59XG4iLCJjb25zdCBkZWZhdWx0VW5pdHMgPSAnbW0nO1xuXG5jb25zdCBkYXRhID0gW1xuICAvLyBDb21tb24gUGFwZXIgU2l6ZXNcbiAgLy8gKE1vc3RseSBOb3J0aC1BbWVyaWNhbiBiYXNlZClcbiAgWyAncG9zdGNhcmQnLCAxMDEuNiwgMTUyLjQgXSxcbiAgWyAncG9zdGVyLXNtYWxsJywgMjgwLCA0MzAgXSxcbiAgWyAncG9zdGVyJywgNDYwLCA2MTAgXSxcbiAgWyAncG9zdGVyLWxhcmdlJywgNjEwLCA5MTAgXSxcbiAgWyAnYnVzaW5lc3MtY2FyZCcsIDUwLjgsIDg4LjkgXSxcblxuICAvLyBQaG90b2dyYXBoaWMgUHJpbnQgUGFwZXIgU2l6ZXNcbiAgWyAnMnInLCA2NCwgODkgXSxcbiAgWyAnM3InLCA4OSwgMTI3IF0sXG4gIFsgJzRyJywgMTAyLCAxNTIgXSxcbiAgWyAnNXInLCAxMjcsIDE3OCBdLCAvLyA14oCzeDfigLNcbiAgWyAnNnInLCAxNTIsIDIwMyBdLCAvLyA24oCzeDjigLNcbiAgWyAnOHInLCAyMDMsIDI1NCBdLCAvLyA44oCzeDEw4oCzXG4gIFsgJzEwcicsIDI1NCwgMzA1IF0sIC8vIDEw4oCzeDEy4oCzXG4gIFsgJzExcicsIDI3OSwgMzU2IF0sIC8vIDEx4oCzeDE04oCzXG4gIFsgJzEycicsIDMwNSwgMzgxIF0sXG5cbiAgLy8gU3RhbmRhcmQgUGFwZXIgU2l6ZXNcbiAgWyAnYTAnLCA4NDEsIDExODkgXSxcbiAgWyAnYTEnLCA1OTQsIDg0MSBdLFxuICBbICdhMicsIDQyMCwgNTk0IF0sXG4gIFsgJ2EzJywgMjk3LCA0MjAgXSxcbiAgWyAnYTQnLCAyMTAsIDI5NyBdLFxuICBbICdhNScsIDE0OCwgMjEwIF0sXG4gIFsgJ2E2JywgMTA1LCAxNDggXSxcbiAgWyAnYTcnLCA3NCwgMTA1IF0sXG4gIFsgJ2E4JywgNTIsIDc0IF0sXG4gIFsgJ2E5JywgMzcsIDUyIF0sXG4gIFsgJ2ExMCcsIDI2LCAzNyBdLFxuICBbICcyYTAnLCAxMTg5LCAxNjgyIF0sXG4gIFsgJzRhMCcsIDE2ODIsIDIzNzggXSxcbiAgWyAnYjAnLCAxMDAwLCAxNDE0IF0sXG4gIFsgJ2IxJywgNzA3LCAxMDAwIF0sXG4gIFsgJ2IxKycsIDcyMCwgMTAyMCBdLFxuICBbICdiMicsIDUwMCwgNzA3IF0sXG4gIFsgJ2IyKycsIDUyMCwgNzIwIF0sXG4gIFsgJ2IzJywgMzUzLCA1MDAgXSxcbiAgWyAnYjQnLCAyNTAsIDM1MyBdLFxuICBbICdiNScsIDE3NiwgMjUwIF0sXG4gIFsgJ2I2JywgMTI1LCAxNzYgXSxcbiAgWyAnYjcnLCA4OCwgMTI1IF0sXG4gIFsgJ2I4JywgNjIsIDg4IF0sXG4gIFsgJ2I5JywgNDQsIDYyIF0sXG4gIFsgJ2IxMCcsIDMxLCA0NCBdLFxuICBbICdiMTEnLCAyMiwgMzIgXSxcbiAgWyAnYjEyJywgMTYsIDIyIF0sXG4gIFsgJ2MwJywgOTE3LCAxMjk3IF0sXG4gIFsgJ2MxJywgNjQ4LCA5MTcgXSxcbiAgWyAnYzInLCA0NTgsIDY0OCBdLFxuICBbICdjMycsIDMyNCwgNDU4IF0sXG4gIFsgJ2M0JywgMjI5LCAzMjQgXSxcbiAgWyAnYzUnLCAxNjIsIDIyOSBdLFxuICBbICdjNicsIDExNCwgMTYyIF0sXG4gIFsgJ2M3JywgODEsIDExNCBdLFxuICBbICdjOCcsIDU3LCA4MSBdLFxuICBbICdjOScsIDQwLCA1NyBdLFxuICBbICdjMTAnLCAyOCwgNDAgXSxcbiAgWyAnYzExJywgMjIsIDMyIF0sXG4gIFsgJ2MxMicsIDE2LCAyMiBdLFxuXG4gIC8vIFVzZSBpbmNoZXMgZm9yIE5vcnRoIEFtZXJpY2FuIHNpemVzLFxuICAvLyBhcyBpdCBwcm9kdWNlcyBsZXNzIGZsb2F0IHByZWNpc2lvbiBlcnJvcnNcbiAgWyAnaGFsZi1sZXR0ZXInLCA1LjUsIDguNSwgJ2luJyBdLFxuICBbICdsZXR0ZXInLCA4LjUsIDExLCAnaW4nIF0sXG4gIFsgJ2xlZ2FsJywgOC41LCAxNCwgJ2luJyBdLFxuICBbICdqdW5pb3ItbGVnYWwnLCA1LCA4LCAnaW4nIF0sXG4gIFsgJ2xlZGdlcicsIDExLCAxNywgJ2luJyBdLFxuICBbICd0YWJsb2lkJywgMTEsIDE3LCAnaW4nIF0sXG4gIFsgJ2Fuc2ktYScsIDguNSwgMTEuMCwgJ2luJyBdLFxuICBbICdhbnNpLWInLCAxMS4wLCAxNy4wLCAnaW4nIF0sXG4gIFsgJ2Fuc2ktYycsIDE3LjAsIDIyLjAsICdpbicgXSxcbiAgWyAnYW5zaS1kJywgMjIuMCwgMzQuMCwgJ2luJyBdLFxuICBbICdhbnNpLWUnLCAzNC4wLCA0NC4wLCAnaW4nIF0sXG4gIFsgJ2FyY2gtYScsIDksIDEyLCAnaW4nIF0sXG4gIFsgJ2FyY2gtYicsIDEyLCAxOCwgJ2luJyBdLFxuICBbICdhcmNoLWMnLCAxOCwgMjQsICdpbicgXSxcbiAgWyAnYXJjaC1kJywgMjQsIDM2LCAnaW4nIF0sXG4gIFsgJ2FyY2gtZScsIDM2LCA0OCwgJ2luJyBdLFxuICBbICdhcmNoLWUxJywgMzAsIDQyLCAnaW4nIF0sXG4gIFsgJ2FyY2gtZTInLCAyNiwgMzgsICdpbicgXSxcbiAgWyAnYXJjaC1lMycsIDI3LCAzOSwgJ2luJyBdXG5dO1xuXG5leHBvcnQgZGVmYXVsdCBkYXRhLnJlZHVjZSgoZGljdCwgcHJlc2V0KSA9PiB7XG4gIGNvbnN0IGl0ZW0gPSB7XG4gICAgdW5pdHM6IHByZXNldFszXSB8fCBkZWZhdWx0VW5pdHMsXG4gICAgZGltZW5zaW9uczogWyBwcmVzZXRbMV0sIHByZXNldFsyXSBdXG4gIH07XG4gIGRpY3RbcHJlc2V0WzBdXSA9IGl0ZW07XG4gIGRpY3RbcHJlc2V0WzBdLnJlcGxhY2UoLy0vZywgJyAnKV0gPSBpdGVtO1xuICByZXR1cm4gZGljdDtcbn0sIHt9KTtcbiIsImltcG9ydCBwYXBlclNpemVzIGZyb20gJy4vcGFwZXItc2l6ZXMnO1xuaW1wb3J0IGNvbnZlcnRMZW5ndGggZnJvbSAnY29udmVydC1sZW5ndGgnO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGltZW5zaW9uc0Zyb21QcmVzZXQgKGRpbWVuc2lvbnMsIHVuaXRzVG8gPSAncHgnLCBwaXhlbHNQZXJJbmNoID0gNzIpIHtcbiAgaWYgKHR5cGVvZiBkaW1lbnNpb25zID09PSAnc3RyaW5nJykge1xuICAgIGNvbnN0IGtleSA9IGRpbWVuc2lvbnMudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAoIShrZXkgaW4gcGFwZXJTaXplcykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIGRpbWVuc2lvbiBwcmVzZXQgXCIke2RpbWVuc2lvbnN9XCIgaXMgbm90IHN1cHBvcnRlZCBvciBjb3VsZCBub3QgYmUgZm91bmQ7IHRyeSB1c2luZyBhNCwgYTMsIHBvc3RjYXJkLCBsZXR0ZXIsIGV0Yy5gKVxuICAgIH1cbiAgICBjb25zdCBwcmVzZXQgPSBwYXBlclNpemVzW2tleV07XG4gICAgcmV0dXJuIHByZXNldC5kaW1lbnNpb25zLm1hcChkID0+IHtcbiAgICAgIHJldHVybiBjb252ZXJ0RGlzdGFuY2UoZCwgcHJlc2V0LnVuaXRzLCB1bml0c1RvLCBwaXhlbHNQZXJJbmNoKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZGltZW5zaW9ucztcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29udmVydERpc3RhbmNlIChkaW1lbnNpb24sIHVuaXRzRnJvbSA9ICdweCcsIHVuaXRzVG8gPSAncHgnLCBwaXhlbHNQZXJJbmNoID0gNzIpIHtcbiAgcmV0dXJuIGNvbnZlcnRMZW5ndGgoZGltZW5zaW9uLCB1bml0c0Zyb20sIHVuaXRzVG8sIHtcbiAgICBwaXhlbHNQZXJJbmNoLFxuICAgIHByZWNpc2lvbjogNCxcbiAgICByb3VuZFBpeGVsOiB0cnVlXG4gIH0pO1xufVxuIiwiaW1wb3J0IGRlZmluZWQgZnJvbSAnZGVmaW5lZCc7XG5pbXBvcnQgeyBnZXREaW1lbnNpb25zRnJvbVByZXNldCwgY29udmVydERpc3RhbmNlIH0gZnJvbSAnLi4vZGlzdGFuY2VzJztcbmltcG9ydCB7IGlzQnJvd3NlciB9IGZyb20gJy4uL3V0aWwnO1xuXG5mdW5jdGlvbiBjaGVja0lmSGFzRGltZW5zaW9ucyAoc2V0dGluZ3MpIHtcbiAgaWYgKCFzZXR0aW5ncy5kaW1lbnNpb25zKSByZXR1cm4gZmFsc2U7XG4gIGlmICh0eXBlb2Ygc2V0dGluZ3MuZGltZW5zaW9ucyA9PT0gJ3N0cmluZycpIHJldHVybiB0cnVlO1xuICBpZiAoQXJyYXkuaXNBcnJheShzZXR0aW5ncy5kaW1lbnNpb25zKSAmJiBzZXR0aW5ncy5kaW1lbnNpb25zLmxlbmd0aCA+PSAyKSByZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBnZXRQYXJlbnRTaXplIChwcm9wcywgc2V0dGluZ3MpIHtcbiAgLy8gV2hlbiBubyB7IGRpbWVuc2lvbiB9IGlzIHBhc3NlZCBpbiBub2RlLCB3ZSBkZWZhdWx0IHRvIEhUTUwgY2FudmFzIHNpemVcbiAgaWYgKCFpc0Jyb3dzZXIoKSkge1xuICAgIHJldHVybiBbIDMwMCwgMTUwIF07XG4gIH1cblxuICBsZXQgZWxlbWVudCA9IHNldHRpbmdzLnBhcmVudCB8fCB3aW5kb3c7XG5cbiAgaWYgKGVsZW1lbnQgPT09IHdpbmRvdyB8fFxuICAgICAgZWxlbWVudCA9PT0gZG9jdW1lbnQgfHxcbiAgICAgIGVsZW1lbnQgPT09IGRvY3VtZW50LmJvZHkpIHtcbiAgICByZXR1cm4gWyB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0IF07XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHJldHVybiBbIHdpZHRoLCBoZWlnaHQgXTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZXNpemVDYW52YXMgKHByb3BzLCBzZXR0aW5ncykge1xuICBsZXQgd2lkdGgsIGhlaWdodDtcbiAgbGV0IHN0eWxlV2lkdGgsIHN0eWxlSGVpZ2h0O1xuICBsZXQgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodDtcblxuICBjb25zdCBicm93c2VyID0gaXNCcm93c2VyKCk7XG4gIGNvbnN0IGRpbWVuc2lvbnMgPSBzZXR0aW5ncy5kaW1lbnNpb25zO1xuICBjb25zdCBoYXNEaW1lbnNpb25zID0gY2hlY2tJZkhhc0RpbWVuc2lvbnMoc2V0dGluZ3MpO1xuICBjb25zdCBleHBvcnRpbmcgPSBwcm9wcy5leHBvcnRpbmc7XG4gIGxldCBzY2FsZVRvRml0ID0gaGFzRGltZW5zaW9ucyA/IHNldHRpbmdzLnNjYWxlVG9GaXQgIT09IGZhbHNlIDogZmFsc2U7XG4gIGxldCBzY2FsZVRvVmlldyA9ICghZXhwb3J0aW5nICYmIGhhc0RpbWVuc2lvbnMpID8gc2V0dGluZ3Muc2NhbGVUb1ZpZXcgOiB0cnVlO1xuICAvLyBpbiBub2RlLCBjYW5jZWwgYm90aCBvZiB0aGVzZSBvcHRpb25zXG4gIGlmICghYnJvd3Nlcikgc2NhbGVUb0ZpdCA9IHNjYWxlVG9WaWV3ID0gZmFsc2U7XG4gIGNvbnN0IHVuaXRzID0gc2V0dGluZ3MudW5pdHM7XG4gIGNvbnN0IHBpeGVsc1BlckluY2ggPSAodHlwZW9mIHNldHRpbmdzLnBpeGVsc1BlckluY2ggPT09ICdudW1iZXInICYmIGlzRmluaXRlKHNldHRpbmdzLnBpeGVsc1BlckluY2gpKSA/IHNldHRpbmdzLnBpeGVsc1BlckluY2ggOiA3MjtcbiAgY29uc3QgYmxlZWQgPSBkZWZpbmVkKHNldHRpbmdzLmJsZWVkLCAwKTtcblxuICBjb25zdCBkZXZpY2VQaXhlbFJhdGlvID0gYnJvd3NlciA/IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIDogMTtcbiAgY29uc3QgYmFzZVBpeGVsUmF0aW8gPSBzY2FsZVRvVmlldyA/IGRldmljZVBpeGVsUmF0aW8gOiAxO1xuXG4gIGxldCBwaXhlbFJhdGlvLCBleHBvcnRQaXhlbFJhdGlvO1xuXG4gIC8vIElmIGEgcGl4ZWwgcmF0aW8gaXMgc3BlY2lmaWVkLCB3ZSB3aWxsIHVzZSBpdC5cbiAgLy8gT3RoZXJ3aXNlOlxuICAvLyAgLT4gSWYgZGltZW5zaW9uIGlzIHNwZWNpZmllZCwgdXNlIGJhc2UgcmF0aW8gKGkuZS4gc2l6ZSBmb3IgZXhwb3J0KVxuICAvLyAgLT4gSWYgbm8gZGltZW5zaW9uIGlzIHNwZWNpZmllZCwgdXNlIGRldmljZSByYXRpbyAoaS5lLiBzaXplIGZvciBzY3JlZW4pXG4gIGlmICh0eXBlb2Ygc2V0dGluZ3MucGl4ZWxSYXRpbyA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoc2V0dGluZ3MucGl4ZWxSYXRpbykpIHtcbiAgICAvLyBXaGVuIHsgcGl4ZWxSYXRpbyB9IGlzIHNwZWNpZmllZCwgaXQncyBhbHNvIHVzZWQgYXMgZGVmYXVsdCBleHBvcnRQaXhlbFJhdGlvLlxuICAgIHBpeGVsUmF0aW8gPSBzZXR0aW5ncy5waXhlbFJhdGlvO1xuICAgIGV4cG9ydFBpeGVsUmF0aW8gPSBkZWZpbmVkKHNldHRpbmdzLmV4cG9ydFBpeGVsUmF0aW8sIHBpeGVsUmF0aW8pO1xuICB9IGVsc2Uge1xuICAgIGlmIChoYXNEaW1lbnNpb25zKSB7XG4gICAgICAvLyBXaGVuIGEgZGltZW5zaW9uIGlzIHNwZWNpZmllZCwgdXNlIHRoZSBiYXNlIHJhdGlvIHJhdGhlciB0aGFuIHNjcmVlbiByYXRpb1xuICAgICAgcGl4ZWxSYXRpbyA9IGJhc2VQaXhlbFJhdGlvO1xuICAgICAgLy8gRGVmYXVsdCB0byBhIHBpeGVsIHJhdGlvIG9mIDEgc28gdGhhdCB5b3UgZW5kIHVwIHdpdGggdGhlIHNhbWUgZGltZW5zaW9uXG4gICAgICAvLyB5b3Ugc3BlY2lmaWVkLCBpLmUuIFsgNTAwLCA1MDAgXSBpcyBleHBvcnRlZCBhcyA1MDB4NTAwIHB4XG4gICAgICBleHBvcnRQaXhlbFJhdGlvID0gZGVmaW5lZChzZXR0aW5ncy5leHBvcnRQaXhlbFJhdGlvLCAxKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTm8gZGltZW5zaW9uIGlzIHNwZWNpZmllZCwgYXNzdW1lIGZ1bGwtc2NyZWVuIHNpemluZ1xuICAgICAgcGl4ZWxSYXRpbyA9IGRldmljZVBpeGVsUmF0aW87XG4gICAgICAvLyBEZWZhdWx0IHRvIHNjcmVlbiBwaXhlbCByYXRpbywgc28gdGhhdCBpdCdzIGxpa2UgdGFraW5nIGEgZGV2aWNlIHNjcmVlbnNob3RcbiAgICAgIGV4cG9ydFBpeGVsUmF0aW8gPSBkZWZpbmVkKHNldHRpbmdzLmV4cG9ydFBpeGVsUmF0aW8sIHBpeGVsUmF0aW8pO1xuICAgIH1cbiAgfVxuXG4gIC8vIENsYW1wIHBpeGVsIHJhdGlvXG4gIGlmICh0eXBlb2Ygc2V0dGluZ3MubWF4UGl4ZWxSYXRpbyA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoc2V0dGluZ3MubWF4UGl4ZWxSYXRpbykpIHtcbiAgICBwaXhlbFJhdGlvID0gTWF0aC5taW4oc2V0dGluZ3MubWF4UGl4ZWxSYXRpbywgcGl4ZWxSYXRpbyk7XG4gICAgZXhwb3J0UGl4ZWxSYXRpbyA9IE1hdGgubWluKHNldHRpbmdzLm1heFBpeGVsUmF0aW8sIGV4cG9ydFBpeGVsUmF0aW8pO1xuICB9XG5cbiAgLy8gSGFuZGxlIGV4cG9ydCBwaXhlbCByYXRpb1xuICBpZiAoZXhwb3J0aW5nKSB7XG4gICAgcGl4ZWxSYXRpbyA9IGV4cG9ydFBpeGVsUmF0aW87XG4gIH1cblxuICAvLyBwYXJlbnRXaWR0aCA9IHR5cGVvZiBwYXJlbnRXaWR0aCA9PT0gJ3VuZGVmaW5lZCcgPyBkZWZhdWx0Tm9kZVNpemVbMF0gOiBwYXJlbnRXaWR0aDtcbiAgLy8gcGFyZW50SGVpZ2h0ID0gdHlwZW9mIHBhcmVudEhlaWdodCA9PT0gJ3VuZGVmaW5lZCcgPyBkZWZhdWx0Tm9kZVNpemVbMV0gOiBwYXJlbnRIZWlnaHQ7XG5cbiAgbGV0IFsgcGFyZW50V2lkdGgsIHBhcmVudEhlaWdodCBdID0gZ2V0UGFyZW50U2l6ZShwcm9wcywgc2V0dGluZ3MpO1xuICBsZXQgdHJpbVdpZHRoLCB0cmltSGVpZ2h0O1xuXG4gIC8vIFlvdSBjYW4gc3BlY2lmeSBhIGRpbWVuc2lvbnMgaW4gcGl4ZWxzIG9yIGNtL20vaW4vZXRjXG4gIGlmIChoYXNEaW1lbnNpb25zKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gZ2V0RGltZW5zaW9uc0Zyb21QcmVzZXQoZGltZW5zaW9ucywgdW5pdHMsIHBpeGVsc1BlckluY2gpO1xuICAgIGNvbnN0IGhpZ2hlc3QgPSBNYXRoLm1heChyZXN1bHRbMF0sIHJlc3VsdFsxXSk7XG4gICAgY29uc3QgbG93ZXN0ID0gTWF0aC5taW4ocmVzdWx0WzBdLCByZXN1bHRbMV0pO1xuICAgIGlmIChzZXR0aW5ncy5vcmllbnRhdGlvbikge1xuICAgICAgY29uc3QgbGFuZHNjYXBlID0gc2V0dGluZ3Mub3JpZW50YXRpb24gPT09ICdsYW5kc2NhcGUnO1xuICAgICAgd2lkdGggPSBsYW5kc2NhcGUgPyBoaWdoZXN0IDogbG93ZXN0O1xuICAgICAgaGVpZ2h0ID0gbGFuZHNjYXBlID8gbG93ZXN0IDogaGlnaGVzdDtcbiAgICB9IGVsc2Uge1xuICAgICAgd2lkdGggPSByZXN1bHRbMF07XG4gICAgICBoZWlnaHQgPSByZXN1bHRbMV07XG4gICAgfVxuXG4gICAgdHJpbVdpZHRoID0gd2lkdGg7XG4gICAgdHJpbUhlaWdodCA9IGhlaWdodDtcblxuICAgIC8vIEFwcGx5IGJsZWVkIHdoaWNoIGlzIGFzc3VtZWQgdG8gYmUgaW4gdGhlIHNhbWUgdW5pdHNcbiAgICB3aWR0aCArPSBibGVlZCAqIDI7XG4gICAgaGVpZ2h0ICs9IGJsZWVkICogMjtcbiAgfSBlbHNlIHtcbiAgICB3aWR0aCA9IHBhcmVudFdpZHRoO1xuICAgIGhlaWdodCA9IHBhcmVudEhlaWdodDtcbiAgICB0cmltV2lkdGggPSB3aWR0aDtcbiAgICB0cmltSGVpZ2h0ID0gaGVpZ2h0O1xuICB9XG5cbiAgLy8gUmVhbCBzaXplIGluIHBpeGVscyBhZnRlciBQUEkgaXMgdGFrZW4gaW50byBhY2NvdW50XG4gIGxldCByZWFsV2lkdGggPSB3aWR0aDtcbiAgbGV0IHJlYWxIZWlnaHQgPSBoZWlnaHQ7XG4gIGlmIChoYXNEaW1lbnNpb25zICYmIHVuaXRzKSB7XG4gICAgLy8gQ29udmVydCB0byBkaWdpdGFsL3BpeGVsIHVuaXRzIGlmIG5lY2Vzc2FyeVxuICAgIHJlYWxXaWR0aCA9IGNvbnZlcnREaXN0YW5jZSh3aWR0aCwgdW5pdHMsICdweCcsIHBpeGVsc1BlckluY2gpO1xuICAgIHJlYWxIZWlnaHQgPSBjb252ZXJ0RGlzdGFuY2UoaGVpZ2h0LCB1bml0cywgJ3B4JywgcGl4ZWxzUGVySW5jaCk7XG4gIH1cblxuICAvLyBIb3cgYmlnIHRvIHNldCB0aGUgJ3ZpZXcnIG9mIHRoZSBjYW52YXMgaW4gdGhlIGJyb3dzZXIgKGkuZS4gc3R5bGUpXG4gIHN0eWxlV2lkdGggPSBNYXRoLnJvdW5kKHJlYWxXaWR0aCk7XG4gIHN0eWxlSGVpZ2h0ID0gTWF0aC5yb3VuZChyZWFsSGVpZ2h0KTtcblxuICAvLyBJZiB3ZSB3aXNoIHRvIHNjYWxlIHRoZSB2aWV3IHRvIHRoZSBicm93c2VyIHdpbmRvd1xuICBpZiAoc2NhbGVUb0ZpdCAmJiAhZXhwb3J0aW5nICYmIGhhc0RpbWVuc2lvbnMpIHtcbiAgICBjb25zdCBhc3BlY3QgPSB3aWR0aCAvIGhlaWdodDtcbiAgICBjb25zdCB3aW5kb3dBc3BlY3QgPSBwYXJlbnRXaWR0aCAvIHBhcmVudEhlaWdodDtcbiAgICBjb25zdCBzY2FsZVRvRml0UGFkZGluZyA9IGRlZmluZWQoc2V0dGluZ3Muc2NhbGVUb0ZpdFBhZGRpbmcsIDQwKTtcbiAgICBjb25zdCBtYXhXaWR0aCA9IE1hdGgucm91bmQocGFyZW50V2lkdGggLSBzY2FsZVRvRml0UGFkZGluZyAqIDIpO1xuICAgIGNvbnN0IG1heEhlaWdodCA9IE1hdGgucm91bmQocGFyZW50SGVpZ2h0IC0gc2NhbGVUb0ZpdFBhZGRpbmcgKiAyKTtcbiAgICBpZiAoc3R5bGVXaWR0aCA+IG1heFdpZHRoIHx8IHN0eWxlSGVpZ2h0ID4gbWF4SGVpZ2h0KSB7XG4gICAgICBpZiAod2luZG93QXNwZWN0ID4gYXNwZWN0KSB7XG4gICAgICAgIHN0eWxlSGVpZ2h0ID0gbWF4SGVpZ2h0O1xuICAgICAgICBzdHlsZVdpZHRoID0gTWF0aC5yb3VuZChzdHlsZUhlaWdodCAqIGFzcGVjdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHlsZVdpZHRoID0gbWF4V2lkdGg7XG4gICAgICAgIHN0eWxlSGVpZ2h0ID0gTWF0aC5yb3VuZChzdHlsZVdpZHRoIC8gYXNwZWN0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjYW52YXNXaWR0aCA9IHNjYWxlVG9WaWV3ID8gTWF0aC5yb3VuZChwaXhlbFJhdGlvICogc3R5bGVXaWR0aCkgOiBNYXRoLnJvdW5kKHBpeGVsUmF0aW8gKiByZWFsV2lkdGgpO1xuICBjYW52YXNIZWlnaHQgPSBzY2FsZVRvVmlldyA/IE1hdGgucm91bmQocGl4ZWxSYXRpbyAqIHN0eWxlSGVpZ2h0KSA6IE1hdGgucm91bmQocGl4ZWxSYXRpbyAqIHJlYWxIZWlnaHQpO1xuXG4gIGNvbnN0IHZpZXdwb3J0V2lkdGggPSBzY2FsZVRvVmlldyA/IE1hdGgucm91bmQoc3R5bGVXaWR0aCkgOiBNYXRoLnJvdW5kKHJlYWxXaWR0aCk7XG4gIGNvbnN0IHZpZXdwb3J0SGVpZ2h0ID0gc2NhbGVUb1ZpZXcgPyBNYXRoLnJvdW5kKHN0eWxlSGVpZ2h0KSA6IE1hdGgucm91bmQocmVhbEhlaWdodCk7XG5cbiAgY29uc3Qgc2NhbGVYID0gY2FudmFzV2lkdGggLyB3aWR0aDtcbiAgY29uc3Qgc2NhbGVZID0gY2FudmFzSGVpZ2h0IC8gaGVpZ2h0O1xuXG4gIC8vIEFzc2lnbiB0byBjdXJyZW50IHByb3BzXG4gIHJldHVybiB7XG4gICAgYmxlZWQsXG4gICAgcGl4ZWxSYXRpbyxcbiAgICB3aWR0aCxcbiAgICBoZWlnaHQsXG4gICAgZGltZW5zaW9uczogWyB3aWR0aCwgaGVpZ2h0IF0sXG4gICAgdW5pdHM6IHVuaXRzIHx8ICdweCcsXG4gICAgc2NhbGVYLFxuICAgIHNjYWxlWSxcbiAgICB2aWV3cG9ydFdpZHRoLFxuICAgIHZpZXdwb3J0SGVpZ2h0LFxuICAgIGNhbnZhc1dpZHRoLFxuICAgIGNhbnZhc0hlaWdodCxcbiAgICB0cmltV2lkdGgsXG4gICAgdHJpbUhlaWdodCxcbiAgICBzdHlsZVdpZHRoLFxuICAgIHN0eWxlSGVpZ2h0XG4gIH07XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGdldENhbnZhc0NvbnRleHRcbmZ1bmN0aW9uIGdldENhbnZhc0NvbnRleHQgKHR5cGUsIG9wdHMpIHtcbiAgaWYgKHR5cGVvZiB0eXBlICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ211c3Qgc3BlY2lmeSB0eXBlIHN0cmluZycpXG4gIH1cblxuICBvcHRzID0gb3B0cyB8fCB7fVxuXG4gIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnICYmICFvcHRzLmNhbnZhcykge1xuICAgIHJldHVybiBudWxsIC8vIGNoZWNrIGZvciBOb2RlXG4gIH1cblxuICB2YXIgY2FudmFzID0gb3B0cy5jYW52YXMgfHwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcbiAgaWYgKHR5cGVvZiBvcHRzLndpZHRoID09PSAnbnVtYmVyJykge1xuICAgIGNhbnZhcy53aWR0aCA9IG9wdHMud2lkdGhcbiAgfVxuICBpZiAodHlwZW9mIG9wdHMuaGVpZ2h0ID09PSAnbnVtYmVyJykge1xuICAgIGNhbnZhcy5oZWlnaHQgPSBvcHRzLmhlaWdodFxuICB9XG5cbiAgdmFyIGF0dHJpYnMgPSBvcHRzXG4gIHZhciBnbFxuICB0cnkge1xuICAgIHZhciBuYW1lcyA9IFsgdHlwZSBdXG4gICAgLy8gcHJlZml4IEdMIGNvbnRleHRzXG4gICAgaWYgKHR5cGUuaW5kZXhPZignd2ViZ2wnKSA9PT0gMCkge1xuICAgICAgbmFtZXMucHVzaCgnZXhwZXJpbWVudGFsLScgKyB0eXBlKVxuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGdsID0gY2FudmFzLmdldENvbnRleHQobmFtZXNbaV0sIGF0dHJpYnMpXG4gICAgICBpZiAoZ2wpIHJldHVybiBnbFxuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIGdsID0gbnVsbFxuICB9XG4gIHJldHVybiAoZ2wgfHwgbnVsbCkgLy8gZW5zdXJlIG51bGwgb24gZmFpbFxufVxuIiwiaW1wb3J0IGFzc2lnbiBmcm9tICdvYmplY3QtYXNzaWduJztcbmltcG9ydCBnZXRDYW52YXNDb250ZXh0IGZyb20gJ2dldC1jYW52YXMtY29udGV4dCc7XG5pbXBvcnQgeyBpc0Jyb3dzZXIgfSBmcm9tICcuLi91dGlsJztcblxuZnVuY3Rpb24gY3JlYXRlQ2FudmFzRWxlbWVudCAoKSB7XG4gIGlmICghaXNCcm93c2VyKCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0l0IGFwcGVhcnMgeW91IGFyZSBydW5pbmcgZnJvbSBOb2RlLmpzIG9yIGEgbm9uLWJyb3dzZXIgZW52aXJvbm1lbnQuIFRyeSBwYXNzaW5nIGluIGFuIGV4aXN0aW5nIHsgY2FudmFzIH0gaW50ZXJmYWNlIGluc3RlYWQuJyk7XG4gIH1cbiAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVDYW52YXMgKHNldHRpbmdzID0ge30pIHtcbiAgbGV0IGNvbnRleHQsIGNhbnZhcztcbiAgbGV0IG93bnNDYW52YXMgPSBmYWxzZTtcbiAgaWYgKHNldHRpbmdzLmNhbnZhcyAhPT0gZmFsc2UpIHtcbiAgICAvLyBEZXRlcm1pbmUgdGhlIGNhbnZhcyBhbmQgY29udGV4dCB0byBjcmVhdGVcbiAgICBjb250ZXh0ID0gc2V0dGluZ3MuY29udGV4dDtcbiAgICBpZiAoIWNvbnRleHQgfHwgdHlwZW9mIGNvbnRleHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBsZXQgbmV3Q2FudmFzID0gc2V0dGluZ3MuY2FudmFzO1xuICAgICAgaWYgKCFuZXdDYW52YXMpIHtcbiAgICAgICAgbmV3Q2FudmFzID0gY3JlYXRlQ2FudmFzRWxlbWVudCgpO1xuICAgICAgICBvd25zQ2FudmFzID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHR5cGUgPSBjb250ZXh0IHx8ICcyZCc7XG4gICAgICBpZiAodHlwZW9mIG5ld0NhbnZhcy5nZXRDb250ZXh0ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIHNwZWNpZmllZCB7IGNhbnZhcyB9IGVsZW1lbnQgZG9lcyBub3QgaGF2ZSBhIGdldENvbnRleHQoKSBmdW5jdGlvbiwgbWF5YmUgaXQgaXMgbm90IGEgPGNhbnZhcz4gdGFnP2ApO1xuICAgICAgfVxuICAgICAgY29udGV4dCA9IGdldENhbnZhc0NvbnRleHQodHlwZSwgYXNzaWduKHt9LCBzZXR0aW5ncy5hdHRyaWJ1dGVzLCB7IGNhbnZhczogbmV3Q2FudmFzIH0pKTtcbiAgICAgIGlmICghY29udGV4dCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCBhdCBjYW52YXMuZ2V0Q29udGV4dCgnJHt0eXBlfScpIC0gdGhlIGJyb3dzZXIgbWF5IG5vdCBzdXBwb3J0IHRoaXMgY29udGV4dCwgb3IgYSBkaWZmZXJlbnQgY29udGV4dCBtYXkgYWxyZWFkeSBiZSBpbiB1c2Ugd2l0aCB0aGlzIGNhbnZhcy5gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjYW52YXMgPSBjb250ZXh0LmNhbnZhcztcbiAgICAvLyBFbnN1cmUgY29udGV4dCBtYXRjaGVzIHVzZXIncyBjYW52YXMgZXhwZWN0YXRpb25zXG4gICAgaWYgKHNldHRpbmdzLmNhbnZhcyAmJiBjYW52YXMgIT09IHNldHRpbmdzLmNhbnZhcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgeyBjYW52YXMgfSBhbmQgeyBjb250ZXh0IH0gc2V0dGluZ3MgbXVzdCBwb2ludCB0byB0aGUgc2FtZSB1bmRlcmx5aW5nIGNhbnZhcyBlbGVtZW50Jyk7XG4gICAgfVxuXG4gICAgLy8gQXBwbHkgcGl4ZWxhdGlvbiB0byBjYW52YXMgaWYgbmVjZXNzYXJ5LCB0aGlzIGlzIG1vc3RseSBhIGNvbnZlbmllbmNlIHV0aWxpdHlcbiAgICBpZiAoc2V0dGluZ3MucGl4ZWxhdGVkKSB7XG4gICAgICBjb250ZXh0LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuICAgICAgY29udGV4dC5tb3pJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICAgIGNvbnRleHQub0ltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuICAgICAgY29udGV4dC53ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICAgIGNvbnRleHQubXNJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICAgIGNhbnZhcy5zdHlsZVsnaW1hZ2UtcmVuZGVyaW5nJ10gPSAncGl4ZWxhdGVkJztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHsgY2FudmFzLCBjb250ZXh0LCBvd25zQ2FudmFzIH07XG59XG4iLCJpbXBvcnQgZGVmaW5lZCBmcm9tICdkZWZpbmVkJztcbmltcG9ydCBhc3NpZ24gZnJvbSAnb2JqZWN0LWFzc2lnbic7XG5pbXBvcnQgcmlnaHROb3cgZnJvbSAncmlnaHQtbm93JztcbmltcG9ydCBpc1Byb21pc2UgZnJvbSAnaXMtcHJvbWlzZSc7XG5pbXBvcnQgeyBpc0Jyb3dzZXIsIGlzV2ViR0xDb250ZXh0LCBpc0NhbnZhcywgZ2V0Q2xpZW50QVBJIH0gZnJvbSAnLi4vdXRpbCc7XG5pbXBvcnQgZGVlcEVxdWFsIGZyb20gJ2RlZXAtZXF1YWwnO1xuaW1wb3J0IHsgc2F2ZUZpbGUsIHNhdmVEYXRhVVJMLCBnZXRGaWxlTmFtZSwgZXhwb3J0Q2FudmFzIH0gZnJvbSAnLi4vc2F2ZSc7XG5pbXBvcnQgeyBjaGVja1NldHRpbmdzIH0gZnJvbSAnLi4vYWNjZXNzaWJpbGl0eSc7XG5cbmltcG9ydCBrZXlib2FyZFNob3J0Y3V0cyBmcm9tICcuL2tleWJvYXJkU2hvcnRjdXRzJztcbmltcG9ydCByZXNpemVDYW52YXMgZnJvbSAnLi9yZXNpemVDYW52YXMnO1xuaW1wb3J0IGNyZWF0ZUNhbnZhcyBmcm9tICcuL2NyZWF0ZUNhbnZhcyc7XG5cbmNsYXNzIFNrZXRjaE1hbmFnZXIge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgdGhpcy5fc2V0dGluZ3MgPSB7fTtcbiAgICB0aGlzLl9wcm9wcyA9IHt9O1xuICAgIHRoaXMuX3NrZXRjaCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9yYWYgPSBudWxsO1xuXG4gICAgLy8gU29tZSBoYWNreSB0aGluZ3MgcmVxdWlyZWQgdG8gZ2V0IGFyb3VuZCBwNS5qcyBzdHJ1Y3R1cmVcbiAgICB0aGlzLl9sYXN0UmVkcmF3UmVzdWx0ID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX2lzUDVSZXNpemluZyA9IGZhbHNlO1xuXG4gICAgdGhpcy5fa2V5Ym9hcmRTaG9ydGN1dHMgPSBrZXlib2FyZFNob3J0Y3V0cyh7XG4gICAgICBlbmFibGVkOiAoKSA9PiB0aGlzLnNldHRpbmdzLmhvdGtleXMgIT09IGZhbHNlLFxuICAgICAgc2F2ZTogKGV2KSA9PiB7XG4gICAgICAgIGlmIChldi5zaGlmdEtleSkge1xuICAgICAgICAgIGlmICh0aGlzLnByb3BzLnJlY29yZGluZykge1xuICAgICAgICAgICAgdGhpcy5lbmRSZWNvcmQoKTtcbiAgICAgICAgICAgIHRoaXMucnVuKCk7XG4gICAgICAgICAgfSBlbHNlIHRoaXMucmVjb3JkKCk7XG4gICAgICAgIH0gZWxzZSB0aGlzLmV4cG9ydEZyYW1lKCk7XG4gICAgICB9LFxuICAgICAgdG9nZ2xlUGxheTogKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5wbGF5aW5nKSB0aGlzLnBhdXNlKCk7XG4gICAgICAgIGVsc2UgdGhpcy5wbGF5KCk7XG4gICAgICB9LFxuICAgICAgY29tbWl0OiAoZXYpID0+IHtcbiAgICAgICAgdGhpcy5leHBvcnRGcmFtZSh7IGNvbW1pdDogdHJ1ZSB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuX2FuaW1hdGVIYW5kbGVyID0gKCkgPT4gdGhpcy5hbmltYXRlKCk7XG5cbiAgICB0aGlzLl9yZXNpemVIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgY29uc3QgY2hhbmdlZCA9IHRoaXMucmVzaXplKCk7XG4gICAgICAvLyBPbmx5IHJlLXJlbmRlciB3aGVuIHNpemUgYWN0dWFsbHkgY2hhbmdlc1xuICAgICAgaWYgKGNoYW5nZWQpIHtcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZ2V0IHNrZXRjaCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NrZXRjaDtcbiAgfVxuXG4gIGdldCBzZXR0aW5ncyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzO1xuICB9XG5cbiAgZ2V0IHByb3BzICgpIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvcHM7XG4gIH1cblxuICBfY29tcHV0ZVBsYXloZWFkIChjdXJyZW50VGltZSwgZHVyYXRpb24pIHtcbiAgICBjb25zdCBoYXNEdXJhdGlvbiA9IHR5cGVvZiBkdXJhdGlvbiA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoZHVyYXRpb24pO1xuICAgIHJldHVybiBoYXNEdXJhdGlvbiA/IGN1cnJlbnRUaW1lIC8gZHVyYXRpb24gOiAwO1xuICB9XG5cbiAgX2NvbXB1dGVGcmFtZSAocGxheWhlYWQsIHRpbWUsIHRvdGFsRnJhbWVzLCBmcHMpIHtcbiAgICByZXR1cm4gKGlzRmluaXRlKHRvdGFsRnJhbWVzKSAmJiB0b3RhbEZyYW1lcyA+IDEpXG4gICAgICA/IE1hdGguZmxvb3IocGxheWhlYWQgKiAodG90YWxGcmFtZXMgLSAxKSlcbiAgICAgIDogTWF0aC5mbG9vcihmcHMgKiB0aW1lKTtcbiAgfVxuXG4gIF9jb21wdXRlQ3VycmVudEZyYW1lICgpIHtcbiAgICByZXR1cm4gdGhpcy5fY29tcHV0ZUZyYW1lKFxuICAgICAgdGhpcy5wcm9wcy5wbGF5aGVhZCwgdGhpcy5wcm9wcy50aW1lLFxuICAgICAgdGhpcy5wcm9wcy50b3RhbEZyYW1lcywgdGhpcy5wcm9wcy5mcHNcbiAgICApO1xuICB9XG5cbiAgX2dldFNpemVQcm9wcyAoKSB7XG4gICAgY29uc3QgcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiB7XG4gICAgICB3aWR0aDogcHJvcHMud2lkdGgsXG4gICAgICBoZWlnaHQ6IHByb3BzLmhlaWdodCxcbiAgICAgIHBpeGVsUmF0aW86IHByb3BzLnBpeGVsUmF0aW8sXG4gICAgICBjYW52YXNXaWR0aDogcHJvcHMuY2FudmFzV2lkdGgsXG4gICAgICBjYW52YXNIZWlnaHQ6IHByb3BzLmNhbnZhc0hlaWdodCxcbiAgICAgIHZpZXdwb3J0V2lkdGg6IHByb3BzLnZpZXdwb3J0V2lkdGgsXG4gICAgICB2aWV3cG9ydEhlaWdodDogcHJvcHMudmlld3BvcnRIZWlnaHRcbiAgICB9O1xuICB9XG5cbiAgcnVuICgpIHtcbiAgICBpZiAoIXRoaXMuc2tldGNoKSB0aHJvdyBuZXcgRXJyb3IoJ3Nob3VsZCB3YWl0IHVudGlsIHNrZXRjaCBpcyBsb2FkZWQgYmVmb3JlIHRyeWluZyB0byBwbGF5KCknKTtcblxuICAgIC8vIFN0YXJ0IGFuIGFuaW1hdGlvbiBmcmFtZSBsb29wIGlmIG5lY2Vzc2FyeVxuICAgIGlmICh0aGlzLnNldHRpbmdzLnBsYXlpbmcgIT09IGZhbHNlKSB7XG4gICAgICB0aGlzLnBsYXkoKTtcbiAgICB9XG5cbiAgICAvLyBMZXQncyBsZXQgdGhpcyB3YXJuaW5nIGhhbmcgYXJvdW5kIGZvciBhIGZldyB2ZXJzaW9ucy4uLlxuICAgIGlmICh0eXBlb2YgdGhpcy5za2V0Y2guZGlzcG9zZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc29sZS53YXJuKCdJbiBjYW52YXMtc2tldGNoQDAuMC4yMyB0aGUgZGlzcG9zZSgpIGV2ZW50IGhhcyBiZWVuIHJlbmFtZWQgdG8gdW5sb2FkKCknKTtcbiAgICB9XG5cbiAgICAvLyBJbiBjYXNlIHdlIGFyZW4ndCBwbGF5aW5nIG9yIGFuaW1hdGVkLCBtYWtlIHN1cmUgd2Ugc3RpbGwgdHJpZ2dlciBiZWdpbiBtZXNzYWdlLi4uXG4gICAgaWYgKCF0aGlzLnByb3BzLnN0YXJ0ZWQpIHtcbiAgICAgIHRoaXMuX3NpZ25hbEJlZ2luKCk7XG4gICAgICB0aGlzLnByb3BzLnN0YXJ0ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIFJlbmRlciBhbiBpbml0aWFsIGZyYW1lXG4gICAgdGhpcy50aWNrKCk7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHBsYXkgKCkge1xuICAgIGxldCBhbmltYXRlID0gdGhpcy5zZXR0aW5ncy5hbmltYXRlO1xuICAgIGlmICgnYW5pbWF0aW9uJyBpbiB0aGlzLnNldHRpbmdzKSB7XG4gICAgICBhbmltYXRlID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUud2FybignW2NhbnZhcy1za2V0Y2hdIHsgYW5pbWF0aW9uIH0gaGFzIGJlZW4gcmVuYW1lZCB0byB7IGFuaW1hdGUgfScpO1xuICAgIH1cbiAgICBpZiAoIWFuaW1hdGUpIHJldHVybjtcbiAgICBpZiAoIWlzQnJvd3NlcigpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbY2FudmFzLXNrZXRjaF0gV0FSTjogVXNpbmcgeyBhbmltYXRlIH0gaW4gTm9kZS5qcyBpcyBub3QgeWV0IHN1cHBvcnRlZCcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5wcm9wcy5wbGF5aW5nKSByZXR1cm47XG4gICAgaWYgKCF0aGlzLnByb3BzLnN0YXJ0ZWQpIHtcbiAgICAgIHRoaXMuX3NpZ25hbEJlZ2luKCk7XG4gICAgICB0aGlzLnByb3BzLnN0YXJ0ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIGNvbnNvbGUubG9nKCdwbGF5JywgdGhpcy5wcm9wcy50aW1lKVxuXG4gICAgLy8gU3RhcnQgYSByZW5kZXIgbG9vcFxuICAgIHRoaXMucHJvcHMucGxheWluZyA9IHRydWU7XG4gICAgaWYgKHRoaXMuX3JhZiAhPSBudWxsKSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fcmFmKTtcbiAgICB0aGlzLl9sYXN0VGltZSA9IHJpZ2h0Tm93KCk7XG4gICAgdGhpcy5fcmFmID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLl9hbmltYXRlSGFuZGxlcik7XG4gIH1cblxuICBwYXVzZSAoKSB7XG4gICAgaWYgKHRoaXMucHJvcHMucmVjb3JkaW5nKSB0aGlzLmVuZFJlY29yZCgpO1xuICAgIHRoaXMucHJvcHMucGxheWluZyA9IGZhbHNlO1xuXG4gICAgaWYgKHRoaXMuX3JhZiAhPSBudWxsICYmIGlzQnJvd3NlcigpKSB7XG4gICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fcmFmKTtcbiAgICB9XG4gIH1cblxuICB0b2dnbGVQbGF5ICgpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5wbGF5aW5nKSB0aGlzLnBhdXNlKCk7XG4gICAgZWxzZSB0aGlzLnBsYXkoKTtcbiAgfVxuXG4gIC8vIFN0b3AgYW5kIHJlc2V0IHRvIGZyYW1lIHplcm9cbiAgc3RvcCAoKSB7XG4gICAgdGhpcy5wYXVzZSgpO1xuICAgIHRoaXMucHJvcHMuZnJhbWUgPSAwO1xuICAgIHRoaXMucHJvcHMucGxheWhlYWQgPSAwO1xuICAgIHRoaXMucHJvcHMudGltZSA9IDA7XG4gICAgdGhpcy5wcm9wcy5kZWx0YVRpbWUgPSAwO1xuICAgIHRoaXMucHJvcHMuc3RhcnRlZCA9IGZhbHNlO1xuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICByZWNvcmQgKCkge1xuICAgIGlmICh0aGlzLnByb3BzLnJlY29yZGluZykgcmV0dXJuO1xuICAgIGlmICghaXNCcm93c2VyKCkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tjYW52YXMtc2tldGNoXSBXQVJOOiBSZWNvcmRpbmcgZnJvbSBOb2RlLmpzIGlzIG5vdCB5ZXQgc3VwcG9ydGVkJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zdG9wKCk7XG4gICAgdGhpcy5wcm9wcy5wbGF5aW5nID0gdHJ1ZTtcbiAgICB0aGlzLnByb3BzLnJlY29yZGluZyA9IHRydWU7XG5cbiAgICBjb25zdCBmcmFtZUludGVydmFsID0gMSAvIHRoaXMucHJvcHMuZnBzO1xuICAgIC8vIFJlbmRlciBlYWNoIGZyYW1lIGluIHRoZSBzZXF1ZW5jZVxuICAgIGlmICh0aGlzLl9yYWYgIT0gbnVsbCkgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX3JhZik7XG4gICAgY29uc3QgdGljayA9ICgpID0+IHtcbiAgICAgIGlmICghdGhpcy5wcm9wcy5yZWNvcmRpbmcpIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgIHRoaXMucHJvcHMuZGVsdGFUaW1lID0gZnJhbWVJbnRlcnZhbDtcbiAgICAgIHRoaXMudGljaygpO1xuICAgICAgcmV0dXJuIHRoaXMuZXhwb3J0RnJhbWUoeyBzZXF1ZW5jZTogdHJ1ZSB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgaWYgKCF0aGlzLnByb3BzLnJlY29yZGluZykgcmV0dXJuOyAvLyB3YXMgY2FuY2VsbGVkIGJlZm9yZVxuICAgICAgICAgIHRoaXMucHJvcHMuZGVsdGFUaW1lID0gMDtcbiAgICAgICAgICB0aGlzLnByb3BzLmZyYW1lKys7XG4gICAgICAgICAgaWYgKHRoaXMucHJvcHMuZnJhbWUgPCB0aGlzLnByb3BzLnRvdGFsRnJhbWVzKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLnRpbWUgKz0gZnJhbWVJbnRlcnZhbDtcbiAgICAgICAgICAgIHRoaXMucHJvcHMucGxheWhlYWQgPSB0aGlzLl9jb21wdXRlUGxheWhlYWQodGhpcy5wcm9wcy50aW1lLCB0aGlzLnByb3BzLmR1cmF0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuX3JhZiA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGljayk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdGaW5pc2hlZCByZWNvcmRpbmcnKTtcbiAgICAgICAgICAgIHRoaXMuX3NpZ25hbEVuZCgpO1xuICAgICAgICAgICAgdGhpcy5lbmRSZWNvcmQoKTtcbiAgICAgICAgICAgIHRoaXMuc3RvcCgpO1xuICAgICAgICAgICAgdGhpcy5ydW4oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBUcmlnZ2VyIGEgc3RhcnQgZXZlbnQgYmVmb3JlIHdlIGJlZ2luIHJlY29yZGluZ1xuICAgIGlmICghdGhpcy5wcm9wcy5zdGFydGVkKSB7XG4gICAgICB0aGlzLl9zaWduYWxCZWdpbigpO1xuICAgICAgdGhpcy5wcm9wcy5zdGFydGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0aGlzLl9yYWYgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRpY2spO1xuICB9XG5cbiAgX3NpZ25hbEJlZ2luICgpIHtcbiAgICBpZiAodGhpcy5za2V0Y2ggJiYgdHlwZW9mIHRoaXMuc2tldGNoLmJlZ2luID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLl93cmFwQ29udGV4dFNjYWxlKHByb3BzID0+IHRoaXMuc2tldGNoLmJlZ2luKHByb3BzKSk7XG4gICAgfVxuICB9XG5cbiAgX3NpZ25hbEVuZCAoKSB7XG4gICAgaWYgKHRoaXMuc2tldGNoICYmIHR5cGVvZiB0aGlzLnNrZXRjaC5lbmQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuX3dyYXBDb250ZXh0U2NhbGUocHJvcHMgPT4gdGhpcy5za2V0Y2guZW5kKHByb3BzKSk7XG4gICAgfVxuICB9XG5cbiAgZW5kUmVjb3JkICgpIHtcbiAgICBpZiAodGhpcy5fcmFmICE9IG51bGwgJiYgaXNCcm93c2VyKCkpIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9yYWYpO1xuICAgIHRoaXMucHJvcHMucmVjb3JkaW5nID0gZmFsc2U7XG4gICAgdGhpcy5wcm9wcy5kZWx0YVRpbWUgPSAwO1xuICAgIHRoaXMucHJvcHMucGxheWluZyA9IGZhbHNlO1xuICB9XG5cbiAgZXhwb3J0RnJhbWUgKG9wdCA9IHt9KSB7XG4gICAgaWYgKCF0aGlzLnNrZXRjaCkgcmV0dXJuIFByb21pc2UuYWxsKFtdKTtcbiAgICBpZiAodHlwZW9mIHRoaXMuc2tldGNoLnByZUV4cG9ydCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5za2V0Y2gucHJlRXhwb3J0KCk7XG4gICAgfVxuXG4gICAgLy8gT3B0aW9ucyBmb3IgZXhwb3J0IGZ1bmN0aW9uXG4gICAgbGV0IGV4cG9ydE9wdHMgPSBhc3NpZ24oe1xuICAgICAgc2VxdWVuY2U6IG9wdC5zZXF1ZW5jZSxcbiAgICAgIGZyYW1lOiBvcHQuc2VxdWVuY2UgPyB0aGlzLnByb3BzLmZyYW1lIDogdW5kZWZpbmVkLFxuICAgICAgZmlsZTogdGhpcy5zZXR0aW5ncy5maWxlLFxuICAgICAgbmFtZTogdGhpcy5zZXR0aW5ncy5uYW1lLFxuICAgICAgcHJlZml4OiB0aGlzLnNldHRpbmdzLnByZWZpeCxcbiAgICAgIHN1ZmZpeDogdGhpcy5zZXR0aW5ncy5zdWZmaXgsXG4gICAgICBlbmNvZGluZzogdGhpcy5zZXR0aW5ncy5lbmNvZGluZyxcbiAgICAgIGVuY29kaW5nUXVhbGl0eTogdGhpcy5zZXR0aW5ncy5lbmNvZGluZ1F1YWxpdHksXG4gICAgICB0aW1lU3RhbXA6IGdldEZpbGVOYW1lKCksXG4gICAgICB0b3RhbEZyYW1lczogaXNGaW5pdGUodGhpcy5wcm9wcy50b3RhbEZyYW1lcykgPyBNYXRoLm1heCgxMDAsIHRoaXMucHJvcHMudG90YWxGcmFtZXMpIDogMTAwMFxuICAgIH0pO1xuXG4gICAgY29uc3QgY2xpZW50ID0gZ2V0Q2xpZW50QVBJKCk7XG4gICAgbGV0IHAgPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICBpZiAoY2xpZW50ICYmIG9wdC5jb21taXQgJiYgdHlwZW9mIGNsaWVudC5jb21taXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnN0IGNvbW1pdE9wdHMgPSBhc3NpZ24oe30sIGV4cG9ydE9wdHMpO1xuICAgICAgY29uc3QgaGFzaCA9IGNsaWVudC5jb21taXQoY29tbWl0T3B0cyk7XG4gICAgICBpZiAoaXNQcm9taXNlKGhhc2gpKSBwID0gaGFzaDtcbiAgICAgIGVsc2UgcCA9IFByb21pc2UucmVzb2x2ZShoYXNoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcC50aGVuKGhhc2ggPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuX2RvRXhwb3J0RnJhbWUoYXNzaWduKHt9LCBleHBvcnRPcHRzLCB7IGhhc2g6IGhhc2ggfHwgJycgfSkpO1xuICAgIH0pO1xuICB9XG5cbiAgX2RvRXhwb3J0RnJhbWUgKGV4cG9ydE9wdHMgPSB7fSkge1xuICAgIHRoaXMuX3Byb3BzLmV4cG9ydGluZyA9IHRydWU7XG5cbiAgICAvLyBSZXNpemUgdG8gb3V0cHV0IHJlc29sdXRpb25cbiAgICB0aGlzLnJlc2l6ZSgpO1xuXG4gICAgLy8gRHJhdyBhdCB0aGlzIG91dHB1dCByZXNvbHV0aW9uXG4gICAgbGV0IGRyYXdSZXN1bHQgPSB0aGlzLnJlbmRlcigpO1xuXG4gICAgLy8gVGhlIHNlbGYgb3duZWQgY2FudmFzIChtYXkgYmUgdW5kZWZpbmVkLi4uISlcbiAgICBjb25zdCBjYW52YXMgPSB0aGlzLnByb3BzLmNhbnZhcztcblxuICAgIC8vIEdldCBsaXN0IG9mIHJlc3VsdHMgZnJvbSByZW5kZXJcbiAgICBpZiAodHlwZW9mIGRyYXdSZXN1bHQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBkcmF3UmVzdWx0ID0gWyBjYW52YXMgXTtcbiAgICB9XG4gICAgZHJhd1Jlc3VsdCA9IFtdLmNvbmNhdChkcmF3UmVzdWx0KS5maWx0ZXIoQm9vbGVhbik7XG5cbiAgICAvLyBUcmFuc2Zvcm0gdGhlIGNhbnZhcy9maWxlIGRlc2NyaXB0b3JzIGludG8gYSBjb25zaXN0ZW50IGZvcm1hdCxcbiAgICAvLyBhbmQgcHVsbCBvdXQgYW55IGRhdGEgVVJMcyBmcm9tIGNhbnZhcyBlbGVtZW50c1xuICAgIGRyYXdSZXN1bHQgPSBkcmF3UmVzdWx0Lm1hcChyZXN1bHQgPT4ge1xuICAgICAgY29uc3QgaGFzRGF0YU9iamVjdCA9IHR5cGVvZiByZXN1bHQgPT09ICdvYmplY3QnICYmIHJlc3VsdCAmJiAoJ2RhdGEnIGluIHJlc3VsdCB8fCAnZGF0YVVSTCcgaW4gcmVzdWx0KTtcbiAgICAgIGNvbnN0IGRhdGEgPSBoYXNEYXRhT2JqZWN0ID8gcmVzdWx0LmRhdGEgOiByZXN1bHQ7XG4gICAgICBjb25zdCBvcHRzID0gaGFzRGF0YU9iamVjdCA/IGFzc2lnbih7fSwgcmVzdWx0LCB7IGRhdGEgfSkgOiB7IGRhdGEgfTtcbiAgICAgIGlmIChpc0NhbnZhcyhkYXRhKSkge1xuICAgICAgICBjb25zdCBlbmNvZGluZyA9IG9wdHMuZW5jb2RpbmcgfHwgZXhwb3J0T3B0cy5lbmNvZGluZztcbiAgICAgICAgY29uc3QgZW5jb2RpbmdRdWFsaXR5ID0gZGVmaW5lZChvcHRzLmVuY29kaW5nUXVhbGl0eSwgZXhwb3J0T3B0cy5lbmNvZGluZ1F1YWxpdHksIDAuOTUpO1xuICAgICAgICBjb25zdCB7IGRhdGFVUkwsIGV4dGVuc2lvbiwgdHlwZSB9ID0gZXhwb3J0Q2FudmFzKGRhdGEsIHsgZW5jb2RpbmcsIGVuY29kaW5nUXVhbGl0eSB9KTtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24ob3B0cywgeyBkYXRhVVJMLCBleHRlbnNpb24sIHR5cGUgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gb3B0cztcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIE5vdyByZXR1cm4gdG8gcmVndWxhciByZW5kZXJpbmcgbW9kZVxuICAgIHRoaXMuX3Byb3BzLmV4cG9ydGluZyA9IGZhbHNlO1xuICAgIHRoaXMucmVzaXplKCk7XG4gICAgdGhpcy5yZW5kZXIoKTtcblxuICAgIC8vIEFuZCBub3cgd2UgY2FuIHNhdmUgZWFjaCByZXN1bHRcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoZHJhd1Jlc3VsdC5tYXAoKHJlc3VsdCwgaSwgbGF5ZXJMaXN0KSA9PiB7XG4gICAgICAvLyBCeSBkZWZhdWx0LCBpZiByZW5kZXJpbmcgbXVsdGlwbGUgbGF5ZXJzIHdlIHdpbGwgZ2l2ZSB0aGVtIGluZGljZXNcbiAgICAgIGNvbnN0IGN1ck9wdCA9IGFzc2lnbih7fSwgZXhwb3J0T3B0cywgcmVzdWx0LCB7IGxheWVyOiBpLCB0b3RhbExheWVyczogbGF5ZXJMaXN0Lmxlbmd0aCB9KTtcbiAgICAgIGNvbnN0IGRhdGEgPSByZXN1bHQuZGF0YTtcbiAgICAgIGlmIChyZXN1bHQuZGF0YVVSTCkge1xuICAgICAgICBjb25zdCBkYXRhVVJMID0gcmVzdWx0LmRhdGFVUkw7XG4gICAgICAgIGRlbGV0ZSBjdXJPcHQuZGF0YVVSTDsgLy8gYXZvaWQgc2VuZGluZyBlbnRpcmUgYmFzZTY0IGRhdGEgYXJvdW5kXG4gICAgICAgIHJldHVybiBzYXZlRGF0YVVSTChkYXRhVVJMLCBjdXJPcHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNhdmVGaWxlKGRhdGEsIGN1ck9wdCk7XG4gICAgICB9XG4gICAgfSkpLnRoZW4oZXYgPT4ge1xuICAgICAgaWYgKGV2Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgZXZlbnRXaXRoT3V0cHV0ID0gZXYuZmluZChlID0+IGUub3V0cHV0TmFtZSk7XG4gICAgICAgIGNvbnN0IGlzQ2xpZW50ID0gZXYuc29tZShlID0+IGUuY2xpZW50KTtcbiAgICAgICAgbGV0IGl0ZW07XG4gICAgICAgIC8vIG1hbnkgZmlsZXMsIGp1c3QgbG9nIGhvdyBtYW55IHdlcmUgZXhwb3J0ZWRcbiAgICAgICAgaWYgKGV2Lmxlbmd0aCA+IDEpIGl0ZW0gPSBldi5sZW5ndGg7XG4gICAgICAgIC8vIGluIENMSSwgd2Uga25vdyBleGFjdCBwYXRoIGRpcm5hbWVcbiAgICAgICAgZWxzZSBpZiAoZXZlbnRXaXRoT3V0cHV0KSBpdGVtID0gYCR7ZXZlbnRXaXRoT3V0cHV0Lm91dHB1dE5hbWV9LyR7ZXZbMF0uZmlsZW5hbWV9YDtcbiAgICAgICAgLy8gaW4gYnJvd3Nlciwgd2UgY2FuIG9ubHkga25vdyBpdCB3ZW50IHRvIFwiYnJvd3NlciBkb3dubG9hZCBmb2xkZXJcIlxuICAgICAgICBlbHNlIGl0ZW0gPSBgJHtldlswXS5maWxlbmFtZX1gO1xuICAgICAgICBsZXQgb2ZTZXEgPSAnJztcbiAgICAgICAgaWYgKGV4cG9ydE9wdHMuc2VxdWVuY2UpIHtcbiAgICAgICAgICBjb25zdCBoYXNUb3RhbEZyYW1lcyA9IGlzRmluaXRlKHRoaXMucHJvcHMudG90YWxGcmFtZXMpO1xuICAgICAgICAgIG9mU2VxID0gaGFzVG90YWxGcmFtZXMgPyBgIChmcmFtZSAke2V4cG9ydE9wdHMuZnJhbWUgKyAxfSAvICR7dGhpcy5wcm9wcy50b3RhbEZyYW1lc30pYCA6IGAgKGZyYW1lICR7ZXhwb3J0T3B0cy5mcmFtZX0pYDtcbiAgICAgICAgfSBlbHNlIGlmIChldi5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgb2ZTZXEgPSBgIGZpbGVzYDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjbGllbnQgPSBpc0NsaWVudCA/ICdjYW52YXMtc2tldGNoLWNsaScgOiAnY2FudmFzLXNrZXRjaCc7XG4gICAgICAgIGNvbnNvbGUubG9nKGAlY1ske2NsaWVudH1dJWMgRXhwb3J0ZWQgJWMke2l0ZW19JWMke29mU2VxfWAsICdjb2xvcjogIzhlOGU4ZTsnLCAnY29sb3I6IGluaXRpYWw7JywgJ2ZvbnQtd2VpZ2h0OiBib2xkOycsICdmb250LXdlaWdodDogaW5pdGlhbDsnKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgdGhpcy5za2V0Y2gucG9zdEV4cG9ydCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLnNrZXRjaC5wb3N0RXhwb3J0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfd3JhcENvbnRleHRTY2FsZSAoY2IpIHtcbiAgICB0aGlzLl9wcmVSZW5kZXIoKTtcbiAgICBjYih0aGlzLnByb3BzKTtcbiAgICB0aGlzLl9wb3N0UmVuZGVyKCk7XG4gIH1cblxuICBfcHJlUmVuZGVyICgpIHtcbiAgICBjb25zdCBwcm9wcyA9IHRoaXMucHJvcHM7XG5cbiAgICAvLyBTY2FsZSBjb250ZXh0IGZvciB1bml0IHNpemluZ1xuICAgIGlmICghdGhpcy5wcm9wcy5nbCAmJiBwcm9wcy5jb250ZXh0ICYmICFwcm9wcy5wNSkge1xuICAgICAgcHJvcHMuY29udGV4dC5zYXZlKCk7XG4gICAgICBpZiAodGhpcy5zZXR0aW5ncy5zY2FsZUNvbnRleHQgIT09IGZhbHNlKSB7XG4gICAgICAgIHByb3BzLmNvbnRleHQuc2NhbGUocHJvcHMuc2NhbGVYLCBwcm9wcy5zY2FsZVkpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAocHJvcHMucDUpIHtcbiAgICAgIHByb3BzLnA1LnNjYWxlKHByb3BzLnNjYWxlWCAvIHByb3BzLnBpeGVsUmF0aW8sIHByb3BzLnNjYWxlWSAvIHByb3BzLnBpeGVsUmF0aW8pO1xuICAgIH1cbiAgfVxuXG4gIF9wb3N0UmVuZGVyICgpIHtcbiAgICBjb25zdCBwcm9wcyA9IHRoaXMucHJvcHM7XG5cbiAgICBpZiAoIXRoaXMucHJvcHMuZ2wgJiYgcHJvcHMuY29udGV4dCAmJiAhcHJvcHMucDUpIHtcbiAgICAgIHByb3BzLmNvbnRleHQucmVzdG9yZSgpO1xuICAgIH1cblxuICAgIC8vIEZsdXNoIGJ5IGRlZmF1bHQsIHRoaXMgbWF5IGJlIHJldmlzaXRlZCBhdCBhIGxhdGVyIHBvaW50LlxuICAgIC8vIFdlIGRvIHRoaXMgdG8gZW5zdXJlIHRvRGF0YVVSTCBjYW4gYmUgY2FsbGVkIGltbWVkaWF0ZWx5IGFmdGVyLlxuICAgIC8vIE1vc3QgbGlrZWx5IGJyb3dzZXJzIGFscmVhZHkgaGFuZGxlIHRoaXMsIHNvIHdlIG1heSByZXZpc2l0IHRoaXMgYW5kXG4gICAgLy8gcmVtb3ZlIGl0IGlmIGl0IGltcHJvdmVzIHBlcmZvcm1hbmNlIHdpdGhvdXQgYW55IHVzYWJpbGl0eSBpc3N1ZXMuXG4gICAgaWYgKHByb3BzLmdsICYmIHRoaXMuc2V0dGluZ3MuZmx1c2ggIT09IGZhbHNlICYmICFwcm9wcy5wNSkge1xuICAgICAgcHJvcHMuZ2wuZmx1c2goKTtcbiAgICB9XG4gIH1cblxuICB0aWNrICgpIHtcbiAgICBpZiAodGhpcy5za2V0Y2ggJiYgdHlwZW9mIHRoaXMuc2tldGNoLnRpY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuX3ByZVJlbmRlcigpO1xuICAgICAgdGhpcy5za2V0Y2gudGljayh0aGlzLnByb3BzKTtcbiAgICAgIHRoaXMuX3Bvc3RSZW5kZXIoKTtcbiAgICB9XG4gIH1cblxuICByZW5kZXIgKCkge1xuICAgIGlmICh0aGlzLnByb3BzLnA1KSB7XG4gICAgICB0aGlzLl9sYXN0UmVkcmF3UmVzdWx0ID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5wcm9wcy5wNS5yZWRyYXcoKTtcbiAgICAgIHJldHVybiB0aGlzLl9sYXN0UmVkcmF3UmVzdWx0O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5zdWJtaXREcmF3Q2FsbCgpO1xuICAgIH1cbiAgfVxuXG4gIHN1Ym1pdERyYXdDYWxsICgpIHtcbiAgICBpZiAoIXRoaXMuc2tldGNoKSByZXR1cm47XG5cbiAgICBjb25zdCBwcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgdGhpcy5fcHJlUmVuZGVyKCk7XG5cbiAgICBsZXQgZHJhd1Jlc3VsdDtcblxuICAgIGlmICh0eXBlb2YgdGhpcy5za2V0Y2ggPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGRyYXdSZXN1bHQgPSB0aGlzLnNrZXRjaChwcm9wcyk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5za2V0Y2gucmVuZGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBkcmF3UmVzdWx0ID0gdGhpcy5za2V0Y2gucmVuZGVyKHByb3BzKTtcbiAgICB9XG5cbiAgICB0aGlzLl9wb3N0UmVuZGVyKCk7XG5cbiAgICByZXR1cm4gZHJhd1Jlc3VsdDtcbiAgfVxuXG4gIHVwZGF0ZSAob3B0ID0ge30pIHtcbiAgICAvLyBDdXJyZW50bHkgdXBkYXRlKCkgaXMgb25seSBmb2N1c2VkIG9uIHJlc2l6aW5nLFxuICAgIC8vIGJ1dCBsYXRlciB3ZSB3aWxsIHN1cHBvcnQgb3RoZXIgb3B0aW9ucyBsaWtlIHN3aXRjaGluZ1xuICAgIC8vIGZyYW1lcyBhbmQgc3VjaC5cbiAgICBjb25zdCBub3RZZXRTdXBwb3J0ZWQgPSBbXG4gICAgICAnYW5pbWF0ZSdcbiAgICBdO1xuXG4gICAgT2JqZWN0LmtleXMob3B0KS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICBpZiAobm90WWV0U3VwcG9ydGVkLmluZGV4T2Yoa2V5KSA+PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgU29ycnksIHRoZSB7ICR7a2V5fSB9IG9wdGlvbiBpcyBub3QgeWV0IHN1cHBvcnRlZCB3aXRoIHVwZGF0ZSgpLmApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3Qgb2xkQ2FudmFzID0gdGhpcy5fc2V0dGluZ3MuY2FudmFzO1xuICAgIGNvbnN0IG9sZENvbnRleHQgPSB0aGlzLl9zZXR0aW5ncy5jb250ZXh0O1xuXG4gICAgLy8gTWVyZ2UgbmV3IG9wdGlvbnMgaW50byBzZXR0aW5nc1xuICAgIGZvciAobGV0IGtleSBpbiBvcHQpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gb3B0W2tleV07XG4gICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAndW5kZWZpbmVkJykgeyAvLyBpZ25vcmUgdW5kZWZpbmVkXG4gICAgICAgIHRoaXMuX3NldHRpbmdzW2tleV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNZXJnZSBpbiB0aW1lIHByb3BzXG4gICAgY29uc3QgdGltZU9wdHMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLl9zZXR0aW5ncywgb3B0KTtcbiAgICBpZiAoJ3RpbWUnIGluIG9wdCAmJiAnZnJhbWUnIGluIG9wdCkgdGhyb3cgbmV3IEVycm9yKCdZb3Ugc2hvdWxkIHNwZWNpZnkgeyB0aW1lIH0gb3IgeyBmcmFtZSB9IGJ1dCBub3QgYm90aCcpO1xuICAgIGVsc2UgaWYgKCd0aW1lJyBpbiBvcHQpIGRlbGV0ZSB0aW1lT3B0cy5mcmFtZTtcbiAgICBlbHNlIGlmICgnZnJhbWUnIGluIG9wdCkgZGVsZXRlIHRpbWVPcHRzLnRpbWU7XG4gICAgaWYgKCdkdXJhdGlvbicgaW4gb3B0ICYmICd0b3RhbEZyYW1lcycgaW4gb3B0KSB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBzaG91bGQgc3BlY2lmeSB7IGR1cmF0aW9uIH0gb3IgeyB0b3RhbEZyYW1lcyB9IGJ1dCBub3QgYm90aCcpO1xuICAgIGVsc2UgaWYgKCdkdXJhdGlvbicgaW4gb3B0KSBkZWxldGUgdGltZU9wdHMudG90YWxGcmFtZXM7XG4gICAgZWxzZSBpZiAoJ3RvdGFsRnJhbWVzJyBpbiBvcHQpIGRlbGV0ZSB0aW1lT3B0cy5kdXJhdGlvbjtcblxuICAgIC8vIE1lcmdlIGluIHVzZXIgZGF0YSB3aXRob3V0IGNvcHlpbmdcbiAgICBpZiAoJ2RhdGEnIGluIG9wdCkgdGhpcy5fcHJvcHMuZGF0YSA9IG9wdC5kYXRhO1xuXG4gICAgY29uc3QgdGltZVByb3BzID0gdGhpcy5nZXRUaW1lUHJvcHModGltZU9wdHMpO1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5fcHJvcHMsIHRpbWVQcm9wcyk7XG5cbiAgICAvLyBJZiBlaXRoZXIgY2FudmFzIG9yIGNvbnRleHQgaXMgY2hhbmdlZCwgd2Ugc2hvdWxkIHJlLXVwZGF0ZVxuICAgIGlmIChvbGRDYW52YXMgIT09IHRoaXMuX3NldHRpbmdzLmNhbnZhcyB8fCBvbGRDb250ZXh0ICE9PSB0aGlzLl9zZXR0aW5ncy5jb250ZXh0KSB7XG4gICAgICBjb25zdCB7IGNhbnZhcywgY29udGV4dCB9ID0gY3JlYXRlQ2FudmFzKHRoaXMuX3NldHRpbmdzKTtcblxuICAgICAgdGhpcy5wcm9wcy5jYW52YXMgPSBjYW52YXM7XG4gICAgICB0aGlzLnByb3BzLmNvbnRleHQgPSBjb250ZXh0O1xuXG4gICAgICAvLyBEZWxldGUgb3IgYWRkIGEgJ2dsJyBwcm9wIGZvciBjb252ZW5pZW5jZVxuICAgICAgdGhpcy5fc2V0dXBHTEtleSgpO1xuXG4gICAgICAvLyBSZS1tb3VudCB0aGUgbmV3IGNhbnZhcyBpZiBpdCBoYXMgbm8gcGFyZW50XG4gICAgICB0aGlzLl9hcHBlbmRDYW52YXNJZk5lZWRlZCgpO1xuICAgIH1cblxuICAgIC8vIFNwZWNpYWwgY2FzZSB0byBzdXBwb3J0IFA1LmpzXG4gICAgaWYgKG9wdC5wNSAmJiB0eXBlb2Ygb3B0LnA1ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLnByb3BzLnA1ID0gb3B0LnA1O1xuICAgICAgdGhpcy5wcm9wcy5wNS5kcmF3ID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5faXNQNVJlc2l6aW5nKSByZXR1cm47XG4gICAgICAgIHRoaXMuX2xhc3RSZWRyYXdSZXN1bHQgPSB0aGlzLnN1Ym1pdERyYXdDYWxsKCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSBwbGF5aW5nIHN0YXRlIGlmIG5lY2Vzc2FyeVxuICAgIGlmICgncGxheWluZycgaW4gb3B0KSB7XG4gICAgICBpZiAob3B0LnBsYXlpbmcpIHRoaXMucGxheSgpO1xuICAgICAgZWxzZSB0aGlzLnBhdXNlKCk7XG4gICAgfVxuXG4gICAgY2hlY2tTZXR0aW5ncyh0aGlzLl9zZXR0aW5ncyk7XG5cbiAgICAvLyBEcmF3IG5ldyBmcmFtZVxuICAgIHRoaXMucmVzaXplKCk7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgICByZXR1cm4gdGhpcy5wcm9wcztcbiAgfVxuXG4gIHJlc2l6ZSAoKSB7XG4gICAgY29uc3Qgb2xkU2l6ZXMgPSB0aGlzLl9nZXRTaXplUHJvcHMoKTtcblxuICAgIGNvbnN0IHNldHRpbmdzID0gdGhpcy5zZXR0aW5ncztcbiAgICBjb25zdCBwcm9wcyA9IHRoaXMucHJvcHM7XG5cbiAgICAvLyBSZWNvbXB1dGUgbmV3IHByb3BlcnRpZXMgYmFzZWQgb24gY3VycmVudCBzZXR1cFxuICAgIGNvbnN0IG5ld1Byb3BzID0gcmVzaXplQ2FudmFzKHByb3BzLCBzZXR0aW5ncyk7XG5cbiAgICAvLyBBc3NpZ24gdG8gY3VycmVudCBwcm9wc1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5fcHJvcHMsIG5ld1Byb3BzKTtcblxuICAgIC8vIE5vdyB3ZSBhY3R1YWxseSB1cGRhdGUgdGhlIGNhbnZhcyB3aWR0aC9oZWlnaHQgYW5kIHN0eWxlIHByb3BzXG4gICAgY29uc3Qge1xuICAgICAgcGl4ZWxSYXRpbyxcbiAgICAgIGNhbnZhc1dpZHRoLFxuICAgICAgY2FudmFzSGVpZ2h0LFxuICAgICAgc3R5bGVXaWR0aCxcbiAgICAgIHN0eWxlSGVpZ2h0XG4gICAgfSA9IHRoaXMucHJvcHM7XG5cbiAgICAvLyBVcGRhdGUgY2FudmFzIHNldHRpbmdzXG4gICAgY29uc3QgY2FudmFzID0gdGhpcy5wcm9wcy5jYW52YXM7XG4gICAgaWYgKGNhbnZhcyAmJiBzZXR0aW5ncy5yZXNpemVDYW52YXMgIT09IGZhbHNlKSB7XG4gICAgICBpZiAocHJvcHMucDUpIHtcbiAgICAgICAgLy8gUDUuanMgc3BlY2lmaWMgZWRnZSBjYXNlXG4gICAgICAgIGlmIChjYW52YXMud2lkdGggIT09IGNhbnZhc1dpZHRoIHx8IGNhbnZhcy5oZWlnaHQgIT09IGNhbnZhc0hlaWdodCkge1xuICAgICAgICAgIHRoaXMuX2lzUDVSZXNpemluZyA9IHRydWU7XG4gICAgICAgICAgLy8gVGhpcyBjYXVzZXMgYSByZS1kcmF3IDpcXCBzbyB3ZSBpZ25vcmUgZHJhd3MgaW4gdGhlIG1lYW4gdGltZS4uLiBzb3J0YSBoYWNreVxuICAgICAgICAgIHByb3BzLnA1LnBpeGVsRGVuc2l0eShwaXhlbFJhdGlvKTtcbiAgICAgICAgICBwcm9wcy5wNS5yZXNpemVDYW52YXMoY2FudmFzV2lkdGggLyBwaXhlbFJhdGlvLCBjYW52YXNIZWlnaHQgLyBwaXhlbFJhdGlvLCBmYWxzZSk7XG4gICAgICAgICAgdGhpcy5faXNQNVJlc2l6aW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEZvcmNlIGNhbnZhcyBzaXplXG4gICAgICAgIGlmIChjYW52YXMud2lkdGggIT09IGNhbnZhc1dpZHRoKSBjYW52YXMud2lkdGggPSBjYW52YXNXaWR0aDtcbiAgICAgICAgaWYgKGNhbnZhcy5oZWlnaHQgIT09IGNhbnZhc0hlaWdodCkgY2FudmFzLmhlaWdodCA9IGNhbnZhc0hlaWdodDtcbiAgICAgIH1cbiAgICAgIC8vIFVwZGF0ZSBjYW52YXMgc3R5bGVcbiAgICAgIGlmIChpc0Jyb3dzZXIoKSAmJiBzZXR0aW5ncy5zdHlsZUNhbnZhcyAhPT0gZmFsc2UpIHtcbiAgICAgICAgY2FudmFzLnN0eWxlLndpZHRoID0gYCR7c3R5bGVXaWR0aH1weGA7XG4gICAgICAgIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBgJHtzdHlsZUhlaWdodH1weGA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgbmV3U2l6ZXMgPSB0aGlzLl9nZXRTaXplUHJvcHMoKTtcbiAgICBsZXQgY2hhbmdlZCA9ICFkZWVwRXF1YWwob2xkU2l6ZXMsIG5ld1NpemVzKTtcbiAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgdGhpcy5fc2l6ZUNoYW5nZWQoKTtcbiAgICB9XG4gICAgcmV0dXJuIGNoYW5nZWQ7XG4gIH1cblxuICBfc2l6ZUNoYW5nZWQgKCkge1xuICAgIC8vIFNlbmQgcmVzaXplIGV2ZW50IHRvIHNrZXRjaFxuICAgIGlmICh0aGlzLnNrZXRjaCAmJiB0eXBlb2YgdGhpcy5za2V0Y2gucmVzaXplID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLnNrZXRjaC5yZXNpemUodGhpcy5wcm9wcyk7XG4gICAgfVxuICB9XG5cbiAgYW5pbWF0ZSAoKSB7XG4gICAgaWYgKCF0aGlzLnByb3BzLnBsYXlpbmcpIHJldHVybjtcbiAgICBpZiAoIWlzQnJvd3NlcigpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbY2FudmFzLXNrZXRjaF0gV0FSTjogQW5pbWF0aW9uIGluIE5vZGUuanMgaXMgbm90IHlldCBzdXBwb3J0ZWQnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fcmFmID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLl9hbmltYXRlSGFuZGxlcik7XG5cbiAgICBsZXQgbm93ID0gcmlnaHROb3coKTtcblxuICAgIGNvbnN0IGZwcyA9IHRoaXMucHJvcHMuZnBzO1xuICAgIGNvbnN0IGZyYW1lSW50ZXJ2YWxNUyA9IDEwMDAgLyBmcHM7XG4gICAgbGV0IGRlbHRhVGltZU1TID0gbm93IC0gdGhpcy5fbGFzdFRpbWU7XG5cbiAgICBjb25zdCBkdXJhdGlvbiA9IHRoaXMucHJvcHMuZHVyYXRpb247XG4gICAgY29uc3QgaGFzRHVyYXRpb24gPSB0eXBlb2YgZHVyYXRpb24gPT09ICdudW1iZXInICYmIGlzRmluaXRlKGR1cmF0aW9uKTtcblxuICAgIGxldCBpc05ld0ZyYW1lID0gdHJ1ZTtcbiAgICBjb25zdCBwbGF5YmFja1JhdGUgPSB0aGlzLnNldHRpbmdzLnBsYXliYWNrUmF0ZTtcbiAgICBpZiAocGxheWJhY2tSYXRlID09PSAnZml4ZWQnKSB7XG4gICAgICBkZWx0YVRpbWVNUyA9IGZyYW1lSW50ZXJ2YWxNUztcbiAgICB9IGVsc2UgaWYgKHBsYXliYWNrUmF0ZSA9PT0gJ3Rocm90dGxlJykge1xuICAgICAgaWYgKGRlbHRhVGltZU1TID4gZnJhbWVJbnRlcnZhbE1TKSB7XG4gICAgICAgIG5vdyA9IG5vdyAtIChkZWx0YVRpbWVNUyAlIGZyYW1lSW50ZXJ2YWxNUyk7XG4gICAgICAgIHRoaXMuX2xhc3RUaW1lID0gbm93O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaXNOZXdGcmFtZSA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9sYXN0VGltZSA9IG5vdztcbiAgICB9XG5cbiAgICBjb25zdCBkZWx0YVRpbWUgPSBkZWx0YVRpbWVNUyAvIDEwMDA7XG4gICAgbGV0IG5ld1RpbWUgPSB0aGlzLnByb3BzLnRpbWUgKyBkZWx0YVRpbWUgKiB0aGlzLnByb3BzLnRpbWVTY2FsZTtcblxuICAgIC8vIEhhbmRsZSByZXZlcnNlIHRpbWUgc2NhbGVcbiAgICBpZiAobmV3VGltZSA8IDAgJiYgaGFzRHVyYXRpb24pIHtcbiAgICAgIG5ld1RpbWUgPSBkdXJhdGlvbiArIG5ld1RpbWU7XG4gICAgfVxuXG4gICAgLy8gUmUtc3RhcnQgYW5pbWF0aW9uXG4gICAgbGV0IGlzRmluaXNoZWQgPSBmYWxzZTtcbiAgICBsZXQgaXNMb29wU3RhcnQgPSBmYWxzZTtcblxuICAgIGNvbnN0IGxvb3BpbmcgPSB0aGlzLnNldHRpbmdzLmxvb3AgIT09IGZhbHNlO1xuXG4gICAgaWYgKGhhc0R1cmF0aW9uICYmIG5ld1RpbWUgPj0gZHVyYXRpb24pIHtcbiAgICAgIC8vIFJlLXN0YXJ0IGFuaW1hdGlvblxuICAgICAgaWYgKGxvb3BpbmcpIHtcbiAgICAgICAgaXNOZXdGcmFtZSA9IHRydWU7XG4gICAgICAgIG5ld1RpbWUgPSBuZXdUaW1lICUgZHVyYXRpb247XG4gICAgICAgIGlzTG9vcFN0YXJ0ID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlzTmV3RnJhbWUgPSBmYWxzZTtcbiAgICAgICAgbmV3VGltZSA9IGR1cmF0aW9uO1xuICAgICAgICBpc0ZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fc2lnbmFsRW5kKCk7XG4gICAgfVxuXG4gICAgaWYgKGlzTmV3RnJhbWUpIHtcbiAgICAgIHRoaXMucHJvcHMuZGVsdGFUaW1lID0gZGVsdGFUaW1lO1xuICAgICAgdGhpcy5wcm9wcy50aW1lID0gbmV3VGltZTtcbiAgICAgIHRoaXMucHJvcHMucGxheWhlYWQgPSB0aGlzLl9jb21wdXRlUGxheWhlYWQobmV3VGltZSwgZHVyYXRpb24pO1xuICAgICAgY29uc3QgbGFzdEZyYW1lID0gdGhpcy5wcm9wcy5mcmFtZTtcbiAgICAgIHRoaXMucHJvcHMuZnJhbWUgPSB0aGlzLl9jb21wdXRlQ3VycmVudEZyYW1lKCk7XG4gICAgICBpZiAoaXNMb29wU3RhcnQpIHRoaXMuX3NpZ25hbEJlZ2luKCk7XG4gICAgICBpZiAobGFzdEZyYW1lICE9PSB0aGlzLnByb3BzLmZyYW1lKSB0aGlzLnRpY2soKTtcbiAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICB0aGlzLnByb3BzLmRlbHRhVGltZSA9IDA7XG4gICAgfVxuXG4gICAgaWYgKGlzRmluaXNoZWQpIHtcbiAgICAgIHRoaXMucGF1c2UoKTtcbiAgICB9XG4gIH1cblxuICBkaXNwYXRjaCAoY2IpIHtcbiAgICBpZiAodHlwZW9mIGNiICE9PSAnZnVuY3Rpb24nKSB0aHJvdyBuZXcgRXJyb3IoJ211c3QgcGFzcyBmdW5jdGlvbiBpbnRvIGRpc3BhdGNoKCknKTtcbiAgICBjYih0aGlzLnByb3BzKTtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgbW91bnQgKCkge1xuICAgIHRoaXMuX2FwcGVuZENhbnZhc0lmTmVlZGVkKCk7XG4gIH1cblxuICB1bm1vdW50ICgpIHtcbiAgICBpZiAoaXNCcm93c2VyKCkpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLl9yZXNpemVIYW5kbGVyKTtcbiAgICAgIHRoaXMuX2tleWJvYXJkU2hvcnRjdXRzLmRldGFjaCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy5wcm9wcy5jYW52YXMucGFyZW50RWxlbWVudCkge1xuICAgICAgdGhpcy5wcm9wcy5jYW52YXMucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLnByb3BzLmNhbnZhcyk7XG4gICAgfVxuICB9XG5cbiAgX2FwcGVuZENhbnZhc0lmTmVlZGVkICgpIHtcbiAgICBpZiAoIWlzQnJvd3NlcigpKSByZXR1cm47XG4gICAgaWYgKHRoaXMuc2V0dGluZ3MucGFyZW50ICE9PSBmYWxzZSAmJiAodGhpcy5wcm9wcy5jYW52YXMgJiYgIXRoaXMucHJvcHMuY2FudmFzLnBhcmVudEVsZW1lbnQpKSB7XG4gICAgICBjb25zdCBkZWZhdWx0UGFyZW50ID0gdGhpcy5zZXR0aW5ncy5wYXJlbnQgfHwgZG9jdW1lbnQuYm9keTtcbiAgICAgIGRlZmF1bHRQYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy5wcm9wcy5jYW52YXMpO1xuICAgIH1cbiAgfVxuXG4gIF9zZXR1cEdMS2V5ICgpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5jb250ZXh0KSB7XG4gICAgICBpZiAoaXNXZWJHTENvbnRleHQodGhpcy5wcm9wcy5jb250ZXh0KSkge1xuICAgICAgICB0aGlzLl9wcm9wcy5nbCA9IHRoaXMucHJvcHMuY29udGV4dDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLl9wcm9wcy5nbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRUaW1lUHJvcHMgKHNldHRpbmdzID0ge30pIHtcbiAgICAvLyBHZXQgdGltaW5nIGRhdGFcbiAgICBsZXQgZHVyYXRpb24gPSBzZXR0aW5ncy5kdXJhdGlvbjtcbiAgICBsZXQgdG90YWxGcmFtZXMgPSBzZXR0aW5ncy50b3RhbEZyYW1lcztcbiAgICBjb25zdCB0aW1lU2NhbGUgPSBkZWZpbmVkKHNldHRpbmdzLnRpbWVTY2FsZSwgMSk7XG4gICAgY29uc3QgZnBzID0gZGVmaW5lZChzZXR0aW5ncy5mcHMsIDI0KTtcbiAgICBjb25zdCBoYXNEdXJhdGlvbiA9IHR5cGVvZiBkdXJhdGlvbiA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoZHVyYXRpb24pO1xuICAgIGNvbnN0IGhhc1RvdGFsRnJhbWVzID0gdHlwZW9mIHRvdGFsRnJhbWVzID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSh0b3RhbEZyYW1lcyk7XG5cbiAgICBjb25zdCB0b3RhbEZyYW1lc0Zyb21EdXJhdGlvbiA9IGhhc0R1cmF0aW9uID8gTWF0aC5mbG9vcihmcHMgKiBkdXJhdGlvbikgOiB1bmRlZmluZWQ7XG4gICAgY29uc3QgZHVyYXRpb25Gcm9tVG90YWxGcmFtZXMgPSBoYXNUb3RhbEZyYW1lcyA/ICh0b3RhbEZyYW1lcyAvIGZwcykgOiB1bmRlZmluZWQ7XG4gICAgaWYgKGhhc0R1cmF0aW9uICYmIGhhc1RvdGFsRnJhbWVzICYmIHRvdGFsRnJhbWVzRnJvbUR1cmF0aW9uICE9PSB0b3RhbEZyYW1lcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3Ugc2hvdWxkIHNwZWNpZnkgZWl0aGVyIGR1cmF0aW9uIG9yIHRvdGFsRnJhbWVzLCBidXQgbm90IGJvdGguIE9yLCB0aGV5IG11c3QgbWF0Y2ggZXhhY3RseS4nKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHNldHRpbmdzLmRpbWVuc2lvbnMgPT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBzZXR0aW5ncy51bml0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNvbnNvbGUud2FybihgWW91J3ZlIHNwZWNpZmllZCBhIHsgdW5pdHMgfSBzZXR0aW5nIGJ1dCBubyB7IGRpbWVuc2lvbiB9LCBzbyB0aGUgdW5pdHMgd2lsbCBiZSBpZ25vcmVkLmApO1xuICAgIH1cblxuICAgIHRvdGFsRnJhbWVzID0gZGVmaW5lZCh0b3RhbEZyYW1lcywgdG90YWxGcmFtZXNGcm9tRHVyYXRpb24sIEluZmluaXR5KTtcbiAgICBkdXJhdGlvbiA9IGRlZmluZWQoZHVyYXRpb24sIGR1cmF0aW9uRnJvbVRvdGFsRnJhbWVzLCBJbmZpbml0eSk7XG5cbiAgICBjb25zdCBzdGFydFRpbWUgPSBzZXR0aW5ncy50aW1lO1xuICAgIGNvbnN0IHN0YXJ0RnJhbWUgPSBzZXR0aW5ncy5mcmFtZTtcbiAgICBjb25zdCBoYXNTdGFydFRpbWUgPSB0eXBlb2Ygc3RhcnRUaW1lID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZShzdGFydFRpbWUpO1xuICAgIGNvbnN0IGhhc1N0YXJ0RnJhbWUgPSB0eXBlb2Ygc3RhcnRGcmFtZSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoc3RhcnRGcmFtZSk7XG5cbiAgICAvLyBzdGFydCBhdCB6ZXJvIHVubGVzcyB1c2VyIHNwZWNpZmllcyBmcmFtZSBvciB0aW1lIChidXQgbm90IGJvdGggbWlzbWF0Y2hlZClcbiAgICBsZXQgdGltZSA9IDA7XG4gICAgbGV0IGZyYW1lID0gMDtcbiAgICBsZXQgcGxheWhlYWQgPSAwO1xuICAgIGlmIChoYXNTdGFydFRpbWUgJiYgaGFzU3RhcnRGcmFtZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3Ugc2hvdWxkIHNwZWNpZnkgZWl0aGVyIHN0YXJ0IGZyYW1lIG9yIHRpbWUsIGJ1dCBub3QgYm90aC4nKTtcbiAgICB9IGVsc2UgaWYgKGhhc1N0YXJ0VGltZSkge1xuICAgICAgLy8gVXNlciBzcGVjaWZpZXMgdGltZSwgd2UgaW5mZXIgZnJhbWVzIGZyb20gRlBTXG4gICAgICB0aW1lID0gc3RhcnRUaW1lO1xuICAgICAgcGxheWhlYWQgPSB0aGlzLl9jb21wdXRlUGxheWhlYWQodGltZSwgZHVyYXRpb24pO1xuICAgICAgZnJhbWUgPSB0aGlzLl9jb21wdXRlRnJhbWUoXG4gICAgICAgIHBsYXloZWFkLCB0aW1lLFxuICAgICAgICB0b3RhbEZyYW1lcywgZnBzXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAoaGFzU3RhcnRGcmFtZSkge1xuICAgICAgLy8gVXNlciBzcGVjaWZpZXMgZnJhbWUgbnVtYmVyLCB3ZSBpbmZlciB0aW1lIGZyb20gRlBTXG4gICAgICBmcmFtZSA9IHN0YXJ0RnJhbWU7XG4gICAgICB0aW1lID0gZnJhbWUgLyBmcHM7XG4gICAgICBwbGF5aGVhZCA9IHRoaXMuX2NvbXB1dGVQbGF5aGVhZCh0aW1lLCBkdXJhdGlvbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHBsYXloZWFkLFxuICAgICAgdGltZSxcbiAgICAgIGZyYW1lLFxuICAgICAgZHVyYXRpb24sXG4gICAgICB0b3RhbEZyYW1lcyxcbiAgICAgIGZwcyxcbiAgICAgIHRpbWVTY2FsZVxuICAgIH07XG4gIH1cblxuICBzZXR1cCAoc2V0dGluZ3MgPSB7fSkge1xuICAgIGlmICh0aGlzLnNrZXRjaCkgdGhyb3cgbmV3IEVycm9yKCdNdWx0aXBsZSBzZXR1cCgpIGNhbGxzIG5vdCB5ZXQgc3VwcG9ydGVkLicpO1xuXG4gICAgdGhpcy5fc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBzZXR0aW5ncywgdGhpcy5fc2V0dGluZ3MpO1xuXG4gICAgY2hlY2tTZXR0aW5ncyh0aGlzLl9zZXR0aW5ncyk7XG5cbiAgICAvLyBHZXQgaW5pdGlhbCBjYW52YXMgJiBjb250ZXh0XG4gICAgY29uc3QgeyBjb250ZXh0LCBjYW52YXMgfSA9IGNyZWF0ZUNhbnZhcyh0aGlzLl9zZXR0aW5ncyk7XG5cbiAgICBjb25zdCB0aW1lUHJvcHMgPSB0aGlzLmdldFRpbWVQcm9wcyh0aGlzLl9zZXR0aW5ncyk7XG5cbiAgICAvLyBJbml0aWFsIHJlbmRlciBzdGF0ZSBmZWF0dXJlc1xuICAgIHRoaXMuX3Byb3BzID0ge1xuICAgICAgLi4udGltZVByb3BzLFxuICAgICAgY2FudmFzLFxuICAgICAgY29udGV4dCxcbiAgICAgIGRlbHRhVGltZTogMCxcbiAgICAgIHN0YXJ0ZWQ6IGZhbHNlLFxuICAgICAgZXhwb3J0aW5nOiBmYWxzZSxcbiAgICAgIHBsYXlpbmc6IGZhbHNlLFxuICAgICAgcmVjb3JkaW5nOiBmYWxzZSxcbiAgICAgIHNldHRpbmdzOiB0aGlzLnNldHRpbmdzLFxuICAgICAgZGF0YTogdGhpcy5zZXR0aW5ncy5kYXRhLFxuXG4gICAgICAvLyBFeHBvcnQgc29tZSBzcGVjaWZpYyBhY3Rpb25zIHRvIHRoZSBza2V0Y2hcbiAgICAgIHJlbmRlcjogKCkgPT4gdGhpcy5yZW5kZXIoKSxcbiAgICAgIHRvZ2dsZVBsYXk6ICgpID0+IHRoaXMudG9nZ2xlUGxheSgpLFxuICAgICAgZGlzcGF0Y2g6IChjYikgPT4gdGhpcy5kaXNwYXRjaChjYiksXG4gICAgICB0aWNrOiAoKSA9PiB0aGlzLnRpY2soKSxcbiAgICAgIHJlc2l6ZTogKCkgPT4gdGhpcy5yZXNpemUoKSxcbiAgICAgIHVwZGF0ZTogKG9wdCkgPT4gdGhpcy51cGRhdGUob3B0KSxcbiAgICAgIGV4cG9ydEZyYW1lOiBvcHQgPT4gdGhpcy5leHBvcnRGcmFtZShvcHQpLFxuICAgICAgcmVjb3JkOiAoKSA9PiB0aGlzLnJlY29yZCgpLFxuICAgICAgcGxheTogKCkgPT4gdGhpcy5wbGF5KCksXG4gICAgICBwYXVzZTogKCkgPT4gdGhpcy5wYXVzZSgpLFxuICAgICAgc3RvcDogKCkgPT4gdGhpcy5zdG9wKClcbiAgICB9O1xuXG4gICAgLy8gRm9yIFdlYkdMIHNrZXRjaGVzLCBhIGdsIHZhcmlhYmxlIHJlYWRzIGEgYml0IGJldHRlclxuICAgIHRoaXMuX3NldHVwR0xLZXkoKTtcblxuICAgIC8vIFRyaWdnZXIgaW5pdGlhbCByZXNpemUgbm93IHNvIHRoYXQgY2FudmFzIGlzIGFscmVhZHkgc2l6ZWRcbiAgICAvLyBieSB0aGUgdGltZSB3ZSBsb2FkIHRoZSBza2V0Y2hcbiAgICB0aGlzLnJlc2l6ZSgpO1xuICB9XG5cbiAgbG9hZEFuZFJ1biAoY2FudmFzU2tldGNoLCBuZXdTZXR0aW5ncykge1xuICAgIHJldHVybiB0aGlzLmxvYWQoY2FudmFzU2tldGNoLCBuZXdTZXR0aW5ncykudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLnJ1bigpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSk7XG4gIH1cblxuICB1bmxvYWQgKCkge1xuICAgIHRoaXMucGF1c2UoKTtcbiAgICBpZiAoIXRoaXMuc2tldGNoKSByZXR1cm47XG4gICAgaWYgKHR5cGVvZiB0aGlzLnNrZXRjaC51bmxvYWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuX3dyYXBDb250ZXh0U2NhbGUocHJvcHMgPT4gdGhpcy5za2V0Y2gudW5sb2FkKHByb3BzKSk7XG4gICAgfVxuICAgIHRoaXMuX3NrZXRjaCA9IG51bGw7XG4gIH1cblxuICBkZXN0cm95ICgpIHtcbiAgICB0aGlzLnVubG9hZCgpO1xuICAgIHRoaXMudW5tb3VudCgpO1xuICB9XG5cbiAgbG9hZCAoY3JlYXRlU2tldGNoLCBuZXdTZXR0aW5ncykge1xuICAgIC8vIFVzZXIgZGlkbid0IHNwZWNpZnkgYSBmdW5jdGlvblxuICAgIGlmICh0eXBlb2YgY3JlYXRlU2tldGNoICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBmdW5jdGlvbiBtdXN0IHRha2UgaW4gYSBmdW5jdGlvbiBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyLiBFeGFtcGxlOlxcbiAgY2FudmFzU2tldGNoZXIoKCkgPT4geyAuLi4gfSwgc2V0dGluZ3MpJyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2tldGNoKSB7XG4gICAgICB0aGlzLnVubG9hZCgpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgbmV3U2V0dGluZ3MgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLnVwZGF0ZShuZXdTZXR0aW5ncyk7XG4gICAgfVxuXG4gICAgLy8gVGhpcyBpcyBhIGJpdCBvZiBhIHRyaWNreSBjYXNlOyB3ZSBzZXQgdXAgdGhlIGF1dG8tc2NhbGluZyBoZXJlXG4gICAgLy8gaW4gY2FzZSB0aGUgdXNlciBkZWNpZGVzIHRvIHJlbmRlciBhbnl0aGluZyB0byB0aGUgY29udGV4dCAqYmVmb3JlKiB0aGVcbiAgICAvLyByZW5kZXIoKSBmdW5jdGlvbi4uLiBIb3dldmVyLCB1c2VycyBzaG91bGQgaW5zdGVhZCB1c2UgYmVnaW4oKSBmdW5jdGlvbiBmb3IgdGhhdC5cbiAgICB0aGlzLl9wcmVSZW5kZXIoKTtcblxuICAgIGxldCBwcmVsb2FkID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5cbiAgICAvLyBCZWNhdXNlIG9mIFA1LmpzJ3MgdW51c3VhbCBzdHJ1Y3R1cmUsIHdlIGhhdmUgdG8gZG8gYSBiaXQgb2ZcbiAgICAvLyBsaWJyYXJ5LXNwZWNpZmljIGNoYW5nZXMgdG8gc3VwcG9ydCBpdCBwcm9wZXJseS5cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5wNSkge1xuICAgICAgaWYgKCFpc0Jyb3dzZXIoKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1tjYW52YXMtc2tldGNoXSBFUlJPUjogVXNpbmcgcDUuanMgaW4gTm9kZS5qcyBpcyBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICB9XG4gICAgICBwcmVsb2FkID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgIGxldCBQNUNvbnN0cnVjdG9yID0gdGhpcy5zZXR0aW5ncy5wNTtcbiAgICAgICAgbGV0IHByZWxvYWQ7XG4gICAgICAgIGlmIChQNUNvbnN0cnVjdG9yLnA1KSB7XG4gICAgICAgICAgcHJlbG9hZCA9IFA1Q29uc3RydWN0b3IucHJlbG9hZDtcbiAgICAgICAgICBQNUNvbnN0cnVjdG9yID0gUDVDb25zdHJ1Y3Rvci5wNTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSBza2V0Y2ggc2V0dXA7IGRpc2FibGUgbG9vcCwgc2V0IHNpemluZywgZXRjLlxuICAgICAgICBjb25zdCBwNVNrZXRjaCA9IHA1ID0+IHtcbiAgICAgICAgICAvLyBIb29rIGluIHByZWxvYWQgaWYgbmVjZXNzYXJ5XG4gICAgICAgICAgaWYgKHByZWxvYWQpIHA1LnByZWxvYWQgPSAoKSA9PiBwcmVsb2FkKHA1KTtcbiAgICAgICAgICBwNS5zZXR1cCA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIGNvbnN0IGlzR0wgPSB0aGlzLnNldHRpbmdzLmNvbnRleHQgPT09ICd3ZWJnbCc7XG4gICAgICAgICAgICBjb25zdCByZW5kZXJlciA9IGlzR0wgPyBwNS5XRUJHTCA6IHA1LlAyRDtcbiAgICAgICAgICAgIHA1Lm5vTG9vcCgpO1xuICAgICAgICAgICAgcDUucGl4ZWxEZW5zaXR5KHByb3BzLnBpeGVsUmF0aW8pO1xuICAgICAgICAgICAgcDUuY3JlYXRlQ2FudmFzKHByb3BzLnZpZXdwb3J0V2lkdGgsIHByb3BzLnZpZXdwb3J0SGVpZ2h0LCByZW5kZXJlcik7XG4gICAgICAgICAgICBpZiAoaXNHTCAmJiB0aGlzLnNldHRpbmdzLmF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgICAgcDUuc2V0QXR0cmlidXRlcyh0aGlzLnNldHRpbmdzLmF0dHJpYnV0ZXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSh7IHA1LCBjYW52YXM6IHA1LmNhbnZhcywgY29udGV4dDogcDUuX3JlbmRlcmVyLmRyYXdpbmdDb250ZXh0IH0pO1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgIH07XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gU3VwcG9ydCBnbG9iYWwgYW5kIGluc3RhbmNlIFA1LmpzIG1vZGVzXG4gICAgICAgIGlmICh0eXBlb2YgUDVDb25zdHJ1Y3RvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIG5ldyBQNUNvbnN0cnVjdG9yKHA1U2tldGNoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHdpbmRvdy5jcmVhdGVDYW52YXMgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInsgcDUgfSBzZXR0aW5nIGlzIHBhc3NlZCBidXQgY2FuJ3QgZmluZCBwNS5qcyBpbiBnbG9iYWwgKHdpbmRvdykgc2NvcGUuIE1heWJlIHlvdSBkaWQgbm90IGNyZWF0ZSBpdCBnbG9iYWxseT9cXG5uZXcgcDUoKTsgLy8gPC0tIGF0dGFjaGVzIHRvIGdsb2JhbCBzY29wZVwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcDVTa2V0Y2god2luZG93KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByZWxvYWQudGhlbigoKSA9PiB7XG4gICAgICAvLyBMb2FkIHRoZSB1c2VyJ3Mgc2tldGNoXG4gICAgICBsZXQgbG9hZGVyID0gY3JlYXRlU2tldGNoKHRoaXMucHJvcHMpO1xuICAgICAgaWYgKCFpc1Byb21pc2UobG9hZGVyKSkge1xuICAgICAgICBsb2FkZXIgPSBQcm9taXNlLnJlc29sdmUobG9hZGVyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsb2FkZXI7XG4gICAgfSkudGhlbihza2V0Y2ggPT4ge1xuICAgICAgaWYgKCFza2V0Y2gpIHNrZXRjaCA9IHt9O1xuICAgICAgdGhpcy5fc2tldGNoID0gc2tldGNoO1xuXG4gICAgICAvLyBPbmNlIHRoZSBza2V0Y2ggaXMgbG9hZGVkIHdlIGNhbiBhZGQgdGhlIGV2ZW50c1xuICAgICAgaWYgKGlzQnJvd3NlcigpKSB7XG4gICAgICAgIHRoaXMuX2tleWJvYXJkU2hvcnRjdXRzLmF0dGFjaCgpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5fcmVzaXplSGFuZGxlcik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3Bvc3RSZW5kZXIoKTtcblxuICAgICAgLy8gVGhlIGluaXRpYWwgcmVzaXplKCkgaW4gdGhlIGNvbnN0cnVjdG9yIHdpbGwgbm90IGhhdmVcbiAgICAgIC8vIHRyaWdnZXJlZCBhIHJlc2l6ZSgpIGV2ZW50IG9uIHRoZSBza2V0Y2gsIHNpbmNlIGl0IHdhcyBiZWZvcmVcbiAgICAgIC8vIHRoZSBza2V0Y2ggd2FzIGxvYWRlZC4gU28gd2Ugc2VuZCB0aGUgc2lnbmFsIGhlcmUsIGFsbG93aW5nXG4gICAgICAvLyB1c2VycyB0byByZWFjdCB0byB0aGUgaW5pdGlhbCBzaXplIGJlZm9yZSBmaXJzdCByZW5kZXIuXG4gICAgICB0aGlzLl9zaXplQ2hhbmdlZCgpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgIGNvbnNvbGUud2FybignQ291bGQgbm90IHN0YXJ0IHNrZXRjaCwgdGhlIGFzeW5jIGxvYWRpbmcgZnVuY3Rpb24gcmVqZWN0ZWQgd2l0aCBhbiBlcnJvcjpcXG4gICAgRXJyb3I6ICcgKyBlcnIubWVzc2FnZSk7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2tldGNoTWFuYWdlcjtcbiIsImltcG9ydCBTa2V0Y2hNYW5hZ2VyIGZyb20gJy4vY29yZS9Ta2V0Y2hNYW5hZ2VyJztcbmltcG9ydCBQYXBlclNpemVzIGZyb20gJy4vcGFwZXItc2l6ZXMnO1xuaW1wb3J0IHsgZ2V0Q2xpZW50QVBJIH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCBkZWZpbmVkIGZyb20gJ2RlZmluZWQnO1xuXG5jb25zdCBDQUNIRSA9ICdob3QtaWQtY2FjaGUnO1xuY29uc3QgcnVudGltZUNvbGxpc2lvbnMgPSBbXTtcblxuZnVuY3Rpb24gaXNIb3RSZWxvYWQgKCkge1xuICBjb25zdCBjbGllbnQgPSBnZXRDbGllbnRBUEkoKTtcbiAgcmV0dXJuIGNsaWVudCAmJiBjbGllbnQuaG90O1xufVxuXG5mdW5jdGlvbiBjYWNoZUdldCAoaWQpIHtcbiAgY29uc3QgY2xpZW50ID0gZ2V0Q2xpZW50QVBJKCk7XG4gIGlmICghY2xpZW50KSByZXR1cm4gdW5kZWZpbmVkO1xuICBjbGllbnRbQ0FDSEVdID0gY2xpZW50W0NBQ0hFXSB8fCB7fTtcbiAgcmV0dXJuIGNsaWVudFtDQUNIRV1baWRdO1xufVxuXG5mdW5jdGlvbiBjYWNoZVB1dCAoaWQsIGRhdGEpIHtcbiAgY29uc3QgY2xpZW50ID0gZ2V0Q2xpZW50QVBJKCk7XG4gIGlmICghY2xpZW50KSByZXR1cm4gdW5kZWZpbmVkO1xuICBjbGllbnRbQ0FDSEVdID0gY2xpZW50W0NBQ0hFXSB8fCB7fTtcbiAgY2xpZW50W0NBQ0hFXVtpZF0gPSBkYXRhO1xufVxuXG5mdW5jdGlvbiBnZXRUaW1lUHJvcCAob2xkTWFuYWdlciwgbmV3U2V0dGluZ3MpIHtcbiAgLy8gU3RhdGljIHNrZXRjaGVzIGlnbm9yZSB0aGUgdGltZSBwZXJzaXN0ZW5jeVxuICByZXR1cm4gbmV3U2V0dGluZ3MuYW5pbWF0ZSA/IHsgdGltZTogb2xkTWFuYWdlci5wcm9wcy50aW1lIH0gOiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGNhbnZhc1NrZXRjaCAoc2tldGNoLCBzZXR0aW5ncyA9IHt9KSB7XG4gIGlmIChzZXR0aW5ncy5wNSkge1xuICAgIGlmIChzZXR0aW5ncy5jYW52YXMgfHwgKHNldHRpbmdzLmNvbnRleHQgJiYgdHlwZW9mIHNldHRpbmdzLmNvbnRleHQgIT09ICdzdHJpbmcnKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbiB7IHA1IH0gbW9kZSwgeW91IGNhbid0IHBhc3MgeW91ciBvd24gY2FudmFzIG9yIGNvbnRleHQsIHVubGVzcyB0aGUgY29udGV4dCBpcyBhIFwid2ViZ2xcIiBvciBcIjJkXCIgc3RyaW5nYCk7XG4gICAgfVxuXG4gICAgLy8gRG8gbm90IGNyZWF0ZSBhIGNhbnZhcyBvbiBzdGFydHVwLCBzaW5jZSBQNS5qcyBkb2VzIHRoYXQgZm9yIHVzXG4gICAgY29uc3QgY29udGV4dCA9IHR5cGVvZiBzZXR0aW5ncy5jb250ZXh0ID09PSAnc3RyaW5nJyA/IHNldHRpbmdzLmNvbnRleHQgOiBmYWxzZTtcbiAgICBzZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIHNldHRpbmdzLCB7IGNhbnZhczogZmFsc2UsIGNvbnRleHQgfSk7XG4gIH1cblxuICBjb25zdCBpc0hvdCA9IGlzSG90UmVsb2FkKCk7XG4gIGxldCBob3RJRDtcbiAgaWYgKGlzSG90KSB7XG4gICAgLy8gVXNlIGEgbWFnaWMgbmFtZSBieSBkZWZhdWx0LCBmb3JjZSB1c2VyIHRvIGRlZmluZSBlYWNoIHNrZXRjaCBpZiB0aGV5XG4gICAgLy8gcmVxdWlyZSBtb3JlIHRoYW4gb25lIGluIGFuIGFwcGxpY2F0aW9uLiBPcGVuIHRvIG90aGVyIGlkZWFzIG9uIGhvdyB0byB0YWNrbGVcbiAgICAvLyB0aGlzIGFzIHdlbGwuLi5cbiAgICBob3RJRCA9IGRlZmluZWQoc2V0dGluZ3MuaWQsICckX19ERUZBVUxUX0NBTlZBU19TS0VUQ0hfSURfXyQnKTtcbiAgfVxuICBsZXQgaXNJbmplY3RpbmcgPSBpc0hvdCAmJiB0eXBlb2YgaG90SUQgPT09ICdzdHJpbmcnO1xuXG4gIGlmIChpc0luamVjdGluZyAmJiBydW50aW1lQ29sbGlzaW9ucy5pbmNsdWRlcyhob3RJRCkpIHtcbiAgICBjb25zb2xlLndhcm4oYFdhcm5pbmc6IFlvdSBoYXZlIG11bHRpcGxlIGNhbGxzIHRvIGNhbnZhc1NrZXRjaCgpIGluIC0taG90IG1vZGUuIFlvdSBtdXN0IHBhc3MgdW5pcXVlIHsgaWQgfSBzdHJpbmdzIGluIHNldHRpbmdzIHRvIGVuYWJsZSBob3QgcmVsb2FkIGFjcm9zcyBtdWx0aXBsZSBza2V0Y2hlcy4gYCwgaG90SUQpO1xuICAgIGlzSW5qZWN0aW5nID0gZmFsc2U7XG4gIH1cblxuICBsZXQgcHJlbG9hZCA9IFByb21pc2UucmVzb2x2ZSgpO1xuXG4gIGlmIChpc0luamVjdGluZykge1xuICAgIC8vIE1hcmsgdGhpcyBhcyBhbHJlYWR5IHNwb3R0ZWQgaW4gdGhpcyBydW50aW1lIGluc3RhbmNlXG4gICAgcnVudGltZUNvbGxpc2lvbnMucHVzaChob3RJRCk7XG5cbiAgICBjb25zdCBwcmV2aW91c0RhdGEgPSBjYWNoZUdldChob3RJRCk7XG4gICAgaWYgKHByZXZpb3VzRGF0YSkge1xuICAgICAgY29uc3QgbmV4dCA9ICgpID0+IHtcbiAgICAgICAgLy8gR3JhYiBuZXcgcHJvcHMgZnJvbSBvbGQgc2tldGNoIGluc3RhbmNlXG4gICAgICAgIGNvbnN0IG5ld1Byb3BzID0gZ2V0VGltZVByb3AocHJldmlvdXNEYXRhLm1hbmFnZXIsIHNldHRpbmdzKTtcbiAgICAgICAgLy8gRGVzdHJveSB0aGUgb2xkIGluc3RhbmNlXG4gICAgICAgIHByZXZpb3VzRGF0YS5tYW5hZ2VyLmRlc3Ryb3koKTtcbiAgICAgICAgLy8gUGFzcyBhbG9uZyBuZXcgcHJvcHNcbiAgICAgICAgcmV0dXJuIG5ld1Byb3BzO1xuICAgICAgfTtcblxuICAgICAgLy8gTW92ZSBhbG9uZyB0aGUgbmV4dCBkYXRhLi4uXG4gICAgICBwcmVsb2FkID0gcHJldmlvdXNEYXRhLmxvYWQudGhlbihuZXh0KS5jYXRjaChuZXh0KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcHJlbG9hZC50aGVuKG5ld1Byb3BzID0+IHtcbiAgICBjb25zdCBtYW5hZ2VyID0gbmV3IFNrZXRjaE1hbmFnZXIoKTtcbiAgICBsZXQgcmVzdWx0O1xuICAgIGlmIChza2V0Y2gpIHtcbiAgICAgIC8vIE1lcmdlIHdpdGggaW5jb21pbmcgZGF0YVxuICAgICAgc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBzZXR0aW5ncywgbmV3UHJvcHMpO1xuXG4gICAgICAvLyBBcHBseSBzZXR0aW5ncyBhbmQgY3JlYXRlIGEgY2FudmFzXG4gICAgICBtYW5hZ2VyLnNldHVwKHNldHRpbmdzKTtcblxuICAgICAgLy8gTW91bnQgdG8gRE9NXG4gICAgICBtYW5hZ2VyLm1vdW50KCk7XG5cbiAgICAgIC8vIGxvYWQgdGhlIHNrZXRjaCBmaXJzdFxuICAgICAgcmVzdWx0ID0gbWFuYWdlci5sb2FkQW5kUnVuKHNrZXRjaCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdCA9IFByb21pc2UucmVzb2x2ZShtYW5hZ2VyKTtcbiAgICB9XG4gICAgaWYgKGlzSW5qZWN0aW5nKSB7XG4gICAgICBjYWNoZVB1dChob3RJRCwgeyBsb2FkOiByZXN1bHQsIG1hbmFnZXIgfSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0pO1xufVxuXG4vLyBUT0RPOiBGaWd1cmUgb3V0IGEgbmljZSB3YXkgdG8gZXhwb3J0IHRoaW5ncy5cbmNhbnZhc1NrZXRjaC5jYW52YXNTa2V0Y2ggPSBjYW52YXNTa2V0Y2g7XG5jYW52YXNTa2V0Y2guUGFwZXJTaXplcyA9IFBhcGVyU2l6ZXM7XG5cbmV4cG9ydCBkZWZhdWx0IGNhbnZhc1NrZXRjaDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIF90eXBlb2YgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH0gOiBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9O1xuXG52YXIgaW5zdGFsbGVkQ29sb3JTcGFjZXMgPSBbXSxcbiAgICB1bmRlZiA9IGZ1bmN0aW9uIHVuZGVmKG9iaikge1xuICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJztcbn0sXG4gICAgY2hhbm5lbFJlZ0V4cCA9IC9cXHMqKFxcLlxcZCt8XFxkKyg/OlxcLlxcZCspPykoJSk/XFxzKi8sXG4gICAgcGVyY2VudGFnZUNoYW5uZWxSZWdFeHAgPSAvXFxzKihcXC5cXGQrfDEwMHxcXGQ/XFxkKD86XFwuXFxkKyk/KSVcXHMqLyxcbiAgICBhbHBoYUNoYW5uZWxSZWdFeHAgPSAvXFxzKihcXC5cXGQrfFxcZCsoPzpcXC5cXGQrKT8pXFxzKi8sXG4gICAgY3NzQ29sb3JSZWdFeHAgPSBuZXcgUmVnRXhwKCdeKHJnYnxoc2x8aHN2KWE/JyArICdcXFxcKCcgKyBjaGFubmVsUmVnRXhwLnNvdXJjZSArICcsJyArIGNoYW5uZWxSZWdFeHAuc291cmNlICsgJywnICsgY2hhbm5lbFJlZ0V4cC5zb3VyY2UgKyAnKD86LCcgKyBhbHBoYUNoYW5uZWxSZWdFeHAuc291cmNlICsgJyk/JyArICdcXFxcKSQnLCAnaScpO1xuXG5mdW5jdGlvbiBjb2xvcihvYmopIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygb2JqWzBdID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgY29sb3Jbb2JqWzBdXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgLy8gQXNzdW1lZCBhcnJheSBmcm9tIC50b0pTT04oKVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBjb2xvcltvYmpbMF1dKG9iai5zbGljZSgxLCBvYmoubGVuZ3RoKSk7XG4gICAgICAgIH0gZWxzZSBpZiAob2JqLmxlbmd0aCA9PT0gNCkge1xuICAgICAgICAgICAgLy8gQXNzdW1lZCA0IGVsZW1lbnQgaW50IFJHQiBhcnJheSBmcm9tIGNhbnZhcyB3aXRoIGFsbCBjaGFubmVscyBbMDsyNTVdXG4gICAgICAgICAgICByZXR1cm4gbmV3IGNvbG9yLlJHQihvYmpbMF0gLyAyNTUsIG9ialsxXSAvIDI1NSwgb2JqWzJdIC8gMjU1LCBvYmpbM10gLyAyNTUpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygb2JqID09PSAnc3RyaW5nJykge1xuICAgICAgICB2YXIgbG93ZXJDYXNlZCA9IG9iai50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBpZiAoY29sb3IubmFtZWRDb2xvcnNbbG93ZXJDYXNlZF0pIHtcbiAgICAgICAgICAgIG9iaiA9ICcjJyArIGNvbG9yLm5hbWVkQ29sb3JzW2xvd2VyQ2FzZWRdO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsb3dlckNhc2VkID09PSAndHJhbnNwYXJlbnQnKSB7XG4gICAgICAgICAgICBvYmogPSAncmdiYSgwLDAsMCwwKSc7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVGVzdCBmb3IgQ1NTIHJnYiguLi4uKSBzdHJpbmdcbiAgICAgICAgdmFyIG1hdGNoQ3NzU3ludGF4ID0gb2JqLm1hdGNoKGNzc0NvbG9yUmVnRXhwKTtcbiAgICAgICAgaWYgKG1hdGNoQ3NzU3ludGF4KSB7XG4gICAgICAgICAgICB2YXIgY29sb3JTcGFjZU5hbWUgPSBtYXRjaENzc1N5bnRheFsxXS50b1VwcGVyQ2FzZSgpLFxuICAgICAgICAgICAgICAgIGFscGhhID0gdW5kZWYobWF0Y2hDc3NTeW50YXhbOF0pID8gbWF0Y2hDc3NTeW50YXhbOF0gOiBwYXJzZUZsb2F0KG1hdGNoQ3NzU3ludGF4WzhdKSxcbiAgICAgICAgICAgICAgICBoYXNIdWUgPSBjb2xvclNwYWNlTmFtZVswXSA9PT0gJ0gnLFxuICAgICAgICAgICAgICAgIGZpcnN0Q2hhbm5lbERpdmlzb3IgPSBtYXRjaENzc1N5bnRheFszXSA/IDEwMCA6IGhhc0h1ZSA/IDM2MCA6IDI1NSxcbiAgICAgICAgICAgICAgICBzZWNvbmRDaGFubmVsRGl2aXNvciA9IG1hdGNoQ3NzU3ludGF4WzVdIHx8IGhhc0h1ZSA/IDEwMCA6IDI1NSxcbiAgICAgICAgICAgICAgICB0aGlyZENoYW5uZWxEaXZpc29yID0gbWF0Y2hDc3NTeW50YXhbN10gfHwgaGFzSHVlID8gMTAwIDogMjU1O1xuICAgICAgICAgICAgaWYgKHVuZGVmKGNvbG9yW2NvbG9yU3BhY2VOYW1lXSkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvbG9yLicgKyBjb2xvclNwYWNlTmFtZSArICcgaXMgbm90IGluc3RhbGxlZC4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBuZXcgY29sb3JbY29sb3JTcGFjZU5hbWVdKHBhcnNlRmxvYXQobWF0Y2hDc3NTeW50YXhbMl0pIC8gZmlyc3RDaGFubmVsRGl2aXNvciwgcGFyc2VGbG9hdChtYXRjaENzc1N5bnRheFs0XSkgLyBzZWNvbmRDaGFubmVsRGl2aXNvciwgcGFyc2VGbG9hdChtYXRjaENzc1N5bnRheFs2XSkgLyB0aGlyZENoYW5uZWxEaXZpc29yLCBhbHBoYSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQXNzdW1lIGhleCBzeW50YXhcbiAgICAgICAgaWYgKG9iai5sZW5ndGggPCA2KSB7XG4gICAgICAgICAgICAvLyBBbGxvdyBDU1Mgc2hvcnRoYW5kXG4gICAgICAgICAgICBvYmogPSBvYmoucmVwbGFjZSgvXiM/KFswLTlhLWZdKShbMC05YS1mXSkoWzAtOWEtZl0pJC9pLCAnJDEkMSQyJDIkMyQzJyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gU3BsaXQgb2JqIGludG8gcmVkLCBncmVlbiwgYW5kIGJsdWUgY29tcG9uZW50c1xuICAgICAgICB2YXIgaGV4TWF0Y2ggPSBvYmoubWF0Y2goL14jPyhbMC05YS1mXVswLTlhLWZdKShbMC05YS1mXVswLTlhLWZdKShbMC05YS1mXVswLTlhLWZdKSQvaSk7XG4gICAgICAgIGlmIChoZXhNYXRjaCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBjb2xvci5SR0IocGFyc2VJbnQoaGV4TWF0Y2hbMV0sIDE2KSAvIDI1NSwgcGFyc2VJbnQoaGV4TWF0Y2hbMl0sIDE2KSAvIDI1NSwgcGFyc2VJbnQoaGV4TWF0Y2hbM10sIDE2KSAvIDI1NSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBObyBtYXRjaCBzbyBmYXIuIExldHMgdHJ5IHRoZSBsZXNzIGxpa2VseSBvbmVzXG4gICAgICAgIGlmIChjb2xvci5DTVlLKSB7XG4gICAgICAgICAgICB2YXIgY215a01hdGNoID0gb2JqLm1hdGNoKG5ldyBSZWdFeHAoJ15jbXlrJyArICdcXFxcKCcgKyBwZXJjZW50YWdlQ2hhbm5lbFJlZ0V4cC5zb3VyY2UgKyAnLCcgKyBwZXJjZW50YWdlQ2hhbm5lbFJlZ0V4cC5zb3VyY2UgKyAnLCcgKyBwZXJjZW50YWdlQ2hhbm5lbFJlZ0V4cC5zb3VyY2UgKyAnLCcgKyBwZXJjZW50YWdlQ2hhbm5lbFJlZ0V4cC5zb3VyY2UgKyAnXFxcXCkkJywgJ2knKSk7XG4gICAgICAgICAgICBpZiAoY215a01hdGNoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBjb2xvci5DTVlLKHBhcnNlRmxvYXQoY215a01hdGNoWzFdKSAvIDEwMCwgcGFyc2VGbG9hdChjbXlrTWF0Y2hbMl0pIC8gMTAwLCBwYXJzZUZsb2F0KGNteWtNYXRjaFszXSkgLyAxMDAsIHBhcnNlRmxvYXQoY215a01hdGNoWzRdKSAvIDEwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCh0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihvYmopKSA9PT0gJ29iamVjdCcgJiYgb2JqLmlzQ29sb3IpIHtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5jb2xvci5uYW1lZENvbG9ycyA9IHt9O1xuXG5jb2xvci5pbnN0YWxsQ29sb3JTcGFjZSA9IGZ1bmN0aW9uIChjb2xvclNwYWNlTmFtZSwgcHJvcGVydHlOYW1lcywgY29uZmlnKSB7XG4gICAgY29sb3JbY29sb3JTcGFjZU5hbWVdID0gZnVuY3Rpb24gKGExKSB7XG4gICAgICAgIC8vIC4uLlxuICAgICAgICB2YXIgYXJncyA9IEFycmF5LmlzQXJyYXkoYTEpID8gYTEgOiBhcmd1bWVudHM7XG4gICAgICAgIHByb3BlcnR5TmFtZXMuZm9yRWFjaChmdW5jdGlvbiAocHJvcGVydHlOYW1lLCBpKSB7XG4gICAgICAgICAgICB2YXIgcHJvcGVydHlWYWx1ZSA9IGFyZ3NbaV07XG4gICAgICAgICAgICBpZiAocHJvcGVydHlOYW1lID09PSAnYWxwaGEnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWxwaGEgPSBpc05hTihwcm9wZXJ0eVZhbHVlKSB8fCBwcm9wZXJ0eVZhbHVlID4gMSA/IDEgOiBwcm9wZXJ0eVZhbHVlIDwgMCA/IDAgOiBwcm9wZXJ0eVZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNOYU4ocHJvcGVydHlWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdbJyArIGNvbG9yU3BhY2VOYW1lICsgJ106IEludmFsaWQgY29sb3I6ICgnICsgcHJvcGVydHlOYW1lcy5qb2luKCcsJykgKyAnKScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocHJvcGVydHlOYW1lID09PSAnaHVlJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9odWUgPSBwcm9wZXJ0eVZhbHVlIDwgMCA/IHByb3BlcnR5VmFsdWUgLSBNYXRoLmZsb29yKHByb3BlcnR5VmFsdWUpIDogcHJvcGVydHlWYWx1ZSAlIDE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpc1snXycgKyBwcm9wZXJ0eU5hbWVdID0gcHJvcGVydHlWYWx1ZSA8IDAgPyAwIDogcHJvcGVydHlWYWx1ZSA+IDEgPyAxIDogcHJvcGVydHlWYWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH07XG4gICAgY29sb3JbY29sb3JTcGFjZU5hbWVdLnByb3BlcnR5TmFtZXMgPSBwcm9wZXJ0eU5hbWVzO1xuXG4gICAgdmFyIHByb3RvdHlwZSA9IGNvbG9yW2NvbG9yU3BhY2VOYW1lXS5wcm90b3R5cGU7XG5cbiAgICBbJ3ZhbHVlT2YnLCAnaGV4JywgJ2hleGEnLCAnY3NzJywgJ2Nzc2EnXS5mb3JFYWNoKGZ1bmN0aW9uIChtZXRob2ROYW1lKSB7XG4gICAgICAgIHByb3RvdHlwZVttZXRob2ROYW1lXSA9IHByb3RvdHlwZVttZXRob2ROYW1lXSB8fCAoY29sb3JTcGFjZU5hbWUgPT09ICdSR0InID8gcHJvdG90eXBlLmhleCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJnYigpW21ldGhvZE5hbWVdKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcHJvdG90eXBlLmlzQ29sb3IgPSB0cnVlO1xuXG4gICAgcHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIChvdGhlckNvbG9yLCBlcHNpbG9uKSB7XG4gICAgICAgIGlmICh1bmRlZihlcHNpbG9uKSkge1xuICAgICAgICAgICAgZXBzaWxvbiA9IDFlLTEwO1xuICAgICAgICB9XG5cbiAgICAgICAgb3RoZXJDb2xvciA9IG90aGVyQ29sb3JbY29sb3JTcGFjZU5hbWUudG9Mb3dlckNhc2UoKV0oKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BlcnR5TmFtZXMubGVuZ3RoOyBpID0gaSArIDEpIHtcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyh0aGlzWydfJyArIHByb3BlcnR5TmFtZXNbaV1dIC0gb3RoZXJDb2xvclsnXycgKyBwcm9wZXJ0eU5hbWVzW2ldXSkgPiBlcHNpbG9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIHByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBbY29sb3JTcGFjZU5hbWVdLmNvbmNhdChwcm9wZXJ0eU5hbWVzLm1hcChmdW5jdGlvbiAocHJvcGVydHlOYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpc1snXycgKyBwcm9wZXJ0eU5hbWVdO1xuICAgICAgICB9LCB0aGlzKSk7XG4gICAgfTtcblxuICAgIGZvciAodmFyIHByb3BlcnR5TmFtZSBpbiBjb25maWcpIHtcbiAgICAgICAgaWYgKGNvbmZpZy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eU5hbWUpKSB7XG4gICAgICAgICAgICB2YXIgbWF0Y2hGcm9tQ29sb3JTcGFjZSA9IHByb3BlcnR5TmFtZS5tYXRjaCgvXmZyb20oLiopJC8pO1xuICAgICAgICAgICAgaWYgKG1hdGNoRnJvbUNvbG9yU3BhY2UpIHtcbiAgICAgICAgICAgICAgICBjb2xvclttYXRjaEZyb21Db2xvclNwYWNlWzFdLnRvVXBwZXJDYXNlKCldLnByb3RvdHlwZVtjb2xvclNwYWNlTmFtZS50b0xvd2VyQ2FzZSgpXSA9IGNvbmZpZ1twcm9wZXJ0eU5hbWVdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwcm90b3R5cGVbcHJvcGVydHlOYW1lXSA9IGNvbmZpZ1twcm9wZXJ0eU5hbWVdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gSXQgaXMgcHJldHR5IGVhc3kgdG8gaW1wbGVtZW50IHRoZSBjb252ZXJzaW9uIHRvIHRoZSBzYW1lIGNvbG9yIHNwYWNlOlxuICAgIHByb3RvdHlwZVtjb2xvclNwYWNlTmFtZS50b0xvd2VyQ2FzZSgpXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBwcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAnWycgKyBjb2xvclNwYWNlTmFtZSArICcgJyArIHByb3BlcnR5TmFtZXMubWFwKGZ1bmN0aW9uIChwcm9wZXJ0eU5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzWydfJyArIHByb3BlcnR5TmFtZV07XG4gICAgICAgIH0sIHRoaXMpLmpvaW4oJywgJykgKyAnXSc7XG4gICAgfTtcblxuICAgIC8vIEdlbmVyYXRlIGdldHRlcnMgYW5kIHNldHRlcnNcbiAgICBwcm9wZXJ0eU5hbWVzLmZvckVhY2goZnVuY3Rpb24gKHByb3BlcnR5TmFtZSkge1xuICAgICAgICB2YXIgc2hvcnROYW1lID0gcHJvcGVydHlOYW1lID09PSAnYmxhY2snID8gJ2snIDogcHJvcGVydHlOYW1lLmNoYXJBdCgwKTtcbiAgICAgICAgcHJvdG90eXBlW3Byb3BlcnR5TmFtZV0gPSBwcm90b3R5cGVbc2hvcnROYW1lXSA9IGZ1bmN0aW9uICh2YWx1ZSwgaXNEZWx0YSkge1xuICAgICAgICAgICAgLy8gU2ltcGxlIGdldHRlciBtb2RlOiBjb2xvci5yZWQoKVxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpc1snXycgKyBwcm9wZXJ0eU5hbWVdO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpc0RlbHRhKSB7XG4gICAgICAgICAgICAgICAgLy8gQWRqdXN0ZXI6IGNvbG9yLnJlZCgrLjIsIHRydWUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKHByb3BlcnR5TmFtZXMubWFwKGZ1bmN0aW9uIChvdGhlclByb3BlcnR5TmFtZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpc1snXycgKyBvdGhlclByb3BlcnR5TmFtZV0gKyAocHJvcGVydHlOYW1lID09PSBvdGhlclByb3BlcnR5TmFtZSA/IHZhbHVlIDogMCk7XG4gICAgICAgICAgICAgICAgfSwgdGhpcykpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBTZXR0ZXI6IGNvbG9yLnJlZCguMik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKHByb3BlcnR5TmFtZXMubWFwKGZ1bmN0aW9uIChvdGhlclByb3BlcnR5TmFtZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJvcGVydHlOYW1lID09PSBvdGhlclByb3BlcnR5TmFtZSA/IHZhbHVlIDogdGhpc1snXycgKyBvdGhlclByb3BlcnR5TmFtZV07XG4gICAgICAgICAgICAgICAgfSwgdGhpcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gaW5zdGFsbEZvcmVpZ25NZXRob2RzKHRhcmdldENvbG9yU3BhY2VOYW1lLCBzb3VyY2VDb2xvclNwYWNlTmFtZSkge1xuICAgICAgICB2YXIgb2JqID0ge307XG4gICAgICAgIG9ialtzb3VyY2VDb2xvclNwYWNlTmFtZS50b0xvd2VyQ2FzZSgpXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJnYigpW3NvdXJjZUNvbG9yU3BhY2VOYW1lLnRvTG93ZXJDYXNlKCldKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbG9yW3NvdXJjZUNvbG9yU3BhY2VOYW1lXS5wcm9wZXJ0eU5hbWVzLmZvckVhY2goZnVuY3Rpb24gKHByb3BlcnR5TmFtZSkge1xuICAgICAgICAgICAgdmFyIHNob3J0TmFtZSA9IHByb3BlcnR5TmFtZSA9PT0gJ2JsYWNrJyA/ICdrJyA6IHByb3BlcnR5TmFtZS5jaGFyQXQoMCk7XG4gICAgICAgICAgICBvYmpbcHJvcGVydHlOYW1lXSA9IG9ialtzaG9ydE5hbWVdID0gZnVuY3Rpb24gKHZhbHVlLCBpc0RlbHRhKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNbc291cmNlQ29sb3JTcGFjZU5hbWUudG9Mb3dlckNhc2UoKV0oKVtwcm9wZXJ0eU5hbWVdKHZhbHVlLCBpc0RlbHRhKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgICAgICBmb3IgKHZhciBwcm9wIGluIG9iaikge1xuICAgICAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wKSAmJiBjb2xvclt0YXJnZXRDb2xvclNwYWNlTmFtZV0ucHJvdG90eXBlW3Byb3BdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBjb2xvclt0YXJnZXRDb2xvclNwYWNlTmFtZV0ucHJvdG90eXBlW3Byb3BdID0gb2JqW3Byb3BdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW5zdGFsbGVkQ29sb3JTcGFjZXMuZm9yRWFjaChmdW5jdGlvbiAob3RoZXJDb2xvclNwYWNlTmFtZSkge1xuICAgICAgICBpbnN0YWxsRm9yZWlnbk1ldGhvZHMoY29sb3JTcGFjZU5hbWUsIG90aGVyQ29sb3JTcGFjZU5hbWUpO1xuICAgICAgICBpbnN0YWxsRm9yZWlnbk1ldGhvZHMob3RoZXJDb2xvclNwYWNlTmFtZSwgY29sb3JTcGFjZU5hbWUpO1xuICAgIH0pO1xuXG4gICAgaW5zdGFsbGVkQ29sb3JTcGFjZXMucHVzaChjb2xvclNwYWNlTmFtZSk7XG4gICAgcmV0dXJuIGNvbG9yO1xufTtcblxuY29sb3IucGx1Z2luTGlzdCA9IFtdO1xuXG5jb2xvci51c2UgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgaWYgKGNvbG9yLnBsdWdpbkxpc3QuaW5kZXhPZihwbHVnaW4pID09PSAtMSkge1xuICAgICAgICB0aGlzLnBsdWdpbkxpc3QucHVzaChwbHVnaW4pO1xuICAgICAgICBwbHVnaW4oY29sb3IpO1xuICAgIH1cbiAgICByZXR1cm4gY29sb3I7XG59O1xuXG5jb2xvci5pbnN0YWxsTWV0aG9kID0gZnVuY3Rpb24gKG5hbWUsIGZuKSB7XG4gICAgaW5zdGFsbGVkQ29sb3JTcGFjZXMuZm9yRWFjaChmdW5jdGlvbiAoY29sb3JTcGFjZSkge1xuICAgICAgICBjb2xvcltjb2xvclNwYWNlXS5wcm90b3R5cGVbbmFtZV0gPSBmbjtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5cbmNvbG9yLmluc3RhbGxDb2xvclNwYWNlKCdSR0InLCBbJ3JlZCcsICdncmVlbicsICdibHVlJywgJ2FscGhhJ10sIHtcbiAgICBoZXg6IGZ1bmN0aW9uIGhleCgpIHtcbiAgICAgICAgdmFyIGhleFN0cmluZyA9IChNYXRoLnJvdW5kKDI1NSAqIHRoaXMuX3JlZCkgKiAweDEwMDAwICsgTWF0aC5yb3VuZCgyNTUgKiB0aGlzLl9ncmVlbikgKiAweDEwMCArIE1hdGgucm91bmQoMjU1ICogdGhpcy5fYmx1ZSkpLnRvU3RyaW5nKDE2KTtcbiAgICAgICAgcmV0dXJuICcjJyArICcwMDAwMCcuc3Vic3RyKDAsIDYgLSBoZXhTdHJpbmcubGVuZ3RoKSArIGhleFN0cmluZztcbiAgICB9LFxuXG4gICAgaGV4YTogZnVuY3Rpb24gaGV4YSgpIHtcbiAgICAgICAgdmFyIGFscGhhU3RyaW5nID0gTWF0aC5yb3VuZCh0aGlzLl9hbHBoYSAqIDI1NSkudG9TdHJpbmcoMTYpO1xuICAgICAgICByZXR1cm4gJyMnICsgJzAwJy5zdWJzdHIoMCwgMiAtIGFscGhhU3RyaW5nLmxlbmd0aCkgKyBhbHBoYVN0cmluZyArIHRoaXMuaGV4KCkuc3Vic3RyKDEsIDYpO1xuICAgIH0sXG5cbiAgICBjc3M6IGZ1bmN0aW9uIGNzcygpIHtcbiAgICAgICAgcmV0dXJuICdyZ2IoJyArIE1hdGgucm91bmQoMjU1ICogdGhpcy5fcmVkKSArICcsJyArIE1hdGgucm91bmQoMjU1ICogdGhpcy5fZ3JlZW4pICsgJywnICsgTWF0aC5yb3VuZCgyNTUgKiB0aGlzLl9ibHVlKSArICcpJztcbiAgICB9LFxuXG4gICAgY3NzYTogZnVuY3Rpb24gY3NzYSgpIHtcbiAgICAgICAgcmV0dXJuICdyZ2JhKCcgKyBNYXRoLnJvdW5kKDI1NSAqIHRoaXMuX3JlZCkgKyAnLCcgKyBNYXRoLnJvdW5kKDI1NSAqIHRoaXMuX2dyZWVuKSArICcsJyArIE1hdGgucm91bmQoMjU1ICogdGhpcy5fYmx1ZSkgKyAnLCcgKyB0aGlzLl9hbHBoYSArICcpJztcbiAgICB9XG59KTtcblxudmFyIGNvbG9yXzEgPSBjb2xvcjtcblxudmFyIFhZWiA9IGZ1bmN0aW9uIFhZWihjb2xvcikge1xuICAgIGNvbG9yLmluc3RhbGxDb2xvclNwYWNlKCdYWVonLCBbJ3gnLCAneScsICd6JywgJ2FscGhhJ10sIHtcbiAgICAgICAgZnJvbVJnYjogZnVuY3Rpb24gZnJvbVJnYigpIHtcbiAgICAgICAgICAgIC8vIGh0dHA6Ly93d3cuZWFzeXJnYi5jb20vaW5kZXgucGhwP1g9TUFUSCZIPTAyI3RleHQyXG4gICAgICAgICAgICB2YXIgY29udmVydCA9IGZ1bmN0aW9uIGNvbnZlcnQoY2hhbm5lbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjaGFubmVsID4gMC4wNDA0NSA/IE1hdGgucG93KChjaGFubmVsICsgMC4wNTUpIC8gMS4wNTUsIDIuNCkgOiBjaGFubmVsIC8gMTIuOTI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHIgPSBjb252ZXJ0KHRoaXMuX3JlZCksXG4gICAgICAgICAgICAgICAgZyA9IGNvbnZlcnQodGhpcy5fZ3JlZW4pLFxuICAgICAgICAgICAgICAgIGIgPSBjb252ZXJ0KHRoaXMuX2JsdWUpO1xuXG4gICAgICAgICAgICAvLyBSZWZlcmVuY2Ugd2hpdGUgcG9pbnQgc1JHQiBENjU6XG4gICAgICAgICAgICAvLyBodHRwOi8vd3d3LmJydWNlbGluZGJsb29tLmNvbS9pbmRleC5odG1sP0Vxbl9SR0JfWFlaX01hdHJpeC5odG1sXG4gICAgICAgICAgICByZXR1cm4gbmV3IGNvbG9yLlhZWihyICogMC40MTI0NTY0ICsgZyAqIDAuMzU3NTc2MSArIGIgKiAwLjE4MDQzNzUsIHIgKiAwLjIxMjY3MjkgKyBnICogMC43MTUxNTIyICsgYiAqIDAuMDcyMTc1MCwgciAqIDAuMDE5MzMzOSArIGcgKiAwLjExOTE5MjAgKyBiICogMC45NTAzMDQxLCB0aGlzLl9hbHBoYSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmdiOiBmdW5jdGlvbiByZ2IoKSB7XG4gICAgICAgICAgICAvLyBodHRwOi8vd3d3LmVhc3lyZ2IuY29tL2luZGV4LnBocD9YPU1BVEgmSD0wMSN0ZXh0MVxuICAgICAgICAgICAgdmFyIHggPSB0aGlzLl94LFxuICAgICAgICAgICAgICAgIHkgPSB0aGlzLl95LFxuICAgICAgICAgICAgICAgIHogPSB0aGlzLl96LFxuICAgICAgICAgICAgICAgIGNvbnZlcnQgPSBmdW5jdGlvbiBjb252ZXJ0KGNoYW5uZWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2hhbm5lbCA+IDAuMDAzMTMwOCA/IDEuMDU1ICogTWF0aC5wb3coY2hhbm5lbCwgMSAvIDIuNCkgLSAwLjA1NSA6IDEyLjkyICogY2hhbm5lbDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIFJlZmVyZW5jZSB3aGl0ZSBwb2ludCBzUkdCIEQ2NTpcbiAgICAgICAgICAgIC8vIGh0dHA6Ly93d3cuYnJ1Y2VsaW5kYmxvb20uY29tL2luZGV4Lmh0bWw/RXFuX1JHQl9YWVpfTWF0cml4Lmh0bWxcbiAgICAgICAgICAgIHJldHVybiBuZXcgY29sb3IuUkdCKGNvbnZlcnQoeCAqIDMuMjQwNDU0MiArIHkgKiAtMS41MzcxMzg1ICsgeiAqIC0wLjQ5ODUzMTQpLCBjb252ZXJ0KHggKiAtMC45NjkyNjYwICsgeSAqIDEuODc2MDEwOCArIHogKiAwLjA0MTU1NjApLCBjb252ZXJ0KHggKiAwLjA1NTY0MzQgKyB5ICogLTAuMjA0MDI1OSArIHogKiAxLjA1NzIyNTIpLCB0aGlzLl9hbHBoYSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbGFiOiBmdW5jdGlvbiBsYWIoKSB7XG4gICAgICAgICAgICAvLyBodHRwOi8vd3d3LmVhc3lyZ2IuY29tL2luZGV4LnBocD9YPU1BVEgmSD0wNyN0ZXh0N1xuICAgICAgICAgICAgdmFyIGNvbnZlcnQgPSBmdW5jdGlvbiBjb252ZXJ0KGNoYW5uZWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2hhbm5lbCA+IDAuMDA4ODU2ID8gTWF0aC5wb3coY2hhbm5lbCwgMSAvIDMpIDogNy43ODcwMzcgKiBjaGFubmVsICsgNCAvIDI5O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB4ID0gY29udmVydCh0aGlzLl94IC8gOTUuMDQ3KSxcbiAgICAgICAgICAgICAgICB5ID0gY29udmVydCh0aGlzLl95IC8gMTAwLjAwMCksXG4gICAgICAgICAgICAgICAgeiA9IGNvbnZlcnQodGhpcy5feiAvIDEwOC44ODMpO1xuXG4gICAgICAgICAgICByZXR1cm4gbmV3IGNvbG9yLkxBQigxMTYgKiB5IC0gMTYsIDUwMCAqICh4IC0geSksIDIwMCAqICh5IC0geiksIHRoaXMuX2FscGhhKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxudmFyIExBQiA9IGZ1bmN0aW9uIExBQihjb2xvcikge1xuICAgIGNvbG9yLnVzZShYWVopO1xuXG4gICAgY29sb3IuaW5zdGFsbENvbG9yU3BhY2UoJ0xBQicsIFsnbCcsICdhJywgJ2InLCAnYWxwaGEnXSwge1xuICAgICAgICBmcm9tUmdiOiBmdW5jdGlvbiBmcm9tUmdiKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMueHl6KCkubGFiKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmdiOiBmdW5jdGlvbiByZ2IoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy54eXooKS5yZ2IoKTtcbiAgICAgICAgfSxcblxuICAgICAgICB4eXo6IGZ1bmN0aW9uIHh5eigpIHtcbiAgICAgICAgICAgIC8vIGh0dHA6Ly93d3cuZWFzeXJnYi5jb20vaW5kZXgucGhwP1g9TUFUSCZIPTA4I3RleHQ4XG4gICAgICAgICAgICB2YXIgY29udmVydCA9IGZ1bmN0aW9uIGNvbnZlcnQoY2hhbm5lbCkge1xuICAgICAgICAgICAgICAgIHZhciBwb3cgPSBNYXRoLnBvdyhjaGFubmVsLCAzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcG93ID4gMC4wMDg4NTYgPyBwb3cgOiAoY2hhbm5lbCAtIDE2IC8gMTE2KSAvIDcuODc7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHkgPSAodGhpcy5fbCArIDE2KSAvIDExNixcbiAgICAgICAgICAgICAgICB4ID0gdGhpcy5fYSAvIDUwMCArIHksXG4gICAgICAgICAgICAgICAgeiA9IHkgLSB0aGlzLl9iIC8gMjAwO1xuXG4gICAgICAgICAgICByZXR1cm4gbmV3IGNvbG9yLlhZWihjb252ZXJ0KHgpICogOTUuMDQ3LCBjb252ZXJ0KHkpICogMTAwLjAwMCwgY29udmVydCh6KSAqIDEwOC44ODMsIHRoaXMuX2FscGhhKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxudmFyIEhTViA9IGZ1bmN0aW9uIEhTVihjb2xvcikge1xuICAgIGNvbG9yLmluc3RhbGxDb2xvclNwYWNlKCdIU1YnLCBbJ2h1ZScsICdzYXR1cmF0aW9uJywgJ3ZhbHVlJywgJ2FscGhhJ10sIHtcbiAgICAgICAgcmdiOiBmdW5jdGlvbiByZ2IoKSB7XG4gICAgICAgICAgICB2YXIgaHVlID0gdGhpcy5faHVlLFxuICAgICAgICAgICAgICAgIHNhdHVyYXRpb24gPSB0aGlzLl9zYXR1cmF0aW9uLFxuICAgICAgICAgICAgICAgIHZhbHVlID0gdGhpcy5fdmFsdWUsXG4gICAgICAgICAgICAgICAgaSA9IE1hdGgubWluKDUsIE1hdGguZmxvb3IoaHVlICogNikpLFxuICAgICAgICAgICAgICAgIGYgPSBodWUgKiA2IC0gaSxcbiAgICAgICAgICAgICAgICBwID0gdmFsdWUgKiAoMSAtIHNhdHVyYXRpb24pLFxuICAgICAgICAgICAgICAgIHEgPSB2YWx1ZSAqICgxIC0gZiAqIHNhdHVyYXRpb24pLFxuICAgICAgICAgICAgICAgIHQgPSB2YWx1ZSAqICgxIC0gKDEgLSBmKSAqIHNhdHVyYXRpb24pLFxuICAgICAgICAgICAgICAgIHJlZCxcbiAgICAgICAgICAgICAgICBncmVlbixcbiAgICAgICAgICAgICAgICBibHVlO1xuICAgICAgICAgICAgc3dpdGNoIChpKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgICAgICByZWQgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgZ3JlZW4gPSB0O1xuICAgICAgICAgICAgICAgICAgICBibHVlID0gcDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICByZWQgPSBxO1xuICAgICAgICAgICAgICAgICAgICBncmVlbiA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBibHVlID0gcDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICByZWQgPSBwO1xuICAgICAgICAgICAgICAgICAgICBncmVlbiA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBibHVlID0gdDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICByZWQgPSBwO1xuICAgICAgICAgICAgICAgICAgICBncmVlbiA9IHE7XG4gICAgICAgICAgICAgICAgICAgIGJsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgICAgICByZWQgPSB0O1xuICAgICAgICAgICAgICAgICAgICBncmVlbiA9IHA7XG4gICAgICAgICAgICAgICAgICAgIGJsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgICAgICAgICByZWQgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgZ3JlZW4gPSBwO1xuICAgICAgICAgICAgICAgICAgICBibHVlID0gcTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbmV3IGNvbG9yLlJHQihyZWQsIGdyZWVuLCBibHVlLCB0aGlzLl9hbHBoYSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaHNsOiBmdW5jdGlvbiBoc2woKSB7XG4gICAgICAgICAgICB2YXIgbCA9ICgyIC0gdGhpcy5fc2F0dXJhdGlvbikgKiB0aGlzLl92YWx1ZSxcbiAgICAgICAgICAgICAgICBzdiA9IHRoaXMuX3NhdHVyYXRpb24gKiB0aGlzLl92YWx1ZSxcbiAgICAgICAgICAgICAgICBzdkRpdmlzb3IgPSBsIDw9IDEgPyBsIDogMiAtIGwsXG4gICAgICAgICAgICAgICAgc2F0dXJhdGlvbjtcblxuICAgICAgICAgICAgLy8gQXZvaWQgZGl2aXNpb24gYnkgemVybyB3aGVuIGxpZ2h0bmVzcyBhcHByb2FjaGVzIHplcm86XG4gICAgICAgICAgICBpZiAoc3ZEaXZpc29yIDwgMWUtOSkge1xuICAgICAgICAgICAgICAgIHNhdHVyYXRpb24gPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzYXR1cmF0aW9uID0gc3YgLyBzdkRpdmlzb3I7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbmV3IGNvbG9yLkhTTCh0aGlzLl9odWUsIHNhdHVyYXRpb24sIGwgLyAyLCB0aGlzLl9hbHBoYSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZnJvbVJnYjogZnVuY3Rpb24gZnJvbVJnYigpIHtcbiAgICAgICAgICAgIC8vIEJlY29tZXMgb25lLmNvbG9yLlJHQi5wcm90b3R5cGUuaHN2XG4gICAgICAgICAgICB2YXIgcmVkID0gdGhpcy5fcmVkLFxuICAgICAgICAgICAgICAgIGdyZWVuID0gdGhpcy5fZ3JlZW4sXG4gICAgICAgICAgICAgICAgYmx1ZSA9IHRoaXMuX2JsdWUsXG4gICAgICAgICAgICAgICAgbWF4ID0gTWF0aC5tYXgocmVkLCBncmVlbiwgYmx1ZSksXG4gICAgICAgICAgICAgICAgbWluID0gTWF0aC5taW4ocmVkLCBncmVlbiwgYmx1ZSksXG4gICAgICAgICAgICAgICAgZGVsdGEgPSBtYXggLSBtaW4sXG4gICAgICAgICAgICAgICAgaHVlLFxuICAgICAgICAgICAgICAgIHNhdHVyYXRpb24gPSBtYXggPT09IDAgPyAwIDogZGVsdGEgLyBtYXgsXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBtYXg7XG4gICAgICAgICAgICBpZiAoZGVsdGEgPT09IDApIHtcbiAgICAgICAgICAgICAgICBodWUgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKG1heCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIHJlZDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGh1ZSA9IChncmVlbiAtIGJsdWUpIC8gZGVsdGEgLyA2ICsgKGdyZWVuIDwgYmx1ZSA/IDEgOiAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGdyZWVuOlxuICAgICAgICAgICAgICAgICAgICAgICAgaHVlID0gKGJsdWUgLSByZWQpIC8gZGVsdGEgLyA2ICsgMSAvIDM7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBibHVlOlxuICAgICAgICAgICAgICAgICAgICAgICAgaHVlID0gKHJlZCAtIGdyZWVuKSAvIGRlbHRhIC8gNiArIDIgLyAzO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBjb2xvci5IU1YoaHVlLCBzYXR1cmF0aW9uLCB2YWx1ZSwgdGhpcy5fYWxwaGEpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG52YXIgSFNMID0gZnVuY3Rpb24gSFNMKGNvbG9yKSB7XG4gICAgY29sb3IudXNlKEhTVik7XG5cbiAgICBjb2xvci5pbnN0YWxsQ29sb3JTcGFjZSgnSFNMJywgWydodWUnLCAnc2F0dXJhdGlvbicsICdsaWdodG5lc3MnLCAnYWxwaGEnXSwge1xuICAgICAgICBoc3Y6IGZ1bmN0aW9uIGhzdigpIHtcbiAgICAgICAgICAgIC8vIEFsZ29yaXRobSBhZGFwdGVkIGZyb20gaHR0cDovL3dpa2kuc2Vjb25kbGlmZS5jb20vd2lraS9Db2xvcl9jb252ZXJzaW9uX3NjcmlwdHNcbiAgICAgICAgICAgIHZhciBsID0gdGhpcy5fbGlnaHRuZXNzICogMixcbiAgICAgICAgICAgICAgICBzID0gdGhpcy5fc2F0dXJhdGlvbiAqIChsIDw9IDEgPyBsIDogMiAtIGwpLFxuICAgICAgICAgICAgICAgIHNhdHVyYXRpb247XG5cbiAgICAgICAgICAgIC8vIEF2b2lkIGRpdmlzaW9uIGJ5IHplcm8gd2hlbiBsICsgcyBpcyB2ZXJ5IHNtYWxsIChhcHByb2FjaGluZyBibGFjayk6XG4gICAgICAgICAgICBpZiAobCArIHMgPCAxZS05KSB7XG4gICAgICAgICAgICAgICAgc2F0dXJhdGlvbiA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNhdHVyYXRpb24gPSAyICogcyAvIChsICsgcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBuZXcgY29sb3IuSFNWKHRoaXMuX2h1ZSwgc2F0dXJhdGlvbiwgKGwgKyBzKSAvIDIsIHRoaXMuX2FscGhhKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZ2I6IGZ1bmN0aW9uIHJnYigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhzdigpLnJnYigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZyb21SZ2I6IGZ1bmN0aW9uIGZyb21SZ2IoKSB7XG4gICAgICAgICAgICAvLyBCZWNvbWVzIG9uZS5jb2xvci5SR0IucHJvdG90eXBlLmhzdlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaHN2KCkuaHNsKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbnZhciBDTVlLID0gZnVuY3Rpb24gQ01ZSyhjb2xvcikge1xuICAgIGNvbG9yLmluc3RhbGxDb2xvclNwYWNlKCdDTVlLJywgWydjeWFuJywgJ21hZ2VudGEnLCAneWVsbG93JywgJ2JsYWNrJywgJ2FscGhhJ10sIHtcbiAgICAgICAgcmdiOiBmdW5jdGlvbiByZ2IoKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IGNvbG9yLlJHQigxIC0gdGhpcy5fY3lhbiAqICgxIC0gdGhpcy5fYmxhY2spIC0gdGhpcy5fYmxhY2ssIDEgLSB0aGlzLl9tYWdlbnRhICogKDEgLSB0aGlzLl9ibGFjaykgLSB0aGlzLl9ibGFjaywgMSAtIHRoaXMuX3llbGxvdyAqICgxIC0gdGhpcy5fYmxhY2spIC0gdGhpcy5fYmxhY2ssIHRoaXMuX2FscGhhKTtcbiAgICAgICAgfSxcblxuICAgICAgICBmcm9tUmdiOiBmdW5jdGlvbiBmcm9tUmdiKCkge1xuICAgICAgICAgICAgLy8gQmVjb21lcyBvbmUuY29sb3IuUkdCLnByb3RvdHlwZS5jbXlrXG4gICAgICAgICAgICAvLyBBZGFwdGVkIGZyb20gaHR0cDovL3d3dy5qYXZhc2NyaXB0ZXIubmV0L2ZhcS9yZ2IyY215ay5odG1cbiAgICAgICAgICAgIHZhciByZWQgPSB0aGlzLl9yZWQsXG4gICAgICAgICAgICAgICAgZ3JlZW4gPSB0aGlzLl9ncmVlbixcbiAgICAgICAgICAgICAgICBibHVlID0gdGhpcy5fYmx1ZSxcbiAgICAgICAgICAgICAgICBjeWFuID0gMSAtIHJlZCxcbiAgICAgICAgICAgICAgICBtYWdlbnRhID0gMSAtIGdyZWVuLFxuICAgICAgICAgICAgICAgIHllbGxvdyA9IDEgLSBibHVlLFxuICAgICAgICAgICAgICAgIGJsYWNrID0gMTtcbiAgICAgICAgICAgIGlmIChyZWQgfHwgZ3JlZW4gfHwgYmx1ZSkge1xuICAgICAgICAgICAgICAgIGJsYWNrID0gTWF0aC5taW4oY3lhbiwgTWF0aC5taW4obWFnZW50YSwgeWVsbG93KSk7XG4gICAgICAgICAgICAgICAgY3lhbiA9IChjeWFuIC0gYmxhY2spIC8gKDEgLSBibGFjayk7XG4gICAgICAgICAgICAgICAgbWFnZW50YSA9IChtYWdlbnRhIC0gYmxhY2spIC8gKDEgLSBibGFjayk7XG4gICAgICAgICAgICAgICAgeWVsbG93ID0gKHllbGxvdyAtIGJsYWNrKSAvICgxIC0gYmxhY2spO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBibGFjayA9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbmV3IGNvbG9yLkNNWUsoY3lhbiwgbWFnZW50YSwgeWVsbG93LCBibGFjaywgdGhpcy5fYWxwaGEpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG52YXIgbmFtZWRDb2xvcnMgPSBmdW5jdGlvbiBuYW1lZENvbG9ycyhjb2xvcikge1xuICAgIGNvbG9yLm5hbWVkQ29sb3JzID0ge1xuICAgICAgICBhbGljZWJsdWU6ICdmMGY4ZmYnLFxuICAgICAgICBhbnRpcXVld2hpdGU6ICdmYWViZDcnLFxuICAgICAgICBhcXVhOiAnMGZmJyxcbiAgICAgICAgYXF1YW1hcmluZTogJzdmZmZkNCcsXG4gICAgICAgIGF6dXJlOiAnZjBmZmZmJyxcbiAgICAgICAgYmVpZ2U6ICdmNWY1ZGMnLFxuICAgICAgICBiaXNxdWU6ICdmZmU0YzQnLFxuICAgICAgICBibGFjazogJzAwMCcsXG4gICAgICAgIGJsYW5jaGVkYWxtb25kOiAnZmZlYmNkJyxcbiAgICAgICAgYmx1ZTogJzAwZicsXG4gICAgICAgIGJsdWV2aW9sZXQ6ICc4YTJiZTInLFxuICAgICAgICBicm93bjogJ2E1MmEyYScsXG4gICAgICAgIGJ1cmx5d29vZDogJ2RlYjg4NycsXG4gICAgICAgIGNhZGV0Ymx1ZTogJzVmOWVhMCcsXG4gICAgICAgIGNoYXJ0cmV1c2U6ICc3ZmZmMDAnLFxuICAgICAgICBjaG9jb2xhdGU6ICdkMjY5MWUnLFxuICAgICAgICBjb3JhbDogJ2ZmN2Y1MCcsXG4gICAgICAgIGNvcm5mbG93ZXJibHVlOiAnNjQ5NWVkJyxcbiAgICAgICAgY29ybnNpbGs6ICdmZmY4ZGMnLFxuICAgICAgICBjcmltc29uOiAnZGMxNDNjJyxcbiAgICAgICAgY3lhbjogJzBmZicsXG4gICAgICAgIGRhcmtibHVlOiAnMDAwMDhiJyxcbiAgICAgICAgZGFya2N5YW46ICcwMDhiOGInLFxuICAgICAgICBkYXJrZ29sZGVucm9kOiAnYjg4NjBiJyxcbiAgICAgICAgZGFya2dyYXk6ICdhOWE5YTknLFxuICAgICAgICBkYXJrZ3JleTogJ2E5YTlhOScsXG4gICAgICAgIGRhcmtncmVlbjogJzAwNjQwMCcsXG4gICAgICAgIGRhcmtraGFraTogJ2JkYjc2YicsXG4gICAgICAgIGRhcmttYWdlbnRhOiAnOGIwMDhiJyxcbiAgICAgICAgZGFya29saXZlZ3JlZW46ICc1NTZiMmYnLFxuICAgICAgICBkYXJrb3JhbmdlOiAnZmY4YzAwJyxcbiAgICAgICAgZGFya29yY2hpZDogJzk5MzJjYycsXG4gICAgICAgIGRhcmtyZWQ6ICc4YjAwMDAnLFxuICAgICAgICBkYXJrc2FsbW9uOiAnZTk5NjdhJyxcbiAgICAgICAgZGFya3NlYWdyZWVuOiAnOGZiYzhmJyxcbiAgICAgICAgZGFya3NsYXRlYmx1ZTogJzQ4M2Q4YicsXG4gICAgICAgIGRhcmtzbGF0ZWdyYXk6ICcyZjRmNGYnLFxuICAgICAgICBkYXJrc2xhdGVncmV5OiAnMmY0ZjRmJyxcbiAgICAgICAgZGFya3R1cnF1b2lzZTogJzAwY2VkMScsXG4gICAgICAgIGRhcmt2aW9sZXQ6ICc5NDAwZDMnLFxuICAgICAgICBkZWVwcGluazogJ2ZmMTQ5MycsXG4gICAgICAgIGRlZXBza3libHVlOiAnMDBiZmZmJyxcbiAgICAgICAgZGltZ3JheTogJzY5Njk2OScsXG4gICAgICAgIGRpbWdyZXk6ICc2OTY5NjknLFxuICAgICAgICBkb2RnZXJibHVlOiAnMWU5MGZmJyxcbiAgICAgICAgZmlyZWJyaWNrOiAnYjIyMjIyJyxcbiAgICAgICAgZmxvcmFsd2hpdGU6ICdmZmZhZjAnLFxuICAgICAgICBmb3Jlc3RncmVlbjogJzIyOGIyMicsXG4gICAgICAgIGZ1Y2hzaWE6ICdmMGYnLFxuICAgICAgICBnYWluc2Jvcm86ICdkY2RjZGMnLFxuICAgICAgICBnaG9zdHdoaXRlOiAnZjhmOGZmJyxcbiAgICAgICAgZ29sZDogJ2ZmZDcwMCcsXG4gICAgICAgIGdvbGRlbnJvZDogJ2RhYTUyMCcsXG4gICAgICAgIGdyYXk6ICc4MDgwODAnLFxuICAgICAgICBncmV5OiAnODA4MDgwJyxcbiAgICAgICAgZ3JlZW46ICcwMDgwMDAnLFxuICAgICAgICBncmVlbnllbGxvdzogJ2FkZmYyZicsXG4gICAgICAgIGhvbmV5ZGV3OiAnZjBmZmYwJyxcbiAgICAgICAgaG90cGluazogJ2ZmNjliNCcsXG4gICAgICAgIGluZGlhbnJlZDogJ2NkNWM1YycsXG4gICAgICAgIGluZGlnbzogJzRiMDA4MicsXG4gICAgICAgIGl2b3J5OiAnZmZmZmYwJyxcbiAgICAgICAga2hha2k6ICdmMGU2OGMnLFxuICAgICAgICBsYXZlbmRlcjogJ2U2ZTZmYScsXG4gICAgICAgIGxhdmVuZGVyYmx1c2g6ICdmZmYwZjUnLFxuICAgICAgICBsYXduZ3JlZW46ICc3Y2ZjMDAnLFxuICAgICAgICBsZW1vbmNoaWZmb246ICdmZmZhY2QnLFxuICAgICAgICBsaWdodGJsdWU6ICdhZGQ4ZTYnLFxuICAgICAgICBsaWdodGNvcmFsOiAnZjA4MDgwJyxcbiAgICAgICAgbGlnaHRjeWFuOiAnZTBmZmZmJyxcbiAgICAgICAgbGlnaHRnb2xkZW5yb2R5ZWxsb3c6ICdmYWZhZDInLFxuICAgICAgICBsaWdodGdyYXk6ICdkM2QzZDMnLFxuICAgICAgICBsaWdodGdyZXk6ICdkM2QzZDMnLFxuICAgICAgICBsaWdodGdyZWVuOiAnOTBlZTkwJyxcbiAgICAgICAgbGlnaHRwaW5rOiAnZmZiNmMxJyxcbiAgICAgICAgbGlnaHRzYWxtb246ICdmZmEwN2EnLFxuICAgICAgICBsaWdodHNlYWdyZWVuOiAnMjBiMmFhJyxcbiAgICAgICAgbGlnaHRza3libHVlOiAnODdjZWZhJyxcbiAgICAgICAgbGlnaHRzbGF0ZWdyYXk6ICc3ODknLFxuICAgICAgICBsaWdodHNsYXRlZ3JleTogJzc4OScsXG4gICAgICAgIGxpZ2h0c3RlZWxibHVlOiAnYjBjNGRlJyxcbiAgICAgICAgbGlnaHR5ZWxsb3c6ICdmZmZmZTAnLFxuICAgICAgICBsaW1lOiAnMGYwJyxcbiAgICAgICAgbGltZWdyZWVuOiAnMzJjZDMyJyxcbiAgICAgICAgbGluZW46ICdmYWYwZTYnLFxuICAgICAgICBtYWdlbnRhOiAnZjBmJyxcbiAgICAgICAgbWFyb29uOiAnODAwMDAwJyxcbiAgICAgICAgbWVkaXVtYXF1YW1hcmluZTogJzY2Y2RhYScsXG4gICAgICAgIG1lZGl1bWJsdWU6ICcwMDAwY2QnLFxuICAgICAgICBtZWRpdW1vcmNoaWQ6ICdiYTU1ZDMnLFxuICAgICAgICBtZWRpdW1wdXJwbGU6ICc5MzcwZDgnLFxuICAgICAgICBtZWRpdW1zZWFncmVlbjogJzNjYjM3MScsXG4gICAgICAgIG1lZGl1bXNsYXRlYmx1ZTogJzdiNjhlZScsXG4gICAgICAgIG1lZGl1bXNwcmluZ2dyZWVuOiAnMDBmYTlhJyxcbiAgICAgICAgbWVkaXVtdHVycXVvaXNlOiAnNDhkMWNjJyxcbiAgICAgICAgbWVkaXVtdmlvbGV0cmVkOiAnYzcxNTg1JyxcbiAgICAgICAgbWlkbmlnaHRibHVlOiAnMTkxOTcwJyxcbiAgICAgICAgbWludGNyZWFtOiAnZjVmZmZhJyxcbiAgICAgICAgbWlzdHlyb3NlOiAnZmZlNGUxJyxcbiAgICAgICAgbW9jY2FzaW46ICdmZmU0YjUnLFxuICAgICAgICBuYXZham93aGl0ZTogJ2ZmZGVhZCcsXG4gICAgICAgIG5hdnk6ICcwMDAwODAnLFxuICAgICAgICBvbGRsYWNlOiAnZmRmNWU2JyxcbiAgICAgICAgb2xpdmU6ICc4MDgwMDAnLFxuICAgICAgICBvbGl2ZWRyYWI6ICc2YjhlMjMnLFxuICAgICAgICBvcmFuZ2U6ICdmZmE1MDAnLFxuICAgICAgICBvcmFuZ2VyZWQ6ICdmZjQ1MDAnLFxuICAgICAgICBvcmNoaWQ6ICdkYTcwZDYnLFxuICAgICAgICBwYWxlZ29sZGVucm9kOiAnZWVlOGFhJyxcbiAgICAgICAgcGFsZWdyZWVuOiAnOThmYjk4JyxcbiAgICAgICAgcGFsZXR1cnF1b2lzZTogJ2FmZWVlZScsXG4gICAgICAgIHBhbGV2aW9sZXRyZWQ6ICdkODcwOTMnLFxuICAgICAgICBwYXBheWF3aGlwOiAnZmZlZmQ1JyxcbiAgICAgICAgcGVhY2hwdWZmOiAnZmZkYWI5JyxcbiAgICAgICAgcGVydTogJ2NkODUzZicsXG4gICAgICAgIHBpbms6ICdmZmMwY2InLFxuICAgICAgICBwbHVtOiAnZGRhMGRkJyxcbiAgICAgICAgcG93ZGVyYmx1ZTogJ2IwZTBlNicsXG4gICAgICAgIHB1cnBsZTogJzgwMDA4MCcsXG4gICAgICAgIHJlYmVjY2FwdXJwbGU6ICc2MzknLFxuICAgICAgICByZWQ6ICdmMDAnLFxuICAgICAgICByb3N5YnJvd246ICdiYzhmOGYnLFxuICAgICAgICByb3lhbGJsdWU6ICc0MTY5ZTEnLFxuICAgICAgICBzYWRkbGVicm93bjogJzhiNDUxMycsXG4gICAgICAgIHNhbG1vbjogJ2ZhODA3MicsXG4gICAgICAgIHNhbmR5YnJvd246ICdmNGE0NjAnLFxuICAgICAgICBzZWFncmVlbjogJzJlOGI1NycsXG4gICAgICAgIHNlYXNoZWxsOiAnZmZmNWVlJyxcbiAgICAgICAgc2llbm5hOiAnYTA1MjJkJyxcbiAgICAgICAgc2lsdmVyOiAnYzBjMGMwJyxcbiAgICAgICAgc2t5Ymx1ZTogJzg3Y2VlYicsXG4gICAgICAgIHNsYXRlYmx1ZTogJzZhNWFjZCcsXG4gICAgICAgIHNsYXRlZ3JheTogJzcwODA5MCcsXG4gICAgICAgIHNsYXRlZ3JleTogJzcwODA5MCcsXG4gICAgICAgIHNub3c6ICdmZmZhZmEnLFxuICAgICAgICBzcHJpbmdncmVlbjogJzAwZmY3ZicsXG4gICAgICAgIHN0ZWVsYmx1ZTogJzQ2ODJiNCcsXG4gICAgICAgIHRhbjogJ2QyYjQ4YycsXG4gICAgICAgIHRlYWw6ICcwMDgwODAnLFxuICAgICAgICB0aGlzdGxlOiAnZDhiZmQ4JyxcbiAgICAgICAgdG9tYXRvOiAnZmY2MzQ3JyxcbiAgICAgICAgdHVycXVvaXNlOiAnNDBlMGQwJyxcbiAgICAgICAgdmlvbGV0OiAnZWU4MmVlJyxcbiAgICAgICAgd2hlYXQ6ICdmNWRlYjMnLFxuICAgICAgICB3aGl0ZTogJ2ZmZicsXG4gICAgICAgIHdoaXRlc21va2U6ICdmNWY1ZjUnLFxuICAgICAgICB5ZWxsb3c6ICdmZjAnLFxuICAgICAgICB5ZWxsb3dncmVlbjogJzlhY2QzMidcbiAgICB9O1xufTtcblxudmFyIGNsZWFyZXIgPSBmdW5jdGlvbiBjbGVhcmVyKGNvbG9yKSB7XG4gICAgY29sb3IuaW5zdGFsbE1ldGhvZCgnY2xlYXJlcicsIGZ1bmN0aW9uIChhbW91bnQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWxwaGEoaXNOYU4oYW1vdW50KSA/IC0wLjEgOiAtYW1vdW50LCB0cnVlKTtcbiAgICB9KTtcbn07XG5cbnZhciBkYXJrZW4gPSBmdW5jdGlvbiBkYXJrZW4oY29sb3IpIHtcbiAgICBjb2xvci51c2UoSFNMKTtcblxuICAgIGNvbG9yLmluc3RhbGxNZXRob2QoJ2RhcmtlbicsIGZ1bmN0aW9uIChhbW91bnQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGlnaHRuZXNzKGlzTmFOKGFtb3VudCkgPyAtMC4xIDogLWFtb3VudCwgdHJ1ZSk7XG4gICAgfSk7XG59O1xuXG52YXIgZGVzYXR1cmF0ZSA9IGZ1bmN0aW9uIGRlc2F0dXJhdGUoY29sb3IpIHtcbiAgICBjb2xvci51c2UoSFNMKTtcblxuICAgIGNvbG9yLmluc3RhbGxNZXRob2QoJ2Rlc2F0dXJhdGUnLCBmdW5jdGlvbiAoYW1vdW50KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNhdHVyYXRpb24oaXNOYU4oYW1vdW50KSA/IC0wLjEgOiAtYW1vdW50LCB0cnVlKTtcbiAgICB9KTtcbn07XG5cbnZhciBncmF5c2NhbGUgPSBmdW5jdGlvbiBncmF5c2NhbGUoY29sb3IpIHtcbiAgICBmdW5jdGlvbiBncygpIHtcbiAgICAgICAgLypqc2xpbnQgc3RyaWN0OmZhbHNlKi9cbiAgICAgICAgdmFyIHJnYiA9IHRoaXMucmdiKCksXG4gICAgICAgICAgICB2YWwgPSByZ2IuX3JlZCAqIDAuMyArIHJnYi5fZ3JlZW4gKiAwLjU5ICsgcmdiLl9ibHVlICogMC4xMTtcblxuICAgICAgICByZXR1cm4gbmV3IGNvbG9yLlJHQih2YWwsIHZhbCwgdmFsLCByZ2IuX2FscGhhKTtcbiAgICB9XG5cbiAgICBjb2xvci5pbnN0YWxsTWV0aG9kKCdncmV5c2NhbGUnLCBncykuaW5zdGFsbE1ldGhvZCgnZ3JheXNjYWxlJywgZ3MpO1xufTtcblxudmFyIGxpZ2h0ZW4gPSBmdW5jdGlvbiBsaWdodGVuKGNvbG9yKSB7XG4gICAgY29sb3IudXNlKEhTTCk7XG5cbiAgICBjb2xvci5pbnN0YWxsTWV0aG9kKCdsaWdodGVuJywgZnVuY3Rpb24gKGFtb3VudCkge1xuICAgICAgICByZXR1cm4gdGhpcy5saWdodG5lc3MoaXNOYU4oYW1vdW50KSA/IDAuMSA6IGFtb3VudCwgdHJ1ZSk7XG4gICAgfSk7XG59O1xuXG52YXIgbWl4ID0gZnVuY3Rpb24gbWl4KGNvbG9yKSB7XG4gICAgY29sb3IuaW5zdGFsbE1ldGhvZCgnbWl4JywgZnVuY3Rpb24gKG90aGVyQ29sb3IsIHdlaWdodCkge1xuICAgICAgICBvdGhlckNvbG9yID0gY29sb3Iob3RoZXJDb2xvcikucmdiKCk7XG4gICAgICAgIHdlaWdodCA9IDEgLSAoaXNOYU4od2VpZ2h0KSA/IDAuNSA6IHdlaWdodCk7XG5cbiAgICAgICAgdmFyIHcgPSB3ZWlnaHQgKiAyIC0gMSxcbiAgICAgICAgICAgIGEgPSB0aGlzLl9hbHBoYSAtIG90aGVyQ29sb3IuX2FscGhhLFxuICAgICAgICAgICAgd2VpZ2h0MSA9ICgodyAqIGEgPT09IC0xID8gdyA6ICh3ICsgYSkgLyAoMSArIHcgKiBhKSkgKyAxKSAvIDIsXG4gICAgICAgICAgICB3ZWlnaHQyID0gMSAtIHdlaWdodDEsXG4gICAgICAgICAgICByZ2IgPSB0aGlzLnJnYigpO1xuXG4gICAgICAgIHJldHVybiBuZXcgY29sb3IuUkdCKHJnYi5fcmVkICogd2VpZ2h0MSArIG90aGVyQ29sb3IuX3JlZCAqIHdlaWdodDIsIHJnYi5fZ3JlZW4gKiB3ZWlnaHQxICsgb3RoZXJDb2xvci5fZ3JlZW4gKiB3ZWlnaHQyLCByZ2IuX2JsdWUgKiB3ZWlnaHQxICsgb3RoZXJDb2xvci5fYmx1ZSAqIHdlaWdodDIsIHJnYi5fYWxwaGEgKiB3ZWlnaHQgKyBvdGhlckNvbG9yLl9hbHBoYSAqICgxIC0gd2VpZ2h0KSk7XG4gICAgfSk7XG59O1xuXG52YXIgbmVnYXRlID0gZnVuY3Rpb24gbmVnYXRlKGNvbG9yKSB7XG4gICAgY29sb3IuaW5zdGFsbE1ldGhvZCgnbmVnYXRlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcmdiID0gdGhpcy5yZ2IoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBjb2xvci5SR0IoMSAtIHJnYi5fcmVkLCAxIC0gcmdiLl9ncmVlbiwgMSAtIHJnYi5fYmx1ZSwgdGhpcy5fYWxwaGEpO1xuICAgIH0pO1xufTtcblxudmFyIG9wYXF1ZXIgPSBmdW5jdGlvbiBvcGFxdWVyKGNvbG9yKSB7XG4gICAgY29sb3IuaW5zdGFsbE1ldGhvZCgnb3BhcXVlcicsIGZ1bmN0aW9uIChhbW91bnQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWxwaGEoaXNOYU4oYW1vdW50KSA/IDAuMSA6IGFtb3VudCwgdHJ1ZSk7XG4gICAgfSk7XG59O1xuXG52YXIgcm90YXRlID0gZnVuY3Rpb24gcm90YXRlKGNvbG9yKSB7XG4gICAgY29sb3IudXNlKEhTTCk7XG5cbiAgICBjb2xvci5pbnN0YWxsTWV0aG9kKCdyb3RhdGUnLCBmdW5jdGlvbiAoZGVncmVlcykge1xuICAgICAgICByZXR1cm4gdGhpcy5odWUoKGRlZ3JlZXMgfHwgMCkgLyAzNjAsIHRydWUpO1xuICAgIH0pO1xufTtcblxudmFyIHNhdHVyYXRlID0gZnVuY3Rpb24gc2F0dXJhdGUoY29sb3IpIHtcbiAgICBjb2xvci51c2UoSFNMKTtcblxuICAgIGNvbG9yLmluc3RhbGxNZXRob2QoJ3NhdHVyYXRlJywgZnVuY3Rpb24gKGFtb3VudCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zYXR1cmF0aW9uKGlzTmFOKGFtb3VudCkgPyAwLjEgOiBhbW91bnQsIHRydWUpO1xuICAgIH0pO1xufTtcblxuLy8gQWRhcHRlZCBmcm9tIGh0dHA6Ly9naW1wLnNvdXJjZWFyY2hpdmUuY29tL2RvY3VtZW50YXRpb24vMi42LjYtMXVidW50dTEvY29sb3ItdG8tYWxwaGFfOGMtc291cmNlLmh0bWxcbi8vIHRvQWxwaGEgcmV0dXJucyBhIGNvbG9yIHdoZXJlIHRoZSB2YWx1ZXMgb2YgdGhlIGFyZ3VtZW50IGhhdmUgYmVlbiBjb252ZXJ0ZWQgdG8gYWxwaGFcbnZhciB0b0FscGhhID0gZnVuY3Rpb24gdG9BbHBoYShjb2xvcikge1xuICAgIGNvbG9yLmluc3RhbGxNZXRob2QoJ3RvQWxwaGEnLCBmdW5jdGlvbiAoY29sb3IpIHtcbiAgICAgICAgdmFyIG1lID0gdGhpcy5yZ2IoKSxcbiAgICAgICAgICAgIG90aGVyID0gY29sb3IoY29sb3IpLnJnYigpLFxuICAgICAgICAgICAgZXBzaWxvbiA9IDFlLTEwLFxuICAgICAgICAgICAgYSA9IG5ldyBjb2xvci5SR0IoMCwgMCwgMCwgbWUuX2FscGhhKSxcbiAgICAgICAgICAgIGNoYW5uZWxzID0gWydfcmVkJywgJ19ncmVlbicsICdfYmx1ZSddO1xuXG4gICAgICAgIGNoYW5uZWxzLmZvckVhY2goZnVuY3Rpb24gKGNoYW5uZWwpIHtcbiAgICAgICAgICAgIGlmIChtZVtjaGFubmVsXSA8IGVwc2lsb24pIHtcbiAgICAgICAgICAgICAgICBhW2NoYW5uZWxdID0gbWVbY2hhbm5lbF07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG1lW2NoYW5uZWxdID4gb3RoZXJbY2hhbm5lbF0pIHtcbiAgICAgICAgICAgICAgICBhW2NoYW5uZWxdID0gKG1lW2NoYW5uZWxdIC0gb3RoZXJbY2hhbm5lbF0pIC8gKDEgLSBvdGhlcltjaGFubmVsXSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG1lW2NoYW5uZWxdID4gb3RoZXJbY2hhbm5lbF0pIHtcbiAgICAgICAgICAgICAgICBhW2NoYW5uZWxdID0gKG90aGVyW2NoYW5uZWxdIC0gbWVbY2hhbm5lbF0pIC8gb3RoZXJbY2hhbm5lbF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFbY2hhbm5lbF0gPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoYS5fcmVkID4gYS5fZ3JlZW4pIHtcbiAgICAgICAgICAgIGlmIChhLl9yZWQgPiBhLl9ibHVlKSB7XG4gICAgICAgICAgICAgICAgbWUuX2FscGhhID0gYS5fcmVkO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtZS5fYWxwaGEgPSBhLl9ibHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGEuX2dyZWVuID4gYS5fYmx1ZSkge1xuICAgICAgICAgICAgbWUuX2FscGhhID0gYS5fZ3JlZW47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtZS5fYWxwaGEgPSBhLl9ibHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1lLl9hbHBoYSA8IGVwc2lsb24pIHtcbiAgICAgICAgICAgIHJldHVybiBtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNoYW5uZWxzLmZvckVhY2goZnVuY3Rpb24gKGNoYW5uZWwpIHtcbiAgICAgICAgICAgIG1lW2NoYW5uZWxdID0gKG1lW2NoYW5uZWxdIC0gb3RoZXJbY2hhbm5lbF0pIC8gbWUuX2FscGhhICsgb3RoZXJbY2hhbm5lbF07XG4gICAgICAgIH0pO1xuICAgICAgICBtZS5fYWxwaGEgKj0gYS5fYWxwaGE7XG5cbiAgICAgICAgcmV0dXJuIG1lO1xuICAgIH0pO1xufTtcblxudmFyIG9uZWNvbG9yID0gY29sb3JfMS51c2UoWFlaKS51c2UoTEFCKS51c2UoSFNWKS51c2UoSFNMKS51c2UoQ01ZSylcblxuLy8gQ29udmVuaWVuY2UgZnVuY3Rpb25zXG4udXNlKG5hbWVkQ29sb3JzKS51c2UoY2xlYXJlcikudXNlKGRhcmtlbikudXNlKGRlc2F0dXJhdGUpLnVzZShncmF5c2NhbGUpLnVzZShsaWdodGVuKS51c2UobWl4KS51c2UobmVnYXRlKS51c2Uob3BhcXVlcikudXNlKHJvdGF0ZSkudXNlKHNhdHVyYXRlKS51c2UodG9BbHBoYSk7XG5cbmZ1bmN0aW9uIGdldENvbnRyYXN0UmF0aW8oZm9yZWdyb3VuZCwgYmFja2dyb3VuZCkge1xuICB2YXIgYmFja2dyb3VuZE9uV2hpdGUgPSBhbHBoYUJsZW5kKGJhY2tncm91bmQsICcjZmZmJyk7XG4gIHZhciBiYWNrZ3JvdW5kT25CbGFjayA9IGFscGhhQmxlbmQoYmFja2dyb3VuZCwgJyMwMDAnKTtcblxuICB2YXIgTFdoaXRlID0gZ2V0UmVsYXRpdmVMdW1pbmFuY2UoYmFja2dyb3VuZE9uV2hpdGUpO1xuICB2YXIgTEJsYWNrID0gZ2V0UmVsYXRpdmVMdW1pbmFuY2UoYmFja2dyb3VuZE9uQmxhY2spO1xuICB2YXIgTEZvcmVncm91bmQgPSBnZXRSZWxhdGl2ZUx1bWluYW5jZShmb3JlZ3JvdW5kKTtcblxuICBpZiAoTFdoaXRlIDwgTEZvcmVncm91bmQpIHtcbiAgICByZXR1cm4gZ2V0Q29udHJhc3RSYXRpb09wYXF1ZShmb3JlZ3JvdW5kLCBiYWNrZ3JvdW5kT25XaGl0ZSk7XG4gIH0gZWxzZSBpZiAoTEJsYWNrID4gTEZvcmVncm91bmQpIHtcbiAgICByZXR1cm4gZ2V0Q29udHJhc3RSYXRpb09wYXF1ZShmb3JlZ3JvdW5kLCBiYWNrZ3JvdW5kT25CbGFjayk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIDE7XG4gIH1cbn1cblxuZnVuY3Rpb24gYWxwaGFCbGVuZChjc3NGb3JlZ3JvdW5kLCBjc3NCYWNrZ3JvdW5kKSB7XG4gIHZhciBmb3JlZ3JvdW5kID0gb25lY29sb3IoY3NzRm9yZWdyb3VuZCk7XG4gIHZhciBiYWNrZ3JvdW5kID0gb25lY29sb3IoY3NzQmFja2dyb3VuZCk7XG4gIHZhciByZXN1bHQgPSBvbmVjb2xvcignI2ZmZicpO1xuICB2YXIgYSA9IGZvcmVncm91bmQuYWxwaGEoKTtcblxuICByZXN1bHQuX3JlZCA9IGZvcmVncm91bmQuX3JlZCAqIGEgKyBiYWNrZ3JvdW5kLl9yZWQgKiAoMSAtIGEpO1xuICByZXN1bHQuX2dyZWVuID0gZm9yZWdyb3VuZC5fZ3JlZW4gKiBhICsgYmFja2dyb3VuZC5fZ3JlZW4gKiAoMSAtIGEpO1xuICByZXN1bHQuX2JsdWUgPSBmb3JlZ3JvdW5kLl9ibHVlICogYSArIGJhY2tncm91bmQuX2JsdWUgKiAoMSAtIGEpO1xuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGdldENvbnRyYXN0UmF0aW9PcGFxdWUoZm9yZWdyb3VuZCwgYmFja2dyb3VuZCkge1xuICB2YXIgTDEgPSBnZXRSZWxhdGl2ZUx1bWluYW5jZShiYWNrZ3JvdW5kKTtcbiAgdmFyIEwyID0gZ2V0UmVsYXRpdmVMdW1pbmFuY2UoYWxwaGFCbGVuZChmb3JlZ3JvdW5kLCBiYWNrZ3JvdW5kKSk7XG5cbiAgLy8gaHR0cHM6Ly93d3cudzMub3JnL1RSLzIwMDgvUkVDLVdDQUcyMC0yMDA4MTIxMS8jY29udHJhc3QtcmF0aW9kZWZcbiAgcmV0dXJuIChNYXRoLm1heChMMSwgTDIpICsgMC4wNSkgLyAoTWF0aC5taW4oTDEsIEwyKSArIDAuMDUpO1xufVxuXG5mdW5jdGlvbiBnZXRSZWxhdGl2ZUx1bWluYW5jZShjc3NDb2xvcikge1xuICAvLyBodHRwczovL3d3dy53My5vcmcvVFIvMjAwOC9SRUMtV0NBRzIwLTIwMDgxMjExLyNyZWxhdGl2ZWx1bWluYW5jZWRlZlxuICB2YXIgY29sb3IgPSBvbmVjb2xvcihjc3NDb2xvcik7XG5cbiAgdmFyIFIgPSBjb2xvci5fcmVkIDw9IDAuMDM5MjggPyBjb2xvci5fcmVkIC8gMTIuOTIgOiBNYXRoLnBvdygoY29sb3IuX3JlZCArIDAuMDU1KSAvIDEuMDU1LCAyLjQpO1xuICB2YXIgRyA9IGNvbG9yLl9ncmVlbiA8PSAwLjAzOTI4ID8gY29sb3IuX2dyZWVuIC8gMTIuOTIgOiBNYXRoLnBvdygoY29sb3IuX2dyZWVuICsgMC4wNTUpIC8gMS4wNTUsIDIuNCk7XG4gIHZhciBCID0gY29sb3IuX2JsdWUgPD0gMC4wMzkyOCA/IGNvbG9yLl9ibHVlIC8gMTIuOTIgOiBNYXRoLnBvdygoY29sb3IuX2JsdWUgKyAwLjA1NSkgLyAxLjA1NSwgMi40KTtcblxuICB2YXIgTCA9IDAuMjEyNiAqIFIgKyAwLjcxNTIgKiBHICsgMC4wNzIyICogQjtcblxuICByZXR1cm4gTDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRDb250cmFzdFJhdGlvO1xuIiwidmFyIGRlZmluZWQgPSByZXF1aXJlKCdkZWZpbmVkJyk7XG52YXIgdW5pdHMgPSBbICdtbScsICdjbScsICdtJywgJ3BjJywgJ3B0JywgJ2luJywgJ2Z0JywgJ3B4JyBdO1xuXG52YXIgY29udmVyc2lvbnMgPSB7XG4gIC8vIG1ldHJpY1xuICBtOiB7XG4gICAgc3lzdGVtOiAnbWV0cmljJyxcbiAgICBmYWN0b3I6IDFcbiAgfSxcbiAgY206IHtcbiAgICBzeXN0ZW06ICdtZXRyaWMnLFxuICAgIGZhY3RvcjogMSAvIDEwMFxuICB9LFxuICBtbToge1xuICAgIHN5c3RlbTogJ21ldHJpYycsXG4gICAgZmFjdG9yOiAxIC8gMTAwMFxuICB9LFxuICAvLyBpbXBlcmlhbFxuICBwdDoge1xuICAgIHN5c3RlbTogJ2ltcGVyaWFsJyxcbiAgICBmYWN0b3I6IDEgLyA3MlxuICB9LFxuICBwYzoge1xuICAgIHN5c3RlbTogJ2ltcGVyaWFsJyxcbiAgICBmYWN0b3I6IDEgLyA2XG4gIH0sXG4gIGluOiB7XG4gICAgc3lzdGVtOiAnaW1wZXJpYWwnLFxuICAgIGZhY3RvcjogMVxuICB9LFxuICBmdDoge1xuICAgIHN5c3RlbTogJ2ltcGVyaWFsJyxcbiAgICBmYWN0b3I6IDEyXG4gIH1cbn07XG5cbmNvbnN0IGFuY2hvcnMgPSB7XG4gIG1ldHJpYzoge1xuICAgIHVuaXQ6ICdtJyxcbiAgICByYXRpbzogMSAvIDAuMDI1NFxuICB9LFxuICBpbXBlcmlhbDoge1xuICAgIHVuaXQ6ICdpbicsXG4gICAgcmF0aW86IDAuMDI1NFxuICB9XG59O1xuXG5mdW5jdGlvbiByb3VuZCAodmFsdWUsIGRlY2ltYWxzKSB7XG4gIHJldHVybiBOdW1iZXIoTWF0aC5yb3VuZCh2YWx1ZSArICdlJyArIGRlY2ltYWxzKSArICdlLScgKyBkZWNpbWFscyk7XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnREaXN0YW5jZSAodmFsdWUsIGZyb21Vbml0LCB0b1VuaXQsIG9wdHMpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ251bWJlcicgfHwgIWlzRmluaXRlKHZhbHVlKSkgdGhyb3cgbmV3IEVycm9yKCdWYWx1ZSBtdXN0IGJlIGEgZmluaXRlIG51bWJlcicpO1xuICBpZiAoIWZyb21Vbml0IHx8ICF0b1VuaXQpIHRocm93IG5ldyBFcnJvcignTXVzdCBzcGVjaWZ5IGZyb20gYW5kIHRvIHVuaXRzJyk7XG5cbiAgb3B0cyA9IG9wdHMgfHwge307XG4gIHZhciBwaXhlbHNQZXJJbmNoID0gZGVmaW5lZChvcHRzLnBpeGVsc1BlckluY2gsIDk2KTtcbiAgdmFyIHByZWNpc2lvbiA9IG9wdHMucHJlY2lzaW9uO1xuICB2YXIgcm91bmRQaXhlbCA9IG9wdHMucm91bmRQaXhlbCAhPT0gZmFsc2U7XG5cbiAgZnJvbVVuaXQgPSBmcm9tVW5pdC50b0xvd2VyQ2FzZSgpO1xuICB0b1VuaXQgPSB0b1VuaXQudG9Mb3dlckNhc2UoKTtcblxuICBpZiAodW5pdHMuaW5kZXhPZihmcm9tVW5pdCkgPT09IC0xKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZnJvbSB1bml0IFwiJyArIGZyb21Vbml0ICsgJ1wiLCBtdXN0IGJlIG9uZSBvZjogJyArIHVuaXRzLmpvaW4oJywgJykpO1xuICBpZiAodW5pdHMuaW5kZXhPZih0b1VuaXQpID09PSAtMSkgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGZyb20gdW5pdCBcIicgKyB0b1VuaXQgKyAnXCIsIG11c3QgYmUgb25lIG9mOiAnICsgdW5pdHMuam9pbignLCAnKSk7XG5cbiAgaWYgKGZyb21Vbml0ID09PSB0b1VuaXQpIHtcbiAgICAvLyBXZSBkb24ndCBuZWVkIHRvIGNvbnZlcnQgZnJvbSBBIHRvIEIgc2luY2UgdGhleSBhcmUgdGhlIHNhbWUgYWxyZWFkeVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIHZhciB0b0ZhY3RvciA9IDE7XG4gIHZhciBmcm9tRmFjdG9yID0gMTtcbiAgdmFyIGlzVG9QaXhlbCA9IGZhbHNlO1xuXG4gIGlmIChmcm9tVW5pdCA9PT0gJ3B4Jykge1xuICAgIGZyb21GYWN0b3IgPSAxIC8gcGl4ZWxzUGVySW5jaDtcbiAgICBmcm9tVW5pdCA9ICdpbic7XG4gIH1cbiAgaWYgKHRvVW5pdCA9PT0gJ3B4Jykge1xuICAgIGlzVG9QaXhlbCA9IHRydWU7XG4gICAgdG9GYWN0b3IgPSBwaXhlbHNQZXJJbmNoO1xuICAgIHRvVW5pdCA9ICdpbic7XG4gIH1cblxuICB2YXIgZnJvbVVuaXREYXRhID0gY29udmVyc2lvbnNbZnJvbVVuaXRdO1xuICB2YXIgdG9Vbml0RGF0YSA9IGNvbnZlcnNpb25zW3RvVW5pdF07XG5cbiAgLy8gc291cmNlIHRvIGFuY2hvciBpbnNpZGUgc291cmNlJ3Mgc3lzdGVtXG4gIHZhciBhbmNob3IgPSB2YWx1ZSAqIGZyb21Vbml0RGF0YS5mYWN0b3IgKiBmcm9tRmFjdG9yO1xuXG4gIC8vIGlmIHN5c3RlbXMgZGlmZmVyLCBjb252ZXJ0IG9uZSB0byBhbm90aGVyXG4gIGlmIChmcm9tVW5pdERhdGEuc3lzdGVtICE9PSB0b1VuaXREYXRhLnN5c3RlbSkge1xuICAgIC8vIHJlZ3VsYXIgJ20nIHRvICdpbicgYW5kIHNvIGZvcnRoXG4gICAgYW5jaG9yICo9IGFuY2hvcnNbZnJvbVVuaXREYXRhLnN5c3RlbV0ucmF0aW87XG4gIH1cblxuICB2YXIgcmVzdWx0ID0gYW5jaG9yIC8gdG9Vbml0RGF0YS5mYWN0b3IgKiB0b0ZhY3RvcjtcbiAgaWYgKGlzVG9QaXhlbCAmJiByb3VuZFBpeGVsKSB7XG4gICAgcmVzdWx0ID0gTWF0aC5yb3VuZChyZXN1bHQpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBwcmVjaXNpb24gPT09ICdudW1iZXInICYmIGlzRmluaXRlKHByZWNpc2lvbikpIHtcbiAgICByZXN1bHQgPSByb3VuZChyZXN1bHQsIHByZWNpc2lvbik7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb252ZXJ0RGlzdGFuY2U7XG5tb2R1bGUuZXhwb3J0cy51bml0cyA9IHVuaXRzO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50c1tpXSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gYXJndW1lbnRzW2ldO1xuICAgIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cz1bW1wiIzY5ZDJlN1wiLFwiI2E3ZGJkOFwiLFwiI2UwZTRjY1wiLFwiI2YzODYzMFwiLFwiI2ZhNjkwMFwiXSxbXCIjZmU0MzY1XCIsXCIjZmM5ZDlhXCIsXCIjZjljZGFkXCIsXCIjYzhjOGE5XCIsXCIjODNhZjliXCJdLFtcIiNlY2QwNzhcIixcIiNkOTViNDNcIixcIiNjMDI5NDJcIixcIiM1NDI0MzdcIixcIiM1Mzc3N2FcIl0sW1wiIzU1NjI3MFwiLFwiIzRlY2RjNFwiLFwiI2M3ZjQ2NFwiLFwiI2ZmNmI2YlwiLFwiI2M0NGQ1OFwiXSxbXCIjNzc0ZjM4XCIsXCIjZTA4ZTc5XCIsXCIjZjFkNGFmXCIsXCIjZWNlNWNlXCIsXCIjYzVlMGRjXCJdLFtcIiNlOGRkY2JcIixcIiNjZGIzODBcIixcIiMwMzY1NjRcIixcIiMwMzM2NDlcIixcIiMwMzE2MzRcIl0sW1wiIzQ5MGEzZFwiLFwiI2JkMTU1MFwiLFwiI2U5N2YwMlwiLFwiI2Y4Y2EwMFwiLFwiIzhhOWIwZlwiXSxbXCIjNTk0ZjRmXCIsXCIjNTQ3OTgwXCIsXCIjNDVhZGE4XCIsXCIjOWRlMGFkXCIsXCIjZTVmY2MyXCJdLFtcIiMwMGEwYjBcIixcIiM2YTRhM2NcIixcIiNjYzMzM2ZcIixcIiNlYjY4NDFcIixcIiNlZGM5NTFcIl0sW1wiI2U5NGU3N1wiLFwiI2Q2ODE4OVwiLFwiI2M2YTQ5YVwiLFwiI2M2ZTVkOVwiLFwiI2Y0ZWFkNVwiXSxbXCIjM2ZiOGFmXCIsXCIjN2ZjN2FmXCIsXCIjZGFkOGE3XCIsXCIjZmY5ZTlkXCIsXCIjZmYzZDdmXCJdLFtcIiNkOWNlYjJcIixcIiM5NDhjNzVcIixcIiNkNWRlZDlcIixcIiM3YTZhNTNcIixcIiM5OWIyYjdcIl0sW1wiI2ZmZmZmZlwiLFwiI2NiZTg2YlwiLFwiI2YyZTllMVwiLFwiIzFjMTQwZFwiLFwiI2NiZTg2YlwiXSxbXCIjZWZmZmNkXCIsXCIjZGNlOWJlXCIsXCIjNTU1MTUyXCIsXCIjMmUyNjMzXCIsXCIjOTkxNzNjXCJdLFtcIiMzNDM4MzhcIixcIiMwMDVmNmJcIixcIiMwMDhjOWVcIixcIiMwMGI0Y2NcIixcIiMwMGRmZmNcIl0sW1wiIzQxM2U0YVwiLFwiIzczNjI2ZVwiLFwiI2IzODE4NFwiLFwiI2YwYjQ5ZVwiLFwiI2Y3ZTRiZVwiXSxbXCIjZmY0ZTUwXCIsXCIjZmM5MTNhXCIsXCIjZjlkNDIzXCIsXCIjZWRlNTc0XCIsXCIjZTFmNWM0XCJdLFtcIiM5OWI4OThcIixcIiNmZWNlYThcIixcIiNmZjg0N2NcIixcIiNlODRhNWZcIixcIiMyYTM2M2JcIl0sW1wiIzY1NTY0M1wiLFwiIzgwYmNhM1wiLFwiI2Y2ZjdiZFwiLFwiI2U2YWMyN1wiLFwiI2JmNGQyOFwiXSxbXCIjMDBhOGM2XCIsXCIjNDBjMGNiXCIsXCIjZjlmMmU3XCIsXCIjYWVlMjM5XCIsXCIjOGZiZTAwXCJdLFtcIiMzNTEzMzBcIixcIiM0MjQyNTRcIixcIiM2NDkwOGFcIixcIiNlOGNhYTRcIixcIiNjYzJhNDFcIl0sW1wiIzU1NDIzNlwiLFwiI2Y3NzgyNVwiLFwiI2QzY2UzZFwiLFwiI2YxZWZhNVwiLFwiIzYwYjk5YVwiXSxbXCIjZmY5OTAwXCIsXCIjNDI0MjQyXCIsXCIjZTllOWU5XCIsXCIjYmNiY2JjXCIsXCIjMzI5OWJiXCJdLFtcIiM1ZDQxNTdcIixcIiM4Mzg2ODlcIixcIiNhOGNhYmFcIixcIiNjYWQ3YjJcIixcIiNlYmUzYWFcIl0sW1wiIzhjMjMxOFwiLFwiIzVlOGM2YVwiLFwiIzg4YTY1ZVwiLFwiI2JmYjM1YVwiLFwiI2YyYzQ1YVwiXSxbXCIjZmFkMDg5XCIsXCIjZmY5YzViXCIsXCIjZjU2MzRhXCIsXCIjZWQzMDNjXCIsXCIjM2I4MTgzXCJdLFtcIiNmZjQyNDJcIixcIiNmNGZhZDJcIixcIiNkNGVlNWVcIixcIiNlMWVkYjlcIixcIiNmMGYyZWJcIl0sW1wiI2QxZTc1MVwiLFwiI2ZmZmZmZlwiLFwiIzAwMDAwMFwiLFwiIzRkYmNlOVwiLFwiIzI2YWRlNFwiXSxbXCIjZjhiMTk1XCIsXCIjZjY3MjgwXCIsXCIjYzA2Yzg0XCIsXCIjNmM1YjdiXCIsXCIjMzU1YzdkXCJdLFtcIiMxYjY3NmJcIixcIiM1MTk1NDhcIixcIiM4OGM0MjVcIixcIiNiZWYyMDJcIixcIiNlYWZkZTZcIl0sW1wiI2JjYmRhY1wiLFwiI2NmYmUyN1wiLFwiI2YyNzQzNVwiLFwiI2YwMjQ3NVwiLFwiIzNiMmQzOFwiXSxbXCIjNWU0MTJmXCIsXCIjZmNlYmI2XCIsXCIjNzhjMGE4XCIsXCIjZjA3ODE4XCIsXCIjZjBhODMwXCJdLFtcIiM0NTI2MzJcIixcIiM5MTIwNGRcIixcIiNlNDg0NGFcIixcIiNlOGJmNTZcIixcIiNlMmY3Y2VcIl0sW1wiI2VlZTZhYlwiLFwiI2M1YmM4ZVwiLFwiIzY5Njc1OFwiLFwiIzQ1NDg0YlwiLFwiIzM2MzkzYlwiXSxbXCIjZjBkOGE4XCIsXCIjM2QxYzAwXCIsXCIjODZiOGIxXCIsXCIjZjJkNjk0XCIsXCIjZmEyYTAwXCJdLFtcIiNmMDQxNTVcIixcIiNmZjgyM2FcIixcIiNmMmYyNmZcIixcIiNmZmY3YmRcIixcIiM5NWNmYjdcIl0sW1wiIzJhMDQ0YVwiLFwiIzBiMmU1OVwiLFwiIzBkNjc1OVwiLFwiIzdhYjMxN1wiLFwiI2EwYzU1ZlwiXSxbXCIjYmJiYjg4XCIsXCIjY2NjNjhkXCIsXCIjZWVkZDk5XCIsXCIjZWVjMjkwXCIsXCIjZWVhYTg4XCJdLFtcIiNiOWQ3ZDlcIixcIiM2NjgyODRcIixcIiMyYTI4MjlcIixcIiM0OTM3MzZcIixcIiM3YjNiM2JcIl0sW1wiI2IzY2M1N1wiLFwiI2VjZjA4MVwiLFwiI2ZmYmU0MFwiLFwiI2VmNzQ2ZlwiLFwiI2FiM2U1YlwiXSxbXCIjYTNhOTQ4XCIsXCIjZWRiOTJlXCIsXCIjZjg1OTMxXCIsXCIjY2UxODM2XCIsXCIjMDA5OTg5XCJdLFtcIiM2NzkxN2FcIixcIiMxNzA0MDlcIixcIiNiOGFmMDNcIixcIiNjY2JmODJcIixcIiNlMzMyNThcIl0sW1wiI2U4ZDViN1wiLFwiIzBlMjQzMFwiLFwiI2ZjM2E1MVwiLFwiI2Y1YjM0OVwiLFwiI2U4ZDViOVwiXSxbXCIjYWFiM2FiXCIsXCIjYzRjYmI3XCIsXCIjZWJlZmM5XCIsXCIjZWVlMGI3XCIsXCIjZThjYWFmXCJdLFtcIiMzMDAwMzBcIixcIiM0ODAwNDhcIixcIiM2MDE4NDhcIixcIiNjMDQ4NDhcIixcIiNmMDcyNDFcIl0sW1wiI2FiNTI2YlwiLFwiI2JjYTI5N1wiLFwiI2M1Y2VhZVwiLFwiI2YwZTJhNFwiLFwiI2Y0ZWJjM1wiXSxbXCIjNjA3ODQ4XCIsXCIjNzg5MDQ4XCIsXCIjYzBkODYwXCIsXCIjZjBmMGQ4XCIsXCIjNjA0ODQ4XCJdLFtcIiNhOGU2Y2VcIixcIiNkY2VkYzJcIixcIiNmZmQzYjVcIixcIiNmZmFhYTZcIixcIiNmZjhjOTRcIl0sW1wiIzNlNDE0N1wiLFwiI2ZmZmVkZlwiLFwiI2RmYmE2OVwiLFwiIzVhMmUyZVwiLFwiIzJhMmMzMVwiXSxbXCIjYjZkOGMwXCIsXCIjYzhkOWJmXCIsXCIjZGFkYWJkXCIsXCIjZWNkYmJjXCIsXCIjZmVkY2JhXCJdLFtcIiNmYzM1NGNcIixcIiMyOTIyMWZcIixcIiMxMzc0N2RcIixcIiMwYWJmYmNcIixcIiNmY2Y3YzVcIl0sW1wiIzFjMjEzMFwiLFwiIzAyOGY3NlwiLFwiI2IzZTA5OVwiLFwiI2ZmZWFhZFwiLFwiI2QxNDMzNFwiXSxbXCIjZWRlYmU2XCIsXCIjZDZlMWM3XCIsXCIjOTRjN2I2XCIsXCIjNDAzYjMzXCIsXCIjZDM2NDNiXCJdLFtcIiNjYzBjMzlcIixcIiNlNjc4MWVcIixcIiNjOGNmMDJcIixcIiNmOGZjYzFcIixcIiMxNjkzYTdcIl0sW1wiI2RhZDZjYVwiLFwiIzFiYjBjZVwiLFwiIzRmODY5OVwiLFwiIzZhNWU3MlwiLFwiIzU2MzQ0NFwiXSxbXCIjYTdjNWJkXCIsXCIjZTVkZGNiXCIsXCIjZWI3YjU5XCIsXCIjY2Y0NjQ3XCIsXCIjNTI0NjU2XCJdLFtcIiNmZGYxY2NcIixcIiNjNmQ2YjhcIixcIiM5ODdmNjlcIixcIiNlM2FkNDBcIixcIiNmY2QwMzZcIl0sW1wiIzVjMzIzZVwiLFwiI2E4Mjc0M1wiLFwiI2UxNWUzMlwiLFwiI2MwZDIzZVwiLFwiI2U1ZjA0Y1wiXSxbXCIjMjMwZjJiXCIsXCIjZjIxZDQxXCIsXCIjZWJlYmJjXCIsXCIjYmNlM2M1XCIsXCIjODJiM2FlXCJdLFtcIiNiOWQzYjBcIixcIiM4MWJkYTRcIixcIiNiMjg3NzRcIixcIiNmODhmNzlcIixcIiNmNmFhOTNcIl0sW1wiIzNhMTExY1wiLFwiIzU3NDk1MVwiLFwiIzgzOTg4ZVwiLFwiI2JjZGVhNVwiLFwiI2U2ZjliY1wiXSxbXCIjNWUzOTI5XCIsXCIjY2Q4YzUyXCIsXCIjYjdkMWEzXCIsXCIjZGVlOGJlXCIsXCIjZmNmN2QzXCJdLFtcIiMxYzAxMTNcIixcIiM2YjAxMDNcIixcIiNhMzAwMDZcIixcIiNjMjFhMDFcIixcIiNmMDNjMDJcIl0sW1wiIzM4MmYzMlwiLFwiI2ZmZWFmMlwiLFwiI2ZjZDllNVwiLFwiI2ZiYzVkOFwiLFwiI2YxMzk2ZFwiXSxbXCIjZTNkZmJhXCIsXCIjYzhkNmJmXCIsXCIjOTNjY2M2XCIsXCIjNmNiZGI1XCIsXCIjMWExZjFlXCJdLFtcIiMwMDAwMDBcIixcIiM5ZjExMWJcIixcIiNiMTE2MjNcIixcIiMyOTJjMzdcIixcIiNjY2NjY2NcIl0sW1wiI2MxYjM5OFwiLFwiIzYwNTk1MVwiLFwiI2ZiZWVjMlwiLFwiIzYxYTZhYlwiLFwiI2FjY2VjMFwiXSxbXCIjOGRjY2FkXCIsXCIjOTg4ODY0XCIsXCIjZmVhNmEyXCIsXCIjZjlkNmFjXCIsXCIjZmZlOWFmXCJdLFtcIiNmNmY2ZjZcIixcIiNlOGU4ZThcIixcIiMzMzMzMzNcIixcIiM5OTAxMDBcIixcIiNiOTA1MDRcIl0sW1wiIzFiMzI1ZlwiLFwiIzljYzRlNFwiLFwiI2U5ZjJmOVwiLFwiIzNhODljOVwiLFwiI2YyNmM0ZlwiXSxbXCIjNWU5ZmEzXCIsXCIjZGNkMWI0XCIsXCIjZmFiODdmXCIsXCIjZjg3ZTdiXCIsXCIjYjA1NTc0XCJdLFtcIiM5NTFmMmJcIixcIiNmNWY0ZDdcIixcIiNlMGRmYjFcIixcIiNhNWEzNmNcIixcIiM1MzUyMzNcIl0sW1wiIzQxM2QzZFwiLFwiIzA0MDAwNFwiLFwiI2M4ZmYwMFwiLFwiI2ZhMDIzY1wiLFwiIzRiMDAwZlwiXSxbXCIjZWZmM2NkXCIsXCIjYjJkNWJhXCIsXCIjNjFhZGEwXCIsXCIjMjQ4ZjhkXCIsXCIjNjA1MDYzXCJdLFtcIiMyZDJkMjlcIixcIiMyMTVhNmRcIixcIiMzY2EyYTJcIixcIiM5MmM3YTNcIixcIiNkZmVjZTZcIl0sW1wiI2NmZmZkZFwiLFwiI2I0ZGVjMVwiLFwiIzVjNTg2M1wiLFwiI2E4NTE2M1wiLFwiI2ZmMWY0Y1wiXSxbXCIjNGUzOTVkXCIsXCIjODI3MDg1XCIsXCIjOGViZTk0XCIsXCIjY2NmYzhlXCIsXCIjZGM1YjNlXCJdLFtcIiM5ZGM5YWNcIixcIiNmZmZlYzdcIixcIiNmNTYyMThcIixcIiNmZjlkMmVcIixcIiM5MTkxNjdcIl0sW1wiI2ExZGJiMlwiLFwiI2ZlZTVhZFwiLFwiI2ZhY2E2NlwiLFwiI2Y3YTU0MVwiLFwiI2Y0NWQ0Y1wiXSxbXCIjZmZlZmQzXCIsXCIjZmZmZWU0XCIsXCIjZDBlY2VhXCIsXCIjOWZkNmQyXCIsXCIjOGI3YTVlXCJdLFtcIiNhOGE3YTdcIixcIiNjYzUyN2FcIixcIiNlODE3NWRcIixcIiM0NzQ3NDdcIixcIiMzNjM2MzZcIl0sW1wiI2ZmZWRiZlwiLFwiI2Y3ODAzY1wiLFwiI2Y1NDgyOFwiLFwiIzJlMGQyM1wiLFwiI2Y4ZTRjMVwiXSxbXCIjZjhlZGQxXCIsXCIjZDg4YThhXCIsXCIjNDc0ODQzXCIsXCIjOWQ5ZDkzXCIsXCIjYzVjZmM2XCJdLFtcIiNmMzhhOGFcIixcIiM1NTQ0M2RcIixcIiNhMGNhYjVcIixcIiNjZGU5Y2FcIixcIiNmMWVkZDBcIl0sW1wiIzRlNGQ0YVwiLFwiIzM1MzQzMlwiLFwiIzk0YmE2NVwiLFwiIzI3OTBiMFwiLFwiIzJiNGU3MlwiXSxbXCIjMGNhNWIwXCIsXCIjNGUzZjMwXCIsXCIjZmVmZWViXCIsXCIjZjhmNGU0XCIsXCIjYTViM2FhXCJdLFtcIiNhNzAyNjdcIixcIiNmMTBjNDlcIixcIiNmYjZiNDFcIixcIiNmNmQ4NmJcIixcIiMzMzkxOTRcIl0sW1wiIzlkN2U3OVwiLFwiI2NjYWM5NVwiLFwiIzlhOTQ3Y1wiLFwiIzc0OGI4M1wiLFwiIzViNzU2Y1wiXSxbXCIjZWRmNmVlXCIsXCIjZDFjMDg5XCIsXCIjYjMyMDRkXCIsXCIjNDEyZTI4XCIsXCIjMTUxMTAxXCJdLFtcIiMwNDZkOGJcIixcIiMzMDkyOTJcIixcIiMyZmI4YWNcIixcIiM5M2E0MmFcIixcIiNlY2JlMTNcIl0sW1wiIzRkM2IzYlwiLFwiI2RlNjI2MlwiLFwiI2ZmYjg4Y1wiLFwiI2ZmZDBiM1wiLFwiI2Y1ZTBkM1wiXSxbXCIjZmZmYmI3XCIsXCIjYTZmNmFmXCIsXCIjNjZiNmFiXCIsXCIjNWI3YzhkXCIsXCIjNGYyOTU4XCJdLFtcIiNmZjAwM2NcIixcIiNmZjhhMDBcIixcIiNmYWJlMjhcIixcIiM4OGMxMDBcIixcIiMwMGMxNzZcIl0sW1wiI2ZjZmVmNVwiLFwiI2U5ZmZlMVwiLFwiI2NkY2ZiN1wiLFwiI2Q2ZTZjM1wiLFwiI2ZhZmJlM1wiXSxbXCIjOWNkZGM4XCIsXCIjYmZkOGFkXCIsXCIjZGRkOWFiXCIsXCIjZjdhZjYzXCIsXCIjNjMzZDJlXCJdLFtcIiMzMDI2MWNcIixcIiM0MDM4MzFcIixcIiMzNjU0NGZcIixcIiMxZjVmNjFcIixcIiMwYjgxODVcIl0sW1wiI2QxMzEzZFwiLFwiI2U1NjI1Y1wiLFwiI2Y5YmY3NlwiLFwiIzhlYjJjNVwiLFwiIzYxNTM3NVwiXSxbXCIjZmZlMTgxXCIsXCIjZWVlOWU1XCIsXCIjZmFkM2IyXCIsXCIjZmZiYTdmXCIsXCIjZmY5Yzk3XCJdLFtcIiNhYWZmMDBcIixcIiNmZmFhMDBcIixcIiNmZjAwYWFcIixcIiNhYTAwZmZcIixcIiMwMGFhZmZcIl0sW1wiI2MyNDEyZFwiLFwiI2QxYWEzNFwiLFwiI2E3YTg0NFwiLFwiI2E0NjU4M1wiLFwiIzVhMWU0YVwiXSxbXCIjNzU2MTZiXCIsXCIjYmZjZmY3XCIsXCIjZGNlNGY3XCIsXCIjZjhmM2JmXCIsXCIjZDM0MDE3XCJdLFtcIiM4MDU4NDFcIixcIiNkY2Y3ZjNcIixcIiNmZmZjZGRcIixcIiNmZmQ4ZDhcIixcIiNmNWEyYTJcIl0sW1wiIzM3OWY3YVwiLFwiIzc4YWU2MlwiLFwiI2JiYjc0OVwiLFwiI2UwZmJhY1wiLFwiIzFmMWMwZFwiXSxbXCIjNzNjOGE5XCIsXCIjZGVlMWI2XCIsXCIjZTFiODY2XCIsXCIjYmQ1NTMyXCIsXCIjMzczYjQ0XCJdLFtcIiNjYWZmNDJcIixcIiNlYmY3ZjhcIixcIiNkMGUwZWJcIixcIiM4OGFiYzJcIixcIiM0OTcwOGFcIl0sW1wiIzdlNTY4NlwiLFwiI2E1YWFkOVwiLFwiI2U4ZjlhMlwiLFwiI2Y4YTEzZlwiLFwiI2JhM2MzZFwiXSxbXCIjODI4MzdlXCIsXCIjOTRiMDUzXCIsXCIjYmRlYjA3XCIsXCIjYmZmYTM3XCIsXCIjZTBlMGUwXCJdLFtcIiMxMTE2MjVcIixcIiMzNDE5MzFcIixcIiM1NzFiM2NcIixcIiM3YTFlNDhcIixcIiM5ZDIwNTNcIl0sW1wiIzMxMjczNlwiLFwiI2Q0ODM4ZlwiLFwiI2Q2YWJiMVwiLFwiI2Q5ZDlkOVwiLFwiI2M0ZmZlYlwiXSxbXCIjODRiMjk1XCIsXCIjZWNjZjhkXCIsXCIjYmI4MTM4XCIsXCIjYWMyMDA1XCIsXCIjMmMxNTA3XCJdLFtcIiMzOTVhNGZcIixcIiM0MzIzMzBcIixcIiM4NTNjNDNcIixcIiNmMjVjNWVcIixcIiNmZmE1NjZcIl0sW1wiI2ZkZTZiZFwiLFwiI2ExYzVhYlwiLFwiI2Y0ZGQ1MVwiLFwiI2QxMWU0OFwiLFwiIzYzMmY1M1wiXSxbXCIjNmRhNjdhXCIsXCIjNzdiODg1XCIsXCIjODZjMjhiXCIsXCIjODU5OTg3XCIsXCIjNGE0ODU3XCJdLFtcIiNiZWQ2YzdcIixcIiNhZGMwYjRcIixcIiM4YTdlNjZcIixcIiNhNzliODNcIixcIiNiYmIyYTFcIl0sW1wiIzA1ODc4OVwiLFwiIzUwM2QyZVwiLFwiI2Q1NGIxYVwiLFwiI2UzYTcyZlwiLFwiI2YwZWNjOVwiXSxbXCIjZTIxYjVhXCIsXCIjOWUwYzM5XCIsXCIjMzMzMzMzXCIsXCIjZmJmZmUzXCIsXCIjODNhMzAwXCJdLFtcIiMyNjFjMjFcIixcIiM2ZTFlNjJcIixcIiNiMDI1NGZcIixcIiNkZTQxMjZcIixcIiNlYjk2MDVcIl0sW1wiI2I1YWMwMVwiLFwiI2VjYmEwOVwiLFwiI2U4NmUxY1wiLFwiI2Q0MWU0NVwiLFwiIzFiMTUyMVwiXSxbXCIjZWZkOWI0XCIsXCIjZDZhNjkyXCIsXCIjYTM5MDgxXCIsXCIjNGQ2MTYwXCIsXCIjMjkyNTIyXCJdLFtcIiNmYmM1OTlcIixcIiNjZGJiOTNcIixcIiM5ZWFlOGFcIixcIiMzMzU2NTBcIixcIiNmMzVmNTVcIl0sW1wiI2M3NTIzM1wiLFwiI2M3ODkzM1wiLFwiI2Q2Y2VhYVwiLFwiIzc5YjVhY1wiLFwiIzVlMmY0NlwiXSxbXCIjNzkzYTU3XCIsXCIjNGQzMzM5XCIsXCIjOGM4NzNlXCIsXCIjZDFjNWE1XCIsXCIjYTM4YTVmXCJdLFtcIiNmMmUzYzZcIixcIiNmZmM2YTVcIixcIiNlNjMyNGJcIixcIiMyYjJiMmJcIixcIiMzNTM2MzRcIl0sW1wiIzUxMmI1MlwiLFwiIzYzNTI3NFwiLFwiIzdiYjBhOFwiLFwiI2E3ZGJhYlwiLFwiI2U0ZjViMVwiXSxbXCIjNTliMzkwXCIsXCIjZjBkZGFhXCIsXCIjZTQ3YzVkXCIsXCIjZTMyZDQwXCIsXCIjMTUyYjNjXCJdLFtcIiNmZGZmZDlcIixcIiNmZmYwYjhcIixcIiNmZmQ2YTNcIixcIiNmYWFkOGVcIixcIiMxNDJmMzBcIl0sW1wiIzExNzY2ZFwiLFwiIzQxMDkzNlwiLFwiI2E0MGI1NFwiLFwiI2U0NmYwYVwiLFwiI2YwYjMwMFwiXSxbXCIjMTE2NDRkXCIsXCIjYTBiMDQ2XCIsXCIjZjJjOTRlXCIsXCIjZjc4MTQ1XCIsXCIjZjI0ZTRlXCJdLFtcIiNjN2ZjZDdcIixcIiNkOWQ1YTdcIixcIiNkOWFiOTFcIixcIiNlNjg2N2FcIixcIiNlZDRhNmFcIl0sW1wiIzU5NTY0M1wiLFwiIzRlNmI2NlwiLFwiI2VkODM0ZVwiLFwiI2ViY2M2ZVwiLFwiI2ViZTFjNVwiXSxbXCIjMzMxMzI3XCIsXCIjOTkxNzY2XCIsXCIjZDkwZjVhXCIsXCIjZjM0NzM5XCIsXCIjZmY2ZTI3XCJdLFtcIiNiZjQ5NmFcIixcIiNiMzljODJcIixcIiNiOGM5OWRcIixcIiNmMGQzOTlcIixcIiM1OTUxNTFcIl0sW1wiI2YxMzk2ZFwiLFwiI2ZkNjA4MVwiLFwiI2YzZmZlYlwiLFwiI2FjYzk1ZlwiLFwiIzhmOTkyNFwiXSxbXCIjZWZlZWNjXCIsXCIjZmU4YjA1XCIsXCIjZmUwNTU3XCIsXCIjNDAwNDAzXCIsXCIjMGFhYmJhXCJdLFtcIiNlNWVhYTRcIixcIiNhOGM0YTJcIixcIiM2OWE1YTRcIixcIiM2MTYzODJcIixcIiM2NjI0NWJcIl0sW1wiI2U5ZTBkMVwiLFwiIzkxYTM5OFwiLFwiIzMzNjA1YVwiLFwiIzA3MDAwMVwiLFwiIzY4NDYyYlwiXSxbXCIjZTRkZWQwXCIsXCIjYWJjY2JkXCIsXCIjN2RiZWI4XCIsXCIjMTgxNjE5XCIsXCIjZTMyZjIxXCJdLFtcIiNlMGVmZjFcIixcIiM3ZGI0YjVcIixcIiNmZmZmZmZcIixcIiM2ODAxNDhcIixcIiMwMDAwMDBcIl0sW1wiI2I3Y2JiZlwiLFwiIzhjODg2ZlwiLFwiI2Y5YTc5OVwiLFwiI2Y0YmZhZFwiLFwiI2Y1ZGFiZFwiXSxbXCIjZmZiODg0XCIsXCIjZjVkZjk4XCIsXCIjZmZmOGQ0XCIsXCIjYzBkMWMyXCIsXCIjMmU0MzQ3XCJdLFtcIiM2ZGE2N2FcIixcIiM5OWE2NmRcIixcIiNhOWJkNjhcIixcIiNiNWNjNmFcIixcIiNjMGRlNWRcIl0sW1wiI2IxZTZkMVwiLFwiIzc3YjFhOVwiLFwiIzNkN2I4MFwiLFwiIzI3MGEzM1wiLFwiIzQ1MWEzZVwiXSxbXCIjZmMyODRmXCIsXCIjZmY4MjRhXCIsXCIjZmVhODg3XCIsXCIjZjZlN2Y3XCIsXCIjZDFkMGQ3XCJdLFtcIiNmZmFiMDdcIixcIiNlOWQ1NThcIixcIiM3MmFkNzVcIixcIiMwZThkOTRcIixcIiM0MzRkNTNcIl0sW1wiIzMxMWQzOVwiLFwiIzY3NDM0ZlwiLFwiIzliOGU3ZVwiLFwiI2MzY2NhZlwiLFwiI2E1MWE0MVwiXSxbXCIjNWNhY2M0XCIsXCIjOGNkMTlkXCIsXCIjY2VlODc5XCIsXCIjZmNiNjUzXCIsXCIjZmY1MjU0XCJdLFtcIiM0NDc0OWRcIixcIiNjNmQ0ZTFcIixcIiNmZmZmZmZcIixcIiNlYmU3ZTBcIixcIiNiZGI4YWRcIl0sW1wiI2NmYjU5MFwiLFwiIzllOWE0MVwiLFwiIzc1ODkxOFwiLFwiIzU2NDMzNFwiLFwiIzQ5MjgxZlwiXSxbXCIjZTRlNGM1XCIsXCIjYjlkNDhiXCIsXCIjOGQyMDM2XCIsXCIjY2UwYTMxXCIsXCIjZDNlNGM1XCJdLFtcIiNjY2YzOTBcIixcIiNlMGUwNWFcIixcIiNmN2M0MWZcIixcIiNmYzkzMGFcIixcIiNmZjAwM2RcIl0sW1wiIzgwNzQ2MlwiLFwiI2E2OTc4NVwiLFwiI2I4ZmFmZlwiLFwiI2U4ZmRmZlwiLFwiIzY2NWM0OVwiXSxbXCIjZWM0NDAxXCIsXCIjY2M5YjI1XCIsXCIjMTNjZDRhXCIsXCIjN2I2ZWQ2XCIsXCIjNWU1MjVjXCJdLFtcIiNjYzVkNGNcIixcIiNmZmZlYzZcIixcIiNjN2QxYWZcIixcIiM5NmI0OWNcIixcIiM1YjU4NDdcIl0sW1wiI2UzZThjZFwiLFwiI2JjZDhiZlwiLFwiI2QzYjlhM1wiLFwiI2VlOWM5MlwiLFwiI2ZlODU3ZVwiXSxbXCIjMzYwNzQ1XCIsXCIjZDYxYzU5XCIsXCIjZTdkODRiXCIsXCIjZWZlYWM1XCIsXCIjMWI4Nzk4XCJdLFtcIiMyYjIyMmNcIixcIiM1ZTQzNTJcIixcIiM5NjVkNjJcIixcIiNjNzk1NmRcIixcIiNmMmQ5NzRcIl0sW1wiI2U3ZWRlYVwiLFwiI2ZmYzUyY1wiLFwiI2ZiMGMwNlwiLFwiIzAzMGQ0ZlwiLFwiI2NlZWNlZlwiXSxbXCIjZWI5YzRkXCIsXCIjZjJkNjgwXCIsXCIjZjNmZmNmXCIsXCIjYmFjOWE5XCIsXCIjNjk3MDYwXCJdLFtcIiNmZmYzZGJcIixcIiNlN2U0ZDVcIixcIiNkM2M4YjRcIixcIiNjODQ2NDhcIixcIiM3MDNlM2JcIl0sW1wiI2Y1ZGQ5ZFwiLFwiI2JjYzQ5OVwiLFwiIzkyYTY4YVwiLFwiIzdiOGY4YVwiLFwiIzUwNjI2NlwiXSxbXCIjZjJlOGM0XCIsXCIjOThkOWI2XCIsXCIjM2VjOWE3XCIsXCIjMmI4NzllXCIsXCIjNjE2NjY4XCJdLFtcIiMwNDExMjJcIixcIiMyNTkwNzNcIixcIiM3ZmRhODlcIixcIiNjOGU5OGVcIixcIiNlNmY5OWRcIl0sW1wiI2M2Y2NhNVwiLFwiIzhhYjhhOFwiLFwiIzZiOTk5N1wiLFwiIzU0Nzg3ZFwiLFwiIzYxNTE0NVwiXSxbXCIjNGIxMTM5XCIsXCIjM2I0MDU4XCIsXCIjMmE2ZTc4XCIsXCIjN2E5MDdjXCIsXCIjYzliMTgwXCJdLFtcIiM4ZDc5NjZcIixcIiNhOGEzOWRcIixcIiNkOGM4YjhcIixcIiNlMmRkZDlcIixcIiNmOGYxZTlcIl0sW1wiIzJkMWIzM1wiLFwiI2YzNmE3MVwiLFwiI2VlODg3YVwiLFwiI2U0ZTM5MVwiLFwiIzlhYmM4YVwiXSxbXCIjOTVhMTMxXCIsXCIjYzhjZDNiXCIsXCIjZjZmMWRlXCIsXCIjZjViOWFlXCIsXCIjZWUwYjViXCJdLFtcIiM3OTI1NGFcIixcIiM3OTVjNjRcIixcIiM3OTkyN2RcIixcIiNhZWIxOGVcIixcIiNlM2NmOWVcIl0sW1wiIzQyOTM5OFwiLFwiIzZiNWQ0ZFwiLFwiI2IwYTE4ZlwiLFwiI2RmY2RiNFwiLFwiI2ZiZWVkM1wiXSxbXCIjMWQxMzEzXCIsXCIjMjRiNjk0XCIsXCIjZDIyMDQyXCIsXCIjYTNiODA4XCIsXCIjMzBjNGM5XCJdLFtcIiM5ZDllOTRcIixcIiNjOTllOTNcIixcIiNmNTlkOTJcIixcIiNlNWI4YWRcIixcIiNkNWQyYzhcIl0sW1wiI2YwZmZjOVwiLFwiI2E5ZGE4OFwiLFwiIzYyOTk3YVwiLFwiIzcyMjQzZFwiLFwiIzNiMDgxOVwiXSxbXCIjMzIyOTM4XCIsXCIjODlhMTk0XCIsXCIjY2ZjODlhXCIsXCIjY2M4ODNhXCIsXCIjYTE0MDE2XCJdLFtcIiM0NTJlM2NcIixcIiNmZjNkNWFcIixcIiNmZmI5NjlcIixcIiNlYWYyN2VcIixcIiMzYjhjODhcIl0sW1wiI2YwNmQ2MVwiLFwiI2RhODI1ZlwiLFwiI2M0OTc1Y1wiLFwiI2E4YWI3YlwiLFwiIzhjYmY5OVwiXSxbXCIjNTQwMDQ1XCIsXCIjYzYwMDUyXCIsXCIjZmY3MTRiXCIsXCIjZWFmZjg3XCIsXCIjYWNmZmU5XCJdLFtcIiMyYjI3MjZcIixcIiMwYTUxNmRcIixcIiMwMTg3OTBcIixcIiM3ZGFkOTNcIixcIiNiYWNjYTRcIl0sW1wiIzAyN2I3ZlwiLFwiI2ZmYTU4OFwiLFwiI2Q2Mjk1N1wiLFwiI2JmMWU2MlwiLFwiIzU3MmU0ZlwiXSxbXCIjMjMxOTJkXCIsXCIjZmQwYTU0XCIsXCIjZjU3NTc2XCIsXCIjZmViZjk3XCIsXCIjZjVlY2I3XCJdLFtcIiNmYTZhNjRcIixcIiM3YTRlNDhcIixcIiM0YTQwMzFcIixcIiNmNmUyYmJcIixcIiM5ZWM2YjhcIl0sW1wiI2EzYzY4Y1wiLFwiIzg3OTY3NlwiLFwiIzZlNjY2MlwiLFwiIzRmMzY0YVwiLFwiIzM0MDczNVwiXSxbXCIjZjZkNzZiXCIsXCIjZmY5MDM2XCIsXCIjZDYyNTRkXCIsXCIjZmY1NDc1XCIsXCIjZmRlYmE5XCJdLFtcIiM4MGE4YThcIixcIiM5MDlkOWVcIixcIiNhODhjOGNcIixcIiNmZjBkNTFcIixcIiM3YThjODlcIl0sW1wiI2EzMmMyOFwiLFwiIzFjMDkwYlwiLFwiIzM4NDAzMFwiLFwiIzdiODA1NVwiLFwiI2JjYTg3NVwiXSxbXCIjNmQ5Nzg4XCIsXCIjMWUyNTI4XCIsXCIjN2UxYzEzXCIsXCIjYmYwYTBkXCIsXCIjZTZlMWMyXCJdLFtcIiMzNzM3MzdcIixcIiM4ZGI5ODZcIixcIiNhY2NlOTFcIixcIiNiYWRiNzNcIixcIiNlZmVhZTRcIl0sW1wiIzI4MDkwNFwiLFwiIzY4MGUzNFwiLFwiIzlhMTUxYVwiLFwiI2MyMWIxMlwiLFwiI2ZjNGIyYVwiXSxbXCIjZmI2OTAwXCIsXCIjZjYzNzAwXCIsXCIjMDA0ODUzXCIsXCIjMDA3ZTgwXCIsXCIjMDBiOWJkXCJdLFtcIiNlNmIzOWFcIixcIiNlNmNiYTVcIixcIiNlZGUzYjRcIixcIiM4YjllOWJcIixcIiM2ZDc1NzhcIl0sW1wiIzY0MWY1ZVwiLFwiIzY3NjA3N1wiLFwiIzY1YWM5MlwiLFwiI2MyYzA5MlwiLFwiI2VkZDQ4ZVwiXSxbXCIjYTY5ZTgwXCIsXCIjZTBiYTliXCIsXCIjZTdhOTdlXCIsXCIjZDI4NTc0XCIsXCIjM2IxOTIyXCJdLFtcIiMxNjE2MTZcIixcIiNjOTRkNjVcIixcIiNlN2MwNDlcIixcIiM5MmIzNWFcIixcIiMxZjY3NjRcIl0sW1wiIzIzNGQyMFwiLFwiIzM2ODAyZFwiLFwiIzc3YWI1OVwiLFwiI2M5ZGY4YVwiLFwiI2YwZjdkYVwiXSxbXCIjNGIzZTRkXCIsXCIjMWU4YzkzXCIsXCIjZGJkOGEyXCIsXCIjYzRhYzMwXCIsXCIjZDc0ZjMzXCJdLFtcIiNmZjc0NzRcIixcIiNmNTliNzFcIixcIiNjN2M3N2ZcIixcIiNlMGUwYThcIixcIiNmMWYxYzFcIl0sW1wiI2U2ZWJhOVwiLFwiI2FiYmI5ZlwiLFwiIzZmOGI5NFwiLFwiIzcwNjQ4MlwiLFwiIzcwM2Q2ZlwiXSxbXCIjMjYyNTFjXCIsXCIjZWIwYTQ0XCIsXCIjZjI2NDNkXCIsXCIjZjJhNzNkXCIsXCIjYTBlOGI3XCJdLFtcIiNmZGNmYmZcIixcIiNmZWI4OWZcIixcIiNlMjNkNzVcIixcIiM1ZjBkM2JcIixcIiM3NDIzNjVcIl0sW1wiIzIzMGIwMFwiLFwiI2EyOWQ3ZlwiLFwiI2Q0Y2ZhNVwiLFwiI2Y4ZWNkNFwiLFwiI2FhYmU5YlwiXSxbXCIjODU4NDdlXCIsXCIjYWI2YTZlXCIsXCIjZjczNDViXCIsXCIjMzUzMTMwXCIsXCIjY2JjZmI0XCJdLFtcIiNkNGY3ZGNcIixcIiNkYmU3YjRcIixcIiNkYmMwOTJcIixcIiNlMDg0NmRcIixcIiNmNTE0NDFcIl0sW1wiI2QzZDViMFwiLFwiI2I1Y2VhNFwiLFwiIzlkYzE5ZFwiLFwiIzhjN2M2MlwiLFwiIzcxNDQzZlwiXSxbXCIjNGYzNjRjXCIsXCIjNWU0MDVmXCIsXCIjNmI2YjZiXCIsXCIjOGY5ZTZmXCIsXCIjYjFjZjcyXCJdLFtcIiNiZmNkYjRcIixcIiNmN2U1YmZcIixcIiNlYWQyYTRcIixcIiNlZmIxOThcIixcIiM3ZDVkNGVcIl0sW1wiIzZmNTg0NlwiLFwiI2E5NWE1MlwiLFwiI2UzNWI1ZFwiLFwiI2YxODA1MlwiLFwiI2ZmYTQ0NlwiXSxbXCIjZmYzMzY2XCIsXCIjYzc0MDY2XCIsXCIjOGY0ZDY1XCIsXCIjNTc1YTY1XCIsXCIjMWY2NzY0XCJdLFtcIiNmZmZmOTlcIixcIiNkOWNjOGNcIixcIiNiMzk5ODBcIixcIiM4YzY2NzNcIixcIiM2NjMzNjZcIl0sW1wiI2M0NjU2NFwiLFwiI2YwZTk5OVwiLFwiI2I4Yzk5ZFwiLFwiIzliNzI2ZlwiLFwiI2VlYjE1YlwiXSxbXCIjZWVkYTk1XCIsXCIjYjdjMjdlXCIsXCIjOWE5MjdiXCIsXCIjOGE2YTZiXCIsXCIjODA1NTY2XCJdLFtcIiM2MmEwN2JcIixcIiM0ZjhiODlcIixcIiM1MzZjOGRcIixcIiM1YzRmNzlcIixcIiM2MTM4NjBcIl0sW1wiIzFhMDgxZlwiLFwiIzRkMWQ0ZFwiLFwiIzA1Njc2ZVwiLFwiIzQ4OWM3OVwiLFwiI2ViYzI4OFwiXSxbXCIjZjBmMGQ4XCIsXCIjYjRkZWJlXCIsXCIjNzdjY2E0XCIsXCIjNjY2NjY2XCIsXCIjYjRkZjM3XCJdLFtcIiNlZDY0NjRcIixcIiNiZjYzNzBcIixcIiM4NzU4NmNcIixcIiM1NzQ3NTlcIixcIiMxYTFiMWNcIl0sW1wiI2NjYjI0Y1wiLFwiI2Y3ZDY4M1wiLFwiI2ZmZmRjMFwiLFwiI2ZmZmZmZFwiLFwiIzQ1N2Q5N1wiXSxbXCIjN2E1YjNlXCIsXCIjZmFmYWZhXCIsXCIjZmE0YjAwXCIsXCIjY2RiZGFlXCIsXCIjMWYxZjFmXCJdLFtcIiM1NjY5NjVcIixcIiM5NDhhNzFcIixcIiNjYzk0NzZcIixcIiNmMmExNzZcIixcIiNmZjczNzNcIl0sW1wiI2QzMTkwMFwiLFwiI2ZmNjYwMFwiLFwiI2ZmZjJhZlwiLFwiIzdjYjQ5MFwiLFwiIzAwMDAwMFwiXSxbXCIjZDI0ODU4XCIsXCIjZWE4Njc2XCIsXCIjZWFiMDVlXCIsXCIjZmRlZWNkXCIsXCIjNDkzODMxXCJdLFtcIiNlYmVhYTlcIixcIiNlYmM1ODhcIixcIiM3ZDI5NDhcIixcIiMzYjAwMzJcIixcIiMwZTBiMjlcIl0sW1wiIzQxMWYyZFwiLFwiI2FjNDE0N1wiLFwiI2Y4ODg2M1wiLFwiI2ZmYzI3ZlwiLFwiI2ZmZTI5YVwiXSxbXCIjZTdlNzlkXCIsXCIjYzBkODkwXCIsXCIjNzhhODkwXCIsXCIjNjA2MDc4XCIsXCIjZDhhODc4XCJdLFtcIiM5ZGJjYmNcIixcIiNmMGYwYWZcIixcIiNmZjM3MGZcIixcIiMzMzI3MTdcIixcIiM2YmFjYmZcIl0sW1wiIzA2Mzk0MFwiLFwiIzE5NWU2M1wiLFwiIzNlODM4Y1wiLFwiIzhlYmRiNlwiLFwiI2VjZTFjM1wiXSxbXCIjZThjMzgyXCIsXCIjYjM5ZDY5XCIsXCIjYTg2YjRjXCIsXCIjN2QxYTBjXCIsXCIjMzQwYTBiXCJdLFtcIiM5NDY1NGNcIixcIiNmODlmYTFcIixcIiNmYWJkYmRcIixcIiNmYWQ2ZDZcIixcIiNmZWZjZDBcIl0sW1wiIzU5NWI1YVwiLFwiIzE0YzNhMlwiLFwiIzBkZTVhOFwiLFwiIzdjZjQ5YVwiLFwiI2I4ZmQ5OVwiXSxbXCIjY2RkYmMyXCIsXCIjZjdlNGM2XCIsXCIjZmI5Mjc0XCIsXCIjZjU1NjViXCIsXCIjODc1MzQ2XCJdLFtcIiNmMGRkYmRcIixcIiNiYTM2MjJcIixcIiM4NTFlMjVcIixcIiM1MjBjMzBcIixcIiMxYzk5N2ZcIl0sW1wiIzMxMmMyMFwiLFwiIzQ5NGQ0YlwiLFwiIzdjNzA1MlwiLFwiI2IzYTE3NlwiLFwiI2UyY2I5MlwiXSxbXCIjZTdkZDk2XCIsXCIjZTE2NjM5XCIsXCIjYWQ4NjBhXCIsXCIjYjcwMjNmXCIsXCIjNTUwMjRhXCJdLFtcIiM1NzRjNDFcIixcIiNlMzZiNmJcIixcIiNlM2E1NmJcIixcIiNlM2M3N2JcIixcIiM5Njg3NWFcIl0sW1wiIzNmMmMyNlwiLFwiI2RkNDIzZVwiLFwiI2EyYTM4NFwiLFwiI2VhYzM4OFwiLFwiI2M1YWQ0YlwiXSxbXCIjMGEwMzEwXCIsXCIjNDkwMDdlXCIsXCIjZmYwMDViXCIsXCIjZmY3ZDEwXCIsXCIjZmZiMjM4XCJdLFtcIiNjZGVjY2NcIixcIiNlZGQyNjlcIixcIiNlODg0NjBcIixcIiNmMjM0NjBcIixcIiMzMjFkMmVcIl0sW1wiIzFmMWYyMFwiLFwiIzJiNGM3ZVwiLFwiIzU2N2ViYlwiLFwiIzYwNmQ4MFwiLFwiI2RjZTBlNlwiXSxbXCIjZjNlN2Q3XCIsXCIjZjdkN2NkXCIsXCIjZjhjN2M5XCIsXCIjZTBjMGM3XCIsXCIjYzdiOWM1XCJdLFtcIiNlY2JlMTNcIixcIiM3MzhjNzlcIixcIiM2YTZiNWZcIixcIiMyYzJiMjZcIixcIiNhNDM5NTVcIl0sW1wiI2RkZTBjZlwiLFwiI2M2YmU5YVwiLFwiI2FkOGIzMlwiLFwiIzkzNzQ2MFwiLFwiIzhjNWI3YlwiXSxbXCIjMTgxNDE5XCIsXCIjNGEwNzNjXCIsXCIjOWUwYjQxXCIsXCIjY2MzZTE4XCIsXCIjZjA5NzFjXCJdLFtcIiMwMjlkYWZcIixcIiNlNWQ1OTlcIixcIiNmZmMyMTlcIixcIiNmMDdjMTlcIixcIiNlMzI1NTFcIl0sW1wiI2ZmZjVkZVwiLFwiI2I4ZDljOFwiLFwiIzkxNzA4MVwiLFwiIzc1MGU0OVwiLFwiIzRkMDAyYlwiXSxbXCIjNGQzYjM2XCIsXCIjZWI2MTNiXCIsXCIjZjk4ZjZmXCIsXCIjYzFkOWNkXCIsXCIjZjdlYWRjXCJdLFtcIiM0MTMwNDBcIixcIiM2YzYzNjhcIixcIiNiOWExNzNcIixcIiNlYWEzNTNcIixcIiNmZmVmYTlcIl0sW1wiI2ZmY2RiOFwiLFwiI2ZkZWVjZlwiLFwiI2M4YzY5NlwiLFwiIzk3YmVhOVwiLFwiIzM3MjYwY1wiXSxbXCIjMjEzNDM1XCIsXCIjNDY2ODViXCIsXCIjNjQ4YTY0XCIsXCIjYTZiOTg1XCIsXCIjZTFlM2FjXCJdLFtcIiNmZmZmZmZcIixcIiNmZmZhZWJcIixcIiNmMGYwZDhcIixcIiNjZmNmY2ZcIixcIiM5NjdjNTJcIl0sW1wiI2U4ZDNhOVwiLFwiI2UzOWI3ZFwiLFwiIzZlNjQ2MFwiLFwiIzg5YjM5OVwiLFwiI2JjYmZhM1wiXSxbXCIjZWQ1NjcyXCIsXCIjMTYwZTMyXCIsXCIjOWVhZThhXCIsXCIjY2RiYjkzXCIsXCIjZmJjNTk5XCJdLFtcIiMwMDE0NDlcIixcIiMwMTI2NzdcIixcIiMwMDViYzVcIixcIiMwMGI0ZmNcIixcIiMxN2Y5ZmZcIl0sW1wiIzRkYWI4Y1wiLFwiIzU0MjYzOFwiLFwiIzhmMjQ0ZFwiLFwiI2M5MzA2YlwiLFwiI2U4NmY5ZVwiXSxbXCIjNjdiZTliXCIsXCIjOTVkMGI4XCIsXCIjZmNmY2Q3XCIsXCIjZjFkYjQyXCIsXCIjZjA0MTU4XCJdLFtcIiMyYjE3MTlcIixcIiMwMjQ4M2VcIixcIiMwNTdjNDZcIixcIiM5YmI2MWJcIixcIiNmOGJlMDBcIl0sW1wiI2ZmZmYwMFwiLFwiI2NjZDkxYVwiLFwiIzk5YjMzM1wiLFwiIzY2OGM0ZFwiLFwiIzMzNjY2NlwiXSxbXCIjMTMwOTEyXCIsXCIjM2UxYzMzXCIsXCIjNjAyNzQ5XCIsXCIjYjE0NjIzXCIsXCIjZjY5MjFkXCJdLFtcIiNlN2VlZDBcIixcIiNjYWQxYzNcIixcIiM5NDhlOTlcIixcIiM1MTQyNWZcIixcIiMyZTE0MzdcIl0sW1wiI2UyNTg1OFwiLFwiI2U5ZDZhZlwiLFwiI2ZmZmZkZFwiLFwiI2MwZWZkMlwiLFwiIzM4NDI1MlwiXSxbXCIjZTZhMDZmXCIsXCIjOWU5YzcxXCIsXCIjNWU4MjcxXCIsXCIjMzM0NTRlXCIsXCIjMjQyNzM5XCJdLFtcIiNmYWY2ZDBcIixcIiNjN2Q4YWJcIixcIiM5MDlhOTJcIixcIiM3NDRmNzhcIixcIiMzMDA5MWVcIl0sW1wiI2FjZGViMlwiLFwiI2UxZWFiNVwiLFwiI2VkYWQ5ZVwiLFwiI2ZlNGI3NFwiLFwiIzM5MGQyZFwiXSxbXCIjNDIyODJjXCIsXCIjNmNhMTllXCIsXCIjODRhYmFhXCIsXCIjZGVkMWI2XCIsXCIjNmQ5OTdhXCJdLFtcIiM5ZjBhMjhcIixcIiNkNTVjMmJcIixcIiNmNmU3ZDNcIixcIiM4OWE0NmZcIixcIiM1NTIwM2NcIl0sW1wiIzQxOGU4ZVwiLFwiIzVhNGUzY1wiLFwiI2M0ZDQyOFwiLFwiI2Q4ZTQ3MlwiLFwiI2U5ZWJiZlwiXSxbXCIjMTY5M2E1XCIsXCIjNDViNWM0XCIsXCIjN2VjZWNhXCIsXCIjYTBkZWQ2XCIsXCIjYzdlZGU4XCJdLFtcIiNmZGZmZDlcIixcIiM3MzE4NWVcIixcIiMzNmJiYTZcIixcIiMwYzBkMDJcIixcIiM4YjkxMWFcIl0sW1wiI2E2OWE5MFwiLFwiIzRhNDAzZFwiLFwiI2ZmZjFjMVwiLFwiI2ZhY2Y3ZFwiLFwiI2VhODA0Y1wiXSxbXCIjZjdmM2Q1XCIsXCIjZmZkYWJmXCIsXCIjZmE5YjliXCIsXCIjZTg4MDg3XCIsXCIjNjM1MDYzXCJdLFtcIiM4YTg3ODBcIixcIiNlNmU1YzRcIixcIiNkNmQxYWZcIixcIiNlNDcyNjdcIixcIiNkN2Q4YzVcIl0sW1wiI2E3Y2QyY1wiLFwiI2JhZGE1ZlwiLFwiI2NlZTg5MVwiLFwiI2UxZjVjNFwiLFwiIzUwYzhjNlwiXSxbXCIjYjJjYmEzXCIsXCIjZTBkZjlmXCIsXCIjZTdhODNlXCIsXCIjOWE3MzZlXCIsXCIjZWE1MjVmXCJdLFtcIiNhYWRlYWRcIixcIiNiYmRlYWRcIixcIiNjY2RlYWRcIixcIiNkZGRlYWRcIixcIiNlZWRlYWRcIl0sW1wiI2ZjNTgwY1wiLFwiI2ZjNmIwYVwiLFwiI2Y4ODcyZVwiLFwiI2ZmYTkyN1wiLFwiI2ZkY2E0OVwiXSxbXCIjZmEyZTU5XCIsXCIjZmY3MDNmXCIsXCIjZjdiYzA1XCIsXCIjZWNmNmJiXCIsXCIjNzZiY2FkXCJdLFtcIiM3ODVkNTZcIixcIiNiZTRjNTRcIixcIiNjNmIyOTlcIixcIiNlNmQ1YzFcIixcIiNmZmY0ZTNcIl0sW1wiI2YwMzcxYVwiLFwiIzAwMDAwMFwiLFwiI2Y3ZTZhNlwiLFwiIzNlNmI0OFwiLFwiI2I1YjQ3OVwiXSxbXCIjY2MyNjQ5XCIsXCIjOTkyYzRiXCIsXCIjNjYzMjRjXCIsXCIjMzMzODRlXCIsXCIjMDAzZTRmXCJdLFtcIiNmZmFiYWJcIixcIiNmZmRhYWJcIixcIiNkZGZmYWJcIixcIiNhYmU0ZmZcIixcIiNkOWFiZmZcIl0sW1wiI2YxZThiNFwiLFwiI2IyYmI5MVwiLFwiI2Q3YmY1ZVwiLFwiI2QxNjM0NFwiLFwiIzgzNTU1ZVwiXSxbXCIjNDIzOTNiXCIsXCIjNzVjOWEzXCIsXCIjYmFjOTlhXCIsXCIjZmZjODk3XCIsXCIjZjdlZmEyXCJdLFtcIiNhNzMyMWNcIixcIiNmZmRjNjhcIixcIiNjYzk4MmFcIixcIiM5Mjg5NDFcIixcIiMzNTI1MDRcIl0sW1wiI2UwZGM4YlwiLFwiI2Y2YWEzZFwiLFwiI2VkNGM1N1wiLFwiIzU3NDQzNVwiLFwiIzZjYzRiOVwiXSxbXCIjMDAwMDAwXCIsXCIjMDAxZjM2XCIsXCIjMWM1NTYwXCIsXCIjNzlhZTkyXCIsXCIjZmJmZmNkXCJdLFtcIiNmNmM3YjdcIixcIiNmN2EzOThcIixcIiNmYTdmNzdcIixcIiNiNDI1MjlcIixcIiMwMDAwMDBcIl0sW1wiI2M5ZDFkM1wiLFwiI2Y3ZjdmN1wiLFwiIzlkZDNkZlwiLFwiIzNiMzczN1wiLFwiIzk5MTgxOFwiXSxbXCIjYWZjN2I5XCIsXCIjZmZlMWM5XCIsXCIjZmFjN2I0XCIsXCIjZmNhODlkXCIsXCIjOTk4YjgyXCJdLFtcIiNmYmZlZTVcIixcIiNjOTE4NDJcIixcIiM5ODE3M2RcIixcIiMyNTIzMmRcIixcIiNhOGU3Y2FcIl0sW1wiI2YzZTZiY1wiLFwiI2YxYzk3MlwiLFwiI2Y1ODg2YlwiLFwiIzcyYWU5NVwiLFwiIzVhMzIyNlwiXSxbXCIjZmE4Y2IxXCIsXCIjZmRjNWM5XCIsXCIjZmZmZWUxXCIsXCIjY2ZiNjk5XCIsXCIjOWU2ZDRlXCJdLFtcIiM2NzRmMjNcIixcIiNlNDhiNjlcIixcIiNlMWIzNjVcIixcIiNlNWRiODRcIixcIiNmZmVlYWNcIl0sW1wiI2RiZDliN1wiLFwiI2MxYzljOFwiLFwiI2E1YjVhYlwiLFwiIzk0OWE4ZVwiLFwiIzYxNTU2NlwiXSxbXCIjZjJjYzY3XCIsXCIjZjM4MjY0XCIsXCIjZjQwMDM0XCIsXCIjNWYwNTFmXCIsXCIjNzViYWE4XCJdLFtcIiNkOWQ0YThcIixcIiNkMTVjNTdcIixcIiNjYzM3NDdcIixcIiM1YzM3NGJcIixcIiM0YTVmNjdcIl0sW1wiIzg0YzFiMVwiLFwiI2FkODQ5YVwiLFwiI2Q2NDc4M1wiLFwiI2ZkMTM1YVwiLFwiIzQwMjAyYVwiXSxbXCIjNzFkYmQyXCIsXCIjZWVmZmRiXCIsXCIjYWRlNGI1XCIsXCIjZDBlYWEzXCIsXCIjZmZmMThjXCJdLFtcIiNiODgwMDBcIixcIiNkNTZmMDBcIixcIiNmMTU1MDBcIixcIiNmZjI2NTRcIixcIiNmZjBjNzFcIl0sW1wiIzAyMDMwNFwiLFwiIzU0MWYxNFwiLFwiIzkzODE3MlwiLFwiI2NjOWU2MVwiLFwiIzYyNjI2NlwiXSxbXCIjZjRmNGY0XCIsXCIjOWJhNjU3XCIsXCIjZjBlNWM5XCIsXCIjYTY4YzY5XCIsXCIjNTk0NDMzXCJdLFtcIiMyNDQyNDJcIixcIiM1MWJkOWNcIixcIiNhM2UzYjFcIixcIiNmZmU4YjNcIixcIiNmZjIxMjFcIl0sW1wiIzFmMDMxMFwiLFwiIzQ0MjQzM1wiLFwiI2EzZDk1YlwiLFwiI2FhZTNhYlwiLFwiI2Y2ZjBiY1wiXSxbXCIjMDBjY2JlXCIsXCIjMDlhNmEzXCIsXCIjOWRiZmFmXCIsXCIjZWRlYmM5XCIsXCIjZmNmOWQ4XCJdLFtcIiM0ZWIzZGVcIixcIiM4ZGUwYTZcIixcIiNmY2YwOWZcIixcIiNmMjdjN2NcIixcIiNkZTUyOGNcIl0sW1wiI2ZmMDA5MlwiLFwiI2ZmY2ExYlwiLFwiI2I2ZmYwMFwiLFwiIzIyOGRmZlwiLFwiI2JhMDFmZlwiXSxbXCIjZmZjODcwXCIsXCIjZjdmN2M2XCIsXCIjYzhlM2M1XCIsXCIjOWNhZDlhXCIsXCIjNzU1ODU4XCJdLFtcIiM0YzNkMzFcIixcIiNmMTgyNzNcIixcIiNmMmJkNzZcIixcIiNmNGY1ZGVcIixcIiNjNGNlYjBcIl0sW1wiIzg0YmZjM1wiLFwiI2ZmZjVkNlwiLFwiI2ZmYjg3MFwiLFwiI2Q5NjE1M1wiLFwiIzAwMDUxMVwiXSxbXCIjZmZmZGMwXCIsXCIjYjlkN2ExXCIsXCIjZmVhZDI2XCIsXCIjY2EyMjFmXCIsXCIjNTkwZjBjXCJdLFtcIiMyNDE4MTFcIixcIiNkNGE5NzlcIixcIiNlM2M4OGZcIixcIiNjMmM5OTVcIixcIiNhOGJkOTVcIl0sW1wiIzIxOTdhM1wiLFwiI2Y3MWU2Y1wiLFwiI2YwNzg2OFwiLFwiI2ViYjk3MFwiLFwiI2U3ZDNiMFwiXSxbXCIjYjJiMzlmXCIsXCIjYzhjOWI1XCIsXCIjZGVkZmM1XCIsXCIjZjVmN2JkXCIsXCIjM2Q0MjNjXCJdLFtcIiNiMzEyMzdcIixcIiNmMDM4MTNcIixcIiNmZjg4MjZcIixcIiNmZmI5MTRcIixcIiMyYzlmYTNcIl0sW1wiIzE1MjEyYVwiLFwiIzk5YzliZFwiLFwiI2Q3Yjg5Y1wiLFwiI2ZlYWI4ZFwiLFwiI2Y0YzlhM1wiXSxbXCIjMDAyYzJiXCIsXCIjZmYzZDAwXCIsXCIjZmZiYzExXCIsXCIjMGE4MzdmXCIsXCIjMDc2NDYxXCJdLFtcIiNmODhmODlcIixcIiNlZWMyNzZcIixcIiNmYmY2ZDBcIixcIiM3OWMzYWFcIixcIiMxZjBlMWFcIl0sW1wiI2JmMmEyM1wiLFwiI2E2YWQzY1wiLFwiI2YwY2U0ZVwiLFwiI2NmODcyZVwiLFwiIzhhMjExZFwiXSxbXCIjZTJkZjlhXCIsXCIjZWJlNTRkXCIsXCIjNzU3NDQ5XCIsXCIjNGI0OTBiXCIsXCIjZmYwMDUxXCJdLFtcIiMwMDE4NDhcIixcIiMzMDE4NjBcIixcIiM0ODMwNzhcIixcIiM2MDQ4NzhcIixcIiM5MDYwOTBcIl0sW1wiIzg1YTI5ZVwiLFwiI2ZmZWJiZlwiLFwiI2YwZDQ0MlwiLFwiI2Y1OTMzMFwiLFwiI2IyMjE0OFwiXSxbXCIjNzlhNjg3XCIsXCIjNzE4MDYzXCIsXCIjNjc1OTRkXCIsXCIjNGYyYjM4XCIsXCIjMWQxMDE2XCJdLFtcIiNmZTZjMmJcIixcIiNkNDNiMmRcIixcIiM5ZjEwMmNcIixcIiMzNDAwMTZcIixcIiMwMjAwMDFcIl0sW1wiI2U2ZTFjZFwiLFwiI2M2ZDhjMFwiLFwiI2Q2YjNiMVwiLFwiI2Y5Nzk5MlwiLFwiIzIzMWI0MlwiXSxbXCIjNjlkMGIzXCIsXCIjOWJkYWIzXCIsXCIjYjRkZmIzXCIsXCIjY2RlNGIzXCIsXCIjZDljZjg1XCJdLFtcIiM3NTM3MmRcIixcIiM5Mjg4NTRcIixcIiM5NmE3ODJcIixcIiNkNGNlOWVcIixcIiNkODUyM2RcIl0sW1wiIzY1MTM2NlwiLFwiI2E3MWE1YlwiLFwiI2U3MjA0ZVwiLFwiI2Y3NmUyYVwiLFwiI2YwYzUwNVwiXSxbXCIjZmZmZmZmXCIsXCIjYTFjMWJlXCIsXCIjNTk1NTRlXCIsXCIjZjNmNGU1XCIsXCIjZTJlM2Q5XCJdLFtcIiMzMzJjMjZcIixcIiNkYjE0MTRcIixcIiNlODU5MWNcIixcIiM3ZmI4YjBcIixcIiNjNWU2NWNcIl0sW1wiIzJmMmJhZFwiLFwiI2FkMmJhZFwiLFwiI2U0MjY5MlwiLFwiI2Y3MTU2OFwiLFwiI2Y3ZGIxNVwiXSxbXCIjOGU0MDdhXCIsXCIjZmU2OTYyXCIsXCIjZjliYTg0XCIsXCIjZWVlMDk3XCIsXCIjZmZmZmU1XCJdLFtcIiM0NWFhYjhcIixcIiNlMWQ3NzJcIixcIiNmYWY0YjFcIixcIiMzOTQyNDBcIixcIiNmMDZiNTBcIl0sW1wiI2NjZGVkMlwiLFwiI2ZmZmJkNFwiLFwiI2Y1ZGRiYlwiLFwiI2UzYjhiMlwiLFwiI2ExODA5M1wiXSxbXCIjZDFiNjhkXCIsXCIjODc1NTVjXCIsXCIjNDkyZDQ5XCIsXCIjNTE0NDVmXCIsXCIjNWE1Yzc1XCJdLFtcIiM1MzlmYTJcIixcIiM3MmIxYTRcIixcIiNhYmNjYjFcIixcIiNjNGRiYjRcIixcIiNkNGUyYjZcIl0sW1wiIzgwZDNiYlwiLFwiI2JhZmRjMlwiLFwiI2U1ZjNiYVwiLFwiIzVjNDkzZFwiLFwiIzNhMzUyZlwiXSxbXCIjYThiY2JkXCIsXCIjZmNkY2IzXCIsXCIjZjg4ZDg3XCIsXCIjZDY1OTgxXCIsXCIjODIzNzcyXCJdLFtcIiNmZmU0YWFcIixcIiNmY2E2OTlcIixcIiNlMjg2OWJcIixcIiNjOTcyOWZcIixcIiM1ODNiN2VcIl0sW1wiI2I1ZjRiY1wiLFwiI2ZmZjE5ZVwiLFwiI2ZmZGM4YVwiLFwiI2ZmYmE2YlwiLFwiI2ZmNjU0M1wiXSxbXCIjZmY0NzQ2XCIsXCIjZThkYTVlXCIsXCIjOTJiNTVmXCIsXCIjNDg3ZDc2XCIsXCIjNGI0NDUyXCJdLFtcIiMwMDJlMzRcIixcIiMwMDQ0NDNcIixcIiMwMDc1NWNcIixcIiMwMGMxNmNcIixcIiM5MGZmMTdcIl0sW1wiIzEwMTk0MlwiLFwiIzgwMDQzYVwiLFwiI2Y2MGM0OVwiLFwiI2YwOTU4MFwiLFwiI2ZkZjJiNFwiXSxbXCIjMGZjM2U4XCIsXCIjMDE5NGJlXCIsXCIjZTJkMzk3XCIsXCIjZjA3ZTEzXCIsXCIjNDgxODAwXCJdLFtcIiNjOWI4NDlcIixcIiNjOTY4MjNcIixcIiNiZTMxMDBcIixcIiM2ZjBiMDBcIixcIiMyNDE3MTRcIl0sW1wiIzllMWU0Y1wiLFwiI2ZmMTE2OFwiLFwiIzI1MDIwZlwiLFwiIzhmOGY4ZlwiLFwiI2VjZWNlY1wiXSxbXCIjMjcyZDRkXCIsXCIjYjgzNTY0XCIsXCIjZmY2YTVhXCIsXCIjZmZiMzUwXCIsXCIjODNiOGFhXCJdLFtcIiNjNGRkZDZcIixcIiNkNGRkZDZcIixcIiNlNGRkZDZcIixcIiNlNGUzY2RcIixcIiNlY2VjZGRcIl0sW1wiIzRkNGE0YlwiLFwiI2Y2MDA2OVwiLFwiI2ZmNDFhMVwiLFwiI2ZmOTBhYlwiLFwiI2ZmY2NkMVwiXSxbXCIjMWYwYTFkXCIsXCIjMzM0ZjUzXCIsXCIjNDU5MzZjXCIsXCIjOWFjYzc3XCIsXCIjZTVlYWQ0XCJdLFtcIiM4OTlhYTFcIixcIiNiZGEyYTJcIixcIiNmYmJlOWFcIixcIiNmYWQ4ODlcIixcIiNmYWY1YzhcIl0sW1wiIzRiNTM4YlwiLFwiIzE1MTkxZFwiLFwiI2Y3YTIxYlwiLFwiI2U0NTYzNVwiLFwiI2Q2MDI1N1wiXSxbXCIjNzA2NzY3XCIsXCIjZTg3NDc0XCIsXCIjZTZhMzdhXCIsXCIjZDljNzc3XCIsXCIjYzBkYmFiXCJdLFtcIiMwMDAwMDBcIixcIiNmZjg4MzBcIixcIiNkMWI4YTBcIixcIiNhZWNlZDJcIixcIiNjYmRjZGZcIl0sW1wiI2RiNTY0M1wiLFwiIzFjMGYwZVwiLFwiIzcwYWE4N1wiLFwiIzlmYjM4ZlwiLFwiI2M1YmQ5OVwiXSxbXCIjMzYxNzNkXCIsXCIjZmY0ODQ1XCIsXCIjZmY3NDVmXCIsXCIjZmZjNTVmXCIsXCIjZmZlYzVlXCJdLFtcIiMwMDA3MDZcIixcIiMwMDI3MmRcIixcIiMxMzQ2NDdcIixcIiMwYzdlN2VcIixcIiNiZmFjOGJcIl0sW1wiIzE3MDEzMlwiLFwiIzM2MTU0MlwiLFwiIzU3M2U1NFwiLFwiIzg1YWU3MlwiLFwiI2JjZTFhYlwiXSxbXCIjYWFiNjliXCIsXCIjOWU5MDZlXCIsXCIjOTY4NGEzXCIsXCIjODg3MGZmXCIsXCIjMDAwMDAwXCJdLFtcIiNkOGQ4ZDhcIixcIiNlMmQ5ZDhcIixcIiNlY2RhZDhcIixcIiNmNWRiZDhcIixcIiNmZmRjZDhcIl0sW1wiI2M4ZDE5N1wiLFwiI2Q4OTg0NVwiLFwiI2M1NGIyY1wiLFwiIzQ3MzQzMFwiLFwiIzExYmFhY1wiXSxbXCIjZjhmOGVjXCIsXCIjYWVkZDJiXCIsXCIjMDY2Njk5XCIsXCIjMGE1NDgzXCIsXCIjMDI0MTZkXCJdLFtcIiNkN2U4ZDVcIixcIiNlNmYwYWZcIixcIiNlOGVkNzZcIixcIiNmZmNkNTdcIixcIiM0YTNhNDdcIl0sW1wiI2YxZWNkZlwiLFwiI2Q0YzlhZFwiLFwiI2M3YmE5OVwiLFwiIzAwMDAwMFwiLFwiI2Y1ODcyM1wiXSxbXCIjZTlkZmNjXCIsXCIjZjNhMzZiXCIsXCIjY2Q1YjUxXCIsXCIjNTU0ODY1XCIsXCIjMzUyNjMwXCJdLFtcIiNkYWNkYmRcIixcIiNmMmI4YTBcIixcIiNlZjk3YTNcIixcIiNkZjVjN2VcIixcIiNkNDQ4NmZcIl0sW1wiIzU2NTE3NVwiLFwiIzUzOGE5NVwiLFwiIzY3Yjc5ZVwiLFwiI2ZmYjcyN1wiLFwiI2U0NDkxY1wiXSxbXCIjMjYwNzI5XCIsXCIjMmEyMzQ0XCIsXCIjNDk1MTY4XCIsXCIjY2NiZDllXCIsXCIjZDhjY2IyXCJdLFtcIiNhZWYwNTVcIixcIiNlMGZmYzNcIixcIiMyNWU0YmNcIixcIiMzZjg5NzhcIixcIiM1MTQ0NDJcIl0sW1wiIzQ0NDQ0NFwiLFwiI2ZjZjdkMVwiLFwiI2E5YTE3YVwiLFwiI2I1MmMwMFwiLFwiIzhjMDAwNVwiXSxbXCIjZjdmNzk5XCIsXCIjZTBkMTI0XCIsXCIjZjA4MjNmXCIsXCIjYmQzNzRjXCIsXCIjNDQzYTM3XCJdLFtcIiMyODhkODVcIixcIiNiOWQ5YjRcIixcIiNkMThlOGZcIixcIiNiMDU1NzRcIixcIiNmMGE5OTFcIl0sW1wiI2RiZGE5N1wiLFwiI2VmYWU1NFwiLFwiI2VmNjc3MVwiLFwiIzRiMWQzN1wiLFwiIzk3N2U3N1wiXSxbXCIjMDAyOTMwXCIsXCIjZmZmZmZmXCIsXCIjZjhmMGFmXCIsXCIjYWM0YTAwXCIsXCIjMDAwMDAwXCJdLFtcIiMxODQ4NDhcIixcIiMwMDYwNjBcIixcIiMwMDc4NzhcIixcIiNhOGMwMzBcIixcIiNmMGYwZDhcIl0sW1wiI2I5MTEzZlwiLFwiI2E4NjM2ZVwiLFwiIzk3YjU5ZFwiLFwiI2NmY2NhOFwiLFwiI2ZmZTNiM1wiXSxbXCIjYzhjZTEzXCIsXCIjZjhmNWMxXCIsXCIjMzQ5ZTk3XCIsXCIjMmMwZDFhXCIsXCIjZGUxYTcyXCJdLFtcIiM5MTNmMzNcIixcIiNmZjcwNWZcIixcIiNmZmFhNjdcIixcIiNmZmRmYWJcIixcIiM5ZmI5YzJcIl0sW1wiI2ZlZTlhNlwiLFwiI2ZlYzBhYlwiLFwiI2ZhNTg5NFwiLFwiIzY2MDg2MFwiLFwiIzkzODBiN1wiXSxbXCIjZWQ3YjgzXCIsXCIjZWM4YTkwXCIsXCIjZWJhMmE0XCIsXCIjZTZkMWNhXCIsXCIjZWVlOWM3XCJdLFtcIiNmY2ZkZWJcIixcIiNlM2NlYmRcIixcIiNjMWEyYTBcIixcIiM3MjViNzVcIixcIiMzMjIwMzBcIl0sW1wiI2UwNDg5MVwiLFwiI2UxYjdlZFwiLFwiI2Y1ZTFlMlwiLFwiI2QxZTM4OVwiLFwiI2I5ZGU1MVwiXSxbXCIjZDNjOGI0XCIsXCIjZDRmMWRiXCIsXCIjZWVjYWIxXCIsXCIjZmU2YzYzXCIsXCIjMjQwOTEwXCJdLFtcIiM0Mzc3N2FcIixcIiM0NDI0MzJcIixcIiNjMDI5NDhcIixcIiNkOTViNDVcIixcIiNlY2QwNzlcIl0sW1wiI2VkZWNjZlwiLFwiI2YxYzY5NFwiLFwiI2RjNjM3OFwiLFwiIzIwNzE3OFwiLFwiIzEwMTY1MlwiXSxbXCIjOTVkZTkwXCIsXCIjY2VmNzgxXCIsXCIjZjdjMDgxXCIsXCIjZmY3ODU3XCIsXCIjNmI2YjZiXCJdLFtcIiNlZGQ1OGZcIixcIiNjMmJmOTJcIixcIiM2NmFjOTJcIixcIiM2ODYwNzdcIixcIiM2NDFmNWVcIl0sW1wiI2Y0ZjhlNlwiLFwiI2YyZTllNlwiLFwiIzRhM2QzZFwiLFwiI2ZmNjE2MVwiLFwiI2Q4ZGVjM1wiXSxbXCIjZjllYmYyXCIsXCIjZjNlMmU4XCIsXCIjZmNkN2RhXCIsXCIjZjU4ZjlhXCIsXCIjM2MzNjNiXCJdLFtcIiM3MzY1NThcIixcIiNmZDY1YTBcIixcIiNmZWY1YzZcIixcIiNhYWYyZTRcIixcIiMzMWQ1ZGVcIl0sW1wiI2Y5ZjZlY1wiLFwiIzg4YTFhOFwiLFwiIzUwMjk0MFwiLFwiIzc5MDYxNFwiLFwiIzBkMGMwY1wiXSxbXCIjYWZmYmZmXCIsXCIjZDJmZGZlXCIsXCIjZmVmYWMyXCIsXCIjZmViZjk3XCIsXCIjZmU2OTYwXCJdLFtcIiNmZmZmZmZcIixcIiNhMWFjODhcIixcIiM3NTc1NzVcIixcIiM0NjRkNzBcIixcIiMwMDAwMDBcIl0sW1wiI2YyNTAyY1wiLFwiI2NhZDE3YVwiLFwiI2ZjZjU5YlwiLFwiIzkxYzQ5NFwiLFwiI2M0MjMxMVwiXSxbXCIjMmUxZTQ1XCIsXCIjNjEyYTUyXCIsXCIjYmEzMjU5XCIsXCIjZmY2OTVjXCIsXCIjY2NiY2ExXCJdLFtcIiM5MTAxNDJcIixcIiM2YzA0M2NcIixcIiMyMTAxMjNcIixcIiNmZWY3ZDVcIixcIiMwZWMwYzFcIl0sW1wiIzIwNGI1ZVwiLFwiIzQyNmI2NVwiLFwiI2JhYWI2YVwiLFwiI2ZiZWE4MFwiLFwiI2ZkZmFjN1wiXSxbXCIjOGRjOWI1XCIsXCIjZjZmNGMyXCIsXCIjZmZjMzkxXCIsXCIjZmY2OTVjXCIsXCIjOGMzMTVkXCJdLFtcIiNlM2JhNmFcIixcIiNiZmEzNzRcIixcIiM2ZDc1NmFcIixcIiM0ZDY4NmZcIixcIiMzNjQ0NjFcIl0sW1wiI2ZmZmFiM1wiLFwiI2EyZTVkMlwiLFwiIzYzYjM5N1wiLFwiIzlkYWIzNFwiLFwiIzJjMjMyMVwiXSxbXCIjZjdmMWUxXCIsXCIjZmZkYmQ3XCIsXCIjZmZiMmMxXCIsXCIjY2U3MDk1XCIsXCIjODU1ZTZlXCJdLFtcIiNmN2RlY2VcIixcIiNlZWQ3YzVcIixcIiNjY2NjYmJcIixcIiM5ZWM0YmJcIixcIiMyZDJlMmNcIl0sW1wiIzQxODBhYlwiLFwiI2ZmZmZmZlwiLFwiIzhhYjNjZlwiLFwiI2JkZDFkZVwiLFwiI2U0ZWJmMFwiXSxbXCIjNDMyMDRhXCIsXCIjN2YxZTQ3XCIsXCIjNDIyMzQzXCIsXCIjYzIyMDQ3XCIsXCIjZWEyODRiXCJdLFtcIiM2ODY0NjZcIixcIiM4MzljYjVcIixcIiM5NmQ3ZWJcIixcIiNiMWUxZTlcIixcIiNmMmU0ZjlcIl0sW1wiI2ZmMjc1ZVwiLFwiI2U2YmM1NlwiLFwiIzdmNDQwYVwiLFwiIzZhOTI3N1wiLFwiI2Y4ZDliZFwiXSxbXCIjNTAyMzJlXCIsXCIjZjc3YzNlXCIsXCIjZmFiYTY2XCIsXCIjZmNlMTg1XCIsXCIjYTJjY2E1XCJdLFtcIiNiMmQ5ZjdcIixcIiM0ODdhYTFcIixcIiMzZDNjM2JcIixcIiM3YzgwNzFcIixcIiNkZGUzY2FcIl0sW1wiIzljODY4MFwiLFwiI2ViNWU3ZlwiLFwiI2Y5OGY2ZlwiLFwiI2RiYmY2YlwiLFwiI2M4ZWI2YVwiXSxbXCIjNDgyYzIxXCIsXCIjYTczZTJiXCIsXCIjZDA3ZTBlXCIsXCIjZTlkZWIwXCIsXCIjMmY2MTVlXCJdLFtcIiNlNGU2YzNcIixcIiM4OGJhYTNcIixcIiNiYTFlNGFcIixcIiM2MzIwM2RcIixcIiMzNjFmMmRcIl0sW1wiI2Y3ZjZlNFwiLFwiI2UyZDVjMVwiLFwiIzVmMzcxMVwiLFwiI2Y2ZjZlMlwiLFwiI2Q0YzA5OFwiXSxbXCIjZmZhYjAzXCIsXCIjZmM3ZjAzXCIsXCIjZmMzOTAzXCIsXCIjZDEwMjRlXCIsXCIjYTYwMjZjXCJdLFtcIiNjNzI1NDZcIixcIiM2NjQyNGNcIixcIiM3NjhhNGZcIixcIiNiM2MyNjJcIixcIiNkNWNhOThcIl0sW1wiI2MzZGZkN1wiLFwiI2M4ZGZkMlwiLFwiI2NkZGZjZFwiLFwiI2QyZGZjOFwiLFwiI2Q3ZGZjM1wiXSxbXCIjMGRiMmFjXCIsXCIjZjVkZDdlXCIsXCIjZmM4ZDRkXCIsXCIjZmM2OTRkXCIsXCIjZmFiYTMyXCJdLFtcIiNlOGRlOTJcIixcIiM4MTBlMGJcIixcIiNmZWJlYTNcIixcIiNmY2U1YjFcIixcIiNmNmY1ZGFcIl0sW1wiIzYzNTk0ZFwiLFwiI2IxODI3MlwiLFwiI2MyYjI5MVwiLFwiI2Q2ZTRjM1wiLFwiI2VhZTNkMVwiXSxbXCIjZGFlMmNiXCIsXCIjOTZjM2E2XCIsXCIjNmNiNmE1XCIsXCIjMjIxZDM0XCIsXCIjOTA0MjVjXCJdLFtcIiM5MTdmNmVcIixcIiNlZmJjOThcIixcIiNlZmQyYmVcIixcIiNlZmUxZDFcIixcIiNkOWRkY2RcIl0sW1wiIzNmMzI0ZFwiLFwiIzkzYzJiMVwiLFwiI2ZmZWFjY1wiLFwiI2ZmOTk1ZVwiLFwiI2RlMWQ2YVwiXSxbXCIjZjNkOTE1XCIsXCIjZTllNGJiXCIsXCIjYmZkNGI3XCIsXCIjYTg5OTA3XCIsXCIjMWExYzI3XCJdLFtcIiMwNDI2MDhcIixcIiMyYTVjMGJcIixcIiM4MDhmMTJcIixcIiNmYWVkZDlcIixcIiNlYTJhMTVcIl0sW1wiI2RhZGFkOFwiLFwiI2ZlNjE5NlwiLFwiI2ZmMmM2OVwiLFwiIzFlYTQ5ZFwiLFwiI2NiZTY1YlwiXSxbXCIjNDU0NTQ1XCIsXCIjNzQzNDU1XCIsXCIjYTIyMzY1XCIsXCIjZDExMTc0XCIsXCIjZmYwMDg0XCJdLFtcIiM4YzBlNDhcIixcIiM4MGFiOTlcIixcIiNlOGRiYWRcIixcIiNiMzllNThcIixcIiM5OTgyMmRcIl0sW1wiIzc5NmM4NlwiLFwiIzc0YWE5YlwiLFwiIzkxYzY4ZFwiLFwiI2VjZTQ4OFwiLFwiI2Y2ZjVjZFwiXSxbXCIjNjc4ZDZjXCIsXCIjZmM3ZDIzXCIsXCIjZmEzYzA4XCIsXCIjYmQwYTQxXCIsXCIjNzcyYTUzXCJdLFtcIiNkYmY3M2JcIixcIiNjMGNjMzlcIixcIiNlYjAyNThcIixcIiNhNjAzM2ZcIixcIiMyYjI2MjhcIl0sW1wiI2ZmYzJjZVwiLFwiIzgwYjNmZlwiLFwiI2ZkNmU4YVwiLFwiI2EyMTIyZlwiLFwiIzY5MzcyNlwiXSxbXCIjYWI1MDVlXCIsXCIjZDlhMDcxXCIsXCIjY2ZjODhmXCIsXCIjYTViMDkwXCIsXCIjNjA3ODczXCJdLFtcIiNmOWQ0MjNcIixcIiNlZGU1NzRcIixcIiNlMWY1YzRcIixcIiNhZGQ2YmNcIixcIiM3OWI3YjRcIl0sW1wiIzE3MmMzY1wiLFwiIzI3NDg2MlwiLFwiIzk5NTA1MlwiLFwiI2Q5NjgzMVwiLFwiI2U2YjMzZFwiXSxbXCIjZjhmNjlmXCIsXCIjYmFiOTg2XCIsXCIjN2M3YjZjXCIsXCIjM2UzZTUzXCIsXCIjMDAwMDM5XCJdLFtcIiNmMWViZWJcIixcIiNlZWU4ZThcIixcIiNjYWNhY2FcIixcIiMyNGMwZWJcIixcIiM1Y2NlZWVcIl0sW1wiI2U2ZThlM1wiLFwiI2Q3ZGFjZlwiLFwiI2JlYzNiY1wiLFwiIzhmOWE5Y1wiLFwiIzY1NzI3YVwiXSxbXCIjZmZmYmYwXCIsXCIjOTY4ZjRiXCIsXCIjN2E2MjQ4XCIsXCIjYWI5NTk3XCIsXCIjMDMwNTA2XCJdLFtcIiNlZmFjNDFcIixcIiNkZTg1MzFcIixcIiNiMzI5MDBcIixcIiM2YzEzMDVcIixcIiMzMzBhMDRcIl0sW1wiIzcyYmNhNVwiLFwiI2Y0ZGRiNFwiLFwiI2YxYWUyYlwiLFwiI2JjMGIyN1wiLFwiIzRhMjUxMlwiXSxbXCIjZWJmMmYyXCIsXCIjZDBmMmU3XCIsXCIjYmNlYmRmXCIsXCIjYWRlMGRiXCIsXCIjZDlkYmRiXCJdLFtcIiNmNGUxOTZcIixcIiNhNmJmOTFcIixcIiM1Zjk5ODJcIixcIiM3ODU3NmJcIixcIiM0MDA0MjhcIl0sW1wiIzYxNTA1MFwiLFwiIzc3NmE2YVwiLFwiI2FkOWE2ZlwiLFwiI2Y1ZjFlOFwiLFwiI2ZjZmNmY1wiXSxbXCIjYjkzNDBiXCIsXCIjY2VhNDVjXCIsXCIjYzViZThiXCIsXCIjNDk4Mzc5XCIsXCIjM2YyNjFjXCJdLFtcIiNkZGNhYTJcIixcIiNhZWJlYTNcIixcIiNiOTc0NzlcIixcIiNkODM5NTdcIixcIiM0ZTVjNjlcIl0sW1wiIzE0MTgyN1wiLFwiIzYyNDU1YlwiLFwiIzczNjY4MVwiLFwiI2MxZDlkMFwiLFwiI2ZmZmFlM1wiXSxbXCIjMmYzNTU5XCIsXCIjOWE1MDcxXCIsXCIjZTM5NGE3XCIsXCIjZjFiYmJiXCIsXCIjZTZkOGNiXCJdLFtcIiNiODc3YThcIixcIiNiODAwOGFcIixcIiNmZjMzNjZcIixcIiNmZmNjMzNcIixcIiNjY2ZmMzNcIl0sW1wiIzE3MTEzM1wiLFwiIzU4MWU0NFwiLFwiI2M1NDg1YVwiLFwiI2Q0YmU5OVwiLFwiI2UwZmZjY1wiXSxbXCIjZmYwZjM1XCIsXCIjZjg2MjU0XCIsXCIjZmVhMTg5XCIsXCIjZjNkNWE1XCIsXCIjYmFiOTk3XCJdLFtcIiNjZmI2OThcIixcIiNmZjVkNTdcIixcIiNkZDBiNjRcIixcIiM2ZjA1NTBcIixcIiM0MDFjMmFcIl0sW1wiI2QxZGJjOFwiLFwiI2I4YzJhMFwiLFwiI2M5N2M3YVwiLFwiI2RhMzc1NFwiLFwiIzFmMTEwNlwiXSxbXCIjMmI5ZWIzXCIsXCIjODVjYzljXCIsXCIjYmNkOWEwXCIsXCIjZWRmNzllXCIsXCIjZmFmYWQ3XCJdLFtcIiNmMjZiN2FcIixcIiNmMGYyZGNcIixcIiNkOWViNTJcIixcIiM4YWM3ZGVcIixcIiM4Nzc5NmZcIl0sW1wiI2JkYmY5MFwiLFwiIzM1MzUyYlwiLFwiI2U3ZTljNFwiLFwiI2VjNmMyYlwiLFwiI2ZlYWU0YlwiXSxbXCIjZWVjY2JiXCIsXCIjZjE3MzFmXCIsXCIjZTAzZTM2XCIsXCIjYmQwZDU5XCIsXCIjNzMwNjYyXCJdLFtcIiNlYmU1YjJcIixcIiNmNmYzYzJcIixcIiNmN2M2OWZcIixcIiNmODliN2VcIixcIiNiNWEyOGJcIl0sW1wiIzIwMTMwYVwiLFwiIzE0MjAyNlwiLFwiIzEyMzE0MlwiLFwiIzNiNjU3YVwiLFwiI2U5ZjBjOVwiXSxbXCIjOWQ5Zjg5XCIsXCIjODRhZjk3XCIsXCIjOGJjNTliXCIsXCIjYjJkZTkzXCIsXCIjY2NlZThkXCJdLFtcIiNmZjk5MzRcIixcIiNmZmMwMThcIixcIiNmOGZlZjRcIixcIiNjZGU1NGVcIixcIiNiM2M2MzFcIl0sW1wiI2JkYTBhMlwiLFwiI2ZmZTZkYlwiLFwiI2QxZWFlZVwiLFwiI2NiYzhiNVwiLFwiI2VmYjBhOVwiXSxbXCIjMzE4MjdjXCIsXCIjOTVjNjhmXCIsXCIjZjdlOWFhXCIsXCIjZmM4YTgwXCIsXCIjZmQ0ZTZkXCJdLFtcIiM0ZDQzM2RcIixcIiM1MjVjNWFcIixcIiM1Njg3N2RcIixcIiM4Y2NjODFcIixcIiNiYWRlNTdcIl0sW1wiIzZhM2Q1YVwiLFwiIzY2NjY2ZVwiLFwiIzZkOGQ3NlwiLFwiI2IwYzY1YVwiLFwiI2ViZjc0ZlwiXSxbXCIjMzUzNDM3XCIsXCIjNTM1NzZiXCIsXCIjN2E3YjdjXCIsXCIjYTM5YjdlXCIsXCIjZTJjOTlmXCJdLFtcIiNmZjk5NjZcIixcIiNkOTk5NzNcIixcIiNiMzk5ODBcIixcIiM4Yzk5OGNcIixcIiM2Njk5OTlcIl0sW1wiI2QxZGFiOVwiLFwiIzkyYmVhNVwiLFwiIzZmNjQ2Y1wiLFwiIzY3MTA0NVwiLFwiIzMxMjMzZVwiXSxbXCIjODM5MDc0XCIsXCIjOTM5ZTc4XCIsXCIjYThhODc4XCIsXCIjMDYxMDEzXCIsXCIjY2RjZDc2XCJdLFtcIiM1MjQyM2NcIixcIiNhZDVjNzBcIixcIiNkM2FkOThcIixcIiNlZGQ0YmVcIixcIiNiOWMzYzRcIl0sW1wiI2ZmY2ZhZFwiLFwiI2ZmZTRiOFwiLFwiI2U2ZDFiMVwiLFwiI2I4YWE5NVwiLFwiIzVlNWE1NFwiXSxbXCIjZWI5ZDhkXCIsXCIjOTM4NjVhXCIsXCIjYThiYjlhXCIsXCIjYzVjYmE2XCIsXCIjZWZkOGE5XCJdLFtcIiNhOGMwNzhcIixcIiNhODkwNDhcIixcIiNhODQ4MThcIixcIiM2MTI5MGVcIixcIiMzMzBjMGNcIl0sW1wiIzI3MDgxZFwiLFwiIzQ3MjMyY1wiLFwiIzY2OTk3YlwiLFwiI2E0Y2E4YlwiLFwiI2QyZTdhYVwiXSxbXCIjZmZlN2JmXCIsXCIjZmZjOTc4XCIsXCIjYzljOTg3XCIsXCIjZDFhNjY0XCIsXCIjYzI3YjU3XCJdLFtcIiMwMDAwMDBcIixcIiNlZDBiNjVcIixcIiNiMmE3MDBcIixcIiNmY2FlMTFcIixcIiM3NzA0OTNcIl0sW1wiIzAzMWMzMFwiLFwiIzVhMzU0NlwiLFwiI2I1NDg1ZlwiLFwiI2ZjNjc0N1wiLFwiI2ZhOGQzYlwiXSxbXCIjYTIyYzI3XCIsXCIjNGYyNjIxXCIsXCIjOWY4MjQxXCIsXCIjZWJkNTkyXCIsXCIjOTI5ODY3XCJdLFtcIiM4ZmM5YjlcIixcIiNkOGQ5YzBcIixcIiNkMThlOGZcIixcIiNhYjVjNzJcIixcIiM5MTMzNGZcIl0sW1wiIzMwMjcyN1wiLFwiI2JhMmQyZFwiLFwiI2YyNTExYlwiLFwiI2YyODYxYlwiLFwiI2M3YzczMFwiXSxbXCIjZjlkZWQzXCIsXCIjZmRkMWI2XCIsXCIjZmFiNGI2XCIsXCIjYzdiNmJlXCIsXCIjODlhYmI0XCJdLFtcIiM3Mzc1YTVcIixcIiMyMWEzYTNcIixcIiMxM2M4YjVcIixcIiM2Y2YzZDVcIixcIiMyYjM2NGFcIl0sW1wiIzgyMDA4MVwiLFwiI2ZlNTljMlwiLFwiI2ZlNDBiOVwiLFwiI2ZlMWNhY1wiLFwiIzM5MDAzOVwiXSxbXCIjMjYyNTI1XCIsXCIjNTI1MjUyXCIsXCIjZTZkZGJjXCIsXCIjODIyNjI2XCIsXCIjNjkwMjAyXCJdLFtcIiNmMzIxNGVcIixcIiNjZjAyM2JcIixcIiMwMDAwMDBcIixcIiNmNGE4NTRcIixcIiNmZmY4YmNcIl0sW1wiIzQ4MjM0NFwiLFwiIzJiNTE2NlwiLFwiIzQyOTg2N1wiLFwiI2ZhYjI0M1wiLFwiI2UwMjEzMFwiXSxbXCIjYTliNzllXCIsXCIjZThkZGJkXCIsXCIjZGJhODg3XCIsXCIjYzI1ODQ4XCIsXCIjOWQxZDM2XCJdLFtcIiM2ZTkxNjdcIixcIiNmZmRkOGNcIixcIiNmZjgwMzBcIixcIiNjYzRlMDBcIixcIiM3MDA4MDhcIl0sW1wiI2ZmMzM2NlwiLFwiI2U2NDA2NlwiLFwiI2NjNGQ2NlwiLFwiI2IzNTk2NlwiLFwiIzk5NjY2NlwiXSxbXCIjMzMxNDM2XCIsXCIjN2ExNzQ1XCIsXCIjY2I0ZjU3XCIsXCIjZWI5OTYxXCIsXCIjZmNmNGI2XCJdLFtcIiNlYzRiNTlcIixcIiM5YTI4NDhcIixcIiMxMzA3MTZcIixcIiNmYzhjNzdcIixcIiNmOGRmYmRcIl0sW1wiIzFmMGIwY1wiLFwiI2U3ZmNjZlwiLFwiI2Q2YzM5NlwiLFwiI2IzNTQ0ZlwiLFwiIzMwMDUxMVwiXSxbXCIjZjNkY2IyXCIsXCIjZmFjYjk3XCIsXCIjZjU5OTgyXCIsXCIjZWQ2MTZmXCIsXCIjZjIxMTZjXCJdLFtcIiNmN2VhZDlcIixcIiNlMWQyYTlcIixcIiM4OGI0OTlcIixcIiM2MTk4ODVcIixcIiM2NzU5NGVcIl0sW1wiI2FkZWFkYVwiLFwiI2JkZWFkYlwiLFwiI2NkZWFkY1wiLFwiI2RkZWFkZFwiLFwiI2VkZWFkZVwiXSxbXCIjNjY2NjY2XCIsXCIjYWJkYjI1XCIsXCIjOTk5OTk5XCIsXCIjZmZmZmZmXCIsXCIjY2NjY2NjXCJdLFtcIiMyMTA1MThcIixcIiMzZDFjMzNcIixcIiM1ZTRiNTVcIixcIiM3YzkxN2ZcIixcIiM5M2JkOWFcIl0sW1wiI2ZkYmY1Y1wiLFwiI2Y2OWEwYlwiLFwiI2Q0M2EwMFwiLFwiIzliMDgwMFwiLFwiIzFkMjQ0MFwiXSxbXCIjZmRmNGIwXCIsXCIjYTRkY2I5XCIsXCIjNWJjZWJmXCIsXCIjMzJiOWJlXCIsXCIjMmU5N2I3XCJdLFtcIiM4YmE2YWNcIixcIiNkN2Q3YjhcIixcIiNlNWU2YzlcIixcIiNmOGY4ZWNcIixcIiNiZGNkZDBcIl0sW1wiIzI5NTI2NFwiLFwiI2ZhZDlhNlwiLFwiI2JkMmYyOFwiLFwiIzg5MzczZFwiLFwiIzE0MjQzM1wiXSxbXCIjZWNmOGQ0XCIsXCIjZTBkZWFiXCIsXCIjY2I4ZTVmXCIsXCIjODU2ODVhXCIsXCIjMGQwNTAyXCJdLFtcIiNhMmM3YmJcIixcIiNkZGUyOWZcIixcIiNhYzhkNDlcIixcIiNhYzBkMGRcIixcIiMzMjA2MDZcIl0sW1wiI2ZmNjY3Y1wiLFwiI2ZiYmFhNFwiLFwiI2Y5ZTVjMFwiLFwiIzJjMTcxY1wiLFwiI2I2ZDBhMFwiXSxbXCIjNGI0YjU1XCIsXCIjZjQzMjRhXCIsXCIjZmY1MTZjXCIsXCIjZmI5YzVhXCIsXCIjZmNjNzU1XCJdLFtcIiNmZmFkMDhcIixcIiNlZGQ3NWFcIixcIiM3M2IwNmZcIixcIiMwYzhmOGZcIixcIiM0MDUwNTlcIl0sW1wiI2E4YWI4NFwiLFwiIzAwMDAwMFwiLFwiI2M2Yzk5ZFwiLFwiIzBjMGQwNVwiLFwiI2U3ZWJiMFwiXSxbXCIjMzMyZTFkXCIsXCIjNWFjN2FhXCIsXCIjOWFkY2I5XCIsXCIjZmFmY2QzXCIsXCIjZWZlYmE5XCJdLFtcIiNkNDVlODBcIixcIiNjNjgzOGNcIixcIiNjZmJmOWVcIixcIiNmN2RlYThcIixcIiNmNmJlNWZcIl0sW1wiI2ZjZTdkMlwiLFwiI2UwZGJiZFwiLFwiI2MwY2VhYVwiLFwiI2ZkODA4NlwiLFwiI2ViNTg3NFwiXSxbXCIjZmNmM2UzXCIsXCIjZWQ0Yzg3XCIsXCIjNjM1MjZlXCIsXCIjNmNiYWE0XCIsXCIjZjJhZDVlXCJdLFtcIiNkNmQ1NzhcIixcIiNiMWJmNjNcIixcIiM5ZGFkNDJcIixcIiMyNThhNjBcIixcIiMwYTM3NDBcIl0sW1wiI2QxZjdiYVwiLFwiI2RiZGVhNlwiLFwiI2QxYmQ5NVwiLFwiIzhjNjg2YlwiLFwiIzM5MWI0YVwiXSxbXCIjZTFlNmUzXCIsXCIjYmZkNmM3XCIsXCIjYzdiZDkzXCIsXCIjZmY3ODc2XCIsXCIjNTc0YjQ1XCJdLFtcIiNhYmVjZTRcIixcIiNjNGQwMDRcIixcIiNmZjlmMTVcIixcIiNmYjc5OTFcIixcIiM5MjZkNDBcIl0sW1wiI2ZmZmZmZlwiLFwiI2ZmOTdjYVwiLFwiI2ZmMzQ4ZVwiLFwiI2JlMDA0OVwiLFwiIzc3MDAyMVwiXSxbXCIjZmI2ZjI0XCIsXCIjOGNhMzE1XCIsXCIjNTE5MWMxXCIsXCIjMWU2NDk1XCIsXCIjMGE0Yjc1XCJdLFtcIiNkZmQwYWZcIixcIiNlOGFjYWNcIixcIiNhNDU3ODVcIixcIiM4NTU4NmNcIixcIiNhMWMwYTFcIl0sW1wiIzQ3MGQzYlwiLFwiIzdlMmY1NlwiLFwiI2MwNTc2ZlwiLFwiI2U0ODY3OVwiLFwiI2ZlYmQ4NFwiXSxbXCIjOTQwNTMzXCIsXCIjYzAwMTJhXCIsXCIjZjUwNjFkXCIsXCIjZmY4ODAwXCIsXCIjZmZiMzAwXCJdLFtcIiMwYzA2MzZcIixcIiMwOTUxNjlcIixcIiMwNTliOWFcIixcIiM1M2JhODNcIixcIiM5ZmQ4NmJcIl0sW1wiI2RlNGM0NVwiLFwiI2Q5NzY0ZFwiLFwiI2NjOWU4YVwiLFwiI2MxYzVjN1wiLFwiI2ViZGZjNlwiXSxbXCIjZDI0ZDZjXCIsXCIjYWQ4NDg0XCIsXCIjZDlkNWJiXCIsXCIjYzE4NThmXCIsXCIjYjA1NTc0XCJdLFtcIiNhNjk4OGFcIixcIiM4OGExOWZcIixcIiM2YWFiYjVcIixcIiM0YmI0Y2FcIixcIiMxZWMzZWFcIl0sW1wiIzdmMTM1ZlwiLFwiI2EwNjY3YVwiLFwiI2MyYjg5NVwiLFwiI2M0Y2FiMFwiLFwiI2M3ZGNjYVwiXSxbXCIjZDlkOWRiXCIsXCIjYjdhZThmXCIsXCIjOTc4Zjg0XCIsXCIjNGEzNjJmXCIsXCIjMTIxMjEwXCJdLFtcIiNlOWQ3YTlcIixcIiNkMmQwOWZcIixcIiNkNWE1N2ZcIixcIiNiNTZhNjVcIixcIiM0YjMxMzJcIl0sW1wiIzk5Y2NjY1wiLFwiI2E4YmRjMlwiLFwiI2I4YWViOFwiLFwiI2M3OWVhZFwiLFwiI2Q3OGZhM1wiXSxbXCIjMDYwMjEyXCIsXCIjZmU1NDEyXCIsXCIjZmMxYTFhXCIsXCIjNzk1YzA2XCIsXCIjNGY1MDRmXCJdLFtcIiNjM2I2OGNcIixcIiM2ZTViNTRcIixcIiNiOTQ4NjZcIixcIiNhZmI3YTBcIixcIiNmNGVlZDRcIl0sW1wiIzVkOTE3ZFwiLFwiI2ZmZjlkZVwiLFwiI2NkZDA3MVwiLFwiI2I4MWM0OFwiLFwiIzYzMjczOVwiXSxbXCIjZmVmMGE1XCIsXCIjZjhkMjhiXCIsXCIjZTNiMThiXCIsXCIjYTc4ZDllXCIsXCIjNzQ4MTlkXCJdLFtcIiNmY2Q4YWZcIixcIiNmZWM0OWJcIixcIiNmZTliOTFcIixcIiNmZDYwODRcIixcIiMwNDUwNzFcIl0sW1wiIzNjNTE1ZFwiLFwiIzNkNjg2OFwiLFwiIzQwOTU3ZlwiLFwiI2E3YzY4NlwiLFwiI2ZjZWU4Y1wiXSxbXCIjYjdhZWE1XCIsXCIjZjc3MDE0XCIsXCIjZTMzYzA4XCIsXCIjNDMzZDNkXCIsXCIjMjIxZDIxXCJdLFtcIiMyYzJiNGJcIixcIiNhNzUyOTNcIixcIiM5YzdhOWRcIixcIiM5ZGRhY2JcIixcIiNmOGRjYjRcIl0sW1wiI2VkZjNjNVwiLFwiI2YyY2M0OVwiLFwiI2I3YmU1ZlwiLFwiIzI0YjM5OVwiLFwiIzJkMWMyOFwiXSxbXCIjMjAwZTM4XCIsXCIjNmEwZTQ3XCIsXCIjYjUwZDU3XCIsXCIjZmYwZDY2XCIsXCIjZGVjNzkwXCJdLFtcIiNlYmViYWJcIixcIiM3OGJkOTFcIixcIiM0ZDhmODFcIixcIiM5YjRiNTRcIixcIiNmMjJiNTZcIl0sW1wiIzI3MTkxY1wiLFwiIzJkMzgzOVwiLFwiIzExNGQ0ZFwiLFwiIzZlOTk4N1wiLFwiI2UwZTRjZVwiXSxbXCIjZjRmY2UyXCIsXCIjZDNlYmM3XCIsXCIjYWFiZmFhXCIsXCIjYmY5NjkyXCIsXCIjZmMwMjg0XCJdLFtcIiM5NDFmMWZcIixcIiNjZTZiNWRcIixcIiNmZmVmYjlcIixcIiM3Yjk5NzFcIixcIiMzNDUwMmJcIl0sW1wiIzBjY2FiYVwiLFwiI2UzZjViN1wiLFwiI2U2YWUwMFwiLFwiI2Q0NjcwMFwiLFwiIzllM2YwMFwiXSxbXCIjZmY3YTI0XCIsXCIjZmY2ZDU0XCIsXCIjZjc2ZDc1XCIsXCIjZTg3MjhmXCIsXCIjYzk3YmE1XCJdLFtcIiNmY2Y2ZDJcIixcIiNmY2Y2ZDJcIixcIiNmYmUyYjlcIixcIiNjNmMzOWFcIixcIiMyODFmMjBcIl0sW1wiI2ZjZjljZVwiLFwiI2M0ZTBhNlwiLFwiI2RlYTM3YVwiLFwiI2JkMzczN1wiLFwiI2Q1NGM0YVwiXSxbXCIjZjhkYjdlXCIsXCIjZWM2MzQ5XCIsXCIjY2UyMzQwXCIsXCIjNmYxYjJjXCIsXCIjMzEwYTI2XCJdLFtcIiNiNmQ5YzNcIixcIiNjNmE5YWNcIixcIiNkNDgyOTlcIixcIiNlNjRlODFcIixcIiNmZDBhNjBcIl0sW1wiIzk1YWE2MVwiLFwiIzEyMTMxMFwiLFwiI2Y2ZjhlZVwiLFwiI2Q2ZTY4YVwiLFwiIzg5OTc1MlwiXSxbXCIjM2YyNjRkXCIsXCIjNWQyNzQ3XCIsXCIjOWYzNjQ3XCIsXCIjZGI0NjQ4XCIsXCIjZmI5NTUzXCJdLFtcIiNmOWY5ZTdcIixcIiM1MDUwNDVcIixcIiMxNjE2MTNcIixcIiNjMGExYWVcIixcIiNjMWUwZTBcIl0sW1wiIzY4OTE5NVwiLFwiIzA1MDAwMFwiLFwiI2FiODI4OFwiLFwiI2NlYTRhNlwiLFwiI2ZmY2RjNVwiXSxbXCIjZmZlNmJkXCIsXCIjZmZjYzdhXCIsXCIjZTY4YTZjXCIsXCIjOGEyZjYyXCIsXCIjMjYwMDE2XCJdLFtcIiNjYWQ1YWRcIixcIiNmOWRmOTRcIixcIiNmNmE1NzBcIixcIiNlNzdhNzdcIixcIiM1NDM0M2ZcIl0sW1wiIzczYzVhYVwiLFwiI2M2YzA4NVwiLFwiI2Y5YTE3N1wiLFwiI2Y3NjE1N1wiLFwiIzRjMWIwNVwiXSxbXCIjY2YzYTY5XCIsXCIjOGY0MjU0XCIsXCIjN2NhYTk2XCIsXCIjYjZjNDc0XCIsXCIjZDRkNDg5XCJdLFtcIiNkNDY0MTlcIixcIiNiMzQyMTJcIixcIiMzNDE0MDVcIixcIiMxNjY2NjVcIixcIiM4Mzg3MGVcIl0sW1wiIzFmMmYzYVwiLFwiIzk4MDkyYlwiLFwiI2RmOTMxYlwiLFwiI2UwZGFhM1wiLFwiIzlmYjk4MlwiXSxbXCIjN2U5NDllXCIsXCIjYWVjMmFiXCIsXCIjZWJjZWEwXCIsXCIjZmM3NzY1XCIsXCIjZmYzMzVmXCJdLFtcIiM4MDcwNzBcIixcIiM5YThmYzhcIixcIiM4ZGJkZWJcIixcIiNhNWU2YzhcIixcIiNkOWY1YjVcIl0sW1wiIzFhMmIyYlwiLFwiIzMzMjIyMlwiLFwiIzRkMWExYVwiLFwiIzY2MTExMVwiLFwiIzgwMDkwOVwiXSxbXCIjOGQxMDQyXCIsXCIjYTI1ZDQ3XCIsXCIjYTA4NDQ3XCIsXCIjOTdhYTY2XCIsXCIjYjhiODg0XCJdLFtcIiNmN2YwYmFcIixcIiNlMGRiYTRcIixcIiNhOWNiYTZcIixcIiM3ZWJlYTNcIixcIiM1M2EwOGVcIl0sW1wiIzU1MWJiM1wiLFwiIzI2OGZiZVwiLFwiIzJjYjhiMlwiLFwiIzNkZGI4ZlwiLFwiI2E5ZjA0ZFwiXSxbXCIjMGYxMzJlXCIsXCIjMTkyNzRlXCIsXCIjNTM2ZDg4XCIsXCIjYjQ5Yjg1XCIsXCIjZWFjMTk1XCJdLFtcIiMxYzBiMmJcIixcIiMzMDFjNDFcIixcIiM0MTNiNmJcIixcIiM1YzY1YzBcIixcIiM2Zjk1ZmZcIl0sW1wiIzBkMDIxMFwiLFwiIzRkMzE0N1wiLFwiIzg2NmE4MFwiLFwiI2M5YjdjN1wiLFwiI2ZmZmJmZlwiXSxbXCIjZmZmZmY3XCIsXCIjZTlmY2NmXCIsXCIjZDhmY2IzXCIsXCIjYjFmY2IzXCIsXCIjODlmY2IzXCJdLFtcIiNlZmVjZTJcIixcIiM4MWQ3Y2RcIixcIiNmZjAwNDhcIixcIiNiMTM3NTZcIixcIiM1YjEwMjNcIl0sW1wiIzAyMDIwMlwiLFwiIzQ5M2QzZlwiLFwiI2JkYjQ5NVwiLFwiI2Y4ZjJjZVwiLFwiI2Q4ZDk4OVwiXSxbXCIjZDhmNWQxXCIsXCIjOWRkYmNhXCIsXCIjOTJiMzk1XCIsXCIjNzI2YzgxXCIsXCIjNTY1MTY0XCJdLFtcIiM1YTM5MzhcIixcIiM4NDdiNmRcIixcIiNhM2FiOThcIixcIiNkMmQ1YWZcIixcIiNkZmE0OWJcIl0sW1wiIzg4ZDFjYVwiLFwiI2RlZDZjOVwiLFwiI2U2OGEyZVwiLFwiI2M5MGEwMFwiLFwiIzQ1MmIzNFwiXSxbXCIjYmZlNGNkXCIsXCIjZGRiMzdkXCIsXCIjZmE4MzMxXCIsXCIjZmI0ODQ4XCIsXCIjZmQwYTYwXCJdLFtcIiNlODVhNTBcIixcIiNmZWZmZDZcIixcIiM1YmI3YjZcIixcIiMwMTAwMDJcIixcIiNmZGYzN2FcIl0sW1wiIzRhMzMzM1wiLFwiI2UxNDczZlwiLFwiIzlhOTA4OFwiLFwiIzgwYjBhYlwiLFwiI2RiZDFiM1wiXSxbXCIjZjZlZGRjXCIsXCIjZTNlNWQ3XCIsXCIjYmRkNmQyXCIsXCIjYTVjOGNhXCIsXCIjNTg2ODc1XCJdLFtcIiNiNjg4MTBcIixcIiMzMDE0MDZcIixcIiM3Zjk0NzNcIixcIiNkM2M3OTVcIixcIiNjMDJjMjBcIl0sW1wiIzQyMzQzMVwiLFwiI2Y3MGIxN1wiLFwiIzA1MDAwMFwiLFwiIzlhOGMyOVwiLFwiI2U3Y2JhNFwiXSxbXCIjZWVjNzdhXCIsXCIjZTc3MTU1XCIsXCIjYzcxNzU1XCIsXCIjN2IzMzM2XCIsXCIjNWI5YjlhXCJdLFtcIiM0MDQ0NjdcIixcIiM1YzYyN2FcIixcIiNhM2I2YTJcIixcIiNiMmNjYWZcIixcIiNmZmZhYWNcIl0sW1wiIzkzOTQ3M1wiLFwiIzRmNzg0ZVwiLFwiIzJkNWU0Y1wiLFwiIzEzNDQ0ZFwiLFwiIzI1MjMyNlwiXSxbXCIjMTZjMWM4XCIsXCIjNDljY2NjXCIsXCIjN2NkN2NmXCIsXCIjYWVlMWQzXCIsXCIjZTFlY2Q2XCJdLFtcIiNlZjQzMzVcIixcIiNmNjhiMzZcIixcIiNmMmNkNGZcIixcIiNjYWUwODFcIixcIiM4OGVlZDBcIl0sW1wiIzUyNGU0ZVwiLFwiI2ZmMmI3M1wiLFwiI2ZmNWE2YVwiLFwiI2ZmOTU2M1wiLFwiI2ZmY2QzN1wiXSxbXCIjZDk0MDUyXCIsXCIjZWU3ZTRjXCIsXCIjZWFkNTZjXCIsXCIjOTRjNWE1XCIsXCIjODk4Yjc1XCJdLFtcIiMwZjdkN2VcIixcIiM3NmI1YTBcIixcIiNmZmZkZDFcIixcIiNmZjc1NzVcIixcIiNkMzM2NDlcIl0sW1wiIzNlMzc0MlwiLFwiIzgyNWU2NVwiLFwiI2NjODM4M1wiLFwiI2ViYzRhOVwiLFwiI2U2ZTBjNVwiXSxbXCIjZDBkY2NiXCIsXCIjZDdjN2JlXCIsXCIjYjNjNWJhXCIsXCIjODhjM2I1XCIsXCIjNmQ2MTY4XCJdLFtcIiNmN2Y0ZThcIixcIiNkYWYzZWFcIixcIiM4NWU2YzBcIixcIiM2YmIzOWJcIixcIiMwYjBiMGRcIl0sW1wiIzA0Mzk0ZVwiLFwiIzAwODc1ZVwiLFwiI2E3Y2MxNVwiLFwiI2Y1Y2MxN1wiLFwiI2Y1NjIxN1wiXSxbXCIjMmYxMzM1XCIsXCIjNjIwZTVkXCIsXCIjOWQwMDdhXCIsXCIjY2UzNzYyXCIsXCIjZmY2ZTQ5XCJdLFtcIiMyMjAxMTRcIixcIiM4MTE2MjhcIixcIiNiZDMwMzhcIixcIiNmZjdlNTdcIixcIiNmOGIwNjhcIl0sW1wiI2ZiNTQ1Y1wiLFwiIzk5NjYyZFwiLFwiI2I3ZTFhMVwiLFwiI2NkZWRhMVwiLFwiI2ZkZjVhNFwiXSxbXCIjMzMyNDJiXCIsXCIjZTMwODQyXCIsXCIjZmM0NjMwXCIsXCIjZmY5MzE3XCIsXCIjYzRmZjBkXCJdLFtcIiNmNWM4YmZcIixcIiNlMGQyYzVcIixcIiNjYWQ5Y2FcIixcIiNhN2UzYzFcIixcIiM0OTU0NTNcIl0sW1wiI2YwZjBkOFwiLFwiI2Q4ZDhjMFwiLFwiIzdhODM3MFwiLFwiI2RmODYxNVwiLFwiI2Y4NDYwMFwiXSxbXCIjOWU5ZTllXCIsXCIjNWVjZGUwXCIsXCIjMDBmZmYyXCIsXCIjYzRmZmM5XCIsXCIjZTBlMGUwXCJdLFtcIiM1NDFlMzVcIixcIiNkZjVkMmVcIixcIiNmZmI0M2VcIixcIiNhNGM5NzJcIixcIiM2YmIzOGVcIl0sW1wiIzU4NTM0Y1wiLFwiI2YxZDNhYlwiLFwiI2RiY2U3OVwiLFwiI2Y5NTg0MlwiLFwiIzBlYWVhYlwiXSxbXCIjZjZiMTQ5XCIsXCIjZjg1NzJkXCIsXCIjZGYyYTMzXCIsXCIjYTIyNTQzXCIsXCIjNmIzMTJkXCJdLFtcIiNmZmZmZmZcIixcIiMwMDAwMDBcIixcIiNmZjAwNmZcIixcIiNmZmIzMDBcIixcIiNmZmY1MzhcIl0sW1wiI2Y1ZWE5NVwiLFwiI2ZjOGU1YlwiLFwiI2ZjNTk1NlwiLFwiI2M5M2U0ZlwiLFwiIzNkMTczNFwiXSxbXCIjZjFmZmQ1XCIsXCIjZDZlNmI3XCIsXCIjYTM1NDgxXCIsXCIjYjgxMzZmXCIsXCIjZWEwMDYzXCJdLFtcIiNjYjZmODRcIixcIiMyOTFkMjFcIixcIiM1ZDU0NGRcIixcIiNjZmNjYmJcIixcIiNlMWRhY2FcIl0sW1wiI2ZmOGQ3YlwiLFwiI2M4ODk4NFwiLFwiIzk0NzI4MFwiLFwiI2Q2YjU4Y1wiLFwiI2RjZDM5MlwiXSxbXCIjZmZlZWMyXCIsXCIjZmU5ZThlXCIsXCIjZjgwMTc0XCIsXCIjYzQwMzdhXCIsXCIjMzIyYzhlXCJdLFtcIiM3NTcyN2FcIixcIiM5OTdmODdcIixcIiNiODhjODdcIixcIiNkMzk2NzlcIixcIiNmM2E3NmRcIl0sW1wiI2UwZGNiOFwiLFwiI2M0YmMxNlwiLFwiIzkxOGY2MVwiLFwiI2MyMWY0MFwiLFwiIzMwMmMyNVwiXSxbXCIjM2IzZTM3XCIsXCIjZTE5NTYzXCIsXCIjOWZiMzliXCIsXCIjZDM5MDg4XCIsXCIjZjBkZGI1XCJdLFtcIiMyMjgwNmJcIixcIiNhODlmMWRcIixcIiNmYWNiNGJcIixcIiNmY2FmMTRcIixcIiNlZDc2MTVcIl0sW1wiIzI4MWIyNFwiLFwiI2QwMjk0MVwiLFwiI2Y1N2U2N1wiLFwiI2Q5YzlhNVwiLFwiIzhjYWI5NFwiXSxbXCIjNTU1MjMxXCIsXCIjOWM4YzUxXCIsXCIjYmNhYzcxXCIsXCIjZTlkYjljXCIsXCIjNzk5MjdkXCJdLFtcIiNkM2RiZDlcIixcIiNhNGJkYmNcIixcIiNmZmRhYmZcIixcIiNmZmJmOTFcIixcIiNmZjlhNTJcIl0sW1wiIzc5YWJhMlwiLFwiI2I0Yjk0M1wiLFwiI2I3ODMzYVwiLFwiI2EwNGIyNlwiLFwiIzMwMWUxYVwiXSxbXCIjZWJlN2E3XCIsXCIjYTdlYmM5XCIsXCIjNzhiMzk1XCIsXCIjOTE3YzY3XCIsXCIjNWU1OTUzXCJdLFtcIiNmZjg1OTFcIixcIiNlZmFhYTNcIixcIiM4Y2FhYTJcIixcIiM1YTliOTVcIixcIiM0NDg3OGZcIl0sW1wiI2Y1ZDM5M1wiLFwiI2YzOTc3MlwiLFwiI2ViNjc2NVwiLFwiIzI2MTMyOVwiLFwiIzFhMGIyYVwiXSxbXCIjZTRmM2Q4XCIsXCIjYWZjYWNjXCIsXCIjZmZhMDJlXCIsXCIjZTgwNTYwXCIsXCIjMzMxZDRhXCJdLFtcIiNhZjA3NDVcIixcIiNmYTQwNjlcIixcIiNmZTljNmJcIixcIiNmY2RhOTBcIixcIiNjOGIwODBcIl0sW1wiI2MzOTczOFwiLFwiI2ZmZmY5NlwiLFwiIzdmNDMxMVwiLFwiIzVlNDMxOFwiLFwiIzM2MWYwMFwiXSxbXCIjNTgyNzcwXCIsXCIjNzczZDk0XCIsXCIjOTQzZDhhXCIsXCIjYzIyNzYwXCIsXCIjZTgxNzY0XCJdLFtcIiMyODE5MTZcIixcIiNlODY3ODZcIixcIiNmNGExYjVcIixcIiNmZmQyY2JcIixcIiM5NmI1YWRcIl0sW1wiI2QyZDJkMlwiLFwiIzU4YWZiOFwiLFwiIzI2OTE5OVwiLFwiI2VjMjI1ZVwiLFwiIzAyMDMwNVwiXSxbXCIjODE3NDljXCIsXCIjNGQzZTZiXCIsXCIjOGRhZWMzXCIsXCIjYzVkZmUwXCIsXCIjZmNmY2UyXCJdLFtcIiNiMTk2NzZcIixcIiM3NjY4NjJcIixcIiM5MmJmOWZcIixcIiNlM2Q0OWNcIixcIiNmOWYwYjdcIl0sW1wiI2NiZGFkNVwiLFwiIzg5YTdiMVwiLFwiIzU2Njk4MVwiLFwiIzNhNDE1YVwiLFwiIzM0MzQ0ZVwiXSxbXCIjMDAxZjIxXCIsXCIjMDI5Yjk5XCIsXCIjZWJlN2I3XCIsXCIjZGU0ZjE1XCIsXCIjZWNjMDM5XCJdLFtcIiNmYjZhM2RcIixcIiNmYmU1YWNcIixcIiMzNjFkMjBcIixcIiNhMmJjOTdcIixcIiNmN2NkNjdcIl0sW1wiIzkwNzA3MVwiLFwiIzdiYmRhMVwiLFwiI2E0ZDlhM1wiLFwiI2M2ZDdhMFwiLFwiI2ZiZGNiMFwiXSxbXCIjOGUzZjY1XCIsXCIjNzM3MzhkXCIsXCIjNzJhNWFlXCIsXCIjOThlOWQwXCIsXCIjZDhmZmNjXCJdLFtcIiNkMmZhZTJcIixcIiNlNmY4YjFcIixcIiNmNmQ1YWRcIixcIiNmNmI3OTRcIixcIiNlNTlkYTBcIl0sW1wiI2FkMjAwM1wiLFwiI2UwZTZhZVwiLFwiI2JkZDNiNlwiLFwiIzgzNjg2OFwiLFwiIzVmMDYwOVwiXSxbXCIjZmU5NjAwXCIsXCIjZmZjNTAxXCIsXCIjZmZlZTRhXCIsXCIjNzc0NzdlXCIsXCIjMDMwMDFjXCJdLFtcIiM1ZTM4NDhcIixcIiM2NjYxNjNcIixcIiNhN2IzODFcIixcIiNjYWQxOTdcIixcIiNjZGUwYmZcIl0sW1wiIzJhMWUxZVwiLFwiIzUwMzg1MFwiLFwiI2FhNjU4MVwiLFwiI2Y5OWZhOVwiLFwiI2ZmYzVjMVwiXSxbXCIjZDFkYzVhXCIsXCIjZTBmN2UwXCIsXCIjNzdmMmRlXCIsXCIjNmFjNWNiXCIsXCIjNDU0NDRlXCJdLFtcIiM0MDBlMjhcIixcIiM5OTJmNGRcIixcIiNmMjU4NzJcIixcIiNmMDhlNzNcIixcIiNlOGI3ODdcIl0sW1wiIzc0MTk1MlwiLFwiI2ZlMzE3NFwiLFwiI2YxYzE1ZFwiLFwiIzk0YmI2OFwiLFwiIzA5YTNhZFwiXSxbXCIjOTQyMjIyXCIsXCIjYmQzNzM3XCIsXCIjZDRjZGFkXCIsXCIjOThjM2ExXCIsXCIjMjU4NTdkXCJdLFtcIiMxNjBkMThcIixcIiMyMzE0NWJcIixcIiMwOTQ1NmNcIixcIiMwMjZmNmVcIixcIiMxY2EzOWVcIl0sW1wiI2U1ZGFjMFwiLFwiI2JjYjA5MVwiLFwiIzlmN2I1MVwiLFwiIzgyMGQyNVwiLFwiIzRhMDAxM1wiXSxbXCIjY2YwNjM4XCIsXCIjZmE2NjMyXCIsXCIjZmVjZDIzXCIsXCIjMGE5OTZmXCIsXCIjMGE2Nzg5XCJdLFtcIiNmZjQwMDBcIixcIiNmZmVmYjVcIixcIiMzMTkxOTBcIixcIiNmZmM4MDNcIixcIiMyNjBkMGRcIl0sW1wiIzgxN2E4YVwiLFwiI2NkYmJiYlwiLFwiI2ZjZGRjOFwiLFwiI2ZmZmVlYVwiLFwiI2VmY2FiYVwiXSxbXCIjYzc1Zjc3XCIsXCIjZmVmYWI2XCIsXCIjNzdhNDkzXCIsXCIjODM2MTc3XCIsXCIjNjU0YjQ5XCJdLFtcIiNjZGIyN2JcIixcIiNkZTdjMDRcIixcIiNlNDIxMWJcIixcIiNjMDAzNTNcIixcIiM1ZTIwMjVcIl0sW1wiIzJhMDMwOFwiLFwiIzkyNGYxYlwiLFwiI2UyYWMzZlwiLFwiI2Y4ZWJiZVwiLFwiIzdiYTU4ZFwiXSxbXCIjYTI4MjVjXCIsXCIjODhkM2FiXCIsXCIjZjlmYWQyXCIsXCIjZjVkYTdhXCIsXCIjZmY5ODVlXCJdLFtcIiM5YWVkYjVcIixcIiNhYjlhODlcIixcIiNhMzYwNmRcIixcIiM0ZjJkNGJcIixcIiMyOTFlNDBcIl0sW1wiI2ZlOTU4ZlwiLFwiI2YzZDdjMlwiLFwiIzhiYjZhM1wiLFwiIzE3YTdhOFwiLFwiIzEyMmY1MVwiXSxbXCIjMmYyZTMwXCIsXCIjZTg0YjJjXCIsXCIjZTZkODM5XCIsXCIjN2NkMTY0XCIsXCIjMmViOGFjXCJdLFtcIiM0YWNhYmJcIixcIiNjYmU1YzBcIixcIiNmY2Y5YzJcIixcIiNlZGM1YmRcIixcIiM4NDQwN2JcIl0sW1wiI2Q2NDk2Y1wiLFwiIzdkYjhhMlwiLFwiI2Q2ZGQ5MFwiLFwiI2ZmZmFkM1wiLFwiIzdlNjM4Y1wiXSxbXCIjYmVjZWM0XCIsXCIjNjg4YTdjXCIsXCIjOWQ3YzViXCIsXCIjZTM1MjQxXCIsXCIjZTQ5MTgzXCJdLFtcIiMyODFhMWFcIixcIiM0ZTJkMjhcIixcIiM3MDQ1NGVcIixcIiNhZTczNmZcIixcIiNkZGE4YjBcIl0sW1wiIzk2NmM4MFwiLFwiIzk2YmRhOFwiLFwiI2JmZDRhZFwiLFwiI2Y3ZDNhM1wiLFwiI2VjYTM2Y1wiXSxbXCIjZmZmNGNlXCIsXCIjZDBkZWI4XCIsXCIjZmZhNDkyXCIsXCIjZmY3ZjgxXCIsXCIjZmY1YzcxXCJdLFtcIiM0MjBiNThcIixcIiNmYzAzNmNcIixcIiNmMWEyMGJcIixcIiM4ZDljMDlcIixcIiMwODgwN2JcIl0sW1wiIzRkNGQ0ZFwiLFwiIzYzNzU2NlwiLFwiI2EzOWM2N1wiLFwiI2Q2OWU2MFwiLFwiI2ZmNzA0ZFwiXSxbXCIjY2M4ZjYwXCIsXCIjYjdhMDc1XCIsXCIjOWViNDhlXCIsXCIjOGNjMmEwXCIsXCIjNzdkNGI2XCJdLFtcIiNlYzYzNjNcIixcIiNlYzc5NjNcIixcIiNlY2IxNjNcIixcIiNkZmQ0ODdcIixcIiNiZGViY2FcIl0sW1wiIzFjMzFhNVwiLFwiIzEwMWY3OFwiLFwiIzAyMGY1OVwiLFwiIzAxMDkzN1wiLFwiIzAwMDUyNFwiXSxbXCIjM2QyMzA0XCIsXCIjN2Y2MDAwXCIsXCIjZGViMDY5XCIsXCIjYzQxMDI2XCIsXCIjM2QwNjA0XCJdLFtcIiNlZmQ4YTRcIixcIiNlOGFlOTZcIixcIiNlNDlkODlcIixcIiNlNDdmODNcIixcIiNhOGM5OWVcIl0sW1wiI2MwZmZmZlwiLFwiIzYwZWNmZlwiLFwiI2ZlNTM4MFwiLFwiI2ZmYmI1ZVwiLFwiI2ZlZmVmY1wiXSxbXCIjYzlhZDliXCIsXCIjZmZiZGExXCIsXCIjZTA1NTc2XCIsXCIjNzAzOTUxXCIsXCIjNDUyYTM3XCJdLFtcIiM0MDEyMmNcIixcIiM2NTYyNzNcIixcIiM1OWJhYTlcIixcIiNkOGYxNzFcIixcIiNmY2ZmZDlcIl0sW1wiIzFhMTEwZVwiLFwiIzRlMDUxY1wiLFwiI2Y3MTE0YlwiLFwiI2M0YjQzMlwiLFwiI2JjYjdhYlwiXSxbXCIjZjVlMWE0XCIsXCIjZDlkNTkzXCIsXCIjZWU3ZjI3XCIsXCIjYmMxNjJhXCIsXCIjMzAyMzI1XCJdLFtcIiNmNjc5NjhcIixcIiNmNjc5NjhcIixcIiNmNjhjNjhcIixcIiNmNjhjNjhcIixcIiNmNmExNjhcIl0sW1wiIzhlOTc4ZFwiLFwiIzk3YzRhZFwiLFwiI2JmZWRiZVwiLFwiI2U2ZmNkOVwiLFwiI2NkZjJkNlwiXSxbXCIjZmVmMWUwXCIsXCIjZjZlNmNlXCIsXCIjM2IyZTJhXCIsXCIjM2YwNjMyXCIsXCIjYTQ3ZjFhXCJdLFtcIiMyYThiOGJcIixcIiM3NWM1OGVcIixcIiNiZmZmOTFcIixcIiNkZmU5YThcIixcIiNmZmQyYmZcIl0sW1wiIzk2OTU4YVwiLFwiIzc2ODc3ZFwiLFwiIzg4YjhhOVwiLFwiI2IyY2JhZVwiLFwiI2RiZGRiNFwiXSxbXCIjZjBkZWJiXCIsXCIjNTlhODdkXCIsXCIjMTY0NTNmXCIsXCIjMDkxYzFhXCIsXCIjNTQxNzM0XCJdLFtcIiM4ZDljOWRcIixcIiNlMDBiNWJcIixcIiNmNWIwNGJcIixcIiNmY2RmYmRcIixcIiM0NTM3M2VcIl0sW1wiIzkzYmE4NVwiLFwiI2JkYTM3MlwiLFwiI2Y0OTg1OVwiLFwiI2ZmNDk0YlwiLFwiIzVlMzYzZlwiXSxbXCIjZmZmN2JjXCIsXCIjZmVlNzhhXCIsXCIjZjhhMzQ4XCIsXCIjZTE1MjQ0XCIsXCIjM2E3YjUwXCJdLFtcIiNlZGEwOGNcIixcIiM4NzZmNTVcIixcIiNhMTkxNTNcIixcIiNiMWIwODBcIixcIiNiMWNlYWZcIl0sW1wiI2MwYjE5ZVwiLFwiI2ZmYjQ4ZlwiLFwiI2Y2OGI3YlwiLFwiI2Y2NDY0YVwiLFwiIzkxMTQ0MFwiXSxbXCIjYzkyYzJjXCIsXCIjY2Y2MTIzXCIsXCIjZjNjMzYzXCIsXCIjZjFlOWJiXCIsXCIjNWM0ODNhXCJdLFtcIiNmYWY0ZTBcIixcIiNkMmZmMWZcIixcIiNmZmMzMDBcIixcIiNmZjZhMDBcIixcIiMzYjBjMmNcIl0sW1wiI2ZmZmZmZlwiLFwiIzVlOTE4OFwiLFwiIzNlNTk1NFwiLFwiIzI1MzM0MlwiLFwiIzIzMjIyNlwiXSxbXCIjMTEwMzAzXCIsXCIjYzMwNjJjXCIsXCIjZmYxOTRiXCIsXCIjOGZhMDgwXCIsXCIjNzA4MDY2XCJdLFtcIiNiMGRhMDlcIixcIiNmOTk0MDBcIixcIiNmMDBhNWVcIixcIiNiODAwOTBcIixcIiM1NDRmNTFcIl0sW1wiI2VlYWVhYVwiLFwiI2RhYWVhYVwiLFwiI2M2YWVhYVwiLFwiI2IyYWVhYVwiLFwiIzllYWVhYVwiXSxbXCIjZjJmMmYyXCIsXCIjMzQ4ZTkxXCIsXCIjMWM1MDUyXCIsXCIjMjEzNjM1XCIsXCIjMGEwYzBkXCJdLFtcIiMyODI4MzJcIixcIiM3NzE4MWVcIixcIiNhOTI3MjdcIixcIiNjNmQ2ZDZcIixcIiNkZWU3ZTdcIl0sW1wiI2NkZTljYVwiLFwiI2NlZDg5ZFwiLFwiI2RmYmE3NFwiLFwiI2U4YTI0OVwiLFwiIzU3NWU1NVwiXSxbXCIjZmZmZmMyXCIsXCIjZjBmZmMyXCIsXCIjZTBmZmMyXCIsXCIjZDFmZmMyXCIsXCIjYzJmZmMyXCJdLFtcIiM2MTVjNWNcIixcIiNlMzAwNzVcIixcIiNmZjRhNGFcIixcIiNmZmIzMTlcIixcIiNlYmU4ZThcIl0sW1wiIzYzNjM2M1wiLFwiIzg1ODI3ZVwiLFwiI2QxYjM5ZlwiLFwiI2ZmZWNkMVwiLFwiI2ZmZDFiM1wiXSxbXCIjZmZmZmU1XCIsXCIjZGZmZGE3XCIsXCIjNmVjZjQyXCIsXCIjMzFhMjUyXCIsXCIjNmI0NTZjXCJdLFtcIiNlMGJlN2VcIixcIiNlODlkMTBcIixcIiNkYjRiMjNcIixcIiMzODI5MjRcIixcIiMxMzYwNjZcIl0sW1wiIzY3MGQwZlwiLFwiI2YwMTk0NVwiLFwiI2YzNjQ0NFwiLFwiI2ZmY2U2ZlwiLFwiI2ZmZTNjOVwiXSxbXCIjMmYyYzJiXCIsXCIjNDEzNzI2XCIsXCIjNzk0NTFkXCIsXCIjZDc2MjFhXCIsXCIjZmQ4ZDMyXCJdLFtcIiM1NDhjODJcIixcIiNkMWNlOTVcIixcIiNmY2ZhZGVcIixcIiNkNTVkNjNcIixcIiM0NTJkM2RcIl0sW1wiIzk2YjVhNlwiLFwiI2ZjZTFjYlwiLFwiI2ZlYmVhY1wiLFwiIzRlMzgzZFwiLFwiI2Q5NDM0ZlwiXSxbXCIjMmIyMzE4XCIsXCIjNTI0ODM1XCIsXCIjNTY3MDRiXCIsXCIjNWQ5ZTdlXCIsXCIjNzhiM2E0XCJdLFtcIiNiZWNiN2NcIixcIiM4NDk2N2VcIixcIiM5NjJjNGNcIixcIiNmMDVkNjdcIixcIiNmYWExOTFcIl0sW1wiI2QwZDE2N1wiLFwiI2ZmZmNmZlwiLFwiI2U2ZGRkY1wiLFwiI2ZmMGM2NlwiLFwiIzk2OWJhMlwiXSxbXCIjMmYwMDNmXCIsXCIjYmUwMDAxXCIsXCIjZmY4MDA2XCIsXCIjZjNjNzVmXCIsXCIjZTljZmFhXCJdLFtcIiNiN2IwOWVcIixcIiM0OTM0NDNcIixcIiNlYjYwNzdcIixcIiNmMGI0OWVcIixcIiNmMGUyYmVcIl0sW1wiI2Y3ZTZiZVwiLFwiI2U4OWE4MFwiLFwiI2E5MzU0NVwiLFwiIzRkNDE0M1wiLFwiIzQ4NTc1NVwiXSxbXCIjYzNhYWE1XCIsXCIjZDc2NDgzXCIsXCIjZWY5Y2E0XCIsXCIjZmZjMmJiXCIsXCIjZjZlNWNiXCJdLFtcIiMwMTBkMjNcIixcIiMwMzIyM2ZcIixcIiMwMzhiYmJcIixcIiNmY2NiNmZcIixcIiNlMTlmNDFcIl0sW1wiI2ZiNzk2OFwiLFwiI2Y5YzU5M1wiLFwiI2ZhZmFkNFwiLFwiI2IwZDFiMlwiLFwiIzg5YjJhMlwiXSxbXCIjM2I1Mjc0XCIsXCIjOWM2NjdkXCIsXCIjY2U5MzhiXCIsXCIjZThjYzljXCIsXCIjZTNlMWIxXCJdLFtcIiNkOGMzNThcIixcIiM2ZDA4MzlcIixcIiNkMGU3OTlcIixcIiMyNTI3MWVcIixcIiNmYmVmZjRcIl0sW1wiI2Q4ZDNhYlwiLFwiI2IwYjE5ZlwiLFwiIzc4NGQ1ZlwiLFwiI2JhNDU2YVwiLFwiI2QwNDk2OVwiXSxbXCIjODk2NjZkXCIsXCIjZDJjMjlmXCIsXCIjZTNhODY4XCIsXCIjZjc2ZjZkXCIsXCIjZjIzMDZkXCJdLFtcIiMzMDE4MmJcIixcIiNmMGYxYmNcIixcIiM2MGYwYzBcIixcIiNmZjM2MGVcIixcIiMxOTFmMDRcIl0sW1wiIzRhZWRkN1wiLFwiIzcwNTY0N1wiLFwiI2VkNmQ0YVwiLFwiI2ZmY2E2NFwiLFwiIzNmZDk3ZlwiXSxbXCIjMzMwNzA4XCIsXCIjZTg0NjI0XCIsXCIjZTg3NjI0XCIsXCIjZThhNzI2XCIsXCIjZThkODI2XCJdLFtcIiNmN2MwOTdcIixcIiM4MjlkNzRcIixcIiNkZTNjMmZcIixcIiNlYjVmMDdcIixcIiNmMTg4MDlcIl0sW1wiI2YwMDA2NVwiLFwiI2ZhOWY0M1wiLFwiI2Y5ZmFkMlwiLFwiIzI2MjMyNFwiLFwiI2IzZGJjOFwiXSxbXCIjZjQ2NDcyXCIsXCIjZjJlY2MzXCIsXCIjZmZmOWQ4XCIsXCIjYmVkNmFiXCIsXCIjOTk5MTc1XCJdLFtcIiNjM2QyOTdcIixcIiNmZmZmZmZcIixcIiNjM2IxOTlcIixcIiMzYTJkMTlcIixcIiNlODM3M2VcIl0sW1wiIzNiMDUwM1wiLFwiI2Y2NzcwNFwiLFwiI2Y4NTMxM1wiLFwiI2ZlZGM1N1wiLFwiIzllY2ZiY1wiXSxbXCIjNjc4Yzk5XCIsXCIjYjhjN2NjXCIsXCIjZmZmMWNmXCIsXCIjZDZjMjkyXCIsXCIjYjU5ZTY3XCJdLFtcIiNmZGYyYzVcIixcIiNlZmU4YjJcIixcIiNjNmQxYTZcIixcIiM4MmJmYTBcIixcIiM3YTZmNWRcIl0sW1wiIzIxMjAzZlwiLFwiI2ZmZjFjZVwiLFwiI2U3YmZhNVwiLFwiI2M1YTg5OFwiLFwiIzRiM2M1ZFwiXSxbXCIjZWY3MjcwXCIsXCIjZWU5ZjgwXCIsXCIjZjNlY2JlXCIsXCIjY2RhZjdiXCIsXCIjNTkyOTFiXCJdLFtcIiMzYTMyMzJcIixcIiNkODMwMThcIixcIiNmMDc4NDhcIixcIiNmZGZjY2VcIixcIiNjMGQ4ZDhcIl0sW1wiIzM1MjY0MFwiLFwiIzkyMzk0YlwiLFwiI2E5NzY3YVwiLFwiI2QxYjRhMlwiLFwiI2YxZjJjZVwiXSxbXCIjZmNmN2Q3XCIsXCIjZmVhNjY3XCIsXCIjZmZlNDYxXCIsXCIjYzRjNzc2XCIsXCIjZjRkMDkyXCJdLFtcIiMwN2Y5YTJcIixcIiMwOWMxODRcIixcIiMwYTg5NjdcIixcIiMwYzUxNDlcIixcIiMwZDE5MmJcIl0sW1wiI2FhYWE5MVwiLFwiIzg0ODQ3OFwiLFwiIzVlNWU1ZVwiLFwiIzM4Mzg0NVwiLFwiIzEyMTIyYlwiXSxbXCIjZmRlYzZmXCIsXCIjZjJlOWIwXCIsXCIjZWNkZmRiXCIsXCIjZWRlM2ZiXCIsXCIjZmVkZmFlXCJdLFtcIiM4MjliODZcIixcIiM5NmI3YTJcIixcIiNhNmFhNTZcIixcIiNiNGI5NjlcIixcIiNkZmRiOWNcIl0sW1wiIzA1MDAwM1wiLFwiIzQ5Njk0MFwiLFwiIzkzODQyZlwiLFwiI2ZmYTczOVwiLFwiI2ZjZTA3ZlwiXSxbXCIjN2ViZWIyXCIsXCIjZDFmM2RiXCIsXCIjZGE5YzNjXCIsXCIjYmMxOTUzXCIsXCIjN2QxNDRjXCJdLFtcIiM2Yzc4OGVcIixcIiNhNmFlYzFcIixcIiNjZmQ1ZTFcIixcIiNlZGVkZjJcIixcIiNmY2ZkZmZcIl0sW1wiIzQ3MTc1NFwiLFwiIzk5MWQ1ZFwiLFwiI2YyNDQ1ZVwiLFwiI2YwNzk1MVwiLFwiI2RlYzg3YVwiXSxbXCIjODE2NTdlXCIsXCIjM2VhM2FmXCIsXCIjOWZkOWIzXCIsXCIjZjBmNmI5XCIsXCIjZmYxZDQ0XCJdLFtcIiNmMmVjZGNcIixcIiM1NzQzNDVcIixcIiNlM2RhY2JcIixcIiNjNWZmZTVcIixcIiNmNWVlZDRcIl0sW1wiI2U4NjA4Y1wiLFwiIzcxY2JjNFwiLFwiI2ZmZjlmNFwiLFwiI2NkZDU2ZVwiLFwiI2ZmYmQ2OFwiXSxbXCIjMzgyYTJhXCIsXCIjZmYzZDNkXCIsXCIjZmY5ZDdkXCIsXCIjZTVlYmJjXCIsXCIjOGRjNGI3XCJdLFtcIiNkNWQ4YzdcIixcIiNkNGQ2Y2VcIixcIiNkM2Q1ZDVcIixcIiNkMWQzZGNcIixcIiNkMGQyZTNcIl0sW1wiIzYyMjgyNFwiLFwiIzJmMDYxOFwiLFwiIzQxMmE5Y1wiLFwiIzFiNjZmZlwiLFwiIzAwY2VmNVwiXSxbXCIjMDkyYjVhXCIsXCIjMDk3MzhhXCIsXCIjNzhhODkwXCIsXCIjOWVkMWI3XCIsXCIjZTdkOWI0XCJdLFtcIiMzNjg5ODZcIixcIiNlNzlhMzJcIixcIiNmODQzMzlcIixcIiNkNDBmNjBcIixcIiMwMDVjODFcIl0sW1wiIzE0MGQxYVwiLFwiIzQyMTQyYVwiLFwiI2ZmMmU1ZlwiLFwiI2ZmZDQ1MlwiLFwiI2ZhZWVjYVwiXSxbXCIjZGFjZGFjXCIsXCIjZjM5NzA4XCIsXCIjZjg1NzQxXCIsXCIjMGU5MDk0XCIsXCIjMWUxODAxXCJdLFtcIiNhNmUwOTRcIixcIiNlOGU0OTBcIixcIiNmMDczNjBcIixcIiNiZjJhN2ZcIixcIiM1YzNkNWJcIl0sW1wiIzQ2Mjk0YVwiLFwiI2FkNGM2YlwiLFwiI2UwNzc2N1wiLFwiI2UwYWU2N1wiLFwiI2Q0ZTA2N1wiXSxbXCIjMTAxMDBmXCIsXCIjMjY1MDNjXCIsXCIjODQ5MTEyXCIsXCIjOWQ0ZTBmXCIsXCIjODQwOTQzXCJdLFtcIiNmZjliOGZcIixcIiNlZjc2ODlcIixcIiM5ZTZhOTBcIixcIiM3NjY3ODhcIixcIiM3MTU1NmJcIl0sW1wiIzJiMmMzMFwiLFwiIzM1MzEzYlwiLFwiIzQ1Mzc0NVwiLFwiIzYxM2M0Y1wiLFwiI2ZmMTQ1N1wiXSxbXCIjZWRmZmIzXCIsXCIjOTk5MjhlXCIsXCIjYmZlM2MzXCIsXCIjZGJlZGMyXCIsXCIjZmZmMmQ0XCJdLFtcIiNlMWVkZDFcIixcIiNhYWI2OWJcIixcIiM5ZTkwNmVcIixcIiNiNDc5NDFcIixcIiNjZjM5MWRcIl0sW1wiIzUwNDM3NVwiLFwiIzM5MzI0ZFwiLFwiI2ZmZThlZlwiLFwiI2MyMjU1N1wiLFwiI2VkNTg4N1wiXSxbXCIjZmZmZWM3XCIsXCIjZTFmNWM0XCIsXCIjOWRjOWFjXCIsXCIjOTE5MTY3XCIsXCIjZmY0ZTUwXCJdLFtcIiNlNGZmZDRcIixcIiNlYmU3YTdcIixcIiNlZGM2OGVcIixcIiNhNDllN2VcIixcIiM2ZThmODVcIl0sW1wiIzNkMGE0OVwiLFwiIzUwMTViZFwiLFwiIzAyN2ZlOVwiLFwiIzAwY2FmOFwiLFwiI2UwZGFmN1wiXSxbXCIjYTFhNmFhXCIsXCIjYmQ5MjhiXCIsXCIjZGU3NTcxXCIsXCIjZmY0ZTQ0XCIsXCIjMjgyNjM0XCJdLFtcIiNmMjhhNDlcIixcIiNmN2UzYjJcIixcIiNlMzk2N2RcIixcIiM1NzM0MmRcIixcIiM5ZGJmYTRcIl0sW1wiIzZlYTQ5YlwiLFwiI2Q5ZDBhY1wiLFwiIzZiOGYwYlwiLFwiIzdkM2Y2MFwiLFwiIzM3MmIyZVwiXSxbXCIjMzdhYjk4XCIsXCIjODBiYzk2XCIsXCIjYTZjODhjXCIsXCIjZTFjZThhXCIsXCIjMzcwNTNiXCJdLFtcIiMzMzMyMzdcIixcIiNmYjgzNTFcIixcIiNmZmFkNjRcIixcIiNlOWUyZGFcIixcIiNhZGQ0ZDNcIl0sW1wiI2Q0Y2RjNVwiLFwiIzViODhhNVwiLFwiI2Y0ZjRmMlwiLFwiIzE5MTAxM1wiLFwiIzI0M2E2OVwiXSxbXCIjMjQ0MzRiXCIsXCIjZmMzMjViXCIsXCIjZmE3ZjRiXCIsXCIjYmZiYzg0XCIsXCIjNjM5OTdhXCJdLFtcIiNlNWU2YjhcIixcIiNjNmQ0YjhcIixcIiM2Y2E2YTNcIixcIiM4NTZhNmFcIixcIiM5YzMyNWNcIl0sW1wiI2JlZWQ4MFwiLFwiIzU5ZDk5OVwiLFwiIzMxYWRhMVwiLFwiIzUxNjQ3YVwiLFwiIzQ1M2M1Y1wiXSxbXCIjM2IzMzFmXCIsXCIjZWQ2MzYyXCIsXCIjZmY4ZTY1XCIsXCIjZGNlYjViXCIsXCIjNThjZTc0XCJdLFtcIiNkNmNlOGJcIixcIiM4ZmQwNTNcIixcIiMwMjkwN2RcIixcIiMwMzQ1M2RcIixcIiMyYzEwMDFcIl0sW1wiIzQwMmIzMFwiLFwiI2ZhZGRiNFwiLFwiI2Y0Yzc5MFwiLFwiI2YyOTc3ZVwiLFwiI2JhNjg2OFwiXSxbXCIjYWYxNjJhXCIsXCIjOTUwMDNhXCIsXCIjODMwMDI0XCIsXCIjNWEwZTNkXCIsXCIjNDQwMjFlXCJdLFtcIiNlODFlNGFcIixcIiMwYjFkMjFcIixcIiMwNzhhODVcIixcIiM2OGJhYWJcIixcIiNlZGQ1YzVcIl0sW1wiI2ZiNjA2NlwiLFwiI2ZmZWZjMVwiLFwiI2ZkZDg2ZVwiLFwiI2ZmYTQ2M1wiLFwiI2Y2NmI0MFwiXSxbXCIjZmE3Nzg1XCIsXCIjMjQyMTFhXCIsXCIjZDVkODdkXCIsXCIjYjFkNGI2XCIsXCIjNTNjYmJmXCJdLFtcIiM5Y2Q2YzhcIixcIiNmMWZmY2ZcIixcIiNmOGRmODJcIixcIiNmYWMwNTVcIixcIiNlNTdjM2FcIl0sW1wiIzNiNDM0NFwiLFwiIzUxNjE1YlwiLFwiI2JiYmQ5MVwiLFwiI2YwNmY2YlwiLFwiI2YxMmY1ZFwiXSxbXCIjYjkwMzBmXCIsXCIjOWUwMDA0XCIsXCIjNzAxNjBlXCIsXCIjMTYxOTE3XCIsXCIjZTFlM2RiXCJdLFtcIiNmMmU3ZDJcIixcIiNmNzllYjFcIixcIiNhZThmYmFcIixcIiM0YzVlOTFcIixcIiM0NzM0NjlcIl0sW1wiI2ZmNTI1MlwiLFwiI2ZmNzc1MlwiLFwiI2ZmOWE1MlwiLFwiI2ZmYjc1MlwiLFwiIzVlNDA1YlwiXSxbXCIjYzFkZGM3XCIsXCIjZjVlOGM2XCIsXCIjYmJjZDc3XCIsXCIjZGM4MDUxXCIsXCIjZjRkMjc5XCJdLFtcIiNkZmNjY2NcIixcIiNmZmQzZDNcIixcIiNmZmE0YTRcIixcIiNkMTc4NzhcIixcIiM5NjU5NTlcIl0sW1wiIzU4NWQ1ZFwiLFwiI2UwNmY3MlwiLFwiI2U3YTE3YVwiLFwiI2U0YjE3ZFwiLFwiI2QxY2JjMFwiXSxbXCIjOTJiMmE3XCIsXCIjNmU3YjhjXCIsXCIjYjY5MTk4XCIsXCIjZWZhMDliXCIsXCIjZTdjN2IwXCJdLFtcIiMyNjBkMzNcIixcIiMwMDNmNjlcIixcIiMxMDZiODdcIixcIiMxNTdhOGNcIixcIiNiM2FjYTRcIl0sW1wiIzcyYmFiMFwiLFwiI2YwYzY5Y1wiLFwiI2QxMjg0ZlwiLFwiIzllMGUzMFwiLFwiIzMwMWExYVwiXSxbXCIjMDcwNzA1XCIsXCIjM2U0YjUxXCIsXCIjNmY3MzdlXCIsXCIjODlhMDlhXCIsXCIjYzFjMGFlXCJdLFtcIiM0ZTMxNTBcIixcIiNjNzc3N2ZcIixcIiNiNmRlYzFcIixcIiNkNmVjZGZcIixcIiNmYmY2YjVcIl0sW1wiI2U0YTY5MVwiLFwiI2Y3ZWZkOFwiLFwiI2M4YzhhOVwiLFwiIzU1NjI3MFwiLFwiIzI3MzE0MlwiXSxbXCIjZTY2MjZmXCIsXCIjZWZhZTc4XCIsXCIjZjVlMTljXCIsXCIjYTJjYThlXCIsXCIjNjZhZjkxXCJdLFtcIiNmYmU0YWVcIixcIiNkYWNiOGFcIixcIiM4OTc2MzJcIixcIiMzOTJlMGVcIixcIiM2YmI4OGFcIl0sW1wiIzAyZmNmM1wiLFwiI2E5ZTRjZlwiLFwiI2NhZTBjOFwiLFwiI2RlZGRjNFwiLFwiI2U4ZTdkMlwiXSxbXCIjZDBkY2IzXCIsXCIjZGFiZDkwXCIsXCIjZGY3NjcwXCIsXCIjZjQwNjVlXCIsXCIjODM3ZDcyXCJdLFtcIiNmNWY1ZjVcIixcIiNlOWU5ZTlcIixcIiMwMDY2NjZcIixcIiMwMDg1ODRcIixcIiNjY2NjY2NcIl0sW1wiIzJlYjNhMVwiLFwiIzRmYjM3Y1wiLFwiIzc5YjM2YlwiLFwiI2EyYWI1ZVwiLFwiI2JjYTk1YlwiXSxbXCIjNTk0NzQ3XCIsXCIjNjc0M2E1XCIsXCIjNzM0NWQ2XCIsXCIjMmUyZTJlXCIsXCIjYmZhYjkzXCJdLFtcIiNlZmUyYmZcIixcIiNmNWE0ODlcIixcIiNlZjgxODRcIixcIiNhNzYzNzhcIixcIiNhOGM4OTZcIl0sW1wiIzRlMDMxZVwiLFwiIzVkMmQ0ZVwiLFwiIzVhNGM2ZVwiLFwiIzQ0NzM5MFwiLFwiIzA1YTFhZFwiXSxbXCIjZGIzMDI2XCIsXCIjZTg4YTI1XCIsXCIjZjllMTRiXCIsXCIjZWZlZDg5XCIsXCIjN2FiZjY2XCJdLFtcIiNmN2YzY2ZcIixcIiNjMmU0Y2JcIixcIiMzNmNlY2NcIixcIiMyN2IxYmZcIixcIiMxNzY1ODVcIl0sW1wiIzg3ODI4NlwiLFwiIzg4YjZhM1wiLFwiI2JkYmE5ZVwiLFwiI2UyYzE4ZFwiLFwiI2UyYmI2NFwiXSxbXCIjZmU0OTVmXCIsXCIjZmU5ZDk3XCIsXCIjZmZmZWM4XCIsXCIjZDhmZDk0XCIsXCIjYmRlZDdlXCJdLFtcIiNmYWI5NmJcIixcIiNmMTk0NzRcIixcIiNlYTc3N2JcIixcIiM5NDkxOWFcIixcIiM2OWEyYThcIl0sW1wiIzMyMmYzZVwiLFwiI2U2M2M2ZFwiLFwiI2Y1YjQ5NFwiLFwiI2VkZTdhNVwiLFwiI2FiZGVjYlwiXSxbXCIjYzBiNjk4XCIsXCIjNjQ3ZTM3XCIsXCIjMzAwMDEzXCIsXCIjNmU5YTgxXCIsXCIjZDJjOGE3XCJdLFtcIiMyNTliOWJcIixcIiM2ZmJjYWFcIixcIiNiOGQ2YjBcIixcIiNmZWVkYmZcIixcIiNmZjE5NjRcIl0sW1wiIzE3MTgxZlwiLFwiIzMxNGQ0YVwiLFwiIzBiODc3MFwiLFwiI2E2YzI4OFwiLFwiI2ViZTY4ZFwiXSxbXCIjZTdkZGQzXCIsXCIjYzBjMmJkXCIsXCIjOWM5OTk0XCIsXCIjMjkyNTFjXCIsXCIjZTZhYTlmXCJdLFtcIiNlNzIzMTNcIixcIiNmZmZjZjdcIixcIiM2N2I1ODhcIixcIiM2NWE2NzVcIixcIiMxNDEzMjVcIl0sW1wiIzgwMTI0NVwiLFwiI2Y0ZjRkZFwiLFwiI2RjZGJhZlwiLFwiIzVkNWM0OVwiLFwiIzNkM2QzNFwiXSxbXCIjZjhkYWMyXCIsXCIjZjJhMjk3XCIsXCIjZjQ0MzZmXCIsXCIjY2ExNDQ0XCIsXCIjMTQyNzM4XCJdLFtcIiM2MWQ0YjBcIixcIiM4ZWU2OTZcIixcIiNiYWY3N2NcIixcIiNlOGZmNjVcIixcIiNlY2VkZDVcIl0sW1wiIzg1YjM5NFwiLFwiI2E3YmE1OVwiLFwiI2YwZjBkOFwiLFwiI2YwZDg5MFwiLFwiI2FlMmYyN1wiXSxbXCIjYTY5YTgxXCIsXCIjZTBkM2I4XCIsXCIjZWI5ZTZlXCIsXCIjZWI2ZTZlXCIsXCIjNzA2ZjZiXCJdLFtcIiNlZGI4ODZcIixcIiNmMWM2OTFcIixcIiNmZmU0OThcIixcIiNmOWY5ZjFcIixcIiNiOWE1OGRcIl0sW1wiIzg3YjA5MVwiLFwiI2M0ZDRhYlwiLFwiI2UwZTBiNlwiLFwiIzE3MTQzMFwiLFwiI2VmZjBkNVwiXSxbXCIjM2EzMTMyXCIsXCIjMGY0NTcxXCIsXCIjMzg2ZGJkXCIsXCIjMDA5ZGRkXCIsXCIjMDVkM2Y4XCJdLFtcIiMwMTAzMDBcIixcIiMzMTRjNTNcIixcIiM1YTdmNzhcIixcIiNiYmRlYzZcIixcIiNmN2Y4ZmNcIl0sW1wiIzAyMDMxYVwiLFwiIzAyMWIyYlwiLFwiI2IxMGM0M1wiLFwiI2ZmMDg0MVwiLFwiI2ViZGZjY1wiXSxbXCIjMTEwOTFhXCIsXCIjMmYyZjRkXCIsXCIjNjI2OTcwXCIsXCIjYmFiMTk1XCIsXCIjZThkMThlXCJdLFtcIiM0NjNhMmFcIixcIiM1YzRiMzdcIixcIiNkZGRkOTJcIixcIiM1N2M1YzdcIixcIiMwMGI1YjlcIl0sW1wiI2M5MDMxYVwiLFwiIzlkMTcyMlwiLFwiIzRhMjcyM1wiLFwiIzA3YTJhNlwiLFwiI2ZmZWNjYlwiXSxbXCIjZmY3YzcwXCIsXCIjZjJkZmIxXCIsXCIjYjdjOWE5XCIsXCIjNjc0ZDY5XCIsXCIjMmUyOTJlXCJdLFtcIiNmZmY3ZTVcIixcIiNmZWNkZDBcIixcIiNmOGFmYjhcIixcIiNmNWEzYWZcIixcIiM1OTQ4M2VcIl0sW1wiIzVlMDMyNFwiLFwiIzY5Mjc2NFwiLFwiIzdiNzg5M1wiLFwiIzdmYjFhOFwiLFwiIzk0ZjliZlwiXSxbXCIjYTliYWFlXCIsXCIjZTZkMGIxXCIsXCIjZGViMjk3XCIsXCIjYzk4ZDdiXCIsXCIjOGE2NjYyXCJdLFtcIiM2MzA3MmNcIixcIiM5MTBmNDNcIixcIiNhNjVkNTNcIixcIiNkNTk1MDBcIixcIiNmN2Y3YTFcIl0sW1wiI2ZhMzQxOVwiLFwiI2YzZTFiNlwiLFwiIzdjYmM5YVwiLFwiIzIzOTk4ZVwiLFwiIzFkNWU2OVwiXSxbXCIjNmQxNjVhXCIsXCIjYTAzNDZlXCIsXCIjZWM1YzhkXCIsXCIjZmY4YzkxXCIsXCIjZmZjNGE2XCJdLFtcIiMwMDAwMDBcIixcIiNhNjk2ODJcIixcIiM3ZTk5OTFcIixcIiM3MzczNzNcIixcIiNkODc3MGNcIl0sW1wiI2RlY2JhMFwiLFwiI2EwYWI5NFwiLFwiIzZiOTc5NVwiLFwiIzU5NDQ2MVwiLFwiIzZlMTUzOFwiXSxbXCIjMjQwZjAzXCIsXCIjNGIyNDA5XCIsXCIjYmQ3YTIyXCIsXCIjZTc5MDIyXCIsXCIjZGY2MjFjXCJdLFtcIiNhODlkODdcIixcIiNiYWIxMDBcIixcIiNmOTE2NTlcIixcIiNiMzFkNmFcIixcIiMyZTI0NDRcIl0sW1wiIzBlMDAzNlwiLFwiIzRjMjY0YlwiLFwiI2EwNGY2MlwiLFwiI2QyYTM5MVwiLFwiI2U2ZDdiOFwiXSxbXCIjYjlmOGYwXCIsXCIjYjZkM2E1XCIsXCIjZWU5YjU3XCIsXCIjZWYyYjQxXCIsXCIjMTExMzBlXCJdLFtcIiMxZjA0NDFcIixcIiNmYzEwNjhcIixcIiNmY2FiMTBcIixcIiNmOWNlMDdcIixcIiMwY2UzZThcIl0sW1wiIzJhMDkxY1wiLFwiIzg3NzU4ZlwiLFwiIzg1YWFiMFwiLFwiI2EzYzNiOFwiLFwiI2UzZWRkMlwiXSxbXCIjMzIwMTM5XCIsXCIjMzMxYjNiXCIsXCIjMzMzZTUwXCIsXCIjNWM2ZTZlXCIsXCIjZjFkZWJkXCJdLFtcIiMyMTFjMzNcIixcIiMyYjgxOGNcIixcIiNmZmM5OTRcIixcIiNlZDI4NjBcIixcIiM5OTAwNjlcIl0sW1wiI2NjMDYzZVwiLFwiI2U4MzUzNVwiLFwiI2ZkOTQwN1wiLFwiI2UyZDljMlwiLFwiIzEwODk4YlwiXSxbXCIjZjc1ZTUwXCIsXCIjZWFjNzYxXCIsXCIjZThkZjljXCIsXCIjOTFjMDllXCIsXCIjN2Q3NzY5XCJdLFtcIiNlNWZlYzVcIixcIiNjNWZlYzZcIixcIiNhM2ZlYzdcIixcIiMyOWZmYzlcIixcIiMzOTJhMzVcIl0sW1wiI2UwZWViZFwiLFwiI2RhZTk4YVwiLFwiI2UxNzU3MlwiLFwiI2NlMTQ0NlwiLFwiIzJiMGIxNlwiXSxbXCIjOGZiZmI5XCIsXCIjNjQ5ZWE3XCIsXCIjYmRkYjg4XCIsXCIjZTBmM2IyXCIsXCIjZWVmYWE4XCJdLFtcIiMwNmQ5YjZcIixcIiNhNGY0NzlcIixcIiNkNGQzMjNcIixcIiNkMTM3NzVcIixcIiM5YzNjODZcIl0sW1wiIzFhMGMxMlwiLFwiI2Y3MGE3MVwiLFwiI2ZmZGFhNlwiLFwiI2ZmYjE0NVwiLFwiIzc0YWI5MFwiXSxbXCIjNjQ4Mjg1XCIsXCIjYjRhNjhlXCIsXCIjMDgwZDBkXCIsXCIjZjNkYWFhXCIsXCIjYTNjNGMyXCJdLFtcIiNhNGY3ZDRcIixcIiM5YWUwN2RcIixcIiNhZGEyNDFcIixcIiNhMTM4NjZcIixcIiMzODFjMzBcIl0sW1wiI2ZlZjdkNVwiLFwiI2FiZWU5M1wiLFwiIzJkOTM4ZVwiLFwiIzBiNDQ2MlwiLFwiI2Y3YTQ4YlwiXSxbXCIjMDA2ODZjXCIsXCIjMzJjMmI5XCIsXCIjZWRlY2IzXCIsXCIjZmFkOTI4XCIsXCIjZmY5OTE1XCJdLFtcIiNjYmU0ZWFcIixcIiNlYWQxY2JcIixcIiNhZjljOThcIixcIiM2NTcyNzVcIixcIiMwMDAwMDBcIl0sW1wiI2YzZmZkMlwiLFwiI2JmZjFjZVwiLFwiIzgyYmRhN1wiLFwiIzZlODM3Y1wiLFwiIzJlMDUyN1wiXSxbXCIjNDg0NDUwXCIsXCIjNDY2MDY3XCIsXCIjNDU5YTk2XCIsXCIjMzRiYWFiXCIsXCIjYzRjOGM1XCJdLFtcIiNmYmZmY2NcIixcIiNjYWYyYmVcIixcIiNkZGM5OTZcIixcIiNmNjc5NzVcIixcIiNmMTM1NjVcIl0sW1wiI2Y1ZTNhZVwiLFwiI2ZmZjVkNlwiLFwiI2UxZTZkM1wiLFwiI2IxY2NjNFwiLFwiIzRlNTg2MVwiXSxbXCIjZTM2MDRkXCIsXCIjZDFjOGEzXCIsXCIjYWNiYTlkXCIsXCIjN2I1ZDVlXCIsXCIjYzZhZDcxXCJdLFtcIiMzYjFhMDFcIixcIiNhNWNjN2FcIixcIiNkY2ZmYjZcIixcIiM2MzNiMWNcIixcIiNkYjNjNmVcIl0sW1wiIzAwMDAwMFwiLFwiIzc4OTBhOFwiLFwiIzMwNDg3OFwiLFwiIzE4MTg0OFwiLFwiI2YwYTgxOFwiXSxbXCIjZmZlM2IzXCIsXCIjZmY5YTUyXCIsXCIjZmY1MjUyXCIsXCIjYzkxZTVhXCIsXCIjM2QyOTIyXCJdLFtcIiNiYmFhOWFcIixcIiM4NDliOTVcIixcIiM5MDg1NmZcIixcIiNiNjU1NGNcIixcIiNkODNhMzFcIl0sW1wiI2UyZTJiMlwiLFwiIzQ5ZmVjZlwiLFwiIzM3MDEyOFwiLFwiI2U0MjM1NVwiLFwiI2ZlNzk0NVwiXSxbXCIjZTRlMmFmXCIsXCIjZmZhNTkwXCIsXCIjZTVjYmI0XCIsXCIjZmZmMWQ3XCIsXCIjNTY0MTNlXCJdLFtcIiNmM2I1NzhcIixcIiNmNzgzNzZcIixcIiNkYTRjNjZcIixcIiM4ZjNjNjhcIixcIiMzZjM1NTdcIl0sW1wiI2YyZWNiMFwiLFwiI2ViYjY2N1wiLFwiI2Q2NWM1NlwiLFwiIzgyM2MzY1wiLFwiIzFiMWMyNlwiXSxbXCIjZjFmN2NkXCIsXCIjZDNmN2NkXCIsXCIjYjVmN2NkXCIsXCIjNDAzYTI2XCIsXCIjODE4NzZjXCJdLFtcIiM5OWRiNDlcIixcIiMwNjllOGNcIixcIiMyMTFkMTlcIixcIiM1NzUwNDhcIixcIiM5ZTA2NGFcIl0sW1wiIzhmOTA0NFwiLFwiI2Y4YTUyM1wiLFwiI2ZjODAyMFwiLFwiI2NmMTUwMFwiLFwiIzM1MmYzZFwiXSxbXCIjNGIxNjIzXCIsXCIjNzUyMzNkXCIsXCIjYzQ1OTRiXCIsXCIjZjBiOTZiXCIsXCIjZmRmNTdlXCJdLFtcIiM3ZDY3N2VcIixcIiM0ZjJjNGRcIixcIiMzNjBiNDFcIixcIiNjY2M5YWFcIixcIiNmYWZkZWFcIl0sW1wiI2VlZDQ3ZlwiLFwiI2YyZTBhMFwiLFwiI2Q4ZDhiMlwiLFwiIzhjYjBiMFwiLFwiIzQzMjMzMlwiXSxbXCIjNWMxYjM1XCIsXCIjZDQzZjVkXCIsXCIjZjJhNzcyXCIsXCIjZThkODkwXCIsXCIjZTJlZGI3XCJdLFtcIiM0MDIyM2NcIixcIiM0Mjk4OGZcIixcIiNiMWM1OTJcIixcIiNmMWRkYmFcIixcIiNmYjcxOGFcIl0sW1wiIzdlNjc2MlwiLFwiI2NmNWE2MFwiLFwiI2Y4NWE2OVwiLFwiI2YwYjU5M1wiLFwiI2UzZGZiY1wiXSxbXCIjMzAwZDI4XCIsXCIjNzA2MTVjXCIsXCIjOGNhMzhiXCIsXCIjZjdlZWFhXCIsXCIjZWRiNTUyXCJdLFtcIiNjYWY3MjlcIixcIiM3OWRkN2VcIixcIiMyZWNiYWFcIixcIiMyMWI2YjZcIixcIiM4ODhkZGFcIl0sW1wiI2YzZGRiNlwiLFwiI2Q2YmY5M1wiLFwiIzUzMjcyOFwiLFwiI2NlZDBiYVwiLFwiI2YyZWZjZVwiXSxbXCIjNDEyOTczXCIsXCIjNzUzOTc5XCIsXCIjYjE0NzZkXCIsXCIjZWI5MDY0XCIsXCIjYmVkOWM4XCJdLFtcIiM0ODU4NmZcIixcIiNmZmZmYzBcIixcIiNkNmM0OTZcIixcIiNkNjJlMmVcIixcIiMyODNkM2VcIl0sW1wiIzY4YjJmOFwiLFwiIzUwNmVlNVwiLFwiIzcwMzdjZFwiLFwiIzY1MWY3MVwiLFwiIzFkMGMyMFwiXSxbXCIjYTc4NDhiXCIsXCIjYjg4ZjkzXCIsXCIjZjVkNWM2XCIsXCIjZjllZmQ0XCIsXCIjYjhjYWJlXCJdLFtcIiNmOWViYzRcIixcIiNmZmIzOTFcIixcIiNmYzJmNjhcIixcIiM0NzJmNWZcIixcIiMwODI5NWVcIl0sW1wiIzFmMTkyZlwiLFwiIzJkNjA3M1wiLFwiIzY1YjhhNlwiLFwiI2I1ZThjM1wiLFwiI2YwZjdkYVwiXSxbXCIjZDNjNmNjXCIsXCIjZTJjM2M2XCIsXCIjZWVjZmM0XCIsXCIjZjhlNmM2XCIsXCIjZmZmZmNjXCJdLFtcIiNmOGY4ZDZcIixcIiNiM2M2N2ZcIixcIiM1ZDdlNjJcIixcIiM1MDU5NWNcIixcIiNmYTNlM2VcIl0sW1wiIzcyM2U0ZVwiLFwiI2IwMzg1MVwiLFwiI2VmMzM1M1wiLFwiI2YxNzE0NFwiLFwiI2Y0YjAzNlwiXSxbXCIjYzcwMDNmXCIsXCIjZjkwMDUwXCIsXCIjZjk2YTAwXCIsXCIjZmFhYjAwXCIsXCIjZGFmMjA0XCJdLFtcIiM2NjMzMzNcIixcIiM5OTRkNGRcIixcIiNjYzY2NjZcIixcIiNlNmIyODBcIixcIiNmZmZmOTlcIl0sW1wiIzY2ZmZmZlwiLFwiIzhjYmZlNlwiLFwiI2IzODBjY1wiLFwiI2Q5NDBiM1wiLFwiI2ZmMDA5OVwiXSxbXCIjNjY1YzUyXCIsXCIjNzRiM2E3XCIsXCIjYTNjY2FmXCIsXCIjZTZlMWNmXCIsXCIjY2M1YjE0XCJdLFtcIiM1M2FjNTlcIixcIiMzYjg5NTJcIixcIiMwZjY4NGJcIixcIiMwMzQ4NGNcIixcIiMxYzIzMmVcIl0sW1wiI2ZlYTMwNFwiLFwiIzkwOTMyMFwiLFwiIzEyNWE0NFwiLFwiIzM3MTkyY1wiLFwiIzIyMDMxNVwiXSxbXCIjYzhjZmFlXCIsXCIjOTZiMzk3XCIsXCIjNTI1NTc0XCIsXCIjNWMzZTYyXCIsXCIjOWI1ZjdiXCJdLFtcIiM3NDVlNTBcIixcIiNmZjk0OGJcIixcIiNmZGFmOGFcIixcIiNmY2Q0ODdcIixcIiNmNzk1ODVcIl0sW1wiI2U0YjMwMlwiLFwiIzE1OGZhMlwiLFwiI2RlNGYzYVwiLFwiIzcyMjczMVwiLFwiI2JkMWI0M1wiXSxbXCIjNzlkNmI3XCIsXCIjY2NkNmJkXCIsXCIjZDdjM2FiXCIsXCIjZjBhZmFiXCIsXCIjZjU4Njk2XCJdLFtcIiNkM2IzOTBcIixcIiNiOGEzOGJcIixcIiNhNzhiODNcIixcIiNjNzZiNzlcIixcIiNmMTQxNmJcIl0sW1wiI2Y0ZmNiOFwiLFwiI2RhZTY4MVwiLFwiIzk1YTg2OFwiLFwiIzQ1MmMxOFwiLFwiI2NjNzI1NFwiXSxbXCIjNTI0OTNhXCIsXCIjN2M4NTY5XCIsXCIjYTRhYjgwXCIsXCIjZThlMGFlXCIsXCIjZGU3MzNlXCJdLFtcIiMxMTExMTNcIixcIiNkMTg2ODFcIixcIiNhY2JmYjdcIixcIiNmNmViZGRcIixcIiM4ZTZkODZcIl0sW1wiIzUyYmFhN1wiLFwiIzcxOGY4NVwiLFwiI2JhNTI1MlwiLFwiI2ZjMGY1MlwiLFwiI2ZjM2Q3M1wiXSxbXCIjZWRhYjhiXCIsXCIjZjVlYmIwXCIsXCIjZGFkMDYxXCIsXCIjYWNjNTlkXCIsXCIjNzc2YzVhXCJdLFtcIiMwYjExMGRcIixcIiMyYzRkNTZcIixcIiNjM2FhNzJcIixcIiNkYzc2MTJcIixcIiNiZDMyMDBcIl0sW1wiIzVhMzcyY1wiLFwiIzhiOGI3MFwiLFwiIzk4YzdiMFwiLFwiI2YwZjBkOFwiLFwiI2M5NGIwY1wiXSxbXCIjZWJlNWNlXCIsXCIjY2VkMWMwXCIsXCIjYmFkMWM5XCIsXCIjOGMxNjJhXCIsXCIjNjYwMDIyXCJdLFtcIiMwOTBmMTNcIixcIiMxNzFmMjVcIixcIiM3NTJlMmJcIixcIiNjOTBhMDJcIixcIiNmMmVhYjdcIl0sW1wiIzllZDk5ZVwiLFwiI2YwZGRhNlwiLFwiI2ViNjQyN1wiLFwiI2ViMjE0ZVwiLFwiIzFhMTYyM1wiXSxbXCIjODY1YTE5XCIsXCIjYzRiMjgyXCIsXCIjODUwMDViXCIsXCIjNTIwNjQ3XCIsXCIjMGUwMDJmXCJdLFtcIiM1NDU0NTRcIixcIiM3YjhhODRcIixcIiM4Y2JmYWZcIixcIiNlZGU3ZDVcIixcIiNiN2NjMThcIl0sW1wiI2ZiNTczYlwiLFwiIzRmMzkzY1wiLFwiIzhlYTg4ZFwiLFwiIzljZDBhY1wiLFwiI2Y0ZWI5ZVwiXSxbXCIjZTVlNWU1XCIsXCIjZjFkYmRhXCIsXCIjZmNkMGNmXCIsXCIjY2ZiZGJmXCIsXCIjYTJhOWFmXCJdLFtcIiNmZmRlYjNcIixcIiM3M2JjOTFcIixcIiMzNDIyMjBcIixcIiNmYzM3MGNcIixcIiNmZjg3MTZcIl0sW1wiI2NjY2M2NlwiLFwiI2E2YmY3M1wiLFwiIzgwYjM4MFwiLFwiIzU5YTY4Y1wiLFwiIzMzOTk5OVwiXSxbXCIjNTc0ZDRmXCIsXCIjZmZmZmZmXCIsXCIjOTY5MDkxXCIsXCIjZmZlOTk5XCIsXCIjZmZkOTUyXCJdLFtcIiM1ZjU0NWNcIixcIiNlYjcwNzJcIixcIiNmNWJhOTBcIixcIiNmNWUyYjhcIixcIiNhMmNhYTVcIl0sW1wiIzVlNTQ3M1wiLFwiIzE5YjVhNVwiLFwiI2VkZTg5ZFwiLFwiI2ZmNjkzM1wiLFwiI2ZmMDA0OFwiXSxbXCIjZWRkOGJiXCIsXCIjZTJhYTg3XCIsXCIjZmVmN2UxXCIsXCIjYTJkM2M3XCIsXCIjZWY4ZTdkXCJdLFtcIiNjZWViZDFcIixcIiNiNmRlYjlcIixcIiNiMWNjYjRcIixcIiNhZWJmYWZcIixcIiNhNmFkYTdcIl0sW1wiIzMzMmQyN1wiLFwiIzhhMDAxNVwiLFwiI2UzMDIyNFwiLFwiIzg1NzI1ZlwiLFwiI2ZhZTFjMFwiXSxbXCIjZmRlZmIwXCIsXCIjZTdhOGIxXCIsXCIjYjk5OGIzXCIsXCIjNzc3NzlkXCIsXCIjNDc3MWEzXCJdLFtcIiM0NzMzMzRcIixcIiNiM2M4YTdcIixcIiNmZmViYjlcIixcIiNlMzUzNmNcIixcIiNkYTFhMjlcIl0sW1wiI2ZiYjQ5OFwiLFwiI2Y4YzY4MVwiLFwiI2JlYzQ3ZVwiLFwiIzliYjc4ZlwiLFwiIzk4OTA4ZFwiXSxbXCIjZGFlNWFiXCIsXCIjZTlhMzg1XCIsXCIjZmExNTRiXCIsXCIjODczMTNmXCIsXCIjNjA0ZTQ4XCJdLFtcIiM5ZDkzODJcIixcIiNmZmMxYjJcIixcIiNmZmRiYzhcIixcIiNmZmY2YzdcIixcIiNkY2Q3YzJcIl0sW1wiI2NkYjI4YVwiLFwiI2Y5ZjRlM1wiLFwiI2Q0ZGRiMVwiLFwiI2IxYmE4ZVwiLFwiIzdhNjQ0OFwiXSxbXCIjZmY1NDhmXCIsXCIjOTA2MWMyXCIsXCIjYmU4MGZmXCIsXCIjNjNkM2ZmXCIsXCIjMDI3NzllXCJdLFtcIiMyMTAyMTBcIixcIiNlZTI4NTNcIixcIiMyYjAyMTVcIixcIiM4ZjJmNDVcIixcIiNkMjRkNmNcIl0sW1wiIzM4MzkzOVwiLFwiIzE0OWM2OFwiLFwiIzM4Yzk1OFwiLFwiI2FlZTYzN1wiLFwiI2ZmZmVkYlwiXSxbXCIjYmZlMGMwXCIsXCIjMTYwOTIxXCIsXCIjZjA2ZTc1XCIsXCIjZjJhZjYwXCIsXCIjZDBkMjZmXCJdLFtcIiMzYjIzNGFcIixcIiM1MjM5NjFcIixcIiNiYWFmYzRcIixcIiNjM2JiYzlcIixcIiNkNGM3YmZcIl0sW1wiI2M5NWM3YVwiLFwiI2RlOTE1M1wiLFwiI2Q2ZDY0NFwiLFwiI2RjZWJhZlwiLFwiIzE0ODg4YlwiXSxbXCIjZmZmZmVhXCIsXCIjYTc5NWE1XCIsXCIjN2E5NTllXCIsXCIjNDI0ZTVlXCIsXCIjM2IyYjQ2XCJdLFtcIiNhZGRmZDNcIixcIiNlYWUzZDBcIixcIiNkYmM0YjZcIixcIiNmZmE1YWFcIixcIiNlZmQ1YzRcIl0sW1wiI2YwYzBhOFwiLFwiI2YwZDhhOFwiLFwiI2E4YzA5MFwiLFwiIzc4OTA5MFwiLFwiIzc4Nzg3OFwiXSxbXCIjZjBmMGYwXCIsXCIjZDhkOGQ4XCIsXCIjYzBjMGE4XCIsXCIjNjA0ODQ4XCIsXCIjNDg0ODQ4XCJdLFtcIiMwMDAwMDBcIixcIiMxNjkzYTVcIixcIiNkOGQ4YzBcIixcIiNmMGYwZDhcIixcIiNmZmZmZmZcIl0sW1wiI2ZmMWQ0NFwiLFwiI2ZiZWJhZlwiLFwiIzc0YmY5ZFwiLFwiIzU2YTI5MlwiLFwiIzFjODA4MFwiXSxbXCIjYWUwYzNlXCIsXCIjYWZjY2E4XCIsXCIjZjVlZWMzXCIsXCIjYzdiMjk5XCIsXCIjMzMyMTFjXCJdLFtcIiNmZjg0ODJcIixcIiNmZmIyOTRcIixcIiNmOGQ4YTVcIixcIiM5MWJlOTVcIixcIiM2MzVhNDlcIl0sW1wiIzAwMDAwMFwiLFwiIzhmMTQxNFwiLFwiI2U1MGUwZVwiLFwiI2YzNDUwZlwiLFwiI2ZjYWMwM1wiXSxbXCIjYTg4OTE0XCIsXCIjOTFhNTY2XCIsXCIjYmVkMDg0XCIsXCIjZTllMTk5XCIsXCIjZmFlZGNhXCJdLFtcIiNlZGRiYzRcIixcIiNhM2M5YTdcIixcIiNmZmIzNTNcIixcIiNmZjZlNGFcIixcIiM1YzUyNTlcIl0sW1wiIzQxMzI0OVwiLFwiI2NjYzU5MVwiLFwiI2UyYjI0Y1wiLFwiI2ViNzgzZlwiLFwiI2ZmNDI2YVwiXSxbXCIjMzcxOTNiXCIsXCIjZTc1YTdhXCIsXCIjZjU5Mjc1XCIsXCIjZjVjMjczXCIsXCIjYWViMzk1XCJdLFtcIiM4ODA2MDZcIixcIiNkNTNkMGNcIixcIiNmZjgyMDdcIixcIiMyMzFkMWVcIixcIiNmY2ZjZmNcIl0sW1wiI2JhZDNjNlwiLFwiI2Y5ZDlhY1wiLFwiI2ZjYTQ4M1wiLFwiI2YxODg4NlwiLFwiIzdiNzA2NlwiXSxbXCIjZThkN2E5XCIsXCIjOGVhYTk0XCIsXCIjNmI2NjZkXCIsXCIjNmMzNzUxXCIsXCIjNTIyMjNjXCJdLFtcIiNlNmU2ZTZcIixcIiNhYWU2ZDlcIixcIiNjOGNiYzFcIixcIiNlNmIwYWFcIixcIiNhMWExYTFcIl0sW1wiIzNiM2Y0OVwiLFwiI2ZkZmFlYlwiLFwiI2ZhZWRkZlwiLFwiI2YzYzZiOVwiLFwiI2Y3YTI5ZVwiXSxbXCIjMzk0NzM2XCIsXCIjNjk2YjQ2XCIsXCIjYjk5NTU1XCIsXCIjYTg0NjJkXCIsXCIjNWM1ODRjXCJdLFtcIiNmMjNlMDJcIixcIiNmZWY1YzhcIixcIiMwMDk4OGRcIixcIiMyYzZiNzRcIixcIiMwMTM3NTBcIl0sW1wiI2YwNWM1NFwiLFwiI2ExNzQ1N1wiLFwiIzVjNzM1ZVwiLFwiIzNkNjE1YlwiLFwiIzQzNDI0N1wiXSxbXCIjY2NlNGQxXCIsXCIjZDJlMWE3XCIsXCIjZDhkZTdkXCIsXCIjZGVkYjUzXCIsXCIjZTRkODI5XCJdLFtcIiNjNWY3ZjBcIixcIiNhOWMyYzlcIixcIiM4ZThjYTNcIixcIiM3MjU3N2NcIixcIiM1NjIxNTVcIl0sW1wiI2ZjYmY2YlwiLFwiI2E5YWQ5NFwiLFwiIzQyMzAyZVwiLFwiI2Y2ZGFhYlwiLFwiI2RhYmQ3YlwiXSxbXCIjNDg0ODQ4XCIsXCIjMDA2NDY1XCIsXCIjMGY5MjhjXCIsXCIjMDBjOWQyXCIsXCIjYmVlZTNiXCJdLFtcIiNlMGRhOTZcIixcIiNiYWRkYTNcIixcIiM5NGUwYjBcIixcIiNhNmI1YWVcIixcIiNiODhiYWRcIl0sW1wiI2UxYzc4Y1wiLFwiI2VkYTAxMVwiLFwiI2RiNjUxNlwiLFwiIzdhNjk0OVwiLFwiI2FkYWQ4ZVwiXSxbXCIjZWI0NDViXCIsXCIjZjU5MzhiXCIsXCIjZjBjZGFiXCIsXCIjZjFlN2M1XCIsXCIjYjZkNGJiXCJdLFtcIiNjMGQ4OGNcIixcIiNmN2E0NzJcIixcIiNmMDc4NzdcIixcIiNmYTJhM2FcIixcIiMwYTVjNWFcIl0sW1wiI2QwY2Y3NVwiLFwiI2Y4NzY0ZVwiLFwiI2RhMjY0NFwiLFwiIzkwMDQ0YVwiLFwiIzQ0MGEyYVwiXSxbXCIjZTY1NDZiXCIsXCIjZGE4ZjcyXCIsXCIjZmZlNzkyXCIsXCIjYzlkYWE0XCIsXCIjOGFjYmI1XCJdLFtcIiNmOGY0YzRcIixcIiNkNWUwYjVcIixcIiNhNWMzYTdcIixcIiM2ZDhiODlcIixcIiM0NzY2N2JcIl0sW1wiIzNlMzQzM1wiLFwiI2YwN2Y4M1wiLFwiI2IyOWE3OFwiLFwiIzllYWY4M1wiLFwiIzc1YTQ4MFwiXSxbXCIjYzViODlmXCIsXCIjZmVmZmQ0XCIsXCIjOWUyZDRhXCIsXCIjNDUwYjFlXCIsXCIjMjEwMDBmXCJdLFtcIiM1ZTFmMjhcIixcIiM4YTJmMmVcIixcIiNhZTU1NDNcIixcIiNmN2JiNzVcIixcIiM4Mzc2NGNcIl0sW1wiI2ViN2Y3ZlwiLFwiI2ViOWE3ZlwiLFwiI2ViYjU3ZlwiLFwiI2ViZDA3ZlwiLFwiI2ViZWI3ZlwiXSxbXCIjZmNiZjZiXCIsXCIjZTU4NjM0XCIsXCIjNjU3YTM4XCIsXCIjYWZhYjUwXCIsXCIjYTljY2I5XCJdLFtcIiNjZWUxZDhcIixcIiNmNmVlZTBcIixcIiNmZGE2NjRcIixcIiNmMDQ4NDJcIixcIiM4MzU2M2ZcIl0sW1wiI2UwZDFlZFwiLFwiI2YwYjljZlwiLFwiI2U2M2M4MFwiLFwiI2M3MDQ1MlwiLFwiIzRiMDA0Y1wiXSxbXCIjNjgwYTFkXCIsXCIjM2YxNzE5XCIsXCIjZmNlZjljXCIsXCIjZThiNjY2XCIsXCIjYmEyMzM5XCJdLFtcIiMzNDM2MzVcIixcIiNkOTAwNTdcIixcIiNlODg3MDBcIixcIiM3N2I4YTZcIixcIiNmZmUyYmFcIl0sW1wiIzE4NWI2M1wiLFwiI2MwMjYxY1wiLFwiI2JhNDYwZFwiLFwiI2M1OTUzOFwiLFwiIzQwNDA0MFwiXSxbXCIjY2I3Y2EyXCIsXCIjZWQ5ZGExXCIsXCIjYzllNWFmXCIsXCIjZGNlZWIxXCIsXCIjZmVmOWY2XCJdLFtcIiMwZDBmMzZcIixcIiMyOTQzODBcIixcIiM2OWQyY2RcIixcIiNiOWYxZDZcIixcIiNmMWY2Y2VcIl0sW1wiI2M5YjhhOFwiLFwiI2Y4YWY4Y1wiLFwiI2EyNGQ1MlwiLFwiIzVhMzA0NFwiLFwiIzM5MWQzNFwiXSxbXCIjZmFlZmMyXCIsXCIjYTRhYzlkXCIsXCIjYTI3ODc5XCIsXCIjYTQ2MjZjXCIsXCIjZjA1ZDc3XCJdLFtcIiM1YjFkOTlcIixcIiMwMDc0YjRcIixcIiMwMGIzNGNcIixcIiNmZmQ0MWZcIixcIiNmYzZlM2RcIl0sW1wiIzA3OWVhNlwiLFwiIzFlMGM0MlwiLFwiI2YwMDc3YlwiLFwiI2Y1YmU1OFwiLFwiI2UzZTBiM1wiXSxbXCIjZTQ2ZDI5XCIsXCIjYmE0YzU3XCIsXCIjNGUzYTNiXCIsXCIjYTU5NTcxXCIsXCIjZDBiYzg3XCJdLFtcIiNmMmVhYmNcIixcIiM1NDczNmVcIixcIiMxOTQ3NTZcIixcIiMwODAwMDBcIixcIiNmZjNiNThcIl0sW1wiI2UyZDlkYlwiLFwiI2YyZTVmOVwiLFwiI2Q5ZTFkZlwiLFwiI2ZmOGE4NFwiLFwiI2ZlNjc2M1wiXSxbXCIjZjNkNTk3XCIsXCIjYjZkODljXCIsXCIjOTJjY2I2XCIsXCIjZjg3ODg3XCIsXCIjOWU2YjdjXCJdLFtcIiNlNmFjODRcIixcIiNhZDk5NzhcIixcIiM2MTkxNzdcIixcIiMxNjE2MThcIixcIiM1OTRjMmFcIl0sW1wiI2VlZTVkNlwiLFwiIzhmMDAwNlwiLFwiIzAwMDAwMFwiLFwiIzkzOTE4NVwiLFwiIzk4YTVhZFwiXSxbXCIjYmY5Zjg4XCIsXCIjZThjOGExXCIsXCIjZmNlNGJlXCIsXCIjZjZhNjhkXCIsXCIjZjk2MTUzXCJdLFtcIiNmZmJkODdcIixcIiNmZmQ3OTFcIixcIiNmN2U4YTZcIixcIiNkOWU4YWVcIixcIiNiZmUzYzBcIl0sW1wiI2U0ZTZjOVwiLFwiI2U2ZGFjNlwiLFwiI2Q2YzNiOVwiLFwiI2MyYjQ4YVwiLFwiI2IzNzg4M1wiXSxbXCIjMmIyODIzXCIsXCIjOGZhNjkxXCIsXCIjZDRjZWFhXCIsXCIjZjlmYWRjXCIsXCIjY2MzOTE3XCJdLFtcIiNlODRkNWJcIixcIiNlYWUyY2ZcIixcIiNiNGNjYjlcIixcIiMyNjk3OWZcIixcIiMzYjNiM2JcIl0sW1wiIzRkNDI1MFwiLFwiI2I2NmU2ZlwiLFwiI2NmODg4NFwiLFwiI2U2YTk3MlwiLFwiI2Y2ZDE2OVwiXSxbXCIjMTE2NjVmXCIsXCIjNTk5NDc2XCIsXCIjZTRkNjczXCIsXCIjZWI2MjRmXCIsXCIjYWMxNTFjXCJdLFtcIiM1YzQxNTJcIixcIiNiNDU4NWRcIixcIiNkOTdmNzZcIixcIiNmN2QwYTlcIixcIiNhMWMwYWVcIl0sW1wiIzU4NzA2ZFwiLFwiIzRiNTc1N1wiLFwiIzdjOGE2ZVwiLFwiI2IwYjA4N1wiLFwiI2UzZTNkMVwiXSxbXCIjZjRlMWI4XCIsXCIjOWVjN2I3XCIsXCIjYWNhYTliXCIsXCIjYTU4MjZlXCIsXCIjN2U1MTRiXCJdLFtcIiNlZGU1Y2VcIixcIiNmZGY2ZTZcIixcIiNmZmUyYmFcIixcIiNmNGI1OGFcIixcIiNmN2ExNjhcIl0sW1wiI2ZmMjEyMVwiLFwiI2ZkOWE0MlwiLFwiI2MyZmM2M1wiLFwiI2JjZjdlZlwiLFwiI2Q3ZWVmYVwiXSxbXCIjODA2ODM1XCIsXCIjZjdmMWNkXCIsXCIjNmI5ZThiXCIsXCIjYTYyMTIxXCIsXCIjMTMwZDBkXCJdLFtcIiNkOWQ3NjZcIixcIiNjNWMzNzZcIixcIiNhNDhiODZcIixcIiM4NDU2N2FcIixcIiM2NDMyNjNcIl0sW1wiIzZjMzk0OFwiLFwiI2JhNWY2ZVwiLFwiI2NjOGM4MlwiLFwiI2RlZDc4N1wiLFwiI2Y5ZWFiZlwiXSxbXCIjODU1ZjMwXCIsXCIjOWVjODlhXCIsXCIjZWFiYTY4XCIsXCIjZmY1MjQ4XCIsXCIjZjZmZmIzXCJdLFtcIiNkM2Y3ZTlcIixcIiNmY2YzZDJcIixcIiNmYmNmODZcIixcIiNmYTdmNDZcIixcIiNkZDQ1MzhcIl0sW1wiI2MzZTZkNFwiLFwiI2Y0ZjBlNVwiLFwiI2UwYzRhZVwiLFwiI2UxOTE4ZVwiLFwiI2UxNWU2ZVwiXSxbXCIjZDkyZDdhXCIsXCIjY2Q0NDcyXCIsXCIjYzI1YzZhXCIsXCIjYjc3NDYzXCIsXCIjYWM4YzVlXCJdXSIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciB3aWR0aCA9IDI1NjsvLyBlYWNoIFJDNCBvdXRwdXQgaXMgMCA8PSB4IDwgMjU2XHJcbnZhciBjaHVua3MgPSA2Oy8vIGF0IGxlYXN0IHNpeCBSQzQgb3V0cHV0cyBmb3IgZWFjaCBkb3VibGVcclxudmFyIGRpZ2l0cyA9IDUyOy8vIHRoZXJlIGFyZSA1MiBzaWduaWZpY2FudCBkaWdpdHMgaW4gYSBkb3VibGVcclxudmFyIHBvb2wgPSBbXTsvLyBwb29sOiBlbnRyb3B5IHBvb2wgc3RhcnRzIGVtcHR5XHJcbnZhciBHTE9CQUwgPSB0eXBlb2YgZ2xvYmFsID09PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IGdsb2JhbDtcclxuXHJcbi8vXHJcbi8vIFRoZSBmb2xsb3dpbmcgY29uc3RhbnRzIGFyZSByZWxhdGVkIHRvIElFRUUgNzU0IGxpbWl0cy5cclxuLy9cclxudmFyIHN0YXJ0ZGVub20gPSBNYXRoLnBvdyh3aWR0aCwgY2h1bmtzKSxcclxuICAgIHNpZ25pZmljYW5jZSA9IE1hdGgucG93KDIsIGRpZ2l0cyksXHJcbiAgICBvdmVyZmxvdyA9IHNpZ25pZmljYW5jZSAqIDIsXHJcbiAgICBtYXNrID0gd2lkdGggLSAxO1xyXG5cclxuXHJcbnZhciBvbGRSYW5kb20gPSBNYXRoLnJhbmRvbTtcclxuXHJcbi8vXHJcbi8vIHNlZWRyYW5kb20oKVxyXG4vLyBUaGlzIGlzIHRoZSBzZWVkcmFuZG9tIGZ1bmN0aW9uIGRlc2NyaWJlZCBhYm92ZS5cclxuLy9cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzZWVkLCBvcHRpb25zKSB7XHJcbiAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5nbG9iYWwgPT09IHRydWUpIHtcclxuICAgIG9wdGlvbnMuZ2xvYmFsID0gZmFsc2U7XHJcbiAgICBNYXRoLnJhbmRvbSA9IG1vZHVsZS5leHBvcnRzKHNlZWQsIG9wdGlvbnMpO1xyXG4gICAgb3B0aW9ucy5nbG9iYWwgPSB0cnVlO1xyXG4gICAgcmV0dXJuIE1hdGgucmFuZG9tO1xyXG4gIH1cclxuICB2YXIgdXNlX2VudHJvcHkgPSAob3B0aW9ucyAmJiBvcHRpb25zLmVudHJvcHkpIHx8IGZhbHNlO1xyXG4gIHZhciBrZXkgPSBbXTtcclxuXHJcbiAgLy8gRmxhdHRlbiB0aGUgc2VlZCBzdHJpbmcgb3IgYnVpbGQgb25lIGZyb20gbG9jYWwgZW50cm9weSBpZiBuZWVkZWQuXHJcbiAgdmFyIHNob3J0c2VlZCA9IG1peGtleShmbGF0dGVuKFxyXG4gICAgdXNlX2VudHJvcHkgPyBbc2VlZCwgdG9zdHJpbmcocG9vbCldIDpcclxuICAgIDAgaW4gYXJndW1lbnRzID8gc2VlZCA6IGF1dG9zZWVkKCksIDMpLCBrZXkpO1xyXG5cclxuICAvLyBVc2UgdGhlIHNlZWQgdG8gaW5pdGlhbGl6ZSBhbiBBUkM0IGdlbmVyYXRvci5cclxuICB2YXIgYXJjNCA9IG5ldyBBUkM0KGtleSk7XHJcblxyXG4gIC8vIE1peCB0aGUgcmFuZG9tbmVzcyBpbnRvIGFjY3VtdWxhdGVkIGVudHJvcHkuXHJcbiAgbWl4a2V5KHRvc3RyaW5nKGFyYzQuUyksIHBvb2wpO1xyXG5cclxuICAvLyBPdmVycmlkZSBNYXRoLnJhbmRvbVxyXG5cclxuICAvLyBUaGlzIGZ1bmN0aW9uIHJldHVybnMgYSByYW5kb20gZG91YmxlIGluIFswLCAxKSB0aGF0IGNvbnRhaW5zXHJcbiAgLy8gcmFuZG9tbmVzcyBpbiBldmVyeSBiaXQgb2YgdGhlIG1hbnRpc3NhIG9mIHRoZSBJRUVFIDc1NCB2YWx1ZS5cclxuXHJcbiAgcmV0dXJuIGZ1bmN0aW9uKCkgeyAgICAgICAgIC8vIENsb3N1cmUgdG8gcmV0dXJuIGEgcmFuZG9tIGRvdWJsZTpcclxuICAgIHZhciBuID0gYXJjNC5nKGNodW5rcyksICAgICAgICAgICAgIC8vIFN0YXJ0IHdpdGggYSBudW1lcmF0b3IgbiA8IDIgXiA0OFxyXG4gICAgICAgIGQgPSBzdGFydGRlbm9tLCAgICAgICAgICAgICAgICAgLy8gICBhbmQgZGVub21pbmF0b3IgZCA9IDIgXiA0OC5cclxuICAgICAgICB4ID0gMDsgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgYW5kIG5vICdleHRyYSBsYXN0IGJ5dGUnLlxyXG4gICAgd2hpbGUgKG4gPCBzaWduaWZpY2FuY2UpIHsgICAgICAgICAgLy8gRmlsbCB1cCBhbGwgc2lnbmlmaWNhbnQgZGlnaXRzIGJ5XHJcbiAgICAgIG4gPSAobiArIHgpICogd2lkdGg7ICAgICAgICAgICAgICAvLyAgIHNoaWZ0aW5nIG51bWVyYXRvciBhbmRcclxuICAgICAgZCAqPSB3aWR0aDsgICAgICAgICAgICAgICAgICAgICAgIC8vICAgZGVub21pbmF0b3IgYW5kIGdlbmVyYXRpbmcgYVxyXG4gICAgICB4ID0gYXJjNC5nKDEpOyAgICAgICAgICAgICAgICAgICAgLy8gICBuZXcgbGVhc3Qtc2lnbmlmaWNhbnQtYnl0ZS5cclxuICAgIH1cclxuICAgIHdoaWxlIChuID49IG92ZXJmbG93KSB7ICAgICAgICAgICAgIC8vIFRvIGF2b2lkIHJvdW5kaW5nIHVwLCBiZWZvcmUgYWRkaW5nXHJcbiAgICAgIG4gLz0gMjsgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGxhc3QgYnl0ZSwgc2hpZnQgZXZlcnl0aGluZ1xyXG4gICAgICBkIC89IDI7ICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICByaWdodCB1c2luZyBpbnRlZ2VyIE1hdGggdW50aWxcclxuICAgICAgeCA+Pj49IDE7ICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgd2UgaGF2ZSBleGFjdGx5IHRoZSBkZXNpcmVkIGJpdHMuXHJcbiAgICB9XHJcbiAgICByZXR1cm4gKG4gKyB4KSAvIGQ7ICAgICAgICAgICAgICAgICAvLyBGb3JtIHRoZSBudW1iZXIgd2l0aGluIFswLCAxKS5cclxuICB9O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMucmVzZXRHbG9iYWwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgTWF0aC5yYW5kb20gPSBvbGRSYW5kb207XHJcbn07XHJcblxyXG4vL1xyXG4vLyBBUkM0XHJcbi8vXHJcbi8vIEFuIEFSQzQgaW1wbGVtZW50YXRpb24uICBUaGUgY29uc3RydWN0b3IgdGFrZXMgYSBrZXkgaW4gdGhlIGZvcm0gb2ZcclxuLy8gYW4gYXJyYXkgb2YgYXQgbW9zdCAod2lkdGgpIGludGVnZXJzIHRoYXQgc2hvdWxkIGJlIDAgPD0geCA8ICh3aWR0aCkuXHJcbi8vXHJcbi8vIFRoZSBnKGNvdW50KSBtZXRob2QgcmV0dXJucyBhIHBzZXVkb3JhbmRvbSBpbnRlZ2VyIHRoYXQgY29uY2F0ZW5hdGVzXHJcbi8vIHRoZSBuZXh0IChjb3VudCkgb3V0cHV0cyBmcm9tIEFSQzQuICBJdHMgcmV0dXJuIHZhbHVlIGlzIGEgbnVtYmVyIHhcclxuLy8gdGhhdCBpcyBpbiB0aGUgcmFuZ2UgMCA8PSB4IDwgKHdpZHRoIF4gY291bnQpLlxyXG4vL1xyXG4vKiogQGNvbnN0cnVjdG9yICovXHJcbmZ1bmN0aW9uIEFSQzQoa2V5KSB7XHJcbiAgdmFyIHQsIGtleWxlbiA9IGtleS5sZW5ndGgsXHJcbiAgICAgIG1lID0gdGhpcywgaSA9IDAsIGogPSBtZS5pID0gbWUuaiA9IDAsIHMgPSBtZS5TID0gW107XHJcblxyXG4gIC8vIFRoZSBlbXB0eSBrZXkgW10gaXMgdHJlYXRlZCBhcyBbMF0uXHJcbiAgaWYgKCFrZXlsZW4pIHsga2V5ID0gW2tleWxlbisrXTsgfVxyXG5cclxuICAvLyBTZXQgdXAgUyB1c2luZyB0aGUgc3RhbmRhcmQga2V5IHNjaGVkdWxpbmcgYWxnb3JpdGhtLlxyXG4gIHdoaWxlIChpIDwgd2lkdGgpIHtcclxuICAgIHNbaV0gPSBpKys7XHJcbiAgfVxyXG4gIGZvciAoaSA9IDA7IGkgPCB3aWR0aDsgaSsrKSB7XHJcbiAgICBzW2ldID0gc1tqID0gbWFzayAmIChqICsga2V5W2kgJSBrZXlsZW5dICsgKHQgPSBzW2ldKSldO1xyXG4gICAgc1tqXSA9IHQ7XHJcbiAgfVxyXG5cclxuICAvLyBUaGUgXCJnXCIgbWV0aG9kIHJldHVybnMgdGhlIG5leHQgKGNvdW50KSBvdXRwdXRzIGFzIG9uZSBudW1iZXIuXHJcbiAgKG1lLmcgPSBmdW5jdGlvbihjb3VudCkge1xyXG4gICAgLy8gVXNpbmcgaW5zdGFuY2UgbWVtYmVycyBpbnN0ZWFkIG9mIGNsb3N1cmUgc3RhdGUgbmVhcmx5IGRvdWJsZXMgc3BlZWQuXHJcbiAgICB2YXIgdCwgciA9IDAsXHJcbiAgICAgICAgaSA9IG1lLmksIGogPSBtZS5qLCBzID0gbWUuUztcclxuICAgIHdoaWxlIChjb3VudC0tKSB7XHJcbiAgICAgIHQgPSBzW2kgPSBtYXNrICYgKGkgKyAxKV07XHJcbiAgICAgIHIgPSByICogd2lkdGggKyBzW21hc2sgJiAoKHNbaV0gPSBzW2ogPSBtYXNrICYgKGogKyB0KV0pICsgKHNbal0gPSB0KSldO1xyXG4gICAgfVxyXG4gICAgbWUuaSA9IGk7IG1lLmogPSBqO1xyXG4gICAgcmV0dXJuIHI7XHJcbiAgICAvLyBGb3Igcm9idXN0IHVucHJlZGljdGFiaWxpdHkgZGlzY2FyZCBhbiBpbml0aWFsIGJhdGNoIG9mIHZhbHVlcy5cclxuICAgIC8vIFNlZSBodHRwOi8vd3d3LnJzYS5jb20vcnNhbGFicy9ub2RlLmFzcD9pZD0yMDA5XHJcbiAgfSkod2lkdGgpO1xyXG59XHJcblxyXG4vL1xyXG4vLyBmbGF0dGVuKClcclxuLy8gQ29udmVydHMgYW4gb2JqZWN0IHRyZWUgdG8gbmVzdGVkIGFycmF5cyBvZiBzdHJpbmdzLlxyXG4vL1xyXG5mdW5jdGlvbiBmbGF0dGVuKG9iaiwgZGVwdGgpIHtcclxuICB2YXIgcmVzdWx0ID0gW10sIHR5cCA9ICh0eXBlb2Ygb2JqKVswXSwgcHJvcDtcclxuICBpZiAoZGVwdGggJiYgdHlwID09ICdvJykge1xyXG4gICAgZm9yIChwcm9wIGluIG9iaikge1xyXG4gICAgICB0cnkgeyByZXN1bHQucHVzaChmbGF0dGVuKG9ialtwcm9wXSwgZGVwdGggLSAxKSk7IH0gY2F0Y2ggKGUpIHt9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiAocmVzdWx0Lmxlbmd0aCA/IHJlc3VsdCA6IHR5cCA9PSAncycgPyBvYmogOiBvYmogKyAnXFwwJyk7XHJcbn1cclxuXHJcbi8vXHJcbi8vIG1peGtleSgpXHJcbi8vIE1peGVzIGEgc3RyaW5nIHNlZWQgaW50byBhIGtleSB0aGF0IGlzIGFuIGFycmF5IG9mIGludGVnZXJzLCBhbmRcclxuLy8gcmV0dXJucyBhIHNob3J0ZW5lZCBzdHJpbmcgc2VlZCB0aGF0IGlzIGVxdWl2YWxlbnQgdG8gdGhlIHJlc3VsdCBrZXkuXHJcbi8vXHJcbmZ1bmN0aW9uIG1peGtleShzZWVkLCBrZXkpIHtcclxuICB2YXIgc3RyaW5nc2VlZCA9IHNlZWQgKyAnJywgc21lYXIsIGogPSAwO1xyXG4gIHdoaWxlIChqIDwgc3RyaW5nc2VlZC5sZW5ndGgpIHtcclxuICAgIGtleVttYXNrICYgal0gPVxyXG4gICAgICBtYXNrICYgKChzbWVhciBePSBrZXlbbWFzayAmIGpdICogMTkpICsgc3RyaW5nc2VlZC5jaGFyQ29kZUF0KGorKykpO1xyXG4gIH1cclxuICByZXR1cm4gdG9zdHJpbmcoa2V5KTtcclxufVxyXG5cclxuLy9cclxuLy8gYXV0b3NlZWQoKVxyXG4vLyBSZXR1cm5zIGFuIG9iamVjdCBmb3IgYXV0b3NlZWRpbmcsIHVzaW5nIHdpbmRvdy5jcnlwdG8gaWYgYXZhaWxhYmxlLlxyXG4vL1xyXG4vKiogQHBhcmFtIHtVaW50OEFycmF5PX0gc2VlZCAqL1xyXG5mdW5jdGlvbiBhdXRvc2VlZChzZWVkKSB7XHJcbiAgdHJ5IHtcclxuICAgIEdMT0JBTC5jcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKHNlZWQgPSBuZXcgVWludDhBcnJheSh3aWR0aCkpO1xyXG4gICAgcmV0dXJuIHRvc3RyaW5nKHNlZWQpO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHJldHVybiBbK25ldyBEYXRlLCBHTE9CQUwsIEdMT0JBTC5uYXZpZ2F0b3IgJiYgR0xPQkFMLm5hdmlnYXRvci5wbHVnaW5zLFxyXG4gICAgICAgICAgICBHTE9CQUwuc2NyZWVuLCB0b3N0cmluZyhwb29sKV07XHJcbiAgfVxyXG59XHJcblxyXG4vL1xyXG4vLyB0b3N0cmluZygpXHJcbi8vIENvbnZlcnRzIGFuIGFycmF5IG9mIGNoYXJjb2RlcyB0byBhIHN0cmluZ1xyXG4vL1xyXG5mdW5jdGlvbiB0b3N0cmluZyhhKSB7XHJcbiAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoMCwgYSk7XHJcbn1cclxuXHJcbi8vXHJcbi8vIFdoZW4gc2VlZHJhbmRvbS5qcyBpcyBsb2FkZWQsIHdlIGltbWVkaWF0ZWx5IG1peCBhIGZldyBiaXRzXHJcbi8vIGZyb20gdGhlIGJ1aWx0LWluIFJORyBpbnRvIHRoZSBlbnRyb3B5IHBvb2wuICBCZWNhdXNlIHdlIGRvXHJcbi8vIG5vdCB3YW50IHRvIGludGVmZXJlIHdpdGggZGV0ZXJtaW5zdGljIFBSTkcgc3RhdGUgbGF0ZXIsXHJcbi8vIHNlZWRyYW5kb20gd2lsbCBub3QgY2FsbCBNYXRoLnJhbmRvbSBvbiBpdHMgb3duIGFnYWluIGFmdGVyXHJcbi8vIGluaXRpYWxpemF0aW9uLlxyXG4vL1xyXG5taXhrZXkoTWF0aC5yYW5kb20oKSwgcG9vbCk7XHJcbiIsIi8qXG4gKiBBIGZhc3QgamF2YXNjcmlwdCBpbXBsZW1lbnRhdGlvbiBvZiBzaW1wbGV4IG5vaXNlIGJ5IEpvbmFzIFdhZ25lclxuXG5CYXNlZCBvbiBhIHNwZWVkLWltcHJvdmVkIHNpbXBsZXggbm9pc2UgYWxnb3JpdGhtIGZvciAyRCwgM0QgYW5kIDREIGluIEphdmEuXG5XaGljaCBpcyBiYXNlZCBvbiBleGFtcGxlIGNvZGUgYnkgU3RlZmFuIEd1c3RhdnNvbiAoc3RlZ3VAaXRuLmxpdS5zZSkuXG5XaXRoIE9wdGltaXNhdGlvbnMgYnkgUGV0ZXIgRWFzdG1hbiAocGVhc3RtYW5AZHJpenpsZS5zdGFuZm9yZC5lZHUpLlxuQmV0dGVyIHJhbmsgb3JkZXJpbmcgbWV0aG9kIGJ5IFN0ZWZhbiBHdXN0YXZzb24gaW4gMjAxMi5cblxuXG4gQ29weXJpZ2h0IChjKSAyMDE4IEpvbmFzIFdhZ25lclxuXG4gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gU09GVFdBUkUuXG4gKi9cbihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBGMiA9IDAuNSAqIChNYXRoLnNxcnQoMy4wKSAtIDEuMCk7XG4gIHZhciBHMiA9ICgzLjAgLSBNYXRoLnNxcnQoMy4wKSkgLyA2LjA7XG4gIHZhciBGMyA9IDEuMCAvIDMuMDtcbiAgdmFyIEczID0gMS4wIC8gNi4wO1xuICB2YXIgRjQgPSAoTWF0aC5zcXJ0KDUuMCkgLSAxLjApIC8gNC4wO1xuICB2YXIgRzQgPSAoNS4wIC0gTWF0aC5zcXJ0KDUuMCkpIC8gMjAuMDtcblxuICBmdW5jdGlvbiBTaW1wbGV4Tm9pc2UocmFuZG9tT3JTZWVkKSB7XG4gICAgdmFyIHJhbmRvbTtcbiAgICBpZiAodHlwZW9mIHJhbmRvbU9yU2VlZCA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICByYW5kb20gPSByYW5kb21PclNlZWQ7XG4gICAgfVxuICAgIGVsc2UgaWYgKHJhbmRvbU9yU2VlZCkge1xuICAgICAgcmFuZG9tID0gYWxlYShyYW5kb21PclNlZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByYW5kb20gPSBNYXRoLnJhbmRvbTtcbiAgICB9XG4gICAgdGhpcy5wID0gYnVpbGRQZXJtdXRhdGlvblRhYmxlKHJhbmRvbSk7XG4gICAgdGhpcy5wZXJtID0gbmV3IFVpbnQ4QXJyYXkoNTEyKTtcbiAgICB0aGlzLnBlcm1Nb2QxMiA9IG5ldyBVaW50OEFycmF5KDUxMik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA1MTI7IGkrKykge1xuICAgICAgdGhpcy5wZXJtW2ldID0gdGhpcy5wW2kgJiAyNTVdO1xuICAgICAgdGhpcy5wZXJtTW9kMTJbaV0gPSB0aGlzLnBlcm1baV0gJSAxMjtcbiAgICB9XG5cbiAgfVxuICBTaW1wbGV4Tm9pc2UucHJvdG90eXBlID0ge1xuICAgIGdyYWQzOiBuZXcgRmxvYXQzMkFycmF5KFsxLCAxLCAwLFxuICAgICAgLTEsIDEsIDAsXG4gICAgICAxLCAtMSwgMCxcblxuICAgICAgLTEsIC0xLCAwLFxuICAgICAgMSwgMCwgMSxcbiAgICAgIC0xLCAwLCAxLFxuXG4gICAgICAxLCAwLCAtMSxcbiAgICAgIC0xLCAwLCAtMSxcbiAgICAgIDAsIDEsIDEsXG5cbiAgICAgIDAsIC0xLCAxLFxuICAgICAgMCwgMSwgLTEsXG4gICAgICAwLCAtMSwgLTFdKSxcbiAgICBncmFkNDogbmV3IEZsb2F0MzJBcnJheShbMCwgMSwgMSwgMSwgMCwgMSwgMSwgLTEsIDAsIDEsIC0xLCAxLCAwLCAxLCAtMSwgLTEsXG4gICAgICAwLCAtMSwgMSwgMSwgMCwgLTEsIDEsIC0xLCAwLCAtMSwgLTEsIDEsIDAsIC0xLCAtMSwgLTEsXG4gICAgICAxLCAwLCAxLCAxLCAxLCAwLCAxLCAtMSwgMSwgMCwgLTEsIDEsIDEsIDAsIC0xLCAtMSxcbiAgICAgIC0xLCAwLCAxLCAxLCAtMSwgMCwgMSwgLTEsIC0xLCAwLCAtMSwgMSwgLTEsIDAsIC0xLCAtMSxcbiAgICAgIDEsIDEsIDAsIDEsIDEsIDEsIDAsIC0xLCAxLCAtMSwgMCwgMSwgMSwgLTEsIDAsIC0xLFxuICAgICAgLTEsIDEsIDAsIDEsIC0xLCAxLCAwLCAtMSwgLTEsIC0xLCAwLCAxLCAtMSwgLTEsIDAsIC0xLFxuICAgICAgMSwgMSwgMSwgMCwgMSwgMSwgLTEsIDAsIDEsIC0xLCAxLCAwLCAxLCAtMSwgLTEsIDAsXG4gICAgICAtMSwgMSwgMSwgMCwgLTEsIDEsIC0xLCAwLCAtMSwgLTEsIDEsIDAsIC0xLCAtMSwgLTEsIDBdKSxcbiAgICBub2lzZTJEOiBmdW5jdGlvbih4aW4sIHlpbikge1xuICAgICAgdmFyIHBlcm1Nb2QxMiA9IHRoaXMucGVybU1vZDEyO1xuICAgICAgdmFyIHBlcm0gPSB0aGlzLnBlcm07XG4gICAgICB2YXIgZ3JhZDMgPSB0aGlzLmdyYWQzO1xuICAgICAgdmFyIG4wID0gMDsgLy8gTm9pc2UgY29udHJpYnV0aW9ucyBmcm9tIHRoZSB0aHJlZSBjb3JuZXJzXG4gICAgICB2YXIgbjEgPSAwO1xuICAgICAgdmFyIG4yID0gMDtcbiAgICAgIC8vIFNrZXcgdGhlIGlucHV0IHNwYWNlIHRvIGRldGVybWluZSB3aGljaCBzaW1wbGV4IGNlbGwgd2UncmUgaW5cbiAgICAgIHZhciBzID0gKHhpbiArIHlpbikgKiBGMjsgLy8gSGFpcnkgZmFjdG9yIGZvciAyRFxuICAgICAgdmFyIGkgPSBNYXRoLmZsb29yKHhpbiArIHMpO1xuICAgICAgdmFyIGogPSBNYXRoLmZsb29yKHlpbiArIHMpO1xuICAgICAgdmFyIHQgPSAoaSArIGopICogRzI7XG4gICAgICB2YXIgWDAgPSBpIC0gdDsgLy8gVW5za2V3IHRoZSBjZWxsIG9yaWdpbiBiYWNrIHRvICh4LHkpIHNwYWNlXG4gICAgICB2YXIgWTAgPSBqIC0gdDtcbiAgICAgIHZhciB4MCA9IHhpbiAtIFgwOyAvLyBUaGUgeCx5IGRpc3RhbmNlcyBmcm9tIHRoZSBjZWxsIG9yaWdpblxuICAgICAgdmFyIHkwID0geWluIC0gWTA7XG4gICAgICAvLyBGb3IgdGhlIDJEIGNhc2UsIHRoZSBzaW1wbGV4IHNoYXBlIGlzIGFuIGVxdWlsYXRlcmFsIHRyaWFuZ2xlLlxuICAgICAgLy8gRGV0ZXJtaW5lIHdoaWNoIHNpbXBsZXggd2UgYXJlIGluLlxuICAgICAgdmFyIGkxLCBqMTsgLy8gT2Zmc2V0cyBmb3Igc2Vjb25kIChtaWRkbGUpIGNvcm5lciBvZiBzaW1wbGV4IGluIChpLGopIGNvb3Jkc1xuICAgICAgaWYgKHgwID4geTApIHtcbiAgICAgICAgaTEgPSAxO1xuICAgICAgICBqMSA9IDA7XG4gICAgICB9IC8vIGxvd2VyIHRyaWFuZ2xlLCBYWSBvcmRlcjogKDAsMCktPigxLDApLT4oMSwxKVxuICAgICAgZWxzZSB7XG4gICAgICAgIGkxID0gMDtcbiAgICAgICAgajEgPSAxO1xuICAgICAgfSAvLyB1cHBlciB0cmlhbmdsZSwgWVggb3JkZXI6ICgwLDApLT4oMCwxKS0+KDEsMSlcbiAgICAgIC8vIEEgc3RlcCBvZiAoMSwwKSBpbiAoaSxqKSBtZWFucyBhIHN0ZXAgb2YgKDEtYywtYykgaW4gKHgseSksIGFuZFxuICAgICAgLy8gYSBzdGVwIG9mICgwLDEpIGluIChpLGopIG1lYW5zIGEgc3RlcCBvZiAoLWMsMS1jKSBpbiAoeCx5KSwgd2hlcmVcbiAgICAgIC8vIGMgPSAoMy1zcXJ0KDMpKS82XG4gICAgICB2YXIgeDEgPSB4MCAtIGkxICsgRzI7IC8vIE9mZnNldHMgZm9yIG1pZGRsZSBjb3JuZXIgaW4gKHgseSkgdW5za2V3ZWQgY29vcmRzXG4gICAgICB2YXIgeTEgPSB5MCAtIGoxICsgRzI7XG4gICAgICB2YXIgeDIgPSB4MCAtIDEuMCArIDIuMCAqIEcyOyAvLyBPZmZzZXRzIGZvciBsYXN0IGNvcm5lciBpbiAoeCx5KSB1bnNrZXdlZCBjb29yZHNcbiAgICAgIHZhciB5MiA9IHkwIC0gMS4wICsgMi4wICogRzI7XG4gICAgICAvLyBXb3JrIG91dCB0aGUgaGFzaGVkIGdyYWRpZW50IGluZGljZXMgb2YgdGhlIHRocmVlIHNpbXBsZXggY29ybmVyc1xuICAgICAgdmFyIGlpID0gaSAmIDI1NTtcbiAgICAgIHZhciBqaiA9IGogJiAyNTU7XG4gICAgICAvLyBDYWxjdWxhdGUgdGhlIGNvbnRyaWJ1dGlvbiBmcm9tIHRoZSB0aHJlZSBjb3JuZXJzXG4gICAgICB2YXIgdDAgPSAwLjUgLSB4MCAqIHgwIC0geTAgKiB5MDtcbiAgICAgIGlmICh0MCA+PSAwKSB7XG4gICAgICAgIHZhciBnaTAgPSBwZXJtTW9kMTJbaWkgKyBwZXJtW2pqXV0gKiAzO1xuICAgICAgICB0MCAqPSB0MDtcbiAgICAgICAgbjAgPSB0MCAqIHQwICogKGdyYWQzW2dpMF0gKiB4MCArIGdyYWQzW2dpMCArIDFdICogeTApOyAvLyAoeCx5KSBvZiBncmFkMyB1c2VkIGZvciAyRCBncmFkaWVudFxuICAgICAgfVxuICAgICAgdmFyIHQxID0gMC41IC0geDEgKiB4MSAtIHkxICogeTE7XG4gICAgICBpZiAodDEgPj0gMCkge1xuICAgICAgICB2YXIgZ2kxID0gcGVybU1vZDEyW2lpICsgaTEgKyBwZXJtW2pqICsgajFdXSAqIDM7XG4gICAgICAgIHQxICo9IHQxO1xuICAgICAgICBuMSA9IHQxICogdDEgKiAoZ3JhZDNbZ2kxXSAqIHgxICsgZ3JhZDNbZ2kxICsgMV0gKiB5MSk7XG4gICAgICB9XG4gICAgICB2YXIgdDIgPSAwLjUgLSB4MiAqIHgyIC0geTIgKiB5MjtcbiAgICAgIGlmICh0MiA+PSAwKSB7XG4gICAgICAgIHZhciBnaTIgPSBwZXJtTW9kMTJbaWkgKyAxICsgcGVybVtqaiArIDFdXSAqIDM7XG4gICAgICAgIHQyICo9IHQyO1xuICAgICAgICBuMiA9IHQyICogdDIgKiAoZ3JhZDNbZ2kyXSAqIHgyICsgZ3JhZDNbZ2kyICsgMV0gKiB5Mik7XG4gICAgICB9XG4gICAgICAvLyBBZGQgY29udHJpYnV0aW9ucyBmcm9tIGVhY2ggY29ybmVyIHRvIGdldCB0aGUgZmluYWwgbm9pc2UgdmFsdWUuXG4gICAgICAvLyBUaGUgcmVzdWx0IGlzIHNjYWxlZCB0byByZXR1cm4gdmFsdWVzIGluIHRoZSBpbnRlcnZhbCBbLTEsMV0uXG4gICAgICByZXR1cm4gNzAuMCAqIChuMCArIG4xICsgbjIpO1xuICAgIH0sXG4gICAgLy8gM0Qgc2ltcGxleCBub2lzZVxuICAgIG5vaXNlM0Q6IGZ1bmN0aW9uKHhpbiwgeWluLCB6aW4pIHtcbiAgICAgIHZhciBwZXJtTW9kMTIgPSB0aGlzLnBlcm1Nb2QxMjtcbiAgICAgIHZhciBwZXJtID0gdGhpcy5wZXJtO1xuICAgICAgdmFyIGdyYWQzID0gdGhpcy5ncmFkMztcbiAgICAgIHZhciBuMCwgbjEsIG4yLCBuMzsgLy8gTm9pc2UgY29udHJpYnV0aW9ucyBmcm9tIHRoZSBmb3VyIGNvcm5lcnNcbiAgICAgIC8vIFNrZXcgdGhlIGlucHV0IHNwYWNlIHRvIGRldGVybWluZSB3aGljaCBzaW1wbGV4IGNlbGwgd2UncmUgaW5cbiAgICAgIHZhciBzID0gKHhpbiArIHlpbiArIHppbikgKiBGMzsgLy8gVmVyeSBuaWNlIGFuZCBzaW1wbGUgc2tldyBmYWN0b3IgZm9yIDNEXG4gICAgICB2YXIgaSA9IE1hdGguZmxvb3IoeGluICsgcyk7XG4gICAgICB2YXIgaiA9IE1hdGguZmxvb3IoeWluICsgcyk7XG4gICAgICB2YXIgayA9IE1hdGguZmxvb3IoemluICsgcyk7XG4gICAgICB2YXIgdCA9IChpICsgaiArIGspICogRzM7XG4gICAgICB2YXIgWDAgPSBpIC0gdDsgLy8gVW5za2V3IHRoZSBjZWxsIG9yaWdpbiBiYWNrIHRvICh4LHkseikgc3BhY2VcbiAgICAgIHZhciBZMCA9IGogLSB0O1xuICAgICAgdmFyIFowID0gayAtIHQ7XG4gICAgICB2YXIgeDAgPSB4aW4gLSBYMDsgLy8gVGhlIHgseSx6IGRpc3RhbmNlcyBmcm9tIHRoZSBjZWxsIG9yaWdpblxuICAgICAgdmFyIHkwID0geWluIC0gWTA7XG4gICAgICB2YXIgejAgPSB6aW4gLSBaMDtcbiAgICAgIC8vIEZvciB0aGUgM0QgY2FzZSwgdGhlIHNpbXBsZXggc2hhcGUgaXMgYSBzbGlnaHRseSBpcnJlZ3VsYXIgdGV0cmFoZWRyb24uXG4gICAgICAvLyBEZXRlcm1pbmUgd2hpY2ggc2ltcGxleCB3ZSBhcmUgaW4uXG4gICAgICB2YXIgaTEsIGoxLCBrMTsgLy8gT2Zmc2V0cyBmb3Igc2Vjb25kIGNvcm5lciBvZiBzaW1wbGV4IGluIChpLGosaykgY29vcmRzXG4gICAgICB2YXIgaTIsIGoyLCBrMjsgLy8gT2Zmc2V0cyBmb3IgdGhpcmQgY29ybmVyIG9mIHNpbXBsZXggaW4gKGksaixrKSBjb29yZHNcbiAgICAgIGlmICh4MCA+PSB5MCkge1xuICAgICAgICBpZiAoeTAgPj0gejApIHtcbiAgICAgICAgICBpMSA9IDE7XG4gICAgICAgICAgajEgPSAwO1xuICAgICAgICAgIGsxID0gMDtcbiAgICAgICAgICBpMiA9IDE7XG4gICAgICAgICAgajIgPSAxO1xuICAgICAgICAgIGsyID0gMDtcbiAgICAgICAgfSAvLyBYIFkgWiBvcmRlclxuICAgICAgICBlbHNlIGlmICh4MCA+PSB6MCkge1xuICAgICAgICAgIGkxID0gMTtcbiAgICAgICAgICBqMSA9IDA7XG4gICAgICAgICAgazEgPSAwO1xuICAgICAgICAgIGkyID0gMTtcbiAgICAgICAgICBqMiA9IDA7XG4gICAgICAgICAgazIgPSAxO1xuICAgICAgICB9IC8vIFggWiBZIG9yZGVyXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGkxID0gMDtcbiAgICAgICAgICBqMSA9IDA7XG4gICAgICAgICAgazEgPSAxO1xuICAgICAgICAgIGkyID0gMTtcbiAgICAgICAgICBqMiA9IDA7XG4gICAgICAgICAgazIgPSAxO1xuICAgICAgICB9IC8vIFogWCBZIG9yZGVyXG4gICAgICB9XG4gICAgICBlbHNlIHsgLy8geDA8eTBcbiAgICAgICAgaWYgKHkwIDwgejApIHtcbiAgICAgICAgICBpMSA9IDA7XG4gICAgICAgICAgajEgPSAwO1xuICAgICAgICAgIGsxID0gMTtcbiAgICAgICAgICBpMiA9IDA7XG4gICAgICAgICAgajIgPSAxO1xuICAgICAgICAgIGsyID0gMTtcbiAgICAgICAgfSAvLyBaIFkgWCBvcmRlclxuICAgICAgICBlbHNlIGlmICh4MCA8IHowKSB7XG4gICAgICAgICAgaTEgPSAwO1xuICAgICAgICAgIGoxID0gMTtcbiAgICAgICAgICBrMSA9IDA7XG4gICAgICAgICAgaTIgPSAwO1xuICAgICAgICAgIGoyID0gMTtcbiAgICAgICAgICBrMiA9IDE7XG4gICAgICAgIH0gLy8gWSBaIFggb3JkZXJcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaTEgPSAwO1xuICAgICAgICAgIGoxID0gMTtcbiAgICAgICAgICBrMSA9IDA7XG4gICAgICAgICAgaTIgPSAxO1xuICAgICAgICAgIGoyID0gMTtcbiAgICAgICAgICBrMiA9IDA7XG4gICAgICAgIH0gLy8gWSBYIFogb3JkZXJcbiAgICAgIH1cbiAgICAgIC8vIEEgc3RlcCBvZiAoMSwwLDApIGluIChpLGosaykgbWVhbnMgYSBzdGVwIG9mICgxLWMsLWMsLWMpIGluICh4LHkseiksXG4gICAgICAvLyBhIHN0ZXAgb2YgKDAsMSwwKSBpbiAoaSxqLGspIG1lYW5zIGEgc3RlcCBvZiAoLWMsMS1jLC1jKSBpbiAoeCx5LHopLCBhbmRcbiAgICAgIC8vIGEgc3RlcCBvZiAoMCwwLDEpIGluIChpLGosaykgbWVhbnMgYSBzdGVwIG9mICgtYywtYywxLWMpIGluICh4LHkseiksIHdoZXJlXG4gICAgICAvLyBjID0gMS82LlxuICAgICAgdmFyIHgxID0geDAgLSBpMSArIEczOyAvLyBPZmZzZXRzIGZvciBzZWNvbmQgY29ybmVyIGluICh4LHkseikgY29vcmRzXG4gICAgICB2YXIgeTEgPSB5MCAtIGoxICsgRzM7XG4gICAgICB2YXIgejEgPSB6MCAtIGsxICsgRzM7XG4gICAgICB2YXIgeDIgPSB4MCAtIGkyICsgMi4wICogRzM7IC8vIE9mZnNldHMgZm9yIHRoaXJkIGNvcm5lciBpbiAoeCx5LHopIGNvb3Jkc1xuICAgICAgdmFyIHkyID0geTAgLSBqMiArIDIuMCAqIEczO1xuICAgICAgdmFyIHoyID0gejAgLSBrMiArIDIuMCAqIEczO1xuICAgICAgdmFyIHgzID0geDAgLSAxLjAgKyAzLjAgKiBHMzsgLy8gT2Zmc2V0cyBmb3IgbGFzdCBjb3JuZXIgaW4gKHgseSx6KSBjb29yZHNcbiAgICAgIHZhciB5MyA9IHkwIC0gMS4wICsgMy4wICogRzM7XG4gICAgICB2YXIgejMgPSB6MCAtIDEuMCArIDMuMCAqIEczO1xuICAgICAgLy8gV29yayBvdXQgdGhlIGhhc2hlZCBncmFkaWVudCBpbmRpY2VzIG9mIHRoZSBmb3VyIHNpbXBsZXggY29ybmVyc1xuICAgICAgdmFyIGlpID0gaSAmIDI1NTtcbiAgICAgIHZhciBqaiA9IGogJiAyNTU7XG4gICAgICB2YXIga2sgPSBrICYgMjU1O1xuICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBjb250cmlidXRpb24gZnJvbSB0aGUgZm91ciBjb3JuZXJzXG4gICAgICB2YXIgdDAgPSAwLjYgLSB4MCAqIHgwIC0geTAgKiB5MCAtIHowICogejA7XG4gICAgICBpZiAodDAgPCAwKSBuMCA9IDAuMDtcbiAgICAgIGVsc2Uge1xuICAgICAgICB2YXIgZ2kwID0gcGVybU1vZDEyW2lpICsgcGVybVtqaiArIHBlcm1ba2tdXV0gKiAzO1xuICAgICAgICB0MCAqPSB0MDtcbiAgICAgICAgbjAgPSB0MCAqIHQwICogKGdyYWQzW2dpMF0gKiB4MCArIGdyYWQzW2dpMCArIDFdICogeTAgKyBncmFkM1tnaTAgKyAyXSAqIHowKTtcbiAgICAgIH1cbiAgICAgIHZhciB0MSA9IDAuNiAtIHgxICogeDEgLSB5MSAqIHkxIC0gejEgKiB6MTtcbiAgICAgIGlmICh0MSA8IDApIG4xID0gMC4wO1xuICAgICAgZWxzZSB7XG4gICAgICAgIHZhciBnaTEgPSBwZXJtTW9kMTJbaWkgKyBpMSArIHBlcm1bamogKyBqMSArIHBlcm1ba2sgKyBrMV1dXSAqIDM7XG4gICAgICAgIHQxICo9IHQxO1xuICAgICAgICBuMSA9IHQxICogdDEgKiAoZ3JhZDNbZ2kxXSAqIHgxICsgZ3JhZDNbZ2kxICsgMV0gKiB5MSArIGdyYWQzW2dpMSArIDJdICogejEpO1xuICAgICAgfVxuICAgICAgdmFyIHQyID0gMC42IC0geDIgKiB4MiAtIHkyICogeTIgLSB6MiAqIHoyO1xuICAgICAgaWYgKHQyIDwgMCkgbjIgPSAwLjA7XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFyIGdpMiA9IHBlcm1Nb2QxMltpaSArIGkyICsgcGVybVtqaiArIGoyICsgcGVybVtrayArIGsyXV1dICogMztcbiAgICAgICAgdDIgKj0gdDI7XG4gICAgICAgIG4yID0gdDIgKiB0MiAqIChncmFkM1tnaTJdICogeDIgKyBncmFkM1tnaTIgKyAxXSAqIHkyICsgZ3JhZDNbZ2kyICsgMl0gKiB6Mik7XG4gICAgICB9XG4gICAgICB2YXIgdDMgPSAwLjYgLSB4MyAqIHgzIC0geTMgKiB5MyAtIHozICogejM7XG4gICAgICBpZiAodDMgPCAwKSBuMyA9IDAuMDtcbiAgICAgIGVsc2Uge1xuICAgICAgICB2YXIgZ2kzID0gcGVybU1vZDEyW2lpICsgMSArIHBlcm1bamogKyAxICsgcGVybVtrayArIDFdXV0gKiAzO1xuICAgICAgICB0MyAqPSB0MztcbiAgICAgICAgbjMgPSB0MyAqIHQzICogKGdyYWQzW2dpM10gKiB4MyArIGdyYWQzW2dpMyArIDFdICogeTMgKyBncmFkM1tnaTMgKyAyXSAqIHozKTtcbiAgICAgIH1cbiAgICAgIC8vIEFkZCBjb250cmlidXRpb25zIGZyb20gZWFjaCBjb3JuZXIgdG8gZ2V0IHRoZSBmaW5hbCBub2lzZSB2YWx1ZS5cbiAgICAgIC8vIFRoZSByZXN1bHQgaXMgc2NhbGVkIHRvIHN0YXkganVzdCBpbnNpZGUgWy0xLDFdXG4gICAgICByZXR1cm4gMzIuMCAqIChuMCArIG4xICsgbjIgKyBuMyk7XG4gICAgfSxcbiAgICAvLyA0RCBzaW1wbGV4IG5vaXNlLCBiZXR0ZXIgc2ltcGxleCByYW5rIG9yZGVyaW5nIG1ldGhvZCAyMDEyLTAzLTA5XG4gICAgbm9pc2U0RDogZnVuY3Rpb24oeCwgeSwgeiwgdykge1xuICAgICAgdmFyIHBlcm0gPSB0aGlzLnBlcm07XG4gICAgICB2YXIgZ3JhZDQgPSB0aGlzLmdyYWQ0O1xuXG4gICAgICB2YXIgbjAsIG4xLCBuMiwgbjMsIG40OyAvLyBOb2lzZSBjb250cmlidXRpb25zIGZyb20gdGhlIGZpdmUgY29ybmVyc1xuICAgICAgLy8gU2tldyB0aGUgKHgseSx6LHcpIHNwYWNlIHRvIGRldGVybWluZSB3aGljaCBjZWxsIG9mIDI0IHNpbXBsaWNlcyB3ZSdyZSBpblxuICAgICAgdmFyIHMgPSAoeCArIHkgKyB6ICsgdykgKiBGNDsgLy8gRmFjdG9yIGZvciA0RCBza2V3aW5nXG4gICAgICB2YXIgaSA9IE1hdGguZmxvb3IoeCArIHMpO1xuICAgICAgdmFyIGogPSBNYXRoLmZsb29yKHkgKyBzKTtcbiAgICAgIHZhciBrID0gTWF0aC5mbG9vcih6ICsgcyk7XG4gICAgICB2YXIgbCA9IE1hdGguZmxvb3IodyArIHMpO1xuICAgICAgdmFyIHQgPSAoaSArIGogKyBrICsgbCkgKiBHNDsgLy8gRmFjdG9yIGZvciA0RCB1bnNrZXdpbmdcbiAgICAgIHZhciBYMCA9IGkgLSB0OyAvLyBVbnNrZXcgdGhlIGNlbGwgb3JpZ2luIGJhY2sgdG8gKHgseSx6LHcpIHNwYWNlXG4gICAgICB2YXIgWTAgPSBqIC0gdDtcbiAgICAgIHZhciBaMCA9IGsgLSB0O1xuICAgICAgdmFyIFcwID0gbCAtIHQ7XG4gICAgICB2YXIgeDAgPSB4IC0gWDA7IC8vIFRoZSB4LHkseix3IGRpc3RhbmNlcyBmcm9tIHRoZSBjZWxsIG9yaWdpblxuICAgICAgdmFyIHkwID0geSAtIFkwO1xuICAgICAgdmFyIHowID0geiAtIFowO1xuICAgICAgdmFyIHcwID0gdyAtIFcwO1xuICAgICAgLy8gRm9yIHRoZSA0RCBjYXNlLCB0aGUgc2ltcGxleCBpcyBhIDREIHNoYXBlIEkgd29uJ3QgZXZlbiB0cnkgdG8gZGVzY3JpYmUuXG4gICAgICAvLyBUbyBmaW5kIG91dCB3aGljaCBvZiB0aGUgMjQgcG9zc2libGUgc2ltcGxpY2VzIHdlJ3JlIGluLCB3ZSBuZWVkIHRvXG4gICAgICAvLyBkZXRlcm1pbmUgdGhlIG1hZ25pdHVkZSBvcmRlcmluZyBvZiB4MCwgeTAsIHowIGFuZCB3MC5cbiAgICAgIC8vIFNpeCBwYWlyLXdpc2UgY29tcGFyaXNvbnMgYXJlIHBlcmZvcm1lZCBiZXR3ZWVuIGVhY2ggcG9zc2libGUgcGFpclxuICAgICAgLy8gb2YgdGhlIGZvdXIgY29vcmRpbmF0ZXMsIGFuZCB0aGUgcmVzdWx0cyBhcmUgdXNlZCB0byByYW5rIHRoZSBudW1iZXJzLlxuICAgICAgdmFyIHJhbmt4ID0gMDtcbiAgICAgIHZhciByYW5reSA9IDA7XG4gICAgICB2YXIgcmFua3ogPSAwO1xuICAgICAgdmFyIHJhbmt3ID0gMDtcbiAgICAgIGlmICh4MCA+IHkwKSByYW5reCsrO1xuICAgICAgZWxzZSByYW5reSsrO1xuICAgICAgaWYgKHgwID4gejApIHJhbmt4Kys7XG4gICAgICBlbHNlIHJhbmt6Kys7XG4gICAgICBpZiAoeDAgPiB3MCkgcmFua3grKztcbiAgICAgIGVsc2UgcmFua3crKztcbiAgICAgIGlmICh5MCA+IHowKSByYW5reSsrO1xuICAgICAgZWxzZSByYW5reisrO1xuICAgICAgaWYgKHkwID4gdzApIHJhbmt5Kys7XG4gICAgICBlbHNlIHJhbmt3Kys7XG4gICAgICBpZiAoejAgPiB3MCkgcmFua3orKztcbiAgICAgIGVsc2UgcmFua3crKztcbiAgICAgIHZhciBpMSwgajEsIGsxLCBsMTsgLy8gVGhlIGludGVnZXIgb2Zmc2V0cyBmb3IgdGhlIHNlY29uZCBzaW1wbGV4IGNvcm5lclxuICAgICAgdmFyIGkyLCBqMiwgazIsIGwyOyAvLyBUaGUgaW50ZWdlciBvZmZzZXRzIGZvciB0aGUgdGhpcmQgc2ltcGxleCBjb3JuZXJcbiAgICAgIHZhciBpMywgajMsIGszLCBsMzsgLy8gVGhlIGludGVnZXIgb2Zmc2V0cyBmb3IgdGhlIGZvdXJ0aCBzaW1wbGV4IGNvcm5lclxuICAgICAgLy8gc2ltcGxleFtjXSBpcyBhIDQtdmVjdG9yIHdpdGggdGhlIG51bWJlcnMgMCwgMSwgMiBhbmQgMyBpbiBzb21lIG9yZGVyLlxuICAgICAgLy8gTWFueSB2YWx1ZXMgb2YgYyB3aWxsIG5ldmVyIG9jY3VyLCBzaW5jZSBlLmcuIHg+eT56PncgbWFrZXMgeDx6LCB5PHcgYW5kIHg8d1xuICAgICAgLy8gaW1wb3NzaWJsZS4gT25seSB0aGUgMjQgaW5kaWNlcyB3aGljaCBoYXZlIG5vbi16ZXJvIGVudHJpZXMgbWFrZSBhbnkgc2Vuc2UuXG4gICAgICAvLyBXZSB1c2UgYSB0aHJlc2hvbGRpbmcgdG8gc2V0IHRoZSBjb29yZGluYXRlcyBpbiB0dXJuIGZyb20gdGhlIGxhcmdlc3QgbWFnbml0dWRlLlxuICAgICAgLy8gUmFuayAzIGRlbm90ZXMgdGhlIGxhcmdlc3QgY29vcmRpbmF0ZS5cbiAgICAgIGkxID0gcmFua3ggPj0gMyA/IDEgOiAwO1xuICAgICAgajEgPSByYW5reSA+PSAzID8gMSA6IDA7XG4gICAgICBrMSA9IHJhbmt6ID49IDMgPyAxIDogMDtcbiAgICAgIGwxID0gcmFua3cgPj0gMyA/IDEgOiAwO1xuICAgICAgLy8gUmFuayAyIGRlbm90ZXMgdGhlIHNlY29uZCBsYXJnZXN0IGNvb3JkaW5hdGUuXG4gICAgICBpMiA9IHJhbmt4ID49IDIgPyAxIDogMDtcbiAgICAgIGoyID0gcmFua3kgPj0gMiA/IDEgOiAwO1xuICAgICAgazIgPSByYW5reiA+PSAyID8gMSA6IDA7XG4gICAgICBsMiA9IHJhbmt3ID49IDIgPyAxIDogMDtcbiAgICAgIC8vIFJhbmsgMSBkZW5vdGVzIHRoZSBzZWNvbmQgc21hbGxlc3QgY29vcmRpbmF0ZS5cbiAgICAgIGkzID0gcmFua3ggPj0gMSA/IDEgOiAwO1xuICAgICAgajMgPSByYW5reSA+PSAxID8gMSA6IDA7XG4gICAgICBrMyA9IHJhbmt6ID49IDEgPyAxIDogMDtcbiAgICAgIGwzID0gcmFua3cgPj0gMSA/IDEgOiAwO1xuICAgICAgLy8gVGhlIGZpZnRoIGNvcm5lciBoYXMgYWxsIGNvb3JkaW5hdGUgb2Zmc2V0cyA9IDEsIHNvIG5vIG5lZWQgdG8gY29tcHV0ZSB0aGF0LlxuICAgICAgdmFyIHgxID0geDAgLSBpMSArIEc0OyAvLyBPZmZzZXRzIGZvciBzZWNvbmQgY29ybmVyIGluICh4LHkseix3KSBjb29yZHNcbiAgICAgIHZhciB5MSA9IHkwIC0gajEgKyBHNDtcbiAgICAgIHZhciB6MSA9IHowIC0gazEgKyBHNDtcbiAgICAgIHZhciB3MSA9IHcwIC0gbDEgKyBHNDtcbiAgICAgIHZhciB4MiA9IHgwIC0gaTIgKyAyLjAgKiBHNDsgLy8gT2Zmc2V0cyBmb3IgdGhpcmQgY29ybmVyIGluICh4LHkseix3KSBjb29yZHNcbiAgICAgIHZhciB5MiA9IHkwIC0gajIgKyAyLjAgKiBHNDtcbiAgICAgIHZhciB6MiA9IHowIC0gazIgKyAyLjAgKiBHNDtcbiAgICAgIHZhciB3MiA9IHcwIC0gbDIgKyAyLjAgKiBHNDtcbiAgICAgIHZhciB4MyA9IHgwIC0gaTMgKyAzLjAgKiBHNDsgLy8gT2Zmc2V0cyBmb3IgZm91cnRoIGNvcm5lciBpbiAoeCx5LHosdykgY29vcmRzXG4gICAgICB2YXIgeTMgPSB5MCAtIGozICsgMy4wICogRzQ7XG4gICAgICB2YXIgejMgPSB6MCAtIGszICsgMy4wICogRzQ7XG4gICAgICB2YXIgdzMgPSB3MCAtIGwzICsgMy4wICogRzQ7XG4gICAgICB2YXIgeDQgPSB4MCAtIDEuMCArIDQuMCAqIEc0OyAvLyBPZmZzZXRzIGZvciBsYXN0IGNvcm5lciBpbiAoeCx5LHosdykgY29vcmRzXG4gICAgICB2YXIgeTQgPSB5MCAtIDEuMCArIDQuMCAqIEc0O1xuICAgICAgdmFyIHo0ID0gejAgLSAxLjAgKyA0LjAgKiBHNDtcbiAgICAgIHZhciB3NCA9IHcwIC0gMS4wICsgNC4wICogRzQ7XG4gICAgICAvLyBXb3JrIG91dCB0aGUgaGFzaGVkIGdyYWRpZW50IGluZGljZXMgb2YgdGhlIGZpdmUgc2ltcGxleCBjb3JuZXJzXG4gICAgICB2YXIgaWkgPSBpICYgMjU1O1xuICAgICAgdmFyIGpqID0gaiAmIDI1NTtcbiAgICAgIHZhciBrayA9IGsgJiAyNTU7XG4gICAgICB2YXIgbGwgPSBsICYgMjU1O1xuICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBjb250cmlidXRpb24gZnJvbSB0aGUgZml2ZSBjb3JuZXJzXG4gICAgICB2YXIgdDAgPSAwLjYgLSB4MCAqIHgwIC0geTAgKiB5MCAtIHowICogejAgLSB3MCAqIHcwO1xuICAgICAgaWYgKHQwIDwgMCkgbjAgPSAwLjA7XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFyIGdpMCA9IChwZXJtW2lpICsgcGVybVtqaiArIHBlcm1ba2sgKyBwZXJtW2xsXV1dXSAlIDMyKSAqIDQ7XG4gICAgICAgIHQwICo9IHQwO1xuICAgICAgICBuMCA9IHQwICogdDAgKiAoZ3JhZDRbZ2kwXSAqIHgwICsgZ3JhZDRbZ2kwICsgMV0gKiB5MCArIGdyYWQ0W2dpMCArIDJdICogejAgKyBncmFkNFtnaTAgKyAzXSAqIHcwKTtcbiAgICAgIH1cbiAgICAgIHZhciB0MSA9IDAuNiAtIHgxICogeDEgLSB5MSAqIHkxIC0gejEgKiB6MSAtIHcxICogdzE7XG4gICAgICBpZiAodDEgPCAwKSBuMSA9IDAuMDtcbiAgICAgIGVsc2Uge1xuICAgICAgICB2YXIgZ2kxID0gKHBlcm1baWkgKyBpMSArIHBlcm1bamogKyBqMSArIHBlcm1ba2sgKyBrMSArIHBlcm1bbGwgKyBsMV1dXV0gJSAzMikgKiA0O1xuICAgICAgICB0MSAqPSB0MTtcbiAgICAgICAgbjEgPSB0MSAqIHQxICogKGdyYWQ0W2dpMV0gKiB4MSArIGdyYWQ0W2dpMSArIDFdICogeTEgKyBncmFkNFtnaTEgKyAyXSAqIHoxICsgZ3JhZDRbZ2kxICsgM10gKiB3MSk7XG4gICAgICB9XG4gICAgICB2YXIgdDIgPSAwLjYgLSB4MiAqIHgyIC0geTIgKiB5MiAtIHoyICogejIgLSB3MiAqIHcyO1xuICAgICAgaWYgKHQyIDwgMCkgbjIgPSAwLjA7XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFyIGdpMiA9IChwZXJtW2lpICsgaTIgKyBwZXJtW2pqICsgajIgKyBwZXJtW2trICsgazIgKyBwZXJtW2xsICsgbDJdXV1dICUgMzIpICogNDtcbiAgICAgICAgdDIgKj0gdDI7XG4gICAgICAgIG4yID0gdDIgKiB0MiAqIChncmFkNFtnaTJdICogeDIgKyBncmFkNFtnaTIgKyAxXSAqIHkyICsgZ3JhZDRbZ2kyICsgMl0gKiB6MiArIGdyYWQ0W2dpMiArIDNdICogdzIpO1xuICAgICAgfVxuICAgICAgdmFyIHQzID0gMC42IC0geDMgKiB4MyAtIHkzICogeTMgLSB6MyAqIHozIC0gdzMgKiB3MztcbiAgICAgIGlmICh0MyA8IDApIG4zID0gMC4wO1xuICAgICAgZWxzZSB7XG4gICAgICAgIHZhciBnaTMgPSAocGVybVtpaSArIGkzICsgcGVybVtqaiArIGozICsgcGVybVtrayArIGszICsgcGVybVtsbCArIGwzXV1dXSAlIDMyKSAqIDQ7XG4gICAgICAgIHQzICo9IHQzO1xuICAgICAgICBuMyA9IHQzICogdDMgKiAoZ3JhZDRbZ2kzXSAqIHgzICsgZ3JhZDRbZ2kzICsgMV0gKiB5MyArIGdyYWQ0W2dpMyArIDJdICogejMgKyBncmFkNFtnaTMgKyAzXSAqIHczKTtcbiAgICAgIH1cbiAgICAgIHZhciB0NCA9IDAuNiAtIHg0ICogeDQgLSB5NCAqIHk0IC0gejQgKiB6NCAtIHc0ICogdzQ7XG4gICAgICBpZiAodDQgPCAwKSBuNCA9IDAuMDtcbiAgICAgIGVsc2Uge1xuICAgICAgICB2YXIgZ2k0ID0gKHBlcm1baWkgKyAxICsgcGVybVtqaiArIDEgKyBwZXJtW2trICsgMSArIHBlcm1bbGwgKyAxXV1dXSAlIDMyKSAqIDQ7XG4gICAgICAgIHQ0ICo9IHQ0O1xuICAgICAgICBuNCA9IHQ0ICogdDQgKiAoZ3JhZDRbZ2k0XSAqIHg0ICsgZ3JhZDRbZ2k0ICsgMV0gKiB5NCArIGdyYWQ0W2dpNCArIDJdICogejQgKyBncmFkNFtnaTQgKyAzXSAqIHc0KTtcbiAgICAgIH1cbiAgICAgIC8vIFN1bSB1cCBhbmQgc2NhbGUgdGhlIHJlc3VsdCB0byBjb3ZlciB0aGUgcmFuZ2UgWy0xLDFdXG4gICAgICByZXR1cm4gMjcuMCAqIChuMCArIG4xICsgbjIgKyBuMyArIG40KTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gYnVpbGRQZXJtdXRhdGlvblRhYmxlKHJhbmRvbSkge1xuICAgIHZhciBpO1xuICAgIHZhciBwID0gbmV3IFVpbnQ4QXJyYXkoMjU2KTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgMjU2OyBpKyspIHtcbiAgICAgIHBbaV0gPSBpO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgMjU1OyBpKyspIHtcbiAgICAgIHZhciByID0gaSArIH5+KHJhbmRvbSgpICogKDI1NiAtIGkpKTtcbiAgICAgIHZhciBhdXggPSBwW2ldO1xuICAgICAgcFtpXSA9IHBbcl07XG4gICAgICBwW3JdID0gYXV4O1xuICAgIH1cbiAgICByZXR1cm4gcDtcbiAgfVxuICBTaW1wbGV4Tm9pc2UuX2J1aWxkUGVybXV0YXRpb25UYWJsZSA9IGJ1aWxkUGVybXV0YXRpb25UYWJsZTtcblxuICBmdW5jdGlvbiBhbGVhKCkge1xuICAgIC8vIEpvaGFubmVzIEJhYWfDuGUgPGJhYWdvZUBiYWFnb2UuY29tPiwgMjAxMFxuICAgIHZhciBzMCA9IDA7XG4gICAgdmFyIHMxID0gMDtcbiAgICB2YXIgczIgPSAwO1xuICAgIHZhciBjID0gMTtcblxuICAgIHZhciBtYXNoID0gbWFzaGVyKCk7XG4gICAgczAgPSBtYXNoKCcgJyk7XG4gICAgczEgPSBtYXNoKCcgJyk7XG4gICAgczIgPSBtYXNoKCcgJyk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgczAgLT0gbWFzaChhcmd1bWVudHNbaV0pO1xuICAgICAgaWYgKHMwIDwgMCkge1xuICAgICAgICBzMCArPSAxO1xuICAgICAgfVxuICAgICAgczEgLT0gbWFzaChhcmd1bWVudHNbaV0pO1xuICAgICAgaWYgKHMxIDwgMCkge1xuICAgICAgICBzMSArPSAxO1xuICAgICAgfVxuICAgICAgczIgLT0gbWFzaChhcmd1bWVudHNbaV0pO1xuICAgICAgaWYgKHMyIDwgMCkge1xuICAgICAgICBzMiArPSAxO1xuICAgICAgfVxuICAgIH1cbiAgICBtYXNoID0gbnVsbDtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdCA9IDIwOTE2MzkgKiBzMCArIGMgKiAyLjMyODMwNjQzNjUzODY5NjNlLTEwOyAvLyAyXi0zMlxuICAgICAgczAgPSBzMTtcbiAgICAgIHMxID0gczI7XG4gICAgICByZXR1cm4gczIgPSB0IC0gKGMgPSB0IHwgMCk7XG4gICAgfTtcbiAgfVxuICBmdW5jdGlvbiBtYXNoZXIoKSB7XG4gICAgdmFyIG4gPSAweGVmYzgyNDlkO1xuICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBkYXRhID0gZGF0YS50b1N0cmluZygpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG4gKz0gZGF0YS5jaGFyQ29kZUF0KGkpO1xuICAgICAgICB2YXIgaCA9IDAuMDI1MTk2MDMyODI0MTY5MzggKiBuO1xuICAgICAgICBuID0gaCA+Pj4gMDtcbiAgICAgICAgaCAtPSBuO1xuICAgICAgICBoICo9IG47XG4gICAgICAgIG4gPSBoID4+PiAwO1xuICAgICAgICBoIC09IG47XG4gICAgICAgIG4gKz0gaCAqIDB4MTAwMDAwMDAwOyAvLyAyXjMyXG4gICAgICB9XG4gICAgICByZXR1cm4gKG4gPj4+IDApICogMi4zMjgzMDY0MzY1Mzg2OTYzZS0xMDsgLy8gMl4tMzJcbiAgICB9O1xuICB9XG5cbiAgLy8gYW1kXG4gIGlmICh0eXBlb2YgZGVmaW5lICE9PSAndW5kZWZpbmVkJyAmJiBkZWZpbmUuYW1kKSBkZWZpbmUoZnVuY3Rpb24oKSB7cmV0dXJuIFNpbXBsZXhOb2lzZTt9KTtcbiAgLy8gY29tbW9uIGpzXG4gIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIGV4cG9ydHMuU2ltcGxleE5vaXNlID0gU2ltcGxleE5vaXNlO1xuICAvLyBicm93c2VyXG4gIGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB3aW5kb3cuU2ltcGxleE5vaXNlID0gU2ltcGxleE5vaXNlO1xuICAvLyBub2RlanNcbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTaW1wbGV4Tm9pc2U7XG4gIH1cblxufSkoKTtcbiIsImNvbnN0IGNhbnZhc1NrZXRjaCA9IHJlcXVpcmUoXCJjYW52YXMtc2tldGNoXCIpO1xuY29uc3QgeyBpbnZlcnNlTGVycCwgbGVycCB9ID0gcmVxdWlyZShcImNhbnZhcy1za2V0Y2gtdXRpbC9tYXRoXCIpO1xuY29uc3QgcmFuZG9tID0gcmVxdWlyZShcImNhbnZhcy1za2V0Y2gtdXRpbC9yYW5kb21cIik7XG5jb25zdCBwYWxldHRlcyA9IHJlcXVpcmUoXCJuaWNlLWNvbG9yLXBhbGV0dGVzLzEwMDAuanNvblwiKTtcblxuY29uc3Qgc3BsaXRQYWxldHRlID0gcmVxdWlyZShcIi4vdXRpbC9zcGxpdFBhbGV0dGVcIik7XG5jb25zdCBpbnRlcnBvbGF0ZUNvbG9ycyA9IHJlcXVpcmUoXCIuL3V0aWwvaW50ZXJwb2xhdGVDb2xvcnNcIik7XG5jb25zdCByYW5kb21Qb2ludFdpdGhpbkNpcmNsZSA9IHJlcXVpcmUoXCIuL3V0aWwvcmFuZG9tUG9pbnRXaXRoaW5DaXJjbGVcIik7XG5jb25zdCBkcmF3Q2lyY2xlID0gcmVxdWlyZShcIi4vdXRpbC9kcmF3Q2lyY2xlXCIpO1xuXG5yYW5kb20uc2V0U2VlZChyYW5kb20uZ2V0UmFuZG9tU2VlZCgpKTtcbmNvbnNvbGUubG9nKHJhbmRvbS5nZXRTZWVkKCkpO1xuXG5jb25zdCBXSURUSCA9IDQwOTY7XG5jb25zdCBIRUlHSFQgPSA0MDk2O1xuXG5jb25zdCBzZXR0aW5ncyA9IHtcbiAgZGltZW5zaW9uczogW1dJRFRILCBIRUlHSFRdLFxuICBzdWZmaXg6IGAtc2VlZC0ke3JhbmRvbS5nZXRTZWVkKCl9YFxufTtcblxuY29uc3QgY2lyY2xlTWFza1JhZGl1cyA9IFdJRFRIIC8gMztcbmNvbnN0IGNpcmNsZU1hc2sgPSB7XG4gIHg6IFdJRFRIIC8gMixcbiAgeTogSEVJR0hUIC8gMixcbiAgcmFkaXVzOiBjaXJjbGVNYXNrUmFkaXVzXG59O1xuXG5jb25zdCB7IGJhY2tncm91bmQsIHBhbGV0dGUgfSA9IHNwbGl0UGFsZXR0ZShyYW5kb20ucGljayhwYWxldHRlcykpO1xuY29uc3QgY29sb3JzID0gaW50ZXJwb2xhdGVDb2xvcnMocGFsZXR0ZSwgNTApO1xuXG5jb25zdCBDTFVTVEVSX01JTiA9IDIwO1xuY29uc3QgQ0xVU1RFUl9NQVggPSA0MDtcbmNvbnN0IFNQUkVBRF9NSU4gPSAtNTtcbmNvbnN0IFNQUkVBRF9NQVggPSA1O1xuY29uc3QgTUlOX0NPTE9SX0pJVFRFUiA9IC0yO1xuY29uc3QgTUFYX0NPTE9SX0pJVFRFUiA9IDI7XG5jb25zdCBTVEFSVElOR19SQURJVVMgPSA2O1xuY29uc3QgTUlOX0RFTlNJVFkgPSAwLjU7XG5jb25zdCBNQVhfREVOU0lUWSA9IDAuODtcbmNvbnN0IFBST0JBQklMSVRZX1RPX1JFTkRFUiA9IDAuMjtcblxuY29uc3QgZ2VuZXJhdGUgPSAoKSA9PiB7XG4gIGNvbnN0IHBhcnRpY2xlQ291bnQgPSBXSURUSCAvIHJhbmRvbS5yYW5nZShNSU5fREVOU0lUWSwgTUFYX0RFTlNJVFkpO1xuICBjb25zdCBwb2ludHMgPSBbXTtcblxuICB3aGlsZSAocG9pbnRzLmxlbmd0aCA8IHBhcnRpY2xlQ291bnQpIHtcbiAgICBjb25zdCB7IHgsIHksIHJhZGl1cyB9ID0gcmFuZG9tUG9pbnRXaXRoaW5DaXJjbGUoXG4gICAgICBTVEFSVElOR19SQURJVVMsXG4gICAgICBXSURUSCxcbiAgICAgIEhFSUdIVCxcbiAgICAgIGNpcmNsZU1hc2tcbiAgICApO1xuXG4gICAgY29uc3Qgbm9pc2UgPVxuICAgICAgcmFuZG9tLm5vaXNlMkQoeCAvIHBhcnRpY2xlQ291bnQgLSAxLCB5IC8gcGFydGljbGVDb3VudCAtIDEpICogNTAwO1xuICAgIGNvbnN0IGNsdXN0ZXIgPSBNYXRoLm1heChcbiAgICAgIHJhbmRvbS5yYW5nZShDTFVTVEVSX01JTiwgQ0xVU1RFUl9NQVgpLFxuICAgICAgTWF0aC5yb3VuZChpbnZlcnNlTGVycCgtMSwgMSwgbm9pc2UpKVxuICAgICk7XG5cbiAgICAvLyBiYXNlZCBvbiB0aGUgeSBwb3NpdGlvbiBvZiB0aGUgcGFydGljbGUsIHBpY2sgdGhlIG5lYXJlc3QgY29sb3VyIGZyb21cbiAgICAvLyBvdXIgaW50ZXJwb2xhdGVkIGFycmF5IG9mIGNvbG91cnMgKyBhIGxpdHRsZSBiaXQgb2Ygbm9pc2UgZm9yIHRleHR1cmVcbiAgICBjb25zdCBjb2xvckluZGV4ID0gTWF0aC5yb3VuZChcbiAgICAgIGxlcnAoMCwgY29sb3JzLmxlbmd0aCwgeSAvIEhFSUdIVCkgK1xuICAgICAgICByYW5kb20ucmFuZ2UoTUlOX0NPTE9SX0pJVFRFUiwgTUFYX0NPTE9SX0pJVFRFUilcbiAgICApO1xuICAgIGNvbnN0IGNvbG9yID0gY29sb3JzW01hdGgubWF4KDAsIE1hdGgubWluKGNvbG9ySW5kZXgsIGNvbG9ycy5sZW5ndGgpKV07XG5cbiAgICBjb25zdCBwYXJ0aWNsZXMgPSBbXTtcblxuICAgIC8vIEVhY2ggcG9pbm50IGhhcyBhIHRyYWlsIG9mIHBhcnRpY2xlc1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgY2x1c3RlcjsgaSsrKSB7XG4gICAgICAvLyBmb3IgZWFjaCBzdWItcGFydGljbGUgb24gdGhlIHRyYWlsIHJhbmRvbWx5IG9mZnNldCBpdCB3aXRoIGFuIGluZGV4IG1vZGlmaWVyXG4gICAgICBjb25zdCBvZmZzZXQgPVxuICAgICAgICByYW5kb20ucmFuZ2UoU1BSRUFEX01JTiAtIGkgLyBjbHVzdGVyLCBTUFJFQURfTUFYICsgaSAvIGNsdXN0ZXIpICogaTtcblxuICAgICAgcGFydGljbGVzLnB1c2goe1xuICAgICAgICB4OiB4ICsgb2Zmc2V0LFxuICAgICAgICB5LFxuICAgICAgICByYWRpdXM6IE1hdGgubWF4KDAuMywgcmFkaXVzIC0gcmFkaXVzIC8gY2x1c3RlciAqIGkpLFxuICAgICAgICBjb2xvcjogY29sb3JcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHBvaW50cy5wdXNoKHtcbiAgICAgIHgsXG4gICAgICB5LFxuICAgICAgcmFkaXVzLFxuICAgICAgb2Zmc2V0OiByYW5kb20ucmFuZ2UoU1BSRUFEX01JTiAvIGNsdXN0ZXIsIFNQUkVBRF9NQVggLyBjbHVzdGVyKSxcbiAgICAgIHBhcnRpY2xlcyxcbiAgICAgIGNvbG9yXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gcG9pbnRzO1xufTtcblxuY29uc3QgcG9pbnRzID0gZ2VuZXJhdGUoV0lEVEgsIEhFSUdIVCwgY2lyY2xlTWFzaykuZmlsdGVyKFxuICAoKSA9PiByYW5kb20udmFsdWUoKSA8IFBST0JBQklMSVRZX1RPX1JFTkRFUlxuKTtcblxuY29uc3Qgc2tldGNoID0gKCkgPT4ge1xuICByZXR1cm4gKHsgY29udGV4dCwgd2lkdGgsIGhlaWdodCB9KSA9PiB7XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBiYWNrZ3JvdW5kO1xuICAgIGNvbnRleHQuZmlsbFJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG5cbiAgICBwb2ludHMuZm9yRWFjaChwb2ludCA9PiB7XG4gICAgICBwb2ludC5wYXJ0aWNsZXMuZm9yRWFjaChwYXJ0aWNsZSA9PiB7XG4gICAgICAgIGRyYXdDaXJjbGUocGFydGljbGUsIGNvbnRleHQpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG59O1xuXG5jYW52YXNTa2V0Y2goc2tldGNoLCBzZXR0aW5ncyk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChjaXJjbGUsIGNvbnRleHQpID0+IHtcbiAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgaWYgKGNpcmNsZS5jb2xvcikgY29udGV4dC5maWxsU3R5bGUgPSBjaXJjbGUuY29sb3I7XG4gIGNvbnRleHQuYXJjKGNpcmNsZS54LCBjaXJjbGUueSwgY2lyY2xlLnJhZGl1cywgMCwgTWF0aC5QSSAqIDIpO1xuICBjb250ZXh0LmZpbGwoKTtcbn07XG4iLCJjb25zdCBsZXJwQ29sb3IgPSByZXF1aXJlKFwiLi9sZXJwSGV4Q29sb3JcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gKHBhbGV0dGUsIHN0ZXBzKSA9PiB7XG4gIGNvbnN0IHN0ZXBzQmV0d2VlbkNvbG91cnMgPSAoc3RlcHMgLSBwYWxldHRlLmxlbmd0aCkgLyAocGFsZXR0ZS5sZW5ndGggLSAxKTtcbiAgY29uc3QgY29sb3JzID0gW107XG5cbiAgZm9yIChsZXQgY29sb3IgPSAwOyBjb2xvciA8IHBhbGV0dGUubGVuZ3RoOyBjb2xvcisrKSB7XG4gICAgY29sb3JzLnB1c2gocGFsZXR0ZVtjb2xvcl0pO1xuICAgIGlmICghcGFsZXR0ZVtjb2xvciArIDFdKSBicmVhaztcbiAgICBmb3IgKGxldCBzdGVwID0gMDsgc3RlcCA8IHN0ZXBzQmV0d2VlbkNvbG91cnM7IHN0ZXArKykge1xuICAgICAgY29uc3QgbmV3Q29sb3IgPSBsZXJwQ29sb3IoXG4gICAgICAgIHBhbGV0dGVbY29sb3JdLFxuICAgICAgICBwYWxldHRlW2NvbG9yICsgMV0sXG4gICAgICAgIHN0ZXAgLyBzdGVwc0JldHdlZW5Db2xvdXJzXG4gICAgICApO1xuICAgICAgY29sb3JzLnB1c2gobmV3Q29sb3IpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjb2xvcnM7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoYSwgYiwgYW1vdW50KSA9PiB7XG4gIGNvbnN0IGFoID0gcGFyc2VJbnQoYS5yZXBsYWNlKC8jL2csIFwiXCIpLCAxNik7XG4gIGNvbnN0IGFyID0gYWggPj4gMTY7XG4gIGNvbnN0IGFnID0gKGFoID4+IDgpICYgMHhmZjtcbiAgY29uc3QgYWIgPSBhaCAmIDB4ZmY7XG4gIGNvbnN0IGJoID0gcGFyc2VJbnQoYi5yZXBsYWNlKC8jL2csIFwiXCIpLCAxNik7XG4gIGNvbnN0IGJyID0gYmggPj4gMTY7XG4gIGNvbnN0IGJnID0gKGJoID4+IDgpICYgMHhmZjtcbiAgY29uc3QgYmIgPSBiaCAmIDB4ZmY7XG4gIGNvbnN0IHJyID0gYXIgKyBhbW91bnQgKiAoYnIgLSBhcik7XG4gIGNvbnN0IHJnID0gYWcgKyBhbW91bnQgKiAoYmcgLSBhZyk7XG4gIGNvbnN0IHJiID0gYWIgKyBhbW91bnQgKiAoYmIgLSBhYik7XG5cbiAgcmV0dXJuIChcbiAgICBcIiNcIiArICgoKDEgPDwgMjQpICsgKHJyIDw8IDE2KSArIChyZyA8PCA4KSArIHJiKSB8IDApLnRvU3RyaW5nKDE2KS5zbGljZSgxKVxuICApO1xufTtcbiIsImNvbnN0IHJhbmRvbSA9IHJlcXVpcmUoXCJjYW52YXMtc2tldGNoLXV0aWwvcmFuZG9tXCIpO1xuXG5jb25zdCBpc1BvaW50V2l0aGluQ2lyY2xlID0gKHBvaW50LCBjaXJjbGVNYXNrLCB0b2xlcmFuY2UgPSAyMCkgPT4ge1xuICB2YXIgYSA9IHBvaW50LnJhZGl1cyArIGNpcmNsZU1hc2sucmFkaXVzIC0gdG9sZXJhbmNlO1xuICB2YXIgeCA9IHBvaW50LnggLSBjaXJjbGVNYXNrLng7XG4gIHZhciB5ID0gcG9pbnQueSAtIGNpcmNsZU1hc2sueTtcblxuICByZXR1cm4gYSA+PSBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSk7XG59O1xuXG5jb25zdCByYW5kb21Qb2ludFdpdGhpbkNpcmNsZSA9IChcbiAgcmFkaXVzLFxuICBjYW52YXNXaWR0aCxcbiAgY2FudmFzSGVpZ2h0LFxuICBjaXJjbGVNYXNrXG4pID0+IHtcbiAgY29uc3QgcG9pbnQgPSB7XG4gICAgeDogcmFuZG9tLnJhbmdlKDAsIGNhbnZhc1dpZHRoKSxcbiAgICB5OiByYW5kb20ucmFuZ2UoMCwgY2FudmFzSGVpZ2h0KSxcbiAgICByYWRpdXNcbiAgfTtcbiAgaWYgKGlzUG9pbnRXaXRoaW5DaXJjbGUocG9pbnQsIGNpcmNsZU1hc2spKSByZXR1cm4gcG9pbnQ7XG5cbiAgcmV0dXJuIHJhbmRvbVBvaW50V2l0aGluQ2lyY2xlKHJhZGl1cywgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCwgY2lyY2xlTWFzayk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJhbmRvbVBvaW50V2l0aGluQ2lyY2xlO1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgMjAxOSBNYXR0IERlc0xhdXJpZXJzXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cbiAqL1xuY29uc3QgY29sb3JDb250cmFzdCA9IHJlcXVpcmUoXCJjb2xvci1jb250cmFzdFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBwYWxldHRlID0+IHtcbiAgY29uc3QgbWF4Q29udHJhc3QgPSB0cnVlO1xuICBsZXQgYmVzdENvbnRyYXN0SW5kZXggPSAwO1xuICBsZXQgYmVzdENvbnRyYXN0ID0gbWF4Q29udHJhc3QgPyAtSW5maW5pdHkgOiBJbmZpbml0eTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYWxldHRlLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgYSA9IHBhbGV0dGVbaV07XG4gICAgbGV0IHN1bSA9IDA7XG4gICAgLy8gR2V0IHRoZSBzdW0gb2YgY29udHJhc3RzIGZyb20gdGhpcyB0byBhbGwgb3RoZXJzXG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBwYWxldHRlLmxlbmd0aDsgaisrKSB7XG4gICAgICBjb25zdCBiID0gcGFsZXR0ZVtqXTtcbiAgICAgIGlmIChhID09PSBiKSBjb250aW51ZTtcbiAgICAgIHN1bSArPSBjb2xvckNvbnRyYXN0KGEsIGIpO1xuICAgIH1cbiAgICBpZiAobWF4Q29udHJhc3QgPyBzdW0gPiBiZXN0Q29udHJhc3QgOiBzdW0gPCBiZXN0Q29udHJhc3QpIHtcbiAgICAgIGJlc3RDb250cmFzdCA9IHN1bTtcbiAgICAgIGJlc3RDb250cmFzdEluZGV4ID0gaTtcbiAgICB9XG4gIH1cbiAgbGV0IGNvbG9ycyA9IHBhbGV0dGUuc2xpY2UoKTtcbiAgY29uc3QgYmFja2dyb3VuZCA9IGNvbG9ycy5zcGxpY2UoYmVzdENvbnRyYXN0SW5kZXgsIDEpO1xuICByZXR1cm4ge1xuICAgIGJhY2tncm91bmQsXG4gICAgcGFsZXR0ZTogY29sb3JzXG4gIH07XG59O1xuIiwiXG5nbG9iYWwuQ0FOVkFTX1NLRVRDSF9ERUZBVUxUX1NUT1JBR0VfS0VZID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG4iXX0=
