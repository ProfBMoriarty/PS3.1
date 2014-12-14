// Monster Graveyard Perlenspiel Example for Perlenspiel 3.0
// The following comment lines are for JSLint. Don't remove them!
/*jslint nomen: true, white: true */
/*global PS */
var GRIDWIDTH, GRIDHEIGHT;
GRIDWIDTH	= 10;
GRIDHEIGHT	= 10;

var EYEBALL	= "◉"	;
var GHOST	= "ᗣ"	;
var SKULL	= "☠"	;
var WALL	= "wall";

function moveCreature(formerx, formery, x, y) {
	var glyph = PS.glyph(formerx, formery);
	//PS.debug("From (" + formerx + " " + formery + ") to (" + x + " " + y + ")\n");
	if (PS.data(x, y) == WALL) {
		PS.statusText("A monster runs into a wall!");
	} else if (PS.data(x, y) == "monster") {
		PS.statusText("A monster runs into another monster!");
	} else if (PS.data(x, y) == "grave") {
		PS.glyph(formerx, formery, 0);
		PS.data(formerx, formery, 0);
		PS.statusText("A monster jumped into a grave!");
	} else {
		PS.glyph(formerx, formery, 0);
		PS.data(formerx, formery, 0);
		PS.glyph(x, y, glyph);
		PS.data(x, y, "monster");
	}
}

// True if x,y is at a distance from xs, ys (diagonals count as dist 1)
var atDist = function(xs, ys, dist, x, y) {
	var xd = Math.abs(x - xs);
	var yd = Math.abs(y - ys)
	return (xd <= dist && yd <= dist && (xd == dist || yd == dist));
}

// Moves a creature randomly to a location 1 bead away
var MoveRandomly = function(x, y) {
	var dest = Beads(atDist.bind(this, x, y, 1)).Rand();
	moveCreature(x, y, dest.x, dest.y);
}

// Move all skulls randomly
var UpdateSkulls = function () {
	"use strict";
	Beads({glyph:SKULL}).Exec(MoveRandomly);
};

var CreateWall = function(x, y) {
	PS.color(x, y, PS.COLOR_GRAY);
	PS.data( x, y, WALL);
}

var SpawnMonster = function(x, y, glyph) {
	PS.glyph(x, y, glyph);
	PS.glyphColor(x, y, PS.COLOR_WHITE);
	PS.data( x, y, "monster");
}

var CreateGrave = function(x, y) {
	PS.glyphColor(x, y, 139, 90, 43);
	PS.glyph(x, y, "▒");
	PS.data(x, y, "grave");
}

PS.init = function (options) {
	"use strict";

	PS.gridSize(GRIDWIDTH, GRIDHEIGHT);

	PS.gridColor(PS.COLOR_BLACK);
	PS.statusColor(PS.COLOR_WHITE);
	PS.statusText("Welcome to Spookytown!");
	// Style for every bead
	Beads().border(0).glyphColor(PS.COLOR_WHITE).color(PS.COLOR_BLACK);

	// Draw four walls
	Beads(function(x,y) {
		return (x == 0 || y == 0 || x == GRIDWIDTH-1 || y == GRIDHEIGHT-1);
	}).Exec(CreateWall);
	
	SpawnMonster(2, 2, EYEBALL);
	SpawnMonster(7, 7, GHOST);
	SpawnMonster(3, 7, SKULL);
	SpawnMonster(6, 2, SKULL);
	SpawnMonster(4, 4, SKULL);

	//Create Graves
	CreateGrave(5, 6);
	CreateGrave(7, 1);
	CreateGrave(3, 3);

	//Start the Skull moving
	PS.timerStart(40, UpdateSkulls);
};


PS.touch = function (x, y, data) {
	"use strict";
	// Detect clicking on eyeballs
	if (Bead(x, y).glyph === EYEBALL)
		MoveRandomly(x, y);
};

PS.release = function (x, y, data) {
	"use strict";
};

PS.enter = function (x, y, data, options) {
	"use strict";
	//Where is the ghost? Once found, move it!
	if (Bead(x, y).glyph === GHOST) {
		//move the ghost to a random destination that isn't a wall
		var dest = Beads().Not({data:WALL}).Rand();
		moveCreature(x, y, dest.x, dest.y);
	}
};

PS.exit = function (x, y, data) {
	"use strict";
};

PS.exitGrid = function (options) {
	"use strict";
};

PS.keyDown = function (key, shift, ctrl, options) {
	"use strict";
};

PS.keyUp = function (key, shift, ctrl, options) {
	"use strict";
};

PS.input = function (sensors, options) {
	"use strict";
};