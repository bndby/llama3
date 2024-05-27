# IGB

## Основы

Общие примеры использования in-game-browser с gameface находятся здесь:

-   Представитель: `game\res\wot\scripts\client\gui\development\ui\demo\gf_igb_demo.py`
-   UI: `game\res\wot\gui\gameface\src\development\views\igb_demo`

IGB в Gameface - это как правило представление wulf.

## Реализация

Существует два основных способа использования IGB с Gameface:

-   Браузер как вложенное представление wulf. Смотрите примеры в `gf_igb_demo.py`, упомянутом ранее (найдите `setChildView` в коде). Вложенное представление используется для внедрения браузера в другое представление.
-   Браузер как отдельное представление. Общие примеры:
    -   тестовая страница client-2-web(c2w) (см. `game\res\wot\scripts\client\gui\development\dev_web_client_api.py`)
    -   полноэкранное демонстрационное окно (см. `_IgbFullscreenWindow` в `gf_igb_demo.py`)

Существующие модели браузеров:

-   `browser_model` (`game\bin\tools\wgpygen\configs\definitions\common\browser.yaml`). Смотрите общую реализацию в `game\res\wot\scripts\client\gui\impl\common\browser.py`
-   `browser_view_model` (`game\bin\tools\wgpygen\configs\definitions\common\browser_view.yaml`). По сравнению с `browser_model`, содержит функциональность закрытия окна: свойство `sClosable` и команду `onClose`. Смотрите общую реализацию в `game\res\wot\scripts\client\gui\impl\lobby\common\browser_view.py`

Browser и BrowserView имеют тот же интерфейс, что и actionscript(Scaleform) impmelenetations Browser

## Предзагрузка

Это специальная функция, которая помогает предварительно загрузить экземпляр браузера перед его созданием на стороне пользовательского интерфейса. Таким образом, cpp\python часть браузера будет готова на ранней стадии и не будет потреблять производительность во время выполнения. Для этого просто используйте параметр ctor браузера.

Используйте `View.setChildView` без `ChildFlags.AUTO_DESTROY` для предотвращения уничтожения экземпляра браузера после удаления из дочерних представлений. Это полезно для предотвращения часто повторяющегося создания/уничтожения экземпляра браузера во время жизни родительского представления (Просто изображение страницы с вкладками, где одна из вкладок является браузером).

## Использование

В большинстве случаев достаточно использовать `Browser` или `BrowserView`. Но можно расширить реализацию с помощью собственной дополнительной функциональности. На стороне представителя (python) лучшим способом является наследование вашего представления от `Browser` или `BrowserView` и добавление вашей дополнительной функциональности. Смотрите пример в `_BrowserWithControls` в `gf_igb_demo.py`.

На стороне пользовательского интерфейса распространенным способом является использование компонента `BrowserSubmoduleWidget` (`game\res\wot\gui\gameface\src\components\BrowserView\Submodule\BrowserSubmoduleWidget.tsx`). Он используется в большинстве случаев реализации IGB.

Также посмотрите на `WidthCloseWidget` (`game\res\wot\gui\gameface\src\components\BrowserView\WidthCloseWidget\WidthCloseWidget.tsx`). Он используется для реализации модели `browser_view`.

## Ссылки

-   [https://confluence.wargaming.net/display/DEV/IGB+with+Gameface](https://confluence.wargaming.net/display/DEV/IGB+with+Gameface)
