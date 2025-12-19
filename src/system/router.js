"use strict";

const { runOnboarding } = require("../free/onboarding-engine");
const { handleFreeUpload } = require("../free/dropbox-engine");
const { getState } = require("./state");

// Optional: falls du Reaction-Flow drin hast
let routeReaction = async () => {};
try {
  const m = require("./reaction-router");
  routeReaction = m.routeReaction || routeReaction;
} catch {
  // ok
}

async function routeDM(message) {
  try {
    if (!message || !message.author) return;
    if (message.author.bot) return;
    if (message.guild) return;

    const userId = message.author.id;
    const content = message.content?.trim();

    // 1️⃣ ONBOARDING HAT IMMER PRIORITÄT
    const onboardingHandled = await runOnboarding(message);
    if (onboardingHandled) return;

    const state = getState(userId);

    // 2️⃣ Uploads nur NACH Onboarding
    if (state.onboarded && message.attachments?.size > 0) {
      await handleFreeUpload(message);
      return;
    }

    // 3️⃣ Auswahlantworten ignorieren (werden woanders verarbeitet)
    if (/^[1-4]$/.test(content)) return;

    // 4️⃣ Fallback
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