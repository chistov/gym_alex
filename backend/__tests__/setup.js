// Test setup: requires DATABASE_URL env var pointing to a test PostgreSQL database
// Example: DATABASE_URL=postgresql://user:pass@localhost/gym_alex_test

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required for tests. Set it to a test PostgreSQL database.');
  process.exit(1);
}

process.env.JWT_SECRET = 'test_secret';
process.env.NODE_ENV = 'test';

const { setupDatabase, closeDb, query } = require('../src/db/setup');

async function cleanDatabase() {
  await query('DELETE FROM user_trainings');
  await query('DELETE FROM exercises');
  await query('DELETE FROM trainings');
  await query('DELETE FROM products');
  await query('DELETE FROM news');
  await query('DELETE FROM users');
}

module.exports = { setupDatabase, closeDb, cleanDatabase, query };
