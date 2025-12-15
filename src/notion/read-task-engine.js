const { getNotion } = require("./client");

async function testRead(databaseId) {
    const notion = getNotion();

    const response = await notion.databases.query({
        database_id: databaseId,
        page_size: 1,
    });

    console.log("📊 Task Engine Treffer:", response.results.length);
}

module.exports = { testRead };
