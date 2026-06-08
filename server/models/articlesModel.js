function getArticlesFeed(db, currentDay) {
  // שולף רק מאמרים שה-Day_Index שלהם קטן או שווה ליום הנוכחי בשנה
  const sql = `SELECT * FROM Content_Hub WHERE Day_Index <= ? ORDER BY Day_Index DESC`;
  return new Promise((resolve, reject) => {
    db.query(sql, [currentDay], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

module.exports = { 
  getArticlesFeed 
};
