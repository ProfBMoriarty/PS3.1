// Utilities

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

