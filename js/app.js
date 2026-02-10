// To-Do List Application
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('task-input');
    const addBtn = document.getElementById('add-btn');
    const taskList = document.getElementById('task-list');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const clearAllBtn = document.getElementById('clear-all');
    const themeToggle = document.getElementById('theme-toggle');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const priorityBtns = document.querySelectorAll('.priority-btn');
    const testButton = document.getElementById('testButton');
    
    // Stats elements
    const totalTasksEl = document.getElementById('total-tasks');
    const pendingTasksEl = document.getElementById('pending-tasks');
    const completedTasksEl = document.getElementById('completed-tasks');
    
    // State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentPriority = 'medium';
    let currentFilter = 'all';
    
    // Initialize
    updateStats();
    renderTasks();
    loadTheme();
    
    // ===== TEST BUTTON FUNCTIONALITY =====
    testButton.addEventListener('click', function() {
        // Add a demo task
        const demoTask = {
            id: Date.now(),
            text: '✨ Demo task added via Test Button!',
            completed: false,
            priority: 'high',
            date: new Date().toISOString()
        };
        
        tasks.unshift(demoTask); // Add at beginning
        saveTasks();
        renderTasks();
        updateStats();
        
        // Show notification
        showNotification('Demo task added successfully!', 'success');
        
        // Animate the test button
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });
    
    // ===== EVENT LISTENERS =====
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });
    
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    clearAllBtn.addEventListener('click', clearAllTasks);
    
    themeToggle.addEventListener('change', toggleTheme);
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderTasks();
        });
    });
    
    priorityBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            priorityBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentPriority = this.dataset.priority;
        });
    });
    
    // ===== FUNCTIONS =====
    function addTask() {
        const text = taskInput.value.trim();
        if (!text) {
            showNotification('Please enter a task!', 'warning');
            taskInput.focus();
            return;
        }
        
        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            priority: currentPriority,
            date: new Date().toISOString()
        };
        
        tasks.unshift(task);
        saveTasks();
        renderTasks();
        updateStats();
        
        taskInput.value = '';
        taskInput.focus();
        
        showNotification('Task added successfully!', 'success');
    }
    
    function renderTasks() {
        taskList.innerHTML = '';
        
        // Filter tasks
        let filteredTasks = tasks;
        if (currentFilter === 'pending') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        } else if (currentFilter === 'high') {
            filteredTasks = tasks.filter(task => task.priority === 'high');
        }
        
        if (filteredTasks.length === 0) {
            const emptyState = document.createElement('li');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <i class="fas fa-clipboard-list"></i>
                <p>No ${currentFilter !== 'all' ? currentFilter + ' ' : ''}tasks found.</p>
            `;
            taskList.appendChild(emptyState);
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''} ${task.priority}-priority`;
            taskItem.innerHTML = `
                <div class="task-content">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                </div>
                <div class="task-actions">
                    <button class="task-action-btn edit-btn" title="Edit task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-action-btn delete-btn" title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // Add event listeners for task item
            const checkbox = taskItem.querySelector('.task-checkbox');
            const deleteBtn = taskItem.querySelector('.delete-btn');
            const editBtn = taskItem.querySelector('.edit-btn');
            const taskText = taskItem.querySelector('.task-text');
            
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleTaskCompletion(task.id);
            });
            
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTask(task.id);
            });
            
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                editTask(task.id, taskText);
            });
            
            taskItem.addEventListener('click', (e) => {
                if (e.target !== checkbox && e.target !== deleteBtn && e.target !== editBtn) {
                    toggleTaskCompletion(task.id);
                }
            });
            
            taskList.appendChild(taskItem);
        });
    }
    
    function toggleTaskCompletion(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
            updateStats();
            showNotification(`Task marked as ${task.completed ? 'completed' : 'pending'}!`, 'info');
        }
    }
    
    function deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
            updateStats();
            showNotification('Task deleted!', 'danger');
        }
    }
    
    function editTask(id, taskTextElement) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        
        const newText = prompt('Edit your task:', task.text);
        if (newText !== null && newText.trim() !== '') {
            task.text = newText.trim();
            saveTasks();
            renderTasks();
            showNotification('Task updated!', 'success');
        }
    }
    
    function clearCompletedTasks() {
        if (!confirm('Clear all completed tasks?')) return;
        
        const completedCount = tasks.filter(t => t.completed).length;
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
        updateStats();
        
        showNotification(`Cleared ${completedCount} completed task${completedCount !== 1 ? 's' : ''}!`, 'info');
    }
    
    function clearAllTasks() {
        if (tasks.length === 0) {
            showNotification('No tasks to clear!', 'warning');
            return;
        }
        
        if (!confirm('Are you sure you want to delete ALL tasks?')) return;
        
        const taskCount = tasks.length;
        tasks = [];
        saveTasks();
        renderTasks();
        updateStats();
        
        showNotification(`Cleared all ${taskCount} tasks!`, 'danger');
    }
    
    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const pending = total - completed;
        
        totalTasksEl.textContent = total;
        completedTasksEl.textContent = completed;
        pendingTasksEl.textContent = pending;
        
        // Animate counter update
        [totalTasksEl, completedTasksEl, pendingTasksEl].forEach(el => {
            el.style.transform = 'scale(1.1)';
            setTimeout(() => {
                el.style.transform = 'scale(1)';
            }, 150);
        });
    }
    
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', themeToggle.checked);
    }
    
    function loadTheme() {
        const darkMode = localStorage.getItem('darkMode') === 'true';
        themeToggle.checked = darkMode;
        if (darkMode) {
            document.body.classList.add('dark-mode');
        }
    }
    
    function showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${getNotificationColor(type)};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            min-width: 300px;
            max-width: 400px;
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 1.2rem;
            padding: 0;
            display: flex;
            align-items: center;
        `;
        
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
        
        document.body.appendChild(notification);
    }
    
    function getNotificationColor(type) {
        const colors = {
            success: 'linear-gradient(135deg, #4caf50, #2e7d32)',
            warning: 'linear-gradient(135deg, #ff9800, #ef6c00)',
            danger: 'linear-gradient(135deg, #f44336, #c62828)',
            info: 'linear-gradient(135deg, #2196f3, #1565c0)'
        };
        return colors[type] || colors.info;
    }
    
    // Add notification styles to page
    const notificationStyle = document.createElement('style');
    notificationStyle.textContent = `
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(notificationStyle);
});