const express = require('express');
const db = require('../db-switch');
const auth = require('./authMiddleware');
const router = express.Router();

// 获取广告
router.get('/', async (req, res) => {
  try {
    const { page, pageSize } = req.query;
    if (!page && !pageSize) {
      const rows = await db.all('SELECT * FROM ads', []);
      res.json(rows);
    } else {
      const pageNum = parseInt(page) || 1;
      const size = parseInt(pageSize) || 10;
      const offset = (pageNum - 1) * size;
      
      const countRow = await db.get('SELECT COUNT(*) as total FROM ads', []);
      const rows = await db.all('SELECT * FROM ads LIMIT ? OFFSET ?', [size, offset]);
      
      res.json({
        total: countRow.total,
        page: pageNum,
        pageSize: size,
        data: rows
      });
    }
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// 新增广告
router.post('/', auth, async (req, res) => {
  try {
    const { position, img, url } = req.body;
    const result = await db.run('INSERT INTO ads (position, img, url) VALUES (?, ?, ?)', [position, img, url]);
    res.json({ id: result.lastID });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// 修改广告
router.put('/:id', auth, async (req, res) => {
  try {
    const { img, url } = req.body;
    const result = await db.run('UPDATE ads SET img=?, url=? WHERE id=?', [img, url, req.params.id]);
    res.json({ changed: result.changes });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// 删除广告
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await db.run('DELETE FROM ads WHERE id=?', [req.params.id]);
    res.json({ deleted: result.changes });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

module.exports = router;