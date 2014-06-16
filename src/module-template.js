// Perlenspiel Module Template

/*jslint nomen: true, white: true, vars: true */
/*global document, window, screen, console, Image, AQ, PIXI, PERLENSPIEL, PS */

var ModuleTemplate = function (my) {
    "use strict";

	////////////////////////////////////////
	// Module initializer
	
	my._onInit(function(spec) {
		console.log("ModuleTemplate initialized with specification:");
		console.log(spec);
	});

	////////////////////////////////////////
	// Public properties
	
	my.PSInterface.prototype.displaySecret = function() {
		// You can access the current Perlenspiel instance via my.instance
		my.instance.debug("My secret is " + my._secret);
	};

    ////////////////////////////////////////
	// Private properties
	
	my._secret = "This is a secret!";

	return my;
};

// Register with global PERLENSPIEL manager
PERLENSPIEL.RegisterModule(ModuleTemplate);
