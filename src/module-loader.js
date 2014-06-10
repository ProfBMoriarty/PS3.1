// ps3.1.6.js for Perlenspiel 3.1
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

var PERLENSPIEL = {
	// Public constructor
	Create: function(spec) {
		var engine = {};
		// Load each module
		PerlenspielCore(engine);
		PerlenspielConstants(engine);
		PerlenspielStartup(engine);
		PerlenspielInterface(engine);
		PerlenspielInternal(engine);
		// Return to caller
		return engine.Create(spec);
	}
};
