// ============================================================
// Beverly FREE – Dropbox Onboarding (STATEFUL, STABIL)
// Datei: src/free/onboarding-engine.js
// ============================================================

"use strict";

const { getState, setState } = require("../system/state");

async function runOnboarding(message) {
  const userId = message.author.id;
  const text = message.content?.toLowerCase().trim();
  const state = getState(userId);

  // ✅ Bereits onboarded → nichts tun
  if (state.onboarded) return false;

  // STEP 1: Begrüßung
  if (!state.step) {
    await message.reply(
      "👋 **Willkommen bei Beverly**\n\n" +
      "Bevor wir starten, kurz eine Frage:\n" +
      "**Hast du bereits einen Dropbox-Account?**\n\n" +
      "👉 Antworte bitte mit:\n" +
      "**ja** oder **nein**"
    );
    setState(userId, { step: "ASK_DROPBOX" });
    return true;
  }

  // STEP 2: Antwort auswerten
  if (state.step === "ASK_DROPBOX") {
    if (text === "nein") {
      await message.reply(
        "Kein Problem 😊\n\n" +
        "👉 Eröffne hier kostenlos einen Dropbox-Account:\n" +
        "https://www.dropbox.com/register\n\n" +
        "⏱️ Dauert ca. 1–2 Minuten.\n" +
        "Schreib mir danach **ja**."
      );
      return true;
    }

    if (text === "ja") {
      await message.reply("⏳ Super! Ich bereite deine Dropbox jetzt vor (ca. 1 Minute)…");
      setState(userId, { step: "SETUP" });

      // 👉 hier später echte Dropbox-Checks / Setup
      setTimeout(async () => {
        setState(userId, { onboarded: true, step: null });
        await message.reply(
          "✅ **Alles bereit!**\n\n" +
          "Schick mir jetzt einfach:\n" +
          "📄 PDF / Dokument\n" +
          "📸 Foto\n" +
          "🎥 Video\n\n" +
          "Ich sortiere alles automatisch 😊"
        );
      }, 1200);

      return true;
    }

    // falsche Antwort
    await message.reply("Bitte antworte nur mit **ja** oder **nein** 🙂");
    return true;
  }

  return false;
}

module.exports = { runOnboarding };