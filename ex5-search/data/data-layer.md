# Data Layer

## Краткое описание

Представляет из себя слой для работы с данными. Делится на две части - ядро, которое отвечает за транспортных уровень и любое взаимодействие с C++ и интеграционную часть, которая отвечает за предоставление API для реализации модели и ее взаимодействия с UI.

Необходим для абстракции UI от данных на GP, логики представления и трансформации данных. Так же служит механизмом оптимизации UI. Со стороны UI нет разницы, используем мы питон, плюсы, или вообще не используем внешнюю модель, интерфейс всегда работает с Data Layer моделью, таким образом мы можем полностью контролировать работу с данными. Это упрощает рефакторинг, дает механизмы оптимизации, а так же механизм использования моков.

## Схема работы

![Схема](data-layer-1.png)

## Документация по применению

### Начало использования

Создайте на уровне view файл, где будете использовать Data Layer и реализовывать свой слой с модель. Обычно его называют `model.ts`. Напишите следующий код:

```ts
export const [ModelProvider, useModel] =
    initializeModelWithContext<
        CastAllArrays<YOUR_GP_MODEL_GEN_TYPE>
    >()(({ observableModel }) => {});
```

`CastAllArrays` используется для преобразования всех `CoherentArrayProxy` в `LikeArray` тип в глубину. Что такое `LikeArray` описано ниже. Где написано `YOUR_GP_MODEL_GEN_TYPE` необходимо использовать тип модели для вашей view.

`observableModel`, который приходит в аргументе функции необходим для подписок на части модели. Как это делалось раньше, необходимо указать первым аргументом путь до данных без приставки `model`. Если необходима подписка на корень, то необходимо использовать `observableModel.object()` без аргументов. Типы указывать не нужно. Они будут выводиться на основании указанного в `initializeModelWithContext` и пути, на который вы подписываетесь. Второй необязательный аргумент служит для дефолтного значения, оно будет использовано вместо прочтения данных из модели.

### Подписки и обновления

Создайте наблюдателя для корня модели:

```ts
const model = {
    root: observableModel.object(),
};
```

Теперь, чтобы прочитать данные необходимо воспользоваться следующей конструкцией – `model.root.get()`

Вызов `get()` подписывает функции-обертки на изменение `model.root`. Подписчиками могут быть следующие функции:

-   `observer` – обертка над компонентом. Без нее вызов `model.root.get()` не подпишет компонент на изменения.
-   `autorun` , `reaction` , `when` – [реакции](https://mobx.js.org/reactions.html) для от самого mobx, подобны `useEffect` в реакте, имеют свои особенности.
-   `computed` , `computedFn` – служит для вычисления данных и реакции на них, так же уведомляет тех, кто их вызывал по цепочке. Схема будет приведена ниже.

![Схема](data-layer-2.png)

На схеме видно, что обновления распространяются по цепочке. Каждый раз `computed` делает проверку предыдущего результата с новым, и если они равны, он просто прерывает цепочку и дальше уведомление попросту не идет. Таким образом можно делать оптимизации. Но так же, будьте внимательны, если из `computed` вернуть массив или объект из модели – их ссылка останется прежней при изменении, потому придется добавить `{ equals: constFalse }` вторым аргументом. Наблюдаемые объекты и компьютеды принимают дополнительным аргументом настройки и там можно указать функцию сравнения. Очень полезная вещь.

Пример использования:

```ts
const getCard = computedFn(
    (index: number) => likeArray.get(getCards(), index),
    {
        equals: constFalse,
    }
);
```

Схема работы цепи:

![Схема](data-layer-3.png)

Далее, что вернется из функции – то будет доступно в поле model при вызове useModel .

### Использование

Допустим получился примерно вот такой код:

```ts
export const [ModelProvider, useModel] =
    initializeModelWithContext<CastAllArrays</* ... */>>()(
        ({ observableModel }) => {
            const model = {
                root: observableModel.object(),
                rewards: observableModel.array('rewards'),
            };

            const getReward = computedFn(
                (index: number) =>
                    likeArray.get(
                        model.rewards.get(),
                        index
                    ),
                { equals: constFalse }
            );

            return {
                ...model,
                computes: {
                    getReward,
                },
            };
        },
        noop
    );
```

-   `noop` – функция "пустышка", ничего не принимает и не возвращает. Об этом позже.
-   `initializeModelWithContext` возвращает два значения – это провайдер и хук. Именно провайдер будет создавать модель внутри себя в момент первого рендера. Если вдруг провайдер пропадет под опциональном рендере – он уничтожит все, что хранится в модели на стороне UI.

Подключение:

```jsx
<ModelProvider>
    <App />
</ModelProvider>
```

Теперь можно воспользоваться моделью:

```jsx
const App = observer(() => {
  const { model } = useModel();
  const { ... } = model.root.get()

  return <div />
})
```

Теперь `App` будет обновлен, в случае, из будет уведомление обновления корня со стороны C++

### Работа с функциями извне

Как раз для работы с функциями и нужна вторая функция. В объект функции приходит еще `externalModel` – это и есть api ядра, транспортного уровня. Там используется 2 метода для работы с функциями – `createCallback` и `createCallbackNoArgs` . Последний – это частный случай первого, когда у вас функция не использует аргументы. Нужно лишь для того, чтобы уменьшить кол-во шаблонного кода.

Пример:

```ts
({ externalModel }) => ({
    selectReward: externalModel.createCallback(
        (cardIndex: number) => ({ cardIndex }),
        'onSelectReward'
    ),
    accept: externalModel.createCallbackNoArgs(
        'onAcceptSelectedReward'
    ),
});
```

Все что вернется из этой функции, будет записано в поле `controls` от хука `useModel`.

```ts
const App = observer(() => {
    const { controls } = useModel();

    return <div onClick={controls.accept} />;
});
```

### Примеры

Вы можете найти пример реализации целой view с использованием Data Layer. Путь до модели: `src\development\views\DataLayerDemoView\model.ts`

## Дополнительные возможности

### Виджеты

Иногда GP для упрощения жизни может создавать сабмодули – это модель, которая может быть типом для какого-нибудь поля в другой модели (получается подмодель). В таком случае, хочется иметь на стороне UI аналогичный кусок логики, который всегда будет обрабатывать этот кусок данных единообразно. По сути это выглядит как виджет. Именно так обычно их и называют. Для его создания не нужно ничего особенного:

```ts
export const [ModelProvider, useModel] =
    initializeModelWithContext<SubModelType>()(
        ({ observableModel }) => observableModel.object(),
        noop
    );
```

Где `SubModelType` указывается тип сабмодуля. Все операции через `observableModel` должны проходить, будто у нас `SubModelType` это корень, потому есть в `SubModelType` есть например поле `rewards` , то чтобы на него подписаться, нужно написать `observableModel.object('rewards')`.

У `ModelProvider` есть пропса для настройки DataLayer – `options`. Это тип объекта, там есть поле `context` – это строка используется как префикс для пути, по дефолту она ровна `model`. Получается, ее можно изменить, например на `model.submodel`.

```jsx
const options = { context: 'model.submodel' } // should be memoized or outside of component

<ModelProvider options={options}>
  <App />
</ModelProvider>
```

Теперь DataLayer данного виджета будет использовать `window.model.submodel` как префикс для своего пути, и например подписка на `rewards` будет такой: `window.model.submodel.rewards`.

### Хранение UI состояния доступного для view или виджета

Для хранения состояния в DataLayer используется `observable.box()` - под капотом DL так же используется он.

Это обертка над данными, можно представить себе как коробочку, в которую вы помещаете свои данные.

Для того чтобы положить что-то новое, нужно воспользоваться методом `.set()`, а достать методом `.get()`

Любой обсервер (`observer` / `when` / `reaction` / `autorun`) создает контекст для функции, которую вы передаете (компонент это тоже функция). При вызове в этой функции метода `.get()` у коробочки, берется данный контекст и подписывается на изменения `box`.

![Схема](data-layer-4.png)

При вызове `.set(...)` все такие подписчики будут уведомлены, если значение изменилось (ререндер, или просто вызов функции и т. д.). Проверка значения работает по прямому сравнению, но если нужно ее убрать или изменить, но вторым аргументом при создании коробки можно указать настройки, там есть поле `equals`, которое принимает функцию сравнения `a` и `b`.

![Схема](data-layer-5.png)

Важно: все `.set()` должны быть под `action`, это "склеивает" все обновления в один большой апдейт, без него mobx может работать непредсказуемо, а так же вы получите ворнинг.

Примеры:

```ts
export const [ModelProvider, useModel] = initializeModelWithContext<
  CastAllArrays<...>
>()(({ observableModel }) => {
    const model = {
        ...,
        animationState: observable.box<AnimationState>('idle'),
    }

    return model;
}, ({ model }) => {
    // возможно как то можно избавить от такого бойлерплейта, пока так
    const updateAnimationState = action((state: AnimationState) => model.animationState.set(state))
    return {
        endAnimation: () =>  updateAnimationState('end'),
        nextAnimation: () =>  updateAnimationState(queueMapAnimations[state]),
        setHardAnimationState:  updateAnimationState,
    }
});
```

Использование:

```ts
const Component = observer(() => {
    const { model } = useModel();

    return (
        <div
            className={cx(
                styles.base,
                styles[
                    `base__${model.animationState.get()}`
                ]
            )}
        />
    );
});
```

Так же есть хелпер для создания экшенов:

```ts
const actions = makeActions({
    updateState: (state: State) => model.state.set(state),
    toSome: (some: ...) => model.some.set(some),
})
```

### Генераторы

В некоторых ситуациях будет целесообразно использовать генераторы внутри моков. Обычно они используются в месте с моками в случаях, где необходимо что-то вывести или изменить поэтапно, либо сгенерировать какой-то набор полей/обьектов, у которых по отношению друг к другу будет изменятся только одно или незначительное количество полей. Например, когда мы хотим сгенерировать набор одинаковых квестов с разными `id`. Пример такого генератора приведен ниже:

```ts
const getQuestMock = function* () {
    let id = 100;

    while (true) {
        yield {
            id,
            chapterId:
                Math.trunc(Math.random() * CHAPTERS) + 1,
            title: [
                '123',
                '234',
                '345',
                '456',
                '567',
                '678',
                '789',
            ][Math.trunc(Math.random() * 7)],
            target: Math.trunc(Math.random() * 1000) + 4000,
            current:
                Math.trunc(Math.random() * 2000) + 2000,
            rewards: [
                {
                    name: BonusNames.Credits,
                    value: 100000,
                    image: 'R.images.gui.maps.icons.quests.bonuses.big.credits',
                },
                {
                    name: BonusNames.Crystal,
                    value: '100',
                    image: 'R.images.gui.maps.icons.quests.bonuses.big.crystal',
                },
                {
                    name: BonusNames.Vehicles,
                    value: 'Object 703-II',
                    valueType: getRewardValueType(
                        RewardType.PremiumPlus
                    ),
                    image: 'R.images.gui.maps.icons.quests.bonuses.big.vehicles',
                },
            ],
            icon: 'star',
        };
        id++;
    }
};

const questGenerator = getQuestMock();
```

В данном случае у нас меняется только поле `id`, при каждом вызове `questGenerator.next()`. Такие вызовы можно использовать как и при заполнении первоначального состянии `initialModel`, так и при дальнейшем его изменении либо дополнении (полезно в случаях, когда мы используем в состоянии какие-либо массивы, и их требуется заполнять с поэтапно меняющимися значениями).

Как пример, допустим, у нас должен быть набор карточек, в каждой новой из которых поэтапно должен быть увеличен прогресс, и при создании новой карточки этот прогесс должен быть увеличен по отношению к предыдущей. Создадим генератор `generatorForCards`, сразу вызовем его ниже и так же инициализируем функцию для создания карточек:

```ts
function* generatorForCards() {
    let progress = 0;
    while (true) {
        yield {
            title: random.choice([
                'Be first!',
                'Play on 3 have',
                'Deal 3 000 damage',
                'Take 5 000 damage',
                'Win three games in a row',
            ]),
            progress,
            rewards: [],
        };
        progress += 10;
    }
}

const cardGenerator = generatorForCards();

const randomCard = () => {
    const card = cardGenerator.next().value;
    return card;
};
```

Теперь мы можем использовать функцию для создания карточек как в геттере, так и в методе добавления новых карточек в моке. На примере ниже создается сразу 3 карточки с поэтапно увеличенным прогрессом:

```ts
export const mocks: MocksOf<typeof useModel> = {
    getter: (path) => {
        switch (path) {
            case 'cards':
                return mapRange(3, () => {
                    const card = randomCard();
                    return card;
                });
             ...
        }
    },
    controls: ({ model: { mainInfo, computes } }) => {
        return makeActions({
            addCard: () => {
                likeArray.push(computes.getCards(), randomCard());
            },
            ...
        });
    },
};
```
