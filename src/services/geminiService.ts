import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateCloudFunction = async (prompt: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Write a Node.js cloud function for AuraDB (Firebase-like) that does the following: ${prompt}. Return ONLY the code in a clean format. Use CommonJS or ESM.`,
  });
  return response.text;
};

export const suggestDatabaseQuery = async (description: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Translate this human intention into a Firestore-like query (e.g. collection('...').where('...', '==', '...')): ${description}. Return only the query string.`,
  });
  return response.text;
};
