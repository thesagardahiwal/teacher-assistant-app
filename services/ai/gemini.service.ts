import { Student } from "@/types";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export interface GeminiAttendanceResult {
    mode: "ROLL_NUMBER_LIST" | "ATTENDANCE_CHART";
    detected: {
        rollNumber: string;
        name?: string; // Optional as AI won't always know names
        status: "PRESENT" | "ABSENT";
        confidence: number;
    }[];
    unmatched: string[]; // Mapped from 'ambiguous' for UI compatibility
    notes?: string;
}

export const geminiService = {
    async processAttendanceImage(
        imageBase64: string,
        students: Student[],
        date: string
    ): Promise<GeminiAttendanceResult> {
        if (!GEMINI_API_KEY) {
            throw new Error("Gemini API key is missing. Please set EXPO_PUBLIC_GEMINI_API_KEY.");
        }

        try {
            const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

            // 1. SELECT 3 EXAMPLES ONLY (Few-shot learning)
            // teach the pattern, not the dataset.
            const examples = students.slice(0, 3)
                .map((s) => `Roll "${s.rollNumber}"`)
                .join("\n");

            // Calculate range for context (optional but helpful)
            const rollNumbers = students.map(s => parseInt(s.rollNumber)).filter(n => !isNaN(n));
            const minRoll = rollNumbers.length ? Math.min(...rollNumbers) : 1;
            const maxRoll = rollNumbers.length ? Math.max(...rollNumbers) : 100;

            const prompt = `
      You are an AI assistant helping a teacher take attendance.
      Analyze the provided image (attendance chart or list of roll numbers).
      
      CONTEXT:
      - Date: ${date}
      - Roll Number Format: Numeric, typically ${minRoll} to ${maxRoll}.
      
      FEW-SHOT PATTERNS (Examples Only):
      ${examples}
      (Other roll numbers exist. Extract whatever you see.)

      TASK:
      1. Identify if this is a "ATTENDANCE_CHART" (grid with names/dates) or "ROLL_NUMBER_LIST" (handwritten numbers).
      2. If CHART: Find the column for ${date}. Extract status (Present/Absent).
      3. If LIST: Extract all roll numbers. Assume listed numbers are PRESENT. All others are ABSENT.
      4. IGNORE names in the image; focus only on extracting Roll Numbers.
      
      OUTPUT FORMAT (JSON ONLY):
      {
        "mode": "ROLL_NUMBER_LIST" | "ATTENDANCE_CHART",
        "detected": [
          { "rollNumber": "12", "status": "PRESENT" | "ABSENT", "confidence": 0.95 }
        ],
        "ambiguous": ["18", "XX"],
        "notes": "Blurry handwriting on bottom left"
      }
      
      RULES:
      - Deduplicate roll numbers.
      - Return ONLY JSON. No prose.
      `;

            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: [
                    {
                        parts: [
                            { text: prompt },
                            {
                                inlineData: {
                                    mimeType: "image/jpeg",
                                    data: imageBase64,
                                },
                            },
                        ],
                    },
                ],
                config: {
                    responseMimeType: "application/json",
                },
            });

            const textResponse = response.text;

            if (!textResponse) {
                throw new Error("No response text from Gemini.");
            }

            // Clean markdown if present
            const jsonStr = textResponse.replace(/```json|```/g, "").trim();
            const result = JSON.parse(jsonStr);

            return {
                mode: result.mode,
                detected: result.detected.map((d: any) => ({
                    rollNumber: d.rollNumber,
                    name: undefined, // AI doesn't know names anymore
                    status: d.status,
                    confidence: d.confidence,
                })),
                unmatched: result.ambiguous || [],
                notes: result.notes,
            };

        } catch (error: any) {
            console.error("Gemini Service Error:", error);
            if (error.message?.includes("404")) {
                throw new Error("Gemini Model Not Found. Check model name support.");
            }
            throw new Error(error.message || "Failed to process image with AI");
        }
    },
};
