// ============================================================
//  AI Code Assistant - Background Service Worker
//  Handles API calls to Claude (Anthropic) or OpenAI
// ============================================================

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const OPENAI_API_URL    = "https://api.openai.com/v1/chat/completions";

// ---- Prompt templates ----------------------------------------
function buildPrompt(action, selectedText, customPrompt) {
  const codeBlock = `\`\`\`\n${selectedText}\n\`\`\``;

  switch (action) {
    case "review":
      return `You are an expert code reviewer. Analyze the following code and provide a clear, structured review. Cover:
1. What the code does (brief summary)
2. Code quality & readability
3. Potential issues or edge cases
4. Suggestions for improvement

Code to review:
${codeBlock}

Format your response with clear sections and be concise but thorough.`;

    case "improve":
      return `You are an expert software engineer. Rewrite and improve the following code. Make it:
1. More readable and maintainable
2. More efficient where possible
3. Following best practices
4. Better documented if needed

Original code:
${codeBlock}

Provide the improved version with a brief explanation of what you changed and why.`;

    case "bugs":
      return `You are an expert debugger. Analyze the following code and identify ALL potential bugs, security vulnerabilities, and issues:
1. Logic errors
2. Security vulnerabilities
3. Performance issues
4. Edge cases not handled
5. Potential runtime errors

Code to analyze:
${codeBlock}

For each issue found, explain: what it is, why it's a problem, and how to fix it. If the code looks correct, say so.`;

    case "custom":
      return `${customPrompt}\n\nCode/Text:\n${codeBlock}`;

    default:
      return `Analyze this code:\n${codeBlock}`;
  }
}

// ---- Anthropic Claude API call --------------------------------
async function callClaude(apiKey, model, prompt) {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: model || "claude-opus-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || "No response received.";
}

// ---- OpenAI API call ------------------------------------------
async function callOpenAI(apiKey, model, prompt) {
  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model || "gpt-4o",
      max_tokens: 2048,
      messages: [
        {
          role: "system",
          content:
            "You are an expert software engineer and code reviewer. Provide clear, accurate, and actionable responses.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "No response received.";
}

// ---- Message handler ------------------------------------------
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== "AI_REQUEST") return false;

  const { action, selectedText, customPrompt } = message;

  // Load settings and make API call
  chrome.storage.sync.get(
    ["provider", "claudeKey", "claudeModel", "openaiKey", "openaiModel"],
    async (settings) => {
      const provider   = settings.provider || "claude";
      const prompt     = buildPrompt(action, selectedText, customPrompt);

      try {
        let result;

        if (provider === "claude") {
          if (!settings.claudeKey) throw new Error("Claude API key not set. Please configure it in the extension settings.");
          result = await callClaude(settings.claudeKey, settings.claudeModel, prompt);
        } else {
          if (!settings.openaiKey) throw new Error("OpenAI API key not set. Please configure it in the extension settings.");
          result = await callOpenAI(settings.openaiKey, settings.openaiModel, prompt);
        }

        sendResponse({ success: true, result });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    }
  );

  // Return true to keep the message channel open for async response
  return true;
});
