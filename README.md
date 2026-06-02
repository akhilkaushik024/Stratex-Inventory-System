<p align="center">
  <h1 align="center">Stratex — Inventory & Order Management System</h1>
  <p align="center">
    A production-grade, full-stack web application for managing products, customers, and orders — built with React, FastAPI, PostgreSQL, and Docker.
  </p>
</p>

<p align="center">
  <a href="https://stratex-inventory-system.vercel.app"><strong>🌐 Live Demo</strong></a> &nbsp;·&nbsp;
  <a href="https://inventory-backend-pic1.onrender.com/docs"><strong>📖 API Docs</strong></a> &nbsp;·&nbsp;
  <a href="https://hub.docker.com/r/akhilkaushik/inventory-backend"><strong>🐳 Docker Hub</strong></a>
</p>

---

## 📋 Submission Deliverables

| Requirement | Link |
|---|---|
| **GitHub Repository** | [github.com/akhilkaushik024/Stratex-Inventory-System](https://github.com/akhilkaushik024/Stratex-Inventory-System) |
| **Docker Hub Image** | [hub.docker.com/r/akhilkaushik/inventory-backend](https://hub.docker.com/r/akhilkaushik/inventory-backend) |
| **Live Frontend (Vercel)** | [stratex-inventory-system.vercel.app](https://stratex-inventory-system.vercel.app) |
| **Live Backend API (Render)** | [inventory-backend-pic1.onrender.com](https://inventory-backend-pic1.onrender.com) |
| **Swagger API Documentation** | [inventory-backend-pic1.onrender.com/docs](https://inventory-backend-pic1.onrender.com/docs) |

> **Note:** The backend is deployed on Render's free tier. After ~15 minutes of inactivity the server spins down. The first request triggers a cold start that takes approximately 30–40 seconds — subsequent requests are near-instant.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 5, Lucide Icons, Vanilla CSS with custom design tokens |
| **Backend** | Python 3.11, FastAPI, Pydantic v2, Uvicorn (ASGI) |
| **Database** | PostgreSQL 15, SQLAlchemy ORM |
| **Containerization** | Docker, Docker Compose, Nginx |
| **Deployment** | Vercel (Frontend), Render (Backend + PostgreSQL) |

---

## ✨ Key Features

### Product Catalog
- Full CRUD operations (Create, Read, Update, Delete)
- Unique SKU enforcement with automatic uppercase conversion
- Non-negative price and stock quantity constraints at the database level
- Dynamic product images matched to product name keywords
- Real-time search and filtering

### Customer Directory
- Customer registration with strict validation
- **10-digit phone number** enforcement (input restricted, cannot enter more or less)
- **`.com` email-only** validation
- **Duplicate prevention** — cannot register two customers with the same email
- Cascade deletion — removing a customer cancels all their orders and restores stock

### Order Management
- Multi-product cart checkout with real-time subtotal calculation
- Unit price snapshot at time of purchase
- Automatic stock deduction on order creation
- Automatic stock restoration on order cancellation
- Detailed invoice modal with IST (India Standard Time) timestamps
- Insufficient stock prevention with clear error messages

### Analytics Dashboard
- Total products, customers, and orders at a glance
- Color-coded stat cards (Indigo, Amber, Emerald, Red)
- Low-stock product alerts with quick restock actions

### UX Polish
- **Bottom-center snackbar notifications** — all success/error/info messages appear as Material Design-style toasts with slide-up animation
- Informative cloud database wake-up loader during Render cold starts
- No blinking cursor or accidental text selection on UI elements
- Product-only search bar linked to the catalog view

---

## 📂 Project Structure

```
inventory-order-system/
├── docker-compose.yml              # Multi-service orchestration
├── .env.example                    # Environment variables template
├── .gitignore
├── README.md
│
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app, routes, CORS, startup
│   │   ├── config.py               # Pydantic settings configuration
│   │   ├── database.py             # SQLAlchemy engine & session pool
│   │   ├── models.py               # ORM models (Product, Customer, Order, OrderItem)
│   │   ├── schemas.py              # Pydantic request/response schemas
│   │   └── crud.py                 # Business logic & transactional operations
│   ├── Dockerfile                  # Python slim production container
│   ├── requirements.txt
│   └── .dockerignore
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard.jsx       # KPI stat cards & low-stock alerts
    │   │   ├── ProductManager.jsx  # Product CRUD with image matching
    │   │   ├── CustomerManager.jsx # Customer registration & validation
    │   │   ├── OrderManager.jsx    # Cart checkout & invoice viewer
    │   │   ├── Navigation.jsx      # Top navigation bar & search
    │   │   └── Toast.jsx           # Snackbar notification system
    │   ├── App.jsx                 # Root component, API handlers, routing
    │   ├── main.jsx                # React DOM entry point
    │   └── index.css               # Complete design system & styles
    ├── index.html                  # HTML shell with SEO meta tags
    ├── package.json
    ├── vite.config.js
    ├── vercel.json                 # Vercel SPA routing rewrites
    ├── nginx.conf                  # Nginx config for Docker container
    ├── Dockerfile                  # Multi-stage build (Node → Nginx)
    └── .dockerignore
```

---

## 🔌 API Endpoints

All endpoints are prefixed with `/api` and documented interactively at [`/docs`](https://inventory-backend-pic1.onrender.com/docs).

### Products

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | List all products |
| `GET` | `/api/products/{id}` | Get product by ID |
| `POST` | `/api/products` | Create a new product |
| `PUT` | `/api/products/{id}` | Update a product |
| `DELETE` | `/api/products/{id}` | Delete a product |

### Customers

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/customers` | List all customers |
| `GET` | `/api/customers/{id}` | Get customer by ID |
| `POST` | `/api/customers` | Register a new customer |
| `DELETE` | `/api/customers/{id}` | Delete customer (cascades to orders) |

### Orders

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/orders` | List all orders |
| `GET` | `/api/orders/{id}` | Get order by ID |
| `POST` | `/api/orders` | Create a new order (checkout) |
| `DELETE` | `/api/orders/{id}` | Cancel order (restores stock) |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard` | Aggregated KPI statistics |

---

## 💻 Local Development Setup

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/akhilkaushik024/Stratex-Inventory-System.git
cd Stratex-Inventory-System

# 2. Start all services
docker-compose up --build
```

### Access Points

| Service | URL |
|---|---|
| React Frontend | [http://localhost:3000](http://localhost:3000) |
| FastAPI Backend | [http://localhost:8000](http://localhost:8000) |
| Swagger API Docs | [http://localhost:8000/docs](http://localhost:8000/docs) |
| ReDoc API Docs | [http://localhost:8000/redoc](http://localhost:8000/redoc) |
| PostgreSQL | `localhost:5432` |

### Environment Variables

Copy `.env.example` and configure as needed:

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres_secure_pass@db:5432/inventory_db` |
| `VITE_API_URL` | Backend API base URL for frontend | `http://localhost:8000` |

---

## 🚀 Production Deployment

### Backend & Database → Render

1. **Create PostgreSQL Database**: Render Dashboard → New → PostgreSQL → Free tier
2. **Create Web Service**: Render Dashboard → New → Web Service → Connect GitHub repo
   - **Root Directory**: `backend`
   - **Runtime**: Docker
   - **Environment Variable**: `DATABASE_URL` = *(PostgreSQL URL from step 1)*

### Frontend → Vercel

1. **Import Project**: Vercel Dashboard → Add New → Project → Import GitHub repo
2. **Configure**:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variable**: `VITE_API_URL` = *(Render backend URL)*

### Docker Hub Image

```bash
docker login
docker build -t akhilkaushik/inventory-backend:latest ./backend
docker push akhilkaushik/inventory-backend:latest
```

---

## 🔒 Data Integrity & Business Logic

- **Stock Safety**: Database-level `CHECK` constraints ensure stock quantities and prices never go negative
- **Transactional Orders**: Order creation atomically deducts stock; failures trigger full rollback
- **Cascade Deletions**: Deleting a customer removes all associated orders and restores product stock
- **Unique Constraints**: Product SKUs and customer emails are enforced unique at the database level
- **Input Validation**: Pydantic schemas validate all request bodies; frontend enforces format rules before API calls

---

## 👤 Author

**Akhil Kaushik** — [GitHub](https://github.com/akhilkaushik024)
