// util.js
// The following comments are for JSLint

/*jslint nomen: true, white: true, vars: true */
/*global document, window, screen, console, Image, AQ */

PS = ( function ( ps )
{
	"use strict";

	var _sys = ps._sys = ps._sys || {}; // establish _sys

	// _sys.typeOf ( val )
	// Improved typeof by Doug Crockford, with NaN detection by me
	// Returns value type string

	_sys.typeOf = function ( value )
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
	};

	// _sys.copy ( src, dest )
	// src : object
	// dest : object
	// Recursively copy all properties of [src] into [dest]
	// Does NOT copy arrays!

	_sys.copy =  function ( src, dest )
	{
		var prop, item, obj, type;

		for ( prop in src )
		{
			if ( src.hasOwnProperty( prop ) )
			{
				item = src[ prop ];

				// Check type of item
				// If property is an object, recurse

				type = _sys.typeOf( item );
				if ( type === "object" )
				{
					obj = {};
					_sys.copy( item, obj );
					item = obj;
				}
				dest[ prop ] = item;
			}
		}
	};

	// _sys.endEvent( event )
	// Properly terminates a DOM event

	_sys.endEvent = function ( event )
	{
		if ( event.stopPropagation )
		{
			event.stopPropagation();
		}
		else
		{
			event.cancelBubble = true;
		}

		event.returnValue = false;
		return false;
	};

	// _isBoolean ( val )
	// Evaluates [val] for a valid boolean: true, false, null, numeric, PS.CURRENT, PS.DEFAULT or undefined
	// [currentVal] is PS.CURRENT value
	// [defaultVal] is PS.DEFAULT value
	// [undefinedVal] is undefined value
	// Returns true, false or PS.ERROR

	_sys.isBoolean = function ( valP, currentVal, defaultVal, undefinedVal )
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
	};

	return ps;
} ( PS ) );
