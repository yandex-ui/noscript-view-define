/******/ (function(modules) { // webpackBootstrap
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

	var PATH_EXTENDS = ['ctor', 'events', 'methods'];
	var PATH_PARENT_EXTENDS = ['ctor', 'events'];
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

	    if (key === 'ctor') {
	        return function () {
	            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	                args[_key2] = arguments[_key2];
	            }

	            objValue && objValue.apply(this, args);
	            srcValue && srcValue.apply(this, args);
	        };
	    }
	}

	function viewInfo(info) {
	    return _.isString(info) && ns.View.info(info) || info;
	}

	/**
	 * Хелпер для наследования событийных привязок и методов
	 * @param {Object} child Объект-информация о сущности
	 * @param {array} mixins Массив имен предков
	 * @returns {Object} Модифицированный объект-информация
	 */
	function inheritInfo(child, mixins) {
	    var parent = viewInfo(mixins.pop());

	    return _(child).chain().get('mixins', []).concat(_.get(parent, 'mixins', [])).concat(mixins).unshift({}, child).map(function (mixin) {
	        return _.pick(viewInfo(mixin), PATH_EXTENDS);
	    }).push(mergeCustomizer).thru(spreadMergeWith).mergeWith(_.pick(parent, PATH_PARENT_EXTENDS), mergeCustomizer).defaults(child).value();
	}

	[ns.View, ns.ViewCollection].forEach(function (classExtend) {
	    classExtend.edefine = function (id, info) {
	        for (var _len3 = arguments.length, mixins = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
	            mixins[_key3 - 2] = arguments[_key3];
	        }

	        return classExtend.define(id, inheritInfo(info, mixins), _.last(mixins));
	    };
	});

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = ns;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = _;

/***/ }
/******/ ]);