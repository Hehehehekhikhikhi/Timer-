class NeonFocusTimer {
    constructor() {
        this.focusTime = 25; // minutes
        this.breakTime = 15; // minutes
        this.currentTime = this.focusTime * 60; // seconds
        this.isRunning = false;
        this.isPaused = false;
        this.isBreakTime = false;
        this.completedSessions = 0;
        this.currentSession = 1;
        this.maxSessions = 4;
        this.timer = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.updateDisplay();
        this.updateProgressRing();
    }
    
    initializeElements() {
        this.timeDisplay = document.getElementById('timeDisplay');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.sessionType = document.getElementById('sessionType');
        this.completedSessionsElement = document.getElementById('completedSessions');
        this.progressRing = document.querySelector('.progress-ring-fill');
        this.sessionDots = document.querySelectorAll('.dot');
        this.taskInput = document.getElementById('taskInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.tasksList = document.getElementById('tasksList');
    }
    
    attachEventListeners() {
        this.startBtn.addEventListener('click', () => this.startTimer());
        this.pauseBtn.addEventListener('click', () => this.pauseTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        
        // Focus time buttons
        document.querySelectorAll('.time-btn:not(.break-btn)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.time-btn:not(.break-btn)').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.focusTime = parseInt(e.target.dataset.minutes);
                if (!this.isBreakTime) {
                    this.currentTime = this.focusTime * 60;
                    this.updateDisplay();
                    this.updateProgressRing();
                }
            });
        });
        
        // Break time buttons
        document.querySelectorAll('.break-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.break-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.breakTime = parseInt(e.target.dataset.minutes);
                if (this.isBreakTime) {
                    this.currentTime = this.breakTime * 60;
                    this.updateDisplay();
                    this.updateProgressRing();
                }
            });
        });
        
        // Sound buttons
        document.querySelectorAll('.sound-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.sound-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
        
        // Task management
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        
        // Existing task interactions
        this.attachTaskListeners();
    }
    
    startTimer() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            this.startBtn.style.display = 'none';
            this.pauseBtn.style.display = 'flex';
            document.body.classList.add('timer-active');
            
            this.timer = setInterval(() => {
                this.currentTime--;
                this.updateDisplay();
                this.updateProgressRing();
                
                if (this.currentTime <= 0) {
                    this.completeSession();
                }
            }, 1000);
        }
    }
    
    pauseTimer() {
        if (this.isRunning) {
            this.isRunning = false;
            this.isPaused = true;
            this.startBtn.style.display = 'flex';
            this.pauseBtn.style.display = 'none';
            this.startBtn.querySelector('.btn-text').textContent = 'Resume';
            document.body.classList.remove('timer-active');
            
            clearInterval(this.timer);
        }
    }
    
    resetTimer() {
        this.isRunning = false;
        this.isPaused = false;
        this.startBtn.style.display = 'flex';
        this.pauseBtn.style.display = 'none';
        this.startBtn.querySelector('.btn-text').textContent = 'Start Focus';
        document.body.classList.remove('timer-active');
        
        clearInterval(this.timer);
        
        this.currentTime = this.isBreakTime ? this.breakTime * 60 : this.focusTime * 60;
        this.updateDisplay();
        this.updateProgressRing();
    }
    
    completeSession() {
        this.isRunning = false;
        this.startBtn.style.display = 'flex';
        this.pauseBtn.style.display = 'none';
        document.body.classList.remove('timer-active');
        
        clearInterval(this.timer);
        
        // Show notification
        this.showNotification();
        
        if (!this.isBreakTime) {
            // Focus session completed
            this.completedSessions++;
            this.completedSessionsElement.textContent = this.completedSessions;
            
            if (this.currentSession < this.maxSessions) {
                this.startBreak();
            } else {
                this.startLongBreak();
            }
        } else {
            // Break completed
            this.currentSession++;
            this.startFocus();
        }
        
        this.updateSessionDots();
    }
    
    startBreak() {
        this.isBreakTime = true;
        this.currentTime = this.breakTime * 60;
        this.sessionType.textContent = 'Short Break';
        this.startBtn.querySelector('.btn-text').textContent = 'Start Break';
        this.updateDisplay();
        this.updateProgressRing();
    }
    
    startLongBreak() {
        this.isBreakTime = true;
        this.currentTime = 30 * 60; // 30 minutes long break
        this.sessionType.textContent = 'Long Break';
        this.startBtn.querySelector('.btn-text').textContent = 'Start Long Break';
        this.currentSession = 0;
        this.updateDisplay();
        this.updateProgressRing();
    }
    
    startFocus() {
        this.isBreakTime = false;
        this.currentTime = this.focusTime * 60;
        this.sessionType.textContent = 'Focus Session';
        this.startBtn.querySelector('.btn-text').textContent = 'Start Focus';
        this.updateDisplay();
        this.updateProgressRing();
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        this.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateProgressRing() {
        const totalTime = this.isBreakTime ? this.breakTime * 60 : this.focusTime * 60;
        const progress = (totalTime - this.currentTime) / totalTime;
        const circumference = 2 * Math.PI * 120; // radius = 120
        const dashoffset = circumference - (progress * circumference);
        this.progressRing.style.strokeDashoffset = dashoffset;
    }
    
    updateSessionDots() {
        this.sessionDots.forEach((dot, index) => {
            dot.classList.toggle('active', index < this.currentSession);
        });
    }
    
    showNotification() {
        if (Notification.permission === 'granted') {
            const message = this.isBreakTime ? 
                'Break time is over! Ready to focus?' : 
                'Great work! Time for a break!';
            
            new Notification('NeonFocus Timer', {
                body: message,
                icon: '/favicon.ico'
            });
        }
    }
    
    addTask() {
        const taskText = this.taskInput.value.trim();
        if (taskText) {
            const taskElement = document.createElement('div');
            taskElement.className = 'task-item fade-in';
            taskElement.innerHTML = `
                <span class="task-checkbox"></span>
                <span class="task-text">${taskText}</span>
            `;
            
            this.tasksList.appendChild(taskElement);
            this.taskInput.value = '';
            this.attachTaskListener(taskElement);
        }
    }
    
    attachTaskListeners() {
        document.querySelectorAll('.task-item').forEach(task => {
            this.attachTaskListener(task);
        });
    }
    
    attachTaskListener(taskElement) {
        taskElement.addEventListener('click', () => {
            taskElement.classList.toggle('completed');
            const checkbox = taskElement.querySelector('.task-checkbox');
            checkbox.textContent = taskElement.classList.contains('completed') ? '✓' : '';
        });
    }
}

// Initialize the timer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Initialize the timer
    new NeonFocusTimer();
});

// Service Worker registration for offline functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered: ', registration))
            .catch(registrationError => console.log('SW registration failed: ', registrationError));
    });
}
