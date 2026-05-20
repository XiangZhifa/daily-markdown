import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'better-sqlite3',
  database: process.env.DB_PATH || 'data/database.sqlite',
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
  extra: {
    mode: 'WAL',
    busyTimeout: 5000,
  },
}));