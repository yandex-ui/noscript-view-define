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

            ns.View.edefine('child', {
                events: { 'click .some-event3': 'method3' }
            }, 'mixin', 'base');

            var info = ns.View.info('child');
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

            ns.View.edefine('child', {
                events: { 'click .some-event': spy2 }
            }, 'base');

            var info = ns.View.info('child');
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

            ns.View.edefine('child', {
                events: { 'click .some-event': spy3 }
            }, 'mixin', 'base');

            var info = ns.View.info('child');
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
            ns.View.edefine('child', { ctor: spy2 }, 'base');

            var info = ns.View.info('child');
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
            ns.View.edefine('child', { ctor: spy3 }, 'mixin', 'base');

            var info = ns.View.info('child');
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
            ns.View.edefine('child', { ctor: spy4 }, 'mixin', 'base');

            var info = ns.View.info('child');
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
            ns.View.edefine('child', { methods: { fn4: function() {} } }, 'mixin', 'base');

            var info = ns.View.info('child');
            expect(info.methods).to.have.keys([ 'fn3', 'fn4' ]);
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
                    'click .some-event': 'method'
                },
                split: {
                    byModel: 'modelCollection',
                    intoViews: 'aa'
                },
                models: ['modelCollection']
            });

            this.sinon.stub(ns.ViewCollection, 'define');

            ns.ViewCollection.edefine('child', {
                split: {
                    byModel: 'modelCollection',
                    intoViews: 'aa'
                },
                models: ['modelCollection']
            }, 'base');

            expect(ns.ViewCollection.define).have.been.calledWith('child', {
                events: {
                    'click .some-event': 'method'
                },
                split: {
                    byModel: 'modelCollection',
                    intoViews: 'aa'
                },
                models: ['modelCollection']
            }, 'base');

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
            ns.ViewCollection.edefine('child', {
                split: {
                    byModel: 'modelCollection',
                    intoViews: 'aa'
                },
                models: ['modelCollection']
            }, 'base1', 'base2');

            var view = ns.ViewCollection.create('child');

            expect(view.bar).to.be.a('function');
            expect(view.foo).to.be.a('function');
        });
    });
});
