// main.js
// The following comments are for JSLint

/*jslint nomen: true, white: true, vars: true */
/*global document, window, screen, console, Image, AQ */

var PS = ( function ()
{
	"use strict";

	var ps = {

		// Constants

		ALL : "PS.ALL",
		CURRENT : "PS.CURRENT",
		DONE : "PS.DONE",
		DEFAULT : "PS.DEFAULT",
		ERROR : "PS.ERROR",
		EMPTY : "PS.EMPTY",
		UNEQUAL : "PS.UNEQUAL",
		GRID : "PS.GRID",
		STATUS : "PS.STATUS",
		HTML5_AUDIO : "PS.HTML5_AUDIO",
		WEB_AUDIO : "PS.WEB_AUDIO",

		SPRITE_TOUCH : "PS.SPRITE_TOUCH",
		SPRITE_OVERLAP : "PS.SPRITE_OVERLAP",

		// Color constants

		COLOR_BLACK : 0x000000,
		COLOR_WHITE : 0xFFFFFF,
		COLOR_GRAY_LIGHT : 0xC0C0C0,
		COLOR_GRAY : 0x808080,
		COLOR_GRAY_DARK : 0x404040,
		COLOR_RED : 0xFF0000,
		COLOR_ORANGE : 0xFF8000,
		COLOR_YELLOW : 0xFFFF00,
		COLOR_GREEN : 0x00FF00,
		COLOR_BLUE : 0x0000FF,
		COLOR_INDIGO : 0x4000FF,
		COLOR_VIOLET : 0x8000FF,
		COLOR_MAGENTA : 0xFF00FF,
		COLOR_CYAN : 0x00FFFF,

		ALPHA_OPAQUE : 255,
		ALPHA_TRANSPARENT : 0,

		// Key constants

		KEY_ENTER : 13,
		KEY_TAB : 9,
		KEY_ESCAPE : 27,

		KEY_PAGE_UP : 1001, // 33
		KEY_PAGE_DOWN : 1002, // 34
		KEY_END : 1003, // 35
		KEY_HOME : 1004, // 36

		KEY_ARROW_LEFT : 1005, // 37
		KEY_ARROW_UP : 1006, // 38
		KEY_ARROW_RIGHT : 1007, // 39
		KEY_ARROW_DOWN : 1008, // 40

		KEY_INSERT : 1009, // 45
		KEY_DELETE : 1010, // 46

		KEY_PAD_0 : 96,
		KEY_PAD_1 : 97,
		KEY_PAD_2 : 98,
		KEY_PAD_3 : 99,
		KEY_PAD_4 : 100,
		KEY_PAD_5 : 101,
		KEY_PAD_6 : 102,
		KEY_PAD_7 : 103,
		KEY_PAD_8 : 104,
		KEY_PAD_9 : 105,
		KEY_F1 : 112,
		KEY_F2 : 113,
		KEY_F3 : 114,
		KEY_F4 : 115,
		KEY_F5 : 116,
		KEY_F6 : 117,
		KEY_F7 : 118,
		KEY_F8 : 119,
		KEY_F9 : 120,
		KEY_F10 : 121,

		// Input device constants

		WHEEL_FORWARD : "PS.WHEEL_FORWARD",
		WHEEL_BACKWARD : "PS.WHEEL_BACKWARD",

		_sys : {
			// CONSTANTS

			RSHIFT : 256 * 256, // red RGB shift
			GSHIFT : 256, // green RGB shift

			// RGB color string constants
			// Initialized at startup by PS._sys()

			RSTR : null, GBSTR : null, BASTR : null, ASTR : null,

			// All system defaults are kept in this object

			DEFAULTS : {

				// Grid defaults

				grid : {
					x : 8,
					y : 8,
					max : 32,
					plane : 0,
					color : {
						r : 255, g : 255, b : 255, a : 255,
						rgb : 0xFFFFFF,
						str : "rgba(255,255,255,1)"
					},
					ready : false
				},

				// Bead defaults

				bead : {
					dirty : true,
					active : true,
					visible : true,
					planes : null,
					color : {
						r : 255, g : 255, b : 255, a : 255,
						rgb : 0xFFFFFF,
						str : "rgba(255,255,255,1)"
					},
					radius : 0,
					scale : 100,
					data : 0,
					exec : null,

					// bead border

					border : {
						width : 1, equal : true,
						top : 1, left : 1, bottom : 1, right : 1,
						color : {
							r : 128, g : 128, b : 128, a : 255,
							rgb : 0x808080,
							str : "rgba(128,128,128,1)"
						}
					},

					// bead glyph

					glyph : {
						str : "",
						code : 0,
						scale : 100,
						size : 0,
						x : 0, y : 0,
						font : null,
						color : {
							r : 0, g : 0, b : 0, a : 255,
							rgb : 0x000000,
							str : "rgba(0,0,0,1)"
						}
					}
				},

				// audio defaults

				audio : {
					volume : 0.5,
					max_volume : 1.0,
					path : "http://users.wpi.edu/~bmoriarty/ps/audio/", // default audio path, case sensitive!
					loop : false,
					error_sound : "fx_uhoh"
				}
			},

			// _sys.gestalt
			// Contains data on app/platform

			gestalt : {
				engine : "Perlenspiel",
				major : 3,
				minor : 1,
				revision : 1,
				host : {
					app : "Unknown App",
					version : "?",
					os : "Unknown OS" },
				inputs : {
					touch : false
				}
			},

			// VARIABLES

			clockActive : false, // true if clock is running

			main : null, // main DOM element
			grid : null, // master grid object
			beads : null, // master list of bead objects

			net : null, // network object

		}
	};

	return ps;
} () );
