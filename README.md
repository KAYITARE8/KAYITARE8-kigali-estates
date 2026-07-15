# Kigali Estates 🏠

A full-stack real estate web application for browsing, listing, and managing properties across Rwanda.

## Live Demo

🔗 [https://kigali-estates.onrender.com](https://kigali-estates.onrender.com)

## GitHub Repository

🔗 [https://github.com/KAYITARE8/kigali-estates](https://github.com/KAYITARE8/kigali-estates)

---

## Features

- Browse properties for sale and rent across Rwanda
- Filter by type, district, status, and price range
- Property detail pages with inquiry forms
- Admin panel to manage properties, agents, inquiries, and settings
- SQLite database (persistent, real database — not localStorage)
- Fully containerized with Docker
- CI/CD pipeline via GitHub Actions
- Deployed on Render

---

## Technologies Used

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | SQLite (via better-sqlite3) |
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
│   ├── main.js            # Shared UI rendering
│   └── admin.js           # Admin panel logic
├── .github/
│   └── workflows/
│       └── deploy.yml     # CI/CD pipeline
├── index.html             # Homepage
├── properties.html        # Property listing
├── property.html          # Property detail
├── about.html             # About page
├── contact.html           # Contact page
├── admin.html             # Admin dashboard
├── admin-login.html       # Admin login
├── server.js              # Express API server
├── db.js                  # SQLite database setup & seeding
├── package.json
├── Dockerfile
├── docker-compose.yml
└── .gitignore
```

---

## Database Design

The SQLite database (`data/kigali_estates.db`) contains 5 tables:

- **properties** — id, title, type, status, price, currency, location, district, bedrooms, bathrooms, area, description, features, image, featured, created_at
- **agents** — id, name, role, phone, email, photo
- **inquiries** — id, name, email, phone, message, property_id, property_title, is_read, created_at
- **settings** — key, value (company name, tagline, contact info)
- **admin** — id, username, password, name

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
| POST | /api/login | Admin login |
| PUT | /api/admin | Update admin credentials |

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

- URL: `/admin-login.html`
- Default credentials: `admin` / `admin123`

---

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/deploy.yml`) runs on every push to `main`:

1. Checkout code
2. Install Node.js dependencies
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
7. Copy the **Deploy Hook URL** and add it as a GitHub secret named `RENDER_DEPLOY_HOOK_URL`

---

## Docker

Build and run manually:

```bash
# Build
docker build -t kigali-estates .

# Run
docker run -p 3000:3000 kigali-estates

# Or with docker-compose
docker-compose up --build
```

---

## Author

Developed as a final project for **EWA408510 – E-Commerce and Web Application**  
Faculty of Computing and Information Sciences — UNILAK, 2025–2026
