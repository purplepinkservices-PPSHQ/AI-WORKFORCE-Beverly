const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// ------------------------------------------------------------
// PROMPT LADEN
// ------------------------------------------------------------
function loadPrompt() {
    const promptPath = path.join(__dirname, "local", "Prompts", "document.prompt.txt");
    return fs.readFileSync(promptPath, "utf8");
}

// ------------------------------------------------------------
// KI-DOKUMENTANALYSE
// ------------------------------------------------------------
async function analyzeDocument(text) {
    try {
        const systemPrompt = loadPrompt();

        // Texte hart bereinigen
        const cleanText = text
            .replace(/\s+/g, " ")
            .replace(/[^\x20-\x7EäöüÄÖÜß]/g, " ") // komische Zeichen raus
            .trim();

        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: cleanText }
            ]
        });

        let content = response.choices[0].message.content || "";

        // Markdown-Blöcke entfernen
        content = content.replace(/```json/gi, "").replace(/```/g, "").trim();

        // JSON extrahieren
        const start = content.indexOf("{");
        const end = content.lastIndexOf("}");

        if (start === -1 || end === -1) {
            console.error("[AI ERROR] Kein JSON gefunden.");
            return null;
        }

        const jsonString = content.substring(start, end + 1);

        return JSON.parse(jsonString);

    } catch (err) {
        console.error("[AI ERROR]", err);
        return null;
    }
}

module.exports = { analyzeDocument };