import { ExpertList } from "@/services/Options";
import { getOpenRouterModel, streamChatToText } from "@/lib/openrouter";

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
    const PROMPT = option.summeryPrompt;
    const model = getOpenRouterModel();
    const content = await streamChatToText({
      model,
      messages: [
        { role: "assistant", content: PROMPT },
        { role: "user", content: msg },
      ],
    });

    return new Response(
      JSON.stringify({
        model,
        choices: [{ message: { content } }],
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("AI error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
