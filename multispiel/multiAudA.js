// Test

(function() {

var myName = "multiAudA";
var PS = PERLENSPIEL.Create({namespace:myName});

// Put your global variables after this line
var sounds = ["fx_pop", "fx_tick", "fx_click"];
var color = 0xFF9999;

// Put your function definitions after this line
function DrawText(text, x, y) {
	for (var i = 0; i < text.length; ++i) {
		PS.glyph(x+i, y, text[i]);
	}
}

// PS.init( system, options )
// Initializes the game
PS.init = function (system, options) {
	"use strict";

	PS.gridSize(9, sounds.length);

	PS.statusText(myName);
	PS.color(PS.ALL, PS.ALL, color);
	for (var s = 0; s < sounds.length; ++s) {
		PS.audioLoad(sounds[s]);
		DrawText(sounds[s], 0, s);
	}
};

PS.touch = function (x, y, data, options) {
	"use strict";
	PS.audioPlay(sounds[y]);
};

PS.release = function (x, y, data, options) { "use strict"; };
PS.enter = function (x, y, data, options) { "use strict"; };
PS.exit = function (x, y, data, options) { "use strict"; };
PS.exitGrid = function (options) { "use strict"; };
PS.keyDown = function (key, shift, ctrl, options) { "use strict"; };
PS.keyUp = function (key, shift, ctrl, options) { "use strict"; };
PS.input = function (sensors, options) { "use strict"; };

// Start the engine!
PS.start();
})();
