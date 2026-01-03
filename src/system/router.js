// ============================================================
// Datei: src/system/router.js
// ✅ ROUTER (ALTZUSTAND: ✍️ Menü + 1–6; 6 async mit Cache)
// ============================================================
"use strict";

const { runOnboarding } = require("../free/onboarding-engine");
const { handleFreeUpload } = require("../free/dropbox-engine");
const { getState, setState } = require("./state");
const legalLawyer = require("../modules/legal-lawyer");
const { splitForDiscord } = require("./message-splitter");

let routeReaction = async () => {};
try {
  const r = require("../free/reaction-correction-engine");
  routeReaction =
    r.routeReaction ||
    r.handleReaction ||
    r.onReaction ||
    r.default ||
    routeReaction;
} catch {}

async function routeDM(message) {
  try {
    if (!message || !message.author) return;
    if (message.author.bot) return;
    if (message.guild) return;

    const userId = message.author.id;
    const content = message.content?.trim();

    // 1) Onboarding
    const onboardingHandled = await runOnboarding(message);
    if (onboardingHandled) return;

    const state = getState(userId);

    // 2) Upload
    if (state.onboarded && message.attachments?.size > 0) {
      await handleFreeUpload(message);
      return;
    }

    // 3) ✍️ zeigt Menü
    if (content === "✍️") {
      const menu = legalLawyer.replyMenu?.();
      if (menu) {
        for (const part of splitForDiscord(menu)) await message.reply(part);
        return;
      }
    }

    // 4) Auswahl 1–6
    if (/^[1-6]$/.test(content)) {
      const lastAnalysis = state.lastLegalAnalysis || {};

      // 6 async
      if (content === "6" && typeof legalLawyer.handleReplyRequestAsync === "function") {
        const rawText = state.lastLegalRawText || "";
        const cache = {
          hash: state.lastLegalAIHash || "",
          review: state.lastLegalAIReview || null
        };

        const res = await legalLawyer.handleReplyRequestAsync(
          content,
          lastAnalysis,
          rawText,
          cache
        );

        if (res && res.message) {
          if (res.aiHash && res.aiReview) {
            setState(userId, {
              lastLegalAIHash: res.aiHash,
              lastLegalAIReview: res.aiReview
            });
          }
          for (const part of splitForDiscord(res.message)) await message.reply(part);
          return;
        }
      }

      // 1–5 sync
      const res = legalLawyer.handleReplyRequest?.(content, lastAnalysis);
      if (res && res.message) {
        for (const part of splitForDiscord(res.message)) await message.reply(part);
        return;
      }
    }

    // 5) Fallback
    if (content) {
      const fallback =
        "👍 Alles klar.\n📄 Du kannst mir jederzeit ein weiteres Dokument schicken – ich bin bereit 😊";
      for (const part of splitForDiscord(fallback)) await message.reply(part);
    }
  } catch (err) {
    console.error("❌ ROUTER ERROR:", err);
    try {
      await message.reply("⚠️ Kurz hakt es intern. Versuch es bitte nochmal.");
    } catch {}
  }
}

module.exports = { routeDM, routeReaction };