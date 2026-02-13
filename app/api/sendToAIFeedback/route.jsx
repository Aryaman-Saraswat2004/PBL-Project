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
