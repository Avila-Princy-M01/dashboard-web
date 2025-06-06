// DOM Elements
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const todoStats = document.getElementById('todo-stats');
const calcDisplay = document.getElementById('calc-display');
const gameBoard = document.getElementById('game-board');
const gameStatus = document.getElementById('game-status');
const currentTime = document.getElementById('current-time');
const currentDate = document.getElementById('current-date');
const notesInput = document.getElementById('notes-input');
const savedNotes = document.getElementById('saved-notes');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const notificationsToggle = document.getElementById('notifications-toggle');
const themeSelector = document.getElementById('theme-selector');
const fontSizeSlider = document.getElementById('font-size-slider');
const fontSizeValue = document.getElementById('font-size-value');
const notification = document.getElementById('notification');
const particlesContainer = document.getElementById('particles');
const settings = document.getElementById('settings');
const notesContainer = document.getElementById('notes');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const sidebar = document.querySelector('.sidebar');
const themeToggle = document.querySelector('.theme-toggle');
const loadingScreen = document.querySelector('.loading-screen');
const quickAccess = document.querySelector('.quick-access');
const calendarHeader = document.querySelector('.calendar-header');
const calendarDays = document.querySelector('.calendar-days');
const eventModal = document.getElementById('event-modal');
const eventForm = document.getElementById('event-form');

// State Management
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let notes = JSON.parse(localStorage.getItem('notes')) || [];
let events = JSON.parse(localStorage.getItem('events')) || [];
let gameState = {
    board: Array(9).fill(''),
    currentPlayer: 'X',
    gameOver: false
};
let currentTheme = localStorage.getItem('theme') || 'default';
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let notificationsEnabled = localStorage.getItem('notifications') !== 'false';
let fontSize = parseInt(localStorage.getItem('fontSize')) || 16;

// Initialize Components
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeTodoList();
    initializeCalculator();
    initializeGame();
    initializeClock();
    initializeNotes();
    initializeSettings();
    initializeParticles();
    initializeCalendar();
    initializeSearch();
    initializeSidebar();
    initializeQuickAccess();
    hideLoadingScreen();
});

// Tab Navigation
function initializeTabs() {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const target = button.dataset.target;
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });
}

// Todo List
function initializeTodoList() {
    renderTodos();
    todoInput.addEventListener('keypress', handleTodoKeyPress);
}

function handleTodoKeyPress(event) {
    if (event.key === 'Enter' && todoInput.value.trim()) {
        addTodo(todoInput.value.trim());
        todoInput.value = '';
    }
}

function addTodo(text) {
    todos.push({ text, completed: false });
    saveTodos();
    renderTodos();
    showNotification('Task added successfully!');
}

function toggleTodo(index) {
    todos[index].completed = !todos[index].completed;
    saveTodos();
    renderTodos();
}

function deleteTodo(index) {
    todos.splice(index, 1);
    saveTodos();
    renderTodos();
    showNotification('Task deleted successfully!');
}

function filterTodos(filter) {
    const filteredTodos = todos.filter(todo => {
        if (filter === 'active') return !todo.completed;
        if (filter === 'completed') return todo.completed;
        return true;
    });
    renderTodos(filteredTodos);
}

function renderTodos(todosToRender = todos) {
    todoList.innerHTML = todosToRender.map((todo, index) => `
        <div class="todo-item ${todo.completed ? 'completed' : ''}">
            <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${index})">
            <span>${todo.text}</span>
            <button onclick="deleteTodo(${index})">×</button>
        </div>
    `).join('');
}

// Calculator
function initializeCalculator() {
    const calculator = document.querySelector('.calculator');
    calculator.addEventListener('click', handleCalculatorClick);
}

function handleCalculatorClick(event) {
    if (event.target.matches('button')) {
        const value = event.target.textContent;
        const display = document.querySelector('.calculator-display');
        
        switch(value) {
            case 'C':
                display.value = '';
                break;
            case '←':
                display.value = display.value.slice(0, -1);
                break;
            case '=':
                try {
                    display.value = eval(display.value);
                } catch (error) {
                    display.value = 'Error';
                }
                break;
            default:
                display.value += value;
        }
    }
}

// Game
function initializeGame() {
    renderGameBoard();
    gameBoard.addEventListener('click', handleGameClick);
}

function handleGameClick(event) {
    if (event.target.matches('.game-cell') && !gameState.gameOver) {
        const index = Array.from(gameBoard.children).indexOf(event.target);
        if (gameState.board[index] === '') {
            gameState.board[index] = gameState.currentPlayer;
            renderGameBoard();
            
            if (checkWin()) {
                showNotification(`${gameState.currentPlayer} wins!`);
                gameState.gameOver = true;
            } else if (checkDraw()) {
                showNotification('Game is a draw!');
                gameState.gameOver = true;
            } else {
                gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
            }
        }
    }
}

function checkWin() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];
    
    return winPatterns.some(pattern => {
        const [a, b, c] = pattern;
        return gameState.board[a] &&
               gameState.board[a] === gameState.board[b] &&
               gameState.board[a] === gameState.board[c];
    });
}

function checkDraw() {
    return gameState.board.every(cell => cell !== '');
}

function resetGame() {
    gameState = {
        board: Array(9).fill(''),
        currentPlayer: 'X',
        gameOver: false
    };
    renderGameBoard();
    showNotification('Game reset!');
}

function renderGameBoard() {
    gameBoard.innerHTML = gameState.board.map((cell, index) => `
        <div class="game-cell">${cell}</div>
    `).join('');
}

// Clock
function initializeClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    const now = new Date();
    const timeElement = document.querySelector('.current-time');
    const dateElement = document.querySelector('.current-date');
    
    timeElement.textContent = now.toLocaleTimeString();
    dateElement.textContent = now.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Notes
function initializeNotes() {
    renderNotes();
    const noteInput = document.getElementById('note-input');
    noteInput.addEventListener('keypress', handleNoteKeyPress);
}

function handleNoteKeyPress(event) {
    if (event.key === 'Enter' && event.ctrlKey) {
        const text = event.target.value.trim();
        if (text) {
            addNote(text);
            event.target.value = '';
        }
    }
}

function addNote(text) {
    notes.push({
        text,
        timestamp: new Date().toISOString()
    });
    saveNotes();
    renderNotes();
    showNotification('Note added successfully!');
}

function deleteNote(index) {
    notes.splice(index, 1);
    saveNotes();
    renderNotes();
    showNotification('Note deleted successfully!');
}

function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

function renderNotes() {
    const notesList = document.querySelector('.notes-list');
    notesList.innerHTML = notes.map((note, index) => `
        <div class="note-item">
            <p>${note.text}</p>
            <small>${new Date(note.timestamp).toLocaleString()}</small>
            <button onclick="deleteNote(${index})">×</button>
        </div>
    `).reverse().join('');
}

// Settings
function initializeSettings() {
    const darkModeToggle = document.getElementById('dark-mode');
    const notificationsToggle = document.getElementById('notifications');
    const themeSelect = document.getElementById('theme');
    const fontSizeInput = document.getElementById('font-size');
    
    darkModeToggle.checked = localStorage.getItem('darkMode') === 'true';
    notificationsToggle.checked = localStorage.getItem('notifications') === 'true';
    themeSelect.value = localStorage.getItem('theme') || 'default';
    fontSizeInput.value = localStorage.getItem('fontSize') || '16';
    
    darkModeToggle.addEventListener('change', toggleDarkMode);
    notificationsToggle.addEventListener('change', toggleNotifications);
    themeSelect.addEventListener('change', changeTheme);
    fontSizeInput.addEventListener('change', changeFontSize);
}

function toggleDarkMode(event) {
    document.body.classList.toggle('dark-mode', event.target.checked);
    localStorage.setItem('darkMode', event.target.checked);
}

function toggleNotifications(event) {
    localStorage.setItem('notifications', event.target.checked);
    if (event.target.checked) {
        showNotification('Notifications enabled!');
    }
}

function changeTheme(event) {
    document.documentElement.setAttribute('data-theme', event.target.value);
    localStorage.setItem('theme', event.target.value);
}

function changeFontSize(event) {
    document.documentElement.style.fontSize = `${event.target.value}px`;
    localStorage.setItem('fontSize', event.target.value);
}

// Calendar
function initializeCalendar() {
    const currentDate = new Date();
    renderCalendar(currentDate);
    
    document.getElementById('prev-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });
}

function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    document.querySelector('.calendar-month').textContent = `${monthNames[month]} ${year}`;
    
    let days = '';
    for (let i = 0; i < firstDay.getDay(); i++) {
        days += '<div class="calendar-day empty"></div>';
    }
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const hasEvents = events.some(event => {
            const eventDate = new Date(event.date);
            return eventDate.getDate() === day &&
                   eventDate.getMonth() === month &&
                   eventDate.getFullYear() === year;
        });
        
        days += `
            <div class="calendar-day ${hasEvents ? 'has-events' : ''}" 
                 onclick="showEventModal('${year}-${month + 1}-${day}')">
                ${day}
            </div>
        `;
    }
    
    calendarDays.innerHTML = days;
    renderEvents(date);
}

function renderEvents(date) {
    const monthEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getMonth() === date.getMonth() &&
               eventDate.getFullYear() === date.getFullYear();
    });
    
    const eventsList = document.querySelector('.event-list');
    eventsList.innerHTML = monthEvents.map(event => `
        <div class="event-item">
            <i class="fas fa-calendar"></i>
            <div>
                <h4>${event.title}</h4>
                <p>${new Date(event.date).toLocaleDateString()}</p>
            </div>
        </div>
    `).join('');
}

function showEventModal(date) {
    eventModal.style.display = 'flex';
    eventForm.dataset.date = date;
}

function closeModal() {
    eventModal.style.display = 'none';
}

function addEvent(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newEvent = {
        title: formData.get('title'),
        date: event.target.dataset.date,
        description: formData.get('description')
    };
    
    events.push(newEvent);
    localStorage.setItem('events', JSON.stringify(events));
    renderCalendar(new Date(newEvent.date));
    closeModal();
    showNotification('Event added successfully!');
}

// Search
function initializeSearch() {
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', event => {
        if (event.key === 'Enter') handleSearch();
    });
}

function handleSearch() {
    const query = searchInput.value.toLowerCase();
    const results = [];
    
    // Search in todos
    todos.forEach(todo => {
        if (todo.text.toLowerCase().includes(query)) {
            results.push({
                type: 'Todo',
                content: todo.text,
                link: '#todo-list'
            });
        }
    });
    
    // Search in notes
    notes.forEach(note => {
        if (note.text.toLowerCase().includes(query)) {
            results.push({
                type: 'Note',
                content: note.text,
                link: '#notes'
            });
        }
    });
    
    // Search in events
    events.forEach(event => {
        if (event.title.toLowerCase().includes(query) ||
            event.description.toLowerCase().includes(query)) {
            results.push({
                type: 'Event',
                content: event.title,
                link: '#calendar'
            });
        }
    });
    
    showSearchResults(results);
}

function showSearchResults(results) {
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'search-results';
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>No results found</p>';
    } else {
        resultsContainer.innerHTML = results.map(result => `
            <div class="search-result-item">
                <span class="result-type">${result.type}</span>
                <p>${result.content}</p>
                <a href="${result.link}">View</a>
            </div>
        `).join('');
    }
    
    const existingResults = document.querySelector('.search-results');
    if (existingResults) {
        existingResults.remove();
    }
    
    document.querySelector('.search-container').appendChild(resultsContainer);
}

// Sidebar
function initializeSidebar() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    sidebarToggle.addEventListener('click', toggleSidebar);
}

function toggleSidebar() {
    sidebar.classList.toggle('active');
}

// Quick Access
function initializeQuickAccess() {
    document.getElementById('scroll-top').addEventListener('click', scrollToTop);
    document.getElementById('fullscreen').addEventListener('click', toggleFullscreen);
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

// Loading Screen
function hideLoadingScreen() {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 500);
}

// Optimized Particles Effect
function initializeParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particles';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;
    let isVisible = true;
    
    // Use ResizeObserver for better performance
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            resize();
        }
    });
    resizeObserver.observe(document.body);
    
    function resize() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.scale(dpr, dpr);
    }
    
    function createParticle() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speedX: Math.random() * 1 - 0.5,
            speedY: Math.random() * 1 - 0.5,
            opacity: Math.random() * 0.5 + 0.2
        };
    }
    
    function init() {
        particles = [];
        const particleCount = Math.min(30, Math.floor((canvas.width * canvas.height) / 20000));
        for (let i = 0; i < particleCount; i++) {
            particles.push(createParticle());
        }
    }
    
    function animate() {
        if (!isVisible) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            ctx.fill();
        });
        
        animationFrameId = requestAnimationFrame(animate);
    }
    
    // Pause animation when tab is not visible
    document.addEventListener('visibilitychange', () => {
        isVisible = !document.hidden;
        if (isVisible) {
            animate();
        } else {
            cancelAnimationFrame(animationFrameId);
        }
    });
    
    // Cleanup function
    function cleanup() {
        cancelAnimationFrame(animationFrameId);
        resizeObserver.disconnect();
        canvas.remove();
    }
    
    // Initialize
    resize();
    init();
    animate();
    
    // Return cleanup function
    return cleanup;
}

// Initialize particles and store cleanup function
const cleanupParticles = initializeParticles();

// Cleanup on page unload
window.addEventListener('unload', cleanupParticles);

// Notifications
function showNotification(message) {
    if (localStorage.getItem('notifications') === 'true') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// Event Listeners
window.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        closeModal();
    }
});

// Export functions for HTML onclick attributes
window.scrollToTop = scrollToTop;
window.toggleFullscreen = toggleFullscreen;
window.toggleSidebar = toggleSidebar;
window.toggleTheme = toggleDarkMode;
window.previousMonth = () => {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
};
window.nextMonth = () => {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
};
window.closeModal = closeModal;
window.addEvent = addEvent;
window.showEventModal = showEventModal;
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;
window.deleteNote = deleteNote;
window.resetGame = resetGame;

// Calculator Functions
function clearCalc() {
    document.getElementById('calc-display').textContent = '0';
}

function deleteLast() {
    const display = document.getElementById('calc-display');
    display.textContent = display.textContent.slice(0, -1) || '0';
}

function appendToCalc(value) {
    const display = document.getElementById('calc-display');
    if (display.textContent === '0' && value !== '.') {
        display.textContent = value;
    } else {
        display.textContent += value;
    }
}

function calculateResult() {
    const display = document.getElementById('calc-display');
    try {
        const result = eval(display.textContent);
        display.textContent = Number.isFinite(result) ? result : 'Error';
    } catch (error) {
        display.textContent = 'Error';
    }
}
// Notes Functions
function saveNote() {
    const noteInput = document.getElementById('notes-input');
    const text = noteInput.value.trim();

    if (text) {
        const existingNotes = document.querySelectorAll('.note');
        for (let note of existingNotes) {
            if (note.textContent === text) {
                alert("Duplicate note not allowed.");
                return;
            }
        }

        addNote(text);
        noteInput.value = '';
    }
}
