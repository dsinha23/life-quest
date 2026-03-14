// Import modern Firebase tools directly from the web
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, updateDoc, doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Import modern Firebase tools directly from the web
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, updateDoc, doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ⚠️ PASTE YOUR CONFIG OBJECT HERE ⚠️
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "123456789",
  appId: "YOUR_APP_ID"
};

// Initialize the App and Database
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Database References
const playerRef = doc(db, 'shared', 'playerStats'); // A single document for shared couple XP
const tasksRef = collection(db, 'tasks'); // A list of all tasks

let player = { level: 1, currentXP: 0, xpToNextLevel: 100 };
let tasks = [];

// 📡 REAL-TIME LISTENER: Player Stats
onSnapshot(playerRef, (snapshot) => {
    if (snapshot.exists()) {
        player = snapshot.data();
    } else {
        setDoc(playerRef, player); // Create it if it doesn't exist yet
    }
    updateHeaderUI();
});

// 📡 REAL-TIME LISTENER: Tasks
onSnapshot(tasksRef, (snapshot) => {
    tasks = [];
    snapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
    });
    // Sort tasks so completed ones drop to the bottom
    tasks.sort((a, b) => a.completed - b.completed); 
    updateTasksUI();
});

// Update the Top Bar
function updateHeaderUI() {
    document.getElementById('levelDisplay').innerText = `Level ${player.level}`;
    document.getElementById('xpText').innerText = `${player.currentXP} / ${player.xpToNextLevel} XP`;
    let progressPercentage = (player.currentXP / player.xpToNextLevel) * 100;
    document.getElementById('xpBar').style.width = `${progressPercentage}%`;
}

// Update the Task List
function updateTasksUI() {
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
                onclick="toggleTask('${task.id}', ${task.completed}, ${task.xp})" 
                class="w-8 h-8 rounded-full border-2 flex items-center justify-center ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}"
            >
                ${task.completed ? '<span class="text-white text-sm">✓</span>' : ''}
            </button>
        `;
        taskList.appendChild(li);
    });
}

// Add a new task to the database
window.addTask = async function() {
    const input = document.getElementById('newTaskInput');
    const select = document.getElementById('taskDifficulty');
    
    if (input.value.trim() === '') return;

    await addDoc(tasksRef, {
        text: input.value,
        xp: parseInt(select.value),
        completed: false,
        createdAt: new Date()
    });

    input.value = ''; 
};

// Toggle a task and handle XP logic
window.toggleTask = async function(taskId, isCompleted, taskXp) {
    const taskDoc = doc(db, 'tasks', taskId);
    
    // Check or uncheck in database
    await updateDoc(taskDoc, { completed: !isCompleted });

    // Calculate new XP
    let newXP = player.currentXP + (!isCompleted ? taskXp : -taskXp);
    let newLevel = player.level;
    let newXPNext = player.xpToNextLevel;

    if (newXP < 0) newXP = 0; // No negative XP

    // Level up logic
    if (newXP >= newXPNext) {
        newLevel++;
        newXP = newXP - newXPNext;
        newXPNext = Math.floor(newXPNext * 1.5);
        alert(`Congratulations! You reached Level ${newLevel}! 🎉`);
    }

    // Save new stats to database
    await setDoc(playerRef, {
        level: newLevel,
        currentXP: newXP,
        xpToNextLevel: newXPNext
    });
};

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "123456789",
  appId: "YOUR_APP_ID"
};

// Initialize the App and Database
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Database References
const playerRef = doc(db, 'shared', 'playerStats'); // A single document for shared couple XP
const tasksRef = collection(db, 'tasks'); // A list of all tasks

let player = { level: 1, currentXP: 0, xpToNextLevel: 100 };
let tasks = [];

// 📡 REAL-TIME LISTENER: Player Stats
onSnapshot(playerRef, (snapshot) => {
    if (snapshot.exists()) {
        player = snapshot.data();
    } else {
        setDoc(playerRef, player); // Create it if it doesn't exist yet
    }
    updateHeaderUI();
});

// 📡 REAL-TIME LISTENER: Tasks
onSnapshot(tasksRef, (snapshot) => {
    tasks = [];
    snapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
    });
    // Sort tasks so completed ones drop to the bottom
    tasks.sort((a, b) => a.completed - b.completed); 
    updateTasksUI();
});

// Update the Top Bar
function updateHeaderUI() {
    document.getElementById('levelDisplay').innerText = `Level ${player.level}`;
    document.getElementById('xpText').innerText = `${player.currentXP} / ${player.xpToNextLevel} XP`;
    let progressPercentage = (player.currentXP / player.xpToNextLevel) * 100;
    document.getElementById('xpBar').style.width = `${progressPercentage}%`;
}

// Update the Task List
function updateTasksUI() {
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
                onclick="toggleTask('${task.id}', ${task.completed}, ${task.xp})" 
                class="w-8 h-8 rounded-full border-2 flex items-center justify-center ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}"
            >
                ${task.completed ? '<span class="text-white text-sm">✓</span>' : ''}
            </button>
        `;
        taskList.appendChild(li);
    });
}

// Add a new task to the database
window.addTask = async function() {
    const input = document.getElementById('newTaskInput');
    const select = document.getElementById('taskDifficulty');
    
    if (input.value.trim() === '') return;

    await addDoc(tasksRef, {
        text: input.value,
        xp: parseInt(select.value),
        completed: false,
        createdAt: new Date()
    });

    input.value = ''; 
};

// Toggle a task and handle XP logic
window.toggleTask = async function(taskId, isCompleted, taskXp) {
    const taskDoc = doc(db, 'tasks', taskId);
    
    // Check or uncheck in database
    await updateDoc(taskDoc, { completed: !isCompleted });

    // Calculate new XP
    let newXP = player.currentXP + (!isCompleted ? taskXp : -taskXp);
    let newLevel = player.level;
    let newXPNext = player.xpToNextLevel;

    if (newXP < 0) newXP = 0; // No negative XP

    // Level up logic
    if (newXP >= newXPNext) {
        newLevel++;
        newXP = newXP - newXPNext;
        newXPNext = Math.floor(newXPNext * 1.5);
        alert(`Congratulations! You reached Level ${newLevel}! 🎉`);
    }

    // Save new stats to database
    await setDoc(playerRef, {
        level: newLevel,
        currentXP: newXP,
        xpToNextLevel: newXPNext
    });
};