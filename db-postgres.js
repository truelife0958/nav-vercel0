// Vercel PostgreSQL 数据库适配器
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const config = require('./config');

// 创建 PostgreSQL 连接池
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// 初始化状态跟踪
let initPromise = null;
let isInitialized = false;

// 初始化数据库表
async function initDatabase() {
  console.log('🔧 initDatabase() 被调用');
  console.log('连接字符串:', process.env.POSTGRES_URL ? '已设置' : '未设置');
  
  const client = await pool.connect();
  console.log('✓ 数据库连接成功');
  
  try {
    await client.query('BEGIN');
    console.log('✓ 事务开始');
    
    // 创建菜单表
    await client.query(`
      CREATE TABLE IF NOT EXISTS menus (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0
      )
    `);
    console.log('✓ menus 表创建完成');
    await client.query('CREATE INDEX IF NOT EXISTS idx_menus_order ON menus(sort_order)');
    
    // 创建子菜单表
    await client.query(`
      CREATE TABLE IF NOT EXISTS sub_menus (
        id SERIAL PRIMARY KEY,
        parent_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        FOREIGN KEY(parent_id) REFERENCES menus(id) ON DELETE CASCADE
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_sub_menus_parent_id ON sub_menus(parent_id)`);
    console.log('✓ sub_menus 表创建完成');
    await client.query('CREATE INDEX IF NOT EXISTS idx_sub_menus_order ON sub_menus(sort_order)');
    
    // 创建卡片表
    await client.query(`
      CREATE TABLE IF NOT EXISTS cards (
        id SERIAL PRIMARY KEY,
        menu_id INTEGER,
        sub_menu_id INTEGER,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        logo_url TEXT,
        custom_logo_path TEXT,
        description TEXT,
        sort_order INTEGER DEFAULT 0,
        FOREIGN KEY(menu_id) REFERENCES menus(id) ON DELETE CASCADE,
        FOREIGN KEY(sub_menu_id) REFERENCES sub_menus(id) ON DELETE CASCADE
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_cards_menu_id ON cards(menu_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_cards_sub_menu_id ON cards(sub_menu_id)`);
    console.log('✓ cards 表创建完成');
    await client.query('CREATE INDEX IF NOT EXISTS idx_cards_order ON cards(sort_order)');
    
    // 创建用户表
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        last_login_time TIMESTAMP,
        last_login_ip TEXT
      )
    `);
    console.log('✓ users 表创建完成');
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
    
    // 创建广告表
    await client.query(`
      CREATE TABLE IF NOT EXISTS ads (
        id SERIAL PRIMARY KEY,
        position TEXT NOT NULL,
        img TEXT NOT NULL,
        url TEXT NOT NULL
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_ads_position ON ads(position)`);
    
    // 创建友情链接表
    await client.query(`
      CREATE TABLE IF NOT EXISTS friends (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        logo TEXT
      )
    `);
    console.log('✓ friends 表创建完成');
    await client.query(`CREATE INDEX IF NOT EXISTS idx_friends_title ON friends(title)`);
    
    // 插入默认数据（在事务提交之前）
    await insertDefaultData(client);
    
    await client.query('COMMIT');
    
    console.log('✅ PostgreSQL 数据库初始化完成');
    isInitialized = true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  } finally {
    client.release();
  }
}

// 确保初始化完成
async function ensureInitialized() {
  if (isInitialized) {
    console.log('✓ 数据库已初始化');
    return;
  }
  
  console.log('⏳ 开始数据库初始化...');
  
  if (!initPromise) {
    initPromise = initDatabase();
  }
  
  try {
    await initPromise;
    console.log('✓ 数据库初始化完成');
  } catch (err) {
    console.error('❌ 数据库初始化失败:', err);
    throw err;
  }
}

// 插入默认数据
async function insertDefaultData(client) {
  try {
    // 检查菜单表是否为空
    const menuCount = await client.query('SELECT COUNT(*) as count FROM menus');
    if (parseInt(menuCount.rows[0].count) === 0) {
      const defaultMenus = [
        ['Home', 1],
        ['Ai Stuff', 2],
        ['Cloud', 3],
        ['Software', 4],
        ['Tools', 5],
        ['Other', 6]
      ];
      
      for (const [name, order] of defaultMenus) {
        await client.query('INSERT INTO menus (name, sort_order) VALUES ($1, $2)', [name, order]);
      }
      
      console.log('✅ 默认菜单插入完成');
    }
    
    // 检查用户表是否为空
    const userCount = await client.query('SELECT COUNT(*) as count FROM users');
    if (parseInt(userCount.rows[0].count) === 0) {
      const passwordHash = await bcrypt.hash(config.admin.password, 10);
      await client.query('INSERT INTO users (username, password) VALUES ($1, $2)', [
        config.admin.username,
        passwordHash
      ]);
      
      console.log('✅ 默认管理员账号创建完成');
    }
    
    // 检查友情链接表是否为空
    const friendCount = await client.query('SELECT COUNT(*) as count FROM friends');
    if (parseInt(friendCount.rows[0].count) === 0) {
      const defaultFriends = [
        ['Noodseek图床', 'https://www.nodeimage.com', 'https://www.nodeseek.com/static/image/favicon/favicon-32x32.png'],
        ['Font Awesome', 'https://fontawesome.com', 'https://fontawesome.com/favicon.ico']
      ];
      
      for (const [title, url, logo] of defaultFriends) {
        await client.query('INSERT INTO friends (title, url, logo) VALUES ($1, $2, $3)', [title, url, logo]);
      }
      
      console.log('✅ 默认友情链接插入完成');
    }
  } catch (error) {
    console.error('插入默认数据失败:', error);
  }
}

// 包装 SQLite 风格的 API
const db = {
  // 执行查询 (SELECT)
  all: async (sql, params = []) => {
    await ensureInitialized();
    let paramIndex = 1;
    const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
    console.log('db.all SQL:', pgSql);
    console.log('db.all params:', params);
    return pool.query(pgSql, params)
      .then(result => {
        console.log('db.all 返回行数:', result.rows.length);
        return result.rows;
      })
      .catch(err => {
        console.error('db.all 错误:', err.message);
        console.error('SQL:', pgSql);
        console.error('Params:', params);
        throw err;
      });
  },
  
  // 执行查询 (单行)
  get: async (sql, params = []) => {
    await ensureInitialized();
    let paramIndex = 1;
    const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
    console.log('db.get SQL:', pgSql);
    console.log('db.get params:', params);
    return pool.query(pgSql, params)
      .then(result => {
        console.log('db.get 返回:', result.rows[0]);
        return result.rows[0];
      })
      .catch(err => {
        console.error('db.get 错误:', err.message);
        console.error('SQL:', pgSql);
        console.error('Params:', params);
        throw err;
      });
  },
  
  // 执行更新/插入/删除
  run: async (sql, params = []) => {
    await ensureInitialized();
    // 将 ? 替换为 $1, $2, $3...
    let paramIndex = 1;
    const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
    
    return pool.query(pgSql, params)
      .then(result => ({
        lastID: result.rows[0]?.id,
        changes: result.rowCount
      }));
  },
  
  // 准备语句
  prepare: (sql) => {
    let paramIndex = 1;
    const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
    
    return {
      run: async (...params) => {
        const result = await pool.query(pgSql, params);
        return {
          lastID: result.rows[0]?.id,
          changes: result.rowCount
        };
      },
      finalize: () => Promise.resolve()
    };
  }
};

// 不再在模块加载时初始化，而是在第一次使用时初始化
// initDatabase().catch(console.error);

module.exports = db;