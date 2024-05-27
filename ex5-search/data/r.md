# Система управления ресурсами

## Обзор

Система управления ресурсами предоставляет API для доступа к ресурсам пользовательского интерфейса, доступным в системе. Поддерживаются следующие типы ресурсов:

-   Animations - определяет путь к swf-файлу, содержащему анимацию;
-   Areas - определяет набор настроек логической области, которая используется для позиционирования окна;
-   Dynamic ID - определяет динамический уникальный идентификатор, который может быть использован в любом месте пользовательского интерфейса;
-   Entry - определяет набор настроек, которые используются в главном окне;
-   Atlas / Image - определяет графику с растровым изображением (включая поддержку атласов);
-   Sound - определяет звук пользовательского интерфейса, который может быть связан с действием пользовательского интерфейса;
-   String - определяет текстовую строку для приложения с опциональным форматированием;
-   Style - определяет набор свойств компонентов пользовательского интерфейса (специфично для Unbound);
-   View - определяет архитектуру пользовательского интерфейса в виде;
-   Video - определяет путь к видеофайлу.

На уровне представления работа с ресурсами осуществляется через класс `R`. Класс `R` автоматически генерируется инструментом [wgpygen](wgpygen.md) и представляет собой дерево ресурсов, каждый лист которого содержит `GUID` ресурса. `ViewModel` поддерживает тип свойства `Resource`, которое может быть установлено в идентификатор ресурса. Обратите внимание, что на уровне представления нет разницы между различными видами ресурсов. Любой ресурс может быть применен путем обращения к его `GUID`.

## Класс `R`

Класс `R` предоставляет доступ к `GUID` всех ресурсов пользовательского интерфейса. Для каждого типа ресурсов существует свой подкласс `R`:

-   `R.invalid` - недействительный ресурс, содержащий 0 в качестве идентификатора ресурса;
-   `R.animations` - корень ресурсов типа Image, упакованных в атласы;
-   `R.areas` - корень всех ресурсов типа Area;
-   `R.atlases` - корень всех ресурсов типа Atlas;
-   `R.dynamic_ids` - корень всех ресурсов типа Dynamic ID;
-   `R.entries` - корень всех ресурсов типа Entry;
-   `R.images` - корень ресурсов типа Image;
-   `R.sound` - корень ресурсов типа Sound;
-   `R.strings` - корень ресурсов типа String;
-   `R.styles` - корень ресурсов типа Style;
-   `R.views` - корень всех ресурсов типа View;
-   `R.videos` - корень всех ресурсов типа Video.

Каждый из этих подклассов имеет иерархическую структуру (внутренние подклассы), которая соответствует иерархии папок ресурсов на жестком диске. Узлы (внутренние подклассы) связаны с соответствующими папками, а их листья - с файлами ресурсов (`*.png`, `*unbound` и т. д.). Любой лист содержит объект класса `DynAccessor`, который можно вызвать для получения `ID` соответствующего ресурсного файла.

Класс `R` доступен как из уровня представления (Python-код), так и из файла разметки (вы можете видеть, что доступ к классу `R` унифицирован для разметки как на Unbound, так и на Gameface):

```js
<TextButton
    caption={'BACK'}
    type={'back'}
    goto={R.strings.menu.viewHeader.backBtn.descrLabel.hangar()}
/>
```

## `R.animations`

Представляют файлы `swf`, содержащие анимацию.

Собраны из (имена файлов):

```
game/res/wot/gui/flash/animations/**/*.swf
```

Отражение в R:

```
R.animations.{directory}.{swf_file}
```

Пример:

Если вы хотите сослаться, скажем, на анимацию `game/res/wot/gui/flash/animations/rewards/conversion.swf`, вам нужно сделать это следующим образом:

```
R.animations.rewards.conversion()
```

## R.areas

Представляют собой `yaml` файлы, содержащие набор настроек, используемых для позиционирования окна (файл `game/bin/tools/wgpygen/configs/areas/README` описывает все доступные настройки области).

Собраны из (имена файлов):

```
game/bin/tools/wgpygen/configs/areas/*.yaml.
```

Отражение в `R`:

```
R.areas.{yaml_file}.
```

Пример:

Если вы хотите сослаться, скажем, на область

```
game/bin/tools/wgpygen/configs/areas/default.yaml
```

Вам нужно сделать это следующим образом:

```
R.areas.default()
```

## R.atlases

Представляют собой `xml` файлы, содержащие информацию о регионе для каждой текстуры в атласе (`png` файл с тем же именем).

Собраны из (имена файлов):

```
game/res/wot/gui/flash/atlases/*.xml
```

Отражение в `R`:

```
R.atlases.{atlas_file}.{sub_texture}
```

Пример:

Если вы хотите сослаться, скажем, на текстуру в атласе (`asset_pipeline` конвертирует `png` файлы в `dds`)

```
game/wot/res/gui/flash/atlases/components.png?name=alertIcon&x=9&y=100&width=16&height=16
```

Вам нужно сделать это следующим образом:

```
R.atlases.components.alertIcon()
```

## R.dynamic_ids

Представляют собой динамические уникальные идентификаторы, которые генерируются и могут использоваться в любом месте пользовательского интерфейса.

Собирается из (любой вход `R.dymanic_ids` в разметке):

```
game/res/wot/gui/unbound/*.unbound;
```

Отражение в `R`:

```
R.dynamic_ids.{path_part}
```

Пример:

Если вы хотите сослаться, скажем, на динамический идентификатор

```
(view_holder
    (name = "R.dynamic_ids.demo_window.image_props()")
    (style
        (height = 100%)
    )
)
```

Вам нужно сделать это следующим образом:

```python
class DemoWindowContent(ViewImpl):
    ...

    def _initialize(self, *args, **kwargs):
        super(DemoWindowContent, self)._initialize(*args, **kwargs).
        ...
        self.setChildView(
            R.dynamic_ids.demo_window.image_props(), ImagePropsView(self.viewModel.imageProps))
```

## R.entries

Представленные `yaml` файлы содержат набор настроек, используемых для главного окна (файл `game/bin/tools/wgpygen/configs/entries/README` описывает все доступные настройки входа).

Собраны из (имена файлов):

```
game/bin/tools/wgpygen/configs/entries/*.yaml
```

Отражение в `R`:

```
R.entries.{yaml_file}
```

Пример:

Если вы хотите сослаться, скажем, на запись

```
game/bin/tools/wgpygen/configs/entries/lobby.yaml
```

вам нужно сделать это следующим образом:

```
R.entries.lobby()
```

## R.images

Файлы изображений (`png`) содержат ассеты пользовательского интерфейса.

Собраны из (имена файлов, которые включены в `all_images_fs_provider`, см. `game/bin/tools/wgpygen/rules/common/providers.yaml`):

```
game/res/wot/gui/maps/**/*.png
```

Отражение в `R`:

```
R.images.{path}.{to}.{image}
```

Пример:

Если вы хотите сослаться, скажем, на изображение

```
game/res/wot/gui/maps/icons/awards/victory.png
```

вам нужно сделать это следующим образом:

```
R.images.gui.maps.icons.awards.victory()
```

## R.sounds

Представляют собой звуки из банков звуков.

Собранные файлы (раздел `SoundBanks` в `xml`):

```
game/res/wot/audioww/SoundbanksInfo.xml
```

только `gui.bnkSoundBank`.

Отражение в `R`:

```
R.sounds.{sound_bank}.{sound_name}
```

-   [Работа со звуков в Gameface](audio.md)

## R.strings

Представляют собой `msgids` из `*.po` файлов и необработанные строки.

Собраны из (`msgids` внутри файлов `po`):

```
game/res/wot/text/*.po
```

Отражение в `R`:

```
R.strings.{po_file}.{msgid_part}.{...}.{msgid_part}
```

Где `msgid_part` берутся из `*.po` файлов и разделяются слэшами, например:

```
#wuf_example:props/title → R.strings.wuf_example.props.title
```

Пример:

Существует три способа передачи строки в представление.

Вы можете передать `ResGUID` с помощью Python `ViewModel`:

```python
with self.viewModel.transaction() as tx:
    tx.pageText.setLabel(R.strings.wuf_example.content.pager())
```

Вы можете передать необработанную строку, используя Python `ViewModel`:

```python
with self.viewModel.transaction() as tx:
    tx.imageProps.setLabel('Preview')
```

Вы можете задать `ResGUID` непосредственно в разметке:

```js
<TextButton
    caption={'BACK'}
    type={'back'}
    goto={R.strings.menu.viewHeader.backBtn.descrLabel.hangar()}
/>
```

### Форматирование Unbound

Разметка Unbound поддерживает форматирование строк с помощью [fmtlib/fmt](https://github.com/fmtlib/fmt). Например, вы можете определить такую строку в файле `*.po`:

```
msgid "content/pager"
msgstr "{current}/{total}"
```

А затем заполнить ее фактическими данными с помощью библиотеки, ссылки на которую приведены выше:

```
(tf
    (class $CreditsTextStyle)
    (bind htmlText "TextFormat(R.strings.wuf_example.content.pager(), {current:current, total:total})")
)
```

Для получения более подробной информации смотрите документацию fmt.

### Форматирование в Gameface

Разметка Gameface поддерживает форматирование строк с помощью javascript `String.prototype.replace(regexp, function)`. Подробности смотрите в `game/res/wot/gui/gameface/src/lib/string-utils.js`.

!!!warning ""

    Не форматируйте строки на стороне Python, за это отвечает представление!

### Интернационализация и поддержка локализации

Для целей i18n мы используем библиотеку [GNU gettext](https://www.gnu.org/software/gettext/), в частности, [библиотеку от команды WoWS](https://github.com/wg-lesta/gettext).

На данный момент наш клиент поддерживает только один язык, название которого жестко закодировано и является текстовым, поэтому все `*.po` файлы хранятся в директории `game/res/wot/text`.

По историческим причинам мы используем минимум возможностей gettext, все, что мы делаем, это указываем msgid'ы и msgstr'ы:

```
# Пример Wulf
msgid "content/pager"
msgstr "{current}/{total}"

msgid "props/title"
msgstr "Свойства:"
```

!!!danger ""

    Всегда оставляйте пробел после `#`, поскольку в противном случае он будет рассматриваться как специальная управляющая последовательность и может быть неприемлем для некоторых строгих парсеров:

    ```
    white-space
    # translator-comments
    #. извлеченные комментарии
    #: ссылка...
    #, флаг...
    #| msgid previous-untranslated-string
    msgid untranslated-string
    msgstr translated-string
    ```

## R.styles

Представляет набор свойств компонента пользовательского интерфейса в разметке.

Собран из (def css внутри несвязанных файлов):

```
game/res/wot/gui/unbound/styles/*.unbound.
```

Отражение в `R`:

```
R.styles.{style_name}
```

## R.views

Представляют собой точки входа в интерфейс, т. е. представления, которые могут быть запрошены бизнес-логикой для загрузки.

Собираются из (имена файлов):

все элементы должны иметь атрибут "entry = true":

```
game/res/wot/gui/unbound/*.unbound;
```

каталог, в котором есть один html-файл с таким же именем:

```
game/res/wot/gui/gameface/_dist/**/*.html
```

Отражение в `R`:

```
R.views.{view_name}
```

Пример:

Для того чтобы сослаться на `id` `demoView`, нужно сделать это следующим образом: `R.views.demoView`:

```
R.views.demoView()
```

## R.videos

Представляют файлы с видео

Собрано из:

```
game/res/wot/gui/flash/video/*.usm
```

Отражение в `R`:

```
R.videos.{path}.{to}.{video}
```

Пример:

Если вы хотите сослаться, скажем, на изображение

```
game/res/wot/gui/flash/video/vehicle/A122_TS_5.usm
```

вам нужно сделать это следующим образом:

```
R.videos.vehicle.A122_TS_5()
```

-   [Работа с видео в Gameface](video.md)
