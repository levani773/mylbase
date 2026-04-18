import { GoogleGenAI } from "@google/genai";

let aiInstance: any = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'undefined') {
      console.warn('GEMINI_API_KEY is not set. AI features will be disabled.');
      return null;
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const generateCloudFunction = async (prompt: string) => {
  const ai = getAI();
  if (!ai) throw new Error('AI Service not configured. Please add GEMINI_API_KEY to your environment variables.');
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Write a Node.js cloud function for AuraDB (Firebase-like) that does the following: ${prompt}. Return ONLY the code in a clean format. Use CommonJS or ESM.`,
  });
  return response.text;
};

export const suggestDatabaseQuery = async (description: string) => {
  const ai = getAI();
  if (!ai) throw new Error('AI Service not configured. Please add GEMINI_API_KEY to your environment variables.');

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Translate this human intention into a Firestore-like query (e.g. collection('...').where('...', '==', '...')): ${description}. Return only the query string.`,
  });
  return response.text;
};
