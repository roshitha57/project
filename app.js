// To-Do List Application
class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
        this.currentPriority = 'medium';
        this.currentFilter = 'all';
        
        this.init();
    }

    init() {
        // DOM Elements
        this.taskInput = document.getElementById('task-input');
        this.addBtn = document.getElementById('add-btn');
        this.taskList = document.getElementById('task-list');
        this.priorityBtns = document.querySelectorAll('.priority-btn');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.clearCompletedBtn = document.getElementById('clear-completed');
        this.clearAllBtn = document.getElementById('clear-all');
        this.themeToggle = document.getElementById('theme-toggle');
        this.githubLink = document.getElementById('github-link');
        
        // Stats elements
        this.totalTasksEl = document.getElementById('total-tasks');
        this.pendingTasksEl = document.getElementById('pending-tasks');
        this.completedTasksEl = document.getElementById('completed-tasks');
        
        // Event Listeners
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        
        this.priorityBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setPriority(e));
        });
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e));
        });
        
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.clearAllBtn.addEventListener('click', () => this.clearAll());
        this.themeToggle.addEventListener('change', () => this.toggleTheme());
        this.githubLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.open('https://github.com/yourusername/todo-list-project', '_blank');
        });
        
        // Initialize
        this.updateStats();
        this.renderTasks();
        this.loadTheme();
    }

    addTask() {
        const text = this.taskInput.value.trim();
        if (!text) {
            this.showNotification('Please enter a task!', 'error');
            return;
        }
        
        const task = {
            id: Date.now(),
            text: text,
            priority: this.currentPriority,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.unshift(task);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        
        this.taskInput.value = '';
        this.showNotification('Task added successfully!', 'success');
        
        // Focus back to input
        this.taskInput.focus();
    }

    setPriority(e) {
        this.priorityBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.currentPriority = e.target.dataset.priority;
    }

    setFilter(e) {
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.renderTasks();
    }

    toggleTaskStatus(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            
            this.showNotification(
                task.completed ? 'Task completed!' : 'Task marked as pending',
                'success'
            );
        }
    }

    deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;
        
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        
        this.showNotification('Task deleted!', 'success');
    }

    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            this.showNotification('No completed tasks to clear!', 'info');
            return;
        }
        
        if (!confirm(`Are you sure you want to clear ${completedCount} completed task(s)?`)) return;
        
        this.tasks = this.tasks.filter(t => !t.completed);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        
        this.showNotification('Completed tasks cleared!', 'success');
    }

    clearAll() {
        if (this.tasks.length === 0) {
            this.showNotification('No tasks to clear!', 'info');
            return;
        }
        
        if (!confirm('Are you sure you want to clear ALL tasks?')) return;
        
        this.tasks = [];
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        
        this.showNotification('All tasks cleared!', 'success');
    }

    saveTasks() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        
        this.totalTasksEl.textContent = total;
        this.completedTasksEl.textContent = completed;
        this.pendingTasksEl.textContent = pending;
    }

    renderTasks() {
        this.taskList.innerHTML = '';
        
        
        let filteredTasks = [...this.tasks];
        
        switch (this.currentFilter) {
            case 'pending':
                filteredTasks = filteredTasks.filter(t => !t.completed);
                break;
            case 'completed':
                filteredTasks = filteredTasks.filter(t => t.completed);
                break;
            case 'high':
                filteredTasks = filteredTasks.filter(t => t.priority === 'high');
                break;
        }
        
        if (filteredTasks.length === 0) {
            const emptyState = document.createElement('li');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <i class="fas fa-clipboard-list"></i>
                <p>${this.getEmptyStateMessage()}</p>
            `;
            this.taskList.appendChild(emptyState);
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskEl = document.createElement('li');
            taskEl.className = `task-item ${task.completed ? 'completed' : ''} priority-${task.priority}`;
            taskEl.innerHTML = `
                <input type="checkbox" 
                       class="task-checkbox" 
                       ${task.completed ? 'checked' : ''}
                       onchange="todoApp.toggleTaskStatus(${task.id})">
                <div class="task-content">
                    <div class="task-text">${this.escapeHtml(task.text)}</div>
                    <div class="task-priority">${task.priority.toUpperCase()}</div>
                </div>
                <div class="task-actions">
                    <button class="action-btn delete-btn" onclick="todoApp.deleteTask(${task.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // Add click event to entire task item
            taskEl.addEventListener('click', (e) => {
                if (!e.target.classList.contains('action-btn') && 
                    !e.target.classList.contains('fa-trash') &&
                    e.target.type !== 'checkbox') {
                    this.toggleTaskStatus(task.id);
                }
            });
            
            this.taskList.appendChild(taskEl);
        });
    }

    getEmptyStateMessage() {
        switch (this.currentFilter) {
            case 'all':
                return 'No tasks yet. Add your first task above!';
            case 'pending':
                return 'No pending tasks. Great job!';
            case 'completed':
                return 'No completed tasks yet.';
            case 'high':
                return 'No high priority tasks.';
            default:
                return 'No tasks found.';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('todoTheme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('todoTheme') || 'light';
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            this.themeToggle.checked = true;
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 10px;
                color: white;
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 1000;
                animation: slideIn 0.3s ease;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                max-width: 300px;
            }
            
            .notification-success {
                background: #28a745;
            }
            
            .notification-error {
                background: #dc3545;
            }
            
            .notification-info {
                background: #17a2b8;
            }
            
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
        document.body.appendChild(notification);
        
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}


const todoApp = new TodoApp();


window.todoApp = todoApp;