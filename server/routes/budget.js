const express = require('express');
const { db } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all budgets
router.get('/', authenticateToken, (req, res) => {
  const { title, startDate, endDate } = req.query;
  
  let query = 'SELECT * FROM budget WHERE user_id = ?';
  let params = [req.user.userId];

  if (startDate) {
    query += ' AND date >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND date <= ?';
    params.push(endDate);
  }
 
  if (title) {
    query += ' WHERE title = ?';
    params.push(title);
  }

  query += ' ORDER BY date';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

router.post('/', authenticateToken, (req, res) => {
  const { title, amount, description, date } = req.query;
  
  if (!title || !amount || !date) {
    return res.status(400).json({ error: 'Type, amount, and date are required' });
  }

  if (amount <= 0) {
    return res.status(400).json({ error: 'Amount must be positive' });
  }

  db.run(
    `INSERT INTO budget (user_id, title, amount, description, date) 
      VALUES (?, ?, ?, ?, ?)`,
      [req.user.userId, type, amount, description || '', date],
      function(err) {
        if (err) {
          return res.status(500).json({ error: `Failed to add budget` });
        }

        db.get(`
          SELECT * from transactions where id = ?
          `, [this.lastID], (err, row) => {
            if (err) {
              return res.status(500).json({ error: `Database error` });
            }
            res.status(201).json(row);
          });
      }
  );
});

router.delete(`/:id`, authenticateToken, (req, res) => {
  const budgetId = req.params.id;
  db.run(
    'DELETE FROM budget WHERE id = ? AND user_id = ?',
    [budgetId, req.user.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Budget not found' });
      }
      res.json({ message: 'Transaction deleted successfully' });
    }
  );
});


module.exports = router;
