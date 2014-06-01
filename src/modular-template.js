var MODULE = (function (my) {
	var _private = my._private = my._private || {},
		_seal = my._seal = my._seal || function () {
			delete my._private;
			delete my._seal;
			delete my._unseal;
		},
		_unseal = my._unseal = my._unseal || function () {
			my._private = _private;
			my._seal = _seal;
			my._unseal = _unseal;
		};

	// permanent access to _private, _seal, and _unseal

	return my;
}(MODULE || {}));

/*	http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html

	Any file can set properties on their local variable _private, and it will be
	immediately available to the others. Once this module has loaded completely,
	the application should call MODULE._seal(), which will prevent external access
	to the internal _private. If this module were to be augmented again, further in
	the application’s lifetime, one of the internal methods, in any file, can call
	_unseal() before loading the new file, and call _seal() again after it has been
	executed. This pattern occurred to me today while I was at work, I have not seen
	this elsewhere. I think this is a very useful pattern, and would have been worth
	writing about all on its own.
*/