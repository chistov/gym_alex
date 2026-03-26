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
  // All tables in a single query — one round trip
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
    );
    CREATE TABLE IF NOT EXISTS news (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      published INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
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
    );
    CREATE TABLE IF NOT EXISTS trainings (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      difficulty TEXT DEFAULT 'beginner',
      duration_weeks INTEGER DEFAULT 4,
      image_url TEXT,
      published INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS exercises (
      id SERIAL PRIMARY KEY,
      training_id INTEGER NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      sets INTEGER DEFAULT 3,
      reps TEXT DEFAULT '10',
      rest_seconds INTEGER DEFAULT 60,
      description TEXT,
      order_index INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS user_trainings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      training_id INTEGER NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
      assigned_at TIMESTAMP DEFAULT NOW(),
      status TEXT DEFAULT 'active',
      notes TEXT
    );
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
  // Check all counts in one query
  const { rows: counts } = await query(`
    SELECT
      (SELECT COUNT(*) FROM news) as news_cnt,
      (SELECT COUNT(*) FROM products) as products_cnt,
      (SELECT COUNT(*) FROM trainings) as trainings_cnt
  `);
  const { news_cnt, products_cnt, trainings_cnt } = counts[0];

  if (parseInt(news_cnt) === 0) {
    await query(`
      INSERT INTO news (title, content) VALUES
      ('Добро пожаловать! Я — Алексей Голубев, МС по русскому жиму', 'Привет! Я Алексей Голубев — Мастер спорта по русскому жиму. Тренирую спортсменов от новичков до соревновательного уровня. На этом сайте вы найдёте тренировочные программы по жиму лёжа, полезные материалы по технике и силовой подготовке. Поехали!'),
      ('Что такое русский жим и почему это круто', 'Русский жим — это жим штанги лёжа на максимальное количество повторений с фиксированным весом (как правило, 80% от веса спортсмена). Дисциплина требует сочетания взрывной силы и выносливости. Именно это делает её такой зрелищной и сложной. Спортсмен должен не просто поднять вес — он должен делать это снова и снова, сохраняя технику. Я сам прошёл путь от первого робкого жима до звания Мастера спорта и знаю, что реально работает.'),
      ('Постановка техники жима лёжа: 5 ключевых точек', '1. Хват — чуть шире плеч, большой палец обхватывает гриф. 2. Сведение лопаток — грудь вперёд, плечи назад и вниз. 3. Прогиб в пояснице — естественный, не экстремальный. 4. Ноги на полу — создают жёсткую платформу, помогают стабилизировать тело. 5. Траектория грифа — лёгкая дуга от нижней части груди к точке над плечами. Первые три месяца работаем только над техникой — это фундамент всего дальнейшего прогресса.'),
      ('Питание для жима: просто и по делу', 'Силовая работа требует топлива. Белок — 2 г на кг веса тела: куриная грудка, творог, яйца, рыба. Углеводы перед тренировкой — гречка, рис, овсянка. После тренировки — быстрые углеводы + белок (например, банан и творог). Главное правило: не дефицит калорий, если цель — силовой прогресс. Дефицит убивает рост результатов.')
    `);
  }

  if (parseInt(products_cnt) === 0) {
    await query(`
      INSERT INTO products (name, description, price, category, stock) VALUES
      ('Персональная консультация (1 час)', 'Разбор техники жима, анализ слабых мест, составление индивидуального плана. Онлайн или в зале.', 2500, 'services', 999),
      ('Подготовка к соревнованиям по русскому жиму', 'Полный цикл подготовки к старту: пиковая программа, выход на пик формы, подбор весовой категории. 8 недель.', 12000, 'services', 999),
      ('Онлайн-тренинг — 1 месяц', 'Персональная программа на месяц + обратная связь по видео технике + корректировки по ходу. Для тех, кто не в Москве.', 5500, 'subscription', 999),
      ('Абонемент — 8 персональных тренировок', 'Восемь тренировок в зале под личным руководством. Срок действия — 2 месяца.', 14000, 'subscription', 50),
      ('Лямки для жима', 'Профессиональные кистевые лямки для тяжёлой силовой работы. Хлопок + кожаный кончик.', 850, 'equipment', 30),
      ('Кистевые бинты (пара)', 'Жёсткие бинты для поддержки запястий при максимальных весах. Длина 50 см.', 690, 'equipment', 40),
      ('Дневник силовых тренировок', 'Специализированный дневник для записи жима: веса, повторения, самочувствие. Формат A5, 100 страниц.', 790, 'accessories', 60)
    `);
  }

  if (parseInt(trainings_cnt) === 0) {
    const { rows } = await query(`
      INSERT INTO trainings (title, description, difficulty, duration_weeks) VALUES
      ('Жим лёжа для начинающих', 'Базовый курс для тех, кто только начинает жать. Первые 4 недели — исключительно постановка техники с лёгким весом. Безопасно, системно, эффективно.', 'beginner', 4),
      ('Рост силового максимума', 'Программа для увеличения одноповторного максимума (1RM) в жиме лёжа. Волнообразная периодизация, тяжёлые синглы и трипли, вспомогательные движения. Для атлетов со стажем от 1 года.', 'intermediate', 8),
      ('Подготовка к русскому жиму', 'Специализированная программа для соревновательного русского жима. Работа на многоповторный жим с соревновательным весом, развитие силовой выносливости, предстартовая подводка.', 'advanced', 10)
      RETURNING id
    `);

    const t1Id = rows[0].id;
    const t2Id = rows[1].id;
    const t3Id = rows[2].id;

    await query(`
      INSERT INTO exercises (training_id, name, sets, reps, rest_seconds, description, order_index) VALUES
      ($1, 'Жим пустого грифа', 4, '15', 60, 'Изучаем траекторию: опускаем на нижнюю часть груди, локти 45° к телу, лопатки сведены', 0),
      ($1, 'Жим с лёгким весом (40–50% от ПМ)', 4, '10', 90, 'Работаем над стабильностью. Опускаем медленно (3 сек вниз), пауза на груди 1 сек, взрывной жим вверх', 1),
      ($1, 'Отжимания с паузой на груди', 3, '8', 60, 'Чувствуем растяжку грудных, учим включать их в нижней точке', 2),
      ($1, 'Тяга гантелей лёжа (пуловер)', 3, '12', 60, 'Раскрываем грудную клетку, укрепляем мышцы-антагонисты', 3),
      ($1, 'Планка', 3, '40 сек', 45, 'Базовая стабилизация кора — напрямую влияет на жёсткость в жиме', 4)
    `, [t1Id]);

    await query(`
      INSERT INTO exercises (training_id, name, sets, reps, rest_seconds, description, order_index) VALUES
      ($1, 'Жим лёжа (тяжёлый)', 5, '3', 180, 'Рабочий вес 85–90% от ПМ. Полная амплитуда, максимальная скорость подъёма', 0),
      ($1, 'Жим лёжа (объём)', 4, '6', 120, 'Рабочий вес 75–80%. Строгая техника, контроль на негативе', 1),
      ($1, 'Жим с паузой 2 сек на груди', 3, '5', 120, 'Убивает инерцию, развивает взрывную силу со старта', 2),
      ($1, 'Тяга штанги в наклоне', 4, '8', 90, 'Спина — основа жима. Тянем к поясу, лопатки в конце движения', 3),
      ($1, 'Разводка гантелей лёжа', 3, '12', 75, 'Изолируем грудные, восстанавливаем кровоток после тяжёлой работы', 4),
      ($1, 'Трицепс на блоке', 3, '15', 60, 'Трицепс — главный дожиматель. Работаем в пампинг-режиме', 5)
    `, [t2Id]);

    await query(`
      INSERT INTO exercises (training_id, name, sets, reps, rest_seconds, description, order_index) VALUES
      ($1, 'Жим с соревновательным весом (объём)', 6, '5', 120, 'Соревновательный вес (80% от веса тела). Нарабатываем уверенность с рабочим весом', 0),
      ($1, 'Жим 70% — многоповторка', 3, '20', 180, 'Развиваем силовую выносливость. Темп равномерный, без читинга', 1),
      ($1, 'Жим с паузой на груди', 4, '6', 120, '2 секунды паузы — учим старт из мёртвой точки, ключевой навык русского жима', 2),
      ($1, 'Тяга верхнего блока широким хватом', 4, '10', 75, 'Укрепляем широчайшие — они создают полку для лопаток и стабилизируют жим', 3),
      ($1, 'Французский жим лёжа', 3, '12', 60, 'Длинная голова трицепса — критически важна для дожима в конце подхода', 4),
      ($1, 'Отжимания в упоре сзади', 3, '15', 60, 'Закачиваем трицепс в многоповторном режиме, имитируем усталость соревновательного подхода', 5)
    `, [t3Id]);
  }
}

async function closeDb() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = { setupDatabase, getPool, query, closeDb };
