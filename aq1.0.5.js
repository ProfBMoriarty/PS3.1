// aq1.0.5.js
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
	var _VERSION_REVISION = 5;

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
	var _errorDetected = false; // true if asynchronous error was detected
	var _defaultPath = ""; // default audio path (case sensitive)
	var _onAlert = null; // user function to call for alerts
	var _stack = false; // true for stack trace
	var _usingWebAudio = false; // true if using Web Audio API
	var _forceHTML5 = false; // true to force HTML5 audio
	var _defaultFileTypes = null; // default list of audio file types available

	// list of audio codecs and types

	var _codecs = {
		ogg : { ok : false, type : 'audio/ogg; codecs="vorbis"' },
		mp3 : { ok : false, type : 'audio/mpeg; codecs="mp3"' },
		wav : { ok : false, type : 'audio/wav; codecs="1"' },
		aac : { ok : false, type : 'audio/mp4; codecs="mp4a.40.2"' },
		webm : { ok : false, type : 'audio/webm; codecs="vorbis"' },
		opus : { ok : false, type : 'audio/ogg; codecs="opus"' }
	};

	var _channels = []; // active channel list
	var _channelCnt = 0; // channels in use
	var _channelID = 0; // unique channel id

	// Executive selector

	var _exec = null; // either _web or _html

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

		event.preventDefault(); // prevents weirdness
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

		_errorDetected = true;
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
		var type, len, i, playable, str;

		type = _typeOf( ft );
		if ( ( type === "undefined" ) || ( ft === null ) || ( ft === AQ.DEFAULT ) )
		{
			return _defaultFileTypes;
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

			if ( _defaultFileTypes.indexOf( str ) >= 0 ) // this codec available?
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
			onPlay : _DEFAULT.onPlay,
			onEnd : _DEFAULT.onEnd,
			data : _DEFAULT.data
		};
	}

	// -----------------
	// Web Audio Support
	// -----------------

	var _web = {

		context : null, // AudioContext handle
		buffers : [], // active file buffer
		bufferID : 0, // buffer ID counter

		// _web.stopChannel ( channel )
		// Stops channel in [channel] object
		// Returns AQ.DONE

		stopChannel : function ( channel )
		{
			var fn, source;

			fn = "[AQ._web.stopChannel] ";

			if ( _errorDetected )
			{
				return AQ.ERROR;
			}

			if ( _MONITOR )
			{
				_debug( fn + channel.id );
			}

			source = channel.source;
			if ( source && ( source.playbackState !== _WEBAUDIO_FINISHED_STATE ) ) // if not finished, pause it
			{
				if ( channel.thandle )
				{
					window.clearTimeout( channel.thandle );
				}

				if ( source.stop !== undefined )
				{
					source.stop( 0 ); // this is the standard
				}
				else
				{
					source.noteOff( 0 ); // deprecated!
				}

				channel.status = _CHANNEL_READY;
			}

			return AQ.DONE;
		},

		// Generate a channel id

		assignChannel : function ()
		{
			var id;

			_channelID += 1;
			id = _PREFIX_CHANNEL + _channelID;
			return id;
		},

		// _web.playBuffer ( buffer, offset )
		// Play file in [buffer] with optional [offset]
		// Returns channel id

		playBuffer : function ( buffer, offset )
		{
			var fn, ctx, source, gainNode, duration, timeout, id, channel, params, exec;

			fn = "[AQ._web.playBuffer] ";

			if ( _errorDetected )
			{
				return AQ.ERROR;
			}

			ctx = _web.context;

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
				buffer.channel_id = _web.assignChannel();
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

			channel.thandle = window.setTimeout(
				function ()
				{
					var len, i, buf;

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

							buf = channel.buffer;
							params = buf.params;
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
										channel : buf.channel_id,
										name : params.name,
										path : params.pathname,
										duration : buf.duration,
										data : params.data
									} );
								}
								catch ( err )
								{
									_errorCatch( fn + "User .onEnd failed on " + id + ": " + params.pathname + " [" + err.message + "]", err );
								}
							}

							_web.stopChannel( channel );
							_channels.splice( i, 1 );

							// restart if looping

							if ( params.loop )
							{
								_web.playBuffer( buf, 0 ); // fix offset later
							}
							return;
						}
					}

					_error( fn + "Channel " + id + " not found" );

				}, timeout );

			// save the channel

			_channels.push( channel );

			// begin playback

			if ( source.start !== undefined )
			{
				source.start( 0, offset, duration );
			}
			else
			{
				source.noteGrainOn( 0, offset, duration ); // deprecated!
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
					_errorCatch( fn + "User .onPlay failed on " + buffer.channel_id + ": " + params.pathname + " [" + err.message + "]", err );
				}
			}

			return id;
		},

		// _web.load( params )
		// Load file per [params]
		// Return assigned channel id

		load : function ( params )
		{
			var fn, len, i, buffer, id, request;

			fn = "[AQ._web.load] ";

			if ( _errorDetected )
			{
				return AQ.ERROR;
			}

			// see if this file is already loaded

			len = _web.buffers.length;
			for ( i = 0; i < len; i += 1 )
			{
				buffer = _web.buffers[ i ];
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

			_web.bufferID += 1; // unique id
			id = _PREFIX_BUFFER + _web.bufferID;

			buffer = {
				id : id,
				channel_id : _web.assignChannel(), // pre-assign the channel id
				audio : null, // will get this when loaded
				duration : 0, // this too
				params : params
			};

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
				_web.context.decodeAudioData( request.response,
				function ( audio ) // on successful load
				{
					var exec;

					buffer.audio = audio; // save decoded audio in buffer
					buffer.duration = Math.floor( audio.duration * 1000 ); // convert to milliseconds
					_web.buffers.push( buffer ); // save buffer object

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
								channel : buffer.channel_id,
								name : params.name,
								path : params.pathname,
								duration : buffer.duration,
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
						_web.playBuffer( buffer );
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
		},

		// _web.play ( params )
		// Returns same id if paused, NEW id if restarted, else silent AQ.ERROR

		play : function ( params )
		{
			var fn, len, i, buffer;

			fn = "[AQ._web.play] ";

			if ( _errorDetected )
			{
				return AQ.ERROR;
			}

			len = _web.buffers.length;
			for ( i = 0; i < len; i += 1 )
			{
				buffer = _web.buffers[ i ];
				if ( buffer.params.pathname === params.pathname ) // found it!
				{
					if ( _MONITOR )
					{
						_debug( fn + "Found " + params.pathname );
					}
					return _web.playBuffer( buffer );
				}
			}

			if ( _MONITOR )
			{
				_debug( fn + params.pathname + " unavailable; loading" );
			}

			params.autoplay = true;
			return _web.load( params );
		},

		// _web.playChannel ( id )
		// Returns same id if paused, NEW id if restarted, else silent AQ.ERROR

		playChannel : function ( id )
		{
			var fn, len, i, buffer;

			fn = "[AQ._web.playChannel] ";

			if ( _errorDetected )
			{
				return AQ.ERROR;
			}

			len = _web.buffers.length;
			for ( i = 0; i < len; i += 1 )
			{
				buffer = _web.buffers[ i ];
				if ( buffer.channel_id === id ) // found it!
				{
					return _web.playBuffer( buffer );
				}
			}

			return _error( fn + id + " not found" );
		},

		// _web.pause ( id )
		// [id] is a channel id
		// Returns same id if paused, NEW id if restarted, else silent AQ.ERROR

		pause : function ( id )
		{
			var fn, len, i, channel, buffer, source, ptime;

			fn = "[AQ._web.pause] ";

			if ( _errorDetected )
			{
				return AQ.ERROR;
			}

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
						return _web.playBuffer( buffer, ptime ); // restart on new channel
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
						ptime = _web.context.currentTime - channel.startTime;
						ptime = ptime % buffer.audio.duration; // prevents overflow?
						channel.pauseTime = ptime; // save pause time
						channel.status = _CHANNEL_PAUSED;
						if ( source.stop !== undefined )
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
		},

		stop : function ( id )
		{
			var fn, len, i, channel;

			fn = "[AQ._web.stop] ";

			if ( _errorDetected )
			{
				return AQ.ERROR;
			}

			len = _channels.length;
			for ( i = 0; i < len; i += 1 )
			{
				channel = _channels[ i ];
				if ( channel.id === id )
				{
					_web.stopChannel( channel );
					_channels.splice( i, 1 ); // delete this channel
					return AQ.DONE;
				}
			}

			if ( _MONITOR )
			{
				_debug( fn + id + " not found" );
			}

			return AQ.ERROR; // fail silently
		},

		init : function ()
		{
			if ( _errorDetected )
			{
				return AQ.ERROR;
			}

			_web.buffers = [];
			_web.bufferID = 0;
			return AQ.WEB_AUDIO;
		}
	};

	// --------------------
	// HTML5 Audio handlers
	// --------------------

	var _html = {

		// _html.onError ( event )
		// DOM onError handler
		// Called by browser if file load fails

		onError : function ( event )
		{
			var fn, e, i, channel, c, str;

			fn = "[AQ._html.onError] ";

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
		},

		// _html.onStalled ( event )
		// DOM onStalled handler
		// Called by browser if file stalls during loading

		onStalled : function ( event )
		{
			var fn, e, i, channel;

			fn = "[AQ._html.onStalled] ";

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
		},

		// _html.startChannel ( channel, params )
		// Starts [channel] using optional [params]

		startChannel : function ( channel, params )
		{
			var fn, audio, val, type;

			fn = "[AQ._html.startChannel] ";

			if ( _errorDetected )
			{
				return AQ.ERROR;
			}

			if ( _MONITOR )
			{
				_debug( fn + "Playing " + channel.id );
			}

			channel.status = _CHANNEL_PLAYING;
			audio = channel.audio;

			type = _typeOf( params );
			if ( type === "object" )
			{
				val = params.volume;
				type = _typeOf( val );
				if ( type !== "undefined" )
				{
					channel.params.volume = val;
					audio.volume = val;
				}

				val = params.loop;
				type = _typeOf( val );
				if ( type !== "undefined" )
				{
					channel.params.loop = val;
					audio.loop = val; // must do this manually?
				}

				val = params.onDone;
				type = _typeOf( val );
				if ( type !== "undefined" )
				{
					channel.params.onDone = val;
				}

				val = params.userData;
				type = _typeOf( val );
				if ( type !== "undefined" )
				{
					channel.params.userData = val;
				}

				val = params.lock;
				type = _typeOf( val );
				if ( type !== "undefined" )
				{
					channel.params.lock = val;
				}
			}

			audio.play();
			return AQ.DONE;
		},

		// _html.onLoad ( event )
		// DOM onLoad handler
		// Called by browser when a file loads, supposedly

		onLoad : function ( event )
		{
			var fn, e, i, channel, params, exec;

			fn = "[AQ._html.onLoad] ";

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

			channel.audio.removeEventListener( "canplaythrough", _html.onLoad, false ); // must be removed after initial load!

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
						duration : channel.duration,
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
				_html.startChannel( channel, params );
			}

			return _endEvent( event );
		},

		// _html.onPlay ( event )
		// DOM onPlay handler
		// Called by browser when file starts playing

		onPlay : function ( event )
		{
			var fn, e, i, channel, params, exec;

			fn = "[AQ._html.onPlay] ";

			e = event.currentTarget;
			i = e.getAttribute( "data-channel" );
			i = parseInt( i, 10 );
			channel = _channels[ i ];
			params = channel.params;

			if ( _MONITOR )
			{
				_debug( fn + channel.id + ": " + params.pathname + " (" + channel.duration + "ms)" );
			}

			// if channel has an .onPlay function, call it

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
						duration : channel.duration,
						data : params.data
					} );
				}
				catch ( err )
				{
					_errorCatch( fn + "User .onPlay failed on " + channel.id + ": " + params.pathname + " [" + err.message + "]", err );
				}
			}
			return _endEvent( event );
		},

		// _html.onEnd ( event )
		// DOM onEnd handler
		// Called by browser when a file stops playing

		onEnd : function ( event )
		{
			var fn, e, i, channel, params, exec;

			fn = "[AQ._html.onEnd] ";

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
						duration : channel.duration,
						data : params.data
					} );
				}
				catch ( err )
				{
					_errorCatch( fn + "User .onEnd failed on " + channel.id + ": " + params.pathname + " [" + err.message + "]", err );
				}
			}
			return _endEvent( event );
		},

		// _html.loadChannel ( channel, params )
		// Loads [channel] with an audio file defined by [params]

		loadChannel : function ( channel, params )
		{
			var fn, audio;

			fn = "[AQ._html.loadChannel] ";

			if ( _errorDetected )
			{
				return AQ.ERROR;
			}

			channel.params = params;
			channel.status = _CHANNEL_LOADING;

			audio = channel.audio;
			channel.duration = Math.floor( audio.duration * 1000 );

			// NOTE: Safari supposedly does not support canplaythrough!

			audio.addEventListener( "canplaythrough", _html.onLoad, false ); // must be reset on every new load
			audio.preload = "auto";
			audio.volume = params.volume;
			audio.loop = params.loop;

			if ( _MONITOR )
			{
				_debug( fn + channel.id + ": " + params.filepath + " (" + channel.duration + "ms)" );
			}

			audio.setAttribute( "src", params.pathname ); // actually starts the load
			return AQ.DONE;
		},

		// _html.load ( params )
		// Loads an audio file defined by [params]
		// Returns { .filename, .channel } or AQ.ERROR

		load : function ( params )
		{
			var fn, i, channel, cnt;

			fn = "[AQ._html.load] ";

			if ( _errorDetected )
			{
				return AQ.ERROR;
			}

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
						_html.startChannel( channel, params ); // just play it again
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
					_html.loadChannel( channel, params );
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
					_html.loadChannel( channel, params );
					return channel.id;
				}
			}

			if ( _MONITOR )
			{
				_debug( fn + "No channel available: " + params.pathname );
			}
			return AQ.ERROR; // fail silently
		},

		// _html.play ( params )
		// Plays using [params]
		// Returns actual playing channel (which may be different from [id]) or AQ.ERROR

		play : function ( params )
		{
			var fn, i, channel;

			fn = "[AQ._html.play] ";

			if ( _errorDetected )
			{
				return AQ.ERROR;
			}

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
					_html.startChannel( channel, params );
					return channel.id;
				}
			}

			if ( _MONITOR )
			{
				_debug( fn + params.pathname + " unavailable; loading" );
			}

			params.autoplay = true;
			return _html.load( params );
		},

		// _html.playChannel ( id )
		// Plays channel [id]
		// Returns actual playing channel (which may be different from [id]) or AQ.ERROR

		playChannel : function ( id )
		{
			var fn, i, channel;

			fn = "[AQ._html.playChannel] ";

			if ( _errorDetected )
			{
				return AQ.ERROR;
			}

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
					_html.startChannel( channel );
					return channel.id;
				}
			}

			return _error( fn + id + " not found" );
		},

		// _html.pause ( id )
		// Pause/unpause channel [id]
		// Returns channel id or AQ.ERROR

		pause : function ( id )
		{
			var fn, i, channel;

			fn = "[AQ._html.pause] ";

			if ( _errorDetected )
			{
				return AQ.ERROR;
			}

			for ( i = 0; i < _channelCnt; i += 1 )
			{
				channel = _channels[ i ];
				if ( channel.id === id )
				{
					if ( channel.status === _CHANNEL_PAUSED )
					{
						_html.startChannel( channel );
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
		},

		// _html.stop ( id )
		// Stops channel [id]
		// Returns AQ.DONE or AQ.ERROR

		stop : function ( id )
		{
			var fn, i, channel, status;

			fn = "[AQ._html.stop] ";

			if ( _errorDetected )
			{
				return AQ.ERROR;
			}

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
		},

		// HTML5 Audio init

		init : function ()
		{
			var fn, i, audio;

			fn = "[AQ._html.init] ";

			if ( _errorDetected )
			{
				return AQ.ERROR;
			}

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
				audio.addEventListener( "error", _html.onError, false ); // establish onError listener
				audio.addEventListener( "stalled", _html.onStalled, false ); // establish onStalled listener
				audio.addEventListener( "play", _html.onPlay, false ); // establish onPlay listener
				audio.addEventListener( "ended", _html.onEnd, false ); // establish onEnd listener
				document.body.appendChild( audio );

				_channels[ i ] = {
					id : _PREFIX_CHANNEL + ( i + 1 ),
					audio : audio,
					duration : 0, // set later when audio loaded, we hope
					params : null,
					status : _CHANNEL_EMPTY
				};
			}

			return AQ.HTML5_AUDIO;
		}
	};

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
		// Returns init info object or AQ.ERROR

		init : function ( params )
		{
			var fn, result, e, html, item, codec, canplay, val, type, status, contextClass;

			fn = "[AQ.init] ";

			result = {
				engine : _VERSION_NAME,
				major : _VERSION_MAJOR,
				minor : _VERSION_MINOR,
				revision : _VERSION_REVISION,
				status : AQ.ERROR, // assume error return
				fileTypes : [] // with no file types
			};

			// set engine defaults

			_enabled = false; // start disabled
			_errorDetected = false; // no async errors yet
			_defaultPath = _DEFAULT.path; // local directory
			_onAlert = null; // no alert reporter
			_stack = false; // no stack debugging
			_forceHTML5 = false; // HTML5 Audio not forced

			// determine which codecs are available

			e = document.createElement( 'audio' );
			html = e.canPlayType;
			if ( !html )
			{
				window.alert( fn + "Audio codec testing not available\n" );
				return result;
			}

			_defaultFileTypes = [];
			for ( item in _codecs )
			{
				if ( _codecs.hasOwnProperty( item ) )
				{
					codec = _codecs[ item ]; // get codec table
					canplay = e.canPlayType( codec.type );
					if ( canplay === "probably" ) // instead of "probably"
					{
						codec.ok = true; // mark as available
						_defaultFileTypes.push( item ); // add to list of defaults
					}
				}
			}
			e = null; // discard

			if ( _defaultFileTypes.length < 1 )
			{
				window.alert( fn + "No common audio filetypes supported\n" );
				return result;
			}

			// check params if present

			if ( params )
			{
				if ( typeof params !== "object" )
				{
					window.alert( fn + "Invalid parameter\n" );
					return result;
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
						return result;
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
						return result;
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
							window.alert( fn + ".forceHTML5 property invalid" );
							return result;
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
						window.alert( fn + ".defaultPath property not a valid string" );
						return result;
					}
					_defaultPath = val;
				}

				// check .defaultFileTypes property if present

				val = _checkFileTypes( fn, params.defaultFileTypes );
				if ( val === AQ.ERROR )
				{
					return result;
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

			// check for Web Audio API, default to HTML5 if forced or not available

			_web.context = null;
			_usingWebAudio = false;
			if ( !_forceHTML5 )
			{
				contextClass = ( window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext );
				if ( contextClass )
				{
					_web.context = new contextClass();
					if ( !_web.context )
					{
						window.alert( fn + "AudioContext init failed" );
						return result;
					}
					_usingWebAudio = true;
				}
			}

			// Drop down to HTML audio if can't/won't use Web Audio

			if ( !_usingWebAudio )
			{
				// make sure HTML5 Audio is actually available

				if ( !html )
				{
					window.alert( fn + "HTML5 Audio not supported" );
					return result;
				}
				_exec = _html;
			}
			else
			{
				_exec = _web;
			}

			status = _exec.init();
			if ( status !== AQ.ERROR )
			{
				_enabled = true; // ready to use!
			}

			if ( _MONITOR )
			{
				_debug( fn + "status = " + status );
			}

			result.status = AQ.DONE;
			result.fileTypes = _defaultFileTypes;
			return result;
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

			// dispatch to loader

			result = _exec.load( params );

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

			result = _exec.play( params );

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

			result = _exec.playChannel( channel );

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

			result = _exec.pause( channel );

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

			result = _exec.stop( channel );

			if ( _MONITOR )
			{
				_debug( fn + "Stopped " + channel + ", result = " + result );
			}

			return result;
		}
	};

}() );



