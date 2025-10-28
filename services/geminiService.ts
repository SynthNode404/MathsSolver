import { GoogleGenAI } from "@google/genai";
import { Part } from '../types';

const model = 'gemini-2.5-flash';

const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        } else {
            // Fallback for ArrayBuffer
            const arrayBuffer = reader.result as ArrayBuffer;
            const bytes = new Uint8Array(arrayBuffer);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            resolve(window.btoa(binary));
        }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      mimeType: file.type,
      data: await base64EncodedDataPromise,
    },
  };
};

export const solveProblem = async (text: string, image?: File): Promise<string> => {
  try {
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const prompt = `You are a highly intelligent problem solver. Solve the problem described in the following text and/or image.
Provide a clear, step-by-step explanation if applicable.
Conclude with the final answer, clearly marked.
Format your response using Markdown for readability.`;

    const contents: any = { parts: [] };
    
    const textPart = { text: `${prompt}\n\nProblem: ${text || 'See attached image.'}` };
    contents.parts.push(textPart);

    if (image) {
        const imagePart = await fileToGenerativePart(image);
        contents.parts.push(imagePart);
    }

    if (!text && !image) {
        throw new Error("Either text or an image must be provided.");
    }
    
    const response = await ai.models.generateContent({
        model: model,
        contents: contents
    });

    return response.text;
  } catch (error) {
    console.error("Error solving problem:", error);
    if (error instanceof Error) {
        return `An error occurred: ${error.message}`;
    }
    return "An unknown error occurred while contacting the AI service.";
  }
};
