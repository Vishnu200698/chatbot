import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function checkModels() {
  console.log("Checking available models for your key...");
  try {
    const response = await fetch(URL);
    const data = await response.json();
    
    if (data.error) {
      console.error("API Error:", data.error.message);
      return;
    }

    console.log("\n--- VALID MODEL NAMES ---");
    const models = data.models || [];
    const chatModels = models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
    
    chatModels.forEach(m => {
      // We only care about the part after "models/"
      console.log(`"${m.name.replace("models/", "")}"`);
    });
    console.log("-------------------------\n");

  } catch (err) {
    console.error("Network Error:", err);
  }
}

checkModels();