// Model access for the coaching AI.
//
// The original app talked to Gemini directly with a personal `GEMINI_API_KEY`.
// Here the calls go through the Lovable AI Gateway instead (no external key to
// manage), while keeping the exact `ai.models.generateContent({...})` shape the
// rest of aiService.server.ts already uses.

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/responses";
const MODEL = "openai/gpt-5.6-sol";

interface GenerateContentArgs {
  model?: string;
  contents: string;
  config?: {
    responseMimeType?: string;
    responseSchema?: unknown;
  };
}

async function generateContent({ contents, config }: GenerateContentArgs): Promise<{ text: string }> {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

  const wantsJson = config?.responseMimeType === "application/json";
  const instructions = wantsJson
    ? "You are an expert CEFR English coaching engine. Reply with a single valid JSON object only — no markdown fences, no commentary." +
      (config?.responseSchema
        ? `\n\nThe JSON must match this schema:\n${JSON.stringify(config.responseSchema)}`
        : "")
    : "You are an expert CEFR English coaching engine.";

  // Reasoning models can run for minutes, so this request must stream.
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      instructions,
      input: contents,
      stream: true,
      reasoning: { effort: "low", summary: "auto" },
      store: false,
    }),
  });

  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => "");
    console.error(`AI gateway request failed [${res.status}]: ${body}`);
    throw new Error(`AI request failed [${res.status}]: ${body}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  const handleEvent = (payload: string) => {
    if (!payload || payload === "[DONE]") return;
    try {
      const event = JSON.parse(payload) as {
        type?: string;
        delta?: string;
        response?: { output_text?: string };
      };
      if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
        text += event.delta;
      } else if (event.type === "response.completed" && event.response?.output_text) {
        if (!text) text = event.response.output_text;
      }
    } catch {
      // Ignore keep-alive / non-JSON frames.
    }
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let boundary = buffer.indexOf("\n");
    while (boundary !== -1) {
      const line = buffer.slice(0, boundary).trim();
      buffer = buffer.slice(boundary + 1);
      if (line.startsWith("data:")) handleEvent(line.slice(5).trim());
      boundary = buffer.indexOf("\n");
    }
  }
  if (buffer.trim().startsWith("data:")) handleEvent(buffer.trim().slice(5).trim());

  return { text };
}

export function getAIClient() {
  return { models: { generateContent } };
}
