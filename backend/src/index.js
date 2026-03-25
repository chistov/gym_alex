require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { setupDatabase } = require('./db/setup');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const newsRoutes = require('./routes/news');
const productsRoutes = require('./routes/products');
const trainingsRoutes = require('./routes/trainings');
const userTrainingsRoutes = require('./routes/userTrainings');

const app = express();
const PORT = process.env.PORT || 3001;

// DB initialization (lazy, once per cold start)
let dbReady = false;
app.use(async (req, res, next) => {
  if (!dbReady) {
    try {
      await setupDatabase();
      dbReady = true;
    } catch (err) {
      console.error('DB setup error:', err);
      return res.status(500).json({ message: 'Database initialization failed' });
    }
  }
  next();
});

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/trainings', trainingsRoutes);
app.use('/api/user-trainings', userTrainingsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Admin: admin@gym-alex.ru / admin123`);
  });
}

module.exports = app;
