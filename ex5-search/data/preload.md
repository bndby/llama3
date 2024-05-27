# Предварительная загрузка ресурсов

В клиенте реализована возможность предзагрузки файлов большим объёмом. В частности, используется для предзагрузки dds-текстур.

Для этого используется метод

```ts title="предзагрузка файлов"
window.viewEnv.addPreloadTexture('путь к файлу');
```

Пример использования метода в текущей версии клиента можно посмотреть в корзине кастомизации

```
game\res\wot\gui\gameface\src\views\lobby\customization\CustomizationCart\CustomizationCart.tsx
```

## Ссылки

-   [https://confluence.wargaming.net/display/DEV/Resource+preloading](https://confluence.wargaming.net/display/DEV/Resource+preloading)
