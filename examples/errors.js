
/*
Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
Perlenspiel is Copyright © 2009-14 Worcester Polytechnic Institute.
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
along with Perlenspiel. If not, see <http:*/


/*jslint nomen: true, white: true */
/*global PS */




PS.init = function( system, options ) {
	"use strict";
	PS.gridSize( 4, 4 );
	PS.color(0);
	PS.color(0, 0);
	PS.color(0, 0, 255);
	PS.color(1, 1, 128, 255);
	PS.color(2, 2, 128, 128, 255, 1);
	PS.color(5, 0, 0x0);
	PS.color(0, 5, 0x0);
	PS.color(5, 5, 0x0);
};

//
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


PS.keyDown = function( key, shift, ctrl, options ) {
	"use strict";
};


PS.keyUp = function( key, shift, ctrl, options ) {
	"use strict";	
};


PS.input = function( sensors, options ) {
	"use strict";
};
