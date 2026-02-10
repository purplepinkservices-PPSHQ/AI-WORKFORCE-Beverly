"use strict";

// ============================================================
// Datei: src/system/router.js
// Zweck:
// - Zentrale DM-Routing-Logik
// - KEIN Chat-Router
// - Dokumente werden nach Analyse DIREKT gespeichert
// - Voraussetzung: analyzeDocument liefert ISO-Datum (YYYY-MM-DD)
// ============================================================

const { getState, setState } = require("./state");
const { resolvePlan } = require("./plan-resolver");
const { runOnboarding } = require("./onboarding-engine");

const { analyzeDocument } = require("../core/analyze-document");
const { storeDocument } = require("../engines/dropbox-engine");

const { renderMenu } = require("../ui/menu-renderer");
const { writeAuditLog } = require("./audit-log");
const { handleAuditChatCommand } = require("./audit-chat");

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

  // ============================================================
  // Audit / System-Kommandos
  // ============================================================
  const auditHandled = await handleAuditChatCommand(message);
  if (auditHandled) return;

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
  // 📄 DOKUMENT HOCHGELADEN
  // ============================================================
  if (hasAttachment) {
    if (!state.onboarded) setState(userId, { onboarded: true });

    await message.reply("📄 Dokument erhalten. Ich schaue es mir an …");

    const attachment = message.attachments.first();
    const buffer = Buffer.from(
      await fetch(attachment.url).then(res => res.arrayBuffer())
    );

    // ============================================================
    // Analyse (liefert ISO-Datum!)
    // ============================================================
    const analysis = await analyzeDocument({
      userId,
      fileBuffer: buffer
    });

    const documentContext = {
      userId,
      buffer,
      rawText: analysis?.rawText || "",
      date: analysis?.date?.date || null, // ⬅️ ISO YYYY-MM-DD
      facts: {
        creditor: {
          name: analysis?.creditor?.creditor || "Unbekannt"
        }
      }
    };

    // ============================================================
    // DIREKT SPEICHERN – kein Chat-Router
    // ============================================================
    const storageResult = await storeDocument(documentContext);

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
      documentContext: null
    });

    return;
  }

  // ============================================================
  // FALLBACK / ONBOARDING
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