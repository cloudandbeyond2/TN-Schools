"use server";

export async function generateConceptMap(topic: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  const prompt = `You are an educational assistant for school teachers. Create a concept map layout about the topic "${topic}".
Output ONLY a valid JSON object matching this structure exactly (no markdown formatting, no code blocks):
{
  "mainTitle": "UPPERCASE TOPIC NAME",
  "subtitle": "A catchy, very short subtitle with emojis",
  "whatIsIt": "A 1-2 sentence simple explanation of what it is with an emoji at the end",
  "howItWorks": [
    "Step 1...",
    "Step 2...",
    "Step 3...",
    "Step 4...",
    "Step 5..."
  ],
  "keyJobs": [
    "Job 1",
    "Job 2",
    "Job 3"
  ],
  "mainParts": [
    "Part 1",
    "Part 2",
    "Part 3",
    "Part 4",
    "Part 5"
  ],
  "funFacts": [
    "Fun fact 1",
    "Fun fact 2",
    "Fun fact 3"
  ],
  "takeCare": [
    "Tip 1",
    "Tip 2",
    "Tip 3",
    "Tip 4"
  ],
  "didYouKnow": "A fascinating 2-sentence 'Did you know?' fact.",
  "footerText": "A positive closing remark like 'Healthy X = Healthy Y!'"
}`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Gemini Error:", data);
      throw new Error(data.error?.message || "Failed to generate concept map");
    }

    let textResponse = data.candidates[0].content.parts[0].text.trim();
    // Strip markdown code block wrapping if present
    if (textResponse.startsWith("\`\`\`json")) {
      textResponse = textResponse.replace(/^\`\`\`json\s*/, "").replace(/\s*\`\`\`$/, "");
    } else if (textResponse.startsWith("\`\`\`")) {
      textResponse = textResponse.replace(/^\`\`\`\s*/, "").replace(/\s*\`\`\`$/, "");
    }

    const parsed = JSON.parse(textResponse);
    return parsed;
  } catch (err: any) {
    console.error("Generation error:", err);
    throw new Error(err.message || "Failed to generate");
  }
}
