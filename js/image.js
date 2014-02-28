// image.js
// The following comments are for JSLint

/*jslint nomen: true, white: true, vars: true */
/*global document, window, screen, console, Image, AQ */

PS = ( function ( ps )
{
	"use strict";

	var _sys = ps._sys = ps._sys || {}; // establish _sys

	var _imageCanvas; // canvas object for image extraction
	var _imageList; // list of images being loaded
	var _imageCnt; // counter for image ids

	_sys.image = {

		init : function ()
		{

		},

		// Validate an image object
		// Returns true if image structure is valid, else PS.ERROR

		valid : function ( fn, image )
		{
			var w, h, format, total, data, len, i, val;
	
			// Verify image properties
	
			if ( _sys.typeOf( image ) !== "object" )
			{
				return _sys.error( fn + "image argument not an object" );
			}
	
			w = image.width;
			if ( _sys.typeOf( w ) !== "number" )
			{
				return _sys.error( fn + "image.width not a number" );
			}
			w = Math.floor( w );
			if ( w < 1 )
			{
				return _sys.error( fn + "image.width < 1" );
			}
			image.width = w;
	
			h = image.height;
			if ( _sys.typeOf( h ) !== "number" )
			{
				return _sys.error( fn + "image.height not a number" );
			}
			h = Math.floor( h );
			if ( h < 1 )
			{
				return _sys.error( fn + "image.height < 1" );
			}
			image.height = h;
	
			format = image.pixelSize;
			if ( _sys.typeOf( format ) !== "number" )
			{
				return _sys.error( fn + "image.pixelSize not a number" );
			}
			format = Math.floor( format );
			if ( ( format < 1 ) && ( format > 4 ) )
			{
				return _sys.error( fn + "image.pixelSize is not 1, 2, 3 or 4" );
			}
			image.pixelSize = format;
	
			// verify data is expected length
	
			data = image.data;
			if ( _sys.typeOf( data ) !== "array" )
			{
				return _sys.error( fn + "image.data is not an array" );
			}
	
			len = data.length;
			total = w * h * format;
			if ( len !== total )
			{
				return _sys.error( fn + "image.data length invalid" );
			}
	
			// Quick check of data values
			// Would be nice if a previously validated image could be marked somehow ...
	
			for ( i = 0; i < len; i += 1 )
			{
				val = data[ i ];
				if ( _sys.typeOf( val ) !== "number" )
				{
					return _sys.error( fn + "image.data[" + i + "] not a number" );
				}
				if ( val < 0 )
				{
					return _sys.error( fn + "image.data[" + i + "] negative" );
				}
				if ( format < 3 )
				{
					if ( val > 0xFFFFFF )
					{
						return _sys.error( fn + "image.data[" + i + "] > 0xFFFFFF" );
					}
				}
				else if ( val > 255 )
				{
					return _sys.error( fn + "image.data[" + i + "] > 255" );
				}
			}
	
			return true;
		}
	};

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
			_sys.errorCatch( "[PS.imageLoad] .exec function failed [" + err.message + "]", err );
		}

		_sys.error( "[PS.imageLoad] Error loading " + image.src );
	}

	// Return an image table from an imageData file
	// Optional [format] determines pixel format (1, 2, 3, 4)

	function _imageExtract ( imageData, format )
	{
		var fn, w, h, ctx, srcImage, destImage, src, len, dest, i, j, r, g, b, a;

		fn = "[_imageExtract] ";

		// check validity of image structure

		w = imageData.width;
		if ( ( _sys.typeOf( w ) !== "number" ) || ( w < 1 ) )
		{
			return _sys.error( fn + "image width invalid" );
		}
		w = Math.floor( w );

		h = imageData.height;
		if ( ( _sys.typeOf( h ) !== "number" ) || ( h < 1 ) )
		{
			return _sys.error( fn + "image height invalid" );
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
			return _sys.errorCatch( fn + "image extraction failed @ 1 [" + e1.message + "]", e1 );
		}

		// fetch the source's image data

		try
		{
			srcImage = ctx.getImageData( 0, 0, w, h );
		}
		catch ( e2 )
		{
			return _sys.errorCatch( fn + "image extraction failed @ 2 [" + e2.message + "]", e2 );
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
				_sys.errorCatch( "[PS.imageLoad] .exec function failed [" + err.message + "]", err );
			}
		}
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

	// PUBLIC API

	ps.imageLoad = function ( filenameP, execP, formatP )
	{
		var fn, args, filename, exec, format, ext, image, id, type;

		fn = "[PS.imageLoad] ";

		args = arguments.length;
		if ( args < 2 )
		{
			return _sys.error( fn + "Missing argument(s)" );
		}
		if ( args > 3 )
		{
			return _sys.error( fn + "Too many argument(s)" );
		}

		// Prevent arg mutation

		filename = filenameP;
		exec = execP;
		format = formatP;

		// Validate filename

		if ( ( typeof filename !== "string" ) || ( filename.length < 1 ) )
		{
			return _sys.error( fn + "filename argument invalid" );
		}

		// check for a valid file extension

		ext = filename.substr( filename.lastIndexOf( '.' ) + 1 );
		ext = ext.toLowerCase();
		if ( ( ext !== "png" ) && ( ext !== "jpg" ) && ( ext !== "jpeg" ) && ( ext !== "bmp" ) )
		{
			return _sys.error( fn + "filename extension invalid" );
		}

		// Validate exec

		if ( typeof exec !== "function" )
		{
			return _sys.error( fn + "exec argument invalid" );
		}

		type = _sys.typeOf( format );
		if ( ( type === "undefined" ) || ( format === PS.DEFAULT ) )
		{
			format = 4;
		}
		else
		{
			if ( type !== "number" )
			{
				return _sys.error( fn + "format argument invalid" );
			}
			format = Math.floor( format );
			if ( ( format < 1 ) && ( format > 4 ) )
			{
				return _sys.error( fn + "format argument is not 1, 2, 3 or 4" );
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
			return _sys.errorCatch( fn + "Error loading " + filename + " [" + err.message + "]", err );
		}

		return id;
	};

	// Blit an image to the grid at [xpos, ypos]
	// Optional [region] specifies region of blit
	// Return true if any part of image was drawn, false if none of image was drawn, or PS.ERROR

	ps.imageBlit = function ( imageP, xposP, yposP, regionP )
	{
		var fn, args, xmax, ymax, image, xpos, ypos, region, w, h, format, data, type, top, left, width, height, plane,
			val, wsize, rowptr, ptr, drawx, drawy, y, x, r, g, b, a, rgb, rval, gval, i, bead, color, any;

		fn = "[PS.imageBlit] ";

		args = arguments.length;
		if ( args < 3 )
		{
			return _sys.error( fn + "Missing argument(s)" );
		}
		if ( args > 4 )
		{
			return _sys.error( fn + "Too many arguments" );
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

		type = _sys.typeOf( xpos );
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
			return _sys.error( fn + "xpos argument invalid" );
		}

		// Validate ypos

		type = _sys.typeOf( ypos );
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
			return _sys.error( fn + "ypos argument invalid" );
		}

		// If drawing is obviously offgrid, exit now

		if ( ( xpos >= xmax ) || ( ypos >= ymax ) || ( ( xpos + w ) < 1 ) || ( ( ypos + h ) < 1 ) )
		{
			return false;
		}

		// Validate region

		type = _sys.typeOf( region );
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
			return _sys.error( fn + "region argument invalid" );
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
		any = false;
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
				i = drawx + ( drawy * xmax ); // get index of bead
				bead = _beads[ i ];
				if ( bead.active )
				{
					any = true;

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

		if ( any )
		{
			_gridDraw();
		}
		return true;
	};

	// Create an image object from the grid
	// Optional [format] specifies region

	ps.imageCapture = function ( formatP, regionP )
	{
		var fn, args, format, region, type, w, h, data, top, left, width, height, total, output,
			right, bottom, id, cnt, x, y, i, bead, color;

		fn = "[PS.imageCapture] ";

		args = arguments.length;
		if ( args > 2 )
		{
			return _sys.error( fn + "Too many arguments" );
		}

		// Prevent arg mutation

		format = formatP;
		region = regionP;

		type = _sys.typeOf( format );
		if ( ( type === "undefined" ) || ( format === PS.DEFAULT ) )
		{
			format = 3;
		}
		else
		{
			if ( type !== "number" )
			{
				return _sys.error( fn + "format argument invalid" );
			}
			format = Math.floor( format );
			if ( ( format < 1 ) && ( format > 4 ) )
			{
				return _sys.error( fn + "format argument is not 1, 2, 3 or 4" );
			}
		}

		w = _grid.x;
		h = _grid.y;

		// Validate region

		type = _sys.typeOf( region );
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
			type = _sys.typeOf( left );
			if ( ( type === "undefined" ) || ( left === PS.DEFAULT ) )
			{
				left = 0;
			}
			else
			{
				if ( type !== "number" )
				{
					return _sys.error( fn + "region.left not a number" );
				}
				left = Math.floor( left );
				if ( left < 0 )
				{
					left = 0;
				}
				else if ( left >= w )
				{
					return _sys.error( fn + "region.left outside grid" );
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
					return _sys.error( fn + "region.top not a number" );
				}
				top = Math.floor( top );
				if ( top < 0 )
				{
					top = 0;
				}
				else if ( top >= h )
				{
					return _sys.error( fn + "region.top outside grid" );
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
					return _sys.error( fn + "region.width not a number" );
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
					return _sys.error( fn + "region.height not a number" );
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
			return _sys.error( fn + "region argument invalid" );
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
	};

	// Dump a Javascript text representation of an image to the debugger
	// Optional [coords] specify region of dump

	ps.imageDump = function ( imageP, regionP, formatP, linelenP, hexP )
	{
		var fn, args, image, region, format, linelen, hex, w, h, psize, data, type, top, left, width, height,
			total, str, wsize, pcnt, done, a, rowptr, ptr, y, x, r, g, b, rgb, rval, gval;

		fn = "[PS.imageDump] ";

		args = arguments.length;
		if ( args < 1 )
		{
			return _sys.error( fn + "Missing argument(s)" );
		}
		if ( args > 5 )
		{
			return _sys.error( fn + "Too many arguments" );
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

		type = _sys.typeOf( region );
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
					return _sys.error( fn + "region.left outside grid" );
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
					return _sys.error( fn + "region.top outside grid" );
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
		else
		{
			return _sys.error( fn + "region argument invalid" );
		}

		total = width * height;

		// Validate format

		type = _sys.typeOf( format );
		if ( ( type === "undefined" ) || ( format === PS.DEFAULT ) )
		{
			format = psize; // use format of source image by default
		}
		else
		{
			if ( type !== "number" )
			{
				return _sys.error( fn + "format argument invalid" );
			}
			format = Math.floor( format );
			if ( ( format < 1 ) || ( format > 4 ) )
			{
				return _sys.error( fn + "format argument is not 1, 2, 3 or 4" );
			}
		}

		// Validate linelen

		type = _sys.typeOf( linelen );
		if ( ( type === "undefined" ) || ( linelen === PS.DEFAULT ) )
		{
			linelen = width;
		}
		else
		{
			if ( type !== "number" )
			{
				return _sys.error( fn + "length argument invalid" );
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

		hex = _sys.isBoolean( hexP, PS.ERROR, true, true );
		if ( hex === PS.ERROR )
		{
			return _sys.error( fn + "hex argument invalid" );
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
	};

	return ps;
} ( PS ) );