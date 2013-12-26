// Simple Paint for Perlenspiel 3.1
// Composed for the edification of students by Brian Moriarty
// Released under GLPL-3.0

// The following comment lines are for JSLint. Don't remove them!

/*jslint nomen: true, white: true */
/*global PS */

var PAINT = {

	// Constants

	WIDTH: 16, // width of grid
	HEIGHT: 17, // height of grid (one extra row for palette)
	PALETTE_ROW: 16, // row occupied by palette
	WHITE: 8, // x-position of white in palette
	ERASE_X: 15, // x-position of X in palette

	// the palette colors, scientifically chosen!

	COLORS: [
		0xFF0000, 0xFF8000, 0xFFFF00, 0x00C000, 0x00FFFF,
		0x4040FF, 0x8040FF, 0xFF00FF, 0xFFFFFF, 0xC0C0C0,
		0xA0A0A0, 0x808080, 0x606060, 0x404040, 0x000000
	],

	// Variables

	current: 8, // x-pos of current palette selection
	color: PS.COLOR_WHITE, // color of current palette selection
	underColor: PS.COLOR_WHITE, // color of bead under the brush
	dragging: false, // true if dragging brush
	prompt: false, // true if instructions displayed

	// Functions

	select : function ( x, y, data )
	{
		"use strict";

		// activate border if changing selection

		if ( x !== PAINT.current )
		{
			PS.border(PAINT.current, PAINT.HEIGHT - 1, 0); // turn off previous border
			PS.border( x, y, 2 );
			PAINT.current = x;
			PAINT.color = data; // set current color from color stored in bead data
			PS.audioPlay( "fx_click" );
		}
	},

// Clear the canvas

	reset : function ()
	{
		"use strict";
		var i;

		PAINT.dragging = false;
		PAINT.underColor = PS.COLOR_WHITE;
		for ( i = 0; i < PAINT.PALETTE_ROW; i += 1 )
		{
			PS.color( PS.ALL, i, PS.COLOR_WHITE );
		}
		PS.audioPlay( "fx_pop" );
	}
};

// PS.init( system, options )
// Initializes the game

PS.init = function( system, options ) {
	"use strict";
	var i, lastx, lasty, color;

	PS.gridSize( PAINT.WIDTH, PAINT.HEIGHT );
	PS.border( PS.ALL, PS.ALL, 0 ); // disable all borders

	// preload sounds

	PS.audioLoad( "fx_click" );
	PS.audioLoad( "fx_pop" );

	// Draw palette

	lastx = PAINT.WIDTH - 1;
	lasty = PAINT.PALETTE_ROW; // faster if saved in local var
	for ( i = 0; i < lastx; i += 1 )
	{
		color = PAINT.COLORS[ i ];
		PS.color( i, lasty, color ); // set visible color
		PS.data( i, lasty, color ); // also store color as bead data
		PS.exec( i, lasty, PAINT.select ); // call PAINT.select when clicked

		// set border color according to position

		if ( i < 12 )
		{
			color = 0x000000; // black for light colors
		}
		else
		{
			color = 0xC0C0C0; // light gray for dark colors
		}
		PS.borderColor( i, lasty, color );
	}

	// set up reset button

	PAINT.ERASE_X = lastx; // remember the x-position
	PS.glyphColor( lastx, lasty, PS.COLOR_BLACK );
	PS.glyph( lastx, lasty, "X" );
	PS.exec( lastx, lasty, PAINT.reset ); // call PAINT.Reset when clicked

	// start with white selected

	PS.border( PAINT.WHITE, PAINT.PALETTE_ROW, 2 );
	PAINT.current = PAINT.WHITE;
	PAINT.color = PS.COLOR_WHITE;

	PAINT.reset();

	PS.statusText( "Simple Paint" );
};

// PS.touch ( x, y, data, options )
// Called when the mouse button is clicked on a bead, or when a bead is touched

PS.touch = function( x, y, data, options ) {
	"use strict";

	if ( y < PAINT.PALETTE_ROW )
	{
		PAINT.dragging = true;
		PAINT.underColor = PAINT.color;
		PS.color( x, y, PAINT.color );
	}
};

// PS.release ( x, y, data, options )
// Called when the mouse button is released over a bead, or when a touch is lifted off a bead

PS.release = function( x, y, data, options ) {
	"use strict";

	PAINT.dragging = false;
};

// PS.enter ( x, y, button, data, options )
// Called when the mouse/touch enters a bead

PS.enter = function( x, y, data, options ) {
	"use strict";

	if ( y < PAINT.PALETTE_ROW )
	{
		PAINT.underColor = PS.color( x, y );
		PS.color( x, y, PAINT.color );
		if ( PAINT.dragging )
		{
			PAINT.underColor = PAINT.color;
		}
	}
	else
	{
		PAINT.dragging = false; // stop dragging if over palette
		if ( x === PAINT.ERASE_X )
		{
			PAINT.prompt = false;
			PS.statusText( "Click X to erase painting" );
		}
	}
};

// PS.exit ( x, y, data, options )
// Called when the mouse cursor/touch exits a bead

PS.exit = function( x, y, data, options ) {
	"use strict";

	// Show instructions when mouse is first moved

	if ( !PAINT.prompt )
	{
		PAINT.prompt = true;
		PS.statusText("Click to select colors, click/drag to paint");
	}

	if ( y < PAINT.PALETTE_ROW )
	{
		PS.color( x, y, PAINT.underColor );
	}
};

// These event calls aren't used by Simple Paint
// But they must exist or the engine will complain!

PS.exitGrid = function( options ) {
	"use strict";
};

PS.keyDown = function( key, shift, ctrl, options ) {
	"use strict";
};

PS.keyUp = function( key, shift, ctrl, options ) {
	"use strict";
};

PS.input = function( sensors, options ) {
	"use strict";
};

