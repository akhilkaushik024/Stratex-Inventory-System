# Stratex - Enterprise Inventory & Order Management System

A state-of-the-art, fully containerized full-stack **Inventory & Order Management System** built for modern logistics operations. This repository contains the complete implementation designed, structured, and packaged to meet the rigorous standards of a production assessment.

---

## 🚀 Key Features

* **Product Catalog CRUD**: Detailed records including Name, SKU, Price, and Stock counts with non-negative constraints.
* **Customer Directory**: Complete profiles (Name, unique Email, Phone) linked dynamically to order tracking.
* **Dynamic Sales Orders Checkout**: Seamless cart billing supporting multi-product basket selections, unit price snapshots at checkout, automatic backend subtotaling, and real-time stock deductions.
* **Smart Stock Integrity**: Transactional database controls preventing checkouts on insufficient stock, with safe stock replenishment upon order cancellation.
* **Real-time KPI Dashboard**: Instant visualization of product quantities, customer registration numbers, total order volumes, and critical low-stock alerts.
* **Containerized Orchestration**: Production-ready, optimized Docker containers for the Frontend, Backend, and Database configured to boot in harmony with PostgreSQL health checks.

---

## 🛠️ Technology Stack

* **Frontend SPA**: React (JavaScript) + Vite + Custom HSL design tokens, Glassmorphism elements, and fully responsive layouts.
* **Backend API**: Python + FastAPI (high-performance ASGI web framework) with Pydantic request body validation, dynamic CORS handling, and automatic interactive Swagger API documentation.
* **ORM & Database**: PostgreSQL 15 + SQLAlchemy with robust cascading relationship links and safety check constraints.
* **Docker & Orchestration**: Docker, Docker Compose, Nginx (Stage 2 production container for serving static SPA files).

---

## 📂 Project Architecture & Directory Layout

```text
inventory-order-system/
├── docker-compose.yml        # Multi-service container orchestration
├── .env.example              # Environment variables template file
├── .gitignore                # Git ignore tracking rules
├── README.md                 # Professional system documentation
├── backend/                  # Fast API service directory
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI server with startup table setups
│   │   ├── config.py         # Application and Pydantic Settings
│   │   ├── database.py       # SQLAlchemy engine and session pool setups
│   │   ├── models.py         # Database ORM models (Product, Customer, Order, OrderItem)
│   │   ├── schemas.py        # Pydantic validation & response serialization schemas
│   │   └── crud.py           # CRUD operations and transactional stock logic
│   ├── Dockerfile            # Production-grade Python slim container
│   ├── .dockerignore
│   └── requirements.txt      # Backend Python dependencies
└── frontend/                 # React Single Page App directory
    ├── src/
    │   ├── components/       # Reusable components
    │   │   ├── Dashboard.jsx        # Stat cards and quick dashboard restock
    │   │   ├── ProductManager.jsx   # Product CRUD with form dialogs
    │   │   ├── CustomerManager.jsx  # Customer files and registration
    │   │   ├── OrderManager.jsx     # Order cart billing and detailed invoice modals
    │   │   ├── Navigation.jsx       # Sidebar adaptive drawer
    │   │   └── Toast.jsx            # Toast slide-over notification system
    │   ├── App.jsx           # Main controller handling API fetch actions & toasts
    │   ├── main.jsx          # React DOM render hook
    │   └── index.css         # Styling system sheet with dark-theme glassmorphism variables
    ├── index.html            # Static HTML wrapper containing Google Fonts & SEO tags
    ├── package.json          # React dependencies (React, Lucide Icons)
    ├── vite.config.js        # Vite config running dev on port 5173
    ├── nginx.conf            # Custom Nginx conf with React SPA fallback routing
    ├── Dockerfile            # Multi-stage optimized builder serving built assets with Nginx
    └── .dockerignore
```

---

## 💻 Local Setup & Development Guide

Follow these simple steps to run the complete containerized stack on your local machine:

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Spin up the Application Stack
1. Clone or download this project folder.
2. Open your terminal in the `inventory-order-system` root folder.
3. Run the following Docker Compose command to orchestrate the PostgreSQL db, FastAPI backend, and React frontend:
   ```bash
   docker-compose up --build
   ```

4. Once the setup completes, the following services will be active:
   * **React Frontend**: Access at [http://localhost](http://localhost) (mapped on port 80).
   * **FastAPI Backend REST API**: Access at [http://localhost:8000](http://localhost:8000).
   * **Interactive Swagger UI Documentation**: Review and test endpoints directly at [http://localhost:8000/docs](http://localhost:8000/docs).
   * **PostgreSQL Database**: Port `5432` exposed locally for manual verification.

---

## 📤 Production Deployment & Submission Steps

This section details how to fulfill the exact submission requirements using the selected platforms.

### Step 1: Initialize Git and Push to GitHub
1. Create a **new empty repository** on your GitHub account (do not initialize with README).
2. Run the following terminal commands in the project root (`inventory-order-system/`):
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of production ready inventory & order management system"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git push -u origin main
   ```

---

### Step 2: Publish Docker Hub Image (Backend)
1. Log in to [Docker Hub](https://hub.docker.com/) in your local shell:
   ```bash
   docker login
   ```
2. Build the backend image, replacing `YOUR_DOCKERHUB_USERNAME` with your real username:
   ```bash
   docker build -t YOUR_DOCKERHUB_USERNAME/inventory-backend:latest ./backend
   ```
3. Push the image directly to Docker Hub:
   ```bash
   docker push YOUR_DOCKERHUB_USERNAME/inventory-backend:latest
   ```

---

### Step 3: Deploy Backend & Database on Render
Render allows you to host Python APIs and PostgreSQL databases for free.

#### 1. Create a Managed PostgreSQL Database
1. Go to the [Render Dashboard](https://dashboard.render.com/) and click **New > PostgreSQL**.
2. Set the database name to `inventory_db` and select the **Free** tier.
3. Once created, copy the **Internal Database URL** or **External Database URL** (e.g., `postgresql://postgres:user@host.oregon-postgres.render.com/inventory_db`).

#### 2. Create the Backend Web Service
1. Click **New > Web Service**.
2. Select your pushed GitHub repository.
3. Name your service `inventory-backend`.
4. Configure the environment fields:
   * **Runtime**: `Python` (or `Docker` since we have a Dockerfile! Let's choose **Docker** which is the most reliable, handles all system libraries out of the box, and directly uses our custom Dockerfile!).
   * **Branch**: `main`
   * **Plan**: `Free`
5. Click **Advanced** and add the following Environment Variables:
   * `DATABASE_URL`: *Paste the external PostgreSQL connection URL copied above.*
6. Click **Deploy Web Service**. Render will build the Docker container and output your live backend URL (e.g., `https://inventory-backend-xxxx.onrender.com`).

---

### Step 4: Deploy Frontend on Vercel
Vercel is the ultimate hosting platform for static and React applications.

1. Go to the [Vercel Dashboard](https://vercel.com/) and click **Add New > Project**.
2. Import your GitHub repository.
3. In the project setup wizard, edit the folder scopes:
   * **Root Directory**: Select `frontend` (crucial so Vercel builds the React app rather than the root directory).
   * **Framework Preset**: `Vite` (automatically detected).
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   * `VITE_API_URL`: *Paste your deployed Render backend API URL (e.g., `https://inventory-backend-xxxx.onrender.com`).*
5. Click **Deploy**. Vercel will build and assign you a live production URL (e.g., `https://inventory-frontend-xxxx.vercel.app`).

---

## 📝 Final Deliverables Submission Format

Below is the completed deliverable metadata sheet for your submission:

| Deliverable Requirement | Submission Details (Replace placeholders) |
|---|---|
| **GitHub Repository Link** | `https://github.com/YOUR_USERNAME/YOUR_REPOSITORY` |
| **Docker Hub Backend Image** | `YOUR_DOCKERHUB_USERNAME/inventory-backend:latest` |
| **Live Frontend URL (Vercel)** | `https://YOUR-FRONTEND-URL.vercel.app` |
| **Live Backend API URL (Render)** | `https://YOUR-BACKEND-URL.onrender.com` |

---

## 🔒 Safety, Business Logic & API Documentation

### Dynamic Visual Validation
* Validation errors are presented instantly in the React client via animated toast notifications (e.g., invalid phone format, negative quantities, SKU collisions, and out-of-stock checkouts).
* Product SKU forms convert text uppercase automatically to enforce global scanning standards.
* Cascade-deletions on customers remove related orders and automatically restore stocks on hand.
