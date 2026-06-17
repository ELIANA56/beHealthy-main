const { GoogleGenerativeAI } = require('@google/generative-ai');

const MODELS = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.0-flash-lite'];

function getApiKey() {
  return process.env.GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
}

const apiKey = getApiKey();
if (!apiKey) {
  console.warn('WARNING: GENAI_API_KEY is not set. Meal image analysis will not work.');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

function parseAIResponse(text) {
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('JSON parsing error:', e);
    return null;
  }
}

function normalizeAnalysis(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const protein = Number(raw.Protein_Grams ?? raw.protein_grams ?? raw.Protein ?? 0);
  const carbs = Number(raw.Carbs_Grams ?? raw.carbs_grams ?? raw.Carbs ?? 0);
  const fats = Number(raw.Fats_Grams ?? raw.fats_grams ?? raw.Fats ?? 0);
  const calories = Number(raw.Total_Calories ?? raw.total_calories ?? raw.Calories ?? 0);

  return {
    Meal_Name: raw.Meal_Name || raw.meal_name || raw.name || 'Meal',
    Description: raw.Description || raw.description || '',
    Protein_Grams: Number.isFinite(protein) ? protein : 0,
    Carbs_Grams: Number.isFinite(carbs) ? carbs : 0,
    Fats_Grams: Number.isFinite(fats) ? fats : 0,
    Total_Calories: Number.isFinite(calories) ? calories : 0,
    Ingredients: Array.isArray(raw.Ingredients) ? raw.Ingredients : [],
  };
}

function mapGeminiError(error) {
  const message = error?.message || '';
  if (message.includes('API key not valid')) {
    return new Error('Invalid Gemini API key. Create one at https://aistudio.google.com/apikey');
  }
  if (error?.status === 429 || message.includes('quota')) {
    return new Error('Gemini API quota exceeded on all models. Wait a minute and try again.');
  }
  return error;
}

async function generateWithFallback(parts) {
  if (!genAI) {
    throw new Error('Gemini API key is not configured on the server. Add GENAI_API_KEY to server/.env');
  }

  let lastError;
  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(parts);
      return result.response.text();
    } catch (error) {
      lastError = error;
      const isQuota = error?.status === 429 || error?.message?.includes('quota');
      const isNotFound = error?.status === 404 || error?.message?.includes('not found');
      if (isQuota || isNotFound) {
        console.warn(`Gemini model ${modelName} unavailable, trying next...`);
        continue;
      }
      throw mapGeminiError(error);
    }
  }

  throw mapGeminiError(lastError);
}

async function analyzeMeal(imageBase64, mimeType = 'image/jpeg') {
  if (!imageBase64) {
    throw new Error('No image data provided.');
  }

  const prompt = `Analyze this meal image. Identify the dish and estimate nutrition.
Provide output ONLY as a strict JSON object (no markdown, no conversational text):
{"Meal_Name": "name of the dish", "Description": "short description of what you see", "Protein_Grams": 0.0, "Carbs_Grams": 0.0, "Fats_Grams": 0.0, "Total_Calories": 0, "Ingredients": ["ingredient1", "ingredient2"]}`;

  const imagePart = { inlineData: { data: imageBase64, mimeType } };

  try {
    const text = await generateWithFallback([prompt, imagePart]);
    const parsed = parseAIResponse(text);
    const normalized = normalizeAnalysis(parsed);

    if (!normalized) {
      throw new Error('Could not parse nutrition data from Gemini response.');
    }

    return normalized;
  } catch (error) {
    throw mapGeminiError(error);
  }
}

async function generateCustomRecipe(targetCalories, userRequest) {
  const prompt = `
    You are an expert nutritionist. Generate ONE recipe for around ${targetCalories} calories using: "${userRequest}".
    Provide ONLY a valid JSON object without any markdown.
    All text fields must be in English.
    Structure: {"Recipe_Name": "...", "Prep_Time": "...", "Ingredients": [], "Instructions": [], "Calories": 0, "Protein": 0, "Carbs": 0, "Fats": 0}`;

  try {
    const text = await generateWithFallback([prompt]);
    const parsed = parseAIResponse(text);
    return parsed || getFallbackRecipe(targetCalories, userRequest);
  } catch (error) {
    console.error('Gemini error (using fallback):', error);
    return getFallbackRecipe(targetCalories, userRequest);
  }
}

function getFallbackRecipe(targetCalories, userRequest) {
  return {
    Recipe_Name: 'Quick Healthy Stir-Fry (fallback recipe)',
    Prep_Time: '12 minutes',
    Ingredients: [`Ingredients you listed: ${userRequest}`, '1 tbsp olive oil', 'Salt, pepper, and spices to taste'],
    Instructions: ['Heat a deep pan with 1 tbsp olive oil.', 'Add the ingredients and stir-fry for 7-10 minutes.', 'Season, check that everything is cooked, and serve hot.'],
    Calories: targetCalories,
    Protein: 20,
    Carbs: 15,
    Fats: 10,
  };
}

module.exports = { analyzeMeal, generateCustomRecipe };
