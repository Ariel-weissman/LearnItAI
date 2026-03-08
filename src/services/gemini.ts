import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY!;
const ai = new GoogleGenAI({ apiKey });

export async function processNotes(notes: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Transform the following notes into a structured, easy-to-read study guide using Markdown. 
    Use clear headings, bullet points, and highlight key terms. 
    If there are complex concepts, identify them.
    
    IMPORTANT: For any mathematical symbols, formulas, or special characters, use standard LaTeX notation with $ for inline math and $$ for block math. 
    For example, use $\\sqrt{x}$ for square root, $x^2$ for powers, and $\\alpha$ for Greek letters. 
    Do NOT use custom codes like {sqrt}.
    
    Notes:
    ${notes}`,
  });
  return response.text;
}

export async function explainText(text: string, context?: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Explain the following text in a simple, easy-to-understand way. 
    ${context ? `Context of the study guide: ${context}` : ""}
    
    IMPORTANT: For any mathematical symbols, formulas, or special characters, use standard LaTeX notation with $ for inline math and $$ for block math. 
    Do NOT use custom codes like {sqrt}.
    
    Text to explain:
    "${text}"`,
  });
  return response.text;
}

export async function chatWithAssistant(message: string, history: { role: "user" | "model"; parts: { text: string }[] }[]) {
  const systemInstruction = `You are a helpful study assistant. Help the user understand their notes, answer questions, and provide study tips.
  
  IMPORTANT: For any mathematical symbols, formulas, or special characters, use standard LaTeX notation with $ for inline math and $$ for block math. 
  For example, use $\\sqrt{x}$ for square root, $x^2$ for powers, and $\\alpha$ for Greek letters. 
  Do NOT use custom codes like {sqrt}. Always render math clearly.`;

  const chatWithHistory = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction,
    },
    history: history as any,
  });

  const response = await chatWithHistory.sendMessage({ message });
  return response.text;
}

export async function generateQuiz(content: string, customInstructions?: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on the following study material, generate a quiz with 5-10 questions. 
    Mix multiple-choice and fill-in-the-blank questions.
    
    ${customInstructions ? `USER CUSTOM INSTRUCTIONS: ${customInstructions}` : ""}
    
    IMPORTANT: For any mathematical symbols, formulas, or special characters, use standard LaTeX notation with $ for inline math and $$ for block math. 
    Do NOT use custom codes like {sqrt}.
    
    Return the response as a JSON array of objects with the following structure:
    {
      "question": "string",
      "type": "multiple-choice" | "fill-in-the-blank",
      "options": ["string", "string", "string", "string"] (only for multiple-choice),
      "answer": "string",
      "explanation": "string"
    }
    
    Material:
    ${content}`,
    config: {
      responseMimeType: "application/json",
    },
  });
  return JSON.parse(response.text || "[]");
}

export async function generateFlashcards(content: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on the following study material, generate a set of 8-12 flashcards. 
    Each flashcard should have a "front" (term or question) and a "back" (definition or answer).
    
    IMPORTANT: For any mathematical symbols, formulas, or special characters, use standard LaTeX notation with $ for inline math and $$ for block math. 
    Do NOT use custom codes like {sqrt}.
    
    Return the response as a JSON array of objects:
    {
      "front": "string",
      "back": "string"
    }
    
    Material:
    ${content}`,
    config: {
      responseMimeType: "application/json",
    },
  });
  return JSON.parse(response.text || "[]");
}

export async function generateWorksheet(content: string, customInstructions?: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on the following study material, generate a comprehensive worksheet with 5-10 problems. 
    The problems should be open-ended or multi-step questions that require thinking, not just simple multiple choice.
    
    ${customInstructions ? `USER CUSTOM INSTRUCTIONS: ${customInstructions}` : ""}
    
    IMPORTANT: For any mathematical symbols, formulas, or special characters, use standard LaTeX notation with $ for inline math and $$ for block math. 
    Do NOT use custom codes like {sqrt}.
    
    Return the response as a JSON array of objects with the following structure:
    {
      "problem": "string",
      "answer": "string" (the detailed correct solution or key)
    }
    
    Material:
    ${content}`,
    config: {
      responseMimeType: "application/json",
    },
  });
  return JSON.parse(response.text || "[]");
}

export async function extractWorksheetProblems(content: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extract individual problems or questions from the following worksheet content. 
    Return a JSON array of objects, where each object has a "problem" (the question text) and an "answer" (the correct solution or key).
    
    IMPORTANT: Use standard LaTeX notation for math.
    
    Worksheet Content:
    ${content}`,
    config: {
      responseMimeType: "application/json",
    },
  });
  return JSON.parse(response.text || "[]");
}

export async function analyzeWork(problem: string, correctAnswer: string, userSolution: string, imageBase64?: string) {
  const parts: any[] = [
    {
      text: `Problem: ${problem}
      Correct Answer: ${correctAnswer}
      User's Provided Answer: ${userSolution}
      
      Analyze the user's work. If they are correct, congratulate them. 
      If they are wrong, explain exactly where they went wrong and guide them towards the right path without just giving the answer immediately.
      
      IMPORTANT: Use standard LaTeX notation for math.`,
    },
  ];

  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/png",
        data: imageBase64.split(",")[1],
      },
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
  });
  return response.text;
}

export async function generateExplanatoryImage(concept: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `Create a clear, educational diagram or illustration explaining the concept of: ${concept}. 
          The image should be professional, clean, and easy to understand for a student. 
          Avoid cluttered backgrounds.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}
