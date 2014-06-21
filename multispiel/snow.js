// game.js for Perlenspiel 3.0
// SnowToy by Mark Diehr

/*
	This project was borne out of an interesting code style detailed in
	this blog post: http://inimino.org/~inimino/blog/javascript_whitespace
	In short, it attempts to place the most important bit of information
	on the left-most edge of each line of code. A side effect of this is
	that the mostly-useless curly braces get shunted elsewhere, and commas
	show up on the left hand side for any sort of list.

	Later, I discovered that I could make a Perlenspiel timer self-
	destruct by including a reference to the timer's identifying string in
	the closuer of the function being passed in. I used this to create a
	simple "TweenTo" function that adjusts a bead property over time to
	meet a target value. Once there, the timer clears. This system doesn't
	account for more complicated tweens, or using multiple tweens on the
	same property, or easing functions, or anything complicated like that.
*/

/*
	Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
	Perlenspiel is Copyright © 2009-13 Worcester Polytechnic Institute.
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

(function() {
var PS = PERLENSPIEL.Create({namespace:"snow"});

/////////////////////////////////////////////////////////////////
// Game definition
/////////////////////////////////////////////////////////////////

var GAME = { w: 22
		   , h: 16
		   , clock: 14
		   , hitTop: false
		   , snowGlyphs: "❄❅❆*☆☸✻❉✶✼" 
		   , objects: null	// List of active objects
		   , timerString: undefined
		   , empty: 0
		   , solid: 1
		   , offGrid: 2
		   , title: "Snow Toy"
		   , running: true
		   }

// One-time initialization
GAME.Init = function() {
	PS.gridSize(this.w, this.h)
	PS.statusText(this.title)
	PS.gridColor(PS.COLOR_BLACK)
	PS.statusColor(PS.COLOR_WHITE)
	PS.fade(PS.ALL, PS.ALL, 0)
	PS.color(PS.ALL, PS.ALL, PS.COLOR_BLACK)
	GAME.Start() }

// Reset board to beginning state and start the update loop
GAME.Start = function() {
	PS.border(PS.ALL, PS.ALL, 0)
	TweenBoard(1.0, PS.color.bind(PS), PS.COLOR_BLACK, colorLerp)
	PS.glyph(PS.ALL, PS.ALL, 0)
	PS.data(PS.ALL, PS.ALL, this.empty)
	this.objects = new Array()
	this.hitTop = false
	this.running = true
	// Stop old timer if it was running
	if( this.timerString !== undefined )
		PS.timerStop(this.timerString)
	// Start new timer
	this.timerString = PS.timerStart(this.clock, this.Update.bind(this)) }

// Main game loop
GAME.Update = function() {
	// Make flakes
	if( RandBetween(0, 3) <= 1 ) {
		this.SpawnFlake(RandBetween(0, GAME.w-1), 0) }

	for( var i = 0; i < this.objects.length; ++i ) {
		this.objects[i].Erase() }

	for( var i = 0; i < this.objects.length; ++i ) {
		this.objects[i].Update() }

	// Destroy inactive objects
	for( var i = 0; i < this.objects.length; ++i ) {
		if( this.objects[i].active === false ) {
			this.objects.splice(i, 1)
			i--; }}

	for( var i = 0; i < this.objects.length; ++i ) {
		this.objects[i].Render() }
	
	if( this.hitTop )
		this.Start() }

// Places a solid "snowball" in a given bead
GAME.Snowball = function(x, y, color) {
	PS.data(x, y, 1)		// Make solid
	PS.color(x, y, color)	// Fill color with flake color
	PS.radius(x, y, 50)		// Turn into a snowball shape
	PS.border(x, y, 15)		// Set border to match the background color
	PS.borderColor(x, y, PS.COLOR_BLACK)
	TweenTo(x, y, 0.4, PS.border.bind(PS), 0, lerpBorder)
	// Tween the one below to a square bead
	if( GAME.data(x, y+1, GAME.offGrid) === GAME.solid ) {
		TweenTo(x, y+1, 0.8, PS.radius.bind(PS), 0, lerp) } }

// Make a flake
GAME.SpawnFlake = function(x, y) {
	this.objects.push(new Flake(x, y)) }

// Touch event
GAME.Touch = function(x, y, data) {
	this.SpawnFlake(x, y) }

// Utility to get data safely. If outside the grid, return the fallback value
GAME.data = function(x, y, fallback) {
	if(x < 0 || y < 0 || x >= this.w || y >= this.h) return fallback;
	return PS.data(x, y); }

/////////////////////////////////////////////////////////////////
// Some fun utility functions
/////////////////////////////////////////////////////////////////

// Uniform distribution between two integers, inclusive
function RandBetween(a, b) {
	return Math.floor(Math.random() * (b-a) + a) }

// Chooses an item from a list (array or string), randomly
function RandomFrom(list) {
	return list[ RandBetween(0, list.length) ] }

// Binds a function call to a particular object
function bind(func, object) {
	return function() {
		return func.apply(object, arguments) }}

function lerp(a, b, t) {
	return (a + (b-a) * t); }

function lerpBorder(a, b, t) {
	if (typeof a === "object")
		a = a.width
	if (typeof b === "object")
		b = b.width
	return Math.floor(a + (b-a) * t); }

function lerp2(a, b, t) {
	return (a + (b-a) * (t*t)); }

function colorLerp(a, b, t) {
	var colorA = PS.unmakeRGB(a, {a:1})
	var colorB = PS.unmakeRGB(b, {a:t})
	var color = colorBlendAlpha(colorA, colorB)
	return PS.makeRGB(color.r, color.g, color.b); }

// Blend color c1 over c0. Color components are in 0-255, alpha is 0-1
function colorBlendAlpha ( c0, c1 ) {
	var alphaCover, result;
	alphaCover = c0.a * ( 1 - c1.a );
	result = { r : Math.floor( ( c1.r * c1.a ) + ( c0.r * alphaCover ) )
			 , g : Math.floor( ( c1.g * c1.a ) + ( c0.g * alphaCover ) )
			 , b : Math.floor( ( c1.b * c1.a ) + ( c0.b * alphaCover ) )
			 };
	return result; }

// Tweens a bead property to a target value over time
function TweenTo(x, y, seconds, func, targetValue, easing, onComplete) {
	if( easing === undefined ) easing = lerp;
	var value = func(x, y)	// Starting value of property
	var timerString = ""	// For stopping the timer
	var time = 0
	var timeStep = (1/seconds)/60
	timerString = PS.timerStart(1, function() {
		time = Approach(time, 1, timeStep);
		var newValue = Math.round(easing(value, targetValue, time));
		func(x, y, newValue)
		if (time === 1) {
			PS.timerStop(timerString)
			if(typeof onComplete === "function") onComplete() }})}

// Tweens every bead on the board
function TweenBoard(seconds, func, targetValue, easing, onComplete) {
	for (var x = 0; x < GAME.w; ++x) {
		for (var y = 0; y < GAME.h; ++y) {
			TweenTo(x, y, seconds, func, targetValue, easing, onComplete); }}}

// Returns a value that is at most "step" closer to "target"
function Approach(value, target, step) {
	if (value < target ) {
		return Math.min(target, value + step); }
	else if (value > target) {
		return Math.max(target, value - step); } 
	return value; }

/////////////////////////////////////////////////////////////////
// Flake object
/////////////////////////////////////////////////////////////////

function Flake(x, y) {
	this.x = x
	this.y = y
	this.glyph = RandomFrom(GAME.snowGlyphs)
	this.level =  RandBetween(200, 255)
	this.color = PS.makeRGB(this.level, this.level, 255)
	this.active = true }

Flake.prototype.Erase = function() {
	if (!this.active)	return;
	PS.glyph(this.x, this.y, 0) }

Flake.prototype.Render = function() {
	if (!this.active) return;
	PS.glyph(this.x, this.y, this.glyph)
	PS.glyphColor(this.x, this.y, this.color) }

Flake.prototype.Update = function() {
	if (!this.active) return;

	var stop = false;
	var newY = this.y + 1;
	var downOpen  = GAME.data(this.x,   newY, GAME.offGrid) === GAME.empty;
	var rightOpen = GAME.data(this.x+1, newY, GAME.offGrid) === GAME.empty;
	var leftOpen  = GAME.data(this.x-1, newY, GAME.offGrid) === GAME.empty;

	// Check for collisions with old snow or the ground
	if( newY >= GAME.h ) { // Hit the floor
		stop = true }
	else if( downOpen ) { // Fall straight down
		/* do nothing */ }
	else if( leftOpen && rightOpen ) { // Go either way
		this.x += RandBetween(0, 1) * 2 - 1 }
	else if( rightOpen  )	{	// Slide right
		this.x += 1 }
	else if( leftOpen )	{	// Slide left
		this.x -= 1 }
	else {
		stop = true }	// Hit another block of snow and can't slide

	if( stop ) {
		this.active = false;
		GAME.Snowball(this.x, this.y, this.color)
		// Reset once it hits the top
		if( this.y === 0 )	GAME.hitTop = true }
	else {
		this.y += 1 }}

/////////////////////////////////////////////////////////////////
// Perlenspiel events
/////////////////////////////////////////////////////////////////

// PS.init( system, options )
// Initializes the game
PS.init = function( system, options ) {
	"use strict";
	// Start it off!
	GAME.Init() };

// PS.touch ( x, y, data, options )
// Called when the mouse button is clicked on a bead, or when a bead is touched
PS.touch = function( x, y, data, options ) {
	"use strict";
	// Pass through to GAME
	GAME.Touch(x, y, data) };

// PS.release ( x, y, data, options )
// Called when the mouse button is released over a bead, or when a touch is lifted off a bead
PS.release = function( x, y, data, options ) {
	"use strict";
};

// PS.enter ( x, y, button, data, options )
// Called when the mouse/touch enters a bead
PS.enter = function( x, y, data, options ) {
	"use strict";
};

// PS.exit ( x, y, data, options )
// Called when the mouse cursor/touch exits a bead
PS.exit = function( x, y, data, options ) {
	"use strict";
};

// PS.exitGrid ( options )
// Called when the mouse cursor/touch exits the grid perimeter
PS.exitGrid = function( options ) {
	"use strict";
};

// PS.keyDown ( key, shift, ctrl, options )
// Called when a key on the keyboard is pressed
PS.keyDown = function( key, shift, ctrl, options ) {
	"use strict";
};

// PS.keyUp ( key, shift, ctrl, options )
// Called when a key on the keyboard is released
PS.keyUp = function( key, shift, ctrl, options ) {
	"use strict";
};

// PS.input ( sensors, options )
// Called when an input device event (other than mouse/touch/keyboard) is detected
PS.input = function( sensors, options ) {
	"use strict";
};

// Start the engine!
PS.start();
})();