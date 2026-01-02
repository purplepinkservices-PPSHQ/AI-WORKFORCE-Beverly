// ============================================================
// Datei: src/system/router.js
// ============================================================
"use strict";

const { runOnboarding } = require("../free/onboarding-engine");
const { handleFreeUpload } = require("../free/dropbox-engine");
const { getState, setState } = require("./state");
const legalLawyer = require("../modules/legal-lawyer");

// ✅ ADD-ON: Discord Message Splitter (bereits gebaut)
const { splitForDiscord } = require("./message-splitter");

// Reactions (bestehend, unverändert)
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

    // 1️⃣ Onboarding
    const onboardingHandled = await runOnboarding(message);
    if (onboardingHandled) return;

    const state = getState(userId);

    // 2️⃣ Upload
    if (state.onboarded && message.attachments?.size > 0) {
      await handleFreeUpload(message);
      return;
    }

    // 3️⃣ ✍️ Emoji als Text (Fallback)
    if (content === "✍️") {
      const menu = legalLawyer.replyMenu?.();
      if (menu) {
        const parts = splitForDiscord(menu);
        for (const part of parts) {
          await message.reply(part);
        }
        return;
      }
    }

    // 4️⃣ Auswahl 1–6 → legal-lawyer
    if (/^[1-6]$/.test(content)) {
      const lastAnalysis = state.lastLegalAnalysis || {};

      // ✅ OPTION 6: Async (OpenAI-Vertiefung) – Add-on
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
          // Cache speichern (nur wenn vorhanden)
          if (res.aiHash && res.aiReview) {
            setState(userId, {
              lastLegalAIHash: res.aiHash,
              lastLegalAIReview: res.aiReview
            });
          }

          const parts = splitForDiscord(res.message);
          for (const part of parts) {
            await message.reply(part);
          }
          return;
        }
      }

      // 1–5 bleiben wie gehabt (sync)
      const res = legalLawyer.handleReplyRequest(content, lastAnalysis);
      if (res && res.message) {
        const parts = splitForDiscord(res.message);
        for (const part of parts) {
          await message.reply(part);
        }
        return;
      }
    }

    // 5️⃣ Fallback
    if (content) {
      const fallback =
        "👍 Alles klar.\n📄 Du kannst mir jederzeit ein weiteres Dokument schicken – ich bin bereit 😊";
      const parts = splitForDiscord(fallback);
      for (const part of parts) {
        await message.reply(part);
      }
    }
  } catch (err) {
    console.error("❌ ROUTER ERROR:", err);
    try {
      await message.reply("⚠️ Kurz hakt es intern. Versuch es bitte nochmal.");
    } catch {}
  }
}

module.exports = { routeDM, routeReaction };