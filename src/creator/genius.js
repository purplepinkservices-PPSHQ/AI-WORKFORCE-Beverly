// src/creator/genius.js

const OpenAI = require("openai");
const { uploadFileToDropbox } = require("../cloud/dropbox");

const clientAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Persönlichkeitsprofile der Models
const MODEL_PROFILES = {
    mia: "verspielt, süß, frech, neugierig, liebt Fantasie und Intimität",
    ruby: "ästhetisch, sinnlich, selbstbewusst, temperamentvoll, kunstvoller Vibe",
    ada: "leidenschaftlich, geheimnisvoll, elegant, verführerisch",
    mona: "dominant, verrückt, toy-heavy, interaktiv, provokant",
    alice: "fitness, body-awareness, motivierend, kein Erotikcontent"
};

// Creator States
const geniusStates = new Map();

// ------------------------------------------------------------
// START DES GENIUS MODE
// ------------------------------------------------------------
async function startGeniusMode(user) {
    geniusStates.set(user.id, { mode: "ask_model" });

    await user.send(
        "🧠 **Creator Genius Mode aktiviert!**\n\n" +
        "Sag mir zuerst, **für welches Model** du brainstormen möchtest:\n" +
        "• Mia\n• Ruby\n• Ada\n• Mona\n• Alice\n\n" +
        "Bitte einfach den Namen schreiben."
    );
}

// ------------------------------------------------------------
// HANDLE ALL GENIUS MODE MESSAGES
// ------------------------------------------------------------
async function handleCreatorGeniusMessage(message, client) {
    if (message.guild) return false;
    if (message.author.bot) return false;

    const uid = message.author.id;
    const content = message.content.trim().toLowerCase();

    // Starten durch Kommando
    if (!geniusStates.has(uid) && content.includes("genius")) {
        await startGeniusMode(message.author);
        return true;
    }

    // Wenn kein Flow aktiv -> raus
    if (!geniusStates.has(uid)) return false;

    const state = geniusStates.get(uid);

    // -------------------------------
    // 1) MODEL AUSWÄHLEN
    // -------------------------------
    if (state.mode === "ask_model") {
        const modelName = content.toLowerCase();

        if (!MODEL_PROFILES[modelName]) {
            await message.reply("⚠️ Bitte wähle Mia, Ruby, Ada, Mona oder Alice.");
            return true;
        }

        state.model = modelName;
        state.mode = "ask_context";

        await message.reply(
            `Perfekt 💙\n\nDu machst Brainstorming für **${capitalize(modelName)}**.\n\n` +
            "Bitte beschreibe mir kurz:\n" +
            "🔹 Was passiert im Video / Bild?\n" +
            "🔹 Welche Stimmung soll es haben?\n" +
            "🔹 Soft / Kinky / Dominant / Romantisch / Fun?\n\n" +
            "Schreib einfach frei drauf los. 😊"
        );

        return true;
    }

    // -------------------------------
    // 2) KONTEXT FÜR DIE IDEEN
    // -------------------------------
    if (state.mode === "ask_context") {
        state.context = content;
        state.mode = "generating";

        await message.reply("🧠✨ Einen Moment… ich erschaffe gerade deine Content-Ideen…");

        const result = await generateGeniusIdeas(state.model, state.context);

        await message.author.send(result);

        state.mode = "done";
        geniusStates.delete(uid);

        return true;
    }

    return false;
}

// ------------------------------------------------------------
// KI-Generator für Titel, Description, Keywords
// ------------------------------------------------------------
async function generateGeniusIdeas(model, context) {
    const profile = MODEL_PROFILES[model];

    const prompt = `
Du bist Beverly – ein Erotik-Content-Genius und Marketingexperte.

Erstelle für folgendes Szenario extrem starke Content-Vorschläge:
Model: ${model}
Persönlichkeit: ${profile}
Szenario / Inhalt: ${context}

Erstelle in strukturiertem Format:

1) TITEL (5 Varianten)
– maximal 50 Zeichen
– klickstark, sexy, hypnotisch

2) BESCHREIBUNG (2 Varianten)
– 2–3 Sätze
– klare Story
– Hook + Emotion + CTA

3) KEYWORDS / TAGS
– mindestens 15
– SEO-optimiert
– Mischung erotisch + Model-Personality

4) ANGLE IDEEN
– 3 kreative Perspektiven
– Storytelling, Fantasie oder Machtspiele

Gib alles in sauberem Textformat zurück – kein JSON.
`;

    const response = await clientAI.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.9,
        messages: [
            { role: "system", content: "Du bist Beverly – der erotische Content-Genius." },
            { role: "user", content: prompt }
        ]
    });

    return response.choices[0].message.content;
}

// ------------------------------------------------------------
// HELPER
// ------------------------------------------------------------
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = {
    handleCreatorGeniusMessage,
    startGeniusMode
};