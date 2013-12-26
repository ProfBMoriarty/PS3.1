// Quadacity by Wyatt Gray and Jeffrey Thomas
// Adapted to Perlenspiel 3.1 by Professor Moriarty
// The following comment lines are for JSLint. Don't remove them!

/*jslint nomen: true, white: true */
/*global PS */

var MATCH = {};

MATCH.gridY = 13;
MATCH.gridX = 11;
MATCH.mouse_data = 0;

//Data structure to handle the levels

MATCH.level = [];

/*
 * LEVEL FORMAT
 *
 * Squares are located as follows:
 * 0 | 1
 * 2 | 3
 *
 *
 * MATCH.level[x] = [position, color, locked, link]
 * position: The square-coordinates of the bead, as shown below:
 *
 * 0 | 1 | 2 | 3
 * 4 | 5 | 6 | 7
 * 8 | 9 | 10| 11
 * 12| 13| 14| 15
 *
 * color: The index of the color of the block, colors are found in MATCH.block_colors
 * locked: Whether or not this block is movement-locked (0 for false, 1 for true)
 *
 * Format of links: [link_color, [link_position, square], [link_position, square], ...]]
 * link_color: the index of the color of the link
 * link_position: The position of another bead in the link in square coordinates
 * square: The square the other bead is located in
 *
 */

//Format of links: [1, [9, 3]]]
//1 = the color of the link
// [9, 3]: First number is square coordinate, second number is square number

MATCH.level[0] = [];
MATCH.level[0][0] = [[5, 0, 0, -1], [11, 0, 0, -1], [14, 0, 0, -1], [15, 0, 0, -1]];
MATCH.level[0][1] = [[10, 0, 0, -1], [11, 0, 0, -1], [14, 0, 0, -1], [15, 0, 0, -1]];
MATCH.level[0][2] = [[10, 0, 0, -1], [11, 0, 0, -1], [14, 0, 0, -1], [15, 0, 0, -1]];
MATCH.level[0][3] = [[10, 0, 0, -1], [11, 0, 0, -1], [14, 0, 0, -1], [15, 0, 0, -1]];

/*MATCH.level[1] = [];
MATCH.level[1][0] = [[1, 0, 0, -1], [5, 0, 0, -1], [11, 0, 0, -1], [15, 0, 0, -1]];
MATCH.level[1][1] = [[0, 0, 0, -1], [4, 0, 0, -1], [10, 0, 0, -1], [14, 0, 0, -1]];
MATCH.level[1][2] = [[1, 0, 0, -1], [5, 0, 0, -1], [11, 0, 0, -1], [13, 0, 0, -1]];
MATCH.level[1][3] = [[1, 0, 0, -1], [4, 0, 0, -1], [10, 0, 0, -1], [14, 0, 0, -1]];*/

MATCH.level[1] = [];
MATCH.level[1][0] = [[0, 5, 0, -1], [1, 5, 0, -1], [2, 5, 0, -1], [3, 5, 0, -1], [4, 5, 0, -1], [7, 5, 0, -1], [8, 5, 0, -1], [11, 5, 0, -1], [12, 5, 0, -1], [13, 5, 0, -1], [14, 5, 0, -1], [15, 5, 0, -1]];
MATCH.level[1][1] = [[0, 5, 0, -1], [1, 5, 0, -1], [2, 5, 0, -1], [3, 5, 0, -1], [4, 5, 0, -1], [7, 5, 0, -1], [8, 5, 0, -1], [11, 5, 0, -1], [12, 5, 0, -1], [13, 5, 0, -1], [14, 5, 0, -1], [10, 5, 0, -1]];
MATCH.level[1][2] = [[0, 5, 0, -1], [1, 5, 0, -1], [2, 5, 0, -1], [3, 5, 0, -1], [4, 5, 0, -1], [7, 5, 0, -1], [8, 5, 0, -1], [6, 5, 0, -1], [12, 5, 0, -1], [13, 5, 0, -1], [14, 5, 0, -1], [15, 5, 0, -1]];
MATCH.level[1][3] = [[0, 5, 0, -1], [1, 5, 0, -1], [2, 5, 0, -1], [3, 5, 0, -1], [4, 5, 0, -1], [7, 5, 0, -1], [8, 5, 0, -1], [11, 5, 0, -1], [12, 5, 0, -1], [13, 5, 0, -1], [14, 5, 0, -1], [6, 5, 0, -1]];

MATCH.level[2] = [];
MATCH.level[2][0] = [[0, 3, 0, -1], [2, 3, 0, -1], [4, 3, 0, -1], [7, 3, 0, -1], [9, 3, 0, -1], [15, 3, 0, -1]];
MATCH.level[2][1] = [[1, 3, 0, -1], [2, 3, 0, -1], [5, 3, 0, -1], [8, 3, 0, -1], [9, 3, 0, -1], [13, 3, 0, -1]];
MATCH.level[2][2] = [[0, 3, 0, -1], [2, 3, 0, -1], [5, 3, 0, -1], [7, 3, 0, -1], [10, 3, 0, -1], [15, 3, 0, -1]];
MATCH.level[2][3] = [[4, 3, 0, -1], [5, 3, 0, -1], [6, 3, 0, -1], [7, 3, 0, -1], [9, 3, 0, -1], [10, 3, 0, -1]];

MATCH.level[3] = [];
MATCH.level[3][0] = [[4, 1, 0, -1], [5, 4, 0, -1], [9, 4, 0, -1], [12, 1, 0, -1]];
MATCH.level[3][1] = [[5, 1, 0, -1], [6, 4, 0, -1], [9, 4, 0, -1], [11, 1, 0, -1]];
MATCH.level[3][2] = [[2, 1, 0, -1], [5, 4, 0, -1], [6, 4, 0, -1], [10, 1, 0, -1]];
MATCH.level[3][3] = [[6, 1, 0, -1], [7, 4, 0, -1], [8, 4, 0, -1], [10, 1, 0, -1]];

MATCH.level[4] = [];
MATCH.level[4][0] = [[4, 2, 0, -1], [5, 5, 0, -1], [6, 2, 0, -1], [8, 5, 0, -1], [9, 2, 0, -1], [10, 5, 0, -1]];
MATCH.level[4][1] = [[1, 5, 0, -1], [2, 2, 0, -1], [3, 5, 0, -1], [6, 2, 0, -1], [7, 2, 0, -1], [11, 5, 0, -1]];
MATCH.level[4][2] = [[4, 2, 0, -1], [5, 2, 0, -1], [6, 2, 0, -1], [8, 5, 0, -1], [9, 5, 0, -1], [10, 5, 0, -1]];
MATCH.level[4][3] = [[6, 5, 0, -1], [7, 2, 0, -1], [9, 5, 0, -1], [10, 2, 0, -1], [12, 5, 0, -1], [13, 2, 0, -1]];

MATCH.level[5] = [];
MATCH.level[5][0] = [[1, 2, 0, -1], [5, 3, 0, -1], [7, 3, 0, -1], [8, 2, 0, -1], [10, 5, 0, -1]];
MATCH.level[5][1] = [[6, 2, 0, -1], [7, 2, 0, -1], [11, 5, 0, -1], [9, 3, 0, -1], [10, 3, 0, -1]];
MATCH.level[5][2] = [[1, 5, 0, -1], [2, 3, 0, -1], [6, 2, 0, -1], [13, 2, 0, -1], [14, 3, 0, -1]];
MATCH.level[5][3] = [[0, 2, 0, -1], [2, 5, 0, -1], [5, 2, 0, -1], [8, 3, 0, -1], [10, 3, 0, -1]];

MATCH.level[6] = [];
MATCH.level[6][0] = [[8, 3, 0, -1], [9, 3, 0, -1], [10, 3, 0, -1], [11, 3, 0, -1]];
MATCH.level[6][1] = [[8, 3, 0, -1], [9, 3, 0, -1], [6, 1, 0, -1], [14, 0, 0, -1], [11, 3, 0, -1]];
MATCH.level[6][2] = [[8, 3, 0, -1], [9, 3, 0, -1], [11, 3, 0, -1], [0, 1, 0, -1], [3, 0, 0, -1]];
MATCH.level[6][3] = [[0, 0, 0, -1], [8, 3, 0, -1], [9, 3, 0, -1], [10, 1, 0, -1], [11, 3, 0, -1]];

MATCH.level[7] = [];
MATCH.level[7][0] = [[1, 4, 0, -1], [3, 4, 0, -1], [5, 4, 0, -1], [13, 4, 0, -1], [15, 4, 0, -1]];
MATCH.level[7][1] = [[0, 2, 0, -1], [1, 4, 0, -1], [3, 0, 0, -1], [4, 4, 0, -1], [6, 4, 0, -1], [8, 4, 0, -1]];
MATCH.level[7][2] = [[2, 4, 0, -1], [3, 2, 0, -1], [7, 4, 0, -1], [8, 4, 0, -1], [12, 0, 0, -1], [13, 4, 0, -1]];
MATCH.level[7][3] = [[1, 4, 0, -1], [4, 0, 0, -1], [5, 4, 0, -1], [7, 2, 0, -1], [9, 4, 0, -1], [13, 4, 0, -1]];

MATCH.level[8] = [];
MATCH.level[8][0] = [[0, 0, 0, -1], [1, 0, 0, -1], [6, 2, 0, -1], [7, 2, 0, -1], [8, 1, 0, -1], [9, 1, 0, -1]];
MATCH.level[8][1] = [[6, 2, 0, -1], [10, 2, 0, -1], [9, 1, 0, -1], [13, 1, 0, -1], [11, 0, 0, -1], [15, 0, 0, -1]];
MATCH.level[8][2] = [[1, 0, 0, -1], [4, 0, 0, -1], [6, 1, 0, -1], [9, 1, 0, -1], [11, 2, 0, -1], [14, 2, 0, -1]];
MATCH.level[8][3] = [[5, 3, 0, -1], [9, 4, 0, -1], [6, 5, 0, -1]];

MATCH.level[9] = [];
MATCH.level[9][0] = [[1, 3, 0, -1], [5, 1, 0, -1], [9, 1, 0, -1], [13, 4, 0, -1]];
MATCH.level[9][1] = [[0, 4, 0, -1], [1, 1, 0, -1], [4, 1, 0, -1], [10, 3, 1, -1]];
MATCH.level[9][2] = [[1, 3, 0, -1], [2, 1, 0, -1], [4, 1, 0, -1], [5, 4, 1, -1]];
MATCH.level[9][3] = [[5, 3, 0, -1], [6, 1, 0, -1], [9, 1, 0, -1], [10, 4, 0, -1]];

MATCH.level[10] = [];
MATCH.level[10][0] = [[1, 0, 1, -1], [5, 0, 0, -1], [6, 0, 0, -1], [7, 0, 0, -1], [10, 4, 0, -1], [13, 5, 1, -1], [14, 3, 0, -1]];
MATCH.level[10][1] = [[1, 0, 0, -1], [2, 0, 0, -1], [5, 4, 0, -1], [6, 0, 0, -1], [7, 0, 1, -1], [9, 3, 1, -1], [10, 5, 0, -1]];
MATCH.level[10][2] = [[0, 5, 0, -1], [1, 0, 0, -1], [2, 4, 1, -1], [3, 0, 0, -1], [6, 0, 0, -1], [8, 0, 1, -1], [13, 3, 0, -1]];
MATCH.level[10][3] = [[4, 4, 0, -1], [5, 0, 0, -1], [6, 0, 0, -1], [8, 3, 0, -1], [10, 0, 0, -1], [12, 5, 0, -1], [14, 0, 1, -1]];

MATCH.level[11] = [];
MATCH.level[11][0] = [[2, 2, 0, -1], [3, 1, 0, -1], [5, 0, 1, -1], [7, 1, 0, -1], [10, 4, 1, -1]];
MATCH.level[11][1] = [[1, 0, 0, -1], [2, 0, 0, -1], [3, 1, 0, -1], [6, 2, 1, -1], [9, 1, 0, -1], [10, 2, 1, -1]];
MATCH.level[11][2] = [[0, 1, 0, -1], [1, 2, 0, -1], [2, 2, 0, -1], [5, 3, 1, -1], [10, 0, 1, -1]];
MATCH.level[11][3] = [[5, 1, 0, -1], [6, 5, 1, -1], [7, 0, 0, -1], [9, 0, 0, -1], [11, 2, 0, -1]];

MATCH.level[12] = [];
MATCH.level[12][0] = [[7, 3, 0, -1], [6, 0, 0, [1, [6, 1]]], [10, 3, 0, -1], [14, 5, 0, -1]];
MATCH.level[12][1] = [[1, 3, 0, -1], [5, 5, 0, -1], [6, 0, 0, [1, [6, 0]]], [9, 3, 0, -1]];
MATCH.level[12][2] = [[1, 3, 0, -1], [6, 5, 0, -1], [5, 0, 0, -1], [10, 3, 0, -1]];
MATCH.level[12][3] = [[2, 3, 0, -1], [5, 0, 0, -1], [6, 3, 0, -1], [10, 5, 0, -1]];

MATCH.level[13] = [];
MATCH.level[13][0] = [[1, 1, 0, [1, [13, 2]]], [2, 5, 0, -1], [3, 2, 0, -1]];
MATCH.level[13][1] = [[0, 5, 0, [2, [12, 3]]], [12, 5, 0, [3, [0, 3]]]];
MATCH.level[13][2] = [[13, 1, 0, [1, [1, 0]]], [14, 5, 0, -1], [15, 2, 0, -1]];
MATCH.level[13][3] = [[0, 5, 0, [3, [12, 1]]], [12, 5, 0, [2, [0, 1]]]];

MATCH.level[14] = [];
MATCH.level[14][0] = [[0, 1, 0, -1], [2, 5, 0, -1], [3, 1, 0, -1], [4, 4, 0, [1, [4, 2], [4, 3]]], [5, 1, 0, -1], [6, 1, 1, -1]];
MATCH.level[14][1] = [[0, 1, 0, -1], [4, 1, 0, -1], [5, 1, 0, -1], [6, 5, 0, -1], [12, 4, 1, -1], [15, 1, 1, -1]];
MATCH.level[14][2] = [[2, 1, 0, -1], [3, 1, 0, -1], [4, 4, 0, [1, [4, 0], [4, 3]]], [6, 5, 0, -1], [7, 1, 0, -1], [9, 1, 1, -1]];
MATCH.level[14][3] = [[0, 5, 0, -1], [4, 4, 0, [1, [4, 0], [4, 2]]], [1, 1, 0, -1], [5, 1, 0, -1], [9, 1, 0, -1], [8, 1, 1, -1]];

MATCH.level[15] = [];
MATCH.level[15][0] = [[2, 1, 1, -1], [4, 5, 1, -1], [6, 3, 0, [0, [6, 1], [6, 2]]], [8, 4, 0, [1, [8, 1], [8, 2]]], [10, 5, 0, -1], [13, 2, 0, [4, [13, 2]]], [14, 5, 0, -1]];
MATCH.level[15][1] = [[2, 5, 0, -1], [6, 3, 0, [0, [6, 0], [6, 2]]], [8, 4, 0, [1, [8, 0], [8, 2]]], [9, 5, 0, -1], [10, 5, 1, -1], [15, 5, 0, [3, [15, 3]]]];
MATCH.level[15][2] = [[2, 1, 1, -1], [6, 3, 0, [0, [6, 0], [6, 1]]], [8, 4, 0, [1, [8, 0], [8, 1]]], [9, 5, 0, -1], [10, 5, 0, -1], [12, 5, 1, -1], [13, 2, 0, [4, [13, 0]]]];
MATCH.level[15][3] = [[5, 5, 0, -1], [6, 5, 0, -1], [7, 5, 0, -1], [13, 3, 1, -1], [14, 4, 1, -1], [15, 5, 0, [3, [15, 1]]]];

MATCH.current_level = 1; //The current level (adjusted for zero-indexing arrays in the code)

//-1 to denote the level select screen

MATCH.border_offset = 1;	//The width of the border
MATCH.x_offset = 5;			//The x_offset of the second column of squares
MATCH.y_offset = 5;			//They y_offset of the second row of squares
MATCH.square_dim = 4;		//The width of each square

MATCH.mouse_x = 0;			//The current x position of the mouse
MATCH.mouse_y = 0;			//The current y position of the mouse
MATCH.mouse_held = false;	//True if the mouse is held down, false otherwise

MATCH.num_moves = 0;		//The number of moves taken in the current puzzle

MATCH.par = [4, 9, 20, 16, 36, 35, 20, 45, 45, 45, 60, 36, 30, 30, 70, 50, 99, 99];			//The number of allowed moves in a puzzle
MATCH.record = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];		//The current high score in each level
MATCH.bronze = [1, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99];			//NOt sure if needed now?
MATCH.silver = [1, 2, 5, 2, 3, 5, 6, 12, 10, 13, 10, 8, 10, 10, 20, 14, 90];				//The requirement for a silver ranking in each level
MATCH.gold = [2, 4, 7, 4, 6, 10, 8, 15, 17, 21, 18, 12, 14, 14, 26, 20, 10];				//The requirement for a gold ranking in each level

MATCH.won = false;					//True if the player has won the match, false otherwise
MATCH.lost = false;					//True if the player has lost the match, false otherwise
MATCH.lock = false;					//True if the beads in a link need to be locked, false otherwise
MATCH.combine = false;				//Currently unused, will be implemented in a future version
MATCH.all_linked_blocks = [];		//Currently unused, will be implemented in a future version


MATCH.move_fx = [ "xylo_d6", "xylo_eb6", "xylo_e6", "xylo_f6", "xylo_gb6", "xylo_g6" ];  //The sound effects for when beads move
MATCH.win_fx = "perc_triangle";		//The sound effect for when a player wins
MATCH.lose_fx = "fx_bucket";		//The sound effect for when a player loses

//All the game's colors

MATCH.bkgrd_color = 0xFFFFFF;
MATCH.BG_color = 0x005000;
MATCH.status_color = 0xFFEEAA;
MATCH.border_color = 0x201000;
MATCH.locked_color = PS.COLOR_WHITE;
MATCH.block_color = [0xDD0000, 0x0040FF, 0xFFDD00, 0x9000BB, 0xEE7000, 0x008000];
MATCH.highlight_color = [PS.COLOR_RED, PS.COLOR_BLUE, PS.COLOR_YELLOW, PS.COLOR_VIOLET, PS.COLOR_ORANGE, PS.COLOR_GREEN];
MATCH.block_link_colors = [PS.COLOR_ORANGE, PS.COLOR_CYAN, 0xFF8080, 0xBB00CC, PS.COLOR_RED];
MATCH.reset_color = 0xDD0000;
MATCH.bronze_color = 0xDD8040;
MATCH.silver_color = 0xCCCCDD;
MATCH.gold_color = 0xFFFF00;
MATCH.level_select_color = 0x00BBFF;
MATCH.incomplete_color = PS.COLOR_WHITE;

//More offsets for each individual square. Why? Because I can. Also, it helps some function somewhere in here. Just CTRL-F this.

MATCH.square_x_offset = [MATCH.border_offset, MATCH.border_offset + MATCH.x_offset, MATCH.border_offset, MATCH.border_offset + MATCH.x_offset];
MATCH.square_y_offset = [MATCH.border_offset, MATCH.border_offset, MATCH.border_offset + MATCH.y_offset, MATCH.border_offset + MATCH.y_offset];

//Function to convert square coordinates to x,y coordinates

MATCH.SquareToXY = function( val, square ) {
	"use strict";
	var x_val, y_val;

	x_val = ( val % 4 ) + MATCH.square_x_offset[ square ];
	y_val = Math.floor( val / 4 ) + MATCH.square_y_offset[ square ];
	return [ x_val, y_val ];
};

//Tests to see if all levels have been completed

MATCH.AllComplete = function () {
	"use strict";
	var i;

	for ( i = 0; i < MATCH.record.length; i += 1 ) {
		if( MATCH.record[i] === -1 ){
			return false;
		}
	}
	return true;
};

//Contains all the possible status text updates
//Checks to see if the text needs to be changed to avoid over-flashing the status text
//Also checks plurality of words

MATCH.UpdateStatus = function () {
	"use strict";
	var status, moves, moves_left;

	status = "";

	if ( MATCH.mouse_data === "reset" ) {
		status = "Reset Level";
	}
	else if ( MATCH.mouse_data === "bronze" ) {
		status = "Bronze - Complete the level.";
	}
	else if ( MATCH.mouse_data === "silver" ) {
		if ( MATCH.silver[MATCH.current_level - 1] === 1 ) {
			status = "Silver - At least " + MATCH.silver[MATCH.current_level - 1] + " move remaining.";
		}
		else {
			status = "Silver - At least " + MATCH.silver[MATCH.current_level - 1] + " moves remaining.";
		}
	}
	else if ( MATCH.mouse_data === "gold" ) {
		if ( MATCH.gold[MATCH.current_level - 1] === 1 ) {
			status = "Gold - At least " + MATCH.gold[MATCH.current_level - 1] + " move remaining.";
		}
		else {
			status = "Gold - At least " + MATCH.gold[ MATCH.current_level - 1 ] + " moves remaining.";
		}
	}
	else if ( MATCH.mouse_data === "level_select" ) {
		status = "Back to Level Select";
	}
	else if ( MATCH.won ) {
		if ( MATCH.AllComplete() ) {
			status = "Congratulations! You have beaten all levels!";
		}
		else {
			moves = MATCH.par[MATCH.current_level - 1] - MATCH.num_moves;
			status = "WINNER - " + moves + " moves left - Click to advance";
		}

	}
	else if ( MATCH.lost ) {
		status = "You ran out of moves - Click to retry";
	}
	else if ( MATCH.mouse_data !== 0 && MATCH.current_level === -1 ) {
		if( MATCH.record[MATCH.mouse_data - 1] !== -1 ) {
			if ( MATCH.record[MATCH.mouse_data - 1] === 1 ) {
				status = "Level " + MATCH.mouse_data + " - Record: " + MATCH.record[ MATCH.mouse_data - 1 ] + " move left.";
			}
			else {
				status = "Level " + MATCH.mouse_data + " - Record: " + MATCH.record[ MATCH.mouse_data - 1 ] + " moves left.";
			}
		}
		else {
			status = "Level " + MATCH.mouse_data + " - Incomplete";
		}
	}
	else if ( MATCH.current_level === -1 ) {
		status = "Please Select a Level";
	}
	else {
		moves_left = MATCH.par[ MATCH.current_level - 1 ];
		moves_left -= MATCH.num_moves;
		status = "You have " + moves_left + " moves remaining.";
	}
	if( status !== PS.statusText() ) {
		PS.statusText( status );
	}
};

//Checks if the bead at position (x, y) is a block

MATCH.IsBlock = function ( x, y ) {
	"use strict";
	var color, i;

	color = PS.color( x, y );
	for ( i = 0; i < MATCH.block_color.length; i += 1 ) {
		if( MATCH.block_color[i] === color ) {
			return true;
		}
	}
	return false;
};

//Checks if the bead at position (x, y) is a block with a primary color

MATCH.IsPrimary = function ( x, y ) {
	"use strict";
	var color, i;

	color = PS.color( x, y );
	for ( i = 0; i < 3; i += 1 ) {
		if ( MATCH.block_color[i] === color ) {
			return true;
		}
	}
	return false;
};

//Checks if the bead at position (x, y) is a locked block

MATCH.IsLocked = function( x, y ) {
	"use strict";
	var data;

	data = PS.data( x, y );
	if ( data[2] === 1 ) {
		return true;
	}

	return false;
};

//Checks if every block in a link can move, based on block at (start_x, start_y) moving to (end_x, end_y)
//Returns true if a block is not in a link

MATCH.CheckLinked = function ( start_x, start_y, end_x, end_y ) {
	"use strict";
	var data, link, x_diff, y_diff, i;

	data = PS.data(start_x, start_y);
	if ( data[3] === -1 ) {
		return 1;
	}

	link = data[3];
	x_diff = end_x - start_x;
	y_diff = end_y - start_y;
	for ( i = 1; i < link.length; i += 1 ) {
		if( !MATCH.ValidMove( link[i][0], link[i][1], link[i][0] + x_diff, link[i][1] + y_diff, false ) ) {
			return 0;
		}
	}

	return 1;
};

//Moves all the blocks in a link, based on block at (start_x, start_y) moving to (end_x, end_y)
//Called after the move has been made

MATCH.MoveLinked = function ( start_x, start_y, end_x, end_y ) {
	"use strict";
	var data, link, link_list, x_diff, y_diff, i;

	data = PS.data(end_x, end_y);
	link = data[3];
	link_list = [];
	link_list[0] = [end_x, end_y];
	x_diff = end_x - start_x;
	y_diff = end_y - start_y;
	for ( i = 1; i < link.length; i += 1 ) {
		MATCH.MakeMove( link[i][0], link[i][1], link[i][0] + x_diff, link[i][1] + y_diff, true );
		link[i][0] += x_diff;
		link[i][1] += y_diff;
		link_list[i] = [link[i][0], link[i][1]];
	}
	MATCH.UpdateLinks(link_list);
	MATCH.CheckEnd();
};

//Updates the data of all the beads in a link with their new positions

MATCH.UpdateLinks = function ( links ) {
	"use strict";
	var i, j, temp_data, new_links, new_link_index;

	for ( i = 0; i < links.length; i += 1 ) {
		temp_data = PS.data( links[i][0], links[i][1] );
		new_links = temp_data[3];
		new_link_index = 1;
		for ( j = 0; j < links.length; j += 1 ) {
			if ( links[i][0] !== links[j][0] || links[i][1] !== links[j][1] ) {
				new_links[new_link_index] = links[j];
				new_link_index += 1;
			}
		}
		temp_data[3] = new_links;
		PS.data( links[i][0], links[i][1], temp_data );
	}
};

//Determines if the move from (start_x, start_y) to (end_x, end_y) is legal
//ASSUMPTION: (start_x, start_y) is the world coordinates of a valid block

MATCH.ValidMove = function ( start_x, start_y, end_x, end_y, linked ) {
	"use strict";
	var test_var;

	//Block diagonal movement
	if( ( Math.abs(start_x - end_x) > 0 ) && ( Math.abs(start_y - end_y) > 0 ) ) {
		return false;
	}

	if ( linked ) {
		test_var = MATCH.CheckLinked( start_x, start_y, end_x, end_y );
		if( test_var === 0 ) {
			return false;
		}
	}

	if( MATCH.IsLocked( start_x, start_y ) ) {
		return false;
	}

	//If the move would result in a combination, then it is a move

	if ( MATCH.IsPrimary(start_x, start_y) && MATCH.IsPrimary(end_x, end_y) && ( PS.color(start_x, start_y) !== PS.color(end_x, end_y) ) ) {
		return true;
	}

	//If (end_x, end_y) is empty, then it's a move

	if ( !MATCH.IsBlock(end_x, end_y) && ( PS.color(end_x, end_y) !== MATCH.border_color ) ) {
		return true;
	}

	//Otherwise, it's not a valid move

	return false;
};

//Moves block from (start_x, start_y) to (end_x, end_y)
//linked_move is TRUE if this was called as part of a linked update.
// This prevents other sound fx from being played and the move count incrementing twice

MATCH.MakeMove = function ( start_x, start_y, end_x, end_y, linked_move ) {
	"use strict";
	if ( MATCH.IsPrimary(start_x, start_y) && MATCH.IsPrimary(end_x, end_y) ) {
		MATCH.CombineBlocks( start_x, start_y, end_x, end_y );
	}
	//If (end_x, end_y) is empty, then it's a move

	else if ( !MATCH.IsBlock(end_x, end_y) && ( PS.color(end_x, end_y) !== MATCH.border_color ) ) {
		MATCH.MoveBlock( start_x, start_y, end_x, end_y );
	}

	if( !linked_move ) {
		MATCH.num_moves += 1;
		MATCH.UpdateStatus();
		MATCH.CheckEnd();
	}

	if( !MATCH.won && !MATCH.lost && !linked_move ){
		MATCH.PlayMoveSound();
	}
};

//Moves the block from (start_x, start_y) to (end_x, end_y)
MATCH.MoveBlock = function ( start_x, start_y, end_x, end_y ) {
	"use strict";
	var data;

	data = PS.data( start_x, start_y );
	PS.color( end_x, end_y, PS.color(start_x, start_y) );
	data[0] = end_x;
	data[1] = end_y;
	PS.data( end_x, end_y, data );

	if ( data[2] === 1 ) {
		PS.borderColor( end_x, end_y, MATCH.locked_color );
	}
	else if ( data[3] !== -1 ) {
		PS.borderColor( end_x, end_y, MATCH.block_link_colors[data[3][0]] );
	}
	else {
		PS.borderColor( end_x, end_y, MATCH.border_color );
	}

	PS.color( start_x, start_y, MATCH.bkgrd_color );
	PS.data( start_x, start_y, 0 );
	PS.borderColor( start_x, start_y, MATCH.border_color );
};

//Combines the blocks at (start_x, start_y) and (end_x, end_y), placing the new block at (end_x, end_y)

MATCH.CombineBlocks = function ( start_x, start_y, end_x, end_y ) {
	"use strict";
	var color1, color2, index_1, index_2, i, data_start, data_end, data;

	color1 = PS.color(start_x, start_y);
	color2 = PS.color(end_x, end_y);

	for ( i = 0; i < MATCH.block_color.length; i += 1 ) {
		if( MATCH.block_color[i] === color1 ) {
			index_1 = i;
		}

		if( MATCH.block_color[i] === color2 ) {
			index_2 = i;
		}
	}

	PS.color( end_x, end_y, MATCH.block_color[index_1 + index_2 + 2] );

	//Combine the data from both beads

	data_start = PS.data( start_x, start_y );
	data_end = PS.data( end_x, end_y );
	data = [];
	data[0] = end_x;
	data[1] = end_y;
	if( data_start[2] === 1 || data_end[2] === 1 ) {
		data[2] = 1;
	}
	else {
		data[2] = 0;
	}

	data[3] = MATCH.CombineLinks( data_start[3], data_end[3] );

	if( data[2] === 1 && data[3] !== -1 ) {
		MATCH.lock = true;
	}

	PS.data( end_x, end_y, data );

	if ( data[2] === 1 ) {
		PS.borderColor( end_x, end_y, MATCH.locked_color );
	}
	else if ( data[3] !== -1 ) {
		PS.borderColor( end_x, end_y, MATCH.block_link_colors[data[3][0]] );
	}
	else {
		PS.borderColor( end_x, end_y, MATCH.border_color );
	}

	PS.color( start_x, start_y, MATCH.bkgrd_color );
	PS.data( start_x, start_y, 0 );
	PS.borderColor( start_x, start_y, MATCH.border_color );
};

//Combines the links of two blocks being combined

MATCH.CombineLinks = function ( data_start, data_end ) {
	"use strict";
	var i;

	if( data_start === -1 ) {
		return data_end;
	}
	if( data_end === -1 ) {
		return data_start;
	}

	/*
	 * NOTICE
	 *
	 * This branch and the following two methods are for linked blocks combining with other linked blocks.
	 * As of this comment (12/10/2011) we do not have this functionality in the engine
	 * Thus, you should probably disregard the aforementioned code.
	 * I'm keeping it in here so that I can potentially add it in later
	 *
	 */

	for ( i = 1; i < data_end.length; i += 1 ) {
		MATCH.all_linked_blocks.push( data_end[i] );
	}
	MATCH.combine = true;
	return data_start;
};

//link_list has the data_start (where it cannot change anymore)

MATCH.CombineAllLinks = function ( link_list ) {
	"use strict";
	var new_color, i;

	new_color = link_list[0];
	for ( i = 1; i < link_list.length; i += 1 ) {
		MATCH.all_linked_blocks.push( link_list[i] );
	}

	//Now, we have ALL the blocks in the new link.

	for ( i = 0; i < MATCH.all_linked_blocks.length; i += 1 ) {
		MATCH.SetLink( MATCH.all_linked_blocks[i][0], MATCH.all_linked_blocks[i][1], MATCH.all_linked_blocks, new_color );
	}

	MATCH.all_linked_blocks = [];
};

MATCH.SetLink = function ( x, y, link_list, color ) {
	"use strict";
	var new_links, index, i, data;

	new_links = [];
	new_links[0] = color;
	index = 1;
	for ( i = 0; i < link_list.length; i += 1 ) {
		if ( ( link_list[i][0] !== x ) || ( link_list[i][1] !== y ) ) {
			new_links[index] = link_list[i];
		}
	}

	data = PS.data( x, y );
	data[3] = new_links;
	PS.data( x, y, data );
};

//Locks all the blocks in a link

MATCH.LockLinks = function( link_list ) {
	"use strict";
	var i, data;

	for ( i = 1; i < link_list.length; i += 1 ) {
		data = PS.data( link_list[i][0], link_list[i][1] );
		data[2] = 1;
		PS.data( link_list[i][0], link_list[i][1], data );
		PS.borderColor( link_list[i][0], link_list[i][1], MATCH.locked_color );
	}
};

//Checks to see if the player has won or lost

MATCH.CheckEnd = function () {
	"use strict";
	var moves;

	if( MATCH.CheckWin() ) {
		moves = MATCH.par[ MATCH.current_level - 1 ] - MATCH.num_moves;
		PS.statusText( "WINNER - " + moves + " moves left - Click to advance" );
		MATCH.mouse_held = false;
		if ( MATCH.record[ MATCH.current_level - 1 ] < moves ) {
			MATCH.record[ MATCH.current_level - 1 ] = moves;
		}
		MATCH.won = true;
		PS.audioPlay( MATCH.win_fx );
	}
	else if ( MATCH.CheckLost() ) {
		PS.statusText( "You ran out of moves - Click to retry" );
		MATCH.mouse_held = false;
		MATCH.lost = true;
		PS.audioPlay( MATCH.lose_fx );
	}
};

//Checks if all four squares are identical

MATCH.CheckWin = function () {
	"use strict";
	var x, y;

	for ( x = MATCH.border_offset; x < MATCH.border_offset + MATCH.square_dim; x += 1 ) {
		for ( y = MATCH.border_offset; y < MATCH.border_offset + MATCH.square_dim; y += 1 ) {
			if( PS.color( x, y ) !== PS.color( x + MATCH.x_offset, y ) ) {
				return false;
			}

			if( PS.color( x, y ) !== PS.color( x + MATCH.x_offset, y + MATCH.y_offset ) ) {
				return false;
			}

			if ( PS.color( x, y ) !== PS.color( x, y + MATCH.y_offset ) ) {
				return false;
			}
		}
	}
	return true;
};

//Checks if the player has run out of moves

MATCH.CheckLost = function () {
	"use strict";
	if ( ( MATCH.par[MATCH.current_level - 1] - MATCH.num_moves ) <= 0 ) {
		return true;
	}

	return false;
};

//Draws the borders of a level

MATCH.DrawBorders = function () {
	"use strict";
	PS.color ( PS.ALL, 0, MATCH.border_color );
	PS.color ( PS.ALL, 5, MATCH.border_color );
	PS.color ( PS.ALL, 10, MATCH.border_color );

	PS.color ( 0, PS.ALL, MATCH.border_color );
	PS.color ( 5, PS.ALL,  MATCH.border_color );
	PS.color ( 10, PS.ALL, MATCH.border_color );
};

//Draws a square at (x_0, y_0) based off of the array 'map'

MATCH.DrawSquare = function ( x_0, y_0, map ) {
	"use strict";
	var i, j, x_val, y_val, data, xy_links, link_map;

	for ( i = 0; i < 16; i += 1 ) {
		x_val = i % 4;
		y_val = Math.floor( i / 4 );
		PS.color( x_0 + x_val, y_0 + y_val, MATCH.bkgrd_color );
		PS.data( x_0 + x_val, y_0 + y_val, 0 );
		PS.borderColor( x_0 + x_val, y_0 + y_val, MATCH.border_color );

	}
	for ( i = 0; i < map.length; i += 1 ) {
		x_val = map[i][0] % 4;
		y_val = Math.floor( map[i][0] / 4 );
		PS.color( x_0 + x_val, y_0 + y_val, MATCH.block_color[map[i][1]] );
		data = [];
		data[0] = x_0 + x_val;
		data[1] = y_0 + y_val;
		data[2] = map[i][2];
		if ( map[i][3] === -1 ) {
			data[3] = -1;
		}
		else {
			xy_links = [];
			link_map = map[i][3];
			xy_links[0] = link_map[0];
			PS.border( x_0 + x_val, y_0 + y_val, 2 ); // was borderShow = true
			PS.borderColor( x_0 + x_val, y_0 + y_val, MATCH.block_link_colors[link_map[0]] );
			for ( j = 1; j < link_map.length; j += 1 ) {
				xy_links[j] = MATCH.SquareToXY( link_map[j][0], link_map[j][1] );
			}
			data[3] = xy_links;
		}

		PS.data( x_0 + x_val, y_0 + y_val, data );

		if ( data[2] === 1 ) {
			PS.borderColor( x_0 + x_val, y_0 + y_val, MATCH.locked_color );
		}
	}
};

//Draws the in-game menu

MATCH.DrawMenu = function () {
	"use strict";

	PS.color( PS.ALL, 11, MATCH.border_color );
	PS.color( PS.ALL, 12, MATCH.border_color );

	PS.color( 1, 11, MATCH.reset_color );
	PS.data( 1, 11, "reset" );
	PS.exec( 1, 11, MATCH.ResetLevel );

	PS.color( 3, 11, MATCH.bronze_color );
	PS.data( 3, 11, "bronze" );

	PS.color( 5, 11, MATCH.silver_color );
	PS.data( 5, 11, "silver" );

	PS.color( 7, 11, MATCH.gold_color );
	PS.data( 7, 11, "gold" );

	PS.color( 9, 11, MATCH.level_select_color );
	PS.data( 9, 11, "level_select" );
	PS.exec( 9, 11, MATCH.DrawLevelSelect );
};

//Draws the current level

MATCH.DrawLevel = function () {
	"use strict";

	MATCH.InitVariables();
	MATCH.DrawBorders();
	MATCH.DrawMenu();
	MATCH.UpdateStatus();

	MATCH.DrawSquare(MATCH.border_offset, MATCH.border_offset, MATCH.level[MATCH.current_level - 1][0]);
	MATCH.DrawSquare(MATCH.border_offset + MATCH.x_offset, MATCH.border_offset, MATCH.level[MATCH.current_level - 1][1]);
	MATCH.DrawSquare(MATCH.border_offset, MATCH.border_offset + MATCH.y_offset, MATCH.level[MATCH.current_level - 1][2]);
	MATCH.DrawSquare(MATCH.border_offset + MATCH.x_offset, MATCH.border_offset + MATCH.y_offset, MATCH.level[MATCH.current_level - 1][3]);
};

//Draws the level select screen

MATCH.DrawLevelSelect = function () {
	"use strict";
	var i, x_pos, y_pos, color;

	MATCH.InitVariables();
	PS.gridSize( 9, 9 );
	PS.border( PS.ALL, PS.ALL, 0 );

	PS.color( PS.ALL, PS.ALL, MATCH.border_color );
	PS.data( PS.ALL, PS.ALL, 0 );
	PS.gridColor( MATCH.BG_color );
	PS.statusColor( MATCH.status_color );
	MATCH.current_level = -1;

	for ( i = 1; i <= 16; i += 1 ) {
		x_pos = 1 + ( Math.floor( ( i - 1 ) % 4 ) * 2 );
		y_pos = 1 + ( Math.floor( ( i - 1 ) / 4 ) * 2 );

		if ( MATCH.record[ i - 1 ] === -1 ) {
			color = MATCH.incomplete_color;
		}
		else if ( MATCH.record[ i - 1 ] >= MATCH.gold[ i - 1 ] ) {
			color = MATCH.gold_color;
		}
		else if ( MATCH.record[ i - 1 ] >= MATCH.silver[ i - 1 ] ) {
			color = MATCH.silver_color;
		}
		else if ( MATCH.record[ i - 1 ] >= -1 ) {
			color = MATCH.bronze_color;
		}

		PS.color( x_pos, y_pos, color );
		PS.data( x_pos, y_pos, i );
		PS.exec( x_pos, y_pos, MATCH.SelectLevel );
	}

	MATCH.UpdateStatus();
};

//Resets the level

MATCH.ResetLevel = function () {
	"use strict";

	MATCH.DrawLevel();
};

//Selects a level
//Called from the level select screen

MATCH.SelectLevel = function ( x, y, data ) {
	"use strict";

	PS.gridSize ( MATCH.gridX, MATCH.gridY );
	PS.border( PS.ALL, PS.ALL, 2 );
	PS.gridColor( MATCH.BG_color );
	PS.statusColor( MATCH.status_color );
	PS.borderColor( PS.ALL, PS.ALL, MATCH.border_color );
	PS.color( PS.ALL, PS.ALL, MATCH.bkgrd_color );

	MATCH.current_level = data;
	MATCH.DrawLevel();
};

//Plays a random sound from the list of block movement sounds

MATCH.PlayMoveSound = function () {
	"use strict";

	PS.audioPlay( MATCH.move_fx[ PS.random( MATCH.move_fx.length ) - 1 ] );
};

//Initializes the game variables

MATCH.InitVariables = function () {
	"use strict";

	MATCH.won = false;
	MATCH.lost = false;
	MATCH.mouse_held = false;

	MATCH.num_moves = 0;
};

// PS.init( system, options )
// Initializes the game
// This function should normally begin with a call to PS.gridSize( x, y )
// where x and y are the desired initial dimensions of the grid
// [system] = an object containing engine and platform information; see documentation for details
// [options] = an object with optional parameters; see documentation for details

PS.init = function( system, options ) {
	"use strict";

	PS.gridSize( MATCH.gridX, MATCH.gridY );
	PS.border( PS.ALL, PS.ALL, 2 );
	PS.gridColor( MATCH.BG_color );
	PS.statusColor( MATCH.status_color );
	PS.borderColor( PS.ALL, PS.ALL, MATCH.border_color );
	PS.color( PS.ALL, PS.ALL, MATCH.bkgrd_color );
	MATCH.DrawLevelSelect();
};

// PS.touch ( x, y, data, options )
// Called when the mouse button is clicked on a bead, or when a bead is touched
// It doesn't have to do anything
// [x] = zero-based x-position of the bead on the grid
// [y] = zero-based y-position of the bead on the grid
// [data] = the data value associated with this bead, 0 if none has been set
// [options] = an object with optional parameters; see documentation for details

PS.touch = function( x, y, data, options ) {
	"use strict";

	if ( MATCH.current_level !== -1 ) {
		if( !MATCH.won && !MATCH.lost ) {
			MATCH.mouse_x = x;
			MATCH.mouse_y = y;
			MATCH.mouse_held = true;
		}
		else if ( MATCH.won ) {
			if ( MATCH.current_level < 15 ) {
				MATCH.current_level += 1;
				MATCH.DrawLevel();
			}
			else {
				MATCH.DrawLevelSelect();
			}
		}
		else {
			MATCH.DrawLevel();
		}
	}
};

// PS.release ( x, y, data, options )
// Called when the mouse button is released over a bead, or when a touch is lifted off a bead
// It doesn't have to do anything
// [x] = zero-based x-position of the bead on the grid
// [y] = zero-based y-position of the bead on the grid
// [data] = the data value associated with this bead, 0 if none has been set
// [options] = an object with optional parameters; see documentation for details

PS.release = function( x, y, data, options ) {
	"use strict";

	MATCH.mouse_held = false;
};

// PS.enter ( x, y, button, data, options )
// Called when the mouse/touch enters a bead
// It doesn't have to do anything
// [x] = zero-based x-position of the bead on the grid
// [y] = zero-based y-position of the bead on the grid
// [data] = the data value associated with this bead, 0 if none has been set
// [options] = an object with optional parameters; see documentation for details

PS.enter = function( x, y, data, options ) {
	"use strict";
	var xdata;

	if ( ( MATCH.current_level !== -1 ) && ( MATCH.mouse_x > 0 ) && ( MATCH.mouse_y > 0 ) ) {
		if ( MATCH.mouse_held && MATCH.IsBlock( MATCH.mouse_x, MATCH.mouse_y ) ) {
			if ( MATCH.ValidMove( MATCH.mouse_x, MATCH.mouse_y, x, y, true ) ) {
				xdata = PS.data( MATCH.mouse_x, MATCH.mouse_y );
				MATCH.MakeMove( MATCH.mouse_x, MATCH.mouse_y, x, y, false );
				if ( xdata[3] !== -1 ) {
					MATCH.MoveLinked( MATCH.mouse_x, MATCH.mouse_y, x, y );
					if ( MATCH.combine ) {
						MATCH.CombineAllLinks( xdata[3] );
						MATCH.combine = false;
					}

					if ( MATCH.lock ) {
						MATCH.LockLinks( xdata[3] );
						PS.borderColor( x, y, MATCH.locked_color );
						MATCH.lock = false;
					}
				}
			}
			else {
				MATCH.mouse_held = false;
			}
		}
	}
	MATCH.mouse_x = x;
	MATCH.mouse_y = y;
	MATCH.mouse_data = PS.data( x, y );

	MATCH.UpdateStatus();
};

// The other event functions aren't used
// But they must be present or the engine will complain

PS.exit = function( x, y, data, options ) {
	"use strict";
};

PS.exitGrid = function( options ) {
	"use strict";
};

PS.keyDown = function( key, shift, ctrl, options ) {
	"use strict";
};

PS.keyUp = function( key, shift, ctrl, options ) {
	"use strict";
};

PS.input = function( sensors, options ) {
	"use strict";
};

