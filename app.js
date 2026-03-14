import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, updateDoc, doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ⚠️ PASTE YOUR CONFIG OBJECT HERE ⚠️
const firebaseConfig = {
    apiKey: "AIzaSyBy6F7CTN0QbUJF-SJiKJvTvE8KrJ4w27I",

  authDomain: "life-quest-5fb29.firebaseapp.com",

  projectId: "life-quest-5fb29",

  storageBucket: "life-quest-5fb29.firebasestorage.app",

  messagingSenderId: "613857430295",

  appId: "1:613857430295:web:5c29c553b2a9039eff8552",

  measurementId: "G-ECNQV2FNVB"

};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Database References
const statsRef = doc(db, 'shared', 'gameStats');
const tasksRef = collection(db, 'tasks');

// Default starting stats for both players
let players = {
    p1: { name: "Devang", level: 1, currentXP: 0, xpToNextLevel: 100 },
    p2: { name: "Partner", level: 1, currentXP: 0, xpToNextLevel: 100 }
};
let tasks = [];

// Listeners
onSnapshot(statsRef, (snapshot) => {
    if (snapshot.exists()) {
        players = snapshot.data();
    } else {
        setDoc(statsRef, players);
    }
    updateHeaderUI();
});

onSnapshot(tasksRef, (snapshot) => {
    tasks = [];
    snapshot.forEach((doc) => tasks.push({ id: doc.id, ...doc.data() }));
    // Sort: incomplete first, then sort by creation time
    tasks.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return b.createdAt - a.createdAt;
    });
    updateTasksUI();
});

function updateHeaderUI() {
    // Devang Stats
    document.getElementById('p1Level').innerText = players.p1.level;
    document.getElementById('p1XpText').innerText = `${players.p1.currentXP} / ${players.p1.xpToNextLevel} XP`;
    document.getElementById('p1XpBar').style.width = `${(players.p1.currentXP / players.p1.xpToNextLevel) * 100}%`;

    // Partner Stats
    document.getElementById('p2Level').innerText = players.p2.level;
    document.getElementById('p2XpText').innerText = `${players.p2.currentXP} / ${players.p2.xpToNextLevel} XP`;
    document.getElementById('p2XpBar').style.width = `${(players.p2.currentXP / players.p2.xpToNextLevel) * 100}%`;
}

function updateTasksUI() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-card bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center ${task.completed ? 'completed-task' : 'hover:shadow-md'}`;
        
        // Define buttons based on completion status
        let actionHTML = '';
        if (!task.completed) {
            actionHTML = `
                <div class="flex gap-2">
                    <button onclick="claimTask('${task.id}', 'p1', ${task.xp})" class="w-9 h-9 rounded-full bg-blue-100 text-blue-600 font-bold hover:bg-blue-200 transition">D</button>
                    <button onclick="claimTask('${task.id}', 'p2', ${task.xp})" class="w-9 h-9 rounded-full bg-pink-100 text-pink-600 font-bold hover:bg-pink-200 transition">P</button>
                </div>
            `;
        } else {
            const isP1 = task.completedBy === 'p1';
            actionHTML = `
                <button onclick="unclaimTask('${task.id}', '${task.completedBy}', ${task.xp})" class="w-9 h-9 rounded-full flex items-center justify-center ${isP1 ? 'bg-blue-500' : 'bg-pink-500'}">
                    <span class="text-white font-bold text-sm">✓</span>
                </button>
            `;
        }

        li.innerHTML = `
            <div class="flex-1 pr-4">
                <p class="font-semibold text-gray-800 task-text text-lg leading-tight mb-1">${task.text}</p>
                <p class="text-xs text-indigo-500 font-bold tracking-wide">+${task.xp} XP</p>
            </div>
            ${actionHTML}
        `;
        taskList.appendChild(li);
    });
}

window.addTask = async function() {
    const input = document.getElementById('newTaskInput');
    const select = document.getElementById('taskDifficulty');
    if (input.value.trim() === '') return;

    await addDoc(tasksRef, {
        text: input.value,
        xp: parseInt(select.value),
        completed: false,
        completedBy: null,
        createdAt: Date.now()
    });
    input.value = ''; 
};

window.claimTask = async function(taskId, playerId, xpAmount) {
    const taskDoc = doc(db, 'tasks', taskId);
    await updateDoc(taskDoc, { completed: true, completedBy: playerId });

    let playerObj = players[playerId];
    playerObj.currentXP += xpAmount;

    if (playerObj.currentXP >= playerObj.xpToNextLevel) {
        playerObj.level++;
        playerObj.currentXP -= playerObj.xpToNextLevel;
        playerObj.xpToNextLevel = Math.floor(playerObj.xpToNextLevel * 1.5);
        alert(`${playerObj.name} leveled up to Level ${playerObj.level}! 🎉`);
    }

    await setDoc(statsRef, players);
};

window.unclaimTask = async function(taskId, playerId, xpAmount) {
    const taskDoc = doc(db, 'tasks', taskId);
    await updateDoc(taskDoc, { completed: false, completedBy: null });

    let playerObj = players[playerId];
    playerObj.currentXP -= xpAmount;
    if (playerObj.currentXP < 0) playerObj.currentXP = 0; // Prevent negative XP on current level

    await setDoc(statsRef, players);
};