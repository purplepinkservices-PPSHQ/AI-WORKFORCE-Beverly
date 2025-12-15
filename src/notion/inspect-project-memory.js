const { getNotion } = require("./client");

async function inspectProjectMemory(databaseId) {
    const notion = getNotion();

    const db = await notion.databases.retrieve({
        database_id: databaseId,
    });

    console.log("🧠 PROJECT MEMORY – PROPERTY MAP");
    console.log("------------------------------------------------");

    for (const [key, value] of Object.entries(db.properties)) {
        console.log(`"${key}" → Typ: ${value.type}`);
    }

    console.log("------------------------------------------------");
}

module.exports = { inspectProjectMemory };
