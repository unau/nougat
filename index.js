(function(global, nougat) {
  "use strict";
  nougat.aura = (function() {
    var h = { UiApp: 'GAS', process: 'Node' };
    for (var k in h) {
      if (typeof global[k] !== 'undefined') return h[k];
    }
    return 'unknown';
  })();
  nougat.isGas = nougat.aura === 'GAS';
  nougat.isNode = nougat.aura === 'Node';
  nougat.log = function(arg) {
    return nougat.isGas ? Logger.log(arg) : console.log(arg);
  }

  function export_(global, module, name, stuff) {
    if (nougat.isGas) {
      if (name) {
	global[name] = stuff;
      } else {
	for (var key in stuff) {
	  global[key] = stuff[key];
	}
      }
    } else {
      module.exports = stuff;
    }
  }

  nougat.$ = function(global0, module0, name0, body) {
    if (! body) {
      body = name0;
      name0 = null;
    }
    export_(global0, module0, name0, body(global0, nougat));
  };
  export_(global, typeof module !== 'undefined' ? module : null, null, nougat);
})(typeof global !== 'undefined' ? global : this, {});
// end of file
