# QuEventHub 🎓🎉

QuEventHub is a modern, full-stack campus event and community management platform. It allows students to discover events, join clubs, and stay engaged with campus life, while providing administrators and club organizers with the tools they need to manage their communities.

## ✨ Features

- **Role-Based Access Control:** Separate dashboards and permissions for **Students**, **Admins**, and **Clubs**.
- **Discover Events:** Browse, filter, and search upcoming technical, cultural, and sports events happening on campus.
- **Club Communities:** View all active clubs, check their schedules, and join them to become an active member.
- **Admin Dashboard:** Centralized control for administrators to manage users, create new clubs, and moderate content.
- **Club Dashboard:** Dedicated space for club organizers to create and manage their own events.
- **Secure Authentication:** JWT-based email authentication and session management.

## 🚀 Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS, React Router, Axios, Lucide Icons.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (Mongoose).
- **Authentication:** JSON Web Tokens (JWT), bcrypt for password hashing.
- **Image Storage:** Cloudinary.

## 🏗️ System Architecture & Data Flow

QuEventHub is built on a modern **Client-Server Architecture** decoupling the presentation layer from the business logic.

### 1. The Presentation Layer (Frontend)
- **Framework & Build Tool:** React.js powered by Vite for lightning-fast HMR and optimized production bundling.
- **State & Routing:** Uses React Router DOM for Client-Side Routing (SPA). Authentication state is persisted locally (localStorage) and managed across components to conditionally render UI based on the user's role (Student, Admin, Club).
- **Network Layer:** Axios is configured with interceptors to automatically attach JWT tokens to the `Authorization` header of every request, ensuring secure communication.

### 2. The API Layer (Backend)
- **Core Server:** Node.js running an Express.js server, exposing a RESTful API.
- **Security & Auth:** Utilizes `bcrypt` for one-way password hashing before saving to the database. Authentication is handled statelessly via **JSON Web Tokens (JWT)**. A custom authentication middleware (`authMiddleware.js`) intercepts protected routes, validates the JWT, and enforces role-based access control (RBAC).
- **File Handling:** `multer` intercepts multipart/form-data for image uploads, processes the stream in memory, and pushes the buffer to **Cloudinary** for scalable cloud storage.

### 3. The Data Layer
- **Database:** MongoDB acts as the primary NoSQL document store. 
- **ORM (Object Relational Mapping):** Mongoose enforces strict schema definitions, data validation, and manages relationships (e.g., embedding User ObjectIds inside Club `members` arrays or referencing Clubs in Event documents).

### 🔄 Request Lifecycle Example (Joining a Club)
1. **Client Action:** User clicks "Join Club".
2. **Axios Interceptor:** Grabs the JWT from localStorage and attaches it to the request header.
3. **Express Router:** Receives `POST /api/clubs/:id/join` and routes it to `authMiddleware`.
4. **Middleware Validation:** Decodes the JWT, verifies the signature, and attaches the `user` object to the `req`.
5. **Controller Logic:** `clubController.js` fetches the club via Mongoose, verifies the user isn't already a member, pushes the user's ID to the array, and saves to MongoDB.
6. **Response:** Returns a `200 OK`, and the React UI updates instantly.

### 📂 Project Structure

The repository is divided into two main folders: `frontend` and `backend`.

```text
QuEventHub/
│
├── backend/                  # Node.js + Express Backend
│   ├── controllers/          # Business logic for routes (auth, clubs, events, etc.)
│   ├── database/             # MongoDB connection setup
│   ├── middleware/           # JWT verification, Error handling, Multer (image uploads)
│   ├── models/               # Mongoose schemas (User, Event, Club)
│   ├── routes/               # API endpoint definitions
│   ├── utils/                # Helper scripts (Database seeding, Cloudinary config)
│   └── server.js             # Main entry point for the backend API
│
├── frontend/                 # React + Vite Frontend
│   ├── src/
│   │   ├── api.js            # Axios configuration & request interceptors
│   │   ├── components/       # Reusable UI components (Navbar, Footer, Modals)
│   │   ├── pages/            # Full-page views (Login, Register, Dashboard, Clubs)
│   │   ├── utils/            # Frontend helpers (Toast notifications, formatting)
│   │   ├── App.jsx           # Main React Router setup
│   │   └── main.jsx          # React DOM mounting
│   ├── index.html            # HTML template
│   └── vercel.json           # Vercel deployment configuration
│
└── README.md
```

## 📦 Local Setup

To run QuEventHub locally, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/QuEventHub.git
cd QuEventHub
```

### 2. Setup the Backend
Open a terminal and navigate to the backend directory:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory with the following variables:
```env
URL=mongodb://localhost:27017/event-management-system
PORT=5000
JWT_SECRET=your_super_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend development server:
```bash
npm run dev
```

### 3. Setup the Frontend
Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory (optional for local development since it defaults to localhost):
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## 🧪 Demo Accounts

The database automatically seeds demo accounts on startup. You can use the quick-login buttons on the login page or manually enter these credentials:

| Role | Login ID / Email | Password |
| :--- | :--- | :--- |
| **Student** | student@example.com | Student@123 |
| **Admin** | admin@example.com | Admin@123 |
| **Tech Club** | CLBTECH1 | Club@123 |
| **Culture Club** | CLBCULT1 | Club@123 |
| **Sports Club** | CLBSPRT1 | Club@123 |
| **Music Club** | CLBMUS1 | Club@123 |

## 🌍 Deployment Strategy & CI/CD

QuEventHub is designed to be highly scalable. The frontend is served via a global CDN, while the backend runs in isolated containers.

### Backend Deployment (Render)
Render provides a seamless, Docker-like containerized environment for Node.js applications.
1. **Repository Link:** Connect your GitHub repository to Render and create a new **Web Service**.
2. **Build Settings:** 
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. **Environment Setup:** Copy all variables from your local `.env` into the Render dashboard's Environment section.
4. **Keep-Alive Strategy:** Render's free tier spins down idle instances after 15 minutes, which causes a "cold start" delay (up to 50s) on the next request. To prevent this, the backend exposes a `/ping` route. You can set up a free ping service (like [cron-job.org](https://cron-job.org)) to hit `https://your-backend-app.onrender.com/ping` every 10 minutes, ensuring the server stays awake 24/7.

### Frontend Deployment (Vercel)
Vercel's Edge Network ensures the React Single Page Application (SPA) is delivered to users globally with near-zero latency.
1. **Repository Link:** Import your repository into the Vercel dashboard.
2. **Build Settings:** Vercel will auto-detect Vite. Set the **Root Directory** to `frontend`.
3. **Environment Injection:** 
   - Add `VITE_API_URL` to the Environment Variables.
   - **Value:** `https://your-backend-app.onrender.com/api` (Ensure there is no trailing slash).
   - *Note:* Because Vite bundles environment variables at build time, any changes to this variable require a manual **Redeploy** in the Vercel dashboard.
4. **SPA Routing:** The `vercel.json` file at the root of the frontend folder contains a rewrite rule (`"source": "/(.*)", "destination": "/index.html"`). This intercepts all URL paths and routes them to `index.html` so React Router can take over client-side, preventing 404 errors on direct links.
