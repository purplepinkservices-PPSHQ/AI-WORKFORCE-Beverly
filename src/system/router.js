"use strict";

// ============================================================
// Datei: src/system/router.js
// ============================================================

const { getState, setState } = require("./state");
const { resolvePlan } = require("./plan-resolver");
const { runOnboarding } = require("./onboarding-engine");
const { analyzeDocument } = require("../core/analyze-document");
const { renderMenu } = require("../ui/menu-renderer");
const { storeDocument } = require("../engines/dropbox-engine");
const { writeAuditLog } = require("./audit-log");
const { handleAuditChatCommand } = require("./audit-chat");
const { getDomainSwitchMenu } = require("./domain-switch");

// ------------------------------------------------------------
// Chat-Router (Decision-Matrix Vorspann)
// ------------------------------------------------------------
const {
  startChatRouterIfNeeded,
  handleChatRouterReply
} = require("../engines/chat-router-engine");

// Module
const { getModuleReaction: financeModule } =
  require("../modules/finance-module");

const { getModuleReaction: legalModule } =
  require("../modules/legal-module");

const { getModuleReaction: healthModule } =
  require("../modules/health-module");

async function routeDM(message) {
  if (message.author.bot) return;

  const userId = message.author.id;
  const text = message.content?.trim();
  const hasAttachment = message.attachments?.size > 0;
  const state = getState(userId);

  const auditHandled = await handleAuditChatCommand(message);
  if (auditHandled) return;

  // ============================================================
  // 🔧 FIX: Chat-Router → resumeFlow MUSS speichern + Menü zeigen
  // ============================================================
  if (state?.chatRouter) {
    const result = await handleChatRouterReply({
      userId,
      messageText: text
    });

    // Router läuft weiter
    if (result?.handled && !result?.resumeFlow) {
      if (result.replyText) await message.reply(result.replyText);
      return;
    }

    // ✅ Router fertig → JETZT speichern + Abschluss-Menü
    if (result?.handled && result?.resumeFlow) {
      if (result.replyText) await message.reply(result.replyText);

      const ctx = state.documentContext;

      if (!ctx) {
        setState(userId, { chatRouter: null });
        return;
      }

      const storageResult = await storeDocument(ctx);

      await writeAuditLog({
        timestamp: new Date().toISOString(),
        phase: "PHASE_4",
        result: "STORED",
        storagePath: storageResult.storagePath
      });

      const closingMenu = {
        text:
          "✅ Dokument gespeichert\n\n" +
          `📂 Ablage: ${storageResult.storagePath}\n` +
          `📄 Name: ${storageResult.fileName}\n\n` +
          "Menü:\n" +
          "1️⃣ Finanzen\n" +
          "2️⃣ Rechtliche Prüfung\n" +
          "3️⃣ Gesundheit\n\n" +
          "⬇️ Du kannst jetzt direkt das nächste Dokument hochladen 😊",
        actions: [
          { id: "MENU_FINANCE", label: "Finanzen" },
          { id: "MENU_LEGAL", label: "Recht" },
          { id: "MENU_HEALTH", label: "Gesundheit" }
        ]
      };

      await message.reply(closingMenu.text);

      setState(userId, {
        phase: "IDLE",
        awaitingAction: { actions: closingMenu.actions },
        documentContext: null,
        chatRouter: null
      });

      return; // ⛔ WICHTIG: KEIN FALLBACK MEHR
    }
  }

  // ============================================================
  // 🟢 IDLE → Abschluss-Menü Auswahl
  // ============================================================
  if (
    state?.phase === "IDLE" &&
    Array.isArray(state.awaitingAction?.actions) &&
    /^[1-3]$/.test(text)
  ) {
    const index = Number(text) - 1;
    const action = state.awaitingAction.actions[index];

    if (!action?.id) {
      await message.reply("❌ Auswahl nicht verfügbar.");
      return;
    }

    let reaction = null;

    if (action.id === "MENU_FINANCE") {
      reaction = financeModule({ state: "neutral", category: "finance" });
    }

    if (action.id === "MENU_LEGAL") {
      reaction = legalModule({ state: "neutral", category: "legal" });
    }

    if (action.id === "MENU_HEALTH") {
      reaction = healthModule({ state: "neutral", category: "health" });
    }

    const menu = renderMenu(reaction);
    setState(userId, {
      phase: "PHASE_3",
      awaitingAction: { actions: reaction.actions },
      documentContext: null
    });

    await message.reply(menu.text);
    return;
  }

  // ============================================================
  // DOKUMENT HOCHGELADEN
  // ============================================================
  if (hasAttachment) {
    if (!state.onboarded) setState(userId, { onboarded: true });

    await message.reply("📄 Dokument erhalten. Ich schaue es mir an …");

    const attachment = message.attachments.first();
    const buffer = Buffer.from(
      await fetch(attachment.url).then(res => res.arrayBuffer())
    );

    const analysis = await analyzeDocument({
      userId,
      fileBuffer: buffer
    });

    const documentContext = {
      userId,
      buffer,
      facts: analysis.facts,
      rawText: analysis.rawText
    };

    const routerDecision = await startChatRouterIfNeeded({
      userId,
      analysis,
      documentContext
    });

    if (routerDecision?.started) {
      setState(userId, {
        chatRouter: routerDecision.state,
        documentContext
      });

      if (routerDecision.replyText) {
        await message.reply(routerDecision.replyText);
      }
      return;
    }

    // Kein Router → direkt speichern
    const storageResult = await storeDocument(documentContext);

    const closingMenu = {
      text:
        "✅ Dokument gespeichert\n\n" +
        `📂 Ablage: ${storageResult.storagePath}\n` +
        `📄 Name: ${storageResult.fileName}\n\n` +
        "Menü:\n" +
        "1️⃣ Finanzen\n" +
        "2️⃣ Rechtliche Prüfung\n" +
        "3️⃣ Gesundheit\n\n" +
        "⬇️ Du kannst jetzt direkt das nächste Dokument hochladen 😊",
      actions: [
        { id: "MENU_FINANCE", label: "Finanzen" },
        { id: "MENU_LEGAL", label: "Recht" },
        { id: "MENU_HEALTH", label: "Gesundheit" }
      ]
    };

    await message.reply(closingMenu.text);

    setState(userId, {
      phase: "IDLE",
      awaitingAction: { actions: closingMenu.actions },
      documentContext: null,
      chatRouter: null
    });

    return;
  }

  // ============================================================
  // FALLBACK
  // ============================================================
  if (!state.onboarded) {
    const handled = await runOnboarding(message);
    if (handled) return;
  }

  const plan = resolvePlan(userId);
  setState(userId, { plan: plan.plan, phase: null });

  await message.reply("👉 Schick mir bitte ein Dokument (PDF / Bild).");
}

module.exports = { routeDM };