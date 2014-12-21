// move.js for Perlenspiel 3.1

// The following comment lines are for JSLint. Don't remove them!

/*jslint nomen: true, white: true */
/*global PS */

// The GAME object holds all game-specific data and functions

var GAME = {
	// Constants
	WIDTH : 12, // width of grid
	HEIGHT : 2 // height of grid
};

PS.init = function( system, options ) {
	"use strict";
	var x, y, r, g, b;

	// Use PS.gridSize( x, y ) to set the grid to
	// the initial dimensions you want (32 x 32 maximum)
	// Do this FIRST to avoid problems!
	// Otherwise you will get the default 8x8 grid

	PS.gridSize( GAME.WIDTH, GAME.HEIGHT );

	PS.timerStart(1, tick);
	tick();
};

function tick() {
	var d = PS.date();
	var dateString = d.dayName+", "+d.monthName+" "+d.date+", "+d.hours+":"+d.minutes+":"+d.seconds+" - "+d.year;
	PS.statusText(dateString);
	PS.debugClear();
	PS.debug(PS.elapsed().toString() + "ms\n");
}

PS.keyDown = function( key, shift, ctrl, options ) {
	"use strict";
};

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
