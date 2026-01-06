// ============================================================
// Datei: src/system/router.js
// ============================================================
"use strict";

const { getState, setState } = require("./state");
const { resolvePlan } = require("./plan-resolver");
const { runOnboarding } = require("./onboarding-engine");
const { analyzeDocument } = require("../core/analyze-document");
const { renderMenu } = require("../ui/menu-renderer");
const { storeDocument } = require("../engines/dropbox-engine");
const { writeAuditLog } = require("./audit-log");
const { handleAuditChatCommand } = require("./audit-chat");

// Module (Phase 3B)
const { getModuleReaction: financeModule } = require("../modules/finance-module");
const { getModuleReaction: legalModule } = require("../modules/legal-module");
const { getModuleReaction: healthModule } = require("../modules/health-module");

async function routeDM(message) {
  if (message.author.bot) return;

  // ------------------------------------------------------------
  // STEP 6.2.1 – AUDIT CHAT COMMANDS (READ ONLY)
  // ------------------------------------------------------------
  const auditHandled = await handleAuditChatCommand(message);
  if (auditHandled) return;

  const userId = message.author.id;
  const hasAttachment = message.attachments?.size > 0;
  const text = message.content?.trim();
  const state = getState(userId);

  // ------------------------------------------------------------
  // PHASE 3 → PHASE 4 – SPEICHERN + AUDIT
  // ------------------------------------------------------------
  if (state?.awaitingAction && /^[1-3]$/.test(text)) {
    const index = Number(text) - 1;
    const action = state.awaitingAction.actions[index];

    if (!action || !state.documentContext) {
      await message.reply("❌ Vorgang nicht verfügbar.");
      return;
    }

    const storageResult = await storeDocument(state.documentContext);

    try {
      await writeAuditLog({
        timestamp: new Date().toISOString(),
        phase: "PHASE_4",
        result: "STORED",
        confidence: state.documentContext.score,
        module: state.documentContext.module,
        storagePath: storageResult.storagePath
      });
    } catch (e) {
      console.error("⚠️ AUDIT LOG ERROR:", e?.message || e);
    }

    setState(userId, {
      awaitingAction: null,
      documentContext: null,
      phase: "PHASE_4_DONE",
      session: "abgeschlossen"
    });

    await message.reply(
      "✅ Dokument gespeichert\n\n" +
        `📂 Ablage: ${storageResult.storagePath}\n` +
        `📄 Name: ${storageResult.fileName}\n\n` +
        "⬇️ Du kannst jetzt direkt das nächste Dokument hochladen 😊"
    );
    return;
  }

  // ------------------------------------------------------------
  // PHASE 0 – Aktivierung
  // ------------------------------------------------------------
  setState(userId, { phase: "PHASE_0", session: "aktiv" });

  // ------------------------------------------------------------
  // 📄 DOKUMENT KOMMT → PHASE 1–3
  // ------------------------------------------------------------
  if (hasAttachment) {
    if (!state.onboarded) {
      setState(userId, { onboarded: true, onboardingStep: null });
    }

    setState(userId, { phase: "PHASE_1" });
    await message.reply("📄 Dokument erhalten. Ich schaue es mir an …");

    try {
      const attachment = message.attachments.first();

      const buffer = Buffer.from(
        await fetch(attachment.url).then((res) => res.arrayBuffer())
      );

      const analysis = await analyzeDocument({
        userId,
        fileBuffer: buffer,
        images: null,
        mimeType: attachment.contentType || null,
        filePath: attachment.name || null
      });

      const documentContext = {
        userId,
        buffer,
        documentType: analysis.type.type,
        category: analysis.category.category,
        module: analysis.module,
        score: analysis.score.score,
        state: analysis.score.state,
        rawText: analysis.rawText || ""
      };

      console.log("📦 DOCUMENT CONTEXT READY", {
        module: documentContext.module,
        category: documentContext.category,
        state: documentContext.state,
        score: documentContext.score
      });

      let moduleReaction = {
        text: "ℹ️ Kein passendes Modul gefunden.",
        actions: []
      };

      if (analysis.module === "finance-module") {
        moduleReaction = financeModule({
          state: analysis.score.state,
          category: analysis.category.category,
          document: null
        });
      } else if (analysis.module === "legal-module") {
        moduleReaction = legalModule({
          state: analysis.score.state,
          category: analysis.category.category,
          document: null
        });
      } else if (analysis.module === "health-module") {
        moduleReaction = healthModule({
          state: analysis.score.state,
          category: analysis.category.category,
          document: null
        });
      }

      const menu = renderMenu({
        state: analysis.score.state,
        category: analysis.category.category,
        module: analysis.module,
        text: moduleReaction.text,
        actions: moduleReaction.actions
      });

      setState(userId, {
        phase: "PHASE_3",
        awaitingAction: { actions: moduleReaction.actions },
        documentContext
      });

      await message.reply(menu.text);
    } catch (err) {
      console.error("❌ ANALYZE ERROR:", err);
      await message.reply("❌ Fehler beim Verarbeiten des Dokuments.");
    }

    return;
  }

  // ------------------------------------------------------------
  // 🗣️ KEIN DOKUMENT → ONBOARDING / Fallback
  // ------------------------------------------------------------
  if (!state.onboarded) {
    const handled = await runOnboarding(message);
    if (handled) return;
  }

  const plan = resolvePlan(userId);
  setState(userId, { plan: plan.plan, phase: null });

  await message.reply("👉 Schick mir bitte ein Dokument (PDF / Bild).");
}

async function routeReaction(reaction, user) {}

module.exports = { routeDM, routeReaction };