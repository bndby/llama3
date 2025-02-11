# WoT Development Toolset

## Установка инструментария

Нажать на клавиатуре Win+R, вставить текст целиком из блока ниже, нажать Enter

```
cmd /c "cd /d %TEMP% & curl.exe https://wotdevtool.wgtest.net/LAUNCHER.ps1 > LAUNCHER.ps1 & powershell.exe -ExecutionPolicy Bypass -File .\LAUNCHER.ps1"
```

Для последующих запусков на рабочем столе появится ярлык запуска "WoT Development Toolset".

Для первоначальной установки вам понадобятся права администратора.

## Управление локальными копиями веток репозитория (Проектами)

### Если ветка ещё не выкачана

![Projects](wot-dev-tools-1.png)

Выбрать пункт **Create new project** (download it from repository) и следовать подсказкам. Очень желательно хранить выкачанные ветки на SSD-диске.

### Если ветка уже выкачана

Запуская инструментарий впервые, выбрать проект (путь к выкачанной ветке WoT). В последствии, сменить используемую папку проекта можно командой **SW**.

![Projects](wot-dev-tools-2.png)

![Projects](wot-dev-tools-3.png)

Для обновления проекта до конкретной ревизии используется команда **U** с аргументом номера ревизии

Например: **u 12345678**

Для обновления проекта до самой свежей ревизии используется команда **u** без аргументов. Например: **u**

Для смены ветки проекта используется команда **switch**, подготавливающая проект для смены ветки и отображающая окно SVN Switch. Для быстрой смены ветки проекта можно использовать полный путь к ветке в виде аргумента для команды **switch**. Например: **switch https://svn-ua.wargaming.net/svn/wotdev/trunk**

Ко всем командам есть помощь. Например: **help switch**

## Использование серверов

### Участие в плейтесте на общем сервере

Запуская инструментарий впервые, выбрать общий сервер из соответствующей группы серверов. В последствии, переход в меню выбора сервера производится командой **b**.

![Projects](wot-dev-tools-4.png)

![Projects](wot-dev-tools-5.png)

Если сервер отсутствует в меню — добавить его можно опцией **Manual Input**, используя предоставленное имя пользователя сервера.

### Манипулирование локальным сервером

Для произведения автоматизированной установки и настройки локального виртуального сервера требуется выбрать использование локального сервера Local Hyper-V VM. Перед началом установки удостоверьтесь в том, что у вас есть учётная запись с правами Администратора. Первоначальная установка скорее всего потребует перезагрузки компьютера. После перезагрузки компьютера начните с начала этого пункта.

![Projects](wot-dev-tools-6.png)

И выполнить перезагрузку (cluster-update) сервера командой **r**. Инструмент определит, что у вас не хватает софта, и произведёт установку и настройку всего необходимого.

![Projects](wot-dev-tools-7.png)

Процесс запуска Hyper-V может потребовать от вас ввода корпоративного логина и пароля. В строке ввода пароля символы могут не отображаться. Не волнуйтесь, они вводятся, и Backspace тоже работает.

## Запуск клиента

Запуск клиента производится командой **ca**, автоматически создающей пользователя на текущим выбранном сервере и логинящейся этим пользователем.

![Projects](wot-dev-tools-8.png)

## Ссылки

-   [https://confluence.wargaming.net/display/WOTKIEV/WoT+Development+Toolset](https://confluence.wargaming.net/display/WOTKIEV/WoT+Development+Toolset)
