(function(arg, nougat) {
  "use strict";
  nougat.env = (function() {
    var h = { UiApp: 'GAS', process: 'Node' };
    for (var k in h) {
      if (k in arg.g) return { name: h[k] };
    }
    return {};
  })();
  nougat.isGas = nougat.env.name === 'GAS';
  nougat.isNode = nougat.env.name === 'Node';
  nougat.log = function(arg) {
    return nougat.isGas ? Logger.log(arg) : console.log(arg);
  }
  var Glace = function(arg, name, body) {
    this.init(arg, name, body);
  };
  Glace.prototype.init = function(arg, name, body) {
    this.global = arg.g;
    this.module = arg.m;
    this.name = name;
    this.body = body;
    return this;
  };
  Glace.prototype._export = function(stuff) {
    if (! stuff) {
      if (typeof this.body != 'function') return this;
      stuff = this.body(this);
    }
    if (this.isGas) {
      if (this.name) {
	this.global[this.name] = stuff;
      } else {
	for (var key in stuff) {
	  this.global[key] = stuff[key];
	}
      }
    } else {
      this.module.exports = stuff;
    }
    return this;
  };
  'env,isGas,isNode,log'.split(',').forEach(function(key) {
    Glace.prototype[key] = nougat[key];
  });
  return new Glace(arg)._export({$: function(name, arg, body) {
    if (! body) {
      body = arg;
      arg = name;
      name = null;
    }
    return new Glace(arg, name, body)._export();
  }});
})(this.UiApp ? {g: this} : {g: global, m: module}, {});
// end of file
