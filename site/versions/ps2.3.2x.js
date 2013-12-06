// ps2.3.js for Perlenspiel 2.3

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

/*jslint nomen: true, white: true */
/*global document, window, Audio, Image, webkitAudioContext, AudioContext, XMLHttpRequest */

// Global namespace variable

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel

( function()
{
    "use strict";
    var lt, v, i, str;
    
    lt = 0;
    v = ["ms", "moz", "webkit", "o"];
    
    for ( i = 0; i < (v.length && !window.requestAnimationFrame); i += 1 )
    {
        str = v[i];
        window.requestAnimationFrame = window[str + "RequestAnimationFrame"];
        window.cancelAnimationFrame = window[str +"CancelAnimationFrame"] || window[str + "CancelRequestAnimationFrame"];
    }
 
    if ( !window.requestAnimationFrame )
    {
        window.requestAnimationFrame = function (cb, e)
        {
            var ct, ttc, id;
            
            ct = new Date().getTime();
            ttc = Math.max(0, 16 - (ct - lt));
            id = window.setTimeout( function () { cb(ct + ttc); }, ttc );
            lt = ct + ttc;
            return id;
        };
	}
 
    if ( !window.cancelAnimationFrame )
    {
        window.cancelAnimationFrame = function (id) { window.clearTimeout(id); };
    }
} ());

var PS = {
	
	// Constants
	
	ERROR: "ERROR", // generic error return value
	DEFAULT: "DEFAULT", // use default value
	CURRENT: "CURRENT", // use current value
	ALL: "ALL", // Use all rows or columns
	EMPTY: "EMPTY", // default bead state (color unassigned)
	
	CVS_W: 480, // max width/height of canvas
	MAIN_ID: "mn",
	STS_ID: "sts",
	CVS_ID: "cvs",
	FTR_ID: "ftr",
	DBG_ID: "dbg",
	MON_ID: "mon",
	G_MAX: 32, // max x/y dimensions of grid
	D_G_W: 8,
	D_G_H: 8,
	D_B_RGB: 0x000000,
	D_B_R: 0x00,
	D_B_G: 0x00,
	D_B_B: 0x00,
	D_BG_RGB: 0xFFFFFF,
	D_BG_R: 0xFF,
	D_BG_G: 0xFF,
	D_BG_B: 0xFF,
	D_BDR_RGB: 0x808080,
	D_BDR_R: 0x80,
	D_BDR_G: 0x80,
	D_BDR_B: 0x80,
	D_BDR_W: 1,
	D_GL_RGB: 0xFFFFFF,
	D_GL_R: 0xFF,
	D_GL_G: 0xFF,
	D_GL_B: 0xFF,
	D_FL_RGB: 0xFFFFFF,
	D_FL_R: 0xFF,
	D_FL_G: 0xFF,
	D_FL_B: 0xFF,
	D_ALPHA: 100, // must be between 0 and 100
	D_FPS: 17, // maximum frame rate in milliseconds (about 1/60th of a second)
	RSHIFT: 256 * 256, // used to decode rgb
	GSHIFT: 256, // used to decode rgb
	FL_STEP: 10, // percent for each flash
	FL_INTERVAL: 5, // number of ticks per flash step (12 fps)
	KEY_RATE: 6, // delay in ticks between key repeats (10/sec)
		
	APP: "Perlenspiel",
	
	// Status line colors
	
	D_ST_RGB: 0x000000,
	D_ST_R: 0x00,
	D_ST_G: 0x00,
	D_ST_B: 0x00,
	
	// General audio
	
	D_AUDIO_PATH: "http://users.wpi.edu/~bmoriarty/ps/audio/", // case sensitive!	
	MAX_VOL: 1.0,
	D_VOL: 0.5,
	D_LOOP: false,
	
	AudioCurrentPath: "",
	
	// Standard HTML5 audio
	
	AUDIO_MAX_CH: 32,
	
	CH_EMPTY: 0,
	CH_LOADING: 1,
	CH_READY: 2,
	CH_PLAYING: 3,
	CH_PAUSED: 4,
	
	AudioChannels: [],
	ChannelsUsed: 0,
	
	// Web Audio API

	AudioContext: null, // context for Web Audio API, null if unavailable
	
//	CHROME_UNSCHEDULED_STATE: 0,
//	CHROME_SCHEDULED_STATE: 1,
//	CHROME_PLAYING_STATE: 2,
//	CHROME_FINISHED_STATE: 3,	

//	AudioID: 0, // id counter for channels
//	ChromeChannels: [], // array for source channels
//	ChromeBuffers: [], // array for buffers
//	ChromeChannelCnt: 0, // number of opened source channels
//	ChromeBufferCnt: 0, // number of opened buffers

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
	ImageCanvas: null, // canvas for image manipulation
	
	BlitCanvas: null, // canvas for blitter
	BlitContext: null, // context for blitter

	LoaderList: [], // image loader list
	LoaderCnt: 0, // id for image loader

	// Coordinates of current and previous beads, -1 if none

	MouseX: -1,
	MouseY: -1,
	LastX: -1,
	LastY: -1,
	
	Pressed: [], // keypress array
	Holding: [], // array of keys being held down
	KeyDelay: 0, // key repeat regulator
	HoldShift: false,
	HoldCtrl: false,
	
	OverCanvas: false, // true when mouse is over canvas
	DebugFocus: false, // true when debugger has focus

	// Delay and clock settings

	FlashDelay: 0,
	UserDelay: 0,
	UserClock: 0,
	
	// Footer control

	FooterColor: 0,
	FooterDelay: 300,
	
	// Status line
	
	D_ST_STEP_UP: 5, // percent for each step	
	D_ST_STEP_DOWN: 5, // percent for each step
	
	Status: "",
	StatusHue: 0, // target hue
	StatusRed: 0,
	StatusGreen: 0,
	StatusBlue: 0,
	
	STS_FPS: 12, // 12 fps for status line effects
	STS_REG: 5, // frame rate regulator constant (60/12)
	D_STS_UP: 60, // default fade up rate
	D_STS_DOWN: 60, // default fade down rate
	D_STS_DELAY: 120, // default fade delay rate
	
	StatusUp: true, // true if fade-up enabled (default: true)
	StatusUpRate: 60, // rate in 60ths of a second (default: 60)
	StatusUpDelay: 5, // all fade effects run at 12 fps
	StatusUpStep: 0, // current step in effect
	StatusUpPhase: 0, // goes from 0-100

	StatusDown: false, // true if fade-up enabled (default: false)
	StatusDownRate: 0, // rate in 60ths of a second (default: 0)
	StatusDownDelay: 5, // fade effects run at 12 fps
	StatusDownStep: 0, // current step in effect
	StatusDownPhase: 0, // goes from 0-100

	StatusDelayRate: 120, // (default: 120)
	StatusDelay: 0,
	
	// version numbers

	MAJ: 2,
	MIN: 3,
	REV: 2
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
	cv = document.getElementById(PS.CVS_ID);
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

// Takes a multiplexed rgb value and creates an object with
// separate r, g and b values, or null if error

PS.UnmakeRGB = function ( rgb )
{
	"use strict";
	var fn, red, green, blue, rval, gval;

	fn = "[PS.UnmakeRGB] ";

	if ( typeof rgb !== "number" )
	{
		return PS.Oops(fn + "RGB parameter not a number");
	}
	rgb = Math.floor(rgb);
	if ( rgb < 0 )
	{
		return PS.Oops(fn + "RGB parameter negative");
	}
	if ( rgb > 0xFFFFFF )
	{
		return PS.Oops(fn + "RGB parameter out of range");
	}

	red = rgb / PS.RSHIFT;
	red = Math.floor(red);
	rval = red * PS.RSHIFT;

	green = (rgb - rval) / PS.GSHIFT;
	green = Math.floor(green);
	gval = green * PS.GSHIFT;

	blue = rgb - rval - gval;

	return { r: red, g: green, b: blue };
};

// Validate overloaded color parameters
// [fn] is name of calling function (for error reporting)
// [rgb], [g] and [b] are parameters
// Returns {r, g, b} color table if valid, else null

PS.ColorParams = function (fn, rgb, g, b)
{
	"use strict";
	var valid, type, red, blue, green, rval, gval;
	
	valid = false;
	type = PS.TypeOf(rgb);

	// if it's a number, it's either a multiplex or the start of a triplet
	
	if ( type === "number" )
	{
		if ( g === undefined ) // assume a multiplex
		{
			if ( (rgb < 0) || (rgb > 0xFFFFFF) )
			{
				PS.Oops(fn + "multiplexed rgb value out of range");
				return null;
			}
			rgb = Math.floor(rgb);
			
			red = rgb / PS.RSHIFT;
			red = Math.floor(red);
			rval = red * PS.RSHIFT;
		
			green = (rgb - rval) / PS.GSHIFT;
			green = Math.floor(green);
			gval = green * PS.GSHIFT;
		
			blue = rgb - rval - gval;
			valid = true; // no need to validate	
		}
		else // assume a triplet
		{
			red = rgb;
			green = g;
			blue = b;
			if ( blue === undefined )
			{
				PS.Oops(fn + "b parameter missing in rgb triplet");
				return null;		
			}	
		}
	}	
	
	// is rgb a valid table?
	
	else if ( type === "object" )
	{
		red = rgb.r;
		if ( red === undefined )
		{
			PS.Oops(fn + "r element missing in rgb table");
			return null;		
		}
		green = rgb.g;
		if ( green === undefined )
		{
			PS.Oops(fn + "g element missing in rgb table");
			return null;		
		}
		blue = rgb.b;
		if ( blue === undefined )
		{
			PS.Oops(fn + "b element missing in rgb table");
			return null;		
		}
	}
	
	// is rgb is a valid array?
	
	else if ( type === "array" )
	{
		if ( rgb.length < 3 )
		{
			PS.Oops(fn + "rgb array length invalid");
			return null;		
		}
		red = rgb[0];
		green = rgb[1];
		blue = rgb[2];	
	}
	else
	{
		PS.Oops(fn + "Invalid color parameter");
		return null;
	}	
	
	// Validate color values
	
	if ( !valid )
	{
		if ( typeof red !== "number" )
		{
			PS.Oops(fn + "red value is not a number");
			return null;
		}
		red = Math.floor(red);
		if ( (red < 0) && (red > 255) )
		{
			PS.Oops(fn + "red value out of range [" + red + "]");
			return null;
		}
	
		if ( typeof green !== "number" )
		{
			PS.Oops(fn + "green value is not a number");
			return null;
		}
		green = Math.floor(green);
		if ( (green < 0) && (green > 255) )
		{
			PS.Oops(fn + "green value out of range [" + green + "]");
			return null;
		}
		
		if ( typeof blue !== "number" )
		{
			PS.Oops(fn + "blue value is not a number");
			return null;
		}
		blue = Math.floor(blue);
		if ( (blue < 0) && (blue > 255) )
		{
			PS.Oops(fn + "blue value out of range [" + blue + "]");
			return null;
		}
	}
	
	return { r: red, g: green, b: blue };	
};

// PS.Dissolve
// Returns a color that is x% between c1 and c2

PS.Dissolve = function ( c1, c2, x )
{
	"use strict";
	var delta;

	if ( (x <= 0) || (c1 === c2) )
	{
		return c1;
	}
	
	if ( x >= 100 )
	{
		return c2;
	}
	
	if ( c1 > c2 )
	{
		delta = c1 - c2;
		delta = ( x * delta ) / 100;
		delta = Math.floor(delta);
		return ( c1 - delta );
	}
	
	delta = c2 - c1;
	delta = ( x * delta ) / 100;
	delta = Math.floor(delta);
	return ( c1 + delta );
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

	bead.visible = true;	// bead visible?
	bead.empty = true;		// bead color unassigned?

	// base colors

	bead.red = PS.D_B_R;
	bead.green = PS.D_B_G;
	bead.blue = PS.D_B_B;
	bead.color = "rgb(" + bead.red + "," + bead.green + "," + bead.blue + ")";
	bead.colorNow = bead.color;	// actual color while drawing

	// pre-calculated alpha colors

	bead.alpha = PS.D_ALPHA;
	bead.alphaRed = PS.D_B_R;
	bead.alphaGreen = PS.D_B_G;
	bead.alphaBlue = PS.D_B_B;

	// glyph params

	bead.glyph = 0;					// glyph code (zero if none)
	bead.glyphStr = "";				// actual string to print
	bead.glyphRed = PS.D_GL_R;
	bead.glyphGreen = PS.D_GL_G;
	bead.glyphBlue = PS.D_GL_B;
	bead.glyphColor = "rgb(" + PS.D_GL_R + "," + PS.D_GL_G + "," + PS.D_GL_B + ")";

	// flash params

	bead.flash = true;				// flashing enabled?
	bead.flashPhase = 0;			// phase of flash animation
	bead.flashRed = PS.D_FL_R;
	bead.flashGreen = PS.D_FL_G;
	bead.flashBlue = PS.D_FL_B;
	bead.flashColor = "rgb(" + PS.D_FL_R + "," + PS.D_FL_G + "," + PS.D_FL_B + ")";

	// border params

	bead.borderWidth = PS.D_BDR_W; // border width; 0 if none
	bead.borderRed = PS.D_BDR_R;
	bead.borderGreen = PS.D_BDR_G;
	bead.borderBlue = PS.D_BDR_B;
	bead.borderAlpha = PS.D_ALPHA;			// border alpha
	bead.borderColor = "rgb(" + PS.D_BDR_R + "," + PS.D_BDR_G + "," + PS.D_BDR_B + ")";

	// data, sound, exec params

	bead.data = 0;					// data value

	bead.audio = null;					// sound (null = none)
	bead.volume = PS.D_VOL;	// volume
	bead.loop = PS.D_LOOP;		// loop flag

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

// Draws [bead]

PS.Bead = function (bead)
{
	"use strict";
	var ctx, offctx, left, top, size, width;

	ctx = PS.Grid.context;
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

	// use background color if bead is empty

	if ( bead.empty )
	{
		offctx.fillStyle = PS.Grid.bgColor;
	}

	// otherwise fill with assigned color

	else
	{
		offctx.fillStyle = bead.colorNow;		
	}

	offctx.fillRect(left, top, size, size);

	if ( bead.glyph > 0 )
	{
		offctx.fillStyle = bead.glyphColor;
		offctx.fillText (bead.glyphStr, PS.Grid.glyphX, PS.Grid.glyphY);
	}

	// blit offscreen canvas to context

	ctx.drawImage(bead.off, bead.left, bead.top);
};

// Erase [bead]

PS.EraseBead = function (bead)
{
	"use strict";
	var ctx, size, left, top, width;

	ctx = PS.Grid.context;
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
	
	grid.context = PS.Context(); // init grid canvas context
	if ( !grid.context )
	{
		return null; // exit if failed
	}

	grid.x = x;					// x dimensions of grid
	grid.y = y;					// y dimensions of grid
	grid.count = x * y;			// number of beads in grid

	// calc size of beads, position/dimensions of centered grid on canvas

	if ( x >= y )
	{
		grid.beadSize = size = Math.floor(PS.CVS_W / x);
		grid.width = size * x;
		grid.height = size * y;
		grid.left = 0;
	}
	else
	{
		grid.beadSize = size = Math.floor(PS.CVS_W / y);
		grid.width = size * x;
		grid.height = size * y;
		grid.left = Math.floor( (PS.CVS_W - grid.width) / 2 );
	}
	
	grid.top = 0;

	grid.right = grid.left + grid.width;
	grid.bottom = grid.top + grid.height;

	grid.bgRed = PS.D_BG_R;
	grid.bgGreen = PS.D_BG_G;
	grid.bgBlue = PS.D_BG_B;
	grid.bgColor = "rgb(" + grid.bgRed + "," + grid.bgGreen + "," + grid.bgBlue + ")";

	grid.borderRed = PS.D_BDR_R;
	grid.borderGreen = PS.D_BDR_G;
	grid.borderBlue = PS.D_BDR_B;
	grid.borderColor = "rgb(" + grid.borderRed + "," + grid.borderGreen + "," + grid.borderBlue + ")";

	grid.borderMax = Math.floor((size - 8) / 2); // make sure 8x8 bead is visible inside border

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
	var beads, cnt, i, bead;

	beads = PS.Grid.beads;
	cnt = PS.Grid.count;

	for ( i = 0; i < cnt; i += 1 )
	{
		bead = beads[i];
		if ( bead.visible )
		{
			PS.Bead(bead);
		}
		else
		{
			PS.EraseBead(bead);
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

// API Functions

// PS.GridSize()
// Returns true on success, else PS.ERROR

PS.GridSize = function (w, h)
{
	"use strict";
	var fn, i, cnt, beads, cv;

	fn = "[PS.GridSize] ";

	if ( typeof w !== "number" )
	{
		return PS.Oops(fn + "Width param not a number");
	}
	if ( typeof h !== "number" )
	{
		return PS.Oops(fn + "Height param not a number");
	}

	w = Math.floor(w);
	if ( w === PS.DEFAULT )
	{
		w = PS.D_G_W;
	}
	else if ( w < 1 )
	{
		PS.Oops(fn + "Width parameter < 1");
		w = 1;
	}
	else if ( w > PS.G_MAX )
	{
		PS.Oops(fn + "Width parameter > " + PS.G_MAX);
		w = PS.G_MAX;
	}

	h = Math.floor(h);
	if ( h === PS.DEFAULT )
	{
		h = PS.D_G_H;
	}
	else if ( h < 1 )
	{
		PS.Oops(fn + "Height parameter < 1");
		h = 1;
	}
	else if ( h > PS.G_MAX )
	{
		PS.Oops(fn + "Height parameter > " + PS.G_MAX);
		h = PS.G_MAX;
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
	if ( !PS.Grid )
	{
		return PS.Oops(fn + "Grid initialization failed");
	}
	
	// Reset mouse coordinates
	
	PS.MouseX = -1;
	PS.MouseY = -1;
	PS.LastX = -1;
	PS.LastY = -1;

	// Erase the canvas

	if ( PS.Grid )
	{
		cv = document.getElementById(PS.CVS_ID);
		if ( cv )
		{
			cv.height = PS.Grid.height; // setting height erases canvas
			PS.DrawGrid();
		}
	}
	
	return true;
};

// PS.GridBGColor()
// Returns rgb of grid background on success, else PS.ERROR

PS.GridBGColor = function ( rgb, g, b )
{
	"use strict";
	var fn, current, colors, red, green, blue, fr, fg, fb, e;

	fn = "[PS.GridBGColor] ";
	current = (PS.Grid.bgRed * PS.RSHIFT) + (PS.Grid.bgGreen * PS.GSHIFT) + PS.Grid.bgBlue;

	// if param or PS.CURRENT, just return current color

	if ( (rgb === undefined) || (rgb === PS.CURRENT) )
	{
		return current;
	}

	if ( rgb === PS.DEFAULT )
	{
		rgb = PS.D_BG_RGB;
		red = PS.D_BG_R;
		green = PS.D_BG_G;
		blue = PS.D_BG_B;
	}
	else
	{
		colors = PS.ColorParams(fn, rgb, g, b);
		if ( !colors )
		{
			return PS.ERROR;
		}
		red = colors.r;
		green = colors.g;
		blue = colors.b;
	}

	PS.Grid.bgRed = red;
	PS.Grid.bgGreen = green;
	PS.Grid.bgBlue = blue;
	PS.Grid.bgColor = "rgb(" + red + "," + green + "," + blue + ")";

	// Reset browser background

	e = document.body;
	e.style.backgroundColor = PS.Grid.bgColor;
	
	// set footer to a complimentary color

	e = document.getElementById(PS.FTR_ID);
	if ( e )
	{
		if ( red > 0x7F )
		{
			fr = 0;
		}
		else
		{
			fr = 0xFF;
		}
		
		if ( green > 0x7F )
		{
			fg = 0;
		}
		else
		{
			fg = 0xFF;
		}
		
		
		if ( blue > 0x7F )
		{
			fb = 0;
		}
		else
		{
			fb = 0xFF;
		}
		PS.FooterColor = "rgb(" + fr + "," + fg + "," + fb + ")";	
		e.style.color = PS.FooterColor;
	}
		
	// reset status line background

	e = document.getElementById(PS.STS_ID);
	if ( e )
	{
		e.style.backgroundColor = PS.Grid.bgColor;
	}

	// redraw canvas

	e = document.getElementById(PS.CVS_ID);
	if ( e )
	{
		e.width = PS.CVS_W; // setting width erases
		PS.DrawGrid();
	}

	return rgb;
};

// PS.MakeRGB (r, g, b)
// Takes three colors and returns multiplexed rgb value, or PS.ERROR if error

PS.MakeRGB = function (r, g, b)
{
	"use strict";
	var fn, rgb;

	fn = "[PS.MakeRGB] ";

	if ( typeof r !== "number" )
	{
		return PS.Oops(fn + "R parameter not a number");
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
		return PS.Oops(fn + "G parameter not a number");
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
		return PS.Oops(fn + "B parameter not a number");
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

	rgb = (r * PS.RSHIFT) + (g * PS.GSHIFT) + b;

	return rgb;
};

// Bead API

// PS.BeadShow(x, y, flag)
// Returns a bead's display status and optionally changes it
// [x, y] are grid position
// Optional [flag] must be 1/true or 0/false

PS.XBShow = function (x, y, flag)
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
			PS.Bead(bead);
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
		if ( (flag === PS.DEFAULT) || flag )
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
					flag = PS.XBShow( i, j, flag );
				}
			}
		}
		else if ( !PS.CheckY( y, fn ) ) // verify y param
		{
			flag = PS.ERROR;
		}
		else
		{
			for ( i = 0; i < PS.Grid.x; i += 1 ) // do entire row
			{
				flag = PS.XBShow( i, y, flag );
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
			flag = PS.XBShow( x, j, flag );
		}
	}
	
	else if ( !PS.CheckX( x, fn ) || !PS.CheckY( y, fn ) ) // verify both params
	{
		flag = PS.ERROR;
	}
	else
	{
		flag = PS.XBShow( x, y, flag ); // do one bead
	}

	return flag;
};

// PS.BeadColor (x, y, rgb)
// Returns and optionally sets a bead's color
// [x, y] are grid position
// Optional [rgb] must be a multiplexed rgb value (0xRRGGBB)

PS.XBHue = function ( x, y, rgb, r, g, b )
{
	"use strict";
	var i, bead;

	// Assume x/y params are already verified

	i = x + (y * PS.Grid.x); // get index of bead
	bead = PS.Grid.beads[i];

	if ( (rgb === undefined) || (rgb === PS.CURRENT) ) // if no rgb or PS.CURRENT, return current color
	{
		if ( bead.empty )
		{
			return PS.EMPTY;
		}
		return (bead.red * PS.RSHIFT) + (bead.green * PS.GSHIFT) + bead.blue;
	}
	
	if ( rgb === PS.EMPTY )
	{
		bead.empty = true;
	}
	else
	{
		bead.empty = false; // mark this bead as assigned	
		bead.red = r;
		bead.green = g;
		bead.blue = b;
		if ( bead.alpha < PS.D_ALPHA ) // Calc new color based on alpha
		{
			bead.alphaRed = PS.Dissolve( PS.Grid.bgRed, r, bead.alpha );
			bead.alphaGreen = PS.Dissolve( PS.Grid.bgGreen, g, bead.alpha );
			bead.alphaBlue = PS.Dissolve( PS.Grid.bgBlue, b, bead.alpha );
			bead.color = "rgb(" + bead.alphaRed + "," + bead.alphaGreen + "," + bead.alphaBlue + ")";
		}
		else
		{
			bead.alphaRed = r;
			bead.alphaGreen = g;
			bead.alphaBlue = b;
			bead.color = "rgb(" + r + "," + g + "," + b + ")";
		}
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
			PS.Bead(bead);
		}
	}

	return rgb;
};

// Now accepts overloaded color parameters
// [rbg] can be either a multiplexed rgb value or an {r, g, b} color table
// else three parameters interpreted as r/g/b triplet
// returns current bead color or PS.ERROR

PS.BeadColor = function (x, y, rgb, g, b)
{
	"use strict";
	var fn, colors, red, green, blue, i, j;

	fn = "[PS.BeadColor] ";

	// if no rgb specified, just return current color

	if ( (rgb === PS.DEFAULT) || (rgb === PS.EMPTY) )
	{
		rgb = PS.EMPTY;
		red = green = blue = undefined;
	}
	else if ( (rgb !== undefined) && (rgb !== PS.CURRENT) )
	{
		colors = PS.ColorParams(fn, rgb, g, b);
		if ( !colors )
		{
			return PS.ERROR;
		}
		red = colors.r;
		green = colors.g;
		blue = colors.b;
	}

	if ( x === PS.ALL )
	{
		if ( y === PS.ALL ) // do entire grid
		{
			for ( j = 0; j < PS.Grid.y; j += 1 )
			{
				for ( i = 0; i < PS.Grid.x; i += 1 )
				{
					rgb = PS.XBHue( i, j, rgb, red, green, blue );
				}
			}
		}
		else if ( !PS.CheckY( y, fn ) ) // verify y param
		{
			rgb = PS.ERROR;
		}
		else
		{
			for ( i = 0; i < PS.Grid.x; i += 1 ) // do entire row
			{
				rgb = PS.XBHue( i, y, rgb, red, green, blue );
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
			rgb = PS.XBHue( x, j, rgb, red, green, blue );
		}
	}
	else if ( !PS.CheckX( x, fn ) || !PS.CheckY( y, fn ) ) // verify both params
	{
		rgb = PS.ERROR;
	}
	else
	{
		rgb = PS.XBHue( x, y, rgb, red, green, blue ); // do one bead
	}

	return rgb;
};

// PS.BeadAlpha(x, y, a)
// Returns and optionally sets a bead's alpha
// [x, y] are grid position
// Optional [a] must be a number between 0.0 and 1.0

PS.XBAlpha = function ( x, y, a )
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
	if ( bead.alpha < PS.D_ALPHA ) // Calc new color based on alpha
	{
		bead.alphaRed = PS.Dissolve( PS.Grid.bgRed, bead.red, a );
		bead.alphaGreen = PS.Dissolve( PS.Grid.bgGreen, bead.green, a );
		bead.alphaBlue = PS.Dissolve( PS.Grid.bgBlue, bead.blue, a );
		bead.color = "rgb(" + bead.alphaRed + "," + bead.alphaGreen + "," + bead.alphaBlue + ")";
	}
	else
	{
		bead.alphaRed = bead.red;
		bead.alphaGreen = bead.green;
		bead.alphaBlue = bead.blue;
		bead.color = "rgb(" + bead.red + "," + bead.green + "," + bead.blue + ")";
	}
	if ( bead.visible && !bead.empty )
	{
		if ( PS.Grid.flash && bead.flash )
		{
			PS.FlashStart(x, y);
		}
		else
		{
			bead.colorNow = bead.color;
			PS.Bead(bead);
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
			return PS.Oops(fn + "alpha param is not a number");
		}

		// clamp value

		a = Math.floor(a);
		if ( a === PS.DEFAULT )
		{
			a = PS.D_ALPHA;
		}
		else if ( a !== PS.CURRENT )
		{
			if ( a < 0 )
			{
				a = 0;
			}
			else if ( a > PS.D_ALPHA )
			{
				a = PS.D_ALPHA;
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
					a = PS.XBAlpha( i, j, a );
				}
			}
		}
		else if ( !PS.CheckY( y, fn ) ) // verify y param
		{
			a = PS.ERROR;
		}
		else
		{
			for ( i = 0; i < PS.Grid.x; i += 1 ) // do entire row
			{
				a = PS.XBAlpha( i, y, a );
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
			a = PS.XBAlpha( x, j, a );
		}
	}
	else if ( !PS.CheckX( x, fn ) || !PS.CheckY( y, fn ) ) // verify both params
	{
		a = PS.ERROR;
	}
	else
	{
		a = PS.XBAlpha( x, y, a ); // do one bead
	}

	return a;
};

// PS.BeadBorderWidth (x, y, width)
// Returns and optionally sets a bead's border width
// [x, y] are grid position
// Optional [width] must be a number

PS.XBBWidth = function (x, y, width)
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
		PS.Bead(bead);
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
		width = PS.D_BDR_W;
	}
	else if ( (width !== undefined) && (width !== PS.CURRENT) )
	{
		if ( typeof width !== "number" )
		{
			return PS.Oops(fn + "width param is not a number");
		}
		width = Math.floor(width);
		if ( width < 0 )
		{
			width = 0;
		}
		else if ( width > PS.Grid.borderMax )
		{
			width = PS.Grid.borderMax;
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
					width = PS.XBBWidth( i, j, width );
				}
			}
		}
		else if ( !PS.CheckY( y, fn ) ) // verify y param
		{
			width = PS.ERROR;
		}
		else
		{
			for ( i = 0; i < PS.Grid.x; i += 1 ) // do entire row
			{
				width = PS.XBBWidth( i, y, width );
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
			width = PS.XBBWidth( x, j, width );
		}
	}
	else if ( !PS.CheckX( x, fn ) || !PS.CheckY( y, fn ) ) // verify both params
	{
		width = PS.ERROR;
	}
	else
	{
		width = PS.XBBWidth( x, y, width ); // do one bead
	}

	return width;
};

// PS.BeadBorderColor (x, y, rgb)
// Returns and optionally sets a bead's border color
// [x, y] are grid position
// Optional [rgb] must be a multiplexed rgb value (0xRRGGBB)

PS.XBBColor = function (x, y, rgb, r, g, b)
{
	"use strict";
	var i, bead;

	// Assume x/y params are already verified

	i = x + (y * PS.Grid.x); // get index of bead
	bead = PS.Grid.beads[i];

	if ( (rgb === undefined) || (rgb === PS.CURRENT) ) // if no rgb or PS.CURRENT, return current color
	{
		return (bead.borderRed * PS.RSHIFT) + (bead.borderGreen * PS.GSHIFT) + bead.borderBlue;
	}

	bead.borderRed = r;
	bead.borderGreen = g;
	bead.borderBlue = b;
	if ( bead.borderAlpha < PS.D_ALPHA )
	{
		r = PS.Dissolve( PS.Grid.bgRed, r, bead.borderAlpha );
		g = PS.Dissolve( PS.Grid.bgGreen, g, bead.borderAlpha );
		b = PS.Dissolve( PS.Grid.bgBlue, b, bead.borderAlpha );
	}
	bead.borderColor = "rgb(" + r + "," + g + "," + b + ")";

	if ( bead.visible )
	{
		PS.Bead(bead);
	}

	return rgb;
};

PS.BeadBorderColor = function (x, y, rgb, g, b)
{
	"use strict";
	var fn, colors, red, green, blue, i, j;

	fn = "[PS.BeadBorderColor] ";

	if ( rgb === PS.DEFAULT )
	{
		rgb = PS.D_BDR_RGB;
		red = PS.D_BDR_R;
		green = PS.D_BDR_G;
		blue = PS.D_BDR_B;
	}
	else if ( (rgb !== undefined) && (rgb !== PS.CURRENT) )
	{
		colors = PS.ColorParams(fn, rgb, g, b);
		if ( !colors )
		{
			return PS.ERROR;
		}
		red = colors.r;
		green = colors.g;
		blue = colors.b;
	}

	if ( x === PS.ALL )
	{
		if ( y === PS.ALL ) // do entire grid
		{
			for ( j = 0; j < PS.Grid.y; j += 1 )
			{
				for ( i = 0; i < PS.Grid.x; i += 1 )
				{
					rgb = PS.XBBColor( i, j, rgb, red, green, blue );
				}
			}
		}
		else if ( !PS.CheckY( y, fn ) ) // verify y param
		{
			rgb = PS.ERROR;
		}
		else
		{
			for ( i = 0; i < PS.Grid.x; i += 1 ) // do entire row
			{
				rgb = PS.XBBColor( i, y, rgb, red, green, blue );
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
			rgb = PS.XBBColor( x, j, rgb, red, green, blue );
		}
	}
	else if ( !PS.CheckX( x, fn ) || !PS.CheckY( y, fn ) ) // verify both params
	{
		rgb = PS.ERROR;
	}
	else
	{
		rgb = PS.XBBColor( x, y, rgb, red, green, blue ); // do one bead
	}

	return rgb;
};

// PS.BeadBorderAlpha(x, y, a)
// Returns a bead's border alpha and optionally changes it
// [x, y] are grid position
// Optional [a] must be a number between 0.0 and 1.0

PS.XBBAlpha = function (x, y, a)
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
	if ( a < PS.D_ALPHA )
	{
		r = PS.Dissolve( PS.Grid.bgRed, bead.borderRed, a );
		g = PS.Dissolve( PS.Grid.bgGreen, bead.borderGreen, a );
		b = PS.Dissolve( PS.Grid.bgBlue, bead.borderBlue, a );
		bead.borderColor = "rgb(" + r + "," + g + "," + b + ")";
	}
	else
	{
		bead.borderColor = "rgb(" + bead.borderRed + "," + bead.borderGreen + "," + bead.borderBlue + ")";
	}
	if ( bead.visible )
	{
		PS.Bead(bead);
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
			return PS.Oops(fn + "alpha param is not a number");
		}

		// clamp value

		a = Math.floor(a);
		if ( a === PS.DEFAULT )
		{
			a = PS.D_ALPHA;
		}
		else if ( a !== PS.CURRENT )
		{
			if ( a < 0 )
			{
				a = 0;
			}
			else if ( a > PS.D_ALPHA )
			{
				a = PS.D_ALPHA;
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
					a = PS.XBBAlpha( i, j, a );
				}
			}
		}
		else if ( !PS.CheckY( y, fn ) ) // verify y param
		{
			a = PS.ERROR;
		}
		else
		{
			for ( i = 0; i < PS.Grid.x; i += 1 ) // do entire row
			{
				a = PS.XBBAlpha( i, y, a );
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
			a = PS.XBBAlpha( x, j, a );
		}
	}
	else if ( !PS.CheckX( x, fn ) || !PS.CheckY( y, fn ) ) // verify both params
	{
		a = PS.ERROR;
	}
	else
	{
		a = PS.XBBAlpha( x, y, a ); // do one bead
	}

	return a;
};

// PS.BeadGlyph(x, y, g)
// Returns a bead's glyph and optionally changes it
// [x, y] are grid position
// Optional [g] must be either a string or a number

PS.XBGlyph = function (x, y, g)
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
			PS.Bead(bead);
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
				return PS.Oops(fn + "glyph param is empty string");
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
			return PS.Oops(fn + "glyph param not a string or number");
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
					g = PS.XBGlyph( i, j, g );
				}
			}
		}
		else if ( !PS.CheckY( y, fn ) ) // verify y param
		{
			g = PS.ERROR;
		}
		else
		{
			for ( i = 0; i < PS.Grid.x; i += 1 ) // do entire row
			{
				g = PS.XBGlyph( i, y, g );
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
			g = PS.XBGlyph( x, j, g );
		}
	}
	else if ( !PS.CheckX( x, fn ) || !PS.CheckY( y, fn ) ) // verify both params
	{
		g = PS.ERROR;
	}
	else
	{
		g = PS.XBGlyph( x, y, g ); // do one bead
	}

	return g;
};

// PS.BeadGlyphColor (x, y, rgb)
// Returns and optionally sets a bead's glyph color
// [x, y] are grid position
// Optional [rgb] must be a multiplexed rgb value (0xRRGGBB)

PS.XBGColor = function (x, y, rgb, r, g, b)
{
	"use strict";
	var i, bead;

	// Assume x/y params are already verified

	i = x + (y * PS.Grid.x); // get index of bead
	bead = PS.Grid.beads[i];

	if ( (rgb === undefined) || (rgb === PS.CURRENT) ) // if no rgb or PS.CURRENT, return current color
	{
		return (bead.glyphRed * PS.RSHIFT) + (bead.glyphGreen * PS.GSHIFT) + bead.glyphBlue;
	}

	bead.glyphRed = r;
	bead.glyphGreen = g;
	bead.glyphBlue = b;
	if ( bead.alpha < PS.D_ALPHA ) // Calc new color based on alpha
	{
		r = PS.Dissolve( PS.Grid.bgRed, r, bead.alpha );
		g = PS.Dissolve( PS.Grid.bgGreen, g, bead.alpha );
		b = PS.Dissolve( PS.Grid.bgBlue, b, bead.alpha );
	}
	bead.glyphColor = "rgb(" + r + "," + g + "," + b + ")";

	if ( bead.visible && (bead.glyph > 0) )
	{
		PS.Bead(bead);
	}
	return rgb;
};

PS.BeadGlyphColor = function (x, y, rgb, g, b)
{
	"use strict";
	var fn, colors, red, green, blue, i, j;

	fn = "[PS.BeadGlyphColor] ";

	if ( rgb === PS.DEFAULT )
	{
		rgb = PS.D_GL_RGB;
		red = PS.D_GL_R;
		green = PS.D_GL_G;
		blue = PS.D_GL_B;
	}
	else if ( (rgb !== undefined) && (rgb !== PS.CURRENT) )
	{
		colors = PS.ColorParams(fn, rgb, g, b);
		if ( !colors )
		{
			return PS.ERROR;
		}
		red = colors.r;
		green = colors.g;
		blue = colors.b;
	}

	if ( x === PS.ALL )
	{
		if ( y === PS.ALL ) // do entire grid
		{
			for ( j = 0; j < PS.Grid.y; j += 1 )
			{
				for ( i = 0; i < PS.Grid.x; i += 1 )
				{
					rgb = PS.XBGColor( i, j, rgb, red, green, blue );
				}
			}
		}
		else if ( !PS.CheckY( y, fn ) ) // verify y param
		{
			rgb = PS.ERROR;
		}
		else
		{
			for ( i = 0; i < PS.Grid.x; i += 1 ) // do entire row
			{
				rgb = PS.XBGColor( i, y, rgb, red, green, blue );
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
			rgb = PS.XBGColor( x, j, rgb, red, green, blue );
		}
	}
	else if ( !PS.CheckX( x, fn ) || !PS.CheckY( y, fn ) ) // verify both params
	{
		rgb = PS.ERROR;
	}
	else
	{
		rgb = PS.XBGColor( x, y, rgb, red, green, blue ); // do one bead
	}

	return rgb;
};

// PS.BeadFlash(x, y, flag)
// Returns a bead's flash status and optionally changes it
// [x, y] are grid position
// Optional [flag] must be 1/true or 0/false

PS.XBFlash = function (x, y, flag)
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
					flag = PS.XBFlash( i, j, flag );
				}
			}
		}
		else if ( !PS.CheckY( y, fn ) ) // verify y param
		{
			flag = PS.ERROR;
		}
		else
		{
			for ( i = 0; i < PS.Grid.x; i += 1 ) // do entire row
			{
				flag = PS.XBFlash( i, y, flag );
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
			flag = PS.XBFlash( x, j, flag );
		}
	}
	else if ( !PS.CheckX( x, fn ) || !PS.CheckY( y, fn ) ) // verify both params
	{
		flag = PS.ERROR;
	}
	else
	{
		flag = PS.XBFlash( x, y, flag ); // do one bead
	}

	return flag;
};

// PS.BeadFlashColor (x, y, rgb)
// Returns and optionally sets a bead's flash color
// [x, y] are grid position
// Optional [rgb] must be a multiplexed rgb value (0xRRGGBB)

PS.XBFColor = function (x, y, rgb, r, g, b)
{
	"use strict";
	var i, bead;

	// Assume x/y params are already verified

	i = x + (y * PS.Grid.x); // get index of bead
	bead = PS.Grid.beads[i];

	if ( (rgb === undefined) || (rgb === PS.CURRENT) ) // if no rgb or PS.CURRENT, return current color
	{
		return (bead.flashRed * PS.RSHIFT) + (bead.flashGreen * 256) + bead.flashBlue;
	}

	bead.flashRed = r;
	bead.flashGreen = g;
	bead.flashBlue = b;
	bead.flashColor = "rgb(" + r + "," + g + "," + b + ")";

	return rgb;
};

PS.BeadFlashColor = function (x, y, rgb, g, b)
{
	"use strict";
	var fn, red, green, blue, colors, i, j;

	fn = "[PS.BeadFlashColor] ";

	if ( rgb === PS.DEFAULT )
	{
		rgb = PS.D_FL_RGB;
		red = PS.D_FL_R;
		green = PS.D_FL_G;
		blue = PS.D_FL_B;
	}
	else if ( (rgb !== undefined) && (rgb !== PS.CURRENT) )
	{
		colors = PS.ColorParams(fn, rgb, g, b);
		if ( !colors )
		{
			return PS.ERROR;
		}
		red = colors.r;
		green = colors.g;
		blue = colors.b;
	}

	if ( x === PS.ALL )
	{
		if ( y === PS.ALL ) // do entire grid
		{
			for ( j = 0; j < PS.Grid.y; j += 1 )
			{
				for ( i = 0; i < PS.Grid.x; i += 1 )
				{
					rgb = PS.XBFColor( i, j, rgb, red, green, blue );
				}
			}
		}
		else if ( !PS.CheckY( y, fn ) ) // verify y param
		{
			rgb = PS.ERROR;
		}
		else
		{
			for ( i = 0; i < PS.Grid.x; i += 1 ) // do entire row
			{
				rgb = PS.XBFColor( i, y, rgb, red, green, blue );
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
			rgb = PS.XBFColor( x, j, rgb, red, green, blue );
		}
	}
	else if ( !PS.CheckX( x, fn ) || !PS.CheckY( y, fn ) ) // verify both params
	{
		rgb = PS.ERROR;
	}
	else
	{
		rgb = PS.XBFColor( x, y, rgb, red, green, blue ); // do one bead
	}

	return rgb;
};

// PS.BeadData(x, y, data)
// Returns a bead's data and optionally changes it
// [x, y] are grid position
// Optional [data] can be any data type

PS.XBData = function (x, y, data)
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
					data = PS.XBData( i, j, data );
				}
			}
		}
		else if ( !PS.CheckY( y, fn ) ) // verify y param
		{
			data = PS.ERROR;
		}
		else
		{
			for ( i = 0; i < PS.Grid.x; i += 1 ) // do entire row
			{
				data = PS.XBData( i, y, data );
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
			data = PS.XBData( x, j, data );
		}
	}
	else if ( !PS.CheckX( x, fn ) || !PS.CheckY( y, fn ) ) // verify both params
	{
		data = PS.ERROR;
	}
	else
	{
		data = PS.XBData( x, y, data ); // do one bead
	}

	return data;
};

// PS.BeadAudio(x, y, audio, volume)
// Returns a bead's audio file and optionally changes it (and its volume)
// [x, y] are grid position
// Optional [audio] must be a string
// Optional [volume] should be between 0 and 100 inclusive

PS.XBAudio = function (x, y, audio, volume)
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
		else
		{
			if ( typeof audio !== "string" )
			{
				return PS.Oops(fn + "Audio param is not a string");
			}
			if ( audio.length < 1 )
			{
				audio = null;
			}
		}
	}

	// check volume param

	if ( (volume !== undefined) && (volume !== PS.CURRENT) )
	{
		if ( volume === PS.DEFAULT )
		{
			volume = PS.D_VOL;
		}
		else
		{
			if ( typeof volume !== "number" )
			{
				return PS.Oops(fn + "Volume param not a number");
			}
			
			// clamp volume
			
			if ( volume < 0 )
			{
				volume = 0;
			}
			else if ( volume > PS.MAX_VOL )
			{
				volume = PS.MAX_VOL;
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
					audio = PS.XBAudio( i, j, audio, volume );
				}
			}
		}
		else if ( !PS.CheckY( y, fn ) ) // verify y param
		{
			audio = PS.ERROR;
		}
		else
		{
			for ( i = 0; i < PS.Grid.x; i += 1 ) // do entire row
			{
				audio = PS.XBAudio( i, y, audio, volume );
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
			audio = PS.XBAudio( x, j, audio, volume );
		}
	}
	else if ( !PS.CheckX( x, fn ) || !PS.CheckY( y, fn ) ) // verify both params
	{
		audio = PS.ERROR;
	}
	else
	{
		audio = PS.XBAudio( x, y, audio, volume ); // do one bead
	}

	return audio;
};

// PS.BeadFunction(x, y, func)
// Returns a bead's exec function and optionally changes it
// [x, y] are grid position
// Optional [func] must be a JavaScript function

PS.XBFunc = function (x, y, exec)
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
			return PS.Oops(fn + "exec param not a valid function");
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
					exec = PS.XBFunc( i, j, exec );
				}
			}
		}
		else if ( !PS.CheckY( y, fn ) ) // verify y param
		{
			exec = PS.ERROR;
		}
		else
		{
			for ( i = 0; i < PS.Grid.x; i += 1 ) // do entire row
			{
				exec = PS.XBFunc( i, y, exec );
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
			exec = PS.XBFunc( x, j, exec );
		}
	}
	else if ( !PS.CheckX( x, fn ) || !PS.CheckY( y, fn ) ) // verify both params
	{
		exec = PS.ERROR;
	}
	else
	{
		exec = PS.XBFunc( x, y, exec ); // do one bead
	}

	return exec;
};

// PS.BeadTouch(x, y, mask)
// Simulates effect of clicking on a bead
// [x, y] are grid position

PS.XBTouch = function (x, y)
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
					PS.XBTouch( i, j );
				}
			}
		}
		else if ( PS.CheckY( y, fn ) ) // verify y param
		{
			for ( i = 0; i < PS.Grid.x; i += 1 ) // do entire row
			{
				PS.XBTouch( i, y );
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
			PS.XBTouch( x, j );
		}
	}
	else if ( PS.CheckX( x, fn ) && PS.CheckY( y, fn ) ) // verify both params
	{
		PS.XBTouch( x, y ); // do one bead
	}
};

// Set message text

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
			return PS.Oops(fn + "Parameter is not a valid string");
		}
		e = document.getElementById(PS.STS_ID);
		if ( e )
		{
			if ( PS.StatusUp ) // start fade-up if enabled
			{
				e.style.color = PS.Grid.bgColor;
				PS.StatusUpPhase = 0; // starts fade-up
				PS.StatusUpDelay = PS.STS_REG; // frame rate regulator
				PS.StatusDownPhase = 100; // stops any fade-outs in progress
			}
			else if ( PS.StatusDown ) // if no fade-up, start fade-down if enabled
			{
				e.style.color = PS.StatusHue;
				PS.StatusDelay = PS.StatusDelayRate; // reset fade-down delay
				PS.StatusDownPhase = 0; // starts fade-down
				PS.StatusDownDelay = PS.STS_REG; // and frame rate regulator
			}
			e.value = str;							
		}
		PS.Status = str;
	}
	return PS.Status;
};

PS.StatusColor = function (rgb, g, b)
{
	"use strict";
	var fn, colors, red, green, blue, e;

	fn = "[PS.StatusColor] ";	

	if ( (rgb === undefined) || (rgb === PS.CURRENT) )
	{
		return PS.StatusHue;
	}
	if ( rgb === PS.DEFAULT )
	{
		rgb = PS.D_ST_RGB;
		red = PS.D_ST_R;
		green = PS.D_ST_G;
		blue = PS.D_ST_B;
	}
	else
	{
		colors = PS.ColorParams(fn, rgb, g, b);
		if ( !colors )
		{
			return PS.ERROR;
		}
		red = colors.r;
		green = colors.g;
		blue = colors.b;
	}
	
	PS.StatusRed = red;
	PS.StatusGreen = green;
	PS.StatusBlue = blue;
	PS.StatusHue = "rgb(" + red + "," + green + "," + blue + ")";
	
	PS.StatusUpPhase = 100; // stops fades in progress
	PS.StatusDownPhase = 100;
	
	e = document.getElementById(PS.STS_ID);
	if ( e )
	{
		e.style.color = PS.StatusHue;
	}
	
	return PS.StatusHue;
};

// Controls status line fade effects

PS.CalcStep = function (rate)
{
	"use strict";
	var val;
	
	val = rate / 60;
	val *= PS.STS_FPS; // 12
	val = 100 / val;
//	val = Math.floor(val);
	return val;
};

PS.StatusFadeUp = function (rate)
{
	"use strict";
	var fn, e;
	
	fn = "[PS.StatusFadeUp ]";
	
	if ( (rate !== undefined) && (rate !== PS.CURRENT) )
	{
		if ( rate === PS.DEFAULT )
		{
			PS.StatusUp = true;
			PS.StatusUpRate = PS.D_STS_UP;
			PS.StatusUpStep = PS.CalcStep(PS.D_STS_UP);
		}
		else
		{
			if ( typeof rate !== "number" )
			{
				return PS.Oops(fn + "rate paramater not a number");
			}
			rate = Math.floor(rate);
			if ( rate <= 0 )
			{
				PS.StatusUp = false;
				PS.StatusUpRate = 0;
				PS.StatusUpPhase = 100;
				e = document.getElementById(PS.STS_ID);
				if ( e )
				{
					e.style.color = PS.StatusHue;
				}	
			}
			else
			{
				PS.StatusUp = true;
				PS.StatusUpRate = rate;
				PS.StatusUpStep = PS.CalcStep(rate);
			}
		}	
	}
	return PS.StatusUpRate;
};

PS.StatusFadeDown = function (rate, delay)
{
	"use strict";
	var fn, e;
	
	fn = "[PS.StatusFadeDown ]";
	
	if ( (rate !== undefined) && (rate !== PS.CURRENT) )
	{
		if ( rate === PS.DEFAULT )
		{
			PS.StatusDown = false;
			PS.StatusDownRate = PS.D_STS_DOWN;
		}
		else
		{
			if ( typeof rate !== "number" )
			{
				return PS.Oops(fn + "rate parameter not a number");
			}
			rate = Math.floor(rate);
			if ( rate <= 0 )
			{
				PS.StatusDown = false;
				PS.StatusDownRate = 0;
				PS.StatusDownPhase = 100;
				e = document.getElementById(PS.STS_ID);
				if ( e )
				{
					e.style.color = PS.StatusHue;
				}	
			}
			else
			{
				PS.StatusDown = true;
				PS.StatusDownRate = rate;
				PS.StatusDownStep = PS.CalcStep(rate);
			}
			
			// check delay param
			
			if ( (delay !== undefined) && (delay !== PS.CURRENT) )
			{
				if ( delay === PS.DEFAULT )
				{
					PS.StatusDelayRate = PS.D_STS_DELAY;
				}
				else
				{
					if ( typeof delay !== "number" )
					{
						return PS.Oops(fn + "delay parameter not a number");
					}
					delay = Math.floor(delay);
					if ( delay <= 0 )
					{
						PS.StatusDelayRate = 0;
					}
					else
					{
						PS.StatusDelayRate = delay;
					}
				}	
			}
		}	
	}
	return { rate: PS.StatusDownRate, delay: PS.StatusDelayRate };
};

// This will be deprecated in 2.4+
// Make sure it still works!

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
			PS.StatusUpRate = PS.D_STS_UP;
			PS.StatusUpPhase = 100;
		}
		else
		{
			flag = false;
			PS.StatusUpRate = 0;
			PS.StatusUpPhase = 100;
			e = document.getElementById(PS.STS_ID);
			if ( e )
			{
				e.style.color = PS.StatusHue;
			}			
		}
		PS.StatusUp = flag;
	}

	// always turned off
	
	PS.StatusDown = false;
	PS.StatusDownRate = 0;
	PS.StatusDownPhase = 100;
	return PS.StatusUp;
};

// Debugger API

// Open debugger if not already open

PS.DebugOpen = function ()
{
	"use strict";
	var div, e;

	if ( !PS.DebugWindow )
	{
		div = document.getElementById(PS.DBG_ID);
		div.style.display = "inline";

		// clear it

		e = document.getElementById(PS.MON_ID);
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
		e = document.getElementById(PS.DBG_ID);
		e.style.display = "none";
		PS.DebugWindow = false;
	}
};

// Add line to debugger (does not include CR)

PS.Debug = function (str)
{
	"use strict";
	var e;

	if ( (typeof str !== "string") || (str.length < 1) )
	{
		return;
	}

	PS.DebugOpen();

	e = document.getElementById(PS.MON_ID);
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

	if ( PS.DebugWindow )
	{
		e = document.getElementById(PS.MON_ID);
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

	if ( (typeof str !== "string") || (str.length < 1) )
	{
		str = "???";
	}
	
	e = document.getElementById(PS.FTR_ID);
	if ( e )
	{
		e.innerHTML = str;
	}
	
	PS.Debug( "ERROR: " + str + "\n" );	
	PS.AudioPlay("fx_uhoh", PS.DEFAULT, PS.DEFAULT, PS.DEFAULT);

	return PS.ERROR;
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
			return PS.Oops(fn + "ticks parameter not a number");
		}
		ticks = Math.floor(ticks);
		if ( ticks < 1 )
		{
			PS.UserClock = 0;
		}
		else if ( typeof PS.Tick !== "function" )
		{
			return PS.Oops(fn + "PS.Tick function undefined");
		}
		PS.UserDelay = 0;
		PS.UserClock = ticks;
	}

	return PS.UserClock;
};

// General system timer

PS.Timer = function ()
{
	"use strict";
	
	window.setTimeout( function() { window.requestAnimationFrame(PS.Timer); PS.XTimer(); }, PS.D_FPS );
};

PS.XTimer = function ()
{
	"use strict";
	var len, i, which, bead, phase, hue, r, g, b, e, key;

	// Handle bead flashing

	PS.FlashDelay -= 1;
	if ( PS.FlashDelay < 1  )
	{
		PS.FlashDelay = PS.FL_INTERVAL;
		len = PS.Grid.flashList.length;
		i = 0;
		while ( i < len )
		{
			which = PS.Grid.flashList[i];
			bead = PS.Grid.beads[which];
			phase = bead.flashPhase + PS.FL_STEP;
	
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
				bead.colorNow = "rgb(" + r + "," + g + "," + b + ")";
				i += 1;
			}
			PS.Bead(bead);
		}
	}
	
	// Startup delay for footer
	
	if ( PS.FooterDelay > 0 )
	{
		PS.FooterDelay -= 1;
		if ( !PS.FooterDelay )
		{
			e = document.getElementById(PS.FTR_ID);
			if ( e )
			{
				e.innerHTML = "";
			}		
		}
	}

	// Status line fade-up
		
	if ( PS.StatusUp && (PS.StatusUpPhase < 100) )
	{
		if ( PS.StatusUpDelay > 0 ) // slow the frame rate
		{
			PS.StatusUpDelay -= 1;
		}
		else
		{
			PS.StatusUpDelay = PS.STS_REG; // reset regulator
			phase = PS.StatusUpPhase + PS.StatusUpStep;

			if ( phase >= 100 )
			{
				phase = 100;
				hue = PS.StatusHue;
				if ( PS.StatusDown ) // fade down enabled?
				{
					PS.StatusDelay = PS.StatusDelayRate; // reset fade-down delay
					PS.StatusDownPhase = 0; // and fade down phase
					PS.StatusDownDelay = PS.STS_REG; // and frame rate regulator
				}
			}
			else
			{				
				r = PS.Dissolve( PS.Grid.bgRed, PS.StatusRed, phase );
				g = PS.Dissolve( PS.Grid.bgGreen, PS.StatusGreen, phase );
				b = PS.Dissolve( PS.Grid.bgBlue, PS.StatusBlue, phase );
				hue = "rgb(" + r + "," + g + "," + b + ")";
			}
			PS.StatusUpPhase = phase;			
			e = document.getElementById(PS.STS_ID);
			if ( e )
			{
				e.style.color = hue;
			}
		}
	}		

	// Status line fade-down
	
	if ( PS.StatusDown && (PS.StatusDownPhase < 100) )
	{
		if ( PS.StatusDelay > 0 )
		{
			PS.StatusDelay -= 1;
		}
		else
		{
			if ( PS.StatusDownDelay > 0 )
			{
				PS.StatusDownDelay -= 1;
			}
			else
			{
				PS.StatusDownDelay = PS.STS_REG; // reset regulator
				phase = PS.StatusDownPhase + PS.StatusDownStep;
				if ( phase >= 100 )
				{
					phase = 100;
					hue = PS.Grid.bgColor;
				}
				else
				{				
					r = PS.Dissolve( PS.StatusRed, PS.Grid.bgRed, phase );
					g = PS.Dissolve( PS.StatusGreen, PS.Grid.bgGreen, phase );
					b = PS.Dissolve( PS.StatusBlue, PS.Grid.bgBlue, phase );
					hue = "rgb(" + r + "," + g + "," + b + ")";
				}
				PS.StatusDownPhase = phase;			
				e = document.getElementById(PS.STS_ID);
				if ( e )
				{
					e.style.color = hue;
				}
			}
		}
	}			

	// Process key holds
	
	len = PS.Holding.length;
	if ( len > 0 )
	{
		if ( PS.KeyDelay > 0 )
		{
			PS.KeyDelay -= 1;
		}
		else
		{
			PS.KeyDelay = PS.KEY_RATE; // reset delay
			
			i = 0;
			while ( i < len )
			{
				key = PS.Holding[i];
				
				try
				{
					PS.KeyDown(key, PS.HoldShift, PS.HoldCtrl);	
				}
				catch (err)
				{
					PS.Oops("Key down repeat failed [" + err.message + "]" );
				}
				
				try
				{
					PS.KeyUp(key, PS.HoldShift, PS.HoldCtrl);			
				}
				catch (err2)
				{
					PS.Oops("Key up repeat failed [" + err2.message + "]" );
				}
				
				i += 1;			
			}
		}	
	}
	
	// User clock

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
				catch (err3)
				{					
					PS.UserClock = 0; // stop the user timer
					PS.Oops("PS.Tick() failed [" + err3.message + "]" );
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
	PS.Bead(bead);

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

// System initialization
// Detect x/y of mouse over grid, -1 if not over grid

PS.MouseXY = function (canvas, event)
{
	"use strict";
	var x, y, beads, bead, row, col, i;

	if ( PS.Grid )
	{
	    if ( event.x && event.y ) // Webkit, IE
	    {
			x = event.x;
			y = event.y;
		}
		else // Firefox method to get the position
		{
			x = event.clientX;
			y = event.clientY;
		}
		
		x += ( document.body.scrollLeft + document.documentElement.scrollLeft - canvas.offsetLeft );
		y += ( document.body.scrollTop + document.documentElement.scrollTop - canvas.offsetTop);
		
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

	PS.MouseXY(this, event);
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
		PS.MouseXY(this, event);
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

	PS.OverCanvas = true;
	PS.MouseXY(this, event);

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

	PS.OverCanvas = false;
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

PS.SysKeyDown = function (event)
{
	"use strict";
	var key;

	// Debugger gets keys when in focus
	
	if ( PS.DebugFocus )
	{
		event.returnValue = true;
		return true;
	}
	
	if ( PS.KeyDown ) // only if function exists
	{		
		event.returnValue = false;
		
		if ( !event.which )
		{
			key = event.keyCode;    // IE
		}
		else
		{
			key = event.which;	  // Others
		}

		PS.HoldShift = event.shiftKey;
		PS.HoldCtrl = event.ctrlKey;
					
		if ( !PS.Pressed[key] ) // if not already pressed ...
		{
					
			key = PS.KeyFilter(key, event.shiftKey);
			
			PS.Pressed[key] = 1; // mark key as being pressed
			PS.KeyDelay = PS.KEY_RATE; // set repeat delay
			PS.Holding.push(key); // add to list of all keys being held
			
			try
			{
				PS.KeyDown(key, event.shiftKey, event.ctrlKey);		
			}
			catch (err)
			{
				PS.Oops("PS.KeyDown() failed [" + err.message + "]" );
			}
		}
	}	
	return false;
};

// Called when a key is released

PS.SysKeyUp = function (event)
{
	"use strict";
	var key, i;

	if ( PS.KeyUp ) // only if function exists
	{
		event.returnValue = false;
		
		if ( event.which === null )
		{
			key = event.keyCode;    // IE
		}
		else
		{
			key = event.which;	  // Others
		}

		PS.HoldShift = event.shiftKey;
		PS.HoldCtrl = event.ctrlKey;
						
		key = PS.KeyFilter(key, event.shiftKey);
		
		// remove from pressed array and held list
		
		PS.Pressed[key] = 0; 
		
		i = PS.Holding.indexOf(key);
		if ( i >= 0 )
		{
			PS.Holding.splice(i, 1);
		}
		
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

	if ( !PS.OverCanvas )
	{
		event.returnValue = true;
		return true;
	}
	
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

// Generic default event handler for debugger

PS.DefaultEvent = function (event)
{
	"use strict";

	event.returnValue = true;
};

// Library stuff

PS.Random = function (val)
{
	"use strict";
	var fn;

	fn = "[PS.Random] ";
	if ( typeof val !== "number" )
	{		
		return PS.Oops(fn + "Parameter is not a number");
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
		return PS.Oops(fn + "Parameter is not a number");
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
		return PS.Oops(fn + "Parameter is not a number");
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
		return PS.Oops(fn + "Parameter is not a number");
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

// Image functions

// Error handler for image loading

PS.ImageError = function (event)
{
	"use strict";
	
	PS.Debug("[PS.ImageLoad] Error loading " + this.src);	
};

// System loader for images

PS.DoImageLoad = function ()
{
	"use strict";
	var id, len, i, rec, func, format, file, imgdata;
	
	id = this.getAttribute("data-id"); // the user function id
	
	// find the matching loader record
	
	len = PS.LoaderList.length;
	i = 0;
	while ( i < len )
	{
		rec = PS.LoaderList[i];
		if ( rec.id === id ) // here it is!
		{
			func = rec.func;
			format = rec.format;
			file = rec.file;
			PS.LoaderList.splice(i, 1); // delete the record
			break;			
		}
		i += 1;
	}
	
	imgdata = PS.ImageData(this, format); // extract the data
	if ( imgdata !== PS.ERROR )
	{
		try
		{
			imgdata.id = id;
			imgdata.file = file;
			func(imgdata); // call user function with data
		}
		catch (err)
		{
			PS.Oops("[PS.ImageLoad] Load function failed");
		}
	}
};

PS.ImageLoad = function ( file, func, format )
{
	"use strict";
	var fn, img, id;
	
	fn = "[PS.ImageLoad] ";
	
	if ( (typeof file !== "string") || (file.length < 1) )
	{
		return PS.Oops(fn + "Invalid file parameter");
	}
	
	if ( typeof func !== "function" )
	{
		return PS.Oops(fn + "Invalid function parameter");		
	}	
	
	if ( (format === PS.DEFAULT) || (format === undefined) )
	{
		format = 3;
	}
	else
	{
		if ( typeof format !== "number" )
		{
			return PS.Oops(fn + "format parameter not a number");	
		}
		if ( (format !== 1) && (format !== 3) && (format !== 4) )
		{
			return PS.Oops(fn + "format is not 1, 3 or 4");
		}
	}
	
	// save a record with the user function, id and alpha preference
	
	id = "img" + PS.LoaderCnt; // a unique ID
	PS.LoaderCnt += 1;	
	PS.LoaderList.push( { file: file, id: id, func: func, format: format } );
	
	try
	{
		img = new Image();
		img.setAttribute("data-id", id); // store the id
		img.onload = PS.DoImageLoad;
		img.onerror = PS.ImageError;
		img.src = file; // load it!
	}
	catch (err)
	{
		return PS.Oops(fn + "Load failed: " + file + " [" + err.message + "]");
	}
	
	return id;
};

// Return an imageData table from an image file
// optional [format] determines pixel format (1, 3, 4)
// alpha data is converted from 0-255 to 0-1

PS.ImageData = function ( img, format )
{
	"use strict";
	var fn, w, h, ctx, srcImageData, imgData, src, len, dest, i, j, a, r, g, b;
	
	fn = "[PS.ImageMap] ";
	
	// check validity of img structure
	
	w = img.width;
	if ( (typeof w !== "number") || (w < 0) )
	{
		return PS.Oops(fn + "Image .width invalid");		
	}
	w = Math.floor(w);
	
	h = img.height;
	if ( (typeof h !== "number") || (h < 0) )
	{
		return PS.Oops(fn + "Image .height invalid");		
	}
	h = Math.floor(h);

	// draw the image onto the offscreen canvas

	try
	{
		PS.ImageCanvas.width = w; // this clears the offscreen canvas
		PS.ImageCanvas.height = h;
		ctx = PS.ImageCanvas.getContext("2d");
		ctx.drawImage(img, 0, 0);
	}
	catch (err)
	{
		return PS.Oops(fn + "Data extraction failed @ 1 [" + err.message + "]");
	}	
			
	// fetch the source's image data

	try
	{
		srcImageData = ctx.getImageData(0, 0, w, h);
	}
	catch (err2)
	{
		return PS.Oops(fn + "Data extraction failed @ 2 [" + err2.message + "]");
	}
	
	// srcImgData is read-only for some reason
	// so make a copy of it in imgData
	
	imgData = {
		width: srcImageData.width,
		height: srcImageData.height
	};
	
	src = srcImageData.data; // source array
	len = src.length; // and its length
	
	dest = []; // new dest array	
	
	// if alpha data is not wanted, discard it
	
	i = 0;
	if ( format === 3 )
	{		
		dest.length = (len / 4) * 3;
		j = 0;
		while ( i < len )
		{
			dest[j] = src[i]; // r
			i += 1;
			j += 1;
			dest[j] = src[i]; // g
			i += 1;
			j += 1;
			dest[j] = src[i]; // b
			i += 2; // skip alpha!
			j += 1;			
		}
		imgData.pixelSize = 3;		
	}
	else if ( format === 4 )
	{
		dest.length = len;
		while ( i < len )
		{
			dest[i] = src[i]; // r
			i += 1;
			dest[i] = src[i]; // g
			i += 1;
			dest[i] = src[i]; // b
			i += 1;
			
			a = src[i]; // a
			dest[i] = Math.floor(a / 2.55); // convert 0-255 range to 0-1;
			i += 1;
		}			
		imgData.pixelSize = 4;
	}
	else // format 1
	{
		dest.length = len / 4;
		j = 0;
		while ( i < len )
		{
			r = src[i]; // r
			i += 1;
			g = src[i]; // g
			i += 1;
			b = src[i]; // b
			i += 2; // skip alpha!
			
			dest[j] = (r * PS.RSHIFT) + (g * PS.GSHIFT) + b;
			j += 1;
		}
		imgData.pixelSize = 1;		
	}

	imgData.data = dest;
	return imgData;	
};

// Blits an imageData structure to the grid
// imgdata.size can be 1 (multiplexed RGB), 3 or 4 values per pixel
// Optional [xpos/ypos] specify TLC of blit on canvas, default = 0,0
// Optional [top/left/bottom/right] specify region of source to blit, default = entire image

PS.ImageBlit = function ( imgdata, xpos, ypos, left, top, width, height )
{
	"use strict";
	var fn, xmax, ymax, w, h, t, data, psize, wsize, rowptr, ptr, drawx, drawy, ctx, bsize, y, x, r, g, b, a, rgb, rval, gval, i, bead, bs, bx, gx, by, gy, bw, canw, canh;

	fn = "[PS.ImageBlit] ";
	
	xmax = PS.Grid.x;
	ymax = PS.Grid.y;

	// verify imgdata format

	if ( typeof imgdata !== "object" )
	{
		return PS.Oops(fn + "Invalid imgdata parameter");
	}
	
	w = imgdata.width;
	if ( typeof w !== "number" )
	{
		return PS.Oops(fn + "imgdata.width not a number");		
	}
	w = Math.floor(w);
	if ( w < 1 )
	{
		return PS.Oops(fn + "imgdata.width < 1");	
	}

	h = imgdata.height;
	if ( typeof h !== "number" )
	{
		return PS.Oops(fn + "imgdata.height not a number");		
	}
	h = Math.floor(h);
	if ( h < 1 )
	{
		return PS.Oops(fn + "imgdata.height < 1");		
	}
	
	a = PS.D_ALPHA; // assume default alpha
	psize = imgdata.pixelSize;
	if ( typeof psize !== "number" )
	{
		return PS.Oops(fn + "imgdata.pixelSize not a number");			
	}
	psize = Math.floor(psize);	
	if ( (psize !== 1) && (psize !== 3) && (psize !== 4) )
	{
		return PS.Oops(fn + "imgdata.pixelSize is not 1, 3 or 4");				
	}
			
	// verify data is expected length
	
	t = w * h * psize;
	data = imgdata.data;
	if ( data.length !== t )
	{
		return PS.Oops(fn + "imgdata.data length invalid [" + imgdata.data.length + "]");		
	}
	
	// check xpos parameter
	
	if ( (xpos === undefined) || (xpos === PS.DEFAULT) )
	{
		xpos = 0;
	}
	else 
	{
		if ( typeof xpos !== "number" )
		{
			return PS.Oops(fn + "xpos parameter not a number");		
		}
		xpos = Math.floor(xpos);
	
		// exit if drawing off grid
	
		if ( ( xpos >= xmax ) || ( (xpos + w) < 0 ) )
		{
			return true;
		}
	}

	// check ypos parameter
	
	if ( (ypos === undefined) || (ypos === PS.DEFAULT) )
	{
		ypos = 0;
	}
	else
	{
		if ( typeof ypos !== "number" )
		{
			return PS.Oops(fn + "ypos parameter not a number");		
		}
		ypos = Math.floor(ypos);
			
		// exit if drawing off grid
			
		if ( ( ypos >= ymax ) || ( (ypos + h) < 0 ) ) 
		{
			return true;
		}
	}
	
	// check region parameters only if left is defined
	
	if ( left === undefined )
	{
		top = 0; // set defaults
		left = 0;
		width = w;
		height = h;
	}
	else
	{
		// check left parameter
		
		if ( typeof left !== "number" )
		{
			return PS.Oops(fn + "left parameter not a number");		
		}
		left = Math.floor(left);
		if ( ( left < 0 ) || ( left >= w ) ) 
		{
			return PS.Oops(fn + "left parameter outside of image");	
		}
				
		// check top parameter
		
		if ( typeof top !== "number" )
		{
			return PS.Oops(fn + "top parameter not a number");		
		}
		top = Math.floor(top);
		if ( ( top < 0 ) || ( top >= h ) ) 
		{
			return PS.Oops(fn + "top parameter outside of image");	
		}
		
		// check width parameter
		
		if ( typeof width !== "number" )
		{
			return PS.Oops(fn + "width parameter not a number");		
		}
		width = Math.floor(width);
		if ( width < 1 ) 
		{
			return true;	
		}
		if ( (left + width) > w ) 
		{
			return PS.Oops(fn + "left + width exceeds image width");	
		}
				
		// check height parameter
		
		if ( typeof height !== "number" )
		{
			return PS.Oops(fn + "height parameter not a number");		
		}
		height = Math.floor(height);
		if ( height < 1 ) 
		{
			return true;	
		}
		if ( (top + height) > h ) 
		{
			return PS.Oops(fn + "top + height exceeds image height");	
		}
	}

	// adjust width and height so only visible portion gets drawn
	
	canw = xmax - xpos;
	if ( width > canw )
	{
		width = canw;
	}	
	canh = ymax - ypos;
	if ( height > canh )
	{
		height = canh;
	}
	
	wsize = ( w * psize ); // size of each image row (calc only once)
	bsize = PS.Grid.beadSize; // size of beads
	
	canw = bsize * width; // blit canvas width and height
	canh = bsize * height;
	PS.BlitCanvas.width = canw; // erases canvas too
	PS.BlitCanvas.height = canh;	
	ctx = PS.BlitContext; // blit context
		
	// create pointer to TL corner of image data
	
	rowptr = (top * wsize) + (left * psize);	
	drawy = ypos;
	for ( y = 0; y < height; y += 1 )
	{		
		ptr = rowptr; // set data pointer to start of row
		drawx = xpos;
		for ( x = 0; x < width; x += 1 )
		{
			// handle multiplexed rgb
				
			if ( psize === 1 )
			{
				rgb = data[ptr];						
				
				// decode multiplex
						
				r = rgb / PS.RSHIFT;
				r = Math.floor(r);
				rval = r * PS.RSHIFT;
			
				g = (rgb - rval) / PS.GSHIFT;
				g = Math.floor(g);
				gval = g * PS.GSHIFT;
			
				b = rgb - rval - gval;			
			}
			
			// handle r g b (a)
				
			else // psize = 3 or 4
			{
				r = data[ptr];
				g = data[ptr + 1];
				b = data[ptr + 2];
				if ( psize === 4 )
				{
					a = data[ptr + 3];
				}
			}
			
			// r, g, b and a are now determined
			
			if ( a > 0 ) // do nothing if alpha is zero
			{
				i = drawx + (drawy * xmax); // get index of bead
				bead = PS.Grid.beads[i];					
				bead.empty = false; // mark this bead as assigned
				
				if ( a < PS.D_ALPHA ) // Calc new color based on alpha-adjusted color of existing bead
				{
					bead.alphaRed = PS.Dissolve( PS.Grid.bgRed, bead.alphaRed, a );
					bead.alphaGreen = PS.Dissolve( PS.Grid.bgGreen, bead.alphaGreen, a );
					bead.alphaBlue = PS.Dissolve( PS.Grid.bgBlue, bead.alphaBlue, a );
					bead.color = "rgb(" + bead.alphaRed + "," + bead.alphaGreen + "," + bead.alphaBlue + ")";
				}
				else
				{
					bead.alphaRed = r;
					bead.alphaGreen = g;
					bead.alphaBlue = b;
					bead.color = "rgb(" + r + "," + g + "," + b + ")";
				}
				
				// Do NOT change alpha value of existing bead!
				
				bead.red = r;
				bead.green = g;
				bead.blue = b;
			
				bs = bsize;	// initial size of bead						
				bx = x * bsize;	// xpos to draw
				by = y * bsize; // ypos to draw
				
				if ( bead.visible )
				{
					bead.flashPhase = 100; // stops any flash in progress
					bead.colorNow = bead.color;
				
					gx = bx; // save position for glyph
					gy = by;
				
					// draw border if needed
				
					bw = bead.borderWidth;
					if ( bw > 0 )
					{
						ctx.fillStyle = bead.borderColor;
						ctx.fillRect(bx, by, bs, bs);
				
						// adjust position and size of bead rect		
				
						bx += bw;
						by += bw;
						bs -= (bw + bw);
					}
				
					ctx.fillStyle = bead.colorNow;		
					ctx.fillRect(bx, by, bs, bs);
				
					if ( bead.glyph > 0 )
					{
						ctx.fillStyle = bead.glyphColor;
						ctx.fillText (bead.glyphStr, gx + PS.Grid.glyphX, gy + PS.Grid.glyphY);
					}
				}
				else
				{
					ctx.fillStyle = PS.Grid.bgColor;		
					ctx.fillRect(bx, by, bs, bs);
				}
			}
			drawx += 1;
			ptr += psize;
		}	
		drawy += 1;
		rowptr += wsize; // point to start of next row
	}
	
	// blast blitter canvas to screen canvas
	
	PS.Grid.context.drawImage(PS.BlitCanvas, bsize * xpos, bsize * ypos );	
	return true;
};

// Audio functions

// Generic HTML5 audio exception handler

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
			
	PS.Oops("[HTML5 audio error: " + str + "]\n");	
};

// Generic HTML5 audio loading handler

PS.AudioLoaded = function (obj)
{
	"use strict";
	var i, channel;
	
	i = this.getAttribute("data-channel");
	
//	PS.Debug("Loaded " + i + "\n");
	
	channel = PS.AudioChannels[i];	
	channel.status = PS.CH_READY;
	
	if ( channel.playNow )
	{
		channel.playNow = false;
//		PS.Debug("Load/playing sound in in " + i + "\n");
		PS.PlayHTML5Audio(i);
	}
};

// Generic HTML5 audio ending handler
// NOTE: Pausing a channel does NOT call this handler!

PS.AudioEnding = function (obj)
{
	"use strict";
	var i, channel, func;

	i = this.getAttribute("data-channel");
	
//	PS.Debug("Ending " + i + "\n");
	
	channel = PS.AudioChannels[i];
	
	channel.status = PS.CH_READY;
	
	// if channel has an onend exec, call it
	
	func = channel.exec;	
	if ( func && (typeof func === "function") ) // one more check
	{
		try
		{
			channel.exec = null; // don't let it run again
			func(); // call it
		}
		catch (err)
		{
			PS.Oops("Audio function error [" + err.message + "]");
		}
	}	
};

PS.AudioInit = function ()
{
	"use strict";
	var fn, i, snd;
	
	fn = "[PS.AudioInit] ";
	
	if ( !document.createElement("audio").canPlayType )
	{
		PS.Oops(fn + "HTML5 audio not supported");
		return false;
	}
	
	// see if Web Audio API is available
	
	PS.AudioContext = null;
//	if ( PS.HTML5_AUDIO === undefined ) // flag to force HTML5 engine
//	{
//		try
//		{
//			PS.AudioContext = new webkitAudioContext(); // webkit
//		}
//		catch ( err )
//		{
//			try
//			{
//				PS.AudioContext = new AudioContext(); // generic
//			}
//			catch ( err2 )
//			{
//				PS.AudioContext = null;
//			}
//		}
//	}
	
	PS.AudioCurrentPath = PS.D_AUDIO_PATH;

	// init standard audio
	
	if ( !PS.AudioContext )
	{
		PS.ChannelsUsed = 0;
		PS.AudioChannels.length = PS.AUDIO_MAX_CH;
		for ( i = 0; i < PS.AUDIO_MAX_CH; i += 1 )
		{
			snd = document.createElement("audio");
			if ( !snd )
			{
				return PS.Oops(fn + "Audio element init failed");
			}
			snd.setAttribute("data-channel", i ); // remember this element's channel
			snd.setAttribute("onerror", PS.AudioError );
			snd.addEventListener("canplaythrough", PS.AudioLoaded );
			snd.addEventListener("ended", PS.AudioEnding );
			snd.setAttribute("preload", "auto");						
			document.body.appendChild(snd);		
			
			PS.AudioChannels[i] = {
				id: "",
				audio: snd,
				volume: PS.D_VOL,
				playNow: false,
				exec: null,
				status: PS.CH_EMPTY
			};
		}
	}
	
	// init Chrome audio
	
//	else
//	{
//		PS.AudioID = 0;
//		PS.ChromeChannels.length = 0;
//		PS.ChromeBuffers.length = 0;
//		PS.ChromeBufferCnt	= 0;
//		PS.ChromeChannelCnt	= 0;
//	}
	
	return true;
};

PS.AudioPath = function (path)
{
	"use strict";
	var fn;
	
	fn = "[PS.AudioPath] ";

	if ( path === PS.DEFAULT )
	{
		PS.AudioCurrentPath = path = PS.D_AUDIO_PATH;
	}
	else if ( (typeof path !== "string") || (path.length < 1) )
	{
		path = PS.Oops(fn + "path parameter is not a valid string");		
	}
	else
	{
		PS.AudioCurrentPath = path;	
	}
	
	return path;
};

// Load an audio file [id] with optional [path]
// Returns true if ok or PS.ERROR

PS.AudioLoad = function (id, path)
{
	"use strict";
	var fn, fullpath, i;

	fn = "[PS.AudioLoad] ";

	if ( (typeof id !== "string") || (id.length < 1) )
	{
		return PS.Oops(fn + "ID parameter not a valid string");		
	}

	if ( path === undefined )
	{
		path = PS.AudioCurrentPath;
	}
	else if ( path === PS.DEFAULT )
	{
		path = PS.D_AUDIO_PATH;	
	}
	else if ( (typeof path !== "string") || (path.length < 1) )
	{
		return PS.Oops(fn + "Path parameter not a valid string");		
	}
	
	// HTML5 audio
	
	if ( !PS.AudioContext )
	{
		fullpath = path + id + ".wav"; // for now	
		i = PS.LoadHTML5Audio(fullpath);
		if ( i === PS.ERROR )
		{
			return i;
		}
		return true;
	}
	
	// Chrome audio
	
//	fullpath = path + id + ".wav"; // for now
//	return PS.LoadChromeAudio(fullpath);	
};

// Play an audio file [id] with optional [volume], [func], [path]
// Returns a 1-based channel number of PS.ERROR

PS.AudioPlay = function (id, volume, func, path)
{
	"use strict";
	var fn, i, channel, fullpath;
//	var len, bobj;

	fn = "[PS.AudioPlay] ";

	if ( (volume === undefined) || (volume === PS.DEFAULT) )
	{
		volume = PS.D_VOL;
	}
	else
	{
		if ( typeof volume !== "number" )
		{
			return PS.Oops(fn + "Volume parameter not a number");	
		}		
		
		// clamp the volume
		
		if ( volume < 0 )
		{
			volume = 0;
		}
		else if ( volume > PS.MAX_VOL )
		{
			volume = PS.MAX_VOL;
		}
	}
	
	// check func
	
	if ( func === PS.DEFAULT )
	{
		func = null;
	}
	else if ( (func !== undefined) && (typeof func !== "function") )
	{
		return PS.Oops(fn + "Func parameter not a valid function");			
	}	

	// check path
	
	if ( path === undefined )
	{
		path = PS.AudioCurrentPath;
	}
	else if ( path === PS.DEFAULT )
	{
		path = PS.D_AUDIO_PATH;	
	}
	else if ( (typeof path !== "string") || (path.length < 1) )
	{
		return PS.Oops(fn + "Path parameter not a valid string");		
	}
	
	// standard audio
	
	if ( !PS.AudioContext )
	{
		fullpath = path + id + ".wav"; // for now
		
		// is there an unplayed instance of this sound already loaded?

		for ( i = 0; i < PS.AUDIO_MAX_CH; i += 1 )
		{
			channel = PS.AudioChannels[i];
			if ( (channel.id === fullpath) && (channel.status === PS.CH_READY) )
			{
//				PS.Debug("Playing sound in in " + i + "\n");
				return PS.PlayHTML5Audio (i, volume, func); // returns 1-based channel id
			}
		}
		
		// must load a new instance
		
		i = PS.LoadHTML5Audio(fullpath, volume, func, true); // load & play; returns 0-based channel index
		if ( i === PS.ERROR )
		{
			return i;
		}
		return i + 1; // 1-based
	}
	
	// Web Audio API	
	// See if sound is already loaded
	
/*
	fullpath = path + id + ".wav"; // for now
	
	len = PS.ChromeBuffers.length;
	i = 0;
	while ( i < len )
	{
		bobj = PS.ChromeBuffers[i];
		if ( bobj.path === fullpath ) // found it!
		{
			channel = PS.PlayChromeAudio(fullpath, bobj.buffer, volume, func);
			return channel;
		}
		i += 1;
	}
	
	// else load the sound and play it
	
	PS.AudioID += 1;
	channel = PS.AudioID; // specify channel to use
	
	// load, play @ volume, assign id
	
	PS.LoadChromeAudio ( fullpath, volume, func, channel );	
	return channel;
 */	
};

// Stops playback of channel number

PS.AudioStop = function (c)
{
	"use strict";
	var fn, channel;
//	var len, i;

	fn = "[PS.AudioStop] ";

	if ( typeof c !== "number" )
	{
		return PS.Oops(fn + "Parameter is not a number");		
	}
	c = Math.floor(c);
	
	// standard audio
	
	if ( !PS.AudioContext )
	{
		if ( (c < 1) || (c > PS.AUDIO_MAX_CH) )
		{
			return PS.Oops(fn + "Invalid channel id");		
		}
	
		channel = PS.AudioChannels[c - 1];
		channel.audio.pause();
		channel.audio.currentTime = 0; // reset to start
		channel.status = PS.CH_READY;
		return c;
	}
	
	// Web Audio API
	
/*	len = PS.ChromeChannels.length;
	i = 0;
	while ( i < len )
	{
		channel = PS.ChromeChannels[i];
		if ( channel.id === c )
		{
			if ( channel.source && (channel.source.playbackState !== PS.CHROME_FINISHED_STATE) )
			{
				// stop the ending function from being called!
			
				if ( channel.timeoutHandle )
				{
					window.clearTimeout(channel.timeoutHandle);
					channel.timeoutHandle = null;
				}
				try
				{
					channel.source.stop(0); // this is the standard
				}
				catch (err)
				{
					channel.source.noteOff(0); // deprecated!
				}
			}
			PS.ChromeChannels.splice(i, 1); // delete this channel
			PS.ChromeChannelCnt -= 1;
			break;
		}
		i += 1;		
	}
	
	return c;
*/
};

// Pauses/unpauses playback of channel number

PS.AudioPause = function (c)
{
	"use strict";
	var fn, channel, audio;
//	var	len, i, fullpath, buffer, volume, func, pauseTime;

	fn = "[PS.AudioPause] ";

	if ( typeof c !== "number" )
	{		
		return PS.Oops(fn + "Parameter is not a number");		
	}
	c = Math.floor(c);
	
	// standard audio
	
	if ( !PS.AudioContext )
	{	
		if ( (c < 1) || (c > PS.AUDIO_MAX_CH) )
		{
			return PS.Oops(fn + "Invalid channel id [" + c + "]");			
		}
	
		channel = PS.AudioChannels[c - 1];
		audio = channel.audio;	
		if ( audio.paused )
		{
			PS.PlayHTML5Audio(c - 1);
		}
		else
		{
			channel.status = PS.CH_PAUSED;
			audio.pause();
		}
		return c;
	}
	
	// Web Audio API
/*	
	len = PS.ChromeChannels.length;
	i = 0;
	while ( i < len )
	{
		channel = PS.ChromeChannels[i];
		if ( channel.id === c )
		{
			pauseTime = channel.pauseTime;
			if ( pauseTime > 0 ) // if paused, restart
			{
				fullpath = channel.fullpath;
				buffer = channel.buffer;
				volume = channel.volume;
				func = channel.exec;
				PS.ChromeChannels.splice(i, 1); // remove existing channel
				PS.PlayChromeAudio(fullpath, buffer, volume, func, c, pauseTime); // restart
			}
			else if ( channel.source && (channel.source.playbackState !== PS.CHROME_FINISHED_STATE) ) // if not finished, stop it
			{
				// stop the ending function from being called!
				
				if ( channel.timeoutHandle )
				{
					window.clearTimeout(channel.timeoutHandle);
					channel.timeoutHandle = null;
				}				
				pauseTime = PS.AudioContext.currentTime - channel.startTime;
				pauseTime = pauseTime % channel.buffer.duration; // prevents overflow?
				channel.pauseTime = pauseTime; // save pause time
				channel.status = PS.CH_PAUSED;
				try
				{
					channel.source.stop(0); // this is the standard
				}
				catch (err)
				{
					channel.source.noteOff(0); // deprecated!
				}
			}
			else
			{
				PS.ChromeChannels.splice(i, 1); // remove existing channel
				c = PS.ERROR;				
			}
			break;
		}
		i += 1;		
	}
	
	return c;
*/
};

// Create and load a new HTML5 audio element, assign to a channel
// Optional [now] flag specifies immediate playback
// Returns zero-based channel id or PS.ERROR

PS.LoadHTML5Audio = function (fullpath, volume, func, now)
{
	"use strict";
	var fn, channel, i;
	
	fn = "[PS.LoadHTML5Audio] ";
	
	// sound already loaded in an existing, finished, unpaused channel?
	
	for ( i = 0; i < PS.ChannelsUsed; i += 1 )
	{
		channel = PS.AudioChannels[i];
		if ( (channel.id === fullpath) && (channel.status === PS.CH_READY) )
		{			
//			PS.Debug("Found existing finished sound in " + i + "\n");
			channel.audio.currentTime = 0; // reset to start
			if ( volume !== undefined )
			{
				channel.volume = volume;
			}
			if ( func !== undefined )
			{
				channel.exec = func;
			}
			if ( now )
			{
				PS.PlayHTML5Audio(i); // just play it again
			}
			return i;
		}
	}
	
	// next look for an unused channel
		
	for ( i = 0; i < PS.AUDIO_MAX_CH; i += 1 ) // search all channels
	{
		channel = PS.AudioChannels[i];
		if ( channel.status === PS.CH_EMPTY )
		{			
//			PS.Debug("Found empty in " + i + "\n");
			PS.ChannelsUsed = i + 1; // new channel now in use
			channel.id = fullpath;
			channel.audio.setAttribute("src", fullpath);
			channel.status = PS.CH_LOADING;
			if ( volume !== undefined )
			{
				channel.volume = volume;
			}
			if ( func !== undefined )
			{
				channel.exec = func;
			}
			if ( now )
			{
				channel.playNow = true;
			}		
			channel.audio.load();
			return i;
		}
	}

	// if all else fails, hijack a loaded but idle channel
		
	for ( i = 0; i < PS.ChannelsUsed; i += 1 )
	{
		channel = PS.AudioChannels[i];
		if ( channel.status === PS.CH_READY )
		{			
//			PS.Debug("Taking existing sound in " + i + "\n");
			channel.id = fullpath;
			channel.audio.setAttribute("src", fullpath);
			channel.status = PS.CH_LOADING;
			if ( volume !== undefined )
			{
				channel.volume = volume;
			}
			if ( func !== undefined )
			{
				channel.exec = func;
			}
			if ( now )
			{
				channel.playNow = true;
			}		
			channel.audio.load();
			return i;
		}
	}
		
	return PS.ERROR; // no channels available; fail silently
};

// Play a loaded audio channel
// Returns 1-based channel id

PS.PlayHTML5Audio = function (i, volume, func)
{
	"use strict";
	var channel;	

	channel = PS.AudioChannels[i];		
	if ( volume === undefined )
	{
		volume = channel.volume;
	}
	else
	{
		channel.volume = volume;
	}
	channel.audio.volume = volume;
	if ( func !== undefined )
	{
		channel.exec = func;
	}
	channel.status = PS.CH_PLAYING;
	channel.audio.play();
	return i + 1; // 1-based channel id	
};

// Load a Chrome audio file
// Assumes params have been verified
// If optional [volume] is specified, audio plays immediate
// Optional [channel], else default
// Returns true if ok, else PS.ERROR

/*
PS.LoadChromeAudio = function (fullpath, volume, func, channel, offsetTime)
{
	"use strict";
	var fn, len, i, bobj, request;
	
	fn = "[PS.LoadChromeAudio] ";
	
	// see if this file is already loaded
	
	len = PS.ChromeBuffers.length;
	i = 0;
	while ( i < len )
	{
		bobj = PS.ChromeBuffers[i];
		if ( bobj.path === fullpath ) // already loaded
		{
			return true;
		}
		i += 1;
	}
	
	request = new XMLHttpRequest();
	if ( !request )
	{
		return PS.Oops(fn + "XMLHttpRequest error");
	}
	request.open('GET', fullpath, true);
	request.responseType = "arraybuffer";
	request.onload = function ()
	{
		PS.AudioContext.decodeAudioData ( request.response,
			function (buffer) // on successful load
			{
				// add decoded buffer to list
				
				PS.ChromeBuffers.push( { path: fullpath, buffer: buffer } );				
				PS.ChromeBufferCnt += 1;
				if ( volume )
				{
					PS.PlayChromeAudio(fullpath, buffer, volume, func, channel, offsetTime);
				}
			},
			function () // on error
			{
				PS.Oops(fn + "Error loading " + fullpath + "]");
			} );
	};
	
	try
	{
		request.send();	
	}
	catch (err)
	{		
		return PS.Oops(fn + "XMLHttpRequest failed: " + fullpath + " [" + err.message + "]");
	}
	
	return true; // no issues
};

PS.ChromeEnding = function (channel)
{
	"use strict";
	var len, i, cdata, func;
	
	len = PS.ChromeChannels.length;
	i = 0;
	while ( i < len )
	{
		cdata = PS.ChromeChannels[i];
		if ( cdata.id === channel )
		{			
			func = cdata.exec; // save the exec, if any
			
			// source may be killed already!
			// but if not, kill it now
			
			if ( channel.source && (channel.source.playbackState !== PS.CHROME_FINISHED_STATE) )
			{
				PS.Debug("Channel not done!\n");
				try
				{
					channel.source.stop(0); // this is the standard
				}
				catch (err)
				{
					channel.source.noteOff(0); // deprecated!
				}
			}			
		
			// call user function if valid
			
			if ( func && (typeof func === "function") )
			{
				try
				{
					func();
				}
				catch (err2)
				{
					PS.Opps("Audio end function error [" + err2.message + "]");
				}
			}
			
			// delete the channel last (why? who knows?)
			
			PS.ChromeChannels.splice(i, 1);
			PS.ChromeChannelCnt -= 1;
			break;	
		}
		i += 1;
	}
};

// Plays from a [path] and [buffer]
// Optional [volume], else default
// Optional [func], else none
// Optional [channel], else default
// Optional [offsetTime], else 0
// Returns channel id or PS.ERROR

PS.PlayChromeAudio = function (fullpath, buffer, volume, func, channel, offsetTime)
{
	"use strict";
	var fn, source, gainNode, cdata, duration, timeout;
				
	fn = "[PS.PlayChromeAudio] ";
	
	source = PS.AudioContext.createBufferSource();
	if ( !source )
	{
		return PS.Oops(fn + "Invalid bufferSource");
	}
	source.buffer = buffer;
	
	try
	{
		gainNode = PS.AudioContext.createGain(); // this call should work
	}
	catch (err)
	{
		gainNode = PS.AudioContext.createGainNode(); // this is deprecated!
	}
	
	if ( !gainNode )
	{
		return PS.Oops(fn + "Invalid gainNode");
	}
				
	source.connect(gainNode);
	gainNode.connect(PS.AudioContext.destination);
	
	if ( volume === undefined )
	{
		volume = PS.D_VOL;
	}
	gainNode.gain.value = volume;
	
	if ( channel === undefined )
	{
		PS.AudioID += 1;
		channel = PS.AudioID;
	}
	
	if ( offsetTime === undefined )
	{
		offsetTime = 0;
	}
	
	// calc timeout
	
	duration = buffer.duration - offsetTime;
	
	timeout = Math.floor(duration * 1000);
	timeout += 25; // slight delay to be sure it's done
	
	// create a channel
	
	cdata = {
		id: channel,
		path: fullpath,
		buffer: buffer,
		source: source,
		volume: volume,
		gainNode: gainNode,
		startTime: PS.AudioContext.currentTime - offsetTime, // fixes multiple pauses
		pauseTime: 0,
		status: PS.CH_PLAYING,
		exec: func,
		timeoutHandle: window.setTimeout(PS.ChromeEnding, timeout, channel) // save handle in case of pause
	};
	
	PS.ChromeChannels.push( cdata );
	PS.ChromeChannelCnt += 1;
	
	// begin playback

	try
	{
		source.start(0, offsetTime, duration); // this should work according to the spec
	}
	catch (err2)
	{
		source.noteGrainOn(0, offsetTime, duration); // this call is deprecated!
	}

	return channel;
};
 */

// Initialization

PS.Sys = function ()
{
	"use strict";
	var fn, errm, main, foot, debug, e, mon, i;

	fn = "[PS.Sys] ";
	errm = fn + "Invalid element";
	
	// clear keypress record if window loses focus
	
	window.onblur = function (event)
	{
		var len, i;
		
		len = PS.Pressed.length;
		for ( i = 0; i < len; i += 1 )
		{
			PS.Pressed[i] = 0;
		}	
	};
	
	// create main and debug divs
		
	main = document.createElement("div");
	if ( !main )
	{
		window.alert(errm);
		return;
	}
	main.id = PS.MAIN_ID;
	document.body.appendChild(main);

	debug = document.createElement("div");
	if ( !debug )
	{		
		window.alert(errm);
		return;
	}
	debug.id = PS.DBG_ID;
	document.body.appendChild(debug);
		
	// create status line, append to main div
	// <input id="status" name="status" type="text" readonly value="Perlenspiel"/>
	
	e = document.createElement("input");
	if ( !e )
	{		
		window.alert(errm);
		return;
	}
	e.id = PS.STS_ID;
	e.type = "text";
	e.readonly = "readonly";
	e.value = "";
//	e.value = PS.Status;
	main.appendChild(e);	
	
	// init fade-ups
	
	PS.StatusUp = true;
	PS.StatusUpRate = PS.D_STS_UP;
	PS.StatusUpStep = PS.CalcStep(PS.D_STS_UP);
	
	// init keypress array
	
	PS.Pressed.length = 256;
	for ( i = 0; i < 256; i += 1 )
	{
		PS.Pressed[i] = 0;
	}
	PS.Holding.length = 0;

	// Create canvas, init mouse/keyboard events, append to main div
	// <canvas id="screen" name="screen" width=480 height=480>No HTML5 canvas!</canvas>
		
	e = document.createElement("canvas");
	if ( !e )
	{
		window.alert(fn + "HTML5 canvas not supported.");
		return;
	}
	e.id = PS.CVS_ID;
	e.width = PS.CVS_W;
	e.height = PS.CVS_W;
	e.addEventListener("mousedown", PS.MouseDown, false);
	e.addEventListener("mouseup", PS.MouseUp, false);
	e.addEventListener("mouseout", PS.MouseOut, false);
	e.addEventListener("mousemove", PS.MouseMove, false);
	main.appendChild(e);	

	// create footer <p id="footer" name="footer">Loading Perlenspiel</p>
	
	foot = document.createElement("p");
	if ( !e )
	{
		window.alert(errm);
		return;
	}
	foot.id = PS.FTR_ID;
	foot.innerHTML = "Loading Perlenspiel";
	main.appendChild(foot);
	
	// create monitor, append to debug div
	// <textarea id="mon" cols=57 rows=8 wrap="soft" readonly="readonly">
	
	mon = document.createElement("textarea");
	if ( !mon )
	{
		window.alert(errm);
		return;
	}
	mon.id = PS.MON_ID;
	mon.cols = 57;
	mon.rows = 8;
	mon.wrap = "soft";
	mon.readonly = "readonly";
	mon.onfocus = function () { PS.DebugFocus = true; };
	mon.onblur = function () { PS.DebugFocus = false; };
	debug.appendChild(mon);
		
	// Init audio support, preload error sound

	if ( !PS.AudioInit() )
	{
		return; // die if audio system fails
	}
	
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

    // Set up keyboard and mouse wheel events

    document.onkeydown = PS.SysKeyDown;
    document.onkeyup = PS.SysKeyUp;
    
    if ( window.addEventListener )
    {
		window.addEventListener('DOMMouseScroll', PS.SysWheel, false); // for Firefox
		window.addEventListener('mousewheel', PS.SysWheel, false); // for others
	}
	else
	{
		window.onmousewheel = PS.SysWheel; // for IE, maybe
		document.onmousewheel = PS.SysWheel;
	}
	
	// Create offscreen canvas for image manipulation
	
	PS.ImageCanvas = document.createElement("canvas");
	
	// Create offscreen canvas for blitter
	
	PS.BlitCanvas = document.createElement("canvas");
	PS.BlitCanvas.width = PS.CVS_W;
	PS.BlitCanvas.height = PS.CVS_W;
	PS.BlitContext = PS.BlitCanvas.getContext("2d");
	
	// Print version number
	
	foot.innerHTML = PS.APP + " " + PS.MAJ + "." + PS.MIN + "." + PS.REV;
	
	// Start the timer
	
	PS.Timer();
	
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
		PS.GridSize(PS.D_G_W, PS.D_G_H);
	}
};

