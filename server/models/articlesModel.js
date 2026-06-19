function getWeeklyArticles(db, currentWeek) {
  const sql = `SELECT Article_ID, Week_Number, Title, Category, Summary, Content, Created_At
    FROM Content_Hub
    WHERE Week_Number <= ?
    ORDER BY Week_Number DESC`;
  return new Promise((resolve, reject) => {
    db.query(sql, [currentWeek], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

function getArticleByWeek(db, weekNumber) {
  const sql = `SELECT * FROM Content_Hub WHERE Week_Number = ? LIMIT 1`;
  return new Promise((resolve, reject) => {
    db.query(sql, [weekNumber], (err, results) => {
      if (err) return reject(err);
      resolve(results[0] || null);
    });
  });
}

module.exports = {
  getWeeklyArticles,
  getArticleByWeek,
};
