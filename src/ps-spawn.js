// Spawns new Perlenspiel instances

var PERLENSPIEL = (function (my) {
	// Shared private state
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

	// Create a new Perlenspiel instance
	my.Create = function (options) {
		// TODO: This didn't work, since it didn't carry the externally
		// 		 defined PS.init, etc into the internals
		//		 Will need to repair multispiel later
		//var PSInstance = Object.create(my)
		var PSInstance = my;
		PSInstance.setOptions(options);
		return PSInstance;
	}

	// This should be the last module loaded, so we can seal its private state
	my._seal();

	return my;
}(PERLENSPIEL || {}));
