const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const { db, seed } = require('./db');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

function genId(prefix) {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
}

seed().then(() => {

  // ── Properties ──────────────────────────────────────────────
  app.get('/api/properties', async (req, res) => {
    const docs = await db.properties.findAsync({}).sort({ createdAt: -1 });
    res.json(docs.map(d => ({ ...d, id: d._id })));
  });

  app.get('/api/properties/:id', async (req, res) => {
    const doc = await db.properties.findOneAsync({ _id: req.params.id });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ ...doc, id: doc._id });
  });

  app.post('/api/properties', async (req, res) => {
    const d = req.body;
    const doc = await db.properties.insertAsync({ _id: genId('p'), ...d, createdAt: new Date().toISOString().split('T')[0] });
    res.json({ ...doc, id: doc._id });
  });

  app.put('/api/properties/:id', async (req, res) => {
    await db.properties.updateAsync({ _id: req.params.id }, { $set: req.body });
    const doc = await db.properties.findOneAsync({ _id: req.params.id });
    res.json({ ...doc, id: doc._id });
  });

  app.delete('/api/properties/:id', async (req, res) => {
    await db.properties.removeAsync({ _id: req.params.id });
    res.json({ success: true });
  });

  // ── Agents ───────────────────────────────────────────────────
  app.get('/api/agents', async (req, res) => {
    const docs = await db.agents.findAsync({});
    res.json(docs.map(d => ({ ...d, id: d._id })));
  });

  app.post('/api/agents', async (req, res) => {
    const doc = await db.agents.insertAsync({ _id: genId('a'), ...req.body });
    res.json({ ...doc, id: doc._id });
  });

  app.put('/api/agents/:id', async (req, res) => {
    await db.agents.updateAsync({ _id: req.params.id }, { $set: req.body });
    const doc = await db.agents.findOneAsync({ _id: req.params.id });
    res.json({ ...doc, id: doc._id });
  });

  app.delete('/api/agents/:id', async (req, res) => {
    await db.agents.removeAsync({ _id: req.params.id });
    res.json({ success: true });
  });

  // ── Inquiries ────────────────────────────────────────────────
  app.get('/api/inquiries', async (req, res) => {
    const docs = await db.inquiries.findAsync({}).sort({ date: -1 });
    res.json(docs.map(d => ({ ...d, id: d._id, read: d.is_read || false })));
  });

  app.post('/api/inquiries', async (req, res) => {
    const d = req.body;
    const doc = await db.inquiries.insertAsync({ _id: genId('i'), ...d, propertyTitle: d.propertyTitle || 'General Inquiry', is_read: false, date: new Date().toISOString() });
    res.json({ success: true, id: doc._id });
  });

  app.put('/api/inquiries/:id/read', async (req, res) => {
    await db.inquiries.updateAsync({ _id: req.params.id }, { $set: { is_read: true } });
    res.json({ success: true });
  });

  app.delete('/api/inquiries/:id', async (req, res) => {
    await db.inquiries.removeAsync({ _id: req.params.id });
    res.json({ success: true });
  });

  // ── Settings ─────────────────────────────────────────────────
  app.get('/api/settings', async (req, res) => {
    const doc = await db.settings.findOneAsync({ _id: 'main' });
    res.json(doc || {});
  });

  app.put('/api/settings', async (req, res) => {
    await db.settings.updateAsync({ _id: 'main' }, { $set: req.body }, { upsert: true });
    res.json({ success: true });
  });

  // ── Orders ─────────────────────────────────────────────────
  app.post('/api/orders', async (req, res) => {
    const doc = await db.orders.insertAsync({ _id: genId('ord'), ...req.body, createdAt: new Date().toISOString(), status: 'pending' });
    res.json({ success: true, id: doc._id });
  });

  app.get('/api/orders/:id', async (req, res) => {
    const doc = await db.orders.findOneAsync({ _id: req.params.id });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ ...doc, id: doc._id });
  });

  app.get('/api/orders', async (req, res) => {
    const docs = await db.orders.findAsync({}).sort({ createdAt: -1 });
    res.json(docs.map(d => ({ ...d, id: d._id })));
  });

  app.put('/api/orders/:id/status', async (req, res) => {
    await db.orders.updateAsync({ _id: req.params.id }, { $set: { status: req.body.status } });
    res.json({ success: true });
  });

  app.delete('/api/orders/:id', async (req, res) => {
    await db.orders.removeAsync({ _id: req.params.id });
    res.json({ success: true });
  });

  // ── User Auth ─────────────────────────────────────────────
  app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    const existing = await db.users.findOneAsync({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const doc = await db.users.insertAsync({ _id: genId('u'), name, email, password: hashed, createdAt: new Date().toISOString() });
    res.json({ success: true, id: doc._id, name: doc.name, email: doc.email });
  });

  app.post('/api/user/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await db.users.findOneAsync({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: 'Invalid email or password' });
    res.json({ success: true, id: user._id, name: user.name, email: user.email });
  });

  // ── Auth ─────────────────────────────────────────────────────
  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const admin = await db.admin.findOneAsync({ username });
    if (!admin || !(await bcrypt.compare(password, admin.password))) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ success: true, name: admin.name, username: admin.username });
  });

  app.put('/api/admin', async (req, res) => {
    const { username, name, password } = req.body;
    const update = { username, name };
    if (password) update.password = await bcrypt.hash(password, 10);
    await db.admin.updateAsync({ _id: 'admin1' }, { $set: update });
    res.json({ success: true });
  });

  // ── Serve frontend ───────────────────────────────────────────
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  app.listen(PORT, () => console.log(`Kigali Estates running on http://localhost:${PORT}`));

}).catch(err => { console.error(err); process.exit(1); });
