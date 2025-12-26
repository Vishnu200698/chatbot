// backend/check_models.js
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const modelList = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).apiKey; // Validates key first
    console.log("Checking available models...");
    
    // This is a special hidden endpoint to list models
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();

    if (data.models) {
      console.log("\n✅ YOU HAVE ACCESS TO THESE MODELS:");
      console.log("-----------------------------------");
      data.models.forEach(m => {
        // Only show 'generateContent' models (the ones for chat)
        if (m.supportedGenerationMethods.includes("generateContent")) {
            console.log(`Model Name: ${m.name.replace("models/", "")}`);
        }
      });
      console.log("-----------------------------------\n");
    } else {
      console.log("❌ No models found. Check your API Key.");
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

listModels();