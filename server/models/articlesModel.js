function getArticlesFeed(db, currentDay) {
  // Fetch only articles whose Day_Index is less than or equal to the current day of year
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
