// path.js
// The following comments are for JSLint

/*jslint nomen: true, white: true, vars: true */
/*global document, window, screen, console, Image, AQ */

PS = ( function ( ps )
{
	"use strict";

	var _sys = ps._sys = ps._sys || {}; // establish _sys

	var _DIAGONAL_COST = 1.4142; // square root of 2; for pathfinder

	var _pathmaps; // array of pathmaps
	var _pathmapCnt; // counter for pathmap ids

	//---------------------------
	// BINARY HEAP FOR PATHFINDER
	//---------------------------

	// Based on code by Marijn Haverbeke
	// http://eloquentjavascript.net/appendix2.html

	function BinaryHeap ( scoreFunction )
	{
		this.content = [];
		this.scoreFunction = scoreFunction;
	}

	BinaryHeap.prototype =
	{
		push : function ( element )
		{
			// Add the new element to the end of the array

			this.content.push( element );

			// Allow it to bubble up

			this.bubbleUp( this.content.length - 1 );
		},

		pop : function ()
		{
			var result, end;

			// Store the first element so we can return it later.

			result = this.content[ 0 ];

			// Get the element at the end of the array.

			end = this.content.pop();

			// If there are any elements left, put the end element at the
			// start, and let it sink down.

			if ( this.content.length > 0 )
			{
				this.content[ 0 ] = end;
				this.sinkDown( 0 );
			}
			return result;
		},

		remove : function ( node )
		{
			var len, i, end;

			len = this.content.length;

			// To remove a value, we must search through the array to find it

			for ( i = 0; i < len; i += 1 )
			{
				if ( this.content[i] === node )
				{
					// When it is found, the process seen in 'pop' is repeated to fill up the hole

					end = this.content.pop();

					// If the element we popped was the one we needed to remove, we're done

					if ( i !== ( len - 1 ) )
					{
						// Otherwise, we replace the removed element with the popped one, and allow it to float up or sink down as appropriate

						this.content[ i ] = end;
						this.bubbleUp( i );
						this.sinkDown( i );
					}
					break;
				}
			}
		},

		size : function ()
		{
			var len;

			len = this.content.length;
			return len;
		},

		bubbleUp : function ( n )
		{
			var element, score, parentN, parent;

			// Fetch the element that has to be moved

			element = this.content[ n ];
			score = this.scoreFunction( element );

			// When at 0, an element can not go up any further

			while ( n > 0 )
			{
				// Compute the parent element's index, and fetch it

				parentN = Math.floor( ( n + 1 ) / 2 ) - 1;
				parent = this.content[ parentN ];

				// If the parent has a lesser score, things are in order and we are done

				if ( score >= this.scoreFunction( parent ) )
				{
					break;
				}

				// Otherwise, swap the parent with the current element and continue

				this.content[ parentN ] = element;
				this.content[ n ] = parent;
				n = parentN;
			}
		},

		sinkDown : function ( n )
		{
			var len, element, elemScore, child1N, child2N, swap, child1, child1Score, child2, child2Score;

			// Look up the target element and its score

			len = this.content.length;
			element = this.content[ n ];
			elemScore = this.scoreFunction( element );

			while ( true )
			{
				// Compute the indices of the child elements

				child2N = ( n + 1 ) * 2;
				child1N = child2N - 1;

				// This is used to store the new position of the element, if any

				swap = null;

				// If the first child exists (is inside the array)...

				if ( child1N < len )
				{
					// Look it up and compute its score

					child1 = this.content[ child1N ];
					child1Score = this.scoreFunction( child1 );

					// If the score is less than our element's, we need to swap

					if ( child1Score < elemScore )
					{
						swap = child1N;
					}
				}

				// Do the same checks for the other child

				if ( child2N < len )
				{
					child2 = this.content[ child2N ];
					child2Score = this.scoreFunction( child2 );

					if ( child2Score < ( swap === null ? elemScore : child1Score ) )
					{
						swap = child2N;
					}
				}

				// No need to swap further, we are done

				if ( swap === null )
				{
					break;
				}

				// Otherwise, swap and continue

				this.content[ n ] = this.content[ swap ];
				this.content[ swap ] = element;
				n = swap;
			}
		},

		rescore : function ( e )
		{
			this.sinkDown( this.content.indexOf( e ) );
		}
	};

	_sys.path = {
		// METHODS

		init : function ()
		{
			_pathmaps = [];
			_pathmapCnt = 0;
		}
	};

	// Returns a straight line between x1|y1 and x2|y2

	function _line ( x1, y1, x2, y2 )
	{
		var dx, dy, sx, sy, err, e2, line;

		if ( x2 > x1 )
		{
			dx = x2 - x1;
		}
		else
		{
			dx = x1 - x2;
		}

		if ( y2 > y1 )
		{
			dy = y2 - y1;
		}
		else
		{
			dy = y1 - y2;
		}

		if ( x1 < x2 )
		{
			sx = 1;
		}
		else
		{
			sx = -1;
		}

		if ( y1 < y2 )
		{
			sy = 1;
		}
		else
		{
			sy = -1;
		}

		err = dx - dy;

		line = [ ];

		while ( ( x1 !== x2 ) || ( y1 !== y2 ) )
		{
			e2 = err * 2;
			if ( e2 > -dy )
			{
				err -= dy;
				x1 += sx;
			}
			if ( ( x1 === x2 ) && ( y1 === y2 ) )
			{
				line.push( [ x1, y1 ] );
				break;
			}
			if ( e2 < dx )
			{
				err += dx;
				y1 += sy;
			}
			line.push( [ x1, y1 ] );
		}

		return line;
	}

	//	Returns a straight line between x1|y1 and x2|y2, or null if wall blocks path
	// If [corner] = true, stops if line will cut across a wall corner

	function _lineWall ( nodes, width, x1, y1, x2, y2 )
	{
		var dx, dy, sx, sy, err, e2, line, node, ptr;

		if ( x2 > x1 )
		{
			dx = x2 - x1;
		}
		else
		{
			dx = x1 - x2;
		}

		if ( y2 > y1 )
		{
			dy = y2 - y1;
		}
		else
		{
			dy = y1 - y2;
		}

		if ( x1 < x2 )
		{
			sx = 1;
		}
		else
		{
			sx = -1;
		}

		if ( y1 < y2 )
		{
			sy = 1;
		}
		else
		{
			sy = -1;
		}

		err = dx - dy;
		line = [ ];

		while ( ( x1 !== x2 ) || ( y1 !== y2 ) )
		{
			e2 = err * 2;
			if ( e2 > -dy )// moving left/right
			{
				err -= dy;
				x1 += sx;
			}
			if ( ( x1 === x2 ) && ( y1 === y2 ) )
			{
				line.push( [ x1, y1 ] );
				// we already know dest is walkable
				return line;
			}
			if ( e2 < dx )// moving up/down
			{
				err += dx;
				y1 += sy;
			}

			// Is this loc walkable?

			ptr = ( y1 * width ) + x1;
			node = nodes[ ptr ];
			if ( !node.value ) // no; we're done
			{
				return null;
			}
			line.push( [ x1, y1 ] );
		}

		return line;
	}

	// _heuristic ( x1, y1, x2, y2 )

	function _heuristic ( x1, y1, x2, y2 )
	{
		var dx, dy, h;

		if ( x2 > x1 )
		{
			dx = x2 - x1;
		}
		else
		{
			dx = x1 - x2;
		}

		if ( y2 > y1 )
		{
			dy = y2 - y1;
		}
		else
		{
			dy = y1 - y2;
		}

		if ( dx > dy )
		{
			h = ( dy * _DIAGONAL_COST ) + ( dx - dy );
		}
		else
		{
			h = ( dx * _DIAGONAL_COST ) + ( dy - dx );
		}
		return h;
	}

	// _neighbors ( nodes, width, height, current )
	// Creates an array of all neighbor nodes
	// Stays inside grid and avoids walls
	// If [no_diagonals] = true, diagonals are not searched
	// If [cut_corners] = true, diagonal cutting around corners is enabled
	// Some of these calcs could be done when creating the nodes ...

	function _neighbors ( nodes, width, height, current, no_diagonals, cut_corners )
	{
		var result, x, y, right, bottom, north, south, center, nx, ptr, node, nwall, swall, ewall, wwall;

		result = [];
		x = current.x;
		y = current.y;
		right = width - 1;
		bottom = height - 1;
		center = y * width;
		north = ( y - 1 ) * width;
		south = ( y + 1 ) * width;
		nwall = false;
		swall = false;
		ewall = false;
		wwall = false;

		if ( x > 0 )
		{
			nx = x - 1;

			// west

			ptr = center + nx;
			node = nodes[ ptr ];
			if ( !node.value )
			{
				wwall = true;
			}
			else if ( !node.closed )
			{
				node.cost = node.value;
				result.push( node );
			}
		}

		if ( x < right )
		{
			nx = x + 1;

			// east

			ptr = center + nx;
			node = nodes[ ptr ];
			if ( !node.value )
			{
				ewall = true;
			}
			else if ( !node.closed )
			{
				node.cost = node.value;
				result.push( node );
			}
		}

		if ( y > 0 )
		{
			// north

			ptr = north + x;
			node = nodes[ ptr ];
			if ( !node.value )
			{
				nwall = true;
			}
			else if ( !node.closed )
			{
				node.cost = node.value;
				result.push( node );
			}
		}

		if ( y < bottom )
		{
			// south

			ptr = south + x;
			node = nodes[ ptr ];
			if ( !node.value )
			{
				swall = true;
			}
			else if ( !node.closed )
			{
				node.cost = node.value;
				result.push( node );
			}
		}

		if ( !no_diagonals )
		{
			if ( x > 0 )
			{
				nx = x - 1;
				if ( ( y > 0 ) && ( cut_corners || ( !wwall && !nwall ) ) )
				{
					// northwest

					ptr = north + nx;
					node = nodes[ ptr ];
					if ( node.value && !node.closed )
					{
						node.cost = node.value * _DIAGONAL_COST;
						result.push( node );
					}
				}
				if ( ( y < bottom ) && ( cut_corners || ( !wwall && !swall ) ) )
				{
					// southwest

					ptr = south + nx;
					node = nodes[ ptr ];
					if ( node.value && !node.closed )
					{
						node.cost = node.value * _DIAGONAL_COST;
						result.push( node );
					}
				}
			}
			if ( x < right )
			{
				nx = x + 1;
				if ( ( y > 0 ) && ( cut_corners || ( !nwall && !ewall ) ) )
				{
					// northeast

					ptr = north + nx;
					node = nodes[ ptr ];
					if ( node.value && !node.closed )
					{
						node.cost = node.value * _DIAGONAL_COST;
						result.push( node );
					}
				}
				if ( ( y < bottom ) && ( cut_corners || ( !swall && !ewall ) ) )
				{
					// southeast

					ptr = south + nx;
					node = nodes[ ptr ];
					if ( node.value && !node.closed )
					{
						node.cost = node.value * _DIAGONAL_COST;
						result.push( node );
					}
				}
			}
		}

		return result;
	}

	// _score ( node )
	// Scoring function for nodes

	function _score ( node )
	{
		return node.f;
	}

	// _findPath ( pm, x1, y1, x2, y2, no_diagonals, cut_corners )
	// Returns an array of x/y coordinates

	function _findPath ( pm, x1, y1, x2, y2, no_diagonals, cut_corners )
	{
		var width, height, nodes, ptr, node, path, len, heap, current, neighbors, nlen, i, n, gScore, beenVisited, here;

		// If current loc is same as dest, return empty path

		if ( ( x1 === x2 ) && ( y1 === y2 ) )
		{
			return [];
		}

		width = pm.width;
		height = pm.height;
		nodes = pm.nodes;

		// If either location is in a wall, return empty path

		ptr = ( y1 * width ) + x1;
		node = nodes[ ptr ];
		if ( !node.value )
		{
			return [];
		}

		ptr = ( y2 * width ) + x2;
		node = nodes[ ptr ];
		if ( !node.value )
		{
			return [];
		}

		// Check if a straight line works

		if ( !no_diagonals )
		{
			path = _lineWall( nodes, width, x1, y1, x2, y2 );
			if ( path )
			{
				return path;
			}
		}

		// Reset all nodes

		len = nodes.length;
		for ( i = 0; i < len; i += 1 )
		{
			node = nodes[ i ];
			node.f = 0;
			node.g = 0;
			node.h = 0;
			node.cost = 0;
			node.closed = false;
			node.visited = false;
			node.parent = null;
		}

		path = [];

		// Init open node list

		heap = new BinaryHeap( _score );

		// Init with starting node

		ptr = ( y1 * width ) + x1;
		node = nodes[ ptr ];
		heap.push( node );

		// Main loop

		while ( heap.size() > 0 )
		{
			current = heap.pop();

			if ( ( current.x === x2 ) && ( current.y === y2 ) )
			{
				// create path

				here = current;
				while ( here.parent )
				{
					path.push( [ here.x, here.y ] );
					here = here.parent;
				}
				path.reverse();
				break;
			}

			current.closed = true;

			neighbors = _neighbors( nodes, width, height, current, no_diagonals, cut_corners );

			nlen = neighbors.length;
			for ( i = 0; i < nlen; i += 1 )
			{
				n = neighbors[ i ];

				// The g score is the shortest distance from start to current node
				// We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet

				gScore = current.g + n.cost;

				beenVisited = n.visited;

				if ( !beenVisited || ( gScore < n.g ) )
				{
					// Found an optimal (so far) path to this node
					// Take score for node to see how good it is

					n.visited = true;
					n.parent = current;
					n.h = n.h || _heuristic( n.x, n.y, x2, y2 );
					n.g = gScore;
					n.f = n.g + n.h;

					if ( !beenVisited )
					{
						heap.push( n ); // Pushing to heap will put it in proper place based on 'f' value
					}
					else
					{
						heap.rescore( n ); // Already seen node, but rescored so reorder it in heap
					}
				}
			}
		}

		return path;
	}

	// _pathData ( pm, left, top, width, height, data )
	// If [data] = PS.CURRENT, no data changed
	// If [data] = PS.DEFAULT, revert to original value
	// Else change pathmap value to [data]
	// Returns array of data at each point in region

	function _pathData ( pm, left, top, width, height, data )
	{
		var result, nodes, bottom, ptr, x, y, i, node;

		result = [];
		result.length = width * height;

		nodes = pm.nodes;
		bottom = top + height;

		i = 0; // output index

		for ( y = top; y < bottom; y += 1 )
		{
			ptr = ( y * pm.width ) + left; // point to first node in row
			for ( x = 0; x < width; x += 1 )
			{
				node = nodes[ ptr ];
				if ( data !== PS.CURRENT ) // just get current value
				{
					if ( data === PS.DEFAULT )
					{
						node.value = node.ovalue; // restore original value
					}
					else
					{
						node.value = data; // use new value
					}
				}
				result[ i ] = node.value;
				i += 1;
				ptr += 1;
			}
		}

		return result;
	}

	// _newMap ( width, height, data )
	// Creates a new pathmap object and returns its id
	// [data] should be a 1-dimensional numeric array with [width] * [height] elements
	// 0 elements are walls, non-zero elements are floor (relative value determines weighting)

	function _newMap ( width, height, data )
	{
		var nodes, len, ptr, x, y, node, val, pm;

		// Initialize node structure

		len = data.length;

		nodes = [];
		nodes.length = len;

		ptr = 0;
		for ( y = 0; y < height; y += 1 )
		{
			for ( x = 0; x < width; x += 1 )
			{
				val = data[ ptr ];
				node = {
					x : x,
					y : y,
					value : val,
					ovalue : val,
					f : 0,
					g : 0,
					h : 0,
					cost : 0,
					parent : null,
					closed : false,
					visited : false
				};
				nodes[ ptr ] = node;
				ptr += 1;
			}
		}

		pm = {
			id : _PATHMAP_PREFIX + _pathmapCnt,
			width : width,
			height : height,
			nodes : nodes
		};

		_pathmapCnt += 1;
		_pathmaps.push( pm );

		return pm;
	}

	// _getMap( id )
	// Returns pathmap matching [id], null if none found

	function _getMap ( pathmap )
	{
		var len, i, pm;

		len = _pathmaps.length;
		for ( i = 0; i < len; i += 1 )
		{
			pm = _pathmaps[ i ];
			if ( pm.id === pathmap )
			{
				return pm;
			}
		}
		return null;
	}

	// _deleteMap( id )
	// Deletes [pathmap], returns true if deleted or false if path not found

	function _deleteMap ( pathmap )
	{
		var len, i, pm, nodes, j;

		len = _pathmaps.length;
		for ( i = 0; i < len; i += 1 )
		{
			pm = _pathmaps[ i ];
			if ( pm.id === pathmap )
			{
				// Explcitly nuke each node to help garbage collector

				nodes = pm.nodes;
				len = nodes.length;
				for ( j = 0; j < len; j += 1 )
				{
					nodes[ j ] = null;
				}
				pm.nodes = null; // nuke the array too

				_pathmaps.splice( i, 1 );
				return true;
			}
		}
		return false;
	}

	// Find closest walkable point in source direction
	// [x1|y1] is current, [x2|y2] is clicked location

	function _pathNear ( pm, x1, y1, x2, y2 )
	{
		var nodes, width, height, level, nlist, left, top, right, bottom, start, end, ptr, i, node, len, min, j, cnt, pos;

		nodes = pm.nodes;
		width = pm.width;
		height = pm.height;

		level = 1;
		while ( level < width )
		{
			nlist = [];

			left = x2 - level;
			right = x2 + level;
			top = y2 - level;
			bottom = y2 + level;

			// top/bottom sides

			start = left;
			if ( start < 0 )
			{
				start = 0;
			}
			end = right + 1;
			if ( end >= width )
			{
				end = width;
			}

			// top

			if ( top >= 0 )
			{
				ptr = ( top * width ) + start;
				for ( i = start; i < end; i += 1 )
				{
					node = nodes[ ptr ];
					if ( node.value )
					{
						nlist.push( [ node.x, node.y ] );
					}
					ptr += 1;
				}
			}

			// bottom

			if ( bottom < height )
			{
				ptr = ( bottom * width ) + start;
				for ( i = start; i < end; i += 1 )
				{
					node = nodes[ ptr ];
					if ( node.value )
					{
						nlist.push( [ node.x, node.y ] );
					}
					ptr += 1;
				}
			}

			// left/right sides

			start = top + 1;
			if ( start < 0 )
			{
				start = 0;
			}
			end = bottom;
			if ( end >= height )
			{
				end = height;
			}

			// left

			if ( left >= 0 )
			{
				ptr = ( start * width ) + left;
				for ( i = start; i < end; i += 1 )
				{
					node = nodes[ ptr ];
					if ( node.value )
					{
						nlist.push( [ node.x, node.y ] );
					}
					ptr += width;
				}
			}

			// right

			if ( right < width )
			{
				ptr = ( start * width ) + right;
				for ( i = start; i < end; i += 1 )
				{
					node = nodes[ ptr ];
					if ( node.value )
					{
						nlist.push( [ node.x, node.y ] );
					}
					ptr += width;
				}
			}

			len = nlist.length;
			if ( len )
			{
				if ( len === 1 )
				{
					return nlist[ 0 ];
				}
				min = width + height;
				for ( i = 0; i < len; i += 1 )
				{
					pos = nlist[ i ];
					cnt = _heuristic( x1, y1, pos[0], pos[1] );
					if ( cnt < min )
					{
						min = cnt;
						j = i;
					}
				}
				return nlist[ j ];
			}

			level += 1;
		}

		return [x1, y1];
	}

	// PUBLIC API

	ps.line = function ( x1_p, y1_p, x2_p, y2_p )
	{
		var fn, args, x1, y1, x2, y2, path;

		fn = "[PS.line] ";

		args = arguments.length;
		if ( args < 4 )
		{
			return _sys.error( fn + "Missing argument(s)" );
		}
		if ( args > 4 )
		{
			return _sys.error( fn + "Too many arguments" );
		}

		// Prevent arg mutation

		x1 = x1_p;
		y1 = y1_p;
		x2 = x2_p;
		y2 = y2_p;

		// Check x1

		if ( _sys.typeOf( x1 ) === "number" )
		{
			x1 = Math.floor( x1 );
		}
		else
		{
			return _sys.error( fn + "x1 argument not a number" );
		}

		// Check y1

		if ( _sys.typeOf( y1 ) === "number" )
		{
			y1 = Math.floor( y1 );
		}
		else
		{
			return _sys.error( fn + "y1 argument not a number" );
		}

		// Check x2

		if ( _sys.typeOf( x2 ) === "number" )
		{
			x2 = Math.floor( x2 );
		}
		else
		{
			return _sys.error( fn + "x2 argument not a number" );
		}

		// Check y2

		if ( _sys.typeOf( y2 ) === "number" )
		{
			y2 = Math.floor( y2 );
		}
		else
		{
			return _sys.error( fn + "y2 argument not a number" );
		}

		path = _line( x1, y1, x2, y2 );
		return path;
	};

	// PS.pathMap ( image )
	// Takes an image and returns a pathmap id for PS.pathFind()

	ps.pathMap = function ( image )
	{
		var fn, args, pm;

		fn = "[PS.pathMap] ";

		args = arguments.length;
		if ( args < 1 )
		{
			return _sys.error( fn + "Missing argument(s)" );
		}
		if ( args > 1 )
		{
			return _sys.error( fn + "Too many arguments" );
		}

		// Check image

		if ( _sys.image.valid( fn, image ) === PS.ERROR )
		{
			return PS.ERROR;
		}

		if ( image.pixelSize !== 1 )
		{
			return _sys.error( fn + "image is not format 1" );
		}

		pm = _newMap( image.width, image.height, image.data );

		return pm.id;
	};

	// PS.pathFind : function ( pathmap, x1, y1, x2, y2 )
	// Takes pathmap id, start and end coordinates
	// Returns an array of [ x, y ] pairs representing path points

	ps.pathFind = function ( pathmap_p, x1_p, y1_p, x2_p, y2_p, options_p )
	{
		var fn, args, pathmap, x1, y1, x2, y2, options, pm, type, path, val, no_diagonals, cut_corners;

		fn = "[PS.pathFind] ";

		args = arguments.length;
		if ( args < 5 )
		{
			return _sys.error( fn + "Missing argument(s)" );
		}
		if ( args > 6 )
		{
			return _sys.error( fn + "Too many arguments" );
		}

		// Prevent arg mutation

		pathmap = pathmap_p;
		x1 = x1_p;
		y1 = y1_p;
		x2 = x2_p;
		y2 = y2_p;
		options = options_p;

		// Check id

		if ( ( typeof pathmap !== "string" ) || ( pathmap.length < 1 ) )
		{
			return _sys.error( fn + "pathmap argument invalid" );
		}

		pm = _getMap( pathmap );
		if ( !pm )
		{
			return _sys.error( fn + pathmap + " not found" );
		}

		// Check x1

		if ( _sys.typeOf( x1 ) === "number" )
		{
			x1 = Math.floor( x1 );
			if ( ( x1 < 0 ) || ( x1 >= pm.width ) )
			{
				return _sys.error( fn + "x1 argument is outside " + pathmap );
			}
		}
		else
		{
			return _sys.error( fn + "x1 argument not a number" );
		}

		// Check y1

		if ( _sys.typeOf( y1 ) === "number" )
		{
			y1 = Math.floor( y1 );
			if ( ( y1 < 0 ) || ( y1 >= pm.height ) )
			{
				return _sys.error( fn + "y1 argument is outside " + pathmap );
			}
		}
		else
		{
			return _sys.error( fn + "y1 argument not a number" );
		}

		// Check x2

		if ( _sys.typeOf( x2 ) === "number" )
		{
			x2 = Math.floor( x2 );
			if ( ( x2 < 0 ) || ( x2 >= pm.width ) )
			{
				return _sys.error( fn + "x2 argument is outside " + pathmap );
			}
		}
		else
		{
			return _sys.error( fn + "x2 argument not a number" );
		}

		// Check y2

		if ( _sys.typeOf( y2 ) === "number" )
		{
			y2 = Math.floor( y2 );
			if ( ( y2 < 0 ) || ( y2 >= pm.height ) )
			{
				return _sys.error( fn + "y2 argument is outside " + pathmap );
			}
		}
		else
		{
			return _sys.error( fn + "y2 argument not a number" );
		}

		// Assume default options

		no_diagonals = false;
		cut_corners = false;

		// Check options

		type = _sys.typeOf( options );
		if ( ( type !== "undefined" ) && ( options !== PS.DEFAULT ) )
		{
			if ( type !== "object" )
			{
				return _sys.error( fn + "options argument invalid" );
			}

			// Check .no_diagonals

			val = options.no_diagonals;
			if ( ( val === true ) || ( val === false ) )
			{
				no_diagonals = val;
			}
			else
			{
				type = _sys.typeOf( val );
				if ( ( type === "undefined" ) || ( val === PS.DEFAULT ) )
				{
					no_diagonals = false;
				}
				else if ( type === "number" )
				{
					if ( val )
					{
						no_diagonals = false;
					}
					else
					{
						no_diagonals = true;
					}
				}
				else
				{
					return _sys.error( fn + "options.no_diagonals invalid" );
				}
			}

			// Check .cut_corners

			val = options.cut_corners;
			if ( ( val === true ) || ( val === false ) )
			{
				cut_corners = val;
			}
			else
			{
				type = _sys.typeOf( val );
				if ( ( type === "undefined" ) || ( val === PS.DEFAULT ) )
				{
					cut_corners = false;
				}
				else if ( type === "number" )
				{
					if ( val )
					{
						cut_corners = false;
					}
					else
					{
						cut_corners = true;
					}
				}
				else
				{
					return _sys.error( fn + "options.cut_corners invalid" );
				}
			}
		}

		path = _findPath( pm, x1, y1, x2, y2, no_diagonals, cut_corners );
		return path;
	};

	// PS.pathData : function ( id, left, top, width, height, data )
	// Takes pathmap id and region coordinates, sets/inspects using data
	// Returns an array of data at coordinates

	ps.pathData = function ( pathmap_p, left_p, top_p, width_p, height_p, data_p )
	{
		var fn, args, pathmap, left, top, width, height, data, pm, max, type, result;

		fn = "[PS.pathData] ";

		args = arguments.length;
		if ( args < 5 )
		{
			return _sys.error( fn + "Missing argument(s)" );
		}
		if ( args > 6 )
		{
			return _sys.error( fn + "Too many arguments" );
		}

		// Prevent arg mutation

		pathmap = pathmap_p;
		left = left_p;
		top = top_p;
		width = width_p;
		height = height_p;
		data = data_p;

		// Check id

		if ( ( typeof pathmap !== "string" ) || ( pathmap.length < 1 ) )
		{
			return _sys.error( fn + "pathmap argument invalid" );
		}

		pm = _getMap( pathmap );
		if ( !pm )
		{
			return _sys.error( fn + pathmap + " not found" );
		}

		// Check left

		if ( _sys.typeOf( left ) === "number" )
		{
			left = Math.floor( left );
			if ( ( left < 0 ) || ( left >= pm.width ) )
			{
				return _sys.error( fn + "left argument is outside " + pathmap );
			}
		}
		else
		{
			return _sys.error( fn + "left argument not a number" );
		}

		// Check top

		if ( _sys.typeOf( top ) === "number" )
		{
			top = Math.floor( top );
			if ( ( top < 0 ) || ( top >= pm.height ) )
			{
				return _sys.error( fn + "top argument is outside " + pathmap );
			}
		}
		else
		{
			return _sys.error( fn + "top argument not a number" );
		}

		// Check width

		if ( width === PS.DEFAULT )
		{
			width = 1;
		}
		else if ( _sys.typeOf( width ) === "number" )
		{
			width = Math.floor( width );
			if ( width < 1 )
			{
				width = 1;
			}
			else
			{
				max = pm.width - left;
				if ( width > max )
				{
					width = max;
				}
			}
		}
		else
		{
			return _sys.error( fn + "width argument not a number" );
		}

		// Check height

		if ( height === PS.DEFAULT )
		{
			height = 1;
		}
		else if ( _sys.typeOf( height ) === "number" )
		{
			height = Math.floor( height );
			if ( height < 1 )
			{
				height = 1;
			}
			else
			{
				max = pm.height - top;
				if ( height > max )
				{
					height = max;
				}
			}
		}
		else
		{
			return _sys.error( fn + "height argument not a number" );
		}

		// Check data

		if ( ( data !== PS.DEFAULT ) && ( data !== PS.CURRENT ) )
		{
			type = _sys.typeOf( data );
			if ( type === "undefined" )
			{
				data = PS.CURRENT;
			}
			else if ( type === "number" )
			{
				if ( data < 0 )
				{
					return _error( fn + "data argument < 0" );
				}
			}
			else
			{
				return _sys.error( fn + "data argument not a number" );
			}
		}

		result = _pathData( pm, left, top, width, height, data );
		return result;
	};

	// PS.pathDelete: function ( pathmap )
	// Deletes pathmap
	// Returns PS.DONE or PS.ERROR

	ps.pathDelete = function ( pathmap )
	{
		var fn, args;

		fn = "[PS.pathDelete] ";

		args = arguments.length;
		if ( args < 1 )
		{
			return _sys.error( fn + "Missing argument" );
		}

		// Check pathmap id

		if ( ( typeof pathmap !== "string" ) || ( pathmap.length < 1 ) )
		{
			return _sys.error( fn + "pathmap argument invalid" );
		}

		if ( !_deleteMap( pathmap ) )
		{
			return _sys.error( fn + pathmap + " not found" );
		}

		return PS.DONE;
	};

	ps.pathNear = function ( pathmap, x1, y1, x2, y2 )
	{
		var fn, args, pm, result;

		fn = "[PS.pathNear] ";

		args = arguments.length;
		if ( args < 5 )
		{
			return _sys.error( fn + "Missing argument(s)" );
		}
		if ( args > 5 )
		{
			return _sys.error( fn + "Too many arguments" );
		}

		// Check pathmap id

		if ( ( typeof pathmap !== "string" ) || ( pathmap.length < 1 ) )
		{
			return _sys.error( fn + "pathmap argument invalid" );
		}

		pm = _getMap( pathmap );
		if ( !pm )
		{
			return _sys.error( fn + pathmap + " not found" );
		}

		result = _pathNear( pm, x1, y1, x2, y2 );
		return result;
	};

	return ps;
} ( PS ) );
