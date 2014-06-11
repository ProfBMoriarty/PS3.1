// Triangulator by Mark Diehr
// Click & Drag the points to make a pretty polygon.

(function() {
var PS = PERLENSPIEL.Create({namespace:"triangulator"});

var POINTS = new Array();
POINTS.push({x:13, y:2, color:PS.COLOR_RED});
POINTS.push({x:20, y:4, color:PS.COLOR_ORANGE});
POINTS.push({x:21, y:22, color:PS.COLOR_GREEN});
POINTS.push({x:2, y:10, color:PS.COLOR_INDIGO});

var GAME = {
	name : "Triangulator",
	w : 32,
	h : 32,
	gridColor : PS.COLOR_BLACK,
	color : PS.COLOR_BLACK,
	highlight : PS.COLOR_WHITE,
	alpha : 180,
}

var MOUSE = {
	loc : {x:-1, y:-1},
	down : {x:-1, y:-1},
	grabbed : undefined,
	Grab : function(x, y) {
		this.grabbed = GrabPoint(POINTS, {x:x, y:y});
		if( this.grabbed !== undefined ) {
			HighlightPoint(this.grabbed);
		}
	},
	Drop : function() {
		this.grabbed = undefined;
		Redraw(POINTS);
	},
	Move : function(x, y) {
		if( this.grabbed !== undefined ) {
			this.grabbed.x = x;
			this.grabbed.y = y;
			Redraw(POINTS);
			HighlightPoint(this.grabbed);
		}
	},
}

function Clear() {
	PS.border(PS.ALL, PS.ALL, 0);
	PS.color(PS.ALL, PS.ALL, GAME.color);
	PS.radius(PS.ALL, PS.ALL, 0);
	PS.data(PS.ALL, PS.ALL, 0);
	PS.alpha(PS.ALL, PS.ALL, 255);
}

function Cross(p0, p1) {
	return ((p0.x * p1.y) - (p0.y * p1.x));
}

function TriDirection(p0, p1, p2) {
	return Cross({x:p1.x-p0.x, y:p1.y-p0.y}, {x:p2.x-p0.x, y:p2.y-p0.y});
}

function Redraw(points) {
	Clear();
	
	var toggle = true;
	for( var i = 1; i < points.length - 1; ++i ) {
		DrawTriangle(points[0], points[i], points[i+1], toggle);
	}

	ConnectVertexes(points);
	
	DrawVertexes(points);
}

function DrawVertexes(points) {
	for(var i = 0; i < points.length; ++i) {
		DrawVertex(points[i]);
	}
}

function ConnectVertexes(points) {
	var lastPointIndex = points.length - 1;
	for(var i = 0; i < lastPointIndex; ++i) {
		DrawLine(points[i], points[i+1]);
	}
	DrawLine(points[0], points[lastPointIndex]);
}

function round(i) {
	return Math.floor(i+0.5);
}

function DrawLine(p0, p1) {
	var dx = p1.x - p0.x;
	var dy = p1.y - p0.y;
	var dx1 = Math.abs(dx);
	var dy1 = Math.abs(dy);
	var px = 2 * dy1 - dx1;
	var py = 2 * dx1 - dy1;
	var color = 0x999999;
	var rgb0 = {};
	var rgb1 = {};
	PS.unmakeRGB(p0.color, rgb0);
	PS.unmakeRGB(p1.color, rgb1);
	var x, y, xe, ye, r, g, b, dr, dg, db;

	if( dy1 <= dx1 )
	{
		dr = (rgb1.r - rgb0.r) / dx;
		dg = (rgb1.g - rgb0.g) / dx;
		db = (rgb1.b - rgb0.b) / dx;

		if( dx >= 0 ) {
			x = p0.x;
			y = p0.y;
			xe = p1.x;
			rgb = rgb0;
		} else {
			x = p1.x;
			y = p1.y;
			xe = p0.x;
			rgb = rgb1;
		}

		PS.color(x, y, [rgb.r, rgb.g, rgb.b]);
		PS.alpha(x, y, 255);

		for( var i = 0; x < xe; ++i ) {
			x += 1;
			rgb.r += dr;
			rgb.g += dg;
			rgb.b += db;
			if( px < 0 ) {
				px = px + 2 * dy1;
			} else {
				if( dx<0 && dy<0 || dx>0 && dy>0 ) {
					y += 1;
				}
				else {
					y -= 1;
				}
				px += 2 * (dy1 - dx1);
			}
			PS.color(x, y, [rgb.r, rgb.g, rgb.b]);
			PS.alpha(x, y, 255);
		}
	} else {
		dr = (rgb1.r - rgb0.r) / dy;
		dg = (rgb1.g - rgb0.g) / dy;
		db = (rgb1.b - rgb0.b) / dy;
		if( dy >= 0 ) {
			x = p0.x;
			y = p0.y;
			ye = p1.y;
			rgb = rgb0;
		} else {
			x = p1.x;
			y = p1.y;
			ye = p0.y;
			rgb = rgb1;
		}

		PS.color(x, y, [rgb.r, rgb.g, rgb.b]);
		PS.alpha(x, y, 255);

		for( var i = 0; y < ye; ++i ) {
			y += 1;
			rgb.r += dr;
			rgb.g += dg;
			rgb.b += db;
			if( py < 0 ) {
				py = py + 2 * dx1;
			} else {
				if( dx<0 && dy<0 || dx>0 && dy>0 ) {
					x += 1;
				}
				else {
					x -= 1;
				}
				py += 2 * (dx1 - dy1);
			}

			PS.color(x, y, [rgb.r, rgb.g, rgb.b]);
			PS.alpha(x, y, 255);
		}
	}
}

// Takes parameters in the format of [{color:c, alpha:a}, ...]
function ColorBlend() {
	var r = 0;
	var g = 0;
	var b = 0;
	var rgb = new Array();
	for( var i = 0; i < arguments.length; ++i ) {
		rgb[i] = {};
		PS.unmakeRGB(arguments[i].color, rgb[i]);
		r += rgb[i].r * arguments[i].alpha;
		g += rgb[i].g * arguments[i].alpha;
		b += rgb[i].b * arguments[i].alpha;
	}
	return PS.makeRGB(r, g, b);
}

// Shirley, 64
function DrawTriangle(p0, p1, p2, toggle) {
	var xMin = Math.min(p0.x, p1.x, p2.x);
	var xMax = Math.max(p0.x, p1.x, p2.x);
	var yMin = Math.min(p0.y, p1.y, p2.y);
	var yMax = Math.max(p0.y, p1.y, p2.y);
	var fa = fLine(p1, p2, p0.x, p0.y);
	var fb = fLine(p2, p0, p1.x, p1.y);
	var fc = fLine(p0, p1, p2.x, p2.y);
	var a, b, c, x, y, color;
	var offx = -1.000000001, offy = -0.999999;
	var offa = fa * fLine(p1, p2, offx, offy);
	var offb = fb * fLine(p2, p0, offx, offy);
	var offc = fc * fLine(p0, p1, offx, offy);
	for( y = yMin; y <= yMax; ++y ) {
		for( x = xMin; x <= xMax; ++x ) {
			a = fLine(p1, p2, x, y) / fa;
			b = fLine(p2, p0, x, y) / fb;
			c = fLine(p0, p1, x, y) / fc;
			if( a >= 0 && b >= 0 && c >= 0 ) {
				if( (a > 0 || offa > 0) && (b > 0 || offb > 0) && (c > 0 || offc > 0)) {
					if( PS.color(x, y) === GAME.color || !toggle ) {
						p0.alpha = a;
						p1.alpha = b;
						p2.alpha = c;
						color = ColorBlend(p0, p1, p2);
						PS.color(x, y, color);
						//PS.color(x, y, PS.COLOR_WHITE);
						PS.alpha(x, y, GAME.alpha);
					} else {
						PS.color(x, y, GAME.color);
					}
				}
			}
		}
	}
}

// Shirley, 64
function fLine(p0, p1, x, y) {
	return (p0.y - p1.y) * x + (p1.x - p0.x) * y + p0.x*p1.y - p1.x*p0.y;
}

function DrawVertex(point) {
	PS.color(point.x, point.y, point.color);
	PS.radius(point.x, point.y, 50);
	PS.alpha(point.x, point.y, 255);
}

function HighlightPoint(point) {
	PS.borderColor(point.x, point.y, GAME.highlight);
	PS.border(point.x, point.y, 4);
}

function GrabPoint(points, grabLocation) {
	for(var i = 0; i < points.length; ++i) {
		if( SameLocation(points[i], grabLocation) ) {
			return points[i];
		}
	}
	return undefined;
}

function SameLocation(p0, p1) {
	return ((p0.x === p1.x) && (p0.y === p1.y));
}

PS.init = function( system, options ) {
	"use strict";

	PS.gridSize( GAME.w, GAME.h );

	PS.statusText(GAME.name);
	PS.statusColor(GAME.highlight);
	PS.gridColor(GAME.gridColor);

	Redraw(POINTS);
};

PS.touch = function( x, y, data, options ) {
	"use strict";
	MOUSE.Grab(x, y);
};

PS.release = function( x, y, data, options ) {
	"use strict";
	MOUSE.Drop();
};

PS.enter = function( x, y, data, options ) {
	"use strict";
	MOUSE.Move(x, y);
};

PS.exitGrid = function( options ) {
	"use strict";
	MOUSE.Drop();
};

PS.exit = function( x, y, data, options ) {};
PS.keyDown = function( key, shift, ctrl, options ) {};
PS.keyUp = function( key, shift, ctrl, options ) {};
PS.input = function( sensors, options ) {};

// Start the engine!
PS.start();
})();