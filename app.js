// Initial State
let player = {
    level: 1,
    currentXP: 0,
    xpToNextLevel: 100
};

// Default Tasks
let tasks = [
    { id: 1, text: "Drink a glass of water", xp: 10, completed: false },
    { id: 2, text: "15 minute walk", xp: 25, completed: false }
];

// Load data from LocalStorage if it exists
function loadData() {
    const savedPlayer = localStorage.getItem('questPlayer');
    const savedTasks = localStorage.getItem('questTasks');
    
    if (savedPlayer) player = JSON.parse(savedPlayer);
    if (savedTasks) tasks = JSON.parse(savedTasks);
    
    updateUI();
}

// Save data to LocalStorage
function saveData() {
    localStorage.setItem('questPlayer', JSON.stringify(player));
    localStorage.setItem('questTasks', JSON.stringify(tasks));
}

// Update the UI based on current state
function updateUI() {
    // Update Header
    document.getElementById('levelDisplay').innerText = `Level ${player.level}`;
    document.getElementById('xpText').innerText = `${player.currentXP} / ${player.xpToNextLevel} XP`;
    
    // Calculate and set progress bar width
    let progressPercentage = (player.currentXP / player.xpToNextLevel) * 100;
    document.getElementById('xpBar').style.width = `${progressPercentage}%`;

    // Render Tasks
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center ${task.completed ? 'completed-task' : ''}`;
        
        li.innerHTML = `
            <div>
                <p class="font-semibold text-gray-800">${task.text}</p>
                <p class="text-xs text-indigo-600 font-bold">+${task.xp} XP</p>
            </div>
            <button 
                onclick="toggleTask(${task.id})" 
                class="w-8 h-8 rounded-full border-2 flex items-center justify-center ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}"
            >
                ${task.completed ? '<span class="text-white text-sm">✓</span>' : ''}
            </button>
        `;
        taskList.appendChild(li);
    });
}

// Add a new task
function addTask() {
    const input = document.getElementById('newTaskInput');
    const select = document.getElementById('taskDifficulty');
    
    if (input.value.trim() === '') return; // Don't add empty tasks

    const newTask = {
        id: Date.now(), // Generate a unique ID
        text: input.value,
        xp: parseInt(select.value),
        completed: false
    };

    tasks.push(newTask);
    input.value = ''; // Clear input
    
    saveData();
    updateUI();
}

// Complete or un-complete a task
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    
    if (!task.completed) {
        task.completed = true;
        gainXP(task.xp);
    } else {
        // Optional: remove XP if unchecked
        task.completed = false;
        player.currentXP -= task.xp;
        if(player.currentXP < 0) player.currentXP = 0; // Prevent negative XP
    }
    
    saveData();
    updateUI();
}

// Handle gaining XP and Leveling Up
function gainXP(amount) {
    player.currentXP += amount;

    // Check for level up
    if (player.currentXP >= player.xpToNextLevel) {
        player.level++;
        player.currentXP = player.currentXP - player.xpToNextLevel; // Carry over remaining XP
        player.xpToNextLevel = Math.floor(player.xpToNextLevel * 1.5); // Make next level harder
        
        alert(`Congratulations! You reached Level ${player.level}! 🎉`);
    }
}

// Initialize app
loadData();