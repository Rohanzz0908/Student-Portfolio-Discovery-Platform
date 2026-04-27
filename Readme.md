# 🚀 Student Portfolio Discovery Platform

A modern, full-stack MERN application designed to help students showcase their skills, projects, and certifications while enabling recruiters to discover talent and communicate in real-time.

## ✨ Features

-   **🔐 Secure Authentication**: JWT-based login and registration for Students and Recruiters.
-   **👤 Professional Profiles**: Customizable student profiles featuring skills, education, and social links.
-   **📁 Project Showcase**: Portfolio management with project details and GitHub integration.
-   **📜 Certifications**: Display verified achievements and certifications.
-   **💬 Real-time Messaging**: Instant communication between students and recruiters using Socket.io.
-   **💼 Job Board**: Discovery and application system for job opportunities.
-   **🎨 Premium UI**: Sleek, responsive design built with React, Vite, and Framer Motion for smooth animations.

## 🛠️ Tech Stack

**Frontend:**
-   React.js & Vite
-   Framer Motion (Animations)
-   React Router DOM (Navigation)
-   Axios (API Calls)
-   Socket.io-client (Real-time)

**Backend:**
-   Node.js & Express
-   MongoDB & Mongoose (Database)
-   JSON Web Tokens (JWT)
-   Bcryptjs (Password Hashing)
-   Socket.io (Real-time Engine)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd fffff
```

### 2. Setup Backend
1. Navigate to the backend folder:
    ```bash
    cd backend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Configure Environment Variables:
    - Create a `.env` file from `.env.example`:
        ```bash
        cp .env.example .env
        ```
    - Update the variables in `.env` (MongoDB URI, JWT Secret, etc.).
4. Start the server:
    ```bash
    npm run dev
    ```

### 3. Setup Frontend
1. Navigate to the frontend folder:
    ```bash
    cd ../frontend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Configure Environment Variables:
    - Create a `.env` file from `.env.example`:
        ```bash
        cp .env.example .env
        ```
    - Ensure `VITE_API_URL` points to your backend server.
4. Start the development server:
    ```bash
    npm run dev
    ```

---

## 📂 Project Structure

```text
├── backend/
│   ├── config/         # Database and configuration
│   ├── controllers/    # API logic
│   ├── middleware/     # Auth and error handling
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routes
│   └── server.js       # Entry point
├── frontend/
│   ├── src/
│   │   ├── api/        # Axios configuration
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Global state management
│   │   ├── pages/      # Application views
│   │   └── App.jsx     # Main routing logic
│   └── index.html
└── README.md
```

## 👥 Authors

- **Rohan**n- [Rohan](https://github.com/Rohanzz0908)

