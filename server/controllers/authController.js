const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

async function register(req, res, { db }) {
  try {
    const { Full_Name, Age, Weight, Height, Goal_Type, Gender, Email, Password, Activity_Factor } = req.body;

    const ageNum = Number(Age);
    const weightKg = Number(Weight) || 0;
    const heightCm = Number(Height) || 0;
    const actFactor = Number(Activity_Factor) || 1.2;
    
    let bmr = (Gender && /f|female/i.test(Gender)) 
      ? (10 * weightKg + 6.25 * heightCm - 5 * ageNum - 161)
      : (10 * weightKg + 6.25 * heightCm - 5 * ageNum + 5);
      
    const Daily_Calorie_Budget = Math.round(bmr * actFactor);
    const passwordHash = bcrypt.hashSync(Password, 10);

    const sql = `INSERT INTO Users (Full_Name, Age, Weight, Height, Gender, Goal_Type, Daily_Calorie_Budget, Email, Password_Hash) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [Full_Name, Age, Weight, Height, Gender, Goal_Type, Daily_Calorie_Budget, Email, passwordHash], (err, result) => {
      if (err) {
        console.error("Erreur SQL :", err);
        return res.status(500).json({ error: 'Database error during registration.' });
      }

      // C'EST ICI QUE TU AJOUTES LE TOKEN
      const token = jwt.sign({ userId: result.insertId, email: Email }, config.jwtSecret, { expiresIn: '7d' });
      
      res.status(201).json({ 
          message: 'Account created successfully!', 
          userId: result.insertId, 
          token: token, 
          Daily_Calorie_Budget: Daily_Calorie_Budget 
      });
    });
  } catch (e) {
    console.error("Erreur catch :", e);
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
      const match = bcrypt.compareSync(Password, user.Password_Hash);
      if (!match) return res.status(401).json({ error: 'Incorrect password.' });
      const token = jwt.sign({ userId: user.User_ID, email: user.Email }, config.jwtSecret, { expiresIn: '7d' });
      res.json({ message: 'Login successful', userId: user.User_ID, token });
    });
  } catch (e) {
    res.status(500).json({ error: 'Login failed.' });
  }
}

module.exports = { register, login };
