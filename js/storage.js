// API-backed storage — replaces localStorage
const API = '';

// ── Session (still in sessionStorage for simplicity) ─────────
function getSession() {
  const s = sessionStorage.getItem('ke_session');
  return s ? JSON.parse(s) : null;
}

function isLoggedIn() {
  return !!getSession();
}

function logout() {
  sessionStorage.removeItem('ke_session');
}

// ── Async API helpers ─────────────────────────────────────────
async function apiFetch(url, options = {}) {
  const res = await fetch(API + url, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── Properties ────────────────────────────────────────────────
async function getProperties() {
  return apiFetch('/api/properties');
}

async function getProperty(id) {
  return apiFetch('/api/properties/' + id);
}

async function addProperty(data) {
  return apiFetch('/api/properties', { method: 'POST', body: JSON.stringify(data) });
}

async function updateProperty(id, data) {
  return apiFetch('/api/properties/' + id, { method: 'PUT', body: JSON.stringify(data) });
}

async function deleteProperty(id) {
  return apiFetch('/api/properties/' + id, { method: 'DELETE' });
}

// ── Agents ────────────────────────────────────────────────────
async function getAgents() {
  return apiFetch('/api/agents');
}

async function addAgent(data) {
  return apiFetch('/api/agents', { method: 'POST', body: JSON.stringify(data) });
}

async function updateAgent(id, data) {
  return apiFetch('/api/agents/' + id, { method: 'PUT', body: JSON.stringify(data) });
}

async function deleteAgent(id) {
  return apiFetch('/api/agents/' + id, { method: 'DELETE' });
}

// ── Inquiries ─────────────────────────────────────────────────
async function getInquiries() {
  return apiFetch('/api/inquiries');
}

async function addInquiry(data) {
  return apiFetch('/api/inquiries', { method: 'POST', body: JSON.stringify(data) });
}

async function markInquiryRead(id) {
  return apiFetch('/api/inquiries/' + id + '/read', { method: 'PUT' });
}

async function deleteInquiry(id) {
  return apiFetch('/api/inquiries/' + id, { method: 'DELETE' });
}

// ── Settings ──────────────────────────────────────────────────
async function getSettings() {
  return apiFetch('/api/settings');
}

async function saveSettings(data) {
  return apiFetch('/api/settings', { method: 'PUT', body: JSON.stringify(data) });
}

// ── User Auth ────────────────────────────────────────────
async function registerUser(name, email, password) {
  try {
    const data = await apiFetch('/api/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
    sessionStorage.setItem('ke_user', JSON.stringify({ id: data.id, name: data.name, email: data.email }));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function userLogin(email, password) {
  try {
    const data = await apiFetch('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (data.role === 'admin') {
      sessionStorage.setItem('ke_session', JSON.stringify({ username: data.username, name: data.name, loginTime: Date.now() }));
      return { ok: true, role: 'admin' };
    }
    sessionStorage.setItem('ke_user', JSON.stringify({ id: data.id, name: data.name, email: data.email }));
    return { ok: true, role: 'user' };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function getUser() {
  const s = sessionStorage.getItem('ke_user');
  return s ? JSON.parse(s) : null;
}

function userLogout() {
  sessionStorage.removeItem('ke_user');
}

// ── Auth ──────────────────────────────────────────────────────
async function login(username, password) {
  try {
    const data = await apiFetch('/api/login', { method: 'POST', body: JSON.stringify({ username, password }) });
    sessionStorage.setItem('ke_session', JSON.stringify({ username: data.username, name: data.name, loginTime: Date.now() }));
    return true;
  } catch {
    return false;
  }
}

async function saveAdmin(data) {
  return apiFetch('/api/admin', { method: 'PUT', body: JSON.stringify(data) });
}

// ── Orders ────────────────────────────────────────────────
async function placeOrder(data) {
  return apiFetch('/api/orders', { method: 'POST', body: JSON.stringify(data) });
}

async function getOrder(id) {
  return apiFetch('/api/orders/' + id);
}

async function getOrders() {
  return apiFetch('/api/orders');
}

async function updateOrderStatus(id, status) {
  return apiFetch('/api/orders/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status }) });
}

async function deleteOrder(id) {
  return apiFetch('/api/orders/' + id, { method: 'DELETE' });
}

// ── Helpers ───────────────────────────────────────────────────
function formatPrice(price, currency) {
  if (currency === 'RWF') {
    if (price >= 1000000) return (price / 1000000).toFixed(1) + 'M RWF';
    return price.toLocaleString() + ' RWF';
  }
  return price.toLocaleString() + ' ' + currency;
}

function formatPriceFull(price) {
  return price.toLocaleString() + ' RWF';
}

function getStatusLabel(status) {
  return status === 'sale' ? 'For Sale' : 'For Rent';
}

function getTypeLabel(type) {
  const labels = { house: 'House', apartment: 'Apartment', land: 'Land', commercial: 'Commercial' };
  return labels[type] || type;
}

function getDistricts() {
  return ['Gasabo', 'Kicukiro', 'Nyarugenge', 'Musanze', 'Huye', 'Rubavu', 'Other'];
}
