// status.js

PS = ( function ( ps )
{
	"use strict";

	var _sys = ps._sys = ps._sys || {}; // establish _sys

	var _DEFAULTS = {
		text : "",
			color : {
			r : 0, g : 0, b : 0, a : 255,
				rgb : 0x000000,
				str : "rgba(0,0,0,1)"
		}
	};
	var _ID = "status"; // DOM id for status lin
	var _element = null; // status line DOM element
	var _fader = null; // fader object
	var _text = ""; // current text

	_sys.status = {

		// METHODS

		// _sys.status.init ( main )
		// Initialize status line
		// main : object = <main> DOM element

		init : function ( main )
		{
			var e;

			_element = e = document.createElement( "input" );
			e.id = _ID;
			e.type = "text";
			e.readonly = "readonly";
			e.onfocus = function ()
			{
				this.blur();
			};
			e.tabindex = -1;
			e.value = "Perlenspiel 3.1";
			e.wrap = "soft";
			main.appendChild( e );

			_fader = _sys.fader.new();
		},

		// _.sys.status.setColor ( str )
		// str : string = DOM color string
		// Sets foreground color of status line

		setColor : function ( str )
		{
			_element.style.color = str;
		},

		// _sys.status.setBackColor ( str )
		// str : string = DOM color string
		// Sets background color of status line

		setBackColor : function ( str )
		{
			_element.style.backgroundColor = str;
		}
	};

	// PUBLIC API

	ps.statusText = function ( strP )
	{
		var fn, str, type;

		fn = "[PS.statusText] ";

		if ( arguments.length > 1 )
		{
			return _error( fn + "Too many arguments" );
		}

		str = strP; // prevent arg mutation
		type = _sys.typeOf( str );
		if ( ( str !== PS.CURRENT ) && ( type !== "undefined" ) )
		{
			if ( str === PS.DEFAULT )
			{
				str = _DEFAULTS.text;
			}
			else if ( type !== "string" )
			{
				str = str.toString();
			}

			_element.value = _text = str;
		}

		return _text;
	};

	ps.statusColor = function ( p1, p2, p3 )
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
					colors.r = r = _DEFAULTS.color.r;
				}

				g = colors.g;
				if ( g === PS.CURRENT )
				{
					colors.g = g = current.g;
				}
				else if ( g === PS.DEFAULT )
				{
					colors.g = g = _DEFAULTS.color.g;
				}

				b = colors.b;
				if ( b === PS.CURRENT )
				{
					colors.b = b = current.b;
				}
				else if ( b === PS.DEFAULT )
				{
					colors.b = b = _DEFAULTS.color.b;
				}

				colors.rgb = ( r * _sys.RSHIFT ) + ( g * _sys.GSHIFT ) + b;
			}
			else if ( rgb === PS.DEFAULT )
			{
				_sys.copy( _DEFAULTS.color, colors );
			}

			// Only change color if different
			// But must also change if fader is active, start color is specified and doesn't match

			if ( ( current.rgb !== colors.rgb ) || ( ( fader.rate > 0 ) && ( fader.rgb !== null ) && ( fader.rgb !== colors.rgb ) ) )
			{
				current.rgb = colors.rgb;

				r = colors.r;
				g = colors.g;
				b = colors.b;

				current.str = colors.str = _sys.RSTR[ r ] + _sys.GBSTR[ g ] + _sys.BASTR[ b ];

				if ( fader.rate > 0 ) // must use fader
				{
					if ( fader.rgb !== null ) // use start color if specified
					{
						_sys.fader.start( fader, fader.r, fader.g, fader.b, 255, r, g, b, 255 );
					}
					if ( !fader.active )
					{
						_sys.fader.start( fader, current.r, current.g, current.b, 255, r, g, b, 255 );
					}
					else // must recalculate active fader
					{
						_sys.fader.recalc( fader, r, g, b, 255 );
					}
				}
				else
				{
					_element.style.color = current;
				}

				current.r = r;
				current.g = g;
				current.b = b;
			}
		}

		return current.rgb;
	};

	ps.statusFade = function ( rate, options_p )
	{
		var fn, val, type, options;

		fn = "[PS.statusFade] ";

		if ( arguments.length > 2 )
		{
			return _error( fn + "Too many arguments" );
		}

		val = rate;
		if ( val !== PS.CURRENT )
		{
			type = _typeOf( val );
			if ( type !== "undefined" )
			{
				if ( val === PS.DEFAULT )
				{
					_fader.rate = _sys.fader.DEFAULTS.rate;
				}
				else if ( type === "number" )
				{
					val = Math.floor( val );
					if ( val < 0 )
					{
						val = 0;
					}
					_fader.rate = val;
				}
				else
				{
					return _error( fn + "rate argument invalid" );
				}
			}
		}

		options = _sys.fader.validOptions( fn, options_p );
		if ( options === PS.ERROR )
		{
			return PS.ERROR;
		}

		val = options.rgb;
		if ( val !== PS.CURRENT )
		{
			if ( val === PS.DEFAULT )
			{
				_fader.rgb = _sys.fader.DEFAULTS.rgb;
			}
			else
			{
				_fader.rgb = val;
			}
			_fader.r = options.r;
			_fader.g = options.g;
			_fader.b = options.b;
		}

		val = options.onEnd;
		if ( val !== PS.CURRENT )
		{
			if ( val === PS.DEFAULT )
			{
				_fader.onEnd = _sys.fader.DEFAULTS.onEnd;
			}
			else
			{
				_fader.onEnd = val;
			}
		}

		val = options.params;
		if ( val !== PS.CURRENT )
		{
			if ( val === PS.DEFAULT )
			{
				_fader.params = _sys.fader.DEFAULTS.params;
			}
			else
			{
				_fader.params = val;
			}
		}

		return {
			rate : _fader.rate,
			rgb : _fader.rgb,
			onEnd : _fader.onEnd,
			params : _fader.params
		};
	};

	return ps;
} ( PS ) );

