// color.js
// The following comments are for JSLint

/*jslint nomen: true, white: true, vars: true */
/*global document, window, screen, console, Image, AQ */

PS = ( function ( ps )
{
	"use strict";

	var _sys = ps._sys = ps._sys || {}; // establish _sys

	_sys.validColors = function ( fn, colors, redP, greenP, blueP )
	{
		var red, green, blue, type;

		red = redP; // prevent arg mutation
		if ( ( red !== PS.CURRENT ) && ( red !== PS.DEFAULT ) )
		{
			type = _sys.typeOf( red );
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
				return _sys.error( fn + "red value invalid" );
			}
		}

		green = greenP; // prevent arg mutation
		if ( ( green !== PS.CURRENT ) && ( green !== PS.DEFAULT ) )
		{
			type = _sys.typeOf( green );
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
				return _sys.error( fn + "green value invalid" );
			}
		}

		blue = blueP; // prevent arg mutation
		if ( ( blue !== PS.CURRENT ) && ( blue !== PS.DEFAULT ) )
		{
			type = _sys.typeOf( blue );
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
				return _sys.error( fn + "blue value invalid" );
			}
		}

		colors.rgb = null; // signal to consult r/g/b properties
		colors.r = red;
		colors.g = green;
		colors.b = blue;

		return PS.DONE;
	};

	_sys.extractRGB = function ( colors, rgbP )
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
			red = rgb / _sys.RSHIFT;
			red = Math.floor( red );
			rval = red * _sys.RSHIFT;
			green = ( rgb - rval ) / _sys.GSHIFT;
			green = Math.floor( green );
			gval = green * _sys.GSHIFT;
			blue = rgb - rval - gval;
		}

		colors.rgb = rgb; // number signals all values are valid
		colors.r = red;
		colors.g = green;
		colors.b = blue;
	};
	
	// _sys.decodeColors ( fn, p1, p2, p3 )
	// Takes caller's function name, plus single RGB multiplex integer, integer triplet, RGB array or RGB object
	// Returns a color object or PS.ERROR
	// If .rgb = null, caller should use use r/g/b properties
	// If .rgb = PS.CURRENT/PS.DEFAULT, caller should use current/default colors
	// If .rgb is a number, r/g/b properties are precalculated

	// Private color return object
	// Avoids making a new object for every call

	var _decoded = {
		rgb : 0,
		r : null, g : null, b : null,
		str : ""
	};

	_sys.decodeColors = function ( fn, p1, p2, p3 )
	{
		var colors, type, result, rgb, len;

		colors = _decoded; // use private return object
		colors.rgb = 0;
		colors.r = null;
		colors.g = null;
		colors.b = null;
		colors.str = "";

		// [p1] determines interpretation

		type = _sys.typeOf( p1 );

		// If [p2] or [p3] is defined, check for a valid multiplex

		if ( ( p2 !== undefined ) || ( p3 !== undefined ) )
		{
			if ( ( type === "number" ) || ( type === "undefined" ) || ( p1 === PS.CURRENT ) || ( p1 === PS.DEFAULT ) )
			{
				result = _sys.validColors( fn, colors, p1, p2, p3 );
				if ( result === PS.ERROR )
				{
					return PS.ERROR;
				}
			}
			else
			{
				if ( type === "array" )
				{
					return _sys.error( fn + "Extraneous arguments after color array" );
				}
				if ( type === "object" )
				{
					return _sys.error( fn + "Extraneous arguments after color object" );
				}
				return _sys.error( fn + "red argument invalid" );
			}
		}

		// [p1] is only argument

		else if ( type === "number" )
		{
			_sys.extractRGB( colors, p1 ); // Assume a multiplex
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
				result = _sys.validColors( fn, colors, p1[ 0 ], p1[ 1 ], p1[ 2 ] );
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
			type = _sys.typeOf( rgb );
			if ( ( type === "undefined" ) || ( rgb === null ) )
			{
				result = _sys.validColors( fn, colors, p1.r, p1.g, p1.b );
				if ( result === PS.ERROR )
				{
					return PS.ERROR;
				}
			}
			else if ( type === "number" )
			{
				_sys.extractRGB( colors, rgb );
			}
			else if ( ( rgb === PS.CURRENT ) || ( rgb === PS.DEFAULT ) )
			{
				colors.rgb = rgb; // signal to use current or default color
			}
			else
			{
				return _sys.error( fn + ".rgb property invalid" );
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
			return _sys.error( fn + "color argument invalid" );
		}

		return colors;
	};

	return ps;
} ( PS ) );
