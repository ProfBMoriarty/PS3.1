// play.js
// Created 29 September 2011

// The following comment is for JSLint

/*global document, window, Audio */

var PSA = {
	play : function ( id )
	{
		"use strict";
		var snd, path;

		path = "http://users.wpi.edu/~bmoriarty/ps/audio/" + id + ".wav";
		snd = document.createElement( "audio" );
		snd.setAttribute( "src", path );
		snd.setAttribute( "id", id );
		snd.setAttribute( "preload", "auto" );
		document.body.appendChild( snd );
		snd.volume = 1.0;
		snd.load();
		snd.play();
	},

	dots : function ()
	{
		"use strict";
		var rgb, elements, cnt, i, hue, e;

		// the Perlenspiel logo colors!

		rgb = [ "#795189", "#7A90B5", "#A8C844", "#D38132", "#E8ED4D" ];
		elements = document.getElementsByClassName( 'dot' );
		cnt = Math.floor( Math.random() * rgb.length );
		for ( i = 0; i < elements.length; i += 1 )
		{
			if ( cnt >= rgb.length )
			{
				cnt = 0;
			}
			hue = rgb[cnt];
			cnt += 1;
			e = elements[i];
			e.style.backgroundColor = hue;
		}
	}
};

