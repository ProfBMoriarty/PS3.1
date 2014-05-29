PSTest = TestCase("PSTest");


doNothing = function(){}; //dummy function for testing function pointers

PSTest.prototype.setUp = function(){
    PS._sys(); //initialize the engine
    PS.gridSize(10, 10); //arbitrary non-default value
    PS.gridColor(100, 100, 100); //arbitrary non-default value
    PS.fade(0, 0, 5, {onEnd:doNothing}); //arbitrary non-default value
    PS.gridFade(5, {onEnd:doNothing}); //arbitrary non-default value
    PS.gridPlane(1); //arbitrary non-default value
};

//region PS.gridSize
PSTest.prototype.testGridSizeClampMinWidth = function(){
    var dimensions = PS.gridSize(0, 6);
    assertEquals(1, dimensions.width);
    assertEquals(6, dimensions.height);
};

PSTest.prototype.testGridSizeClampMaxWidth = function(){
    var dimensions = PS.gridSize(33, 6);
    assertEquals(32, dimensions.width);
    assertEquals(6, dimensions.height);
};

PSTest.prototype.testGridSizeClampMinHeight = function(){
    var dimensions = PS.gridSize(6, 0);
    assertEquals(6, dimensions.width);
    assertEquals(1, dimensions.height);
};

PSTest.prototype.testGridSizeClampMaxHeight = function(){
    var dimensions = PS.gridSize(6, 33);
    assertEquals(6, dimensions.width);
    assertEquals(32, dimensions.height);
};

PSTest.prototype.testGridSizeCurrentWidth = function(){
    var dimensions = PS.gridSize(PS.CURRENT, 6);
    assertEquals(10, dimensions.width);
    assertEquals(6, dimensions.height);
};

PSTest.prototype.testGridSizeCurrentHeight = function(){
    var dimensions = PS.gridSize(6, PS.CURRENT);
    assertEquals(6, dimensions.width);
    assertEquals(10, dimensions.height);
};

PSTest.prototype.testGridSizeDefaultWidth = function(){
    var dimensions = PS.gridSize(PS.DEFAULT, 6);
    assertEquals(8, dimensions.width);
    assertEquals(6, dimensions.height);
};

PSTest.prototype.testGridSizeDefaultHeight = function(){
    var dimensions = PS.gridSize(6, PS.DEFAULT);
    assertEquals(6, dimensions.width);
    assertEquals(8, dimensions.height);
};

PSTest.prototype.testGridSizeNaNWidth = function(){
    assertEquals(PS.ERROR, PS.gridSize(NaN, 6));
};

PSTest.prototype.testGridSizeNaNHeight = function(){
    assertEquals(PS.ERROR, PS.gridSize(6, NaN));
};

PSTest.prototype.testGridSizeNullWidth = function(){
    assertEquals(PS.ERROR, PS.gridSize(null, 6));
};

 PSTest.prototype.testGridSizeNullHeight = function(){
    assertEquals(PS.ERROR, PS.gridSize(6, null));
};

PSTest.prototype.testGridSizeTooFewArguments = function(){
    assertEquals(PS.ERROR, PS.gridSize(6));
};

PSTest.prototype.testGridSizeTooManyArguments = function(){
    assertEquals(PS.ERROR, PS.gridSize(6, 6, 6));
};

PSTest.prototype.testGridSizeBeadDefaults = function(){
    PS.visible(3,3, false);
    PS.active(3, 3, false);
    PS.scale(3, 3, 50);
    PS.radius(3, 3, 3);
    PS.color(3, 3, PS.COLOR_MAGENTA);
    PS.alpha(3, 3, 50);
    PS.border(3, 3, 3);
    PS.borderColor(3, 3, PS.COLOR_YELLOW);
    PS.borderAlpha(3, 3, 100);
    PS.glyph(3, 3, 10);
    PS.glyphColor(3, 3, PS.COLOR_INDIGO);
    PS.data(3,3, "data");
    PS.gridPlane(3);
    PS.gridSize(10, 10);
    assertTrue(PS.visible(3,3));
    assertTrue(PS.active(3,3));
    assertEquals(100, PS.scale(3,3));
    assertEquals(0, PS.radius(3,3));
    assertEquals(PS.COLOR_WHITE, PS.color(3,3));
    assertEquals(255, PS.alpha(3,3));
    assertEquals(1, PS.border(3,3).width);
    assertEquals(PS.COLOR_GRAY, PS.borderColor(3,3));
    assertEquals(255, PS.borderAlpha(3,3));
    assertEquals(0, PS.glyph(3,3));
    assertEquals(PS.COLOR_BLACK, PS.glyphColor(3,3));
    assertEquals(255, PS.glyphAlpha(3,3));
    assertEquals(0, PS.data(3,3));
    assertEquals(null, PS.exec(3,3));
    assertEquals(0, PS.gridPlane());
};
//endregion

//region PS.gridColor
PSTest.prototype.testGridColorClampMinTripletRed = function(){
    assertEquals(0, PS.gridColor(-1, 0, 0));
};

PSTest.prototype.testGridColorClampMaxTripletRed = function(){
    assertEquals(16711680, PS.gridColor(256, 0, 0));
};

PSTest.prototype.testGridColorTripletNaNRed = function(){
    assertEquals(PS.ERROR, PS.gridColor(NaN, 0, 0));
};

PSTest.prototype.testGridColorTripletNullRed = function(){
    assertEquals(PS.ERROR, PS.gridColor(null, 0, 0));
};

PSTest.prototype.testGridColorTripletCurrentRed = function(){
    assertEquals(6553600, PS.gridColor(PS.CURRENT, 0, 0));
};

PSTest.prototype.testGridColorTripletDefaultRed = function(){
    assertEquals(16711680, PS.gridColor(PS.DEFAULT, 0, 0));
};

PSTest.prototype.testGridColorClampMinTripletGreen = function(){
    assertEquals(0, PS.gridColor(0, -1, 0));
};

PSTest.prototype.testGridColorClampMaxTripletGreen = function(){
    assertEquals(65280, PS.gridColor(0, 256, 0));
};

PSTest.prototype.testGridColorTripletNaNGreen = function(){
    assertEquals(PS.ERROR, PS.gridColor(0, NaN, 0));
};

PSTest.prototype.testGridColorTripletNullGreen = function(){
    assertEquals(PS.ERROR, PS.gridColor(0, null, 0));
};

PSTest.prototype.testGridColorTripletCurrentGreen = function(){
    assertEquals(25600, PS.gridColor(0, PS.CURRENT, 0));
};

PSTest.prototype.testGridColorTripletDefaultGreen = function(){
    assertEquals(65280, PS.gridColor(0, PS.DEFAULT, 0));
};

PSTest.prototype.testGridColorClampMinTripletBlue = function(){
    assertEquals(0, PS.gridColor(0, 0, -1));
};

PSTest.prototype.testGridColorClampMaxTripletBlue = function(){
    assertEquals(255, PS.gridColor(0, 0, 256));
};

PSTest.prototype.testGridColorTripletNaNBlue = function(){
    assertEquals(PS.ERROR, PS.gridColor(0, 0, NaN));
};

PSTest.prototype.testGridColorTripletNullBlue = function(){
    assertEquals(PS.ERROR, PS.gridColor(0, 0, null));
};

PSTest.prototype.testGridColorTripletCurrentBlue = function(){
    assertEquals(100, PS.gridColor(0, 0, PS.CURRENT));
};

PSTest.prototype.testGridColorTripletDefaultBlue = function(){
    assertEquals(255, PS.gridColor(0, 0, PS.DEFAULT));
};

PSTest.prototype.testGridColorClampMinArrayRed = function(){
    assertEquals(0, PS.gridColor([-1, 0, 0]));
};

PSTest.prototype.testGridColorClampMaxArrayRed = function(){
    assertEquals(16711680, PS.gridColor([256, 0, 0]));
};

PSTest.prototype.testGridColorArrayNaNRed = function(){
    assertEquals(PS.ERROR, PS.gridColor([NaN, 0, 0]));
};

PSTest.prototype.testGridColorArrayNullRed = function(){
    assertEquals(PS.ERROR, PS.gridColor([null, 0, 0]));
};

PSTest.prototype.testGridColorArrayCurrentRed = function(){
    assertEquals(6553600, PS.gridColor([PS.CURRENT, 0, 0]));
};

PSTest.prototype.testGridColorArrayDefaultRed = function(){
    assertEquals(16711680, PS.gridColor([PS.DEFAULT, 0, 0]));
};

PSTest.prototype.testGridColorClampMinArrayGreen = function(){
    assertEquals(0, PS.gridColor([0, -1, 0]));
};

PSTest.prototype.testGridColorClampMaxArrayGreen = function(){
    assertEquals(65280, PS.gridColor([0, 256, 0]));
};

PSTest.prototype.testGridColorArrayNaNGreen = function(){
    assertEquals(PS.ERROR, PS.gridColor([0, NaN, 0]));
};

PSTest.prototype.testGridColorArrayNullGreen = function(){
    assertEquals(PS.ERROR, PS.gridColor([0, null, 0]));
};

PSTest.prototype.testGridColorArrayCurrentGreen = function(){
    assertEquals(25600, PS.gridColor([0, PS.CURRENT, 0]));
};

PSTest.prototype.testGridColorArrayDefaultGreen = function(){
    assertEquals(65280, PS.gridColor([0, PS.DEFAULT, 0]));
};

PSTest.prototype.testGridColorClampMinArrayBlue = function(){
    assertEquals(0, PS.gridColor([0, 0, -1]));
};

PSTest.prototype.testGridColorClampMaxArrayBlue = function(){
    assertEquals(255, PS.gridColor([0, 0, 256]));
};

PSTest.prototype.testGridColorArrayNaNBlue = function(){
    assertEquals(PS.ERROR, PS.gridColor([0, 0, NaN]));
};

PSTest.prototype.testGridColorArrayNullBlue = function(){
    assertEquals(PS.ERROR, PS.gridColor([0, 0, null]));
};

PSTest.prototype.testGridColorArrayCurrentBlue = function(){
    assertEquals(100, PS.gridColor([0, 0, PS.CURRENT]));
};

PSTest.prototype.testGridColorArrayDefaultBlue = function(){
    assertEquals(255, PS.gridColor([0, 0, PS.DEFAULT]));
};

PSTest.prototype.testGridColorClampMinMultiplex = function(){
    assertEquals(0, PS.gridColor(-1));
};

PSTest.prototype.testGridColorClampMaxMultiplex = function(){
    assertEquals(16777215, PS.gridColor(16777216));
};

PSTest.prototype.testGridColorMultiplexNaN = function(){
    assertEquals(PS.ERROR, PS.gridColor(NaN));
};

PSTest.prototype.testGridColorMultiplexNull = function(){
    assertEquals(PS.ERROR, PS.gridColor(null));
};

PSTest.prototype.testGridColorClampMinObjectRed = function(){
    assertEquals(0, PS.gridColor({r : -1, g : 0, b: 0}));
};

PSTest.prototype.testGridColorClampMaxObjectRed = function(){
    assertEquals(16711680, PS.gridColor({r : 256, g : 0, b: 0}));
};

PSTest.prototype.testGridColorObjectNaNRed = function(){
    assertEquals(PS.ERROR, PS.gridColor({r : NaN, g : 0, b: 0}));
};

PSTest.prototype.testGridColorObjectNullRed = function(){
    assertEquals(PS.ERROR, PS.gridColor({r : null, g : 0, b: 0}));
};

PSTest.prototype.testGridColorObjectCurrentRed = function(){
    assertEquals(6553600, PS.gridColor({r : PS.CURRENT, g : 0, b: 0}));
};

PSTest.prototype.testGridColorObjectDefaultRed = function(){
    assertEquals(16711680, PS.gridColor({r : PS.DEFAULT, g : 0, b: 0}));
};

PSTest.prototype.testGridColorClampMinObjectGreen = function(){
    assertEquals(0, PS.gridColor({r : 0, g : -1, b: 0}));
};

PSTest.prototype.testGridColorClampMaxObjectGreen = function(){
    assertEquals(65280, PS.gridColor({r : 0, g : 256, b: 0}));
};

PSTest.prototype.testGridColorObjectNaNGreen = function(){
    assertEquals(PS.ERROR, PS.gridColor({r : 0, g : NaN, b: 0}));
};

PSTest.prototype.testGridColorObjectNullGreen = function(){
    assertEquals(PS.ERROR, PS.gridColor({r : 0, g : null, b: 0}));
};

PSTest.prototype.testGridColorObjectCurrentGreen = function(){
    assertEquals(25600, PS.gridColor({r : 0, g : PS.CURRENT, b: 0}));
};

PSTest.prototype.testGridColorObjectDefaultGreen = function(){
    assertEquals(65280, PS.gridColor({r : 0, g : PS.DEFAULT, b: 0}));
};

PSTest.prototype.testGridColorClampMinObjectBlue = function(){
    assertEquals(0, PS.gridColor({r : 0, g : 0, b: -1}));
};

PSTest.prototype.testGridColorClampMaxObjectBlue = function(){
    assertEquals(255, PS.gridColor({r : 0, g : 0, b: 256}));
};

PSTest.prototype.testGridColorObjectNaNBlue = function(){
    assertEquals(PS.ERROR, PS.gridColor({r : 0, g : 0, b: NaN}));
};

PSTest.prototype.testGridColorObjectNullBlue = function(){
    assertEquals(PS.ERROR, PS.gridColor({r : 0, g : 0, b: null}));
};

PSTest.prototype.testGridColorObjectCurrentBlue = function(){
    assertEquals(100, PS.gridColor({r : 0, g : 0, b: PS.CURRENT}));
};

PSTest.prototype.testGridColorObjectDefaultBlue = function(){
    assertEquals(255, PS.gridColor({r : 0, g : 0, b: PS.DEFAULT}));
};

PSTest.prototype.testGridColorClampMinObjectRGB = function(){
    assertEquals(0, PS.gridColor({rgb : -1}));
};

PSTest.prototype.testGridColorClampMaxObjectRBG = function(){
    assertEquals(16777215, PS.gridColor({rgb : 16777216}));
};

PSTest.prototype.testGridColorObjectNaNRGB = function(){
    assertEquals(PS.ERROR, PS.gridColor({rgb: NaN}));
};

PSTest.prototype.testGridColorObjectNullRGB = function(){
    assertEquals(PS.ERROR, PS.gridColor({rgb: null}));
};

PSTest.prototype.testGridColorObjectCurrentRGB = function(){
    assertEquals(6579300, PS.gridColor({rgb: PS.CURRENT}));
};

PSTest.prototype.testGridColorObjectDefaultRGB = function(){
    assertEquals(16777215, PS.gridColor({rgb: PS.DEFAULT}));
};

PSTest.prototype.testGridColorObjectNaNRGBOverride = function(){
    assertEquals(PS.ERROR, PS.gridColor({r: 0, g: 0, b:0, rgb : NaN}));
};

PSTest.prototype.testGridColorObjectNullRGBOverride = function(){
    assertEquals(65536, PS.gridColor({r: 1, g: 0, b:0, rgb : null}));
};

PSTest.prototype.testGridColorNullArg = function(){
    assertEquals(PS.ERROR, PS.gridColor(null));
}

PSTest.prototype.testGridColorTwoNumbers = function(){
    assertEquals(PS.ERROR, PS.gridColor(0, 0));
};

PSTest.prototype.testGridColorFourNumbers = function(){
    assertEquals(PS.ERROR, PS.gridColor(0, 0, 0, 0));
};

PSTest.prototype.testGridColorTwoColorObjects = function(){
    assertEquals(PS.ERROR, PS.gridColor({rgb : 10000}, {rgb : 5000}));
};

PSTest.prototype.testGridColorTwoColorObjects = function(){
    assertEquals(PS.ERROR, PS.gridColor({rgb : 10000}, {rgb : 5000}));
};

PSTest.prototype.testGridColorNumberAndColorObject = function(){
    assertEquals(PS.ERROR, PS.gridColor(0, {rgb : 10000}));
};

PSTest.prototype.testGridColorNumberNoArgs = function(){
    assertEquals(6579300, PS.gridColor());
};

//endregion

//region PS.gridFade
PSTest.prototype.testGridFadeClampRate = function(){
    assertEquals(0, PS.gridFade(-1).rate);
};

PSTest.prototype.testGridFadeCurrentRate = function(){
    assertEquals(5, PS.gridFade(PS.CURRENT).rate);
};

PSTest.prototype.testGridFadeDefaultRate = function(){
    assertEquals(0, PS.gridFade(PS.DEFAULT).rate);
};

PSTest.prototype.testGridFadeNullRate = function(){
    assertEquals(PS.ERROR, PS.gridFade(null));
};

PSTest.prototype.testGridFadeNaNRate = function(){
    assertEquals(PS.ERROR, PS.gridFade(NaN));
};

PSTest.prototype.testGridFadeNullOnEnd = function(){
    assertEquals(null, PS.gridFade(0, null).onEnd);
};

PSTest.prototype.testGridFadeCurrentOnEnd = function(){
    assertEquals(doNothing, PS.gridFade(0, PS.CURRENT).onEnd);
};

PSTest.prototype.testGridFadeDefaultOnEnd = function(){
    assertEquals(null, PS.gridFade(0, PS.DEFAULT).onEnd);
};

PSTest.prototype.testGridFadeNumberOnEnd = function(){
    assertEquals(PS.ERROR, PS.gridFade(0, 1));
};

PSTest.prototype.testGridFadeNoArgs = function(){
    assertEquals(5, PS.gridFade().rate);
    assertEquals(doNothing, PS.gridFade().onEnd);
};

PSTest.prototype.testGridFadeTooManyArgs = function(){
    assertEquals(PS.ERROR, PS.gridFade(0, null, null));
};
//endregion

//region PS.gridPlane
PSTest.prototype.testGridPlaneClamp = function(){
    assertEquals(0, PS.gridPlane(0));
};

PSTest.prototype.testGridPlaneCurrent = function(){
    assertEquals(1, PS.gridPlane(PS.CURRENT));
};

PSTest.prototype.testGridPlaneDefault = function(){
    assertEquals(0, PS.gridPlane(PS.DEFAULT));
};

PSTest.prototype.testGridPlaneNaN = function(){
    assertEquals(PS.ERROR, PS.gridPlane(NaN));
};

PSTest.prototype.testGridPlaneNoArgs = function(){
    assertEquals(1, PS.gridPlane());
};

PSTest.prototype.testGridPlaneTooManyArgs = function(){
    assertEquals(PS.ERROR, PS.gridPlane(0, 1));
};

//endregion

//region PS.color

PSTest.prototype.testColorClampMinTripletRed = function(){
    assertEquals(0, PS.color(0, 0, -1, 0, 0));
};

PSTest.prototype.testColorClampMaxTripletRed = function(){
    assertEquals(16711680, PS.color(0, 0, 256, 0, 0));
};

PSTest.prototype.testColorTripletNaNRed = function(){
    assertEquals(PS.ERROR, PS.color(0, 0, NaN, 0, 0));
};

PSTest.prototype.testColorTripletNullRed = function(){
    assertEquals(PS.ERROR, PS.color(0, 0, null, 0, 0));
};

PSTest.prototype.testColorTripletCurrentRed = function(){
    assertEquals(16711680, PS.color(0, 0, PS.CURRENT, 0, 0));
};

PSTest.prototype.testColorTripletDefaultRed = function(){
    assertEquals(16711680, PS.color(0, 0, PS.DEFAULT, 0, 0));
};

PSTest.prototype.testColorClampMinTripletGreen = function(){
    assertEquals(0, PS.color(0, 0, 0, -1, 0));
};

PSTest.prototype.testColorClampMaxTripletGreen = function(){
    assertEquals(65280, PS.color(0, 0, 0, 256, 0));
};

PSTest.prototype.testColorTripletNaNGreen = function(){
    assertEquals(PS.ERROR, PS.color(0, 0, 0, NaN, 0));
};

PSTest.prototype.testColorTripletNullGreen = function(){
    assertEquals(PS.ERROR, PS.color(0, 0, 0, null, 0));
};

PSTest.prototype.testColorTripletCurrentGreen = function(){
    assertEquals(65280, PS.color(0, 0, 0, PS.CURRENT, 0));
};

PSTest.prototype.testColorTripletDefaultGreen = function(){
    assertEquals(65280, PS.color(0, 0, 0, PS.DEFAULT, 0));
};

PSTest.prototype.testColorClampMinTripletBlue = function(){
    assertEquals(0, PS.color(0, 0, 0, 0, -1));
};

PSTest.prototype.testColorClampMaxTripletBlue = function(){
    assertEquals(255, PS.color(0, 0, 0, 0, 256));
};

PSTest.prototype.testColorTripletNaNBlue = function(){
    assertEquals(PS.ERROR, PS.color(0, 0, 0, 0, NaN));
};

PSTest.prototype.testColorTripletNullBlue = function(){
    assertEquals(PS.ERROR, PS.color(0, 0, 0, 0, null));
};

PSTest.prototype.testColorTripletCurrentBlue = function(){
    assertEquals(255, PS.color(0, 0, 0, 0, PS.CURRENT));
};

PSTest.prototype.testColorTripletDefaultBlue = function(){
    assertEquals(255, PS.color(0, 0, 0, 0, PS.DEFAULT));
};

PSTest.prototype.testColorClampMinArrayRed = function(){
    assertEquals(0, PS.color(0, 0, [-1, 0, 0]));
};

PSTest.prototype.testColorClampMaxArrayRed = function(){
    assertEquals(16711680, PS.color(0, 0, [256, 0, 0]));
};

PSTest.prototype.testColorArrayNaNRed = function(){
    assertEquals(PS.ERROR, PS.color(0, 0, [NaN, 0, 0]));
};

PSTest.prototype.testColorArrayNullRed = function(){
    assertEquals(PS.ERROR, PS.color(0, 0, [null, 0, 0]));
};

PSTest.prototype.testColorArrayCurrentRed = function(){
    assertEquals(16711680, PS.color(0, 0, [PS.CURRENT, 0, 0]));
};

PSTest.prototype.testColorArrayDefaultRed = function(){
    assertEquals(16711680, PS.color(0, 0, [PS.DEFAULT, 0, 0]));
};

PSTest.prototype.testColorClampMinArrayGreen = function(){
    assertEquals(0, PS.color(0, 0, [0, -1, 0]));
};

PSTest.prototype.testColorClampMaxArrayGreen = function(){
    assertEquals(65280, PS.color(0, 0, [0, 256, 0]));
};

PSTest.prototype.testColorArrayNaNGreen = function(){
    assertEquals(PS.ERROR, PS.color(0, 0, [0, NaN, 0]));
};

PSTest.prototype.testColorArrayNullGreen = function(){
    assertEquals(PS.ERROR, PS.color(0, 0, [0, null, 0]));
};

PSTest.prototype.testColorArrayCurrentGreen = function(){
    assertEquals(65280, PS.color(0, 0, [0, PS.CURRENT, 0]));
};

PSTest.prototype.testColorArrayDefaultGreen = function(){
    assertEquals(65280, PS.color(0, 0, [0, PS.DEFAULT, 0]));
};

PSTest.prototype.testColorClampMinArrayBlue = function(){
    assertEquals(0, PS.color(0, 0, [0, 0, -1]));
};

PSTest.prototype.testColorClampMaxArrayBlue = function(){
    assertEquals(255, PS.color(0, 0, [0, 0, 256]));
};

PSTest.prototype.testColorArrayNaNBlue = function(){
    assertEquals(PS.ERROR, PS.color(0, 0, [0, 0, NaN]));
};

PSTest.prototype.testColorArrayNullBlue = function(){
    assertEquals(PS.ERROR, PS.color(0, 0, [0, 0, null]));
};

PSTest.prototype.testColorArrayCurrentBlue = function(){
    assertEquals(255, PS.color(0, 0, [0, 0, PS.CURRENT]));
};

PSTest.prototype.testColorArrayDefaultBlue = function(){
    assertEquals(255, PS.color(0, 0, [0, 0, PS.DEFAULT]));
};

PSTest.prototype.testColorClampMinMultiplex = function(){
    assertEquals(0, PS.color(0, 0, -1));
};

PSTest.prototype.testColorClampMaxMultiplex = function(){
    assertEquals(16777215, PS.color(0, 0, 16777216));
};

PSTest.prototype.testColorMultiplexNaN = function(){
    assertEquals(PS.ERROR, PS.color(0, 0, NaN));
};

PSTest.prototype.testColorMultiplexNull = function(){
    assertEquals(PS.ERROR, PS.color(0, 0, null));
};

PSTest.prototype.testColorClampMinObjectRed = function(){
    assertEquals(0, PS.color(0, 0, {r : -1, g : 0, b: 0}));
};

PSTest.prototype.testColorClampMaxObjectRed = function(){
    assertEquals(16711680, PS.color(0, 0, {r : 256, g : 0, b: 0}));
};

PSTest.prototype.testColorObjectNaNRed = function(){
    assertEquals(PS.ERROR, PS.color(0, 0, {r : NaN, g : 0, b: 0}));
};

PSTest.prototype.testColorObjectNullRed = function(){
    assertEquals(PS.ERROR, PS.color(0, 0, {r : null, g : 0, b: 0}));
};

PSTest.prototype.testColorObjectCurrentRed = function(){
    assertEquals(16711680, PS.color(0, 0, {r : PS.CURRENT, g : 0, b: 0}));
};

PSTest.prototype.testColorObjectDefaultRed = function(){
    assertEquals(16711680, PS.color(0, 0, {r : PS.DEFAULT, g : 0, b: 0}));
};

PSTest.prototype.testColorClampMinObjectGreen = function(){
    assertEquals(0, PS.color(0, 0, {r : 0, g : -1, b: 0}));
};

PSTest.prototype.testColorClampMaxObjectGreen = function(){
    assertEquals(65280, PS.color(0, 0, {r : 0, g : 256, b: 0}));
};

PSTest.prototype.testColorObjectNaNGreen = function(){
    assertEquals(PS.ERROR, PS.color(0, 0, {r : 0, g : NaN, b: 0}));
};

PSTest.prototype.testColorObjectNullGreen = function(){
    assertEquals(PS.ERROR, PS.color(0, 0, {r : 0, g : null, b: 0}));
};

PSTest.prototype.testColorObjectCurrentGreen = function(){
    assertEquals(65280, PS.color(0, 0, {r : 0, g : PS.CURRENT, b: 0}));
};

PSTest.prototype.testColorObjectDefaultGreen = function(){
    assertEquals(65280, PS.color(0, 0, {r : 0, g : PS.DEFAULT, b: 0}));
};

PSTest.prototype.testColorClampMinObjectBlue = function(){
    assertEquals(0, PS.color(0, 0, {r : 0, g : 0, b: -1}));
};

PSTest.prototype.testColorClampMaxObjectBlue = function(){
    assertEquals(255, PS.color(0, 0, {r : 0, g : 0, b: 256}));
};

PSTest.prototype.testColorObjectNaNBlue = function(){
    assertEquals(PS.ERROR, PS.color(0, 0, {r : 0, g : 0, b: NaN}));
};

PSTest.prototype.testColorObjectNullBlue = function(){
    assertEquals(PS.ERROR, PS.color(0, 0, {r : 0, g : 0, b: null}));
};

PSTest.prototype.testColorObjectCurrentBlue = function(){
    assertEquals(255, PS.color(0, 0, {r : 0, g : 0, b: PS.CURRENT}));
};

PSTest.prototype.testColorObjectDefaultBlue = function(){
    assertEquals(255, PS.color(0, 0, {r : 0, g : 0, b: PS.DEFAULT}));
};

PSTest.prototype.testColorClampMinObjectRGB = function(){
    assertEquals(0, PS.color(0, 0, {rgb : -1}));
};

PSTest.prototype.testColorClampMaxObjectRBG = function(){
    assertEquals(16777215, PS.color(0, 0, {rgb : 16777216}));
};

PSTest.prototype.testColorObjectNaNRGB = function(){
    assertEquals(PS.ERROR, PS.color(0, 0, {rgb: NaN}));
};

PSTest.prototype.testColorObjectNullRGB = function(){
    assertEquals(PS.ERROR, PS.color(0, 0, {rgb: null}));
};

PSTest.prototype.testColorObjectCurrentRGB = function(){
    assertEquals(16777215, PS.color(0, 0, {rgb: PS.CURRENT}));
};

PSTest.prototype.testColorObjectDefaultRGB = function(){
    assertEquals(16777215, PS.color(0, 0, {rgb: PS.DEFAULT}));
};

PSTest.prototype.testColorObjectNaNRGBOverride = function(){
    assertEquals(PS.ERROR, PS.color(0, 0, {r: 0, g: 0, b:0, rgb : NaN}));
};

PSTest.prototype.testColorObjectNullRGBOverride = function(){
    assertEquals(65536, PS.color(0, 0, {r: 1, g: 0, b:0, rgb : null}));
};

PSTest.prototype.testColorNullArg = function(){
    assertEquals(PS.ERROR, PS.color(null));
}

PSTest.prototype.testColorTwoNumbers = function(){
    assertEquals(PS.ERROR, PS.color(0, 0, 0, 0));
};

PSTest.prototype.testColorFourNumbers = function(){
    assertEquals(PS.ERROR, PS.color(0, 0, 0, 0, 0, 0));
};

PSTest.prototype.testColorTwoColorObjects = function(){
    assertEquals(PS.ERROR, PS.color(0, 0, {rgb : 10000}, {rgb : 5000}));
};

PSTest.prototype.testColorTwoColorObjects = function(){
    assertEquals(PS.ERROR, PS.color(0, 0, {rgb : 10000}, {rgb : 5000}));
};

PSTest.prototype.testColorNumberAndColorObject = function(){
    assertEquals(PS.ERROR, PS.color(0, 0, 0, {rgb : 10000}));
};

PSTest.prototype.testColorSingleArg = function(){
    assertEquals(PS.ERROR, PS.color(0));
};

PSTest.prototype.testColorLocationOnly = function(){
    assertEquals(0xFFFFFF, PS.color(0, 0));
};

PSTest.prototype.testColorMinX = function(){
    assertEquals(PS.ERROR, PS.color(-1, 0));
};

PSTest.prototype.testColorMaxX = function(){
    assertEquals(PS.ERROR, PS.color(11, 0));
};

PSTest.prototype.testColorNaNX = function(){
    assertEquals(PS.ERROR, PS.color(NaN, 0));
};

PSTest.prototype.testColorNullX = function(){
    assertEquals(PS.ERROR, PS.color(null, 0));
};

PSTest.prototype.testColorMinY = function(){
    assertEquals(PS.ERROR, PS.color(0, -1));
};

PSTest.prototype.testColorMaxY = function(){
    assertEquals(PS.ERROR, PS.color(0, 11));
};

PSTest.prototype.testColorNaNY = function(){
    assertEquals(PS.ERROR, PS.color(0, NaN));
};

PSTest.prototype.testColorNullY = function(){
    assertEquals(PS.ERROR, PS.color(0, null));
};

PSTest.prototype.testColorAllX = function(){
    PS.color(PS.ALL, 0, PS.COLOR_MAGENTA);
    assertEquals(PS.COLOR_MAGENTA, PS.color(0, 0));
    assertEquals(PS.COLOR_MAGENTA, PS.color(9, 0));
};

PSTest.prototype.testColorAllY = function(){
    PS.color(0, PS.ALL, PS.COLOR_MAGENTA);
    assertEquals(PS.COLOR_MAGENTA, PS.color(0, 0));
    assertEquals(PS.COLOR_MAGENTA, PS.color(0, 9));
};

PSTest.prototype.testColorAll = function(){
    PS.color(PS.ALL, PS.ALL, PS.COLOR_MAGENTA);
    assertEquals(PS.COLOR_MAGENTA, PS.color(0, 0));
    assertEquals(PS.COLOR_MAGENTA, PS.color(0, 9));
    assertEquals(PS.COLOR_MAGENTA, PS.color(9, 0));
    assertEquals(PS.COLOR_MAGENTA, PS.color(9, 9));
};

//endregion

//region PS.alpha

PSTest.prototype.testColorSingleArg = function(){
    assertEquals(PS.ERROR, PS.alpha(0));
};

PSTest.prototype.testAlphaLocationOnly = function(){
    assertEquals(0, PS.alpha(0, 0));
};

PSTest.prototype.testAlphaMinX = function(){
    assertEquals(PS.ERROR, PS.alpha(-1, 0));
};

PSTest.prototype.testAlphaMaxX = function(){
    assertEquals(PS.ERROR, PS.alpha(11, 0));
};

PSTest.prototype.testAlphaNaNX = function(){
    assertEquals(PS.ERROR, PS.alpha(NaN, 0));
};

PSTest.prototype.testAlphaNullX = function(){
    assertEquals(PS.ERROR, PS.alpha(null, 0));
};

PSTest.prototype.testAlphaMinY = function(){
    assertEquals(PS.ERROR, PS.alpha(0, -1));
};

PSTest.prototype.testAlphaMaxY = function(){
    assertEquals(PS.ERROR, PS.alpha(0, 11));
};

PSTest.prototype.testAlphaNaNY = function(){
    assertEquals(PS.ERROR, PS.alpha(0, NaN));
};

PSTest.prototype.testAlphaNullY = function(){
    assertEquals(PS.ERROR, PS.alpha(0, null));
};

PSTest.prototype.testAlphaClampMin = function(){
    assertEquals(0, PS.alpha(0, 0, -1));
};

PSTest.prototype.testAlphaClampMax = function(){
    assertEquals(255, PS.alpha(0, 0, 256));
};

PSTest.prototype.testAlphaAllX = function(){
    PS.alpha(PS.ALL, 0, 100);
    assertEquals(100, PS.alpha(0, 0));
    assertEquals(100, PS.alpha(9, 0));
};

PSTest.prototype.testAlphaAllY = function(){
    PS.alpha(0, PS.ALL, 100);
    assertEquals(100, PS.alpha(0, 0));
    assertEquals(100, PS.alpha(0, 9));
};

PSTest.prototype.testAlphaAll = function(){
    PS.alpha(PS.ALL, PS.ALL, 100);
    assertEquals(100, PS.alpha(0, 0));
    assertEquals(100, PS.alpha(0, 9));
    assertEquals(100, PS.alpha(9, 0));
    assertEquals(100, PS.alpha(9, 9));
};

//endregion

//region PS.fade

PSTest.prototype.testFadeClampRate = function(){
    assertEquals(0, PS.fade(0, 0, -1).rate);
};

PSTest.prototype.testFadeCurrentRate = function(){
    assertEquals(5, PS.fade(0, 0, PS.CURRENT).rate);
};

PSTest.prototype.testFadeDefaultRate = function(){
    assertEquals(0, PS.fade(0, 0, PS.DEFAULT).rate);
};

PSTest.prototype.testFadeNullRate = function(){
    assertEquals(PS.ERROR, PS.fade(0, 0, null));
};

PSTest.prototype.testFadeNaNRate = function(){
    assertEquals(PS.ERROR, PS.fade(0, 0, NaN));
};

PSTest.prototype.testFadeNullOnEnd = function(){
    assertEquals(null, PS.fade(0, 0, 0, null).onEnd);
};

PSTest.prototype.testFadeCurrentOnEnd = function(){
    assertEquals(doNothing, PS.fade(0, 0, 0, PS.CURRENT).onEnd);
};

PSTest.prototype.testFadeDefaultOnEnd = function(){
    assertEquals(null, PS.fade(0, 0, 0, PS.DEFAULT).onEnd);
};

PSTest.prototype.testFadeNumberOnEnd = function(){
    assertEquals(PS.ERROR, PS.fade(0, 0, 0, 1));
};

PSTest.prototype.testFadeNoArgs = function(){
    assertEquals(5, PS.fade(0, 0).rate);
    assertEquals(doNothing, PS.fade(0, 0).onEnd);
};

PSTest.prototype.testFadeTooManyArgs = function(){
    assertEquals(PS.ERROR, PS.fade(0, 0, 0, null, null));
};

//endregion

/*

//bead alpha
PSTest.prototype.testAlphaMinX = function(){
    assertEquals(PS.ERROR, PS.alpha(-1, 3));
}

PSTest.prototype.testAlphaMaxX = function(){
    assertEquals(PS.ERROR, PS.alpha(11, 3));
}

PSTest.prototype.testAlphaMinY = function(){
    assertEquals(PS.ERROR, PS.alpha(3, -1));
}

PSTest.prototype.testAlphaMaxY = function(){
    assertEquals(PS.ERROR, PS.alpha(3, 11));
}

PSTest.prototype.testAlphaNullX = function(){
    assertEquals(PS.ERROR, PS.alpha(null, 3));
}

PSTest.prototype.testAlphaNullY = function(){
    assertEquals(PS.ERROR, PS.alpha(3, null));
}

PSTest.prototype.testAlphaWrongTypeX = function(){
    assertEquals(PS.ERROR, PS.alpha("three", 3));
}

PSTest.prototype.testAlphaWrongTypeY = function(){
    assertEquals(PS.ERROR, PS.alpha(3, "three"));
}

PSTest.prototype.testAlphaNormal = function(){
    assertEquals(100, PS.alpha(3, 3, 100));
}

PSTest.prototype.testAlphaDefault = function(){
    assertEquals(PS.ALPHA_OPAQUE, PS.alpha(3, 3, PS.DEFAULT));
}

PSTest.prototype.testAlphaCurrent = function(){
    assertEquals(255, PS.alpha(3, 3, PS.CURRENT));
}

PSTest.prototype.testColorWrongTypeY = function(){
    assertEquals(PS.ERROR, PS.alpha(3, 3, "opaque"));
}

PSTest.prototype.testColorWrongTypeY = function(){
    assertEquals(PS.ERROR, PS.alpha(3, 3, "opaque"));
}

//bead fade
PSTest.prototype.testFadeClampMinRate = function(){
    assertEquals(0, PS.fade(3, 3, -1).rate);
}

PSTest.prototype.testFadeCurrentRateNullOnEnd = function(){
    var fade = PS.fade(3, 3, PS.CURRENT, null);
    assertEquals(0, fade.rate);
    assertEquals(null, fade.onEnd);
}

PSTest.prototype.testFadeDefaultRate = function(){
    var fade = PS.fade(3, 3, PS.DEFAULT);
    assertEquals(0, fade.rate);
    assertEquals(null, fade.onEnd);
}

PSTest.prototype.testFadeNullRate = function(){
    assertEquals(PS.ERROR, PS.fade(3, 3, null));
}

PSTest.prototype.testFadeCurrentOnEnd = function(){
    var fade = PS.fade(3, 3, PS.DEFAULT, PS.CURRENT);
    assertEquals(0, fade.rate);
    assertEquals(null, fade.onEnd);
}

PSTest.prototype.testFadeDefaultOnEnd = function(){
    var fade = PS.fade(3, 3, PS.DEFAULT, PS.DEFAULT);
    assertEquals(0, fade.rate);
    assertEquals(null, fade.onEnd);
}

PSTest.prototype.testFadeWrongTypeRate = function(){
    assertEquals(PS.ERROR, PS.fade(3, 3, "five"));
}

PSTest.prototype.testFadeWrongTypeOnEnd = function(){
    assertEquals(PS.ERROR, PS.fade(3, 3, 3, "doNothing"));
}

PSTest.prototype.testFadeDefault = function(){
    var fade = PS.fade(3, 3);
    assertEquals(0, fade.rate);
    assertEquals(null, fade.onEnd);
}

PSTest.prototype.testFadeMinX = function(){
    assertEquals(PS.ERROR, PS.fade(-1, 3));
}

PSTest.prototype.testFadeMaxX = function(){
    assertEquals(PS.ERROR, PS.fade(11, 3));
}

PSTest.prototype.testFadeMinY = function(){
    assertEquals(PS.ERROR, PS.fade(3, -1));
}

PSTest.prototype.testFadeMaxY = function(){
    assertEquals(PS.ERROR, PS.fade(3, 11));
}

PSTest.prototype.testFadeAllX = function(){
    var fade = PS.fade(3, PS.ALL, 5);
    assertEquals(5, PS.fade(3, 0).rate);
    assertEquals(5, PS.fade(3, 9).rate);
}

PSTest.prototype.testFadeAllY = function(){
    var fade = PS.fade(PS.ALL, 3, 5);
    assertEquals(5, PS.fade(0, 3).rate);
    assertEquals(5, PS.fade(9, 3).rate);
}

PSTest.prototype.testFadeAll = function(){
    var fade = PS.fade(PS.ALL, PS.ALL, 5);
    assertEquals(5, PS.fade(0, 0).rate);
    assertEquals(5, PS.fade(0, 9).rate);
    assertEquals(5, PS.fade(9, 0).rate);
    assertEquals(5, PS.fade(9, 9).rate);
}

//scale tests
PSTest.prototype.testScaleMinX = function(){
    assertEquals(PS.ERROR, PS.scale(-1, 3));
}

PSTest.prototype.testScaleMaxX = function(){
    assertEquals(PS.ERROR, PS.scale(11, 3));
}

PSTest.prototype.testScaleMinY = function(){
    assertEquals(PS.ERROR, PS.scale(3, -1));
}

PSTest.prototype.testScaleMaxY = function(){
    assertEquals(PS.ERROR, PS.scale(3, 11));
}

PSTest.prototype.testScaleClampMin = function(){
    assertEquals(50, PS.scale(3, 3, 49));
}

PSTest.prototype.testScaleClampMax = function(){
    assertEquals(50, PS.scale(3, 3, 101));
}

PSTest.prototype.testScaleClampMax = function(){
    assertEquals(100, PS.scale(3, 3, PS.DEFAULT));
}

PSTest.prototype.testScaleClampMax = function(){
    assertEquals(100, PS.scale(3, 3, PS.CURRENT));
}

PSTest.prototype.testScaleAllX = function(){
    var scale = PS.scale(3, PS.ALL, 50);
    assertEquals(50, PS.scale(3, 0).rate);
    assertEquals(50, PS.scale(3, 9).rate);
}

PSTest.prototype.testScaleAllY = function(){
    var scale = PS.scale(PS.ALL, 3, 50);
    assertEquals(50, PS.scale(0, 3).rate);
    assertEquals(50, PS.scale(9, 3).rate);
}

PSTest.prototype.testScaleAll = function(){
    var Scale = PS.scale(PS.ALL, PS.ALL, 50);
    assertEquals(50, PS.scale(0, 0).rate);
    assertEquals(50, PS.scale(0, 9).rate);
    assertEquals(50, PS.scale(9, 0).rate);
    assertEquals(50, PS.scale(9, 9).rate);
}
    */