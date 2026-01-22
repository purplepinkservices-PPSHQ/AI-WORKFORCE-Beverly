"use strict";

// ============================================================
// Datei: src/engines/chat-router-engine.js
// Zweck: Lern- & Rückfrage-Router (unterbricht Flow, kehrt zurück)
// ============================================================

const { getState, setState } = require("../system/state");

const { lookupEntityByCreditor } = require("./entity-lookup-engine");

const {
  upsertEntityFromUserAnswer,
  touchEntityLastUsed
} = require("../integrations/notion/notion-entities");

const {
  updateCoreDocumentProperties
} = require("../integrations/notion/notion-core-documents-update");

const SCORE_THRESHOLD = 70;

// ------------------------------------------------------------
// Router-Stages
// ------------------------------------------------------------
const ROUTER_STAGE = {
  ASK_ENTITY_TYPE: "ASK_ENTITY_TYPE",
  ASK_OTHER_CONTEXT: "ASK_OTHER_CONTEXT",
  ASK_ROLE_USAGE: "ASK_ROLE_USAGE",
  ASK_DATE: "ASK_DATE"
};

// ------------------------------------------------------------
// Menüs
// ------------------------------------------------------------
const MENU_ENTITY = [
  "1️⃣ Supermarkt / Händler",
  "2️⃣ Firma",
  "3️⃣ Behörde",
  "4️⃣ Versicherung",
  "5️⃣ Arzt / Gesundheit",
  "6️⃣ etwas anderes"
].join("\n");

const MENU_ROLE = [
  "1️⃣ eine Ausgabe (privat)",
  "2️⃣ eine Einnahme",
  "3️⃣ etwas Steuerliches",
  "4️⃣ etwas Rechtliches",
  "5️⃣ Gesundheit",
  "6️⃣ etwas anderes"
].join("\n");

// ------------------------------------------------------------
function onlyDigit(text) {
  return String(text || "").replace(/[^\d]/g, "");
}

function mapEntityChoice(choice) {
  return {
    "1": "Händler",
    "2": "Firma",
    "3": "Behörde",
    "4": "Versicherung",
    "5": "Arzt/Gesundheit",
    "6": "Sonstiges"
  }[choice] || null;
}

function mapRoleChoice(choice) {
  return {
    "1": ["Ausgabe"],
    "2": ["Einkommen"],
    "3": ["Steuer"],
    "4": ["Rechtlich"],
    "5": ["Gesundheit"],
    "6": []
  }[choice] ?? null;
}

// ------------------------------------------------------------
function askEntityText(name) {
  return [
    "Kurze Frage 😊",
    `Ich kenne diesen Absender noch nicht: **${name || "Unbekannt"}**`,
    "Was ist das eher?",
    MENU_ENTITY
  ].join("\n");
}

function askRoleText() {
  return [
    "Damit ich das richtig einsortiere:",
    "Geht es hier eher um",
    MENU_ROLE
  ].join("\n");
}

function askDateText() {
  return [
    "Ich konnte auf dem Beleg kein sicheres Datum erkennen 👀",
    "Magst du mir kurz das Datum schreiben?"
  ].join("\n");
}

// ============================================================
// START ROUTER
// ============================================================
async function startRouterIfNeeded({ userId, analysis }) {
  const creditorName = analysis?.facts?.creditor?.name || "Unbekannt";
  const entity = await lookupEntityByCreditor({ creditorName });

  // 🔧 FIX: Datum bereits im Core vorhanden?
  const hasDocumentDate = Boolean(analysis?.facts?.dates?.documentDate);

  let stage = ROUTER_STAGE.ASK_ENTITY_TYPE;
  if (entity?.confidence === "Hoch") {
    stage = ROUTER_STAGE.ASK_ROLE_USAGE;
  }

  const routerState = {
    stage,
    creditorName,
    coreDocId: analysis?.coreDocumentId || null,
    finalScore: analysis?.score?.score || 0,
    entityType: entity?.entityType || null,
    hasDocumentDate
  };

  setState(userId, { chatRouter: routerState });

  return {
    started: true,
    state: routerState,
    replyText:
      stage === ROUTER_STAGE.ASK_ROLE_USAGE
        ? askRoleText()
        : askEntityText(creditorName)
  };
}

// ============================================================
// HANDLE ROUTER ANSWERS
// ============================================================
async function handleRouterReply({ userId, messageText }) {
  const state = getState(userId);
  const ctx = state.chatRouter;

  if (!ctx || !ctx.stage) {
    return { handled: false };
  }

  const text = String(messageText || "").trim();

  // ----------------------------------------------------------
  if (ctx.stage === ROUTER_STAGE.ASK_ENTITY_TYPE) {
    const choice = onlyDigit(text);
    const mapped = mapEntityChoice(choice);

    if (!mapped) {
      return { handled: true, replyText: MENU_ENTITY };
    }

    ctx.entityType = mapped;

    await upsertEntityFromUserAnswer({
      name: ctx.creditorName,
      entityType: mapped,
      confidence: "Hoch",
      source: "Nutzer bestätigt"
    });

    ctx.stage = ROUTER_STAGE.ASK_ROLE_USAGE;
    setState(userId, { chatRouter: ctx });

    return { handled: true, replyText: askRoleText() };
  }

  // ----------------------------------------------------------
  if (ctx.stage === ROUTER_STAGE.ASK_ROLE_USAGE) {
    const choice = onlyDigit(text);
    const roles = mapRoleChoice(choice);

    if (roles === null) {
      return { handled: true, replyText: MENU_ROLE };
    }

    await upsertEntityFromUserAnswer({
      name: ctx.creditorName,
      entityType: ctx.entityType,
      rolesDefault: roles,
      confidence: "Hoch",
      source: "Nutzer bestätigt"
    });

    if (ctx.coreDocId && ctx.finalScore >= SCORE_THRESHOLD) {
      await updateCoreDocumentProperties({
        pageId: ctx.coreDocId,
        properties: {
          Kategorie: { multi_select: roles.map(r => ({ name: r })) }
        }
      });
    }

    // 🔧 FIX: Nur nach Datum fragen, wenn Core KEINS hat
    if (!ctx.hasDocumentDate) {
      ctx.stage = ROUTER_STAGE.ASK_DATE;
      setState(userId, { chatRouter: ctx });
      return { handled: true, replyText: askDateText() };
    }

    // ✅ Datum ist vorhanden → Router direkt beenden
    await touchEntityLastUsed({ name: ctx.creditorName });
    setState(userId, { chatRouter: null });

    return {
      handled: true,
      resumeFlow: true,
      replyText: "✅ Danke 😊 Ich speichere das Dokument jetzt für dich."
    };
  }

  // ----------------------------------------------------------
  if (ctx.stage === ROUTER_STAGE.ASK_DATE) {
    await touchEntityLastUsed({ name: ctx.creditorName });

    setState(userId, { chatRouter: null });

    return {
      handled: true,
      resumeFlow: true,
      replyText: "✅ Danke 😊 Ich speichere das Dokument jetzt für dich."
    };
  }

  return { handled: false };
}

module.exports = {
  startChatRouterIfNeeded: startRouterIfNeeded,
  handleChatRouterReply: handleRouterReply
};
