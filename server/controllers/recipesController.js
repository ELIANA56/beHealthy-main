// מייבאים את המודל החדש שייצרנו
const recipesModel = require('../models/recipesModel');

/**
 * 1. הצגת כל המתכונים באתר (השליפה מהמודל)
 */
exports.listRecipes = async (req, res, context) => {
    const { db } = context;

    try {
        // קריאה לפונקציה מהמודל וקבלת התוצאות
        const results = await recipesModel.listRecipes(db);

        // הפיכת טקסט ה-JSON של המצרכים וההוראות בחזרה למערכים עבור ה-React
        const formattedRecipes = results.map(recipe => ({
            ...recipe,
            Ingredients: JSON.parse(recipe.Ingredients || '[]'),
            Instructions: JSON.parse(recipe.Instructions || '[]')
        }));

        return res.json(formattedRecipes);
    } catch (err) {
        console.error("Error in listRecipes controller:", err);
        return res.status(500).json({ error: "שגיאה בשליפת מאגר המתכונים" });
    }
};

/**
 * 2. יצירת מתכון דינמי דרך ג'מיני ושמירה ב-Database דרך המודל
 */
exports.getDynamicRecommendation = async (req, res, context) => {
    const { db, ai } = context;
    const { Target_Calories, User_Request } = req.body;

    if (!Target_Calories || !User_Request) {
        return res.status(400).json({ error: "חובה לספק קלוריות יעד ובקשת מצרכים." });
    }

    try {
        // קריאה לג'מיני
        const prompt = `
          You are an expert nutritionist and chef AI. Generate ONE delicious recipe that strictly fits these rules:
          1. Target Calories: Around ${Target_Calories} calories.
          2. Ingredients available: "${User_Request}".
          Provide your answer strictly as a valid JSON object without markdown blocks.
          All text fields must be in Hebrew.
          Structure:
          {
            "Recipe_Name": "שם המתכון",
            "Prep_Time": "זמן הכנה",
            "Ingredients": ["מצרך 1", "מצרך 2"],
            "Instructions": ["שלב 1"],
            "Calories": ${Target_Calories},
            "Protein": (number), "Carbs": (number), "Fats": (number)
          }
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [prompt]
        });

        let cleanText = response.text.trim();
        if (cleanText.startsWith("```json")) cleanText = cleanText.replace(/```json|```/g, "").trim();
        
        const recipeData = JSON.parse(cleanText);

        // הכנת המערך לשמירה ב-DB
        const recipeValues = [
            recipeData.Recipe_Name,
            JSON.stringify(recipeData.Ingredients),
            JSON.stringify(recipeData.Instructions),
            recipeData.Calories,
            recipeData.Protein,
            recipeData.Carbs,
            recipeData.Fats
        ];

        //  שימוש במודל לשמירת הנתונים!
        const result = await recipesModel.createRecipe(db, recipeValues);
        
        recipeData.Recipe_ID = result.insertId;
        return res.json(recipeData);

    } catch (error) {
        console.error("Error in dynamic recipe handler:", error);
        return res.status(500).json({ error: "תקלה בתהליך ייצור המתכון" });
    }
};