// init.js
// The following comments are for JSLint

/*jslint nomen: true, white: true, vars: true */
/*global document, window, screen, console, Image, AQ */

PS = ( function ( ps )
{
	"use strict";

	var _sys = ps._sys = ps._sys || {}; // establish _sys

	var _CLIENT_SIZE = 512; // client size in pixels
	var _ALPHOID = 1.0 / 255; // alpha step constant
	var _MAX_BEADS = 1024; // 32 x 32 maximum bead count
	var _DEFAULT_KEY_DELAY = 6; // key repeat rate (1/10 sec)
	var _KEY_SHIFT = 16; // shift keycode
	var _KEY_CTRL = 17; // ctrl keycode
	var _CLEAR = -1; // flag for not touching or not over a bead

	// Keyboard support

	var _transKeys; // regular key translation array
	var _shiftedKeys; // shifted key translation array
	var _unshiftedKeys; // unshifted key translation array
	var _pressed; // array of keys being pressed
	var _holding; // array of keys being held down
	var _holdShift; // true if shift is held down
	var _holdCtrl; // true if ctrl key is held down

	// Key delay control

	var _keyRepeat; // true for key repeat
	var _keyDelay; // delay countdown
	var _keyDelayRate; // key delay rate
	var _keyInitRate; // initial key delay rate

	// Touch support

	var _touchScreen; // true if platform uses touch
	var _deviceScaling; // needed for annoying mobile browsers with weird scaling


	// Fix for Unicode by Mark Diehr
	// ES6 Unicode Shims 0.1, (C)2012 Steven Levithan <http://slevithan.com/> (MIT License)

	function _newCodePoint ()
	{
		var chars, i, point, offset, units;

		chars = [];
		for ( i = 0; i < arguments.length; i += 1 )
		{
			point = arguments[ i ];
			offset = point - 0x10000;
			units = point > 0xFFFF ? [ 0xD800 + ( offset >> 10 ), 0xDC00 + ( offset & 0x3FF ) ] : [ point ];
			chars.push( String.fromCharCode.apply( null, units ) );
		}
		return chars.join( "" );
	}

	// Return true if browser supports touch events

	function _hasTouch ()
	{
		// return Modernizr.touch;

		try
		{
			document.createEvent( "TouchEvent" );
			return true;
		}
		catch ( e )
		{
			return false;
		}
	}

	// Detect platform and available features

	function _systemDetect ()
	{
		var ua, host, browser, os, version;

		ua = window.navigator.userAgent.toLowerCase();
		host = window.navigator.platform.toLowerCase();

		if ( /firefox/.test( ua ) )
		{
			browser = "Firefox";
			if ( /fennec/.test( ua ) )
			{
				browser += " Mobile";
			}
			version = /firefox\/[\.\d]+/.exec( ua )[0].split( '/' )[ 1 ];
		}
		else if ( /chrome/.test( ua ) )
		{
			browser = "Chrome";
			version = /chrome\/[\d\.]+/.exec( ua )[0].split( '/' )[ 1 ];
		}
		else if ( /safari/.test( ua ) )
		{
			browser = 'Safari';
			if ( ( /iphone/.test( ua ) ) || ( /ipad/.test( ua ) ) || ( /ipod/.test( ua ) ) )
			{
				os = 'iOS';
			}
		}
		else if ( /msie/.test( ua ) )
		{
			browser = "Internet Explorer";
			if ( /iemobile/.test( ua ) )
			{
				browser += " Mobile";
			}
			version = /msie \d+[.]\d+/.exec( ua )[0].split( ' ' )[ 1 ];
		}
		else if ( /opera/.test( ua ) )
		{
			browser = "Opera";
			if ( /mini/.test( ua ) )
			{
				browser += " Mini";
			}
			else if ( /mobile/.test( ua ) )
			{
				browser += " Mobile";
			}
		}
		else if ( /android/.test( ua ) )
		{
			browser = "Android";
			os = /android\s[\.\d]+/.exec( ua );
		}

		if ( !version )
		{
			version = /version\/[\.\d]+/.exec( ua );
			if ( version )
			{
				version = version[0].split( '/' )[ 1 ];
			}
			else
			{
				version = /opera\/[\.\d]+/.exec( ua )[0].split( '/' )[ 1 ];
			}
		}

		if ( ( host === "win32" ) || ( host === "win64" ) )
		{
			os = "Windows";
		}
		else if ( ( host === "macintel" ) || ( host === "macppc" ) )
		{
			os = "Mac OS X ";
			os += /10[\.\_\d]+/.exec( ua )[ 0 ];
			if ( /[\_]/.test( os ) )
			{
				os = os.split( '_' ).join( '.' );
			}
		}

		if ( !os )
		{
			if ( /linux/.test( host ) )
			{
				os = "Linux";
			}
			else if ( /windows/.test( ua ) )
			{
				os = "Windows";
			}
		}

		_sys.gestalt.host.app = browser;
		if ( version )
		{
			_sys.gestalt.host.version = version;
		}
		_sys.gestalt.host.os = os;
	}

	ps._init = function ()
	{
		var fn, errm, i, outer, debug, status, grid, footer, monitor, ctx, cnt, bead, result, str;

		fn = "[PS.sys] ";
		errm = fn + "Invalid element";

		if ( !String.fromCodePoint )
		{
			String.fromCodePoint = _newCodePoint;
		}

		// Precalculate color string tables

		_sys.RSTR = [];
		_sys.RSTR.length = 256;

		_sys.GBSTR = [];
		_sys.GBSTR.length = 256;

		_sys.BASTR = [];
		_sys.BASTR.length = 256;

		_sys.ASTR = [];
		_sys.ASTR.length = 256;

		for ( i = 0; i < 256; i += 1 )
		{
			_sys.RSTR[ i ] = "rgba(" + i + ",";
			_sys.GBSTR[ i ] = i + ",";
			_sys.BASTR[ i ] = i + ",1)";
			cnt = Math.floor( ( _ALPHOID * i ) * 1000 ) / 1000;
			_sys.ASTR[ i ] = cnt + ")";
		}

		_systemDetect();

		// calc device scaling

//		_deviceScaling = 1;
//		if ( typeof window.devicePixelRatio !== "undefined" )
//		{
//			_deviceScaling = window.devicePixelRatio;
//		}

		_deviceScaling = screen.width / document.documentElement.clientWidth;

		// detect touch events

		_touchScreen = _hasTouch();
		_sys.gestalt.inputs.touch = _touchScreen;

		// Set up DOM elements

		// Main div

		document.body.id = "body";
		document.body.style.backgroundColor = _DEFAULTS.grid.color.str;

		outer = document.createElement( "div" );
		if ( !outer )
		{
			window.alert( errm );
			return;
		}
		outer.id = _OUTER_ID;
		document.body.appendChild( outer );

		_main = document.createElement( "div" );
		if ( !_main )
		{
			window.alert( errm );
			return;
		}
		_main.id = _MAIN_ID;
		outer.appendChild( _main );

		// save offset coordinates

		PS._mainLeft = _main.offsetLeft;
		PS._mainTop = _main.offsetTop;

		// Status line, append to main

		status = document.createElement( "input" );
		if ( !status )
		{
			window.alert( errm );
			return;
		}
		status.type = "text";
		status.readonly = "readonly";
		status.onfocus = function ()
		{
			this.blur();
		};
		status.tabindex = -1;
		status.value = "Perlenspiel 3.1";
		status.wrap = "soft";
		status.id = _STATUS_ID;
		_main.appendChild( status );

		// Init network, appends UI divisions to _main

		_net = new Network();

		// Create grid canvas

		grid = document.createElement( "canvas" );
		if ( !grid )
		{
			window.alert( fn + "HTML5 canvas not supported." );
			return;
		}
		grid.id = _GRID_ID;
		grid.width = _CLIENT_SIZE;
		grid.backgroundColor = _DEFAULTS.grid.color.str;

		_overGrid = false;
		_resetCursor();

		_main.appendChild( grid );

		// Footer, append to main

		footer = document.createElement( "p" );
		if ( !footer )
		{
			window.alert( errm );
			return;
		}
		footer.id = _FOOTER_ID;
		footer.innerHTML = "Loading Perlenspiel";
		_main.appendChild( footer );
		_footer = footer;

		// Debug div

		debug = document.createElement( "div" );
		if ( !debug )
		{
			window.alert( errm );
			return;
		}
		debug.id = _DEBUG_ID;
		_main.appendChild( debug );

		// Monitor, append to debug

		monitor = document.createElement( "textarea" );
		if ( !monitor )
		{
			window.alert( errm );
			return;
		}
		monitor.id = _MONITOR_ID;
		monitor.rows = 8;
		monitor.wrap = "soft";
		monitor.readonly = "readonly";
		monitor.onfocus = function ()
		{
			_debugFocus = true;
		};
		monitor.onblur = function ()
		{
			_debugFocus = false;
		};
		debug.appendChild( monitor );

		_debugging = false;
		_debugFocus = false;

		// Init keypress variables and arrays

		_pressed = [];
		_transKeys = [];
		_shiftedKeys = [];
		_unshiftedKeys = [];

		for ( i = 0; i < 256; i += 1 )
		{
			_pressed[ i ] = 0;
			_transKeys[ i ] = i;
			_shiftedKeys[ i ] = i;
			_unshiftedKeys[ i ] = i;
		}

		_holding = [];
		_holdShift = false;
		_holdCtrl = false;

		_keyRepeat = true;
		_keyDelayRate = _DEFAULT_KEY_DELAY;
		_keyInitRate = _DEFAULT_KEY_DELAY * 5;

		// Modify _transKeys for weird translations

		_transKeys[ 33 ] = PS.KEY_PAGE_UP;
		_transKeys[ 34 ] = PS.KEY_PAGE_DOWN;
		_transKeys[ 35 ] = PS.KEY_END;
		_transKeys[ 36 ] = PS.KEY_HOME;
		_transKeys[ 37 ] = PS.KEY_ARROW_LEFT;
		_transKeys[ 38 ] = PS.KEY_ARROW_UP;
		_transKeys[ 39 ] = PS.KEY_ARROW_RIGHT;
		_transKeys[ 40 ] = PS.KEY_ARROW_DOWN;
		_transKeys[ 45 ] = PS.KEY_INSERT;
		_transKeys[ 46 ] = PS.KEY_DELETE;
		_transKeys[ 188 ] = 44; // ,
		_transKeys[ 190 ] = 46; // .
		_transKeys[ 191 ] = 47; // /
		_transKeys[ 192 ] = 96; // `
		_transKeys[ 219 ] = 91; // [
		_transKeys[ 220 ] = 92; // \
		_transKeys[ 221 ] = 93; // ]
		_transKeys[ 222 ] = 39; // '

		// Modify shiftedKeys for translation

		_shiftedKeys[ 96 ] = 126; // ` to ~
		_shiftedKeys[ 49 ] = 33; // 1 to !
		_shiftedKeys[ 50 ] = 64; // 2 to @
		_shiftedKeys[ 51 ] = 35; // 3 to #
		_shiftedKeys[ 52 ] = 36; // 4 to $
		_shiftedKeys[ 53 ] = 37; // 5 to %
		_shiftedKeys[ 54 ] = 94; // 6 to ^
		_shiftedKeys[ 55 ] = 38; // 7 to &
		_shiftedKeys[ 56 ] = 42; // 8 to *
		_shiftedKeys[ 57 ] = 40; // 9 to (
		_shiftedKeys[ 48 ] = 41; // 0 to )
		_shiftedKeys[ 45 ] = 95; // - to _
		_shiftedKeys[ 61 ] = 43; // = to +
		_shiftedKeys[ 91 ] = 123; // [ to {
		_shiftedKeys[ 93 ] = 125; // ] to }
		_shiftedKeys[ 92 ] = 124; // \ to |
		_shiftedKeys[ 59 ] = 58; // ; to :
		_shiftedKeys[ 39 ] = 34; // ' to "
		_shiftedKeys[ 44 ] = 60; // , to <
		_shiftedKeys[ 46 ] = 62; // . to >
		_shiftedKeys[ 47 ] = 63; // / to ?

		// Modify _unshiftedKeys for  translations

		for ( i = 65; i < 91; i += 1 )  // convert upper-case alpha to lower
		{
			_unshiftedKeys[ i ] = i + 32;
		}

		_unshiftedKeys[ 126 ] = 96; // ` to ~
		_unshiftedKeys[ 33 ] = 49; // 1 to !
		_unshiftedKeys[ 64 ] = 50; // 2 to @
		_unshiftedKeys[ 35 ] = 51; // 3 to #
		_unshiftedKeys[ 36 ] = 52; // 4 to $
		_unshiftedKeys[ 37 ] = 53; // 5 to %
		_unshiftedKeys[ 94 ] = 54; // 6 to ^
		_unshiftedKeys[ 38 ] = 55; // 7 to &
		_unshiftedKeys[ 42 ] = 56; // 8 to *
		_unshiftedKeys[ 40 ] = 57; // 9 to (
		_unshiftedKeys[ 41 ] = 48; // 0 to )
		_unshiftedKeys[ 95 ] = 45; // - to _
		_unshiftedKeys[ 43 ] = 51; // = to +
		_unshiftedKeys[ 123 ] = 91; // [ to {
		_unshiftedKeys[ 125 ] = 93; // ] to }
		_unshiftedKeys[ 124 ] = 92; // \ to |
		_unshiftedKeys[ 58 ] = 59; // ; to :
		_unshiftedKeys[ 34 ] = 39; // ' to "
		_unshiftedKeys[ 60 ] = 44; // , to <
		_unshiftedKeys[ 62 ] = 46; // . to >
		_unshiftedKeys[ 63 ] = 47; // / to ?

		// clear keypress record if window loses focus

		window.onblur = function ()
		{
			var x;

			_holding.length = 0;
			_holdShift = false;
			_holdCtrl = false;
			for ( x = 0; x < 256; x += 1 )
			{
				_pressed[ x ] = 0;
			}
		};

		ctx = grid.getContext( "2d" );

		// Add fillRoundedRect method to canvas

		if ( !ctx.constructor.prototype.fillRoundedRect )
		{
			ctx.constructor.prototype.fillRoundedRect = function ( xx, yy, ww, hh, rad, fill, stroke )
			{
				if ( rad === undefined )
				{
					rad = 5;
				}

				this.beginPath();

				// Must draw counterclockwise for Opera!
				// Fix by Mark Diehr

				if ( _system.host.app === "Opera" )
				{
					this.moveTo( xx + ww - rad, yy );
					this.arcTo( xx + rad, yy, xx, yy + rad, rad );
					this.arcTo( xx, yy + hh - rad, xx + rad, yy + hh, rad );
					this.arcTo( xx + ww - rad, yy + hh, xx + ww, yy + hh - rad, rad );
					this.arcTo( xx + ww, yy + rad, xx + ww - rad, yy, rad );
				}
				else
				{
					this.moveTo( xx + rad, yy );
					this.arcTo( xx + ww, yy, xx + ww, yy + hh, rad );
					this.arcTo( xx + ww, yy + hh, xx, yy + hh, rad );
					this.arcTo( xx, yy + hh, xx, yy, rad );
					this.arcTo( xx, yy, xx + ww, yy, rad );
				}

				this.closePath();

				if ( stroke )
				{
					this.stroke();
				}

				if ( fill || ( fill === undefined ) )
				{
					this.fill();
				}
			};
		}

		// Init grid object

		_grid =
		{
			canvas : grid,
			context : ctx,
			fader : _newFader( _GRID_ID, _gridRGB, _gridRGBEnd )
		};

		// copy default properties

		_copy( _DEFAULTS.grid, _grid );

		// Set up master 32 x 32 bead array

		_beads = [ ];
		_beads.length = cnt = _MAX_BEADS;
		for ( i = 0; i < cnt; i += 1 )
		{
			// init bead table

			bead =
			{
				index : i,
				fader : _newFader( i, _beadRGBA, null ),
				borderFader : _newFader( i, _borderRGBA, null ),
				glyphFader : _newFader( i, _glyphRGBA, null )
			};

			_resetBead( bead );

			_beads[ i ] = bead;
		}

		// init status line

		_status =
		{
			div : status,
			fader : _newFader( _STATUS_ID, _statusRGB, null )
		};

		// copy default properties

		_copy( _DEFAULTS.status, _status );

		// Init sprite engine

		_sprites = [ ];
		_spriteCnt = 0;

		// Init pathfinder engine

		_pathmaps = [ ];
		_pathmapCnt = 0;

		// init audio system

		result = AQ.init(
			{
				defaultPath : _DEFAULTS.audio.path,
				defaultFileTypes : [ "ogg", "mp3", "wav" ],
				onAlert : PS.debug,
				stack : true,
				forceHTML5 : true // never use Web Audio; sigh
			} );

		if ( result.status === AQ.ERROR )
		{
			return;
		}

		// load and lock error sound

		_errorSound = null;
		result = PS.audioLoad( _DEFAULTS.audio.error_sound, { path : _DEFAULTS.audio.path, lock : true } );
		if ( result === PS.ERROR )
		{
			_warning( "Error sound '" + _DEFAULTS.audio.error_sound + "' not loaded" );
		}
		else
		{
			_errorSound = _DEFAULTS.audio.error_sound;
		}

		// Create offscreen canvas for image manipulation

		_imageCanvas = document.createElement( "canvas" );
		ctx = _imageCanvas.getContext( "2d" );
		ctx.imageSmoothingEnabled = false;
		ctx.mozImageSmoothingEnabled = false;
		ctx.webkitImageSmoothingEnabled = false;

		// Init image loading list

		_imageList = [ ];
		_imageCnt = 0;

		// Make sure all required user functions exist

		str = "() event function undefined";

		if ( typeof PS.init !== "function" )
		{
			PS.init = null;
			_warning( "PS.init" + str );
		}

		if ( typeof PS.touch !== "function" )
		{
			PS.touch = null;
			_warning( "PS.touch" + str );
		}

		if ( typeof PS.release !== "function" )
		{
			PS.release = null;
			_warning( "PS.release" + str );
		}

		if ( typeof PS.enter !== "function" )
		{
			PS.enter = null;
			_warning( "PS.enter" + str );
		}

		if ( typeof PS.exit !== "function" )
		{
			PS.exit = null;
			_warning( "PS.exit()" + str );
		}

		if ( typeof PS.exitGrid !== "function" )
		{
			PS.exitGrid = null;
			_warning( "PS.exitGrid" + str );
		}

		if ( typeof PS.keyDown !== "function" )
		{
			PS.keyDown = null;
			_warning( "PS.keyDown" + str );
		}

		if ( typeof PS.keyUp !== "function" )
		{
			PS.keyUp = null;
			_warning( "PS.keyUp" + str );
		}

		if ( typeof PS.input !== "function" )
		{
			PS.input = null;
			_warning( "PS.input" + str );
		}

		// set up footer

		str = _system.engine + " " + _system.major + "." + _system.minor + "." + _system.revision + " | " +
			_system.host.os + " " + _system.host.app + " " + _system.host.version;

		if ( _touchScreen )
		{
			str += ( " | Touch " );
		}

		footer.innerHTML = str;

		// Set up default grid & grid color

		_gridSize( _DEFAULTS.grid.x, _DEFAULTS.grid.y );

		//	Init fader and timer engines, start the global clock

		_initFaders();
		_initTimers();

		_clockActive = true;
		PS._clock();

		// Init all event listeners

		_gridActivate ();



		if ( PS.init )
		{
			// Call user initializer

			try
			{
				PS.init( _system, _EMPTY );
				_gridDraw();
			}
			catch ( err )
			{
				_errorCatch( "PS.init() failed [" + err.message + "]", err );
			}
		}
	};

	return ps;
} ( PS ) );
