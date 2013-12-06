// ps2.1.js for Perlenspiel 2.1

/*
Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
Perlenspiel is Copyright © 2009-12 Worcester Polytechnic Institute.
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

/*global document, window, Audio, Image */

// Global namespace variable

var PS = {
	
	// Constants
	
	VERSION: "2.1.00",
	DEFAULT: -1, // use default value
	CURRENT: -2, // use current value
	ALL: -3, // Use all rows or columns
	ERROR: "*ERROR*", // generic error return value
	CANVAS_SIZE: 480, // max width/height of canvas
	GRID_MAX: 32, // max x/y dimensions of grid
	GRID_DEFAULT_WIDTH: 8,
	GRID_DEFAULT_HEIGHT: 8,
	DEFAULT_BEAD_COLOR: 0x000000,
	DEFAULT_BEAD_RED: 0x00,
	DEFAULT_BEAD_GREEN: 0x00,
	DEFAULT_BEAD_BLUE: 0x00,
	DEFAULT_BG_COLOR: 0xFFFFFF,
	DEFAULT_BG_RED: 0xFF,
	DEFAULT_BG_GREEN: 0xFF,
	DEFAULT_BG_BLUE: 0xFF,
	DEFAULT_BORDER_COLOR: 0x808080,
	DEFAULT_BORDER_RED: 0x80,
	DEFAULT_BORDER_GREEN: 0x80,
	DEFAULT_BORDER_BLUE: 0x80,
	DEFAULT_BORDER_WIDTH: 1,
	BORDER_WIDTH_MAX: 8,
	DEFAULT_GLYPH_COLOR: 0xFFFFFF,
	DEFAULT_GLYPH_RED: 0xFF,
	DEFAULT_GLYPH_GREEN: 0xFF,
	DEFAULT_GLYPH_BLUE: 0xFF,
	DEFAULT_FLASH_COLOR: 0xFFFFFF,
	DEFAULT_FLASH_RED: 0xFF,
	DEFAULT_FLASH_GREEN: 0xFF,
	DEFAULT_FLASH_BLUE: 0xFF,
	DEFAULT_ALPHA: 100, // must be between 0 and 100
	DEFAULT_VOLUME: 1.0, // must be between 0 and 1.0
	DEFAULT_LOOP: false,
	DEFAULT_FPS: 10, // frame rate in milliseconds (1/100 sec)
	REDSHIFT: 256 * 256, // used to decode rgb
	FLASH_STEP: 10, // percent for each flash
	STATUS_FLASH_STEP: 5, // percent for each step
	FLASH_INTERVAL: 5, // number of ticks per flash step
	DEFAULT_TEXT_COLOR: 0x000000,

	// Color constants

	COLOR_BLACK: 0x000000,
	COLOR_WHITE: 0xFFFFFF,
	COLOR_GRAY_LIGHT: 0xC0C0C0,
	COLOR_GRAY: 0x808080,
	COLOR_GRAY_DARK: 0x404040,
	COLOR_RED: 0xFF0000,
	COLOR_ORANGE: 0xFF8000,
	COLOR_YELLOW: 0xFFFF00,
	COLOR_GREEN: 0x00FF00,
	COLOR_BLUE: 0x0000FF,
	COLOR_INDIGO: 0x4000FF,
	COLOR_VIOLET: 0x8000FF,
	COLOR_MAGENTA: 0xFF00FF,
	COLOR_CYAN: 0x00FFFF,

	// Key and mouse wheel constants

	ARROW_LEFT: 37,
	ARROW_RIGHT: 39,
	ARROW_UP: 38,
	ARROW_DOWN: 40,
	KEYPAD_0: 96,
	KEYPAD_1: 97,
	KEYPAD_2: 98,
	KEYPAD_3: 99,
	KEYPAD_4: 100,
	KEYPAD_5: 101,
	KEYPAD_6: 102,
	KEYPAD_7: 103,
	KEYPAD_8: 104,
	KEYPAD_9: 105,
	F1: 112,
	F2: 113,
	F3: 114,
	F4: 115,
	F5: 116,
	F6: 117,
	F7: 118,
	F8: 119,
	F9: 120,
	F10: 121,
	FORWARD: 1,
	BACKWARD: -1,

	Grid: null, // main grid
	DebugWindow: null, // debugger window
	ImageCanvas: null, // offscreen canvas for image manipulation

	// Coordinates of current and previous beads, -1 if none

	MouseX: -1,
	MouseY: -1,
	LastX: -1,
	LastY: -1,

	// Delay and clock settings

	FlashDelay: 0,
	UserDelay: 0,
	UserClock: 0,

	// Status line

	Status: "Perlenspiel",
	StatusHue: 0, // target hue
	StatusRed: 0,
	StatusGreen: 0,
	StatusBlue: 0,
	StatusPhase: 0, // 100: done fading
	StatusFading: true
};

// Improved typeof that distinguishes arrays

PS.TypeOf = function (value)
{
	"use strict";
	var s;

    s = typeof value;
    if ( s === "object" )
	{
        if ( value )
        {
            if ( value instanceof Array )
            {
                s = "array";
            }
        }
        else
        {
            s = "null";
        }
    }
    return s;
};

// Get the canvas context

PS.Context = function ()
{
	"use strict";
	var cv, ctx;

	ctx = null;
	cv = document.getElementById("screen");
	if ( cv && cv.getContext )
	{
		ctx = cv.getContext("2d");
	}

	return ctx;
};

// Takes a multiplexed rgb value and a function name
// Returns floored rgb value, or -1 if invalid

PS.ValidRGB = function ( rgb, fn )
{
	"use strict";

	if ( typeof rgb !== "number" )
	{
		PS.Oops( fn + "rgb parameter not a number" );
		return -1;
	}
	rgb = Math.floor(rgb);
	if ( rgb < 0 )
	{
		PS.Oops( fn + "rgb parameter negative" );
		return -1;
	}
	if ( rgb > 0xFFFFFF )
	{
		PS.Oops( fn + "rgb parameter out of range" );
		return -1;
	}
	return rgb;
};

// Construct a color string with optional alpha

PS.RGBString = function (r, g, b, a)
{
	"use strict";
	var str;

	if ( a === undefined )
	{
		str = "rgb(" + r + "," + g + "," + b + ")";
	}
	else
	{
		str = "rgba(" + r + "," + g + "," + b + "," + a + ")";
	}
	return str;
};

// Takes a multiplexed rgb value and creates an object with
// separate r, g and b values, or null if error

PS.UnmakeRGB = function ( rgb )
{
	"use strict";
	var fn, red, green, blue, rval, gval;

	fn = "[PS.DecodeRGB] ";

	if ( typeof rgb !== "number" )
	{
		PS.Oops(fn + "RGB parameter not a number");
		return PS.ERROR;
	}
	rgb = Math.floor(rgb);
	if ( rgb < 0 )
	{
		PS.Oops(fn + "RGB parameter negative");
		return PS.ERROR;
	}
	if ( rgb > 0xFFFFFF )
	{
		PS.Oops(fn + "RGB parameter out of range");
		return PS.ERROR;
	}

	red = rgb / PS.REDSHIFT;
	red = Math.floor(red);
	rval = red * PS.REDSHIFT;

	green = (rgb - rval) / 256;
	green = Math.floor(green);
	gval = green * 256;

	blue = rgb - rval - gval;

	return { r: red, g: green, b: blue };
};

// PS.Dissolve
// Returns a color that is x% between c1 and c2

PS.Dissolve = function ( c1, c2, x )
{
	"use strict";
	var delta;

	if ( c1 > c2 )
	{
		delta = c1 - c2;
		delta = ( x * delta ) / 100;
		delta = Math.floor(delta);
		return ( c1 - delta );
	}
	else
	{
		delta = c2 - c1;
		delta = ( x * delta ) / 100;
		delta = Math.floor(delta);
		return ( c1 + delta );
	}
};

// Bead constuctor

PS.InitBead = function (xpos, ypos, size, bgcolor)
{
	"use strict";
	var bead;

	bead = {};

	bead.left = xpos;
	bead.right = xpos + size;
	bead.top = ypos;
	bead.bottom = ypos + size;

	bead.size = size;

	bead.visible = true;			// bead visible?

	// target color

	bead.dirty = false;				// bead color touched?

	// base colors

	bead.red = PS.DEFAULT_BEAD_RED;
	bead.green = PS.DEFAULT_BEAD_GREEN;
	bead.blue = PS.DEFAULT_BEAD_BLUE;
	bead.color = PS.RGBString (bead.red, bead.green, bead.blue); // default color
	bead.colorNow = bead.color;	// actual color while drawing

	// pre-calculated alpha colors

	bead.alpha = PS.DEFAULT_ALPHA;
	bead.alphaRed = PS.DEFAULT_BEAD_RED;
	bead.alphaGreen = PS.DEFAULT_BEAD_GREEN;
	bead.alphaBlue = PS.DEFAULT_BEAD_BLUE;

	// glyph params

	bead.glyph = 0;					// glyph code (zero if none)
	bead.glyphStr = "";				// actual string to print
	bead.glyphRed = PS.DEFAULT_GLYPH_RED;
	bead.glyphGreen = PS.DEFAULT_GLYPH_GREEN;
	bead.glyphBlue = PS.DEFAULT_GLYPH_BLUE;
	bead.glyphColor = PS.RGBString (PS.DEFAULT_GLYPH_RED, PS.DEFAULT_GLYPH_GREEN, PS.DEFAULT_GLYPH_BLUE);

	// flash params

	bead.flash = true;				// flashing enabled?
	bead.flashPhase = 0;			// phase of flash animation
	bead.flashRed = PS.DEFAULT_FLASH_RED;
	bead.flashGreen = PS.DEFAULT_FLASH_GREEN;
	bead.flashBlue = PS.DEFAULT_FLASH_BLUE;
	bead.flashColor = PS.RGBString (PS.DEFAULT_FLASH_RED, PS.DEFAULT_FLASH_GREEN, PS.DEFAULT_FLASH_BLUE);

	// border params

	bead.borderWidth = PS.DEFAULT_BORDER_WIDTH; // border width; 0 if none
	bead.borderRed = PS.DEFAULT_BORDER_RED;
	bead.borderGreen = PS.DEFAULT_BORDER_GREEN;
	bead.borderBlue = PS.DEFAULT_BORDER_BLUE;
	bead.borderAlpha = PS.DEFAULT_ALPHA;			// border alpha
	bead.borderColor = PS.RGBString (PS.DEFAULT_BORDER_RED, PS.DEFAULT_BORDER_GREEN, PS.DEFAULT_BORDER_BLUE);

	// data, sound, exec params

	bead.data = 0;					// data value

	bead.audio = null;					// sound (null = none)
	bead.volume = PS.DEFAULT_VOLUME;	// volume
	bead.loop = PS.DEFAULT_LOOP;		// loop flag

	bead.exec = null;					// on-click function (null = none)

	// give each bead its own offscreen canvas and context

	bead.off = document.createElement("canvas");
	bead.off.width = size;
	bead.off.height = size;
	bead.off.backgroundColor = bgcolor;
	bead.offContext = bead.off.getContext("2d");

	// set up font info for offscreen context

	bead.offContext.font = Math.floor(size / 2) + "pt sans-serif";
	bead.offContext.textAlign = "center";
	bead.offContext.textBaseline = "middle";

	return bead;
};

// Draws bead [bead] in (optional) context [ctx]

PS.DrawBead = function (bead, ctx)
{
	"use strict";
	var offctx, left, top, size, width;

	// get destination context if not provided

	if ( ctx === undefined )
	{
		ctx = PS.Context();
	}

	left = 0;
	top = 0;
	size = bead.size;	

	offctx = bead.offContext; // the offscreen canvas context

	// draw border if needed

	width = bead.borderWidth;
	if ( width > 0 )
	{
		offctx.fillStyle = bead.borderColor;
		offctx.fillRect(0, 0, size, size);

		// adjust position and size of bead rect		

		left += width;
		top += width;
		size -= (width + width);
	}

	// draw bead body if dirty (has had color explicitly set)

	if ( bead.dirty )
	{
		offctx.fillStyle = bead.colorNow;
	}

	// otherwise fill with background color

	else
	{
		offctx.fillStyle = PS.Grid.bgColor;
	}

	offctx.fillRect(left, top, size, size);

	if ( bead.glyph > 0 )
	{
		offctx.fillStyle = bead.glyphColor;
		offctx.fillText (bead.glyphStr, PS.Grid.glyphX, PS.Grid.glyphY);
	}

	// blit offscreen canvas to main canvas

	ctx.drawImage(bead.off, bead.left, bead.top);
};

// Erase bead [bead] in (optional) context [ctx]

PS.EraseBead = function (bead, ctx)
{
	"use strict";
	var size, left, top, width;

	// get destination context if not provided

	if ( ctx === undefined )
	{
		ctx = PS.Context();
	}

	left = bead.left;
	top = bead.top;
	size = bead.size;	

	// draw border if needed

	width = bead.borderWidth;
	if ( width > 0 )
	{
		ctx.fillStyle = bead.borderColor;
		ctx.fillRect(left, top, size, size);

		// adjust position and size of bead rect		

		left += width;
		top += width;
		size -= (width + width);
	}

	ctx.fillStyle = PS.Grid.bgColor;
	ctx.fillRect(left, top, size, size);
};

// Grid constructor
// Call with x/y dimensions of grid
// Returns initialized grid object or null if error

PS.InitGrid = function (x, y)
{
	"use strict";
	var grid, i, j, size, xpos, ypos;

	grid = {};

	grid.x = x;					// x dimensions of grid
	grid.y = y;					// y dimensions of grid
	grid.count = x * y;			// number of beads in grid

	// calc size of beads, position/dimensions of centered grid on canvas

	if ( x >= y )
	{
		grid.beadSize = size = Math.floor(PS.CANVAS_SIZE / x);
		grid.width = size * x;
		grid.height = size * y;
		grid.left = 0;
	}
	else
	{
		grid.beadSize = size = Math.floor(PS.CANVAS_SIZE / y);
		grid.width = size * x;
		grid.height = size * y;
		grid.left = Math.floor( (PS.CANVAS_SIZE - grid.width) / 2 );
	}
	
	grid.top = 0;

	grid.right = grid.left + grid.width;
	grid.bottom = grid.top + grid.height;

	grid.bgRed = PS.DEFAULT_BG_RED;
	grid.bgGreen = PS.DEFAULT_BG_GREEN;
	grid.bgBlue = PS.DEFAULT_BG_BLUE;
	grid.bgColor = PS.RGBString (grid.bgRed, grid.bgGreen, grid.bgBlue);

	grid.borderRed = PS.DEFAULT_BORDER_RED;
	grid.borderGreen = PS.DEFAULT_BORDER_GREEN;
	grid.borderBlue = PS.DEFAULT_BORDER_BLUE;
	grid.borderColor = PS.RGBString (grid.borderRed, grid.borderGreen, grid.borderBlue);

//	grid.borderWidth = PS.DEFAULT_BORDER_WIDTH;
	grid.borderMax = PS.BORDER_WIDTH_MAX; // for now; should be calculated

	grid.pointing = -1;			// bead cursor is pointing at (-1 if none)

	grid.flash = true;			// flash globally enabled?
	grid.flashList = [];		// array of currently flashing beads

	grid.glyphX = Math.floor(size / 2);
	grid.glyphY = Math.floor((size / 7) * 4);

	// init beads	

	grid.beads = [];
	ypos = grid.top;
	for ( j = 0; j < y; j += 1 )
	{
		xpos = grid.left;
		for ( i = 0; i < x; i += 1 )
		{
			grid.beads.push( PS.InitBead(xpos, ypos, size, grid.bgColor) );
			xpos += size;
		}
		ypos += size;
	}

	return grid;
};

PS.DrawGrid = function ()
{
	"use strict";
	var ctx, beads, cnt, i, bead;

	ctx = PS.Context();
	beads = PS.Grid.beads;
	cnt = PS.Grid.count;

	for ( i = 0; i < cnt; i += 1 )
	{
		bead = beads[i];
		if ( bead.visible )
		{
			PS.DrawBead(bead, ctx);
		}
		else
		{
			PS.EraseBead(bead, ctx);
		}
	}
};

// Returns true if x parameter is valid, else false

PS.CheckX = function ( x, fn )
{
	"use strict";

	if ( typeof x !== "number" )
	{
		PS.Oops(fn + "x parameter not a number");
		return false;
	}
	x = Math.floor(x);
	if ( x < 0 )
	{
		PS.Oops(fn + "x parameter negative");
		return false;
	}
	if ( x >= PS.Grid.x )
	{
		PS.Oops(fn + "x parameter exceeds grid width");
		return false;
	}

	return true;
};

// Returns true if y parameter is valid, else false

PS.CheckY = function ( y, fn )
{
	"use strict";

	if ( typeof y !== "number" )
	{
		PS.Oops(fn + "y parameter not a number");
		return false;
	}
	y = Math.floor(y);
	if ( y < 0 )
	{
		PS.Oops(fn + "y parameter negative");
		return false;
	}
	if ( y >= PS.Grid.y )
	{
		PS.Oops(fn + "y parameter exceeds grid height");
		return false;
	}

	return true;
};

// PS.GetBead(x, y)
// Takes x/y coords of bead and function name
// Returns the bead object at (x, y), or null if error

PS.GetBead = function (x, y, fn)
{
	"use strict";
	var i;

	if ( !PS.CheckX( x, fn ) || !PS.CheckY( y, fn ) )
	{
		return null;
	}

	i = x + (y * PS.Grid.x); // get index of bead

	return PS.Grid.beads[i];
};

// API Functions

PS.GridSize = function (w, h)
{
	"use strict";
	var fn, i, cnt, beads, cv;

	fn = "[PS.GridSize] ";

	if ( typeof w !== "number" )
	{
		PS.Oops(fn + "Width param not a number");
		return;
	}
	if ( typeof h !== "number" )
	{
		PS.Oops(fn + "Height param not a number");
		return;
	}

	w = Math.floor(w);
	if ( w === PS.DEFAULT )
	{
		w = PS.GRID_DEFAULT_WIDTH;
	}
	else if ( w < 1 )
	{
		PS.Oops(fn + "width parameter < 1");
		w = 1;
	}
	else if ( w > PS.GRID_MAX )
	{
		PS.Oops(fn + "width parameter > " + PS.GRID_MAX);
		w = PS.GRID_MAX;
	}

	h = Math.floor(h);
	if ( h === PS.DEFAULT )
	{
		h = PS.GRID_DEFAULT_HEIGHT;
	}
	else if ( h < 1 )
	{
		PS.Oops(fn + "height parameter < 1");
		h = 1;
	}
	else if ( h > PS.GRID_MAX )
	{
		PS.Oops(fn + "height parameter > " + PS.GRID_MAX);
		h = PS.GRID_MAX;
	}

	// If a grid already exists, null out its arrays and then itself

	if ( PS.Grid )
	{
		beads = PS.Grid.beads;
		if ( beads )
		{
			cnt = PS.Grid.count;
			for ( i = 0; i < cnt; i += 1 )
			{
				beads[i] = null;
			}
		}

		PS.Grid.beads = null;
		PS.Grid.flashList = null;
		PS.Grid = null;
	}

	PS.Grid = PS.InitGrid(w, h);
	
	// Reset mouse coordinates
	
	PS.MouseX = -1;
	PS.MouseY = -1;
	PS.LastX = -1;
	PS.LastY = -1;

	// Erase the canvas

	if ( PS.Grid )
	{
		cv = document.getElementById("screen");
		if ( cv )
		{
			cv.height = PS.Grid.height; // setting height erases canvas
			PS.DrawGrid();
		}
	}
};

PS.GridBGColor = function ( rgb )
{
	"use strict";
	var fn, current, colors, e;

	fn = "[PS.GridBGColor] ";
	current = (PS.Grid.bgRed * PS.REDSHIFT) + (PS.Grid.bgGreen * 256) + PS.Grid.bgBlue;

	// if param or PS.CURRENT, just return current color

	if ( (rgb === undefined) || (rgb === PS.CURRENT) )
	{
		return current;
	}

	if ( rgb === PS.DEFAULT )
	{
		rgb = PS.DEFAULT_BG_COLOR;
	}
	else
	{
		rgb = PS.ValidRGB( rgb, fn );
		if ( rgb < 0 )
		{
			return PS.ERROR;
		}
	}

	colors = PS.UnmakeRGB(rgb);
	if ( colors )
	{
		PS.Grid.bgRed = colors.r;
		PS.Grid.bgGreen = colors.g;
		PS.Grid.bgBlue = colors.b;
		PS.Grid.bgColor = PS.RGBString(colors.r, colors.g, colors.b);

		// Reset browser background

		e = document.body;
		e.style.backgroundColor = PS.Grid.bgColor;
		
		// reset status line background

		e = document.getElementById("status");
		if ( e )
		{
			e.style.backgroundColor = PS.Grid.bgColor;
		}

		// redraw canvas

		e = document.getElementById("screen");
		if ( e )
		{
			e.width = PS.CANVAS_SIZE; // setting width erases
			PS.DrawGrid();
		}
	}

	return rgb;
};

// PS.MakeRGB (r, g, b)
// Takes three colors and returns multiplexed rgb value, or 0 (black) if error

PS.MakeRGB = function (r, g, b)
{
	"use strict";
	var fn, rgb;

	fn = "[PS.MakeRGB] ";

	if ( typeof r !== "number" )
	{
		PS.Oops(fn + "R parameter not a number");
		return PS.ERROR;
	}
	r = Math.floor(r);
	if ( r < 0 )
	{
		r = 0;
	}
	else if ( r > 255 )
	{
		r = 255;
	}

	if ( typeof g !== "number" )
	{
		PS.Oops(fn + "G parameter not a number");
		return PS.ERROR;
	}
	g = Math.floor(g);
	if ( g < 0 )
	{
		g = 0;
	}
	else if ( g > 255 )
	{
		g = 255;
	}

	if ( typeof b !== "number" )
	{
		PS.Oops(fn + "B parameter not a number");
		return PS.ERROR;
	}
	b = Math.floor(b);
	if ( b < 0 )
	{
		b = 0;
	}
	else if ( b > 255 )
	{
		b = 255;
	}

	rgb = (r * PS.REDSHIFT) + (g * 256) + b;

	return rgb;
};

// Bead API

// PS.BeadShow(x, y, flag)
// Returns a bead's display status and optionally changes it
// [x, y] are grid position
// Optional [flag] must be 1/true or 0/false

PS.DoBeadShow = function (x, y, flag)
{
	"use strict";
	var i, bead;

	// Assume x/y params are already verified

	i = x + (y * PS.Grid.x); // get index of bead
	bead = PS.Grid.beads[i];

	if ( (flag === undefined) || (flag === PS.CURRENT) || (flag === bead.visible) )
	{
		return bead.visible;
	}

	bead.visible = flag;
	if ( flag )
	{
		if ( PS.Grid.flash && bead.flash )
		{
			PS.FlashStart(x, y);
		}
		else
		{
			bead.colorNow = bead.color;
			PS.DrawBead(bead);
		}
	}
	else
	{
		PS.EraseBead(bead);
	}

	return flag;
};

PS.BeadShow = function (x, y, flag)
{
	"use strict";
	var fn, i, j;

	fn = "[PS.BeadShow] ";

	// normalize flag value to t/f if defined

	if ( (flag !== undefined) && (flag !== PS.CURRENT) )
	{
		if ( flag === PS.DEFAULT )
		{
			flag = true;
		}
		else if ( flag )
		{
			flag = true;
		}
		else
		{
			flag = false;
		}
	}

	if ( x === PS.ALL )
	{
		if ( y === PS.ALL ) // do entire grid
		{
			for ( j = 0; j < PS.Grid.y; j += 1 )
			{
				for ( i = 0; i < PS.Grid.x; i += 1 )
				{
					flag = PS.DoBeadShow( i, j, flag );
				}
			}
		}
		else if ( !PS.CheckY( y, fn ) ) // verify y param
		{
			return PS.ERROR;
		}
		else
		{
			for ( i = 0; i < PS.Grid.x; i += 1 ) // do entire row
			{
				flag = PS.DoBeadShow( i, y, flag );
			}
		}
	}
	else if ( y === PS.ALL )
	{
		if ( !PS.CheckX( x, fn ) ) // verify x param
		{
			return PS.ERROR;
		}
		for ( j = 0; j < PS.Grid.y; j += 1 ) // do entire column
		{
			flag = PS.DoBeadShow( x, j, flag );
		}
	}
	else if ( !PS.CheckX( x, fn ) || !PS.CheckY( y, fn ) ) // verify both params
	{
		return PS.ERROR;
	}
	else
	{
		flag = PS.DoBeadShow( x, y, flag ); // do one bead
	}

	return flag;
};

// PS.BeadColor (x, y, rgb)
// Returns and optionally sets a bead's color
// [x, y] are grid position
// Optional [rgb] must be a multiplexed rgb value (0xRRGGBB)

PS.DoBeadColor = function ( x, y, rgb, r, g, b )
{
	"use strict";
	var i, bead;

	// Assume x/y params are already verified

	i = x + (y * PS.Grid.x); // get index of bead
	bead = PS.Grid.beads[i];

	if ( (rgb === undefined) || (rgb === PS.CURRENT) ) // if no rgb or PS.CURRENT, return current color
	{
		return (bead.red * PS.REDSHIFT) + (bead.green * 256) + bead.blue;
	}

	bead.dirty = true; // mark this bead as explicitly colored

	bead.red = r;
	bead.green = g;
	bead.blue = b;
	if ( bead.alpha < PS.DEFAULT_ALPHA ) // Calc new color based on alpha
	{
		bead.alphaRed = PS.Dissolve( PS.Grid.bgRed, r, bead.alpha );
		bead.alphaGreen = PS.Dissolve( PS.Grid.bgGreen, g, bead.alpha );
		bead.alphaBlue = PS.Dissolve( PS.Grid.bgBlue, b, bead.alpha );
		bead.color = PS.RGBString( bead.alphaRed, bead.alphaGreen, bead.alphaBlue );
	}
	else
	{
		bead.alphaRed = r;
		bead.alphaGreen = g;
		bead.alphaBlue = b;
		bead.color = PS.RGBString( r, g, b );
	}

	if ( bead.visible )
	{
		if ( PS.Grid.flash && bead.flash )
		{
			PS.FlashStart(x, y);
		}
		else
		{
			bead.colorNow = bead.color;
			PS.DrawBead(bead);
		}
	}

	return rgb;
};

PS.BeadColor = function (x, y, rgb)
{
	"use strict";
	var fn, colors, r, g, b, i, j;

	fn = "[PS.BeadColor] ";

	// if no rgb specified, just return current color

	if ( rgb === PS.DEFAULT )
	{
		rgb = PS.DEFAULT_BEAD_COLOR;
		r = PS.DEFAULT_BG_RED;
		g = PS.DEFAULT_BG_GREEN;
		b = PS.DEFAULT_BG_BLUE;
	}
	else if ( (rgb !== undefined) && (rgb !== PS.CURRENT) )
	{
		rgb = PS.ValidRGB( rgb, fn );
		if ( rgb < 0 )
		{
			return PS.ERROR;
		}
		colors = PS.UnmakeRGB( rgb );
		r = colors.r;
		g = colors.g;
		b = colors.b;
	}

	if ( x === PS.ALL )
	{
		if ( y === PS.ALL ) // do entire grid
		{
			for ( j = 0; j < PS.Grid.y; j += 1 )
			{
				for ( i = 0; i < PS.Grid.x; i += 1 )
				{
					rgb = PS.DoBeadColor( i, j, rgb, r, g, b );
				}
			}
		}
		else if ( !PS.CheckY( y, fn ) ) // verify y param
		{
			return PS.ERROR;
		}
		else
		{
			for ( i = 0; i < PS.Grid.x; i += 1 ) // do entire row
			{
				rgb = PS.DoBeadColor( i, y, rgb, r, g, b );
			}
		}
	}
	else if ( y === PS.ALL )
	{
		if ( !PS.CheckX( x, fn ) ) // verify x param
		{
			return PS.ERROR;
		}
		for ( j = 0; j < PS.Grid.y; j += 1 ) // do entire column
		{
			rgb = PS.DoBeadColor( x, j, rgb, r, g, b );
		}
	}
	else if ( !PS.CheckX( x, fn ) || !PS.CheckY( y, fn ) ) // verify both params
	{
		return PS.ERROR;
	}
	else
	{
		rgb = PS.DoBeadColor( x, y, rgb, r, g, b ); // do one bead
	}

	return rgb;
};

// PS.BeadAlpha(x, y, a)
// Returns and optionally sets a bead's alpha
// [x, y] are grid position
// Optional [a] must be a number between 0.0 and 1.0

PS.DoBeadAlpha = function ( x, y, a )
{
	"use strict";
	var i, bead;

	// Assume x/y params are already verified

	i = x + (y * PS.Grid.x); // get index of bead
	bead = PS.Grid.beads[i];

	if ( (a === undefined) || (a === PS.CURRENT) || (a === bead.alpha) )
	{
		return bead.alpha;
	}

	// Calc new color between background and base

	bead.alpha = a;
	bead.dirty = true;
	if ( bead.alpha < PS.DEFAULT_ALPHA ) // Calc new color based on alpha
	{
		bead.alphaRed = PS.Dissolve( PS.Grid.bgRed, bead.red, a );
		bead.alphaGreen = PS.Dissolve( PS.Grid.bgGreen, bead.green, a );
		bead.alphaBlue = PS.Dissolve( PS.Grid.bgBlue, bead.blue, a );
		bead.color = PS.RGBString( bead.alphaRed, bead.alphaGreen, bead.alphaBlue );
	}
	else
	{
		bead.alphaRed = bead.red;
		bead.alphaGreen = bead.green;
		bead.alphaBlue = bead.blue;
		bead.color = PS.RGBString( bead.red, bead.green, bead.blue );
	}
	if ( bead.visible )
	{
		if ( PS.Grid.flash && bead.flash )
		{
			PS.FlashStart(x, y);
		}
		else
		{
			bead.colorNow = bead.color;
			PS.DrawBead(bead);
		}
	}

	return a;
};

PS.BeadAlpha = function (x, y, a)
{
	"use strict";
	var fn, i, j;

	fn = "[PS.BeadAlpha] ";

	if ( a !== undefined )
	{
		if ( typeof a !== "number" )
		{
			PS.Oops(fn + "alpha param is not a number");
			return PS.ERROR;
		}

		// clamp value

		a = Math.floor(a);
		if ( a === PS.DEFAULT )
		{
			a = PS.DEFAULT_ALPHA;
		}
		else if ( a !== PS.CURRENT )
		{
			if ( a < 0 )
			{
				a = 0;
			}
			else if ( a > PS.DEFAULT_ALPHA )
			{
				a = PS.DEFAULT_ALPHA;
			}
		}
	}

	if ( x === PS.ALL )
	{
		if ( y === PS.ALL ) // do entire grid
		{
			for ( j = 0; j < PS.Grid.y; j += 1 )
			{
				for ( i = 0; i < PS.Grid.x; i += 1 )
				{
					a = PS.DoBeadAlpha( i, j, a );
				}
			}
		}
		else if ( !PS.CheckY( y, fn ) ) // verify y param
		{
			return PS.ERROR;
		}
		else
		{
			for ( i = 0; i < PS.Grid.x; i += 1 ) // do entire row
			{
				a = PS.DoBeadAlpha( i, y, a );
			}
		}
	}
	else if ( y === PS.ALL )
	{
		if ( !PS.CheckX( x, fn ) ) // verify x param
		{
			return PS.ERROR;
		}
		for ( j = 0; j < PS.Grid.y; j += 1 ) // do entire column
		{
			a = PS.DoBeadAlpha( x, j, a );
		}
	}
	else if ( !PS.CheckX( x, fn ) || !PS.CheckY( y, fn ) ) // verify both params
	{
		return PS.ERROR;
	}
	else
	{
		a = PS.DoBeadAlpha( x, y, a ); // do one bead
	}

	return a;
};

// PS.BeadBorderWidth (x, y, width)
// Returns and optionally sets a bead's border width
// [x, y] are grid position
// Optional [width] must be a number

PS.DoBeadBorderWidth = function (x, y, width)
{
	"use strict";
	var i, bead;

	// Assume x/y params are already verified

	i = x + (y * PS.Grid.x); // get index of bead
	bead = PS.Grid.beads[i];

	if ( (width === undefined) || (width === PS.CURRENT) ) // if no width or PS.CURRENT, return current width
	{
		return bead.borderWidth;
	}

	bead.borderWidth = width;

	if ( bead.visible )
	{
		PS.DrawBead(bead);
	}

	return width;
};

PS.BeadBorderWidth = function (x, y, width)
{
	"use strict";
	var fn, i, j;

	fn = "[PS.BeadBorderWidth] ";

	if ( width === PS.DEFAULT )
	{
		width = PS.DEFAULT_BORDER_WIDTH;
	}
	else if ( (width !== undefined) && (width !== PS.CURRENT) )
	{
		if ( typeof width !== "number" )
		{
			PS.Oops(fn + "width param is not a number");
			return PS.ERROR;
		}
		width = Math.floor(width);
		if ( width < 0 )
		{
			width = 0;
		}
		else if ( width > PS.BORDER_WIDTH_MAX )
		{
			width = PS.BORDER_WIDTH_MAX;
		}
	}

	if ( x === PS.ALL )
	{
		if ( y === PS.ALL ) // do entire grid
		{
			for ( j = 0; j < PS.Grid.y; j += 1 )
			{
				for ( i = 0; i < PS.Grid.x; i += 1 )
				{
					width = PS.DoBeadBorderWidth( i, j, width );
				}
			}
		}
		else if ( !PS.CheckY( y, fn ) ) // verify y param
		{
			return PS.ERROR;
		}
		else
		{
			for ( i = 0; i < PS.Grid.x; i += 1 ) // do entire row
			{
				width = PS.DoBeadBorderWidth( i, y, width );
			}
		}
	}
	else if ( y === PS.ALL )
	{
		if ( !PS.CheckX( x, fn ) ) // verify x param
		{
			return PS.ERROR;
		}
		for ( j = 0; j < PS.Grid.y; j += 1 ) // do entire column
		{
			width = PS.DoBeadBorderWidth( x, j, width );
		}
	}
	else if ( !PS.CheckX( x, fn ) || !PS.CheckY( y, fn ) ) // verify both params
	{
		return PS.ERROR;
	}
	else
	{
		width = PS.DoBeadBorderWidth( x, y, width ); // do one bead
	}

	return width;
};

// PS.BeadBorderColor (x, y, rgb)
// Returns and optionally sets a bead's border color
// [x, y] are grid position
// Optional [rgb] must be a multiplexed rgb value (0xRRGGBB)

PS.DoBeadBorderColor = function (x, y, rgb, r, g, b)
{
	"use strict";
	var i, bead;

	// Assume x/y params are already verified

	i = x + (y * PS.Grid.x); // get index of bead
	bead = PS.Grid.beads[i];

	if ( (rgb === undefined) || (rgb === PS.CURRENT) ) // if no rgb or PS.CURRENT, return current color
	{
		return (bead.borderRed * PS.REDSHIFT) + (bead.borderGreen * 256) + bead.borderBlue;
	}

	bead.borderRed = r;
	bead.borderGreen = g;
	bead.borderBlue = b;
	if ( bead.borderAlpha < PS.DEFAULT_ALPHA )
	{
		r = PS.Dissolve( PS.Grid.bgRed, r, bead.borderAlpha );
		g = PS.Dissolve( PS.Grid.bgGreen, g, bead.borderAlpha );
		b = PS.Dissolve( PS.Grid.bgBlue, b, bead.borderAlpha );
	}
	bead.borderColor = PS.RGBString( r, g, b );

	if ( bead.visible )
	{
		PS.DrawBead(bead);
	}

	return rgb;
};

PS.BeadBorderColor = function (x, y, rgb)
{
	"use strict";
	var fn, colors, r, g, b, i, j;

	fn = "[PS.BeadBorderColor] ";

	if ( rgb === PS.DEFAULT )
	{
		rgb = PS.DEFAULT_BORDER_COLOR;
		r = PS.DEFAULT_BORDER_RED;
		g = PS.DEFAULT_BORDER_GREEN;
		b = PS.DEFAULT_BORDER_BLUE;
	}
	else if ( (rgb !== undefined) && (rgb !== PS.CURRENT) )
	{
		rgb = PS.ValidRGB( rgb, fn );
		if ( rgb < 0 )
		{
			return PS.ERROR;
		}
		colors = PS.UnmakeRGB( rgb );
		r = colors.r;
		g = colors.g;
		b = colors.b;
	}

	if ( x === PS.ALL )
	{
		if ( y === PS.ALL ) // do entire grid
		{
			for ( j = 0; j < PS.Grid.y; j += 1 )
			{
				for ( i = 0; i < PS.Grid.x; i += 1 )
				{
					rgb = PS.DoBeadBorderColor( i, j, rgb, r, g, b );
				}
			}
		}
		else if ( !PS.CheckY( y, fn ) ) // verify y param
		{
			return PS.ERROR;
		}
		else
		{
			for ( i = 0; i < PS.Grid.x; i += 1 ) // do entire row
			{
				rgb = PS.DoBeadBorderColor( i, y, rgb, r, g, b );
			}
		}
	}
	else if ( y === PS.ALL )
	{
		if ( !PS.CheckX( x, fn ) ) // verify x param
		{
			return PS.ERROR;
		}
		for ( j = 0; j < PS.Grid.y; j += 1 ) // do entire column
		{
			rgb = PS.DoBeadBorderColor( x, j, rgb, r, g, b );
		}
	}
	else if ( !PS.CheckX( x, fn ) || !PS.CheckY( y, fn ) ) // verify both params
	{
		return PS.ERROR;
	}
	else
	{
		rgb = PS.DoBeadBorderColor( x, y, rgb, r, g, b ); // do one bead
	}

	return rgb;
};

// PS.BeadBorderAlpha(x, y, a)
// Returns a bead's border alpha and optionally changes it
// [x, y] are grid position
// Optional [a] must be a number between 0.0 and 1.0

PS.DoBeadBorderAlpha = function (x, y, a)
{
	"use strict";
	var i, bead, r, g, b;

	// Assume x/y params are already verified

	i = x + (y * PS.Grid.x); // get index of bead
	bead = PS.Grid.beads[i];

	if ( (a === undefined) || (a === PS.CURRENT) || (a === bead.borderAlpha) )
	{
		return bead.borderAlpha;
	}

	bead.borderAlpha = a;
	if ( a < PS.DEFAULT_ALPHA )
	{
		r = PS.Dissolve( PS.Grid.bgRed, bead.borderRed, a );
		g = PS.Dissolve( PS.Grid.bgGreen, bead.borderGreen, a );
		b = PS.Dissolve( PS.Grid.bgBlue, bead.borderBlue, a );
		bead.borderColor = PS.RGBString( r, g, b );
	}
	else
	{
		bead.borderColor = PS.RGBString( bead.borderRed, bead.borderGreen, bead.borderBlue );
	}
	if ( bead.visible )
	{
		PS.DrawBead(bead);
	}
	return a;
};

PS.BeadBorderAlpha = function (x, y, a)
{
	"use strict";
	var fn, i, j;

	fn = "[PS.BeadBorderAlpha] ";

	if ( a !== undefined )
	{
		if ( typeof a !== "number" )
		{
			PS.Oops(fn + "alpha param is not a number");
			return PS.ERROR;
		}

		// clamp value

		a = Math.floor(a);
		if ( a === PS.DEFAULT )
		{
			a = PS.DEFAULT_ALPHA;
		}
		else if ( a !== PS.CURRENT )
		{
			if ( a < 0 )
			{
				a = 0;
			}
			else if ( a > PS.DEFAULT_ALPHA )
			{
				a = PS.DEFAULT_ALPHA;
			}
		}
	}

	if ( x === PS.ALL )
	{
		if ( y === PS.ALL ) // do entire grid
		{
			for ( j = 0; j < PS.Grid.y; j += 1 )
			{
				for ( i = 0; i < PS.Grid.x; i += 1 )
				{
					a = PS.DoBeadBorderAlpha( i, j, a );
				}
			}
		}
		else if ( !PS.CheckY( y, fn ) ) // verify y param
		{
			return PS.ERROR;
		}
		else
		{
			for ( i = 0; i < PS.Grid.x; i += 1 ) // do entire row
			{
				a = PS.DoBeadBorderAlpha( i, y, a );
			}
		}
	}
	else if ( y === PS.ALL )
	{
		if ( !PS.CheckX( x, fn ) ) // verify x param
		{
			return PS.ERROR;
		}
		for ( j = 0; j < PS.Grid.y; j += 1 ) // do entire column
		{
			a = PS.DoBeadBorderAlpha( x, j, a );
		}
	}
	else if ( !PS.CheckX( x, fn ) || !PS.CheckY( y, fn ) ) // verify both params
	{
		return PS.ERROR;
	}
	else
	{
		a = PS.DoBeadBorderAlpha( x, y, a ); // do one bead
	}

	return a;
};

// PS.BeadGlyph(x, y, g)
// Returns a bead's glyph and optionally changes it
// [x, y] are grid position
// Optional [g] must be either a string or a number

PS.DoBeadGlyph = function (x, y, g)
{
	"use strict";
	var i, bead;

	// Assume x/y params are already verified

	i = x + (y * PS.Grid.x); // get index of bead
	bead = PS.Grid.beads[i];

	if ( (g === undefined) || (g === PS.CURRENT) || (g === bead.glyph) )
	{
		return bead.glyph;
	}

	bead.glyph = g;
	bead.glyphStr = String.fromCharCode(g);
	if ( bead.visible )
	{
		if ( PS.Grid.flash && bead.flash )
		{
			PS.FlashStart(x, y);
		}
		else
		{
			bead.colorNow = bead.color;
			PS.DrawBead(bead);
		}
	}

	return g;
};

PS.BeadGlyph = function (x, y, g)
{
	"use strict";
	var fn, type, i, j;

	fn = "[PS.BeadGlyph] ";

	// if no glyph specified, just return current border status

	type = typeof g;
	if ( type !== "undefined" )
	{
		if ( type === "string" )
		{
			if ( g.length < 1 )
			{
				PS.Oops(fn + "glyph param is empty string");
				return 0;
			}
			g = g.charCodeAt(0); // use only first character
		}
		else if ( type === "number" )
		{
			g = Math.floor(g);
			if ( g === PS.DEFAULT )
			{
				g = 0;
			}
			else if ( g !== PS.CURRENT )
			{
				if ( g < 0 )
				{
					g = 0;
				}
			}
		}
		else
		{
			PS.Oops(fn + "glyph param not a string or number");
			return PS.ERROR;
		}
	}

	if ( x === PS.ALL )
	{
		if ( y === PS.ALL ) // do entire grid
		{
			for ( j = 0; j < PS.Grid.y; j += 1 )
			{
				for ( i = 0; i < PS.Grid.x; i += 1 )
				{
					g = PS.DoBeadGlyph( i, j, g );
				}
			}
		}
		else if ( !PS.CheckY( y, fn ) ) // verify y param
		{
			return PS.ERROR;
		}
		else
		{
			for ( i = 0; i < PS.Grid.x; i += 1 ) // do entire row
			{
				g = PS.DoBeadGlyph( i, y, g );
			}
		}
	}
	else if ( y === PS.ALL )
	{
		if ( !PS.CheckX( x, fn ) ) // verify x param
		{
			return PS.ERROR;
		}
		for ( j = 0; j < PS.Grid.y; j += 1 ) // do entire column
		{
			g = PS.DoBeadGlyph( x, j, g );
		}
	}
	else if ( !PS.CheckX( x, fn ) || !PS.CheckY( y, fn ) ) // verify both params
	{
		return PS.ERROR;
	}
	else
	{
		g = PS.DoBeadGlyph( x, y, g ); // do one bead
	}

	return g;
};

// PS.BeadGlyphColor (x, y, rgb)
// Returns and optionally sets a bead's glyph color
// [x, y] are grid position
// Optional [rgb] must be a multiplexed rgb value (0xRRGGBB)

PS.DoBeadGlyphColor = function (x, y, rgb, r, g, b)
{
	"use strict";
	var i, bead;

	// Assume x/y params are already verified

	i = x + (y * PS.Grid.x); // get index of bead
	bead = PS.Grid.beads[i];

	if ( (rgb === undefined) || (rgb === PS.CURRENT) ) // if no rgb or PS.CURRENT, return current color
	{
		return (bead.glyphRed * PS.REDSHIFT) + (bead.glyphGreen * 256) + bead.glyphBlue;
	}

	bead.glyphRed = r;
	bead.glyphGreen = g;
	bead.glyphBlue = b;
	if ( bead.alpha < PS.DEFAULT_ALPHA ) // Calc new color based on alpha
	{
		r = PS.Dissolve( PS.Grid.bgRed, r, bead.alpha );
		g = PS.Dissolve( PS.Grid.bgGreen, g, bead.alpha );
		b = PS.Dissolve( PS.Grid.bgBlue, b, bead.alpha );
	}
	bead.glyphColor = PS.RGBString( r, g, b );

	if ( bead.visible && (bead.glyph > 0) )
	{
		PS.DrawBead(bead);
	}
	return rgb;
};

PS.BeadGlyphColor = function (x, y, rgb)
{
	"use strict";
	var fn, colors, r, g, b, i, j;

	fn = "[PS.BeadGlyphColor] ";

	if ( rgb === PS.DEFAULT )
	{
		rgb = PS.DEFAULT_GLYPH_COLOR;
		r = PS.DEFAULT_GLYPH_RED;
		g = PS.DEFAULT_GLYPH_GREEN;
		b = PS.DEFAULT_GLYPH_BLUE;
	}
	else if ( (rgb !== undefined) && (rgb !== PS.CURRENT) )
	{
		rgb = PS.ValidRGB( rgb, fn );
		if ( rgb < 0 )
		{
			return PS.ERROR;
		}
		colors = PS.UnmakeRGB( rgb );
		r = colors.r;
		g = colors.g;
		b = colors.b;
	}

	if ( x === PS.ALL )
	{
		if ( y === PS.ALL ) // do entire grid
		{
			for ( j = 0; j < PS.Grid.y; j += 1 )
			{
				for ( i = 0; i < PS.Grid.x; i += 1 )
				{
					rgb = PS.DoBeadGlyphColor( i, j, rgb, r, g, b );
				}
			}
		}
		else if ( !PS.CheckY( y, fn ) ) // verify y param
		{
			return PS.ERROR;
		}
		else
		{
			for ( i = 0; i < PS.Grid.x; i += 1 ) // do entire row
			{
				rgb = PS.DoBeadGlyphColor( i, y, rgb, r, g, b );
			}
		}
	}
	else if ( y === PS.ALL )
	{
		if ( !PS.CheckX( x, fn ) ) // verify x param
		{
			return PS.ERROR;
		}
		for ( j = 0; j < PS.Grid.y; j += 1 ) // do entire column
		{
			rgb = PS.DoBeadGlyphColor( x, j, rgb, r, g, b );
		}
	}
	else if ( !PS.CheckX( x, fn ) || !PS.CheckY( y, fn ) ) // verify both params
	{
		return PS.ERROR;
	}
	else
	{
		rgb = PS.DoBeadGlyphColor( x, y, rgb, r, g, b ); // do one bead
	}

	return rgb;
};

// PS.BeadFlash(x, y, flag)
// Returns a bead's flash status and optionally changes it
// [x, y] are grid position
// Optional [flag] must be 1/true or 0/false

PS.DoBeadFlash = function (x, y, flag)
{
	"use strict";
	var i, bead;

	// Assume x/y params are already verified

	i = x + (y * PS.Grid.x); // get index of bead
	bead = PS.Grid.beads[i];

	if ( (flag === undefined) || (flag === PS.CURRENT) )
	{
		return bead.flash;
	}

	bead.flash = flag;
	return flag;
};

PS.BeadFlash = function (x, y, flag)
{
	"use strict";
	var fn, i, j;

	fn = "[PS.BeadFlash] ";

	// normalize flag value to t/f if defined

	if ( (flag !== undefined) && (flag !== PS.CURRENT) )
	{
		if ( flag === PS.DEFAULT )
		{
			flag = true;
		}
		else if ( flag )
		{
			flag = true;
		}
		else
		{
			flag = false;
		}
	}

	if ( x === PS.ALL )
	{
		if ( y === PS.ALL ) // do entire grid
		{
			for ( j = 0; j < PS.Grid.y; j += 1 )
			{
				for ( i = 0; i < PS.Grid.x; i += 1 )
				{
					flag = PS.DoBeadFlash( i, j, flag );
				}
			}
		}
		else if ( !PS.CheckY( y, fn ) ) // verify y param
		{
			return PS.ERROR;
		}
		else
		{
			for ( i = 0; i < PS.Grid.x; i += 1 ) // do entire row
			{
				flag = PS.DoBeadFlash( i, y, flag );
			}
		}
	}
	else if ( y === PS.ALL )
	{
		if ( !PS.CheckX( x, fn ) ) // verify x param
		{
			return PS.ERROR;
		}
		for ( j = 0; j < PS.Grid.y; j += 1 ) // do entire column
		{
			flag = PS.DoBeadFlash( x, j, flag );
		}
	}
	else if ( !PS.CheckX( x, fn ) || !PS.CheckY( y, fn ) ) // verify both params
	{
		return PS.ERROR;
	}
	else
	{
		flag = PS.DoBeadFlash( x, y, flag ); // do one bead
	}

	return flag;
};

// PS.BeadFlashColor (x, y, rgb)
// Returns and optionally sets a bead's flash color
// [x, y] are grid position
// Optional [rgb] must be a multiplexed rgb value (0xRRGGBB)

PS.DoBeadFlashColor = function (x, y, rgb, r, g, b)
{
	"use strict";
	var i, bead;

	// Assume x/y params are already verified

	i = x + (y * PS.Grid.x); // get index of bead
	bead = PS.Grid.beads[i];

	if ( (rgb === undefined) || (rgb === PS.CURRENT) ) // if no rgb or PS.CURRENT, return current color
	{
		return (bead.flashRed * PS.REDSHIFT) + (bead.flashGreen * 256) + bead.flashBlue;
	}

	bead.flashRed = r;
	bead.flashGreen = g;
	bead.flashBlue = b;
	bead.flashColor = PS.RGBString(r, g, b);

	return rgb;
};

PS.BeadFlashColor = function (x, y, rgb)
{
	"use strict";
	var fn, r, g, b, colors, i, j;

	fn = "[PS.BeadFlashColor] ";

	if ( rgb === PS.DEFAULT )
	{
		rgb = PS.DEFAULT_FLASH_COLOR;
		r = PS.DEFAULT_FLASH_RED;
		g = PS.DEFAULT_FLASH_GREEN;
		b = PS.DEFAULT_FLASH_BLUE;
	}
	else if ( (rgb !== undefined) && (rgb !== PS.CURRENT) )
	{
		rgb = PS.ValidRGB( rgb, fn );
		if ( rgb < 0 )
		{
			return PS.ERROR;
		}
		colors = PS.UnmakeRGB( rgb );
		r = colors.r;
		g = colors.g;
		b = colors.b;
	}

	if ( x === PS.ALL )
	{
		if ( y === PS.ALL ) // do entire grid
		{
			for ( j = 0; j < PS.Grid.y; j += 1 )
			{
				for ( i = 0; i < PS.Grid.x; i += 1 )
				{
					rgb = PS.DoBeadFlashColor( i, j, rgb, r, g, b );
				}
			}
		}
		else if ( !PS.CheckY( y, fn ) ) // verify y param
		{
			return PS.ERROR;
		}
		else
		{
			for ( i = 0; i < PS.Grid.x; i += 1 ) // do entire row
			{
				rgb = PS.DoBeadFlashColor( i, y, rgb, r, g, b );
			}
		}
	}
	else if ( y === PS.ALL )
	{
		if ( !PS.CheckX( x, fn ) ) // verify x param
		{
			return PS.ERROR;
		}
		for ( j = 0; j < PS.Grid.y; j += 1 ) // do entire column
		{
			rgb = PS.DoBeadFlashColor( x, j, rgb, r, g, b );
		}
	}
	else if ( !PS.CheckX( x, fn ) || !PS.CheckY( y, fn ) ) // verify both params
	{
		return PS.ERROR;
	}
	else
	{
		rgb = PS.DoBeadFlashColor( x, y, rgb, r, g, b ); // do one bead
	}

	return rgb;
};

// PS.BeadData(x, y, data)
// Returns a bead's data and optionally changes it
// [x, y] are grid position
// Optional [data] can be any data type

PS.DoBeadData = function (x, y, data)
{
	"use strict";
	var i, bead;

	// Assume x/y params are already verified

	i = x + (y * PS.Grid.x); // get index of bead
	bead = PS.Grid.beads[i];

	if ( data !== undefined )
	{
		bead.data = data;
	}

	return bead.data;
};

PS.BeadData = function (x, y, data)
{
	"use strict";
	var fn, i, j;

	fn = "[PS.BeadData] ";

	if ( x === PS.ALL )
	{
		if ( y === PS.ALL ) // do entire grid
		{
			for ( j = 0; j < PS.Grid.y; j += 1 )
			{
				for ( i = 0; i < PS.Grid.x; i += 1 )
				{
					data = PS.DoBeadData( i, j, data );
				}
			}
		}
		else if ( !PS.CheckY( y, fn ) ) // verify y param
		{
			return PS.ERROR;
		}
		else
		{
			for ( i = 0; i < PS.Grid.x; i += 1 ) // do entire row
			{
				data = PS.DoBeadData( i, y, data );
			}
		}
	}
	else if ( y === PS.ALL )
	{
		if ( !PS.CheckX( x, fn ) ) // verify x param
		{
			return PS.ERROR;
		}
		for ( j = 0; j < PS.Grid.y; j += 1 ) // do entire column
		{
			data = PS.DoBeadData( x, j, data );
		}
	}
	else if ( !PS.CheckX( x, fn ) || !PS.CheckY( y, fn ) ) // verify both params
	{
		return PS.ERROR;
	}
	else
	{
		data = PS.DoBeadData( x, y, data ); // do one bead
	}

	return data;
};

// PS.BeadAudio(x, y, audio, volume)
// Returns a bead's audio file and optionally changes it (and its volume)
// [x, y] are grid position
// Optional [audio] must be a string
// Optional [volume] should be between 0 and 100 inclusive

PS.DoBeadAudio = function (x, y, audio, volume)
{
	"use strict";
	var i, bead;

	// Assume x/y params are already verified

	i = x + (y * PS.Grid.x); // get index of bead
	bead = PS.Grid.beads[i];

	if ( (audio !== undefined) && (audio !== PS.CURRENT) )
	{
		bead.audio = audio;
	}

	if ( (volume !== undefined) && (volume !== PS.CURRENT) )
	{
		bead.volume = volume;
	}

	return bead.audio;
};

PS.BeadAudio = function (x, y, audio, volume)
{
	"use strict";
	var fn, i, j;

	fn = "[PS.BeadAudio] ";

	// check audio file param

	if ( (audio !== undefined) && (audio !== PS.CURRENT) )
	{
		if ( audio === PS.DEFAULT )
		{
			audio = null;
		}
		else if ( typeof audio !== "string" )
		{
			PS.Oops(fn + "audio param is not a string");
			return PS.ERROR;
		}
		else if ( audio.length < 1 )
		{
			audio = null;
		}
	}

	// check volume param

	if ( (volume !== undefined) && (volume !== PS.CURRENT) )
	{
		if ( volume === PS.DEFAULT )
		{
			volume = PS.DEFAULT_VOLUME;
		}
		else if ( typeof volume !== "number" )
		{
			PS.Oops(fn + "volume param is not a number");
			return PS.ERROR;
		}
		else
		{
			if ( volume < 0 )
			{
				volume = 0;
			}
			else if ( volume > PS.DEFAULT_VOLUME )
			{
				volume = PS.DEFAULT_VOLUME;
			}
		}
	}
	
	if ( x === PS.ALL )
	{
		if ( y === PS.ALL ) // do entire grid
		{
			for ( j = 0; j < PS.Grid.y; j += 1 )
			{
				for ( i = 0; i < PS.Grid.x; i += 1 )
				{
					audio = PS.DoBeadAudio( i, j, audio, volume );
				}
			}
		}
		else if ( !PS.CheckY( y, fn ) ) // verify y param
		{
			return PS.ERROR;
		}
		else
		{
			for ( i = 0; i < PS.Grid.x; i += 1 ) // do entire row
			{
				audio = PS.DoBeadAudio( i, y, audio, volume );
			}
		}
	}
	else if ( y === PS.ALL )
	{
		if ( !PS.CheckX( x, fn ) ) // verify x param
		{
			return PS.ERROR;
		}
		for ( j = 0; j < PS.Grid.y; j += 1 ) // do entire column
		{
			audio = PS.DoBeadAudio( x, j, audio, volume );
		}
	}
	else if ( !PS.CheckX( x, fn ) || !PS.CheckY( y, fn ) ) // verify both params
	{
		return PS.ERROR;
	}
	else
	{
		audio = PS.DoBeadAudio( x, y, audio, volume ); // do one bead
	}

	return audio;
};

// PS.BeadFunction(x, y, func)
// Returns a bead's exec function and optionally changes it
// [x, y] are grid position
// Optional [func] must be a JavaScript function

PS.DoBeadFunction = function (x, y, exec)
{
	"use strict";
	var i, bead;

	// Assume x/y params are already verified

	i = x + (y * PS.Grid.x); // get index of bead
	bead = PS.Grid.beads[i];

	if ( (exec !== undefined) && (exec !== PS.CURRENT) )
	{
		bead.exec = exec;
	}

	return bead.exec;
};

PS.BeadFunction = function (x, y, exec)
{
	"use strict";
	var fn, i, j;

	fn = "[PS.BeadFunction] ";

	if ( (exec !== undefined) || (exec !== PS.CURRENT) )
	{
		if ( exec === PS.DEFAULT )
		{
			exec = null;
		}
		else if ( typeof exec !== "function" )
		{
			PS.Oops(fn + "exec param not a valid function");
			return PS.ERROR;
		}
	}

	if ( x === PS.ALL )
	{
		if ( y === PS.ALL ) // do entire grid
		{
			for ( j = 0; j < PS.Grid.y; j += 1 )
			{
				for ( i = 0; i < PS.Grid.x; i += 1 )
				{
					exec = PS.DoBeadFunction( i, j, exec );
				}
			}
		}
		else if ( !PS.CheckY( y, fn ) ) // verify y param
		{
			return PS.ERROR;
		}
		else
		{
			for ( i = 0; i < PS.Grid.x; i += 1 ) // do entire row
			{
				exec = PS.DoBeadFunction( i, y, exec );
			}
		}
	}
	else if ( y === PS.ALL )
	{
		if ( !PS.CheckX( x, fn ) ) // verify x param
		{
			return PS.ERROR;
		}
		for ( j = 0; j < PS.Grid.y; j += 1 ) // do entire column
		{
			exec = PS.DoBeadFunction( x, j, exec );
		}
	}
	else if ( !PS.CheckX( x, fn ) || !PS.CheckY( y, fn ) ) // verify both params
	{
		return PS.ERROR;
	}
	else
	{
		exec = PS.DoBeadFunction( x, y, exec ); // do one bead
	}

	return exec;
};

// PS.BeadTouch(x, y, mask)
// Simulates effect of clicking on a bead
// [x, y] are grid position

PS.DoBeadTouch = function (x, y)
{
	"use strict";
	var i, bead;

	// Assume x/y params are already verified

	i = x + (y * PS.Grid.x); // get index of bead
	bead = PS.Grid.beads[i];

	// Play bead audio

	if ( typeof bead.audio === "string" )
	{
		PS.AudioPlay(bead.audio, bead.volume);
	}

	// Run bead exec

	if ( typeof bead.exec === "function" )
	{
		bead.exec(x, y, bead.data);
	}

	// Simulate click

	PS.Click(x, y, bead.data);
};

PS.BeadTouch = function (x, y)
{
	"use strict";
	var fn, i, j;

	fn = "[PS.BeadTouch] ";

	if ( x === PS.ALL )
	{
		if ( y === PS.ALL ) // do entire grid
		{
			for ( j = 0; j < PS.Grid.y; j += 1 )
			{
				for ( i = 0; i < PS.Grid.x; i += 1 )
				{
					PS.DoBeadTouch( i, j );
				}
			}
		}
		else if ( !PS.CheckY( y, fn ) ) // verify y param
		{
			return;
		}
		else
		{
			for ( i = 0; i < PS.Grid.x; i += 1 ) // do entire row
			{
				PS.DoBeadTouch( i, y );
			}
		}
	}
	else if ( y === PS.ALL )
	{
		if ( !PS.CheckX( x, fn ) ) // verify x param
		{
			return;
		}
		for ( j = 0; j < PS.Grid.y; j += 1 ) // do entire column
		{
			PS.DoBeadTouch( x, j );
		}
	}
	else if ( !PS.CheckX( x, fn ) || !PS.CheckY( y, fn ) ) // verify both params
	{
		return;
	}
	else
	{
		PS.DoBeadTouch( x, y ); // do one bead
	}
};

// Set message text

PS.Status = "Perlenspiel";
PS.StatusHue = 0;

PS.StatusText = function (str)
{
	"use strict";
	var fn, type, e;

	fn = "[PS.StatusText] ";

	type = typeof str;
	if ( type !== "undefined" )
	{
		if ( type !== "string" )
		{
			PS.Oops(fn + "Parameter is not a string");
		}
		else
		{
			e = document.getElementById("status");
			if ( e )
			{
				if ( PS.StatusFading ) // start the fade
				{
					e.style.color = PS.Grid.bgColor;
					PS.StatusPhase = 0;
				}
				e.value = str;							
			}
			PS.Status = str;
		}
	}
	return PS.Status;
};

PS.StatusColor = function (rgb)
{
	"use strict";
	var fn, colors, e;

	fn = "[PS.StatusText] ";

	if ( (rgb !== undefined) && (rgb !== PS.CURRENT) )
	{
		rgb = PS.ValidRGB( rgb, fn );
		if ( rgb < 0 )
		{
			return PS.ERROR;
		}
		if ( rgb === PS.DEFAULT )
		{
			rgb = PS.DEFAULT_TEXT_COLOR;
		}
		colors = PS.UnmakeRGB(rgb);
		PS.StatusRed = colors.r;
		PS.StatusGreen = colors.g;
		PS.StatusBlue = colors.b;
		PS.StatusHue = PS.RGBString(colors.r, colors.g, colors.b);
		PS.StatusPhase = 100; // stops fades in progress
		
		e = document.getElementById("status");
		if ( e )
		{
			e.style.color = PS.StatusHue;
		}
		e = document.getElementById("footer");
		if ( e )
		{
			e.style.color = PS.StatusHue;
		}
	}

	return PS.StatusHue;
};

// Turn status line fading on and off

PS.StatusFade = function (flag)
{
	"use strict";
	var fn, e;

	fn = "[PS.StatusFade] ";

	if ( (flag !== undefined) && (flag !== PS.CURRENT) )
	{
		if ( flag || (flag === PS.DEFAULT) )
		{
			flag = true;
		}
		else
		{
			flag = false;
			PS.StatusPhase = 100;
			e = document.getElementById("status");
			if ( e )
			{
				e.style.color = PS.StatusHue;
			}			
		}
		PS.StatusFading = flag;
	}

	return PS.StatusFading;
};

// Debugger API

// Open debugger if not already open

PS.DebugOpen = function ()
{
	"use strict";
	var div, e;

	if ( !PS.DebugWindow )
	{
		div = document.getElementById("debug");
		div.style.display = "inline";

		// clear it

		e = document.getElementById("monitor");
		if ( e )
		{
			e.value = "";
		}

		PS.DebugWindow = true;
	}
};

// Close debugger if not already closed

PS.DebugClose = function ()
{
	"use strict";
	var e;

	if ( PS.DebugWindow )
	{
		e = document.getElementById("debug");
		e.style.display = "none";
		PS.DebugWindow = false;
	}
};

// Add line to debugger (does not include CR)

PS.Debug = function (str)
{
	"use strict";
	var e;

	if ( typeof str !== "string" )
	{
		return;
	}

	PS.DebugOpen();

	e = document.getElementById("monitor");
	if ( e )
	{
		e.value += str; // add it
		e.scrollTop = e.scrollHeight; // keep it scrolled down
	}
};

// Clear footer and debugger

PS.DebugClear = function ()
{
	"use strict";
	var e;

	e = document.getElementById("footer");
	if ( e )
	{
		e.style.color="#000000"; // change to black
		e.innerHTML = "Version 2.0.0";
	}

	if ( PS.DebugWindow )
	{
		e = document.getElementById("monitor");
		if ( e )
		{
			e.value = "";
		}
	}
};

// Send error message to footer and debugger if open (includes CR)

PS.Oops = function (str)
{
	"use strict";
	var e;

	if ( typeof str !== "string" )
	{
		return;
	}

	e = document.getElementById("footer");
	if ( e )
	{
		e.innerHTML = str;
	}

	// Also display on debugger if open

//	if ( PS.DebugWindow )
//	{
//		e = document.getElementById("monitor");
//		if ( e )
//		{
//			e.value += ("ERROR: " + str + "\n");
//			e.scrollTop = e.scrollHeight; // keep it scrolled down			
//		}
//	}

	PS.Debug( "ERROR: " + str + "\n" );

	PS.AudioPlay("fx_uhoh");
};

// Set up user clock

PS.Clock = function ( ticks )
{
	"use strict";
	var fn;

	fn = "[PS.Clock] ";

	if ( ticks !== undefined )
	{
		if ( typeof ticks !== "number" )
		{
			PS.Oops(fn + "ticks parameter not a number");
			return PS.ERROR;
		}
		ticks = Math.floor(ticks);
		if ( ticks < 1 )
		{
			PS.UserClock = 0;
		}
		else if ( typeof PS.Tick !== "function" )
		{
			PS.Oops(fn + "PS.Tick function undefined");
		}
		else
		{
			PS.UserDelay = 0;
			PS.UserClock = ticks;
		}
	}

	return PS.UserClock;
};

// General system timer

PS.Timer = function ()
{
	"use strict";
	var phase, hue, r, g, b, e;

	// Handle bead flashing and status text fading

	PS.FlashDelay += 1;
	if ( PS.FlashDelay >= PS.FLASH_INTERVAL )
	{
		PS.FlashDelay = 0;
		PS.FlashNext();
		
		// Handle status text fading
		
		if ( PS.StatusFading && (PS.StatusPhase < 100) )
		{
			phase = PS.StatusPhase + PS.STATUS_FLASH_STEP;

			if ( phase >= 100 )
			{
				phase = 100;
				hue = PS.StatusHue;
			}
			else
			{				
				r = PS.Dissolve( PS.Grid.bgRed, PS.StatusRed, phase );
				g = PS.Dissolve( PS.Grid.bgGreen, PS.StatusGreen, phase );
				b = PS.Dissolve( PS.Grid.bgBlue, PS.StatusBlue, phase );
				hue = PS.RGBString(r, g, b);
			}
			PS.StatusPhase = phase;			
			e = document.getElementById("status");
			if ( e )
			{
				e.style.color = hue;
			}
		}
	}

	// Handle user clock

	if ( PS.UserClock > 0 )
	{
		PS.UserDelay += 1;
		if ( PS.UserDelay >= PS.UserClock )
		{
			PS.UserDelay = 0;
			if ( PS.Tick )
			{
				try
				{
					PS.Tick(); // call user function
				}
				catch (err)
				{
					PS.Oops("PS.Tick() failed [" + err.message + "]" );
					PS.UserClock = 0; // stop the timer
				}				
			}
		}
	}
};

// PS.StartFlash(bead)
// Initiates flashing of bead

PS.FlashStart = function (x, y)
{
	"use strict";
	var which, bead, i, len;

	which = x + (y * PS.Grid.x); // index of bead

	bead = PS.Grid.beads[which];

	bead.flashPhase = 0; // init flash step

	// draw first step

	bead.colorNow = bead.flashColor;
	PS.DrawBead(bead);

	// if this bead is already in flash queue, exit

	len = PS.Grid.flashList.length;
	for ( i = 0; i < len; i += 1 )
	{
		if ( PS.Grid.flashList[i] === which )
		{
			return;
		}
	}

	// else add this bead to queue

	PS.Grid.flashList.push(which);
};

// PS.NextFlash(bead)
// Flash all beads in queue

PS.FlashNext = function ()
{
	"use strict";
	var ctx, len, i, which, bead, phase, r, g, b;

	ctx = PS.Context();
	len = PS.Grid.flashList.length;
	i = 0;
	while ( i < len )
	{
		which = PS.Grid.flashList[i];
		bead = PS.Grid.beads[which];
		phase = bead.flashPhase + PS.FLASH_STEP;

		// If flash is done, set normal color and remove bead from queue

		if ( phase >= 100 )
		{
			bead.colorNow = bead.color;
			bead.flashPhase = 0;
			PS.Grid.flashList.splice(i, 1);
			len -= 1;
		}
		else
		{
			bead.flashPhase = phase;
			r = PS.Dissolve( bead.flashRed, bead.alphaRed, phase );
			g = PS.Dissolve( bead.flashGreen, bead.alphaGreen, phase );
			b = PS.Dissolve( bead.flashBlue, bead.alphaBlue, phase );
			bead.colorNow = PS.RGBString(r, g, b);
			i += 1;
		}
		PS.DrawBead(bead, ctx);
	}
};

// System initialization

// Records the x/y of mouse over grid, -1 if not over grid

PS.MouseXY = function (event)
{
	"use strict";
	var canvas, x, y, beads, bead, row, col, i;

	if ( PS.Grid )
	{
		canvas = document.getElementById("screen");

	    if ( event.x && event.y )
	    {
			x = event.x;
			y = event.y;
		}
		else // Firefox method to get the position
		{
			x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}

		x -= canvas.offsetLeft;
		y -= canvas.offsetTop;

		// Over the grid?

		if ( (x >= PS.Grid.left) && (x < PS.Grid.right) && (y >= PS.Grid.top) && (y < PS.Grid.bottom) )
		{
			// Which bead are we over?

			beads = PS.Grid.beads;
			i = 0; // init index
			for ( row = 0; row < PS.Grid.y; row += 1 )
			{
				bead = beads[i]; // get the first bead in this row

				// Is mouse over this row?

				if ( (y >= bead.top) && (y < bead.bottom) )
				{
					// Find column

					for ( col = 0; col < PS.Grid.x; col += 1 )
					{
						bead = beads[i];
						if ( (x >= bead.left) && (x < bead.right) )
						{
							PS.MouseX = col;
							PS.MouseY = row;
							return;
						}
						i += 1;
					}
				}
				else
				{
					i += PS.Grid.x; // try next row	
				}
			}
		}
	}

	PS.MouseX = -1;
	PS.MouseY = -1;
};

// Called when mouse is clicked over canvas

PS.MouseDown = function (event)
{
	"use strict";
	var bead;

	PS.MouseXY(event);
	if ( PS.MouseX >= 0 )
	{
		bead = PS.Grid.beads[PS.MouseX + (PS.MouseY * PS.Grid.x)];

		// play audio if assigned to bead

		if ( bead.audio )
		{
			PS.AudioPlay(bead.audio, bead.volume);
		}

		// Call function if assigned to bead

		if ( typeof bead.exec === "function" )
		{			
			try
			{
				bead.exec(PS.MouseX, PS.MouseY, bead.data);		
			}
			catch (err1)
			{
				PS.Oops("Bead " + PS.MouseX + ", " + PS.MouseY + " function failed [" + err1.message + "]" );
			}			
		}

		if ( PS.Click ) // only if function exists
		{			
			try
			{
				PS.Click(PS.MouseX, PS.MouseY, bead.data);		
			}
			catch (err2)
			{
				PS.Oops("PS.Click() failed [" + err2.message + "]" );
			}			
		}
	}
};

// Called when mouse is released over canvas

PS.MouseUp = function (event)
{
	"use strict";
	var bead;

	if ( PS.Grid && PS.Release ) // only if grid and function exist
	{
		PS.MouseXY(event);
		if ( PS.MouseX >= 0 )
		{
			bead = PS.Grid.beads[PS.MouseX + (PS.MouseY * PS.Grid.x)];			
			try
			{
				PS.Release(PS.MouseX, PS.MouseY, bead.data);		
			}
			catch (err)
			{
				PS.Oops("PS.Release() failed [" + err.message + "]" );
			}			
		}
	}
};

// Called when mouse moves over canvas

PS.MouseMove = function (event)
{
	"use strict";
	var bead, last;

	PS.MouseXY(event);

	if ( PS.MouseX >= 0 )
	{
		bead = PS.Grid.beads[PS.MouseX + (PS.MouseY * PS.Grid.x)];
		if ( (PS.MouseX !== PS.LastX) || (PS.MouseY !== PS.LastY) )
		{
			if ( PS.Leave ) // only if function exists
			{
				if ( PS.LastX >= 0 )
				{
					last = PS.Grid.beads[PS.LastX + (PS.LastY * PS.Grid.x)];			
					try
					{
						PS.Leave(PS.LastX, PS.LastY, last.data);		
					}
					catch (err1)
					{
						PS.Oops("PS.Leave() failed [" + err1.message + "]" );
					}					
				}
			}
			if ( PS.Enter ) // only if function exists
			{			
				try
				{
					PS.Enter(PS.MouseX, PS.MouseY, bead.data);	
				}
				catch (err2)
				{
					PS.Oops("PS.Enter() failed [" + err2.message + "]" );
				}				
			}
			PS.LastX = PS.MouseX;
			PS.LastY = PS.MouseY;
		}
	}
	else if ( PS.LastX >= 0 )
	{
		if ( PS.Leave ) // only if function exists
		{
			last = PS.Grid.beads[PS.LastX + (PS.LastY * PS.Grid.x)];			
			try
			{
				PS.Leave(PS.LastX, PS.LastY, last.data);		
			}
			catch (err3)
			{
				PS.Oops("PS.Leave() failed [" + err3.message + "]" );
			}			
		}
		PS.LastX = -1;
		PS.LastY = -1;
	}
};

// Called when mouse leaves canvas

PS.MouseOut = function (event)
{
	"use strict";
	var last;

	PS.MouseBead = -1;
	if ( PS.Grid && PS.Leave ) // only if grid and function exist
	{
		if ( PS.LastBead >= 0 )
		{
			last = PS.Grid.beads[PS.LastBead];			
			try
			{
				PS.Leave(last.x, last.y, last.data);		
			}
			catch (err)
			{
				PS.Oops("PS.Leave() failed [" + err.message + "]" );
			}			
		}
	}
	PS.LastBead = -1;
};

PS.KeyFilter = function (key, shift)
{
	"use strict";
	
	// convert lower-case alpha to upper-case if shift key is down
	
	if ( (key >= 65) && (key <= 90) )
	{
		if ( shift )
		{
			key += 32; 
		}
		return key;
	}
	
	// Convert weird keycodes to ASCII
	
	switch ( key )
	{
		case 188:
			key = 44; // ,
			break;
		case 190:
			key = 46; // .
			break;
		case 191:
			key = 47; // /
			break;
		case 222:
			key = 39; // '
			break;
		case 219:
			key = 91; // [
			break;
		case 221:
			key = 93; // ]
			break;
		case 220:
			key = 92; // \
			break;
		default:
			break;
	}
		
	// Translate shifted keys
			
	if ( shift )
	{
		switch ( key )
		{
			case 96: // `
				key = 126; // ~
				break;
			case 49: // 1
				key = 33; // !
				break;
			case 50: // 2
				key = 64; // @
				break;
			case 51: // 3
				key = 35; // #
				break;
			case 52: // 4
				key = 36; // !
				break;
			case 53: // 5
				key = 37; // %
				break;
			case 54: // 6
				key = 94; // ^
				break;
			case 55: // 7
				key = 38; // &
				break;
			case 56: // 8
				key = 42; // *
				break;
			case 57: // 9
				key = 40; // (
				break;
			case 48: // 0
				key = 41; // )
				break;
			case 45: // -
				key = 95; // _
				break;
			case 61: // =
				key = 43; // +
				break;					
			case 91: // [
				key = 123; // {
				break;
			case 93: // ]
				key = 125; // }
				break;
			case 92: // \
				key = 124; // |
				break;					
			case 59: // ;
				key = 58; // :
				break;
			case 39: // '
				key = 34; // "
				break;					
			case 44: // ,
				key = 60; // <
				break;
			case 46: // .
				key = 62; // >
				break;
			case 47: // /
				key = 63; // ?
				break;
			default:
				break;
		}		
	}

	return key;
};

// Called when a key is pressed

PS.SysKeyDown = function (event)
{
	"use strict";
	var key;

	if ( PS.KeyDown ) // only if function exists
	{
		if ( event.which === null )
		{
			key = event.keyCode;    // IE
		}
		else
		{
			key = event.which;	  // Others
		}
		key = PS.KeyFilter(key, event.shiftKey);
		try
		{
			PS.KeyDown(key, event.shiftKey, event.ctrlKey);		
		}
		catch (err)
		{
			PS.Oops("PS.KeyDown() failed [" + err.message + "]" );
		}
	}
	return false;
};

// Called when a key is released

PS.SysKeyUp = function (event)
{
	"use strict";
	var key;

	if ( PS.KeyUp ) // only if function exists
	{
		if ( event.which === null )
		{
			key = event.keyCode;    // IE
		}
		else
		{
			key = event.which;	  // Others
		}
		key = PS.KeyFilter(key, event.shiftKey);
		try
		{
			PS.KeyUp(key, event.shiftKey, event.ctrlKey);		
		}
		catch (err)
		{
			PS.Oops("PS.KeyUp() failed [" + err.message + "]" );
		}
	}
	return false;
};

// Called when mouse wheel is moved

PS.SysWheel = function (event)
{
	"use strict";
	var delta;

	if ( PS.Wheel ) // only if function exists
	{
		delta = 0;

		// for IE

		if ( !event )
		{
			event = window.event;
		}

		// IE and Opera

		if ( event.wheelDelta )
		{
			delta = event.wheelDelta / 120;
	        if ( window.opera )
	        {
				delta = -delta;
	        }
		}

		// Firefox and Chrome?

		else if ( event.detail )
		{
			delta = -( event.detail / 3 );
		}

		if ( event.preventDefault )
		{
			event.preventDefault();
		}

		// clamp
		
		if ( delta >= PS.FORWARD )
		{
			delta = PS.FORWARD;
		}
		else
		{
			delta = PS.BACKWARD;
		}
		
		// Send delta to user
		
		try
		{
			PS.Wheel (delta);
		}
		catch (err)
		{
			PS.Oops("PS.Wheel() failed [" + err.message + "]" );
		}
	}

	event.returnValue = false;
};

// Initialization

PS.Sys = function ()
{
	"use strict";
	var fn, e;

	fn = "[PS.Sys] ";

	// Init audio support, preload error sound

	PS.AudioInit();
	PS.AudioLoad("fx_uhoh");

	// Make sure all required game functions exist

	if ( typeof PS.Init !== "function" )
	{
		PS.Init = null;
		PS.Oops(fn + "WARNING: PS.Init function undefined");
	}

	if ( typeof PS.Click !== "function" )
	{
		PS.Click = null;
		PS.Oops(fn + "WARNING: PS.Click function undefined");
	}

	if ( typeof PS.Release !== "function" )
	{
		PS.Release = null;
		PS.Oops(fn + "WARNING: PS.Release function undefined");
	}

	if ( typeof PS.Enter !== "function" )
	{
		PS.Enter = null;
		PS.Oops(fn + "WARNING: PS.Enter function undefined");
	}

	if ( typeof PS.Leave !== "function" )
	{
		PS.Leave = null;
		PS.Oops(fn + "WARNING: PS.Leave function undefined");
	}

	if ( typeof PS.KeyDown !== "function" )
	{
		PS.KeyDown = null;
		PS.Oops(fn + "WARNING: PS.KeyDown function undefined");
	}

	if ( typeof PS.KeyUp !== "function" )
	{
		PS.KeyUp = null;
		PS.Oops(fn + "WARNING: PS.KeyUp function undefined");
	}

	if ( typeof PS.Wheel !== "function" )
	{
		PS.Wheel = null;
		PS.Oops(fn + "WARNING: PS.Wheel function undefined");
	}

	// Set up mouse/keyboard events

	e = document.getElementById("screen");
	if ( e )
	{
	    e.addEventListener("mousedown", PS.MouseDown, false);
	    e.addEventListener("mouseup", PS.MouseUp, false);
	    e.addEventListener("mouseout", PS.MouseOut, false);
	    e.addEventListener("mousemove", PS.MouseMove, false);
   }

    // Set up mouse wheel events

    if ( window.addEventListener )
    {
		window.addEventListener('DOMMouseScroll', PS.SysWheel, false); // for Firefox
		window.addEventListener('mousewheel', PS.SysWheel, false); // for others
	}
	else
	{
		window.onmousewheel = document.onmousewheel = PS.SysWheel; // for IE, maybe
	}
	
	// Setup offscreen canvas for image manipulation
	
	PS.ImageCanvas = document.createElement("canvas");
	PS.ImageCanvas.width = PS.GRID_MAX;
	PS.ImageCanvas.height = PS.GRID_MAX;

	// Start the timer

	window.setInterval (PS.Timer, PS.DEFAULT_FPS);

	// Print version number

	e = document.getElementById("footer");
	if ( e )
	{
		e.innerHTML = "Version " + PS.VERSION;
	}

	if ( PS.Init )
	{
		try
		{
			PS.Init(); // call user initializer
		}
		catch (err)
		{
			PS.Oops("PS.Init() failed [" + err.message + "]" );
		}		
	}
	else
	{
		PS.GridSize(PS.GRID_DEFAULT_WIDTH, PS.GRID_DEFAULT_HEIGHT);
	}
};

// Library stuff

PS.Random = function (val)
{
	"use strict";
	var fn;

	fn = "[PS.Random] ";
	if ( typeof val !== "number" )
	{
		PS.Oops(fn + "Parameter is not a number");
		return PS.ERROR;
	}	
	val = Math.floor(val);
	if ( val < 2 )
	{
		return 1;
	}

	val = Math.random() * val;
	val = Math.floor(val) + 1;
	return val;
};

PS.PianoFiles = [
	"a0", "bb0", "b0",
	"c1", "db1", "d1", "eb1", "e1", "f1", "gb1", "g1", "ab1", "a1", "bb1", "b1",
	"c2", "db2", "d2", "eb2", "e2", "f2", "gb2", "g2", "ab2", "a2", "bb2", "b2",
	"c3", "db3", "d3", "eb3", "e3", "f3", "gb3", "g3", "ab3", "a3", "bb3", "b3",
	"c4", "db4", "d4", "eb4", "e4", "f4", "gb4", "g4", "ab4", "a4", "bb4", "b4",
	"c5", "db5", "d5", "eb5", "e5", "f5", "gb5", "g5", "ab5", "a5", "bb5", "b5",
	"c6", "db6", "d6", "eb6", "e6", "f6", "gb6", "g6", "ab6", "a6", "bb6", "b6",
	"c7", "db7", "d7", "eb7", "e7", "f7", "gb7", "g7", "ab7", "a7", "bb7", "b7",
	"c8"
];

PS.Piano = function ( val, flag )
{
	"use strict";
	var fn, str;

	fn = "[PS.Piano] ";

	if ( typeof val !== "number" )
	{
		PS.Oops(fn + "Parameter is not a number");
		return PS.ERROR;
	}
	val = Math.floor(val);
	if ( val < 1 )
	{
		val = 1;
	}
	else if ( val > 88 )
	{
		val = 88;
	}

	str = "piano_" + PS.PianoFiles[val - 1];
	if ( flag )
	{
		str = "l_" + str;
	}
	return str;
};

PS.HchordFiles = [
	"a2", "bb2", "b2",
	"c3", "db3", "d3", "eb3", "e3", "f3", "gb3", "g3", "ab3", "a3", "bb3", "b3",
	"c4", "db4", "d4", "eb4", "e4", "f4", "gb4", "g4", "ab4", "a4", "bb4", "b4",
	"c5", "db5", "d5", "eb5", "e5", "f5", "gb5", "g5", "ab5", "a5", "bb5", "b5",
	"c6", "db6", "d6", "eb6", "e6", "f6", "gb6", "g6", "ab6", "a6", "bb6", "b6",
	"c7", "db7", "d7", "eb7", "e7", "f7"
];

PS.Harpsichord = function ( val, flag )
{
	"use strict";
	var fn, str;

	fn = "[PS.Harpsichord] ";

	if ( typeof val !== "number" )
	{
		PS.Oops(fn + "Parameter is not a number");
		return PS.ERROR;
	}
	val = Math.floor(val);
	if ( val < 1 )
	{
		val = 1;
	}
	else if ( val > 57 )
	{
		val = 57;
	}

	str = "hchord_" + PS.HchordFiles[val - 1];
	if ( flag )
	{
		str = "l_" + str;
	}
	return str;
};

PS.XyloFiles = [
	"a4", "bb4", "b4",
	"c5", "db5", "d5", "eb5", "e5", "f5", "gb5", "g5", "ab5", "a5", "bb5", "b5",
	"c6", "db6", "d6", "eb6", "e6", "f6", "gb6", "g6", "ab6", "a6", "bb6", "b6",
	"c7", "db7", "d7", "eb7", "e7", "f7", "gb7", "g7", "ab7", "a7", "bb7", "b7"
];

PS.Xylophone = function ( val )
{
	"use strict";
	var fn, str;

	fn = "[PS.Xylophone] ";

	if ( typeof val !== "number" )
	{
		PS.Oops(fn + "Parameter is not a number");
		return PS.ERROR;
	}
	val = Math.floor(val);
	if ( val < 1 )
	{
		val = 1;
	}
	else if ( val > 39 )
	{
		val = 39;
	}

	str = "xylo_" + PS.XyloFiles[val - 1];
	return str;
};

// Audio functions

PS.AUDIO_PATH_DEFAULT = "http://users.wpi.edu/~bmoriarty/ps/audio/"; // case sensitive!
PS.AUDIO_PATH = PS.AUDIO_PATH_DEFAULT;
PS.AUDIO_MAX_CHANNELS = 32;
PS.AudioChannels = [];

PS.AudioInit = function ()
{
	"use strict";
	var i;

	for ( i = 0; i < PS.AUDIO_MAX_CHANNELS; i += 1 )
	{
		PS.AudioChannels[i] = {};
		PS.AudioChannels[i].audio = new Audio();
		PS.AudioChannels[i].done = -1;
		PS.AudioChannels[i].id = "";
	}
};

PS.AudioError = function (obj)
{
	"use strict";
	var c, str;

	c = obj.error.code;
	switch ( c )
    {
		case 1:
			str = "MEDIA_ERR_ABORTED";
			break;
		case 2:
			str = "MEDIA_ERR_NETWORK";
			break;
		case 3:
			str = "MEDIA_ERR_DECODE";
			break;
		case 4:
			str = "MEDIA_ERR_SRC_NOT_SUPPORTED";
			break;
		default:
			str = "UNKNOWN";
			break;
    }

	PS.Oops("[Audio Error: " + str + "]\n");	
};

PS.AudioPath = function (path)
{
	"use strict";
	var fn;
	
	fn = "[PS.AudioPath] ";

	if ( path === PS.DEFAULT )
	{
		PS.AUDIO_PATH = PS.AUDIO_PATH_DEFAULT;
	}
	else if ( typeof path !== "string" )
	{
		PS.Oops(fn + "path parameter is not a string");
		return PS.ERROR;		
	}
	else
	{
		PS.AUDIO_PATH = path;	
	}
	
	return PS.AUDIO_PATH;
};

PS.AudioLoad = function (id, path)
{
	"use strict";
	var fn, snd;

	fn = "[PS.AudioLoad] ";

	if ( typeof id !== "string" )
	{
		PS.Oops(fn + "id parameter is not a string");
		return PS.ERROR;		
	}
	if ( id.length < 1 )
	{
		PS.Oops(fn + "id parameter is an empty string");
		return PS.ERROR;			
	}

	if ( path === undefined )
	{
		path = PS.AUDIO_PATH;
	}
	else if ( path === PS.DEFAULT )
	{
		path = PS.AUDIO_PATH_DEFAULT;	
	}
	else if ( typeof path !== "string" )
	{
		PS.Oops(fn + "path parameter is not a string");
		return PS.ERROR;		
	}

	// Already got this? Clone it

	snd = document.getElementById(id);
	if ( snd )
	{
		return snd;
	}

	path = path + id + ".wav";

	snd = document.createElement("audio");
	snd.setAttribute("src", path);
	snd.setAttribute("id", id);	
	snd.setAttribute("preload", "auto");
	snd.setAttribute("onerror", "PS.AudioError(this)");

//	src = document.createElement("source");
//	src.setAttribute("src", path + ".ogg");
//	src.setAttribute("type", "audio/ogg");
//	snd.appendChild(src);
	
//	src = document.createElement("source");
//	src.setAttribute("src", path + ".mp3");
//	src.setAttribute("type", "audio/mpeg");
//	src.setAttribute("onerror", "PS.AudioError()");
//	snd.appendChild(src);

//	src = document.createElement("source");
//	src.setAttribute("src", path + ".wav");
//	src.setAttribute("type", "audio/x-wav");
//	snd.appendChild(src);

	document.body.appendChild(snd);
	snd.load();

	return snd;
};

// Returns a channel number

PS.AudioPlay = function (id, volume, func, path)
{
	"use strict";
	var fn, i, snd, d, t, channel;

	fn = "[PS.AudioPlay] ";

	if ( (volume === undefined) || (volume === PS.DEFAULT) )
	{
		volume = PS.DEFAULT_VOLUME;
	}
	else if ( typeof volume !== "number" )
	{
		PS.Oops(fn + "volume parameter is not a number");
		return PS.ERROR;	
	}
	else if ( volume < 0 )
	{
		volume = 0;
	}
	else if ( volume > PS.DEFAULT_VOLUME )
	{
		volume = PS.DEFAULT_VOLUME;
	}
	
	if ( (func !== undefined) && (typeof func !== "function") )
	{
		PS.Oops(fn + "func parameter is not a function");
		return PS.ERROR;			
	}	

	snd = PS.AudioLoad(id, path);
	if ( snd !== PS.ERROR )
	{			
		snd.volume = volume;
		if ( func !== undefined )
		{
			snd.addEventListener("ended", func);
		}
		for ( i = 0; i < PS.AUDIO_MAX_CHANNELS; i += 1 )
		{
			d = new Date();
			t = d.getTime();
			channel = PS.AudioChannels[i];
			if ( channel.done < t )
			{
				channel.done = t + ( snd.duration * 1000 );
				channel.audio = snd;
				channel.id = id;
				snd.load(); // WHY???
				snd.play();
				return i + 1; // channel id
			}
		}
	}

	return PS.ERROR; // error
};

// Stops playback of channel number

PS.AudioStop = function (c)
{
	"use strict";
	var fn, d, t, channel;

	fn = "[PS.AudioStop] ";

	if ( typeof c !== "number" )
	{
		PS.Oops(fn + "Parameter is not a number");
		return PS.ERROR;		
	}
	c = Math.floor(c);
	if ( (c < 1) || (c > PS.AUDIO_MAX_CHANNELS) )
	{
		PS.Oops(fn + "Invalid channel id");
		return PS.ERROR;			
	}

	channel = PS.AudioChannels[c - 1];
	d = new Date();
	t = d.getTime();			

	channel.done = t; // mark as done playing
	channel.audio.pause();
	channel.audio.currentTime = 0;

	return c;
};

// Pauses/unpauses playback of channel number

PS.AudioPause = function (c)
{
	"use strict";
	var fn, channel, audio;

	fn = "[PS.AudioPause] ";

	if ( typeof c !== "number" )
	{
		PS.Oops(fn + "Parameter is not a number");
		return PS.ERROR;		
	}
	c = Math.floor(c);
	if ( (c < 1) || (c > PS.AUDIO_MAX_CHANNELS) )
	{
		PS.Oops(fn + "Invalid channel id");
		return PS.ERROR;			
	}

	channel = PS.AudioChannels[c - 1];
	audio = channel.audio;	
	if ( audio.paused )
	{
		audio.play();
	}
	else
	{
		audio.pause();
	}

	return c;
};

// Image functions

PS.ImageLoad = function ( file, func )
{
	"use strict";
	var fn, img;
	
	fn = "[PS.ImageLoad] ";
	
	if ( typeof file !== "string" )
	{
		PS.Oops(fn + "Parameter 1 is not a string");
		return PS.ERROR;
	}
	if ( file.length < 1 )
	{
		PS.Oops(fn + "Parameter 1 is an empty string");
		return PS.ERROR;	
	}
	if ( (func !== undefined) && (typeof func !== "function") )
	{
		PS.Oops(fn + "Parameter 2 is not a function");
		return PS.ERROR;		
	}	
	try
	{
		img = new Image();
		if ( func !== undefined )
		{
			img.onload = func;
		}
		img.src = file;
		return img;
	}
	catch (err)
	{
		PS.Oops(fn + "failed [" + err.message + "]");
		return PS.ERROR;
	}
};

// Extract an imageData table from an image file
// optional [alpha] determines if alpha data if included

PS.ImageData = function ( img, alpha )
{
	"use strict";
	var fn, w, h, ctx, imgData, imgData2, i, j, len, d1, d2;
	
	fn = "[PS.ImageMap] ";
	if ( (alpha === undefined) || !alpha )
	{
		alpha = false;	
	}
	else
	{
		alpha = true;
	}
	
	w = img.width;
	if ( (typeof w !== "number") || (w < 0) )
	{
		PS.Oops(fn + "Invalid width parameter");
		return PS.ERROR;		
	}
	w = Math.floor(w);
	if ( w > PS.GRID_MAX )
	{
		w = PS.GRID_MAX;
	}
	
	h = img.height;
	if ( (typeof h !== "number") || (h < 0) )
	{
		PS.Oops(fn + "Invalid height parameter");
		return PS.ERROR;		
	}
	h = Math.floor(h);
	if ( h > PS.GRID_MAX )
	{
		h = PS.GRID_MAX;
	}

	// draw the image onto the offscreen canvas

	try
	{
		ctx = PS.ImageCanvas.getContext("2d");
		ctx.drawImage(img, 0, 0);
	}
	catch (err)
	{
		PS.Oops(fn + "failed @ 1 [" + err.message + "]");
		return PS.ERROR;
	}	
			
	// fetch the data and return it

	try
	{
		imgData = ctx.getImageData(0, 0, w, h);
	}
	catch (err2)
	{
		PS.Oops(fn + "failed @ 2 [" + err2.message + "]");
		return PS.ERROR;
	}
	
	// imgData is read-only for some reason
	// so make a copy of it
	
	imgData2 = {};
	imgData2.width = imgData.width;
	imgData2.height = imgData.height;
	
	d1 = imgData.data;
	len = d1.length;
	d2 = []; // new data array
	i = 0;
	j = 0;	
	
	// if alpha data is not wanted, remove it
	
	if ( !alpha )
	{		
		d2.length = (len / 4) * 3;
		while ( i < len )
		{
			d2[j] = d1[i];
			i += 1;
			j += 1;
			d2[j] = d1[i];
			i += 1;
			j += 1;
			d2[j] = d1[i];
			i += 2; // skip alpha
			j += 1;			
		}
		imgData2.pixelSize = 3;		
	}
	else
	{
		d2.length = len;
		while ( i < len )
		{
			d2[j] = d1[i];
			i += 1;
			j += 1;
			d2[j] = d1[i];
			i += 1;
			j += 1;
			d2[j] = d1[i];
			i += 1;
			j += 1;
			d2[j] = d1[i];
			i += 1;
			j += 1;			
		}			
		imgData2.pixelSize = 4;
	}
	
	imgData2.data = d2;
	return imgData2;	
};

PS.ImageBlit = function ( imgdata, xpos, ypos )
{
	"use strict";
	var fn, size, bytes, w, h, pixsize, ptr, drawx, drawy, i, j, r, g, b, a, k, bead;

	fn = "[PS.ImageBlit] ";

	// verify data format

	if ( typeof imgdata !== "object" )
	{
		PS.Oops(fn + "parameter 1 is not a table");
		return PS.ERROR;
	}
	
	bytes = imgdata.data; // check this?
	
	w = imgdata.width;
	if ( typeof w !== "number" )
	{
		PS.Oops(fn + "imgdata.width is not a number");
		return PS.ERROR;		
	}
	w = Math.floor(w);
	if ( w < 1 )
	{
		PS.Oops(fn + "imgdata.width < 1");
		return PS.ERROR;		
	}

	h = imgdata.height;
	if ( typeof h !== "number" )
	{
		PS.Oops(fn + "imgdata.height is not a number");
		return PS.ERROR;		
	}
	h = Math.floor(h);
	if ( h < 1 )
	{
		PS.Oops(fn + "imgdata.height < 1");
		return PS.ERROR;		
	}
	
	pixsize = imgdata.pixelSize;
	if ( (pixsize !== 3) && (pixsize !== 4) )
	{
		PS.Oops(fn + "invalid pixelSize");
		return PS.ERROR;				
	}
	
	size = w * h * pixsize;
	if ( bytes.length !== size )
	{
		PS.Oops(fn + "invalid data length [" + imgdata.data.length + "]");
		return PS.ERROR;		
	}
	
	if ( (xpos === undefined) || (xpos === PS.DEFAULT) )
	{
		xpos = 0;
	}
	else if ( typeof xpos !== "number" )
	{
		PS.Oops(fn + "parameter 2 is not a number");
		return PS.ERROR;		
	}
	else
	{
		xpos = Math.floor(xpos);

		// exit if drawing off grid

		if ( (xpos >= PS.Grid.x) || ((xpos + w) < 1) ) 
		{
			return true;
		}
	}

	if ( (ypos === undefined) || (ypos === PS.DEFAULT) )
	{
		ypos = 0;
	}
	else if ( typeof ypos !== "number" )
	{
		PS.Oops(fn + "parameter 3 is not a number");
		return PS.ERROR;		
	}
	else
	{
		ypos = Math.floor(ypos);
		
		// exit if drawing off grid
		
		if ( (ypos >= PS.Grid.y) || ((ypos + h) < 1) ) 
		{
			return true;
		}
	}
	
	ptr = 0;	
	drawy = ypos;
	for ( j = 0; j < h; j += 1 )
	{
		drawx = xpos;
		if ( drawy >= PS.Grid.y ) // exit if off bottom of grid
		{
			break;
		}
		if ( drawy >= 0 ) // is this row visible?
		{
			for ( i = 0; i < w; i += 1 )
			{
				if ( (drawx >= 0) && (drawx < PS.Grid.x) )
				{
					r = bytes[ptr];
					if ( typeof r !== "number" )
					{
						PS.Oops(fn + "non-numeric red at position " + ptr);
						return PS.ERROR;
					}
					r = Math.floor(r);
					if ( r < 1 )
					{ 
						r = 0;
					}
					else if ( r > 255 )
					{
						r = 255;
					}
					
					g = bytes[ptr + 1];
					if ( typeof g !== "number" )
					{
						PS.Oops(fn + "non-numeric green at position " + ptr);
						return PS.ERROR;
					}
					g = Math.floor(g);
					if ( g < 1 )
					{ 
						g = 0;
					}
					else if ( g > 255 )
					{
						g = 255;
					}
					
					b = bytes[ptr + 2];
					if ( typeof b !== "number" )
					{
						PS.Oops(fn + "non-numeric blue at position " + ptr);
						return PS.ERROR;
					}
					b = Math.floor(b);
					if ( b < 1 )
					{ 
						b = 0;
					}
					else if ( b > 255 )
					{
						b = 255;
					}
					
					if ( pixsize === 4 )
					{
						a = bytes[ptr + 3];
						if ( typeof a !== "number" )
						{
							PS.Oops(fn + "non-numeric alpha at position " + ptr);
							return PS.ERROR;
						}
						a = Math.floor(a / 2.55); // convert 0-255 range to 0-100
						if ( a < 1 )
						{ 
							a = 0;
						}
						else if ( a > PS.DEFAULT_ALPHA )
						{
							a = PS.DEFAULT_ALPHA;
						}
					}
					else
					{
						a = PS.DEFAULT_ALPHA;	
					}
					
					k = drawx + (drawy * PS.Grid.x); // get index of bead
					bead = PS.Grid.beads[k];
				
					bead.dirty = true; // mark this bead as explicitly colored
					if ( a < PS.DEFAULT_ALPHA ) // Calc new color based on alpha-adjusted color of existing bead
					{
						bead.alphaRed = PS.Dissolve( PS.Grid.bgRed, bead.alphaRed, a );
						bead.alphaGreen = PS.Dissolve( PS.Grid.bgGreen, bead.alphaGreen, a );
						bead.alphaBlue = PS.Dissolve( PS.Grid.bgBlue, bead.alphaBlue, a );
						bead.color = PS.RGBString( bead.alphaRed, bead.alphaGreen, bead.alphaBlue );
					}
					else
					{
						bead.alphaRed = r;
						bead.alphaGreen = g;
						bead.alphaBlue = b;
						bead.color = PS.RGBString( r, g, b );
					}
					
					// Do NOT change alpha value of existing bead!
					
					bead.red = r;
					bead.green = g;
					bead.blue = b;
				
					if ( bead.visible )
					{
						bead.flashPhase = 100; // stops flash in progress
						bead.colorNow = bead.color;
						PS.DrawBead(bead);
					}					
				}
				ptr += pixsize;
				drawx += 1;
			}
		}
		else
		{
			ptr += (w * pixsize); // skip this row
		}		
		drawy += 1;		
	}
	
	return true;	
};
