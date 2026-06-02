import OpenAI from "openai";

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

const SYSTEM_PROMPT = `You are an expert cold email writer. You craft short, warm, human-sounding emails that feel like a thoughtful colleague wrote them — never salesy, never robotic, never templated.

Rules:
- 3-4 sentences maximum
- Reference ONE specific detail from the prospect's profile (a recent post, shared connection, work history, or interest)
- Use a conversational, natural tone
- No buzzwords (no "revolutionize", "game-changer", "leverage", "synergy")
- No exclamation marks
- No fake enthusiasm
- Include a soft, low-pressure call to action

Output as JSON: { "subject": string, "body": string, "recipientName": string, "recipientCompany": string }`;

export async function generateColdEmail(
  description: string,
): Promise<{
  subject: string;
  body: string;
  recipientName: string;
  recipientCompany: string;
}> {
  const completion = await deepseek.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Write a personalized cold email based on this prospect description: "${description}". Use the details provided to craft a genuine, specific angle. Keep it warm, brief, and human. If any key info (name, company, role) is missing from the description, use reasonable placeholders.`,
      },
    ],
    max_tokens: 600,
    temperature: 0.8,
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error("DeepSeek returned empty response");

  const parsed = JSON.parse(text);
  return {
    subject: parsed.subject || "Quick thought",
    body: parsed.body || "",
    recipientName: parsed.recipientName || "there",
    recipientCompany: parsed.recipientCompany || "",
  };
}
