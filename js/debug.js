// debug.js

PS = ( function ( ps )
{
	"use strict";

	var _sys = ps._sys = ps._sys || {}; // establish _sys

	var _DID = "debug"; // debugger DOM id
	var _MID = "monitor"; // monitor DOM id
	var _dElement = null; // debugger DOM element
	var _mElement = null; // monitor DOM element
	var _debugging = false; // true if debugger open
	var _focused = false; // true if focus is on debugger
	var _stack = true; // Show debug stack
	var _html = false; // Show .html source

	_sys.debug = {

		// VARIABLES

		errorSound : null, // sound for error reports

		// METHODS

		// _sys.debug.init ()
		// main : object = DOM main element
		// Initializes debugger module

		init : function ( main )
		{
			var d, m;

			// Debug div

			_dElement = d = document.createElement( "div" );
			d.id = _DID;
			main.appendChild( d );

			// Monitor, append to debug

			_mElement = m = document.createElement( "textarea" );
			m.id = _MID;
			m.rows = 8;
			m.wrap = "soft";
			m.readonly = "readonly";
			m.onfocus = function ()
			{
				_focused = true;
			};
			m.onblur = function ()
			{
				_focused = false;
			};
			d.appendChild( m );

			_debugging = false;
			_focused = false;
		}
	};

	// Improved error reporter with stack trace
	// Based on code by Mark Diehr


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
		else if ( _html && ( str.search( ".htm" ) !== -1 ) ) // HTML line
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

	// Keep browser window scrolled to bottom

	function _scrollDown ()
	{
		var e;

		e = document.getElementById( "main" );
		e.scrollTop = e.scrollHeight;
	}

	_sys.errorCatch = function ( message, err )
	{
		var str;

		// Stop the clock

		_sys.clockActive = false;

		if ( ( typeof message !== "string" ) || ( message.length < 1 ) )
		{
			message = "???";
		}

		str = "ERROR: " + message + "\n";

		// set footer

		_footer.innerHTML = str;

		// Only debugger gets call stack

		if ( _stack && err )
		{
			str += ( _decodeCallstack( err.stack ) + "\n" );
		}
		PS.debug( str );

		if ( _sys.debug.errorSound )
		{
			PS.audioPlay( _DEFAULTS.audio.error_sound, { path : _DEFAULTS.audio.path } );
		}

		return PS.ERROR;
	};

	_sys.error = function ( message )
	{
		// Throw error to access callstack

		try
		{
			throw( new Error( "!" ) );
		}
		catch ( err )
		{
			return _sys.errorCatch( message, err );
		}
	};

	_sys.warning = function ( str )
	{
		if ( ( typeof str !== "string" ) || ( str.length < 1 ) )
		{
			str = "???";
		}

		PS.debug( "WARNING: " + str + "\n" );
	};

	// open()
	// Open debugger div, clear monitor

	function _open ()
	{
		// Show the debug div if not already open

		if ( !_debugging )
		{
			_dElement.style.display = "inline";
			_mElement.value = ""; // clear the monitor
			_debugging = true;
			_focused = false;
		}
	}

	// PUBLIC API

	// Add line to debugger (does not include CR)
	// Returns PS.DONE, or PS.ERROR on param error

	ps.debug = function ( textP )
	{
		var fn, text, type, e;

		fn = "[PS.debug] ";

		if ( arguments.length > 1 )
		{
			return _sys.error( fn + "Too many arguments" );
		}

		text = textP; // prevent arg mutation
		type = _typeOf( text );
		if ( type === "undefined" )
		{
			text = "";
		}
		else if ( type !== "string" )
		{
			text = text.toString();
		}

		_open();

		if ( text.length > 0 )
		{
			_mElement.value += text; // append string
			_mElement.scrollTop = _mElement.scrollHeight; // keep it scrolled down
		}

		_scrollDown();

		return PS.DONE;
	};

	// Close debugger div
	// Returns PS.DONE

	ps.debugClose = function ()
	{
		var fn;

		fn = "[PS.debugClose] ";

		if ( arguments.length > 0 )
		{
			return _sys.error( fn + "Too many arguments" );
		}

		_dElement.style.display = "none";
		_debugging = false;

		return PS.DONE;
	};

	// Clear monitor
	// Returns PS.DONE

	ps.debugClear = function ()
	{
		var fn;

		fn = "[PS.debugClear] ";

		if ( arguments.length > 0 )
		{
			return _error( fn + "Too many arguments" );
		}

		_mElement.value = "";
		return PS.DONE;
	};

	return ps;
} ( PS ) );
