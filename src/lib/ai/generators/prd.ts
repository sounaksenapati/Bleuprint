import { callGemini, extractJSON } from "../gemini";
import { PRD_SYSTEM_PROMPT } from "../prompts";
import type { ConstraintData } from "@/lib/types";

export async function generatePRD(
  userIntent: string
): Promise<ConstraintData> {
  const prompt = `User wants to build: "${userIntent}"\n\nGenerate a complete, realistic PRD following the system instructions. Output ONLY the JSON.`;
  const response = await callGemini(prompt, PRD_SYSTEM_PROMPT);
  return extractJSON(response);
}
