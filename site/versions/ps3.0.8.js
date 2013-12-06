// ps3.0.8.js for Perlenspiel 3.0
// Remember to update version number in _system!

/*
 Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
 Perlenspiel is Copyright © 2009-13 Worcester Polytechnic Institute.
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
/*global document, window, screen, console, Image, AQ */

var PS; // Global namespace for public API

( function ()
{
	"use strict";

	//------------------
	// PRIVATE CONSTANTS
	//------------------

	// DOM element ids

	var _OUTER_ID = "outer";
	var _MAIN_ID = "main";
	var _DEBUG_ID = "debug";
	var _STATUS_ID = "status";
	var _GRID_ID = "grid";
	var _FOOTER_ID = "footer";
	var _MONITOR_ID = "monitor";

	// Element prefixes

	var _IMAGE_PREFIX = "image_";
	var _SPRITE_PREFIX = "sprite_";
	var _PATHMAP_PREFIX = "pathmap_";
	var _TIMER_PREFIX = "timer_";

	// Misc constants

	var _CLIENT_SIZE = 512; // client size in pixels
	var _ALPHOID = 1.0 / 255; // alpha step constant
	var _RSHIFT = 256 * 256;
	var _GSHIFT = 256;
	var _MAX_BEADS = 1024; // 32 x 32 maximum bead count
	var _EMPTY = {}; // a generic empty object
	var _DEFAULT_KEY_DELAY = 6; // key repeat rate (1/10 sec)
	var _KEY_SHIFT = 16; // shift keycode
	var _KEY_CTRL = 17; // ctrl keycode
	var _CLEAR = -1; // flag for not touching or not over a bead
	var _FADER_FPS = 4; // do fader queue every 1/15 of a second
	var _DIAGONAL_COST = 1.4142; // square root of 2; for pathfinder

	// Names of instrument files

	var _PIANO_FILES = [
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

	var _HCHORD_FILES = [
		"a2", "bb2", "b2",
		"c3", "db3", "d3", "eb3", "e3", "f3", "gb3", "g3", "ab3", "a3", "bb3", "b3",
		"c4", "db4", "d4", "eb4", "e4", "f4", "gb4", "g4", "ab4", "a4", "bb4", "b4",
		"c5", "db5", "d5", "eb5", "e5", "f5", "gb5", "g5", "ab5", "a5", "bb5", "b5",
		"c6", "db6", "d6", "eb6", "e6", "f6", "gb6", "g6", "ab6", "a6", "bb6", "b6",
		"c7", "db7", "d7", "eb7", "e7", "f7"
	];

	var _XYLO_FILES = [
		"a4", "bb4", "b4",
		"c5", "db5", "d5", "eb5", "e5", "f5", "gb5", "g5", "ab5", "a5", "bb5", "b5",
		"c6", "db6", "d6", "eb6", "e6", "f6", "gb6", "g6", "ab6", "a6", "bb6", "b6",
		"c7", "db7", "d7", "eb7", "e7", "f7", "gb7", "g7", "ab7", "a7", "bb7", "b7"
	];

	// Flag to reluctantly permit multiline status; remove for 3.1

	var _MULTILINE = true;

	// All system defaults kept in this object
	// On startup, they are copied into [_defaults] for referencing
	// This will (someday) permit defaults to be overwritten by user

	var _DEFAULTS = {

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

		// Status line defaults

		status : {
			text : "",
			color : {
				r : 0, g : 0, b : 0, a : 255,
				rgb : 0x000000,
				str : "rgba(0,0,0,1)"
			}
		},

		// Fader defaults

		fader : {
			rate : 0,
			rgb : null,
			onEnd : null,
			params : null
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
	};

	//----------------
	// Private globals
	//----------------

	// System gestalt

	var _system = {
		engine : "Perlenspiel",
		major : 3,
		minor : 0,
		revision : 8,
		host : {
			app : "Unknown App",
			version : "?",
			os : "Unknown OS" },
		inputs : {
			touch : false
		}
	};

	var _RSTR, _GBSTR, _BASTR, _ASTR; // color strings

	var _defaults; // working copy of _DEFAULTS

	var _grid; // master grid object
	var _beads; // master list of bead objects
	var _status; // status line object
	var _anyDirty = false; // dirty bead flag

	// Image support

	var _imageCanvas; // canvas object for image extraction
	var _imageList; // list of images being loaded
	var _imageCnt; // counter for image ids

	// Sprite support

	var _sprites; // master sprite list
	var _spriteCnt; // counter for sprite ids

	// Clock support

	var _clockActive; // true if clock should be running
	var _timers; // master timer list
	var _timerCnt; // unique timer id
	var _faders; // master fader list
	var _faderTick; // fader countdown

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
	var _currentFinger; // index of finger touching screen
	var _underBead; // bead currently under finger
	var _overGrid; // true when cursor/finger is over the grid
	var _lastBead = -1; // index of last bead used

	// Debugger support

	var _debugging; // true if debugger open
	var _debugFocus; // true if debugger has focus
	var _footer; // DOM footer element
	var _errorSound; // error sound available?

	// Pathfinder support

	var _pathmaps; // array of pathmaps
	var _pathmapCnt; // counter for pathmap ids

	//----------------
	// GENERAL SUPPORT
	//----------------

	// Improved typeof by Doug Crockford, with NaN detection by me

	function _typeOf ( value )
	{
		var type;

		type = typeof value;
		if ( type === "number" )
		{
			if ( isNaN( value ) )
			{
				type = "NaN";
			}
		}
		else if ( type === "object" )
		{
			if ( value )
			{
				if ( value instanceof Array )
				{
					type = "array";
				}
			}
			else
			{
				type = "null";
			}
		}

		return type;
	}

	// _isBoolean ( val )
	// Evaluates [val] for a valid boolean: true, false, null, numeric, PS.CURRENT, PS.DEFAULT or undefined
	// [currentVal] is PS.CURRENT value
	// [defaultVal] is PS.DEFAULT value
	// [undefinedVal] is undefined value
	// Returns true, false or PS.ERROR

	function _isBoolean ( valP, currentVal, defaultVal, undefinedVal )
	{
		var val, type;

		val = valP; // prevent arg mutation

		if ( ( val !== true ) && ( val !== false ) )
		{
			if ( val === null )
			{
				val = false;
			}
			else if ( val === PS.CURRENT )
			{
				val = currentVal;
			}
			else if ( val === PS.DEFAULT )
			{
				val = defaultVal;
			}
			else
			{
				type = _typeOf( val );
				if ( type === "undefined" )
				{
					val = undefinedVal;
				}
				else if ( type === "number" )
				{
					val = ( val !== 0 );
				}
				else
				{
					val = PS.ERROR;
				}
			}
		}

		return val;
	}

	// _isInteger ( val )
	// Evaluates [val] for a valid number, PS.CURRENT, PS.DEFAULT or undefined
	// [currentVal] is PS.CURRENT value
	// [defaultVal] is PS.DEFAULT value
	// [undefinedVal] is undefined value
	// Returns floored integer or PS.ERROR

	/*
	function _isInteger ( valP, currentVal, defaultVal, undefinedVal )
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
			type = _typeOf( val );
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

	function _copy ( src, dest )
	{
		var prop, item, obj, type;

		for ( prop in src )
		{
			if ( src.hasOwnProperty( prop ) )
			{
				item = src[ prop ];

				// Check type of item
				// If property is an object, recurse

				type = _typeOf( item );
				if ( type === "object" )
				{
					obj = {};
					_copy( item, obj );
					item = obj;
				}
				dest[ prop ] = item;
			}
		}
	}

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

	//--------------------
	// GRAPHICS PRIMITIVES
	//--------------------

	// Draw bead with specified colors

	function _drawBead ( bead, borderColor, beadColor, glyphColor, gridColor )
	{
		var ctx, size, left, top, width, height, border, radius, curve;

		ctx = _grid.context;
		size = _grid.bead_size;

		// establish default location and dimensions of bead color rect

		left = bead.left;
		top = bead.top;
		width = size;
		height = size;
		radius = bead.radius;

		// If bead is invisible, non-square or less than 100%, draw grid background

		if ( !bead.visible || ( bead.size < size ) || ( radius > 0 ) )
		{
			ctx.fillStyle = gridColor;
			ctx.fillRect( left, top, width, height );

			// Done if bead is invisible

			if ( !bead.visible )
			{
				return;
			}

			// Size is < 100%, so adjust working rect

			left += bead.margin;
			top += bead.margin;
			width = bead.size;
			height = bead.size;
		}

		// Draw border if needed

		border = bead.border;

		if ( border.width > 0 ) // > 0 if any border is visible
		{
			// fill entire rect with border color
			// Is this faster than a separate fill for each border?

			ctx.fillStyle = borderColor;
			if ( !radius )
			{
				ctx.fillRect( left, top, width, height );
			}
			else
			{
				curve = Math.floor( ( width * radius ) / 100 );
				curve = ctx.fillRoundedRect( left, top, width, height, curve );
			}

			// adjust position and size of color rect

			left += border.left;
			top += border.top;
			width -= ( border.left + border.right );
			height -= ( border.top + border.bottom );
		}

		// Draw color rect

		ctx.fillStyle = beadColor;
		if ( !radius )
		{
			ctx.fillRect( left, top, width, height );
		}
		else
		{
			curve = Math.floor( ( width * radius ) / 100 );
			ctx.fillRoundedRect( left, top, width, height, curve );
		}

		// draw glyph

		if ( bead.glyph.code > 0 )
		{
			_grid.context.font = bead.glyph.font;
			ctx.fillStyle = glyphColor;
			ctx.fillText( bead.glyph.str, bead.left + bead.glyph.x, bead.top + bead.glyph.y );
		}
	}

	// _colorBlendAlpha( c0, c1 )
	// Blend color c1 over c0. Color components are in 0-255, alpha is 0-1
	// Added by Mark Diehr

	function _colorBlendAlpha ( c0, c1 )
	{
		var alphaCover, result;

		alphaCover = c0.a * ( 1 - c1.a );
		result = {
			r : Math.floor( ( c1.r * c1.a ) + ( c0.r * alphaCover ) ),
			g : Math.floor( ( c1.g * c1.a ) + ( c0.g * alphaCover ) ),
			b : Math.floor( ( c1.b * c1.a ) + ( c0.b * alphaCover ) )
		};
		return result;
	}

	// _calcColor ( bead, gridColor )
	// Calculates effective color of a bead against a background color
	// Returns values through [target] object
	// Calculates effective color of a bead against a background color
	// Returns values through [target] object
	// Modified by Mark Diehr

	function _calcColor ( bead, backColor, target )
	{
		var pr, pg, pb, planes, len, i, color, level, r, g, b, a, beadAlpha, c0, c1, colorResult;

		pr = backColor.r;
		pg = backColor.g;
		pb = backColor.b;

		planes = bead.planes;
		len = planes.length;

		for ( i = 0; i < len; i += 1 )
		{
			level = planes[ i ];
			color = level.color;
			r = color.r;
			g = color.g;
			b = color.b;
			a = color.a;

			// Calculate effect of overlaying the new color

			if ( a > 0 )
			{
				if ( a < 255 ) // Blend color
				{
					beadAlpha = Math.max( 0, Math.min( ( a / 255 ), 1 ) ); // Rescale and clamp alpha to range [0..1]
					c0 = { r : pr, g : pg, b : pb, a : 1 }; // Back color
					c1 = { r : r, g : g, b : b, a : beadAlpha }; // Fore color
					colorResult = _colorBlendAlpha( c0, c1 );
					// Write results
					pr = colorResult.r;
					pg = colorResult.g;
					pb = colorResult.b;
				}
				else // Overwrite color
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

		target.rgb = ( r * _RSHIFT ) + ( g * _GSHIFT ) + b;
		target.r = r;
		target.g = g;
		target.b = b;
		target.str = _RSTR[ r ] + _GBSTR[ g ] + _BASTR[ b ];
	}

	// Fader functions

	// _gridRGB ( data )
	// Set grid background color from data.str property

	// Global color object
	// Avoid making a new object for every call

	var _bcolor = {
		rgb : 0,
		r : 0,
		g : 0,
		b : 0,
		str : ""
	};

	function _gridRGB ( data )
	{
		var str, canvas, context, i, bead, level, color, beadColor, borderColor;

		str = data.str;

		canvas = _grid.canvas;
		context = _grid.context;

		// Clear parts of canvas not under the grid

		canvas.backgroundColor = str;

		if ( _grid.left > 0 )
		{
			context.clearRect( 0, _grid.top, _grid.left, canvas.height );
		}
		if ( _grid.right < canvas.width )
		{
			context.clearRect( _grid.right, _grid.top, canvas.width - _grid.right, canvas.height );
		}
		if ( _grid.bottom < canvas.height )
		{
			context.clearRect( 0, _grid.bottom, canvas.width, canvas.height - _grid.bottom );
		}

		// set browser background

		document.body.style.backgroundColor = str;

		// set status line background

		_status.div.style.backgroundColor = str;

		// set footer background

		_footer.style.backgroundColor = str;

		// Redraw all invisible, small or alpha-affected beads

		for ( i = 0; i < _grid.count; i += 1 )
		{
			bead = _beads[ i ];

			// If plane 0 isn't opaque, must recalc bead color

			level = bead.planes[ 0 ]; // get first bead plane
			color = level.color; // color of plane
			if ( color.a < 255 )
			{
				_calcColor( bead, data, _bcolor ); // calc effective color
				beadColor = _bcolor.str;
			}
			else // just use current
			{
				beadColor = bead.color.str;
			}

			borderColor = bead.border.color;

			if ( !bead.visible || ( bead.size < _grid.bead_size ) || ( bead.radius > 0 ) || ( color.a < 255 ) || ( borderColor.a < 255 ) )
			{
				_drawBead( bead, borderColor.str, beadColor, bead.glyph.color.str, str );
			}
		}
	}

	// Call when done fading grid
	// Insures visible color for message line

	function _gridRGBEnd ( data )
	{
		var r, g, b;

		// set footer text to a complimentary color

		if ( data.r > 127 )
		{
			r = 0;
		}
		else
		{
			r = 255;
		}

		if ( data.g > 127 )
		{
			g = 0;
		}
		else
		{
			g = 255;
		}

		if ( data.b > 127 )
		{
			b = 0;
		}
		else
		{
			b = 255;
		}

		_footer.style.color = _RSTR[ r ] + _GBSTR[ g ] + _BASTR[ b ];
	}

	// Change status line text color

	function _statusRGB ( data )
	{
		_status.div.style.color = data.str;
	}

	// Change bead color

	function _beadRGBA ( data, element )
	{
		var bead;

		bead = _beads[ element ];
		_drawBead( bead, bead.border.color.str, data.str, bead.glyph.color.str, _grid.color.str );
	}

	// Change border color

	function _borderRGBA ( data, element )
	{
		var bead;

		bead = _beads[ element ];
		_drawBead( bead, data.str, bead.color.str, bead.glyph.color.str, _grid.color.str );
	}

	// Change glyph color

	function _glyphRGBA ( data, element )
	{
		var bead;

		bead = _beads[ element ];
		_drawBead( bead, bead.border.color.str, bead.color.str, data.str, _grid.color.str );
	}

	// Mark a bead as dirty

	function _makeDirty ( bead )
	{
		bead.dirty = true;
		_anyDirty = true;
	}

	// Draw all dirty beads

	function _gridDraw ()
	{
		var len, i, bead;

		if ( _anyDirty )
		{
			len = _grid.count;
			for ( i = 0; i < len; i += 1 )
			{
				bead = _beads[ i ];
				if ( bead.dirty )
				{
					bead.dirty = false;
					_drawBead( bead, bead.border.color.str, bead.color.str, bead.glyph.color.str, _grid.color.str );
				}
			}
			_anyDirty = false;
		}
	}

	//-------------------------
	// DEBUGGER & ERROR SUPPORT
	//-------------------------

	// Improved error reporter with stack trace
	// Based on code by Mark Diehr

	// Open debugger div, clear monitor

	function _debugOpen ()
	{
		var e;

		// Show the debug div if not already open

		if ( !_debugging )
		{
			e = document.getElementById( _DEBUG_ID );
			e.style.display = "inline";

			// clear the monitor

			e = document.getElementById( _MONITOR_ID );
			e.value = "";

			_debugging = true;
			_debugFocus = false;
		}
	}

	// Send warning message to debugger

	function _warning ( str )
	{
		if ( ( typeof str !== "string" ) || ( str.length < 1 ) )
		{
			str = "???";
		}

		PS.debug( "WARNING: " + str + "\n" );
	}

	// Debugger options

	var _DEBUG_STACK = true; // Show debug stack
	var _DEBUG_HTML = false; // Show .html source

	function _decodeStackLine ( str )
	{
		var text, index, name;

		text = "";

		if ( str.search( ".js" ) !== -1 ) // Code lines
		{
			index = str.lastIndexOf( "/" ) + 1;
			name = str.substr( index ).replace( /^[\s\(\)]+|[\s\(\)]+$/g, '' );

			// Remove the column from the line

			if ( name.split( ":" ).length === 3 )
			{
				name = name.substr( 0, name.lastIndexOf( ":" ) );
			}
			if ( name !== "" )
			{
				text += ( "    " + name + "\n" );
			}
		}
		else if ( _DEBUG_HTML && ( str.search( ".htm" ) !== -1 ) ) // HTML line
		{
			text += ( "\n" + str );
		}

		return text;
	}

	function _decodeCallstack ( str )
	{
		var lines, len, i, text;

		if ( console && console.log )
		{
			console.log( str );
		}

		if ( !str.split )
		{
			return str;
		}

		lines = str.split( '\n' );
		text = "";

		len = lines.length;
		for ( i = 0; i < len; i += 1 )
		{
			text += _decodeStackLine( lines[i] );
		}

		return text;
	}

	function _errorCatch ( message, err )
	{
		var str;

		// Stop the clock

		_clockActive = false;

		if ( ( typeof message !== "string" ) || ( message.length < 1 ) )
		{
			message = "???";
		}

		str = "ERROR: " + message + "\n";

		// set footer

		_footer.innerHTML = str;

		// Only debugger gets call stack

		if ( _DEBUG_STACK && err )
		{
			str += ( _decodeCallstack( err.stack ) + "\n" );
		}
		PS.debug( str );

		if ( _errorSound )
		{
			PS.audioPlay( _defaults.audio.error_sound, { path : _defaults.audio.path } );
		}

		return PS.ERROR;
	}

	function _error ( message )
	{
		// Throw error to access callstack

		try
		{
			throw( new Error( "!" ) );
		}
		catch ( err )
		{
			return _errorCatch( message, err );
		}
	}

	// Keep debugger window scrolled to bottom

	function _scrollDown ()
	{
		var e;

		e = document.getElementById( _MAIN_ID );
		e.scrollTop = e.scrollHeight;
	}

	//-------------
	// FADER ENGINE
	//-------------

	// Init fader engine

	function _initFaders ()
	{
		_faders = [];
		_faderTick = 0;
	}

	// Reset a fader

	function _resetFader ( fader )
	{
		var def;

		def = _defaults.fader;

		fader.active = false;
		fader.kill = false;
		fader.rate = def.rate;
		fader.rgb = def.rgb;
		fader.onEnd = def.onEnd;
		fader.params = def.params;
		fader.r = 0;
		fader.g = 0;
		fader.b = 0;
		fader.step = 0;
		fader.frames.length = 0;
	}

	// Return a new fader object
	// This should be called only once for each element, at system startup

	function _newFader ( element, exec, execEnd )
	{
		var fader;

		fader = {
			element : element, // element identifier
			exec : exec, // function to call with element and r/g/b/a when changing color
			execEnd : execEnd,  // function to call after final color change
			frames : []
		};

		_resetFader( fader );

		return fader;
	}

	// Calc fader steps
	// [r/g/b] are current colors, [tr/tg/tb] target colors
	// Precalculates all color animation steps
	// Assumes all properties except [step] and [frames] specified

	function _calcFader ( fader, r, g, b, a, tr, tg, tb, ta )
	{
		var cr, cg, cb, ca, cnt, step, percent, frame, r_delta, g_delta, b_delta, a_delta, any, delta;

		fader.step = 0;
		fader.frames.length = 0;

		if ( ( r === tr ) && ( g === tg ) && ( b === tb ) && ( a === ta ) )
		{
			return;
		}

		cr = r;
		cg = g;
		cb = b;
		ca = a;

		// Calc deltas only once

		if ( r > tr )
		{
			r_delta = -( r - tr );
		}
		else
		{
			r_delta = tr - r;
		}

		if ( g > tg )
		{
			g_delta = -( g - tg );
		}
		else
		{
			g_delta = tg - g;
		}

		if ( b > tb )
		{
			b_delta = -( b - tb );
		}
		else
		{
			b_delta = tb - b;
		}

		if ( a > ta )
		{
			a_delta = -( a - ta );
		}
		else
		{
			a_delta = ta - a;
		}

		// rate is expressed in 60ths of a second

		if ( fader.rate < _FADER_FPS )
		{
			cnt = 1;
		}
		else
		{
			cnt = Math.ceil( fader.rate / _FADER_FPS );
		}

		step = 100 / cnt;
		percent = 0;
		do
		{
			any = false;
			frame = {};
			percent += step;
			if ( percent >= 100 )
			{
				frame.r = tr;
				frame.g = tg;
				frame.b = tb;
				frame.a = ta;
			}
			else
			{
				// red

				if ( cr !== tr )
				{
					delta = ( percent * r_delta ) / 100;
					cr = r + delta;
					cr = Math.round( cr );
					any = true;
				}
				frame.r = cr;

				// green

				if ( cg !== tg )
				{
					delta = ( percent * g_delta ) / 100;
					cg = g + delta;
					cg = Math.round( cg );
					any = true;
				}
				frame.g = cg;

				// blue

				if ( cb !== tb )
				{
					delta = ( percent * b_delta ) / 100;
					cb = b + delta;
					cb = Math.round( cb );
					any = true;
				}
				frame.b = cb;

				// alpha

				if ( ca !== ta )
				{
					delta = ( percent * a_delta ) / 100;
					ca = a + delta;
					ca = Math.round( ca );
					any = true;
				}
				frame.a = ca;
			}

			frame.rgb = ( frame.r * _RSHIFT ) + ( frame.g * _GSHIFT ) + frame.b;
			frame.str = _RSTR[ frame.r ] + _GBSTR[ frame.g ] + _GBSTR[ frame.b ] + _ASTR[ frame.a ];
			fader.frames.push( frame );

			// stop now if already matched

			if ( !any )
			{
				return;
			}
		}
		while ( percent < 100 );
	}

	// Start a fader
	// Precalculates all color animation steps
	// Assumes all properties except [step] and [frames] specified

	function _startFader ( fader, r, g, b, a, tr, tg, tb, ta )
	{
		_calcFader( fader, r, g, b, a, tr, tg, tb, ta );
		if ( fader.frames.length > 0 )
		{
			fader.kill = false;
			fader.active = true;
			_faders.push( fader );
		}
	}

	// Recalculate color animation steps for a fade in progress

	function _recalcFader ( fader, tr, tg, tb, ta )
	{
		var restart, len, step, frame;

		restart = fader.active; // save active status

		fader.active = false;

		len = fader.frames.length;
		if ( len > 0 )
		{
			step = fader.step;

			// just in case ...

			if ( step >= len )
			{
				step = len - 1; // use last step
			}

			frame = fader.frames[ step ];
			_calcFader( fader, frame.r, frame.g, frame.b, frame.a, tr, tg, tb, ta ); // may result in no frames!
		}

		// precaution ...

		if ( fader.frames.length > 0 )
		{
			fader.active = restart;
		}
	}

	//-------------
	// SYSTEM CLOCK
	//-------------

	// Init user timers

	function _initTimers ()
	{
		_timers = [];
		_timerCnt = 0;
	}

	/*
	var _lastTime = 0;

	function _reportTime ()
	{
		var date, now;

		date = new Date();
		now = date.getTime();
		PS.statusText ( "MS: " + ( now - _lastTime ) );
		_lastTime = now;
	}
     */

	function _tick ()
	{
		var fn, len, i, fader, frame, key, timer, result, exec, id, params;

//		_reportTime();

		fn = "[_tick] ";

		// Fader support

		_faderTick += 1;
		if ( _faderTick >= _FADER_FPS )
		{
			_faderTick = 0;
			len = _faders.length;
			i = 0;
			while ( i < len )
			{
				fader = _faders[ i ];
				if ( fader.kill )
				{
					_faders.splice( i, 1 );
					len -= 1;
				}
				else if ( fader.active ) // only active faders
				{
					frame = fader.frames[ fader.step ];
					if ( fader.exec )
					{
						try
						{
							fader.exec( frame, fader.element ); // call frame exec with frame data and fader element
						}
						catch ( e3 )
						{
							_errorCatch( fn + "fader .exec failed [" + e3.message + "]", e3 );
							return;
						}
					}

					fader.step += 1;
					if ( fader.step >= fader.frames.length )
					{
						fader.active = false;
						fader.step = 0;
						fader.frames.length = 0;

						// Call system execEnd if present

						if ( fader.execEnd )
						{
							try
							{
								fader.execEnd( frame, fader.element );
							}
							catch ( e4 )
							{
								_errorCatch( fn + "fader .execEnd failed [" + e4.message + "]", e4 );
								return;
							}
						}

						// Call user onEnd if present

						exec = fader.onEnd;
						if ( exec )
						{
							params = fader.params;
							if ( !params )
							{
								params = [];
							}
							try
							{
								exec.apply( _EMPTY, params );
							}
							catch ( e5 )
							{
								_errorCatch( fn + "fader .onEnd failed [" + e5.message + "]", e5 );
								return;
							}
						}

						// remove fader from queue

						_faders.splice( i, 1 );
						len -= 1;
					}
					else
					{
						i += 1;
					}
				}
				else
				{
					i += 1;
				}
			}
		}

		// Key hold support

		len = _holding.length;
		if ( _keyRepeat && ( len > 0 ) )
		{
			if ( _keyDelay > 0 )
			{
				_keyDelay -= 1;
			}
			else
			{
				_keyDelay = _keyDelayRate; // reset delay
				for ( i = 0; i < len; i += 1 )
				{
					key = _holding[ i ];
					if ( key )
					{
//						key = _keyFilter( key, _holdShift );
						try
						{
							PS.keyDown( key, _holdShift, _holdCtrl );
						}
						catch ( e6 )
						{
							_errorCatch( fn + "Key repeat failed [" + e6.message + "]", e6 );
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

		len = _timers.length;
		if ( len > 0 ) // any timers?
		{
			i = 0;
			while ( i < len )
			{
				timer = _timers[ i ];
				id = timer.id; // save the id in case of change

				// Call the exec if countdown timer is expired

				timer.count -= 1; // decrement countdown
				if ( timer.count < 1 )
				{
					timer.count = timer.delay; // reset countdown

					try
					{
						result = timer.exec.apply( _EMPTY, timer.arglist );
					}
					catch ( e7 )
					{
						result = _errorCatch( fn + "Timed function failed [" + e7.message + "]", e7 );
					}

					// If exec result is PS.ERROR, remove from queue

					if ( result === PS.ERROR )
					{
						PS.timerStop( id );
					}

					len = _timers.length; // recalc in case timer queue was changed by a timer function or an error
				}

				// point to next timer if [i] still points to last timer

				timer = _timers[ i ];
				if ( timer && ( timer.id === id ) )
				{
					i += 1;
				}
			}

			// render all changes

			_gridDraw();
		}
	}

	//--------------
	// COLOR SUPPORT
	//--------------

	// _recolor ( bead )
	// Recalculate and change effective color of [bead]
	// Inspects all color planes from top to bottom

	// Global target object
	// Avoids having to make a new object for every call

	var _target = {
		rgb : 0,
		r : 0,
		g : 0,
		b : 0,
		str : ""
	};

	function _recolor ( bead )
	{
		var rgb, current, r, g, b, pr, pg, pb, fader;

		_calcColor( bead, _grid.color, _target );

		rgb = _target.rgb;

		current = bead.color; // current effective color

		r = _target.r;
		g = _target.g;
		b = _target.b;

		// Save current colors for calc

		pr = current.r;
		pg = current.g;
		pb = current.b;

		// Update current record

		current.rgb = rgb;
		current.r = r;
		current.g = g;
		current.b = b;
		current.str = _target.str;

		if ( bead.visible )
		{
			fader = bead.fader;
			if ( fader.rate > 0 ) // must use fader
			{
				if ( fader.rgb !== null ) // use start color if specified
				{
					_startFader( fader, fader.r, fader.g, fader.b, 255, r, g, b, 255 );
				}
				else if ( !fader.active )
				{
					_startFader( fader, pr, pg, pb, 255, r, g, b, 255 );
				}
				else // must recalculate active fader
				{
					_recalcFader( fader, r, g, b, 255 );
				}
			}
			else
			{
				_makeDirty( bead );
			}
		}
	}

	// Validate & rectify separate color values, return in [colors] object

	function _validColors ( fn, colors, redP, greenP, blueP )
	{
		var red, green, blue, type;

		red = redP; // prevent arg mutation
		if ( ( red !== PS.CURRENT ) && ( red !== PS.DEFAULT ) )
		{
			type = _typeOf( red );
			if ( type === "undefined" )
			{
				red = PS.CURRENT;
			}
			else if ( type === "number" )
			{
				red = Math.floor( red );
				if ( red < 0 )
				{
					red = 0;
				}
				else if ( red > 255 )
				{
					red = 255;
				}
			}
			else
			{
				return _error( fn + "red value invalid" );
			}
		}

		green = greenP; // prevent arg mutation
		if ( ( green !== PS.CURRENT ) && ( green !== PS.DEFAULT ) )
		{
			type = _typeOf( green );
			if ( type === "undefined" )
			{
				green = PS.CURRENT;
			}
			else if ( type === "number" )
			{
				green = Math.floor( green );
				if ( green < 0 )
				{
					green = 0;
				}
				else if ( green > 255 )
				{
					green = 255;
				}
			}
			else
			{
				return _error( fn + "green value invalid" );
			}
		}

		blue = blueP; // prevent arg mutation
		if ( ( blue !== PS.CURRENT ) && ( blue !== PS.DEFAULT ) )
		{
			type = _typeOf( blue );
			if ( type === "undefined" )
			{
				blue = PS.CURRENT;
			}
			else if ( type === "number" )
			{
				blue = Math.floor( blue );
				if ( blue < 0 )
				{
					blue = 0;
				}
				else if ( blue > 255 )
				{
					blue = 255;
				}
			}
			else
			{
				return _error( fn + "blue value invalid" );
			}
		}

		colors.rgb = null; // signal to consult r/g/b properties
		colors.r = red;
		colors.g = green;
		colors.b = blue;

		return PS.DONE;
	}

	// Extract components of an rgb multiplex into [colors] object

	function _extractRGB ( colors, rgbP )
	{
		var rgb, red, rval, green, gval, blue;

		rgb = Math.floor( rgbP );

		if ( rgb < 1 ) // black
		{
			rgb = red = green = blue = 0;
		}
		else if ( rgb >= 0xFFFFFF ) // white
		{
			rgb = 0xFFFFFF;
			red = green = blue = 255;
		}
		else
		{
			red = rgb / _RSHIFT;
			red = Math.floor( red );
			rval = red * _RSHIFT;

			green = ( rgb - rval ) / _GSHIFT;
			green = Math.floor( green );
			gval = green * _GSHIFT;

			blue = rgb - rval - gval;
		}

		colors.rgb = rgb; // number signals all values are valid
		colors.r = red;
		colors.g = green;
		colors.b = blue;
	}

	// _decodeColors ( fn, p1, p2, p3 )
	// Takes caller's function name, plus single RGB multiplex integer, integer triplet, RGB array or RGB object
	// Returns a color object or PS.ERROR
	// If .rgb = null, caller should use use r/g/b properties
	// If .rgb = PS.CURRENT/PS.DEFAULT, caller should use current/default colors
	// If .rgb is a number, r/g/b properties are precalculated

	// Global color return object
	// Avoids making a new object for every call

	var _decoded = {
		rgb : 0,
		r : null,
		g : null,
		b : null,
		str : ""
	};

	function _decodeColors ( fn, p1, p2, p3 )
	{
		var colors, type, result, rgb, len;

		colors = _decoded; // use global return object
		colors.rgb = 0;
		colors.r = null;
		colors.g = null;
		colors.b = null;
		colors.str = "";

		// [p1] determines interpretation

		type = _typeOf( p1 );

		// If [p2] or [p3] is defined, check for a valid multiplex

		if ( ( p2 !== undefined ) || ( p3 !== undefined ) )
		{
			if ( ( type === "number" ) || ( type === "undefined" ) || ( p1 === PS.CURRENT ) || ( p1 === PS.DEFAULT ) )
			{
				result = _validColors( fn, colors, p1, p2, p3 );
				if ( result === PS.ERROR )
				{
					return PS.ERROR;
				}
			}
			else
			{
				if ( type === "array" )
				{
					return _error( fn + "Extraneous arguments after color array" );
				}
				if ( type === "object" )
				{
					return _error( fn + "Extraneous arguments after color object" );
				}
				return _error( fn + "red argument invalid" );
			}
		}

		// [p1] is only argument

		else if ( type === "number" )
		{
			_extractRGB( colors, p1 ); // Assume a multiplex
		}

		// Array with r|g|b values?

		else if ( type === "array" )
		{
			len = p1.length;
			if ( len < 1 )
			{
				colors.rgb = PS.CURRENT; // no elements, use all current
			}
			else
			{
				result = _validColors( fn, colors, p1[ 0 ], p1[ 1 ], p1[ 2 ] );
				if ( result === PS.ERROR )
				{
					return PS.ERROR;
				}
			}
		}

		// Object with rgb|r|g|b properties?

		else if ( type === "object" )
		{
			// .rgb property has priority

			rgb = p1.rgb;
			type = _typeOf( rgb );
			if ( ( type === "undefined" ) || ( rgb === null ) )
			{
				result = _validColors( fn, colors, p1.r, p1.g, p1.b );
				if ( result === PS.ERROR )
				{
					return PS.ERROR;
				}
			}
			else if ( type === "number" )
			{
				_extractRGB( colors, rgb );
			}
			else if ( ( rgb === PS.CURRENT ) || ( rgb === PS.DEFAULT ) )
			{
				colors.rgb = rgb; // signal to use current or default color
			}
			else
			{
				return _error( fn + ".rgb property invalid" );
			}
		}

		else if ( ( type === "undefined" ) || ( p1 === PS.CURRENT ) )
		{
			colors.rgb = PS.CURRENT; // signal caller to use current color
		}

		else if ( p1 === PS.DEFAULT )
		{
			colors.rgb = PS.DEFAULT; // signal caller to use default color
		}
		else
		{
			return _error( fn + "color argument invalid" );
		}

		return colors;
	}

	// Calc font metrics for bead based on glyph scale

	function _rescaleGlyph ( bead )
	{
		var bsize, nsize, scale;

		bsize = _grid.bead_size;
		bead.glyph.x = Math.floor( bsize / 2 ); // x is always centered

		scale = bead.glyph.scale;
		if ( scale < 100 )
		{
			nsize = Math.floor( ( bsize * scale ) / 100 );
		}
		else
		{
			nsize = bsize;
		}
		bead.glyph.size = Math.floor( nsize / 2 );
		bead.glyph.font = bead.glyph.size + "pt sans-serif";
		bead.glyph.y = Math.floor( ( bsize - nsize ) / 2 ) + Math.floor( ( nsize / 7 ) * 4 ); // empirical
	}

	// Reset bead default attributes

	function _resetBead ( bead )
	{
		var color;

		_copy( _defaults.bead, bead ); // copy default properties

		// Make a copy of default colors

		color = {};
		_copy( _defaults.bead.color, color );

		bead.planes = [
			{ height : 0, color : color }
		]; // init planes array

		_rescaleGlyph( bead );

		_resetFader( bead.fader );
		_resetFader( bead.borderFader );
		_resetFader( bead.glyphFader );
	}

	// Get color of a bead plane

	function _colorPlane ( bead, plane )
	{
		var planes, level, len, i, color, def;

		planes = bead.planes;

		// Handle plane 0 quickly

		if ( plane < 1 )
		{
			level = planes[ 0 ];
			return level.color;
		}

		// See if plane is already in list
		// Return its color if found

		len = planes.length;
		for ( i = 1; i < len; i += 1 )
		{
			level = planes[ i ];
			if ( level.height === plane )
			{
				return level.color;
			}
		}

		// Plane doesn't exist yet

		// Make a copy of default colors with zero alpha

		def = _defaults.bead.color;
		color = {
			rgb : def.rgb,
			r : def.r,
			g : def.g,
			b : def.b,
			a : 0
		};

		// Just return default if bead is inactive

		if ( bead.active )
		{
			// insert plane into list in correct order

			i = 0;
			while ( i < len )
			{
				level = planes[ i ];
				if ( level.height > plane )
				{
					break;
				}
				i += 1;
			}

			planes.splice( i, 0, { height : plane, color : color } );
		}

		return color;
	}

	// Return current maximum border width

	function _borderMax ( bead )
	{
		if ( bead.glyph.code > 0 )
		{
			return bead.border.gmax;
		}

		return bead.border.max;
	}

	// Set all bead borders to same width

	function _equalBorder ( bead, w )
	{
		bead.border.equal = true;
		bead.border.width = w;
		bead.border.top = w;
		bead.border.left = w;
		bead.border.bottom = w;
		bead.border.right = w;
	}

	// Rescale a bead according to its .scale property

	function _rescale ( bead )
	{
		var bsize, size, diff, margin, max, val, border;

		bsize = _grid.bead_size; // 100% bead size for current grid

		if ( bead.scale < 100 )
		{
			size = Math.floor( ( bsize * bead.scale ) / 100 );

			// ensure at least two pixel difference

			diff = bsize - size;
			if ( ( diff > 0 ) && ( diff % 2 ) )
			{
				size += 1;
			}
		}
		else
		{
			size = bsize;
			bead.margin = 0;
			bead.senseLeft = bead.left;
			bead.senseRight = bead.right;
			bead.senseTop = bead.top;
			bead.senseBottom = bead.bottom;
		}

		bead.size = size;

		// calc cursor sensing area

		if ( size !== bsize )
		{
			bead.margin = margin = Math.floor( ( bsize - size ) / 2 );
			bead.senseLeft = bead.left + margin;
			bead.senseRight = bead.right - margin;
			bead.senseTop = bead.top + margin;
			bead.senseBottom = bead.bottom - margin;
		}

		border = bead.border;

		// calc maximum border size

		border.max = Math.floor( ( size - 8 ) / 2 );

		// calc maximum border size with glyph

		border.gmax = Math.floor( ( size - bead.glyph.size ) / 2 );

		// adjust border width if needed

		max = _borderMax( bead );

		if ( border.equal )
		{
			if ( border.width > max )
			{
				_equalBorder( bead, max );
			}
		}
		else
		{
			val = border.top;
			if ( val > max )
			{
				border.top = max;
			}

			val = border.left;
			if ( val > max )
			{
				border.left = max;
			}

			val = border.bottom;
			if ( val > max )
			{
				border.bottom = max;
			}

			val = border.right;
			if ( val > max )
			{
				border.right = max;
			}
		}
	}

	// Return a bead's data

	function _getData ( bead )
	{
		var data;

		data = bead.data;
		if ( data === null ) // if null, return 0
		{
			data = 0;
		}
		return data;
	}

	//------------------
	// DOM EVENT SUPPORT
	//------------------

	// _touchBead ( bead )
	// Call this when mouse is clicked on bead or when bead is touched
	// Returns PS.DONE or PS.ERROR

	function _touchBead ( bead )
	{
		var data, any;

		if ( bead.active )
		{
			any = false;
			data = _getData( bead );

			// Call user's touch function if defined

			if ( bead.exec )
			{
				try
				{
					bead.exec( bead.x, bead.y, data, _EMPTY );
					any = true;
				}
				catch ( e1 )
				{
					return _errorCatch( "Bead " + bead.x + ", " + bead.y + " function failed [" + e1.message + "]", e1 );
				}
			}

			// Call PS.touch()

			if ( PS.touch )
			{
				try
				{
					PS.touch( bead.x, bead.y, data, _EMPTY );
					any = true;
				}
				catch ( e2 )
				{
					return _errorCatch( "PS.touch() failed [" + e2.message + "]", e2 );
				}
			}

			if ( any )
			{
				_gridDraw();
			}
		}
		return PS.DONE;
	}

	// _releaseBead ( bead )
	// Call this when mouse button is released or touch is removed from bead
	// Returns PS.DONE or PS.ERROR

	function _releaseBead ( bead )
	{
		var data;

		if ( bead.active )
		{
			if ( PS.release )
			{
				data = _getData( bead );
				try
				{
					PS.release( bead.x, bead.y, data, _EMPTY );
					_gridDraw();
				}
				catch ( err )
				{
					return _errorCatch( "PS.release() failed [" + err.message + "]", err );
				}
			}
		}
		return PS.DONE;
	}

	// _enterBead ( bead )
	// Call this when mouse/touch enters a bead
	// Returns PS.DONE or PS.ERROR

	function _enterBead ( bead )
	{
		var data;

		_overGrid = true;

		if ( bead.active )
		{
			if ( PS.enter )
			{
				data = _getData( bead );
				try
				{
					PS.enter( bead.x, bead.y, data, _EMPTY );
					_gridDraw();
				}
				catch ( err )
				{
					return _errorCatch( "PS.enter() failed [" + err.message + "]", err );
				}
			}
		}
		return PS.DONE;
	}

	// _exitBead ( bead )
	// Call this when mouse/touch leaves a bead
	// Returns PS.DONE or PS.ERROR

	function _exitBead ( bead )
	{
		var data;

		if ( bead.active )
		{
			if ( PS.exit )
			{
				data = _getData( bead );
				try
				{
					PS.exit( bead.x, bead.y, data, _EMPTY );
					_gridDraw();
				}
				catch ( err )
				{
					return _errorCatch( "PS.exit() failed [" + err.message + "]", err );
				}
			}
		}

		return PS.DONE;
	}

	// _exitGrid()
	// Call this when mouse leaves the grid
	// Returns PS.DONE or PS.ERROR

	function _exitGrid ()
	{
		_overGrid = false;

		if ( PS.exitGrid )
		{
			try
			{
				PS.exitGrid( _EMPTY );
				_gridDraw();
			}
			catch ( err )
			{
				return _errorCatch( "PS.exitGrid() failed [" + err.message + "]", err );
			}
		}
		return PS.DONE;
	}

	//--------------------
	// INPUT EVENT SUPPORT
	// -------------------

	function _resetCursor ()
	{
		_lastBead = -1;
	}

	function _getBead ( x, y )
	{
		var canvas, bead, i, j;

		canvas = _grid.canvas;

		x += ( document.body.scrollLeft + document.documentElement.scrollLeft - canvas.offsetLeft );
		y += ( document.body.scrollTop + document.documentElement.scrollTop - canvas.offsetTop );

//		PS.debug( "_getBead(): x = " + x + ", y = " + y + "\n" );

		// Over the grid?

		if ( ( x >= _grid.left ) && ( x < _grid.right ) && ( y >= _grid.top ) && ( y < _grid.bottom ) )
		{
			// Which bead are we over?

			i = 0; // init index
			while ( i < _grid.count )
			{
				bead = _beads[ i ]; // get the first bead in this row

				// Is mouse over this row?

				if ( ( y >= bead.top ) && ( y < bead.bottom ) )
				{
					// Check each column using sense coordinates

					for ( j = 0; j < _grid.x; j += 1 )
					{
						if ( ( x >= bead.senseLeft ) && ( x < bead.senseRight ) && ( y >= bead.senseTop ) && ( y < bead.senseBottom ) )
						{
							return bead;
						}
						i += 1;
						bead = _beads[ i ];
					}
					return null;
				}
				i += _grid.x; // try next row
			}
		}

		return null;
	}

	// _mouseDown ()
	// Event called when mouse is clicked on a bead

	function _mouseDown ( event )
	{
		var x, y, bead;

		if ( event.x && event.y ) // Webkit, IE
		{
			x = event.x;
			y = event.y;
		}
		else // Firefox method to get the position
		{
			x = event.clientX;
			y = event.clientY;
		}

		bead = _getBead( x, y );
		if ( bead )
		{
			_touchBead( bead );
		}
	}

	// _mouseUp ()
	// Event called when mouse button is released over grid

	function _mouseUp ( event )
	{
		var x, y, bead;

		if ( event.x && event.y ) // Webkit, IE
		{
			x = event.x;
			y = event.y;
		}
		else // Firefox method to get the position
		{
			x = event.clientX;
			y = event.clientY;
		}

		bead = _getBead( x, y );
		if ( bead )
		{
			_releaseBead( bead );
		}
	}

	// Called when cursor moves over grid

	function _mouseMove ( event )
	{
		var x, y, bead, obead;

		if ( event.x && event.y ) // Webkit, IE
		{
			x = event.x;
			y = event.y;
		}
		else // Firefox method to get the position
		{
			x = event.clientX;
			y = event.clientY;
		}

		bead = _getBead( x, y );
		if ( bead )
		{
			if ( bead.index !== _lastBead )
			{
				if ( _lastBead >= 0 )
				{
					obead = _beads[ _lastBead ];
					_exitBead( obead );
				}
				_enterBead( bead );
				_lastBead = bead.index;
			}
		}
		else if ( _lastBead >= 0 )
		{
			obead = _beads[ _lastBead ];
			_exitBead( obead );
			_lastBead = -1;
		}
	}

	// _gridOut()
	// Event called when mouse enters area outside grid

	function _gridOut ( event )
	{
		var bead, target;

		if ( _lastBead >= 0 )
		{
			bead = _beads[ _lastBead ];
			_exitBead( bead );
			_lastBead = -1;
		}

		target = event.relatedTarget;
		if ( target )
		{
			target = target.id;

			// prevent bubbling up

			if ( target && ( ( target === _OUTER_ID ) || ( target === _MAIN_ID ) || ( target.length < 1 ) ) )
			{
				_exitGrid();
			}
		}
	}

	// _touchStart ( event )
	// Event called when screen is touched

	function _touchStart ( event )
	{
		var xpos, ypos, touch, bead;

//		PS.debug("_touchStart called\n");

		event.preventDefault(); // prevents weirdness

		// if a finger already down

		if ( _currentFinger !== _CLEAR )
		{
			PS.debug( "Finger already down\n" );
			return; // ignore
		}

		touch = event.changedTouches[ 0 ];
		_currentFinger = touch.identifier; // get the identifier for this finger

//		PS.debug( "_touchStart finger = " + _currentFinger + "\n" );

		xpos = touch.pageX;
		ypos = touch.pageY;

		// Touch is on the canvas

		bead = _getBead( xpos, ypos );
		if ( bead )
		{
			_overGrid = true;
			_underBead = bead.index; // remember which bead is under touch
			_touchBead( bead );
		}
		else
		{
			_underBead = _CLEAR;
			_overGrid = false;
		}
	}

	// _touchEnd ( event )
	// Event called when touch is released or canceled

	function _touchEnd ( event )
	{
		var len, i, touch, finger, xpos, ypos, bead;

		// make sure this is the correct finger

		len = event.changedTouches.length;

		// must use changed!

		for ( i = 0; i < len; i += 1 )
		{
			touch = event.changedTouches[ i ];
			finger = touch.identifier;
			if ( finger === _currentFinger ) // found it!
			{
				_currentFinger = _CLEAR;
				_underBead = _CLEAR;
				_overGrid = false;

				xpos = touch.pageX;
				ypos = touch.pageY;

				bead = _getBead( xpos, ypos );
				if ( bead )
				{
					_releaseBead( bead );
				}
				return;
			}
		}
	}

	// _touchMove ( event )
	// Event called when touch is moved across screen

	function _touchMove ( event )
	{
		var len, i, touch, finger, xpos, ypos, bead, obead;

		event.preventDefault(); // stops weirdness

		len = event.changedTouches.length;

		// must use changed!

		for ( i = 0; i < len; i += 1 )
		{
			touch = event.changedTouches[ i ];
			finger = touch.identifier;
			if ( finger === _currentFinger ) // found it!
			{
				xpos = touch.pageX;
				ypos = touch.pageY;

				bead = _getBead( xpos, ypos );
				if ( bead )
				{
					_overGrid = true;

					// Entering new bead?

					if ( _underBead !== bead.index )
					{
						// Previously over a bead?

						if ( _underBead !== _CLEAR )
						{
							obead = _beads[ _underBead ]; // get the bead table
							_exitBead( obead );
						}

						// Save as current bead and enter it

						_underBead = bead.index;
						_enterBead( bead );
					}
				}
				else
				{
					// Previously over a bead?

					if ( _underBead !== _CLEAR )
					{
						obead = _beads[ _underBead ]; // get the bead table
						_exitBead( obead );
					}

					// Not over the grid

					_underBead = _CLEAR;

					// Call _exitGrid if leaving the gird

					if ( _overGrid )
					{
						_exitGrid();
					}
				}
				return;
			}
		}
	}

	// _keyFilter ( key, shift )
	// Translates weird or shifted keycodes to useful values

	function _keyFilter ( key, shift )
	{
		var val;

		val = key; // avoid arg mutation

		// convert lower-case alpha to upper-case if shift key is down

		if ( ( val >= 65 ) && ( val <= 90 ) )
		{
			if ( !shift ) // returns UPPER CASE when NOT shifted!
			{
				val += 32;
			}
		}
		else
		{
			val = _transKeys[ val ];
			if ( shift && ( val < 256 ) )
			{
				val = _shiftedKeys[ val ];
			}
		}

		return val;
	}

	// _legalKey( key )
	// Returns true if key is recognized, else false
	// Allows alphanumerics, enter, backspace, tab and ESC

	function _legalKey ( key )
	{
		return ( ( key >= 32 ) || ( key === 13 ) || ( key === 8 ) || ( key === 9 ) || ( key === 27 ) );
	}

	// _keyDown ( event )
	// DOM event called when a key is pressed

	function _keyDown ( event )
	{
		var fn, any, hardkey, key, len, i;

		fn = "[_keyDown] ";
		any = false;

		// Debugger gets keys when in focus

		if ( _debugFocus )
		{
			event.returnValue = true;
			return true;
		}

		event.preventDefault();
		event.returnValue = false;

		// Call PS.keyDown to report event

		if ( PS.keyDown )
		{
			_holdShift = event.shiftKey;
			_holdCtrl = event.ctrlKey;

			if ( !event.which )
			{
				hardkey = event.keyCode; // IE
			}
			else
			{
				hardkey = event.which; // Others
			}
			key = _keyFilter( hardkey, _holdShift );

//			PS.debug( "D: h = " + hardkey + ", k = " + key +
//				", s = " + _holdShift + ", c = " + _holdCtrl + "\n");

			if ( _legalKey( key ) )
			{
				// if not already pressed ...

				if ( !_pressed[ key ] )
				{
					_pressed[ key ] = 1; // mark key as being pressed

					// If key was previously down in another state, remove from held list

					if ( ( key !== hardkey ) && _pressed[ hardkey ] )
					{
						_pressed[ hardkey ] = 0;

						i = _holding.indexOf( hardkey );
						if ( i >= 0 )
						{
							_holding.splice( i, 1 );
						}
					}

					if ( _holding.length < 1 )
					{
						_keyDelay = _keyInitRate; // set initial repeat delay if no other keys down
					}

					// bug fixed by Mark Diehr

					if ( _holding.indexOf( key ) < 0 )
					{
						_holding.push( key ); // add to list of all keys being held
					}

					try
					{
						PS.keyDown( key, _holdShift, _holdCtrl, _EMPTY );
						any = true;
					}
					catch ( err )
					{
						_errorCatch( fn + "PS.keyDown failed [" + err.message + "]", err );
					}
				}
			}

			// If shift key is pressed,
			// All currently held keys with an alternate shift value
			// must generate a new PS.keyDown event

			else if ( key === _KEY_SHIFT )
			{
				len = _holding.length;
				for ( i = 0; i < len; i += 1 )
				{
					key = hardkey = _holding[ i ]; // get a held key
					if ( ( hardkey >= 97 ) && ( hardkey <= 122 ) ) // if lower-case alpha
					{
						key -= 32; // convert to upper-case
					}
					else if ( hardkey < 256 )
					{
						key = _shiftedKeys[ hardkey ];
					}
					if ( key !== hardkey ) // if they differ
					{
						_pressed[ hardkey ] = 0;
						_pressed[ key ] = 1;
						_holding[ i ] = key; // replace unshifted key with shifted
						try
						{
							PS.keyDown( key, true, _holdCtrl, _EMPTY );
							any = true;
						}
						catch ( err2 )
						{
							_errorCatch( fn + "PS.keyDown failed [" + err2.message + "]", err2 );
						}
					}
				}
			}

			if ( any ) // redraw grid if any keys processed
			{
				_gridDraw();
			}
		}
		return false;
	}

	// _keyUp ( event )
	// DOM event called when key is released

	function _keyUp ( event )
	{
		var fn, any, shift, ctrl, hardkey, key, i, len;

		fn = "[_keyUp] ";
		any = false;

		// Debugger gets keys when in focus

		if ( _debugFocus )
		{
			event.returnValue = true;
			return true;
		}

		event.preventDefault();
		event.returnValue = false;

		// Call PS.keyUp to report event

		if ( PS.keyUp )
		{
			shift = _holdShift = event.shiftKey;
			ctrl = _holdCtrl = event.ctrlKey;

			if ( !event.which )
			{
				hardkey = event.keyCode; // IE
			}
			else
			{
				hardkey = event.which; // Others
			}
			key = _keyFilter( hardkey, _holdShift );

//			PS.debug( "U: h = " + hardkey + ", k = " + key +
//				", s = " + _holdShift + ", c = " + _holdCtrl + "\n");

			if ( _legalKey( key ) )
			{
				// remove from pressed array and held list

				_pressed[ key ] = 0;

				i = _holding.indexOf( key );
				if ( i >= 0 )
				{
					_holding.splice( i, 1 );
				}

				if ( _holding.length < 1 ) // if no other keys held ...
				{
					_keyDelay = 0; // stop repeats
					_holdShift = false;
					_holdCtrl = false;
				}

				try
				{
					PS.keyUp( key, shift, ctrl, _EMPTY );
					any = true;
				}
				catch ( err )
				{
					_errorCatch( fn + "PS.keyUp failed [" + err.message + "]", err );
				}
			}

			// If shift key is released,
			// All currently held keys with an alternate shift value
			// must generate a new PS.keyDown event

			else if ( key === _KEY_SHIFT )
			{
				len = _holding.length;
				for ( i = 0; i < len; i += 1 )
				{
					key = hardkey = _holding[ i ]; // get a held key
					if ( hardkey < 256 )
					{
						key = _unshiftedKeys[ hardkey ]; // get unshifted value
					}
					if ( key !== hardkey ) // if they differ
					{
						_pressed[ hardkey ] = 0;
						_pressed[ key ] = 1;
						_holding[ i ] = key; // replace shifted key with unshifted
						try
						{
							PS.keyDown( key, false, ctrl, _EMPTY );
							any = true;
						}
						catch ( err2 )
						{
							_errorCatch( fn + "PS.keyDown failed [" + err2.message + "]", err2 );
						}
					}
				}
			}

			if ( any ) // redraw grid if any keys processed
			{
				_gridDraw();
			}
		}
		return false;
	}

	// _wheel ( event )
	// DOM event called when mouse wheel is moved

	function _wheel ( event )
	{
		var delta;

		// Only respond when mouse is actually over the grid!

		if ( !_overGrid )
		{
			event.returnValue = true;
			return true;
		}

		// Call PS.input to report the event

		if ( PS.input ) // only if function exists
		{
			if ( !event ) // for IE
			{
				event = window.event;
			}

			delta = Math.max( -1, Math.min( 1, ( event.wheelDelta || -event.detail ) ) );

			// clamp

			if ( delta >= 1 )
			{
				delta = PS.WHEEL_FORWARD;
			}
			else
			{
				delta = PS.WHEEL_BACKWARD;
			}

			// Send delta to user

			try
			{
				PS.input( { wheel : delta }, _EMPTY );
				_gridDraw();
			}
			catch ( err )
			{
				_errorCatch( "PS.input() failed [" + err.message + "]", err );
			}
		}

		event.returnValue = false;
		return false;
	}

	//---------------
	// GRID FUNCTIONS
	//---------------

	// Set grid color
	// Returns rgb

	function _gridColor ( colors )
	{
		var current, fader, rgb, r, g, b;

		current = _grid.color;
		fader = _grid.fader;

		rgb = colors.rgb;
		if ( rgb === PS.CURRENT )
		{
			return current.rgb;
		}
		if ( rgb === null ) // must inspect r/g/b values
		{
			r = colors.r;
			if ( r === PS.CURRENT )
			{
				colors.r = r = current.r;
			}
			else if ( r === PS.DEFAULT )
			{
				colors.r = r = _defaults.grid.color.r;
			}

			g = colors.g;
			if ( g === PS.CURRENT )
			{
				colors.g = g = current.g;
			}
			else if ( g === PS.DEFAULT )
			{
				colors.g = g = _defaults.grid.color.g;
			}

			b = colors.b;
			if ( b === PS.CURRENT )
			{
				colors.b = b = current.b;
			}
			else if ( b === PS.DEFAULT )
			{
				colors.b = b = _defaults.grid.color.b;
			}

			colors.rgb = (r * _RSHIFT) + (g * _GSHIFT) + b;
		}
		else if ( rgb === PS.DEFAULT )
		{
			_copy( _defaults.grid.color, colors );
		}

		// Only change color if different
		// But must also change if fader is active, start color is specified and doesn't match

		if ( ( current.rgb !== colors.rgb ) || ( ( fader.rate > 0 ) && ( fader.rgb !== null ) && ( fader.rgb !== colors.rgb ) ) )
		{
			current.rgb = colors.rgb;

			r = colors.r;
			g = colors.g;
			b = colors.b;

			current.str = colors.str = _RSTR[r] + _GBSTR[g] + _BASTR[b];

			if ( fader.rate > 0 ) // must use fader
			{
				if ( fader.rgb !== null ) // use start color if specified
				{
					_startFader( fader, fader.r, fader.g, fader.b, 255, r, g, b, 255 );
				}
				else if ( !fader.active )
				{
					_startFader( fader, current.r, current.g, current.b, 255, r, g, b, 255 );
				}
				else // must recalculate active fader
				{
					_recalcFader( fader, r, g, b, 255 );
				}
			}
			else
			{
				_gridRGB( colors );
				_gridRGBEnd( colors );
			}

			current.r = r;
			current.g = g;
			current.b = b;
		}

		return current.rgb;
	}

	// Resize grid to dimensions x/y
	// Resets all bead attributes

	function _gridSize ( x, y )
	{
		var size, i, j, cnt, xpos, ypos, bead;

		_initFaders();
		_resetFader( _grid.fader );
		_resetFader( _status.fader );
		_grid.plane = 0;

		// x/y dimensions of grid

		if ( !_grid.ready || ( x !== _grid.x ) || ( y !== _grid.y ) )
		{
			_grid.x = x;
			_grid.y = y;
			_grid.count = x * y;

			// calc size of beads, position/dimensions of centered grid

			if ( x >= y )
			{
				size = Math.floor( _CLIENT_SIZE / x );
				_grid.left = 0;
			}
			else
			{
				size = Math.floor( _CLIENT_SIZE / y );
				_grid.left = Math.floor( ( _CLIENT_SIZE - (size * x ) ) / 2 );
			}

			_grid.bead_size = size;
			_grid.width = size * x;
			_grid.height = size * y;
			_grid.right = _grid.left + _grid.width;
			_grid.top = 0;
			_grid.bottom = _grid.height;

			// Reset height of grid canvas
			// Changing the height also clears the canvas

			if ( y >= x )
			{
				_grid.canvas.height = _CLIENT_SIZE;
			}
			else
			{
				_grid.canvas.height = _grid.height;
			}

			_grid.context.textAlign = "center";
			_grid.context.textBaseline = "middle";

//			_grid.font_size = font_size = Math.floor( ( size / 11 ) * 5 ); // adjusted for Google Droid font
//			font_size_px = font_size + "px";
//			_grid.font_margin = Math.floor( font_size / 2 );

			cnt = 0;
			ypos = _grid.top;
			for ( j = 0; j < y; j += 1 )
			{
				xpos = _grid.left;
				for ( i = 0; i < x; i += 1 )
				{
					bead = _beads[cnt];
					bead.x = i;
					bead.y = j;
					bead.left = xpos;
					bead.right = xpos + size;
					bead.top = ypos;
					bead.bottom = ypos + size;

					_resetBead( bead );
					_rescale( bead );

//					p = bead.glyph_p;
//					p.style.fontSize = font_size_px;
//					if ( bead.visible )
//					{
//						bead.div.style.display = "block";
//					}
//					else
//					{
//						bead.div.style.display = "none";
//					}

					xpos += size;
					cnt += 1;
				}
				ypos += size;
			}

			// hide unused beads

			while ( cnt < _MAX_BEADS )
			{
				bead = _beads[ cnt ];
				bead.visible = false;
				bead.active = false;
				cnt += 1;
			}
		}

		// else just reset beads

		else
		{
			for ( i = 0; i < _grid.count; i += 1 )
			{
				bead = _beads[ i ];
				_resetBead( bead );
				_rescale( bead );
			}
		}

		_anyDirty = true;

		_gridColor( { rgb : PS.DEFAULT } );
		PS.statusColor( PS.DEFAULT );

		_gridDraw();
		_resetCursor();

		_grid.ready = true;
	}

	//-------------
	// BEAD SUPPORT
	//-------------

	// _checkX ( x, fn )
	// Returns floored x value if valid, else PS.ERROR

	function _checkX ( x, fn )
	{
		if ( _typeOf( x ) !== "number" )
		{
			return _error( fn + "x argument not a number" );
		}

		x = Math.floor( x );

		if ( x < 0 )
		{
			return _error( fn + "x argument negative" );
		}
		if ( x >= _grid.x )
		{
			return _error( fn + "x argument exceeds grid width" );
		}

		return x;
	}

	// _checkY ( y, fn )
	// Returns floored y value if valid, else PS.ERROR

	function _checkY ( y, fn )
	{
		if ( _typeOf( y ) !== "number" )
		{
			return _error( fn + "y argument not a number" );
		}

		y = Math.floor( y );

		if ( y < 0 )
		{
			return _error( fn + "y argument negative" );
		}
		if ( y >= _grid.y )
		{
			return _error( fn + "y argument exceeds grid height" );
		}

		return y;
	}

	// Call a bead function with x/y parameter checking
	// [fn] = name of calling function
	// [func] = function to be called
	// [x/y] = grid coordinates of bead
	// [p1-p4] = function parameters
	// Returns function result or PS.ERROR on parameter error

	function _beadExec ( fn, func, x, y, p1, p2, p3, p4 )
	{
		var i, j, result;

		if ( x === PS.ALL )
		{
			if ( y === PS.ALL )// do entire grid
			{
				for ( j = 0; j < _grid.y; j += 1 )
				{
					for ( i = 0; i < _grid.x; i += 1 )
					{
						result = func( i, j, p1, p2, p3, p4 );
						if ( result === PS.ERROR )
						{
							break;
						}
					}
				}
				return result;
			}

			// verify y param

			y = _checkY( y, fn );
			if ( y === PS.ERROR )
			{
				return PS.ERROR;
			}

			for ( i = 0; i < _grid.x; i += 1 )// do entire row
			{
				result = func( i, y, p1, p2, p3, p4 );
				if ( result === PS.ERROR )
				{
					break;
				}
			}
			return result;
		}

		if ( y === PS.ALL )
		{
			// verify x param

			x = _checkX( x, fn );
			if ( x === PS.ERROR )
			{
				return PS.ERROR;
			}

			for ( j = 0; j < _grid.y; j += 1 ) // do entire column
			{
				result = func( x, j, p1, p2, p3, p4 );
				if ( result === PS.ERROR )
				{
					break;
				}
			}
			return result;
		}

		// verify x param

		x = _checkX( x, fn );
		if ( x === PS.ERROR )
		{
			return PS.ERROR;
		}

		// verify y param

		y = _checkY( y, fn );
		if ( y === PS.ERROR )
		{
			return PS.ERROR;
		}

		result = func( x, y, p1, p2, p3, p4 );

		return result;
	}

	function _color ( x, y, colors )
	{
		var id, bead, def, current, fader, rgb, r, g, b;

		id = ( y * _grid.x ) + x;
		bead = _beads[ id ];

		def = _defaults.bead.color;
		current = _colorPlane( bead, _grid.plane );
		fader = bead.fader;

		rgb = colors.rgb;
		if ( !bead.active || ( rgb === PS.CURRENT ) )
		{
			return current.rgb;
		}

		if ( rgb === null ) // must inspect r/g/b values
		{
			r = colors.r;
			if ( r === PS.CURRENT )
			{
				colors.r = r = current.r;
			}
			else if ( r === PS.DEFAULT )
			{
				colors.r = r = def.r;
			}

			g = colors.g;
			if ( g === PS.CURRENT )
			{
				colors.g = g = current.g;
			}
			else if ( g === PS.DEFAULT )
			{
				colors.g = g = def.g;
			}

			b = colors.b;
			if ( b === PS.CURRENT )
			{
				colors.b = b = current.b;
			}
			else if ( b === PS.DEFAULT )
			{
				colors.b = b = def.b;
			}

			colors.rgb = ( r * _RSHIFT ) + ( g * _GSHIFT ) + b;
		}

		else if ( rgb === PS.DEFAULT )
		{
			_copy( def, colors );
		}

		// Only change color if different
		// But must also change if fader is active, start color is specified and doesn't match

		if ( ( current.rgb !== colors.rgb ) || ( ( fader.rate > 0 ) && ( fader.rgb !== null ) && ( fader.rgb !== colors.rgb ) ) )
		{
			// update color plane record

			current.rgb = colors.rgb;
			current.r = colors.r;
			current.g = colors.g;
			current.b = colors.b;

			_recolor( bead ); // recalc bead color
		}

		return current.rgb;
	}

	function _alpha ( x, y, alpha )
	{
		var id, bead, current;

		id = ( y * _grid.x ) + x;
		bead = _beads[ id ];

		current = _colorPlane( bead, _grid.plane );

		if ( bead.active && ( alpha !== PS.CURRENT ) && ( alpha !== current.a ) )
		{
			current.a = alpha;
			_recolor( bead );
		}

		return current.a;
	}

	// _validFadeOptions ( fn, options)
	// Returns validated options object or PS.ERROR

	function _validFadeOptions ( fn, options )
	{
		var type, val, red, blue, green, rval, gval;

		type = _typeOf( options );
		if ( ( type === "undefined" ) || ( options === PS.CURRENT ) )
		{
			return {
				rgb : PS.CURRENT,
				r : 0, g : 0, b : 0,
				onEnd : PS.CURRENT,
				params : PS.CURRENT
			};
		}

		if ( options === PS.DEFAULT )
		{
			return {
				rgb : PS.DEFAULT,
				r : 0, g : 0, b : 0,
				onEnd : PS.DEFAULT,
				params : PS.DEFAULT };
		}

		if ( type !== "object" )
		{
			return _error( fn + "options argument invalid" );
		}

		// Check .rgb

		val = options.rgb;
		if ( ( val !== PS.CURRENT ) && ( val !== PS.DEFAULT ) )
		{
			type = _typeOf( val );
			if ( ( type === "undefined" ) || ( val === null ) )
			{
				options.rgb = PS.CURRENT;
			}
			else if ( type === "number" )
			{
				val = Math.floor( val );
				if ( val <= PS.COLOR_BLACK )
				{
					val = PS.COLOR_BLACK;
					red = 0;
					green = 0;
					blue = 0;
				}
				else if ( val >= PS.COLOR_WHITE )
				{
					val = PS.COLOR_WHITE;
					red = 255;
					green = 255;
					blue = 255;
				}
				else
				{
					red = val / _RSHIFT;
					red = Math.floor( red );
					rval = red * _RSHIFT;

					green = ( val - rval ) / _GSHIFT;
					green = Math.floor( green );
					gval = green * _GSHIFT;

					blue = val - rval - gval;

				}
				options.rgb = val;
				options.r = red;
				options.g = green;
				options.b = blue;
			}
			else
			{
				return _error( fn + "options.rgb property invalid" );
			}
		}

		// Just append r/g/b properties

		else
		{
			options.r = 0;
			options.g = 0;
			options.b = 0;
		}

		// Check .onEnd

		val = options.onEnd;
		if ( ( val !== PS.CURRENT ) && ( val !== PS.DEFAULT ) )
		{
			type = _typeOf( val );
			if ( ( type === "undefined" ) || ( val === null ) )
			{
				options.onEnd = PS.CURRENT;
			}
			else if ( type !== "function" )
			{
				return _error( fn + "options.onEnd property invalid" );
			}
		}

		// Check .params

		val = options.params;
		if ( ( val !== PS.CURRENT ) && ( val !== PS.DEFAULT ) )
		{
			type = _typeOf( val );
			if ( ( type === "undefined" ) || ( val === null ) )
			{
				options.start = PS.CURRENT;
			}
			else if ( type !== "array" )
			{
				return _error( fn + "options.params property invalid" );
			}
		}

		return options;
	}

	function _fade ( x, y, rate, options )
	{
		var id, bead, fader, val;

		id = ( y * _grid.x ) + x;
		bead = _beads[ id ];
		fader = bead.fader;

		if ( bead.active )
		{
			if ( rate !== PS.CURRENT )
			{
				if ( rate === PS.DEFAULT )
				{
					fader.rate = _defaults.fader.rate;
				}
				else
				{
					fader.rate = rate;
				}
			}

			val = options.rgb;
			if ( val !== PS.CURRENT )
			{
				if ( val === PS.DEFAULT )
				{
					fader.rgb = _defaults.fader.rgb;
				}
				else
				{
					fader.rgb = val;
				}
				fader.r = options.r;
				fader.g = options.g;
				fader.b = options.b;
			}

			val = options.onEnd;
			if ( val !== PS.CURRENT )
			{
				if ( val === PS.DEFAULT )
				{
					fader.onEnd = _defaults.fader.onEnd;
				}
				else
				{
					fader.onEnd = val;
				}
			}

			val = options.params;
			if ( val !== PS.CURRENT )
			{
				if ( val === PS.DEFAULT )
				{
					fader.params = _defaults.fader.params;
				}
				else
				{
					fader.params = val;
				}
			}
		}

		return {
			rate : fader.rate,
			rgb : fader.rgb,
			onEnd : fader.onEnd,
			params : fader.params
		};
	}

	function _scale ( x, y, scale )
	{
		var id, bead;

		id = ( y * _grid.x ) + x;
		bead = _beads[ id ];

		if ( bead.active && ( scale !== PS.CURRENT ) && ( bead.scale !== scale ) )
		{
			bead.scale = scale;
			_rescale( bead );
			_makeDirty( bead );
		}

		return bead.scale;
	}

	function _radius ( x, y, radius )
	{
		var id, bead, max;

		id = ( y * _grid.x ) + x;
		bead = _beads[ id ];

		if ( bead.active && ( radius !== PS.CURRENT ) && ( bead.radius !== radius ) )
		{
			bead.radius = radius;

			// If radius > 0, set all borders equal to largest border

			if ( !bead.border.equal && ( radius > 0 ) )
			{
				max = Math.max( bead.border.top, bead.border.left, bead.border.bottom, bead.border.right );
				_equalBorder( bead, max );
			}

			_makeDirty( bead );
		}

		return bead.radius;
	}

	function _data ( x, y, data )
	{
		var id, bead;

		id = ( y * _grid.x ) + x;
		bead = _beads[ id ];

		if ( bead.active && ( data !== PS.CURRENT ) )
		{
			if ( data === null )
			{
				bead.data = _defaults.bead.data;
				bead.fader.data = bead.data;
				bead.borderFader.data = bead.data;
				bead.glyphFader.data = bead.data;
			}
			else
			{
				bead.data = data;
				bead.fader.data = data;
				bead.borderFader.data = data;
				bead.glyphFader.data = data;
			}
		}

		return bead.data;
	}

	function _exec ( x, y, exec )
	{
		var id, bead;

		id = ( y * _grid.x ) + x;
		bead = _beads[ id];

		if ( bead.active && ( exec !== PS.CURRENT ) )
		{
			bead.exec = exec;
		}

		return bead.exec;
	}

	function _visible ( x, y, show )
	{
		var id, bead;

		id = ( y * _grid.x ) + x;
		bead = _beads[ id ];

		if ( bead.active && ( show !== PS.CURRENT ) && ( bead.visible !== show ) )
		{
			bead.visible = show;
			if ( !show )
			{
				bead.fader.kill = true;
				bead.borderFader.kill = true;
				bead.glyphFader.kill = true;
			}
			_makeDirty( bead );
		}

		return bead.visible;
	}

	function _active ( x, y, active )
	{
		var id, bead;

		id = ( y * _grid.x ) + x;
		bead = _beads[ id ];

		if ( active !== PS.CURRENT )
		{
			bead.active = active;
		}

		return bead.active;
	}

	//--------------------
	// BEAD BORDER SUPPORT
	//--------------------

	function _border ( x, y, width )
	{
		var id, bead, max, val, any, top, left, bottom, right;

		id = ( y * _grid.x ) + x;
		bead = _beads[ id ];

		if ( bead.active && ( width !== PS.CURRENT ) )
		{
			max = _borderMax( bead );

			// width is integer

			if ( _typeOf( width ) === "number" )
			{
				if ( width > max )
				{
					width = max;
				}
				if ( width !== bead.border.width )
				{
					_equalBorder( bead, width );
					_makeDirty( bead );
				}
			}

			// width is an object

			else
			{
				any = false;

				// Detect which props are changing and if any are unequal

				// .top

				top = width.top;
				if ( top === PS.CURRENT )
				{
					top = bead.border.top;
				}
				else
				{
					if ( top > max )
					{
						top = max;
					}
					if ( top !== bead.border.top )
					{
						bead.border.top = top;
						any = true;
					}
				}

				// .left

				left = width.left;
				if ( left === PS.CURRENT )
				{
					left = bead.border.left;
				}
				else
				{
					if ( left > max )
					{
						left = max;
					}
					if ( left !== bead.border.left )
					{
						bead.border.left = left;
						any = true;
					}
				}

				// .bottom

				bottom = width.bottom;
				if ( bottom === PS.CURRENT )
				{
					bottom = bead.border.bottom;
				}
				else
				{
					if ( bottom > max )
					{
						bottom = max;
					}
					if ( bottom !== bead.border.bottom )
					{
						bead.border.bottom = bottom;
						any = true;
					}
				}

				// .right

				right = width.right;
				if ( right === PS.CURRENT )
				{
					right = bead.border.right;
				}
				else
				{
					if ( right > max )
					{
						right = max;
					}
					if ( right !== bead.border.right )
					{
						bead.border.right = right;
						any = true;
					}
				}

				// All equal?

				if ( ( top === left ) && ( top === right ) && ( top === bottom ) )
				{
					_equalBorder( bead, top );
					if ( any )
					{
						_makeDirty( bead );
					}
				}

				// Unequal sides allowed only on square beads and beads without glyphs

				else if ( ( bead.radius > 0 ) || ( bead.glyph.code > 0 ) )
				{
					max = Math.max( top, left, bottom, right );
					_equalBorder( bead, max );
					_makeDirty( bead );
				}

				else
				{
					bead.border.equal = false;
					if ( any )
					{
						_makeDirty( bead );
					}
				}
			}
		}

		// Set up return object

		val = {
			top : bead.border.top,
			left : bead.border.left,
			bottom : bead.border.bottom,
			right : bead.border.right,
			equal : bead.border.equal
		};

		// Fix by Mark Diehr

		if ( !bead.border.equal )
		{
			bead.border.width = Math.max( val.top, val.left, val.bottom, val.right );
		}

		val.width = bead.border.width;

		return val;
	}

	function _borderColor ( x, y, colors )
	{
		var id, bead, current, fader, rgb, r, g, b, a;

		id = ( y * _grid.x ) + x;
		bead = _beads[ id ];
		current = bead.border.color;
		fader = bead.borderFader;

		rgb = colors.rgb;
		if ( bead.active && ( rgb !== PS.CURRENT ) )
		{
			if ( rgb === null ) // must inspect r/g/b values
			{
				r = colors.r;
				if ( r === PS.CURRENT )
				{
					colors.r = r = current.r;
				}
				else if ( r === PS.DEFAULT )
				{
					colors.r = r = _defaults.bead.border.color.r;
				}

				g = colors.g;
				if ( g === PS.CURRENT )
				{
					colors.g = g = current.g;
				}
				else if ( g === PS.DEFAULT )
				{
					colors.g = g = _defaults.bead.border.color.g;
				}

				b = colors.b;
				if ( b === PS.CURRENT )
				{
					colors.b = b = current.b;
				}
				else if ( b === PS.DEFAULT )
				{
					colors.b = b = _defaults.bead.border.color.b;
				}

				colors.rgb = (r * _RSHIFT) + (g * _GSHIFT) + b;
			}

			else if ( rgb === PS.DEFAULT )
			{
				_copy( _defaults.bead.border.color, colors );
			}

			// Only change color if different
			// But must also change if fader is active, start color is specified and doesn't match

			if ( ( current.rgb !== colors.rgb ) || ( ( fader.rate > 0 ) && ( fader.rgb !== null ) && ( fader.rgb !== colors.rgb ) ) )
			{
				current.rgb = colors.rgb;

				r = colors.r;
				g = colors.g;
				b = colors.b;

				colors.a = a = current.a;

				current.str = colors.str = _RSTR[ r ] + _GBSTR[ g ] + _GBSTR[ b ] + _ASTR[ a ];

				if ( bead.visible )
				{
					if ( fader.rate > 0 ) // must use fader
					{
						if ( fader.rgb !== null ) // use start color if specified
						{
							_startFader( fader, fader.r, fader.g, fader.b, a, r, g, b, a );
						}
						else if ( !fader.active )
						{
							_startFader( fader, current.r, current.g, current.b, a, r, g, b, a );
						}
						else // must recalculate active fader
						{
							_recalcFader( fader, r, g, b, a );
						}
					}
					else
					{
						_makeDirty( bead );
					}
				}

				// bead is invisible

//				else
//				{
//					_borderRGBA( colors, bead.div );
//				}

				current.r = r;
				current.g = g;
				current.b = b;
			}
		}

		return current.rgb;
	}

	function _borderAlpha ( x, y, alpha )
	{
		var id, bead, current, r, g, b, fader;

		id = ( y * _grid.x ) + x;
		bead = _beads[ id ];

		current = bead.border.color;

		if ( bead.active && ( alpha !== PS.CURRENT ) && ( alpha !== current.a ) )
		{
			r = current.r;
			g = current.g;
			b = current.b;

			current.str = _RSTR[ r ] + _GBSTR[ g ] + _GBSTR[ b ] + _ASTR[ alpha ];

			if ( bead.visible )
			{
				fader = bead.borderFader;
				if ( fader.rate > 0 ) // must use fader
				{
					if ( !fader.active )
					{
						if ( fader.rgb !== null )
						{
							_startFader( fader, fader.r, fader.g, fader.b, current.a, r, g, b, alpha );
						}
						else
						{
							_startFader( fader, r, g, b, current.a, r, g, b, alpha );
						}
					}
					else // must recalculate active fader
					{
						_recalcFader( fader, r, g, b, alpha );
					}
				}
				else
				{
					_makeDirty( bead );
				}
			}

			// bead is invisible

//			else
//			{
//				_borderRGBA( current, bead.div );
//			}

			current.a = alpha;
		}

		return current.a;
	}

	function _borderFade ( x, y, rate, options )
	{
		var id, bead, fader, val;

		id = ( y * _grid.x ) + x;
		bead = _beads[ id ];
		fader = bead.borderFader;

		if ( bead.active )
		{
			if ( rate !== PS.CURRENT )
			{
				if ( rate === PS.DEFAULT )
				{
					fader.rate = _defaults.fader.rate;
				}
				else
				{
					fader.rate = rate;
				}
			}

			val = options.rgb;
			if ( val !== PS.CURRENT )
			{
				if ( val === PS.DEFAULT )
				{
					fader.rgb = _defaults.fader.rgb;
				}
				else
				{
					fader.rgb = val;
				}
				fader.r = options.r;
				fader.g = options.g;
				fader.b = options.b;
			}

			val = options.onEnd;
			if ( val !== PS.CURRENT )
			{
				if ( val === PS.DEFAULT )
				{
					fader.onEnd = _defaults.fader.onEnd;
				}
				else
				{
					fader.onEnd = val;
				}
			}

			val = options.params;
			if ( val !== PS.CURRENT )
			{
				if ( val === PS.DEFAULT )
				{
					fader.params = _defaults.fader.params;
				}
				else
				{
					fader.params = val;
				}
			}
		}

		return {
			rate : fader.rate,
			rgb : fader.rgb,
			onEnd : fader.onEnd,
			params : fader.params
		};
	}

	//--------------
	// GLYPH SUPPORT
	//--------------

	// Expects a NUMERIC glyph

	function _glyph ( x, y, glyph )
	{
		var id, bead, str, max, top, left, bottom, right;

		id = ( y * _grid.x ) + x;
		bead = _beads[ id ];

		if ( bead.active && ( glyph !== PS.CURRENT ) && ( bead.glyph.code !== glyph ) )
		{
			bead.glyph.code = glyph;

			if ( glyph < 1 )
			{
				str = "";
			}
			else
			{
				str = String.fromCodePoint( glyph );
			}

			bead.glyph.str = str;

			max = _borderMax( bead );

			if ( bead.border.equal )
			{
				if ( bead.border.width > max )
				{
					_equalBorder( bead, max );
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
				_equalBorder( bead, max );
			}

			_makeDirty( bead );
		}

		return bead.glyph.code;
	}

	function _glyphColor ( x, y, colors )
	{
		var id, bead, current, fader, rgb, r, g, b, a;

		id = ( y * _grid.x ) + x;
		bead = _beads[ id ];
		current = bead.glyph.color;
		fader = bead.glyphFader;

		rgb = colors.rgb;
		if ( bead.active && ( rgb !== PS.CURRENT ) )
		{
			if ( rgb === null ) // must inspect r/g/b values
			{
				r = colors.r;
				if ( r === PS.CURRENT )
				{
					colors.r = r = current.r;
				}
				else if ( r === PS.DEFAULT )
				{
					colors.r = r = _defaults.bead.glyph.color.r;
				}

				g = colors.g;
				if ( g === PS.CURRENT )
				{
					colors.g = g = current.g;
				}
				else if ( g === PS.DEFAULT )
				{
					colors.g = g = _defaults.bead.glyph.color.g;
				}

				b = colors.b;
				if ( b === PS.CURRENT )
				{
					colors.b = b = current.b;
				}
				else if ( b === PS.DEFAULT )
				{
					colors.b = b = _defaults.bead.glyph.color.b;
				}

				colors.rgb = (r * _RSHIFT) + (g * _GSHIFT) + b;
			}

			else if ( rgb === PS.DEFAULT )
			{
				_copy( _defaults.bead.glyph.color, colors );
			}

			// Only change color if different
			// But must also change if fader is active, start color is specified and doesn't match

			if ( ( current.rgb !== colors.rgb ) || ( ( fader.rate > 0 ) && ( fader.rgb !== null ) && ( fader.rgb !== colors.rgb ) ) )
			{
				current.rgb = colors.rgb;

				r = colors.r;
				g = colors.g;
				b = colors.b;

				colors.a = a = current.a;

				current.str = colors.str = _RSTR[ r ] + _GBSTR[ g ] + _GBSTR[ b ] + _ASTR[ a ];

				if ( bead.visible )
				{
					if ( fader.rate > 0 ) // must use fader
					{
						if ( fader.rgb !== null ) // use start color if specified
						{
							_startFader( fader, fader.r, fader.g, fader.b, a, r, g, b, a );
						}
						if ( !fader.active )
						{
							_startFader( fader, current.r, current.g, current.b, a, r, g, b, a );
						}
						else // must recalculate active fader
						{
							_recalcFader( fader, r, g, b, a );
						}
					}
					else
					{
						_makeDirty( bead );
					}
				}

				// bead is invisible

//				else
//				{
//					_glyphRGBA( colors, bead.glyph_p );
//				}

				current.r = r;
				current.g = g;
				current.b = b;
			}
		}

		return current.rgb;
	}

	function _glyphAlpha ( x, y, alpha )
	{
		var id, bead, current, r, g, b, fader;

		id = ( y * _grid.x ) + x;
		bead = _beads[ id ];

		current = bead.glyph.color;

		if ( bead.active && ( alpha !== PS.CURRENT ) && ( alpha !== current.a ) )
		{
			r = current.r;
			g = current.g;
			b = current.b;

			current.str = _RSTR[ r ] + _GBSTR[ g ] + _GBSTR [b ] + _ASTR[ alpha ];

			if ( bead.visible )
			{
				fader = bead.glyphFader;
				if ( fader.rate > 0 ) // must use fader
				{
					if ( !fader.active )
					{
						_startFader( fader, r, g, b, current.a, r, g, b, alpha );
					}
					else // must recalculate active fader
					{
						_recalcFader( fader, r, g, b, alpha );
					}
				}
				else
				{
					_makeDirty( bead );
				}
			}

			// bead is invisible

//			else
//			{
//				_glyphRGBA( current, bead.glyph_p );
//			}

			current.a = alpha;
		}

		return current.a;
	}

	function _glyphScale ( x, y, scale )
	{
		var id, bead, current;

		id = ( y * _grid.x ) + x;
		bead = _beads[ id ];

		current = bead.glyph.scale;

		if ( bead.active && ( scale !== PS.CURRENT ) && ( scale !== current ) )
		{
			bead.glyph.scale = scale;

			if ( bead.visible )
			{
				_rescaleGlyph( bead );
				_makeDirty( bead );
			}
		}

		return bead.glyph.scale;
	}

	function _glyphFade ( x, y, rate, options )
	{
		var id, bead, fader, val;

		id = ( y * _grid.x ) + x;
		bead = _beads[ id ];
		fader = bead.glyphFader;

		if ( bead.active )
		{
			if ( rate !== PS.CURRENT )
			{
				if ( rate === PS.DEFAULT )
				{
					fader.rate = _defaults.fader.rate;
				}
				else
				{
					fader.rate = rate;
				}
			}

			val = options.rgb;
			if ( val !== PS.CURRENT )
			{
				if ( val === PS.DEFAULT )
				{
					fader.rgb = _defaults.fader.rgb;
				}
				else
				{
					fader.rgb = val;
				}
				fader.r = options.r;
				fader.g = options.g;
				fader.b = options.b;
			}

			val = options.onEnd;
			if ( val !== PS.CURRENT )
			{
				if ( val === PS.DEFAULT )
				{
					fader.onEnd = _defaults.fader.onEnd;
				}
				else
				{
					fader.onEnd = val;
				}
			}

			val = options.params;
			if ( val !== PS.CURRENT )
			{
				if ( val === PS.DEFAULT )
				{
					fader.params = _defaults.fader.params;
				}
				else
				{
					fader.params = val;
				}
			}
		}

		return {
			rate : fader.rate,
			rgb : fader.rgb,
			onEnd : fader.onEnd,
			params : fader.params
		};
	}

	//--------------
	// IMAGE SUPPORT
	//--------------

	// Error handler for image loading

	function _imageError ( image )
	{
		var id, len, i, rec, exec;

		id = image.getAttribute( "data-id" ); // the user function id

		// find the matching image record

		len = _imageList.length;
		for ( i = 0; i < len; i += 1 )
		{
			rec = _imageList[ i ];
			if ( rec.id === id ) // here it is!
			{
				exec = rec.exec;
				_imageList.splice( i, 1 ); // delete the record
				break;
			}
		}

		try
		{
			exec( PS.ERROR ); // call user function with error string
		}
		catch ( err )
		{
			_errorCatch( "[PS.imageLoad] .exec function failed [" + err.message + "]", err );
		}

		_error( "[PS.imageLoad] Error loading " + image.src );
	}

	// Return an image table from an imageData file
	// Optional [format] determines pixel format (1, 2, 3, 4)

	function _imageExtract ( imageData, format )
	{
		var fn, w, h, ctx, srcImage, destImage, src, len, dest, i, j, r, g, b, a;

		fn = "[_imageExtract] ";

		// check validity of image structure

		w = imageData.width;
		if ( ( _typeOf( w ) !== "number" ) || ( w < 1 ) )
		{
			return _error( fn + "image width invalid" );
		}
		w = Math.floor( w );

		h = imageData.height;
		if ( ( _typeOf( h ) !== "number" ) || ( h < 1 ) )
		{
			return _error( fn + "image height invalid" );
		}
		h = Math.floor( h );

		// draw the image onto the offscreen canvas

		try
		{
			_imageCanvas.width = w; // this clears the offscreen canvas
			_imageCanvas.height = h;
			ctx = _imageCanvas.getContext( "2d" );
			ctx.drawImage( imageData, 0, 0, w, h, 0, 0, w, h );
		}
		catch ( e1 )
		{
			return _errorCatch( fn + "image extraction failed @ 1 [" + e1.message + "]", e1 );
		}

		// fetch the source's image data

		try
		{
			srcImage = ctx.getImageData( 0, 0, w, h );
		}
		catch ( e2 )
		{
			return _errorCatch( fn + "image extraction failed @ 2 [" + e2.message + "]", e2 );
		}

		// srcImage is read-only for some reason
		// so make a copy of it in destImage

		destImage = {
			width : srcImage.width,
			height : srcImage.height
		};

		src = srcImage.data; // source array
		len = src.length; // and its length

		dest = []; // new dest array

		j = i = 0;
		if ( format === 1 )
		{
			dest.length = len / 4;
			while ( i < len )
			{
				r = src[ i ]; // r
				g = src[ i + 1 ]; // g
				b = src[ i + 2 ]; // b

				dest[ j ] = ( r * _RSHIFT ) + ( g * _GSHIFT ) + b;

				i += 4;
				j += 1;
			}
		}
		else if ( format === 2 )
		{
			dest.length = len / 2;
			while ( i < len )
			{
				r = src[ i ]; // r
				g = src[ i + 1 ]; // g
				b = src[ i + 2 ]; // b
				a = src[ i + 3 ]; // a

				dest[ j ] = ( r * _RSHIFT ) + ( g * _GSHIFT ) + b;
				dest[ j + 1 ] = a;

				i += 4;
				j += 2;
			}
		}
		else if ( format === 3 )
		{
			dest.length = ( len / 4 ) * 3;
			while ( i < len )
			{
				r = src[ i ]; // r
				g = src[ i + 1 ]; // g
				b = src[ i + 2 ]; // b

				dest[ j ] = r;
				dest[ j + 1 ] = g;
				dest[ j + 2 ] = b;

				i += 4;
				j += 3;
			}
		}
		else // format 4
		{
			dest.length = len;
			while ( i < len )
			{
				dest[ i ] = src[ i ]; // r
				i += 1;
				dest[ i ] = src[ i ]; // g
				i += 1;
				dest[ i ] = src[ i ]; // b
				i += 1;
				dest[ i ] = src[ i ]; // a
				i += 1;
			}
		}

		destImage.pixelSize = format;
		destImage.data = dest;
		return destImage;
	}

	// System loader for images

	function _imageLoad ( image )
	{
		var id, len, i, rec, exec, format, source, idata;

		id = image.getAttribute( "data-id" ); // the user function id

		// find the matching image record

		len = _imageList.length;
		for ( i = 0; i < len; i += 1 )
		{
			rec = _imageList[ i ];
			if ( rec.id === id ) // here it is!
			{
				exec = rec.exec;
				format = rec.format;
				source = rec.source;
				_imageList.splice( i, 1 ); // delete the record
				break;
			}
		}

		idata = _imageExtract( image, format ); // extract the data
		if ( idata !== PS.ERROR )
		{
			try
			{
				idata.source = source;
				idata.id = id;
				exec( idata ); // call user function with image object
			}
			catch ( err )
			{
				_errorCatch( "[PS.imageLoad] .exec function failed [" + err.message + "]", err );
			}
		}
	}

	// Validate an image object
	// Returns true if image structure is valid, else PS.ERROR

	function _validImage ( fn, image )
	{
		var w, h, format, total, data, len, i, val;

		// Verify image properties

		if ( _typeOf( image ) !== "object" )
		{
			return _error( fn + "image argument not an object" );
		}

		w = image.width;
		if ( _typeOf( w ) !== "number" )
		{
			return _error( fn + "image.width not a number" );
		}
		w = Math.floor( w );
		if ( w < 1 )
		{
			return _error( fn + "image.width < 1" );
		}
		image.width = w;

		h = image.height;
		if ( _typeOf( h ) !== "number" )
		{
			return _error( fn + "image.height not a number" );
		}
		h = Math.floor( h );
		if ( h < 1 )
		{
			return _error( fn + "image.height < 1" );
		}
		image.height = h;

		format = image.pixelSize;
		if ( _typeOf( format ) !== "number" )
		{
			return _error( fn + "image.pixelSize not a number" );
		}
		format = Math.floor( format );
		if ( ( format < 1 ) && ( format > 4 ) )
		{
			return _error( fn + "image.pixelSize is not 1, 2, 3 or 4" );
		}
		image.pixelSize = format;

		// verify data is expected length

		data = image.data;
		if ( _typeOf( data ) !== "array" )
		{
			return _error( fn + "image.data is not an array" );
		}

		len = data.length;
		total = w * h * format;
		if ( len !== total )
		{
			return _error( fn + "image.data length invalid" );
		}

		// Quick check of data values
		// Would be nice if a previously validated image could be marked somehow ...

		for ( i = 0; i < len; i += 1 )
		{
			val = data[ i ];
			if ( _typeOf( val ) !== "number" )
			{
				return _error( fn + "image.data[" + i + "] not a number" );
			}
			if ( val < 0 )
			{
				return _error( fn + "image.data[" + i + "] negative" );
			}
			if ( format < 3 )
			{
				if ( val > 0xFFFFFF )
				{
					return _error( fn + "image.data[" + i + "] > 0xFFFFFF" );
				}
			}
			else if ( val > 255 )
			{
				return _error( fn + "image.data[" + i + "] > 255" );
			}
		}

		return true;
	}

	// Print a value in hex with optional zero padding

	function _hex ( data, pad )
	{
		var str, i;

		str = data.toString( 16 ).toUpperCase();
		if ( pad )
		{
			i = str.length;
			while ( i < pad )
			{
				str = "0" + str;
				i += 1;
			}
		}
		return ( "0x" + str );
	}

	function _outputPixel ( format, hex, rgb, r, g, b, a )
	{
		var str;

		if ( format < 3 ) // formats 1 & 2
		{
			str = "";
			if ( hex )
			{
				str += _hex( rgb, 6 );
			}
			else
			{
				str += rgb;
			}

			if ( format === 2 )
			{
				if ( hex )
				{
					str += ( ", " + _hex( a, 2 ) );
				}
				else
				{
					str += ( ", " + a );
				}
			}
		}

		else // format 3 & 4
		{
			if ( hex )
			{
				str = _hex( r, 2 ) + ", " + _hex( g, 2 ) + ", " + _hex( b, 2 );
			}
			else
			{
				str = r + ", " + g + ", " + b;
			}
			if ( format === 4 )
			{
				if ( hex )
				{
					str += ( ", " + _hex( a, 2 ) );
				}
				else
				{
					str += ( ", " + a );
				}
			}
		}

		return str;
	}

	// --------------
	// SPRITE SUPPORT
	// --------------

	function _newSprite ()
	{
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
			id : _SPRITE_PREFIX + _spriteCnt,
			placed : false,
			visible : true,
			x : 0, y : 0, ax : 0, ay : 0,
			image : null,
			color : null,
			collide : null,
			width : 0, height : 0,
			plane : -1
		};

		_spriteCnt += 1;
		_sprites.push( s );
		return s;
	}

	// Returns sprite object if [sprite] is a valid sprite reference, else PS.ERROR

	function _getSprite ( sprite, fn )
	{
		var len, i, s;

		if ( ( typeof sprite !== "string" ) || ( sprite.length < 1 ) )
		{
			return _error( fn + "sprite argument invalid" );
		}

		len = _sprites.length;
		for ( i = 0; i < len; i += 1 )
		{
			s = _sprites[ i ];
			if ( s.id === sprite )
			{
				return s;
			}
		}

		return _error( fn + "sprite id '" + sprite + "' does not exist" );
	}

	// Erase a sprite, using optional region
	// Compensate for axis, don't touch anything off grid

	function _eraseSprite ( s, left, top, width, height )
	{
		var xmax, ymax, right, bottom, x, y, bead, i, color;

		if ( left === undefined )
		{
			left = s.x;
			top = s.y;
			width = s.width;
			height = s.height;
		}

		// Calc actual left/width

		xmax = _grid.x;
		left -= s.ax;
		if ( left >= xmax ) // off grid?
		{
			return;
		}
		if ( left < 0 )
		{
			width += left;
			if ( width < 1 ) // off grid?
			{
				return;
			}
			left = 0;
		}
		if ( ( left + width ) > xmax )
		{
			width = xmax - left;
		}
		right = left + width;

		// Calc actual top/height

		ymax = _grid.y;
		top -= s.ay;
		if ( top >= ymax ) // off grid?
		{
			return;
		}
		if ( top < 0 )
		{
			height += top;
			if ( height < 1 ) // off grid?
			{
				return;
			}
			top = 0;
		}
		if ( ( top + height ) > ymax )
		{
			height = ymax - top;
		}
		bottom = top + height;

		for ( y = top; y < bottom; y += 1 )
		{
			for ( x = left; x < right; x += 1 )
			{
				i = x + ( y * xmax ); // get index of bead
				bead = _beads[ i ];
				if ( bead.active )
				{
					color = _colorPlane( bead, s.plane );
					color.r = 255;
					color.g = 255;
					color.b = 255;
					color.a = 0;
					color.rgb = 0xFFFFFF;
					_recolor( bead ); // recolor with no fader
				}
			}
		}
	}

	// Draw a solid or image sprite
	// Compensate for axis, don't touch anything off grid

	function _drawSprite ( s )
	{
		var width, height, xmax, ymax, left, top, right, bottom, scolor, x, y, bead, i, bcolor, data, ptr, r, g, b, a;

		width = s.width;
		height = s.height;
		if ( ( width < 1 ) || ( height < 1 ) )
		{
			return;
		}

		// Calc actual left/width

		xmax = _grid.x;
		left = s.x - s.ax;
		if ( left >= xmax ) // off grid?
		{
			return;
		}
		if ( left < 0 )
		{
			width += left;
			if ( width < 1 ) // off grid?
			{
				return;
			}
			left = 0;
		}
		if ( ( left + width ) > xmax )
		{
			width = xmax - left;
		}
		right = left + width;

		// Calc actual top/height

		ymax = _grid.y;
		top = s.y + s.ay;
		if ( top >= ymax ) // off grid?
		{
			return;
		}
		if ( top < 0 )
		{
			height += top;
			if ( height < 1 ) // off grid?
			{
				return;
			}
			top = 0;
		}
		if ( ( top + height ) > ymax )
		{
			height = ymax - top;
		}
		bottom = top + height;

		scolor = s.color;
		if ( scolor ) // solid sprite
		{
			for ( y = top; y < bottom; y += 1 )
			{
				for ( x = left; x < right; x += 1 )
				{
					i = x + ( y * xmax ); // get index of bead
					bead = _beads[ i ];
					if ( bead.active )
					{
						bcolor = _colorPlane( bead, s.plane );
						bcolor.rgb = scolor.rgb;
						bcolor.r = scolor.r;
						bcolor.g = scolor.g;
						bcolor.b = scolor.b;
						bcolor.a = scolor.a;
						_recolor( bead );
					}
				}
			}
		}
		else // image sprite
		{
			data = s.image.data;
			ptr = 0;
			for ( y = top; y < bottom; y += 1 )
			{
				for ( x = left; x < right; x += 1 )
				{
					i = x + ( y * xmax ); // get index of bead
					bead = _beads[ i ];
					if ( bead.active )
					{
						r = data[ ptr ];
						g = data[ ptr + 1 ];
						b = data[ ptr + 2 ];
						a = data[ ptr + 3 ];

						bcolor = _colorPlane( bead, s.plane );
						bcolor.rgb = ( r * _RSHIFT ) + ( g + _GSHIFT ) + b;
						bcolor.r = r;
						bcolor.g = g;
						bcolor.b = b;
						bcolor.a = a;
						_recolor( bead );
					}
					ptr += 4;
				}
			}
		}
	}

	// See if sprite [s, id] is touching or overlapping any other sprite
	// Send collision messages as needed

	function _collisionCheck ( s, id )
	{
		var fn, len, i, x, y, w, h, exec, s2, id2, x2, y2, w2, h2, exec2, dx, dy, evt;

		fn = "[_collisionCheck] ";

		x = s.x - s.ax;
		y = s.y - s.ay;
		w = s.width;
		h = s.height;
		exec = s.collide;

		len = _sprites.length;
		for ( i = 0; i < len; i += 1 )
		{
			s2 = _sprites[ i ];
			id2 = s2.id;
			if ( ( id2 !== id ) && s2.visible && s2.placed )
			{
				x2 = s2.x - s2.ax;
				y2 = s2.y - s2.ay;
				w2 = s2.width;
				h2 = s2.height;
				exec2 = s2.collide;

				// calc dx

				if ( x2 > x )
				{
					dx = x2 - x;
				}
				else
				{
					dx = x - x2;
				}

				// Calc dy

				if ( y2 > y )
				{
					dy = y2 - y;
				}
				else
				{
					dy = y - y2;
				}

				evt = null; // assume no collision

				// Adjacent horizontally?

				if ( (x === (x2 - w)) || (x === (x2 + w2)) )
				{
					if ( ((y <= y2) && (dy <= h)) || ((y >= y2) && (dy <= h2)) )
					{
						evt = PS.SPRITE_TOUCH;
					}
				}

				// Adjacent vertically?

				else if ( (y === (y2 - h)) || (y === (y2 + h2)) )
				{
					if ( ((x <= x2) && (dx <= w)) || ((x >= x2) && (dx <= w2)) )
					{
						evt = PS.SPRITE_TOUCH;
					}
				}

				else if ( (x >= x2) && (x < (x2 + w2)) )
				{
					if ( ((y <= y2) && (dy < h)) || ((y >= y2) && (dy < h2)) )
					{
						evt = PS.SPRITE_OVERLAP;
					}
				}

				else if ( (x2 >= x) && (x2 < (x + w)) )
				{
					if ( ((y2 <= y) && (dy < h2)) || ((y2 >= y) && (dy < h)) )
					{
						evt = PS.SPRITE_OVERLAP;
					}
				}

				if ( evt )
				{
					// Report s1's collision with s2

					if ( exec )
					{
						try
						{
							exec( id, s.plane, id2, s2.plane, evt );
						}
						catch ( e1 )
						{
							_errorCatch( fn + id + " collide function failed [" + e1.message + "]", e1 );
							return;
						}
					}

					// Report s2's collision with s1

					if ( exec2 )
					{
						try
						{
							exec2( id2, s2.plane, id, s.plane, evt );
						}
						catch ( e2 )
						{
							_errorCatch( fn + id2 + " collide function failed [" + e2.message + "]", e2 );
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

	function BinaryHeap ( scoreFunction )
	{
		this.content = [];
		this.scoreFunction = scoreFunction;
	}

	BinaryHeap.prototype =
	{
		push : function ( element )
		{
			// Add the new element to the end of the array

			this.content.push( element );

			// Allow it to bubble up

			this.bubbleUp( this.content.length - 1 );
		},

		pop : function ()
		{
			var result, end;

			// Store the first element so we can return it later.

			result = this.content[ 0 ];

			// Get the element at the end of the array.

			end = this.content.pop();

			// If there are any elements left, put the end element at the
			// start, and let it sink down.

			if ( this.content.length > 0 )
			{
				this.content[ 0 ] = end;
				this.sinkDown( 0 );
			}
			return result;
		},

		remove : function ( node )
		{
			var len, i, end;

			len = this.content.length;

			// To remove a value, we must search through the array to find it

			for ( i = 0; i < len; i += 1 )
			{
				if ( this.content[i] === node )
				{
					// When it is found, the process seen in 'pop' is repeated to fill up the hole

					end = this.content.pop();

					// If the element we popped was the one we needed to remove, we're done

					if ( i !== ( len - 1 ) )
					{
						// Otherwise, we replace the removed element with the popped one, and allow it to float up or sink down as appropriate

						this.content[ i ] = end;
						this.bubbleUp( i );
						this.sinkDown( i );
					}
					break;
				}
			}
		},

		size : function ()
		{
			var len;

			len = this.content.length;
			return len;
		},

		bubbleUp : function ( n )
		{
			var element, score, parentN, parent;

			// Fetch the element that has to be moved

			element = this.content[ n ];
			score = this.scoreFunction( element );

			// When at 0, an element can not go up any further

			while ( n > 0 )
			{
				// Compute the parent element's index, and fetch it

				parentN = Math.floor( ( n + 1 ) / 2 ) - 1;
				parent = this.content[ parentN ];

				// If the parent has a lesser score, things are in order and we are done

				if ( score >= this.scoreFunction( parent ) )
				{
					break;
				}

				// Otherwise, swap the parent with the current element and continue

				this.content[ parentN ] = element;
				this.content[ n ] = parent;
				n = parentN;
			}
		},

		sinkDown : function ( n )
		{
			var len, element, elemScore, child1N, child2N, swap, child1, child1Score, child2, child2Score;

			// Look up the target element and its score

			len = this.content.length;
			element = this.content[ n ];
			elemScore = this.scoreFunction( element );

			while ( true )
			{
				// Compute the indices of the child elements

				child2N = ( n + 1 ) * 2;
				child1N = child2N - 1;

				// This is used to store the new position of the element, if any

				swap = null;

				// If the first child exists (is inside the array)...

				if ( child1N < len )
				{
					// Look it up and compute its score

					child1 = this.content[ child1N ];
					child1Score = this.scoreFunction( child1 );

					// If the score is less than our element's, we need to swap

					if ( child1Score < elemScore )
					{
						swap = child1N;
					}
				}

				// Do the same checks for the other child

				if ( child2N < len )
				{
					child2 = this.content[ child2N ];
					child2Score = this.scoreFunction( child2 );

					if ( child2Score < ( swap === null ? elemScore : child1Score ) )
					{
						swap = child2N;
					}
				}

				// No need to swap further, we are done

				if ( swap === null )
				{
					break;
				}

				// Otherwise, swap and continue

				this.content[ n ] = this.content[ swap ];
				this.content[ swap ] = element;
				n = swap;
			}
		},

		rescore : function ( e )
		{
			this.sinkDown( this.content.indexOf( e ) );
		}
	};

	//--------------
	// A* PATHFINDER
	//--------------

	// Returns a straight line between x1|y1 and x2|y2

	function _line ( x1, y1, x2, y2 )
	{
		var dx, dy, sx, sy, err, e2, line;

		if ( x2 > x1 )
		{
			dx = x2 - x1;
		}
		else
		{
			dx = x1 - x2;
		}

		if ( y2 > y1 )
		{
			dy = y2 - y1;
		}
		else
		{
			dy = y1 - y2;
		}

		if ( x1 < x2 )
		{
			sx = 1;
		}
		else
		{
			sx = -1;
		}

		if ( y1 < y2 )
		{
			sy = 1;
		}
		else
		{
			sy = -1;
		}

		err = dx - dy;

		line = [ ];

		while ( ( x1 !== x2 ) || ( y1 !== y2 ) )
		{
			e2 = err * 2;
			if ( e2 > -dy )
			{
				err -= dy;
				x1 += sx;
			}
			if ( ( x1 === x2 ) && ( y1 === y2 ) )
			{
				line.push( [ x1, y1 ] );
				break;
			}
			if ( e2 < dx )
			{
				err += dx;
				y1 += sy;
			}
			line.push( [ x1, y1 ] );
		}

		return line;
	}

	//	Returns a straight line between x1|y1 and x2|y2, or null if wall blocks path
	// If [corner] = true, stops if line will cut across a wall corner

	function _lineWall ( nodes, width, x1, y1, x2, y2 )
	{
		var dx, dy, sx, sy, err, e2, line, node, ptr;

		if ( x2 > x1 )
		{
			dx = x2 - x1;
		}
		else
		{
			dx = x1 - x2;
		}

		if ( y2 > y1 )
		{
			dy = y2 - y1;
		}
		else
		{
			dy = y1 - y2;
		}

		if ( x1 < x2 )
		{
			sx = 1;
		}
		else
		{
			sx = -1;
		}

		if ( y1 < y2 )
		{
			sy = 1;
		}
		else
		{
			sy = -1;
		}

		err = dx - dy;
		line = [ ];

		while ( ( x1 !== x2 ) || ( y1 !== y2 ) )
		{
			e2 = err * 2;
			if ( e2 > -dy )// moving left/right
			{
				err -= dy;
				x1 += sx;
			}
			if ( ( x1 === x2 ) && ( y1 === y2 ) )
			{
				line.push( [ x1, y1 ] );
				// we already know dest is walkable
				return line;
			}
			if ( e2 < dx )// moving up/down
			{
				err += dx;
				y1 += sy;
			}

			// Is this loc walkable?

			ptr = ( y1 * width ) + x1;
			node = nodes[ ptr ];
			if ( !node.value )// no; we're done
			{
				return null;
			}
			line.push( [ x1, y1 ] );
		}

		return line;
	}

	// _heuristic ( x1, y1, x2, y2 )

	function _heuristic ( x1, y1, x2, y2 )
	{
		var dx, dy, h;

		if ( x2 > x1 )
		{
			dx = x2 - x1;
		}
		else
		{
			dx = x1 - x2;
		}

		if ( y2 > y1 )
		{
			dy = y2 - y1;
		}
		else
		{
			dy = y1 - y2;
		}

		if ( dx > dy )
		{
			h = ( dy * _DIAGONAL_COST ) + ( dx - dy );
		}
		else
		{
			h = ( dx * _DIAGONAL_COST ) + ( dy - dx );
		}
		return h;
	}

	// _neighbors ( nodes, width, height, current )
	// Creates an array of all neighbor nodes
	// Stays inside grid and avoids walls
	// If [no_diagonals] = true, diagonals are not searched
	// If [cut_corners] = true, diagonal cutting around corners is enabled
	// Some of these calcs could be done when creating the nodes ...

	function _neighbors ( nodes, width, height, current, no_diagonals, cut_corners )
	{
		var result, x, y, right, bottom, north, south, center, nx, ptr, node, nwall, swall, ewall, wwall;

		result = [];
		x = current.x;
		y = current.y;
		right = width - 1;
		bottom = height - 1;
		center = y * width;
		north = ( y - 1 ) * width;
		south = ( y + 1 ) * width;
		nwall = false;
		swall = false;
		ewall = false;
		wwall = false;

		if ( x > 0 )
		{
			nx = x - 1;

			// west

			ptr = center + nx;
			node = nodes[ ptr ];
			if ( !node.value )
			{
				wwall = true;
			}
			else if ( !node.closed )
			{
				node.cost = node.value;
				result.push( node );
			}
		}

		if ( x < right )
		{
			nx = x + 1;

			// east

			ptr = center + nx;
			node = nodes[ ptr ];
			if ( !node.value )
			{
				ewall = true;
			}
			else if ( !node.closed )
			{
				node.cost = node.value;
				result.push( node );
			}
		}

		if ( y > 0 )
		{
			// north

			ptr = north + x;
			node = nodes[ ptr ];
			if ( !node.value )
			{
				nwall = true;
			}
			else if ( !node.closed )
			{
				node.cost = node.value;
				result.push( node );
			}
		}

		if ( y < bottom )
		{
			// south

			ptr = south + x;
			node = nodes[ ptr ];
			if ( !node.value )
			{
				swall = true;
			}
			else if ( !node.closed )
			{
				node.cost = node.value;
				result.push( node );
			}
		}

		if ( !no_diagonals )
		{
			if ( x > 0 )
			{
				nx = x - 1;
				if ( ( y > 0 ) && ( cut_corners || ( !wwall && !nwall ) ) )
				{
					// northwest

					ptr = north + nx;
					node = nodes[ ptr ];
					if ( node.value && !node.closed )
					{
						node.cost = node.value * _DIAGONAL_COST;
						result.push( node );
					}
				}
				if ( ( y < bottom ) && ( cut_corners || ( !wwall && !swall ) ) )
				{
					// southwest

					ptr = south + nx;
					node = nodes[ ptr ];
					if ( node.value && !node.closed )
					{
						node.cost = node.value * _DIAGONAL_COST;
						result.push( node );
					}
				}
			}
			if ( x < right )
			{
				nx = x + 1;
				if ( ( y > 0 ) && ( cut_corners || ( !nwall && !ewall ) ) )
				{
					// northeast

					ptr = north + nx;
					node = nodes[ ptr ];
					if ( node.value && !node.closed )
					{
						node.cost = node.value * _DIAGONAL_COST;
						result.push( node );
					}
				}
				if ( ( y < bottom ) && ( cut_corners || ( !swall && !ewall ) ) )
				{
					// southeast

					ptr = south + nx;
					node = nodes[ ptr ];
					if ( node.value && !node.closed )
					{
						node.cost = node.value * _DIAGONAL_COST;
						result.push( node );
					}
				}
			}
		}

		return result;
	}

	// _score ( node )
	// Scoring function for nodes

	function _score ( node )
	{
		return node.f;
	}

	// _findPath ( pm, x1, y1, x2, y2, no_diagonals, cut_corners )
	// Returns an array of x/y coordinates

	function _findPath ( pm, x1, y1, x2, y2, no_diagonals, cut_corners )
	{
		var width, height, nodes, ptr, node, path, len, heap, current, neighbors, nlen, i, n, gScore, beenVisited, here;

		// If current loc is same as dest, return empty path

		if ( ( x1 === x2 ) && ( y1 === y2 ) )
		{
			return [];
		}

		width = pm.width;
		height = pm.height;
		nodes = pm.nodes;

		// If either location is in a wall, return empty path

		ptr = ( y1 * width ) + x1;
		node = nodes[ ptr ];
		if ( !node.value )
		{
			return [];
		}

		ptr = ( y2 * width ) + x2;
		node = nodes[ ptr ];
		if ( !node.value )
		{
			return [];
		}

		// Check if a straight line works

		if ( !no_diagonals )
		{
			path = _lineWall( nodes, width, x1, y1, x2, y2 );
			if ( path )
			{
				return path;
			}
		}

		// Reset all nodes

		len = nodes.length;
		for ( i = 0; i < len; i += 1 )
		{
			node = nodes[ i ];
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

		heap = new BinaryHeap( _score );

		// Init with starting node

		ptr = ( y1 * width ) + x1;
		node = nodes[ ptr ];
		heap.push( node );

		// Main loop

		while ( heap.size() > 0 )
		{
			current = heap.pop();

			if ( ( current.x === x2 ) && ( current.y === y2 ) )
			{
				// create path

				here = current;
				while ( here.parent )
				{
					path.push( [ here.x, here.y ] );
					here = here.parent;
				}
				path.reverse();
				break;
			}

			current.closed = true;

			neighbors = _neighbors( nodes, width, height, current, no_diagonals, cut_corners );

			nlen = neighbors.length;
			for ( i = 0; i < nlen; i += 1 )
			{
				n = neighbors[ i ];

				// The g score is the shortest distance from start to current node
				// We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet

				gScore = current.g + n.cost;

				beenVisited = n.visited;

				if ( !beenVisited || ( gScore < n.g ) )
				{
					// Found an optimal (so far) path to this node
					// Take score for node to see how good it is

					n.visited = true;
					n.parent = current;
					n.h = n.h || _heuristic( n.x, n.y, x2, y2 );
					n.g = gScore;
					n.f = n.g + n.h;

					if ( !beenVisited )
					{
						heap.push( n ); // Pushing to heap will put it in proper place based on 'f' value
					}
					else
					{
						heap.rescore( n ); // Already seen node, but rescored so reorder it in heap
					}
				}
			}
		}

		return path;
	}

	// _pathData ( pm, left, top, width, height, data )
	// If [data] = PS.CURRENT, no data changed
	// If [data] = PS.DEFAULT, revert to original value
	// Else change pathmap value to [data]
	// Returns array of data at each point in region

	function _pathData ( pm, left, top, width, height, data )
	{
		var result, nodes, bottom, ptr, x, y, i, node;

		result = [];
		result.length = width * height;

		nodes = pm.nodes;
		bottom = top + height;

		i = 0; // output index

		for ( y = top; y < bottom; y += 1 )
		{
			ptr = ( y * pm.width ) + left; // point to first node in row
			for ( x = 0; x < width; x += 1 )
			{
				node = nodes[ ptr ];
				if ( data !== PS.CURRENT ) // just get current value
				{
					if ( data === PS.DEFAULT )
					{
						node.value = node.ovalue; // restore original value
					}
					else
					{
						node.value = data; // use new value
					}
				}
				result[ i ] = node.value;
				i += 1;
				ptr += 1;
			}
		}

		return result;
	}

	// _newMap ( width, height, data )
	// Creates a new pathmap object and returns its id
	// [data] should be a 1-dimensional numeric array with [width] * [height] elements
	// 0 elements are walls, non-zero elements are floor (relative value determines weighting)

	function _newMap ( width, height, data )
	{
		var nodes, len, ptr, x, y, node, val, pm;

		// Initialize node structure

		len = data.length;

		nodes = [];
		nodes.length = len;

		ptr = 0;
		for ( y = 0; y < height; y += 1 )
		{
			for ( x = 0; x < width; x += 1 )
			{
				val = data[ ptr ];
				node = {
					x : x,
					y : y,
					value : val,
					ovalue : val,
					f : 0,
					g : 0,
					h : 0,
					cost : 0,
					parent : null,
					closed : false,
					visited : false
				};
				nodes[ ptr ] = node;
				ptr += 1;
			}
		}

		pm = {
			id : _PATHMAP_PREFIX + _pathmapCnt,
			width : width,
			height : height,
			nodes : nodes
		};

		_pathmapCnt += 1;
		_pathmaps.push( pm );

		return pm;
	}

	// _getMap( id )
	// Returns pathmap matching [id], null if none found

	function _getMap ( pathmap )
	{
		var len, i, pm;

		len = _pathmaps.length;
		for ( i = 0; i < len; i += 1 )
		{
			pm = _pathmaps[ i ];
			if ( pm.id === pathmap )
			{
				return pm;
			}
		}
		return null;
	}

	// _deleteMap( id )
	// Deletes [pathmap], returns true if deleted or false if path not found

	function _deleteMap ( pathmap )
	{
		var len, i, pm, nodes, j;

		len = _pathmaps.length;
		for ( i = 0; i < len; i += 1 )
		{
			pm = _pathmaps[ i ];
			if ( pm.id === pathmap )
			{
				// Explcitly nuke each node to help garbage collector

				nodes = pm.nodes;
				len = nodes.length;
				for ( j = 0; j < len; j += 1 )
				{
					nodes[ j ] = null;
				}
				pm.nodes = null; // nuke the array too

				_pathmaps.splice( i, 1 );
				return true;
			}
		}
		return false;
	}

	// Find closest walkable point in source direction
	// [x1|y1] is current, [x2|y2] is clicked location

	function _pathNear ( pm, x1, y1, x2, y2 )
	{
		var nodes, width, height, level, nlist, left, top, right, bottom, start, end, ptr, i, node, len, min, j, cnt, pos;

		nodes = pm.nodes;
		width = pm.width;
		height = pm.height;

		level = 1;
		while ( level < width )
		{
			nlist = [];

			left = x2 - level;
			right = x2 + level;
			top = y2 - level;
			bottom = y2 + level;

			// top/bottom sides

			start = left;
			if ( start < 0 )
			{
				start = 0;
			}
			end = right + 1;
			if ( end >= width )
			{
				end = width;
			}

			// top

			if ( top >= 0 )
			{
				ptr = ( top * width ) + start;
				for ( i = start; i < end; i += 1 )
				{
					node = nodes[ ptr ];
					if ( node.value )
					{
						nlist.push( [ node.x, node.y ] );
					}
					ptr += 1;
				}
			}

			// bottom

			if ( bottom < height )
			{
				ptr = ( bottom * width ) + start;
				for ( i = start; i < end; i += 1 )
				{
					node = nodes[ ptr ];
					if ( node.value )
					{
						nlist.push( [ node.x, node.y ] );
					}
					ptr += 1;
				}
			}

			// left/right sides

			start = top + 1;
			if ( start < 0 )
			{
				start = 0;
			}
			end = bottom;
			if ( end >= height )
			{
				end = height;
			}

			// left

			if ( left >= 0 )
			{
				ptr = ( start * width ) + left;
				for ( i = start; i < end; i += 1 )
				{
					node = nodes[ ptr ];
					if ( node.value )
					{
						nlist.push( [ node.x, node.y ] );
					}
					ptr += width;
				}
			}

			// right

			if ( right < width )
			{
				ptr = ( start * width ) + right;
				for ( i = start; i < end; i += 1 )
				{
					node = nodes[ ptr ];
					if ( node.value )
					{
						nlist.push( [ node.x, node.y ] );
					}
					ptr += width;
				}
			}

			len = nlist.length;
			if ( len )
			{
				if ( len === 1 )
				{
					return nlist[ 0 ];
				}
				min = width + height;
				for ( i = 0; i < len; i += 1 )
				{
					pos = nlist[ i ];
					cnt = _heuristic( x1, y1, pos[0], pos[1] );
					if ( cnt < min )
					{
						min = cnt;
						j = i;
					}
				}
				return nlist[ j ];
			}

			level += 1;
		}

		return [x1, y1];
	}

	//----------------------
	// ENGINE INITIALIZATION
	//----------------------

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

		_system.host.app = browser;
		if ( version )
		{
			_system.host.version = version;
		}
		_system.host.os = os;

	}

	//-----------
	// PUBLIC API
	//-----------

	PS = {

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

		// Pathfinder constants

		FINDER_ASTAR : "PS.FINDER_ASTAR",
		FINDER_BREADTH_FIRST : "PS.FINDER_BREADTH_FIRST",
		FINDER_BEST_FIRST : "PS.FINDER_BEST_FIRST",
		FINDER_DIJKSTRA : "PS.FINDER_DIJKSTRA",
		FINDER_BI_ASTAR : "PS.FINDER_BI_ASTAR",
		FINDER_BI_BEST_FIRST : "PS.FINDER_BI_BEST_FIRST",
		FINDER_BI_DIJKSTRA : "PS.FINDER_BI_DIJKSTRA",
		FINDER_BI_BREADTH_FIRST : "PS.FINDER_BI_BREADTH_FIRST",
		FINDER_JUMP_POINT : "PS.FINDER_JUMP_POINT",

		// This must be in PS namespace

		_lastTick : 0,

		_clock : function ()
		{
			if ( _clockActive )
			{
				window.requestAnimationFrame( PS._clock );
				_tick();
			}
		},

		// Engine initializer

		_sys : function ()
		{
			var fn, errm, i, outer, main, debug, status, grid, footer, monitor, ctx, cnt, bead, snd, str;

			fn = "[PS.sys] ";
			errm = fn + "Invalid element";

			// Establish system defaults

			_defaults = {};
			_copy( _DEFAULTS, _defaults );

			if ( !String.fromCodePoint )
			{
				String.fromCodePoint = _newCodePoint;
			}

			// Precalculate color string tables

			_RSTR = [ ];
			_RSTR.length = 256;

			_GBSTR = [ ];
			_GBSTR.length = 256;

			_BASTR = [ ];
			_BASTR.length = 256;

			_ASTR = [ ];
			_ASTR.length = 256;

			for ( i = 0; i < 256; i += 1 )
			{
				_RSTR[ i ] = "rgba(" + i + ",";
				_GBSTR[ i ] = i + ",";
				_BASTR[ i ] = i + ",1)";
				cnt = Math.floor( ( _ALPHOID * i ) * 1000 ) / 1000;
				_ASTR[ i ] = cnt + ")";
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
			_system.inputs.touch = _touchScreen;

			// Set up DOM elements

			// Main div

			document.body.id = "body";
			document.body.style.backgroundColor = _defaults.grid.color.str;

			outer = document.createElement( "div" );
			if ( !outer )
			{
				window.alert( errm );
				return;
			}
			outer.id = _OUTER_ID;
			document.body.appendChild( outer );

			main = document.createElement( "div" );
			if ( !main )
			{
				window.alert( errm );
				return;
			}
			main.id = _MAIN_ID;
			outer.appendChild( main );

			// save offset coordinates

			PS._mainLeft = main.offsetLeft;
			PS._mainTop = main.offsetTop;

			// Status line, append to main

			if ( _MULTILINE ) // for compatibility; eliminate in 3.1
			{
				status = document.createElement( "p" );
				if ( !status )
				{
					window.alert( errm );
					return;
				}
				status.innerHTML = "Perlenspiel";
			}
			else
			{
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
				status.value = "Perlenspiel";
				status.wrap = "soft";
			}

			status.id = _STATUS_ID;
			main.appendChild( status );

			// create grid canvas

			grid = document.createElement( "canvas" );
			if ( !grid )
			{
				window.alert( fn + "HTML5 canvas not supported." );
				return;
			}
			grid.id = _GRID_ID;
			grid.width = _CLIENT_SIZE;
			grid.backgroundColor = _defaults.grid.color.str;

			_overGrid = false;
			_resetCursor();

			grid.addEventListener( "mousedown", _mouseDown, false );
			grid.addEventListener( "mouseup", _mouseUp, false );
			grid.addEventListener( "mousemove", _mouseMove, false );
			grid.addEventListener( "mouseout", _gridOut, false );

			main.appendChild( grid );

			// Footer, append to main

			footer = document.createElement( "p" );
			if ( !footer )
			{
				window.alert( errm );
				return;
			}
			footer.id = _FOOTER_ID;
			footer.innerHTML = "Loading Perlenspiel";
			main.appendChild( footer );
			_footer = footer;

			// Debug div

			debug = document.createElement( "div" );
			if ( !debug )
			{
				window.alert( errm );
				return;
			}
			debug.id = _DEBUG_ID;
			main.appendChild( debug );

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

			// enable touch events

			if ( _touchScreen )
			{
				// init finger & bead to empty

				_currentFinger = _CLEAR;
				_underBead = _CLEAR;

				document.addEventListener( "touchmove", _touchMove, false );
				document.addEventListener( "touchstart", _touchStart, false );
				document.addEventListener( "touchend", _touchEnd, false );
				document.addEventListener( "touchcancel", _touchEnd, false );
			}

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

			if ( window.addEventListener )
			{
				document.addEventListener( "keydown", _keyDown, false );
				document.addEventListener( "keyup", _keyUp, false );
				window.addEventListener( "DOMMouseScroll", _wheel, false ); // for Firefox
				window.addEventListener( "mousewheel", _wheel, false ); // for others
			}
			else
			{
				document.onkeydown = _keyDown;
				document.onkeyup = _keyUp;
				window.onmousewheel = _wheel;
				document.onmousewheel = _wheel; // for IE, maybe
			}

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

			_copy( _defaults.grid, _grid );

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

			_copy( _defaults.status, _status );

			// Init sprite engine

			_sprites = [ ];
			_spriteCnt = 0;

			// Init pathfinder engine

			_pathmaps = [ ];
			_pathmapCnt = 0;

			// init audio system

			snd = AQ.init(
				{
					defaultPath : _defaults.audio.path,
					defaultFileTypes : [ "ogg", "mp3", "wav" ],
					onAlert : PS.debug,
					stack : true,
					forceHTML5 : true // never use Web Audio; sigh
				} );

			if ( snd === AQ.ERROR )
			{
				return;
			}

			// load and lock error sound

			if ( PS.audioLoad( _defaults.audio.error_sound, { path : _defaults.audio.path, lock : true } ) === PS.ERROR )
			{
				_errorSound = null;
				_warning( "Error sound '" + _defaults.audio.error_sound + "' not loaded" );
			}
			else
			{
				_errorSound = _defaults.audio.error_sound;
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

			_gridSize( _defaults.grid.x, _defaults.grid.y );

			//	Init fader and timer engines, start the global clock

			_initFaders();
			_initTimers();

			_clockActive = true;
			PS._clock();

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
		},

		//---------------
		// GRID FUNCTIONS
		//---------------

		// PS.gridSize(x, y)
		// Sets x/y dimensions of grid
		// Returns object with .width and .height properties, or PS.ERROR

		gridSize : function ( xP, yP )
		{
			var fn, x, y, max;

			fn = "[PS.gridSize] ";

			if ( arguments.length > 2 )
			{
				return _error( fn + "Too many arguments" );
			}

			// prevent arg mutation

			x = xP;
			y = yP;

			max = _defaults.grid.max;

			// Check x dimension

			if ( x === PS.DEFAULT )
			{
				x = _defaults.grid.x;
			}
			else if ( x === PS.CURRENT )
			{
				x = _grid.x;
			}
			else if ( _typeOf( x ) === "number" )
			{
				x = Math.floor( x );
				if ( x < 1 )
				{
					x = 1;
				}
				else if ( x > max )
				{
					x = max;
				}
			}
			else
			{
				return _error( fn + "x argument invalid" );
			}

			// Check y dimension

			if ( y === PS.DEFAULT )
			{
				y = _defaults.grid.y;
			}
			else if ( y === PS.CURRENT )
			{
				y = _grid.y;
			}
			else if ( _typeOf( y ) === "number" )
			{
				y = Math.floor( y );
				if ( y < 1 )
				{
					y = 1;
				}
				else if ( y > max )
				{
					y = max;
				}
			}
			else
			{
				return _error( fn + "y argument invalid" );
			}

			_gridSize( x, y );

			return { width : _grid.x, height : _grid.y };
		},

		// PS.gridPlane ( p )
		// Sets current color plane of grid
		// Returns plane or PS.ERROR on error

		gridPlane : function ( planeP )
		{
			var fn, plane, type;

			fn = "[PS.gridPlane] ";

			if ( arguments.length > 1 )
			{
				return _error( fn + "Too many arguments" );
			}

			plane = planeP; // avoid direct mutation of argument

			type = _typeOf( plane );
			if ( ( type !== "undefined" ) && ( plane !== PS.CURRENT ) )
			{
				if ( plane === PS.DEFAULT )
				{
					plane = 0;
				}
				else if ( type === "number" )
				{
					plane = Math.floor( plane );
					if ( plane < 1 )
					{
						plane = 0;
					}
				}
				else
				{
					return _error( fn + "plane argument invalid" );
				}

				_grid.plane = plane;
			}

			return _grid.plane;
		},

		// PS.gridColor( color )
		// Sets color of grid
		// [p1/p2/p3] is a PS3 color paramater
		// Returns rgb or PS.ERROR

		gridColor : function ( p1, p2, p3 )
		{
			var fn, colors;

			fn = "[PS.gridColor] ";

			if ( arguments.length > 3 )
			{
				return _error( fn + "Too many arguments" );
			}

			colors = _decodeColors( fn, p1, p2, p3 );
			if ( colors === PS.ERROR )
			{
				return PS.ERROR;
			}

			return _gridColor( colors );
		},

		// PS.gridFade( rate, options )
		// Sets fade rate/options of grid
		// Returns fader settings or PS.ERROR

		gridFade : function ( rate, optionsP )
		{
			var fn, fader, options, type, val;

			fn = "[PS.gridFade] ";

			if ( arguments.length > 2 )
			{
				return _error( fn + "Too many arguments" );
			}

			fader = _grid.fader;

			val = rate;
			if ( val !== PS.CURRENT )
			{
				type = _typeOf( val );
				if ( type !== "undefined" )
				{
					if ( val === PS.DEFAULT )
					{
						fader.rate = _defaults.fader.rate;
					}
					else if ( type === "number" )
					{
						val = Math.floor( val );
						if ( val < 0 )
						{
							val = 0;
						}
						fader.rate = val;
					}
					else
					{
						return _error( fn + "rate argument invalid" );
					}
				}
			}

			options = _validFadeOptions( fn, optionsP );
			if ( options === PS.ERROR )
			{
				return PS.ERROR;
			}

			val = options.rgb;
			if ( val !== PS.CURRENT )
			{
				if ( val === PS.DEFAULT )
				{
					fader.rgb = _defaults.fader.rgb;
				}
				else
				{
					fader.rgb = val;
				}
				fader.r = options.r;
				fader.g = options.g;
				fader.b = options.b;
			}

			val = options.onEnd;
			if ( val !== PS.CURRENT )
			{
				if ( val === PS.DEFAULT )
				{
					fader.onEnd = _defaults.fader.onEnd;
				}
				else
				{
					fader.onEnd = val;
				}
			}

			val = options.params;
			if ( val !== PS.CURRENT )
			{
				if ( val === PS.DEFAULT )
				{
					fader.params = _defaults.fader.params;
				}
				else
				{
					fader.params = val;
				}
			}

			return {
				rate : fader.rate,
				rgb : fader.rgb,
				onEnd : fader.onEnd,
				params : fader.params
			};
		},

		//---------------
		// BEAD FUNCTIONS
		//---------------

		// PS.color ( x, y, color )
		// Change/inspect bead color on current grid plane

		color : function ( x, y, p1, p2, p3 )
		{
			var fn, args, colors;

			fn = "[PS.color] ";

			args = arguments.length;
			if ( args < 2 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 5 )
			{
				return _error( fn + "Too many arguments" );
			}

			colors = _decodeColors( fn, p1, p2, p3 );
			if ( colors === PS.ERROR )
			{
				return PS.ERROR;
			}

			return _beadExec( fn, _color, x, y, colors );
		},

		// PS.alpha( x, y, a )

		alpha : function ( x, y, alpha_p )
		{
			var fn, args, alpha, type;

			fn = "[PS.alpha] ";

			args = arguments.length;
			if ( args < 2 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 3 )
			{
				return _error( fn + "Too many arguments" );
			}

			alpha = alpha_p; // prevent direct mutation of args

			if ( alpha !== PS.CURRENT )
			{
				type = _typeOf( alpha );
				if ( type === "undefined" )
				{
					alpha = PS.CURRENT;
				}
				else if ( type === "number" )
				{
					alpha = Math.floor( alpha );
					if ( alpha < 0 )
					{
						alpha = 0;
					}
					else if ( alpha > 255 )
					{
						alpha = 255;
					}
				}
				else if ( alpha === PS.DEFAULT )
				{
					alpha = _defaults.bead.color.a;
				}
				else
				{
					return _error( fn + "alpha argument invalid" );
				}
			}

			return _beadExec( fn, _alpha, x, y, alpha );
		},

		// PS.fade( x, y, rate, options )
		// Sets fade rate/options of bead
		// Returns fader settings or PS.ERROR

		fade : function ( x, y, rate_p, options_p )
		{
			var fn, args, rate, type, options;

			fn = "[PS.fade] ";

			args = arguments.length;
			if ( args < 2 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 4 )
			{
				return _error( fn + "Too many arguments" );
			}

			rate = rate_p; // prevent arg mutation
			if ( ( rate !== PS.CURRENT ) && ( rate !== PS.DEFAULT ) )
			{
				type = _typeOf( rate );
				if ( type === "undefined" )
				{
					rate = PS.CURRENT;
				}
				else if ( type === "number" )
				{
					rate = Math.floor( rate );
					if ( rate < 0 )
					{
						rate = 0;
					}
				}
				else
				{
					return _error( fn + "rate argument invalid" );
				}
			}

			options = _validFadeOptions( fn, options_p );
			if ( options === PS.ERROR )
			{
				return PS.ERROR;
			}

			return _beadExec( fn, _fade, x, y, rate, options );
		},

		// PS.scale ( x, y, scale )
		// Expects a number between 50 and 100

		scale : function ( x, y, scale_p )
		{
			var fn, args, scale, type;

			fn = "[PS.scale] ";

			args = arguments.length;
			if ( args < 2 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 3 )
			{
				return _error( fn + "Too many arguments" );
			}

			// prevent arg mutation

			scale = scale_p;

			if ( scale !== PS.CURRENT )
			{
				type = _typeOf( scale );
				if ( type === "undefined" )
				{
					scale = PS.CURRENT;
				}
				else if ( scale === PS.DEFAULT )
				{
					scale = 100;
				}
				else if ( type === "number" )
				{
					scale = Math.floor( scale );
					if ( scale < 50 )
					{
						scale = 50;
					}
					else if ( scale > 100 )
					{
						scale = 100;
					}
				}
				else
				{
					return _error( fn + "scale parameter invalid" );
				}
			}

			return _beadExec( fn, _scale, x, y, scale );
		},

		// PS.radius( x, y, radius )
		// Expects a radius between 0 and 50

		radius : function ( x, y, radius_p )
		{
			var fn, args, radius, type;

			fn = "[PS.radius] ";

			args = arguments.length;
			if ( args < 2 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 3 )
			{
				return _error( fn + "Too many arguments" );
			}

			// prevent arg mutation

			radius = radius_p;

			if ( radius !== PS.CURRENT )
			{
				type = _typeOf( radius );
				if ( type === "undefined" )
				{
					radius = PS.CURRENT;
				}
				else if ( radius === PS.DEFAULT )
				{
					radius = 0;
				}
				else if ( type === "number" )
				{
					radius = Math.floor( radius );
					if ( radius < 0 )
					{
						radius = 0;
					}
					else if ( radius > 50 )
					{
						radius = 50;
					}
				}
				else
				{
					return _error( fn + "radius parameter invalid" );
				}
			}

			return _beadExec( fn, _radius, x, y, radius );
		},

		// PS.data( x, y, data )

		data : function ( x, y, data_p )
		{
			var fn, args, data;

			fn = "[PS.data] ";

			args = arguments.length;
			if ( args < 2 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 3 )
			{
				return _error( fn + "Too many arguments" );
			}

			// Prevent arg mutation

			data = data_p;
			if ( data === undefined )
			{
				data = PS.CURRENT;
			}
			else if ( data === PS.DEFAULT )
			{
				data = null;
			}

			return _beadExec( fn, _data, x, y, data );
		},

		// PS.exec( x, y, exec )

		exec : function ( x, y, exec_p )
		{
			var fn, args, exec, type;

			fn = "[PS.exec] ";

			args = arguments.length;
			if ( args < 2 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 3 )
			{
				return _error( fn + "Too many arguments" );
			}

			exec = exec_p; // prevent arg mutation
			if ( exec !== PS.CURRENT )
			{
				type = _typeOf( exec );
				if ( type === "undefined" )
				{
					exec = PS.CURRENT;
				}
				else if ( exec === PS.DEFAULT )
				{
					exec = _defaults.bead.exec;
				}
				else if ( type !== "function" )
				{
					return _error( fn + "exec argument invalid" );
				}
			}

			return _beadExec( fn, _exec, x, y, exec );
		},

		// PS.visible( x, y, show )

		visible : function ( x, y, show_p )
		{
			var fn, args, show;

			fn = "[PS.visible] ";

			args = arguments.length;
			if ( args < 2 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 3 )
			{
				return _error( fn + "Too many arguments" );
			}

			show = _isBoolean( show_p, PS.CURRENT, true, PS.CURRENT );
			if ( show === PS.ERROR )
			{
				return _error( fn + "show argument invalid" );
			}

			return _beadExec( fn, _visible, x, y, show );
		},

		// PS.active( x, y, active )

		active : function ( x, y, active_p )
		{
			var fn, args, active;

			fn = "[PS.active] ";

			args = arguments.length;
			if ( args < 2 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 3 )
			{
				return _error( fn + "Too many arguments" );
			}

			active = _isBoolean( active_p, PS.CURRENT, true, PS.CURRENT );
			if ( active === PS.ERROR )
			{
				return _error( fn + "active argument invalid" );
			}

			return _beadExec( fn, _active, x, y, active );
		},

		//----------------------
		// BEAD BORDER FUNCTIONS
		//----------------------

		// PS.border( x, y, width )
		// Accepts a width integer or an object with .top/.left/.bottom/.right properties

		border : function ( x, y, width_p )
		{
			var fn, args, def, width, type, val;

			fn = "[PS.border] ";

			args = arguments.length;
			if ( args < 2 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 3 )
			{
				return _error( fn + "Too many arguments" );
			}

			def = _defaults.bead.border;

			// check a number

			width = width_p; // prevent arg mutation
			if ( width !== PS.CURRENT )
			{
				type = _typeOf( width );
				if ( type === "undefined" )
				{
					width = PS.CURRENT;
				}
				else if ( width === PS.DEFAULT )
				{
					width = def.width;
				}
				else if ( type === "number" )
				{
					width = Math.floor( width );
					if ( width < 0 )
					{
						width = 0;
					}
				}
				else if ( type === "object" )
				{
					// Check the four edge properties

					// .top

					val = width.top;
					if ( val !== PS.CURRENT )
					{
						type = _typeOf( val );
						if ( type === "undefined" )
						{
							width.top = PS.CURRENT;
						}
						else if ( type === "number" )
						{
							val = Math.floor( val );
							if ( val < 0 )
							{
								val = 0;
							}
							width.top = val;
						}
						else if ( val === PS.DEFAULT )
						{
							width.top = def.top;
						}
						else
						{
							return _error( fn + ".top property invalid" );
						}
					}

					// .left

					val = width.left;
					if ( val !== PS.CURRENT )
					{
						type = _typeOf( val );
						if ( type === "undefined" )
						{
							width.left = PS.CURRENT;
						}
						else if ( type === "number" )
						{
							val = Math.floor( val );
							if ( val < 0 )
							{
								val = 0;
							}
							width.left = val;
						}
						else if ( val === PS.DEFAULT )
						{
							width.left = def.left;
						}
						else
						{
							return _error( fn + ".left property invalid" );
						}
					}

					// .bottom

					val = width.bottom;
					if ( val !== PS.CURRENT )
					{
						type = _typeOf( val );
						if ( type === "undefined" )
						{
							width.bottom = PS.CURRENT;
						}
						else if ( type === "number" )
						{
							val = Math.floor( val );
							if ( val < 0 )
							{
								val = 0;
							}
							width.bottom = val;
						}
						else if ( val === PS.DEFAULT )
						{
							width.bottom = def.bottom;
						}
						else
						{
							return _error( fn + ".bottom property invalid" );
						}
					}

					// .right

					val = width.right;
					if ( val !== PS.CURRENT )
					{
						type = _typeOf( val );
						if ( type === "undefined" )
						{
							width.right = PS.CURRENT;
						}
						else if ( type === "number" )
						{
							val = Math.floor( val );
							if ( val < 0 )
							{
								val = 0;
							}
							width.right = val;
						}
						else if ( val === PS.DEFAULT )
						{
							width.right = def.right;
						}
						else
						{
							return _error( fn + ".right property invalid" );
						}
					}
				}
				else
				{
					return _error( fn + "width argument invalid" );
				}
			}

			return _beadExec( fn, _border, x, y, width );
		},

		// PS.borderColor( x, y, p1, p2, p3 )

		borderColor : function ( x, y, p1, p2, p3 )
		{
			var fn, colors;

			fn = "[PS.borderColor] ";

			if ( arguments.length < 2 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( arguments.length > 5 )
			{
				return _error( fn + "Too many arguments" );
			}

			colors = _decodeColors( fn, p1, p2, p3 );
			if ( colors === PS.ERROR )
			{
				return PS.ERROR;
			}

			return _beadExec( fn, _borderColor, x, y, colors );
		},

		// PS.borderAlpha( x, y, alpha )

		borderAlpha : function ( x, y, alpha_p )
		{
			var fn, args, alpha, type;

			fn = "[PS.borderAlpha] ";

			args = arguments.length;
			if ( args < 2 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 3 )
			{
				return _error( fn + "Too many arguments" );
			}

			alpha = alpha_p; // prevent arg mutation
			if ( alpha !== PS.CURRENT )
			{
				type = _typeOf( alpha );
				if ( type === "undefined" )
				{
					alpha = PS.CURRENT;
				}
				else if ( type === "number" )
				{
					alpha = Math.floor( alpha );
					if ( alpha < 0 )
					{
						alpha = 0;
					}
					else if ( alpha > 255 )
					{
						alpha = 255;
					}
				}
				else if ( alpha === PS.DEFAULT )
				{
					alpha = _defaults.bead.border.color.a;
				}
				else
				{
					return _error( fn + "alpha argument invalid" );
				}
			}

			return _beadExec( fn, _borderAlpha, x, y, alpha );
		},

		// PS.borderFade( rate, options )
		// Sets fade rate/options of border
		// Returns fade settings or PS.ERROR

		borderFade : function ( x, y, rate_p, options_p )
		{
			var fn, args, rate, type, options;

			fn = "[PS.borderFade] ";

			args = arguments.length;
			if ( args < 2 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 4 )
			{
				return _error( fn + "Too many arguments" );
			}

			rate = rate_p; // prevent arg mutation
			if ( ( rate !== PS.CURRENT ) && ( rate !== PS.DEFAULT ) )
			{
				type = _typeOf( rate );
				if ( type === "undefined" )
				{
					rate = PS.CURRENT;
				}
				else if ( type === "number" )
				{
					rate = Math.floor( rate );
					if ( rate < 0 )
					{
						rate = 0;
					}
				}
				else
				{
					return _error( fn + "rate argument not a number" );
				}
			}

			options = _validFadeOptions( fn, options_p );
			if ( options === PS.ERROR )
			{
				return PS.ERROR;
			}

			return _beadExec( fn, _borderFade, x, y, rate, options );
		},

		//---------------------
		// BEAD GLYPH FUNCTIONS
		//---------------------

		// Improved Unicode handling by Mark Diehr

		// PS.glyph( x, y, glyph )
		// [glyph] can be a Unicode number or a string

		glyph : function ( x, y, glyph_p )
		{
			var fn, args, glyph, type;

			fn = "[PS.glyph] ";

			args = arguments.length;
			if ( args < 2 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 3 )
			{
				return _error( fn + "Too many arguments" );
			}

			glyph = glyph_p; // prevent arg mutation
			if ( glyph !== PS.CURRENT )
			{
				type = _typeOf( glyph );
				if ( type === "undefined" )
				{
					glyph = PS.CURRENT;
				}
				else if ( glyph === PS.DEFAULT )
				{
					glyph = 0;
				}
				else if ( type === "string" )
				{
					if ( glyph.length > 0 )
					{
						glyph = glyph.charCodeAt( 0 ); // use only first character
					}
					else
					{
						glyph = 0;
					}
				}
				else if ( type === "number" )
				{
					glyph = Math.floor( glyph );
					if ( glyph < 1 )
					{
						glyph = 0;
					}
				}
				else
				{
					return _error( fn + "glyph argument invalid" );
				}
			}

			return _beadExec( fn, _glyph, x, y, glyph );
		},

		// PS.glyphColor( x, y, p1, p2, p3 )

		glyphColor : function ( x, y, p1, p2, p3 )
		{
			var fn, colors;

			fn = "[PS.glyphColor] ";

			if ( arguments.length < 2 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( arguments.length > 5 )
			{
				return _error( fn + "Too many arguments" );
			}

			colors = _decodeColors( fn, p1, p2, p3 );
			if ( colors === PS.ERROR )
			{
				return PS.ERROR;
			}

			return _beadExec( fn, _glyphColor, x, y, colors );
		},

		// PS.glyphAlpha( x, y, alpha )

		glyphAlpha : function ( x, y, alpha_p )
		{
			var fn, args, alpha, type;

			fn = "[PS.glyphAlpha] ";

			args = arguments.length;
			if ( args < 2 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 3 )
			{
				return _error( fn + "Too many arguments" );
			}

			alpha = alpha_p; // prevent arg mutation
			if ( alpha !== PS.CURRENT )
			{
				type = _typeOf( alpha );
				if ( type === "undefined" )
				{
					alpha = PS.CURRENT;
				}
				else if ( type === "number" )
				{
					alpha = Math.floor( alpha );
					if ( alpha < 0 )
					{
						alpha = 0;
					}
					else if ( alpha > 255 )
					{
						alpha = 255;
					}
				}
				else if ( alpha === PS.DEFAULT )
				{
					alpha = _defaults.bead.glyph.color.a;
				}
				else
				{
					return _error( fn + "alpha argument invalid" );
				}
			}

			return _beadExec( fn, _glyphAlpha, x, y, alpha );
		},

		// PS.glyphScale( x, y, scale )

		glyphScale : function ( x, y, scale_p )
		{
			var fn, args, scale, type;

			fn = "[PS.glyphScale] ";

			args = arguments.length;
			if ( args < 2 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 3 )
			{
				return _error( fn + "Too many arguments" );
			}

			scale = scale_p; // prevents arg mutation
			if ( scale !== PS.CURRENT )
			{
				type = _typeOf( scale );
				if ( type === "undefined" )
				{
					scale = PS.CURRENT;
				}
				else if ( type === "number" )
				{
					scale = Math.floor( scale );
					if ( scale < 50 )
					{
						scale = 50;
					}
					else if ( scale > 100 )
					{
						scale = 100;
					}
				}
				else if ( scale === PS.DEFAULT )
				{
					scale = _defaults.bead.glyph.scale;
				}
				else
				{
					return _error( fn + "scale argument invalid" );
				}
			}

			return _beadExec( fn, _glyphScale, x, y, scale );
		},

		// PS.glyphFade( rate, options )
		// Sets fade rate/options of glyph
		// Returns fade settings or PS.ERROR

		glyphFade : function ( x, y, rate_p, options_p )
		{
			var fn, args, rate, type, options;

			fn = "[PS.glyphFade] ";

			args = arguments.length;
			if ( args < 2 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 4 )
			{
				return _error( fn + "Too many arguments" );
			}

			rate = rate_p; // prevent arg mutation
			if ( ( rate !== PS.CURRENT ) && ( rate !== PS.DEFAULT ) )
			{
				type = _typeOf( rate );
				if ( type === "undefined" )
				{
					rate = PS.CURRENT;
				}
				else if ( type === "number" )
				{
					rate = Math.floor( rate );
					if ( rate < 0 )
					{
						rate = 0;
					}
				}
				else
				{
					return _error( fn + "rate argument not a number" );
				}
			}

			options = _validFadeOptions( fn, options_p );
			if ( options === PS.ERROR )
			{
				return PS.ERROR;
			}

			return _beadExec( fn, _glyphFade, x, y, rate, options );
		},

		//----------------------
		// STATUS LINE FUNCTIONS
		//----------------------

		statusText : function ( str_p )
		{
			var fn, str, type;

			fn = "[PS.statusText] ";

			if ( arguments.length > 1 )
			{
				return _error( fn + "Too many arguments" );
			}

			str = str_p; // prevent arg mutation
			if ( str !== PS.CURRENT )
			{
				type = _typeOf( str );
				if ( type === "undefined" )
				{
					str = "";
				}
				else if ( str === PS.DEFAULT )
				{
					str = _defaults.status.text;
				}
				else if ( type !== "string" )
				{
					return _error( fn + "argument not a string" );
				}

				_status.text = str;
				if ( _MULTILINE )
				{
					if ( str.length < 1 )
					{
						str = "&nbsp;";
					}
					_status.div.innerHTML = str;
				}
				else
				{
					_status.div.value = str;
				}
			}

			return _status.text;
		},

		statusColor : function ( p1, p2, p3 )
		{
			var fn, colors, current, fader, rgb, r, g, b;

			fn = "[PS.statusColor] ";

			if ( arguments.length > 3 )
			{
				return _error( fn + "Too many arguments" );
			}

			colors = _decodeColors( fn, p1, p2, p3 );
			if ( colors === PS.ERROR )
			{
				return PS.ERROR;
			}

			current = _status.color;
			fader = _status.fader;

			rgb = colors.rgb;
			if ( rgb !== PS.CURRENT )
			{
				if ( rgb === null ) // must inspect r/g/b values
				{
					r = colors.r;
					if ( r === PS.CURRENT )
					{
						colors.r = r = current.r;
					}
					else if ( r === PS.DEFAULT )
					{
						colors.r = r = _defaults.status.color.r;
					}

					g = colors.g;
					if ( g === PS.CURRENT )
					{
						colors.g = g = current.g;
					}
					else if ( g === PS.DEFAULT )
					{
						colors.g = g = _defaults.status.color.g;
					}

					b = colors.b;
					if ( b === PS.CURRENT )
					{
						colors.b = b = current.b;
					}
					else if ( b === PS.DEFAULT )
					{
						colors.b = b = _defaults.status.color.b;
					}

					colors.rgb = (r * _RSHIFT) + (g * _GSHIFT) + b;
				}
				else if ( rgb === PS.DEFAULT )
				{
					_copy( _defaults.status.color, colors );
				}

				// Only change color if different
				// But must also change if fader is active, start color is specified and doesn't match

				if ( ( current.rgb !== colors.rgb ) || ( ( fader.rate > 0 ) && ( fader.rgb !== null ) && ( fader.rgb !== colors.rgb ) ) )
				{
					current.rgb = colors.rgb;

					r = colors.r;
					g = colors.g;
					b = colors.b;

					current.str = colors.str = _RSTR[ r ] + _GBSTR[ g ] + _BASTR[ b ];

					if ( fader.rate > 0 ) // must use fader
					{
						if ( fader.rgb !== null ) // use start color if specified
						{
							_startFader( fader, fader.r, fader.g, fader.b, 255, r, g, b, 255 );
						}
						if ( !fader.active )
						{
							_startFader( fader, current.r, current.g, current.b, 255, r, g, b, 255 );
						}
						else // must recalculate active fader
						{
							_recalcFader( fader, r, g, b, 255 );
						}
					}
					else
					{
						_statusRGB( current );
					}

					current.r = r;
					current.g = g;
					current.b = b;
				}
			}

			return current.rgb;
		},

		statusFade : function ( rate, options_p )
		{
			var fn, fader, val, type, options;

			fn = "[PS.statusFade] ";

			if ( arguments.length > 2 )
			{
				return _error( fn + "Too many arguments" );
			}

			fader = _status.fader;

			val = rate;
			if ( val !== PS.CURRENT )
			{
				type = _typeOf( val );
				if ( type !== "undefined" )
				{
					if ( val === PS.DEFAULT )
					{
						fader.rate = _defaults.fader.rate;
					}
					else if ( type === "number" )
					{
						val = Math.floor( val );
						if ( val < 0 )
						{
							val = 0;
						}
						fader.rate = val;
					}
					else
					{
						return _error( fn + "rate argument invalid" );
					}
				}
			}

			options = _validFadeOptions( fn, options_p );
			if ( options === PS.ERROR )
			{
				return PS.ERROR;
			}

			val = options.rgb;
			if ( val !== PS.CURRENT )
			{
				if ( val === PS.DEFAULT )
				{
					fader.rgb = _defaults.fader.rgb;
				}
				else
				{
					fader.rgb = val;
				}
				fader.r = options.r;
				fader.g = options.g;
				fader.b = options.b;
			}

			val = options.onEnd;
			if ( val !== PS.CURRENT )
			{
				if ( val === PS.DEFAULT )
				{
					fader.onEnd = _defaults.fader.onEnd;
				}
				else
				{
					fader.onEnd = val;
				}
			}

			val = options.params;
			if ( val !== PS.CURRENT )
			{
				if ( val === PS.DEFAULT )
				{
					fader.params = _defaults.fader.params;
				}
				else
				{
					fader.params = val;
				}
			}

			return {
				rate : fader.rate,
				rgb : fader.rgb,
				onEnd : fader.onEnd,
				params : fader.params
			};
		},

		// ---------------
		// TIMER FUNCTIONS
		// ---------------

		// PS.timerStart( ticks, exec, ... )
		// Execute a function [exec] after [ticks] 60ths of a second
		// Additional parameters are passed as arguments to the function
		// Returns id of timer

		timerStart : function ( ticks_p, exec_p )
		{
			var fn, args, ticks, exec, type, obj, arglist, i, len, id;

			fn = "[PS.timerStart] ";

			args = arguments.length;
			if ( args < 2 )
			{
				return _error( fn + "Argument(s) missing" );
			}

			// Prevent arg mutation

			ticks = ticks_p;
			exec = exec_p;

			// Check ticks param

			if ( ticks === PS.DEFAULT )
			{
				ticks = 60;
			}
			else
			{
				type = _typeOf( ticks );
				if ( type !== "number" )
				{
					return _error( fn + "ticks argument invalid" );
				}
				ticks = Math.floor( ticks );
				if ( ticks < 1 )
				{
					return _error( fn + "ticks argument less than one (1)" );
				}
			}

			// Check exec param

			if ( typeof exec !== "function" )
			{
				return _error( fn + "exec argument not a function" );
			}

			// Create an array of extra arguments

			arglist = [];
			if ( args > 2 )
			{
				len = args - 2;
				arglist.length = len;
				for ( i = 0; i < len; i += 1 )
				{
					arglist[ i ] = arguments[ i + 2 ];
				}
			}

			// Create unique id

			id = _TIMER_PREFIX + _timerCnt;
			_timerCnt += 1;

			// Add timer to queue

			obj = {
				id : id,
				delay : ticks,
				count : ticks,
				exec : exec,
				arglist : arglist
			};

			_timers.push( obj );

//			PS.debug(fn + "id = " + id + "\n");

			return id;
		},

		// PS.timerStop( id )
		// Stops a timer matching [id]
		// Returns id or PS.ERROR

		timerStop : function ( id )
		{
			var fn, args, i, len, timer;

			fn = "[PS.timerStop] ";

//			PS.debug(fn + "id = " + id + "\n");

			args = arguments.length;
			if ( args < 1 )
			{
				return _error( fn + "Argument missing" );
			}

			// Check id param

			if ( ( typeof id !== "string" ) || ( id.length < 1 ) )
			{
				return _error( fn + "id argument invalid" );
			}

			// Find and nuke timer

			len = _timers.length;
			for ( i = 0; i < len; i += 1 )
			{
				timer = _timers[i];
				if ( timer.id === id ) // found it!
				{
					_timers.splice( i, 1 );
					return id;
				}
			}

			return _error( fn + "timer id '" + id + "' not found" );
		},

		// -----------------
		// UTILITY FUNCTIONS
		// -----------------

		random : function ( val_p )
		{
			var fn, val;

			fn = "[PS.random] ";

			if ( arguments.length < 1 )
			{
				return _error( fn + "Argument missing" );
			}

			val = val_p; // prevent arg mutation
			if ( _typeOf( val ) !== "number" )
			{
				return _error( fn + "Argument not a number" );
			}
			val = Math.floor( val );
			if ( val < 2 )
			{
				return 1;
			}

			val = Math.random() * val;
			val = Math.floor( val ) + 1;
			return val;
		},

		makeRGB : function ( r_p, g_p, b_p )
		{
			var fn, args, r, g, b;

			fn = "[PS.makeRGB] ";

			args = arguments.length;
			if ( args < 3 )
			{
				return _error( fn + "Argument(s) missing" );
			}
			if ( args > 3 )
			{
				return _error( fn + "Too many arguments" );
			}

			// Prevent arg mutation

			r = r_p;
			g = g_p;
			b = b_p;

			if ( _typeOf( r ) !== "number" )
			{
				return _error( fn + "r argument not a number" );
			}
			r = Math.floor( r );
			if ( r < 0 )
			{
				r = 0;
			}
			else if ( r > 255 )
			{
				r = 255;
			}

			if ( _typeOf( g ) !== "number" )
			{
				return _error( fn + "g argument not a number" );
			}
			g = Math.floor( g );
			if ( g < 0 )
			{
				g = 0;
			}
			else if ( g > 255 )
			{
				g = 255;
			}

			if ( _typeOf( b ) !== "number" )
			{
				return _error( fn + "b argument not a number" );
			}
			b = Math.floor( b );
			if ( b < 0 )
			{
				b = 0;
			}
			else if ( b > 255 )
			{
				b = 255;
			}

			return ( ( r * _RSHIFT ) + ( g * _GSHIFT ) + b );
		},

		unmakeRGB : function ( rgb_p, result_p )
		{
			var fn, args, rgb, result, red, green, blue, rval, gval, type;

			fn = "[PS.unmakeRGB] ";

			args = arguments.length;
			if ( args < 2 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 2 )
			{
				return _error( fn + "Too many arguments" );
			}

			// Prevent arg mutation

			rgb = rgb_p;
			result = result_p;

			if ( _typeOf( rgb ) !== "number" )
			{
				return _error( fn + "rgb argument not a number" );
			}

			rgb = Math.floor( rgb );

			if ( rgb < 1 ) // handle black
			{
				rgb = 0;
				red = 0;
				green = 0;
				blue = 0;
			}
			else if ( rgb >= 0xFFFFFF ) // handle white
			{
				rgb = 0xFFFFFF;
				red = 255;
				green = 255;
				blue = 255;
			}
			else
			{
				red = rgb / _RSHIFT;
				red = Math.floor( red );
				rval = red * _RSHIFT;

				green = ( rgb - rval ) / _GSHIFT;
				green = Math.floor( green );
				gval = green * _GSHIFT;

				blue = rgb - rval - gval;
			}

			type = _typeOf( result );
			if ( type === "object" )
			{
				result.rgb = rgb;
				result.r = red;
				result.g = green;
				result.b = blue;
			}
			else if ( type === "array" )
			{
				if ( result.length < 3 )
				{
					result.length = 3;
				}
				result[ 0 ] = red;
				result[ 1 ] = green;
				result[ 2 ] = blue;
			}
			else
			{
				return _error( fn + "result argument not an array or object reference" );
			}

			return result;
		},

		// PS.applyRect()
		// Apply a function to a rectanglular region of beads
		// [left, top, width, height] define a region inside the grid
		// [exec] is a function to be called on each bead
		// Arguments supplied after [exec] are passed as parameters to [exec]

		applyRect : function ( left_p, top_p, width_p, height_p, exec_p )
		{
			var fn, args, xmax, ymax, left, top, width, height, exec, right, bottom, x, y, result, arglist, len, i;

			fn = "[PS.applyRect] ";

			args = arguments.length;
			if ( args < 5 )
			{
				return _error( fn + "Argument(s) missing" );
			}

			xmax = _grid.x;
			ymax = _grid.y;

			// Prevent arg mutation

			left = left_p;
			top = top_p;
			width = width_p;
			height = height_p;
			exec = exec_p;

			// Check coordinates

			// Left

			if ( left === PS.DEFAULT )
			{
				left = 0;
			}
			else if ( _typeOf( left ) === "number" )
			{
				left = Math.floor( left );
				if ( left >= xmax )
				{
					return PS.DONE;
				}
				if ( left < 0 )
				{
					left = 0;
				}
			}
			else
			{
				return _error( fn + "left argument invalid" );
			}

			// Top

			if ( top === PS.DEFAULT )
			{
				top = 0;
			}
			else if ( _typeOf( top ) === "number" )
			{
				top = Math.floor( top );
				if ( top >= ymax )
				{
					return PS.DONE;
				}
				if ( top < 0 )
				{
					top = 0;
				}
			}
			else
			{
				return _error( fn + "top argument invalid" );
			}

			// Width

			if ( width === PS.DEFAULT )
			{
				width = xmax - left;
			}
			else if ( _typeOf( width ) === "number" )
			{
				width = Math.floor( width );
				if ( width < 1 )
				{
					return PS.DONE;
				}
				if ( ( left + width ) > xmax )
				{
					width = xmax - left;
				}
			}
			else
			{
				return _error( fn + "width argument invalid" );
			}

			right = left + width;

			// Height

			if ( height === PS.DEFAULT )
			{
				height = ymax - top;
			}
			else if ( _typeOf( height ) === "number" )
			{
				height = Math.floor( height );
				if ( height < 1 )
				{
					return PS.DONE;
				}
				if ( ( top + height ) > ymax )
				{
					height = ymax - top;
				}
			}
			else
			{
				return _error( fn + "height argument invalid" );
			}

			bottom = top + height;

			// Check function

			if ( !exec || ( typeof exec !== "function" ) )
			{
				return _error( fn + "exec argument not a function" );
			}

			// Create an array of arguments
			// First two elements reserved for x/y

			arglist = [ 0, 0 ];
			if ( args > 5 )
			{
				len = args - 5;
				for ( i = 0; i < len; i += 1 )
				{
					arglist.push( arguments[ i + 5 ] );
				}
			}

			// Apply [exec] to designated beads

			for ( y = top; y < bottom; y += 1 )
			{
				arglist[ 1 ] = y;
				for ( x = left; x < right; x += 1 )
				{
					arglist[ 0 ] = x;
					try
					{
						result = exec.apply( _EMPTY, arglist );
					}
					catch ( err )
					{
						result = _errorCatch( fn + "exec failed @" + x + ", " + y + " [" + err.message + "]", err );
					}

					if ( result === PS.ERROR )
					{
						return PS.ERROR;
					}
				}
			}

			return result;
		},

		// PS.hex ( val, padding )
		// Converts a number to a hex string with optional padding
		// Returns string or PS.ERROR

		hex : function ( val_p, padding_p )
		{
			var fn, val, type, padding, hex;

			fn = "[PS.hex] ";

			val = val_p; // avoid arg mutation
			type = _typeOf( val );
			if ( type !== "number" )
			{
				return _error( fn + "value argument invalid" );
			}

			// Floor and convert to absolute value

			val = Math.floor( val );
			val = Math.abs( val );

			padding = padding_p; // avoid arg mutation
			type = _typeOf( padding );
			if ( ( type === "undefined" ) || ( padding === PS.DEFAULT ) )
			{
				padding = 2;
			}
			else if ( type === "number" )
			{
				padding = Math.floor( padding );
				if ( padding < 1 )
				{
					padding = 1;
				}
			}
			else
			{
				return _error( fn + "padding argument invalid" );
			}

			hex = Number( val ).toString( 16 );

			while ( hex.length < padding )
			{
				hex = "0" + hex;
			}

			return ( "0x" + hex );
		},

		// PS.keyRepeat ( repeat, init, delay )
		// Controls keyboard repeat parameters
		// [repeat] = true to enable repeats, false to disable, default = true
		// [init] = initial delay before first repeat, default = 30 (1/2 sec)
		// [delay] = delay between repeats, default = 6 (1/10 sec)
		// Returns object with settings or PS.ERROR

		keyRepeat : function ( repeat_p, init_p, delay_p )
		{
			var fn, type, repeat, delay, init;

			fn = "[PS.keyRepeat] ";

			// verify repeat argument

			repeat = _isBoolean( repeat_p, _keyRepeat, true, true );
			if ( repeat === PS.ERROR )
			{
				return _error( fn, "repeat argument invalid" );
			}

			// Verify init argument

			init = init_p; // avoid arg mutation
			type = _typeOf ( init );
			if ( ( type === "undefined" ) || ( init === PS.DEFAULT ) )
			{
				init = _DEFAULT_KEY_DELAY * 5;
			}
			else if ( init === PS.CURRENT )
			{
				init = _keyInitRate;
			}
			else if ( type === "number" )
			{
				init = Math.floor( init );
				if ( init < 1 )
				{
					init = 1;
				}
			}
			else
			{
				return _error( fn, "init argument invalid" );
			}

			// Verify delay argument

			delay = delay_p; // avoid arg mutation
			type = _typeOf ( delay );
			if ( ( type === "undefined" ) || ( delay === PS.DEFAULT ) )
			{
				delay = _DEFAULT_KEY_DELAY;
			}
			else if ( delay === PS.CURRENT )
			{
				delay = _keyDelayRate;
			}
			else if ( type === "number" )
			{
				delay = Math.floor( delay );
				if ( delay < 1 )
				{
					delay = 1;
				}
			}
			else
			{
				return _error( fn, "delay argument invalid" );
			}

			_keyRepeat = repeat;
			_keyInitRate = init;
			_keyDelayRate = delay;

			return { repeat : _keyRepeat, init : _keyInitRate, delay : _keyDelayRate };
		},

		// ---------
		// IMAGE API
		// ---------

		imageLoad : function ( filenameP, execP, formatP )
		{
			var fn, args, filename, exec, format, ext, image, id, type;

			fn = "[PS.imageLoad] ";

			args = arguments.length;
			if ( args < 2 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 3 )
			{
				return _error( fn + "Too many argument(s)" );
			}

			// Prevent arg mutation

			filename = filenameP;
			exec = execP;
			format = formatP;

			// Validate filename

			if ( ( typeof filename !== "string" ) || ( filename.length < 1 ) )
			{
				return _error( fn + "filename argument invalid" );
			}

			// check for a valid file extension

			ext = filename.substr( filename.lastIndexOf( '.' ) + 1 );
			ext = ext.toLowerCase();
			if ( ( ext !== "png" ) && ( ext !== "jpg" ) && ( ext !== "jpeg" ) && ( ext !== "bmp" ) )
			{
				return _error( fn + "filename extension invalid" );
			}

			// Validate exec

			if ( typeof exec !== "function" )
			{
				return _error( fn + "exec argument invalid" );
			}

			type = _typeOf( format );
			if ( ( type === "undefined" ) || ( format === PS.DEFAULT ) )
			{
				format = 4;
			}
			else
			{
				if ( type !== "number" )
				{
					return _error( fn + "format argument invalid" );
				}
				format = Math.floor( format );
				if ( ( format < 1 ) && ( format > 4 ) )
				{
					return _error( fn + "format argument is not 1, 2, 3 or 4" );
				}
			}

			// save a record with the user function, id and alpha preference

			id = _IMAGE_PREFIX + _imageCnt; // a unique ID
			_imageCnt += 1;
			_imageList.push( { source : filename, id : id, exec : exec, format : format } );

			try
			{
				image = new Image();
				image.setAttribute( "data-id", id ); // store the id
				image.onload = function ()
				{
					_imageLoad( image );
				};
				image.onerror = function ()
				{
					_imageError( image );
				};
				image.src = filename; // load it!
			}
			catch ( err )
			{
				return _errorCatch( fn + "Error loading " + filename + " [" + err.message + "]", err );
			}

			return id;
		},

		// Blit an image to the grid at [xpos, ypos]
		// Optional [region] specifies region of blit
		// Return true if any part of image was drawn, false if none of image was drawn, or PS.ERROR

		imageBlit : function ( imageP, xposP, yposP, regionP )
		{
			var fn, args, xmax, ymax, image, xpos, ypos, region, w, h, format, data, type, top, left, width, height, plane,
				val, wsize, rowptr, ptr, drawx, drawy, y, x, r, g, b, a, rgb, rval, gval, i, bead, color;

			fn = "[PS.imageBlit] ";

			args = arguments.length;
			if ( args < 3 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 4 )
			{
				return _error( fn + "Too many arguments" );
			}

			xmax = _grid.x;
			ymax = _grid.y;

			// Prevent arg mutation

			image = imageP;
			xpos = xposP;
			ypos = yposP;
			region = regionP;

			if ( _validImage( fn, image ) === PS.ERROR )
			{
				return PS.ERROR;
			}

			w = image.width;
			h = image.height;
			format = image.pixelSize;
			data = image.data;

			// Validate xpos

			type = _typeOf( xpos );
			if ( ( type === "undefined" ) || ( xpos === PS.DEFAULT ) )
			{
				xpos = 0;
			}
			else if ( type === "number" )
			{
				xpos = Math.floor( xpos );
			}
			else
			{
				return _error( fn + "xpos argument invalid" );
			}

			// Validate ypos

			type = _typeOf( ypos );
			if ( ( type === "undefined" ) || ( ypos === PS.DEFAULT ) )
			{
				ypos = 0;
			}
			else if ( type === "number" )
			{
				ypos = Math.floor( ypos );
			}
			else
			{
				return _error( fn + "ypos argument invalid" );
			}

			// If drawing is obviously offgrid, exit now

			if ( ( xpos >= xmax ) || ( ypos >= ymax ) || ( ( xpos + w ) < 1 ) || ( ( ypos + h ) < 1 ) )
			{
				return false;
			}

			// Validate region

			type = _typeOf( region );
			if ( ( type === "undefined" ) || ( region === PS.DEFAULT ) )
			{
				top = 0;
				left = 0;
				width = w;
				height = h;
			}
			else if ( type === "object" )
			{
				// check region.left

				left = region.left;
				type = _typeOf( left );
				if ( ( type === "undefined" ) || ( left === PS.DEFAULT ) )
				{
					left = 0;
				}
				else
				{
					if ( type !== "number" )
					{
						return _error( fn + "region.left invalid" );
					}
					left = Math.floor( left );
					if ( left < 0 )
					{
						left = 0;
					}
					else if ( left >= w )
					{
						return _error( fn + "region.left outside image" );
					}
				}

				// check region.top

				top = region.top;
				type = _typeOf( top );
				if ( ( type === "undefined" ) || ( top === PS.DEFAULT ) )
				{
					top = 0;
				}
				else
				{
					if ( type !== "number" )
					{
						return _error( fn + "region.top invalid" );
					}
					top = Math.floor( top );
					if ( top < 0 )
					{
						top = 0;
					}
					else if ( top >= h )
					{
						return _error( fn + "region.top outside image" );
					}
				}

				// check region.width

				width = region.width;
				type = _typeOf( width );
				if ( ( type === "undefined" ) || ( width === PS.DEFAULT ) )
				{
					width = w - left;
				}
				else
				{
					if ( type !== "number" )
					{
						return _error( fn + "region.width invalid" );
					}
					width = Math.floor( width );
					if ( width < 1 )
					{
						return false;
					}
					if ( ( left + width ) > w )
					{
						width = w - left;
					}
				}

				// exit now if off grid

				if ( ( xpos + width ) < 1 )
				{
					return false;
				}

				// check region.height

				height = region.height;
				type = _typeOf( height );
				if ( ( type === "undefined" ) || ( height === PS.DEFAULT ) )
				{
					height = h - top;
				}
				else
				{
					if ( type !== "number" )
					{
						return _error( fn + "region.height invalid" );
					}
					height = Math.floor( height );
					if ( height < 1 )
					{
						return false;
					}
					if ( ( top + height ) > h )
					{
						height = h - top;
					}
				}

				// exit now if off grid

				if ( ( ypos + height ) < 1 )
				{
					return false;
				}
			}
			else
			{
				return _error( fn + "region argument invalid" );
			}

			// adjust blitted width and height so only visible portion gets drawn

			// Cut off left edge if offgrid

			if ( xpos < 0 )
			{
				width += xpos; // reduce width (remember, xpos is NEGATIVE!)
				if ( width < 1 )
				{
					return false;
				}
				left -= xpos; // move left corner over
				xpos = 0;
			}

			// Cut off right edge if offgrid

			val = xpos + width;
			if ( val > xmax )
			{
				width = xmax - xpos;
			}

			if ( width < 1 )
			{
				return false;
			}

			// Cut off top edge ff offgrid

			if ( ypos < 0 )
			{
				height += ypos; // reduce height (remember, ypos is NEGATIVE!)
				if ( height < 1 )
				{
					return false;
				}
				top -= ypos; // move top corner down
				ypos = 0;
			}

			// Cut off bottom edge if offgrid

			val = ypos + height;
			if ( val > ymax )
			{
				height = ymax - ypos;
			}

			if ( height < 1 )
			{
				return false;
			}

			wsize = ( w * format ); // size of each image row (calc only once)

			a = 255; // assume default alpha
			plane = _grid.plane;

			// create pointer to TL corner of image data

			rowptr = ( top * wsize ) + ( left * format );
			drawy = ypos;
			for ( y = 0; y < height; y += 1 )
			{
				ptr = rowptr; // set data pointer to start of row
				drawx = xpos;
				for ( x = 0; x < width; x += 1 )
				{
					// handle multiplexed rgb

					if ( format < 3 ) // formats 1 and 2
					{
						rgb = data[ ptr ];

						// decode multiplex

						r = rgb / _RSHIFT;
						r = Math.floor( r );
						rval = r * _RSHIFT;

						g = (rgb - rval) / _GSHIFT;
						g = Math.floor( g );
						gval = g * _GSHIFT;

						b = rgb - rval - gval;

						if ( format === 2 )
						{
							a = data[ ptr + 1 ];
						}
					}

					// handle r g b (a)

					else  // formats 3 and 4
					{
						r = data[ptr];
						g = data[ptr + 1];
						b = data[ptr + 2];
						rgb = ( r * _RSHIFT ) + ( g * _GSHIFT ) + b;
						if ( format === 4 )
						{
							a = data[ptr + 3];
						}
					}

					// rgb, r, g, b and a are now determined

					i = drawx + ( drawy * xmax ); // get index of bead
					bead = _beads[ i ];
					//				PS.debug("drawx = " + drawx + ", drawy = " + drawy + "\n");
					if ( bead.active )
					{
						color = _colorPlane( bead, plane );
						color.r = r;
						color.g = g;
						color.b = b;
						color.a = a;
						color.rgb = rgb;
						_recolor( bead );
					}

					drawx += 1;
					ptr += format;
				}
				drawy += 1;
				rowptr += wsize; // point to start of next row
			}

			return true;
		},

		// Create an image object from the grid
		// Optional [format] specifies region

		imageCapture : function ( formatP, regionP )
		{
			var fn, args, format, region, type, w, h, data, top, left, width, height, total, output,
				right, bottom, id, cnt, x, y, i, bead, color;

			fn = "[PS.imageCapture] ";

			args = arguments.length;
			if ( args > 2 )
			{
				return _error( fn + "Too many arguments" );
			}

			// Prevent arg mutation

			format = formatP;
			region = regionP;

			type = _typeOf( format );
			if ( ( type === "undefined" ) || ( format === PS.DEFAULT ) )
			{
				format = 3;
			}
			else
			{
				if ( type !== "number" )
				{
					return _error( fn + "format argument invalid" );
				}
				format = Math.floor( format );
				if ( ( format < 1 ) && ( format > 4 ) )
				{
					return _error( fn + "format argument is not 1, 2, 3 or 4" );
				}
			}

			w = _grid.x;
			h = _grid.y;

			// Validate region

			type = _typeOf( region );
			if ( ( type === "undefined" ) || ( region === PS.DEFAULT ) )
			{
				top = 0;
				left = 0;
				width = w;
				height = h;
			}
			else if ( type === "object" )
			{
				// check region.left

				left = region.left;
				type = _typeOf( left );
				if ( ( type === "undefined" ) || ( left === PS.DEFAULT ) )
				{
					left = 0;
				}
				else
				{
					if ( type !== "number" )
					{
						return _error( fn + "region.left not a number" );
					}
					left = Math.floor( left );
					if ( left < 0 )
					{
						left = 0;
					}
					else if ( left >= w )
					{
						return _error( fn + "region.left outside grid" );
					}
				}

				// check region.top

				top = region.top;
				type = _typeOf( top );
				if ( ( type === "undefined" ) || ( top === PS.DEFAULT ) )
				{
					top = 0;
				}
				else
				{
					if ( type !== "number" )
					{
						return _error( fn + "region.top not a number" );
					}
					top = Math.floor( top );
					if ( top < 0 )
					{
						top = 0;
					}
					else if ( top >= h )
					{
						return _error( fn + "region.top outside grid" );
					}
				}

				// check region.width

				width = region.width;
				type = _typeOf( width );
				if ( ( type === "undefined" ) || ( width === PS.DEFAULT ) )
				{
					width = w - left;
				}
				else
				{
					if ( type !== "number" )
					{
						return _error( fn + "region.width not a number" );
					}
					width = Math.floor( width );
					if ( ( width < 1 ) || ( ( left + width ) > w ) )
					{
						width = w - left;
					}
				}

				// check region.height

				height = region.height;
				type = _typeOf( height );
				if ( ( type === "undefined" ) || ( height === PS.DEFAULT ) )
				{
					height = h - top;
				}
				else
				{
					if ( type !== "number" )
					{
						return _error( fn + "region.height not a number" );
					}
					height = Math.floor( height );
					if ( ( height < 1 ) || ( ( top + height ) > h ) )
					{
						height = h - top;
					}
				}
			}
			else
			{
				return _error( fn + "region argument invalid" );
			}

			// Init image

			id = _IMAGE_PREFIX + _imageCnt; // a unique ID
			_imageCnt += 1;

			output = {
				source : PS.GRID,
				id : id,
				width : width,
				height : height,
				pixelSize : format,
				valid : true,
				data : []
			};

			// If no data, return empty data

			total = width * height;
			if ( total < 1 )
			{
				return output;
			}

			// presize the output array

			data = output.data;
			data.length = total * format;

			right = left + width;
			bottom = top + height;
			cnt = 0;

			for ( y = top; y < bottom; y += 1 )
			{
				for ( x = left; x < right; x += 1 )
				{
					i = x + ( y * w ); // get index of bead
					bead = _beads[ i ];
					color = bead.color; // uses the current effective color
					if ( format < 3 ) // format 1 & 2
					{
						data[ cnt ] = color.rgb;
						if ( format === 2 )
						{
							data[ cnt + 1 ] = color.a;
						}
					}
					else // format 3 & 4
					{
						data[ cnt ] = color.r;
						data[ cnt + 1 ] = color.g;
						data[ cnt + 2 ] = color.b;
						if ( format === 4 )
						{
							data[ cnt + 3 ] = color.a;
						}
					}
					cnt += format;
				}
			}

			return output;
		},

		// Dump a Javascript text representation of an image to the debugger
		// Optional [coords] specify region of dump

		imageDump : function ( imageP, regionP, formatP, linelenP, hexP )
		{
			var fn, args, image, region, format, linelen, hex, w, h, psize, data, type, top, left, width, height,
				total, str, wsize, pcnt, done, a, rowptr, ptr, y, x, r, g, b, rgb, rval, gval;

			fn = "[PS.imageDump] ";

			args = arguments.length;
			if ( args < 1 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 5 )
			{
				return _error( fn + "Too many arguments" );
			}

			// Prevent arg mutation

			image = imageP;
			region = regionP;
			format = formatP;
			linelen = linelenP;

			// Validate image

			if ( _validImage( fn, image ) === PS.ERROR )
			{
				return PS.ERROR;
			}

			w = image.width;
			h = image.height;
			psize = image.pixelSize;
			data = image.data;

			// Validate region

			type = _typeOf( region );
			if ( ( type === "undefined" ) || ( region === PS.DEFAULT ) )
			{
				top = 0;
				left = 0;
				width = w;
				height = h;
			}
			else if ( type === "object" )
			{
				// check region.left

				left = region.left;
				type = _typeOf( left );
				if ( ( type === "undefined" ) || ( left === PS.DEFAULT ) )
				{
					left = 0;
				}
				else
				{
					if ( type !== "number" )
					{
						return _error( fn + "region.left invalid" );
					}
					left = Math.floor( left );
					if ( left < 0 )
					{
						left = 0;
					}
					else if ( left >= w )
					{
						return _error( fn + "region.left outside grid" );
					}
				}

				// check region.top

				top = region.top;
				type = _typeOf( top );
				if ( ( type === "undefined" ) || ( top === PS.DEFAULT ) )
				{
					top = 0;
				}
				else
				{
					if ( type !== "number" )
					{
						return _error( fn + "region.top invalid" );
					}
					top = Math.floor( top );
					if ( top < 0 )
					{
						top = 0;
					}
					else if ( top >= h )
					{
						return _error( fn + "region.top outside grid" );
					}
				}

				// check region.width

				width = region.width;
				type = _typeOf( width );
				if ( ( type === "undefined" ) || ( width === PS.DEFAULT ) )
				{
					width = w - left;
				}
				else
				{
					if ( type !== "number" )
					{
						return _error( fn + "region.width invalid" );
					}
					width = Math.floor( width );
					if ( ( width < 1 ) || ( ( left + width ) > w ) )
					{
						width = w - left;
					}
				}

				// check region.height

				height = region.height;
				type = _typeOf( height );
				if ( ( type === "undefined" ) || ( height === PS.DEFAULT ) )
				{
					height = h - top;
				}
				else
				{
					if ( type !== "number" )
					{
						return _error( fn + "region.height invalid" );
					}
					height = Math.floor( height );
					if ( ( height < 1 ) || ( ( top + height ) > h ) )
					{
						height = h - top;
					}
				}
			}
			else
			{
				return _error( fn + "region argument invalid" );
			}

			total = width * height;

			// Validate format

			type = _typeOf( format );
			if ( ( type === "undefined" ) || ( format === PS.DEFAULT ) )
			{
				format = psize; // use format of source image by default
			}
			else
			{
				if ( type !== "number" )
				{
					return _error( fn + "format argument invalid" );
				}
				format = Math.floor( format );
				if ( ( format < 1 ) || ( format > 4 ) )
				{
					return _error( fn + "format argument is not 1, 2, 3 or 4" );
				}
			}

			// Validate linelen

			type = _typeOf( linelen );
			if ( ( type === "undefined" ) || ( linelen === PS.DEFAULT ) )
			{
				linelen = width;
			}
			else
			{
				if ( type !== "number" )
				{
					return _error( fn + "length argument invalid" );
				}
				linelen = Math.floor( linelen );
				if ( linelen < 1 )
				{
					linelen = 1;
				}
				if ( linelen > total )
				{
					linelen = total;
				}
			}

			// Validate hex

			hex = _isBoolean( hexP, PS.ERROR, true, true );
			if ( hex === PS.ERROR )
			{
				return _error( fn + "hex argument invalid" );
			}

			// Init output string

			str = "\nvar myImage = {\n\twidth : " + width + ", height : " + height + ", pixelSize : " + format + ",\n\tdata : [";

			// If no data, return empty

			if ( total < 1 )
			{
				str += "]\n};\n";
				PS.debug( str );
				return PS.DONE;
			}

			str += "\n\t"; // start of first pixel line
			a = 255; // default alpha
			done = pcnt = 0;

			// create pointer to TL corner of image data

			wsize = ( w * psize ); // size of each image row (calc only once)
			rowptr = (top * wsize) + (left * psize);
			for ( y = 0; y < height; y += 1 )
			{
				ptr = rowptr; // set data pointer to start of row
				for ( x = 0; x < width; x += 1 )
				{
					// handle multiplexed rgb

					if ( psize < 3 )
					{
						rgb = data[ ptr ];

						// decode multiplex

						if ( rgb < 1 )
						{
							r = g = b = 0;
						}
						else if ( rgb >= 0xFFFFFF )
						{
							r = g = b = 255;
						}
						else
						{
							r = rgb / _RSHIFT;
							r = Math.floor( r );
							rval = r * _RSHIFT;

							g = (rgb - rval) / _GSHIFT;
							g = Math.floor( g );
							gval = g * _GSHIFT;

							b = rgb - rval - gval;
						}

						if ( psize === 2 )
						{
							a = data[ ptr + 1 ];
						}
					}
					else
					{
						r = data[ ptr ];
						g = data[ ptr + 1 ];
						b = data[ ptr + 2 ];
						rgb = ( r * _RSHIFT ) + ( g * _GSHIFT ) + b;
						if ( psize === 4 )
						{
							a = data[ ptr + 3 ];
						}
					}

					str += _outputPixel( format, hex, rgb, r, g, b, a );

					done += 1;
					if ( done < total )
					{
						str += ",";
						pcnt += 1;
						if ( pcnt < linelen ) // continue this line
						{
							str += " ";
						}
						else // start next line
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

			PS.debug( str );

			return PS.DONE;
		},

		// ----------
		// SPRITE API
		// ----------

		// PS.spriteSolid( image, region )
		// Create a solid sprite of specified dimensions

		spriteSolid : function ( widthP, heightP )
		{
			var fn, args, width, height, s;

			fn = "[PS.spriteSolid] ";

			args = arguments.length;
			if ( args < 2 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 2 )
			{
				return _error( fn + "Too many argument(s)" );
			}

			// Prevent arg mutation

			width = widthP;
			height = heightP;

			// Check width

			if ( width === PS.DEFAULT )
			{
				width = 1;
			}
			else if ( _typeOf( width ) === "number" )
			{
				width = Math.floor( width );
				if ( width < 1 )
				{
					width = 1;
				}
			}
			else
			{
				return _error( fn + "width argument invalid" );
			}

			// Check height

			if ( height === PS.DEFAULT )
			{
				height = 1;
			}
			else if ( _typeOf( height ) === "number" )
			{
				height = Math.floor( height );
				if ( height < 1 )
				{
					height = 1;
				}
			}
			else
			{
				return _error( fn + "height argument invalid" );
			}

			s = _newSprite();
			s.width = width;
			s.height = height;
			s.color = { rgb : 0, r : 0, g : 0, b : 0, a : 255 };

			return s.id;
		},

		// PS.spriteSolidColor ( sprite, color )
		// Sets color of a solid sprite

		spriteSolidColor : function ( sprite, p1, p2, p3 )
		{
			var fn, args, s, colors, current, rgb, r, g, b;

			fn = "[PS.spriteSolidColor] ";

			args = arguments.length;
			if ( args < 1 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 4 )
			{
				return _error( fn + "Too many argument(s)" );
			}

			s = _getSprite( sprite, fn );
			if ( s === PS.ERROR )
			{
				return PS.ERROR;
			}

			current = s.color;
			if ( !current )
			{
				return _error( fn + "Cannot set color of image sprite " + s.id );
			}

			colors = _decodeColors( fn, p1, p2, p3 );
			if ( colors === PS.ERROR )
			{
				return PS.ERROR;
			}

			rgb = colors.rgb;
			if ( rgb !== PS.CURRENT )
			{
				if ( rgb === null ) // must inspect r/g/b values
				{
					r = colors.r;
					if ( r === PS.CURRENT )
					{
						colors.r = r = current.r;
					}
					else if ( r === PS.DEFAULT )
					{
						colors.r = r = 0;
					}

					g = colors.g;
					if ( g === PS.CURRENT )
					{
						colors.g = g = current.g;
					}
					else if ( g === PS.DEFAULT )
					{
						colors.g = g = 0;
					}

					b = colors.b;
					if ( b === PS.CURRENT )
					{
						colors.b = b = current.b;
					}
					else if ( b === PS.DEFAULT )
					{
						colors.b = b = 0;
					}

					colors.rgb = rgb = ( r * _RSHIFT ) + ( g * _GSHIFT ) + b;
				}

				else if ( rgb === PS.DEFAULT )
				{
					colors.rgb = rgb = 0;
					colors.r = 0;
					colors.g = 0;
					colors.b = 0;
				}

				// only change color if necessary

				if ( current.rgb !== rgb )
				{
					current.rgb = rgb;
					current.r = colors.r;
					current.g = colors.g;
					current.b = colors.b;

					if ( s.visible && s.placed )
					{
						_drawSprite( s );
					}
				}
			}

			return current.rgb;
		},

		// PS.spriteSolidAlpha ( sprite, alpha )
		// Sets alpha of a solid sprite

		spriteSolidAlpha : function ( spriteP, alphaP )
		{
			var fn, args, sprite, alpha, s, current, type;

			fn = "[PS.spriteSolidAlpha] ";

			args = arguments.length;
			if ( args < 1 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 2 )
			{
				return _error( fn + "Too many argument(s)" );
			}

			// Prevent arg mutation

			sprite = spriteP;
			alpha = alphaP;

			s = _getSprite( sprite, fn );
			if ( s === PS.ERROR )
			{
				return PS.ERROR;
			}

			current = s.color;
			if ( !current )
			{
				return _error( fn + "Cannot set alpha of image sprite " + s.id );
			}

			type = _typeOf( alpha );
			if ( ( type !== "undefined" ) && ( alpha !== PS.CURRENT ) )
			{
				if ( alpha === PS.DEFAULT )
				{
					alpha = 255;
				}
				else if ( type === "number" )
				{
					alpha = Math.floor( alpha );
					if ( alpha < 0 )
					{
						alpha = 0;
					}
					else if ( alpha > 255 )
					{
						alpha = 255;
					}
				}
				else
				{
					return _error( fn + "alpha argument invalid" );
				}

				if ( current.a !== alpha )
				{
					current.a = alpha;
					if ( s.visible && s.placed )
					{
						_drawSprite( s );
					}
				}
			}

			return current.a;
		},

		// PS.spriteImage( image, region )
		// Create a sprite from an image with optional subregion
		// Makes a private format 4 reference image

		spriteImage : function ( image, region )
		{
			var fn, args, w, h, format, data, type, top, left, width, height, ndata, wsize, rowptr, ptr, x, y, i, rgb, r, g, b, a, rval, gval, s;

			fn = "[PS.spriteImage] ";
			args = arguments.length;

			if ( args < 1 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 2 )
			{
				return _error( fn + "Too many argument(s)" );
			}

			// Validate image

			if ( _validImage( fn, image ) === PS.ERROR )
			{
				return PS.ERROR;
			}

			left = top = 0;
			width = w = image.width;
			height = h = image.height;
			format = image.pixelSize;
			data = image.data;

			// Validate region

			type = _typeOf( region );
			if ( ( type !== "undefined" ) && ( region !== PS.DEFAULT ) )
			{
				if ( type !== "object" )
				{
					return _error( fn + "region argument invalid" );
				}

				// Check region.left

				left = region.left;
				type = _typeOf( left );
				if ( ( type === "undefined" ) || ( left === PS.DEFAULT ) )
				{
					left = 0;
				}
				else
				{
					if ( type !== "number" )
					{
						return _error( fn + "region.left invalid" );
					}
					left = Math.floor( left );
					if ( left < 0 )
					{
						left = 0;
					}
					else if ( left >= w )
					{
						return _error( fn + "region.left outside image" );
					}
				}

				// check region.top

				top = region.top;
				type = _typeOf( top );
				if ( ( type === "undefined" ) || ( top === PS.DEFAULT ) )
				{
					top = 0;
				}
				else
				{
					if ( type !== "number" )
					{
						return _error( fn + "region.top invalid" );
					}
					top = Math.floor( top );
					if ( top < 0 )
					{
						top = 0;
					}
					else if ( top >= h )
					{
						return _error( fn + "region.top outside image" );
					}
				}

				// check region.width

				width = region.width;
				type = _typeOf( width );
				if ( ( type === "undefined" ) || ( width === PS.DEFAULT ) )
				{
					width = w - left;
				}
				else
				{
					if ( type !== "number" )
					{
						return _error( fn + "region.width invalid" );
					}
					width = Math.floor( width );
					if ( ( width < 1 ) || ( ( left + width ) > w ) )
					{
						width = w - left;
					}
				}

				// check region.height

				height = region.height;
				type = _typeOf( height );
				if ( ( type === "undefined" ) || ( height === PS.DEFAULT ) )
				{
					height = h - top;
				}
				else
				{
					if ( type !== "number" )
					{
						return _error( fn + "region.height invalid" );
					}
					height = Math.floor( height );
					if ( ( height < 1 ) || ( ( top + height ) > h ) )
					{
						height = h - top;
					}
				}
			}

			// Create a new format 4 reference image

			ndata = [];
			ndata.length = width * height * 4;

			a = 255;

			wsize = ( w * format ); // size of each image row (calc only once)
			rowptr = ( top * wsize ) + ( left * format ); // pointer to TL corner of image data
			i = 0;
			for ( y = 0; y < height; y += 1 )
			{
				ptr = rowptr; // set data pointer to start of row
				for ( x = 0; x < width; x += 1 )
				{
					if ( format < 3 )
					{
						rgb = data[ ptr ];

						if ( rgb < 1 ) // handle black
						{
							rgb = r = g = b = 0;
						}
						else if ( rgb >= 0xFFFFFF ) // handle white
						{
							rgb = 0xFFFFFF;
							r = g = b = 255;
						}
						else
						{
							r = rgb / _RSHIFT;
							r = Math.floor( r );
							rval = r * _RSHIFT;

							g = ( rgb - rval ) / _GSHIFT;
							g = Math.floor( g );
							gval = g * _GSHIFT;

							b = rgb - rval - gval;
						}

						if ( format === 2 )
						{
							a = data[ ptr + 1 ];
						}
					}
					else
					{
						r = data[ ptr ];
						g = data[ ptr + 1 ];
						b = data[ ptr + 2 ];
						if ( format === 4 )
						{
							a = data[ ptr + 3 ];
						}
					}

					ndata[ i ] = r;
					ndata[ i + 1 ] = g;
					ndata[ i + 2 ] = b;
					ndata[ i + 3 ] = a;

					ptr += format;
					i += 4;
				}
				rowptr += wsize; // point to start of next row
			}

			s = _newSprite();
			s.width = width;
			s.height = height;
			s.image = {
				id : _IMAGE_PREFIX + _imageCnt, // unique id
				width : width,
				height : height,
				pixelSize : 4,
				data : ndata
			};

			_imageCnt += 1;

//			PS.imageDump( s.image );

			return s.id;
		},

		// PS.spriteShow( sprite, show )
		// Toggles visibility of a sprite

		spriteShow : function ( spriteP, showP )
		{
			var fn, args, sprite, show, s;

			fn = "[PS.spriteShow] ";

			args = arguments.length;
			if ( args < 1 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 2 )
			{
				return _error( fn + "Too many argument(s)" );
			}

			// Prevent arg mutation

			sprite = spriteP;
			s = _getSprite( sprite, fn );
			if ( s === PS.ERROR )
			{
				return PS.ERROR;
			}

			// Validate show

			show = _isBoolean( showP, PS.CURRENT, true, PS.CURRENT );
			if ( show === PS.ERROR )
			{
				return _error( fn + "show argument invalid" );
			}

			// Only change if needed

			if ( show !== PS.CURRENT )
			{
				if ( s.visible !== show )
				{
					s.visible = show;
					if ( s.placed )
					{
						if ( show )
						{
							_drawSprite( s );
							_collisionCheck( s, sprite );
						}
						else
						{
							_eraseSprite( s );
						}
					}
				}
			}

			return s.visible;
		},

		// PS.spriteAxis( sprite, x, y )
		// Sets/inspects positional axis of sprite

		spriteAxis : function ( spriteP, xP, yP )
		{
			var fn, args, sprite, x, y, s, type;

			fn = "[PS.spriteAxis] ";

			args = arguments.length;
			if ( args < 1 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 3 )
			{
				return _error( fn + "Too many argument(s)" );
			}

			// Prevent arg mutation

			sprite = spriteP;
			x = xP;
			y = yP;

			s = _getSprite( sprite, fn );
			if ( s === PS.ERROR )
			{
				return PS.ERROR;
			}

			// Validate x

			type = _typeOf( x );
			if ( ( type === "undefined" ) || ( x === PS.CURRENT ) )
			{
				x = s.ax;
			}
			else if ( x === PS.DEFAULT )
			{
				x = 0;
			}
			else if ( type === "number" )
			{
				x = Math.floor( x );
			}
			else
			{
				return _error( fn + "x argument invalid" );
			}

			// Validate y

			type = _typeOf( y );
			if ( ( type === "undefined" ) || ( y === PS.CURRENT ) )
			{
				y = s.ay;
			}
			else if ( y === PS.DEFAULT )
			{
				y = 0;
			}
			else if ( type === "number" )
			{
				y = Math.floor( y );
			}
			else
			{
				return _error( fn + "y argument invalid" );
			}

			// Either axis changing?

			if ( ( x !== s.ax ) || ( y !== s.ay ) )
			{
				s.ax = x;
				s.ay = y;

				if ( s.visible && s.placed )
				{
					_drawSprite( s );
					_collisionCheck( s, sprite );
				}
			}

			return { x : s.ax, y : s.ay };

		},

		// PS.spritePlane( sprite, plane )
		// Sets/inspects sprite plane

		spritePlane : function ( spriteP, planeP )
		{
			var fn, args, sprite, plane, s, type;

			fn = "[PS.spritePlane] ";

			args = arguments.length;
			if ( args < 1 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 2 )
			{
				return _error( fn + "Too many arguments" );
			}

			// Prevent arg mutation

			sprite = spriteP;
			plane = planeP;

			s = _getSprite( sprite, fn );
			if ( s === PS.ERROR )
			{
				return PS.ERROR;
			}

			// Validate plane

			type = _typeOf( plane );
			if ( ( type !== "undefined" ) && ( plane !== PS.CURRENT ) )
			{
				if ( plane === PS.DEFAULT )
				{
					plane = 0;
				}
				else if ( type === "number" )
				{
					plane = Math.floor( plane );
					if ( plane < 1 )
					{
						plane = 0;
					}
				}
				else
				{
					return _error( fn + "plane argument invalid" );
				}

				// Plane changing? No collision check needed here

				if ( s.plane !== plane )
				{
					// Erase on current plane

					if ( s.visible && s.placed )
					{
						_eraseSprite( s );
					}

					s.plane = plane;

					// Redraw on new plane

					if ( s.visible && s.placed )
					{
						_drawSprite( s );
					}
				}
			}

			// Return default if not set yet

			if ( s.plane < 0 )
			{
				return 0;
			}

			return s.plane;
		},

		// PS.spriteMove ( sprite, x, y )
		// Erases sprite at previous location (if any)
		// Redraws at x/y

		spriteMove : function ( spriteP, xP, yP )
		{
			var fn, args, sprite, x, y, s, type, h_left, h_top, h_width, h_height, v_left, v_top, v_width, v_height;

			fn = "[PS.spriteMove] ";

			args = arguments.length;
			if ( args < 1 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 3 )
			{
				return _error( fn + "Too many argument(s)" );
			}

			// Prevent arg mutation

			sprite = spriteP;
			x = xP;
			y = yP;

			s = _getSprite( sprite, fn );
			if ( s === PS.ERROR )
			{
				return PS.ERROR;
			}

			// Validate x

			type = _typeOf( x );
			if ( ( type === "undefined" ) || ( x === PS.CURRENT ) )
			{
				x = s.x;
			}
			else if ( x === PS.DEFAULT )
			{
				x = 0;
			}
			else if ( type === "number" )
			{
				x = Math.floor( x );
			}
			else
			{
				return _error( fn + "x argument invalid" );
			}

			// Validate y

			type = _typeOf( y );
			if ( ( type === "undefined" ) || ( y === PS.CURRENT ) )
			{
				y = s.y;
			}
			else if ( y === PS.DEFAULT )
			{
				y = 0;
			}
			else if ( type === "number" )
			{
				y = Math.floor( y );
			}
			else
			{
				return _error( fn + "y argument invalid" );
			}

			// Either coordinate changing?

			if ( !s.placed || ( x !== s.x ) || ( y !== s.y ) )
			{
				// If no plane assigned, use current

				if ( s.plane < 0 )
				{
					s.plane = _grid.plane;
				}

				// Erase previous position

				if ( s.visible && s.placed )
				{
					// Which beads (if any) actually need to be erased?
					// Don't erase beads that will be overwritten by moved sprite

					// create h rect

					h_top = s.y;
					h_height = s.height;
					if ( x > s.x ) // sprite moving right
					{
						h_width = x - s.x;
						h_left = s.x;
					}
					else if ( s.x > x ) // sprite moving left
					{
						h_width = s.x - x;
						h_left = s.x + s.width - h_width;
					}
					else
					{
						h_width = 0;
					}

					// If moving far enough right/left, just erase entire sprite

					if ( h_width >= s.width )
					{
						_eraseSprite( s, s.x, s.y, s.width, s.height );
					}
					else
					{
						// Create v rect

						v_left = s.x;
						v_width = s.width;
						if ( y > s.y ) // sprite moving down
						{
							v_height = y - s.y;
							v_top = s.y;
						}
						else if ( s.y > y ) // sprite moving up
						{
							v_height = s.y - y;
							v_top = s.y + s.height - v_height;
						}
						else
						{
							v_height = 0;
						}

						// If moving far enough up/down, just erase entire sprite

						if ( v_height >= s.height )
						{
							_eraseSprite( s, s.x, s.y, s.width, s.height );
						}

						// Which rects need erasing?

						else if ( v_height < 1 ) // not moving vertically
						{
							_eraseSprite( s, h_left, h_top, h_width, h_height );
						}
						else if ( v_width < 1 ) // not moving horizontally
						{
							_eraseSprite( s, v_left, v_top, v_width, v_height );
						}
						else // Both must be erased
						{
							v_width -= h_width; // trim v_width

							if ( x > s.x ) // moving right, so move v_left right
							{
								v_left += h_width;
							}

							_eraseSprite( s, h_left, h_top, h_width, h_height );
							_eraseSprite( s, v_left, v_top, v_width, v_height );
						}
					}
				}

				s.x = x;
				s.y = y;
				s.placed = true;

				if ( s.visible )
				{
					_drawSprite( s );
					_collisionCheck( s, sprite );
				}
			}

			return { x : s.x, y : s.y };
		},

		// PS.spriteCollide( sprite, exec )
		// Sets/inspects collision function

		spriteCollide : function ( sprite, execP )
		{
			var fn, args, s, exec, type;

			fn = "[PS.spriteCollide] ";

			args = arguments.length;
			if ( args < 1 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 2 )
			{
				return _error( fn + "Too many arguments" );
			}

			s = _getSprite( sprite, fn );
			if ( s === PS.ERROR )
			{
				return PS.ERROR;
			}

			exec = execP; // avoid arg mutation
			type = _typeOf( exec );
			if ( ( type !== "undefined" ) && ( exec !== PS.CURRENT ) )
			{
				if ( exec === PS.DEFAULT )
				{
					exec = null;
				}
				else if ( type !== "function" )
				{
					return _error( fn + "exec argument not a function" );
				}

				if ( s.collide !== exec )
				{
					s.collide = exec;
					if ( exec && s.visible && s.placed )
					{
						_collisionCheck( s, sprite );
					}
				}
			}

			return s.collide;
		},

		// PS.spriteDelete( sprite)
		// Deletes a sprite

		spriteDelete : function ( sprite )
		{
			var fn, args, len, i, s;

			fn = "[PS.spriteDelete] ";

			args = arguments.length;
			if ( args < 1 )
			{
				return _error( fn + "Missing argument" );
			}
			if ( args > 1 )
			{
				return _error( fn + "Too many arguments" );
			}

			if ( ( typeof sprite !== "string" ) || ( sprite.length < 1 ) )
			{
				return _error( fn + "sprite argument invalid" );
			}

			// Find the sprite object and index

			len = _sprites.length;
			for ( i = 0; i < len; i += 1 )
			{
				s = _sprites[ i ];
				if ( s.id === sprite )
				{
					_eraseSprite( s );
					_sprites.splice( i, 1 );
					return PS.DONE;
				}
			}

			return _error( fn + "sprite id '" + sprite + "' not found" );
		},

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
		// Returns channel id if load succeeds, or PS.ERROR on error

		audioLoad : function ( filename, params )
		{
			var fn, result;

			fn = "[PS.audioLoad] ";

			if ( arguments.length < 1 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( arguments.length > 2 )
			{
				return _error( fn + "Too many arguments" );
			}

			result = AQ.load( filename, params );
			if ( result === AQ.ERROR )
			{
				return PS.ERROR;
			}
			return result;
		},

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

		audioPlay : function ( filename_p, params_p )
		{
			var fn, args, filename, params, type, result;

			fn = "[PS.audioPlay] ";

			args = arguments.length;
			if ( args < 1 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 2 )
			{
				return _error( fn + "Too many arguments" );
			}

			// Prevent arg mutation

			filename = filename_p;
			params = params_p;

			type = _typeOf( params );
			if ( type === "undefined" )
			{
				params = {};
			}
			else if ( type !== "object" )
			{
				return _error( fn + "params argument invalid" );
			}

			params.autoplay = true; // force immediate playback

			result = AQ.load( filename, params );
			if ( result === AQ.ERROR )
			{
				return PS.ERROR;
			}
			return result;
		},

		// PS.audioPause()
		// Toggles pause on an audio channel
		// [channel] is a channel id
		// Returns channel id on success, PS.ERROR on error

		audioPause : function ( channel_id )
		{
			var fn, args, result;

			fn = "[PS.audioPause] ";

			args = arguments.length;
			if ( args < 1 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 1 )
			{
				return _error( fn + "Too many arguments" );
			}

			result = AQ.pause( channel_id );
			if ( result === AQ.ERROR )
			{
				return PS.ERROR;
			}
			return result;
		},

		// PS.audioStop()
		// Stops a playing audio channel
		// [channel] is a channel id
		// Returns channel id on success, PS.ERROR on error

		audioStop : function ( channel_id )
		{
			var fn, args, result;

			fn = "[PS.audioStop] ";

			args = arguments.length;
			if ( args < 1 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 1 )
			{
				return _error( fn + "Too many arguments" );
			}

			result = AQ.stop( channel_id );
			if ( result === AQ.ERROR )
			{
				return PS.ERROR;
			}
			if ( result === AQ.DONE )
			{
				return PS.DONE;
			}
			return result;
		},

		// PS.piano ( val, flag )
		// Returns filename of indexed piano note
		// [val] is index
		// Optional [flag] specifies long version

		piano : function ( val_p, flag_p )
		{
			var fn, len, type, val, flag, str;

			fn = "[PS.piano] ";
			len = _PIANO_FILES.length;

			val = val_p; // avoid arg mutation;
			type = _typeOf( val );
			if ( type !== "number" )
			{
				return _error( fn + "index argument invalid" );
			}
			val = Math.floor( val );
			if ( val < 1 )
			{
				val = 1;
			}
			else if ( val > len )
			{
				val = len;
			}

			flag = flag_p; // avoid arg mutation
			if ( ( flag !== true ) && ( flag !== false ) )
			{
				type = _typeOf( flag );
				if ( type === "undefined" )
				{
					flag = false;
				}
				else if ( type !== "number" )
				{
					return _error( fn + "flag argument invalid" );
				}
			}

			str = "piano_" + _PIANO_FILES[ val - 1 ];
			if ( flag )
			{
				str = "l_" + str;
			}
			return str;
		},

		// PS.harpsichord ( val, flag )
		// Returns filename of indexed harpsichord note
		// [val] is index
		// Optional [flag] specifies long version

		harpsichord : function ( val_p, flag_p )
		{
			var fn, len, type, val, flag, str;

			fn = "[PS.harpsichord] ";
			len = _HCHORD_FILES.length;

			val = val_p; // avoid arg mutation;
			type = _typeOf( val );
			if ( type !== "number" )
			{
				return _error( fn + "index argument invalid" );
			}
			val = Math.floor( val );
			if ( val < 1 )
			{
				val = 1;
			}
			else if ( val > len )
			{
				val = len;
			}

			flag = flag_p; // avoid arg mutation
			if ( ( flag !== true ) && ( flag !== false ) )
			{
				type = _typeOf( flag );
				if ( type === "undefined" )
				{
					flag = false;
				}
				else if ( type !== "number" )
				{
					return _error( fn + "flag argument invalid" );
				}
			}

			str = "hchord_" + _HCHORD_FILES[ val - 1 ];
			if ( flag )
			{
				str = "l_" + str;
			}
			return str;
		},

		// PS.xylophone ( val )
		// Returns filename of indexed xylophone note
		// [val] is index

		xylophone : function ( val_p )
		{
			var fn, len, type, val, str;

			fn = "[PS.xylophone] ";
			len = _XYLO_FILES.length;

			val = val_p; // avoid arg mutation;
			type = _typeOf( val );
			if ( type !== "number" )
			{
				return _error( fn + "index argument invalid" );
			}
			val = Math.floor( val );
			if ( val < 1 )
			{
				val = 1;
			}
			else if ( val > len )
			{
				val = len;
			}

			str = "xylo_" + _XYLO_FILES[ val - 1 ];
			return str;
		},

		//-------------------
		// DEBUGGER FUNCTIONS
		//-------------------

		// Add line to debugger (does not include CR)
		// Returns PS.DONE, or PS.ERROR on param error

		debug : function ( text_p )
		{
			var fn, text, type, e;

			fn = "[PS.debug] ";

			if ( arguments.length > 1 )
			{
				return _error( fn + "Too many arguments" );
			}

			text = text_p; // prevent arg mutation

			type = _typeOf( text );
			if ( type === "undefined" )
			{
				text = "";
			}
			else if ( type !== "string" )
			{
				return _error( fn + "argument not a string" );
			}

			_debugOpen();

			if ( text.length > 0 )
			{
				e = document.getElementById( _MONITOR_ID );
				e.value += text; // append string

				e.scrollTop = e.scrollHeight; // keep it scrolled down
			}

			_scrollDown();

			return PS.DONE;
		},

		// Close debugger div
		// Returns PS.DONE

		debugClose : function ()
		{
			var fn, e;

			fn = "[PS.debugClose] ";

			if ( arguments.length > 0 )
			{
				return _error( fn + "Too many arguments" );
			}

			e = document.getElementById( _DEBUG_ID );
			e.style.display = "none";
			_debugging = false;

			return PS.DONE;
		},

		// Clear monitor
		// Returns PS.DONE

		debugClear : function ()
		{
			var fn, e;

			fn = "[PS.debugClear] ";

			if ( arguments.length > 0 )
			{
				return _error( fn + "Too many arguments" );
			}

			e = document.getElementById( _MONITOR_ID );
			e.value = "";

			return PS.DONE;
		},

		//----------------
		// PATHFINDING API
		//----------------

		// PS.pathMap ( image )
		// Takes an image and returns a pathmap id for PS.pathFind()

		line : function ( x1_p, y1_p, x2_p, y2_p )
		{
			var fn, args, x1, y1, x2, y2, path;

			fn = "[PS.line] ";

			args = arguments.length;
			if ( args < 4 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 4 )
			{
				return _error( fn + "Too many arguments" );
			}

			// Prevent arg mutation

			x1 = x1_p;
			y1 = y1_p;
			x2 = x2_p;
			y2 = y2_p;

			// Check x1

			if ( _typeOf( x1 ) === "number" )
			{
				x1 = Math.floor( x1 );
			}
			else
			{
				return _error( fn + "x1 argument not a number" );
			}

			// Check y1

			if ( _typeOf( y1 ) === "number" )
			{
				y1 = Math.floor( y1 );
			}
			else
			{
				return _error( fn + "y1 argument not a number" );
			}

			// Check x2

			if ( _typeOf( x2 ) === "number" )
			{
				x2 = Math.floor( x2 );
			}
			else
			{
				return _error( fn + "x2 argument not a number" );
			}

			// Check y2

			if ( _typeOf( y2 ) === "number" )
			{
				y2 = Math.floor( y2 );
			}
			else
			{
				return _error( fn + "y2 argument not a number" );
			}

			path = _line( x1, y1, x2, y2 );
			return path;
		},

		// PS.pathMap ( image )
		// Takes an image and returns a pathmap id for PS.pathFind()

		pathMap : function ( image )
		{
			var fn, args, pm;

			fn = "[PS.pathMap] ";

			args = arguments.length;
			if ( args < 1 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 1 )
			{
				return _error( fn + "Too many arguments" );
			}

			// Check image

			if ( _validImage( fn, image ) === PS.ERROR )
			{
				return PS.ERROR;
			}
			if ( image.pixelSize !== 1 )
			{
				return _error( fn + "image is not format 1" );
			}

			pm = _newMap( image.width, image.height, image.data );

			return pm.id;
		},

		// pathFind : function ( pathmap, x1, y1, x2, y2 )
		// Takes pathmap id, start and end coordinates
		// Returns an array of [ x, y ] pairs representing path points

		pathFind : function ( pathmap_p, x1_p, y1_p, x2_p, y2_p, options_p )
		{
			var fn, args, pathmap, x1, y1, x2, y2, options, pm, type, path, val, no_diagonals, cut_corners;

			fn = "[PS.pathFind] ";

			args = arguments.length;
			if ( args < 5 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 6 )
			{
				return _error( fn + "Too many arguments" );
			}

			// Prevent arg mutation

			pathmap = pathmap_p;
			x1 = x1_p;
			y1 = y1_p;
			x2 = x2_p;
			y2 = y2_p;
			options = options_p;

			// Check id

			if ( ( typeof pathmap !== "string" ) || ( pathmap.length < 1 ) )
			{
				return _error( fn + "pathmap argument invalid" );
			}

			pm = _getMap( pathmap );
			if ( !pm )
			{
				return _error( fn + pathmap + " not found" );
			}

			// Check x1

			if ( _typeOf( x1 ) === "number" )
			{
				x1 = Math.floor( x1 );
				if ( ( x1 < 0 ) || ( x1 >= pm.width ) )
				{
					return _error( fn + "x1 argument is outside " + pathmap );
				}
			}
			else
			{
				return _error( fn + "x1 argument not a number" );
			}

			// Check y1

			if ( _typeOf( y1 ) === "number" )
			{
				y1 = Math.floor( y1 );
				if ( ( y1 < 0 ) || ( y1 >= pm.height ) )
				{
					return _error( fn + "y1 argument is outside " + pathmap );
				}
			}
			else
			{
				return _error( fn + "y1 argument not a number" );
			}

			// Check x2

			if ( _typeOf( x2 ) === "number" )
			{
				x2 = Math.floor( x2 );
				if ( ( x2 < 0 ) || ( x2 >= pm.width ) )
				{
					return _error( fn + "x2 argument is outside " + pathmap );
				}
			}
			else
			{
				return _error( fn + "x2 argument not a number" );
			}

			// Check y2

			if ( _typeOf( y2 ) === "number" )
			{
				y2 = Math.floor( y2 );
				if ( ( y2 < 0 ) || ( y2 >= pm.height ) )
				{
					return _error( fn + "y2 argument is outside " + pathmap );
				}
			}
			else
			{
				return _error( fn + "y2 argument not a number" );
			}

			// Assume default options

			no_diagonals = false;
			cut_corners = false;

			// Check options

			type = _typeOf( options );
			if ( ( type !== "undefined" ) && ( options !== PS.DEFAULT ) )
			{
				if ( type !== "object" )
				{
					return _error( fn + "options argument invalid" );
				}

				// Check .no_diagonals

				val = options.no_diagonals;
				if ( ( val === true ) || ( val === false ) )
				{
					no_diagonals = val;
				}
				else
				{
					type = _typeOf( val );
					if ( ( type === "undefined" ) || ( val === PS.DEFAULT ) )
					{
						no_diagonals = false;
					}
					else if ( type === "number" )
					{
						if ( val )
						{
							no_diagonals = false;
						}
						else
						{
							no_diagonals = true;
						}
					}
					else
					{
						return _error( fn + "options.no_diagonals invalid" );
					}
				}

				// Check .cut_corners

				val = options.cut_corners;
				if ( ( val === true ) || ( val === false ) )
				{
					cut_corners = val;
				}
				else
				{
					type = _typeOf( val );
					if ( ( type === "undefined" ) || ( val === PS.DEFAULT ) )
					{
						cut_corners = false;
					}
					else if ( type === "number" )
					{
						if ( val )
						{
							cut_corners = false;
						}
						else
						{
							cut_corners = true;
						}
					}
					else
					{
						return _error( fn + "options.cut_corners invalid" );
					}
				}
			}

			path = _findPath( pm, x1, y1, x2, y2, no_diagonals, cut_corners );
			return path;
		},

		// pathData : function ( id, left, top, width, height, data )
		// Takes pathmap id and region coordinates, sets/inspects using data
		// Returns an array of data at coordinates

		pathData : function ( pathmap_p, left_p, top_p, width_p, height_p, data_p )
		{
			var fn, args, pathmap, left, top, width, height, data, pm, max, type, result;

			fn = "[PS.pathData] ";

			args = arguments.length;
			if ( args < 5 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 6 )
			{
				return _error( fn + "Too many arguments" );
			}

			// Prevent arg mutation

			pathmap = pathmap_p;
			left = left_p;
			top = top_p;
			width = width_p;
			height = height_p;
			data = data_p;

			// Check id

			if ( ( typeof pathmap !== "string" ) || ( pathmap.length < 1 ) )
			{
				return _error( fn + "pathmap argument invalid" );
			}

			pm = _getMap( pathmap );
			if ( !pm )
			{
				return _error( fn + pathmap + " not found" );
			}

			// Check left

			if ( _typeOf( left ) === "number" )
			{
				left = Math.floor( left );
				if ( ( left < 0 ) || ( left >= pm.width ) )
				{
					return _error( fn + "left argument is outside " + pathmap );
				}
			}
			else
			{
				return _error( fn + "left argument not a number" );
			}

			// Check top

			if ( _typeOf( top ) === "number" )
			{
				top = Math.floor( top );
				if ( ( top < 0 ) || ( top >= pm.height ) )
				{
					return _error( fn + "top argument is outside " + pathmap );
				}
			}
			else
			{
				return _error( fn + "top argument not a number" );
			}

			// Check width

			if ( width === PS.DEFAULT )
			{
				width = 1;
			}
			else if ( _typeOf( width ) === "number" )
			{
				width = Math.floor( width );
				if ( width < 1 )
				{
					width = 1;
				}
				else
				{
					max = pm.width - left;
					if ( width > max )
					{
						width = max;
					}
				}
			}
			else
			{
				return _error( fn + "width argument not a number" );
			}

			// Check height

			if ( height === PS.DEFAULT )
			{
				height = 1;
			}
			else if ( _typeOf( height ) === "number" )
			{
				height = Math.floor( height );
				if ( height < 1 )
				{
					height = 1;
				}
				else
				{
					max = pm.height - top;
					if ( height > max )
					{
						height = max;
					}
				}
			}
			else
			{
				return _error( fn + "height argument not a number" );
			}

			// Check data

			if ( ( data !== PS.DEFAULT ) && ( data !== PS.CURRENT ) )
			{
				type = _typeOf( data );
				if ( type === "undefined" )
				{
					data = PS.CURRENT;
				}
				else if ( type === "number" )
				{
					if ( data < 0 )
					{
						return _error( fn + "data argument < 0" );
					}
				}
				else
				{
					return _error( fn + "data argument not a number" );
				}
			}

			result = _pathData( pm, left, top, width, height, data );
			return result;
		},

		// pathDelete: function ( pathmap )
		// Deletes pathmap
		// Returns PS.DONE or PS.ERROR

		pathDelete : function ( pathmap )
		{
			var fn, args;

			fn = "[PS.pathDelete] ";

			args = arguments.length;
			if ( args < 1 )
			{
				return _error( fn + "Missing argument" );
			}

			// Check pathmap id

			if ( ( typeof pathmap !== "string" ) || ( pathmap.length < 1 ) )
			{
				return _error( fn + "pathmap argument invalid" );
			}

			if ( !_deleteMap( pathmap ) )
			{
				return _error( fn + pathmap + " not found" );
			}

			return PS.DONE;
		},

		pathNear : function ( pathmap, x1, y1, x2, y2 )
		{
			var fn, args, pm, result;

			fn = "[PS.pathNear] ";

			args = arguments.length;
			if ( args < 5 )
			{
				return _error( fn + "Missing argument(s)" );
			}
			if ( args > 5 )
			{
				return _error( fn + "Too many arguments" );
			}

			// Check pathmap id

			if ( ( typeof pathmap !== "string" ) || ( pathmap.length < 1 ) )
			{
				return _error( fn + "pathmap argument invalid" );
			}

			pm = _getMap( pathmap );
			if ( !pm )
			{
				return _error( fn + pathmap + " not found" );
			}

			result = _pathNear( pm, x1, y1, x2, y2 );
			return result;
		}
	};
}() );

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel

( function ()
{
	"use strict";
	var lt, v, i, prefix;

	lt = 0;
	v = [ "webkit", "moz", "ms", "o" ];

	for ( i = 0; ( i < v.length ) && !window.requestAnimationFrame; i += 1 )
	{
		prefix = v[i];
		window.requestAnimationFrame = window[ prefix + "RequestAnimationFrame" ];
		window.cancelAnimationFrame = window[ prefix + "CancelAnimationFrame" ] || window[ prefix + "CancelRequestAnimationFrame" ];
	}

	if ( !window.requestAnimationFrame )
	{
		window.requestAnimationFrame = function ( cb, e )
		{
			var ct, ttc, id;

			ct = new Date().getTime();
			ttc = Math.max( 0, 16 - ( ct - lt ) );
			id = window.setTimeout( function ()
			                        {
				                        cb( ct + ttc );
			                        }, ttc );
			lt = ct + ttc;
			return id;
		};
	}

	if ( !window.cancelAnimationFrame )
	{
		window.cancelAnimationFrame = function ( id )
		{
			window.clearTimeout( id );
		};
	}
}() );

