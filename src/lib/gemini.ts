import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeFace(base64Image: string, mimeType: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: "Analyze this person's face in extreme detail. Describe their hair color and style, eye color, skin tone, facial structure, expression, and any distinguishing marks. Return ONLY the physical description, as it will be used to recreate their likeness.",
        },
      ],
    },
  });
  return response.text || "Subject analyzed successfully.";
}

export async function generateTimeTravelPhoto(
  base64Image: string,
  mimeType: string,
  description: string,
  era: string,
  scene: string
): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: `Edit this image to place the person in the ${era}. Change their clothing to authentic ${era} attire. Change the background to a highly detailed, realistic ${scene}. Keep the person's face exactly the same. For reference, the person's features are: ${description}. Photorealistic, cinematic lighting, masterpiece.`,
        },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
}
