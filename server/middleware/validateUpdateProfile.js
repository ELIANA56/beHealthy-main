/**
 * MIDDLEWARE ולידציה — עדכון פרופיל (PUT /api/user/:userId).
 *
 * בודק שדות חובה, אימייל, גיל/משקל/גובה בטווח, וסיסמה חדשה (אם יש).
 */
module.exports = function validateUpdateProfile(req, res, next) {
  const { Full_Name, Age, Weight, Height, Gender, Goal_Type, Email, New_Password } = req.body;

  const missing = [];
  ['Full_Name', 'Age', 'Weight', 'Height', 'Gender', 'Goal_Type', 'Email'].forEach((k) => {
    if (req.body[k] === undefined || req.body[k] === null || String(req.body[k]).trim() === '') {
      missing.push(k);
    }
  });
  if (missing.length) {
    return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` });
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(String(Email).toLowerCase())) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  const ageNum = Number(Age);
  const weightNum = Number(Weight);
  const heightNum = Number(Height);
  if (!Number.isFinite(ageNum) || ageNum < 10 || ageNum > 120) {
    return res.status(400).json({ error: 'Age must be between 10 and 120.' });
  }
  if (!Number.isFinite(weightNum) || weightNum < 20 || weightNum > 400) {
    return res.status(400).json({ error: 'Weight must be between 20 and 400 kg.' });
  }
  if (!Number.isFinite(heightNum) || heightNum < 50 || heightNum > 272) {
    return res.status(400).json({ error: 'Height must be between 50 and 272 cm.' });
  }

  // New_Password אופציונלי — אבל אם ממלאים, לפחות 8 תווים
  if (New_Password && String(New_Password).length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters.' });
  }

  next(); // עובר ל-userController.updateUserProfile
};
