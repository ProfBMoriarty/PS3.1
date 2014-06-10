// Perlenspiel Core Module

// Includes:
// + Class constructor
// + Module initialization helpers

var PerlenspielCore = function (my) {

	////////////////////////////////////////
	// Engine initialization

	my.Create = function(spec) {
		my.instance = new my.PSInterface(spec);
		return my.instance;
	}

	// Perlenspiel class constructor
	my.PSInterface = function(spec) {
		my.ProvideConstants(this);
		my.initializeModules(spec);
	}

	////////////////////////////////////////
	// Module Initialization Queue

	my._initQueue = [];

	// Registers a module to be initialized with the spec
	my._onInit = function(func) {
		if (typeof func === 'function') {
			my._initQueue.push(func);
		} else {
			console.error("_onInit func was type " + (typeof func) + " instead of a function.");
		}
	}

	// Call initializer functions and pass them the spec
	my.initializeModules = function(spec) {
		for (var i = 0; i < my._initQueue.length; ++i) {
			my._initQueue[i].call(null, spec);
		}
	}

	return my;
};