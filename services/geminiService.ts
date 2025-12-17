import { GoogleGenAI, Type } from "@google/genai";
import { FishType } from "../types";

const initAI = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeCatch = async (fish: FishType, weight: number): Promise<string> => {
  const ai = initAI();
  if (!ai) return "神秘的漁獲！(缺少 API Key)";

  try {
    const prompt = `
      我剛在一個釣魚遊戲中釣到了一條 ${fish.name}，重量為 ${weight.toFixed(1)}公斤。
      這是一條稀有度為 ${fish.rarity} 的魚。
      請用「繁體中文」提供一段簡短、風趣的 2 句話描述。
      第一句話應該是關於這種魚的有趣冷知識或傳說。
      第二句話應該是幽默的烹飪建議，或者為什麼不該吃它的理由。
      語氣要輕鬆好玩。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        maxOutputTokens: 100,
        temperature: 0.9,
      }
    });

    return response.text || "這條魚滑溜到無法形容！";
  } catch (error) {
    console.error("Gemini analysis failed", error);
    return "這條魚靜靜地看著你。";
  }
};