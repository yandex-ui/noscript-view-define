const clone = require('lodash/clone');
const concat = require('lodash/concat');
const reverse = require('lodash/reverse');
const defaults = require('lodash/defaults');
const get = require('lodash/get');
const invoke = require('lodash/invoke');
const isFunction = require('lodash/isFunction');
const isString = require('lodash/isString');
const isUndefined = require('lodash/isUndefined');
const last = require('lodash/last');
const mergeWith = require('lodash/mergeWith');
const pick = require('lodash/pick');
const spread = require('lodash/spread');
const wrap = require('lodash/wrap');
const map = require('lodash/map');
const thru = require('lodash/thru');

const ns = require('ns');

/**
 * Свойства, которые будут учтены при объединении миксинов.
 * Порядок важен: первым должны объединить методы.
 * @type {array}
 */
const PATH_EXTENDS = [ 'methods', 'ctor', 'events', 'models' ];

/**
 * Свойства, которые будут учтены при объединении предка.
 * @type {array}
 */
const PATH_PARENT_EXTENDS = [ 'ctor', 'events', 'models' ];

/**
 * Объединение объектов, переданных в виде массива.
 * @type {function}
 */
const spreadMergeWith = spread(mergeWith);

/**
 * Вывод предупреждения в консоль
 * @type {function}
 */
const warn = wrap(invoke, function (func, ...args) {
    const text = args.shift();
    func(window, 'console.warn', '[ns.View.edefine] ' + text, ...args);
});

/**
 * Вывод лога в консоль
 * @type {function}
 */
const log = wrap(invoke, function (func, ...args) {
    const text = args.shift();
    func(window, 'console.log', '[ns.View.edefine] ' + text, ...args);
});

function wrapperEvents(srcFunc, objFunc, ...args) {
    const resultSrc = srcFunc && (isFunction(srcFunc) ? srcFunc.apply(this, args) : invoke(this, srcFunc, ...args));
    const resultObj = objFunc && (isFunction(objFunc) ? objFunc.apply(this, args) : invoke(this, objFunc, ...args));

    if (ns.DEBUG && !(isUndefined(resultSrc) && isUndefined(resultObj))) {
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

    if ((objValue === 'invalidate' && srcValue === 'keepValid') ||
        (objValue === 'keepValid' && srcValue === 'invalidate')) {

        ns.assert.fail('ns.View.edefine', 'Попытка определить подписки с противоположными действиями. Событие: %s', key);
    }

    return wrap(objValue, wrap(srcValue, wrapperEvents));
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

    return mergeWith(objValue, srcValue, eventsCustomizer);
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
        return mergeWith(objValue, srcValue, methodsCustomizer);
    }

    if (key === 'events') {
        return groupEventsCustomizer(objValue, srcValue);
    }

    if (key === 'models') {
        return mergeWith(
            this._formatModelsDecl(objValue),
            this._formatModelsDecl(srcValue),
            groupEventsCustomizer
        );
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
    return isString(info) && ns.View.info(info) || info;
}

/**
 * Проверка необходимости выполнения слияния
 * @param {*} objValue
 * @param {*} srcValue
 * @returns {boolean}
 */
function checkIgnoreMerge(objValue, srcValue) {
    return isUndefined(objValue) || objValue === srcValue;
}

/**
 * Хелпер для наследования событийных привязок и методов
 * @param {Object} classExtend Расширяемый объект
 * @param {Object} child Объект-информация о сущности
 * @param {array} mixins Массив имен предков
 * @returns {Object} Модифицированный объект-информация
 */
function inheritInfo(classExtend, child, mixins) {
    mixins = clone(mixins);
    const parent = viewInfo(mixins.pop());
    const customizer = mergeCustomizer.bind(classExtend);

    let info = get(child, 'mixins', []);
    info = concat(info, mixins);
    info = reverse(info);
    info.unshift(child);
    info = map(info, mixin => pick(viewInfo(mixin), PATH_EXTENDS));
    info.push(customizer);
    info = thru(info, spreadMergeWith);
    info = mergeWith(info, pick(parent, PATH_PARENT_EXTENDS), customizer);
    info = defaults(info, child);

    return info;
}

[ ns.View, ns.ViewCollection ].forEach(function (classExtend) {

    /**
     * Декларация вида
     * @param {string} id идентификатор вида
     * @param {Object} info параметры вида
     * @param {...string|Object} mixins набор миксинов, последним указывается предок
     * @returns {function} конструктор
     */
    classExtend.defineNg = function (id, info, ...mixins) {
        ns.DEBUG && log('Определение вида %s, mixins: %o, %o', id, mixins, get(info, 'mixins', []));
        return classExtend.define(id, inheritInfo(classExtend, info, mixins), last(mixins));
    };

    /**
     * Формирование объекта событий модели
     * @param {Object} events пользовательские события
     * @param {Object|boolean} [defaultDecl=false] значение событий по умолчанию
     * @returns {Object}
     */
    classExtend.defineModelEvents = function (events, defaultDecl = false) {
        return defaults({}, events, get(classExtend._formatModelsDecl({ test: defaultDecl }), 'test'));
    };
});
