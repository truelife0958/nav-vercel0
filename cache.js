// Redis缓存模块 - 支持可选的Redis缓存
const redis = require('redis');

class CacheManager {
  constructor() {
    this.client = null;
    this.enabled = false;
    this.memoryCache = new Map(); // 内存缓存作为后备
    this.memoryCacheTimeout = new Map(); // 内存缓存超时管理
    
    // 尝试连接Redis（如果配置了）
    if (process.env.REDIS_URL) {
      this.initRedis();
    } else {
      console.log('📦 使用内存缓存（未配置Redis）');
    }
  }
  
  async initRedis() {
    try {
      this.client = redis.createClient({
        url: process.env.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 3) {
              console.log('❌ Redis连接失败，切换到内存缓存');
              this.enabled = false;
              return false;
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });
      
      this.client.on('error', (err) => {
        console.error('Redis错误:', err);
        this.enabled = false;
      });
      
      this.client.on('connect', () => {
        console.log('✅ Redis已连接');
        this.enabled = true;
      });
      
      await this.client.connect();
    } catch (err) {
      console.error('Redis初始化失败:', err);
      this.enabled = false;
    }
  }
  
  // 获取缓存
  async get(key) {
    try {
      if (this.enabled && this.client) {
        const value = await this.client.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        // 使用内存缓存
        const cached = this.memoryCache.get(key);
        if (cached) {
          const timeout = this.memoryCacheTimeout.get(key);
          if (timeout && Date.now() < timeout) {
            return cached;
          } else {
            this.memoryCache.delete(key);
            this.memoryCacheTimeout.delete(key);
          }
        }
        return null;
      }
    } catch (err) {
      console.error('缓存读取失败:', err);
      return null;
    }
  }
  
  // 设置缓存
  async set(key, value, expirySeconds = 300) {
    try {
      if (this.enabled && this.client) {
        await this.client.setEx(key, expirySeconds, JSON.stringify(value));
      } else {
        // 使用内存缓存
        this.memoryCache.set(key, value);
        this.memoryCacheTimeout.set(key, Date.now() + expirySeconds * 1000);
        
        // 清理过期缓存
        this.cleanupMemoryCache();
      }
    } catch (err) {
      console.error('缓存写入失败:', err);
    }
  }
  
  // 删除缓存
  async del(key) {
    try {
      if (this.enabled && this.client) {
        await this.client.del(key);
      } else {
        this.memoryCache.delete(key);
        this.memoryCacheTimeout.delete(key);
      }
    } catch (err) {
      console.error('缓存删除失败:', err);
    }
  }
  
  // 删除匹配的缓存键
  async delPattern(pattern) {
    try {
      if (this.enabled && this.client) {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(keys);
        }
      } else {
        // 内存缓存模式匹配删除
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        for (const key of this.memoryCache.keys()) {
          if (regex.test(key)) {
            this.memoryCache.delete(key);
            this.memoryCacheTimeout.delete(key);
          }
        }
      }
    } catch (err) {
      console.error('批量删除缓存失败:', err);
    }
  }
  
  // 清空所有缓存
  async flush() {
    try {
      if (this.enabled && this.client) {
        await this.client.flushAll();
      } else {
        this.memoryCache.clear();
        this.memoryCacheTimeout.clear();
      }
    } catch (err) {
      console.error('清空缓存失败:', err);
    }
  }
  
  // 清理过期的内存缓存
  cleanupMemoryCache() {
    const now = Date.now();
    for (const [key, timeout] of this.memoryCacheTimeout.entries()) {
      if (now >= timeout) {
        this.memoryCache.delete(key);
        this.memoryCacheTimeout.delete(key);
      }
    }
    
    // 限制内存缓存大小
    if (this.memoryCache.size > 1000) {
      const keys = Array.from(this.memoryCache.keys());
      const toDelete = keys.slice(0, 200); // 删除最旧的200个
      toDelete.forEach(key => {
        this.memoryCache.delete(key);
        this.memoryCacheTimeout.delete(key);
      });
    }
  }
  
  // 关闭连接
  async close() {
    if (this.client) {
      await this.client.quit();
    }
  }
}

// 创建全局缓存实例
const cache = new CacheManager();

// 缓存中间件 - 用于路由
const cacheMiddleware = (keyPrefix, expirySeconds = 300) => {
  return async (req, res, next) => {
    const cacheKey = `${keyPrefix}:${req.originalUrl}`;
    
    try {
      const cached = await cache.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }
      
      // 保存原始的res.json方法
      const originalJson = res.json.bind(res);
      
      // 重写res.json以缓存响应
      res.json = function(data) {
        cache.set(cacheKey, data, expirySeconds).catch(err => {
          console.error('缓存响应失败:', err);
        });
        return originalJson(data);
      };
      
      next();
    } catch (err) {
      console.error('缓存中间件错误:', err);
      next();
    }
  };
};

module.exports = {
  cache,
  cacheMiddleware
};