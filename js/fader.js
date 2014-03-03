// fader.js

PS = ( function ( ps )
{
	"use strict";

	var _sys = ps._sys = ps._sys || {}; // establish _sys

	var _FPS = 4; // fader frame rate
	var _queue = []; // list of active faders
	var _tick = 0; // tick counter

	_sys.fader = {

		// CONSTANTS

		DEFAULTS : {
			rate : 0,
			rgb : null,
			onEnd : null,
			params : null
 		},

		// METHODS

		// _sys.fader.init()
		// Initialize fader module

		init : function ()
		{
			_queue = [];
			_tick = 0;
		},

		// _sys.fader.reset()
		// Resets an existing fader object

		reset : function ( fader )
		{
			var def;

			def = _sys.fader.DEFAULTS;

			fader.rate = def.rate;
			fader.rgb = def.rgb;
			fader.onEnd = def.onEnd;
			fader.params = def.params;
			fader.active = false;
			fader.kill = false;
			fader.r = 0;
			fader.g = 0;
			fader.b = 0;
			fader.step = 0;
			fader.frames.length = 0;
		},

		// _sys.fader.new ( e, exec, execEnd )
		// e : object = DOM object to fade
		// exec : function =  function to call with element and r/g/b/a when changing color
		// execEnd : function =  function to call after final color change
		// Returns an initialized fader object

		new : function ( e, exec, execEnd )
		{
			var fader = {
				element : e,
				exec : exec,
				execEnd : execEnd,
				frames : []
			};

			_sys.fader.reset( fader );
			return fader;
		},

		// Calc fader steps
		// [r/g/b] are current colors, [tr/tg/tb] target colors
		// Precalculates all color animation steps
		// Assumes all properties except [step] and [frames] specified

		calc : function ( fader, r, g, b, a, tr, tg, tb, ta )
		{
			var cr, cg, cb, ca, cnt, step, percent, frame, r_delta, g_delta, b_delta, a_delta, any, delta;

			fader.step = 0;
			fader.frames.length = 0;

			if ( ( r === tr ) && ( g === tg ) && ( b === tb ) && ( a === ta ) )
			{
				return;
			}

			cr = r;
			cg = g;
			cb = b;
			ca = a;

			// Calc deltas only once

			if ( r > tr )
			{
				r_delta = -( r - tr );
			}
			else
			{
				r_delta = tr - r;
			}

			if ( g > tg )
			{
				g_delta = -( g - tg );
			}
			else
			{
				g_delta = tg - g;
			}

			if ( b > tb )
			{
				b_delta = -( b - tb );
			}
			else
			{
				b_delta = tb - b;
			}

			if ( a > ta )
			{
				a_delta = -( a - ta );
			}
			else
			{
				a_delta = ta - a;
			}

			// rate is expressed in 60ths of a second

			if ( fader.rate < _sys.fader.FPS )
			{
				cnt = 1;
			}
			else
			{
				cnt = Math.ceil( fader.rate / _sys.fader.FPS );
			}

			step = 100 / cnt;
			percent = 0;
			do
			{
				any = false;
				frame = {};
				percent += step;
				if ( percent >= 100 )
				{
					frame.r = tr;
					frame.g = tg;
					frame.b = tb;
					frame.a = ta;
				}
				else
				{
					// red

					if ( cr !== tr )
					{
						delta = ( percent * r_delta ) / 100;
						cr = r + delta;
						cr = Math.round( cr );
						any = true;
					}
					frame.r = cr;

					// green

					if ( cg !== tg )
					{
						delta = ( percent * g_delta ) / 100;
						cg = g + delta;
						cg = Math.round( cg );
						any = true;
					}
					frame.g = cg;

					// blue

					if ( cb !== tb )
					{
						delta = ( percent * b_delta ) / 100;
						cb = b + delta;
						cb = Math.round( cb );
						any = true;
					}
					frame.b = cb;

					// alpha

					if ( ca !== ta )
					{
						delta = ( percent * a_delta ) / 100;
						ca = a + delta;
						ca = Math.round( ca );
						any = true;
					}
					frame.a = ca;
				}

				frame.rgb = ( frame.r * _sys.RSHIFT ) + ( frame.g * _sys.GSHIFT ) + frame.b;
				frame.str = _sys.RSTR[ frame.r ] + _sys.GBSTR[ frame.g ] + _sys.GBSTR[ frame.b ] + _sys.ASTR[ frame.a ];
				fader.frames.push( frame );

				// stop now if already matched

				if ( !any )
				{
					return;
				}
			}
			while ( percent < 100 );
		},

		// Start a fader
		// Precalculates all color animation steps
		// Assumes all properties except [step] and [frames] specified

		start : function ( fader, r, g, b, a, tr, tg, tb, ta )
		{
			_sys.fader.calc( fader, r, g, b, a, tr, tg, tb, ta );
			if ( fader.frames.length > 0 )
			{
				fader.kill = false;
				fader.active = true;
				_queue.push( fader );
			}
		},

		// Recalculate color animation steps for a fade in progress

		recalc : function ( fader, tr, tg, tb, ta )
		{
			var restart, len, step, frame;

			restart = fader.active; // save active status

			fader.active = false;

			len = fader.frames.length;
			if ( len > 0 )
			{
				step = fader.step;

				// just in case ...

				if ( step >= len )
				{
					step = len - 1; // use last step
				}

				frame = fader.frames[ step ];
				_sys.fader.calc( fader, frame.r, frame.g, frame.b, frame.a, tr, tg, tb, ta ); // may result in no frames!
			}

			// precaution ...

			if ( fader.frames.length > 0 )
			{
				fader.active = restart;
			}
		},

		// _sys.fader.fading()
		// Called once per system tick to implement faders

		fading : function ()
		{
			var len, i, fader, frame, exec, params;

			_tick += 1;
			if ( _tick < _FPS )
			{
				return;
			}

			_tick = 0;
			len = _queue.length;
			i = 0;
			while ( i < len )
			{
				fader = _queue[ i ];
				if ( fader.kill )
				{
					_queue.splice( i, 1 );
					len -= 1;
				}
				else if ( fader.active ) // only active faders
				{
					frame = fader.frames[ fader.step ];
					if ( fader.exec )
					{
						try
						{
							fader.exec( frame, fader.element ); // call frame exec with frame data and fader element
						}
						catch ( e1 )
						{
							_sys.errorCatch( fn + "fader .exec failed [" + e1.message + "]", e1 );
							return;
						}
					}
		    		fader.step += 1;
					if ( fader.step >= fader.frames.length )
					{
						fader.active = false;
						fader.step = 0;
						fader.frames.length = 0;
		    			// Call system execEnd if present
		    			if ( fader.execEnd )
						{
							try
							{
								fader.execEnd( frame, fader.element );
							}
							catch ( e2 )
							{
								_sys.errorCatch( fn + "fader .execEnd failed [" + e2.message + "]", e2 );
								return;
							}
						}

						// Call user onEnd if present

						exec = fader.onEnd;
						if ( exec )
						{
							params = fader.params;
							if ( !params )
							{
								params = [];
							}
							try
							{
								exec.apply( {}, params );
							}
							catch ( e3 )
							{
								_sys.errorCatch( fn + "fader .onEnd failed [" + e3.message + "]", e3 );
								return;
							}
						}

						// remove fader from queue

						_queue.splice( i, 1 );
						len -= 1;
					}
					else
					{
						i += 1;
					}
				}
				else
				{
					i += 1;
				}
			}
		},

		// _sys.fader.validOptions ( fn, options )
		// fn : string = name of calling function (for errors)
		// options : object = object with fader properties
		// Returns validated options or PS.ERROR

		validOptions : function ( fn, options )
		{
			var type, val, red, blue, green, rval, gval;

			type = _sys.typeOf( options );
			if ( ( type === "undefined" ) || ( options === PS.CURRENT ) )
			{
				return {
					rgb : PS.CURRENT,
					r : 0, g : 0, b : 0,
					onEnd : PS.CURRENT,
					params : PS.CURRENT
				};
			}

			if ( options === PS.DEFAULT )
			{
				return {
					rgb : PS.DEFAULT,
					r : 0, g : 0, b : 0,
					onEnd : PS.DEFAULT,
					params : PS.DEFAULT
				};
			}

			if ( type !== "object" )
			{
				return _sys.error( fn + "options argument invalid" );
			}

			// Check .rgb

			val = options.rgb;
			if ( ( val !== PS.CURRENT ) && ( val !== PS.DEFAULT ) )
			{
				type = _sys.typeOf( val );
				if ( ( type === "undefined" ) || ( val === null ) )
				{
					options.rgb = PS.CURRENT;
				}
				else if ( type === "number" )
				{
					val = Math.floor( val );
					if ( val <= PS.COLOR_BLACK )
					{
						val = PS.COLOR_BLACK;
						red = 0;
						green = 0;
						blue = 0;
					}
					else if ( val >= PS.COLOR_WHITE )
					{
						val = PS.COLOR_WHITE;
						red = 255;
						green = 255;
						blue = 255;
					}
					else
					{
						red = val / _sys.RSHIFT;
						red = Math.floor( red );
						rval = red * _sys.RSHIFT;

						green = ( val - rval ) / _sys.GSHIFT;
						green = Math.floor( green );
						gval = green * _sys.GSHIFT;

						blue = val - rval - gval;

					}
					options.rgb = val;
					options.r = red;
					options.g = green;
					options.b = blue;
				}
				else
				{
					return _sys.error( fn + "options.rgb property invalid" );
				}
			}

			// Just append r/g/b properties

			else
			{
				options.r = 0;
				options.g = 0;
				options.b = 0;
			}

			// Check .onEnd

			val = options.onEnd;
			if ( ( val !== PS.CURRENT ) && ( val !== PS.DEFAULT ) )
			{
				type = _sys.typeOf( val );
				if ( ( type === "undefined" ) || ( val === null ) )
				{
					options.onEnd = PS.CURRENT;
				}
				else if ( type !== "function" )
				{
					return _sys.error( fn + "options.onEnd property invalid" );
				}
			}

			// Check .params

			val = options.params;
			if ( ( val !== PS.CURRENT ) && ( val !== PS.DEFAULT ) )
			{
				type = _sys.typeOf( val );
				if ( ( type === "undefined" ) || ( val === null ) )
				{
					options.params = PS.CURRENT;
				}
				else if ( type !== "array" )
				{
					return _sys.error( fn + "options.params property invalid" );
				}
			}

			return options;
		}
	};

	return ps;
} ( PS ) );
