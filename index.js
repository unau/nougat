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
    return new cnst().init(arg, name, body);
  }
  (function(spec) {
    for (var methodName in spec) {
      var methodSpec = spec[methodName];
      (function() {
        if (typeof methodSpec == 'function') {
          return [ { clazz: Glace, body: methodSpec } ];
        }
        var methods = [];
        for (var key in methodSpec) {
          var subclass = Glace[key];
          if (! subclass) {
            subclass = Glace[key] = function() {};
            subclass.prototype = new Glace();
          }
          methods.push( { clazz: subclass, body: methodSpec[key] } );
        }
        return methods;
      })().forEach(function(m) {
        m.clazz.prototype[methodName] = m.body;
      });
    }
  })({
    init: function(arg, name, body) {
      this.name = name;
      this.body = body;
      this.initAs(arg);
      return this;
    },
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
    _export: function(stuff) {
      if (! stuff) {
        if (typeof this.body != 'function') return this;
        stuff = this.body(this);
      }
      this._export_(stuff);
      return this;
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
    require: function(arg) {
      return this._require(arg, arg.indexOf('./') == 0);
    },
    _require: {
      Node: function(arg, isRelativePath) {
        var target = (function(glace) {
          if (! isRelativePath) return arg;
          return glace.u.path.resolve(glace.dir, arg)
        })(this);
        return require(target);
      },
      Gas: function(arg, isRelativePath) {
        if (! isRelativePath) return this.global[arg.replace(/\-/g, '')];
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
