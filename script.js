function renderTasks() {
    const tasksList = document.getElementById('tasksList');

    if (tasks.length === 0) {
        tasksList.innerHTML = '<div style="text-align:center;padding:40px;">No tasks</div>';
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
                <button class="btn-done" data-index="${index}">✔</button>
                <button class="btn-missed" data-index="${index}">❌</button>

                <div class="menu">
                    <button class="menu-btn">⋮</button>
                    <div class="dropdown">
                        <button data-action="delete" data-index="${index}">Delete</button>
                    </div>
                </div>
            </div>
        `;

        tasksList.appendChild(taskDiv);

        // highlight status
        if (status === 'done') {
            taskDiv.querySelector('.btn-done').style.opacity = '0.6';
        } else if (status === 'missed') {
            taskDiv.querySelector('.btn-missed').style.opacity = '0.6';
        }
    });

    // ✔ Done
    document.querySelectorAll('.btn-done').forEach(btn => {
        btn.onclick = () => {
            setTodayStatus(parseInt(btn.dataset.index), 'done');
        };
    });

    // ❌ Missed
    document.querySelectorAll('.btn-missed').forEach(btn => {
        btn.onclick = () => {
            setTodayStatus(parseInt(btn.dataset.index), 'missed');
        };
    });

    // ⋮ Toggle menu
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.onclick = (e) => {
            const dropdown = btn.nextElementSibling;
            dropdown.classList.toggle('show');
        };
    });

    // Delete
    document.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.onclick = () => {
            const index = parseInt(btn.dataset.index);
            deleteTask(index);
        };
    });

    // Close menu on outside click
    window.onclick = (e) => {
        if (!e.target.classList.contains('menu-btn')) {
            document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('show'));
        }
    };
}
