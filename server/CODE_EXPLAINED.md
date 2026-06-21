# BeHealthy — Code Explained (Simple Guide)

This document explains **what every part of the app does** in plain language.
You do not need to be an expert programmer to follow it.

---

## The big picture

BeHealthy has **two programs** that work together:

| Part | Folder | Port | What it does |
|------|--------|------|--------------|
| **Frontend** (what you see) | `be/` | 3000 | React website in the browser |
| **Backend** (the brain) | `beHealthy-main/server/` | 3001 | Express server + MySQL database |

When the browser calls `/api/...`, React **automatically forwards** that request to the backend (see `package.json` → `"proxy": "http://localhost:3001"`).

```
Browser (localhost:3000)
    → fetch('/api/meals/...')
    → proxy sends to server (localhost:3001)
    → server reads/writes MySQL
    → JSON response back to browser
```

---

## How a user moves through the app

1. **Login** (`/login`) or **Register** (`/register`) — email/password or Google.
2. After login, `userId` and `token` are saved in **localStorage** (browser storage).
3. **ProtectedRoute** checks: are you logged in? Is your profile complete?
4. If profile is incomplete → forced to **Profile** (`/profile`) first.
5. Then you can use **Home**, **Workout**, **Recipes**, and **Profile**.

---

## Authentication (sign in / sign up)

### Email + password
- **Register**: form sends your details to `POST /api/auth/register`. Server hashes the password (never stores plain text), calculates your daily calorie budget, saves user in MySQL, returns a JWT token.
- **Login**: `POST /api/auth/login` checks email + password with bcrypt, returns token.

### Google sign-in
- Google button gives a **credential** (proof Google verified you).
- Frontend sends it to `POST /api/auth/google`.
- Server verifies with Google, finds or creates user, returns token.
- New Google users go to **Profile** to fill age, weight, etc.

### Session storage (`authSession.js`)
- `saveAuthSession` — stores `token` + `userId` in localStorage.
- `clearAuthSession` — removes them on logout.
- `loginWithGoogle` — calls the Google API endpoint.

**JWT token** = a signed string that proves "this user is logged in" (valid 7 days). Most API calls do not send it yet — that is a future improvement.

---

## Calorie budget — how numbers are calculated

### Daily budget (Profile / Register)
File: `server/utils/calorieBudget.js`

1. **BMR** (basal metabolic rate) — calories your body burns at rest. Formula: Mifflin-St Jeor (uses age, weight, height, gender).
2. **TDEE** = BMR × **activity factor** (1.2 sedentary … 1.725 very active).
3. **Goal adjustment**:
   - הרזיה (weight loss) → **−500** kcal
   - מסה (mass gain) → **+300** kcal
   - תחזוקה (maintenance) → **0**
4. Minimum budget: **1200** kcal/day.

### Today's budget on Home dashboard
- **Base budget** from profile.
- **Workout bonus**: you can eat back **60%** of calories burned today from workouts.
- `adjustedBudget = baseBudget + workoutBonus`

### Per-meal targets (Meal Scanner)
Breakfast 25%, Lunch 35%, Dinner 30%, Snack 10% of today's adjusted budget.

### Protein target
- Base: **weight (kg) × 1.2** grams per day.
- Extra protein added after workouts (depends on type and intensity).

---

## Pages (frontend)

### `App.js` — traffic controller
Defines all URLs and which page component loads. Wraps app in Google OAuth provider.

### `Login.js` / `Register.js`
Forms + Google button. On success → save session → navigate.

### `ProtectedRoute.js` — gatekeeper
- No `userId`? → redirect to login.
- Profile incomplete? → redirect to profile (except when already on profile page).
- Listens for `profile-updated` event to re-check after save.

### `Profile.js`
Load user from `GET /api/user/:userId`. Edit fields. Save with `PUT /api/user/:userId`. Calorie budget is read-only (server recalculates). Can delete account with `DELETE /api/user/:userId`.

### `Home.js` — dashboard
- Stats from `GET /api/dashboard/stats/:userId` (calories eaten vs budget, protein).
- Meal list from `GET /api/meals/user/:userId`.
- Includes **MealScanner** to log meals.
- Edit/delete meals for today.

### `MealScanner.js`
Two ways to log food:
1. **Photo** — image sent to AI (`POST /api/meals/analyze`), returns estimated nutrition. You review and save.
2. **Manual** — type name and calories yourself.

**Rule**: one Breakfast, Lunch, Dinner per day (Snack can repeat).

### `Workout.js`
Log workouts. Server estimates calories burned from type, duration, intensity, and your weight. Adds nutrition advice (extra calories + protein).

### `Recipes.js`
Pick ingredients from categories → AI generates a recipe (`POST /api/recipes/generate-fridge`). Save, edit, delete saved recipes.

### Layout (`Layout.js`, `Sidebar.js`, `Navbar.js`)
Sidebar = menu links. Navbar = page title + Log out button.

---

## Backend structure

```
server.js          → starts Express, runs DB migrations, mounts routes
routes/            → URL paths (e.g. /api/auth/login)
controllers/       → business logic for each route
models/            → SQL queries to MySQL tables
middleware/        → validation + auth checks before controller
services/          → shared logic (AI, workout math)
utils/             → DB connection, calorie math, migrations
```

### Main API routes

| Route prefix | Purpose |
|--------------|---------|
| `/api/auth` | register, login, google |
| `/api/user` | get/update/delete profile |
| `/api/meals` | analyze, log, list, edit, delete meals |
| `/api/workouts` | log workouts, estimates, today's summary |
| `/api/recipes` | AI recipes, save/list/edit/delete |
| `/api/dashboard` | today's calorie + protein stats |

### Database tables (MySQL `behealthydb`)
- **Users** — profile, password hash, Google ID, calorie budget
- **Meals** — logged food
- **Workouts** — exercise sessions
- **Recipes** — saved AI recipes

Run `node dbSetup.js` once to create all tables (or after schema changes on a fresh database).

---

## Environment variables (`.env`)

**Frontend** (`be/.env`):
- `REACT_APP_GOOGLE_CLIENT_ID` — same Google OAuth Web Client ID

**Backend** (`server/.env`):
- `GOOGLE_CLIENT_ID` — must match frontend
- `PORT=3001`
- `GENAI_API_KEY` — for AI meal analysis and recipes
- `JWT_SECRET` — optional, signs login tokens

---

## File index — frontend (`be/src/`)

| File | What it does |
|------|----------------|
| `index.js` | Starts React app in the browser |
| `App.js` | Routes and page wiring |
| `utils/authSession.js` | Save/clear login, Google login helper |
| `utils/profileUtils.js` | Check if profile is complete |
| `utils/dateFormat.js` | Today's date without timezone bugs |
| `components/auth/Login.js` | Login page |
| `components/auth/Register.js` | Sign-up page |
| `components/auth/Profile.js` | Edit profile + delete account |
| `components/auth/ProtectedRoute.js` | Blocks pages if not logged in |
| `components/auth/AuthCard.js` | Shared card layout for auth pages |
| `components/auth/GoogleAuthSection.js` | Google sign-in button |
| `components/auth/authStyles.js` | Shared CSS-in-JS for auth pages |
| `components/dashboard/Home.js` | Main dashboard |
| `components/dashboard/MealScanner.js` | Log meals (photo or manual) |
| `components/dashboard/Workout.js` | Log workouts |
| `components/dashboard/Recipes.js` | AI recipes from fridge ingredients |
| `components/Layout/Layout.js` | Sidebar + navbar shell |
| `components/Layout/Sidebar.js` | Left navigation menu |
| `components/Layout/Navbar.js` | Top bar + logout |

---

## File index — backend (`beHealthy-main/server/`)

| File | What it does |
|------|----------------|
| `server.js` | Entry point — Express app |
| `config/index.js` | DB credentials, port, JWT secret |
| `utils/connection.js` | MySQL connection |
| `utils/calorieBudget.js` | Daily calorie calculation |
| `controllers/authController.js` | Register, login, Google auth |
| `controllers/userController.js` | Profile CRUD + delete account |
| `controllers/dashboardController.js` | Today's stats for Home |
| `controllers/mealsController.js` | Meals CRUD + AI analyze |
| `controllers/workoutsController.js` | Workouts CRUD + estimates |
| `controllers/recipesController.js` | Recipe generation + CRUD |
| `services/aiService.js` | Calls Google Gemini for meals/recipes |
| `services/workoutNutrition.js` | Calorie burn + protein advice |
| `models/*.js` | SQL for each table |
| `routes/*.js` | Maps URLs to controllers |
| `middleware/*.js` | Input validation, JWT check |

---

## How to run locally

```bash
# Terminal 1 — backend (create DB tables first if needed)
cd beHealthy-main/server
node dbSetup.js
PORT=3001 node server.js

# Terminal 2 — frontend
cd be
npm start
```

Open http://localhost:3000

---

## Glossary

| Term | Meaning |
|------|---------|
| **React** | JavaScript library for building web pages from components |
| **Express** | Node.js framework for HTTP APIs |
| **API** | Backend URLs the frontend calls with `fetch` |
| **JWT** | JSON Web Token — login proof |
| **localStorage** | Browser storage that survives page refresh |
| **Proxy** | Dev server trick: `/api` calls go to port 3001 |
| **Migration** | Script that updates database structure on startup |
| **bcrypt** | One-way password hashing (secure storage) |
