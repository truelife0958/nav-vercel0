// 数据库切换模块 - 根据环境变量自动选择SQLite或PostgreSQL
const usePostgres = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (usePostgres) {
  console.log('✅ 使用 PostgreSQL 数据库');
  module.exports = require('./db-postgres');
} else {
  console.log('✅ 使用 SQLite 数据库');
  module.exports = require('./db');
}