// This must be the first file loaded

var PS;

var PS3ENGINE = ( function ()
{
	// All global constants, variable and functions
	// are stored in the _sys object, which is accessible
	// to every module

	var ps3 = {
		_sys : {

			// GLOBAL CONSTANTS

			// Misc constants

			MAX_WIDTH : 32, // Maximum grid width
			MAX_HEIGHT : 32, // Maximum grid height
			MAX_BEADS : 1024, // 32 x 32 maximum bead count
			ALPHOID : 0.00392, // alpha step constant, 1.0 / 255
			RSHIFT : 65536, // red shift, 256 * 256
			GSHIFT : 256, // green shift
			EMPTY : {}, // a generic empty object
			DEFAULT_KEY_DELAY : 6, // key repeat rate (1/10 sec)
			KEY_SHIFT : 16, // shift keycode
			KEY_CTRL : 17, // ctrl keycode
			CLEAR : -1, // flag for not touching or not over a bead
			FADER_FPS : 4, // do fader queue every 1/15 of a second
			DIAGONAL_COST : 1.4142, // square root of 2; for pathfinder
			LABEL_MAX : 16, // maximum input label length

			// GLOBAL VARIABLES

			// _sys.system
			// Stores system gestalt info
			// Initialized by _sys.init()

			system : {
				engine : "Perlenspiel",
				major : 3,
				minor : 2,
				revision : 0,
				audio : null,
				host : {
					app : "",
					version : "",
					os : ""
				},
				inputs : {
					touch : false
				}
			},

			// RGBA color assembly substrings
			// Initialized by _sys.init()

			RSTR : "",
			GBSTR : "",
			BASTR : "",
			ASTR : "",

			// GLOBAL UTILITY FUNCTIONS

			// _sys.typeOf ( val )
			// Improved typeof by Doug Crockford detects arrays
			// Additional NaN detection by Moriarty

			typeOf : function ( val )
			{
				var type;

				type = typeof val;
				if ( type === "number" )
				{
					if ( isNaN( val ) )
					{
						type = "NaN";
					}
				}
				else if ( type === "object" )
				{
					if ( val )
					{
						if ( val instanceof Array )
						{
							type = "array";
						}
					}
					else
					{
						type = "null";
					}
				}

				return type;
			},

			// _sys.copy ( src, dest )
			// Recursively copy all properties of [src] object into [dest] object

			copy : function ( src, dest )
			{
				var prop, item, obj;

				if ( ( ps3._sys.typeOf( src ) === "object" ) && ( ps3._sys.typeOf( dest ) === "object" ) )
				{
					for ( prop in src )
					{
						if ( src.hasOwnProperty( prop ) )
						{
							item = src[ prop ];

							// Check type of item
							// If property is an object, recurse

							if ( ps3._sys.typeOf( item ) === "object" )
							{
								obj = {};
								ps3._sys.copy( item, obj );
								item = obj;
							}
							dest[ prop ] = item;
						}
					}
				}
			}
		}
	};

	return ps3;
} );


