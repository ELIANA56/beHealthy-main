/**
 * קונטרולר התחברות — הרשמה, login, והתחברות עם Google.
 * סיסמאות נשמרות מוצפנות (hash). מחזיר token + userId.
 */
const bcrypt = require('bcryptjs'); // הצפנת סיסמאות
const jwt = require('jsonwebtoken'); // יצירת token "כרטיס כניסה"
const { OAuth2Client } = require('google-auth-library');
const config = require('../config');
const { calculateDailyCalorieBudget } = require('../utils/calorieBudget');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // מ-.env

// יוצר JWT — תוקף 7 ימים
function createJwt(user, googleId) {
  const payload = { userId: user.User_ID, email: user.Email };
  if (googleId) payload.googleId = googleId; // מזהה Google אם רלוונטי
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '1d' });
}

// POST /api/auth/register — הרשמה עם אימייל
async function register(req, res, { db }) {
  try {
    const { Full_Name, Age, Weight, Height, Goal_Type, Gender, Email, Password, Activity_Factor } = req.body;

    const actFactor = Number(Activity_Factor) || 1.2; // רמת פעילות (1.2 = יושבני)
    // חישוב תקציב קלוריות יומי לפי גיל, משקל, גובה, מין, מטרה
    const Daily_Calorie_Budget = calculateDailyCalorieBudget({
      Age,
      Weight,
      Height,
      Gender,
      Activity_Factor: actFactor,
      Goal_Type,
    });
    const passwordHash = bcrypt.hashSync(Password, 10); // סיסמה מוצפנת — לא נשמרת כטקסט

    const sql = `INSERT INTO Users (Full_Name, Age, Weight, Height, Gender, Goal_Type, Activity_Factor, Daily_Calorie_Budget, Email, Password_Hash)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      sql,
      [Full_Name, Age, Weight, Height, Gender, Goal_Type, actFactor, Daily_Calorie_Budget, Email, passwordHash],
      (err, result) => {
        if (err) {
          console.error('SQL error:', err);
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already registered.' }); // אימייל כבר קיים
          }
          return res.status(500).json({ error: 'Database error during registration.' });
        }

        const token = createJwt({ User_ID: result.insertId, Email }); // insertId = מזהה המשתמש החדש
        res.status(201).json({
          message: 'Account created successfully!',
          userId: result.insertId,
          token,
          Daily_Calorie_Budget,
        });
      }
    );
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ error: 'Registration failed.' });
  }
}

// POST /api/auth/login — התחברות עם אימייל וסיסמה
async function login(req, res, { db }) {
  try {
    const { Email, Password } = req.body;
    db.query('SELECT * FROM Users WHERE Email = ?', [Email], (err, results) => {
      if (err || results.length === 0) return res.status(401).json({ error: 'User not found.' });
      const user = results[0];

      // משתמש שנרשם רק עם Google — אין לו Password_Hash
      if (!user.Password_Hash || typeof user.Password_Hash !== 'string') {
        return res.status(401).json({
          error: 'This account uses Google sign-in. Use Google or set a password in Profile.',
        });
      }
      const match = bcrypt.compareSync(Password, user.Password_Hash); // השוואת סיסמה מוצפנת
      if (!match) return res.status(401).json({ error: 'Incorrect password.' });
      const token = createJwt(user);
      res.json({ message: 'Login successful', userId: user.User_ID, token });
    });
  } catch (e) {
    res.status(500).json({ error: 'Login failed.' });
  }
}

// POST /api/auth/google — התחברות עם Google
async function googleAuth(req, res, { db }) {
  try {
    const { credential } = req.body; // token מ-Google מהדפדפן
    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required.' });
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({ error: 'Google login is not configured (missing GOOGLE_CLIENT_ID).' });
    }

    // מאמתים מול Google שה-token אמיתי
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const googleId = payload.sub; // מזהה ייחודי של Google
    const email = payload.email;
    const name = payload.name || payload.given_name || email;

    if (!googleId || !email) {
      return res.status(400).json({ error: 'Invalid Google token.' });
    }

    const findSql = `SELECT * FROM Users WHERE Google_ID = ? OR Email = ? LIMIT 1`;

    db.query(findSql, [googleId, email], (err, results) => {
      if (err) {
        console.error('MySQL error:', err);
        return res.status(500).json({ error: 'Database error.' });
      }

      if (results.length > 0) {
        const user = results[0]; // משתמש קיים

        if (!user.Google_ID) {
          // נרשם עם אימייל — עכשיו מקשרים את חשבון Google
          db.query('UPDATE Users SET Google_ID = ? WHERE User_ID = ?', [googleId, user.User_ID], (updateErr) => {
            if (updateErr) {
              console.error('MySQL update error:', updateErr);
              return res.status(500).json({ error: 'Database error while linking account.' });
            }
            return res.json({
              message: 'Google login successful',
              userId: user.User_ID,
              token: createJwt(user, googleId),
            });
          });
        } else {
          // כבר מקושר ל-Google — login רגיל
          return res.json({
            message: 'Google login successful',
            userId: user.User_ID,
            token: createJwt(user, googleId),
          });
        }
      } else {
        // משתמש חדש — יוצרים רשומה עם שם, אימייל ו-Google_ID בלבד
        const insertSql = `INSERT INTO Users (Full_Name, Email, Google_ID) VALUES (?, ?, ?)`;
        db.query(insertSql, [name, email, googleId], (insertErr, insertResult) => {
          if (insertErr) {
            console.error('MySQL insert error:', insertErr);
            return res.status(500).json({ error: 'Database error creating user.' });
          }
          const newUser = { User_ID: insertResult.insertId, Email: email };
          return res.status(201).json({
            message: 'Google account created',
            userId: newUser.User_ID,
            token: createJwt(newUser, googleId),
          });
        });
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(401).json({ error: 'Invalid Google token.' });
  }
}

module.exports = { register, login, googleAuth };
