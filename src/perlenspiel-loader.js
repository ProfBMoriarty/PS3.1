// perlenspiel-loader.js for Perlenspiel 3.1
// Remember to update version number in _system!

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
 along with Perlenspiel. If not, see <http://www.gnu.org/licenses/>.
 */

// The following comments are for JSLint

/*jslint nomen: true, white: true, vars: true */
/*global document, window, screen, console, Image, AQ, PIXI */

// Global public constant-holder
var PS = PS || {};

var PERLENSPIEL = (function(PERLENSPIEL) {
    "use strict";

    var modules = [];
    var perlenspielInstances = [];
    var perlenspielInstancesStarted = [];

    PERLENSPIEL.RegisterModule = function(module) {
        // Log a module to be initialized later
		if (typeof module === 'function') {
			modules.push(module);
		}

        // Register modules to Perlenspiel instances that already started
        if (perlenspielInstances.length > 0) {
            for (var i = 0; i < perlenspielInstances.length; ++i) {
                module.call(null, perlenspielInstances[i].engine);
            }
        }
	};

	// Public constructor
	PERLENSPIEL.Create = function(spec) {
		var engine = {};
		for (var i = 0; i < modules.length; ++i) {
			modules[i].call(null, engine);
		}
		// Create the engine instance and return it to the caller
        var psObject = engine.Create(spec);
        perlenspielInstances.push(psObject);
		return psObject.ps;
	};

    PERLENSPIEL.OnStartInstance = function(psObject) {
        perlenspielInstancesStarted.push(psObject);
    };

    PERLENSPIEL.OnStopInstance = function(psObject) {
        var index = perlenspielInstancesStarted.indexOf(psObject);
        if (index > 0)
            perlenspielInstancesStarted.splice(index, 1);
    };

    PERLENSPIEL.Broadcast = function(method, parameters) {
        for (var i = 0; i < perlenspielInstancesStarted.length; ++i) {
            perlenspielInstancesStarted[i].broadcast(method, parameters);
        }
    };

    PERLENSPIEL.NumInstances = function() {
        return perlenspielInstances.length;
    };

	return PERLENSPIEL;
}(PERLENSPIEL || {}));
