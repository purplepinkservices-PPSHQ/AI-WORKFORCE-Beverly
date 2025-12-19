"use strict";

let discordClient = null;

function registerClient(client) {
  discordClient = client;
}

async function sendMessage(userId, text) {
  if (!discordClient) {
    console.error("❌ Messenger: Discord Client nicht registriert");
    return false;
  }

  try {
    const user = await discordClient.users.fetch(userId);
    if (!user) return false;
    await user.send(text);
    return true;
  } catch (err) {
    console.error("❌ Messenger sendMessage ERROR:", err);
    return false;
  }
}

module.exports = {
  registerClient,
  sendMessage
};