// move.js for Perlenspiel 3.1

// The following comment lines are for JSLint. Don't remove them!

/*jslint nomen: true, white: true */
/*global PS */

// The GAME object holds all game-specific data and functions

var GAME = {
	// Constants
	WIDTH : 31,
	HEIGHT : 31,
	CENTER : {x:15, y:15},
	BGCOLOR : 0xEEEEEE,
	// Variables
	hands : []
};

PS.init = function( system, options ) {
	"use strict";
	var x, y, r, g, b;

	// Use PS.gridSize( x, y ) to set the grid to
	// the initial dimensions you want (32 x 32 maximum)
	// Do this FIRST to avoid problems!
	// Otherwise you will get the default 8x8 grid

	PS.gridSize( GAME.WIDTH, GAME.HEIGHT );
	PS.border(PS.ALL, PS.ALL, 0);

	GAME.hands.push(new hand('seconds', 60, 15, PS.COLOR_BLACK));
	GAME.hands.push(new hand('minutes', 60, 15, PS.COLOR_BLUE));
	GAME.hands.push(new hand('hours', 12, 6, PS.COLOR_RED));

	PS.timerStart(1, tick);

	// Run tick once so that the board doesn't wait too long to update
	tick();
};

function tick() {
	"use strict";
	var d = PS.date();
	var dateString = d.dayName+", "+d.monthName+" "+d.date+", "+d.hours+":"+d.minutes+":"+d.seconds+" - "+d.year;
	PS.statusText(dateString);
	PS.debugClear();
	PS.debug(PS.elapsed().toString() + "ms\n");

	// Clear board
	PS.color(PS.ALL, PS.ALL, GAME.BGCOLOR);

	// Draw clock hands
	for (var i = 0, imax = GAME.hands.length; i < imax; ++i) {
		GAME.hands[i].update(d);
	}
}

// Draws a line given the start and end location
function drawLine(x1, y1, x2, y2, color) {
	"use strict";
	var coords = PS.line(x1, y1, x2, y2);
	// PS.line does not include the start location
	PS.color(x1, y1, color);
	for (var i = 0; i < coords.length; ++i) {
		var coord = coords[i];
		PS.color(coord[0], coord[1], color);
	}
}

// Hand object for the clock
function hand(property, propertyMax, length, color) {
	"use strict";

	this.angle = 0;
	this.length = length;
	this.color = color;
	this.property = property;
	this.propertyMax = propertyMax;

	this.update = function(date) {
		"use strict";
		var x, y, value;
		value = (date[this.property] % this.propertyMax) / this.propertyMax;
		this.angle = -(value * 2 * Math.PI);
		// Note: Flip the coordinates over the line where y==x
		y = -Math.round(this.length * Math.cos(this.angle));
		x = -Math.round(this.length * Math.sin(this.angle));
		drawLine(GAME.CENTER.x, GAME.CENTER.y, GAME.CENTER.x + x, GAME.CENTER.y + y, this.color)
	};
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
