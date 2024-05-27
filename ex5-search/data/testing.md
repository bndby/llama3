# Тестирование

## Тестирование React с помощью Jest и Enzyme

### Бибилотеки

-   [Jest](https://jestjs.io/ru/) это библиотека для запуска тестов, утверждений и имитаций
-   [Enzyme](https://github.com/enzymejs/enzyme) предоставляет дополнительные утилиты для тестирования компонентов React
-   [jest-enzyme](https://www.npmjs.com/package/jest-enzyme) ー дополнительные утверждения для оператора `expect`
-   [Jest Deep Mock](https://www.npmjs.com/package/jest-deep-mock) предоставляет альтернативную фиктивную реализацию jest.fn(), позволяющую перемещаться по фиктивному объекту без указания значения на каждом уровне
-   [jest-teamcity](https://www.npmjs.com/package/jest-teamcity) это TeamCity Reporter для Jest

### Консольные команды

Из каталога `\game\res\wot\gui\gameface` вы можете запустить следующие команды:

|                                       | Команда                 | Псевдонимы                                       |
| ------------------------------------- | ----------------------- | ------------------------------------------------ |
| Запуск тестов с покрытием             | `npm run test:coverage` | `npm t  -- --coverage` `npm test  -- --coverage` |
| Запуск теста с обновилением снэпшотов | `npm run test:update`   | `npm t -- -u` `npm test -- -u`                   |
| Запуск тестов                         | `npm run test`          | `npm t` `npm test`                               |

### Методические рекомендации

#### Именование файлов

Назовите файл для тестов с именем компонента + постфикс .test

_Например: Checkbox.test.js_

#### Структура каталогов

-   положите файл с тестами в директорию `Component`
-   снэпшоты храним в каталоге `__snapshots__`

_Пример:_

-   `/Checkbox`
    -   `/__snapshots__`
        -   `Checkbox.test.js.snap`
    -   `Checkbox.css`
    -   `Checkbox.test.js`
    -   `Checkbox.tsx`

#### Тесты

-   список доступных методов для оператора `expect` от jest, jest-enzyme
-   разбить тесты на логические блоки - метод `describe`
-   название блока `describe` должно начинаться с существительного
-   название блока `test` (`it`) должно начинаться с _"should + verb"_

```javascript
describe('Checkbox with default props', () => {
    it('should match snapshot', () => {
        const wrapper = shallow(
            <Checkbox onChange={jest.fn()} />
        );
        expect(wrapper).toMatchSnapshot();
    });

    it('should call onChange func once', () => {
        const onChangeFn = jest.fn();
        const wrapper = shallow(
            <Checkbox onChange={onChangeFn} />
        );

        wrapper.simulate('click');

        expect(onChangeFn).toHaveBeenCalledTimes(1);
    });
});

describe('Checkbox', () => {
    it('should not call onChange func if disabled', () => {
        const onChangeFn = jest.fn();
        const wrapper = shallow(
            <Checkbox
                onChange={onChangeFn}
                isDisabled={true}
            />
        );

        wrapper.simulate('click');

        expect(onChangeFn).not.toHaveBeenCalled();
    });
});
```

#### Различные методы рендеринга Enzyme

В Enzyme есть три метода рендеринга:

-   поверхностный
-   монтирование
-   рендер

Вы всегда должны начинать с поверхностного. Если вам нужно проверить поведение дочерних элементов, используйте монтирование. Рендер вызывает метод рендеринга для всех дочерних элементов, но не запускает другие методы, такие как `componentDidMount`, `shouldComponentUpdate`.

Подробнее [здесь](https://medium.com/@Yohanna/difference-between-enzymes-rendering-methods-f82108f49084).

#### снэпшоты

Если вы не знакомы с тестированием снэпшотов, ознакомьтесь с [документацией](https://jestjs.io/docs/snapshot-testing).

Если при изменении кода снэпшот изменился, разработчику необходимо проверить, ожидаемы ли изменения снэпшота. Если это так, вам необходимо обновить снэпшот (`npm run test:update`) и зафиксировать его вместе с соответствующими изменениями кода.

Рекомендуется следовать этим [рекомендациям](https://jestjs.io/docs/snapshot-testing#best-practices).

#### Mocking

Если у компонента есть какие-либо дочерние компоненты, вы можете смоделировать их, чтобы дочерние компоненты не влияли на тесты для родительского компонента. Но если вы используете _mount_, вы, вероятно, не захотите этого делать.

```javascript
// if you need to mock Slot component for shallow rendering
jest.mock('../Slot/Slot', () => ({ Slot: 'Slot' }));
```

Если вам нужно имитировать дочерние компоненты для рендеринга монтирования, вам нужно создать фактический компонент React для макета. Тем не менее, вы должны пересмотреть использование _mount_ для этого случая, потому что это, вероятно, не нужно.

```javascript
// if you need to mock Tooltip component for mount rendering
jest.mock('components/Tooltip/Tooltip', () => {
    const Tooltip = (props) => <>{props.children}</>;
    return { Tooltip };
});
```

Если у компонента есть какая-либо функция в свойствах, вы можете проверить, сколько раз и с какими параметрами вызывалась эта функция. Вам просто нужно имитировать его и использовать оператор `expect`.

```javascript
it('should call onSelectItem with correct params', () => {
    const onSelectFn = jest.fn();

    const wrapper = mount(
        <Slot
            id={123}
            isFromStorage={false}
            isChecked={false}
            onSelectItem={onSelectFn}
        />
    );

    wrapper.simulate('click');

    expect(onSelectFn).toHaveBeenCalledTimes(1);
    expect(onSelectFn).toHaveBeenCalledWith(
        123,
        false,
        true
    );

    wrapper.unmount();
});
```

Вы также можете имитировать любой объект локально в тесте.

### Как использовать

#### Эмулировать среду TeamCity

На вашем компьютере запустите `SET TEAMCITY_VERSION=1`. Чтобы отключить его, запустите `SET TEAMCITY_VERSION=`

#### Исправление специфичного предупреждения

!!!warning "Предупреждение"

    `<Tooltip/>` использует неправильный регистр. Используйте PascalCase для компонентов React или строчные буквы для элементов HTML.

```cmd
PASS src/views/lobby/customization/CustomizationCart/components/Slot/Slot.test.js
  ● Console    console.error node_modules/react-dom/cjs/react-dom.development.js:506
      Warning: <Tooltip /> is using incorrect casing. Use PascalCase for React components, or lowercase for HTML elements.
          in Tooltip (created by Slot)
          in Slot (created by WrapperComponent)
          in WrapperComponent
```

Скорее всего, вы используете рендеринг монтирования, но имитируете компонент для поверхностного рендеринга.  
Проверьте раздел [Mocking](#mocking).

## Unit-тестирование компонент

В гайде рассматриваются приемы для тестирования React-компонентов с помощью хелпера `component-test-helper.tsx`.

### Пример компонента

Для примера рассмотрим компонент `Button`:

```javascript
import React, {
    PropsWithChildren,
    MouseEventHandler,
    MouseEvent,
} from 'react';
import classNames from 'classnames';
import { playSound } from 'lib/sound';
import { Icon, IconType } from './icon';

import styles from './Button.css';

enum ButtonType {
    primary = 'primary',
    secondary = 'secondary',
}

type ButtonProps = PropsWithChildren<{
    icon: IconType;
    type?: ButtonType;
    disabled?: boolean;
    soundHover?: string;
    soundClick?: string;
    onHover?: MouseEventHandler;
    onLeave?: MouseEventHandler;
    onClick?: MouseEventHandler;
}>;

const Button = ({
    children,
    icon,
    type = ButtonType.primary,
    disabled = false,
    soundHover = 'highlight',
    soundClick = 'play',
    onHover,
    onLeave,
    onClick,
}: ButtonProps) => {
    const handleClick = (e: MouseEvent) => {
        !disabled && playSound(soundClick);
        !disabled && onClick && onClick(e);
    };

    const handleHover = (e: MouseEvent) => {
        !disabled && playSound(soundHover);
        !disabled && onHover && onHover(e);
    };

    const handleLeave = (e: MouseEvent) => {
        !disabled && onLeave && onLeave(e);
    };

    const baseClassNames = classNames(
        styles.base,
        styles[`base__${type}`],
    );

    return (
        <div
            className={baseClassNames}
            onMouseEnter={handleHover}
            onMouseLeave={handleLeave}
            onClick={handleClick}
        >
            {icon && <Icon type={icon} />}
            {children}
        </div>
    );
};

export { Button, ButtonType, ButtonProps };
```

У компонента есть свойства, звуки, события и дочерний компонент, которые мы покроем тестами.

### [DEPRECATED] Как имитировать useModel (mock)

!!!danger "Deprecated"

    useModel устарел, не используйте его. Вместо него используйте [Data Layer](data-layer.md).

В случае использования нашим компонентом модели с помощью хука `useModel`, её необходимо предварительно мокнуть:

```javascript
// Использование модели useModel:
// const {boxesCount, hasNew, onClick} = useModel();

jest.mock('lib/hooks', () => ({
    useModel: () => ({
        boxesCount: 5,
        hasNew: false,
        onClick: jest.fn(),
    }),
    ModelTracking: () => ({
        None: 'None',
        Shallow: 'Shallow',
        Deep: 'Deep',
    }),
}));
```

### Тестирование снэпшотами

Для тестирования снэпшотами понадобится объект с дефолтными пропсами:

```javascript
const defaultProps = {
    icon: IconType.iconName,
};
```

Протестируем компонент с пропсами по-умолчанию:

```javascript
it('should be same with default props', () => {
    const wrapper = shallow(<Button {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
});
```

Хелпер:

```javascript
renderWithDefaultProps(Button, defaultProps);
```

Теперь покроем снэпшотами остальные, необязательные пропсы. Покроем все возможные варианты пропсов:

```javascript
it.each(Object.keys(ButtonType))(
    'should be same with type: %s',
    (type) => {
        const wrapper = shallow(
            <Button {...defaultProps} type={type} />
        );
        expect(wrapper).toMatchSnapshot();
    }
);

it.each(Object.keys(ButtonType))(
    'should be same with disabled and type: %s',
    (type) => {
        const wrapper = shallow(
            <Button
                {...defaultProps}
                type={type}
                disabled
            />
        );
        expect(wrapper).toMatchSnapshot();
    }
);
```

Хелпер:

```javascript
Object.keys(ButtonType).forEach((type) => {
    renderForPropCorrectly(Button, defaultProps, { type });
    renderForPropCorrectly(Button, defaultProps, {
        type,
        disabled: true,
    });
});
```

### Проброс пропсов в дочерний компонент

Проверим, правильно ли пробрасываются пропсы в дочерний компонент:

```javascript
it(`should pass correct 'icon' property to the <Icon /> component`, () => {
    const wrapper = shallow(<Button {...defaultProps} />);
    expect(wrapper.find(Icon).prop('icon')).toEqual(
        IconType.iconName
    );
});
```

Хелпер:

```javascript
passPropToChildren(
    Button,
    Icon,
    defaultProps,
    'icon',
    IconType.iconName
);
```

### Обработчики событий

Проверим, что при возникновении событий вызываются соответствующие обработчики, а при отключенном состоянии - не вызываются.

```javascript
it(`should be called once when "${event}" event is triggered`, () => {
    const onClick = jest.fn();
    const props = {
        ...defaultProps,
        onClick,
    };
    const wrapper = shallow(<Component {...props} />);
    wrapper.simulate(event, { button: 0 });
    expect(onClick).toHaveBeenCalledTimes(1);
});

it(`should be called once when "${event}" event is triggered`, () => {
    const onClick = jest.fn();
    const props = {
        ...defaultProps,
        onClick,
        disabled,
    };
    const wrapper = shallow(<Component {...props} />);
    wrapper.simulate(event, { button: 0 });
    expect(onClick).toHaveBeenCalledTimes(0);
});
```

Так же проверяем работу обработчиков `onHover` и `onLeave`. Дополнительно для событий можно передавать опциональные данные события `eventData`.

```javascript
const callbacks = [
    ['onClick', 'click', { button: 0 }],
    ['onHover', 'mouseEnter'],
    ['onLeave', 'mouseLeave'],
];

describe('Callbacks work correctly', () => {
    callbacks.forEach((item) => {
        const [prop, event, eventData] = item;
        callbackCalledOnce(
            Button,
            defaultProps,
            prop,
            event,
            eventData
        );
    });
});

describe('Callbacks work correctly if disabled', () => {
    callbacks.forEach((item) => {
        const [prop, event, eventData] = item;
        const propsWithDisabled = {
            ...defaultProps,
            disabled: true,
        };
        callbackNotCalled(
            RadioButton,
            propsWithDisabled,
            prop,
            event,
            eventData
        );
    });
});
```

### Звуки

Проверим, что при возникновении событий вызываются соответствующие звуки:

```javascript
it(`should play sound for "click" event. Sound plays once`, () => {
    const wrapper = shallow(<Button {...defaultProps} />);

    wrapper.simulate('mouseDown', { button: 0 });

    expect(playSound).toHaveBeenCalledWith('play');
    expect(playSound).toHaveBeenCalledTimes(1);
});
```

Аналогичным образом проверяем вызов звуков при наведении.

```javascript
const soundCallbacks = [
    ['mouseEnter', 'highlight'],
    ['mouseDown', 'play', { button: 0 }],
];

describe('Sound plays correctly', () => {
    soundCallbacks.forEach((item) => {
        const [event, sound, eventData] = item;
        checkPlaySound(
            Button,
            defaultProps,
            event,
            sound,
            eventData
        );
    });
});
```

## Ссылки

-   [Testing React with Jest and Enzyme](https://confluence.wargaming.net/display/DEV/Testing+React+with+Jest+and+Enzyme)
-   [Unit-тестирование компонент](https://confluence.wargaming.net/pages/viewpage.action?pageId=1215617811)
