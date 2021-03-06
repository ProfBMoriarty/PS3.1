// Perlenspiel Core Module

// Includes:
// + Class constructor
// + Module initialization helpers

/*jslint nomen: true, white: true, vars: true */
/*global document, window, screen, console, Image, AQ, PIXI, PERLENSPIEL, PS */

var PerlenspielCore = function (my) {
    "use strict";

	////////////////////////////////////////
	// Engine initialization

	my.Create = function(spec) {
		my.instance = new my.PSInterface(spec);
		my._psObject = {engine: my, ps: my.instance, broadcast: my._onBroadcast, started: false};
		return my._psObject;
	};

	// Perlenspiel class constructor
	my.PSInterface = function(spec) {
		my._initializeModules(spec);
		this.setOptions(spec);
	};

	////////////////////////////////////////
	// Module Initialization Queue

	my._initQueue = [];
	my._startQueue = [];
	my._spec = {};
	my._isInitialized = false;

	// Registers a function to be invoked with the spec (options) object when the modules are all loaded
	my._onInit = function(func) {
		if (typeof func === 'function') {
			if (!my._isInitialized) {
				// Regular module init
				my._initQueue.push(func);
			} else {
				// Post load init
				func.call(null, my._spec);
			}
		} else {
			console.error("_onInit func was type " + (typeof func) + " instead of a function.");
		}
	};

	// Call initializer functions and pass them the spec
	my._initializeModules = function(spec) {
		my._spec = spec;
		for (var i = 0; i < my._initQueue.length; ++i) {
			my._initQueue[i].call(null, my._spec);
		}
		my._isInitialized = true;
	};

	// Registers a function to be invoked when a perlenspiel instance is started
	my._onStart = function(func) {
		if (typeof func === 'function') {
			my._startQueue.push(func);
		} else {
			console.error("_onStart func was type " + (typeof func) + " instead of a function.");
		}
	};

	// Call start functions and pass them the spec
	my._startModules = function() {
		for (var i = 0; i < my._startQueue.length; ++i) {
			my._startQueue[i].call(null, my._spec, my.instance);
		}
	};

	return my;
};

// Register with global PERLENSPIEL manager
PERLENSPIEL.RegisterModule(PerlenspielCore);
