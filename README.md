# Authentication & Product CRUD APIs

A small e-commerce project with a secure REST API and a React frontend.

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT access + refresh tokens, bcrypt, express-validator
- **Frontend:** React (Vite), React Router, plain CSS
- **Repository layout:** `backend/` and `frontend/` in a single repo

## Features

- Register, login, refresh token, logout, and "me" endpoints
- Passwords hashed with bcrypt (10 salt rounds), never returned by the API
- Short-lived access token (15 min) in the JSON response, long-lived refresh token (7 days) in an httpOnly cookie
- Refresh token stored in the database as a SHA-256 hash, so it can be revoked on logout; refresh tokens are rotated and reuse is rejected
- Product CRUD with public reads and protected writes (`authenticate` middleware)
- express-validator on every route that takes body, params or query input, with field-level 400 errors
- Frontend with register/login pages, product listing with pagination, add/edit/delete forms, protected routes, and automatic silent token refresh

## Setup

Requirements: Node.js 18+ and a running MongoDB (local, or a free MongoDB Atlas cluster).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # on Windows: copy .env.example .env
# edit .env: set MONGO_URI and two different long random secrets
npm run dev               # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

In development Vite proxies `/api` to `http://localhost:5000`, so no extra frontend config is needed.

## Environment variables (backend/.env)

| Variable | Purpose |
|---|---|
| `PORT` | Server port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `ACCESS_TOKEN_SECRET` | Secret for signing access tokens |
| `REFRESH_TOKEN_SECRET` | Secret for signing refresh tokens (use a different value) |
| `ACCESS_TOKEN_EXPIRES` | Access token lifetime, default `15m` |
| `REFRESH_TOKEN_EXPIRES` | Refresh token lifetime, default `7d` |
| `CLIENT_URL` | Frontend origin allowed by CORS |
| `COOKIE_SAMESITE` | `lax` (default). Use `none` only if frontend and backend are on different domains in production (needs HTTPS) |

## API endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create a new user account |
| POST | `/api/auth/login` | Public | Log in, returns access token (+ sets refresh cookie) |
| POST | `/api/auth/refresh-token` | Public* | Issue a new access token (rotates refresh token) |
| POST | `/api/auth/logout` | Authenticated | Invalidate the refresh token |
| GET | `/api/auth/me` | Authenticated | Return the logged-in user's profile |
| POST | `/api/products` | Authenticated | Create a product |
| GET | `/api/products` | Public | List products (`?page=1&limit=10`) |
| GET | `/api/products/:id` | Public | Get one product |
| PUT | `/api/products/:id` | Authenticated | Update a product |
| DELETE | `/api/products/:id` | Authenticated | Delete a product |

\* requires a valid refresh token (sent in the httpOnly cookie).

Protected routes need the header `Authorization: Bearer <accessToken>`.

### Example requests

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Asha","email":"asha@example.com","password":"Secret123","confirmPassword":"Secret123"}'

# Login (save the cookie in a file)
curl -c cookies.txt -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"asha@example.com","password":"Secret123"}'

# Create a product with the accessToken from the login response
curl -X POST http://localhost:5000/api/products -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"name":"Keyboard","price":1499,"stock":25,"category":"Accessories"}'

# Get a new access token using the refresh cookie
curl -b cookies.txt -c cookies.txt -X POST http://localhost:5000/api/auth/refresh-token
```

### Validation error format

```json
{
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Enter a valid email address" },
    { "field": "password", "message": "Password must be 8+ characters with an uppercase letter, a lowercase letter and a number" }
  ]
}
```

## How the auth flow works

1. **Login** verifies the password with `bcrypt.compare`, creates an access token and a refresh token, saves a hash of the refresh token on the user, and sets the refresh token as an httpOnly cookie.
2. The frontend keeps the access token **in memory** and sends it as a Bearer token on every request.
3. When the access token expires, the API answers 401. The frontend's `api()` helper calls `/api/auth/refresh-token`, gets a new access token, and repeats the failed request, all without the user noticing.
4. Each refresh **rotates** the refresh token. If an old token is used again, the server revokes the session (403) and the user must log in again.
5. **Logout** deletes the stored hash and clears the cookie, so the refresh token can never be used again.
6. On page reload the access token is gone from memory, so the app calls `/refresh-token` once at startup to restore the session.

## Project structure

```
backend/src/
  server.js  app.js  config/db.js
  models/        User.js, Product.js
  routes/        auth.routes.js, product.routes.js
  controllers/   auth.controller.js, product.controller.js
  middleware/    authenticate.js, validate.js, errorHandler.js
  validators/    auth.validators.js, product.validators.js
  utils/         tokens.js, asyncHandler.js

frontend/src/
  main.jsx  App.jsx  index.css
  api/client.js            fetch wrapper + automatic token refresh
  context/AuthContext.jsx  login / register / logout / session restore
  components/              Navbar, ProtectedRoute, FormField, ProductForm, ProductCard
  pages/                   Login, Register, Products, Profile
```

## Deployment notes

- Deploy the backend (e.g. Render, Railway) with the environment variables above and `NODE_ENV=production`; use MongoDB Atlas for `MONGO_URI`.
- Deploy the frontend (e.g. Vercel, Netlify) with `VITE_API_URL` set to the backend URL, and set the backend's `CLIENT_URL` to the frontend URL.
- If the two are on different domains, set `COOKIE_SAMESITE=none` on the backend (HTTPS required) so the browser sends the refresh cookie.

## Links

- GitHub repo: _add your link here_
- Live link: _add your link here_
