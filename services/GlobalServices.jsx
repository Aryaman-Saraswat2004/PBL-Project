import axios from "axios";
import OpenAI from "openai"
import { ExpertList } from "./Options";

export const getToken=async()=>{
    const result = await axios.get('/api/getToken');
    return result.data;
}

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: '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',
  dangerouslyAllowBrowser: true
})

export const AIModel = async (topic, coachingOption, msg) => {
  try {
    const res = await axios.post("/api/sendToAI", { topic, coachingOption, msg });
    return res.data;
  } catch (err) {
    console.error("AI request failed:", err);
    throw err;
  }
};

export const AIModelFeedback = async (coachingOption, conversation) => {
  try {
    // Convert conversation array into a single string
    const msg = conversation
      .map(m => `${m.sender === "user" ? "User" : "AI"}: ${m.text}`)
      .join("\n");

    const res = await axios.post("/api/sendToAIFeedback", { coachingOption, msg });
    return res.data;
  } catch (err) {
    console.error("AI request failed:", err);
    throw err;
  }
};

