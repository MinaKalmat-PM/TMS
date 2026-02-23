
import { GoogleGenAI, Type } from "@google/genai";
import { Truck, Driver, Load } from "../types";

// Note: For video generation, we initialize with a fresh instance inside the function 
// to ensure we use the most up-to-date selected API key as per requirements.

export const generateFmcsaVideo = async (topic: string, onProgress?: (status: string) => void) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  if (onProgress) onProgress("Initializing Cinematic Engine...");

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `A professional training video for a trucking company showing ${topic}. Cinematic lighting, 4k resolution style, clear educational focus on FMCSA safety compliance.`,
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: '16:9'
      }
    });

    if (onProgress) onProgress("Rendering FMCSA compliance scenarios...");

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
      if (onProgress) onProgress("Simulating real-world driving conditions...");
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed to return a link.");

    if (onProgress) onProgress("Finalizing MP4 stream...");
    
    // Append API key as required for fetching the blob
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error: any) {
    console.error("Video Generation Error:", error);
    if (error.message?.includes("Requested entity was not found")) {
      throw new Error("KEY_RESET_REQUIRED");
    }
    throw error;
  }
};

export const getDispatchAdvice = async (load: Load, availableTrucks: Truck[], availableDrivers: Driver[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    As an expert logistics dispatcher, analyze the following load and suggest the best truck and driver pair.
    Load: ${JSON.stringify(load)}
    Available Trucks: ${JSON.stringify(availableTrucks.slice(0, 5))}
    Available Drivers: ${JSON.stringify(availableDrivers.slice(0, 5))}
    Return a detailed reasoning and a final recommendation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0.7 }
    });
    return response.text;
  } catch (error) {
    return "Failed to get AI dispatch advice.";
  }
};

export const getOrientationAssistantResponse = async (question: string, context: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    You are the SwiftLink Academy AI mentor. Explain FMCSA/ELD rules.
    Context: ${context}
    Question: ${question}
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0.5 }
    });
    return response.text;
  } catch (error) {
    return "Safety database connection error.";
  }
};
