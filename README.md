# Крутфолио

Крутфолио - это веб-приложение для управления портфолио проектов. Оно включает в себя фронтенд на React и бэкенд на Django.

## Структура проекта

Проект состоит из двух основных частей:

- **portfolio_frontend**: Фронтенд на React с использованием Vite.
- **portfolio_backend**: Бэкенд на Django с REST API.

## Установка

### Требования

- Node.js
- Python 3.x
- Django

### Шаги установки

1. Клонируйте репозиторий:

    ```sh
    git clone https://github.com/dant4ick/react-django-portfolio.git
    cd react-django-portfolio
    ```

2. Установите зависимости для фронтенда:

    ```sh
    cd portfolio_frontend
    npm install
    ```

3. Установите зависимости для бэкенда:

    ```sh
    cd ../portfolio_backend
    pip install -r requirements.txt
    ```

4. Выполните миграции базы данных:

    ```sh
    python manage.py migrate
    ```

5. Запустите сервер разработки Django:

    ```sh
    python manage.py runserver
    ```

6. Запустите сервер разработки фронтенда:

    ```sh
    cd ../portfolio_frontend
    npm run dev
    ```

## Использование

После запуска серверов, откройте браузер и перейдите по адресу [http://localhost:3000](http://localhost:3000) для доступа к фронтенду. Бэкенд будет доступен по адресу [http://localhost:8000](http://localhost:8000).

## Тестирование

Чтобы убедиться, что основные функции бэкенда работают корректно и безопасно, запустите автоматические тесты:

```sh
cd portfolio_backend
python manage.py test
```

Тесты проверяют требования к аутентификации, корректность работы настроек связей между проектами и другие сценарии API.
