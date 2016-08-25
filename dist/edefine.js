(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("ns"), require("lodash"));
	else if(typeof define === 'function' && define.amd)
		define(["ns", "lodash"], factory);
	else if(typeof exports === 'object')
		exports["edefine"] = factory(require("ns"), require("lodash"));
	else
		root["edefine"] = factory(root["ns"], root["_"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_2__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var ns = __webpack_require__(1);
	var _ = __webpack_require__(2);

	var spreadMergeWith = _.spread(_.mergeWith);

	function wrapperEvents(srcFunc, objFunc) {
	    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
	        args[_key - 2] = arguments[_key];
	    }

	    objFunc && (_.isFunction(objFunc) ? objFunc.apply(this, args) : _.invoke.apply(_, [this, objFunc].concat(args)));
	    srcFunc && (_.isFunction(srcFunc) ? objFunc.apply(this, args) : _.invoke.apply(_, [this, srcFunc].concat(args)));
	}

	function eventsCustomizer(objValue, srcValue) {
	    if (!objValue) {
	        return srcValue;
	    }

	    return _.wrap(objValue, _.wrap(srcValue, wrapperEvents));
	}

	function mergeCustomizer(objValue, srcValue, key) {
	    if (key === 'events') {
	        return _.mergeWith(objValue, srcValue, eventsCustomizer);
	    }

	    return objValue;
	}

	/**
	 * Хелпер для наследования событийных привязок и методов
	 * @param info Объект-информация о сущности
	 * @param params Массив имен предков
	 * @returns {Object} Модифицированный объект-информация
	 */
	function inheritInfo(info, mixins) {
	    info = _(info).chain().get('mixins', []).concat(mixins).filter(_.isString).map(function (mixin) {
	        return ns.View.info(mixin);
	    }).push(mergeCustomizer).tap(spreadMergeWith).value();

	    /*
	        params.forEach(function (base) {
	            if (typeof base === 'string') {
	                var baseInfo = ns.View.info(base);
	                info.events = extend({}, baseInfo.events, info.events);
	            }
	        });
	    
	        params.slice(0, params.length - 1).forEach(function (base) {
	            if (typeof base === 'string') {
	                var baseInfo = ns.View.info(base);
	                info.methods = extend({}, baseInfo.methods, info.methods);
	            }
	        });
	    */
	    return info;
	}

	[ns.View, ns.ViewCollection].forEach(function (classExtend) {
	    classExtend.edefine = function (id, info) {
	        for (var _len2 = arguments.length, mixins = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
	            mixins[_key2 - 2] = arguments[_key2];
	        }

	        return classExtend.define(id, inheritInfo(info, mixins), _.last(mixins));
	    };
	});

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ }
/******/ ])
});
;