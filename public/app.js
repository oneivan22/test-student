const runButton = document.querySelector('#run');
const modeSelect = document.querySelector('#mode');
const countInput = document.querySelector('#count');
const avgInput = document.querySelector('#avg');
const spreadInput = document.querySelector('#spread');
const concurrencyInput = document.querySelector('#concurrency');
const outputDiv = document.querySelector('#output');

function buildTasks(count, avg, spread) {
    const tasks = [];
    for (let i = 0; i < count; i++) {
        const randomTime = avg - spread + Math.floor(Math.random() * (spread * 2));
        const duration = Math.max(50, randomTime); 
        tasks.push({
            id: `task-${i + 1}`,
            durationMs: duration
        });
    }
    return tasks;
}

runButton.addEventListener('click', async () => {
    try {    
        outputDiv.textContent = "Запускаю задачи...";
        
        const mode = modeSelect.value;
        const count = parseInt(countInput.value);
        const avg = parseInt(avgInput.value);
        const spread = parseInt(spreadInput.value);
        const concurrency = parseInt(concurrencyInput.value);
        
        const tasks = buildTasks(count, avg, spread);
        
        const response = await fetch('/api/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mode: mode,
                tasks: tasks,
                concurrency: concurrency
            })
        });
        
        const result = await response.json();
        
        let outputText = `Режим: ${result.mode}\n`;
        outputText += `Общее время: ${result.elapsed} мс\n\n`;
        
        if (result.results) {
            outputText += "Результаты задач:\n";
            result.results.forEach(task => {
                outputText += `${task.id}: ${task.elapsed} мс\n`;
            });
        }
        
        if (result.first) {
            outputText += `\nПервая завершенная: ${result.first.id} (${result.first.elapsed} мс)`;
        }
        
        outputDiv.textContent = outputText;
        
    } catch (error) {
        outputDiv.textContent = "Ошибка: " + error.message;
    }
});
