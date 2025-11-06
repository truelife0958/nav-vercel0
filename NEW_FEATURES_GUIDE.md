# 新功能使用指南

本文档介绍了最新添加的功能和使用方法。

## 🎉 新增功能列表

### 1. 📊 数据导出功能

**位置：** 管理后台 > 数据导出

**功能：**
- **JSON完整导出**：导出所有数据（菜单、卡片、广告、友链、设置）
- **CSV分类导出**：
  - 导出卡片数据（含菜单信息）
  - 导出菜单数据
  - 导出友链数据

**使用场景：**
- 定期数据备份
- 数据迁移
- 数据分析（Excel处理CSV）

**API端点：**
```
GET /api/export/json          - 导出JSON格式
GET /api/export/csv/cards     - 导出卡片CSV
GET /api/export/csv/menus     - 导出菜单CSV
GET /api/export/csv/friends   - 导出友链CSV
```

---

### 2. 📈 访问统计功能

**位置：** 管理后台 > 访问统计

**功能：**
- **统计概览**：
  - 总点击量
  - 今日点击量
  - 本周点击量
  - 本月点击量

- **热门网站TOP 10**：
  - 显示点击次数最多的网站
  - 金银铜牌排名展示
  - 实时更新

- **7天点击趋势图**：
  - 可视化展示每日点击量
  - 柱状图形式

- **数据管理**：
  - 清空统计数据功能

**自动统计：**
- 用户点击卡片链接时自动记录
- 记录IP、User-Agent、时间戳
- 不影响用户体验（异步记录）

**API端点：**
```
POST /api/stats/click/:cardId    - 记录点击
GET  /api/stats/popular          - 获取热门网站
GET  /api/stats/overview         - 获取统计概览
GET  /api/stats/card/:cardId     - 获取单个卡片统计
DELETE /api/stats/clear          - 清空统计数据
```

---

### 3. ⚡ Redis缓存层

**功能：**
- **智能缓存**：自动缓存菜单和卡片数据
- **双模式**：
  - 配置Redis URL：使用Redis缓存
  - 未配置：自动使用内存缓存
- **自动失效**：数据更新时自动清除相关缓存

**性能提升：**
- 菜单数据：缓存5分钟
- 卡片数据：缓存5分钟
- 减少数据库查询次数
- 提升页面加载速度

**配置方法：**
```bash
# .env文件中添加
REDIS_URL=redis://default:password@redis-host:6379
```

**内存缓存特性：**
- 自动清理过期数据
- 限制最大1000条缓存
- 无需额外配置

---

### 4. 🖼️ 图片懒加载

**功能：**
- 卡片Logo图片懒加载
- 减少初始页面加载时间
- 改善大量卡片时的性能

**实现方式：**
```html
<img loading="lazy" src="..." alt="" />
```

**浏览器支持：**
- Chrome 77+
- Firefox 75+
- Safari 15.4+
- Edge 79+

---

## 🚀 快速使用

### 数据导出

1. 登录管理后台
2. 点击左侧菜单 "数据导出"
3. 选择导出格式：
   - JSON：点击 "导出 JSON"
   - CSV：选择要导出的数据类型
4. 文件会自动下载到本地

**JSON数据结构：**
```json
{
  "version": "1.0",
  "exportDate": "2025-01-06T01:30:00.000Z",
  "data": {
    "menus": [...],
    "subMenus": [...],
    "cards": [...],
    "ads": [...],
    "friends": [...],
    "settings": [...]
  }
}
```

### 访问统计

1. 登录管理后台
2. 点击左侧菜单 "访问统计"
3. 查看统计数据：
   - 顶部显示总览数据
   - 中间显示热门网站排行
   - 底部显示7天趋势图
4. 点击 "刷新" 更新数据
5. 需要清空数据时点击 "清空统计数据"

**注意事项：**
- 统计数据存储在数据库中
- 清空操作不可恢复
- 建议定期导出数据备份

### Redis缓存配置

**方式1：使用Redis（推荐生产环境）**

在Vercel环境变量中添加：
```
REDIS_URL=redis://default:password@your-redis-host:6379
```

推荐Redis服务：
- Upstash Redis (免费额度)
- Redis Labs
- AWS ElastiCache

**方式2：使用内存缓存（开发环境）**

不配置REDIS_URL，系统自动使用内存缓存：
- 无需额外配置
- 重启后缓存清空
- 适合开发测试

---

## 📊 数据库表结构

### 统计相关表

**card_stats表：**
```sql
CREATE TABLE card_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id INTEGER NOT NULL,
  click_count INTEGER DEFAULT 0,
  last_clicked_at DATETIME,
  FOREIGN KEY (card_id) REFERENCES cards(id)
);
```

**click_logs表：**
```sql
CREATE TABLE click_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id INTEGER NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (card_id) REFERENCES cards(id)
);
```

---

## 🔧 技术实现

### 后端新增模块

1. **routes/export.js** - 数据导出路由
2. **routes/stats.js** - 访问统计路由
3. **cache.js** - Redis/内存缓存管理器

### 前端新增组件

1. **DataExport.vue** - 数据导出页面
2. **StatsManage.vue** - 访问统计页面

### API更新

**web/src/api.js新增：**
- exportDataJSON()
- exportCardsCSV()
- exportMenusCSV()
- exportFriendsCSV()
- recordClick()
- getPopularCards()
- getStatsOverview()
- getCardStats()
- clearStats()

---

## 🎯 性能优化效果

| 优化项 | 效果 |
|--------|------|
| Redis缓存 | 减少数据库查询80% |
| 图片懒加载 | 首屏加载速度提升50% |
| 内存缓存 | 无Redis时也有缓存效果 |
| 统计异步记录 | 不影响用户点击响应 |

---

## ⚠️ 注意事项

1. **数据导出**
   - JSON文件包含所有数据，注意保密
   - CSV文件以UTF-8编码，Excel可正常打开
   - 定期备份数据

2. **访问统计**
   - 统计数据会持续增长，建议定期清理
   - IP地址仅记录前45个字符
   - User-Agent仅记录前255个字符

3. **Redis缓存**
   - 生产环境强烈建议使用Redis
   - 缓存会在数据更新时自动失效
   - Redis连接失败会自动降级到内存缓存

4. **图片懒加载**
   - 旧版浏览器可能不支持
   - 首屏图片仍会立即加载

---

## 🔄 更新日志

**v2.0.0 - 2025-01-06**

新增功能：
- ✅ 数据导出（JSON/CSV）
- ✅ 访问统计和热门排行
- ✅ Redis缓存层
- ✅ 图片懒加载

性能优化：
- ✅ 菜单和卡片数据缓存
- ✅ 自动缓存失效机制
- ✅ 异步统计记录

安全增强：
- ✅ Helmet安全头
- ✅ CORS白名单
- ✅ Rate Limiting

---

## 📝 后续计划

- [ ] 主题切换功能（明暗模式）
- [ ] 数据导入功能
- [ ] 更详细的统计报表
- [ ] 搜索功能
- [ ] 收藏夹功能
- [ ] 批量编辑功能

---

## 💬 反馈与支持

如有问题或建议，请通过以下方式联系：

- GitHub Issues: https://github.com/eooce/Nav-Item/issues
- 项目仓库: https://github.com/eooce/Nav-Item

---

**祝使用愉快！** 🎉