# Deployment Guide

This document covers the strategies and steps required to deploy the HRMS application to production environments.

## 1. Production Architecture Overview
- **Database:** MongoDB Atlas (Cloud Database)
- **Backend (API):** Render / Heroku / AWS ECS (Node.js runtime)
- **Frontend (Client):** Vercel / Netlify (Static Site Hosting)

## 2. Environment Configuration

### Backend Environment Variables (`server/.env`)
Ensure these are set securely in your hosting provider's dashboard:
```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/hrms_prod?retryWrites=true&w=majority

# Authentication
# Must be a long, cryptographically secure random string in production
JWT_SECRET=c2VjdXJlX2dlbmVyYXRlZF9wcm9kX3Rva2VuX2hlcmU...
JWT_EXPIRES_IN=12h

# Security & CORS
# Restrict CORS to exactly your frontend domain
FRONTEND_URL=https://hrms.yourcompany.com
```

### Frontend Environment Variables (`client/.env`)
```env
# The absolute URL of your production backend API
VITE_API_URL=https://api.hrms.yourcompany.com/api/v1
```

---

## 3. Deployment Steps

### A. Database (MongoDB Atlas)
1. Create a cluster on MongoDB Atlas.
2. In Network Access, whitelist the IP addresses of your Backend server.
3. In Database Access, create a user with read/write privileges specifically for the `hrms_prod` database.
4. Obtain the connection string and set it as `MONGODB_URI` in the backend.

### B. Backend (Render/Heroku)
1. Link your repository to your hosting provider.
2. Set the root directory to `server`.
3. **Build Command:**
   ```bash
   npm install && npm run build
   ```
4. **Start Command:**
   ```bash
   npm start
   ```
   *(Ensure `npm start` is mapped to `node dist/server.js` or `node dist/index.js` depending on your build output).*

### C. Frontend (Vercel)
1. Link your repository to Vercel.
2. Set the Framework Preset to **Vite**.
3. Set the Root Directory to `client`.
4. Add the `VITE_API_URL` environment variable.
5. Vercel will automatically run `npm run build` and deploy the `dist` folder to a global CDN.

---

## 4. Post-Deployment Verification
1. Open the deployed frontend URL.
2. Ensure the login screen renders.
3. Open the browser Network tab and verify that login requests are sent to the correct production `VITE_API_URL`.
4. Verify that responses include appropriate CORS headers and secure cookies (if applicable).
5. Attempt a database write (e.g., Check-In) to verify MongoDB connectivity.

> [!WARNING]
> Never commit `.env` files to version control. Always use the deployment platform's secret manager to inject environment variables securely.
