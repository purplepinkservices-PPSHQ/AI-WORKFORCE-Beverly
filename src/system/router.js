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
const { getDomainSwitchMenu } = require("./domain-switch");

// Module
const { getModuleReaction: financeModule } =
  require("../modules/finance-module");

// 🔴 EINZIGE ÄNDERUNG HIER
const { getModuleReaction: legalModule } =
  require("../modules/legal/index");

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

  // ------------------------------------------------------------
  // DOMAIN SWITCH (ANDERER BEREICH)
  // ------------------------------------------------------------
  if (state?.awaitingAction && state.documentContext && text === "6") {
    const domainMenu = getDomainSwitchMenu();
    const rendered = renderMenu({
      text: domainMenu.text,
      actions: domainMenu.actions
    });

    setState(userId, {
      phase: "DOMAIN_SWITCH",
      documentContext: state.documentContext,
      awaitingAction: { actions: domainMenu.actions }
    });

    await message.reply(rendered.text);
    return;
  }

  // ------------------------------------------------------------
  // DOMAIN SWITCH ZIEL
  // ------------------------------------------------------------
  if (state?.phase === "DOMAIN_SWITCH" && state.documentContext) {
    let moduleReaction = null;

    if (text === "1") {
      moduleReaction = financeModule({
        state: state.documentContext.state,
        category: "finance"
      });
      state.documentContext.module = "finance-module";
    }

    if (text === "2") {
      moduleReaction = legalModule({
        state: state.documentContext.state,
        category: state.documentContext.category
      });
      state.documentContext.module = "legal-module";
    }

    if (text === "3") {
      moduleReaction = healthModule({
        state: state.documentContext.state,
        category: state.documentContext.category
      });
      state.documentContext.module = "health-module";
    }

    if (moduleReaction) {
      const menu = renderMenu({
        text: moduleReaction.text,
        actions: moduleReaction.actions
      });

      setState(userId, {
        phase: "PHASE_3",
        awaitingAction: { actions: moduleReaction.actions },
        documentContext: state.documentContext
      });

      await message.reply(menu.text);
      return;
    }
  }

  // ------------------------------------------------------------
  // FINANCE → UNTERMODUL AUSWAHL (1–7)
  // ------------------------------------------------------------
  if (
    state?.phase === "PHASE_3" &&
    state.documentContext?.module === "finance-module" &&
    Array.isArray(state.awaitingAction?.actions) &&
    /^[1-7]$/.test(text)
  ) {
    const index = Number(text) - 1;
    const action = state.awaitingAction.actions[index];

    if (!action || !action.id) {
      await message.reply("❌ Auswahl nicht verfügbar.");
      return;
    }

    if (action.id === "FINANCE_STORE_ONLY") {
      const storageResult = await storeDocument(state.documentContext);

      await writeAuditLog({
        timestamp: new Date().toISOString(),
        phase: "PHASE_4",
        result: "STORED",
        confidence: state.documentContext.score,
        module: "finance-module",
        storagePath: storageResult.storagePath
      });

      setState(userId, {
        phase: "PHASE_4_DONE",
        awaitingAction: null,
        documentContext: null
      });

      await message.reply(
        "✅ Dokument gespeichert\n\n" +
          `📂 Ablage: ${storageResult.storagePath}\n` +
          `📄 Name: ${storageResult.fileName}\n\n` +
          "⬇️ Du kannst jetzt direkt das nächste Dokument hochladen 😊"
      );
      return;
    }

    const map = {
      FINANCE_SELECT_STEUER: "steuer",
      FINANCE_SELECT_HAUSHALT: "haushalt",
      FINANCE_SELECT_VERSICHERUNG: "versicherung",
      FINANCE_SELECT_EINKOMMEN: "einkommen",
      FINANCE_SELECT_WOHNEN: "wohnen"
    };

    const nextCategory = map[action.id];
    if (!nextCategory) {
      await message.reply("❌ Auswahl nicht unterstützt.");
      return;
    }

    state.documentContext.category = nextCategory;

    const moduleReaction = financeModule({
      state: state.documentContext.state,
      category: nextCategory,
      fromFinanceSelection: true
    });

    const menu = renderMenu({
      text: moduleReaction.text,
      actions: moduleReaction.actions
    });

    setState(userId, {
      phase: "PHASE_3",
      awaitingAction: { actions: moduleReaction.actions },
      documentContext: state.documentContext
    });

    await message.reply(menu.text);
    return;
  }

  // ------------------------------------------------------------
  // DOKUMENT HOCHGELADEN
  // ------------------------------------------------------------
  if (hasAttachment) {
    if (!state.onboarded) setState(userId, { onboarded: true });

    await message.reply("📄 Dokument erhalten. Ich schaue es mir an …");

    const attachment = message.attachments.first();
    const buffer = Buffer.from(
      await fetch(attachment.url).then((res) => res.arrayBuffer())
    );

    const analysis = await analyzeDocument({
      userId,
      fileBuffer: buffer
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

    let moduleReaction = financeModule({
      state: analysis.score.state,
      category: analysis.category.category
    });

    if (analysis.module === "legal-module") {
      moduleReaction = legalModule({
        state: analysis.score.state,
        category: analysis.category.category
      });
    }

    if (analysis.module === "health-module") {
      moduleReaction = healthModule({
        state: analysis.score.state,
        category: analysis.category.category
      });
    }

    const menu = renderMenu({
      text: moduleReaction.text,
      actions: moduleReaction.actions
    });

    setState(userId, {
      phase: "PHASE_3",
      awaitingAction: { actions: moduleReaction.actions },
      documentContext
    });

    await message.reply(menu.text);
    return;
  }

  if (!state.onboarded) {
    const handled = await runOnboarding(message);
    if (handled) return;
  }

  const plan = resolvePlan(userId);
  setState(userId, { plan: plan.plan, phase: null });

  await message.reply("👉 Schick mir bitte ein Dokument (PDF / Bild).");
}

async function routeReaction() {}

module.exports = { routeDM, routeReaction };