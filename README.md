# Travels and Reimbursements - Zoho Expense Architecture

Full-Stack (MERN) Enterprise Travel & Expense Management System modelled after **Zoho Expense**.

## Key Features
- **Zoho Expense Dashboard:** Executive spend overview, interactive charts, metric analytics, and pending workflow lists.
- **Trips Management:** Pre-travel requests, approval status workflows, and itinerary details.
- **Expense Reports:** Receipt tracking with native OCR scanning heuristics.
- **Cash Advances Ledger:** Track employee cash advances and auto-reconciliation.
- **Role-Based Access Control (RBAC):** Admin, Manager, and Employee perspective views (`My View` vs `Admin View`).
- **Single-Deployment Architecture:** Express server serves the pre-built React Vite SPA, making deployment on platforms like Render, Railway, Heroku, or VPS instantaneous.

---

## Local Development

### 1. Install Dependencies
```bash
# In client
cd client && npm install

# In server
cd ../server && npm install
```

### 2. Run Locally
```bash
# Terminal 1 - Backend Server (Port 5050)
cd server
npm run dev

# Terminal 2 - Frontend Client (Port 3000)
cd client
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## Unified Production Deployment (Render, Railway, Fly.io, Heroku, or VPS)

### Build command
```bash
npm run build
```

### Start command
```bash
npm start
```

### Environment Variables
- `PORT` = `5050` (or system port assigned by hosting provider)
- `MONGODB_URI` = `mongodb+srv://<user>:<password>@cluster.mongodb.net/smartspend`
- `JWT_SECRET` = `your_super_secret_jwt_key`
