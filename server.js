const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

function generateId(prefix) {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
}

function mapProperty(row) {
  return { ...row, features: JSON.parse(row.features || '[]'), featured: row.featured === 1, createdAt: row.created_at };
}

// Initialise DB then mount routes
require('./db').getDb().then(db => {
  const { query, queryOne, run } = require('./db');

  // ── Properties ──────────────────────────────────────────────
  app.get('/api/properties', (req, res) => {
    res.json(query('SELECT * FROM properties ORDER BY created_at DESC').map(mapProperty));
  });

  app.get('/api/properties/:id', (req, res) => {
    const row = queryOne('SELECT * FROM properties WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(mapProperty(row));
  });

  app.post('/api/properties', (req, res) => {
    const d = req.body;
    const id = generateId('p');
    const created_at = new Date().toISOString().split('T')[0];
    run(`INSERT INTO properties (id,title,type,status,price,currency,location,district,bedrooms,bathrooms,area,description,features,image,featured,created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, d.title, d.type, d.status, d.price, d.currency || 'RWF', d.location, d.district, d.bedrooms || 0, d.bathrooms || 0, d.area, d.description, JSON.stringify(d.features || []), d.image || '', d.featured ? 1 : 0, created_at]);
    res.json(mapProperty(queryOne('SELECT * FROM properties WHERE id = ?', [id])));
  });

  app.put('/api/properties/:id', (req, res) => {
    const d = req.body;
    run(`UPDATE properties SET title=?,type=?,status=?,price=?,currency=?,location=?,district=?,bedrooms=?,bathrooms=?,area=?,description=?,features=?,image=?,featured=? WHERE id=?`,
      [d.title, d.type, d.status, d.price, d.currency || 'RWF', d.location, d.district, d.bedrooms || 0, d.bathrooms || 0, d.area, d.description, JSON.stringify(d.features || []), d.image || '', d.featured ? 1 : 0, req.params.id]);
    res.json(mapProperty(queryOne('SELECT * FROM properties WHERE id = ?', [req.params.id])));
  });

  app.delete('/api/properties/:id', (req, res) => {
    run('DELETE FROM properties WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  // ── Agents ───────────────────────────────────────────────────
  app.get('/api/agents', (req, res) => {
    res.json(query('SELECT * FROM agents'));
  });

  app.post('/api/agents', (req, res) => {
    const d = req.body;
    const id = generateId('a');
    run('INSERT INTO agents (id,name,role,phone,email,photo) VALUES (?,?,?,?,?,?)', [id, d.name, d.role, d.phone, d.email, d.photo || '']);
    res.json(queryOne('SELECT * FROM agents WHERE id = ?', [id]));
  });

  app.put('/api/agents/:id', (req, res) => {
    const d = req.body;
    run('UPDATE agents SET name=?,role=?,phone=?,email=? WHERE id=?', [d.name, d.role, d.phone, d.email, req.params.id]);
    res.json(queryOne('SELECT * FROM agents WHERE id = ?', [req.params.id]));
  });

  app.delete('/api/agents/:id', (req, res) => {
    run('DELETE FROM agents WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  // ── Inquiries ────────────────────────────────────────────────
  app.get('/api/inquiries', (req, res) => {
    res.json(query('SELECT * FROM inquiries ORDER BY created_at DESC').map(i => ({ ...i, read: i.is_read === 1, date: i.created_at })));
  });

  app.post('/api/inquiries', (req, res) => {
    const d = req.body;
    const id = generateId('i');
    run('INSERT INTO inquiries (id,name,email,phone,message,property_id,property_title) VALUES (?,?,?,?,?,?,?)',
      [id, d.name, d.email, d.phone, d.message, d.propertyId || '', d.propertyTitle || 'General Inquiry']);
    res.json({ success: true, id });
  });

  app.put('/api/inquiries/:id/read', (req, res) => {
    run('UPDATE inquiries SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  app.delete('/api/inquiries/:id', (req, res) => {
    run('DELETE FROM inquiries WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  });

  // ── Settings ─────────────────────────────────────────────────
  app.get('/api/settings', (req, res) => {
    const rows = query('SELECT key, value FROM settings');
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    res.json(settings);
  });

  app.put('/api/settings', (req, res) => {
    Object.entries(req.body).forEach(([k, v]) => {
      run('INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', [k, v]);
    });
    res.json({ success: true });
  });

  // ── Auth ─────────────────────────────────────────────────────
  app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const admin = queryOne('SELECT * FROM admin WHERE username = ? AND password = ?', [username, password]);
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ success: true, name: admin.name, username: admin.username });
  });

  app.put('/api/admin', (req, res) => {
    const { username, name, password } = req.body;
    if (password) {
      run('UPDATE admin SET username=?,name=?,password=? WHERE id=1', [username, name, password]);
    } else {
      run('UPDATE admin SET username=?,name=? WHERE id=1', [username, name]);
    }
    res.json({ success: true });
  });

  // ── Serve frontend ───────────────────────────────────────────
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  app.listen(PORT, () => console.log(`Kigali Estates running on http://localhost:${PORT}`));
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
