// perlenspiel-start.js for Perlenspiel 3.2
// Creates a default Perlenspiel instance, then starts it when window is loaded

// Public so that game.js can access it. This acts as a default instance.
var PS = PERLENSPIEL.Create();

// Wait for everything in the page to load
window.addEventListener( "load", function() {
    // Automatically boot this instance if it's the only one (single perlenspiel mode)
    if (PERLENSPIEL.NumInstances() === 1) {
        PS.start();
    }
}, false );
