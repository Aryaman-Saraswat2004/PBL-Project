import axios from "axios";

export async function POST(req) {
  try {
    const { text } = await req.json();
    if (!text) return new Response("No text provided", { status: 400 });

    // Replace with your ElevenLabs voice ID
    const VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"; 

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
      { text },
      {
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer", // important to get audio bytes
      }
    );

    // Return audio file as response
    return new Response(response.data, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (err) {
    console.error("TTS API error:", err);
    return new Response("Failed to generate speech", { status: 500 });
  }
}
