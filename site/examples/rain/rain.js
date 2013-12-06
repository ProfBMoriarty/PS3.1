// Simple Rain Toy for Perlenspiel 3
// Composed for the edification of students by Brian Moriarty
// Released under GLPL-3.0

// The following comment lines are for JSLint. Don't remove them!

/*jslint nomen: true, white: true */
/*global PS */

var RAIN = {

	// Constants

	GRID_WIDTH: 24, // width of grid
	GRID_HEIGHT: 24, // height of grid
	BOTTOM_ROW: 23, // last row of grid
	FRAME_RATE: 6,	// animation frame rate; 6/60ths = 10 fps
	BG_COLOR: 0x8080FF, // background color
	DROP_COLOR: 0x4040FF, // raindrop color

	// Variables
	// These arrays store the x and y positions of the active raindrops (initially empty)

	dropsX: [],
	dropsY: [],

	// Functions

	splash : function ( x, y )
	{
		"use strict";

		// Paint using background color

		PS.color( x, y, RAIN.BG_COLOR );

		// Play splash sound

		PS.audioPlay( "fx_drip2" );
	},

	// Called on every clock tick
	// Used to animate the raindrops

	tick : function ()
	{
		"use strict";
		var len, i, x, y;

		// The length of the RAIN.DropsX array is the current number of drops

		len = RAIN.dropsX.length; // number of drops

		// loop through each active raindrop

		i = 0;
		while ( i < len )
		{
			// get current position of raindrop

			x = RAIN.dropsX[i];
			y = RAIN.dropsY[i];

			// If bead is above last row, erase it and redraw one bead lower

			if ( y < RAIN.BOTTOM_ROW )
			{
				// erase the existing drop

				PS.color( x, y, RAIN.BG_COLOR );

				// add 1 to y position

				y += 1;

				// update its y position in the array

				RAIN.dropsY[i] = y;

				// Has drop reached the bottom row yet?

				if ( y < RAIN.BOTTOM_ROW ) // nope
				{
					// Repaint the drop one bead lower

					PS.color( x, y, RAIN.DROP_COLOR );
				}

				// Drop has reached bottom! Splash it

				else
				{
					RAIN.splash( x, y );
				}

				// point index to next drop

				i += 1;
			}

			// Bead is on last row

			else
			{
				// Remove this drop from x/y arrays

				RAIN.dropsX.splice( i, 1 );
				RAIN.dropsY.splice( i, 1 );

				// Arrays are now one element smaller, so update the array length variable
				// But leave the index variable [i] alone!
				// It's already pointing at the next drop

				len -= 1;
			}
		}
	}
};

// PS.init( system, options )
// Initializes the game

PS.init = function( system, options ) {
	"use strict";

	// Set up the grid

	PS.gridSize( RAIN.GRID_WIDTH, RAIN.GRID_HEIGHT );

	// Change background color

	PS.gridColor( RAIN.BG_COLOR );

	// Hide all bead borders

	PS.border( PS.ALL, PS.ALL, 0 );

	// Set all beads to background color

	PS.color( PS.ALL, PS.ALL, RAIN.BG_COLOR );

	// Add fader FX to bottom row
	// This makes the bead flash white when it "splashes"

	PS.fade( PS.ALL, RAIN.BOTTOM_ROW, 30, { rgb : PS.COLOR_WHITE } );

	// preload audio files

	PS.audioLoad( "fx_drip1" );
	PS.audioLoad( "fx_drip2" );

	// Set color and text of title

	PS.statusColor( PS.COLOR_WHITE );
	PS.statusText( "Simple Rain Toy" );

	// Start the animation timer

	PS.timerStart( RAIN.FRAME_RATE, RAIN.tick );
};

// PS.touch ( x, y, data, options )
// Called when the mouse button is clicked on a bead, or when a bead is touched

PS.touch = function( x, y, data, options ) {
	"use strict";

	// Add x & y position of raindrop to animation list

	RAIN.dropsX.push( x );
	RAIN.dropsY.push( y );

	// If drop is above bottom row, start a drop

	if ( y < RAIN.BOTTOM_ROW )
	{
		PS.color( x, y, RAIN.DROP_COLOR ); // set the color
		PS.audioPlay( "fx_drip1" ); // play drip sound
	}

	// Otherwise splash it immediately

	else
	{
		RAIN.splash( x, y );
	}
};

// These event calls aren't used by Simple Rain Toy
// But they must exist or the engine will complain!

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

PS.keyDown = function( key, shift, ctrl, options ) {
	"use strict";
};

PS.keyUp = function( key, shift, ctrl, options ) {
	"use strict";
};

PS.input = function( sensors, options ) {
	"use strict";
};

