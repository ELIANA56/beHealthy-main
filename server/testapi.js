require('dotenv').config();
const { analyzeMeal } = require('./services/aiService');

async function test() {
    console.log("Tentative de connexion à Gemini...");
    try {
        // On envoie une image vide ou un petit test
        const result = await analyzeMeal("test_image_base64");
        console.log("✅ Connexion réussie ! Réponse reçue :", result);
    } catch (error) {
        console.error("❌ Erreur de connexion :", error.message);
    }
}
test();