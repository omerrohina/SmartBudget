const express = require('express');
const { db } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all categories
router.get('/', authenticateToken, (req, res) => {
  const { type } = req.query;
  
  let query = 'SELECT * FROM categories';
  let params = [];

  if (type) {
    query += ' WHERE type = ?';
    params.push(type);
  }

  query += ' ORDER BY name';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

router.get('/counts', authenticateToken, (req, res) => {
  const { startDate, endDate } = req.query;
  
  let query = 'SELECT category, COUNT(*) as count FROM transactions WHERE user_id = ?';
  let params = [req.user.userId];

  if (startDate) {
    query += ' AND date >= ?';
    params.push(startDate);
  }
  
  if (endDate) {
    query += ' AND date <= ?';
    params.push(endDate);
  }

  query += ' GROUP BY category';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    const summary = {
      income: 0,
      expense: 0,
      balance: 0
    };

    rows.forEach(row => {
      summary[row.type] = parseFloat(row.total) || 0;
    });

    summary.balance = summary.income - summary.expense;

    res.json(rows);
  });
});

module.exports = router;
