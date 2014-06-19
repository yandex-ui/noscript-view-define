describe('ns-view-edefine', function() {

    describe('наследование событий', function() {

        it('ребенок должен отнаследовать события', function() {

            ns.View.define('base', {
                events: {
                    'click .some-event': 'method'
                }
            });

            this.sinon.stub(ns.View, 'define');

            ns.View.edefine('child', {}, 'base');

            expect(ns.View.define).have.been.calledWith('child', {
                events: {
                    'click .some-event': 'method'
                }
            }, 'base');

        });

        it('ребенок должен перетереть родительский декларации', function() {

            ns.View.define('base', {
                events: {
                    'click .some-event': 'method',
                    'click .some-event1': 'method'
                }
            });

            this.sinon.stub(ns.View, 'define');

            ns.View.edefine('child', {
                events: {
                    'click .some-event': 'method1'
                }
            }, 'base');

            expect(ns.View.define).have.been.calledWith('child', {
                events: {
                    'click .some-event': 'method1',
                    'click .some-event1': 'method'
                }
            }, 'base');

        });

    });

    describe('множественное событий', function() {

        beforeEach(function() {

            ns.View.define('base1', {
                methods: {
                    foo: function() {

                    }
                }
            });

            ns.View.define('base2', {
                methods: {
                    bar: function() {

                    }
                }
            });

        });

        it('должен наследоваться от нескольких видов', function() {
            ns.View.edefine('child', {}, 'base1', 'base2');
            var view = ns.View.create('child');

            expect(view.bar).to.be.a('function');
            expect(view.foo).to.be.a('function');
        });

    });

});
