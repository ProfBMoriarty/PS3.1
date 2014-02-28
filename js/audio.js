// audio.js
// The following comments are for JSLint

/*jslint nomen: true, white: true, vars: true */
/*global document, window, screen, console, Image, AQ */

PS = ( function ( ps )
{
	"use strict";

	var _sys = ps._sys = ps._sys || {}; // establish _sys

	// Names of instrument files

	var _PIANO_FILES = [
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

	var _HCHORD_FILES = [
		"a2", "bb2", "b2",
		"c3", "db3", "d3", "eb3", "e3", "f3", "gb3", "g3", "ab3", "a3", "bb3", "b3",
		"c4", "db4", "d4", "eb4", "e4", "f4", "gb4", "g4", "ab4", "a4", "bb4", "b4",
		"c5", "db5", "d5", "eb5", "e5", "f5", "gb5", "g5", "ab5", "a5", "bb5", "b5",
		"c6", "db6", "d6", "eb6", "e6", "f6", "gb6", "g6", "ab6", "a6", "bb6", "b6",
		"c7", "db7", "d7", "eb7", "e7", "f7"
	];

	var _XYLO_FILES = [
		"a4", "bb4", "b4",
		"c5", "db5", "d5", "eb5", "e5", "f5", "gb5", "g5", "ab5", "a5", "bb5", "b5",
		"c6", "db6", "d6", "eb6", "e6", "f6", "gb6", "g6", "ab6", "a6", "bb6", "b6",
		"c7", "db7", "d7", "eb7", "e7", "f7", "gb7", "g7", "ab7", "a7", "bb7", "b7"
	];

	_sys.audio = {
		
	};

	// PUBLIC API

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

	ps.audioLoad = function ( filename, params )
	{
		var fn, result;

		fn = "[PS.audioLoad] ";

		if ( arguments.length < 1 )
		{
			return _sys.error( fn + "Missing argument(s)" );
		}
		if ( arguments.length > 2 )
		{
			return _sys.error( fn + "Too many arguments" );
		}

		result = AQ.load( filename, params );
		if ( result === AQ.ERROR )
		{
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

	ps.audioPlay = function ( filename_p, params_p )
	{
		var fn, args, filename, params, type, result;

		fn = "[PS.audioPlay] ";

		args = arguments.length;
		if ( args < 1 )
		{
			return _sys.error( fn + "Missing argument(s)" );
		}
		if ( args > 2 )
		{
			return _sys.error( fn + "Too many arguments" );
		}

		// Prevent arg mutation

		filename = filename_p;
		params = params_p;

		type = _sys.typeOf( params );
		if ( type === "undefined" )
		{
			params = {};
		}
		else if ( type !== "object" )
		{
			return _sys.error( fn + "params argument invalid" );
		}

		params.autoplay = true; // force immediate playback

		result = AQ.load( filename, params );
		if ( result === AQ.ERROR )
		{
			return PS.ERROR;
		}
		return result.channel;
	};

	// PS.audioPause()
	// Toggles pause on an audio channel
	// [channel] is a channel id
	// Returns channel id on success, PS.ERROR on error

	ps.audioPause = function ( channel_id )
	{
		var fn, args, result;

		fn = "[PS.audioPause] ";

		args = arguments.length;
		if ( args < 1 )
		{
			return _sys.error( fn + "Missing argument(s)" );
		}
		if ( args > 1 )
		{
			return _sys.error( fn + "Too many arguments" );
		}

		result = AQ.pause( channel_id );
		if ( result === AQ.ERROR )
		{
			return PS.ERROR;
		}
		return result;
	};

	// PS.audioStop()
	// Stops a playing audio channel
	// [channel] is a channel id
	// Returns channel id on success, PS.ERROR on error

	ps.audioStop = function ( channel_id )
	{
		var fn, args, result;

		fn = "[PS.audioStop] ";

		args = arguments.length;
		if ( args < 1 )
		{
			return _sys.error( fn + "Missing argument(s)" );
		}
		if ( args > 1 )
		{
			return _sys.error( fn + "Too many arguments" );
		}

		result = AQ.stop( channel_id );
		if ( result === AQ.ERROR )
		{
			return PS.ERROR;
		}
		if ( result === AQ.DONE )
		{
			return PS.DONE;
		}
		return result;
	};

	// PS.piano ( val, flag )
	// Returns filename of indexed piano note
	// [val] is index
	// Optional [flag] specifies long version

	ps.piano = function ( val_p, flag_p )
	{
		var fn, len, type, val, flag, str;

		fn = "[PS.piano] ";
		len = _PIANO_FILES.length;

		val = val_p; // avoid arg mutation;
		type = _sys.typeOf( val );
		if ( type !== "number" )
		{
			return _sys.error( fn + "index argument invalid" );
		}
		val = Math.floor( val );
		if ( val < 1 )
		{
			val = 1;
		}
		else if ( val > len )
		{
			val = len;
		}

		flag = flag_p; // avoid arg mutation
		if ( ( flag !== true ) && ( flag !== false ) )
		{
			type = _sys.typeOf( flag );
			if ( type === "undefined" )
			{
				flag = false;
			}
			else if ( type !== "number" )
			{
				return _sys.error( fn + "flag argument invalid" );
			}
		}

		str = "piano_" + _PIANO_FILES[ val - 1 ];
		if ( flag )
		{
			str = "l_" + str;
		}
		return str;
	};

	// PS.harpsichord ( val, flag )
	// Returns filename of indexed harpsichord note
	// [val] is index
	// Optional [flag] specifies long version

	ps.harpsichord = function ( val_p, flag_p )
	{
		var fn, len, type, val, flag, str;

		fn = "[PS.harpsichord] ";
		len = _HCHORD_FILES.length;

		val = val_p; // avoid arg mutation;
		type = _sys.typeOf( val );
		if ( type !== "number" )
		{
			return _sys.error( fn + "index argument invalid" );
		}
		val = Math.floor( val );
		if ( val < 1 )
		{
			val = 1;
		}
		else if ( val > len )
		{
			val = len;
		}

		flag = flag_p; // avoid arg mutation
		if ( ( flag !== true ) && ( flag !== false ) )
		{
			type = _sys.typeOf( flag );
			if ( type === "undefined" )
			{
				flag = false;
			}
			else if ( type !== "number" )
			{
				return _sys.error( fn + "flag argument invalid" );
			}
		}

		str = "hchord_" + _HCHORD_FILES[ val - 1 ];
		if ( flag )
		{
			str = "l_" + str;
		}
		return str;
	};

	// PS.xylophone ( val )
	// Returns filename of indexed xylophone note
	// [val] is index

	ps.xylophone = function ( val_p )
	{
		var fn, len, type, val, str;

		fn = "[PS.xylophone] ";
		len = _XYLO_FILES.length;

		val = val_p; // avoid arg mutation;
		type = _sys.typeOf( val );
		if ( type !== "number" )
		{
			return _sys.error( fn + "index argument invalid" );
		}
		val = Math.floor( val );
		if ( val < 1 )
		{
			val = 1;
		}
		else if ( val > len )
		{
			val = len;
		}

		str = "xylo_" + _XYLO_FILES[ val - 1 ];
		return str;
	};

	return ps;
} ( PS ) );
