// ps-internal
// Internal state & functionality

// Global constant-holder
var PS = PS || {};

var PERLENSPIEL = (function (my) {
	// Shared private state
	var _private = my._private = my._private || {},
		_seal = my._seal = my._seal || function () {
			delete my._private;
			delete my._seal;
			delete my._unseal;
		},
		_unseal = my._unseal = my._unseal || function () {
			my._private = _private.
			my._seal = _private._seal;
			my._unseal = _private._unseal;
		};

	// Alias for private state
	var PSEngine = _private;

	// Alias for public state
	var PSInterface = my;

	//------------------
	// PUBLIC CONSTANTS
	//------------------

	// Places the perlenspiel constants into an object
	_private.ProvideConstants = function (obj) {
		obj.ALL = "PS.ALL";
		obj.CURRENT = "PS.CURRENT";
		obj.DONE = "PS.DONE";
		obj.DEFAULT = "PS.DEFAULT";
		obj.ERROR = "PS.ERROR";
		obj.EMPTY = "PS.EMPTY";
		obj.UNEQUAL = "PS.UNEQUAL";
		obj.GRID = "PS.GRID";
		obj.HTML5_AUDIO = "PS.HTML5_AUDIO";
		obj.WEB_AUDIO = "PS.WEB_AUDIO";

		obj.SPRITE_TOUCH = "PS.SPRITE_TOUCH";
		obj.SPRITE_OVERLAP = "PS.SPRITE_OVERLAP";

		// Color constants

		obj.COLOR_BLACK = 0x000000;
		obj.COLOR_WHITE = 0xFFFFFF;
		obj.COLOR_GRAY_LIGHT = 0xC0C0C0;
		obj.COLOR_GRAY = 0x808080;
		obj.COLOR_GRAY_DARK = 0x404040;
		obj.COLOR_RED = 0xFF0000;
		obj.COLOR_ORANGE = 0xFF8000;
		obj.COLOR_YELLOW = 0xFFFF00;
		obj.COLOR_GREEN = 0x00FF00;
		obj.COLOR_BLUE = 0x0000FF;
		obj.COLOR_INDIGO = 0x4000FF;
		obj.COLOR_VIOLET = 0x8000FF;
		obj.COLOR_MAGENTA = 0xFF00FF;
		obj.COLOR_CYAN = 0x00FFFF;

		obj.ALPHA_OPAQUE = 255;
		obj.ALPHA_TRANSPARENT = 0;

		// Key constants

		obj.KEY_ENTER = 13;
		obj.KEY_TAB = 9;
		obj.KEY_ESCAPE = 27;

		obj.KEY_PAGE_UP = 1001, // 3;
		obj.KEY_PAGE_DOWN = 1002, // 3;
		obj.KEY_END = 1003, // 3;
		obj.KEY_HOME = 1004, // 3;

		obj.KEY_ARROW_LEFT = 1005, // 3;
		obj.KEY_ARROW_UP = 1006, // 3;
		obj.KEY_ARROW_RIGHT = 1007, // 3;
		obj.KEY_ARROW_DOWN = 1008, // 4;

		obj.KEY_INSERT = 1009, // 4;
		obj.KEY_DELETE = 1010, // 4;

		obj.KEY_PAD_0 = 96;
		obj.KEY_PAD_1 = 97;
		obj.KEY_PAD_2 = 98;
		obj.KEY_PAD_3 = 99;
		obj.KEY_PAD_4 = 100;
		obj.KEY_PAD_5 = 101;
		obj.KEY_PAD_6 = 102;
		obj.KEY_PAD_7 = 103;
		obj.KEY_PAD_8 = 104;
		obj.KEY_PAD_9 = 105;
		obj.KEY_F1 = 112;
		obj.KEY_F2 = 113;
		obj.KEY_F3 = 114;
		obj.KEY_F4 = 115;
		obj.KEY_F5 = 116;
		obj.KEY_F6 = 117;
		obj.KEY_F7 = 118;
		obj.KEY_F8 = 119;
		obj.KEY_F9 = 120;
		obj.KEY_F10 = 121;

		// Input device constants

		obj.WHEEL_FORWARD = "PS.WHEEL_FORWARD";
		obj.WHEEL_BACKWARD = "PS.WHEEL_BACKWARD";

		// Pathfinder constants

		obj.FINDER_ASTAR = "PS.FINDER_ASTAR";
		obj.FINDER_BREADTH_FIRST = "PS.FINDER_BREADTH_FIRST";
		obj.FINDER_BEST_FIRST = "PS.FINDER_BEST_FIRST";
		obj.FINDER_DIJKSTRA = "PS.FINDER_DIJKSTRA";
		obj.FINDER_BI_ASTAR = "PS.FINDER_BI_ASTAR";
		obj.FINDER_BI_BEST_FIRST = "PS.FINDER_BI_BEST_FIRST";
		obj.FINDER_BI_DIJKSTRA = "PS.FINDER_BI_DIJKSTRA";
		obj.FINDER_BI_BREADTH_FIRST = "PS.FINDER_BI_BREADTH_FIRST";
		obj.FINDER_JUMP_POINT = "PS.FINDER_JUMP_POINT";

		// Multispiel support
		obj.DEFAULT_NAMESPACE = "game";
	}

	// Copy perlenspiel constants into global object
	_private.ProvideConstants(PS);

	//------------------
	// PRIVATE CONSTANTS
	//------------------

	// DOM element ids

	_private._OUTER_CLASS = "outer";
	_private._MAIN_CLASS = "main";
	_private._DEBUG_CLASS = "debug";
	_private._STATUS_P_CLASS = "stsp";
	_private._INPUT_P_CLASS = "inp";
	_private._INPUT_LABEL_CLASS = "inlabel";
	_private._INPUT_SPAN_CLASS = "inspan";
	_private._INPUT_BOX_CLASS = "inbox";
	_private._GRID_CLASS = "grid";
	_private._FOOTER_CLASS = "footer";
	_private._MONITOR_CLASS = "monitor";

	_private._OUTER_ID = _private._NAMESPACE + "-" + _private._OUTER_CLASS;
	_private._MAIN_ID = _private._NAMESPACE + "-" + _private._MAIN_CLASS;
	_private._INIT_ID = "init";
	_private._DEBUG_ID = _private._NAMESPACE + "-" + _private._DEBUG_CLASS;
	_private._STATUS_P_ID = _private._NAMESPACE + "-" + _private._STATUS_P_CLASS;
	_private._INPUT_P_ID = _private._NAMESPACE + "-" + _private._INPUT_P_CLASS;
	_private._INPUT_LABEL_ID = _private._NAMESPACE + "-" + _private._INPUT_LABEL_CLASS;
	_private._INPUT_SPAN_ID = _private._NAMESPACE + "-" + _private._INPUT_SPAN_CLASS;
	_private._INPUT_BOX_ID = _private._NAMESPACE + "-" + _private._INPUT_BOX_CLASS;
	_private._GRID_ID = _private._NAMESPACE + "-" + _private._GRID_CLASS;
	_private._FOOTER_ID = _private._NAMESPACE + "-" + _private._FOOTER_CLASS;
	_private._MONITOR_ID = _private._NAMESPACE + "-" + _private._MONITOR_CLASS;

	_private._LOGIN_ID = "login";
	_private._LOGIN_EMAIL_ID = "login_em";
	_private._LOGIN_PW1_ID = "login_pw1";
	_private._LOGIN_PW2_ID = "login_pw2";
	_private._LOGIN_BUT_ID = "login_but";
	_private._LOGIN_SIGNUP_ID = "login_su";
	_private._LOGIN_RECOVER_ID = "login_re";

	// Element prefixes

	_private._IMAGE_PREFIX = "image_";
	_private._SPRITE_PREFIX = "sprite_";
	_private._PATHMAP_PREFIX = "pathmap_";
	_private._TIMER_PREFIX = "timer_";

	// Misc constants

	_private._CLIENT_SIZE = 512; // client size in pixels
	_private._ALPHOID = 1.0 / 255; // alpha step constant
	_private._RSHIFT = 256 * 256;
	_private._GSHIFT = 256;
	_private._MAX_BEADS = 1024; // 32 x 32 maximum bead count
	_private._EMPTY = {}; // a generic empty object
	_private._DEFAULT_KEY_DELAY = 6; // key repeat rate (1/10 sec)
	_private._KEY_SHIFT = 16; // shift keycode
	_private._KEY_CTRL = 17; // ctrl keycode
	_private._CLEAR = -1; // flag for not touching or not over a bead
	_private._FADER_FPS = 4; // do fader queue every 1/15 of a second
	_private._DIAGONAL_COST = 1.4142; // square root of 2; for pathfinder
	_private._LABEL_MAX = 16; // maximum input label length

	// Names of instrument files

	_private._PIANO_FILES = [
		"a0", "bb0", "b0",
		"c1", "db1", "d1", "eb1", "e1", "f1", "gb1", "g1", "ab1", "a1", "bb1", "b1",
		"c2", "db2", "d2", "eb2", "e2", "f2", "gb2", "g2", "ab2", "a2", "bb2", "b2",
		"c3", "db3", "d3", "eb3", "e3", "f3", "gb3", "g3", "ab3", "a3", "bb3", "b3",
		"c4", "db4", "d4", "eb4", "e4", "f4", "gb4", "g4", "ab4", "a4", "bb4", "b4",
		"c5", "db5", "d5", "eb5", "e5", "f5", "gb5", "g5", "ab5", "a5", "bb5", "b5",
		"c6", "db6", "d6", "eb6", "e6", "f6", "gb6", "g6", "ab6", "a6", "bb6", "b6",
		"c7", "db7", "d7", "eb7", "e7", "f7", "gb7", "g7", "ab7", "a7", "bb7", "b7",
		"c8"
	];

	_private._HCHORD_FILES = [
		"a2", "bb2", "b2",
		"c3", "db3", "d3", "eb3", "e3", "f3", "gb3", "g3", "ab3", "a3", "bb3", "b3",
		"c4", "db4", "d4", "eb4", "e4", "f4", "gb4", "g4", "ab4", "a4", "bb4", "b4",
		"c5", "db5", "d5", "eb5", "e5", "f5", "gb5", "g5", "ab5", "a5", "bb5", "b5",
		"c6", "db6", "d6", "eb6", "e6", "f6", "gb6", "g6", "ab6", "a6", "bb6", "b6",
		"c7", "db7", "d7", "eb7", "e7", "f7"
	];

	_private._XYLO_FILES = [
		"a4", "bb4", "b4",
		"c5", "db5", "d5", "eb5", "e5", "f5", "gb5", "g5", "ab5", "a5", "bb5", "b5",
		"c6", "db6", "d6", "eb6", "e6", "f6", "gb6", "g6", "ab6", "a6", "bb6", "b6",
		"c7", "db7", "d7", "eb7", "e7", "f7", "gb7", "g7", "ab7", "a7", "bb7", "b7"
	];

	// All system defaults kept in this object
	// On startup, they are copied into [_DEFAULTS] for referencing
	// This will (someday) permit defaults to be overwritten by user

	_private._DEFAULTS = {

		// Grid defaults

		grid: {
			x: 8,
			y: 8,
			max: 32,
			plane: 0,
			color: {
				r: 255,
				g: 255,
				b: 255,
				a: 255,
				rgb: 0xFFFFFF,
				str: "rgba(255,255,255,1)"
			},
			shadow: {
				show: false,
				r: 0xC0,
				g: 0xC0,
				b: 0xC0,
				a: 255,
				rgb: 0xC0C0C0,
				str: "rgba(192,192,192,1)",
				params: "0px 0px 64px 8px "
			},
			padLeft: 0,
			padRight: 0,
			ready: false
		},

		// Status line defaults

		status: {
			text: "",
			label: "",
			exec: null,
			color: {
				r: 0,
				g: 0,
				b: 0,
				a: 255,
				rgb: 0x000000,
				str: "rgba(0,0,0,1)"
			}
		},

		// Fader defaults

		fader: {
			active: false,
			kill: false,
			r: 0,
			g: 0,
			b: 0,
			rgb: null,
			tr: 0,
			tg: 0,
			tb: 0,
			trgb: 0,
			tstr: null,
			step: 0,
			rate: 0,
			onStep: null,
			onEnd: null,
			params: null
		},

		// Bead defaults

		bead: {
			dirty: true,
			active: true,
			visible: true,
			planes: null,
			color: {
				r: 255,
				g: 255,
				b: 255,
				a: 255,
				rgb: 0xFFFFFF,
				str: "rgba(255,255,255,1)"
			},
			bgColor: {
				r: 255,
				g: 255,
				b: 255,
				a: 0,
				rgb: 0xFFFFFF,
				str: "rgba(255,255,255,0)"
			},
			radius: 0,
			scale: 100,
			data: 0,
			exec: null,

			// bead border

			border: {
				width: 1,
				equal: true,
				top: 1,
				left: 1,
				bottom: 1,
				right: 1,
				color: {
					r: 128,
					g: 128,
					b: 128,
					a: 255,
					rgb: 0x808080,
					str: "rgba(128,128,128,1)"
				}
			},

			// bead glyph

			glyph: {
				str: "",
				code: 0,
				scale: 100,
				size: 0,
				x: 0,
				y: 0,
				font: null,
				color: {
					r: 0,
					g: 0,
					b: 0,
					a: 255,
					rgb: 0x000000,
					str: "rgba(0,0,0,1)"
				}
			}
		},

		// audio defaults

		audio: {
			volume: 0.5,
			max_volume: 1.0,
			path: "http://alpheus.wpi.edu/~bmoriarty/ps/audio/",
			loop: false,
			error_sound: "fx_uhoh"
		}
	};

	//----------------
	// Private globals
	//----------------

	// System gestalt

	_private._system = {
		engine: "Perlenspiel",
		major: 3,
		minor: 1,
		revision: 6,
		audio: null, // populated by PS._sys()
		host: {
			app: "",
			version: "",
			os: ""
		},
		inputs: {
			touch: false
		}
	};

	// color strings
	_private._RSTR;
	_private._GBSTR;
	_private._BASTR
	_private._ASTR;

	_private._main = null; // main DOM element
	_private._init = null; // font loading div

	_private._grid; // master grid object
	_private._beads; // master list of bead objects
	_private._status; // status line object

	_private._anyDirty = false; // dirty bead flag

	// Image support

	_private._imageCanvas; // canvas object for image extraction
	_private._imageList; // list of images being loaded
	_private._imageCnt; // counter for image ids

	// Sprite support

	_private._sprites; // master sprite list
	_private._spriteCnt; // counter for sprite ids

	// Clock support

	_private._clockActive; // true if clock should be running
	_private._timers; // master timer list
	_private._timerCnt; // unique timer id
	_private._faders; // master fader list
	_private._faderTick; // fader countdown

	// Keyboard support

	_private._keysActive; // true if keyboard events are active
	_private._transKeys; // regular key translation array
	_private._shiftedKeys; // shifted key translation array
	_private._unshiftedKeys; // unshifted key translation array
	_private._pressed; // array of keys being pressed
	_private._holding; // array of keys being held down
	_private._holdShift; // true if shift is held down
	_private._holdCtrl; // true if ctrl key is held down

	// Key delay control

	_private._keyRepeat; // true for key repeat
	_private._keyDelay; // delay countdown
	_private._keyDelayRate; // key delay rate
	_private._keyInitRate; // initial key delay rate

	// Touch support

	_private._touchScreen; // true if platform uses touch
	_private._deviceScaling; // needed for annoying mobile browsers with weird scaling
	_private._currentFinger; // index of finger touching screen
	_private._underBead; // bead currently under finger
	_private._overGrid; // true when cursor/finger is over the grid
	_private._lastBead = -1; // index of last bead used

	// Debugger support

	_private._debugging; // true if debugger open
	_private._debugFocus; // true if debugger has focus
	_private._footer; // DOM footer element
	_private._errorSound; // error sound available?

	// Pathfinder support

	_private._pathmaps; // array of pathmaps
	_private._pathmapCnt; // counter for pathmap ids

	// Footer fader

	_private._footerTimer = null;
	_private._footerDelay = 50; // wait 5 seconds before fade
	_private._footerOpacity = 1.0;

	_private._footerFade = function () {
		if (_private._footerDelay >= 0) {
			_private._footerDelay -= 1;
		} else {
			_private._footerOpacity -= 0.05;
			if (_private._footerOpacity <= 0) {
				PSInterface.timerStop(_private._footerTimer);
				_private._footerTimer = null;
				_private._footerOpacity = 0;
			}
			_private._footer.style.opacity = _private._footerOpacity;
		}
	}

	//----------------
	// GENERAL SUPPORT
	//----------------

	// Improved typeof by Doug Crockford, with NaN detection by me

	_private._typeOf = function (value) {
		var type;

		type = typeof value;
		if (type === "number") {
			if (isNaN(value)) {
				type = "NaN";
			}
		} else if (type === "object") {
			if (value) {
				if (value instanceof Array) {
					type = "array";
				}
			} else {
				type = "null";
			}
		}

		return type;
	}

	// _private._isBoolean ( val )
	// Evaluates [val] for a valid boolean: true, false, null, numeric, PS.CURRENT, PS.DEFAULT or undefined
	// [currentVal] is PS.CURRENT value
	// [defaultVal] is PS.DEFAULT value
	// [undefinedVal] is undefined value
	// Returns true, false or PS.ERROR

	_private._isBoolean = function (valP, currentVal, defaultVal, undefinedVal) {
		var val, type;

		val = valP; // prevent arg mutation

		if ((val !== true) && (val !== false)) {
			if (val === null) {
				val = false;
			} else if (val === PS.CURRENT) {
				val = currentVal;
			} else if (val === PS.DEFAULT) {
				val = defaultVal;
			} else {
				type = _private._typeOf(val);
				if (type === "undefined") {
					val = undefinedVal;
				} else if (type === "number") {
					val = (val !== 0);
				} else {
					val = PS.ERROR;
				}
			}
		}

		return val;
	}

	// _private._isInteger ( val )
	// Evaluates [val] for a valid number, PS.CURRENT, PS.DEFAULT or undefined
	// [currentVal] is PS.CURRENT value
	// [defaultVal] is PS.DEFAULT value
	// [undefinedVal] is undefined value
	// Returns floored integer or PS.ERROR

	/*
	_private._isInteger = function ( valP, currentVal, defaultVal, undefinedVal )
	{
		var val, type;

		val = valP; // prevent arg mutation

		if ( val === PS.CURRENT )
		{
			val = currentVal;
		}
		else if ( val === PS.DEFAULT )
		{
			val = defaultVal;
		}
		else
		{
			type = _private._typeOf( val );
			if ( type === "undefined" )
			{
				val = undefinedVal;
			}
			else if ( type === "number" )
			{
				val = Math.floor( val );
			}
			else
			{
				val = PS.ERROR;
			}
		}

		return val;
	}
	*/

	// Recursively copy all properties of [src] object into [dest] object
	// Returns true on success, else PS.ERROR

	_private._copy = function (src, dest) {
		var prop, item, obj, type;

		for (prop in src) {
			if (src.hasOwnProperty(prop)) {
				item = src[prop];

				// Check type of item
				// If property is an object, recurse

				type = _private._typeOf(item);
				if (type === "object") {
					obj = {};
					_private._copy(item, obj);
					item = obj;
				}
				dest[prop] = item;
			}
		}
	}

	// _private._endEvent( event )
	// Properly terminates a DOM event

	_private._endEvent = function (event) {
		if (event.stopPropagation) {
			event.stopPropagation();
		} else {
			event.cancelBubble = true;
		}
		event.preventDefault(); // prevents weirdness
		return false;
	}

	//--------------------
	// GRAPHICS PRIMITIVES
	//--------------------

	// Draw bead with specified colors

	_private._drawBead = function (bead, borderColor, beadColor, glyphColor, bgColor, gridColor) {
		var ctx, size, left, top, width, height, border, scaled, radius, curve;

		ctx = _private._grid.context;
		size = _private._grid.bead_size;

		// establish default location and dimensions of bead color rect

		left = bead.left;
		top = bead.top;
		width = size;
		height = size;

		if (!bead.visible) {
			ctx.fillStyle = gridColor;
			ctx.fillRect(left, top, width, height);
			return;
		}

		// Paint bgColor if scaled or non-zero radius

		scaled = (bead.size < size);
		radius = bead.radius;
		if (scaled || (radius > 0)) {
			// If bgColor has transparency, must draw grid color first
			// This is horribly inefficient

			if (bead.bgColor.a < 255) {
				ctx.fillStyle = gridColor;
				ctx.fillRect(left, top, width, height);
			}

			// Only draw bgColor if not transparent

			if (bead.bgColor.a > 0) {
				ctx.fillStyle = bgColor;
				ctx.fillRect(left, top, width, height);
			}

			// If scaled, adjust working rect

			if (scaled) {
				left += bead.margin;
				top += bead.margin;
				width = bead.size;
				height = bead.size;
			}
		}

		// Draw border if needed

		border = bead.border;
		if (border.width > 0) // > 0 if any border is visible
		{
			// Draw grid color first if border has transparency
			// This is horribly inefficient

			if (border.color.a < 255) {
				ctx.fillStyle = gridColor;
				ctx.fillRect(left, top, width, height);
			}

			// Only draw border if not transparent

			if (border.color.a > 0) {
				ctx.fillStyle = borderColor;
				if (radius === 0) {
					ctx.fillRect(left, top, width, height);
				} else {
					curve = Math.floor((width * radius) / 100);
					curve = ctx.fillRoundedRect(left, top, width, height, curve);
				}
			}

			// adjust position and size of color rect

			left += border.left;
			top += border.top;
			width -= (border.left + border.right);
			height -= (border.top + border.bottom);
		}

		// Draw color rect

		ctx.fillStyle = beadColor;
		if (radius === 0) {
			ctx.fillRect(left, top, width, height);
		} else {
			curve = Math.floor((width * radius) / 100);
			ctx.fillRoundedRect(left, top, width, height, curve);
		}

		// draw glyph if present and not transparent

		if ((bead.glyph.code > 0) && (bead.glyph.color.a > 0)) {
			_private._grid.context.font = bead.glyph.font;
			ctx.fillStyle = glyphColor;
			ctx.fillText(bead.glyph.str, bead.left + bead.glyph.x, bead.top + bead.glyph.y);
		}
	}

	// _private._colorBlendAlpha( c0, c1 )
	// Blend color c1 over c0. Color components are in 0-255, alpha is 0-1
	// Added by Mark Diehr

	_private._colorBlendAlpha = function (c0, c1) {
		var alphaCover, result;

		alphaCover = c0.a * (1 - c1.a);
		result = {
			r: Math.floor((c1.r * c1.a) + (c0.r * alphaCover)),
			g: Math.floor((c1.g * c1.a) + (c0.g * alphaCover)),
			b: Math.floor((c1.b * c1.a) + (c0.b * alphaCover))
		};
		return result;
	}

	// _private._calcColor ( bead, gridColor )
	// Calculates effective color of a bead against a background color
	// Returns values through [target] object
	// Calculates effective color of a bead against a background color
	// Returns values through [target] object
	// Modified by Mark Diehr

	_private._calcColor = function (bead, backColor, target) {
		var pr, pg, pb, planes, len, i, color, level, r, g, b, a, beadAlpha, c0, c1, colorResult;

		pr = backColor.r;
		pg = backColor.g;
		pb = backColor.b;

		planes = bead.planes;
		len = planes.length;

		for (i = 0; i < len; i += 1) {
			level = planes[i];
			color = level.color;
			r = color.r;
			g = color.g;
			b = color.b;
			a = color.a;

			// Calculate effect of overlaying the new color

			if (a > 0) {
				if (a < 255) // Blend color
				{
					beadAlpha = Math.max(0, Math.min((a / 255), 1)); // Rescale and clamp alpha to range [0..1]
					c0 = {
						r: pr,
						g: pg,
						b: pb,
						a: 1
					}; // Back color
					c1 = {
						r: r,
						g: g,
						b: b,
						a: beadAlpha
					}; // Fore color
					colorResult = _private._colorBlendAlpha(c0, c1);

					// Write results

					pr = colorResult.r;
					pg = colorResult.g;
					pb = colorResult.b;
				} else // Overwrite color
				{
					pr = r;
					pg = g;
					pb = b;
				}
			}
		}

		// Take results from the calculated color

		r = pr;
		g = pg;
		b = pb;

		// [ r | g | b ] now contain new effective target color

		target.rgb = (r * _private._RSHIFT) + (g * _private._GSHIFT) + b;
		target.r = r;
		target.g = g;
		target.b = b;
		target.str = _private._RSTR[r] + _private._GBSTR[g] + _private._BASTR[b];
	}

	// Fader functions

	// _private._gridRGB ( data )
	// Set grid background color from data.str property

	// Global color object
	// Avoid making a new object for every call

	_private._bcolor = {
		rgb: 0,
		r: 0,
		g: 0,
		b: 0,
		str: ""
	};

	_private._gridRGB = function (data) {
		var str, canvas, i, bead, level, color, beadColor, borderColor;

		str = data.str;

		canvas = _private._grid.canvas;

		// Clear parts of canvas not under the grid

		canvas.style.backgroundColor = str;

		/*
		context = _private._grid.context;
		if ( _private._grid.left > 0 )
		{
			context.clearRect( 0, _private._grid.top, _private._grid.left, canvas.height );
		}
		if ( _private._grid.right < canvas.width )
		{
			context.clearRect( _private._grid.right, _private._grid.top, canvas.width - _private._grid.right, canvas.height );
		}
		if ( _private._grid.bottom < canvas.height )
		{
			context.clearRect( 0, _private._grid.bottom, canvas.width, canvas.height - _private._grid.bottom );
		}
		*/

		// set browser background (if not in multispiel mode)
		if (_private._NAMESPACE === PS.DEFAULT_NAMESPACE)
			document.body.style.backgroundColor = str;

		// Set outer div background
		var outer = document.getElementById(_private._OUTER_ID);
		outer.style.backgroundColor = str;

		// set status line background

		_private._status.statusP.style.backgroundColor = str;
		_private._status.inputP.style.backgroundColor = str;

		// set footer background

		_private._footer.style.backgroundColor = str;

		// Redraw all invisible, small or alpha-affected beads

		for (i = 0; i < _private._grid.count; i += 1) {
			bead = _private._beads[i];

			// If plane 0 isn't opaque, must recalc bead color

			level = bead.planes[0]; // get first bead plane
			color = level.color; // color of plane
			if (color.a < 255) {
				_private._calcColor(bead, data, _private._bcolor); // calc effective color
				beadColor = _private._bcolor.str;
			} else // just use current
			{
				beadColor = bead.color.str;
			}

			borderColor = bead.border.color;

			if (!bead.visible || (bead.size < _private._grid.bead_size) || (bead.radius > 0) || (color.a < 255) || (borderColor.a < 255)) {
				_private._drawBead(bead, borderColor.str, beadColor, bead.glyph.color.str, bead.bgColor.str, str);
			}
		}
	}

	// Call when done fading grid
	// Insures visible color for message line

	_private._gridRGBEnd = function (data) {
		var r, g, b;

		// set footer text to a complimentary color

		if (data.r > 127) {
			r = 0;
		} else {
			r = 255;
		}

		if (data.g > 127) {
			g = 0;
		} else {
			g = 255;
		}

		if (data.b > 127) {
			b = 0;
		} else {
			b = 255;
		}

		_private._footer.style.color = _private._RSTR[r] + _private._GBSTR[g] + _private._BASTR[b];
	}

	// Set color of grid shadow

	_private._gridShadowRGB = function (data) {
		_private._grid.canvas.style.boxShadow = _private._grid.shadow.params + data.str;
	}

	// Change status line text color

	_private._statusRGB = function (data) {
		_private._status.statusP.style.color = data.str;
		_private._status.inputP.style.color = data.str;
	}

	// Change bead color

	_private._beadRGBA = function (data, element) {
		var bead;

		bead = _private._beads[element];
		_private._drawBead(bead, bead.border.color.str, data.str, bead.glyph.color.str, bead.bgColor.str, _private._grid.color.str);
	}

	// Change border color

	_private._borderRGBA = function (data, element) {
		var bead;

		bead = _private._beads[element];
		_private._drawBead(bead, data.str, bead.color.str, bead.glyph.color.str, bead.bgColor.str, _private._grid.color.str);
	}

	// Change glyph color

	_private._glyphRGBA = function (data, element) {
		var bead;

		bead = _private._beads[element];
		_private._drawBead(bead, bead.border.color.str, bead.color.str, data.str, bead.bgColor.str, _private._grid.color.str);
	}

	// Mark a bead as dirty

	_private._makeDirty = function (bead) {
		bead.dirty = true;
		_private._anyDirty = true;
	}

	// Draw all dirty beads

	_private._gridDraw = function () {
		var len, i, bead;

		if (_private._anyDirty) {
			len = _private._grid.count;
			for (i = 0; i < len; i += 1) {
				bead = _private._beads[i];
				if (bead.dirty) {
					bead.dirty = false;
					_private._drawBead(bead, bead.border.color.str, bead.color.str, bead.glyph.color.str, bead.bgColor.str, _private._grid.color.str);
				}
			}
			_private._anyDirty = false;
		}
	}

	//-------------------------
	// DEBUGGER & ERROR SUPPORT
	//-------------------------

	// Improved error reporter with stack trace
	// Based on code by Mark Diehr

	// Open debugger div, clear monitor

	_private._debugOpen = function () {
		var e;

		// Show the debug div if not already open

		if (!_private._debugging) {
			e = document.getElementById(_private._DEBUG_ID);
			e.style.display = "inline";

			// clear the monitor

			e = document.getElementById(_private._MONITOR_ID);
			e.value = "";

			_private._debugging = true;
			_private._debugFocus = false;
		}
	}

	// Send warning message to debugger

	_private._warning = function (str) {
		if ((typeof str !== "string") || (str.length < 1)) {
			str = "???";
		}

		PSInterface.debug("WARNING: " + str + "\n");
	}

	// Check the number of arguments that were passed to a function

	_private._checkNumArgs = function (methodName, numArgs, min, max) {
		if (numArgs < min) {
			return _private._error(methodName + "Missing argument(s)");
		}

		if (numArgs > max) {
			return _private._error(methodName + "Too many arguments");
		}
	}

	// Makes sure that a colors object has all of its properties filled out

	_private._checkColors = function (colors, current, defaults) {
		var r, g, b;
		var rgb = colors.rgb;
		if (rgb === PS.CURRENT) {
			return PS.CURRENT;
		} else if (rgb === null) // must inspect r/g/b values
		{
			r = colors.r;
			if (r === PS.CURRENT) {
				colors.r = r = current.r;
			} else if (r === PS.DEFAULT) {
				colors.r = r = defaults.r;
			}

			g = colors.g;
			if (g === PS.CURRENT) {
				colors.g = g = current.g;
			} else if (g === PS.DEFAULT) {
				colors.g = g = defaults.g;
			}

			b = colors.b;
			if (b === PS.CURRENT) {
				colors.b = b = current.b;
			} else if (b === PS.DEFAULT) {
				colors.b = b = defaults.b;
			}

			colors.rgb = (r * _private._RSHIFT) + (g * _private._GSHIFT) + b;
		} else if (rgb === PS.DEFAULT) {
			// Copy the defaults into the colors object
			_private._copy(defaults, colors);
		}

		return colors.rgb;
	}

	// Debugger options

	_private._DEBUG_STACK = true; // Show debug stack
	_private._DEBUG_HTML = false; // Show .html source

	_private._decodeStackLine = function (str) {
		var text, index, name;

		text = "";

		if (str.search(".js") !== -1) // Code lines
		{
			index = str.lastIndexOf("/") + 1;
			name = str.substr(index).replace(/^[\s\(\)]+|[\s\(\)]+$/g, '');

			// Remove the column from the line

			if (name.split(":").length === 3) {
				name = name.substr(0, name.lastIndexOf(":"));
			}
			if (name !== "") {
				text += ("    " + name + "\n");
			}
		} else if (_private._DEBUG_HTML && (str.search(".htm") !== -1)) // HTML line
		{
			text += ("\n" + str);
		}

		return text;
	}

	_private._decodeCallstack = function (str) {
		var lines, len, i, text;

		if (console && console.log) {
			console.log(str);
		}

		if (!str.split) {
			return str;
		}

		lines = str.split('\n');
		text = "";

		len = lines.length;
		for (i = 0; i < len; i += 1) {
			text += _private._decodeStackLine(lines[i]);
		}

		return text;
	}

	_private._errorCatch = function (message, err) {
		var str;

		// Stop the clock

		_private._clockActive = false;
		if (_private._footerTimer && _private._timers.length > 0) {
			PSInterface.timerStop(_private._footerTimer);
		}

		if ((typeof message !== "string") || (message.length < 1)) {
			message = "???";
		}

		str = "ERROR: " + message + "\n";

		// set footer

		_private._footer.style.opacity = 1.0;
		_private._footer.innerHTML = str;

		// Only debugger gets call stack

		if (_private._DEBUG_STACK && err) {
			str += (_private._decodeCallstack(err.stack) + "\n");
		}
		PSInterface.debug(str);

		if (_private._errorSound) {
			PSInterface.audioPlay(_private._DEFAULTS.audio.error_sound, {
				path: _private._DEFAULTS.audio.path
			});
		}

		return PS.ERROR;
	}

	_private._error = function (message) {
		// Throw error to access callstack

		try {
			throw (new Error("!"));
		} catch (err) {
			return _private._errorCatch(message, err);
		}
	}

	// Keep debugger window scrolled to bottom

	_private._scrollDown = function () {
		var e;

		e = document.getElementById(_private._MAIN_ID);
		e.scrollTop = e.scrollHeight;
	}

	//-------------
	// FADER ENGINE
	//-------------

	// Init fader engine

	_private._initFaders = function () {
		_private._faders = [];
		_private._faderTick = 0;
	}

	// Reset a fader

	_private._resetFader = function (fader) {
		_private._copy(_private._DEFAULTS.fader, fader);
		fader.frames.length = 0;
	}

	// Return a new fader object
	// This should be called only once for each element, at system startup

	_private._newFader = function (element, exec, execEnd) {
		var fader;

		fader = {
			element: element, // element identifier
			exec: exec, // function to call with element and r/g/b/a when changing color
			execEnd: execEnd, // function to call after final color change
			frames: []
		};

		_private._resetFader(fader);

		return fader;
	}

	// Calc fader steps
	// [r/g/b] are current colors, [tr/tg/tb] target colors
	// Precalculates all color animation steps
	// Assumes all properties except [step] and [frames] specified

	_private._calcFader = function (fader, r, g, b, a, tr, tg, tb, ta) {
		var cr, cg, cb, ca, cnt, step, percent, frame, r_delta, g_delta, b_delta, a_delta, any, delta;

		fader.step = 0;
		fader.frames.length = 0;

		if ((r === tr) && (g === tg) && (b === tb) && (a === ta)) {
			return;
		}

		// Save target data in the fader

		fader.tr = tr;
		fader.tg = tg;
		fader.tb = tb;
		fader.ta = ta;
		fader.trgb = (tr * _private._RSHIFT) + (tg * _private._GSHIFT) + tb;
		fader.tstr = _private._RSTR[tr] + _private._GBSTR[tg] + _private._GBSTR[tb] + _private._ASTR[ta];

		cr = r;
		cg = g;
		cb = b;
		ca = a;

		// Calc deltas only once

		if (r > tr) {
			r_delta = -(r - tr);
		} else {
			r_delta = tr - r;
		}

		if (g > tg) {
			g_delta = -(g - tg);
		} else {
			g_delta = tg - g;
		}

		if (b > tb) {
			b_delta = -(b - tb);
		} else {
			b_delta = tb - b;
		}

		if (a > ta) {
			a_delta = -(a - ta);
		} else {
			a_delta = ta - a;
		}

		// rate is expressed in 60ths of a second

		if (fader.rate < _private._FADER_FPS) {
			cnt = 1;
		} else {
			cnt = Math.ceil(fader.rate / _private._FADER_FPS);
		}

		step = 100 / cnt;
		percent = 0;
		do {
			any = false;
			frame = {};
			percent += step;
			if (percent >= 100) {
				frame.r = tr;
				frame.g = tg;
				frame.b = tb;
				frame.a = ta;
			} else {
				// red

				if (cr !== tr) {
					delta = (percent * r_delta) / 100;
					cr = r + delta;
					cr = Math.round(cr);
					any = true;
				}
				frame.r = cr;

				// green

				if (cg !== tg) {
					delta = (percent * g_delta) / 100;
					cg = g + delta;
					cg = Math.round(cg);
					any = true;
				}
				frame.g = cg;

				// blue

				if (cb !== tb) {
					delta = (percent * b_delta) / 100;
					cb = b + delta;
					cb = Math.round(cb);
					any = true;
				}
				frame.b = cb;

				// alpha

				if (ca !== ta) {
					delta = (percent * a_delta) / 100;
					ca = a + delta;
					ca = Math.round(ca);
					any = true;
				}
				frame.a = ca;
			}

			frame.rgb = (frame.r * _private._RSHIFT) + (frame.g * _private._GSHIFT) + frame.b;
			frame.str = _private._RSTR[frame.r] + _private._GBSTR[frame.g] + _private._GBSTR[frame.b] + _private._ASTR[frame.a];
			fader.frames.push(frame);

			// stop now if already matched

			if (!any) {
				return;
			}
		}
		while (percent < 100);
	}

	// Start a fader
	// Precalculates all color animation steps
	// Assumes all properties except [step] and [frames] specified

	_private._startFader = function (fader, r, g, b, a, tr, tg, tb, ta) {
		_private._calcFader(fader, r, g, b, a, tr, tg, tb, ta);
		if (fader.frames.length > 0) {
			fader.kill = false;
			fader.active = true;
			_private._faders.push(fader);
		}
	}

	// Recalculate color animation steps for a fade in progress

	_private._recalcFader = function (fader, tr, tg, tb, ta) {
		var restart, len, step, frame;

		restart = fader.active; // save active status

		fader.active = false;

		len = fader.frames.length;
		if (len > 0) {
			step = fader.step;

			// just in case ...

			if (step >= len) {
				step = len - 1; // use last step
			}

			frame = fader.frames[step];
			_private._calcFader(fader, frame.r, frame.g, frame.b, frame.a, tr, tg, tb, ta); // may result in no frames!
		}

		// precaution ...

		if (fader.frames.length > 0) {
			fader.active = restart;
		}
	}

	//-------------
	// SYSTEM CLOCK
	//-------------

	// Init user timers

	_private._initTimers = function () {
		_private._timers = [];
		_private._timerCnt = 0;
	}

	/*
	_private._lastTime = 0;

	_private._reportTime = function ()
	{
		var date, now;

		date = new Date();
		now = date.getTime();
		PSInterface.statusText ( "MS: " + ( now - _private._lastTime ) );
		_private._lastTime = now;
	}
	*/

	_private._tick = function () {
		var fn, refresh, len, i, fader, frame, flen, key, timer, result, exec, id, params;

		// _private._reportTime();

		fn = "[_tick] ";

		refresh = false;

		// Fader support

		_private._faderTick += 1;
		if (_private._faderTick >= _private._FADER_FPS) {
			_private._faderTick = 0;
			len = _private._faders.length;
			i = 0;
			while (i < len) {
				fader = _private._faders[i];
				flen = fader.frames.length; // number of frames in this fader
				if (fader.kill) {
					_private._faders.splice(i, 1); // remove this frame
					len -= 1;
				} else if (fader.active) // only active faders
				{
					frame = fader.frames[fader.step]; // current frame

					// Call user onStep if present

					exec = fader.onStep;
					if (exec) {
						// 1st param = number of fader steps
						// 2nd param = current step
						// 3rd param = current rgb color

						params = [flen, fader.step, frame.rgb];
						if (fader.params) {
							params = params.concat(fader.params); // append user params
						}
						try {
							result = exec.apply(_private._EMPTY, params);
							if ((result === false) || (result === null)) {
								// skip ahead to final step
								fader.step = flen - 1;
								frame = fader.frames[fader.step];
							}
							refresh = true;
						} catch (e1) {
							_private._errorCatch(fn + "fader .onStep failed [" + e1.message + "]", e1);
							return;
						}
					}

					if (fader.exec) {
						try {
							fader.exec(frame, fader.element); // call frame exec with frame data and fader element
						} catch (e2) {
							_private._errorCatch(fn + "fader .exec failed [" + e2.message + "]", e2);
							return;
						}
					}

					fader.step += 1;
					if (fader.step >= flen) {
						fader.active = false;
						fader.step = 0;
						fader.frames.length = 0;

						// Call system execEnd if present

						if (fader.execEnd) {
							try {
								fader.execEnd(frame, fader.element);
							} catch (e3) {
								_private._errorCatch(fn + "fader .execEnd failed [" + e3.message + "]", e3);
								return;
							}
						}

						// Call user onEnd if present

						exec = fader.onEnd;
						if (exec) {
							params = fader.params;
							if (!params) {
								params = [];
							}
							try {
								exec.apply(_private._EMPTY, params);
								refresh = true;
							} catch (e4) {
								_private._errorCatch(fn + "fader .onEnd failed [" + e4.message + "]", e4);
								return;
							}
						}

						// remove fader from queue

						_private._faders.splice(i, 1);
						len -= 1;
					} else {
						i += 1;
					}
				} else {
					i += 1;
				}
			}
		}

		// Key hold support

		len = _private._holding.length;
		if (_private._keyRepeat && (len > 0)) {
			if (_private._keyDelay > 0) {
				_private._keyDelay -= 1;
			} else {
				_private._keyDelay = _private._keyDelayRate; // reset delay
				for (i = 0; i < len; i += 1) {
					key = _private._holding[i];
					if (key) {
						try {
							PS.keyDown(key, _private._holdShift, _private._holdCtrl);
							refresh = true;
						} catch (e5) {
							_private._errorCatch(fn + "Key repeat failed [" + e5.message + "]", e5);
							return;
						}
					}
				}
			}
		}

		// User timer support
		// Must account for possibility that timer array will be changed by timers!

		// timer.id = unique id string
		// timer.delay = tick delay between calls
		// timer.count = delay countdown timer
		// timer.exec = function to call
		// timer.arglist = array with function arguments

		len = _private._timers.length;
		if (len > 0) // any timers?
		{
			i = 0;
			while (i < len) {
				timer = _private._timers[i];
				id = timer.id; // save the id in case of change

				// Call the exec if countdown timer is expired

				timer.count -= 1; // decrement countdown
				if (timer.count < 1) {
					timer.count = timer.delay; // reset countdown

					try {
						result = timer.exec.apply(_private._EMPTY, timer.arglist);
						refresh = true;
					} catch (e6) {
						result = _private._errorCatch(fn + "Timed function failed [" + e6.message + "]", e6);
					}

					// If exec result is PS.ERROR, remove from queue

					if (result === PS.ERROR) {
						PSInterface.timerStop(id);
					}

					len = _private._timers.length; // recalc in case timer queue was changed by a timer function or an error
				}

				// point to next timer if [i] still points to last timer

				timer = _private._timers[i];
				if (timer && (timer.id === id)) {
					i += 1;
				}
			}
		}

		if (refresh) {
			_private._gridDraw();
		}
	}

	//--------------
	// COLOR SUPPORT
	//--------------

	// _private._recolor ( bead )
	// Recalculate and change effective color of [bead]
	// Inspects all color planes from top to bottom

	// Global target object
	// Avoids having to make a new object for every call

	_private._target = {
		rgb: 0,
		r: 0,
		g: 0,
		b: 0,
		str: ""
	};

	_private._recolor = function (bead) {
		var rgb, current, r, g, b, pr, pg, pb, fader;

		_private._calcColor(bead, _private._grid.color, _private._target);

		rgb = _private._target.rgb;

		current = bead.color; // current effective color

		r = _private._target.r;
		g = _private._target.g;
		b = _private._target.b;

		// Save current colors for calc

		pr = current.r;
		pg = current.g;
		pb = current.b;

		// Update current record

		current.rgb = rgb;
		current.r = r;
		current.g = g;
		current.b = b;
		current.str = _private._target.str;

		if (bead.visible) {
			fader = bead.fader;
			if (fader.rate > 0) // must use fader
			{
				if (fader.rgb !== null) // use start color if specified
				{
					_private._startFader(fader, fader.r, fader.g, fader.b, 255, r, g, b, 255);
				} else if (!fader.active) {
					_private._startFader(fader, pr, pg, pb, 255, r, g, b, 255);
				} else // must recalculate active fader
				{
					_private._recalcFader(fader, r, g, b, 255);
				}
			} else {
				_private._makeDirty(bead);
			}
		}
	}

	// Validate & rectify separate color values, return in [colors] object

	_private._validColors = function (fn, colors, redP, greenP, blueP) {
		var red, green, blue, type;

		red = redP; // prevent arg mutation
		if ((red !== PS.CURRENT) && (red !== PS.DEFAULT)) {
			type = _private._typeOf(red);
			if (type === "undefined") {
				red = PS.CURRENT;
			} else if (type === "number") {
				red = Math.floor(red);
				if (red < 0) {
					red = 0;
				} else if (red > 255) {
					red = 255;
				}
			} else {
				return _private._error(fn + "red value invalid");
			}
		}

		green = greenP; // prevent arg mutation
		if ((green !== PS.CURRENT) && (green !== PS.DEFAULT)) {
			type = _private._typeOf(green);
			if (type === "undefined") {
				green = PS.CURRENT;
			} else if (type === "number") {
				green = Math.floor(green);
				if (green < 0) {
					green = 0;
				} else if (green > 255) {
					green = 255;
				}
			} else {
				return _private._error(fn + "green value invalid");
			}
		}

		blue = blueP; // prevent arg mutation
		if ((blue !== PS.CURRENT) && (blue !== PS.DEFAULT)) {
			type = _private._typeOf(blue);
			if (type === "undefined") {
				blue = PS.CURRENT;
			} else if (type === "number") {
				blue = Math.floor(blue);
				if (blue < 0) {
					blue = 0;
				} else if (blue > 255) {
					blue = 255;
				}
			} else {
				return _private._error(fn + "blue value invalid");
			}
		}

		colors.rgb = null; // signal to consult r/g/b properties
		colors.r = red;
		colors.g = green;
		colors.b = blue;

		return PS.DONE;
	}

	// Extract components of an rgb multiplex into [colors] object

	_private._extractRGB = function (colors, rgbP) {
		var rgb, red, rval, green, gval, blue;

		rgb = Math.floor(rgbP);

		if (rgb < 1) // black
		{
			rgb = red = green = blue = 0;
		} else if (rgb >= 0xFFFFFF) // white
		{
			rgb = 0xFFFFFF;
			red = green = blue = 255;
		} else {
			red = rgb / _private._RSHIFT;
			red = Math.floor(red);
			rval = red * _private._RSHIFT;

			green = (rgb - rval) / _private._GSHIFT;
			green = Math.floor(green);
			gval = green * _private._GSHIFT;

			blue = rgb - rval - gval;
		}

		colors.rgb = rgb; // number signals all values are valid
		colors.r = red;
		colors.g = green;
		colors.b = blue;
	}

	// _private._decodeColors ( fn, p1, p2, p3 )
	// Takes caller's function name, plus single RGB multiplex integer, integer triplet, RGB array or RGB object
	// Returns a color object or PS.ERROR
	// If .rgb = null, caller should use use r/g/b properties
	// If .rgb = PS.CURRENT/PS.DEFAULT, caller should use current/default colors
	// If .rgb is a number, r/g/b properties are precalculated

	// Global color return object
	// Avoids making a new object for every call

	_private._decoded = {
		rgb: 0,
		r: null,
		g: null,
		b: null,
		str: ""
	};

	_private._decodeColors = function (fn, p1, p2, p3) {
		var colors, type, result, rgb, len;

		colors = _private._decoded; // use global return object
		colors.rgb = 0;
		colors.r = null;
		colors.g = null;
		colors.b = null;
		colors.str = "";

		// [p1] determines interpretation

		type = _private._typeOf(p1);

		if (p1 !== undefined && p2 !== undefined && p3 === undefined) {
			// Looks like part of a multiplex, but not the whole thing
			return _private._error(fn + "color arguments invalid");
		}

		// If [p2] or [p3] is defined, check for a valid multiplex

		if ((p2 !== undefined) || (p3 !== undefined)) {
			if ((type === "number") || (type === "undefined") || (p1 === PS.CURRENT) || (p1 === PS.DEFAULT)) {
				result = _private._validColors(fn, colors, p1, p2, p3);
				if (result === PS.ERROR) {
					return PS.ERROR;
				}
			} else {
				if (type === "array") {
					return _private._error(fn + "Extraneous arguments after color array");
				}
				if (type === "object") {
					return _private._error(fn + "Extraneous arguments after color object");
				}
				return _private._error(fn + "red argument invalid");
			}
		}

		// [p1] is only argument
		else if (type === "number") {
			_private._extractRGB(colors, p1); // Assume a multiplex
		}

		// Array with r|g|b values?
		else if (type === "array") {
			len = p1.length;
			if (len < 1) {
				colors.rgb = PS.CURRENT; // no elements, use all current
			} else {
				result = _private._validColors(fn, colors, p1[0], p1[1], p1[2]);
				if (result === PS.ERROR) {
					return PS.ERROR;
				}
			}
		}

		// Object with rgb|r|g|b properties?
		else if (type === "object") {
			// .rgb property has priority

			rgb = p1.rgb;

			if (rgb == null && p1.r == undefined && p1.g == undefined && p1.b == undefined) {
				// There's a color object with no useful information inside
				return PS.ERROR;
			}

			type = _private._typeOf(rgb);
			if ((type === "undefined") || (rgb === null)) {
				result = _private._validColors(fn, colors, p1.r, p1.g, p1.b);
				if (result === PS.ERROR) {
					return PS.ERROR;
				}
			} else if (type === "number") {
				_private._extractRGB(colors, rgb);
			} else if ((rgb === PS.CURRENT) || (rgb === PS.DEFAULT)) {
				colors.rgb = rgb; // signal to use current or default color
			} else {
				return _private._error(fn + ".rgb property invalid");
			}
		} else if ((type === "undefined") || (p1 === PS.CURRENT)) {
			colors.rgb = PS.CURRENT; // signal caller to use current color
		} else if (p1 === PS.DEFAULT) {
			colors.rgb = PS.DEFAULT; // signal caller to use default color
		} else {
			return _private._error(fn + "color argument invalid");
		}

		return colors;
	}

	// Calc font metrics for bead based on glyph scale

	_private._rescaleGlyph = function (bead) {
		var bsize, nsize, scale, height;

		bsize = _private._grid.bead_size;
		bead.glyph.x = Math.round(bsize / 2); // x is always centered

		scale = bead.glyph.scale;
		if (scale < 100) {
			nsize = Math.round((bsize * scale) / 100);
		} else {
			nsize = bsize;
		}
		bead.glyph.size = height = Math.round(nsize / 2);
		bead.glyph.font = height + "px 'Droid'";
		bead.glyph.y = Math.round(((bsize - height) / 2) + (height / 2));
	}

	// Reset bead default attributes

	_private._resetBead = function (bead) {
		var color;

		_private._copy(_private._DEFAULTS.bead, bead); // copy default properties

		// Make a copy of default colors

		color = {};
		_private._copy(_private._DEFAULTS.bead.color, color);

		bead.planes = [{
			height: 0,
			color: color
		}]; // init planes array

		_private._rescaleGlyph(bead);

		_private._resetFader(bead.fader);
		_private._resetFader(bead.borderFader);
		_private._resetFader(bead.glyphFader);
	}

	// Get color of a bead plane

	_private._colorPlane = function (bead, plane) {
		var planes, level, len, i, color, def;

		planes = bead.planes;

		// Handle plane 0 quickly

		if (plane < 1) {
			level = planes[0];
			return level.color;
		}

		// See if plane is already in list
		// Return its color if found

		len = planes.length;
		for (i = 1; i < len; i += 1) {
			level = planes[i];
			if (level.height === plane) {
				return level.color;
			}
		}

		// Plane doesn't exist yet

		// Make a copy of default colors with zero alpha

		def = _private._DEFAULTS.bead.color;
		color = {
			rgb: def.rgb,
			r: def.r,
			g: def.g,
			b: def.b,
			a: 0
		};

		// Just return default if bead is inactive

		if (bead.active) {
			// insert plane into list in correct order

			i = 0;
			while (i < len) {
				level = planes[i];
				if (level.height > plane) {
					break;
				}
				i += 1;
			}

			planes.splice(i, 0, {
				height: plane,
				color: color
			});
		}

		return color;
	}

	// Return current maximum border width

	_private._borderMax = function (bead) {
		if (bead.glyph.code > 0) {
			return bead.border.gmax;
		}

		return bead.border.max;
	}

	// Set all bead borders to same width

	_private._equalBorder = function (bead, w) {
		bead.border.equal = true;
		bead.border.width = w;
		bead.border.top = w;
		bead.border.left = w;
		bead.border.bottom = w;
		bead.border.right = w;
	}

	// Rescale a bead according to its .scale property

	_private._rescale = function (bead) {
		var bsize, size, diff, margin, max, val, border;

		bsize = _private._grid.bead_size; // 100% bead size for current grid

		if (bead.scale < 100) {
			size = Math.floor((bsize * bead.scale) / 100);

			// ensure at least two pixel difference

			diff = bsize - size;
			if ((diff > 0) && (diff % 2)) {
				size += 1;
			}
		} else {
			size = bsize;
			bead.margin = 0;
			bead.senseLeft = bead.left;
			bead.senseRight = bead.right;
			bead.senseTop = bead.top;
			bead.senseBottom = bead.bottom;
		}

		bead.size = size;

		// calc cursor sensing area

		if (size !== bsize) {
			bead.margin = margin = Math.floor((bsize - size) / 2);
			bead.senseLeft = bead.left + margin;
			bead.senseRight = bead.right - margin;
			bead.senseTop = bead.top + margin;
			bead.senseBottom = bead.bottom - margin;
		}

		border = bead.border;

		// calc maximum border size

		border.max = Math.floor((size - 8) / 2);

		// calc maximum border size with glyph

		border.gmax = Math.floor((size - bead.glyph.size) / 2);

		// adjust border width if needed

		max = _private._borderMax(bead);

		if (border.equal) {
			if (border.width > max) {
				_private._equalBorder(bead, max);
			}
		} else {
			val = border.top;
			if (val > max) {
				border.top = max;
			}

			val = border.left;
			if (val > max) {
				border.left = max;
			}

			val = border.bottom;
			if (val > max) {
				border.bottom = max;
			}

			val = border.right;
			if (val > max) {
				border.right = max;
			}
		}
	}

	// Return a bead's data

	_private._getData = function (bead) {
		var data;

		data = bead.data;
		if (data === null) // if null, return 0
		{
			data = 0;
		}
		return data;
	}

	//------------------
	// DOM EVENT SUPPORT
	//------------------

	// _private._touchBead ( bead )
	// Call this when mouse is clicked on bead or when bead is touched
	// Returns PS.DONE or PS.ERROR

	_private._touchBead = function (bead) {
		var data, any;

		// Set grid to focused
		_private._gridFocus();

		if (bead.active) {
			any = false;
			data = _private._getData(bead);

			// Call user's touch function if defined

			if (bead.exec) {
				try {
					bead.exec(bead.x, bead.y, data, _private._EMPTY);
					any = true;
				} catch (e1) {
					return _private._errorCatch("Bead " + bead.x + ", " + bead.y + " function failed [" + e1.message + "]", e1);
				}
			}

			// Call PSInterface.touch()

			if (PSInterface.touch) {
				try {
					PSInterface.touch(bead.x, bead.y, data, _private._EMPTY);
					any = true;
				} catch (e2) {
					return _private._errorCatch("PS.touch() failed [" + e2.message + "]", e2);
				}
			}

			if (any) {
				_private._gridDraw();
			}
		}
		return PS.DONE;
	}

	// _private._releaseBead ( bead )
	// Call this when mouse button is released or touch is removed from bead
	// Returns PS.DONE or PS.ERROR

	_private._releaseBead = function (bead) {
		var data;

		if (bead.active) {
			if (PSInterface.release) {
				data = _private._getData(bead);
				try {
					PSInterface.release(bead.x, bead.y, data, _private._EMPTY);
					_private._gridDraw();
				} catch (err) {
					return _private._errorCatch("PS.release() failed [" + err.message + "]", err);
				}
			}
		}
		return PS.DONE;
	}

	// _private._enterBead ( bead )
	// Call this when mouse/touch enters a bead
	// Returns PS.DONE or PS.ERROR

	_private._enterBead = function (bead) {
		var data;

		_private._overGrid = true;

		if (bead.active) {
			if (PSInterface.enter) {
				data = _private._getData(bead);
				try {
					PSInterface.enter(bead.x, bead.y, data, _private._EMPTY);
					_private._gridDraw();
				} catch (err) {
					return _private._errorCatch("PS.enter() failed [" + err.message + "]", err);
				}
			}
		}
		return PS.DONE;
	}

	// _private._exitBead ( bead )
	// Call this when mouse/touch leaves a bead
	// Returns PS.DONE or PS.ERROR

	_private._exitBead = function (bead) {
		var data;

		if (bead.active) {
			if (PSInterface.exit) {
				data = _private._getData(bead);
				try {
					PSInterface.exit(bead.x, bead.y, data, _private._EMPTY);
					_private._gridDraw();
				} catch (err) {
					return _private._errorCatch("PS.exit() failed [" + err.message + "]", err);
				}
			}
		}

		return PS.DONE;
	}

	// _private._exitGrid()
	// Call this when mouse leaves the grid
	// Returns PS.DONE or PS.ERROR

	_private._exitGrid = function () {
		_private._overGrid = false;

		if (PSInterface.exitGrid) {
			try {
				PSInterface.exitGrid(_private._EMPTY);
				_private._gridDraw();
			} catch (err) {
				return _private._errorCatch("PS.exitGrid() failed [" + err.message + "]", err);
			}
		}
		return PS.DONE;
	}

	//--------------------
	// INPUT EVENT SUPPORT
	// -------------------

	_private._resetCursor = function () {
		_private._lastBead = -1;
	}

	_private._getBead = function (x, y) {
		var canvas, bead, i, j;

		canvas = _private._grid.canvas;

		x += (document.body.scrollLeft + document.documentElement.scrollLeft - canvas.offsetLeft - _private._grid.padLeft);
		y += (document.body.scrollTop + document.documentElement.scrollTop - canvas.offsetTop - _private._grid.padRight);

		//		PSInterface.debug( "_getBead(): x = " + x + ", y = " + y + "\n" );

		// Over the grid?

		if ((x >= _private._grid.left) && (x < _private._grid.right) && (y >= _private._grid.top) && (y < _private._grid.bottom)) {
			// Which bead are we over?

			i = 0; // init index
			while (i < _private._grid.count) {
				bead = _private._beads[i]; // get the first bead in this row

				// Is mouse over this row?

				if ((y >= bead.top) && (y < bead.bottom)) {
					// Check each column using sense coordinates

					for (j = 0; j < _private._grid.x; j += 1) {
						if ((x >= bead.senseLeft) && (x < bead.senseRight) && (y >= bead.senseTop) && (y < bead.senseBottom)) {
							return bead;
						}
						i += 1;
						bead = _private._beads[i];
					}
					return null;
				}
				i += _private._grid.x; // try next row
			}
		}

		return null;
	}

	// _private._mouseDown ()
	// Event called when mouse is clicked on a bead

	_private._mouseDown = function (event) {
		var x, y, bead;

		if (event.x && event.y) // Webkit, IE
		{
			x = event.x;
			y = event.y;
		} else // Firefox method to get the position
		{
			x = event.clientX;
			y = event.clientY;
		}

		bead = _private._getBead(x, y);
		if (bead) {
			_private._touchBead(bead);
		} else {
			_private._gridUnfocus();
		}

		// Only stop event propogation if not in Multispiel mode
		if (_private._NAMESPACE === PS.DEFAULT_NAMESPACE)
			event.preventDefault();
		else
			return _private._endEvent(event);
	}

	// _private._mouseUp ()
	// Event called when mouse button is released over grid

	_private._mouseUp = function (event) {
		var x, y, bead;

		if (event.x && event.y) // Webkit, IE
		{
			x = event.x;
			y = event.y;
		} else // Firefox method to get the position
		{
			x = event.clientX;
			y = event.clientY;
		}

		bead = _private._getBead(x, y);
		if (bead) {
			_private._releaseBead(bead);
		}

		return _private._endEvent(event);
	}

	// Called when cursor moves over grid

	_private._mouseMove = function (event) {
		var x, y, bead, obead;

		if (event.x && event.y) // Webkit, IE
		{
			x = event.x;
			y = event.y;
		} else // Firefox method to get the position
		{
			x = event.clientX;
			y = event.clientY;
		}

		bead = _private._getBead(x, y);
		if (bead) {
			if (bead.index !== _private._lastBead) {
				if (_private._lastBead >= 0) {
					obead = _private._beads[_private._lastBead];
					_private._exitBead(obead);
				}
				_private._enterBead(bead);
				_private._lastBead = bead.index;
			}
		} else if (_private._lastBead >= 0) {
			obead = _private._beads[_private._lastBead];
			_private._exitBead(obead);
			_private._lastBead = -1;
		}

		return _private._endEvent(event);
	}

	// _private._gridOut()
	// Event called when mouse enters area outside grid

	_private._gridOut = function (event) {
		var bead, target;

		if (_private._lastBead >= 0) {
			bead = _private._beads[_private._lastBead];
			_private._exitBead(bead);
			_private._lastBead = -1;
		}

		target = event.relatedTarget;
		if (target) {
			target = target.id;

			// prevent bubbling up

			if (target && ((target === _private._OUTER_ID) || (target === _private._MAIN_ID) || (target.length < 1))) {
				_private._exitGrid();
			}
		}

		return _private._endEvent(event);
	}

	// _private._touchStart ( event )
	// Event called when screen is touched

	_private._touchStart = function (event) {
		var xpos, ypos, touch, bead;

		// PSInterface.debug("_touchStart called\n");

		// If a finger already down

		if (_private._currentFinger !== _private._CLEAR) {
			// PSInterface.debug( "Finger already down\n" );
			return _private._endEvent(event); // ignore
		}

		touch = event.changedTouches[0];
		_private._currentFinger = touch.identifier; // get the identifier for this finger

		// PSInterface.debug( "_touchStart finger = " + _private._currentFinger + "\n" );

		xpos = touch.pageX;
		ypos = touch.pageY;

		// Touch is on the canvas

		bead = _private._getBead(xpos, ypos);
		if (bead) {
			_private._overGrid = true;
			_private._underBead = bead.index; // remember which bead is under touch
			_private._touchBead(bead);
		} else {
			_private._underBead = _private._CLEAR;
			_private._overGrid = false;
		}

		return _private._endEvent(event);
	}

	// _private._touchEnd ( event )
	// Event called when touch is released or canceled

	_private._touchEnd = function (event) {
		var len, i, touch, finger, xpos, ypos, bead;

		// make sure this is the correct finger

		len = event.changedTouches.length;

		// must use changed!

		for (i = 0; i < len; i += 1) {
			touch = event.changedTouches[i];
			finger = touch.identifier;
			if (finger === _private._currentFinger) // found it!
			{
				_private._currentFinger = _private._CLEAR;
				_private._underBead = _private._CLEAR;
				_private._overGrid = false;

				xpos = touch.pageX;
				ypos = touch.pageY;

				bead = _private._getBead(xpos, ypos);
				if (bead) {
					_private._releaseBead(bead);
				}
				break;
			}
		}

		return _private._endEvent(event);
	}

	// _private._touchMove ( event )
	// Event called when touch is moved across screen

	_private._touchMove = function (event) {
		var len, i, touch, finger, xpos, ypos, bead, obead;

		len = event.changedTouches.length;

		// must use changed!

		for (i = 0; i < len; i += 1) {
			touch = event.changedTouches[i];
			finger = touch.identifier;
			if (finger === _private._currentFinger) // found it!
			{
				xpos = touch.pageX;
				ypos = touch.pageY;

				bead = _private._getBead(xpos, ypos);
				if (bead) {
					_private._overGrid = true;

					// Entering new bead?

					if (_private._underBead !== bead.index) {
						// Previously over a bead?

						if (_private._underBead !== _private._CLEAR) {
							obead = _private._beads[_underBead]; // get the bead table
							_private._exitBead(obead);
						}

						// Save as current bead and enter it

						_private._underBead = bead.index;
						_private._enterBead(bead);
					}
				} else {
					// Previously over a bead?

					if (_private._underBead !== _private._CLEAR) {
						obead = _private._beads[_underBead]; // get the bead table
						_private._exitBead(obead);
					}

					// Not over the grid

					_private._underBead = _private._CLEAR;

					// Call _private._exitGrid if leaving the gird

					if (_private._overGrid) {
						_private._exitGrid();
					}
				}
				break;
			}
		}

		return _private._endEvent(event);
	}

	// _private._keyReset ()
	// Reset all key params when focus is taken off grid

	_private._keyReset = function () {
		var i;

		_private._holding.length = 0;
		_private._holdShift = false;
		_private._holdCtrl = false;
		for (i = 0; i < 256; i += 1) {
			_private._pressed[i] = 0;
		}
	}

	// _private._keyFilter ( key, shift )
	// Translates weird or shifted keycodes to useful values

	_private._keyFilter = function (key, shift) {
		var val;

		val = key; // avoid arg mutation

		// convert lower-case alpha to upper-case if shift key is down

		if ((val >= 65) && (val <= 90)) {
			if (!shift) // returns UPPER CASE when NOT shifted!
			{
				val += 32;
			}
		} else {
			val = _private._transKeys[val];
			if (shift && (val < 256)) {
				val = _private._shiftedKeys[val];
			}
		}

		return val;
	}

	// _private._legalKey( key )
	// Returns true if key is recognized, else false
	// Allows alphanumerics, enter, backspace, tab and ESC

	_private._legalKey = function (key) {
		return ((key >= 32) || (key === 13) || (key === 8) || (key === 9) || (key === 27));
	}

	// _private._keyDown ( event )
	// DOM event called when a key is pressed

	_private._keyDown = function (event) {
		if (!_private._grid.focused)
			return;

		var fn, any, hardkey, key, len, i;

		fn = "[_keyDown] ";
		any = false;

		// Debugger gets keys when in focus

		if (_private._debugFocus) {
			return true;
		}

		// Call PSInterface.keyDown to report event

		if (PSInterface.keyDown) {
			_private._holdShift = event.shiftKey;
			_private._holdCtrl = event.ctrlKey;

			if (!event.which) {
				hardkey = event.keyCode; // IE
			} else {
				hardkey = event.which; // Others
			}
			key = _private._keyFilter(hardkey, _private._holdShift);

			//			PSInterface.debug( "D: h = " + hardkey + ", k = " + key +
			//				", s = " + _private._holdShift + ", c = " + _private._holdCtrl + "\n");

			if (_private._legalKey(key)) {
				// if not already pressed ...

				if (!_private._pressed[key]) {
					_private._pressed[key] = 1; // mark key as being pressed

					// If key was previously down in another state, remove from held list

					if ((key !== hardkey) && _private._pressed[hardkey]) {
						_private._pressed[hardkey] = 0;

						i = _private._holding.indexOf(hardkey);
						if (i >= 0) {
							_private._holding.splice(i, 1);
						}
					}

					if (_private._holding.length < 1) {
						_private._keyDelay = _private._keyInitRate; // set initial repeat delay if no other keys down
					}

					// bug fixed by Mark Diehr

					if (_private._holding.indexOf(key) < 0) {
						_private._holding.push(key); // add to list of all keys being held
					}

					try {
						PSInterface.keyDown(key, _private._holdShift, _private._holdCtrl, _private._EMPTY);
						any = true;
					} catch (err) {
						_private._errorCatch(fn + "PS.keyDown failed [" + err.message + "]", err);
					}
				}
			}

			// If shift key is pressed,
			// All currently held keys with an alternate shift value
			// must generate a new PSInterface.keyDown event
			else if (key === _private._KEY_SHIFT) {
				len = _private._holding.length;
				for (i = 0; i < len; i += 1) {
					key = hardkey = _private._holding[i]; // get a held key
					if ((hardkey >= 97) && (hardkey <= 122)) // if lower-case alpha
					{
						key -= 32; // convert to upper-case
					} else if (hardkey < 256) {
						key = _private._shiftedKeys[hardkey];
					}
					if (key !== hardkey) // if they differ
					{
						_private._pressed[hardkey] = 0;
						_private._pressed[key] = 1;
						_private._holding[i] = key; // replace unshifted key with shifted
						try {
							PSInterface.keyDown(key, true, _private._holdCtrl, _private._EMPTY);
							any = true;
						} catch (err2) {
							_private._errorCatch(fn + "PS.keyDown failed [" + err2.message + "]", err2);
						}
					}
				}
			}

			if (any) // redraw grid if any keys processed
			{
				_private._gridDraw();
			}
		}

		return _private._endEvent(event);
	}

	// _private._keyUp ( event )
	// DOM event called when key is released

	_private._keyUp = function (event) {
		if (!_private._grid.focused)
			return;

		var fn, any, shift, ctrl, hardkey, key, i, len;

		fn = "[_keyUp] ";
		any = false;

		// Debugger gets keys when in focus

		if (_private._debugFocus) {
			return true;
		}

		// Call PSInterface.keyUp to report event

		if (PSInterface.keyUp) {
			shift = _private._holdShift = event.shiftKey;
			ctrl = _private._holdCtrl = event.ctrlKey;

			if (!event.which) {
				hardkey = event.keyCode; // IE
			} else {
				hardkey = event.which; // Others
			}
			key = _private._keyFilter(hardkey, _private._holdShift);

			//			PSInterface.debug( "U: h = " + hardkey + ", k = " + key +
			//				", s = " + _private._holdShift + ", c = " + _private._holdCtrl + "\n");

			if (_private._legalKey(key)) {
				// remove from pressed array and held list

				_private._pressed[key] = 0;

				i = _private._holding.indexOf(key);
				if (i >= 0) {
					_private._holding.splice(i, 1);
				}

				if (_private._holding.length < 1) // if no other keys held ...
				{
					_private._keyDelay = 0; // stop repeats
					_private._holdShift = false;
					_private._holdCtrl = false;
				}

				try {
					PSInterface.keyUp(key, shift, ctrl, _private._EMPTY);
					any = true;
				} catch (err) {
					_private._errorCatch(fn + "PS.keyUp failed [" + err.message + "]", err);
				}
			}

			// If shift key is released,
			// All currently held keys with an alternate shift value
			// must generate a new PSInterface.keyDown event
			else if (key === _private._KEY_SHIFT) {
				len = _private._holding.length;
				for (i = 0; i < len; i += 1) {
					key = hardkey = _private._holding[i]; // get a held key
					if (hardkey < 256) {
						key = _private._unshiftedKeys[hardkey]; // get unshifted value
					}
					if (key !== hardkey) // if they differ
					{
						_private._pressed[hardkey] = 0;
						_private._pressed[key] = 1;
						_private._holding[i] = key; // replace shifted key with unshifted
						try {
							PSInterface.keyDown(key, false, ctrl, _private._EMPTY);
							any = true;
						} catch (err2) {
							_private._errorCatch(fn + "PS.keyDown failed [" + err2.message + "]", err2);
						}
					}
				}
			}

			if (any) // redraw grid if any keys processed
			{
				_private._gridDraw();
			}
		}

		return _private._endEvent(event);
	}

	// _private._wheel ( event )
	// DOM event called when mouse wheel is moved

	_private._wheel = function (event) {
		if (!_private._grid.focused)
			return;

		var delta;

		// Only respond when mouse is actually over the grid!

		if (!_private._overGrid) {
			return true;
		}

		// Call PSInterface.input to report the event

		if (PSInterface.input) // only if function exists
		{
			if (!event) // for IE
			{
				event = window.event;
			}

			delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));

			// clamp

			if (delta >= 1) {
				delta = PS.WHEEL_FORWARD;
			} else {
				delta = PS.WHEEL_BACKWARD;
			}

			// Send delta to user

			try {
				PSInterface.input({
					wheel: delta
				}, _private._EMPTY);
				_private._gridDraw();
			} catch (err) {
				_private._errorCatch("PS.input() failed [" + err.message + "]", err);
			}
		}

		return _private._endEvent(event);
	}

	//---------------
	// GRID FUNCTIONS
	//---------------

	_private._keysActivate = function () {
		if (!_private._keysActive) {
			document.addEventListener("keydown", _private._keyDown, false);
			document.addEventListener("keyup", _private._keyUp, false);
			_private._keysActive = true;
		}
	}

	_private._keysDeactivate = function () {
		_private._keyReset(); // reset key status

		if (_private._keysActive) {
			document.removeEventListener("keydown", _private._keyDown, false);
			document.removeEventListener("keyup", _private._keyUp, false);
			_private._keysActive = false;
		}
	}

	// Focus manager - instance received mouse focus
	_private._gridFocus = function (e) {
		if (!_private._grid.focused) {
			_private._grid.focused = true;
			// console.info("Perlenspiel " + _private._NAMESPACE + " focused.");
		}
		if (e)
			e.preventDefault();
	}

	// Focus manager - instance lost mouse focus
	_private._gridUnfocus = function (e) {
		if (_private._grid.focused) {
			var target = e.target;
			var grid = _private._grid.canvas;
			var main = document.getElementById(_private._MAIN_ID);
			var outer = document.getElementById(_private._OUTER_ID);
			var footer = document.getElementById(_private._FOOTER_ID);
			if (target === grid || target === _private._status.div || target === footer || target === main || target === outer)
				return;
			_private._grid.focused = false;
			// console.warn("Perlenspiel " + _private._NAMESPACE + " lost focus.");
			if (e)
				e.preventDefault();
		}
	}

	_private._gridActivate = function () {
		var grid;

		grid = _private._grid.canvas;
		grid.style.display = "block";

		// If not in multispiel mode, the grid is always considered focused
		if (_private._NAMESPACE === PS.DEFAULT_NAMESPACE)
			grid.focused = true;
		else
			grid.focused = false;

		grid.addEventListener("mousedown", _private._mouseDown, false);
		grid.addEventListener("mouseup", _private._mouseUp, false);
		grid.addEventListener("mousemove", _private._mouseMove, false);
		grid.addEventListener("mouseout", _private._gridOut, false);

		_private._keysActivate();

		// Add the focus manager events if in multispiel mode
		if (_private._NAMESPACE !== PS.DEFAULT_NAMESPACE) {
			var outer = document.getElementById(_private._OUTER_ID);
			outer.addEventListener("mousedown", _private._gridFocus, true);
			document.addEventListener("mousedown", _private._gridUnfocus, false);
		}

		document.addEventListener("keydown", _private._keyDown, false);
		document.addEventListener("keyup", _private._keyUp, false);

		window.addEventListener("DOMMouseScroll", _private._wheel, false); // for Firefox
		window.addEventListener("mousewheel", _private._wheel, false); // for others

		if (_private._touchScreen) {
			// init finger & bead to empty

			_private._currentFinger = _private._CLEAR;
			_private._underBead = _private._CLEAR;

			document.addEventListener("touchmove", _private._touchMove, false);
			document.addEventListener("touchstart", _private._touchStart, false);
			document.addEventListener("touchend", _private._touchEnd, false);
			document.addEventListener("touchcancel", _private._touchEnd, false);
		}
	}

	_private._gridDeactivate = function () {
		var grid;

		grid = _private._grid.canvas;
		grid.style.display = "none";

		grid.removeEventListener("mousedown", _private._mouseDown, false);
		grid.removeEventListener("mouseup", _private._mouseUp, false);
		grid.removeEventListener("mousemove", _private._mouseMove, false);
		grid.removeEventListener("mouseout", _private._gridOut, false);

		_private._keysDeactivate();

		// Remove the focus manager if in multispiel mode
		if (_private._NAMESPACE !== PS.DEFAULT_NAMESPACE) {
			var outer = document.getElementById(_private._OUTER_ID);
			if (outer)
				outer.removeEventListener("mousedown", _private._gridFocus, true);
			document.removeEventListener("mousedown", _private._gridUnfocus, false);
		}

		document.removeEventListener("keydown", _private._keyDown, false);
		document.removeEventListener("keyup", _private._keyUp, false);

		window.removeEventListener("DOMMouseScroll", _private._wheel, false); // for Firefox
		window.removeEventListener("mousewheel", _private._wheel, false); // for others

		if (_private._touchScreen) {
			document.removeEventListener("touchmove", _private._touchMove, false);
			document.removeEventListener("touchstart", _private._touchStart, false);
			document.removeEventListener("touchend", _private._touchEnd, false);
			document.removeEventListener("touchcancel", _private._touchEnd, false);
		}
	}

	// Set grid color
	// Returns rgb

	_private._gridColor = function (colors) {
		var current, fader, rgb, r, g, b;

		current = _private._grid.color;
		fader = _private._grid.fader;

		if (PS.CURRENT == _private._checkColors(colors, current, _private._DEFAULTS.grid.color))
			return current.rgb;

		// Only change color if different
		// But must also change if fader is active, start color is specified and doesn't match

		if ((current.rgb !== colors.rgb) || ((fader.rate > 0) && (fader.rgb !== null) && (fader.rgb !== colors.rgb))) {
			current.rgb = colors.rgb;

			r = colors.r;
			g = colors.g;
			b = colors.b;

			current.str = colors.str = _private._RSTR[r] + _private._GBSTR[g] + _private._BASTR[b];

			if (fader.rate > 0) // must use fader
			{
				if (fader.rgb !== null) // use start color if specified
				{
					_private._startFader(fader, fader.r, fader.g, fader.b, 255, r, g, b, 255);
				} else if (!fader.active) {
					_private._startFader(fader, current.r, current.g, current.b, 255, r, g, b, 255);
				} else // must recalculate active fader
				{
					_private._recalcFader(fader, r, g, b, 255);
				}
			} else {
				_private._gridRGB(colors);
				_private._gridRGBEnd(colors);
			}

			current.r = r;
			current.g = g;
			current.b = b;
		}

		return current.rgb;
	}

	// Set grid shadow color
	// Returns rgb

	_private._gridShadow = function (show, colors) {
		var current, rgb, r, g, b;

		current = _private._grid.shadow;

		if (PS.CURRENT == _private._checkColors(colors, current, _private._DEFAULTS.grid.shadow))
			return current.rgb;

		rgb = colors.rgb;

		// Only change color if different

		if (current.rgb !== colors.rgb) {
			current.rgb = colors.rgb;

			r = colors.r;
			g = colors.g;
			b = colors.b;

			current.str = colors.str = _private._RSTR[r] + _private._GBSTR[g] + _private._BASTR[b];

			current.r = r;
			current.g = g;
			current.b = b;
		}

		if (show !== PS.CURRENT) {
			_private._grid.shadow.show = show;
		}

		if (_private._grid.shadow.show) {
			_private._gridShadowRGB(current);
		} else {
			_private._grid.canvas.style.boxShadow = "none";
		}

		return {
			show: _private._grid.shadow.show,
			rgb: current.rgb
		};
	}

	// Resize grid to dimensions x/y
	// Resets all bead attributes

	_private._gridSize = function (x, y) {
		var size, i, j, cnt, xpos, ypos, bead;

		_private._initFaders();
		_private._resetFader(_private._grid.fader);
		_private._resetFader(_private._status.fader);
		_private._grid.plane = 0;

		// x/y dimensions of grid

		if (!_private._grid.ready || (x !== _private._grid.x) || (y !== _private._grid.y)) {
			_private._grid.x = x;
			_private._grid.y = y;
			_private._grid.count = x * y;

			// calc size of beads, position/dimensions of centered grid

			_private._grid.left = 0;
			_private._grid.top = 0;

			if (x >= y) {
				size = Math.floor(_private._CLIENT_SIZE / x);
			} else {
				size = Math.floor(_private._CLIENT_SIZE / y);
			}

			_private._grid.bead_size = size;
			_private._grid.width = size * x;
			_private._grid.height = size * y;
			_private._grid.right = _private._grid.width;
			_private._grid.bottom = _private._grid.height;

			// Reset width/height of grid canvas
			// Changing either of these also clears the canvas

			_private._grid.canvas.width = _private._grid.width;
			_private._grid.canvas.height = _private._grid.height;

			_private._grid.context.textAlign = "center";
			_private._grid.context.textBaseline = "middle";

			// _private._grid.font_size = font_size = Math.floor( ( size / 11 ) * 5 ); // adjusted for Google Droid font
			// font_size_px = font_size + "px";
			// _private._grid.font_margin = Math.floor( font_size / 2 );

			cnt = 0;
			ypos = _private._grid.top;
			for (j = 0; j < y; j += 1) {
				xpos = _private._grid.left;
				for (i = 0; i < x; i += 1) {
					bead = _private._beads[cnt];
					bead.x = i;
					bead.y = j;
					bead.left = xpos;
					bead.right = xpos + size;
					bead.top = ypos;
					bead.bottom = ypos + size;

					_private._resetBead(bead);
					_private._rescale(bead);

					// p = bead.glyph_p;
					// p.style.fontSize = font_size_px;
					// if ( bead.visible )
					// {
					// 	bead.div.style.display = "block";
					// }
					// else
					// {
					// 	bead.div.style.display = "none";
					// }

					xpos += size;
					cnt += 1;
				}
				ypos += size;
			}

			// hide unused beads

			while (cnt < _private._MAX_BEADS) {
				bead = _private._beads[cnt];
				bead.visible = false;
				bead.active = false;
				cnt += 1;
			}
		}

		// else just reset beads
		else {
			for (i = 0; i < _private._grid.count; i += 1) {
				bead = _private._beads[i];
				_private._resetBead(bead);
				_private._rescale(bead);
			}
		}

		_private._anyDirty = true;

		_private._gridColor({
			rgb: PS.DEFAULT
		});
		PSInterface.statusColor(PS.DEFAULT);

		_private._gridDraw();
		_private._resetCursor();

		_private._grid.ready = true;
	}

	//-------------
	// BEAD SUPPORT
	//-------------

	// _private._checkX ( x, fn )
	// Returns floored x value if valid, else PS.ERROR

	_private._checkX = function (x, fn) {
		if (_private._typeOf(x) !== "number") {
			return _private._error(fn + "x argument not a number");
		}

		x = Math.floor(x);

		if (x < 0) {
			return _private._error(fn + "x argument negative");
		}
		if (x >= _private._grid.x) {
			return _private._error(fn + "x argument exceeds grid width");
		}

		return x;
	}

	// _private._checkY ( y, fn )
	// Returns floored y value if valid, else PS.ERROR

	_private._checkY = function (y, fn) {
		if (_private._typeOf(y) !== "number") {
			return _private._error(fn + "y argument not a number");
		}

		y = Math.floor(y);

		if (y < 0) {
			return _private._error(fn + "y argument negative");
		}
		if (y >= _private._grid.y) {
			return _private._error(fn + "y argument exceeds grid height");
		}

		return y;
	}

	// Call a bead function with x/y parameter checking
	// [fn] = name of calling function
	// [func] = function to be called
	// [x/y] = grid coordinates of bead
	// [p1-p4] = function parameters
	// Returns function result or PS.ERROR on parameter error

	_private._beadExec = function (fn, func, x, y, p1, p2, p3, p4) {
		var i, j, result;

		if (x === PS.ALL) {
			if (y === PS.ALL) // do entire grid
			{
				for (j = 0; j < _private._grid.y; j += 1) {
					for (i = 0; i < _private._grid.x; i += 1) {
						result = func(i, j, p1, p2, p3, p4);
						if (result === PS.ERROR) {
							break;
						}
					}
				}
				return result;
			}

			// verify y param

			y = _private._checkY(y, fn);
			if (y === PS.ERROR) {
				return PS.ERROR;
			}

			for (i = 0; i < _private._grid.x; i += 1) // do entire row
			{
				result = func(i, y, p1, p2, p3, p4);
				if (result === PS.ERROR) {
					break;
				}
			}
			return result;
		}

		if (y === PS.ALL) {
			// verify x param

			x = _private._checkX(x, fn);
			if (x === PS.ERROR) {
				return PS.ERROR;
			}

			for (j = 0; j < _private._grid.y; j += 1) // do entire column
			{
				result = func(x, j, p1, p2, p3, p4);
				if (result === PS.ERROR) {
					break;
				}
			}
			return result;
		}

		// verify x param

		x = _private._checkX(x, fn);
		if (x === PS.ERROR) {
			return PS.ERROR;
		}

		// verify y param

		y = _private._checkY(y, fn);
		if (y === PS.ERROR) {
			return PS.ERROR;
		}

		result = func(x, y, p1, p2, p3, p4);

		return result;
	}

	_private._color = function (x, y, colors) {
		var id, bead, def, current, fader, rgb, r, g, b;

		id = (y * _private._grid.x) + x;
		bead = _private._beads[id];

		current = _private._colorPlane(bead, _private._grid.plane);
		fader = bead.fader;

		if (!bead.active)
			return current.rgb;

		if (PS.CURRENT == _private._checkColors(colors, current, _private._DEFAULTS.bead.color))
			return current.rgb;

		// Only change color if different
		// But must also change if fader is active, start color is specified and doesn't match

		if ((current.rgb !== colors.rgb) || ((fader.rate > 0) && (fader.rgb !== null) && (fader.rgb !== colors.rgb))) {
			// update color plane record

			current.rgb = colors.rgb;
			current.r = colors.r;
			current.g = colors.g;
			current.b = colors.b;

			_private._recolor(bead); // recalc bead color
		}

		return current.rgb;
	}

	_private._alpha = function (x, y, alpha) {
		var id, bead, current;

		id = (y * _private._grid.x) + x;
		bead = _private._beads[id];

		current = _private._colorPlane(bead, _private._grid.plane);

		if (bead.active && (alpha !== PS.CURRENT) && (alpha !== current.a)) {
			current.a = alpha;
			_private._recolor(bead);
		}

		return current.a;
	}

	// _private._validFadeOptions ( fn, options)
	// Returns validated options object or PS.ERROR

	_private._validFadeOptions = function (fn, options) {
		var type, val, red, blue, green, rval, gval;

		type = _private._typeOf(options);
		if ((type === "undefined") || (options === PS.CURRENT)) {
			return {
				rgb: PS.CURRENT,
				r: 0,
				g: 0,
				b: 0,
				onStep: PS.CURRENT,
				onEnd: PS.CURRENT,
				params: PS.CURRENT
			};
		}

		if (options === PS.DEFAULT) {
			return {
				rgb: PS.DEFAULT,
				r: 0,
				g: 0,
				b: 0,
				onStep: PS.CURRENT,
				onEnd: PS.DEFAULT,
				params: PS.DEFAULT
			};
		}

		if (type !== "object") {
			return _private._error(fn + "options argument invalid");
		}

		// Check .rgb

		val = options.rgb;
		if ((val !== PS.CURRENT) && (val !== PS.DEFAULT)) {
			type = _private._typeOf(val);
			if ((type === "undefined") || (val === null)) {
				options.rgb = PS.CURRENT;
			} else if (type === "number") {
				val = Math.floor(val);
				if (val <= PS.COLOR_BLACK) {
					val = PS.COLOR_BLACK;
					red = 0;
					green = 0;
					blue = 0;
				} else if (val >= PS.COLOR_WHITE) {
					val = PS.COLOR_WHITE;
					red = 255;
					green = 255;
					blue = 255;
				} else {
					red = val / _private._RSHIFT;
					red = Math.floor(red);
					rval = red * _private._RSHIFT;

					green = (val - rval) / _private._GSHIFT;
					green = Math.floor(green);
					gval = green * _private._GSHIFT;

					blue = val - rval - gval;

				}
				options.rgb = val;
				options.r = red;
				options.g = green;
				options.b = blue;
			} else {
				return _private._error(fn + "options.rgb property invalid");
			}
		}

		// Just append r/g/b properties
		else {
			options.r = 0;
			options.g = 0;
			options.b = 0;
		}

		// Check .onStep

		val = options.onStep;
		if ((val !== PS.CURRENT) && (val !== PS.DEFAULT)) {
			type = _private._typeOf(val);
			if ((type === "undefined") || (val === null)) {
				options.onStep = PS.CURRENT;
			} else if (type !== "function") {
				return _private._error(fn + "options.onStep property invalid");
			}
		}

		// Check .onEnd

		val = options.onEnd;
		if ((val !== PS.CURRENT) && (val !== PS.DEFAULT)) {
			type = _private._typeOf(val);
			if ((type === "undefined") || (val === null)) {
				options.onEnd = PS.CURRENT;
			} else if (type !== "function") {
				return _private._error(fn + "options.onEnd property invalid");
			}
		}

		// Check .params

		val = options.params;
		if ((val !== PS.CURRENT) && (val !== PS.DEFAULT)) {
			type = _private._typeOf(val);
			if ((type === "undefined") || (val === null)) {
				options.params = PS.CURRENT; // fixed in 3.1.1
			} else if (type !== "array") {
				return _private._error(fn + "options.params property invalid");
			}
		}

		return options;
	}

	_private._fade = function (x, y, rate, options) {
		var id, bead, color, fader, orate, nrate, val;

		id = (y * _private._grid.x) + x;
		bead = _private._beads[id];
		color = bead.color;
		fader = bead.fader;
		orate = fader.rate; // save current rate

		if (bead.active) {
			if (rate === PS.CURRENT) {
				nrate = orate;
			} else if (rate === PS.DEFAULT) {
				nrate = _private._DEFAULTS.fader.rate;
			} else {
				nrate = rate;
			}

			val = options.rgb;
			if (val !== PS.CURRENT) {
				if (val === PS.DEFAULT) {
					fader.rgb = _private._DEFAULTS.fader.rgb;
				} else {
					fader.rgb = val;
				}
				fader.r = options.r;
				fader.g = options.g;
				fader.b = options.b;
			}

			val = options.onStep;
			if (val !== PS.CURRENT) {
				if (val === PS.DEFAULT) {
					fader.onStep = _private._DEFAULTS.fader.onStep;
				} else {
					fader.onStep = val;
				}
			}

			val = options.onEnd;
			if (val !== PS.CURRENT) {
				if (val === PS.DEFAULT) {
					fader.onEnd = _private._DEFAULTS.fader.onEnd;
				} else {
					fader.onEnd = val;
				}
			}

			val = options.params;
			if (val !== PS.CURRENT) {
				if (val === PS.DEFAULT) {
					fader.params = _private._DEFAULTS.fader.params;
				} else {
					fader.params = val;
				}
			}

			// Handle rate change

			if (orate !== nrate) {
				fader.rate = nrate;
				if (nrate < 1) {
					fader.active = false;
					fader.kill = true;
				} else if (fader.active) {
					_private._recalcFader(fader, color.r, color.g, color.b, 255);
				}
			}
		}

		return {
			rate: fader.rate,
			rgb: fader.rgb,
			onStep: fader.onStep,
			onEnd: fader.onEnd,
			params: fader.params
		};
	}

	_private._scale = function (x, y, scale) {
		var id, bead;

		id = (y * _private._grid.x) + x;
		bead = _private._beads[id];

		if (bead.active && (scale !== PS.CURRENT) && (bead.scale !== scale)) {
			bead.scale = scale;
			_private._rescale(bead);
			_private._makeDirty(bead);
		}

		return bead.scale;
	}

	_private._radius = function (x, y, radius) {
		var id, bead, max;

		id = (y * _private._grid.x) + x;
		bead = _private._beads[id];

		if (bead.active && (radius !== PS.CURRENT) && (bead.radius !== radius)) {
			bead.radius = radius;

			// If radius > 0, set all borders equal to largest border

			if (!bead.border.equal && (radius > 0)) {
				max = Math.max(bead.border.top, bead.border.left, bead.border.bottom, bead.border.right);
				_private._equalBorder(bead, max);
			}

			_private._makeDirty(bead);
		}

		return bead.radius;
	}

	_private._bgColor = function (x, y, colors) {
		var id, bead, def, current, rgb, r, g, b;

		id = (y * _private._grid.x) + x;
		bead = _private._beads[id];

		current = bead.bgColor;

		if (!bead.active)
			return current.rgb;

		if (PS.CURRENT == _private._checkColors(colors, current, _private._DEFAULTS.bead.bgColor))
			return current.rgb;

		// Only change color if different

		if (current.rgb !== colors.rgb) {
			current.rgb = colors.rgb;
			current.r = r = colors.r;
			current.g = g = colors.g;
			current.b = b = colors.b;
			current.str = _private._RSTR[r] + _private._GBSTR[g] + _private._GBSTR[b] + _private._ASTR[current.a];

			if (bead.active && ((bead.scale < 100) || (bead.radius > 0))) {
				_private._makeDirty(bead);
			}
		}

		return current.rgb;
	}

	_private._bgAlpha = function (x, y, alpha) {
		var id, bead, current;

		id = (y * _private._grid.x) + x;
		bead = _private._beads[id];
		current = bead.bgColor;

		if ((alpha !== PS.CURRENT) && (alpha !== current.a)) {
			current.a = alpha;
			current.str = _private._RSTR[current.r] + _private._GBSTR[current.g] + _private._GBSTR[current.b] + _private._ASTR[alpha];

			if (bead.active && ((bead.scale < 100) || (bead.radius > 0))) {
				_private._makeDirty(bead);
			}
		}

		return current.a;
	}

	_private._data = function (x, y, data) {
		var id, bead;

		id = (y * _private._grid.x) + x;
		bead = _private._beads[id];

		if (bead.active && (data !== PS.CURRENT)) {
			if (data === null) {
				bead.data = _private._DEFAULTS.bead.data;
				bead.fader.data = bead.data;
				bead.borderFader.data = bead.data;
				bead.glyphFader.data = bead.data;
			} else {
				bead.data = data;
				bead.fader.data = data;
				bead.borderFader.data = data;
				bead.glyphFader.data = data;
			}
		}

		return bead.data;
	}

	_private._exec = function (x, y, exec) {
		var id, bead;

		id = (y * _private._grid.x) + x;
		bead = _private._beads[id];

		if (bead.active && (exec !== PS.CURRENT)) {
			bead.exec = exec;
		}

		return bead.exec;
	}

	_private._visible = function (x, y, show) {
		var id, bead;

		id = (y * _private._grid.x) + x;
		bead = _private._beads[id];

		if (bead.active && (show !== PS.CURRENT) && (bead.visible !== show)) {
			bead.visible = show;
			if (!show) {
				bead.fader.kill = true;
				bead.borderFader.kill = true;
				bead.glyphFader.kill = true;
			}
			_private._makeDirty(bead);
		}

		return bead.visible;
	}

	_private._active = function (x, y, active) {
		var id, bead;

		id = (y * _private._grid.x) + x;
		bead = _private._beads[id];

		if (active !== PS.CURRENT) {
			bead.active = active;
		}

		return bead.active;
	}

	//--------------------
	// BEAD BORDER SUPPORT
	//--------------------

	_private._border = function (x, y, width) {
		var id, bead, max, val, any, top, left, bottom, right;

		id = (y * _private._grid.x) + x;
		bead = _private._beads[id];

		if (bead.active && (width !== PS.CURRENT)) {
			max = _private._borderMax(bead);

			// width is integer

			if (_private._typeOf(width) === "number") {
				if (width > max) {
					width = max;
				}
				if (width !== bead.border.width) {
					_private._equalBorder(bead, width);
					_private._makeDirty(bead);
				}
			}

			// width is an object
			else {
				any = false;

				// Detect which props are changing and if any are unequal

				// .top

				top = width.top;
				if (top === PS.CURRENT) {
					top = bead.border.top;
				} else {
					if (top > max) {
						top = max;
					}
					if (top !== bead.border.top) {
						bead.border.top = top;
						any = true;
					}
				}

				// .left

				left = width.left;
				if (left === PS.CURRENT) {
					left = bead.border.left;
				} else {
					if (left > max) {
						left = max;
					}
					if (left !== bead.border.left) {
						bead.border.left = left;
						any = true;
					}
				}

				// .bottom

				bottom = width.bottom;
				if (bottom === PS.CURRENT) {
					bottom = bead.border.bottom;
				} else {
					if (bottom > max) {
						bottom = max;
					}
					if (bottom !== bead.border.bottom) {
						bead.border.bottom = bottom;
						any = true;
					}
				}

				// .right

				right = width.right;
				if (right === PS.CURRENT) {
					right = bead.border.right;
				} else {
					if (right > max) {
						right = max;
					}
					if (right !== bead.border.right) {
						bead.border.right = right;
						any = true;
					}
				}

				// All equal?

				if ((top === left) && (top === right) && (top === bottom)) {
					_private._equalBorder(bead, top);
					if (any) {
						_private._makeDirty(bead);
					}
				}

				// Unequal sides allowed only on square beads
				// and beads without glyphs?

				// else if ( ( bead.radius > 0 ) || ( bead.glyph.code > 0 ) )
				else if (bead.radius > 0) {
					max = Math.max(top, left, bottom, right);
					_private._equalBorder(bead, max);
					_private._makeDirty(bead);
				} else {
					bead.border.equal = false;
					if (any) {
						_private._makeDirty(bead);
					}
				}
			}
		}

		// Set up return object

		val = {
			top: bead.border.top,
			left: bead.border.left,
			bottom: bead.border.bottom,
			right: bead.border.right,
			equal: bead.border.equal
		};

		// Fix by Mark Diehr

		if (!bead.border.equal) {
			bead.border.width = Math.max(val.top, val.left, val.bottom, val.right);
		}

		val.width = bead.border.width;

		return val;
	}

	_private._borderColor = function (x, y, colors) {
		var id, bead, current, fader, rgb, r, g, b, a;

		id = (y * _private._grid.x) + x;
		bead = _private._beads[id];
		current = bead.border.color;
		fader = bead.borderFader;

		if (!bead.active)
			return current.rgb;

		if (PS.CURRENT == _private._checkColors(colors, current, _private._DEFAULTS.bead.border.color))
			return current.rgb;

		// Only change color if different
		// But must also change if fader is active, start color is specified and doesn't match

		if ((current.rgb !== colors.rgb) || ((fader.rate > 0) && (fader.rgb !== null) && (fader.rgb !== colors.rgb))) {
			current.rgb = colors.rgb;

			r = colors.r;
			g = colors.g;
			b = colors.b;

			colors.a = a = current.a;

			current.str = colors.str = _private._RSTR[r] + _private._GBSTR[g] + _private._GBSTR[b] + _private._ASTR[a];

			if (bead.visible) {
				if (fader.rate > 0) // must use fader
				{
					if (fader.rgb !== null) // use start color if specified
					{
						_private._startFader(fader, fader.r, fader.g, fader.b, a, r, g, b, a);
					} else if (!fader.active) {
						_private._startFader(fader, current.r, current.g, current.b, a, r, g, b, a);
					} else // must recalculate active fader
					{
						_private._recalcFader(fader, r, g, b, a);
					}
				} else {
					_private._makeDirty(bead);
				}
			}

			current.r = r;
			current.g = g;
			current.b = b;
		}

		return current.rgb;
	}

	_private._borderAlpha = function (x, y, alpha) {
		var id, bead, current, r, g, b, fader;

		id = (y * _private._grid.x) + x;
		bead = _private._beads[id];

		current = bead.border.color;

		if (bead.active && (alpha !== PS.CURRENT) && (alpha !== current.a)) {
			r = current.r;
			g = current.g;
			b = current.b;

			current.str = _private._RSTR[r] + _private._GBSTR[g] + _private._GBSTR[b] + _private._ASTR[alpha];
			if (bead.visible) {
				fader = bead.borderFader;
				if (fader.rate > 0) // must use fader
				{
					if (!fader.active) {
						if (fader.rgb !== null) {
							_private._startFader(fader, fader.r, fader.g, fader.b, current.a, r, g, b, alpha);
						} else {
							_private._startFader(fader, r, g, b, current.a, r, g, b, alpha);
						}
					} else // must recalculate active fader
					{
						_private._recalcFader(fader, r, g, b, alpha);
					}
				} else {
					_private._makeDirty(bead);
				}
			}

			current.a = alpha;
		}

		return current.a;
	}

	_private._borderFade = function (x, y, rate, options) {
		var id, bead, fader, color, orate, nrate, val;

		id = (y * _private._grid.x) + x;
		bead = _private._beads[id];
		color = bead.border.color;
		fader = bead.borderFader;
		orate = fader.rate;

		if (bead.active) {
			if (rate === PS.CURRENT) {
				nrate = orate;
			} else if (rate === PS.DEFAULT) {
				nrate = _private._DEFAULTS.fader.rate;
			} else {
				nrate = rate;
			}

			val = options.rgb;
			if (val !== PS.CURRENT) {
				if (val === PS.DEFAULT) {
					fader.rgb = _private._DEFAULTS.fader.rgb;
				} else {
					fader.rgb = val;
				}
				fader.r = options.r;
				fader.g = options.g;
				fader.b = options.b;
			}

			val = options.onStep;
			if (val !== PS.CURRENT) {
				if (val === PS.DEFAULT) {
					fader.onStep = _private._DEFAULTS.fader.onStep;
				} else {
					fader.onStep = val;
				}
			}

			val = options.onEnd;
			if (val !== PS.CURRENT) {
				if (val === PS.DEFAULT) {
					fader.onEnd = _private._DEFAULTS.fader.onEnd;
				} else {
					fader.onEnd = val;
				}
			}

			val = options.params;
			if (val !== PS.CURRENT) {
				if (val === PS.DEFAULT) {
					fader.params = _private._DEFAULTS.fader.params;
				} else {
					fader.params = val;
				}
			}

			// Handle rate change

			if (orate !== nrate) {
				fader.rate = nrate;
				if (nrate < 1) {
					fader.active = false;
					fader.kill = true;
				} else if (fader.active) {
					_private._recalcFader(fader, color.r, color.g, color.b, 255);
				}
			}
		}

		return {
			rate: fader.rate,
			rgb: fader.rgb,
			onStep: fader.onStep,
			onEnd: fader.onEnd,
			params: fader.params
		};
	}

	//--------------
	// GLYPH SUPPORT
	//--------------

	// Expects a NUMERIC glyph

	_private._glyph = function (x, y, glyph) {
		var id, bead, str;

		id = (y * _private._grid.x) + x;
		bead = _private._beads[id];

		if (bead.active && (glyph !== PS.CURRENT) && (bead.glyph.code !== glyph)) {
			bead.glyph.code = glyph;

			if (glyph < 1) {
				str = "";
			} else {
				str = String.fromCodePoint(glyph);
			}

			bead.glyph.str = str;

			/*
			max = _private._borderMax( bead );

			if ( bead.border.equal )
			{
				if ( bead.border.width > max )
				{
					_private._equalBorder( bead, max );
				}
			}

			// Must set all borders equal

			else
			{
				top = bead.border.top;
				if ( top > max )
				{
					top = max;
				}

				left = bead.border.left;
				if ( left > max )
				{
					left = max;
				}

				bottom = bead.border.bottom;
				if ( bottom > max )
				{
					bottom = max;
				}

				right = bead.border.right;
				if ( right > max )
				{
					right = max;
				}

				// set all borders equal to largest border

				max = Math.max( top, left, bottom, right );
				_private._equalBorder( bead, max );
			}
			*/

			_private._makeDirty(bead);
		}

		return bead.glyph.code;
	}

	_private._glyphColor = function (x, y, colors) {
		var id, bead, current, fader, rgb, r, g, b, a;

		id = (y * _private._grid.x) + x;
		bead = _private._beads[id];
		current = bead.glyph.color;
		fader = bead.glyphFader;

		if (!bead.active)
			return current.rgb;

		if (PS.CURRENT == _private._checkColors(colors, current, _private._DEFAULTS.bead.glyph.color))
			return current.rgb;

		// Only change color if different
		// But must also change if fader is active, start color is specified and doesn't match

		if ((current.rgb !== colors.rgb) || ((fader.rate > 0) && (fader.rgb !== null) && (fader.rgb !== colors.rgb))) {
			current.rgb = colors.rgb;

			r = colors.r;
			g = colors.g;
			b = colors.b;

			colors.a = a = current.a;

			current.str = colors.str = _private._RSTR[r] + _private._GBSTR[g] + _private._GBSTR[b] + _private._ASTR[a];

			if (bead.visible) {
				if (fader.rate > 0) // must use fader
				{
					if (fader.rgb !== null) // use start color if specified
					{
						_private._startFader(fader, fader.r, fader.g, fader.b, a, r, g, b, a);
					}
					if (!fader.active) {
						_private._startFader(fader, current.r, current.g, current.b, a, r, g, b, a);
					} else // must recalculate active fader
					{
						_private._recalcFader(fader, r, g, b, a);
					}
				} else {
					_private._makeDirty(bead);
				}
			}

			current.r = r;
			current.g = g;
			current.b = b;
		}

		return current.rgb;
	}

	_private._glyphAlpha = function (x, y, alpha) {
		var id, bead, current, r, g, b, fader;

		id = (y * _private._grid.x) + x;
		bead = _private._beads[id];

		current = bead.glyph.color;

		if (bead.active && (alpha !== PS.CURRENT) && (alpha !== current.a)) {
			r = current.r;
			g = current.g;
			b = current.b;

			current.str = _private._RSTR[r] + _private._GBSTR[g] + _private._GBSTR[b] + _private._ASTR[alpha];

			if (bead.visible) {
				fader = bead.glyphFader;
				if (fader.rate > 0) // must use fader
				{
					if (!fader.active) {
						_private._startFader(fader, r, g, b, current.a, r, g, b, alpha);
					} else // must recalculate active fader
					{
						_private._recalcFader(fader, r, g, b, alpha);
					}
				} else {
					_private._makeDirty(bead);
				}
			}

			current.a = alpha;
		}

		return current.a;
	}

	_private._glyphScale = function (x, y, scale) {
		var id, bead, current;

		id = (y * _private._grid.x) + x;
		bead = _private._beads[id];

		current = bead.glyph.scale;

		if (bead.active && (scale !== PS.CURRENT) && (scale !== current)) {
			bead.glyph.scale = scale;

			if (bead.visible) {
				_private._rescaleGlyph(bead);
				_private._makeDirty(bead);
			}
		}

		return bead.glyph.scale;
	}

	_private._glyphFade = function (x, y, rate, options) {
		var id, bead, color, fader, orate, nrate, val;

		id = (y * _private._grid.x) + x;
		bead = _private._beads[id];
		color = bead.glyph.color;
		fader = bead.glyphFader;
		orate = fader.rate;

		if (bead.active) {
			if (rate === PS.CURRENT) {
				nrate = orate;
			} else if (rate === PS.DEFAULT) {
				nrate = _private._DEFAULTS.fader.rate;
			} else {
				nrate = rate;
			}

			val = options.rgb;
			if (val !== PS.CURRENT) {
				if (val === PS.DEFAULT) {
					fader.rgb = _private._DEFAULTS.fader.rgb;
				} else {
					fader.rgb = val;
				}
				fader.r = options.r;
				fader.g = options.g;
				fader.b = options.b;
			}

			val = options.onStep;
			if (val !== PS.CURRENT) {
				if (val === PS.DEFAULT) {
					fader.onStep = _private._DEFAULTS.fader.onStep;
				} else {
					fader.onStep = val;
				}
			}

			val = options.onEnd;
			if (val !== PS.CURRENT) {
				if (val === PS.DEFAULT) {
					fader.onEnd = _private._DEFAULTS.fader.onEnd;
				} else {
					fader.onEnd = val;
				}
			}

			val = options.params;
			if (val !== PS.CURRENT) {
				if (val === PS.DEFAULT) {
					fader.params = _private._DEFAULTS.fader.params;
				} else {
					fader.params = val;
				}
			}

			// Handle rate change

			if (orate !== nrate) {
				fader.rate = nrate;
				if (nrate < 1) {
					fader.active = false;
					fader.kill = true;
				} else if (fader.active) {
					_private._recalcFader(fader, color.r, color.g, color.b, 255);
				}
			}
		}

		return {
			rate: fader.rate,
			rgb: fader.rgb,
			onStep: fader.onStep,
			onEnd: fader.onEnd,
			params: fader.params
		};
	}

	//--------------
	// IMAGE SUPPORT
	//--------------

	// Error handler for image loading

	_private._imageError = function (image) {
		var id, len, i, rec, exec;

		id = image.getAttribute("data-id"); // the user function id

		// find the matching image record

		len = _private._imageList.length;
		for (i = 0; i < len; i += 1) {
			rec = _private._imageList[i];
			if (rec.id === id) // here it is!
			{
				exec = rec.exec;
				_private._imageList.splice(i, 1); // delete the record
				break;
			}
		}

		try {
			exec(PS.ERROR); // call user function with error string
		} catch (err) {
			_private._errorCatch("[PS.imageLoad] .exec function failed [" + err.message + "]", err);
		}

		_private._error("[PS.imageLoad] Error loading " + image.src);
	}

	// Return an image table from an imageData file
	// Optional [format] determines pixel format (1, 2, 3, 4)

	_private._imageExtract = function (imageData, format) {
		var fn, w, h, ctx, srcImage, destImage, src, len, dest, i, j, r, g, b, a;

		fn = "[_imageExtract] ";

		// check validity of image structure

		w = imageData.width;
		if ((_private._typeOf(w) !== "number") || (w < 1)) {
			return _private._error(fn + "image width invalid");
		}
		w = Math.floor(w);

		h = imageData.height;
		if ((_private._typeOf(h) !== "number") || (h < 1)) {
			return _private._error(fn + "image height invalid");
		}
		h = Math.floor(h);

		// draw the image onto the offscreen canvas

		try {
			_private._imageCanvas.width = w; // this clears the offscreen canvas
			_private._imageCanvas.height = h;
			ctx = _private._imageCanvas.getContext("2d");
			ctx.drawImage(imageData, 0, 0, w, h, 0, 0, w, h);
		} catch (e1) {
			return _private._errorCatch(fn + "image extraction failed @ 1 [" + e1.message + "]", e1);
		}

		// fetch the source's image data

		try {
			srcImage = ctx.getImageData(0, 0, w, h);
		} catch (e2) {
			return _private._errorCatch(fn + "image extraction failed @ 2 [" + e2.message + "]", e2);
		}

		// srcImage is read-only for some reason
		// so make a copy of it in destImage

		destImage = {
			width: srcImage.width,
			height: srcImage.height
		};

		src = srcImage.data; // source array
		len = src.length; // and its length

		dest = []; // new dest array

		j = i = 0;
		if (format === 1) {
			dest.length = len / 4;
			while (i < len) {
				r = src[i]; // r
				g = src[i + 1]; // g
				b = src[i + 2]; // b

				dest[j] = (r * _private._RSHIFT) + (g * _private._GSHIFT) + b;

				i += 4;
				j += 1;
			}
		} else if (format === 2) {
			dest.length = len / 2;
			while (i < len) {
				r = src[i]; // r
				g = src[i + 1]; // g
				b = src[i + 2]; // b
				a = src[i + 3]; // a

				dest[j] = (r * _private._RSHIFT) + (g * _private._GSHIFT) + b;
				dest[j + 1] = a;

				i += 4;
				j += 2;
			}
		} else if (format === 3) {
			dest.length = (len / 4) * 3;
			while (i < len) {
				r = src[i]; // r
				g = src[i + 1]; // g
				b = src[i + 2]; // b

				dest[j] = r;
				dest[j + 1] = g;
				dest[j + 2] = b;

				i += 4;
				j += 3;
			}
		} else // format 4
		{
			dest.length = len;
			while (i < len) {
				dest[i] = src[i]; // r
				i += 1;
				dest[i] = src[i]; // g
				i += 1;
				dest[i] = src[i]; // b
				i += 1;
				dest[i] = src[i]; // a
				i += 1;
			}
		}

		destImage.pixelSize = format;
		destImage.data = dest;
		return destImage;
	}

	// System loader for images

	_private._imageLoad = function (image) {
		var id, len, i, rec, exec, format, source, idata;

		id = image.getAttribute("data-id"); // the user function id

		// find the matching image record

		len = _private._imageList.length;
		for (i = 0; i < len; i += 1) {
			rec = _private._imageList[i];
			if (rec.id === id) // here it is!
			{
				exec = rec.exec;
				format = rec.format;
				source = rec.source;
				_private._imageList.splice(i, 1); // delete the record
				break;
			}
		}

		idata = _private._imageExtract(image, format); // extract the data
		if (idata !== PS.ERROR) {
			try {
				idata.source = source;
				idata.id = id;
				exec(idata); // call user function with image object
			} catch (err) {
				_private._errorCatch("[PS.imageLoad] .exec function failed [" + err.message + "]", err);
			}
		}
	}

	// Validate an image object
	// Returns true if image structure is valid, else PS.ERROR

	_private._validImage = function (fn, image) {
		var w, h, format, total, data, len, i, val;

		// Verify image properties

		if (_private._typeOf(image) !== "object") {
			return _private._error(fn + "image argument not an object");
		}

		w = image.width;
		if (_private._typeOf(w) !== "number") {
			return _private._error(fn + "image.width not a number");
		}
		w = Math.floor(w);
		if (w < 1) {
			return _private._error(fn + "image.width < 1");
		}
		image.width = w;

		h = image.height;
		if (_private._typeOf(h) !== "number") {
			return _private._error(fn + "image.height not a number");
		}
		h = Math.floor(h);
		if (h < 1) {
			return _private._error(fn + "image.height < 1");
		}
		image.height = h;

		format = image.pixelSize;
		if (_private._typeOf(format) !== "number") {
			return _private._error(fn + "image.pixelSize not a number");
		}
		format = Math.floor(format);
		if ((format < 1) && (format > 4)) {
			return _private._error(fn + "image.pixelSize is not 1, 2, 3 or 4");
		}
		image.pixelSize = format;

		// verify data is expected length

		data = image.data;
		if (_private._typeOf(data) !== "array") {
			return _private._error(fn + "image.data is not an array");
		}

		len = data.length;
		total = w * h * format;
		if (len !== total) {
			return _private._error(fn + "image.data length invalid");
		}

		// Quick check of data values
		// Would be nice if a previously validated image could be marked somehow ...

		for (i = 0; i < len; i += 1) {
			val = data[i];
			if (_private._typeOf(val) !== "number") {
				return _private._error(fn + "image.data[" + i + "] not a number");
			}
			if (val < 0) {
				return _private._error(fn + "image.data[" + i + "] negative");
			}
			if (format < 3) {
				if (val > 0xFFFFFF) {
					return _private._error(fn + "image.data[" + i + "] > 0xFFFFFF");
				}
			} else if (val > 255) {
				return _private._error(fn + "image.data[" + i + "] > 255");
			}
		}

		return true;
	}

	// Print a value in hex with optional zero padding

	_private._hex = function (data, pad) {
		var str, i;

		str = data.toString(16).toUpperCase();
		if (pad) {
			i = str.length;
			while (i < pad) {
				str = "0" + str;
				i += 1;
			}
		}
		return ("0x" + str);
	}

	_private._outputPixel = function (format, hex, rgb, r, g, b, a) {
		var str;

		if (format < 3) // formats 1 & 2
		{
			str = "";
			if (hex) {
				str += _private._hex(rgb, 6);
			} else {
				str += rgb;
			}

			if (format === 2) {
				if (hex) {
					str += (", " + _private._hex(a, 2));
				} else {
					str += (", " + a);
				}
			}
		} else // format 3 & 4
		{
			if (hex) {
				str = _private._hex(r, 2) + ", " + _private._hex(g, 2) + ", " + _private._hex(b, 2);
			} else {
				str = r + ", " + g + ", " + b;
			}
			if (format === 4) {
				if (hex) {
					str += (", " + _private._hex(a, 2));
				} else {
					str += (", " + a);
				}
			}
		}

		return str;
	}

	// --------------
	// SPRITE SUPPORT
	// --------------

	_private._newSprite = function () {
		var s;

		// Sprite object properties:
		// .id = unique id string
		// .placed = true if sprite has been positioned
		// .visible = true if visible
		// .x, .y = virtual x/y position
		// .ax. .ay = positional axis
		// .collide = function to call on collisions, null if none
		// .image = image object for this sprite, null if a solid sprite
		// .color = color object with .rgb|.r|.g|.b|.a properties for a solid sprite, null if an image
		// .width = total width of rect or image
		// .height = total height of rect or image
		// .plane = plane occupied by this sprite, -1 if none assigned

		s = {
			id: _private._SPRITE_PREFIX + _private._spriteCnt,
			placed: false,
			visible: true,
			x: 0,
			y: 0,
			ax: 0,
			ay: 0,
			image: null,
			color: null,
			collide: null,
			width: 0,
			height: 0,
			plane: -1
		};

		_private._spriteCnt += 1;
		_private._sprites.push(s);
		return s;
	}

	// Returns sprite object if [sprite] is a valid sprite reference, else PS.ERROR

	_private._getSprite = function (sprite, fn) {
		var len, i, s;

		if ((typeof sprite !== "string") || (sprite.length < 1)) {
			return _private._error(fn + "sprite argument invalid");
		}

		len = _private._sprites.length;
		for (i = 0; i < len; i += 1) {
			s = _private._sprites[i];
			if (s.id === sprite) {
				return s;
			}
		}

		return _private._error(fn + "sprite id '" + sprite + "' does not exist");
	}

	// Erase a sprite, using optional region
	// Compensate for axis, don't touch anything off grid

	_private._eraseSprite = function (s, left, top, width, height) {
		var xmax, ymax, right, bottom, x, y, bead, i, color;

		if (left === undefined) {
			left = s.x;
			top = s.y;
			width = s.width;
			height = s.height;
		}

		// Calc actual left/width

		xmax = _private._grid.x;
		left -= s.ax;
		if (left >= xmax) // off grid?
		{
			return;
		}
		if (left < 0) {
			width += left;
			if (width < 1) // off grid?
			{
				return;
			}
			left = 0;
		}
		if ((left + width) > xmax) {
			width = xmax - left;
		}
		right = left + width;

		// Calc actual top/height

		ymax = _private._grid.y;
		top -= s.ay;
		if (top >= ymax) // off grid?
		{
			return;
		}
		if (top < 0) {
			height += top;
			if (height < 1) // off grid?
			{
				return;
			}
			top = 0;
		}
		if ((top + height) > ymax) {
			height = ymax - top;
		}
		bottom = top + height;

		for (y = top; y < bottom; y += 1) {
			for (x = left; x < right; x += 1) {
				i = x + (y * xmax); // get index of bead
				bead = _private._beads[i];
				if (bead.active) {
					color = _private._colorPlane(bead, s.plane);
					color.r = 255;
					color.g = 255;
					color.b = 255;
					color.a = 0;
					color.rgb = 0xFFFFFF;
					_private._recolor(bead); // recolor with no fader
				}
			}
		}
	}

	// Draw a solid or image sprite
	// Compensate for axis, don't touch anything off grid

	_private._drawSprite = function (s) {
		var width, height, xmax, ymax, left, top, right, bottom, srcLeft, srcTop, scolor,
			x, y, bead, i, bcolor, data, ptr, r, g, b, a;

		width = s.width;
		height = s.height;
		if ((width < 1) || (height < 1)) {
			return;
		}

		// Calc actual left/width

		xmax = _private._grid.x;
		srcLeft = 0;
		left = s.x - s.ax;
		if (left >= xmax) // off grid?
		{
			return;
		}
		if (left < 0) {
			width += left;
			if (width < 1) // off grid?
			{
				return;
			}
			left = 0;
			srcLeft = s.width - width;
		}
		if ((left + width) > xmax) {
			width = xmax - left;
		}
		right = left + width;

		// Calc actual top/height

		ymax = _private._grid.y;
		srcTop = 0;
		top = s.y - s.ay;
		if (top >= ymax) // off grid?
		{
			return;
		}
		if (top < 0) {
			height += top;
			if (height < 1) // off grid?
			{
				return;
			}
			top = 0;
			srcTop = s.height - height;
		}
		if ((top + height) > ymax) {
			height = ymax - top;
		}
		bottom = top + height;

		scolor = s.color;
		if (scolor) // solid sprite
		{
			for (y = top; y < bottom; y += 1) {
				for (x = left; x < right; x += 1) {
					i = x + (y * xmax); // get index of bead
					bead = _private._beads[i];
					if (bead.active) {
						bcolor = _private._colorPlane(bead, s.plane);
						bcolor.rgb = scolor.rgb;
						bcolor.r = scolor.r;
						bcolor.g = scolor.g;
						bcolor.b = scolor.b;
						bcolor.a = scolor.a;
						_private._recolor(bead);
					}
				}
			}
		} else // image sprite
		{
			data = s.image.data;
			for (y = top; y < bottom; y += 1) {
				ptr = ((srcTop * s.width) + srcLeft) * 4;
				for (x = left; x < right; x += 1) {
					i = x + (y * xmax); // get index of bead
					bead = _private._beads[i];
					if (bead.active) {
						r = data[ptr];
						g = data[ptr + 1];
						b = data[ptr + 2];
						a = data[ptr + 3];

						bcolor = _private._colorPlane(bead, s.plane);
						bcolor.rgb = (r * _private._RSHIFT) + (g * _private._GSHIFT) + b;
						bcolor.r = r;
						bcolor.g = g;
						bcolor.b = b;
						bcolor.a = a;
						_private._recolor(bead);
					}
					ptr += 4;
				}
				srcTop += 1;
			}
		}
	}

	// See if sprite [s, id] is touching or overlapping any other sprite
	// Send collision messages as needed

	_private._collisionCheck = function (s, id) {
		var fn, len, i, x, y, w, h, exec, s2, id2, x2, y2, w2, h2, exec2, dx, dy, evt;

		fn = "[_collisionCheck] ";

		x = s.x - s.ax;
		y = s.y - s.ay;
		w = s.width;
		h = s.height;
		exec = s.collide;

		len = _private._sprites.length;
		for (i = 0; i < len; i += 1) {
			s2 = _private._sprites[i];
			id2 = s2.id;
			if ((id2 !== id) && s2.visible && s2.placed) {
				x2 = s2.x - s2.ax;
				y2 = s2.y - s2.ay;
				w2 = s2.width;
				h2 = s2.height;
				exec2 = s2.collide;

				// calc dx

				if (x2 > x) {
					dx = x2 - x;
				} else {
					dx = x - x2;
				}

				// Calc dy

				if (y2 > y) {
					dy = y2 - y;
				} else {
					dy = y - y2;
				}

				evt = null; // assume no collision

				// Adjacent horizontally?

				if ((x === (x2 - w)) || (x === (x2 + w2))) {
					if (((y <= y2) && (dy <= h)) || ((y >= y2) && (dy <= h2))) {
						evt = PS.SPRITE_TOUCH;
					}
				}

				// Adjacent vertically?
				else if ((y === (y2 - h)) || (y === (y2 + h2))) {
					if (((x <= x2) && (dx <= w)) || ((x >= x2) && (dx <= w2))) {
						evt = PS.SPRITE_TOUCH;
					}
				} else if ((x >= x2) && (x < (x2 + w2))) {
					if (((y <= y2) && (dy < h)) || ((y >= y2) && (dy < h2))) {
						evt = PS.SPRITE_OVERLAP;
					}
				} else if ((x2 >= x) && (x2 < (x + w))) {
					if (((y2 <= y) && (dy < h2)) || ((y2 >= y) && (dy < h))) {
						evt = PS.SPRITE_OVERLAP;
					}
				}

				if (evt) {
					// Report s1's collision with s2

					if (exec) {
						try {
							exec(id, s.plane, id2, s2.plane, evt);
						} catch (e1) {
							_private._errorCatch(fn + id + " collide function failed [" + e1.message + "]", e1);
							return;
						}
					}

					// Report s2's collision with s1

					if (exec2) {
						try {
							exec2(id2, s2.plane, id, s.plane, evt);
						} catch (e2) {
							_private._errorCatch(fn + id2 + " collide function failed [" + e2.message + "]", e2);
							return;
						}
					}
				}
			}
		}
	}

	//---------------------------
	// BINARY HEAP FOR PATHFINDER
	//---------------------------

	// Based on code by Marijn Haverbeke
	// http://eloquentjavascript.net/appendix2.html

	_private.BinaryHeap = function (scoreFunction) {
		this.content = [];
		this.scoreFunction = scoreFunction;
	}

	_private.BinaryHeap.prototype = {
		push: function (element) {
			// Add the new element to the end of the array

			this.content.push(element);

			// Allow it to bubble up

			this.bubbleUp(this.content.length - 1);
		},

		pop: function () {
			var result, end;

			// Store the first element so we can return it later.

			result = this.content[0];

			// Get the element at the end of the array.

			end = this.content.pop();

			// If there are any elements left, put the end element at the
			// start, and let it sink down.

			if (this.content.length > 0) {
				this.content[0] = end;
				this.sinkDown(0);
			}
			return result;
		},

		remove: function (node) {
			var len, i, end;

			len = this.content.length;

			// To remove a value, we must search through the array to find it

			for (i = 0; i < len; i += 1) {
				if (this.content[i] === node) {
					// When it is found, the process seen in 'pop' is repeated to fill up the hole

					end = this.content.pop();

					// If the element we popped was the one we needed to remove, we're done

					if (i !== (len - 1)) {
						// Otherwise, we replace the removed element with the popped one, and allow it to float up or sink down as appropriate

						this.content[i] = end;
						this.bubbleUp(i);
						this.sinkDown(i);
					}
					break;
				}
			}
		},

		size: function () {
			var len;

			len = this.content.length;
			return len;
		},

		bubbleUp: function (n) {
			var element, score, parentN, parent;

			// Fetch the element that has to be moved

			element = this.content[n];
			score = this.scoreFunction(element);

			// When at 0, an element can not go up any further

			while (n > 0) {
				// Compute the parent element's index, and fetch it

				parentN = Math.floor((n + 1) / 2) - 1;
				parent = this.content[parentN];

				// If the parent has a lesser score, things are in order and we are done

				if (score >= this.scoreFunction(parent)) {
					break;
				}

				// Otherwise, swap the parent with the current element and continue

				this.content[parentN] = element;
				this.content[n] = parent;
				n = parentN;
			}
		},

		sinkDown: function (n) {
			var len, element, elemScore, child1N, child2N, swap, child1, child1Score, child2, child2Score;

			// Look up the target element and its score

			len = this.content.length;
			element = this.content[n];
			elemScore = this.scoreFunction(element);

			while (true) {
				// Compute the indices of the child elements

				child2N = (n + 1) * 2;
				child1N = child2N - 1;

				// This is used to store the new position of the element, if any

				swap = null;

				// If the first child exists (is inside the array)...

				if (child1N < len) {
					// Look it up and compute its score

					child1 = this.content[child1N];
					child1Score = this.scoreFunction(child1);

					// If the score is less than our element's, we need to swap

					if (child1Score < elemScore) {
						swap = child1N;
					}
				}

				// Do the same checks for the other child

				if (child2N < len) {
					child2 = this.content[child2N];
					child2Score = this.scoreFunction(child2);

					if (child2Score < (swap === null ? elemScore : child1Score)) {
						swap = child2N;
					}
				}

				// No need to swap further, we are done

				if (swap === null) {
					break;
				}

				// Otherwise, swap and continue

				this.content[n] = this.content[swap];
				this.content[swap] = element;
				n = swap;
			}
		},

		rescore: function (e) {
			this.sinkDown(this.content.indexOf(e));
		}
	};

	//--------------
	// A* PATHFINDER
	//--------------

	// Returns a straight line between x1|y1 and x2|y2

	_private._line = function (x1, y1, x2, y2) {
		var dx, dy, sx, sy, err, e2, line;

		if (x2 > x1) {
			dx = x2 - x1;
		} else {
			dx = x1 - x2;
		}

		if (y2 > y1) {
			dy = y2 - y1;
		} else {
			dy = y1 - y2;
		}

		if (x1 < x2) {
			sx = 1;
		} else {
			sx = -1;
		}

		if (y1 < y2) {
			sy = 1;
		} else {
			sy = -1;
		}

		err = dx - dy;

		line = [];

		while ((x1 !== x2) || (y1 !== y2)) {
			e2 = err * 2;
			if (e2 > -dy) {
				err -= dy;
				x1 += sx;
			}
			if ((x1 === x2) && (y1 === y2)) {
				line.push([x1, y1]);
				break;
			}
			if (e2 < dx) {
				err += dx;
				y1 += sy;
			}
			line.push([x1, y1]);
		}

		return line;
	}

	//	Returns a straight line between x1|y1 and x2|y2, or null if wall blocks path
	// If [corner] = true, stops if line will cut across a wall corner

	_private._lineWall = function (nodes, width, x1, y1, x2, y2) {
		var dx, dy, sx, sy, err, e2, line, node, ptr;

		if (x2 > x1) {
			dx = x2 - x1;
		} else {
			dx = x1 - x2;
		}

		if (y2 > y1) {
			dy = y2 - y1;
		} else {
			dy = y1 - y2;
		}

		if (x1 < x2) {
			sx = 1;
		} else {
			sx = -1;
		}

		if (y1 < y2) {
			sy = 1;
		} else {
			sy = -1;
		}

		err = dx - dy;
		line = [];

		while ((x1 !== x2) || (y1 !== y2)) {
			e2 = err * 2;
			if (e2 > -dy) // moving left/right
			{
				err -= dy;
				x1 += sx;
			}
			if ((x1 === x2) && (y1 === y2)) {
				line.push([x1, y1]);
				// we already know dest is walkable
				return line;
			}
			if (e2 < dx) // moving up/down
			{
				err += dx;
				y1 += sy;
			}

			// Is this loc walkable?

			ptr = (y1 * width) + x1;
			node = nodes[ptr];
			if (!node.value) // no; we're done
			{
				return null;
			}
			line.push([x1, y1]);
		}

		return line;
	}

	// _private._heuristic ( x1, y1, x2, y2 )

	_private._heuristic = function (x1, y1, x2, y2) {
		var dx, dy, h;

		if (x2 > x1) {
			dx = x2 - x1;
		} else {
			dx = x1 - x2;
		}

		if (y2 > y1) {
			dy = y2 - y1;
		} else {
			dy = y1 - y2;
		}

		if (dx > dy) {
			h = (dy * _private._DIAGONAL_COST) + (dx - dy);
		} else {
			h = (dx * _private._DIAGONAL_COST) + (dy - dx);
		}
		return h;
	}

	// _private._neighbors ( nodes, width, height, current )
	// Creates an array of all neighbor nodes
	// Stays inside grid and avoids walls
	// If [no_diagonals] = true, diagonals are not searched
	// If [cut_corners] = true, diagonal cutting around corners is enabled
	// Some of these calcs could be done when creating the nodes ...

	_private._neighbors = function (nodes, width, height, current, no_diagonals, cut_corners) {
		var result, x, y, right, bottom, north, south, center, nx, ptr, node, nwall, swall, ewall, wwall;

		result = [];
		x = current.x;
		y = current.y;
		right = width - 1;
		bottom = height - 1;
		center = y * width;
		north = (y - 1) * width;
		south = (y + 1) * width;
		nwall = false;
		swall = false;
		ewall = false;
		wwall = false;

		if (x > 0) {
			nx = x - 1;

			// west

			ptr = center + nx;
			node = nodes[ptr];
			if (!node.value) {
				wwall = true;
			} else if (!node.closed) {
				node.cost = node.value;
				result.push(node);
			}
		}

		if (x < right) {
			nx = x + 1;

			// east

			ptr = center + nx;
			node = nodes[ptr];
			if (!node.value) {
				ewall = true;
			} else if (!node.closed) {
				node.cost = node.value;
				result.push(node);
			}
		}

		if (y > 0) {
			// north

			ptr = north + x;
			node = nodes[ptr];
			if (!node.value) {
				nwall = true;
			} else if (!node.closed) {
				node.cost = node.value;
				result.push(node);
			}
		}

		if (y < bottom) {
			// south

			ptr = south + x;
			node = nodes[ptr];
			if (!node.value) {
				swall = true;
			} else if (!node.closed) {
				node.cost = node.value;
				result.push(node);
			}
		}

		if (!no_diagonals) {
			if (x > 0) {
				nx = x - 1;
				if ((y > 0) && (cut_corners || (!wwall && !nwall))) {
					// northwest

					ptr = north + nx;
					node = nodes[ptr];
					if (node.value && !node.closed) {
						node.cost = node.value * _private._DIAGONAL_COST;
						result.push(node);
					}
				}
				if ((y < bottom) && (cut_corners || (!wwall && !swall))) {
					// southwest

					ptr = south + nx;
					node = nodes[ptr];
					if (node.value && !node.closed) {
						node.cost = node.value * _private._DIAGONAL_COST;
						result.push(node);
					}
				}
			}
			if (x < right) {
				nx = x + 1;
				if ((y > 0) && (cut_corners || (!nwall && !ewall))) {
					// northeast

					ptr = north + nx;
					node = nodes[ptr];
					if (node.value && !node.closed) {
						node.cost = node.value * _private._DIAGONAL_COST;
						result.push(node);
					}
				}
				if ((y < bottom) && (cut_corners || (!swall && !ewall))) {
					// southeast

					ptr = south + nx;
					node = nodes[ptr];
					if (node.value && !node.closed) {
						node.cost = node.value * _private._DIAGONAL_COST;
						result.push(node);
					}
				}
			}
		}

		return result;
	}

	// _private._score ( node )
	// Scoring function for nodes

	_private._score = function (node) {
		return node.f;
	}

	// _private._findPath ( pm, x1, y1, x2, y2, no_diagonals, cut_corners )
	// Returns an array of x/y coordinates

	_private._findPath = function (pm, x1, y1, x2, y2, no_diagonals, cut_corners) {
		var width, height, nodes, ptr, node, path, len, heap, current, neighbors, nlen, i, n, gScore, beenVisited, here;

		// If current loc is same as dest, return empty path

		if ((x1 === x2) && (y1 === y2)) {
			return [];
		}

		width = pm.width;
		height = pm.height;
		nodes = pm.nodes;

		// If either location is in a wall, return empty path

		ptr = (y1 * width) + x1;
		node = nodes[ptr];
		if (!node.value) {
			return [];
		}

		ptr = (y2 * width) + x2;
		node = nodes[ptr];
		if (!node.value) {
			return [];
		}

		// Check if a straight line works

		if (!no_diagonals) {
			path = _private._lineWall(nodes, width, x1, y1, x2, y2);
			if (path) {
				return path;
			}
		}

		// Reset all nodes

		len = nodes.length;
		for (i = 0; i < len; i += 1) {
			node = nodes[i];
			node.f = 0;
			node.g = 0;
			node.h = 0;
			node.cost = 0;
			node.closed = false;
			node.visited = false;
			node.parent = null;
		}

		path = [];

		// Init open node list

		heap = new _private.BinaryHeap(_private._score);

		// Init with starting node

		ptr = (y1 * width) + x1;
		node = nodes[ptr];
		heap.push(node);

		// Main loop

		while (heap.size() > 0) {
			current = heap.pop();

			if ((current.x === x2) && (current.y === y2)) {
				// create path

				here = current;
				while (here.parent) {
					path.push([here.x, here.y]);
					here = here.parent;
				}
				path.reverse();
				break;
			}

			current.closed = true;

			neighbors = _private._neighbors(nodes, width, height, current, no_diagonals, cut_corners);

			nlen = neighbors.length;
			for (i = 0; i < nlen; i += 1) {
				n = neighbors[i];

				// The g score is the shortest distance from start to current node
				// We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet

				gScore = current.g + n.cost;

				beenVisited = n.visited;

				if (!beenVisited || (gScore < n.g)) {
					// Found an optimal (so far) path to this node
					// Take score for node to see how good it is

					n.visited = true;
					n.parent = current;
					n.h = n.h || _private._heuristic(n.x, n.y, x2, y2);
					n.g = gScore;
					n.f = n.g + n.h;

					if (!beenVisited) {
						heap.push(n); // Pushing to heap will put it in proper place based on 'f' value
					} else {
						heap.rescore(n); // Already seen node, but rescored so reorder it in heap
					}
				}
			}
		}

		return path;
	}

	// _private._pathData ( pm, left, top, width, height, data )
	// If [data] = PS.CURRENT, no data changed
	// If [data] = PS.DEFAULT, revert to original value
	// Else change pathmap value to [data]
	// Returns array of data at each point in region

	_private._pathData = function (pm, left, top, width, height, data) {
		var result, nodes, bottom, ptr, x, y, i, node;

		result = [];
		result.length = width * height;

		nodes = pm.nodes;
		bottom = top + height;

		i = 0; // output index

		for (y = top; y < bottom; y += 1) {
			ptr = (y * pm.width) + left; // point to first node in row
			for (x = 0; x < width; x += 1) {
				node = nodes[ptr];
				if (data !== PS.CURRENT) // just get current value
				{
					if (data === PS.DEFAULT) {
						node.value = node.ovalue; // restore original value
					} else {
						node.value = data; // use new value
					}
				}
				result[i] = node.value;
				i += 1;
				ptr += 1;
			}
		}

		return result;
	}

	// _private._newMap ( width, height, data )
	// Creates a new pathmap object and returns its id
	// [data] should be a 1-dimensional numeric array with [width] * [height] elements
	// 0 elements are walls, non-zero elements are floor (relative value determines weighting)

	_private._newMap = function (width, height, data) {
		var nodes, len, ptr, x, y, node, val, pm;

		// Initialize node structure

		len = data.length;

		nodes = [];
		nodes.length = len;

		ptr = 0;
		for (y = 0; y < height; y += 1) {
			for (x = 0; x < width; x += 1) {
				val = data[ptr];
				node = {
					x: x,
					y: y,
					value: val,
					ovalue: val,
					f: 0,
					g: 0,
					h: 0,
					cost: 0,
					parent: null,
					closed: false,
					visited: false
				};
				nodes[ptr] = node;
				ptr += 1;
			}
		}

		pm = {
			id: _private._PATHMAP_PREFIX + _private._pathmapCnt,
			width: width,
			height: height,
			nodes: nodes
		};

		_private._pathmapCnt += 1;
		_private._pathmaps.push(pm);

		return pm;
	}

	// _private._getMap( id )
	// Returns pathmap matching [id], null if none found

	_private._getMap = function (pathmap) {
		var len, i, pm;

		len = _private._pathmaps.length;
		for (i = 0; i < len; i += 1) {
			pm = _private._pathmaps[i];
			if (pm.id === pathmap) {
				return pm;
			}
		}
		return null;
	}

	// _private._deleteMap( id )
	// Deletes [pathmap], returns true if deleted or false if path not found

	_private._deleteMap = function (pathmap) {
		var len, i, pm, nodes, j;

		len = _private._pathmaps.length;
		for (i = 0; i < len; i += 1) {
			pm = _private._pathmaps[i];
			if (pm.id === pathmap) {
				// Explcitly nuke each node to help garbage collector

				nodes = pm.nodes;
				len = nodes.length;
				for (j = 0; j < len; j += 1) {
					nodes[j] = null;
				}
				pm.nodes = null; // nuke the array too

				_private._pathmaps.splice(i, 1);
				return true;
			}
		}
		return false;
	}

	// Find closest walkable point in source direction
	// [x1|y1] is current, [x2|y2] is clicked location

	_private._pathNear = function (pm, x1, y1, x2, y2) {
		var nodes, width, height, level, nlist, left, top, right, bottom, start, end, ptr, i, node, len, min, j, cnt, pos;

		nodes = pm.nodes;
		width = pm.width;
		height = pm.height;

		level = 1;
		while (level < width) {
			nlist = [];

			left = x2 - level;
			right = x2 + level;
			top = y2 - level;
			bottom = y2 + level;

			// top/bottom sides

			start = left;
			if (start < 0) {
				start = 0;
			}
			end = right + 1;
			if (end >= width) {
				end = width;
			}

			// top

			if (top >= 0) {
				ptr = (top * width) + start;
				for (i = start; i < end; i += 1) {
					node = nodes[ptr];
					if (node.value) {
						nlist.push([node.x, node.y]);
					}
					ptr += 1;
				}
			}

			// bottom

			if (bottom < height) {
				ptr = (bottom * width) + start;
				for (i = start; i < end; i += 1) {
					node = nodes[ptr];
					if (node.value) {
						nlist.push([node.x, node.y]);
					}
					ptr += 1;
				}
			}

			// left/right sides

			start = top + 1;
			if (start < 0) {
				start = 0;
			}
			end = bottom;
			if (end >= height) {
				end = height;
			}

			// left

			if (left >= 0) {
				ptr = (start * width) + left;
				for (i = start; i < end; i += 1) {
					node = nodes[ptr];
					if (node.value) {
						nlist.push([node.x, node.y]);
					}
					ptr += width;
				}
			}

			// right

			if (right < width) {
				ptr = (start * width) + right;
				for (i = start; i < end; i += 1) {
					node = nodes[ptr];
					if (node.value) {
						nlist.push([node.x, node.y]);
					}
					ptr += width;
				}
			}

			len = nlist.length;
			if (len) {
				if (len === 1) {
					return nlist[0];
				}
				min = width + height;
				for (i = 0; i < len; i += 1) {
					pos = nlist[i];
					cnt = _private._heuristic(x1, y1, pos[0], pos[1]);
					if (cnt < min) {
						min = cnt;
						j = i;
					}
				}
				return nlist[j];
			}

			level += 1;
		}

		return [x1, y1];
	}

	// Status line

	_private._statusOut = function (str) {
		_private._status.inputP.style.display = "none"; // hide input paragraph
		_private._keysActivate(); // turn on key events
		_private._status.statusNode.nodeValue = _private._status.text = str; // set status text
		_private._status.statusP.style.display = "block"; // show status paragraph
	}

	// _private._inputKeyDown ( event )
	// Input keydown handler

	_private._inputKeyDown = function (event) {
		var key, val, exec;

		key = event.which; // correct
		if (!key) {
			key = event.keyCode; // IE
		}
		if (key === PS.KEY_ENTER) {
			val = _private._status.input.value;
			exec = _private._status.exec;
			if (typeof exec === "function") {
				try {
					exec(val);
				} catch (err) {
					_private._errorCatch("PS.statusInput() function failed [" + err.message + "]", err);
				}
			}

			_private._status.input.removeEventListener("keydown", _private._inputKeyDown, false); // stop input handler
			_private._statusOut(_private._status.text);
			return _private._endEvent(event);
		}
		return true; // must return true
	}

	_private._statusIn = function (strP, exec) {
		var str;

		_private._status.statusP.style.display = "none"; // hide status line

		_private._status.label = str = strP; // prevent arg mutation
		if (str.length < 1) {
			str = ">"; // at least show a caret
		}
		_private._status.inputNode.nodeValue = str; // set input label text
		_private._status.exec = exec; // save exec
		_private._status.input.value = ""; // empty input box
		_private._keysDeactivate(); // turn off key events
		_private._status.input.addEventListener("keydown", _private._inputKeyDown, false); // start input handler
		_private._status.inputP.style.display = "block"; // show input line
		_private._status.input.focus();
	}

	//----------------------
	// ENGINE INITIALIZATION
	//----------------------

	// Return true if browser supports touch events

	_private._hasTouch = function () {
		// return Modernizr.touch;

		try {
			document.createEvent("TouchEvent");
			return true;
		} catch (e) {
			return false;
		}
	}

	// Detect platform and available features

	_private._systemDetect = function () {
		var ua, host, browser, os, version;

		ua = window.navigator.userAgent.toLowerCase();
		host = window.navigator.platform.toLowerCase();

		if (/firefox/.test(ua)) {
			browser = "Firefox";
			if (/fennec/.test(ua)) {
				browser += " Mobile";
			}
			version = /firefox\/[\.\d]+/.exec(ua)[0].split('/')[1];
		} else if (/chrome/.test(ua)) {
			browser = "Chrome";
			version = /chrome\/[\d\.]+/.exec(ua)[0].split('/')[1];
		} else if (/safari/.test(ua)) {
			browser = 'Safari';
			if ((/iphone/.test(ua)) || (/ipad/.test(ua)) || (/ipod/.test(ua))) {
				os = 'iOS';
			}
		} else if (/msie/.test(ua)) {
			browser = "Internet Explorer";
			if (/iemobile/.test(ua)) {
				browser += " Mobile";
			}
			version = /msie \d+[.]\d+/.exec(ua)[0].split(' ')[1];
		} else if (/trident/.test(ua)) // IE 11+ on Windows 8
		{
			browser = "Internet Explorer";
			version = /rv\:\d+[.]\d+/.exec(ua)[0].split(':')[1];
		} else if (/opera/.test(ua)) {
			browser = "Opera";
			if (/mini/.test(ua)) {
				browser += " Mini";
			} else if (/mobile/.test(ua)) {
				browser += " Mobile";
			}
		} else if (/android/.test(ua)) {
			browser = "Android";
			os = /android\s[\.\d]+/.exec(ua);
		}

		if (!version) {
			try {
				version = /version\/[\.\d]+/.exec(ua);
				if (version) {
					version = version[0].split('/')[1];
				} else {
					version = /opera\/[\.\d]+/.exec(ua)[0].split('/')[1];
				}
			} catch (err) {
				console.error("Problem detecting browser: " + err.message);
				version = "";
			}
		}

		if ((host === "win32") || (host === "win64")) {
			os = "Windows";
		} else if ((host === "macintel") || (host === "macppc")) {
			os = "Mac OS X ";
			os += /10[\.\_\d]+/.exec(ua)[0];
			if (/[\_]/.test(os)) {
				os = os.split('_').join('.');
			}
		}

		if (!os) {
			if (/linux/.test(host)) {
				os = "Linux";
			} else if (/windows/.test(ua)) {
				os = "Windows";
			}
		}

		_private._system.host.app = browser;
		if (version) {
			_private._system.host.version = version;
		}
		_private._system.host.os = os;

	}

	return my;
}(PERLENSPIEL || {}));
