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

},{"defined":13}],2:[function(require,module,exports){
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

},{"defined":13,"seed-random":16,"simplex-noise":18}],3:[function(require,module,exports){
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

},{"convert-length":12}],4:[function(require,module,exports){
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
'use strict'

module.exports = {
	"aliceblue": [240, 248, 255],
	"antiquewhite": [250, 235, 215],
	"aqua": [0, 255, 255],
	"aquamarine": [127, 255, 212],
	"azure": [240, 255, 255],
	"beige": [245, 245, 220],
	"bisque": [255, 228, 196],
	"black": [0, 0, 0],
	"blanchedalmond": [255, 235, 205],
	"blue": [0, 0, 255],
	"blueviolet": [138, 43, 226],
	"brown": [165, 42, 42],
	"burlywood": [222, 184, 135],
	"cadetblue": [95, 158, 160],
	"chartreuse": [127, 255, 0],
	"chocolate": [210, 105, 30],
	"coral": [255, 127, 80],
	"cornflowerblue": [100, 149, 237],
	"cornsilk": [255, 248, 220],
	"crimson": [220, 20, 60],
	"cyan": [0, 255, 255],
	"darkblue": [0, 0, 139],
	"darkcyan": [0, 139, 139],
	"darkgoldenrod": [184, 134, 11],
	"darkgray": [169, 169, 169],
	"darkgreen": [0, 100, 0],
	"darkgrey": [169, 169, 169],
	"darkkhaki": [189, 183, 107],
	"darkmagenta": [139, 0, 139],
	"darkolivegreen": [85, 107, 47],
	"darkorange": [255, 140, 0],
	"darkorchid": [153, 50, 204],
	"darkred": [139, 0, 0],
	"darksalmon": [233, 150, 122],
	"darkseagreen": [143, 188, 143],
	"darkslateblue": [72, 61, 139],
	"darkslategray": [47, 79, 79],
	"darkslategrey": [47, 79, 79],
	"darkturquoise": [0, 206, 209],
	"darkviolet": [148, 0, 211],
	"deeppink": [255, 20, 147],
	"deepskyblue": [0, 191, 255],
	"dimgray": [105, 105, 105],
	"dimgrey": [105, 105, 105],
	"dodgerblue": [30, 144, 255],
	"firebrick": [178, 34, 34],
	"floralwhite": [255, 250, 240],
	"forestgreen": [34, 139, 34],
	"fuchsia": [255, 0, 255],
	"gainsboro": [220, 220, 220],
	"ghostwhite": [248, 248, 255],
	"gold": [255, 215, 0],
	"goldenrod": [218, 165, 32],
	"gray": [128, 128, 128],
	"green": [0, 128, 0],
	"greenyellow": [173, 255, 47],
	"grey": [128, 128, 128],
	"honeydew": [240, 255, 240],
	"hotpink": [255, 105, 180],
	"indianred": [205, 92, 92],
	"indigo": [75, 0, 130],
	"ivory": [255, 255, 240],
	"khaki": [240, 230, 140],
	"lavender": [230, 230, 250],
	"lavenderblush": [255, 240, 245],
	"lawngreen": [124, 252, 0],
	"lemonchiffon": [255, 250, 205],
	"lightblue": [173, 216, 230],
	"lightcoral": [240, 128, 128],
	"lightcyan": [224, 255, 255],
	"lightgoldenrodyellow": [250, 250, 210],
	"lightgray": [211, 211, 211],
	"lightgreen": [144, 238, 144],
	"lightgrey": [211, 211, 211],
	"lightpink": [255, 182, 193],
	"lightsalmon": [255, 160, 122],
	"lightseagreen": [32, 178, 170],
	"lightskyblue": [135, 206, 250],
	"lightslategray": [119, 136, 153],
	"lightslategrey": [119, 136, 153],
	"lightsteelblue": [176, 196, 222],
	"lightyellow": [255, 255, 224],
	"lime": [0, 255, 0],
	"limegreen": [50, 205, 50],
	"linen": [250, 240, 230],
	"magenta": [255, 0, 255],
	"maroon": [128, 0, 0],
	"mediumaquamarine": [102, 205, 170],
	"mediumblue": [0, 0, 205],
	"mediumorchid": [186, 85, 211],
	"mediumpurple": [147, 112, 219],
	"mediumseagreen": [60, 179, 113],
	"mediumslateblue": [123, 104, 238],
	"mediumspringgreen": [0, 250, 154],
	"mediumturquoise": [72, 209, 204],
	"mediumvioletred": [199, 21, 133],
	"midnightblue": [25, 25, 112],
	"mintcream": [245, 255, 250],
	"mistyrose": [255, 228, 225],
	"moccasin": [255, 228, 181],
	"navajowhite": [255, 222, 173],
	"navy": [0, 0, 128],
	"oldlace": [253, 245, 230],
	"olive": [128, 128, 0],
	"olivedrab": [107, 142, 35],
	"orange": [255, 165, 0],
	"orangered": [255, 69, 0],
	"orchid": [218, 112, 214],
	"palegoldenrod": [238, 232, 170],
	"palegreen": [152, 251, 152],
	"paleturquoise": [175, 238, 238],
	"palevioletred": [219, 112, 147],
	"papayawhip": [255, 239, 213],
	"peachpuff": [255, 218, 185],
	"peru": [205, 133, 63],
	"pink": [255, 192, 203],
	"plum": [221, 160, 221],
	"powderblue": [176, 224, 230],
	"purple": [128, 0, 128],
	"rebeccapurple": [102, 51, 153],
	"red": [255, 0, 0],
	"rosybrown": [188, 143, 143],
	"royalblue": [65, 105, 225],
	"saddlebrown": [139, 69, 19],
	"salmon": [250, 128, 114],
	"sandybrown": [244, 164, 96],
	"seagreen": [46, 139, 87],
	"seashell": [255, 245, 238],
	"sienna": [160, 82, 45],
	"silver": [192, 192, 192],
	"skyblue": [135, 206, 235],
	"slateblue": [106, 90, 205],
	"slategray": [112, 128, 144],
	"slategrey": [112, 128, 144],
	"snow": [255, 250, 250],
	"springgreen": [0, 255, 127],
	"steelblue": [70, 130, 180],
	"tan": [210, 180, 140],
	"teal": [0, 128, 128],
	"thistle": [216, 191, 216],
	"tomato": [255, 99, 71],
	"turquoise": [64, 224, 208],
	"violet": [238, 130, 238],
	"wheat": [245, 222, 179],
	"white": [255, 255, 255],
	"whitesmoke": [245, 245, 245],
	"yellow": [255, 255, 0],
	"yellowgreen": [154, 205, 50]
};

},{}],6:[function(require,module,exports){
/* MIT license */
var colorNames = require('color-name');
var swizzle = require('simple-swizzle');

var reverseNames = {};

// create a list of reverse color names
for (var name in colorNames) {
	if (colorNames.hasOwnProperty(name)) {
		reverseNames[colorNames[name]] = name;
	}
}

var cs = module.exports = {
	to: {},
	get: {}
};

cs.get = function (string) {
	var prefix = string.substring(0, 3).toLowerCase();
	var val;
	var model;
	switch (prefix) {
		case 'hsl':
			val = cs.get.hsl(string);
			model = 'hsl';
			break;
		case 'hwb':
			val = cs.get.hwb(string);
			model = 'hwb';
			break;
		default:
			val = cs.get.rgb(string);
			model = 'rgb';
			break;
	}

	if (!val) {
		return null;
	}

	return {model: model, value: val};
};

cs.get.rgb = function (string) {
	if (!string) {
		return null;
	}

	var abbr = /^#([a-f0-9]{3,4})$/i;
	var hex = /^#([a-f0-9]{6})([a-f0-9]{2})?$/i;
	var rgba = /^rgba?\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
	var per = /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
	var keyword = /(\D+)/;

	var rgb = [0, 0, 0, 1];
	var match;
	var i;
	var hexAlpha;

	if (match = string.match(hex)) {
		hexAlpha = match[2];
		match = match[1];

		for (i = 0; i < 3; i++) {
			// https://jsperf.com/slice-vs-substr-vs-substring-methods-long-string/19
			var i2 = i * 2;
			rgb[i] = parseInt(match.slice(i2, i2 + 2), 16);
		}

		if (hexAlpha) {
			rgb[3] = Math.round((parseInt(hexAlpha, 16) / 255) * 100) / 100;
		}
	} else if (match = string.match(abbr)) {
		match = match[1];
		hexAlpha = match[3];

		for (i = 0; i < 3; i++) {
			rgb[i] = parseInt(match[i] + match[i], 16);
		}

		if (hexAlpha) {
			rgb[3] = Math.round((parseInt(hexAlpha + hexAlpha, 16) / 255) * 100) / 100;
		}
	} else if (match = string.match(rgba)) {
		for (i = 0; i < 3; i++) {
			rgb[i] = parseInt(match[i + 1], 0);
		}

		if (match[4]) {
			rgb[3] = parseFloat(match[4]);
		}
	} else if (match = string.match(per)) {
		for (i = 0; i < 3; i++) {
			rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
		}

		if (match[4]) {
			rgb[3] = parseFloat(match[4]);
		}
	} else if (match = string.match(keyword)) {
		if (match[1] === 'transparent') {
			return [0, 0, 0, 0];
		}

		rgb = colorNames[match[1]];

		if (!rgb) {
			return null;
		}

		rgb[3] = 1;

		return rgb;
	} else {
		return null;
	}

	for (i = 0; i < 3; i++) {
		rgb[i] = clamp(rgb[i], 0, 255);
	}
	rgb[3] = clamp(rgb[3], 0, 1);

	return rgb;
};

cs.get.hsl = function (string) {
	if (!string) {
		return null;
	}

	var hsl = /^hsla?\(\s*([+-]?(?:\d*\.)?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
	var match = string.match(hsl);

	if (match) {
		var alpha = parseFloat(match[4]);
		var h = (parseFloat(match[1]) + 360) % 360;
		var s = clamp(parseFloat(match[2]), 0, 100);
		var l = clamp(parseFloat(match[3]), 0, 100);
		var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);

		return [h, s, l, a];
	}

	return null;
};

cs.get.hwb = function (string) {
	if (!string) {
		return null;
	}

	var hwb = /^hwb\(\s*([+-]?\d*[\.]?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
	var match = string.match(hwb);

	if (match) {
		var alpha = parseFloat(match[4]);
		var h = ((parseFloat(match[1]) % 360) + 360) % 360;
		var w = clamp(parseFloat(match[2]), 0, 100);
		var b = clamp(parseFloat(match[3]), 0, 100);
		var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
		return [h, w, b, a];
	}

	return null;
};

cs.to.hex = function () {
	var rgba = swizzle(arguments);

	return (
		'#' +
		hexDouble(rgba[0]) +
		hexDouble(rgba[1]) +
		hexDouble(rgba[2]) +
		(rgba[3] < 1
			? (hexDouble(Math.round(rgba[3] * 255)))
			: '')
	);
};

cs.to.rgb = function () {
	var rgba = swizzle(arguments);

	return rgba.length < 4 || rgba[3] === 1
		? 'rgb(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ')'
		: 'rgba(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ', ' + rgba[3] + ')';
};

cs.to.rgb.percent = function () {
	var rgba = swizzle(arguments);

	var r = Math.round(rgba[0] / 255 * 100);
	var g = Math.round(rgba[1] / 255 * 100);
	var b = Math.round(rgba[2] / 255 * 100);

	return rgba.length < 4 || rgba[3] === 1
		? 'rgb(' + r + '%, ' + g + '%, ' + b + '%)'
		: 'rgba(' + r + '%, ' + g + '%, ' + b + '%, ' + rgba[3] + ')';
};

cs.to.hsl = function () {
	var hsla = swizzle(arguments);
	return hsla.length < 4 || hsla[3] === 1
		? 'hsl(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%)'
		: 'hsla(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%, ' + hsla[3] + ')';
};

// hwb is a bit different than rgb(a) & hsl(a) since there is no alpha specific syntax
// (hwb have alpha optional & 1 is default value)
cs.to.hwb = function () {
	var hwba = swizzle(arguments);

	var a = '';
	if (hwba.length >= 4 && hwba[3] !== 1) {
		a = ', ' + hwba[3];
	}

	return 'hwb(' + hwba[0] + ', ' + hwba[1] + '%, ' + hwba[2] + '%' + a + ')';
};

cs.to.keyword = function (rgb) {
	return reverseNames[rgb.slice(0, 3)];
};

// helpers
function clamp(num, min, max) {
	return Math.min(Math.max(min, num), max);
}

function hexDouble(num) {
	var str = num.toString(16).toUpperCase();
	return (str.length < 2) ? '0' + str : str;
}

},{"color-name":7,"simple-swizzle":17}],7:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],8:[function(require,module,exports){
'use strict';

var colorString = require('color-string');
var convert = require('color-convert');

var _slice = [].slice;

var skippedModels = [
	// to be honest, I don't really feel like keyword belongs in color convert, but eh.
	'keyword',

	// gray conflicts with some method names, and has its own method defined.
	'gray',

	// shouldn't really be in color-convert either...
	'hex'
];

var hashedModelKeys = {};
Object.keys(convert).forEach(function (model) {
	hashedModelKeys[_slice.call(convert[model].labels).sort().join('')] = model;
});

var limiters = {};

function Color(obj, model) {
	if (!(this instanceof Color)) {
		return new Color(obj, model);
	}

	if (model && model in skippedModels) {
		model = null;
	}

	if (model && !(model in convert)) {
		throw new Error('Unknown model: ' + model);
	}

	var i;
	var channels;

	if (typeof obj === 'undefined') {
		this.model = 'rgb';
		this.color = [0, 0, 0];
		this.valpha = 1;
	} else if (obj instanceof Color) {
		this.model = obj.model;
		this.color = obj.color.slice();
		this.valpha = obj.valpha;
	} else if (typeof obj === 'string') {
		var result = colorString.get(obj);
		if (result === null) {
			throw new Error('Unable to parse color from string: ' + obj);
		}

		this.model = result.model;
		channels = convert[this.model].channels;
		this.color = result.value.slice(0, channels);
		this.valpha = typeof result.value[channels] === 'number' ? result.value[channels] : 1;
	} else if (obj.length) {
		this.model = model || 'rgb';
		channels = convert[this.model].channels;
		var newArr = _slice.call(obj, 0, channels);
		this.color = zeroArray(newArr, channels);
		this.valpha = typeof obj[channels] === 'number' ? obj[channels] : 1;
	} else if (typeof obj === 'number') {
		// this is always RGB - can be converted later on.
		obj &= 0xFFFFFF;
		this.model = 'rgb';
		this.color = [
			(obj >> 16) & 0xFF,
			(obj >> 8) & 0xFF,
			obj & 0xFF
		];
		this.valpha = 1;
	} else {
		this.valpha = 1;

		var keys = Object.keys(obj);
		if ('alpha' in obj) {
			keys.splice(keys.indexOf('alpha'), 1);
			this.valpha = typeof obj.alpha === 'number' ? obj.alpha : 0;
		}

		var hashedKeys = keys.sort().join('');
		if (!(hashedKeys in hashedModelKeys)) {
			throw new Error('Unable to parse color from object: ' + JSON.stringify(obj));
		}

		this.model = hashedModelKeys[hashedKeys];

		var labels = convert[this.model].labels;
		var color = [];
		for (i = 0; i < labels.length; i++) {
			color.push(obj[labels[i]]);
		}

		this.color = zeroArray(color);
	}

	// perform limitations (clamping, etc.)
	if (limiters[this.model]) {
		channels = convert[this.model].channels;
		for (i = 0; i < channels; i++) {
			var limit = limiters[this.model][i];
			if (limit) {
				this.color[i] = limit(this.color[i]);
			}
		}
	}

	this.valpha = Math.max(0, Math.min(1, this.valpha));

	if (Object.freeze) {
		Object.freeze(this);
	}
}

Color.prototype = {
	toString: function () {
		return this.string();
	},

	toJSON: function () {
		return this[this.model]();
	},

	string: function (places) {
		var self = this.model in colorString.to ? this : this.rgb();
		self = self.round(typeof places === 'number' ? places : 1);
		var args = self.valpha === 1 ? self.color : self.color.concat(this.valpha);
		return colorString.to[self.model](args);
	},

	percentString: function (places) {
		var self = this.rgb().round(typeof places === 'number' ? places : 1);
		var args = self.valpha === 1 ? self.color : self.color.concat(this.valpha);
		return colorString.to.rgb.percent(args);
	},

	array: function () {
		return this.valpha === 1 ? this.color.slice() : this.color.concat(this.valpha);
	},

	object: function () {
		var result = {};
		var channels = convert[this.model].channels;
		var labels = convert[this.model].labels;

		for (var i = 0; i < channels; i++) {
			result[labels[i]] = this.color[i];
		}

		if (this.valpha !== 1) {
			result.alpha = this.valpha;
		}

		return result;
	},

	unitArray: function () {
		var rgb = this.rgb().color;
		rgb[0] /= 255;
		rgb[1] /= 255;
		rgb[2] /= 255;

		if (this.valpha !== 1) {
			rgb.push(this.valpha);
		}

		return rgb;
	},

	unitObject: function () {
		var rgb = this.rgb().object();
		rgb.r /= 255;
		rgb.g /= 255;
		rgb.b /= 255;

		if (this.valpha !== 1) {
			rgb.alpha = this.valpha;
		}

		return rgb;
	},

	round: function (places) {
		places = Math.max(places || 0, 0);
		return new Color(this.color.map(roundToPlace(places)).concat(this.valpha), this.model);
	},

	alpha: function (val) {
		if (arguments.length) {
			return new Color(this.color.concat(Math.max(0, Math.min(1, val))), this.model);
		}

		return this.valpha;
	},

	// rgb
	red: getset('rgb', 0, maxfn(255)),
	green: getset('rgb', 1, maxfn(255)),
	blue: getset('rgb', 2, maxfn(255)),

	hue: getset(['hsl', 'hsv', 'hsl', 'hwb', 'hcg'], 0, function (val) { return ((val % 360) + 360) % 360; }), // eslint-disable-line brace-style

	saturationl: getset('hsl', 1, maxfn(100)),
	lightness: getset('hsl', 2, maxfn(100)),

	saturationv: getset('hsv', 1, maxfn(100)),
	value: getset('hsv', 2, maxfn(100)),

	chroma: getset('hcg', 1, maxfn(100)),
	gray: getset('hcg', 2, maxfn(100)),

	white: getset('hwb', 1, maxfn(100)),
	wblack: getset('hwb', 2, maxfn(100)),

	cyan: getset('cmyk', 0, maxfn(100)),
	magenta: getset('cmyk', 1, maxfn(100)),
	yellow: getset('cmyk', 2, maxfn(100)),
	black: getset('cmyk', 3, maxfn(100)),

	x: getset('xyz', 0, maxfn(100)),
	y: getset('xyz', 1, maxfn(100)),
	z: getset('xyz', 2, maxfn(100)),

	l: getset('lab', 0, maxfn(100)),
	a: getset('lab', 1),
	b: getset('lab', 2),

	keyword: function (val) {
		if (arguments.length) {
			return new Color(val);
		}

		return convert[this.model].keyword(this.color);
	},

	hex: function (val) {
		if (arguments.length) {
			return new Color(val);
		}

		return colorString.to.hex(this.rgb().round().color);
	},

	rgbNumber: function () {
		var rgb = this.rgb().color;
		return ((rgb[0] & 0xFF) << 16) | ((rgb[1] & 0xFF) << 8) | (rgb[2] & 0xFF);
	},

	luminosity: function () {
		// http://www.w3.org/TR/WCAG20/#relativeluminancedef
		var rgb = this.rgb().color;

		var lum = [];
		for (var i = 0; i < rgb.length; i++) {
			var chan = rgb[i] / 255;
			lum[i] = (chan <= 0.03928) ? chan / 12.92 : Math.pow(((chan + 0.055) / 1.055), 2.4);
		}

		return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
	},

	contrast: function (color2) {
		// http://www.w3.org/TR/WCAG20/#contrast-ratiodef
		var lum1 = this.luminosity();
		var lum2 = color2.luminosity();

		if (lum1 > lum2) {
			return (lum1 + 0.05) / (lum2 + 0.05);
		}

		return (lum2 + 0.05) / (lum1 + 0.05);
	},

	level: function (color2) {
		var contrastRatio = this.contrast(color2);
		if (contrastRatio >= 7.1) {
			return 'AAA';
		}

		return (contrastRatio >= 4.5) ? 'AA' : '';
	},

	isDark: function () {
		// YIQ equation from http://24ways.org/2010/calculating-color-contrast
		var rgb = this.rgb().color;
		var yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
		return yiq < 128;
	},

	isLight: function () {
		return !this.isDark();
	},

	negate: function () {
		var rgb = this.rgb();
		for (var i = 0; i < 3; i++) {
			rgb.color[i] = 255 - rgb.color[i];
		}
		return rgb;
	},

	lighten: function (ratio) {
		var hsl = this.hsl();
		hsl.color[2] += hsl.color[2] * ratio;
		return hsl;
	},

	darken: function (ratio) {
		var hsl = this.hsl();
		hsl.color[2] -= hsl.color[2] * ratio;
		return hsl;
	},

	saturate: function (ratio) {
		var hsl = this.hsl();
		hsl.color[1] += hsl.color[1] * ratio;
		return hsl;
	},

	desaturate: function (ratio) {
		var hsl = this.hsl();
		hsl.color[1] -= hsl.color[1] * ratio;
		return hsl;
	},

	whiten: function (ratio) {
		var hwb = this.hwb();
		hwb.color[1] += hwb.color[1] * ratio;
		return hwb;
	},

	blacken: function (ratio) {
		var hwb = this.hwb();
		hwb.color[2] += hwb.color[2] * ratio;
		return hwb;
	},

	grayscale: function () {
		// http://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale
		var rgb = this.rgb().color;
		var val = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
		return Color.rgb(val, val, val);
	},

	fade: function (ratio) {
		return this.alpha(this.valpha - (this.valpha * ratio));
	},

	opaquer: function (ratio) {
		return this.alpha(this.valpha + (this.valpha * ratio));
	},

	rotate: function (degrees) {
		var hsl = this.hsl();
		var hue = hsl.color[0];
		hue = (hue + degrees) % 360;
		hue = hue < 0 ? 360 + hue : hue;
		hsl.color[0] = hue;
		return hsl;
	},

	mix: function (mixinColor, weight) {
		// ported from sass implementation in C
		// https://github.com/sass/libsass/blob/0e6b4a2850092356aa3ece07c6b249f0221caced/functions.cpp#L209
		var color1 = mixinColor.rgb();
		var color2 = this.rgb();
		var p = weight === undefined ? 0.5 : weight;

		var w = 2 * p - 1;
		var a = color1.alpha() - color2.alpha();

		var w1 = (((w * a === -1) ? w : (w + a) / (1 + w * a)) + 1) / 2.0;
		var w2 = 1 - w1;

		return Color.rgb(
				w1 * color1.red() + w2 * color2.red(),
				w1 * color1.green() + w2 * color2.green(),
				w1 * color1.blue() + w2 * color2.blue(),
				color1.alpha() * p + color2.alpha() * (1 - p));
	}
};

// model conversion methods and static constructors
Object.keys(convert).forEach(function (model) {
	if (skippedModels.indexOf(model) !== -1) {
		return;
	}

	var channels = convert[model].channels;

	// conversion methods
	Color.prototype[model] = function () {
		if (this.model === model) {
			return new Color(this);
		}

		if (arguments.length) {
			return new Color(arguments, model);
		}

		var newAlpha = typeof arguments[channels] === 'number' ? channels : this.valpha;
		return new Color(assertArray(convert[this.model][model].raw(this.color)).concat(newAlpha), model);
	};

	// 'static' construction methods
	Color[model] = function (color) {
		if (typeof color === 'number') {
			color = zeroArray(_slice.call(arguments), channels);
		}
		return new Color(color, model);
	};
});

function roundTo(num, places) {
	return Number(num.toFixed(places));
}

function roundToPlace(places) {
	return function (num) {
		return roundTo(num, places);
	};
}

function getset(model, channel, modifier) {
	model = Array.isArray(model) ? model : [model];

	model.forEach(function (m) {
		(limiters[m] || (limiters[m] = []))[channel] = modifier;
	});

	model = model[0];

	return function (val) {
		var result;

		if (arguments.length) {
			if (modifier) {
				val = modifier(val);
			}

			result = this[model]();
			result.color[channel] = val;
			return result;
		}

		result = this[model]().color[channel];
		if (modifier) {
			result = modifier(result);
		}

		return result;
	};
}

function maxfn(max) {
	return function (v) {
		return Math.max(0, Math.min(max, v));
	};
}

function assertArray(val) {
	return Array.isArray(val) ? val : [val];
}

function zeroArray(arr, length) {
	for (var i = 0; i < length; i++) {
		if (typeof arr[i] !== 'number') {
			arr[i] = 0;
		}
	}

	return arr;
}

module.exports = Color;

},{"color-convert":10,"color-string":6}],9:[function(require,module,exports){
/* MIT license */
var cssKeywords = require('color-name');

// NOTE: conversions should only return primitive values (i.e. arrays, or
//       values that give correct `typeof` results).
//       do not use box values types (i.e. Number(), String(), etc.)

var reverseKeywords = {};
for (var key in cssKeywords) {
	if (cssKeywords.hasOwnProperty(key)) {
		reverseKeywords[cssKeywords[key]] = key;
	}
}

var convert = module.exports = {
	rgb: {channels: 3, labels: 'rgb'},
	hsl: {channels: 3, labels: 'hsl'},
	hsv: {channels: 3, labels: 'hsv'},
	hwb: {channels: 3, labels: 'hwb'},
	cmyk: {channels: 4, labels: 'cmyk'},
	xyz: {channels: 3, labels: 'xyz'},
	lab: {channels: 3, labels: 'lab'},
	lch: {channels: 3, labels: 'lch'},
	hex: {channels: 1, labels: ['hex']},
	keyword: {channels: 1, labels: ['keyword']},
	ansi16: {channels: 1, labels: ['ansi16']},
	ansi256: {channels: 1, labels: ['ansi256']},
	hcg: {channels: 3, labels: ['h', 'c', 'g']},
	apple: {channels: 3, labels: ['r16', 'g16', 'b16']},
	gray: {channels: 1, labels: ['gray']}
};

// hide .channels and .labels properties
for (var model in convert) {
	if (convert.hasOwnProperty(model)) {
		if (!('channels' in convert[model])) {
			throw new Error('missing channels property: ' + model);
		}

		if (!('labels' in convert[model])) {
			throw new Error('missing channel labels property: ' + model);
		}

		if (convert[model].labels.length !== convert[model].channels) {
			throw new Error('channel and label counts mismatch: ' + model);
		}

		var channels = convert[model].channels;
		var labels = convert[model].labels;
		delete convert[model].channels;
		delete convert[model].labels;
		Object.defineProperty(convert[model], 'channels', {value: channels});
		Object.defineProperty(convert[model], 'labels', {value: labels});
	}
}

convert.rgb.hsl = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var min = Math.min(r, g, b);
	var max = Math.max(r, g, b);
	var delta = max - min;
	var h;
	var s;
	var l;

	if (max === min) {
		h = 0;
	} else if (r === max) {
		h = (g - b) / delta;
	} else if (g === max) {
		h = 2 + (b - r) / delta;
	} else if (b === max) {
		h = 4 + (r - g) / delta;
	}

	h = Math.min(h * 60, 360);

	if (h < 0) {
		h += 360;
	}

	l = (min + max) / 2;

	if (max === min) {
		s = 0;
	} else if (l <= 0.5) {
		s = delta / (max + min);
	} else {
		s = delta / (2 - max - min);
	}

	return [h, s * 100, l * 100];
};

convert.rgb.hsv = function (rgb) {
	var rdif;
	var gdif;
	var bdif;
	var h;
	var s;

	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var v = Math.max(r, g, b);
	var diff = v - Math.min(r, g, b);
	var diffc = function (c) {
		return (v - c) / 6 / diff + 1 / 2;
	};

	if (diff === 0) {
		h = s = 0;
	} else {
		s = diff / v;
		rdif = diffc(r);
		gdif = diffc(g);
		bdif = diffc(b);

		if (r === v) {
			h = bdif - gdif;
		} else if (g === v) {
			h = (1 / 3) + rdif - bdif;
		} else if (b === v) {
			h = (2 / 3) + gdif - rdif;
		}
		if (h < 0) {
			h += 1;
		} else if (h > 1) {
			h -= 1;
		}
	}

	return [
		h * 360,
		s * 100,
		v * 100
	];
};

convert.rgb.hwb = function (rgb) {
	var r = rgb[0];
	var g = rgb[1];
	var b = rgb[2];
	var h = convert.rgb.hsl(rgb)[0];
	var w = 1 / 255 * Math.min(r, Math.min(g, b));

	b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

	return [h, w * 100, b * 100];
};

convert.rgb.cmyk = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var c;
	var m;
	var y;
	var k;

	k = Math.min(1 - r, 1 - g, 1 - b);
	c = (1 - r - k) / (1 - k) || 0;
	m = (1 - g - k) / (1 - k) || 0;
	y = (1 - b - k) / (1 - k) || 0;

	return [c * 100, m * 100, y * 100, k * 100];
};

/**
 * See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
 * */
function comparativeDistance(x, y) {
	return (
		Math.pow(x[0] - y[0], 2) +
		Math.pow(x[1] - y[1], 2) +
		Math.pow(x[2] - y[2], 2)
	);
}

convert.rgb.keyword = function (rgb) {
	var reversed = reverseKeywords[rgb];
	if (reversed) {
		return reversed;
	}

	var currentClosestDistance = Infinity;
	var currentClosestKeyword;

	for (var keyword in cssKeywords) {
		if (cssKeywords.hasOwnProperty(keyword)) {
			var value = cssKeywords[keyword];

			// Compute comparative distance
			var distance = comparativeDistance(rgb, value);

			// Check if its less, if so set as closest
			if (distance < currentClosestDistance) {
				currentClosestDistance = distance;
				currentClosestKeyword = keyword;
			}
		}
	}

	return currentClosestKeyword;
};

convert.keyword.rgb = function (keyword) {
	return cssKeywords[keyword];
};

convert.rgb.xyz = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;

	// assume sRGB
	r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
	g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
	b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);

	var x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
	var y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
	var z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

	return [x * 100, y * 100, z * 100];
};

convert.rgb.lab = function (rgb) {
	var xyz = convert.rgb.xyz(rgb);
	var x = xyz[0];
	var y = xyz[1];
	var z = xyz[2];
	var l;
	var a;
	var b;

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

	l = (116 * y) - 16;
	a = 500 * (x - y);
	b = 200 * (y - z);

	return [l, a, b];
};

convert.hsl.rgb = function (hsl) {
	var h = hsl[0] / 360;
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var t1;
	var t2;
	var t3;
	var rgb;
	var val;

	if (s === 0) {
		val = l * 255;
		return [val, val, val];
	}

	if (l < 0.5) {
		t2 = l * (1 + s);
	} else {
		t2 = l + s - l * s;
	}

	t1 = 2 * l - t2;

	rgb = [0, 0, 0];
	for (var i = 0; i < 3; i++) {
		t3 = h + 1 / 3 * -(i - 1);
		if (t3 < 0) {
			t3++;
		}
		if (t3 > 1) {
			t3--;
		}

		if (6 * t3 < 1) {
			val = t1 + (t2 - t1) * 6 * t3;
		} else if (2 * t3 < 1) {
			val = t2;
		} else if (3 * t3 < 2) {
			val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
		} else {
			val = t1;
		}

		rgb[i] = val * 255;
	}

	return rgb;
};

convert.hsl.hsv = function (hsl) {
	var h = hsl[0];
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var smin = s;
	var lmin = Math.max(l, 0.01);
	var sv;
	var v;

	l *= 2;
	s *= (l <= 1) ? l : 2 - l;
	smin *= lmin <= 1 ? lmin : 2 - lmin;
	v = (l + s) / 2;
	sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

	return [h, sv * 100, v * 100];
};

convert.hsv.rgb = function (hsv) {
	var h = hsv[0] / 60;
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;
	var hi = Math.floor(h) % 6;

	var f = h - Math.floor(h);
	var p = 255 * v * (1 - s);
	var q = 255 * v * (1 - (s * f));
	var t = 255 * v * (1 - (s * (1 - f)));
	v *= 255;

	switch (hi) {
		case 0:
			return [v, t, p];
		case 1:
			return [q, v, p];
		case 2:
			return [p, v, t];
		case 3:
			return [p, q, v];
		case 4:
			return [t, p, v];
		case 5:
			return [v, p, q];
	}
};

convert.hsv.hsl = function (hsv) {
	var h = hsv[0];
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;
	var vmin = Math.max(v, 0.01);
	var lmin;
	var sl;
	var l;

	l = (2 - s) * v;
	lmin = (2 - s) * vmin;
	sl = s * vmin;
	sl /= (lmin <= 1) ? lmin : 2 - lmin;
	sl = sl || 0;
	l /= 2;

	return [h, sl * 100, l * 100];
};

// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
convert.hwb.rgb = function (hwb) {
	var h = hwb[0] / 360;
	var wh = hwb[1] / 100;
	var bl = hwb[2] / 100;
	var ratio = wh + bl;
	var i;
	var v;
	var f;
	var n;

	// wh + bl cant be > 1
	if (ratio > 1) {
		wh /= ratio;
		bl /= ratio;
	}

	i = Math.floor(6 * h);
	v = 1 - bl;
	f = 6 * h - i;

	if ((i & 0x01) !== 0) {
		f = 1 - f;
	}

	n = wh + f * (v - wh); // linear interpolation

	var r;
	var g;
	var b;
	switch (i) {
		default:
		case 6:
		case 0: r = v; g = n; b = wh; break;
		case 1: r = n; g = v; b = wh; break;
		case 2: r = wh; g = v; b = n; break;
		case 3: r = wh; g = n; b = v; break;
		case 4: r = n; g = wh; b = v; break;
		case 5: r = v; g = wh; b = n; break;
	}

	return [r * 255, g * 255, b * 255];
};

convert.cmyk.rgb = function (cmyk) {
	var c = cmyk[0] / 100;
	var m = cmyk[1] / 100;
	var y = cmyk[2] / 100;
	var k = cmyk[3] / 100;
	var r;
	var g;
	var b;

	r = 1 - Math.min(1, c * (1 - k) + k);
	g = 1 - Math.min(1, m * (1 - k) + k);
	b = 1 - Math.min(1, y * (1 - k) + k);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.rgb = function (xyz) {
	var x = xyz[0] / 100;
	var y = xyz[1] / 100;
	var z = xyz[2] / 100;
	var r;
	var g;
	var b;

	r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
	g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
	b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

	// assume sRGB
	r = r > 0.0031308
		? ((1.055 * Math.pow(r, 1.0 / 2.4)) - 0.055)
		: r * 12.92;

	g = g > 0.0031308
		? ((1.055 * Math.pow(g, 1.0 / 2.4)) - 0.055)
		: g * 12.92;

	b = b > 0.0031308
		? ((1.055 * Math.pow(b, 1.0 / 2.4)) - 0.055)
		: b * 12.92;

	r = Math.min(Math.max(0, r), 1);
	g = Math.min(Math.max(0, g), 1);
	b = Math.min(Math.max(0, b), 1);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.lab = function (xyz) {
	var x = xyz[0];
	var y = xyz[1];
	var z = xyz[2];
	var l;
	var a;
	var b;

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

	l = (116 * y) - 16;
	a = 500 * (x - y);
	b = 200 * (y - z);

	return [l, a, b];
};

convert.lab.xyz = function (lab) {
	var l = lab[0];
	var a = lab[1];
	var b = lab[2];
	var x;
	var y;
	var z;

	y = (l + 16) / 116;
	x = a / 500 + y;
	z = y - b / 200;

	var y2 = Math.pow(y, 3);
	var x2 = Math.pow(x, 3);
	var z2 = Math.pow(z, 3);
	y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
	x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
	z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

	x *= 95.047;
	y *= 100;
	z *= 108.883;

	return [x, y, z];
};

convert.lab.lch = function (lab) {
	var l = lab[0];
	var a = lab[1];
	var b = lab[2];
	var hr;
	var h;
	var c;

	hr = Math.atan2(b, a);
	h = hr * 360 / 2 / Math.PI;

	if (h < 0) {
		h += 360;
	}

	c = Math.sqrt(a * a + b * b);

	return [l, c, h];
};

convert.lch.lab = function (lch) {
	var l = lch[0];
	var c = lch[1];
	var h = lch[2];
	var a;
	var b;
	var hr;

	hr = h / 360 * 2 * Math.PI;
	a = c * Math.cos(hr);
	b = c * Math.sin(hr);

	return [l, a, b];
};

convert.rgb.ansi16 = function (args) {
	var r = args[0];
	var g = args[1];
	var b = args[2];
	var value = 1 in arguments ? arguments[1] : convert.rgb.hsv(args)[2]; // hsv -> ansi16 optimization

	value = Math.round(value / 50);

	if (value === 0) {
		return 30;
	}

	var ansi = 30
		+ ((Math.round(b / 255) << 2)
		| (Math.round(g / 255) << 1)
		| Math.round(r / 255));

	if (value === 2) {
		ansi += 60;
	}

	return ansi;
};

convert.hsv.ansi16 = function (args) {
	// optimization here; we already know the value and don't need to get
	// it converted for us.
	return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
};

convert.rgb.ansi256 = function (args) {
	var r = args[0];
	var g = args[1];
	var b = args[2];

	// we use the extended greyscale palette here, with the exception of
	// black and white. normal palette only has 4 greyscale shades.
	if (r === g && g === b) {
		if (r < 8) {
			return 16;
		}

		if (r > 248) {
			return 231;
		}

		return Math.round(((r - 8) / 247) * 24) + 232;
	}

	var ansi = 16
		+ (36 * Math.round(r / 255 * 5))
		+ (6 * Math.round(g / 255 * 5))
		+ Math.round(b / 255 * 5);

	return ansi;
};

convert.ansi16.rgb = function (args) {
	var color = args % 10;

	// handle greyscale
	if (color === 0 || color === 7) {
		if (args > 50) {
			color += 3.5;
		}

		color = color / 10.5 * 255;

		return [color, color, color];
	}

	var mult = (~~(args > 50) + 1) * 0.5;
	var r = ((color & 1) * mult) * 255;
	var g = (((color >> 1) & 1) * mult) * 255;
	var b = (((color >> 2) & 1) * mult) * 255;

	return [r, g, b];
};

convert.ansi256.rgb = function (args) {
	// handle greyscale
	if (args >= 232) {
		var c = (args - 232) * 10 + 8;
		return [c, c, c];
	}

	args -= 16;

	var rem;
	var r = Math.floor(args / 36) / 5 * 255;
	var g = Math.floor((rem = args % 36) / 6) / 5 * 255;
	var b = (rem % 6) / 5 * 255;

	return [r, g, b];
};

convert.rgb.hex = function (args) {
	var integer = ((Math.round(args[0]) & 0xFF) << 16)
		+ ((Math.round(args[1]) & 0xFF) << 8)
		+ (Math.round(args[2]) & 0xFF);

	var string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.hex.rgb = function (args) {
	var match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
	if (!match) {
		return [0, 0, 0];
	}

	var colorString = match[0];

	if (match[0].length === 3) {
		colorString = colorString.split('').map(function (char) {
			return char + char;
		}).join('');
	}

	var integer = parseInt(colorString, 16);
	var r = (integer >> 16) & 0xFF;
	var g = (integer >> 8) & 0xFF;
	var b = integer & 0xFF;

	return [r, g, b];
};

convert.rgb.hcg = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var max = Math.max(Math.max(r, g), b);
	var min = Math.min(Math.min(r, g), b);
	var chroma = (max - min);
	var grayscale;
	var hue;

	if (chroma < 1) {
		grayscale = min / (1 - chroma);
	} else {
		grayscale = 0;
	}

	if (chroma <= 0) {
		hue = 0;
	} else
	if (max === r) {
		hue = ((g - b) / chroma) % 6;
	} else
	if (max === g) {
		hue = 2 + (b - r) / chroma;
	} else {
		hue = 4 + (r - g) / chroma + 4;
	}

	hue /= 6;
	hue %= 1;

	return [hue * 360, chroma * 100, grayscale * 100];
};

convert.hsl.hcg = function (hsl) {
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var c = 1;
	var f = 0;

	if (l < 0.5) {
		c = 2.0 * s * l;
	} else {
		c = 2.0 * s * (1.0 - l);
	}

	if (c < 1.0) {
		f = (l - 0.5 * c) / (1.0 - c);
	}

	return [hsl[0], c * 100, f * 100];
};

convert.hsv.hcg = function (hsv) {
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;

	var c = s * v;
	var f = 0;

	if (c < 1.0) {
		f = (v - c) / (1 - c);
	}

	return [hsv[0], c * 100, f * 100];
};

convert.hcg.rgb = function (hcg) {
	var h = hcg[0] / 360;
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	if (c === 0.0) {
		return [g * 255, g * 255, g * 255];
	}

	var pure = [0, 0, 0];
	var hi = (h % 1) * 6;
	var v = hi % 1;
	var w = 1 - v;
	var mg = 0;

	switch (Math.floor(hi)) {
		case 0:
			pure[0] = 1; pure[1] = v; pure[2] = 0; break;
		case 1:
			pure[0] = w; pure[1] = 1; pure[2] = 0; break;
		case 2:
			pure[0] = 0; pure[1] = 1; pure[2] = v; break;
		case 3:
			pure[0] = 0; pure[1] = w; pure[2] = 1; break;
		case 4:
			pure[0] = v; pure[1] = 0; pure[2] = 1; break;
		default:
			pure[0] = 1; pure[1] = 0; pure[2] = w;
	}

	mg = (1.0 - c) * g;

	return [
		(c * pure[0] + mg) * 255,
		(c * pure[1] + mg) * 255,
		(c * pure[2] + mg) * 255
	];
};

convert.hcg.hsv = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	var v = c + g * (1.0 - c);
	var f = 0;

	if (v > 0.0) {
		f = c / v;
	}

	return [hcg[0], f * 100, v * 100];
};

convert.hcg.hsl = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	var l = g * (1.0 - c) + 0.5 * c;
	var s = 0;

	if (l > 0.0 && l < 0.5) {
		s = c / (2 * l);
	} else
	if (l >= 0.5 && l < 1.0) {
		s = c / (2 * (1 - l));
	}

	return [hcg[0], s * 100, l * 100];
};

convert.hcg.hwb = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;
	var v = c + g * (1.0 - c);
	return [hcg[0], (v - c) * 100, (1 - v) * 100];
};

convert.hwb.hcg = function (hwb) {
	var w = hwb[1] / 100;
	var b = hwb[2] / 100;
	var v = 1 - b;
	var c = v - w;
	var g = 0;

	if (c < 1) {
		g = (v - c) / (1 - c);
	}

	return [hwb[0], c * 100, g * 100];
};

convert.apple.rgb = function (apple) {
	return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];
};

convert.rgb.apple = function (rgb) {
	return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];
};

convert.gray.rgb = function (args) {
	return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
};

convert.gray.hsl = convert.gray.hsv = function (args) {
	return [0, 0, args[0]];
};

convert.gray.hwb = function (gray) {
	return [0, 100, gray[0]];
};

convert.gray.cmyk = function (gray) {
	return [0, 0, 0, gray[0]];
};

convert.gray.lab = function (gray) {
	return [gray[0], 0, 0];
};

convert.gray.hex = function (gray) {
	var val = Math.round(gray[0] / 100 * 255) & 0xFF;
	var integer = (val << 16) + (val << 8) + val;

	var string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.rgb.gray = function (rgb) {
	var val = (rgb[0] + rgb[1] + rgb[2]) / 3;
	return [val / 255 * 100];
};

},{"color-name":5}],10:[function(require,module,exports){
var conversions = require('./conversions');
var route = require('./route');

var convert = {};

var models = Object.keys(conversions);

function wrapRaw(fn) {
	var wrappedFn = function (args) {
		if (args === undefined || args === null) {
			return args;
		}

		if (arguments.length > 1) {
			args = Array.prototype.slice.call(arguments);
		}

		return fn(args);
	};

	// preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

function wrapRounded(fn) {
	var wrappedFn = function (args) {
		if (args === undefined || args === null) {
			return args;
		}

		if (arguments.length > 1) {
			args = Array.prototype.slice.call(arguments);
		}

		var result = fn(args);

		// we're assuming the result is an array here.
		// see notice in conversions.js; don't use box types
		// in conversion functions.
		if (typeof result === 'object') {
			for (var len = result.length, i = 0; i < len; i++) {
				result[i] = Math.round(result[i]);
			}
		}

		return result;
	};

	// preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

models.forEach(function (fromModel) {
	convert[fromModel] = {};

	Object.defineProperty(convert[fromModel], 'channels', {value: conversions[fromModel].channels});
	Object.defineProperty(convert[fromModel], 'labels', {value: conversions[fromModel].labels});

	var routes = route(fromModel);
	var routeModels = Object.keys(routes);

	routeModels.forEach(function (toModel) {
		var fn = routes[toModel];

		convert[fromModel][toModel] = wrapRounded(fn);
		convert[fromModel][toModel].raw = wrapRaw(fn);
	});
});

module.exports = convert;

},{"./conversions":9,"./route":11}],11:[function(require,module,exports){
var conversions = require('./conversions');

/*
	this function routes a model to all other models.

	all functions that are routed have a property `.conversion` attached
	to the returned synthetic function. This property is an array
	of strings, each with the steps in between the 'from' and 'to'
	color models (inclusive).

	conversions that are not possible simply are not included.
*/

function buildGraph() {
	var graph = {};
	// https://jsperf.com/object-keys-vs-for-in-with-closure/3
	var models = Object.keys(conversions);

	for (var len = models.length, i = 0; i < len; i++) {
		graph[models[i]] = {
			// http://jsperf.com/1-vs-infinity
			// micro-opt, but this is simple.
			distance: -1,
			parent: null
		};
	}

	return graph;
}

// https://en.wikipedia.org/wiki/Breadth-first_search
function deriveBFS(fromModel) {
	var graph = buildGraph();
	var queue = [fromModel]; // unshift -> queue -> pop

	graph[fromModel].distance = 0;

	while (queue.length) {
		var current = queue.pop();
		var adjacents = Object.keys(conversions[current]);

		for (var len = adjacents.length, i = 0; i < len; i++) {
			var adjacent = adjacents[i];
			var node = graph[adjacent];

			if (node.distance === -1) {
				node.distance = graph[current].distance + 1;
				node.parent = current;
				queue.unshift(adjacent);
			}
		}
	}

	return graph;
}

function link(from, to) {
	return function (args) {
		return to(from(args));
	};
}

function wrapConversion(toModel, graph) {
	var path = [graph[toModel].parent, toModel];
	var fn = conversions[graph[toModel].parent][toModel];

	var cur = graph[toModel].parent;
	while (graph[cur].parent) {
		path.unshift(graph[cur].parent);
		fn = link(conversions[graph[cur].parent][cur], fn);
		cur = graph[cur].parent;
	}

	fn.conversion = path;
	return fn;
}

module.exports = function (fromModel) {
	var graph = deriveBFS(fromModel);
	var conversion = {};

	var models = Object.keys(graph);
	for (var len = models.length, i = 0; i < len; i++) {
		var toModel = models[i];
		var node = graph[toModel];

		if (node.parent === null) {
			// no possible conversion, or this node is the source model.
			continue;
		}

		conversion[toModel] = wrapConversion(toModel, graph);
	}

	return conversion;
};


},{"./conversions":9}],12:[function(require,module,exports){
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

},{"defined":13}],13:[function(require,module,exports){
module.exports = function () {
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] !== undefined) return arguments[i];
    }
};

},{}],14:[function(require,module,exports){
module.exports = function isArrayish(obj) {
	if (!obj || typeof obj === 'string') {
		return false;
	}

	return obj instanceof Array || Array.isArray(obj) ||
		(obj.length >= 0 && (obj.splice instanceof Function ||
			(Object.getOwnPropertyDescriptor(obj, (obj.length - 1)) && obj.constructor.name !== 'String')));
};

},{}],15:[function(require,module,exports){
module.exports=[["#69d2e7","#a7dbd8","#e0e4cc","#f38630","#fa6900"],["#fe4365","#fc9d9a","#f9cdad","#c8c8a9","#83af9b"],["#ecd078","#d95b43","#c02942","#542437","#53777a"],["#556270","#4ecdc4","#c7f464","#ff6b6b","#c44d58"],["#774f38","#e08e79","#f1d4af","#ece5ce","#c5e0dc"],["#e8ddcb","#cdb380","#036564","#033649","#031634"],["#490a3d","#bd1550","#e97f02","#f8ca00","#8a9b0f"],["#594f4f","#547980","#45ada8","#9de0ad","#e5fcc2"],["#00a0b0","#6a4a3c","#cc333f","#eb6841","#edc951"],["#e94e77","#d68189","#c6a49a","#c6e5d9","#f4ead5"],["#3fb8af","#7fc7af","#dad8a7","#ff9e9d","#ff3d7f"],["#d9ceb2","#948c75","#d5ded9","#7a6a53","#99b2b7"],["#ffffff","#cbe86b","#f2e9e1","#1c140d","#cbe86b"],["#efffcd","#dce9be","#555152","#2e2633","#99173c"],["#343838","#005f6b","#008c9e","#00b4cc","#00dffc"],["#413e4a","#73626e","#b38184","#f0b49e","#f7e4be"],["#ff4e50","#fc913a","#f9d423","#ede574","#e1f5c4"],["#99b898","#fecea8","#ff847c","#e84a5f","#2a363b"],["#655643","#80bca3","#f6f7bd","#e6ac27","#bf4d28"],["#00a8c6","#40c0cb","#f9f2e7","#aee239","#8fbe00"],["#351330","#424254","#64908a","#e8caa4","#cc2a41"],["#554236","#f77825","#d3ce3d","#f1efa5","#60b99a"],["#ff9900","#424242","#e9e9e9","#bcbcbc","#3299bb"],["#5d4157","#838689","#a8caba","#cad7b2","#ebe3aa"],["#8c2318","#5e8c6a","#88a65e","#bfb35a","#f2c45a"],["#fad089","#ff9c5b","#f5634a","#ed303c","#3b8183"],["#ff4242","#f4fad2","#d4ee5e","#e1edb9","#f0f2eb"],["#d1e751","#ffffff","#000000","#4dbce9","#26ade4"],["#f8b195","#f67280","#c06c84","#6c5b7b","#355c7d"],["#1b676b","#519548","#88c425","#bef202","#eafde6"],["#bcbdac","#cfbe27","#f27435","#f02475","#3b2d38"],["#5e412f","#fcebb6","#78c0a8","#f07818","#f0a830"],["#452632","#91204d","#e4844a","#e8bf56","#e2f7ce"],["#eee6ab","#c5bc8e","#696758","#45484b","#36393b"],["#f0d8a8","#3d1c00","#86b8b1","#f2d694","#fa2a00"],["#f04155","#ff823a","#f2f26f","#fff7bd","#95cfb7"],["#2a044a","#0b2e59","#0d6759","#7ab317","#a0c55f"],["#bbbb88","#ccc68d","#eedd99","#eec290","#eeaa88"],["#b9d7d9","#668284","#2a2829","#493736","#7b3b3b"],["#b3cc57","#ecf081","#ffbe40","#ef746f","#ab3e5b"],["#a3a948","#edb92e","#f85931","#ce1836","#009989"],["#67917a","#170409","#b8af03","#ccbf82","#e33258"],["#e8d5b7","#0e2430","#fc3a51","#f5b349","#e8d5b9"],["#aab3ab","#c4cbb7","#ebefc9","#eee0b7","#e8caaf"],["#300030","#480048","#601848","#c04848","#f07241"],["#ab526b","#bca297","#c5ceae","#f0e2a4","#f4ebc3"],["#607848","#789048","#c0d860","#f0f0d8","#604848"],["#a8e6ce","#dcedc2","#ffd3b5","#ffaaa6","#ff8c94"],["#3e4147","#fffedf","#dfba69","#5a2e2e","#2a2c31"],["#b6d8c0","#c8d9bf","#dadabd","#ecdbbc","#fedcba"],["#fc354c","#29221f","#13747d","#0abfbc","#fcf7c5"],["#1c2130","#028f76","#b3e099","#ffeaad","#d14334"],["#edebe6","#d6e1c7","#94c7b6","#403b33","#d3643b"],["#cc0c39","#e6781e","#c8cf02","#f8fcc1","#1693a7"],["#dad6ca","#1bb0ce","#4f8699","#6a5e72","#563444"],["#a7c5bd","#e5ddcb","#eb7b59","#cf4647","#524656"],["#fdf1cc","#c6d6b8","#987f69","#e3ad40","#fcd036"],["#5c323e","#a82743","#e15e32","#c0d23e","#e5f04c"],["#230f2b","#f21d41","#ebebbc","#bce3c5","#82b3ae"],["#b9d3b0","#81bda4","#b28774","#f88f79","#f6aa93"],["#3a111c","#574951","#83988e","#bcdea5","#e6f9bc"],["#5e3929","#cd8c52","#b7d1a3","#dee8be","#fcf7d3"],["#1c0113","#6b0103","#a30006","#c21a01","#f03c02"],["#382f32","#ffeaf2","#fcd9e5","#fbc5d8","#f1396d"],["#e3dfba","#c8d6bf","#93ccc6","#6cbdb5","#1a1f1e"],["#000000","#9f111b","#b11623","#292c37","#cccccc"],["#c1b398","#605951","#fbeec2","#61a6ab","#accec0"],["#8dccad","#988864","#fea6a2","#f9d6ac","#ffe9af"],["#f6f6f6","#e8e8e8","#333333","#990100","#b90504"],["#1b325f","#9cc4e4","#e9f2f9","#3a89c9","#f26c4f"],["#5e9fa3","#dcd1b4","#fab87f","#f87e7b","#b05574"],["#951f2b","#f5f4d7","#e0dfb1","#a5a36c","#535233"],["#413d3d","#040004","#c8ff00","#fa023c","#4b000f"],["#eff3cd","#b2d5ba","#61ada0","#248f8d","#605063"],["#2d2d29","#215a6d","#3ca2a2","#92c7a3","#dfece6"],["#cfffdd","#b4dec1","#5c5863","#a85163","#ff1f4c"],["#4e395d","#827085","#8ebe94","#ccfc8e","#dc5b3e"],["#9dc9ac","#fffec7","#f56218","#ff9d2e","#919167"],["#a1dbb2","#fee5ad","#faca66","#f7a541","#f45d4c"],["#ffefd3","#fffee4","#d0ecea","#9fd6d2","#8b7a5e"],["#a8a7a7","#cc527a","#e8175d","#474747","#363636"],["#ffedbf","#f7803c","#f54828","#2e0d23","#f8e4c1"],["#f8edd1","#d88a8a","#474843","#9d9d93","#c5cfc6"],["#f38a8a","#55443d","#a0cab5","#cde9ca","#f1edd0"],["#4e4d4a","#353432","#94ba65","#2790b0","#2b4e72"],["#0ca5b0","#4e3f30","#fefeeb","#f8f4e4","#a5b3aa"],["#a70267","#f10c49","#fb6b41","#f6d86b","#339194"],["#9d7e79","#ccac95","#9a947c","#748b83","#5b756c"],["#edf6ee","#d1c089","#b3204d","#412e28","#151101"],["#046d8b","#309292","#2fb8ac","#93a42a","#ecbe13"],["#4d3b3b","#de6262","#ffb88c","#ffd0b3","#f5e0d3"],["#fffbb7","#a6f6af","#66b6ab","#5b7c8d","#4f2958"],["#ff003c","#ff8a00","#fabe28","#88c100","#00c176"],["#fcfef5","#e9ffe1","#cdcfb7","#d6e6c3","#fafbe3"],["#9cddc8","#bfd8ad","#ddd9ab","#f7af63","#633d2e"],["#30261c","#403831","#36544f","#1f5f61","#0b8185"],["#d1313d","#e5625c","#f9bf76","#8eb2c5","#615375"],["#ffe181","#eee9e5","#fad3b2","#ffba7f","#ff9c97"],["#aaff00","#ffaa00","#ff00aa","#aa00ff","#00aaff"],["#c2412d","#d1aa34","#a7a844","#a46583","#5a1e4a"],["#75616b","#bfcff7","#dce4f7","#f8f3bf","#d34017"],["#805841","#dcf7f3","#fffcdd","#ffd8d8","#f5a2a2"],["#379f7a","#78ae62","#bbb749","#e0fbac","#1f1c0d"],["#73c8a9","#dee1b6","#e1b866","#bd5532","#373b44"],["#caff42","#ebf7f8","#d0e0eb","#88abc2","#49708a"],["#7e5686","#a5aad9","#e8f9a2","#f8a13f","#ba3c3d"],["#82837e","#94b053","#bdeb07","#bffa37","#e0e0e0"],["#111625","#341931","#571b3c","#7a1e48","#9d2053"],["#312736","#d4838f","#d6abb1","#d9d9d9","#c4ffeb"],["#84b295","#eccf8d","#bb8138","#ac2005","#2c1507"],["#395a4f","#432330","#853c43","#f25c5e","#ffa566"],["#fde6bd","#a1c5ab","#f4dd51","#d11e48","#632f53"],["#6da67a","#77b885","#86c28b","#859987","#4a4857"],["#bed6c7","#adc0b4","#8a7e66","#a79b83","#bbb2a1"],["#058789","#503d2e","#d54b1a","#e3a72f","#f0ecc9"],["#e21b5a","#9e0c39","#333333","#fbffe3","#83a300"],["#261c21","#6e1e62","#b0254f","#de4126","#eb9605"],["#b5ac01","#ecba09","#e86e1c","#d41e45","#1b1521"],["#efd9b4","#d6a692","#a39081","#4d6160","#292522"],["#fbc599","#cdbb93","#9eae8a","#335650","#f35f55"],["#c75233","#c78933","#d6ceaa","#79b5ac","#5e2f46"],["#793a57","#4d3339","#8c873e","#d1c5a5","#a38a5f"],["#f2e3c6","#ffc6a5","#e6324b","#2b2b2b","#353634"],["#512b52","#635274","#7bb0a8","#a7dbab","#e4f5b1"],["#59b390","#f0ddaa","#e47c5d","#e32d40","#152b3c"],["#fdffd9","#fff0b8","#ffd6a3","#faad8e","#142f30"],["#11766d","#410936","#a40b54","#e46f0a","#f0b300"],["#11644d","#a0b046","#f2c94e","#f78145","#f24e4e"],["#c7fcd7","#d9d5a7","#d9ab91","#e6867a","#ed4a6a"],["#595643","#4e6b66","#ed834e","#ebcc6e","#ebe1c5"],["#331327","#991766","#d90f5a","#f34739","#ff6e27"],["#bf496a","#b39c82","#b8c99d","#f0d399","#595151"],["#f1396d","#fd6081","#f3ffeb","#acc95f","#8f9924"],["#efeecc","#fe8b05","#fe0557","#400403","#0aabba"],["#e5eaa4","#a8c4a2","#69a5a4","#616382","#66245b"],["#e9e0d1","#91a398","#33605a","#070001","#68462b"],["#e4ded0","#abccbd","#7dbeb8","#181619","#e32f21"],["#e0eff1","#7db4b5","#ffffff","#680148","#000000"],["#b7cbbf","#8c886f","#f9a799","#f4bfad","#f5dabd"],["#ffb884","#f5df98","#fff8d4","#c0d1c2","#2e4347"],["#6da67a","#99a66d","#a9bd68","#b5cc6a","#c0de5d"],["#b1e6d1","#77b1a9","#3d7b80","#270a33","#451a3e"],["#fc284f","#ff824a","#fea887","#f6e7f7","#d1d0d7"],["#ffab07","#e9d558","#72ad75","#0e8d94","#434d53"],["#311d39","#67434f","#9b8e7e","#c3ccaf","#a51a41"],["#5cacc4","#8cd19d","#cee879","#fcb653","#ff5254"],["#44749d","#c6d4e1","#ffffff","#ebe7e0","#bdb8ad"],["#cfb590","#9e9a41","#758918","#564334","#49281f"],["#e4e4c5","#b9d48b","#8d2036","#ce0a31","#d3e4c5"],["#ccf390","#e0e05a","#f7c41f","#fc930a","#ff003d"],["#807462","#a69785","#b8faff","#e8fdff","#665c49"],["#ec4401","#cc9b25","#13cd4a","#7b6ed6","#5e525c"],["#cc5d4c","#fffec6","#c7d1af","#96b49c","#5b5847"],["#e3e8cd","#bcd8bf","#d3b9a3","#ee9c92","#fe857e"],["#360745","#d61c59","#e7d84b","#efeac5","#1b8798"],["#2b222c","#5e4352","#965d62","#c7956d","#f2d974"],["#e7edea","#ffc52c","#fb0c06","#030d4f","#ceecef"],["#eb9c4d","#f2d680","#f3ffcf","#bac9a9","#697060"],["#fff3db","#e7e4d5","#d3c8b4","#c84648","#703e3b"],["#f5dd9d","#bcc499","#92a68a","#7b8f8a","#506266"],["#f2e8c4","#98d9b6","#3ec9a7","#2b879e","#616668"],["#041122","#259073","#7fda89","#c8e98e","#e6f99d"],["#c6cca5","#8ab8a8","#6b9997","#54787d","#615145"],["#4b1139","#3b4058","#2a6e78","#7a907c","#c9b180"],["#8d7966","#a8a39d","#d8c8b8","#e2ddd9","#f8f1e9"],["#2d1b33","#f36a71","#ee887a","#e4e391","#9abc8a"],["#95a131","#c8cd3b","#f6f1de","#f5b9ae","#ee0b5b"],["#79254a","#795c64","#79927d","#aeb18e","#e3cf9e"],["#429398","#6b5d4d","#b0a18f","#dfcdb4","#fbeed3"],["#1d1313","#24b694","#d22042","#a3b808","#30c4c9"],["#9d9e94","#c99e93","#f59d92","#e5b8ad","#d5d2c8"],["#f0ffc9","#a9da88","#62997a","#72243d","#3b0819"],["#322938","#89a194","#cfc89a","#cc883a","#a14016"],["#452e3c","#ff3d5a","#ffb969","#eaf27e","#3b8c88"],["#f06d61","#da825f","#c4975c","#a8ab7b","#8cbf99"],["#540045","#c60052","#ff714b","#eaff87","#acffe9"],["#2b2726","#0a516d","#018790","#7dad93","#bacca4"],["#027b7f","#ffa588","#d62957","#bf1e62","#572e4f"],["#23192d","#fd0a54","#f57576","#febf97","#f5ecb7"],["#fa6a64","#7a4e48","#4a4031","#f6e2bb","#9ec6b8"],["#a3c68c","#879676","#6e6662","#4f364a","#340735"],["#f6d76b","#ff9036","#d6254d","#ff5475","#fdeba9"],["#80a8a8","#909d9e","#a88c8c","#ff0d51","#7a8c89"],["#a32c28","#1c090b","#384030","#7b8055","#bca875"],["#6d9788","#1e2528","#7e1c13","#bf0a0d","#e6e1c2"],["#373737","#8db986","#acce91","#badb73","#efeae4"],["#280904","#680e34","#9a151a","#c21b12","#fc4b2a"],["#fb6900","#f63700","#004853","#007e80","#00b9bd"],["#e6b39a","#e6cba5","#ede3b4","#8b9e9b","#6d7578"],["#641f5e","#676077","#65ac92","#c2c092","#edd48e"],["#a69e80","#e0ba9b","#e7a97e","#d28574","#3b1922"],["#161616","#c94d65","#e7c049","#92b35a","#1f6764"],["#234d20","#36802d","#77ab59","#c9df8a","#f0f7da"],["#4b3e4d","#1e8c93","#dbd8a2","#c4ac30","#d74f33"],["#ff7474","#f59b71","#c7c77f","#e0e0a8","#f1f1c1"],["#e6eba9","#abbb9f","#6f8b94","#706482","#703d6f"],["#26251c","#eb0a44","#f2643d","#f2a73d","#a0e8b7"],["#fdcfbf","#feb89f","#e23d75","#5f0d3b","#742365"],["#230b00","#a29d7f","#d4cfa5","#f8ecd4","#aabe9b"],["#85847e","#ab6a6e","#f7345b","#353130","#cbcfb4"],["#d4f7dc","#dbe7b4","#dbc092","#e0846d","#f51441"],["#d3d5b0","#b5cea4","#9dc19d","#8c7c62","#71443f"],["#4f364c","#5e405f","#6b6b6b","#8f9e6f","#b1cf72"],["#bfcdb4","#f7e5bf","#ead2a4","#efb198","#7d5d4e"],["#6f5846","#a95a52","#e35b5d","#f18052","#ffa446"],["#ff3366","#c74066","#8f4d65","#575a65","#1f6764"],["#ffff99","#d9cc8c","#b39980","#8c6673","#663366"],["#c46564","#f0e999","#b8c99d","#9b726f","#eeb15b"],["#eeda95","#b7c27e","#9a927b","#8a6a6b","#805566"],["#62a07b","#4f8b89","#536c8d","#5c4f79","#613860"],["#1a081f","#4d1d4d","#05676e","#489c79","#ebc288"],["#f0f0d8","#b4debe","#77cca4","#666666","#b4df37"],["#ed6464","#bf6370","#87586c","#574759","#1a1b1c"],["#ccb24c","#f7d683","#fffdc0","#fffffd","#457d97"],["#7a5b3e","#fafafa","#fa4b00","#cdbdae","#1f1f1f"],["#566965","#948a71","#cc9476","#f2a176","#ff7373"],["#d31900","#ff6600","#fff2af","#7cb490","#000000"],["#d24858","#ea8676","#eab05e","#fdeecd","#493831"],["#ebeaa9","#ebc588","#7d2948","#3b0032","#0e0b29"],["#411f2d","#ac4147","#f88863","#ffc27f","#ffe29a"],["#e7e79d","#c0d890","#78a890","#606078","#d8a878"],["#9dbcbc","#f0f0af","#ff370f","#332717","#6bacbf"],["#063940","#195e63","#3e838c","#8ebdb6","#ece1c3"],["#e8c382","#b39d69","#a86b4c","#7d1a0c","#340a0b"],["#94654c","#f89fa1","#fabdbd","#fad6d6","#fefcd0"],["#595b5a","#14c3a2","#0de5a8","#7cf49a","#b8fd99"],["#cddbc2","#f7e4c6","#fb9274","#f5565b","#875346"],["#f0ddbd","#ba3622","#851e25","#520c30","#1c997f"],["#312c20","#494d4b","#7c7052","#b3a176","#e2cb92"],["#e7dd96","#e16639","#ad860a","#b7023f","#55024a"],["#574c41","#e36b6b","#e3a56b","#e3c77b","#96875a"],["#3f2c26","#dd423e","#a2a384","#eac388","#c5ad4b"],["#0a0310","#49007e","#ff005b","#ff7d10","#ffb238"],["#cdeccc","#edd269","#e88460","#f23460","#321d2e"],["#1f1f20","#2b4c7e","#567ebb","#606d80","#dce0e6"],["#f3e7d7","#f7d7cd","#f8c7c9","#e0c0c7","#c7b9c5"],["#ecbe13","#738c79","#6a6b5f","#2c2b26","#a43955"],["#dde0cf","#c6be9a","#ad8b32","#937460","#8c5b7b"],["#181419","#4a073c","#9e0b41","#cc3e18","#f0971c"],["#029daf","#e5d599","#ffc219","#f07c19","#e32551"],["#fff5de","#b8d9c8","#917081","#750e49","#4d002b"],["#4d3b36","#eb613b","#f98f6f","#c1d9cd","#f7eadc"],["#413040","#6c6368","#b9a173","#eaa353","#ffefa9"],["#ffcdb8","#fdeecf","#c8c696","#97bea9","#37260c"],["#213435","#46685b","#648a64","#a6b985","#e1e3ac"],["#ffffff","#fffaeb","#f0f0d8","#cfcfcf","#967c52"],["#e8d3a9","#e39b7d","#6e6460","#89b399","#bcbfa3"],["#ed5672","#160e32","#9eae8a","#cdbb93","#fbc599"],["#001449","#012677","#005bc5","#00b4fc","#17f9ff"],["#4dab8c","#542638","#8f244d","#c9306b","#e86f9e"],["#67be9b","#95d0b8","#fcfcd7","#f1db42","#f04158"],["#2b1719","#02483e","#057c46","#9bb61b","#f8be00"],["#ffff00","#ccd91a","#99b333","#668c4d","#336666"],["#130912","#3e1c33","#602749","#b14623","#f6921d"],["#e7eed0","#cad1c3","#948e99","#51425f","#2e1437"],["#e25858","#e9d6af","#ffffdd","#c0efd2","#384252"],["#e6a06f","#9e9c71","#5e8271","#33454e","#242739"],["#faf6d0","#c7d8ab","#909a92","#744f78","#30091e"],["#acdeb2","#e1eab5","#edad9e","#fe4b74","#390d2d"],["#42282c","#6ca19e","#84abaa","#ded1b6","#6d997a"],["#9f0a28","#d55c2b","#f6e7d3","#89a46f","#55203c"],["#418e8e","#5a4e3c","#c4d428","#d8e472","#e9ebbf"],["#1693a5","#45b5c4","#7ececa","#a0ded6","#c7ede8"],["#fdffd9","#73185e","#36bba6","#0c0d02","#8b911a"],["#a69a90","#4a403d","#fff1c1","#facf7d","#ea804c"],["#f7f3d5","#ffdabf","#fa9b9b","#e88087","#635063"],["#8a8780","#e6e5c4","#d6d1af","#e47267","#d7d8c5"],["#a7cd2c","#bada5f","#cee891","#e1f5c4","#50c8c6"],["#b2cba3","#e0df9f","#e7a83e","#9a736e","#ea525f"],["#aadead","#bbdead","#ccdead","#dddead","#eedead"],["#fc580c","#fc6b0a","#f8872e","#ffa927","#fdca49"],["#fa2e59","#ff703f","#f7bc05","#ecf6bb","#76bcad"],["#785d56","#be4c54","#c6b299","#e6d5c1","#fff4e3"],["#f0371a","#000000","#f7e6a6","#3e6b48","#b5b479"],["#cc2649","#992c4b","#66324c","#33384e","#003e4f"],["#ffabab","#ffdaab","#ddffab","#abe4ff","#d9abff"],["#f1e8b4","#b2bb91","#d7bf5e","#d16344","#83555e"],["#42393b","#75c9a3","#bac99a","#ffc897","#f7efa2"],["#a7321c","#ffdc68","#cc982a","#928941","#352504"],["#e0dc8b","#f6aa3d","#ed4c57","#574435","#6cc4b9"],["#000000","#001f36","#1c5560","#79ae92","#fbffcd"],["#f6c7b7","#f7a398","#fa7f77","#b42529","#000000"],["#c9d1d3","#f7f7f7","#9dd3df","#3b3737","#991818"],["#afc7b9","#ffe1c9","#fac7b4","#fca89d","#998b82"],["#fbfee5","#c91842","#98173d","#25232d","#a8e7ca"],["#f3e6bc","#f1c972","#f5886b","#72ae95","#5a3226"],["#fa8cb1","#fdc5c9","#fffee1","#cfb699","#9e6d4e"],["#674f23","#e48b69","#e1b365","#e5db84","#ffeeac"],["#dbd9b7","#c1c9c8","#a5b5ab","#949a8e","#615566"],["#f2cc67","#f38264","#f40034","#5f051f","#75baa8"],["#d9d4a8","#d15c57","#cc3747","#5c374b","#4a5f67"],["#84c1b1","#ad849a","#d64783","#fd135a","#40202a"],["#71dbd2","#eeffdb","#ade4b5","#d0eaa3","#fff18c"],["#b88000","#d56f00","#f15500","#ff2654","#ff0c71"],["#020304","#541f14","#938172","#cc9e61","#626266"],["#f4f4f4","#9ba657","#f0e5c9","#a68c69","#594433"],["#244242","#51bd9c","#a3e3b1","#ffe8b3","#ff2121"],["#1f0310","#442433","#a3d95b","#aae3ab","#f6f0bc"],["#00ccbe","#09a6a3","#9dbfaf","#edebc9","#fcf9d8"],["#4eb3de","#8de0a6","#fcf09f","#f27c7c","#de528c"],["#ff0092","#ffca1b","#b6ff00","#228dff","#ba01ff"],["#ffc870","#f7f7c6","#c8e3c5","#9cad9a","#755858"],["#4c3d31","#f18273","#f2bd76","#f4f5de","#c4ceb0"],["#84bfc3","#fff5d6","#ffb870","#d96153","#000511"],["#fffdc0","#b9d7a1","#fead26","#ca221f","#590f0c"],["#241811","#d4a979","#e3c88f","#c2c995","#a8bd95"],["#2197a3","#f71e6c","#f07868","#ebb970","#e7d3b0"],["#b2b39f","#c8c9b5","#dedfc5","#f5f7bd","#3d423c"],["#b31237","#f03813","#ff8826","#ffb914","#2c9fa3"],["#15212a","#99c9bd","#d7b89c","#feab8d","#f4c9a3"],["#002c2b","#ff3d00","#ffbc11","#0a837f","#076461"],["#f88f89","#eec276","#fbf6d0","#79c3aa","#1f0e1a"],["#bf2a23","#a6ad3c","#f0ce4e","#cf872e","#8a211d"],["#e2df9a","#ebe54d","#757449","#4b490b","#ff0051"],["#001848","#301860","#483078","#604878","#906090"],["#85a29e","#ffebbf","#f0d442","#f59330","#b22148"],["#79a687","#718063","#67594d","#4f2b38","#1d1016"],["#fe6c2b","#d43b2d","#9f102c","#340016","#020001"],["#e6e1cd","#c6d8c0","#d6b3b1","#f97992","#231b42"],["#69d0b3","#9bdab3","#b4dfb3","#cde4b3","#d9cf85"],["#75372d","#928854","#96a782","#d4ce9e","#d8523d"],["#651366","#a71a5b","#e7204e","#f76e2a","#f0c505"],["#ffffff","#a1c1be","#59554e","#f3f4e5","#e2e3d9"],["#332c26","#db1414","#e8591c","#7fb8b0","#c5e65c"],["#2f2bad","#ad2bad","#e42692","#f71568","#f7db15"],["#8e407a","#fe6962","#f9ba84","#eee097","#ffffe5"],["#45aab8","#e1d772","#faf4b1","#394240","#f06b50"],["#ccded2","#fffbd4","#f5ddbb","#e3b8b2","#a18093"],["#d1b68d","#87555c","#492d49","#51445f","#5a5c75"],["#539fa2","#72b1a4","#abccb1","#c4dbb4","#d4e2b6"],["#80d3bb","#bafdc2","#e5f3ba","#5c493d","#3a352f"],["#a8bcbd","#fcdcb3","#f88d87","#d65981","#823772"],["#ffe4aa","#fca699","#e2869b","#c9729f","#583b7e"],["#b5f4bc","#fff19e","#ffdc8a","#ffba6b","#ff6543"],["#ff4746","#e8da5e","#92b55f","#487d76","#4b4452"],["#002e34","#004443","#00755c","#00c16c","#90ff17"],["#101942","#80043a","#f60c49","#f09580","#fdf2b4"],["#0fc3e8","#0194be","#e2d397","#f07e13","#481800"],["#c9b849","#c96823","#be3100","#6f0b00","#241714"],["#9e1e4c","#ff1168","#25020f","#8f8f8f","#ececec"],["#272d4d","#b83564","#ff6a5a","#ffb350","#83b8aa"],["#c4ddd6","#d4ddd6","#e4ddd6","#e4e3cd","#ececdd"],["#4d4a4b","#f60069","#ff41a1","#ff90ab","#ffccd1"],["#1f0a1d","#334f53","#45936c","#9acc77","#e5ead4"],["#899aa1","#bda2a2","#fbbe9a","#fad889","#faf5c8"],["#4b538b","#15191d","#f7a21b","#e45635","#d60257"],["#706767","#e87474","#e6a37a","#d9c777","#c0dbab"],["#000000","#ff8830","#d1b8a0","#aeced2","#cbdcdf"],["#db5643","#1c0f0e","#70aa87","#9fb38f","#c5bd99"],["#36173d","#ff4845","#ff745f","#ffc55f","#ffec5e"],["#000706","#00272d","#134647","#0c7e7e","#bfac8b"],["#170132","#361542","#573e54","#85ae72","#bce1ab"],["#aab69b","#9e906e","#9684a3","#8870ff","#000000"],["#d8d8d8","#e2d9d8","#ecdad8","#f5dbd8","#ffdcd8"],["#c8d197","#d89845","#c54b2c","#473430","#11baac"],["#f8f8ec","#aedd2b","#066699","#0a5483","#02416d"],["#d7e8d5","#e6f0af","#e8ed76","#ffcd57","#4a3a47"],["#f1ecdf","#d4c9ad","#c7ba99","#000000","#f58723"],["#e9dfcc","#f3a36b","#cd5b51","#554865","#352630"],["#dacdbd","#f2b8a0","#ef97a3","#df5c7e","#d4486f"],["#565175","#538a95","#67b79e","#ffb727","#e4491c"],["#260729","#2a2344","#495168","#ccbd9e","#d8ccb2"],["#aef055","#e0ffc3","#25e4bc","#3f8978","#514442"],["#444444","#fcf7d1","#a9a17a","#b52c00","#8c0005"],["#f7f799","#e0d124","#f0823f","#bd374c","#443a37"],["#288d85","#b9d9b4","#d18e8f","#b05574","#f0a991"],["#dbda97","#efae54","#ef6771","#4b1d37","#977e77"],["#002930","#ffffff","#f8f0af","#ac4a00","#000000"],["#184848","#006060","#007878","#a8c030","#f0f0d8"],["#b9113f","#a8636e","#97b59d","#cfcca8","#ffe3b3"],["#c8ce13","#f8f5c1","#349e97","#2c0d1a","#de1a72"],["#913f33","#ff705f","#ffaa67","#ffdfab","#9fb9c2"],["#fee9a6","#fec0ab","#fa5894","#660860","#9380b7"],["#ed7b83","#ec8a90","#eba2a4","#e6d1ca","#eee9c7"],["#fcfdeb","#e3cebd","#c1a2a0","#725b75","#322030"],["#e04891","#e1b7ed","#f5e1e2","#d1e389","#b9de51"],["#d3c8b4","#d4f1db","#eecab1","#fe6c63","#240910"],["#43777a","#442432","#c02948","#d95b45","#ecd079"],["#edeccf","#f1c694","#dc6378","#207178","#101652"],["#95de90","#cef781","#f7c081","#ff7857","#6b6b6b"],["#edd58f","#c2bf92","#66ac92","#686077","#641f5e"],["#f4f8e6","#f2e9e6","#4a3d3d","#ff6161","#d8dec3"],["#f9ebf2","#f3e2e8","#fcd7da","#f58f9a","#3c363b"],["#736558","#fd65a0","#fef5c6","#aaf2e4","#31d5de"],["#f9f6ec","#88a1a8","#502940","#790614","#0d0c0c"],["#affbff","#d2fdfe","#fefac2","#febf97","#fe6960"],["#ffffff","#a1ac88","#757575","#464d70","#000000"],["#f2502c","#cad17a","#fcf59b","#91c494","#c42311"],["#2e1e45","#612a52","#ba3259","#ff695c","#ccbca1"],["#910142","#6c043c","#210123","#fef7d5","#0ec0c1"],["#204b5e","#426b65","#baab6a","#fbea80","#fdfac7"],["#8dc9b5","#f6f4c2","#ffc391","#ff695c","#8c315d"],["#e3ba6a","#bfa374","#6d756a","#4d686f","#364461"],["#fffab3","#a2e5d2","#63b397","#9dab34","#2c2321"],["#f7f1e1","#ffdbd7","#ffb2c1","#ce7095","#855e6e"],["#f7dece","#eed7c5","#ccccbb","#9ec4bb","#2d2e2c"],["#4180ab","#ffffff","#8ab3cf","#bdd1de","#e4ebf0"],["#43204a","#7f1e47","#422343","#c22047","#ea284b"],["#686466","#839cb5","#96d7eb","#b1e1e9","#f2e4f9"],["#ff275e","#e6bc56","#7f440a","#6a9277","#f8d9bd"],["#50232e","#f77c3e","#faba66","#fce185","#a2cca5"],["#b2d9f7","#487aa1","#3d3c3b","#7c8071","#dde3ca"],["#9c8680","#eb5e7f","#f98f6f","#dbbf6b","#c8eb6a"],["#482c21","#a73e2b","#d07e0e","#e9deb0","#2f615e"],["#e4e6c3","#88baa3","#ba1e4a","#63203d","#361f2d"],["#f7f6e4","#e2d5c1","#5f3711","#f6f6e2","#d4c098"],["#ffab03","#fc7f03","#fc3903","#d1024e","#a6026c"],["#c72546","#66424c","#768a4f","#b3c262","#d5ca98"],["#c3dfd7","#c8dfd2","#cddfcd","#d2dfc8","#d7dfc3"],["#0db2ac","#f5dd7e","#fc8d4d","#fc694d","#faba32"],["#e8de92","#810e0b","#febea3","#fce5b1","#f6f5da"],["#63594d","#b18272","#c2b291","#d6e4c3","#eae3d1"],["#dae2cb","#96c3a6","#6cb6a5","#221d34","#90425c"],["#917f6e","#efbc98","#efd2be","#efe1d1","#d9ddcd"],["#3f324d","#93c2b1","#ffeacc","#ff995e","#de1d6a"],["#f3d915","#e9e4bb","#bfd4b7","#a89907","#1a1c27"],["#042608","#2a5c0b","#808f12","#faedd9","#ea2a15"],["#dadad8","#fe6196","#ff2c69","#1ea49d","#cbe65b"],["#454545","#743455","#a22365","#d11174","#ff0084"],["#8c0e48","#80ab99","#e8dbad","#b39e58","#99822d"],["#796c86","#74aa9b","#91c68d","#ece488","#f6f5cd"],["#678d6c","#fc7d23","#fa3c08","#bd0a41","#772a53"],["#dbf73b","#c0cc39","#eb0258","#a6033f","#2b2628"],["#ffc2ce","#80b3ff","#fd6e8a","#a2122f","#693726"],["#ab505e","#d9a071","#cfc88f","#a5b090","#607873"],["#f9d423","#ede574","#e1f5c4","#add6bc","#79b7b4"],["#172c3c","#274862","#995052","#d96831","#e6b33d"],["#f8f69f","#bab986","#7c7b6c","#3e3e53","#000039"],["#f1ebeb","#eee8e8","#cacaca","#24c0eb","#5cceee"],["#e6e8e3","#d7dacf","#bec3bc","#8f9a9c","#65727a"],["#fffbf0","#968f4b","#7a6248","#ab9597","#030506"],["#efac41","#de8531","#b32900","#6c1305","#330a04"],["#72bca5","#f4ddb4","#f1ae2b","#bc0b27","#4a2512"],["#ebf2f2","#d0f2e7","#bcebdf","#ade0db","#d9dbdb"],["#f4e196","#a6bf91","#5f9982","#78576b","#400428"],["#615050","#776a6a","#ad9a6f","#f5f1e8","#fcfcfc"],["#b9340b","#cea45c","#c5be8b","#498379","#3f261c"],["#ddcaa2","#aebea3","#b97479","#d83957","#4e5c69"],["#141827","#62455b","#736681","#c1d9d0","#fffae3"],["#2f3559","#9a5071","#e394a7","#f1bbbb","#e6d8cb"],["#b877a8","#b8008a","#ff3366","#ffcc33","#ccff33"],["#171133","#581e44","#c5485a","#d4be99","#e0ffcc"],["#ff0f35","#f86254","#fea189","#f3d5a5","#bab997"],["#cfb698","#ff5d57","#dd0b64","#6f0550","#401c2a"],["#d1dbc8","#b8c2a0","#c97c7a","#da3754","#1f1106"],["#2b9eb3","#85cc9c","#bcd9a0","#edf79e","#fafad7"],["#f26b7a","#f0f2dc","#d9eb52","#8ac7de","#87796f"],["#bdbf90","#35352b","#e7e9c4","#ec6c2b","#feae4b"],["#eeccbb","#f1731f","#e03e36","#bd0d59","#730662"],["#ebe5b2","#f6f3c2","#f7c69f","#f89b7e","#b5a28b"],["#20130a","#142026","#123142","#3b657a","#e9f0c9"],["#9d9f89","#84af97","#8bc59b","#b2de93","#ccee8d"],["#ff9934","#ffc018","#f8fef4","#cde54e","#b3c631"],["#bda0a2","#ffe6db","#d1eaee","#cbc8b5","#efb0a9"],["#31827c","#95c68f","#f7e9aa","#fc8a80","#fd4e6d"],["#4d433d","#525c5a","#56877d","#8ccc81","#bade57"],["#6a3d5a","#66666e","#6d8d76","#b0c65a","#ebf74f"],["#353437","#53576b","#7a7b7c","#a39b7e","#e2c99f"],["#ff9966","#d99973","#b39980","#8c998c","#669999"],["#d1dab9","#92bea5","#6f646c","#671045","#31233e"],["#839074","#939e78","#a8a878","#061013","#cdcd76"],["#52423c","#ad5c70","#d3ad98","#edd4be","#b9c3c4"],["#ffcfad","#ffe4b8","#e6d1b1","#b8aa95","#5e5a54"],["#eb9d8d","#93865a","#a8bb9a","#c5cba6","#efd8a9"],["#a8c078","#a89048","#a84818","#61290e","#330c0c"],["#27081d","#47232c","#66997b","#a4ca8b","#d2e7aa"],["#ffe7bf","#ffc978","#c9c987","#d1a664","#c27b57"],["#000000","#ed0b65","#b2a700","#fcae11","#770493"],["#031c30","#5a3546","#b5485f","#fc6747","#fa8d3b"],["#a22c27","#4f2621","#9f8241","#ebd592","#929867"],["#8fc9b9","#d8d9c0","#d18e8f","#ab5c72","#91334f"],["#302727","#ba2d2d","#f2511b","#f2861b","#c7c730"],["#f9ded3","#fdd1b6","#fab4b6","#c7b6be","#89abb4"],["#7375a5","#21a3a3","#13c8b5","#6cf3d5","#2b364a"],["#820081","#fe59c2","#fe40b9","#fe1cac","#390039"],["#262525","#525252","#e6ddbc","#822626","#690202"],["#f3214e","#cf023b","#000000","#f4a854","#fff8bc"],["#482344","#2b5166","#429867","#fab243","#e02130"],["#a9b79e","#e8ddbd","#dba887","#c25848","#9d1d36"],["#6e9167","#ffdd8c","#ff8030","#cc4e00","#700808"],["#ff3366","#e64066","#cc4d66","#b35966","#996666"],["#331436","#7a1745","#cb4f57","#eb9961","#fcf4b6"],["#ec4b59","#9a2848","#130716","#fc8c77","#f8dfbd"],["#1f0b0c","#e7fccf","#d6c396","#b3544f","#300511"],["#f3dcb2","#facb97","#f59982","#ed616f","#f2116c"],["#f7ead9","#e1d2a9","#88b499","#619885","#67594e"],["#adeada","#bdeadb","#cdeadc","#ddeadd","#edeade"],["#666666","#abdb25","#999999","#ffffff","#cccccc"],["#210518","#3d1c33","#5e4b55","#7c917f","#93bd9a"],["#fdbf5c","#f69a0b","#d43a00","#9b0800","#1d2440"],["#fdf4b0","#a4dcb9","#5bcebf","#32b9be","#2e97b7"],["#8ba6ac","#d7d7b8","#e5e6c9","#f8f8ec","#bdcdd0"],["#295264","#fad9a6","#bd2f28","#89373d","#142433"],["#ecf8d4","#e0deab","#cb8e5f","#85685a","#0d0502"],["#a2c7bb","#dde29f","#ac8d49","#ac0d0d","#320606"],["#ff667c","#fbbaa4","#f9e5c0","#2c171c","#b6d0a0"],["#4b4b55","#f4324a","#ff516c","#fb9c5a","#fcc755"],["#ffad08","#edd75a","#73b06f","#0c8f8f","#405059"],["#a8ab84","#000000","#c6c99d","#0c0d05","#e7ebb0"],["#332e1d","#5ac7aa","#9adcb9","#fafcd3","#efeba9"],["#d45e80","#c6838c","#cfbf9e","#f7dea8","#f6be5f"],["#fce7d2","#e0dbbd","#c0ceaa","#fd8086","#eb5874"],["#fcf3e3","#ed4c87","#63526e","#6cbaa4","#f2ad5e"],["#d6d578","#b1bf63","#9dad42","#258a60","#0a3740"],["#d1f7ba","#dbdea6","#d1bd95","#8c686b","#391b4a"],["#e1e6e3","#bfd6c7","#c7bd93","#ff7876","#574b45"],["#abece4","#c4d004","#ff9f15","#fb7991","#926d40"],["#ffffff","#ff97ca","#ff348e","#be0049","#770021"],["#fb6f24","#8ca315","#5191c1","#1e6495","#0a4b75"],["#dfd0af","#e8acac","#a45785","#85586c","#a1c0a1"],["#470d3b","#7e2f56","#c0576f","#e48679","#febd84"],["#940533","#c0012a","#f5061d","#ff8800","#ffb300"],["#0c0636","#095169","#059b9a","#53ba83","#9fd86b"],["#de4c45","#d9764d","#cc9e8a","#c1c5c7","#ebdfc6"],["#d24d6c","#ad8484","#d9d5bb","#c1858f","#b05574"],["#a6988a","#88a19f","#6aabb5","#4bb4ca","#1ec3ea"],["#7f135f","#a0667a","#c2b895","#c4cab0","#c7dcca"],["#d9d9db","#b7ae8f","#978f84","#4a362f","#121210"],["#e9d7a9","#d2d09f","#d5a57f","#b56a65","#4b3132"],["#99cccc","#a8bdc2","#b8aeb8","#c79ead","#d78fa3"],["#060212","#fe5412","#fc1a1a","#795c06","#4f504f"],["#c3b68c","#6e5b54","#b94866","#afb7a0","#f4eed4"],["#5d917d","#fff9de","#cdd071","#b81c48","#632739"],["#fef0a5","#f8d28b","#e3b18b","#a78d9e","#74819d"],["#fcd8af","#fec49b","#fe9b91","#fd6084","#045071"],["#3c515d","#3d6868","#40957f","#a7c686","#fcee8c"],["#b7aea5","#f77014","#e33c08","#433d3d","#221d21"],["#2c2b4b","#a75293","#9c7a9d","#9ddacb","#f8dcb4"],["#edf3c5","#f2cc49","#b7be5f","#24b399","#2d1c28"],["#200e38","#6a0e47","#b50d57","#ff0d66","#dec790"],["#ebebab","#78bd91","#4d8f81","#9b4b54","#f22b56"],["#27191c","#2d3839","#114d4d","#6e9987","#e0e4ce"],["#f4fce2","#d3ebc7","#aabfaa","#bf9692","#fc0284"],["#941f1f","#ce6b5d","#ffefb9","#7b9971","#34502b"],["#0ccaba","#e3f5b7","#e6ae00","#d46700","#9e3f00"],["#ff7a24","#ff6d54","#f76d75","#e8728f","#c97ba5"],["#fcf6d2","#fcf6d2","#fbe2b9","#c6c39a","#281f20"],["#fcf9ce","#c4e0a6","#dea37a","#bd3737","#d54c4a"],["#f8db7e","#ec6349","#ce2340","#6f1b2c","#310a26"],["#b6d9c3","#c6a9ac","#d48299","#e64e81","#fd0a60"],["#95aa61","#121310","#f6f8ee","#d6e68a","#899752"],["#3f264d","#5d2747","#9f3647","#db4648","#fb9553"],["#f9f9e7","#505045","#161613","#c0a1ae","#c1e0e0"],["#689195","#050000","#ab8288","#cea4a6","#ffcdc5"],["#ffe6bd","#ffcc7a","#e68a6c","#8a2f62","#260016"],["#cad5ad","#f9df94","#f6a570","#e77a77","#54343f"],["#73c5aa","#c6c085","#f9a177","#f76157","#4c1b05"],["#cf3a69","#8f4254","#7caa96","#b6c474","#d4d489"],["#d46419","#b34212","#341405","#166665","#83870e"],["#1f2f3a","#98092b","#df931b","#e0daa3","#9fb982"],["#7e949e","#aec2ab","#ebcea0","#fc7765","#ff335f"],["#807070","#9a8fc8","#8dbdeb","#a5e6c8","#d9f5b5"],["#1a2b2b","#332222","#4d1a1a","#661111","#800909"],["#8d1042","#a25d47","#a08447","#97aa66","#b8b884"],["#f7f0ba","#e0dba4","#a9cba6","#7ebea3","#53a08e"],["#551bb3","#268fbe","#2cb8b2","#3ddb8f","#a9f04d"],["#0f132e","#19274e","#536d88","#b49b85","#eac195"],["#1c0b2b","#301c41","#413b6b","#5c65c0","#6f95ff"],["#0d0210","#4d3147","#866a80","#c9b7c7","#fffbff"],["#fffff7","#e9fccf","#d8fcb3","#b1fcb3","#89fcb3"],["#efece2","#81d7cd","#ff0048","#b13756","#5b1023"],["#020202","#493d3f","#bdb495","#f8f2ce","#d8d989"],["#d8f5d1","#9ddbca","#92b395","#726c81","#565164"],["#5a3938","#847b6d","#a3ab98","#d2d5af","#dfa49b"],["#88d1ca","#ded6c9","#e68a2e","#c90a00","#452b34"],["#bfe4cd","#ddb37d","#fa8331","#fb4848","#fd0a60"],["#e85a50","#feffd6","#5bb7b6","#010002","#fdf37a"],["#4a3333","#e1473f","#9a9088","#80b0ab","#dbd1b3"],["#f6eddc","#e3e5d7","#bdd6d2","#a5c8ca","#586875"],["#b68810","#301406","#7f9473","#d3c795","#c02c20"],["#423431","#f70b17","#050000","#9a8c29","#e7cba4"],["#eec77a","#e77155","#c71755","#7b3336","#5b9b9a"],["#404467","#5c627a","#a3b6a2","#b2ccaf","#fffaac"],["#939473","#4f784e","#2d5e4c","#13444d","#252326"],["#16c1c8","#49cccc","#7cd7cf","#aee1d3","#e1ecd6"],["#ef4335","#f68b36","#f2cd4f","#cae081","#88eed0"],["#524e4e","#ff2b73","#ff5a6a","#ff9563","#ffcd37"],["#d94052","#ee7e4c","#ead56c","#94c5a5","#898b75"],["#0f7d7e","#76b5a0","#fffdd1","#ff7575","#d33649"],["#3e3742","#825e65","#cc8383","#ebc4a9","#e6e0c5"],["#d0dccb","#d7c7be","#b3c5ba","#88c3b5","#6d6168"],["#f7f4e8","#daf3ea","#85e6c0","#6bb39b","#0b0b0d"],["#04394e","#00875e","#a7cc15","#f5cc17","#f56217"],["#2f1335","#620e5d","#9d007a","#ce3762","#ff6e49"],["#220114","#811628","#bd3038","#ff7e57","#f8b068"],["#fb545c","#99662d","#b7e1a1","#cdeda1","#fdf5a4"],["#33242b","#e30842","#fc4630","#ff9317","#c4ff0d"],["#f5c8bf","#e0d2c5","#cad9ca","#a7e3c1","#495453"],["#f0f0d8","#d8d8c0","#7a8370","#df8615","#f84600"],["#9e9e9e","#5ecde0","#00fff2","#c4ffc9","#e0e0e0"],["#541e35","#df5d2e","#ffb43e","#a4c972","#6bb38e"],["#58534c","#f1d3ab","#dbce79","#f95842","#0eaeab"],["#f6b149","#f8572d","#df2a33","#a22543","#6b312d"],["#ffffff","#000000","#ff006f","#ffb300","#fff538"],["#f5ea95","#fc8e5b","#fc5956","#c93e4f","#3d1734"],["#f1ffd5","#d6e6b7","#a35481","#b8136f","#ea0063"],["#cb6f84","#291d21","#5d544d","#cfccbb","#e1daca"],["#ff8d7b","#c88984","#947280","#d6b58c","#dcd392"],["#ffeec2","#fe9e8e","#f80174","#c4037a","#322c8e"],["#75727a","#997f87","#b88c87","#d39679","#f3a76d"],["#e0dcb8","#c4bc16","#918f61","#c21f40","#302c25"],["#3b3e37","#e19563","#9fb39b","#d39088","#f0ddb5"],["#22806b","#a89f1d","#facb4b","#fcaf14","#ed7615"],["#281b24","#d02941","#f57e67","#d9c9a5","#8cab94"],["#555231","#9c8c51","#bcac71","#e9db9c","#79927d"],["#d3dbd9","#a4bdbc","#ffdabf","#ffbf91","#ff9a52"],["#79aba2","#b4b943","#b7833a","#a04b26","#301e1a"],["#ebe7a7","#a7ebc9","#78b395","#917c67","#5e5953"],["#ff8591","#efaaa3","#8caaa2","#5a9b95","#44878f"],["#f5d393","#f39772","#eb6765","#261329","#1a0b2a"],["#e4f3d8","#afcacc","#ffa02e","#e80560","#331d4a"],["#af0745","#fa4069","#fe9c6b","#fcda90","#c8b080"],["#c39738","#ffff96","#7f4311","#5e4318","#361f00"],["#582770","#773d94","#943d8a","#c22760","#e81764"],["#281916","#e86786","#f4a1b5","#ffd2cb","#96b5ad"],["#d2d2d2","#58afb8","#269199","#ec225e","#020305"],["#81749c","#4d3e6b","#8daec3","#c5dfe0","#fcfce2"],["#b19676","#766862","#92bf9f","#e3d49c","#f9f0b7"],["#cbdad5","#89a7b1","#566981","#3a415a","#34344e"],["#001f21","#029b99","#ebe7b7","#de4f15","#ecc039"],["#fb6a3d","#fbe5ac","#361d20","#a2bc97","#f7cd67"],["#907071","#7bbda1","#a4d9a3","#c6d7a0","#fbdcb0"],["#8e3f65","#73738d","#72a5ae","#98e9d0","#d8ffcc"],["#d2fae2","#e6f8b1","#f6d5ad","#f6b794","#e59da0"],["#ad2003","#e0e6ae","#bdd3b6","#836868","#5f0609"],["#fe9600","#ffc501","#ffee4a","#77477e","#03001c"],["#5e3848","#666163","#a7b381","#cad197","#cde0bf"],["#2a1e1e","#503850","#aa6581","#f99fa9","#ffc5c1"],["#d1dc5a","#e0f7e0","#77f2de","#6ac5cb","#45444e"],["#400e28","#992f4d","#f25872","#f08e73","#e8b787"],["#741952","#fe3174","#f1c15d","#94bb68","#09a3ad"],["#942222","#bd3737","#d4cdad","#98c3a1","#25857d"],["#160d18","#23145b","#09456c","#026f6e","#1ca39e"],["#e5dac0","#bcb091","#9f7b51","#820d25","#4a0013"],["#cf0638","#fa6632","#fecd23","#0a996f","#0a6789"],["#ff4000","#ffefb5","#319190","#ffc803","#260d0d"],["#817a8a","#cdbbbb","#fcddc8","#fffeea","#efcaba"],["#c75f77","#fefab6","#77a493","#836177","#654b49"],["#cdb27b","#de7c04","#e4211b","#c00353","#5e2025"],["#2a0308","#924f1b","#e2ac3f","#f8ebbe","#7ba58d"],["#a2825c","#88d3ab","#f9fad2","#f5da7a","#ff985e"],["#9aedb5","#ab9a89","#a3606d","#4f2d4b","#291e40"],["#fe958f","#f3d7c2","#8bb6a3","#17a7a8","#122f51"],["#2f2e30","#e84b2c","#e6d839","#7cd164","#2eb8ac"],["#4acabb","#cbe5c0","#fcf9c2","#edc5bd","#84407b"],["#d6496c","#7db8a2","#d6dd90","#fffad3","#7e638c"],["#becec4","#688a7c","#9d7c5b","#e35241","#e49183"],["#281a1a","#4e2d28","#70454e","#ae736f","#dda8b0"],["#966c80","#96bda8","#bfd4ad","#f7d3a3","#eca36c"],["#fff4ce","#d0deb8","#ffa492","#ff7f81","#ff5c71"],["#420b58","#fc036c","#f1a20b","#8d9c09","#08807b"],["#4d4d4d","#637566","#a39c67","#d69e60","#ff704d"],["#cc8f60","#b7a075","#9eb48e","#8cc2a0","#77d4b6"],["#ec6363","#ec7963","#ecb163","#dfd487","#bdebca"],["#1c31a5","#101f78","#020f59","#010937","#000524"],["#3d2304","#7f6000","#deb069","#c41026","#3d0604"],["#efd8a4","#e8ae96","#e49d89","#e47f83","#a8c99e"],["#c0ffff","#60ecff","#fe5380","#ffbb5e","#fefefc"],["#c9ad9b","#ffbda1","#e05576","#703951","#452a37"],["#40122c","#656273","#59baa9","#d8f171","#fcffd9"],["#1a110e","#4e051c","#f7114b","#c4b432","#bcb7ab"],["#f5e1a4","#d9d593","#ee7f27","#bc162a","#302325"],["#f67968","#f67968","#f68c68","#f68c68","#f6a168"],["#8e978d","#97c4ad","#bfedbe","#e6fcd9","#cdf2d6"],["#fef1e0","#f6e6ce","#3b2e2a","#3f0632","#a47f1a"],["#2a8b8b","#75c58e","#bfff91","#dfe9a8","#ffd2bf"],["#96958a","#76877d","#88b8a9","#b2cbae","#dbddb4"],["#f0debb","#59a87d","#16453f","#091c1a","#541734"],["#8d9c9d","#e00b5b","#f5b04b","#fcdfbd","#45373e"],["#93ba85","#bda372","#f49859","#ff494b","#5e363f"],["#fff7bc","#fee78a","#f8a348","#e15244","#3a7b50"],["#eda08c","#876f55","#a19153","#b1b080","#b1ceaf"],["#c0b19e","#ffb48f","#f68b7b","#f6464a","#911440"],["#c92c2c","#cf6123","#f3c363","#f1e9bb","#5c483a"],["#faf4e0","#d2ff1f","#ffc300","#ff6a00","#3b0c2c"],["#ffffff","#5e9188","#3e5954","#253342","#232226"],["#110303","#c3062c","#ff194b","#8fa080","#708066"],["#b0da09","#f99400","#f00a5e","#b80090","#544f51"],["#eeaeaa","#daaeaa","#c6aeaa","#b2aeaa","#9eaeaa"],["#f2f2f2","#348e91","#1c5052","#213635","#0a0c0d"],["#282832","#77181e","#a92727","#c6d6d6","#dee7e7"],["#cde9ca","#ced89d","#dfba74","#e8a249","#575e55"],["#ffffc2","#f0ffc2","#e0ffc2","#d1ffc2","#c2ffc2"],["#615c5c","#e30075","#ff4a4a","#ffb319","#ebe8e8"],["#636363","#85827e","#d1b39f","#ffecd1","#ffd1b3"],["#ffffe5","#dffda7","#6ecf42","#31a252","#6b456c"],["#e0be7e","#e89d10","#db4b23","#382924","#136066"],["#670d0f","#f01945","#f36444","#ffce6f","#ffe3c9"],["#2f2c2b","#413726","#79451d","#d7621a","#fd8d32"],["#548c82","#d1ce95","#fcfade","#d55d63","#452d3d"],["#96b5a6","#fce1cb","#febeac","#4e383d","#d9434f"],["#2b2318","#524835","#56704b","#5d9e7e","#78b3a4"],["#becb7c","#84967e","#962c4c","#f05d67","#faa191"],["#d0d167","#fffcff","#e6dddc","#ff0c66","#969ba2"],["#2f003f","#be0001","#ff8006","#f3c75f","#e9cfaa"],["#b7b09e","#493443","#eb6077","#f0b49e","#f0e2be"],["#f7e6be","#e89a80","#a93545","#4d4143","#485755"],["#c3aaa5","#d76483","#ef9ca4","#ffc2bb","#f6e5cb"],["#010d23","#03223f","#038bbb","#fccb6f","#e19f41"],["#fb7968","#f9c593","#fafad4","#b0d1b2","#89b2a2"],["#3b5274","#9c667d","#ce938b","#e8cc9c","#e3e1b1"],["#d8c358","#6d0839","#d0e799","#25271e","#fbeff4"],["#d8d3ab","#b0b19f","#784d5f","#ba456a","#d04969"],["#89666d","#d2c29f","#e3a868","#f76f6d","#f2306d"],["#30182b","#f0f1bc","#60f0c0","#ff360e","#191f04"],["#4aedd7","#705647","#ed6d4a","#ffca64","#3fd97f"],["#330708","#e84624","#e87624","#e8a726","#e8d826"],["#f7c097","#829d74","#de3c2f","#eb5f07","#f18809"],["#f00065","#fa9f43","#f9fad2","#262324","#b3dbc8"],["#f46472","#f2ecc3","#fff9d8","#bed6ab","#999175"],["#c3d297","#ffffff","#c3b199","#3a2d19","#e8373e"],["#3b0503","#f67704","#f85313","#fedc57","#9ecfbc"],["#678c99","#b8c7cc","#fff1cf","#d6c292","#b59e67"],["#fdf2c5","#efe8b2","#c6d1a6","#82bfa0","#7a6f5d"],["#21203f","#fff1ce","#e7bfa5","#c5a898","#4b3c5d"],["#ef7270","#ee9f80","#f3ecbe","#cdaf7b","#59291b"],["#3a3232","#d83018","#f07848","#fdfcce","#c0d8d8"],["#352640","#92394b","#a9767a","#d1b4a2","#f1f2ce"],["#fcf7d7","#fea667","#ffe461","#c4c776","#f4d092"],["#07f9a2","#09c184","#0a8967","#0c5149","#0d192b"],["#aaaa91","#848478","#5e5e5e","#383845","#12122b"],["#fdec6f","#f2e9b0","#ecdfdb","#ede3fb","#fedfae"],["#829b86","#96b7a2","#a6aa56","#b4b969","#dfdb9c"],["#050003","#496940","#93842f","#ffa739","#fce07f"],["#7ebeb2","#d1f3db","#da9c3c","#bc1953","#7d144c"],["#6c788e","#a6aec1","#cfd5e1","#ededf2","#fcfdff"],["#471754","#991d5d","#f2445e","#f07951","#dec87a"],["#81657e","#3ea3af","#9fd9b3","#f0f6b9","#ff1d44"],["#f2ecdc","#574345","#e3dacb","#c5ffe5","#f5eed4"],["#e8608c","#71cbc4","#fff9f4","#cdd56e","#ffbd68"],["#382a2a","#ff3d3d","#ff9d7d","#e5ebbc","#8dc4b7"],["#d5d8c7","#d4d6ce","#d3d5d5","#d1d3dc","#d0d2e3"],["#622824","#2f0618","#412a9c","#1b66ff","#00cef5"],["#092b5a","#09738a","#78a890","#9ed1b7","#e7d9b4"],["#368986","#e79a32","#f84339","#d40f60","#005c81"],["#140d1a","#42142a","#ff2e5f","#ffd452","#faeeca"],["#dacdac","#f39708","#f85741","#0e9094","#1e1801"],["#a6e094","#e8e490","#f07360","#bf2a7f","#5c3d5b"],["#46294a","#ad4c6b","#e07767","#e0ae67","#d4e067"],["#10100f","#26503c","#849112","#9d4e0f","#840943"],["#ff9b8f","#ef7689","#9e6a90","#766788","#71556b"],["#2b2c30","#35313b","#453745","#613c4c","#ff1457"],["#edffb3","#99928e","#bfe3c3","#dbedc2","#fff2d4"],["#e1edd1","#aab69b","#9e906e","#b47941","#cf391d"],["#504375","#39324d","#ffe8ef","#c22557","#ed5887"],["#fffec7","#e1f5c4","#9dc9ac","#919167","#ff4e50"],["#e4ffd4","#ebe7a7","#edc68e","#a49e7e","#6e8f85"],["#3d0a49","#5015bd","#027fe9","#00caf8","#e0daf7"],["#a1a6aa","#bd928b","#de7571","#ff4e44","#282634"],["#f28a49","#f7e3b2","#e3967d","#57342d","#9dbfa4"],["#6ea49b","#d9d0ac","#6b8f0b","#7d3f60","#372b2e"],["#37ab98","#80bc96","#a6c88c","#e1ce8a","#37053b"],["#333237","#fb8351","#ffad64","#e9e2da","#add4d3"],["#d4cdc5","#5b88a5","#f4f4f2","#191013","#243a69"],["#24434b","#fc325b","#fa7f4b","#bfbc84","#63997a"],["#e5e6b8","#c6d4b8","#6ca6a3","#856a6a","#9c325c"],["#beed80","#59d999","#31ada1","#51647a","#453c5c"],["#3b331f","#ed6362","#ff8e65","#dceb5b","#58ce74"],["#d6ce8b","#8fd053","#02907d","#03453d","#2c1001"],["#402b30","#faddb4","#f4c790","#f2977e","#ba6868"],["#af162a","#95003a","#830024","#5a0e3d","#44021e"],["#e81e4a","#0b1d21","#078a85","#68baab","#edd5c5"],["#fb6066","#ffefc1","#fdd86e","#ffa463","#f66b40"],["#fa7785","#24211a","#d5d87d","#b1d4b6","#53cbbf"],["#9cd6c8","#f1ffcf","#f8df82","#fac055","#e57c3a"],["#3b4344","#51615b","#bbbd91","#f06f6b","#f12f5d"],["#b9030f","#9e0004","#70160e","#161917","#e1e3db"],["#f2e7d2","#f79eb1","#ae8fba","#4c5e91","#473469"],["#ff5252","#ff7752","#ff9a52","#ffb752","#5e405b"],["#c1ddc7","#f5e8c6","#bbcd77","#dc8051","#f4d279"],["#dfcccc","#ffd3d3","#ffa4a4","#d17878","#965959"],["#585d5d","#e06f72","#e7a17a","#e4b17d","#d1cbc0"],["#92b2a7","#6e7b8c","#b69198","#efa09b","#e7c7b0"],["#260d33","#003f69","#106b87","#157a8c","#b3aca4"],["#72bab0","#f0c69c","#d1284f","#9e0e30","#301a1a"],["#070705","#3e4b51","#6f737e","#89a09a","#c1c0ae"],["#4e3150","#c7777f","#b6dec1","#d6ecdf","#fbf6b5"],["#e4a691","#f7efd8","#c8c8a9","#556270","#273142"],["#e6626f","#efae78","#f5e19c","#a2ca8e","#66af91"],["#fbe4ae","#dacb8a","#897632","#392e0e","#6bb88a"],["#02fcf3","#a9e4cf","#cae0c8","#deddc4","#e8e7d2"],["#d0dcb3","#dabd90","#df7670","#f4065e","#837d72"],["#f5f5f5","#e9e9e9","#006666","#008584","#cccccc"],["#2eb3a1","#4fb37c","#79b36b","#a2ab5e","#bca95b"],["#594747","#6743a5","#7345d6","#2e2e2e","#bfab93"],["#efe2bf","#f5a489","#ef8184","#a76378","#a8c896"],["#4e031e","#5d2d4e","#5a4c6e","#447390","#05a1ad"],["#db3026","#e88a25","#f9e14b","#efed89","#7abf66"],["#f7f3cf","#c2e4cb","#36cecc","#27b1bf","#176585"],["#878286","#88b6a3","#bdba9e","#e2c18d","#e2bb64"],["#fe495f","#fe9d97","#fffec8","#d8fd94","#bded7e"],["#fab96b","#f19474","#ea777b","#94919a","#69a2a8"],["#322f3e","#e63c6d","#f5b494","#ede7a5","#abdecb"],["#c0b698","#647e37","#300013","#6e9a81","#d2c8a7"],["#259b9b","#6fbcaa","#b8d6b0","#feedbf","#ff1964"],["#17181f","#314d4a","#0b8770","#a6c288","#ebe68d"],["#e7ddd3","#c0c2bd","#9c9994","#29251c","#e6aa9f"],["#e72313","#fffcf7","#67b588","#65a675","#141325"],["#801245","#f4f4dd","#dcdbaf","#5d5c49","#3d3d34"],["#f8dac2","#f2a297","#f4436f","#ca1444","#142738"],["#61d4b0","#8ee696","#baf77c","#e8ff65","#ecedd5"],["#85b394","#a7ba59","#f0f0d8","#f0d890","#ae2f27"],["#a69a81","#e0d3b8","#eb9e6e","#eb6e6e","#706f6b"],["#edb886","#f1c691","#ffe498","#f9f9f1","#b9a58d"],["#87b091","#c4d4ab","#e0e0b6","#171430","#eff0d5"],["#3a3132","#0f4571","#386dbd","#009ddd","#05d3f8"],["#010300","#314c53","#5a7f78","#bbdec6","#f7f8fc"],["#02031a","#021b2b","#b10c43","#ff0841","#ebdfcc"],["#11091a","#2f2f4d","#626970","#bab195","#e8d18e"],["#463a2a","#5c4b37","#dddd92","#57c5c7","#00b5b9"],["#c9031a","#9d1722","#4a2723","#07a2a6","#ffeccb"],["#ff7c70","#f2dfb1","#b7c9a9","#674d69","#2e292e"],["#fff7e5","#fecdd0","#f8afb8","#f5a3af","#59483e"],["#5e0324","#692764","#7b7893","#7fb1a8","#94f9bf"],["#a9baae","#e6d0b1","#deb297","#c98d7b","#8a6662"],["#63072c","#910f43","#a65d53","#d59500","#f7f7a1"],["#fa3419","#f3e1b6","#7cbc9a","#23998e","#1d5e69"],["#6d165a","#a0346e","#ec5c8d","#ff8c91","#ffc4a6"],["#000000","#a69682","#7e9991","#737373","#d8770c"],["#decba0","#a0ab94","#6b9795","#594461","#6e1538"],["#240f03","#4b2409","#bd7a22","#e79022","#df621c"],["#a89d87","#bab100","#f91659","#b31d6a","#2e2444"],["#0e0036","#4c264b","#a04f62","#d2a391","#e6d7b8"],["#b9f8f0","#b6d3a5","#ee9b57","#ef2b41","#11130e"],["#1f0441","#fc1068","#fcab10","#f9ce07","#0ce3e8"],["#2a091c","#87758f","#85aab0","#a3c3b8","#e3edd2"],["#320139","#331b3b","#333e50","#5c6e6e","#f1debd"],["#211c33","#2b818c","#ffc994","#ed2860","#990069"],["#cc063e","#e83535","#fd9407","#e2d9c2","#10898b"],["#f75e50","#eac761","#e8df9c","#91c09e","#7d7769"],["#e5fec5","#c5fec6","#a3fec7","#29ffc9","#392a35"],["#e0eebd","#dae98a","#e17572","#ce1446","#2b0b16"],["#8fbfb9","#649ea7","#bddb88","#e0f3b2","#eefaa8"],["#06d9b6","#a4f479","#d4d323","#d13775","#9c3c86"],["#1a0c12","#f70a71","#ffdaa6","#ffb145","#74ab90"],["#648285","#b4a68e","#080d0d","#f3daaa","#a3c4c2"],["#a4f7d4","#9ae07d","#ada241","#a13866","#381c30"],["#fef7d5","#abee93","#2d938e","#0b4462","#f7a48b"],["#00686c","#32c2b9","#edecb3","#fad928","#ff9915"],["#cbe4ea","#ead1cb","#af9c98","#657275","#000000"],["#f3ffd2","#bff1ce","#82bda7","#6e837c","#2e0527"],["#484450","#466067","#459a96","#34baab","#c4c8c5"],["#fbffcc","#caf2be","#ddc996","#f67975","#f13565"],["#f5e3ae","#fff5d6","#e1e6d3","#b1ccc4","#4e5861"],["#e3604d","#d1c8a3","#acba9d","#7b5d5e","#c6ad71"],["#3b1a01","#a5cc7a","#dcffb6","#633b1c","#db3c6e"],["#000000","#7890a8","#304878","#181848","#f0a818"],["#ffe3b3","#ff9a52","#ff5252","#c91e5a","#3d2922"],["#bbaa9a","#849b95","#90856f","#b6554c","#d83a31"],["#e2e2b2","#49fecf","#370128","#e42355","#fe7945"],["#e4e2af","#ffa590","#e5cbb4","#fff1d7","#56413e"],["#f3b578","#f78376","#da4c66","#8f3c68","#3f3557"],["#f2ecb0","#ebb667","#d65c56","#823c3c","#1b1c26"],["#f1f7cd","#d3f7cd","#b5f7cd","#403a26","#81876c"],["#99db49","#069e8c","#211d19","#575048","#9e064a"],["#8f9044","#f8a523","#fc8020","#cf1500","#352f3d"],["#4b1623","#75233d","#c4594b","#f0b96b","#fdf57e"],["#7d677e","#4f2c4d","#360b41","#ccc9aa","#fafdea"],["#eed47f","#f2e0a0","#d8d8b2","#8cb0b0","#432332"],["#5c1b35","#d43f5d","#f2a772","#e8d890","#e2edb7"],["#40223c","#42988f","#b1c592","#f1ddba","#fb718a"],["#7e6762","#cf5a60","#f85a69","#f0b593","#e3dfbc"],["#300d28","#70615c","#8ca38b","#f7eeaa","#edb552"],["#caf729","#79dd7e","#2ecbaa","#21b6b6","#888dda"],["#f3ddb6","#d6bf93","#532728","#ced0ba","#f2efce"],["#412973","#753979","#b1476d","#eb9064","#bed9c8"],["#48586f","#ffffc0","#d6c496","#d62e2e","#283d3e"],["#68b2f8","#506ee5","#7037cd","#651f71","#1d0c20"],["#a7848b","#b88f93","#f5d5c6","#f9efd4","#b8cabe"],["#f9ebc4","#ffb391","#fc2f68","#472f5f","#08295e"],["#1f192f","#2d6073","#65b8a6","#b5e8c3","#f0f7da"],["#d3c6cc","#e2c3c6","#eecfc4","#f8e6c6","#ffffcc"],["#f8f8d6","#b3c67f","#5d7e62","#50595c","#fa3e3e"],["#723e4e","#b03851","#ef3353","#f17144","#f4b036"],["#c7003f","#f90050","#f96a00","#faab00","#daf204"],["#663333","#994d4d","#cc6666","#e6b280","#ffff99"],["#66ffff","#8cbfe6","#b380cc","#d940b3","#ff0099"],["#665c52","#74b3a7","#a3ccaf","#e6e1cf","#cc5b14"],["#53ac59","#3b8952","#0f684b","#03484c","#1c232e"],["#fea304","#909320","#125a44","#37192c","#220315"],["#c8cfae","#96b397","#525574","#5c3e62","#9b5f7b"],["#745e50","#ff948b","#fdaf8a","#fcd487","#f79585"],["#e4b302","#158fa2","#de4f3a","#722731","#bd1b43"],["#79d6b7","#ccd6bd","#d7c3ab","#f0afab","#f58696"],["#d3b390","#b8a38b","#a78b83","#c76b79","#f1416b"],["#f4fcb8","#dae681","#95a868","#452c18","#cc7254"],["#52493a","#7c8569","#a4ab80","#e8e0ae","#de733e"],["#111113","#d18681","#acbfb7","#f6ebdd","#8e6d86"],["#52baa7","#718f85","#ba5252","#fc0f52","#fc3d73"],["#edab8b","#f5ebb0","#dad061","#acc59d","#776c5a"],["#0b110d","#2c4d56","#c3aa72","#dc7612","#bd3200"],["#5a372c","#8b8b70","#98c7b0","#f0f0d8","#c94b0c"],["#ebe5ce","#ced1c0","#bad1c9","#8c162a","#660022"],["#090f13","#171f25","#752e2b","#c90a02","#f2eab7"],["#9ed99e","#f0dda6","#eb6427","#eb214e","#1a1623"],["#865a19","#c4b282","#85005b","#520647","#0e002f"],["#545454","#7b8a84","#8cbfaf","#ede7d5","#b7cc18"],["#fb573b","#4f393c","#8ea88d","#9cd0ac","#f4eb9e"],["#e5e5e5","#f1dbda","#fcd0cf","#cfbdbf","#a2a9af"],["#ffdeb3","#73bc91","#342220","#fc370c","#ff8716"],["#cccc66","#a6bf73","#80b380","#59a68c","#339999"],["#574d4f","#ffffff","#969091","#ffe999","#ffd952"],["#5f545c","#eb7072","#f5ba90","#f5e2b8","#a2caa5"],["#5e5473","#19b5a5","#ede89d","#ff6933","#ff0048"],["#edd8bb","#e2aa87","#fef7e1","#a2d3c7","#ef8e7d"],["#ceebd1","#b6deb9","#b1ccb4","#aebfaf","#a6ada7"],["#332d27","#8a0015","#e30224","#85725f","#fae1c0"],["#fdefb0","#e7a8b1","#b998b3","#77779d","#4771a3"],["#473334","#b3c8a7","#ffebb9","#e3536c","#da1a29"],["#fbb498","#f8c681","#bec47e","#9bb78f","#98908d"],["#dae5ab","#e9a385","#fa154b","#87313f","#604e48"],["#9d9382","#ffc1b2","#ffdbc8","#fff6c7","#dcd7c2"],["#cdb28a","#f9f4e3","#d4ddb1","#b1ba8e","#7a6448"],["#ff548f","#9061c2","#be80ff","#63d3ff","#02779e"],["#210210","#ee2853","#2b0215","#8f2f45","#d24d6c"],["#383939","#149c68","#38c958","#aee637","#fffedb"],["#bfe0c0","#160921","#f06e75","#f2af60","#d0d26f"],["#3b234a","#523961","#baafc4","#c3bbc9","#d4c7bf"],["#c95c7a","#de9153","#d6d644","#dcebaf","#14888b"],["#ffffea","#a795a5","#7a959e","#424e5e","#3b2b46"],["#addfd3","#eae3d0","#dbc4b6","#ffa5aa","#efd5c4"],["#f0c0a8","#f0d8a8","#a8c090","#789090","#787878"],["#f0f0f0","#d8d8d8","#c0c0a8","#604848","#484848"],["#000000","#1693a5","#d8d8c0","#f0f0d8","#ffffff"],["#ff1d44","#fbebaf","#74bf9d","#56a292","#1c8080"],["#ae0c3e","#afcca8","#f5eec3","#c7b299","#33211c"],["#ff8482","#ffb294","#f8d8a5","#91be95","#635a49"],["#000000","#8f1414","#e50e0e","#f3450f","#fcac03"],["#a88914","#91a566","#bed084","#e9e199","#faedca"],["#eddbc4","#a3c9a7","#ffb353","#ff6e4a","#5c5259"],["#413249","#ccc591","#e2b24c","#eb783f","#ff426a"],["#37193b","#e75a7a","#f59275","#f5c273","#aeb395"],["#880606","#d53d0c","#ff8207","#231d1e","#fcfcfc"],["#bad3c6","#f9d9ac","#fca483","#f18886","#7b7066"],["#e8d7a9","#8eaa94","#6b666d","#6c3751","#52223c"],["#e6e6e6","#aae6d9","#c8cbc1","#e6b0aa","#a1a1a1"],["#3b3f49","#fdfaeb","#faeddf","#f3c6b9","#f7a29e"],["#394736","#696b46","#b99555","#a8462d","#5c584c"],["#f23e02","#fef5c8","#00988d","#2c6b74","#013750"],["#f05c54","#a17457","#5c735e","#3d615b","#434247"],["#cce4d1","#d2e1a7","#d8de7d","#dedb53","#e4d829"],["#c5f7f0","#a9c2c9","#8e8ca3","#72577c","#562155"],["#fcbf6b","#a9ad94","#42302e","#f6daab","#dabd7b"],["#484848","#006465","#0f928c","#00c9d2","#beee3b"],["#e0da96","#badda3","#94e0b0","#a6b5ae","#b88bad"],["#e1c78c","#eda011","#db6516","#7a6949","#adad8e"],["#eb445b","#f5938b","#f0cdab","#f1e7c5","#b6d4bb"],["#c0d88c","#f7a472","#f07877","#fa2a3a","#0a5c5a"],["#d0cf75","#f8764e","#da2644","#90044a","#440a2a"],["#e6546b","#da8f72","#ffe792","#c9daa4","#8acbb5"],["#f8f4c4","#d5e0b5","#a5c3a7","#6d8b89","#47667b"],["#3e3433","#f07f83","#b29a78","#9eaf83","#75a480"],["#c5b89f","#feffd4","#9e2d4a","#450b1e","#21000f"],["#5e1f28","#8a2f2e","#ae5543","#f7bb75","#83764c"],["#eb7f7f","#eb9a7f","#ebb57f","#ebd07f","#ebeb7f"],["#fcbf6b","#e58634","#657a38","#afab50","#a9ccb9"],["#cee1d8","#f6eee0","#fda664","#f04842","#83563f"],["#e0d1ed","#f0b9cf","#e63c80","#c70452","#4b004c"],["#680a1d","#3f1719","#fcef9c","#e8b666","#ba2339"],["#343635","#d90057","#e88700","#77b8a6","#ffe2ba"],["#185b63","#c0261c","#ba460d","#c59538","#404040"],["#cb7ca2","#ed9da1","#c9e5af","#dceeb1","#fef9f6"],["#0d0f36","#294380","#69d2cd","#b9f1d6","#f1f6ce"],["#c9b8a8","#f8af8c","#a24d52","#5a3044","#391d34"],["#faefc2","#a4ac9d","#a27879","#a4626c","#f05d77"],["#5b1d99","#0074b4","#00b34c","#ffd41f","#fc6e3d"],["#079ea6","#1e0c42","#f0077b","#f5be58","#e3e0b3"],["#e46d29","#ba4c57","#4e3a3b","#a59571","#d0bc87"],["#f2eabc","#54736e","#194756","#080000","#ff3b58"],["#e2d9db","#f2e5f9","#d9e1df","#ff8a84","#fe6763"],["#f3d597","#b6d89c","#92ccb6","#f87887","#9e6b7c"],["#e6ac84","#ad9978","#619177","#161618","#594c2a"],["#eee5d6","#8f0006","#000000","#939185","#98a5ad"],["#bf9f88","#e8c8a1","#fce4be","#f6a68d","#f96153"],["#ffbd87","#ffd791","#f7e8a6","#d9e8ae","#bfe3c0"],["#e4e6c9","#e6dac6","#d6c3b9","#c2b48a","#b37883"],["#2b2823","#8fa691","#d4ceaa","#f9fadc","#cc3917"],["#e84d5b","#eae2cf","#b4ccb9","#26979f","#3b3b3b"],["#4d4250","#b66e6f","#cf8884","#e6a972","#f6d169"],["#11665f","#599476","#e4d673","#eb624f","#ac151c"],["#5c4152","#b4585d","#d97f76","#f7d0a9","#a1c0ae"],["#58706d","#4b5757","#7c8a6e","#b0b087","#e3e3d1"],["#f4e1b8","#9ec7b7","#acaa9b","#a5826e","#7e514b"],["#ede5ce","#fdf6e6","#ffe2ba","#f4b58a","#f7a168"],["#ff2121","#fd9a42","#c2fc63","#bcf7ef","#d7eefa"],["#806835","#f7f1cd","#6b9e8b","#a62121","#130d0d"],["#d9d766","#c5c376","#a48b86","#84567a","#643263"],["#6c3948","#ba5f6e","#cc8c82","#ded787","#f9eabf"],["#855f30","#9ec89a","#eaba68","#ff5248","#f6ffb3"],["#d3f7e9","#fcf3d2","#fbcf86","#fa7f46","#dd4538"],["#c3e6d4","#f4f0e5","#e0c4ae","#e1918e","#e15e6e"],["#d92d7a","#cd4472","#c25c6a","#b77463","#ac8c5e"]]
},{}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
'use strict';

var isArrayish = require('is-arrayish');

var concat = Array.prototype.concat;
var slice = Array.prototype.slice;

var swizzle = module.exports = function swizzle(args) {
	var results = [];

	for (var i = 0, len = args.length; i < len; i++) {
		var arg = args[i];

		if (isArrayish(arg)) {
			// http://jsperf.com/javascript-array-concat-vs-push/98
			results = concat.call(results, slice.call(arg));
		} else {
			results.push(arg);
		}
	}

	return results;
};

swizzle.wrap = function (fn) {
	return function () {
		return fn(swizzle(arguments));
	};
};

},{"is-arrayish":14}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
const canvasSketch = require("canvas-sketch");
const { lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes/1000.json");
const Color = require("color");

const splitPalette = require("./util/splitPalette");
const interpolateColors = require("./util/interpolateColors");
const drawCircle = require("./util/drawCircle");
const isPointWithinCircle = require("./util/isPointWithinCircle");

random.setSeed(random.getRandomSeed());
// console.log(random.getSeed());

const MIN_COLOR_JITTER = -4;
const MAX_COLOR_JITTER = 4;
const MIN_POSITION_JITTER = -0.01;
const MAX_POSITION_JITTER = 0.01;
const PARTICLE_MIN = 30;
const PARTICLE_MAX = 50;
const SPREAD_MIN = -5;
const SPREAD_MAX = 15;
const PROBABILITY_TO_RENDER = 0.2;

const settings = {
  dimensions: "A3",
  pixelsPerInch: 600,
  suffix: `-seed-${random.getSeed()}`
};

const { background, palette } = splitPalette(random.pick(palettes));
const colors = interpolateColors(palette, 50);

const mapVToColor = v => {
  // based on the y position of the particle, pick the nearest colour from
  // our interpolated array of colours + a little bit of noise for texture
  const colorIndex = Math.round(
    lerp(0, colors.length, v) + random.range(MIN_COLOR_JITTER, MAX_COLOR_JITTER)
  );
  // Because of the noise, we can exceed the bounds of the array so max or min it out
  return colors[Math.max(0, Math.min(colorIndex, colors.length))];
};

const generate = () => {
  const count = 500;
  const points = [];
  for (let x = 0; x < count; x++) {
    for (let y = 0; y < count; y++) {
      const u =
        x / (count - 1) +
        random.range(MIN_POSITION_JITTER, MAX_POSITION_JITTER);
      const v =
        y / (count - 1) +
        random.range(MIN_POSITION_JITTER, MAX_POSITION_JITTER);
      const noise = random.noise2D(u, v, 3.8);
      const radius = Math.max(3.5, noise * 11);
      const alpha = random.range(0.9, 0.1);
      const hexColor = mapVToColor(v);
      const color = Color(hexColor);
      const spread = Math.max(
        0,
        Math.round(random.range(PARTICLE_MIN, PARTICLE_MAX) * noise)
      );
      const particles = [];

      // Each poinnt has a trail of particles
      for (let i = 1; i < spread; i++) {
        // for each sub-particle on the trail randomly offset it with an index modifier
        const offset =
          random.range(SPREAD_MIN - i / spread, SPREAD_MAX + i / spread) *
          (i / 400);

        particles.push({
          u,
          v: v + offset,
          highlight: random.value() > 0.5 ? color.lighten(0.5) : false,
          radius: Math.max(0.3, radius - radius / spread * i),
          color: color
            .rgb()
            .fade(alpha)
            .toString()
        });
      }

      points.push({
        u,
        v,
        spread: 10,
        color,
        radius,
        particles,
        offset: random.range(-5, 5)
      });
    }
  }

  return points;
};

const margin = 10;
const points = generate().filter(() => random.value() < PROBABILITY_TO_RENDER);
const sketch = () => {
  return ({ context, width, height }) => {
    const circleMaskRadius = width / 3;
    const circleMask = {
      x: width / 2,
      y: height / 3,
      radius: circleMaskRadius
    };
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    points.forEach(point => {
      const circle = {
        x: lerp(margin, width - margin, point.u),
        y: lerp(margin, width - margin, point.v),
        radius: point.radius,
        color: point.color
      };
      if (isPointWithinCircle(circle, circleMask)) {
        drawCircle(circle, context);
        point.particles.forEach(particle => {
          const x = lerp(margin, width - margin, particle.u);
          const y = lerp(margin, width - margin, particle.v);
          const particleCircle = {
            x,
            y,
            radius: particle.radius,
            color: particle.color
          };

          drawCircle(particleCircle, context);
          if (particle.highlight) {
            context.beginPath();
            context.fillStyle = particle.highlight;
            context.arc(x, y + length, particle.radius / 2, 0, Math.PI * 2);
            context.fill();
          }
        });
      }
    });
  };
};

canvasSketch(sketch, settings);

},{"./util/drawCircle":20,"./util/interpolateColors":21,"./util/isPointWithinCircle":22,"./util/splitPalette":24,"canvas-sketch":3,"canvas-sketch-util/math":1,"canvas-sketch-util/random":2,"color":8,"nice-color-palettes/1000.json":15}],20:[function(require,module,exports){
module.exports = (circle, context) => {
  context.beginPath();
  if (circle.color) context.fillStyle = circle.color;
  context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
  context.fill();
};

},{}],21:[function(require,module,exports){
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

},{"./lerpHexColor":23}],22:[function(require,module,exports){
const isPointWithinCircle = (point, circleMask) => {
  var a = point.radius + circleMask.radius;
  var x = point.x - circleMask.x;
  var y = point.y - circleMask.y;

  return a >= Math.sqrt(x * x + y * y);
};

module.exports = isPointWithinCircle;

},{}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
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

},{"color-contrast":4}],25:[function(require,module,exports){
(function (global){

global.CANVAS_SKETCH_DEFAULT_STORAGE_KEY = window.location.href;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[19,25])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC11dGlsL21hdGguanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC11dGlsL3JhbmRvbS5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2Rpc3Qvbm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvbm9kZV9tb2R1bGVzL2RlZmluZWQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL25vZGVfbW9kdWxlcy9vYmplY3QtYXNzaWduL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvZGlzdC9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9ub2RlX21vZHVsZXMvcmlnaHQtbm93L2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL25vZGVfbW9kdWxlcy9pcy1wcm9taXNlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvZGlzdC9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9ub2RlX21vZHVsZXMvaXMtZG9tL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvZGlzdC9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9saWIvdXRpbC5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2Rpc3Qvbm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvbm9kZV9tb2R1bGVzL2RlZXAtZXF1YWwvbGliL2tleXMuanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL25vZGVfbW9kdWxlcy9kZWVwLWVxdWFsL2xpYi9pc19hcmd1bWVudHMuanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL25vZGVfbW9kdWxlcy9kZWVwLWVxdWFsL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvZGlzdC9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9ub2RlX21vZHVsZXMvZGF0ZWZvcm1hdC9saWIvZGF0ZWZvcm1hdC5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2Rpc3Qvbm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvbm9kZV9tb2R1bGVzL3JlcGVhdC1zdHJpbmcvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL25vZGVfbW9kdWxlcy9wYWQtbGVmdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2Rpc3Qvbm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvbGliL3NhdmUuanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2xpYi9hY2Nlc3NpYmlsaXR5LmpzIiwibm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvZGlzdC9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9saWIvY29yZS9rZXlib2FyZFNob3J0Y3V0cy5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2Rpc3Qvbm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvbGliL3BhcGVyLXNpemVzLmpzIiwibm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvZGlzdC9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9saWIvZGlzdGFuY2VzLmpzIiwibm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvZGlzdC9ub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9saWIvY29yZS9yZXNpemVDYW52YXMuanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL25vZGVfbW9kdWxlcy9nZXQtY2FudmFzLWNvbnRleHQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY2FudmFzLXNrZXRjaC9kaXN0L25vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2xpYi9jb3JlL2NyZWF0ZUNhbnZhcy5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2Rpc3Qvbm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvbGliL2NvcmUvU2tldGNoTWFuYWdlci5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMtc2tldGNoL2Rpc3Qvbm9kZV9tb2R1bGVzL2NhbnZhcy1za2V0Y2gvbGliL2NhbnZhcy1za2V0Y2guanMiLCJub2RlX21vZHVsZXMvY29sb3ItY29udHJhc3QvZGlzdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvci1uYW1lL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvbG9yLXN0cmluZy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvci9ub2RlX21vZHVsZXMvY29sb3ItY29udmVydC9jb252ZXJzaW9ucy5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvci9ub2RlX21vZHVsZXMvY29sb3ItY29udmVydC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvci9ub2RlX21vZHVsZXMvY29sb3ItY29udmVydC9yb3V0ZS5qcyIsIm5vZGVfbW9kdWxlcy9jb252ZXJ0LWxlbmd0aC9jb252ZXJ0LWxlbmd0aC5qcyIsIm5vZGVfbW9kdWxlcy9kZWZpbmVkL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLWFycmF5aXNoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL25pY2UtY29sb3ItcGFsZXR0ZXMvMTAwMC5qc29uIiwibm9kZV9tb2R1bGVzL3NlZWQtcmFuZG9tL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zd2l6emxlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZXgtbm9pc2Uvc2ltcGxleC1ub2lzZS5qcyIsInNyYy9kaXNwZXJzaW9uMy5qcyIsInNyYy91dGlsL2RyYXdDaXJjbGUuanMiLCJzcmMvdXRpbC9pbnRlcnBvbGF0ZUNvbG9ycy5qcyIsInNyYy91dGlsL2lzUG9pbnRXaXRoaW5DaXJjbGUuanMiLCJzcmMvdXRpbC9sZXJwSGV4Q29sb3IuanMiLCJzcmMvdXRpbC9zcGxpdFBhbGV0dGUuanMiLCJjYW52YXMtc2tldGNoLWNsaS9pbmplY3RlZC9zdG9yYWdlLWtleS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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SyxDQUFDLEdBQUcsRUFBRSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztjQUMxRSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Y0FDMUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2NBQzFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztjQUMxRSxDQUFDLEtBQUssR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDO2NBQ3hHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7Y0FDekYsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVB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aUIsS0FBTSxNQUd6QixDQUFFLEtBQU0sR0FBSSxJQUNaLENBQUUsS0FBTSxHQUFJO1FBQ1osQ0FBRSxLQUFNLElBQUssS0FDYixDQUFFLEtBQU0sSUFBSyxLQUNiLENBQUUsS0FBTSxJQUFLLEtBQ2IsQ0FBRSxLQUFNLElBQUssS0FDYixDQUFFLE1BQU8sSUFBSyxLQUNkLENBQUU7UUFBTyxJQUFLLEtBQ2QsQ0FBRSxNQUFPLElBQUssS0FHZCxDQUFFLEtBQU0sSUFBSyxNQUNiLENBQUUsS0FBTSxJQUFLLEtBQ2IsQ0FBRSxLQUFNLElBQUssS0FDYixDQUFFO1FBQU0sSUFBSyxLQUNiLENBQUUsS0FBTSxJQUFLLEtBQ2IsQ0FBRSxLQUFNLElBQUssS0FDYixDQUFFLEtBQU0sSUFBSyxLQUNiLENBQUUsS0FBTSxHQUFJLEtBQ1osQ0FBRSxLQUFNO1FBQUksSUFDWixDQUFFLEtBQU0sR0FBSSxJQUNaLENBQUUsTUFBTyxHQUFJLElBQ2IsQ0FBRSxNQUFPLEtBQU0sTUFDZixDQUFFLE1BQU8sS0FBTSxNQUNmLENBQUUsS0FBTTtRQUFNLE1BQ2QsQ0FBRSxLQUFNLElBQUssTUFDYixDQUFFLE1BQU8sSUFBSyxNQUNkLENBQUUsS0FBTSxJQUFLLEtBQ2IsQ0FBRSxNQUFPLElBQUssS0FDZCxDQUFFLEtBQU07UUFBSyxLQUNiLENBQUUsS0FBTSxJQUFLLEtBQ2IsQ0FBRSxLQUFNLElBQUssS0FDYixDQUFFLEtBQU0sSUFBSyxLQUNiLENBQUUsS0FBTSxHQUFJLEtBQ1osQ0FBRSxLQUFNLEdBQUk7UUFDWixDQUFFLEtBQU0sR0FBSSxJQUNaLENBQUUsTUFBTyxHQUFJLElBQ2IsQ0FBRSxNQUFPLEdBQUksSUFDYixDQUFFLE1BQU8sR0FBSSxJQUNiLENBQUUsS0FBTSxJQUFLLE1BQ2IsQ0FBRTtRQUFNLElBQUssS0FDYixDQUFFLEtBQU0sSUFBSyxLQUNiLENBQUUsS0FBTSxJQUFLLEtBQ2IsQ0FBRSxLQUFNLElBQUssS0FDYixDQUFFLEtBQU0sSUFBSyxLQUNiLENBQUUsS0FBTTtRQUFLLEtBQ2IsQ0FBRSxL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T0FBUixDQUFnQjs7WUFFM0IsSUFBSSxhQUFhO2dCQUNmLFFBQUEsQ0FBUyxPQUFPO29CQUFFLE1BQU0sTUFBUjs2QkFBZ0I7OztZQUVsQyxPQUFPOzs7O0lBS1gsWUFBQSxDQUFhLFlBQWIsR0FBNEI7SUFDNUIsWUFBQSxDQUFhLFVBQWIsR0FBMEI7Ozs7Ozs7Ozs7QUMzRzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2p5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcDJCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDN0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDakNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsInZhciBkZWZpbmVkID0gcmVxdWlyZSgnZGVmaW5lZCcpO1xudmFyIEVQU0lMT04gPSBOdW1iZXIuRVBTSUxPTjtcblxuZnVuY3Rpb24gY2xhbXAgKHZhbHVlLCBtaW4sIG1heCkge1xuICByZXR1cm4gbWluIDwgbWF4XG4gICAgPyAodmFsdWUgPCBtaW4gPyBtaW4gOiB2YWx1ZSA+IG1heCA/IG1heCA6IHZhbHVlKVxuICAgIDogKHZhbHVlIDwgbWF4ID8gbWF4IDogdmFsdWUgPiBtaW4gPyBtaW4gOiB2YWx1ZSk7XG59XG5cbmZ1bmN0aW9uIGNsYW1wMDEgKHYpIHtcbiAgcmV0dXJuIGNsYW1wKHYsIDAsIDEpO1xufVxuXG5mdW5jdGlvbiBsZXJwIChtaW4sIG1heCwgdCkge1xuICByZXR1cm4gbWluICogKDEgLSB0KSArIG1heCAqIHQ7XG59XG5cbmZ1bmN0aW9uIGludmVyc2VMZXJwIChtaW4sIG1heCwgdCkge1xuICBpZiAoTWF0aC5hYnMobWluIC0gbWF4KSA8IEVQU0lMT04pIHJldHVybiAwO1xuICBlbHNlIHJldHVybiAodCAtIG1pbikgLyAobWF4IC0gbWluKTtcbn1cblxuZnVuY3Rpb24gc21vb3Roc3RlcCAobWluLCBtYXgsIHQpIHtcbiAgdmFyIHggPSBjbGFtcChpbnZlcnNlTGVycChtaW4sIG1heCwgdCksIDAsIDEpO1xuICByZXR1cm4geCAqIHggKiAoMyAtIDIgKiB4KTtcbn1cblxuZnVuY3Rpb24gdG9GaW5pdGUgKG4sIGRlZmF1bHRWYWx1ZSkge1xuICBkZWZhdWx0VmFsdWUgPSBkZWZpbmVkKGRlZmF1bHRWYWx1ZSwgMCk7XG4gIHJldHVybiB0eXBlb2YgbiA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUobikgPyBuIDogZGVmYXVsdFZhbHVlO1xufVxuXG5mdW5jdGlvbiBleHBhbmRWZWN0b3IgKGRpbXMpIHtcbiAgaWYgKHR5cGVvZiBkaW1zICE9PSAnbnVtYmVyJykgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgZGltcyBhcmd1bWVudCcpO1xuICByZXR1cm4gZnVuY3Rpb24gKHAsIGRlZmF1bHRWYWx1ZSkge1xuICAgIGRlZmF1bHRWYWx1ZSA9IGRlZmluZWQoZGVmYXVsdFZhbHVlLCAwKTtcbiAgICB2YXIgc2NhbGFyO1xuICAgIGlmIChwID09IG51bGwpIHtcbiAgICAgIC8vIE5vIHZlY3RvciwgY3JlYXRlIGEgZGVmYXVsdCBvbmVcbiAgICAgIHNjYWxhciA9IGRlZmF1bHRWYWx1ZTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBwID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZShwKSkge1xuICAgICAgLy8gRXhwYW5kIHNpbmdsZSBjaGFubmVsIHRvIG11bHRpcGxlIHZlY3RvclxuICAgICAgc2NhbGFyID0gcDtcbiAgICB9XG5cbiAgICB2YXIgb3V0ID0gW107XG4gICAgdmFyIGk7XG4gICAgaWYgKHNjYWxhciA9PSBudWxsKSB7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgZGltczsgaSsrKSB7XG4gICAgICAgIG91dFtpXSA9IHRvRmluaXRlKHBbaV0sIGRlZmF1bHRWYWx1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBkaW1zOyBpKyspIHtcbiAgICAgICAgb3V0W2ldID0gc2NhbGFyO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3V0O1xuICB9O1xufVxuXG5mdW5jdGlvbiBsZXJwQXJyYXkgKG1pbiwgbWF4LCB0LCBvdXQpIHtcbiAgb3V0ID0gb3V0IHx8IFtdO1xuICBpZiAobWluLmxlbmd0aCAhPT0gbWF4Lmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ21pbiBhbmQgbWF4IGFycmF5IGFyZSBleHBlY3RlZCB0byBoYXZlIHRoZSBzYW1lIGxlbmd0aCcpO1xuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbWluLmxlbmd0aDsgaSsrKSB7XG4gICAgb3V0W2ldID0gbGVycChtaW5baV0sIG1heFtpXSwgdCk7XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cblxuZnVuY3Rpb24gbmV3QXJyYXkgKG4sIGluaXRpYWxWYWx1ZSkge1xuICBuID0gZGVmaW5lZChuLCAwKTtcbiAgaWYgKHR5cGVvZiBuICE9PSAnbnVtYmVyJykgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgbiBhcmd1bWVudCB0byBiZSBhIG51bWJlcicpO1xuICB2YXIgb3V0ID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSsrKSBvdXQucHVzaChpbml0aWFsVmFsdWUpO1xuICByZXR1cm4gb3V0O1xufVxuXG5mdW5jdGlvbiBsaW5zcGFjZSAobiwgb3B0cykge1xuICBuID0gZGVmaW5lZChuLCAwKTtcbiAgaWYgKHR5cGVvZiBuICE9PSAnbnVtYmVyJykgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgbiBhcmd1bWVudCB0byBiZSBhIG51bWJlcicpO1xuICBvcHRzID0gb3B0cyB8fCB7fTtcbiAgaWYgKHR5cGVvZiBvcHRzID09PSAnYm9vbGVhbicpIHtcbiAgICBvcHRzID0geyBlbmRwb2ludDogdHJ1ZSB9O1xuICB9XG4gIHZhciBvZmZzZXQgPSBkZWZpbmVkKG9wdHMub2Zmc2V0LCAwKTtcbiAgaWYgKG9wdHMuZW5kcG9pbnQpIHtcbiAgICByZXR1cm4gbmV3QXJyYXkobikubWFwKGZ1bmN0aW9uIChfLCBpKSB7XG4gICAgICByZXR1cm4gbiA8PSAxID8gMCA6ICgoaSArIG9mZnNldCkgLyAobiAtIDEpKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3QXJyYXkobikubWFwKGZ1bmN0aW9uIChfLCBpKSB7XG4gICAgICByZXR1cm4gKGkgKyBvZmZzZXQpIC8gbjtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBsZXJwRnJhbWVzICh2YWx1ZXMsIHQsIG91dCkge1xuICB0ID0gY2xhbXAodCwgMCwgMSk7XG5cbiAgdmFyIGxlbiA9IHZhbHVlcy5sZW5ndGggLSAxO1xuICB2YXIgd2hvbGUgPSB0ICogbGVuO1xuICB2YXIgZnJhbWUgPSBNYXRoLmZsb29yKHdob2xlKTtcbiAgdmFyIGZyYWN0ID0gd2hvbGUgLSBmcmFtZTtcblxuICB2YXIgbmV4dEZyYW1lID0gTWF0aC5taW4oZnJhbWUgKyAxLCBsZW4pO1xuICB2YXIgYSA9IHZhbHVlc1tmcmFtZSAlIHZhbHVlcy5sZW5ndGhdO1xuICB2YXIgYiA9IHZhbHVlc1tuZXh0RnJhbWUgJSB2YWx1ZXMubGVuZ3RoXTtcbiAgaWYgKHR5cGVvZiBhID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgYiA9PT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gbGVycChhLCBiLCBmcmFjdCk7XG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShhKSAmJiBBcnJheS5pc0FycmF5KGIpKSB7XG4gICAgcmV0dXJuIGxlcnBBcnJheShhLCBiLCBmcmFjdCwgb3V0KTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNaXNtYXRjaCBpbiB2YWx1ZSB0eXBlIG9mIHR3byBhcnJheSBlbGVtZW50czogJyArIGZyYW1lICsgJyBhbmQgJyArIG5leHRGcmFtZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbW9kIChhLCBiKSB7XG4gIHJldHVybiAoKGEgJSBiKSArIGIpICUgYjtcbn1cblxuZnVuY3Rpb24gZGVnVG9SYWQgKG4pIHtcbiAgcmV0dXJuIG4gKiBNYXRoLlBJIC8gMTgwO1xufVxuXG5mdW5jdGlvbiByYWRUb0RlZyAobikge1xuICByZXR1cm4gbiAqIDE4MCAvIE1hdGguUEk7XG59XG5cbmZ1bmN0aW9uIGZyYWN0IChuKSB7XG4gIHJldHVybiBuIC0gTWF0aC5mbG9vcihuKTtcbn1cblxuZnVuY3Rpb24gc2lnbiAobikge1xuICBpZiAobiA+IDApIHJldHVybiAxO1xuICBlbHNlIGlmIChuIDwgMCkgcmV0dXJuIC0xO1xuICBlbHNlIHJldHVybiAwO1xufVxuXG5mdW5jdGlvbiB3cmFwICh2YWx1ZSwgZnJvbSwgdG8pIHtcbiAgaWYgKHR5cGVvZiBmcm9tICE9PSAnbnVtYmVyJyB8fCB0eXBlb2YgdG8gIT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTXVzdCBzcGVjaWZ5IFwidG9cIiBhbmQgXCJmcm9tXCIgYXJndW1lbnRzIGFzIG51bWJlcnMnKTtcbiAgfVxuICAvLyBhbGdvcml0aG0gZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS81ODUyNjI4LzU5OTg4NFxuICBpZiAoZnJvbSA+IHRvKSB7XG4gICAgdmFyIHQgPSBmcm9tO1xuICAgIGZyb20gPSB0bztcbiAgICB0byA9IHQ7XG4gIH1cbiAgdmFyIGN5Y2xlID0gdG8gLSBmcm9tO1xuICBpZiAoY3ljbGUgPT09IDApIHtcbiAgICByZXR1cm4gdG87XG4gIH1cbiAgcmV0dXJuIHZhbHVlIC0gY3ljbGUgKiBNYXRoLmZsb29yKCh2YWx1ZSAtIGZyb20pIC8gY3ljbGUpO1xufVxuXG4vLyBTcGVjaWZpYyBmdW5jdGlvbiBmcm9tIFVuaXR5IC8gb2ZNYXRoLCBub3Qgc3VyZSBpdHMgbmVlZGVkP1xuLy8gZnVuY3Rpb24gbGVycFdyYXAgKGEsIGIsIHQsIG1pbiwgbWF4KSB7XG4vLyAgIHJldHVybiB3cmFwKGEgKyB3cmFwKGIgLSBhLCBtaW4sIG1heCkgKiB0LCBtaW4sIG1heClcbi8vIH1cblxuZnVuY3Rpb24gcGluZ1BvbmcgKHQsIGxlbmd0aCkge1xuICB0ID0gbW9kKHQsIGxlbmd0aCAqIDIpO1xuICByZXR1cm4gbGVuZ3RoIC0gTWF0aC5hYnModCAtIGxlbmd0aCk7XG59XG5cbmZ1bmN0aW9uIGRhbXAgKGEsIGIsIGxhbWJkYSwgZHQpIHtcbiAgcmV0dXJuIGxlcnAoYSwgYiwgMSAtIE1hdGguZXhwKC1sYW1iZGEgKiBkdCkpO1xufVxuXG5mdW5jdGlvbiBkYW1wQXJyYXkgKGEsIGIsIGxhbWJkYSwgZHQsIG91dCkge1xuICBvdXQgPSBvdXQgfHwgW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYS5sZW5ndGg7IGkrKykge1xuICAgIG91dFtpXSA9IGRhbXAoYVtpXSwgYltpXSwgbGFtYmRhLCBkdCk7XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cblxuZnVuY3Rpb24gbWFwUmFuZ2UgKHZhbHVlLCBpbnB1dE1pbiwgaW5wdXRNYXgsIG91dHB1dE1pbiwgb3V0cHV0TWF4LCBjbGFtcCkge1xuICAvLyBSZWZlcmVuY2U6XG4gIC8vIGh0dHBzOi8vb3BlbmZyYW1ld29ya3MuY2MvZG9jdW1lbnRhdGlvbi9tYXRoL29mTWF0aC9cbiAgaWYgKE1hdGguYWJzKGlucHV0TWluIC0gaW5wdXRNYXgpIDwgRVBTSUxPTikge1xuICAgIHJldHVybiBvdXRwdXRNaW47XG4gIH0gZWxzZSB7XG4gICAgdmFyIG91dFZhbCA9ICgodmFsdWUgLSBpbnB1dE1pbikgLyAoaW5wdXRNYXggLSBpbnB1dE1pbikgKiAob3V0cHV0TWF4IC0gb3V0cHV0TWluKSArIG91dHB1dE1pbik7XG4gICAgaWYgKGNsYW1wKSB7XG4gICAgICBpZiAob3V0cHV0TWF4IDwgb3V0cHV0TWluKSB7XG4gICAgICAgIGlmIChvdXRWYWwgPCBvdXRwdXRNYXgpIG91dFZhbCA9IG91dHB1dE1heDtcbiAgICAgICAgZWxzZSBpZiAob3V0VmFsID4gb3V0cHV0TWluKSBvdXRWYWwgPSBvdXRwdXRNaW47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAob3V0VmFsID4gb3V0cHV0TWF4KSBvdXRWYWwgPSBvdXRwdXRNYXg7XG4gICAgICAgIGVsc2UgaWYgKG91dFZhbCA8IG91dHB1dE1pbikgb3V0VmFsID0gb3V0cHV0TWluO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3V0VmFsO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBtb2Q6IG1vZCxcbiAgZnJhY3Q6IGZyYWN0LFxuICBzaWduOiBzaWduLFxuICBkZWdUb1JhZDogZGVnVG9SYWQsXG4gIHJhZFRvRGVnOiByYWRUb0RlZyxcbiAgd3JhcDogd3JhcCxcbiAgcGluZ1Bvbmc6IHBpbmdQb25nLFxuICBsaW5zcGFjZTogbGluc3BhY2UsXG4gIGxlcnA6IGxlcnAsXG4gIGxlcnBBcnJheTogbGVycEFycmF5LFxuICBpbnZlcnNlTGVycDogaW52ZXJzZUxlcnAsXG4gIGxlcnBGcmFtZXM6IGxlcnBGcmFtZXMsXG4gIGNsYW1wOiBjbGFtcCxcbiAgY2xhbXAwMTogY2xhbXAwMSxcbiAgc21vb3Roc3RlcDogc21vb3Roc3RlcCxcbiAgZGFtcDogZGFtcCxcbiAgZGFtcEFycmF5OiBkYW1wQXJyYXksXG4gIG1hcFJhbmdlOiBtYXBSYW5nZSxcbiAgZXhwYW5kMkQ6IGV4cGFuZFZlY3RvcigyKSxcbiAgZXhwYW5kM0Q6IGV4cGFuZFZlY3RvcigzKSxcbiAgZXhwYW5kNEQ6IGV4cGFuZFZlY3Rvcig0KVxufTtcbiIsInZhciBzZWVkUmFuZG9tID0gcmVxdWlyZSgnc2VlZC1yYW5kb20nKTtcbnZhciBTaW1wbGV4Tm9pc2UgPSByZXF1aXJlKCdzaW1wbGV4LW5vaXNlJyk7XG52YXIgZGVmaW5lZCA9IHJlcXVpcmUoJ2RlZmluZWQnKTtcblxuZnVuY3Rpb24gY3JlYXRlUmFuZG9tIChkZWZhdWx0U2VlZCkge1xuICBkZWZhdWx0U2VlZCA9IGRlZmluZWQoZGVmYXVsdFNlZWQsIG51bGwpO1xuICB2YXIgZGVmYXVsdFJhbmRvbSA9IE1hdGgucmFuZG9tO1xuICB2YXIgY3VycmVudFNlZWQ7XG4gIHZhciBjdXJyZW50UmFuZG9tO1xuICB2YXIgbm9pc2VHZW5lcmF0b3I7XG4gIHZhciBfbmV4dEdhdXNzaWFuID0gbnVsbDtcbiAgdmFyIF9oYXNOZXh0R2F1c3NpYW4gPSBmYWxzZTtcblxuICBzZXRTZWVkKGRlZmF1bHRTZWVkKTtcblxuICByZXR1cm4ge1xuICAgIHZhbHVlOiB2YWx1ZSxcbiAgICBjcmVhdGVSYW5kb206IGZ1bmN0aW9uIChkZWZhdWx0U2VlZCkge1xuICAgICAgcmV0dXJuIGNyZWF0ZVJhbmRvbShkZWZhdWx0U2VlZCk7XG4gICAgfSxcbiAgICBzZXRTZWVkOiBzZXRTZWVkLFxuICAgIGdldFNlZWQ6IGdldFNlZWQsXG4gICAgZ2V0UmFuZG9tU2VlZDogZ2V0UmFuZG9tU2VlZCxcbiAgICB2YWx1ZU5vblplcm86IHZhbHVlTm9uWmVybyxcbiAgICBwZXJtdXRlTm9pc2U6IHBlcm11dGVOb2lzZSxcbiAgICBub2lzZTFEOiBub2lzZTFELFxuICAgIG5vaXNlMkQ6IG5vaXNlMkQsXG4gICAgbm9pc2UzRDogbm9pc2UzRCxcbiAgICBub2lzZTREOiBub2lzZTRELFxuICAgIHNpZ246IHNpZ24sXG4gICAgYm9vbGVhbjogYm9vbGVhbixcbiAgICBjaGFuY2U6IGNoYW5jZSxcbiAgICByYW5nZTogcmFuZ2UsXG4gICAgcmFuZ2VGbG9vcjogcmFuZ2VGbG9vcixcbiAgICBwaWNrOiBwaWNrLFxuICAgIHNodWZmbGU6IHNodWZmbGUsXG4gICAgb25DaXJjbGU6IG9uQ2lyY2xlLFxuICAgIGluc2lkZUNpcmNsZTogaW5zaWRlQ2lyY2xlLFxuICAgIG9uU3BoZXJlOiBvblNwaGVyZSxcbiAgICBpbnNpZGVTcGhlcmU6IGluc2lkZVNwaGVyZSxcbiAgICBxdWF0ZXJuaW9uOiBxdWF0ZXJuaW9uLFxuICAgIHdlaWdodGVkOiB3ZWlnaHRlZCxcbiAgICB3ZWlnaHRlZFNldDogd2VpZ2h0ZWRTZXQsXG4gICAgd2VpZ2h0ZWRTZXRJbmRleDogd2VpZ2h0ZWRTZXRJbmRleCxcbiAgICBnYXVzc2lhbjogZ2F1c3NpYW5cbiAgfTtcblxuICBmdW5jdGlvbiBzZXRTZWVkIChzZWVkLCBvcHQpIHtcbiAgICBpZiAodHlwZW9mIHNlZWQgPT09ICdudW1iZXInIHx8IHR5cGVvZiBzZWVkID09PSAnc3RyaW5nJykge1xuICAgICAgY3VycmVudFNlZWQgPSBzZWVkO1xuICAgICAgY3VycmVudFJhbmRvbSA9IHNlZWRSYW5kb20oY3VycmVudFNlZWQsIG9wdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN1cnJlbnRTZWVkID0gdW5kZWZpbmVkO1xuICAgICAgY3VycmVudFJhbmRvbSA9IGRlZmF1bHRSYW5kb207XG4gICAgfVxuICAgIG5vaXNlR2VuZXJhdG9yID0gY3JlYXRlTm9pc2UoKTtcbiAgICBfbmV4dEdhdXNzaWFuID0gbnVsbDtcbiAgICBfaGFzTmV4dEdhdXNzaWFuID0gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiB2YWx1ZSAoKSB7XG4gICAgcmV0dXJuIGN1cnJlbnRSYW5kb20oKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHZhbHVlTm9uWmVybyAoKSB7XG4gICAgdmFyIHUgPSAwO1xuICAgIHdoaWxlICh1ID09PSAwKSB1ID0gdmFsdWUoKTtcbiAgICByZXR1cm4gdTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFNlZWQgKCkge1xuICAgIHJldHVybiBjdXJyZW50U2VlZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFJhbmRvbVNlZWQgKCkge1xuICAgIHZhciBzZWVkID0gU3RyaW5nKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMDAwMDApKTtcbiAgICByZXR1cm4gc2VlZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZU5vaXNlICgpIHtcbiAgICByZXR1cm4gbmV3IFNpbXBsZXhOb2lzZShjdXJyZW50UmFuZG9tKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBlcm11dGVOb2lzZSAoKSB7XG4gICAgbm9pc2VHZW5lcmF0b3IgPSBjcmVhdGVOb2lzZSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gbm9pc2UxRCAoeCwgZnJlcXVlbmN5LCBhbXBsaXR1ZGUpIHtcbiAgICBpZiAoIWlzRmluaXRlKHgpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCd4IGNvbXBvbmVudCBmb3Igbm9pc2UoKSBtdXN0IGJlIGZpbml0ZScpO1xuICAgIGZyZXF1ZW5jeSA9IGRlZmluZWQoZnJlcXVlbmN5LCAxKTtcbiAgICBhbXBsaXR1ZGUgPSBkZWZpbmVkKGFtcGxpdHVkZSwgMSk7XG4gICAgcmV0dXJuIGFtcGxpdHVkZSAqIG5vaXNlR2VuZXJhdG9yLm5vaXNlMkQoeCAqIGZyZXF1ZW5jeSwgMCk7XG4gIH1cblxuICBmdW5jdGlvbiBub2lzZTJEICh4LCB5LCBmcmVxdWVuY3ksIGFtcGxpdHVkZSkge1xuICAgIGlmICghaXNGaW5pdGUoeCkpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ggY29tcG9uZW50IGZvciBub2lzZSgpIG11c3QgYmUgZmluaXRlJyk7XG4gICAgaWYgKCFpc0Zpbml0ZSh5KSkgdGhyb3cgbmV3IFR5cGVFcnJvcigneSBjb21wb25lbnQgZm9yIG5vaXNlKCkgbXVzdCBiZSBmaW5pdGUnKTtcbiAgICBmcmVxdWVuY3kgPSBkZWZpbmVkKGZyZXF1ZW5jeSwgMSk7XG4gICAgYW1wbGl0dWRlID0gZGVmaW5lZChhbXBsaXR1ZGUsIDEpO1xuICAgIHJldHVybiBhbXBsaXR1ZGUgKiBub2lzZUdlbmVyYXRvci5ub2lzZTJEKHggKiBmcmVxdWVuY3ksIHkgKiBmcmVxdWVuY3kpO1xuICB9XG5cbiAgZnVuY3Rpb24gbm9pc2UzRCAoeCwgeSwgeiwgZnJlcXVlbmN5LCBhbXBsaXR1ZGUpIHtcbiAgICBpZiAoIWlzRmluaXRlKHgpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCd4IGNvbXBvbmVudCBmb3Igbm9pc2UoKSBtdXN0IGJlIGZpbml0ZScpO1xuICAgIGlmICghaXNGaW5pdGUoeSkpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3kgY29tcG9uZW50IGZvciBub2lzZSgpIG11c3QgYmUgZmluaXRlJyk7XG4gICAgaWYgKCFpc0Zpbml0ZSh6KSkgdGhyb3cgbmV3IFR5cGVFcnJvcigneiBjb21wb25lbnQgZm9yIG5vaXNlKCkgbXVzdCBiZSBmaW5pdGUnKTtcbiAgICBmcmVxdWVuY3kgPSBkZWZpbmVkKGZyZXF1ZW5jeSwgMSk7XG4gICAgYW1wbGl0dWRlID0gZGVmaW5lZChhbXBsaXR1ZGUsIDEpO1xuICAgIHJldHVybiBhbXBsaXR1ZGUgKiBub2lzZUdlbmVyYXRvci5ub2lzZTNEKFxuICAgICAgeCAqIGZyZXF1ZW5jeSxcbiAgICAgIHkgKiBmcmVxdWVuY3ksXG4gICAgICB6ICogZnJlcXVlbmN5XG4gICAgKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vaXNlNEQgKHgsIHksIHosIHcsIGZyZXF1ZW5jeSwgYW1wbGl0dWRlKSB7XG4gICAgaWYgKCFpc0Zpbml0ZSh4KSkgdGhyb3cgbmV3IFR5cGVFcnJvcigneCBjb21wb25lbnQgZm9yIG5vaXNlKCkgbXVzdCBiZSBmaW5pdGUnKTtcbiAgICBpZiAoIWlzRmluaXRlKHkpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCd5IGNvbXBvbmVudCBmb3Igbm9pc2UoKSBtdXN0IGJlIGZpbml0ZScpO1xuICAgIGlmICghaXNGaW5pdGUoeikpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ogY29tcG9uZW50IGZvciBub2lzZSgpIG11c3QgYmUgZmluaXRlJyk7XG4gICAgaWYgKCFpc0Zpbml0ZSh3KSkgdGhyb3cgbmV3IFR5cGVFcnJvcigndyBjb21wb25lbnQgZm9yIG5vaXNlKCkgbXVzdCBiZSBmaW5pdGUnKTtcbiAgICBmcmVxdWVuY3kgPSBkZWZpbmVkKGZyZXF1ZW5jeSwgMSk7XG4gICAgYW1wbGl0dWRlID0gZGVmaW5lZChhbXBsaXR1ZGUsIDEpO1xuICAgIHJldHVybiBhbXBsaXR1ZGUgKiBub2lzZUdlbmVyYXRvci5ub2lzZTREKFxuICAgICAgeCAqIGZyZXF1ZW5jeSxcbiAgICAgIHkgKiBmcmVxdWVuY3ksXG4gICAgICB6ICogZnJlcXVlbmN5LFxuICAgICAgdyAqIGZyZXF1ZW5jeVxuICAgICk7XG4gIH1cblxuICBmdW5jdGlvbiBzaWduICgpIHtcbiAgICByZXR1cm4gYm9vbGVhbigpID8gMSA6IC0xO1xuICB9XG5cbiAgZnVuY3Rpb24gYm9vbGVhbiAoKSB7XG4gICAgcmV0dXJuIHZhbHVlKCkgPiAwLjU7XG4gIH1cblxuICBmdW5jdGlvbiBjaGFuY2UgKG4pIHtcbiAgICBuID0gZGVmaW5lZChuLCAwLjUpO1xuICAgIGlmICh0eXBlb2YgbiAhPT0gJ251bWJlcicpIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4cGVjdGVkIG4gdG8gYmUgYSBudW1iZXInKTtcbiAgICByZXR1cm4gdmFsdWUoKSA8IG47XG4gIH1cblxuICBmdW5jdGlvbiByYW5nZSAobWluLCBtYXgpIHtcbiAgICBpZiAobWF4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIG1heCA9IG1pbjtcbiAgICAgIG1pbiA9IDA7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBtaW4gIT09ICdudW1iZXInIHx8IHR5cGVvZiBtYXggIT09ICdudW1iZXInKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBhbGwgYXJndW1lbnRzIHRvIGJlIG51bWJlcnMnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWUoKSAqIChtYXggLSBtaW4pICsgbWluO1xuICB9XG5cbiAgZnVuY3Rpb24gcmFuZ2VGbG9vciAobWluLCBtYXgpIHtcbiAgICBpZiAobWF4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIG1heCA9IG1pbjtcbiAgICAgIG1pbiA9IDA7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBtaW4gIT09ICdudW1iZXInIHx8IHR5cGVvZiBtYXggIT09ICdudW1iZXInKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBhbGwgYXJndW1lbnRzIHRvIGJlIG51bWJlcnMnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gTWF0aC5mbG9vcihyYW5nZShtaW4sIG1heCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gcGljayAoYXJyYXkpIHtcbiAgICBpZiAoYXJyYXkubGVuZ3RoID09PSAwKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgIHJldHVybiBhcnJheVtyYW5nZUZsb29yKDAsIGFycmF5Lmxlbmd0aCldO1xuICB9XG5cbiAgZnVuY3Rpb24gc2h1ZmZsZSAoYXJyKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIEFycmF5LCBnb3QgJyArIHR5cGVvZiBhcnIpO1xuICAgIH1cblxuICAgIHZhciByYW5kO1xuICAgIHZhciB0bXA7XG4gICAgdmFyIGxlbiA9IGFyci5sZW5ndGg7XG4gICAgdmFyIHJldCA9IGFyci5zbGljZSgpO1xuICAgIHdoaWxlIChsZW4pIHtcbiAgICAgIHJhbmQgPSBNYXRoLmZsb29yKHZhbHVlKCkgKiBsZW4tLSk7XG4gICAgICB0bXAgPSByZXRbbGVuXTtcbiAgICAgIHJldFtsZW5dID0gcmV0W3JhbmRdO1xuICAgICAgcmV0W3JhbmRdID0gdG1wO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgZnVuY3Rpb24gb25DaXJjbGUgKHJhZGl1cywgb3V0KSB7XG4gICAgcmFkaXVzID0gZGVmaW5lZChyYWRpdXMsIDEpO1xuICAgIG91dCA9IG91dCB8fCBbXTtcbiAgICB2YXIgdGhldGEgPSB2YWx1ZSgpICogMi4wICogTWF0aC5QSTtcbiAgICBvdXRbMF0gPSByYWRpdXMgKiBNYXRoLmNvcyh0aGV0YSk7XG4gICAgb3V0WzFdID0gcmFkaXVzICogTWF0aC5zaW4odGhldGEpO1xuICAgIHJldHVybiBvdXQ7XG4gIH1cblxuICBmdW5jdGlvbiBpbnNpZGVDaXJjbGUgKHJhZGl1cywgb3V0KSB7XG4gICAgcmFkaXVzID0gZGVmaW5lZChyYWRpdXMsIDEpO1xuICAgIG91dCA9IG91dCB8fCBbXTtcbiAgICBvbkNpcmNsZSgxLCBvdXQpO1xuICAgIHZhciByID0gcmFkaXVzICogTWF0aC5zcXJ0KHZhbHVlKCkpO1xuICAgIG91dFswXSAqPSByO1xuICAgIG91dFsxXSAqPSByO1xuICAgIHJldHVybiBvdXQ7XG4gIH1cblxuICBmdW5jdGlvbiBvblNwaGVyZSAocmFkaXVzLCBvdXQpIHtcbiAgICByYWRpdXMgPSBkZWZpbmVkKHJhZGl1cywgMSk7XG4gICAgb3V0ID0gb3V0IHx8IFtdO1xuICAgIHZhciB1ID0gdmFsdWUoKSAqIE1hdGguUEkgKiAyO1xuICAgIHZhciB2ID0gdmFsdWUoKSAqIDIgLSAxO1xuICAgIHZhciBwaGkgPSB1O1xuICAgIHZhciB0aGV0YSA9IE1hdGguYWNvcyh2KTtcbiAgICBvdXRbMF0gPSByYWRpdXMgKiBNYXRoLnNpbih0aGV0YSkgKiBNYXRoLmNvcyhwaGkpO1xuICAgIG91dFsxXSA9IHJhZGl1cyAqIE1hdGguc2luKHRoZXRhKSAqIE1hdGguc2luKHBoaSk7XG4gICAgb3V0WzJdID0gcmFkaXVzICogTWF0aC5jb3ModGhldGEpO1xuICAgIHJldHVybiBvdXQ7XG4gIH1cblxuICBmdW5jdGlvbiBpbnNpZGVTcGhlcmUgKHJhZGl1cywgb3V0KSB7XG4gICAgcmFkaXVzID0gZGVmaW5lZChyYWRpdXMsIDEpO1xuICAgIG91dCA9IG91dCB8fCBbXTtcbiAgICB2YXIgdSA9IHZhbHVlKCkgKiBNYXRoLlBJICogMjtcbiAgICB2YXIgdiA9IHZhbHVlKCkgKiAyIC0gMTtcbiAgICB2YXIgayA9IHZhbHVlKCk7XG5cbiAgICB2YXIgcGhpID0gdTtcbiAgICB2YXIgdGhldGEgPSBNYXRoLmFjb3Modik7XG4gICAgdmFyIHIgPSByYWRpdXMgKiBNYXRoLmNicnQoayk7XG4gICAgb3V0WzBdID0gciAqIE1hdGguc2luKHRoZXRhKSAqIE1hdGguY29zKHBoaSk7XG4gICAgb3V0WzFdID0gciAqIE1hdGguc2luKHRoZXRhKSAqIE1hdGguc2luKHBoaSk7XG4gICAgb3V0WzJdID0gciAqIE1hdGguY29zKHRoZXRhKTtcbiAgICByZXR1cm4gb3V0O1xuICB9XG5cbiAgZnVuY3Rpb24gcXVhdGVybmlvbiAob3V0KSB7XG4gICAgb3V0ID0gb3V0IHx8IFtdO1xuICAgIHZhciB1MSA9IHZhbHVlKCk7XG4gICAgdmFyIHUyID0gdmFsdWUoKTtcbiAgICB2YXIgdTMgPSB2YWx1ZSgpO1xuXG4gICAgdmFyIHNxMSA9IE1hdGguc3FydCgxIC0gdTEpO1xuICAgIHZhciBzcTIgPSBNYXRoLnNxcnQodTEpO1xuXG4gICAgdmFyIHRoZXRhMSA9IE1hdGguUEkgKiAyICogdTI7XG4gICAgdmFyIHRoZXRhMiA9IE1hdGguUEkgKiAyICogdTM7XG5cbiAgICB2YXIgeCA9IE1hdGguc2luKHRoZXRhMSkgKiBzcTE7XG4gICAgdmFyIHkgPSBNYXRoLmNvcyh0aGV0YTEpICogc3ExO1xuICAgIHZhciB6ID0gTWF0aC5zaW4odGhldGEyKSAqIHNxMjtcbiAgICB2YXIgdyA9IE1hdGguY29zKHRoZXRhMikgKiBzcTI7XG4gICAgb3V0WzBdID0geDtcbiAgICBvdXRbMV0gPSB5O1xuICAgIG91dFsyXSA9IHo7XG4gICAgb3V0WzNdID0gdztcbiAgICByZXR1cm4gb3V0O1xuICB9XG5cbiAgZnVuY3Rpb24gd2VpZ2h0ZWRTZXQgKHNldCkge1xuICAgIHNldCA9IHNldCB8fCBbXTtcbiAgICBpZiAoc2V0Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIHNldFt3ZWlnaHRlZFNldEluZGV4KHNldCldLnZhbHVlO1xuICB9XG5cbiAgZnVuY3Rpb24gd2VpZ2h0ZWRTZXRJbmRleCAoc2V0KSB7XG4gICAgc2V0ID0gc2V0IHx8IFtdO1xuICAgIGlmIChzZXQubGVuZ3RoID09PSAwKSByZXR1cm4gLTE7XG4gICAgcmV0dXJuIHdlaWdodGVkKHNldC5tYXAoZnVuY3Rpb24gKHMpIHtcbiAgICAgIHJldHVybiBzLndlaWdodDtcbiAgICB9KSk7XG4gIH1cblxuICBmdW5jdGlvbiB3ZWlnaHRlZCAod2VpZ2h0cykge1xuICAgIHdlaWdodHMgPSB3ZWlnaHRzIHx8IFtdO1xuICAgIGlmICh3ZWlnaHRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIC0xO1xuICAgIHZhciB0b3RhbFdlaWdodCA9IDA7XG4gICAgdmFyIGk7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgd2VpZ2h0cy5sZW5ndGg7IGkrKykge1xuICAgICAgdG90YWxXZWlnaHQgKz0gd2VpZ2h0c1tpXTtcbiAgICB9XG5cbiAgICBpZiAodG90YWxXZWlnaHQgPD0gMCkgdGhyb3cgbmV3IEVycm9yKCdXZWlnaHRzIG11c3Qgc3VtIHRvID4gMCcpO1xuXG4gICAgdmFyIHJhbmRvbSA9IHZhbHVlKCkgKiB0b3RhbFdlaWdodDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgd2VpZ2h0cy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHJhbmRvbSA8IHdlaWdodHNbaV0pIHtcbiAgICAgICAgcmV0dXJuIGk7XG4gICAgICB9XG4gICAgICByYW5kb20gLT0gd2VpZ2h0c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICBmdW5jdGlvbiBnYXVzc2lhbiAobWVhbiwgc3RhbmRhcmREZXJpdmF0aW9uKSB7XG4gICAgbWVhbiA9IGRlZmluZWQobWVhbiwgMCk7XG4gICAgc3RhbmRhcmREZXJpdmF0aW9uID0gZGVmaW5lZChzdGFuZGFyZERlcml2YXRpb24sIDEpO1xuXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL29wZW5qZGstbWlycm9yL2pkazd1LWpkay9ibG9iL2Y0ZDgwOTU3ZTg5YTE5YTI5YmI5Zjk4MDdkMmEyODM1MWVkN2Y3ZGYvc3JjL3NoYXJlL2NsYXNzZXMvamF2YS91dGlsL1JhbmRvbS5qYXZhI0w0OTZcbiAgICBpZiAoX2hhc05leHRHYXVzc2lhbikge1xuICAgICAgX2hhc05leHRHYXVzc2lhbiA9IGZhbHNlO1xuICAgICAgdmFyIHJlc3VsdCA9IF9uZXh0R2F1c3NpYW47XG4gICAgICBfbmV4dEdhdXNzaWFuID0gbnVsbDtcbiAgICAgIHJldHVybiBtZWFuICsgc3RhbmRhcmREZXJpdmF0aW9uICogcmVzdWx0O1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdjEgPSAwO1xuICAgICAgdmFyIHYyID0gMDtcbiAgICAgIHZhciBzID0gMDtcbiAgICAgIGRvIHtcbiAgICAgICAgdjEgPSB2YWx1ZSgpICogMiAtIDE7IC8vIGJldHdlZW4gLTEgYW5kIDFcbiAgICAgICAgdjIgPSB2YWx1ZSgpICogMiAtIDE7IC8vIGJldHdlZW4gLTEgYW5kIDFcbiAgICAgICAgcyA9IHYxICogdjEgKyB2MiAqIHYyO1xuICAgICAgfSB3aGlsZSAocyA+PSAxIHx8IHMgPT09IDApO1xuICAgICAgdmFyIG11bHRpcGxpZXIgPSBNYXRoLnNxcnQoLTIgKiBNYXRoLmxvZyhzKSAvIHMpO1xuICAgICAgX25leHRHYXVzc2lhbiA9ICh2MiAqIG11bHRpcGxpZXIpO1xuICAgICAgX2hhc05leHRHYXVzc2lhbiA9IHRydWU7XG4gICAgICByZXR1cm4gbWVhbiArIHN0YW5kYXJkRGVyaXZhdGlvbiAqICh2MSAqIG11bHRpcGxpZXIpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZVJhbmRvbSgpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50c1tpXSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gYXJndW1lbnRzW2ldO1xuICAgIH1cbn07XG4iLCIvKlxub2JqZWN0LWFzc2lnblxuKGMpIFNpbmRyZSBTb3JodXNcbkBsaWNlbnNlIE1JVFxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbnZhciBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xudmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciBwcm9wSXNFbnVtZXJhYmxlID0gT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcblxuZnVuY3Rpb24gdG9PYmplY3QodmFsKSB7XG5cdGlmICh2YWwgPT09IG51bGwgfHwgdmFsID09PSB1bmRlZmluZWQpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdPYmplY3QuYXNzaWduIGNhbm5vdCBiZSBjYWxsZWQgd2l0aCBudWxsIG9yIHVuZGVmaW5lZCcpO1xuXHR9XG5cblx0cmV0dXJuIE9iamVjdCh2YWwpO1xufVxuXG5mdW5jdGlvbiBzaG91bGRVc2VOYXRpdmUoKSB7XG5cdHRyeSB7XG5cdFx0aWYgKCFPYmplY3QuYXNzaWduKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gRGV0ZWN0IGJ1Z2d5IHByb3BlcnR5IGVudW1lcmF0aW9uIG9yZGVyIGluIG9sZGVyIFY4IHZlcnNpb25zLlxuXG5cdFx0Ly8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9NDExOFxuXHRcdHZhciB0ZXN0MSA9IG5ldyBTdHJpbmcoJ2FiYycpOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1uZXctd3JhcHBlcnNcblx0XHR0ZXN0MVs1XSA9ICdkZSc7XG5cdFx0aWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRlc3QxKVswXSA9PT0gJzUnKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9MzA1NlxuXHRcdHZhciB0ZXN0MiA9IHt9O1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgMTA7IGkrKykge1xuXHRcdFx0dGVzdDJbJ18nICsgU3RyaW5nLmZyb21DaGFyQ29kZShpKV0gPSBpO1xuXHRcdH1cblx0XHR2YXIgb3JkZXIyID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGVzdDIpLm1hcChmdW5jdGlvbiAobikge1xuXHRcdFx0cmV0dXJuIHRlc3QyW25dO1xuXHRcdH0pO1xuXHRcdGlmIChvcmRlcjIuam9pbignJykgIT09ICcwMTIzNDU2Nzg5Jykge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTMwNTZcblx0XHR2YXIgdGVzdDMgPSB7fTtcblx0XHQnYWJjZGVmZ2hpamtsbW5vcHFyc3QnLnNwbGl0KCcnKS5mb3JFYWNoKGZ1bmN0aW9uIChsZXR0ZXIpIHtcblx0XHRcdHRlc3QzW2xldHRlcl0gPSBsZXR0ZXI7XG5cdFx0fSk7XG5cdFx0aWYgKE9iamVjdC5rZXlzKE9iamVjdC5hc3NpZ24oe30sIHRlc3QzKSkuam9pbignJykgIT09XG5cdFx0XHRcdCdhYmNkZWZnaGlqa2xtbm9wcXJzdCcpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0Ly8gV2UgZG9uJ3QgZXhwZWN0IGFueSBvZiB0aGUgYWJvdmUgdG8gdGhyb3csIGJ1dCBiZXR0ZXIgdG8gYmUgc2FmZS5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzaG91bGRVc2VOYXRpdmUoKSA/IE9iamVjdC5hc3NpZ24gOiBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcblx0dmFyIGZyb207XG5cdHZhciB0byA9IHRvT2JqZWN0KHRhcmdldCk7XG5cdHZhciBzeW1ib2xzO1xuXG5cdGZvciAodmFyIHMgPSAxOyBzIDwgYXJndW1lbnRzLmxlbmd0aDsgcysrKSB7XG5cdFx0ZnJvbSA9IE9iamVjdChhcmd1bWVudHNbc10pO1xuXG5cdFx0Zm9yICh2YXIga2V5IGluIGZyb20pIHtcblx0XHRcdGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGZyb20sIGtleSkpIHtcblx0XHRcdFx0dG9ba2V5XSA9IGZyb21ba2V5XTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7XG5cdFx0XHRzeW1ib2xzID0gZ2V0T3duUHJvcGVydHlTeW1ib2xzKGZyb20pO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzeW1ib2xzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmIChwcm9wSXNFbnVtZXJhYmxlLmNhbGwoZnJvbSwgc3ltYm9sc1tpXSkpIHtcblx0XHRcdFx0XHR0b1tzeW1ib2xzW2ldXSA9IGZyb21bc3ltYm9sc1tpXV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdG87XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPVxuICBnbG9iYWwucGVyZm9ybWFuY2UgJiZcbiAgZ2xvYmFsLnBlcmZvcm1hbmNlLm5vdyA/IGZ1bmN0aW9uIG5vdygpIHtcbiAgICByZXR1cm4gcGVyZm9ybWFuY2Uubm93KClcbiAgfSA6IERhdGUubm93IHx8IGZ1bmN0aW9uIG5vdygpIHtcbiAgICByZXR1cm4gK25ldyBEYXRlXG4gIH1cbiIsIm1vZHVsZS5leHBvcnRzID0gaXNQcm9taXNlO1xuXG5mdW5jdGlvbiBpc1Byb21pc2Uob2JqKSB7XG4gIHJldHVybiAhIW9iaiAmJiAodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJykgJiYgdHlwZW9mIG9iai50aGVuID09PSAnZnVuY3Rpb24nO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBpc05vZGVcblxuZnVuY3Rpb24gaXNOb2RlICh2YWwpIHtcbiAgcmV0dXJuICghdmFsIHx8IHR5cGVvZiB2YWwgIT09ICdvYmplY3QnKVxuICAgID8gZmFsc2VcbiAgICA6ICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JyAmJiB0eXBlb2Ygd2luZG93Lk5vZGUgPT09ICdvYmplY3QnKVxuICAgICAgPyAodmFsIGluc3RhbmNlb2Ygd2luZG93Lk5vZGUpXG4gICAgICA6ICh0eXBlb2YgdmFsLm5vZGVUeXBlID09PSAnbnVtYmVyJykgJiZcbiAgICAgICAgKHR5cGVvZiB2YWwubm9kZU5hbWUgPT09ICdzdHJpbmcnKVxufVxuIiwiLy8gVE9ETzogV2UgY2FuIHJlbW92ZSBhIGh1Z2UgY2h1bmsgb2YgYnVuZGxlIHNpemUgYnkgdXNpbmcgYSBzbWFsbGVyXG4vLyB1dGlsaXR5IG1vZHVsZSBmb3IgY29udmVydGluZyB1bml0cy5cbmltcG9ydCBpc0RPTSBmcm9tICdpcy1kb20nO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2xpZW50QVBJICgpIHtcbiAgcmV0dXJuIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvd1snY2FudmFzLXNrZXRjaC1jbGknXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQnJvd3NlciAoKSB7XG4gIHJldHVybiB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNXZWJHTENvbnRleHQgKGN0eCkge1xuICByZXR1cm4gdHlwZW9mIGN0eC5jbGVhciA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgY3R4LmNsZWFyQ29sb3IgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGN0eC5idWZmZXJEYXRhID09PSAnZnVuY3Rpb24nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNDYW52YXMgKGVsZW1lbnQpIHtcbiAgcmV0dXJuIGlzRE9NKGVsZW1lbnQpICYmIC9jYW52YXMvaS50ZXN0KGVsZW1lbnQubm9kZU5hbWUpICYmIHR5cGVvZiBlbGVtZW50LmdldENvbnRleHQgPT09ICdmdW5jdGlvbic7XG59XG4iLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSB0eXBlb2YgT2JqZWN0LmtleXMgPT09ICdmdW5jdGlvbidcbiAgPyBPYmplY3Qua2V5cyA6IHNoaW07XG5cbmV4cG9ydHMuc2hpbSA9IHNoaW07XG5mdW5jdGlvbiBzaGltIChvYmopIHtcbiAgdmFyIGtleXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikga2V5cy5wdXNoKGtleSk7XG4gIHJldHVybiBrZXlzO1xufVxuIiwidmFyIHN1cHBvcnRzQXJndW1lbnRzQ2xhc3MgPSAoZnVuY3Rpb24oKXtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhcmd1bWVudHMpXG59KSgpID09ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBzdXBwb3J0c0FyZ3VtZW50c0NsYXNzID8gc3VwcG9ydGVkIDogdW5zdXBwb3J0ZWQ7XG5cbmV4cG9ydHMuc3VwcG9ydGVkID0gc3VwcG9ydGVkO1xuZnVuY3Rpb24gc3VwcG9ydGVkKG9iamVjdCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkgPT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG59O1xuXG5leHBvcnRzLnVuc3VwcG9ydGVkID0gdW5zdXBwb3J0ZWQ7XG5mdW5jdGlvbiB1bnN1cHBvcnRlZChvYmplY3Qpe1xuICByZXR1cm4gb2JqZWN0ICYmXG4gICAgdHlwZW9mIG9iamVjdCA9PSAnb2JqZWN0JyAmJlxuICAgIHR5cGVvZiBvYmplY3QubGVuZ3RoID09ICdudW1iZXInICYmXG4gICAgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgJ2NhbGxlZScpICYmXG4gICAgIU9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChvYmplY3QsICdjYWxsZWUnKSB8fFxuICAgIGZhbHNlO1xufTtcbiIsInZhciBwU2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG52YXIgb2JqZWN0S2V5cyA9IHJlcXVpcmUoJy4vbGliL2tleXMuanMnKTtcbnZhciBpc0FyZ3VtZW50cyA9IHJlcXVpcmUoJy4vbGliL2lzX2FyZ3VtZW50cy5qcycpO1xuXG52YXIgZGVlcEVxdWFsID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYWN0dWFsLCBleHBlY3RlZCwgb3B0cykge1xuICBpZiAoIW9wdHMpIG9wdHMgPSB7fTtcbiAgLy8gNy4xLiBBbGwgaWRlbnRpY2FsIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgYXMgZGV0ZXJtaW5lZCBieSA9PT0uXG4gIGlmIChhY3R1YWwgPT09IGV4cGVjdGVkKSB7XG4gICAgcmV0dXJuIHRydWU7XG5cbiAgfSBlbHNlIGlmIChhY3R1YWwgaW5zdGFuY2VvZiBEYXRlICYmIGV4cGVjdGVkIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgIHJldHVybiBhY3R1YWwuZ2V0VGltZSgpID09PSBleHBlY3RlZC5nZXRUaW1lKCk7XG5cbiAgLy8gNy4zLiBPdGhlciBwYWlycyB0aGF0IGRvIG5vdCBib3RoIHBhc3MgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnLFxuICAvLyBlcXVpdmFsZW5jZSBpcyBkZXRlcm1pbmVkIGJ5ID09LlxuICB9IGVsc2UgaWYgKCFhY3R1YWwgfHwgIWV4cGVjdGVkIHx8IHR5cGVvZiBhY3R1YWwgIT0gJ29iamVjdCcgJiYgdHlwZW9mIGV4cGVjdGVkICE9ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIG9wdHMuc3RyaWN0ID8gYWN0dWFsID09PSBleHBlY3RlZCA6IGFjdHVhbCA9PSBleHBlY3RlZDtcblxuICAvLyA3LjQuIEZvciBhbGwgb3RoZXIgT2JqZWN0IHBhaXJzLCBpbmNsdWRpbmcgQXJyYXkgb2JqZWN0cywgZXF1aXZhbGVuY2UgaXNcbiAgLy8gZGV0ZXJtaW5lZCBieSBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGFzIHZlcmlmaWVkXG4gIC8vIHdpdGggT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKSwgdGhlIHNhbWUgc2V0IG9mIGtleXNcbiAgLy8gKGFsdGhvdWdoIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZSBvcmRlciksIGVxdWl2YWxlbnQgdmFsdWVzIGZvciBldmVyeVxuICAvLyBjb3JyZXNwb25kaW5nIGtleSwgYW5kIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS4gTm90ZTogdGhpc1xuICAvLyBhY2NvdW50cyBmb3IgYm90aCBuYW1lZCBhbmQgaW5kZXhlZCBwcm9wZXJ0aWVzIG9uIEFycmF5cy5cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gb2JqRXF1aXYoYWN0dWFsLCBleHBlY3RlZCwgb3B0cyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWRPck51bGwodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGlzQnVmZmVyICh4KSB7XG4gIGlmICgheCB8fCB0eXBlb2YgeCAhPT0gJ29iamVjdCcgfHwgdHlwZW9mIHgubGVuZ3RoICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuICBpZiAodHlwZW9mIHguY29weSAhPT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgeC5zbGljZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoeC5sZW5ndGggPiAwICYmIHR5cGVvZiB4WzBdICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gb2JqRXF1aXYoYSwgYiwgb3B0cykge1xuICB2YXIgaSwga2V5O1xuICBpZiAoaXNVbmRlZmluZWRPck51bGwoYSkgfHwgaXNVbmRlZmluZWRPck51bGwoYikpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvLyBhbiBpZGVudGljYWwgJ3Byb3RvdHlwZScgcHJvcGVydHkuXG4gIGlmIChhLnByb3RvdHlwZSAhPT0gYi5wcm90b3R5cGUpIHJldHVybiBmYWxzZTtcbiAgLy9+fn5JJ3ZlIG1hbmFnZWQgdG8gYnJlYWsgT2JqZWN0LmtleXMgdGhyb3VnaCBzY3Jld3kgYXJndW1lbnRzIHBhc3NpbmcuXG4gIC8vICAgQ29udmVydGluZyB0byBhcnJheSBzb2x2ZXMgdGhlIHByb2JsZW0uXG4gIGlmIChpc0FyZ3VtZW50cyhhKSkge1xuICAgIGlmICghaXNBcmd1bWVudHMoYikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgYSA9IHBTbGljZS5jYWxsKGEpO1xuICAgIGIgPSBwU2xpY2UuY2FsbChiKTtcbiAgICByZXR1cm4gZGVlcEVxdWFsKGEsIGIsIG9wdHMpO1xuICB9XG4gIGlmIChpc0J1ZmZlcihhKSkge1xuICAgIGlmICghaXNCdWZmZXIoYikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgIGZvciAoaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoYVtpXSAhPT0gYltpXSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB0cnkge1xuICAgIHZhciBrYSA9IG9iamVjdEtleXMoYSksXG4gICAgICAgIGtiID0gb2JqZWN0S2V5cyhiKTtcbiAgfSBjYXRjaCAoZSkgey8vaGFwcGVucyB3aGVuIG9uZSBpcyBhIHN0cmluZyBsaXRlcmFsIGFuZCB0aGUgb3RoZXIgaXNuJ3RcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gaGF2aW5nIHRoZSBzYW1lIG51bWJlciBvZiBvd25lZCBwcm9wZXJ0aWVzIChrZXlzIGluY29ycG9yYXRlc1xuICAvLyBoYXNPd25Qcm9wZXJ0eSlcbiAgaWYgKGthLmxlbmd0aCAhPSBrYi5sZW5ndGgpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvL3RoZSBzYW1lIHNldCBvZiBrZXlzIChhbHRob3VnaCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWUgb3JkZXIpLFxuICBrYS5zb3J0KCk7XG4gIGtiLnNvcnQoKTtcbiAgLy9+fn5jaGVhcCBrZXkgdGVzdFxuICBmb3IgKGkgPSBrYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGlmIChrYVtpXSAhPSBrYltpXSlcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvL2VxdWl2YWxlbnQgdmFsdWVzIGZvciBldmVyeSBjb3JyZXNwb25kaW5nIGtleSwgYW5kXG4gIC8vfn5+cG9zc2libHkgZXhwZW5zaXZlIGRlZXAgdGVzdFxuICBmb3IgKGkgPSBrYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGtleSA9IGthW2ldO1xuICAgIGlmICghZGVlcEVxdWFsKGFba2V5XSwgYltrZXldLCBvcHRzKSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0eXBlb2YgYSA9PT0gdHlwZW9mIGI7XG59XG4iLCIvKlxuICogRGF0ZSBGb3JtYXQgMS4yLjNcbiAqIChjKSAyMDA3LTIwMDkgU3RldmVuIExldml0aGFuIDxzdGV2ZW5sZXZpdGhhbi5jb20+XG4gKiBNSVQgbGljZW5zZVxuICpcbiAqIEluY2x1ZGVzIGVuaGFuY2VtZW50cyBieSBTY290dCBUcmVuZGEgPHNjb3R0LnRyZW5kYS5uZXQ+XG4gKiBhbmQgS3JpcyBLb3dhbCA8Y2l4YXIuY29tL35rcmlzLmtvd2FsLz5cbiAqXG4gKiBBY2NlcHRzIGEgZGF0ZSwgYSBtYXNrLCBvciBhIGRhdGUgYW5kIGEgbWFzay5cbiAqIFJldHVybnMgYSBmb3JtYXR0ZWQgdmVyc2lvbiBvZiB0aGUgZ2l2ZW4gZGF0ZS5cbiAqIFRoZSBkYXRlIGRlZmF1bHRzIHRvIHRoZSBjdXJyZW50IGRhdGUvdGltZS5cbiAqIFRoZSBtYXNrIGRlZmF1bHRzIHRvIGRhdGVGb3JtYXQubWFza3MuZGVmYXVsdC5cbiAqL1xuXG4oZnVuY3Rpb24oZ2xvYmFsKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgZGF0ZUZvcm1hdCA9IChmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0b2tlbiA9IC9kezEsNH18bXsxLDR9fHl5KD86eXkpP3woW0hoTXNUdF0pXFwxP3xbTGxvU1pXTl18XCJbXlwiXSpcInwnW14nXSonL2c7XG4gICAgICB2YXIgdGltZXpvbmUgPSAvXFxiKD86W1BNQ0VBXVtTRFBdVHwoPzpQYWNpZmljfE1vdW50YWlufENlbnRyYWx8RWFzdGVybnxBdGxhbnRpYykgKD86U3RhbmRhcmR8RGF5bGlnaHR8UHJldmFpbGluZykgVGltZXwoPzpHTVR8VVRDKSg/OlstK11cXGR7NH0pPylcXGIvZztcbiAgICAgIHZhciB0aW1lem9uZUNsaXAgPSAvW14tK1xcZEEtWl0vZztcbiAgXG4gICAgICAvLyBSZWdleGVzIGFuZCBzdXBwb3J0aW5nIGZ1bmN0aW9ucyBhcmUgY2FjaGVkIHRocm91Z2ggY2xvc3VyZVxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChkYXRlLCBtYXNrLCB1dGMsIGdtdCkge1xuICBcbiAgICAgICAgLy8gWW91IGNhbid0IHByb3ZpZGUgdXRjIGlmIHlvdSBza2lwIG90aGVyIGFyZ3MgKHVzZSB0aGUgJ1VUQzonIG1hc2sgcHJlZml4KVxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSAmJiBraW5kT2YoZGF0ZSkgPT09ICdzdHJpbmcnICYmICEvXFxkLy50ZXN0KGRhdGUpKSB7XG4gICAgICAgICAgbWFzayA9IGRhdGU7XG4gICAgICAgICAgZGF0ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICBcbiAgICAgICAgZGF0ZSA9IGRhdGUgfHwgbmV3IERhdGU7XG4gIFxuICAgICAgICBpZighKGRhdGUgaW5zdGFuY2VvZiBEYXRlKSkge1xuICAgICAgICAgIGRhdGUgPSBuZXcgRGF0ZShkYXRlKTtcbiAgICAgICAgfVxuICBcbiAgICAgICAgaWYgKGlzTmFOKGRhdGUpKSB7XG4gICAgICAgICAgdGhyb3cgVHlwZUVycm9yKCdJbnZhbGlkIGRhdGUnKTtcbiAgICAgICAgfVxuICBcbiAgICAgICAgbWFzayA9IFN0cmluZyhkYXRlRm9ybWF0Lm1hc2tzW21hc2tdIHx8IG1hc2sgfHwgZGF0ZUZvcm1hdC5tYXNrc1snZGVmYXVsdCddKTtcbiAgXG4gICAgICAgIC8vIEFsbG93IHNldHRpbmcgdGhlIHV0Yy9nbXQgYXJndW1lbnQgdmlhIHRoZSBtYXNrXG4gICAgICAgIHZhciBtYXNrU2xpY2UgPSBtYXNrLnNsaWNlKDAsIDQpO1xuICAgICAgICBpZiAobWFza1NsaWNlID09PSAnVVRDOicgfHwgbWFza1NsaWNlID09PSAnR01UOicpIHtcbiAgICAgICAgICBtYXNrID0gbWFzay5zbGljZSg0KTtcbiAgICAgICAgICB1dGMgPSB0cnVlO1xuICAgICAgICAgIGlmIChtYXNrU2xpY2UgPT09ICdHTVQ6Jykge1xuICAgICAgICAgICAgZ210ID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgXG4gICAgICAgIHZhciBfID0gdXRjID8gJ2dldFVUQycgOiAnZ2V0JztcbiAgICAgICAgdmFyIGQgPSBkYXRlW18gKyAnRGF0ZSddKCk7XG4gICAgICAgIHZhciBEID0gZGF0ZVtfICsgJ0RheSddKCk7XG4gICAgICAgIHZhciBtID0gZGF0ZVtfICsgJ01vbnRoJ10oKTtcbiAgICAgICAgdmFyIHkgPSBkYXRlW18gKyAnRnVsbFllYXInXSgpO1xuICAgICAgICB2YXIgSCA9IGRhdGVbXyArICdIb3VycyddKCk7XG4gICAgICAgIHZhciBNID0gZGF0ZVtfICsgJ01pbnV0ZXMnXSgpO1xuICAgICAgICB2YXIgcyA9IGRhdGVbXyArICdTZWNvbmRzJ10oKTtcbiAgICAgICAgdmFyIEwgPSBkYXRlW18gKyAnTWlsbGlzZWNvbmRzJ10oKTtcbiAgICAgICAgdmFyIG8gPSB1dGMgPyAwIDogZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpO1xuICAgICAgICB2YXIgVyA9IGdldFdlZWsoZGF0ZSk7XG4gICAgICAgIHZhciBOID0gZ2V0RGF5T2ZXZWVrKGRhdGUpO1xuICAgICAgICB2YXIgZmxhZ3MgPSB7XG4gICAgICAgICAgZDogICAgZCxcbiAgICAgICAgICBkZDogICBwYWQoZCksXG4gICAgICAgICAgZGRkOiAgZGF0ZUZvcm1hdC5pMThuLmRheU5hbWVzW0RdLFxuICAgICAgICAgIGRkZGQ6IGRhdGVGb3JtYXQuaTE4bi5kYXlOYW1lc1tEICsgN10sXG4gICAgICAgICAgbTogICAgbSArIDEsXG4gICAgICAgICAgbW06ICAgcGFkKG0gKyAxKSxcbiAgICAgICAgICBtbW06ICBkYXRlRm9ybWF0LmkxOG4ubW9udGhOYW1lc1ttXSxcbiAgICAgICAgICBtbW1tOiBkYXRlRm9ybWF0LmkxOG4ubW9udGhOYW1lc1ttICsgMTJdLFxuICAgICAgICAgIHl5OiAgIFN0cmluZyh5KS5zbGljZSgyKSxcbiAgICAgICAgICB5eXl5OiB5LFxuICAgICAgICAgIGg6ICAgIEggJSAxMiB8fCAxMixcbiAgICAgICAgICBoaDogICBwYWQoSCAlIDEyIHx8IDEyKSxcbiAgICAgICAgICBIOiAgICBILFxuICAgICAgICAgIEhIOiAgIHBhZChIKSxcbiAgICAgICAgICBNOiAgICBNLFxuICAgICAgICAgIE1NOiAgIHBhZChNKSxcbiAgICAgICAgICBzOiAgICBzLFxuICAgICAgICAgIHNzOiAgIHBhZChzKSxcbiAgICAgICAgICBsOiAgICBwYWQoTCwgMyksXG4gICAgICAgICAgTDogICAgcGFkKE1hdGgucm91bmQoTCAvIDEwKSksXG4gICAgICAgICAgdDogICAgSCA8IDEyID8gZGF0ZUZvcm1hdC5pMThuLnRpbWVOYW1lc1swXSA6IGRhdGVGb3JtYXQuaTE4bi50aW1lTmFtZXNbMV0sXG4gICAgICAgICAgdHQ6ICAgSCA8IDEyID8gZGF0ZUZvcm1hdC5pMThuLnRpbWVOYW1lc1syXSA6IGRhdGVGb3JtYXQuaTE4bi50aW1lTmFtZXNbM10sXG4gICAgICAgICAgVDogICAgSCA8IDEyID8gZGF0ZUZvcm1hdC5pMThuLnRpbWVOYW1lc1s0XSA6IGRhdGVGb3JtYXQuaTE4bi50aW1lTmFtZXNbNV0sXG4gICAgICAgICAgVFQ6ICAgSCA8IDEyID8gZGF0ZUZvcm1hdC5pMThuLnRpbWVOYW1lc1s2XSA6IGRhdGVGb3JtYXQuaTE4bi50aW1lTmFtZXNbN10sXG4gICAgICAgICAgWjogICAgZ210ID8gJ0dNVCcgOiB1dGMgPyAnVVRDJyA6IChTdHJpbmcoZGF0ZSkubWF0Y2godGltZXpvbmUpIHx8IFsnJ10pLnBvcCgpLnJlcGxhY2UodGltZXpvbmVDbGlwLCAnJyksXG4gICAgICAgICAgbzogICAgKG8gPiAwID8gJy0nIDogJysnKSArIHBhZChNYXRoLmZsb29yKE1hdGguYWJzKG8pIC8gNjApICogMTAwICsgTWF0aC5hYnMobykgJSA2MCwgNCksXG4gICAgICAgICAgUzogICAgWyd0aCcsICdzdCcsICduZCcsICdyZCddW2QgJSAxMCA+IDMgPyAwIDogKGQgJSAxMDAgLSBkICUgMTAgIT0gMTApICogZCAlIDEwXSxcbiAgICAgICAgICBXOiAgICBXLFxuICAgICAgICAgIE46ICAgIE5cbiAgICAgICAgfTtcbiAgXG4gICAgICAgIHJldHVybiBtYXNrLnJlcGxhY2UodG9rZW4sIGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgICAgIGlmIChtYXRjaCBpbiBmbGFncykge1xuICAgICAgICAgICAgcmV0dXJuIGZsYWdzW21hdGNoXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG1hdGNoLnNsaWNlKDEsIG1hdGNoLmxlbmd0aCAtIDEpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkoKTtcblxuICBkYXRlRm9ybWF0Lm1hc2tzID0ge1xuICAgICdkZWZhdWx0JzogICAgICAgICAgICAgICAnZGRkIG1tbSBkZCB5eXl5IEhIOk1NOnNzJyxcbiAgICAnc2hvcnREYXRlJzogICAgICAgICAgICAgJ20vZC95eScsXG4gICAgJ21lZGl1bURhdGUnOiAgICAgICAgICAgICdtbW0gZCwgeXl5eScsXG4gICAgJ2xvbmdEYXRlJzogICAgICAgICAgICAgICdtbW1tIGQsIHl5eXknLFxuICAgICdmdWxsRGF0ZSc6ICAgICAgICAgICAgICAnZGRkZCwgbW1tbSBkLCB5eXl5JyxcbiAgICAnc2hvcnRUaW1lJzogICAgICAgICAgICAgJ2g6TU0gVFQnLFxuICAgICdtZWRpdW1UaW1lJzogICAgICAgICAgICAnaDpNTTpzcyBUVCcsXG4gICAgJ2xvbmdUaW1lJzogICAgICAgICAgICAgICdoOk1NOnNzIFRUIFonLFxuICAgICdpc29EYXRlJzogICAgICAgICAgICAgICAneXl5eS1tbS1kZCcsXG4gICAgJ2lzb1RpbWUnOiAgICAgICAgICAgICAgICdISDpNTTpzcycsXG4gICAgJ2lzb0RhdGVUaW1lJzogICAgICAgICAgICd5eXl5LW1tLWRkXFwnVFxcJ0hIOk1NOnNzbycsXG4gICAgJ2lzb1V0Y0RhdGVUaW1lJzogICAgICAgICdVVEM6eXl5eS1tbS1kZFxcJ1RcXCdISDpNTTpzc1xcJ1pcXCcnLFxuICAgICdleHBpcmVzSGVhZGVyRm9ybWF0JzogICAnZGRkLCBkZCBtbW0geXl5eSBISDpNTTpzcyBaJ1xuICB9O1xuXG4gIC8vIEludGVybmF0aW9uYWxpemF0aW9uIHN0cmluZ3NcbiAgZGF0ZUZvcm1hdC5pMThuID0ge1xuICAgIGRheU5hbWVzOiBbXG4gICAgICAnU3VuJywgJ01vbicsICdUdWUnLCAnV2VkJywgJ1RodScsICdGcmknLCAnU2F0JyxcbiAgICAgICdTdW5kYXknLCAnTW9uZGF5JywgJ1R1ZXNkYXknLCAnV2VkbmVzZGF5JywgJ1RodXJzZGF5JywgJ0ZyaWRheScsICdTYXR1cmRheSdcbiAgICBdLFxuICAgIG1vbnRoTmFtZXM6IFtcbiAgICAgICdKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsICdPY3QnLCAnTm92JywgJ0RlYycsXG4gICAgICAnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsICdKdWx5JywgJ0F1Z3VzdCcsICdTZXB0ZW1iZXInLCAnT2N0b2JlcicsICdOb3ZlbWJlcicsICdEZWNlbWJlcidcbiAgICBdLFxuICAgIHRpbWVOYW1lczogW1xuICAgICAgJ2EnLCAncCcsICdhbScsICdwbScsICdBJywgJ1AnLCAnQU0nLCAnUE0nXG4gICAgXVxuICB9O1xuXG5mdW5jdGlvbiBwYWQodmFsLCBsZW4pIHtcbiAgdmFsID0gU3RyaW5nKHZhbCk7XG4gIGxlbiA9IGxlbiB8fCAyO1xuICB3aGlsZSAodmFsLmxlbmd0aCA8IGxlbikge1xuICAgIHZhbCA9ICcwJyArIHZhbDtcbiAgfVxuICByZXR1cm4gdmFsO1xufVxuXG4vKipcbiAqIEdldCB0aGUgSVNPIDg2MDEgd2VlayBudW1iZXJcbiAqIEJhc2VkIG9uIGNvbW1lbnRzIGZyb21cbiAqIGh0dHA6Ly90ZWNoYmxvZy5wcm9jdXJpb3Mubmwvay9uNjE4L25ld3Mvdmlldy8zMzc5Ni8xNDg2My9DYWxjdWxhdGUtSVNPLTg2MDEtd2Vlay1hbmQteWVhci1pbi1qYXZhc2NyaXB0Lmh0bWxcbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IGBkYXRlYFxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5mdW5jdGlvbiBnZXRXZWVrKGRhdGUpIHtcbiAgLy8gUmVtb3ZlIHRpbWUgY29tcG9uZW50cyBvZiBkYXRlXG4gIHZhciB0YXJnZXRUaHVyc2RheSA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCBkYXRlLmdldERhdGUoKSk7XG5cbiAgLy8gQ2hhbmdlIGRhdGUgdG8gVGh1cnNkYXkgc2FtZSB3ZWVrXG4gIHRhcmdldFRodXJzZGF5LnNldERhdGUodGFyZ2V0VGh1cnNkYXkuZ2V0RGF0ZSgpIC0gKCh0YXJnZXRUaHVyc2RheS5nZXREYXkoKSArIDYpICUgNykgKyAzKTtcblxuICAvLyBUYWtlIEphbnVhcnkgNHRoIGFzIGl0IGlzIGFsd2F5cyBpbiB3ZWVrIDEgKHNlZSBJU08gODYwMSlcbiAgdmFyIGZpcnN0VGh1cnNkYXkgPSBuZXcgRGF0ZSh0YXJnZXRUaHVyc2RheS5nZXRGdWxsWWVhcigpLCAwLCA0KTtcblxuICAvLyBDaGFuZ2UgZGF0ZSB0byBUaHVyc2RheSBzYW1lIHdlZWtcbiAgZmlyc3RUaHVyc2RheS5zZXREYXRlKGZpcnN0VGh1cnNkYXkuZ2V0RGF0ZSgpIC0gKChmaXJzdFRodXJzZGF5LmdldERheSgpICsgNikgJSA3KSArIDMpO1xuXG4gIC8vIENoZWNrIGlmIGRheWxpZ2h0LXNhdmluZy10aW1lLXN3aXRjaCBvY2N1cnJlZCBhbmQgY29ycmVjdCBmb3IgaXRcbiAgdmFyIGRzID0gdGFyZ2V0VGh1cnNkYXkuZ2V0VGltZXpvbmVPZmZzZXQoKSAtIGZpcnN0VGh1cnNkYXkuZ2V0VGltZXpvbmVPZmZzZXQoKTtcbiAgdGFyZ2V0VGh1cnNkYXkuc2V0SG91cnModGFyZ2V0VGh1cnNkYXkuZ2V0SG91cnMoKSAtIGRzKTtcblxuICAvLyBOdW1iZXIgb2Ygd2Vla3MgYmV0d2VlbiB0YXJnZXQgVGh1cnNkYXkgYW5kIGZpcnN0IFRodXJzZGF5XG4gIHZhciB3ZWVrRGlmZiA9ICh0YXJnZXRUaHVyc2RheSAtIGZpcnN0VGh1cnNkYXkpIC8gKDg2NDAwMDAwKjcpO1xuICByZXR1cm4gMSArIE1hdGguZmxvb3Iod2Vla0RpZmYpO1xufVxuXG4vKipcbiAqIEdldCBJU08tODYwMSBudW1lcmljIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkYXkgb2YgdGhlIHdlZWtcbiAqIDEgKGZvciBNb25kYXkpIHRocm91Z2ggNyAoZm9yIFN1bmRheSlcbiAqIFxuICogQHBhcmFtICB7T2JqZWN0fSBgZGF0ZWBcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuZnVuY3Rpb24gZ2V0RGF5T2ZXZWVrKGRhdGUpIHtcbiAgdmFyIGRvdyA9IGRhdGUuZ2V0RGF5KCk7XG4gIGlmKGRvdyA9PT0gMCkge1xuICAgIGRvdyA9IDc7XG4gIH1cbiAgcmV0dXJuIGRvdztcbn1cblxuLyoqXG4gKiBraW5kLW9mIHNob3J0Y3V0XG4gKiBAcGFyYW0gIHsqfSB2YWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZnVuY3Rpb24ga2luZE9mKHZhbCkge1xuICBpZiAodmFsID09PSBudWxsKSB7XG4gICAgcmV0dXJuICdudWxsJztcbiAgfVxuXG4gIGlmICh2YWwgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiAndW5kZWZpbmVkJztcbiAgfVxuXG4gIGlmICh0eXBlb2YgdmFsICE9PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiB0eXBlb2YgdmFsO1xuICB9XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsKSkge1xuICAgIHJldHVybiAnYXJyYXknO1xuICB9XG5cbiAgcmV0dXJuIHt9LnRvU3RyaW5nLmNhbGwodmFsKVxuICAgIC5zbGljZSg4LCAtMSkudG9Mb3dlckNhc2UoKTtcbn07XG5cblxuXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGRhdGVGb3JtYXQ7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBkYXRlRm9ybWF0O1xuICB9IGVsc2Uge1xuICAgIGdsb2JhbC5kYXRlRm9ybWF0ID0gZGF0ZUZvcm1hdDtcbiAgfVxufSkodGhpcyk7XG4iLCIvKiFcbiAqIHJlcGVhdC1zdHJpbmcgPGh0dHBzOi8vZ2l0aHViLmNvbS9qb25zY2hsaW5rZXJ0L3JlcGVhdC1zdHJpbmc+XG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LTIwMTUsIEpvbiBTY2hsaW5rZXJ0LlxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBSZXN1bHRzIGNhY2hlXG4gKi9cblxudmFyIHJlcyA9ICcnO1xudmFyIGNhY2hlO1xuXG4vKipcbiAqIEV4cG9zZSBgcmVwZWF0YFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gcmVwZWF0O1xuXG4vKipcbiAqIFJlcGVhdCB0aGUgZ2l2ZW4gYHN0cmluZ2AgdGhlIHNwZWNpZmllZCBgbnVtYmVyYFxuICogb2YgdGltZXMuXG4gKlxuICogKipFeGFtcGxlOioqXG4gKlxuICogYGBganNcbiAqIHZhciByZXBlYXQgPSByZXF1aXJlKCdyZXBlYXQtc3RyaW5nJyk7XG4gKiByZXBlYXQoJ0EnLCA1KTtcbiAqIC8vPT4gQUFBQUFcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBgc3RyaW5nYCBUaGUgc3RyaW5nIHRvIHJlcGVhdFxuICogQHBhcmFtIHtOdW1iZXJ9IGBudW1iZXJgIFRoZSBudW1iZXIgb2YgdGltZXMgdG8gcmVwZWF0IHRoZSBzdHJpbmdcbiAqIEByZXR1cm4ge1N0cmluZ30gUmVwZWF0ZWQgc3RyaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIHJlcGVhdChzdHIsIG51bSkge1xuICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdleHBlY3RlZCBhIHN0cmluZycpO1xuICB9XG5cbiAgLy8gY292ZXIgY29tbW9uLCBxdWljayB1c2UgY2FzZXNcbiAgaWYgKG51bSA9PT0gMSkgcmV0dXJuIHN0cjtcbiAgaWYgKG51bSA9PT0gMikgcmV0dXJuIHN0ciArIHN0cjtcblxuICB2YXIgbWF4ID0gc3RyLmxlbmd0aCAqIG51bTtcbiAgaWYgKGNhY2hlICE9PSBzdHIgfHwgdHlwZW9mIGNhY2hlID09PSAndW5kZWZpbmVkJykge1xuICAgIGNhY2hlID0gc3RyO1xuICAgIHJlcyA9ICcnO1xuICB9IGVsc2UgaWYgKHJlcy5sZW5ndGggPj0gbWF4KSB7XG4gICAgcmV0dXJuIHJlcy5zdWJzdHIoMCwgbWF4KTtcbiAgfVxuXG4gIHdoaWxlIChtYXggPiByZXMubGVuZ3RoICYmIG51bSA+IDEpIHtcbiAgICBpZiAobnVtICYgMSkge1xuICAgICAgcmVzICs9IHN0cjtcbiAgICB9XG5cbiAgICBudW0gPj49IDE7XG4gICAgc3RyICs9IHN0cjtcbiAgfVxuXG4gIHJlcyArPSBzdHI7XG4gIHJlcyA9IHJlcy5zdWJzdHIoMCwgbWF4KTtcbiAgcmV0dXJuIHJlcztcbn1cbiIsIi8qIVxuICogcGFkLWxlZnQgPGh0dHBzOi8vZ2l0aHViLmNvbS9qb25zY2hsaW5rZXJ0L3BhZC1sZWZ0PlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNC0yMDE1LCBKb24gU2NobGlua2VydC5cbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciByZXBlYXQgPSByZXF1aXJlKCdyZXBlYXQtc3RyaW5nJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFkTGVmdChzdHIsIG51bSwgY2gpIHtcbiAgc3RyID0gc3RyLnRvU3RyaW5nKCk7XG5cbiAgaWYgKHR5cGVvZiBudW0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxuXG4gIGlmIChjaCA9PT0gMCkge1xuICAgIGNoID0gJzAnO1xuICB9IGVsc2UgaWYgKGNoKSB7XG4gICAgY2ggPSBjaC50b1N0cmluZygpO1xuICB9IGVsc2Uge1xuICAgIGNoID0gJyAnO1xuICB9XG5cbiAgcmV0dXJuIHJlcGVhdChjaCwgbnVtIC0gc3RyLmxlbmd0aCkgKyBzdHI7XG59O1xuIiwiaW1wb3J0IGRhdGVmb3JtYXQgZnJvbSAnZGF0ZWZvcm1hdCc7XG5pbXBvcnQgYXNzaWduIGZyb20gJ29iamVjdC1hc3NpZ24nO1xuaW1wb3J0IHBhZExlZnQgZnJvbSAncGFkLWxlZnQnO1xuaW1wb3J0IHsgZ2V0Q2xpZW50QVBJIH0gZnJvbSAnLi91dGlsJztcblxuY29uc3Qgbm9vcCA9ICgpID0+IHt9O1xubGV0IGxpbms7XG5cbi8vIEFsdGVybmF0aXZlIHNvbHV0aW9uIGZvciBzYXZpbmcgZmlsZXMsXG4vLyBhIGJpdCBzbG93ZXIgYW5kIGRvZXMgbm90IHdvcmsgaW4gU2FmYXJpXG4vLyBmdW5jdGlvbiBmZXRjaEJsb2JGcm9tRGF0YVVSTCAoZGF0YVVSTCkge1xuLy8gICByZXR1cm4gd2luZG93LmZldGNoKGRhdGFVUkwpLnRoZW4ocmVzID0+IHJlcy5ibG9iKCkpO1xuLy8gfVxuXG5jb25zdCBzdXBwb3J0ZWRFbmNvZGluZ3MgPSBbXG4gICdpbWFnZS9wbmcnLFxuICAnaW1hZ2UvanBlZycsXG4gICdpbWFnZS93ZWJwJ1xuXTtcblxuZXhwb3J0IGZ1bmN0aW9uIGV4cG9ydENhbnZhcyAoY2FudmFzLCBvcHQgPSB7fSkge1xuICBjb25zdCBlbmNvZGluZyA9IG9wdC5lbmNvZGluZyB8fCAnaW1hZ2UvcG5nJztcbiAgaWYgKCFzdXBwb3J0ZWRFbmNvZGluZ3MuaW5jbHVkZXMoZW5jb2RpbmcpKSB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgY2FudmFzIGVuY29kaW5nICR7ZW5jb2Rpbmd9YCk7XG4gIGxldCBleHRlbnNpb24gPSAoZW5jb2Rpbmcuc3BsaXQoJy8nKVsxXSB8fCAnJykucmVwbGFjZSgvanBlZy9pLCAnanBnJyk7XG4gIGlmIChleHRlbnNpb24pIGV4dGVuc2lvbiA9IGAuJHtleHRlbnNpb259YC50b0xvd2VyQ2FzZSgpO1xuICByZXR1cm4ge1xuICAgIGV4dGVuc2lvbixcbiAgICB0eXBlOiBlbmNvZGluZyxcbiAgICBkYXRhVVJMOiBjYW52YXMudG9EYXRhVVJMKGVuY29kaW5nLCBvcHQuZW5jb2RpbmdRdWFsaXR5KVxuICB9O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVCbG9iRnJvbURhdGFVUkwgKGRhdGFVUkwpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgY29uc3Qgc3BsaXRJbmRleCA9IGRhdGFVUkwuaW5kZXhPZignLCcpO1xuICAgIGlmIChzcGxpdEluZGV4ID09PSAtMSkge1xuICAgICAgcmVzb2x2ZShuZXcgd2luZG93LkJsb2IoKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGJhc2U2NCA9IGRhdGFVUkwuc2xpY2Uoc3BsaXRJbmRleCArIDEpO1xuICAgIGNvbnN0IGJ5dGVTdHJpbmcgPSB3aW5kb3cuYXRvYihiYXNlNjQpO1xuICAgIGNvbnN0IG1pbWVNYXRjaCA9IC9kYXRhOihbXjsrXSk7Ly5leGVjKGRhdGFVUkwpO1xuICAgIGNvbnN0IG1pbWUgPSAobWltZU1hdGNoID8gbWltZU1hdGNoWzFdIDogJycpIHx8IHVuZGVmaW5lZDtcbiAgICBjb25zdCBhYiA9IG5ldyBBcnJheUJ1ZmZlcihieXRlU3RyaW5nLmxlbmd0aCk7XG4gICAgY29uc3QgaWEgPSBuZXcgVWludDhBcnJheShhYik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBieXRlU3RyaW5nLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpYVtpXSA9IGJ5dGVTdHJpbmcuY2hhckNvZGVBdChpKTtcbiAgICB9XG4gICAgcmVzb2x2ZShuZXcgd2luZG93LkJsb2IoWyBhYiBdLCB7IHR5cGU6IG1pbWUgfSkpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhdmVEYXRhVVJMIChkYXRhVVJMLCBvcHRzID0ge30pIHtcbiAgcmV0dXJuIGNyZWF0ZUJsb2JGcm9tRGF0YVVSTChkYXRhVVJMKVxuICAgIC50aGVuKGJsb2IgPT4gc2F2ZUJsb2IoYmxvYiwgb3B0cykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2F2ZUJsb2IgKGJsb2IsIG9wdHMgPSB7fSkge1xuICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgb3B0cyA9IGFzc2lnbih7IGV4dGVuc2lvbjogJycsIHByZWZpeDogJycsIHN1ZmZpeDogJycgfSwgb3B0cyk7XG4gICAgY29uc3QgZmlsZW5hbWUgPSByZXNvbHZlRmlsZW5hbWUob3B0cyk7XG5cbiAgICBjb25zdCBjbGllbnQgPSBnZXRDbGllbnRBUEkoKTtcbiAgICBpZiAoY2xpZW50ICYmIHR5cGVvZiBjbGllbnQuc2F2ZUJsb2IgPT09ICdmdW5jdGlvbicgJiYgY2xpZW50Lm91dHB1dCkge1xuICAgICAgLy8gbmF0aXZlIHNhdmluZyB1c2luZyBhIENMSSB0b29sXG4gICAgICByZXR1cm4gY2xpZW50LnNhdmVCbG9iKGJsb2IsIGFzc2lnbih7fSwgb3B0cywgeyBmaWxlbmFtZSB9KSlcbiAgICAgICAgLnRoZW4oZXYgPT4gcmVzb2x2ZShldikpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBmb3JjZSBkb3dubG9hZFxuICAgICAgaWYgKCFsaW5rKSB7XG4gICAgICAgIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgIGxpbmsuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICAgICAgICBsaW5rLnRhcmdldCA9ICdfYmxhbmsnO1xuICAgICAgfVxuICAgICAgbGluay5kb3dubG9hZCA9IGZpbGVuYW1lO1xuICAgICAgbGluay5ocmVmID0gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxpbmspO1xuICAgICAgbGluay5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgICBsaW5rLm9uY2xpY2sgPSBub29wO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB3aW5kb3cuVVJMLnJldm9rZU9iamVjdFVSTChibG9iKTtcbiAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGxpbmspO1xuICAgICAgICAgIGxpbmsucmVtb3ZlQXR0cmlidXRlKCdocmVmJyk7XG4gICAgICAgICAgcmVzb2x2ZSh7IGZpbGVuYW1lLCBjbGllbnQ6IGZhbHNlIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgICBsaW5rLmNsaWNrKCk7XG4gICAgfVxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhdmVGaWxlIChkYXRhLCBvcHRzID0ge30pIHtcbiAgY29uc3QgcGFydHMgPSBBcnJheS5pc0FycmF5KGRhdGEpID8gZGF0YSA6IFsgZGF0YSBdO1xuICBjb25zdCBibG9iID0gbmV3IHdpbmRvdy5CbG9iKHBhcnRzLCB7IHR5cGU6IG9wdHMudHlwZSB8fCAnJyB9KTtcbiAgcmV0dXJuIHNhdmVCbG9iKGJsb2IsIG9wdHMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RmlsZU5hbWUgKCkge1xuICBjb25zdCBkYXRlRm9ybWF0U3RyID0gYHl5eXkubW0uZGQtSEguTU0uc3NgO1xuICByZXR1cm4gZGF0ZWZvcm1hdChuZXcgRGF0ZSgpLCBkYXRlRm9ybWF0U3RyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldERlZmF1bHRGaWxlIChwcmVmaXggPSAnJywgc3VmZml4ID0gJycsIGV4dCkge1xuICAvLyBjb25zdCBkYXRlRm9ybWF0U3RyID0gYHl5eXkubW0uZGQtSEguTU0uc3NgO1xuICBjb25zdCBkYXRlRm9ybWF0U3RyID0gYHl5eXktbW0tZGQgJ2F0JyBoLk1NLnNzIFRUYDtcbiAgcmV0dXJuIGAke3ByZWZpeH0ke2RhdGVmb3JtYXQobmV3IERhdGUoKSwgZGF0ZUZvcm1hdFN0cil9JHtzdWZmaXh9JHtleHR9YDtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUZpbGVuYW1lIChvcHQgPSB7fSkge1xuICBvcHQgPSBhc3NpZ24oe30sIG9wdCk7XG5cbiAgLy8gQ3VzdG9tIGZpbGVuYW1lIGZ1bmN0aW9uXG4gIGlmICh0eXBlb2Ygb3B0LmZpbGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gb3B0LmZpbGUob3B0KTtcbiAgfSBlbHNlIGlmIChvcHQuZmlsZSkge1xuICAgIHJldHVybiBvcHQuZmlsZTtcbiAgfVxuXG4gIGxldCBmcmFtZSA9IG51bGw7XG4gIGxldCBleHRlbnNpb24gPSAnJztcbiAgaWYgKHR5cGVvZiBvcHQuZXh0ZW5zaW9uID09PSAnc3RyaW5nJykgZXh0ZW5zaW9uID0gb3B0LmV4dGVuc2lvbjtcblxuICBpZiAodHlwZW9mIG9wdC5mcmFtZSA9PT0gJ251bWJlcicpIHtcbiAgICBsZXQgdG90YWxGcmFtZXM7XG4gICAgaWYgKHR5cGVvZiBvcHQudG90YWxGcmFtZXMgPT09ICdudW1iZXInKSB7XG4gICAgICB0b3RhbEZyYW1lcyA9IG9wdC50b3RhbEZyYW1lcztcbiAgICB9IGVsc2Uge1xuICAgICAgdG90YWxGcmFtZXMgPSBNYXRoLm1heCgxMDAwLCBvcHQuZnJhbWUpO1xuICAgIH1cbiAgICBmcmFtZSA9IHBhZExlZnQoU3RyaW5nKG9wdC5mcmFtZSksIFN0cmluZyh0b3RhbEZyYW1lcykubGVuZ3RoLCAnMCcpO1xuICB9XG5cbiAgY29uc3QgbGF5ZXJTdHIgPSBpc0Zpbml0ZShvcHQudG90YWxMYXllcnMpICYmIGlzRmluaXRlKG9wdC5sYXllcikgJiYgb3B0LnRvdGFsTGF5ZXJzID4gMSA/IGAke29wdC5sYXllcn1gIDogJyc7XG4gIGlmIChmcmFtZSAhPSBudWxsKSB7XG4gICAgcmV0dXJuIFsgbGF5ZXJTdHIsIGZyYW1lIF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJy0nKSArIGV4dGVuc2lvbjtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBkZWZhdWx0RmlsZU5hbWUgPSBvcHQudGltZVN0YW1wO1xuICAgIHJldHVybiBbIG9wdC5wcmVmaXgsIG9wdC5uYW1lIHx8IGRlZmF1bHRGaWxlTmFtZSwgbGF5ZXJTdHIsIG9wdC5oYXNoLCBvcHQuc3VmZml4IF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJy0nKSArIGV4dGVuc2lvbjtcbiAgfVxufVxuIiwiLy8gSGFuZGxlIHNvbWUgY29tbW9uIHR5cG9zXG5jb25zdCBjb21tb25UeXBvcyA9IHtcbiAgZGltZW5zaW9uOiAnZGltZW5zaW9ucycsXG4gIGFuaW1hdGVkOiAnYW5pbWF0ZScsXG4gIGFuaW1hdGluZzogJ2FuaW1hdGUnLFxuICB1bml0OiAndW5pdHMnLFxuICBQNTogJ3A1JyxcbiAgcGl4ZWxsYXRlZDogJ3BpeGVsYXRlZCcsXG4gIGxvb3Bpbmc6ICdsb29wJyxcbiAgcGl4ZWxQZXJJbmNoOiAncGl4ZWxzJ1xufTtcblxuLy8gSGFuZGxlIGFsbCBvdGhlciB0eXBvc1xuY29uc3QgYWxsS2V5cyA9IFtcbiAgJ2RpbWVuc2lvbnMnLCAndW5pdHMnLCAncGl4ZWxzUGVySW5jaCcsICdvcmllbnRhdGlvbicsXG4gICdzY2FsZVRvRml0JywgJ3NjYWxlVG9WaWV3JywgJ2JsZWVkJywgJ3BpeGVsUmF0aW8nLFxuICAnZXhwb3J0UGl4ZWxSYXRpbycsICdtYXhQaXhlbFJhdGlvJywgJ3NjYWxlQ29udGV4dCcsXG4gICdyZXNpemVDYW52YXMnLCAnc3R5bGVDYW52YXMnLCAnY2FudmFzJywgJ2NvbnRleHQnLCAnYXR0cmlidXRlcycsXG4gICdwYXJlbnQnLCAnZmlsZScsICduYW1lJywgJ3ByZWZpeCcsICdzdWZmaXgnLCAnYW5pbWF0ZScsICdwbGF5aW5nJyxcbiAgJ2xvb3AnLCAnZHVyYXRpb24nLCAndG90YWxGcmFtZXMnLCAnZnBzJywgJ3BsYXliYWNrUmF0ZScsICd0aW1lU2NhbGUnLFxuICAnZnJhbWUnLCAndGltZScsICdmbHVzaCcsICdwaXhlbGF0ZWQnLCAnaG90a2V5cycsICdwNScsICdpZCcsXG4gICdzY2FsZVRvRml0UGFkZGluZycsICdkYXRhJywgJ3BhcmFtcycsICdlbmNvZGluZycsICdlbmNvZGluZ1F1YWxpdHknXG5dO1xuXG4vLyBUaGlzIGlzIGZhaXJseSBvcGluaW9uYXRlZCBhbmQgZm9yY2VzIHVzZXJzIHRvIHVzZSB0aGUgJ2RhdGEnIHBhcmFtZXRlclxuLy8gaWYgdGhleSB3YW50IHRvIHBhc3MgYWxvbmcgbm9uLXNldHRpbmcgb2JqZWN0cy4uLlxuZXhwb3J0IGNvbnN0IGNoZWNrU2V0dGluZ3MgPSAoc2V0dGluZ3MpID0+IHtcbiAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHNldHRpbmdzKTtcbiAga2V5cy5mb3JFYWNoKGtleSA9PiB7XG4gICAgaWYgKGtleSBpbiBjb21tb25UeXBvcykge1xuICAgICAgY29uc3QgYWN0dWFsID0gY29tbW9uVHlwb3Nba2V5XTtcbiAgICAgIGNvbnNvbGUud2FybihgW2NhbnZhcy1za2V0Y2hdIENvdWxkIG5vdCByZWNvZ25pemUgdGhlIHNldHRpbmcgXCIke2tleX1cIiwgZGlkIHlvdSBtZWFuIFwiJHthY3R1YWx9XCI/YCk7XG4gICAgfSBlbHNlIGlmICghYWxsS2V5cy5pbmNsdWRlcyhrZXkpKSB7XG4gICAgICBjb25zb2xlLndhcm4oYFtjYW52YXMtc2tldGNoXSBDb3VsZCBub3QgcmVjb2duaXplIHRoZSBzZXR0aW5nIFwiJHtrZXl9XCJgKTtcbiAgICB9XG4gIH0pO1xufTtcbiIsImltcG9ydCB7IGdldENsaWVudEFQSSB9IGZyb20gJy4uL3V0aWwnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAob3B0ID0ge30pIHtcbiAgY29uc3QgaGFuZGxlciA9IGV2ID0+IHtcbiAgICBpZiAoIW9wdC5lbmFibGVkKCkpIHJldHVybjtcblxuICAgIGNvbnN0IGNsaWVudCA9IGdldENsaWVudEFQSSgpO1xuICAgIGlmIChldi5rZXlDb2RlID09PSA4MyAmJiAhZXYuYWx0S2V5ICYmIChldi5tZXRhS2V5IHx8IGV2LmN0cmxLZXkpKSB7XG4gICAgICAvLyBDbWQgKyBTXG4gICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgb3B0LnNhdmUoZXYpO1xuICAgIH0gZWxzZSBpZiAoZXYua2V5Q29kZSA9PT0gMzIpIHtcbiAgICAgIC8vIFNwYWNlXG4gICAgICAvLyBUT0RPOiB3aGF0IHRvIGRvIHdpdGggdGhpcz8ga2VlcCBpdCwgb3IgcmVtb3ZlIGl0P1xuICAgICAgb3B0LnRvZ2dsZVBsYXkoZXYpO1xuICAgIH0gZWxzZSBpZiAoY2xpZW50ICYmICFldi5hbHRLZXkgJiYgZXYua2V5Q29kZSA9PT0gNzUgJiYgKGV2Lm1ldGFLZXkgfHwgZXYuY3RybEtleSkpIHtcbiAgICAgIC8vIENtZCArIEssIG9ubHkgd2hlbiBjYW52YXMtc2tldGNoLWNsaSBpcyB1c2VkXG4gICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgb3B0LmNvbW1pdChldik7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGF0dGFjaCA9ICgpID0+IHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGhhbmRsZXIpO1xuICB9O1xuXG4gIGNvbnN0IGRldGFjaCA9ICgpID0+IHtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGhhbmRsZXIpO1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgYXR0YWNoLFxuICAgIGRldGFjaFxuICB9O1xufVxuIiwiY29uc3QgZGVmYXVsdFVuaXRzID0gJ21tJztcblxuY29uc3QgZGF0YSA9IFtcbiAgLy8gQ29tbW9uIFBhcGVyIFNpemVzXG4gIC8vIChNb3N0bHkgTm9ydGgtQW1lcmljYW4gYmFzZWQpXG4gIFsgJ3Bvc3RjYXJkJywgMTAxLjYsIDE1Mi40IF0sXG4gIFsgJ3Bvc3Rlci1zbWFsbCcsIDI4MCwgNDMwIF0sXG4gIFsgJ3Bvc3RlcicsIDQ2MCwgNjEwIF0sXG4gIFsgJ3Bvc3Rlci1sYXJnZScsIDYxMCwgOTEwIF0sXG4gIFsgJ2J1c2luZXNzLWNhcmQnLCA1MC44LCA4OC45IF0sXG5cbiAgLy8gUGhvdG9ncmFwaGljIFByaW50IFBhcGVyIFNpemVzXG4gIFsgJzJyJywgNjQsIDg5IF0sXG4gIFsgJzNyJywgODksIDEyNyBdLFxuICBbICc0cicsIDEwMiwgMTUyIF0sXG4gIFsgJzVyJywgMTI3LCAxNzggXSwgLy8gNeKAs3g34oCzXG4gIFsgJzZyJywgMTUyLCAyMDMgXSwgLy8gNuKAs3g44oCzXG4gIFsgJzhyJywgMjAzLCAyNTQgXSwgLy8gOOKAs3gxMOKAs1xuICBbICcxMHInLCAyNTQsIDMwNSBdLCAvLyAxMOKAs3gxMuKAs1xuICBbICcxMXInLCAyNzksIDM1NiBdLCAvLyAxMeKAs3gxNOKAs1xuICBbICcxMnInLCAzMDUsIDM4MSBdLFxuXG4gIC8vIFN0YW5kYXJkIFBhcGVyIFNpemVzXG4gIFsgJ2EwJywgODQxLCAxMTg5IF0sXG4gIFsgJ2ExJywgNTk0LCA4NDEgXSxcbiAgWyAnYTInLCA0MjAsIDU5NCBdLFxuICBbICdhMycsIDI5NywgNDIwIF0sXG4gIFsgJ2E0JywgMjEwLCAyOTcgXSxcbiAgWyAnYTUnLCAxNDgsIDIxMCBdLFxuICBbICdhNicsIDEwNSwgMTQ4IF0sXG4gIFsgJ2E3JywgNzQsIDEwNSBdLFxuICBbICdhOCcsIDUyLCA3NCBdLFxuICBbICdhOScsIDM3LCA1MiBdLFxuICBbICdhMTAnLCAyNiwgMzcgXSxcbiAgWyAnMmEwJywgMTE4OSwgMTY4MiBdLFxuICBbICc0YTAnLCAxNjgyLCAyMzc4IF0sXG4gIFsgJ2IwJywgMTAwMCwgMTQxNCBdLFxuICBbICdiMScsIDcwNywgMTAwMCBdLFxuICBbICdiMSsnLCA3MjAsIDEwMjAgXSxcbiAgWyAnYjInLCA1MDAsIDcwNyBdLFxuICBbICdiMisnLCA1MjAsIDcyMCBdLFxuICBbICdiMycsIDM1MywgNTAwIF0sXG4gIFsgJ2I0JywgMjUwLCAzNTMgXSxcbiAgWyAnYjUnLCAxNzYsIDI1MCBdLFxuICBbICdiNicsIDEyNSwgMTc2IF0sXG4gIFsgJ2I3JywgODgsIDEyNSBdLFxuICBbICdiOCcsIDYyLCA4OCBdLFxuICBbICdiOScsIDQ0LCA2MiBdLFxuICBbICdiMTAnLCAzMSwgNDQgXSxcbiAgWyAnYjExJywgMjIsIDMyIF0sXG4gIFsgJ2IxMicsIDE2LCAyMiBdLFxuICBbICdjMCcsIDkxNywgMTI5NyBdLFxuICBbICdjMScsIDY0OCwgOTE3IF0sXG4gIFsgJ2MyJywgNDU4LCA2NDggXSxcbiAgWyAnYzMnLCAzMjQsIDQ1OCBdLFxuICBbICdjNCcsIDIyOSwgMzI0IF0sXG4gIFsgJ2M1JywgMTYyLCAyMjkgXSxcbiAgWyAnYzYnLCAxMTQsIDE2MiBdLFxuICBbICdjNycsIDgxLCAxMTQgXSxcbiAgWyAnYzgnLCA1NywgODEgXSxcbiAgWyAnYzknLCA0MCwgNTcgXSxcbiAgWyAnYzEwJywgMjgsIDQwIF0sXG4gIFsgJ2MxMScsIDIyLCAzMiBdLFxuICBbICdjMTInLCAxNiwgMjIgXSxcblxuICAvLyBVc2UgaW5jaGVzIGZvciBOb3J0aCBBbWVyaWNhbiBzaXplcyxcbiAgLy8gYXMgaXQgcHJvZHVjZXMgbGVzcyBmbG9hdCBwcmVjaXNpb24gZXJyb3JzXG4gIFsgJ2hhbGYtbGV0dGVyJywgNS41LCA4LjUsICdpbicgXSxcbiAgWyAnbGV0dGVyJywgOC41LCAxMSwgJ2luJyBdLFxuICBbICdsZWdhbCcsIDguNSwgMTQsICdpbicgXSxcbiAgWyAnanVuaW9yLWxlZ2FsJywgNSwgOCwgJ2luJyBdLFxuICBbICdsZWRnZXInLCAxMSwgMTcsICdpbicgXSxcbiAgWyAndGFibG9pZCcsIDExLCAxNywgJ2luJyBdLFxuICBbICdhbnNpLWEnLCA4LjUsIDExLjAsICdpbicgXSxcbiAgWyAnYW5zaS1iJywgMTEuMCwgMTcuMCwgJ2luJyBdLFxuICBbICdhbnNpLWMnLCAxNy4wLCAyMi4wLCAnaW4nIF0sXG4gIFsgJ2Fuc2ktZCcsIDIyLjAsIDM0LjAsICdpbicgXSxcbiAgWyAnYW5zaS1lJywgMzQuMCwgNDQuMCwgJ2luJyBdLFxuICBbICdhcmNoLWEnLCA5LCAxMiwgJ2luJyBdLFxuICBbICdhcmNoLWInLCAxMiwgMTgsICdpbicgXSxcbiAgWyAnYXJjaC1jJywgMTgsIDI0LCAnaW4nIF0sXG4gIFsgJ2FyY2gtZCcsIDI0LCAzNiwgJ2luJyBdLFxuICBbICdhcmNoLWUnLCAzNiwgNDgsICdpbicgXSxcbiAgWyAnYXJjaC1lMScsIDMwLCA0MiwgJ2luJyBdLFxuICBbICdhcmNoLWUyJywgMjYsIDM4LCAnaW4nIF0sXG4gIFsgJ2FyY2gtZTMnLCAyNywgMzksICdpbicgXVxuXTtcblxuZXhwb3J0IGRlZmF1bHQgZGF0YS5yZWR1Y2UoKGRpY3QsIHByZXNldCkgPT4ge1xuICBjb25zdCBpdGVtID0ge1xuICAgIHVuaXRzOiBwcmVzZXRbM10gfHwgZGVmYXVsdFVuaXRzLFxuICAgIGRpbWVuc2lvbnM6IFsgcHJlc2V0WzFdLCBwcmVzZXRbMl0gXVxuICB9O1xuICBkaWN0W3ByZXNldFswXV0gPSBpdGVtO1xuICBkaWN0W3ByZXNldFswXS5yZXBsYWNlKC8tL2csICcgJyldID0gaXRlbTtcbiAgcmV0dXJuIGRpY3Q7XG59LCB7fSk7XG4iLCJpbXBvcnQgcGFwZXJTaXplcyBmcm9tICcuL3BhcGVyLXNpemVzJztcbmltcG9ydCBjb252ZXJ0TGVuZ3RoIGZyb20gJ2NvbnZlcnQtbGVuZ3RoJztcblxuZXhwb3J0IGZ1bmN0aW9uIGdldERpbWVuc2lvbnNGcm9tUHJlc2V0IChkaW1lbnNpb25zLCB1bml0c1RvID0gJ3B4JywgcGl4ZWxzUGVySW5jaCA9IDcyKSB7XG4gIGlmICh0eXBlb2YgZGltZW5zaW9ucyA9PT0gJ3N0cmluZycpIHtcbiAgICBjb25zdCBrZXkgPSBkaW1lbnNpb25zLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKCEoa2V5IGluIHBhcGVyU2l6ZXMpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSBkaW1lbnNpb24gcHJlc2V0IFwiJHtkaW1lbnNpb25zfVwiIGlzIG5vdCBzdXBwb3J0ZWQgb3IgY291bGQgbm90IGJlIGZvdW5kOyB0cnkgdXNpbmcgYTQsIGEzLCBwb3N0Y2FyZCwgbGV0dGVyLCBldGMuYClcbiAgICB9XG4gICAgY29uc3QgcHJlc2V0ID0gcGFwZXJTaXplc1trZXldO1xuICAgIHJldHVybiBwcmVzZXQuZGltZW5zaW9ucy5tYXAoZCA9PiB7XG4gICAgICByZXR1cm4gY29udmVydERpc3RhbmNlKGQsIHByZXNldC51bml0cywgdW5pdHNUbywgcGl4ZWxzUGVySW5jaCk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGRpbWVuc2lvbnM7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnREaXN0YW5jZSAoZGltZW5zaW9uLCB1bml0c0Zyb20gPSAncHgnLCB1bml0c1RvID0gJ3B4JywgcGl4ZWxzUGVySW5jaCA9IDcyKSB7XG4gIHJldHVybiBjb252ZXJ0TGVuZ3RoKGRpbWVuc2lvbiwgdW5pdHNGcm9tLCB1bml0c1RvLCB7XG4gICAgcGl4ZWxzUGVySW5jaCxcbiAgICBwcmVjaXNpb246IDQsXG4gICAgcm91bmRQaXhlbDogdHJ1ZVxuICB9KTtcbn1cbiIsImltcG9ydCBkZWZpbmVkIGZyb20gJ2RlZmluZWQnO1xuaW1wb3J0IHsgZ2V0RGltZW5zaW9uc0Zyb21QcmVzZXQsIGNvbnZlcnREaXN0YW5jZSB9IGZyb20gJy4uL2Rpc3RhbmNlcyc7XG5pbXBvcnQgeyBpc0Jyb3dzZXIgfSBmcm9tICcuLi91dGlsJztcblxuZnVuY3Rpb24gY2hlY2tJZkhhc0RpbWVuc2lvbnMgKHNldHRpbmdzKSB7XG4gIGlmICghc2V0dGluZ3MuZGltZW5zaW9ucykgcmV0dXJuIGZhbHNlO1xuICBpZiAodHlwZW9mIHNldHRpbmdzLmRpbWVuc2lvbnMgPT09ICdzdHJpbmcnKSByZXR1cm4gdHJ1ZTtcbiAgaWYgKEFycmF5LmlzQXJyYXkoc2V0dGluZ3MuZGltZW5zaW9ucykgJiYgc2V0dGluZ3MuZGltZW5zaW9ucy5sZW5ndGggPj0gMikgcmV0dXJuIHRydWU7XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gZ2V0UGFyZW50U2l6ZSAocHJvcHMsIHNldHRpbmdzKSB7XG4gIC8vIFdoZW4gbm8geyBkaW1lbnNpb24gfSBpcyBwYXNzZWQgaW4gbm9kZSwgd2UgZGVmYXVsdCB0byBIVE1MIGNhbnZhcyBzaXplXG4gIGlmICghaXNCcm93c2VyKCkpIHtcbiAgICByZXR1cm4gWyAzMDAsIDE1MCBdO1xuICB9XG5cbiAgbGV0IGVsZW1lbnQgPSBzZXR0aW5ncy5wYXJlbnQgfHwgd2luZG93O1xuXG4gIGlmIChlbGVtZW50ID09PSB3aW5kb3cgfHxcbiAgICAgIGVsZW1lbnQgPT09IGRvY3VtZW50IHx8XG4gICAgICBlbGVtZW50ID09PSBkb2N1bWVudC5ib2R5KSB7XG4gICAgcmV0dXJuIFsgd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCBdO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IHsgd2lkdGgsIGhlaWdodCB9ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICByZXR1cm4gWyB3aWR0aCwgaGVpZ2h0IF07XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVzaXplQ2FudmFzIChwcm9wcywgc2V0dGluZ3MpIHtcbiAgbGV0IHdpZHRoLCBoZWlnaHQ7XG4gIGxldCBzdHlsZVdpZHRoLCBzdHlsZUhlaWdodDtcbiAgbGV0IGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQ7XG5cbiAgY29uc3QgYnJvd3NlciA9IGlzQnJvd3NlcigpO1xuICBjb25zdCBkaW1lbnNpb25zID0gc2V0dGluZ3MuZGltZW5zaW9ucztcbiAgY29uc3QgaGFzRGltZW5zaW9ucyA9IGNoZWNrSWZIYXNEaW1lbnNpb25zKHNldHRpbmdzKTtcbiAgY29uc3QgZXhwb3J0aW5nID0gcHJvcHMuZXhwb3J0aW5nO1xuICBsZXQgc2NhbGVUb0ZpdCA9IGhhc0RpbWVuc2lvbnMgPyBzZXR0aW5ncy5zY2FsZVRvRml0ICE9PSBmYWxzZSA6IGZhbHNlO1xuICBsZXQgc2NhbGVUb1ZpZXcgPSAoIWV4cG9ydGluZyAmJiBoYXNEaW1lbnNpb25zKSA/IHNldHRpbmdzLnNjYWxlVG9WaWV3IDogdHJ1ZTtcbiAgLy8gaW4gbm9kZSwgY2FuY2VsIGJvdGggb2YgdGhlc2Ugb3B0aW9uc1xuICBpZiAoIWJyb3dzZXIpIHNjYWxlVG9GaXQgPSBzY2FsZVRvVmlldyA9IGZhbHNlO1xuICBjb25zdCB1bml0cyA9IHNldHRpbmdzLnVuaXRzO1xuICBjb25zdCBwaXhlbHNQZXJJbmNoID0gKHR5cGVvZiBzZXR0aW5ncy5waXhlbHNQZXJJbmNoID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZShzZXR0aW5ncy5waXhlbHNQZXJJbmNoKSkgPyBzZXR0aW5ncy5waXhlbHNQZXJJbmNoIDogNzI7XG4gIGNvbnN0IGJsZWVkID0gZGVmaW5lZChzZXR0aW5ncy5ibGVlZCwgMCk7XG5cbiAgY29uc3QgZGV2aWNlUGl4ZWxSYXRpbyA9IGJyb3dzZXIgPyB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA6IDE7XG4gIGNvbnN0IGJhc2VQaXhlbFJhdGlvID0gc2NhbGVUb1ZpZXcgPyBkZXZpY2VQaXhlbFJhdGlvIDogMTtcblxuICBsZXQgcGl4ZWxSYXRpbywgZXhwb3J0UGl4ZWxSYXRpbztcblxuICAvLyBJZiBhIHBpeGVsIHJhdGlvIGlzIHNwZWNpZmllZCwgd2Ugd2lsbCB1c2UgaXQuXG4gIC8vIE90aGVyd2lzZTpcbiAgLy8gIC0+IElmIGRpbWVuc2lvbiBpcyBzcGVjaWZpZWQsIHVzZSBiYXNlIHJhdGlvIChpLmUuIHNpemUgZm9yIGV4cG9ydClcbiAgLy8gIC0+IElmIG5vIGRpbWVuc2lvbiBpcyBzcGVjaWZpZWQsIHVzZSBkZXZpY2UgcmF0aW8gKGkuZS4gc2l6ZSBmb3Igc2NyZWVuKVxuICBpZiAodHlwZW9mIHNldHRpbmdzLnBpeGVsUmF0aW8gPT09ICdudW1iZXInICYmIGlzRmluaXRlKHNldHRpbmdzLnBpeGVsUmF0aW8pKSB7XG4gICAgLy8gV2hlbiB7IHBpeGVsUmF0aW8gfSBpcyBzcGVjaWZpZWQsIGl0J3MgYWxzbyB1c2VkIGFzIGRlZmF1bHQgZXhwb3J0UGl4ZWxSYXRpby5cbiAgICBwaXhlbFJhdGlvID0gc2V0dGluZ3MucGl4ZWxSYXRpbztcbiAgICBleHBvcnRQaXhlbFJhdGlvID0gZGVmaW5lZChzZXR0aW5ncy5leHBvcnRQaXhlbFJhdGlvLCBwaXhlbFJhdGlvKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoaGFzRGltZW5zaW9ucykge1xuICAgICAgLy8gV2hlbiBhIGRpbWVuc2lvbiBpcyBzcGVjaWZpZWQsIHVzZSB0aGUgYmFzZSByYXRpbyByYXRoZXIgdGhhbiBzY3JlZW4gcmF0aW9cbiAgICAgIHBpeGVsUmF0aW8gPSBiYXNlUGl4ZWxSYXRpbztcbiAgICAgIC8vIERlZmF1bHQgdG8gYSBwaXhlbCByYXRpbyBvZiAxIHNvIHRoYXQgeW91IGVuZCB1cCB3aXRoIHRoZSBzYW1lIGRpbWVuc2lvblxuICAgICAgLy8geW91IHNwZWNpZmllZCwgaS5lLiBbIDUwMCwgNTAwIF0gaXMgZXhwb3J0ZWQgYXMgNTAweDUwMCBweFxuICAgICAgZXhwb3J0UGl4ZWxSYXRpbyA9IGRlZmluZWQoc2V0dGluZ3MuZXhwb3J0UGl4ZWxSYXRpbywgMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE5vIGRpbWVuc2lvbiBpcyBzcGVjaWZpZWQsIGFzc3VtZSBmdWxsLXNjcmVlbiBzaXppbmdcbiAgICAgIHBpeGVsUmF0aW8gPSBkZXZpY2VQaXhlbFJhdGlvO1xuICAgICAgLy8gRGVmYXVsdCB0byBzY3JlZW4gcGl4ZWwgcmF0aW8sIHNvIHRoYXQgaXQncyBsaWtlIHRha2luZyBhIGRldmljZSBzY3JlZW5zaG90XG4gICAgICBleHBvcnRQaXhlbFJhdGlvID0gZGVmaW5lZChzZXR0aW5ncy5leHBvcnRQaXhlbFJhdGlvLCBwaXhlbFJhdGlvKTtcbiAgICB9XG4gIH1cblxuICAvLyBDbGFtcCBwaXhlbCByYXRpb1xuICBpZiAodHlwZW9mIHNldHRpbmdzLm1heFBpeGVsUmF0aW8gPT09ICdudW1iZXInICYmIGlzRmluaXRlKHNldHRpbmdzLm1heFBpeGVsUmF0aW8pKSB7XG4gICAgcGl4ZWxSYXRpbyA9IE1hdGgubWluKHNldHRpbmdzLm1heFBpeGVsUmF0aW8sIHBpeGVsUmF0aW8pO1xuICAgIGV4cG9ydFBpeGVsUmF0aW8gPSBNYXRoLm1pbihzZXR0aW5ncy5tYXhQaXhlbFJhdGlvLCBleHBvcnRQaXhlbFJhdGlvKTtcbiAgfVxuXG4gIC8vIEhhbmRsZSBleHBvcnQgcGl4ZWwgcmF0aW9cbiAgaWYgKGV4cG9ydGluZykge1xuICAgIHBpeGVsUmF0aW8gPSBleHBvcnRQaXhlbFJhdGlvO1xuICB9XG5cbiAgLy8gcGFyZW50V2lkdGggPSB0eXBlb2YgcGFyZW50V2lkdGggPT09ICd1bmRlZmluZWQnID8gZGVmYXVsdE5vZGVTaXplWzBdIDogcGFyZW50V2lkdGg7XG4gIC8vIHBhcmVudEhlaWdodCA9IHR5cGVvZiBwYXJlbnRIZWlnaHQgPT09ICd1bmRlZmluZWQnID8gZGVmYXVsdE5vZGVTaXplWzFdIDogcGFyZW50SGVpZ2h0O1xuXG4gIGxldCBbIHBhcmVudFdpZHRoLCBwYXJlbnRIZWlnaHQgXSA9IGdldFBhcmVudFNpemUocHJvcHMsIHNldHRpbmdzKTtcbiAgbGV0IHRyaW1XaWR0aCwgdHJpbUhlaWdodDtcblxuICAvLyBZb3UgY2FuIHNwZWNpZnkgYSBkaW1lbnNpb25zIGluIHBpeGVscyBvciBjbS9tL2luL2V0Y1xuICBpZiAoaGFzRGltZW5zaW9ucykge1xuICAgIGNvbnN0IHJlc3VsdCA9IGdldERpbWVuc2lvbnNGcm9tUHJlc2V0KGRpbWVuc2lvbnMsIHVuaXRzLCBwaXhlbHNQZXJJbmNoKTtcbiAgICBjb25zdCBoaWdoZXN0ID0gTWF0aC5tYXgocmVzdWx0WzBdLCByZXN1bHRbMV0pO1xuICAgIGNvbnN0IGxvd2VzdCA9IE1hdGgubWluKHJlc3VsdFswXSwgcmVzdWx0WzFdKTtcbiAgICBpZiAoc2V0dGluZ3Mub3JpZW50YXRpb24pIHtcbiAgICAgIGNvbnN0IGxhbmRzY2FwZSA9IHNldHRpbmdzLm9yaWVudGF0aW9uID09PSAnbGFuZHNjYXBlJztcbiAgICAgIHdpZHRoID0gbGFuZHNjYXBlID8gaGlnaGVzdCA6IGxvd2VzdDtcbiAgICAgIGhlaWdodCA9IGxhbmRzY2FwZSA/IGxvd2VzdCA6IGhpZ2hlc3Q7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdpZHRoID0gcmVzdWx0WzBdO1xuICAgICAgaGVpZ2h0ID0gcmVzdWx0WzFdO1xuICAgIH1cblxuICAgIHRyaW1XaWR0aCA9IHdpZHRoO1xuICAgIHRyaW1IZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICAvLyBBcHBseSBibGVlZCB3aGljaCBpcyBhc3N1bWVkIHRvIGJlIGluIHRoZSBzYW1lIHVuaXRzXG4gICAgd2lkdGggKz0gYmxlZWQgKiAyO1xuICAgIGhlaWdodCArPSBibGVlZCAqIDI7XG4gIH0gZWxzZSB7XG4gICAgd2lkdGggPSBwYXJlbnRXaWR0aDtcbiAgICBoZWlnaHQgPSBwYXJlbnRIZWlnaHQ7XG4gICAgdHJpbVdpZHRoID0gd2lkdGg7XG4gICAgdHJpbUhlaWdodCA9IGhlaWdodDtcbiAgfVxuXG4gIC8vIFJlYWwgc2l6ZSBpbiBwaXhlbHMgYWZ0ZXIgUFBJIGlzIHRha2VuIGludG8gYWNjb3VudFxuICBsZXQgcmVhbFdpZHRoID0gd2lkdGg7XG4gIGxldCByZWFsSGVpZ2h0ID0gaGVpZ2h0O1xuICBpZiAoaGFzRGltZW5zaW9ucyAmJiB1bml0cykge1xuICAgIC8vIENvbnZlcnQgdG8gZGlnaXRhbC9waXhlbCB1bml0cyBpZiBuZWNlc3NhcnlcbiAgICByZWFsV2lkdGggPSBjb252ZXJ0RGlzdGFuY2Uod2lkdGgsIHVuaXRzLCAncHgnLCBwaXhlbHNQZXJJbmNoKTtcbiAgICByZWFsSGVpZ2h0ID0gY29udmVydERpc3RhbmNlKGhlaWdodCwgdW5pdHMsICdweCcsIHBpeGVsc1BlckluY2gpO1xuICB9XG5cbiAgLy8gSG93IGJpZyB0byBzZXQgdGhlICd2aWV3JyBvZiB0aGUgY2FudmFzIGluIHRoZSBicm93c2VyIChpLmUuIHN0eWxlKVxuICBzdHlsZVdpZHRoID0gTWF0aC5yb3VuZChyZWFsV2lkdGgpO1xuICBzdHlsZUhlaWdodCA9IE1hdGgucm91bmQocmVhbEhlaWdodCk7XG5cbiAgLy8gSWYgd2Ugd2lzaCB0byBzY2FsZSB0aGUgdmlldyB0byB0aGUgYnJvd3NlciB3aW5kb3dcbiAgaWYgKHNjYWxlVG9GaXQgJiYgIWV4cG9ydGluZyAmJiBoYXNEaW1lbnNpb25zKSB7XG4gICAgY29uc3QgYXNwZWN0ID0gd2lkdGggLyBoZWlnaHQ7XG4gICAgY29uc3Qgd2luZG93QXNwZWN0ID0gcGFyZW50V2lkdGggLyBwYXJlbnRIZWlnaHQ7XG4gICAgY29uc3Qgc2NhbGVUb0ZpdFBhZGRpbmcgPSBkZWZpbmVkKHNldHRpbmdzLnNjYWxlVG9GaXRQYWRkaW5nLCA0MCk7XG4gICAgY29uc3QgbWF4V2lkdGggPSBNYXRoLnJvdW5kKHBhcmVudFdpZHRoIC0gc2NhbGVUb0ZpdFBhZGRpbmcgKiAyKTtcbiAgICBjb25zdCBtYXhIZWlnaHQgPSBNYXRoLnJvdW5kKHBhcmVudEhlaWdodCAtIHNjYWxlVG9GaXRQYWRkaW5nICogMik7XG4gICAgaWYgKHN0eWxlV2lkdGggPiBtYXhXaWR0aCB8fCBzdHlsZUhlaWdodCA+IG1heEhlaWdodCkge1xuICAgICAgaWYgKHdpbmRvd0FzcGVjdCA+IGFzcGVjdCkge1xuICAgICAgICBzdHlsZUhlaWdodCA9IG1heEhlaWdodDtcbiAgICAgICAgc3R5bGVXaWR0aCA9IE1hdGgucm91bmQoc3R5bGVIZWlnaHQgKiBhc3BlY3QpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3R5bGVXaWR0aCA9IG1heFdpZHRoO1xuICAgICAgICBzdHlsZUhlaWdodCA9IE1hdGgucm91bmQoc3R5bGVXaWR0aCAvIGFzcGVjdCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY2FudmFzV2lkdGggPSBzY2FsZVRvVmlldyA/IE1hdGgucm91bmQocGl4ZWxSYXRpbyAqIHN0eWxlV2lkdGgpIDogTWF0aC5yb3VuZChwaXhlbFJhdGlvICogcmVhbFdpZHRoKTtcbiAgY2FudmFzSGVpZ2h0ID0gc2NhbGVUb1ZpZXcgPyBNYXRoLnJvdW5kKHBpeGVsUmF0aW8gKiBzdHlsZUhlaWdodCkgOiBNYXRoLnJvdW5kKHBpeGVsUmF0aW8gKiByZWFsSGVpZ2h0KTtcblxuICBjb25zdCB2aWV3cG9ydFdpZHRoID0gc2NhbGVUb1ZpZXcgPyBNYXRoLnJvdW5kKHN0eWxlV2lkdGgpIDogTWF0aC5yb3VuZChyZWFsV2lkdGgpO1xuICBjb25zdCB2aWV3cG9ydEhlaWdodCA9IHNjYWxlVG9WaWV3ID8gTWF0aC5yb3VuZChzdHlsZUhlaWdodCkgOiBNYXRoLnJvdW5kKHJlYWxIZWlnaHQpO1xuXG4gIGNvbnN0IHNjYWxlWCA9IGNhbnZhc1dpZHRoIC8gd2lkdGg7XG4gIGNvbnN0IHNjYWxlWSA9IGNhbnZhc0hlaWdodCAvIGhlaWdodDtcblxuICAvLyBBc3NpZ24gdG8gY3VycmVudCBwcm9wc1xuICByZXR1cm4ge1xuICAgIGJsZWVkLFxuICAgIHBpeGVsUmF0aW8sXG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0LFxuICAgIGRpbWVuc2lvbnM6IFsgd2lkdGgsIGhlaWdodCBdLFxuICAgIHVuaXRzOiB1bml0cyB8fCAncHgnLFxuICAgIHNjYWxlWCxcbiAgICBzY2FsZVksXG4gICAgdmlld3BvcnRXaWR0aCxcbiAgICB2aWV3cG9ydEhlaWdodCxcbiAgICBjYW52YXNXaWR0aCxcbiAgICBjYW52YXNIZWlnaHQsXG4gICAgdHJpbVdpZHRoLFxuICAgIHRyaW1IZWlnaHQsXG4gICAgc3R5bGVXaWR0aCxcbiAgICBzdHlsZUhlaWdodFxuICB9O1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBnZXRDYW52YXNDb250ZXh0XG5mdW5jdGlvbiBnZXRDYW52YXNDb250ZXh0ICh0eXBlLCBvcHRzKSB7XG4gIGlmICh0eXBlb2YgdHlwZSAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdtdXN0IHNwZWNpZnkgdHlwZSBzdHJpbmcnKVxuICB9XG5cbiAgb3B0cyA9IG9wdHMgfHwge31cblxuICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJyAmJiAhb3B0cy5jYW52YXMpIHtcbiAgICByZXR1cm4gbnVsbCAvLyBjaGVjayBmb3IgTm9kZVxuICB9XG5cbiAgdmFyIGNhbnZhcyA9IG9wdHMuY2FudmFzIHx8IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gIGlmICh0eXBlb2Ygb3B0cy53aWR0aCA9PT0gJ251bWJlcicpIHtcbiAgICBjYW52YXMud2lkdGggPSBvcHRzLndpZHRoXG4gIH1cbiAgaWYgKHR5cGVvZiBvcHRzLmhlaWdodCA9PT0gJ251bWJlcicpIHtcbiAgICBjYW52YXMuaGVpZ2h0ID0gb3B0cy5oZWlnaHRcbiAgfVxuXG4gIHZhciBhdHRyaWJzID0gb3B0c1xuICB2YXIgZ2xcbiAgdHJ5IHtcbiAgICB2YXIgbmFtZXMgPSBbIHR5cGUgXVxuICAgIC8vIHByZWZpeCBHTCBjb250ZXh0c1xuICAgIGlmICh0eXBlLmluZGV4T2YoJ3dlYmdsJykgPT09IDApIHtcbiAgICAgIG5hbWVzLnB1c2goJ2V4cGVyaW1lbnRhbC0nICsgdHlwZSlcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBnbCA9IGNhbnZhcy5nZXRDb250ZXh0KG5hbWVzW2ldLCBhdHRyaWJzKVxuICAgICAgaWYgKGdsKSByZXR1cm4gZ2xcbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBnbCA9IG51bGxcbiAgfVxuICByZXR1cm4gKGdsIHx8IG51bGwpIC8vIGVuc3VyZSBudWxsIG9uIGZhaWxcbn1cbiIsImltcG9ydCBhc3NpZ24gZnJvbSAnb2JqZWN0LWFzc2lnbic7XG5pbXBvcnQgZ2V0Q2FudmFzQ29udGV4dCBmcm9tICdnZXQtY2FudmFzLWNvbnRleHQnO1xuaW1wb3J0IHsgaXNCcm93c2VyIH0gZnJvbSAnLi4vdXRpbCc7XG5cbmZ1bmN0aW9uIGNyZWF0ZUNhbnZhc0VsZW1lbnQgKCkge1xuICBpZiAoIWlzQnJvd3NlcigpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJdCBhcHBlYXJzIHlvdSBhcmUgcnVuaW5nIGZyb20gTm9kZS5qcyBvciBhIG5vbi1icm93c2VyIGVudmlyb25tZW50LiBUcnkgcGFzc2luZyBpbiBhbiBleGlzdGluZyB7IGNhbnZhcyB9IGludGVyZmFjZSBpbnN0ZWFkLicpO1xuICB9XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlQ2FudmFzIChzZXR0aW5ncyA9IHt9KSB7XG4gIGxldCBjb250ZXh0LCBjYW52YXM7XG4gIGxldCBvd25zQ2FudmFzID0gZmFsc2U7XG4gIGlmIChzZXR0aW5ncy5jYW52YXMgIT09IGZhbHNlKSB7XG4gICAgLy8gRGV0ZXJtaW5lIHRoZSBjYW52YXMgYW5kIGNvbnRleHQgdG8gY3JlYXRlXG4gICAgY29udGV4dCA9IHNldHRpbmdzLmNvbnRleHQ7XG4gICAgaWYgKCFjb250ZXh0IHx8IHR5cGVvZiBjb250ZXh0ID09PSAnc3RyaW5nJykge1xuICAgICAgbGV0IG5ld0NhbnZhcyA9IHNldHRpbmdzLmNhbnZhcztcbiAgICAgIGlmICghbmV3Q2FudmFzKSB7XG4gICAgICAgIG5ld0NhbnZhcyA9IGNyZWF0ZUNhbnZhc0VsZW1lbnQoKTtcbiAgICAgICAgb3duc0NhbnZhcyA9IHRydWU7XG4gICAgICB9XG4gICAgICBjb25zdCB0eXBlID0gY29udGV4dCB8fCAnMmQnO1xuICAgICAgaWYgKHR5cGVvZiBuZXdDYW52YXMuZ2V0Q29udGV4dCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSBzcGVjaWZpZWQgeyBjYW52YXMgfSBlbGVtZW50IGRvZXMgbm90IGhhdmUgYSBnZXRDb250ZXh0KCkgZnVuY3Rpb24sIG1heWJlIGl0IGlzIG5vdCBhIDxjYW52YXM+IHRhZz9gKTtcbiAgICAgIH1cbiAgICAgIGNvbnRleHQgPSBnZXRDYW52YXNDb250ZXh0KHR5cGUsIGFzc2lnbih7fSwgc2V0dGluZ3MuYXR0cmlidXRlcywgeyBjYW52YXM6IG5ld0NhbnZhcyB9KSk7XG4gICAgICBpZiAoIWNvbnRleHQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgYXQgY2FudmFzLmdldENvbnRleHQoJyR7dHlwZX0nKSAtIHRoZSBicm93c2VyIG1heSBub3Qgc3VwcG9ydCB0aGlzIGNvbnRleHQsIG9yIGEgZGlmZmVyZW50IGNvbnRleHQgbWF5IGFscmVhZHkgYmUgaW4gdXNlIHdpdGggdGhpcyBjYW52YXMuYCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY2FudmFzID0gY29udGV4dC5jYW52YXM7XG4gICAgLy8gRW5zdXJlIGNvbnRleHQgbWF0Y2hlcyB1c2VyJ3MgY2FudmFzIGV4cGVjdGF0aW9uc1xuICAgIGlmIChzZXR0aW5ncy5jYW52YXMgJiYgY2FudmFzICE9PSBzZXR0aW5ncy5jYW52YXMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIHsgY2FudmFzIH0gYW5kIHsgY29udGV4dCB9IHNldHRpbmdzIG11c3QgcG9pbnQgdG8gdGhlIHNhbWUgdW5kZXJseWluZyBjYW52YXMgZWxlbWVudCcpO1xuICAgIH1cblxuICAgIC8vIEFwcGx5IHBpeGVsYXRpb24gdG8gY2FudmFzIGlmIG5lY2Vzc2FyeSwgdGhpcyBpcyBtb3N0bHkgYSBjb252ZW5pZW5jZSB1dGlsaXR5XG4gICAgaWYgKHNldHRpbmdzLnBpeGVsYXRlZCkge1xuICAgICAgY29udGV4dC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICAgIGNvbnRleHQubW96SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gICAgICBjb250ZXh0Lm9JbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICAgIGNvbnRleHQud2Via2l0SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gICAgICBjb250ZXh0Lm1zSW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gICAgICBjYW52YXMuc3R5bGVbJ2ltYWdlLXJlbmRlcmluZyddID0gJ3BpeGVsYXRlZCc7XG4gICAgfVxuICB9XG4gIHJldHVybiB7IGNhbnZhcywgY29udGV4dCwgb3duc0NhbnZhcyB9O1xufVxuIiwiaW1wb3J0IGRlZmluZWQgZnJvbSAnZGVmaW5lZCc7XG5pbXBvcnQgYXNzaWduIGZyb20gJ29iamVjdC1hc3NpZ24nO1xuaW1wb3J0IHJpZ2h0Tm93IGZyb20gJ3JpZ2h0LW5vdyc7XG5pbXBvcnQgaXNQcm9taXNlIGZyb20gJ2lzLXByb21pc2UnO1xuaW1wb3J0IHsgaXNCcm93c2VyLCBpc1dlYkdMQ29udGV4dCwgaXNDYW52YXMsIGdldENsaWVudEFQSSB9IGZyb20gJy4uL3V0aWwnO1xuaW1wb3J0IGRlZXBFcXVhbCBmcm9tICdkZWVwLWVxdWFsJztcbmltcG9ydCB7IHNhdmVGaWxlLCBzYXZlRGF0YVVSTCwgZ2V0RmlsZU5hbWUsIGV4cG9ydENhbnZhcyB9IGZyb20gJy4uL3NhdmUnO1xuaW1wb3J0IHsgY2hlY2tTZXR0aW5ncyB9IGZyb20gJy4uL2FjY2Vzc2liaWxpdHknO1xuXG5pbXBvcnQga2V5Ym9hcmRTaG9ydGN1dHMgZnJvbSAnLi9rZXlib2FyZFNob3J0Y3V0cyc7XG5pbXBvcnQgcmVzaXplQ2FudmFzIGZyb20gJy4vcmVzaXplQ2FudmFzJztcbmltcG9ydCBjcmVhdGVDYW52YXMgZnJvbSAnLi9jcmVhdGVDYW52YXMnO1xuXG5jbGFzcyBTa2V0Y2hNYW5hZ2VyIHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHRoaXMuX3NldHRpbmdzID0ge307XG4gICAgdGhpcy5fcHJvcHMgPSB7fTtcbiAgICB0aGlzLl9za2V0Y2ggPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fcmFmID0gbnVsbDtcblxuICAgIC8vIFNvbWUgaGFja3kgdGhpbmdzIHJlcXVpcmVkIHRvIGdldCBhcm91bmQgcDUuanMgc3RydWN0dXJlXG4gICAgdGhpcy5fbGFzdFJlZHJhd1Jlc3VsdCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9pc1A1UmVzaXppbmcgPSBmYWxzZTtcblxuICAgIHRoaXMuX2tleWJvYXJkU2hvcnRjdXRzID0ga2V5Ym9hcmRTaG9ydGN1dHMoe1xuICAgICAgZW5hYmxlZDogKCkgPT4gdGhpcy5zZXR0aW5ncy5ob3RrZXlzICE9PSBmYWxzZSxcbiAgICAgIHNhdmU6IChldikgPT4ge1xuICAgICAgICBpZiAoZXYuc2hpZnRLZXkpIHtcbiAgICAgICAgICBpZiAodGhpcy5wcm9wcy5yZWNvcmRpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuZW5kUmVjb3JkKCk7XG4gICAgICAgICAgICB0aGlzLnJ1bigpO1xuICAgICAgICAgIH0gZWxzZSB0aGlzLnJlY29yZCgpO1xuICAgICAgICB9IGVsc2UgdGhpcy5leHBvcnRGcmFtZSgpO1xuICAgICAgfSxcbiAgICAgIHRvZ2dsZVBsYXk6ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucGxheWluZykgdGhpcy5wYXVzZSgpO1xuICAgICAgICBlbHNlIHRoaXMucGxheSgpO1xuICAgICAgfSxcbiAgICAgIGNvbW1pdDogKGV2KSA9PiB7XG4gICAgICAgIHRoaXMuZXhwb3J0RnJhbWUoeyBjb21taXQ6IHRydWUgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLl9hbmltYXRlSGFuZGxlciA9ICgpID0+IHRoaXMuYW5pbWF0ZSgpO1xuXG4gICAgdGhpcy5fcmVzaXplSGFuZGxlciA9ICgpID0+IHtcbiAgICAgIGNvbnN0IGNoYW5nZWQgPSB0aGlzLnJlc2l6ZSgpO1xuICAgICAgLy8gT25seSByZS1yZW5kZXIgd2hlbiBzaXplIGFjdHVhbGx5IGNoYW5nZXNcbiAgICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGdldCBza2V0Y2ggKCkge1xuICAgIHJldHVybiB0aGlzLl9za2V0Y2g7XG4gIH1cblxuICBnZXQgc2V0dGluZ3MgKCkge1xuICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncztcbiAgfVxuXG4gIGdldCBwcm9wcyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3BzO1xuICB9XG5cbiAgX2NvbXB1dGVQbGF5aGVhZCAoY3VycmVudFRpbWUsIGR1cmF0aW9uKSB7XG4gICAgY29uc3QgaGFzRHVyYXRpb24gPSB0eXBlb2YgZHVyYXRpb24gPT09ICdudW1iZXInICYmIGlzRmluaXRlKGR1cmF0aW9uKTtcbiAgICByZXR1cm4gaGFzRHVyYXRpb24gPyBjdXJyZW50VGltZSAvIGR1cmF0aW9uIDogMDtcbiAgfVxuXG4gIF9jb21wdXRlRnJhbWUgKHBsYXloZWFkLCB0aW1lLCB0b3RhbEZyYW1lcywgZnBzKSB7XG4gICAgcmV0dXJuIChpc0Zpbml0ZSh0b3RhbEZyYW1lcykgJiYgdG90YWxGcmFtZXMgPiAxKVxuICAgICAgPyBNYXRoLmZsb29yKHBsYXloZWFkICogKHRvdGFsRnJhbWVzIC0gMSkpXG4gICAgICA6IE1hdGguZmxvb3IoZnBzICogdGltZSk7XG4gIH1cblxuICBfY29tcHV0ZUN1cnJlbnRGcmFtZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbXB1dGVGcmFtZShcbiAgICAgIHRoaXMucHJvcHMucGxheWhlYWQsIHRoaXMucHJvcHMudGltZSxcbiAgICAgIHRoaXMucHJvcHMudG90YWxGcmFtZXMsIHRoaXMucHJvcHMuZnBzXG4gICAgKTtcbiAgfVxuXG4gIF9nZXRTaXplUHJvcHMgKCkge1xuICAgIGNvbnN0IHByb3BzID0gdGhpcy5wcm9wcztcbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGg6IHByb3BzLndpZHRoLFxuICAgICAgaGVpZ2h0OiBwcm9wcy5oZWlnaHQsXG4gICAgICBwaXhlbFJhdGlvOiBwcm9wcy5waXhlbFJhdGlvLFxuICAgICAgY2FudmFzV2lkdGg6IHByb3BzLmNhbnZhc1dpZHRoLFxuICAgICAgY2FudmFzSGVpZ2h0OiBwcm9wcy5jYW52YXNIZWlnaHQsXG4gICAgICB2aWV3cG9ydFdpZHRoOiBwcm9wcy52aWV3cG9ydFdpZHRoLFxuICAgICAgdmlld3BvcnRIZWlnaHQ6IHByb3BzLnZpZXdwb3J0SGVpZ2h0XG4gICAgfTtcbiAgfVxuXG4gIHJ1biAoKSB7XG4gICAgaWYgKCF0aGlzLnNrZXRjaCkgdGhyb3cgbmV3IEVycm9yKCdzaG91bGQgd2FpdCB1bnRpbCBza2V0Y2ggaXMgbG9hZGVkIGJlZm9yZSB0cnlpbmcgdG8gcGxheSgpJyk7XG5cbiAgICAvLyBTdGFydCBhbiBhbmltYXRpb24gZnJhbWUgbG9vcCBpZiBuZWNlc3NhcnlcbiAgICBpZiAodGhpcy5zZXR0aW5ncy5wbGF5aW5nICE9PSBmYWxzZSkge1xuICAgICAgdGhpcy5wbGF5KCk7XG4gICAgfVxuXG4gICAgLy8gTGV0J3MgbGV0IHRoaXMgd2FybmluZyBoYW5nIGFyb3VuZCBmb3IgYSBmZXcgdmVyc2lvbnMuLi5cbiAgICBpZiAodHlwZW9mIHRoaXMuc2tldGNoLmRpc3Bvc2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnNvbGUud2FybignSW4gY2FudmFzLXNrZXRjaEAwLjAuMjMgdGhlIGRpc3Bvc2UoKSBldmVudCBoYXMgYmVlbiByZW5hbWVkIHRvIHVubG9hZCgpJyk7XG4gICAgfVxuXG4gICAgLy8gSW4gY2FzZSB3ZSBhcmVuJ3QgcGxheWluZyBvciBhbmltYXRlZCwgbWFrZSBzdXJlIHdlIHN0aWxsIHRyaWdnZXIgYmVnaW4gbWVzc2FnZS4uLlxuICAgIGlmICghdGhpcy5wcm9wcy5zdGFydGVkKSB7XG4gICAgICB0aGlzLl9zaWduYWxCZWdpbigpO1xuICAgICAgdGhpcy5wcm9wcy5zdGFydGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBSZW5kZXIgYW4gaW5pdGlhbCBmcmFtZVxuICAgIHRoaXMudGljaygpO1xuICAgIHRoaXMucmVuZGVyKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwbGF5ICgpIHtcbiAgICBsZXQgYW5pbWF0ZSA9IHRoaXMuc2V0dGluZ3MuYW5pbWF0ZTtcbiAgICBpZiAoJ2FuaW1hdGlvbicgaW4gdGhpcy5zZXR0aW5ncykge1xuICAgICAgYW5pbWF0ZSA9IHRydWU7XG4gICAgICBjb25zb2xlLndhcm4oJ1tjYW52YXMtc2tldGNoXSB7IGFuaW1hdGlvbiB9IGhhcyBiZWVuIHJlbmFtZWQgdG8geyBhbmltYXRlIH0nKTtcbiAgICB9XG4gICAgaWYgKCFhbmltYXRlKSByZXR1cm47XG4gICAgaWYgKCFpc0Jyb3dzZXIoKSkge1xuICAgICAgY29uc29sZS5lcnJvcignW2NhbnZhcy1za2V0Y2hdIFdBUk46IFVzaW5nIHsgYW5pbWF0ZSB9IGluIE5vZGUuanMgaXMgbm90IHlldCBzdXBwb3J0ZWQnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMucHJvcHMucGxheWluZykgcmV0dXJuO1xuICAgIGlmICghdGhpcy5wcm9wcy5zdGFydGVkKSB7XG4gICAgICB0aGlzLl9zaWduYWxCZWdpbigpO1xuICAgICAgdGhpcy5wcm9wcy5zdGFydGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBjb25zb2xlLmxvZygncGxheScsIHRoaXMucHJvcHMudGltZSlcblxuICAgIC8vIFN0YXJ0IGEgcmVuZGVyIGxvb3BcbiAgICB0aGlzLnByb3BzLnBsYXlpbmcgPSB0cnVlO1xuICAgIGlmICh0aGlzLl9yYWYgIT0gbnVsbCkgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX3JhZik7XG4gICAgdGhpcy5fbGFzdFRpbWUgPSByaWdodE5vdygpO1xuICAgIHRoaXMuX3JhZiA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fYW5pbWF0ZUhhbmRsZXIpO1xuICB9XG5cbiAgcGF1c2UgKCkge1xuICAgIGlmICh0aGlzLnByb3BzLnJlY29yZGluZykgdGhpcy5lbmRSZWNvcmQoKTtcbiAgICB0aGlzLnByb3BzLnBsYXlpbmcgPSBmYWxzZTtcblxuICAgIGlmICh0aGlzLl9yYWYgIT0gbnVsbCAmJiBpc0Jyb3dzZXIoKSkge1xuICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX3JhZik7XG4gICAgfVxuICB9XG5cbiAgdG9nZ2xlUGxheSAoKSB7XG4gICAgaWYgKHRoaXMucHJvcHMucGxheWluZykgdGhpcy5wYXVzZSgpO1xuICAgIGVsc2UgdGhpcy5wbGF5KCk7XG4gIH1cblxuICAvLyBTdG9wIGFuZCByZXNldCB0byBmcmFtZSB6ZXJvXG4gIHN0b3AgKCkge1xuICAgIHRoaXMucGF1c2UoKTtcbiAgICB0aGlzLnByb3BzLmZyYW1lID0gMDtcbiAgICB0aGlzLnByb3BzLnBsYXloZWFkID0gMDtcbiAgICB0aGlzLnByb3BzLnRpbWUgPSAwO1xuICAgIHRoaXMucHJvcHMuZGVsdGFUaW1lID0gMDtcbiAgICB0aGlzLnByb3BzLnN0YXJ0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgcmVjb3JkICgpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5yZWNvcmRpbmcpIHJldHVybjtcbiAgICBpZiAoIWlzQnJvd3NlcigpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbY2FudmFzLXNrZXRjaF0gV0FSTjogUmVjb3JkaW5nIGZyb20gTm9kZS5qcyBpcyBub3QgeWV0IHN1cHBvcnRlZCcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuc3RvcCgpO1xuICAgIHRoaXMucHJvcHMucGxheWluZyA9IHRydWU7XG4gICAgdGhpcy5wcm9wcy5yZWNvcmRpbmcgPSB0cnVlO1xuXG4gICAgY29uc3QgZnJhbWVJbnRlcnZhbCA9IDEgLyB0aGlzLnByb3BzLmZwcztcbiAgICAvLyBSZW5kZXIgZWFjaCBmcmFtZSBpbiB0aGUgc2VxdWVuY2VcbiAgICBpZiAodGhpcy5fcmFmICE9IG51bGwpIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9yYWYpO1xuICAgIGNvbnN0IHRpY2sgPSAoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMucHJvcHMucmVjb3JkaW5nKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICB0aGlzLnByb3BzLmRlbHRhVGltZSA9IGZyYW1lSW50ZXJ2YWw7XG4gICAgICB0aGlzLnRpY2soKTtcbiAgICAgIHJldHVybiB0aGlzLmV4cG9ydEZyYW1lKHsgc2VxdWVuY2U6IHRydWUgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGlmICghdGhpcy5wcm9wcy5yZWNvcmRpbmcpIHJldHVybjsgLy8gd2FzIGNhbmNlbGxlZCBiZWZvcmVcbiAgICAgICAgICB0aGlzLnByb3BzLmRlbHRhVGltZSA9IDA7XG4gICAgICAgICAgdGhpcy5wcm9wcy5mcmFtZSsrO1xuICAgICAgICAgIGlmICh0aGlzLnByb3BzLmZyYW1lIDwgdGhpcy5wcm9wcy50b3RhbEZyYW1lcykge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy50aW1lICs9IGZyYW1lSW50ZXJ2YWw7XG4gICAgICAgICAgICB0aGlzLnByb3BzLnBsYXloZWFkID0gdGhpcy5fY29tcHV0ZVBsYXloZWFkKHRoaXMucHJvcHMudGltZSwgdGhpcy5wcm9wcy5kdXJhdGlvbik7XG4gICAgICAgICAgICB0aGlzLl9yYWYgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRpY2spO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRmluaXNoZWQgcmVjb3JkaW5nJyk7XG4gICAgICAgICAgICB0aGlzLl9zaWduYWxFbmQoKTtcbiAgICAgICAgICAgIHRoaXMuZW5kUmVjb3JkKCk7XG4gICAgICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICAgICAgICAgIHRoaXMucnVuKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gVHJpZ2dlciBhIHN0YXJ0IGV2ZW50IGJlZm9yZSB3ZSBiZWdpbiByZWNvcmRpbmdcbiAgICBpZiAoIXRoaXMucHJvcHMuc3RhcnRlZCkge1xuICAgICAgdGhpcy5fc2lnbmFsQmVnaW4oKTtcbiAgICAgIHRoaXMucHJvcHMuc3RhcnRlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgdGhpcy5fcmFmID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aWNrKTtcbiAgfVxuXG4gIF9zaWduYWxCZWdpbiAoKSB7XG4gICAgaWYgKHRoaXMuc2tldGNoICYmIHR5cGVvZiB0aGlzLnNrZXRjaC5iZWdpbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5fd3JhcENvbnRleHRTY2FsZShwcm9wcyA9PiB0aGlzLnNrZXRjaC5iZWdpbihwcm9wcykpO1xuICAgIH1cbiAgfVxuXG4gIF9zaWduYWxFbmQgKCkge1xuICAgIGlmICh0aGlzLnNrZXRjaCAmJiB0eXBlb2YgdGhpcy5za2V0Y2guZW5kID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLl93cmFwQ29udGV4dFNjYWxlKHByb3BzID0+IHRoaXMuc2tldGNoLmVuZChwcm9wcykpO1xuICAgIH1cbiAgfVxuXG4gIGVuZFJlY29yZCAoKSB7XG4gICAgaWYgKHRoaXMuX3JhZiAhPSBudWxsICYmIGlzQnJvd3NlcigpKSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fcmFmKTtcbiAgICB0aGlzLnByb3BzLnJlY29yZGluZyA9IGZhbHNlO1xuICAgIHRoaXMucHJvcHMuZGVsdGFUaW1lID0gMDtcbiAgICB0aGlzLnByb3BzLnBsYXlpbmcgPSBmYWxzZTtcbiAgfVxuXG4gIGV4cG9ydEZyYW1lIChvcHQgPSB7fSkge1xuICAgIGlmICghdGhpcy5za2V0Y2gpIHJldHVybiBQcm9taXNlLmFsbChbXSk7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnNrZXRjaC5wcmVFeHBvcnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuc2tldGNoLnByZUV4cG9ydCgpO1xuICAgIH1cblxuICAgIC8vIE9wdGlvbnMgZm9yIGV4cG9ydCBmdW5jdGlvblxuICAgIGxldCBleHBvcnRPcHRzID0gYXNzaWduKHtcbiAgICAgIHNlcXVlbmNlOiBvcHQuc2VxdWVuY2UsXG4gICAgICBmcmFtZTogb3B0LnNlcXVlbmNlID8gdGhpcy5wcm9wcy5mcmFtZSA6IHVuZGVmaW5lZCxcbiAgICAgIGZpbGU6IHRoaXMuc2V0dGluZ3MuZmlsZSxcbiAgICAgIG5hbWU6IHRoaXMuc2V0dGluZ3MubmFtZSxcbiAgICAgIHByZWZpeDogdGhpcy5zZXR0aW5ncy5wcmVmaXgsXG4gICAgICBzdWZmaXg6IHRoaXMuc2V0dGluZ3Muc3VmZml4LFxuICAgICAgZW5jb2Rpbmc6IHRoaXMuc2V0dGluZ3MuZW5jb2RpbmcsXG4gICAgICBlbmNvZGluZ1F1YWxpdHk6IHRoaXMuc2V0dGluZ3MuZW5jb2RpbmdRdWFsaXR5LFxuICAgICAgdGltZVN0YW1wOiBnZXRGaWxlTmFtZSgpLFxuICAgICAgdG90YWxGcmFtZXM6IGlzRmluaXRlKHRoaXMucHJvcHMudG90YWxGcmFtZXMpID8gTWF0aC5tYXgoMTAwLCB0aGlzLnByb3BzLnRvdGFsRnJhbWVzKSA6IDEwMDBcbiAgICB9KTtcblxuICAgIGNvbnN0IGNsaWVudCA9IGdldENsaWVudEFQSSgpO1xuICAgIGxldCBwID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgaWYgKGNsaWVudCAmJiBvcHQuY29tbWl0ICYmIHR5cGVvZiBjbGllbnQuY29tbWl0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zdCBjb21taXRPcHRzID0gYXNzaWduKHt9LCBleHBvcnRPcHRzKTtcbiAgICAgIGNvbnN0IGhhc2ggPSBjbGllbnQuY29tbWl0KGNvbW1pdE9wdHMpO1xuICAgICAgaWYgKGlzUHJvbWlzZShoYXNoKSkgcCA9IGhhc2g7XG4gICAgICBlbHNlIHAgPSBQcm9taXNlLnJlc29sdmUoaGFzaCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHAudGhlbihoYXNoID0+IHtcbiAgICAgIHJldHVybiB0aGlzLl9kb0V4cG9ydEZyYW1lKGFzc2lnbih7fSwgZXhwb3J0T3B0cywgeyBoYXNoOiBoYXNoIHx8ICcnIH0pKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9kb0V4cG9ydEZyYW1lIChleHBvcnRPcHRzID0ge30pIHtcbiAgICB0aGlzLl9wcm9wcy5leHBvcnRpbmcgPSB0cnVlO1xuXG4gICAgLy8gUmVzaXplIHRvIG91dHB1dCByZXNvbHV0aW9uXG4gICAgdGhpcy5yZXNpemUoKTtcblxuICAgIC8vIERyYXcgYXQgdGhpcyBvdXRwdXQgcmVzb2x1dGlvblxuICAgIGxldCBkcmF3UmVzdWx0ID0gdGhpcy5yZW5kZXIoKTtcblxuICAgIC8vIFRoZSBzZWxmIG93bmVkIGNhbnZhcyAobWF5IGJlIHVuZGVmaW5lZC4uLiEpXG4gICAgY29uc3QgY2FudmFzID0gdGhpcy5wcm9wcy5jYW52YXM7XG5cbiAgICAvLyBHZXQgbGlzdCBvZiByZXN1bHRzIGZyb20gcmVuZGVyXG4gICAgaWYgKHR5cGVvZiBkcmF3UmVzdWx0ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgZHJhd1Jlc3VsdCA9IFsgY2FudmFzIF07XG4gICAgfVxuICAgIGRyYXdSZXN1bHQgPSBbXS5jb25jYXQoZHJhd1Jlc3VsdCkuZmlsdGVyKEJvb2xlYW4pO1xuXG4gICAgLy8gVHJhbnNmb3JtIHRoZSBjYW52YXMvZmlsZSBkZXNjcmlwdG9ycyBpbnRvIGEgY29uc2lzdGVudCBmb3JtYXQsXG4gICAgLy8gYW5kIHB1bGwgb3V0IGFueSBkYXRhIFVSTHMgZnJvbSBjYW52YXMgZWxlbWVudHNcbiAgICBkcmF3UmVzdWx0ID0gZHJhd1Jlc3VsdC5tYXAocmVzdWx0ID0+IHtcbiAgICAgIGNvbnN0IGhhc0RhdGFPYmplY3QgPSB0eXBlb2YgcmVzdWx0ID09PSAnb2JqZWN0JyAmJiByZXN1bHQgJiYgKCdkYXRhJyBpbiByZXN1bHQgfHwgJ2RhdGFVUkwnIGluIHJlc3VsdCk7XG4gICAgICBjb25zdCBkYXRhID0gaGFzRGF0YU9iamVjdCA/IHJlc3VsdC5kYXRhIDogcmVzdWx0O1xuICAgICAgY29uc3Qgb3B0cyA9IGhhc0RhdGFPYmplY3QgPyBhc3NpZ24oe30sIHJlc3VsdCwgeyBkYXRhIH0pIDogeyBkYXRhIH07XG4gICAgICBpZiAoaXNDYW52YXMoZGF0YSkpIHtcbiAgICAgICAgY29uc3QgZW5jb2RpbmcgPSBvcHRzLmVuY29kaW5nIHx8IGV4cG9ydE9wdHMuZW5jb2Rpbmc7XG4gICAgICAgIGNvbnN0IGVuY29kaW5nUXVhbGl0eSA9IGRlZmluZWQob3B0cy5lbmNvZGluZ1F1YWxpdHksIGV4cG9ydE9wdHMuZW5jb2RpbmdRdWFsaXR5LCAwLjk1KTtcbiAgICAgICAgY29uc3QgeyBkYXRhVVJMLCBleHRlbnNpb24sIHR5cGUgfSA9IGV4cG9ydENhbnZhcyhkYXRhLCB7IGVuY29kaW5nLCBlbmNvZGluZ1F1YWxpdHkgfSk7XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKG9wdHMsIHsgZGF0YVVSTCwgZXh0ZW5zaW9uLCB0eXBlIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG9wdHM7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBOb3cgcmV0dXJuIHRvIHJlZ3VsYXIgcmVuZGVyaW5nIG1vZGVcbiAgICB0aGlzLl9wcm9wcy5leHBvcnRpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnJlc2l6ZSgpO1xuICAgIHRoaXMucmVuZGVyKCk7XG5cbiAgICAvLyBBbmQgbm93IHdlIGNhbiBzYXZlIGVhY2ggcmVzdWx0XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKGRyYXdSZXN1bHQubWFwKChyZXN1bHQsIGksIGxheWVyTGlzdCkgPT4ge1xuICAgICAgLy8gQnkgZGVmYXVsdCwgaWYgcmVuZGVyaW5nIG11bHRpcGxlIGxheWVycyB3ZSB3aWxsIGdpdmUgdGhlbSBpbmRpY2VzXG4gICAgICBjb25zdCBjdXJPcHQgPSBhc3NpZ24oe30sIGV4cG9ydE9wdHMsIHJlc3VsdCwgeyBsYXllcjogaSwgdG90YWxMYXllcnM6IGxheWVyTGlzdC5sZW5ndGggfSk7XG4gICAgICBjb25zdCBkYXRhID0gcmVzdWx0LmRhdGE7XG4gICAgICBpZiAocmVzdWx0LmRhdGFVUkwpIHtcbiAgICAgICAgY29uc3QgZGF0YVVSTCA9IHJlc3VsdC5kYXRhVVJMO1xuICAgICAgICBkZWxldGUgY3VyT3B0LmRhdGFVUkw7IC8vIGF2b2lkIHNlbmRpbmcgZW50aXJlIGJhc2U2NCBkYXRhIGFyb3VuZFxuICAgICAgICByZXR1cm4gc2F2ZURhdGFVUkwoZGF0YVVSTCwgY3VyT3B0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBzYXZlRmlsZShkYXRhLCBjdXJPcHQpO1xuICAgICAgfVxuICAgIH0pKS50aGVuKGV2ID0+IHtcbiAgICAgIGlmIChldi5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGV2ZW50V2l0aE91dHB1dCA9IGV2LmZpbmQoZSA9PiBlLm91dHB1dE5hbWUpO1xuICAgICAgICBjb25zdCBpc0NsaWVudCA9IGV2LnNvbWUoZSA9PiBlLmNsaWVudCk7XG4gICAgICAgIGxldCBpdGVtO1xuICAgICAgICAvLyBtYW55IGZpbGVzLCBqdXN0IGxvZyBob3cgbWFueSB3ZXJlIGV4cG9ydGVkXG4gICAgICAgIGlmIChldi5sZW5ndGggPiAxKSBpdGVtID0gZXYubGVuZ3RoO1xuICAgICAgICAvLyBpbiBDTEksIHdlIGtub3cgZXhhY3QgcGF0aCBkaXJuYW1lXG4gICAgICAgIGVsc2UgaWYgKGV2ZW50V2l0aE91dHB1dCkgaXRlbSA9IGAke2V2ZW50V2l0aE91dHB1dC5vdXRwdXROYW1lfS8ke2V2WzBdLmZpbGVuYW1lfWA7XG4gICAgICAgIC8vIGluIGJyb3dzZXIsIHdlIGNhbiBvbmx5IGtub3cgaXQgd2VudCB0byBcImJyb3dzZXIgZG93bmxvYWQgZm9sZGVyXCJcbiAgICAgICAgZWxzZSBpdGVtID0gYCR7ZXZbMF0uZmlsZW5hbWV9YDtcbiAgICAgICAgbGV0IG9mU2VxID0gJyc7XG4gICAgICAgIGlmIChleHBvcnRPcHRzLnNlcXVlbmNlKSB7XG4gICAgICAgICAgY29uc3QgaGFzVG90YWxGcmFtZXMgPSBpc0Zpbml0ZSh0aGlzLnByb3BzLnRvdGFsRnJhbWVzKTtcbiAgICAgICAgICBvZlNlcSA9IGhhc1RvdGFsRnJhbWVzID8gYCAoZnJhbWUgJHtleHBvcnRPcHRzLmZyYW1lICsgMX0gLyAke3RoaXMucHJvcHMudG90YWxGcmFtZXN9KWAgOiBgIChmcmFtZSAke2V4cG9ydE9wdHMuZnJhbWV9KWA7XG4gICAgICAgIH0gZWxzZSBpZiAoZXYubGVuZ3RoID4gMSkge1xuICAgICAgICAgIG9mU2VxID0gYCBmaWxlc2A7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2xpZW50ID0gaXNDbGllbnQgPyAnY2FudmFzLXNrZXRjaC1jbGknIDogJ2NhbnZhcy1za2V0Y2gnO1xuICAgICAgICBjb25zb2xlLmxvZyhgJWNbJHtjbGllbnR9XSVjIEV4cG9ydGVkICVjJHtpdGVtfSVjJHtvZlNlcX1gLCAnY29sb3I6ICM4ZThlOGU7JywgJ2NvbG9yOiBpbml0aWFsOycsICdmb250LXdlaWdodDogYm9sZDsnLCAnZm9udC13ZWlnaHQ6IGluaXRpYWw7Jyk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHRoaXMuc2tldGNoLnBvc3RFeHBvcnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5za2V0Y2gucG9zdEV4cG9ydCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX3dyYXBDb250ZXh0U2NhbGUgKGNiKSB7XG4gICAgdGhpcy5fcHJlUmVuZGVyKCk7XG4gICAgY2IodGhpcy5wcm9wcyk7XG4gICAgdGhpcy5fcG9zdFJlbmRlcigpO1xuICB9XG5cbiAgX3ByZVJlbmRlciAoKSB7XG4gICAgY29uc3QgcHJvcHMgPSB0aGlzLnByb3BzO1xuXG4gICAgLy8gU2NhbGUgY29udGV4dCBmb3IgdW5pdCBzaXppbmdcbiAgICBpZiAoIXRoaXMucHJvcHMuZ2wgJiYgcHJvcHMuY29udGV4dCAmJiAhcHJvcHMucDUpIHtcbiAgICAgIHByb3BzLmNvbnRleHQuc2F2ZSgpO1xuICAgICAgaWYgKHRoaXMuc2V0dGluZ3Muc2NhbGVDb250ZXh0ICE9PSBmYWxzZSkge1xuICAgICAgICBwcm9wcy5jb250ZXh0LnNjYWxlKHByb3BzLnNjYWxlWCwgcHJvcHMuc2NhbGVZKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHByb3BzLnA1KSB7XG4gICAgICBwcm9wcy5wNS5zY2FsZShwcm9wcy5zY2FsZVggLyBwcm9wcy5waXhlbFJhdGlvLCBwcm9wcy5zY2FsZVkgLyBwcm9wcy5waXhlbFJhdGlvKTtcbiAgICB9XG4gIH1cblxuICBfcG9zdFJlbmRlciAoKSB7XG4gICAgY29uc3QgcHJvcHMgPSB0aGlzLnByb3BzO1xuXG4gICAgaWYgKCF0aGlzLnByb3BzLmdsICYmIHByb3BzLmNvbnRleHQgJiYgIXByb3BzLnA1KSB7XG4gICAgICBwcm9wcy5jb250ZXh0LnJlc3RvcmUoKTtcbiAgICB9XG5cbiAgICAvLyBGbHVzaCBieSBkZWZhdWx0LCB0aGlzIG1heSBiZSByZXZpc2l0ZWQgYXQgYSBsYXRlciBwb2ludC5cbiAgICAvLyBXZSBkbyB0aGlzIHRvIGVuc3VyZSB0b0RhdGFVUkwgY2FuIGJlIGNhbGxlZCBpbW1lZGlhdGVseSBhZnRlci5cbiAgICAvLyBNb3N0IGxpa2VseSBicm93c2VycyBhbHJlYWR5IGhhbmRsZSB0aGlzLCBzbyB3ZSBtYXkgcmV2aXNpdCB0aGlzIGFuZFxuICAgIC8vIHJlbW92ZSBpdCBpZiBpdCBpbXByb3ZlcyBwZXJmb3JtYW5jZSB3aXRob3V0IGFueSB1c2FiaWxpdHkgaXNzdWVzLlxuICAgIGlmIChwcm9wcy5nbCAmJiB0aGlzLnNldHRpbmdzLmZsdXNoICE9PSBmYWxzZSAmJiAhcHJvcHMucDUpIHtcbiAgICAgIHByb3BzLmdsLmZsdXNoKCk7XG4gICAgfVxuICB9XG5cbiAgdGljayAoKSB7XG4gICAgaWYgKHRoaXMuc2tldGNoICYmIHR5cGVvZiB0aGlzLnNrZXRjaC50aWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLl9wcmVSZW5kZXIoKTtcbiAgICAgIHRoaXMuc2tldGNoLnRpY2sodGhpcy5wcm9wcyk7XG4gICAgICB0aGlzLl9wb3N0UmVuZGVyKCk7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyICgpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5wNSkge1xuICAgICAgdGhpcy5fbGFzdFJlZHJhd1Jlc3VsdCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMucHJvcHMucDUucmVkcmF3KCk7XG4gICAgICByZXR1cm4gdGhpcy5fbGFzdFJlZHJhd1Jlc3VsdDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuc3VibWl0RHJhd0NhbGwoKTtcbiAgICB9XG4gIH1cblxuICBzdWJtaXREcmF3Q2FsbCAoKSB7XG4gICAgaWYgKCF0aGlzLnNrZXRjaCkgcmV0dXJuO1xuXG4gICAgY29uc3QgcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgIHRoaXMuX3ByZVJlbmRlcigpO1xuXG4gICAgbGV0IGRyYXdSZXN1bHQ7XG5cbiAgICBpZiAodHlwZW9mIHRoaXMuc2tldGNoID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBkcmF3UmVzdWx0ID0gdGhpcy5za2V0Y2gocHJvcHMpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMuc2tldGNoLnJlbmRlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZHJhd1Jlc3VsdCA9IHRoaXMuc2tldGNoLnJlbmRlcihwcm9wcyk7XG4gICAgfVxuXG4gICAgdGhpcy5fcG9zdFJlbmRlcigpO1xuXG4gICAgcmV0dXJuIGRyYXdSZXN1bHQ7XG4gIH1cblxuICB1cGRhdGUgKG9wdCA9IHt9KSB7XG4gICAgLy8gQ3VycmVudGx5IHVwZGF0ZSgpIGlzIG9ubHkgZm9jdXNlZCBvbiByZXNpemluZyxcbiAgICAvLyBidXQgbGF0ZXIgd2Ugd2lsbCBzdXBwb3J0IG90aGVyIG9wdGlvbnMgbGlrZSBzd2l0Y2hpbmdcbiAgICAvLyBmcmFtZXMgYW5kIHN1Y2guXG4gICAgY29uc3Qgbm90WWV0U3VwcG9ydGVkID0gW1xuICAgICAgJ2FuaW1hdGUnXG4gICAgXTtcblxuICAgIE9iamVjdC5rZXlzKG9wdCkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgaWYgKG5vdFlldFN1cHBvcnRlZC5pbmRleE9mKGtleSkgPj0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNvcnJ5LCB0aGUgeyAke2tleX0gfSBvcHRpb24gaXMgbm90IHlldCBzdXBwb3J0ZWQgd2l0aCB1cGRhdGUoKS5gKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IG9sZENhbnZhcyA9IHRoaXMuX3NldHRpbmdzLmNhbnZhcztcbiAgICBjb25zdCBvbGRDb250ZXh0ID0gdGhpcy5fc2V0dGluZ3MuY29udGV4dDtcblxuICAgIC8vIE1lcmdlIG5ldyBvcHRpb25zIGludG8gc2V0dGluZ3NcbiAgICBmb3IgKGxldCBrZXkgaW4gb3B0KSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IG9wdFtrZXldO1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3VuZGVmaW5lZCcpIHsgLy8gaWdub3JlIHVuZGVmaW5lZFxuICAgICAgICB0aGlzLl9zZXR0aW5nc1trZXldID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTWVyZ2UgaW4gdGltZSBwcm9wc1xuICAgIGNvbnN0IHRpbWVPcHRzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5fc2V0dGluZ3MsIG9wdCk7XG4gICAgaWYgKCd0aW1lJyBpbiBvcHQgJiYgJ2ZyYW1lJyBpbiBvcHQpIHRocm93IG5ldyBFcnJvcignWW91IHNob3VsZCBzcGVjaWZ5IHsgdGltZSB9IG9yIHsgZnJhbWUgfSBidXQgbm90IGJvdGgnKTtcbiAgICBlbHNlIGlmICgndGltZScgaW4gb3B0KSBkZWxldGUgdGltZU9wdHMuZnJhbWU7XG4gICAgZWxzZSBpZiAoJ2ZyYW1lJyBpbiBvcHQpIGRlbGV0ZSB0aW1lT3B0cy50aW1lO1xuICAgIGlmICgnZHVyYXRpb24nIGluIG9wdCAmJiAndG90YWxGcmFtZXMnIGluIG9wdCkgdGhyb3cgbmV3IEVycm9yKCdZb3Ugc2hvdWxkIHNwZWNpZnkgeyBkdXJhdGlvbiB9IG9yIHsgdG90YWxGcmFtZXMgfSBidXQgbm90IGJvdGgnKTtcbiAgICBlbHNlIGlmICgnZHVyYXRpb24nIGluIG9wdCkgZGVsZXRlIHRpbWVPcHRzLnRvdGFsRnJhbWVzO1xuICAgIGVsc2UgaWYgKCd0b3RhbEZyYW1lcycgaW4gb3B0KSBkZWxldGUgdGltZU9wdHMuZHVyYXRpb247XG5cbiAgICAvLyBNZXJnZSBpbiB1c2VyIGRhdGEgd2l0aG91dCBjb3B5aW5nXG4gICAgaWYgKCdkYXRhJyBpbiBvcHQpIHRoaXMuX3Byb3BzLmRhdGEgPSBvcHQuZGF0YTtcblxuICAgIGNvbnN0IHRpbWVQcm9wcyA9IHRoaXMuZ2V0VGltZVByb3BzKHRpbWVPcHRzKTtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMuX3Byb3BzLCB0aW1lUHJvcHMpO1xuXG4gICAgLy8gSWYgZWl0aGVyIGNhbnZhcyBvciBjb250ZXh0IGlzIGNoYW5nZWQsIHdlIHNob3VsZCByZS11cGRhdGVcbiAgICBpZiAob2xkQ2FudmFzICE9PSB0aGlzLl9zZXR0aW5ncy5jYW52YXMgfHwgb2xkQ29udGV4dCAhPT0gdGhpcy5fc2V0dGluZ3MuY29udGV4dCkge1xuICAgICAgY29uc3QgeyBjYW52YXMsIGNvbnRleHQgfSA9IGNyZWF0ZUNhbnZhcyh0aGlzLl9zZXR0aW5ncyk7XG5cbiAgICAgIHRoaXMucHJvcHMuY2FudmFzID0gY2FudmFzO1xuICAgICAgdGhpcy5wcm9wcy5jb250ZXh0ID0gY29udGV4dDtcblxuICAgICAgLy8gRGVsZXRlIG9yIGFkZCBhICdnbCcgcHJvcCBmb3IgY29udmVuaWVuY2VcbiAgICAgIHRoaXMuX3NldHVwR0xLZXkoKTtcblxuICAgICAgLy8gUmUtbW91bnQgdGhlIG5ldyBjYW52YXMgaWYgaXQgaGFzIG5vIHBhcmVudFxuICAgICAgdGhpcy5fYXBwZW5kQ2FudmFzSWZOZWVkZWQoKTtcbiAgICB9XG5cbiAgICAvLyBTcGVjaWFsIGNhc2UgdG8gc3VwcG9ydCBQNS5qc1xuICAgIGlmIChvcHQucDUgJiYgdHlwZW9mIG9wdC5wNSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5wcm9wcy5wNSA9IG9wdC5wNTtcbiAgICAgIHRoaXMucHJvcHMucDUuZHJhdyA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX2lzUDVSZXNpemluZykgcmV0dXJuO1xuICAgICAgICB0aGlzLl9sYXN0UmVkcmF3UmVzdWx0ID0gdGhpcy5zdWJtaXREcmF3Q2FsbCgpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgcGxheWluZyBzdGF0ZSBpZiBuZWNlc3NhcnlcbiAgICBpZiAoJ3BsYXlpbmcnIGluIG9wdCkge1xuICAgICAgaWYgKG9wdC5wbGF5aW5nKSB0aGlzLnBsYXkoKTtcbiAgICAgIGVsc2UgdGhpcy5wYXVzZSgpO1xuICAgIH1cblxuICAgIGNoZWNrU2V0dGluZ3ModGhpcy5fc2V0dGluZ3MpO1xuXG4gICAgLy8gRHJhdyBuZXcgZnJhbWVcbiAgICB0aGlzLnJlc2l6ZSgpO1xuICAgIHRoaXMucmVuZGVyKCk7XG4gICAgcmV0dXJuIHRoaXMucHJvcHM7XG4gIH1cblxuICByZXNpemUgKCkge1xuICAgIGNvbnN0IG9sZFNpemVzID0gdGhpcy5fZ2V0U2l6ZVByb3BzKCk7XG5cbiAgICBjb25zdCBzZXR0aW5ncyA9IHRoaXMuc2V0dGluZ3M7XG4gICAgY29uc3QgcHJvcHMgPSB0aGlzLnByb3BzO1xuXG4gICAgLy8gUmVjb21wdXRlIG5ldyBwcm9wZXJ0aWVzIGJhc2VkIG9uIGN1cnJlbnQgc2V0dXBcbiAgICBjb25zdCBuZXdQcm9wcyA9IHJlc2l6ZUNhbnZhcyhwcm9wcywgc2V0dGluZ3MpO1xuXG4gICAgLy8gQXNzaWduIHRvIGN1cnJlbnQgcHJvcHNcbiAgICBPYmplY3QuYXNzaWduKHRoaXMuX3Byb3BzLCBuZXdQcm9wcyk7XG5cbiAgICAvLyBOb3cgd2UgYWN0dWFsbHkgdXBkYXRlIHRoZSBjYW52YXMgd2lkdGgvaGVpZ2h0IGFuZCBzdHlsZSBwcm9wc1xuICAgIGNvbnN0IHtcbiAgICAgIHBpeGVsUmF0aW8sXG4gICAgICBjYW52YXNXaWR0aCxcbiAgICAgIGNhbnZhc0hlaWdodCxcbiAgICAgIHN0eWxlV2lkdGgsXG4gICAgICBzdHlsZUhlaWdodFxuICAgIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgLy8gVXBkYXRlIGNhbnZhcyBzZXR0aW5nc1xuICAgIGNvbnN0IGNhbnZhcyA9IHRoaXMucHJvcHMuY2FudmFzO1xuICAgIGlmIChjYW52YXMgJiYgc2V0dGluZ3MucmVzaXplQ2FudmFzICE9PSBmYWxzZSkge1xuICAgICAgaWYgKHByb3BzLnA1KSB7XG4gICAgICAgIC8vIFA1LmpzIHNwZWNpZmljIGVkZ2UgY2FzZVxuICAgICAgICBpZiAoY2FudmFzLndpZHRoICE9PSBjYW52YXNXaWR0aCB8fCBjYW52YXMuaGVpZ2h0ICE9PSBjYW52YXNIZWlnaHQpIHtcbiAgICAgICAgICB0aGlzLl9pc1A1UmVzaXppbmcgPSB0cnVlO1xuICAgICAgICAgIC8vIFRoaXMgY2F1c2VzIGEgcmUtZHJhdyA6XFwgc28gd2UgaWdub3JlIGRyYXdzIGluIHRoZSBtZWFuIHRpbWUuLi4gc29ydGEgaGFja3lcbiAgICAgICAgICBwcm9wcy5wNS5waXhlbERlbnNpdHkocGl4ZWxSYXRpbyk7XG4gICAgICAgICAgcHJvcHMucDUucmVzaXplQ2FudmFzKGNhbnZhc1dpZHRoIC8gcGl4ZWxSYXRpbywgY2FudmFzSGVpZ2h0IC8gcGl4ZWxSYXRpbywgZmFsc2UpO1xuICAgICAgICAgIHRoaXMuX2lzUDVSZXNpemluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBGb3JjZSBjYW52YXMgc2l6ZVxuICAgICAgICBpZiAoY2FudmFzLndpZHRoICE9PSBjYW52YXNXaWR0aCkgY2FudmFzLndpZHRoID0gY2FudmFzV2lkdGg7XG4gICAgICAgIGlmIChjYW52YXMuaGVpZ2h0ICE9PSBjYW52YXNIZWlnaHQpIGNhbnZhcy5oZWlnaHQgPSBjYW52YXNIZWlnaHQ7XG4gICAgICB9XG4gICAgICAvLyBVcGRhdGUgY2FudmFzIHN0eWxlXG4gICAgICBpZiAoaXNCcm93c2VyKCkgJiYgc2V0dGluZ3Muc3R5bGVDYW52YXMgIT09IGZhbHNlKSB7XG4gICAgICAgIGNhbnZhcy5zdHlsZS53aWR0aCA9IGAke3N0eWxlV2lkdGh9cHhgO1xuICAgICAgICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gYCR7c3R5bGVIZWlnaHR9cHhgO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IG5ld1NpemVzID0gdGhpcy5fZ2V0U2l6ZVByb3BzKCk7XG4gICAgbGV0IGNoYW5nZWQgPSAhZGVlcEVxdWFsKG9sZFNpemVzLCBuZXdTaXplcyk7XG4gICAgaWYgKGNoYW5nZWQpIHtcbiAgICAgIHRoaXMuX3NpemVDaGFuZ2VkKCk7XG4gICAgfVxuICAgIHJldHVybiBjaGFuZ2VkO1xuICB9XG5cbiAgX3NpemVDaGFuZ2VkICgpIHtcbiAgICAvLyBTZW5kIHJlc2l6ZSBldmVudCB0byBza2V0Y2hcbiAgICBpZiAodGhpcy5za2V0Y2ggJiYgdHlwZW9mIHRoaXMuc2tldGNoLnJlc2l6ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5za2V0Y2gucmVzaXplKHRoaXMucHJvcHMpO1xuICAgIH1cbiAgfVxuXG4gIGFuaW1hdGUgKCkge1xuICAgIGlmICghdGhpcy5wcm9wcy5wbGF5aW5nKSByZXR1cm47XG4gICAgaWYgKCFpc0Jyb3dzZXIoKSkge1xuICAgICAgY29uc29sZS5lcnJvcignW2NhbnZhcy1za2V0Y2hdIFdBUk46IEFuaW1hdGlvbiBpbiBOb2RlLmpzIGlzIG5vdCB5ZXQgc3VwcG9ydGVkJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX3JhZiA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fYW5pbWF0ZUhhbmRsZXIpO1xuXG4gICAgbGV0IG5vdyA9IHJpZ2h0Tm93KCk7XG5cbiAgICBjb25zdCBmcHMgPSB0aGlzLnByb3BzLmZwcztcbiAgICBjb25zdCBmcmFtZUludGVydmFsTVMgPSAxMDAwIC8gZnBzO1xuICAgIGxldCBkZWx0YVRpbWVNUyA9IG5vdyAtIHRoaXMuX2xhc3RUaW1lO1xuXG4gICAgY29uc3QgZHVyYXRpb24gPSB0aGlzLnByb3BzLmR1cmF0aW9uO1xuICAgIGNvbnN0IGhhc0R1cmF0aW9uID0gdHlwZW9mIGR1cmF0aW9uID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZShkdXJhdGlvbik7XG5cbiAgICBsZXQgaXNOZXdGcmFtZSA9IHRydWU7XG4gICAgY29uc3QgcGxheWJhY2tSYXRlID0gdGhpcy5zZXR0aW5ncy5wbGF5YmFja1JhdGU7XG4gICAgaWYgKHBsYXliYWNrUmF0ZSA9PT0gJ2ZpeGVkJykge1xuICAgICAgZGVsdGFUaW1lTVMgPSBmcmFtZUludGVydmFsTVM7XG4gICAgfSBlbHNlIGlmIChwbGF5YmFja1JhdGUgPT09ICd0aHJvdHRsZScpIHtcbiAgICAgIGlmIChkZWx0YVRpbWVNUyA+IGZyYW1lSW50ZXJ2YWxNUykge1xuICAgICAgICBub3cgPSBub3cgLSAoZGVsdGFUaW1lTVMgJSBmcmFtZUludGVydmFsTVMpO1xuICAgICAgICB0aGlzLl9sYXN0VGltZSA9IG5vdztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlzTmV3RnJhbWUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbGFzdFRpbWUgPSBub3c7XG4gICAgfVxuXG4gICAgY29uc3QgZGVsdGFUaW1lID0gZGVsdGFUaW1lTVMgLyAxMDAwO1xuICAgIGxldCBuZXdUaW1lID0gdGhpcy5wcm9wcy50aW1lICsgZGVsdGFUaW1lICogdGhpcy5wcm9wcy50aW1lU2NhbGU7XG5cbiAgICAvLyBIYW5kbGUgcmV2ZXJzZSB0aW1lIHNjYWxlXG4gICAgaWYgKG5ld1RpbWUgPCAwICYmIGhhc0R1cmF0aW9uKSB7XG4gICAgICBuZXdUaW1lID0gZHVyYXRpb24gKyBuZXdUaW1lO1xuICAgIH1cblxuICAgIC8vIFJlLXN0YXJ0IGFuaW1hdGlvblxuICAgIGxldCBpc0ZpbmlzaGVkID0gZmFsc2U7XG4gICAgbGV0IGlzTG9vcFN0YXJ0ID0gZmFsc2U7XG5cbiAgICBjb25zdCBsb29waW5nID0gdGhpcy5zZXR0aW5ncy5sb29wICE9PSBmYWxzZTtcblxuICAgIGlmIChoYXNEdXJhdGlvbiAmJiBuZXdUaW1lID49IGR1cmF0aW9uKSB7XG4gICAgICAvLyBSZS1zdGFydCBhbmltYXRpb25cbiAgICAgIGlmIChsb29waW5nKSB7XG4gICAgICAgIGlzTmV3RnJhbWUgPSB0cnVlO1xuICAgICAgICBuZXdUaW1lID0gbmV3VGltZSAlIGR1cmF0aW9uO1xuICAgICAgICBpc0xvb3BTdGFydCA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpc05ld0ZyYW1lID0gZmFsc2U7XG4gICAgICAgIG5ld1RpbWUgPSBkdXJhdGlvbjtcbiAgICAgICAgaXNGaW5pc2hlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3NpZ25hbEVuZCgpO1xuICAgIH1cblxuICAgIGlmIChpc05ld0ZyYW1lKSB7XG4gICAgICB0aGlzLnByb3BzLmRlbHRhVGltZSA9IGRlbHRhVGltZTtcbiAgICAgIHRoaXMucHJvcHMudGltZSA9IG5ld1RpbWU7XG4gICAgICB0aGlzLnByb3BzLnBsYXloZWFkID0gdGhpcy5fY29tcHV0ZVBsYXloZWFkKG5ld1RpbWUsIGR1cmF0aW9uKTtcbiAgICAgIGNvbnN0IGxhc3RGcmFtZSA9IHRoaXMucHJvcHMuZnJhbWU7XG4gICAgICB0aGlzLnByb3BzLmZyYW1lID0gdGhpcy5fY29tcHV0ZUN1cnJlbnRGcmFtZSgpO1xuICAgICAgaWYgKGlzTG9vcFN0YXJ0KSB0aGlzLl9zaWduYWxCZWdpbigpO1xuICAgICAgaWYgKGxhc3RGcmFtZSAhPT0gdGhpcy5wcm9wcy5mcmFtZSkgdGhpcy50aWNrKCk7XG4gICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgdGhpcy5wcm9wcy5kZWx0YVRpbWUgPSAwO1xuICAgIH1cblxuICAgIGlmIChpc0ZpbmlzaGVkKSB7XG4gICAgICB0aGlzLnBhdXNlKCk7XG4gICAgfVxuICB9XG5cbiAgZGlzcGF0Y2ggKGNiKSB7XG4gICAgaWYgKHR5cGVvZiBjYiAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgbmV3IEVycm9yKCdtdXN0IHBhc3MgZnVuY3Rpb24gaW50byBkaXNwYXRjaCgpJyk7XG4gICAgY2IodGhpcy5wcm9wcyk7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIG1vdW50ICgpIHtcbiAgICB0aGlzLl9hcHBlbmRDYW52YXNJZk5lZWRlZCgpO1xuICB9XG5cbiAgdW5tb3VudCAoKSB7XG4gICAgaWYgKGlzQnJvd3NlcigpKSB7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5fcmVzaXplSGFuZGxlcik7XG4gICAgICB0aGlzLl9rZXlib2FyZFNob3J0Y3V0cy5kZXRhY2goKTtcbiAgICB9XG4gICAgaWYgKHRoaXMucHJvcHMuY2FudmFzLnBhcmVudEVsZW1lbnQpIHtcbiAgICAgIHRoaXMucHJvcHMuY2FudmFzLnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5wcm9wcy5jYW52YXMpO1xuICAgIH1cbiAgfVxuXG4gIF9hcHBlbmRDYW52YXNJZk5lZWRlZCAoKSB7XG4gICAgaWYgKCFpc0Jyb3dzZXIoKSkgcmV0dXJuO1xuICAgIGlmICh0aGlzLnNldHRpbmdzLnBhcmVudCAhPT0gZmFsc2UgJiYgKHRoaXMucHJvcHMuY2FudmFzICYmICF0aGlzLnByb3BzLmNhbnZhcy5wYXJlbnRFbGVtZW50KSkge1xuICAgICAgY29uc3QgZGVmYXVsdFBhcmVudCA9IHRoaXMuc2V0dGluZ3MucGFyZW50IHx8IGRvY3VtZW50LmJvZHk7XG4gICAgICBkZWZhdWx0UGFyZW50LmFwcGVuZENoaWxkKHRoaXMucHJvcHMuY2FudmFzKTtcbiAgICB9XG4gIH1cblxuICBfc2V0dXBHTEtleSAoKSB7XG4gICAgaWYgKHRoaXMucHJvcHMuY29udGV4dCkge1xuICAgICAgaWYgKGlzV2ViR0xDb250ZXh0KHRoaXMucHJvcHMuY29udGV4dCkpIHtcbiAgICAgICAgdGhpcy5fcHJvcHMuZ2wgPSB0aGlzLnByb3BzLmNvbnRleHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWxldGUgdGhpcy5fcHJvcHMuZ2w7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0VGltZVByb3BzIChzZXR0aW5ncyA9IHt9KSB7XG4gICAgLy8gR2V0IHRpbWluZyBkYXRhXG4gICAgbGV0IGR1cmF0aW9uID0gc2V0dGluZ3MuZHVyYXRpb247XG4gICAgbGV0IHRvdGFsRnJhbWVzID0gc2V0dGluZ3MudG90YWxGcmFtZXM7XG4gICAgY29uc3QgdGltZVNjYWxlID0gZGVmaW5lZChzZXR0aW5ncy50aW1lU2NhbGUsIDEpO1xuICAgIGNvbnN0IGZwcyA9IGRlZmluZWQoc2V0dGluZ3MuZnBzLCAyNCk7XG4gICAgY29uc3QgaGFzRHVyYXRpb24gPSB0eXBlb2YgZHVyYXRpb24gPT09ICdudW1iZXInICYmIGlzRmluaXRlKGR1cmF0aW9uKTtcbiAgICBjb25zdCBoYXNUb3RhbEZyYW1lcyA9IHR5cGVvZiB0b3RhbEZyYW1lcyA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUodG90YWxGcmFtZXMpO1xuXG4gICAgY29uc3QgdG90YWxGcmFtZXNGcm9tRHVyYXRpb24gPSBoYXNEdXJhdGlvbiA/IE1hdGguZmxvb3IoZnBzICogZHVyYXRpb24pIDogdW5kZWZpbmVkO1xuICAgIGNvbnN0IGR1cmF0aW9uRnJvbVRvdGFsRnJhbWVzID0gaGFzVG90YWxGcmFtZXMgPyAodG90YWxGcmFtZXMgLyBmcHMpIDogdW5kZWZpbmVkO1xuICAgIGlmIChoYXNEdXJhdGlvbiAmJiBoYXNUb3RhbEZyYW1lcyAmJiB0b3RhbEZyYW1lc0Zyb21EdXJhdGlvbiAhPT0gdG90YWxGcmFtZXMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignWW91IHNob3VsZCBzcGVjaWZ5IGVpdGhlciBkdXJhdGlvbiBvciB0b3RhbEZyYW1lcywgYnV0IG5vdCBib3RoLiBPciwgdGhleSBtdXN0IG1hdGNoIGV4YWN0bHkuJyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBzZXR0aW5ncy5kaW1lbnNpb25zID09PSAndW5kZWZpbmVkJyAmJiB0eXBlb2Ygc2V0dGluZ3MudW5pdHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjb25zb2xlLndhcm4oYFlvdSd2ZSBzcGVjaWZpZWQgYSB7IHVuaXRzIH0gc2V0dGluZyBidXQgbm8geyBkaW1lbnNpb24gfSwgc28gdGhlIHVuaXRzIHdpbGwgYmUgaWdub3JlZC5gKTtcbiAgICB9XG5cbiAgICB0b3RhbEZyYW1lcyA9IGRlZmluZWQodG90YWxGcmFtZXMsIHRvdGFsRnJhbWVzRnJvbUR1cmF0aW9uLCBJbmZpbml0eSk7XG4gICAgZHVyYXRpb24gPSBkZWZpbmVkKGR1cmF0aW9uLCBkdXJhdGlvbkZyb21Ub3RhbEZyYW1lcywgSW5maW5pdHkpO1xuXG4gICAgY29uc3Qgc3RhcnRUaW1lID0gc2V0dGluZ3MudGltZTtcbiAgICBjb25zdCBzdGFydEZyYW1lID0gc2V0dGluZ3MuZnJhbWU7XG4gICAgY29uc3QgaGFzU3RhcnRUaW1lID0gdHlwZW9mIHN0YXJ0VGltZSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoc3RhcnRUaW1lKTtcbiAgICBjb25zdCBoYXNTdGFydEZyYW1lID0gdHlwZW9mIHN0YXJ0RnJhbWUgPT09ICdudW1iZXInICYmIGlzRmluaXRlKHN0YXJ0RnJhbWUpO1xuXG4gICAgLy8gc3RhcnQgYXQgemVybyB1bmxlc3MgdXNlciBzcGVjaWZpZXMgZnJhbWUgb3IgdGltZSAoYnV0IG5vdCBib3RoIG1pc21hdGNoZWQpXG4gICAgbGV0IHRpbWUgPSAwO1xuICAgIGxldCBmcmFtZSA9IDA7XG4gICAgbGV0IHBsYXloZWFkID0gMDtcbiAgICBpZiAoaGFzU3RhcnRUaW1lICYmIGhhc1N0YXJ0RnJhbWUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignWW91IHNob3VsZCBzcGVjaWZ5IGVpdGhlciBzdGFydCBmcmFtZSBvciB0aW1lLCBidXQgbm90IGJvdGguJyk7XG4gICAgfSBlbHNlIGlmIChoYXNTdGFydFRpbWUpIHtcbiAgICAgIC8vIFVzZXIgc3BlY2lmaWVzIHRpbWUsIHdlIGluZmVyIGZyYW1lcyBmcm9tIEZQU1xuICAgICAgdGltZSA9IHN0YXJ0VGltZTtcbiAgICAgIHBsYXloZWFkID0gdGhpcy5fY29tcHV0ZVBsYXloZWFkKHRpbWUsIGR1cmF0aW9uKTtcbiAgICAgIGZyYW1lID0gdGhpcy5fY29tcHV0ZUZyYW1lKFxuICAgICAgICBwbGF5aGVhZCwgdGltZSxcbiAgICAgICAgdG90YWxGcmFtZXMsIGZwc1xuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKGhhc1N0YXJ0RnJhbWUpIHtcbiAgICAgIC8vIFVzZXIgc3BlY2lmaWVzIGZyYW1lIG51bWJlciwgd2UgaW5mZXIgdGltZSBmcm9tIEZQU1xuICAgICAgZnJhbWUgPSBzdGFydEZyYW1lO1xuICAgICAgdGltZSA9IGZyYW1lIC8gZnBzO1xuICAgICAgcGxheWhlYWQgPSB0aGlzLl9jb21wdXRlUGxheWhlYWQodGltZSwgZHVyYXRpb24pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBwbGF5aGVhZCxcbiAgICAgIHRpbWUsXG4gICAgICBmcmFtZSxcbiAgICAgIGR1cmF0aW9uLFxuICAgICAgdG90YWxGcmFtZXMsXG4gICAgICBmcHMsXG4gICAgICB0aW1lU2NhbGVcbiAgICB9O1xuICB9XG5cbiAgc2V0dXAgKHNldHRpbmdzID0ge30pIHtcbiAgICBpZiAodGhpcy5za2V0Y2gpIHRocm93IG5ldyBFcnJvcignTXVsdGlwbGUgc2V0dXAoKSBjYWxscyBub3QgeWV0IHN1cHBvcnRlZC4nKTtcblxuICAgIHRoaXMuX3NldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgc2V0dGluZ3MsIHRoaXMuX3NldHRpbmdzKTtcblxuICAgIGNoZWNrU2V0dGluZ3ModGhpcy5fc2V0dGluZ3MpO1xuXG4gICAgLy8gR2V0IGluaXRpYWwgY2FudmFzICYgY29udGV4dFxuICAgIGNvbnN0IHsgY29udGV4dCwgY2FudmFzIH0gPSBjcmVhdGVDYW52YXModGhpcy5fc2V0dGluZ3MpO1xuXG4gICAgY29uc3QgdGltZVByb3BzID0gdGhpcy5nZXRUaW1lUHJvcHModGhpcy5fc2V0dGluZ3MpO1xuXG4gICAgLy8gSW5pdGlhbCByZW5kZXIgc3RhdGUgZmVhdHVyZXNcbiAgICB0aGlzLl9wcm9wcyA9IHtcbiAgICAgIC4uLnRpbWVQcm9wcyxcbiAgICAgIGNhbnZhcyxcbiAgICAgIGNvbnRleHQsXG4gICAgICBkZWx0YVRpbWU6IDAsXG4gICAgICBzdGFydGVkOiBmYWxzZSxcbiAgICAgIGV4cG9ydGluZzogZmFsc2UsXG4gICAgICBwbGF5aW5nOiBmYWxzZSxcbiAgICAgIHJlY29yZGluZzogZmFsc2UsXG4gICAgICBzZXR0aW5nczogdGhpcy5zZXR0aW5ncyxcbiAgICAgIGRhdGE6IHRoaXMuc2V0dGluZ3MuZGF0YSxcblxuICAgICAgLy8gRXhwb3J0IHNvbWUgc3BlY2lmaWMgYWN0aW9ucyB0byB0aGUgc2tldGNoXG4gICAgICByZW5kZXI6ICgpID0+IHRoaXMucmVuZGVyKCksXG4gICAgICB0b2dnbGVQbGF5OiAoKSA9PiB0aGlzLnRvZ2dsZVBsYXkoKSxcbiAgICAgIGRpc3BhdGNoOiAoY2IpID0+IHRoaXMuZGlzcGF0Y2goY2IpLFxuICAgICAgdGljazogKCkgPT4gdGhpcy50aWNrKCksXG4gICAgICByZXNpemU6ICgpID0+IHRoaXMucmVzaXplKCksXG4gICAgICB1cGRhdGU6IChvcHQpID0+IHRoaXMudXBkYXRlKG9wdCksXG4gICAgICBleHBvcnRGcmFtZTogb3B0ID0+IHRoaXMuZXhwb3J0RnJhbWUob3B0KSxcbiAgICAgIHJlY29yZDogKCkgPT4gdGhpcy5yZWNvcmQoKSxcbiAgICAgIHBsYXk6ICgpID0+IHRoaXMucGxheSgpLFxuICAgICAgcGF1c2U6ICgpID0+IHRoaXMucGF1c2UoKSxcbiAgICAgIHN0b3A6ICgpID0+IHRoaXMuc3RvcCgpXG4gICAgfTtcblxuICAgIC8vIEZvciBXZWJHTCBza2V0Y2hlcywgYSBnbCB2YXJpYWJsZSByZWFkcyBhIGJpdCBiZXR0ZXJcbiAgICB0aGlzLl9zZXR1cEdMS2V5KCk7XG5cbiAgICAvLyBUcmlnZ2VyIGluaXRpYWwgcmVzaXplIG5vdyBzbyB0aGF0IGNhbnZhcyBpcyBhbHJlYWR5IHNpemVkXG4gICAgLy8gYnkgdGhlIHRpbWUgd2UgbG9hZCB0aGUgc2tldGNoXG4gICAgdGhpcy5yZXNpemUoKTtcbiAgfVxuXG4gIGxvYWRBbmRSdW4gKGNhbnZhc1NrZXRjaCwgbmV3U2V0dGluZ3MpIHtcbiAgICByZXR1cm4gdGhpcy5sb2FkKGNhbnZhc1NrZXRjaCwgbmV3U2V0dGluZ3MpLnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy5ydW4oKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0pO1xuICB9XG5cbiAgdW5sb2FkICgpIHtcbiAgICB0aGlzLnBhdXNlKCk7XG4gICAgaWYgKCF0aGlzLnNrZXRjaCkgcmV0dXJuO1xuICAgIGlmICh0eXBlb2YgdGhpcy5za2V0Y2gudW5sb2FkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLl93cmFwQ29udGV4dFNjYWxlKHByb3BzID0+IHRoaXMuc2tldGNoLnVubG9hZChwcm9wcykpO1xuICAgIH1cbiAgICB0aGlzLl9za2V0Y2ggPSBudWxsO1xuICB9XG5cbiAgZGVzdHJveSAoKSB7XG4gICAgdGhpcy51bmxvYWQoKTtcbiAgICB0aGlzLnVubW91bnQoKTtcbiAgfVxuXG4gIGxvYWQgKGNyZWF0ZVNrZXRjaCwgbmV3U2V0dGluZ3MpIHtcbiAgICAvLyBVc2VyIGRpZG4ndCBzcGVjaWZ5IGEgZnVuY3Rpb25cbiAgICBpZiAodHlwZW9mIGNyZWF0ZVNrZXRjaCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgZnVuY3Rpb24gbXVzdCB0YWtlIGluIGEgZnVuY3Rpb24gYXMgdGhlIGZpcnN0IHBhcmFtZXRlci4gRXhhbXBsZTpcXG4gIGNhbnZhc1NrZXRjaGVyKCgpID0+IHsgLi4uIH0sIHNldHRpbmdzKScpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnNrZXRjaCkge1xuICAgICAgdGhpcy51bmxvYWQoKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG5ld1NldHRpbmdzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy51cGRhdGUobmV3U2V0dGluZ3MpO1xuICAgIH1cblxuICAgIC8vIFRoaXMgaXMgYSBiaXQgb2YgYSB0cmlja3kgY2FzZTsgd2Ugc2V0IHVwIHRoZSBhdXRvLXNjYWxpbmcgaGVyZVxuICAgIC8vIGluIGNhc2UgdGhlIHVzZXIgZGVjaWRlcyB0byByZW5kZXIgYW55dGhpbmcgdG8gdGhlIGNvbnRleHQgKmJlZm9yZSogdGhlXG4gICAgLy8gcmVuZGVyKCkgZnVuY3Rpb24uLi4gSG93ZXZlciwgdXNlcnMgc2hvdWxkIGluc3RlYWQgdXNlIGJlZ2luKCkgZnVuY3Rpb24gZm9yIHRoYXQuXG4gICAgdGhpcy5fcHJlUmVuZGVyKCk7XG5cbiAgICBsZXQgcHJlbG9hZCA9IFByb21pc2UucmVzb2x2ZSgpO1xuXG4gICAgLy8gQmVjYXVzZSBvZiBQNS5qcydzIHVudXN1YWwgc3RydWN0dXJlLCB3ZSBoYXZlIHRvIGRvIGEgYml0IG9mXG4gICAgLy8gbGlicmFyeS1zcGVjaWZpYyBjaGFuZ2VzIHRvIHN1cHBvcnQgaXQgcHJvcGVybHkuXG4gICAgaWYgKHRoaXMuc2V0dGluZ3MucDUpIHtcbiAgICAgIGlmICghaXNCcm93c2VyKCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdbY2FudmFzLXNrZXRjaF0gRVJST1I6IFVzaW5nIHA1LmpzIGluIE5vZGUuanMgaXMgbm90IHN1cHBvcnRlZCcpO1xuICAgICAgfVxuICAgICAgcHJlbG9hZCA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICBsZXQgUDVDb25zdHJ1Y3RvciA9IHRoaXMuc2V0dGluZ3MucDU7XG4gICAgICAgIGxldCBwcmVsb2FkO1xuICAgICAgICBpZiAoUDVDb25zdHJ1Y3Rvci5wNSkge1xuICAgICAgICAgIHByZWxvYWQgPSBQNUNvbnN0cnVjdG9yLnByZWxvYWQ7XG4gICAgICAgICAgUDVDb25zdHJ1Y3RvciA9IFA1Q29uc3RydWN0b3IucDU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgc2tldGNoIHNldHVwOyBkaXNhYmxlIGxvb3AsIHNldCBzaXppbmcsIGV0Yy5cbiAgICAgICAgY29uc3QgcDVTa2V0Y2ggPSBwNSA9PiB7XG4gICAgICAgICAgLy8gSG9vayBpbiBwcmVsb2FkIGlmIG5lY2Vzc2FyeVxuICAgICAgICAgIGlmIChwcmVsb2FkKSBwNS5wcmVsb2FkID0gKCkgPT4gcHJlbG9hZChwNSk7XG4gICAgICAgICAgcDUuc2V0dXAgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICBjb25zdCBpc0dMID0gdGhpcy5zZXR0aW5ncy5jb250ZXh0ID09PSAnd2ViZ2wnO1xuICAgICAgICAgICAgY29uc3QgcmVuZGVyZXIgPSBpc0dMID8gcDUuV0VCR0wgOiBwNS5QMkQ7XG4gICAgICAgICAgICBwNS5ub0xvb3AoKTtcbiAgICAgICAgICAgIHA1LnBpeGVsRGVuc2l0eShwcm9wcy5waXhlbFJhdGlvKTtcbiAgICAgICAgICAgIHA1LmNyZWF0ZUNhbnZhcyhwcm9wcy52aWV3cG9ydFdpZHRoLCBwcm9wcy52aWV3cG9ydEhlaWdodCwgcmVuZGVyZXIpO1xuICAgICAgICAgICAgaWYgKGlzR0wgJiYgdGhpcy5zZXR0aW5ncy5hdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICAgIHA1LnNldEF0dHJpYnV0ZXModGhpcy5zZXR0aW5ncy5hdHRyaWJ1dGVzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy51cGRhdGUoeyBwNSwgY2FudmFzOiBwNS5jYW52YXMsIGNvbnRleHQ6IHA1Ll9yZW5kZXJlci5kcmF3aW5nQ29udGV4dCB9KTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFN1cHBvcnQgZ2xvYmFsIGFuZCBpbnN0YW5jZSBQNS5qcyBtb2Rlc1xuICAgICAgICBpZiAodHlwZW9mIFA1Q29uc3RydWN0b3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBuZXcgUDVDb25zdHJ1Y3RvcihwNVNrZXRjaCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cuY3JlYXRlQ2FudmFzICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ7IHA1IH0gc2V0dGluZyBpcyBwYXNzZWQgYnV0IGNhbid0IGZpbmQgcDUuanMgaW4gZ2xvYmFsICh3aW5kb3cpIHNjb3BlLiBNYXliZSB5b3UgZGlkIG5vdCBjcmVhdGUgaXQgZ2xvYmFsbHk/XFxubmV3IHA1KCk7IC8vIDwtLSBhdHRhY2hlcyB0byBnbG9iYWwgc2NvcGVcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHA1U2tldGNoKHdpbmRvdyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBwcmVsb2FkLnRoZW4oKCkgPT4ge1xuICAgICAgLy8gTG9hZCB0aGUgdXNlcidzIHNrZXRjaFxuICAgICAgbGV0IGxvYWRlciA9IGNyZWF0ZVNrZXRjaCh0aGlzLnByb3BzKTtcbiAgICAgIGlmICghaXNQcm9taXNlKGxvYWRlcikpIHtcbiAgICAgICAgbG9hZGVyID0gUHJvbWlzZS5yZXNvbHZlKGxvYWRlcik7XG4gICAgICB9XG4gICAgICByZXR1cm4gbG9hZGVyO1xuICAgIH0pLnRoZW4oc2tldGNoID0+IHtcbiAgICAgIGlmICghc2tldGNoKSBza2V0Y2ggPSB7fTtcbiAgICAgIHRoaXMuX3NrZXRjaCA9IHNrZXRjaDtcblxuICAgICAgLy8gT25jZSB0aGUgc2tldGNoIGlzIGxvYWRlZCB3ZSBjYW4gYWRkIHRoZSBldmVudHNcbiAgICAgIGlmIChpc0Jyb3dzZXIoKSkge1xuICAgICAgICB0aGlzLl9rZXlib2FyZFNob3J0Y3V0cy5hdHRhY2goKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuX3Jlc2l6ZUhhbmRsZXIpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9wb3N0UmVuZGVyKCk7XG5cbiAgICAgIC8vIFRoZSBpbml0aWFsIHJlc2l6ZSgpIGluIHRoZSBjb25zdHJ1Y3RvciB3aWxsIG5vdCBoYXZlXG4gICAgICAvLyB0cmlnZ2VyZWQgYSByZXNpemUoKSBldmVudCBvbiB0aGUgc2tldGNoLCBzaW5jZSBpdCB3YXMgYmVmb3JlXG4gICAgICAvLyB0aGUgc2tldGNoIHdhcyBsb2FkZWQuIFNvIHdlIHNlbmQgdGhlIHNpZ25hbCBoZXJlLCBhbGxvd2luZ1xuICAgICAgLy8gdXNlcnMgdG8gcmVhY3QgdG8gdGhlIGluaXRpYWwgc2l6ZSBiZWZvcmUgZmlyc3QgcmVuZGVyLlxuICAgICAgdGhpcy5fc2l6ZUNoYW5nZWQoKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICBjb25zb2xlLndhcm4oJ0NvdWxkIG5vdCBzdGFydCBza2V0Y2gsIHRoZSBhc3luYyBsb2FkaW5nIGZ1bmN0aW9uIHJlamVjdGVkIHdpdGggYW4gZXJyb3I6XFxuICAgIEVycm9yOiAnICsgZXJyLm1lc3NhZ2UpO1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNrZXRjaE1hbmFnZXI7XG4iLCJpbXBvcnQgU2tldGNoTWFuYWdlciBmcm9tICcuL2NvcmUvU2tldGNoTWFuYWdlcic7XG5pbXBvcnQgUGFwZXJTaXplcyBmcm9tICcuL3BhcGVyLXNpemVzJztcbmltcG9ydCB7IGdldENsaWVudEFQSSB9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQgZGVmaW5lZCBmcm9tICdkZWZpbmVkJztcblxuY29uc3QgQ0FDSEUgPSAnaG90LWlkLWNhY2hlJztcbmNvbnN0IHJ1bnRpbWVDb2xsaXNpb25zID0gW107XG5cbmZ1bmN0aW9uIGlzSG90UmVsb2FkICgpIHtcbiAgY29uc3QgY2xpZW50ID0gZ2V0Q2xpZW50QVBJKCk7XG4gIHJldHVybiBjbGllbnQgJiYgY2xpZW50LmhvdDtcbn1cblxuZnVuY3Rpb24gY2FjaGVHZXQgKGlkKSB7XG4gIGNvbnN0IGNsaWVudCA9IGdldENsaWVudEFQSSgpO1xuICBpZiAoIWNsaWVudCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgY2xpZW50W0NBQ0hFXSA9IGNsaWVudFtDQUNIRV0gfHwge307XG4gIHJldHVybiBjbGllbnRbQ0FDSEVdW2lkXTtcbn1cblxuZnVuY3Rpb24gY2FjaGVQdXQgKGlkLCBkYXRhKSB7XG4gIGNvbnN0IGNsaWVudCA9IGdldENsaWVudEFQSSgpO1xuICBpZiAoIWNsaWVudCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgY2xpZW50W0NBQ0hFXSA9IGNsaWVudFtDQUNIRV0gfHwge307XG4gIGNsaWVudFtDQUNIRV1baWRdID0gZGF0YTtcbn1cblxuZnVuY3Rpb24gZ2V0VGltZVByb3AgKG9sZE1hbmFnZXIsIG5ld1NldHRpbmdzKSB7XG4gIC8vIFN0YXRpYyBza2V0Y2hlcyBpZ25vcmUgdGhlIHRpbWUgcGVyc2lzdGVuY3lcbiAgcmV0dXJuIG5ld1NldHRpbmdzLmFuaW1hdGUgPyB7IHRpbWU6IG9sZE1hbmFnZXIucHJvcHMudGltZSB9IDogdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBjYW52YXNTa2V0Y2ggKHNrZXRjaCwgc2V0dGluZ3MgPSB7fSkge1xuICBpZiAoc2V0dGluZ3MucDUpIHtcbiAgICBpZiAoc2V0dGluZ3MuY2FudmFzIHx8IChzZXR0aW5ncy5jb250ZXh0ICYmIHR5cGVvZiBzZXR0aW5ncy5jb250ZXh0ICE9PSAnc3RyaW5nJykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW4geyBwNSB9IG1vZGUsIHlvdSBjYW4ndCBwYXNzIHlvdXIgb3duIGNhbnZhcyBvciBjb250ZXh0LCB1bmxlc3MgdGhlIGNvbnRleHQgaXMgYSBcIndlYmdsXCIgb3IgXCIyZFwiIHN0cmluZ2ApO1xuICAgIH1cblxuICAgIC8vIERvIG5vdCBjcmVhdGUgYSBjYW52YXMgb24gc3RhcnR1cCwgc2luY2UgUDUuanMgZG9lcyB0aGF0IGZvciB1c1xuICAgIGNvbnN0IGNvbnRleHQgPSB0eXBlb2Ygc2V0dGluZ3MuY29udGV4dCA9PT0gJ3N0cmluZycgPyBzZXR0aW5ncy5jb250ZXh0IDogZmFsc2U7XG4gICAgc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBzZXR0aW5ncywgeyBjYW52YXM6IGZhbHNlLCBjb250ZXh0IH0pO1xuICB9XG5cbiAgY29uc3QgaXNIb3QgPSBpc0hvdFJlbG9hZCgpO1xuICBsZXQgaG90SUQ7XG4gIGlmIChpc0hvdCkge1xuICAgIC8vIFVzZSBhIG1hZ2ljIG5hbWUgYnkgZGVmYXVsdCwgZm9yY2UgdXNlciB0byBkZWZpbmUgZWFjaCBza2V0Y2ggaWYgdGhleVxuICAgIC8vIHJlcXVpcmUgbW9yZSB0aGFuIG9uZSBpbiBhbiBhcHBsaWNhdGlvbi4gT3BlbiB0byBvdGhlciBpZGVhcyBvbiBob3cgdG8gdGFja2xlXG4gICAgLy8gdGhpcyBhcyB3ZWxsLi4uXG4gICAgaG90SUQgPSBkZWZpbmVkKHNldHRpbmdzLmlkLCAnJF9fREVGQVVMVF9DQU5WQVNfU0tFVENIX0lEX18kJyk7XG4gIH1cbiAgbGV0IGlzSW5qZWN0aW5nID0gaXNIb3QgJiYgdHlwZW9mIGhvdElEID09PSAnc3RyaW5nJztcblxuICBpZiAoaXNJbmplY3RpbmcgJiYgcnVudGltZUNvbGxpc2lvbnMuaW5jbHVkZXMoaG90SUQpKSB7XG4gICAgY29uc29sZS53YXJuKGBXYXJuaW5nOiBZb3UgaGF2ZSBtdWx0aXBsZSBjYWxscyB0byBjYW52YXNTa2V0Y2goKSBpbiAtLWhvdCBtb2RlLiBZb3UgbXVzdCBwYXNzIHVuaXF1ZSB7IGlkIH0gc3RyaW5ncyBpbiBzZXR0aW5ncyB0byBlbmFibGUgaG90IHJlbG9hZCBhY3Jvc3MgbXVsdGlwbGUgc2tldGNoZXMuIGAsIGhvdElEKTtcbiAgICBpc0luamVjdGluZyA9IGZhbHNlO1xuICB9XG5cbiAgbGV0IHByZWxvYWQgPSBQcm9taXNlLnJlc29sdmUoKTtcblxuICBpZiAoaXNJbmplY3RpbmcpIHtcbiAgICAvLyBNYXJrIHRoaXMgYXMgYWxyZWFkeSBzcG90dGVkIGluIHRoaXMgcnVudGltZSBpbnN0YW5jZVxuICAgIHJ1bnRpbWVDb2xsaXNpb25zLnB1c2goaG90SUQpO1xuXG4gICAgY29uc3QgcHJldmlvdXNEYXRhID0gY2FjaGVHZXQoaG90SUQpO1xuICAgIGlmIChwcmV2aW91c0RhdGEpIHtcbiAgICAgIGNvbnN0IG5leHQgPSAoKSA9PiB7XG4gICAgICAgIC8vIEdyYWIgbmV3IHByb3BzIGZyb20gb2xkIHNrZXRjaCBpbnN0YW5jZVxuICAgICAgICBjb25zdCBuZXdQcm9wcyA9IGdldFRpbWVQcm9wKHByZXZpb3VzRGF0YS5tYW5hZ2VyLCBzZXR0aW5ncyk7XG4gICAgICAgIC8vIERlc3Ryb3kgdGhlIG9sZCBpbnN0YW5jZVxuICAgICAgICBwcmV2aW91c0RhdGEubWFuYWdlci5kZXN0cm95KCk7XG4gICAgICAgIC8vIFBhc3MgYWxvbmcgbmV3IHByb3BzXG4gICAgICAgIHJldHVybiBuZXdQcm9wcztcbiAgICAgIH07XG5cbiAgICAgIC8vIE1vdmUgYWxvbmcgdGhlIG5leHQgZGF0YS4uLlxuICAgICAgcHJlbG9hZCA9IHByZXZpb3VzRGF0YS5sb2FkLnRoZW4obmV4dCkuY2F0Y2gobmV4dCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHByZWxvYWQudGhlbihuZXdQcm9wcyA9PiB7XG4gICAgY29uc3QgbWFuYWdlciA9IG5ldyBTa2V0Y2hNYW5hZ2VyKCk7XG4gICAgbGV0IHJlc3VsdDtcbiAgICBpZiAoc2tldGNoKSB7XG4gICAgICAvLyBNZXJnZSB3aXRoIGluY29taW5nIGRhdGFcbiAgICAgIHNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgc2V0dGluZ3MsIG5ld1Byb3BzKTtcblxuICAgICAgLy8gQXBwbHkgc2V0dGluZ3MgYW5kIGNyZWF0ZSBhIGNhbnZhc1xuICAgICAgbWFuYWdlci5zZXR1cChzZXR0aW5ncyk7XG5cbiAgICAgIC8vIE1vdW50IHRvIERPTVxuICAgICAgbWFuYWdlci5tb3VudCgpO1xuXG4gICAgICAvLyBsb2FkIHRoZSBza2V0Y2ggZmlyc3RcbiAgICAgIHJlc3VsdCA9IG1hbmFnZXIubG9hZEFuZFJ1bihza2V0Y2gpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgPSBQcm9taXNlLnJlc29sdmUobWFuYWdlcik7XG4gICAgfVxuICAgIGlmIChpc0luamVjdGluZykge1xuICAgICAgY2FjaGVQdXQoaG90SUQsIHsgbG9hZDogcmVzdWx0LCBtYW5hZ2VyIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9KTtcbn1cblxuLy8gVE9ETzogRmlndXJlIG91dCBhIG5pY2Ugd2F5IHRvIGV4cG9ydCB0aGluZ3MuXG5jYW52YXNTa2V0Y2guY2FudmFzU2tldGNoID0gY2FudmFzU2tldGNoO1xuY2FudmFzU2tldGNoLlBhcGVyU2l6ZXMgPSBQYXBlclNpemVzO1xuXG5leHBvcnQgZGVmYXVsdCBjYW52YXNTa2V0Y2g7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTtcblxudmFyIGluc3RhbGxlZENvbG9yU3BhY2VzID0gW10sXG4gICAgdW5kZWYgPSBmdW5jdGlvbiB1bmRlZihvYmopIHtcbiAgICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ3VuZGVmaW5lZCc7XG59LFxuICAgIGNoYW5uZWxSZWdFeHAgPSAvXFxzKihcXC5cXGQrfFxcZCsoPzpcXC5cXGQrKT8pKCUpP1xccyovLFxuICAgIHBlcmNlbnRhZ2VDaGFubmVsUmVnRXhwID0gL1xccyooXFwuXFxkK3wxMDB8XFxkP1xcZCg/OlxcLlxcZCspPyklXFxzKi8sXG4gICAgYWxwaGFDaGFubmVsUmVnRXhwID0gL1xccyooXFwuXFxkK3xcXGQrKD86XFwuXFxkKyk/KVxccyovLFxuICAgIGNzc0NvbG9yUmVnRXhwID0gbmV3IFJlZ0V4cCgnXihyZ2J8aHNsfGhzdilhPycgKyAnXFxcXCgnICsgY2hhbm5lbFJlZ0V4cC5zb3VyY2UgKyAnLCcgKyBjaGFubmVsUmVnRXhwLnNvdXJjZSArICcsJyArIGNoYW5uZWxSZWdFeHAuc291cmNlICsgJyg/OiwnICsgYWxwaGFDaGFubmVsUmVnRXhwLnNvdXJjZSArICcpPycgKyAnXFxcXCkkJywgJ2knKTtcblxuZnVuY3Rpb24gY29sb3Iob2JqKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkob2JqKSkge1xuICAgICAgICBpZiAodHlwZW9mIG9ialswXSA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIGNvbG9yW29ialswXV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIC8vIEFzc3VtZWQgYXJyYXkgZnJvbSAudG9KU09OKClcbiAgICAgICAgICAgIHJldHVybiBuZXcgY29sb3Jbb2JqWzBdXShvYmouc2xpY2UoMSwgb2JqLmxlbmd0aCkpO1xuICAgICAgICB9IGVsc2UgaWYgKG9iai5sZW5ndGggPT09IDQpIHtcbiAgICAgICAgICAgIC8vIEFzc3VtZWQgNCBlbGVtZW50IGludCBSR0IgYXJyYXkgZnJvbSBjYW52YXMgd2l0aCBhbGwgY2hhbm5lbHMgWzA7MjU1XVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBjb2xvci5SR0Iob2JqWzBdIC8gMjU1LCBvYmpbMV0gLyAyNTUsIG9ialsyXSAvIDI1NSwgb2JqWzNdIC8gMjU1KTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIG9iaiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdmFyIGxvd2VyQ2FzZWQgPSBvYmoudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKGNvbG9yLm5hbWVkQ29sb3JzW2xvd2VyQ2FzZWRdKSB7XG4gICAgICAgICAgICBvYmogPSAnIycgKyBjb2xvci5uYW1lZENvbG9yc1tsb3dlckNhc2VkXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobG93ZXJDYXNlZCA9PT0gJ3RyYW5zcGFyZW50Jykge1xuICAgICAgICAgICAgb2JqID0gJ3JnYmEoMCwwLDAsMCknO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRlc3QgZm9yIENTUyByZ2IoLi4uLikgc3RyaW5nXG4gICAgICAgIHZhciBtYXRjaENzc1N5bnRheCA9IG9iai5tYXRjaChjc3NDb2xvclJlZ0V4cCk7XG4gICAgICAgIGlmIChtYXRjaENzc1N5bnRheCkge1xuICAgICAgICAgICAgdmFyIGNvbG9yU3BhY2VOYW1lID0gbWF0Y2hDc3NTeW50YXhbMV0udG9VcHBlckNhc2UoKSxcbiAgICAgICAgICAgICAgICBhbHBoYSA9IHVuZGVmKG1hdGNoQ3NzU3ludGF4WzhdKSA/IG1hdGNoQ3NzU3ludGF4WzhdIDogcGFyc2VGbG9hdChtYXRjaENzc1N5bnRheFs4XSksXG4gICAgICAgICAgICAgICAgaGFzSHVlID0gY29sb3JTcGFjZU5hbWVbMF0gPT09ICdIJyxcbiAgICAgICAgICAgICAgICBmaXJzdENoYW5uZWxEaXZpc29yID0gbWF0Y2hDc3NTeW50YXhbM10gPyAxMDAgOiBoYXNIdWUgPyAzNjAgOiAyNTUsXG4gICAgICAgICAgICAgICAgc2Vjb25kQ2hhbm5lbERpdmlzb3IgPSBtYXRjaENzc1N5bnRheFs1XSB8fCBoYXNIdWUgPyAxMDAgOiAyNTUsXG4gICAgICAgICAgICAgICAgdGhpcmRDaGFubmVsRGl2aXNvciA9IG1hdGNoQ3NzU3ludGF4WzddIHx8IGhhc0h1ZSA/IDEwMCA6IDI1NTtcbiAgICAgICAgICAgIGlmICh1bmRlZihjb2xvcltjb2xvclNwYWNlTmFtZV0pKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb2xvci4nICsgY29sb3JTcGFjZU5hbWUgKyAnIGlzIG5vdCBpbnN0YWxsZWQuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbmV3IGNvbG9yW2NvbG9yU3BhY2VOYW1lXShwYXJzZUZsb2F0KG1hdGNoQ3NzU3ludGF4WzJdKSAvIGZpcnN0Q2hhbm5lbERpdmlzb3IsIHBhcnNlRmxvYXQobWF0Y2hDc3NTeW50YXhbNF0pIC8gc2Vjb25kQ2hhbm5lbERpdmlzb3IsIHBhcnNlRmxvYXQobWF0Y2hDc3NTeW50YXhbNl0pIC8gdGhpcmRDaGFubmVsRGl2aXNvciwgYWxwaGEpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFzc3VtZSBoZXggc3ludGF4XG4gICAgICAgIGlmIChvYmoubGVuZ3RoIDwgNikge1xuICAgICAgICAgICAgLy8gQWxsb3cgQ1NTIHNob3J0aGFuZFxuICAgICAgICAgICAgb2JqID0gb2JqLnJlcGxhY2UoL14jPyhbMC05YS1mXSkoWzAtOWEtZl0pKFswLTlhLWZdKSQvaSwgJyQxJDEkMiQyJDMkMycpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFNwbGl0IG9iaiBpbnRvIHJlZCwgZ3JlZW4sIGFuZCBibHVlIGNvbXBvbmVudHNcbiAgICAgICAgdmFyIGhleE1hdGNoID0gb2JqLm1hdGNoKC9eIz8oWzAtOWEtZl1bMC05YS1mXSkoWzAtOWEtZl1bMC05YS1mXSkoWzAtOWEtZl1bMC05YS1mXSkkL2kpO1xuICAgICAgICBpZiAoaGV4TWF0Y2gpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgY29sb3IuUkdCKHBhcnNlSW50KGhleE1hdGNoWzFdLCAxNikgLyAyNTUsIHBhcnNlSW50KGhleE1hdGNoWzJdLCAxNikgLyAyNTUsIHBhcnNlSW50KGhleE1hdGNoWzNdLCAxNikgLyAyNTUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm8gbWF0Y2ggc28gZmFyLiBMZXRzIHRyeSB0aGUgbGVzcyBsaWtlbHkgb25lc1xuICAgICAgICBpZiAoY29sb3IuQ01ZSykge1xuICAgICAgICAgICAgdmFyIGNteWtNYXRjaCA9IG9iai5tYXRjaChuZXcgUmVnRXhwKCdeY215aycgKyAnXFxcXCgnICsgcGVyY2VudGFnZUNoYW5uZWxSZWdFeHAuc291cmNlICsgJywnICsgcGVyY2VudGFnZUNoYW5uZWxSZWdFeHAuc291cmNlICsgJywnICsgcGVyY2VudGFnZUNoYW5uZWxSZWdFeHAuc291cmNlICsgJywnICsgcGVyY2VudGFnZUNoYW5uZWxSZWdFeHAuc291cmNlICsgJ1xcXFwpJCcsICdpJykpO1xuICAgICAgICAgICAgaWYgKGNteWtNYXRjaCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgY29sb3IuQ01ZSyhwYXJzZUZsb2F0KGNteWtNYXRjaFsxXSkgLyAxMDAsIHBhcnNlRmxvYXQoY215a01hdGNoWzJdKSAvIDEwMCwgcGFyc2VGbG9hdChjbXlrTWF0Y2hbM10pIC8gMTAwLCBwYXJzZUZsb2F0KGNteWtNYXRjaFs0XSkgLyAxMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIGlmICgodHlwZW9mIG9iaiA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2Yob2JqKSkgPT09ICdvYmplY3QnICYmIG9iai5pc0NvbG9yKSB7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuY29sb3IubmFtZWRDb2xvcnMgPSB7fTtcblxuY29sb3IuaW5zdGFsbENvbG9yU3BhY2UgPSBmdW5jdGlvbiAoY29sb3JTcGFjZU5hbWUsIHByb3BlcnR5TmFtZXMsIGNvbmZpZykge1xuICAgIGNvbG9yW2NvbG9yU3BhY2VOYW1lXSA9IGZ1bmN0aW9uIChhMSkge1xuICAgICAgICAvLyAuLi5cbiAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5pc0FycmF5KGExKSA/IGExIDogYXJndW1lbnRzO1xuICAgICAgICBwcm9wZXJ0eU5hbWVzLmZvckVhY2goZnVuY3Rpb24gKHByb3BlcnR5TmFtZSwgaSkge1xuICAgICAgICAgICAgdmFyIHByb3BlcnR5VmFsdWUgPSBhcmdzW2ldO1xuICAgICAgICAgICAgaWYgKHByb3BlcnR5TmFtZSA9PT0gJ2FscGhhJykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FscGhhID0gaXNOYU4ocHJvcGVydHlWYWx1ZSkgfHwgcHJvcGVydHlWYWx1ZSA+IDEgPyAxIDogcHJvcGVydHlWYWx1ZSA8IDAgPyAwIDogcHJvcGVydHlWYWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKHByb3BlcnR5VmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignWycgKyBjb2xvclNwYWNlTmFtZSArICddOiBJbnZhbGlkIGNvbG9yOiAoJyArIHByb3BlcnR5TmFtZXMuam9pbignLCcpICsgJyknKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5TmFtZSA9PT0gJ2h1ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faHVlID0gcHJvcGVydHlWYWx1ZSA8IDAgPyBwcm9wZXJ0eVZhbHVlIC0gTWF0aC5mbG9vcihwcm9wZXJ0eVZhbHVlKSA6IHByb3BlcnR5VmFsdWUgJSAxO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXNbJ18nICsgcHJvcGVydHlOYW1lXSA9IHByb3BlcnR5VmFsdWUgPCAwID8gMCA6IHByb3BlcnR5VmFsdWUgPiAxID8gMSA6IHByb3BlcnR5VmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcbiAgICB9O1xuICAgIGNvbG9yW2NvbG9yU3BhY2VOYW1lXS5wcm9wZXJ0eU5hbWVzID0gcHJvcGVydHlOYW1lcztcblxuICAgIHZhciBwcm90b3R5cGUgPSBjb2xvcltjb2xvclNwYWNlTmFtZV0ucHJvdG90eXBlO1xuXG4gICAgWyd2YWx1ZU9mJywgJ2hleCcsICdoZXhhJywgJ2NzcycsICdjc3NhJ10uZm9yRWFjaChmdW5jdGlvbiAobWV0aG9kTmFtZSkge1xuICAgICAgICBwcm90b3R5cGVbbWV0aG9kTmFtZV0gPSBwcm90b3R5cGVbbWV0aG9kTmFtZV0gfHwgKGNvbG9yU3BhY2VOYW1lID09PSAnUkdCJyA/IHByb3RvdHlwZS5oZXggOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZ2IoKVttZXRob2ROYW1lXSgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIHByb3RvdHlwZS5pc0NvbG9yID0gdHJ1ZTtcblxuICAgIHByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiAob3RoZXJDb2xvciwgZXBzaWxvbikge1xuICAgICAgICBpZiAodW5kZWYoZXBzaWxvbikpIHtcbiAgICAgICAgICAgIGVwc2lsb24gPSAxZS0xMDtcbiAgICAgICAgfVxuXG4gICAgICAgIG90aGVyQ29sb3IgPSBvdGhlckNvbG9yW2NvbG9yU3BhY2VOYW1lLnRvTG93ZXJDYXNlKCldKCk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wZXJ0eU5hbWVzLmxlbmd0aDsgaSA9IGkgKyAxKSB7XG4gICAgICAgICAgICBpZiAoTWF0aC5hYnModGhpc1snXycgKyBwcm9wZXJ0eU5hbWVzW2ldXSAtIG90aGVyQ29sb3JbJ18nICsgcHJvcGVydHlOYW1lc1tpXV0pID4gZXBzaWxvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBwcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gW2NvbG9yU3BhY2VOYW1lXS5jb25jYXQocHJvcGVydHlOYW1lcy5tYXAoZnVuY3Rpb24gKHByb3BlcnR5TmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXNbJ18nICsgcHJvcGVydHlOYW1lXTtcbiAgICAgICAgfSwgdGhpcykpO1xuICAgIH07XG5cbiAgICBmb3IgKHZhciBwcm9wZXJ0eU5hbWUgaW4gY29uZmlnKSB7XG4gICAgICAgIGlmIChjb25maWcuaGFzT3duUHJvcGVydHkocHJvcGVydHlOYW1lKSkge1xuICAgICAgICAgICAgdmFyIG1hdGNoRnJvbUNvbG9yU3BhY2UgPSBwcm9wZXJ0eU5hbWUubWF0Y2goL15mcm9tKC4qKSQvKTtcbiAgICAgICAgICAgIGlmIChtYXRjaEZyb21Db2xvclNwYWNlKSB7XG4gICAgICAgICAgICAgICAgY29sb3JbbWF0Y2hGcm9tQ29sb3JTcGFjZVsxXS50b1VwcGVyQ2FzZSgpXS5wcm90b3R5cGVbY29sb3JTcGFjZU5hbWUudG9Mb3dlckNhc2UoKV0gPSBjb25maWdbcHJvcGVydHlOYW1lXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcHJvdG90eXBlW3Byb3BlcnR5TmFtZV0gPSBjb25maWdbcHJvcGVydHlOYW1lXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEl0IGlzIHByZXR0eSBlYXN5IHRvIGltcGxlbWVudCB0aGUgY29udmVyc2lvbiB0byB0aGUgc2FtZSBjb2xvciBzcGFjZTpcbiAgICBwcm90b3R5cGVbY29sb3JTcGFjZU5hbWUudG9Mb3dlckNhc2UoKV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgcHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJ1snICsgY29sb3JTcGFjZU5hbWUgKyAnICcgKyBwcm9wZXJ0eU5hbWVzLm1hcChmdW5jdGlvbiAocHJvcGVydHlOYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpc1snXycgKyBwcm9wZXJ0eU5hbWVdO1xuICAgICAgICB9LCB0aGlzKS5qb2luKCcsICcpICsgJ10nO1xuICAgIH07XG5cbiAgICAvLyBHZW5lcmF0ZSBnZXR0ZXJzIGFuZCBzZXR0ZXJzXG4gICAgcHJvcGVydHlOYW1lcy5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wZXJ0eU5hbWUpIHtcbiAgICAgICAgdmFyIHNob3J0TmFtZSA9IHByb3BlcnR5TmFtZSA9PT0gJ2JsYWNrJyA/ICdrJyA6IHByb3BlcnR5TmFtZS5jaGFyQXQoMCk7XG4gICAgICAgIHByb3RvdHlwZVtwcm9wZXJ0eU5hbWVdID0gcHJvdG90eXBlW3Nob3J0TmFtZV0gPSBmdW5jdGlvbiAodmFsdWUsIGlzRGVsdGEpIHtcbiAgICAgICAgICAgIC8vIFNpbXBsZSBnZXR0ZXIgbW9kZTogY29sb3IucmVkKClcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNbJ18nICsgcHJvcGVydHlOYW1lXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNEZWx0YSkge1xuICAgICAgICAgICAgICAgIC8vIEFkanVzdGVyOiBjb2xvci5yZWQoKy4yLCB0cnVlKVxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3Rvcihwcm9wZXJ0eU5hbWVzLm1hcChmdW5jdGlvbiAob3RoZXJQcm9wZXJ0eU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNbJ18nICsgb3RoZXJQcm9wZXJ0eU5hbWVdICsgKHByb3BlcnR5TmFtZSA9PT0gb3RoZXJQcm9wZXJ0eU5hbWUgPyB2YWx1ZSA6IDApO1xuICAgICAgICAgICAgICAgIH0sIHRoaXMpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gU2V0dGVyOiBjb2xvci5yZWQoLjIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3Rvcihwcm9wZXJ0eU5hbWVzLm1hcChmdW5jdGlvbiAob3RoZXJQcm9wZXJ0eU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByb3BlcnR5TmFtZSA9PT0gb3RoZXJQcm9wZXJ0eU5hbWUgPyB2YWx1ZSA6IHRoaXNbJ18nICsgb3RoZXJQcm9wZXJ0eU5hbWVdO1xuICAgICAgICAgICAgICAgIH0sIHRoaXMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIGluc3RhbGxGb3JlaWduTWV0aG9kcyh0YXJnZXRDb2xvclNwYWNlTmFtZSwgc291cmNlQ29sb3JTcGFjZU5hbWUpIHtcbiAgICAgICAgdmFyIG9iaiA9IHt9O1xuICAgICAgICBvYmpbc291cmNlQ29sb3JTcGFjZU5hbWUudG9Mb3dlckNhc2UoKV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZ2IoKVtzb3VyY2VDb2xvclNwYWNlTmFtZS50b0xvd2VyQ2FzZSgpXSgpO1xuICAgICAgICB9O1xuICAgICAgICBjb2xvcltzb3VyY2VDb2xvclNwYWNlTmFtZV0ucHJvcGVydHlOYW1lcy5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wZXJ0eU5hbWUpIHtcbiAgICAgICAgICAgIHZhciBzaG9ydE5hbWUgPSBwcm9wZXJ0eU5hbWUgPT09ICdibGFjaycgPyAnaycgOiBwcm9wZXJ0eU5hbWUuY2hhckF0KDApO1xuICAgICAgICAgICAgb2JqW3Byb3BlcnR5TmFtZV0gPSBvYmpbc2hvcnROYW1lXSA9IGZ1bmN0aW9uICh2YWx1ZSwgaXNEZWx0YSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzW3NvdXJjZUNvbG9yU3BhY2VOYW1lLnRvTG93ZXJDYXNlKCldKClbcHJvcGVydHlOYW1lXSh2YWx1ZSwgaXNEZWx0YSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBvYmopIHtcbiAgICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkocHJvcCkgJiYgY29sb3JbdGFyZ2V0Q29sb3JTcGFjZU5hbWVdLnByb3RvdHlwZVtwcm9wXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgY29sb3JbdGFyZ2V0Q29sb3JTcGFjZU5hbWVdLnByb3RvdHlwZVtwcm9wXSA9IG9ialtwcm9wXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGluc3RhbGxlZENvbG9yU3BhY2VzLmZvckVhY2goZnVuY3Rpb24gKG90aGVyQ29sb3JTcGFjZU5hbWUpIHtcbiAgICAgICAgaW5zdGFsbEZvcmVpZ25NZXRob2RzKGNvbG9yU3BhY2VOYW1lLCBvdGhlckNvbG9yU3BhY2VOYW1lKTtcbiAgICAgICAgaW5zdGFsbEZvcmVpZ25NZXRob2RzKG90aGVyQ29sb3JTcGFjZU5hbWUsIGNvbG9yU3BhY2VOYW1lKTtcbiAgICB9KTtcblxuICAgIGluc3RhbGxlZENvbG9yU3BhY2VzLnB1c2goY29sb3JTcGFjZU5hbWUpO1xuICAgIHJldHVybiBjb2xvcjtcbn07XG5cbmNvbG9yLnBsdWdpbkxpc3QgPSBbXTtcblxuY29sb3IudXNlID0gZnVuY3Rpb24gKHBsdWdpbikge1xuICAgIGlmIChjb2xvci5wbHVnaW5MaXN0LmluZGV4T2YocGx1Z2luKSA9PT0gLTEpIHtcbiAgICAgICAgdGhpcy5wbHVnaW5MaXN0LnB1c2gocGx1Z2luKTtcbiAgICAgICAgcGx1Z2luKGNvbG9yKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbG9yO1xufTtcblxuY29sb3IuaW5zdGFsbE1ldGhvZCA9IGZ1bmN0aW9uIChuYW1lLCBmbikge1xuICAgIGluc3RhbGxlZENvbG9yU3BhY2VzLmZvckVhY2goZnVuY3Rpb24gKGNvbG9yU3BhY2UpIHtcbiAgICAgICAgY29sb3JbY29sb3JTcGFjZV0ucHJvdG90eXBlW25hbWVdID0gZm47XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5jb2xvci5pbnN0YWxsQ29sb3JTcGFjZSgnUkdCJywgWydyZWQnLCAnZ3JlZW4nLCAnYmx1ZScsICdhbHBoYSddLCB7XG4gICAgaGV4OiBmdW5jdGlvbiBoZXgoKSB7XG4gICAgICAgIHZhciBoZXhTdHJpbmcgPSAoTWF0aC5yb3VuZCgyNTUgKiB0aGlzLl9yZWQpICogMHgxMDAwMCArIE1hdGgucm91bmQoMjU1ICogdGhpcy5fZ3JlZW4pICogMHgxMDAgKyBNYXRoLnJvdW5kKDI1NSAqIHRoaXMuX2JsdWUpKS50b1N0cmluZygxNik7XG4gICAgICAgIHJldHVybiAnIycgKyAnMDAwMDAnLnN1YnN0cigwLCA2IC0gaGV4U3RyaW5nLmxlbmd0aCkgKyBoZXhTdHJpbmc7XG4gICAgfSxcblxuICAgIGhleGE6IGZ1bmN0aW9uIGhleGEoKSB7XG4gICAgICAgIHZhciBhbHBoYVN0cmluZyA9IE1hdGgucm91bmQodGhpcy5fYWxwaGEgKiAyNTUpLnRvU3RyaW5nKDE2KTtcbiAgICAgICAgcmV0dXJuICcjJyArICcwMCcuc3Vic3RyKDAsIDIgLSBhbHBoYVN0cmluZy5sZW5ndGgpICsgYWxwaGFTdHJpbmcgKyB0aGlzLmhleCgpLnN1YnN0cigxLCA2KTtcbiAgICB9LFxuXG4gICAgY3NzOiBmdW5jdGlvbiBjc3MoKSB7XG4gICAgICAgIHJldHVybiAncmdiKCcgKyBNYXRoLnJvdW5kKDI1NSAqIHRoaXMuX3JlZCkgKyAnLCcgKyBNYXRoLnJvdW5kKDI1NSAqIHRoaXMuX2dyZWVuKSArICcsJyArIE1hdGgucm91bmQoMjU1ICogdGhpcy5fYmx1ZSkgKyAnKSc7XG4gICAgfSxcblxuICAgIGNzc2E6IGZ1bmN0aW9uIGNzc2EoKSB7XG4gICAgICAgIHJldHVybiAncmdiYSgnICsgTWF0aC5yb3VuZCgyNTUgKiB0aGlzLl9yZWQpICsgJywnICsgTWF0aC5yb3VuZCgyNTUgKiB0aGlzLl9ncmVlbikgKyAnLCcgKyBNYXRoLnJvdW5kKDI1NSAqIHRoaXMuX2JsdWUpICsgJywnICsgdGhpcy5fYWxwaGEgKyAnKSc7XG4gICAgfVxufSk7XG5cbnZhciBjb2xvcl8xID0gY29sb3I7XG5cbnZhciBYWVogPSBmdW5jdGlvbiBYWVooY29sb3IpIHtcbiAgICBjb2xvci5pbnN0YWxsQ29sb3JTcGFjZSgnWFlaJywgWyd4JywgJ3knLCAneicsICdhbHBoYSddLCB7XG4gICAgICAgIGZyb21SZ2I6IGZ1bmN0aW9uIGZyb21SZ2IoKSB7XG4gICAgICAgICAgICAvLyBodHRwOi8vd3d3LmVhc3lyZ2IuY29tL2luZGV4LnBocD9YPU1BVEgmSD0wMiN0ZXh0MlxuICAgICAgICAgICAgdmFyIGNvbnZlcnQgPSBmdW5jdGlvbiBjb252ZXJ0KGNoYW5uZWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2hhbm5lbCA+IDAuMDQwNDUgPyBNYXRoLnBvdygoY2hhbm5lbCArIDAuMDU1KSAvIDEuMDU1LCAyLjQpIDogY2hhbm5lbCAvIDEyLjkyO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByID0gY29udmVydCh0aGlzLl9yZWQpLFxuICAgICAgICAgICAgICAgIGcgPSBjb252ZXJ0KHRoaXMuX2dyZWVuKSxcbiAgICAgICAgICAgICAgICBiID0gY29udmVydCh0aGlzLl9ibHVlKTtcblxuICAgICAgICAgICAgLy8gUmVmZXJlbmNlIHdoaXRlIHBvaW50IHNSR0IgRDY1OlxuICAgICAgICAgICAgLy8gaHR0cDovL3d3dy5icnVjZWxpbmRibG9vbS5jb20vaW5kZXguaHRtbD9FcW5fUkdCX1hZWl9NYXRyaXguaHRtbFxuICAgICAgICAgICAgcmV0dXJuIG5ldyBjb2xvci5YWVoociAqIDAuNDEyNDU2NCArIGcgKiAwLjM1NzU3NjEgKyBiICogMC4xODA0Mzc1LCByICogMC4yMTI2NzI5ICsgZyAqIDAuNzE1MTUyMiArIGIgKiAwLjA3MjE3NTAsIHIgKiAwLjAxOTMzMzkgKyBnICogMC4xMTkxOTIwICsgYiAqIDAuOTUwMzA0MSwgdGhpcy5fYWxwaGEpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJnYjogZnVuY3Rpb24gcmdiKCkge1xuICAgICAgICAgICAgLy8gaHR0cDovL3d3dy5lYXN5cmdiLmNvbS9pbmRleC5waHA/WD1NQVRIJkg9MDEjdGV4dDFcbiAgICAgICAgICAgIHZhciB4ID0gdGhpcy5feCxcbiAgICAgICAgICAgICAgICB5ID0gdGhpcy5feSxcbiAgICAgICAgICAgICAgICB6ID0gdGhpcy5feixcbiAgICAgICAgICAgICAgICBjb252ZXJ0ID0gZnVuY3Rpb24gY29udmVydChjaGFubmVsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoYW5uZWwgPiAwLjAwMzEzMDggPyAxLjA1NSAqIE1hdGgucG93KGNoYW5uZWwsIDEgLyAyLjQpIC0gMC4wNTUgOiAxMi45MiAqIGNoYW5uZWw7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBSZWZlcmVuY2Ugd2hpdGUgcG9pbnQgc1JHQiBENjU6XG4gICAgICAgICAgICAvLyBodHRwOi8vd3d3LmJydWNlbGluZGJsb29tLmNvbS9pbmRleC5odG1sP0Vxbl9SR0JfWFlaX01hdHJpeC5odG1sXG4gICAgICAgICAgICByZXR1cm4gbmV3IGNvbG9yLlJHQihjb252ZXJ0KHggKiAzLjI0MDQ1NDIgKyB5ICogLTEuNTM3MTM4NSArIHogKiAtMC40OTg1MzE0KSwgY29udmVydCh4ICogLTAuOTY5MjY2MCArIHkgKiAxLjg3NjAxMDggKyB6ICogMC4wNDE1NTYwKSwgY29udmVydCh4ICogMC4wNTU2NDM0ICsgeSAqIC0wLjIwNDAyNTkgKyB6ICogMS4wNTcyMjUyKSwgdGhpcy5fYWxwaGEpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGxhYjogZnVuY3Rpb24gbGFiKCkge1xuICAgICAgICAgICAgLy8gaHR0cDovL3d3dy5lYXN5cmdiLmNvbS9pbmRleC5waHA/WD1NQVRIJkg9MDcjdGV4dDdcbiAgICAgICAgICAgIHZhciBjb252ZXJ0ID0gZnVuY3Rpb24gY29udmVydChjaGFubmVsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoYW5uZWwgPiAwLjAwODg1NiA/IE1hdGgucG93KGNoYW5uZWwsIDEgLyAzKSA6IDcuNzg3MDM3ICogY2hhbm5lbCArIDQgLyAyOTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgeCA9IGNvbnZlcnQodGhpcy5feCAvIDk1LjA0NyksXG4gICAgICAgICAgICAgICAgeSA9IGNvbnZlcnQodGhpcy5feSAvIDEwMC4wMDApLFxuICAgICAgICAgICAgICAgIHogPSBjb252ZXJ0KHRoaXMuX3ogLyAxMDguODgzKTtcblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBjb2xvci5MQUIoMTE2ICogeSAtIDE2LCA1MDAgKiAoeCAtIHkpLCAyMDAgKiAoeSAtIHopLCB0aGlzLl9hbHBoYSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbnZhciBMQUIgPSBmdW5jdGlvbiBMQUIoY29sb3IpIHtcbiAgICBjb2xvci51c2UoWFlaKTtcblxuICAgIGNvbG9yLmluc3RhbGxDb2xvclNwYWNlKCdMQUInLCBbJ2wnLCAnYScsICdiJywgJ2FscGhhJ10sIHtcbiAgICAgICAgZnJvbVJnYjogZnVuY3Rpb24gZnJvbVJnYigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnh5eigpLmxhYigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJnYjogZnVuY3Rpb24gcmdiKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMueHl6KCkucmdiKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgeHl6OiBmdW5jdGlvbiB4eXooKSB7XG4gICAgICAgICAgICAvLyBodHRwOi8vd3d3LmVhc3lyZ2IuY29tL2luZGV4LnBocD9YPU1BVEgmSD0wOCN0ZXh0OFxuICAgICAgICAgICAgdmFyIGNvbnZlcnQgPSBmdW5jdGlvbiBjb252ZXJ0KGNoYW5uZWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgcG93ID0gTWF0aC5wb3coY2hhbm5lbCwgMyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBvdyA+IDAuMDA4ODU2ID8gcG93IDogKGNoYW5uZWwgLSAxNiAvIDExNikgLyA3Ljg3O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB5ID0gKHRoaXMuX2wgKyAxNikgLyAxMTYsXG4gICAgICAgICAgICAgICAgeCA9IHRoaXMuX2EgLyA1MDAgKyB5LFxuICAgICAgICAgICAgICAgIHogPSB5IC0gdGhpcy5fYiAvIDIwMDtcblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBjb2xvci5YWVooY29udmVydCh4KSAqIDk1LjA0NywgY29udmVydCh5KSAqIDEwMC4wMDAsIGNvbnZlcnQoeikgKiAxMDguODgzLCB0aGlzLl9hbHBoYSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbnZhciBIU1YgPSBmdW5jdGlvbiBIU1YoY29sb3IpIHtcbiAgICBjb2xvci5pbnN0YWxsQ29sb3JTcGFjZSgnSFNWJywgWydodWUnLCAnc2F0dXJhdGlvbicsICd2YWx1ZScsICdhbHBoYSddLCB7XG4gICAgICAgIHJnYjogZnVuY3Rpb24gcmdiKCkge1xuICAgICAgICAgICAgdmFyIGh1ZSA9IHRoaXMuX2h1ZSxcbiAgICAgICAgICAgICAgICBzYXR1cmF0aW9uID0gdGhpcy5fc2F0dXJhdGlvbixcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoaXMuX3ZhbHVlLFxuICAgICAgICAgICAgICAgIGkgPSBNYXRoLm1pbig1LCBNYXRoLmZsb29yKGh1ZSAqIDYpKSxcbiAgICAgICAgICAgICAgICBmID0gaHVlICogNiAtIGksXG4gICAgICAgICAgICAgICAgcCA9IHZhbHVlICogKDEgLSBzYXR1cmF0aW9uKSxcbiAgICAgICAgICAgICAgICBxID0gdmFsdWUgKiAoMSAtIGYgKiBzYXR1cmF0aW9uKSxcbiAgICAgICAgICAgICAgICB0ID0gdmFsdWUgKiAoMSAtICgxIC0gZikgKiBzYXR1cmF0aW9uKSxcbiAgICAgICAgICAgICAgICByZWQsXG4gICAgICAgICAgICAgICAgZ3JlZW4sXG4gICAgICAgICAgICAgICAgYmx1ZTtcbiAgICAgICAgICAgIHN3aXRjaCAoaSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgcmVkID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGdyZWVuID0gdDtcbiAgICAgICAgICAgICAgICAgICAgYmx1ZSA9IHA7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgcmVkID0gcTtcbiAgICAgICAgICAgICAgICAgICAgZ3JlZW4gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYmx1ZSA9IHA7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgcmVkID0gcDtcbiAgICAgICAgICAgICAgICAgICAgZ3JlZW4gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYmx1ZSA9IHQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgcmVkID0gcDtcbiAgICAgICAgICAgICAgICAgICAgZ3JlZW4gPSBxO1xuICAgICAgICAgICAgICAgICAgICBibHVlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICAgICAgcmVkID0gdDtcbiAgICAgICAgICAgICAgICAgICAgZ3JlZW4gPSBwO1xuICAgICAgICAgICAgICAgICAgICBibHVlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgICAgICAgICAgcmVkID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGdyZWVuID0gcDtcbiAgICAgICAgICAgICAgICAgICAgYmx1ZSA9IHE7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBjb2xvci5SR0IocmVkLCBncmVlbiwgYmx1ZSwgdGhpcy5fYWxwaGEpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhzbDogZnVuY3Rpb24gaHNsKCkge1xuICAgICAgICAgICAgdmFyIGwgPSAoMiAtIHRoaXMuX3NhdHVyYXRpb24pICogdGhpcy5fdmFsdWUsXG4gICAgICAgICAgICAgICAgc3YgPSB0aGlzLl9zYXR1cmF0aW9uICogdGhpcy5fdmFsdWUsXG4gICAgICAgICAgICAgICAgc3ZEaXZpc29yID0gbCA8PSAxID8gbCA6IDIgLSBsLFxuICAgICAgICAgICAgICAgIHNhdHVyYXRpb247XG5cbiAgICAgICAgICAgIC8vIEF2b2lkIGRpdmlzaW9uIGJ5IHplcm8gd2hlbiBsaWdodG5lc3MgYXBwcm9hY2hlcyB6ZXJvOlxuICAgICAgICAgICAgaWYgKHN2RGl2aXNvciA8IDFlLTkpIHtcbiAgICAgICAgICAgICAgICBzYXR1cmF0aW9uID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2F0dXJhdGlvbiA9IHN2IC8gc3ZEaXZpc29yO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBjb2xvci5IU0wodGhpcy5faHVlLCBzYXR1cmF0aW9uLCBsIC8gMiwgdGhpcy5fYWxwaGEpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZyb21SZ2I6IGZ1bmN0aW9uIGZyb21SZ2IoKSB7XG4gICAgICAgICAgICAvLyBCZWNvbWVzIG9uZS5jb2xvci5SR0IucHJvdG90eXBlLmhzdlxuICAgICAgICAgICAgdmFyIHJlZCA9IHRoaXMuX3JlZCxcbiAgICAgICAgICAgICAgICBncmVlbiA9IHRoaXMuX2dyZWVuLFxuICAgICAgICAgICAgICAgIGJsdWUgPSB0aGlzLl9ibHVlLFxuICAgICAgICAgICAgICAgIG1heCA9IE1hdGgubWF4KHJlZCwgZ3JlZW4sIGJsdWUpLFxuICAgICAgICAgICAgICAgIG1pbiA9IE1hdGgubWluKHJlZCwgZ3JlZW4sIGJsdWUpLFxuICAgICAgICAgICAgICAgIGRlbHRhID0gbWF4IC0gbWluLFxuICAgICAgICAgICAgICAgIGh1ZSxcbiAgICAgICAgICAgICAgICBzYXR1cmF0aW9uID0gbWF4ID09PSAwID8gMCA6IGRlbHRhIC8gbWF4LFxuICAgICAgICAgICAgICAgIHZhbHVlID0gbWF4O1xuICAgICAgICAgICAgaWYgKGRlbHRhID09PSAwKSB7XG4gICAgICAgICAgICAgICAgaHVlID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChtYXgpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSByZWQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBodWUgPSAoZ3JlZW4gLSBibHVlKSAvIGRlbHRhIC8gNiArIChncmVlbiA8IGJsdWUgPyAxIDogMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBncmVlbjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGh1ZSA9IChibHVlIC0gcmVkKSAvIGRlbHRhIC8gNiArIDEgLyAzO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmx1ZTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGh1ZSA9IChyZWQgLSBncmVlbikgLyBkZWx0YSAvIDYgKyAyIC8gMztcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBuZXcgY29sb3IuSFNWKGh1ZSwgc2F0dXJhdGlvbiwgdmFsdWUsIHRoaXMuX2FscGhhKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxudmFyIEhTTCA9IGZ1bmN0aW9uIEhTTChjb2xvcikge1xuICAgIGNvbG9yLnVzZShIU1YpO1xuXG4gICAgY29sb3IuaW5zdGFsbENvbG9yU3BhY2UoJ0hTTCcsIFsnaHVlJywgJ3NhdHVyYXRpb24nLCAnbGlnaHRuZXNzJywgJ2FscGhhJ10sIHtcbiAgICAgICAgaHN2OiBmdW5jdGlvbiBoc3YoKSB7XG4gICAgICAgICAgICAvLyBBbGdvcml0aG0gYWRhcHRlZCBmcm9tIGh0dHA6Ly93aWtpLnNlY29uZGxpZmUuY29tL3dpa2kvQ29sb3JfY29udmVyc2lvbl9zY3JpcHRzXG4gICAgICAgICAgICB2YXIgbCA9IHRoaXMuX2xpZ2h0bmVzcyAqIDIsXG4gICAgICAgICAgICAgICAgcyA9IHRoaXMuX3NhdHVyYXRpb24gKiAobCA8PSAxID8gbCA6IDIgLSBsKSxcbiAgICAgICAgICAgICAgICBzYXR1cmF0aW9uO1xuXG4gICAgICAgICAgICAvLyBBdm9pZCBkaXZpc2lvbiBieSB6ZXJvIHdoZW4gbCArIHMgaXMgdmVyeSBzbWFsbCAoYXBwcm9hY2hpbmcgYmxhY2spOlxuICAgICAgICAgICAgaWYgKGwgKyBzIDwgMWUtOSkge1xuICAgICAgICAgICAgICAgIHNhdHVyYXRpb24gPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzYXR1cmF0aW9uID0gMiAqIHMgLyAobCArIHMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbmV3IGNvbG9yLkhTVih0aGlzLl9odWUsIHNhdHVyYXRpb24sIChsICsgcykgLyAyLCB0aGlzLl9hbHBoYSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmdiOiBmdW5jdGlvbiByZ2IoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oc3YoKS5yZ2IoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBmcm9tUmdiOiBmdW5jdGlvbiBmcm9tUmdiKCkge1xuICAgICAgICAgICAgLy8gQmVjb21lcyBvbmUuY29sb3IuUkdCLnByb3RvdHlwZS5oc3ZcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhzdigpLmhzbCgpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG52YXIgQ01ZSyA9IGZ1bmN0aW9uIENNWUsoY29sb3IpIHtcbiAgICBjb2xvci5pbnN0YWxsQ29sb3JTcGFjZSgnQ01ZSycsIFsnY3lhbicsICdtYWdlbnRhJywgJ3llbGxvdycsICdibGFjaycsICdhbHBoYSddLCB7XG4gICAgICAgIHJnYjogZnVuY3Rpb24gcmdiKCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBjb2xvci5SR0IoMSAtIHRoaXMuX2N5YW4gKiAoMSAtIHRoaXMuX2JsYWNrKSAtIHRoaXMuX2JsYWNrLCAxIC0gdGhpcy5fbWFnZW50YSAqICgxIC0gdGhpcy5fYmxhY2spIC0gdGhpcy5fYmxhY2ssIDEgLSB0aGlzLl95ZWxsb3cgKiAoMSAtIHRoaXMuX2JsYWNrKSAtIHRoaXMuX2JsYWNrLCB0aGlzLl9hbHBoYSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZnJvbVJnYjogZnVuY3Rpb24gZnJvbVJnYigpIHtcbiAgICAgICAgICAgIC8vIEJlY29tZXMgb25lLmNvbG9yLlJHQi5wcm90b3R5cGUuY215a1xuICAgICAgICAgICAgLy8gQWRhcHRlZCBmcm9tIGh0dHA6Ly93d3cuamF2YXNjcmlwdGVyLm5ldC9mYXEvcmdiMmNteWsuaHRtXG4gICAgICAgICAgICB2YXIgcmVkID0gdGhpcy5fcmVkLFxuICAgICAgICAgICAgICAgIGdyZWVuID0gdGhpcy5fZ3JlZW4sXG4gICAgICAgICAgICAgICAgYmx1ZSA9IHRoaXMuX2JsdWUsXG4gICAgICAgICAgICAgICAgY3lhbiA9IDEgLSByZWQsXG4gICAgICAgICAgICAgICAgbWFnZW50YSA9IDEgLSBncmVlbixcbiAgICAgICAgICAgICAgICB5ZWxsb3cgPSAxIC0gYmx1ZSxcbiAgICAgICAgICAgICAgICBibGFjayA9IDE7XG4gICAgICAgICAgICBpZiAocmVkIHx8IGdyZWVuIHx8IGJsdWUpIHtcbiAgICAgICAgICAgICAgICBibGFjayA9IE1hdGgubWluKGN5YW4sIE1hdGgubWluKG1hZ2VudGEsIHllbGxvdykpO1xuICAgICAgICAgICAgICAgIGN5YW4gPSAoY3lhbiAtIGJsYWNrKSAvICgxIC0gYmxhY2spO1xuICAgICAgICAgICAgICAgIG1hZ2VudGEgPSAobWFnZW50YSAtIGJsYWNrKSAvICgxIC0gYmxhY2spO1xuICAgICAgICAgICAgICAgIHllbGxvdyA9ICh5ZWxsb3cgLSBibGFjaykgLyAoMSAtIGJsYWNrKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmxhY2sgPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBjb2xvci5DTVlLKGN5YW4sIG1hZ2VudGEsIHllbGxvdywgYmxhY2ssIHRoaXMuX2FscGhhKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxudmFyIG5hbWVkQ29sb3JzID0gZnVuY3Rpb24gbmFtZWRDb2xvcnMoY29sb3IpIHtcbiAgICBjb2xvci5uYW1lZENvbG9ycyA9IHtcbiAgICAgICAgYWxpY2VibHVlOiAnZjBmOGZmJyxcbiAgICAgICAgYW50aXF1ZXdoaXRlOiAnZmFlYmQ3JyxcbiAgICAgICAgYXF1YTogJzBmZicsXG4gICAgICAgIGFxdWFtYXJpbmU6ICc3ZmZmZDQnLFxuICAgICAgICBhenVyZTogJ2YwZmZmZicsXG4gICAgICAgIGJlaWdlOiAnZjVmNWRjJyxcbiAgICAgICAgYmlzcXVlOiAnZmZlNGM0JyxcbiAgICAgICAgYmxhY2s6ICcwMDAnLFxuICAgICAgICBibGFuY2hlZGFsbW9uZDogJ2ZmZWJjZCcsXG4gICAgICAgIGJsdWU6ICcwMGYnLFxuICAgICAgICBibHVldmlvbGV0OiAnOGEyYmUyJyxcbiAgICAgICAgYnJvd246ICdhNTJhMmEnLFxuICAgICAgICBidXJseXdvb2Q6ICdkZWI4ODcnLFxuICAgICAgICBjYWRldGJsdWU6ICc1ZjllYTAnLFxuICAgICAgICBjaGFydHJldXNlOiAnN2ZmZjAwJyxcbiAgICAgICAgY2hvY29sYXRlOiAnZDI2OTFlJyxcbiAgICAgICAgY29yYWw6ICdmZjdmNTAnLFxuICAgICAgICBjb3JuZmxvd2VyYmx1ZTogJzY0OTVlZCcsXG4gICAgICAgIGNvcm5zaWxrOiAnZmZmOGRjJyxcbiAgICAgICAgY3JpbXNvbjogJ2RjMTQzYycsXG4gICAgICAgIGN5YW46ICcwZmYnLFxuICAgICAgICBkYXJrYmx1ZTogJzAwMDA4YicsXG4gICAgICAgIGRhcmtjeWFuOiAnMDA4YjhiJyxcbiAgICAgICAgZGFya2dvbGRlbnJvZDogJ2I4ODYwYicsXG4gICAgICAgIGRhcmtncmF5OiAnYTlhOWE5JyxcbiAgICAgICAgZGFya2dyZXk6ICdhOWE5YTknLFxuICAgICAgICBkYXJrZ3JlZW46ICcwMDY0MDAnLFxuICAgICAgICBkYXJra2hha2k6ICdiZGI3NmInLFxuICAgICAgICBkYXJrbWFnZW50YTogJzhiMDA4YicsXG4gICAgICAgIGRhcmtvbGl2ZWdyZWVuOiAnNTU2YjJmJyxcbiAgICAgICAgZGFya29yYW5nZTogJ2ZmOGMwMCcsXG4gICAgICAgIGRhcmtvcmNoaWQ6ICc5OTMyY2MnLFxuICAgICAgICBkYXJrcmVkOiAnOGIwMDAwJyxcbiAgICAgICAgZGFya3NhbG1vbjogJ2U5OTY3YScsXG4gICAgICAgIGRhcmtzZWFncmVlbjogJzhmYmM4ZicsXG4gICAgICAgIGRhcmtzbGF0ZWJsdWU6ICc0ODNkOGInLFxuICAgICAgICBkYXJrc2xhdGVncmF5OiAnMmY0ZjRmJyxcbiAgICAgICAgZGFya3NsYXRlZ3JleTogJzJmNGY0ZicsXG4gICAgICAgIGRhcmt0dXJxdW9pc2U6ICcwMGNlZDEnLFxuICAgICAgICBkYXJrdmlvbGV0OiAnOTQwMGQzJyxcbiAgICAgICAgZGVlcHBpbms6ICdmZjE0OTMnLFxuICAgICAgICBkZWVwc2t5Ymx1ZTogJzAwYmZmZicsXG4gICAgICAgIGRpbWdyYXk6ICc2OTY5NjknLFxuICAgICAgICBkaW1ncmV5OiAnNjk2OTY5JyxcbiAgICAgICAgZG9kZ2VyYmx1ZTogJzFlOTBmZicsXG4gICAgICAgIGZpcmVicmljazogJ2IyMjIyMicsXG4gICAgICAgIGZsb3JhbHdoaXRlOiAnZmZmYWYwJyxcbiAgICAgICAgZm9yZXN0Z3JlZW46ICcyMjhiMjInLFxuICAgICAgICBmdWNoc2lhOiAnZjBmJyxcbiAgICAgICAgZ2FpbnNib3JvOiAnZGNkY2RjJyxcbiAgICAgICAgZ2hvc3R3aGl0ZTogJ2Y4ZjhmZicsXG4gICAgICAgIGdvbGQ6ICdmZmQ3MDAnLFxuICAgICAgICBnb2xkZW5yb2Q6ICdkYWE1MjAnLFxuICAgICAgICBncmF5OiAnODA4MDgwJyxcbiAgICAgICAgZ3JleTogJzgwODA4MCcsXG4gICAgICAgIGdyZWVuOiAnMDA4MDAwJyxcbiAgICAgICAgZ3JlZW55ZWxsb3c6ICdhZGZmMmYnLFxuICAgICAgICBob25leWRldzogJ2YwZmZmMCcsXG4gICAgICAgIGhvdHBpbms6ICdmZjY5YjQnLFxuICAgICAgICBpbmRpYW5yZWQ6ICdjZDVjNWMnLFxuICAgICAgICBpbmRpZ286ICc0YjAwODInLFxuICAgICAgICBpdm9yeTogJ2ZmZmZmMCcsXG4gICAgICAgIGtoYWtpOiAnZjBlNjhjJyxcbiAgICAgICAgbGF2ZW5kZXI6ICdlNmU2ZmEnLFxuICAgICAgICBsYXZlbmRlcmJsdXNoOiAnZmZmMGY1JyxcbiAgICAgICAgbGF3bmdyZWVuOiAnN2NmYzAwJyxcbiAgICAgICAgbGVtb25jaGlmZm9uOiAnZmZmYWNkJyxcbiAgICAgICAgbGlnaHRibHVlOiAnYWRkOGU2JyxcbiAgICAgICAgbGlnaHRjb3JhbDogJ2YwODA4MCcsXG4gICAgICAgIGxpZ2h0Y3lhbjogJ2UwZmZmZicsXG4gICAgICAgIGxpZ2h0Z29sZGVucm9keWVsbG93OiAnZmFmYWQyJyxcbiAgICAgICAgbGlnaHRncmF5OiAnZDNkM2QzJyxcbiAgICAgICAgbGlnaHRncmV5OiAnZDNkM2QzJyxcbiAgICAgICAgbGlnaHRncmVlbjogJzkwZWU5MCcsXG4gICAgICAgIGxpZ2h0cGluazogJ2ZmYjZjMScsXG4gICAgICAgIGxpZ2h0c2FsbW9uOiAnZmZhMDdhJyxcbiAgICAgICAgbGlnaHRzZWFncmVlbjogJzIwYjJhYScsXG4gICAgICAgIGxpZ2h0c2t5Ymx1ZTogJzg3Y2VmYScsXG4gICAgICAgIGxpZ2h0c2xhdGVncmF5OiAnNzg5JyxcbiAgICAgICAgbGlnaHRzbGF0ZWdyZXk6ICc3ODknLFxuICAgICAgICBsaWdodHN0ZWVsYmx1ZTogJ2IwYzRkZScsXG4gICAgICAgIGxpZ2h0eWVsbG93OiAnZmZmZmUwJyxcbiAgICAgICAgbGltZTogJzBmMCcsXG4gICAgICAgIGxpbWVncmVlbjogJzMyY2QzMicsXG4gICAgICAgIGxpbmVuOiAnZmFmMGU2JyxcbiAgICAgICAgbWFnZW50YTogJ2YwZicsXG4gICAgICAgIG1hcm9vbjogJzgwMDAwMCcsXG4gICAgICAgIG1lZGl1bWFxdWFtYXJpbmU6ICc2NmNkYWEnLFxuICAgICAgICBtZWRpdW1ibHVlOiAnMDAwMGNkJyxcbiAgICAgICAgbWVkaXVtb3JjaGlkOiAnYmE1NWQzJyxcbiAgICAgICAgbWVkaXVtcHVycGxlOiAnOTM3MGQ4JyxcbiAgICAgICAgbWVkaXVtc2VhZ3JlZW46ICczY2IzNzEnLFxuICAgICAgICBtZWRpdW1zbGF0ZWJsdWU6ICc3YjY4ZWUnLFxuICAgICAgICBtZWRpdW1zcHJpbmdncmVlbjogJzAwZmE5YScsXG4gICAgICAgIG1lZGl1bXR1cnF1b2lzZTogJzQ4ZDFjYycsXG4gICAgICAgIG1lZGl1bXZpb2xldHJlZDogJ2M3MTU4NScsXG4gICAgICAgIG1pZG5pZ2h0Ymx1ZTogJzE5MTk3MCcsXG4gICAgICAgIG1pbnRjcmVhbTogJ2Y1ZmZmYScsXG4gICAgICAgIG1pc3R5cm9zZTogJ2ZmZTRlMScsXG4gICAgICAgIG1vY2Nhc2luOiAnZmZlNGI1JyxcbiAgICAgICAgbmF2YWpvd2hpdGU6ICdmZmRlYWQnLFxuICAgICAgICBuYXZ5OiAnMDAwMDgwJyxcbiAgICAgICAgb2xkbGFjZTogJ2ZkZjVlNicsXG4gICAgICAgIG9saXZlOiAnODA4MDAwJyxcbiAgICAgICAgb2xpdmVkcmFiOiAnNmI4ZTIzJyxcbiAgICAgICAgb3JhbmdlOiAnZmZhNTAwJyxcbiAgICAgICAgb3JhbmdlcmVkOiAnZmY0NTAwJyxcbiAgICAgICAgb3JjaGlkOiAnZGE3MGQ2JyxcbiAgICAgICAgcGFsZWdvbGRlbnJvZDogJ2VlZThhYScsXG4gICAgICAgIHBhbGVncmVlbjogJzk4ZmI5OCcsXG4gICAgICAgIHBhbGV0dXJxdW9pc2U6ICdhZmVlZWUnLFxuICAgICAgICBwYWxldmlvbGV0cmVkOiAnZDg3MDkzJyxcbiAgICAgICAgcGFwYXlhd2hpcDogJ2ZmZWZkNScsXG4gICAgICAgIHBlYWNocHVmZjogJ2ZmZGFiOScsXG4gICAgICAgIHBlcnU6ICdjZDg1M2YnLFxuICAgICAgICBwaW5rOiAnZmZjMGNiJyxcbiAgICAgICAgcGx1bTogJ2RkYTBkZCcsXG4gICAgICAgIHBvd2RlcmJsdWU6ICdiMGUwZTYnLFxuICAgICAgICBwdXJwbGU6ICc4MDAwODAnLFxuICAgICAgICByZWJlY2NhcHVycGxlOiAnNjM5JyxcbiAgICAgICAgcmVkOiAnZjAwJyxcbiAgICAgICAgcm9zeWJyb3duOiAnYmM4ZjhmJyxcbiAgICAgICAgcm95YWxibHVlOiAnNDE2OWUxJyxcbiAgICAgICAgc2FkZGxlYnJvd246ICc4YjQ1MTMnLFxuICAgICAgICBzYWxtb246ICdmYTgwNzInLFxuICAgICAgICBzYW5keWJyb3duOiAnZjRhNDYwJyxcbiAgICAgICAgc2VhZ3JlZW46ICcyZThiNTcnLFxuICAgICAgICBzZWFzaGVsbDogJ2ZmZjVlZScsXG4gICAgICAgIHNpZW5uYTogJ2EwNTIyZCcsXG4gICAgICAgIHNpbHZlcjogJ2MwYzBjMCcsXG4gICAgICAgIHNreWJsdWU6ICc4N2NlZWInLFxuICAgICAgICBzbGF0ZWJsdWU6ICc2YTVhY2QnLFxuICAgICAgICBzbGF0ZWdyYXk6ICc3MDgwOTAnLFxuICAgICAgICBzbGF0ZWdyZXk6ICc3MDgwOTAnLFxuICAgICAgICBzbm93OiAnZmZmYWZhJyxcbiAgICAgICAgc3ByaW5nZ3JlZW46ICcwMGZmN2YnLFxuICAgICAgICBzdGVlbGJsdWU6ICc0NjgyYjQnLFxuICAgICAgICB0YW46ICdkMmI0OGMnLFxuICAgICAgICB0ZWFsOiAnMDA4MDgwJyxcbiAgICAgICAgdGhpc3RsZTogJ2Q4YmZkOCcsXG4gICAgICAgIHRvbWF0bzogJ2ZmNjM0NycsXG4gICAgICAgIHR1cnF1b2lzZTogJzQwZTBkMCcsXG4gICAgICAgIHZpb2xldDogJ2VlODJlZScsXG4gICAgICAgIHdoZWF0OiAnZjVkZWIzJyxcbiAgICAgICAgd2hpdGU6ICdmZmYnLFxuICAgICAgICB3aGl0ZXNtb2tlOiAnZjVmNWY1JyxcbiAgICAgICAgeWVsbG93OiAnZmYwJyxcbiAgICAgICAgeWVsbG93Z3JlZW46ICc5YWNkMzInXG4gICAgfTtcbn07XG5cbnZhciBjbGVhcmVyID0gZnVuY3Rpb24gY2xlYXJlcihjb2xvcikge1xuICAgIGNvbG9yLmluc3RhbGxNZXRob2QoJ2NsZWFyZXInLCBmdW5jdGlvbiAoYW1vdW50KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFscGhhKGlzTmFOKGFtb3VudCkgPyAtMC4xIDogLWFtb3VudCwgdHJ1ZSk7XG4gICAgfSk7XG59O1xuXG52YXIgZGFya2VuID0gZnVuY3Rpb24gZGFya2VuKGNvbG9yKSB7XG4gICAgY29sb3IudXNlKEhTTCk7XG5cbiAgICBjb2xvci5pbnN0YWxsTWV0aG9kKCdkYXJrZW4nLCBmdW5jdGlvbiAoYW1vdW50KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxpZ2h0bmVzcyhpc05hTihhbW91bnQpID8gLTAuMSA6IC1hbW91bnQsIHRydWUpO1xuICAgIH0pO1xufTtcblxudmFyIGRlc2F0dXJhdGUgPSBmdW5jdGlvbiBkZXNhdHVyYXRlKGNvbG9yKSB7XG4gICAgY29sb3IudXNlKEhTTCk7XG5cbiAgICBjb2xvci5pbnN0YWxsTWV0aG9kKCdkZXNhdHVyYXRlJywgZnVuY3Rpb24gKGFtb3VudCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zYXR1cmF0aW9uKGlzTmFOKGFtb3VudCkgPyAtMC4xIDogLWFtb3VudCwgdHJ1ZSk7XG4gICAgfSk7XG59O1xuXG52YXIgZ3JheXNjYWxlID0gZnVuY3Rpb24gZ3JheXNjYWxlKGNvbG9yKSB7XG4gICAgZnVuY3Rpb24gZ3MoKSB7XG4gICAgICAgIC8qanNsaW50IHN0cmljdDpmYWxzZSovXG4gICAgICAgIHZhciByZ2IgPSB0aGlzLnJnYigpLFxuICAgICAgICAgICAgdmFsID0gcmdiLl9yZWQgKiAwLjMgKyByZ2IuX2dyZWVuICogMC41OSArIHJnYi5fYmx1ZSAqIDAuMTE7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBjb2xvci5SR0IodmFsLCB2YWwsIHZhbCwgcmdiLl9hbHBoYSk7XG4gICAgfVxuXG4gICAgY29sb3IuaW5zdGFsbE1ldGhvZCgnZ3JleXNjYWxlJywgZ3MpLmluc3RhbGxNZXRob2QoJ2dyYXlzY2FsZScsIGdzKTtcbn07XG5cbnZhciBsaWdodGVuID0gZnVuY3Rpb24gbGlnaHRlbihjb2xvcikge1xuICAgIGNvbG9yLnVzZShIU0wpO1xuXG4gICAgY29sb3IuaW5zdGFsbE1ldGhvZCgnbGlnaHRlbicsIGZ1bmN0aW9uIChhbW91bnQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGlnaHRuZXNzKGlzTmFOKGFtb3VudCkgPyAwLjEgOiBhbW91bnQsIHRydWUpO1xuICAgIH0pO1xufTtcblxudmFyIG1peCA9IGZ1bmN0aW9uIG1peChjb2xvcikge1xuICAgIGNvbG9yLmluc3RhbGxNZXRob2QoJ21peCcsIGZ1bmN0aW9uIChvdGhlckNvbG9yLCB3ZWlnaHQpIHtcbiAgICAgICAgb3RoZXJDb2xvciA9IGNvbG9yKG90aGVyQ29sb3IpLnJnYigpO1xuICAgICAgICB3ZWlnaHQgPSAxIC0gKGlzTmFOKHdlaWdodCkgPyAwLjUgOiB3ZWlnaHQpO1xuXG4gICAgICAgIHZhciB3ID0gd2VpZ2h0ICogMiAtIDEsXG4gICAgICAgICAgICBhID0gdGhpcy5fYWxwaGEgLSBvdGhlckNvbG9yLl9hbHBoYSxcbiAgICAgICAgICAgIHdlaWdodDEgPSAoKHcgKiBhID09PSAtMSA/IHcgOiAodyArIGEpIC8gKDEgKyB3ICogYSkpICsgMSkgLyAyLFxuICAgICAgICAgICAgd2VpZ2h0MiA9IDEgLSB3ZWlnaHQxLFxuICAgICAgICAgICAgcmdiID0gdGhpcy5yZ2IoKTtcblxuICAgICAgICByZXR1cm4gbmV3IGNvbG9yLlJHQihyZ2IuX3JlZCAqIHdlaWdodDEgKyBvdGhlckNvbG9yLl9yZWQgKiB3ZWlnaHQyLCByZ2IuX2dyZWVuICogd2VpZ2h0MSArIG90aGVyQ29sb3IuX2dyZWVuICogd2VpZ2h0MiwgcmdiLl9ibHVlICogd2VpZ2h0MSArIG90aGVyQ29sb3IuX2JsdWUgKiB3ZWlnaHQyLCByZ2IuX2FscGhhICogd2VpZ2h0ICsgb3RoZXJDb2xvci5fYWxwaGEgKiAoMSAtIHdlaWdodCkpO1xuICAgIH0pO1xufTtcblxudmFyIG5lZ2F0ZSA9IGZ1bmN0aW9uIG5lZ2F0ZShjb2xvcikge1xuICAgIGNvbG9yLmluc3RhbGxNZXRob2QoJ25lZ2F0ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHJnYiA9IHRoaXMucmdiKCk7XG4gICAgICAgIHJldHVybiBuZXcgY29sb3IuUkdCKDEgLSByZ2IuX3JlZCwgMSAtIHJnYi5fZ3JlZW4sIDEgLSByZ2IuX2JsdWUsIHRoaXMuX2FscGhhKTtcbiAgICB9KTtcbn07XG5cbnZhciBvcGFxdWVyID0gZnVuY3Rpb24gb3BhcXVlcihjb2xvcikge1xuICAgIGNvbG9yLmluc3RhbGxNZXRob2QoJ29wYXF1ZXInLCBmdW5jdGlvbiAoYW1vdW50KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFscGhhKGlzTmFOKGFtb3VudCkgPyAwLjEgOiBhbW91bnQsIHRydWUpO1xuICAgIH0pO1xufTtcblxudmFyIHJvdGF0ZSA9IGZ1bmN0aW9uIHJvdGF0ZShjb2xvcikge1xuICAgIGNvbG9yLnVzZShIU0wpO1xuXG4gICAgY29sb3IuaW5zdGFsbE1ldGhvZCgncm90YXRlJywgZnVuY3Rpb24gKGRlZ3JlZXMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaHVlKChkZWdyZWVzIHx8IDApIC8gMzYwLCB0cnVlKTtcbiAgICB9KTtcbn07XG5cbnZhciBzYXR1cmF0ZSA9IGZ1bmN0aW9uIHNhdHVyYXRlKGNvbG9yKSB7XG4gICAgY29sb3IudXNlKEhTTCk7XG5cbiAgICBjb2xvci5pbnN0YWxsTWV0aG9kKCdzYXR1cmF0ZScsIGZ1bmN0aW9uIChhbW91bnQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2F0dXJhdGlvbihpc05hTihhbW91bnQpID8gMC4xIDogYW1vdW50LCB0cnVlKTtcbiAgICB9KTtcbn07XG5cbi8vIEFkYXB0ZWQgZnJvbSBodHRwOi8vZ2ltcC5zb3VyY2VhcmNoaXZlLmNvbS9kb2N1bWVudGF0aW9uLzIuNi42LTF1YnVudHUxL2NvbG9yLXRvLWFscGhhXzhjLXNvdXJjZS5odG1sXG4vLyB0b0FscGhhIHJldHVybnMgYSBjb2xvciB3aGVyZSB0aGUgdmFsdWVzIG9mIHRoZSBhcmd1bWVudCBoYXZlIGJlZW4gY29udmVydGVkIHRvIGFscGhhXG52YXIgdG9BbHBoYSA9IGZ1bmN0aW9uIHRvQWxwaGEoY29sb3IpIHtcbiAgICBjb2xvci5pbnN0YWxsTWV0aG9kKCd0b0FscGhhJywgZnVuY3Rpb24gKGNvbG9yKSB7XG4gICAgICAgIHZhciBtZSA9IHRoaXMucmdiKCksXG4gICAgICAgICAgICBvdGhlciA9IGNvbG9yKGNvbG9yKS5yZ2IoKSxcbiAgICAgICAgICAgIGVwc2lsb24gPSAxZS0xMCxcbiAgICAgICAgICAgIGEgPSBuZXcgY29sb3IuUkdCKDAsIDAsIDAsIG1lLl9hbHBoYSksXG4gICAgICAgICAgICBjaGFubmVscyA9IFsnX3JlZCcsICdfZ3JlZW4nLCAnX2JsdWUnXTtcblxuICAgICAgICBjaGFubmVscy5mb3JFYWNoKGZ1bmN0aW9uIChjaGFubmVsKSB7XG4gICAgICAgICAgICBpZiAobWVbY2hhbm5lbF0gPCBlcHNpbG9uKSB7XG4gICAgICAgICAgICAgICAgYVtjaGFubmVsXSA9IG1lW2NoYW5uZWxdO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChtZVtjaGFubmVsXSA+IG90aGVyW2NoYW5uZWxdKSB7XG4gICAgICAgICAgICAgICAgYVtjaGFubmVsXSA9IChtZVtjaGFubmVsXSAtIG90aGVyW2NoYW5uZWxdKSAvICgxIC0gb3RoZXJbY2hhbm5lbF0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChtZVtjaGFubmVsXSA+IG90aGVyW2NoYW5uZWxdKSB7XG4gICAgICAgICAgICAgICAgYVtjaGFubmVsXSA9IChvdGhlcltjaGFubmVsXSAtIG1lW2NoYW5uZWxdKSAvIG90aGVyW2NoYW5uZWxdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhW2NoYW5uZWxdID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGEuX3JlZCA+IGEuX2dyZWVuKSB7XG4gICAgICAgICAgICBpZiAoYS5fcmVkID4gYS5fYmx1ZSkge1xuICAgICAgICAgICAgICAgIG1lLl9hbHBoYSA9IGEuX3JlZDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbWUuX2FscGhhID0gYS5fYmx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChhLl9ncmVlbiA+IGEuX2JsdWUpIHtcbiAgICAgICAgICAgIG1lLl9hbHBoYSA9IGEuX2dyZWVuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWUuX2FscGhhID0gYS5fYmx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtZS5fYWxwaGEgPCBlcHNpbG9uKSB7XG4gICAgICAgICAgICByZXR1cm4gbWU7XG4gICAgICAgIH1cblxuICAgICAgICBjaGFubmVscy5mb3JFYWNoKGZ1bmN0aW9uIChjaGFubmVsKSB7XG4gICAgICAgICAgICBtZVtjaGFubmVsXSA9IChtZVtjaGFubmVsXSAtIG90aGVyW2NoYW5uZWxdKSAvIG1lLl9hbHBoYSArIG90aGVyW2NoYW5uZWxdO1xuICAgICAgICB9KTtcbiAgICAgICAgbWUuX2FscGhhICo9IGEuX2FscGhhO1xuXG4gICAgICAgIHJldHVybiBtZTtcbiAgICB9KTtcbn07XG5cbnZhciBvbmVjb2xvciA9IGNvbG9yXzEudXNlKFhZWikudXNlKExBQikudXNlKEhTVikudXNlKEhTTCkudXNlKENNWUspXG5cbi8vIENvbnZlbmllbmNlIGZ1bmN0aW9uc1xuLnVzZShuYW1lZENvbG9ycykudXNlKGNsZWFyZXIpLnVzZShkYXJrZW4pLnVzZShkZXNhdHVyYXRlKS51c2UoZ3JheXNjYWxlKS51c2UobGlnaHRlbikudXNlKG1peCkudXNlKG5lZ2F0ZSkudXNlKG9wYXF1ZXIpLnVzZShyb3RhdGUpLnVzZShzYXR1cmF0ZSkudXNlKHRvQWxwaGEpO1xuXG5mdW5jdGlvbiBnZXRDb250cmFzdFJhdGlvKGZvcmVncm91bmQsIGJhY2tncm91bmQpIHtcbiAgdmFyIGJhY2tncm91bmRPbldoaXRlID0gYWxwaGFCbGVuZChiYWNrZ3JvdW5kLCAnI2ZmZicpO1xuICB2YXIgYmFja2dyb3VuZE9uQmxhY2sgPSBhbHBoYUJsZW5kKGJhY2tncm91bmQsICcjMDAwJyk7XG5cbiAgdmFyIExXaGl0ZSA9IGdldFJlbGF0aXZlTHVtaW5hbmNlKGJhY2tncm91bmRPbldoaXRlKTtcbiAgdmFyIExCbGFjayA9IGdldFJlbGF0aXZlTHVtaW5hbmNlKGJhY2tncm91bmRPbkJsYWNrKTtcbiAgdmFyIExGb3JlZ3JvdW5kID0gZ2V0UmVsYXRpdmVMdW1pbmFuY2UoZm9yZWdyb3VuZCk7XG5cbiAgaWYgKExXaGl0ZSA8IExGb3JlZ3JvdW5kKSB7XG4gICAgcmV0dXJuIGdldENvbnRyYXN0UmF0aW9PcGFxdWUoZm9yZWdyb3VuZCwgYmFja2dyb3VuZE9uV2hpdGUpO1xuICB9IGVsc2UgaWYgKExCbGFjayA+IExGb3JlZ3JvdW5kKSB7XG4gICAgcmV0dXJuIGdldENvbnRyYXN0UmF0aW9PcGFxdWUoZm9yZWdyb3VuZCwgYmFja2dyb3VuZE9uQmxhY2spO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAxO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFscGhhQmxlbmQoY3NzRm9yZWdyb3VuZCwgY3NzQmFja2dyb3VuZCkge1xuICB2YXIgZm9yZWdyb3VuZCA9IG9uZWNvbG9yKGNzc0ZvcmVncm91bmQpO1xuICB2YXIgYmFja2dyb3VuZCA9IG9uZWNvbG9yKGNzc0JhY2tncm91bmQpO1xuICB2YXIgcmVzdWx0ID0gb25lY29sb3IoJyNmZmYnKTtcbiAgdmFyIGEgPSBmb3JlZ3JvdW5kLmFscGhhKCk7XG5cbiAgcmVzdWx0Ll9yZWQgPSBmb3JlZ3JvdW5kLl9yZWQgKiBhICsgYmFja2dyb3VuZC5fcmVkICogKDEgLSBhKTtcbiAgcmVzdWx0Ll9ncmVlbiA9IGZvcmVncm91bmQuX2dyZWVuICogYSArIGJhY2tncm91bmQuX2dyZWVuICogKDEgLSBhKTtcbiAgcmVzdWx0Ll9ibHVlID0gZm9yZWdyb3VuZC5fYmx1ZSAqIGEgKyBiYWNrZ3JvdW5kLl9ibHVlICogKDEgLSBhKTtcblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBnZXRDb250cmFzdFJhdGlvT3BhcXVlKGZvcmVncm91bmQsIGJhY2tncm91bmQpIHtcbiAgdmFyIEwxID0gZ2V0UmVsYXRpdmVMdW1pbmFuY2UoYmFja2dyb3VuZCk7XG4gIHZhciBMMiA9IGdldFJlbGF0aXZlTHVtaW5hbmNlKGFscGhhQmxlbmQoZm9yZWdyb3VuZCwgYmFja2dyb3VuZCkpO1xuXG4gIC8vIGh0dHBzOi8vd3d3LnczLm9yZy9UUi8yMDA4L1JFQy1XQ0FHMjAtMjAwODEyMTEvI2NvbnRyYXN0LXJhdGlvZGVmXG4gIHJldHVybiAoTWF0aC5tYXgoTDEsIEwyKSArIDAuMDUpIC8gKE1hdGgubWluKEwxLCBMMikgKyAwLjA1KTtcbn1cblxuZnVuY3Rpb24gZ2V0UmVsYXRpdmVMdW1pbmFuY2UoY3NzQ29sb3IpIHtcbiAgLy8gaHR0cHM6Ly93d3cudzMub3JnL1RSLzIwMDgvUkVDLVdDQUcyMC0yMDA4MTIxMS8jcmVsYXRpdmVsdW1pbmFuY2VkZWZcbiAgdmFyIGNvbG9yID0gb25lY29sb3IoY3NzQ29sb3IpO1xuXG4gIHZhciBSID0gY29sb3IuX3JlZCA8PSAwLjAzOTI4ID8gY29sb3IuX3JlZCAvIDEyLjkyIDogTWF0aC5wb3coKGNvbG9yLl9yZWQgKyAwLjA1NSkgLyAxLjA1NSwgMi40KTtcbiAgdmFyIEcgPSBjb2xvci5fZ3JlZW4gPD0gMC4wMzkyOCA/IGNvbG9yLl9ncmVlbiAvIDEyLjkyIDogTWF0aC5wb3coKGNvbG9yLl9ncmVlbiArIDAuMDU1KSAvIDEuMDU1LCAyLjQpO1xuICB2YXIgQiA9IGNvbG9yLl9ibHVlIDw9IDAuMDM5MjggPyBjb2xvci5fYmx1ZSAvIDEyLjkyIDogTWF0aC5wb3coKGNvbG9yLl9ibHVlICsgMC4wNTUpIC8gMS4wNTUsIDIuNCk7XG5cbiAgdmFyIEwgPSAwLjIxMjYgKiBSICsgMC43MTUyICogRyArIDAuMDcyMiAqIEI7XG5cbiAgcmV0dXJuIEw7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0Q29udHJhc3RSYXRpbztcbiIsIid1c2Ugc3RyaWN0J1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0XCJhbGljZWJsdWVcIjogWzI0MCwgMjQ4LCAyNTVdLFxyXG5cdFwiYW50aXF1ZXdoaXRlXCI6IFsyNTAsIDIzNSwgMjE1XSxcclxuXHRcImFxdWFcIjogWzAsIDI1NSwgMjU1XSxcclxuXHRcImFxdWFtYXJpbmVcIjogWzEyNywgMjU1LCAyMTJdLFxyXG5cdFwiYXp1cmVcIjogWzI0MCwgMjU1LCAyNTVdLFxyXG5cdFwiYmVpZ2VcIjogWzI0NSwgMjQ1LCAyMjBdLFxyXG5cdFwiYmlzcXVlXCI6IFsyNTUsIDIyOCwgMTk2XSxcclxuXHRcImJsYWNrXCI6IFswLCAwLCAwXSxcclxuXHRcImJsYW5jaGVkYWxtb25kXCI6IFsyNTUsIDIzNSwgMjA1XSxcclxuXHRcImJsdWVcIjogWzAsIDAsIDI1NV0sXHJcblx0XCJibHVldmlvbGV0XCI6IFsxMzgsIDQzLCAyMjZdLFxyXG5cdFwiYnJvd25cIjogWzE2NSwgNDIsIDQyXSxcclxuXHRcImJ1cmx5d29vZFwiOiBbMjIyLCAxODQsIDEzNV0sXHJcblx0XCJjYWRldGJsdWVcIjogWzk1LCAxNTgsIDE2MF0sXHJcblx0XCJjaGFydHJldXNlXCI6IFsxMjcsIDI1NSwgMF0sXHJcblx0XCJjaG9jb2xhdGVcIjogWzIxMCwgMTA1LCAzMF0sXHJcblx0XCJjb3JhbFwiOiBbMjU1LCAxMjcsIDgwXSxcclxuXHRcImNvcm5mbG93ZXJibHVlXCI6IFsxMDAsIDE0OSwgMjM3XSxcclxuXHRcImNvcm5zaWxrXCI6IFsyNTUsIDI0OCwgMjIwXSxcclxuXHRcImNyaW1zb25cIjogWzIyMCwgMjAsIDYwXSxcclxuXHRcImN5YW5cIjogWzAsIDI1NSwgMjU1XSxcclxuXHRcImRhcmtibHVlXCI6IFswLCAwLCAxMzldLFxyXG5cdFwiZGFya2N5YW5cIjogWzAsIDEzOSwgMTM5XSxcclxuXHRcImRhcmtnb2xkZW5yb2RcIjogWzE4NCwgMTM0LCAxMV0sXHJcblx0XCJkYXJrZ3JheVwiOiBbMTY5LCAxNjksIDE2OV0sXHJcblx0XCJkYXJrZ3JlZW5cIjogWzAsIDEwMCwgMF0sXHJcblx0XCJkYXJrZ3JleVwiOiBbMTY5LCAxNjksIDE2OV0sXHJcblx0XCJkYXJra2hha2lcIjogWzE4OSwgMTgzLCAxMDddLFxyXG5cdFwiZGFya21hZ2VudGFcIjogWzEzOSwgMCwgMTM5XSxcclxuXHRcImRhcmtvbGl2ZWdyZWVuXCI6IFs4NSwgMTA3LCA0N10sXHJcblx0XCJkYXJrb3JhbmdlXCI6IFsyNTUsIDE0MCwgMF0sXHJcblx0XCJkYXJrb3JjaGlkXCI6IFsxNTMsIDUwLCAyMDRdLFxyXG5cdFwiZGFya3JlZFwiOiBbMTM5LCAwLCAwXSxcclxuXHRcImRhcmtzYWxtb25cIjogWzIzMywgMTUwLCAxMjJdLFxyXG5cdFwiZGFya3NlYWdyZWVuXCI6IFsxNDMsIDE4OCwgMTQzXSxcclxuXHRcImRhcmtzbGF0ZWJsdWVcIjogWzcyLCA2MSwgMTM5XSxcclxuXHRcImRhcmtzbGF0ZWdyYXlcIjogWzQ3LCA3OSwgNzldLFxyXG5cdFwiZGFya3NsYXRlZ3JleVwiOiBbNDcsIDc5LCA3OV0sXHJcblx0XCJkYXJrdHVycXVvaXNlXCI6IFswLCAyMDYsIDIwOV0sXHJcblx0XCJkYXJrdmlvbGV0XCI6IFsxNDgsIDAsIDIxMV0sXHJcblx0XCJkZWVwcGlua1wiOiBbMjU1LCAyMCwgMTQ3XSxcclxuXHRcImRlZXBza3libHVlXCI6IFswLCAxOTEsIDI1NV0sXHJcblx0XCJkaW1ncmF5XCI6IFsxMDUsIDEwNSwgMTA1XSxcclxuXHRcImRpbWdyZXlcIjogWzEwNSwgMTA1LCAxMDVdLFxyXG5cdFwiZG9kZ2VyYmx1ZVwiOiBbMzAsIDE0NCwgMjU1XSxcclxuXHRcImZpcmVicmlja1wiOiBbMTc4LCAzNCwgMzRdLFxyXG5cdFwiZmxvcmFsd2hpdGVcIjogWzI1NSwgMjUwLCAyNDBdLFxyXG5cdFwiZm9yZXN0Z3JlZW5cIjogWzM0LCAxMzksIDM0XSxcclxuXHRcImZ1Y2hzaWFcIjogWzI1NSwgMCwgMjU1XSxcclxuXHRcImdhaW5zYm9yb1wiOiBbMjIwLCAyMjAsIDIyMF0sXHJcblx0XCJnaG9zdHdoaXRlXCI6IFsyNDgsIDI0OCwgMjU1XSxcclxuXHRcImdvbGRcIjogWzI1NSwgMjE1LCAwXSxcclxuXHRcImdvbGRlbnJvZFwiOiBbMjE4LCAxNjUsIDMyXSxcclxuXHRcImdyYXlcIjogWzEyOCwgMTI4LCAxMjhdLFxyXG5cdFwiZ3JlZW5cIjogWzAsIDEyOCwgMF0sXHJcblx0XCJncmVlbnllbGxvd1wiOiBbMTczLCAyNTUsIDQ3XSxcclxuXHRcImdyZXlcIjogWzEyOCwgMTI4LCAxMjhdLFxyXG5cdFwiaG9uZXlkZXdcIjogWzI0MCwgMjU1LCAyNDBdLFxyXG5cdFwiaG90cGlua1wiOiBbMjU1LCAxMDUsIDE4MF0sXHJcblx0XCJpbmRpYW5yZWRcIjogWzIwNSwgOTIsIDkyXSxcclxuXHRcImluZGlnb1wiOiBbNzUsIDAsIDEzMF0sXHJcblx0XCJpdm9yeVwiOiBbMjU1LCAyNTUsIDI0MF0sXHJcblx0XCJraGFraVwiOiBbMjQwLCAyMzAsIDE0MF0sXHJcblx0XCJsYXZlbmRlclwiOiBbMjMwLCAyMzAsIDI1MF0sXHJcblx0XCJsYXZlbmRlcmJsdXNoXCI6IFsyNTUsIDI0MCwgMjQ1XSxcclxuXHRcImxhd25ncmVlblwiOiBbMTI0LCAyNTIsIDBdLFxyXG5cdFwibGVtb25jaGlmZm9uXCI6IFsyNTUsIDI1MCwgMjA1XSxcclxuXHRcImxpZ2h0Ymx1ZVwiOiBbMTczLCAyMTYsIDIzMF0sXHJcblx0XCJsaWdodGNvcmFsXCI6IFsyNDAsIDEyOCwgMTI4XSxcclxuXHRcImxpZ2h0Y3lhblwiOiBbMjI0LCAyNTUsIDI1NV0sXHJcblx0XCJsaWdodGdvbGRlbnJvZHllbGxvd1wiOiBbMjUwLCAyNTAsIDIxMF0sXHJcblx0XCJsaWdodGdyYXlcIjogWzIxMSwgMjExLCAyMTFdLFxyXG5cdFwibGlnaHRncmVlblwiOiBbMTQ0LCAyMzgsIDE0NF0sXHJcblx0XCJsaWdodGdyZXlcIjogWzIxMSwgMjExLCAyMTFdLFxyXG5cdFwibGlnaHRwaW5rXCI6IFsyNTUsIDE4MiwgMTkzXSxcclxuXHRcImxpZ2h0c2FsbW9uXCI6IFsyNTUsIDE2MCwgMTIyXSxcclxuXHRcImxpZ2h0c2VhZ3JlZW5cIjogWzMyLCAxNzgsIDE3MF0sXHJcblx0XCJsaWdodHNreWJsdWVcIjogWzEzNSwgMjA2LCAyNTBdLFxyXG5cdFwibGlnaHRzbGF0ZWdyYXlcIjogWzExOSwgMTM2LCAxNTNdLFxyXG5cdFwibGlnaHRzbGF0ZWdyZXlcIjogWzExOSwgMTM2LCAxNTNdLFxyXG5cdFwibGlnaHRzdGVlbGJsdWVcIjogWzE3NiwgMTk2LCAyMjJdLFxyXG5cdFwibGlnaHR5ZWxsb3dcIjogWzI1NSwgMjU1LCAyMjRdLFxyXG5cdFwibGltZVwiOiBbMCwgMjU1LCAwXSxcclxuXHRcImxpbWVncmVlblwiOiBbNTAsIDIwNSwgNTBdLFxyXG5cdFwibGluZW5cIjogWzI1MCwgMjQwLCAyMzBdLFxyXG5cdFwibWFnZW50YVwiOiBbMjU1LCAwLCAyNTVdLFxyXG5cdFwibWFyb29uXCI6IFsxMjgsIDAsIDBdLFxyXG5cdFwibWVkaXVtYXF1YW1hcmluZVwiOiBbMTAyLCAyMDUsIDE3MF0sXHJcblx0XCJtZWRpdW1ibHVlXCI6IFswLCAwLCAyMDVdLFxyXG5cdFwibWVkaXVtb3JjaGlkXCI6IFsxODYsIDg1LCAyMTFdLFxyXG5cdFwibWVkaXVtcHVycGxlXCI6IFsxNDcsIDExMiwgMjE5XSxcclxuXHRcIm1lZGl1bXNlYWdyZWVuXCI6IFs2MCwgMTc5LCAxMTNdLFxyXG5cdFwibWVkaXVtc2xhdGVibHVlXCI6IFsxMjMsIDEwNCwgMjM4XSxcclxuXHRcIm1lZGl1bXNwcmluZ2dyZWVuXCI6IFswLCAyNTAsIDE1NF0sXHJcblx0XCJtZWRpdW10dXJxdW9pc2VcIjogWzcyLCAyMDksIDIwNF0sXHJcblx0XCJtZWRpdW12aW9sZXRyZWRcIjogWzE5OSwgMjEsIDEzM10sXHJcblx0XCJtaWRuaWdodGJsdWVcIjogWzI1LCAyNSwgMTEyXSxcclxuXHRcIm1pbnRjcmVhbVwiOiBbMjQ1LCAyNTUsIDI1MF0sXHJcblx0XCJtaXN0eXJvc2VcIjogWzI1NSwgMjI4LCAyMjVdLFxyXG5cdFwibW9jY2FzaW5cIjogWzI1NSwgMjI4LCAxODFdLFxyXG5cdFwibmF2YWpvd2hpdGVcIjogWzI1NSwgMjIyLCAxNzNdLFxyXG5cdFwibmF2eVwiOiBbMCwgMCwgMTI4XSxcclxuXHRcIm9sZGxhY2VcIjogWzI1MywgMjQ1LCAyMzBdLFxyXG5cdFwib2xpdmVcIjogWzEyOCwgMTI4LCAwXSxcclxuXHRcIm9saXZlZHJhYlwiOiBbMTA3LCAxNDIsIDM1XSxcclxuXHRcIm9yYW5nZVwiOiBbMjU1LCAxNjUsIDBdLFxyXG5cdFwib3JhbmdlcmVkXCI6IFsyNTUsIDY5LCAwXSxcclxuXHRcIm9yY2hpZFwiOiBbMjE4LCAxMTIsIDIxNF0sXHJcblx0XCJwYWxlZ29sZGVucm9kXCI6IFsyMzgsIDIzMiwgMTcwXSxcclxuXHRcInBhbGVncmVlblwiOiBbMTUyLCAyNTEsIDE1Ml0sXHJcblx0XCJwYWxldHVycXVvaXNlXCI6IFsxNzUsIDIzOCwgMjM4XSxcclxuXHRcInBhbGV2aW9sZXRyZWRcIjogWzIxOSwgMTEyLCAxNDddLFxyXG5cdFwicGFwYXlhd2hpcFwiOiBbMjU1LCAyMzksIDIxM10sXHJcblx0XCJwZWFjaHB1ZmZcIjogWzI1NSwgMjE4LCAxODVdLFxyXG5cdFwicGVydVwiOiBbMjA1LCAxMzMsIDYzXSxcclxuXHRcInBpbmtcIjogWzI1NSwgMTkyLCAyMDNdLFxyXG5cdFwicGx1bVwiOiBbMjIxLCAxNjAsIDIyMV0sXHJcblx0XCJwb3dkZXJibHVlXCI6IFsxNzYsIDIyNCwgMjMwXSxcclxuXHRcInB1cnBsZVwiOiBbMTI4LCAwLCAxMjhdLFxyXG5cdFwicmViZWNjYXB1cnBsZVwiOiBbMTAyLCA1MSwgMTUzXSxcclxuXHRcInJlZFwiOiBbMjU1LCAwLCAwXSxcclxuXHRcInJvc3licm93blwiOiBbMTg4LCAxNDMsIDE0M10sXHJcblx0XCJyb3lhbGJsdWVcIjogWzY1LCAxMDUsIDIyNV0sXHJcblx0XCJzYWRkbGVicm93blwiOiBbMTM5LCA2OSwgMTldLFxyXG5cdFwic2FsbW9uXCI6IFsyNTAsIDEyOCwgMTE0XSxcclxuXHRcInNhbmR5YnJvd25cIjogWzI0NCwgMTY0LCA5Nl0sXHJcblx0XCJzZWFncmVlblwiOiBbNDYsIDEzOSwgODddLFxyXG5cdFwic2Vhc2hlbGxcIjogWzI1NSwgMjQ1LCAyMzhdLFxyXG5cdFwic2llbm5hXCI6IFsxNjAsIDgyLCA0NV0sXHJcblx0XCJzaWx2ZXJcIjogWzE5MiwgMTkyLCAxOTJdLFxyXG5cdFwic2t5Ymx1ZVwiOiBbMTM1LCAyMDYsIDIzNV0sXHJcblx0XCJzbGF0ZWJsdWVcIjogWzEwNiwgOTAsIDIwNV0sXHJcblx0XCJzbGF0ZWdyYXlcIjogWzExMiwgMTI4LCAxNDRdLFxyXG5cdFwic2xhdGVncmV5XCI6IFsxMTIsIDEyOCwgMTQ0XSxcclxuXHRcInNub3dcIjogWzI1NSwgMjUwLCAyNTBdLFxyXG5cdFwic3ByaW5nZ3JlZW5cIjogWzAsIDI1NSwgMTI3XSxcclxuXHRcInN0ZWVsYmx1ZVwiOiBbNzAsIDEzMCwgMTgwXSxcclxuXHRcInRhblwiOiBbMjEwLCAxODAsIDE0MF0sXHJcblx0XCJ0ZWFsXCI6IFswLCAxMjgsIDEyOF0sXHJcblx0XCJ0aGlzdGxlXCI6IFsyMTYsIDE5MSwgMjE2XSxcclxuXHRcInRvbWF0b1wiOiBbMjU1LCA5OSwgNzFdLFxyXG5cdFwidHVycXVvaXNlXCI6IFs2NCwgMjI0LCAyMDhdLFxyXG5cdFwidmlvbGV0XCI6IFsyMzgsIDEzMCwgMjM4XSxcclxuXHRcIndoZWF0XCI6IFsyNDUsIDIyMiwgMTc5XSxcclxuXHRcIndoaXRlXCI6IFsyNTUsIDI1NSwgMjU1XSxcclxuXHRcIndoaXRlc21va2VcIjogWzI0NSwgMjQ1LCAyNDVdLFxyXG5cdFwieWVsbG93XCI6IFsyNTUsIDI1NSwgMF0sXHJcblx0XCJ5ZWxsb3dncmVlblwiOiBbMTU0LCAyMDUsIDUwXVxyXG59O1xyXG4iLCIvKiBNSVQgbGljZW5zZSAqL1xudmFyIGNvbG9yTmFtZXMgPSByZXF1aXJlKCdjb2xvci1uYW1lJyk7XG52YXIgc3dpenpsZSA9IHJlcXVpcmUoJ3NpbXBsZS1zd2l6emxlJyk7XG5cbnZhciByZXZlcnNlTmFtZXMgPSB7fTtcblxuLy8gY3JlYXRlIGEgbGlzdCBvZiByZXZlcnNlIGNvbG9yIG5hbWVzXG5mb3IgKHZhciBuYW1lIGluIGNvbG9yTmFtZXMpIHtcblx0aWYgKGNvbG9yTmFtZXMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcblx0XHRyZXZlcnNlTmFtZXNbY29sb3JOYW1lc1tuYW1lXV0gPSBuYW1lO1xuXHR9XG59XG5cbnZhciBjcyA9IG1vZHVsZS5leHBvcnRzID0ge1xuXHR0bzoge30sXG5cdGdldDoge31cbn07XG5cbmNzLmdldCA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcblx0dmFyIHByZWZpeCA9IHN0cmluZy5zdWJzdHJpbmcoMCwgMykudG9Mb3dlckNhc2UoKTtcblx0dmFyIHZhbDtcblx0dmFyIG1vZGVsO1xuXHRzd2l0Y2ggKHByZWZpeCkge1xuXHRcdGNhc2UgJ2hzbCc6XG5cdFx0XHR2YWwgPSBjcy5nZXQuaHNsKHN0cmluZyk7XG5cdFx0XHRtb2RlbCA9ICdoc2wnO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAnaHdiJzpcblx0XHRcdHZhbCA9IGNzLmdldC5od2Ioc3RyaW5nKTtcblx0XHRcdG1vZGVsID0gJ2h3Yic7XG5cdFx0XHRicmVhaztcblx0XHRkZWZhdWx0OlxuXHRcdFx0dmFsID0gY3MuZ2V0LnJnYihzdHJpbmcpO1xuXHRcdFx0bW9kZWwgPSAncmdiJztcblx0XHRcdGJyZWFrO1xuXHR9XG5cblx0aWYgKCF2YWwpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdHJldHVybiB7bW9kZWw6IG1vZGVsLCB2YWx1ZTogdmFsfTtcbn07XG5cbmNzLmdldC5yZ2IgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG5cdGlmICghc3RyaW5nKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHR2YXIgYWJiciA9IC9eIyhbYS1mMC05XXszLDR9KSQvaTtcblx0dmFyIGhleCA9IC9eIyhbYS1mMC05XXs2fSkoW2EtZjAtOV17Mn0pPyQvaTtcblx0dmFyIHJnYmEgPSAvXnJnYmE/XFwoXFxzKihbKy1dP1xcZCspXFxzKixcXHMqKFsrLV0/XFxkKylcXHMqLFxccyooWystXT9cXGQrKVxccyooPzosXFxzKihbKy1dP1tcXGRcXC5dKylcXHMqKT9cXCkkLztcblx0dmFyIHBlciA9IC9ecmdiYT9cXChcXHMqKFsrLV0/W1xcZFxcLl0rKVxcJVxccyosXFxzKihbKy1dP1tcXGRcXC5dKylcXCVcXHMqLFxccyooWystXT9bXFxkXFwuXSspXFwlXFxzKig/OixcXHMqKFsrLV0/W1xcZFxcLl0rKVxccyopP1xcKSQvO1xuXHR2YXIga2V5d29yZCA9IC8oXFxEKykvO1xuXG5cdHZhciByZ2IgPSBbMCwgMCwgMCwgMV07XG5cdHZhciBtYXRjaDtcblx0dmFyIGk7XG5cdHZhciBoZXhBbHBoYTtcblxuXHRpZiAobWF0Y2ggPSBzdHJpbmcubWF0Y2goaGV4KSkge1xuXHRcdGhleEFscGhhID0gbWF0Y2hbMl07XG5cdFx0bWF0Y2ggPSBtYXRjaFsxXTtcblxuXHRcdGZvciAoaSA9IDA7IGkgPCAzOyBpKyspIHtcblx0XHRcdC8vIGh0dHBzOi8vanNwZXJmLmNvbS9zbGljZS12cy1zdWJzdHItdnMtc3Vic3RyaW5nLW1ldGhvZHMtbG9uZy1zdHJpbmcvMTlcblx0XHRcdHZhciBpMiA9IGkgKiAyO1xuXHRcdFx0cmdiW2ldID0gcGFyc2VJbnQobWF0Y2guc2xpY2UoaTIsIGkyICsgMiksIDE2KTtcblx0XHR9XG5cblx0XHRpZiAoaGV4QWxwaGEpIHtcblx0XHRcdHJnYlszXSA9IE1hdGgucm91bmQoKHBhcnNlSW50KGhleEFscGhhLCAxNikgLyAyNTUpICogMTAwKSAvIDEwMDtcblx0XHR9XG5cdH0gZWxzZSBpZiAobWF0Y2ggPSBzdHJpbmcubWF0Y2goYWJicikpIHtcblx0XHRtYXRjaCA9IG1hdGNoWzFdO1xuXHRcdGhleEFscGhhID0gbWF0Y2hbM107XG5cblx0XHRmb3IgKGkgPSAwOyBpIDwgMzsgaSsrKSB7XG5cdFx0XHRyZ2JbaV0gPSBwYXJzZUludChtYXRjaFtpXSArIG1hdGNoW2ldLCAxNik7XG5cdFx0fVxuXG5cdFx0aWYgKGhleEFscGhhKSB7XG5cdFx0XHRyZ2JbM10gPSBNYXRoLnJvdW5kKChwYXJzZUludChoZXhBbHBoYSArIGhleEFscGhhLCAxNikgLyAyNTUpICogMTAwKSAvIDEwMDtcblx0XHR9XG5cdH0gZWxzZSBpZiAobWF0Y2ggPSBzdHJpbmcubWF0Y2gocmdiYSkpIHtcblx0XHRmb3IgKGkgPSAwOyBpIDwgMzsgaSsrKSB7XG5cdFx0XHRyZ2JbaV0gPSBwYXJzZUludChtYXRjaFtpICsgMV0sIDApO1xuXHRcdH1cblxuXHRcdGlmIChtYXRjaFs0XSkge1xuXHRcdFx0cmdiWzNdID0gcGFyc2VGbG9hdChtYXRjaFs0XSk7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKG1hdGNoID0gc3RyaW5nLm1hdGNoKHBlcikpIHtcblx0XHRmb3IgKGkgPSAwOyBpIDwgMzsgaSsrKSB7XG5cdFx0XHRyZ2JbaV0gPSBNYXRoLnJvdW5kKHBhcnNlRmxvYXQobWF0Y2hbaSArIDFdKSAqIDIuNTUpO1xuXHRcdH1cblxuXHRcdGlmIChtYXRjaFs0XSkge1xuXHRcdFx0cmdiWzNdID0gcGFyc2VGbG9hdChtYXRjaFs0XSk7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKG1hdGNoID0gc3RyaW5nLm1hdGNoKGtleXdvcmQpKSB7XG5cdFx0aWYgKG1hdGNoWzFdID09PSAndHJhbnNwYXJlbnQnKSB7XG5cdFx0XHRyZXR1cm4gWzAsIDAsIDAsIDBdO1xuXHRcdH1cblxuXHRcdHJnYiA9IGNvbG9yTmFtZXNbbWF0Y2hbMV1dO1xuXG5cdFx0aWYgKCFyZ2IpIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdHJnYlszXSA9IDE7XG5cblx0XHRyZXR1cm4gcmdiO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0Zm9yIChpID0gMDsgaSA8IDM7IGkrKykge1xuXHRcdHJnYltpXSA9IGNsYW1wKHJnYltpXSwgMCwgMjU1KTtcblx0fVxuXHRyZ2JbM10gPSBjbGFtcChyZ2JbM10sIDAsIDEpO1xuXG5cdHJldHVybiByZ2I7XG59O1xuXG5jcy5nZXQuaHNsID0gZnVuY3Rpb24gKHN0cmluZykge1xuXHRpZiAoIXN0cmluZykge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0dmFyIGhzbCA9IC9eaHNsYT9cXChcXHMqKFsrLV0/KD86XFxkKlxcLik/XFxkKykoPzpkZWcpP1xccyosXFxzKihbKy1dP1tcXGRcXC5dKyklXFxzKixcXHMqKFsrLV0/W1xcZFxcLl0rKSVcXHMqKD86LFxccyooWystXT9bXFxkXFwuXSspXFxzKik/XFwpJC87XG5cdHZhciBtYXRjaCA9IHN0cmluZy5tYXRjaChoc2wpO1xuXG5cdGlmIChtYXRjaCkge1xuXHRcdHZhciBhbHBoYSA9IHBhcnNlRmxvYXQobWF0Y2hbNF0pO1xuXHRcdHZhciBoID0gKHBhcnNlRmxvYXQobWF0Y2hbMV0pICsgMzYwKSAlIDM2MDtcblx0XHR2YXIgcyA9IGNsYW1wKHBhcnNlRmxvYXQobWF0Y2hbMl0pLCAwLCAxMDApO1xuXHRcdHZhciBsID0gY2xhbXAocGFyc2VGbG9hdChtYXRjaFszXSksIDAsIDEwMCk7XG5cdFx0dmFyIGEgPSBjbGFtcChpc05hTihhbHBoYSkgPyAxIDogYWxwaGEsIDAsIDEpO1xuXG5cdFx0cmV0dXJuIFtoLCBzLCBsLCBhXTtcblx0fVxuXG5cdHJldHVybiBudWxsO1xufTtcblxuY3MuZ2V0Lmh3YiA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcblx0aWYgKCFzdHJpbmcpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdHZhciBod2IgPSAvXmh3YlxcKFxccyooWystXT9cXGQqW1xcLl0/XFxkKykoPzpkZWcpP1xccyosXFxzKihbKy1dP1tcXGRcXC5dKyklXFxzKixcXHMqKFsrLV0/W1xcZFxcLl0rKSVcXHMqKD86LFxccyooWystXT9bXFxkXFwuXSspXFxzKik/XFwpJC87XG5cdHZhciBtYXRjaCA9IHN0cmluZy5tYXRjaChod2IpO1xuXG5cdGlmIChtYXRjaCkge1xuXHRcdHZhciBhbHBoYSA9IHBhcnNlRmxvYXQobWF0Y2hbNF0pO1xuXHRcdHZhciBoID0gKChwYXJzZUZsb2F0KG1hdGNoWzFdKSAlIDM2MCkgKyAzNjApICUgMzYwO1xuXHRcdHZhciB3ID0gY2xhbXAocGFyc2VGbG9hdChtYXRjaFsyXSksIDAsIDEwMCk7XG5cdFx0dmFyIGIgPSBjbGFtcChwYXJzZUZsb2F0KG1hdGNoWzNdKSwgMCwgMTAwKTtcblx0XHR2YXIgYSA9IGNsYW1wKGlzTmFOKGFscGhhKSA/IDEgOiBhbHBoYSwgMCwgMSk7XG5cdFx0cmV0dXJuIFtoLCB3LCBiLCBhXTtcblx0fVxuXG5cdHJldHVybiBudWxsO1xufTtcblxuY3MudG8uaGV4ID0gZnVuY3Rpb24gKCkge1xuXHR2YXIgcmdiYSA9IHN3aXp6bGUoYXJndW1lbnRzKTtcblxuXHRyZXR1cm4gKFxuXHRcdCcjJyArXG5cdFx0aGV4RG91YmxlKHJnYmFbMF0pICtcblx0XHRoZXhEb3VibGUocmdiYVsxXSkgK1xuXHRcdGhleERvdWJsZShyZ2JhWzJdKSArXG5cdFx0KHJnYmFbM10gPCAxXG5cdFx0XHQ/IChoZXhEb3VibGUoTWF0aC5yb3VuZChyZ2JhWzNdICogMjU1KSkpXG5cdFx0XHQ6ICcnKVxuXHQpO1xufTtcblxuY3MudG8ucmdiID0gZnVuY3Rpb24gKCkge1xuXHR2YXIgcmdiYSA9IHN3aXp6bGUoYXJndW1lbnRzKTtcblxuXHRyZXR1cm4gcmdiYS5sZW5ndGggPCA0IHx8IHJnYmFbM10gPT09IDFcblx0XHQ/ICdyZ2IoJyArIE1hdGgucm91bmQocmdiYVswXSkgKyAnLCAnICsgTWF0aC5yb3VuZChyZ2JhWzFdKSArICcsICcgKyBNYXRoLnJvdW5kKHJnYmFbMl0pICsgJyknXG5cdFx0OiAncmdiYSgnICsgTWF0aC5yb3VuZChyZ2JhWzBdKSArICcsICcgKyBNYXRoLnJvdW5kKHJnYmFbMV0pICsgJywgJyArIE1hdGgucm91bmQocmdiYVsyXSkgKyAnLCAnICsgcmdiYVszXSArICcpJztcbn07XG5cbmNzLnRvLnJnYi5wZXJjZW50ID0gZnVuY3Rpb24gKCkge1xuXHR2YXIgcmdiYSA9IHN3aXp6bGUoYXJndW1lbnRzKTtcblxuXHR2YXIgciA9IE1hdGgucm91bmQocmdiYVswXSAvIDI1NSAqIDEwMCk7XG5cdHZhciBnID0gTWF0aC5yb3VuZChyZ2JhWzFdIC8gMjU1ICogMTAwKTtcblx0dmFyIGIgPSBNYXRoLnJvdW5kKHJnYmFbMl0gLyAyNTUgKiAxMDApO1xuXG5cdHJldHVybiByZ2JhLmxlbmd0aCA8IDQgfHwgcmdiYVszXSA9PT0gMVxuXHRcdD8gJ3JnYignICsgciArICclLCAnICsgZyArICclLCAnICsgYiArICclKSdcblx0XHQ6ICdyZ2JhKCcgKyByICsgJyUsICcgKyBnICsgJyUsICcgKyBiICsgJyUsICcgKyByZ2JhWzNdICsgJyknO1xufTtcblxuY3MudG8uaHNsID0gZnVuY3Rpb24gKCkge1xuXHR2YXIgaHNsYSA9IHN3aXp6bGUoYXJndW1lbnRzKTtcblx0cmV0dXJuIGhzbGEubGVuZ3RoIDwgNCB8fCBoc2xhWzNdID09PSAxXG5cdFx0PyAnaHNsKCcgKyBoc2xhWzBdICsgJywgJyArIGhzbGFbMV0gKyAnJSwgJyArIGhzbGFbMl0gKyAnJSknXG5cdFx0OiAnaHNsYSgnICsgaHNsYVswXSArICcsICcgKyBoc2xhWzFdICsgJyUsICcgKyBoc2xhWzJdICsgJyUsICcgKyBoc2xhWzNdICsgJyknO1xufTtcblxuLy8gaHdiIGlzIGEgYml0IGRpZmZlcmVudCB0aGFuIHJnYihhKSAmIGhzbChhKSBzaW5jZSB0aGVyZSBpcyBubyBhbHBoYSBzcGVjaWZpYyBzeW50YXhcbi8vIChod2IgaGF2ZSBhbHBoYSBvcHRpb25hbCAmIDEgaXMgZGVmYXVsdCB2YWx1ZSlcbmNzLnRvLmh3YiA9IGZ1bmN0aW9uICgpIHtcblx0dmFyIGh3YmEgPSBzd2l6emxlKGFyZ3VtZW50cyk7XG5cblx0dmFyIGEgPSAnJztcblx0aWYgKGh3YmEubGVuZ3RoID49IDQgJiYgaHdiYVszXSAhPT0gMSkge1xuXHRcdGEgPSAnLCAnICsgaHdiYVszXTtcblx0fVxuXG5cdHJldHVybiAnaHdiKCcgKyBod2JhWzBdICsgJywgJyArIGh3YmFbMV0gKyAnJSwgJyArIGh3YmFbMl0gKyAnJScgKyBhICsgJyknO1xufTtcblxuY3MudG8ua2V5d29yZCA9IGZ1bmN0aW9uIChyZ2IpIHtcblx0cmV0dXJuIHJldmVyc2VOYW1lc1tyZ2Iuc2xpY2UoMCwgMyldO1xufTtcblxuLy8gaGVscGVyc1xuZnVuY3Rpb24gY2xhbXAobnVtLCBtaW4sIG1heCkge1xuXHRyZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgobWluLCBudW0pLCBtYXgpO1xufVxuXG5mdW5jdGlvbiBoZXhEb3VibGUobnVtKSB7XG5cdHZhciBzdHIgPSBudW0udG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7XG5cdHJldHVybiAoc3RyLmxlbmd0aCA8IDIpID8gJzAnICsgc3RyIDogc3RyO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY29sb3JTdHJpbmcgPSByZXF1aXJlKCdjb2xvci1zdHJpbmcnKTtcbnZhciBjb252ZXJ0ID0gcmVxdWlyZSgnY29sb3ItY29udmVydCcpO1xuXG52YXIgX3NsaWNlID0gW10uc2xpY2U7XG5cbnZhciBza2lwcGVkTW9kZWxzID0gW1xuXHQvLyB0byBiZSBob25lc3QsIEkgZG9uJ3QgcmVhbGx5IGZlZWwgbGlrZSBrZXl3b3JkIGJlbG9uZ3MgaW4gY29sb3IgY29udmVydCwgYnV0IGVoLlxuXHQna2V5d29yZCcsXG5cblx0Ly8gZ3JheSBjb25mbGljdHMgd2l0aCBzb21lIG1ldGhvZCBuYW1lcywgYW5kIGhhcyBpdHMgb3duIG1ldGhvZCBkZWZpbmVkLlxuXHQnZ3JheScsXG5cblx0Ly8gc2hvdWxkbid0IHJlYWxseSBiZSBpbiBjb2xvci1jb252ZXJ0IGVpdGhlci4uLlxuXHQnaGV4J1xuXTtcblxudmFyIGhhc2hlZE1vZGVsS2V5cyA9IHt9O1xuT2JqZWN0LmtleXMoY29udmVydCkuZm9yRWFjaChmdW5jdGlvbiAobW9kZWwpIHtcblx0aGFzaGVkTW9kZWxLZXlzW19zbGljZS5jYWxsKGNvbnZlcnRbbW9kZWxdLmxhYmVscykuc29ydCgpLmpvaW4oJycpXSA9IG1vZGVsO1xufSk7XG5cbnZhciBsaW1pdGVycyA9IHt9O1xuXG5mdW5jdGlvbiBDb2xvcihvYmosIG1vZGVsKSB7XG5cdGlmICghKHRoaXMgaW5zdGFuY2VvZiBDb2xvcikpIHtcblx0XHRyZXR1cm4gbmV3IENvbG9yKG9iaiwgbW9kZWwpO1xuXHR9XG5cblx0aWYgKG1vZGVsICYmIG1vZGVsIGluIHNraXBwZWRNb2RlbHMpIHtcblx0XHRtb2RlbCA9IG51bGw7XG5cdH1cblxuXHRpZiAobW9kZWwgJiYgIShtb2RlbCBpbiBjb252ZXJ0KSkge1xuXHRcdHRocm93IG5ldyBFcnJvcignVW5rbm93biBtb2RlbDogJyArIG1vZGVsKTtcblx0fVxuXG5cdHZhciBpO1xuXHR2YXIgY2hhbm5lbHM7XG5cblx0aWYgKHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0dGhpcy5tb2RlbCA9ICdyZ2InO1xuXHRcdHRoaXMuY29sb3IgPSBbMCwgMCwgMF07XG5cdFx0dGhpcy52YWxwaGEgPSAxO1xuXHR9IGVsc2UgaWYgKG9iaiBpbnN0YW5jZW9mIENvbG9yKSB7XG5cdFx0dGhpcy5tb2RlbCA9IG9iai5tb2RlbDtcblx0XHR0aGlzLmNvbG9yID0gb2JqLmNvbG9yLnNsaWNlKCk7XG5cdFx0dGhpcy52YWxwaGEgPSBvYmoudmFscGhhO1xuXHR9IGVsc2UgaWYgKHR5cGVvZiBvYmogPT09ICdzdHJpbmcnKSB7XG5cdFx0dmFyIHJlc3VsdCA9IGNvbG9yU3RyaW5nLmdldChvYmopO1xuXHRcdGlmIChyZXN1bHQgPT09IG51bGwpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIHBhcnNlIGNvbG9yIGZyb20gc3RyaW5nOiAnICsgb2JqKTtcblx0XHR9XG5cblx0XHR0aGlzLm1vZGVsID0gcmVzdWx0Lm1vZGVsO1xuXHRcdGNoYW5uZWxzID0gY29udmVydFt0aGlzLm1vZGVsXS5jaGFubmVscztcblx0XHR0aGlzLmNvbG9yID0gcmVzdWx0LnZhbHVlLnNsaWNlKDAsIGNoYW5uZWxzKTtcblx0XHR0aGlzLnZhbHBoYSA9IHR5cGVvZiByZXN1bHQudmFsdWVbY2hhbm5lbHNdID09PSAnbnVtYmVyJyA/IHJlc3VsdC52YWx1ZVtjaGFubmVsc10gOiAxO1xuXHR9IGVsc2UgaWYgKG9iai5sZW5ndGgpIHtcblx0XHR0aGlzLm1vZGVsID0gbW9kZWwgfHwgJ3JnYic7XG5cdFx0Y2hhbm5lbHMgPSBjb252ZXJ0W3RoaXMubW9kZWxdLmNoYW5uZWxzO1xuXHRcdHZhciBuZXdBcnIgPSBfc2xpY2UuY2FsbChvYmosIDAsIGNoYW5uZWxzKTtcblx0XHR0aGlzLmNvbG9yID0gemVyb0FycmF5KG5ld0FyciwgY2hhbm5lbHMpO1xuXHRcdHRoaXMudmFscGhhID0gdHlwZW9mIG9ialtjaGFubmVsc10gPT09ICdudW1iZXInID8gb2JqW2NoYW5uZWxzXSA6IDE7XG5cdH0gZWxzZSBpZiAodHlwZW9mIG9iaiA9PT0gJ251bWJlcicpIHtcblx0XHQvLyB0aGlzIGlzIGFsd2F5cyBSR0IgLSBjYW4gYmUgY29udmVydGVkIGxhdGVyIG9uLlxuXHRcdG9iaiAmPSAweEZGRkZGRjtcblx0XHR0aGlzLm1vZGVsID0gJ3JnYic7XG5cdFx0dGhpcy5jb2xvciA9IFtcblx0XHRcdChvYmogPj4gMTYpICYgMHhGRixcblx0XHRcdChvYmogPj4gOCkgJiAweEZGLFxuXHRcdFx0b2JqICYgMHhGRlxuXHRcdF07XG5cdFx0dGhpcy52YWxwaGEgPSAxO1xuXHR9IGVsc2Uge1xuXHRcdHRoaXMudmFscGhhID0gMTtcblxuXHRcdHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqKTtcblx0XHRpZiAoJ2FscGhhJyBpbiBvYmopIHtcblx0XHRcdGtleXMuc3BsaWNlKGtleXMuaW5kZXhPZignYWxwaGEnKSwgMSk7XG5cdFx0XHR0aGlzLnZhbHBoYSA9IHR5cGVvZiBvYmouYWxwaGEgPT09ICdudW1iZXInID8gb2JqLmFscGhhIDogMDtcblx0XHR9XG5cblx0XHR2YXIgaGFzaGVkS2V5cyA9IGtleXMuc29ydCgpLmpvaW4oJycpO1xuXHRcdGlmICghKGhhc2hlZEtleXMgaW4gaGFzaGVkTW9kZWxLZXlzKSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdVbmFibGUgdG8gcGFyc2UgY29sb3IgZnJvbSBvYmplY3Q6ICcgKyBKU09OLnN0cmluZ2lmeShvYmopKTtcblx0XHR9XG5cblx0XHR0aGlzLm1vZGVsID0gaGFzaGVkTW9kZWxLZXlzW2hhc2hlZEtleXNdO1xuXG5cdFx0dmFyIGxhYmVscyA9IGNvbnZlcnRbdGhpcy5tb2RlbF0ubGFiZWxzO1xuXHRcdHZhciBjb2xvciA9IFtdO1xuXHRcdGZvciAoaSA9IDA7IGkgPCBsYWJlbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGNvbG9yLnB1c2gob2JqW2xhYmVsc1tpXV0pO1xuXHRcdH1cblxuXHRcdHRoaXMuY29sb3IgPSB6ZXJvQXJyYXkoY29sb3IpO1xuXHR9XG5cblx0Ly8gcGVyZm9ybSBsaW1pdGF0aW9ucyAoY2xhbXBpbmcsIGV0Yy4pXG5cdGlmIChsaW1pdGVyc1t0aGlzLm1vZGVsXSkge1xuXHRcdGNoYW5uZWxzID0gY29udmVydFt0aGlzLm1vZGVsXS5jaGFubmVscztcblx0XHRmb3IgKGkgPSAwOyBpIDwgY2hhbm5lbHM7IGkrKykge1xuXHRcdFx0dmFyIGxpbWl0ID0gbGltaXRlcnNbdGhpcy5tb2RlbF1baV07XG5cdFx0XHRpZiAobGltaXQpIHtcblx0XHRcdFx0dGhpcy5jb2xvcltpXSA9IGxpbWl0KHRoaXMuY29sb3JbaV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHRoaXMudmFscGhhID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgdGhpcy52YWxwaGEpKTtcblxuXHRpZiAoT2JqZWN0LmZyZWV6ZSkge1xuXHRcdE9iamVjdC5mcmVlemUodGhpcyk7XG5cdH1cbn1cblxuQ29sb3IucHJvdG90eXBlID0ge1xuXHR0b1N0cmluZzogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB0aGlzLnN0cmluZygpO1xuXHR9LFxuXG5cdHRvSlNPTjogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB0aGlzW3RoaXMubW9kZWxdKCk7XG5cdH0sXG5cblx0c3RyaW5nOiBmdW5jdGlvbiAocGxhY2VzKSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzLm1vZGVsIGluIGNvbG9yU3RyaW5nLnRvID8gdGhpcyA6IHRoaXMucmdiKCk7XG5cdFx0c2VsZiA9IHNlbGYucm91bmQodHlwZW9mIHBsYWNlcyA9PT0gJ251bWJlcicgPyBwbGFjZXMgOiAxKTtcblx0XHR2YXIgYXJncyA9IHNlbGYudmFscGhhID09PSAxID8gc2VsZi5jb2xvciA6IHNlbGYuY29sb3IuY29uY2F0KHRoaXMudmFscGhhKTtcblx0XHRyZXR1cm4gY29sb3JTdHJpbmcudG9bc2VsZi5tb2RlbF0oYXJncyk7XG5cdH0sXG5cblx0cGVyY2VudFN0cmluZzogZnVuY3Rpb24gKHBsYWNlcykge1xuXHRcdHZhciBzZWxmID0gdGhpcy5yZ2IoKS5yb3VuZCh0eXBlb2YgcGxhY2VzID09PSAnbnVtYmVyJyA/IHBsYWNlcyA6IDEpO1xuXHRcdHZhciBhcmdzID0gc2VsZi52YWxwaGEgPT09IDEgPyBzZWxmLmNvbG9yIDogc2VsZi5jb2xvci5jb25jYXQodGhpcy52YWxwaGEpO1xuXHRcdHJldHVybiBjb2xvclN0cmluZy50by5yZ2IucGVyY2VudChhcmdzKTtcblx0fSxcblxuXHRhcnJheTogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB0aGlzLnZhbHBoYSA9PT0gMSA/IHRoaXMuY29sb3Iuc2xpY2UoKSA6IHRoaXMuY29sb3IuY29uY2F0KHRoaXMudmFscGhhKTtcblx0fSxcblxuXHRvYmplY3Q6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgcmVzdWx0ID0ge307XG5cdFx0dmFyIGNoYW5uZWxzID0gY29udmVydFt0aGlzLm1vZGVsXS5jaGFubmVscztcblx0XHR2YXIgbGFiZWxzID0gY29udmVydFt0aGlzLm1vZGVsXS5sYWJlbHM7XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGNoYW5uZWxzOyBpKyspIHtcblx0XHRcdHJlc3VsdFtsYWJlbHNbaV1dID0gdGhpcy5jb2xvcltpXTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy52YWxwaGEgIT09IDEpIHtcblx0XHRcdHJlc3VsdC5hbHBoYSA9IHRoaXMudmFscGhhO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cblx0dW5pdEFycmF5OiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIHJnYiA9IHRoaXMucmdiKCkuY29sb3I7XG5cdFx0cmdiWzBdIC89IDI1NTtcblx0XHRyZ2JbMV0gLz0gMjU1O1xuXHRcdHJnYlsyXSAvPSAyNTU7XG5cblx0XHRpZiAodGhpcy52YWxwaGEgIT09IDEpIHtcblx0XHRcdHJnYi5wdXNoKHRoaXMudmFscGhhKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmdiO1xuXHR9LFxuXG5cdHVuaXRPYmplY3Q6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgcmdiID0gdGhpcy5yZ2IoKS5vYmplY3QoKTtcblx0XHRyZ2IuciAvPSAyNTU7XG5cdFx0cmdiLmcgLz0gMjU1O1xuXHRcdHJnYi5iIC89IDI1NTtcblxuXHRcdGlmICh0aGlzLnZhbHBoYSAhPT0gMSkge1xuXHRcdFx0cmdiLmFscGhhID0gdGhpcy52YWxwaGE7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJnYjtcblx0fSxcblxuXHRyb3VuZDogZnVuY3Rpb24gKHBsYWNlcykge1xuXHRcdHBsYWNlcyA9IE1hdGgubWF4KHBsYWNlcyB8fCAwLCAwKTtcblx0XHRyZXR1cm4gbmV3IENvbG9yKHRoaXMuY29sb3IubWFwKHJvdW5kVG9QbGFjZShwbGFjZXMpKS5jb25jYXQodGhpcy52YWxwaGEpLCB0aGlzLm1vZGVsKTtcblx0fSxcblxuXHRhbHBoYTogZnVuY3Rpb24gKHZhbCkge1xuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gbmV3IENvbG9yKHRoaXMuY29sb3IuY29uY2F0KE1hdGgubWF4KDAsIE1hdGgubWluKDEsIHZhbCkpKSwgdGhpcy5tb2RlbCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMudmFscGhhO1xuXHR9LFxuXG5cdC8vIHJnYlxuXHRyZWQ6IGdldHNldCgncmdiJywgMCwgbWF4Zm4oMjU1KSksXG5cdGdyZWVuOiBnZXRzZXQoJ3JnYicsIDEsIG1heGZuKDI1NSkpLFxuXHRibHVlOiBnZXRzZXQoJ3JnYicsIDIsIG1heGZuKDI1NSkpLFxuXG5cdGh1ZTogZ2V0c2V0KFsnaHNsJywgJ2hzdicsICdoc2wnLCAnaHdiJywgJ2hjZyddLCAwLCBmdW5jdGlvbiAodmFsKSB7IHJldHVybiAoKHZhbCAlIDM2MCkgKyAzNjApICUgMzYwOyB9KSwgLy8gZXNsaW50LWRpc2FibGUtbGluZSBicmFjZS1zdHlsZVxuXG5cdHNhdHVyYXRpb25sOiBnZXRzZXQoJ2hzbCcsIDEsIG1heGZuKDEwMCkpLFxuXHRsaWdodG5lc3M6IGdldHNldCgnaHNsJywgMiwgbWF4Zm4oMTAwKSksXG5cblx0c2F0dXJhdGlvbnY6IGdldHNldCgnaHN2JywgMSwgbWF4Zm4oMTAwKSksXG5cdHZhbHVlOiBnZXRzZXQoJ2hzdicsIDIsIG1heGZuKDEwMCkpLFxuXG5cdGNocm9tYTogZ2V0c2V0KCdoY2cnLCAxLCBtYXhmbigxMDApKSxcblx0Z3JheTogZ2V0c2V0KCdoY2cnLCAyLCBtYXhmbigxMDApKSxcblxuXHR3aGl0ZTogZ2V0c2V0KCdod2InLCAxLCBtYXhmbigxMDApKSxcblx0d2JsYWNrOiBnZXRzZXQoJ2h3YicsIDIsIG1heGZuKDEwMCkpLFxuXG5cdGN5YW46IGdldHNldCgnY215aycsIDAsIG1heGZuKDEwMCkpLFxuXHRtYWdlbnRhOiBnZXRzZXQoJ2NteWsnLCAxLCBtYXhmbigxMDApKSxcblx0eWVsbG93OiBnZXRzZXQoJ2NteWsnLCAyLCBtYXhmbigxMDApKSxcblx0YmxhY2s6IGdldHNldCgnY215aycsIDMsIG1heGZuKDEwMCkpLFxuXG5cdHg6IGdldHNldCgneHl6JywgMCwgbWF4Zm4oMTAwKSksXG5cdHk6IGdldHNldCgneHl6JywgMSwgbWF4Zm4oMTAwKSksXG5cdHo6IGdldHNldCgneHl6JywgMiwgbWF4Zm4oMTAwKSksXG5cblx0bDogZ2V0c2V0KCdsYWInLCAwLCBtYXhmbigxMDApKSxcblx0YTogZ2V0c2V0KCdsYWInLCAxKSxcblx0YjogZ2V0c2V0KCdsYWInLCAyKSxcblxuXHRrZXl3b3JkOiBmdW5jdGlvbiAodmFsKSB7XG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGgpIHtcblx0XHRcdHJldHVybiBuZXcgQ29sb3IodmFsKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gY29udmVydFt0aGlzLm1vZGVsXS5rZXl3b3JkKHRoaXMuY29sb3IpO1xuXHR9LFxuXG5cdGhleDogZnVuY3Rpb24gKHZhbCkge1xuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gbmV3IENvbG9yKHZhbCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNvbG9yU3RyaW5nLnRvLmhleCh0aGlzLnJnYigpLnJvdW5kKCkuY29sb3IpO1xuXHR9LFxuXG5cdHJnYk51bWJlcjogZnVuY3Rpb24gKCkge1xuXHRcdHZhciByZ2IgPSB0aGlzLnJnYigpLmNvbG9yO1xuXHRcdHJldHVybiAoKHJnYlswXSAmIDB4RkYpIDw8IDE2KSB8ICgocmdiWzFdICYgMHhGRikgPDwgOCkgfCAocmdiWzJdICYgMHhGRik7XG5cdH0sXG5cblx0bHVtaW5vc2l0eTogZnVuY3Rpb24gKCkge1xuXHRcdC8vIGh0dHA6Ly93d3cudzMub3JnL1RSL1dDQUcyMC8jcmVsYXRpdmVsdW1pbmFuY2VkZWZcblx0XHR2YXIgcmdiID0gdGhpcy5yZ2IoKS5jb2xvcjtcblxuXHRcdHZhciBsdW0gPSBbXTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJnYi5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGNoYW4gPSByZ2JbaV0gLyAyNTU7XG5cdFx0XHRsdW1baV0gPSAoY2hhbiA8PSAwLjAzOTI4KSA/IGNoYW4gLyAxMi45MiA6IE1hdGgucG93KCgoY2hhbiArIDAuMDU1KSAvIDEuMDU1KSwgMi40KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gMC4yMTI2ICogbHVtWzBdICsgMC43MTUyICogbHVtWzFdICsgMC4wNzIyICogbHVtWzJdO1xuXHR9LFxuXG5cdGNvbnRyYXN0OiBmdW5jdGlvbiAoY29sb3IyKSB7XG5cdFx0Ly8gaHR0cDovL3d3dy53My5vcmcvVFIvV0NBRzIwLyNjb250cmFzdC1yYXRpb2RlZlxuXHRcdHZhciBsdW0xID0gdGhpcy5sdW1pbm9zaXR5KCk7XG5cdFx0dmFyIGx1bTIgPSBjb2xvcjIubHVtaW5vc2l0eSgpO1xuXG5cdFx0aWYgKGx1bTEgPiBsdW0yKSB7XG5cdFx0XHRyZXR1cm4gKGx1bTEgKyAwLjA1KSAvIChsdW0yICsgMC4wNSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChsdW0yICsgMC4wNSkgLyAobHVtMSArIDAuMDUpO1xuXHR9LFxuXG5cdGxldmVsOiBmdW5jdGlvbiAoY29sb3IyKSB7XG5cdFx0dmFyIGNvbnRyYXN0UmF0aW8gPSB0aGlzLmNvbnRyYXN0KGNvbG9yMik7XG5cdFx0aWYgKGNvbnRyYXN0UmF0aW8gPj0gNy4xKSB7XG5cdFx0XHRyZXR1cm4gJ0FBQSc7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChjb250cmFzdFJhdGlvID49IDQuNSkgPyAnQUEnIDogJyc7XG5cdH0sXG5cblx0aXNEYXJrOiBmdW5jdGlvbiAoKSB7XG5cdFx0Ly8gWUlRIGVxdWF0aW9uIGZyb20gaHR0cDovLzI0d2F5cy5vcmcvMjAxMC9jYWxjdWxhdGluZy1jb2xvci1jb250cmFzdFxuXHRcdHZhciByZ2IgPSB0aGlzLnJnYigpLmNvbG9yO1xuXHRcdHZhciB5aXEgPSAocmdiWzBdICogMjk5ICsgcmdiWzFdICogNTg3ICsgcmdiWzJdICogMTE0KSAvIDEwMDA7XG5cdFx0cmV0dXJuIHlpcSA8IDEyODtcblx0fSxcblxuXHRpc0xpZ2h0OiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuICF0aGlzLmlzRGFyaygpO1xuXHR9LFxuXG5cdG5lZ2F0ZTogZnVuY3Rpb24gKCkge1xuXHRcdHZhciByZ2IgPSB0aGlzLnJnYigpO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XG5cdFx0XHRyZ2IuY29sb3JbaV0gPSAyNTUgLSByZ2IuY29sb3JbaV07XG5cdFx0fVxuXHRcdHJldHVybiByZ2I7XG5cdH0sXG5cblx0bGlnaHRlbjogZnVuY3Rpb24gKHJhdGlvKSB7XG5cdFx0dmFyIGhzbCA9IHRoaXMuaHNsKCk7XG5cdFx0aHNsLmNvbG9yWzJdICs9IGhzbC5jb2xvclsyXSAqIHJhdGlvO1xuXHRcdHJldHVybiBoc2w7XG5cdH0sXG5cblx0ZGFya2VuOiBmdW5jdGlvbiAocmF0aW8pIHtcblx0XHR2YXIgaHNsID0gdGhpcy5oc2woKTtcblx0XHRoc2wuY29sb3JbMl0gLT0gaHNsLmNvbG9yWzJdICogcmF0aW87XG5cdFx0cmV0dXJuIGhzbDtcblx0fSxcblxuXHRzYXR1cmF0ZTogZnVuY3Rpb24gKHJhdGlvKSB7XG5cdFx0dmFyIGhzbCA9IHRoaXMuaHNsKCk7XG5cdFx0aHNsLmNvbG9yWzFdICs9IGhzbC5jb2xvclsxXSAqIHJhdGlvO1xuXHRcdHJldHVybiBoc2w7XG5cdH0sXG5cblx0ZGVzYXR1cmF0ZTogZnVuY3Rpb24gKHJhdGlvKSB7XG5cdFx0dmFyIGhzbCA9IHRoaXMuaHNsKCk7XG5cdFx0aHNsLmNvbG9yWzFdIC09IGhzbC5jb2xvclsxXSAqIHJhdGlvO1xuXHRcdHJldHVybiBoc2w7XG5cdH0sXG5cblx0d2hpdGVuOiBmdW5jdGlvbiAocmF0aW8pIHtcblx0XHR2YXIgaHdiID0gdGhpcy5od2IoKTtcblx0XHRod2IuY29sb3JbMV0gKz0gaHdiLmNvbG9yWzFdICogcmF0aW87XG5cdFx0cmV0dXJuIGh3Yjtcblx0fSxcblxuXHRibGFja2VuOiBmdW5jdGlvbiAocmF0aW8pIHtcblx0XHR2YXIgaHdiID0gdGhpcy5od2IoKTtcblx0XHRod2IuY29sb3JbMl0gKz0gaHdiLmNvbG9yWzJdICogcmF0aW87XG5cdFx0cmV0dXJuIGh3Yjtcblx0fSxcblxuXHRncmF5c2NhbGU6IGZ1bmN0aW9uICgpIHtcblx0XHQvLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0dyYXlzY2FsZSNDb252ZXJ0aW5nX2NvbG9yX3RvX2dyYXlzY2FsZVxuXHRcdHZhciByZ2IgPSB0aGlzLnJnYigpLmNvbG9yO1xuXHRcdHZhciB2YWwgPSByZ2JbMF0gKiAwLjMgKyByZ2JbMV0gKiAwLjU5ICsgcmdiWzJdICogMC4xMTtcblx0XHRyZXR1cm4gQ29sb3IucmdiKHZhbCwgdmFsLCB2YWwpO1xuXHR9LFxuXG5cdGZhZGU6IGZ1bmN0aW9uIChyYXRpbykge1xuXHRcdHJldHVybiB0aGlzLmFscGhhKHRoaXMudmFscGhhIC0gKHRoaXMudmFscGhhICogcmF0aW8pKTtcblx0fSxcblxuXHRvcGFxdWVyOiBmdW5jdGlvbiAocmF0aW8pIHtcblx0XHRyZXR1cm4gdGhpcy5hbHBoYSh0aGlzLnZhbHBoYSArICh0aGlzLnZhbHBoYSAqIHJhdGlvKSk7XG5cdH0sXG5cblx0cm90YXRlOiBmdW5jdGlvbiAoZGVncmVlcykge1xuXHRcdHZhciBoc2wgPSB0aGlzLmhzbCgpO1xuXHRcdHZhciBodWUgPSBoc2wuY29sb3JbMF07XG5cdFx0aHVlID0gKGh1ZSArIGRlZ3JlZXMpICUgMzYwO1xuXHRcdGh1ZSA9IGh1ZSA8IDAgPyAzNjAgKyBodWUgOiBodWU7XG5cdFx0aHNsLmNvbG9yWzBdID0gaHVlO1xuXHRcdHJldHVybiBoc2w7XG5cdH0sXG5cblx0bWl4OiBmdW5jdGlvbiAobWl4aW5Db2xvciwgd2VpZ2h0KSB7XG5cdFx0Ly8gcG9ydGVkIGZyb20gc2FzcyBpbXBsZW1lbnRhdGlvbiBpbiBDXG5cdFx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL3Nhc3MvbGlic2Fzcy9ibG9iLzBlNmI0YTI4NTAwOTIzNTZhYTNlY2UwN2M2YjI0OWYwMjIxY2FjZWQvZnVuY3Rpb25zLmNwcCNMMjA5XG5cdFx0dmFyIGNvbG9yMSA9IG1peGluQ29sb3IucmdiKCk7XG5cdFx0dmFyIGNvbG9yMiA9IHRoaXMucmdiKCk7XG5cdFx0dmFyIHAgPSB3ZWlnaHQgPT09IHVuZGVmaW5lZCA/IDAuNSA6IHdlaWdodDtcblxuXHRcdHZhciB3ID0gMiAqIHAgLSAxO1xuXHRcdHZhciBhID0gY29sb3IxLmFscGhhKCkgLSBjb2xvcjIuYWxwaGEoKTtcblxuXHRcdHZhciB3MSA9ICgoKHcgKiBhID09PSAtMSkgPyB3IDogKHcgKyBhKSAvICgxICsgdyAqIGEpKSArIDEpIC8gMi4wO1xuXHRcdHZhciB3MiA9IDEgLSB3MTtcblxuXHRcdHJldHVybiBDb2xvci5yZ2IoXG5cdFx0XHRcdHcxICogY29sb3IxLnJlZCgpICsgdzIgKiBjb2xvcjIucmVkKCksXG5cdFx0XHRcdHcxICogY29sb3IxLmdyZWVuKCkgKyB3MiAqIGNvbG9yMi5ncmVlbigpLFxuXHRcdFx0XHR3MSAqIGNvbG9yMS5ibHVlKCkgKyB3MiAqIGNvbG9yMi5ibHVlKCksXG5cdFx0XHRcdGNvbG9yMS5hbHBoYSgpICogcCArIGNvbG9yMi5hbHBoYSgpICogKDEgLSBwKSk7XG5cdH1cbn07XG5cbi8vIG1vZGVsIGNvbnZlcnNpb24gbWV0aG9kcyBhbmQgc3RhdGljIGNvbnN0cnVjdG9yc1xuT2JqZWN0LmtleXMoY29udmVydCkuZm9yRWFjaChmdW5jdGlvbiAobW9kZWwpIHtcblx0aWYgKHNraXBwZWRNb2RlbHMuaW5kZXhPZihtb2RlbCkgIT09IC0xKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0dmFyIGNoYW5uZWxzID0gY29udmVydFttb2RlbF0uY2hhbm5lbHM7XG5cblx0Ly8gY29udmVyc2lvbiBtZXRob2RzXG5cdENvbG9yLnByb3RvdHlwZVttb2RlbF0gPSBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMubW9kZWwgPT09IG1vZGVsKSB7XG5cdFx0XHRyZXR1cm4gbmV3IENvbG9yKHRoaXMpO1xuXHRcdH1cblxuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gbmV3IENvbG9yKGFyZ3VtZW50cywgbW9kZWwpO1xuXHRcdH1cblxuXHRcdHZhciBuZXdBbHBoYSA9IHR5cGVvZiBhcmd1bWVudHNbY2hhbm5lbHNdID09PSAnbnVtYmVyJyA/IGNoYW5uZWxzIDogdGhpcy52YWxwaGE7XG5cdFx0cmV0dXJuIG5ldyBDb2xvcihhc3NlcnRBcnJheShjb252ZXJ0W3RoaXMubW9kZWxdW21vZGVsXS5yYXcodGhpcy5jb2xvcikpLmNvbmNhdChuZXdBbHBoYSksIG1vZGVsKTtcblx0fTtcblxuXHQvLyAnc3RhdGljJyBjb25zdHJ1Y3Rpb24gbWV0aG9kc1xuXHRDb2xvclttb2RlbF0gPSBmdW5jdGlvbiAoY29sb3IpIHtcblx0XHRpZiAodHlwZW9mIGNvbG9yID09PSAnbnVtYmVyJykge1xuXHRcdFx0Y29sb3IgPSB6ZXJvQXJyYXkoX3NsaWNlLmNhbGwoYXJndW1lbnRzKSwgY2hhbm5lbHMpO1xuXHRcdH1cblx0XHRyZXR1cm4gbmV3IENvbG9yKGNvbG9yLCBtb2RlbCk7XG5cdH07XG59KTtcblxuZnVuY3Rpb24gcm91bmRUbyhudW0sIHBsYWNlcykge1xuXHRyZXR1cm4gTnVtYmVyKG51bS50b0ZpeGVkKHBsYWNlcykpO1xufVxuXG5mdW5jdGlvbiByb3VuZFRvUGxhY2UocGxhY2VzKSB7XG5cdHJldHVybiBmdW5jdGlvbiAobnVtKSB7XG5cdFx0cmV0dXJuIHJvdW5kVG8obnVtLCBwbGFjZXMpO1xuXHR9O1xufVxuXG5mdW5jdGlvbiBnZXRzZXQobW9kZWwsIGNoYW5uZWwsIG1vZGlmaWVyKSB7XG5cdG1vZGVsID0gQXJyYXkuaXNBcnJheShtb2RlbCkgPyBtb2RlbCA6IFttb2RlbF07XG5cblx0bW9kZWwuZm9yRWFjaChmdW5jdGlvbiAobSkge1xuXHRcdChsaW1pdGVyc1ttXSB8fCAobGltaXRlcnNbbV0gPSBbXSkpW2NoYW5uZWxdID0gbW9kaWZpZXI7XG5cdH0pO1xuXG5cdG1vZGVsID0gbW9kZWxbMF07XG5cblx0cmV0dXJuIGZ1bmN0aW9uICh2YWwpIHtcblx0XHR2YXIgcmVzdWx0O1xuXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGgpIHtcblx0XHRcdGlmIChtb2RpZmllcikge1xuXHRcdFx0XHR2YWwgPSBtb2RpZmllcih2YWwpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXN1bHQgPSB0aGlzW21vZGVsXSgpO1xuXHRcdFx0cmVzdWx0LmNvbG9yW2NoYW5uZWxdID0gdmFsO1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cblx0XHRyZXN1bHQgPSB0aGlzW21vZGVsXSgpLmNvbG9yW2NoYW5uZWxdO1xuXHRcdGlmIChtb2RpZmllcikge1xuXHRcdFx0cmVzdWx0ID0gbW9kaWZpZXIocmVzdWx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9O1xufVxuXG5mdW5jdGlvbiBtYXhmbihtYXgpIHtcblx0cmV0dXJuIGZ1bmN0aW9uICh2KSB7XG5cdFx0cmV0dXJuIE1hdGgubWF4KDAsIE1hdGgubWluKG1heCwgdikpO1xuXHR9O1xufVxuXG5mdW5jdGlvbiBhc3NlcnRBcnJheSh2YWwpIHtcblx0cmV0dXJuIEFycmF5LmlzQXJyYXkodmFsKSA/IHZhbCA6IFt2YWxdO1xufVxuXG5mdW5jdGlvbiB6ZXJvQXJyYXkoYXJyLCBsZW5ndGgpIHtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuXHRcdGlmICh0eXBlb2YgYXJyW2ldICE9PSAnbnVtYmVyJykge1xuXHRcdFx0YXJyW2ldID0gMDtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gYXJyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbG9yO1xuIiwiLyogTUlUIGxpY2Vuc2UgKi9cbnZhciBjc3NLZXl3b3JkcyA9IHJlcXVpcmUoJ2NvbG9yLW5hbWUnKTtcblxuLy8gTk9URTogY29udmVyc2lvbnMgc2hvdWxkIG9ubHkgcmV0dXJuIHByaW1pdGl2ZSB2YWx1ZXMgKGkuZS4gYXJyYXlzLCBvclxuLy8gICAgICAgdmFsdWVzIHRoYXQgZ2l2ZSBjb3JyZWN0IGB0eXBlb2ZgIHJlc3VsdHMpLlxuLy8gICAgICAgZG8gbm90IHVzZSBib3ggdmFsdWVzIHR5cGVzIChpLmUuIE51bWJlcigpLCBTdHJpbmcoKSwgZXRjLilcblxudmFyIHJldmVyc2VLZXl3b3JkcyA9IHt9O1xuZm9yICh2YXIga2V5IGluIGNzc0tleXdvcmRzKSB7XG5cdGlmIChjc3NLZXl3b3Jkcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG5cdFx0cmV2ZXJzZUtleXdvcmRzW2Nzc0tleXdvcmRzW2tleV1dID0ga2V5O1xuXHR9XG59XG5cbnZhciBjb252ZXJ0ID0gbW9kdWxlLmV4cG9ydHMgPSB7XG5cdHJnYjoge2NoYW5uZWxzOiAzLCBsYWJlbHM6ICdyZ2InfSxcblx0aHNsOiB7Y2hhbm5lbHM6IDMsIGxhYmVsczogJ2hzbCd9LFxuXHRoc3Y6IHtjaGFubmVsczogMywgbGFiZWxzOiAnaHN2J30sXG5cdGh3Yjoge2NoYW5uZWxzOiAzLCBsYWJlbHM6ICdod2InfSxcblx0Y215azoge2NoYW5uZWxzOiA0LCBsYWJlbHM6ICdjbXlrJ30sXG5cdHh5ejoge2NoYW5uZWxzOiAzLCBsYWJlbHM6ICd4eXonfSxcblx0bGFiOiB7Y2hhbm5lbHM6IDMsIGxhYmVsczogJ2xhYid9LFxuXHRsY2g6IHtjaGFubmVsczogMywgbGFiZWxzOiAnbGNoJ30sXG5cdGhleDoge2NoYW5uZWxzOiAxLCBsYWJlbHM6IFsnaGV4J119LFxuXHRrZXl3b3JkOiB7Y2hhbm5lbHM6IDEsIGxhYmVsczogWydrZXl3b3JkJ119LFxuXHRhbnNpMTY6IHtjaGFubmVsczogMSwgbGFiZWxzOiBbJ2Fuc2kxNiddfSxcblx0YW5zaTI1Njoge2NoYW5uZWxzOiAxLCBsYWJlbHM6IFsnYW5zaTI1NiddfSxcblx0aGNnOiB7Y2hhbm5lbHM6IDMsIGxhYmVsczogWydoJywgJ2MnLCAnZyddfSxcblx0YXBwbGU6IHtjaGFubmVsczogMywgbGFiZWxzOiBbJ3IxNicsICdnMTYnLCAnYjE2J119LFxuXHRncmF5OiB7Y2hhbm5lbHM6IDEsIGxhYmVsczogWydncmF5J119XG59O1xuXG4vLyBoaWRlIC5jaGFubmVscyBhbmQgLmxhYmVscyBwcm9wZXJ0aWVzXG5mb3IgKHZhciBtb2RlbCBpbiBjb252ZXJ0KSB7XG5cdGlmIChjb252ZXJ0Lmhhc093blByb3BlcnR5KG1vZGVsKSkge1xuXHRcdGlmICghKCdjaGFubmVscycgaW4gY29udmVydFttb2RlbF0pKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ21pc3NpbmcgY2hhbm5lbHMgcHJvcGVydHk6ICcgKyBtb2RlbCk7XG5cdFx0fVxuXG5cdFx0aWYgKCEoJ2xhYmVscycgaW4gY29udmVydFttb2RlbF0pKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ21pc3NpbmcgY2hhbm5lbCBsYWJlbHMgcHJvcGVydHk6ICcgKyBtb2RlbCk7XG5cdFx0fVxuXG5cdFx0aWYgKGNvbnZlcnRbbW9kZWxdLmxhYmVscy5sZW5ndGggIT09IGNvbnZlcnRbbW9kZWxdLmNoYW5uZWxzKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ2NoYW5uZWwgYW5kIGxhYmVsIGNvdW50cyBtaXNtYXRjaDogJyArIG1vZGVsKTtcblx0XHR9XG5cblx0XHR2YXIgY2hhbm5lbHMgPSBjb252ZXJ0W21vZGVsXS5jaGFubmVscztcblx0XHR2YXIgbGFiZWxzID0gY29udmVydFttb2RlbF0ubGFiZWxzO1xuXHRcdGRlbGV0ZSBjb252ZXJ0W21vZGVsXS5jaGFubmVscztcblx0XHRkZWxldGUgY29udmVydFttb2RlbF0ubGFiZWxzO1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb252ZXJ0W21vZGVsXSwgJ2NoYW5uZWxzJywge3ZhbHVlOiBjaGFubmVsc30pO1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb252ZXJ0W21vZGVsXSwgJ2xhYmVscycsIHt2YWx1ZTogbGFiZWxzfSk7XG5cdH1cbn1cblxuY29udmVydC5yZ2IuaHNsID0gZnVuY3Rpb24gKHJnYikge1xuXHR2YXIgciA9IHJnYlswXSAvIDI1NTtcblx0dmFyIGcgPSByZ2JbMV0gLyAyNTU7XG5cdHZhciBiID0gcmdiWzJdIC8gMjU1O1xuXHR2YXIgbWluID0gTWF0aC5taW4ociwgZywgYik7XG5cdHZhciBtYXggPSBNYXRoLm1heChyLCBnLCBiKTtcblx0dmFyIGRlbHRhID0gbWF4IC0gbWluO1xuXHR2YXIgaDtcblx0dmFyIHM7XG5cdHZhciBsO1xuXG5cdGlmIChtYXggPT09IG1pbikge1xuXHRcdGggPSAwO1xuXHR9IGVsc2UgaWYgKHIgPT09IG1heCkge1xuXHRcdGggPSAoZyAtIGIpIC8gZGVsdGE7XG5cdH0gZWxzZSBpZiAoZyA9PT0gbWF4KSB7XG5cdFx0aCA9IDIgKyAoYiAtIHIpIC8gZGVsdGE7XG5cdH0gZWxzZSBpZiAoYiA9PT0gbWF4KSB7XG5cdFx0aCA9IDQgKyAociAtIGcpIC8gZGVsdGE7XG5cdH1cblxuXHRoID0gTWF0aC5taW4oaCAqIDYwLCAzNjApO1xuXG5cdGlmIChoIDwgMCkge1xuXHRcdGggKz0gMzYwO1xuXHR9XG5cblx0bCA9IChtaW4gKyBtYXgpIC8gMjtcblxuXHRpZiAobWF4ID09PSBtaW4pIHtcblx0XHRzID0gMDtcblx0fSBlbHNlIGlmIChsIDw9IDAuNSkge1xuXHRcdHMgPSBkZWx0YSAvIChtYXggKyBtaW4pO1xuXHR9IGVsc2Uge1xuXHRcdHMgPSBkZWx0YSAvICgyIC0gbWF4IC0gbWluKTtcblx0fVxuXG5cdHJldHVybiBbaCwgcyAqIDEwMCwgbCAqIDEwMF07XG59O1xuXG5jb252ZXJ0LnJnYi5oc3YgPSBmdW5jdGlvbiAocmdiKSB7XG5cdHZhciByZGlmO1xuXHR2YXIgZ2RpZjtcblx0dmFyIGJkaWY7XG5cdHZhciBoO1xuXHR2YXIgcztcblxuXHR2YXIgciA9IHJnYlswXSAvIDI1NTtcblx0dmFyIGcgPSByZ2JbMV0gLyAyNTU7XG5cdHZhciBiID0gcmdiWzJdIC8gMjU1O1xuXHR2YXIgdiA9IE1hdGgubWF4KHIsIGcsIGIpO1xuXHR2YXIgZGlmZiA9IHYgLSBNYXRoLm1pbihyLCBnLCBiKTtcblx0dmFyIGRpZmZjID0gZnVuY3Rpb24gKGMpIHtcblx0XHRyZXR1cm4gKHYgLSBjKSAvIDYgLyBkaWZmICsgMSAvIDI7XG5cdH07XG5cblx0aWYgKGRpZmYgPT09IDApIHtcblx0XHRoID0gcyA9IDA7XG5cdH0gZWxzZSB7XG5cdFx0cyA9IGRpZmYgLyB2O1xuXHRcdHJkaWYgPSBkaWZmYyhyKTtcblx0XHRnZGlmID0gZGlmZmMoZyk7XG5cdFx0YmRpZiA9IGRpZmZjKGIpO1xuXG5cdFx0aWYgKHIgPT09IHYpIHtcblx0XHRcdGggPSBiZGlmIC0gZ2RpZjtcblx0XHR9IGVsc2UgaWYgKGcgPT09IHYpIHtcblx0XHRcdGggPSAoMSAvIDMpICsgcmRpZiAtIGJkaWY7XG5cdFx0fSBlbHNlIGlmIChiID09PSB2KSB7XG5cdFx0XHRoID0gKDIgLyAzKSArIGdkaWYgLSByZGlmO1xuXHRcdH1cblx0XHRpZiAoaCA8IDApIHtcblx0XHRcdGggKz0gMTtcblx0XHR9IGVsc2UgaWYgKGggPiAxKSB7XG5cdFx0XHRoIC09IDE7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIFtcblx0XHRoICogMzYwLFxuXHRcdHMgKiAxMDAsXG5cdFx0diAqIDEwMFxuXHRdO1xufTtcblxuY29udmVydC5yZ2IuaHdiID0gZnVuY3Rpb24gKHJnYikge1xuXHR2YXIgciA9IHJnYlswXTtcblx0dmFyIGcgPSByZ2JbMV07XG5cdHZhciBiID0gcmdiWzJdO1xuXHR2YXIgaCA9IGNvbnZlcnQucmdiLmhzbChyZ2IpWzBdO1xuXHR2YXIgdyA9IDEgLyAyNTUgKiBNYXRoLm1pbihyLCBNYXRoLm1pbihnLCBiKSk7XG5cblx0YiA9IDEgLSAxIC8gMjU1ICogTWF0aC5tYXgociwgTWF0aC5tYXgoZywgYikpO1xuXG5cdHJldHVybiBbaCwgdyAqIDEwMCwgYiAqIDEwMF07XG59O1xuXG5jb252ZXJ0LnJnYi5jbXlrID0gZnVuY3Rpb24gKHJnYikge1xuXHR2YXIgciA9IHJnYlswXSAvIDI1NTtcblx0dmFyIGcgPSByZ2JbMV0gLyAyNTU7XG5cdHZhciBiID0gcmdiWzJdIC8gMjU1O1xuXHR2YXIgYztcblx0dmFyIG07XG5cdHZhciB5O1xuXHR2YXIgaztcblxuXHRrID0gTWF0aC5taW4oMSAtIHIsIDEgLSBnLCAxIC0gYik7XG5cdGMgPSAoMSAtIHIgLSBrKSAvICgxIC0gaykgfHwgMDtcblx0bSA9ICgxIC0gZyAtIGspIC8gKDEgLSBrKSB8fCAwO1xuXHR5ID0gKDEgLSBiIC0gaykgLyAoMSAtIGspIHx8IDA7XG5cblx0cmV0dXJuIFtjICogMTAwLCBtICogMTAwLCB5ICogMTAwLCBrICogMTAwXTtcbn07XG5cbi8qKlxuICogU2VlIGh0dHBzOi8vZW4ubS53aWtpcGVkaWEub3JnL3dpa2kvRXVjbGlkZWFuX2Rpc3RhbmNlI1NxdWFyZWRfRXVjbGlkZWFuX2Rpc3RhbmNlXG4gKiAqL1xuZnVuY3Rpb24gY29tcGFyYXRpdmVEaXN0YW5jZSh4LCB5KSB7XG5cdHJldHVybiAoXG5cdFx0TWF0aC5wb3coeFswXSAtIHlbMF0sIDIpICtcblx0XHRNYXRoLnBvdyh4WzFdIC0geVsxXSwgMikgK1xuXHRcdE1hdGgucG93KHhbMl0gLSB5WzJdLCAyKVxuXHQpO1xufVxuXG5jb252ZXJ0LnJnYi5rZXl3b3JkID0gZnVuY3Rpb24gKHJnYikge1xuXHR2YXIgcmV2ZXJzZWQgPSByZXZlcnNlS2V5d29yZHNbcmdiXTtcblx0aWYgKHJldmVyc2VkKSB7XG5cdFx0cmV0dXJuIHJldmVyc2VkO1xuXHR9XG5cblx0dmFyIGN1cnJlbnRDbG9zZXN0RGlzdGFuY2UgPSBJbmZpbml0eTtcblx0dmFyIGN1cnJlbnRDbG9zZXN0S2V5d29yZDtcblxuXHRmb3IgKHZhciBrZXl3b3JkIGluIGNzc0tleXdvcmRzKSB7XG5cdFx0aWYgKGNzc0tleXdvcmRzLmhhc093blByb3BlcnR5KGtleXdvcmQpKSB7XG5cdFx0XHR2YXIgdmFsdWUgPSBjc3NLZXl3b3Jkc1trZXl3b3JkXTtcblxuXHRcdFx0Ly8gQ29tcHV0ZSBjb21wYXJhdGl2ZSBkaXN0YW5jZVxuXHRcdFx0dmFyIGRpc3RhbmNlID0gY29tcGFyYXRpdmVEaXN0YW5jZShyZ2IsIHZhbHVlKTtcblxuXHRcdFx0Ly8gQ2hlY2sgaWYgaXRzIGxlc3MsIGlmIHNvIHNldCBhcyBjbG9zZXN0XG5cdFx0XHRpZiAoZGlzdGFuY2UgPCBjdXJyZW50Q2xvc2VzdERpc3RhbmNlKSB7XG5cdFx0XHRcdGN1cnJlbnRDbG9zZXN0RGlzdGFuY2UgPSBkaXN0YW5jZTtcblx0XHRcdFx0Y3VycmVudENsb3Nlc3RLZXl3b3JkID0ga2V5d29yZDtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gY3VycmVudENsb3Nlc3RLZXl3b3JkO1xufTtcblxuY29udmVydC5rZXl3b3JkLnJnYiA9IGZ1bmN0aW9uIChrZXl3b3JkKSB7XG5cdHJldHVybiBjc3NLZXl3b3Jkc1trZXl3b3JkXTtcbn07XG5cbmNvbnZlcnQucmdiLnh5eiA9IGZ1bmN0aW9uIChyZ2IpIHtcblx0dmFyIHIgPSByZ2JbMF0gLyAyNTU7XG5cdHZhciBnID0gcmdiWzFdIC8gMjU1O1xuXHR2YXIgYiA9IHJnYlsyXSAvIDI1NTtcblxuXHQvLyBhc3N1bWUgc1JHQlxuXHRyID0gciA+IDAuMDQwNDUgPyBNYXRoLnBvdygoKHIgKyAwLjA1NSkgLyAxLjA1NSksIDIuNCkgOiAociAvIDEyLjkyKTtcblx0ZyA9IGcgPiAwLjA0MDQ1ID8gTWF0aC5wb3coKChnICsgMC4wNTUpIC8gMS4wNTUpLCAyLjQpIDogKGcgLyAxMi45Mik7XG5cdGIgPSBiID4gMC4wNDA0NSA/IE1hdGgucG93KCgoYiArIDAuMDU1KSAvIDEuMDU1KSwgMi40KSA6IChiIC8gMTIuOTIpO1xuXG5cdHZhciB4ID0gKHIgKiAwLjQxMjQpICsgKGcgKiAwLjM1NzYpICsgKGIgKiAwLjE4MDUpO1xuXHR2YXIgeSA9IChyICogMC4yMTI2KSArIChnICogMC43MTUyKSArIChiICogMC4wNzIyKTtcblx0dmFyIHogPSAociAqIDAuMDE5MykgKyAoZyAqIDAuMTE5MikgKyAoYiAqIDAuOTUwNSk7XG5cblx0cmV0dXJuIFt4ICogMTAwLCB5ICogMTAwLCB6ICogMTAwXTtcbn07XG5cbmNvbnZlcnQucmdiLmxhYiA9IGZ1bmN0aW9uIChyZ2IpIHtcblx0dmFyIHh5eiA9IGNvbnZlcnQucmdiLnh5eihyZ2IpO1xuXHR2YXIgeCA9IHh5elswXTtcblx0dmFyIHkgPSB4eXpbMV07XG5cdHZhciB6ID0geHl6WzJdO1xuXHR2YXIgbDtcblx0dmFyIGE7XG5cdHZhciBiO1xuXG5cdHggLz0gOTUuMDQ3O1xuXHR5IC89IDEwMDtcblx0eiAvPSAxMDguODgzO1xuXG5cdHggPSB4ID4gMC4wMDg4NTYgPyBNYXRoLnBvdyh4LCAxIC8gMykgOiAoNy43ODcgKiB4KSArICgxNiAvIDExNik7XG5cdHkgPSB5ID4gMC4wMDg4NTYgPyBNYXRoLnBvdyh5LCAxIC8gMykgOiAoNy43ODcgKiB5KSArICgxNiAvIDExNik7XG5cdHogPSB6ID4gMC4wMDg4NTYgPyBNYXRoLnBvdyh6LCAxIC8gMykgOiAoNy43ODcgKiB6KSArICgxNiAvIDExNik7XG5cblx0bCA9ICgxMTYgKiB5KSAtIDE2O1xuXHRhID0gNTAwICogKHggLSB5KTtcblx0YiA9IDIwMCAqICh5IC0geik7XG5cblx0cmV0dXJuIFtsLCBhLCBiXTtcbn07XG5cbmNvbnZlcnQuaHNsLnJnYiA9IGZ1bmN0aW9uIChoc2wpIHtcblx0dmFyIGggPSBoc2xbMF0gLyAzNjA7XG5cdHZhciBzID0gaHNsWzFdIC8gMTAwO1xuXHR2YXIgbCA9IGhzbFsyXSAvIDEwMDtcblx0dmFyIHQxO1xuXHR2YXIgdDI7XG5cdHZhciB0Mztcblx0dmFyIHJnYjtcblx0dmFyIHZhbDtcblxuXHRpZiAocyA9PT0gMCkge1xuXHRcdHZhbCA9IGwgKiAyNTU7XG5cdFx0cmV0dXJuIFt2YWwsIHZhbCwgdmFsXTtcblx0fVxuXG5cdGlmIChsIDwgMC41KSB7XG5cdFx0dDIgPSBsICogKDEgKyBzKTtcblx0fSBlbHNlIHtcblx0XHR0MiA9IGwgKyBzIC0gbCAqIHM7XG5cdH1cblxuXHR0MSA9IDIgKiBsIC0gdDI7XG5cblx0cmdiID0gWzAsIDAsIDBdO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuXHRcdHQzID0gaCArIDEgLyAzICogLShpIC0gMSk7XG5cdFx0aWYgKHQzIDwgMCkge1xuXHRcdFx0dDMrKztcblx0XHR9XG5cdFx0aWYgKHQzID4gMSkge1xuXHRcdFx0dDMtLTtcblx0XHR9XG5cblx0XHRpZiAoNiAqIHQzIDwgMSkge1xuXHRcdFx0dmFsID0gdDEgKyAodDIgLSB0MSkgKiA2ICogdDM7XG5cdFx0fSBlbHNlIGlmICgyICogdDMgPCAxKSB7XG5cdFx0XHR2YWwgPSB0Mjtcblx0XHR9IGVsc2UgaWYgKDMgKiB0MyA8IDIpIHtcblx0XHRcdHZhbCA9IHQxICsgKHQyIC0gdDEpICogKDIgLyAzIC0gdDMpICogNjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFsID0gdDE7XG5cdFx0fVxuXG5cdFx0cmdiW2ldID0gdmFsICogMjU1O1xuXHR9XG5cblx0cmV0dXJuIHJnYjtcbn07XG5cbmNvbnZlcnQuaHNsLmhzdiA9IGZ1bmN0aW9uIChoc2wpIHtcblx0dmFyIGggPSBoc2xbMF07XG5cdHZhciBzID0gaHNsWzFdIC8gMTAwO1xuXHR2YXIgbCA9IGhzbFsyXSAvIDEwMDtcblx0dmFyIHNtaW4gPSBzO1xuXHR2YXIgbG1pbiA9IE1hdGgubWF4KGwsIDAuMDEpO1xuXHR2YXIgc3Y7XG5cdHZhciB2O1xuXG5cdGwgKj0gMjtcblx0cyAqPSAobCA8PSAxKSA/IGwgOiAyIC0gbDtcblx0c21pbiAqPSBsbWluIDw9IDEgPyBsbWluIDogMiAtIGxtaW47XG5cdHYgPSAobCArIHMpIC8gMjtcblx0c3YgPSBsID09PSAwID8gKDIgKiBzbWluKSAvIChsbWluICsgc21pbikgOiAoMiAqIHMpIC8gKGwgKyBzKTtcblxuXHRyZXR1cm4gW2gsIHN2ICogMTAwLCB2ICogMTAwXTtcbn07XG5cbmNvbnZlcnQuaHN2LnJnYiA9IGZ1bmN0aW9uIChoc3YpIHtcblx0dmFyIGggPSBoc3ZbMF0gLyA2MDtcblx0dmFyIHMgPSBoc3ZbMV0gLyAxMDA7XG5cdHZhciB2ID0gaHN2WzJdIC8gMTAwO1xuXHR2YXIgaGkgPSBNYXRoLmZsb29yKGgpICUgNjtcblxuXHR2YXIgZiA9IGggLSBNYXRoLmZsb29yKGgpO1xuXHR2YXIgcCA9IDI1NSAqIHYgKiAoMSAtIHMpO1xuXHR2YXIgcSA9IDI1NSAqIHYgKiAoMSAtIChzICogZikpO1xuXHR2YXIgdCA9IDI1NSAqIHYgKiAoMSAtIChzICogKDEgLSBmKSkpO1xuXHR2ICo9IDI1NTtcblxuXHRzd2l0Y2ggKGhpKSB7XG5cdFx0Y2FzZSAwOlxuXHRcdFx0cmV0dXJuIFt2LCB0LCBwXTtcblx0XHRjYXNlIDE6XG5cdFx0XHRyZXR1cm4gW3EsIHYsIHBdO1xuXHRcdGNhc2UgMjpcblx0XHRcdHJldHVybiBbcCwgdiwgdF07XG5cdFx0Y2FzZSAzOlxuXHRcdFx0cmV0dXJuIFtwLCBxLCB2XTtcblx0XHRjYXNlIDQ6XG5cdFx0XHRyZXR1cm4gW3QsIHAsIHZdO1xuXHRcdGNhc2UgNTpcblx0XHRcdHJldHVybiBbdiwgcCwgcV07XG5cdH1cbn07XG5cbmNvbnZlcnQuaHN2LmhzbCA9IGZ1bmN0aW9uIChoc3YpIHtcblx0dmFyIGggPSBoc3ZbMF07XG5cdHZhciBzID0gaHN2WzFdIC8gMTAwO1xuXHR2YXIgdiA9IGhzdlsyXSAvIDEwMDtcblx0dmFyIHZtaW4gPSBNYXRoLm1heCh2LCAwLjAxKTtcblx0dmFyIGxtaW47XG5cdHZhciBzbDtcblx0dmFyIGw7XG5cblx0bCA9ICgyIC0gcykgKiB2O1xuXHRsbWluID0gKDIgLSBzKSAqIHZtaW47XG5cdHNsID0gcyAqIHZtaW47XG5cdHNsIC89IChsbWluIDw9IDEpID8gbG1pbiA6IDIgLSBsbWluO1xuXHRzbCA9IHNsIHx8IDA7XG5cdGwgLz0gMjtcblxuXHRyZXR1cm4gW2gsIHNsICogMTAwLCBsICogMTAwXTtcbn07XG5cbi8vIGh0dHA6Ly9kZXYudzMub3JnL2Nzc3dnL2Nzcy1jb2xvci8jaHdiLXRvLXJnYlxuY29udmVydC5od2IucmdiID0gZnVuY3Rpb24gKGh3Yikge1xuXHR2YXIgaCA9IGh3YlswXSAvIDM2MDtcblx0dmFyIHdoID0gaHdiWzFdIC8gMTAwO1xuXHR2YXIgYmwgPSBod2JbMl0gLyAxMDA7XG5cdHZhciByYXRpbyA9IHdoICsgYmw7XG5cdHZhciBpO1xuXHR2YXIgdjtcblx0dmFyIGY7XG5cdHZhciBuO1xuXG5cdC8vIHdoICsgYmwgY2FudCBiZSA+IDFcblx0aWYgKHJhdGlvID4gMSkge1xuXHRcdHdoIC89IHJhdGlvO1xuXHRcdGJsIC89IHJhdGlvO1xuXHR9XG5cblx0aSA9IE1hdGguZmxvb3IoNiAqIGgpO1xuXHR2ID0gMSAtIGJsO1xuXHRmID0gNiAqIGggLSBpO1xuXG5cdGlmICgoaSAmIDB4MDEpICE9PSAwKSB7XG5cdFx0ZiA9IDEgLSBmO1xuXHR9XG5cblx0biA9IHdoICsgZiAqICh2IC0gd2gpOyAvLyBsaW5lYXIgaW50ZXJwb2xhdGlvblxuXG5cdHZhciByO1xuXHR2YXIgZztcblx0dmFyIGI7XG5cdHN3aXRjaCAoaSkge1xuXHRcdGRlZmF1bHQ6XG5cdFx0Y2FzZSA2OlxuXHRcdGNhc2UgMDogciA9IHY7IGcgPSBuOyBiID0gd2g7IGJyZWFrO1xuXHRcdGNhc2UgMTogciA9IG47IGcgPSB2OyBiID0gd2g7IGJyZWFrO1xuXHRcdGNhc2UgMjogciA9IHdoOyBnID0gdjsgYiA9IG47IGJyZWFrO1xuXHRcdGNhc2UgMzogciA9IHdoOyBnID0gbjsgYiA9IHY7IGJyZWFrO1xuXHRcdGNhc2UgNDogciA9IG47IGcgPSB3aDsgYiA9IHY7IGJyZWFrO1xuXHRcdGNhc2UgNTogciA9IHY7IGcgPSB3aDsgYiA9IG47IGJyZWFrO1xuXHR9XG5cblx0cmV0dXJuIFtyICogMjU1LCBnICogMjU1LCBiICogMjU1XTtcbn07XG5cbmNvbnZlcnQuY215ay5yZ2IgPSBmdW5jdGlvbiAoY215aykge1xuXHR2YXIgYyA9IGNteWtbMF0gLyAxMDA7XG5cdHZhciBtID0gY215a1sxXSAvIDEwMDtcblx0dmFyIHkgPSBjbXlrWzJdIC8gMTAwO1xuXHR2YXIgayA9IGNteWtbM10gLyAxMDA7XG5cdHZhciByO1xuXHR2YXIgZztcblx0dmFyIGI7XG5cblx0ciA9IDEgLSBNYXRoLm1pbigxLCBjICogKDEgLSBrKSArIGspO1xuXHRnID0gMSAtIE1hdGgubWluKDEsIG0gKiAoMSAtIGspICsgayk7XG5cdGIgPSAxIC0gTWF0aC5taW4oMSwgeSAqICgxIC0gaykgKyBrKTtcblxuXHRyZXR1cm4gW3IgKiAyNTUsIGcgKiAyNTUsIGIgKiAyNTVdO1xufTtcblxuY29udmVydC54eXoucmdiID0gZnVuY3Rpb24gKHh5eikge1xuXHR2YXIgeCA9IHh5elswXSAvIDEwMDtcblx0dmFyIHkgPSB4eXpbMV0gLyAxMDA7XG5cdHZhciB6ID0geHl6WzJdIC8gMTAwO1xuXHR2YXIgcjtcblx0dmFyIGc7XG5cdHZhciBiO1xuXG5cdHIgPSAoeCAqIDMuMjQwNikgKyAoeSAqIC0xLjUzNzIpICsgKHogKiAtMC40OTg2KTtcblx0ZyA9ICh4ICogLTAuOTY4OSkgKyAoeSAqIDEuODc1OCkgKyAoeiAqIDAuMDQxNSk7XG5cdGIgPSAoeCAqIDAuMDU1NykgKyAoeSAqIC0wLjIwNDApICsgKHogKiAxLjA1NzApO1xuXG5cdC8vIGFzc3VtZSBzUkdCXG5cdHIgPSByID4gMC4wMDMxMzA4XG5cdFx0PyAoKDEuMDU1ICogTWF0aC5wb3cociwgMS4wIC8gMi40KSkgLSAwLjA1NSlcblx0XHQ6IHIgKiAxMi45MjtcblxuXHRnID0gZyA+IDAuMDAzMTMwOFxuXHRcdD8gKCgxLjA1NSAqIE1hdGgucG93KGcsIDEuMCAvIDIuNCkpIC0gMC4wNTUpXG5cdFx0OiBnICogMTIuOTI7XG5cblx0YiA9IGIgPiAwLjAwMzEzMDhcblx0XHQ/ICgoMS4wNTUgKiBNYXRoLnBvdyhiLCAxLjAgLyAyLjQpKSAtIDAuMDU1KVxuXHRcdDogYiAqIDEyLjkyO1xuXG5cdHIgPSBNYXRoLm1pbihNYXRoLm1heCgwLCByKSwgMSk7XG5cdGcgPSBNYXRoLm1pbihNYXRoLm1heCgwLCBnKSwgMSk7XG5cdGIgPSBNYXRoLm1pbihNYXRoLm1heCgwLCBiKSwgMSk7XG5cblx0cmV0dXJuIFtyICogMjU1LCBnICogMjU1LCBiICogMjU1XTtcbn07XG5cbmNvbnZlcnQueHl6LmxhYiA9IGZ1bmN0aW9uICh4eXopIHtcblx0dmFyIHggPSB4eXpbMF07XG5cdHZhciB5ID0geHl6WzFdO1xuXHR2YXIgeiA9IHh5elsyXTtcblx0dmFyIGw7XG5cdHZhciBhO1xuXHR2YXIgYjtcblxuXHR4IC89IDk1LjA0Nztcblx0eSAvPSAxMDA7XG5cdHogLz0gMTA4Ljg4MztcblxuXHR4ID0geCA+IDAuMDA4ODU2ID8gTWF0aC5wb3coeCwgMSAvIDMpIDogKDcuNzg3ICogeCkgKyAoMTYgLyAxMTYpO1xuXHR5ID0geSA+IDAuMDA4ODU2ID8gTWF0aC5wb3coeSwgMSAvIDMpIDogKDcuNzg3ICogeSkgKyAoMTYgLyAxMTYpO1xuXHR6ID0geiA+IDAuMDA4ODU2ID8gTWF0aC5wb3coeiwgMSAvIDMpIDogKDcuNzg3ICogeikgKyAoMTYgLyAxMTYpO1xuXG5cdGwgPSAoMTE2ICogeSkgLSAxNjtcblx0YSA9IDUwMCAqICh4IC0geSk7XG5cdGIgPSAyMDAgKiAoeSAtIHopO1xuXG5cdHJldHVybiBbbCwgYSwgYl07XG59O1xuXG5jb252ZXJ0LmxhYi54eXogPSBmdW5jdGlvbiAobGFiKSB7XG5cdHZhciBsID0gbGFiWzBdO1xuXHR2YXIgYSA9IGxhYlsxXTtcblx0dmFyIGIgPSBsYWJbMl07XG5cdHZhciB4O1xuXHR2YXIgeTtcblx0dmFyIHo7XG5cblx0eSA9IChsICsgMTYpIC8gMTE2O1xuXHR4ID0gYSAvIDUwMCArIHk7XG5cdHogPSB5IC0gYiAvIDIwMDtcblxuXHR2YXIgeTIgPSBNYXRoLnBvdyh5LCAzKTtcblx0dmFyIHgyID0gTWF0aC5wb3coeCwgMyk7XG5cdHZhciB6MiA9IE1hdGgucG93KHosIDMpO1xuXHR5ID0geTIgPiAwLjAwODg1NiA/IHkyIDogKHkgLSAxNiAvIDExNikgLyA3Ljc4Nztcblx0eCA9IHgyID4gMC4wMDg4NTYgPyB4MiA6ICh4IC0gMTYgLyAxMTYpIC8gNy43ODc7XG5cdHogPSB6MiA+IDAuMDA4ODU2ID8gejIgOiAoeiAtIDE2IC8gMTE2KSAvIDcuNzg3O1xuXG5cdHggKj0gOTUuMDQ3O1xuXHR5ICo9IDEwMDtcblx0eiAqPSAxMDguODgzO1xuXG5cdHJldHVybiBbeCwgeSwgel07XG59O1xuXG5jb252ZXJ0LmxhYi5sY2ggPSBmdW5jdGlvbiAobGFiKSB7XG5cdHZhciBsID0gbGFiWzBdO1xuXHR2YXIgYSA9IGxhYlsxXTtcblx0dmFyIGIgPSBsYWJbMl07XG5cdHZhciBocjtcblx0dmFyIGg7XG5cdHZhciBjO1xuXG5cdGhyID0gTWF0aC5hdGFuMihiLCBhKTtcblx0aCA9IGhyICogMzYwIC8gMiAvIE1hdGguUEk7XG5cblx0aWYgKGggPCAwKSB7XG5cdFx0aCArPSAzNjA7XG5cdH1cblxuXHRjID0gTWF0aC5zcXJ0KGEgKiBhICsgYiAqIGIpO1xuXG5cdHJldHVybiBbbCwgYywgaF07XG59O1xuXG5jb252ZXJ0LmxjaC5sYWIgPSBmdW5jdGlvbiAobGNoKSB7XG5cdHZhciBsID0gbGNoWzBdO1xuXHR2YXIgYyA9IGxjaFsxXTtcblx0dmFyIGggPSBsY2hbMl07XG5cdHZhciBhO1xuXHR2YXIgYjtcblx0dmFyIGhyO1xuXG5cdGhyID0gaCAvIDM2MCAqIDIgKiBNYXRoLlBJO1xuXHRhID0gYyAqIE1hdGguY29zKGhyKTtcblx0YiA9IGMgKiBNYXRoLnNpbihocik7XG5cblx0cmV0dXJuIFtsLCBhLCBiXTtcbn07XG5cbmNvbnZlcnQucmdiLmFuc2kxNiA9IGZ1bmN0aW9uIChhcmdzKSB7XG5cdHZhciByID0gYXJnc1swXTtcblx0dmFyIGcgPSBhcmdzWzFdO1xuXHR2YXIgYiA9IGFyZ3NbMl07XG5cdHZhciB2YWx1ZSA9IDEgaW4gYXJndW1lbnRzID8gYXJndW1lbnRzWzFdIDogY29udmVydC5yZ2IuaHN2KGFyZ3MpWzJdOyAvLyBoc3YgLT4gYW5zaTE2IG9wdGltaXphdGlvblxuXG5cdHZhbHVlID0gTWF0aC5yb3VuZCh2YWx1ZSAvIDUwKTtcblxuXHRpZiAodmFsdWUgPT09IDApIHtcblx0XHRyZXR1cm4gMzA7XG5cdH1cblxuXHR2YXIgYW5zaSA9IDMwXG5cdFx0KyAoKE1hdGgucm91bmQoYiAvIDI1NSkgPDwgMilcblx0XHR8IChNYXRoLnJvdW5kKGcgLyAyNTUpIDw8IDEpXG5cdFx0fCBNYXRoLnJvdW5kKHIgLyAyNTUpKTtcblxuXHRpZiAodmFsdWUgPT09IDIpIHtcblx0XHRhbnNpICs9IDYwO1xuXHR9XG5cblx0cmV0dXJuIGFuc2k7XG59O1xuXG5jb252ZXJ0Lmhzdi5hbnNpMTYgPSBmdW5jdGlvbiAoYXJncykge1xuXHQvLyBvcHRpbWl6YXRpb24gaGVyZTsgd2UgYWxyZWFkeSBrbm93IHRoZSB2YWx1ZSBhbmQgZG9uJ3QgbmVlZCB0byBnZXRcblx0Ly8gaXQgY29udmVydGVkIGZvciB1cy5cblx0cmV0dXJuIGNvbnZlcnQucmdiLmFuc2kxNihjb252ZXJ0Lmhzdi5yZ2IoYXJncyksIGFyZ3NbMl0pO1xufTtcblxuY29udmVydC5yZ2IuYW5zaTI1NiA9IGZ1bmN0aW9uIChhcmdzKSB7XG5cdHZhciByID0gYXJnc1swXTtcblx0dmFyIGcgPSBhcmdzWzFdO1xuXHR2YXIgYiA9IGFyZ3NbMl07XG5cblx0Ly8gd2UgdXNlIHRoZSBleHRlbmRlZCBncmV5c2NhbGUgcGFsZXR0ZSBoZXJlLCB3aXRoIHRoZSBleGNlcHRpb24gb2Zcblx0Ly8gYmxhY2sgYW5kIHdoaXRlLiBub3JtYWwgcGFsZXR0ZSBvbmx5IGhhcyA0IGdyZXlzY2FsZSBzaGFkZXMuXG5cdGlmIChyID09PSBnICYmIGcgPT09IGIpIHtcblx0XHRpZiAociA8IDgpIHtcblx0XHRcdHJldHVybiAxNjtcblx0XHR9XG5cblx0XHRpZiAociA+IDI0OCkge1xuXHRcdFx0cmV0dXJuIDIzMTtcblx0XHR9XG5cblx0XHRyZXR1cm4gTWF0aC5yb3VuZCgoKHIgLSA4KSAvIDI0NykgKiAyNCkgKyAyMzI7XG5cdH1cblxuXHR2YXIgYW5zaSA9IDE2XG5cdFx0KyAoMzYgKiBNYXRoLnJvdW5kKHIgLyAyNTUgKiA1KSlcblx0XHQrICg2ICogTWF0aC5yb3VuZChnIC8gMjU1ICogNSkpXG5cdFx0KyBNYXRoLnJvdW5kKGIgLyAyNTUgKiA1KTtcblxuXHRyZXR1cm4gYW5zaTtcbn07XG5cbmNvbnZlcnQuYW5zaTE2LnJnYiA9IGZ1bmN0aW9uIChhcmdzKSB7XG5cdHZhciBjb2xvciA9IGFyZ3MgJSAxMDtcblxuXHQvLyBoYW5kbGUgZ3JleXNjYWxlXG5cdGlmIChjb2xvciA9PT0gMCB8fCBjb2xvciA9PT0gNykge1xuXHRcdGlmIChhcmdzID4gNTApIHtcblx0XHRcdGNvbG9yICs9IDMuNTtcblx0XHR9XG5cblx0XHRjb2xvciA9IGNvbG9yIC8gMTAuNSAqIDI1NTtcblxuXHRcdHJldHVybiBbY29sb3IsIGNvbG9yLCBjb2xvcl07XG5cdH1cblxuXHR2YXIgbXVsdCA9ICh+fihhcmdzID4gNTApICsgMSkgKiAwLjU7XG5cdHZhciByID0gKChjb2xvciAmIDEpICogbXVsdCkgKiAyNTU7XG5cdHZhciBnID0gKCgoY29sb3IgPj4gMSkgJiAxKSAqIG11bHQpICogMjU1O1xuXHR2YXIgYiA9ICgoKGNvbG9yID4+IDIpICYgMSkgKiBtdWx0KSAqIDI1NTtcblxuXHRyZXR1cm4gW3IsIGcsIGJdO1xufTtcblxuY29udmVydC5hbnNpMjU2LnJnYiA9IGZ1bmN0aW9uIChhcmdzKSB7XG5cdC8vIGhhbmRsZSBncmV5c2NhbGVcblx0aWYgKGFyZ3MgPj0gMjMyKSB7XG5cdFx0dmFyIGMgPSAoYXJncyAtIDIzMikgKiAxMCArIDg7XG5cdFx0cmV0dXJuIFtjLCBjLCBjXTtcblx0fVxuXG5cdGFyZ3MgLT0gMTY7XG5cblx0dmFyIHJlbTtcblx0dmFyIHIgPSBNYXRoLmZsb29yKGFyZ3MgLyAzNikgLyA1ICogMjU1O1xuXHR2YXIgZyA9IE1hdGguZmxvb3IoKHJlbSA9IGFyZ3MgJSAzNikgLyA2KSAvIDUgKiAyNTU7XG5cdHZhciBiID0gKHJlbSAlIDYpIC8gNSAqIDI1NTtcblxuXHRyZXR1cm4gW3IsIGcsIGJdO1xufTtcblxuY29udmVydC5yZ2IuaGV4ID0gZnVuY3Rpb24gKGFyZ3MpIHtcblx0dmFyIGludGVnZXIgPSAoKE1hdGgucm91bmQoYXJnc1swXSkgJiAweEZGKSA8PCAxNilcblx0XHQrICgoTWF0aC5yb3VuZChhcmdzWzFdKSAmIDB4RkYpIDw8IDgpXG5cdFx0KyAoTWF0aC5yb3VuZChhcmdzWzJdKSAmIDB4RkYpO1xuXG5cdHZhciBzdHJpbmcgPSBpbnRlZ2VyLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpO1xuXHRyZXR1cm4gJzAwMDAwMCcuc3Vic3RyaW5nKHN0cmluZy5sZW5ndGgpICsgc3RyaW5nO1xufTtcblxuY29udmVydC5oZXgucmdiID0gZnVuY3Rpb24gKGFyZ3MpIHtcblx0dmFyIG1hdGNoID0gYXJncy50b1N0cmluZygxNikubWF0Y2goL1thLWYwLTldezZ9fFthLWYwLTldezN9L2kpO1xuXHRpZiAoIW1hdGNoKSB7XG5cdFx0cmV0dXJuIFswLCAwLCAwXTtcblx0fVxuXG5cdHZhciBjb2xvclN0cmluZyA9IG1hdGNoWzBdO1xuXG5cdGlmIChtYXRjaFswXS5sZW5ndGggPT09IDMpIHtcblx0XHRjb2xvclN0cmluZyA9IGNvbG9yU3RyaW5nLnNwbGl0KCcnKS5tYXAoZnVuY3Rpb24gKGNoYXIpIHtcblx0XHRcdHJldHVybiBjaGFyICsgY2hhcjtcblx0XHR9KS5qb2luKCcnKTtcblx0fVxuXG5cdHZhciBpbnRlZ2VyID0gcGFyc2VJbnQoY29sb3JTdHJpbmcsIDE2KTtcblx0dmFyIHIgPSAoaW50ZWdlciA+PiAxNikgJiAweEZGO1xuXHR2YXIgZyA9IChpbnRlZ2VyID4+IDgpICYgMHhGRjtcblx0dmFyIGIgPSBpbnRlZ2VyICYgMHhGRjtcblxuXHRyZXR1cm4gW3IsIGcsIGJdO1xufTtcblxuY29udmVydC5yZ2IuaGNnID0gZnVuY3Rpb24gKHJnYikge1xuXHR2YXIgciA9IHJnYlswXSAvIDI1NTtcblx0dmFyIGcgPSByZ2JbMV0gLyAyNTU7XG5cdHZhciBiID0gcmdiWzJdIC8gMjU1O1xuXHR2YXIgbWF4ID0gTWF0aC5tYXgoTWF0aC5tYXgociwgZyksIGIpO1xuXHR2YXIgbWluID0gTWF0aC5taW4oTWF0aC5taW4ociwgZyksIGIpO1xuXHR2YXIgY2hyb21hID0gKG1heCAtIG1pbik7XG5cdHZhciBncmF5c2NhbGU7XG5cdHZhciBodWU7XG5cblx0aWYgKGNocm9tYSA8IDEpIHtcblx0XHRncmF5c2NhbGUgPSBtaW4gLyAoMSAtIGNocm9tYSk7XG5cdH0gZWxzZSB7XG5cdFx0Z3JheXNjYWxlID0gMDtcblx0fVxuXG5cdGlmIChjaHJvbWEgPD0gMCkge1xuXHRcdGh1ZSA9IDA7XG5cdH0gZWxzZVxuXHRpZiAobWF4ID09PSByKSB7XG5cdFx0aHVlID0gKChnIC0gYikgLyBjaHJvbWEpICUgNjtcblx0fSBlbHNlXG5cdGlmIChtYXggPT09IGcpIHtcblx0XHRodWUgPSAyICsgKGIgLSByKSAvIGNocm9tYTtcblx0fSBlbHNlIHtcblx0XHRodWUgPSA0ICsgKHIgLSBnKSAvIGNocm9tYSArIDQ7XG5cdH1cblxuXHRodWUgLz0gNjtcblx0aHVlICU9IDE7XG5cblx0cmV0dXJuIFtodWUgKiAzNjAsIGNocm9tYSAqIDEwMCwgZ3JheXNjYWxlICogMTAwXTtcbn07XG5cbmNvbnZlcnQuaHNsLmhjZyA9IGZ1bmN0aW9uIChoc2wpIHtcblx0dmFyIHMgPSBoc2xbMV0gLyAxMDA7XG5cdHZhciBsID0gaHNsWzJdIC8gMTAwO1xuXHR2YXIgYyA9IDE7XG5cdHZhciBmID0gMDtcblxuXHRpZiAobCA8IDAuNSkge1xuXHRcdGMgPSAyLjAgKiBzICogbDtcblx0fSBlbHNlIHtcblx0XHRjID0gMi4wICogcyAqICgxLjAgLSBsKTtcblx0fVxuXG5cdGlmIChjIDwgMS4wKSB7XG5cdFx0ZiA9IChsIC0gMC41ICogYykgLyAoMS4wIC0gYyk7XG5cdH1cblxuXHRyZXR1cm4gW2hzbFswXSwgYyAqIDEwMCwgZiAqIDEwMF07XG59O1xuXG5jb252ZXJ0Lmhzdi5oY2cgPSBmdW5jdGlvbiAoaHN2KSB7XG5cdHZhciBzID0gaHN2WzFdIC8gMTAwO1xuXHR2YXIgdiA9IGhzdlsyXSAvIDEwMDtcblxuXHR2YXIgYyA9IHMgKiB2O1xuXHR2YXIgZiA9IDA7XG5cblx0aWYgKGMgPCAxLjApIHtcblx0XHRmID0gKHYgLSBjKSAvICgxIC0gYyk7XG5cdH1cblxuXHRyZXR1cm4gW2hzdlswXSwgYyAqIDEwMCwgZiAqIDEwMF07XG59O1xuXG5jb252ZXJ0LmhjZy5yZ2IgPSBmdW5jdGlvbiAoaGNnKSB7XG5cdHZhciBoID0gaGNnWzBdIC8gMzYwO1xuXHR2YXIgYyA9IGhjZ1sxXSAvIDEwMDtcblx0dmFyIGcgPSBoY2dbMl0gLyAxMDA7XG5cblx0aWYgKGMgPT09IDAuMCkge1xuXHRcdHJldHVybiBbZyAqIDI1NSwgZyAqIDI1NSwgZyAqIDI1NV07XG5cdH1cblxuXHR2YXIgcHVyZSA9IFswLCAwLCAwXTtcblx0dmFyIGhpID0gKGggJSAxKSAqIDY7XG5cdHZhciB2ID0gaGkgJSAxO1xuXHR2YXIgdyA9IDEgLSB2O1xuXHR2YXIgbWcgPSAwO1xuXG5cdHN3aXRjaCAoTWF0aC5mbG9vcihoaSkpIHtcblx0XHRjYXNlIDA6XG5cdFx0XHRwdXJlWzBdID0gMTsgcHVyZVsxXSA9IHY7IHB1cmVbMl0gPSAwOyBicmVhaztcblx0XHRjYXNlIDE6XG5cdFx0XHRwdXJlWzBdID0gdzsgcHVyZVsxXSA9IDE7IHB1cmVbMl0gPSAwOyBicmVhaztcblx0XHRjYXNlIDI6XG5cdFx0XHRwdXJlWzBdID0gMDsgcHVyZVsxXSA9IDE7IHB1cmVbMl0gPSB2OyBicmVhaztcblx0XHRjYXNlIDM6XG5cdFx0XHRwdXJlWzBdID0gMDsgcHVyZVsxXSA9IHc7IHB1cmVbMl0gPSAxOyBicmVhaztcblx0XHRjYXNlIDQ6XG5cdFx0XHRwdXJlWzBdID0gdjsgcHVyZVsxXSA9IDA7IHB1cmVbMl0gPSAxOyBicmVhaztcblx0XHRkZWZhdWx0OlxuXHRcdFx0cHVyZVswXSA9IDE7IHB1cmVbMV0gPSAwOyBwdXJlWzJdID0gdztcblx0fVxuXG5cdG1nID0gKDEuMCAtIGMpICogZztcblxuXHRyZXR1cm4gW1xuXHRcdChjICogcHVyZVswXSArIG1nKSAqIDI1NSxcblx0XHQoYyAqIHB1cmVbMV0gKyBtZykgKiAyNTUsXG5cdFx0KGMgKiBwdXJlWzJdICsgbWcpICogMjU1XG5cdF07XG59O1xuXG5jb252ZXJ0LmhjZy5oc3YgPSBmdW5jdGlvbiAoaGNnKSB7XG5cdHZhciBjID0gaGNnWzFdIC8gMTAwO1xuXHR2YXIgZyA9IGhjZ1syXSAvIDEwMDtcblxuXHR2YXIgdiA9IGMgKyBnICogKDEuMCAtIGMpO1xuXHR2YXIgZiA9IDA7XG5cblx0aWYgKHYgPiAwLjApIHtcblx0XHRmID0gYyAvIHY7XG5cdH1cblxuXHRyZXR1cm4gW2hjZ1swXSwgZiAqIDEwMCwgdiAqIDEwMF07XG59O1xuXG5jb252ZXJ0LmhjZy5oc2wgPSBmdW5jdGlvbiAoaGNnKSB7XG5cdHZhciBjID0gaGNnWzFdIC8gMTAwO1xuXHR2YXIgZyA9IGhjZ1syXSAvIDEwMDtcblxuXHR2YXIgbCA9IGcgKiAoMS4wIC0gYykgKyAwLjUgKiBjO1xuXHR2YXIgcyA9IDA7XG5cblx0aWYgKGwgPiAwLjAgJiYgbCA8IDAuNSkge1xuXHRcdHMgPSBjIC8gKDIgKiBsKTtcblx0fSBlbHNlXG5cdGlmIChsID49IDAuNSAmJiBsIDwgMS4wKSB7XG5cdFx0cyA9IGMgLyAoMiAqICgxIC0gbCkpO1xuXHR9XG5cblx0cmV0dXJuIFtoY2dbMF0sIHMgKiAxMDAsIGwgKiAxMDBdO1xufTtcblxuY29udmVydC5oY2cuaHdiID0gZnVuY3Rpb24gKGhjZykge1xuXHR2YXIgYyA9IGhjZ1sxXSAvIDEwMDtcblx0dmFyIGcgPSBoY2dbMl0gLyAxMDA7XG5cdHZhciB2ID0gYyArIGcgKiAoMS4wIC0gYyk7XG5cdHJldHVybiBbaGNnWzBdLCAodiAtIGMpICogMTAwLCAoMSAtIHYpICogMTAwXTtcbn07XG5cbmNvbnZlcnQuaHdiLmhjZyA9IGZ1bmN0aW9uIChod2IpIHtcblx0dmFyIHcgPSBod2JbMV0gLyAxMDA7XG5cdHZhciBiID0gaHdiWzJdIC8gMTAwO1xuXHR2YXIgdiA9IDEgLSBiO1xuXHR2YXIgYyA9IHYgLSB3O1xuXHR2YXIgZyA9IDA7XG5cblx0aWYgKGMgPCAxKSB7XG5cdFx0ZyA9ICh2IC0gYykgLyAoMSAtIGMpO1xuXHR9XG5cblx0cmV0dXJuIFtod2JbMF0sIGMgKiAxMDAsIGcgKiAxMDBdO1xufTtcblxuY29udmVydC5hcHBsZS5yZ2IgPSBmdW5jdGlvbiAoYXBwbGUpIHtcblx0cmV0dXJuIFsoYXBwbGVbMF0gLyA2NTUzNSkgKiAyNTUsIChhcHBsZVsxXSAvIDY1NTM1KSAqIDI1NSwgKGFwcGxlWzJdIC8gNjU1MzUpICogMjU1XTtcbn07XG5cbmNvbnZlcnQucmdiLmFwcGxlID0gZnVuY3Rpb24gKHJnYikge1xuXHRyZXR1cm4gWyhyZ2JbMF0gLyAyNTUpICogNjU1MzUsIChyZ2JbMV0gLyAyNTUpICogNjU1MzUsIChyZ2JbMl0gLyAyNTUpICogNjU1MzVdO1xufTtcblxuY29udmVydC5ncmF5LnJnYiA9IGZ1bmN0aW9uIChhcmdzKSB7XG5cdHJldHVybiBbYXJnc1swXSAvIDEwMCAqIDI1NSwgYXJnc1swXSAvIDEwMCAqIDI1NSwgYXJnc1swXSAvIDEwMCAqIDI1NV07XG59O1xuXG5jb252ZXJ0LmdyYXkuaHNsID0gY29udmVydC5ncmF5LmhzdiA9IGZ1bmN0aW9uIChhcmdzKSB7XG5cdHJldHVybiBbMCwgMCwgYXJnc1swXV07XG59O1xuXG5jb252ZXJ0LmdyYXkuaHdiID0gZnVuY3Rpb24gKGdyYXkpIHtcblx0cmV0dXJuIFswLCAxMDAsIGdyYXlbMF1dO1xufTtcblxuY29udmVydC5ncmF5LmNteWsgPSBmdW5jdGlvbiAoZ3JheSkge1xuXHRyZXR1cm4gWzAsIDAsIDAsIGdyYXlbMF1dO1xufTtcblxuY29udmVydC5ncmF5LmxhYiA9IGZ1bmN0aW9uIChncmF5KSB7XG5cdHJldHVybiBbZ3JheVswXSwgMCwgMF07XG59O1xuXG5jb252ZXJ0LmdyYXkuaGV4ID0gZnVuY3Rpb24gKGdyYXkpIHtcblx0dmFyIHZhbCA9IE1hdGgucm91bmQoZ3JheVswXSAvIDEwMCAqIDI1NSkgJiAweEZGO1xuXHR2YXIgaW50ZWdlciA9ICh2YWwgPDwgMTYpICsgKHZhbCA8PCA4KSArIHZhbDtcblxuXHR2YXIgc3RyaW5nID0gaW50ZWdlci50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTtcblx0cmV0dXJuICcwMDAwMDAnLnN1YnN0cmluZyhzdHJpbmcubGVuZ3RoKSArIHN0cmluZztcbn07XG5cbmNvbnZlcnQucmdiLmdyYXkgPSBmdW5jdGlvbiAocmdiKSB7XG5cdHZhciB2YWwgPSAocmdiWzBdICsgcmdiWzFdICsgcmdiWzJdKSAvIDM7XG5cdHJldHVybiBbdmFsIC8gMjU1ICogMTAwXTtcbn07XG4iLCJ2YXIgY29udmVyc2lvbnMgPSByZXF1aXJlKCcuL2NvbnZlcnNpb25zJyk7XG52YXIgcm91dGUgPSByZXF1aXJlKCcuL3JvdXRlJyk7XG5cbnZhciBjb252ZXJ0ID0ge307XG5cbnZhciBtb2RlbHMgPSBPYmplY3Qua2V5cyhjb252ZXJzaW9ucyk7XG5cbmZ1bmN0aW9uIHdyYXBSYXcoZm4pIHtcblx0dmFyIHdyYXBwZWRGbiA9IGZ1bmN0aW9uIChhcmdzKSB7XG5cdFx0aWYgKGFyZ3MgPT09IHVuZGVmaW5lZCB8fCBhcmdzID09PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gYXJncztcblx0XHR9XG5cblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuXHRcdH1cblxuXHRcdHJldHVybiBmbihhcmdzKTtcblx0fTtcblxuXHQvLyBwcmVzZXJ2ZSAuY29udmVyc2lvbiBwcm9wZXJ0eSBpZiB0aGVyZSBpcyBvbmVcblx0aWYgKCdjb252ZXJzaW9uJyBpbiBmbikge1xuXHRcdHdyYXBwZWRGbi5jb252ZXJzaW9uID0gZm4uY29udmVyc2lvbjtcblx0fVxuXG5cdHJldHVybiB3cmFwcGVkRm47XG59XG5cbmZ1bmN0aW9uIHdyYXBSb3VuZGVkKGZuKSB7XG5cdHZhciB3cmFwcGVkRm4gPSBmdW5jdGlvbiAoYXJncykge1xuXHRcdGlmIChhcmdzID09PSB1bmRlZmluZWQgfHwgYXJncyA9PT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIGFyZ3M7XG5cdFx0fVxuXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcblx0XHR9XG5cblx0XHR2YXIgcmVzdWx0ID0gZm4oYXJncyk7XG5cblx0XHQvLyB3ZSdyZSBhc3N1bWluZyB0aGUgcmVzdWx0IGlzIGFuIGFycmF5IGhlcmUuXG5cdFx0Ly8gc2VlIG5vdGljZSBpbiBjb252ZXJzaW9ucy5qczsgZG9uJ3QgdXNlIGJveCB0eXBlc1xuXHRcdC8vIGluIGNvbnZlcnNpb24gZnVuY3Rpb25zLlxuXHRcdGlmICh0eXBlb2YgcmVzdWx0ID09PSAnb2JqZWN0Jykge1xuXHRcdFx0Zm9yICh2YXIgbGVuID0gcmVzdWx0Lmxlbmd0aCwgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0XHRyZXN1bHRbaV0gPSBNYXRoLnJvdW5kKHJlc3VsdFtpXSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fTtcblxuXHQvLyBwcmVzZXJ2ZSAuY29udmVyc2lvbiBwcm9wZXJ0eSBpZiB0aGVyZSBpcyBvbmVcblx0aWYgKCdjb252ZXJzaW9uJyBpbiBmbikge1xuXHRcdHdyYXBwZWRGbi5jb252ZXJzaW9uID0gZm4uY29udmVyc2lvbjtcblx0fVxuXG5cdHJldHVybiB3cmFwcGVkRm47XG59XG5cbm1vZGVscy5mb3JFYWNoKGZ1bmN0aW9uIChmcm9tTW9kZWwpIHtcblx0Y29udmVydFtmcm9tTW9kZWxdID0ge307XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGNvbnZlcnRbZnJvbU1vZGVsXSwgJ2NoYW5uZWxzJywge3ZhbHVlOiBjb252ZXJzaW9uc1tmcm9tTW9kZWxdLmNoYW5uZWxzfSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb252ZXJ0W2Zyb21Nb2RlbF0sICdsYWJlbHMnLCB7dmFsdWU6IGNvbnZlcnNpb25zW2Zyb21Nb2RlbF0ubGFiZWxzfSk7XG5cblx0dmFyIHJvdXRlcyA9IHJvdXRlKGZyb21Nb2RlbCk7XG5cdHZhciByb3V0ZU1vZGVscyA9IE9iamVjdC5rZXlzKHJvdXRlcyk7XG5cblx0cm91dGVNb2RlbHMuZm9yRWFjaChmdW5jdGlvbiAodG9Nb2RlbCkge1xuXHRcdHZhciBmbiA9IHJvdXRlc1t0b01vZGVsXTtcblxuXHRcdGNvbnZlcnRbZnJvbU1vZGVsXVt0b01vZGVsXSA9IHdyYXBSb3VuZGVkKGZuKTtcblx0XHRjb252ZXJ0W2Zyb21Nb2RlbF1bdG9Nb2RlbF0ucmF3ID0gd3JhcFJhdyhmbik7XG5cdH0pO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29udmVydDtcbiIsInZhciBjb252ZXJzaW9ucyA9IHJlcXVpcmUoJy4vY29udmVyc2lvbnMnKTtcblxuLypcblx0dGhpcyBmdW5jdGlvbiByb3V0ZXMgYSBtb2RlbCB0byBhbGwgb3RoZXIgbW9kZWxzLlxuXG5cdGFsbCBmdW5jdGlvbnMgdGhhdCBhcmUgcm91dGVkIGhhdmUgYSBwcm9wZXJ0eSBgLmNvbnZlcnNpb25gIGF0dGFjaGVkXG5cdHRvIHRoZSByZXR1cm5lZCBzeW50aGV0aWMgZnVuY3Rpb24uIFRoaXMgcHJvcGVydHkgaXMgYW4gYXJyYXlcblx0b2Ygc3RyaW5ncywgZWFjaCB3aXRoIHRoZSBzdGVwcyBpbiBiZXR3ZWVuIHRoZSAnZnJvbScgYW5kICd0bydcblx0Y29sb3IgbW9kZWxzIChpbmNsdXNpdmUpLlxuXG5cdGNvbnZlcnNpb25zIHRoYXQgYXJlIG5vdCBwb3NzaWJsZSBzaW1wbHkgYXJlIG5vdCBpbmNsdWRlZC5cbiovXG5cbmZ1bmN0aW9uIGJ1aWxkR3JhcGgoKSB7XG5cdHZhciBncmFwaCA9IHt9O1xuXHQvLyBodHRwczovL2pzcGVyZi5jb20vb2JqZWN0LWtleXMtdnMtZm9yLWluLXdpdGgtY2xvc3VyZS8zXG5cdHZhciBtb2RlbHMgPSBPYmplY3Qua2V5cyhjb252ZXJzaW9ucyk7XG5cblx0Zm9yICh2YXIgbGVuID0gbW9kZWxzLmxlbmd0aCwgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdGdyYXBoW21vZGVsc1tpXV0gPSB7XG5cdFx0XHQvLyBodHRwOi8vanNwZXJmLmNvbS8xLXZzLWluZmluaXR5XG5cdFx0XHQvLyBtaWNyby1vcHQsIGJ1dCB0aGlzIGlzIHNpbXBsZS5cblx0XHRcdGRpc3RhbmNlOiAtMSxcblx0XHRcdHBhcmVudDogbnVsbFxuXHRcdH07XG5cdH1cblxuXHRyZXR1cm4gZ3JhcGg7XG59XG5cbi8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0JyZWFkdGgtZmlyc3Rfc2VhcmNoXG5mdW5jdGlvbiBkZXJpdmVCRlMoZnJvbU1vZGVsKSB7XG5cdHZhciBncmFwaCA9IGJ1aWxkR3JhcGgoKTtcblx0dmFyIHF1ZXVlID0gW2Zyb21Nb2RlbF07IC8vIHVuc2hpZnQgLT4gcXVldWUgLT4gcG9wXG5cblx0Z3JhcGhbZnJvbU1vZGVsXS5kaXN0YW5jZSA9IDA7XG5cblx0d2hpbGUgKHF1ZXVlLmxlbmd0aCkge1xuXHRcdHZhciBjdXJyZW50ID0gcXVldWUucG9wKCk7XG5cdFx0dmFyIGFkamFjZW50cyA9IE9iamVjdC5rZXlzKGNvbnZlcnNpb25zW2N1cnJlbnRdKTtcblxuXHRcdGZvciAodmFyIGxlbiA9IGFkamFjZW50cy5sZW5ndGgsIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdHZhciBhZGphY2VudCA9IGFkamFjZW50c1tpXTtcblx0XHRcdHZhciBub2RlID0gZ3JhcGhbYWRqYWNlbnRdO1xuXG5cdFx0XHRpZiAobm9kZS5kaXN0YW5jZSA9PT0gLTEpIHtcblx0XHRcdFx0bm9kZS5kaXN0YW5jZSA9IGdyYXBoW2N1cnJlbnRdLmRpc3RhbmNlICsgMTtcblx0XHRcdFx0bm9kZS5wYXJlbnQgPSBjdXJyZW50O1xuXHRcdFx0XHRxdWV1ZS51bnNoaWZ0KGFkamFjZW50KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gZ3JhcGg7XG59XG5cbmZ1bmN0aW9uIGxpbmsoZnJvbSwgdG8pIHtcblx0cmV0dXJuIGZ1bmN0aW9uIChhcmdzKSB7XG5cdFx0cmV0dXJuIHRvKGZyb20oYXJncykpO1xuXHR9O1xufVxuXG5mdW5jdGlvbiB3cmFwQ29udmVyc2lvbih0b01vZGVsLCBncmFwaCkge1xuXHR2YXIgcGF0aCA9IFtncmFwaFt0b01vZGVsXS5wYXJlbnQsIHRvTW9kZWxdO1xuXHR2YXIgZm4gPSBjb252ZXJzaW9uc1tncmFwaFt0b01vZGVsXS5wYXJlbnRdW3RvTW9kZWxdO1xuXG5cdHZhciBjdXIgPSBncmFwaFt0b01vZGVsXS5wYXJlbnQ7XG5cdHdoaWxlIChncmFwaFtjdXJdLnBhcmVudCkge1xuXHRcdHBhdGgudW5zaGlmdChncmFwaFtjdXJdLnBhcmVudCk7XG5cdFx0Zm4gPSBsaW5rKGNvbnZlcnNpb25zW2dyYXBoW2N1cl0ucGFyZW50XVtjdXJdLCBmbik7XG5cdFx0Y3VyID0gZ3JhcGhbY3VyXS5wYXJlbnQ7XG5cdH1cblxuXHRmbi5jb252ZXJzaW9uID0gcGF0aDtcblx0cmV0dXJuIGZuO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChmcm9tTW9kZWwpIHtcblx0dmFyIGdyYXBoID0gZGVyaXZlQkZTKGZyb21Nb2RlbCk7XG5cdHZhciBjb252ZXJzaW9uID0ge307XG5cblx0dmFyIG1vZGVscyA9IE9iamVjdC5rZXlzKGdyYXBoKTtcblx0Zm9yICh2YXIgbGVuID0gbW9kZWxzLmxlbmd0aCwgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdHZhciB0b01vZGVsID0gbW9kZWxzW2ldO1xuXHRcdHZhciBub2RlID0gZ3JhcGhbdG9Nb2RlbF07XG5cblx0XHRpZiAobm9kZS5wYXJlbnQgPT09IG51bGwpIHtcblx0XHRcdC8vIG5vIHBvc3NpYmxlIGNvbnZlcnNpb24sIG9yIHRoaXMgbm9kZSBpcyB0aGUgc291cmNlIG1vZGVsLlxuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXG5cdFx0Y29udmVyc2lvblt0b01vZGVsXSA9IHdyYXBDb252ZXJzaW9uKHRvTW9kZWwsIGdyYXBoKTtcblx0fVxuXG5cdHJldHVybiBjb252ZXJzaW9uO1xufTtcblxuIiwidmFyIGRlZmluZWQgPSByZXF1aXJlKCdkZWZpbmVkJyk7XG52YXIgdW5pdHMgPSBbICdtbScsICdjbScsICdtJywgJ3BjJywgJ3B0JywgJ2luJywgJ2Z0JywgJ3B4JyBdO1xuXG52YXIgY29udmVyc2lvbnMgPSB7XG4gIC8vIG1ldHJpY1xuICBtOiB7XG4gICAgc3lzdGVtOiAnbWV0cmljJyxcbiAgICBmYWN0b3I6IDFcbiAgfSxcbiAgY206IHtcbiAgICBzeXN0ZW06ICdtZXRyaWMnLFxuICAgIGZhY3RvcjogMSAvIDEwMFxuICB9LFxuICBtbToge1xuICAgIHN5c3RlbTogJ21ldHJpYycsXG4gICAgZmFjdG9yOiAxIC8gMTAwMFxuICB9LFxuICAvLyBpbXBlcmlhbFxuICBwdDoge1xuICAgIHN5c3RlbTogJ2ltcGVyaWFsJyxcbiAgICBmYWN0b3I6IDEgLyA3MlxuICB9LFxuICBwYzoge1xuICAgIHN5c3RlbTogJ2ltcGVyaWFsJyxcbiAgICBmYWN0b3I6IDEgLyA2XG4gIH0sXG4gIGluOiB7XG4gICAgc3lzdGVtOiAnaW1wZXJpYWwnLFxuICAgIGZhY3RvcjogMVxuICB9LFxuICBmdDoge1xuICAgIHN5c3RlbTogJ2ltcGVyaWFsJyxcbiAgICBmYWN0b3I6IDEyXG4gIH1cbn07XG5cbmNvbnN0IGFuY2hvcnMgPSB7XG4gIG1ldHJpYzoge1xuICAgIHVuaXQ6ICdtJyxcbiAgICByYXRpbzogMSAvIDAuMDI1NFxuICB9LFxuICBpbXBlcmlhbDoge1xuICAgIHVuaXQ6ICdpbicsXG4gICAgcmF0aW86IDAuMDI1NFxuICB9XG59O1xuXG5mdW5jdGlvbiByb3VuZCAodmFsdWUsIGRlY2ltYWxzKSB7XG4gIHJldHVybiBOdW1iZXIoTWF0aC5yb3VuZCh2YWx1ZSArICdlJyArIGRlY2ltYWxzKSArICdlLScgKyBkZWNpbWFscyk7XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnREaXN0YW5jZSAodmFsdWUsIGZyb21Vbml0LCB0b1VuaXQsIG9wdHMpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ251bWJlcicgfHwgIWlzRmluaXRlKHZhbHVlKSkgdGhyb3cgbmV3IEVycm9yKCdWYWx1ZSBtdXN0IGJlIGEgZmluaXRlIG51bWJlcicpO1xuICBpZiAoIWZyb21Vbml0IHx8ICF0b1VuaXQpIHRocm93IG5ldyBFcnJvcignTXVzdCBzcGVjaWZ5IGZyb20gYW5kIHRvIHVuaXRzJyk7XG5cbiAgb3B0cyA9IG9wdHMgfHwge307XG4gIHZhciBwaXhlbHNQZXJJbmNoID0gZGVmaW5lZChvcHRzLnBpeGVsc1BlckluY2gsIDk2KTtcbiAgdmFyIHByZWNpc2lvbiA9IG9wdHMucHJlY2lzaW9uO1xuICB2YXIgcm91bmRQaXhlbCA9IG9wdHMucm91bmRQaXhlbCAhPT0gZmFsc2U7XG5cbiAgZnJvbVVuaXQgPSBmcm9tVW5pdC50b0xvd2VyQ2FzZSgpO1xuICB0b1VuaXQgPSB0b1VuaXQudG9Mb3dlckNhc2UoKTtcblxuICBpZiAodW5pdHMuaW5kZXhPZihmcm9tVW5pdCkgPT09IC0xKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZnJvbSB1bml0IFwiJyArIGZyb21Vbml0ICsgJ1wiLCBtdXN0IGJlIG9uZSBvZjogJyArIHVuaXRzLmpvaW4oJywgJykpO1xuICBpZiAodW5pdHMuaW5kZXhPZih0b1VuaXQpID09PSAtMSkgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGZyb20gdW5pdCBcIicgKyB0b1VuaXQgKyAnXCIsIG11c3QgYmUgb25lIG9mOiAnICsgdW5pdHMuam9pbignLCAnKSk7XG5cbiAgaWYgKGZyb21Vbml0ID09PSB0b1VuaXQpIHtcbiAgICAvLyBXZSBkb24ndCBuZWVkIHRvIGNvbnZlcnQgZnJvbSBBIHRvIEIgc2luY2UgdGhleSBhcmUgdGhlIHNhbWUgYWxyZWFkeVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIHZhciB0b0ZhY3RvciA9IDE7XG4gIHZhciBmcm9tRmFjdG9yID0gMTtcbiAgdmFyIGlzVG9QaXhlbCA9IGZhbHNlO1xuXG4gIGlmIChmcm9tVW5pdCA9PT0gJ3B4Jykge1xuICAgIGZyb21GYWN0b3IgPSAxIC8gcGl4ZWxzUGVySW5jaDtcbiAgICBmcm9tVW5pdCA9ICdpbic7XG4gIH1cbiAgaWYgKHRvVW5pdCA9PT0gJ3B4Jykge1xuICAgIGlzVG9QaXhlbCA9IHRydWU7XG4gICAgdG9GYWN0b3IgPSBwaXhlbHNQZXJJbmNoO1xuICAgIHRvVW5pdCA9ICdpbic7XG4gIH1cblxuICB2YXIgZnJvbVVuaXREYXRhID0gY29udmVyc2lvbnNbZnJvbVVuaXRdO1xuICB2YXIgdG9Vbml0RGF0YSA9IGNvbnZlcnNpb25zW3RvVW5pdF07XG5cbiAgLy8gc291cmNlIHRvIGFuY2hvciBpbnNpZGUgc291cmNlJ3Mgc3lzdGVtXG4gIHZhciBhbmNob3IgPSB2YWx1ZSAqIGZyb21Vbml0RGF0YS5mYWN0b3IgKiBmcm9tRmFjdG9yO1xuXG4gIC8vIGlmIHN5c3RlbXMgZGlmZmVyLCBjb252ZXJ0IG9uZSB0byBhbm90aGVyXG4gIGlmIChmcm9tVW5pdERhdGEuc3lzdGVtICE9PSB0b1VuaXREYXRhLnN5c3RlbSkge1xuICAgIC8vIHJlZ3VsYXIgJ20nIHRvICdpbicgYW5kIHNvIGZvcnRoXG4gICAgYW5jaG9yICo9IGFuY2hvcnNbZnJvbVVuaXREYXRhLnN5c3RlbV0ucmF0aW87XG4gIH1cblxuICB2YXIgcmVzdWx0ID0gYW5jaG9yIC8gdG9Vbml0RGF0YS5mYWN0b3IgKiB0b0ZhY3RvcjtcbiAgaWYgKGlzVG9QaXhlbCAmJiByb3VuZFBpeGVsKSB7XG4gICAgcmVzdWx0ID0gTWF0aC5yb3VuZChyZXN1bHQpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBwcmVjaXNpb24gPT09ICdudW1iZXInICYmIGlzRmluaXRlKHByZWNpc2lvbikpIHtcbiAgICByZXN1bHQgPSByb3VuZChyZXN1bHQsIHByZWNpc2lvbik7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb252ZXJ0RGlzdGFuY2U7XG5tb2R1bGUuZXhwb3J0cy51bml0cyA9IHVuaXRzO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50c1tpXSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gYXJndW1lbnRzW2ldO1xuICAgIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQXJyYXlpc2gob2JqKSB7XG5cdGlmICghb2JqIHx8IHR5cGVvZiBvYmogPT09ICdzdHJpbmcnKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0cmV0dXJuIG9iaiBpbnN0YW5jZW9mIEFycmF5IHx8IEFycmF5LmlzQXJyYXkob2JqKSB8fFxuXHRcdChvYmoubGVuZ3RoID49IDAgJiYgKG9iai5zcGxpY2UgaW5zdGFuY2VvZiBGdW5jdGlvbiB8fFxuXHRcdFx0KE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqLCAob2JqLmxlbmd0aCAtIDEpKSAmJiBvYmouY29uc3RydWN0b3IubmFtZSAhPT0gJ1N0cmluZycpKSk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHM9W1tcIiM2OWQyZTdcIixcIiNhN2RiZDhcIixcIiNlMGU0Y2NcIixcIiNmMzg2MzBcIixcIiNmYTY5MDBcIl0sW1wiI2ZlNDM2NVwiLFwiI2ZjOWQ5YVwiLFwiI2Y5Y2RhZFwiLFwiI2M4YzhhOVwiLFwiIzgzYWY5YlwiXSxbXCIjZWNkMDc4XCIsXCIjZDk1YjQzXCIsXCIjYzAyOTQyXCIsXCIjNTQyNDM3XCIsXCIjNTM3NzdhXCJdLFtcIiM1NTYyNzBcIixcIiM0ZWNkYzRcIixcIiNjN2Y0NjRcIixcIiNmZjZiNmJcIixcIiNjNDRkNThcIl0sW1wiIzc3NGYzOFwiLFwiI2UwOGU3OVwiLFwiI2YxZDRhZlwiLFwiI2VjZTVjZVwiLFwiI2M1ZTBkY1wiXSxbXCIjZThkZGNiXCIsXCIjY2RiMzgwXCIsXCIjMDM2NTY0XCIsXCIjMDMzNjQ5XCIsXCIjMDMxNjM0XCJdLFtcIiM0OTBhM2RcIixcIiNiZDE1NTBcIixcIiNlOTdmMDJcIixcIiNmOGNhMDBcIixcIiM4YTliMGZcIl0sW1wiIzU5NGY0ZlwiLFwiIzU0Nzk4MFwiLFwiIzQ1YWRhOFwiLFwiIzlkZTBhZFwiLFwiI2U1ZmNjMlwiXSxbXCIjMDBhMGIwXCIsXCIjNmE0YTNjXCIsXCIjY2MzMzNmXCIsXCIjZWI2ODQxXCIsXCIjZWRjOTUxXCJdLFtcIiNlOTRlNzdcIixcIiNkNjgxODlcIixcIiNjNmE0OWFcIixcIiNjNmU1ZDlcIixcIiNmNGVhZDVcIl0sW1wiIzNmYjhhZlwiLFwiIzdmYzdhZlwiLFwiI2RhZDhhN1wiLFwiI2ZmOWU5ZFwiLFwiI2ZmM2Q3ZlwiXSxbXCIjZDljZWIyXCIsXCIjOTQ4Yzc1XCIsXCIjZDVkZWQ5XCIsXCIjN2E2YTUzXCIsXCIjOTliMmI3XCJdLFtcIiNmZmZmZmZcIixcIiNjYmU4NmJcIixcIiNmMmU5ZTFcIixcIiMxYzE0MGRcIixcIiNjYmU4NmJcIl0sW1wiI2VmZmZjZFwiLFwiI2RjZTliZVwiLFwiIzU1NTE1MlwiLFwiIzJlMjYzM1wiLFwiIzk5MTczY1wiXSxbXCIjMzQzODM4XCIsXCIjMDA1ZjZiXCIsXCIjMDA4YzllXCIsXCIjMDBiNGNjXCIsXCIjMDBkZmZjXCJdLFtcIiM0MTNlNGFcIixcIiM3MzYyNmVcIixcIiNiMzgxODRcIixcIiNmMGI0OWVcIixcIiNmN2U0YmVcIl0sW1wiI2ZmNGU1MFwiLFwiI2ZjOTEzYVwiLFwiI2Y5ZDQyM1wiLFwiI2VkZTU3NFwiLFwiI2UxZjVjNFwiXSxbXCIjOTliODk4XCIsXCIjZmVjZWE4XCIsXCIjZmY4NDdjXCIsXCIjZTg0YTVmXCIsXCIjMmEzNjNiXCJdLFtcIiM2NTU2NDNcIixcIiM4MGJjYTNcIixcIiNmNmY3YmRcIixcIiNlNmFjMjdcIixcIiNiZjRkMjhcIl0sW1wiIzAwYThjNlwiLFwiIzQwYzBjYlwiLFwiI2Y5ZjJlN1wiLFwiI2FlZTIzOVwiLFwiIzhmYmUwMFwiXSxbXCIjMzUxMzMwXCIsXCIjNDI0MjU0XCIsXCIjNjQ5MDhhXCIsXCIjZThjYWE0XCIsXCIjY2MyYTQxXCJdLFtcIiM1NTQyMzZcIixcIiNmNzc4MjVcIixcIiNkM2NlM2RcIixcIiNmMWVmYTVcIixcIiM2MGI5OWFcIl0sW1wiI2ZmOTkwMFwiLFwiIzQyNDI0MlwiLFwiI2U5ZTllOVwiLFwiI2JjYmNiY1wiLFwiIzMyOTliYlwiXSxbXCIjNWQ0MTU3XCIsXCIjODM4Njg5XCIsXCIjYThjYWJhXCIsXCIjY2FkN2IyXCIsXCIjZWJlM2FhXCJdLFtcIiM4YzIzMThcIixcIiM1ZThjNmFcIixcIiM4OGE2NWVcIixcIiNiZmIzNWFcIixcIiNmMmM0NWFcIl0sW1wiI2ZhZDA4OVwiLFwiI2ZmOWM1YlwiLFwiI2Y1NjM0YVwiLFwiI2VkMzAzY1wiLFwiIzNiODE4M1wiXSxbXCIjZmY0MjQyXCIsXCIjZjRmYWQyXCIsXCIjZDRlZTVlXCIsXCIjZTFlZGI5XCIsXCIjZjBmMmViXCJdLFtcIiNkMWU3NTFcIixcIiNmZmZmZmZcIixcIiMwMDAwMDBcIixcIiM0ZGJjZTlcIixcIiMyNmFkZTRcIl0sW1wiI2Y4YjE5NVwiLFwiI2Y2NzI4MFwiLFwiI2MwNmM4NFwiLFwiIzZjNWI3YlwiLFwiIzM1NWM3ZFwiXSxbXCIjMWI2NzZiXCIsXCIjNTE5NTQ4XCIsXCIjODhjNDI1XCIsXCIjYmVmMjAyXCIsXCIjZWFmZGU2XCJdLFtcIiNiY2JkYWNcIixcIiNjZmJlMjdcIixcIiNmMjc0MzVcIixcIiNmMDI0NzVcIixcIiMzYjJkMzhcIl0sW1wiIzVlNDEyZlwiLFwiI2ZjZWJiNlwiLFwiIzc4YzBhOFwiLFwiI2YwNzgxOFwiLFwiI2YwYTgzMFwiXSxbXCIjNDUyNjMyXCIsXCIjOTEyMDRkXCIsXCIjZTQ4NDRhXCIsXCIjZThiZjU2XCIsXCIjZTJmN2NlXCJdLFtcIiNlZWU2YWJcIixcIiNjNWJjOGVcIixcIiM2OTY3NThcIixcIiM0NTQ4NGJcIixcIiMzNjM5M2JcIl0sW1wiI2YwZDhhOFwiLFwiIzNkMWMwMFwiLFwiIzg2YjhiMVwiLFwiI2YyZDY5NFwiLFwiI2ZhMmEwMFwiXSxbXCIjZjA0MTU1XCIsXCIjZmY4MjNhXCIsXCIjZjJmMjZmXCIsXCIjZmZmN2JkXCIsXCIjOTVjZmI3XCJdLFtcIiMyYTA0NGFcIixcIiMwYjJlNTlcIixcIiMwZDY3NTlcIixcIiM3YWIzMTdcIixcIiNhMGM1NWZcIl0sW1wiI2JiYmI4OFwiLFwiI2NjYzY4ZFwiLFwiI2VlZGQ5OVwiLFwiI2VlYzI5MFwiLFwiI2VlYWE4OFwiXSxbXCIjYjlkN2Q5XCIsXCIjNjY4Mjg0XCIsXCIjMmEyODI5XCIsXCIjNDkzNzM2XCIsXCIjN2IzYjNiXCJdLFtcIiNiM2NjNTdcIixcIiNlY2YwODFcIixcIiNmZmJlNDBcIixcIiNlZjc0NmZcIixcIiNhYjNlNWJcIl0sW1wiI2EzYTk0OFwiLFwiI2VkYjkyZVwiLFwiI2Y4NTkzMVwiLFwiI2NlMTgzNlwiLFwiIzAwOTk4OVwiXSxbXCIjNjc5MTdhXCIsXCIjMTcwNDA5XCIsXCIjYjhhZjAzXCIsXCIjY2NiZjgyXCIsXCIjZTMzMjU4XCJdLFtcIiNlOGQ1YjdcIixcIiMwZTI0MzBcIixcIiNmYzNhNTFcIixcIiNmNWIzNDlcIixcIiNlOGQ1YjlcIl0sW1wiI2FhYjNhYlwiLFwiI2M0Y2JiN1wiLFwiI2ViZWZjOVwiLFwiI2VlZTBiN1wiLFwiI2U4Y2FhZlwiXSxbXCIjMzAwMDMwXCIsXCIjNDgwMDQ4XCIsXCIjNjAxODQ4XCIsXCIjYzA0ODQ4XCIsXCIjZjA3MjQxXCJdLFtcIiNhYjUyNmJcIixcIiNiY2EyOTdcIixcIiNjNWNlYWVcIixcIiNmMGUyYTRcIixcIiNmNGViYzNcIl0sW1wiIzYwNzg0OFwiLFwiIzc4OTA0OFwiLFwiI2MwZDg2MFwiLFwiI2YwZjBkOFwiLFwiIzYwNDg0OFwiXSxbXCIjYThlNmNlXCIsXCIjZGNlZGMyXCIsXCIjZmZkM2I1XCIsXCIjZmZhYWE2XCIsXCIjZmY4Yzk0XCJdLFtcIiMzZTQxNDdcIixcIiNmZmZlZGZcIixcIiNkZmJhNjlcIixcIiM1YTJlMmVcIixcIiMyYTJjMzFcIl0sW1wiI2I2ZDhjMFwiLFwiI2M4ZDliZlwiLFwiI2RhZGFiZFwiLFwiI2VjZGJiY1wiLFwiI2ZlZGNiYVwiXSxbXCIjZmMzNTRjXCIsXCIjMjkyMjFmXCIsXCIjMTM3NDdkXCIsXCIjMGFiZmJjXCIsXCIjZmNmN2M1XCJdLFtcIiMxYzIxMzBcIixcIiMwMjhmNzZcIixcIiNiM2UwOTlcIixcIiNmZmVhYWRcIixcIiNkMTQzMzRcIl0sW1wiI2VkZWJlNlwiLFwiI2Q2ZTFjN1wiLFwiIzk0YzdiNlwiLFwiIzQwM2IzM1wiLFwiI2QzNjQzYlwiXSxbXCIjY2MwYzM5XCIsXCIjZTY3ODFlXCIsXCIjYzhjZjAyXCIsXCIjZjhmY2MxXCIsXCIjMTY5M2E3XCJdLFtcIiNkYWQ2Y2FcIixcIiMxYmIwY2VcIixcIiM0Zjg2OTlcIixcIiM2YTVlNzJcIixcIiM1NjM0NDRcIl0sW1wiI2E3YzViZFwiLFwiI2U1ZGRjYlwiLFwiI2ViN2I1OVwiLFwiI2NmNDY0N1wiLFwiIzUyNDY1NlwiXSxbXCIjZmRmMWNjXCIsXCIjYzZkNmI4XCIsXCIjOTg3ZjY5XCIsXCIjZTNhZDQwXCIsXCIjZmNkMDM2XCJdLFtcIiM1YzMyM2VcIixcIiNhODI3NDNcIixcIiNlMTVlMzJcIixcIiNjMGQyM2VcIixcIiNlNWYwNGNcIl0sW1wiIzIzMGYyYlwiLFwiI2YyMWQ0MVwiLFwiI2ViZWJiY1wiLFwiI2JjZTNjNVwiLFwiIzgyYjNhZVwiXSxbXCIjYjlkM2IwXCIsXCIjODFiZGE0XCIsXCIjYjI4Nzc0XCIsXCIjZjg4Zjc5XCIsXCIjZjZhYTkzXCJdLFtcIiMzYTExMWNcIixcIiM1NzQ5NTFcIixcIiM4Mzk4OGVcIixcIiNiY2RlYTVcIixcIiNlNmY5YmNcIl0sW1wiIzVlMzkyOVwiLFwiI2NkOGM1MlwiLFwiI2I3ZDFhM1wiLFwiI2RlZThiZVwiLFwiI2ZjZjdkM1wiXSxbXCIjMWMwMTEzXCIsXCIjNmIwMTAzXCIsXCIjYTMwMDA2XCIsXCIjYzIxYTAxXCIsXCIjZjAzYzAyXCJdLFtcIiMzODJmMzJcIixcIiNmZmVhZjJcIixcIiNmY2Q5ZTVcIixcIiNmYmM1ZDhcIixcIiNmMTM5NmRcIl0sW1wiI2UzZGZiYVwiLFwiI2M4ZDZiZlwiLFwiIzkzY2NjNlwiLFwiIzZjYmRiNVwiLFwiIzFhMWYxZVwiXSxbXCIjMDAwMDAwXCIsXCIjOWYxMTFiXCIsXCIjYjExNjIzXCIsXCIjMjkyYzM3XCIsXCIjY2NjY2NjXCJdLFtcIiNjMWIzOThcIixcIiM2MDU5NTFcIixcIiNmYmVlYzJcIixcIiM2MWE2YWJcIixcIiNhY2NlYzBcIl0sW1wiIzhkY2NhZFwiLFwiIzk4ODg2NFwiLFwiI2ZlYTZhMlwiLFwiI2Y5ZDZhY1wiLFwiI2ZmZTlhZlwiXSxbXCIjZjZmNmY2XCIsXCIjZThlOGU4XCIsXCIjMzMzMzMzXCIsXCIjOTkwMTAwXCIsXCIjYjkwNTA0XCJdLFtcIiMxYjMyNWZcIixcIiM5Y2M0ZTRcIixcIiNlOWYyZjlcIixcIiMzYTg5YzlcIixcIiNmMjZjNGZcIl0sW1wiIzVlOWZhM1wiLFwiI2RjZDFiNFwiLFwiI2ZhYjg3ZlwiLFwiI2Y4N2U3YlwiLFwiI2IwNTU3NFwiXSxbXCIjOTUxZjJiXCIsXCIjZjVmNGQ3XCIsXCIjZTBkZmIxXCIsXCIjYTVhMzZjXCIsXCIjNTM1MjMzXCJdLFtcIiM0MTNkM2RcIixcIiMwNDAwMDRcIixcIiNjOGZmMDBcIixcIiNmYTAyM2NcIixcIiM0YjAwMGZcIl0sW1wiI2VmZjNjZFwiLFwiI2IyZDViYVwiLFwiIzYxYWRhMFwiLFwiIzI0OGY4ZFwiLFwiIzYwNTA2M1wiXSxbXCIjMmQyZDI5XCIsXCIjMjE1YTZkXCIsXCIjM2NhMmEyXCIsXCIjOTJjN2EzXCIsXCIjZGZlY2U2XCJdLFtcIiNjZmZmZGRcIixcIiNiNGRlYzFcIixcIiM1YzU4NjNcIixcIiNhODUxNjNcIixcIiNmZjFmNGNcIl0sW1wiIzRlMzk1ZFwiLFwiIzgyNzA4NVwiLFwiIzhlYmU5NFwiLFwiI2NjZmM4ZVwiLFwiI2RjNWIzZVwiXSxbXCIjOWRjOWFjXCIsXCIjZmZmZWM3XCIsXCIjZjU2MjE4XCIsXCIjZmY5ZDJlXCIsXCIjOTE5MTY3XCJdLFtcIiNhMWRiYjJcIixcIiNmZWU1YWRcIixcIiNmYWNhNjZcIixcIiNmN2E1NDFcIixcIiNmNDVkNGNcIl0sW1wiI2ZmZWZkM1wiLFwiI2ZmZmVlNFwiLFwiI2QwZWNlYVwiLFwiIzlmZDZkMlwiLFwiIzhiN2E1ZVwiXSxbXCIjYThhN2E3XCIsXCIjY2M1MjdhXCIsXCIjZTgxNzVkXCIsXCIjNDc0NzQ3XCIsXCIjMzYzNjM2XCJdLFtcIiNmZmVkYmZcIixcIiNmNzgwM2NcIixcIiNmNTQ4MjhcIixcIiMyZTBkMjNcIixcIiNmOGU0YzFcIl0sW1wiI2Y4ZWRkMVwiLFwiI2Q4OGE4YVwiLFwiIzQ3NDg0M1wiLFwiIzlkOWQ5M1wiLFwiI2M1Y2ZjNlwiXSxbXCIjZjM4YThhXCIsXCIjNTU0NDNkXCIsXCIjYTBjYWI1XCIsXCIjY2RlOWNhXCIsXCIjZjFlZGQwXCJdLFtcIiM0ZTRkNGFcIixcIiMzNTM0MzJcIixcIiM5NGJhNjVcIixcIiMyNzkwYjBcIixcIiMyYjRlNzJcIl0sW1wiIzBjYTViMFwiLFwiIzRlM2YzMFwiLFwiI2ZlZmVlYlwiLFwiI2Y4ZjRlNFwiLFwiI2E1YjNhYVwiXSxbXCIjYTcwMjY3XCIsXCIjZjEwYzQ5XCIsXCIjZmI2YjQxXCIsXCIjZjZkODZiXCIsXCIjMzM5MTk0XCJdLFtcIiM5ZDdlNzlcIixcIiNjY2FjOTVcIixcIiM5YTk0N2NcIixcIiM3NDhiODNcIixcIiM1Yjc1NmNcIl0sW1wiI2VkZjZlZVwiLFwiI2QxYzA4OVwiLFwiI2IzMjA0ZFwiLFwiIzQxMmUyOFwiLFwiIzE1MTEwMVwiXSxbXCIjMDQ2ZDhiXCIsXCIjMzA5MjkyXCIsXCIjMmZiOGFjXCIsXCIjOTNhNDJhXCIsXCIjZWNiZTEzXCJdLFtcIiM0ZDNiM2JcIixcIiNkZTYyNjJcIixcIiNmZmI4OGNcIixcIiNmZmQwYjNcIixcIiNmNWUwZDNcIl0sW1wiI2ZmZmJiN1wiLFwiI2E2ZjZhZlwiLFwiIzY2YjZhYlwiLFwiIzViN2M4ZFwiLFwiIzRmMjk1OFwiXSxbXCIjZmYwMDNjXCIsXCIjZmY4YTAwXCIsXCIjZmFiZTI4XCIsXCIjODhjMTAwXCIsXCIjMDBjMTc2XCJdLFtcIiNmY2ZlZjVcIixcIiNlOWZmZTFcIixcIiNjZGNmYjdcIixcIiNkNmU2YzNcIixcIiNmYWZiZTNcIl0sW1wiIzljZGRjOFwiLFwiI2JmZDhhZFwiLFwiI2RkZDlhYlwiLFwiI2Y3YWY2M1wiLFwiIzYzM2QyZVwiXSxbXCIjMzAyNjFjXCIsXCIjNDAzODMxXCIsXCIjMzY1NDRmXCIsXCIjMWY1ZjYxXCIsXCIjMGI4MTg1XCJdLFtcIiNkMTMxM2RcIixcIiNlNTYyNWNcIixcIiNmOWJmNzZcIixcIiM4ZWIyYzVcIixcIiM2MTUzNzVcIl0sW1wiI2ZmZTE4MVwiLFwiI2VlZTllNVwiLFwiI2ZhZDNiMlwiLFwiI2ZmYmE3ZlwiLFwiI2ZmOWM5N1wiXSxbXCIjYWFmZjAwXCIsXCIjZmZhYTAwXCIsXCIjZmYwMGFhXCIsXCIjYWEwMGZmXCIsXCIjMDBhYWZmXCJdLFtcIiNjMjQxMmRcIixcIiNkMWFhMzRcIixcIiNhN2E4NDRcIixcIiNhNDY1ODNcIixcIiM1YTFlNGFcIl0sW1wiIzc1NjE2YlwiLFwiI2JmY2ZmN1wiLFwiI2RjZTRmN1wiLFwiI2Y4ZjNiZlwiLFwiI2QzNDAxN1wiXSxbXCIjODA1ODQxXCIsXCIjZGNmN2YzXCIsXCIjZmZmY2RkXCIsXCIjZmZkOGQ4XCIsXCIjZjVhMmEyXCJdLFtcIiMzNzlmN2FcIixcIiM3OGFlNjJcIixcIiNiYmI3NDlcIixcIiNlMGZiYWNcIixcIiMxZjFjMGRcIl0sW1wiIzczYzhhOVwiLFwiI2RlZTFiNlwiLFwiI2UxYjg2NlwiLFwiI2JkNTUzMlwiLFwiIzM3M2I0NFwiXSxbXCIjY2FmZjQyXCIsXCIjZWJmN2Y4XCIsXCIjZDBlMGViXCIsXCIjODhhYmMyXCIsXCIjNDk3MDhhXCJdLFtcIiM3ZTU2ODZcIixcIiNhNWFhZDlcIixcIiNlOGY5YTJcIixcIiNmOGExM2ZcIixcIiNiYTNjM2RcIl0sW1wiIzgyODM3ZVwiLFwiIzk0YjA1M1wiLFwiI2JkZWIwN1wiLFwiI2JmZmEzN1wiLFwiI2UwZTBlMFwiXSxbXCIjMTExNjI1XCIsXCIjMzQxOTMxXCIsXCIjNTcxYjNjXCIsXCIjN2ExZTQ4XCIsXCIjOWQyMDUzXCJdLFtcIiMzMTI3MzZcIixcIiNkNDgzOGZcIixcIiNkNmFiYjFcIixcIiNkOWQ5ZDlcIixcIiNjNGZmZWJcIl0sW1wiIzg0YjI5NVwiLFwiI2VjY2Y4ZFwiLFwiI2JiODEzOFwiLFwiI2FjMjAwNVwiLFwiIzJjMTUwN1wiXSxbXCIjMzk1YTRmXCIsXCIjNDMyMzMwXCIsXCIjODUzYzQzXCIsXCIjZjI1YzVlXCIsXCIjZmZhNTY2XCJdLFtcIiNmZGU2YmRcIixcIiNhMWM1YWJcIixcIiNmNGRkNTFcIixcIiNkMTFlNDhcIixcIiM2MzJmNTNcIl0sW1wiIzZkYTY3YVwiLFwiIzc3Yjg4NVwiLFwiIzg2YzI4YlwiLFwiIzg1OTk4N1wiLFwiIzRhNDg1N1wiXSxbXCIjYmVkNmM3XCIsXCIjYWRjMGI0XCIsXCIjOGE3ZTY2XCIsXCIjYTc5YjgzXCIsXCIjYmJiMmExXCJdLFtcIiMwNTg3ODlcIixcIiM1MDNkMmVcIixcIiNkNTRiMWFcIixcIiNlM2E3MmZcIixcIiNmMGVjYzlcIl0sW1wiI2UyMWI1YVwiLFwiIzllMGMzOVwiLFwiIzMzMzMzM1wiLFwiI2ZiZmZlM1wiLFwiIzgzYTMwMFwiXSxbXCIjMjYxYzIxXCIsXCIjNmUxZTYyXCIsXCIjYjAyNTRmXCIsXCIjZGU0MTI2XCIsXCIjZWI5NjA1XCJdLFtcIiNiNWFjMDFcIixcIiNlY2JhMDlcIixcIiNlODZlMWNcIixcIiNkNDFlNDVcIixcIiMxYjE1MjFcIl0sW1wiI2VmZDliNFwiLFwiI2Q2YTY5MlwiLFwiI2EzOTA4MVwiLFwiIzRkNjE2MFwiLFwiIzI5MjUyMlwiXSxbXCIjZmJjNTk5XCIsXCIjY2RiYjkzXCIsXCIjOWVhZThhXCIsXCIjMzM1NjUwXCIsXCIjZjM1ZjU1XCJdLFtcIiNjNzUyMzNcIixcIiNjNzg5MzNcIixcIiNkNmNlYWFcIixcIiM3OWI1YWNcIixcIiM1ZTJmNDZcIl0sW1wiIzc5M2E1N1wiLFwiIzRkMzMzOVwiLFwiIzhjODczZVwiLFwiI2QxYzVhNVwiLFwiI2EzOGE1ZlwiXSxbXCIjZjJlM2M2XCIsXCIjZmZjNmE1XCIsXCIjZTYzMjRiXCIsXCIjMmIyYjJiXCIsXCIjMzUzNjM0XCJdLFtcIiM1MTJiNTJcIixcIiM2MzUyNzRcIixcIiM3YmIwYThcIixcIiNhN2RiYWJcIixcIiNlNGY1YjFcIl0sW1wiIzU5YjM5MFwiLFwiI2YwZGRhYVwiLFwiI2U0N2M1ZFwiLFwiI2UzMmQ0MFwiLFwiIzE1MmIzY1wiXSxbXCIjZmRmZmQ5XCIsXCIjZmZmMGI4XCIsXCIjZmZkNmEzXCIsXCIjZmFhZDhlXCIsXCIjMTQyZjMwXCJdLFtcIiMxMTc2NmRcIixcIiM0MTA5MzZcIixcIiNhNDBiNTRcIixcIiNlNDZmMGFcIixcIiNmMGIzMDBcIl0sW1wiIzExNjQ0ZFwiLFwiI2EwYjA0NlwiLFwiI2YyYzk0ZVwiLFwiI2Y3ODE0NVwiLFwiI2YyNGU0ZVwiXSxbXCIjYzdmY2Q3XCIsXCIjZDlkNWE3XCIsXCIjZDlhYjkxXCIsXCIjZTY4NjdhXCIsXCIjZWQ0YTZhXCJdLFtcIiM1OTU2NDNcIixcIiM0ZTZiNjZcIixcIiNlZDgzNGVcIixcIiNlYmNjNmVcIixcIiNlYmUxYzVcIl0sW1wiIzMzMTMyN1wiLFwiIzk5MTc2NlwiLFwiI2Q5MGY1YVwiLFwiI2YzNDczOVwiLFwiI2ZmNmUyN1wiXSxbXCIjYmY0OTZhXCIsXCIjYjM5YzgyXCIsXCIjYjhjOTlkXCIsXCIjZjBkMzk5XCIsXCIjNTk1MTUxXCJdLFtcIiNmMTM5NmRcIixcIiNmZDYwODFcIixcIiNmM2ZmZWJcIixcIiNhY2M5NWZcIixcIiM4Zjk5MjRcIl0sW1wiI2VmZWVjY1wiLFwiI2ZlOGIwNVwiLFwiI2ZlMDU1N1wiLFwiIzQwMDQwM1wiLFwiIzBhYWJiYVwiXSxbXCIjZTVlYWE0XCIsXCIjYThjNGEyXCIsXCIjNjlhNWE0XCIsXCIjNjE2MzgyXCIsXCIjNjYyNDViXCJdLFtcIiNlOWUwZDFcIixcIiM5MWEzOThcIixcIiMzMzYwNWFcIixcIiMwNzAwMDFcIixcIiM2ODQ2MmJcIl0sW1wiI2U0ZGVkMFwiLFwiI2FiY2NiZFwiLFwiIzdkYmViOFwiLFwiIzE4MTYxOVwiLFwiI2UzMmYyMVwiXSxbXCIjZTBlZmYxXCIsXCIjN2RiNGI1XCIsXCIjZmZmZmZmXCIsXCIjNjgwMTQ4XCIsXCIjMDAwMDAwXCJdLFtcIiNiN2NiYmZcIixcIiM4Yzg4NmZcIixcIiNmOWE3OTlcIixcIiNmNGJmYWRcIixcIiNmNWRhYmRcIl0sW1wiI2ZmYjg4NFwiLFwiI2Y1ZGY5OFwiLFwiI2ZmZjhkNFwiLFwiI2MwZDFjMlwiLFwiIzJlNDM0N1wiXSxbXCIjNmRhNjdhXCIsXCIjOTlhNjZkXCIsXCIjYTliZDY4XCIsXCIjYjVjYzZhXCIsXCIjYzBkZTVkXCJdLFtcIiNiMWU2ZDFcIixcIiM3N2IxYTlcIixcIiMzZDdiODBcIixcIiMyNzBhMzNcIixcIiM0NTFhM2VcIl0sW1wiI2ZjMjg0ZlwiLFwiI2ZmODI0YVwiLFwiI2ZlYTg4N1wiLFwiI2Y2ZTdmN1wiLFwiI2QxZDBkN1wiXSxbXCIjZmZhYjA3XCIsXCIjZTlkNTU4XCIsXCIjNzJhZDc1XCIsXCIjMGU4ZDk0XCIsXCIjNDM0ZDUzXCJdLFtcIiMzMTFkMzlcIixcIiM2NzQzNGZcIixcIiM5YjhlN2VcIixcIiNjM2NjYWZcIixcIiNhNTFhNDFcIl0sW1wiIzVjYWNjNFwiLFwiIzhjZDE5ZFwiLFwiI2NlZTg3OVwiLFwiI2ZjYjY1M1wiLFwiI2ZmNTI1NFwiXSxbXCIjNDQ3NDlkXCIsXCIjYzZkNGUxXCIsXCIjZmZmZmZmXCIsXCIjZWJlN2UwXCIsXCIjYmRiOGFkXCJdLFtcIiNjZmI1OTBcIixcIiM5ZTlhNDFcIixcIiM3NTg5MThcIixcIiM1NjQzMzRcIixcIiM0OTI4MWZcIl0sW1wiI2U0ZTRjNVwiLFwiI2I5ZDQ4YlwiLFwiIzhkMjAzNlwiLFwiI2NlMGEzMVwiLFwiI2QzZTRjNVwiXSxbXCIjY2NmMzkwXCIsXCIjZTBlMDVhXCIsXCIjZjdjNDFmXCIsXCIjZmM5MzBhXCIsXCIjZmYwMDNkXCJdLFtcIiM4MDc0NjJcIixcIiNhNjk3ODVcIixcIiNiOGZhZmZcIixcIiNlOGZkZmZcIixcIiM2NjVjNDlcIl0sW1wiI2VjNDQwMVwiLFwiI2NjOWIyNVwiLFwiIzEzY2Q0YVwiLFwiIzdiNmVkNlwiLFwiIzVlNTI1Y1wiXSxbXCIjY2M1ZDRjXCIsXCIjZmZmZWM2XCIsXCIjYzdkMWFmXCIsXCIjOTZiNDljXCIsXCIjNWI1ODQ3XCJdLFtcIiNlM2U4Y2RcIixcIiNiY2Q4YmZcIixcIiNkM2I5YTNcIixcIiNlZTljOTJcIixcIiNmZTg1N2VcIl0sW1wiIzM2MDc0NVwiLFwiI2Q2MWM1OVwiLFwiI2U3ZDg0YlwiLFwiI2VmZWFjNVwiLFwiIzFiODc5OFwiXSxbXCIjMmIyMjJjXCIsXCIjNWU0MzUyXCIsXCIjOTY1ZDYyXCIsXCIjYzc5NTZkXCIsXCIjZjJkOTc0XCJdLFtcIiNlN2VkZWFcIixcIiNmZmM1MmNcIixcIiNmYjBjMDZcIixcIiMwMzBkNGZcIixcIiNjZWVjZWZcIl0sW1wiI2ViOWM0ZFwiLFwiI2YyZDY4MFwiLFwiI2YzZmZjZlwiLFwiI2JhYzlhOVwiLFwiIzY5NzA2MFwiXSxbXCIjZmZmM2RiXCIsXCIjZTdlNGQ1XCIsXCIjZDNjOGI0XCIsXCIjYzg0NjQ4XCIsXCIjNzAzZTNiXCJdLFtcIiNmNWRkOWRcIixcIiNiY2M0OTlcIixcIiM5MmE2OGFcIixcIiM3YjhmOGFcIixcIiM1MDYyNjZcIl0sW1wiI2YyZThjNFwiLFwiIzk4ZDliNlwiLFwiIzNlYzlhN1wiLFwiIzJiODc5ZVwiLFwiIzYxNjY2OFwiXSxbXCIjMDQxMTIyXCIsXCIjMjU5MDczXCIsXCIjN2ZkYTg5XCIsXCIjYzhlOThlXCIsXCIjZTZmOTlkXCJdLFtcIiNjNmNjYTVcIixcIiM4YWI4YThcIixcIiM2Yjk5OTdcIixcIiM1NDc4N2RcIixcIiM2MTUxNDVcIl0sW1wiIzRiMTEzOVwiLFwiIzNiNDA1OFwiLFwiIzJhNmU3OFwiLFwiIzdhOTA3Y1wiLFwiI2M5YjE4MFwiXSxbXCIjOGQ3OTY2XCIsXCIjYThhMzlkXCIsXCIjZDhjOGI4XCIsXCIjZTJkZGQ5XCIsXCIjZjhmMWU5XCJdLFtcIiMyZDFiMzNcIixcIiNmMzZhNzFcIixcIiNlZTg4N2FcIixcIiNlNGUzOTFcIixcIiM5YWJjOGFcIl0sW1wiIzk1YTEzMVwiLFwiI2M4Y2QzYlwiLFwiI2Y2ZjFkZVwiLFwiI2Y1YjlhZVwiLFwiI2VlMGI1YlwiXSxbXCIjNzkyNTRhXCIsXCIjNzk1YzY0XCIsXCIjNzk5MjdkXCIsXCIjYWViMThlXCIsXCIjZTNjZjllXCJdLFtcIiM0MjkzOThcIixcIiM2YjVkNGRcIixcIiNiMGExOGZcIixcIiNkZmNkYjRcIixcIiNmYmVlZDNcIl0sW1wiIzFkMTMxM1wiLFwiIzI0YjY5NFwiLFwiI2QyMjA0MlwiLFwiI2EzYjgwOFwiLFwiIzMwYzRjOVwiXSxbXCIjOWQ5ZTk0XCIsXCIjYzk5ZTkzXCIsXCIjZjU5ZDkyXCIsXCIjZTViOGFkXCIsXCIjZDVkMmM4XCJdLFtcIiNmMGZmYzlcIixcIiNhOWRhODhcIixcIiM2Mjk5N2FcIixcIiM3MjI0M2RcIixcIiMzYjA4MTlcIl0sW1wiIzMyMjkzOFwiLFwiIzg5YTE5NFwiLFwiI2NmYzg5YVwiLFwiI2NjODgzYVwiLFwiI2ExNDAxNlwiXSxbXCIjNDUyZTNjXCIsXCIjZmYzZDVhXCIsXCIjZmZiOTY5XCIsXCIjZWFmMjdlXCIsXCIjM2I4Yzg4XCJdLFtcIiNmMDZkNjFcIixcIiNkYTgyNWZcIixcIiNjNDk3NWNcIixcIiNhOGFiN2JcIixcIiM4Y2JmOTlcIl0sW1wiIzU0MDA0NVwiLFwiI2M2MDA1MlwiLFwiI2ZmNzE0YlwiLFwiI2VhZmY4N1wiLFwiI2FjZmZlOVwiXSxbXCIjMmIyNzI2XCIsXCIjMGE1MTZkXCIsXCIjMDE4NzkwXCIsXCIjN2RhZDkzXCIsXCIjYmFjY2E0XCJdLFtcIiMwMjdiN2ZcIixcIiNmZmE1ODhcIixcIiNkNjI5NTdcIixcIiNiZjFlNjJcIixcIiM1NzJlNGZcIl0sW1wiIzIzMTkyZFwiLFwiI2ZkMGE1NFwiLFwiI2Y1NzU3NlwiLFwiI2ZlYmY5N1wiLFwiI2Y1ZWNiN1wiXSxbXCIjZmE2YTY0XCIsXCIjN2E0ZTQ4XCIsXCIjNGE0MDMxXCIsXCIjZjZlMmJiXCIsXCIjOWVjNmI4XCJdLFtcIiNhM2M2OGNcIixcIiM4Nzk2NzZcIixcIiM2ZTY2NjJcIixcIiM0ZjM2NGFcIixcIiMzNDA3MzVcIl0sW1wiI2Y2ZDc2YlwiLFwiI2ZmOTAzNlwiLFwiI2Q2MjU0ZFwiLFwiI2ZmNTQ3NVwiLFwiI2ZkZWJhOVwiXSxbXCIjODBhOGE4XCIsXCIjOTA5ZDllXCIsXCIjYTg4YzhjXCIsXCIjZmYwZDUxXCIsXCIjN2E4Yzg5XCJdLFtcIiNhMzJjMjhcIixcIiMxYzA5MGJcIixcIiMzODQwMzBcIixcIiM3YjgwNTVcIixcIiNiY2E4NzVcIl0sW1wiIzZkOTc4OFwiLFwiIzFlMjUyOFwiLFwiIzdlMWMxM1wiLFwiI2JmMGEwZFwiLFwiI2U2ZTFjMlwiXSxbXCIjMzczNzM3XCIsXCIjOGRiOTg2XCIsXCIjYWNjZTkxXCIsXCIjYmFkYjczXCIsXCIjZWZlYWU0XCJdLFtcIiMyODA5MDRcIixcIiM2ODBlMzRcIixcIiM5YTE1MWFcIixcIiNjMjFiMTJcIixcIiNmYzRiMmFcIl0sW1wiI2ZiNjkwMFwiLFwiI2Y2MzcwMFwiLFwiIzAwNDg1M1wiLFwiIzAwN2U4MFwiLFwiIzAwYjliZFwiXSxbXCIjZTZiMzlhXCIsXCIjZTZjYmE1XCIsXCIjZWRlM2I0XCIsXCIjOGI5ZTliXCIsXCIjNmQ3NTc4XCJdLFtcIiM2NDFmNWVcIixcIiM2NzYwNzdcIixcIiM2NWFjOTJcIixcIiNjMmMwOTJcIixcIiNlZGQ0OGVcIl0sW1wiI2E2OWU4MFwiLFwiI2UwYmE5YlwiLFwiI2U3YTk3ZVwiLFwiI2QyODU3NFwiLFwiIzNiMTkyMlwiXSxbXCIjMTYxNjE2XCIsXCIjYzk0ZDY1XCIsXCIjZTdjMDQ5XCIsXCIjOTJiMzVhXCIsXCIjMWY2NzY0XCJdLFtcIiMyMzRkMjBcIixcIiMzNjgwMmRcIixcIiM3N2FiNTlcIixcIiNjOWRmOGFcIixcIiNmMGY3ZGFcIl0sW1wiIzRiM2U0ZFwiLFwiIzFlOGM5M1wiLFwiI2RiZDhhMlwiLFwiI2M0YWMzMFwiLFwiI2Q3NGYzM1wiXSxbXCIjZmY3NDc0XCIsXCIjZjU5YjcxXCIsXCIjYzdjNzdmXCIsXCIjZTBlMGE4XCIsXCIjZjFmMWMxXCJdLFtcIiNlNmViYTlcIixcIiNhYmJiOWZcIixcIiM2ZjhiOTRcIixcIiM3MDY0ODJcIixcIiM3MDNkNmZcIl0sW1wiIzI2MjUxY1wiLFwiI2ViMGE0NFwiLFwiI2YyNjQzZFwiLFwiI2YyYTczZFwiLFwiI2EwZThiN1wiXSxbXCIjZmRjZmJmXCIsXCIjZmViODlmXCIsXCIjZTIzZDc1XCIsXCIjNWYwZDNiXCIsXCIjNzQyMzY1XCJdLFtcIiMyMzBiMDBcIixcIiNhMjlkN2ZcIixcIiNkNGNmYTVcIixcIiNmOGVjZDRcIixcIiNhYWJlOWJcIl0sW1wiIzg1ODQ3ZVwiLFwiI2FiNmE2ZVwiLFwiI2Y3MzQ1YlwiLFwiIzM1MzEzMFwiLFwiI2NiY2ZiNFwiXSxbXCIjZDRmN2RjXCIsXCIjZGJlN2I0XCIsXCIjZGJjMDkyXCIsXCIjZTA4NDZkXCIsXCIjZjUxNDQxXCJdLFtcIiNkM2Q1YjBcIixcIiNiNWNlYTRcIixcIiM5ZGMxOWRcIixcIiM4YzdjNjJcIixcIiM3MTQ0M2ZcIl0sW1wiIzRmMzY0Y1wiLFwiIzVlNDA1ZlwiLFwiIzZiNmI2YlwiLFwiIzhmOWU2ZlwiLFwiI2IxY2Y3MlwiXSxbXCIjYmZjZGI0XCIsXCIjZjdlNWJmXCIsXCIjZWFkMmE0XCIsXCIjZWZiMTk4XCIsXCIjN2Q1ZDRlXCJdLFtcIiM2ZjU4NDZcIixcIiNhOTVhNTJcIixcIiNlMzViNWRcIixcIiNmMTgwNTJcIixcIiNmZmE0NDZcIl0sW1wiI2ZmMzM2NlwiLFwiI2M3NDA2NlwiLFwiIzhmNGQ2NVwiLFwiIzU3NWE2NVwiLFwiIzFmNjc2NFwiXSxbXCIjZmZmZjk5XCIsXCIjZDljYzhjXCIsXCIjYjM5OTgwXCIsXCIjOGM2NjczXCIsXCIjNjYzMzY2XCJdLFtcIiNjNDY1NjRcIixcIiNmMGU5OTlcIixcIiNiOGM5OWRcIixcIiM5YjcyNmZcIixcIiNlZWIxNWJcIl0sW1wiI2VlZGE5NVwiLFwiI2I3YzI3ZVwiLFwiIzlhOTI3YlwiLFwiIzhhNmE2YlwiLFwiIzgwNTU2NlwiXSxbXCIjNjJhMDdiXCIsXCIjNGY4Yjg5XCIsXCIjNTM2YzhkXCIsXCIjNWM0Zjc5XCIsXCIjNjEzODYwXCJdLFtcIiMxYTA4MWZcIixcIiM0ZDFkNGRcIixcIiMwNTY3NmVcIixcIiM0ODljNzlcIixcIiNlYmMyODhcIl0sW1wiI2YwZjBkOFwiLFwiI2I0ZGViZVwiLFwiIzc3Y2NhNFwiLFwiIzY2NjY2NlwiLFwiI2I0ZGYzN1wiXSxbXCIjZWQ2NDY0XCIsXCIjYmY2MzcwXCIsXCIjODc1ODZjXCIsXCIjNTc0NzU5XCIsXCIjMWExYjFjXCJdLFtcIiNjY2IyNGNcIixcIiNmN2Q2ODNcIixcIiNmZmZkYzBcIixcIiNmZmZmZmRcIixcIiM0NTdkOTdcIl0sW1wiIzdhNWIzZVwiLFwiI2ZhZmFmYVwiLFwiI2ZhNGIwMFwiLFwiI2NkYmRhZVwiLFwiIzFmMWYxZlwiXSxbXCIjNTY2OTY1XCIsXCIjOTQ4YTcxXCIsXCIjY2M5NDc2XCIsXCIjZjJhMTc2XCIsXCIjZmY3MzczXCJdLFtcIiNkMzE5MDBcIixcIiNmZjY2MDBcIixcIiNmZmYyYWZcIixcIiM3Y2I0OTBcIixcIiMwMDAwMDBcIl0sW1wiI2QyNDg1OFwiLFwiI2VhODY3NlwiLFwiI2VhYjA1ZVwiLFwiI2ZkZWVjZFwiLFwiIzQ5MzgzMVwiXSxbXCIjZWJlYWE5XCIsXCIjZWJjNTg4XCIsXCIjN2QyOTQ4XCIsXCIjM2IwMDMyXCIsXCIjMGUwYjI5XCJdLFtcIiM0MTFmMmRcIixcIiNhYzQxNDdcIixcIiNmODg4NjNcIixcIiNmZmMyN2ZcIixcIiNmZmUyOWFcIl0sW1wiI2U3ZTc5ZFwiLFwiI2MwZDg5MFwiLFwiIzc4YTg5MFwiLFwiIzYwNjA3OFwiLFwiI2Q4YTg3OFwiXSxbXCIjOWRiY2JjXCIsXCIjZjBmMGFmXCIsXCIjZmYzNzBmXCIsXCIjMzMyNzE3XCIsXCIjNmJhY2JmXCJdLFtcIiMwNjM5NDBcIixcIiMxOTVlNjNcIixcIiMzZTgzOGNcIixcIiM4ZWJkYjZcIixcIiNlY2UxYzNcIl0sW1wiI2U4YzM4MlwiLFwiI2IzOWQ2OVwiLFwiI2E4NmI0Y1wiLFwiIzdkMWEwY1wiLFwiIzM0MGEwYlwiXSxbXCIjOTQ2NTRjXCIsXCIjZjg5ZmExXCIsXCIjZmFiZGJkXCIsXCIjZmFkNmQ2XCIsXCIjZmVmY2QwXCJdLFtcIiM1OTViNWFcIixcIiMxNGMzYTJcIixcIiMwZGU1YThcIixcIiM3Y2Y0OWFcIixcIiNiOGZkOTlcIl0sW1wiI2NkZGJjMlwiLFwiI2Y3ZTRjNlwiLFwiI2ZiOTI3NFwiLFwiI2Y1NTY1YlwiLFwiIzg3NTM0NlwiXSxbXCIjZjBkZGJkXCIsXCIjYmEzNjIyXCIsXCIjODUxZTI1XCIsXCIjNTIwYzMwXCIsXCIjMWM5OTdmXCJdLFtcIiMzMTJjMjBcIixcIiM0OTRkNGJcIixcIiM3YzcwNTJcIixcIiNiM2ExNzZcIixcIiNlMmNiOTJcIl0sW1wiI2U3ZGQ5NlwiLFwiI2UxNjYzOVwiLFwiI2FkODYwYVwiLFwiI2I3MDIzZlwiLFwiIzU1MDI0YVwiXSxbXCIjNTc0YzQxXCIsXCIjZTM2YjZiXCIsXCIjZTNhNTZiXCIsXCIjZTNjNzdiXCIsXCIjOTY4NzVhXCJdLFtcIiMzZjJjMjZcIixcIiNkZDQyM2VcIixcIiNhMmEzODRcIixcIiNlYWMzODhcIixcIiNjNWFkNGJcIl0sW1wiIzBhMDMxMFwiLFwiIzQ5MDA3ZVwiLFwiI2ZmMDA1YlwiLFwiI2ZmN2QxMFwiLFwiI2ZmYjIzOFwiXSxbXCIjY2RlY2NjXCIsXCIjZWRkMjY5XCIsXCIjZTg4NDYwXCIsXCIjZjIzNDYwXCIsXCIjMzIxZDJlXCJdLFtcIiMxZjFmMjBcIixcIiMyYjRjN2VcIixcIiM1NjdlYmJcIixcIiM2MDZkODBcIixcIiNkY2UwZTZcIl0sW1wiI2YzZTdkN1wiLFwiI2Y3ZDdjZFwiLFwiI2Y4YzdjOVwiLFwiI2UwYzBjN1wiLFwiI2M3YjljNVwiXSxbXCIjZWNiZTEzXCIsXCIjNzM4Yzc5XCIsXCIjNmE2YjVmXCIsXCIjMmMyYjI2XCIsXCIjYTQzOTU1XCJdLFtcIiNkZGUwY2ZcIixcIiNjNmJlOWFcIixcIiNhZDhiMzJcIixcIiM5Mzc0NjBcIixcIiM4YzViN2JcIl0sW1wiIzE4MTQxOVwiLFwiIzRhMDczY1wiLFwiIzllMGI0MVwiLFwiI2NjM2UxOFwiLFwiI2YwOTcxY1wiXSxbXCIjMDI5ZGFmXCIsXCIjZTVkNTk5XCIsXCIjZmZjMjE5XCIsXCIjZjA3YzE5XCIsXCIjZTMyNTUxXCJdLFtcIiNmZmY1ZGVcIixcIiNiOGQ5YzhcIixcIiM5MTcwODFcIixcIiM3NTBlNDlcIixcIiM0ZDAwMmJcIl0sW1wiIzRkM2IzNlwiLFwiI2ViNjEzYlwiLFwiI2Y5OGY2ZlwiLFwiI2MxZDljZFwiLFwiI2Y3ZWFkY1wiXSxbXCIjNDEzMDQwXCIsXCIjNmM2MzY4XCIsXCIjYjlhMTczXCIsXCIjZWFhMzUzXCIsXCIjZmZlZmE5XCJdLFtcIiNmZmNkYjhcIixcIiNmZGVlY2ZcIixcIiNjOGM2OTZcIixcIiM5N2JlYTlcIixcIiMzNzI2MGNcIl0sW1wiIzIxMzQzNVwiLFwiIzQ2Njg1YlwiLFwiIzY0OGE2NFwiLFwiI2E2Yjk4NVwiLFwiI2UxZTNhY1wiXSxbXCIjZmZmZmZmXCIsXCIjZmZmYWViXCIsXCIjZjBmMGQ4XCIsXCIjY2ZjZmNmXCIsXCIjOTY3YzUyXCJdLFtcIiNlOGQzYTlcIixcIiNlMzliN2RcIixcIiM2ZTY0NjBcIixcIiM4OWIzOTlcIixcIiNiY2JmYTNcIl0sW1wiI2VkNTY3MlwiLFwiIzE2MGUzMlwiLFwiIzllYWU4YVwiLFwiI2NkYmI5M1wiLFwiI2ZiYzU5OVwiXSxbXCIjMDAxNDQ5XCIsXCIjMDEyNjc3XCIsXCIjMDA1YmM1XCIsXCIjMDBiNGZjXCIsXCIjMTdmOWZmXCJdLFtcIiM0ZGFiOGNcIixcIiM1NDI2MzhcIixcIiM4ZjI0NGRcIixcIiNjOTMwNmJcIixcIiNlODZmOWVcIl0sW1wiIzY3YmU5YlwiLFwiIzk1ZDBiOFwiLFwiI2ZjZmNkN1wiLFwiI2YxZGI0MlwiLFwiI2YwNDE1OFwiXSxbXCIjMmIxNzE5XCIsXCIjMDI0ODNlXCIsXCIjMDU3YzQ2XCIsXCIjOWJiNjFiXCIsXCIjZjhiZTAwXCJdLFtcIiNmZmZmMDBcIixcIiNjY2Q5MWFcIixcIiM5OWIzMzNcIixcIiM2NjhjNGRcIixcIiMzMzY2NjZcIl0sW1wiIzEzMDkxMlwiLFwiIzNlMWMzM1wiLFwiIzYwMjc0OVwiLFwiI2IxNDYyM1wiLFwiI2Y2OTIxZFwiXSxbXCIjZTdlZWQwXCIsXCIjY2FkMWMzXCIsXCIjOTQ4ZTk5XCIsXCIjNTE0MjVmXCIsXCIjMmUxNDM3XCJdLFtcIiNlMjU4NThcIixcIiNlOWQ2YWZcIixcIiNmZmZmZGRcIixcIiNjMGVmZDJcIixcIiMzODQyNTJcIl0sW1wiI2U2YTA2ZlwiLFwiIzllOWM3MVwiLFwiIzVlODI3MVwiLFwiIzMzNDU0ZVwiLFwiIzI0MjczOVwiXSxbXCIjZmFmNmQwXCIsXCIjYzdkOGFiXCIsXCIjOTA5YTkyXCIsXCIjNzQ0Zjc4XCIsXCIjMzAwOTFlXCJdLFtcIiNhY2RlYjJcIixcIiNlMWVhYjVcIixcIiNlZGFkOWVcIixcIiNmZTRiNzRcIixcIiMzOTBkMmRcIl0sW1wiIzQyMjgyY1wiLFwiIzZjYTE5ZVwiLFwiIzg0YWJhYVwiLFwiI2RlZDFiNlwiLFwiIzZkOTk3YVwiXSxbXCIjOWYwYTI4XCIsXCIjZDU1YzJiXCIsXCIjZjZlN2QzXCIsXCIjODlhNDZmXCIsXCIjNTUyMDNjXCJdLFtcIiM0MThlOGVcIixcIiM1YTRlM2NcIixcIiNjNGQ0MjhcIixcIiNkOGU0NzJcIixcIiNlOWViYmZcIl0sW1wiIzE2OTNhNVwiLFwiIzQ1YjVjNFwiLFwiIzdlY2VjYVwiLFwiI2EwZGVkNlwiLFwiI2M3ZWRlOFwiXSxbXCIjZmRmZmQ5XCIsXCIjNzMxODVlXCIsXCIjMzZiYmE2XCIsXCIjMGMwZDAyXCIsXCIjOGI5MTFhXCJdLFtcIiNhNjlhOTBcIixcIiM0YTQwM2RcIixcIiNmZmYxYzFcIixcIiNmYWNmN2RcIixcIiNlYTgwNGNcIl0sW1wiI2Y3ZjNkNVwiLFwiI2ZmZGFiZlwiLFwiI2ZhOWI5YlwiLFwiI2U4ODA4N1wiLFwiIzYzNTA2M1wiXSxbXCIjOGE4NzgwXCIsXCIjZTZlNWM0XCIsXCIjZDZkMWFmXCIsXCIjZTQ3MjY3XCIsXCIjZDdkOGM1XCJdLFtcIiNhN2NkMmNcIixcIiNiYWRhNWZcIixcIiNjZWU4OTFcIixcIiNlMWY1YzRcIixcIiM1MGM4YzZcIl0sW1wiI2IyY2JhM1wiLFwiI2UwZGY5ZlwiLFwiI2U3YTgzZVwiLFwiIzlhNzM2ZVwiLFwiI2VhNTI1ZlwiXSxbXCIjYWFkZWFkXCIsXCIjYmJkZWFkXCIsXCIjY2NkZWFkXCIsXCIjZGRkZWFkXCIsXCIjZWVkZWFkXCJdLFtcIiNmYzU4MGNcIixcIiNmYzZiMGFcIixcIiNmODg3MmVcIixcIiNmZmE5MjdcIixcIiNmZGNhNDlcIl0sW1wiI2ZhMmU1OVwiLFwiI2ZmNzAzZlwiLFwiI2Y3YmMwNVwiLFwiI2VjZjZiYlwiLFwiIzc2YmNhZFwiXSxbXCIjNzg1ZDU2XCIsXCIjYmU0YzU0XCIsXCIjYzZiMjk5XCIsXCIjZTZkNWMxXCIsXCIjZmZmNGUzXCJdLFtcIiNmMDM3MWFcIixcIiMwMDAwMDBcIixcIiNmN2U2YTZcIixcIiMzZTZiNDhcIixcIiNiNWI0NzlcIl0sW1wiI2NjMjY0OVwiLFwiIzk5MmM0YlwiLFwiIzY2MzI0Y1wiLFwiIzMzMzg0ZVwiLFwiIzAwM2U0ZlwiXSxbXCIjZmZhYmFiXCIsXCIjZmZkYWFiXCIsXCIjZGRmZmFiXCIsXCIjYWJlNGZmXCIsXCIjZDlhYmZmXCJdLFtcIiNmMWU4YjRcIixcIiNiMmJiOTFcIixcIiNkN2JmNWVcIixcIiNkMTYzNDRcIixcIiM4MzU1NWVcIl0sW1wiIzQyMzkzYlwiLFwiIzc1YzlhM1wiLFwiI2JhYzk5YVwiLFwiI2ZmYzg5N1wiLFwiI2Y3ZWZhMlwiXSxbXCIjYTczMjFjXCIsXCIjZmZkYzY4XCIsXCIjY2M5ODJhXCIsXCIjOTI4OTQxXCIsXCIjMzUyNTA0XCJdLFtcIiNlMGRjOGJcIixcIiNmNmFhM2RcIixcIiNlZDRjNTdcIixcIiM1NzQ0MzVcIixcIiM2Y2M0YjlcIl0sW1wiIzAwMDAwMFwiLFwiIzAwMWYzNlwiLFwiIzFjNTU2MFwiLFwiIzc5YWU5MlwiLFwiI2ZiZmZjZFwiXSxbXCIjZjZjN2I3XCIsXCIjZjdhMzk4XCIsXCIjZmE3Zjc3XCIsXCIjYjQyNTI5XCIsXCIjMDAwMDAwXCJdLFtcIiNjOWQxZDNcIixcIiNmN2Y3ZjdcIixcIiM5ZGQzZGZcIixcIiMzYjM3MzdcIixcIiM5OTE4MThcIl0sW1wiI2FmYzdiOVwiLFwiI2ZmZTFjOVwiLFwiI2ZhYzdiNFwiLFwiI2ZjYTg5ZFwiLFwiIzk5OGI4MlwiXSxbXCIjZmJmZWU1XCIsXCIjYzkxODQyXCIsXCIjOTgxNzNkXCIsXCIjMjUyMzJkXCIsXCIjYThlN2NhXCJdLFtcIiNmM2U2YmNcIixcIiNmMWM5NzJcIixcIiNmNTg4NmJcIixcIiM3MmFlOTVcIixcIiM1YTMyMjZcIl0sW1wiI2ZhOGNiMVwiLFwiI2ZkYzVjOVwiLFwiI2ZmZmVlMVwiLFwiI2NmYjY5OVwiLFwiIzllNmQ0ZVwiXSxbXCIjNjc0ZjIzXCIsXCIjZTQ4YjY5XCIsXCIjZTFiMzY1XCIsXCIjZTVkYjg0XCIsXCIjZmZlZWFjXCJdLFtcIiNkYmQ5YjdcIixcIiNjMWM5YzhcIixcIiNhNWI1YWJcIixcIiM5NDlhOGVcIixcIiM2MTU1NjZcIl0sW1wiI2YyY2M2N1wiLFwiI2YzODI2NFwiLFwiI2Y0MDAzNFwiLFwiIzVmMDUxZlwiLFwiIzc1YmFhOFwiXSxbXCIjZDlkNGE4XCIsXCIjZDE1YzU3XCIsXCIjY2MzNzQ3XCIsXCIjNWMzNzRiXCIsXCIjNGE1ZjY3XCJdLFtcIiM4NGMxYjFcIixcIiNhZDg0OWFcIixcIiNkNjQ3ODNcIixcIiNmZDEzNWFcIixcIiM0MDIwMmFcIl0sW1wiIzcxZGJkMlwiLFwiI2VlZmZkYlwiLFwiI2FkZTRiNVwiLFwiI2QwZWFhM1wiLFwiI2ZmZjE4Y1wiXSxbXCIjYjg4MDAwXCIsXCIjZDU2ZjAwXCIsXCIjZjE1NTAwXCIsXCIjZmYyNjU0XCIsXCIjZmYwYzcxXCJdLFtcIiMwMjAzMDRcIixcIiM1NDFmMTRcIixcIiM5MzgxNzJcIixcIiNjYzllNjFcIixcIiM2MjYyNjZcIl0sW1wiI2Y0ZjRmNFwiLFwiIzliYTY1N1wiLFwiI2YwZTVjOVwiLFwiI2E2OGM2OVwiLFwiIzU5NDQzM1wiXSxbXCIjMjQ0MjQyXCIsXCIjNTFiZDljXCIsXCIjYTNlM2IxXCIsXCIjZmZlOGIzXCIsXCIjZmYyMTIxXCJdLFtcIiMxZjAzMTBcIixcIiM0NDI0MzNcIixcIiNhM2Q5NWJcIixcIiNhYWUzYWJcIixcIiNmNmYwYmNcIl0sW1wiIzAwY2NiZVwiLFwiIzA5YTZhM1wiLFwiIzlkYmZhZlwiLFwiI2VkZWJjOVwiLFwiI2ZjZjlkOFwiXSxbXCIjNGViM2RlXCIsXCIjOGRlMGE2XCIsXCIjZmNmMDlmXCIsXCIjZjI3YzdjXCIsXCIjZGU1MjhjXCJdLFtcIiNmZjAwOTJcIixcIiNmZmNhMWJcIixcIiNiNmZmMDBcIixcIiMyMjhkZmZcIixcIiNiYTAxZmZcIl0sW1wiI2ZmYzg3MFwiLFwiI2Y3ZjdjNlwiLFwiI2M4ZTNjNVwiLFwiIzljYWQ5YVwiLFwiIzc1NTg1OFwiXSxbXCIjNGMzZDMxXCIsXCIjZjE4MjczXCIsXCIjZjJiZDc2XCIsXCIjZjRmNWRlXCIsXCIjYzRjZWIwXCJdLFtcIiM4NGJmYzNcIixcIiNmZmY1ZDZcIixcIiNmZmI4NzBcIixcIiNkOTYxNTNcIixcIiMwMDA1MTFcIl0sW1wiI2ZmZmRjMFwiLFwiI2I5ZDdhMVwiLFwiI2ZlYWQyNlwiLFwiI2NhMjIxZlwiLFwiIzU5MGYwY1wiXSxbXCIjMjQxODExXCIsXCIjZDRhOTc5XCIsXCIjZTNjODhmXCIsXCIjYzJjOTk1XCIsXCIjYThiZDk1XCJdLFtcIiMyMTk3YTNcIixcIiNmNzFlNmNcIixcIiNmMDc4NjhcIixcIiNlYmI5NzBcIixcIiNlN2QzYjBcIl0sW1wiI2IyYjM5ZlwiLFwiI2M4YzliNVwiLFwiI2RlZGZjNVwiLFwiI2Y1ZjdiZFwiLFwiIzNkNDIzY1wiXSxbXCIjYjMxMjM3XCIsXCIjZjAzODEzXCIsXCIjZmY4ODI2XCIsXCIjZmZiOTE0XCIsXCIjMmM5ZmEzXCJdLFtcIiMxNTIxMmFcIixcIiM5OWM5YmRcIixcIiNkN2I4OWNcIixcIiNmZWFiOGRcIixcIiNmNGM5YTNcIl0sW1wiIzAwMmMyYlwiLFwiI2ZmM2QwMFwiLFwiI2ZmYmMxMVwiLFwiIzBhODM3ZlwiLFwiIzA3NjQ2MVwiXSxbXCIjZjg4Zjg5XCIsXCIjZWVjMjc2XCIsXCIjZmJmNmQwXCIsXCIjNzljM2FhXCIsXCIjMWYwZTFhXCJdLFtcIiNiZjJhMjNcIixcIiNhNmFkM2NcIixcIiNmMGNlNGVcIixcIiNjZjg3MmVcIixcIiM4YTIxMWRcIl0sW1wiI2UyZGY5YVwiLFwiI2ViZTU0ZFwiLFwiIzc1NzQ0OVwiLFwiIzRiNDkwYlwiLFwiI2ZmMDA1MVwiXSxbXCIjMDAxODQ4XCIsXCIjMzAxODYwXCIsXCIjNDgzMDc4XCIsXCIjNjA0ODc4XCIsXCIjOTA2MDkwXCJdLFtcIiM4NWEyOWVcIixcIiNmZmViYmZcIixcIiNmMGQ0NDJcIixcIiNmNTkzMzBcIixcIiNiMjIxNDhcIl0sW1wiIzc5YTY4N1wiLFwiIzcxODA2M1wiLFwiIzY3NTk0ZFwiLFwiIzRmMmIzOFwiLFwiIzFkMTAxNlwiXSxbXCIjZmU2YzJiXCIsXCIjZDQzYjJkXCIsXCIjOWYxMDJjXCIsXCIjMzQwMDE2XCIsXCIjMDIwMDAxXCJdLFtcIiNlNmUxY2RcIixcIiNjNmQ4YzBcIixcIiNkNmIzYjFcIixcIiNmOTc5OTJcIixcIiMyMzFiNDJcIl0sW1wiIzY5ZDBiM1wiLFwiIzliZGFiM1wiLFwiI2I0ZGZiM1wiLFwiI2NkZTRiM1wiLFwiI2Q5Y2Y4NVwiXSxbXCIjNzUzNzJkXCIsXCIjOTI4ODU0XCIsXCIjOTZhNzgyXCIsXCIjZDRjZTllXCIsXCIjZDg1MjNkXCJdLFtcIiM2NTEzNjZcIixcIiNhNzFhNWJcIixcIiNlNzIwNGVcIixcIiNmNzZlMmFcIixcIiNmMGM1MDVcIl0sW1wiI2ZmZmZmZlwiLFwiI2ExYzFiZVwiLFwiIzU5NTU0ZVwiLFwiI2YzZjRlNVwiLFwiI2UyZTNkOVwiXSxbXCIjMzMyYzI2XCIsXCIjZGIxNDE0XCIsXCIjZTg1OTFjXCIsXCIjN2ZiOGIwXCIsXCIjYzVlNjVjXCJdLFtcIiMyZjJiYWRcIixcIiNhZDJiYWRcIixcIiNlNDI2OTJcIixcIiNmNzE1NjhcIixcIiNmN2RiMTVcIl0sW1wiIzhlNDA3YVwiLFwiI2ZlNjk2MlwiLFwiI2Y5YmE4NFwiLFwiI2VlZTA5N1wiLFwiI2ZmZmZlNVwiXSxbXCIjNDVhYWI4XCIsXCIjZTFkNzcyXCIsXCIjZmFmNGIxXCIsXCIjMzk0MjQwXCIsXCIjZjA2YjUwXCJdLFtcIiNjY2RlZDJcIixcIiNmZmZiZDRcIixcIiNmNWRkYmJcIixcIiNlM2I4YjJcIixcIiNhMTgwOTNcIl0sW1wiI2QxYjY4ZFwiLFwiIzg3NTU1Y1wiLFwiIzQ5MmQ0OVwiLFwiIzUxNDQ1ZlwiLFwiIzVhNWM3NVwiXSxbXCIjNTM5ZmEyXCIsXCIjNzJiMWE0XCIsXCIjYWJjY2IxXCIsXCIjYzRkYmI0XCIsXCIjZDRlMmI2XCJdLFtcIiM4MGQzYmJcIixcIiNiYWZkYzJcIixcIiNlNWYzYmFcIixcIiM1YzQ5M2RcIixcIiMzYTM1MmZcIl0sW1wiI2E4YmNiZFwiLFwiI2ZjZGNiM1wiLFwiI2Y4OGQ4N1wiLFwiI2Q2NTk4MVwiLFwiIzgyMzc3MlwiXSxbXCIjZmZlNGFhXCIsXCIjZmNhNjk5XCIsXCIjZTI4NjliXCIsXCIjYzk3MjlmXCIsXCIjNTgzYjdlXCJdLFtcIiNiNWY0YmNcIixcIiNmZmYxOWVcIixcIiNmZmRjOGFcIixcIiNmZmJhNmJcIixcIiNmZjY1NDNcIl0sW1wiI2ZmNDc0NlwiLFwiI2U4ZGE1ZVwiLFwiIzkyYjU1ZlwiLFwiIzQ4N2Q3NlwiLFwiIzRiNDQ1MlwiXSxbXCIjMDAyZTM0XCIsXCIjMDA0NDQzXCIsXCIjMDA3NTVjXCIsXCIjMDBjMTZjXCIsXCIjOTBmZjE3XCJdLFtcIiMxMDE5NDJcIixcIiM4MDA0M2FcIixcIiNmNjBjNDlcIixcIiNmMDk1ODBcIixcIiNmZGYyYjRcIl0sW1wiIzBmYzNlOFwiLFwiIzAxOTRiZVwiLFwiI2UyZDM5N1wiLFwiI2YwN2UxM1wiLFwiIzQ4MTgwMFwiXSxbXCIjYzliODQ5XCIsXCIjYzk2ODIzXCIsXCIjYmUzMTAwXCIsXCIjNmYwYjAwXCIsXCIjMjQxNzE0XCJdLFtcIiM5ZTFlNGNcIixcIiNmZjExNjhcIixcIiMyNTAyMGZcIixcIiM4ZjhmOGZcIixcIiNlY2VjZWNcIl0sW1wiIzI3MmQ0ZFwiLFwiI2I4MzU2NFwiLFwiI2ZmNmE1YVwiLFwiI2ZmYjM1MFwiLFwiIzgzYjhhYVwiXSxbXCIjYzRkZGQ2XCIsXCIjZDRkZGQ2XCIsXCIjZTRkZGQ2XCIsXCIjZTRlM2NkXCIsXCIjZWNlY2RkXCJdLFtcIiM0ZDRhNGJcIixcIiNmNjAwNjlcIixcIiNmZjQxYTFcIixcIiNmZjkwYWJcIixcIiNmZmNjZDFcIl0sW1wiIzFmMGExZFwiLFwiIzMzNGY1M1wiLFwiIzQ1OTM2Y1wiLFwiIzlhY2M3N1wiLFwiI2U1ZWFkNFwiXSxbXCIjODk5YWExXCIsXCIjYmRhMmEyXCIsXCIjZmJiZTlhXCIsXCIjZmFkODg5XCIsXCIjZmFmNWM4XCJdLFtcIiM0YjUzOGJcIixcIiMxNTE5MWRcIixcIiNmN2EyMWJcIixcIiNlNDU2MzVcIixcIiNkNjAyNTdcIl0sW1wiIzcwNjc2N1wiLFwiI2U4NzQ3NFwiLFwiI2U2YTM3YVwiLFwiI2Q5Yzc3N1wiLFwiI2MwZGJhYlwiXSxbXCIjMDAwMDAwXCIsXCIjZmY4ODMwXCIsXCIjZDFiOGEwXCIsXCIjYWVjZWQyXCIsXCIjY2JkY2RmXCJdLFtcIiNkYjU2NDNcIixcIiMxYzBmMGVcIixcIiM3MGFhODdcIixcIiM5ZmIzOGZcIixcIiNjNWJkOTlcIl0sW1wiIzM2MTczZFwiLFwiI2ZmNDg0NVwiLFwiI2ZmNzQ1ZlwiLFwiI2ZmYzU1ZlwiLFwiI2ZmZWM1ZVwiXSxbXCIjMDAwNzA2XCIsXCIjMDAyNzJkXCIsXCIjMTM0NjQ3XCIsXCIjMGM3ZTdlXCIsXCIjYmZhYzhiXCJdLFtcIiMxNzAxMzJcIixcIiMzNjE1NDJcIixcIiM1NzNlNTRcIixcIiM4NWFlNzJcIixcIiNiY2UxYWJcIl0sW1wiI2FhYjY5YlwiLFwiIzllOTA2ZVwiLFwiIzk2ODRhM1wiLFwiIzg4NzBmZlwiLFwiIzAwMDAwMFwiXSxbXCIjZDhkOGQ4XCIsXCIjZTJkOWQ4XCIsXCIjZWNkYWQ4XCIsXCIjZjVkYmQ4XCIsXCIjZmZkY2Q4XCJdLFtcIiNjOGQxOTdcIixcIiNkODk4NDVcIixcIiNjNTRiMmNcIixcIiM0NzM0MzBcIixcIiMxMWJhYWNcIl0sW1wiI2Y4ZjhlY1wiLFwiI2FlZGQyYlwiLFwiIzA2NjY5OVwiLFwiIzBhNTQ4M1wiLFwiIzAyNDE2ZFwiXSxbXCIjZDdlOGQ1XCIsXCIjZTZmMGFmXCIsXCIjZThlZDc2XCIsXCIjZmZjZDU3XCIsXCIjNGEzYTQ3XCJdLFtcIiNmMWVjZGZcIixcIiNkNGM5YWRcIixcIiNjN2JhOTlcIixcIiMwMDAwMDBcIixcIiNmNTg3MjNcIl0sW1wiI2U5ZGZjY1wiLFwiI2YzYTM2YlwiLFwiI2NkNWI1MVwiLFwiIzU1NDg2NVwiLFwiIzM1MjYzMFwiXSxbXCIjZGFjZGJkXCIsXCIjZjJiOGEwXCIsXCIjZWY5N2EzXCIsXCIjZGY1YzdlXCIsXCIjZDQ0ODZmXCJdLFtcIiM1NjUxNzVcIixcIiM1MzhhOTVcIixcIiM2N2I3OWVcIixcIiNmZmI3MjdcIixcIiNlNDQ5MWNcIl0sW1wiIzI2MDcyOVwiLFwiIzJhMjM0NFwiLFwiIzQ5NTE2OFwiLFwiI2NjYmQ5ZVwiLFwiI2Q4Y2NiMlwiXSxbXCIjYWVmMDU1XCIsXCIjZTBmZmMzXCIsXCIjMjVlNGJjXCIsXCIjM2Y4OTc4XCIsXCIjNTE0NDQyXCJdLFtcIiM0NDQ0NDRcIixcIiNmY2Y3ZDFcIixcIiNhOWExN2FcIixcIiNiNTJjMDBcIixcIiM4YzAwMDVcIl0sW1wiI2Y3Zjc5OVwiLFwiI2UwZDEyNFwiLFwiI2YwODIzZlwiLFwiI2JkMzc0Y1wiLFwiIzQ0M2EzN1wiXSxbXCIjMjg4ZDg1XCIsXCIjYjlkOWI0XCIsXCIjZDE4ZThmXCIsXCIjYjA1NTc0XCIsXCIjZjBhOTkxXCJdLFtcIiNkYmRhOTdcIixcIiNlZmFlNTRcIixcIiNlZjY3NzFcIixcIiM0YjFkMzdcIixcIiM5NzdlNzdcIl0sW1wiIzAwMjkzMFwiLFwiI2ZmZmZmZlwiLFwiI2Y4ZjBhZlwiLFwiI2FjNGEwMFwiLFwiIzAwMDAwMFwiXSxbXCIjMTg0ODQ4XCIsXCIjMDA2MDYwXCIsXCIjMDA3ODc4XCIsXCIjYThjMDMwXCIsXCIjZjBmMGQ4XCJdLFtcIiNiOTExM2ZcIixcIiNhODYzNmVcIixcIiM5N2I1OWRcIixcIiNjZmNjYThcIixcIiNmZmUzYjNcIl0sW1wiI2M4Y2UxM1wiLFwiI2Y4ZjVjMVwiLFwiIzM0OWU5N1wiLFwiIzJjMGQxYVwiLFwiI2RlMWE3MlwiXSxbXCIjOTEzZjMzXCIsXCIjZmY3MDVmXCIsXCIjZmZhYTY3XCIsXCIjZmZkZmFiXCIsXCIjOWZiOWMyXCJdLFtcIiNmZWU5YTZcIixcIiNmZWMwYWJcIixcIiNmYTU4OTRcIixcIiM2NjA4NjBcIixcIiM5MzgwYjdcIl0sW1wiI2VkN2I4M1wiLFwiI2VjOGE5MFwiLFwiI2ViYTJhNFwiLFwiI2U2ZDFjYVwiLFwiI2VlZTljN1wiXSxbXCIjZmNmZGViXCIsXCIjZTNjZWJkXCIsXCIjYzFhMmEwXCIsXCIjNzI1Yjc1XCIsXCIjMzIyMDMwXCJdLFtcIiNlMDQ4OTFcIixcIiNlMWI3ZWRcIixcIiNmNWUxZTJcIixcIiNkMWUzODlcIixcIiNiOWRlNTFcIl0sW1wiI2QzYzhiNFwiLFwiI2Q0ZjFkYlwiLFwiI2VlY2FiMVwiLFwiI2ZlNmM2M1wiLFwiIzI0MDkxMFwiXSxbXCIjNDM3NzdhXCIsXCIjNDQyNDMyXCIsXCIjYzAyOTQ4XCIsXCIjZDk1YjQ1XCIsXCIjZWNkMDc5XCJdLFtcIiNlZGVjY2ZcIixcIiNmMWM2OTRcIixcIiNkYzYzNzhcIixcIiMyMDcxNzhcIixcIiMxMDE2NTJcIl0sW1wiIzk1ZGU5MFwiLFwiI2NlZjc4MVwiLFwiI2Y3YzA4MVwiLFwiI2ZmNzg1N1wiLFwiIzZiNmI2YlwiXSxbXCIjZWRkNThmXCIsXCIjYzJiZjkyXCIsXCIjNjZhYzkyXCIsXCIjNjg2MDc3XCIsXCIjNjQxZjVlXCJdLFtcIiNmNGY4ZTZcIixcIiNmMmU5ZTZcIixcIiM0YTNkM2RcIixcIiNmZjYxNjFcIixcIiNkOGRlYzNcIl0sW1wiI2Y5ZWJmMlwiLFwiI2YzZTJlOFwiLFwiI2ZjZDdkYVwiLFwiI2Y1OGY5YVwiLFwiIzNjMzYzYlwiXSxbXCIjNzM2NTU4XCIsXCIjZmQ2NWEwXCIsXCIjZmVmNWM2XCIsXCIjYWFmMmU0XCIsXCIjMzFkNWRlXCJdLFtcIiNmOWY2ZWNcIixcIiM4OGExYThcIixcIiM1MDI5NDBcIixcIiM3OTA2MTRcIixcIiMwZDBjMGNcIl0sW1wiI2FmZmJmZlwiLFwiI2QyZmRmZVwiLFwiI2ZlZmFjMlwiLFwiI2ZlYmY5N1wiLFwiI2ZlNjk2MFwiXSxbXCIjZmZmZmZmXCIsXCIjYTFhYzg4XCIsXCIjNzU3NTc1XCIsXCIjNDY0ZDcwXCIsXCIjMDAwMDAwXCJdLFtcIiNmMjUwMmNcIixcIiNjYWQxN2FcIixcIiNmY2Y1OWJcIixcIiM5MWM0OTRcIixcIiNjNDIzMTFcIl0sW1wiIzJlMWU0NVwiLFwiIzYxMmE1MlwiLFwiI2JhMzI1OVwiLFwiI2ZmNjk1Y1wiLFwiI2NjYmNhMVwiXSxbXCIjOTEwMTQyXCIsXCIjNmMwNDNjXCIsXCIjMjEwMTIzXCIsXCIjZmVmN2Q1XCIsXCIjMGVjMGMxXCJdLFtcIiMyMDRiNWVcIixcIiM0MjZiNjVcIixcIiNiYWFiNmFcIixcIiNmYmVhODBcIixcIiNmZGZhYzdcIl0sW1wiIzhkYzliNVwiLFwiI2Y2ZjRjMlwiLFwiI2ZmYzM5MVwiLFwiI2ZmNjk1Y1wiLFwiIzhjMzE1ZFwiXSxbXCIjZTNiYTZhXCIsXCIjYmZhMzc0XCIsXCIjNmQ3NTZhXCIsXCIjNGQ2ODZmXCIsXCIjMzY0NDYxXCJdLFtcIiNmZmZhYjNcIixcIiNhMmU1ZDJcIixcIiM2M2IzOTdcIixcIiM5ZGFiMzRcIixcIiMyYzIzMjFcIl0sW1wiI2Y3ZjFlMVwiLFwiI2ZmZGJkN1wiLFwiI2ZmYjJjMVwiLFwiI2NlNzA5NVwiLFwiIzg1NWU2ZVwiXSxbXCIjZjdkZWNlXCIsXCIjZWVkN2M1XCIsXCIjY2NjY2JiXCIsXCIjOWVjNGJiXCIsXCIjMmQyZTJjXCJdLFtcIiM0MTgwYWJcIixcIiNmZmZmZmZcIixcIiM4YWIzY2ZcIixcIiNiZGQxZGVcIixcIiNlNGViZjBcIl0sW1wiIzQzMjA0YVwiLFwiIzdmMWU0N1wiLFwiIzQyMjM0M1wiLFwiI2MyMjA0N1wiLFwiI2VhMjg0YlwiXSxbXCIjNjg2NDY2XCIsXCIjODM5Y2I1XCIsXCIjOTZkN2ViXCIsXCIjYjFlMWU5XCIsXCIjZjJlNGY5XCJdLFtcIiNmZjI3NWVcIixcIiNlNmJjNTZcIixcIiM3ZjQ0MGFcIixcIiM2YTkyNzdcIixcIiNmOGQ5YmRcIl0sW1wiIzUwMjMyZVwiLFwiI2Y3N2MzZVwiLFwiI2ZhYmE2NlwiLFwiI2ZjZTE4NVwiLFwiI2EyY2NhNVwiXSxbXCIjYjJkOWY3XCIsXCIjNDg3YWExXCIsXCIjM2QzYzNiXCIsXCIjN2M4MDcxXCIsXCIjZGRlM2NhXCJdLFtcIiM5Yzg2ODBcIixcIiNlYjVlN2ZcIixcIiNmOThmNmZcIixcIiNkYmJmNmJcIixcIiNjOGViNmFcIl0sW1wiIzQ4MmMyMVwiLFwiI2E3M2UyYlwiLFwiI2QwN2UwZVwiLFwiI2U5ZGViMFwiLFwiIzJmNjE1ZVwiXSxbXCIjZTRlNmMzXCIsXCIjODhiYWEzXCIsXCIjYmExZTRhXCIsXCIjNjMyMDNkXCIsXCIjMzYxZjJkXCJdLFtcIiNmN2Y2ZTRcIixcIiNlMmQ1YzFcIixcIiM1ZjM3MTFcIixcIiNmNmY2ZTJcIixcIiNkNGMwOThcIl0sW1wiI2ZmYWIwM1wiLFwiI2ZjN2YwM1wiLFwiI2ZjMzkwM1wiLFwiI2QxMDI0ZVwiLFwiI2E2MDI2Y1wiXSxbXCIjYzcyNTQ2XCIsXCIjNjY0MjRjXCIsXCIjNzY4YTRmXCIsXCIjYjNjMjYyXCIsXCIjZDVjYTk4XCJdLFtcIiNjM2RmZDdcIixcIiNjOGRmZDJcIixcIiNjZGRmY2RcIixcIiNkMmRmYzhcIixcIiNkN2RmYzNcIl0sW1wiIzBkYjJhY1wiLFwiI2Y1ZGQ3ZVwiLFwiI2ZjOGQ0ZFwiLFwiI2ZjNjk0ZFwiLFwiI2ZhYmEzMlwiXSxbXCIjZThkZTkyXCIsXCIjODEwZTBiXCIsXCIjZmViZWEzXCIsXCIjZmNlNWIxXCIsXCIjZjZmNWRhXCJdLFtcIiM2MzU5NGRcIixcIiNiMTgyNzJcIixcIiNjMmIyOTFcIixcIiNkNmU0YzNcIixcIiNlYWUzZDFcIl0sW1wiI2RhZTJjYlwiLFwiIzk2YzNhNlwiLFwiIzZjYjZhNVwiLFwiIzIyMWQzNFwiLFwiIzkwNDI1Y1wiXSxbXCIjOTE3ZjZlXCIsXCIjZWZiYzk4XCIsXCIjZWZkMmJlXCIsXCIjZWZlMWQxXCIsXCIjZDlkZGNkXCJdLFtcIiMzZjMyNGRcIixcIiM5M2MyYjFcIixcIiNmZmVhY2NcIixcIiNmZjk5NWVcIixcIiNkZTFkNmFcIl0sW1wiI2YzZDkxNVwiLFwiI2U5ZTRiYlwiLFwiI2JmZDRiN1wiLFwiI2E4OTkwN1wiLFwiIzFhMWMyN1wiXSxbXCIjMDQyNjA4XCIsXCIjMmE1YzBiXCIsXCIjODA4ZjEyXCIsXCIjZmFlZGQ5XCIsXCIjZWEyYTE1XCJdLFtcIiNkYWRhZDhcIixcIiNmZTYxOTZcIixcIiNmZjJjNjlcIixcIiMxZWE0OWRcIixcIiNjYmU2NWJcIl0sW1wiIzQ1NDU0NVwiLFwiIzc0MzQ1NVwiLFwiI2EyMjM2NVwiLFwiI2QxMTE3NFwiLFwiI2ZmMDA4NFwiXSxbXCIjOGMwZTQ4XCIsXCIjODBhYjk5XCIsXCIjZThkYmFkXCIsXCIjYjM5ZTU4XCIsXCIjOTk4MjJkXCJdLFtcIiM3OTZjODZcIixcIiM3NGFhOWJcIixcIiM5MWM2OGRcIixcIiNlY2U0ODhcIixcIiNmNmY1Y2RcIl0sW1wiIzY3OGQ2Y1wiLFwiI2ZjN2QyM1wiLFwiI2ZhM2MwOFwiLFwiI2JkMGE0MVwiLFwiIzc3MmE1M1wiXSxbXCIjZGJmNzNiXCIsXCIjYzBjYzM5XCIsXCIjZWIwMjU4XCIsXCIjYTYwMzNmXCIsXCIjMmIyNjI4XCJdLFtcIiNmZmMyY2VcIixcIiM4MGIzZmZcIixcIiNmZDZlOGFcIixcIiNhMjEyMmZcIixcIiM2OTM3MjZcIl0sW1wiI2FiNTA1ZVwiLFwiI2Q5YTA3MVwiLFwiI2NmYzg4ZlwiLFwiI2E1YjA5MFwiLFwiIzYwNzg3M1wiXSxbXCIjZjlkNDIzXCIsXCIjZWRlNTc0XCIsXCIjZTFmNWM0XCIsXCIjYWRkNmJjXCIsXCIjNzliN2I0XCJdLFtcIiMxNzJjM2NcIixcIiMyNzQ4NjJcIixcIiM5OTUwNTJcIixcIiNkOTY4MzFcIixcIiNlNmIzM2RcIl0sW1wiI2Y4ZjY5ZlwiLFwiI2JhYjk4NlwiLFwiIzdjN2I2Y1wiLFwiIzNlM2U1M1wiLFwiIzAwMDAzOVwiXSxbXCIjZjFlYmViXCIsXCIjZWVlOGU4XCIsXCIjY2FjYWNhXCIsXCIjMjRjMGViXCIsXCIjNWNjZWVlXCJdLFtcIiNlNmU4ZTNcIixcIiNkN2RhY2ZcIixcIiNiZWMzYmNcIixcIiM4ZjlhOWNcIixcIiM2NTcyN2FcIl0sW1wiI2ZmZmJmMFwiLFwiIzk2OGY0YlwiLFwiIzdhNjI0OFwiLFwiI2FiOTU5N1wiLFwiIzAzMDUwNlwiXSxbXCIjZWZhYzQxXCIsXCIjZGU4NTMxXCIsXCIjYjMyOTAwXCIsXCIjNmMxMzA1XCIsXCIjMzMwYTA0XCJdLFtcIiM3MmJjYTVcIixcIiNmNGRkYjRcIixcIiNmMWFlMmJcIixcIiNiYzBiMjdcIixcIiM0YTI1MTJcIl0sW1wiI2ViZjJmMlwiLFwiI2QwZjJlN1wiLFwiI2JjZWJkZlwiLFwiI2FkZTBkYlwiLFwiI2Q5ZGJkYlwiXSxbXCIjZjRlMTk2XCIsXCIjYTZiZjkxXCIsXCIjNWY5OTgyXCIsXCIjNzg1NzZiXCIsXCIjNDAwNDI4XCJdLFtcIiM2MTUwNTBcIixcIiM3NzZhNmFcIixcIiNhZDlhNmZcIixcIiNmNWYxZThcIixcIiNmY2ZjZmNcIl0sW1wiI2I5MzQwYlwiLFwiI2NlYTQ1Y1wiLFwiI2M1YmU4YlwiLFwiIzQ5ODM3OVwiLFwiIzNmMjYxY1wiXSxbXCIjZGRjYWEyXCIsXCIjYWViZWEzXCIsXCIjYjk3NDc5XCIsXCIjZDgzOTU3XCIsXCIjNGU1YzY5XCJdLFtcIiMxNDE4MjdcIixcIiM2MjQ1NWJcIixcIiM3MzY2ODFcIixcIiNjMWQ5ZDBcIixcIiNmZmZhZTNcIl0sW1wiIzJmMzU1OVwiLFwiIzlhNTA3MVwiLFwiI2UzOTRhN1wiLFwiI2YxYmJiYlwiLFwiI2U2ZDhjYlwiXSxbXCIjYjg3N2E4XCIsXCIjYjgwMDhhXCIsXCIjZmYzMzY2XCIsXCIjZmZjYzMzXCIsXCIjY2NmZjMzXCJdLFtcIiMxNzExMzNcIixcIiM1ODFlNDRcIixcIiNjNTQ4NWFcIixcIiNkNGJlOTlcIixcIiNlMGZmY2NcIl0sW1wiI2ZmMGYzNVwiLFwiI2Y4NjI1NFwiLFwiI2ZlYTE4OVwiLFwiI2YzZDVhNVwiLFwiI2JhYjk5N1wiXSxbXCIjY2ZiNjk4XCIsXCIjZmY1ZDU3XCIsXCIjZGQwYjY0XCIsXCIjNmYwNTUwXCIsXCIjNDAxYzJhXCJdLFtcIiNkMWRiYzhcIixcIiNiOGMyYTBcIixcIiNjOTdjN2FcIixcIiNkYTM3NTRcIixcIiMxZjExMDZcIl0sW1wiIzJiOWViM1wiLFwiIzg1Y2M5Y1wiLFwiI2JjZDlhMFwiLFwiI2VkZjc5ZVwiLFwiI2ZhZmFkN1wiXSxbXCIjZjI2YjdhXCIsXCIjZjBmMmRjXCIsXCIjZDllYjUyXCIsXCIjOGFjN2RlXCIsXCIjODc3OTZmXCJdLFtcIiNiZGJmOTBcIixcIiMzNTM1MmJcIixcIiNlN2U5YzRcIixcIiNlYzZjMmJcIixcIiNmZWFlNGJcIl0sW1wiI2VlY2NiYlwiLFwiI2YxNzMxZlwiLFwiI2UwM2UzNlwiLFwiI2JkMGQ1OVwiLFwiIzczMDY2MlwiXSxbXCIjZWJlNWIyXCIsXCIjZjZmM2MyXCIsXCIjZjdjNjlmXCIsXCIjZjg5YjdlXCIsXCIjYjVhMjhiXCJdLFtcIiMyMDEzMGFcIixcIiMxNDIwMjZcIixcIiMxMjMxNDJcIixcIiMzYjY1N2FcIixcIiNlOWYwYzlcIl0sW1wiIzlkOWY4OVwiLFwiIzg0YWY5N1wiLFwiIzhiYzU5YlwiLFwiI2IyZGU5M1wiLFwiI2NjZWU4ZFwiXSxbXCIjZmY5OTM0XCIsXCIjZmZjMDE4XCIsXCIjZjhmZWY0XCIsXCIjY2RlNTRlXCIsXCIjYjNjNjMxXCJdLFtcIiNiZGEwYTJcIixcIiNmZmU2ZGJcIixcIiNkMWVhZWVcIixcIiNjYmM4YjVcIixcIiNlZmIwYTlcIl0sW1wiIzMxODI3Y1wiLFwiIzk1YzY4ZlwiLFwiI2Y3ZTlhYVwiLFwiI2ZjOGE4MFwiLFwiI2ZkNGU2ZFwiXSxbXCIjNGQ0MzNkXCIsXCIjNTI1YzVhXCIsXCIjNTY4NzdkXCIsXCIjOGNjYzgxXCIsXCIjYmFkZTU3XCJdLFtcIiM2YTNkNWFcIixcIiM2NjY2NmVcIixcIiM2ZDhkNzZcIixcIiNiMGM2NWFcIixcIiNlYmY3NGZcIl0sW1wiIzM1MzQzN1wiLFwiIzUzNTc2YlwiLFwiIzdhN2I3Y1wiLFwiI2EzOWI3ZVwiLFwiI2UyYzk5ZlwiXSxbXCIjZmY5OTY2XCIsXCIjZDk5OTczXCIsXCIjYjM5OTgwXCIsXCIjOGM5OThjXCIsXCIjNjY5OTk5XCJdLFtcIiNkMWRhYjlcIixcIiM5MmJlYTVcIixcIiM2ZjY0NmNcIixcIiM2NzEwNDVcIixcIiMzMTIzM2VcIl0sW1wiIzgzOTA3NFwiLFwiIzkzOWU3OFwiLFwiI2E4YTg3OFwiLFwiIzA2MTAxM1wiLFwiI2NkY2Q3NlwiXSxbXCIjNTI0MjNjXCIsXCIjYWQ1YzcwXCIsXCIjZDNhZDk4XCIsXCIjZWRkNGJlXCIsXCIjYjljM2M0XCJdLFtcIiNmZmNmYWRcIixcIiNmZmU0YjhcIixcIiNlNmQxYjFcIixcIiNiOGFhOTVcIixcIiM1ZTVhNTRcIl0sW1wiI2ViOWQ4ZFwiLFwiIzkzODY1YVwiLFwiI2E4YmI5YVwiLFwiI2M1Y2JhNlwiLFwiI2VmZDhhOVwiXSxbXCIjYThjMDc4XCIsXCIjYTg5MDQ4XCIsXCIjYTg0ODE4XCIsXCIjNjEyOTBlXCIsXCIjMzMwYzBjXCJdLFtcIiMyNzA4MWRcIixcIiM0NzIzMmNcIixcIiM2Njk5N2JcIixcIiNhNGNhOGJcIixcIiNkMmU3YWFcIl0sW1wiI2ZmZTdiZlwiLFwiI2ZmYzk3OFwiLFwiI2M5Yzk4N1wiLFwiI2QxYTY2NFwiLFwiI2MyN2I1N1wiXSxbXCIjMDAwMDAwXCIsXCIjZWQwYjY1XCIsXCIjYjJhNzAwXCIsXCIjZmNhZTExXCIsXCIjNzcwNDkzXCJdLFtcIiMwMzFjMzBcIixcIiM1YTM1NDZcIixcIiNiNTQ4NWZcIixcIiNmYzY3NDdcIixcIiNmYThkM2JcIl0sW1wiI2EyMmMyN1wiLFwiIzRmMjYyMVwiLFwiIzlmODI0MVwiLFwiI2ViZDU5MlwiLFwiIzkyOTg2N1wiXSxbXCIjOGZjOWI5XCIsXCIjZDhkOWMwXCIsXCIjZDE4ZThmXCIsXCIjYWI1YzcyXCIsXCIjOTEzMzRmXCJdLFtcIiMzMDI3MjdcIixcIiNiYTJkMmRcIixcIiNmMjUxMWJcIixcIiNmMjg2MWJcIixcIiNjN2M3MzBcIl0sW1wiI2Y5ZGVkM1wiLFwiI2ZkZDFiNlwiLFwiI2ZhYjRiNlwiLFwiI2M3YjZiZVwiLFwiIzg5YWJiNFwiXSxbXCIjNzM3NWE1XCIsXCIjMjFhM2EzXCIsXCIjMTNjOGI1XCIsXCIjNmNmM2Q1XCIsXCIjMmIzNjRhXCJdLFtcIiM4MjAwODFcIixcIiNmZTU5YzJcIixcIiNmZTQwYjlcIixcIiNmZTFjYWNcIixcIiMzOTAwMzlcIl0sW1wiIzI2MjUyNVwiLFwiIzUyNTI1MlwiLFwiI2U2ZGRiY1wiLFwiIzgyMjYyNlwiLFwiIzY5MDIwMlwiXSxbXCIjZjMyMTRlXCIsXCIjY2YwMjNiXCIsXCIjMDAwMDAwXCIsXCIjZjRhODU0XCIsXCIjZmZmOGJjXCJdLFtcIiM0ODIzNDRcIixcIiMyYjUxNjZcIixcIiM0Mjk4NjdcIixcIiNmYWIyNDNcIixcIiNlMDIxMzBcIl0sW1wiI2E5Yjc5ZVwiLFwiI2U4ZGRiZFwiLFwiI2RiYTg4N1wiLFwiI2MyNTg0OFwiLFwiIzlkMWQzNlwiXSxbXCIjNmU5MTY3XCIsXCIjZmZkZDhjXCIsXCIjZmY4MDMwXCIsXCIjY2M0ZTAwXCIsXCIjNzAwODA4XCJdLFtcIiNmZjMzNjZcIixcIiNlNjQwNjZcIixcIiNjYzRkNjZcIixcIiNiMzU5NjZcIixcIiM5OTY2NjZcIl0sW1wiIzMzMTQzNlwiLFwiIzdhMTc0NVwiLFwiI2NiNGY1N1wiLFwiI2ViOTk2MVwiLFwiI2ZjZjRiNlwiXSxbXCIjZWM0YjU5XCIsXCIjOWEyODQ4XCIsXCIjMTMwNzE2XCIsXCIjZmM4Yzc3XCIsXCIjZjhkZmJkXCJdLFtcIiMxZjBiMGNcIixcIiNlN2ZjY2ZcIixcIiNkNmMzOTZcIixcIiNiMzU0NGZcIixcIiMzMDA1MTFcIl0sW1wiI2YzZGNiMlwiLFwiI2ZhY2I5N1wiLFwiI2Y1OTk4MlwiLFwiI2VkNjE2ZlwiLFwiI2YyMTE2Y1wiXSxbXCIjZjdlYWQ5XCIsXCIjZTFkMmE5XCIsXCIjODhiNDk5XCIsXCIjNjE5ODg1XCIsXCIjNjc1OTRlXCJdLFtcIiNhZGVhZGFcIixcIiNiZGVhZGJcIixcIiNjZGVhZGNcIixcIiNkZGVhZGRcIixcIiNlZGVhZGVcIl0sW1wiIzY2NjY2NlwiLFwiI2FiZGIyNVwiLFwiIzk5OTk5OVwiLFwiI2ZmZmZmZlwiLFwiI2NjY2NjY1wiXSxbXCIjMjEwNTE4XCIsXCIjM2QxYzMzXCIsXCIjNWU0YjU1XCIsXCIjN2M5MTdmXCIsXCIjOTNiZDlhXCJdLFtcIiNmZGJmNWNcIixcIiNmNjlhMGJcIixcIiNkNDNhMDBcIixcIiM5YjA4MDBcIixcIiMxZDI0NDBcIl0sW1wiI2ZkZjRiMFwiLFwiI2E0ZGNiOVwiLFwiIzViY2ViZlwiLFwiIzMyYjliZVwiLFwiIzJlOTdiN1wiXSxbXCIjOGJhNmFjXCIsXCIjZDdkN2I4XCIsXCIjZTVlNmM5XCIsXCIjZjhmOGVjXCIsXCIjYmRjZGQwXCJdLFtcIiMyOTUyNjRcIixcIiNmYWQ5YTZcIixcIiNiZDJmMjhcIixcIiM4OTM3M2RcIixcIiMxNDI0MzNcIl0sW1wiI2VjZjhkNFwiLFwiI2UwZGVhYlwiLFwiI2NiOGU1ZlwiLFwiIzg1Njg1YVwiLFwiIzBkMDUwMlwiXSxbXCIjYTJjN2JiXCIsXCIjZGRlMjlmXCIsXCIjYWM4ZDQ5XCIsXCIjYWMwZDBkXCIsXCIjMzIwNjA2XCJdLFtcIiNmZjY2N2NcIixcIiNmYmJhYTRcIixcIiNmOWU1YzBcIixcIiMyYzE3MWNcIixcIiNiNmQwYTBcIl0sW1wiIzRiNGI1NVwiLFwiI2Y0MzI0YVwiLFwiI2ZmNTE2Y1wiLFwiI2ZiOWM1YVwiLFwiI2ZjYzc1NVwiXSxbXCIjZmZhZDA4XCIsXCIjZWRkNzVhXCIsXCIjNzNiMDZmXCIsXCIjMGM4ZjhmXCIsXCIjNDA1MDU5XCJdLFtcIiNhOGFiODRcIixcIiMwMDAwMDBcIixcIiNjNmM5OWRcIixcIiMwYzBkMDVcIixcIiNlN2ViYjBcIl0sW1wiIzMzMmUxZFwiLFwiIzVhYzdhYVwiLFwiIzlhZGNiOVwiLFwiI2ZhZmNkM1wiLFwiI2VmZWJhOVwiXSxbXCIjZDQ1ZTgwXCIsXCIjYzY4MzhjXCIsXCIjY2ZiZjllXCIsXCIjZjdkZWE4XCIsXCIjZjZiZTVmXCJdLFtcIiNmY2U3ZDJcIixcIiNlMGRiYmRcIixcIiNjMGNlYWFcIixcIiNmZDgwODZcIixcIiNlYjU4NzRcIl0sW1wiI2ZjZjNlM1wiLFwiI2VkNGM4N1wiLFwiIzYzNTI2ZVwiLFwiIzZjYmFhNFwiLFwiI2YyYWQ1ZVwiXSxbXCIjZDZkNTc4XCIsXCIjYjFiZjYzXCIsXCIjOWRhZDQyXCIsXCIjMjU4YTYwXCIsXCIjMGEzNzQwXCJdLFtcIiNkMWY3YmFcIixcIiNkYmRlYTZcIixcIiNkMWJkOTVcIixcIiM4YzY4NmJcIixcIiMzOTFiNGFcIl0sW1wiI2UxZTZlM1wiLFwiI2JmZDZjN1wiLFwiI2M3YmQ5M1wiLFwiI2ZmNzg3NlwiLFwiIzU3NGI0NVwiXSxbXCIjYWJlY2U0XCIsXCIjYzRkMDA0XCIsXCIjZmY5ZjE1XCIsXCIjZmI3OTkxXCIsXCIjOTI2ZDQwXCJdLFtcIiNmZmZmZmZcIixcIiNmZjk3Y2FcIixcIiNmZjM0OGVcIixcIiNiZTAwNDlcIixcIiM3NzAwMjFcIl0sW1wiI2ZiNmYyNFwiLFwiIzhjYTMxNVwiLFwiIzUxOTFjMVwiLFwiIzFlNjQ5NVwiLFwiIzBhNGI3NVwiXSxbXCIjZGZkMGFmXCIsXCIjZThhY2FjXCIsXCIjYTQ1Nzg1XCIsXCIjODU1ODZjXCIsXCIjYTFjMGExXCJdLFtcIiM0NzBkM2JcIixcIiM3ZTJmNTZcIixcIiNjMDU3NmZcIixcIiNlNDg2NzlcIixcIiNmZWJkODRcIl0sW1wiIzk0MDUzM1wiLFwiI2MwMDEyYVwiLFwiI2Y1MDYxZFwiLFwiI2ZmODgwMFwiLFwiI2ZmYjMwMFwiXSxbXCIjMGMwNjM2XCIsXCIjMDk1MTY5XCIsXCIjMDU5YjlhXCIsXCIjNTNiYTgzXCIsXCIjOWZkODZiXCJdLFtcIiNkZTRjNDVcIixcIiNkOTc2NGRcIixcIiNjYzllOGFcIixcIiNjMWM1YzdcIixcIiNlYmRmYzZcIl0sW1wiI2QyNGQ2Y1wiLFwiI2FkODQ4NFwiLFwiI2Q5ZDViYlwiLFwiI2MxODU4ZlwiLFwiI2IwNTU3NFwiXSxbXCIjYTY5ODhhXCIsXCIjODhhMTlmXCIsXCIjNmFhYmI1XCIsXCIjNGJiNGNhXCIsXCIjMWVjM2VhXCJdLFtcIiM3ZjEzNWZcIixcIiNhMDY2N2FcIixcIiNjMmI4OTVcIixcIiNjNGNhYjBcIixcIiNjN2RjY2FcIl0sW1wiI2Q5ZDlkYlwiLFwiI2I3YWU4ZlwiLFwiIzk3OGY4NFwiLFwiIzRhMzYyZlwiLFwiIzEyMTIxMFwiXSxbXCIjZTlkN2E5XCIsXCIjZDJkMDlmXCIsXCIjZDVhNTdmXCIsXCIjYjU2YTY1XCIsXCIjNGIzMTMyXCJdLFtcIiM5OWNjY2NcIixcIiNhOGJkYzJcIixcIiNiOGFlYjhcIixcIiNjNzllYWRcIixcIiNkNzhmYTNcIl0sW1wiIzA2MDIxMlwiLFwiI2ZlNTQxMlwiLFwiI2ZjMWExYVwiLFwiIzc5NWMwNlwiLFwiIzRmNTA0ZlwiXSxbXCIjYzNiNjhjXCIsXCIjNmU1YjU0XCIsXCIjYjk0ODY2XCIsXCIjYWZiN2EwXCIsXCIjZjRlZWQ0XCJdLFtcIiM1ZDkxN2RcIixcIiNmZmY5ZGVcIixcIiNjZGQwNzFcIixcIiNiODFjNDhcIixcIiM2MzI3MzlcIl0sW1wiI2ZlZjBhNVwiLFwiI2Y4ZDI4YlwiLFwiI2UzYjE4YlwiLFwiI2E3OGQ5ZVwiLFwiIzc0ODE5ZFwiXSxbXCIjZmNkOGFmXCIsXCIjZmVjNDliXCIsXCIjZmU5YjkxXCIsXCIjZmQ2MDg0XCIsXCIjMDQ1MDcxXCJdLFtcIiMzYzUxNWRcIixcIiMzZDY4NjhcIixcIiM0MDk1N2ZcIixcIiNhN2M2ODZcIixcIiNmY2VlOGNcIl0sW1wiI2I3YWVhNVwiLFwiI2Y3NzAxNFwiLFwiI2UzM2MwOFwiLFwiIzQzM2QzZFwiLFwiIzIyMWQyMVwiXSxbXCIjMmMyYjRiXCIsXCIjYTc1MjkzXCIsXCIjOWM3YTlkXCIsXCIjOWRkYWNiXCIsXCIjZjhkY2I0XCJdLFtcIiNlZGYzYzVcIixcIiNmMmNjNDlcIixcIiNiN2JlNWZcIixcIiMyNGIzOTlcIixcIiMyZDFjMjhcIl0sW1wiIzIwMGUzOFwiLFwiIzZhMGU0N1wiLFwiI2I1MGQ1N1wiLFwiI2ZmMGQ2NlwiLFwiI2RlYzc5MFwiXSxbXCIjZWJlYmFiXCIsXCIjNzhiZDkxXCIsXCIjNGQ4ZjgxXCIsXCIjOWI0YjU0XCIsXCIjZjIyYjU2XCJdLFtcIiMyNzE5MWNcIixcIiMyZDM4MzlcIixcIiMxMTRkNGRcIixcIiM2ZTk5ODdcIixcIiNlMGU0Y2VcIl0sW1wiI2Y0ZmNlMlwiLFwiI2QzZWJjN1wiLFwiI2FhYmZhYVwiLFwiI2JmOTY5MlwiLFwiI2ZjMDI4NFwiXSxbXCIjOTQxZjFmXCIsXCIjY2U2YjVkXCIsXCIjZmZlZmI5XCIsXCIjN2I5OTcxXCIsXCIjMzQ1MDJiXCJdLFtcIiMwY2NhYmFcIixcIiNlM2Y1YjdcIixcIiNlNmFlMDBcIixcIiNkNDY3MDBcIixcIiM5ZTNmMDBcIl0sW1wiI2ZmN2EyNFwiLFwiI2ZmNmQ1NFwiLFwiI2Y3NmQ3NVwiLFwiI2U4NzI4ZlwiLFwiI2M5N2JhNVwiXSxbXCIjZmNmNmQyXCIsXCIjZmNmNmQyXCIsXCIjZmJlMmI5XCIsXCIjYzZjMzlhXCIsXCIjMjgxZjIwXCJdLFtcIiNmY2Y5Y2VcIixcIiNjNGUwYTZcIixcIiNkZWEzN2FcIixcIiNiZDM3MzdcIixcIiNkNTRjNGFcIl0sW1wiI2Y4ZGI3ZVwiLFwiI2VjNjM0OVwiLFwiI2NlMjM0MFwiLFwiIzZmMWIyY1wiLFwiIzMxMGEyNlwiXSxbXCIjYjZkOWMzXCIsXCIjYzZhOWFjXCIsXCIjZDQ4Mjk5XCIsXCIjZTY0ZTgxXCIsXCIjZmQwYTYwXCJdLFtcIiM5NWFhNjFcIixcIiMxMjEzMTBcIixcIiNmNmY4ZWVcIixcIiNkNmU2OGFcIixcIiM4OTk3NTJcIl0sW1wiIzNmMjY0ZFwiLFwiIzVkMjc0N1wiLFwiIzlmMzY0N1wiLFwiI2RiNDY0OFwiLFwiI2ZiOTU1M1wiXSxbXCIjZjlmOWU3XCIsXCIjNTA1MDQ1XCIsXCIjMTYxNjEzXCIsXCIjYzBhMWFlXCIsXCIjYzFlMGUwXCJdLFtcIiM2ODkxOTVcIixcIiMwNTAwMDBcIixcIiNhYjgyODhcIixcIiNjZWE0YTZcIixcIiNmZmNkYzVcIl0sW1wiI2ZmZTZiZFwiLFwiI2ZmY2M3YVwiLFwiI2U2OGE2Y1wiLFwiIzhhMmY2MlwiLFwiIzI2MDAxNlwiXSxbXCIjY2FkNWFkXCIsXCIjZjlkZjk0XCIsXCIjZjZhNTcwXCIsXCIjZTc3YTc3XCIsXCIjNTQzNDNmXCJdLFtcIiM3M2M1YWFcIixcIiNjNmMwODVcIixcIiNmOWExNzdcIixcIiNmNzYxNTdcIixcIiM0YzFiMDVcIl0sW1wiI2NmM2E2OVwiLFwiIzhmNDI1NFwiLFwiIzdjYWE5NlwiLFwiI2I2YzQ3NFwiLFwiI2Q0ZDQ4OVwiXSxbXCIjZDQ2NDE5XCIsXCIjYjM0MjEyXCIsXCIjMzQxNDA1XCIsXCIjMTY2NjY1XCIsXCIjODM4NzBlXCJdLFtcIiMxZjJmM2FcIixcIiM5ODA5MmJcIixcIiNkZjkzMWJcIixcIiNlMGRhYTNcIixcIiM5ZmI5ODJcIl0sW1wiIzdlOTQ5ZVwiLFwiI2FlYzJhYlwiLFwiI2ViY2VhMFwiLFwiI2ZjNzc2NVwiLFwiI2ZmMzM1ZlwiXSxbXCIjODA3MDcwXCIsXCIjOWE4ZmM4XCIsXCIjOGRiZGViXCIsXCIjYTVlNmM4XCIsXCIjZDlmNWI1XCJdLFtcIiMxYTJiMmJcIixcIiMzMzIyMjJcIixcIiM0ZDFhMWFcIixcIiM2NjExMTFcIixcIiM4MDA5MDlcIl0sW1wiIzhkMTA0MlwiLFwiI2EyNWQ0N1wiLFwiI2EwODQ0N1wiLFwiIzk3YWE2NlwiLFwiI2I4Yjg4NFwiXSxbXCIjZjdmMGJhXCIsXCIjZTBkYmE0XCIsXCIjYTljYmE2XCIsXCIjN2ViZWEzXCIsXCIjNTNhMDhlXCJdLFtcIiM1NTFiYjNcIixcIiMyNjhmYmVcIixcIiMyY2I4YjJcIixcIiMzZGRiOGZcIixcIiNhOWYwNGRcIl0sW1wiIzBmMTMyZVwiLFwiIzE5Mjc0ZVwiLFwiIzUzNmQ4OFwiLFwiI2I0OWI4NVwiLFwiI2VhYzE5NVwiXSxbXCIjMWMwYjJiXCIsXCIjMzAxYzQxXCIsXCIjNDEzYjZiXCIsXCIjNWM2NWMwXCIsXCIjNmY5NWZmXCJdLFtcIiMwZDAyMTBcIixcIiM0ZDMxNDdcIixcIiM4NjZhODBcIixcIiNjOWI3YzdcIixcIiNmZmZiZmZcIl0sW1wiI2ZmZmZmN1wiLFwiI2U5ZmNjZlwiLFwiI2Q4ZmNiM1wiLFwiI2IxZmNiM1wiLFwiIzg5ZmNiM1wiXSxbXCIjZWZlY2UyXCIsXCIjODFkN2NkXCIsXCIjZmYwMDQ4XCIsXCIjYjEzNzU2XCIsXCIjNWIxMDIzXCJdLFtcIiMwMjAyMDJcIixcIiM0OTNkM2ZcIixcIiNiZGI0OTVcIixcIiNmOGYyY2VcIixcIiNkOGQ5ODlcIl0sW1wiI2Q4ZjVkMVwiLFwiIzlkZGJjYVwiLFwiIzkyYjM5NVwiLFwiIzcyNmM4MVwiLFwiIzU2NTE2NFwiXSxbXCIjNWEzOTM4XCIsXCIjODQ3YjZkXCIsXCIjYTNhYjk4XCIsXCIjZDJkNWFmXCIsXCIjZGZhNDliXCJdLFtcIiM4OGQxY2FcIixcIiNkZWQ2YzlcIixcIiNlNjhhMmVcIixcIiNjOTBhMDBcIixcIiM0NTJiMzRcIl0sW1wiI2JmZTRjZFwiLFwiI2RkYjM3ZFwiLFwiI2ZhODMzMVwiLFwiI2ZiNDg0OFwiLFwiI2ZkMGE2MFwiXSxbXCIjZTg1YTUwXCIsXCIjZmVmZmQ2XCIsXCIjNWJiN2I2XCIsXCIjMDEwMDAyXCIsXCIjZmRmMzdhXCJdLFtcIiM0YTMzMzNcIixcIiNlMTQ3M2ZcIixcIiM5YTkwODhcIixcIiM4MGIwYWJcIixcIiNkYmQxYjNcIl0sW1wiI2Y2ZWRkY1wiLFwiI2UzZTVkN1wiLFwiI2JkZDZkMlwiLFwiI2E1YzhjYVwiLFwiIzU4Njg3NVwiXSxbXCIjYjY4ODEwXCIsXCIjMzAxNDA2XCIsXCIjN2Y5NDczXCIsXCIjZDNjNzk1XCIsXCIjYzAyYzIwXCJdLFtcIiM0MjM0MzFcIixcIiNmNzBiMTdcIixcIiMwNTAwMDBcIixcIiM5YThjMjlcIixcIiNlN2NiYTRcIl0sW1wiI2VlYzc3YVwiLFwiI2U3NzE1NVwiLFwiI2M3MTc1NVwiLFwiIzdiMzMzNlwiLFwiIzViOWI5YVwiXSxbXCIjNDA0NDY3XCIsXCIjNWM2MjdhXCIsXCIjYTNiNmEyXCIsXCIjYjJjY2FmXCIsXCIjZmZmYWFjXCJdLFtcIiM5Mzk0NzNcIixcIiM0Zjc4NGVcIixcIiMyZDVlNGNcIixcIiMxMzQ0NGRcIixcIiMyNTIzMjZcIl0sW1wiIzE2YzFjOFwiLFwiIzQ5Y2NjY1wiLFwiIzdjZDdjZlwiLFwiI2FlZTFkM1wiLFwiI2UxZWNkNlwiXSxbXCIjZWY0MzM1XCIsXCIjZjY4YjM2XCIsXCIjZjJjZDRmXCIsXCIjY2FlMDgxXCIsXCIjODhlZWQwXCJdLFtcIiM1MjRlNGVcIixcIiNmZjJiNzNcIixcIiNmZjVhNmFcIixcIiNmZjk1NjNcIixcIiNmZmNkMzdcIl0sW1wiI2Q5NDA1MlwiLFwiI2VlN2U0Y1wiLFwiI2VhZDU2Y1wiLFwiIzk0YzVhNVwiLFwiIzg5OGI3NVwiXSxbXCIjMGY3ZDdlXCIsXCIjNzZiNWEwXCIsXCIjZmZmZGQxXCIsXCIjZmY3NTc1XCIsXCIjZDMzNjQ5XCJdLFtcIiMzZTM3NDJcIixcIiM4MjVlNjVcIixcIiNjYzgzODNcIixcIiNlYmM0YTlcIixcIiNlNmUwYzVcIl0sW1wiI2QwZGNjYlwiLFwiI2Q3YzdiZVwiLFwiI2IzYzViYVwiLFwiIzg4YzNiNVwiLFwiIzZkNjE2OFwiXSxbXCIjZjdmNGU4XCIsXCIjZGFmM2VhXCIsXCIjODVlNmMwXCIsXCIjNmJiMzliXCIsXCIjMGIwYjBkXCJdLFtcIiMwNDM5NGVcIixcIiMwMDg3NWVcIixcIiNhN2NjMTVcIixcIiNmNWNjMTdcIixcIiNmNTYyMTdcIl0sW1wiIzJmMTMzNVwiLFwiIzYyMGU1ZFwiLFwiIzlkMDA3YVwiLFwiI2NlMzc2MlwiLFwiI2ZmNmU0OVwiXSxbXCIjMjIwMTE0XCIsXCIjODExNjI4XCIsXCIjYmQzMDM4XCIsXCIjZmY3ZTU3XCIsXCIjZjhiMDY4XCJdLFtcIiNmYjU0NWNcIixcIiM5OTY2MmRcIixcIiNiN2UxYTFcIixcIiNjZGVkYTFcIixcIiNmZGY1YTRcIl0sW1wiIzMzMjQyYlwiLFwiI2UzMDg0MlwiLFwiI2ZjNDYzMFwiLFwiI2ZmOTMxN1wiLFwiI2M0ZmYwZFwiXSxbXCIjZjVjOGJmXCIsXCIjZTBkMmM1XCIsXCIjY2FkOWNhXCIsXCIjYTdlM2MxXCIsXCIjNDk1NDUzXCJdLFtcIiNmMGYwZDhcIixcIiNkOGQ4YzBcIixcIiM3YTgzNzBcIixcIiNkZjg2MTVcIixcIiNmODQ2MDBcIl0sW1wiIzllOWU5ZVwiLFwiIzVlY2RlMFwiLFwiIzAwZmZmMlwiLFwiI2M0ZmZjOVwiLFwiI2UwZTBlMFwiXSxbXCIjNTQxZTM1XCIsXCIjZGY1ZDJlXCIsXCIjZmZiNDNlXCIsXCIjYTRjOTcyXCIsXCIjNmJiMzhlXCJdLFtcIiM1ODUzNGNcIixcIiNmMWQzYWJcIixcIiNkYmNlNzlcIixcIiNmOTU4NDJcIixcIiMwZWFlYWJcIl0sW1wiI2Y2YjE0OVwiLFwiI2Y4NTcyZFwiLFwiI2RmMmEzM1wiLFwiI2EyMjU0M1wiLFwiIzZiMzEyZFwiXSxbXCIjZmZmZmZmXCIsXCIjMDAwMDAwXCIsXCIjZmYwMDZmXCIsXCIjZmZiMzAwXCIsXCIjZmZmNTM4XCJdLFtcIiNmNWVhOTVcIixcIiNmYzhlNWJcIixcIiNmYzU5NTZcIixcIiNjOTNlNGZcIixcIiMzZDE3MzRcIl0sW1wiI2YxZmZkNVwiLFwiI2Q2ZTZiN1wiLFwiI2EzNTQ4MVwiLFwiI2I4MTM2ZlwiLFwiI2VhMDA2M1wiXSxbXCIjY2I2Zjg0XCIsXCIjMjkxZDIxXCIsXCIjNWQ1NDRkXCIsXCIjY2ZjY2JiXCIsXCIjZTFkYWNhXCJdLFtcIiNmZjhkN2JcIixcIiNjODg5ODRcIixcIiM5NDcyODBcIixcIiNkNmI1OGNcIixcIiNkY2QzOTJcIl0sW1wiI2ZmZWVjMlwiLFwiI2ZlOWU4ZVwiLFwiI2Y4MDE3NFwiLFwiI2M0MDM3YVwiLFwiIzMyMmM4ZVwiXSxbXCIjNzU3MjdhXCIsXCIjOTk3Zjg3XCIsXCIjYjg4Yzg3XCIsXCIjZDM5Njc5XCIsXCIjZjNhNzZkXCJdLFtcIiNlMGRjYjhcIixcIiNjNGJjMTZcIixcIiM5MThmNjFcIixcIiNjMjFmNDBcIixcIiMzMDJjMjVcIl0sW1wiIzNiM2UzN1wiLFwiI2UxOTU2M1wiLFwiIzlmYjM5YlwiLFwiI2QzOTA4OFwiLFwiI2YwZGRiNVwiXSxbXCIjMjI4MDZiXCIsXCIjYTg5ZjFkXCIsXCIjZmFjYjRiXCIsXCIjZmNhZjE0XCIsXCIjZWQ3NjE1XCJdLFtcIiMyODFiMjRcIixcIiNkMDI5NDFcIixcIiNmNTdlNjdcIixcIiNkOWM5YTVcIixcIiM4Y2FiOTRcIl0sW1wiIzU1NTIzMVwiLFwiIzljOGM1MVwiLFwiI2JjYWM3MVwiLFwiI2U5ZGI5Y1wiLFwiIzc5OTI3ZFwiXSxbXCIjZDNkYmQ5XCIsXCIjYTRiZGJjXCIsXCIjZmZkYWJmXCIsXCIjZmZiZjkxXCIsXCIjZmY5YTUyXCJdLFtcIiM3OWFiYTJcIixcIiNiNGI5NDNcIixcIiNiNzgzM2FcIixcIiNhMDRiMjZcIixcIiMzMDFlMWFcIl0sW1wiI2ViZTdhN1wiLFwiI2E3ZWJjOVwiLFwiIzc4YjM5NVwiLFwiIzkxN2M2N1wiLFwiIzVlNTk1M1wiXSxbXCIjZmY4NTkxXCIsXCIjZWZhYWEzXCIsXCIjOGNhYWEyXCIsXCIjNWE5Yjk1XCIsXCIjNDQ4NzhmXCJdLFtcIiNmNWQzOTNcIixcIiNmMzk3NzJcIixcIiNlYjY3NjVcIixcIiMyNjEzMjlcIixcIiMxYTBiMmFcIl0sW1wiI2U0ZjNkOFwiLFwiI2FmY2FjY1wiLFwiI2ZmYTAyZVwiLFwiI2U4MDU2MFwiLFwiIzMzMWQ0YVwiXSxbXCIjYWYwNzQ1XCIsXCIjZmE0MDY5XCIsXCIjZmU5YzZiXCIsXCIjZmNkYTkwXCIsXCIjYzhiMDgwXCJdLFtcIiNjMzk3MzhcIixcIiNmZmZmOTZcIixcIiM3ZjQzMTFcIixcIiM1ZTQzMThcIixcIiMzNjFmMDBcIl0sW1wiIzU4Mjc3MFwiLFwiIzc3M2Q5NFwiLFwiIzk0M2Q4YVwiLFwiI2MyMjc2MFwiLFwiI2U4MTc2NFwiXSxbXCIjMjgxOTE2XCIsXCIjZTg2Nzg2XCIsXCIjZjRhMWI1XCIsXCIjZmZkMmNiXCIsXCIjOTZiNWFkXCJdLFtcIiNkMmQyZDJcIixcIiM1OGFmYjhcIixcIiMyNjkxOTlcIixcIiNlYzIyNWVcIixcIiMwMjAzMDVcIl0sW1wiIzgxNzQ5Y1wiLFwiIzRkM2U2YlwiLFwiIzhkYWVjM1wiLFwiI2M1ZGZlMFwiLFwiI2ZjZmNlMlwiXSxbXCIjYjE5Njc2XCIsXCIjNzY2ODYyXCIsXCIjOTJiZjlmXCIsXCIjZTNkNDljXCIsXCIjZjlmMGI3XCJdLFtcIiNjYmRhZDVcIixcIiM4OWE3YjFcIixcIiM1NjY5ODFcIixcIiMzYTQxNWFcIixcIiMzNDM0NGVcIl0sW1wiIzAwMWYyMVwiLFwiIzAyOWI5OVwiLFwiI2ViZTdiN1wiLFwiI2RlNGYxNVwiLFwiI2VjYzAzOVwiXSxbXCIjZmI2YTNkXCIsXCIjZmJlNWFjXCIsXCIjMzYxZDIwXCIsXCIjYTJiYzk3XCIsXCIjZjdjZDY3XCJdLFtcIiM5MDcwNzFcIixcIiM3YmJkYTFcIixcIiNhNGQ5YTNcIixcIiNjNmQ3YTBcIixcIiNmYmRjYjBcIl0sW1wiIzhlM2Y2NVwiLFwiIzczNzM4ZFwiLFwiIzcyYTVhZVwiLFwiIzk4ZTlkMFwiLFwiI2Q4ZmZjY1wiXSxbXCIjZDJmYWUyXCIsXCIjZTZmOGIxXCIsXCIjZjZkNWFkXCIsXCIjZjZiNzk0XCIsXCIjZTU5ZGEwXCJdLFtcIiNhZDIwMDNcIixcIiNlMGU2YWVcIixcIiNiZGQzYjZcIixcIiM4MzY4NjhcIixcIiM1ZjA2MDlcIl0sW1wiI2ZlOTYwMFwiLFwiI2ZmYzUwMVwiLFwiI2ZmZWU0YVwiLFwiIzc3NDc3ZVwiLFwiIzAzMDAxY1wiXSxbXCIjNWUzODQ4XCIsXCIjNjY2MTYzXCIsXCIjYTdiMzgxXCIsXCIjY2FkMTk3XCIsXCIjY2RlMGJmXCJdLFtcIiMyYTFlMWVcIixcIiM1MDM4NTBcIixcIiNhYTY1ODFcIixcIiNmOTlmYTlcIixcIiNmZmM1YzFcIl0sW1wiI2QxZGM1YVwiLFwiI2UwZjdlMFwiLFwiIzc3ZjJkZVwiLFwiIzZhYzVjYlwiLFwiIzQ1NDQ0ZVwiXSxbXCIjNDAwZTI4XCIsXCIjOTkyZjRkXCIsXCIjZjI1ODcyXCIsXCIjZjA4ZTczXCIsXCIjZThiNzg3XCJdLFtcIiM3NDE5NTJcIixcIiNmZTMxNzRcIixcIiNmMWMxNWRcIixcIiM5NGJiNjhcIixcIiMwOWEzYWRcIl0sW1wiIzk0MjIyMlwiLFwiI2JkMzczN1wiLFwiI2Q0Y2RhZFwiLFwiIzk4YzNhMVwiLFwiIzI1ODU3ZFwiXSxbXCIjMTYwZDE4XCIsXCIjMjMxNDViXCIsXCIjMDk0NTZjXCIsXCIjMDI2ZjZlXCIsXCIjMWNhMzllXCJdLFtcIiNlNWRhYzBcIixcIiNiY2IwOTFcIixcIiM5ZjdiNTFcIixcIiM4MjBkMjVcIixcIiM0YTAwMTNcIl0sW1wiI2NmMDYzOFwiLFwiI2ZhNjYzMlwiLFwiI2ZlY2QyM1wiLFwiIzBhOTk2ZlwiLFwiIzBhNjc4OVwiXSxbXCIjZmY0MDAwXCIsXCIjZmZlZmI1XCIsXCIjMzE5MTkwXCIsXCIjZmZjODAzXCIsXCIjMjYwZDBkXCJdLFtcIiM4MTdhOGFcIixcIiNjZGJiYmJcIixcIiNmY2RkYzhcIixcIiNmZmZlZWFcIixcIiNlZmNhYmFcIl0sW1wiI2M3NWY3N1wiLFwiI2ZlZmFiNlwiLFwiIzc3YTQ5M1wiLFwiIzgzNjE3N1wiLFwiIzY1NGI0OVwiXSxbXCIjY2RiMjdiXCIsXCIjZGU3YzA0XCIsXCIjZTQyMTFiXCIsXCIjYzAwMzUzXCIsXCIjNWUyMDI1XCJdLFtcIiMyYTAzMDhcIixcIiM5MjRmMWJcIixcIiNlMmFjM2ZcIixcIiNmOGViYmVcIixcIiM3YmE1OGRcIl0sW1wiI2EyODI1Y1wiLFwiIzg4ZDNhYlwiLFwiI2Y5ZmFkMlwiLFwiI2Y1ZGE3YVwiLFwiI2ZmOTg1ZVwiXSxbXCIjOWFlZGI1XCIsXCIjYWI5YTg5XCIsXCIjYTM2MDZkXCIsXCIjNGYyZDRiXCIsXCIjMjkxZTQwXCJdLFtcIiNmZTk1OGZcIixcIiNmM2Q3YzJcIixcIiM4YmI2YTNcIixcIiMxN2E3YThcIixcIiMxMjJmNTFcIl0sW1wiIzJmMmUzMFwiLFwiI2U4NGIyY1wiLFwiI2U2ZDgzOVwiLFwiIzdjZDE2NFwiLFwiIzJlYjhhY1wiXSxbXCIjNGFjYWJiXCIsXCIjY2JlNWMwXCIsXCIjZmNmOWMyXCIsXCIjZWRjNWJkXCIsXCIjODQ0MDdiXCJdLFtcIiNkNjQ5NmNcIixcIiM3ZGI4YTJcIixcIiNkNmRkOTBcIixcIiNmZmZhZDNcIixcIiM3ZTYzOGNcIl0sW1wiI2JlY2VjNFwiLFwiIzY4OGE3Y1wiLFwiIzlkN2M1YlwiLFwiI2UzNTI0MVwiLFwiI2U0OTE4M1wiXSxbXCIjMjgxYTFhXCIsXCIjNGUyZDI4XCIsXCIjNzA0NTRlXCIsXCIjYWU3MzZmXCIsXCIjZGRhOGIwXCJdLFtcIiM5NjZjODBcIixcIiM5NmJkYThcIixcIiNiZmQ0YWRcIixcIiNmN2QzYTNcIixcIiNlY2EzNmNcIl0sW1wiI2ZmZjRjZVwiLFwiI2QwZGViOFwiLFwiI2ZmYTQ5MlwiLFwiI2ZmN2Y4MVwiLFwiI2ZmNWM3MVwiXSxbXCIjNDIwYjU4XCIsXCIjZmMwMzZjXCIsXCIjZjFhMjBiXCIsXCIjOGQ5YzA5XCIsXCIjMDg4MDdiXCJdLFtcIiM0ZDRkNGRcIixcIiM2Mzc1NjZcIixcIiNhMzljNjdcIixcIiNkNjllNjBcIixcIiNmZjcwNGRcIl0sW1wiI2NjOGY2MFwiLFwiI2I3YTA3NVwiLFwiIzllYjQ4ZVwiLFwiIzhjYzJhMFwiLFwiIzc3ZDRiNlwiXSxbXCIjZWM2MzYzXCIsXCIjZWM3OTYzXCIsXCIjZWNiMTYzXCIsXCIjZGZkNDg3XCIsXCIjYmRlYmNhXCJdLFtcIiMxYzMxYTVcIixcIiMxMDFmNzhcIixcIiMwMjBmNTlcIixcIiMwMTA5MzdcIixcIiMwMDA1MjRcIl0sW1wiIzNkMjMwNFwiLFwiIzdmNjAwMFwiLFwiI2RlYjA2OVwiLFwiI2M0MTAyNlwiLFwiIzNkMDYwNFwiXSxbXCIjZWZkOGE0XCIsXCIjZThhZTk2XCIsXCIjZTQ5ZDg5XCIsXCIjZTQ3ZjgzXCIsXCIjYThjOTllXCJdLFtcIiNjMGZmZmZcIixcIiM2MGVjZmZcIixcIiNmZTUzODBcIixcIiNmZmJiNWVcIixcIiNmZWZlZmNcIl0sW1wiI2M5YWQ5YlwiLFwiI2ZmYmRhMVwiLFwiI2UwNTU3NlwiLFwiIzcwMzk1MVwiLFwiIzQ1MmEzN1wiXSxbXCIjNDAxMjJjXCIsXCIjNjU2MjczXCIsXCIjNTliYWE5XCIsXCIjZDhmMTcxXCIsXCIjZmNmZmQ5XCJdLFtcIiMxYTExMGVcIixcIiM0ZTA1MWNcIixcIiNmNzExNGJcIixcIiNjNGI0MzJcIixcIiNiY2I3YWJcIl0sW1wiI2Y1ZTFhNFwiLFwiI2Q5ZDU5M1wiLFwiI2VlN2YyN1wiLFwiI2JjMTYyYVwiLFwiIzMwMjMyNVwiXSxbXCIjZjY3OTY4XCIsXCIjZjY3OTY4XCIsXCIjZjY4YzY4XCIsXCIjZjY4YzY4XCIsXCIjZjZhMTY4XCJdLFtcIiM4ZTk3OGRcIixcIiM5N2M0YWRcIixcIiNiZmVkYmVcIixcIiNlNmZjZDlcIixcIiNjZGYyZDZcIl0sW1wiI2ZlZjFlMFwiLFwiI2Y2ZTZjZVwiLFwiIzNiMmUyYVwiLFwiIzNmMDYzMlwiLFwiI2E0N2YxYVwiXSxbXCIjMmE4YjhiXCIsXCIjNzVjNThlXCIsXCIjYmZmZjkxXCIsXCIjZGZlOWE4XCIsXCIjZmZkMmJmXCJdLFtcIiM5Njk1OGFcIixcIiM3Njg3N2RcIixcIiM4OGI4YTlcIixcIiNiMmNiYWVcIixcIiNkYmRkYjRcIl0sW1wiI2YwZGViYlwiLFwiIzU5YTg3ZFwiLFwiIzE2NDUzZlwiLFwiIzA5MWMxYVwiLFwiIzU0MTczNFwiXSxbXCIjOGQ5YzlkXCIsXCIjZTAwYjViXCIsXCIjZjViMDRiXCIsXCIjZmNkZmJkXCIsXCIjNDUzNzNlXCJdLFtcIiM5M2JhODVcIixcIiNiZGEzNzJcIixcIiNmNDk4NTlcIixcIiNmZjQ5NGJcIixcIiM1ZTM2M2ZcIl0sW1wiI2ZmZjdiY1wiLFwiI2ZlZTc4YVwiLFwiI2Y4YTM0OFwiLFwiI2UxNTI0NFwiLFwiIzNhN2I1MFwiXSxbXCIjZWRhMDhjXCIsXCIjODc2ZjU1XCIsXCIjYTE5MTUzXCIsXCIjYjFiMDgwXCIsXCIjYjFjZWFmXCJdLFtcIiNjMGIxOWVcIixcIiNmZmI0OGZcIixcIiNmNjhiN2JcIixcIiNmNjQ2NGFcIixcIiM5MTE0NDBcIl0sW1wiI2M5MmMyY1wiLFwiI2NmNjEyM1wiLFwiI2YzYzM2M1wiLFwiI2YxZTliYlwiLFwiIzVjNDgzYVwiXSxbXCIjZmFmNGUwXCIsXCIjZDJmZjFmXCIsXCIjZmZjMzAwXCIsXCIjZmY2YTAwXCIsXCIjM2IwYzJjXCJdLFtcIiNmZmZmZmZcIixcIiM1ZTkxODhcIixcIiMzZTU5NTRcIixcIiMyNTMzNDJcIixcIiMyMzIyMjZcIl0sW1wiIzExMDMwM1wiLFwiI2MzMDYyY1wiLFwiI2ZmMTk0YlwiLFwiIzhmYTA4MFwiLFwiIzcwODA2NlwiXSxbXCIjYjBkYTA5XCIsXCIjZjk5NDAwXCIsXCIjZjAwYTVlXCIsXCIjYjgwMDkwXCIsXCIjNTQ0ZjUxXCJdLFtcIiNlZWFlYWFcIixcIiNkYWFlYWFcIixcIiNjNmFlYWFcIixcIiNiMmFlYWFcIixcIiM5ZWFlYWFcIl0sW1wiI2YyZjJmMlwiLFwiIzM0OGU5MVwiLFwiIzFjNTA1MlwiLFwiIzIxMzYzNVwiLFwiIzBhMGMwZFwiXSxbXCIjMjgyODMyXCIsXCIjNzcxODFlXCIsXCIjYTkyNzI3XCIsXCIjYzZkNmQ2XCIsXCIjZGVlN2U3XCJdLFtcIiNjZGU5Y2FcIixcIiNjZWQ4OWRcIixcIiNkZmJhNzRcIixcIiNlOGEyNDlcIixcIiM1NzVlNTVcIl0sW1wiI2ZmZmZjMlwiLFwiI2YwZmZjMlwiLFwiI2UwZmZjMlwiLFwiI2QxZmZjMlwiLFwiI2MyZmZjMlwiXSxbXCIjNjE1YzVjXCIsXCIjZTMwMDc1XCIsXCIjZmY0YTRhXCIsXCIjZmZiMzE5XCIsXCIjZWJlOGU4XCJdLFtcIiM2MzYzNjNcIixcIiM4NTgyN2VcIixcIiNkMWIzOWZcIixcIiNmZmVjZDFcIixcIiNmZmQxYjNcIl0sW1wiI2ZmZmZlNVwiLFwiI2RmZmRhN1wiLFwiIzZlY2Y0MlwiLFwiIzMxYTI1MlwiLFwiIzZiNDU2Y1wiXSxbXCIjZTBiZTdlXCIsXCIjZTg5ZDEwXCIsXCIjZGI0YjIzXCIsXCIjMzgyOTI0XCIsXCIjMTM2MDY2XCJdLFtcIiM2NzBkMGZcIixcIiNmMDE5NDVcIixcIiNmMzY0NDRcIixcIiNmZmNlNmZcIixcIiNmZmUzYzlcIl0sW1wiIzJmMmMyYlwiLFwiIzQxMzcyNlwiLFwiIzc5NDUxZFwiLFwiI2Q3NjIxYVwiLFwiI2ZkOGQzMlwiXSxbXCIjNTQ4YzgyXCIsXCIjZDFjZTk1XCIsXCIjZmNmYWRlXCIsXCIjZDU1ZDYzXCIsXCIjNDUyZDNkXCJdLFtcIiM5NmI1YTZcIixcIiNmY2UxY2JcIixcIiNmZWJlYWNcIixcIiM0ZTM4M2RcIixcIiNkOTQzNGZcIl0sW1wiIzJiMjMxOFwiLFwiIzUyNDgzNVwiLFwiIzU2NzA0YlwiLFwiIzVkOWU3ZVwiLFwiIzc4YjNhNFwiXSxbXCIjYmVjYjdjXCIsXCIjODQ5NjdlXCIsXCIjOTYyYzRjXCIsXCIjZjA1ZDY3XCIsXCIjZmFhMTkxXCJdLFtcIiNkMGQxNjdcIixcIiNmZmZjZmZcIixcIiNlNmRkZGNcIixcIiNmZjBjNjZcIixcIiM5NjliYTJcIl0sW1wiIzJmMDAzZlwiLFwiI2JlMDAwMVwiLFwiI2ZmODAwNlwiLFwiI2YzYzc1ZlwiLFwiI2U5Y2ZhYVwiXSxbXCIjYjdiMDllXCIsXCIjNDkzNDQzXCIsXCIjZWI2MDc3XCIsXCIjZjBiNDllXCIsXCIjZjBlMmJlXCJdLFtcIiNmN2U2YmVcIixcIiNlODlhODBcIixcIiNhOTM1NDVcIixcIiM0ZDQxNDNcIixcIiM0ODU3NTVcIl0sW1wiI2MzYWFhNVwiLFwiI2Q3NjQ4M1wiLFwiI2VmOWNhNFwiLFwiI2ZmYzJiYlwiLFwiI2Y2ZTVjYlwiXSxbXCIjMDEwZDIzXCIsXCIjMDMyMjNmXCIsXCIjMDM4YmJiXCIsXCIjZmNjYjZmXCIsXCIjZTE5ZjQxXCJdLFtcIiNmYjc5NjhcIixcIiNmOWM1OTNcIixcIiNmYWZhZDRcIixcIiNiMGQxYjJcIixcIiM4OWIyYTJcIl0sW1wiIzNiNTI3NFwiLFwiIzljNjY3ZFwiLFwiI2NlOTM4YlwiLFwiI2U4Y2M5Y1wiLFwiI2UzZTFiMVwiXSxbXCIjZDhjMzU4XCIsXCIjNmQwODM5XCIsXCIjZDBlNzk5XCIsXCIjMjUyNzFlXCIsXCIjZmJlZmY0XCJdLFtcIiNkOGQzYWJcIixcIiNiMGIxOWZcIixcIiM3ODRkNWZcIixcIiNiYTQ1NmFcIixcIiNkMDQ5NjlcIl0sW1wiIzg5NjY2ZFwiLFwiI2QyYzI5ZlwiLFwiI2UzYTg2OFwiLFwiI2Y3NmY2ZFwiLFwiI2YyMzA2ZFwiXSxbXCIjMzAxODJiXCIsXCIjZjBmMWJjXCIsXCIjNjBmMGMwXCIsXCIjZmYzNjBlXCIsXCIjMTkxZjA0XCJdLFtcIiM0YWVkZDdcIixcIiM3MDU2NDdcIixcIiNlZDZkNGFcIixcIiNmZmNhNjRcIixcIiMzZmQ5N2ZcIl0sW1wiIzMzMDcwOFwiLFwiI2U4NDYyNFwiLFwiI2U4NzYyNFwiLFwiI2U4YTcyNlwiLFwiI2U4ZDgyNlwiXSxbXCIjZjdjMDk3XCIsXCIjODI5ZDc0XCIsXCIjZGUzYzJmXCIsXCIjZWI1ZjA3XCIsXCIjZjE4ODA5XCJdLFtcIiNmMDAwNjVcIixcIiNmYTlmNDNcIixcIiNmOWZhZDJcIixcIiMyNjIzMjRcIixcIiNiM2RiYzhcIl0sW1wiI2Y0NjQ3MlwiLFwiI2YyZWNjM1wiLFwiI2ZmZjlkOFwiLFwiI2JlZDZhYlwiLFwiIzk5OTE3NVwiXSxbXCIjYzNkMjk3XCIsXCIjZmZmZmZmXCIsXCIjYzNiMTk5XCIsXCIjM2EyZDE5XCIsXCIjZTgzNzNlXCJdLFtcIiMzYjA1MDNcIixcIiNmNjc3MDRcIixcIiNmODUzMTNcIixcIiNmZWRjNTdcIixcIiM5ZWNmYmNcIl0sW1wiIzY3OGM5OVwiLFwiI2I4YzdjY1wiLFwiI2ZmZjFjZlwiLFwiI2Q2YzI5MlwiLFwiI2I1OWU2N1wiXSxbXCIjZmRmMmM1XCIsXCIjZWZlOGIyXCIsXCIjYzZkMWE2XCIsXCIjODJiZmEwXCIsXCIjN2E2ZjVkXCJdLFtcIiMyMTIwM2ZcIixcIiNmZmYxY2VcIixcIiNlN2JmYTVcIixcIiNjNWE4OThcIixcIiM0YjNjNWRcIl0sW1wiI2VmNzI3MFwiLFwiI2VlOWY4MFwiLFwiI2YzZWNiZVwiLFwiI2NkYWY3YlwiLFwiIzU5MjkxYlwiXSxbXCIjM2EzMjMyXCIsXCIjZDgzMDE4XCIsXCIjZjA3ODQ4XCIsXCIjZmRmY2NlXCIsXCIjYzBkOGQ4XCJdLFtcIiMzNTI2NDBcIixcIiM5MjM5NGJcIixcIiNhOTc2N2FcIixcIiNkMWI0YTJcIixcIiNmMWYyY2VcIl0sW1wiI2ZjZjdkN1wiLFwiI2ZlYTY2N1wiLFwiI2ZmZTQ2MVwiLFwiI2M0Yzc3NlwiLFwiI2Y0ZDA5MlwiXSxbXCIjMDdmOWEyXCIsXCIjMDljMTg0XCIsXCIjMGE4OTY3XCIsXCIjMGM1MTQ5XCIsXCIjMGQxOTJiXCJdLFtcIiNhYWFhOTFcIixcIiM4NDg0NzhcIixcIiM1ZTVlNWVcIixcIiMzODM4NDVcIixcIiMxMjEyMmJcIl0sW1wiI2ZkZWM2ZlwiLFwiI2YyZTliMFwiLFwiI2VjZGZkYlwiLFwiI2VkZTNmYlwiLFwiI2ZlZGZhZVwiXSxbXCIjODI5Yjg2XCIsXCIjOTZiN2EyXCIsXCIjYTZhYTU2XCIsXCIjYjRiOTY5XCIsXCIjZGZkYjljXCJdLFtcIiMwNTAwMDNcIixcIiM0OTY5NDBcIixcIiM5Mzg0MmZcIixcIiNmZmE3MzlcIixcIiNmY2UwN2ZcIl0sW1wiIzdlYmViMlwiLFwiI2QxZjNkYlwiLFwiI2RhOWMzY1wiLFwiI2JjMTk1M1wiLFwiIzdkMTQ0Y1wiXSxbXCIjNmM3ODhlXCIsXCIjYTZhZWMxXCIsXCIjY2ZkNWUxXCIsXCIjZWRlZGYyXCIsXCIjZmNmZGZmXCJdLFtcIiM0NzE3NTRcIixcIiM5OTFkNWRcIixcIiNmMjQ0NWVcIixcIiNmMDc5NTFcIixcIiNkZWM4N2FcIl0sW1wiIzgxNjU3ZVwiLFwiIzNlYTNhZlwiLFwiIzlmZDliM1wiLFwiI2YwZjZiOVwiLFwiI2ZmMWQ0NFwiXSxbXCIjZjJlY2RjXCIsXCIjNTc0MzQ1XCIsXCIjZTNkYWNiXCIsXCIjYzVmZmU1XCIsXCIjZjVlZWQ0XCJdLFtcIiNlODYwOGNcIixcIiM3MWNiYzRcIixcIiNmZmY5ZjRcIixcIiNjZGQ1NmVcIixcIiNmZmJkNjhcIl0sW1wiIzM4MmEyYVwiLFwiI2ZmM2QzZFwiLFwiI2ZmOWQ3ZFwiLFwiI2U1ZWJiY1wiLFwiIzhkYzRiN1wiXSxbXCIjZDVkOGM3XCIsXCIjZDRkNmNlXCIsXCIjZDNkNWQ1XCIsXCIjZDFkM2RjXCIsXCIjZDBkMmUzXCJdLFtcIiM2MjI4MjRcIixcIiMyZjA2MThcIixcIiM0MTJhOWNcIixcIiMxYjY2ZmZcIixcIiMwMGNlZjVcIl0sW1wiIzA5MmI1YVwiLFwiIzA5NzM4YVwiLFwiIzc4YTg5MFwiLFwiIzllZDFiN1wiLFwiI2U3ZDliNFwiXSxbXCIjMzY4OTg2XCIsXCIjZTc5YTMyXCIsXCIjZjg0MzM5XCIsXCIjZDQwZjYwXCIsXCIjMDA1YzgxXCJdLFtcIiMxNDBkMWFcIixcIiM0MjE0MmFcIixcIiNmZjJlNWZcIixcIiNmZmQ0NTJcIixcIiNmYWVlY2FcIl0sW1wiI2RhY2RhY1wiLFwiI2YzOTcwOFwiLFwiI2Y4NTc0MVwiLFwiIzBlOTA5NFwiLFwiIzFlMTgwMVwiXSxbXCIjYTZlMDk0XCIsXCIjZThlNDkwXCIsXCIjZjA3MzYwXCIsXCIjYmYyYTdmXCIsXCIjNWMzZDViXCJdLFtcIiM0NjI5NGFcIixcIiNhZDRjNmJcIixcIiNlMDc3NjdcIixcIiNlMGFlNjdcIixcIiNkNGUwNjdcIl0sW1wiIzEwMTAwZlwiLFwiIzI2NTAzY1wiLFwiIzg0OTExMlwiLFwiIzlkNGUwZlwiLFwiIzg0MDk0M1wiXSxbXCIjZmY5YjhmXCIsXCIjZWY3Njg5XCIsXCIjOWU2YTkwXCIsXCIjNzY2Nzg4XCIsXCIjNzE1NTZiXCJdLFtcIiMyYjJjMzBcIixcIiMzNTMxM2JcIixcIiM0NTM3NDVcIixcIiM2MTNjNGNcIixcIiNmZjE0NTdcIl0sW1wiI2VkZmZiM1wiLFwiIzk5OTI4ZVwiLFwiI2JmZTNjM1wiLFwiI2RiZWRjMlwiLFwiI2ZmZjJkNFwiXSxbXCIjZTFlZGQxXCIsXCIjYWFiNjliXCIsXCIjOWU5MDZlXCIsXCIjYjQ3OTQxXCIsXCIjY2YzOTFkXCJdLFtcIiM1MDQzNzVcIixcIiMzOTMyNGRcIixcIiNmZmU4ZWZcIixcIiNjMjI1NTdcIixcIiNlZDU4ODdcIl0sW1wiI2ZmZmVjN1wiLFwiI2UxZjVjNFwiLFwiIzlkYzlhY1wiLFwiIzkxOTE2N1wiLFwiI2ZmNGU1MFwiXSxbXCIjZTRmZmQ0XCIsXCIjZWJlN2E3XCIsXCIjZWRjNjhlXCIsXCIjYTQ5ZTdlXCIsXCIjNmU4Zjg1XCJdLFtcIiMzZDBhNDlcIixcIiM1MDE1YmRcIixcIiMwMjdmZTlcIixcIiMwMGNhZjhcIixcIiNlMGRhZjdcIl0sW1wiI2ExYTZhYVwiLFwiI2JkOTI4YlwiLFwiI2RlNzU3MVwiLFwiI2ZmNGU0NFwiLFwiIzI4MjYzNFwiXSxbXCIjZjI4YTQ5XCIsXCIjZjdlM2IyXCIsXCIjZTM5NjdkXCIsXCIjNTczNDJkXCIsXCIjOWRiZmE0XCJdLFtcIiM2ZWE0OWJcIixcIiNkOWQwYWNcIixcIiM2YjhmMGJcIixcIiM3ZDNmNjBcIixcIiMzNzJiMmVcIl0sW1wiIzM3YWI5OFwiLFwiIzgwYmM5NlwiLFwiI2E2Yzg4Y1wiLFwiI2UxY2U4YVwiLFwiIzM3MDUzYlwiXSxbXCIjMzMzMjM3XCIsXCIjZmI4MzUxXCIsXCIjZmZhZDY0XCIsXCIjZTllMmRhXCIsXCIjYWRkNGQzXCJdLFtcIiNkNGNkYzVcIixcIiM1Yjg4YTVcIixcIiNmNGY0ZjJcIixcIiMxOTEwMTNcIixcIiMyNDNhNjlcIl0sW1wiIzI0NDM0YlwiLFwiI2ZjMzI1YlwiLFwiI2ZhN2Y0YlwiLFwiI2JmYmM4NFwiLFwiIzYzOTk3YVwiXSxbXCIjZTVlNmI4XCIsXCIjYzZkNGI4XCIsXCIjNmNhNmEzXCIsXCIjODU2YTZhXCIsXCIjOWMzMjVjXCJdLFtcIiNiZWVkODBcIixcIiM1OWQ5OTlcIixcIiMzMWFkYTFcIixcIiM1MTY0N2FcIixcIiM0NTNjNWNcIl0sW1wiIzNiMzMxZlwiLFwiI2VkNjM2MlwiLFwiI2ZmOGU2NVwiLFwiI2RjZWI1YlwiLFwiIzU4Y2U3NFwiXSxbXCIjZDZjZThiXCIsXCIjOGZkMDUzXCIsXCIjMDI5MDdkXCIsXCIjMDM0NTNkXCIsXCIjMmMxMDAxXCJdLFtcIiM0MDJiMzBcIixcIiNmYWRkYjRcIixcIiNmNGM3OTBcIixcIiNmMjk3N2VcIixcIiNiYTY4NjhcIl0sW1wiI2FmMTYyYVwiLFwiIzk1MDAzYVwiLFwiIzgzMDAyNFwiLFwiIzVhMGUzZFwiLFwiIzQ0MDIxZVwiXSxbXCIjZTgxZTRhXCIsXCIjMGIxZDIxXCIsXCIjMDc4YTg1XCIsXCIjNjhiYWFiXCIsXCIjZWRkNWM1XCJdLFtcIiNmYjYwNjZcIixcIiNmZmVmYzFcIixcIiNmZGQ4NmVcIixcIiNmZmE0NjNcIixcIiNmNjZiNDBcIl0sW1wiI2ZhNzc4NVwiLFwiIzI0MjExYVwiLFwiI2Q1ZDg3ZFwiLFwiI2IxZDRiNlwiLFwiIzUzY2JiZlwiXSxbXCIjOWNkNmM4XCIsXCIjZjFmZmNmXCIsXCIjZjhkZjgyXCIsXCIjZmFjMDU1XCIsXCIjZTU3YzNhXCJdLFtcIiMzYjQzNDRcIixcIiM1MTYxNWJcIixcIiNiYmJkOTFcIixcIiNmMDZmNmJcIixcIiNmMTJmNWRcIl0sW1wiI2I5MDMwZlwiLFwiIzllMDAwNFwiLFwiIzcwMTYwZVwiLFwiIzE2MTkxN1wiLFwiI2UxZTNkYlwiXSxbXCIjZjJlN2QyXCIsXCIjZjc5ZWIxXCIsXCIjYWU4ZmJhXCIsXCIjNGM1ZTkxXCIsXCIjNDczNDY5XCJdLFtcIiNmZjUyNTJcIixcIiNmZjc3NTJcIixcIiNmZjlhNTJcIixcIiNmZmI3NTJcIixcIiM1ZTQwNWJcIl0sW1wiI2MxZGRjN1wiLFwiI2Y1ZThjNlwiLFwiI2JiY2Q3N1wiLFwiI2RjODA1MVwiLFwiI2Y0ZDI3OVwiXSxbXCIjZGZjY2NjXCIsXCIjZmZkM2QzXCIsXCIjZmZhNGE0XCIsXCIjZDE3ODc4XCIsXCIjOTY1OTU5XCJdLFtcIiM1ODVkNWRcIixcIiNlMDZmNzJcIixcIiNlN2ExN2FcIixcIiNlNGIxN2RcIixcIiNkMWNiYzBcIl0sW1wiIzkyYjJhN1wiLFwiIzZlN2I4Y1wiLFwiI2I2OTE5OFwiLFwiI2VmYTA5YlwiLFwiI2U3YzdiMFwiXSxbXCIjMjYwZDMzXCIsXCIjMDAzZjY5XCIsXCIjMTA2Yjg3XCIsXCIjMTU3YThjXCIsXCIjYjNhY2E0XCJdLFtcIiM3MmJhYjBcIixcIiNmMGM2OWNcIixcIiNkMTI4NGZcIixcIiM5ZTBlMzBcIixcIiMzMDFhMWFcIl0sW1wiIzA3MDcwNVwiLFwiIzNlNGI1MVwiLFwiIzZmNzM3ZVwiLFwiIzg5YTA5YVwiLFwiI2MxYzBhZVwiXSxbXCIjNGUzMTUwXCIsXCIjYzc3NzdmXCIsXCIjYjZkZWMxXCIsXCIjZDZlY2RmXCIsXCIjZmJmNmI1XCJdLFtcIiNlNGE2OTFcIixcIiNmN2VmZDhcIixcIiNjOGM4YTlcIixcIiM1NTYyNzBcIixcIiMyNzMxNDJcIl0sW1wiI2U2NjI2ZlwiLFwiI2VmYWU3OFwiLFwiI2Y1ZTE5Y1wiLFwiI2EyY2E4ZVwiLFwiIzY2YWY5MVwiXSxbXCIjZmJlNGFlXCIsXCIjZGFjYjhhXCIsXCIjODk3NjMyXCIsXCIjMzkyZTBlXCIsXCIjNmJiODhhXCJdLFtcIiMwMmZjZjNcIixcIiNhOWU0Y2ZcIixcIiNjYWUwYzhcIixcIiNkZWRkYzRcIixcIiNlOGU3ZDJcIl0sW1wiI2QwZGNiM1wiLFwiI2RhYmQ5MFwiLFwiI2RmNzY3MFwiLFwiI2Y0MDY1ZVwiLFwiIzgzN2Q3MlwiXSxbXCIjZjVmNWY1XCIsXCIjZTllOWU5XCIsXCIjMDA2NjY2XCIsXCIjMDA4NTg0XCIsXCIjY2NjY2NjXCJdLFtcIiMyZWIzYTFcIixcIiM0ZmIzN2NcIixcIiM3OWIzNmJcIixcIiNhMmFiNWVcIixcIiNiY2E5NWJcIl0sW1wiIzU5NDc0N1wiLFwiIzY3NDNhNVwiLFwiIzczNDVkNlwiLFwiIzJlMmUyZVwiLFwiI2JmYWI5M1wiXSxbXCIjZWZlMmJmXCIsXCIjZjVhNDg5XCIsXCIjZWY4MTg0XCIsXCIjYTc2Mzc4XCIsXCIjYThjODk2XCJdLFtcIiM0ZTAzMWVcIixcIiM1ZDJkNGVcIixcIiM1YTRjNmVcIixcIiM0NDczOTBcIixcIiMwNWExYWRcIl0sW1wiI2RiMzAyNlwiLFwiI2U4OGEyNVwiLFwiI2Y5ZTE0YlwiLFwiI2VmZWQ4OVwiLFwiIzdhYmY2NlwiXSxbXCIjZjdmM2NmXCIsXCIjYzJlNGNiXCIsXCIjMzZjZWNjXCIsXCIjMjdiMWJmXCIsXCIjMTc2NTg1XCJdLFtcIiM4NzgyODZcIixcIiM4OGI2YTNcIixcIiNiZGJhOWVcIixcIiNlMmMxOGRcIixcIiNlMmJiNjRcIl0sW1wiI2ZlNDk1ZlwiLFwiI2ZlOWQ5N1wiLFwiI2ZmZmVjOFwiLFwiI2Q4ZmQ5NFwiLFwiI2JkZWQ3ZVwiXSxbXCIjZmFiOTZiXCIsXCIjZjE5NDc0XCIsXCIjZWE3NzdiXCIsXCIjOTQ5MTlhXCIsXCIjNjlhMmE4XCJdLFtcIiMzMjJmM2VcIixcIiNlNjNjNmRcIixcIiNmNWI0OTRcIixcIiNlZGU3YTVcIixcIiNhYmRlY2JcIl0sW1wiI2MwYjY5OFwiLFwiIzY0N2UzN1wiLFwiIzMwMDAxM1wiLFwiIzZlOWE4MVwiLFwiI2QyYzhhN1wiXSxbXCIjMjU5YjliXCIsXCIjNmZiY2FhXCIsXCIjYjhkNmIwXCIsXCIjZmVlZGJmXCIsXCIjZmYxOTY0XCJdLFtcIiMxNzE4MWZcIixcIiMzMTRkNGFcIixcIiMwYjg3NzBcIixcIiNhNmMyODhcIixcIiNlYmU2OGRcIl0sW1wiI2U3ZGRkM1wiLFwiI2MwYzJiZFwiLFwiIzljOTk5NFwiLFwiIzI5MjUxY1wiLFwiI2U2YWE5ZlwiXSxbXCIjZTcyMzEzXCIsXCIjZmZmY2Y3XCIsXCIjNjdiNTg4XCIsXCIjNjVhNjc1XCIsXCIjMTQxMzI1XCJdLFtcIiM4MDEyNDVcIixcIiNmNGY0ZGRcIixcIiNkY2RiYWZcIixcIiM1ZDVjNDlcIixcIiMzZDNkMzRcIl0sW1wiI2Y4ZGFjMlwiLFwiI2YyYTI5N1wiLFwiI2Y0NDM2ZlwiLFwiI2NhMTQ0NFwiLFwiIzE0MjczOFwiXSxbXCIjNjFkNGIwXCIsXCIjOGVlNjk2XCIsXCIjYmFmNzdjXCIsXCIjZThmZjY1XCIsXCIjZWNlZGQ1XCJdLFtcIiM4NWIzOTRcIixcIiNhN2JhNTlcIixcIiNmMGYwZDhcIixcIiNmMGQ4OTBcIixcIiNhZTJmMjdcIl0sW1wiI2E2OWE4MVwiLFwiI2UwZDNiOFwiLFwiI2ViOWU2ZVwiLFwiI2ViNmU2ZVwiLFwiIzcwNmY2YlwiXSxbXCIjZWRiODg2XCIsXCIjZjFjNjkxXCIsXCIjZmZlNDk4XCIsXCIjZjlmOWYxXCIsXCIjYjlhNThkXCJdLFtcIiM4N2IwOTFcIixcIiNjNGQ0YWJcIixcIiNlMGUwYjZcIixcIiMxNzE0MzBcIixcIiNlZmYwZDVcIl0sW1wiIzNhMzEzMlwiLFwiIzBmNDU3MVwiLFwiIzM4NmRiZFwiLFwiIzAwOWRkZFwiLFwiIzA1ZDNmOFwiXSxbXCIjMDEwMzAwXCIsXCIjMzE0YzUzXCIsXCIjNWE3Zjc4XCIsXCIjYmJkZWM2XCIsXCIjZjdmOGZjXCJdLFtcIiMwMjAzMWFcIixcIiMwMjFiMmJcIixcIiNiMTBjNDNcIixcIiNmZjA4NDFcIixcIiNlYmRmY2NcIl0sW1wiIzExMDkxYVwiLFwiIzJmMmY0ZFwiLFwiIzYyNjk3MFwiLFwiI2JhYjE5NVwiLFwiI2U4ZDE4ZVwiXSxbXCIjNDYzYTJhXCIsXCIjNWM0YjM3XCIsXCIjZGRkZDkyXCIsXCIjNTdjNWM3XCIsXCIjMDBiNWI5XCJdLFtcIiNjOTAzMWFcIixcIiM5ZDE3MjJcIixcIiM0YTI3MjNcIixcIiMwN2EyYTZcIixcIiNmZmVjY2JcIl0sW1wiI2ZmN2M3MFwiLFwiI2YyZGZiMVwiLFwiI2I3YzlhOVwiLFwiIzY3NGQ2OVwiLFwiIzJlMjkyZVwiXSxbXCIjZmZmN2U1XCIsXCIjZmVjZGQwXCIsXCIjZjhhZmI4XCIsXCIjZjVhM2FmXCIsXCIjNTk0ODNlXCJdLFtcIiM1ZTAzMjRcIixcIiM2OTI3NjRcIixcIiM3Yjc4OTNcIixcIiM3ZmIxYThcIixcIiM5NGY5YmZcIl0sW1wiI2E5YmFhZVwiLFwiI2U2ZDBiMVwiLFwiI2RlYjI5N1wiLFwiI2M5OGQ3YlwiLFwiIzhhNjY2MlwiXSxbXCIjNjMwNzJjXCIsXCIjOTEwZjQzXCIsXCIjYTY1ZDUzXCIsXCIjZDU5NTAwXCIsXCIjZjdmN2ExXCJdLFtcIiNmYTM0MTlcIixcIiNmM2UxYjZcIixcIiM3Y2JjOWFcIixcIiMyMzk5OGVcIixcIiMxZDVlNjlcIl0sW1wiIzZkMTY1YVwiLFwiI2EwMzQ2ZVwiLFwiI2VjNWM4ZFwiLFwiI2ZmOGM5MVwiLFwiI2ZmYzRhNlwiXSxbXCIjMDAwMDAwXCIsXCIjYTY5NjgyXCIsXCIjN2U5OTkxXCIsXCIjNzM3MzczXCIsXCIjZDg3NzBjXCJdLFtcIiNkZWNiYTBcIixcIiNhMGFiOTRcIixcIiM2Yjk3OTVcIixcIiM1OTQ0NjFcIixcIiM2ZTE1MzhcIl0sW1wiIzI0MGYwM1wiLFwiIzRiMjQwOVwiLFwiI2JkN2EyMlwiLFwiI2U3OTAyMlwiLFwiI2RmNjIxY1wiXSxbXCIjYTg5ZDg3XCIsXCIjYmFiMTAwXCIsXCIjZjkxNjU5XCIsXCIjYjMxZDZhXCIsXCIjMmUyNDQ0XCJdLFtcIiMwZTAwMzZcIixcIiM0YzI2NGJcIixcIiNhMDRmNjJcIixcIiNkMmEzOTFcIixcIiNlNmQ3YjhcIl0sW1wiI2I5ZjhmMFwiLFwiI2I2ZDNhNVwiLFwiI2VlOWI1N1wiLFwiI2VmMmI0MVwiLFwiIzExMTMwZVwiXSxbXCIjMWYwNDQxXCIsXCIjZmMxMDY4XCIsXCIjZmNhYjEwXCIsXCIjZjljZTA3XCIsXCIjMGNlM2U4XCJdLFtcIiMyYTA5MWNcIixcIiM4Nzc1OGZcIixcIiM4NWFhYjBcIixcIiNhM2MzYjhcIixcIiNlM2VkZDJcIl0sW1wiIzMyMDEzOVwiLFwiIzMzMWIzYlwiLFwiIzMzM2U1MFwiLFwiIzVjNmU2ZVwiLFwiI2YxZGViZFwiXSxbXCIjMjExYzMzXCIsXCIjMmI4MThjXCIsXCIjZmZjOTk0XCIsXCIjZWQyODYwXCIsXCIjOTkwMDY5XCJdLFtcIiNjYzA2M2VcIixcIiNlODM1MzVcIixcIiNmZDk0MDdcIixcIiNlMmQ5YzJcIixcIiMxMDg5OGJcIl0sW1wiI2Y3NWU1MFwiLFwiI2VhYzc2MVwiLFwiI2U4ZGY5Y1wiLFwiIzkxYzA5ZVwiLFwiIzdkNzc2OVwiXSxbXCIjZTVmZWM1XCIsXCIjYzVmZWM2XCIsXCIjYTNmZWM3XCIsXCIjMjlmZmM5XCIsXCIjMzkyYTM1XCJdLFtcIiNlMGVlYmRcIixcIiNkYWU5OGFcIixcIiNlMTc1NzJcIixcIiNjZTE0NDZcIixcIiMyYjBiMTZcIl0sW1wiIzhmYmZiOVwiLFwiIzY0OWVhN1wiLFwiI2JkZGI4OFwiLFwiI2UwZjNiMlwiLFwiI2VlZmFhOFwiXSxbXCIjMDZkOWI2XCIsXCIjYTRmNDc5XCIsXCIjZDRkMzIzXCIsXCIjZDEzNzc1XCIsXCIjOWMzYzg2XCJdLFtcIiMxYTBjMTJcIixcIiNmNzBhNzFcIixcIiNmZmRhYTZcIixcIiNmZmIxNDVcIixcIiM3NGFiOTBcIl0sW1wiIzY0ODI4NVwiLFwiI2I0YTY4ZVwiLFwiIzA4MGQwZFwiLFwiI2YzZGFhYVwiLFwiI2EzYzRjMlwiXSxbXCIjYTRmN2Q0XCIsXCIjOWFlMDdkXCIsXCIjYWRhMjQxXCIsXCIjYTEzODY2XCIsXCIjMzgxYzMwXCJdLFtcIiNmZWY3ZDVcIixcIiNhYmVlOTNcIixcIiMyZDkzOGVcIixcIiMwYjQ0NjJcIixcIiNmN2E0OGJcIl0sW1wiIzAwNjg2Y1wiLFwiIzMyYzJiOVwiLFwiI2VkZWNiM1wiLFwiI2ZhZDkyOFwiLFwiI2ZmOTkxNVwiXSxbXCIjY2JlNGVhXCIsXCIjZWFkMWNiXCIsXCIjYWY5Yzk4XCIsXCIjNjU3Mjc1XCIsXCIjMDAwMDAwXCJdLFtcIiNmM2ZmZDJcIixcIiNiZmYxY2VcIixcIiM4MmJkYTdcIixcIiM2ZTgzN2NcIixcIiMyZTA1MjdcIl0sW1wiIzQ4NDQ1MFwiLFwiIzQ2NjA2N1wiLFwiIzQ1OWE5NlwiLFwiIzM0YmFhYlwiLFwiI2M0YzhjNVwiXSxbXCIjZmJmZmNjXCIsXCIjY2FmMmJlXCIsXCIjZGRjOTk2XCIsXCIjZjY3OTc1XCIsXCIjZjEzNTY1XCJdLFtcIiNmNWUzYWVcIixcIiNmZmY1ZDZcIixcIiNlMWU2ZDNcIixcIiNiMWNjYzRcIixcIiM0ZTU4NjFcIl0sW1wiI2UzNjA0ZFwiLFwiI2QxYzhhM1wiLFwiI2FjYmE5ZFwiLFwiIzdiNWQ1ZVwiLFwiI2M2YWQ3MVwiXSxbXCIjM2IxYTAxXCIsXCIjYTVjYzdhXCIsXCIjZGNmZmI2XCIsXCIjNjMzYjFjXCIsXCIjZGIzYzZlXCJdLFtcIiMwMDAwMDBcIixcIiM3ODkwYThcIixcIiMzMDQ4NzhcIixcIiMxODE4NDhcIixcIiNmMGE4MThcIl0sW1wiI2ZmZTNiM1wiLFwiI2ZmOWE1MlwiLFwiI2ZmNTI1MlwiLFwiI2M5MWU1YVwiLFwiIzNkMjkyMlwiXSxbXCIjYmJhYTlhXCIsXCIjODQ5Yjk1XCIsXCIjOTA4NTZmXCIsXCIjYjY1NTRjXCIsXCIjZDgzYTMxXCJdLFtcIiNlMmUyYjJcIixcIiM0OWZlY2ZcIixcIiMzNzAxMjhcIixcIiNlNDIzNTVcIixcIiNmZTc5NDVcIl0sW1wiI2U0ZTJhZlwiLFwiI2ZmYTU5MFwiLFwiI2U1Y2JiNFwiLFwiI2ZmZjFkN1wiLFwiIzU2NDEzZVwiXSxbXCIjZjNiNTc4XCIsXCIjZjc4Mzc2XCIsXCIjZGE0YzY2XCIsXCIjOGYzYzY4XCIsXCIjM2YzNTU3XCJdLFtcIiNmMmVjYjBcIixcIiNlYmI2NjdcIixcIiNkNjVjNTZcIixcIiM4MjNjM2NcIixcIiMxYjFjMjZcIl0sW1wiI2YxZjdjZFwiLFwiI2QzZjdjZFwiLFwiI2I1ZjdjZFwiLFwiIzQwM2EyNlwiLFwiIzgxODc2Y1wiXSxbXCIjOTlkYjQ5XCIsXCIjMDY5ZThjXCIsXCIjMjExZDE5XCIsXCIjNTc1MDQ4XCIsXCIjOWUwNjRhXCJdLFtcIiM4ZjkwNDRcIixcIiNmOGE1MjNcIixcIiNmYzgwMjBcIixcIiNjZjE1MDBcIixcIiMzNTJmM2RcIl0sW1wiIzRiMTYyM1wiLFwiIzc1MjMzZFwiLFwiI2M0NTk0YlwiLFwiI2YwYjk2YlwiLFwiI2ZkZjU3ZVwiXSxbXCIjN2Q2NzdlXCIsXCIjNGYyYzRkXCIsXCIjMzYwYjQxXCIsXCIjY2NjOWFhXCIsXCIjZmFmZGVhXCJdLFtcIiNlZWQ0N2ZcIixcIiNmMmUwYTBcIixcIiNkOGQ4YjJcIixcIiM4Y2IwYjBcIixcIiM0MzIzMzJcIl0sW1wiIzVjMWIzNVwiLFwiI2Q0M2Y1ZFwiLFwiI2YyYTc3MlwiLFwiI2U4ZDg5MFwiLFwiI2UyZWRiN1wiXSxbXCIjNDAyMjNjXCIsXCIjNDI5ODhmXCIsXCIjYjFjNTkyXCIsXCIjZjFkZGJhXCIsXCIjZmI3MThhXCJdLFtcIiM3ZTY3NjJcIixcIiNjZjVhNjBcIixcIiNmODVhNjlcIixcIiNmMGI1OTNcIixcIiNlM2RmYmNcIl0sW1wiIzMwMGQyOFwiLFwiIzcwNjE1Y1wiLFwiIzhjYTM4YlwiLFwiI2Y3ZWVhYVwiLFwiI2VkYjU1MlwiXSxbXCIjY2FmNzI5XCIsXCIjNzlkZDdlXCIsXCIjMmVjYmFhXCIsXCIjMjFiNmI2XCIsXCIjODg4ZGRhXCJdLFtcIiNmM2RkYjZcIixcIiNkNmJmOTNcIixcIiM1MzI3MjhcIixcIiNjZWQwYmFcIixcIiNmMmVmY2VcIl0sW1wiIzQxMjk3M1wiLFwiIzc1Mzk3OVwiLFwiI2IxNDc2ZFwiLFwiI2ViOTA2NFwiLFwiI2JlZDljOFwiXSxbXCIjNDg1ODZmXCIsXCIjZmZmZmMwXCIsXCIjZDZjNDk2XCIsXCIjZDYyZTJlXCIsXCIjMjgzZDNlXCJdLFtcIiM2OGIyZjhcIixcIiM1MDZlZTVcIixcIiM3MDM3Y2RcIixcIiM2NTFmNzFcIixcIiMxZDBjMjBcIl0sW1wiI2E3ODQ4YlwiLFwiI2I4OGY5M1wiLFwiI2Y1ZDVjNlwiLFwiI2Y5ZWZkNFwiLFwiI2I4Y2FiZVwiXSxbXCIjZjllYmM0XCIsXCIjZmZiMzkxXCIsXCIjZmMyZjY4XCIsXCIjNDcyZjVmXCIsXCIjMDgyOTVlXCJdLFtcIiMxZjE5MmZcIixcIiMyZDYwNzNcIixcIiM2NWI4YTZcIixcIiNiNWU4YzNcIixcIiNmMGY3ZGFcIl0sW1wiI2QzYzZjY1wiLFwiI2UyYzNjNlwiLFwiI2VlY2ZjNFwiLFwiI2Y4ZTZjNlwiLFwiI2ZmZmZjY1wiXSxbXCIjZjhmOGQ2XCIsXCIjYjNjNjdmXCIsXCIjNWQ3ZTYyXCIsXCIjNTA1OTVjXCIsXCIjZmEzZTNlXCJdLFtcIiM3MjNlNGVcIixcIiNiMDM4NTFcIixcIiNlZjMzNTNcIixcIiNmMTcxNDRcIixcIiNmNGIwMzZcIl0sW1wiI2M3MDAzZlwiLFwiI2Y5MDA1MFwiLFwiI2Y5NmEwMFwiLFwiI2ZhYWIwMFwiLFwiI2RhZjIwNFwiXSxbXCIjNjYzMzMzXCIsXCIjOTk0ZDRkXCIsXCIjY2M2NjY2XCIsXCIjZTZiMjgwXCIsXCIjZmZmZjk5XCJdLFtcIiM2NmZmZmZcIixcIiM4Y2JmZTZcIixcIiNiMzgwY2NcIixcIiNkOTQwYjNcIixcIiNmZjAwOTlcIl0sW1wiIzY2NWM1MlwiLFwiIzc0YjNhN1wiLFwiI2EzY2NhZlwiLFwiI2U2ZTFjZlwiLFwiI2NjNWIxNFwiXSxbXCIjNTNhYzU5XCIsXCIjM2I4OTUyXCIsXCIjMGY2ODRiXCIsXCIjMDM0ODRjXCIsXCIjMWMyMzJlXCJdLFtcIiNmZWEzMDRcIixcIiM5MDkzMjBcIixcIiMxMjVhNDRcIixcIiMzNzE5MmNcIixcIiMyMjAzMTVcIl0sW1wiI2M4Y2ZhZVwiLFwiIzk2YjM5N1wiLFwiIzUyNTU3NFwiLFwiIzVjM2U2MlwiLFwiIzliNWY3YlwiXSxbXCIjNzQ1ZTUwXCIsXCIjZmY5NDhiXCIsXCIjZmRhZjhhXCIsXCIjZmNkNDg3XCIsXCIjZjc5NTg1XCJdLFtcIiNlNGIzMDJcIixcIiMxNThmYTJcIixcIiNkZTRmM2FcIixcIiM3MjI3MzFcIixcIiNiZDFiNDNcIl0sW1wiIzc5ZDZiN1wiLFwiI2NjZDZiZFwiLFwiI2Q3YzNhYlwiLFwiI2YwYWZhYlwiLFwiI2Y1ODY5NlwiXSxbXCIjZDNiMzkwXCIsXCIjYjhhMzhiXCIsXCIjYTc4YjgzXCIsXCIjYzc2Yjc5XCIsXCIjZjE0MTZiXCJdLFtcIiNmNGZjYjhcIixcIiNkYWU2ODFcIixcIiM5NWE4NjhcIixcIiM0NTJjMThcIixcIiNjYzcyNTRcIl0sW1wiIzUyNDkzYVwiLFwiIzdjODU2OVwiLFwiI2E0YWI4MFwiLFwiI2U4ZTBhZVwiLFwiI2RlNzMzZVwiXSxbXCIjMTExMTEzXCIsXCIjZDE4NjgxXCIsXCIjYWNiZmI3XCIsXCIjZjZlYmRkXCIsXCIjOGU2ZDg2XCJdLFtcIiM1MmJhYTdcIixcIiM3MThmODVcIixcIiNiYTUyNTJcIixcIiNmYzBmNTJcIixcIiNmYzNkNzNcIl0sW1wiI2VkYWI4YlwiLFwiI2Y1ZWJiMFwiLFwiI2RhZDA2MVwiLFwiI2FjYzU5ZFwiLFwiIzc3NmM1YVwiXSxbXCIjMGIxMTBkXCIsXCIjMmM0ZDU2XCIsXCIjYzNhYTcyXCIsXCIjZGM3NjEyXCIsXCIjYmQzMjAwXCJdLFtcIiM1YTM3MmNcIixcIiM4YjhiNzBcIixcIiM5OGM3YjBcIixcIiNmMGYwZDhcIixcIiNjOTRiMGNcIl0sW1wiI2ViZTVjZVwiLFwiI2NlZDFjMFwiLFwiI2JhZDFjOVwiLFwiIzhjMTYyYVwiLFwiIzY2MDAyMlwiXSxbXCIjMDkwZjEzXCIsXCIjMTcxZjI1XCIsXCIjNzUyZTJiXCIsXCIjYzkwYTAyXCIsXCIjZjJlYWI3XCJdLFtcIiM5ZWQ5OWVcIixcIiNmMGRkYTZcIixcIiNlYjY0MjdcIixcIiNlYjIxNGVcIixcIiMxYTE2MjNcIl0sW1wiIzg2NWExOVwiLFwiI2M0YjI4MlwiLFwiIzg1MDA1YlwiLFwiIzUyMDY0N1wiLFwiIzBlMDAyZlwiXSxbXCIjNTQ1NDU0XCIsXCIjN2I4YTg0XCIsXCIjOGNiZmFmXCIsXCIjZWRlN2Q1XCIsXCIjYjdjYzE4XCJdLFtcIiNmYjU3M2JcIixcIiM0ZjM5M2NcIixcIiM4ZWE4OGRcIixcIiM5Y2QwYWNcIixcIiNmNGViOWVcIl0sW1wiI2U1ZTVlNVwiLFwiI2YxZGJkYVwiLFwiI2ZjZDBjZlwiLFwiI2NmYmRiZlwiLFwiI2EyYTlhZlwiXSxbXCIjZmZkZWIzXCIsXCIjNzNiYzkxXCIsXCIjMzQyMjIwXCIsXCIjZmMzNzBjXCIsXCIjZmY4NzE2XCJdLFtcIiNjY2NjNjZcIixcIiNhNmJmNzNcIixcIiM4MGIzODBcIixcIiM1OWE2OGNcIixcIiMzMzk5OTlcIl0sW1wiIzU3NGQ0ZlwiLFwiI2ZmZmZmZlwiLFwiIzk2OTA5MVwiLFwiI2ZmZTk5OVwiLFwiI2ZmZDk1MlwiXSxbXCIjNWY1NDVjXCIsXCIjZWI3MDcyXCIsXCIjZjViYTkwXCIsXCIjZjVlMmI4XCIsXCIjYTJjYWE1XCJdLFtcIiM1ZTU0NzNcIixcIiMxOWI1YTVcIixcIiNlZGU4OWRcIixcIiNmZjY5MzNcIixcIiNmZjAwNDhcIl0sW1wiI2VkZDhiYlwiLFwiI2UyYWE4N1wiLFwiI2ZlZjdlMVwiLFwiI2EyZDNjN1wiLFwiI2VmOGU3ZFwiXSxbXCIjY2VlYmQxXCIsXCIjYjZkZWI5XCIsXCIjYjFjY2I0XCIsXCIjYWViZmFmXCIsXCIjYTZhZGE3XCJdLFtcIiMzMzJkMjdcIixcIiM4YTAwMTVcIixcIiNlMzAyMjRcIixcIiM4NTcyNWZcIixcIiNmYWUxYzBcIl0sW1wiI2ZkZWZiMFwiLFwiI2U3YThiMVwiLFwiI2I5OThiM1wiLFwiIzc3Nzc5ZFwiLFwiIzQ3NzFhM1wiXSxbXCIjNDczMzM0XCIsXCIjYjNjOGE3XCIsXCIjZmZlYmI5XCIsXCIjZTM1MzZjXCIsXCIjZGExYTI5XCJdLFtcIiNmYmI0OThcIixcIiNmOGM2ODFcIixcIiNiZWM0N2VcIixcIiM5YmI3OGZcIixcIiM5ODkwOGRcIl0sW1wiI2RhZTVhYlwiLFwiI2U5YTM4NVwiLFwiI2ZhMTU0YlwiLFwiIzg3MzEzZlwiLFwiIzYwNGU0OFwiXSxbXCIjOWQ5MzgyXCIsXCIjZmZjMWIyXCIsXCIjZmZkYmM4XCIsXCIjZmZmNmM3XCIsXCIjZGNkN2MyXCJdLFtcIiNjZGIyOGFcIixcIiNmOWY0ZTNcIixcIiNkNGRkYjFcIixcIiNiMWJhOGVcIixcIiM3YTY0NDhcIl0sW1wiI2ZmNTQ4ZlwiLFwiIzkwNjFjMlwiLFwiI2JlODBmZlwiLFwiIzYzZDNmZlwiLFwiIzAyNzc5ZVwiXSxbXCIjMjEwMjEwXCIsXCIjZWUyODUzXCIsXCIjMmIwMjE1XCIsXCIjOGYyZjQ1XCIsXCIjZDI0ZDZjXCJdLFtcIiMzODM5MzlcIixcIiMxNDljNjhcIixcIiMzOGM5NThcIixcIiNhZWU2MzdcIixcIiNmZmZlZGJcIl0sW1wiI2JmZTBjMFwiLFwiIzE2MDkyMVwiLFwiI2YwNmU3NVwiLFwiI2YyYWY2MFwiLFwiI2QwZDI2ZlwiXSxbXCIjM2IyMzRhXCIsXCIjNTIzOTYxXCIsXCIjYmFhZmM0XCIsXCIjYzNiYmM5XCIsXCIjZDRjN2JmXCJdLFtcIiNjOTVjN2FcIixcIiNkZTkxNTNcIixcIiNkNmQ2NDRcIixcIiNkY2ViYWZcIixcIiMxNDg4OGJcIl0sW1wiI2ZmZmZlYVwiLFwiI2E3OTVhNVwiLFwiIzdhOTU5ZVwiLFwiIzQyNGU1ZVwiLFwiIzNiMmI0NlwiXSxbXCIjYWRkZmQzXCIsXCIjZWFlM2QwXCIsXCIjZGJjNGI2XCIsXCIjZmZhNWFhXCIsXCIjZWZkNWM0XCJdLFtcIiNmMGMwYThcIixcIiNmMGQ4YThcIixcIiNhOGMwOTBcIixcIiM3ODkwOTBcIixcIiM3ODc4NzhcIl0sW1wiI2YwZjBmMFwiLFwiI2Q4ZDhkOFwiLFwiI2MwYzBhOFwiLFwiIzYwNDg0OFwiLFwiIzQ4NDg0OFwiXSxbXCIjMDAwMDAwXCIsXCIjMTY5M2E1XCIsXCIjZDhkOGMwXCIsXCIjZjBmMGQ4XCIsXCIjZmZmZmZmXCJdLFtcIiNmZjFkNDRcIixcIiNmYmViYWZcIixcIiM3NGJmOWRcIixcIiM1NmEyOTJcIixcIiMxYzgwODBcIl0sW1wiI2FlMGMzZVwiLFwiI2FmY2NhOFwiLFwiI2Y1ZWVjM1wiLFwiI2M3YjI5OVwiLFwiIzMzMjExY1wiXSxbXCIjZmY4NDgyXCIsXCIjZmZiMjk0XCIsXCIjZjhkOGE1XCIsXCIjOTFiZTk1XCIsXCIjNjM1YTQ5XCJdLFtcIiMwMDAwMDBcIixcIiM4ZjE0MTRcIixcIiNlNTBlMGVcIixcIiNmMzQ1MGZcIixcIiNmY2FjMDNcIl0sW1wiI2E4ODkxNFwiLFwiIzkxYTU2NlwiLFwiI2JlZDA4NFwiLFwiI2U5ZTE5OVwiLFwiI2ZhZWRjYVwiXSxbXCIjZWRkYmM0XCIsXCIjYTNjOWE3XCIsXCIjZmZiMzUzXCIsXCIjZmY2ZTRhXCIsXCIjNWM1MjU5XCJdLFtcIiM0MTMyNDlcIixcIiNjY2M1OTFcIixcIiNlMmIyNGNcIixcIiNlYjc4M2ZcIixcIiNmZjQyNmFcIl0sW1wiIzM3MTkzYlwiLFwiI2U3NWE3YVwiLFwiI2Y1OTI3NVwiLFwiI2Y1YzI3M1wiLFwiI2FlYjM5NVwiXSxbXCIjODgwNjA2XCIsXCIjZDUzZDBjXCIsXCIjZmY4MjA3XCIsXCIjMjMxZDFlXCIsXCIjZmNmY2ZjXCJdLFtcIiNiYWQzYzZcIixcIiNmOWQ5YWNcIixcIiNmY2E0ODNcIixcIiNmMTg4ODZcIixcIiM3YjcwNjZcIl0sW1wiI2U4ZDdhOVwiLFwiIzhlYWE5NFwiLFwiIzZiNjY2ZFwiLFwiIzZjMzc1MVwiLFwiIzUyMjIzY1wiXSxbXCIjZTZlNmU2XCIsXCIjYWFlNmQ5XCIsXCIjYzhjYmMxXCIsXCIjZTZiMGFhXCIsXCIjYTFhMWExXCJdLFtcIiMzYjNmNDlcIixcIiNmZGZhZWJcIixcIiNmYWVkZGZcIixcIiNmM2M2YjlcIixcIiNmN2EyOWVcIl0sW1wiIzM5NDczNlwiLFwiIzY5NmI0NlwiLFwiI2I5OTU1NVwiLFwiI2E4NDYyZFwiLFwiIzVjNTg0Y1wiXSxbXCIjZjIzZTAyXCIsXCIjZmVmNWM4XCIsXCIjMDA5ODhkXCIsXCIjMmM2Yjc0XCIsXCIjMDEzNzUwXCJdLFtcIiNmMDVjNTRcIixcIiNhMTc0NTdcIixcIiM1YzczNWVcIixcIiMzZDYxNWJcIixcIiM0MzQyNDdcIl0sW1wiI2NjZTRkMVwiLFwiI2QyZTFhN1wiLFwiI2Q4ZGU3ZFwiLFwiI2RlZGI1M1wiLFwiI2U0ZDgyOVwiXSxbXCIjYzVmN2YwXCIsXCIjYTljMmM5XCIsXCIjOGU4Y2EzXCIsXCIjNzI1NzdjXCIsXCIjNTYyMTU1XCJdLFtcIiNmY2JmNmJcIixcIiNhOWFkOTRcIixcIiM0MjMwMmVcIixcIiNmNmRhYWJcIixcIiNkYWJkN2JcIl0sW1wiIzQ4NDg0OFwiLFwiIzAwNjQ2NVwiLFwiIzBmOTI4Y1wiLFwiIzAwYzlkMlwiLFwiI2JlZWUzYlwiXSxbXCIjZTBkYTk2XCIsXCIjYmFkZGEzXCIsXCIjOTRlMGIwXCIsXCIjYTZiNWFlXCIsXCIjYjg4YmFkXCJdLFtcIiNlMWM3OGNcIixcIiNlZGEwMTFcIixcIiNkYjY1MTZcIixcIiM3YTY5NDlcIixcIiNhZGFkOGVcIl0sW1wiI2ViNDQ1YlwiLFwiI2Y1OTM4YlwiLFwiI2YwY2RhYlwiLFwiI2YxZTdjNVwiLFwiI2I2ZDRiYlwiXSxbXCIjYzBkODhjXCIsXCIjZjdhNDcyXCIsXCIjZjA3ODc3XCIsXCIjZmEyYTNhXCIsXCIjMGE1YzVhXCJdLFtcIiNkMGNmNzVcIixcIiNmODc2NGVcIixcIiNkYTI2NDRcIixcIiM5MDA0NGFcIixcIiM0NDBhMmFcIl0sW1wiI2U2NTQ2YlwiLFwiI2RhOGY3MlwiLFwiI2ZmZTc5MlwiLFwiI2M5ZGFhNFwiLFwiIzhhY2JiNVwiXSxbXCIjZjhmNGM0XCIsXCIjZDVlMGI1XCIsXCIjYTVjM2E3XCIsXCIjNmQ4Yjg5XCIsXCIjNDc2NjdiXCJdLFtcIiMzZTM0MzNcIixcIiNmMDdmODNcIixcIiNiMjlhNzhcIixcIiM5ZWFmODNcIixcIiM3NWE0ODBcIl0sW1wiI2M1Yjg5ZlwiLFwiI2ZlZmZkNFwiLFwiIzllMmQ0YVwiLFwiIzQ1MGIxZVwiLFwiIzIxMDAwZlwiXSxbXCIjNWUxZjI4XCIsXCIjOGEyZjJlXCIsXCIjYWU1NTQzXCIsXCIjZjdiYjc1XCIsXCIjODM3NjRjXCJdLFtcIiNlYjdmN2ZcIixcIiNlYjlhN2ZcIixcIiNlYmI1N2ZcIixcIiNlYmQwN2ZcIixcIiNlYmViN2ZcIl0sW1wiI2ZjYmY2YlwiLFwiI2U1ODYzNFwiLFwiIzY1N2EzOFwiLFwiI2FmYWI1MFwiLFwiI2E5Y2NiOVwiXSxbXCIjY2VlMWQ4XCIsXCIjZjZlZWUwXCIsXCIjZmRhNjY0XCIsXCIjZjA0ODQyXCIsXCIjODM1NjNmXCJdLFtcIiNlMGQxZWRcIixcIiNmMGI5Y2ZcIixcIiNlNjNjODBcIixcIiNjNzA0NTJcIixcIiM0YjAwNGNcIl0sW1wiIzY4MGExZFwiLFwiIzNmMTcxOVwiLFwiI2ZjZWY5Y1wiLFwiI2U4YjY2NlwiLFwiI2JhMjMzOVwiXSxbXCIjMzQzNjM1XCIsXCIjZDkwMDU3XCIsXCIjZTg4NzAwXCIsXCIjNzdiOGE2XCIsXCIjZmZlMmJhXCJdLFtcIiMxODViNjNcIixcIiNjMDI2MWNcIixcIiNiYTQ2MGRcIixcIiNjNTk1MzhcIixcIiM0MDQwNDBcIl0sW1wiI2NiN2NhMlwiLFwiI2VkOWRhMVwiLFwiI2M5ZTVhZlwiLFwiI2RjZWViMVwiLFwiI2ZlZjlmNlwiXSxbXCIjMGQwZjM2XCIsXCIjMjk0MzgwXCIsXCIjNjlkMmNkXCIsXCIjYjlmMWQ2XCIsXCIjZjFmNmNlXCJdLFtcIiNjOWI4YThcIixcIiNmOGFmOGNcIixcIiNhMjRkNTJcIixcIiM1YTMwNDRcIixcIiMzOTFkMzRcIl0sW1wiI2ZhZWZjMlwiLFwiI2E0YWM5ZFwiLFwiI2EyNzg3OVwiLFwiI2E0NjI2Y1wiLFwiI2YwNWQ3N1wiXSxbXCIjNWIxZDk5XCIsXCIjMDA3NGI0XCIsXCIjMDBiMzRjXCIsXCIjZmZkNDFmXCIsXCIjZmM2ZTNkXCJdLFtcIiMwNzllYTZcIixcIiMxZTBjNDJcIixcIiNmMDA3N2JcIixcIiNmNWJlNThcIixcIiNlM2UwYjNcIl0sW1wiI2U0NmQyOVwiLFwiI2JhNGM1N1wiLFwiIzRlM2EzYlwiLFwiI2E1OTU3MVwiLFwiI2QwYmM4N1wiXSxbXCIjZjJlYWJjXCIsXCIjNTQ3MzZlXCIsXCIjMTk0NzU2XCIsXCIjMDgwMDAwXCIsXCIjZmYzYjU4XCJdLFtcIiNlMmQ5ZGJcIixcIiNmMmU1ZjlcIixcIiNkOWUxZGZcIixcIiNmZjhhODRcIixcIiNmZTY3NjNcIl0sW1wiI2YzZDU5N1wiLFwiI2I2ZDg5Y1wiLFwiIzkyY2NiNlwiLFwiI2Y4Nzg4N1wiLFwiIzllNmI3Y1wiXSxbXCIjZTZhYzg0XCIsXCIjYWQ5OTc4XCIsXCIjNjE5MTc3XCIsXCIjMTYxNjE4XCIsXCIjNTk0YzJhXCJdLFtcIiNlZWU1ZDZcIixcIiM4ZjAwMDZcIixcIiMwMDAwMDBcIixcIiM5MzkxODVcIixcIiM5OGE1YWRcIl0sW1wiI2JmOWY4OFwiLFwiI2U4YzhhMVwiLFwiI2ZjZTRiZVwiLFwiI2Y2YTY4ZFwiLFwiI2Y5NjE1M1wiXSxbXCIjZmZiZDg3XCIsXCIjZmZkNzkxXCIsXCIjZjdlOGE2XCIsXCIjZDllOGFlXCIsXCIjYmZlM2MwXCJdLFtcIiNlNGU2YzlcIixcIiNlNmRhYzZcIixcIiNkNmMzYjlcIixcIiNjMmI0OGFcIixcIiNiMzc4ODNcIl0sW1wiIzJiMjgyM1wiLFwiIzhmYTY5MVwiLFwiI2Q0Y2VhYVwiLFwiI2Y5ZmFkY1wiLFwiI2NjMzkxN1wiXSxbXCIjZTg0ZDViXCIsXCIjZWFlMmNmXCIsXCIjYjRjY2I5XCIsXCIjMjY5NzlmXCIsXCIjM2IzYjNiXCJdLFtcIiM0ZDQyNTBcIixcIiNiNjZlNmZcIixcIiNjZjg4ODRcIixcIiNlNmE5NzJcIixcIiNmNmQxNjlcIl0sW1wiIzExNjY1ZlwiLFwiIzU5OTQ3NlwiLFwiI2U0ZDY3M1wiLFwiI2ViNjI0ZlwiLFwiI2FjMTUxY1wiXSxbXCIjNWM0MTUyXCIsXCIjYjQ1ODVkXCIsXCIjZDk3Zjc2XCIsXCIjZjdkMGE5XCIsXCIjYTFjMGFlXCJdLFtcIiM1ODcwNmRcIixcIiM0YjU3NTdcIixcIiM3YzhhNmVcIixcIiNiMGIwODdcIixcIiNlM2UzZDFcIl0sW1wiI2Y0ZTFiOFwiLFwiIzllYzdiN1wiLFwiI2FjYWE5YlwiLFwiI2E1ODI2ZVwiLFwiIzdlNTE0YlwiXSxbXCIjZWRlNWNlXCIsXCIjZmRmNmU2XCIsXCIjZmZlMmJhXCIsXCIjZjRiNThhXCIsXCIjZjdhMTY4XCJdLFtcIiNmZjIxMjFcIixcIiNmZDlhNDJcIixcIiNjMmZjNjNcIixcIiNiY2Y3ZWZcIixcIiNkN2VlZmFcIl0sW1wiIzgwNjgzNVwiLFwiI2Y3ZjFjZFwiLFwiIzZiOWU4YlwiLFwiI2E2MjEyMVwiLFwiIzEzMGQwZFwiXSxbXCIjZDlkNzY2XCIsXCIjYzVjMzc2XCIsXCIjYTQ4Yjg2XCIsXCIjODQ1NjdhXCIsXCIjNjQzMjYzXCJdLFtcIiM2YzM5NDhcIixcIiNiYTVmNmVcIixcIiNjYzhjODJcIixcIiNkZWQ3ODdcIixcIiNmOWVhYmZcIl0sW1wiIzg1NWYzMFwiLFwiIzllYzg5YVwiLFwiI2VhYmE2OFwiLFwiI2ZmNTI0OFwiLFwiI2Y2ZmZiM1wiXSxbXCIjZDNmN2U5XCIsXCIjZmNmM2QyXCIsXCIjZmJjZjg2XCIsXCIjZmE3ZjQ2XCIsXCIjZGQ0NTM4XCJdLFtcIiNjM2U2ZDRcIixcIiNmNGYwZTVcIixcIiNlMGM0YWVcIixcIiNlMTkxOGVcIixcIiNlMTVlNmVcIl0sW1wiI2Q5MmQ3YVwiLFwiI2NkNDQ3MlwiLFwiI2MyNWM2YVwiLFwiI2I3NzQ2M1wiLFwiI2FjOGM1ZVwiXV0iLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgd2lkdGggPSAyNTY7Ly8gZWFjaCBSQzQgb3V0cHV0IGlzIDAgPD0geCA8IDI1NlxyXG52YXIgY2h1bmtzID0gNjsvLyBhdCBsZWFzdCBzaXggUkM0IG91dHB1dHMgZm9yIGVhY2ggZG91YmxlXHJcbnZhciBkaWdpdHMgPSA1MjsvLyB0aGVyZSBhcmUgNTIgc2lnbmlmaWNhbnQgZGlnaXRzIGluIGEgZG91YmxlXHJcbnZhciBwb29sID0gW107Ly8gcG9vbDogZW50cm9weSBwb29sIHN0YXJ0cyBlbXB0eVxyXG52YXIgR0xPQkFMID0gdHlwZW9mIGdsb2JhbCA9PT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiBnbG9iYWw7XHJcblxyXG4vL1xyXG4vLyBUaGUgZm9sbG93aW5nIGNvbnN0YW50cyBhcmUgcmVsYXRlZCB0byBJRUVFIDc1NCBsaW1pdHMuXHJcbi8vXHJcbnZhciBzdGFydGRlbm9tID0gTWF0aC5wb3cod2lkdGgsIGNodW5rcyksXHJcbiAgICBzaWduaWZpY2FuY2UgPSBNYXRoLnBvdygyLCBkaWdpdHMpLFxyXG4gICAgb3ZlcmZsb3cgPSBzaWduaWZpY2FuY2UgKiAyLFxyXG4gICAgbWFzayA9IHdpZHRoIC0gMTtcclxuXHJcblxyXG52YXIgb2xkUmFuZG9tID0gTWF0aC5yYW5kb207XHJcblxyXG4vL1xyXG4vLyBzZWVkcmFuZG9tKClcclxuLy8gVGhpcyBpcyB0aGUgc2VlZHJhbmRvbSBmdW5jdGlvbiBkZXNjcmliZWQgYWJvdmUuXHJcbi8vXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2VlZCwgb3B0aW9ucykge1xyXG4gIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZ2xvYmFsID09PSB0cnVlKSB7XHJcbiAgICBvcHRpb25zLmdsb2JhbCA9IGZhbHNlO1xyXG4gICAgTWF0aC5yYW5kb20gPSBtb2R1bGUuZXhwb3J0cyhzZWVkLCBvcHRpb25zKTtcclxuICAgIG9wdGlvbnMuZ2xvYmFsID0gdHJ1ZTtcclxuICAgIHJldHVybiBNYXRoLnJhbmRvbTtcclxuICB9XHJcbiAgdmFyIHVzZV9lbnRyb3B5ID0gKG9wdGlvbnMgJiYgb3B0aW9ucy5lbnRyb3B5KSB8fCBmYWxzZTtcclxuICB2YXIga2V5ID0gW107XHJcblxyXG4gIC8vIEZsYXR0ZW4gdGhlIHNlZWQgc3RyaW5nIG9yIGJ1aWxkIG9uZSBmcm9tIGxvY2FsIGVudHJvcHkgaWYgbmVlZGVkLlxyXG4gIHZhciBzaG9ydHNlZWQgPSBtaXhrZXkoZmxhdHRlbihcclxuICAgIHVzZV9lbnRyb3B5ID8gW3NlZWQsIHRvc3RyaW5nKHBvb2wpXSA6XHJcbiAgICAwIGluIGFyZ3VtZW50cyA/IHNlZWQgOiBhdXRvc2VlZCgpLCAzKSwga2V5KTtcclxuXHJcbiAgLy8gVXNlIHRoZSBzZWVkIHRvIGluaXRpYWxpemUgYW4gQVJDNCBnZW5lcmF0b3IuXHJcbiAgdmFyIGFyYzQgPSBuZXcgQVJDNChrZXkpO1xyXG5cclxuICAvLyBNaXggdGhlIHJhbmRvbW5lc3MgaW50byBhY2N1bXVsYXRlZCBlbnRyb3B5LlxyXG4gIG1peGtleSh0b3N0cmluZyhhcmM0LlMpLCBwb29sKTtcclxuXHJcbiAgLy8gT3ZlcnJpZGUgTWF0aC5yYW5kb21cclxuXHJcbiAgLy8gVGhpcyBmdW5jdGlvbiByZXR1cm5zIGEgcmFuZG9tIGRvdWJsZSBpbiBbMCwgMSkgdGhhdCBjb250YWluc1xyXG4gIC8vIHJhbmRvbW5lc3MgaW4gZXZlcnkgYml0IG9mIHRoZSBtYW50aXNzYSBvZiB0aGUgSUVFRSA3NTQgdmFsdWUuXHJcblxyXG4gIHJldHVybiBmdW5jdGlvbigpIHsgICAgICAgICAvLyBDbG9zdXJlIHRvIHJldHVybiBhIHJhbmRvbSBkb3VibGU6XHJcbiAgICB2YXIgbiA9IGFyYzQuZyhjaHVua3MpLCAgICAgICAgICAgICAvLyBTdGFydCB3aXRoIGEgbnVtZXJhdG9yIG4gPCAyIF4gNDhcclxuICAgICAgICBkID0gc3RhcnRkZW5vbSwgICAgICAgICAgICAgICAgIC8vICAgYW5kIGRlbm9taW5hdG9yIGQgPSAyIF4gNDguXHJcbiAgICAgICAgeCA9IDA7ICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGFuZCBubyAnZXh0cmEgbGFzdCBieXRlJy5cclxuICAgIHdoaWxlIChuIDwgc2lnbmlmaWNhbmNlKSB7ICAgICAgICAgIC8vIEZpbGwgdXAgYWxsIHNpZ25pZmljYW50IGRpZ2l0cyBieVxyXG4gICAgICBuID0gKG4gKyB4KSAqIHdpZHRoOyAgICAgICAgICAgICAgLy8gICBzaGlmdGluZyBudW1lcmF0b3IgYW5kXHJcbiAgICAgIGQgKj0gd2lkdGg7ICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGRlbm9taW5hdG9yIGFuZCBnZW5lcmF0aW5nIGFcclxuICAgICAgeCA9IGFyYzQuZygxKTsgICAgICAgICAgICAgICAgICAgIC8vICAgbmV3IGxlYXN0LXNpZ25pZmljYW50LWJ5dGUuXHJcbiAgICB9XHJcbiAgICB3aGlsZSAobiA+PSBvdmVyZmxvdykgeyAgICAgICAgICAgICAvLyBUbyBhdm9pZCByb3VuZGluZyB1cCwgYmVmb3JlIGFkZGluZ1xyXG4gICAgICBuIC89IDI7ICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBsYXN0IGJ5dGUsIHNoaWZ0IGV2ZXJ5dGhpbmdcclxuICAgICAgZCAvPSAyOyAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgcmlnaHQgdXNpbmcgaW50ZWdlciBNYXRoIHVudGlsXHJcbiAgICAgIHggPj4+PSAxOyAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIHdlIGhhdmUgZXhhY3RseSB0aGUgZGVzaXJlZCBiaXRzLlxyXG4gICAgfVxyXG4gICAgcmV0dXJuIChuICsgeCkgLyBkOyAgICAgICAgICAgICAgICAgLy8gRm9ybSB0aGUgbnVtYmVyIHdpdGhpbiBbMCwgMSkuXHJcbiAgfTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzLnJlc2V0R2xvYmFsID0gZnVuY3Rpb24gKCkge1xyXG4gIE1hdGgucmFuZG9tID0gb2xkUmFuZG9tO1xyXG59O1xyXG5cclxuLy9cclxuLy8gQVJDNFxyXG4vL1xyXG4vLyBBbiBBUkM0IGltcGxlbWVudGF0aW9uLiAgVGhlIGNvbnN0cnVjdG9yIHRha2VzIGEga2V5IGluIHRoZSBmb3JtIG9mXHJcbi8vIGFuIGFycmF5IG9mIGF0IG1vc3QgKHdpZHRoKSBpbnRlZ2VycyB0aGF0IHNob3VsZCBiZSAwIDw9IHggPCAod2lkdGgpLlxyXG4vL1xyXG4vLyBUaGUgZyhjb3VudCkgbWV0aG9kIHJldHVybnMgYSBwc2V1ZG9yYW5kb20gaW50ZWdlciB0aGF0IGNvbmNhdGVuYXRlc1xyXG4vLyB0aGUgbmV4dCAoY291bnQpIG91dHB1dHMgZnJvbSBBUkM0LiAgSXRzIHJldHVybiB2YWx1ZSBpcyBhIG51bWJlciB4XHJcbi8vIHRoYXQgaXMgaW4gdGhlIHJhbmdlIDAgPD0geCA8ICh3aWR0aCBeIGNvdW50KS5cclxuLy9cclxuLyoqIEBjb25zdHJ1Y3RvciAqL1xyXG5mdW5jdGlvbiBBUkM0KGtleSkge1xyXG4gIHZhciB0LCBrZXlsZW4gPSBrZXkubGVuZ3RoLFxyXG4gICAgICBtZSA9IHRoaXMsIGkgPSAwLCBqID0gbWUuaSA9IG1lLmogPSAwLCBzID0gbWUuUyA9IFtdO1xyXG5cclxuICAvLyBUaGUgZW1wdHkga2V5IFtdIGlzIHRyZWF0ZWQgYXMgWzBdLlxyXG4gIGlmICgha2V5bGVuKSB7IGtleSA9IFtrZXlsZW4rK107IH1cclxuXHJcbiAgLy8gU2V0IHVwIFMgdXNpbmcgdGhlIHN0YW5kYXJkIGtleSBzY2hlZHVsaW5nIGFsZ29yaXRobS5cclxuICB3aGlsZSAoaSA8IHdpZHRoKSB7XHJcbiAgICBzW2ldID0gaSsrO1xyXG4gIH1cclxuICBmb3IgKGkgPSAwOyBpIDwgd2lkdGg7IGkrKykge1xyXG4gICAgc1tpXSA9IHNbaiA9IG1hc2sgJiAoaiArIGtleVtpICUga2V5bGVuXSArICh0ID0gc1tpXSkpXTtcclxuICAgIHNbal0gPSB0O1xyXG4gIH1cclxuXHJcbiAgLy8gVGhlIFwiZ1wiIG1ldGhvZCByZXR1cm5zIHRoZSBuZXh0IChjb3VudCkgb3V0cHV0cyBhcyBvbmUgbnVtYmVyLlxyXG4gIChtZS5nID0gZnVuY3Rpb24oY291bnQpIHtcclxuICAgIC8vIFVzaW5nIGluc3RhbmNlIG1lbWJlcnMgaW5zdGVhZCBvZiBjbG9zdXJlIHN0YXRlIG5lYXJseSBkb3VibGVzIHNwZWVkLlxyXG4gICAgdmFyIHQsIHIgPSAwLFxyXG4gICAgICAgIGkgPSBtZS5pLCBqID0gbWUuaiwgcyA9IG1lLlM7XHJcbiAgICB3aGlsZSAoY291bnQtLSkge1xyXG4gICAgICB0ID0gc1tpID0gbWFzayAmIChpICsgMSldO1xyXG4gICAgICByID0gciAqIHdpZHRoICsgc1ttYXNrICYgKChzW2ldID0gc1tqID0gbWFzayAmIChqICsgdCldKSArIChzW2pdID0gdCkpXTtcclxuICAgIH1cclxuICAgIG1lLmkgPSBpOyBtZS5qID0gajtcclxuICAgIHJldHVybiByO1xyXG4gICAgLy8gRm9yIHJvYnVzdCB1bnByZWRpY3RhYmlsaXR5IGRpc2NhcmQgYW4gaW5pdGlhbCBiYXRjaCBvZiB2YWx1ZXMuXHJcbiAgICAvLyBTZWUgaHR0cDovL3d3dy5yc2EuY29tL3JzYWxhYnMvbm9kZS5hc3A/aWQ9MjAwOVxyXG4gIH0pKHdpZHRoKTtcclxufVxyXG5cclxuLy9cclxuLy8gZmxhdHRlbigpXHJcbi8vIENvbnZlcnRzIGFuIG9iamVjdCB0cmVlIHRvIG5lc3RlZCBhcnJheXMgb2Ygc3RyaW5ncy5cclxuLy9cclxuZnVuY3Rpb24gZmxhdHRlbihvYmosIGRlcHRoKSB7XHJcbiAgdmFyIHJlc3VsdCA9IFtdLCB0eXAgPSAodHlwZW9mIG9iailbMF0sIHByb3A7XHJcbiAgaWYgKGRlcHRoICYmIHR5cCA9PSAnbycpIHtcclxuICAgIGZvciAocHJvcCBpbiBvYmopIHtcclxuICAgICAgdHJ5IHsgcmVzdWx0LnB1c2goZmxhdHRlbihvYmpbcHJvcF0sIGRlcHRoIC0gMSkpOyB9IGNhdGNoIChlKSB7fVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gKHJlc3VsdC5sZW5ndGggPyByZXN1bHQgOiB0eXAgPT0gJ3MnID8gb2JqIDogb2JqICsgJ1xcMCcpO1xyXG59XHJcblxyXG4vL1xyXG4vLyBtaXhrZXkoKVxyXG4vLyBNaXhlcyBhIHN0cmluZyBzZWVkIGludG8gYSBrZXkgdGhhdCBpcyBhbiBhcnJheSBvZiBpbnRlZ2VycywgYW5kXHJcbi8vIHJldHVybnMgYSBzaG9ydGVuZWQgc3RyaW5nIHNlZWQgdGhhdCBpcyBlcXVpdmFsZW50IHRvIHRoZSByZXN1bHQga2V5LlxyXG4vL1xyXG5mdW5jdGlvbiBtaXhrZXkoc2VlZCwga2V5KSB7XHJcbiAgdmFyIHN0cmluZ3NlZWQgPSBzZWVkICsgJycsIHNtZWFyLCBqID0gMDtcclxuICB3aGlsZSAoaiA8IHN0cmluZ3NlZWQubGVuZ3RoKSB7XHJcbiAgICBrZXlbbWFzayAmIGpdID1cclxuICAgICAgbWFzayAmICgoc21lYXIgXj0ga2V5W21hc2sgJiBqXSAqIDE5KSArIHN0cmluZ3NlZWQuY2hhckNvZGVBdChqKyspKTtcclxuICB9XHJcbiAgcmV0dXJuIHRvc3RyaW5nKGtleSk7XHJcbn1cclxuXHJcbi8vXHJcbi8vIGF1dG9zZWVkKClcclxuLy8gUmV0dXJucyBhbiBvYmplY3QgZm9yIGF1dG9zZWVkaW5nLCB1c2luZyB3aW5kb3cuY3J5cHRvIGlmIGF2YWlsYWJsZS5cclxuLy9cclxuLyoqIEBwYXJhbSB7VWludDhBcnJheT19IHNlZWQgKi9cclxuZnVuY3Rpb24gYXV0b3NlZWQoc2VlZCkge1xyXG4gIHRyeSB7XHJcbiAgICBHTE9CQUwuY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhzZWVkID0gbmV3IFVpbnQ4QXJyYXkod2lkdGgpKTtcclxuICAgIHJldHVybiB0b3N0cmluZyhzZWVkKTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXR1cm4gWytuZXcgRGF0ZSwgR0xPQkFMLCBHTE9CQUwubmF2aWdhdG9yICYmIEdMT0JBTC5uYXZpZ2F0b3IucGx1Z2lucyxcclxuICAgICAgICAgICAgR0xPQkFMLnNjcmVlbiwgdG9zdHJpbmcocG9vbCldO1xyXG4gIH1cclxufVxyXG5cclxuLy9cclxuLy8gdG9zdHJpbmcoKVxyXG4vLyBDb252ZXJ0cyBhbiBhcnJheSBvZiBjaGFyY29kZXMgdG8gYSBzdHJpbmdcclxuLy9cclxuZnVuY3Rpb24gdG9zdHJpbmcoYSkge1xyXG4gIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KDAsIGEpO1xyXG59XHJcblxyXG4vL1xyXG4vLyBXaGVuIHNlZWRyYW5kb20uanMgaXMgbG9hZGVkLCB3ZSBpbW1lZGlhdGVseSBtaXggYSBmZXcgYml0c1xyXG4vLyBmcm9tIHRoZSBidWlsdC1pbiBSTkcgaW50byB0aGUgZW50cm9weSBwb29sLiAgQmVjYXVzZSB3ZSBkb1xyXG4vLyBub3Qgd2FudCB0byBpbnRlZmVyZSB3aXRoIGRldGVybWluc3RpYyBQUk5HIHN0YXRlIGxhdGVyLFxyXG4vLyBzZWVkcmFuZG9tIHdpbGwgbm90IGNhbGwgTWF0aC5yYW5kb20gb24gaXRzIG93biBhZ2FpbiBhZnRlclxyXG4vLyBpbml0aWFsaXphdGlvbi5cclxuLy9cclxubWl4a2V5KE1hdGgucmFuZG9tKCksIHBvb2wpO1xyXG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpc0FycmF5aXNoID0gcmVxdWlyZSgnaXMtYXJyYXlpc2gnKTtcblxudmFyIGNvbmNhdCA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQ7XG52YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG5cbnZhciBzd2l6emxlID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzd2l6emxlKGFyZ3MpIHtcblx0dmFyIHJlc3VsdHMgPSBbXTtcblxuXHRmb3IgKHZhciBpID0gMCwgbGVuID0gYXJncy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuXHRcdHZhciBhcmcgPSBhcmdzW2ldO1xuXG5cdFx0aWYgKGlzQXJyYXlpc2goYXJnKSkge1xuXHRcdFx0Ly8gaHR0cDovL2pzcGVyZi5jb20vamF2YXNjcmlwdC1hcnJheS1jb25jYXQtdnMtcHVzaC85OFxuXHRcdFx0cmVzdWx0cyA9IGNvbmNhdC5jYWxsKHJlc3VsdHMsIHNsaWNlLmNhbGwoYXJnKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlc3VsdHMucHVzaChhcmcpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiByZXN1bHRzO1xufTtcblxuc3dpenpsZS53cmFwID0gZnVuY3Rpb24gKGZuKSB7XG5cdHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIGZuKHN3aXp6bGUoYXJndW1lbnRzKSk7XG5cdH07XG59O1xuIiwiLypcbiAqIEEgZmFzdCBqYXZhc2NyaXB0IGltcGxlbWVudGF0aW9uIG9mIHNpbXBsZXggbm9pc2UgYnkgSm9uYXMgV2FnbmVyXG5cbkJhc2VkIG9uIGEgc3BlZWQtaW1wcm92ZWQgc2ltcGxleCBub2lzZSBhbGdvcml0aG0gZm9yIDJELCAzRCBhbmQgNEQgaW4gSmF2YS5cbldoaWNoIGlzIGJhc2VkIG9uIGV4YW1wbGUgY29kZSBieSBTdGVmYW4gR3VzdGF2c29uIChzdGVndUBpdG4ubGl1LnNlKS5cbldpdGggT3B0aW1pc2F0aW9ucyBieSBQZXRlciBFYXN0bWFuIChwZWFzdG1hbkBkcml6emxlLnN0YW5mb3JkLmVkdSkuXG5CZXR0ZXIgcmFuayBvcmRlcmluZyBtZXRob2QgYnkgU3RlZmFuIEd1c3RhdnNvbiBpbiAyMDEyLlxuXG5cbiBDb3B5cmlnaHQgKGMpIDIwMTggSm9uYXMgV2FnbmVyXG5cbiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiBTT0ZUV0FSRS5cbiAqL1xuKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyIEYyID0gMC41ICogKE1hdGguc3FydCgzLjApIC0gMS4wKTtcbiAgdmFyIEcyID0gKDMuMCAtIE1hdGguc3FydCgzLjApKSAvIDYuMDtcbiAgdmFyIEYzID0gMS4wIC8gMy4wO1xuICB2YXIgRzMgPSAxLjAgLyA2LjA7XG4gIHZhciBGNCA9IChNYXRoLnNxcnQoNS4wKSAtIDEuMCkgLyA0LjA7XG4gIHZhciBHNCA9ICg1LjAgLSBNYXRoLnNxcnQoNS4wKSkgLyAyMC4wO1xuXG4gIGZ1bmN0aW9uIFNpbXBsZXhOb2lzZShyYW5kb21PclNlZWQpIHtcbiAgICB2YXIgcmFuZG9tO1xuICAgIGlmICh0eXBlb2YgcmFuZG9tT3JTZWVkID09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJhbmRvbSA9IHJhbmRvbU9yU2VlZDtcbiAgICB9XG4gICAgZWxzZSBpZiAocmFuZG9tT3JTZWVkKSB7XG4gICAgICByYW5kb20gPSBhbGVhKHJhbmRvbU9yU2VlZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJhbmRvbSA9IE1hdGgucmFuZG9tO1xuICAgIH1cbiAgICB0aGlzLnAgPSBidWlsZFBlcm11dGF0aW9uVGFibGUocmFuZG9tKTtcbiAgICB0aGlzLnBlcm0gPSBuZXcgVWludDhBcnJheSg1MTIpO1xuICAgIHRoaXMucGVybU1vZDEyID0gbmV3IFVpbnQ4QXJyYXkoNTEyKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDUxMjsgaSsrKSB7XG4gICAgICB0aGlzLnBlcm1baV0gPSB0aGlzLnBbaSAmIDI1NV07XG4gICAgICB0aGlzLnBlcm1Nb2QxMltpXSA9IHRoaXMucGVybVtpXSAlIDEyO1xuICAgIH1cblxuICB9XG4gIFNpbXBsZXhOb2lzZS5wcm90b3R5cGUgPSB7XG4gICAgZ3JhZDM6IG5ldyBGbG9hdDMyQXJyYXkoWzEsIDEsIDAsXG4gICAgICAtMSwgMSwgMCxcbiAgICAgIDEsIC0xLCAwLFxuXG4gICAgICAtMSwgLTEsIDAsXG4gICAgICAxLCAwLCAxLFxuICAgICAgLTEsIDAsIDEsXG5cbiAgICAgIDEsIDAsIC0xLFxuICAgICAgLTEsIDAsIC0xLFxuICAgICAgMCwgMSwgMSxcblxuICAgICAgMCwgLTEsIDEsXG4gICAgICAwLCAxLCAtMSxcbiAgICAgIDAsIC0xLCAtMV0pLFxuICAgIGdyYWQ0OiBuZXcgRmxvYXQzMkFycmF5KFswLCAxLCAxLCAxLCAwLCAxLCAxLCAtMSwgMCwgMSwgLTEsIDEsIDAsIDEsIC0xLCAtMSxcbiAgICAgIDAsIC0xLCAxLCAxLCAwLCAtMSwgMSwgLTEsIDAsIC0xLCAtMSwgMSwgMCwgLTEsIC0xLCAtMSxcbiAgICAgIDEsIDAsIDEsIDEsIDEsIDAsIDEsIC0xLCAxLCAwLCAtMSwgMSwgMSwgMCwgLTEsIC0xLFxuICAgICAgLTEsIDAsIDEsIDEsIC0xLCAwLCAxLCAtMSwgLTEsIDAsIC0xLCAxLCAtMSwgMCwgLTEsIC0xLFxuICAgICAgMSwgMSwgMCwgMSwgMSwgMSwgMCwgLTEsIDEsIC0xLCAwLCAxLCAxLCAtMSwgMCwgLTEsXG4gICAgICAtMSwgMSwgMCwgMSwgLTEsIDEsIDAsIC0xLCAtMSwgLTEsIDAsIDEsIC0xLCAtMSwgMCwgLTEsXG4gICAgICAxLCAxLCAxLCAwLCAxLCAxLCAtMSwgMCwgMSwgLTEsIDEsIDAsIDEsIC0xLCAtMSwgMCxcbiAgICAgIC0xLCAxLCAxLCAwLCAtMSwgMSwgLTEsIDAsIC0xLCAtMSwgMSwgMCwgLTEsIC0xLCAtMSwgMF0pLFxuICAgIG5vaXNlMkQ6IGZ1bmN0aW9uKHhpbiwgeWluKSB7XG4gICAgICB2YXIgcGVybU1vZDEyID0gdGhpcy5wZXJtTW9kMTI7XG4gICAgICB2YXIgcGVybSA9IHRoaXMucGVybTtcbiAgICAgIHZhciBncmFkMyA9IHRoaXMuZ3JhZDM7XG4gICAgICB2YXIgbjAgPSAwOyAvLyBOb2lzZSBjb250cmlidXRpb25zIGZyb20gdGhlIHRocmVlIGNvcm5lcnNcbiAgICAgIHZhciBuMSA9IDA7XG4gICAgICB2YXIgbjIgPSAwO1xuICAgICAgLy8gU2tldyB0aGUgaW5wdXQgc3BhY2UgdG8gZGV0ZXJtaW5lIHdoaWNoIHNpbXBsZXggY2VsbCB3ZSdyZSBpblxuICAgICAgdmFyIHMgPSAoeGluICsgeWluKSAqIEYyOyAvLyBIYWlyeSBmYWN0b3IgZm9yIDJEXG4gICAgICB2YXIgaSA9IE1hdGguZmxvb3IoeGluICsgcyk7XG4gICAgICB2YXIgaiA9IE1hdGguZmxvb3IoeWluICsgcyk7XG4gICAgICB2YXIgdCA9IChpICsgaikgKiBHMjtcbiAgICAgIHZhciBYMCA9IGkgLSB0OyAvLyBVbnNrZXcgdGhlIGNlbGwgb3JpZ2luIGJhY2sgdG8gKHgseSkgc3BhY2VcbiAgICAgIHZhciBZMCA9IGogLSB0O1xuICAgICAgdmFyIHgwID0geGluIC0gWDA7IC8vIFRoZSB4LHkgZGlzdGFuY2VzIGZyb20gdGhlIGNlbGwgb3JpZ2luXG4gICAgICB2YXIgeTAgPSB5aW4gLSBZMDtcbiAgICAgIC8vIEZvciB0aGUgMkQgY2FzZSwgdGhlIHNpbXBsZXggc2hhcGUgaXMgYW4gZXF1aWxhdGVyYWwgdHJpYW5nbGUuXG4gICAgICAvLyBEZXRlcm1pbmUgd2hpY2ggc2ltcGxleCB3ZSBhcmUgaW4uXG4gICAgICB2YXIgaTEsIGoxOyAvLyBPZmZzZXRzIGZvciBzZWNvbmQgKG1pZGRsZSkgY29ybmVyIG9mIHNpbXBsZXggaW4gKGksaikgY29vcmRzXG4gICAgICBpZiAoeDAgPiB5MCkge1xuICAgICAgICBpMSA9IDE7XG4gICAgICAgIGoxID0gMDtcbiAgICAgIH0gLy8gbG93ZXIgdHJpYW5nbGUsIFhZIG9yZGVyOiAoMCwwKS0+KDEsMCktPigxLDEpXG4gICAgICBlbHNlIHtcbiAgICAgICAgaTEgPSAwO1xuICAgICAgICBqMSA9IDE7XG4gICAgICB9IC8vIHVwcGVyIHRyaWFuZ2xlLCBZWCBvcmRlcjogKDAsMCktPigwLDEpLT4oMSwxKVxuICAgICAgLy8gQSBzdGVwIG9mICgxLDApIGluIChpLGopIG1lYW5zIGEgc3RlcCBvZiAoMS1jLC1jKSBpbiAoeCx5KSwgYW5kXG4gICAgICAvLyBhIHN0ZXAgb2YgKDAsMSkgaW4gKGksaikgbWVhbnMgYSBzdGVwIG9mICgtYywxLWMpIGluICh4LHkpLCB3aGVyZVxuICAgICAgLy8gYyA9ICgzLXNxcnQoMykpLzZcbiAgICAgIHZhciB4MSA9IHgwIC0gaTEgKyBHMjsgLy8gT2Zmc2V0cyBmb3IgbWlkZGxlIGNvcm5lciBpbiAoeCx5KSB1bnNrZXdlZCBjb29yZHNcbiAgICAgIHZhciB5MSA9IHkwIC0gajEgKyBHMjtcbiAgICAgIHZhciB4MiA9IHgwIC0gMS4wICsgMi4wICogRzI7IC8vIE9mZnNldHMgZm9yIGxhc3QgY29ybmVyIGluICh4LHkpIHVuc2tld2VkIGNvb3Jkc1xuICAgICAgdmFyIHkyID0geTAgLSAxLjAgKyAyLjAgKiBHMjtcbiAgICAgIC8vIFdvcmsgb3V0IHRoZSBoYXNoZWQgZ3JhZGllbnQgaW5kaWNlcyBvZiB0aGUgdGhyZWUgc2ltcGxleCBjb3JuZXJzXG4gICAgICB2YXIgaWkgPSBpICYgMjU1O1xuICAgICAgdmFyIGpqID0gaiAmIDI1NTtcbiAgICAgIC8vIENhbGN1bGF0ZSB0aGUgY29udHJpYnV0aW9uIGZyb20gdGhlIHRocmVlIGNvcm5lcnNcbiAgICAgIHZhciB0MCA9IDAuNSAtIHgwICogeDAgLSB5MCAqIHkwO1xuICAgICAgaWYgKHQwID49IDApIHtcbiAgICAgICAgdmFyIGdpMCA9IHBlcm1Nb2QxMltpaSArIHBlcm1bampdXSAqIDM7XG4gICAgICAgIHQwICo9IHQwO1xuICAgICAgICBuMCA9IHQwICogdDAgKiAoZ3JhZDNbZ2kwXSAqIHgwICsgZ3JhZDNbZ2kwICsgMV0gKiB5MCk7IC8vICh4LHkpIG9mIGdyYWQzIHVzZWQgZm9yIDJEIGdyYWRpZW50XG4gICAgICB9XG4gICAgICB2YXIgdDEgPSAwLjUgLSB4MSAqIHgxIC0geTEgKiB5MTtcbiAgICAgIGlmICh0MSA+PSAwKSB7XG4gICAgICAgIHZhciBnaTEgPSBwZXJtTW9kMTJbaWkgKyBpMSArIHBlcm1bamogKyBqMV1dICogMztcbiAgICAgICAgdDEgKj0gdDE7XG4gICAgICAgIG4xID0gdDEgKiB0MSAqIChncmFkM1tnaTFdICogeDEgKyBncmFkM1tnaTEgKyAxXSAqIHkxKTtcbiAgICAgIH1cbiAgICAgIHZhciB0MiA9IDAuNSAtIHgyICogeDIgLSB5MiAqIHkyO1xuICAgICAgaWYgKHQyID49IDApIHtcbiAgICAgICAgdmFyIGdpMiA9IHBlcm1Nb2QxMltpaSArIDEgKyBwZXJtW2pqICsgMV1dICogMztcbiAgICAgICAgdDIgKj0gdDI7XG4gICAgICAgIG4yID0gdDIgKiB0MiAqIChncmFkM1tnaTJdICogeDIgKyBncmFkM1tnaTIgKyAxXSAqIHkyKTtcbiAgICAgIH1cbiAgICAgIC8vIEFkZCBjb250cmlidXRpb25zIGZyb20gZWFjaCBjb3JuZXIgdG8gZ2V0IHRoZSBmaW5hbCBub2lzZSB2YWx1ZS5cbiAgICAgIC8vIFRoZSByZXN1bHQgaXMgc2NhbGVkIHRvIHJldHVybiB2YWx1ZXMgaW4gdGhlIGludGVydmFsIFstMSwxXS5cbiAgICAgIHJldHVybiA3MC4wICogKG4wICsgbjEgKyBuMik7XG4gICAgfSxcbiAgICAvLyAzRCBzaW1wbGV4IG5vaXNlXG4gICAgbm9pc2UzRDogZnVuY3Rpb24oeGluLCB5aW4sIHppbikge1xuICAgICAgdmFyIHBlcm1Nb2QxMiA9IHRoaXMucGVybU1vZDEyO1xuICAgICAgdmFyIHBlcm0gPSB0aGlzLnBlcm07XG4gICAgICB2YXIgZ3JhZDMgPSB0aGlzLmdyYWQzO1xuICAgICAgdmFyIG4wLCBuMSwgbjIsIG4zOyAvLyBOb2lzZSBjb250cmlidXRpb25zIGZyb20gdGhlIGZvdXIgY29ybmVyc1xuICAgICAgLy8gU2tldyB0aGUgaW5wdXQgc3BhY2UgdG8gZGV0ZXJtaW5lIHdoaWNoIHNpbXBsZXggY2VsbCB3ZSdyZSBpblxuICAgICAgdmFyIHMgPSAoeGluICsgeWluICsgemluKSAqIEYzOyAvLyBWZXJ5IG5pY2UgYW5kIHNpbXBsZSBza2V3IGZhY3RvciBmb3IgM0RcbiAgICAgIHZhciBpID0gTWF0aC5mbG9vcih4aW4gKyBzKTtcbiAgICAgIHZhciBqID0gTWF0aC5mbG9vcih5aW4gKyBzKTtcbiAgICAgIHZhciBrID0gTWF0aC5mbG9vcih6aW4gKyBzKTtcbiAgICAgIHZhciB0ID0gKGkgKyBqICsgaykgKiBHMztcbiAgICAgIHZhciBYMCA9IGkgLSB0OyAvLyBVbnNrZXcgdGhlIGNlbGwgb3JpZ2luIGJhY2sgdG8gKHgseSx6KSBzcGFjZVxuICAgICAgdmFyIFkwID0gaiAtIHQ7XG4gICAgICB2YXIgWjAgPSBrIC0gdDtcbiAgICAgIHZhciB4MCA9IHhpbiAtIFgwOyAvLyBUaGUgeCx5LHogZGlzdGFuY2VzIGZyb20gdGhlIGNlbGwgb3JpZ2luXG4gICAgICB2YXIgeTAgPSB5aW4gLSBZMDtcbiAgICAgIHZhciB6MCA9IHppbiAtIFowO1xuICAgICAgLy8gRm9yIHRoZSAzRCBjYXNlLCB0aGUgc2ltcGxleCBzaGFwZSBpcyBhIHNsaWdodGx5IGlycmVndWxhciB0ZXRyYWhlZHJvbi5cbiAgICAgIC8vIERldGVybWluZSB3aGljaCBzaW1wbGV4IHdlIGFyZSBpbi5cbiAgICAgIHZhciBpMSwgajEsIGsxOyAvLyBPZmZzZXRzIGZvciBzZWNvbmQgY29ybmVyIG9mIHNpbXBsZXggaW4gKGksaixrKSBjb29yZHNcbiAgICAgIHZhciBpMiwgajIsIGsyOyAvLyBPZmZzZXRzIGZvciB0aGlyZCBjb3JuZXIgb2Ygc2ltcGxleCBpbiAoaSxqLGspIGNvb3Jkc1xuICAgICAgaWYgKHgwID49IHkwKSB7XG4gICAgICAgIGlmICh5MCA+PSB6MCkge1xuICAgICAgICAgIGkxID0gMTtcbiAgICAgICAgICBqMSA9IDA7XG4gICAgICAgICAgazEgPSAwO1xuICAgICAgICAgIGkyID0gMTtcbiAgICAgICAgICBqMiA9IDE7XG4gICAgICAgICAgazIgPSAwO1xuICAgICAgICB9IC8vIFggWSBaIG9yZGVyXG4gICAgICAgIGVsc2UgaWYgKHgwID49IHowKSB7XG4gICAgICAgICAgaTEgPSAxO1xuICAgICAgICAgIGoxID0gMDtcbiAgICAgICAgICBrMSA9IDA7XG4gICAgICAgICAgaTIgPSAxO1xuICAgICAgICAgIGoyID0gMDtcbiAgICAgICAgICBrMiA9IDE7XG4gICAgICAgIH0gLy8gWCBaIFkgb3JkZXJcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaTEgPSAwO1xuICAgICAgICAgIGoxID0gMDtcbiAgICAgICAgICBrMSA9IDE7XG4gICAgICAgICAgaTIgPSAxO1xuICAgICAgICAgIGoyID0gMDtcbiAgICAgICAgICBrMiA9IDE7XG4gICAgICAgIH0gLy8gWiBYIFkgb3JkZXJcbiAgICAgIH1cbiAgICAgIGVsc2UgeyAvLyB4MDx5MFxuICAgICAgICBpZiAoeTAgPCB6MCkge1xuICAgICAgICAgIGkxID0gMDtcbiAgICAgICAgICBqMSA9IDA7XG4gICAgICAgICAgazEgPSAxO1xuICAgICAgICAgIGkyID0gMDtcbiAgICAgICAgICBqMiA9IDE7XG4gICAgICAgICAgazIgPSAxO1xuICAgICAgICB9IC8vIFogWSBYIG9yZGVyXG4gICAgICAgIGVsc2UgaWYgKHgwIDwgejApIHtcbiAgICAgICAgICBpMSA9IDA7XG4gICAgICAgICAgajEgPSAxO1xuICAgICAgICAgIGsxID0gMDtcbiAgICAgICAgICBpMiA9IDA7XG4gICAgICAgICAgajIgPSAxO1xuICAgICAgICAgIGsyID0gMTtcbiAgICAgICAgfSAvLyBZIFogWCBvcmRlclxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpMSA9IDA7XG4gICAgICAgICAgajEgPSAxO1xuICAgICAgICAgIGsxID0gMDtcbiAgICAgICAgICBpMiA9IDE7XG4gICAgICAgICAgajIgPSAxO1xuICAgICAgICAgIGsyID0gMDtcbiAgICAgICAgfSAvLyBZIFggWiBvcmRlclxuICAgICAgfVxuICAgICAgLy8gQSBzdGVwIG9mICgxLDAsMCkgaW4gKGksaixrKSBtZWFucyBhIHN0ZXAgb2YgKDEtYywtYywtYykgaW4gKHgseSx6KSxcbiAgICAgIC8vIGEgc3RlcCBvZiAoMCwxLDApIGluIChpLGosaykgbWVhbnMgYSBzdGVwIG9mICgtYywxLWMsLWMpIGluICh4LHkseiksIGFuZFxuICAgICAgLy8gYSBzdGVwIG9mICgwLDAsMSkgaW4gKGksaixrKSBtZWFucyBhIHN0ZXAgb2YgKC1jLC1jLDEtYykgaW4gKHgseSx6KSwgd2hlcmVcbiAgICAgIC8vIGMgPSAxLzYuXG4gICAgICB2YXIgeDEgPSB4MCAtIGkxICsgRzM7IC8vIE9mZnNldHMgZm9yIHNlY29uZCBjb3JuZXIgaW4gKHgseSx6KSBjb29yZHNcbiAgICAgIHZhciB5MSA9IHkwIC0gajEgKyBHMztcbiAgICAgIHZhciB6MSA9IHowIC0gazEgKyBHMztcbiAgICAgIHZhciB4MiA9IHgwIC0gaTIgKyAyLjAgKiBHMzsgLy8gT2Zmc2V0cyBmb3IgdGhpcmQgY29ybmVyIGluICh4LHkseikgY29vcmRzXG4gICAgICB2YXIgeTIgPSB5MCAtIGoyICsgMi4wICogRzM7XG4gICAgICB2YXIgejIgPSB6MCAtIGsyICsgMi4wICogRzM7XG4gICAgICB2YXIgeDMgPSB4MCAtIDEuMCArIDMuMCAqIEczOyAvLyBPZmZzZXRzIGZvciBsYXN0IGNvcm5lciBpbiAoeCx5LHopIGNvb3Jkc1xuICAgICAgdmFyIHkzID0geTAgLSAxLjAgKyAzLjAgKiBHMztcbiAgICAgIHZhciB6MyA9IHowIC0gMS4wICsgMy4wICogRzM7XG4gICAgICAvLyBXb3JrIG91dCB0aGUgaGFzaGVkIGdyYWRpZW50IGluZGljZXMgb2YgdGhlIGZvdXIgc2ltcGxleCBjb3JuZXJzXG4gICAgICB2YXIgaWkgPSBpICYgMjU1O1xuICAgICAgdmFyIGpqID0gaiAmIDI1NTtcbiAgICAgIHZhciBrayA9IGsgJiAyNTU7XG4gICAgICAvLyBDYWxjdWxhdGUgdGhlIGNvbnRyaWJ1dGlvbiBmcm9tIHRoZSBmb3VyIGNvcm5lcnNcbiAgICAgIHZhciB0MCA9IDAuNiAtIHgwICogeDAgLSB5MCAqIHkwIC0gejAgKiB6MDtcbiAgICAgIGlmICh0MCA8IDApIG4wID0gMC4wO1xuICAgICAgZWxzZSB7XG4gICAgICAgIHZhciBnaTAgPSBwZXJtTW9kMTJbaWkgKyBwZXJtW2pqICsgcGVybVtra11dXSAqIDM7XG4gICAgICAgIHQwICo9IHQwO1xuICAgICAgICBuMCA9IHQwICogdDAgKiAoZ3JhZDNbZ2kwXSAqIHgwICsgZ3JhZDNbZ2kwICsgMV0gKiB5MCArIGdyYWQzW2dpMCArIDJdICogejApO1xuICAgICAgfVxuICAgICAgdmFyIHQxID0gMC42IC0geDEgKiB4MSAtIHkxICogeTEgLSB6MSAqIHoxO1xuICAgICAgaWYgKHQxIDwgMCkgbjEgPSAwLjA7XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFyIGdpMSA9IHBlcm1Nb2QxMltpaSArIGkxICsgcGVybVtqaiArIGoxICsgcGVybVtrayArIGsxXV1dICogMztcbiAgICAgICAgdDEgKj0gdDE7XG4gICAgICAgIG4xID0gdDEgKiB0MSAqIChncmFkM1tnaTFdICogeDEgKyBncmFkM1tnaTEgKyAxXSAqIHkxICsgZ3JhZDNbZ2kxICsgMl0gKiB6MSk7XG4gICAgICB9XG4gICAgICB2YXIgdDIgPSAwLjYgLSB4MiAqIHgyIC0geTIgKiB5MiAtIHoyICogejI7XG4gICAgICBpZiAodDIgPCAwKSBuMiA9IDAuMDtcbiAgICAgIGVsc2Uge1xuICAgICAgICB2YXIgZ2kyID0gcGVybU1vZDEyW2lpICsgaTIgKyBwZXJtW2pqICsgajIgKyBwZXJtW2trICsgazJdXV0gKiAzO1xuICAgICAgICB0MiAqPSB0MjtcbiAgICAgICAgbjIgPSB0MiAqIHQyICogKGdyYWQzW2dpMl0gKiB4MiArIGdyYWQzW2dpMiArIDFdICogeTIgKyBncmFkM1tnaTIgKyAyXSAqIHoyKTtcbiAgICAgIH1cbiAgICAgIHZhciB0MyA9IDAuNiAtIHgzICogeDMgLSB5MyAqIHkzIC0gejMgKiB6MztcbiAgICAgIGlmICh0MyA8IDApIG4zID0gMC4wO1xuICAgICAgZWxzZSB7XG4gICAgICAgIHZhciBnaTMgPSBwZXJtTW9kMTJbaWkgKyAxICsgcGVybVtqaiArIDEgKyBwZXJtW2trICsgMV1dXSAqIDM7XG4gICAgICAgIHQzICo9IHQzO1xuICAgICAgICBuMyA9IHQzICogdDMgKiAoZ3JhZDNbZ2kzXSAqIHgzICsgZ3JhZDNbZ2kzICsgMV0gKiB5MyArIGdyYWQzW2dpMyArIDJdICogejMpO1xuICAgICAgfVxuICAgICAgLy8gQWRkIGNvbnRyaWJ1dGlvbnMgZnJvbSBlYWNoIGNvcm5lciB0byBnZXQgdGhlIGZpbmFsIG5vaXNlIHZhbHVlLlxuICAgICAgLy8gVGhlIHJlc3VsdCBpcyBzY2FsZWQgdG8gc3RheSBqdXN0IGluc2lkZSBbLTEsMV1cbiAgICAgIHJldHVybiAzMi4wICogKG4wICsgbjEgKyBuMiArIG4zKTtcbiAgICB9LFxuICAgIC8vIDREIHNpbXBsZXggbm9pc2UsIGJldHRlciBzaW1wbGV4IHJhbmsgb3JkZXJpbmcgbWV0aG9kIDIwMTItMDMtMDlcbiAgICBub2lzZTREOiBmdW5jdGlvbih4LCB5LCB6LCB3KSB7XG4gICAgICB2YXIgcGVybSA9IHRoaXMucGVybTtcbiAgICAgIHZhciBncmFkNCA9IHRoaXMuZ3JhZDQ7XG5cbiAgICAgIHZhciBuMCwgbjEsIG4yLCBuMywgbjQ7IC8vIE5vaXNlIGNvbnRyaWJ1dGlvbnMgZnJvbSB0aGUgZml2ZSBjb3JuZXJzXG4gICAgICAvLyBTa2V3IHRoZSAoeCx5LHosdykgc3BhY2UgdG8gZGV0ZXJtaW5lIHdoaWNoIGNlbGwgb2YgMjQgc2ltcGxpY2VzIHdlJ3JlIGluXG4gICAgICB2YXIgcyA9ICh4ICsgeSArIHogKyB3KSAqIEY0OyAvLyBGYWN0b3IgZm9yIDREIHNrZXdpbmdcbiAgICAgIHZhciBpID0gTWF0aC5mbG9vcih4ICsgcyk7XG4gICAgICB2YXIgaiA9IE1hdGguZmxvb3IoeSArIHMpO1xuICAgICAgdmFyIGsgPSBNYXRoLmZsb29yKHogKyBzKTtcbiAgICAgIHZhciBsID0gTWF0aC5mbG9vcih3ICsgcyk7XG4gICAgICB2YXIgdCA9IChpICsgaiArIGsgKyBsKSAqIEc0OyAvLyBGYWN0b3IgZm9yIDREIHVuc2tld2luZ1xuICAgICAgdmFyIFgwID0gaSAtIHQ7IC8vIFVuc2tldyB0aGUgY2VsbCBvcmlnaW4gYmFjayB0byAoeCx5LHosdykgc3BhY2VcbiAgICAgIHZhciBZMCA9IGogLSB0O1xuICAgICAgdmFyIFowID0gayAtIHQ7XG4gICAgICB2YXIgVzAgPSBsIC0gdDtcbiAgICAgIHZhciB4MCA9IHggLSBYMDsgLy8gVGhlIHgseSx6LHcgZGlzdGFuY2VzIGZyb20gdGhlIGNlbGwgb3JpZ2luXG4gICAgICB2YXIgeTAgPSB5IC0gWTA7XG4gICAgICB2YXIgejAgPSB6IC0gWjA7XG4gICAgICB2YXIgdzAgPSB3IC0gVzA7XG4gICAgICAvLyBGb3IgdGhlIDREIGNhc2UsIHRoZSBzaW1wbGV4IGlzIGEgNEQgc2hhcGUgSSB3b24ndCBldmVuIHRyeSB0byBkZXNjcmliZS5cbiAgICAgIC8vIFRvIGZpbmQgb3V0IHdoaWNoIG9mIHRoZSAyNCBwb3NzaWJsZSBzaW1wbGljZXMgd2UncmUgaW4sIHdlIG5lZWQgdG9cbiAgICAgIC8vIGRldGVybWluZSB0aGUgbWFnbml0dWRlIG9yZGVyaW5nIG9mIHgwLCB5MCwgejAgYW5kIHcwLlxuICAgICAgLy8gU2l4IHBhaXItd2lzZSBjb21wYXJpc29ucyBhcmUgcGVyZm9ybWVkIGJldHdlZW4gZWFjaCBwb3NzaWJsZSBwYWlyXG4gICAgICAvLyBvZiB0aGUgZm91ciBjb29yZGluYXRlcywgYW5kIHRoZSByZXN1bHRzIGFyZSB1c2VkIHRvIHJhbmsgdGhlIG51bWJlcnMuXG4gICAgICB2YXIgcmFua3ggPSAwO1xuICAgICAgdmFyIHJhbmt5ID0gMDtcbiAgICAgIHZhciByYW5reiA9IDA7XG4gICAgICB2YXIgcmFua3cgPSAwO1xuICAgICAgaWYgKHgwID4geTApIHJhbmt4Kys7XG4gICAgICBlbHNlIHJhbmt5Kys7XG4gICAgICBpZiAoeDAgPiB6MCkgcmFua3grKztcbiAgICAgIGVsc2UgcmFua3orKztcbiAgICAgIGlmICh4MCA+IHcwKSByYW5reCsrO1xuICAgICAgZWxzZSByYW5rdysrO1xuICAgICAgaWYgKHkwID4gejApIHJhbmt5Kys7XG4gICAgICBlbHNlIHJhbmt6Kys7XG4gICAgICBpZiAoeTAgPiB3MCkgcmFua3krKztcbiAgICAgIGVsc2UgcmFua3crKztcbiAgICAgIGlmICh6MCA+IHcwKSByYW5reisrO1xuICAgICAgZWxzZSByYW5rdysrO1xuICAgICAgdmFyIGkxLCBqMSwgazEsIGwxOyAvLyBUaGUgaW50ZWdlciBvZmZzZXRzIGZvciB0aGUgc2Vjb25kIHNpbXBsZXggY29ybmVyXG4gICAgICB2YXIgaTIsIGoyLCBrMiwgbDI7IC8vIFRoZSBpbnRlZ2VyIG9mZnNldHMgZm9yIHRoZSB0aGlyZCBzaW1wbGV4IGNvcm5lclxuICAgICAgdmFyIGkzLCBqMywgazMsIGwzOyAvLyBUaGUgaW50ZWdlciBvZmZzZXRzIGZvciB0aGUgZm91cnRoIHNpbXBsZXggY29ybmVyXG4gICAgICAvLyBzaW1wbGV4W2NdIGlzIGEgNC12ZWN0b3Igd2l0aCB0aGUgbnVtYmVycyAwLCAxLCAyIGFuZCAzIGluIHNvbWUgb3JkZXIuXG4gICAgICAvLyBNYW55IHZhbHVlcyBvZiBjIHdpbGwgbmV2ZXIgb2NjdXIsIHNpbmNlIGUuZy4geD55Pno+dyBtYWtlcyB4PHosIHk8dyBhbmQgeDx3XG4gICAgICAvLyBpbXBvc3NpYmxlLiBPbmx5IHRoZSAyNCBpbmRpY2VzIHdoaWNoIGhhdmUgbm9uLXplcm8gZW50cmllcyBtYWtlIGFueSBzZW5zZS5cbiAgICAgIC8vIFdlIHVzZSBhIHRocmVzaG9sZGluZyB0byBzZXQgdGhlIGNvb3JkaW5hdGVzIGluIHR1cm4gZnJvbSB0aGUgbGFyZ2VzdCBtYWduaXR1ZGUuXG4gICAgICAvLyBSYW5rIDMgZGVub3RlcyB0aGUgbGFyZ2VzdCBjb29yZGluYXRlLlxuICAgICAgaTEgPSByYW5reCA+PSAzID8gMSA6IDA7XG4gICAgICBqMSA9IHJhbmt5ID49IDMgPyAxIDogMDtcbiAgICAgIGsxID0gcmFua3ogPj0gMyA/IDEgOiAwO1xuICAgICAgbDEgPSByYW5rdyA+PSAzID8gMSA6IDA7XG4gICAgICAvLyBSYW5rIDIgZGVub3RlcyB0aGUgc2Vjb25kIGxhcmdlc3QgY29vcmRpbmF0ZS5cbiAgICAgIGkyID0gcmFua3ggPj0gMiA/IDEgOiAwO1xuICAgICAgajIgPSByYW5reSA+PSAyID8gMSA6IDA7XG4gICAgICBrMiA9IHJhbmt6ID49IDIgPyAxIDogMDtcbiAgICAgIGwyID0gcmFua3cgPj0gMiA/IDEgOiAwO1xuICAgICAgLy8gUmFuayAxIGRlbm90ZXMgdGhlIHNlY29uZCBzbWFsbGVzdCBjb29yZGluYXRlLlxuICAgICAgaTMgPSByYW5reCA+PSAxID8gMSA6IDA7XG4gICAgICBqMyA9IHJhbmt5ID49IDEgPyAxIDogMDtcbiAgICAgIGszID0gcmFua3ogPj0gMSA/IDEgOiAwO1xuICAgICAgbDMgPSByYW5rdyA+PSAxID8gMSA6IDA7XG4gICAgICAvLyBUaGUgZmlmdGggY29ybmVyIGhhcyBhbGwgY29vcmRpbmF0ZSBvZmZzZXRzID0gMSwgc28gbm8gbmVlZCB0byBjb21wdXRlIHRoYXQuXG4gICAgICB2YXIgeDEgPSB4MCAtIGkxICsgRzQ7IC8vIE9mZnNldHMgZm9yIHNlY29uZCBjb3JuZXIgaW4gKHgseSx6LHcpIGNvb3Jkc1xuICAgICAgdmFyIHkxID0geTAgLSBqMSArIEc0O1xuICAgICAgdmFyIHoxID0gejAgLSBrMSArIEc0O1xuICAgICAgdmFyIHcxID0gdzAgLSBsMSArIEc0O1xuICAgICAgdmFyIHgyID0geDAgLSBpMiArIDIuMCAqIEc0OyAvLyBPZmZzZXRzIGZvciB0aGlyZCBjb3JuZXIgaW4gKHgseSx6LHcpIGNvb3Jkc1xuICAgICAgdmFyIHkyID0geTAgLSBqMiArIDIuMCAqIEc0O1xuICAgICAgdmFyIHoyID0gejAgLSBrMiArIDIuMCAqIEc0O1xuICAgICAgdmFyIHcyID0gdzAgLSBsMiArIDIuMCAqIEc0O1xuICAgICAgdmFyIHgzID0geDAgLSBpMyArIDMuMCAqIEc0OyAvLyBPZmZzZXRzIGZvciBmb3VydGggY29ybmVyIGluICh4LHkseix3KSBjb29yZHNcbiAgICAgIHZhciB5MyA9IHkwIC0gajMgKyAzLjAgKiBHNDtcbiAgICAgIHZhciB6MyA9IHowIC0gazMgKyAzLjAgKiBHNDtcbiAgICAgIHZhciB3MyA9IHcwIC0gbDMgKyAzLjAgKiBHNDtcbiAgICAgIHZhciB4NCA9IHgwIC0gMS4wICsgNC4wICogRzQ7IC8vIE9mZnNldHMgZm9yIGxhc3QgY29ybmVyIGluICh4LHkseix3KSBjb29yZHNcbiAgICAgIHZhciB5NCA9IHkwIC0gMS4wICsgNC4wICogRzQ7XG4gICAgICB2YXIgejQgPSB6MCAtIDEuMCArIDQuMCAqIEc0O1xuICAgICAgdmFyIHc0ID0gdzAgLSAxLjAgKyA0LjAgKiBHNDtcbiAgICAgIC8vIFdvcmsgb3V0IHRoZSBoYXNoZWQgZ3JhZGllbnQgaW5kaWNlcyBvZiB0aGUgZml2ZSBzaW1wbGV4IGNvcm5lcnNcbiAgICAgIHZhciBpaSA9IGkgJiAyNTU7XG4gICAgICB2YXIgamogPSBqICYgMjU1O1xuICAgICAgdmFyIGtrID0gayAmIDI1NTtcbiAgICAgIHZhciBsbCA9IGwgJiAyNTU7XG4gICAgICAvLyBDYWxjdWxhdGUgdGhlIGNvbnRyaWJ1dGlvbiBmcm9tIHRoZSBmaXZlIGNvcm5lcnNcbiAgICAgIHZhciB0MCA9IDAuNiAtIHgwICogeDAgLSB5MCAqIHkwIC0gejAgKiB6MCAtIHcwICogdzA7XG4gICAgICBpZiAodDAgPCAwKSBuMCA9IDAuMDtcbiAgICAgIGVsc2Uge1xuICAgICAgICB2YXIgZ2kwID0gKHBlcm1baWkgKyBwZXJtW2pqICsgcGVybVtrayArIHBlcm1bbGxdXV1dICUgMzIpICogNDtcbiAgICAgICAgdDAgKj0gdDA7XG4gICAgICAgIG4wID0gdDAgKiB0MCAqIChncmFkNFtnaTBdICogeDAgKyBncmFkNFtnaTAgKyAxXSAqIHkwICsgZ3JhZDRbZ2kwICsgMl0gKiB6MCArIGdyYWQ0W2dpMCArIDNdICogdzApO1xuICAgICAgfVxuICAgICAgdmFyIHQxID0gMC42IC0geDEgKiB4MSAtIHkxICogeTEgLSB6MSAqIHoxIC0gdzEgKiB3MTtcbiAgICAgIGlmICh0MSA8IDApIG4xID0gMC4wO1xuICAgICAgZWxzZSB7XG4gICAgICAgIHZhciBnaTEgPSAocGVybVtpaSArIGkxICsgcGVybVtqaiArIGoxICsgcGVybVtrayArIGsxICsgcGVybVtsbCArIGwxXV1dXSAlIDMyKSAqIDQ7XG4gICAgICAgIHQxICo9IHQxO1xuICAgICAgICBuMSA9IHQxICogdDEgKiAoZ3JhZDRbZ2kxXSAqIHgxICsgZ3JhZDRbZ2kxICsgMV0gKiB5MSArIGdyYWQ0W2dpMSArIDJdICogejEgKyBncmFkNFtnaTEgKyAzXSAqIHcxKTtcbiAgICAgIH1cbiAgICAgIHZhciB0MiA9IDAuNiAtIHgyICogeDIgLSB5MiAqIHkyIC0gejIgKiB6MiAtIHcyICogdzI7XG4gICAgICBpZiAodDIgPCAwKSBuMiA9IDAuMDtcbiAgICAgIGVsc2Uge1xuICAgICAgICB2YXIgZ2kyID0gKHBlcm1baWkgKyBpMiArIHBlcm1bamogKyBqMiArIHBlcm1ba2sgKyBrMiArIHBlcm1bbGwgKyBsMl1dXV0gJSAzMikgKiA0O1xuICAgICAgICB0MiAqPSB0MjtcbiAgICAgICAgbjIgPSB0MiAqIHQyICogKGdyYWQ0W2dpMl0gKiB4MiArIGdyYWQ0W2dpMiArIDFdICogeTIgKyBncmFkNFtnaTIgKyAyXSAqIHoyICsgZ3JhZDRbZ2kyICsgM10gKiB3Mik7XG4gICAgICB9XG4gICAgICB2YXIgdDMgPSAwLjYgLSB4MyAqIHgzIC0geTMgKiB5MyAtIHozICogejMgLSB3MyAqIHczO1xuICAgICAgaWYgKHQzIDwgMCkgbjMgPSAwLjA7XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFyIGdpMyA9IChwZXJtW2lpICsgaTMgKyBwZXJtW2pqICsgajMgKyBwZXJtW2trICsgazMgKyBwZXJtW2xsICsgbDNdXV1dICUgMzIpICogNDtcbiAgICAgICAgdDMgKj0gdDM7XG4gICAgICAgIG4zID0gdDMgKiB0MyAqIChncmFkNFtnaTNdICogeDMgKyBncmFkNFtnaTMgKyAxXSAqIHkzICsgZ3JhZDRbZ2kzICsgMl0gKiB6MyArIGdyYWQ0W2dpMyArIDNdICogdzMpO1xuICAgICAgfVxuICAgICAgdmFyIHQ0ID0gMC42IC0geDQgKiB4NCAtIHk0ICogeTQgLSB6NCAqIHo0IC0gdzQgKiB3NDtcbiAgICAgIGlmICh0NCA8IDApIG40ID0gMC4wO1xuICAgICAgZWxzZSB7XG4gICAgICAgIHZhciBnaTQgPSAocGVybVtpaSArIDEgKyBwZXJtW2pqICsgMSArIHBlcm1ba2sgKyAxICsgcGVybVtsbCArIDFdXV1dICUgMzIpICogNDtcbiAgICAgICAgdDQgKj0gdDQ7XG4gICAgICAgIG40ID0gdDQgKiB0NCAqIChncmFkNFtnaTRdICogeDQgKyBncmFkNFtnaTQgKyAxXSAqIHk0ICsgZ3JhZDRbZ2k0ICsgMl0gKiB6NCArIGdyYWQ0W2dpNCArIDNdICogdzQpO1xuICAgICAgfVxuICAgICAgLy8gU3VtIHVwIGFuZCBzY2FsZSB0aGUgcmVzdWx0IHRvIGNvdmVyIHRoZSByYW5nZSBbLTEsMV1cbiAgICAgIHJldHVybiAyNy4wICogKG4wICsgbjEgKyBuMiArIG4zICsgbjQpO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBidWlsZFBlcm11dGF0aW9uVGFibGUocmFuZG9tKSB7XG4gICAgdmFyIGk7XG4gICAgdmFyIHAgPSBuZXcgVWludDhBcnJheSgyNTYpO1xuICAgIGZvciAoaSA9IDA7IGkgPCAyNTY7IGkrKykge1xuICAgICAgcFtpXSA9IGk7XG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCAyNTU7IGkrKykge1xuICAgICAgdmFyIHIgPSBpICsgfn4ocmFuZG9tKCkgKiAoMjU2IC0gaSkpO1xuICAgICAgdmFyIGF1eCA9IHBbaV07XG4gICAgICBwW2ldID0gcFtyXTtcbiAgICAgIHBbcl0gPSBhdXg7XG4gICAgfVxuICAgIHJldHVybiBwO1xuICB9XG4gIFNpbXBsZXhOb2lzZS5fYnVpbGRQZXJtdXRhdGlvblRhYmxlID0gYnVpbGRQZXJtdXRhdGlvblRhYmxlO1xuXG4gIGZ1bmN0aW9uIGFsZWEoKSB7XG4gICAgLy8gSm9oYW5uZXMgQmFhZ8O4ZSA8YmFhZ29lQGJhYWdvZS5jb20+LCAyMDEwXG4gICAgdmFyIHMwID0gMDtcbiAgICB2YXIgczEgPSAwO1xuICAgIHZhciBzMiA9IDA7XG4gICAgdmFyIGMgPSAxO1xuXG4gICAgdmFyIG1hc2ggPSBtYXNoZXIoKTtcbiAgICBzMCA9IG1hc2goJyAnKTtcbiAgICBzMSA9IG1hc2goJyAnKTtcbiAgICBzMiA9IG1hc2goJyAnKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBzMCAtPSBtYXNoKGFyZ3VtZW50c1tpXSk7XG4gICAgICBpZiAoczAgPCAwKSB7XG4gICAgICAgIHMwICs9IDE7XG4gICAgICB9XG4gICAgICBzMSAtPSBtYXNoKGFyZ3VtZW50c1tpXSk7XG4gICAgICBpZiAoczEgPCAwKSB7XG4gICAgICAgIHMxICs9IDE7XG4gICAgICB9XG4gICAgICBzMiAtPSBtYXNoKGFyZ3VtZW50c1tpXSk7XG4gICAgICBpZiAoczIgPCAwKSB7XG4gICAgICAgIHMyICs9IDE7XG4gICAgICB9XG4gICAgfVxuICAgIG1hc2ggPSBudWxsO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0ID0gMjA5MTYzOSAqIHMwICsgYyAqIDIuMzI4MzA2NDM2NTM4Njk2M2UtMTA7IC8vIDJeLTMyXG4gICAgICBzMCA9IHMxO1xuICAgICAgczEgPSBzMjtcbiAgICAgIHJldHVybiBzMiA9IHQgLSAoYyA9IHQgfCAwKTtcbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIG1hc2hlcigpIHtcbiAgICB2YXIgbiA9IDB4ZWZjODI0OWQ7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGRhdGEgPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbiArPSBkYXRhLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIHZhciBoID0gMC4wMjUxOTYwMzI4MjQxNjkzOCAqIG47XG4gICAgICAgIG4gPSBoID4+PiAwO1xuICAgICAgICBoIC09IG47XG4gICAgICAgIGggKj0gbjtcbiAgICAgICAgbiA9IGggPj4+IDA7XG4gICAgICAgIGggLT0gbjtcbiAgICAgICAgbiArPSBoICogMHgxMDAwMDAwMDA7IC8vIDJeMzJcbiAgICAgIH1cbiAgICAgIHJldHVybiAobiA+Pj4gMCkgKiAyLjMyODMwNjQzNjUzODY5NjNlLTEwOyAvLyAyXi0zMlxuICAgIH07XG4gIH1cblxuICAvLyBhbWRcbiAgaWYgKHR5cGVvZiBkZWZpbmUgIT09ICd1bmRlZmluZWQnICYmIGRlZmluZS5hbWQpIGRlZmluZShmdW5jdGlvbigpIHtyZXR1cm4gU2ltcGxleE5vaXNlO30pO1xuICAvLyBjb21tb24ganNcbiAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykgZXhwb3J0cy5TaW1wbGV4Tm9pc2UgPSBTaW1wbGV4Tm9pc2U7XG4gIC8vIGJyb3dzZXJcbiAgZWxzZSBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHdpbmRvdy5TaW1wbGV4Tm9pc2UgPSBTaW1wbGV4Tm9pc2U7XG4gIC8vIG5vZGVqc1xuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFNpbXBsZXhOb2lzZTtcbiAgfVxuXG59KSgpO1xuIiwiY29uc3QgY2FudmFzU2tldGNoID0gcmVxdWlyZShcImNhbnZhcy1za2V0Y2hcIik7XG5jb25zdCB7IGxlcnAgfSA9IHJlcXVpcmUoXCJjYW52YXMtc2tldGNoLXV0aWwvbWF0aFwiKTtcbmNvbnN0IHJhbmRvbSA9IHJlcXVpcmUoXCJjYW52YXMtc2tldGNoLXV0aWwvcmFuZG9tXCIpO1xuY29uc3QgcGFsZXR0ZXMgPSByZXF1aXJlKFwibmljZS1jb2xvci1wYWxldHRlcy8xMDAwLmpzb25cIik7XG5jb25zdCBDb2xvciA9IHJlcXVpcmUoXCJjb2xvclwiKTtcblxuY29uc3Qgc3BsaXRQYWxldHRlID0gcmVxdWlyZShcIi4vdXRpbC9zcGxpdFBhbGV0dGVcIik7XG5jb25zdCBpbnRlcnBvbGF0ZUNvbG9ycyA9IHJlcXVpcmUoXCIuL3V0aWwvaW50ZXJwb2xhdGVDb2xvcnNcIik7XG5jb25zdCBkcmF3Q2lyY2xlID0gcmVxdWlyZShcIi4vdXRpbC9kcmF3Q2lyY2xlXCIpO1xuY29uc3QgaXNQb2ludFdpdGhpbkNpcmNsZSA9IHJlcXVpcmUoXCIuL3V0aWwvaXNQb2ludFdpdGhpbkNpcmNsZVwiKTtcblxucmFuZG9tLnNldFNlZWQocmFuZG9tLmdldFJhbmRvbVNlZWQoKSk7XG4vLyBjb25zb2xlLmxvZyhyYW5kb20uZ2V0U2VlZCgpKTtcblxuY29uc3QgTUlOX0NPTE9SX0pJVFRFUiA9IC00O1xuY29uc3QgTUFYX0NPTE9SX0pJVFRFUiA9IDQ7XG5jb25zdCBNSU5fUE9TSVRJT05fSklUVEVSID0gLTAuMDE7XG5jb25zdCBNQVhfUE9TSVRJT05fSklUVEVSID0gMC4wMTtcbmNvbnN0IFBBUlRJQ0xFX01JTiA9IDMwO1xuY29uc3QgUEFSVElDTEVfTUFYID0gNTA7XG5jb25zdCBTUFJFQURfTUlOID0gLTU7XG5jb25zdCBTUFJFQURfTUFYID0gMTU7XG5jb25zdCBQUk9CQUJJTElUWV9UT19SRU5ERVIgPSAwLjI7XG5cbmNvbnN0IHNldHRpbmdzID0ge1xuICBkaW1lbnNpb25zOiBcIkEzXCIsXG4gIHBpeGVsc1BlckluY2g6IDYwMCxcbiAgc3VmZml4OiBgLXNlZWQtJHtyYW5kb20uZ2V0U2VlZCgpfWBcbn07XG5cbmNvbnN0IHsgYmFja2dyb3VuZCwgcGFsZXR0ZSB9ID0gc3BsaXRQYWxldHRlKHJhbmRvbS5waWNrKHBhbGV0dGVzKSk7XG5jb25zdCBjb2xvcnMgPSBpbnRlcnBvbGF0ZUNvbG9ycyhwYWxldHRlLCA1MCk7XG5cbmNvbnN0IG1hcFZUb0NvbG9yID0gdiA9PiB7XG4gIC8vIGJhc2VkIG9uIHRoZSB5IHBvc2l0aW9uIG9mIHRoZSBwYXJ0aWNsZSwgcGljayB0aGUgbmVhcmVzdCBjb2xvdXIgZnJvbVxuICAvLyBvdXIgaW50ZXJwb2xhdGVkIGFycmF5IG9mIGNvbG91cnMgKyBhIGxpdHRsZSBiaXQgb2Ygbm9pc2UgZm9yIHRleHR1cmVcbiAgY29uc3QgY29sb3JJbmRleCA9IE1hdGgucm91bmQoXG4gICAgbGVycCgwLCBjb2xvcnMubGVuZ3RoLCB2KSArIHJhbmRvbS5yYW5nZShNSU5fQ09MT1JfSklUVEVSLCBNQVhfQ09MT1JfSklUVEVSKVxuICApO1xuICAvLyBCZWNhdXNlIG9mIHRoZSBub2lzZSwgd2UgY2FuIGV4Y2VlZCB0aGUgYm91bmRzIG9mIHRoZSBhcnJheSBzbyBtYXggb3IgbWluIGl0IG91dFxuICByZXR1cm4gY29sb3JzW01hdGgubWF4KDAsIE1hdGgubWluKGNvbG9ySW5kZXgsIGNvbG9ycy5sZW5ndGgpKV07XG59O1xuXG5jb25zdCBnZW5lcmF0ZSA9ICgpID0+IHtcbiAgY29uc3QgY291bnQgPSA1MDA7XG4gIGNvbnN0IHBvaW50cyA9IFtdO1xuICBmb3IgKGxldCB4ID0gMDsgeCA8IGNvdW50OyB4KyspIHtcbiAgICBmb3IgKGxldCB5ID0gMDsgeSA8IGNvdW50OyB5KyspIHtcbiAgICAgIGNvbnN0IHUgPVxuICAgICAgICB4IC8gKGNvdW50IC0gMSkgK1xuICAgICAgICByYW5kb20ucmFuZ2UoTUlOX1BPU0lUSU9OX0pJVFRFUiwgTUFYX1BPU0lUSU9OX0pJVFRFUik7XG4gICAgICBjb25zdCB2ID1cbiAgICAgICAgeSAvIChjb3VudCAtIDEpICtcbiAgICAgICAgcmFuZG9tLnJhbmdlKE1JTl9QT1NJVElPTl9KSVRURVIsIE1BWF9QT1NJVElPTl9KSVRURVIpO1xuICAgICAgY29uc3Qgbm9pc2UgPSByYW5kb20ubm9pc2UyRCh1LCB2LCAzLjgpO1xuICAgICAgY29uc3QgcmFkaXVzID0gTWF0aC5tYXgoMy41LCBub2lzZSAqIDExKTtcbiAgICAgIGNvbnN0IGFscGhhID0gcmFuZG9tLnJhbmdlKDAuOSwgMC4xKTtcbiAgICAgIGNvbnN0IGhleENvbG9yID0gbWFwVlRvQ29sb3Iodik7XG4gICAgICBjb25zdCBjb2xvciA9IENvbG9yKGhleENvbG9yKTtcbiAgICAgIGNvbnN0IHNwcmVhZCA9IE1hdGgubWF4KFxuICAgICAgICAwLFxuICAgICAgICBNYXRoLnJvdW5kKHJhbmRvbS5yYW5nZShQQVJUSUNMRV9NSU4sIFBBUlRJQ0xFX01BWCkgKiBub2lzZSlcbiAgICAgICk7XG4gICAgICBjb25zdCBwYXJ0aWNsZXMgPSBbXTtcblxuICAgICAgLy8gRWFjaCBwb2lubnQgaGFzIGEgdHJhaWwgb2YgcGFydGljbGVzXG4gICAgICBmb3IgKGxldCBpID0gMTsgaSA8IHNwcmVhZDsgaSsrKSB7XG4gICAgICAgIC8vIGZvciBlYWNoIHN1Yi1wYXJ0aWNsZSBvbiB0aGUgdHJhaWwgcmFuZG9tbHkgb2Zmc2V0IGl0IHdpdGggYW4gaW5kZXggbW9kaWZpZXJcbiAgICAgICAgY29uc3Qgb2Zmc2V0ID1cbiAgICAgICAgICByYW5kb20ucmFuZ2UoU1BSRUFEX01JTiAtIGkgLyBzcHJlYWQsIFNQUkVBRF9NQVggKyBpIC8gc3ByZWFkKSAqXG4gICAgICAgICAgKGkgLyA0MDApO1xuXG4gICAgICAgIHBhcnRpY2xlcy5wdXNoKHtcbiAgICAgICAgICB1LFxuICAgICAgICAgIHY6IHYgKyBvZmZzZXQsXG4gICAgICAgICAgaGlnaGxpZ2h0OiByYW5kb20udmFsdWUoKSA+IDAuNSA/IGNvbG9yLmxpZ2h0ZW4oMC41KSA6IGZhbHNlLFxuICAgICAgICAgIHJhZGl1czogTWF0aC5tYXgoMC4zLCByYWRpdXMgLSByYWRpdXMgLyBzcHJlYWQgKiBpKSxcbiAgICAgICAgICBjb2xvcjogY29sb3JcbiAgICAgICAgICAgIC5yZ2IoKVxuICAgICAgICAgICAgLmZhZGUoYWxwaGEpXG4gICAgICAgICAgICAudG9TdHJpbmcoKVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcG9pbnRzLnB1c2goe1xuICAgICAgICB1LFxuICAgICAgICB2LFxuICAgICAgICBzcHJlYWQ6IDEwLFxuICAgICAgICBjb2xvcixcbiAgICAgICAgcmFkaXVzLFxuICAgICAgICBwYXJ0aWNsZXMsXG4gICAgICAgIG9mZnNldDogcmFuZG9tLnJhbmdlKC01LCA1KVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBvaW50cztcbn07XG5cbmNvbnN0IG1hcmdpbiA9IDEwO1xuY29uc3QgcG9pbnRzID0gZ2VuZXJhdGUoKS5maWx0ZXIoKCkgPT4gcmFuZG9tLnZhbHVlKCkgPCBQUk9CQUJJTElUWV9UT19SRU5ERVIpO1xuY29uc3Qgc2tldGNoID0gKCkgPT4ge1xuICByZXR1cm4gKHsgY29udGV4dCwgd2lkdGgsIGhlaWdodCB9KSA9PiB7XG4gICAgY29uc3QgY2lyY2xlTWFza1JhZGl1cyA9IHdpZHRoIC8gMztcbiAgICBjb25zdCBjaXJjbGVNYXNrID0ge1xuICAgICAgeDogd2lkdGggLyAyLFxuICAgICAgeTogaGVpZ2h0IC8gMyxcbiAgICAgIHJhZGl1czogY2lyY2xlTWFza1JhZGl1c1xuICAgIH07XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBiYWNrZ3JvdW5kO1xuICAgIGNvbnRleHQuZmlsbFJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG5cbiAgICBwb2ludHMuZm9yRWFjaChwb2ludCA9PiB7XG4gICAgICBjb25zdCBjaXJjbGUgPSB7XG4gICAgICAgIHg6IGxlcnAobWFyZ2luLCB3aWR0aCAtIG1hcmdpbiwgcG9pbnQudSksXG4gICAgICAgIHk6IGxlcnAobWFyZ2luLCB3aWR0aCAtIG1hcmdpbiwgcG9pbnQudiksXG4gICAgICAgIHJhZGl1czogcG9pbnQucmFkaXVzLFxuICAgICAgICBjb2xvcjogcG9pbnQuY29sb3JcbiAgICAgIH07XG4gICAgICBpZiAoaXNQb2ludFdpdGhpbkNpcmNsZShjaXJjbGUsIGNpcmNsZU1hc2spKSB7XG4gICAgICAgIGRyYXdDaXJjbGUoY2lyY2xlLCBjb250ZXh0KTtcbiAgICAgICAgcG9pbnQucGFydGljbGVzLmZvckVhY2gocGFydGljbGUgPT4ge1xuICAgICAgICAgIGNvbnN0IHggPSBsZXJwKG1hcmdpbiwgd2lkdGggLSBtYXJnaW4sIHBhcnRpY2xlLnUpO1xuICAgICAgICAgIGNvbnN0IHkgPSBsZXJwKG1hcmdpbiwgd2lkdGggLSBtYXJnaW4sIHBhcnRpY2xlLnYpO1xuICAgICAgICAgIGNvbnN0IHBhcnRpY2xlQ2lyY2xlID0ge1xuICAgICAgICAgICAgeCxcbiAgICAgICAgICAgIHksXG4gICAgICAgICAgICByYWRpdXM6IHBhcnRpY2xlLnJhZGl1cyxcbiAgICAgICAgICAgIGNvbG9yOiBwYXJ0aWNsZS5jb2xvclxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBkcmF3Q2lyY2xlKHBhcnRpY2xlQ2lyY2xlLCBjb250ZXh0KTtcbiAgICAgICAgICBpZiAocGFydGljbGUuaGlnaGxpZ2h0KSB7XG4gICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBwYXJ0aWNsZS5oaWdobGlnaHQ7XG4gICAgICAgICAgICBjb250ZXh0LmFyYyh4LCB5ICsgbGVuZ3RoLCBwYXJ0aWNsZS5yYWRpdXMgLyAyLCAwLCBNYXRoLlBJICogMik7XG4gICAgICAgICAgICBjb250ZXh0LmZpbGwoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xufTtcblxuY2FudmFzU2tldGNoKHNrZXRjaCwgc2V0dGluZ3MpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoY2lyY2xlLCBjb250ZXh0KSA9PiB7XG4gIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gIGlmIChjaXJjbGUuY29sb3IpIGNvbnRleHQuZmlsbFN0eWxlID0gY2lyY2xlLmNvbG9yO1xuICBjb250ZXh0LmFyYyhjaXJjbGUueCwgY2lyY2xlLnksIGNpcmNsZS5yYWRpdXMsIDAsIE1hdGguUEkgKiAyKTtcbiAgY29udGV4dC5maWxsKCk7XG59O1xuIiwiY29uc3QgbGVycENvbG9yID0gcmVxdWlyZShcIi4vbGVycEhleENvbG9yXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChwYWxldHRlLCBzdGVwcykgPT4ge1xuICBjb25zdCBzdGVwc0JldHdlZW5Db2xvdXJzID0gKHN0ZXBzIC0gcGFsZXR0ZS5sZW5ndGgpIC8gKHBhbGV0dGUubGVuZ3RoIC0gMSk7XG4gIGNvbnN0IGNvbG9ycyA9IFtdO1xuXG4gIGZvciAobGV0IGNvbG9yID0gMDsgY29sb3IgPCBwYWxldHRlLmxlbmd0aDsgY29sb3IrKykge1xuICAgIGNvbG9ycy5wdXNoKHBhbGV0dGVbY29sb3JdKTtcbiAgICBpZiAoIXBhbGV0dGVbY29sb3IgKyAxXSkgYnJlYWs7XG4gICAgZm9yIChsZXQgc3RlcCA9IDA7IHN0ZXAgPCBzdGVwc0JldHdlZW5Db2xvdXJzOyBzdGVwKyspIHtcbiAgICAgIGNvbnN0IG5ld0NvbG9yID0gbGVycENvbG9yKFxuICAgICAgICBwYWxldHRlW2NvbG9yXSxcbiAgICAgICAgcGFsZXR0ZVtjb2xvciArIDFdLFxuICAgICAgICBzdGVwIC8gc3RlcHNCZXR3ZWVuQ29sb3Vyc1xuICAgICAgKTtcbiAgICAgIGNvbG9ycy5wdXNoKG5ld0NvbG9yKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY29sb3JzO1xufTtcbiIsImNvbnN0IGlzUG9pbnRXaXRoaW5DaXJjbGUgPSAocG9pbnQsIGNpcmNsZU1hc2spID0+IHtcbiAgdmFyIGEgPSBwb2ludC5yYWRpdXMgKyBjaXJjbGVNYXNrLnJhZGl1cztcbiAgdmFyIHggPSBwb2ludC54IC0gY2lyY2xlTWFzay54O1xuICB2YXIgeSA9IHBvaW50LnkgLSBjaXJjbGVNYXNrLnk7XG5cbiAgcmV0dXJuIGEgPj0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBpc1BvaW50V2l0aGluQ2lyY2xlO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoYSwgYiwgYW1vdW50KSA9PiB7XG4gIGNvbnN0IGFoID0gcGFyc2VJbnQoYS5yZXBsYWNlKC8jL2csIFwiXCIpLCAxNik7XG4gIGNvbnN0IGFyID0gYWggPj4gMTY7XG4gIGNvbnN0IGFnID0gKGFoID4+IDgpICYgMHhmZjtcbiAgY29uc3QgYWIgPSBhaCAmIDB4ZmY7XG4gIGNvbnN0IGJoID0gcGFyc2VJbnQoYi5yZXBsYWNlKC8jL2csIFwiXCIpLCAxNik7XG4gIGNvbnN0IGJyID0gYmggPj4gMTY7XG4gIGNvbnN0IGJnID0gKGJoID4+IDgpICYgMHhmZjtcbiAgY29uc3QgYmIgPSBiaCAmIDB4ZmY7XG4gIGNvbnN0IHJyID0gYXIgKyBhbW91bnQgKiAoYnIgLSBhcik7XG4gIGNvbnN0IHJnID0gYWcgKyBhbW91bnQgKiAoYmcgLSBhZyk7XG4gIGNvbnN0IHJiID0gYWIgKyBhbW91bnQgKiAoYmIgLSBhYik7XG5cbiAgcmV0dXJuIChcbiAgICBcIiNcIiArICgoKDEgPDwgMjQpICsgKHJyIDw8IDE2KSArIChyZyA8PCA4KSArIHJiKSB8IDApLnRvU3RyaW5nKDE2KS5zbGljZSgxKVxuICApO1xufTtcbiIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTkgTWF0dCBEZXNMYXVyaWVyc1xuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG4gKi9cbmNvbnN0IGNvbG9yQ29udHJhc3QgPSByZXF1aXJlKFwiY29sb3ItY29udHJhc3RcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gcGFsZXR0ZSA9PiB7XG4gIGNvbnN0IG1heENvbnRyYXN0ID0gdHJ1ZTtcbiAgbGV0IGJlc3RDb250cmFzdEluZGV4ID0gMDtcbiAgbGV0IGJlc3RDb250cmFzdCA9IG1heENvbnRyYXN0ID8gLUluZmluaXR5IDogSW5maW5pdHk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcGFsZXR0ZS5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGEgPSBwYWxldHRlW2ldO1xuICAgIGxldCBzdW0gPSAwO1xuICAgIC8vIEdldCB0aGUgc3VtIG9mIGNvbnRyYXN0cyBmcm9tIHRoaXMgdG8gYWxsIG90aGVyc1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgcGFsZXR0ZS5sZW5ndGg7IGorKykge1xuICAgICAgY29uc3QgYiA9IHBhbGV0dGVbal07XG4gICAgICBpZiAoYSA9PT0gYikgY29udGludWU7XG4gICAgICBzdW0gKz0gY29sb3JDb250cmFzdChhLCBiKTtcbiAgICB9XG4gICAgaWYgKG1heENvbnRyYXN0ID8gc3VtID4gYmVzdENvbnRyYXN0IDogc3VtIDwgYmVzdENvbnRyYXN0KSB7XG4gICAgICBiZXN0Q29udHJhc3QgPSBzdW07XG4gICAgICBiZXN0Q29udHJhc3RJbmRleCA9IGk7XG4gICAgfVxuICB9XG4gIGxldCBjb2xvcnMgPSBwYWxldHRlLnNsaWNlKCk7XG4gIGNvbnN0IGJhY2tncm91bmQgPSBjb2xvcnMuc3BsaWNlKGJlc3RDb250cmFzdEluZGV4LCAxKTtcbiAgcmV0dXJuIHtcbiAgICBiYWNrZ3JvdW5kLFxuICAgIHBhbGV0dGU6IGNvbG9yc1xuICB9O1xufTtcbiIsIlxuZ2xvYmFsLkNBTlZBU19TS0VUQ0hfREVGQVVMVF9TVE9SQUdFX0tFWSA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuIl19
