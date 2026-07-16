# Kigali Estates 🏠

A full-stack real estate e-commerce web application for browsing, listing, and managing properties across Rwanda.

## Live Demo

🔗 [https://kigali-estates.onrender.com](https://kigali-estates.onrender.com)

## GitHub Repository

🔗 [https://github.com/KAYITARE8/-kigali-estates](https://github.com/KAYITARE8/-kigali-estates)

---

## Features

- Browse properties for sale and rent across Rwanda
- Filter by type, district, status, and price range
- Property detail pages with inquiry forms
- Shopping cart with quantity controls and totals
- Full checkout process with order confirmation
- User registration and login (bcrypt hashed passwords)
- Admin panel to manage properties, agents, inquiries, orders, users, and settings
- Analytics dashboard with real-time stats and bar charts
- Admin profile management with photo upload
- NeDB database (persistent, pure JS — no native compilation required)
- Fully containerized with Docker
- CI/CD pipeline via GitHub Actions
- Deployed on Render

---

## Technologies Used

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | NeDB (`@seald-io/nedb`) |
| Authentication | bcryptjs (password hashing) |
| Containerization | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Deployment | Render |

---

## Project Structure

```
kigali-estates/
├── css/
│   ├── style.css          # Public site styles
│   └── admin.css          # Admin panel styles
├── js/
│   ├── storage.js         # API client (fetch-based)
│   ├── cart.js            # Shopping cart logic
│   ├── main.js            # Shared UI rendering
│   └── admin.js           # Admin panel logic
├── .github/
│   └── workflows/
│       └── deploy.yml     # CI/CD pipeline
├── data/                  # NeDB database files (gitignored)
├── index.html             # Homepage
├── properties.html        # Property listing
├── property.html          # Property detail
├── about.html             # About page
├── contact.html           # Contact page
├── cart.html              # Shopping cart
├── checkout.html          # Checkout form
├── confirmation.html      # Order confirmation
├── admin.html             # Admin dashboard
├── admin-login.html       # Admin login
├── server.js              # Express API server
├── db.js                  # NeDB database setup & seeding
├── package.json
├── Dockerfile
├── docker-compose.yml
├── render.yaml            # Render persistent disk config
└── .gitignore
```

---

## Database Design

NeDB stores data in flat files under `data/`. Collections:

- **properties.db** — id, title, type, status, price, currency, location, district, bedrooms, bathrooms, area, description, features, image, featured, createdAt
- **agents.db** — id, name, role, phone, email, photo
- **inquiries.db** — id, name, email, phone, message, propertyTitle, is_read, date
- **orders.db** — id, customer{firstName,lastName,email,phone,address,district}, items, total, paymentMethod, notes, status, createdAt
- **users.db** — id, name, email, password(hashed), createdAt
- **settings.db** — companyName, tagline, phone, email, address, whatsapp, about
- **admin.db** — id, username, password(hashed), name, photo

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/properties | List all properties |
| GET | /api/properties/:id | Get single property |
| POST | /api/properties | Create property |
| PUT | /api/properties/:id | Update property |
| DELETE | /api/properties/:id | Delete property |
| GET | /api/agents | List all agents |
| POST | /api/agents | Create agent |
| PUT | /api/agents/:id | Update agent |
| DELETE | /api/agents/:id | Delete agent |
| GET | /api/inquiries | List all inquiries |
| POST | /api/inquiries | Submit inquiry |
| PUT | /api/inquiries/:id/read | Mark inquiry as read |
| DELETE | /api/inquiries/:id | Delete inquiry |
| GET | /api/settings | Get site settings |
| PUT | /api/settings | Update settings |
| POST | /api/register | Register new user |
| POST | /api/login | Unified login (admin + user) |
| GET | /api/admin | Get admin profile |
| PUT | /api/admin | Update admin profile & photo |
| GET | /api/users | List all users |
| DELETE | /api/users/:id | Delete user |
| GET | /api/orders | List all orders |
| GET | /api/orders/:id | Get single order |
| POST | /api/orders | Place order |
| PUT | /api/orders/:id/status | Update order status |
| DELETE | /api/orders/:id | Delete order |

---

## Running Locally

### Option 1 — Node.js

```bash
npm install
npm start
```
Open [http://localhost:3000](http://localhost:3000)

### Option 2 — Docker

```bash
docker-compose up --build
```
Open [http://localhost:3000](http://localhost:3000)

---

## Admin Panel

- URL: `/admin-login.html` or use the 🔒 Login button on the homepage
- Sections: Dashboard, Properties, Agents, Inquiries, Users, Analytics, Settings, Profile

---

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/deploy.yml`) runs on every push to `main`:

1. Checkout code
2. Install Node.js 20 dependencies
3. Run tests (`npm test`)
4. Build Docker image
5. Trigger deployment to Render via deploy hook

---

## Deployment (Render)

1. Push code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Connect your GitHub repository
4. Set build command: `npm install`
5. Set start command: `node server.js`
6. Add environment variable: `PORT=3000`
7. Add a **Disk** with mount path `/app/data` (1GB) for persistent data
8. Copy the **Deploy Hook URL** and add it as a GitHub secret named `RENDER_DEPLOY_HOOK_URL`

---

## Docker

```bash
# Build
docker build -t kigali-estates .

# Run
docker run -p 3000:3000 kigali-estates

# Or with docker-compose (recommended — includes persistent volume)
docker-compose up --build
```

---

## Security

- Passwords hashed with **bcryptjs** (salt rounds: 10)
- Unified login endpoint checks admin first, then users
- Input validation on all forms (frontend + backend)
- Sessions stored in `sessionStorage` (cleared on tab close)

---

## Author

Developed as a final project for **EWA408510 – E-Commerce and Web Application**
Faculty of Computing and Information Sciences — UNILAK, 2025–2026
