// Perlenspiel Constants Module

// Includes:
// + Public constants
// + Private constants

var PerlenspielConstants = function (my) {

	////////////////////////////////////////
	// Module initializer
	
	my._onInit(function(spec) {
		// Copy perlenspiel constants into global object
		my.provideConstants(PS);
	});

	//------------------
	// PUBLIC CONSTANTS
	//------------------

	// Places the perlenspiel constants into an object
	my.provideConstants = function (obj) {
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

	my._setNamespace = function(namespace) {
		my._NAMESPACE = namespace;
		my._OUTER_ID = my._NAMESPACE + "-" + my._OUTER_CLASS;
		my._MAIN_ID = my._NAMESPACE + "-" + my._MAIN_CLASS;
		my._INIT_ID = "init";
		my._DEBUG_ID = my._NAMESPACE + "-" + my._DEBUG_CLASS;
		my._STATUS_P_ID = my._NAMESPACE + "-" + my._STATUS_P_CLASS;
		my._INPUT_P_ID = my._NAMESPACE + "-" + my._INPUT_P_CLASS;
		my._INPUT_LABEL_ID = my._NAMESPACE + "-" + my._INPUT_LABEL_CLASS;
		my._INPUT_SPAN_ID = my._NAMESPACE + "-" + my._INPUT_SPAN_CLASS;
		my._INPUT_BOX_ID = my._NAMESPACE + "-" + my._INPUT_BOX_CLASS;
		my._GRID_ID = my._NAMESPACE + "-" + my._GRID_CLASS;
		my._FOOTER_ID = my._NAMESPACE + "-" + my._FOOTER_CLASS;
		my._MONITOR_ID = my._NAMESPACE + "-" + my._MONITOR_CLASS;
	}

	//------------------
	// PRIVATE CONSTANTS
	//------------------

	// DOM element ids

	my._OUTER_CLASS = "outer";
	my._MAIN_CLASS = "main";
	my._DEBUG_CLASS = "debug";
	my._STATUS_P_CLASS = "stsp";
	my._INPUT_P_CLASS = "inp";
	my._INPUT_LABEL_CLASS = "inlabel";
	my._INPUT_SPAN_CLASS = "inspan";
	my._INPUT_BOX_CLASS = "inbox";
	my._GRID_CLASS = "grid";
	my._FOOTER_CLASS = "footer";
	my._MONITOR_CLASS = "monitor";

	my._LOGIN_ID = "login";
	my._LOGIN_EMAIL_ID = "login_em";
	my._LOGIN_PW1_ID = "login_pw1";
	my._LOGIN_PW2_ID = "login_pw2";
	my._LOGIN_BUT_ID = "login_but";
	my._LOGIN_SIGNUP_ID = "login_su";
	my._LOGIN_RECOVER_ID = "login_re";

	// Element prefixes

	my._IMAGE_PREFIX = "image_";
	my._SPRITE_PREFIX = "sprite_";
	my._PATHMAP_PREFIX = "pathmap_";
	my._TIMER_PREFIX = "timer_";

	// Misc constants

	my._CLIENT_SIZE = 512; // client size in pixels
	my._ALPHOID = 1.0 / 255; // alpha step constant
	my._RSHIFT = 256 * 256;
	my._GSHIFT = 256;
	my._MAX_BEADS = 1024; // 32 x 32 maximum bead count
	my._EMPTY = {}; // a generic empty object
	my._DEFAULT_KEY_DELAY = 6; // key repeat rate (1/10 sec)
	my._KEY_SHIFT = 16; // shift keycode
	my._KEY_CTRL = 17; // ctrl keycode
	my._CLEAR = -1; // flag for not touching or not over a bead
	my._FADER_FPS = 4; // do fader queue every 1/15 of a second
	my._DIAGONAL_COST = 1.4142; // square root of 2; for pathfinder
	my._LABEL_MAX = 16; // maximum input label length

	// Names of instrument files

	my._PIANO_FILES = [
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

	my._HCHORD_FILES = [
		"a2", "bb2", "b2",
		"c3", "db3", "d3", "eb3", "e3", "f3", "gb3", "g3", "ab3", "a3", "bb3", "b3",
		"c4", "db4", "d4", "eb4", "e4", "f4", "gb4", "g4", "ab4", "a4", "bb4", "b4",
		"c5", "db5", "d5", "eb5", "e5", "f5", "gb5", "g5", "ab5", "a5", "bb5", "b5",
		"c6", "db6", "d6", "eb6", "e6", "f6", "gb6", "g6", "ab6", "a6", "bb6", "b6",
		"c7", "db7", "d7", "eb7", "e7", "f7"
	];

	my._XYLO_FILES = [
		"a4", "bb4", "b4",
		"c5", "db5", "d5", "eb5", "e5", "f5", "gb5", "g5", "ab5", "a5", "bb5", "b5",
		"c6", "db6", "d6", "eb6", "e6", "f6", "gb6", "g6", "ab6", "a6", "bb6", "b6",
		"c7", "db7", "d7", "eb7", "e7", "f7", "gb7", "g7", "ab7", "a7", "bb7", "b7"
	];

	// All system defaults kept in this object
	// On startup, they are copied into [_DEFAULTS] for referencing
	// This will (someday) permit defaults to be overwritten by user

	my._DEFAULTS = {

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

	return my;
};

// Register with global PERLENSPIEL manager
PERLENSPIEL.RegisterModule(PerlenspielConstants);
