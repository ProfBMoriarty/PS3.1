// splash.js for Perlenspiel 3.0

/*
Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
Perlenspiel is Copyright © 2009-13 Worcester Polytechnic Institute.
This file is part of Perlenspiel.

Perlenspiel is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Perlenspiel is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You may have received a copy of the GNU Lesser General Public License
along with Perlenspiel. If not, see <http://www.gnu.org/licenses/>.
*/

// The following comment lines are for JSLint. Don't remove them!

/*jslint nomen: true, white: true */
/*global PS */

// The variable G is used to encapsulate all game-specific variables and functions

var G = {

	// CONSTANTS
	// Constant names are all upper-case to make them easy to distinguish

	FRAME_RATE: 20, // seems about right
	BG_COLOR: 0x404040, // background color (dark gray)
	TEXT_COLOR : 0xFFFFFF, // final status text color

	// The official Perlenspiel logo colors!

	COLOR_ORANGE: 0xF4782B,
	COLOR_BLUE: 0x6A98BA,
	COLOR_GREEN: 0xA1C93A,
	COLOR_YELLOW: 0xEFEB42,
	COLOR_PURPLE: 0x87578E,

	// The "score" played by the game is stored in an array
	// Each note in the score contains the name of the note to be played,
	// together with x/y position and color of the associated bead
	// Note that only some entries in the array contain data
	// The null entries indicate an empty beat in the score

	score : [
		null, // Beat 0

		// Beat 1
		{
			note: "l_hchord_d4",
			x: 0, y: 6,
			color: 0x6A98BA
		},

		null, // Beat 2

		// Beat 3
		{
			note: "l_hchord_a4",
			x: 1, y: 1,
			color: 0xEFEB42
		},

		null, // Beat 4

		// Beat 5
		{
			note: "l_hchord_f4",
			x: 2, y: 3,
			color: 0xF4782B
		},

		null, // Beat 6

		// Beat 7
		{
			note: "l_hchord_d4",
			x: 3, y: 6,
			color: 0x6A98BA
		},

		null, // Beat 8

		// Beat 9
		{
			note: "l_hchord_db4",
			x: 4, y: 7,
			color: 0x87578E
		},

		null, // Beat 10

		// Beat 11
		{
			note: "hchord_d4",
			x: 5, y: 6,
			color: 0x6A98BA
		},

		// Beat 12
		{
			note: "hchord_e4",
			x: 6, y: 4,
			color: 0xA1C93A
		},

		// Beat 13
		{
			note: "l_hchord_f4",
			x: 7, y: 3,
			color: 0xF4782B
		}
	],

	// VARIABLES
	// Variable names are lower case with intercaps

	timerID : "", // timer ID
	tick: 0, // the metronome
	loadCnt : 0, // counts loaded files
	delay: 2, // startup delay

	// FUNCTIONS
	// Function names are lower case with intercaps

	// Audio .onLoad function
	// This gets called when a sound is done loading

	loader : function ()
	{
		"use strict";

		// Count how many audio files have been loaded
		// Start timer when eighth (and final) file is ready

		G.loadCnt += 1;
		if ( G.loadCnt >= 8 )
		{
			G.timerID = PS.timerStart( G.FRAME_RATE, G.timer );
		}
	},

	// Timer function
	// Plays the notes in G.score array

	timer : function()
	{
		"use strict";
		var beat;
		
		// Delay before starting
		// Lets the browser stabilize

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

		if ( G.tick >= G.score.length ) // played last note?
		{		
			PS.statusText( "P   E   R   L   E   N   S   P   I   E   L" );
			PS.statusFade( 120 ); // set up 2-second fade-up
			PS.statusColor( G.TEXT_COLOR ); // color change starts the fade-up
			PS.timerStop( G.timerID ); // stop the timer
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

	// Preload the harpsichord notes, saving the buffer ids for later playback

	len = G.score.length;
	for ( i = 0; i < len; i += 1 )
	{
		beat = G.score[i];
		if ( beat ) // ignore empty array entries
		{			
			PS.fade( beat.x, beat.y, 60 ); // set 1 sec bead fade
			PS.data( beat.x, beat.y, beat.note ); // save note in bead's data for later playback
			result = PS.audioLoad( beat.note, { lock : true, onLoad : G.loader } );
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

	// If this bead's data contains a note string, play the note
	
	if ( typeof data === "string" )
	{
		PS.audioPlay( data );
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
