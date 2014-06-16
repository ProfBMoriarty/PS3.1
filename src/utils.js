// Utilities

/*jshint bitwise: false*/

// http://javascript.crockford.com/prototypal.html
if (typeof Object.create !== 'function') {
	Object.create = function (o) {
        "use strict";
		function F() {}
		F.prototype = o;
		return new F();
	};
}

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel

(function () {
	"use strict";
	var lt, v, i, prefix;

	lt = 0;
	v = ["webkit", "moz", "ms", "o"];

	for (i = 0;
		(i < v.length) && !window.requestAnimationFrame; i += 1) {
		prefix = v[i];
		window.requestAnimationFrame = window[prefix + "RequestAnimationFrame"];
		window.cancelAnimationFrame = window[prefix + "CancelAnimationFrame"] || window[prefix + "CancelRequestAnimationFrame"];
	}

	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = function (cb, e) {
			var ct, ttc, id;

			ct = new Date().getTime();
			ttc = Math.max(0, 16 - (ct - lt));
			id = window.setTimeout(function () {
				cb(ct + ttc);
			}, ttc);
			lt = ct + ttc;
			return id;
		};
	}

	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = function (id) {
			window.clearTimeout(id);
		};
	}
}());

// Fix for Unicode by Mark Diehr
// ES6 Unicode Shims 0.1, (C)2012 Steven Levithan <http://slevithan.com/> (MIT License)
(function () {
	"use strict";
	if (!String.fromCodePoint) {
		String.fromCodePoint = function () {
			var chars, i, point, offset, units;

			chars = [];
			for (i = 0; i < arguments.length; i += 1) {
				point = arguments[i];
				offset = point - 0x10000;
				units = point > 0xFFFF ? [0xD800 + (offset >> 10), 0xDC00 + (offset & 0x3FF)] : [point];
				chars.push(String.fromCharCode.apply(null, units));
			}
			return chars.join("");
		};
	}
}());
