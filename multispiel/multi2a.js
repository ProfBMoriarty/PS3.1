// Test

(function() {

var myName = "multi2a";

var PS = PERLENSPIEL.Create({namespace:myName});

// Put your global variables after this line

// Put your function definitions after this line


// PS.init( system, options )
// Initializes the game
PS.init = function (system, options) {
	"use strict";

	PS.gridSize(8, 1);

	PS.statusText(myName);
	PS.gridColor(PS.COLOR_RED);


};

PS.touch = function (x, y, data, options) {
	"use strict";
};

PS.release = function (x, y, data, options) {
	"use strict";
};

PS.enter = function (x, y, data, options) {
	"use strict";
};

PS.exit = function (x, y, data, options) {
	"use strict";
};

PS.exitGrid = function (options) {
	"use strict";
};

PS.keyDown = function (key, shift, ctrl, options) {
	"use strict";
	PS.debug( myName + "::PS.keyDown(): key = " + key + "\n" );
};

PS.keyUp = function (key, shift, ctrl, options) {
	"use strict";
};

PS.input = function (sensors, options) {
	"use strict";
	
	PS.debug( myName + "::PS.input() called\n" );
	var device = sensors.wheel
	if ( device ) {
	    PS.debug( "sensors.wheel = " + device + "\n" );
	}
};

// Start the engine!
PS.start();
})();
