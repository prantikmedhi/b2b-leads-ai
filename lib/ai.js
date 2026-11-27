import OpenAI from "openai";

const SYSTEM_PROMPT = `You are a helpful assistant that extracts structured data from a search prompt.
          Extract the following fields:
          - location (e.g., "Nagaon Assam")
          - category (e.g., "cafe")
          - intent (optional, e.g., "website development")
          - requires_missing_website (boolean): Set to true ONLY if the user explicitly wants leads for "website development", "web design", or specifically mentions finding businesses "without websites". For "digital marketing", "SEO", "ads", or general searches, set this to false.

          Return the result as a valid JSON object with keys: "location", "category", "intent", "requires_missing_website".
          If a field is not found, use an empty string (or false for boolean).`;

// Tried in order; a provider is skipped when its API key is not set.
function getProviders() {
  return [
    {
      name: "Groq",
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    },
    {
      name: "OpenRouter",
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      model: process.env.OPENROUTER_MODEL || "openrouter/free",
    },
  ].filter((provider) => provider.apiKey);
}

function buildAIError(detail, status = 500, originalError) {
  const error = new Error(`Error: Failed AI API call - ${detail}`);
  error.status = status;
  if (originalError) {
    error.cause = originalError;
  }
  error.details = detail;
  return error;
}

function extractAIErrorDetail(error) {
  if (error?.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  if (error?.response?.data?.error) {
    if (typeof error.response.data.error === "string") {
      return error.response.data.error;
    }
    try {
      return JSON.stringify(error.response.data.error);
    } catch {
      return "Unknown AI provider error.";
    }
  }
  if (typeof error?.message === "string" && error.message.length > 0) {
    return error.message;
  }
  return "Unknown AI provider error.";
}

async function callProvider(provider, prompt) {
  const client = new OpenAI({ apiKey: provider.apiKey, baseURL: provider.baseURL });

  const stream = await client.chat.completions.create({
    model: provider.model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    stream: true,
  });

  let fullContent = "";
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    fullContent += content;
  }

  // 1. First, try to remove markdown code blocks wrapping the content
  // Use hex code \x60 for backtick to avoid build parser issues with regex literals or strings
  let cleanedContent = fullContent.replace(/\x60{3}json\s*/gi, "").replace(/\x60{3}/g, "").trim();

  // 2. Then try to find the JSON object within the cleaned content
  const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleanedContent = jsonMatch[0];
  }

  const data = JSON.parse(cleanedContent);

  return {
    location: data.location || "",
    category: data.category || "",
    intent: data.intent || "",
    requires_missing_website: !!data.requires_missing_website
  };
}

/**
 * Extracts location, category, and intent from a natural language prompt.
 * Uses Groq as the primary provider and OpenRouter as the fallback.
 * @param {string} prompt - The user's input prompt.
 * @returns {Promise<{location: string, category: string, intent: string}>}
 */
export async function extractDataFromPrompt(prompt) {
  console.log("[AI] extractDataFromPrompt invoked");

  const providers = getProviders();
  if (providers.length === 0) {
    const detail = "Missing AI API key: set GROQ_API_KEY and/or OPENROUTER_API_KEY environment variable.";
    console.error("[AI]", detail);
    throw buildAIError(detail);
  }

  const failures = [];
  let lastError;
  for (const provider of providers) {
    try {
      console.log(`[AI] Sending prompt to ${provider.name} (${provider.model}).`);
      const result = await callProvider(provider, prompt);
      console.log(`[AI] Successfully parsed ${provider.name} response.`);
      return result;
    } catch (error) {
      lastError = error;
      const detail = extractAIErrorDetail(error);
      failures.push(`${provider.name}: ${detail}`);
      console.error(`[AI] ${provider.name} API call failed:`, detail, error?.response?.data || error);
    }
  }

  const status = lastError?.response?.status || lastError?.status || 500;
  throw buildAIError(failures.join("; "), status, lastError);
}
