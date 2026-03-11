import { GoogleGenAI } from "@google/genai";

export async function generateStagedImage(
  base64Image: string,
  roomType: string,
  style: string
) {
  // Use the standard Gemini API key. 
  // gemini-2.5-flash-image works with the default key and doesn't require the selection dialog.
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  // Extract mime type and clean base64 data
  const mimeTypeMatch = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/png";
  const base64Data = base64Image.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

  const prompt = `Virtually stage this empty ${roomType} with ${style} style furniture. 
  The room should look professionally decorated, high-end, and realistic. 
  Maintain the original architecture, windows, and flooring of the room. 
  Add appropriate furniture, decor, lighting, and plants to make it look lived-in and attractive for a real estate listing.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        },
      },
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("No response from AI model. Please try again.");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("The AI didn't return an image. It might have returned text instead: " + (response.text || "No text either."));
  } catch (error: any) {
    console.error("Staging Error:", error);
    throw new Error(error.message || "An unexpected error occurred during image generation.");
  }
}
