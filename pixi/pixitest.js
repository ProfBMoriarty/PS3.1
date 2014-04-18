// pixitest.js

// The following comments are for JSLint

/*jslint nomen: true, white: true, vars: true */
/*global document, window, screen, console, PIXI */

var PT; // Global namespace for public API

( function ()
{
	"use strict";

	var _stage;
	var _renderer;
	var _graphics;

	var _mainLeft;
	var _mainTop;

	function _tick ()
	{
		requestAnimFrame( _tick );

		// render the stage
		_renderer.render( _stage );
	}

	// NOTE: PIXI's drawEllipse documentation appears to be incorrect
	// drawEllipse( x, y, width, height )
	// x, y = CENTER coordinates of the ellipse
	// width = horizontal RADIUS (half total width)
	// height = vertical RADIUS (half total height)

	function _roundSquare ( g, x, y, width, radius )
	{
		var cx, cy, rad, w, dw;

		if ( radius <= 0 )
		{
			g.drawRect( x, y, width, width );
			return;
		}

		if ( radius >= 50 )
		{
			rad = Math.floor( width / 2 );
			g.drawEllipse( x + rad, y + rad, rad, rad );
			return;
		}

		// Calc TOTAL width of corner ellipses

		w = Math.floor( ( width * radius ) / 50 );

		// Calc delta width/height

		dw = width - w;

		// If w < 2, just show circle

		if ( dw < 2 )
		{
			rad = Math.floor( width / 2 );
			g.drawEllipse( x + rad, y + rad, rad, rad );
			return;
		}

		// Draw four corner ellipses

		rad = Math.floor( w / 2 );
		cx = x + rad;
		cy = y + rad;

		g.drawEllipse( cx, cy, rad, rad ); // top left
		g.drawEllipse( cx, cy + dw, rad, rad ); // bottom left
		g.drawEllipse( cx + dw, cy, rad, rad ); // top right
		g.drawEllipse( cx + dw, cy + dw, rad, rad ); // bottom right

		// Draw horizontal rect

		g.drawRect( x, cy, width, dw );

		// Draw vertical rect

		g.drawRect( cx, y, dw, width );
	}

	PT = {
		init : function ()
		{
			var outer, main, status, snode, text;

			document.body.id = "body";
			document.body.style.backgroundColor = "#FFFFFF";

			outer = document.createElement( "div" );
			outer.id = "outer";
			document.body.appendChild( outer );

			main = document.createElement( "div" );
			main.id = "main";
			outer.appendChild( main );

			// save offset coordinates

			_mainLeft = main.offsetLeft;
			_mainTop = main.offsetTop;

			// Create status line paragraph

			status = document.createElement( "p" );
			status.id = "stsp"; // use id for styling
			status.style.whiteSpace = "nowrap"; // limits to one line
			status.style.display = "block"; // initially visible
			snode = document.createTextNode( "PIXI Test" );
			status.appendChild( snode );
			main.appendChild( status );

			// create an new instance of a pixi stage
			_stage = new PIXI.Stage( 0x000000 );

			// create a renderer instance.
			_renderer = PIXI.autoDetectRenderer(512, 512);

			// add the renderer view element to the DOM
			_renderer.view.id = "grid";
			_renderer.view.style.boxShadow = "none";
			main.appendChild( _renderer.view );

			_graphics = new PIXI.Graphics();

			_graphics.beginFill( 0xFF0000, 1 ); // color, alpha
			_graphics.drawRect( 0, 0, 64, 64 ); // top, left, width, height
			_graphics.endFill();

			_graphics.beginFill( 0x0000FF, 0.5 ); // color, alpha
			_graphics.drawRect( 0, 0, 64, 64 ); // top, left, width, height
			_graphics.endFill();

			_graphics.beginFill( 0x00C000, 1 ); // color, alpha
			_roundSquare ( _graphics, 64, 0, 64, 0 );
			_roundSquare ( _graphics, 128, 0, 64, 10 );
			_roundSquare ( _graphics, 192, 0, 64, 20 );
			_roundSquare ( _graphics, 256, 0, 64, 25 );
			_roundSquare ( _graphics, 320, 0, 64, 30 );
			_roundSquare ( _graphics, 384, 0, 64, 40 );
			_roundSquare ( _graphics, 448, 0, 64, 50 );
			_graphics.endFill();

			_stage.addChild( _graphics );

			text = new PIXI.Text("P", {
				font: "32px sans-serif",
				fill: "rgba(255,255,255,0.5)",
				strokeThickness : 0
			} );
			text.anchor.x = 0.5; // center x
			text.anchor.y = 0.5; // center y
			text.position.x = 32;
			text.position.y = 32;
			_stage.addChild(text);

			requestAnimFrame( _tick );
		}
	};

}() );

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel

( function ()
{
	"use strict";
	var lt, v, i, prefix;

	lt = 0;
	v = [ "webkit", "moz", "ms", "o" ];

	for ( i = 0; ( i < v.length ) && !window.requestAnimationFrame; i += 1 )
	{
		prefix = v[i];
		window.requestAnimationFrame = window[ prefix + "RequestAnimationFrame" ];
		window.cancelAnimationFrame = window[ prefix + "CancelAnimationFrame" ] || window[ prefix + "CancelRequestAnimationFrame" ];
	}

	if ( !window.requestAnimationFrame )
	{
		window.requestAnimationFrame = function ( cb, e )
		{
			var ct, ttc, id;

			ct = new Date().getTime();
			ttc = Math.max( 0, 16 - ( ct - lt ) );
			id = window.setTimeout( function ()
			                        {
				                        cb( ct + ttc );
			                        }, ttc );
			lt = ct + ttc;
			return id;
		};
	}

	if ( !window.cancelAnimationFrame )
	{
		window.cancelAnimationFrame = function ( id )
		{
			window.clearTimeout( id );
		};
	}
}() );
