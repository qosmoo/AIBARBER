
import { GoogleGenAI } from "@google/genai";
import { StylingOptions } from "../types";

export const applyAIStyle = async (
  base64Image: string,
  options: StylingOptions
): Promise<string> => {
  // Create instance right before call to ensure latest API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const imageData = base64Image.split(',')[1];
  const mimeType = base64Image.split(';')[0].split(':')[1];

  const prompt = `
    TASK: Professional Virtual Barbershop Transformation.
    Modify the provided headshot to apply the following grooming styles:
    - Hairstyle: ${options.hairstyle}
    - Facial Hair: ${options.beardStyle}
    - Target Color: ${options.color}
    
    CRITICAL REQUIREMENTS:
    1. EXTREME FIDELITY: Maintain the exact facial features, skin texture, eyes, and background of the original person.
    2. SEAMLESS BLENDING: The new hair and beard must appear naturally integrated with the skin and scalp, with realistic occlusion and shadows.
    3. TEXTURE: Hair should have high-definition texture (fine strands, natural sheen, realistic volume).
    4. COLOR: Apply the specified color (${options.color}) with natural highlights and lowlights.
    5. OUTPUT: Return only the modified image.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
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
      config: {
        imageConfig: {
          aspectRatio: "3:4"
        }
      }
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
      throw new Error("AI failed to generate a styled preview. Please try a different photo.");
    }

    return generatedImageUrl;
  } catch (error: any) {
    console.error("Styling Error:", error);
    
    // Handle the specific "Requested entity was not found" error by suggesting key re-selection
    if (error.message?.includes("Requested entity was not found")) {
      if (window.aistudio) {
        window.aistudio.openSelectKey();
        throw new Error("API configuration reset. Please select your API key in the dialog and try again.");
      }
    }
    
    throw new Error(error.message || "Transformation failed. Please check your connection and try again.");
  }
};
