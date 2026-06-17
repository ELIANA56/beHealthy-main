const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialisation sécurisée avec votre clé API
const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Nettoie la réponse de l'IA pour extraire un objet JSON propre
 */
function parseAIResponse(text) {
  try {
    // Enlève les balises markdown si l'IA en ajoute
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Erreur de parsing JSON:", e);
    return null;
  }
}

/**
 * Analyse une image de repas pour extraire les données nutritionnelles
 */
async function analyzeMeal(imageBase64) {
  if (!imageBase64) return null;

  const prompt = `Analyze this meal image. Identify the dish and estimate nutrition.
  Provide output ONLY as a strict JSON object (no markdown, no conversational text):
  {"Meal_Name": "name of the dish", "Description": "short description of what you see", "Protein_Grams": 0.0, "Carbs_Grams": 0.0, "Fats_Grams": 0.0, "Total_Calories": 0, "Ingredients": ["ingredient1", "ingredient2"]}`;
  
  const imagePart = { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } };
  
  try {
    const result = await model.generateContent([prompt, imagePart]);
    return parseAIResponse(result.response.text());
  } catch (error) {
    console.error("Erreur lors de l'analyse de l'image:", error);
    return { Meal_Name: 'Repas', Description: '', Protein_Grams: 0, Carbs_Grams: 0, Fats_Grams: 0, Total_Calories: 0, Ingredients: [] };
  }
}

/**
 * Génère une recette personnalisée en Hebrew
 */
async function generateCustomRecipe(targetCalories, userRequest) {
  const prompt = `
    You are an expert nutritionist. Generate ONE recipe for around ${targetCalories} calories using: "${userRequest}".
    Provide ONLY a valid JSON object without any markdown.
    Structure (in Hebrew): {"Recipe_Name": "...", "Prep_Time": "...", "Ingredients": [], "Instructions": [], "Calories": 0, "Protein": 0, "Carbs": 0, "Fats": 0}`;

  try {
    const result = await model.generateContent(prompt);
    const parsed = parseAIResponse(result.response.text());
    return parsed || getFallbackRecipe(targetCalories, userRequest);
  } catch (error) {
    console.error("Erreur Gemini (utilisation du fallback):", error);
    return getFallbackRecipe(targetCalories, userRequest);
  }
}

/**
 * Recette de secours si l'IA ne répond pas
 */
function getFallbackRecipe(targetCalories, userRequest) {
  return {
    Recipe_Name: "מוקפץ בריאות זריז (מתכון גיבוי)",
    Prep_Time: "12 דקות",
    Ingredients: [`הרכיבים שציינת: ${userRequest}`, "כף שמן זית", "מלח, פלפל ותבלינים לפי הטעם"],
    Instructions: ["מחממים מחבת עמוקה עם כף שמן זית.", "מוסיפים את הרכיבים ומקפיצים כ-7-10 דקות.", "מתבלים, בודקים שהכל מוכן ומגישים חם."],
    Calories: targetCalories,
    Protein: 20,
    Carbs: 15,
    Fats: 10
  };
}

module.exports = { analyzeMeal, generateCustomRecipe };
