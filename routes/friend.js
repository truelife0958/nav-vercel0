const express = require('express');
const db = require('../db-postgres');
const auth = require('./authMiddleware');
const router = express.Router();

// 获取友链
router.get('/', async (req, res) => {
  try {
    const { page, pageSize } = req.query;
    if (!page && !pageSize) {
      const rows = await db.all('SELECT * FROM friends', []);
      res.json(rows);
    } else {
      const pageNum = parseInt(page) || 1;
      const size = parseInt(pageSize) || 10;
      const offset = (pageNum - 1) * size;
      
      const countRow = await db.get('SELECT COUNT(*) as total FROM friends', []);
      const rows = await db.all('SELECT * FROM friends LIMIT ? OFFSET ?', [size, offset]);
      
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

// 新增友链
router.post('/', auth, async (req, res) => {
  try {
    const { title, url, logo } = req.body;
    const result = await db.run('INSERT INTO friends (title, url, logo) VALUES (?, ?, ?)', [title, url, logo]);
    res.json({ id: result.lastID });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// 修改友链
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, url, logo } = req.body;
    const result = await db.run('UPDATE friends SET title=?, url=?, logo=? WHERE id=?', [title, url, logo, req.params.id]);
    res.json({ changed: result.changes });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// 删除友链
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await db.run('DELETE FROM friends WHERE id=?', [req.params.id]);
    res.json({ deleted: result.changes });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

module.exports = router;