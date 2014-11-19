// Create default Perlenspiel instance, and start it when document is loaded

// Public so that game.js can access it. This acts as a default instance.
var PS = PERLENSPIEL.Create();

// Wait for everything to load, then start this instance
window.addEventListener( "load", function() {
    if (typeof PS.init === "function") {
        PS.start();
    }
}, false );
