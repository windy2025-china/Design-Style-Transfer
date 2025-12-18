
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async transformImage(base64Image: string, stylePrompt: string): Promise<string> {
    try {
      // Clean base64 string
      const imageData = base64Image.split(',')[1] || base64Image;
      
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: imageData,
                mimeType: 'image/png',
              },
            },
            {
              text: stylePrompt + " Return the edited image.",
            },
          ],
        },
      });

      let imageUrl = '';
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!imageUrl) {
        throw new Error("模型未能生成图像，请重试。");
      }

      return imageUrl;
    } catch (error) {
      console.error("Gemini transformation error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
