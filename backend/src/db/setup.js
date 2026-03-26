const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

async function query(text, params) {
  const result = await getPool().query(text, params);
  return result;
}

async function setupDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      phone TEXT,
      height REAL,
      weight REAL,
      age INTEGER,
      gender TEXT,
      fitness_goal TEXT,
      experience TEXT,
      health_notes TEXT,
      avatar_url TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS news (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      published INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image_url TEXT,
      category TEXT DEFAULT 'general',
      stock INTEGER DEFAULT 0,
      published INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS trainings (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      difficulty TEXT DEFAULT 'beginner',
      duration_weeks INTEGER DEFAULT 4,
      image_url TEXT,
      published INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS exercises (
      id SERIAL PRIMARY KEY,
      training_id INTEGER NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      sets INTEGER DEFAULT 3,
      reps TEXT DEFAULT '10',
      rest_seconds INTEGER DEFAULT 60,
      description TEXT,
      order_index INTEGER DEFAULT 0
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS user_trainings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      training_id INTEGER NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
      assigned_at TIMESTAMP DEFAULT NOW(),
      status TEXT DEFAULT 'active',
      notes TEXT
    )
  `);

  await seedAdminUser();
  await seedDemoData();
}

async function seedAdminUser() {
  const { rows } = await query('SELECT id FROM users WHERE email = $1', ['admin@gym-alex.ru']);
  if (rows.length === 0) {
    const hash = bcrypt.hashSync('admin123', 10);
    await query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
      ['Алексей Голубев', 'admin@gym-alex.ru', hash, 'admin']
    );
  }
}

async function seedDemoData() {
  const { rows: newsRows } = await query('SELECT COUNT(*) as cnt FROM news');
  if (parseInt(newsRows[0].cnt) === 0) {
    const newsItems = [
      { title: 'Добро пожаловать! Я — Алексей Голубев, МС по русскому жиму', content: 'Привет! Я Алексей Голубев — Мастер спорта по русскому жиму. Тренирую спортсменов от новичков до соревновательного уровня. На этом сайте вы найдёте тренировочные программы по жиму лёжа, полезные материалы по технике и силовой подготовке. Поехали!', image_url: null },
      { title: 'Что такое русский жим и почему это круто', content: 'Русский жим — это жим штанги лёжа на максимальное количество повторений с фиксированным весом (как правило, 80% от веса спортсмена). Дисциплина требует сочетания взрывной силы и выносливости. Именно это делает её такой зрелищной и сложной. Спортсмен должен не просто поднять вес — он должен делать это снова и снова, сохраняя технику. Я сам прошёл путь от первого робкого жима до звания Мастера спорта и знаю, что реально работает.', image_url: null },
      { title: 'Постановка техники жима лёжа: 5 ключевых точек', content: '1. Хват — чуть шире плеч, большой палец обхватывает гриф. 2. Сведение лопаток — грудь вперёд, плечи назад и вниз. 3. Прогиб в пояснице — естественный, не экстремальный. 4. Ноги на полу — создают жёсткую платформу, помогают стабилизировать тело. 5. Траектория грифа — лёгкая дуга от нижней части груди к точке над плечами. Первые три месяца работаем только над техникой — это фундамент всего дальнейшего прогресса.', image_url: null },
      { title: 'Питание для жима: просто и по делу', content: 'Силовая работа требует топлива. Белок — 2 г на кг веса тела: куриная грудка, творог, яйца, рыба. Углеводы перед тренировкой — гречка, рис, овсянка. После тренировки — быстрые углеводы + белок (например, банан и творог). Главное правило: не дефицит калорий, если цель — силовой прогресс. Дефицит убивает рост результатов.', image_url: null },
    ];
    for (const n of newsItems) {
      await query('INSERT INTO news (title, content, image_url) VALUES ($1, $2, $3)', [n.title, n.content, n.image_url]);
    }
  }

  const { rows: prodRows } = await query('SELECT COUNT(*) as cnt FROM products');
  if (parseInt(prodRows[0].cnt) === 0) {
    const products = [
      { name: 'Персональная консультация (1 час)', description: 'Разбор техники жима, анализ слабых мест, составление индивидуального плана. Онлайн или в зале.', price: 2500, category: 'services', stock: 999 },
      { name: 'Подготовка к соревнованиям по русскому жиму', description: 'Полный цикл подготовки к старту: пиковая программа, выход на пик формы, подбор весовой категории. 8 недель.', price: 12000, category: 'services', stock: 999 },
      { name: 'Онлайн-тренинг — 1 месяц', description: 'Персональная программа на месяц + обратная связь по видео технике + корректировки по ходу. Для тех, кто не в Москве.', price: 5500, category: 'subscription', stock: 999 },
      { name: 'Абонемент — 8 персональных тренировок', description: 'Восемь тренировок в зале под личным руководством. Срок действия — 2 месяца.', price: 14000, category: 'subscription', stock: 50 },
      { name: 'Лямки для жима', description: 'Профессиональные кистевые лямки для тяжёлой силовой работы. Хлопок + кожаный кончик.', price: 850, category: 'equipment', stock: 30 },
      { name: 'Кистевые бинты (пара)', description: 'Жёсткие бинты для поддержки запястий при максимальных весах. Длина 50 см.', price: 690, category: 'equipment', stock: 40 },
      { name: 'Дневник силовых тренировок', description: 'Специализированный дневник для записи жима: веса, повторения, самочувствие. Формат A5, 100 страниц.', price: 790, category: 'accessories', stock: 60 },
    ];
    for (const p of products) {
      await query('INSERT INTO products (name, description, price, category, stock) VALUES ($1, $2, $3, $4, $5)', [p.name, p.description, p.price, p.category, p.stock]);
    }
  }

  const { rows: trainRows } = await query('SELECT COUNT(*) as cnt FROM trainings');
  if (parseInt(trainRows[0].cnt) === 0) {
    const { rows: t1 } = await query(
      'INSERT INTO trainings (title, description, difficulty, duration_weeks) VALUES ($1, $2, $3, $4) RETURNING id',
      ['Жим лёжа для начинающих', 'Базовый курс для тех, кто только начинает жать. Первые 4 недели — исключительно постановка техники с лёгким весом. Безопасно, системно, эффективно.', 'beginner', 4]
    );
    const { rows: t2 } = await query(
      'INSERT INTO trainings (title, description, difficulty, duration_weeks) VALUES ($1, $2, $3, $4) RETURNING id',
      ['Рост силового максимума', 'Программа для увеличения одноповторного максимума (1RM) в жиме лёжа. Волнообразная периодизация, тяжёлые синглы и трипли, вспомогательные движения. Для атлетов со стажем от 1 года.', 'intermediate', 8]
    );
    const { rows: t3 } = await query(
      'INSERT INTO trainings (title, description, difficulty, duration_weeks) VALUES ($1, $2, $3, $4) RETURNING id',
      ['Подготовка к русскому жиму', 'Специализированная программа для соревновательного русского жима. Работа на многоповторный жим с соревновательным весом, развитие силовой выносливости, предстартовая подводка.', 'advanced', 10]
    );

    const exercises1 = [
      { name: 'Жим пустого грифа', sets: 4, reps: '15', rest_seconds: 60, description: 'Изучаем траекторию: опускаем на нижнюю часть груди, локти 45° к телу, лопатки сведены' },
      { name: 'Жим с лёгким весом (40–50% от ПМ)', sets: 4, reps: '10', rest_seconds: 90, description: 'Работаем над стабильностью. Опускаем медленно (3 сек вниз), пауза на груди 1 сек, взрывной жим вверх' },
      { name: 'Отжимания с паузой на груди', sets: 3, reps: '8', rest_seconds: 60, description: 'Чувствуем растяжку грудных, учим включать их в нижней точке' },
      { name: 'Тяга гантелей лёжа (пуловер)', sets: 3, reps: '12', rest_seconds: 60, description: 'Раскрываем грудную клетку, укрепляем мышцы-антагонисты' },
      { name: 'Планка', sets: 3, reps: '40 сек', rest_seconds: 45, description: 'Базовая стабилизация кора — напрямую влияет на жёсткость в жиме' },
    ];
    const exercises2 = [
      { name: 'Жим лёжа (тяжёлый)', sets: 5, reps: '3', rest_seconds: 180, description: 'Рабочий вес 85–90% от ПМ. Полная амплитуда, максимальная скорость подъёма' },
      { name: 'Жим лёжа (объём)', sets: 4, reps: '6', rest_seconds: 120, description: 'Рабочий вес 75–80%. Строгая техника, контроль на негативе' },
      { name: 'Жим с паузой 2 сек на груди', sets: 3, reps: '5', rest_seconds: 120, description: 'Убивает инерцию, развивает взрывную силу со старта' },
      { name: 'Тяга штанги в наклоне', sets: 4, reps: '8', rest_seconds: 90, description: 'Спина — основа жима. Тянем к поясу, лопатки в конце движения' },
      { name: 'Разводка гантелей лёжа', sets: 3, reps: '12', rest_seconds: 75, description: 'Изолируем грудные, восстанавливаем кровоток после тяжёлой работы' },
      { name: 'Трицепс на блоке', sets: 3, reps: '15', rest_seconds: 60, description: 'Трицепс — главный «дожиматель». Работаем в пампинг-режиме' },
    ];
    const exercises3 = [
      { name: 'Жим с соревновательным весом (объём)', sets: 6, reps: '5', rest_seconds: 120, description: 'Соревновательный вес (80% от веса тела). Нарабатываем уверенность с рабочим весом' },
      { name: 'Жим 70% — многоповторка', sets: 3, reps: '20', rest_seconds: 180, description: 'Развиваем силовую выносливость. Темп равномерный, без читинга' },
      { name: 'Жим с паузой на груди', sets: 4, reps: '6', rest_seconds: 120, description: '2 секунды паузы — учим старт из мёртвой точки, ключевой навык русского жима' },
      { name: 'Тяга верхнего блока широким хватом', sets: 4, reps: '10', rest_seconds: 75, description: 'Укрепляем широчайшие — они создают «полку» для лопаток и стабилизируют жим' },
      { name: 'Французский жим лёжа', sets: 3, reps: '12', rest_seconds: 60, description: 'Длинная голова трицепса — критически важна для дожима в конце подхода' },
      { name: 'Отжимания в упоре сзади', sets: 3, reps: '15', rest_seconds: 60, description: 'Закачиваем трицепс в многоповторном режиме, имитируем усталость соревновательного подхода' },
    ];

    const insertExercises = async (trainingId, exercises) => {
      for (let i = 0; i < exercises.length; i++) {
        const e = exercises[i];
        await query(
          'INSERT INTO exercises (training_id, name, sets, reps, rest_seconds, description, order_index) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [trainingId, e.name, e.sets, e.reps, e.rest_seconds, e.description, i]
        );
      }
    };

    await insertExercises(t1[0].id, exercises1);
    await insertExercises(t2[0].id, exercises2);
    await insertExercises(t3[0].id, exercises3);
  }
}

async function closeDb() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = { setupDatabase, getPool, query, closeDb };
