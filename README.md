# noscript-view-edefine

[![Code Climate](https://codeclimate.com/github/yandex-ui/noscript-view-edefine/badges/gpa.svg)](https://codeclimate.com/github/yandex-ui/noscript-view-edefine)
[![Test Coverage](https://codeclimate.com/github/yandex-ui/noscript-view-edefine/badges/coverage.svg)](https://codeclimate.com/github/yandex-ui/noscript-view-edefine/coverage)

Плагин для noscript, улучшающий наследование View.
Доблавляет новые возможности:
 * множественное наследование (через миксины)
 * наследование деклараций событий
 * наследование деклараций моделей
 * сохранение цепочки вызова конструкторов
 * сохранение цепочки вызова колбеков событий и событий моделей

## Множественное наследование
```js
ns.View.edefine('my-child', {
}, 'myMixinView1', 'myMixinView2', 'myParentView');
```

Либо указание миксинов в свойстве `mixins`.
```js
ns.View.edefine('my-child', {
    mixins: [ 'myMixinView1' ]
}, 'myMixinView2', 'myParentView');
```

Т.к. в JavaScript нельзя реализовать множественное наследование, не изменив цепочку прототипов родителей,
то наследование реализовано следующий образом:
 * миксинами являются все виды, объявленные в свойстве `mixins` и виды, переданные в аргументы, кроме последнего
 * последний вид в аргументах является предком
 * методы миксинов микшируются в прототип наследника
 * предок становится родителем в прототип
 * события, модели и конструкторы объединяются в потомке со всех миксинов и предка

## Наследование деклараций событий

Все событий из декларации `events` у `parent` и миксинов будут переданы в декларацию `child`.
```js
ns.View.define('parent', {
    events: {
        'event': 'callback-parent',
        'event1': 'callback-parent1'
    }
});

ns.View.define('mixin1', {
    events: {
        'event': 'callback-mixin1'
    }
});

ns.View.define('mixin2', {
    events: {
        'event': 'callback-mixin2'
    }
});

ns.View.edefine('child', {
    mixins: [ 'mixin1' ],
    events: {
        'event': 'callback-child'
    }
}, 'mixin2', 'parent');
```

В результате декларация событий `child` будет иметь вид:
```js
events: {
    'event': function wrapper() { /* ... */ },
    'event1': 'callback-parent1'
}
```

Колбеки на одинаковое событие будут объединены в один метод.

## Наследование деклараций моделей

Модели, объявленные в миксинах и предке, будут перенесены в вид потомка.
Наследование подписок на события модели выполняется по правилам наследования событий.

При объединении подписок на события модели, в случае явного противоречия колбеков, будет брошено исключение.

```js
ns.View.define('mixin', {
    models: {
        model: { 'ns-model-changed': true }
    }
});

ns.View.edefine('child', {
    models: {
        model: { 'ns-model-changed': false }
    },
    mixins: [ 'mixin' ]
});
```


## Цепочка вызовов

Последовательность вызовов конструкторов и колбеков на одинаковое событие общая - всегда от предка через миксины к потомку:
```
... ->
callback-parent-mixinN ->
callback-parent ->
callback-child-mixin1 ->
... ->
callback-child-mixinN ->
callback-child
```

Вначале вызываются колбеки миксинов, объявленных в свойстве `mixins`, а потом миксины в аргументах.
Вызов выполняется в порядке перечисления.
