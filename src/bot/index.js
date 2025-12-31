// ============================================================
// Datei: src/bot/index.js
// (unverändert – vollständig)
// ============================================================
"use strict";

require("dotenv").config();

const { Client, GatewayIntentBits, Partials } = require("discord.js");
const { routeDM, routeReaction } = require("../system/router");
const { registerClient } = require("../utils/messenger");

// ------------------------------------------------------------
// DISCORD CLIENT
// ------------------------------------------------------------

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction]
});

// ------------------------------------------------------------
// READY
// ------------------------------------------------------------

client.once("ready", () => {
  console.log("🚀 Bot gestartet (PRIVATE MODE)");
  console.log(`🤖 Beverly ONLINE als ${client.user.tag}`);

  registerClient(client);
});

// ------------------------------------------------------------
// MESSAGE HANDLER (DM ONLY)
// ------------------------------------------------------------

client.on("messageCreate", async (message) => {
  try {
    await routeDM(message);
  } catch (err) {
    console.error("❌ MESSAGE HANDLER ERROR:", err);
    try {
      if (!message.author?.bot) {
        await message.reply("⚠️ Kurz hakt es intern.\nBitte schick das Dokument nochmal.");
      }
    } catch (_) {}
  }
});

// ------------------------------------------------------------
// REACTION HANDLER
// ------------------------------------------------------------

client.on("messageReactionAdd", async (reaction, user) => {
  try {
    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch {
        return;
      }
    }
    await routeReaction(reaction, user);
  } catch (err) {
    console.error("❌ REACTION HANDLER ERROR:", err);
  }
});

// ------------------------------------------------------------
// LOGIN
// ------------------------------------------------------------

if (!process.env.DISCORD_TOKEN) {
  console.error("❌ FEHLER: DISCORD_TOKEN fehlt in .env");
  process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);