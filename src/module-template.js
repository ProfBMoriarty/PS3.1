// Perlenspiel Module Template

/*jslint nomen: true, white: true, vars: true */
/*global document, window, screen, console, Image, AQ, PIXI, PERLENSPIEL, PS */

var ModuleTemplate = function (my) {
    "use strict";

    ////////////////////////////////////////
	// Private variables
	
	my._secret = "This is a secret!";

	////////////////////////////////////////
	// Module initializer
	
	my._onInit(function(spec) {
		console.log("ModuleTemplate initialized with specification:");
		console.log(spec);
	});

	////////////////////////////////////////
	// Public methods
	
	my.PSInterface.prototype.displaySecret = function() {
		console.log("My secret is " + my._secret);
	};

	return my;
};

// Register with global PERLENSPIEL manager
PERLENSPIEL.RegisterModule(ModuleTemplate);
