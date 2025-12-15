// src/core/task-queue.js

const queue = [];
let processing = false;

function addTask(taskFn) {
    queue.push(taskFn);
    processQueue();
}

async function processQueue() {
    if (processing) return;
    processing = true;

    while (queue.length > 0) {
        const task = queue.shift();
        try {
            await task();
        } catch (err) {
            console.error("[TASK ERROR]", err);
        }
    }

    processing = false;
}

module.exports = { addTask };