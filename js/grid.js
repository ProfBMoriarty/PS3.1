// grid.js
// The following comments are for JSLint

/*jslint nomen: true, white: true, vars: true */
/*global document, window, screen, console, Image, AQ */

PS = ( function ( ps )
{
	"use strict";

	var _sys = ps._sys = ps._sys || {}; // establish _sys

	// DOM EVENT SUPPORT

	var _CLEAR = -1; // flag for not touching or not over a bead
	var _currentFinger; // index of finger touching screen
	var _underBead; // bead currently under finger
	var _overGrid; // true when cursor/finger is over the grid
	var _lastBead = -1; // index of last bead used

	// Draw all dirty beads

	function _gridDraw ()
	{
		var len, i, bead;

		if ( _sys.bead.anyDirty )
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
			_sys.bead.anyDirty = false;
		}
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
				PS.exitGrid( {} );
				_gridDraw();
			}
			catch ( err )
			{
				return _sys.errorCatch( "PS.exitGrid() failed [" + err.message + "]", err );
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

		return _endEvent( event );
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

		return _endEvent( event );
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

		return _endEvent( event );
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

		return _endEvent( event );
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

		return _endEvent( event );
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
				break;
			}
		}

		return _endEvent( event );
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
				break;
			}
		}

		return _endEvent( event );
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
						_sys.errorCatch( fn + "PS.keyDown failed [" + err.message + "]", err );
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
							_sys.errorCatch( fn + "PS.keyDown failed [" + err2.message + "]", err2 );
						}
					}
				}
			}

			if ( any ) // redraw grid if any keys processed
			{
				_gridDraw();
			}
		}

		return _endEvent( event );
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
					_sys.errorCatch( fn + "PS.keyUp failed [" + err.message + "]", err );
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
							_sys.errorCatch( fn + "PS.keyDown failed [" + err2.message + "]", err2 );
						}
					}
				}
			}

			if ( any ) // redraw grid if any keys processed
			{
				_gridDraw();
			}
		}

		return _endEvent( event );
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
				_sys.errorCatch( "PS.input() failed [" + err.message + "]", err );
			}
		}

		return _endEvent( event );
	}

	function _gridActivate ()
	{
		var grid;

		grid = _grid.canvas;
		grid.style.display = "block";

		grid.addEventListener( "mousedown", _mouseDown, false );
		grid.addEventListener( "mouseup", _mouseUp, false );
		grid.addEventListener( "mousemove", _mouseMove, false );
		grid.addEventListener( "mouseout", _gridOut, false );

		document.addEventListener( "keydown", _keyDown, false );
		document.addEventListener( "keyup", _keyUp, false );

		window.addEventListener( "DOMMouseScroll", _wheel, false ); // for Firefox
		window.addEventListener( "mousewheel", _wheel, false ); // for others

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
	}

	function _gridDeactivate ()
	{
		var grid;

		grid = _grid.canvas;
		grid.style.display = "none";

		grid.removeEventListener( "mousedown", _mouseDown, false );
		grid.removeEventListener( "mouseup", _mouseUp, false );
		grid.removeEventListener( "mousemove", _mouseMove, false );
		grid.removeEventListener( "mouseout", _gridOut, false );

		document.removeEventListener( "keydown", _keyDown, false );
		document.removeEventListener( "keyup", _keyUp, false );

		window.removeEventListener( "DOMMouseScroll", _wheel, false ); // for Firefox
		window.removeEventListener( "mousewheel", _wheel, false ); // for others

		if ( _touchScreen )
		{
			document.removeEventListener( "touchmove", _touchMove, false );
			document.removeEventListener( "touchstart", _touchStart, false );
			document.removeEventListener( "touchend", _touchEnd, false );
			document.removeEventListener( "touchcancel", _touchEnd, false );
		}
	}

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
				colors.r = r = _DEFAULTS.grid.color.r;
			}

			g = colors.g;
			if ( g === PS.CURRENT )
			{
				colors.g = g = current.g;
			}
			else if ( g === PS.DEFAULT )
			{
				colors.g = g = _DEFAULTS.grid.color.g;
			}

			b = colors.b;
			if ( b === PS.CURRENT )
			{
				colors.b = b = current.b;
			}
			else if ( b === PS.DEFAULT )
			{
				colors.b = b = _DEFAULTS.grid.color.b;
			}

			colors.rgb = (r * _RSHIFT) + (g * _GSHIFT) + b;
		}
		else if ( rgb === PS.DEFAULT )
		{
			_copy( _DEFAULTS.grid.color, colors );
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

	_sys.grid = {

		// _sys.grid.drawBead ( bead, borderColor, beadColor, glyphColor, gridColor )
		// Draw bead with specified colors

		drawBead : function ( bead, borderColor, beadColor, glyphColor, gridColor )
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
	}

	return ps;
} ( PS ) );
