var ns = require('ns');

describe('ns-view-edefine', function() {

    describe('наследование событий', function() {
        it('ребенок должен отнаследовать события', function() {
            ns.View.define('base', {
                events: { 'click .some-event1': 'method1' }
            });

            ns.View.define('mixin', {
                events: { 'click .some-event2': 'method2' }
            });

            ns.View.edefine('child-events-inherit1', {
                events: { 'click .some-event3': 'method3' }
            }, 'mixin', 'base');

            var info = ns.View.info('child-events-inherit1');
            expect(info.events).to.be.eql({
                'click .some-event3': 'method3',
                'click .some-event2': 'method2',
                'click .some-event1': 'method1'
            });
        });

        it('колбеки одинаковых событий объединяются', function() {
            var spy1 = this.sinon.spy();
            var spy2 = this.sinon.spy();

            ns.View.define('base', {
                events: { 'click .some-event': spy1 }
            });

            ns.View.edefine('child-events-inherit2', {
                events: { 'click .some-event': spy2 }
            }, 'base');

            var info = ns.View.info('child-events-inherit2');
            info.events[ 'click .some-event' ]();

            expect(spy1.callCount).to.be.equal(1);
            expect(spy2.callCount).to.be.equal(1);
            expect(spy2.calledAfter(spy1)).to.be.ok;
        });

        it('колбек миксина дитя должен быть вызван после колбека предка и до колбека дитя', function() {
            var spy1 = this.sinon.spy();
            var spy2 = this.sinon.spy();
            var spy3 = this.sinon.spy();

            ns.View.define('base', {
                events: { 'click .some-event': spy1 }
            });

            ns.View.define('mixin', {
                events: { 'click .some-event': spy2 }
            });

            ns.View.edefine('child-events-inherit3', {
                events: { 'click .some-event': spy3 }
            }, 'mixin', 'base');

            var info = ns.View.info('child-events-inherit3');
            info.events[ 'click .some-event' ]();

            expect(spy1.callCount).to.be.equal(1);
            expect(spy2.callCount).to.be.equal(1);
            expect(spy3.callCount).to.be.equal(1);
            expect(spy2.calledAfter(spy1)).to.be.ok;
            expect(spy3.calledAfter(spy2)).to.be.ok;
        });
    });

    describe('конструктор', function() {
        it('конструктор предка должен быть вызван перед конструктором вида', function() {
            var spy1 = this.sinon.spy();
            var spy2 = this.sinon.spy();

            ns.View.define('base', { ctor: spy1 });
            ns.View.edefine('child-ctor-inherit1', { ctor: spy2 }, 'base');

            var info = ns.View.info('child-ctor-inherit1');
            info.ctor();

            expect(spy1.callCount).to.be.equal(1);
            expect(spy2.callCount).to.be.equal(1);
            expect(spy2.calledAfter(spy1)).to.be.ok;
        });

        it('конструктор миксина дитя должен быть вызван после конструктора предка и до конструктора дитя', function() {
            var spy1 = this.sinon.spy();
            var spy2 = this.sinon.spy();
            var spy3 = this.sinon.spy();

            ns.View.define('base', { ctor: spy1 });
            ns.View.define('mixin', { ctor: spy2 });
            ns.View.edefine('child-ctor-inherit2', { ctor: spy3 }, 'mixin', 'base');

            var info = ns.View.info('child-ctor-inherit2');
            info.ctor();

            expect(spy1.callCount).to.be.equal(1);
            expect(spy2.callCount).to.be.equal(1);
            expect(spy3.callCount).to.be.equal(1);
            expect(spy2.calledAfter(spy1)).to.be.ok;
            expect(spy3.calledAfter(spy2)).to.be.ok;
        });

        it('конструктор миксина предка должен быть вызван до конструктора предка', function() {
            var spy1 = this.sinon.spy();
            var spy2 = this.sinon.spy();
            var spy3 = this.sinon.spy();
            var spy4 = this.sinon.spy();

            ns.View.define('sbase');
            ns.View.define('bmixin', { ctor: spy1 });
            ns.View.edefine('base', { ctor: spy2 }, 'bmixin', 'sbase');
            ns.View.define('mixin', { ctor: spy3 });
            ns.View.edefine('child-ctor-inherit3', { ctor: spy4 }, 'mixin', 'base');

            var info = ns.View.info('child-ctor-inherit3');
            info.ctor();

            expect(spy1.callCount).to.be.equal(1);
            expect(spy2.callCount).to.be.equal(1);
            expect(spy3.callCount).to.be.equal(1);
            expect(spy4.callCount).to.be.equal(1);
            expect(spy2.calledAfter(spy1)).to.be.ok;
            expect(spy3.calledAfter(spy2)).to.be.ok;
            expect(spy4.calledAfter(spy3)).to.be.ok;
        });
    });

    describe('наследование методов', function() {
        it('методы миксинов и потомка объединяются', function() {
            ns.View.define('sbase');
            ns.View.define('bmixin', { methods: { fn1: function() {} } });
            ns.View.edefine('base', { methods: { fn2: function() {} } }, 'bmixin', 'sbase');
            ns.View.define('mixin', { methods: { fn3: function() {} } });
            ns.View.edefine('child-methods-inherit1', { methods: { fn4: function() {} } }, 'mixin', 'base');

            var info = ns.View.info('child-methods-inherit1');
            expect(info.methods).to.have.keys([ 'fn3', 'fn4' ]);
        });
    });

    describe('наследование моделей', function() {
        beforeEach(function() {
            ns.Model.define('model1');
            ns.Model.define('model2');
            ns.Model.define('model3');
            ns.Model.define('model4');
            ns.Model.define('model5');
        });

        it('потомок зависит от всех моделей, указанных в предке и миксинах', function() {
            ns.View.define('sbase', {
                models: [ 'model1' ]
            });

            ns.View.define('bmixin', {
                models: { 'model2': false }
            });

            ns.View.edefine('base', {
                models: { 'model3': true }
            }, 'bmixin', 'sbase');

            ns.View.define('mixin', {
                models: { 'model4': true }
            });

            ns.View.edefine('child-models-inherit', {
                models: { 'model5': false }
            }, 'mixin', 'base');

            var info = ns.View.info('child-models-inherit');
            expect(info.models).to.have.keys([
                'model1',
                'model2',
                'model3',
                'model4',
                'model5'
            ]);
        });

        it('колбеки общих событий одинаковых моделей объединяются и выполняются вначале у миксинов и предка', function() {
            var spy1 = this.sinon.spy();
            var spy2 = this.sinon.spy();
            var spy3 = this.sinon.spy();
            var spy4 = this.sinon.spy();
            var spy5 = this.sinon.spy();

            ns.View.define('sbase', {
                models: {
                    model1: { 'ns-model-changed': spy1 }
                }
            });

            ns.View.define('bmixin', {
                models: {
                    model1: { 'ns-model-changed': spy2 }
                }
            });

            ns.View.edefine('base', {
                models: {
                    model1: { 'ns-model-changed': spy3 }
                }
            }, 'bmixin', 'sbase');

            ns.View.define('mixin', {
                models: {
                    model1: { 'ns-model-changed': spy4 }
                }
            });

            ns.View.edefine('child-models-inherit', {
                models: {
                    model1: { 'ns-model-changed': spy5 }
                }
            }, 'mixin', 'base');

            var info = ns.View.info('child-models-inherit');
            info.models.model1[ 'ns-model-changed' ]();

            expect(spy1.callCount).to.be.equal(1);
            expect(spy2.callCount).to.be.equal(1);
            expect(spy3.callCount).to.be.equal(1);
            expect(spy4.callCount).to.be.equal(1);
            expect(spy5.callCount).to.be.equal(1);
            expect(spy2.calledAfter(spy1)).to.be.ok;
            expect(spy3.calledAfter(spy2)).to.be.ok;
            expect(spy4.calledAfter(spy3)).to.be.ok;
            expect(spy5.calledAfter(spy4)).to.be.ok;
        });

        it('попытка подписать явно противоположные колбеки вызывает исключение', function() {
            ns.View.define('base');

            ns.View.define('mixin', {
                models: {
                    model1: { 'ns-model-changed': true }
                }
            });

            expect(function() {
                ns.View.edefine('child-models-inherit', {
                    models: {
                        model1: { 'ns-model-changed': false }
                    }
                }, 'mixin', 'base');
            }).to.throw(Error);
        });
    });

    describe('миксины через свойство mixins', function() {
        it('события миксинов, указанных в mixins, вызываются перед событиями, указанными в аргументах, но до событий дитя', function() {
            var spy1 = this.sinon.spy();
            var spy2 = this.sinon.spy();
            var spy3 = this.sinon.spy();

            ns.View.define('base');
            ns.View.define('mixin1', { ctor: spy1 });
            ns.View.define('mixin2', { ctor: spy2 });
            ns.View.edefine('child-mixins-inherit1', {
                mixins: [ 'mixin1' ],
                ctor: spy3
            }, 'mixin2', 'base');

            var info = ns.View.info('child-mixins-inherit1');
            info.ctor();

            expect(spy1.callCount).to.be.equal(1);
            expect(spy2.callCount).to.be.equal(1);
            expect(spy3.callCount).to.be.equal(1);
            expect(spy2.calledAfter(spy1)).to.be.ok;
            expect(spy3.calledAfter(spy2)).to.be.ok;
        });

        it('колбеки вызываются в порядке перечисления', function() {
            var spy1 = this.sinon.spy();
            var spy2 = this.sinon.spy();
            var spy3 = this.sinon.spy();

            ns.View.define('mixin1', { ctor: spy1 });
            ns.View.define('mixin2', { ctor: spy2 });
            ns.View.edefine('child-mixins-inherit2', {
                mixins: [ 'mixin1', 'mixin2' ],
                ctor: spy3
            });

            var info = ns.View.info('child-mixins-inherit2');
            info.ctor();

            expect(spy1.callCount).to.be.equal(1);
            expect(spy2.callCount).to.be.equal(1);
            expect(spy3.callCount).to.be.equal(1);
            expect(spy2.calledAfter(spy1)).to.be.ok;
            expect(spy3.calledAfter(spy2)).to.be.ok;
        });

        it('для миксинов в аргументах колбеки вызываются в порядке перечисления', function() {
            var spy1 = this.sinon.spy();
            var spy2 = this.sinon.spy();
            var spy3 = this.sinon.spy();

            ns.View.define('mixin1', { ctor: spy1 });
            ns.View.define('mixin2', { ctor: spy2 });
            ns.View.edefine('child-mixins-inherit2', {
                ctor: spy3
            }, 'mixin1', 'mixin2', ns.View);

            var info = ns.View.info('child-mixins-inherit2');
            info.ctor();

            expect(spy1.callCount).to.be.equal(1);
            expect(spy2.callCount).to.be.equal(1);
            expect(spy3.callCount).to.be.equal(1);
            expect(spy2.calledAfter(spy1)).to.be.ok;
            expect(spy3.calledAfter(spy2)).to.be.ok;
        });
    });
});

describe('ns-viewCollection-edefine', function() {
    beforeEach(function() {
        ns.Model.define('modelCollection', {
            isCollection: true
        });
    });

    describe('наследование событий', function() {
        it('ребенок должен отнаследовать события', function() {
            ns.ViewCollection.define('base', {
                events: {
                    'click .some-event1': 'method1'
                },
                split: {
                    byModel: 'modelCollection',
                    intoViews: 'aa'
                },
                models: ['modelCollection']
            });

            ns.ViewCollection.edefine('child-collection-events-inherit', {
                events: {
                    'click .some-event2': 'method2'
                },
                split: {
                    byModel: 'modelCollection',
                    intoViews: 'aa'
                },
                models: ['modelCollection']
            }, 'base');

            var info = ns.View.info('child-collection-events-inherit');

            expect(info.events).to.be.eql({
                'click .some-event2': 'method2',
                'click .some-event1': 'method1'
            });
        });
    });

    describe('множественное событий', function() {
        beforeEach(function() {
            ns.ViewCollection.define('base1', {
                methods: {
                    foo: function() {}
                },
                split: {
                    byModel: 'modelCollection',
                    intoViews: 'aa'
                },
                models: ['modelCollection']
            });

            ns.ViewCollection.define('base2', {
                methods: {
                    bar: function() {}
                },
                split: {
                    byModel: 'modelCollection',
                    intoViews: 'aa'
                },
                models: ['modelCollection']
            });
        });

        it('должен наследоваться от нескольких видов', function() {
            ns.ViewCollection.edefine('child-collection-events-inherit-many', {
                split: {
                    byModel: 'modelCollection',
                    intoViews: 'aa'
                },
                models: ['modelCollection']
            }, 'base1', 'base2');

            var view = ns.ViewCollection.create('child-collection-events-inherit-many');

            expect(view.bar).to.be.a('function');
            expect(view.foo).to.be.a('function');
        });
    });
});
