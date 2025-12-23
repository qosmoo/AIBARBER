
import { GoogleGenAI } from "@google/genai";
import { StylingOptions } from "../types";

/**
 * TODO: API Key Management
 * For production, never expose API keys in the client code.
 * Use a backend proxy or environment variables securely managed by your CI/CD.
 * Current implementation relies on process.env.API_KEY provided by the environment.
 */

export const applyAIStyle = async (
  base64Image: string,
  options: StylingOptions
): Promise<string> => {
  // TODO: Implement sophisticated error handling for rate limits (429)
  // and safety filters (HATE_SPEECH, HARASSMENT, etc.)
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const imageData = base64Image.split(',')[1];
  const mimeType = base64Image.split(';')[0].split(':')[1];

  const prompt = `
    TASK: High-end Virtual Barbershop Styling.
    Perform a photorealistic hair and beard transformation on the person in the image.
    
    NEW STYLE SPECIFICATIONS:
    - Hairstyle: ${options.hairstyle}
    - Beard/Facial Hair: ${options.beardStyle}
    - Primary Color: ${options.color}
    
    TECHNICAL REQUIREMENTS:
    1. Maintain 100% fidelity to the user's original facial structure, skin tone, eye color, and background.
    2. The hair/beard should look naturally growing from the scalp/skin, with realistic lighting, shadows, and texture.
    3. If the user chooses "Bald" or "Clean Shaven", ensure the skin looks smooth and natural.
    4. Blend the colors naturally; avoid a "flat" or "painted-on" look.
    5. Output must be a single modified image part.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Using Flash Image for fast editing
      contents: {
        parts: [
          {
            inlineData: {
              data: imageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt
          }
        ]
      },
    });

    let generatedImageUrl = '';
    
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          generatedImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!generatedImageUrl) {
      throw new Error("Style generation failed. The AI did not return a valid image.");
    }

    return generatedImageUrl;
  } catch (error: any) {
    console.error("AI Styling Error:", error);
    // TODO: Log these errors to an observability platform like Sentry or LogRocket
    throw new Error(error.message || "An error occurred while communicating with the AI Barber service.");
  }
};
