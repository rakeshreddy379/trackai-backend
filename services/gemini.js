const path = require("path");
const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim();

if (!apiKey) {
    throw new Error("Missing Gemini API key. Set GEMINI_API_KEY or GOOGLE_API_KEY in the project .env file.");
}

const ai = new GoogleGenAI({ apiKey });

module.exports = ai;