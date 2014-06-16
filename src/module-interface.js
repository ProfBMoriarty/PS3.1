// Perlenspiel Interface Module

// Includes:
// + Public engine interface methods

/*jslint nomen: true, white: true, vars: true, unused: false */
/*jshint nomen: true, white: true, unused: false */
/*global document, window, screen, console, Image, AQ, PIXI, PERLENSPIEL, PS */

var PerlenspielInterface = function (my) {
    "use strict";

	//---------------
	// GRID FUNCTIONS
	//---------------

	// PS.gridSize(x, y)
	// Sets x/y dimensions of grid
	// Returns object with .width and .height properties, or PS.ERROR

	my.PSInterface.prototype.gridSize = function (xP, yP) {
		var fn, x, y, max;

		fn = "[PS.gridSize] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 0, 2))
			return PS.ERROR;

		// prevent arg mutation

		x = xP;
		y = yP;

		max = my._DEFAULTS.grid.max;

		// Check x dimension

		if (x === PS.DEFAULT) {
			x = my._DEFAULTS.grid.x;
		} else if (x === PS.CURRENT) {
			x = my._grid.x;
		} else if (my._typeOf(x) === "number") {
			x = Math.floor(x);
			if (x < 1) {
				x = 1;
			} else if (x > max) {
				x = max;
			}
		} else {
			return my._error(fn + "x argument invalid");
		}

		// Check y dimension

		if (y === PS.DEFAULT) {
			y = my._DEFAULTS.grid.y;
		} else if (y === PS.CURRENT) {
			y = my._grid.y;
		} else if (my._typeOf(y) === "number") {
			y = Math.floor(y);
			if (y < 1) {
				y = 1;
			} else if (y > max) {
				y = max;
			}
		} else {
			return my._error(fn + "y argument invalid");
		}

		my._gridSize(x, y);

		return {
			width: my._grid.x,
			height: my._grid.y
		};
	};

	// PS.gridPlane ( p )
	// Sets current color plane of grid
	// Returns plane or PS.ERROR on error

	my.PSInterface.prototype.gridPlane = function (planeP) {
		var fn, plane, type;

		fn = "[PS.gridPlane] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 0, 1))
			return PS.ERROR;

		plane = planeP; // avoid direct mutation of argument

		type = my._typeOf(plane);
		if ((type !== "undefined") && (plane !== PS.CURRENT)) {
			if (plane === PS.DEFAULT) {
				plane = 0;
			} else if (type === "number") {
				plane = Math.floor(plane);
				if (plane < 1) {
					plane = 0;
				}
			} else {
				return my._error(fn + "plane argument invalid");
			}

			my._grid.plane = plane;
		}

		return my._grid.plane;
	};

	// PS.gridColor( color )
	// Sets color of grid
	// [p1/p2/p3] is a PS3 color paramater
	// Returns rgb or PS.ERROR

	my.PSInterface.prototype.gridColor = function (p1, p2, p3) {
		var fn, colors;

		fn = "[PS.gridColor] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 0, 3) || arguments.length === 2)
			return PS.ERROR;

		colors = my._decodeColors(fn, p1, p2, p3);
		if (colors === PS.ERROR) {
			return PS.ERROR;
		}

		return my._gridColor(colors);
	};

	// PS.gridFade( rate, options )
	// Sets fade rate/options of grid
	// Returns fader settings or PS.ERROR

	my.PSInterface.prototype.gridFade = function (rate, optionsP) {
		var fn, fader, color, orate, nrate, options, type, val;

		fn = "[PS.gridFade] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 0, 2))
			return PS.ERROR;

		color = my._grid.color;
		fader = my._grid.fader;
		orate = fader.rate;

		type = my._typeOf(rate);
		if ((type === "undefined") || (rate === PS.CURRENT)) {
			nrate = orate;
		} else if (rate === PS.DEFAULT) {
			nrate = my._DEFAULTS.fader.rate;
		} else if (type === "number") {
			nrate = Math.floor(rate);
			if (nrate < 0) {
				nrate = 0;
			}
		} else {
			return my._error(fn + "rate argument invalid");
		}

		options = my._validFadeOptions(fn, optionsP);
		if (options === PS.ERROR) {
			return PS.ERROR;
		}

		val = options.rgb;
		if (val !== PS.CURRENT) {
			if (val === PS.DEFAULT) {
				fader.rgb = my._DEFAULTS.fader.rgb;
			} else {
				fader.rgb = val;
			}
			fader.r = options.r;
			fader.g = options.g;
			fader.b = options.b;
		}

		val = options.onStep;
		if (val !== PS.CURRENT) {
			if (val === PS.DEFAULT) {
				fader.onStep = my._DEFAULTS.fader.onStep;
			} else {
				fader.onStep = val;
			}
		}

		val = options.onEnd;
		if (val !== PS.CURRENT) {
			if (val === PS.DEFAULT) {
				fader.onEnd = my._DEFAULTS.fader.onEnd;
			} else {
				fader.onEnd = val;
			}
		}

		val = options.params;
		if (val !== PS.CURRENT) {
			if (val === PS.DEFAULT) {
				fader.params = my._DEFAULTS.fader.params;
			} else {
				fader.params = val;
			}
		}

		// Handle rate change

		if (orate !== nrate) {
			fader.rate = nrate;
			if (nrate < 1) {
				fader.active = false;
				fader.kill = true;
			} else if (fader.active) {
				my._recalcFader(fader, color.r, color.g, color.b, 255);
			}
		}

		return {
			rate: fader.rate,
			rgb: fader.rgb,
			onStep: fader.onStep,
			onEnd: fader.onEnd,
			params: fader.params
		};
	};

	// PS.gridShadow
	// Activates/deactivates grid shadow and sets its color
	// show = boolean, PS.CURRENT or PS.DEFAULT
	// [p1/p2/p3] = PS3 color parameter
	// Returns rgb or PS.ERROR

	my.PSInterface.prototype.gridShadow = function (showP, p1, p2, p3) {
		var fn, show, colors;

		fn = "[PS.gridShadow] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 0, 4))
			return PS.ERROR;

		show = showP; // prevent arg mutation
		if ((show !== true) && (show !== false) && (show !== PS.CURRENT)) {
			if ((show === null) || (show === PS.DEFAULT)) {
				show = false;
			} else if (my._typeOf(show) === "number") {
				show = (show !== 0);
			} else {
				return my._error(fn + "First argument invalid");
			}
		}

		colors = my._decodeColors(fn, p1, p2, p3);
		if (colors === PS.ERROR) {
			return PS.ERROR;
		}

		return my._gridShadow(show, colors);
	};

	//---------------
	// BEAD FUNCTIONS
	//---------------

	// PS.color ( x, y, color )
	// Change/inspect bead color on current grid plane

	my.PSInterface.prototype.color = function (x, y, p1, p2, p3) {
		var fn, colors;

		fn = "[PS.color] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 2, 5))
			return PS.ERROR;

		colors = my._decodeColors(fn, p1, p2, p3);
		if (colors === PS.ERROR) {
			return PS.ERROR;
		}

		return my._beadExec(fn, my._color, x, y, colors);
	};

	// PS.alpha( x, y, a )

	my.PSInterface.prototype.alpha = function (x, y, alpha_p) {
		var fn, alpha, type;

		fn = "[PS.alpha] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 2, 3))
			return PS.ERROR;
		alpha = alpha_p; // prevent direct mutation of args

		if (alpha !== PS.CURRENT) {
			type = my._typeOf(alpha);
			if (type === "undefined") {
				alpha = PS.CURRENT;
			} else if (type === "number") {
				alpha = Math.floor(alpha);
				if (alpha < 0) {
					alpha = 0;
				} else if (alpha > 255) {
					alpha = 255;
				}
			} else if (alpha === PS.DEFAULT) {
				alpha = my._DEFAULTS.bead.color.a;
			} else {
				return my._error(fn + "alpha argument invalid");
			}
		}

		return my._beadExec(fn, my._alpha, x, y, alpha);
	};

	// PS.fade( x, y, rate, options )
	// Sets fade rate/options of bead
	// Returns fader settings or PS.ERROR

	my.PSInterface.prototype.fade = function (x, y, rate_p, options_p) {
		var fn, args, rate, type, options;

		fn = "[PS.fade] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 2, 4))
			return PS.ERROR;

		rate = rate_p; // prevent arg mutation
		if ((rate !== PS.CURRENT) && (rate !== PS.DEFAULT)) {
			type = my._typeOf(rate);
			if (type === "undefined") {
				rate = PS.CURRENT;
			} else if (type === "number") {
				rate = Math.floor(rate);
				if (rate < 0) {
					rate = 0;
				}
			} else {
				return my._error(fn + "rate argument invalid");
			}
		}

		options = my._validFadeOptions(fn, options_p);
		if (options === PS.ERROR) {
			return PS.ERROR;
		}

		return my._beadExec(fn, my._fade, x, y, rate, options);
	};

	// PS.scale ( x, y, scale )
	// Expects a number between 50 and 100

	my.PSInterface.prototype.scale = function (x, y, scale_p) {
		var fn, args, scale, type;

		fn = "[PS.scale] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 2, 3))
			return PS.ERROR;

		// prevent arg mutation

		scale = scale_p;

		if (scale !== PS.CURRENT) {
			type = my._typeOf(scale);
			if (type === "undefined") {
				scale = PS.CURRENT;
			} else if (scale === PS.DEFAULT) {
				scale = 100;
			} else if (type === "number") {
				scale = Math.floor(scale);
				if (scale < 50) {
					scale = 50;
				} else if (scale > 100) {
					scale = 100;
				}
			} else {
				return my._error(fn + "scale parameter invalid");
			}
		}

		return my._beadExec(fn, my._scale, x, y, scale);
	};

	// PS.radius( x, y, radius )
	// Expects a radius between 0 and 50

	my.PSInterface.prototype.radius = function (x, y, radius_p) {
		var fn, args, radius, type;

		fn = "[PS.radius] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 2, 3))
			return PS.ERROR;

		// prevent arg mutation

		radius = radius_p;

		if (radius !== PS.CURRENT) {
			type = my._typeOf(radius);
			if (type === "undefined") {
				radius = PS.CURRENT;
			} else if (radius === PS.DEFAULT) {
				radius = 0;
			} else if (type === "number") {
				radius = Math.floor(radius);
				if (radius < 0) {
					radius = 0;
				} else if (radius > 50) {
					radius = 50;
				}
			} else {
				return my._error(fn + "radius parameter invalid");
			}
		}

		return my._beadExec(fn, my._radius, x, y, radius);
	};

	// PS.bgColor ( x, y, color )
	// Change/inspect bead background color

	my.PSInterface.prototype.bgColor = function (x, y, p1, p2, p3) {
		var fn, args, colors;

		fn = "[PS.bgColor] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 2, 5))
			return PS.ERROR;

		colors = my._decodeColors(fn, p1, p2, p3);
		if (colors === PS.ERROR) {
			return PS.ERROR;
		}

		return my._beadExec(fn, my._bgColor, x, y, colors);
	};

	// PS.bgAlpha( x, y, a )

	my.PSInterface.prototype.bgAlpha = function (x, y, alpha_p) {
		var fn, args, alpha, type;

		fn = "[PS.bgAlpha] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 2, 3))
			return PS.ERROR;

		alpha = alpha_p; // prevent direct mutation of args
		if (alpha !== PS.CURRENT) {
			type = my._typeOf(alpha);
			if (type === "undefined") {
				alpha = PS.CURRENT;
			} else if (type === "number") {
				alpha = Math.floor(alpha);
				if (alpha < 0) {
					alpha = 0;
				} else if (alpha > 255) {
					alpha = 255;
				}
			} else if (alpha === PS.DEFAULT) {
				alpha = my._DEFAULTS.bead.bgColor.a;
			} else {
				return my._error(fn + "alpha argument invalid");
			}
		}

		return my._beadExec(fn, my._bgAlpha, x, y, alpha);
	};

	// PS.data( x, y, data )

	my.PSInterface.prototype.data = function (x, y, data_p) {
		var fn, args, data;

		fn = "[PS.data] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 2, 3))
			return PS.ERROR;

		// Prevent arg mutation

		data = data_p;
		if (data === undefined) {
			data = PS.CURRENT;
		} else if (data === PS.DEFAULT) {
			data = null;
		}

		return my._beadExec(fn, my._data, x, y, data);
	};

	// PS.exec( x, y, exec )

	my.PSInterface.prototype.exec = function (x, y, exec_p) {
		var fn, args, exec, type;

		fn = "[PS.exec] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 2, 3))
			return PS.ERROR;

		exec = exec_p; // prevent arg mutation
		if (exec !== PS.CURRENT) {
			type = my._typeOf(exec);
			if (type === "undefined") {
				exec = PS.CURRENT;
			} else if (exec === PS.DEFAULT) {
				exec = my._DEFAULTS.bead.exec;
			} else if (type !== "function") {
				return my._error(fn + "exec argument invalid");
			}
		}

		return my._beadExec(fn, my._exec, x, y, exec);
	};

	// PS.visible( x, y, show )

	my.PSInterface.prototype.visible = function (x, y, show_p) {
		var fn, args, show;

		fn = "[PS.visible] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 2, 3))
			return PS.ERROR;

		show = my._isBoolean(show_p, PS.CURRENT, true, PS.CURRENT);
		if (show === PS.ERROR) {
			return my._error(fn + "show argument invalid");
		}

		return my._beadExec(fn, my._visible, x, y, show);
	};

	// PS.active( x, y, active )

	my.PSInterface.prototype.active = function (x, y, active_p) {
		var fn, args, active;

		fn = "[PS.active] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 2, 3))
			return PS.ERROR;

		active = my._isBoolean(active_p, PS.CURRENT, true, PS.CURRENT);
		if (active === PS.ERROR) {
			return my._error(fn + "active argument invalid");
		}

		return my._beadExec(fn, my._active, x, y, active);
	};

	//----------------------
	// BEAD BORDER FUNCTIONS
	//----------------------

	// PS.border( x, y, width )
	// Accepts a width integer or an object with .top/.left/.bottom/.right properties

	my.PSInterface.prototype.border = function (x, y, width_p) {
		var fn, args, def, width, type, val;

		fn = "[PS.border] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 2, 3))
			return PS.ERROR;

		def = my._DEFAULTS.bead.border;

		// check a number

		width = width_p; // prevent arg mutation
		if (width !== PS.CURRENT) {
			type = my._typeOf(width);
			if (type === "undefined") {
				width = PS.CURRENT;
			} else if (width === PS.DEFAULT) {
				width = def.width;
			} else if (type === "number") {
				width = Math.floor(width);
				if (width < 0) {
					width = 0;
				}
			} else if (type === "object") {
				// Check the four edge properties

				// .top

				val = width.top;
				if (val !== PS.CURRENT) {
					type = my._typeOf(val);
					if (type === "undefined") {
						width.top = PS.CURRENT;
					} else if (type === "number") {
						val = Math.floor(val);
						if (val < 0) {
							val = 0;
						}
						width.top = val;
					} else if (val === PS.DEFAULT) {
						width.top = def.top;
					} else {
						return my._error(fn + ".top property invalid");
					}
				}

				// .left

				val = width.left;
				if (val !== PS.CURRENT) {
					type = my._typeOf(val);
					if (type === "undefined") {
						width.left = PS.CURRENT;
					} else if (type === "number") {
						val = Math.floor(val);
						if (val < 0) {
							val = 0;
						}
						width.left = val;
					} else if (val === PS.DEFAULT) {
						width.left = def.left;
					} else {
						return my._error(fn + ".left property invalid");
					}
				}

				// .bottom

				val = width.bottom;
				if (val !== PS.CURRENT) {
					type = my._typeOf(val);
					if (type === "undefined") {
						width.bottom = PS.CURRENT;
					} else if (type === "number") {
						val = Math.floor(val);
						if (val < 0) {
							val = 0;
						}
						width.bottom = val;
					} else if (val === PS.DEFAULT) {
						width.bottom = def.bottom;
					} else {
						return my._error(fn + ".bottom property invalid");
					}
				}

				// .right

				val = width.right;
				if (val !== PS.CURRENT) {
					type = my._typeOf(val);
					if (type === "undefined") {
						width.right = PS.CURRENT;
					} else if (type === "number") {
						val = Math.floor(val);
						if (val < 0) {
							val = 0;
						}
						width.right = val;
					} else if (val === PS.DEFAULT) {
						width.right = def.right;
					} else {
						return my._error(fn + ".right property invalid");
					}
				}
			} else {
				return my._error(fn + "width argument invalid");
			}
		}

		return my._beadExec(fn, my._border, x, y, width);
	};

	// PS.borderColor( x, y, p1, p2, p3 )

	my.PSInterface.prototype.borderColor = function (x, y, p1, p2, p3) {
		var fn, colors;

		fn = "[PS.borderColor] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 2, 5))
			return PS.ERROR;

		colors = my._decodeColors(fn, p1, p2, p3);
		if (colors === PS.ERROR) {
			return PS.ERROR;
		}

		return my._beadExec(fn, my._borderColor, x, y, colors);
	};

	// PS.borderAlpha( x, y, alpha )

	my.PSInterface.prototype.borderAlpha = function (x, y, alpha_p) {
		var fn, args, alpha, type;

		fn = "[PS.borderAlpha] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 2, 3))
			return PS.ERROR;

		alpha = alpha_p; // prevent arg mutation
		if (alpha !== PS.CURRENT) {
			type = my._typeOf(alpha);
			if (type === "undefined") {
				alpha = PS.CURRENT;
			} else if (type === "number") {
				alpha = Math.floor(alpha);
				if (alpha < 0) {
					alpha = 0;
				} else if (alpha > 255) {
					alpha = 255;
				}
			} else if (alpha === PS.DEFAULT) {
				alpha = my._DEFAULTS.bead.border.color.a;
			} else {
				return my._error(fn + "alpha argument invalid");
			}
		}

		return my._beadExec(fn, my._borderAlpha, x, y, alpha);
	};

	// PS.borderFade( rate, options )
	// Sets fade rate/options of border
	// Returns fade settings or PS.ERROR

	my.PSInterface.prototype.borderFade = function (x, y, rate_p, options_p) {
		var fn, args, rate, type, options;

		fn = "[PS.borderFade] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 2, 4))
			return PS.ERROR;

		rate = rate_p; // prevent arg mutation
		if ((rate !== PS.CURRENT) && (rate !== PS.DEFAULT)) {
			type = my._typeOf(rate);
			if (type === "undefined") {
				rate = PS.CURRENT;
			} else if (type === "number") {
				rate = Math.floor(rate);
				if (rate < 0) {
					rate = 0;
				}
			} else {
				return my._error(fn + "rate argument not a number");
			}
		}

		options = my._validFadeOptions(fn, options_p);
		if (options === PS.ERROR) {
			return PS.ERROR;
		}

		return my._beadExec(fn, my._borderFade, x, y, rate, options);
	};

	//---------------------
	// BEAD GLYPH FUNCTIONS
	//---------------------

	// Improved Unicode handling by Mark Diehr

	// PS.glyph( x, y, glyph )
	// [glyph] can be a Unicode number or a string

	my.PSInterface.prototype.glyph = function (x, y, glyph_p) {
		var fn, args, glyph, type;

		fn = "[PS.glyph] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 2, 3))
			return PS.ERROR;

		glyph = glyph_p; // prevent arg mutation
		if (glyph !== PS.CURRENT) {
			type = my._typeOf(glyph);
			if (type === "undefined") {
				glyph = PS.CURRENT;
			} else if (glyph === PS.DEFAULT) {
				glyph = 0;
			} else if (type === "string") {
				if (glyph.length > 0) {
					glyph = glyph.charCodeAt(0); // use only first character
				} else {
					glyph = 0;
				}
			} else if (type === "number") {
				glyph = Math.floor(glyph);
				if (glyph < 1) {
					glyph = 0;
				}
			} else {
				return my._error(fn + "glyph argument invalid");
			}
		}

		return my._beadExec(fn, my._glyph, x, y, glyph);
	};

	// PS.glyphColor( x, y, p1, p2, p3 )

	my.PSInterface.prototype.glyphColor = function (x, y, p1, p2, p3) {
		var fn, colors;

		fn = "[PS.glyphColor] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 2, 5))
			return PS.ERROR;

		colors = my._decodeColors(fn, p1, p2, p3);
		if (colors === PS.ERROR) {
			return PS.ERROR;
		}

		return my._beadExec(fn, my._glyphColor, x, y, colors);
	};

	// PS.glyphAlpha( x, y, alpha )

	my.PSInterface.prototype.glyphAlpha = function (x, y, alpha_p) {
		var fn, args, alpha, type;

		fn = "[PS.glyphAlpha] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 2, 3))
			return PS.ERROR;

		alpha = alpha_p; // prevent arg mutation
		if (alpha !== PS.CURRENT) {
			type = my._typeOf(alpha);
			if (type === "undefined") {
				alpha = PS.CURRENT;
			} else if (type === "number") {
				alpha = Math.floor(alpha);
				if (alpha < 0) {
					alpha = 0;
				} else if (alpha > 255) {
					alpha = 255;
				}
			} else if (alpha === PS.DEFAULT) {
				alpha = my._DEFAULTS.bead.glyph.color.a;
			} else {
				return my._error(fn + "alpha argument invalid");
			}
		}

		return my._beadExec(fn, my._glyphAlpha, x, y, alpha);
	};

	// PS.glyphScale( x, y, scale )

	my.PSInterface.prototype.glyphScale = function (x, y, scale_p) {
		var fn, args, scale, type;

		fn = "[PS.glyphScale] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 2, 3))
			return PS.ERROR;

		scale = scale_p; // prevents arg mutation
		if (scale !== PS.CURRENT) {
			type = my._typeOf(scale);
			if (type === "undefined") {
				scale = PS.CURRENT;
			} else if (type === "number") {
				scale = Math.floor(scale);
				if (scale < 50) {
					scale = 50;
				} else if (scale > 100) {
					scale = 100;
				}
			} else if (scale === PS.DEFAULT) {
				scale = my._DEFAULTS.bead.glyph.scale;
			} else {
				return my._error(fn + "scale argument invalid");
			}
		}

		return my._beadExec(fn, my._glyphScale, x, y, scale);
	};

	// PS.glyphFade( rate, options )
	// Sets fade rate/options of glyph
	// Returns fade settings or PS.ERROR

	my.PSInterface.prototype.glyphFade = function (x, y, rate_p, options_p) {
		var fn, args, rate, type, options;

		fn = "[PS.glyphFade] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 2, 4))
			return PS.ERROR;

		rate = rate_p; // prevent arg mutation
		if ((rate !== PS.CURRENT) && (rate !== PS.DEFAULT)) {
			type = my._typeOf(rate);
			if (type === "undefined") {
				rate = PS.CURRENT;
			} else if (type === "number") {
				rate = Math.floor(rate);
				if (rate < 0) {
					rate = 0;
				}
			} else {
				return my._error(fn + "rate argument not a number");
			}
		}

		options = my._validFadeOptions(fn, options_p);
		if (options === PS.ERROR) {
			return PS.ERROR;
		}

		return my._beadExec(fn, my._glyphFade, x, y, rate, options);
	};

	//----------------------
	// STATUS LINE FUNCTIONS
	//----------------------

	my.PSInterface.prototype.statusText = function (strP) {
		var fn, str, type;

		fn = "[PS.statusText] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 0, 1))
			return PS.ERROR;

		str = strP; // prevent arg mutation
		type = my._typeOf(str);
		if ((str !== PS.CURRENT) && (type !== "undefined")) {
			if (str === PS.DEFAULT) {
				str = my._DEFAULTS.status.text;
			} else if (type !== "string") {
				str = str.toString();
			}

			my._statusOut(str);
		}

		return my._status.text;
	};

	my.PSInterface.prototype.statusInput = function (strP, exec) {
		var fn, type, str, len;

		fn = "[PS.statusInput] ";

		if (arguments.length !== 2) {
			return my._error(fn + "Expected 2 arguments");
		}

		if (typeof exec !== "function") {
			return my._error(fn + "2nd argument is not a function");
		}

		str = strP; // prevent arg mutation
		type = my._typeOf(str);
		if (type !== "string") {
			str = str.toString();
		}
		len = str.length;
		if (len > my._LABEL_MAX) // truncate if too long
		{
			str = str.substring(0, my._LABEL_MAX);
		}
		my._statusIn(str, exec);

		return my._status.label;
	};

	my.PSInterface.prototype.statusColor = function (p1, p2, p3) {
		var fn, colors, current, fader, rgb, r, g, b;

		fn = "[PS.statusColor] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 0, 3))
			return PS.ERROR;

		colors = my._decodeColors(fn, p1, p2, p3);
		if (colors === PS.ERROR) {
			return PS.ERROR;
		}

		current = my._status.color;
		fader = my._status.fader;

		if (PS.CURRENT === my._checkColors(colors, current, my._DEFAULTS.status.color))
			return current.rgb;

		// Only change color if different
		// But must also change if fader is active, start color is specified and doesn't match

		if ((current.rgb !== colors.rgb) || ((fader.rate > 0) && (fader.rgb !== null) && (fader.rgb !== colors.rgb))) {
			current.rgb = colors.rgb;

			r = colors.r;
			g = colors.g;
			b = colors.b;

			current.str = colors.str = my._RSTR[r] + my._GBSTR[g] + my._BASTR[b];

			if (fader.rate > 0) // must use fader
			{
				if (fader.rgb !== null) // use start color if specified
				{
					my._startFader(fader, fader.r, fader.g, fader.b, 255, r, g, b, 255);
				}
				if (!fader.active) {
					my._startFader(fader, current.r, current.g, current.b, 255, r, g, b, 255);
				} else // must recalculate active fader
				{
					my._recalcFader(fader, r, g, b, 255);
				}
			} else {
				my._statusRGB(current);
			}

			current.r = r;
			current.g = g;
			current.b = b;
		}

		return current.rgb;
	};

	my.PSInterface.prototype.statusFade = function (rate, options_p) {
		var fn, fader, color, orate, nrate, type, val, options;

		fn = "[PS.statusFade] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 0, 2))
			return PS.ERROR;

		color = my._status.color;
		fader = my._status.fader;
		orate = fader.rate;

		type = my._typeOf(rate);
		if ((type === "undefined") || (rate === PS.CURRENT)) {
			nrate = orate;
		} else if (rate === PS.DEFAULT) {
			nrate = my._DEFAULTS.fader.rate;
		} else if (type === "number") {
			nrate = Math.floor(rate);
			if (nrate < 0) {
				nrate = 0;
			}
		} else {
			return my._error(fn + "rate argument invalid");
		}

		options = my._validFadeOptions(fn, options_p);
		if (options === PS.ERROR) {
			return PS.ERROR;
		}

		val = options.rgb;
		if (val !== PS.CURRENT) {
			if (val === PS.DEFAULT) {
				fader.rgb = my._DEFAULTS.fader.rgb;
			} else {
				fader.rgb = val;
			}
			fader.r = options.r;
			fader.g = options.g;
			fader.b = options.b;
		}

		val = options.onStep;
		if (val !== PS.CURRENT) {
			if (val === PS.DEFAULT) {
				fader.onStep = my._DEFAULTS.fader.onStep;
			} else {
				fader.onStep = val;
			}
		}

		val = options.onEnd;
		if (val !== PS.CURRENT) {
			if (val === PS.DEFAULT) {
				fader.onEnd = my._DEFAULTS.fader.onEnd;
			} else {
				fader.onEnd = val;
			}
		}

		val = options.params;
		if (val !== PS.CURRENT) {
			if (val === PS.DEFAULT) {
				fader.params = my._DEFAULTS.fader.params;
			} else {
				fader.params = val;
			}
		}

		// Handle rate change

		if (orate !== nrate) {
			fader.rate = nrate;
			if (nrate < 1) {
				fader.active = false;
				fader.kill = true;
			} else if (fader.active) {
				my._recalcFader(fader, color.r, color.g, color.b, 255);
			}
		}

		return {
			rate: fader.rate,
			rgb: fader.rgb,
			onStep: fader.onStep,
			onEnd: fader.onEnd,
			params: fader.params
		};
	};

	// ---------------
	// TIMER FUNCTIONS
	// ---------------

	// PS.timerStart( ticks, exec, ... )
	// Execute a function [exec] after [ticks] 60ths of a second
	// Additional parameters are passed as arguments to the function
	// Returns id of timer

	my.PSInterface.prototype.timerStart = function (ticks_p, exec_p) {
		var fn, args, ticks, exec, type, obj, arglist, i, len, id;

		fn = "[PS.timerStart] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 2, 2))
			return PS.ERROR;

		// Prevent arg mutation

		ticks = ticks_p;
		exec = exec_p;

		// Check ticks param

		if (ticks === PS.DEFAULT) {
			ticks = 60;
		} else {
			type = my._typeOf(ticks);
			if (type !== "number") {
				return my._error(fn + "ticks argument invalid");
			}
			ticks = Math.floor(ticks);
			if (ticks < 1) {
				return my._error(fn + "ticks argument less than one (1)");
			}
		}

		// Check exec param

		if (typeof exec !== "function") {
			return my._error(fn + "exec argument not a function");
		}

		// Create an array of extra arguments

		arglist = [];
		if (args > 2) {
			len = args - 2;
			arglist.length = len;
			for (i = 0; i < len; i += 1) {
				arglist[i] = arguments[i + 2];
			}
		}

		// Create unique id

		id = my._TIMER_PREFIX + my._timerCnt;
		my._timerCnt += 1;

		// Add timer to queue

		obj = {
			id: id,
			delay: ticks,
			count: ticks,
			exec: exec,
			arglist: arglist
		};

		my._timers.push(obj);

		//  (fn + "id = " + id + "\n");

		return id;
	};

	// PS.timerStop( id )
	// Stops a timer matching [id]
	// Returns id or PS.ERROR

	my.PSInterface.prototype.timerStop = function (id) {
		var fn, args, i, len, timer;

		fn = "[PS.timerStop] ";

		// my.instance.debug(fn + "id = " + id + "\n");

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 1, 1))
			return PS.ERROR;

		// Check id param

		if ((typeof id !== "string") || (id.length < 1)) {
			return my._error(fn + "id argument invalid");
		}

		// Find and nuke timer

		len = my._timers.length;
		for (i = 0; i < len; i += 1) {
			timer = my._timers[i];
			if (timer.id === id) // found it!
			{
				my._timers.splice(i, 1);
				return id;
			}
		}

		return my._error(fn + "timer id '" + id + "' not found");
	};

	// -----------------
	// UTILITY FUNCTIONS
	// -----------------

	my.PSInterface.prototype.random = function (val_p) {
		var fn, val;

		fn = "[PS.random] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 1, 1))
			return PS.ERROR;

		val = val_p; // prevent arg mutation
		if (my._typeOf(val) !== "number") {
			return my._error(fn + "Argument not a number");
		}
		val = Math.floor(val);
		if (val < 2) {
			return 1;
		}

		val = Math.random() * val;
		val = Math.floor(val) + 1;
		return val;
	};

	my.PSInterface.prototype.makeRGB = function (r_p, g_p, b_p) {
		var fn, args, r, g, b;

		fn = "[PS.makeRGB] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 3, 3))
			return PS.ERROR;

		// Prevent arg mutation

		r = r_p;
		g = g_p;
		b = b_p;

		if (my._typeOf(r) !== "number") {
			return my._error(fn + "r argument not a number");
		}
		r = Math.floor(r);
		if (r < 0) {
			r = 0;
		} else if (r > 255) {
			r = 255;
		}

		if (my._typeOf(g) !== "number") {
			return my._error(fn + "g argument not a number");
		}
		g = Math.floor(g);
		if (g < 0) {
			g = 0;
		} else if (g > 255) {
			g = 255;
		}

		if (my._typeOf(b) !== "number") {
			return my._error(fn + "b argument not a number");
		}
		b = Math.floor(b);
		if (b < 0) {
			b = 0;
		} else if (b > 255) {
			b = 255;
		}

		return ((r * my._RSHIFT) + (g * my._GSHIFT) + b);
	};

	my.PSInterface.prototype.unmakeRGB = function (rgb_p, result_p) {
		var fn, args, rgb, result, red, green, blue, rval, gval, type;

		fn = "[PS.unmakeRGB] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 2, 2))
			return PS.ERROR;

		// Prevent arg mutation

		rgb = rgb_p;
		result = result_p;

		if (my._typeOf(rgb) !== "number") {
			return my._error(fn + "rgb argument not a number");
		}

		rgb = Math.floor(rgb);

		if (rgb < 1) // handle black
		{
			rgb = 0;
			red = 0;
			green = 0;
			blue = 0;
		} else if (rgb >= 0xFFFFFF) // handle white
		{
			rgb = 0xFFFFFF;
			red = 255;
			green = 255;
			blue = 255;
		} else {
			red = rgb / my._RSHIFT;
			red = Math.floor(red);
			rval = red * my._RSHIFT;

			green = (rgb - rval) / my._GSHIFT;
			green = Math.floor(green);
			gval = green * my._GSHIFT;

			blue = rgb - rval - gval;
		}

		type = my._typeOf(result);
		if (type === "object") {
			result.rgb = rgb;
			result.r = red;
			result.g = green;
			result.b = blue;
		} else if (type === "array") {
			if (result.length < 3) {
				result.length = 3;
			}
			result[0] = red;
			result[1] = green;
			result[2] = blue;
		} else {
			return my._error(fn + "result argument not an array or object reference");
		}

		return result;
	};

	// PS.applyRect()
	// Apply a function to a rectangular region of beads
	// [left, top, width, height] define a region inside the grid
	// [exec] is a function to be called on each bead
	// Arguments supplied after [exec] are passed as parameters to [exec]

	my.PSInterface.prototype.applyRect = function (left_p, top_p, width_p, height_p, exec_p) {
		var fn, args, xmax, ymax, left, top, width, height, exec, right, bottom, x, y, result, arglist, len, i;

		fn = "[PS.applyRect] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 5, 5))
			return PS.ERROR;

		xmax = my._grid.x;
		ymax = my._grid.y;

		// Prevent arg mutation

		left = left_p;
		top = top_p;
		width = width_p;
		height = height_p;
		exec = exec_p;

		// Check coordinates

		// Left

		if (left === PS.DEFAULT) {
			left = 0;
		} else if (my._typeOf(left) === "number") {
			left = Math.floor(left);
			if (left >= xmax) {
				return PS.DONE;
			}
			if (left < 0) {
				left = 0;
			}
		} else {
			return my._error(fn + "left argument invalid");
		}

		// Top

		if (top === PS.DEFAULT) {
			top = 0;
		} else if (my._typeOf(top) === "number") {
			top = Math.floor(top);
			if (top >= ymax) {
				return PS.DONE;
			}
			if (top < 0) {
				top = 0;
			}
		} else {
			return my._error(fn + "top argument invalid");
		}

		// Width

		if (width === PS.DEFAULT) {
			width = xmax - left;
		} else if (my._typeOf(width) === "number") {
			width = Math.floor(width);
			if (width < 1) {
				return PS.DONE;
			}
			if ((left + width) > xmax) {
				width = xmax - left;
			}
		} else {
			return my._error(fn + "width argument invalid");
		}

		right = left + width;

		// Height

		if (height === PS.DEFAULT) {
			height = ymax - top;
		} else if (my._typeOf(height) === "number") {
			height = Math.floor(height);
			if (height < 1) {
				return PS.DONE;
			}
			if ((top + height) > ymax) {
				height = ymax - top;
			}
		} else {
			return my._error(fn + "height argument invalid");
		}

		bottom = top + height;

		// Check function

		if (!exec || (typeof exec !== "function")) {
			return my._error(fn + "exec argument not a function");
		}

		// Create an array of arguments
		// First two elements reserved for x/y

		arglist = [0, 0];
		if (args > 5) {
			len = args - 5;
			for (i = 0; i < len; i += 1) {
				arglist.push(arguments[i + 5]);
			}
		}

		// Apply [exec] to designated beads

		for (y = top; y < bottom; y += 1) {
			arglist[1] = y;
			for (x = left; x < right; x += 1) {
				arglist[0] = x;
				try {
					result = exec.apply(my._EMPTY, arglist);
				} catch (err) {
					result = my._errorCatch(fn + "exec failed @" + x + ", " + y + " [" + err.message + "]", err);
				}

				if (result === PS.ERROR) {
					return PS.ERROR;
				}
			}
		}

		return result;
	};

	// PS.hex ( val, padding )
	// Converts a number to a hex string with optional padding
	// Returns string or PS.ERROR

	my.PSInterface.prototype.hex = function (val_p, padding_p) {
		var fn, val, type, padding, hex;

		fn = "[PS.hex] ";

		val = val_p; // avoid arg mutation
		type = my._typeOf(val);
		if (type !== "number") {
			return my._error(fn + "value argument invalid");
		}

		// Floor and convert to absolute value

		val = Math.floor(val);
		val = Math.abs(val);

		padding = padding_p; // avoid arg mutation
		type = my._typeOf(padding);
		if ((type === "undefined") || (padding === PS.DEFAULT)) {
			padding = 2;
		} else if (type === "number") {
			padding = Math.floor(padding);
			if (padding < 1) {
				padding = 1;
			}
		} else {
			return my._error(fn + "padding argument invalid");
		}

		hex = Number(val).toString(16);

		while (hex.length < padding) {
			hex = "0" + hex;
		}

		return ("0x" + hex);
	};

	// PS.keyRepeat ( repeat, init, delay )
	// Controls keyboard repeat parameters
	// [repeat] = true to enable repeats, false to disable, default = true
	// [init] = initial delay before first repeat, default = 30 (1/2 sec)
	// [delay] = delay between repeats, default = 6 (1/10 sec)
	// Returns object with settings or PS.ERROR

	my.PSInterface.prototype.keyRepeat = function (repeat_p, init_p, delay_p) {
		var fn, type, repeat, delay, init;

		fn = "[PS.keyRepeat] ";

		// verify repeat argument

		repeat = my._isBoolean(repeat_p, my._keyRepeat, true, true);
		if (repeat === PS.ERROR) {
			return my._error(fn + "repeat argument invalid");
		}

		// Verify init argument

		init = init_p; // avoid arg mutation
		type = my._typeOf(init);
		if ((type === "undefined") || (init === PS.DEFAULT)) {
			init = my._DEFAULT_KEY_DELAY * 5;
		} else if (init === PS.CURRENT) {
			init = my._keyInitRate;
		} else if (type === "number") {
			init = Math.floor(init);
			if (init < 1) {
				init = 1;
			}
		} else {
			return my._error(fn + "init argument invalid");
		}

		// Verify delay argument

		delay = delay_p; // avoid arg mutation
		type = my._typeOf(delay);
		if ((type === "undefined") || (delay === PS.DEFAULT)) {
			delay = my._DEFAULT_KEY_DELAY;
		} else if (delay === PS.CURRENT) {
			delay = my._keyDelayRate;
		} else if (type === "number") {
			delay = Math.floor(delay);
			if (delay < 1) {
				delay = 1;
			}
		} else {
			return my._error(fn + "delay argument invalid");
		}

		my._keyRepeat = repeat;
		my._keyInitRate = init;
		my._keyDelayRate = delay;

		return {
			repeat: my._keyRepeat,
			init: my._keyInitRate,
			delay: my._keyDelayRate
		};
	};

	// ---------
	// IMAGE API
	// ---------

	my.PSInterface.prototype.imageLoad = function (filenameP, execP, formatP) {
		var fn, args, filename, exec, format, ext, image, id, type;

		fn = "[PS.imageLoad] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 2, 3))
			return PS.ERROR;

		// Prevent arg mutation

		filename = filenameP;
		exec = execP;
		format = formatP;

		// Validate filename

		if ((typeof filename !== "string") || (filename.length < 1)) {
			return my._error(fn + "filename argument invalid");
		}

		// check for a valid file extension

		ext = filename.substr(filename.lastIndexOf('.') + 1);
		ext = ext.toLowerCase();
		if ((ext !== "png") && (ext !== "jpg") && (ext !== "jpeg") && (ext !== "bmp")) {
			return my._error(fn + "filename extension invalid");
		}

		// Validate exec

		if (typeof exec !== "function") {
			return my._error(fn + "exec argument invalid");
		}

		type = my._typeOf(format);
		if ((type === "undefined") || (format === PS.DEFAULT)) {
			format = 4;
		} else {
			if (type !== "number") {
				return my._error(fn + "format argument invalid");
			}
			format = Math.floor(format);
			if ((format < 1) && (format > 4)) {
				return my._error(fn + "format argument is not 1, 2, 3 or 4");
			}
		}

		// save a record with the user function, id and alpha preference

		id = my._IMAGE_PREFIX + my._imageCnt; // a unique ID
		my._imageCnt += 1;
		my._imageList.push({
			source: filename,
			id: id,
			exec: exec,
			format: format
		});

		try {
			image = new Image();
			image.setAttribute("data-id", id); // store the id
			image.onload = function () {
				my._imageLoad(image);
			};
			image.onerror = function () {
				my._imageError(image);
			};
			image.src = filename; // load it!
		} catch (err) {
			return my._errorCatch(fn + "Error loading " + filename + " [" + err.message + "]", err);
		}

		return id;
	};

	// Blit an image to the grid at [xpos, ypos]
	// Optional [region] specifies region of blit
	// Return true if any part of image was drawn, false if none of image was drawn, or PS.ERROR

	my.PSInterface.prototype.imageBlit = function (imageP, xposP, yposP, regionP) {
		var fn, args, xmax, ymax, image, xpos, ypos, region, w, h, format, data, type, top, left, width, height, plane,
			val, wsize, rowptr, ptr, drawx, drawy, y, x, r, g, b, a, rgb, rval, gval, i, bead, color, any;

		fn = "[PS.imageBlit] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 3, 4))
			return PS.ERROR;

		xmax = my._grid.x;
		ymax = my._grid.y;

		// Prevent arg mutation

		image = imageP;
		xpos = xposP;
		ypos = yposP;
		region = regionP;

		if (my._validImage(fn, image) === PS.ERROR) {
			return PS.ERROR;
		}

		w = image.width;
		h = image.height;
		format = image.pixelSize;
		data = image.data;

		// Validate xpos

		type = my._typeOf(xpos);
		if ((type === "undefined") || (xpos === PS.DEFAULT)) {
			xpos = 0;
		} else if (type === "number") {
			xpos = Math.floor(xpos);
		} else {
			return my._error(fn + "xpos argument invalid");
		}

		// Validate ypos

		type = my._typeOf(ypos);
		if ((type === "undefined") || (ypos === PS.DEFAULT)) {
			ypos = 0;
		} else if (type === "number") {
			ypos = Math.floor(ypos);
		} else {
			return my._error(fn + "ypos argument invalid");
		}

		// If drawing is obviously offgrid, exit now

		if ((xpos >= xmax) || (ypos >= ymax) || ((xpos + w) < 1) || ((ypos + h) < 1)) {
			return false;
		}

		// Validate region

		type = my._typeOf(region);
		if ((type === "undefined") || (region === PS.DEFAULT)) {
			top = 0;
			left = 0;
			width = w;
			height = h;
		} else if (type === "object") {
			// check region.left

			left = region.left;
			type = my._typeOf(left);
			if ((type === "undefined") || (left === PS.DEFAULT)) {
				left = 0;
			} else {
				if (type !== "number") {
					return my._error(fn + "region.left invalid");
				}
				left = Math.floor(left);
				if (left < 0) {
					left = 0;
				} else if (left >= w) {
					return my._error(fn + "region.left outside image");
				}
			}

			// check region.top

			top = region.top;
			type = my._typeOf(top);
			if ((type === "undefined") || (top === PS.DEFAULT)) {
				top = 0;
			} else {
				if (type !== "number") {
					return my._error(fn + "region.top invalid");
				}
				top = Math.floor(top);
				if (top < 0) {
					top = 0;
				} else if (top >= h) {
					return my._error(fn + "region.top outside image");
				}
			}

			// check region.width

			width = region.width;
			type = my._typeOf(width);
			if ((type === "undefined") || (width === PS.DEFAULT)) {
				width = w - left;
			} else {
				if (type !== "number") {
					return my._error(fn + "region.width invalid");
				}
				width = Math.floor(width);
				if (width < 1) {
					return false;
				}
				if ((left + width) > w) {
					width = w - left;
				}
			}

			// exit now if off grid

			if ((xpos + width) < 1) {
				return false;
			}

			// check region.height

			height = region.height;
			type = my._typeOf(height);
			if ((type === "undefined") || (height === PS.DEFAULT)) {
				height = h - top;
			} else {
				if (type !== "number") {
					return my._error(fn + "region.height invalid");
				}
				height = Math.floor(height);
				if (height < 1) {
					return false;
				}
				if ((top + height) > h) {
					height = h - top;
				}
			}

			// exit now if off grid

			if ((ypos + height) < 1) {
				return false;
			}
		} else {
			return my._error(fn + "region argument invalid");
		}

		// adjust blitted width and height so only visible portion gets drawn

		// Cut off left edge if offgrid

		if (xpos < 0) {
			width += xpos; // reduce width (remember, xpos is NEGATIVE!)
			if (width < 1) {
				return false;
			}
			left -= xpos; // move left corner over
			xpos = 0;
		}

		// Cut off right edge if offgrid

		val = xpos + width;
		if (val > xmax) {
			width = xmax - xpos;
		}

		if (width < 1) {
			return false;
		}

		// Cut off top edge ff offgrid

		if (ypos < 0) {
			height += ypos; // reduce height (remember, ypos is NEGATIVE!)
			if (height < 1) {
				return false;
			}
			top -= ypos; // move top corner down
			ypos = 0;
		}

		// Cut off bottom edge if offgrid

		val = ypos + height;
		if (val > ymax) {
			height = ymax - ypos;
		}

		if (height < 1) {
			return false;
		}

		wsize = (w * format); // size of each image row (calc only once)
		any = false;
		a = 255; // assume default alpha
		plane = my._grid.plane;

		// create pointer to TL corner of image data

		rowptr = (top * wsize) + (left * format);
		drawy = ypos;
		for (y = 0; y < height; y += 1) {
			ptr = rowptr; // set data pointer to start of row
			drawx = xpos;
			for (x = 0; x < width; x += 1) {
				i = drawx + (drawy * xmax); // get index of bead
				bead = my._beads[i];
				if (bead.active) {
					any = true;

					// handle multiplexed rgb

					if (format < 3) // formats 1 and 2
					{
						rgb = data[ptr];

						// decode multiplex

						r = rgb / my._RSHIFT;
						r = Math.floor(r);
						rval = r * my._RSHIFT;

						g = (rgb - rval) / my._GSHIFT;
						g = Math.floor(g);
						gval = g * my._GSHIFT;

						b = rgb - rval - gval;

						if (format === 2) {
							a = data[ptr + 1];
						}
					}

					// handle r g b (a)
					else // formats 3 and 4
					{
						r = data[ptr];
						g = data[ptr + 1];
						b = data[ptr + 2];
						rgb = (r * my._RSHIFT) + (g * my._GSHIFT) + b;
						if (format === 4) {
							a = data[ptr + 3];
						}
					}

					// rgb, r, g, b and a are now determined

					color = my._colorPlane(bead, plane);
					color.r = r;
					color.g = g;
					color.b = b;
					color.a = a;
					color.rgb = rgb;
					my._recolor(bead);
				}

				drawx += 1;
				ptr += format;
			}
			drawy += 1;
			rowptr += wsize; // point to start of next row
		}

		if (any) {
			my._gridDraw();
		}
		return true;
	};

	// Create an image object from the grid
	// Optional [format] specifies region

	my.PSInterface.prototype.imageCapture = function (formatP, regionP) {
		var fn, args, format, region, type, w, h, data, top, left, width, height, total, output,
			right, bottom, id, cnt, x, y, i, bead, color;

		fn = "[PS.imageCapture] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 0, 2))
			return PS.ERROR;

		// Prevent arg mutation

		format = formatP;
		region = regionP;

		type = my._typeOf(format);
		if ((type === "undefined") || (format === PS.DEFAULT)) {
			format = 3;
		} else {
			if (type !== "number") {
				return my._error(fn + "format argument invalid");
			}
			format = Math.floor(format);
			if ((format < 1) && (format > 4)) {
				return my._error(fn + "format argument is not 1, 2, 3 or 4");
			}
		}

		w = my._grid.x;
		h = my._grid.y;

		// Validate region

		type = my._typeOf(region);
		if ((type === "undefined") || (region === PS.DEFAULT)) {
			top = 0;
			left = 0;
			width = w;
			height = h;
		} else if (type === "object") {
			// check region.left

			left = region.left;
			type = my._typeOf(left);
			if ((type === "undefined") || (left === PS.DEFAULT)) {
				left = 0;
			} else {
				if (type !== "number") {
					return my._error(fn + "region.left not a number");
				}
				left = Math.floor(left);
				if (left < 0) {
					left = 0;
				} else if (left >= w) {
					return my._error(fn + "region.left outside grid");
				}
			}

			// check region.top

			top = region.top;
			type = my._typeOf(top);
			if ((type === "undefined") || (top === PS.DEFAULT)) {
				top = 0;
			} else {
				if (type !== "number") {
					return my._error(fn + "region.top not a number");
				}
				top = Math.floor(top);
				if (top < 0) {
					top = 0;
				} else if (top >= h) {
					return my._error(fn + "region.top outside grid");
				}
			}

			// check region.width

			width = region.width;
			type = my._typeOf(width);
			if ((type === "undefined") || (width === PS.DEFAULT)) {
				width = w - left;
			} else {
				if (type !== "number") {
					return my._error(fn + "region.width not a number");
				}
				width = Math.floor(width);
				if ((width < 1) || ((left + width) > w)) {
					width = w - left;
				}
			}

			// check region.height

			height = region.height;
			type = my._typeOf(height);
			if ((type === "undefined") || (height === PS.DEFAULT)) {
				height = h - top;
			} else {
				if (type !== "number") {
					return my._error(fn + "region.height not a number");
				}
				height = Math.floor(height);
				if ((height < 1) || ((top + height) > h)) {
					height = h - top;
				}
			}
		} else {
			return my._error(fn + "region argument invalid");
		}

		// Init image

		id = my._IMAGE_PREFIX + my._imageCnt; // a unique ID
		my._imageCnt += 1;

		output = {
			source: PS.GRID,
			id: id,
			width: width,
			height: height,
			pixelSize: format,
			valid: true,
			data: []
		};

		// If no data, return empty data

		total = width * height;
		if (total < 1) {
			return output;
		}

		// presize the output array

		data = output.data;
		data.length = total * format;

		right = left + width;
		bottom = top + height;
		cnt = 0;

		for (y = top; y < bottom; y += 1) {
			for (x = left; x < right; x += 1) {
				i = x + (y * w); // get index of bead
				bead = my._beads[i];
				color = bead.color; // uses the current effective color
				if (format < 3) // format 1 & 2
				{
					data[cnt] = color.rgb;
					if (format === 2) {
						data[cnt + 1] = color.a;
					}
				} else // format 3 & 4
				{
					data[cnt] = color.r;
					data[cnt + 1] = color.g;
					data[cnt + 2] = color.b;
					if (format === 4) {
						data[cnt + 3] = color.a;
					}
				}
				cnt += format;
			}
		}

		return output;
	};

	// Dump a Javascript text representation of an image to the debugger
	// Optional [coords] specify region of dump

	my.PSInterface.prototype.imageDump = function (imageP, regionP, formatP, linelenP, hexP) {
		var fn, args, image, region, format, linelen, hex, w, h, psize, data, type, top, left, width, height,
			total, str, wsize, pcnt, done, a, rowptr, ptr, y, x, r, g, b, rgb, rval, gval;

		fn = "[PS.imageDump] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 1, 5))
			return PS.ERROR;

		// Prevent arg mutation

		image = imageP;
		region = regionP;
		format = formatP;
		linelen = linelenP;

		// Validate image

		if (my._validImage(fn, image) === PS.ERROR) {
			return PS.ERROR;
		}

		w = image.width;
		h = image.height;
		psize = image.pixelSize;
		data = image.data;

		// Validate region

		type = my._typeOf(region);
		if ((type === "undefined") || (region === PS.DEFAULT)) {
			top = 0;
			left = 0;
			width = w;
			height = h;
		} else if (type === "object") {
			// check region.left

			left = region.left;
			type = my._typeOf(left);
			if ((type === "undefined") || (left === PS.DEFAULT)) {
				left = 0;
			} else {
				if (type !== "number") {
					return my._error(fn + "region.left invalid");
				}
				left = Math.floor(left);
				if (left < 0) {
					left = 0;
				} else if (left >= w) {
					return my._error(fn + "region.left outside grid");
				}
			}

			// check region.top

			top = region.top;
			type = my._typeOf(top);
			if ((type === "undefined") || (top === PS.DEFAULT)) {
				top = 0;
			} else {
				if (type !== "number") {
					return my._error(fn + "region.top invalid");
				}
				top = Math.floor(top);
				if (top < 0) {
					top = 0;
				} else if (top >= h) {
					return my._error(fn + "region.top outside grid");
				}
			}

			// check region.width

			width = region.width;
			type = my._typeOf(width);
			if ((type === "undefined") || (width === PS.DEFAULT)) {
				width = w - left;
			} else {
				if (type !== "number") {
					return my._error(fn + "region.width invalid");
				}
				width = Math.floor(width);
				if ((width < 1) || ((left + width) > w)) {
					width = w - left;
				}
			}

			// check region.height

			height = region.height;
			type = my._typeOf(height);
			if ((type === "undefined") || (height === PS.DEFAULT)) {
				height = h - top;
			} else {
				if (type !== "number") {
					return my._error(fn + "region.height invalid");
				}
				height = Math.floor(height);
				if ((height < 1) || ((top + height) > h)) {
					height = h - top;
				}
			}
		} else {
			return my._error(fn + "region argument invalid");
		}

		total = width * height;

		// Validate format

		type = my._typeOf(format);
		if ((type === "undefined") || (format === PS.DEFAULT)) {
			format = psize; // use format of source image by default
		} else {
			if (type !== "number") {
				return my._error(fn + "format argument invalid");
			}
			format = Math.floor(format);
			if ((format < 1) || (format > 4)) {
				return my._error(fn + "format argument is not 1, 2, 3 or 4");
			}
		}

		// Validate linelen

		type = my._typeOf(linelen);
		if ((type === "undefined") || (linelen === PS.DEFAULT)) {
			linelen = width;
		} else {
			if (type !== "number") {
				return my._error(fn + "length argument invalid");
			}
			linelen = Math.floor(linelen);
			if (linelen < 1) {
				linelen = 1;
			}
			if (linelen > total) {
				linelen = total;
			}
		}

		// Validate hex

		hex = my._isBoolean(hexP, PS.ERROR, true, true);
		if (hex === PS.ERROR) {
			return my._error(fn + "hex argument invalid");
		}

		// Init output string

		str = "\nvar myImage = {\n\twidth : " + width + ", height : " + height + ", pixelSize : " + format + ",\n\tdata : [";

		// If no data, return empty

		if (total < 1) {
			str += "]\n};\n";
			my.instance.debug(str);
			return PS.DONE;
		}

		str += "\n\t"; // start of first pixel line
		a = 255; // default alpha
		done = pcnt = 0;

		// create pointer to TL corner of image data

		wsize = (w * psize); // size of each image row (calc only once)
		rowptr = (top * wsize) + (left * psize);
		for (y = 0; y < height; y += 1) {
			ptr = rowptr; // set data pointer to start of row
			for (x = 0; x < width; x += 1) {
				// handle multiplexed rgb

				if (psize < 3) {
					rgb = data[ptr];

					// decode multiplex

					if (rgb < 1) {
						r = g = b = 0;
					} else if (rgb >= 0xFFFFFF) {
						r = g = b = 255;
					} else {
						r = rgb / my._RSHIFT;
						r = Math.floor(r);
						rval = r * my._RSHIFT;

						g = (rgb - rval) / my._GSHIFT;
						g = Math.floor(g);
						gval = g * my._GSHIFT;

						b = rgb - rval - gval;
					}

					if (psize === 2) {
						a = data[ptr + 1];
					}
				} else {
					r = data[ptr];
					g = data[ptr + 1];
					b = data[ptr + 2];
					rgb = (r * my._RSHIFT) + (g * my._GSHIFT) + b;
					if (psize === 4) {
						a = data[ptr + 3];
					}
				}

				str += my._outputPixel(format, hex, rgb, r, g, b, a);

				done += 1;
				if (done < total) {
					str += ",";
					pcnt += 1;
					if (pcnt < linelen) // continue this line
					{
						str += " ";
					} else // start next line
					{
						pcnt = 0;
						str += "\n\t";
					}
				}

				ptr += psize;
			}

			rowptr += wsize; // point to start of next row
		}

		str += "\n\t]\n};\n"; // end the string

		my.instance.debug(str);

		return PS.DONE;
	};

	// ----------
	// SPRITE API
	// ----------

	// PS.spriteSolid( image, region )
	// Create a solid sprite of specified dimensions

	my.PSInterface.prototype.spriteSolid = function (widthP, heightP) {
		var fn, args, width, height, s;

		fn = "[PS.spriteSolid] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 2, 2))
			return PS.ERROR;

		// Prevent arg mutation

		width = widthP;
		height = heightP;

		// Check width

		if (width === PS.DEFAULT) {
			width = 1;
		} else if (my._typeOf(width) === "number") {
			width = Math.floor(width);
			if (width < 1) {
				width = 1;
			}
		} else {
			return my._error(fn + "width argument invalid");
		}

		// Check height

		if (height === PS.DEFAULT) {
			height = 1;
		} else if (my._typeOf(height) === "number") {
			height = Math.floor(height);
			if (height < 1) {
				height = 1;
			}
		} else {
			return my._error(fn + "height argument invalid");
		}

		s = my._newSprite();
		s.width = width;
		s.height = height;
		s.color = {
			rgb: 0,
			r: 0,
			g: 0,
			b: 0,
			a: 255
		};

		return s.id;
	};

	// PS.spriteSolidColor ( sprite, color )
	// Sets color of a solid sprite

	my.PSInterface.prototype.spriteSolidColor = function (sprite, p1, p2, p3) {
		var fn, args, s, colors, current, rgb, r, g, b;

		fn = "[PS.spriteSolidColor] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 1, 4))
			return PS.ERROR;

		s = my._getSprite(sprite, fn);
		if (s === PS.ERROR) {
			return PS.ERROR;
		}

		current = s.color;
		if (!current) {
			return my._error(fn + "Cannot set color of image sprite " + s.id);
		}

		colors = my._decodeColors(fn, p1, p2, p3);
		if (colors === PS.ERROR) {
			return PS.ERROR;
		}

		rgb = colors.rgb;
		if (rgb !== PS.CURRENT) {
			if (rgb === null) // must inspect r/g/b values
			{
				r = colors.r;
				if (r === PS.CURRENT) {
					colors.r = r = current.r;
				} else if (r === PS.DEFAULT) {
					colors.r = r = 0;
				}

				g = colors.g;
				if (g === PS.CURRENT) {
					colors.g = g = current.g;
				} else if (g === PS.DEFAULT) {
					colors.g = g = 0;
				}

				b = colors.b;
				if (b === PS.CURRENT) {
					colors.b = b = current.b;
				} else if (b === PS.DEFAULT) {
					colors.b = b = 0;
				}

				colors.rgb = rgb = (r * my._RSHIFT) + (g * my._GSHIFT) + b;
			} else if (rgb === PS.DEFAULT) {
				colors.rgb = rgb = 0;
				colors.r = 0;
				colors.g = 0;
				colors.b = 0;
			}

			// only change color if necessary

			if (current.rgb !== rgb) {
				current.rgb = rgb;
				current.r = colors.r;
				current.g = colors.g;
				current.b = colors.b;

				if (s.visible && s.placed) {
					my._drawSprite(s);
					my._gridDraw();
				}
			}
		}

		return current.rgb;
	};

	// PS.spriteSolidAlpha ( sprite, alpha )
	// Sets alpha of a solid sprite

	my.PSInterface.prototype.spriteSolidAlpha = function (spriteP, alphaP) {
		var fn, args, sprite, alpha, s, current, type;

		fn = "[PS.spriteSolidAlpha] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 1, 2))
			return PS.ERROR;

		// Prevent arg mutation

		sprite = spriteP;
		alpha = alphaP;

		s = my._getSprite(sprite, fn);
		if (s === PS.ERROR) {
			return PS.ERROR;
		}

		current = s.color;
		if (!current) {
			return my._error(fn + "Cannot set alpha of image sprite " + s.id);
		}

		type = my._typeOf(alpha);
		if ((type !== "undefined") && (alpha !== PS.CURRENT)) {
			if (alpha === PS.DEFAULT) {
				alpha = 255;
			} else if (type === "number") {
				alpha = Math.floor(alpha);
				if (alpha < 0) {
					alpha = 0;
				} else if (alpha > 255) {
					alpha = 255;
				}
			} else {
				return my._error(fn + "alpha argument invalid");
			}

			if (current.a !== alpha) {
				current.a = alpha;
				if (s.visible && s.placed) {
					my._drawSprite(s);
					my._gridDraw();
				}
			}
		}

		return current.a;
	};

	// PS.spriteImage( image, region )
	// Create a sprite from an image with optional subregion
	// Makes a private format 4 reference image

	my.PSInterface.prototype.spriteImage = function (image, region) {
		var fn, args, w, h, format, data, type, top, left, width, height, ndata, wsize, rowptr, ptr, x, y, i, rgb, r, g, b, a, rval, gval, s;

		fn = "[PS.spriteImage] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 1, 2))
			return PS.ERROR;

		// Validate image

		if (my._validImage(fn, image) === PS.ERROR) {
			return PS.ERROR;
		}

		left = top = 0;
		width = w = image.width;
		height = h = image.height;
		format = image.pixelSize;
		data = image.data;

		// Validate region

		type = my._typeOf(region);
		if ((type !== "undefined") && (region !== PS.DEFAULT)) {
			if (type !== "object") {
				return my._error(fn + "region argument invalid");
			}

			// Check region.left

			left = region.left;
			type = my._typeOf(left);
			if ((type === "undefined") || (left === PS.DEFAULT)) {
				left = 0;
			} else {
				if (type !== "number") {
					return my._error(fn + "region.left invalid");
				}
				left = Math.floor(left);
				if (left < 0) {
					left = 0;
				} else if (left >= w) {
					return my._error(fn + "region.left outside image");
				}
			}

			// check region.top

			top = region.top;
			type = my._typeOf(top);
			if ((type === "undefined") || (top === PS.DEFAULT)) {
				top = 0;
			} else {
				if (type !== "number") {
					return my._error(fn + "region.top invalid");
				}
				top = Math.floor(top);
				if (top < 0) {
					top = 0;
				} else if (top >= h) {
					return my._error(fn + "region.top outside image");
				}
			}

			// check region.width

			width = region.width;
			type = my._typeOf(width);
			if ((type === "undefined") || (width === PS.DEFAULT)) {
				width = w - left;
			} else {
				if (type !== "number") {
					return my._error(fn + "region.width invalid");
				}
				width = Math.floor(width);
				if ((width < 1) || ((left + width) > w)) {
					width = w - left;
				}
			}

			// check region.height

			height = region.height;
			type = my._typeOf(height);
			if ((type === "undefined") || (height === PS.DEFAULT)) {
				height = h - top;
			} else {
				if (type !== "number") {
					return my._error(fn + "region.height invalid");
				}
				height = Math.floor(height);
				if ((height < 1) || ((top + height) > h)) {
					height = h - top;
				}
			}
		}

		// Create a new format 4 reference image

		ndata = [];
		ndata.length = width * height * 4;

		a = 255;

		wsize = (w * format); // size of each image row (calc only once)
		rowptr = (top * wsize) + (left * format); // pointer to TL corner of image data
		i = 0;
		for (y = 0; y < height; y += 1) {
			ptr = rowptr; // set data pointer to start of row
			for (x = 0; x < width; x += 1) {
				if (format < 3) {
					rgb = data[ptr];

					if (rgb < 1) // handle black
					{
						rgb = r = g = b = 0;
					} else if (rgb >= 0xFFFFFF) // handle white
					{
						rgb = 0xFFFFFF;
						r = g = b = 255;
					} else {
						r = rgb / my._RSHIFT;
						r = Math.floor(r);
						rval = r * my._RSHIFT;

						g = (rgb - rval) / my._GSHIFT;
						g = Math.floor(g);
						gval = g * my._GSHIFT;

						b = rgb - rval - gval;
					}

					if (format === 2) {
						a = data[ptr + 1];
					}
				} else {
					r = data[ptr];
					g = data[ptr + 1];
					b = data[ptr + 2];
					if (format === 4) {
						a = data[ptr + 3];
					}
				}

				ndata[i] = r;
				ndata[i + 1] = g;
				ndata[i + 2] = b;
				ndata[i + 3] = a;

				ptr += format;
				i += 4;
			}
			rowptr += wsize; // point to start of next row
		}

		s = my._newSprite();
		s.width = width;
		s.height = height;
		s.image = {
			id: my._IMAGE_PREFIX + my._imageCnt, // unique id
			width: width,
			height: height,
			pixelSize: 4,
			data: ndata
		};

		my._imageCnt += 1;

		// PS.imageDump( s.image );

		return s.id;
	};

	// PS.spriteShow( sprite, show )
	// Toggles visibility of a sprite

	my.PSInterface.prototype.spriteShow = function (spriteP, showP) {
		var fn, args, sprite, show, s;

		fn = "[PS.spriteShow] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 1, 2))
			return PS.ERROR;

		// Prevent arg mutation

		sprite = spriteP;
		s = my._getSprite(sprite, fn);
		if (s === PS.ERROR) {
			return PS.ERROR;
		}

		// Validate show

		show = my._isBoolean(showP, PS.CURRENT, true, PS.CURRENT);
		if (show === PS.ERROR) {
			return my._error(fn + "show argument invalid");
		}

		// Only change if needed

		if (show !== PS.CURRENT) {
			if (s.visible !== show) {
				s.visible = show;
				if (s.placed) {
					if (show) {
						my._drawSprite(s);
						my._collisionCheck(s, sprite);
					} else {
						my._eraseSprite(s);
					}
					my._gridDraw();
				}
			}
		}

		return s.visible;
	};

	// PS.spriteAxis( sprite, x, y )
	// Sets/inspects positional axis of sprite

	my.PSInterface.prototype.spriteAxis = function (spriteP, xP, yP) {
		var fn, args, sprite, x, y, s, type;

		fn = "[PS.spriteAxis] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 1, 3))
			return PS.ERROR;

		// Prevent arg mutation

		sprite = spriteP;
		x = xP;
		y = yP;

		s = my._getSprite(sprite, fn);
		if (s === PS.ERROR) {
			return PS.ERROR;
		}

		// Validate x

		type = my._typeOf(x);
		if ((type === "undefined") || (x === PS.CURRENT)) {
			x = s.ax;
		} else if (x === PS.DEFAULT) {
			x = 0;
		} else if (type === "number") {
			x = Math.floor(x);
		} else {
			return my._error(fn + "x argument invalid");
		}

		// Validate y

		type = my._typeOf(y);
		if ((type === "undefined") || (y === PS.CURRENT)) {
			y = s.ay;
		} else if (y === PS.DEFAULT) {
			y = 0;
		} else if (type === "number") {
			y = Math.floor(y);
		} else {
			return my._error(fn + "y argument invalid");
		}

		// Either axis changing?

		if ((x !== s.ax) || (y !== s.ay)) {
			s.ax = x;
			s.ay = y;

			if (s.visible && s.placed) {
				my._drawSprite(s);
				my._collisionCheck(s, sprite);
				my._gridDraw();
			}
		}

		return {
			x: s.ax,
			y: s.ay
		};

	};

	// PS.spritePlane( sprite, plane )
	// Sets/inspects sprite plane

	my.PSInterface.prototype.spritePlane = function (spriteP, planeP) {
		var fn, args, sprite, plane, s, type;

		fn = "[PS.spritePlane] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 1, 2))
			return PS.ERROR;

		// Prevent arg mutation

		sprite = spriteP;
		plane = planeP;

		s = my._getSprite(sprite, fn);
		if (s === PS.ERROR) {
			return PS.ERROR;
		}

		// Validate plane

		type = my._typeOf(plane);
		if ((type !== "undefined") && (plane !== PS.CURRENT)) {
			if (plane === PS.DEFAULT) {
				plane = 0;
			} else if (type === "number") {
				plane = Math.floor(plane);
				if (plane < 1) {
					plane = 0;
				}
			} else {
				return my._error(fn + "plane argument invalid");
			}

			// Plane changing? No collision check needed here

			if (s.plane !== plane) {
				// Erase on current plane

				if (s.visible && s.placed) {
					my._eraseSprite(s);
				}

				s.plane = plane;

				// Redraw on new plane

				if (s.visible && s.placed) {
					my._drawSprite(s);
					my._gridDraw();
				}
			}
		}

		// Return default if not set yet

		if (s.plane < 0) {
			return 0;
		}

		return s.plane;
	};

	// PS.spriteMove ( sprite, x, y )
	// Erases sprite at previous location (if any)
	// Redraws at x/y

	my.PSInterface.prototype.spriteMove = function (spriteP, xP, yP) {
		var fn, args, sprite, x, y, s, type, h_left, h_top, h_width, h_height, v_left, v_top, v_width, v_height, any;

		fn = "[PS.spriteMove] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 1, 3))
			return PS.ERROR;

		// Prevent arg mutation

		sprite = spriteP;
		x = xP;
		y = yP;

		s = my._getSprite(sprite, fn);
		if (s === PS.ERROR) {
			return PS.ERROR;
		}

		// Validate x

		type = my._typeOf(x);
		if ((type === "undefined") || (x === PS.CURRENT)) {
			x = s.x;
		} else if (x === PS.DEFAULT) {
			x = 0;
		} else if (type === "number") {
			x = Math.floor(x);
		} else {
			return my._error(fn + "x argument invalid");
		}

		// Validate y

		type = my._typeOf(y);
		if ((type === "undefined") || (y === PS.CURRENT)) {
			y = s.y;
		} else if (y === PS.DEFAULT) {
			y = 0;
		} else if (type === "number") {
			y = Math.floor(y);
		} else {
			return my._error(fn + "y argument invalid");
		}

		// Either coordinate changing?

		if (!s.placed || (x !== s.x) || (y !== s.y)) {
			any = false;

			// If no plane assigned, use current

			if (s.plane < 0) {
				s.plane = my._grid.plane;
			}

			// Erase previous position

			if (s.visible && s.placed) {
				// Which beads (if any) actually need to be erased?
				// Don't erase beads that will be overwritten by moved sprite

				// create h rect

				h_top = s.y;
				h_height = s.height;
				if (x > s.x) // sprite moving right
				{
					h_width = x - s.x;
					h_left = s.x;
				} else if (s.x > x) // sprite moving left
				{
					h_width = s.x - x;
					h_left = s.x + s.width - h_width;
				} else {
					h_width = 0;
				}

				// If moving far enough right/left, just erase entire sprite

				if (h_width >= s.width) {
					any = true;
					my._eraseSprite(s);
				} else {
					// Create v rect

					v_left = s.x;
					v_width = s.width;
					if (y > s.y) // sprite moving down
					{
						v_height = y - s.y;
						v_top = s.y;
					} else if (s.y > y) // sprite moving up
					{
						v_height = s.y - y;
						v_top = s.y + s.height - v_height;
					} else {
						v_height = 0;
					}

					// If moving far enough up/down, just erase entire sprite

					if (v_height >= s.height) {
						any = true;
						my._eraseSprite(s);
					}

					// Which rects need erasing?
					else if (v_height < 1) // not moving vertically
					{
						any = true;
						my._eraseSprite(s, h_left, h_top, h_width, h_height);
					} else if (v_width < 1) // not moving horizontally
					{
						any = true;
						my._eraseSprite(s, v_left, v_top, v_width, v_height);
					} else // Both must be erased
					{
						any = true;
						v_width -= h_width; // trim v_width

						if (x > s.x) // moving right, so move v_left right
						{
							v_left += h_width;
						}

						my._eraseSprite(s, h_left, h_top, h_width, h_height);
						my._eraseSprite(s, v_left, v_top, v_width, v_height);
					}
				}
			}

			s.x = x;
			s.y = y;
			s.placed = true;

			if (s.visible) {
				any = true;
				my._drawSprite(s);
				my._collisionCheck(s, sprite);
			}

			if (any) {
				my._gridDraw();
			}
		}

		return {
			x: s.x,
			y: s.y
		};
	};

	// PS.spriteCollide( sprite, exec )
	// Sets/inspects collision function

	my.PSInterface.prototype.spriteCollide = function (sprite, execP) {
		var fn, args, s, exec, type;

		fn = "[PS.spriteCollide] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 1, 2))
			return PS.ERROR;

		s = my._getSprite(sprite, fn);
		if (s === PS.ERROR) {
			return PS.ERROR;
		}

		exec = execP; // avoid arg mutation
		type = my._typeOf(exec);
		if ((type !== "undefined") && (exec !== PS.CURRENT)) {
			if (exec === PS.DEFAULT) {
				exec = null;
			} else if (type !== "function") {
				return my._error(fn + "exec argument not a function");
			}

			if (s.collide !== exec) {
				s.collide = exec;
				if (exec && s.visible && s.placed) {
					my._collisionCheck(s, sprite);
				}
			}
		}

		return s.collide;
	};

	// PS.spriteDelete( sprite)
	// Deletes a sprite

	my.PSInterface.prototype.spriteDelete = function (sprite) {
		var fn, args, len, i, s;

		fn = "[PS.spriteDelete] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 1, 1))
			return PS.ERROR;

		if ((typeof sprite !== "string") || (sprite.length < 1)) {
			return my._error(fn + "sprite argument invalid");
		}

		// Find the sprite object and index

		len = my._sprites.length;
		for (i = 0; i < len; i += 1) {
			s = my._sprites[i];
			if (s.id === sprite) {
				my._eraseSprite(s);
				my._sprites.splice(i, 1);
				my._gridDraw();
				return PS.DONE;
			}
		}

		return my._error(fn + "sprite id '" + sprite + "' not found");
	};

	//----------------
	// AUDIO FUNCTIONS
	//----------------

	// PS.audioLoad()
	// Loads a library sound and assigns a buffer
	// REQUIRED [filename] is the name of a library sound
	// OPTIONAL [params] is an object with the following optional properties:
	// .path (default: engine default) = full path of file (without filename), case sensitive
	// .fileTypes (default: engine default) = array of file type strings in order of preference
	// .autoplay (default: false) = true if file should be played immediately
	// .volume (default: engine default) = initial volume for channel
	// .loop (default: false) = true if channel should loop when played
	// .onLoad (default: null) = function to call when audio is done loading, with .data as parameter
	// .onEnd (default: null) = function to call when audio ends, with .data as parameter
	// .data (default: name) = data that will be passed as parameter to .onLoad/.onEnd functions if present
	// .lock (default: false) = true to lock channel
	// Returns channel id or PS.ERROR

	my.PSInterface.prototype.audioLoad = function (filename, params) {
		var fn, result;

		fn = "[PS.audioLoad] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 1, 2))
			return PS.ERROR;

		result = AQ.load(filename, params);
		if (result === AQ.ERROR) {
			return PS.ERROR;
		}
		return result.channel;
	};

	// PS.audioPlay()
	// Loads a library sound, assigns a buffer and plays it
	// REQUIRED [name] is the name of a library sound
	// OPTIONAL [params] is an object with the following optional properties:
	// .path (default: engine default) = full path of file (without filename), case sensitive
	// .fileTypes (default: engine default) = array of file type strings in order of preference
	// .volume (default: engine default) = initial volume for channel
	// .loop (default: false) = true if channel should loop when played
	// .onEnd (default: null) = function to call when audio ends, with .data as parameter
	// .data (default: name) = data that will be passed as parameter to .onLoad and .onEnd functions if present
	// .lock (default: false) = true to lock channel
	// Returns channel id or PS.ERROR

	my.PSInterface.prototype.audioPlay = function (filename_p, params_p) {
		var fn, args, filename, params, type, result;

		fn = "[PS.audioPlay] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 1, 2))
			return PS.ERROR;

		// Prevent arg mutation

		filename = filename_p;
		params = params_p;

		type = my._typeOf(params);
		if (type === "undefined") {
			params = {};
		} else if (type !== "object") {
			return my._error(fn + "params argument invalid");
		}

		params.autoplay = true; // force immediate playback

		result = AQ.load(filename, params);
		if (result === AQ.ERROR) {
			return PS.ERROR;
		}
		return result.channel;
	};

	// PS.audioPause()
	// Toggles pause on an audio channel
	// [channel] is a channel id
	// Returns channel id on success, PS.ERROR on error

	my.PSInterface.prototype.audioPause = function (channel_id) {
		var fn, args, result;

		fn = "[PS.audioPause] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 1, 1))
			return PS.ERROR;

		result = AQ.pause(channel_id);
		if (result === AQ.ERROR) {
			return PS.ERROR;
		}
		return result;
	};

	// PS.audioStop()
	// Stops a playing audio channel
	// [channel] is a channel id
	// Returns channel id on success, PS.ERROR on error

	my.PSInterface.prototype.audioStop = function (channel_id) {
		var fn, args, result;

		fn = "[PS.audioStop] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 1, 1))
			return PS.ERROR;

		result = AQ.stop(channel_id);
		if (result === AQ.ERROR) {
			return PS.ERROR;
		}
		if (result === AQ.DONE) {
			return PS.DONE;
		}
		return result;
	};

	// PS.piano ( val, flag )
	// Returns filename of indexed piano note
	// [val] is index
	// Optional [flag] specifies long version

	my.PSInterface.prototype.piano = function (val_p, flag_p) {
		var fn, len, type, val, flag, str;

		fn = "[PS.piano] ";
		len = my._PIANO_FILES.length;

		val = val_p; // avoid arg mutation;
		type = my._typeOf(val);
		if (type !== "number") {
			return my._error(fn + "index argument invalid");
		}
		val = Math.floor(val);
		if (val < 1) {
			val = 1;
		} else if (val > len) {
			val = len;
		}

		flag = flag_p; // avoid arg mutation
		if ((flag !== true) && (flag !== false)) {
			type = my._typeOf(flag);
			if (type === "undefined") {
				flag = false;
			} else if (type !== "number") {
				return my._error(fn + "flag argument invalid");
			}
		}

		str = "piano_" + my._PIANO_FILES[val - 1];
		if (flag) {
			str = "l_" + str;
		}
		return str;
	};

	// PS.harpsichord ( val, flag )
	// Returns filename of indexed harpsichord note
	// [val] is index
	// Optional [flag] specifies long version

	my.PSInterface.prototype.harpsichord = function (val_p, flag_p) {
		var fn, len, type, val, flag, str;

		fn = "[PS.harpsichord] ";
		len = my._HCHORD_FILES.length;

		val = val_p; // avoid arg mutation;
		type = my._typeOf(val);
		if (type !== "number") {
			return my._error(fn + "index argument invalid");
		}
		val = Math.floor(val);
		if (val < 1) {
			val = 1;
		} else if (val > len) {
			val = len;
		}

		flag = flag_p; // avoid arg mutation
		if ((flag !== true) && (flag !== false)) {
			type = my._typeOf(flag);
			if (type === "undefined") {
				flag = false;
			} else if (type !== "number") {
				return my._error(fn + "flag argument invalid");
			}
		}

		str = "hchord_" + my._HCHORD_FILES[val - 1];
		if (flag) {
			str = "l_" + str;
		}
		return str;
	};

	// PS.xylophone ( val )
	// Returns filename of indexed xylophone note
	// [val] is index

	my.PSInterface.prototype.xylophone = function (val_p) {
		var fn, len, type, val, str;

		fn = "[PS.xylophone] ";
		len = my._XYLO_FILES.length;

		val = val_p; // avoid arg mutation;
		type = my._typeOf(val);
		if (type !== "number") {
			return my._error(fn + "index argument invalid");
		}
		val = Math.floor(val);
		if (val < 1) {
			val = 1;
		} else if (val > len) {
			val = len;
		}

		str = "xylo_" + my._XYLO_FILES[val - 1];
		return str;
	};

	//-------------------
	// DEBUGGER FUNCTIONS
	//-------------------

	// Add line to debugger (does not include CR)
	// Returns PS.DONE, or PS.ERROR on param error

	my.PSInterface.prototype.debug = function (textP) {
		var fn, text, type, e;

		fn = "[PS.debug] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 0, 1))
			return PS.ERROR;

		text = textP; // prevent arg mutation
		type = my._typeOf(text);
		if (type === "undefined") {
			text = "";
		} else if (type !== "string") {
			text = text.toString();
		}

		my._debugOpen();

		if (text.length > 0) {
			e = document.getElementById(my._MONITOR_ID);
			e.value += text; // append string

			e.scrollTop = e.scrollHeight; // keep it scrolled down
		}

		my._scrollDown();

		return PS.DONE;
	};

	// Close debugger div
	// Returns PS.DONE

	my.PSInterface.prototype.debugClose = function () {
		var fn, e;

		fn = "[PS.debugClose] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 0, 0))
			return PS.ERROR;

		e = document.getElementById(my._DEBUG_ID);
		e.style.display = "none";
		my._debugging = false;

		return PS.DONE;
	};

	// Clear monitor
	// Returns PS.DONE

	my.PSInterface.prototype.debugClear = function () {
		var fn, e;

		fn = "[PS.debugClear] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 0, 0))
			return PS.ERROR;

		e = document.getElementById(my._MONITOR_ID);
		e.value = "";

		return PS.DONE;
	};

	//----------------
	// PATHFINDING API
	//----------------

	// PS.pathMap ( image )
	// Takes an image and returns a pathmap id for PS.pathFind()

	my.PSInterface.prototype.line = function (x1_p, y1_p, x2_p, y2_p) {
		var fn, args, x1, y1, x2, y2, path;

		fn = "[PS.line] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 4, 4))
			return PS.ERROR;

		// Prevent arg mutation

		x1 = x1_p;
		y1 = y1_p;
		x2 = x2_p;
		y2 = y2_p;

		// Check x1

		if (my._typeOf(x1) === "number") {
			x1 = Math.floor(x1);
		} else {
			return my._error(fn + "x1 argument not a number");
		}

		// Check y1

		if (my._typeOf(y1) === "number") {
			y1 = Math.floor(y1);
		} else {
			return my._error(fn + "y1 argument not a number");
		}

		// Check x2

		if (my._typeOf(x2) === "number") {
			x2 = Math.floor(x2);
		} else {
			return my._error(fn + "x2 argument not a number");
		}

		// Check y2

		if (my._typeOf(y2) === "number") {
			y2 = Math.floor(y2);
		} else {
			return my._error(fn + "y2 argument not a number");
		}

		path = my._line(x1, y1, x2, y2);
		return path;
	};

	// PS.pathMap ( image )
	// Takes an image and returns a pathmap id for PS.pathFind()

	my.PSInterface.prototype.pathMap = function (image) {
		var fn, args, pm;

		fn = "[PS.pathMap] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 1, 1))
			return PS.ERROR;

		// Check image

		if (my._validImage(fn, image) === PS.ERROR) {
			return PS.ERROR;
		}
		if (image.pixelSize !== 1) {
			return my._error(fn + "image is not format 1");
		}

		pm = my._newMap(image.width, image.height, image.data);

		return pm.id;
	};

	// pathFind = function ( pathmap, x1, y1, x2, y2 )
	// Takes pathmap id, start and end coordinates
	// Returns an array of [ x, y ] pairs representing path points

	my.PSInterface.prototype.pathFind = function (pathmap_p, x1_p, y1_p, x2_p, y2_p, options_p) {
		var fn, args, pathmap, x1, y1, x2, y2, options, pm, type, path, val, no_diagonals, cut_corners;

		fn = "[PS.pathFind] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 5, 6))
			return PS.ERROR;

		// Prevent arg mutation

		pathmap = pathmap_p;
		x1 = x1_p;
		y1 = y1_p;
		x2 = x2_p;
		y2 = y2_p;
		options = options_p;

		// Check id

		if ((typeof pathmap !== "string") || (pathmap.length < 1)) {
			return my._error(fn + "pathmap argument invalid");
		}

		pm = my._getMap(pathmap);
		if (!pm) {
			return my._error(fn + pathmap + " not found");
		}

		// Check x1

		if (my._typeOf(x1) === "number") {
			x1 = Math.floor(x1);
			if ((x1 < 0) || (x1 >= pm.width)) {
				return my._error(fn + "x1 argument is outside " + pathmap);
			}
		} else {
			return my._error(fn + "x1 argument not a number");
		}

		// Check y1

		if (my._typeOf(y1) === "number") {
			y1 = Math.floor(y1);
			if ((y1 < 0) || (y1 >= pm.height)) {
				return my._error(fn + "y1 argument is outside " + pathmap);
			}
		} else {
			return my._error(fn + "y1 argument not a number");
		}

		// Check x2

		if (my._typeOf(x2) === "number") {
			x2 = Math.floor(x2);
			if ((x2 < 0) || (x2 >= pm.width)) {
				return my._error(fn + "x2 argument is outside " + pathmap);
			}
		} else {
			return my._error(fn + "x2 argument not a number");
		}

		// Check y2

		if (my._typeOf(y2) === "number") {
			y2 = Math.floor(y2);
			if ((y2 < 0) || (y2 >= pm.height)) {
				return my._error(fn + "y2 argument is outside " + pathmap);
			}
		} else {
			return my._error(fn + "y2 argument not a number");
		}

		// Assume default options

		no_diagonals = false;
		cut_corners = false;

		// Check options

		type = my._typeOf(options);
		if ((type !== "undefined") && (options !== PS.DEFAULT)) {
			if (type !== "object") {
				return my._error(fn + "options argument invalid");
			}

			// Check .no_diagonals

			val = options.no_diagonals;
			if ((val === true) || (val === false)) {
				no_diagonals = val;
			} else {
				type = my._typeOf(val);
				if ((type === "undefined") || (val === PS.DEFAULT)) {
					no_diagonals = false;
				} else if (type === "number") {
					no_diagonals = (val !== 0);
				} else {
					return my._error(fn + "options.no_diagonals invalid");
				}
			}

			// Check .cut_corners

			val = options.cut_corners;
			if ((val === true) || (val === false)) {
				cut_corners = val;
			} else {
				type = my._typeOf(val);
				if ((type === "undefined") || (val === PS.DEFAULT)) {
					cut_corners = false;
				} else if (type === "number") {
					cut_corners = (val !== 0);
				} else {
					return my._error(fn + "options.cut_corners invalid");
				}
			}
		}

		path = my._findPath(pm, x1, y1, x2, y2, no_diagonals, cut_corners);
		return path;
	};

	// pathData = function ( id, left, top, width, height, data )
	// Takes pathmap id and region coordinates, sets/inspects using data
	// Returns an array of data at coordinates

	my.PSInterface.prototype.pathData = function (pathmap_p, left_p, top_p, width_p, height_p, data_p) {
		var fn, args, pathmap, left, top, width, height, data, pm, max, type, result;

		fn = "[PS.pathData] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 5, 6))
			return PS.ERROR;

		// Prevent arg mutation

		pathmap = pathmap_p;
		left = left_p;
		top = top_p;
		width = width_p;
		height = height_p;
		data = data_p;

		// Check id

		if ((typeof pathmap !== "string") || (pathmap.length < 1)) {
			return my._error(fn + "pathmap argument invalid");
		}

		pm = my._getMap(pathmap);
		if (!pm) {
			return my._error(fn + pathmap + " not found");
		}

		// Check left

		if (my._typeOf(left) === "number") {
			left = Math.floor(left);
			if ((left < 0) || (left >= pm.width)) {
				return my._error(fn + "left argument is outside " + pathmap);
			}
		} else {
			return my._error(fn + "left argument not a number");
		}

		// Check top

		if (my._typeOf(top) === "number") {
			top = Math.floor(top);
			if ((top < 0) || (top >= pm.height)) {
				return my._error(fn + "top argument is outside " + pathmap);
			}
		} else {
			return my._error(fn + "top argument not a number");
		}

		// Check width

		if (width === PS.DEFAULT) {
			width = 1;
		} else if (my._typeOf(width) === "number") {
			width = Math.floor(width);
			if (width < 1) {
				width = 1;
			} else {
				max = pm.width - left;
				if (width > max) {
					width = max;
				}
			}
		} else {
			return my._error(fn + "width argument not a number");
		}

		// Check height

		if (height === PS.DEFAULT) {
			height = 1;
		} else if (my._typeOf(height) === "number") {
			height = Math.floor(height);
			if (height < 1) {
				height = 1;
			} else {
				max = pm.height - top;
				if (height > max) {
					height = max;
				}
			}
		} else {
			return my._error(fn + "height argument not a number");
		}

		// Check data

		if ((data !== PS.DEFAULT) && (data !== PS.CURRENT)) {
			type = my._typeOf(data);
			if (type === "undefined") {
				data = PS.CURRENT;
			} else if (type === "number") {
				if (data < 0) {
					return my._error(fn + "data argument < 0");
				}
			} else {
				return my._error(fn + "data argument not a number");
			}
		}

		result = my._pathData(pm, left, top, width, height, data);
		return result;
	};

	// pathDelete: function ( pathmap )
	// Deletes pathmap
	// Returns PS.DONE or PS.ERROR

	my.PSInterface.prototype.pathDelete = function (pathmap) {
		var fn, args;

		fn = "[PS.pathDelete] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 1, 1))
			return PS.ERROR;

		// Check pathmap id

		if ((typeof pathmap !== "string") || (pathmap.length < 1)) {
			return my._error(fn + "pathmap argument invalid");
		}

		if (!my._deleteMap(pathmap)) {
			return my._error(fn + pathmap + " not found");
		}

		return PS.DONE;
	};

	my.PSInterface.prototype.pathNear = function (pathmap, x1, y1, x2, y2) {
		var fn, args, pm, result;

		fn = "[PS.pathNear] ";

		if (PS.ERROR === my._checkNumArgs(fn, arguments.length, 5, 5))
			return PS.ERROR;

		// Check pathmap id

		if ((typeof pathmap !== "string") || (pathmap.length < 1)) {
			return my._error(fn + "pathmap argument invalid");
		}

		pm = my._getMap(pathmap);
		if (!pm) {
			return my._error(fn + pathmap + " not found");
		}

		result = my._pathNear(pm, x1, y1, x2, y2);
		return result;
	};

	return my;
};

// Register with global PERLENSPIEL manager
PERLENSPIEL.RegisterModule(PerlenspielInterface);
