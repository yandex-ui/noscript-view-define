(function() {
    /**
     * Хелпер для наследования событийных привязок и методов
     * @param info Объект-информация о сущности
     * @param params Массив имен предков
     * @returns {Object} Модифицированный объект-информация
     */
    function inheritInfo(info, params) {
        params.forEach(function(base) {
            if (typeof base === 'string') {
                var baseInfo = ns.View.info(base);
                info.events = no.extend({}, baseInfo.events, info.events);
            }
        });

        params.slice(0, params.length - 1).forEach(function(base) {
            if (typeof base === 'string') {
                var baseInfo = ns.View.info(base);
                info.methods = no.extend({}, baseInfo.methods, info.methods);
            }
        });

        return info;
    }

    /**
     * Классы ns для расширения
     * @type {*[]}
     */
    var classes = [ns.View, ns.ViewCollection];

    classes.forEach(function(c) {
        c.edefine = function(id, info) {
            info = info || {};

            var restArgs = Array.prototype.slice.call(arguments, 2);
            info = inheritInfo(info, restArgs);

            return c.define(id, info, arguments[arguments.length - 1]);
        };
    });
})();

