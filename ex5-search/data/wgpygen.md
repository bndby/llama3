# Wgpygen

!!!danger "Внимание"

    После генерации вьюшек созданные файлы нужно закомиттить, потому что CI TeamCity запрещено создавать новые файлы

## Описание:

Проект для генерации констант и DAAPI Meta классов на основе yaml файлов, генерации констант ресурсов, локализаций, атласов, пакетов классов.

**Запуск**:

`wgpygen.py [-rules] [--root-dir] [-–verbose] [–-debug] [--tags –-tags ..]`

-   -`rules` – правило или шаблон правил. По умолчанию ['rules/*.json']
-   `--root-dir` – относительный путь к корню бранча. Значение по умолчанию: `../../../../../../../`
-   `-–verbose` – печатает имена генерируемых файлов
-   `--debug` – печатает отладочную информацию
-   `--tags` – устанавливает специальные теги для фильтрации правил (ex: `--tags debug` `--tags release`)

## Структура проекта:

![Структура проекта](wgpygen-1.png)

1. `wgpygen.py` – точка входа
2. `overrides` – пакет для оверрайдов генерации. Расширение файлов \*.override
3. `rules` – пакет с правилами генерациями в формате json.
4. `templates` – пакет с шаблонами генерации. Расширение файлов \*.template
5. `utils` – пакет с модулями помогающими в парсинге файлов: as, po, xml, yaml
6. `wgpygen` – пакет содержащий основную логику работы, providers, tuners, producers

## Правила

Правила хранятся в json файлах `./rules/`

Каждый такой файл группирует набор правил. Например, для генерации констант в AS3 код используется `as_gen_consts.json`. Как можно заметить, приставка as* или py* указывает для кого будет происходить генерация. Хотя в некоторых случаях генерация может проходить сразу в два проекта. Например, правило `as_meta.json`

**Структура правила, пример as_res_po.json**:

```json
[
    {
        "from": [
            {
                "type": "res_provider",
                "config": {
                    "name": "po_files",

                    "search_dir": "{root_dir}/game/res/wot/text",
                    "relative_dir": "{root_dir}/game/res/wot/",
                    "include": ["*.po"]
                }
            }
        ],
        "tune_with": [
            {
                "type": "skip_override_tuner",
                "config": {
                    "filter_type": "fn_filter",
                    "override_files": [
                        "overrides/res/{name}.override",
                        "overrides/res/{name}.as.override"
                    ]
                }
            },
            {
                "type": "enum_override_tuner",
                "config": {
                    "filter_type": "fn_filter",
                    "override_files": [
                        "overrides/res/{name}.override",
                        "overrides/res/{name}.as.override"
                    ]
                }
            },
            {
                "type": "base_override_tuner",
                "config": {
                    "filter_type": "fn_filter",
                    "override_files": [
                        "overrides/res/{name}.override",
                        "overrides/res/{name}.as.override"
                    ]
                }
            }
        ],
        "to": [
            {
                "type": "template_producer",
                "config": {
                    "template_file": "templates/res.as.template",
                    "filename": "{name!u}.as",
                    "output_dir": "{root_dir}/scaleform/as3/common_i18n_library/src/main/as3"
                }
            }
        ]
    }
]
```

**Основные блоки правила**:

-   `config` – содержит настройки правила:

    -   `index` – используется для сортировки порядка выполнения правил. Если значение не указано, то `index == 0`. Чем больше значение, тем позже отработает правило. Например, необходимо чтобы сперва выполнилось правило по генерации Meta классов, и только потом правило собирающие импорты модулей проекта, т.е. чтобы сгенерированные Meta классы вошли в сборку проекта.

    -   `tags` – содержит список тэгов, которые могут использоваться с переменными запуска `wgpygen --tags debug --tags release`. Например, при запуске проекта в release режиме правила, имеющие tag debug будут исключены из списка генерации.

-   `from` – секция, в которой описываются условия, кем, откуда и как забирать исходники для правила. Связана с конкретным provider.

    -   `type` – указывает на тип/класс provider, с помощью которого будет производиться вычитка исходников генерации. Провайдеры могут быть:

        -   `default_provider` – ничего не дает;

        -   ` i18n_provider` – извлекает msgids из файлов po;

        -   `res_provider` – собирает имена файлов во время перемещения по каталогам;

        -   `yaml_provider` – извлекает пары ключ-значение из yaml-файлов;

        -   `atlas_provider` – извлекает названия элементов из атласов xml;

        -   `meta_provider` – захватывает yaml-файлы со структурой DAAPI;

        -   `package_provider` – собирает \*.as структуру во время прохода по каталогам.

    -   `config` – настройки провайдера. Содержит:

        -   `name` – имя, которое в дальнейшем может использоваться для именования output файла

        -   `search_dir` – каталог поиска исходников

        -   `relative_dir` – может использоваться для генерации путей в константах. Например, для констант с путями к картинкам.

        -   `include` – может содержать список путей по которым провайдеру нужно собрать исходные данные

        -   `exclude` – может содержать список путей которые провайдеру следует пропустить

-   `tune_with` – секция содержащая настройки для определённого tuner, с помощью которого, данные полученные от provider, будут обработаны.

    -   `type` – указывает на тип/класс tuner, с помощью которого будет производиться обработка данных.

        -   `default_tuner` – ничего не делает;

        -   `skip_override_tuner` – пропускает атрибуты, используя механизм переопределения;

        -   `base_override_tuner` – добавляет атрибуты, используя механизм переопределения;

        -   `enum_override_tuner` – добавляет методы, используя механизм переопределения.

    -   `config` – содержит настройки для tuner

        -   `filter_typ`e – название фильтра из текущего tuner

        -   `override_files` – список файлов с оверрайдами используемый в конкретном tuner (если оверрайды нужны только для python то в названии файла используется потфикс .py, если только для AS3 - постфикс .as, для python и AS3 в названии постфикс не используется. Например `item_types.py.override`, `item_types.as.override`, `item_types.override`)

-   `to` – секция содержащая настройки producer

    -   `type` – указывает на тип/класс producer, с помощью происходит запись в файлы по определённым путям

        -   `default_tuner` – ничего не делает;

        -   `template_producer.py` – генерирует файл используя шаблон.

    -   `config` – содержит настройки для producer

        -   `template_file` – имя шаблона

        -   `filename` – строка-шаблон для генерации имен файлов

        -   `output_dir` – директория, куда будут сгенерированы файлы

## Оверрайды

Файлы с оверрайдами лежат в `./overrides/`. Здесь же они разбиты по пакетам, в зависимости от предназначения.

Пакеты:

-   `/atlas`

-   `/gen_consts`

-   `/i18n`

-   `/res`

Если оверрайды нужны только для python то в названии файла используется потфикс .py, если только для AS3 — постфикс .as, для python и AS3 — в названии постфикс не используется.

Например `item_types.py.override`, `item_types.as.override`, `item_types.override`

Пример:

```actionscript
[enum]
tankCaruselTooltip/vehicleType/normal/*
tankCaruselTooltip/vehicleType/elite/*
level/*
vehicleParams/bonus/extra/*
vehiclePreview/buyButton/*/{part}
tank_params/avgParamComment/* = getAvgParameterCommentKey
skills/{skill_name}/header = skillTooltipHeader
skills/{skill}/descr = skillTooltipDescr
skills/forRole/{role} = roleForSkill
elen/excel/addParam/*/*/body
elen/excel/infoParam/wins/*/body

[base]
battleResults/FortResource/resultsShareBtn
privateQuests/awardsButton
privateQuests/backButton

[skip]
disconnect/codes*
shop/header/*
```

-   `[enum]` – используется для генерации get методов используя переменную в качестве дополнения к ключу.

Например:

-   `level/*` – генерация метода, который будет возвращать конкретную константу, при склеивании переданного ключа и его подстановки в \*
-   `skills/{skill_name}/header = skillTooltipHeader` – генерация метода `skillTooltipHeader`, который будет возвращать константу, при склеивании переданного ключа и блока `skills_VARIABLE_header`, `skill_name` - переменная в методе `skillTooltipHeader`
-   `vehiclePreview/buyButton/*/{part}` - генерация метода с подстановкой двух ключей

[skip] – секция, указывающая какие ключи необходимо пропустить

[base] – секция для генерации порезанного ключа, до указанного значения

## Шаблоны

Шаблоны – используются как исходники, для подстановки данных в плейсхолдеры и создания сгенерированных файлов. Пример `gen_consts.as.template`:

```actionscript
package net.wg.data.constants.generated {
   /**
    * This file was generated using the wgpygen.
    * Please, don't edit this file manually.
   */

   public class {{name|upper}} {
      {% for attr in attributes %}
      public static const {{attr.name}} : {{attr.atype|typeof}} = {{attr|literal}};
      {% end %}
      public function {{name|upper}}() {
         super();
      }
   }
}
```

Подробнее о создании новых шаблонов см. [Template Designer Documentation](https://jinja.palletsprojects.com/en/2.10.x/templates/).

**Плейсхолдеры шаблонов**:

-   `{{name|upper}}` – подстановка переменной name и применение к значению метода upper

-   `{{attr.name|camel2snake|token|upper}}` – подстановка значения переменной name из переменной `attr` и применение к значению методов по порядку `camel2snake`, `token`, `upper`

-   `{% for attr in attributes %}` – описание цикла `for`

-   `{% if not py_methods %}`
-   `{% if py_methods %}`
-   `{% elif param.flags.is_vector %}` – описание конструкции `if`, может содержать ключевое слово `not`

-   `{% else %}` – описание конструкции `else`

-   `{% end %}` – закрытие цикла `for` либо `if`

## Алгоритм работы

1. Вычитка аргументов запуска

2. Сборка всех файлов с правилами

3. Вычитка правил

4. Сортировка

5. Создание структур, как класс `RuleProcessor` c `Provider`, `Tuner`, `Producer`

6. Последовательный запуск каждого правила и получение продуктов генерации:

    1. `p.gather()`

    2. `tuner.apply(entry)`

    3. `producer.create(entry)`

7. Запись результата `product.content` в файл

## Методы, передаваемые в шаблон, для применения на значениях плейсхолдеров.

Методы хранятся в `helpers.py`. В зависимости от типа генерируемого файла, следуя из названия правила `py` или `as`, `helper` может содержать разную реализацию приведённых ниже методов:

\_HELPERS_MAPPING = {  
'.**py**': PythonHelper,  
'.**as**': ActionScriptHelper  
}

| Имя плейсхолдера                                                                             | Static метод                                              | Описание                                                                               | Пример                                                                          |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `upper`                                                                                      | `upper`                                                   | Применяет верхний регистр к значению.                                                  | _Text -> TEXT_                                                                  |
| `argsfull`                                                                                   | `argsfull`                                                | Соединяет параметры, добавляя информацию о типе, как в вызове функции ActionScript.    | _[a, b, c] -> "a : String, b: String, c : String = 'some def value' "_          |
| `arguments`                                                                                  | `arguments`                                               | Соединяет параметры, добавляя информацию о типе, как в вызове функции ActionScript.    | _[param, param, param] -> "String, int, uint"_                                  |
| `argtypes`                                                                                   | `argtypes`                                                | Соединяет типы параметров.                                                             | _[a, b, c] -> "a : String, b: String, c : BaseDAAPIModule = 'some def value' "_ |
| `arghardtypes`                                                                               | `arghardtypes`                                            | Присоединяет параметры, добавляя информацию о типе, как в вызове функции ActionScript. | _[a, b, c] -> "a, b=False, c"_                                                  |
| `arghardtypesfull`                                                                           | `arghardtypesfull`                                        | Присоединяет параметры, добавляя информацию о типе, как в вызове функции ActionScript. | _[param, param, param] -> "bool, typing.List, float"_                           |
| `typetohints_astopy`                                                                         | `typetohints_astopy`                                      | Получает ассоциативный atype params, который передает из as в python.                  |
| использовать только в комментариях к Мета-файлам python `[meta_implementation.py.template]`. | _[param, param, param] -> "bool, typing.List, float"_     |
| `typetohints_pytoas`                                                                         | `typetohints_pytoas`                                      | Получение ассоциативного atype параметров, которые передаются из as в python.          |
| использовать только в комментариях к Мета-файлам python `[meta_implementation.py.template]`. | _[param, param, param] -> "bool, typing.Iterable, float"_ |
| `argnames`                                                                                   | `argnames`                                                | Соединяет типы параметров.                                                             | _[param, param, param] -> "a, b, c"_                                            |
| `literal`                                                                                    | `literal`                                                 | Оборачивает значение в строку                                                          | _value -> ‘value’_                                                              |
| `token`                                                                                      | `token`                                                   | Пытается сделать из значения токен.                                                    |                                                                                 |
| `typeof`                                                                                     | `typeof`                                                  | Получает тип атрибута.                                                                 |                                                                                 |
| `fmt`                                                                                        | `fmt`                                                     | Создает строку формата ActionScript из перечисления.                                   | _"one/\*/three" -> "one/" + key + "/three"_                                     |
| `stripext`                                                                                   | `stripext`                                                | Отделяет расширение от значения.                                                       | _"whatsup.png" -> 'whatsup'_                                                    |
| `unixpath`                                                                                   | `unixpath`                                                | Создает unix-подобный путь (с прямыми косыми чертами) из пути windows.                 | _"why\\windows\\why" -> "why/windows/why"_                                      |
| `tail`                                                                                       | `tail`                                                    | Получает последнюю часть значений, разделенных запятыми.                               | _"a.b.c" -> "c"_                                                                |
| `cap`                                                                                        | `cap`                                                     | Записывает первую букву слова с заглавной буквы.                                       | _"hello" -> "Hello"_                                                            |
| `decap`                                                                                      | `decap`                                                   | Записывает первую букву слова с строчной буквы.                                        | _"Hello" -> "hello"_                                                            |
| `unscore`                                                                                    | `unscore`                                                 | Удаляет подчеркивание из начала слова.                                                 | _"\_tank" -> "tank"_                                                            |
| `camel2snake`                                                                                | `camel2snake`                                             | Добавляет нижнее подчеркивание между разными регистрами                                | _"battleAtlas" -> "battle\_Atlas" \| BATTLEatlas -> BATTLE\_atlas_                |

## Ссылки

[https://confluence.wargaming.net/pages/viewpage.action?spaceKey=DEV&title=Wgpygen](https://confluence.wargaming.net/pages/viewpage.action?spaceKey=DEV&title=Wgpygen)
