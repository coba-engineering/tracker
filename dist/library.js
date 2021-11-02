(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.myLibraryName = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

module.exports = _defineProperty;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],2:[function(require,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],3:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var SUPABASE_HOST = "https://yjjqcbwwpdxdbnyhbwme.supabase.co/rest/v1/"; // prettier-ignore

function supabase(endpoint, body) {
  return fetch(SUPABASE_HOST + endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMjk4Mjg1OCwiZXhwIjoxOTQ4NTU4ODU4fQ.uclyC8mUUCjXai6nlEyZAwDit1A0cDiqLrJCCChHsXI",
      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMjk4Mjg1OCwiZXhwIjoxOTQ4NTU4ODU4fQ.uclyC8mUUCjXai6nlEyZAwDit1A0cDiqLrJCCChHsXI"
    },
    body: JSON.stringify(body)
  });
}

var normalize = function normalize(url) {
  url = url.startsWith("www.") ? url.slice(4) : url;
  url = url.endsWith("/") ? url.slice(0, -1) : url;
  return url;
};

var url = normalize(location.hostname + location.pathname);

var fetchExperiments = function fetchExperiments() {
  return supabase("rpc/get_experiments", {
    url: url
  });
};

var pushEvents = function pushEvents(events) {
  return supabase("events", events);
};

function init(ip) {
  function track(action, override) {
    var event = _objectSpread({
      url: url,
      ip: ip,
      action: action,
      timestamp: new Date().toJSON()
    }, override);

    console.log("tracking", event);
    pushEvents([event]);
  }

  function addConversionListener(_ref) {
    var type = _ref.type,
        trigger = _ref.trigger;

    switch (type) {
      case "click":
        var elements = Array.from(document.getElementsByClassName(trigger));
        elements.forEach(function (e) {
          e.addEventListener("click", function () {
            return track("click");
          }, {
            once: true
          });
        });
        break;

      case "view":
        if (normalize(trigger) === url) track("view");
        break;

      default:
        break;
    }
  }

  setTimeout(function () {
    return track("view", {
      is_conversion: false
    });
  }, 3000);
  fetchExperiments().then(function (experiments) {
    return experiments.forEach(addConversionListener);
  });
}

fetch("https://api.ipify.org").then(function (r) {
  return r.text();
}).then(function (ip) {
  return init(ip);
});

},{"@babel/runtime/helpers/defineProperty":1,"@babel/runtime/helpers/interopRequireDefault":2}]},{},[3])(3)
});
