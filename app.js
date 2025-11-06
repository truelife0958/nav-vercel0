const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const menuRoutes = require('./routes/menu');
const cardRoutes = require('./routes/card');
const uploadRoutes = require('./routes/upload');
const authRoutes = require('./routes/auth');
const adRoutes = require('./routes/ad');
const friendRoutes = require('./routes/friend');
const userRoutes = require('./routes/user');
const settingsRoutes = require('./routes/settings');
const initRoutes = require('./routes/init');
const debugRoutes = require('./routes/debug');
const resetRoutes = require('./routes/reset');
const createAdminRoutes = require('./routes/create-admin');
const exportRoutes = require('./routes/export');
const statsRoutes = require('./routes/stats');
const compression = require('compression');
const app = express();

const PORT = process.env.PORT || 3000;

// 安全性中间件 - Helmet
app.use(helmet({
  contentSecurityPolicy: false, // 根据需要配置CSP
  crossOriginEmbedderPolicy: false
}));

// CORS配置 - 根据环境变量限制允许的域名
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: function(origin, callback) {
    // 允许没有origin的请求（如移动应用或curl）
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1 && process.env.NODE_ENV === 'production') {
      const msg = 'CORS policy: Origin not allowed';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Rate Limiting - 防止暴力攻击
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15分钟
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 限制100个请求
  message: '请求过于频繁，请稍后再试',
  standardHeaders: true,
  legacyHeaders: false,
});

// 对API路由应用rate limiting
app.use('/api/', limiter);

// 登录端点使用更严格的限制
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 限制5次登录尝试
  message: '登录尝试过多，请15分钟后再试',
  skipSuccessfulRequests: true
});

app.use('/api/login', loginLimiter);

app.use(express.json({ limit: '10mb' })); // 限制请求体大小
app.use(compression());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'web/dist')));

app.use((req, res, next) => {
  if (
    req.method === 'GET' &&
    !req.path.startsWith('/api') &&
    !req.path.startsWith('/uploads') &&
    !fs.existsSync(path.join(__dirname, 'web/dist', req.path))
  ) {
    res.sendFile(path.join(__dirname, 'web/dist', 'index.html'));
  } else {
    next();
  }
});

app.use('/api/menus', menuRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', authRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/init', initRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/reset', resetRoutes);
app.use('/api/create-admin', createAdminRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/stats', statsRoutes);

// Vercel serverless 导出
module.exports = app;

// 本地开发时启动服务器
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`server is running at http://localhost:${PORT}`);
  });
}