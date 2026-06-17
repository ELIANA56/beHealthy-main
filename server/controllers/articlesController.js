const articlesModel = require('../models/articlesModel');

/**
 * Helper that calculates the current day of the year (returns a number between 1 and 365)
 */
function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Main function - fetches the current dynamic feed (from start of year until today)
 */
async function listArticles(req, res, { db }) {
  try {
    const currentDay = getDayOfYear();

    const results = await articlesModel.getArticlesFeed(db, currentDay);
    
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching daily articles feed.' });
  }
}

module.exports = { listArticles };