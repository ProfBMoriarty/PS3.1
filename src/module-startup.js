// Perlenspiel Startup Module

// Includes:
// + Engine startup and shutdown

/*jslint nomen: true, white: true, vars: true */
/*global document, window, screen, console, Image, AQ, PIXI, PERLENSPIEL, PS */

var PerlenspielStartup = function (my) {
    "use strict";

	////////////////////////////////////////
	// Public methods

	// Start the engine

	my.PSInterface.prototype.start = function ( ) {
		my._sys();
		my._psObject.started = true;
		PERLENSPIEL.OnStartInstance(my._psObject);
	};

	// Shut down the engine

	my.PSInterface.prototype.shutdown = function () {
		console.info("Deactivating " + my._grid.canvas.id);
		my._clockActive = false;
		my._psObject.started = false;
		PERLENSPIEL.OnStopInstance(my._psObject);
		my._gridDeactivate();
	};

	// Set engine options

	my.PSInterface.prototype.setOptions = function (options) {
		// Options
		my._options = options || {};

		my._setNamespace(my._options.namespace || PS.DEFAULT_NAMESPACE);

		// Instance-specific state
		my._lastTick = 0;

		// Copy the Perlenspiel constants into this object
		my.provideConstants(this);

		my._optionsSet = true;
	};

	////////////////////////////////////////
	// Private methods

	// Engine initializer

	my._sys = function () {
		var fn, i, outer, debug, sp, snode, ip, inode, span, input, grid, footer, monitor, ctx, cnt, bead, aq, result, str;

		fn = "[PS.sys] ";

		// Precalculate color string tables

		my._RSTR = [];
		my._RSTR.length = 256;

		my._GBSTR = [];
		my._GBSTR.length = 256;

		my._BASTR = [];
		my._BASTR.length = 256;

		my._ASTR = [];
		my._ASTR.length = 256;

		for (i = 0; i < 256; i += 1) {
			my._RSTR[i] = "rgba(" + i + ",";
			my._GBSTR[i] = i + ",";
			my._BASTR[i] = i + ",1)";
			cnt = Math.floor((my._ALPHOID * i) * 1000) / 1000;
			my._ASTR[i] = cnt + ")";
		}

		my._systemDetect();

		// calc device scaling

		my._deviceScaling = screen.width / document.documentElement.clientWidth;

		// detect touch events

		my._touchScreen = my._hasTouch();
		my._system.inputs.touch = my._touchScreen;

		// Set up DOM elements

		document.body.id = "body";
		// set browser background (if not in multispiel mode)
		if (my._NAMESPACE === my.instance.DEFAULT_NAMESPACE)
			document.body.style.backgroundColor = my._DEFAULTS.grid.color.str;

		// Remove font loading div if it exists

		my._init = document.getElementById(my._INIT_ID);
		if (my._init) {
			my._init.parentNode.removeChild(my._init);
		}

		// Create outer/main divs

		outer = document.getElementById(my._NAMESPACE);
		if (!outer) {
			outer = document.createElement("div");
			document.body.appendChild(outer);
			if (!outer)
				return console.error("No outer div!");
		}
		outer.id = my._OUTER_ID;
		outer.tabindex = 12;
		outer.className = my._OUTER_CLASS;
		outer.style.backgroundColor = my._DEFAULTS.grid.color.str;

		my._main = document.createElement("div");
		if (!my._main)
			return console.error("No main div!");
		my._main.id = my._MAIN_ID;
		my._main.className = my._MAIN_CLASS;
		outer.appendChild(my._main);

		// save offset coordinates
		// Create status line paragraph

		sp = document.createElement("p");
		sp.id = my._STATUS_P_ID; // use id for styling
		sp.className = my._STATUS_P_CLASS; // use class for styling
		sp.style.whiteSpace = "nowrap"; // limits to one line
		sp.style.display = "block"; // initially visible
		snode = document.createTextNode(".");
		sp.appendChild(snode);
		my._main.appendChild(sp);

		// Create input box paragraph, label and input box

		ip = document.createElement("p"); // paragraph for input box
		ip.id = my._INPUT_P_ID; // use id for styling
		ip.className = my._INPUT_P_CLASS; // use id for styling
		ip.style.display = "none"; // initially hidden

		span = document.createElement("span"); // span for label
		span.id = my._INPUT_LABEL_ID; // use id for styling
		span.className = my._INPUT_LABEL_CLASS; // use class for styling
		inode = document.createTextNode(""); // textNode for label
		span.appendChild(inode); // add node to span
		ip.appendChild(span); // add span to paragraph

		span = document.createElement("span"); // span for input box
		span.id = my._INPUT_SPAN_ID; // use id for styling
		span.className = my._INPUT_SPAN_CLASS; // use class for styling
		input = document.createElement("input"); // actual input box
		input.id = my._INPUT_BOX_ID; // use id for styling
		input.className = my._INPUT_BOX_CLASS; // use class for styling
		input.type = "text";
		input.tabindex = 0;
		input.wrap = "soft";
		span.appendChild(input); // add box to span
		ip.appendChild(span); // add span to paragraph
		my._main.appendChild(ip); // add paragraph to main

		// init status line

		my._status = {
			statusP: sp,
			statusNode: snode,
			inputP: ip,
			inputNode: inode,
			input: input,
			fader: my._newFader(my._STATUS_P_ID, my._statusRGB, null)
		};

		my._copy(my._DEFAULTS.status, my._status); // copy default properties
		my._statusOut("Perlenspiel 3.1");

		// Create grid canvas

		grid = document.createElement("canvas");
		if (!grid) {
			window.alert(fn + "HTML5 canvas not supported.");
			return;
		}
		grid.id = my._GRID_ID;
		grid.className = my._GRID_CLASS;
		grid.width = my._CLIENT_SIZE;
		grid.style.backgroundColor = my._DEFAULTS.grid.color.str;
		grid.style.boxShadow = "none";
        grid.tabIndex = "1";

		my._overGrid = false;
		my._resetCursor();
		my._main.appendChild(grid);

		/*
		// Create grid PIXI stage/renderer

		var stage = new PIXI.Stage( my._DEFAULTS.grid.color.rgb );
		var renderer = PIXI.autoDetectRenderer( my._CLIENT_SIZE, my._CLIENT_SIZE );
		renderer.view.id = my._GRID_ID;
		renderer.style.boxShadow = "none";
		my._overGrid = false;
		my._resetCursor();
		my._main.appendChild( renderer.view );
		*/

		// Footer, append to main

		footer = document.createElement("p");
		if (!footer)
			return console.error("No footer p!");
		footer.id = my._FOOTER_ID;
		footer.className = my._FOOTER_CLASS;
		footer.style.opacity = "1.0";
		footer.innerHTML = "Loading Perlenspiel";
		my._main.appendChild(footer);
		my._footer = footer;

		// Debug div

		debug = document.createElement("div");
		if (!debug)
			return console.error("No debug div!");
		debug.id = my._DEBUG_ID;
		debug.className = my._DEBUG_CLASS;
		my._main.appendChild(debug);

		// Monitor, append to debug

		monitor = document.createElement("textarea");
		if (!monitor)
			return console.error("No monitor textarea!");
		monitor.id = my._MONITOR_ID;
		monitor.className = my._MONITOR_CLASS;
		monitor.rows = 8;
		monitor.wrap = "soft";
		monitor.readonly = "readonly";
		monitor.onfocus = function () {
			my._debugFocus = true;
		};
		monitor.onblur = function () {
			my._debugFocus = false;
		};
		debug.appendChild(monitor);

		my._debugging = false;
		my._debugFocus = false;

		// Init keypress variables and arrays

		my._keysActive = false;
		my._pressed = [];
		my._transKeys = [];
		my._shiftedKeys = [];
		my._unshiftedKeys = [];

		for (i = 0; i < 256; i += 1) {
			my._pressed[i] = 0;
			my._transKeys[i] = i;
			my._shiftedKeys[i] = i;
			my._unshiftedKeys[i] = i;
		}

		my._holding = [];
		my._holdShift = false;
		my._holdCtrl = false;
		my._holdAlt = false;

		my._keyRepeat = true;
		my._keyDelayRate = my._DEFAULT_KEY_DELAY;
		my._keyInitRate = my._DEFAULT_KEY_DELAY * 5;

		// Modify my._transKeys for weird translations

		my._transKeys[33] = PS.KEY_PAGE_UP;
		my._transKeys[34] = PS.KEY_PAGE_DOWN;
		my._transKeys[35] = PS.KEY_END;
		my._transKeys[36] = PS.KEY_HOME;
		my._transKeys[37] = PS.KEY_ARROW_LEFT;
		my._transKeys[38] = PS.KEY_ARROW_UP;
		my._transKeys[39] = PS.KEY_ARROW_RIGHT;
		my._transKeys[40] = PS.KEY_ARROW_DOWN;
		my._transKeys[45] = PS.KEY_INSERT;
		my._transKeys[46] = PS.KEY_DELETE;

		/*
		 my._transKeys[ 12 ] = PS.KEY_PAD_5;
		 my._transKeys[ 33 ] = PS.KEY_PAD_9;
		 my._transKeys[ 34 ] = PS.KEY_PAD_3;
		 my._transKeys[ 35 ] = PS.KEY_PAD_1;
		 my._transKeys[ 36 ] = PS.KEY_PAD_7;
		 my._transKeys[ 37 ] = PS.KEY_PAD_4;
		 my._transKeys[ 38 ] = PS.KEY_PAD_8;
		 my._transKeys[ 39 ] = PS.KEY_PAD_6;
		 my._transKeys[ 40 ] = PS.KEY_PAD_2;
		 my._transKeys[ 45 ] = PS.KEY_PAD_0;
		 my._transKeys[ 46 ] = PS.KEY_DELETE;
		 my._transKeys[ 110 ] = PS.KEY_DELETE;
		 */

		my._transKeys[188] = 44; // ,
		my._transKeys[190] = 46; // .
		my._transKeys[191] = 47; // /
		my._transKeys[192] = 96; // `
		my._transKeys[219] = 91; // [
		my._transKeys[220] = 92; // \
		my._transKeys[221] = 93; // ]
		my._transKeys[222] = 39; // '

		// Modify shiftedKeys for translation

		my._shiftedKeys[96] = 126; // ` to ~
		my._shiftedKeys[49] = 33; // 1 to !
		my._shiftedKeys[50] = 64; // 2 to @
		my._shiftedKeys[51] = 35; // 3 to #
		my._shiftedKeys[52] = 36; // 4 to $
		my._shiftedKeys[53] = 37; // 5 to %
		my._shiftedKeys[54] = 94; // 6 to ^
		my._shiftedKeys[55] = 38; // 7 to &
		my._shiftedKeys[56] = 42; // 8 to *
		my._shiftedKeys[57] = 40; // 9 to (
		my._shiftedKeys[48] = 41; // 0 to )
		my._shiftedKeys[45] = 95; // - to my._
		my._shiftedKeys[61] = 43; // = to +
		my._shiftedKeys[91] = 123; // [ to {
		my._shiftedKeys[93] = 125; // ] to }
		my._shiftedKeys[92] = 124; // \ to |
		my._shiftedKeys[59] = 58; // ; to :
		my._shiftedKeys[39] = 34; // ' to "
		my._shiftedKeys[44] = 60; // , to <
		my._shiftedKeys[46] = 62; // . to >
		my._shiftedKeys[47] = 63; // / to ?

		// Modify my._unshiftedKeys for  translations

		for (i = 65; i < 91; i += 1) // convert upper-case alpha to lower
		{
			my._unshiftedKeys[i] = i + 32;
		}

		my._unshiftedKeys[126] = 96; // ` to ~
		my._unshiftedKeys[33] = 49; // 1 to !
		my._unshiftedKeys[64] = 50; // 2 to @
		my._unshiftedKeys[35] = 51; // 3 to #
		my._unshiftedKeys[36] = 52; // 4 to $
		my._unshiftedKeys[37] = 53; // 5 to %
		my._unshiftedKeys[94] = 54; // 6 to ^
		my._unshiftedKeys[38] = 55; // 7 to &
		my._unshiftedKeys[42] = 56; // 8 to *
		my._unshiftedKeys[40] = 57; // 9 to (
		my._unshiftedKeys[41] = 48; // 0 to )
		my._unshiftedKeys[95] = 45; // - to my._
		my._unshiftedKeys[43] = 51; // = to +
		my._unshiftedKeys[123] = 91; // [ to {
		my._unshiftedKeys[125] = 93; // ] to }
		my._unshiftedKeys[124] = 92; // \ to |
		my._unshiftedKeys[58] = 59; // ; to :
		my._unshiftedKeys[34] = 39; // ' to "
		my._unshiftedKeys[60] = 44; // , to <
		my._unshiftedKeys[62] = 46; // . to >
		my._unshiftedKeys[63] = 47; // / to ?

		// clear keypress record if window loses focus

		window.onblur = my._keyReset();

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

				if (my._system.host.app === "Opera") {
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
		my._grid = {
			canvas: grid,
			context: ctx,
			fader: my._newFader(my._GRID_ID, my._gridRGB, my._gridRGBEnd),
			focused: false
		};

		// copy default properties
		my._copy(my._DEFAULTS.grid, my._grid);

		// Calculate canvas padding for mouse offset (Mark Diehr)
		var canvasStyle = window.getComputedStyle(my._grid.canvas, null);
		my._grid.padLeft = parseInt(canvasStyle.getPropertyValue('padding-top').replace("px", ""), 10);
		my._grid.padRight = parseInt(canvasStyle.getPropertyValue('padding-left').replace("px", ""), 10);

		// Set up master 32 x 32 bead array

		my._beads = [];
		my._beads.length = cnt = my._MAX_BEADS;
		for (i = 0; i < cnt; i += 1) {
			// init bead table

			bead = {
				index: i,
				fader: my._newFader(i, my._beadRGBA, null),
				borderFader: my._newFader(i, my._borderRGBA, null),
				glyphFader: my._newFader(i, my._glyphRGBA, null)
			};

			my._resetBead(bead);

			my._beads[i] = bead;
		}

		// Init sprite engine

		my._sprites = [];
		my._spriteCnt = 0;

		// Init pathfinder engine

		my._pathmaps = [];
		my._pathmapCnt = 0;

		// init audio system if not running iOS

		aq = null;
		if (my._system.host.os !== "iOS") {
			aq = AQ.init({
				defaultPath: my._DEFAULTS.audio.path,
				defaultFileTypes: ["ogg", "mp3", "wav"],
				onAlert: my.instance.debug,
				stack: true,
				forceHTML5: true // never use Web Audio; sigh
			});
			if ((aq === PS.ERROR) || (aq.status === AQ.ERROR)) {
				return;
			}

			my._system.audio = aq; // copy audio specs into system

			// load and lock error sound

			my._errorSound = null;
			result = my.instance.audioLoad(my._DEFAULTS.audio.error_sound, {
				path: my._DEFAULTS.audio.path,
				lock: true
			});
			if (result === PS.ERROR) {
				my._warning("Error sound '" + my._DEFAULTS.audio.error_sound + "' not loaded");
			} else {
				my._errorSound = my._DEFAULTS.audio.error_sound;
			}
		}

		// Create offscreen canvas for image manipulation

		my._imageCanvas = document.createElement("canvas");
		ctx = my._imageCanvas.getContext("2d");
		ctx.imageSmoothingEnabled = false;
		ctx.mozImageSmoothingEnabled = false;
		ctx.webkitImageSmoothingEnabled = false;

		// Init image loading list

		my._imageList = [];
		my._imageCnt = 0;

		// Make sure all required user functions exist

		str = "() event function undefined";

		if (typeof my.instance.init !== "function") {
			my.instance.init = null;
			my._warning("PS.init" + str);
		}

		if (typeof my.instance.touch !== "function") {
			my.instance.touch = null;
			my._warning("PS.touch" + str);
		}

		if (typeof my.instance.release !== "function") {
			my.instance.release = null;
			my._warning("PS.release" + str);
		}

		if (typeof my.instance.enter !== "function") {
			my.instance.enter = null;
			my._warning("PS.enter" + str);
		}

		if (typeof my.instance.exit !== "function") {
			my.instance.exit = null;
			my._warning("PS.exit()" + str);
		}

		if (typeof my.instance.exitGrid !== "function") {
			my.instance.exitGrid = null;
			my._warning("PS.exitGrid" + str);
		}

		if (typeof my.instance.keyDown !== "function") {
			my.instance.keyDown = null;
			my._warning("PS.keyDown" + str);
		}

		if (typeof my.instance.keyUp !== "function") {
			my.instance.keyUp = null;
			my._warning("PS.keyUp" + str);
		}

		if (typeof my.instance.input !== "function") {
			my.instance.input = null;
			my._warning("PS.input" + str);
		}

		// set up footer

		str = "PS " + my._system.major + "." + my._system.minor + "." + my._system.revision + " | ";
		if (aq) // not set for iOS
		{
			str += (aq.engine + " " + aq.major + "." + aq.minor + "." + aq.revision + " | ");
		}
		str += my._system.host.os + " " + my._system.host.app + " " + my._system.host.version;
		if (my._touchScreen) {
			str += (" | Touch ");
		}

		footer.innerHTML = str;

		// Set up default grid & grid color

		my._gridSize(my._DEFAULTS.grid.x, my._DEFAULTS.grid.y);

		//	Init fader and timer engines, start the global clock

		my._initFaders();
		my._initTimers();

		my._clockActive = true;
		my._clock();

		// Init all event listeners
		my._keysActivate();
		my._gridActivate();

		my._footerTimer = my.instance.timerStart(6, my._footerFade);

		if (my.instance.init) {
			// Call user initializer

			try {
				my.instance.init(my._system, my._EMPTY);
				my._gridDraw();
			} catch (err) {
				my._errorCatch("PS.init() failed [" + err.message + "]", err);
			}
		}
	};

	my._clock = function () {
		if (my._clockActive) {
			window.requestAnimationFrame(my._clock);
			my._tick();
		}
	};

	return my;
};

// Register with global PERLENSPIEL manager
PERLENSPIEL.RegisterModule(PerlenspielStartup);
