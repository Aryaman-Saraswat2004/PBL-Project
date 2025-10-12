import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const apiKey = process.env.ASSEMBLY_API_KEY;
        if (!apiKey) throw new Error("ASSEMBLY_API_KEY not set");

        // Set desired expiration (e.g., 3600 seconds = 1 hour)
        const expiresInSeconds = 3600;

        const res = await fetch(
            `https://streaming.assemblyai.com/v3/token?expires_in_seconds=${expiresInSeconds}`,
            {
                method: "GET",
                headers: {
                    "Authorization": apiKey
                }
            }
        );

        if (!res.ok) {
            throw new Error(`AssemblyAI API responded with status ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Failed to create streaming token:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
