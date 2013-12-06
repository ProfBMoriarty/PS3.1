PSTest = TestCase("PSTest");

doNothing = function(){} //dummy function for testing function pointers


PSTest.prototype.setUp = function(){
    PS._sys(); //initialize the engine
};

//region Grid Functions

PSTest.prototype.testGridSizeArgCheck = function() { //tests that malformed arguments are correctly handled as errors
    assertEquals(PS.ERROR, PS.gridSize()) //no arguments
    assertEquals(PS.ERROR, PS.gridSize(1)) //single argument
    assertEquals(PS.ERROR, PS.gridSize(1, 1, 1)) //more than two arguments
    assertEquals(PS.ERROR, PS.gridSize(null, 1)) //null width
    assertEquals(PS.ERROR, PS.gridSize(1, null)) //null height
    assertEquals(PS.ERROR, PS.gridSize(NaN, 1)) //wrong type width
    assertEquals(PS.ERROR, PS.gridSize(1, NaN)) //wrong type height
}

PSTest.prototype.testGridSizeCurrentDefault = function() { //tests that the PS.CURRENT and PS.DEFAULT arguments are handled correctly
	PS.gridSize( 13, 15 );
    assertEquals({width: 13, height: 15}, PS.gridSize(PS.CURRENT, PS.CURRENT));
    assertEquals({width: 8, height: 8}, PS.gridSize(PS.DEFAULT, PS.DEFAULT));
}

PSTest.prototype.testGridSizeClamp = function() { //tests that PS.gridSize correctly clamps both inputs to the 1-32 range
    assertEquals(1, PS.gridSize(0, PS.DEFAULT).width); //clamp 0 width to 1
    assertEquals(32, PS.gridSize(33, PS.DEFAULT).width); //clamp 33 width to 32
    assertEquals(1, PS.gridSize(PS.DEFAULT, 0).height); //clamp 0 height to 1
    assertEquals(32, PS.gridSize(PS.DEFAULT, 33).height); //clamp 33 height to 32
};

PSTest.prototype.testGridSizeReset = function() { //tests that gridSize is correctly resetting all other attributes to default
    //assign non-default values
    PS.gridColor(0x000000);
    PS.gridFade(1, {rgb: 0, onEnd: doNothing, params: [0]});
    PS.gridPlane(1);
    PS.visible(PS.ALL, PS.ALL, false);
    PS.active(PS.ALL, PS.ALL, false);
    PS.scale(PS.ALL, PS.ALL, 50);
    PS.radius(PS.ALL, PS.ALL, 1);
    PS.color(PS.ALL, PS.ALL, 0x000001);
    PS.alpha(PS.ALL, PS.ALL, 0, 0, 0);
    PS.border(PS.ALL, PS.ALL, 0);
    PS.borderColor(PS.ALL, PS.ALL, 0x000002);
    PS.borderAlpha(PS.ALL, PS.ALL, 1);
    PS.glyph(PS.ALL, PS.ALL, 1);
    PS.glyphColor(PS.ALL, PS.ALL, 0x000003);
    PS.glyphAlpha(PS.ALL, PS.ALL, 2);
    PS.data(PS.ALL, PS.ALL, doNothing);
    PS.exec(PS.ALL, PS.ALL, doNothing);
    //set grid size
    var dimensions = PS.gridSize(PS.DEFAULT, PS.DEFAULT);
    //test values for defaults
    assertEquals(PS.COLOR_WHITE, PS.gridColor());
    assertEquals({rate: 0, rgb: null, onEnd: null, params: null}, PS.gridFade());
    assertEquals(0, PS.gridPlane());
    for(var i = 0; i < dimensions.width; i++) for(var j = 0; j < dimensions.height; j++){
        assertTrue(PS.visible(i,j));
        assertTrue(PS.active(i,j));
        assertEquals(100, PS.scale(i, j));
        assertEquals(0, PS.radius(i, j));
        assertEquals(PS.COLOR_WHITE, PS.color(i, j));
        assertEquals(PS.ALPHA_OPAQUE, PS.alpha(i, j));
        assertEquals(1, PS.border(i, j).width);
        assertEquals(PS.COLOR_GRAY, PS.borderColor(i, j));
        assertEquals(PS.ALPHA_OPAQUE, PS.borderAlpha(i, j));
        assertEquals(0, PS.glyph(i, j));
        assertEquals(PS.COLOR_BLACK, PS.glyphColor(i, j));
        assertEquals(PS.ALPHA_OPAQUE, PS.glyphAlpha(i, j));
        assertEquals(0, PS.data(i, j));
        assertEquals(null, PS.exec(i, j));
    }
};

PSTest.prototype.testGridColorArgCheck = function(){ //tests that malformed arguments are correctly handled as errors
    assertEquals(PS.ERROR, PS.gridColor(null, 0, 0)); //null red triplet
    assertEquals(PS.ERROR, PS.gridColor(0, null, 0)); //null green triplet
    assertEquals(PS.ERROR, PS.gridColor(0, 0, null)); //null blue triplet
    assertEquals(PS.ERROR, PS.gridColor(NaN, 0, 0)); //wrong type red triplet
    assertEquals(PS.ERROR, PS.gridColor(0, NaN, 0)); //wrong type green triplet
    assertEquals(PS.ERROR, PS.gridColor(0, 0, NaN)); //wrong type blue triplet
    assertEquals(PS.ERROR, PS.gridColor([null, 0, 0])); //null red array
    assertEquals(PS.ERROR, PS.gridColor([0, null, 0])); //null green array
    assertEquals(PS.ERROR, PS.gridColor([0, 0, null])); //null blue array
    assertEquals(PS.ERROR, PS.gridColor([NaN, 0, 0])); //wrong type red array
    assertEquals(PS.ERROR, PS.gridColor([0, NaN, 0])); //wrong type green array
    assertEquals(PS.ERROR, PS.gridColor([0, 0, NaN])); //wrong type blue array
    assertEquals(PS.ERROR, PS.gridColor(null)); //null multiplex
    assertEquals(PS.ERROR, PS.gridColor(NaN)); //wrong type multiplex
    assertEquals(PS.ERROR, PS.gridColor({r : null, g : 0, b: 0})); //null red object
    assertEquals(PS.ERROR, PS.gridColor({r : 0, g : null, b: 0})); //null green object
    assertEquals(PS.ERROR, PS.gridColor({r : 0, g : 0, b: null})); //null blue object
    assertEquals(PS.ERROR, PS.gridColor({r : NaN, g : 0, b: 0})); //wrong type red object
    assertEquals(PS.ERROR, PS.gridColor({r : 0, g : NaN, b: 0})); //wrong type green object
    assertEquals(PS.ERROR, PS.gridColor({r : 0, g : 0, b: NaN})); //wrong type blue object
    assertEquals(PS.ERROR, PS.gridColor({rgb: NaN})); //wrong type rgb object
    assertEquals(PS.ERROR, PS.gridColor(0, 0, 0, 0)); //too many arguments numbers
    assertEquals(PS.ERROR, PS.gridColor([0, 0, 0], [0, 0, 0])); //multiple arrays
    assertEquals(PS.ERROR, PS.gridColor({rgb : 0}, {rgb : 0})); //multiple objects
}

PSTest.prototype.testGridColorCurrentDefault = function() { //tests that the PS.CURRENT and PS.DEFAULT arguments are handled correctly
    assertEquals(0xFFFFFF, PS.gridColor(PS.CURRENT)); //current multiplex
    assertEquals(0xFFFFFF, PS.gridColor(PS.DEFAULT)); //default multiplex
    assertEquals(0xFF0000, PS.gridColor(PS.DEFAULT, 0, 0)); //default red triplet
    assertEquals(0xFF0000, PS.gridColor(PS.CURRENT, 0, 0)); //current red triplet
    assertEquals(0x00FF00, PS.gridColor(0, PS.DEFAULT, 0)); //default green triplet
    assertEquals(0x00FF00, PS.gridColor(0, PS.CURRENT, 0)); //current green triplet
    assertEquals(0x0000FF, PS.gridColor(0, 0, PS.DEFAULT)); //default blue triplet
    assertEquals(0x0000FF, PS.gridColor(0, 0, PS.CURRENT)); //current blue triplet
    assertEquals(0xFF0000, PS.gridColor([PS.DEFAULT, 0, 0])); //default red array
    assertEquals(0xFF0000, PS.gridColor([PS.CURRENT, 0, 0])); //current red array
    assertEquals(0x00FF00, PS.gridColor([0, PS.DEFAULT, 0])); //default green array
    assertEquals(0x00FF00, PS.gridColor([0, PS.CURRENT, 0])); //current green array
    assertEquals(0x0000FF, PS.gridColor([0, 0, PS.DEFAULT])); //default blue array
    assertEquals(0x0000FF, PS.gridColor([0, 0, PS.CURRENT])); //current blue array
    assertEquals(0xFF0000, PS.gridColor({r : PS.DEFAULT, g : 0, b: 0})); //default red object
    assertEquals(0xFF0000, PS.gridColor({r : PS.CURRENT, g : 0, b: 0})); //current red object
    assertEquals(0x00FF00, PS.gridColor({r : 0, g : PS.DEFAULT, b: 0})); //default green object
    assertEquals(0x00FF00, PS.gridColor({r : 0, g : PS.CURRENT, b: 0})); //current green object
    assertEquals(0x0000FF, PS.gridColor({r : 0, g : 0, b: PS.DEFAULT})); //default blue object
    assertEquals(0x0000FF, PS.gridColor({r : 0, g : 0, b: PS.CURRENT})); //current blue object
    assertEquals(0xFFFFFF, PS.gridColor({rgb: PS.DEFAULT})); //default rgb object
    assertEquals(0xFFFFFF, PS.gridColor({})); //implicit current rgb object
    assertEquals(0xFFFFFF, PS.gridColor({rgb: PS.CURRENT})); //explicit current rgb object
    assertEquals(0xFFFFFF, PS.gridColor([])); //implied rgb array
    assertEquals(0xFFFFFF, PS.gridColor({rgb: null})); //implied rgb object
    assertEquals(0x00FFFF, PS.gridColor([0])); //implied green and blue array
    assertEquals(0x0000FF, PS.gridColor(0, 0)); //implied blue triplet
    assertEquals(0x0000FF, PS.gridColor([0, 0])); //implied blue array
}

PSTest.prototype.testGridColorClamp = function(){ //tests that color expressions are being correctly clamped to RGB space
    assertEquals(0x000000, PS.gridColor(-1, 0, 0)); //clamp min red triplet
    assertEquals(0xFF0000, PS.gridColor(256, 0, 0)); //clamp max red triplet
    assertEquals(0x000000, PS.gridColor(0, -1, 0)); //clamp min green triplet
    assertEquals(0x00FF00, PS.gridColor(0, 256, 0)); //clamp max green triplet
    assertEquals(0x000000, PS.gridColor(0, 0, -1)); //clamp min blue triplet
    assertEquals(0x0000FF, PS.gridColor(0, 0, 256)); //clamp max blue triplet
    assertEquals(0x000000, PS.gridColor([-1, 0, 0])); //clamp min red array
    assertEquals(0xFF0000, PS.gridColor([256, 0, 0])); //clamp max red array
    assertEquals(0x000000, PS.gridColor([0, -1, 0])); //clamp min green array
    assertEquals(0x00FF00, PS.gridColor([0, 256, 0])); //clamp max green array
    assertEquals(0x000000, PS.gridColor([0, 0, -1])); //clamp min blue array
    assertEquals(0x0000FF, PS.gridColor([0, 0, 256])); //clamp max blue array
    assertEquals(0x000000, PS.gridColor(-1)); //clamp min multiplex
    assertEquals(0xFFFFFF, PS.gridColor(0xFFFFFF + 1)); //clamp max multiplex
    assertEquals(0x000000, PS.gridColor({r : -1, g : 0, b: 0})); //clamp min red object
    assertEquals(0xFF0000, PS.gridColor({r : 256, g : 0, b: 0})); //clamp max red object
    assertEquals(0x000000, PS.gridColor({r : 0, g : -1, b: 0})); //clamp min green object
    assertEquals(0x00FF00, PS.gridColor({r : 0, g : 256, b: 0})); //clamp max green object
    assertEquals(0x000000, PS.gridColor({r : 0, g : 0, b: -1})); //clamp min blue object
    assertEquals(0x0000FF, PS.gridColor({r : 0, g : 0, b: 256})); //clamp max blue object
    assertEquals(0x000000, PS.gridColor({rgb : -1})); //clamp min rgb object
    assertEquals(0xFFFFFF, PS.gridColor({rgb : 0xFFFFFF + 1})); //clamp max rgb object
}

PSTest.prototype.testGridColorRGBOverride = function() { //test that rgb field in color object is correctly taking precedence when able
    assertEquals(0x000000, PS.gridColor({r: 1, g: 1, b:1, rgb : 0x000000}))
    assertEquals(0x010101, PS.gridColor({r: 1, g: 1, b:1, rgb : null}));
    assertEquals(PS.ERROR, PS.gridColor({r: 0, g: 0, b:0, rgb : NaN}));
}

PSTest.prototype.testGridFadeArgCheck = function() { //tests that malformed arguments are correctly handled as errors
    assertEquals(PS.ERROR, PS.gridFade(null)); //null rate
    assertEquals(PS.ERROR, PS.gridFade(NaN)); //wrong type rate
    assertEquals(PS.ERROR, PS.gridFade(0, NaN)); //wrong type options
    assertEquals(PS.ERROR, PS.gridFade(0, null)); //null options
    assertEquals(PS.ERROR, PS.gridFade(0, {rgb: NaN})); //wrong type rgb
    assertEquals(PS.ERROR, PS.gridFade(0, {onEnd: NaN})); //wrong type onEnd
    assertEquals(PS.ERROR, PS.gridFade(0, {params: NaN})); //wrong type params
    assertEquals(PS.ERROR, PS.gridFade(0, {rgb: 0}, 0)); //too many args
}

PSTest.prototype.testGridFadeCurrentDefault = function() { //tests that the PS.CURRENT and PS.DEFAULT arguments are handled correctly
    assertEquals({rate: 0, rgb: null, onEnd: null, params: null},
        PS.gridFade()); //implied current both
    assertEquals({rate: 1, rgb: null, onEnd: null, params: null},
        PS.gridFade(1));//implied current options
    assertEquals({rate: 0, rgb: 0, onEnd: doNothing, params: [0]},
        PS.gridFade(PS.DEFAULT, {rgb: 0, onEnd: doNothing, params: [0]})); //default rate
    assertEquals({rate: 0, rgb: 0, onEnd: doNothing, params: [0]},
        PS.gridFade(PS.CURRENT, {rgb: 0, onEnd: doNothing, params: [0]})); //current rate
    assertEquals({rate: 1, rgb: null, onEnd: null, params: null},
        PS.gridFade(1, PS.DEFAULT)); //default options
    assertEquals({rate: 1, rgb: null, onEnd: null, params: null},
        PS.gridFade(1, PS.CURRENT)); //current options
    assertEquals({rate: 1, rgb: null, onEnd: doNothing, params: [0]},
        PS.gridFade(1, {rgb: PS.DEFAULT, onEnd: doNothing, params: [0]})); //default rgb
    assertEquals({rate: 1, rgb: null, onEnd: doNothing, params: [0]},
        PS.gridFade(1, {rgb: PS.CURRENT, onEnd: doNothing, params: [0]})); //current rgb
    assertEquals({rate: 1, rgb: 0, onEnd: null, params: [0]},
        PS.gridFade(1, {rgb: 0, onEnd: PS.DEFAULT, params: [0]})); //default onEnd
    assertEquals({rate: 1, rgb: 0, onEnd: null, params: [0]},
        PS.gridFade(1, {rgb: 0, onEnd: PS.CURRENT, params: [0]})); //current onEnd
    assertEquals({rate: 1, rgb: 0, onEnd: doNothing, params: null},
        PS.gridFade(1, {rgb: 0, onEnd: doNothing, params: PS.DEFAULT})); //default params
    assertEquals({rate: 1, rgb: 0, onEnd: doNothing, params: null},
        PS.gridFade(1, {rgb: 0, onEnd: doNothing, params: PS.CURRENT})); //current params

}

PSTest.prototype.testGridFadeClamp = function() { //tests that values are being correctly clamped
    assertEquals(0, PS.gridFade(-1).rate); //clamp rate
    assertEquals(0x000000, PS.gridFade(1, {rgb: -1}).rgb); //clamp min rgb
    assertEquals(0xFFFFFF, PS.gridFade(1, {rgb: 0xFFFFFF +1}).rgb); //clamp max rgb
}

PSTest.prototype.testGridPlaneArgCheck = function(){ //test that malformed arguments are being handled correctly as errors
    assertEquals(PS.ERROR, PS.gridPlane(null)); //null plane
    assertEquals(PS.ERROR, PS.gridPlane(NaN)); //wrong type plane
    assertEquals(PS.ERROR, PS.gridPlane(0, 0)); //too many arguments
};

PSTest.prototype.testGridPlaneCurrentDefault = function(){
    assertEquals(0, PS.gridPlane()); //implied current plane
    assertEquals(0, PS.gridPlane(PS.CURRENT)); //explicit current plane
    assertEquals(0, PS.gridPlane(PS.DEFAULT)); //default plane
};

PSTest.prototype.testGridPlaneClamp = function(){
    assertEquals(0, PS.gridPlane(-1));
};

PSTest.prototype.testGridPlaneIndependence = function(){
    PS.color(0,0, 0x000000); //assign bead black at plane 0
    PS.gridPlane(1); //switch planes
    assertEquals(0xFFFFFF, PS.color(0,0)); //assert that bead is still white at plane 1
}

//endregion

//region Bead Functions
var bead_functions = [PS.color, PS.alpha, PS.fade, PS.scale, PS.radius, PS.data, PS.exec, PS.visible, PS.active,
    PS.border, PS.borderColor, PS.borderAlpha, PS.borderFade,
    PS.glyph, PS.glyphColor, PS.glyphAlpha, PS.glyphScale, PS.glyphFade];

PSTest.prototype.testBeadFunctionCoordCheck = function(){ //tests that malformed coordinates are handled correctly as errors
    PS.gridSize(8, 8);
	for(var i = 0; i < bead_functions.length; i++){
        var msg = "Assertion failed on function " + i;
        assertEquals(msg, PS.ERROR, bead_functions[i]());        //no coords given
        assertEquals(msg, PS.ERROR, bead_functions[i](0));       //no y coord given
        assertEquals(msg, PS.ERROR, bead_functions[i](-1, 0));   //x coord below min bound
        assertEquals(msg, PS.ERROR, bead_functions[i](0, -1));   //y coord below min bound
        assertEquals(msg, PS.ERROR, bead_functions[i](8, 0));    //x coord above max bound
        assertEquals(msg, PS.ERROR, bead_functions[i](0, 8));    //y coord above max bound
        assertEquals(msg, PS.ERROR, bead_functions[i](NaN, 0));  //x coord wrong type
        assertEquals(msg, PS.ERROR, bead_functions[i](0, NaN));  //y coord wrong type
        assertEquals(msg, PS.ERROR, bead_functions[i](null, 0)); //x coord null
        assertEquals(msg, PS.ERROR, bead_functions[i](0, null)); //y coord null
    }
}

beadFunctionIndependenceAll = function (func, input_val, default_val){
    for(var i = 0; i < 4; i++){
        var test_name;
        if(i == 0) { func(0, 0, input_val); test_name = "single bead"; }
        if(i == 1) { func(PS.ALL, 0, input_val); test_name = "single row"; }
        if(i == 2) { func(0, PS.ALL, input_val); test_name = "single column"; }
        if(i == 3) { func(PS.ALL, PS.ALL, input_val); test_name = "all beads"; }
        for(var j = 0; j < 8; j++) for( var k = 0; k < 8; k++){
            var msg = "Failed for " + test_name + " at bead " + j + "," + k;
            var this_bead = func(j, k); //get current state of bead
            func(j, k, PS.DEFAULT); //set bead back to default for later tests
            if((i != 1 && i != 3 && j != 0) || (i != 2 && i != 3 && k != 0)){ //check all non-specified beads
                assertEquals(msg, default_val, this_bead); //assert than beads other than the specified have not been changed
            }
            else { //assert that specified bead has been changed
                if(func == PS.fade || func == PS.borderFade || func == PS.glyphFade){
                    assertEquals(msg, input_val, this_bead.rate); //special case since fade returns type dif from arg
                }
                else if(func == PS.border){
                    assertEquals(msg, input_val, this_bead.width); //special case since border returns type dif from arg
                }
                else assertEquals(msg, input_val, this_bead);
            }
        }
    }
}

PSTest.prototype.testBeadFunctionIndependenceAll = function() { //tests that bead functions apply to all specified beads and only them
    beadFunctionIndependenceAll(PS.color, 0x000000, 0xFFFFFF);
    beadFunctionIndependenceAll(PS.alpha, 0, 255);
    beadFunctionIndependenceAll(PS.fade, 1, {rate: 0, rgb: null, onEnd: null, params: null});
    beadFunctionIndependenceAll(PS.scale, 50, 100);
    beadFunctionIndependenceAll(PS.radius, 1, 0);
    beadFunctionIndependenceAll(PS.data, doNothing, 0x0);
    beadFunctionIndependenceAll(PS.exec, doNothing, null);
    beadFunctionIndependenceAll(PS.visible, false, true);
    beadFunctionIndependenceAll(PS.active, false, true);
    beadFunctionIndependenceAll(PS.border, 2, {top: 1, left: 1, bottom: 1, right: 1, equal: true, width: 1});
    beadFunctionIndependenceAll(PS.borderColor, 0x000000, PS.COLOR_GRAY);
    beadFunctionIndependenceAll(PS.borderAlpha, 0, 255);
    beadFunctionIndependenceAll(PS.borderFade, 1, {rate: 0, rgb: null, onEnd: null, params: null});
    beadFunctionIndependenceAll(PS.glyph, 1, 0);
    beadFunctionIndependenceAll(PS.glyphColor, 0xFFFFFF, 0x000000);
    beadFunctionIndependenceAll(PS.glyphAlpha, 0, 255);
    beadFunctionIndependenceAll(PS.glyphScale, 50, 100);
    beadFunctionIndependenceAll(PS.glyphFade, 1, {rate: 0, rgb: null, onEnd: null, params: null});
}

var bead_color_functions = [PS.color, PS.borderColor, PS.glyphColor];
PSTest.prototype.testBeadFunctionColorArgCheck = function(){ //tests that malformed arguments are correctly handled as errors
    for(var i = 0; i < bead_color_functions.length; i++){
        var msg = "Failed at function " + i;
        assertEquals(msg, PS.ERROR, bead_color_functions[i](0, 0, null, 0, 0)); //null red triplet
        assertEquals(msg, PS.ERROR, bead_color_functions[i](0, 0, 0, null, 0)); //null green triplet
        assertEquals(msg, PS.ERROR, bead_color_functions[i](0, 0, 0, 0, null)); //null blue triplet
        assertEquals(msg, PS.ERROR, bead_color_functions[i](0, 0, NaN, 0, 0)); //wrong type red triplet
        assertEquals(msg, PS.ERROR, bead_color_functions[i](0, 0, 0, NaN, 0)); //wrong type green triplet
        assertEquals(msg, PS.ERROR, bead_color_functions[i](0, 0, 0, 0, NaN)); //wrong type blue triplet
        assertEquals(msg, PS.ERROR, bead_color_functions[i](0, 0, [null, 0, 0])); //null red array
        assertEquals(msg, PS.ERROR, bead_color_functions[i](0, 0, [0, null, 0])); //null green array
        assertEquals(msg, PS.ERROR, bead_color_functions[i](0, 0, [0, 0, null])); //null blue array
        assertEquals(msg, PS.ERROR, bead_color_functions[i](0, 0, [NaN, 0, 0])); //wrong type red array
        assertEquals(msg, PS.ERROR, bead_color_functions[i](0, 0, [0, NaN, 0])); //wrong type green array
        assertEquals(msg, PS.ERROR, bead_color_functions[i](0, 0, [0, 0, NaN])); //wrong type blue array
        assertEquals(msg, PS.ERROR, bead_color_functions[i](0, 0, null)); //null multiplex
        assertEquals(msg, PS.ERROR, bead_color_functions[i](0, 0, NaN)); //wrong type multiplex
        assertEquals(msg, PS.ERROR, bead_color_functions[i](0, 0, {r : null, g : 0, b: 0})); //null red object
        assertEquals(msg, PS.ERROR, bead_color_functions[i](0, 0, {r : 0, g : null, b: 0})); //null green object
        assertEquals(msg, PS.ERROR, bead_color_functions[i](0, 0, {r : 0, g : 0, b: null})); //null blue object
        assertEquals(msg, PS.ERROR, bead_color_functions[i](0, 0, {r : NaN, g : 0, b: 0})); //wrong type red object
        assertEquals(msg, PS.ERROR, bead_color_functions[i](0, 0, {r : 0, g : NaN, b: 0})); //wrong type green object
        assertEquals(msg, PS.ERROR, bead_color_functions[i](0, 0, {r : 0, g : 0, b: NaN})); //wrong type blue object
        assertEquals(msg, PS.ERROR, bead_color_functions[i](0, 0, {rgb: NaN})); //wrong type rgb object
        assertEquals(msg, PS.ERROR, bead_color_functions[i](0, 0, 0, 0, 0, 0)); //too many arguments numbers
        assertEquals(msg, PS.ERROR, bead_color_functions[i](0, 0, [0, 0, 0], [0, 0, 0])); //multiple arrays
        assertEquals(msg, PS.ERROR, bead_color_functions[i](0, 0, {rgb : 0}, {rgb : 0})); //multiple objects
    }
}

PSTest.prototype.testBeadFunctionColorCurrentDefault = function() { //tests that the PS.CURRENT and PS.DEFAULT arguments are handled correctly
    var color_defaults = [[0xFF0000, 0x00FF00, 0x0000FF], [0x800000, 0x008000, 0x000080], [0x000000, 0x000000, 0x000000]];
    for(var i = 0; i < bead_color_functions.length; i++){
        var msg = "Failed at function " + i;
        assertEquals(msg, color_defaults[i][0] + color_defaults[i][1] + color_defaults[i][2],
            bead_color_functions[i](0, 0)); //implied current multiplex
        assertEquals(msg, color_defaults[i][0] + color_defaults[i][1] + color_defaults[i][2],
            bead_color_functions[i](0, 0, PS.CURRENT)); //explicit current multiplex
        assertEquals(msg, color_defaults[i][0] + color_defaults[i][1] + color_defaults[i][2],
            bead_color_functions[i](0, 0, PS.DEFAULT)); //default multiplex
        assertEquals(msg, color_defaults[i][0] + 0x000101, bead_color_functions[i](0, 0, PS.DEFAULT, 1, 1)); //default red triplet
        assertEquals(msg, color_defaults[i][0] + 0x000101, bead_color_functions[i](0, 0, PS.CURRENT, 1, 1)); //default red triplet
        assertEquals(msg, color_defaults[i][1] + 0x010001, bead_color_functions[i](0, 0, 1, PS.DEFAULT, 1)); //default green triplet
        assertEquals(msg, color_defaults[i][1] + 0x010001, bead_color_functions[i](0, 0, 1, PS.CURRENT, 1)); //current green triplet
        assertEquals(msg, color_defaults[i][2] + 0x010100, bead_color_functions[i](0, 0, 1, 1, PS.DEFAULT)); //default blue triplet
        assertEquals(msg, color_defaults[i][2] + 0x010100, bead_color_functions[i](0, 0, 1, 1, PS.CURRENT)); //current blue triplet
        assertEquals(msg, color_defaults[i][0] + 0x000101, bead_color_functions[i](0, 0, [PS.DEFAULT, 1, 1])); //default red array
        assertEquals(msg, color_defaults[i][0] + 0x000101, bead_color_functions[i](0, 0, [PS.CURRENT, 1, 1])); //default red array
        assertEquals(msg, color_defaults[i][1] + 0x010001, bead_color_functions[i](0, 0, [1, PS.DEFAULT, 1])); //default green array
        assertEquals(msg, color_defaults[i][1] + 0x010001, bead_color_functions[i](0, 0, [1, PS.CURRENT, 1])); //current green array
        assertEquals(msg, color_defaults[i][2] + 0x010100, bead_color_functions[i](0, 0, [1, 1, PS.DEFAULT])); //default blue array
        assertEquals(msg, color_defaults[i][2] + 0x010100, bead_color_functions[i](0, 0, [1, 1, PS.CURRENT])); //current blue array
        assertEquals(msg, color_defaults[i][0] + 0x000101, bead_color_functions[i](0, 0, {r : PS.DEFAULT, g : 1, b: 1})); //default red object
        assertEquals(msg, color_defaults[i][0] + 0x000101, bead_color_functions[i](0, 0, {r : PS.CURRENT, g : 1, b: 1})); //current red object
        assertEquals(msg, color_defaults[i][1] + 0x010001, bead_color_functions[i](0, 0, {r : 1, g : PS.DEFAULT, b: 1})); //default green object
        assertEquals(msg, color_defaults[i][1] + 0x010001, bead_color_functions[i](0, 0, {r : 1, g : PS.CURRENT, b: 1})); //current green object
        assertEquals(msg, color_defaults[i][2] + 0x010100, bead_color_functions[i](0, 0, {r : 1, g : 1, b: PS.DEFAULT})); //default blue object
        assertEquals(msg, color_defaults[i][2] + 0x010100, bead_color_functions[i](0, 0, {r : 1, g : 1, b: PS.CURRENT})); //current blue object
        assertEquals(msg, color_defaults[i][0] + color_defaults[i][1] + color_defaults[i][2],
            bead_color_functions[i](0, 0, {rgb: PS.DEFAULT})); //default rgb object
        assertEquals(msg, color_defaults[i][0] + color_defaults[i][1] + color_defaults[i][2],
            bead_color_functions[i](0, 0, {})); //implied current rgb object
        assertEquals(msg, color_defaults[i][0] + color_defaults[i][1] + color_defaults[i][2],
            bead_color_functions[i](0, 0, {rgb: PS.CURRENT})); //explicit current rgb object
        assertEquals(msg, color_defaults[i][0] + color_defaults[i][1] + color_defaults[i][2],
            bead_color_functions[i](0, 0, [])); //implied rgb array
        assertEquals(msg, color_defaults[i][0] + color_defaults[i][1] + color_defaults[i][2],
            bead_color_functions[i](0, 0, {rgb: null})); //implied rgb object
        assertEquals(msg, color_defaults[i][1] + color_defaults[i][2] + 0x010000, bead_color_functions[i](0, 0, [1])); //implied green and blue array
        assertEquals(msg, color_defaults[i][2] + 0x010100, bead_color_functions[i](0, 0, 1, 1)); //implied blue triplet
        assertEquals(msg, color_defaults[i][2] + 0x010100, bead_color_functions[i](0, 0, [1, 1])); //implied blue array
    }
}

PSTest.prototype.testBeadFunctionColorClamp = function(){ //tests that color expressions are being correctly clamped to RGB space
    for(var i = 0; i < bead_color_functions.length; i++){
        var msg = "Failed at function " + i;
        assertEquals(msg, 0x000000, bead_color_functions[i](0, 0, -1, 0, 0)); //clamp min red triplet
        assertEquals(msg, 0xFF0000, bead_color_functions[i](0, 0, 256, 0, 0)); //clamp max red triplet
        assertEquals(msg, 0x000000, bead_color_functions[i](0, 0, 0, -1, 0)); //clamp min green triplet
        assertEquals(msg, 0x00FF00, bead_color_functions[i](0, 0, 0, 256, 0)); //clamp max green triplet
        assertEquals(msg, 0x000000, bead_color_functions[i](0, 0, 0, 0, -1)); //clamp min blue triplet
        assertEquals(msg, 0x0000FF, bead_color_functions[i](0, 0, 0, 0, 256)); //clamp max blue triplet
        assertEquals(msg, 0x000000, bead_color_functions[i](0, 0, [-1, 0, 0])); //clamp min red array
        assertEquals(msg, 0xFF0000, bead_color_functions[i](0, 0, [256, 0, 0])); //clamp max red array
        assertEquals(msg, 0x000000, bead_color_functions[i](0, 0, [0, -1, 0])); //clamp min green array
        assertEquals(msg, 0x00FF00, bead_color_functions[i](0, 0, [0, 256, 0])); //clamp max green array
        assertEquals(msg, 0x000000, bead_color_functions[i](0, 0, [0, 0, -1])); //clamp min blue array
        assertEquals(msg, 0x0000FF, bead_color_functions[i](0, 0, [0, 0, 256])); //clamp max blue array
        assertEquals(msg, 0x000000, bead_color_functions[i](0, 0, -1)); //clamp min multiplex
        assertEquals(msg, 0xFFFFFF, bead_color_functions[i](0, 0, 0xFFFFFF + 1)); //clamp max multiplex
        assertEquals(msg, 0x000000, bead_color_functions[i](0, 0, {r : -1, g : 0, b: 0})); //clamp min red object
        assertEquals(msg, 0xFF0000, bead_color_functions[i](0, 0, {r : 256, g : 0, b: 0})); //clamp max red object
        assertEquals(msg, 0x000000, bead_color_functions[i](0, 0, {r : 0, g : -1, b: 0})); //clamp min green object
        assertEquals(msg, 0x00FF00, bead_color_functions[i](0, 0, {r : 0, g : 256, b: 0})); //clamp max green object
        assertEquals(msg, 0x000000, bead_color_functions[i](0, 0, {r : 0, g : 0, b: -1})); //clamp min blue object
        assertEquals(msg, 0x0000FF, bead_color_functions[i](0, 0, {r : 0, g : 0, b: 256})); //clamp max blue object
        assertEquals(msg, 0x000000, bead_color_functions[i](0, 0, {rgb : -1})); //clamp min rgb object
        assertEquals(msg, 0xFFFFFF, bead_color_functions[i](0, 0, {rgb : 0xFFFFFF + 1})); //clamp max rgb object
    }
}

PSTest.prototype.testBeadFunctionColorRGBOverride = function() { //test that rgb field in color object is correctly taking precedence when able
    for(var i = 0; i < bead_color_functions.length; i++){
        var msg = "Failed at function " + i;
        assertEquals(msg, 0x000000, bead_color_functions[i](0, 0, {r: 1, g: 1, b:1, rgb : 0x000000}))
        assertEquals(msg, 0x010101, bead_color_functions[i](0, 0, {r: 1, g: 1, b:1, rgb : null}));
        assertEquals(msg, PS.ERROR, bead_color_functions[i](0, 0, {r: 0, g: 0, b:0, rgb : NaN}));
    }
}

var bead_alpha_functions = [PS.alpha, PS.borderAlpha, PS.glyphAlpha];
PSTest.prototype.testBeadFunctionAlphaArgCheck = function(){ //tests that malformed arguments are correctly handled as errors
    for(var i = 0; i < bead_alpha_functions.length; i++){
        var msg = "Failed at function " + i;
        assertEquals(msg, PS.ERROR, bead_alpha_functions[i](0, 0, null)); //null alpha
        assertEquals(msg, PS.ERROR, bead_alpha_functions[i](0, 0, NaN)); //wrong type alpha
        assertEquals(msg, PS.ERROR, bead_alpha_functions[i](0, 0, 0, 0)); //too many args
    }
}

PSTest.prototype.testBeadFunctionAlphaCurrentDefault = function() { //tests that the PS.CURRENT and PS.DEFAULT arguments are handled correctly
    for(var i = 0; i < bead_alpha_functions.length; i++){
        var msg = "Failed at function " + i;
        assertEquals(msg, PS.ALPHA_OPAQUE, bead_alpha_functions[i](0, 0)); //implied current alpha
        assertEquals(msg, PS.ALPHA_OPAQUE, bead_alpha_functions[i](0, 0, PS.CURRENT)); //explicit current alpha
        assertEquals(msg, PS.ALPHA_OPAQUE, bead_alpha_functions[i](0, 0, PS.DEFAULT)); //default alpha
    }
}

PSTest.prototype.testBeadFunctionAlphaClamp = function() { //tests that values are clamped to 0-255 range
    for(var i = 0; i < bead_alpha_functions.length; i++){
        var msg = "Failed at function " + i;
        assertEquals(msg, PS.ALPHA_TRANSPARENT, bead_alpha_functions[i](0, 0, -1)); //clamp min
        assertEquals(msg, PS.ALPHA_OPAQUE, bead_alpha_functions[i](0, 0, 256)); //clamp max
    }
}

var bead_scale_functions = [PS.scale, PS.glyphScale];
PSTest.prototype.testBeadFunctionScaleArgCheck = function(){ //tests that malformed arguments are correctly handled as errors
    for(var i = 0; i < bead_scale_functions.length; i++){
        var msg = "Failed at function " + i;
        assertEquals(msg, PS.ERROR, bead_scale_functions[i](0, 0, null)); //null scale
        assertEquals(msg, PS.ERROR, bead_scale_functions[i](0, 0, NaN)); //wrong type scale
        assertEquals(msg, PS.ERROR, bead_scale_functions[i](0, 0, 0, 0)); //too many args
    }
}

PSTest.prototype.testBeadFunctionScaleCurrentDefault = function() { //tests that the PS.CURRENT and PS.DEFAULT arguments are handled correctly
    for(var i = 0; i < bead_scale_functions.length; i++){
        var msg = "Failed at function " + i;
        assertEquals(msg, 100, bead_scale_functions[i](0, 0)); //implied current scale
        assertEquals(msg, 100, bead_scale_functions[i](0, 0, PS.CURRENT)); //explicit current scale
        assertEquals(msg, 100, bead_scale_functions[i](0, 0, PS.DEFAULT)); //default scale
    }
}

PSTest.prototype.testBeadFunctionScaleClamp = function() { //tests that values are clamped to 50-100 range
    for(var i = 0; i < bead_scale_functions.length; i++){
        var msg = "Failed at function " + i;
        assertEquals(msg, 50, bead_scale_functions[i](0, 0, 49)); //clamp min
        assertEquals(msg, 100, bead_scale_functions[i](0, 0, 101)); //clamp max
    }
}

var bead_fade_functions = [PS.fade, PS.borderFade, PS.glyphFade];
PSTest.prototype.testBeadFunctionFadeArgCheck = function() { //tests that malformed arguments are correctly handled as errors
    for(var i = 0; i < bead_fade_functions.length; i++){
        var msg = "Failed at function " + i;
        assertEquals(msg, PS.ERROR, bead_fade_functions[i](0, 0, null)); //null rate
        assertEquals(msg, PS.ERROR, bead_fade_functions[i](0, 0, NaN)); //wrong type rate
        assertEquals(msg, PS.ERROR, bead_fade_functions[i](0, 0, 0, NaN)); //wrong type options
        assertEquals(msg, PS.ERROR, bead_fade_functions[i](0, 0, 0, null)); //null options
        assertEquals(msg, PS.ERROR, bead_fade_functions[i](0, 0, 0, {rgb: NaN})); //wrong type rgb
        assertEquals(msg, PS.ERROR, bead_fade_functions[i](0, 0, 0, {onEnd: NaN})); //wrong type onEnd
        assertEquals(msg, PS.ERROR, bead_fade_functions[i](0, 0, 0, {params: NaN})); //wrong type params
        assertEquals(msg, PS.ERROR, bead_fade_functions[i](0, 0, 0, {rgb: 0}, 0)); //too many args
    }
}

PSTest.prototype.testBeadFunctionFadeCurrentDefault = function() { //tests that the PS.CURRENT and PS.DEFAULT arguments are handled correctly
    for(var i = 0; i < bead_fade_functions.length; i++){
        var msg = "Failed at function " + i;
        assertEquals(msg, {rate: 0, rgb: null, onEnd: null, params: null},
            bead_fade_functions[i](0, 0)); //implied current both
        assertEquals(msg, {rate: 1, rgb: null, onEnd: null, params: null},
            bead_fade_functions[i](0, 0, 1));//implied current options
        assertEquals(msg, {rate: 0, rgb: 0, onEnd: doNothing, params: [0]},
            bead_fade_functions[i](0, 0, PS.DEFAULT, {rgb: 0, onEnd: doNothing, params: [0]})); //default rate
        assertEquals(msg, {rate: 0, rgb: 0, onEnd: doNothing, params: [0]},
            bead_fade_functions[i](0, 0, PS.CURRENT, {rgb: 0, onEnd: doNothing, params: [0]})); //current rate
        assertEquals(msg, {rate: 1, rgb: null, onEnd: null, params: null},
            bead_fade_functions[i](0, 0, 1, PS.DEFAULT)); //default options
        assertEquals(msg, {rate: 1, rgb: null, onEnd: null, params: null},
            bead_fade_functions[i](0, 0, 1, PS.CURRENT)); //current options
        assertEquals(msg, {rate: 1, rgb: null, onEnd: doNothing, params: [0]},
            bead_fade_functions[i](0, 0, 1, {rgb: PS.DEFAULT, onEnd: doNothing, params: [0]})); //default rgb
        assertEquals(msg, {rate: 1, rgb: null, onEnd: doNothing, params: [0]},
            bead_fade_functions[i](0, 0, 1, {rgb: PS.CURRENT, onEnd: doNothing, params: [0]})); //current rgb
        assertEquals(msg, {rate: 1, rgb: 0, onEnd: null, params: [0]},
            bead_fade_functions[i](0, 0, 1, {rgb: 0, onEnd: PS.DEFAULT, params: [0]})); //default onEnd
        assertEquals(msg, {rate: 1, rgb: 0, onEnd: null, params: [0]},
            bead_fade_functions[i](0, 0, 1, {rgb: 0, onEnd: PS.CURRENT, params: [0]})); //current onEnd
        assertEquals(msg, {rate: 1, rgb: 0, onEnd: doNothing, params: null},
            bead_fade_functions[i](0, 0, 1, {rgb: 0, onEnd: doNothing, params: PS.DEFAULT})); //default params
        assertEquals(msg, {rate: 1, rgb: 0, onEnd: doNothing, params: null},
            bead_fade_functions[i](0, 0, 1, {rgb: 0, onEnd: doNothing, params: PS.CURRENT})); //current params
    }
}

PSTest.prototype.testBeadFunctionFadeClamp = function() { //tests that values are being correctly clamped
    for(var i = 0; i < bead_fade_functions.length; i++){
        var msg = "Failed at function " + i;
        assertEquals(msg, 0, bead_fade_functions[i](0, 0, -1).rate); //clamp rate
        assertEquals(msg, 0x000000, bead_fade_functions[i](0, 0, 1, {rgb: -1}).rgb); //clamp min rgb
        assertEquals(msg, 0xFFFFFF, bead_fade_functions[i](0, 0, 1, {rgb: 0xFFFFFF +1}).rgb); //clamp max rgb
    }
}

PSTest.prototype.testRadiusArgCheck = function(){ //tests that malformed arguments are correctly handled as errors
    assertEquals(PS.ERROR, PS.radius(0, 0, null)); //null radius
    assertEquals(PS.ERROR, PS.radius(0, 0, NaN)); //wrong type radius
    assertEquals(PS.ERROR, PS.radius(0, 0, 0, 0)); //too many args
}

PSTest.prototype.testRadiusCurrentDefault = function() { //tests that the PS.CURRENT and PS.DEFAULT arguments are handled correctly
    assertEquals(0, PS.radius(0, 0)); //implied current radius
    assertEquals(0, PS.radius(0, 0, PS.CURRENT)); //explicit current radius
    assertEquals(0, PS.radius(0, 0, PS.DEFAULT)); //default radius
}

PSTest.prototype.testRadiusClamp = function() { //tests that values are clamped to 0-50 range
    assertEquals(0, PS.radius(0, 0, -1)); //clamp min
    assertEquals(50, PS.radius(0, 0, 51)); //clamp max
}

PSTest.prototype.testDataArgCheck = function(){ //tests that malformed arguments are correctly handled as errors
    assertEquals(PS.ERROR, PS.data(0, 0, 0, 0)); //too many args
}

PSTest.prototype.testDataCurrentDefault = function() { //tests that the PS.CURRENT and PS.DEFAULT arguments are handled correctly
    assertEquals(0, PS.data(0, 0)); //implied current data
    assertEquals(0, PS.data(0, 0, PS.CURRENT)); //explicit current data
    assertEquals(0, PS.data(0, 0, null)); //implied default data
    assertEquals(0, PS.data(0, 0, PS.DEFAULT)); //explicit default data
}

PSTest.prototype.testExecArgCheck = function(){ //tests that malformed arguments are correctly handled as errors
    assertEquals(PS.ERROR, PS.exec(0, 0, NaN)); //wrong type exec
    assertEquals(PS.ERROR, PS.exec(0, 0, null, 0)); //too many args
}

PSTest.prototype.testExecCurrentDefault = function() { //tests that the PS.CURRENT and PS.DEFAULT arguments are handled correctly
    assertEquals(null, PS.exec(0, 0)); //implied current exec
    assertEquals(null, PS.exec(0, 0, PS.CURRENT)); //explicit current exec
    assertEquals(null, PS.exec(0, 0, PS.DEFAULT)); //default exec
}

PSTest.prototype.testVisibleArgCheck = function(){ //tests that malformed arguments are correctly handled as errors
    assertEquals(PS.ERROR, PS.visible(0, 0, NaN)); //wrong type visibility
//  assertEquals(PS.ERROR, PS.visible(0, 0, null)); //null visibility
    assertEquals(PS.ERROR, PS.visible(0, 0, true, 0)); //too many args
}

PSTest.prototype.testVisibleCurrentDefault = function(){ //tests that the PS.CURRENT and PS.DEFAULT arguments are handled correctly
    assertEquals(true, PS.visible(0, 0)); //implied current visibility
    assertEquals(true, PS.visible(0, 0, PS.CURRENT)); //explicit current visibility
    assertEquals(true, PS.visible(0, 0, PS.DEFAULT)); //default visibility
}

PSTest.prototype.testActiveArgCheck = function(){ //tests that malformed arguments are correctly handled as errors
    assertEquals(PS.ERROR, PS.active(0, 0, NaN)); //wrong type visibility
//  assertEquals(PS.ERROR, PS.active(0, 0, null)); //null visibility
    assertEquals(PS.ERROR, PS.active(0, 0, true, 0)); //too many args
}

PSTest.prototype.testActiveCurrentDefault = function(){ //tests that the PS.CURRENT and PS.DEFAULT arguments are handled correctly
    assertEquals(true, PS.active(0, 0)); //implied current visibility
    assertEquals(true, PS.active(0, 0, PS.CURRENT)); //explicit current visibility
    assertEquals(true, PS.active(0, 0, PS.DEFAULT)); //default visibility
}

PSTest.prototype.testBorderArgCheck = function(){ //tests that malformed arguments are correctly handled as errors
    assertEquals(PS.ERROR, PS.border(0, 0, NaN)); //wrong type width
    assertEquals(PS.ERROR, PS.border(0, 0, null)); //null border
    assertEquals(PS.ERROR, PS.border(0, 0, {top: NaN})); //wrong type top
    assertEquals(PS.ERROR, PS.border(0, 0, {left: NaN})); //wrong type left
    assertEquals(PS.ERROR, PS.border(0, 0, {bottom: NaN})); //wrong type bottom
    assertEquals(PS.ERROR, PS.border(0, 0, {right: NaN})); //wrong type right
    assertEquals(PS.ERROR, PS.border(0, 0, {top: null})); //null top
    assertEquals(PS.ERROR, PS.border(0, 0, {left: null})); //null left
    assertEquals(PS.ERROR, PS.border(0, 0, {bottom: null})); //null bottom
    assertEquals(PS.ERROR, PS.border(0, 0, {right: null})); //null right
    assertEquals(PS.ERROR, PS.active(0, 0, 0, 0)); //too many args
}

PSTest.prototype.testBorderCurrentDefault = function(){ //tests that the PS.CURRENT and PS.DEFAULT arguments are handled correctly
    assertEquals({top: 1, left: 1, bottom: 1, right: 1, equal: true, width: 1},
        PS.border(0, 0)); //implied current width
    assertEquals({top: 1, left: 1, bottom: 1, right: 1, equal: true, width: 1},
        PS.border(0, 0, {})); //implied current width object
    assertEquals({top: 1, left: 1, bottom: 1, right: 1, equal: true, width: 1},
        PS.border(0, 0, PS.CURRENT)); //explicit current width
    assertEquals({top: 1, left: 1, bottom: 1, right: 1, equal: true, width: 1},
        PS.border(0, 0, PS.DEFAULT)); //default width
    assertEquals({top: 1, left: 0, bottom: 0, right: 0, equal: false, width: 1},
        PS.border(0, 0, {top: PS.DEFAULT, left: 0, bottom: 0, right: 0})); //default top width
    assertEquals({top: 1, left: 0, bottom: 0, right: 0, equal: false, width: 1},
        PS.border(0, 0, {top: PS.CURRENT, left: 0, bottom: 0, right: 0})); //current top width
    assertEquals({top: 0, left: 1, bottom: 0, right: 0, equal: false, width: 1},
        PS.border(0, 0, {top: 0, left: PS.DEFAULT, bottom: 0, right: 0})); //default left width
    assertEquals({top: 0, left: 1, bottom: 0, right: 0, equal: false, width: 1},
        PS.border(0, 0, {top: 0, left: PS.CURRENT, bottom: 0, right: 0})); //current left width
    assertEquals({top: 0, left: 0, bottom: 1, right: 0, equal: false, width: 1},
        PS.border(0, 0, {top: 0, left: 0, bottom: PS.DEFAULT, right: 0})); //default bottom width
    assertEquals({top: 0, left: 0, bottom: 1, right: 0, equal: false, width: 1},
        PS.border(0, 0, {top: 0, left: 0, bottom: PS.CURRENT, right: 0})); //current bottom width
    assertEquals({top: 0, left: 0, bottom: 0, right: 1, equal: false, width: 1},
        PS.border(0, 0, {top: 0, left: 0, bottom: 0, right: PS.DEFAULT})); //default right width
    assertEquals({top: 0, left: 0, bottom: 0, right: 1, equal: false, width: 1},
        PS.border(0, 0, {top: 0, left: 0, bottom: 0, right: PS.CURRENT})); //current right width
}

PSTest.prototype.testBorderGlyphRadiusRule = function(){
    PS.border(0, 0, {top: 1, left : 1, right : 1, bottom : 2});
    PS.radius(0, 0, 1);
    assertEquals({top: 2, left: 2, bottom: 2, right: 2, equal: true, width: 2}, PS.border(0, 0)); //test that border is changed after radius
    PS.radius(0, 0, PS.DEFAULT);
    PS.border(0, 0, PS.DEFAULT);
    PS.radius(0, 0, 1);
    assertEquals({top:2, left:2, bottom:2, right:2, equal:true, width:2}, PS.border(0, 0, {top: 1, left : 1, right: 1, bottom : 2}));//if before radius
    PS.radius(0, 0, PS.DEFAULT);
    PS.border(0, 0, {top: 1, left : 1, right : 1, bottom : 2});
    PS.glyph(0, 0, 1);
    assertEquals({top:2, left:2, bottom:2, right:2, equal:true, width:2}, PS.border(0, 0)); //test that border is changed after glyph
    PS.glyph(0, 0, PS.DEFAULT);
    PS.border(0, 0, PS.DEFAULT);
    PS.glyph(0, 0, 1);
    assertEquals({top:2, left:2, bottom:2, right:2, equal:true, width:2}, PS.border(0, 0, {top: 1, left : 1, right: 1, bottom : 2}));//if before glyph
};

PSTest.prototype.testGlyphArgCheck = function() { //tests that malformed arguments are correctly handled as errors
    assertEquals(PS.ERROR, PS.glyph(0, 0, null)); //null glyph
    assertEquals(PS.ERROR, PS.glyph(0, 0, NaN)); //wrong type glyph
    assertEquals(PS.ERROR, PS.borderFade(0, 0, 0, 0, 0)); //too many args
}

PSTest.prototype.testGlyphCurrentDefault = function() { //tests that the PS.CURRENT and PS.DEFAULT arguments are handled correctly
    assertEquals(0, PS.glyph(0, 0)); //implied current glyph
    assertEquals(0, PS.glyph(0, 0, PS.CURRENT)); //explicit current glyph
    assertEquals(0, PS.glyph(0, 0, PS.DEFAULT)); //default glyph
}

PSTest.prototype.testGlyphString = function() { //tests that the first character of a string is used and that empty string removes glyph
    assertEquals(0x000061, PS.glyph(0, 0,"abcd")); //a
    assertEquals(0, PS.glyph(0, 0, "")); //remove glyph
}

PSTest.prototype.testGlyphClamp = function() { //tests that values are being correctly clamped
    assertEquals(0, PS.glyph(0, 0, -1)); //clamp min
}
//endregion

//region Timer Functions

PSTest.prototype.testTimerStartArgCheck = function(){ //tests that malformed coordinates are handled correctly as errors
    assertEquals(PS.ERROR, PS.timerStart()); //no args
    assertEquals(PS.ERROR, PS.timerStart(1)); //only one arg
    assertEquals(PS.ERROR, PS.timerStart(NaN, doNothing)); //wrong type time
    assertEquals(PS.ERROR, PS.timerStart(null, doNothing)); //null time
    assertEquals(PS.ERROR, PS.timerStart(1, NaN)); //wrong type exec
    assertEquals(PS.ERROR, PS.timerStart(1, null)); //null exec
    assertEquals(PS.ERROR, PS.timerStart(0, doNothing)) //nonpositive time
}

PSTest.prototype.testTimerStartCount = function(){ //test that unique ids are incrementing correctly
    assertEquals("timer_0", PS.timerStart(1, doNothing)); //first
    assertEquals("timer_1", PS.timerStart(1, doNothing)); //second
}

PSTest.prototype.testTimerStopArgCheck = function(){ //tests that malformed coordinates are handled correctly as errors
    PS.timerStart(1, doNothing);
    assertEquals(PS.ERROR, PS.timerStop()); //no args
    assertEquals(PS.ERROR, PS.timerStop(null)); //null timer
    assertEquals(PS.ERROR, PS.timerStop(NaN)); //wrong type timer
    assertEquals(PS.ERROR, PS.timerStart("timer_0", 0)); //too many args
}

PSTest.prototype.testTimerStopValidateTimer = function(){ //test that PS.TimerStop behaves correctly for valid and invalid timers
    var timer = PS.timerStart(1, doNothing);
    assertEquals(timer, PS.timerStop(timer)); //stop a valid successfully
    assertEquals(PS.ERROR, PS.timerStop("timer_infinity")); //return error on invalid
}

//endregion

//region Status Line Functions

PSTest.prototype.testStatusLineArgCheck = function(){ //tests that malformed coordinates are handled correctly as errors
    assertEquals(PS.ERROR, PS.statusText(NaN)); //wrong type status
    assertEquals(PS.ERROR, PS.statusText(null)); //null status
    assertEquals(PS.ERROR, PS.statusText("text", "text")); //too many args
}

PSTest.prototype.testStatusLineCurrentDefault = function(){ //tests that the PS.CURRENT and PS.DEFAULT arguments are handled correctly
    assertEquals("", PS.statusText()); //implied current
    assertEquals("", PS.statusText(PS.CURRENT)); //explicit current
    assertEquals("", PS.statusText(PS.DEFAULT)); //default
}

PSTest.prototype.testStatusColorArgCheck = function(){ //tests that malformed arguments are correctly handled as errors
    assertEquals(PS.ERROR, PS.statusColor(null, 0, 0)); //null red triplet
    assertEquals(PS.ERROR, PS.statusColor(0, null, 0)); //null green triplet
    assertEquals(PS.ERROR, PS.statusColor(0, 0, null)); //null blue triplet
    assertEquals(PS.ERROR, PS.statusColor(NaN, 0, 0)); //wrong type red triplet
    assertEquals(PS.ERROR, PS.statusColor(0, NaN, 0)); //wrong type green triplet
    assertEquals(PS.ERROR, PS.statusColor(0, 0, NaN)); //wrong type blue triplet
    assertEquals(PS.ERROR, PS.statusColor([null, 0, 0])); //null red array
    assertEquals(PS.ERROR, PS.statusColor([0, null, 0])); //null green array
    assertEquals(PS.ERROR, PS.statusColor([0, 0, null])); //null blue array
    assertEquals(PS.ERROR, PS.statusColor([NaN, 0, 0])); //wrong type red array
    assertEquals(PS.ERROR, PS.statusColor([0, NaN, 0])); //wrong type green array
    assertEquals(PS.ERROR, PS.statusColor([0, 0, NaN])); //wrong type blue array
    assertEquals(PS.ERROR, PS.statusColor(null)); //null multiplex
    assertEquals(PS.ERROR, PS.statusColor(NaN)); //wrong type multiplex
    assertEquals(PS.ERROR, PS.statusColor({r : null, g : 0, b: 0})); //null red object
    assertEquals(PS.ERROR, PS.statusColor({r : 0, g : null, b: 0})); //null green object
    assertEquals(PS.ERROR, PS.statusColor({r : 0, g : 0, b: null})); //null blue object
    assertEquals(PS.ERROR, PS.statusColor({r : NaN, g : 0, b: 0})); //wrong type red object
    assertEquals(PS.ERROR, PS.statusColor({r : 0, g : NaN, b: 0})); //wrong type green object
    assertEquals(PS.ERROR, PS.statusColor({r : 0, g : 0, b: NaN})); //wrong type blue object
    assertEquals(PS.ERROR, PS.statusColor({rgb: NaN})); //wrong type rgb object
    assertEquals(PS.ERROR, PS.statusColor(0, 0, 0, 0)); //too many arguments numbers
    assertEquals(PS.ERROR, PS.statusColor([0, 0, 0], [0, 0, 0])); //multiple arrays
    assertEquals(PS.ERROR, PS.statusColor({rgb : 0}, {rgb : 0})); //multiple objects
}

PSTest.prototype.testStatusColorCurrentDefault = function() { //tests that the PS.CURRENT and PS.DEFAULT arguments are handled correctly
    assertEquals(0x000000, PS.statusColor(PS.CURRENT)); //current multiplex
    assertEquals(0x000000, PS.statusColor(PS.DEFAULT)); //default multiplex
    assertEquals(0x00FFFF, PS.statusColor(PS.DEFAULT, 255, 255)); //default red triplet
    assertEquals(0x00FFFF, PS.statusColor(PS.CURRENT, 255, 255)); //current red triplet
    assertEquals(0xFF00FF, PS.statusColor(255, PS.DEFAULT, 255)); //default green triplet
    assertEquals(0xFF00FF, PS.statusColor(255, PS.CURRENT, 255)); //current green triplet
    assertEquals(0xFFFF00, PS.statusColor(255, 255, PS.DEFAULT)); //default blue triplet
    assertEquals(0xFFFF00, PS.statusColor(255, 255, PS.CURRENT)); //current blue triplet
    assertEquals(0x00FFFF, PS.statusColor([PS.DEFAULT, 255, 255])); //default red array
    assertEquals(0x00FFFF, PS.statusColor([PS.CURRENT, 255, 255])); //current red array
    assertEquals(0xFF00FF, PS.statusColor([255, PS.DEFAULT, 255])); //default green array
    assertEquals(0xFF00FF, PS.statusColor([255, PS.CURRENT, 255])); //current green array
    assertEquals(0xFFFF00, PS.statusColor([255, 255, PS.DEFAULT])); //default blue array
    assertEquals(0xFFFF00, PS.statusColor([255, 255, PS.CURRENT])); //current blue array
    assertEquals(0x00FFFF, PS.statusColor({r : PS.DEFAULT, g : 255, b: 255})); //default red object
    assertEquals(0x00FFFF, PS.statusColor({r : PS.CURRENT, g : 255, b: 255})); //current red object
    assertEquals(0xFF00FF, PS.statusColor({r : 255, g : PS.DEFAULT, b: 255})); //default green object
    assertEquals(0xFF00FF, PS.statusColor({r : 255, g : PS.CURRENT, b: 255})); //current green object
    assertEquals(0xFFFF00, PS.statusColor({r : 255, g : 255, b: PS.DEFAULT})); //default blue object
    assertEquals(0xFFFF00, PS.statusColor({r : 255, g : 255, b: PS.CURRENT})); //current blue object
    assertEquals(0x000000, PS.statusColor({rgb: PS.DEFAULT})); //default rgb object
    assertEquals(0x000000, PS.statusColor({})); //implicit current rgb object
    assertEquals(0x000000, PS.statusColor({rgb: PS.CURRENT})); //explicit current rgb object
    assertEquals(0x000000, PS.statusColor([])); //implied rgb array
    assertEquals(0x000000, PS.statusColor({rgb: null})); //implied rgb object
    assertEquals(0xFF0000, PS.statusColor([255])); //implied green and blue array
    assertEquals(0xFFFF00, PS.statusColor(255, 255)); //implied blue triplet
    assertEquals(0xFFFF00, PS.statusColor([255, 255])); //implied blue array
}

PSTest.prototype.testStatusColorClamp = function(){ //tests that color expressions are being correctly clamped to RGB space
    assertEquals(0x000000, PS.statusColor(-1, 0, 0)); //clamp min red triplet
    assertEquals(0xFF0000, PS.statusColor(256, 0, 0)); //clamp max red triplet
    assertEquals(0x000000, PS.statusColor(0, -1, 0)); //clamp min green triplet
    assertEquals(0x00FF00, PS.statusColor(0, 256, 0)); //clamp max green triplet
    assertEquals(0x000000, PS.statusColor(0, 0, -1)); //clamp min blue triplet
    assertEquals(0x0000FF, PS.statusColor(0, 0, 256)); //clamp max blue triplet
    assertEquals(0x000000, PS.statusColor([-1, 0, 0])); //clamp min red array
    assertEquals(0xFF0000, PS.statusColor([256, 0, 0])); //clamp max red array
    assertEquals(0x000000, PS.statusColor([0, -1, 0])); //clamp min green array
    assertEquals(0x00FF00, PS.statusColor([0, 256, 0])); //clamp max green array
    assertEquals(0x000000, PS.statusColor([0, 0, -1])); //clamp min blue array
    assertEquals(0x0000FF, PS.statusColor([0, 0, 256])); //clamp max blue array
    assertEquals(0x000000, PS.statusColor(-1)); //clamp min multiplex
    assertEquals(0xFFFFFF, PS.statusColor(0xFFFFFF + 1)); //clamp max multiplex
    assertEquals(0x000000, PS.statusColor({r : -1, g : 0, b: 0})); //clamp min red object
    assertEquals(0xFF0000, PS.statusColor({r : 256, g : 0, b: 0})); //clamp max red object
    assertEquals(0x000000, PS.statusColor({r : 0, g : -1, b: 0})); //clamp min green object
    assertEquals(0x00FF00, PS.statusColor({r : 0, g : 256, b: 0})); //clamp max green object
    assertEquals(0x000000, PS.statusColor({r : 0, g : 0, b: -1})); //clamp min blue object
    assertEquals(0x0000FF, PS.statusColor({r : 0, g : 0, b: 256})); //clamp max blue object
    assertEquals(0x000000, PS.statusColor({rgb : -1})); //clamp min rgb object
    assertEquals(0xFFFFFF, PS.statusColor({rgb : 0xFFFFFF + 1})); //clamp max rgb object
}

PSTest.prototype.testStatusColorRGBOverride = function() { //test that rgb field in color object is correctly taking precedence when able
    assertEquals(0x000000, PS.statusColor({r: 1, g: 1, b:1, rgb : 0x000000}))
    assertEquals(0x010101, PS.statusColor({r: 1, g: 1, b:1, rgb : null}));
    assertEquals(PS.ERROR, PS.statusColor({r: 0, g: 0, b:0, rgb : NaN}));
}

PSTest.prototype.testStatusFadeArgCheck = function() { //tests that malformed arguments are correctly handled as errors
    assertEquals(PS.ERROR, PS.statusFade(null)); //null rate
    assertEquals(PS.ERROR, PS.statusFade(NaN)); //wrong type rate
    assertEquals(PS.ERROR, PS.statusFade(0, NaN)); //wrong type options
    assertEquals(PS.ERROR, PS.statusFade(0, null)); //null options
    assertEquals(PS.ERROR, PS.statusFade(0, {rgb: NaN})); //wrong type rgb
    assertEquals(PS.ERROR, PS.statusFade(0, {onEnd: NaN})); //wrong type onEnd
    assertEquals(PS.ERROR, PS.statusFade(0, {params: NaN})); //wrong type params
    assertEquals(PS.ERROR, PS.statusFade(0, {rgb: 0}, 0)); //too many args
}

PSTest.prototype.testStatusFadeCurrentDefault = function() { //tests that the PS.CURRENT and PS.DEFAULT arguments are handled correctly
    assertEquals({rate: 0, rgb: null, onEnd: null, params: null},
        PS.statusFade()); //implied current both
    assertEquals({rate: 1, rgb: null, onEnd: null, params: null},
        PS.statusFade(1));//implied current options
    assertEquals({rate: 0, rgb: 0, onEnd: doNothing, params: [0]},
        PS.statusFade(PS.DEFAULT, {rgb: 0, onEnd: doNothing, params: [0]})); //default rate
    assertEquals({rate: 0, rgb: 0, onEnd: doNothing, params: [0]},
        PS.statusFade(PS.CURRENT, {rgb: 0, onEnd: doNothing, params: [0]})); //current rate
    assertEquals({rate: 1, rgb: null, onEnd: null, params: null},
        PS.statusFade(1, PS.DEFAULT)); //default options
    assertEquals({rate: 1, rgb: null, onEnd: null, params: null},
        PS.statusFade(1, PS.CURRENT)); //current options
    assertEquals({rate: 1, rgb: null, onEnd: doNothing, params: [0]},
        PS.statusFade(1, {rgb: PS.DEFAULT, onEnd: doNothing, params: [0]})); //default rgb
    assertEquals({rate: 1, rgb: null, onEnd: doNothing, params: [0]},
        PS.statusFade(1, {rgb: PS.CURRENT, onEnd: doNothing, params: [0]})); //current rgb
    assertEquals({rate: 1, rgb: 0, onEnd: null, params: [0]},
        PS.statusFade(1, {rgb: 0, onEnd: PS.DEFAULT, params: [0]})); //default onEnd
    assertEquals({rate: 1, rgb: 0, onEnd: null, params: [0]},
        PS.statusFade(1, {rgb: 0, onEnd: PS.CURRENT, params: [0]})); //current onEnd
    assertEquals({rate: 1, rgb: 0, onEnd: doNothing, params: null},
        PS.statusFade(1, {rgb: 0, onEnd: doNothing, params: PS.DEFAULT})); //default params
    assertEquals({rate: 1, rgb: 0, onEnd: doNothing, params: null},
        PS.statusFade(1, {rgb: 0, onEnd: doNothing, params: PS.CURRENT})); //current params

}

PSTest.prototype.testStatusFadeClamp = function() { //tests that values are being correctly clamped
    assertEquals(0, PS.statusFade(-1).rate); //clamp rate
    assertEquals(0x000000, PS.statusFade(1, {rgb: -1}).rgb); //clamp min rgb
    assertEquals(0xFFFFFF, PS.statusFade(1, {rgb: 0xFFFFFF +1}).rgb); //clamp max rgb
}
//endregion

//region Image Functions

var stored_image; //image object to be tested
saveImage = function(imgobj){ //stores a loaded image
    stored_image = imgobj;
}
var test_bmp = "";

var data_fmt_1 = [1, 1, 1, 1, 0xFF0000, 0xFF0000, 0xFF0000, 0xFF0000,
                  1, 1, 0, 1, 0xFF0000, 0xFF0000, 0xFF0000, 0xFF0000,
                  1, 1, 0, 1, 0xFF0000, 0xFF0000, 0xFF0000, 0xFF0000,
                  1, 1, 2, 1, 0xFF0000, 0xFF0000, 0xFF0000, 0xFF0000,
                  1, 1, 0, 1, 0x00FF00, 0x00FF00, 0x00FF00, 0x00FF00,
                  1, 0, 1, 1, 0x00FF00, 0x00FF00, 0x00FF00, 0x00FF00,
                  1, 0, 1, 1, 0x00FF00, 0x00FF00, 0x00FF00, 0x00FF00,
                  1, 0, 1, 1, 0x00FF00, 0x00FF00, 0x00FF00, 0x00FF00];
var data_fmt_2 = [1,255, 1,255, 1,255, 1,255, 0xFF0000,255, 0xFF0000,255, 0xFF0000,255, 0xFF0000,255,
                  1,255, 1,255, 0,255, 1,255, 0xFF0000,255, 0xFF0000,255, 0xFF0000,255, 0xFF0000,255,
                  1,255, 1,255, 0,255, 1,255, 0xFF0000,255, 0xFF0000,255, 0xFF0000,255, 0xFF0000,255,
                  1,255, 1,255, 2,255, 1,255, 0xFF0000,255, 0xFF0000,255, 0xFF0000,255, 0xFF0000,255,
                  1,255, 1,255, 0,255, 1,255, 0x00FF00,255, 0x00FF00,255, 0x00FF00,255, 0x00FF00,255,
                  1,255, 0,255, 1,255, 1,255, 0x00FF00,255, 0x00FF00,255, 0x00FF00,255, 0x00FF00,255,
                  1,255, 0,255, 1,255, 1,255, 0x00FF00,255, 0x00FF00,255, 0x00FF00,255, 0x00FF00,255,
                  1,255, 0,255, 1,255, 1,255, 0x00FF00,255, 0x00FF00,255, 0x00FF00,255, 0x00FF00,255];
var data_fmt_3 = [1,2,3, 4,5,6, 7,8,9, 9,8,7, 6,5,4, 3,2,1, 1,2,3, 4,5,6,
                  7,8,9, 9,8,7, 6,5,4, 3,2,1, 1,2,3, 4,5,6, 7,8,9, 9,8,7,
                  6,5,4, 3,2,1, 1,2,3, 4,5,6, 7,8,9, 9,8,7, 6,5,4, 3,2,1,
                  1,2,3, 4,5,6, 7,8,9, 9,8,7, 6,5,4, 3,2,1, 1,2,3, 4,5,6,
                  7,8,9, 9,8,7, 6,5,4, 3,2,1, 1,2,3, 4,5,6, 7,8,9, 9,8,7,
                  6,5,4, 3,2,1, 1,2,3, 4,5,6, 7,8,9, 9,8,7, 6,5,4, 3,2,1,
                  1,2,3, 4,5,6, 7,8,9, 9,8,7, 6,5,4, 3,2,1, 1,2,3, 4,5,6,
                  7,8,9, 9,8,7, 6,5,4, 3,2,1, 1,2,3, 4,5,6, 7,8,9, 9,8,7];
var data_fmt_4 = [1,2,3,255, 4,5,6,255, 7,8,9,255, 9,8,7,255, 6,5,4,255, 3,2,1,255, 1,2,3,255, 4,5,6,255,
                  7,8,9,255, 9,8,7,255, 6,5,4,255, 3,2,1,255, 1,2,3,255, 4,5,6,255, 7,8,9,255, 9,8,7,255,
                  6,5,4,255, 3,2,1,255, 1,2,3,255, 4,5,6,255, 7,8,9,255, 9,8,7,255, 6,5,4,255, 3,2,1,255,
                  1,2,3,255, 4,5,6,255, 7,8,9,255, 9,8,7,255, 6,5,4,255, 3,2,1,255, 1,2,3,255, 4,5,6,255,
                  7,8,9,255, 9,8,7,255, 6,5,4,255, 3,2,1,255, 1,2,3,255, 4,5,6,255, 7,8,9,255, 9,8,7,255,
                  6,5,4,255, 3,2,1,255, 1,2,3,255, 4,5,6,255, 7,8,9,255, 9,8,7,255, 6,5,4,255, 3,2,1,255,
                  1,2,3,255, 4,5,6,255, 7,8,9,255, 9,8,7,255, 6,5,4,255, 3,2,1,255, 1,2,3,255, 4,5,6,255,
                  7,8,9,255, 9,8,7,255, 6,5,4,255, 3,2,1,255, 1,2,3,255, 4,5,6,255, 7,8,9,255, 9,8,7,255];

PSTest.prototype.testImageLoadArgCheck = function() { //tests that malformed coordinates are handled correctly as errors
    assertEquals(PS.ERROR, PS.imageLoad(NaN, saveImage)); //wrong type on filename
    assertEquals(PS.ERROR, PS.imageLoad(null, saveImage)); //null filename
    assertEquals(PS.ERROR, PS.imageLoad("nosuchimage.bmp", saveImage)); //image doesnt exist
    assertEquals(PS.ERROR, PS.imageLoad("test.gif", saveImage)); //wrong filetype
    assertEquals(PS.ERROR, PS.imageLoad(test_bmp, NaN)); //wrong type on exec
    assertEquals(PS.ERROR, PS.imageLoad(test_bmp, null)); //null exec
    assertEquals(PS.ERROR, PS.imageLoad(test_bmp, saveImage, NaN)); //wrong type on format
    assertEquals(PS.ERROR, PS.imageLoad(test_bmp, saveImage, null)); //null format
    assertEquals(PS.ERROR, PS.imageLoad(test_bmp, saveImage, 5)); //illegal format value
    assertEquals(PS.ERROR, PS.imageLoad(test_bmp, saveImage, 0)); //illegal format value
    assertEquals(PS.ERROR, PS.imageLoad(test_bmp, saveImage, 0, 0)); //too many arguments
    assertEquals(PS.ERROR, PS.imageLoad(test_bmp)); //too few arguments
}

PSTest.prototype.testImageLoadCount = function() { //test that unique IDs are being assigned
    assertEquals("image_0", PS.imageLoad("test.bmp", saveImage));
    assertEquals("image_1", PS.imageLoad("test.bmp", saveImage));
}

PSTest.prototype.testImageLoadBMP = function() {
    PS.imageLoad("test.bmp", saveImage);
    assertEquals(data_fmt_1, stored_image.data);
}

PSTest.prototype.testImageLoadJPG = function() {
    PS.imageLoad("test.jpg", saveImage);
    assertEquals(data_fmt_1, stored_image.data);
}

PSTest.prototype.testImageLoadPNG = function() {
    PS.imageLoad("test.png", saveImage);
    assertEquals(data_fmt_1, stored_image.data);
}

PSTest.prototype.testImageBlitArgCheck = function(){
    stored_image = {source: test_bmp, id: "image_0", width: 8, height: 8, pixelSize: 1, data: data_fmt_1};
    assertEquals(PS.ERROR, PS.imageBlit(stored_image, 0)); //too few args
    assertEquals(PS.ERROR, PS.imageBlit(stored_image, 0, 0, {}, 0)); //too many args
    assertEquals(PS.ERROR, PS.imageBlit(null, 0, 0)); //null image
    assertEquals(PS.ERROR, PS.imageBlit(NaN, 0, 0)); //wrong type image
    assertEquals(PS.ERROR, PS.imageBlit(stored_image, null, 0)); //null x
    assertEquals(PS.ERROR, PS.imageBlit(stored_image, NaN, 0)); //wrong type x
    assertEquals(PS.ERROR, PS.imageBlit(stored_image, 0, null)); //null y
    assertEquals(PS.ERROR, PS.imageBlit(stored_image, 0, NaN)); //wrong type y
    assertEquals(PS.ERROR, PS.imageBlit(stored_image, 0, 0, null)); //null region
    assertEquals(PS.ERROR, PS.imageBlit(stored_image, 0, 0, NaN)); //wrong type region
    assertEquals(PS.ERROR, PS.imageBlit(stored_image, 0, 0, {left: null, top: 4, width: 4, height: 4})); //null left
    assertEquals(PS.ERROR, PS.imageBlit(stored_image, 0, 0, {left: NaN, top: 4, width: 4, height: 4})); //wrong type left
    assertEquals(PS.ERROR, PS.imageBlit(stored_image, 0, 0, {left: 4, top: null, width: 4, height: 4})); //null top
    assertEquals(PS.ERROR, PS.imageBlit(stored_image, 0, 0, {left: 4, top: NaN, width: 4, height: 4})); //wrong type top
    assertEquals(PS.ERROR, PS.imageBlit(stored_image, 0, 0, {left: 4, top: 4, width: null, height: 4})); //null width
    assertEquals(PS.ERROR, PS.imageBlit(stored_image, 0, 0, {left: 4, top: 4, width: NaN, height: 4})); //wrong type width
    assertEquals(PS.ERROR, PS.imageBlit(stored_image, 0, 0, {left: 4, top: 4, width: 4, height: null})); //null height
    assertEquals(PS.ERROR, PS.imageBlit(stored_image, 0, 0, {left: 4, top: 4, width: 4, height: NaN})); //wrong type height
    assertEquals(PS.ERROR, PS.imageBlit(stored_image, 0, 0, {left: 8, top: 4, width: 5, height: 4})); //region extends beyond image
    assertEquals(PS.ERROR, PS.imageBlit(stored_image, 0, 0, {left: 4, top: 8, width: 4, height: 4})); //region extends beyond image
}

imageBlitDefaultRegion = function(region){
    if(typeof(region) == "undefined"){
        PS.imageBlit(stored_image, 0, 0);
        region = {left: 0, top: 0, width: stored_image.width, height: stored_image.height};
    }
    else if(region == PS.DEFAULT){
        PS.imageBlit(stored_image, 0, 0, PS.DEFAULT);
        region = {left: 0, top: 0, width: stored_image.width, height: stored_image.height};
    }
    else{
        PS.imageBlit(stored_image, 0, 0, region);
        if(typeof(region.left) == "undefined" || region.left == PS.DEFAULT) region.left = 0;
        if(typeof(region.top) == "undefined" || region.top == PS.DEFAULT) region.top = 0;
        if(typeof(region.width) == "undefined" || region.width == PS.DEFAULT) region.width = stored_image.width - region.left;
        if(typeof(region.height) == "undefined" || region.height == PS.DEFAULT) region.height = stored_image.height - region.top;
    }
    for(var i = 0; i < 8; i++) for(var j = 0; j < 8; j++){
        var msg = "Failed at coords " + i + "," + j;
        if(i >= region.top && i < region.top + region.height &&
            j >= region.left && j < region.left + region.width){
            assertEquals(msg, stored_image.data[j*8+i], PS.color(i, j)); //should be color of corresponding image pixel
        }
        else assertEquals(msg, PS.COLOR_WHITE, PS.color(i, j)); //outside region, should be white
        PS.color(i, j, PS.COLOR_WHITE); //set back to white for next loop
    }
}

PSTest.prototype.testImageBlitDefaultRegions = function(){ //test that PS.DEFAULT and unspecified region parameters are being handled correctly
    stored_image = {width: 8, height: 8, pixelSize: 1, data: data_fmt_1};
    imageBlitDefaultRegion(); //implied default region
    imageBlitDefaultRegion(PS.DEFAULT); //default region
    imageBlitDefaultRegion({top: 4, width: 4, height: 4}); //implied default left
    imageBlitDefaultRegion({left: PS.DEFAULT, top: 4, width: 4, height: 4}); //default left
    imageBlitDefaultRegion({left: 4, width: 4, height: 4}); //implied default top
    imageBlitDefaultRegion({left: 4, top: PS.DEFAULT, width: 4, height: 4}); //default top
    imageBlitDefaultRegion({left: 4, top: 4, height: 4}); //implied default width
    imageBlitDefaultRegion({left: 4, top: 4, width: PS.DEFAULT, height: 4}); //default width
    imageBlitDefaultRegion({left: 4, top: 4, width: 4}); //implied default height
    imageBlitDefaultRegion({left: 4, top: 4, width: 4, height: PS.DEFAULT}); //default height
}

PSTest.prototype.testImageBlitCutoff = function(){ //test that blitting will work even with image larger than grid
    var temp_data = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                     1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                     1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                     1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                     1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                     1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                     1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                     1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                     1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                     1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    stored_image = {source: test_bmp, id: "image_0", width: 10, height: 10, pixelSize: 1, data: temp_data};
    PS.imageBlit(stored_image, -1, -1);
    for(var i = 0; i < 4; i++) for (var j = 0; j < 4; j++){
        assertEquals(0, PS.color(i, j));
    }
}

PSTest.prototype.testImageBlitAlphaBlend = function(){ //tests that images with alpha values are being blended correctly
    //TODO: implement this
}

PSTest.prototype.testImageCaptureArgCheck = function(){ //tests that malformed coordinates are handled correctly as errors
    assertEquals(PS.ERROR, PS.imageCapture(null)); //null format
    assertEquals(PS.ERROR, PS.imageCapture(NaN)); //wrong type format
    assertEquals(PS.ERROR, PS.imageCapture(1, null)); //null region
    assertEquals(PS.ERROR, PS.imageCapture(1, NaN)); //wrong type region
    assertEquals(PS.ERROR, PS.imageCapture(1, {left: null})); //null left
    assertEquals(PS.ERROR, PS.imageCapture(1, {left: NaN})); //wrong type left
    assertEquals(PS.ERROR, PS.imageCapture(1, {top: null})); //null top
    assertEquals(PS.ERROR, PS.imageCapture(1, {top: NaN})); //wrong type top
    assertEquals(PS.ERROR, PS.imageCapture(1, {width: null})); //null width
    assertEquals(PS.ERROR, PS.imageCapture(1, {width: NaN})); //wrong type width
    assertEquals(PS.ERROR, PS.imageCapture(1, {height: null})); //null height
    assertEquals(PS.ERROR, PS.imageCapture(1, {height: NaN})); //wrong type height
    assertEquals(PS.ERROR, PS.imageCapture(1, {left: 8})); //left off grid
    assertEquals(PS.ERROR, PS.imageCapture(1, {top: 8})); //top off grid
    assertEquals(PS.ERROR, PS.imageCapture(1, {}, 0)); //too many args
}

imageCaptureDefaultRegion = function(region){
    if(typeof(region) == "undefined"){
        stored_image = PS.imageCapture();
        region = {left: 0, top: 0, width: stored_image.width, height: stored_image.height};
    }
    else if(region == PS.DEFAULT){
        stored_image = PS.imageCapture(PS.DEFAULT, PS.DEFAULT);
        region = {left: 0, top: 0, width: stored_image.width, height: stored_image.height};
    }
    else{
        stored_image = PS.imageCapture(PS.DEFAULT, region);
        if(typeof(region.left) == "undefined" || region.left == PS.DEFAULT) region.left = 0;
        if(typeof(region.top) == "undefined" || region.top == PS.DEFAULT) region.top = 0;
        if(typeof(region.width) == "undefined" || region.width == PS.DEFAULT) region.width = stored_image.width - region.left;
        if(typeof(region.height) == "undefined" || region.height == PS.DEFAULT) region.height = stored_image.height - region.top;
    }
    for(var i = 0; i < 8; i++) for(var j = 0; j < 8; j++){
        var msg = "Failed at coords " + i + "," + j;
        if(i >= region.top && i < region.top + region.height &&
            j >= region.left && j < region.left + region.width){
            assertEquals(msg, PS.color(i, j), //should be color of corresponding image pixel
                PS.makeRGB(stored_image.data[(j-region.left)*8*3+(i-region.top)*3],
                    stored_image.data[(j-region.left)*8*3+(i-region.top)*3+1],
                    stored_image.data[(j-region.left)*8*3+(i-region.top)*3+2]));
        }
    }
}

PSTest.prototype.testImageCaptureDefaultRegions = function(){ //tests that PS.DEFAULT and unspecificed region parameters are being handled correctly
    stored_image = {width: 8, height: 8, pixelSize: 1, data: data_fmt_1};
    PS.imageBlit(stored_image, 0, 0);
    imageCaptureDefaultRegion(); //implied default region
    imageCaptureDefaultRegion(PS.DEFAULT); //default region
    imageCaptureDefaultRegion({top: 4, width: 4, height: 4}); //implied default left
    imageCaptureDefaultRegion({left: PS.DEFAULT, top: 4, width: 4, height: 4}); //default left
    imageCaptureDefaultRegion({left: 4, width: 4, height: 4}); //implied default top
    imageCaptureDefaultRegion({left: 4, top: PS.DEFAULT, width: 4, height: 4}); //default top
    imageCaptureDefaultRegion({left: 4, top: 4, height: 4}); //implied default width
    imageCaptureDefaultRegion({left: 4, top: 4, width: PS.DEFAULT, height: 4}); //default width
    imageCaptureDefaultRegion({left: 4, top: 4, width: 4}); //implied default height
    imageCaptureDefaultRegion({left: 4, top: 4, width: 4, height: PS.DEFAULT}); //default height
}

PSTest.prototype.testImageCaptureFormat = function(){ //tests that different formats are outputting the correct objects
    var data_arrays = [data_fmt_1, data_fmt_2, data_fmt_3, data_fmt_4];
    for(var i = 0; i < 4; i++){
        var msg = "Failed on format " + (i + 1);
        stored_image = {source: test_bmp, id: "image_0", width: 8, height: 8, pixelSize: i+1, data: data_arrays[i]};
        PS.imageBlit(stored_image, 0, 0);
        stored_image = null; //make sure we arent getting old data
        stored_image = PS.imageCapture(i+1);
        assertEquals(msg, 8, stored_image.width);
        assertEquals(msg, 8, stored_image.height);
        assertEquals(msg, i+1, stored_image.pixelSize);
        assertEquals(msg, data_arrays[i], stored_image.data);
    }
}

PSTest.prototype.testImageDumpArgCheck = function(){ //tests that malformed coordinates are handled correctly as errors
    stored_image = {source: test_bmp, id: "image_0", width: 8, height: 8, pixelSize: 3, data: data_fmt_3};
    assertEquals(PS.ERROR, PS.imageDump()); //no args
    assertEquals(PS.ERROR, PS.imageDump(null)); //null image
    assertEquals(PS.ERROR, PS.imageDump(NaN)); //wrong type image
    assertEquals(PS.ERROR, PS.imageDump({width:0})); //malformed image object
    assertEquals(PS.ERROR, PS.imageDump(stored_image, null)); //null region
    assertEquals(PS.ERROR, PS.imageDump(stored_image, NaN)); //wrong type region
    assertEquals(PS.ERROR, PS.imageDump(stored_image, {left: null})); //null left
    assertEquals(PS.ERROR, PS.imageDump(stored_image, {left: NaN})); //wrong type left
    assertEquals(PS.ERROR, PS.imageDump(stored_image, {top: null})); //null top
    assertEquals(PS.ERROR, PS.imageDump(stored_image, {top: NaN})); //wrong type top
    assertEquals(PS.ERROR, PS.imageDump(stored_image, {width: null})); //null width
    assertEquals(PS.ERROR, PS.imageDump(stored_image, {width: NaN})); //wrong type width
    assertEquals(PS.ERROR, PS.imageDump(stored_image, {height: null})); //null height
    assertEquals(PS.ERROR, PS.imageDump(stored_image, {height: NaN})); //wrong type height
    assertEquals(PS.ERROR, PS.imageDump(stored_image, {left: 8})); //left off grid
    assertEquals(PS.ERROR, PS.imageDump(stored_image, {top: 8})); //top off grid
    assertEquals(PS.ERROR, PS.imageDump(stored_image, PS.DEFAULT, null)); //null format
    assertEquals(PS.ERROR, PS.imageDump(stored_image, PS.DEFAULT, NaN)); //wrong type format
    assertEquals(PS.ERROR, PS.imageDump(stored_image, PS.DEFAULT, 0)); //illegal format value
    assertEquals(PS.ERROR, PS.imageDump(stored_image, PS.DEFAULT, 5)); //illegal format value
    assertEquals(PS.ERROR, PS.imageDump(stored_image, PS.DEFAULT, PS.DEFAULT, null)); //null length
    assertEquals(PS.ERROR, PS.imageDump(stored_image, PS.DEFAULT, PS.DEFAULT, NaN)); //wrong type length
    assertEquals(PS.ERROR, PS.imageDump(stored_image, PS.DEFAULT, PS.DEFAULT, PS.DEFAULT, null)); //null hex
    assertEquals(PS.ERROR, PS.imageDump(stored_image, PS.DEFAULT, PS.DEFAULT, PS.DEFAULT, NaN)); //wrong type hex
}

//endregion

//region Lines & Paths Functions

PSTest.prototype.testLineArgCheck = function(){ //tests that malformed coordinates are handled correctly as errors
    assertEquals(PS.ERROR, PS.line(0, 0, 0)); //too few args
    assertEquals(PS.ERROR, PS.line(0, 0, 0, 0, 0)); //too many args
    assertEquals(PS.ERROR, PS.line(null, 0,  0, 0)); //null x1
    assertEquals(PS.ERROR, PS.line(NaN, 0,  0, 0)); //wrong type x1
    assertEquals(PS.ERROR, PS.line(0, null,  0, 0)); //null y1
    assertEquals(PS.ERROR, PS.line(0, NaN,  0, 0)); //wrong type y1
    assertEquals(PS.ERROR, PS.line(0, 0,  null, 0)); //null x2
    assertEquals(PS.ERROR, PS.line(0, 0,  NaN, 0)); //wrong type x2
    assertEquals(PS.ERROR, PS.line(0, 0, 0, null)); //null y2
    assertEquals(PS.ERROR, PS.line(0, 0, 0, NaN)); //wrong type y2
}

PSTest.prototype.testLineResultCheck = function(){ //tests that line is outputing correct path
    assertEquals([[0, 1], [0, 2], [0, 3]], PS.line(0, 0, 0, 3)); //straight vertical line
    assertEquals([[1, 0], [2, 0], [3, 0]], PS.line(0, 0, 3, 0)); //straight horizontal line
    assertEquals([[1, 1], [2, 2], [3, 3]], PS.line(0, 0, 3, 3)); //diagonal line
    assertEquals([[1, 1], [2, 1], [3, 2], [4, 2], [5, 3]], PS.line(0, 0, 5, 3)); //as straight as possible given the circumstances
}

PSTest.prototype.testPathMapArgCheck = function(){ //tests that malformed coordinates are handled correctly as errors
    stored_image = {source: test_bmp, id: "image_0", width: 8, height: 8, pixelSize: 1, data: data_fmt_1};
    assertEquals(PS.ERROR, PS.pathMap()); //too few args
    assertEquals(PS.ERROR, PS.pathMap(stored_image, stored_image)); //too many args
    assertEquals(PS.ERROR, PS.pathMap(null)); //null file
    assertEquals(PS.ERROR, PS.pathMap(NaN)); //wrong type file
    stored_image.pixelSize = 4;
    stored_image.width = 4;
    stored_image.height = 4;
    assertEquals(PS.ERROR, PS.pathMap(stored_image)); //wrong pixel data type
}

PSTest.prototype.testPathMapCount = function(){ //tests that pathmaps are being given unique ids correctly
    stored_image = {source: test_bmp, id: "image_0", width: 8, height: 8, pixelSize: 1, data: data_fmt_1};
    assertEquals("pathmap_0", PS.pathMap(stored_image)); //first
    assertEquals("pathmap_1", PS.pathMap(stored_image)); //second
}

PSTest.prototype.testPathFindArgCheck = function(){ //tests that malformed coordinates are handled correctly as errors
    stored_image = {source: test_bmp, id: "image_0", width: 8, height: 8, pixelSize: 1, data: data_fmt_1};
    var map = PS.pathMap(stored_image);
    assertEquals(PS.ERROR, PS.pathFind(map, 0, 0, 0)); //too few args
    assertEquals(PS.ERROR, PS.pathFind(map, 0, 0, 0, 0, 0, 0)); //too many args
    assertEquals(PS.ERROR, PS.pathFind(null, 0, 0, 0, 0)); //null map
    assertEquals(PS.ERROR, PS.pathFind(NaN, 0, 0, 0, 0)); //wrong type map
    assertEquals(PS.ERROR, PS.pathFind("path_infinity", 0, 0, 0, 0)); //map doesnt exist
    assertEquals(PS.ERROR, PS.pathFind(map, null, 0, 0, 0)); //null x1
    assertEquals(PS.ERROR, PS.pathFind(map, NaN, 0, 0, 0)); //wrong type x1
    assertEquals(PS.ERROR, PS.pathFind(map, 0, null, 0, 0)); //null y1
    assertEquals(PS.ERROR, PS.pathFind(map, 0, NaN, 0, 0)); //wrong type y1
    assertEquals(PS.ERROR, PS.pathFind(map, 0, 0, null, 0)); //null x2
    assertEquals(PS.ERROR, PS.pathFind(map, 0, 0, NaN, 0)); //wrong type x2
    assertEquals(PS.ERROR, PS.pathFind(map, 0, 0, 0, null)); //null y2
    assertEquals(PS.ERROR, PS.pathFind(map, 0, 0, 0, NaN)); //wrong type y2
    assertEquals(PS.ERROR, PS.pathFind(map, 8, 0, 0, 0)); //above max x1
    assertEquals(PS.ERROR, PS.pathFind(map, -1, 0, 0, 0)); //below min x1
    assertEquals(PS.ERROR, PS.pathFind(map, 0, 8, 0, 0)); //above max y1
    assertEquals(PS.ERROR, PS.pathFind(map, 0, -1, 0, 0)); //below min y1
    assertEquals(PS.ERROR, PS.pathFind(map, 0, 0, 8, 0)); //above max x2
    assertEquals(PS.ERROR, PS.pathFind(map, 0, 0, -1, 0)); //below min x2
    assertEquals(PS.ERROR, PS.pathFind(map, 0, 0, 0, 8)); //above max y2
    assertEquals(PS.ERROR, PS.pathFind(map, 0, 0, 0, -1)); //below min y2
    assertEquals(PS.ERROR, PS.pathFind(map, 0, 0, 0, 0, {no_diagonals: NaN})); //wrong type no_diagonals
    assertEquals(PS.ERROR, PS.pathFind(map, 0, 0, 0, 0, {no_diagonals: null})); //null no_diagonals
    assertEquals(PS.ERROR, PS.pathFind(map, 0, 0, 0, 0, {cut_corners: NaN})); //wrong type cut_corners
    assertEquals(PS.ERROR, PS.pathFind(map, 0, 0, 0, 0, {cut_corners: null})); //null cut_corners
    assertEquals(PS.ERROR, PS.pathFind(map, 0, 0, 0, 0, {direct: NaN})); //wrong type direct
}

PSTest.prototype.testPathFindResults = function(){ //tests that paths are actually the shortest obeying the rules given
    stored_image = {source: test_bmp, id: "image_0", width: 8, height: 8, pixelSize: 1, data: data_fmt_1};
    var map = PS.pathMap(stored_image);
    assertEquals([[0,6],[0,5],[0,4],[1,3],[2,3],[3,3],[3,4],[3,5],[3,6],[2,7]],             //diagonals allowed, no corner cutting
        PS.pathFind(map, 0, 7, 2, 7, {no_diagonals: false, cut_corners: false}));
    assertEquals([[0,6],[0,5],[1,4],[2,5],[2,6],[2,7]],                                     //diagonals and corner cutting allowed
        PS.pathFind(map, 0, 7, 2, 7, {no_diagonals: false, cut_corners: true}));
    assertEquals([[0,6],[0,5],[0,4],[1,4],[1,3],[2,3],[3,3],[3,4],[3,5],[3,6],[2,6],[2,7]], //no diagonals allowed
        PS.pathFind(map, 0, 7, 2, 7, {no_diagonals: true, cut_corners: false}));
}

PSTest.prototype.testPathFindDefault = function(){ //tests that defaults are handled correctly
    stored_image = {source: test_bmp, id: "image_0", width: 8, height: 8, pixelSize: 1, data: data_fmt_1};
    var map = PS.pathMap(stored_image);
    assertEquals(PS.pathFind(map, 0, 7, 2, 7, {no_diagonals: false, cut_corners: false}),
        PS.pathFind(map, 0, 7, 2, 7)); //implied options object
    assertEquals(PS.pathFind(map, 0, 7, 2, 7, {no_diagonals: false, cut_corners: false}),
        PS.pathFind(map, 0, 7, 2, 7, {})); //implied both options
    assertEquals(PS.pathFind(map, 0, 7, 2, 7, {no_diagonals: false, cut_corners: false}),
        PS.pathFind(map, 0, 7, 2, 7, PS.DEFAULT)); //explicit both default
    assertEquals(PS.pathFind(map, 0, 7, 2, 7, {no_diagonals: false, cut_corners: false}),
        PS.pathFind(map, 0, 7, 2, 7, {no_diagonals: false})); //implied cut_corners
    assertEquals(PS.pathFind(map, 0, 7, 2, 7, {no_diagonals: false, cut_corners: false}),
        PS.pathFind(map, 0, 7, 2, 7, {no_diagonals: false, cut_corners: PS.DEFAULT})); //explicit cut_corners
    assertEquals(PS.pathFind(map, 0, 7, 2, 7, {no_diagonals: false, cut_corners: false}),
        PS.pathFind(map, 0, 7, 2, 7, {cut_corners: false})); //implied no_diagonals
    assertEquals(PS.pathFind(map, 0, 7, 2, 7, {no_diagonals: false, cut_corners: false}),
        PS.pathFind(map, 0, 7, 2, 7, {no_diagonals: PS.DEFAULT, cut_corners: false})); //explicit no_diagonals
}

PSTest.prototype.testPathDataArgCheck = function() { //tests that malformed coordinates are handled correctly as errors
    stored_image = {source: test_bmp, id: "image_0", width: 8, height: 8, pixelSize: 1, data: data_fmt_1};
    var map = PS.pathMap(stored_image);
    assertEquals(PS.ERROR, PS.pathData(map, 0, 0, 8)); //too few args
    assertEquals(PS.ERROR, PS.pathData(map, 0, 0, 8, 8, 0, 0)); //too many args
    assertEquals(PS.ERROR, PS.pathData(null, 0, 0, 8, 8)); //null map
    assertEquals(PS.ERROR, PS.pathData(NaN, 0, 0, 8, 8)); //wrong type map
    assertEquals(PS.ERROR, PS.pathData("path_infinity", 0, 0, 8, 0)); //map doesnt exist
    assertEquals(PS.ERROR, PS.pathData(map, null, 0, 8, 8)); //null left
    assertEquals(PS.ERROR, PS.pathData(map, NaN, 0, 8, 8)); //wrong type left
    assertEquals(PS.ERROR, PS.pathData(map, 0, null, 8, 8)); //null top
    assertEquals(PS.ERROR, PS.pathData(map, 0, NaN, 8, 8)); //wrong type top
    assertEquals(PS.ERROR, PS.pathData(map, 0, 0, null, 8)); //null width
    assertEquals(PS.ERROR, PS.pathData(map, 0, 0, NaN, 8)); //wrong type width
    assertEquals(PS.ERROR, PS.pathData(map, 0, 0, 8, null)); //null height
    assertEquals(PS.ERROR, PS.pathData(map, 0, 0, 8, NaN)); //wrong type height
    assertEquals(PS.ERROR, PS.pathData(map, 8, 0, 8, 8)); //above max left
    assertEquals(PS.ERROR, PS.pathData(map, -1, 0, 8, 8)); //below min left
    assertEquals(PS.ERROR, PS.pathData(map, 0, 8, 8, 8)); //above max top
    assertEquals(PS.ERROR, PS.pathData(map, 0, -1, 8, 8)); //below min top
    assertEquals(PS.ERROR, PS.pathData(map, 0, -1, 8, 8, null)); //null data
    assertEquals(PS.ERROR, PS.pathData(map, 0, -1, 8, 8, NaN)); //wrong type data
}

PSTest.prototype.testPathDataCurrentDefault = function () { //tests that PS.DEFAULT and PS.CURRENT are working along with unsupplied args
    stored_image = {source: test_bmp, id: "image_0", width: 8, height: 8, pixelSize: 1, data: data_fmt_1};
    var map = PS.pathMap(stored_image);
    assertEquals([1, 1, 1, 1, 1, 1, 1, 1], PS.pathData(map, 0, 0, PS.DEFAULT, 8)); //default width
    assertEquals([1, 1, 1, 1, 0xFF0000, 0xFF0000, 0xFF0000, 0xFF0000], PS.pathData(map, 0, 0, 8, PS.DEFAULT)); //default height
    PS.pathData(map, 0, 0, 1, 1, 2); //set data to a different value
    assertEquals([2], PS.pathData(map, 0, 0, 1, 1, PS.CURRENT)); //return to original value
    assertEquals([1], PS.pathData(map, 0, 0, 1, 1, PS.DEFAULT)); //current value
}

PSTest.prototype.testPathDataClamp = function () { //tests that width and height are being clamped correctly
    stored_image = {source: test_bmp, id: "image_0", width: 8, height: 8, pixelSize: 1, data: data_fmt_1};
    var map = PS.pathMap(stored_image);
    assertEquals([1], PS.pathData(map, 0, 0, 0, 1)); //clamp min width
    assertEquals([1, 1, 1, 1, 0xFF0000, 0xFF0000, 0xFF0000, 0xFF0000], PS.pathData(map, 0, 0, 9, 1)); //clamp max width
    assertEquals([1], PS.pathData(map, 0, 0, 1, 0)); //clamp min height
    assertEquals([1, 1, 1, 1, 1, 1, 1, 1], PS.pathData(map, 0, 0, 1, 9)); //clamp max height
}

PSTest.prototype.testPathDelete = function () { //tests that malformed arguments are handled correctly as errors and valid ones are handled correctly
    assertEquals(PS.ERROR, PS.pathDelete(null)); //null path
    assertEquals(PS.ERROR, PS.pathDelete(NaN)); //wrong type path
    assertEquals(PS.ERROR, PS.pathDelete("path_infinity")); //path doesnt exist
    stored_image = {source: test_bmp, id: "image_0", width: 8, height: 8, pixelSize: 1, data: data_fmt_1};
    var map = PS.pathMap(stored_image);
    assertEquals(PS.DONE, PS.pathDelete(map));
    assertEquals(PS.ERROR, PS.pathDelete(map)); //already deleted
}

//endregion

//region Sprite Functions

PSTest.prototype.testSpriteSolidArgCheck = function() { //test that malformed inputs throw errors correctly
    assertEquals(PS.ERROR, PS.spriteSolid(1)); //too few args
    assertEquals(PS.ERROR, PS.spriteSolid(1, 1, 1)); //too many args
    assertEquals(PS.ERROR, PS.spriteSolid(null, 1)); //null width
    assertEquals(PS.ERROR, PS.spriteSolid(NaN, 1)); //wrong type width
    assertEquals(PS.ERROR, PS.spriteSolid(1, null)); //null height
    assertEquals(PS.ERROR, PS.spriteSolid(1, NaN)); //wrong type height
}

PSTest.prototype.testSpriteSolidDefaultColumn = function() { //tests default values for this function
    var sprite = PS.spriteSolid(PS.DEFAULT, 8); //default width
    PS.spriteMove(sprite, 0, 0);
    for(var i = 0; i < 8; i++) for(var j = 0; j<8; j++){
        var msg = "failed at coord " + i + "," + j;
        if(i == 0) assertEquals(msg, PS.COLOR_BLACK, PS.color(i, j));
        else assertEquals(msg, PS.COLOR_WHITE, PS.color(i, j));
        PS.color(i, j, PS.COLOR_WHITE);
    }
}

PSTest.prototype.testSpriteSolidDefaultRow = function() { //tests default values for this function
    var sprite = PS.spriteSolid(8,PS.DEFAULT); //default width
    PS.spriteMove(sprite, 0, 0);
    for(var i = 0; i < 8; i++) for(var j = 0; j<8; j++){
        var msg = "failed at coord " + i + "," + j;
        if(j == 0) assertEquals(msg, PS.COLOR_BLACK, PS.color(i, j));
        else assertEquals(msg, PS.COLOR_WHITE, PS.color(i, j));
        PS.color(i, j, PS.COLOR_WHITE);
    }
}

PSTest.prototype.testSpriteSolidClamp = function(){ //test that values are being clamped correctly
    var sprite = PS.spriteSolid(0, 1); //clamp width to 1
    PS.spriteMove(sprite, 0, 0);
    assertEquals(PS.COLOR_BLACK, PS.color(0,0));
    PS.spriteDelete(sprite);
    PS.color(0, 0, PS.COLOR_WHITE);
    sprite = PS.spriteSolid(1, 0); //clamp height to 1
    PS.spriteMove(sprite, 0, 0);
    assertEquals(PS.COLOR_BLACK, PS.color(0,0));
}

PSTest.prototype.testSpriteSolidColorArgCheck = function() { //test that malformed inputs throw errors correctly
    assertEquals(PS.ERROR, PS.spriteSolidColor());//too few arguments
    assertEquals(PS.ERROR, PS.spriteSolidColor(null));//null sprite
    assertEquals(PS.ERROR, PS.spriteSolidColor(NaN)); //wrong type sprite
    assertEquals(PS.ERROR, PS.spriteSolidColor("sprite_infinity")); //sprite doesnt exist
    stored_image = {source: test_bmp, id: "image_0", width: 8, height: 8, pixelSize: 1, data: data_fmt_1};
    var img_sprite = PS.spriteImage(stored_image);
    assertEquals(PS.ERROR, PS.spriteSolidColor(img_sprite));//sprite created by spriteImage not spriteSolid
    var solid_sprite = PS.spriteSolid(1, 1);
    assertEquals(PS.ERROR, PS.spriteSolidColor(solid_sprite, null, 0, 0)); //null red triplet
    assertEquals(PS.ERROR, PS.spriteSolidColor(solid_sprite, 0, null, 0)); //null green triplet
    assertEquals(PS.ERROR, PS.spriteSolidColor(solid_sprite, 0, 0, null)); //null blue triplet
    assertEquals(PS.ERROR, PS.spriteSolidColor(solid_sprite, NaN, 0, 0)); //wrong type red triplet
    assertEquals(PS.ERROR, PS.spriteSolidColor(solid_sprite, 0, NaN, 0)); //wrong type green triplet
    assertEquals(PS.ERROR, PS.spriteSolidColor(solid_sprite, 0, 0, NaN)); //wrong type blue triplet
    assertEquals(PS.ERROR, PS.spriteSolidColor(solid_sprite, [null, 0, 0])); //null red array
    assertEquals(PS.ERROR, PS.spriteSolidColor(solid_sprite, [0, null, 0])); //null green array
    assertEquals(PS.ERROR, PS.spriteSolidColor(solid_sprite, [0, 0, null])); //null blue array
    assertEquals(PS.ERROR, PS.spriteSolidColor(solid_sprite, [NaN, 0, 0])); //wrong type red array
    assertEquals(PS.ERROR, PS.spriteSolidColor(solid_sprite, [0, NaN, 0])); //wrong type green array
    assertEquals(PS.ERROR, PS.spriteSolidColor(solid_sprite, [0, 0, NaN])); //wrong type blue array
    assertEquals(PS.ERROR, PS.spriteSolidColor(solid_sprite, null)); //null multiplex
    assertEquals(PS.ERROR, PS.spriteSolidColor(solid_sprite, NaN)); //wrong type multiplex
    assertEquals(PS.ERROR, PS.spriteSolidColor(solid_sprite, {r : null, g : 0, b: 0})); //null red object
    assertEquals(PS.ERROR, PS.spriteSolidColor(solid_sprite, {r : 0, g : null, b: 0})); //null green object
    assertEquals(PS.ERROR, PS.spriteSolidColor(solid_sprite, {r : 0, g : 0, b: null})); //null blue object
    assertEquals(PS.ERROR, PS.spriteSolidColor(solid_sprite, {r : NaN, g : 0, b: 0})); //wrong type red object
    assertEquals(PS.ERROR, PS.spriteSolidColor(solid_sprite, {r : 0, g : NaN, b: 0})); //wrong type green object
    assertEquals(PS.ERROR, PS.spriteSolidColor(solid_sprite, {r : 0, g : 0, b: NaN})); //wrong type blue object
    assertEquals(PS.ERROR, PS.spriteSolidColor(solid_sprite, {rgb: NaN})); //wrong type rgb object
    assertEquals(PS.ERROR, PS.spriteSolidColor(solid_sprite, 0, 0, 0, 0)); //too many arguments numbers
    assertEquals(PS.ERROR, PS.spriteSolidColor(solid_sprite, [0, 0, 0], [0, 0, 0])); //multiple arrays
    assertEquals(PS.ERROR, PS.spriteSolidColor(solid_sprite, {rgb : 0}, {rgb : 0})); //multiple objects
}

PSTest.prototype.testSpriteSolidColorCurrentDefault = function() { //tests current and default values for this function
    var solid_sprite = PS.spriteSolid(1, 1);
    assertEquals(0x000000, PS.spriteSolidColor(solid_sprite, PS.CURRENT)); //current multiplex
    assertEquals(0x000000, PS.spriteSolidColor(solid_sprite, PS.DEFAULT)); //default multiplex
    assertEquals(0x00FFFF, PS.spriteSolidColor(solid_sprite, PS.DEFAULT, 255, 255)); //default red triplet
    assertEquals(0x00FFFF, PS.spriteSolidColor(solid_sprite, PS.CURRENT, 255, 255)); //current red triplet
    assertEquals(0xFF00FF, PS.spriteSolidColor(solid_sprite, 255, PS.DEFAULT, 255)); //default green triplet
    assertEquals(0xFF00FF, PS.spriteSolidColor(solid_sprite, 255, PS.CURRENT, 255)); //current green triplet
    assertEquals(0xFFFF00, PS.spriteSolidColor(solid_sprite, 255, 255, PS.DEFAULT)); //default blue triplet
    assertEquals(0xFFFF00, PS.spriteSolidColor(solid_sprite, 255, 255, PS.CURRENT)); //current blue triplet
    assertEquals(0x00FFFF, PS.spriteSolidColor(solid_sprite, [PS.DEFAULT, 255, 255])); //default red array
    assertEquals(0x00FFFF, PS.spriteSolidColor(solid_sprite, [PS.CURRENT, 255, 255])); //current red array
    assertEquals(0xFF00FF, PS.spriteSolidColor(solid_sprite, [255, PS.DEFAULT, 255])); //default green array
    assertEquals(0xFF00FF, PS.spriteSolidColor(solid_sprite, [255, PS.CURRENT, 255])); //current green array
    assertEquals(0xFFFF00, PS.spriteSolidColor(solid_sprite, [255, 255, PS.DEFAULT])); //default blue array
    assertEquals(0xFFFF00, PS.spriteSolidColor(solid_sprite, [255, 255, PS.CURRENT])); //current blue array
    assertEquals(0x00FFFF, PS.spriteSolidColor(solid_sprite, {r : PS.DEFAULT, g : 255, b: 255})); //default red object
    assertEquals(0x00FFFF, PS.spriteSolidColor(solid_sprite, {r : PS.CURRENT, g : 255, b: 255})); //current red object
    assertEquals(0xFF00FF, PS.spriteSolidColor(solid_sprite, {r : 255, g : PS.DEFAULT, b: 255})); //default green object
    assertEquals(0xFF00FF, PS.spriteSolidColor(solid_sprite, {r : 255, g : PS.CURRENT, b: 255})); //current green object
    assertEquals(0xFFFF00, PS.spriteSolidColor(solid_sprite, {r : 255, g : 255, b: PS.DEFAULT})); //default blue object
    assertEquals(0xFFFF00, PS.spriteSolidColor(solid_sprite, {r : 255, g : 255, b: PS.CURRENT})); //current blue object
    assertEquals(0x000000, PS.spriteSolidColor(solid_sprite, {rgb: PS.DEFAULT})); //default rgb object
    assertEquals(0x000000, PS.spriteSolidColor(solid_sprite, {})); //implicit current rgb object
    assertEquals(0x000000, PS.spriteSolidColor(solid_sprite, {rgb: PS.CURRENT})); //explicit current rgb object
    assertEquals(0x000000, PS.spriteSolidColor(solid_sprite, [])); //implied rgb array
    assertEquals(0x000000, PS.spriteSolidColor(solid_sprite, {rgb: null})); //implied rgb object
    assertEquals(0xFF0000, PS.spriteSolidColor(solid_sprite, [255])); //implied green and blue array
    assertEquals(0xFFFF00, PS.spriteSolidColor(solid_sprite, 255, 255)); //implied blue triplet
    assertEquals(0xFFFF00, PS.spriteSolidColor(solid_sprite, [255, 255])); //implied blue array
}

PSTest.prototype.testSpriteSolidColorClamp = function(){ //test that values are being clamped correctly
    var sprite = PS.spriteSolid(1, 1);
    assertEquals(0x000000, PS.spriteSolidColor(sprite, -1, 0, 0)); //clamp min red triplet
    assertEquals(0xFF0000, PS.spriteSolidColor(sprite, 256, 0, 0)); //clamp max red triplet
    assertEquals(0x000000, PS.spriteSolidColor(sprite, 0, -1, 0)); //clamp min green triplet
    assertEquals(0x00FF00, PS.spriteSolidColor(sprite, 0, 256, 0)); //clamp max green triplet
    assertEquals(0x000000, PS.spriteSolidColor(sprite, 0, 0, -1)); //clamp min blue triplet
    assertEquals(0x0000FF, PS.spriteSolidColor(sprite, 0, 0, 256)); //clamp max blue triplet
    assertEquals(0x000000, PS.spriteSolidColor(sprite, [-1, 0, 0])); //clamp min red array
    assertEquals(0xFF0000, PS.spriteSolidColor(sprite, [256, 0, 0])); //clamp max red array
    assertEquals(0x000000, PS.spriteSolidColor(sprite, [0, -1, 0])); //clamp min green array
    assertEquals(0x00FF00, PS.spriteSolidColor(sprite, [0, 256, 0])); //clamp max green array
    assertEquals(0x000000, PS.spriteSolidColor(sprite, [0, 0, -1])); //clamp min blue array
    assertEquals(0x0000FF, PS.spriteSolidColor(sprite, [0, 0, 256])); //clamp max blue array
    assertEquals(0x000000, PS.spriteSolidColor(sprite, -1)); //clamp min multiplex
    assertEquals(0xFFFFFF, PS.spriteSolidColor(sprite, 0xFFFFFF + 1)); //clamp max multiplex
    assertEquals(0x000000, PS.spriteSolidColor(sprite, {r : -1, g : 0, b: 0})); //clamp min red object
    assertEquals(0xFF0000, PS.spriteSolidColor(sprite, {r : 256, g : 0, b: 0})); //clamp max red object
    assertEquals(0x000000, PS.spriteSolidColor(sprite, {r : 0, g : -1, b: 0})); //clamp min green object
    assertEquals(0x00FF00, PS.spriteSolidColor(sprite, {r : 0, g : 256, b: 0})); //clamp max green object
    assertEquals(0x000000, PS.spriteSolidColor(sprite, {r : 0, g : 0, b: -1})); //clamp min blue object
    assertEquals(0x0000FF, PS.spriteSolidColor(sprite, {r : 0, g : 0, b: 256})); //clamp max blue object
    assertEquals(0x000000, PS.spriteSolidColor(sprite, {rgb : -1})); //clamp min rgb object
    assertEquals(0xFFFFFF, PS.spriteSolidColor(sprite, {rgb : 0xFFFFFF + 1})); //clamp max rgb object
}

PSTest.prototype.testSpriteSolidAlphaArgCheck = function() { //test that malformed inputs throw errors correctly
    assertEquals(PS.ERROR, PS.spriteSolidAlpha());//too few arguments
    assertEquals(PS.ERROR, PS.spriteSolidAlpha(null));//null sprite
    assertEquals(PS.ERROR, PS.spriteSolidAlpha(NaN)); //wrong type sprite
    assertEquals(PS.ERROR, PS.spriteSolidAlpha("sprite_infinity")); //sprite doesnt exist
    stored_image = {source: test_bmp, id: "image_0", width: 8, height: 8, pixelSize: 1, data: data_fmt_1};
    var img_sprite = PS.spriteImage(stored_image);
    assertEquals(PS.ERROR, PS.spriteSolidAlpha(img_sprite));//sprite created by spriteImage not spriteSolid
    var solid_sprite = PS.spriteSolid(1, 1);
    assertEquals(PS.ERROR, PS.spriteSolidAlpha(solid_sprite, 0, 0));//too many arguments
    assertEquals(PS.ERROR, PS.spriteSolidAlpha(solid_sprite, null));//null alpha
    assertEquals(PS.ERROR, PS.spriteSolidAlpha(solid_sprite, NaN));//wrong type alpha
}

PSTest.prototype.testSpriteSolidAlphaCurrentDefault = function() { //tests default values for this function
    var solid_sprite = PS.spriteSolid(1, 1);
    assertEquals(255, PS.spriteSolidAlpha(solid_sprite)); //implied current
    assertEquals(255, PS.spriteSolidAlpha(solid_sprite, PS.DEFAULT)); //default
    assertEquals(255, PS.spriteSolidAlpha(solid_sprite, PS.CURRENT)); //explicit current
}

PSTest.prototype.testSpriteSolidAlphaClamp = function(){ //test that values are being clamped correctly
    var sprite = PS.spriteSolid(1, 1);
    assertEquals(PS.ALPHA_TRANSPARENT, PS.spriteSolidAlpha(sprite, -1)); //clamp min
    assertEquals(PS.ALPHA_OPAQUE, PS.spriteSolidAlpha(sprite, 256)); //clamp max
}

PSTest.prototype.testSpriteImageArgCheck = function() { //test that malformed inputs throw errors correctly
    stored_image = {source: test_bmp, id: "image_0", width: 8, height: 8, pixelSize: 1, data: data_fmt_1};
    assertEquals(PS.ERROR, PS.spriteImage());//too few arguments
    assertEquals(PS.ERROR, PS.spriteImage(stored_image, {}, 0));//too many arguments
    assertEquals(PS.ERROR, PS.spriteImage(null));//null image
    assertEquals(PS.ERROR, PS.spriteImage(NaN)); //wrong type image
    assertEquals(PS.ERROR, PS.spriteImage("sprite_infinity"));//sprite doesnt exist
    assertEquals(PS.ERROR, PS.spriteImage(stored_image, null)); //null region
    assertEquals(PS.ERROR, PS.spriteImage(stored_image, NaN)); //wrong type region
    assertEquals(PS.ERROR, PS.spriteImage(stored_image, {left: null, top: 4, width: 4, height: 4})); //null left
    assertEquals(PS.ERROR, PS.spriteImage(stored_image, {left: NaN, top: 4, width: 4, height: 4})); //wrong type left
    assertEquals(PS.ERROR, PS.spriteImage(stored_image, {left: 4, top: null, width: 4, height: 4})); //null top
    assertEquals(PS.ERROR, PS.spriteImage(stored_image, {left: 4, top: NaN, width: 4, height: 4})); //wrong type top
    assertEquals(PS.ERROR, PS.spriteImage(stored_image, {left: 4, top: 4, width: null, height: 4})); //null width
    assertEquals(PS.ERROR, PS.spriteImage(stored_image, {left: 4, top: 4, width: NaN, height: 4})); //wrong type width
    assertEquals(PS.ERROR, PS.spriteImage(stored_image, {left: 4, top: 4, width: 4, height: null})); //null height
    assertEquals(PS.ERROR, PS.spriteImage(stored_image, {left: 4, top: 4, width: 4, height: NaN})); //wrong type height
    assertEquals(PS.ERROR, PS.spriteImage(stored_image, {left: 8, top: 4, width: 5, height: 4})); //region extends beyond image
    assertEquals(PS.ERROR, PS.spriteImage(stored_image, {left: 4, top: 8, width: 4, height: 4})); //region extends beyond image
}

spriteImageDefaultRegion = function(region){
    var sprite_image;
    if(typeof(region) == "undefined"){
        sprite_image = PS.spriteImage(stored_image);
        region = {left: 0, top: 0, width: stored_image.width, height: stored_image.height};
    }
    else if(region == PS.DEFAULT){
        sprite_image = PS.spriteImage(stored_image, PS.DEFAULT);
        region = {left: 0, top: 0, width: stored_image.width, height: stored_image.height};
    }
    else{
        sprite_image = PS.spriteImage(PS.DEFAULT, region);
        if(typeof(region.left) == "undefined" || region.left == PS.DEFAULT) region.left = 0;
        if(typeof(region.top) == "undefined" || region.top == PS.DEFAULT) region.top = 0;
        if(typeof(region.width) == "undefined" || region.width == PS.DEFAULT) region.width = stored_image.width - region.left;
        if(typeof(region.height) == "undefined" || region.height == PS.DEFAULT) region.height = stored_image.height - region.top;
    }
    PS.spriteMove(sprite_image, 0, 0);

    for(var i = 0; i < 8; i++) for(var j = 0; j < 8; j++){
        var msg = "Failed at coords " + i + "," + j;
        if(i >= region.top && i < region.top + region.height &&
            j >= region.left && j < region.left + region.width){
            assertEquals(msg, stored_image.data[j*8+i], PS.color(i - region.top, j - region.left)); //should be color of corresponding image pixel
        }
        else assertEquals(msg, PS.COLOR_WHITE, PS.color(i, j)); //outside region, should be white
        PS.color(i, j, PS.COLOR_WHITE); //set back to white for next loop
    }
}

PSTest.prototype.testSpriteImageDefaultRegions = function(){
    stored_image = {width: 8, height: 8, pixelSize: 1, data: data_fmt_1};
    spriteImageDefaultRegion(); //implied default region
    spriteImageDefaultRegion(PS.DEFAULT); //default region
    spriteImageDefaultRegion({top: 4, width: 4, height: 4}); //implied default left
    spriteImageDefaultRegion({left: PS.DEFAULT, top: 4, width: 4, height: 4}); //default left
    spriteImageDefaultRegion({left: 4, width: 4, height: 4}); //implied default top
    spriteImageDefaultRegion({left: 4, top: PS.DEFAULT, width: 4, height: 4}); //default top
    spriteImageDefaultRegion({left: 4, top: 4, height: 4}); //implied default width
    spriteImageDefaultRegion({left: 4, top: 4, width: PS.DEFAULT, height: 4}); //default width
    spriteImageDefaultRegion({left: 4, top: 4, width: 4}); //implied default height
    spriteImageDefaultRegion({left: 4, top: 4, width: 4, height: PS.DEFAULT}); //default height
}

PSTest.prototype.testSpritePlaneArgCheck = function() { //test that malformed inputs throw errors correctly
    var solid_sprite = PS.spriteSolid(1, 1);
    assertEquals(PS.ERROR, PS.spritePlane());//too few arguments
    assertEquals(PS.ERROR, PS.spritePlane(solid_sprite, 0, 0));//too many arguments
    assertEquals(PS.ERROR, PS.spritePlane(null));//null sprite
    assertEquals(PS.ERROR, PS.spritePlane(NaN)); //wrong type sprite
    assertEquals(PS.ERROR, PS.spritePlane("sprite_infinity"));//sprite doesnt exist
    assertEquals(PS.ERROR, PS.spritePlane(solid_sprite, null)); //null plane
    assertEquals(PS.ERROR, PS.spritePlane(solid_sprite, NaN)); //wrong type plane
}

PSTest.prototype.testSpritePlaneCurrentDefault = function() { //tests default values for this function
    var solid_sprite = PS.spriteSolid(1, 1);
    assertEquals(0, PS.spritePlane(solid_sprite)); //implied current
    assertEquals(0, PS.spritePlane(solid_sprite, PS.DEFAULT)); //default
    assertEquals(0, PS.spritePlane(solid_sprite, PS.CURRENT)); //explicit current
}

PSTest.prototype.testSpritePlaneClamp = function(){ //test that values are being clamped correctly
    var sprite = PS.spriteSolid(1, 1);
    assertEquals(0, PS.spritePlane(sprite, -1));
}

PSTest.prototype.testSpriteShowArgCheck = function() { //test that malformed inputs throw errors correctly
    var solid_sprite = PS.spriteSolid(1, 1);
    assertEquals(PS.ERROR, PS.spriteShow());//too few arguments
    assertEquals(PS.ERROR, PS.spriteShow(solid_sprite, 0, 0));//too many arguments
    assertEquals(PS.ERROR, PS.spriteShow(null));//null sprite
    assertEquals(PS.ERROR, PS.spriteShow(NaN)); //wrong type sprite
    assertEquals(PS.ERROR, PS.spriteShow("sprite_infinity"));//sprite doesnt exist
    assertEquals(PS.ERROR, PS.spriteShow(solid_sprite, null)); //null visibility
    assertEquals(PS.ERROR, PS.spriteShow(solid_sprite, NaN)); //wrong type visibility
}

PSTest.prototype.testSpriteShowCurrentDefault = function() { //tests default values for this function
    var solid_sprite = PS.spriteSolid(1, 1);
    assertEquals(true, PS.spriteShow(solid_sprite)); //implied current
    assertEquals(true, PS.spriteShow(solid_sprite, PS.DEFAULT)); //default
    assertEquals(true, PS.spriteShow(solid_sprite, PS.CURRENT)); //explicit current
}

PSTest.prototype.testSpriteAxisArgCheck = function() { //test that malformed inputs throw errors correctly
    var solid_sprite = PS.spriteSolid(1, 1);
    assertEquals(PS.ERROR, PS.spriteAxis());//too few arguments
    assertEquals(PS.ERROR, PS.spriteAxis(solid_sprite, 0, 0, 0));//too many arguments
    assertEquals(PS.ERROR, PS.spriteAxis(null));//null sprite
    assertEquals(PS.ERROR, PS.spriteAxis(NaN)); //wrong type sprite
    assertEquals(PS.ERROR, PS.spriteAxis("sprite_infinity"));//sprite doesnt exist
    assertEquals(PS.ERROR, PS.spriteAxis(solid_sprite, null)); //null x
    assertEquals(PS.ERROR, PS.spriteAxis(solid_sprite, NaN)); //wrong type x
    assertEquals(PS.ERROR, PS.spriteAxis(solid_sprite, 0, null)); //null y
    assertEquals(PS.ERROR, PS.spriteAxis(solid_sprite, 0, NaN)); //wrong type y
}

PSTest.prototype.testSpriteAxisDefault = function() { //tests default values for this function
    var solid_sprite = PS.spriteSolid(1, 1);
    assertEquals({x: 0, y: 0}, PS.spriteAxis(solid_sprite)); //implied current both
    assertEquals({x: 0, y: 0}, PS.spriteAxis(solid_sprite, PS.DEFAULT, 0)); //default x
    assertEquals({x: 0, y: 0}, PS.spriteAxis(solid_sprite, PS.CURRENT, 0)); //explicit current x
    assertEquals({x: 0, y: 0}, PS.spriteAxis(solid_sprite, 0, PS.DEFAULT)); //default y
    assertEquals({x: 0, y: 0}, PS.spriteAxis(solid_sprite, 0, PS.CURRENT)); //explicit current y
}

PSTest.prototype.testSpriteMoveArgCheck = function() { //test that malformed inputs throw errors correctly
    var solid_sprite = PS.spriteSolid(1, 1);
    assertEquals(PS.ERROR, PS.spriteMove());//too few arguments
    assertEquals(PS.ERROR, PS.spriteMove(solid_sprite, 0, 0, 0));//too many arguments
    assertEquals(PS.ERROR, PS.spriteMove(null));//null sprite
    assertEquals(PS.ERROR, PS.spriteMove(NaN)); //wrong type sprite
    assertEquals(PS.ERROR, PS.spriteMove("sprite_infinity"));//sprite doesnt exist
    assertEquals(PS.ERROR, PS.spriteMove(solid_sprite, null)); //null x
    assertEquals(PS.ERROR, PS.spriteMove(solid_sprite, NaN)); //wrong type x
    assertEquals(PS.ERROR, PS.spriteMove(solid_sprite, 0, null)); //null y
    assertEquals(PS.ERROR, PS.spriteMove(solid_sprite, 0, NaN)); //wrong type y
}

PSTest.prototype.testSpriteMoveDefault = function() { //tests default values for this function
    var solid_sprite = PS.spriteSolid(1, 1);
    assertEquals({x: 0, y: 0}, PS.spriteMove(solid_sprite)); //implied current both
    assertEquals({x: 0, y: 0}, PS.spriteMove(solid_sprite, PS.DEFAULT, 0)); //default x
    assertEquals({x: 0, y: 0}, PS.spriteMove(solid_sprite, PS.CURRENT, 0)); //explicit current x
    assertEquals({x: 0, y: 0}, PS.spriteMove(solid_sprite, 0, PS.DEFAULT)); //default y
    assertEquals({x: 0, y: 0}, PS.spriteMove(solid_sprite, 0, PS.CURRENT)); //explicit current y
}

PSTest.prototype.testSpriteCollideArgCheck = function() { //test that malformed inputs throw errors correctly
    var solid_sprite = PS.spriteSolid(1, 1);
    assertEquals(PS.ERROR, PS.spriteCollide());//too few arguments
    assertEquals(PS.ERROR, PS.spriteCollide(solid_sprite, 0, 0));//too many arguments
    assertEquals(PS.ERROR, PS.spriteCollide(null));//null sprite
    assertEquals(PS.ERROR, PS.spriteCollide(NaN)); //wrong type sprite
    assertEquals(PS.ERROR, PS.spriteCollide("sprite_infinity"));//sprite doesnt exist
    assertEquals(PS.ERROR, PS.spriteCollide(solid_sprite, null)); //null exec
    assertEquals(PS.ERROR, PS.spriteCollide(solid_sprite, NaN)); //wrong type exec
}

PSTest.prototype.testSpriteCollideDefault = function() { //tests default values for this function
    var solid_sprite = PS.spriteSolid(1, 1);
    assertEquals(null, PS.spriteCollide(solid_sprite)); //implied current
    assertEquals(null, PS.spriteCollide(solid_sprite, PS.DEFAULT)); //default
    assertEquals(null, PS.spriteCollide(solid_sprite, PS.CURRENT)); //explicit current
}

PSTest.prototype.testSpriteDelete = function() { //test that malformed inputs throw errors correctly
    var solid_sprite = PS.spriteSolid(1, 1);
    assertEquals(PS.ERROR, PS.spriteDelete());//too few arguments
    assertEquals(PS.ERROR, PS.spriteDelete(solid_sprite, 0));//too many arguments
    assertEquals(PS.ERROR, PS.spriteDelete(null));//null sprite
    assertEquals(PS.ERROR, PS.spriteDelete(NaN)); //wrong type sprite
    assertEquals(PS.ERROR, PS.spriteDelete("sprite_infinity"));//sprite doesnt exist
    assertEquals(PS.DONE, PS.spriteDelete(solid_sprite));
    assertEquals(PS.ERROR, PS.spriteDelete(solid_sprite)); //already deleted
}

//endregion