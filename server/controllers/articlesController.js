const articlesModel = require('../models/articlesModel');
const { getWeekOfYear } = require('../utils/migrateArticles');

async function listWeeklyArticles(req, res, { db }) {
  try {
    const currentWeek = getWeekOfYear();
    const articles = await articlesModel.getWeeklyArticles(db, currentWeek);
    const featured = articles[0] || null;

    res.json({
      currentWeek,
      totalWeeks: 52,
      featured,
      articles,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load weekly articles.' });
  }
}

module.exports = { listWeeklyArticles };
