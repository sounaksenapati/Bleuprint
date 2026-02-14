import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function callGemini(
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: systemInstruction,
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export function extractJSON(text: string): any {
  const jsonMatch =
    text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to extract JSON from AI response");
  const jsonString = jsonMatch[1] || jsonMatch[0];
  return JSON.parse(jsonString);
}

export function extractCode(text: string, lang: string = ""): string {
  const codeMatch = text.match(
    new RegExp("```" + lang + "\\n([\\s\\S]*?)\\n```")
  );
  if (codeMatch) return codeMatch[1];
  // If no code block, return raw text (AI might have output raw code)
  return text.trim();
}
