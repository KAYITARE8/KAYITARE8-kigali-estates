function renderHeader(activePage, settings) {
  const pages = [
    { href: 'index.html', label: 'Home' },
    { href: 'properties.html', label: 'Properties' },
    { href: 'about.html', label: 'About' },
    { href: 'contact.html', label: 'Contact' }
  ];
  const navLinks = pages.map(p => `<a href="${p.href}" class="${activePage === p.href ? 'active' : ''}">${p.label}</a>`).join('');
  return `
    <header class="header">
      <div class="container header-inner">
        <a href="index.html" class="logo">
          <div class="logo-icon">KE</div>
          <div class="logo-text">
            <h1>${settings.companyName}</h1>
            <span>Real Estate Rwanda</span>
          </div>
        </a>
        <button class="nav-toggle" onclick="toggleNav()" aria-label="Menu">&#9776;</button>
        <nav class="nav" id="mainNav">${navLinks}</nav>
      </div>
    </header>`;
}

function renderFooter(settings) {
  return `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <h3>${settings.companyName}</h3>
            <p>${settings.about}</p>
          </div>
          <div>
            <h3>Quick Links</h3>
            <ul class="footer-links">
              <li><a href="index.html">Home</a></li>
              <li><a href="properties.html">Properties</a></li>
              <li><a href="about.html">About Us</a></li>
              <li><a href="contact.html">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3>Property Types</h3>
            <ul class="footer-links">
              <li><a href="properties.html?type=house">Houses</a></li>
              <li><a href="properties.html?type=apartment">Apartments</a></li>
              <li><a href="properties.html?type=land">Land</a></li>
              <li><a href="properties.html?type=commercial">Commercial</a></li>
            </ul>
          </div>
          <div>
            <h3>Contact Us</h3>
            <ul class="footer-contact">
              <li>&#128222; ${settings.phone}</li>
              <li>&#9993; ${settings.email}</li>
              <li>&#128205; ${settings.address}</li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>&copy; ${new Date().getFullYear()} ${settings.companyName}. All rights reserved.</span>
          <span>Operating in Rwanda</span>
        </div>
      </div>
    </footer>`;
}

function toggleNav() {
  document.getElementById('mainNav').classList.toggle('open');
}

function renderPropertyCard(property) {
  const badgeClass = property.status === 'sale' ? 'badge-sale' : 'badge-rent';
  const meta = [];
  if (property.bedrooms > 0) meta.push(`<span>&#128719; ${property.bedrooms} Beds</span>`);
  if (property.bathrooms > 0) meta.push(`<span>&#128705; ${property.bathrooms} Baths</span>`);
  meta.push(`<span>&#9632; ${property.area} m&sup2;</span>`);
  return `
    <a href="property.html?id=${property.id}" class="property-card">
      <div class="property-card-img">
        <img src="${property.image}" alt="${property.title}" loading="lazy">
        <span class="property-badge ${badgeClass}">${getStatusLabel(property.status)}</span>
        <span class="badge-type">${getTypeLabel(property.type)}</span>
      </div>
      <div class="property-card-body">
        <h3>${property.title}</h3>
        <div class="property-price">${formatPrice(property.price, property.currency)}</div>
        <div class="property-location">&#128205; ${property.location}</div>
        <div class="property-meta">${meta.join('')}</div>
      </div>
    </a>`;
}

function renderPropertiesGrid(properties, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (properties.length === 0) {
    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><h3>No Properties Found</h3><p>Try adjusting your search filters.</p></div>`;
    return;
  }
  container.innerHTML = properties.map(renderPropertyCard).join('');
}

function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params) result[key] = value;
  return result;
}

function filterProperties(properties, filters) {
  return properties.filter(p => {
    if (filters.status && p.status !== filters.status) return false;
    if (filters.type && p.type !== filters.type) return false;
    if (filters.district && p.district !== filters.district) return false;
    if (filters.minPrice && p.price < parseInt(filters.minPrice)) return false;
    if (filters.maxPrice && p.price > parseInt(filters.maxPrice)) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !p.location.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

async function handleInquirySubmit(e, propertyId) {
  e.preventDefault();
  const form = e.target;
  const property = propertyId ? await getProperty(propertyId) : null;
  await addInquiry({
    name: form.name.value,
    email: form.email.value,
    phone: form.phone.value,
    message: form.message.value,
    propertyId: propertyId || '',
    propertyTitle: property ? property.title : 'General Inquiry'
  });
  const alertEl = document.getElementById('formAlert');
  if (alertEl) {
    alertEl.innerHTML = '<div class="alert alert-success">Thank you! Your inquiry has been sent. We will contact you shortly.</div>';
    form.reset();
    setTimeout(() => { alertEl.innerHTML = ''; }, 5000);
  }
}

async function handleContactSubmit(e) {
  e.preventDefault();
  const form = e.target;
  await addInquiry({
    name: form.name.value,
    email: form.email.value,
    phone: form.phone.value,
    message: form.message.value,
    propertyId: '',
    propertyTitle: 'Contact Form - ' + (form.subject.value || 'General')
  });
  const alertEl = document.getElementById('formAlert');
  if (alertEl) {
    alertEl.innerHTML = '<div class="alert alert-success">Message sent successfully! We will get back to you soon.</div>';
    form.reset();
    setTimeout(() => { alertEl.innerHTML = ''; }, 5000);
  }
}

function renderAgentCard(agent) {
  const initials = agent.name.split(' ').map(n => n[0]).join('').substring(0, 2);
  return `
    <div class="agent-card">
      <div class="agent-avatar">${initials}</div>
      <h3>${agent.name}</h3>
      <div class="agent-role">${agent.role}</div>
      <div class="agent-contact">&#128222; ${agent.phone}<br>&#9993; ${agent.email}</div>
    </div>`;
}

async function initPage(activePage) {
  const settings = await getSettings();
  const headerEl = document.getElementById('site-header');
  const footerEl = document.getElementById('site-footer');
  if (headerEl) headerEl.innerHTML = renderHeader(activePage, settings);
  if (footerEl) footerEl.innerHTML = renderFooter(settings);
  return settings;
}
