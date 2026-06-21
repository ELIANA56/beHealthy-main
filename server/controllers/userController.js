/**
 * קונטרולר פרופיל — קריאה, עדכון ומחיקת חשבון משתמש.
 */
const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const db = require('../utils/connection');
const { calculateDailyCalorieBudget } = require('../utils/calorieBudget');

// מסיר את Password_Hash לפני שליחה לדפדפן — הסיסמה לא יוצאת מהשרת
function stripSensitive(user) {
  const { Password_Hash, ...profile } = user;
  return profile;
}

// GET /api/user/:userId — טעינת פרופיל
exports.getUserProfile = async (req, res) => {
  try {
    const user = await userModel.getUserProfile(db, req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const profile = stripSensitive(user);
    profile.hasPassword = Boolean(user.Password_Hash); // האם יש סיסמה (Google-only = false)
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user profile.' });
  }
};

// PUT /api/user/:userId — עדכון פרופיל
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const existing = await userModel.getUserProfile(db, userId);
    if (!existing) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const {
      Full_Name,
      Age,
      Weight,
      Height,
      Gender,
      Goal_Type,
      Activity_Factor,
      Email,
      Current_Password,
      New_Password,
    } = req.body;

    // האם האימייל החדש תפוס על ידי משתמש אחר?
    const emailTaken = await userModel.findUserByEmailExcept(db, Email, userId);
    if (emailTaken) {
      return res.status(400).json({ error: 'Email is already in use.' });
    }

    const actFactor = Number(Activity_Factor) || Number(existing.Activity_Factor) || 1.2;
    const profileInput = {
      Age,
      Weight,
      Height,
      Gender,
      Activity_Factor: actFactor,
      Goal_Type,
    };
    // מחשב מחדש תקציב קלוריות אחרי שינוי משקל/גיל/מטרה
    const Daily_Calorie_Budget = calculateDailyCalorieBudget(profileInput);
    if (!Daily_Calorie_Budget) {
      return res.status(400).json({ error: 'Could not calculate calorie budget. Check age, weight, and height.' });
    }

    // שינוי סיסמה — אופציונלי
    if (New_Password) {
      if (existing.Password_Hash) {
        // יש סיסמה קיימת — חייבים את הישנה
        if (!Current_Password) {
          return res.status(400).json({ error: 'Current password is required to set a new password.' });
        }
        const match = bcrypt.compareSync(Current_Password, existing.Password_Hash);
        if (!match) {
          return res.status(401).json({ error: 'Current password is incorrect.' });
        }
      }
      const passwordHash = bcrypt.hashSync(New_Password, 10);
      await userModel.updatePassword(db, userId, passwordHash);
    }

    await userModel.updateUserProfile(db, userId, {
      Full_Name: String(Full_Name).trim(),
      Age: Number(Age),
      Weight: Number(Weight),
      Height: Number(Height),
      Gender,
      Goal_Type,
      Activity_Factor: actFactor,
      Daily_Calorie_Budget,
      Email: String(Email).trim().toLowerCase(),
    });

    const updated = await userModel.getUserProfile(db, userId);
    const profile = stripSensitive(updated);
    profile.hasPassword = Boolean(updated.Password_Hash);
    res.json({
      message: 'Profile updated.',
      user: profile,
      Daily_Calorie_Budget,
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
};

// DELETE /api/user/:userId — מחיקת חשבון + כל הנתונים
exports.deleteUserAccount = async (req, res) => {
  try {
    const userId = req.params.userId;
    const existing = await userModel.getUserProfile(db, userId);
    if (!existing) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const deleted = await userModel.deleteUserAccount(db, userId); // מוחק גם ארוחות, אימונים, מתכונים
    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete account.' });
    }

    res.json({ message: 'Account and all related data deleted.' });
  } catch (err) {
    console.error('Account delete error:', err);
    res.status(500).json({ error: 'Failed to delete account.' });
  }
};
