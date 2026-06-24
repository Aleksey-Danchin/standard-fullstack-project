нужно в vite добавить систему элементов.

Компонент контейнер <SessionCheck /> который проверяет текущую сессию.

<SessionCheck fallback={/_ Loader . . . _/}>
<SessionCheck />

useSessionUser - который возвращает объект типа

```
{
    isAuthenticated: bool, // sessionUser != null

    sessionUser: {
        sessionId: string,
        user: UserPublic,
        accessExpiresAt: Date,
    } | null,

    refresh: () => void,

    check: () => void,

    login: (data: LoginData) => void,

    logout: () => void

}
```

Данные заполняются из вызова sessionCheck. Для хранилища использовать zustand независимые. Упаковать все эти компоненты, вместе с хранилищем, в отедльный слой. Можно в виде отдельной директории в директории services.

Так же нужно создать axios instance (apiClient) с предопределнным baseURL и встроенным plimit. plimit конфигурация должена так же быть указан через переменные окружения. В axios же можно как-то предобрабатывать все запросы?

Свои вопросы таком же формате файла вопросов задавай в новом файле вопросов в .dev
