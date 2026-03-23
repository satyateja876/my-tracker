// Get today's date in YYYY-MM-DD format
function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Storage keys
const STORAGE_KEYS = {
    TASKS: 'my_tasks',
    HISTORY: 'task_history'
};

// Default tasks to start with
const DEFAULT_TASKS = ['Align orders', 'Check emails', 'Review progress'];

// Initialize data
let tasks = []; // List of task names
let history = {}; // { "2026-03-21": { "task_id": "done/missed" } }

function loadData() {
    // Load tasks
    const savedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    } else {
        tasks = [...DEFAULT_TASKS];
        saveTasks();
    }
    
    // Load history
    const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (savedHistory) {
        history = JSON.parse(savedHistory);
    } else {
        history = {};
        saveHistory();
    }
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

function saveHistory() {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
}

// Get status for a task on a specific date
function getTaskStatus(taskIndex, date) {
    if (!history[date]) return null;
    return history[date][taskIndex] || null;
}

// Set status for a task on a specific date
function setTaskStatus(taskIndex, date, status) {
    if (!history[date]) {
        history[date] = {};
    }
    history[date][taskIndex] = status;
    saveHistory();
    renderTasks();
    updateAllStats();
}

// Get today's status for a task
function getTodayStatus(taskIndex) {
    return getTaskStatus(taskIndex, getTodayDate());
}

// Set today's status for a task
function setTodayStatus(taskIndex, status) {
    setTaskStatus(taskIndex, getTodayDate(), status);
}

// Add new task
function addTask(taskName) {
    if (!taskName.trim()) return;
    tasks.push(taskName.trim());
    saveTasks();
    renderTasks();
    updateAllStats();
}

// Delete task
function deleteTask(taskIndex) {
    // Remove task from list
    tasks.splice(taskIndex, 1);
    saveTasks();
    
    // Update history - shift all task indices after this one
    const newHistory = {};
    for (const date in history) {
        newHistory[date] = {};
        for (const oldIndex in history[date]) {
            const newIndex = parseInt(oldIndex);
            if (newIndex < taskIndex) {
                newHistory[date][newIndex] = history[date][oldIndex];
            } else if (newIndex > taskIndex) {
                newHistory[date][newIndex - 1] = history[date][oldIndex];
            }
            // If equal to taskIndex, skip (task deleted)
        }
    }
    history = newHistory;
    saveHistory();
    
    renderTasks();
    updateAllStats();
}

// Calculate completion percentage for a date range
function calculatePercentage(dateRange) {
    let totalTasks = tasks.length;
    if (totalTasks === 0) return 0;
    
    let totalCompleted = 0;
    let totalPossible = 0;
    
    for (const dateStr in history) {
        if (dateRange(dateStr)) {
            const dayHistory = history[dateStr];
            for (let i = 0; i < totalTasks; i++) {
                if (dayHistory[i] === 'done') {
                    totalCompleted++;
                    totalPossible++;
                } else if (dayHistory[i] === 'missed') {
                    totalPossible++;
                }
            }
        }
    }
    
    if (totalPossible === 0) return 0;
    return (totalCompleted / totalPossible) * 100;
}

// Get percentage for Today
function getTodayPercentage() {
    const today = getTodayDate();
    if (!history[today]) return 0;
    
    let completed = 0;
    let total = tasks.length;
    
    for (let i = 0; i < tasks.length; i++) {
        if (history[today][i] === 'done') completed++;
    }
    
    if (total === 0) return 0;
    return (completed / total) * 100;
}

// Get percentage for This Week (last 7 days)
function getWeekPercentage() {
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 6);
    
    return calculatePercentage(dateStr => {
        const date = new Date(dateStr);
        return date >= oneWeekAgo && date <= today;
    });
}

// Get percentage for This Month (last 30 days)
function getMonthPercentage() {
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setDate(today.getDate() - 29);
    
    return calculatePercentage(dateStr => {
        const date = new Date(dateStr);
        return date >= oneMonthAgo && date <= today;
    });
}

// Get percentage for Last 6 Months
function getSixMonthPercentage() {
    const today = new Date();
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setDate(today.getDate() - 180);
    
    return calculatePercentage(dateStr => {
        const date = new Date(dateStr);
        return date >= sixMonthsAgo && date <= today;
    });
}

// Get percentage for This Year
function getYearPercentage() {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setDate(today.getDate() - 364);
    
    return calculatePercentage(dateStr => {
        const date = new Date(dateStr);
        return date >= oneYearAgo && date <= today;
    });
}

// Update all progress bars
function updateAllStats() {
    const todayPercent = getTodayPercentage();
    const weekPercent = getWeekPercentage();
    const monthPercent = getMonthPercentage();
    const sixMonthPercent = getSixMonthPercentage();
    const yearPercent = getYearPercentage();
    
    document.getElementById('todayBar').style.width = todayPercent + '%';
    document.getElementById('todayPercent').innerText = Math.round(todayPercent) + '%';
    
    document.getElementById('weekBar').style.width = weekPercent + '%';
    document.getElementById('weekPercent').innerText = Math.round(weekPercent) + '%';
    
    document.getElementById('monthBar').style.width = monthPercent + '%';
    document.getElementById('monthPercent').innerText = Math.round(monthPercent) + '%';
    
    document.getElementById('sixMonthBar').style.width = sixMonthPercent + '%';
    document.getElementById('sixMonthPercent').innerText = Math.round(sixMonthPercent) + '%';
    
    document.getElementById('yearBar').style.width = yearPercent + '%';
    document.getElementById('yearPercent').innerText = Math.round(yearPercent) + '%';
}

// Render all tasks for today
function renderTasks() {
    const tasksList = document.getElementById('tasksList');
    const today = getTodayDate();
    
    if (tasks.length === 0) {
        tasksList.innerHTML = '<div style="text-align: center; padding: 40px; color: #9ca3af;">No tasks yet. Add your first task above!</div>';
        return;
    }
    
    tasksList.innerHTML = '';
    
    tasks.forEach((task, index) => {
        const status = getTodayStatus(index);
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-item';
        if (status === 'done') taskDiv.classList.add('completed');
        
        taskDiv.innerHTML = `
            <div class="task-name">${escapeHtml(task)}</div>
            <div class="task-buttons">
                <button class="btn-done" data-index="${index}" data-action="">✅ Done</button>
                <button class="btn-missed" data-index="${index}" data-action="">❌ Missed</button>
                <button class="secondary-btn" data-index="${index}" data-action="delete" style="background:#ef4444; padding:8px 12px;">🗑️</button>
            </div>
        `;
        
        tasksList.appendChild(taskDiv);
        
        // Highlight current status
        if (status === 'done') {
            taskDiv.querySelector('.btn-done').style.opacity = '0.7';
        } else if (status === 'missed') {
            taskDiv.querySelector('.btn-missed').style.opacity = '0.7';
        }
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.btn-done').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(btn.dataset.index);
            setTodayStatus(index, 'done');
        });
    });
    
    document.querySelectorAll('.btn-missed').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(btn.dataset.index);
            setTodayStatus(index, 'missed');
        });
    });
    
    document.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(btn.dataset.index);
            if (confirm(`Delete task "${tasks[index]}"? This will also remove all history for this task.`)) {
                deleteTask(index);
            }
        });
    });
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Update current date display
function updateDateDisplay() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').innerText = today.toLocaleDateString(undefined, options);
}

// Export data for backup
function exportData() {
    const data = {
        tasks: tasks,
        history: history,
        exportDate: new Date().toISOString()
    };
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-tracker-backup-${getTodayDate()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Import data from backup
function importData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.tasks && data.history) {
                tasks = data.tasks;
                history = data.history;
                saveTasks();
                saveHistory();
                renderTasks();
                updateAllStats();
                alert('Backup restored successfully!');
            } else {
                alert('Invalid backup file format.');
            }
        } catch (error) {
            alert('Error reading backup file.');
        }
    };
    reader.readAsText(file);
}

// Reset all data
function resetAllData() {
    if (confirm('⚠️ WARNING: This will delete ALL tasks and ALL history. This cannot be undone. Are you sure?')) {
        tasks = [...DEFAULT_TASKS];
        history = {};
        saveTasks();
        saveHistory();
        renderTasks();
        updateAllStats();
        alert('All data has been reset.');
    }
}

// Initialize the app
function init() {
    loadData();
    updateDateDisplay();
    renderTasks();
    updateAllStats();
    
    // Add event listeners
    document.getElementById('addTaskBtn').addEventListener('click', () => {
        const input = document.getElementById('newTaskInput');
        addTask(input.value);
        input.value = '';
        input.focus();
    });
    
    document.getElementById('newTaskInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('addTaskBtn').click();
        }
    });
    
    document.getElementById('resetDataBtn').addEventListener('click', resetAllData);
    document.getElementById('exportDataBtn').addEventListener('click', exportData);
    document.getElementById('importDataBtn').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            importData(e.target.files[0]);
            e.target.value = '';
        }
    });
}

// Start the app
init();
