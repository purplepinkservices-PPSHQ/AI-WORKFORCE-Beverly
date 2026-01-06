"use strict";

const userState = new Map();

function getState(userId) {
  return (
    userState.get(userId) || {
      onboarded: false,
      phase: null,
      session: null,
      documentContext: null
    }
  );
}

function setState(userId, data) {
  const current = getState(userId);
  userState.set(userId, { ...current, ...data });
}

function clearState(userId) {
  userState.delete(userId);
}

module.exports = {
  getState,
  setState,
  clearState
};