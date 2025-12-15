// src/creator/content-upload.js

const fetch = require("node-fetch");
const { uploadFileToDropbox } = require("../cloud/dropbox");
const state = require("../core/state");

const CREATOR_ROOT = "/Models";

// temporary buffer for each user
const temp = new Map();

function sanitizeName(name) {
    return name.replace(/[^\wäöüÄÖÜß]/gi, "_").substring(0, 40);
}

function guessFileNameFromUrl(url) {
    try {
        const u = new URL(url);
        const last = u.pathname.split("/").pop();
        return last.split("?")[0] || "upload";
    } catch {
        return "upload";
    }
}

function isVideo(contentType, fileName) {
    if (contentType?.startsWith("video/")) return true;
    const lower = fileName.toLowerCase();
    return [".mp4", ".mov", ".webm", ".mkv", ".avi"].some(ext => lower.endsWith(ext));
}

function decideContentPath(modelName, text, isVid) {
    const base = `${CREATOR_ROOT}/${sanitizeName(modelName)}/Content`;
    text = (text || "").toLowerCase();

    if (text.includes("tiktok")) return `${base}/Social-Media/TikTok`;
    if (text.includes("twitter") || text.includes("x.com")) return `${base}/Social-Media/Twitter`;
    if (text.includes("insta")) return `${base}/Social-Media/Instagram`;

    if (isVid) {
        if (text.includes("pov")) return `${base}/Videos/POV`;
        if (text.includes("teaser")) return `${base}/Videos/Teaser`;
        return `${base}/Videos`;
    }

    return `${base}/Fotos`;
}

async function handleCreatorContentUpload(message) {
    if (message.guild) return false;

    const uid = message.author.id;
    const mode = state.getUserState(uid);

    // STEP 1 — Beschreibung nach Datei
    if (temp.has(uid) && mode.startsWith("upload_") && !message.attachments.size) {
        const desc = message.content.trim();
        const entry = temp.get(uid);

        const isVid = isVideo(entry.fileType, entry.fileName);
        const folder = decideContentPath(message.author.username, desc, isVid);

        const saved = await uploadFileToDropbox(folder, entry.fileName, entry.buffer);

        temp.delete(uid);
        state.clearUserState(uid);

        return message.reply(
            `✨ Nice, hab’s einsortiert 😏\n` +
            `\`${saved}\`\n` +
            `Wenn du mehr hast – einfach weiter schicken 💙`
        );
    }

    // STEP 2 — Neue Datei beginnt Upload-Flow
    if (message.attachments.size > 0) {
        const att = message.attachments.first();
        const buffer = await fetch(att.url).then(r => r.buffer());
        const fileName = guessFileNameFromUrl(att.url);

        temp.set(uid, {
            buffer,
            fileName,
            fileType: att.contentType
        });

        return message.reply(
            "Gotcha 😏💙 Datei ist da.\n" +
            "Sag mir in 1–2 Sätzen, was das gute Stück ist – dann sortiere ich’s perfekt ein ✨"
        );
    }

    return false;
}

module.exports = { handleCreatorContentUpload };