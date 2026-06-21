/**
 * MIDDLEWARE אימות — בודק JWT לפני כניסה ל-route מוגן.
 *
 * Middleware = "שומר סף" — רץ לפני הקונטרולר.
 * אם ה-token תקין → next() ממשיך הלאה.
 * אם לא → 401 ועוצר.
 *
 * הדפדפן צריך לשלוח: Authorization: Bearer <token>
 * (כרגע רוב ה-routes לא מחוברים ל-middleware הזה)
 */
const jwt = require('jsonwebtoken'); // ספרייה לבדיקת token
const config = require('../config'); // jwtSecret — המפתח שחתם את ה-token

module.exports = function authMiddleware(req, res, next) {
  // req.headers = כל מה שהדפדפן שלח ב-header של הבקשה
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Unauthorized' }); // אין header בכלל

  // מפרקים: "Bearer abc123" → ["Bearer", "abc123"]
  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid auth header' }); // פורmat לא נכון
  }

  const token = parts[1]; // רק החלק של ה-token (בלי המילה Bearer)

  try {
    // מאמתים: האם ה-token אמיתי, לא פג תוקף, ונחתם עם jwtSecret שלנו
    const decoded = jwt.verify(token, config.jwtSecret);
    // decoded ≈ { userId: 5, email: "user@mail.com" }

    req.user = decoded; // שומרים על req — הקונטרולר יוכל לקרוא req.user
    next(); // OK — מעבירים לשלב הבא (route / controller)
  } catch (err) {
    // token מזויף, פג תוקף (7 ימים), או פגום
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
