// move.js for Perlenspiel 3.1

// The following comment lines are for JSLint. Don't remove them!

/*jslint nomen: true, white: true */
/*global PS */

// The GAME object holds all game-specific data and functions

var GAME = {

	// Constants

	WIDTH : 17, // width of grid
	HEIGHT : 17, // height of grid
	PCOLOR : PS.COLOR_BLACK, // player color
	PGLYPH : "X", // player glyph

	// Variables

	xmax : 0, // maximum x
	ymax : 0, // maximum y
	px : 8, // player x
	py : 8, // player y
	uColor : 0, // color under player
	uGlyph: 0, // glyph under player

	// Functions

	moveTo : function ( x, y )
	{
		PS.color( GAME.px, GAME.py, GAME.uColor ); // restore under color
//		PS.glyph( GAME.px, GAME.py, GAME.uGlyph ); // and under glyph

		GAME.px = x;
		GAME.py = y;
		GAME.uColor = PS.color( x, y );
//		GAME.uGlyph = PS.glyph( x, y );
		PS.color( x, y, GAME.PCOLOR );
//		PS.glyph( x, y, GAME.PGLYPH );
		PS.audioPlay( "fx_click" );
	}
};

PS.init = function( system, options ) {
	"use strict";
	var x, y, r, g, b;

	// Use PS.gridSize( x, y ) to set the grid to
	// the initial dimensions you want (32 x 32 maximum)
	// Do this FIRST to avoid problems!
	// Otherwise you will get the default 8x8 grid

	PS.gridSize( GAME.WIDTH, GAME.HEIGHT );

	GAME.xmax = GAME.WIDTH - 1; // establish maximum x
	GAME.ymax = GAME.HEIGHT - 1; // and y

	// Fill the grid with random pastel colors and lower-case letters

	for ( y = 0; y < GAME.HEIGHT; y += 1 )
	{
		for ( x = 0; x < GAME.WIDTH; x += 1 )
		{
			r = PS.random(128) + 127;
			g = PS.random(128) + 127;
			b = PS.random(128) + 127;
			PS.color( x, y, r, g, b );
///			PS.glyph( x, y, PS.random( 26 ) + 96 );
		}
	}

	GAME.uColor = PS.color( GAME.px, GAME.py ); // save initial under-color
//	GAME.uGlyph = PS.glyph( GAME.px, GAME.py ); // and under-glyph
	PS.color( GAME.px, GAME.py, GAME.PCOLOR ); // set initial color
//	PS.glyph( GAME.px, GAME.py, GAME.PGLYPH ); // and glyph


	PS.audioLoad( "fx_click", { lock : true } );
	// Add any other initialization code you need here
};

PS.keyDown = function( key, shift, ctrl, options ) {
	"use strict";
	var x, y;

	x = GAME.px;
	y = GAME.py;

	switch ( key )
	{
		case PS.KEY_ARROW_UP:
		case 87: // W
		case 119: // w
		{
			if ( y > 0 )
			{
				GAME.moveTo( x, y - 1 );
			}
			break;
		}
		case PS.KEY_ARROW_DOWN:
		case 83: // S
		case 115: // s
		{
			if ( y < GAME.ymax )
			{
				GAME.moveTo( x, y + 1 );
			}
			break;
		}
		case PS.KEY_ARROW_LEFT:
		case 65: // D
		case 97: // d
		{
			if ( x > 0 )
			{
				GAME.moveTo( x - 1, y );
			}
			break;
		}
		case PS.KEY_ARROW_RIGHT:
		case 68: // A
		case 100: // a
		{
			if ( x < GAME.xmax )
			{
				GAME.moveTo( x + 1, y );
			}
			break;
		}
		default:
		{
			break;
		}
	}
};

// These aren't used, but must be present

PS.touch = function( x, y, data, options ) {
	"use strict";
};

PS.release = function( x, y, data, options ) {
	"use strict";
};

PS.enter = function( x, y, data, options ) {
	"use strict";
};

PS.exit = function( x, y, data, options ) {
	"use strict";
};

PS.exitGrid = function( options ) {
	"use strict";
};

PS.keyUp = function( key, shift, ctrl, options ) {
	"use strict";
};

PS.input = function( sensors, options ) {
	"use strict";
};
