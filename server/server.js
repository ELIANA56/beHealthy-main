/**
 * SERVER.JS — נקודת כניסה לשרת Express.
 * טעינת routes, CORS, JSON. DB נוצר ידנית עם: node dbSetup.js
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const config = require('./config');

const authRoutes = require('./routes/authRoutes');
const mealsRoutes = require('./routes/mealsRoutes');
const workoutsRoutes = require('./routes/workoutsRoutes');
const recipesRoutes = require('./routes/recipesRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/workouts', workoutsRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/user', userRoutes);

app.use((req, res) => {
  console.log('Request reached unknown route:', req.url);
  return res.status(404).json({ error: 'Route not found: ' + req.url });
});

app.listen(config.port || 3001, () => console.log(`Server running on port ${config.port}`));

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception (server still running):', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
