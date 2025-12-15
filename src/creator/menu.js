// src/creator/menu.js

const fetch = require("node-fetch");
const { uploadFileToDropbox } = require("../cloud/dropbox");
const state = require("../core/state");

const CREATOR_ROOT = "/Models";

// Keine eigene Map mehr!
// menu.js nutzt jetzt globalen state.

async function showCreatorMainMenu(user) {
    state.setUserState(user.id, "menu");

    await user.send(
        "💙 **Creator-Menü ist offen!**\n\n" +
        "Sag mir, was du brauchst:\n\n" +
        "1️⃣ Content hochladen\n" +
        "2️⃣ Verträge / ID-Dokumente\n" +
        "3️⃣ Belege & Rechnungen\n" +
        "4️⃣ Creator Genius Mode (bald 😏)\n" +
        "5️⃣ Ziele & Coaching (bald)\n\n" +
        "_Antwort einfach: **1**, **2** oder **3**._"
    );
}

async function handleCreatorMenuMessage(message) {
    if (message.guild) return false;

    const uid = message.author.id;
    const content = message.content.trim().toLowerCase();
    const mode = state.getUserState(uid);

    // Sollte das Menü geöffnet werden?
    if (["menu", "menü", "creator"].includes(content)) {
        return showCreatorMainMenu(message.author);
    }

    if (mode !== "menu") return false;

    // --- Auswahl ---
    if (content === "1") {
        state.setUserState(uid, "upload_content");
        return message.reply(
            "🎬 Alles klar 😏\n" +
            "Schick mir einfach die Datei (Video/Bild/Thumbnail) – ich nehme’s in Empfang 💙"
        );
    }

    if (content === "2") {
        state.setUserState(uid, "upload_contracts");
        return message.reply(
            "📄 Perfekt.\n" +
            "Sende mir jetzt dein **Vertrags- oder ID-Dokument**. Ich kümmere mich 😌"
        );
    }

    if (content === "3") {
        state.setUserState(uid, "upload_receipts");
        return message.reply(
            "🧾 Alles klar!\n" +
            "Schick mir den **Beleg / Rechnung**. Ich sortiere das für dich ein 💙"
        );
    }

    return message.reply(
        "Hm? 😏 Ich brauche **1**, **2** oder **3**.\n" +
        "Oder du schreibst **menu**, wenn du neu starten willst."
    );
}

module.exports = {
    handleCreatorMenuMessage,
    showCreatorMainMenu
};