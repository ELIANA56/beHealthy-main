const articlesModel = require('../models/articlesModel');

/**
 * פונקציית עזר שמחשבת איזה יום זה היום בשנה (מחזירה מספר בין 1 ל-365)
 * היום, ה-26 למאי 2026, היא תחזיר בדיוק 146.
 */
function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * הפונקציה המרכזית - שולפת את הפיד הדינמי הנוכחי (מתחילת השנה ועד היום)
 */
async function listArticles(req, res, { db }) {
  try {
    const currentDay = getDayOfYear(); // יחזיר 146 היום

    // קריאה למודל עם היום הנוכחי בשנה
    const results = await articlesModel.getArticlesFeed(db, currentDay);
    
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching daily articles feed.' });
  }
}

module.exports = { listArticles };