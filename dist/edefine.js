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

	var _ = __webpack_require__(1);
	var ns = __webpack_require__(2);

	/**
	 * Свойства, которые будут учтены при объединении миксинов.
	 * Порядок важен: первым должны объединить методы.
	 * @type {array}
	 */
	var PATH_EXTENDS = ['methods', 'ctor', 'events', 'models'];

	/**
	 * Свойства, которые будут учтены при объединении предка.
	 * @type {array}
	 */
	var PATH_PARENT_EXTENDS = ['ctor', 'events', 'models'];

	/**
	 * Объединение объектов, переданных в виде массива.
	 * @type {function}
	 */
	var spreadMergeWith = _.spread(_.mergeWith);

	/**
	 * Вывод предупреждения в консоль
	 * @type {function}
	 */
	var warn = _.wrap(_.invoke, function (invoke) {
	    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        args[_key - 1] = arguments[_key];
	    }

	    invoke.apply(undefined, [window, 'console.warn', '[ns.View.edefine]'].concat(args));
	});

	function wrapperEvents(srcFunc, objFunc) {
	    for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
	        args[_key2 - 2] = arguments[_key2];
	    }

	    var resultSrc = srcFunc && (_.isFunction(srcFunc) ? srcFunc.apply(this, args) : _.invoke.apply(_, [this, srcFunc].concat(args)));
	    var resultObj = objFunc && (_.isFunction(objFunc) ? objFunc.apply(this, args) : _.invoke.apply(_, [this, objFunc].concat(args)));

	    if (ns.DEBUG && !(_.isUndefined(resultSrc) && _.isUndefined(resultObj))) {
	        warn('Обработчик события не должен возвращать результат');
	    }
	}

	/**
	 * Объединение колбеков одинаковых событий
	 * @param {string|function} objValue
	 * @param {string|function} srcValue
	 * @param {string} key
	 * @returns {string|function}
	 */
	function eventsCustomizer(objValue, srcValue, key) {
	    if (checkIgnoreMerge(objValue, srcValue)) {
	        return srcValue;
	    }

	    if (objValue === 'invalidate' && srcValue === 'keepValid' || objValue === 'keepValid' && srcValue === 'invalidate') {

	        ns.assert.fail('ns.View.edefine', 'Попытка определить подписки с противоположными действиями. Событие: %s', key);
	    }

	    return _.wrap(objValue, _.wrap(srcValue, wrapperEvents));
	}

	/**
	 * Объединение объектов событий
	 * @param {Object} objValue
	 * @param {Object} srcValue
	 * @returns {Object}
	 */
	function groupEventsCustomizer(objValue, srcValue) {
	    if (checkIgnoreMerge(objValue, srcValue)) {
	        return srcValue;
	    }

	    return _.mergeWith(objValue, srcValue, eventsCustomizer);
	}

	/**
	 * Объединение методов и свойств.
	 * Методы и свойства переопределяются в порядке перечисления миксинов.
	 * Дитё переопределяет любой метод и свойство.
	 * @param {*} objValue
	 * @param {*} srcValue
	 * @returns {*}
	 */
	function methodsCustomizer(objValue, srcValue) {
	    if (checkIgnoreMerge(objValue, srcValue)) {
	        return srcValue;
	    }

	    return objValue;
	}

	/**
	 * Объединения данных при наследовании
	 * @param {*} objValue
	 * @param {*} srcValue
	 * @param {string} key
	 * @returns {*}
	 */
	function mergeCustomizer(objValue, srcValue, key) {
	    if (checkIgnoreMerge(objValue, srcValue)) {
	        return srcValue;
	    }

	    if (key === 'methods') {
	        return _.mergeWith(objValue, srcValue, methodsCustomizer);
	    }

	    if (key === 'events') {
	        return groupEventsCustomizer(objValue, srcValue);
	    }

	    if (key === 'models') {
	        return _.mergeWith(this._formatModelsDecl(objValue), this._formatModelsDecl(srcValue), groupEventsCustomizer);
	    }

	    if (key === 'ctor') {
	        return function () {
	            srcValue && srcValue.call(this);
	            objValue && objValue.call(this);
	        };
	    }
	}

	/**
	 * Получение информации по виду
	 * @param {Object|string} info
	 * @returns {Object}
	 */
	function viewInfo(info) {
	    return _.isString(info) && ns.View.info(info) || info;
	}

	/**
	 * Проверка необходимости выполнения слияния
	 * @param {*} objValue
	 * @param {*} srcValue
	 * @returns {boolean}
	 */
	function checkIgnoreMerge(objValue, srcValue) {
	    return _.isUndefined(objValue) || objValue === srcValue;
	}

	/**
	 * Хелпер для наследования событийных привязок и методов
	 * @param {Object} classExtend Расширяемый объект
	 * @param {Object} child Объект-информация о сущности
	 * @param {array} mixins Массив имен предков
	 * @returns {Object} Модифицированный объект-информация
	 */
	function inheritInfo(classExtend, child, mixins) {
	    mixins = _.clone(mixins);
	    var parent = viewInfo(mixins.pop());
	    var customizer = mergeCustomizer.bind(classExtend);

	    return _(child).chain().get('mixins', []).concat(mixins).reverse().unshift(child).map(function (mixin) {
	        return _.pick(viewInfo(mixin), PATH_EXTENDS);
	    }).push(customizer).thru(spreadMergeWith).mergeWith(_.pick(parent, PATH_PARENT_EXTENDS), customizer).defaults(child).value();
	}

	[ns.View, ns.ViewCollection].forEach(function (classExtend) {
	    classExtend.edefine = function (id, info) {
	        for (var _len3 = arguments.length, mixins = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
	            mixins[_key3 - 2] = arguments[_key3];
	        }

	        return classExtend.define(id, inheritInfo(classExtend, info, mixins), _.last(mixins));
	    };
	});

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = _;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = ns;

/***/ }
/******/ ]);