(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('preact')) :
  typeof define === 'function' && define.amd ? define(['preact'], factory) :
  (global.preactPortal = factory(global.preact));
}(this, (function (preact) { 'use strict';

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var Portal = function (_Component) {
	inherits(Portal, _Component);

	function Portal() {
		classCallCheck(this, Portal);
		return possibleConstructorReturn(this, _Component.apply(this, arguments));
	}

	Portal.prototype.componentDidUpdate = function componentDidUpdate(props) {
		for (var i in props) {
			if (props[i] !== this.props[i]) {
				return setTimeout(this.renderLayer);
			}
		}
	};

	Portal.prototype.componentDidMount = function componentDidMount() {
		this.isMounted = true;
		this.renderLayer = this.renderLayer.bind(this);
		this.renderLayer();
	};

	Portal.prototype.componentWillUnmount = function componentWillUnmount() {
		this.renderLayer(false);
		this.isMounted = false;
		if (this.remote) this.remote.parentNode.removeChild(this.remote);
	};

	Portal.prototype.findNode = function findNode(node) {
		return typeof node === 'string' ? this.getDocument().querySelector(node) : node;
	};

	Portal.prototype.getDocument = function getDocument() {
		if (this.props.getDocument) {
			return this.props.getDocument();
		}
		return document;
	};

	Portal.prototype.renderLayer = function renderLayer() {
		var show = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

		if (!this.isMounted) return;

		if (this.props.into !== this.intoPointer) {
			this.intoPointer = this.props.into;
			if (this.into && this.remote) {
				this.remote = preact.render(preact.h(PortalProxy, null), this.into, this.remote);
			}
			this.into = this.findNode(this.props.into);
		}

		this.remote = preact.render(preact.h(
			PortalProxy,
			{ context: this.context },
			show && this.props.children || null
		), this.into, this.remote);
	};

	Portal.prototype.render = function render() {
		return null;
	};

	return Portal;
}(preact.Component);

var PortalProxy = function (_Component2) {
	inherits(PortalProxy, _Component2);

	function PortalProxy() {
		classCallCheck(this, PortalProxy);
		return possibleConstructorReturn(this, _Component2.apply(this, arguments));
	}

	PortalProxy.prototype.getChildContext = function getChildContext() {
		return this.props.context;
	};

	PortalProxy.prototype.render = function render(_ref) {
		var children = _ref.children;

		return children && children[0] || null;
	};

	return PortalProxy;
}(preact.Component);

return Portal;

})));
//# sourceMappingURL=preact-portal.js.map
