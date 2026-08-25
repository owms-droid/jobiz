# Jobiz API

Jobiz is a robust RESTful API built with Express and MongoDB that helps users offer their services and connect with clients. It supports secure OAuth2 authentication (via GitHub) and manual user accounts, job posts management, input validation, and secure route-level authorization.

---

## Technical Stack
- **Backend Framework:** [Express](https://expressjs.com/) (v5)
- **Database:** [MongoDB Native Driver](https://mongodb.github.io/node-mongodb-native/)
- **Authentication:** [Passport.js](http://www.passportjs.org/) (GitHub OAuth & Session-based)
- **API Documentation:** [Swagger UI Express](https://github.com/scottie1984/swagger-ui-express) with [swagger-autogen](https://github.com/joaoochoa/swagger-autogen)

---

## Local Setup & Installation

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **pnpm** (Recommended package manager)
- **MongoDB** instance (Local or Atlas)

### 2. Clone and Install Dependencies
```bash
# Clone the repository and navigate to the project directory
cd jobiz

# Install dependencies using pnpm
pnpm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and copy the contents of [.env.example](.env.example):
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/jobiz
SESSION_SECRET=your-random-session-secret

# GitHub OAuth credentials
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
```

### 4. Run the Development Server
```bash
# Run using nodemon (auto-reloads on file changes)
pnpm dev
```
The server will start running on the specified `PORT` (default: `3000`).

---

## API Documentation (Swagger)

The project includes automatically generated Swagger API documentation. 

- **Access the docs:** Run the server and go to `http://localhost:3000/api-docs` in your browser.
- **Regenerate documentation:** If you modify routes or swagger descriptions, regenerate the schema:
  ```bash
  node swagger.js
  ```

---

## Folder Structure

```
├── config
│   └── passport.js          # Passport configuration & GitHub strategy
├── controllers
│   ├── auth.js              # Authentication flow handlers
│   ├── job_posts.js         # CRUD logic for job postings
│   └── users.js             # CRUD and profile management for users
├── data
│   └── database.js          # MongoDB database driver initialization
├── middleware
│   ├── authenticate.js      # Session-checking security middleware
│   └── validation.js        # Request schema validation
├── routes
│   ├── index.js             # Primary routing entry point
│   ├── auth.js              # Authentication endpoints
│   ├── job_posts.js         # Job post endpoints
│   ├── swagger.js           # Swagger documentation serving route
│   └── users.js             # User endpoints
├── server.js                # Server entry point
├── swagger.js               # Swagger auto-generation configuration script
└── swagger.json             # Generated Swagger schema
```

---

## Deployment Checklist
1. **Environment Variables:** Define `PORT`, `NODE_ENV=production`, `MONGODB_URI`, `SESSION_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `GITHUB_CALLBACK_URL` in your hosting platform (Render, Heroku, AWS, etc.).
2. **Production Callback:** Ensure your GitHub OAuth Application callback matches the production URL (e.g. `https://your-app.onrender.com/auth/github/callback`).
3. **Database Security:** Restrict your MongoDB cluster IP access to accept requests only from the hosting platform's servers.