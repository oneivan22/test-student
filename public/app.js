const runButton = document.querySelector('#run');
const modeSelect = document.querySelector('#mode');
const countInput = document.querySelector('#count');
const avgInput = document.querySelector('#avg');
const spreadInput = document.querySelector('#spread');
const concurrencyInput = document.querySelector('#concurrency');
const outputDiv = document.querySelector('#output');


function buildTasks(count, avgDuration, spread) {
    const tasks = [];
    for (let i = 0; i < count; i++) {
       
        const variation = (Math.random() - 0.5) * 2 * spread;
        const durationMs = Math.max(100, Math.round(avgDuration + variation));
        
        tasks.push({
            id: `task-${i + 1}`,
            durationMs: durationMs
        });
    }
    return tasks;
}

function formatTime(ms) {
    return `${ms} мс`;
}


function createResultElement(label, value) {
    const div = document.createElement('div');
    div.className = 'result-item';
    
    const labelSpan = document.createElement('span');
    labelSpan.className = 'label';
    labelSpan.textContent = label;
    
    const valueSpan = document.createElement('span');
    valueSpan.className = 'value';
    valueSpan.textContent = value;
    
    div.appendChild(labelSpan);
    div.appendChild(valueSpan);
    
    return div;
}

function displayResults(response) {
    outputDiv.innerHTML = '';
    
    const modeElement = createResultElement('Режим:', response.mode);
    const totalTimeElement = createResultElement('Общее время:', formatTime(response.elapsed));
    
    outputDiv.appendChild(modeElement);
    outputDiv.appendChild(totalTimeElement);
    
    const tasksHeader = document.createElement('h3');
    tasksHeader.textContent = 'Результаты задач:';
    tasksHeader.style.marginTop = '20px';
    outputDiv.appendChild(tasksHeader);
    
    response.results.forEach(task => {
        const taskElement = createResultElement(
            `Задача ${task.id}:`, 
            formatTime(task.elapsed)
        );
        outputDiv.appendChild(taskElement);
    });
    
 
    const analysisHeader = document.createElement('h3');
    analysisHeader.textContent = 'Анализ:';
    analysisHeader.style.marginTop = '20px';
    outputDiv.appendChild(analysisHeader);
    
    const maxTaskTime = Math.max(...response.results.map(t => t.elapsed));
    const efficiency = response.elapsed > 0 ? (maxTaskTime / response.elapsed * 100).toFixed(1) : 0;
    
    const efficiencyElement = createResultElement('Эффективность:', `${efficiency}%`);
    outputDiv.appendChild(efficiencyElement);
}


function setLoading(isLoading) {
    if (isLoading) {
        runButton.disabled = true;
        runButton.textContent = 'Выполнение...';
        outputDiv.textContent = 'Выполняются задачи...';
    } else {
        runButton.disabled = false;
        runButton.textContent = 'Запустить тест';
    }
}


runButton.addEventListener('click', async () => {
    try {
    
        setLoading(true);
        
 
        const mode = modeSelect.value;
        const count = parseInt(countInput.value);
        const avg = parseInt(avgInput.value);
        const spread = parseInt(spreadInput.value);
        const concurrency = parseInt(concurrencyInput.value);
        
        if (isNaN(count) || isNaN(avg) || isNaN(spread) || isNaN(concurrency)) {
            throw new Error('Все поля должны содержать числа');
        }
        
        if (count <= 0 || avg <= 0 || spread < 0 || concurrency <= 0) {
            throw new Error('Все значения должны быть положительными числами');
        }
        
        if (count > 20) {
            throw new Error('Количество задач не должно превышать 20');
        }
        
     
        const tasks = buildTasks(count, avg, spread);
        
        console.log('Отправляемые задачи:', tasks);
        

        const response = await fetch('/api/run', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mode: mode,
                tasks: tasks,
                concurrency: concurrency
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ошибка сервера: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Получен ответ:', result);
        
   
        displayResults(result);
        
    } catch (error) {
        console.error('Ошибка:', error);
        outputDiv.textContent = `Ошибка: ${error.message}`;
    } finally {
     
        setLoading(false);
    }
});


const inputFields = [countInput, avgInput, spreadInput, concurrencyInput];
inputFields.forEach(input => {
    input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            runButton.click();
        }
    });
});


function initializeDefaults() {
    if (!countInput.value) countInput.value = '5';
    if (!avgInput.value) avgInput.value = '1000';
    if (!spreadInput.value) spreadInput.value = '500';
    if (!concurrencyInput.value) concurrencyInput.value = '2';
}


initializeDefaults();

console.log('Приложение инициализировано');