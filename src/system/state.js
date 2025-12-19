"use strict";

const userState = new Map();

function getState(userId) {
  return userState.get(userId) || { onboarded: false };
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