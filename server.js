import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

const db = new Database(path.join(__dirname, 'worktimer.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    duration INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/sessions', (req, res) => {
  const sessions = db.prepare(`
    SELECT id, task, start_time, end_time, duration, created_at 
    FROM sessions 
    ORDER BY created_at DESC 
    LIMIT 100
  `).all();
  res.json(sessions);
});

app.post('/api/sessions', (req, res) => {
  const { task, startTime, endTime, duration } = req.body;
  
  const stmt = db.prepare(`
    INSERT INTO sessions (task, start_time, end_time, duration) 
    VALUES (?, ?, ?, ?)
  `);
  
  const result = stmt.run(task || 'Unspecified', startTime, endTime, duration);
  res.json({ id: result.lastInsertRowid, success: true });
});

app.delete('/api/sessions/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM sessions WHERE id = ?');
  stmt.run(req.params.id);
  res.json({ success: true });
});

app.get('/api/stats', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  const todayTotal = db.prepare(`
    SELECT COALESCE(SUM(duration), 0) as total 
    FROM sessions 
    WHERE date(created_at) = date(?)
  `).get(today);
  
  const weekTotal = db.prepare(`
    SELECT COALESCE(SUM(duration), 0) as total 
    FROM sessions 
    WHERE created_at >= datetime('now', '-7 days')
  `).get();
  
  const allTimeTotal = db.prepare(`
    SELECT COALESCE(SUM(duration), 0) as total FROM sessions
  `).get();
  
  res.json({
    today: todayTotal.total,
    week: weekTotal.total,
    allTime: allTimeTotal.total
  });
});

app.listen(PORT, () => {
  console.log(`Work Timer running at http://localhost:${PORT}`);
});
