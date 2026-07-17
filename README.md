# AeroPMO | Industrial Engineering PMO & ERP Platform

A professional, high-performance portfolio demo application representing a Project Management Office (PMO) and Enterprise Resource Planning (ERP) platform designed for multi-discipline engineering consultancies.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React.js (Vite) + Tailwind CSS v4 + React Router Dom v6 + Lucide Icons
- **Backend**: Node.js + Express + Sequelize ORM
- **Database**: SQLite (default for instant run capability) & MySQL (configured and ready to toggle in `.env`)
- **Authentication**: JWT-based auth with Role-Based Access Control (RBAC)

---

## 🎨 Design System & Aesthetics

- **Color Palette**:
  - **Primary**: Deep Navy/Steel-Blue (`#0F2A47`) - establishes a technical, corporate engineering feel.
  - **Accent / CTA**: Teal (`#0D9488`) - used consistently for buttons, highlights, and primary actions.
  - **Background (Light Mode)**: Slate Grays (`#F4F6F8`)
  - **Background (Dark Mode)**: Midnight Slate (`#0B1225` / `#090D1C`)
- **Typography**: `Inter` for general copy and `IBM Plex Sans` for engineering/data figures to achieve a clean technical style.
- **Layout**: Collapsible left sidebar navigation, top navigation bar with breadcrumbs, notifications queue, and user context menu.

---

## 📂 Project Directory Structure

```text
├── backend/
│   ├── config/          # DB config (Sequelize connection)
│   ├── middleware/      # JWT RBAC verification middleware
│   ├── models/          # Sequelize schemas (User, Project, Task, Document, etc.)
│   ├── routes/          # Express API route controllers
│   ├── seeders/         # Database seeding script with realistic data
│   ├── .env             # Server configurations & secrets
│   └── server.js        # Main server entrypoint
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable core design system library
│   │   ├── context/     # Auth & Toast global states
│   │   ├── layouts/     # Main page layout shell (sidebar, topbar)
│   │   ├── pages/       # Dashboard & Login modules
│   │   ├── App.jsx      # Navigation routing & provider wrappers
│   │   ├── index.css    # Tailwind v4 directives & theme configurations
│   │   └── main.jsx     # Root mount file
│   └── index.html       # Google Fonts loader and viewport setup
│
└── package.json         # Root scripts to orchestrate backend + frontend
```

---

## ⚙️ Quick Start Guide

### 1. Installation
Run the install command in the root folder. The root-level hook will automatically trigger package installations for both the `frontend` and `backend` projects:
```bash
npm install
```

### 2. Start Dev Servers Concurrently
Start both the backend API and Vite dev servers with a single command:
```bash
npm run dev
```

The application will launch on:
- **Frontend Console**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 🔐 Demonstration Accounts & Roles

To test the role-based access control and modules, use any of the preloaded accounts (or click them on the Login screen for instant prefilled sign-in):

| Name | Role | Email | Password |
|---|---|---|---|
| **Sarah Jenkins** | Admin | `admin@industrial-project.com` | `password123` |
| **Marcus Vance** | PMO Director | `director@industrial-project.com` | `password123` |
| **Elena Rostova** | Project Manager | `pm.buildings@industrial-project.com` | `password123` |
| **Carlos Mendez** | Engineer | `eng.mep@industrial-project.com` | `password123` |

---

## 📦 Reusable Base Component Library (Built)

1. **`DataTable`**: Supports local search, column sorting, pagination, and multi-actions.
2. **`StatCard`**: Visual metrics displaying trend badges and icons.
3. **`StatusBadge`**: Color-coded pill badges mapping On Track, At Risk, Delayed, and Completed.
4. **`Drawer`**: Professional slide-in sheet from the right for configuration and creation forms.
5. **`Modal`**: Clean centered confirmation dialog.
6. **`PageHeader`**: Navigation breadcrumbs, page title, and primary Action buttons.
7. **`LoadingSkeleton`**: Multi-layout pulse loaders for cards, tables, and dashboards.
8. **`Toast`**: Slide-in notifications for real-time success/warning/error alerts.
