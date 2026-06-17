const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getAuth } = require('firebase-admin/auth');
const config = require('../config');
const { calculateDailyCalorieBudget } = require('../utils/calorieBudget');

async function register(req, res, { db }) {
  try {
    const { Full_Name, Age, Weight, Height, Goal_Type, Gender, Email, Password, Activity_Factor } = req.body;

    const actFactor = Number(Activity_Factor) || 1.2;
    const Daily_Calorie_Budget = calculateDailyCalorieBudget({
      Age,
      Weight,
      Height,
      Gender,
      Activity_Factor: actFactor,
      Goal_Type,
    });
    const passwordHash = bcrypt.hashSync(Password, 10);

    const sql = `INSERT INTO Users (Full_Name, Age, Weight, Height, Gender, Goal_Type, Activity_Factor, Daily_Calorie_Budget, Email, Password_Hash) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [Full_Name, Age, Weight, Height, Gender, Goal_Type, actFactor, Daily_Calorie_Budget, Email, passwordHash], (err, result) => {
      if (err) {
        console.error('SQL error:', err);
        return res.status(500).json({ error: 'Database error during registration.' });
      }

      // JWT token is added here after registration
      const token = jwt.sign({ userId: result.insertId, email: Email }, config.jwtSecret, { expiresIn: '7d' });
      
      res.status(201).json({ 
          message: 'Account created successfully!', 
          userId: result.insertId, 
          token: token, 
          Daily_Calorie_Budget: Daily_Calorie_Budget 
      });
    });
  } catch (e) {
    console.error('Catch error:', e);
    res.status(500).json({ error: 'Registration failed.' });
  }
}

// ... garde ta fonction login telle quelle en dessous ...
async function login(req, res, { db }) {
  try {
    const { Email, Password } = req.body;
    db.query('SELECT * FROM Users WHERE Email = ?', [Email], (err, results) => {
      if (err || results.length === 0) return res.status(401).json({ error: 'User not found.' });
      const user = results[0];
      if (!user.Password_Hash || typeof user.Password_Hash !== 'string') {
        return res.status(401).json({
          error: 'This account uses Google sign-in. Log in with Google or set a password in Profile.',
        });
      }
      const match = bcrypt.compareSync(Password, user.Password_Hash);
      if (!match) return res.status(401).json({ error: 'Incorrect password.' });
      const token = jwt.sign({ userId: user.User_ID, email: user.Email }, config.jwtSecret, { expiresIn: '7d' });
      res.json({ message: 'Login successful', userId: user.User_ID, token });
    });
  } catch (e) {
    res.status(500).json({ error: 'Login failed.' });
  }
}

async function verifyFirebaseToken(req, res, { db }) {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'idToken is required.' });
    }

    const decodedToken = await getAuth().verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;

    if (!uid || !email) {
      return res.status(400).json({ error: 'Invalid Google token.' });
    }

    const findSql = `
      SELECT * FROM Users
      WHERE Firebase_UID = ? OR Email = ?
      LIMIT 1
    `;

    db.query(findSql, [uid, email], (err, results) => {
      if (err) {
        console.error('MySQL error:', err);
        return res.status(500).json({ error: 'Database error.' });
      }

      const createJwt = (user) => {
        return jwt.sign(
          { userId: user.User_ID, email: user.Email, firebaseUid: uid },
          config.jwtSecret,
          { expiresIn: '7d' }
        );
      };

      if (results.length > 0) {
        const user = results[0];

        if (!user.Firebase_UID) {
          const updateSql = `
            UPDATE Users
            SET Firebase_UID = ?
            WHERE User_ID = ?
          `;
          db.query(updateSql, [uid, user.User_ID], (updateErr) => {
            if (updateErr) {
              console.error('MySQL update error:', updateErr);
              return res.status(500).json({ error: 'Database error while linking account.' });
            }

            const token = createJwt(user);
            return res.json({ message: 'Google login successful', userId: user.User_ID, token });
          });
        } else {
          const token = createJwt(user);
          return res.json({ message: 'Google login successful', userId: user.User_ID, token });
        }
      } else {
        const insertSql = `
          INSERT INTO Users (Full_Name, Email, Firebase_UID)
          VALUES (?, ?, ?)
        `;
        db.query(insertSql, [name || email, email, uid], (insertErr, insertResult) => {
          if (insertErr) {
            console.error('MySQL insert error:', insertErr);
            return res.status(500).json({ error: 'Database error creating user.' });
          }

          const newUser = {
            User_ID: insertResult.insertId,
            Email: email,
          };
          const token = createJwt(newUser);

          return res.status(201).json({
            message: 'Google account linked and user created',
            userId: newUser.User_ID,
            token,
          });
        });
      }
    });
  } catch (error) {
    console.error('Firebase auth error:', error);
    return res.status(401).json({ error: 'Invalid Google token.' });
  }
}


module.exports = { register, login, verifyFirebaseToken };
