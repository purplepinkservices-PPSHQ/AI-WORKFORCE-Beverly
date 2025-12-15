// ============================================================
// TASK QUEUE – Sprint 2
// Ultra-stabile Hintergrundverarbeitung für Beverly
// ============================================================

const taskQueue = [];
let isRunning = false;

/**
 * Fügt einen neuen Task zur Queue hinzu.
 * taskFn = async () => { ... }
 */
function addTask(taskFn) {
    taskQueue.push(taskFn);
    runQueue();
}

/**
 * Führt die Queue aus – immer EIN Task gleichzeitig
 */
async function runQueue() {
    if (isRunning) return;      // bereits in Arbeit
    if (taskQueue.length === 0) return;

    isRunning = true;

    while (taskQueue.length > 0) {
        const nextTask = taskQueue.shift();

        try {
            await nextTask();
        } catch (err) {
            console.error("❌ Hintergrund-Task Fehler:", err);
        }
    }

    isRunning = false;
}

module.exports = {
    addTask
};