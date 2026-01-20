require("dotenv").config();

const notion = require("../src/integrations/notion");

(async () => {
  try {
    console.log("🔍 Starte Notion Smoke Test...");

    if (!process.env.NOTION_TOKEN) {
      throw new Error("NOTION_TOKEN nicht geladen – .env wird nicht gelesen");
    }

    const month = await notion.findOrCreateLedgerMonth("2026-01");
    console.log("✅ Ledger Month OK:", month.id);

    const doc = await notion.createDocument({
      name: "Smoke Test Alpen High",
      date: "2026-01-19",
      amount: 44.62,
      category: "Haushalt",
      creditor: "Alpen High GmbH",
      documentType: "Kassenzettel"
    });
    console.log("✅ Document OK:", doc.id);

    const entry = await notion.createLedgerEntry({
      date: "2026-01-19",
      amount: 44.62,
      type: "Ausgabe",
      category: "Haushalt",
      creditor: "Alpen High GmbH",
      documentId: doc.id,
      ledgerMonthId: month.id
    });
    console.log("✅ Ledger Entry OK:", entry.id);

    console.log("🎉 Smoke-Test ERFOLGREICH!");
  } catch (err) {
    console.error("❌ Smoke-Test FEHLER:");
    console.error(err.message || err);
  }
})();