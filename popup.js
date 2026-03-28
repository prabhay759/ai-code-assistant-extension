// ============================================================
//  AI Code Assistant — Popup Script (Settings)
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  // ---- Element refs ----------------------------------------
  const providerTabs    = document.querySelectorAll(".provider-tab");
  const claudeSection   = document.getElementById("claude-settings");
  const openaiSection   = document.getElementById("openai-settings");
  const claudeKeyInput  = document.getElementById("claude-key");
  const claudeModelSel  = document.getElementById("claude-model");
  const openaiKeyInput  = document.getElementById("openai-key");
  const openaiModelSel  = document.getElementById("openai-model");
  const saveBtn         = document.getElementById("save-btn");
  const saveMsg         = document.getElementById("save-msg");
  const statusBadge     = document.getElementById("status-badge");

  let currentProvider = "claude";

  // ---- Load saved settings ---------------------------------
  chrome.storage.sync.get(
    ["provider", "claudeKey", "claudeModel", "openaiKey", "openaiModel"],
    (s) => {
      currentProvider = s.provider || "claude";

      claudeKeyInput.value = s.claudeKey   || "";
      claudeModelSel.value = s.claudeModel || "claude-opus-4-6";
      openaiKeyInput.value = s.openaiKey   || "";
      openaiModelSel.value = s.openaiModel || "gpt-4o";

      switchProvider(currentProvider, false);
      updateStatusBadge(s);
    }
  );

  // ---- Provider tab switching ------------------------------
  providerTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      currentProvider = tab.dataset.provider;
      switchProvider(currentProvider, true);
    });
  });

  function switchProvider(provider, animate) {
    providerTabs.forEach((t) => t.classList.toggle("active", t.dataset.provider === provider));

    if (provider === "claude") {
      claudeSection.classList.remove("hidden");
      openaiSection.classList.add("hidden");
    } else {
      openaiSection.classList.remove("hidden");
      claudeSection.classList.add("hidden");
    }
  }

  // ---- Toggle password visibility -------------------------
  document.querySelectorAll(".eye-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.target);
      input.type  = input.type === "password" ? "text" : "password";
    });
  });

  // ---- Save settings ---------------------------------------
  saveBtn.addEventListener("click", () => {
    const settings = {
      provider:    currentProvider,
      claudeKey:   claudeKeyInput.value.trim(),
      claudeModel: claudeModelSel.value,
      openaiKey:   openaiKeyInput.value.trim(),
      openaiModel: openaiModelSel.value,
    };

    chrome.storage.sync.set(settings, () => {
      updateStatusBadge(settings);

      saveMsg.classList.remove("hidden");
      setTimeout(() => saveMsg.classList.add("hidden"), 2000);
    });
  });

  // ---- Status badge ----------------------------------------
  function updateStatusBadge(settings) {
    const provider = settings.provider || "claude";
    const key =
      provider === "claude" ? settings.claudeKey : settings.openaiKey;

    statusBadge.className = "badge";

    if (key && key.length > 10) {
      statusBadge.classList.add("badge-ready");
      statusBadge.textContent = "✓ Ready";
    } else {
      statusBadge.classList.add("badge-idle");
      statusBadge.textContent = "Not configured";
    }
  }
});
