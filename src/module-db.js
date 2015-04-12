// Perlenspiel Database Module

/*jslint nomen: true, white: true, vars: true */
/*global document, window, screen, console, Image, AQ, PIXI, PERLENSPIEL, PS */

var PerlenspielDB = function (my) {
    "use strict";

    ////////////////////////////////////////
    // Module initializer

    my._onInit(function(spec) {
        console.log("Database Module Initialized");
    });

    ////////////////////////////////////////
    // Public properties

    my.PSInterface.prototype.displaySecret = function() {
        // You can access the current Perlenspiel instance via my.instance
        my.instance.debug("My secret is " + my._secret);
    };

    ////////////////////////////////////////
    // Private Database module

    my._db = {
        TIME_LABEL : "time",

        store : {}, // database storage

        // User list (IMGD 3900 C15)

        users : {
            bmoriarty : 1,
            jamaraldasilva : 1,
            nmbryant : 1,
            tncalvert : 1,
            dadavis : 1,
            ajdegenhardt : 1,
            djdesimone : 1,
            cpgeary : 1,
            jdguerra : 1,
            sjhalloran : 1,
            dlankenau : 1,
            llewis : 1,
            arlocke : 1,
            tslourenco : 1,
            kma : 1,
            zdmason : 1,
            bamiller1 : 1,
            baowens : 1,
            jdpham : 1,
            cgporell : 1,
            ijschuba : 1,
            ajtamburri : 1,
            mthompson : 1,
            cttibbetts : 1
        },

        // _db.validID()
        // Returns true if database id exists, else fase

        validID : function ( id )
        {
            return my._db.store.hasOwnProperty( id );
        },

        // _db.validUser()
        // Returns true if username exists, else fase

        validUser : function ( uname )
        {
            return my._db.users.hasOwnProperty( uname );
        },

        // Expand milliseconds into h/s/s/ms properties

        expand : function ( t ) {
            var h, m, s;

            h = Math.floor( t / 3600000 );
            t -= ( h * 3600000 ); // subtract out hours
            m = Math.floor( t / 60000 ); // minutes
            t -= ( m * 60000 ); // subtract out minutes
            s = Math.floor( t / 1000 ); // seconds
            t -= ( s * 1000 ); // t now contains only milliseconds

            return { h : h, m : m, s : s, ms : t };
        },

        // Return formatted time string based on max timestamp

        tstring : function ( t, max ) {
            var now, str, ms, len;

            now = my._db.expand( t );
            str = "";
            if ( max.h > 0 ) {
                if ( now.h < 10 ) {
                    str += "0";
                }
                str += ( now.h + ":" );
                if ( now.m < 10 ) {
                    str += "0";
                }
                str += ( now.m + ":" );
                if ( now.s < 10 ) {
                    str += "0";
                }
                str += ( now.s + "." );
            }
            else if ( max.m > 0 ) {
                if ( now.m < 10 ) {
                    str += "0";
                }
                str += ( now.m + ":" );
                if ( now.s < 10 ) {
                    str += "0";
                }
                str += ( now.s + "." );
            }
            else if ( max.s > 0 ) {
                if ( now.s < 10 ) {
                    str += "0";
                }
                str += ( now.s + "." );
            }

            // Add leading/trailing zeros to milliseconds

            ms = "";
            if ( now.ms < 10 ) {
                ms += "00";
            }
            else if ( now.ms < 100 ) {
                ms += "0";
            }
            ms += now.ms.toString();
            len = ms.length;
            if ( len === 1 )
            {
                ms += "00";
            }
            else if ( len === 2 )
            {
                ms += "0";
            }
            str += ms;

            return str;
        },

        // _db.csv( id )
        // Converts database to formatted csv string
        // fn : string = name of calling function
        // id : string = vetted database id
        // Returns csv string or PS.ERROR

        csv : function ( fn, id ) {
            var data, rows, cols, max, str, i, last, field, record, j, val;

            data = my._db.store[ id ];
            rows = data.events.length; // number of rows/events
            if ( rows < 1 ) {
                return my._error( fn + "Database '" + id + "' is empty" );
            }
            cols = data.fields.length; // number of columns/fields
            max = my._db.expand( data.tmax ); // expand maximum timestamp for formatting

            // Create initial row of labels

            str = my._db.TIME_LABEL + ",";
            last = cols - 1;
            for ( i = 0; i < cols; i += 1 ) {
                field = data.fields[ i ];
                str += field;
                if ( i < last ) {
                    str += ",";
                }
            }
            str += "\r\n";

            // Create a row for each event

            for ( i = 0; i < rows; i += 1 ) {
                record = data.events[ i ];
                str += my._db.tstring( record[ my._db.TIME_LABEL ], max );
                str += ",";
                for ( j = 0; j < cols; j += 1 ) {
                    field = data.fields[ j ];
                    if ( record.hasOwnProperty( field ) ) {
                        val = record[ field ];
                        str += val.toString();
                    }
                    if ( j < last ) {
                        str += ",";
                    }
                }
                str += "\r\n";
            }

            return str;
        },

        // _db.init( id )
        // Establish a new database
        // id : string = vetted database id

        init : function ( id ) {
            my._db.store[ id ] = {
                date : my._getDate(),
                fields : [],
                events : [],
                tmax : 0
            };
        },

        // _db.erase( id )
        // Erase an existing database
        // id : string = vetted database id

        erase : function ( id ) {
            my._db.store.delete( id );
        },

        // Add event to database
        // id : string = vetted database id
        // elist : array = vetted array of name|value pairs
        // Returns timestamp

        event : function ( id, elist ) {
            var data, d, t, record, len, i, name;

            data = my._db.store[ id ];
            d = new Date();
            t = d.getTime() - data.date.time;
            record = {};
            record[ my._db.TIME_LABEL ] = t;
            data.tmax = t; // save latest timestamp

            len = elist.length;
            for ( i = 0; i < len; i += 2 )
            {
                name = elist[ i ];

                // Add field if not already registered

                if ( data.fields.indexOf( name ) < 0 ) {
                    data.fields.push( name );
                }
                record[ name ] = elist[ i + 1 ];
            }

            data.events.push( record ); // add record to event list
            return t;
        },

        // _db.send( fn, id, uname )
        // Sends database to user
        // fn : string = function name of caller
        // id : string = vetted database id
        // uname : string = vetted username
        // Returns PS.DONE on success, else PS.ERROR

        b64Encode : function ( str ) {
            return window.btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function( match, p1 ) {
                return String.fromCharCode( '0x' + p1 );
            }));
        },

        send : function ( fn, id, uname ) {
            var monitor, data, len, request, oline, day, filename, jdata;

            monitor = false; // turn off for silent send
            data = my._db.store[ id ];
            len = data.events.length;
            if ( len < 1 ) {
                return my._error( fn + "Database '" + id + "' is empty" );
            }

            request = new XMLHttpRequest();
            if ( !request )
            {
                return my._error( fn + "XMLHttpRequest init failed\n" );
            }

            oline = my.instance.statusText(); // save status line text
            my.instance.statusText( "Sending data to " + uname + " ..." );

            day = "";
            if ( data.date.date < 10 )
            {
                day += "0";
            }
            day += data.date.date.toString();
            filename = id + "_" + data.date.year + "_" + day + "_" + data.date.monthShort;

            request.onload = function ()
            {
                if ( monitor ) {
                    my.instance.debug( "XMLHttpRequest status: " + request.status + "\nText: " + request.responseText + "\n" );
                }
                my.instance.statusText( oline );
            };

            request.onerror = function ()
            {
                my._error( fn + "XMLHttpRequest status: " + request.status + ", text: " + request.responseText );
                my.instance.statusText( oline );
            };

            request.open( "POST", "https://mandrillapp.com/api/1.0/messages/send.json", true );

            jdata = JSON.stringify( {
                key : "Qx68hJAyBFvbhMNRqtX8FQ",
                message : {
                    from_email : "bmoriarty@wpi.edu",
                    to : [
                        {
                            email : uname + "@wpi.edu",
                            name : "User " + uname,
                            type : "to"
                        }
                    ],
                    autotext: true,
                    subject: "Perlenspiel Report: " + id,
                    html: "Data file attached: " + filename + ".csv\n",

                    attachments: [
                        {
                            type : "text/plain",
                            name : filename + ".csv",
                            content : my._db.b64Encode( my._db.csv( fn, id ) )
                        }
                    ]
                }
            });

            try
            {
                request.send( jdata );
            }
            catch ( err )
            {
                my.instance.statusText( oline );
                return my._errorCatch( fn + "XMLHttpRequest send failed [" + err.message + "]" );
            }

            return id;
        }
    };

    // Database API

    // PS.dbInit( id )
    // Establishes a named database
    // id : string = case-insensitive database id
    // Returns id on success, else PS.ERROR

    my.PSInterface.prototype.dbInit = function ( id ) {
        var fn, args;

        fn = "[PS.dbInit] ";
        args = arguments.length;
        if ( args < 1 ) {
            return my._error( fn + "Missing argument" );
        }
        if ( args > 1 ) {
            return my._error( fn + "Too many arguments" );
        }
        if ( ( typeof id !== "string" ) || ( id.length < 1 ) ) {
            return my._error( fn + "Database id invalid" );
        }
        id = id.toLowerCase();
        if ( id === my._db.TIME_LABEL ) {
            return my._error( fn + "Database id '" + my._db.TIME_LABEL + "' is reserved" );
        }
        if ( my._db.validID( id ) ) {
            return my._error( fn + "Database id '" + id + "' already exists" );
        }
        my._db.init( id );
        return id;
    };

    // PS.dbErase( id )
    // Erases an existing database
    // id : string = case-insensitive database id
    // Returns id on success, else PS.ERROR

    my.PSInterface.prototype.dbErase = function ( id ) {
        var fn, args;

        fn = "[PS.dbErase] ";
        args = arguments.length;
        if ( args < 1 ) {
            return my._error( fn + "Missing argument" );
        }
        if ( args > 1 ) {
            return my._error( fn + "Too many arguments" );
        }
        if ( ( typeof id !== "string" ) || ( id.length < 1 ) ) {
            return my._error( fn + "Database id invalid" );
        }
        id = id.toLowerCase();
        if ( !my._db.validID( id ) ) {
            return my._error( fn + "Database id '" + id + "' does not exist" );
        }
        my._db.erase( id );
        return id;
    };

    // PS.dbEvent( id, name, val, [ name, val ] ... )
    // Record database event(s)
    // id : string = case-insensitive database id
    // name : string = case-insensitive event name
    // val : number|string|true|false|null = event value
    // Supports any number of name|val pairs
    // Returns timestamp on success, else PS.ERROR

    my.PSInterface.prototype.dbEvent = function ( id ) {
        var fn, args, i, nlist, elist, name, nxt, val, type;

        fn = "[PS.dbEvent] ";
        args = arguments.length;
        if ( args < 3 ) {
            return my._error( fn + "Missing arguments" );
        }
        if ( ( typeof id !== "string" ) || ( id.length < 1 ) ) {
            return my._error( fn + "Database id invalid" );
        }
        id = id.toLowerCase();
        if ( !my._db.validID( id ) ) {
            return my._error( fn + "Database id '" + id + "' does not exist" );
        }

        // Validate name|value pairs, assemble an array

        nlist = {};
        elist = [];
        i = 1;
        while ( i < args ) {
            name = arguments[ i ];
            if ( ( typeof name !== "string" ) || ( name.length < 1 ) ) {
                return my._error( fn + "Event name @ argument " + i + " invalid" );
            }
            name = name.toLowerCase();
            if ( name === my._db.TIME_LABEL ) {
                return my._error( fn + "Event label '" + my._db.TIME_LABEL + "' is reserved" );
            }
            if ( nlist.hasOwnProperty( name ) ) {
                return my._error( fn + "Duplicate event '" + name + "' @ argument " + i );
            }
            nlist[ name ] = true; // remember this event name
            nxt = i + 1;
            if ( nxt >= args ) {
                return my._error( fn + "Missing value for event '" + name + "'" );
            }
            elist.push( name );
            val = arguments[ nxt ];
            type = my._typeOf( val );
            if ( ( type !== "number" ) && ( type !== "string" ) && ( val !== true ) &&
                ( val !== false ) && ( val !== null ) ) {
                return my._error( fn + "Illegal value type for event '" + name + "'" );
            }
            elist.push( val );
            i += 2;
        }

        return my._db.event( id, elist );
    };

    // PS.dbData( id )
    // Returns database object
    // id : string = case-insenstive database id
    // Returns object on success, else PS.ERROR

    my.PSInterface.prototype.dbData = function ( id ) {
        var fn, args;

        fn = "[PS.dbData] ";
        args = arguments.length;
        if ( args < 1 ) {
            return my._error( fn + "Missing argument" );
        }
        if ( args > 1 ) {
            return my._error( fn + "Too many arguments" );
        }
        if ( ( typeof id !== "string" ) || ( id.length < 1 ) ) {
            return my._error( fn + "Database id invalid" );
        }
        id = id.toLowerCase();
        if ( !my._db.validID( id ) ) {
            return my._error( fn + "Database id '" + id + "' does not exist" );
        }

        return my._db.store[ id ];
    };

    // PS.dbShow( id )
    // Shows graph of database
    // id : string = case-insenstive database id
    // (optional) options : string | object = label for y axis, or Dygraph options
    // Returns id on success, else PS.ERROR

    my.PSInterface.prototype.dbShow = function ( id, options ) {
        var fn, args, type, opt, str, dg;

        fn = "[PS.dbShow] ";
        args = arguments.length;
        if ( args < 1 ) {
            return my._error( fn + "Missing argument(s)" );
        }
        if ( args > 2 ) {
            return my._error( fn + "Too many arguments" );
        }
        if ( ( typeof id !== "string" ) || ( id.length < 1 ) ) {
            return my._error( fn + "Database id invalid" );
        }
        id = id.toLowerCase();
        if ( !my._db.validID( id ) ) {
            return my._error( fn + "Database id '" + id + "' does not exist" );
        }

        if ( args === 2 )
        {
            type = my._typeOf( options );
            if ( type === "string" )
            {
                opt = { xlabel : "Time", ylabel : options };
            }
            else if ( type === "object" )
            {
                opt = options;
            }
            else
            {
                return my._error( fn + "Invalid options parameter" );
            }
        }
        else
        {
            opt = { xlabel : "Time", ylabel : "Data" };
        }

        str = my._db.csv( fn, id );
        if ( str === PS.ERROR )
        {
            return str;
        }
        my._graph.style.display = "block";
        try
        {
            dg = new Dygraph( my._graph, str, opt );
        }
        catch ( err )
        {
            my._graph.style.display = "none";
            return my._errorCatch( fn + "Dygraph display error [" + err.message + "]", err );
        }
        my._graphing = id;
        return id;
    };

    // PS.dbHide( id )
    // Hides graph of database
    // id : string = case-insenstive database id
    // Returns id on success, else PS.ERROR

    my.PSInterface.prototype.dbHide = function () {
        var fn;

        fn = "[PS.dbHide] ";
        if ( arguments.length > 1 ) {
            return my._error( fn + "Too many arguments" );
        }
        my._graph.style.display = "none";
        my._graphing = null;
        return PS.DONE;
    };

    // PS.dbDump( id )
    // Dumps database to debugger as csv
    // id : string = case-insenstive database id
    // Returns id on success, else PS.ERROR

    my.PSInterface.prototype.dbDump = function ( id ) {
        var fn, args, str;

        fn = "[PS.dbDump] ";
        args = arguments.length;
        if ( args < 1 ) {
            return _error( fn + "Missing argument" );
        }
        if ( args > 1 ) {
            return _error( fn + "Too many arguments" );
        }
        if ( ( typeof id !== "string" ) || ( id.length < 1 ) ) {
            return _error( fn + "Database id invalid" );
        }
        id = id.toLowerCase();
        if ( !my._db.validID( id ) ) {
            return my._error( fn + "Database id '" + id + "' does not exist" );
        }

        str = my._db.csv( fn, id );
        if ( str === PS.ERROR )
        {
            return str;
        }
        my.interface.debug( str );
        return id;
    };

    // PS.dbSend( id, uname )
    // Sends database to user
    // id : string = case-insenstive database id
    // uname : string = case-insensitive username
    // Returns id on success, else PS.ERROR

    my.PSInterface.prototype.dbSend = function ( id, uname ) {
        var fn, args;

        fn = "[PS.dbSend] ";
        args = arguments.length;
        if ( args < 2 ) {
            return my._error( fn + "Missing argument(s)" );
        }
        if ( args > 2 ) {
            return my._error( fn + "Too many arguments" );
        }
        if ( ( typeof id !== "string" ) || ( id.length < 1 ) ) {
            return my._error( fn + "Database id invalid" );
        }
        id = id.toLowerCase();
        if ( !my._db.validID( id ) ) {
            return my._error( fn + "Database id '" + id + "' does not exist" );
        }
        if ( ( typeof uname !== "string" ) || ( uname.length < 1 ) ) {
            return my._error( fn + "Username invalid" );
        }
        uname = uname.toLowerCase();
        if ( !my._db.validUser( uname ) ) {
            return my._error( fn + "Username '" + id + "' not recognized" );
        }

        return my._db.send( fn, id, uname );
    };

    return my;
};

// Register with global PERLENSPIEL manager
PERLENSPIEL.RegisterModule(PerlenspielDB);
