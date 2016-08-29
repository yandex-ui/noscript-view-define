const _ = require('lodash');
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
const spreadMergeWith = _.spread(_.mergeWith);

/**
 * Вывод предупреждения в консоль
 * @type {function}
 */
const warn = _.wrap(_.invoke, function (invoke, ...args) {
    const text = args.shift();
    invoke(window, 'console.warn', '[ns.View.edefine] ' + text, ...args);
});

/**
 * Вывод лога в консоль
 * @type {function}
 */
const log = _.wrap(_.invoke, function (invoke, ...args) {
    const text = args.shift();
    invoke(window, 'console.log', '[ns.View.edefine] ' + text, ...args);
});

function wrapperEvents(srcFunc, objFunc, ...args) {
    const resultSrc = srcFunc && (_.isFunction(srcFunc) ? srcFunc.apply(this, args) : _.invoke(this, srcFunc, ...args));
    const resultObj = objFunc && (_.isFunction(objFunc) ? objFunc.apply(this, args) : _.invoke(this, objFunc, ...args));

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

    if ((objValue === 'invalidate' && srcValue === 'keepValid') ||
        (objValue === 'keepValid' && srcValue === 'invalidate')) {

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
        return _.mergeWith(
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
    const parent = viewInfo(mixins.pop());
    const customizer = mergeCustomizer.bind(classExtend);

    return _(child)
        .chain()
        .get('mixins', [])
        .concat(mixins)
        .reverse()
        .unshift(child)
        .map(mixin => _.pick(viewInfo(mixin), PATH_EXTENDS))
        .push(customizer)
        .thru(spreadMergeWith)
        .mergeWith(_.pick(parent, PATH_PARENT_EXTENDS), customizer)
        .defaults(child)
        .value();
}

[ ns.View, ns.ViewCollection ].forEach(function (classExtend) {
    classExtend.edefine = function (id, info, ...mixins) {
        ns.DEBUG && log('Определение вида %s: %o', id, mixins);
        return classExtend.define(id, inheritInfo(classExtend, info, mixins), _.last(mixins));
    };
});
