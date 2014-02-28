// sprite.js
// The following comments are for JSLint

/*jslint nomen: true, white: true, vars: true */
/*global document, window, screen, console, Image, AQ */

PS = ( function ( ps )
{
	"use strict";

	var _sys = ps._sys = ps._sys || {}; // establish _sys

	var _sprites; // master sprite list
	var _spriteCnt; // counter for sprite ids

	_sys.sprite = {
		init : function ()
		{
			_sprites = [];
			_spriteCnt = 0;
		}
	};

	// PRIVATE METHODS

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
			return _sys.error( fn + "sprite argument invalid" );
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

		return _sys.error( fn + "sprite id '" + sprite + "' does not exist" );
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
		var width, height, xmax, ymax, left, top, right, bottom, srcLeft, srcTop, scolor,
			x, y, bead, i, bcolor, data, ptr, r, g, b, a;

		width = s.width;
		height = s.height;
		if ( ( width < 1 ) || ( height < 1 ) )
		{
			return;
		}

		// Calc actual left/width

		xmax = _grid.x;
		srcLeft = 0;
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
			srcLeft = s.width - width;
		}
		if ( ( left + width ) > xmax )
		{
			width = xmax - left;
		}
		right = left + width;

		// Calc actual top/height

		ymax = _grid.y;
		srcTop = 0;
		top = s.y - s.ay;
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
			srcTop = s.height - height;
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
			for ( y = top; y < bottom; y += 1 )
			{
				ptr = ( ( srcTop * s.width ) + srcLeft ) * 4;
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
						bcolor.rgb = ( r * _RSHIFT ) + ( g * _GSHIFT ) + b;
						bcolor.r = r;
						bcolor.g = g;
						bcolor.b = b;
						bcolor.a = a;
						_recolor( bead );
					}
					ptr += 4;
				}
				srcTop += 1;
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
							_sys.errorCatch( fn + id + " collide function failed [" + e1.message + "]", e1 );
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
							_sys.errorCatch( fn + id2 + " collide function failed [" + e2.message + "]", e2 );
							return;
						}
					}
				}
			}
		}
	}

	// PUBLIC API

	// PS.spriteSolid( image, region )
	// Create a solid sprite of specified dimensions

	ps.spriteSolid = function ( widthP, heightP )
	{
		var fn, args, width, height, s;

		fn = "[PS.spriteSolid] ";

		args = arguments.length;
		if ( args < 2 )
		{
			return _sys.error( fn + "Missing argument(s)" );
		}
		if ( args > 2 )
		{
			return _sys.error( fn + "Too many argument(s)" );
		}

		// Prevent arg mutation

		width = widthP;
		height = heightP;

		// Check width

		if ( width === PS.DEFAULT )
		{
			width = 1;
		}
		else if ( _sys.typeOf( width ) === "number" )
		{
			width = Math.floor( width );
			if ( width < 1 )
			{
				width = 1;
			}
		}
		else
		{
			return _sys.error( fn + "width argument invalid" );
		}

		// Check height

		if ( height === PS.DEFAULT )
		{
			height = 1;
		}
		else if ( _sys.typeOf( height ) === "number" )
		{
			height = Math.floor( height );
			if ( height < 1 )
			{
				height = 1;
			}
		}
		else
		{
			return _sys.error( fn + "height argument invalid" );
		}

		s = _newSprite();
		s.width = width;
		s.height = height;
		s.color = { rgb : 0, r : 0, g : 0, b : 0, a : 255 };

		return s.id;
	};

	// PS.spriteSolidColor ( sprite, color )
	// Sets color of a solid sprite

	ps.spriteSolidColor = function ( sprite, p1, p2, p3 )
	{
		var fn, args, s, colors, current, rgb, r, g, b;

		fn = "[PS.spriteSolidColor] ";

		args = arguments.length;
		if ( args < 1 )
		{
			return _sys.error( fn + "Missing argument(s)" );
		}
		if ( args > 4 )
		{
			return _sys.error( fn + "Too many argument(s)" );
		}

		s = _getSprite( sprite, fn );
		if ( s === PS.ERROR )
		{
			return PS.ERROR;
		}

		current = s.color;
		if ( !current )
		{
			return _sys.error( fn + "Cannot set color of image sprite " + s.id );
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
					_gridDraw();
				}
			}
		}

		return current.rgb;
	};

	// PS.spriteSolidAlpha ( sprite, alpha )
	// Sets alpha of a solid sprite

	ps.spriteSolidAlpha = function ( spriteP, alphaP )
	{
		var fn, args, sprite, alpha, s, current, type;

		fn = "[PS.spriteSolidAlpha] ";

		args = arguments.length;
		if ( args < 1 )
		{
			return _sys.error( fn + "Missing argument(s)" );
		}
		if ( args > 2 )
		{
			return _sys.error( fn + "Too many argument(s)" );
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
			return _sys.error( fn + "Cannot set alpha of image sprite " + s.id );
		}

		type = _sys.typeOf( alpha );
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
				return _sys.error( fn + "alpha argument invalid" );
			}

			if ( current.a !== alpha )
			{
				current.a = alpha;
				if ( s.visible && s.placed )
				{
					_drawSprite( s );
					_gridDraw();
				}
			}
		}

		return current.a;
	};

	// PS.spriteImage( image, region )
	// Create a sprite from an image with optional subregion
	// Makes a private format 4 reference image

	ps.spriteImage = function ( image, region )
	{
		var fn, args, w, h, format, data, type, top, left, width, height, ndata, wsize, rowptr, ptr, x, y, i, rgb, r, g, b, a, rval, gval, s;

		fn = "[PS.spriteImage] ";
		args = arguments.length;

		if ( args < 1 )
		{
			return _sys.error( fn + "Missing argument(s)" );
		}
		if ( args > 2 )
		{
			return _sys.error( fn + "Too many argument(s)" );
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

		type = _sys.typeOf( region );
		if ( ( type !== "undefined" ) && ( region !== PS.DEFAULT ) )
		{
			if ( type !== "object" )
			{
				return _sys.error( fn + "region argument invalid" );
			}

			// Check region.left

			left = region.left;
			type = _sys.typeOf( left );
			if ( ( type === "undefined" ) || ( left === PS.DEFAULT ) )
			{
				left = 0;
			}
			else
			{
				if ( type !== "number" )
				{
					return _sys.error( fn + "region.left invalid" );
				}
				left = Math.floor( left );
				if ( left < 0 )
				{
					left = 0;
				}
				else if ( left >= w )
				{
					return _sys.error( fn + "region.left outside image" );
				}
			}

			// check region.top

			top = region.top;
			type = _sys.typeOf( top );
			if ( ( type === "undefined" ) || ( top === PS.DEFAULT ) )
			{
				top = 0;
			}
			else
			{
				if ( type !== "number" )
				{
					return _sys.error( fn + "region.top invalid" );
				}
				top = Math.floor( top );
				if ( top < 0 )
				{
					top = 0;
				}
				else if ( top >= h )
				{
					return _sys.error( fn + "region.top outside image" );
				}
			}

			// check region.width

			width = region.width;
			type = _sys.typeOf( width );
			if ( ( type === "undefined" ) || ( width === PS.DEFAULT ) )
			{
				width = w - left;
			}
			else
			{
				if ( type !== "number" )
				{
					return _sys.error( fn + "region.width invalid" );
				}
				width = Math.floor( width );
				if ( ( width < 1 ) || ( ( left + width ) > w ) )
				{
					width = w - left;
				}
			}

			// check region.height

			height = region.height;
			type = _sys.typeOf( height );
			if ( ( type === "undefined" ) || ( height === PS.DEFAULT ) )
			{
				height = h - top;
			}
			else
			{
				if ( type !== "number" )
				{
					return _sys.error( fn + "region.height invalid" );
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
	};

	// PS.spriteShow( sprite, show )
	// Toggles visibility of a sprite

	ps.spriteShow = function ( spriteP, showP )
	{
		var fn, args, sprite, show, s;

		fn = "[PS.spriteShow] ";

		args = arguments.length;
		if ( args < 1 )
		{
			return _sys.error( fn + "Missing argument(s)" );
		}
		if ( args > 2 )
		{
			return _sys.error( fn + "Too many argument(s)" );
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
			return _sys.error( fn + "show argument invalid" );
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
					_gridDraw();
				}
			}
		}

		return s.visible;
	};

	// PS.spriteAxis( sprite, x, y )
	// Sets/inspects positional axis of sprite

	ps.spriteAxis = function ( spriteP, xP, yP )
	{
		var fn, args, sprite, x, y, s, type;

		fn = "[PS.spriteAxis] ";

		args = arguments.length;
		if ( args < 1 )
		{
			return _sys.error( fn + "Missing argument(s)" );
		}
		if ( args > 3 )
		{
			return _sys.error( fn + "Too many argument(s)" );
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

		type = _sys.typeOf( x );
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
			return _sys.error( fn + "x argument invalid" );
		}

		// Validate y

		type = _sys.typeOf( y );
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
			return _sys.error( fn + "y argument invalid" );
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
				_gridDraw();
			}
		}

		return { x : s.ax, y : s.ay };
	};

	// PS.spritePlane( sprite, plane )
	// Sets/inspects sprite plane

	ps.spritePlane = function ( spriteP, planeP )
	{
		var fn, args, sprite, plane, s, type;

		fn = "[PS.spritePlane] ";

		args = arguments.length;
		if ( args < 1 )
		{
			return _sys.error( fn + "Missing argument(s)" );
		}
		if ( args > 2 )
		{
			return _sys.error( fn + "Too many arguments" );
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

		type = _sys.typeOf( plane );
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
				return _sys.error( fn + "plane argument invalid" );
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
					_gridDraw();
				}
			}
		}

		// Return default if not set yet

		if ( s.plane < 0 )
		{
			return 0;
		}

		return s.plane;
	};

	// PS.spriteMove ( sprite, x, y )
	// Erases sprite at previous location (if any)
	// Redraws at x/y

	ps.spriteMove = function ( spriteP, xP, yP )
	{
		var fn, args, sprite, x, y, s, type, h_left, h_top, h_width, h_height, v_left, v_top, v_width, v_height, any;

		fn = "[PS.spriteMove] ";

		args = arguments.length;
		if ( args < 1 )
		{
			return _sys.error( fn + "Missing argument(s)" );
		}
		if ( args > 3 )
		{
			return _sys.error( fn + "Too many argument(s)" );
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

		type = _sys.typeOf( x );
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
			return _sys.error( fn + "x argument invalid" );
		}

		// Validate y

		type = _sys.typeOf( y );
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
			return _sys.error( fn + "y argument invalid" );
		}

		// Either coordinate changing?

		if ( !s.placed || ( x !== s.x ) || ( y !== s.y ) )
		{
			any = false;

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
					any = true;
					_eraseSprite( s );
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
						any = true;
						_eraseSprite( s );
					}

					// Which rects need erasing?

					else if ( v_height < 1 ) // not moving vertically
					{
						any = true;
						_eraseSprite( s, h_left, h_top, h_width, h_height );
					}
					else if ( v_width < 1 ) // not moving horizontally
					{
						any = true;
						_eraseSprite( s, v_left, v_top, v_width, v_height );
					}
					else // Both must be erased
					{
						any = true;
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
				any = true;
				_drawSprite( s );
				_collisionCheck( s, sprite );
			}

			if ( any )
			{
				_gridDraw();
			}
		}

		return { x : s.x, y : s.y };
	};

	// PS.spriteCollide( sprite, exec )
	// Sets/inspects collision function

	ps.spriteCollide = function ( sprite, execP )
	{
		var fn, args, s, exec, type;

		fn = "[PS.spriteCollide] ";

		args = arguments.length;
		if ( args < 1 )
		{
			return _sys.error( fn + "Missing argument(s)" );
		}
		if ( args > 2 )
		{
			return _sys.error( fn + "Too many arguments" );
		}

		s = _getSprite( sprite, fn );
		if ( s === PS.ERROR )
		{
			return PS.ERROR;
		}

		exec = execP; // avoid arg mutation
		type = _sys.typeOf( exec );
		if ( ( type !== "undefined" ) && ( exec !== PS.CURRENT ) )
		{
			if ( exec === PS.DEFAULT )
			{
				exec = null;
			}
			else if ( type !== "function" )
			{
				return _sys.error( fn + "exec argument not a function" );
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
	};

	// PS.spriteDelete( sprite)
	// Deletes a sprite

	ps.spriteDelete = function ( sprite )
	{
		var fn, args, len, i, s;

		fn = "[PS.spriteDelete] ";

		args = arguments.length;
		if ( args < 1 )
		{
			return _sys.error( fn + "Missing argument" );
		}
		if ( args > 1 )
		{
			return _sys.error( fn + "Too many arguments" );
		}

		if ( ( typeof sprite !== "string" ) || ( sprite.length < 1 ) )
		{
			return _sys.error( fn + "sprite argument invalid" );
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
				_gridDraw();
				return PS.DONE;
			}
		}

		return _sys.error( fn + "sprite id '" + sprite + "' not found" );
	};

	return ps;
} ( PS ) );
