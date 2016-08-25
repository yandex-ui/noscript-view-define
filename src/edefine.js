const ns = require('ns');
const _ = require('lodash');

const spreadMergeWith = _.spread(_.mergeWith);

function wrapperEvents(srcFunc, objFunc, ...args) {
    objFunc && (_.isFunction(objFunc) ? objFunc.apply(this, args) : _.invoke(this, objFunc, ...args));
    srcFunc && (_.isFunction(srcFunc) ? objFunc.apply(this, args) : _.invoke(this, srcFunc, ...args));
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
    info = _(info)
        .chain()
        .get('mixins', [])
        .concat(mixins)
        .filter(_.isString)
        .map(mixin => ns.View.info(mixin))
        .push(mergeCustomizer)
        .tap(spreadMergeWith)
        .value();

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

[ ns.View, ns.ViewCollection ].forEach(function (classExtend) {
    classExtend.edefine = function (id, info, ...mixins) {
        return classExtend.define(id, inheritInfo(info, mixins), _.last(mixins));
    };
});
