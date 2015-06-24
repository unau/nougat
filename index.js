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
  var Glace = function() {};
  'env,isGas,isNode'.split(',').forEach(function(key) {
    Glace.prototype[key] = nougat[key];
  });
  function getNewGlace(arg, name, body) {
    var cnst = nougat.isNode ? Glace.Node : Glace.Gas;
    return new cnst().initAs(arg).init(name, body);
  }
  Glace.prototype.init = function(name, body) {
    this.name = name;
    this.body = body;
    return this;
  };
  Glace.prototype._export = function(stuff) {
    if (! stuff) {
      if (typeof this.body != 'function') return this;
      stuff = this.body(this);
    }
    this._export_(stuff);
    return this;
  };
  (function(spec) {
    for (var methodName in spec) {
      var methodSpec = spec[methodName];
      for (var subName in methodSpec) {
        var method = methodSpec[subName];
        if (method) {
          var subclass = Glace[subName];
          if (! subclass) {
            subclass = Glace[subName] = function() {};
            subclass.prototype = new Glace();
          }
          subclass.prototype[methodName] = method;
        }
      }
    }
  })({
    initAs: {
      Node: function(arg) {
        this.global = arg.g;
        this.module =  arg.m,
        this.u = { path: require('path') };
        this.dir = this.u.path.dirname(arg.m.id)
        return this;
      },
      Gas: function(arg) {
        this.global = arg.g;
        this.global._nougatport = this.global._nougatport || {};
        return this;
      }
    },
    _export_: {
      Node: function(stuff) {
        this.module.exports = stuff;
      },
      Gas: function(stuff) {
        if (this.name) {
          this.global._nougatport[this.name] = stuff;
        } else {
          for (var key in stuff) {
            this.global[key] = stuff[key];
          }
        }
      }
    },
    require: {
      Node: function(arg) {
        return require(this.u.path.resolve(this.dir, arg));
      },
      Gas: function(arg) {
        var key = (function(a) {
          return a[a.length - 1];
        })(arg.split('/'));
        return this.global._nougatport[key];
      }
    },
    slog: {
      Node: function(arg) {
        return console.log(arg);
      },
      Gas: function(arg) {
        return Logger.log(arg);
      }
    }
  });
  return getNewGlace(arg)._export({$: function(name, arg, body) {
    if (! body) {
      body = arg;
      arg = name;
      name = null;
    }
    return getNewGlace(arg, name, body)._export();
  }});
})(this.UiApp ? {g: this} : {g: global, m: module}, {});
// end of file
