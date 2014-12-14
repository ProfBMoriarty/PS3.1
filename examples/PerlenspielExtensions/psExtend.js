/*	PS Extend
	by Mark Diehr - mdiehr@gmail.com
	
	A small functional extension for Perlenspiel.

	The basic item of logic is a list of bead objects.

	There are a set of methods which create or filter the lists,
	and another set of methods which do things to the beads
	in a list.
	
	Bead objects store a simplified copy of the engine's bead
	properties, and provides methods for modifying the bead.


	Beads([filter])
		PARAMS: filter, or nothing
		RETURN: beadlist
		Takes an optional filter, and then either returns a
		beadlist of every bead in the grid, if no filter is given,
		or a list of every bead which matches the filter.

	beadlist.Exec(func)
		PARAMS: function that takes an x and y coordinate
		RETURN: the beadlist
		Applies a function to every set of coordinates in the
		beadlist.

	beadlist.Rand()
		PARAMS: none
		RETURN: one random bead from the beadlist
		Fails if the list is empty.
	
	beadlist.Where(properties)	
		PARAMS: properties object
		RETURN: a new beadlist where each bead has the given
				properties
		Bead objects by default have the following properties:
			x, y, color, alpha, fade, scale, radius, data, exec,
			visible, active, border, borderColor, borderAlpha,
			borderFade, glyph, glyphColor, glyphAlpha, glyphScale,
			glyphFade
		If a property is listed, beads must have the same value
		for that proprety. For example, the properties object
		{data:1} will match every bead where the data has been
		set to 1.

	beadlist.Not(properties)
		PARAMS: properties object
		RETURN: a new beadlist where each bead does not have the
				given properties
		The complement to beadlist.Where.

	beadlist.Filter(func)
		PARAMS: function that takes an x and y coordinate and
				returns true or false
		RETURN: the beadlist of every bead where the function
				returns true
		Applies a function to every set of coordinates in the
		beadlist. Beads that pass the function (return value of
		true) are included in the returned beadlist.
	
	beadlist.Reject(func)
		PARAMS: function that takes an x and y coordinate and
				returns true or false
		RETURN: the beadlist of every bead where the function
				returns false
		The opposite of beadlist.Filter.

	beadlist.Update()
		PARAMS: none
		RETURN: the beadlist
		Invokes the Update() method on each bead, synchronizing
		it with the bead in the Perlenspiel engine.

	beadlist.Set()
		PARAMS: properties object
		RETURN: the beadlist
		Changes every bead in the beadlist by setting its
		properties to match those of the properties object.
		Properties included:
			data, color, glyph, glyphColor

	The beadlist also has a collection of convenience functions for setting
	the bead properties of every bead in the list. They have the same functionality
	as invoking the corresponding PS.______ method on each bead in the list.
	Functions included:
		color, alpha, fade, scale, radius, data, exec, visible, active, border,
		borderColor, borderAlpha, borderFade, glyph, glyphColor, glyphAlpha,
		glyphScale, glyphFade

*/

// Global variables to use
var PerlenspielExtend;
var Beads;
var Bead;

var ModulePSExtend = function (my) {
    "use strict";

    ////////////////////////////////////////
	// Private properties
	
	// bead info class
	var _bead = function(x, y) {
	 	this.x = x;
		this.y = y;
		this.color = null;
		this.alpha = null;
		this.fade = null;
		this.scale = null;
		this.radius = null;
		this.data = null;
		this.exec = null;
		this.visible = null;
		this.active = null;
		this.border = null;
		this.borderColor = null;
		this.borderAlpha = null;
		this.borderFade = null;
		this.glyph = null;
		this.glyphColor = null;
		this.glyphAlpha = null;
		this.glyphScale = null;
		this.glyphFade = null;
		this.Update();
	}

	// Update bead info
	_bead.prototype.Update = function() {
		this.color			= PS.color(		 this.x, this.y);
		this.alpha			= PS.alpha(		 this.x, this.y);
		this.fade			= PS.fade (		 this.x, this.y);
		this.scale			= PS.scale(		 this.x, this.y);
		this.radius			= PS.radius (	 this.x, this.y);
		this.data			= PS.data(		 this.x, this.y);
		this.exec			= PS.exec(		 this.x, this.y);
		this.visible		= PS.visible(	 this.x, this.y);
		this.active			= PS.active (	 this.x, this.y);
		// Borders
		this.border			= PS.border(	 this.x, this.y);
		this.borderColor	= PS.borderColor(this.x, this.y);
		this.borderAlpha	= PS.borderAlpha(this.x, this.y);
		this.borderFade		= PS.borderFade (this.x, this.y);
		// Glyphs
		this.glyph			= String.fromCharCode(PS.glyph(this.x, this.y));
		this.glyphColor		= PS.glyphColor( this.x, this.y);
		this.glyphAlpha		= PS.glyphAlpha( this.x, this.y);
		this.glyphScale		= PS.glyphScale( this.x, this.y);
		this.glyphFade		= PS.glyphFade ( this.x, this.y);
	}

	var _each = function(list, func) {
		for (var i = 0; i < list.length; ++i)
			func(list[i]);
	}

	var _where = function(list, properties) {
		var result = [];
		for (var i = 0; i < list.length; ++i) {
			var item = list[i];
			for(var prop in properties) {
				if(properties.hasOwnProperty(prop))
					if(item[prop] === properties[prop])
						result.push(item);
			}
		}
		return result;
	}

	// Returns a copy of list that doesn't include values
	var _without = function(list, values) {
		var result = [];
		for (var i = 0; i < list.length; ++i) {
			if(values.indexOf(list[i]) === -1 )
				result.push(list[i]);
		}
		return result;
	}

	// Writes useful functions into a list object so you can chain them
	var _decorateList = function(list) {
		// Apply a function on every bead in the bead list
		list.Exec = function(func) {
			if (this instanceof Array) {
				for(var i = 0; i < this.length; ++i)
					func.call(null, this[i].x, this[i].y);
			}
			return this;
		};

		// Choose a random element from an array
		list.Rand = function() {
			return this[Math.floor(Math.random() * this.length)];
		};

		list.Where = function(properties) {
			var beads = _where(this, properties);
			return _decorateList(beads);
		};

		list.Not = function(properties) {
			var beadsWith = this.Where(properties);
			var beads = _without(this, beadsWith);
			return _decorateList(beads);
		}

		// Returns beads that pass a truth test
		list.Filter = function(func) {
			var beads = [];
			for (var i = 0; i < this.length; ++i) {
				if (func.call(null, this[i].x, this[i].y))
					beads.push(this[i]);
			}
			return _decorateList(beads);
		};

		// Returns beads that fail a truth test
		list.Reject = function(func) {
			var beads = [];
			for (var i = 0; i < this.length; ++i) {
				if (!func(this[i].x, this[i].y))
					beads.push(this[i]);
			}
			return _decorateList(beads);
		};

		list.Update = function() {
			for (var i = 0; i < this.length; ++i)
				this[i].Update();
			return this;
		}

		list.Set = function(properties) {
			properties = properties || {};
			if (properties.hasOwnProperty("data"))
				this.Exec(function(x,y) {PS.data(x,y,properties.data)});
			if (properties.hasOwnProperty("color"))
				this.Exec(function(x,y) {PS.color(x,y,properties.color)});
			if (properties.hasOwnProperty("glyph"))
				this.Exec(function(x,y) {PS.glyph(x,y,properties.glyph)});
			if (properties.hasOwnProperty("glyphColor"))
				this.Exec(function(x,y) {PS.glyphColor(x,y,properties.glyphColor)});
			return this.Update();
		}

		// Bead modification API
		list.color = function(color) {
			return this.Exec(function(x,y) {PS.color(x, y, color)})}
		list.alpha = function(alpha) {
			return this.Exec(function(x,y) {PS.alpha(x, y, alpha)})}
		list.fade = function(fade) {
			return this.Exec(function(x,y) {PS.fade(x, y, fade)})}
		list.scale = function(scale) {
			return this.Exec(function(x,y) {PS.scale(x, y, scale)})}
		list.radius = function(radius) {
			return this.Exec(function(x,y) {PS.radius(x, y, radius)})}
		list.data = function(data) {
			return this.Exec(function(x,y) {PS.data(x, y, data)})}
		list.exec = function(exec) {
			return this.Exec(function(x,y) {PS.exec(x, y, exec)})}
		list.visible = function(visible) {
			return this.Exec(function(x,y) {PS.visible(x, y, visible)})}
		list.active = function(active) {
			return this.Exec(function(x,y) {PS.active(x, y, active)})}

		list.border = function(border) {
			return this.Exec(function(x,y) {PS.border(x, y, border)})}
		list.borderColor = function(borderColor) {
			return this.Exec(function(x,y) {PS.borderColor(x, y, borderColor)})}
		list.borderAlpha = function(borderAlpha) {
			return this.Exec(function(x,y) {PS.borderAlpha(x, y, borderAlpha)})}
		list.borderFade = function(borderFade) {
			return this.Exec(function(x,y) {PS.borderFade(x, y, borderFade)})}

		list.glyph = function(glyph) {
			return this.Exec(function(x,y) {PS.glyph(x, y, glyph)})}
		list.glyphColor = function(glyphColor) {
			return this.Exec(function(x,y) {PS.glyphColor(x, y, glyphColor)})}
		list.glyphAlpha = function(glyphAlpha) {
			return this.Exec(function(x,y) {PS.glyphAlpha(x, y, glyphAlpha)})}
		list.glyphScale = function(glyphScale) {
			return this.Exec(function(x,y) {PS.glyphScale(x, y, glyphScale)})}
		list.glyphFade = function(glyphFade) {
			return this.Exec(function(x,y) {PS.glyphFade(x, y, glyphFade)})}

		return list;
	};

	// Get all beads
	my.PSInterface.prototype.GetAllBeads = function() {
		var beads = [];
		for (var x = 0; x < my._grid.x; ++x)
			for (var y = 0; y < my._grid.y; ++y)
				beads.push(new _bead(x, y));
		return _decorateList(beads);
	};

	// Get a collection of beads that pass the test function
	my.PSInterface.prototype.GetBeads = function(test) {
		// All beads
		var list = my.instance.GetAllBeads();
		if(test === undefined)
			return list;

		// Object test
		if(typeof test === "object")
			return list.Where(test);

		// Function test
		return list.Filter(test);
	};

	// Global Public interface
	
	// Query beads
	Beads = my.PSInterface.prototype.GetBeads.bind(null);

	// Reference to a single bead
	Bead = function(x, y) { return new _bead(x, y); };

	return my;
};

// Register with global PERLENSPIEL manager
PERLENSPIEL.RegisterModule(ModulePSExtend);
