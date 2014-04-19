// debug.js for Perlenspiel 3

// The following comments are for JSLint
/*jslint nomen: true, white: true, vars: true */
/*global document, window, screen, console, Image, AQ, PIXI */

var PS3ENGINE = ( function ( ps3 )
{
	var _sys = ps3._sys = ps3._sys || {}; // import _sys

	// Augment _sys with module features

	_sys.debug = {

		// Constants

		SHOW_STACK : true, // true if debug stack should be shown
		SHOW_HTML : false, // true if .html source should be shown

		// Variables

		available : false, // true if debugger is available
		active : false, // true if debugger is open
		focus : false, // true if debugger has focus
		sound : null, // error sound, null if none available
		div : null, // DOM division containing the monitor
		monitor : null, // DOM text box element for debugging messages

		// Functions

		// _sys.debug.open()
		// Open and clear debugger

		open : function ()
		{
			// Show the debug div if available and not already open

			if ( _sys.debug.available && !_sys.debug.active )
			{
				// Show the div containing the monitor

				_sys.debug.div.style.display = "inline";

				// Clear the monitor

				_sys.debug.monitor.value = "";
				_sys.debug.active = true;
			}

			_sys.debug.focus = false;
		},

		// _sys.debug.close()
		// Close debugger

		close : function ()
		{
			if ( _sys.debug.available )
			{
				_sys.debug.div.style.display = "none";
			}
			_sys.debug.active = false;
			_sys.debug.focus = false;
		},

		// _sys.debug.clear()
		// Clear debugger

		clear : function ()
		{
			if ( _sys.debug.available )
			{
				_sys.debug.monitor.value = "";
			}
		},

		// _sys.debug.append( str )
		// Append string to debugger

		append : function ( str )
		{
			var mon;

			if ( _sys.debug.available )
			{
				_sys.debug.open();
				mon = _sys.debug.monitor;
				mon.value += str; // append string
				mon.scrollTop = mon.scrollHeight; // keep text box scrolled down
			}

			_scrollDown();
		},

		// _sys.debug.warning( str )
		// Append warning string to debugger

		warning : function ( str )
		{
			if ( typeof str !== "string" )
			{
				str = str.toString();
			}

			_sys.debug.append( "WARNING: " + str + "\n" );
		},

		_decodeStackLine : function ( str )
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
			else if ( _sys.debug.SHOW_HTML && ( str.search( ".htm" ) !== -1 ) ) // HTML line
			{
				text += ( "\n" + str );
			}

			return text;
		},

		_decodeCallstack : function ( str )
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
				text += _sys.debug._decodeStackLine( lines[i] );
			}

			return text;
		},

		// _sys.debug.catchError ( msg, err )
		// Throw a catch error

		catchError : function ( msg, err )
		{
			var str;

			// Stop the clock

			_clockActive = false;
			if ( _footerTimer )
			{
				PS.timerStop( _footerTimer );
			}

			if ( typeof msg !== "string" )
			{
				msg = msg.toString();
			}

			str = "ERROR: " + msg + "\n";

			// set footer

			_footer.style.opacity = 1.0;
			_footer.innerHTML = str;

			// Only debugger gets call stack

			if ( _sys.debug.SHOW_STACK && err )
			{
				str += ( _sys.debug._decodeCallstack( err.stack ) + "\n" );
			}
			_sys.debug.append( str );

			if ( _sys.debug.sound )
			{
				PS.audioPlay( _DEFAULTS.audio.error_sound, { path : _DEFAULTS.audio.path } );
			}

			return PS.ERROR;
		},

		// _sys.debug.error( str )
		// Append error string to debugger

		error : function ( str )
		{
			// Throw error to access call stack

			try
			{
				throw( new Error( "!" ) );
			}
			catch ( err )
			{
				return _sys.debug.catchError( str, err );
			}
		},

		// _sys.debug.init ( div, monitor )
		// Initialize debugger
		// div : DOM <div> element containing monitor
		// monitor : DOM <textarea> element for messages
		// If either element is not specified or of incorrect type,
		// no debugging messages are shown

		init : function ( div, monitor )
		{
			var name;

			_sys.debug.available = false;
			_sys.debug.active = false;
			_sys.debug.focus = false;

			// Exit if either element not specified

			if ( !div || !monitor )
			{
				return;
			}

			// Verify <div> element

			name = div.nodeName;
			if ( !name || ( typeof name !== "string" ) )
			{
				return;
			}
			name = name.toLowerCase();
			if ( name !== "div" )
			{
				return;
			}

			// Verify <textarea> element

			name = monitor.nodeName;
			if ( !name || ( typeof name !== "string" ) )
			{
				return;
			}
			name = name.toLowerCase();
			if ( name !== "textarea" )
			{
				return;
			}

			// Make sure monitor is actually a child of div

			if ( monitor.parentNode !== div )
			{
				return;
			}

			// Add onfocus and onblur events to <textarea>

			monitor.onfocus = function ()
			{
				_sys.debug.focus = true;
			};

			monitor.onblur = function ()
			{
				_sys.debug.focus = false;
			};

			_sys.debug.div = div;
			_sys.debug.monitor = monitor;
			_sys.debug.available = true;
		}
	};

	return ps3;
} ( PS3ENGINE || {} ) );

