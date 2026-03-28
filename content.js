// ============================================================
//  AI Code Assistant - Content Script
//  Detects text selection and injects floating toolbar + modal
// ============================================================

(function () {
  "use strict";

  // ---- State ------------------------------------------------
  let toolbar        = null;
  let modal          = null;
  let lastSelection  = "";
  let hideTimer      = null;

  // ---- Action definitions -----------------------------------
  const ACTB�ONS = [
    {
      id:    "review",
      label: "Review",
      icon:  "🔍",
      title: "Review & Explain Code",
    },
    {
      id:    "improve",
      label: "Improve",
      icon:  "✨",
      title: "Suggest Improvements",
    },
    {
      id:    "bugs",
      label: "Find Bugs",
      icon:  "🐛",
      title: "Find Bugs & Vulnerabilities",
    },
    {
      id:    "custom",
      label: "Ask AI",
      icon:  "💬",
      title: "Custom Prompt",
    },
  ];

  // ---- Toolbar creation ------------------------------------
  function createToolbar() {
    if (toolbar) return toolbar;

    toolbar = document.createElement("div");
    toolbar.id = "aia-toolbar";
    toolbar.setAttribute("role", "toolbar");
    toolbar.setAttribute("aria-label", "AI Code Assistant");

    // Logo / brand
    const brand = document.createElement("span");
    brand.className = "aia-brand";
    brand.textContent = "✦ AI";
    toolbar.appendChild(brand);

    // Divider
    const div0 = document.createElement("span");
    div0.className = "aia-divider";
    toolbar.appendChild(div0);

    // Action buttons
    ACTIONS.forEach((action) => {
      const btn = document.createElement("button");
      btn.className    = "aia-btn";
      btn.dataset.action = action.id;
      btn.title        = action.title;
      btn.innerHTML    = `<span class="aia-icon">${action.icon}</span><span class="aia-label">${action.label}</span>`;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        handleAction(action.id);
      });
      toolbar.appendChild(btn);
    });

    document.body.appendChild(toolbar);
    return toolbar;
  }

  // ---- Position toolbar near selection ----------------------
  function positionToolbar(rect) {
    const tb = createToolbar();
    tb.style.display = "flex";

    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    const tbWidth  = 320;
    const tbHeight = 44;
    const gap      = 10;

    let top  = rect.top  + scrollY - tbHeight - gap;
    let left = rect.left + scrollX + rect.width / 2 - tbWidth / 2;

    // If not enough space above, show below
    if (top < scrollY + 10) {
      top = rect.bottom + scrollY + gap;
    }

    // Clamp to viewport width
    const vw = document.documentElement.clientWidth;
    left = Math.max(scrollX + 8, Math.min(left, scrollX + vw - tbWidth - 8));

    tb.style.top  = `${top}px`;
    tb.style.left = `${left}px`;
  }

  // ---- Hide toolbar -----------------------------------------
  function hideToolbar() {
    if (toolbar) {
      toolbar.style.display = "none";
    }
  }

  // ---- Modal creation / management -------------------------
  function createModal() {
    if (modal) return modal;

    // Overlay
    const overlay = document.createElement("div");
    overlay.id = "aia-overlay";
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });

    // Panel
    const panel = document.createElement("div");
    panel.id = "aia-modal";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");

    // Header
    const header = document.createElement("div");
    header.className = "aia-modal-header";
    header.innerHTML = `
      <div class="aia-modal-title">
        <span class="aia-modal-icon"></span>
        <span class="aia-modal-label"></span>
      </div>
      <div class="aia-modal-actions">
        <button class="aia-icon-btn aia-copy-btn" title="Copy response">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        </button>
        <button class="aia-icon-btn aia-close-btn" title="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    `;

    // Body
    const body = document.createElement("div");
    body.className = "aia-modal-body";

    // Selected text preview
    const preview = document.createElement("div");
    preview.className = "aia-selection-preview";

    // Response area
    const response = document.createElement("div");
    response.className = "aia-response";

    body.appendChild(preview);
    body.appendChild(response);

    panel.appendChild(header);
    panel.appendChild(body);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    // Wire up close/copy
    header.querySelector(".aia-close-btn").addEventListener("click", closeModal);
    header.querySelector(".aia-copy-btn").addEventListener("click", () => {
      const text = response.innerText;
      navigator.clipboard.writeText(text).then(() => {
        const btn = header.querySelector(".aia-copy-btn");
        btn.classList.add("aia-copied");
        setTimeout(() => btn.classList.remove("aia-copied"), 1500);
      });
    });

    // ESC to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });

    modal = overlay;
    return modal;
  }

  function openModal(action) {
    const overlay = createModal();
    const panel   = overlay.querySelector("#aia-modal");
    const iconEl  = panel.querySelector(".aia-modal-icon");
    const labelEl = panel.querySelector(".aia-modal-label");
    const preview = panel.querySelector(".aia-selection-preview");
    const response= panel.querySelector(".aia-response");

    const actionDef = ACTIONS.find((a) => a.id === action);
    iconEl.textContent  = actionDef?.icon  || "✦";
    labelEl.textContent = actionDef?.title || "AI Assistant";

    // Show selection preview (truncated)
    const MAX_PREVIEW = 180;
    const previewText  = lastSelection.length > MAX_PREVIEW
      ? lastSelection.slice(0, MAX_PREVIEW) + "…"
      : lastSelection;
    preview.textContent = previewText;

    response.innerHTML  = "";
    response.className  = "aia-response aia-loading";
    response.innerHTML  = `<div class="aia-spinner"></div><p>Thinking… </p>`;

    overlay.style.display = "flex";
    return { response, panel };
  }

  function closeModal() {
    if (modal) modal.style.display = "none";
  }

  // ---- Custom prompt dialog ---------------------------------
  function showCustomPromptDialog() {
    return new Promise((resolve) => {
      // Reuse modal but show input form
      const overlay = createModal();
      const panel   = overlay.querySelector("#aia-modal");
      const iconEl  = panel.querySelector(".aia-modal-icon");
      const labelEl = panel.querySelector(".aia-modal-label");
      const preview = panel.querySelector(".aia-selection-preview");
      const response= panel.querySelector(".aia-response");

      iconEl.textContent  = "💬";
      labelEl.textContent = "Custom AI Prompt";

      const MAX_PREVIEW = 180;
      const previewText  = lastSelection.length > MAX_PREVIEW
        ? lastSelection.slice(0, MAX_PREVIEW) + "…"
        : lastSelection;
      preview.textContent = previewText;

      response.className = "aia-response";
      response.innerHTML = `
        <div class="aia-custom-prompt-wrap">
          <label class="aia-custom-label">What would you like the AI to do with this text?</label>
          <textarea class="aia-custom-input" placeholder="e.g. Translate to Python 3, Add type hints, Write unit tests for this…" rows="4"></textarea>
          <div class="aia-custom-btns">
            <button class="aia-submit-btn">Send to AI ↲</button>
            <button class="aia-cancel-btn">Cancel</button>
          </div>
        </div>
      `;

      overlay.style.display = "flex";

      const textarea   = response.querySelector(".aia-custom-input");
      const submitBtn  = response.querySelector(".aia-submit-btn");
      const cancelBtn  = response.querySelector(".aia-cancel-btn");

      textarea.focus();

      submitBtn.addEventListener("click", () => {
        const val = textarea.value.trim();
        if (val) resolve(val);
      });

      cancelBtn.addEventListener("click", () => {
        closeModal();
        resolve(null);
      });

      textarea.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          const val = textarea.value.trim();
          if (val) resolve(val);
        }
      });
    });
  }

  // ---- Render markdown-like response -----------------------
  function renderResponse(container, text) {
    container.className = "aia-response";

    // Simple markdown renderer: code blocks, bold, headers, lists
    let html = text
      // Code blocks (```lang\n...\n```)
      .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
        const langLabel = lang ? `<span class="aia-code-lang">${lang}</span>` : "";
        return `<div class="aia-code-block">${langLabel}<button class="aia-copy-code" title="Copy code">⎘</button><pre><code>${escapeHTML(code.trim())}</code></pre></div>`;
      })
      // Inline code
      .replace(/`([^`]+)`/g, "<code class='aia-inline-code'>$1</code>")
      // Bold
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      // Headers
      .replace(/^### (.+)$/gm, "<h4>$1</h4>")
      .replace(/^## (.+)$/gm, " <h3>$1</h3>")
      .replace(/^# (.+)$/gm,   "<h2>$1</h2>")
      // Numbered lists
      .replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>")
      // Unordered lists
      .replace(/^[-*]\s+(.+)$/gm, "<li>$1</li>")
      // Wrap consecutive <li> items
      .replace(/(<li>.*(</\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
      // Paragraphs (double newline)
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>");

    container.innerHTML = `<p>${html}</p>`;

    // Wire up copy-code buttons
    container.querySelectorAll(".aia-copy-code").forEach((btn) => {
      btn.addEventListener("click", () => {
        const code = btn.nextElementSibling?.innerText || "";
        navigator.clipboard.writeText(code).then(() => {
          btn.textContent = "✓";
          setTimeout(() => (btn.textContent = "⎘"), 1500);
        });
      });
    });
  }

  function escapeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ---- Handle action button click --------------------------
  async function handleAction(action) {
    hideToolbar();

    let customPrompt = null;

    if (action === "custom") {
      customPrompt = await showCustomPromptDialog();
      if (!customPrompt) return; // user cancelled
    }

    const { response: responseEl } = openModal(action);

    // Request AI response from background script
    chrome.runtime.sendMessage(
      {
        type:         "AI_REQUEST",
        action,
        selectedText: lastSelection,
        customPrompt,
      },
      (reply) => {
        if (chrome.runtime.lastError) {
          renderError(responseEl, chrome.runtime.lastError.message);
          return;
        }

        if (reply?.success) {
          renderResponse(responseEl, reply.result);
        } else {
          renderError(responseEl, reply?.error || "Unknown error occurred.");
        }
      }
    );
  }

  function renderError(container, message) {
    container.className = "aia-response aia-error";
    container.innerHTML = `
      <div class="aia-error-icon">⚠️</div>
      <p class="aia-error-msg">${escapeHTML(message)}</p>
      <p class="aia-error-hint">Check your API key in the extension settings (click the ✦ AI icon in your toolbar).</p>
    `;
  }

  // ---- Selection listener ----------------------------------
  document.addEventListener("mouseup", (e) => {
    // Don't show toolbar if clicking inside our own UI
    if (
      e.target.closest("#aia-toolbar") ||
      e.target.closest("#aia-overlay")
    )
      return;

    clearTimeout(hideTimer);

    setTimeout(() => {
      const sel  = window.getSelection();
      const text = sel?.toString().trim();

      if (text && text.length >= 3) {
        lastSelection = text;
        const range = sel.getRangeAt(0);
        const rect  = range.getBoundingClientRect();
        positionToolbar(rect);
      } else {
        hideTimer = setTimeout(hideToolbar, 200);
      }
    }, 10);
  });

  // Hide toolbar on scroll or click elsewhere
  document.addEventListener("mousedown", (e) => {
    if (!e.target.closest("#aia-toolbar") && !e.target.closest("#aia-overlay")) {
      hideTimer = setTimeout(hideToolbar, 150);
    }
  });

  document.addEventListener(
    "scroll",
    () => {
      hideToolbar();
    },
    { passive: true }
  );

  // Keyboard: Ctrl+Shift+A to trigger review on selection
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "A") {
      const text = window.getSelection()?.toString().trim();
      if (text && text.length >= 3) {
        lastSelection = text;
        handleAction("review");
      }
    }
  });
})();
