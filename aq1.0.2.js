// aq1.0.2.js
// Remember to change version constants below!

// The following comments are for JSLint

/*jslint nomen: true, white: true, vars: true */
/*global document, window, console, webkitAudioContext, AudioContext, XMLHttpRequest */

// AQ Audio Engine

// Generic HTML5 audio exception handler

var AQ; // Global namespace for public API

( function ()
{
	"use strict";

	var _VERSION_NAME = "AQ";
	var _VERSION_MAJOR = 1;
	var _VERSION_MINOR = 0;
	var _VERSION_REVISION = 2;

	var _MONITOR = false; // true to display status messages

	var _MAX_VOLUME = 1.0;
	var _MAX_CHANNELS = 32;

	var _DEFAULT = {
		path : "",
		filetypes : [ "ogg", "mp3", "wav" ],
		autoplay : false,
		volume : 0.5,
		start : 0,
		end : -1,
		loop : false,
		lock : false,
		onLoad : null,
		onPlay : null,
		onEnd : null,
		data : 0
	};

	var _PREFIX_BUFFER = "bf_";
	var _PREFIX_CHANNEL = "ch_";

	// Channel modes

	var _CHANNEL_EMPTY = "EMPTY";
	var _CHANNEL_LOADING = "LOADING";
	var _CHANNEL_READY = "READY";
	var _CHANNEL_PLAYING = "PLAYING";
	var _CHANNEL_PAUSED = "PAUSED";

	// Web Audio buffer states

	var _WEBAUDIO_UNSCHEDULED_STATE = 0;
	var _WEBAUDIO_SCHEDULED_STATE = 1;
	var _WEBAUDIO_PLAYING_STATE = 2;
	var _WEBAUDIO_FINISHED_STATE = 3;

	// These shared globals are set up by init()

	var _enabled = false; // true if engine enabled
	var _defaultPath = ""; // default audio path (case sensitive)
	var _onAlert = null; // user function to call for alerts
	var _stack = false; // true for stack trace
	var _usingWebAudio = false; // true if using Web Audio API
	var _forceHTML5 = false; // true to force HTML5 audio
	var _defaultFileTypes = null; // default list of audio file types available

	// list of audio codecs and types

	var _codecs = {
		ogg : { ok : false, type : 'audio/ogg; codecs="vorbis"' },
		mp3 : { ok : false, type : 'audio/mpeg;' },
		wav : { ok : false, type : 'audio/wav; codecs="1"' },
		aac : { ok : false, type : 'audio/mp4; codecs="mp4a.40.2"' },
		webm : { ok : false, type : 'audio/webm; codecs="vorbis"' },
		opus : { ok : false, type : 'audio/ogg; codecs="opus"' }
	};

	var _channels = []; // active channel list
	var _channelCnt = 0; // channels in use
	var _channelID = 0; // unique channel id

	var _buffers = []; // active buffer list
	var _bufferID = 0; // unique buffer id

	// Web Audio API globals

	var _context = null; // AudioContext

	// executive functions

	var _loadExec = null;
	var _playExec = null;
	var _playChannelExec = null;
	var _pauseExec = null;
	var _stopExec = null;

	// PRIVATE FUNCTIONS

	// Improved typeof by Doug Crockford, with NaN detection by me

	function _typeOf ( value )
	{
		var type;

		type = typeof value;
		if ( type === "number" )
		{
			if ( isNaN( value ) )
			{
				type = "NaN";
			}
		}
		else if ( type === "object" )
		{
			if ( value )
			{
				if ( value instanceof Array )
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
	}

	// _endEvent( event )
	// Properly terminates a DOM event

	function _endEvent ( event )
	{
		if ( event.stopPropagation )
		{
			event.stopPropagation();
		}
		else
		{
			event.cancelBubble = true;
		}

		event.returnValue = false;
		return false;
	}

	// Report a debug string through user's onAlert function if available
	// No debug report if onAlert is not specified
	// If onAlert is specified but fails, message is reported with a window alert

	function _debug ( str )
	{
		var func;

		func = _onAlert;
		if ( func && ( typeof func === "function" ) ) // double-check
		{
			try
			{
				func( str + "\n" ); // converts str to string if necessary
			}
			catch ( err ) // fallback to alert
			{
				window.alert( "AQ DEBUG: " + str + " [" + err.message + "]\n" );
			}
		}
	}

	// Report an error string through user's onAlert function if available
	// No error report if onAlert is not specified
	// If onAlert is specified but fails, error is reported with a window alert
	// Returns AQ.ERROR

	// Improved error reporter with stack trace
	// Based on code by Mark Diehr

	function _decodeStackLine ( str )
	{
		var text, index, name;

		text = "";

		if ( str.search( ".js" ) !== -1 )	// Code lines
		{
			index = str.lastIndexOf( "/" ) + 1;
			name = str.substr( index ).replace( /^[\s\(\)]+|[\s\(\)]+$/g, '' );

			// Remove the column from the line

			if ( name.split( ":" ).length === 3 )
			{
				name = name.substr( 0, name.lastIndexOf( ":" ) );
			}
			if ( name !== "" )
			{
				text += ( "    " + name + "\n" );
			}
		}

		return text;
	}

	function _decodeCallStack ( str )
	{
		var lines, i, text, len;

		if ( console && console.log )
		{
			console.log( str );
		}

		if ( !str.split )
		{
			return str;
		}

		lines = str.split( '\n' );
		text = "";

		len = lines.length;
		for ( i = 0; i < len; i += 1 )
		{
			text += _decodeStackLine( lines[i] );
		}

		return text;
	}

	function _errorCatch ( str, err )
	{
		var exec;

		if ( ( typeof str !== "string" ) || ( str.length < 1 ) )
		{
			str = "???";
		}
		str = "AQ ERROR: " + str + "\n";
		if ( _stack && err )
		{
			str += ( _decodeCallStack( err.stack ) + "\n" );
		}

		exec = _onAlert;
		if ( exec && ( typeof exec === "function" ) ) // double-check
		{
			try
			{
				exec( str );
			}
			catch ( e1 ) // fallback to alert
			{
				window.alert( str + " [" + err.message + "]\n" );
			}
		}

		return AQ.ERROR;
	}

	function _error ( str )
	{
		// Throw an error so we can grab the callstack

		try
		{
			throw( new Error( "AQ ERROR" ) );
		}
		catch ( err )
		{
			return _errorCatch( str, err );
		}
	}

	// _checkFileTypes( fn, ft )
	// Checks a fileType array
	// [fn] is name of calling function
	// [ft] is a fileTypes array (or null)
	// Returns a verified array, null if no array, or AQ.ERROR

	function _checkFileTypes ( fn, ft )
	{
		var type, len, i, playable, str, codec;

		type = _typeOf( ft );
		if ( ( type === "undefined" ) || ( ft === null ) || ( ft === AQ.DEFAULT ) )
		{
			return _DEFAULT.filetypes;
		}

		if ( type !== "array" )
		{
			return _error( fn + ".fileTypes not an array" );
		}

		len = ft.length;
		if ( len < 1 )
		{
			return _error( fn + ".fileTypes array empty" );
		}

		// Create a list of playable types

		playable = []; // start new list
		for ( i = 0; i < len; i += 1 )
		{
			str = ft [ i ];
			if ( !str || ( typeof str !== "string" ) || ( str.length < 1 ) )
			{
				return _error( fn + "Invalid .fileType entry @ " + i );
			}
			str = str.toLowerCase();

			// Is this file type playable?

			codec = _codecs [ str ];
			if ( codec && codec.ok ) // this codec available?
			{
				if ( playable.indexOf( str ) < 0 ) // not found already?
				{
					playable.push( str );
				}
			}
		}

		if ( playable.length < 1 )
		{
			return _error( fn + "No playable audio types listed" );
		}

		return playable;
	}

	// _checkParams( fn, current, changes )
	// Verifies parameters in [changes] and copies them to [current]
	// Returns AQ.DONE on success, else AQ.ERROR

	function _checkParams ( fn, current, changes )
	{
		var type, val;

		type = _typeOf( changes );
		if ( !changes || ( type === "undefined" ) )
		{
			return AQ.DONE;
		}

		if ( type !== "object" )
		{
			return _error( fn + "params not an object" );
		}

		// check .path property

		val = changes.path;
		type = _typeOf( val );
		if ( type !== "undefined" )
		{
			if ( val === AQ.DEFAULT )
			{
				val = _DEFAULT.path;
			}
			else if ( ( type !== "string" ) || ( val.length < 1 ) )
			{
				return _error( fn + ".path property not a valid string" );
			}
			current.path = val;
		}

		// check .fileTypes property if present

		val = _checkFileTypes( fn, changes.fileTypes );
		if ( val === AQ.ERROR )
		{
			return AQ.ERROR;
		}
		if ( val )
		{
			current.fileTypes = val;
		}

		// check .autoplay property

		val = changes.autoplay;
		type = _typeOf( val );
		if ( type !== "undefined" )
		{
			if ( ( val !== true ) && ( val !== false ) )
			{
				if ( val === AQ.DEFAULT )
				{
					val = _DEFAULT.autoplay;
				}
				else if ( val === null )
				{
					val = false;
				}
				else if ( type === "number" )
				{
					val = ( val !== 0 );
				}
				else
				{
					return _error( fn + ".autoplay property invalid" );
				}
			}
			current.autoplay = val;
		}

		// check .lock property

		val = changes.lock;
		type = _typeOf( val );
		if ( type !== "undefined" )
		{
			if ( ( val !== true ) && ( val !== false ) )
			{
				if ( val === AQ.DEFAULT )
				{
					val = _DEFAULT.lock;
				}
				else if ( val === null )
				{
					val = false;
				}
				else if ( type === "number" )
				{
					val = ( val !== 0 );
				}
				else
				{
					return _error( fn + ".lock property invalid" );
				}
			}
			current.lock = val;
		}

		// check .volume property

		val = changes.volume;
		type = _typeOf( val );
		if ( type !== "undefined" )
		{
			if ( val === AQ.DEFAULT )
			{
				val = _DEFAULT.volume;
			}
			else
			{
				if ( type !== "number" )
				{
					return _error( fn + ".volume property not a number" );
				}
				if ( val > _MAX_VOLUME )
				{
					val = _MAX_VOLUME;
				}
				else if ( val < 0 )
				{
					val = 0;
				}
			}
			current.volume = val;
		}

		// check .loop property

		val = changes.loop;
		type = _typeOf( val );
		if ( type !== "undefined" )
		{
			if ( ( val !== true ) && ( val !== false ) )
			{
				if ( val === AQ.DEFAULT )
				{
					val = _DEFAULT.loop;
				}
				else if ( val === null )
				{
					val = false;
				}
				else if ( type === "number" )
				{
					val = ( val !== 0 );
				}
				else
				{
					return _error( fn + ".loop property invalid" );
				}
			}
			current.loop = val;
		}

		// check .start property

		val = changes.start;
		type = _typeOf( val );
		if ( type !== "undefined" )
		{
			if ( val === AQ.DEFAULT )
			{
				val = _DEFAULT.start;
			}
			else
			{
				if ( type !== "number" )
				{
					return _error( fn + ".start property not a number" );
				}
				val = Math.floor( val );
				if ( val < 0 )
				{
					val = 0;
				}
			}
			current.start = val;
		}

		// check .end property

		val = changes.end;
		type = _typeOf( val );
		if ( type !== "undefined" )
		{
			if ( val === AQ.DEFAULT )
			{
				val = _DEFAULT.end;
			}
			else
			{
				if ( type !== "number" )
				{
					return _error( fn + ".end property not a number" );
				}
				val = Math.floor( val );
				if ( val < 0 )
				{
					val = 0;
				}
			}
			current.end = val;
		}

		// check .onLoad property

		val = changes.onLoad;
		type = _typeOf( val );
		if ( type !== "undefined" )
		{
			if ( val === AQ.DEFAULT )
			{
				val = _DEFAULT.onLoad;
			}
			else if ( type !== "function" )
			{
				return _error( fn + ".onLoad property not a function" );
			}
			current.onLoad = val;
		}

		// check .onPlay property

		val = changes.onPlay;
		type = _typeOf( val );
		if ( type !== "undefined" )
		{
			if ( val === AQ.DEFAULT )
			{
				val = _DEFAULT.onPlay;
			}
			else if ( type !== "function" )
			{
				return _error( fn + ".onPlay property not a function" );
			}
			current.onPlay = val;
		}

		// check .onEnd property

		val = changes.onEnd;
		type = _typeOf( val );
		if ( type !== "undefined" )
		{
			if ( val === AQ.DEFAULT )
			{
				val = _DEFAULT.onEnd;
			}
			else if ( type !== "function" )
			{
				return _error( fn + ".onEnd property not a function" );
			}
			current.onEnd = val;
		}

		// check .data property

		val = changes.data;
		type = _typeOf( val );
		if ( type !== "undefined" )
		{
			if ( val === AQ.DEFAULT )
			{
				val = _DEFAULT.data;
			}
			current.data = val;
		}

		return AQ.DONE;
	}

	// -----------------
	// Web Audio Support
	// -----------------

	function _webStopChannel ( channel )
	{
		var fn, source, type;

		fn = "[_webStopChannel] ";

		if ( _MONITOR )
		{
			_debug ( fn + channel.id );
		}

		source = channel.source;
		if ( source && ( source.playbackState !== _WEBAUDIO_FINISHED_STATE ) ) // if not finished, pause it
		{
			if ( channel.thandle )
			{
				window.clearTimeout( channel.thandle );
//				channel.thandle = null;
			}
			type = _typeOf ( source.stop );
			if ( type !== "undefined" )
			{
				source.stop( 0 ); // this is the standard
			}
			else
			{
				source.noteOff( 0 ); // deprecated!
			}

			channel.status = _CHANNEL_READY;
		}
	}

	// Generate a channel id

	function _webAssignChannel ()
	{
		var id;

		_channelID += 1;
		id = _PREFIX_CHANNEL + _channelID;
		return id;
	}

	// _webPlayBuffer()
	// Play file in [buffer] with optional [offset]
	// Returns channel id

	function _webPlayBuffer ( buffer, offset )
	{
		var fn, ctx, source, gainNode, duration, timeout, id, channel, type, params, exec;

		fn = "[_webPlayBuffer] ";

		ctx = _context;

		source = ctx.createBufferSource();
		if ( !source )
		{
			return _error( fn + "Invalid bufferSource" );
		}
		source.buffer = buffer.audio;

		if ( ctx.createGain !== undefined )
		{
			gainNode = ctx.createGain();
		}
		else
		{
			gainNode = ctx.createGainNode();
		}

		if ( !gainNode )
		{
			return _error( fn + "Invalid gainNode" );
		}

		source.connect( gainNode );
		gainNode.connect( ctx.destination );
		gainNode.gain.value = buffer.params.volume;

		if ( offset === undefined )
		{
			offset = 0;
		}

		// calc timeout

		duration = buffer.audio.duration - offset;
		timeout = Math.floor( duration * 1000 );

		// get a unique channel id if none assigned

		if ( !buffer.channel_id )
		{
			buffer.channel_id = _webAssignChannel();
		}
		id = buffer.channel_id;

		channel = {
			id : id,
			buffer : buffer,
			source : source,
			gainNode : gainNode,
			startTime : ctx.currentTime - offset, // fixes multiple pauses
			pauseTime : 0, // non-zero if paused
			endTime : -1, // -1 if no end time specified
			status : _CHANNEL_PLAYING
		};

		// Establish timeout for .onDone handling
		// Save handle for pause
		// Make it a closure for channel identification

		channel.thandle = window.setTimeout( function ()
		{
			var len, i, buffer;

			// find the channel

			len = _channels.length;
			for ( i = 0; i < len; i += 1 )
			{
				channel = _channels[ i ];
				if ( channel.id === id ) // id obtained from the closure
				{
					if ( _MONITOR )
					{
						_debug( fn + "Ending " + id + ": " + params.pathname );
					}

					// call user onEnd function if valid

					buffer = channel.buffer;
					params = buffer.params;
					exec = params.onEnd;
					if ( exec && ( typeof exec === "function" ) )
					{
						if ( _MONITOR )
						{
							_debug( fn + "Calling user .onEnd on " + id + ": " + params.pathname );
						}
						try
						{
							exec( {
								channel : buffer.channel_id,
								name : params.name,
								path : params.pathname,
								duration : buffer.duration,
								data : params.data
							} );
						}
						catch ( err )
						{
							_errorCatch( fn + "User .onEnd failed on " + id + ": " +
								params.pathname + " [" + err.message + "]", err );
						}
					}

					_webStopChannel( channel );
					_channels.splice( i, 1 );

					// restart if looping

					if ( params.loop )
					{
						_webPlayBuffer( buffer, 0 ); // fix offset later
					}
					return;
				}
			}

			_error( fn + "Channel " + id + " not found" );

		}, timeout );

		// save the channel

		_channels.push( channel );

		// begin playback

		type = _typeOf( source.start );
		if ( type !== "undefined" )
		{
			source.start( 0, offset, duration );
		}
		else
		{
			source.noteGrainOn( 0, offset, duration ); // this call is deprecated!
		}

		// Handle onPlay function if present

		params = buffer.params;
		exec = params.onPlay;
		if ( exec && ( typeof exec === "function" ) )
		{
			if ( _MONITOR )
			{
				_debug( fn + "Calling user .onPlay for " + buffer.channel_id + ": " + params.pathname );
			}
			try
			{
				exec( {
					channel : buffer.channel_id,
					name : params.name,
					path : params.pathname,
					duration : buffer.duration,
					data : params.data
				} );
			}
			catch ( err )
			{
				_errorCatch( fn + "User .onPlay failed on " + buffer.channel_id + ": " +
					params.pathname + " [" + err.message + "]", err );
			}
		}

		return id;
	}

	// Load file per [params]
	// Return assigned channel id

	function _webLoad ( params )
	{
		var fn, len, i, buffer, id, request;

		fn = "[_webLoad] ";

		// see if this file is already loaded

		len = _buffers.length;
		for ( i = 0; i < len; i += 1 )
		{
			buffer = _buffers[ i ];
			if ( buffer.params.pathname === params.pathname ) // already loaded
			{
				if ( _MONITOR )
				{
					_debug( fn + params.pathname + " found in " + buffer.id );
				}
				return buffer.channel_id;
			}
		}

		// set up a new buffer record

		_bufferID += 1; // unique id
		id = _PREFIX_BUFFER + _bufferID;

		buffer = {
			id : id,
			channel_id : _webAssignChannel(), // pre-assign the channel id
			audio : null, // will get this when loaded
			duration : 0, // this too
			params : params
		};

//		_buffers.push( buffer ); // save buffer object now?

		if ( _MONITOR )
		{
			_debug( fn + "Creating " + buffer.id + " for " + params.pathname );
		}

		request = new XMLHttpRequest();
		if ( !request )
		{
			return _error( fn + "XMLHttpRequest error" );
		}
		request.open( 'GET', params.pathname, true );
		request.responseType = "arraybuffer";
		request.onload = function ()
		{
			if ( _MONITOR )
			{
				_debug( fn + "Loaded " + params.pathname + " into " + buffer.id );
			}
			_context.decodeAudioData( request.response,
				function ( audio ) // on successful load
				{
					var exec;

					buffer.audio = audio; // save decoded audio in buffer
					buffer.duration = Math.floor( audio.duration * 1000 ); // convert to milliseconds
					_buffers.push( buffer ); // save buffer object

					if ( _MONITOR )
					{
						_debug( fn + "Decoded " + params.pathname + " in " + buffer.id +
							" (" + buffer.duration + " ms)" );
					}

					// Call .onLoad function if present

					exec = params.onLoad;
					if ( exec && ( typeof exec === "function" ) )
					{
						params.onLoad = null; // make sure it doesn't get called again!
						if ( _MONITOR )
						{
							_debug( fn + "Calling user .onLoad for " + buffer.channel_id + ": " + params.pathname );
						}
						try
						{
							exec( {
								channel: buffer.channel_id,
								name : params.name,
								path : params.pathname,
								duration: buffer.duration,
								data : params.data
							} );
						}
						catch ( err )
						{
							_errorCatch( fn + "User .onLoad failed on " + buffer.channel_id + ": " +
								params.pathname + " [" + err.message + "]", err );
						}
					}

					// Play immediately?

					if ( buffer.params.autoplay )
					{
						if ( _MONITOR )
						{
							_debug( fn + "Autoplaying " + buffer.id + " :" + params.pathname );
						}
						_webPlayBuffer( buffer );
					}

				},

				function () // on error
				{
					_error( fn + "Error loading " + params.pathname );
				} );
		};

		try
		{
			request.send();
		}
		catch ( err2 )
		{
			return _errorCatch( fn + "XMLHttpRequest failed: " + params.pathname + " [" + err2.message + "]", err2 );
		}

		return buffer.channel_id;
	}

	// _webPlay ( params )
	// Returns same id if paused, NEW id if restarted, else silent AQ.ERROR

	function _webPlay ( params )
	{
		var fn, len, i, buffer;

		fn = "[_webPlay] ";

		len = _buffers.length;
		for ( i = 0; i < len; i += 1 )
		{
			buffer = _buffers[ i ];
			if ( buffer.params.pathname === params.pathname ) // found it!
			{
				if ( _MONITOR )
				{
					_debug( fn + "Found " + params.pathname );
				}
				return _webPlayBuffer( buffer );
			}
		}

		if ( _MONITOR )
		{
			_debug( fn + params.pathname + " unavailable; loading" );
		}

		params.autoplay = true;
		return _webLoad( params );
	}

	// _webPlayChannel ( id )
	// Returns same id if paused, NEW id if restarted, else silent AQ.ERROR

	function _webPlayChannel ( id )
	{
		var fn, len, i, buffer;

		fn = "[_webPlayChannel] ";

		len = _buffers.length;
		for ( i = 0; i < len; i += 1 )
		{
			buffer = _buffers[ i ];
			if ( buffer.channel_id === id ) // found it!
			{
				return _webPlayBuffer( buffer );
			}
		}

		return _error( fn + id + " not found" );
	}

	// _webPause
	// [id] is a channel id
	// Returns same id if paused, NEW id if restarted, else silent AQ.ERROR

	function _webPause ( id )
	{
		var fn, len, i, channel, buffer, source, ptime, type;

		fn = "[_webPause] ";

		len = _channels.length;
		for ( i = 0; i < len; i += 1 )
		{
			channel = _channels[i];
			if ( channel.id === id )
			{
				buffer = channel.buffer;
				source = channel.source;
				ptime = channel.pauseTime;
				if ( ( ptime > 0 ) && ( channel.status === _CHANNEL_PAUSED ) ) // if paused, restart
				{
					_channels.splice( i, 1 ); // remove this channel
					return _webPlayBuffer( buffer, ptime ); // restart on new channel
				}

				// if channel not finished, stop it

				// stop the ending function from being called!

				if ( channel.thandle )
				{
					window.clearTimeout( channel.thandle );
					channel.thandle = null;
				}

				if ( source && ( source.playbackState !== _WEBAUDIO_FINISHED_STATE ) )
				{
					ptime = _context.currentTime - channel.startTime;
					ptime = ptime % buffer.audio.duration; // prevents overflow?
					channel.pauseTime = ptime; // save pause time
					channel.status = _CHANNEL_PAUSED;

					type = _typeOf ( source.stop );
					if ( type !== "undefined" )
					{
						source.stop( 0 ); // this is the standard
					}
					else
					{
						source.noteOff( 0 ); // deprecated!
					}
				}
				else
				{
					_channels.splice( i, 1 ); // channel is finished, so delete it
				}
				return id;
			}
		}

		if ( _MONITOR )
		{
			_debug( fn + id + " not found" );
		}

		return AQ.ERROR; // fail silently
	}

	function _webStop ( id )
	{
		var fn, len, i, channel;

		fn = "[_webStop] ";

		len = _channels.length;
		for ( i = 0; i < len; i += 1 )
		{
			channel = _channels[ i ];
			if ( channel.id === id )
			{
				_webStopChannel( channel );
				_channels.splice( i, 1 ); // delete this channel
				return AQ.DONE;
			}
		}

		if ( _MONITOR )
		{
			_debug( fn + id + " not found" );
		}

		return AQ.ERROR; // fail silently
	}

	function _webInit ()
	{
		// set up executives

		_loadExec = _webLoad;
		_playExec = _webPlay;
		_playChannelExec = _webPlayChannel;
		_pauseExec = _webPause;
		_stopExec = _webStop;

		return AQ.WEB_AUDIO;
	}

	// --------------------
	// HTML5 Audio handlers
	// --------------------

	// HTML5 Audio onError handler

	function _htmlOnError ( event )
	{
		var fn, e, i, channel, c, str;

		fn = "[_htmlOnError] ";

		e = event.currentTarget;
		i = e.getAttribute( "data-channel" );
		i = parseInt( i, 10 );
		channel = _channels[ i ];

		c = event.target.error.code;
		switch ( c )
		{
			case 1:
				str = "Playback aborted"; // "MEDIA_ERR_ABORTED";
				break;
			case 2:
				str = "Network failure"; // "MEDIA_ERR_NETWORK";
				break;
			case 3:
				str = "Source decode failed"; // "MEDIA_ERR_DECODE";
				break;
			case 4:
				str = "Invalid source file"; // "MEDIA_ERR_SRC_NOT_SUPPORTED";
				break;
			default:
				str = "Unknown"; // "UNKNOWN"
				break;
		}

		_error( fn + str + " @ " + channel.id + ": " + channel.params.pathname );
		return _endEvent( event );
	}

	// HTML5 Audio onStalled event handler
	// Called by browser if file stalls during loading

	function _htmlOnStalled ( event )
	{
		var fn, e, i, channel;

		fn = "[_htmlOnStalled] ";

		// Android always seems to stall ...

		if ( _MONITOR )
		{
			// Retrieve associated channel index

			e = event.currentTarget;
			i = e.getAttribute( "data-channel" );
			i = parseInt( i, 10 );
			channel = _channels[ i ];
			_debug( fn + channel.id + ": " + channel.params.pathname );
		}
		return _endEvent( event );
	}

	// _htmlStartChannel()
	// Starts [channel] using optional [params]

	function _htmlStartChannel ( channel, params )
	{
		var fn, audio, val, type;

		fn = "[_htmlStartChannel] ";

		if ( _MONITOR )
		{
			_debug( fn + "Playing " + channel.id );
		}

		channel.status = _CHANNEL_PLAYING;
		audio = channel.audio;

		type = _typeOf ( params );
		if ( type === "object" )
		{
			val = params.volume;
			type = _typeOf ( val );
			if ( type !== "undefined" )
			{
				channel.params.volume = val;
				audio.volume = val;
			}

			val = params.loop;
			type = _typeOf ( val );
			if ( type !== "undefined" )
			{
				channel.params.loop = val;
				audio.loop = val; // must do this manually?
			}

			val = params.onDone;
			type = _typeOf ( val );
			if ( type !== "undefined" )
			{
				channel.params.onDone = val;
			}

			val = params.userData;
			type = _typeOf ( val );
			if ( type !== "undefined" )
			{
				channel.params.userData = val;
			}

			val = params.lock;
			type = _typeOf ( val );
			if ( type !== "undefined" )
			{
				channel.params.lock = val;
			}
		}

		audio.play();
	}

	// HTML5 Audio onLoad handler

	function _htmlOnLoad ( event )
	{
		var fn, e, i, channel, params, exec;

		fn = "[_htmlOnLoad] ";

		e = event.currentTarget;
		i = e.getAttribute( "data-channel" );
		i = parseInt( i, 10 );
		channel = _channels[ i ];
		channel.status = _CHANNEL_READY;
		params = channel.params;

		if ( _MONITOR )
		{
			_debug( fn + channel.id + ": " + params.pathname );
		}

		// NOTE: Safari doesn't use canplaythrough event!

		channel.audio.removeEventListener( "canplaythrough", _htmlOnLoad, false ); // must be removed after initial load!

		// Call .onLoad function if present

		exec = params.onLoad;
		if ( exec && ( typeof exec === "function" ) )
		{
			params.onLoad = null; // make sure it doesn't get called again!
			if ( _MONITOR )
			{
				_debug( fn + "Calling user .onLoad on " + channel.id + ": " + params.pathname );
			}
			try
			{
				exec( {
					channel : channel.id,
					name : params.name,
					path : params.pathname,
					duration: channel.duration,
					data : params.data
				} );
			}
			catch ( err )
			{
				_errorCatch( fn + "User .onLoad failed on " + channel.id + ": " + params.pathname + " [" + err.message + "]", err );
				return _endEvent( event );
			}
		}

		// if set to autoplay after load, do it

		if ( params.autoplay )
		{
			if ( _MONITOR )
			{
				_debug( fn + "Autoplaying " + channel.id );
			}

			params.autoplay = false; // only autoplay once!
			_htmlStartChannel( channel, params );
		}

		return _endEvent( event );
	}

	// HTML5 Audio play handler

	function _htmlOnPlay ( event )
	{
		var fn, e, i, channel, params, exec;

		fn = "[_htmlOnPlay] ";

		e = event.currentTarget;
		i = e.getAttribute( "data-channel" );
		i = parseInt( i, 10 );
		channel = _channels[ i ];
		params = channel.params;

		if ( _MONITOR )
		{
			_debug( fn + channel.id + ": " + params.pathname + " (" +
				channel.duration + "ms)"  );
		}

//		channel.audio.removeEventListener( "play", _htmlOnPlay, false ); // must be removed?

		// if channel has an onDone function, call it

		exec = params.onPlay;
		if ( exec && ( typeof exec === "function" ) ) // one more check
		{
			if ( _MONITOR )
			{
				_debug( fn + "Calling user .onPlay on " + channel.id + ": " + params.pathname );
			}
			try
			{
				exec( {
					channel : channel.id,
					name : params.name,
					path : params.pathname,
					duration: channel.duration,
					data : params.data
				} );
			}
			catch ( err )
			{
				_errorCatch( fn + "User .onPlay failed on " + channel.id + ": " +
					params.pathname + " [" + err.message + "]", err );
			}
		}
		return _endEvent( event );
	}

	// HTML5 Audio onEnd handler

	function _htmlOnEnd ( event )
	{
		var fn, e, i, channel, params, exec;

		fn = "[_htmlOnEnd] ";

		e = event.currentTarget;
		i = e.getAttribute( "data-channel" );
		i = parseInt( i, 10 );
		channel = _channels[ i ];
		params = channel.params;

		if ( _MONITOR )
		{
			_debug( fn + channel.id + ": " + params.pathname );
		}

		channel.status = _CHANNEL_READY;

		// if channel has an onEnd function, call it

		exec = params.onEnd;
		if ( exec && ( typeof exec === "function" ) ) // one more check
		{
			if ( _MONITOR )
			{
				_debug( fn + "Calling user .onEnd on " + channel.id + ": " + params.pathname );
			}
			try
			{
				exec( {
					channel : channel.id,
					name : params.name,
					path : params.pathname,
					duration: channel.duration,
					data : params.data
				} );
			}
			catch ( err )
			{
				_errorCatch( fn + "User .onEnd failed on " + channel.id + ": " +
					params.pathname + " [" + err.message + "]", err );
			}
		}
		return _endEvent( event );
	}

	// _htmlLoadChannel()
	// Loads [channel] with an audio file defined by [params]

	function _htmlLoadChannel( channel, params )
	{
		var fn, audio;

		fn = "[_htmlLoadChannel] ";

		channel.params = params;
		channel.status = _CHANNEL_LOADING;

		audio = channel.audio;
		channel.duration = Math.floor( audio.duration * 1000 );

		// NOTE: Safari supposedly does not support canplaythrough!

		audio.addEventListener( "canplaythrough", _htmlOnLoad, false ); // must be reset on every new load
		audio.preload = "auto";
		audio.volume = params.volume;
		audio.loop = params.loop;

		if ( _MONITOR )
		{
			_debug( fn + channel.id + ": " + params.filepath + " (" +
				channel.duration + "ms)" );
		}

		audio.setAttribute( "src", params.pathname ); // actually starts the load
	}

	// _htmlLoad()
	// Loads an audio file defined by [params]
	// Returns { .filename, .channel } or AQ.ERROR

	function _htmlLoad ( params )
	{
		var fn, i, channel, cnt;

		fn = "[_htmlLoad] ";

		// is this sound already available in an ended, unpaused channel?

		for ( i = 0; i < _channelCnt; i += 1 )
		{
			channel = _channels[ i ];
			if ( ( channel.params.pathname === params.pathname ) && ( channel.status === _CHANNEL_READY ) )
			{
				if ( _MONITOR )
				{
					_debug( fn + channel.id + " ready: " + params.pathname );
				}
				channel.audio.currentTime = 0; // reset to start
				if ( params.autoplay )
				{
					_htmlStartChannel( channel, params ); // just play it again
				}
				return channel.id;
			}
		}

		// next look for an unused channel

		for ( i = 0; i < _MAX_CHANNELS; i += 1 ) // search all channels
		{
			channel = _channels[ i ];
			if ( channel.status === _CHANNEL_EMPTY )
			{
				if ( _MONITOR )
				{
					_debug( fn + channel.id + " unused: " + params.pathname );
				}
				cnt = i + 1;
				if ( cnt > _channelCnt )
				{
					_channelCnt = cnt; // new channel now in use
				}
				_htmlLoadChannel( channel, params );
				return channel.id;
			}
		}

		// Hijack a loaded but unlocked idle channel

		for ( i = 0; i < _channelCnt; i += 1 )
		{
			channel = _channels[ i ];
			if ( !channel.params.lock && ( channel.status === _CHANNEL_READY ) )
			{
				if ( _MONITOR )
				{
					_debug( fn + channel.id + " hijacked: " + params.pathname );
				}
				channel.audio.currentTime = 0; // reset to start
				_htmlLoadChannel( channel, params );
				return channel.id;
			}
		}

		if ( _MONITOR )
		{
			_debug( fn + "No channel available: " + params.pathname );
		}
		return AQ.ERROR; // fail silently
	}

	// _htmlPlay()
	// Plays using [params]
	// Returns actual playing channel (which may be different from [id]) or AQ.ERROR

	function _htmlPlay ( params )
	{
		var fn, i, channel;

		fn = "[_htmlPlay] ";

		// play requested channel if ready

		// is this sound already available in an ended, unpaused channel?

		for ( i = 0; i < _channelCnt; i += 1 )
		{
			channel = _channels[i];
			if ( ( channel.params.pathname === params.pathname ) && ( channel.status === _CHANNEL_READY ) )
			{
				if ( _MONITOR )
				{
					_debug( fn + channel.id + " ready: " + params.pathname );
				}
				channel.audio.currentTime = 0; // reset to start
				_htmlStartChannel( channel, params );
				return channel.id;
			}
		}

		if ( _MONITOR )
		{
			_debug( fn + params.pathname + " unavailable; loading" );
		}

		params.autoplay = true;
		return _htmlLoad( params );
	}

	// _htmlPlayChannel()
	// Plays channel
	// Returns actual playing channel (which may be different from [id]) or AQ.ERROR

	function _htmlPlayChannel ( id )
	{
		var fn, i, channel;

		fn = "[_htmlPlayChannel ] ";

		// Play requested channel if ready

		for ( i = 0; i < _channelCnt; i += 1 )
		{
			channel = _channels[i];
			if ( channel.id === id )
			{
				if ( _MONITOR )
				{
					_debug( fn + "Found " + id );
				}
				if ( channel.status !== _CHANNEL_READY )
				{
					return _error( fn + id + " not ready" );
				}

				// reset to start

				channel.audio.currentTime = 0;
				_htmlStartChannel( channel );
				return channel.id;
			}
		}

		return _error( fn + id + " not found" );
	}

	// _htmlPause()
	// Pause/unpause channel [id]
	// Returns channel id or AQ.ERROR

	function _htmlPause ( id )
	{
		var fn, i, channel;

		fn = "[_htmlPause ] ";

		for ( i = 0; i < _channelCnt; i += 1 )
		{
			channel = _channels[ i ];
			if ( channel.id === id )
			{
				if ( channel.status === _CHANNEL_PAUSED )
				{
					_htmlStartChannel( channel );
				}

				else if ( channel.status === _CHANNEL_PLAYING )
				{
					channel.status = _CHANNEL_PAUSED;
					channel.audio.pause();
				}
				return id;
			}
		}

		if ( _MONITOR )
		{
			_debug( fn + id + " not found" );
		}

		return AQ.ERROR; // fail silently
	}

	// _htmlStop( id )
	// Stops channel [id]
	// Returns AQ.DONE or AQ.ERROR

	function _htmlStop ( id )
	{
		var fn, i, channel, status;

		fn = "[_htmlStop ] ";

		for ( i = 0; i < _channelCnt; i += 1 )
		{
			channel = _channels[ i ];
			if ( channel.id === id )
			{
				channel.params.autoplay = false; // prevents autoplay if still loading

				status = channel.status;
				if ( ( status === _CHANNEL_PLAYING ) || ( status === _CHANNEL_PAUSED ) )
				{
					channel.status = _CHANNEL_READY;
					channel.audio.pause();
					channel.audio.currentTime = 0; // reset to start
				}
				return AQ.DONE;
			}
		}

		if ( _MONITOR )
		{
			_debug( fn + id + " not found" );
		}

		return AQ.ERROR;
	}

	// HTML5 Audio init

	function _htmlInit ()
	{
		var fn, i, audio;

		fn = "[_initHTML5Audio] ";

		// set up _MAX_CHANNELS Audio elements

		// Each channel object has these properties:
		// id: unique id string
		// audio: HTML5 Audio element
		// params: file/playback params
		// status: status constant

		_channels.length = _MAX_CHANNELS;

		for ( i = 0; i < _MAX_CHANNELS; i += 1 )
		{
			audio = document.createElement( "audio" );
			if ( !audio )
			{
				return _error( fn + "element init failed" );
			}
			audio.setAttribute( "data-channel", i.toString() ); // remember this element's channel
			audio.addEventListener( "error", _htmlOnError, false ); // establish onError listener
			audio.addEventListener( "stalled", _htmlOnStalled, false ); // establish onStalled listener
			audio.addEventListener( "play", _htmlOnPlay, false ); // establish play listener
			audio.addEventListener( "ended", _htmlOnEnd, false ); // establish onEnd listener
			document.body.appendChild( audio );

			_channels[ i ] = {
				id : _PREFIX_CHANNEL + ( i + 1 ),
				audio : audio,
				duration : 0, // set later when audio loaded
				params : null,
				status : _CHANNEL_EMPTY
			};
		}

		// set up executives

		_loadExec = _htmlLoad;
		_playExec = _htmlPlay;
		_playChannelExec = _htmlPlayChannel;
		_pauseExec = _htmlPause;
		_stopExec = _htmlStop;

		return AQ.HTML5_AUDIO;
	}

	// Return a params object with all defaults

	function _defaultParams ( name )
	{
		return {
			name : name,
			path : _defaultPath,
			fileTypes : _defaultFileTypes,
			lock : _DEFAULT.loop,
			volume : _DEFAULT.volume,
			start : _DEFAULT.start,
			end : _DEFAULT.end,
			loop : _DEFAULT.loop,
			autoplay : _DEFAULT.autoplay,
			onLoad : _DEFAULT.onLoad,
			onPlay: _DEFAULT.onPlay,
			onEnd : _DEFAULT.onEnd,
			data : _DEFAULT.data
		};
	}

	// --------------
	// AQ Public API
	// --------------

	AQ = {

		// PUBLIC CONSTANTS

		ERROR : "AQ.ERROR",
		DONE : "AQ.DONE",
		DEFAULT : "AQ.DEFAULT",
		HTML5_AUDIO : "AQ.HTML5_AUDIO",
		WEB_AUDIO : "AQ.WEB_AUDIO",

		// init()
		// Initalizes AQ engine
		// OPTIONAL [params] object with following optional properties:
		// .defaultPath (default: "") = default audio path, case sensitive
		// .defaultFileTypes (default: [ ".wav" ]) = default list of available file type strings
		// .onAlert (default: null, no display) = user function to display debug/error strings
		// .stack (default: false) = true to display Javascript stack on error messages
		// .forceHTML5 (default: false) = true to force HTML5 audio engine
		// Returns AQ.HTML5_AUDIO, AQ.WEB_AUDIO or AQ.ERROR

		init : function ( params )
		{
			var fn, e, item, codec, canplay, val, type, status, _contextClass;

			fn = "[AQ.init] ";

			// set engine defaults

			_enabled = false; // start disabled

			_defaultPath = _DEFAULT.path; // local directory
			_defaultFileTypes = _DEFAULT.filetypes; // assume ogg, mp3, wav files available
			_onAlert = null; // no alert reporter
			_stack = false; // no stack debugging
			_forceHTML5 = false; // HTML5 Audio not forced

			// determine which codecs are available

			e = document.createElement( 'audio' );

			if ( !e.canPlayType )
			{
				window.alert( fn + "Audio codec testing not available\n" );
				return AQ.ERROR;
			}

			for ( item in _codecs )
			{
				if ( _codecs.hasOwnProperty( item ) )
				{
					codec = _codecs[ item ]; // get codec table
					canplay = e.canPlayType( codec.type );
					if ( canplay === "probably" )
					{
						codec.ok = true; // mark as available
					}
				}
			}

			e = null;

			// check params if present

			if ( params )
			{
				if ( typeof params !== "object" )
				{
					window.alert( fn + "Invalid parameter\n" );
					return AQ.ERROR;
				}

				// check .onAlert property if present

				val = params.onAlert;
				type = _typeOf( val );
				if ( type !== "undefined" )
				{
					if ( ( val === null ) || ( val === AQ.DEFAULT ) )
					{
						val = null;
					}
					else if ( type !== "function" )
					{
						window.alert( fn + ".onAlert property not a function" ); // must use alert or it won't be seen!
						return AQ.ERROR;
					}
					_onAlert = val;
				}

				// check .stack property if present

				val = params.stack;
				type = _typeOf( val );
				if ( type !== "undefined" )
				{
					if ( !val || ( val === AQ.DEFAULT ) ) // catches null and zero
					{
						val = false;
					}
					else if ( ( val === true ) || ( type !== "number" ) )
					{
						val = true;
					}
					else
					{
						window.alert( fn + ".stack property not a boolean" );
						return AQ.ERROR;
					}
					_stack = val;
				}

				// check .forceHTML5 property if present

				val = params.forceHTML5;
				type = _typeOf( val );
				if ( type !== "undefined" )
				{
					if ( ( val !== true ) && ( val !== false ) )
					{
						if ( val === AQ.DEFAULT )
						{
							val = false;
						}
						else if ( type === "number" )
						{
							val = ( val !== 0 );
						}
						else
						{
							return _error( fn + ".forceHTML5 property invalid" );
						}
					}
					if ( _MONITOR )
					{
						_debug( "_forceHTML5 = " + val );
					}
					_forceHTML5 = val;
				}

				// check .defaultPath property if present

				val = params.defaultPath;
				type = _typeOf( val );
				if ( type !== "undefined" )
				{
					if ( ( val === null ) || ( val === AQ.DEFAULT ) )
					{
						val = _DEFAULT.path;
					}
					else if ( type !== "string" )
					{
						return _error( fn + ".defaultPath property not a valid string" );
					}
					_defaultPath = val;
				}

				// check .defaultFileTypes property if present

				val = _checkFileTypes( fn, params.defaultFileTypes );
				if ( val === AQ.ERROR )
				{
					return AQ.ERROR;
				}
				if ( val )
				{
					_defaultFileTypes = val;
				}
			}

			// init channels and buffers

			_channels.length = 0;
			_channelCnt = 0;
			_channelID = 0;

			_buffers.length = 0;
			_bufferID = 0;

			// check for Web Audio API, default to HTML5 if forced or not available

			_context = null;
			_usingWebAudio = false;
			if ( !_forceHTML5 )
			{
				_contextClass = ( window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext );
				if ( _contextClass )
				{
					_context = new _contextClass();
					if ( !_context )
					{
						return _error( fn + "AudioContext init failed" );
					}
					_usingWebAudio = true;
				}
			}

			// call appropriate initializer

			if ( !_usingWebAudio )
			{
				// make sure HTML5 Audio is actually available

				if ( !document.createElement( "audio" ).canPlayType )
				{
					return _error( fn + "HTML5 Audio not supported" );
				}
				status = _htmlInit();
			}
			else
			{
				status = _webInit();
			}

			if ( status !== AQ.ERROR )
			{
				_enabled = true; // ready to use!
			}

			if ( _MONITOR )
			{
				_debug( fn + "status = " + status );
			}

			return {
				name : _VERSION_NAME,
				major : _VERSION_MAJOR,
				minor : _VERSION_MINOR,
				revision : _VERSION_REVISION,
				status : status
			};
		},

		// load()
		// Load an audio file into an available channel
		// REQUIRED [name] is simple name of audio file (no path or file extension)
		// OPTIONAL [params] is an object with the following optional properties:
		// .path (default: engine default) = full default path of files (without filename), case sensitive
		// .fileTypes (default: engine default) = array of file type strings in order of preference
		// .autoplay (default: false) = true if file should be played immediately
		// .lock (default: false) = true to lock channel
		// .volume (default: engine default) = initial volume for channel
		// .start (default: 0) = time in millseconds where playback should begin
		// .end (default: -1) = time in millseconds where playback should end
		// .loop (default: false) = true if channel should loop when played
		// .onLoad (default: null) = function to call when audio loads, with .data as parameter
		// .onEnd (default: null) = function to call when audio ends, with .data as parameter
		// .data (default: buffer) = data that will be passed as parameter to .onDone function if present
		// Returns assigned channel id, else AQ.ERROR

		load : function ( user_name, user_params )
		{
			var fn, params, result;

			if ( !_enabled )
			{
				return AQ.ERROR;
			}

			fn = "[AQ.load] ";

			// check name parameter

			if ( !user_name || ( typeof user_name !== "string" ) || ( user_name.length < 1 ) )
			{
				return _error( fn + "name parameter invalid" );
			}

			// set up default channel params

			params = _defaultParams( user_name );

			if ( _checkParams( fn, params, user_params ) === AQ.ERROR )
			{
				return AQ.ERROR;
			}

			// form the complete pathname, using the first playable file type

			params.pathname = params.path + params.name + "." + params.fileTypes[ 0 ];

			// dispatch to appropriate API

			result = _loadExec( params );

			if ( _MONITOR )
			{
				_debug( fn + "Loaded " + params.pathname + ", result = " + result );
			}

			return result;
		},

		// play()
		// Play a file
		// (Required) name : string = name of file without extension
		// (Optional) uparams : object = object with the following optional properties:
		// .volume : number (default: engine default) = initial volume for channel
		// .start : number (default: 0) = time in millseconds where playback should begin
		// .end : number (default: -1) = time in millseconds where playback should end
		// .loop : boolean (default: false) = true if channel should loop when played
		// .onPlay : function (default: null) = function to call when audio plays, with .data as parameter
		// .onDone : function (default: null) = function to call when audio ends, with .data as parameter
		// .data : any value (default: pathname) = data that will be passed as parameter to .onPlay/.onDone functions if present
		// Returns unique channel id string on success, else AQ.ERROR

		play : function ( name, uparams )
		{
			var fn, params, result;

			if ( !_enabled )
			{
				return AQ.ERROR;
			}

			fn = "[AQ.play] ";

			if ( !name || ( typeof name !== "string" ) || ( name.length < 1 ) )
			{
				return _error( fn + "name parameter invalid" );
			}

			// set up default channel params

			params = _defaultParams( name );

			if ( _checkParams( fn, params, uparams ) === AQ.ERROR )
			{
				return AQ.ERROR;
			}

			// form the complete pathname, using the first playable file type

			params.pathname = params.path + params.name + "." + params.fileTypes[ 0 ];

			// dispatch to appropriate API

			result = _playExec( params );

			if ( _MONITOR )
			{
				_debug( fn + "Played " + params.pathname + ", result = " + result );
			}

			return result;
		},

		// playChannel()
		// Play a channel
		// (Required) channel : string = channel id returned by AQ.load() or AQ.play()
		// Returns unique channel id string on success, else AQ.ERROR

		playChannel : function ( channel )
		{
			var fn, result;

			if ( !_enabled )
			{
				return AQ.ERROR;
			}

			fn = "[AQ.playChannel] ";

			if ( !channel || ( typeof channel !== "string" ) || ( channel.length < 1 ) )
			{
				return _error( fn + "Invalid channel id" );
			}

			// dispatch to appropriate API

			result = _playChannelExec( channel );

			if ( _MONITOR )
			{
				_debug( fn + "Played " + channel + ", result = " + result );
			}

			return result;
		},

		// pause()
		// Pause/unpause a previously loaded channel
		// (Required) channel : string = channel id supplied by AQ.load() or AQ.play()
		// Returns new channel id string, else AQ.ERROR

		pause : function ( channel )
		{
			var fn, result;

			if ( !_enabled )
			{
				return AQ.ERROR;
			}

			fn = "[AQ.pause] ";

			if ( !channel || ( typeof channel !== "string" ) || ( channel.length < 1 ) )
			{
				return _error( fn + "Invalid channel id" );
			}

			// dispatch to appropriate API

			result = _pauseExec( channel );

			if ( _MONITOR )
			{
				_debug( fn + "Paused " + channel + ", result = " + result );
			}

			return result;
		},

		// stop( channel )
		// Stops a previously loaded channel
		// (Required) channel : string = channel id supplied by AQ.load() or AQ.play()
		// Returns AQ.DONE or AQ.ERROR

		stop : function ( channel )
		{
			var fn, result;

			if ( !_enabled )
			{
				return AQ.ERROR;
			}

			fn = "[AQ.stop] ";

			if ( !channel || ( typeof channel !== "string" ) || ( channel.length < 1 ) )
			{
				return _error( fn + "Invalid channel id" );
			}

			// dispatch to appropriate API

			result = _stopExec( channel );

			if ( _MONITOR )
			{
				_debug( fn + "Stopped " + channel + ", result = " + result );
			}

			return result;
		}
	};

}() );

