<div align="center">

# ✦ AI Code Assistant

**AI-powered code review & improvement directly on GitHub and GitLab**

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue?style=flat-square)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Chrome](https://img.shields.io/badge/Chrome-supported-green?style=flat-square&logo=googlechrome)](https://chrome.google.com/webstore)
[![Firefox](https://img.shields.io/badge/Firefox-supported-orange?style=flat-square&logo=firefox)](https://addons.mozilla.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

Select any code or text on GitHub / GitLab → get instant AI help from **Claude** or **GPT-4**.

</div>

---

## What it does

Highlight any text on GitHub or GitLab and a floating toolbar appears instantly:

```
  ✦ AI  |  🔍 Review  ✨ Improve  🐛 Find Bugs  💬 Ask AI
```

| Action | What the AI does |
|---|---|
| 🔍 **Review** | Explains what the code does, rates quality, and gives structured feedback |
| ✨ **Improve** | Rewrites the code with better readability, performance, and best practices |
| 🐛 **Find Bugs** | Spots logic errors, security vulnerabilities, and unhandled edge cases |
| 💬 **Ask AI** | Type any custom instruction — translate language, write tests, add types, etc. |

Works on code diffs, PR descriptions, comments, README files — any selectable text.

---

## Prerequisites

- A **Chromium-based browser** (Chrome, Edge, Brave) or **Firefox**
- An API key from **Anthropic** or **OpenAI** (free tiers available):
  - Claude: [console.anthropic.com](https://console.anthropic.com) → API Keys
  - OpenAI: [platform.openai.com](https://platform.openai.com) → API Keys

---

## Installation

### Download the extension

**Option A — Clone with git:**
```bash
git clone https://github.com/coolprabhay90/ai-code-assistant-extension.git
```

**Option B — Download ZIP:**
Click the green **`<> Code`** button above → **Download ZIP** → unzip the folder.

---

### Load in Chrome / Edge / Brave

1. Open your browser and go to `chrome://extensions`
2. Turn on **Developer mode** using the toggle in the top-right corner
3. Click **Load unpacked**
4. Select the `ai-code-assistant-extension` folder you just downloaded
5. The **✦ AI** icon will appear in your extensions toolbar

> If you don't see the icon, click the puzzle-piece 🧩 icon in the toolbar and pin it.

---

### Load in Firefox

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on…**
3. Browse into the extension folder and select the `manifest.json` file
4. The extension is now active for this browser session

> **Note:** Temporary add-ons in Firefox are removed when the browser restarts. For a persistent install you would need to [sign the extension via AMO](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/).

---

## Setup (first time)

1. Click the **✦ AI** icon in your browser toolbar → the settings panel opens
2. Select your AI provider: **Claude** or **GPT-4**
3. Paste your API key into the field
4. Choose a model (Opus / Sonnet / Haiku for Claude, GPT-4o / GPT-4o-mini for OpenAI)
5. Click **Save Settings** — the badge turns **✓ Ready** (green)

You're all set. Navigate to any GitHub or GitLab page and select some text.

---

## How to Use

1. Go to any page on **github.com** or **gitlab.com**
2. **Click and drag to select** any text — code, a diff, a PR description, a comment, anything
3. The AI toolbar appears above your selection
4. Click an action button — a result panel slides in with the AI's response
5. Use **⎘** to copy individual code blocks, or the copy icon in the header to copy everything

### Custom Prompt tip

Clicking **💬 Ask AI** lets you type exactly what you want. Examples:

- *"Rewrite this in TypeScript with strict types"*
- *"Write Jest unit tests for this function"*
- *"Explain this regex step by step"*
- *"Convert this class component to a React hook"*
- *"Find any SQL injection vulnerabilities"*

Press `Ctrl+Enter` (or `Cmd+Enter` on Mac) to submit.

### Keyboard shortcut

`Ctrl+Shift+A` (Windows/Linux) or `Cmd+Shift+A` (Mac) — triggers **Review** on whatever text is currently selected, without clicking the toolbar.

---

## Privacy & Security

- **API keys never leave your browser.** They are stored in `chrome.storage.sync`, which syncs only across your own Chrome profile and is never accessible to any website or third party.
- **No proxy server.** Selected text is sent directly from your browser to the AI provider's API (Anthropic or OpenAI). Nothing passes through an intermediate server.
- **Minimal permissions.** The extension only activates on `github.com` and `gitlab.com` — it has no access to any other site.
- **No tracking.** The extension collects no usage data, analytics, or telemetry.

---

## File Structure

```
ai-code-assistant-extension/
├── manifest.json       # Extension manifest (Manifest V3)
├── background.js       # Service worker — API calls to Claude / OpenAI
├── content.js          # Injected script — selection detection, toolbar & modal UI
├── content.css         # Styles for the floating toolbar and result modal
├── popup.html          # Settings popup page
├── popup.js            # Settings popup logic
├── popup.css           # Settings popup styles
├── .gitignore          # Prevents API keys and build artifacts from being committed
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Toolbar doesn't appear | Confirm you're on github.com or gitlab.com and have selected at least 3 characters |
| "API key not set" error | Click the ✦ AI icon in your toolbar, enter your key, and hit Save |
| Error 401 (Unauthorized) | Your API key is invalid or has been revoked — generate a new one |
| Error 429 (Rate limit) | You've hit the API rate limit — wait a moment and try again |
| Error 403 (Forbidden) | Your account may not have API access enabled — check your provider dashboard |
| Firefox extension gone after restart | Re-load via `about:debugging` or sign the extension through Mozilla |
| Extension not loading in Chrome | Make sure Developer mode is ON in `chrome://extensions` |

---

## Development

To modify and test the extension locally:

```bash
# 1. Clone the repo
git clone https://github.com/coolprabhay90/ai-code-assistant-extension.git
cd ai-code-assistant-extension

# 2. Make your changes to any source file

# 3. Reload in Chrome
#    chrome://extensions → find the extension → click the ↻ refresh icon

# 4. Reload the GitHub/GitLab tab to pick up content script changes
```

No build step required — the extension runs as plain JavaScript.

---

## Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

[MIT](LICENSE) — free to use, modify, and distribute.

---

<div align="center">
Built with ❤️ &nbsp;|&nbsp; Uses <a href="https://www.anthropic.com">Anthropic Claude API</a> and <a href="https://openai.com">OpenAI API</a>
</div>
