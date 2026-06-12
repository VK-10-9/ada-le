import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Get a streamed completion from Groq.
 * @param {Array<{role: string, content: string}>} messages
 * @param {object} [options]
 * @returns {Promise<string>} Full concatenated response.
 */
export async function getGroqCompletion(messages, options = {}) {
  const defaults = {
    model: "qwen/qwen3-32b",
    temperature: 0.6,
    max_completion_tokens: 4096,
    top_p: 0.95,
    stream: true,
    reasoning_effort: "default",
  };
  const params = { ...defaults, ...options, messages };
  const chatCompletion = await groq.chat.completions.create(params);
  let full = "";
  for await (const chunk of chatCompletion) {
    const part = chunk.choices[0]?.delta?.content || "";
    full += part;
  }
  return full;
}
