const { GoogleGenerativeAI } = require('@google/generative-ai');

// Secure initialization with your API key
const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Nettoie la réponse de l'IA pour extraire un objet JSON propre
 */
function parseAIResponse(text) {
  try {
    // Remove markdown tags if the AI adds them
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('JSON parsing error:', e);
    return null;
  }
}

/**
 * Analyze a meal image to extract nutritional data
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
    console.error('Error analyzing image:', error);
    return { Meal_Name: 'Meal', Description: '', Protein_Grams: 0, Carbs_Grams: 0, Fats_Grams: 0, Total_Calories: 0, Ingredients: [] };
  }
}

/**
 * Generate a custom recipe in English
 */
async function generateCustomRecipe(targetCalories, userRequest) {
  const prompt = `
    You are an expert nutritionist. Generate ONE recipe for around ${targetCalories} calories using: "${userRequest}".
    Provide ONLY a valid JSON object without any markdown.
    All text fields must be in English.
    Structure: {"Recipe_Name": "...", "Prep_Time": "...", "Ingredients": [], "Instructions": [], "Calories": 0, "Protein": 0, "Carbs": 0, "Fats": 0}`;

  try {
    const result = await model.generateContent(prompt);
    const parsed = parseAIResponse(result.response.text());
    return parsed || getFallbackRecipe(targetCalories, userRequest);
  } catch (error) {
    console.error('Gemini error (using fallback):', error);
    return getFallbackRecipe(targetCalories, userRequest);
  }
}

/**
 * Fallback recipe if AI does not respond
 */
function getFallbackRecipe(targetCalories, userRequest) {
  return {
    Recipe_Name: 'Quick Healthy Stir-Fry (fallback recipe)',
    Prep_Time: '12 minutes',
    Ingredients: [`Ingredients you listed: ${userRequest}`, '1 tbsp olive oil', 'Salt, pepper, and spices to taste'],
    Instructions: ['Heat a deep pan with 1 tbsp olive oil.', 'Add the ingredients and stir-fry for 7-10 minutes.', 'Season, check that everything is cooked, and serve hot.'],
    Calories: targetCalories,
    Protein: 20,
    Carbs: 15,
    Fats: 10
  };
}

module.exports = { analyzeMeal, generateCustomRecipe };
