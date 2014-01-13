// splash.js for Perlenspiel 3.1
// Composed for the edification of students by Brian Moriarty
// Released under GLPL-3.0

// The following comment lines are for JSLint. Don't remove them!

/*jslint nomen: true, white: true */
/*global PS */

// The official Perlenspiel logo colors!
// These are in RGB multiplex format (see documentation)
// They are defined globally so that the following code can refer to them
// There are tasteful methods for getting around this, beyond the scope of this simple example

var LOGO_COLOR_ORANGE = 0xF4782B;
var LOGO_COLOR_BLUE = 0x6A98BA;
var LOGO_COLOR_GREEN = 0xA1C93A;
var LOGO_COLOR_YELLOW = 0xEFEB42;
var LOGO_COLOR_PURPLE = 0x87578E;

// The global variable G is used to encapsulate most game-specific variables and functions
// This strategy helps prevent possible clashes with other scripts

var G = {

	// CONSTANTS
	// Constant names are all upper-case to make them easy to distinguish

	FRAME_RATE: 20, // seems about right
	BG_COLOR: 0x404040, // background color (dark gray)
	TEXT_COLOR : 0xFFFFFF, // final status text color

	// The "score" played by the game is stored in this array.
	// Each note in the score contains the name of the note to be played,
	// together with the x/y position and color of the associated bead.
	// Note that only some entries in the array contain data!
	// The null entries indicate an empty beat in the score.

	score : [
		null, // Beat 0

		// Beat 1
		{
			note: "l_hchord_d4",
			x: 0, y: 6,
			color: LOGO_COLOR_BLUE
		},

		null, // Beat 2

		// Beat 3
		{
			note: "l_hchord_a4",
			x: 1, y: 1,
			color: LOGO_COLOR_YELLOW
		},

		null, // Beat 4

		// Beat 5
		{
			note: "l_hchord_f4",
			x: 2, y: 3,
			color: LOGO_COLOR_ORANGE
		},

		null, // Beat 6

		// Beat 7
		{
			note: "l_hchord_d4",
			x: 3, y: 6,
			color: LOGO_COLOR_BLUE
		},

		null, // Beat 8

		// Beat 9
		{
			note: "l_hchord_db4",
			x: 4, y: 7,
			color: LOGO_COLOR_PURPLE
		},

		null, // Beat 10

		// Beat 11
		{
			note: "hchord_d4",
			x: 5, y: 6,
			color: LOGO_COLOR_BLUE
		},

		// Beat 12
		{
			note: "hchord_e4",
			x: 6, y: 4,
			color: LOGO_COLOR_GREEN
		},

		// Beat 13
		{
			note: "l_hchord_f4",
			x: 7, y: 3,
			color: LOGO_COLOR_ORANGE
		}
	],

	// VARIABLES
	// Variable names are lower-case with camelCaps

	timerID : "", // timer ID, saved so that timer can be stopped when no longer needed
	tick: 0, // the metronome, a number to keep track of where we are in the score
	loadCnt : 0, // counts loaded files
	delay: 2, // startup delay
	done : false, // true when playback is done

	// FUNCTIONS
	// Function names are lower case with camelCaps

	// Timer function
	// Not started until all audio files are loaded
	// Called once every G.FRAME_RATE ticks (= 20, 1/3 second)
	// Sequentially plays the notes in the G.score array

	timer : function() {
		"use strict";
		var beat, len, i;

		// A slight time delay before starting
		// This lets the browser stabilize

		if ( G.delay > 0 )
		{
			G.delay -= 1;
			return;
		}

		// Get the next beat in G.score array

		beat = G.score[ G.tick ];
		if ( beat ) // ignore empty array entries
		{
			PS.audioPlay( beat.note ); // play the note
			PS.color( beat.x, beat.y, beat.color ); // change the bead color
		}

		G.tick += 1; // point to next beat

		// Show Perlenspiel banner when melody is done

		len = G.score.length;
		if ( G.tick >= len ) // played the last note?
		{
			PS.timerStop( G.timerID ); // stop this timer
			PS.statusText( "P   E   R   L   E   N   S   P   I   E   L" ); // with stately spacing
			PS.statusFade( 120 ); // set up 2-second fade-up
			PS.statusColor( G.TEXT_COLOR ); // color change starts the fade-up

			// Set up beads for white flash when touched

			for ( i = 0; i < len; i += 1 )
			{
				beat = G.score[ i ];
				if ( beat ) // ignore empty score entries
				{
					PS.fade( beat.x, beat.y, 60, { rgb : PS.COLOR_WHITE } ); // set 1 sec white flash
				}
			}

			G.done = true; // finished! this flag allows beads to be touched and played
		}
	},

	// Audio .onLoad function
	// This gets called each time a sound is done loading
	// Here, it's used to determine when all eight files are ready

	loader : function ( result ) {
		"use strict";

		// Count how many audio files have been loaded
		// Start timer when eighth (and final) file is ready

		G.loadCnt += 1;
		if ( G.loadCnt >= 8 )
		{
			G.timerID = PS.timerStart( G.FRAME_RATE, G.timer );
		}
	}
};

// PS.init( gestalt )
// Initializes the game
// This function normally includes a call to PS.gridSize (x, y)
// where x and y are the desired initial dimensions of the grid
// gestalt = a Javascript object containing engine and platform information; see documentation for details

PS.init = function( system, options ) {
	"use strict";
	var len, i, beat, result;

	PS.gridSize( 8, 9 ); // set up an 8 x 9 grid
	PS.border( PS.ALL, PS.ALL, 0 ); // hide all bead borders
	PS.gridColor( G.BG_COLOR ); // set background color to dark gray
	PS.color( PS.ALL, PS.ALL, G.BG_COLOR ); // set all beads to background color
	PS.statusColor( G.BG_COLOR ); // set status text color to background color, too

	// Preload the harpsichord notes, save beats in bead data

	len = G.score.length;
	for ( i = 0; i < len; i += 1 )
	{
		beat = G.score[i];
		if ( beat ) // ignore empty array entries
		{
			// Save the beat object in bead's private data for later playback

			PS.data( beat.x, beat.y, beat );

			// Set up 1 sec bead fade-in as notes appear

			PS.fade( beat.x, beat.y, 60 );

			// Load and lock the audio for this beat
			// Specify an .onLoad function for file counting

			result = PS.audioLoad( beat.note, {
				lock : true,
				onLoad : G.loader
			} );
			if ( result === PS.ERROR )
			{
				break; // abort on load error
			}
		}
	}
};

// PS.touch ( x, y, data, options )
// Called when a bead is clicked or touched
// It doesn't have to do anything
// x = the x-position of the bead on the grid
// y = the y-position of the bead on the grid
// data = the data value associated with this bead, 0 if none has been set
// options = a Javascript object with optional parameters; see documentation for details

PS.touch = function( x, y, data, options ) {
	"use strict";

	if ( typeof data === "object" ) // only note beads will have an object in their private data
	{
		if ( G.done ) // only play if melody is done
		{
			PS.color( x, y, data.color ); // flashes current color using white fade
			PS.audioPlay( data.note ); // replays note
		}
	}
};

// The other Perlenspiel event functions aren't used in this game
// But they must be included to avoid a warning message on startup

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
