# Алексей Голубев — Платформа персонального тренера

Веб-приложение для персонального тренера: личные кабинеты пользователей, новости, магазин, тренировочные программы, панель администратора.

## Технологии

**Frontend:** React 18 + TypeScript + Vite + Ant Design 5 + Zustand + React Router 6

**Backend:** Node.js + Express + SQLite (better-sqlite3) + JWT + bcryptjs

## Быстрый старт

```bash
# Установить зависимости backend
cd backend && npm install

# Установить зависимости frontend
cd ../frontend && npm install

# Запустить backend (порт 5000, терминал 1)
cd backend && npm run dev

# Запустить frontend (порт 3000, терминал 2)
cd frontend && npm run dev
```

Открыть: http://localhost:3000

## Доступы

| Роль | Email | Пароль |
|------|-------|--------|
| Администратор | admin@gym-alex.ru | admin123 |
| Пользователь | регистрация через сайт | — |

## Структура

```
gym_alex/
├── backend/
│   ├── src/
│   │   ├── db/setup.js          # SQLite схема + seed данные
│   │   ├── middleware/auth.js   # JWT аутентификация
│   │   └── routes/              # REST API роуты
│   └── __tests__/               # Jest + supertest тесты
└── frontend/
    └── src/
        ├── api/                 # Axios клиент + API методы
        ├── store/               # Zustand хранилище (auth)
        ├── types/               # TypeScript типы
        ├── components/          # AppLayout, ProtectedRoute
        ├── pages/               # Страницы приложения
        │   └── admin/           # Панель администратора
        └── tests/               # Vitest + RTL тесты
```

## Функциональность

### Пользователь
- Регистрация в 3 шага: аккаунт → физические параметры → цели
- Личный кабинет: рост, вес, возраст, пол, цель, опыт, особенности здоровья
- Новостная лента
- Магазин товаров с фильтрацией по категориям
- Тренировочные программы с упражнениями
- Мои программы: назначенные тренером с возможностью смены статуса

### Администратор
- Дашборд со статистикой
- Управление пользователями + назначение тренировочных программ
- CRUD новостей, товаров, тренировочных программ с упражнениями

## Тесты

```bash
cd backend && npm test   # Jest + supertest
cd frontend && npm test  # Vitest + React Testing Library
```
