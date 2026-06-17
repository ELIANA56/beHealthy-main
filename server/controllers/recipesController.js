// Import the recipes model
const recipesModel = require('../models/recipesModel');

/**
 * 1. List all recipes on the site (fetch from model)
 */
exports.listRecipes = async (req, res, context) => {
    const { db } = context;

    try {
        const results = await recipesModel.listRecipes(db);

        // Parse JSON text for ingredients and instructions back into arrays for React
        const formattedRecipes = results.map(recipe => ({
            ...recipe,
            Ingredients: JSON.parse(recipe.Ingredients || '[]'),
            Instructions: JSON.parse(recipe.Instructions || '[]')
        }));

        return res.json(formattedRecipes);
    } catch (err) {
        console.error("Error in listRecipes controller:", err);
        return res.status(500).json({ error: "Error fetching recipe database" });
    }
};

/**
 * 2. Create a dynamic recipe via Gemini and save to database through the model
 */
exports.getDynamicRecommendation = async (req, res, context) => {
    const { db, ai } = context;
    const { Target_Calories, User_Request } = req.body;

    if (!Target_Calories || !User_Request) {
        return res.status(400).json({ error: "Target calories and ingredient request are required." });
    }

    try {
        const prompt = `
          You are an expert nutritionist and chef AI. Generate ONE delicious recipe that strictly fits these rules:
          1. Target Calories: Around ${Target_Calories} calories.
          2. Ingredients available: "${User_Request}".
          Provide your answer strictly as a valid JSON object without markdown blocks.
          All text fields must be in English.
          Structure:
          {
            "Recipe_Name": "Recipe name",
            "Prep_Time": "Prep time",
            "Ingredients": ["ingredient 1", "ingredient 2"],
            "Instructions": ["step 1"],
            "Calories": ${Target_Calories},
            "Protein": (number), "Carbs": (number), "Fats": (number)
          }
        `;

        const recipeData = await ai.generateCustomRecipe(Target_Calories, User_Request);

        if (!recipeData || !recipeData.Recipe_Name) {
          return res.status(500).json({ error: 'Unable to generate a valid recipe from AI.' });
        }

        const recipeValues = [
            recipeData.Recipe_Name,
            JSON.stringify(recipeData.Ingredients),
            JSON.stringify(recipeData.Instructions),
            recipeData.Calories,
            recipeData.Protein,
            recipeData.Carbs,
            recipeData.Fats
        ];

        const result = await recipesModel.createRecipe(db, recipeValues);

        recipeData.Recipe_ID = result.insertId;
        return res.json(recipeData);

    } catch (error) {
        console.error("Error in dynamic recipe handler:", error);
        return res.status(500).json({ error: "Error generating recipe" });
    }
};
