// src/core/state.js

/**
 * Globaler State für alle Creator-Flows.
 * Keine einzelnen Maps mehr in Modulen!
 */

const userFlowState = new Map();
const userHints = new Map(); // optionale „Letzte Info“-Hilfen

function setUserState(userId, mode) {
    userFlowState.set(userId, { mode, updated: Date.now() });
}

function getUserState(userId) {
    return userFlowState.get(userId)?.mode || "idle";
}

function clearUserState(userId) {
    userFlowState.delete(userId);
    userHints.delete(userId);
}

function setHint(userId, hint) {
    userHints.set(userId, hint);
}

function getHint(userId) {
    return userHints.get(userId) || null;
}

module.exports = {
    setUserState,
    getUserState,
    clearUserState,
    setHint,
    getHint
};