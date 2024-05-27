# Plural формы

## Множественые формы в GNU gettext utilities.

При работе с локализациями приходится стыкаться с проблемами формирования и вывода локализаций текстов на разных языках от их форм множественного числа. То есть если вывод локализации содержит какой ни будь числитель, то при выводе такого текста приходилось избегать зависимостей от этих языковых форм множественного числа методом сокращения слова или переформулировкай локализационого текста, например. вывод сообщения

```
Премиум аккаунт куплен на %(period)d д.
```

сводился к тому, что нельзя было просто написать день/дня/дней, так как это значение зависело от:

1. переданного аргумента
2. для переводов на другие языки, это выражение содержало бы и разные количества форм, например для английского языка это было бы day/days.

Поскольку проект WoT использует gettext utilities для работы с локализациями, а в нем есть функционал работы с множественными формами локализаций, то была поставлена задача на поддержку этого функционала для ресурсной системы.

Более детально про возможности поддержки plural forms в указанной утилите можно прочитать в

- https://www.gnu.org/software/gettext/manual/html_node/Plural-forms.html
- https://www.gnu.org/software/gettext/manual/html_node/Translating-plural-forms.html#Translating-plural-forms

Для работы с plural forms используется функции `ngettext`, `dngettext` и `dcngettext` (https://linux.die.net/man/3/dngettext).

## Подготовка po файла

Для того что бы подготовить po файл для использования plural forms, необходимо:

**Определить язык и его plural формулу, например:**

| Code | Lang      | Formula                                                                                                |
| ---- | --------- | ------------------------------------------------------------------------------------------------------ |
| en   | English   | nplurals=2; plural=(n != 1);                                                                           |
| ru   | Russian   | nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 \| n%100>=20) ? 1 : 2); |
| uk   | Ukrainian | nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 \| n%100>=20) ? 1 : 2); |
| pl   | Polish    | nplurals=3; plural=(n==1 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 \| n%100>=20) ? 1 : 2);                 |

Источник: http://docs.translatehouse.org/projects/localization-guide/en/latest/l10n/pluralforms.html (возможно это не самые актуальные формулы)

Обратите внимание, что nplurals указывает количество изменяемых форм, а формула обязательно должна иметь вывод всего количества, тоесть для случая `nplurals=3` формула должна выводить `/0, 1, 2/`

**В шапку po файла вписать формулу для конкретного языка (формула будет использоватся как дефолтная, для технических .po):**

```po title="RU"
"Project-Id-Version: World Of Tanks\n"
"Report-Msgid-Bugs-To: \n"
"POT-Creation-Date: 2010-06-01 10:00+0300\n"
"PO-Revision-Date: 2010-06-10 19:30+0200\n"
"Last-Translator: i_maliavko <i_maliavko@wargaming.net>\n"
"Language-Team: WoT Team <noreply@wargaming.net>\n"
"MIME-Version: 1.0\n"
"Content-Type: text/plain; charset=utf-8\n"
"Content-Transfer-Encoding: 8bit\n"
"Plural-Forms: nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);\n"
```

```po title="EN"
"Project-Id-Version: World Of Tanks\n"
"Report-Msgid-Bugs-To: \n"
"POT-Creation-Date: 2010-06-01 10:00+0300\n"
"PO-Revision-Date: 2010-06-10 19:30+0200\n"
"Last-Translator: i_maliavko <i_maliavko@wargaming.net>\n"
"Language-Team: WoT Team <noreply@wargaming.net>\n"
"MIME-Version: 1.0\n"
"Content-Type: text/plain; charset=utf-8\n"
"Content-Transfer-Encoding: 8bit\n"
"Plural-Forms: nplurals=2; plural=(n != 1);\n"
```

**Создать необходимый набор переводов для ключа:**

```po title="RU"
msgid "premium/buying/success"
msgid_plural "plural/premium/buying/success"
msgstr[0] "Премиум аккаунт куплен на %(period)d день. Потрачено %(money)s."
msgstr[1] "Премиум аккаунт куплен на %(period)d дня. Потрачено %(money)s."
msgstr[2] "Премиум аккаунт куплен на %(period)d дней. Потрачено %(money)s."
```

```po title="EN"
msgid "premium/buying/success"
msgid_plural "plural/premium/buying/success"
msgstr[0] "Premium Account is purchased for %(period)d day. %(money)s spent."
msgstr[1] "Premium Account is purchased for %(period)d days. %(money)s spent."
```

**Важно! Cогласно правил добавления множественых форм и работы с ними для локализаторов в SLP, так же необходимо в .po файл, в котором будет множественная форма, вставить ключ:**

```po
# Служебная entry для подставноки тулой slp выражения из msgstr в поле Plurals-Forms.
msgid "#PluralForms"
msgstr "nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);"
```

который позволит локализаторам прописывать необходимую формулу для конкретного языка локализации. Если ключ уже существует, то вставлять ничего не надо.

Документы: [Plural forms in PO/POT files](https://confluence.wargaming.net/pages/viewpage.action?pageId=598389409), [WGCP Localization plural forms#.POfiles](https://confluence.wargaming.net/display/WEBDEV/WGCP+Localization+plural+forms#WGCPLocalizationpluralforms-.POfiles)

Важно! количество msgstr массива должно совпадать с значением nplurals=3, иначе для отсутствующих значений будет выводится дефолтное состояние ключа, то есть msgstr[0].

Ключевым идентификатором по прежнему остается msgid, идентификатор - msgid_plural служит лишь для указания что эта локализация имеет множественные формы и так же служит для вывода технического ключа для не дефолтного случая, то есть для индексов msgstr[1] и msgstr[2].

## Поддержка plural forms в системе ресурсов R class.

Для поддержки множественных форм для ресурсной системы R class добавлен метод на стороне с++:

```cpp
const char* UiResourceManager::getTranslatedPluralTextRaw(const UiResourceBase& res, uint32_t n) const
{
    if (res.isUndefined())
    {
        return STRING_EMPTY;
    }

    if (res.getType() != UiResourceType::STRING)
    {
        return STRING_EMPTY;
    }

    if (!res.hasParameter(RsonKeys::TEXTDOMAIN))
    {
        return STRING_EMPTY;
    }

    const char* pluralKey = res.hasParameter(RsonKeys::PLURAL_KEY) ? res.getParameter(RsonKeys::PLURAL_KEY) :
        res.getParameter(RsonKeys::KEY);

    return dngettext(res.getParameter(RsonKeys::TEXTDOMAIN), res.getParameter(RsonKeys::KEY), pluralKey, n);
}
```

который получает не только данные про ресурс (ключ, домен), но еще и дополнительные аргументы: plural ключ, и числительное значение.

Общая схема работы:

![backend](plural-1.png)

Так же сделана поддержка для **wgpygen** относительно добавления в параметры нового атрибута `pluralKey`, и хранения его в даных ресурсной системы. Если локализация имеет множественую форму, то ее параметры в `res_map.json` будут иметь следующий вид:

```json
"60e2":{"type":"String","parameters":{"key":"premium/buying/success","pluralKey":"plural/premium/buying/success","textdomain":"system_messages"}}
```

в свою очередь, сам ресурс на стороне с++ уже будет иметь форму:

```cpp
class UiResourceString : public UiResourceBase
{
public:
    bool hasParameter(std::string_view v) const override
    {
        return (v == "key" && key) || (v == "pluralKey" && pluralKey) || (v == "textdomain" && textdomain);
    }

    const char* getParameter(std::string_view v) const override
    {
        if (v == "key" && key)
        {
            return key.get();
        }
        if (v == "pluralKey" && pluralKey)
        {
            return pluralKey.get();
        }
        if (v == "textdomain" && textdomain)
        {
            return textdomain.get();
        }
        return "";
    }

    bool fromRson(const Rson& v) override;

    bool fromStrings(const std::string& domain, const std::string& msgid);
    bool fromStrings(const std::string& domain, const std::string& msgid, const std::string& msgidPlural);

protected:
    CStringPtr key{};
    CStringPtr pluralKey{};
    CStringPtr textdomain{};
};
```

Пример вызова для ресурса msgid "premium/buying/success"

```
# game/res/wot/scripts/client/gui/impl/backport/backport_r.py
def ntext(resId, n, *args, **kwargs)
```

```
1) backport.ntext(R.strings.system_messages.premium.buying.success(), 1, period=1, money=250)
2) backport.ntext(R.strings.system_messages.premium.buying.success(), 3, period=3, money=500)
3) backport.ntext(R.strings.system_messages.premium.buying.success(), 30, period=30, money=3000)
```

Результаты:

n = 1

![1](plural-2.png)

n = 3

![2](plural-3.png)

n = 30

![3](plural-4.png)

## Поддержка plural forms в gameface.

Для поддержки gameface добавлено два способа передачи аргумента для plural формулы:

Допустим у нас есть текст в system_messages.po:

```po
msgid "day"
msgid_plural "days"
msgstr[0] "%d день"
msgstr[1] "%d дня"
msgstr[2] "%d дней"
```

Передача его аргументом в конструкцию:

```jsx
<div className={mediaStyles.title}>
   {R.strings.system_messages.day(1)}
</div>
// вывод будет "день"
<div className={mediaStyles.title}>
   {R.strings.system_messages.day(10)}
</div>
// вывод будет "дней"
```

Воспользоватся тегом $plural, если есть необходимость динамически менять ресурс:

```jsx
<div className={mediaStyles.title}>
   {R.strings.system_messages.$plural("day", 1)}
</div>
// вывод будет "день"
<div className={mediaStyles.title}>
   {R.strings.system_messages.$plural("day", 10)}
</div>
// вывод будет "дней"
```

## Поддержка для legacy системы ресурсов.

Поскольку проект максимально переходит на технологию gameface, то поддержка plural форм для unbound/scaleform не реализовывалась, но если есть необходимость передать такие локализации в scaleform, то это можна сделать через py backend часть.
Так же, поскольку есть доволи много .xml ресурсов, где локализации добавлены по "старому" формату: #domain:key, то для поддержки таких ресурсов добавлена функция:

```py
def makePluralString(key, pluralKey, n, *args, **kwargs):
```

которая в свою очередь использует на стороне с++ py врапера функцию:

```py
static PyObject* getTranslatedPluralText(const std::string& key, const std::string& pluralKey, uint32_t n, PyObjectPtr args)
```

надо учесть, что ключь pluralKey носит технических характер, и необходим только для вывода msgid_plural если множественная локаль не найдена, с учетом этого в pluralKey достаточно передать обычный key.

## Дополнения.

Plural часть локализации поддержена и для тулсетов: tools/gameface, tools/py_extensions, что даст возможность, например, использовать plural технологию и для py_unit тестов.
Реализованно демо страницу. На логин скрине, с помощью комбинации клавиш ctrl + shift + u, закрыть alt + shift + u, кнопка Plural Localization

## Пример

```jsx
export const Header = observer(() => {
    const { model } = useModel();

    const stages = 10; //model.stages.get();

    return (
        <div className={styles.base}>
            <div className={styles.featureName}>{TEXTS.feature()}</div>
            <div className={styles.title}>{TEXTS.title()}</div>
            <div className={styles.subTitle}>
                <FormatText
                    text={TEXTS.subTitle(stages)}
                    binding={{
                        stages: <span className={styles.accent}>{stages}</span>,
                    }}
                />
            </div>
        </div>
    );
});
```

```po
msgid "rewardsView/subTitle"
msgid_plural "plural/rewardsView/subTitle"
msgstr[0] "Вы получили награду за %(stages)s этап строительства"
msgstr[1] "Вы получили награду за %(stages)s этапа строительства"
msgstr[2] "Вы получили награду за %(stages)s этапов строительства"
```