// bead.js


PS = ( function ( ps )
{
	"use strict";

	var _sys = ps._sys = ps._sys || {}; // establish _sys

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

	_sys.bead = {

		anyDirty : false, // true if any bead is dirty

		// _sys.bead.makeDirty ()
		// Mark a bead as dirty

		makeDirty : function ( bead )
		{
			bead.dirty = true;
			_sys.bead.anyDirty = true;
		},

		// _sys.bead.calcColor ( bead, gridColor )
		// Calculates effective color of a bead against a background color
		// Returns values through [target] object
		// Calculates effective color of a bead against a background color
		// Returns values through [target] object
		// Modified by Mark Diehr

		calcColor : function ( bead, backColor, target )
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
		},

		// _sys.bead.touch( bead )
		// Call this when mouse is clicked on bead or when bead is touched
		// Returns PS.DONE or PS.ERROR

		touch : function ( bead )
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
						return _sys.errorCatch( "Bead " + bead.x + ", " + bead.y + " function failed [" + e1.message + "]", e1 );
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
						return _sys.errorCatch( "PS.touch() failed [" + e2.message + "]", e2 );
					}
				}

				if ( any )
				{
					_gridDraw();
				}
			}
			return PS.DONE;
		},

		// _sys.bead.release ( bead )
		// Call this when mouse button is released or touch is removed from bead
		// Returns PS.DONE or PS.ERROR

		release : function ( bead )
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
						return _sys.errorCatch( "PS.release() failed [" + err.message + "]", err );
					}
				}
			}
			return PS.DONE;
		},

		// _sys.bead.enter ( bead )
		// Call this when mouse/touch enters a bead
		// Returns PS.DONE or PS.ERROR

		enter : function ( bead )
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
						PS.enter( bead.x, bead.y, data, {} );
						_gridDraw();
					}
					catch ( err )
					{
						return _sys.errorCatch( "PS.enter() failed [" + err.message + "]", err );
					}
				}
			}
			return PS.DONE;
		},

		// _sys.bead.exit ( bead )
		// Call this when mouse/touch leaves a bead
		// Returns PS.DONE or PS.ERROR

		exit : function ( bead )
		{
			var data;

			if ( bead.active )
			{
				if ( PS.exit )
				{
					data = _getData( bead );
					try
					{
						PS.exit( bead.x, bead.y, data, {} );
						_gridDraw();
					}
					catch ( err )
					{
						return _sys.errorCatch( "PS.exit() failed [" + err.message + "]", err );
					}
				}
			}

			return PS.DONE;
		}
	};

	return ps;
} ( PS ) );

