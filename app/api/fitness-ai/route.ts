import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Grounding data to ensure the AI understands Sri Lankan terrain
const HIKE_KNOWLEDGE: Record<string, string> = {
  "Yahangala Mountain": "Moderate-Challenging. 12km. Known for steep rock faces and high winds.",
  "Knuckles 5 Peaks": "Very Strenuous. ~30km total. Massive elevation changes and high leech density.",
  "Kabaragala": "Moderate. 1500m elevation. Steep paths through tea estates.",
  "Garandiella Mountain": "Moderate. Features waterfall crossings and rocky sloping plains.",
  "Kehelpathdoruwa Mountain": "Challenging. Known as 'Little Green Everest'. Extremely steep ridges."
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { age, fitnessLevel, experience, activityLevel, hikeName, medicalConcerns } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ result: "API Key missing in .env.local" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash" 
    });

    const hikeDetails = HIKE_KNOWLEDGE[hikeName] || "A highland trek in Sri Lanka.";
    
    // Create a string of all available hikes so the AI knows what to recommend
    const allHikesCatalog = Object.entries(HIKE_KNOWLEDGE)
      .map(([name, desc]) => `- ${name}: ${desc}`)
      .join("\n");

    // Updated Prompt to include conditional recommendations
    const prompt = `
      You are a Sri Lankan Trekking Safety Expert. 
      Analyze if a hiker is ready for the "${hikeName}" hike.
      
      Target Hike Terrain: ${hikeDetails}
      
      Hiker Profile:
      - Age: ${age}
      - Fitness Level: ${fitnessLevel}
      - Experience: ${experience}
      - Weekly Activity: ${activityLevel}
      - Medical Notes: ${medicalConcerns || "None"}

      Available Hikes in our catalog (for recommendations):
      ${allHikesCatalog}

      Provide your response strictly in this Markdown format:
      
      ### Readiness Score: [X/10]
      **Verdict:** [Suitable / Challenging / Not Recommended]
      
      **Analysis:** [A 3-sentence explanation of why they are or aren't ready based on this specific hike.]
      
      **Safety Tips:** - [Tip 1]
      - [Tip 2]

      **Alternative Recommendation:**
      [IF the Readiness Score is 6/10 or lower, or the verdict is Not Recommended, pick ONE easier hike from the 'Available Hikes' list above and write: "Given your profile, we highly recommend starting with **[Easier Hike Name]** instead. [1 sentence explaining why it is a better fit]." IF the score is 7/10 or higher, write: "You are well-equipped for this hike! No alternative needed."]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ result: text });

  } catch (error: any) {
    console.error("Gemini Error:", error.message || error);
    return NextResponse.json(
      { result: "AI analysis failed. Please try again." },
      { status: 500 }
    );
  }
}