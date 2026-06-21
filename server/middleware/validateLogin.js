/**
 * MIDDLEWARE ולידציה — Login (POST /api/auth/login).
 *
 * רץ לפני authController.login.
 * בודק שהנתונים בסיסיים תקינים לפני שמגיעים ל-DB.
 */
module.exports = function validateLogin(req, res, next) {
  const { Email, Password } = req.body; // מה שהמשתמש שלח מהטופס

  // חובה שני השדות
  if (!Email || !Password) return res.status(400).json({ error: 'Email and Password required' });

  // regex — בודק שזה נראה כמו אימייל (יש @ ונקודה)
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(String(Email).toLowerCase())) return res.status(400).json({ error: 'Invalid email format.' });

  // סיסמה לפחות 8 תווים
  if (String(Password).length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters long.' });

  next(); // הכל בסדר — ממשיכים ל-login controller
};
