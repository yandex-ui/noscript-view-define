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

        it('ребенок должен перетереть родительский декларации', function() {

            ns.ViewCollection.define('base', {
                events: {
                    'click .some-event': 'method',
                    'click .some-event1': 'method'
                },
                split: {
                    byModel: 'modelCollection',
                    intoViews: 'aa'
                },
                models: ['modelCollection']
            });

            this.sinon.stub(ns.ViewCollection, 'define');

            ns.ViewCollection.edefine('child', {
                events: {
                    'click .some-event': 'method1'
                },
                split: {
                    byModel: 'modelCollection',
                    intoViews: 'aa'
                },
                models: ['modelCollection']
            }, 'base');

            expect(ns.ViewCollection.define).have.been.calledWith('child', {
                events: {
                    'click .some-event': 'method1',
                    'click .some-event1': 'method'
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
                    foo: function() {

                    }
                },
                split: {
                    byModel: 'modelCollection',
                    intoViews: 'aa'
                },
                models: ['modelCollection']
            });

            ns.ViewCollection.define('base2', {
                methods: {
                    bar: function() {

                    }
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
