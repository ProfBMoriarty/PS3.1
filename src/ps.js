// ps3.1.6.js for Perlenspiel 3.1
// Remember to update version number in _system!

/*
 Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
 Perlenspiel is Copyright © 2009-14 Worcester Polytechnic Institute.
 This file is part of Perlenspiel.

 Perlenspiel is free software: you can redistribute it and/or modify
 it under the terms of the GNU Lesser General Public License as published
 by the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Perlenspiel is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU Lesser General Public License for more details.

 You may have received a copy of the GNU Lesser General Public License
 along with Perlenspiel. If not, see <http://www.gnu.org/licenses/>.
 */

// The following comments are for JSLint

/*jslint nomen: true, white: true, vars: true */
/*global document, window, screen, console, Image, AQ, PIXI */

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

	// Alias for public state
	var PSInterface = my;

	// Set engine options

	PSInterface.setOptions = function (options) {
		// Options
		_private._options = options || {};
		_private._NAMESPACE = _private._options.namespace || PS.DEFAULT_NAMESPACE;

		// Instance-specific state
		_private._lastTick = 0;

		// Copy the Perlenspiel constants into this object
		_private.ProvideConstants(this);

		_private._optionsSet = true;
	}

	// Start the engine

	PSInterface.start = function ( ) {

		// Set default options if they weren't already set
		if ( !_private._optionsSet ) {
			PSInterface.setOptions({});
		}

		_private._sys();
	}

	// Shut down the engine

	PSInterface.shutdown = function () {
		console.info("Deactivating " + _private._grid.canvas.id);
		_private._clockActive = false;
		_private._gridDeactivate();
	}

	// Engine initializer

	_private._sys = function (options) {
		var fn, i, outer, debug, sp, snode, ip, inode, span, input, grid, footer, monitor, ctx, cnt, bead, aq, result, str;

		fn = "[PS.sys] ";

		// Precalculate color string tables

		_private._RSTR = [];
		_private._RSTR.length = 256;

		_private._GBSTR = [];
		_private._GBSTR.length = 256;

		_private._BASTR = [];
		_private._BASTR.length = 256;

		_private._ASTR = [];
		_private._ASTR.length = 256;

		for (i = 0; i < 256; i += 1) {
			_private._RSTR[i] = "rgba(" + i + ",";
			_private._GBSTR[i] = i + ",";
			_private._BASTR[i] = i + ",1)";
			cnt = Math.floor((_private._ALPHOID * i) * 1000) / 1000;
			_private._ASTR[i] = cnt + ")";
		}

		_private._systemDetect();

		// calc device scaling

		_private._deviceScaling = screen.width / document.documentElement.clientWidth;

		// detect touch events

		_private._touchScreen = _private._hasTouch();
		_private._system.inputs.touch = _private._touchScreen;

		// Set up DOM elements

		document.body.id = "body";
		// set browser background (if not in multispiel mode)
		if (_private._NAMESPACE === PSInterface.DEFAULT_NAMESPACE)
			document.body.style.backgroundColor = _private._DEFAULTS.grid.color.str;

		// Remove font loading div if it exists

		_private._init = document.getElementById(_private._INIT_ID);
		if (_private._init) {
			_private._init.parentNode.removeChild(_private._init);
		}

		// Create outer/main divs

		outer = document.getElementById(_private._NAMESPACE);
		if (!outer) {
			outer = document.createElement("div");
			document.body.appendChild(outer);
			if (!outer)
				return console.error("No outer div!");
		}
		outer.id = _private._OUTER_ID;
		outer.tabindex = 12;
		outer.className = _private._OUTER_CLASS;
		outer.style.backgroundColor = _private._DEFAULTS.grid.color.str;

		_private._main = document.createElement("div");
		if (!_private._main)
			return console.error("No main div!");
		_private._main.id = _private._MAIN_ID;
		_private._main.className = _private._MAIN_CLASS;
		outer.appendChild(_private._main);

		// save offset coordinates
		// Create status line paragraph

		sp = document.createElement("p");
		sp.id = _private._STATUS_P_ID; // use id for styling
		sp.className = _private._STATUS_P_CLASS; // use class for styling
		sp.style.whiteSpace = "nowrap"; // limits to one line
		sp.style.display = "block"; // initially visible
		snode = document.createTextNode(".");
		sp.appendChild(snode);
		_private._main.appendChild(sp);

		// Create input box paragraph, label and input box

		ip = document.createElement("p"); // paragraph for input box
		ip.id = _private._INPUT_P_ID; // use id for styling
		ip.className = _private._INPUT_P_CLASS; // use id for styling
		ip.style.display = "none"; // initially hidden

		span = document.createElement("span"); // span for label
		span.id = _private._INPUT_LABEL_ID; // use id for styling
		span.className = _private._INPUT_LABEL_CLASS; // use class for styling
		inode = document.createTextNode(""); // textNode for label
		span.appendChild(inode); // add node to span
		ip.appendChild(span); // add span to paragraph

		span = document.createElement("span"); // span for input box
		span.id = _private._INPUT_SPAN_ID; // use id for styling
		span.className = _private._INPUT_SPAN_CLASS; // use class for styling
		input = document.createElement("input"); // actual input box
		input.id = _private._INPUT_BOX_ID; // use id for styling
		input.className = _private._INPUT_BOX_CLASS; // use class for styling
		input.type = "text";
		input.tabindex = 0;
		input.wrap = "soft";
		span.appendChild(input); // add box to span
		ip.appendChild(span); // add span to paragraph
		_private._main.appendChild(ip); // add paragraph to main

		// init status line

		_private._status = {
			statusP: sp,
			statusNode: snode,
			inputP: ip,
			inputNode: inode,
			input: input,
			fader: _private._newFader(_private._STATUS_P_ID, _private._statusRGB, null)
		};

		_private._copy(_private._DEFAULTS.status, _private._status); // copy default properties
		_private._statusOut("Perlenspiel 3.1");

		// Create grid canvas

		grid = document.createElement("canvas");
		if (!grid) {
			window.alert(fn + "HTML5 canvas not supported.");
			return;
		}
		grid.id = _private._GRID_ID;
		grid.className = _private._GRID_CLASS;
		grid.width = _private._CLIENT_SIZE;
		grid.style.backgroundColor = _private._DEFAULTS.grid.color.str;
		grid.style.boxShadow = "none";
		_private._overGrid = false;
		_private._resetCursor();
		_private._main.appendChild(grid);

		/*
		// Create grid PIXI stage/renderer

		var stage = new PIXI.Stage( _private._DEFAULTS.grid.color.rgb );
		var renderer = PIXI.autoDetectRenderer( _private._CLIENT_SIZE, _private._CLIENT_SIZE );
		renderer.view.id = _private._GRID_ID;
		renderer.style.boxShadow = "none";
		_private._overGrid = false;
		_private._resetCursor();
		_private._main.appendChild( renderer.view );
		*/

		// Footer, append to main

		footer = document.createElement("p");
		if (!footer)
			return console.error("No footer p!");
		footer.id = _private._FOOTER_ID;
		footer.className = _private._FOOTER_CLASS;
		footer.style.opacity = "1.0";
		footer.innerHTML = "Loading Perlenspiel";
		_private._main.appendChild(footer);
		_private._footer = footer;

		// Debug div

		debug = document.createElement("div");
		if (!debug)
			return console.error("No debug div!");
		debug.id = _private._DEBUG_ID;
		debug.className = _private._DEBUG_CLASS;
		_private._main.appendChild(debug);

		// Monitor, append to debug

		monitor = document.createElement("textarea");
		if (!monitor)
			return console.error("No monitor textarea!");
		monitor.id = _private._MONITOR_ID;
		monitor.className = _private._MONITOR_CLASS;
		monitor.rows = 8;
		monitor.wrap = "soft";
		monitor.readonly = "readonly";
		monitor.onfocus = function () {
			_private._debugFocus = true;
		};
		monitor.onblur = function () {
			_private._debugFocus = false;
		};
		debug.appendChild(monitor);

		_private._debugging = false;
		_private._debugFocus = false;

		// Init keypress variables and arrays

		_private._keysActive = false;
		_private._pressed = [];
		_private._transKeys = [];
		_private._shiftedKeys = [];
		_private._unshiftedKeys = [];

		for (i = 0; i < 256; i += 1) {
			_private._pressed[i] = 0;
			_private._transKeys[i] = i;
			_private._shiftedKeys[i] = i;
			_private._unshiftedKeys[i] = i;
		}

		_private._holding = [];
		_private._holdShift = false;
		_private._holdCtrl = false;

		_private._keyRepeat = true;
		_private._keyDelayRate = _private._DEFAULT_KEY_DELAY;
		_private._keyInitRate = _private._DEFAULT_KEY_DELAY * 5;

		// Modify _private._transKeys for weird translations

		_private._transKeys[33] = PS.KEY_PAGE_UP;
		_private._transKeys[34] = PS.KEY_PAGE_DOWN;
		_private._transKeys[35] = PS.KEY_END;
		_private._transKeys[36] = PS.KEY_HOME;
		_private._transKeys[37] = PS.KEY_ARROW_LEFT;
		_private._transKeys[38] = PS.KEY_ARROW_UP;
		_private._transKeys[39] = PS.KEY_ARROW_RIGHT;
		_private._transKeys[40] = PS.KEY_ARROW_DOWN;
		_private._transKeys[45] = PS.KEY_INSERT;
		_private._transKeys[46] = PS.KEY_DELETE;
		_private._transKeys[188] = 44; // ,
		_private._transKeys[190] = 46; // .
		_private._transKeys[191] = 47; // /
		_private._transKeys[192] = 96; // `
		_private._transKeys[219] = 91; // [
		_private._transKeys[220] = 92; // \
		_private._transKeys[221] = 93; // ]
		_private._transKeys[222] = 39; // '

		// Modify shiftedKeys for translation

		_private._shiftedKeys[96] = 126; // ` to ~
		_private._shiftedKeys[49] = 33; // 1 to !
		_private._shiftedKeys[50] = 64; // 2 to @
		_private._shiftedKeys[51] = 35; // 3 to #
		_private._shiftedKeys[52] = 36; // 4 to $
		_private._shiftedKeys[53] = 37; // 5 to %
		_private._shiftedKeys[54] = 94; // 6 to ^
		_private._shiftedKeys[55] = 38; // 7 to &
		_private._shiftedKeys[56] = 42; // 8 to *
		_private._shiftedKeys[57] = 40; // 9 to (
		_private._shiftedKeys[48] = 41; // 0 to )
		_private._shiftedKeys[45] = 95; // - to _private._
		_private._shiftedKeys[61] = 43; // = to +
		_private._shiftedKeys[91] = 123; // [ to {
		_private._shiftedKeys[93] = 125; // ] to }
		_private._shiftedKeys[92] = 124; // \ to |
		_private._shiftedKeys[59] = 58; // ; to :
		_private._shiftedKeys[39] = 34; // ' to "
		_private._shiftedKeys[44] = 60; // , to <
		_private._shiftedKeys[46] = 62; // . to >
		_private._shiftedKeys[47] = 63; // / to ?

		// Modify _private._unshiftedKeys for  translations

		for (i = 65; i < 91; i += 1) // convert upper-case alpha to lower
		{
			_private._unshiftedKeys[i] = i + 32;
		}

		_private._unshiftedKeys[126] = 96; // ` to ~
		_private._unshiftedKeys[33] = 49; // 1 to !
		_private._unshiftedKeys[64] = 50; // 2 to @
		_private._unshiftedKeys[35] = 51; // 3 to #
		_private._unshiftedKeys[36] = 52; // 4 to $
		_private._unshiftedKeys[37] = 53; // 5 to %
		_private._unshiftedKeys[94] = 54; // 6 to ^
		_private._unshiftedKeys[38] = 55; // 7 to &
		_private._unshiftedKeys[42] = 56; // 8 to *
		_private._unshiftedKeys[40] = 57; // 9 to (
		_private._unshiftedKeys[41] = 48; // 0 to )
		_private._unshiftedKeys[95] = 45; // - to _private._
		_private._unshiftedKeys[43] = 51; // = to +
		_private._unshiftedKeys[123] = 91; // [ to {
		_private._unshiftedKeys[125] = 93; // ] to }
		_private._unshiftedKeys[124] = 92; // \ to |
		_private._unshiftedKeys[58] = 59; // ; to :
		_private._unshiftedKeys[34] = 39; // ' to "
		_private._unshiftedKeys[60] = 44; // , to <
		_private._unshiftedKeys[62] = 46; // . to >
		_private._unshiftedKeys[63] = 47; // / to ?

		// clear keypress record if window loses focus

		window.onblur = _private._keyReset();

		ctx = grid.getContext("2d");

		// Add fillRoundedRect method to canvas

		if (!ctx.constructor.prototype.fillRoundedRect) {
			ctx.constructor.prototype.fillRoundedRect = function (xx, yy, ww, hh, rad, fill, stroke) {
				if (rad === undefined) {
					rad = 5;
				}

				this.beginPath();

				// Must draw counterclockwise for Opera!
				// Fix by Mark Diehr

				if (_private._system.host.app === "Opera") {
					this.moveTo(xx + ww - rad, yy);
					this.arcTo(xx + rad, yy, xx, yy + rad, rad);
					this.arcTo(xx, yy + hh - rad, xx + rad, yy + hh, rad);
					this.arcTo(xx + ww - rad, yy + hh, xx + ww, yy + hh - rad, rad);
					this.arcTo(xx + ww, yy + rad, xx + ww - rad, yy, rad);
				} else {
					this.moveTo(xx + rad, yy);
					this.arcTo(xx + ww, yy, xx + ww, yy + hh, rad);
					this.arcTo(xx + ww, yy + hh, xx, yy + hh, rad);
					this.arcTo(xx, yy + hh, xx, yy, rad);
					this.arcTo(xx, yy, xx + ww, yy, rad);
				}

				this.closePath();

				if (stroke) {
					this.stroke();
				}

				if (fill || (fill === undefined)) {
					this.fill();
				}
			};
		}

		// Init grid object

		_private._grid = {
			canvas: grid,
			context: ctx,
			fader: _private._newFader(_private._GRID_ID, _private._gridRGB, _private._gridRGBEnd)
		};

		// copy default properties

		_private._copy(_private._DEFAULTS.grid, _private._grid);

		// Calculate canvas padding for mouse offset (Mark Diehr)

		var canvasStyle = window.getComputedStyle(_private._grid.canvas, null);
		_private._grid.padLeft = parseInt(canvasStyle.getPropertyValue('padding-top').replace("px", ""), 10);
		_private._grid.padRight = parseInt(canvasStyle.getPropertyValue('padding-left').replace("px", ""), 10);

		// Set up master 32 x 32 bead array

		_private._beads = [];
		_private._beads.length = cnt = _private._MAX_BEADS;
		for (i = 0; i < cnt; i += 1) {
			// init bead table

			bead = {
				index: i,
				fader: _private._newFader(i, _private._beadRGBA, null),
				borderFader: _private._newFader(i, _private._borderRGBA, null),
				glyphFader: _private._newFader(i, _private._glyphRGBA, null)
			};

			_private._resetBead(bead);

			_private._beads[i] = bead;
		}

		// Init sprite engine

		_private._sprites = [];
		_private._spriteCnt = 0;

		// Init pathfinder engine

		_private._pathmaps = [];
		_private._pathmapCnt = 0;

		// init audio system if not running iOS

		aq = null;
		if (_private._system.host.os !== "iOS") {
			aq = AQ.init({
				defaultPath: _private._DEFAULTS.audio.path,
				defaultFileTypes: ["ogg", "mp3", "wav"],
				onAlert: PSInterface.debug,
				stack: true,
				forceHTML5: true // never use Web Audio; sigh
			});
			if ((aq === PS.ERROR) || (aq.status === AQ.ERROR)) {
				return;
			}

			_private._system.audio = aq; // copy audio specs into system

			// load and lock error sound

			_private._errorSound = null;
			result = PSInterface.audioLoad(_private._DEFAULTS.audio.error_sound, {
				path: _private._DEFAULTS.audio.path,
				lock: true
			});
			if (result === PS.ERROR) {
				_private._warning("Error sound '" + _private._DEFAULTS.audio.error_sound + "' not loaded");
			} else {
				_private._errorSound = _private._DEFAULTS.audio.error_sound;
			}
		}

		// Create offscreen canvas for image manipulation

		_private._imageCanvas = document.createElement("canvas");
		ctx = _private._imageCanvas.getContext("2d");
		ctx.imageSmoothingEnabled = false;
		ctx.mozImageSmoothingEnabled = false;
		ctx.webkitImageSmoothingEnabled = false;

		// Init image loading list

		_private._imageList = [];
		_private._imageCnt = 0;

		// Make sure all required user functions exist

		str = "() event function undefined";

		if (typeof PSInterface.init !== "function") {
			PSInterface.init = null;
			_private._warning("PS.init" + str);
		}

		if (typeof PSInterface.touch !== "function") {
			PSInterface.touch = null;
			_private._warning("PS.touch" + str);
		}

		if (typeof PSInterface.release !== "function") {
			PSInterface.release = null;
			_private._warning("PS.release" + str);
		}

		if (typeof PSInterface.enter !== "function") {
			PSInterface.enter = null;
			_private._warning("PS.enter" + str);
		}

		if (typeof PSInterface.exit !== "function") {
			PSInterface.exit = null;
			_private._warning("PS.exit()" + str);
		}

		if (typeof PSInterface.exitGrid !== "function") {
			PSInterface.exitGrid = null;
			_private._warning("PS.exitGrid" + str);
		}

		if (typeof PSInterface.keyDown !== "function") {
			PSInterface.keyDown = null;
			_private._warning("PS.keyDown" + str);
		}

		if (typeof PSInterface.keyUp !== "function") {
			PSInterface.keyUp = null;
			_private._warning("PS.keyUp" + str);
		}

		if (typeof PSInterface.input !== "function") {
			PSInterface.input = null;
			_private._warning("PS.input" + str);
		}

		// set up footer

		str = "PS " + _private._system.major + "." + _private._system.minor + "." + _private._system.revision + " | ";
		if (aq) // not set for iOS
		{
			str += (aq.engine + " " + aq.major + "." + aq.minor + "." + aq.revision + " | ");
		}
		str += _private._system.host.os + " " + _private._system.host.app + " " + _private._system.host.version;
		if (_private._touchScreen) {
			str += (" | Touch ");
		}

		footer.innerHTML = str;

		// Set up default grid & grid color

		_private._gridSize(_private._DEFAULTS.grid.x, _private._DEFAULTS.grid.y);

		//	Init fader and timer engines, start the global clock

		_private._initFaders();
		_private._initTimers();

		_private._clockActive = true;
		_private._clock();

		// Init all event listeners

		_private._gridActivate();

		_private._footerTimer = PSInterface.timerStart(6, _private._footerFade);

		if (PSInterface.init) {
			// Call user initializer

			try {
				PSInterface.init(_private._system, _private._EMPTY);
				_private._gridDraw();
			} catch (err) {
				_private._errorCatch("PS.init() failed [" + err.message + "]", err);
			}
		}
	}

	_private._clock = function () {
		if (_private._clockActive) {
			window.requestAnimationFrame(_private._clock);
			_private._tick();
		}
	}

	//---------------
	// GRID FUNCTIONS
	//---------------

	// PS.gridSize(x, y)
	// Sets x/y dimensions of grid
	// Returns object with .width and .height properties, or PS.ERROR

	PSInterface.gridSize = function (xP, yP) {
		var fn, x, y, max;

		fn = "[PS.gridSize] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 0, 2))
			return PS.ERROR;

		// prevent arg mutation

		x = xP;
		y = yP;

		max = _private._DEFAULTS.grid.max;

		// Check x dimension

		if (x === PS.DEFAULT) {
			x = _private._DEFAULTS.grid.x;
		} else if (x === PS.CURRENT) {
			x = _private._grid.x;
		} else if (_private._typeOf(x) === "number") {
			x = Math.floor(x);
			if (x < 1) {
				x = 1;
			} else if (x > max) {
				x = max;
			}
		} else {
			return _private._error(fn + "x argument invalid");
		}

		// Check y dimension

		if (y === PS.DEFAULT) {
			y = _private._DEFAULTS.grid.y;
		} else if (y === PS.CURRENT) {
			y = _private._grid.y;
		} else if (_private._typeOf(y) === "number") {
			y = Math.floor(y);
			if (y < 1) {
				y = 1;
			} else if (y > max) {
				y = max;
			}
		} else {
			return _private._error(fn + "y argument invalid");
		}

		_private._gridSize(x, y);

		return {
			width: _private._grid.x,
			height: _private._grid.y
		};
	}

	// PS.gridPlane ( p )
	// Sets current color plane of grid
	// Returns plane or PS.ERROR on error

	PSInterface.gridPlane = function (planeP) {
		var fn, plane, type;

		fn = "[PS.gridPlane] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 0, 1))
			return PS.ERROR;

		plane = planeP; // avoid direct mutation of argument

		type = _private._typeOf(plane);
		if ((type !== "undefined") && (plane !== PS.CURRENT)) {
			if (plane === PS.DEFAULT) {
				plane = 0;
			} else if (type === "number") {
				plane = Math.floor(plane);
				if (plane < 1) {
					plane = 0;
				}
			} else {
				return _private._error(fn + "plane argument invalid");
			}

			_private._grid.plane = plane;
		}

		return _private._grid.plane;
	}

	// PS.gridColor( color )
	// Sets color of grid
	// [p1/p2/p3] is a PS3 color paramater
	// Returns rgb or PS.ERROR

	PSInterface.gridColor = function (p1, p2, p3) {
		var fn, colors;

		fn = "[PS.gridColor] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 0, 3) || arguments.length == 2)
			return PS.ERROR;

		colors = _private._decodeColors(fn, p1, p2, p3);
		if (colors === PS.ERROR) {
			return PS.ERROR;
		}

		return _private._gridColor(colors);
	}

	// PS.gridFade( rate, options )
	// Sets fade rate/options of grid
	// Returns fader settings or PS.ERROR

	PSInterface.gridFade = function (rate, optionsP) {
		var fn, fader, color, orate, nrate, options, type, val;

		fn = "[PS.gridFade] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 0, 2))
			return PS.ERROR;

		color = _private._grid.color;
		fader = _private._grid.fader;
		orate = fader.rate;

		type = _private._typeOf(rate);
		if ((type === "undefined") || (rate === PS.CURRENT)) {
			nrate = orate;
		} else if (rate === PS.DEFAULT) {
			nrate = _private._DEFAULTS.fader.rate;
		} else if (type === "number") {
			nrate = Math.floor(rate);
			if (nrate < 0) {
				nrate = 0;
			}
		} else {
			return _private._error(fn + "rate argument invalid");
		}

		options = _private._validFadeOptions(fn, optionsP);
		if (options === PS.ERROR) {
			return PS.ERROR;
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

		return {
			rate: fader.rate,
			rgb: fader.rgb,
			onStep: fader.onStep,
			onEnd: fader.onEnd,
			params: fader.params
		};
	}

	// PS.gridShadow
	// Activates/deactivates grid shadow and sets its color
	// show = boolean, PS.CURRENT or PS.DEFAULT
	// [p1/p2/p3] = PS3 color parameter
	// Returns rgb or PS.ERROR

	PSInterface.gridShadow = function (showP, p1, p2, p3) {
		var fn, show, colors;

		fn = "[PS.gridShadow] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 0, 4))
			return PS.ERROR;

		show = showP; // prevent arg mutation
		if ((show !== true) && (show !== false) && (show !== PS.CURRENT)) {
			if ((show === null) || (show === PS.DEFAULT)) {
				show = false;
			} else if (_private._typeOf(show) === "number") {
				show = (show !== 0);
			} else {
				return _private._error(fn + "First argument invalid");
			}
		}

		colors = _private._decodeColors(fn, p1, p2, p3);
		if (colors === PS.ERROR) {
			return PS.ERROR;
		}

		return _private._gridShadow(show, colors);
	}

	//---------------
	// BEAD FUNCTIONS
	//---------------

	// PS.color ( x, y, color )
	// Change/inspect bead color on current grid plane

	PSInterface.color = function (x, y, p1, p2, p3) {
		var fn, args, colors;

		fn = "[PS.color] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 2, 5))
			return PS.ERROR;

		colors = _private._decodeColors(fn, p1, p2, p3);
		if (colors === PS.ERROR) {
			return PS.ERROR;
		}

		return _private._beadExec(fn, _private._color, x, y, colors);
	}

	// PS.alpha( x, y, a )

	PSInterface.alpha = function (x, y, alpha_p) {
		var fn, args, alpha, type;

		fn = "[PS.alpha] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 2, 3))
			return PS.ERROR;
		alpha = alpha_p; // prevent direct mutation of args

		if (alpha !== PS.CURRENT) {
			type = _private._typeOf(alpha);
			if (type === "undefined") {
				alpha = PS.CURRENT;
			} else if (type === "number") {
				alpha = Math.floor(alpha);
				if (alpha < 0) {
					alpha = 0;
				} else if (alpha > 255) {
					alpha = 255;
				}
			} else if (alpha === PS.DEFAULT) {
				alpha = _private._DEFAULTS.bead.color.a;
			} else {
				return _private._error(fn + "alpha argument invalid");
			}
		}

		return _private._beadExec(fn, _private._alpha, x, y, alpha);
	}

	// PS.fade( x, y, rate, options )
	// Sets fade rate/options of bead
	// Returns fader settings or PS.ERROR

	PSInterface.fade = function (x, y, rate_p, options_p) {
		var fn, args, rate, type, options;

		fn = "[PS.fade] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 2, 4))
			return PS.ERROR;

		rate = rate_p; // prevent arg mutation
		if ((rate !== PS.CURRENT) && (rate !== PS.DEFAULT)) {
			type = _private._typeOf(rate);
			if (type === "undefined") {
				rate = PS.CURRENT;
			} else if (type === "number") {
				rate = Math.floor(rate);
				if (rate < 0) {
					rate = 0;
				}
			} else {
				return _private._error(fn + "rate argument invalid");
			}
		}

		options = _private._validFadeOptions(fn, options_p);
		if (options === PS.ERROR) {
			return PS.ERROR;
		}

		return _private._beadExec(fn, _private._fade, x, y, rate, options);
	}

	// PS.scale ( x, y, scale )
	// Expects a number between 50 and 100

	PSInterface.scale = function (x, y, scale_p) {
		var fn, args, scale, type;

		fn = "[PS.scale] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 2, 3))
			return PS.ERROR;

		// prevent arg mutation

		scale = scale_p;

		if (scale !== PS.CURRENT) {
			type = _private._typeOf(scale);
			if (type === "undefined") {
				scale = PS.CURRENT;
			} else if (scale === PS.DEFAULT) {
				scale = 100;
			} else if (type === "number") {
				scale = Math.floor(scale);
				if (scale < 50) {
					scale = 50;
				} else if (scale > 100) {
					scale = 100;
				}
			} else {
				return _private._error(fn + "scale parameter invalid");
			}
		}

		return _private._beadExec(fn, _private._scale, x, y, scale);
	}

	// PS.radius( x, y, radius )
	// Expects a radius between 0 and 50

	PSInterface.radius = function (x, y, radius_p) {
		var fn, args, radius, type;

		fn = "[PS.radius] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 2, 3))
			return PS.ERROR;

		// prevent arg mutation

		radius = radius_p;

		if (radius !== PS.CURRENT) {
			type = _private._typeOf(radius);
			if (type === "undefined") {
				radius = PS.CURRENT;
			} else if (radius === PS.DEFAULT) {
				radius = 0;
			} else if (type === "number") {
				radius = Math.floor(radius);
				if (radius < 0) {
					radius = 0;
				} else if (radius > 50) {
					radius = 50;
				}
			} else {
				return _private._error(fn + "radius parameter invalid");
			}
		}

		return _private._beadExec(fn, _private._radius, x, y, radius);
	}

	// PS.bgColor ( x, y, color )
	// Change/inspect bead background color

	PSInterface.bgColor = function (x, y, p1, p2, p3) {
		var fn, args, colors;

		fn = "[PS.bgColor] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 2, 5))
			return PS.ERROR;

		colors = _private._decodeColors(fn, p1, p2, p3);
		if (colors === PS.ERROR) {
			return PS.ERROR;
		}

		return _private._beadExec(fn, _private._bgColor, x, y, colors);
	}

	// PS.bgAlpha( x, y, a )

	PSInterface.bgAlpha = function (x, y, alpha_p) {
		var fn, args, alpha, type;

		fn = "[PS.bgAlpha] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 2, 3))
			return PS.ERROR;

		alpha = alpha_p; // prevent direct mutation of args
		if (alpha !== PS.CURRENT) {
			type = _private._typeOf(alpha);
			if (type === "undefined") {
				alpha = PS.CURRENT;
			} else if (type === "number") {
				alpha = Math.floor(alpha);
				if (alpha < 0) {
					alpha = 0;
				} else if (alpha > 255) {
					alpha = 255;
				}
			} else if (alpha === PS.DEFAULT) {
				alpha = _private._DEFAULTS.bead.bgColor.a;
			} else {
				return _private._error(fn + "alpha argument invalid");
			}
		}

		return _private._beadExec(fn, _private._bgAlpha, x, y, alpha);
	}

	// PS.data( x, y, data )

	PSInterface.data = function (x, y, data_p) {
		var fn, args, data;

		fn = "[PS.data] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 2, 3))
			return PS.ERROR;

		// Prevent arg mutation

		data = data_p;
		if (data === undefined) {
			data = PS.CURRENT;
		} else if (data === PS.DEFAULT) {
			data = null;
		}

		return _private._beadExec(fn, _private._data, x, y, data);
	}

	// PS.exec( x, y, exec )

	PSInterface.exec = function (x, y, exec_p) {
		var fn, args, exec, type;

		fn = "[PS.exec] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 2, 3))
			return PS.ERROR;

		exec = exec_p; // prevent arg mutation
		if (exec !== PS.CURRENT) {
			type = _private._typeOf(exec);
			if (type === "undefined") {
				exec = PS.CURRENT;
			} else if (exec === PS.DEFAULT) {
				exec = _private._DEFAULTS.bead.exec;
			} else if (type !== "function") {
				return _private._error(fn + "exec argument invalid");
			}
		}

		return _private._beadExec(fn, _private._exec, x, y, exec);
	}

	// PS.visible( x, y, show )

	PSInterface.visible = function (x, y, show_p) {
		var fn, args, show;

		fn = "[PS.visible] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 2, 3))
			return PS.ERROR;

		show = _private._isBoolean(show_p, PS.CURRENT, true, PS.CURRENT);
		if (show === PS.ERROR) {
			return _private._error(fn + "show argument invalid");
		}

		return _private._beadExec(fn, _private._visible, x, y, show);
	}

	// PS.active( x, y, active )

	PSInterface.active = function (x, y, active_p) {
		var fn, args, active;

		fn = "[PS.active] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 2, 3))
			return PS.ERROR;

		active = _private._isBoolean(active_p, PS.CURRENT, true, PS.CURRENT);
		if (active === PS.ERROR) {
			return _private._error(fn + "active argument invalid");
		}

		return _private._beadExec(fn, _private._active, x, y, active);
	}

	//----------------------
	// BEAD BORDER FUNCTIONS
	//----------------------

	// PS.border( x, y, width )
	// Accepts a width integer or an object with .top/.left/.bottom/.right properties

	PSInterface.border = function (x, y, width_p) {
		var fn, args, def, width, type, val;

		fn = "[PS.border] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 2, 3))
			return PS.ERROR;

		def = _private._DEFAULTS.bead.border;

		// check a number

		width = width_p; // prevent arg mutation
		if (width !== PS.CURRENT) {
			type = _private._typeOf(width);
			if (type === "undefined") {
				width = PS.CURRENT;
			} else if (width === PS.DEFAULT) {
				width = def.width;
			} else if (type === "number") {
				width = Math.floor(width);
				if (width < 0) {
					width = 0;
				}
			} else if (type === "object") {
				// Check the four edge properties

				// .top

				val = width.top;
				if (val !== PS.CURRENT) {
					type = _private._typeOf(val);
					if (type === "undefined") {
						width.top = PS.CURRENT;
					} else if (type === "number") {
						val = Math.floor(val);
						if (val < 0) {
							val = 0;
						}
						width.top = val;
					} else if (val === PS.DEFAULT) {
						width.top = def.top;
					} else {
						return _private._error(fn + ".top property invalid");
					}
				}

				// .left

				val = width.left;
				if (val !== PS.CURRENT) {
					type = _private._typeOf(val);
					if (type === "undefined") {
						width.left = PS.CURRENT;
					} else if (type === "number") {
						val = Math.floor(val);
						if (val < 0) {
							val = 0;
						}
						width.left = val;
					} else if (val === PS.DEFAULT) {
						width.left = def.left;
					} else {
						return _private._error(fn + ".left property invalid");
					}
				}

				// .bottom

				val = width.bottom;
				if (val !== PS.CURRENT) {
					type = _private._typeOf(val);
					if (type === "undefined") {
						width.bottom = PS.CURRENT;
					} else if (type === "number") {
						val = Math.floor(val);
						if (val < 0) {
							val = 0;
						}
						width.bottom = val;
					} else if (val === PS.DEFAULT) {
						width.bottom = def.bottom;
					} else {
						return _private._error(fn + ".bottom property invalid");
					}
				}

				// .right

				val = width.right;
				if (val !== PS.CURRENT) {
					type = _private._typeOf(val);
					if (type === "undefined") {
						width.right = PS.CURRENT;
					} else if (type === "number") {
						val = Math.floor(val);
						if (val < 0) {
							val = 0;
						}
						width.right = val;
					} else if (val === PS.DEFAULT) {
						width.right = def.right;
					} else {
						return _private._error(fn + ".right property invalid");
					}
				}
			} else {
				return _private._error(fn + "width argument invalid");
			}
		}

		return _private._beadExec(fn, _private._border, x, y, width);
	}

	// PS.borderColor( x, y, p1, p2, p3 )

	PSInterface.borderColor = function (x, y, p1, p2, p3) {
		var fn, colors;

		fn = "[PS.borderColor] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 2, 5))
			return PS.ERROR;

		colors = _private._decodeColors(fn, p1, p2, p3);
		if (colors === PS.ERROR) {
			return PS.ERROR;
		}

		return _private._beadExec(fn, _private._borderColor, x, y, colors);
	}

	// PS.borderAlpha( x, y, alpha )

	PSInterface.borderAlpha = function (x, y, alpha_p) {
		var fn, args, alpha, type;

		fn = "[PS.borderAlpha] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 2, 3))
			return PS.ERROR;

		alpha = alpha_p; // prevent arg mutation
		if (alpha !== PS.CURRENT) {
			type = _private._typeOf(alpha);
			if (type === "undefined") {
				alpha = PS.CURRENT;
			} else if (type === "number") {
				alpha = Math.floor(alpha);
				if (alpha < 0) {
					alpha = 0;
				} else if (alpha > 255) {
					alpha = 255;
				}
			} else if (alpha === PS.DEFAULT) {
				alpha = _private._DEFAULTS.bead.border.color.a;
			} else {
				return _private._error(fn + "alpha argument invalid");
			}
		}

		return _private._beadExec(fn, _private._borderAlpha, x, y, alpha);
	}

	// PS.borderFade( rate, options )
	// Sets fade rate/options of border
	// Returns fade settings or PS.ERROR

	PSInterface.borderFade = function (x, y, rate_p, options_p) {
		var fn, args, rate, type, options;

		fn = "[PS.borderFade] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 2, 4))
			return PS.ERROR;

		rate = rate_p; // prevent arg mutation
		if ((rate !== PS.CURRENT) && (rate !== PS.DEFAULT)) {
			type = _private._typeOf(rate);
			if (type === "undefined") {
				rate = PS.CURRENT;
			} else if (type === "number") {
				rate = Math.floor(rate);
				if (rate < 0) {
					rate = 0;
				}
			} else {
				return _private._error(fn + "rate argument not a number");
			}
		}

		options = _private._validFadeOptions(fn, options_p);
		if (options === PS.ERROR) {
			return PS.ERROR;
		}

		return _private._beadExec(fn, _private._borderFade, x, y, rate, options);
	}

	//---------------------
	// BEAD GLYPH FUNCTIONS
	//---------------------

	// Improved Unicode handling by Mark Diehr

	// PS.glyph( x, y, glyph )
	// [glyph] can be a Unicode number or a string

	PSInterface.glyph = function (x, y, glyph_p) {
		var fn, args, glyph, type;

		fn = "[PS.glyph] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 2, 3))
			return PS.ERROR;

		glyph = glyph_p; // prevent arg mutation
		if (glyph !== PS.CURRENT) {
			type = _private._typeOf(glyph);
			if (type === "undefined") {
				glyph = PS.CURRENT;
			} else if (glyph === PS.DEFAULT) {
				glyph = 0;
			} else if (type === "string") {
				if (glyph.length > 0) {
					glyph = glyph.charCodeAt(0); // use only first character
				} else {
					glyph = 0;
				}
			} else if (type === "number") {
				glyph = Math.floor(glyph);
				if (glyph < 1) {
					glyph = 0;
				}
			} else {
				return _private._error(fn + "glyph argument invalid");
			}
		}

		return _private._beadExec(fn, _private._glyph, x, y, glyph);
	}

	// PS.glyphColor( x, y, p1, p2, p3 )

	PSInterface.glyphColor = function (x, y, p1, p2, p3) {
		var fn, colors;

		fn = "[PS.glyphColor] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 2, 5))
			return PS.ERROR;

		colors = _private._decodeColors(fn, p1, p2, p3);
		if (colors === PS.ERROR) {
			return PS.ERROR;
		}

		return _private._beadExec(fn, _private._glyphColor, x, y, colors);
	}

	// PS.glyphAlpha( x, y, alpha )

	PSInterface.glyphAlpha = function (x, y, alpha_p) {
		var fn, args, alpha, type;

		fn = "[PS.glyphAlpha] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 2, 3))
			return PS.ERROR;

		alpha = alpha_p; // prevent arg mutation
		if (alpha !== PS.CURRENT) {
			type = _private._typeOf(alpha);
			if (type === "undefined") {
				alpha = PS.CURRENT;
			} else if (type === "number") {
				alpha = Math.floor(alpha);
				if (alpha < 0) {
					alpha = 0;
				} else if (alpha > 255) {
					alpha = 255;
				}
			} else if (alpha === PS.DEFAULT) {
				alpha = _private._DEFAULTS.bead.glyph.color.a;
			} else {
				return _private._error(fn + "alpha argument invalid");
			}
		}

		return _private._beadExec(fn, _private._glyphAlpha, x, y, alpha);
	}

	// PS.glyphScale( x, y, scale )

	PSInterface.glyphScale = function (x, y, scale_p) {
		var fn, args, scale, type;

		fn = "[PS.glyphScale] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 2, 3))
			return PS.ERROR;

		scale = scale_p; // prevents arg mutation
		if (scale !== PS.CURRENT) {
			type = _private._typeOf(scale);
			if (type === "undefined") {
				scale = PS.CURRENT;
			} else if (type === "number") {
				scale = Math.floor(scale);
				if (scale < 50) {
					scale = 50;
				} else if (scale > 100) {
					scale = 100;
				}
			} else if (scale === PS.DEFAULT) {
				scale = _private._DEFAULTS.bead.glyph.scale;
			} else {
				return _private._error(fn + "scale argument invalid");
			}
		}

		return _private._beadExec(fn, _private._glyphScale, x, y, scale);
	}

	// PS.glyphFade( rate, options )
	// Sets fade rate/options of glyph
	// Returns fade settings or PS.ERROR

	PSInterface.glyphFade = function (x, y, rate_p, options_p) {
		var fn, args, rate, type, options;

		fn = "[PS.glyphFade] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 2, 4))
			return PS.ERROR;

		rate = rate_p; // prevent arg mutation
		if ((rate !== PS.CURRENT) && (rate !== PS.DEFAULT)) {
			type = _private._typeOf(rate);
			if (type === "undefined") {
				rate = PS.CURRENT;
			} else if (type === "number") {
				rate = Math.floor(rate);
				if (rate < 0) {
					rate = 0;
				}
			} else {
				return _private._error(fn + "rate argument not a number");
			}
		}

		options = _private._validFadeOptions(fn, options_p);
		if (options === PS.ERROR) {
			return PS.ERROR;
		}

		return _private._beadExec(fn, _private._glyphFade, x, y, rate, options);
	}

	//----------------------
	// STATUS LINE FUNCTIONS
	//----------------------

	PSInterface.statusText = function (strP) {
		var fn, str, type;

		fn = "[PS.statusText] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 0, 1))
			return PS.ERROR;

		str = strP; // prevent arg mutation
		type = _private._typeOf(str);
		if ((str !== PS.CURRENT) && (type !== "undefined")) {
			if (str === PS.DEFAULT) {
				str = _private._DEFAULTS.status.text;
			} else if (type !== "string") {
				str = str.toString();
			}

			_private._statusOut(str);
		}

		return _private._status.text;
	}

	PSInterface.statusInput = function (strP, exec) {
		var fn, type, str, len;

		fn = "[PS.statusInput] ";

		if (arguments.length !== 2) {
			return _private._error(fn + "Expected 2 arguments");
		}

		if (typeof exec !== "function") {
			return _private._error(fn + "2nd argument is not a function");
		}

		str = strP; // prevent arg mutation
		type = _private._typeOf(str);
		if (type !== "string") {
			str = str.toString();
		}
		len = str.length;
		if (len > _private._LABEL_MAX) // truncate if too long
		{
			str = str.substring(0, _private._LABEL_MAX);
		}
		_private._statusIn(str, exec);

		return _private._status.label;
	}

	PSInterface.statusColor = function (p1, p2, p3) {
		var fn, colors, current, fader, rgb, r, g, b;

		fn = "[PS.statusColor] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 0, 3))
			return PS.ERROR;

		colors = _private._decodeColors(fn, p1, p2, p3);
		if (colors === PS.ERROR) {
			return PS.ERROR;
		}

		current = _private._status.color;
		fader = _private._status.fader;

		if (PS.CURRENT == _private._checkColors(colors, current, _private._DEFAULTS.status.color))
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
				}
				if (!fader.active) {
					_private._startFader(fader, current.r, current.g, current.b, 255, r, g, b, 255);
				} else // must recalculate active fader
				{
					_private._recalcFader(fader, r, g, b, 255);
				}
			} else {
				_private._statusRGB(current);
			}

			current.r = r;
			current.g = g;
			current.b = b;
		}

		return current.rgb;
	}

	PSInterface.statusFade = function (rate, options_p) {
		var fn, fader, color, orate, nrate, type, val, options;

		fn = "[PS.statusFade] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 0, 2))
			return PS.ERROR;

		color = _private._status.color;
		fader = _private._status.fader;
		orate = fader.rate;

		type = _private._typeOf(rate);
		if ((type === "undefined") || (rate === PS.CURRENT)) {
			nrate = orate;
		} else if (rate === PS.DEFAULT) {
			nrate = _private._DEFAULTS.fader.rate;
		} else if (type === "number") {
			nrate = Math.floor(rate);
			if (nrate < 0) {
				nrate = 0;
			}
		} else {
			return _private._error(fn + "rate argument invalid");
		}

		options = _private._validFadeOptions(fn, options_p);
		if (options === PS.ERROR) {
			return PS.ERROR;
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

		return {
			rate: fader.rate,
			rgb: fader.rgb,
			onStep: fader.onStep,
			onEnd: fader.onEnd,
			params: fader.params
		};
	}

	// ---------------
	// TIMER FUNCTIONS
	// ---------------

	// PS.timerStart( ticks, exec, ... )
	// Execute a function [exec] after [ticks] 60ths of a second
	// Additional parameters are passed as arguments to the function
	// Returns id of timer

	PSInterface.timerStart = function (ticks_p, exec_p) {
		var fn, args, ticks, exec, type, obj, arglist, i, len, id;

		fn = "[PS.timerStart] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 2, 2))
			return PS.ERROR;

		// Prevent arg mutation

		ticks = ticks_p;
		exec = exec_p;

		// Check ticks param

		if (ticks === PS.DEFAULT) {
			ticks = 60;
		} else {
			type = _private._typeOf(ticks);
			if (type !== "number") {
				return _private._error(fn + "ticks argument invalid");
			}
			ticks = Math.floor(ticks);
			if (ticks < 1) {
				return _private._error(fn + "ticks argument less than one (1)");
			}
		}

		// Check exec param

		if (typeof exec !== "function") {
			return _private._error(fn + "exec argument not a function");
		}

		// Create an array of extra arguments

		arglist = [];
		if (args > 2) {
			len = args - 2;
			arglist.length = len;
			for (i = 0; i < len; i += 1) {
				arglist[i] = arguments[i + 2];
			}
		}

		// Create unique id

		id = _private._TIMER_PREFIX + _private._timerCnt;
		_private._timerCnt += 1;

		// Add timer to queue

		obj = {
			id: id,
			delay: ticks,
			count: ticks,
			exec: exec,
			arglist: arglist
		};

		_private._timers.push(obj);

		// PSInterface.debug(fn + "id = " + id + "\n");

		return id;
	}

	// PS.timerStop( id )
	// Stops a timer matching [id]
	// Returns id or PS.ERROR

	PSInterface.timerStop = function (id) {
		var fn, args, i, len, timer;

		fn = "[PS.timerStop] ";

		// PS.debug(fn + "id = " + id + "\n");

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 1, 1))
			return PS.ERROR;

		// Check id param

		if ((typeof id !== "string") || (id.length < 1)) {
			return _private._error(fn + "id argument invalid");
		}

		// Find and nuke timer

		len = _private._timers.length;
		for (i = 0; i < len; i += 1) {
			timer = _private._timers[i];
			if (timer.id === id) // found it!
			{
				_private._timers.splice(i, 1);
				return id;
			}
		}

		return _private._error(fn + "timer id '" + id + "' not found");
	}

	// -----------------
	// UTILITY FUNCTIONS
	// -----------------

	PSInterface.random = function (val_p) {
		var fn, val;

		fn = "[PS.random] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 1, 1))
			return PS.ERROR;

		val = val_p; // prevent arg mutation
		if (_private._typeOf(val) !== "number") {
			return _private._error(fn + "Argument not a number");
		}
		val = Math.floor(val);
		if (val < 2) {
			return 1;
		}

		val = Math.random() * val;
		val = Math.floor(val) + 1;
		return val;
	}

	PSInterface.makeRGB = function (r_p, g_p, b_p) {
		var fn, args, r, g, b;

		fn = "[PS.makeRGB] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 3, 3))
			return PS.ERROR;

		// Prevent arg mutation

		r = r_p;
		g = g_p;
		b = b_p;

		if (_private._typeOf(r) !== "number") {
			return _private._error(fn + "r argument not a number");
		}
		r = Math.floor(r);
		if (r < 0) {
			r = 0;
		} else if (r > 255) {
			r = 255;
		}

		if (_private._typeOf(g) !== "number") {
			return _private._error(fn + "g argument not a number");
		}
		g = Math.floor(g);
		if (g < 0) {
			g = 0;
		} else if (g > 255) {
			g = 255;
		}

		if (_private._typeOf(b) !== "number") {
			return _private._error(fn + "b argument not a number");
		}
		b = Math.floor(b);
		if (b < 0) {
			b = 0;
		} else if (b > 255) {
			b = 255;
		}

		return ((r * _private._RSHIFT) + (g * _private._GSHIFT) + b);
	}

	PSInterface.unmakeRGB = function (rgb_p, result_p) {
		var fn, args, rgb, result, red, green, blue, rval, gval, type;

		fn = "[PS.unmakeRGB] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 2, 2))
			return PS.ERROR;

		// Prevent arg mutation

		rgb = rgb_p;
		result = result_p;

		if (_private._typeOf(rgb) !== "number") {
			return _private._error(fn + "rgb argument not a number");
		}

		rgb = Math.floor(rgb);

		if (rgb < 1) // handle black
		{
			rgb = 0;
			red = 0;
			green = 0;
			blue = 0;
		} else if (rgb >= 0xFFFFFF) // handle white
		{
			rgb = 0xFFFFFF;
			red = 255;
			green = 255;
			blue = 255;
		} else {
			red = rgb / _private._RSHIFT;
			red = Math.floor(red);
			rval = red * _private._RSHIFT;

			green = (rgb - rval) / _private._GSHIFT;
			green = Math.floor(green);
			gval = green * _private._GSHIFT;

			blue = rgb - rval - gval;
		}

		type = _private._typeOf(result);
		if (type === "object") {
			result.rgb = rgb;
			result.r = red;
			result.g = green;
			result.b = blue;
		} else if (type === "array") {
			if (result.length < 3) {
				result.length = 3;
			}
			result[0] = red;
			result[1] = green;
			result[2] = blue;
		} else {
			return _private._error(fn + "result argument not an array or object reference");
		}

		return result;
	}

	// PS.applyRect()
	// Apply a function to a rectangular region of beads
	// [left, top, width, height] define a region inside the grid
	// [exec] is a function to be called on each bead
	// Arguments supplied after [exec] are passed as parameters to [exec]

	PSInterface.applyRect = function (left_p, top_p, width_p, height_p, exec_p) {
		var fn, args, xmax, ymax, left, top, width, height, exec, right, bottom, x, y, result, arglist, len, i;

		fn = "[PS.applyRect] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 5, 5))
			return PS.ERROR;

		xmax = _private._grid.x;
		ymax = _private._grid.y;

		// Prevent arg mutation

		left = left_p;
		top = top_p;
		width = width_p;
		height = height_p;
		exec = exec_p;

		// Check coordinates

		// Left

		if (left === PS.DEFAULT) {
			left = 0;
		} else if (_private._typeOf(left) === "number") {
			left = Math.floor(left);
			if (left >= xmax) {
				return PS.DONE;
			}
			if (left < 0) {
				left = 0;
			}
		} else {
			return _private._error(fn + "left argument invalid");
		}

		// Top

		if (top === PS.DEFAULT) {
			top = 0;
		} else if (_private._typeOf(top) === "number") {
			top = Math.floor(top);
			if (top >= ymax) {
				return PS.DONE;
			}
			if (top < 0) {
				top = 0;
			}
		} else {
			return _private._error(fn + "top argument invalid");
		}

		// Width

		if (width === PS.DEFAULT) {
			width = xmax - left;
		} else if (_private._typeOf(width) === "number") {
			width = Math.floor(width);
			if (width < 1) {
				return PS.DONE;
			}
			if ((left + width) > xmax) {
				width = xmax - left;
			}
		} else {
			return _private._error(fn + "width argument invalid");
		}

		right = left + width;

		// Height

		if (height === PS.DEFAULT) {
			height = ymax - top;
		} else if (_private._typeOf(height) === "number") {
			height = Math.floor(height);
			if (height < 1) {
				return PS.DONE;
			}
			if ((top + height) > ymax) {
				height = ymax - top;
			}
		} else {
			return _private._error(fn + "height argument invalid");
		}

		bottom = top + height;

		// Check function

		if (!exec || (typeof exec !== "function")) {
			return _private._error(fn + "exec argument not a function");
		}

		// Create an array of arguments
		// First two elements reserved for x/y

		arglist = [0, 0];
		if (args > 5) {
			len = args - 5;
			for (i = 0; i < len; i += 1) {
				arglist.push(arguments[i + 5]);
			}
		}

		// Apply [exec] to designated beads

		for (y = top; y < bottom; y += 1) {
			arglist[1] = y;
			for (x = left; x < right; x += 1) {
				arglist[0] = x;
				try {
					result = exec.apply(_private._EMPTY, arglist);
				} catch (err) {
					result = _private._errorCatch(fn + "exec failed @" + x + ", " + y + " [" + err.message + "]", err);
				}

				if (result === PS.ERROR) {
					return PS.ERROR;
				}
			}
		}

		return result;
	}

	// PS.hex ( val, padding )
	// Converts a number to a hex string with optional padding
	// Returns string or PS.ERROR

	PSInterface.hex = function (val_p, padding_p) {
		var fn, val, type, padding, hex;

		fn = "[PS.hex] ";

		val = val_p; // avoid arg mutation
		type = _private._typeOf(val);
		if (type !== "number") {
			return _private._error(fn + "value argument invalid");
		}

		// Floor and convert to absolute value

		val = Math.floor(val);
		val = Math.abs(val);

		padding = padding_p; // avoid arg mutation
		type = _private._typeOf(padding);
		if ((type === "undefined") || (padding === PS.DEFAULT)) {
			padding = 2;
		} else if (type === "number") {
			padding = Math.floor(padding);
			if (padding < 1) {
				padding = 1;
			}
		} else {
			return _private._error(fn + "padding argument invalid");
		}

		hex = Number(val).toString(16);

		while (hex.length < padding) {
			hex = "0" + hex;
		}

		return ("0x" + hex);
	}

	// PS.keyRepeat ( repeat, init, delay )
	// Controls keyboard repeat parameters
	// [repeat] = true to enable repeats, false to disable, default = true
	// [init] = initial delay before first repeat, default = 30 (1/2 sec)
	// [delay] = delay between repeats, default = 6 (1/10 sec)
	// Returns object with settings or PS.ERROR

	PSInterface.keyRepeat = function (repeat_p, init_p, delay_p) {
		var fn, type, repeat, delay, init;

		fn = "[PS.keyRepeat] ";

		// verify repeat argument

		repeat = _private._isBoolean(repeat_p, _private._keyRepeat, true, true);
		if (repeat === PS.ERROR) {
			return _private._error(fn + "repeat argument invalid");
		}

		// Verify init argument

		init = init_p; // avoid arg mutation
		type = _private._typeOf(init);
		if ((type === "undefined") || (init === PS.DEFAULT)) {
			init = _private._DEFAULT_KEY_DELAY * 5;
		} else if (init === PS.CURRENT) {
			init = _private._keyInitRate;
		} else if (type === "number") {
			init = Math.floor(init);
			if (init < 1) {
				init = 1;
			}
		} else {
			return _private._error(fn + "init argument invalid");
		}

		// Verify delay argument

		delay = delay_p; // avoid arg mutation
		type = _private._typeOf(delay);
		if ((type === "undefined") || (delay === PS.DEFAULT)) {
			delay = _private._DEFAULT_KEY_DELAY;
		} else if (delay === PS.CURRENT) {
			delay = _private._keyDelayRate;
		} else if (type === "number") {
			delay = Math.floor(delay);
			if (delay < 1) {
				delay = 1;
			}
		} else {
			return _private._error(fn + "delay argument invalid");
		}

		_private._keyRepeat = repeat;
		_private._keyInitRate = init;
		_private._keyDelayRate = delay;

		return {
			repeat: _private._keyRepeat,
			init: _private._keyInitRate,
			delay: _private._keyDelayRate
		};
	}

	// ---------
	// IMAGE API
	// ---------

	PSInterface.imageLoad = function (filenameP, execP, formatP) {
		var fn, args, filename, exec, format, ext, image, id, type;

		fn = "[PS.imageLoad] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 2, 3))
			return PS.ERROR;

		// Prevent arg mutation

		filename = filenameP;
		exec = execP;
		format = formatP;

		// Validate filename

		if ((typeof filename !== "string") || (filename.length < 1)) {
			return _private._error(fn + "filename argument invalid");
		}

		// check for a valid file extension

		ext = filename.substr(filename.lastIndexOf('.') + 1);
		ext = ext.toLowerCase();
		if ((ext !== "png") && (ext !== "jpg") && (ext !== "jpeg") && (ext !== "bmp")) {
			return _private._error(fn + "filename extension invalid");
		}

		// Validate exec

		if (typeof exec !== "function") {
			return _private._error(fn + "exec argument invalid");
		}

		type = _private._typeOf(format);
		if ((type === "undefined") || (format === PS.DEFAULT)) {
			format = 4;
		} else {
			if (type !== "number") {
				return _private._error(fn + "format argument invalid");
			}
			format = Math.floor(format);
			if ((format < 1) && (format > 4)) {
				return _private._error(fn + "format argument is not 1, 2, 3 or 4");
			}
		}

		// save a record with the user function, id and alpha preference

		id = _private._IMAGE_PREFIX + _private._imageCnt; // a unique ID
		_private._imageCnt += 1;
		_private._imageList.push({
			source: filename,
			id: id,
			exec: exec,
			format: format
		});

		try {
			image = new Image();
			image.setAttribute("data-id", id); // store the id
			image.onload = function () {
				_private._imageLoad(image);
			};
			image.onerror = function () {
				_private._imageError(image);
			};
			image.src = filename; // load it!
		} catch (err) {
			return _private._errorCatch(fn + "Error loading " + filename + " [" + err.message + "]", err);
		}

		return id;
	}

	// Blit an image to the grid at [xpos, ypos]
	// Optional [region] specifies region of blit
	// Return true if any part of image was drawn, false if none of image was drawn, or PS.ERROR

	PSInterface.imageBlit = function (imageP, xposP, yposP, regionP) {
		var fn, args, xmax, ymax, image, xpos, ypos, region, w, h, format, data, type, top, left, width, height, plane,
			val, wsize, rowptr, ptr, drawx, drawy, y, x, r, g, b, a, rgb, rval, gval, i, bead, color, any;

		fn = "[PS.imageBlit] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 3, 4))
			return PS.ERROR;

		xmax = _private._grid.x;
		ymax = _private._grid.y;

		// Prevent arg mutation

		image = imageP;
		xpos = xposP;
		ypos = yposP;
		region = regionP;

		if (_private._validImage(fn, image) === PS.ERROR) {
			return PS.ERROR;
		}

		w = image.width;
		h = image.height;
		format = image.pixelSize;
		data = image.data;

		// Validate xpos

		type = _private._typeOf(xpos);
		if ((type === "undefined") || (xpos === PS.DEFAULT)) {
			xpos = 0;
		} else if (type === "number") {
			xpos = Math.floor(xpos);
		} else {
			return _private._error(fn + "xpos argument invalid");
		}

		// Validate ypos

		type = _private._typeOf(ypos);
		if ((type === "undefined") || (ypos === PS.DEFAULT)) {
			ypos = 0;
		} else if (type === "number") {
			ypos = Math.floor(ypos);
		} else {
			return _private._error(fn + "ypos argument invalid");
		}

		// If drawing is obviously offgrid, exit now

		if ((xpos >= xmax) || (ypos >= ymax) || ((xpos + w) < 1) || ((ypos + h) < 1)) {
			return false;
		}

		// Validate region

		type = _private._typeOf(region);
		if ((type === "undefined") || (region === PS.DEFAULT)) {
			top = 0;
			left = 0;
			width = w;
			height = h;
		} else if (type === "object") {
			// check region.left

			left = region.left;
			type = _private._typeOf(left);
			if ((type === "undefined") || (left === PS.DEFAULT)) {
				left = 0;
			} else {
				if (type !== "number") {
					return _private._error(fn + "region.left invalid");
				}
				left = Math.floor(left);
				if (left < 0) {
					left = 0;
				} else if (left >= w) {
					return _private._error(fn + "region.left outside image");
				}
			}

			// check region.top

			top = region.top;
			type = _private._typeOf(top);
			if ((type === "undefined") || (top === PS.DEFAULT)) {
				top = 0;
			} else {
				if (type !== "number") {
					return _private._error(fn + "region.top invalid");
				}
				top = Math.floor(top);
				if (top < 0) {
					top = 0;
				} else if (top >= h) {
					return _private._error(fn + "region.top outside image");
				}
			}

			// check region.width

			width = region.width;
			type = _private._typeOf(width);
			if ((type === "undefined") || (width === PS.DEFAULT)) {
				width = w - left;
			} else {
				if (type !== "number") {
					return _private._error(fn + "region.width invalid");
				}
				width = Math.floor(width);
				if (width < 1) {
					return false;
				}
				if ((left + width) > w) {
					width = w - left;
				}
			}

			// exit now if off grid

			if ((xpos + width) < 1) {
				return false;
			}

			// check region.height

			height = region.height;
			type = _private._typeOf(height);
			if ((type === "undefined") || (height === PS.DEFAULT)) {
				height = h - top;
			} else {
				if (type !== "number") {
					return _private._error(fn + "region.height invalid");
				}
				height = Math.floor(height);
				if (height < 1) {
					return false;
				}
				if ((top + height) > h) {
					height = h - top;
				}
			}

			// exit now if off grid

			if ((ypos + height) < 1) {
				return false;
			}
		} else {
			return _private._error(fn + "region argument invalid");
		}

		// adjust blitted width and height so only visible portion gets drawn

		// Cut off left edge if offgrid

		if (xpos < 0) {
			width += xpos; // reduce width (remember, xpos is NEGATIVE!)
			if (width < 1) {
				return false;
			}
			left -= xpos; // move left corner over
			xpos = 0;
		}

		// Cut off right edge if offgrid

		val = xpos + width;
		if (val > xmax) {
			width = xmax - xpos;
		}

		if (width < 1) {
			return false;
		}

		// Cut off top edge ff offgrid

		if (ypos < 0) {
			height += ypos; // reduce height (remember, ypos is NEGATIVE!)
			if (height < 1) {
				return false;
			}
			top -= ypos; // move top corner down
			ypos = 0;
		}

		// Cut off bottom edge if offgrid

		val = ypos + height;
		if (val > ymax) {
			height = ymax - ypos;
		}

		if (height < 1) {
			return false;
		}

		wsize = (w * format); // size of each image row (calc only once)
		any = false;
		a = 255; // assume default alpha
		plane = _private._grid.plane;

		// create pointer to TL corner of image data

		rowptr = (top * wsize) + (left * format);
		drawy = ypos;
		for (y = 0; y < height; y += 1) {
			ptr = rowptr; // set data pointer to start of row
			drawx = xpos;
			for (x = 0; x < width; x += 1) {
				i = drawx + (drawy * xmax); // get index of bead
				bead = _private._beads[i];
				if (bead.active) {
					any = true;

					// handle multiplexed rgb

					if (format < 3) // formats 1 and 2
					{
						rgb = data[ptr];

						// decode multiplex

						r = rgb / _private._RSHIFT;
						r = Math.floor(r);
						rval = r * _private._RSHIFT;

						g = (rgb - rval) / _private._GSHIFT;
						g = Math.floor(g);
						gval = g * _private._GSHIFT;

						b = rgb - rval - gval;

						if (format === 2) {
							a = data[ptr + 1];
						}
					}

					// handle r g b (a)
					else // formats 3 and 4
					{
						r = data[ptr];
						g = data[ptr + 1];
						b = data[ptr + 2];
						rgb = (r * _private._RSHIFT) + (g * _private._GSHIFT) + b;
						if (format === 4) {
							a = data[ptr + 3];
						}
					}

					// rgb, r, g, b and a are now determined

					color = _private._colorPlane(bead, plane);
					color.r = r;
					color.g = g;
					color.b = b;
					color.a = a;
					color.rgb = rgb;
					_private._recolor(bead);
				}

				drawx += 1;
				ptr += format;
			}
			drawy += 1;
			rowptr += wsize; // point to start of next row
		}

		if (any) {
			_private._gridDraw();
		}
		return true;
	}

	// Create an image object from the grid
	// Optional [format] specifies region

	PSInterface.imageCapture = function (formatP, regionP) {
		var fn, args, format, region, type, w, h, data, top, left, width, height, total, output,
			right, bottom, id, cnt, x, y, i, bead, color;

		fn = "[PS.imageCapture] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 0, 2))
			return PS.ERROR;

		// Prevent arg mutation

		format = formatP;
		region = regionP;

		type = _private._typeOf(format);
		if ((type === "undefined") || (format === PS.DEFAULT)) {
			format = 3;
		} else {
			if (type !== "number") {
				return _private._error(fn + "format argument invalid");
			}
			format = Math.floor(format);
			if ((format < 1) && (format > 4)) {
				return _private._error(fn + "format argument is not 1, 2, 3 or 4");
			}
		}

		w = _private._grid.x;
		h = _private._grid.y;

		// Validate region

		type = _private._typeOf(region);
		if ((type === "undefined") || (region === PS.DEFAULT)) {
			top = 0;
			left = 0;
			width = w;
			height = h;
		} else if (type === "object") {
			// check region.left

			left = region.left;
			type = _private._typeOf(left);
			if ((type === "undefined") || (left === PS.DEFAULT)) {
				left = 0;
			} else {
				if (type !== "number") {
					return _private._error(fn + "region.left not a number");
				}
				left = Math.floor(left);
				if (left < 0) {
					left = 0;
				} else if (left >= w) {
					return _private._error(fn + "region.left outside grid");
				}
			}

			// check region.top

			top = region.top;
			type = _private._typeOf(top);
			if ((type === "undefined") || (top === PS.DEFAULT)) {
				top = 0;
			} else {
				if (type !== "number") {
					return _private._error(fn + "region.top not a number");
				}
				top = Math.floor(top);
				if (top < 0) {
					top = 0;
				} else if (top >= h) {
					return _private._error(fn + "region.top outside grid");
				}
			}

			// check region.width

			width = region.width;
			type = _private._typeOf(width);
			if ((type === "undefined") || (width === PS.DEFAULT)) {
				width = w - left;
			} else {
				if (type !== "number") {
					return _private._error(fn + "region.width not a number");
				}
				width = Math.floor(width);
				if ((width < 1) || ((left + width) > w)) {
					width = w - left;
				}
			}

			// check region.height

			height = region.height;
			type = _private._typeOf(height);
			if ((type === "undefined") || (height === PS.DEFAULT)) {
				height = h - top;
			} else {
				if (type !== "number") {
					return _private._error(fn + "region.height not a number");
				}
				height = Math.floor(height);
				if ((height < 1) || ((top + height) > h)) {
					height = h - top;
				}
			}
		} else {
			return _private._error(fn + "region argument invalid");
		}

		// Init image

		id = _private._IMAGE_PREFIX + _private._imageCnt; // a unique ID
		_private._imageCnt += 1;

		output = {
			source: PS.GRID,
			id: id,
			width: width,
			height: height,
			pixelSize: format,
			valid: true,
			data: []
		};

		// If no data, return empty data

		total = width * height;
		if (total < 1) {
			return output;
		}

		// presize the output array

		data = output.data;
		data.length = total * format;

		right = left + width;
		bottom = top + height;
		cnt = 0;

		for (y = top; y < bottom; y += 1) {
			for (x = left; x < right; x += 1) {
				i = x + (y * w); // get index of bead
				bead = _private._beads[i];
				color = bead.color; // uses the current effective color
				if (format < 3) // format 1 & 2
				{
					data[cnt] = color.rgb;
					if (format === 2) {
						data[cnt + 1] = color.a;
					}
				} else // format 3 & 4
				{
					data[cnt] = color.r;
					data[cnt + 1] = color.g;
					data[cnt + 2] = color.b;
					if (format === 4) {
						data[cnt + 3] = color.a;
					}
				}
				cnt += format;
			}
		}

		return output;
	}

	// Dump a Javascript text representation of an image to the debugger
	// Optional [coords] specify region of dump

	PSInterface.imageDump = function (imageP, regionP, formatP, linelenP, hexP) {
		var fn, args, image, region, format, linelen, hex, w, h, psize, data, type, top, left, width, height,
			total, str, wsize, pcnt, done, a, rowptr, ptr, y, x, r, g, b, rgb, rval, gval;

		fn = "[PS.imageDump] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 1, 5))
			return PS.ERROR;

		// Prevent arg mutation

		image = imageP;
		region = regionP;
		format = formatP;
		linelen = linelenP;

		// Validate image

		if (_private._validImage(fn, image) === PS.ERROR) {
			return PS.ERROR;
		}

		w = image.width;
		h = image.height;
		psize = image.pixelSize;
		data = image.data;

		// Validate region

		type = _private._typeOf(region);
		if ((type === "undefined") || (region === PS.DEFAULT)) {
			top = 0;
			left = 0;
			width = w;
			height = h;
		} else if (type === "object") {
			// check region.left

			left = region.left;
			type = _private._typeOf(left);
			if ((type === "undefined") || (left === PS.DEFAULT)) {
				left = 0;
			} else {
				if (type !== "number") {
					return _private._error(fn + "region.left invalid");
				}
				left = Math.floor(left);
				if (left < 0) {
					left = 0;
				} else if (left >= w) {
					return _private._error(fn + "region.left outside grid");
				}
			}

			// check region.top

			top = region.top;
			type = _private._typeOf(top);
			if ((type === "undefined") || (top === PS.DEFAULT)) {
				top = 0;
			} else {
				if (type !== "number") {
					return _private._error(fn + "region.top invalid");
				}
				top = Math.floor(top);
				if (top < 0) {
					top = 0;
				} else if (top >= h) {
					return _private._error(fn + "region.top outside grid");
				}
			}

			// check region.width

			width = region.width;
			type = _private._typeOf(width);
			if ((type === "undefined") || (width === PS.DEFAULT)) {
				width = w - left;
			} else {
				if (type !== "number") {
					return _private._error(fn + "region.width invalid");
				}
				width = Math.floor(width);
				if ((width < 1) || ((left + width) > w)) {
					width = w - left;
				}
			}

			// check region.height

			height = region.height;
			type = _private._typeOf(height);
			if ((type === "undefined") || (height === PS.DEFAULT)) {
				height = h - top;
			} else {
				if (type !== "number") {
					return _private._error(fn + "region.height invalid");
				}
				height = Math.floor(height);
				if ((height < 1) || ((top + height) > h)) {
					height = h - top;
				}
			}
		} else {
			return _private._error(fn + "region argument invalid");
		}

		total = width * height;

		// Validate format

		type = _private._typeOf(format);
		if ((type === "undefined") || (format === PS.DEFAULT)) {
			format = psize; // use format of source image by default
		} else {
			if (type !== "number") {
				return _private._error(fn + "format argument invalid");
			}
			format = Math.floor(format);
			if ((format < 1) || (format > 4)) {
				return _private._error(fn + "format argument is not 1, 2, 3 or 4");
			}
		}

		// Validate linelen

		type = _private._typeOf(linelen);
		if ((type === "undefined") || (linelen === PS.DEFAULT)) {
			linelen = width;
		} else {
			if (type !== "number") {
				return _private._error(fn + "length argument invalid");
			}
			linelen = Math.floor(linelen);
			if (linelen < 1) {
				linelen = 1;
			}
			if (linelen > total) {
				linelen = total;
			}
		}

		// Validate hex

		hex = _private._isBoolean(hexP, PS.ERROR, true, true);
		if (hex === PS.ERROR) {
			return _private._error(fn + "hex argument invalid");
		}

		// Init output string

		str = "\nvar myImage = {\n\twidth : " + width + ", height : " + height + ", pixelSize : " + format + ",\n\tdata : [";

		// If no data, return empty

		if (total < 1) {
			str += "]\n};\n";
			PSInterface.debug(str);
			return PS.DONE;
		}

		str += "\n\t"; // start of first pixel line
		a = 255; // default alpha
		done = pcnt = 0;

		// create pointer to TL corner of image data

		wsize = (w * psize); // size of each image row (calc only once)
		rowptr = (top * wsize) + (left * psize);
		for (y = 0; y < height; y += 1) {
			ptr = rowptr; // set data pointer to start of row
			for (x = 0; x < width; x += 1) {
				// handle multiplexed rgb

				if (psize < 3) {
					rgb = data[ptr];

					// decode multiplex

					if (rgb < 1) {
						r = g = b = 0;
					} else if (rgb >= 0xFFFFFF) {
						r = g = b = 255;
					} else {
						r = rgb / _private._RSHIFT;
						r = Math.floor(r);
						rval = r * _private._RSHIFT;

						g = (rgb - rval) / _private._GSHIFT;
						g = Math.floor(g);
						gval = g * _private._GSHIFT;

						b = rgb - rval - gval;
					}

					if (psize === 2) {
						a = data[ptr + 1];
					}
				} else {
					r = data[ptr];
					g = data[ptr + 1];
					b = data[ptr + 2];
					rgb = (r * _private._RSHIFT) + (g * _private._GSHIFT) + b;
					if (psize === 4) {
						a = data[ptr + 3];
					}
				}

				str += _private._outputPixel(format, hex, rgb, r, g, b, a);

				done += 1;
				if (done < total) {
					str += ",";
					pcnt += 1;
					if (pcnt < linelen) // continue this line
					{
						str += " ";
					} else // start next line
					{
						pcnt = 0;
						str += "\n\t";
					}
				}

				ptr += psize;
			}

			rowptr += wsize; // point to start of next row
		}

		str += "\n\t]\n};\n"; // end the string

		PSInterface.debug(str);

		return PS.DONE;
	}

	// ----------
	// SPRITE API
	// ----------

	// PS.spriteSolid( image, region )
	// Create a solid sprite of specified dimensions

	PSInterface.spriteSolid = function (widthP, heightP) {
		var fn, args, width, height, s;

		fn = "[PS.spriteSolid] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 2, 2))
			return PS.ERROR;

		// Prevent arg mutation

		width = widthP;
		height = heightP;

		// Check width

		if (width === PS.DEFAULT) {
			width = 1;
		} else if (_private._typeOf(width) === "number") {
			width = Math.floor(width);
			if (width < 1) {
				width = 1;
			}
		} else {
			return _private._error(fn + "width argument invalid");
		}

		// Check height

		if (height === PS.DEFAULT) {
			height = 1;
		} else if (_private._typeOf(height) === "number") {
			height = Math.floor(height);
			if (height < 1) {
				height = 1;
			}
		} else {
			return _private._error(fn + "height argument invalid");
		}

		s = _private._newSprite();
		s.width = width;
		s.height = height;
		s.color = {
			rgb: 0,
			r: 0,
			g: 0,
			b: 0,
			a: 255
		};

		return s.id;
	}

	// PS.spriteSolidColor ( sprite, color )
	// Sets color of a solid sprite

	PSInterface.spriteSolidColor = function (sprite, p1, p2, p3) {
		var fn, args, s, colors, current, rgb, r, g, b;

		fn = "[PS.spriteSolidColor] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 1, 4))
			return PS.ERROR;

		s = _private._getSprite(sprite, fn);
		if (s === PS.ERROR) {
			return PS.ERROR;
		}

		current = s.color;
		if (!current) {
			return _private._error(fn + "Cannot set color of image sprite " + s.id);
		}

		colors = _private._decodeColors(fn, p1, p2, p3);
		if (colors === PS.ERROR) {
			return PS.ERROR;
		}

		rgb = colors.rgb;
		if (rgb !== PS.CURRENT) {
			if (rgb === null) // must inspect r/g/b values
			{
				r = colors.r;
				if (r === PS.CURRENT) {
					colors.r = r = current.r;
				} else if (r === PS.DEFAULT) {
					colors.r = r = 0;
				}

				g = colors.g;
				if (g === PS.CURRENT) {
					colors.g = g = current.g;
				} else if (g === PS.DEFAULT) {
					colors.g = g = 0;
				}

				b = colors.b;
				if (b === PS.CURRENT) {
					colors.b = b = current.b;
				} else if (b === PS.DEFAULT) {
					colors.b = b = 0;
				}

				colors.rgb = rgb = (r * _private._RSHIFT) + (g * _private._GSHIFT) + b;
			} else if (rgb === PS.DEFAULT) {
				colors.rgb = rgb = 0;
				colors.r = 0;
				colors.g = 0;
				colors.b = 0;
			}

			// only change color if necessary

			if (current.rgb !== rgb) {
				current.rgb = rgb;
				current.r = colors.r;
				current.g = colors.g;
				current.b = colors.b;

				if (s.visible && s.placed) {
					_private._drawSprite(s);
					_private._gridDraw();
				}
			}
		}

		return current.rgb;
	}

	// PS.spriteSolidAlpha ( sprite, alpha )
	// Sets alpha of a solid sprite

	PSInterface.spriteSolidAlpha = function (spriteP, alphaP) {
		var fn, args, sprite, alpha, s, current, type;

		fn = "[PS.spriteSolidAlpha] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 1, 2))
			return PS.ERROR;

		// Prevent arg mutation

		sprite = spriteP;
		alpha = alphaP;

		s = _private._getSprite(sprite, fn);
		if (s === PS.ERROR) {
			return PS.ERROR;
		}

		current = s.color;
		if (!current) {
			return _private._error(fn + "Cannot set alpha of image sprite " + s.id);
		}

		type = _private._typeOf(alpha);
		if ((type !== "undefined") && (alpha !== PS.CURRENT)) {
			if (alpha === PS.DEFAULT) {
				alpha = 255;
			} else if (type === "number") {
				alpha = Math.floor(alpha);
				if (alpha < 0) {
					alpha = 0;
				} else if (alpha > 255) {
					alpha = 255;
				}
			} else {
				return _private._error(fn + "alpha argument invalid");
			}

			if (current.a !== alpha) {
				current.a = alpha;
				if (s.visible && s.placed) {
					_private._drawSprite(s);
					_private._gridDraw();
				}
			}
		}

		return current.a;
	}

	// PS.spriteImage( image, region )
	// Create a sprite from an image with optional subregion
	// Makes a private format 4 reference image

	PSInterface.spriteImage = function (image, region) {
		var fn, args, w, h, format, data, type, top, left, width, height, ndata, wsize, rowptr, ptr, x, y, i, rgb, r, g, b, a, rval, gval, s;

		fn = "[PS.spriteImage] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 1, 2))
			return PS.ERROR;

		// Validate image

		if (_private._validImage(fn, image) === PS.ERROR) {
			return PS.ERROR;
		}

		left = top = 0;
		width = w = image.width;
		height = h = image.height;
		format = image.pixelSize;
		data = image.data;

		// Validate region

		type = _private._typeOf(region);
		if ((type !== "undefined") && (region !== PS.DEFAULT)) {
			if (type !== "object") {
				return _private._error(fn + "region argument invalid");
			}

			// Check region.left

			left = region.left;
			type = _private._typeOf(left);
			if ((type === "undefined") || (left === PS.DEFAULT)) {
				left = 0;
			} else {
				if (type !== "number") {
					return _private._error(fn + "region.left invalid");
				}
				left = Math.floor(left);
				if (left < 0) {
					left = 0;
				} else if (left >= w) {
					return _private._error(fn + "region.left outside image");
				}
			}

			// check region.top

			top = region.top;
			type = _private._typeOf(top);
			if ((type === "undefined") || (top === PS.DEFAULT)) {
				top = 0;
			} else {
				if (type !== "number") {
					return _private._error(fn + "region.top invalid");
				}
				top = Math.floor(top);
				if (top < 0) {
					top = 0;
				} else if (top >= h) {
					return _private._error(fn + "region.top outside image");
				}
			}

			// check region.width

			width = region.width;
			type = _private._typeOf(width);
			if ((type === "undefined") || (width === PS.DEFAULT)) {
				width = w - left;
			} else {
				if (type !== "number") {
					return _private._error(fn + "region.width invalid");
				}
				width = Math.floor(width);
				if ((width < 1) || ((left + width) > w)) {
					width = w - left;
				}
			}

			// check region.height

			height = region.height;
			type = _private._typeOf(height);
			if ((type === "undefined") || (height === PS.DEFAULT)) {
				height = h - top;
			} else {
				if (type !== "number") {
					return _private._error(fn + "region.height invalid");
				}
				height = Math.floor(height);
				if ((height < 1) || ((top + height) > h)) {
					height = h - top;
				}
			}
		}

		// Create a new format 4 reference image

		ndata = [];
		ndata.length = width * height * 4;

		a = 255;

		wsize = (w * format); // size of each image row (calc only once)
		rowptr = (top * wsize) + (left * format); // pointer to TL corner of image data
		i = 0;
		for (y = 0; y < height; y += 1) {
			ptr = rowptr; // set data pointer to start of row
			for (x = 0; x < width; x += 1) {
				if (format < 3) {
					rgb = data[ptr];

					if (rgb < 1) // handle black
					{
						rgb = r = g = b = 0;
					} else if (rgb >= 0xFFFFFF) // handle white
					{
						rgb = 0xFFFFFF;
						r = g = b = 255;
					} else {
						r = rgb / _private._RSHIFT;
						r = Math.floor(r);
						rval = r * _private._RSHIFT;

						g = (rgb - rval) / _private._GSHIFT;
						g = Math.floor(g);
						gval = g * _private._GSHIFT;

						b = rgb - rval - gval;
					}

					if (format === 2) {
						a = data[ptr + 1];
					}
				} else {
					r = data[ptr];
					g = data[ptr + 1];
					b = data[ptr + 2];
					if (format === 4) {
						a = data[ptr + 3];
					}
				}

				ndata[i] = r;
				ndata[i + 1] = g;
				ndata[i + 2] = b;
				ndata[i + 3] = a;

				ptr += format;
				i += 4;
			}
			rowptr += wsize; // point to start of next row
		}

		s = _private._newSprite();
		s.width = width;
		s.height = height;
		s.image = {
			id: _private._IMAGE_PREFIX + _private._imageCnt, // unique id
			width: width,
			height: height,
			pixelSize: 4,
			data: ndata
		};

		_private._imageCnt += 1;

		// PS.imageDump( s.image );

		return s.id;
	}

	// PS.spriteShow( sprite, show )
	// Toggles visibility of a sprite

	PSInterface.spriteShow = function (spriteP, showP) {
		var fn, args, sprite, show, s;

		fn = "[PS.spriteShow] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 1, 2))
			return PS.ERROR;

		// Prevent arg mutation

		sprite = spriteP;
		s = _private._getSprite(sprite, fn);
		if (s === PS.ERROR) {
			return PS.ERROR;
		}

		// Validate show

		show = _private._isBoolean(showP, PS.CURRENT, true, PS.CURRENT);
		if (show === PS.ERROR) {
			return _private._error(fn + "show argument invalid");
		}

		// Only change if needed

		if (show !== PS.CURRENT) {
			if (s.visible !== show) {
				s.visible = show;
				if (s.placed) {
					if (show) {
						_private._drawSprite(s);
						_private._collisionCheck(s, sprite);
					} else {
						_private._eraseSprite(s);
					}
					_private._gridDraw();
				}
			}
		}

		return s.visible;
	}

	// PS.spriteAxis( sprite, x, y )
	// Sets/inspects positional axis of sprite

	PSInterface.spriteAxis = function (spriteP, xP, yP) {
		var fn, args, sprite, x, y, s, type;

		fn = "[PS.spriteAxis] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 1, 3))
			return PS.ERROR;

		// Prevent arg mutation

		sprite = spriteP;
		x = xP;
		y = yP;

		s = _private._getSprite(sprite, fn);
		if (s === PS.ERROR) {
			return PS.ERROR;
		}

		// Validate x

		type = _private._typeOf(x);
		if ((type === "undefined") || (x === PS.CURRENT)) {
			x = s.ax;
		} else if (x === PS.DEFAULT) {
			x = 0;
		} else if (type === "number") {
			x = Math.floor(x);
		} else {
			return _private._error(fn + "x argument invalid");
		}

		// Validate y

		type = _private._typeOf(y);
		if ((type === "undefined") || (y === PS.CURRENT)) {
			y = s.ay;
		} else if (y === PS.DEFAULT) {
			y = 0;
		} else if (type === "number") {
			y = Math.floor(y);
		} else {
			return _private._error(fn + "y argument invalid");
		}

		// Either axis changing?

		if ((x !== s.ax) || (y !== s.ay)) {
			s.ax = x;
			s.ay = y;

			if (s.visible && s.placed) {
				_private._drawSprite(s);
				_private._collisionCheck(s, sprite);
				_private._gridDraw();
			}
		}

		return {
			x: s.ax,
			y: s.ay
		};

	}

	// PS.spritePlane( sprite, plane )
	// Sets/inspects sprite plane

	PSInterface.spritePlane = function (spriteP, planeP) {
		var fn, args, sprite, plane, s, type;

		fn = "[PS.spritePlane] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 1, 2))
			return PS.ERROR;

		// Prevent arg mutation

		sprite = spriteP;
		plane = planeP;

		s = _private._getSprite(sprite, fn);
		if (s === PS.ERROR) {
			return PS.ERROR;
		}

		// Validate plane

		type = _private._typeOf(plane);
		if ((type !== "undefined") && (plane !== PS.CURRENT)) {
			if (plane === PS.DEFAULT) {
				plane = 0;
			} else if (type === "number") {
				plane = Math.floor(plane);
				if (plane < 1) {
					plane = 0;
				}
			} else {
				return _private._error(fn + "plane argument invalid");
			}

			// Plane changing? No collision check needed here

			if (s.plane !== plane) {
				// Erase on current plane

				if (s.visible && s.placed) {
					_private._eraseSprite(s);
				}

				s.plane = plane;

				// Redraw on new plane

				if (s.visible && s.placed) {
					_private._drawSprite(s);
					_private._gridDraw();
				}
			}
		}

		// Return default if not set yet

		if (s.plane < 0) {
			return 0;
		}

		return s.plane;
	}

	// PS.spriteMove ( sprite, x, y )
	// Erases sprite at previous location (if any)
	// Redraws at x/y

	PSInterface.spriteMove = function (spriteP, xP, yP) {
		var fn, args, sprite, x, y, s, type, h_left, h_top, h_width, h_height, v_left, v_top, v_width, v_height, any;

		fn = "[PS.spriteMove] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 1, 3))
			return PS.ERROR;

		// Prevent arg mutation

		sprite = spriteP;
		x = xP;
		y = yP;

		s = _private._getSprite(sprite, fn);
		if (s === PS.ERROR) {
			return PS.ERROR;
		}

		// Validate x

		type = _private._typeOf(x);
		if ((type === "undefined") || (x === PS.CURRENT)) {
			x = s.x;
		} else if (x === PS.DEFAULT) {
			x = 0;
		} else if (type === "number") {
			x = Math.floor(x);
		} else {
			return _private._error(fn + "x argument invalid");
		}

		// Validate y

		type = _private._typeOf(y);
		if ((type === "undefined") || (y === PS.CURRENT)) {
			y = s.y;
		} else if (y === PS.DEFAULT) {
			y = 0;
		} else if (type === "number") {
			y = Math.floor(y);
		} else {
			return _private._error(fn + "y argument invalid");
		}

		// Either coordinate changing?

		if (!s.placed || (x !== s.x) || (y !== s.y)) {
			any = false;

			// If no plane assigned, use current

			if (s.plane < 0) {
				s.plane = _private._grid.plane;
			}

			// Erase previous position

			if (s.visible && s.placed) {
				// Which beads (if any) actually need to be erased?
				// Don't erase beads that will be overwritten by moved sprite

				// create h rect

				h_top = s.y;
				h_height = s.height;
				if (x > s.x) // sprite moving right
				{
					h_width = x - s.x;
					h_left = s.x;
				} else if (s.x > x) // sprite moving left
				{
					h_width = s.x - x;
					h_left = s.x + s.width - h_width;
				} else {
					h_width = 0;
				}

				// If moving far enough right/left, just erase entire sprite

				if (h_width >= s.width) {
					any = true;
					_private._eraseSprite(s);
				} else {
					// Create v rect

					v_left = s.x;
					v_width = s.width;
					if (y > s.y) // sprite moving down
					{
						v_height = y - s.y;
						v_top = s.y;
					} else if (s.y > y) // sprite moving up
					{
						v_height = s.y - y;
						v_top = s.y + s.height - v_height;
					} else {
						v_height = 0;
					}

					// If moving far enough up/down, just erase entire sprite

					if (v_height >= s.height) {
						any = true;
						_private._eraseSprite(s);
					}

					// Which rects need erasing?
					else if (v_height < 1) // not moving vertically
					{
						any = true;
						_private._eraseSprite(s, h_left, h_top, h_width, h_height);
					} else if (v_width < 1) // not moving horizontally
					{
						any = true;
						_private._eraseSprite(s, v_left, v_top, v_width, v_height);
					} else // Both must be erased
					{
						any = true;
						v_width -= h_width; // trim v_width

						if (x > s.x) // moving right, so move v_left right
						{
							v_left += h_width;
						}

						_private._eraseSprite(s, h_left, h_top, h_width, h_height);
						_private._eraseSprite(s, v_left, v_top, v_width, v_height);
					}
				}
			}

			s.x = x;
			s.y = y;
			s.placed = true;

			if (s.visible) {
				any = true;
				_private._drawSprite(s);
				_private._collisionCheck(s, sprite);
			}

			if (any) {
				_private._gridDraw();
			}
		}

		return {
			x: s.x,
			y: s.y
		};
	}

	// PS.spriteCollide( sprite, exec )
	// Sets/inspects collision function

	PSInterface.spriteCollide = function (sprite, execP) {
		var fn, args, s, exec, type;

		fn = "[PS.spriteCollide] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 1, 2))
			return PS.ERROR;

		s = _private._getSprite(sprite, fn);
		if (s === PS.ERROR) {
			return PS.ERROR;
		}

		exec = execP; // avoid arg mutation
		type = _private._typeOf(exec);
		if ((type !== "undefined") && (exec !== PS.CURRENT)) {
			if (exec === PS.DEFAULT) {
				exec = null;
			} else if (type !== "function") {
				return _private._error(fn + "exec argument not a function");
			}

			if (s.collide !== exec) {
				s.collide = exec;
				if (exec && s.visible && s.placed) {
					_private._collisionCheck(s, sprite);
				}
			}
		}

		return s.collide;
	}

	// PS.spriteDelete( sprite)
	// Deletes a sprite

	PSInterface.spriteDelete = function (sprite) {
		var fn, args, len, i, s;

		fn = "[PS.spriteDelete] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 1, 1))
			return PS.ERROR;

		if ((typeof sprite !== "string") || (sprite.length < 1)) {
			return _private._error(fn + "sprite argument invalid");
		}

		// Find the sprite object and index

		len = _private._sprites.length;
		for (i = 0; i < len; i += 1) {
			s = _private._sprites[i];
			if (s.id === sprite) {
				_private._eraseSprite(s);
				_private._sprites.splice(i, 1);
				_private._gridDraw();
				return PS.DONE;
			}
		}

		return _private._error(fn + "sprite id '" + sprite + "' not found");
	}

	//----------------
	// AUDIO FUNCTIONS
	//----------------

	// PS.audioLoad()
	// Loads a library sound and assigns a buffer
	// REQUIRED [filename] is the name of a library sound
	// OPTIONAL [params] is an object with the following optional properties:
	// .path (default: engine default) = full path of file (without filename), case sensitive
	// .fileTypes (default: engine default) = array of file type strings in order of preference
	// .autoplay (default: false) = true if file should be played immediately
	// .volume (default: engine default) = initial volume for channel
	// .loop (default: false) = true if channel should loop when played
	// .onLoad (default: null) = function to call when audio is done loading, with .data as parameter
	// .onEnd (default: null) = function to call when audio ends, with .data as parameter
	// .data (default: name) = data that will be passed as parameter to .onLoad/.onEnd functions if present
	// .lock (default: false) = true to lock channel
	// Returns channel id or PS.ERROR

	PSInterface.audioLoad = function (filename, params) {
		var fn, result;

		fn = "[PS.audioLoad] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 1, 2))
			return PS.ERROR;

		result = AQ.load(filename, params);
		if (result === AQ.ERROR) {
			return PS.ERROR;
		}
		return result.channel;
	}

	// PS.audioPlay()
	// Loads a library sound, assigns a buffer and plays it
	// REQUIRED [name] is the name of a library sound
	// OPTIONAL [params] is an object with the following optional properties:
	// .path (default: engine default) = full path of file (without filename), case sensitive
	// .fileTypes (default: engine default) = array of file type strings in order of preference
	// .volume (default: engine default) = initial volume for channel
	// .loop (default: false) = true if channel should loop when played
	// .onEnd (default: null) = function to call when audio ends, with .data as parameter
	// .data (default: name) = data that will be passed as parameter to .onLoad and .onEnd functions if present
	// .lock (default: false) = true to lock channel
	// Returns channel id or PS.ERROR

	PSInterface.audioPlay = function (filename_p, params_p) {
		var fn, args, filename, params, type, result;

		fn = "[PS.audioPlay] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 1, 2))
			return PS.ERROR;

		// Prevent arg mutation

		filename = filename_p;
		params = params_p;

		type = _private._typeOf(params);
		if (type === "undefined") {
			params = {};
		} else if (type !== "object") {
			return _private._error(fn + "params argument invalid");
		}

		params.autoplay = true; // force immediate playback

		result = AQ.load(filename, params);
		if (result === AQ.ERROR) {
			return PS.ERROR;
		}
		return result.channel;
	}

	// PS.audioPause()
	// Toggles pause on an audio channel
	// [channel] is a channel id
	// Returns channel id on success, PS.ERROR on error

	PSInterface.audioPause = function (channel_id) {
		var fn, args, result;

		fn = "[PS.audioPause] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 1, 1))
			return PS.ERROR;

		result = AQ.pause(channel_id);
		if (result === AQ.ERROR) {
			return PS.ERROR;
		}
		return result;
	}

	// PS.audioStop()
	// Stops a playing audio channel
	// [channel] is a channel id
	// Returns channel id on success, PS.ERROR on error

	PSInterface.audioStop = function (channel_id) {
		var fn, args, result;

		fn = "[PS.audioStop] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 1, 1))
			return PS.ERROR;

		result = AQ.stop(channel_id);
		if (result === AQ.ERROR) {
			return PS.ERROR;
		}
		if (result === AQ.DONE) {
			return PS.DONE;
		}
		return result;
	}

	// PS.piano ( val, flag )
	// Returns filename of indexed piano note
	// [val] is index
	// Optional [flag] specifies long version

	PSInterface.piano = function (val_p, flag_p) {
		var fn, len, type, val, flag, str;

		fn = "[PS.piano] ";
		len = _private._PIANO_FILES.length;

		val = val_p; // avoid arg mutation;
		type = _private._typeOf(val);
		if (type !== "number") {
			return _private._error(fn + "index argument invalid");
		}
		val = Math.floor(val);
		if (val < 1) {
			val = 1;
		} else if (val > len) {
			val = len;
		}

		flag = flag_p; // avoid arg mutation
		if ((flag !== true) && (flag !== false)) {
			type = _private._typeOf(flag);
			if (type === "undefined") {
				flag = false;
			} else if (type !== "number") {
				return _private._error(fn + "flag argument invalid");
			}
		}

		str = "piano_" + _private._PIANO_FILES[val - 1];
		if (flag) {
			str = "l_" + str;
		}
		return str;
	}

	// PS.harpsichord ( val, flag )
	// Returns filename of indexed harpsichord note
	// [val] is index
	// Optional [flag] specifies long version

	PSInterface.harpsichord = function (val_p, flag_p) {
		var fn, len, type, val, flag, str;

		fn = "[PS.harpsichord] ";
		len = _private._HCHORD_FILES.length;

		val = val_p; // avoid arg mutation;
		type = _private._typeOf(val);
		if (type !== "number") {
			return _private._error(fn + "index argument invalid");
		}
		val = Math.floor(val);
		if (val < 1) {
			val = 1;
		} else if (val > len) {
			val = len;
		}

		flag = flag_p; // avoid arg mutation
		if ((flag !== true) && (flag !== false)) {
			type = _private._typeOf(flag);
			if (type === "undefined") {
				flag = false;
			} else if (type !== "number") {
				return _private._error(fn + "flag argument invalid");
			}
		}

		str = "hchord_" + _private._HCHORD_FILES[val - 1];
		if (flag) {
			str = "l_" + str;
		}
		return str;
	}

	// PS.xylophone ( val )
	// Returns filename of indexed xylophone note
	// [val] is index

	PSInterface.xylophone = function (val_p) {
		var fn, len, type, val, str;

		fn = "[PS.xylophone] ";
		len = _private._XYLO_FILES.length;

		val = val_p; // avoid arg mutation;
		type = _private._typeOf(val);
		if (type !== "number") {
			return _private._error(fn + "index argument invalid");
		}
		val = Math.floor(val);
		if (val < 1) {
			val = 1;
		} else if (val > len) {
			val = len;
		}

		str = "xylo_" + _private._XYLO_FILES[val - 1];
		return str;
	}

	//-------------------
	// DEBUGGER FUNCTIONS
	//-------------------

	// Add line to debugger (does not include CR)
	// Returns PS.DONE, or PS.ERROR on param error

	PSInterface.debug = function (textP) {
		var fn, text, type, e;

		fn = "[PS.debug] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 0, 1))
			return PS.ERROR;

		text = textP; // prevent arg mutation
		type = _private._typeOf(text);
		if (type === "undefined") {
			text = "";
		} else if (type !== "string") {
			text = text.toString();
		}

		_private._debugOpen();

		if (text.length > 0) {
			e = document.getElementById(_private._MONITOR_ID);
			e.value += text; // append string

			e.scrollTop = e.scrollHeight; // keep it scrolled down
		}

		_private._scrollDown();

		return PS.DONE;
	}

	// Close debugger div
	// Returns PS.DONE

	PSInterface.debugClose = function () {
		var fn, e;

		fn = "[PS.debugClose] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 0, 0))
			return PS.ERROR;

		e = document.getElementById(_private._DEBUG_ID);
		e.style.display = "none";
		_private._debugging = false;

		return PS.DONE;
	}

	// Clear monitor
	// Returns PS.DONE

	PSInterface.debugClear = function () {
		var fn, e;

		fn = "[PS.debugClear] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 0, 0))
			return PS.ERROR;

		e = document.getElementById(_private._MONITOR_ID);
		e.value = "";

		return PS.DONE;
	}

	//----------------
	// PATHFINDING API
	//----------------

	// PS.pathMap ( image )
	// Takes an image and returns a pathmap id for PS.pathFind()

	PSInterface.line = function (x1_p, y1_p, x2_p, y2_p) {
		var fn, args, x1, y1, x2, y2, path;

		fn = "[PS.line] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 4, 4))
			return PS.ERROR;

		// Prevent arg mutation

		x1 = x1_p;
		y1 = y1_p;
		x2 = x2_p;
		y2 = y2_p;

		// Check x1

		if (_private._typeOf(x1) === "number") {
			x1 = Math.floor(x1);
		} else {
			return _private._error(fn + "x1 argument not a number");
		}

		// Check y1

		if (_private._typeOf(y1) === "number") {
			y1 = Math.floor(y1);
		} else {
			return _private._error(fn + "y1 argument not a number");
		}

		// Check x2

		if (_private._typeOf(x2) === "number") {
			x2 = Math.floor(x2);
		} else {
			return _private._error(fn + "x2 argument not a number");
		}

		// Check y2

		if (_private._typeOf(y2) === "number") {
			y2 = Math.floor(y2);
		} else {
			return _private._error(fn + "y2 argument not a number");
		}

		path = _private._line(x1, y1, x2, y2);
		return path;
	}

	// PS.pathMap ( image )
	// Takes an image and returns a pathmap id for PS.pathFind()

	PSInterface.pathMap = function (image) {
		var fn, args, pm;

		fn = "[PS.pathMap] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 1, 1))
			return PS.ERROR;

		// Check image

		if (_private._validImage(fn, image) === PS.ERROR) {
			return PS.ERROR;
		}
		if (image.pixelSize !== 1) {
			return _private._error(fn + "image is not format 1");
		}

		pm = _private._newMap(image.width, image.height, image.data);

		return pm.id;
	}

	// pathFind = function ( pathmap, x1, y1, x2, y2 )
	// Takes pathmap id, start and end coordinates
	// Returns an array of [ x, y ] pairs representing path points

	PSInterface.pathFind = function (pathmap_p, x1_p, y1_p, x2_p, y2_p, options_p) {
		var fn, args, pathmap, x1, y1, x2, y2, options, pm, type, path, val, no_diagonals, cut_corners;

		fn = "[PS.pathFind] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 5, 6))
			return PS.ERROR;

		// Prevent arg mutation

		pathmap = pathmap_p;
		x1 = x1_p;
		y1 = y1_p;
		x2 = x2_p;
		y2 = y2_p;
		options = options_p;

		// Check id

		if ((typeof pathmap !== "string") || (pathmap.length < 1)) {
			return _private._error(fn + "pathmap argument invalid");
		}

		pm = _private._getMap(pathmap);
		if (!pm) {
			return _private._error(fn + pathmap + " not found");
		}

		// Check x1

		if (_private._typeOf(x1) === "number") {
			x1 = Math.floor(x1);
			if ((x1 < 0) || (x1 >= pm.width)) {
				return _private._error(fn + "x1 argument is outside " + pathmap);
			}
		} else {
			return _private._error(fn + "x1 argument not a number");
		}

		// Check y1

		if (_private._typeOf(y1) === "number") {
			y1 = Math.floor(y1);
			if ((y1 < 0) || (y1 >= pm.height)) {
				return _private._error(fn + "y1 argument is outside " + pathmap);
			}
		} else {
			return _private._error(fn + "y1 argument not a number");
		}

		// Check x2

		if (_private._typeOf(x2) === "number") {
			x2 = Math.floor(x2);
			if ((x2 < 0) || (x2 >= pm.width)) {
				return _private._error(fn + "x2 argument is outside " + pathmap);
			}
		} else {
			return _private._error(fn + "x2 argument not a number");
		}

		// Check y2

		if (_private._typeOf(y2) === "number") {
			y2 = Math.floor(y2);
			if ((y2 < 0) || (y2 >= pm.height)) {
				return _private._error(fn + "y2 argument is outside " + pathmap);
			}
		} else {
			return _private._error(fn + "y2 argument not a number");
		}

		// Assume default options

		no_diagonals = false;
		cut_corners = false;

		// Check options

		type = _private._typeOf(options);
		if ((type !== "undefined") && (options !== PS.DEFAULT)) {
			if (type !== "object") {
				return _private._error(fn + "options argument invalid");
			}

			// Check .no_diagonals

			val = options.no_diagonals;
			if ((val === true) || (val === false)) {
				no_diagonals = val;
			} else {
				type = _private._typeOf(val);
				if ((type === "undefined") || (val === PS.DEFAULT)) {
					no_diagonals = false;
				} else if (type === "number") {
					no_diagonals = (val !== 0);
				} else {
					return _private._error(fn + "options.no_diagonals invalid");
				}
			}

			// Check .cut_corners

			val = options.cut_corners;
			if ((val === true) || (val === false)) {
				cut_corners = val;
			} else {
				type = _private._typeOf(val);
				if ((type === "undefined") || (val === PS.DEFAULT)) {
					cut_corners = false;
				} else if (type === "number") {
					cut_corners = (val !== 0);
				} else {
					return _private._error(fn + "options.cut_corners invalid");
				}
			}
		}

		path = _private._findPath(pm, x1, y1, x2, y2, no_diagonals, cut_corners);
		return path;
	}

	// pathData = function ( id, left, top, width, height, data )
	// Takes pathmap id and region coordinates, sets/inspects using data
	// Returns an array of data at coordinates

	PSInterface.pathData = function (pathmap_p, left_p, top_p, width_p, height_p, data_p) {
		var fn, args, pathmap, left, top, width, height, data, pm, max, type, result;

		fn = "[PS.pathData] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 5, 6))
			return PS.ERROR;

		// Prevent arg mutation

		pathmap = pathmap_p;
		left = left_p;
		top = top_p;
		width = width_p;
		height = height_p;
		data = data_p;

		// Check id

		if ((typeof pathmap !== "string") || (pathmap.length < 1)) {
			return _private._error(fn + "pathmap argument invalid");
		}

		pm = _private._getMap(pathmap);
		if (!pm) {
			return _private._error(fn + pathmap + " not found");
		}

		// Check left

		if (_private._typeOf(left) === "number") {
			left = Math.floor(left);
			if ((left < 0) || (left >= pm.width)) {
				return _private._error(fn + "left argument is outside " + pathmap);
			}
		} else {
			return _private._error(fn + "left argument not a number");
		}

		// Check top

		if (_private._typeOf(top) === "number") {
			top = Math.floor(top);
			if ((top < 0) || (top >= pm.height)) {
				return _private._error(fn + "top argument is outside " + pathmap);
			}
		} else {
			return _private._error(fn + "top argument not a number");
		}

		// Check width

		if (width === PS.DEFAULT) {
			width = 1;
		} else if (_private._typeOf(width) === "number") {
			width = Math.floor(width);
			if (width < 1) {
				width = 1;
			} else {
				max = pm.width - left;
				if (width > max) {
					width = max;
				}
			}
		} else {
			return _private._error(fn + "width argument not a number");
		}

		// Check height

		if (height === PS.DEFAULT) {
			height = 1;
		} else if (_private._typeOf(height) === "number") {
			height = Math.floor(height);
			if (height < 1) {
				height = 1;
			} else {
				max = pm.height - top;
				if (height > max) {
					height = max;
				}
			}
		} else {
			return _private._error(fn + "height argument not a number");
		}

		// Check data

		if ((data !== PS.DEFAULT) && (data !== PS.CURRENT)) {
			type = _private._typeOf(data);
			if (type === "undefined") {
				data = PS.CURRENT;
			} else if (type === "number") {
				if (data < 0) {
					return _private._error(fn + "data argument < 0");
				}
			} else {
				return _private._error(fn + "data argument not a number");
			}
		}

		result = _private._pathData(pm, left, top, width, height, data);
		return result;
	}

	// pathDelete: function ( pathmap )
	// Deletes pathmap
	// Returns PS.DONE or PS.ERROR

	PSInterface.pathDelete = function (pathmap) {
		var fn, args;

		fn = "[PS.pathDelete] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 1, 1))
			return PS.ERROR;

		// Check pathmap id

		if ((typeof pathmap !== "string") || (pathmap.length < 1)) {
			return _private._error(fn + "pathmap argument invalid");
		}

		if (!_private._deleteMap(pathmap)) {
			return _private._error(fn + pathmap + " not found");
		}

		return PS.DONE;
	}

	PSInterface.pathNear = function (pathmap, x1, y1, x2, y2) {
		var fn, args, pm, result;

		fn = "[PS.pathNear] ";

		if (PS.ERROR == _private._checkNumArgs(fn, arguments.length, 5, 5))
			return PS.ERROR;

		// Check pathmap id

		if ((typeof pathmap !== "string") || (pathmap.length < 1)) {
			return _private._error(fn + "pathmap argument invalid");
		}

		pm = _private._getMap(pathmap);
		if (!pm) {
			return _private._error(fn + pathmap + " not found");
		}

		result = _private._pathNear(pm, x1, y1, x2, y2);
		return result;
	}

	return my;
}(PERLENSPIEL || {}));

/*	http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html

	Any file can set properties on their local variable _private. and it will be
	immediately available to the others. Once this module has loaded completely,
	the application should call MODULE._seal(), which will prevent external access
	to the internal _private. If this module were to be augmented again, further in
	the application’s lifetime, one of the internal methods, in any file, can call
	_private._unseal() before loading the new file, and call _private._seal() again after it has been
	executed. This pattern occurred to me today while I was at work, I have not seen
	this elsewhere. I think this is a very useful pattern, and would have been worth
	writing about all on its own.
*/