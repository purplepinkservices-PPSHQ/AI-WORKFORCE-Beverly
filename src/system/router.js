"use strict";

const { runOnboarding } = require("../free/onboarding-engine");
const { handleFreeUpload } = require("../free/dropbox-engine");
const { getState } = require("./state");
const legalLawyer = require("../modules/legal-lawyer");

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

    // 3️⃣ ✍️ Emoji → Antwort-Menü (LEGAL-LAWYER)
    if (content === "✍️") {
      const menu = legalLawyer.replyMenu?.();
      if (menu) {
        await message.reply(menu);
        return;
      }
    }

    // 4️⃣ Auswahl 1–5 → legal-lawyer
    if (/^[1-5]$/.test(content)) {
      const res = legalLawyer.handleReplyRequest(content);
      if (res && res.message) {
        await message.reply(res.message);
        return;
      }
    }

    // 5️⃣ Fallback
    if (content) {
      await message.reply(
        "👍 Alles klar.\n📄 Du kannst mir jederzeit ein weiteres Dokument schicken – ich bin bereit 😊"
      );
    }
  } catch (err) {
    console.error("❌ ROUTER ERROR:", err);
    try {
      await message.reply("⚠️ Kurz hakt es intern. Versuch es bitte nochmal.");
    } catch {}
  }
}

module.exports = { routeDM, routeReaction };