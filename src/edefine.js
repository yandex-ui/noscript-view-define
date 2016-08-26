const _ = require('lodash');
const ns = require('ns');

const PATH_EXTENDS = [ 'ctor', 'events', 'methods' ];
const PATH_PARENT_EXTENDS = [ 'ctor', 'events' ];
const spreadMergeWith = _.spread(_.mergeWith);

function wrapperEvents(srcFunc, objFunc, ...args) {
    srcFunc && (_.isFunction(srcFunc) ? srcFunc.apply(this, args) : _.invoke(this, srcFunc, ...args));
    objFunc && (_.isFunction(objFunc) ? objFunc.apply(this, args) : _.invoke(this, objFunc, ...args));
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
        return function (...args) {
            srcValue && srcValue.apply(this, args);
            objValue && objValue.apply(this, args);
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
    mixins = _.clone(mixins);
    const parent = viewInfo(mixins.pop());

    return _(child)
        .chain()
        .get('mixins', [])
        .concat(mixins)
        .unshift({}, child)
        .map(mixin => _.pick(viewInfo(mixin), PATH_EXTENDS))
        .push(mergeCustomizer)
        .thru(spreadMergeWith)
        .mergeWith(_.pick(parent, PATH_PARENT_EXTENDS), mergeCustomizer)
        .defaults(child)
        .value();
}

[ ns.View, ns.ViewCollection ].forEach(function (classExtend) {
    classExtend.edefine = function (id, info, ...mixins) {
        return classExtend.define(id, inheritInfo(info, mixins), _.last(mixins));
    };
});
