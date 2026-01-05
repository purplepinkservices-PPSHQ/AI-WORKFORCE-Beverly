// ============================================================
// Datei: src/system/router.js
// ============================================================
"use strict";

const { getState, setState } = require("./state");
const { resolvePlan } = require("./plan-resolver");
const { runOnboarding } = require("./onboarding-engine");
const { analyzeDocument } = require("../core/analyze-document");
const { renderMenu } = require("../ui/menu-renderer");

// Module (Phase 3B)
const { getModuleReaction: financeModule } = require("../modules/finance-module");
const { getModuleReaction: legalModule } = require("../modules/legal-module");
const { getModuleReaction: healthModule } = require("../modules/health-module");

async function routeDM(message) {
  if (message.author.bot) return;

  const userId = message.author.id;
  const hasAttachment = message.attachments?.size > 0;
  const text = message.content?.trim();

  const state = getState(userId);

  // ------------------------------------------------------------
  // PHASE 3 – AKTION AUSWÄHLEN & SOFORT VERARBEITEN
  // ------------------------------------------------------------
  if (state?.awaitingAction && /^[1-3]$/.test(text)) {
    const index = Number(text) - 1;
    const action = state.awaitingAction.actions[index];

    if (!action) {
      await message.reply("❌ Ungültige Auswahl.");
      return;
    }

    let response = "✅ Aktion verarbeitet.";

    if (action === "ABLEGEN") {
      response = "📁 Verstanden. Das Dokument wird später einfach abgelegt.";
    } else if (action === "PRUEFEN") {
      response = "🔍 Verstanden. Ich bereite eine fachliche Prüfung vor.";
    } else if (action === "TERMIN") {
      response = "📅 Verstanden. Ich merke mir eine mögliche Frist.";
    }

    setState(userId, {
      awaitingAction: null,
      phase: "PHASE_3_DONE",
      session: "abgeschlossen"
    });

    await message.reply(`✅ Auswahl gespeichert: ${action}`);
    await message.reply(response);
    return;
  }

  // ------------------------------------------------------------
  // PHASE 0 – Aktivierung
  // ------------------------------------------------------------
  setState(userId, { phase: "PHASE_0", session: "aktiv" });

  // ------------------------------------------------------------
  // 📄 DOKUMENT KOMMT → PHASE 1 → PHASE 2 → PHASE 3
  // ------------------------------------------------------------
  if (hasAttachment) {
    if (!state.onboarded) {
      setState(userId, {
        onboarded: true,
        onboardingStep: null
      });
    }

    setState(userId, { phase: "PHASE_1" });
    await message.reply("📄 Dokument erhalten. Ich schaue es mir an …");

    try {
      const attachment = message.attachments.first();
      const buffer = Buffer.from(
        await fetch(attachment.url).then((res) => res.arrayBuffer())
      );

      const result = await analyzeDocument({
        userId,
        fileBuffer: buffer,
        images: null
      });

      console.log("📊 PHASE 2 RESULT:", {
        state: result.score.state,
        score: result.score.score,
        type: result.type.type,
        category: result.category.category,
        module: result.module
      });

      // --------------------------------------------------------
      // PHASE 3B – Fachliche Modul-Reaktion
      // --------------------------------------------------------
      let moduleReaction = {
        text: "ℹ️ Kein passendes Modul gefunden.",
        actions: []
      };

      if (result.module === "finance-module") {
        moduleReaction = financeModule({
          state: result.score.state,
          category: result.category.category,
          document: null
        });
      } else if (result.module === "legal-module") {
        moduleReaction = legalModule({
          state: result.score.state,
          category: result.category.category,
          document: null
        });
      } else if (result.module === "health-module") {
        moduleReaction = healthModule({
          state: result.score.state,
          category: result.category.category,
          document: null
        });
      }

      const menu = renderMenu({
        state: result.score.state,
        category: result.category.category,
        module: result.module,
        text: moduleReaction.text,
        actions: moduleReaction.actions
      });

      setState(userId, {
        phase: "PHASE_3",
        awaitingAction: {
          actions: moduleReaction.actions
        }
      });

      await message.reply(menu.text);
    } catch (err) {
      console.error("❌ ANALYZE ERROR:", err.message);
      await message.reply("❌ Fehler beim Verarbeiten des Dokuments.");
    }

    return;
  }

  // ------------------------------------------------------------
  // 🗣️ KEIN DOKUMENT → Onboarding / Begrüßung
  // ------------------------------------------------------------
  if (!state.onboarded) {
    const handled = await runOnboarding(message);
    if (handled) return;
  }

  const plan = resolvePlan(userId);
  setState(userId, { plan: plan.plan, phase: null });

  await message.reply("👉 Schick mir bitte ein Dokument (PDF / Bild).");
}

async function routeReaction(reaction, user) {
  // Nicht genutzt
}

module.exports = { routeDM, routeReaction };