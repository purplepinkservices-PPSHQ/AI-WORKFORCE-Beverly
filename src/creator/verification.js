// src/creator/verification.js

const fetch = require("node-fetch");
const { uploadFileToDropbox } = require("../cloud/dropbox");
const state = require("../core/state");

async function handleVerificationMessage(message) {
    if (message.guild) return false;

    const uid = message.author.id;
    const content = message.content.trim().toLowerCase();
    const mode = state.getUserState(uid);

    // Start
    if (content.includes("start") || content.includes("verify")) {
        state.setUserState(uid, "verification");
        return message.reply(
            "💙 Alles klar — ich leite deine Verifizierung ein.\n" +
            "Schick mir bitte zuerst deinen **ID-Shot** 📸"
        );
    }

    // Only process if in verification mode
    if (mode !== "verification") return false;

    // Attachment / ID-Shot
    if (message.attachments.size > 0) {
        const att = message.attachments.first();
        const buffer = await fetch(att.url).then(r => r.buffer());

        const folder = `/Models/${message.author.username}/Verifizierung`;
        const filename = `${Date.now()}_${att.name}`;

        await uploadFileToDropbox(folder, filename, buffer);

        return message.reply(
            "✨ Perfekt, hab’s gespeichert.\n" +
            "Schick mir gern die nächste Datei — oder schreib **fertig**, wenn wir alles haben 💙"
        );
    }

    if (content === "fertig") {
        state.clearUserState(uid);

        await message.reply(
            "🎉 Alles geprüft!\n" +
            "Du bist jetzt offiziell Creator 💙\n" +
            "Schreib **menu**, um loszulegen."
        );

        return true;
    }

    return false;
}

module.exports = { handleVerificationMessage };