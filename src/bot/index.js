// src/bot/index.js
// Einstiegspunkt für den Larry Assistant Bot

// 🔹 Basis-Imports
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const { Client, GatewayIntentBits, Partials } = require("discord.js");
const express = require("express");
const { extractTextFromImage } = require("../ocr/ocr-engine");

// 🔹 Ein paar Basis-Konstanten
const BOT_TOKEN = process.env.BOT_TOKEN;
const PORT = process.env.PORT || 3000;

// Basic Safety Check
if (!BOT_TOKEN) {
  console.error("[FATAL] BOT_TOKEN fehlt in der .env Datei!");
  process.exit(1);
}

// 🔹 Discord Client erstellen
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

// 🔹 Express Server (Basis für spätere AI/OCR-Endpoints)
const app = express();
app.use(express.json());

// Simple Healthcheck-Route
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Larry Assistant Backend läuft ✅" });
});

// Server starten
app.listen(PORT, () => {
  console.log(`[HTTP] Express Server läuft auf Port ${PORT}`);
});

// 🔹 Discord Ready Event
client.once("ready", () => {
  console.log(`🤖 Larry Assistant Bot eingeloggt als: ${client.user.tag}`);
  console.log("✅ Bot ist bereit und wartet in deinem Discord-Server.");
});

// 🔹 Message Listener (für ersten Test)
client.on("messageCreate", async (message) => {
  // Eigene Nachrichten & andere Bots ignorieren
  if (message.author.bot) return;

  // Nur auf deinen speziellen Testkanal reagieren (optional)
  // Du kannst hier später die Channel-ID eintragen.
  // if (message.channel.name !== "👸🏻-larry-assistenz") return;

  // 1) Ping-Test
  if (message.content.toLowerCase() === "!ping") {
    await message.reply("🏓 Pong – ich bin wach und auf deinem PC am Start!");
    return;
  }

  // 2) Einfacher Setup-Trigger (Platzhalter für echtes /setup später)
  if (message.content.toLowerCase() === "!setup") {
    await message.reply(
      "🧩 Setup gestartet – in der finalen Version werde ich hier dein Master-Profil abfragen. Aktuell bin ich nur ein Skeleton 🤍"
    );
    return;
  }
});

// 🔹 Bot einloggen
client.login(BOT_TOKEN).catch((err) => {
  console.error("[FATAL] Konnte nicht bei Discord einloggen:", err);
  process.exit(1);
});
