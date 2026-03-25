# Алексей Голубев — Платформа персонального тренера

Веб-приложение для персонального тренера (МС по русскому жиму): личные кабинеты пользователей, новости, магазин, тренировочные программы, панель администратора.

## Технологии

**Frontend:** React 18 + TypeScript + Vite + Ant Design 5 + Zustand + React Router 6

**Backend:** Node.js + Express + PostgreSQL (Neon) + JWT + bcryptjs

**Деплой:** Vercel (frontend + backend serverless functions)

## Деплой на Vercel (production)

### 1. Создайте PostgreSQL базу данных

Зарегистрируйтесь на [neon.tech](https://neon.tech) (бесплатно) и создайте проект. Скопируйте строку подключения — она выглядит так:
```
postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

### 2. Задеплойте на Vercel

1. Импортируйте репозиторий на [vercel.com](https://vercel.com/new)
2. **Ветка:** `master`
3. **Root Directory:** оставьте `./` (корень)
4. Добавьте **Environment Variables:**

| Переменная | Значение |
|-----------|---------|
| `DATABASE_URL` | строка подключения из Neon |
| `JWT_SECRET` | случайная строка 50+ символов |
| `NODE_ENV` | `production` |

5. Нажмите **Deploy**

При первом запросе к API бэкенд автоматически создаст таблицы и заполнит seed-данные.

### Как это работает

- Frontend билдится Vite и раздаётся как статика
- Backend работает как Vercel Serverless Function (`/api/*`)
- PostgreSQL (Neon) — облачная база данных
- Всё на одном домене, никаких CORS-проблем

## Локальная разработка

```bash
# Установить зависимости
npm run install:all

# Создать backend/.env
cp backend/.env.example backend/.env
# Указать DATABASE_URL (можно тот же Neon или локальный PostgreSQL)

# Запустить backend (порт 3001, терминал 1)
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
├── api/
│   └── index.js               # Vercel serverless entry point
├── backend/
│   ├── src/
│   │   ├── db/setup.js         # PostgreSQL схема + seed данные
│   │   ├── middleware/auth.js   # JWT аутентификация
│   │   ├── index.js             # Express приложение
│   │   └── routes/              # REST API роуты
│   └── __tests__/               # Jest + supertest тесты
├── frontend/
│   └── src/
│       ├── api/                 # Axios клиент + API методы
│       ├── store/               # Zustand хранилище (auth)
│       ├── types/               # TypeScript типы
│       ├── components/          # AppLayout, ProtectedRoute
│       ├── pages/               # Страницы приложения
│       │   └── admin/           # Панель администратора
│       └── tests/               # Vitest + RTL тесты
└── vercel.json                  # Конфигурация деплоя
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
# Frontend тесты (не требуют БД)
cd frontend && npm test

# Backend тесты (требуют DATABASE_URL)
DATABASE_URL=postgresql://... cd backend && npm test
```
