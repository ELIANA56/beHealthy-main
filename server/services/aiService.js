

const { parseAIResponse } = require('../utils/helpers');
let client = null;

async function initAI() {
  try {
    const genaiPkg = require('@google/generative-ai');
    const GoogleGenAI = genaiPkg.GoogleGenAI || genaiPkg.default || genaiPkg;
    if (typeof GoogleGenAI === 'function') {
      client = new GoogleGenAI({ apiKey: process.env.GENAI_API_KEY || '' });
      return client;
    }
  } catch (e) {
    // fallback to mock
  }
  // mock client
  client = { getGenerativeModel: () => ({ generateContent: async () => ({ response: { text: () => '{}' } }) }) };
  return client;
}

async function analyzeMeal(imageBase64) {
  if (!client) await initAI();
  if (!imageBase64) return { Protein_Grams: 0, Carbs_Grams: 0, Fats_Grams: 0, Total_Calories: 0 };

  const model = client.getGenerativeModel ? client.getGenerativeModel({ model: 'gemini-2.5-flash' }) : client;
  const prompt = `Analyze this meal image for a health application. Provide your output ONLY as a strict JSON object with these exact keys, no conversational text, no markdown block: {"Protein_Grams": float, "Carbs_Grams": float, "Fats_Grams": float, "Total_Calories": integer}`;
  const imagePart = { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } };

  const aiResult = await model.generateContent([prompt, imagePart]);
  const text = (aiResult && aiResult.response && typeof aiResult.response.text === 'function') ? aiResult.response.text() : '{}';
  return parseAIResponse(text);
}

module.exports = { initAI, analyzeMeal };
/**
 * מייצר מתכון מותאם אישית לפי קלוריות ומה שיש למשתמש בבית באותו רגע
 * @param {number} targetCalories - קלוריות יעד לארוחה
 * @param {string} userRequest - מה שהמשתמש הקליד (רכיבים במקרר או חשק)
 */
 async function generateCustomRecipe(targetCalories, userRequest) {
  try {
    // הנדסת פרומפט קשוחה כדי שג'מיני לא יסטה מהתקציב או מהרכיבים
    const prompt = `
      You are an expert nutritionist and chef AI. Generate ONE delicious recipe that strictly fits these rules:
      1. Target Calories: Around ${targetCalories} calories (allow a small margin of +/- 30 calories).
      2. Ingredients available / User request: "${userRequest}". The recipe MUST focus on using these ingredients or satisfy this craving.
      
      Provide your answer strictly as a valid JSON object, without markdown blocks like \`\`\`json or backticks.
      The JSON must have exactly this structure, and all text fields must be in Hebrew:
      {
        "Recipe_Name": "שם המתכון בעברית",
        "Prep_Time": "זמן הכנה (למשל: '15 דקות')",
        "Ingredients": ["מצרך 1 עם כמות בעברית", "מצרך 2 עם כמות בעברית"],
        "Instructions": ["שלב 1 בעברית", "שלב 2 בעברית"],
        "Calories": (number, total calories for this portion),
        "Protein": (number, grams of protein),
        "Carbs": (number, grams of carbohydrates),
        "Fats": (number, grams of fats)
      }
    `;

    // קריאה למודל המהיר והחכם
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [prompt]
    });

    let cleanText = response.text.trim();
    
    // רשת ביטחון: אם ג'מיני בכל זאת החזיר סימוני מפתח של הקוד, ננקה אותם
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/```json|```/g, "").trim();
    }
    
    // הפיכת הטקסט מאובייקט JSON ל-JavaScript Object אמיתי
    return JSON.parse(cleanText);

  } catch (error) {
    console.error("Error in Gemini recipe generator service:", error);
    
    // פתרון גיבוי (Fallback) במקרה שגוגל לא זמין או שהתקבלה תשובה משובשת
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
}

module.exports = { generateCustomRecipe };
