import OpenAI from "openai";
import { ExpertList } from "@/services/Options";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: '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',
  dangerouslyAllowBrowser: true
})

export async function POST(req) {
  const {coachingOption, msg } = await req.json();

  if (!coachingOption || !msg) {
    return new Response(JSON.stringify({ error: "Missing data" }), { status: 400 });
  }

  const option = ExpertList.find(item => item.name === coachingOption);
  if (!option) {
    return new Response(JSON.stringify({ error: "Invalid coaching option" }), { status: 400 });
  }

  try {
    const PROMPT = option.summeryPrompt

    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat-v3.1:free",
      messages: [
        { role: "assistant", content: PROMPT },
        { role: "user", content: msg },
      ],
    });

    return new Response(JSON.stringify(completion), { status: 200 });
  } catch (err) {
    console.error("AI error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
