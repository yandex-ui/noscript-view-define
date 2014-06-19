ns.View._ns_initInfoEvents = ns.View._initInfoEvents;
ns.View._initInfoEvents = function(info) {
    var events = info.events;
    ns.View._ns_initInfoEvents(info);
    info.events = events;
};

ns.View.edefine = function(id, info) {
    info = info || {};

    Array.prototype.slice.call(arguments, 2).forEach(function(base) {
        if (typeof base === 'string') {
            var baseInfo = ns.View.info(base);
            info.events = no.extend({}, baseInfo.events, info.events);
        }
    });

    Array.prototype.slice.call(arguments, 2, arguments.length - 1).forEach(function(base) {
        if (typeof base === 'string') {
            var baseInfo = ns.View.info(base);
            info.methods = no.extend({}, baseInfo.methods, info.methods);
        }
    });

    return ns.View.define(id, info, arguments[arguments.length - 1] );
};
