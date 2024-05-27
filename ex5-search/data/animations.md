# SWF-анимации

## Добавление swf-анимаций в проект

Анимации в формате .swf должны находиться в директории

```
\game\res\wot\gui\flash\animations\
```

Таким образом, они становятся доступны для использования через [UI framework public API resource management system](r.md).

## Загрузка swf-анимаций в UI

Добавленные swf-анимации можно встраивать через html-вёрстку через тег `<img>`

```js
<img
    id="swfImg"
    src="swf://gui/gameface/src/development/views/PropsSupportDemo/test.swf?name=testSwf"
    alt="testSwf"
/>
```

В атрибут `src` необходимо передавать ссылку на swf-файл. Это можно сделать передав путь строковым параметром или же через R класс.

В конце строки через `?name` дополнительной переменной указывается имя swf-анимации, которое будет доступно в дальнейшем для управления воспроизведением.

## Управление воспроизведением swf-анимаций

Для управления анимациями доступен глобальный объект `swfPlayer`.

Список методов `swfPlayer` во многом схож с теми, которые были представлены в Adobe Flash Player'е. Это методы `play`, `stop`, `gotoAndStop`, `gotoAndPlay`, и недокументированный метод `addFrameScript`. Ознакомиться с сигнатурой этих методов можно в документации от Adobe.

Отличительной особенностью является то, что в качестве первого параметра необходимо передавать имя swf-анимации.

Пример проигрывание тестовой анимации с 5 кадра:

```js
window.swfPlayer.gotoAndPlay('divineGlowSwf', 5);
```

Также для удобства использования в качестве особенности интеграции добавлены дополнительные методы `gotoAndStopLabel`, `gotoAndPlayLabel`, `restart`, `setBackgroundAlpha`, `removeFrameScript`.

## Демо страница swf-анимаций

На данный момент в клиент встроена демо-страница `PropsSupportDemo.html` с примером использования swf-анимаций, которая расположена в

```
game\res\wot\gui\gameface\src\development\views\
```

Наглядный пример практической реализации анимации в клиенте можно посмотреть в клиенте версии 1.9.1, в экране получения нового прогрессионного элемента кастомизации танка

```
\game\res\wot\gui\gameface\src\views\lobby\customization\progressive_items_reward\ProgressiveItemsUpgradeView\components\ProgressiveItemRewardAnimation
```
