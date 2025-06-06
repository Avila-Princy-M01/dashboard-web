// DOM Elements - Grouped for better organization
const DOM = {
    tabButtons: document.querySelectorAll('.tab-button'),
    tabContents: document.querySelectorAll('.tab-content'),

    todoInput: document.getElementById('todo-input'),
    todoList: document.getElementById('todo-list'),
    todoStats: document.getElementById('todo-stats'), // Keep for potential future use

    calcDisplay: document.getElementById('calc-display'),
    calculator: document.querySelector('.calculator'), // Added for calculator event listener

    gameBoard: document.getElementById('game-board'),
    gameStatus: document.getElementById('game-status'), // Keep for potential future use

    currentTime: document.getElementById('current-time'),
    currentDate: document.getElementById('current-date'),

    notesInput: document.getElementById('notes-input'),
    notesList: document.querySelector('.notes-list'), // More specific than 'savedNotes' for rendering

    darkModeToggle: document.getElementById('dark-mode-toggle'),
    notificationsToggle: document.getElementById('notifications-toggle'),
    themeSelector: document.getElementById('theme-selector'),
    fontSizeSlider: document.getElementById('font-size-slider'),
    fontSizeValue: document.getElementById('font-size-value'), // Keep for potential future use

    notificationContainer: document.getElementById('notification-container'), // A container for dynamic notifications
    particlesCanvas: document.getElementById('particles-canvas'), // Renamed for clarity, assumes a canvas element

    searchInput: document.getElementById('search-input'),
    searchBtn: document.getElementById('search-btn'),

    sidebar: document.querySelector('.sidebar'),
    sidebarToggle: document.querySelector('.sidebar-toggle'), // Assuming a button to toggle sidebar

    loadingScreen: document.querySelector('.loading-screen'),

    calendarMonthDisplay: document.querySelector('.calendar-month'), // Added for calendar month display
    calendarDays: document.querySelector('.calendar-days'),
    prevMonthBtn: document.getElementById('prev-month'),
    nextMonthBtn: document.getElementById('next-month'),
    eventModal: document.getElementById('event-modal'),
    eventForm: document.getElementById('event-form'),
    eventList: document.querySelector('.event-list'),

    scrollTopBtn: document.getElementById('scroll-top'),
    fullscreenBtn: document.getElementById('fullscreen')
};

// State Management - Centralized and loaded from localStorage
const state = {
    todos: JSON.parse(localStorage.getItem('todos')) || [],
    notes: JSON.parse(localStorage.getItem('notes')) || [],
    events: JSON.parse(localStorage.getItem('events')) || [],
    gameState: {
        board: Array(9).fill(''),
        currentPlayer: 'X',
        gameOver: false
    },
    currentTheme: localStorage.getItem('theme') || 'default',
    isDarkMode: localStorage.getItem('darkMode') === 'true',
    notificationsEnabled: localStorage.getItem('notifications') !== 'false', // Default to true unless explicitly 'false'
    fontSize: parseInt(localStorage.getItem('fontSize')) || 16,
    currentCalendarDate: new Date() // Store current date for calendar
};

// ---
// Utility Functions
// ---

/** Saves data to localStorage. */
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error(`Error saving to localStorage for key "${key}":`, e);
    }
}

/** Retrieves data from localStorage. */
function getFromLocalStorage(key, defaultValue) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error(`Error parsing localStorage item "${key}":`, e);
        return defaultValue;
    }
}

/** Shows a dynamic notification message. */
function showNotification(message, type = 'info') {
    if (!state.notificationsEnabled) return;

    const notificationEl = document.createElement('div');
    notificationEl.className = `notification ${type}`; // Add type for styling (e.g., 'success', 'error', 'warning')
    notificationEl.textContent = message;

    // Use a dedicated container for notifications if available, otherwise body
    const container = DOM.notificationContainer || document.body;
    container.appendChild(notificationEl);

    // Fade in
    setTimeout(() => {
        notificationEl.classList.add('show');
    }, 50);

    // Fade out and remove
    setTimeout(() => {
        notificationEl.classList.remove('show');
        notificationEl.addEventListener('transitionend', () => notificationEl.remove(), { once: true });
    }, 3000);
}

// ---
// Initialization
// ---

document.addEventListener('DOMContentLoaded', () => {
    loadAndApplySettings(); // Load and apply settings first
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

function loadAndApplySettings() {
    state.isDarkMode = getFromLocalStorage('darkMode', false);
    state.notificationsEnabled = getFromLocalStorage('notifications', true);
    state.currentTheme = getFromLocalStorage('theme', 'default');
    state.fontSize = getFromLocalStorage('fontSize', 16);

    document.body.classList.toggle('dark-mode', state.isDarkMode);
    document.documentElement.setAttribute('data-theme', state.currentTheme);
    document.documentElement.style.fontSize = `${state.fontSize}px`;
}

// ---
// Tab Navigation
// ---

function initializeTabs() {
    DOM.tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            DOM.tabButtons.forEach(btn => btn.classList.remove('active'));
            DOM.tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Activate the first tab by default on load
    if (DOM.tabButtons.length > 0) {
        DOM.tabButtons[0].click();
    }
}

// ---
// Todo List
// ---

function initializeTodoList() {
    renderTodos();
    if (DOM.todoInput) {
        DOM.todoInput.addEventListener('keypress', handleTodoKeyPress);
    }
}

function handleTodoKeyPress(event) {
    if (event.key === 'Enter' && DOM.todoInput.value.trim()) {
        addTodo(DOM.todoInput.value.trim());
        DOM.todoInput.value = '';
    }
}

function addTodo(text) {
    state.todos.push({ text, completed: false });
    saveToLocalStorage('todos', state.todos);
    renderTodos();
    showNotification('Task added!', 'success');
}

function toggleTodo(index) {
    if (state.todos[index]) { // Check if todo exists
        state.todos[index].completed = !state.todos[index].completed;
        saveToLocalStorage('todos', state.todos);
        renderTodos();
        showNotification(`Task marked as ${state.todos[index].completed ? 'completed' : 'active'}.`);
    }
}

function deleteTodo(index) {
    if (state.todos[index]) { // Check if todo exists
        state.todos.splice(index, 1);
        saveToLocalStorage('todos', state.todos);
        renderTodos();
        showNotification('Task deleted!', 'warning');
    }
}

function filterTodos(filter) {
    const filtered = state.todos.filter(todo => {
        if (filter === 'active') return !todo.completed;
        if (filter === 'completed') return todo.completed;
        return true; // 'all'
    });
    renderTodos(filtered);
}

function renderTodos(todosToRender = state.todos) {
    if (!DOM.todoList) return;
    DOM.todoList.innerHTML = todosToRender.map((todo, index) => `
        <div class="todo-item ${todo.completed ? 'completed' : ''}">
            <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="window.toggleTodo(${index})">
            <span>${todo.text}</span>
            <button onclick="window.deleteTodo(${index})">×</button>
        </div>
    `).join('');
    updateTodoStats();
}

function updateTodoStats() {
    if (!DOM.todoStats) return;
    const total = state.todos.length;
    const completed = state.todos.filter(todo => todo.completed).length;
    DOM.todoStats.textContent = `Total: ${total} | Completed: ${completed}`;
}

// ---
// Calculator
// ---

function initializeCalculator() {
    if (DOM.calculator) {
        DOM.calculator.addEventListener('click', handleCalculatorClick);
        DOM.calcDisplay.textContent = '0'; // Initialize display
    }
}

function handleCalculatorClick(event) {
    if (!event.target.matches('button')) return;

    const value = event.target.textContent;

    switch (value) {
        case 'C':
            clearCalc();
            break;
        case '←':
            deleteLast();
            break;
        case '=':
            calculateResult();
            break;
        default:
            appendToCalc(value);
    }
}

function clearCalc() {
    if (DOM.calcDisplay) DOM.calcDisplay.textContent = '0';
}

function deleteLast() {
    if (DOM.calcDisplay) {
        DOM.calcDisplay.textContent = DOM.calcDisplay.textContent.slice(0, -1) || '0';
    }
}

function appendToCalc(value) {
    if (DOM.calcDisplay) {
        // Prevent leading zero if not a decimal or if current value is just '0'
        if (DOM.calcDisplay.textContent === '0' && value !== '.') {
            DOM.calcDisplay.textContent = value;
        } else if (value === '.' && DOM.calcDisplay.textContent.includes('.')) {
            return; // Allow only one decimal point
        } else {
            DOM.calcDisplay.textContent += value;
        }
    }
}

function calculateResult() {
    if (DOM.calcDisplay) {
        try {
            // Using Function constructor for safer evaluation than eval()
            const result = new Function('return ' + DOM.calcDisplay.textContent)();
            DOM.calcDisplay.textContent = Number.isFinite(result) ? result : 'Error';
        } catch (error) {
            DOM.calcDisplay.textContent = 'Error';
            showNotification('Invalid calculation.', 'error');
        }
    }
}

// ---
// Game (Tic-Tac-Toe)
// ---

function initializeGame() {
    renderGameBoard();
    if (DOM.gameBoard) {
        DOM.gameBoard.addEventListener('click', handleGameClick);
    }
    // Assume a reset button exists in your HTML with id 'reset-game-btn'
    const resetGameBtn = document.getElementById('reset-game-btn');
    if (resetGameBtn) {
        resetGameBtn.addEventListener('click', resetGame);
    }
}

function handleGameClick(event) {
    if (!event.target.matches('.game-cell') || state.gameState.gameOver) return;

    const index = Array.from(DOM.gameBoard.children).indexOf(event.target);
    if (state.gameState.board[index] === '') {
        state.gameState.board[index] = state.gameState.currentPlayer;
        renderGameBoard();

        if (checkWin()) {
            showNotification(`${state.gameState.currentPlayer} wins!`, 'success');
            state.gameState.gameOver = true;
        } else if (checkDraw()) {
            showNotification('Game is a draw!', 'info');
            state.gameState.gameOver = true;
        } else {
            state.gameState.currentPlayer = state.gameState.currentPlayer === 'X' ? 'O' : 'X';
            updateGameStatus();
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
        return state.gameState.board[a] &&
            state.gameState.board[a] === state.gameState.board[b] &&
            state.gameState.board[a] === state.gameState.board[c];
    });
}

function checkDraw() {
    return state.gameState.board.every(cell => cell !== '');
}

function resetGame() {
    state.gameState = {
        board: Array(9).fill(''),
        currentPlayer: 'X',
        gameOver: false
    };
    renderGameBoard();
    updateGameStatus();
    showNotification('Game reset!', 'info');
}

function renderGameBoard() {
    if (!DOM.gameBoard) return;
    DOM.gameBoard.innerHTML = state.gameState.board.map(cell => `<div class="game-cell">${cell}</div>`).join('');
}

function updateGameStatus() {
    if (DOM.gameStatus) {
        DOM.gameStatus.textContent = state.gameState.gameOver ? 'Game Over!' : `Current Player: ${state.gameState.currentPlayer}`;
    }
}

// ---
// Clock
// ---

function initializeClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    const now = new Date();
    if (DOM.currentTime) {
        DOM.currentTime.textContent = now.toLocaleTimeString();
    }
    if (DOM.currentDate) {
        DOM.currentDate.textContent = now.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// ---
// Notes
// ---

function initializeNotes() {
    renderNotes();
    if (DOM.notesInput) {
        // Use a dedicated save button for notes for better UX, or handle keypress
        // For now, retaining original keypress behavior and adding a save button
        DOM.notesInput.addEventListener('keypress', handleNoteKeyPress);
        const saveNoteButton = document.getElementById('save-note-btn'); // Assuming such a button exists
        if (saveNoteButton) {
            saveNoteButton.addEventListener('click', saveNote);
        }
    }
}

function handleNoteKeyPress(event) {
    if (event.key === 'Enter' && event.ctrlKey) { // Ctrl + Enter to save
        const text = DOM.notesInput.value.trim();
        if (text) {
            addNote(text);
            DOM.notesInput.value = '';
        }
    }
}

function addNote(text) {
    // Prevent duplicate notes
    if (state.notes.some(note => note.text === text)) {
        showNotification('Note already exists!', 'warning');
        return;
    }

    state.notes.push({
        text,
        timestamp: new Date().toISOString()
    });
    saveToLocalStorage('notes', state.notes);
    renderNotes();
    showNotification('Note added!', 'success');
}

function deleteNote(index) {
    if (state.notes[index]) { // Check if note exists
        state.notes.splice(index, 1);
        saveToLocalStorage('notes', state.notes);
        renderNotes();
        showNotification('Note deleted!', 'warning');
    }
}

function renderNotes() {
    if (!DOM.notesList) return;
    // Render in reverse to show newest notes first
    DOM.notesList.innerHTML = state.notes.map((note, index) => `
        <div class="note-item">
            <p>${note.text}</p>
            <small>${new Date(note.timestamp).toLocaleString()}</small>
            <button onclick="window.deleteNote(${index})">×</button>
        </div>
    `).reverse().join('');
}

function saveNote() { // This function can be tied to a dedicated save button
    const text = DOM.notesInput.value.trim();
    if (text) {
        addNote(text);
        DOM.notesInput.value = '';
    } else {
        showNotification('Note cannot be empty.', 'error');
    }
}

// ---
// Settings
// ---

function initializeSettings() {
    if (DOM.darkModeToggle) {
        DOM.darkModeToggle.checked = state.isDarkMode;
        DOM.darkModeToggle.addEventListener('change', toggleDarkMode);
    }
    if (DOM.notificationsToggle) {
        DOM.notificationsToggle.checked = state.notificationsEnabled;
        DOM.notificationsToggle.addEventListener('change', toggleNotifications);
    }
    if (DOM.themeSelector) {
        DOM.themeSelector.value = state.currentTheme;
        DOM.themeSelector.addEventListener('change', changeTheme);
    }
    if (DOM.fontSizeSlider) {
        DOM.fontSizeSlider.value = state.fontSize;
        if (DOM.fontSizeValue) { // Update displayed font size value
            DOM.fontSizeValue.textContent = state.fontSize;
        }
        DOM.fontSizeSlider.addEventListener('input', updateFontSizeDisplay); // Live update slider value
        DOM.fontSizeSlider.addEventListener('change', changeFontSize); // Save on change
    }
}

function toggleDarkMode(event) {
    state.isDarkMode = event.target.checked;
    document.body.classList.toggle('dark-mode', state.isDarkMode);
    saveToLocalStorage('darkMode', state.isDarkMode);
    showNotification(`Dark mode ${state.isDarkMode ? 'enabled' : 'disabled'}.`, 'theme'); // Use 'theme' type for style
}

function toggleNotifications(event) {
    state.notificationsEnabled = event.target.checked;
    saveToLocalStorage('notifications', state.notificationsEnabled);
    showNotification(`Notifications ${state.notificationsEnabled ? 'enabled' : 'disabled'}.`);
}

function changeTheme(event) {
    state.currentTheme = event.target.value;
    document.documentElement.setAttribute('data-theme', state.currentTheme);
    saveToLocalStorage('theme', state.currentTheme);
    showNotification(`Theme set to ${state.currentTheme}.`, 'theme');
}

function updateFontSizeDisplay(event) {
    if (DOM.fontSizeValue) {
        DOM.fontSizeValue.textContent = event.target.value;
    }
}

function changeFontSize(event) {
    state.fontSize = parseInt(event.target.value);
    document.documentElement.style.fontSize = `${state.fontSize}px`;
    saveToLocalStorage('fontSize', state.fontSize);
    showNotification(`Font size set to ${state.fontSize}px.`);
}

// ---
// Calendar
// ---

function initializeCalendar() {
    renderCalendar(state.currentCalendarDate);

    if (DOM.prevMonthBtn) {
        DOM.prevMonthBtn.addEventListener('click', () => navigateCalendarMonth(-1));
    }
    if (DOM.nextMonthBtn) {
        DOM.nextMonthBtn.addEventListener('click', () => navigateCalendarMonth(1));
    }
    if (DOM.eventForm) {
        DOM.eventForm.addEventListener('submit', addEvent);
    }
    if (DOM.eventModal) {
        // Close modal when clicking outside of it
        DOM.eventModal.addEventListener('click', (e) => {
            if (e.target === DOM.eventModal) {
                closeEventModal();
            }
        });
    }
}

function navigateCalendarMonth(offset) {
    state.currentCalendarDate.setMonth(state.currentCalendarDate.getMonth() + offset);
    renderCalendar(state.currentCalendarDate);
}

function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0); // Last day of current month

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    if (DOM.calendarMonthDisplay) {
        DOM.calendarMonthDisplay.textContent = `${monthNames[month]} ${year}`;
    }

    let daysHtml = '';
    // Add empty days for the beginning of the month (offset for day of week)
    const startDayOfWeek = firstDay.getDay(); // 0 (Sunday) to 6 (Saturday)
    for (let i = 0; i < startDayOfWeek; i++) {
        daysHtml += '<div class="calendar-day empty"></div>';
    }

    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const currentDayFullDate = new Date(year, month, day);
        const hasEvents = state.events.some(event => {
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === currentDayFullDate.toDateString(); // Compare dates only
        });

        const isToday = currentDayFullDate.toDateString() === new Date().toDateString() ? 'today' : '';

        daysHtml += `
            <div class="calendar-day ${hasEvents ? 'has-events' : ''} ${isToday}"
                 onclick="window.showEventModal('${year}-${month + 1}-${day}')">
                ${day}
            </div>
        `;
    }

    if (DOM.calendarDays) {
        DOM.calendarDays.innerHTML = daysHtml;
    }
    renderEventsForMonth(date);
}

function renderEventsForMonth(date) {
    const monthEvents = state.events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getMonth() === date.getMonth() &&
               eventDate.getFullYear() === date.getFullYear();
    }).sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort events by date

    if (!DOM.eventList) return;
    if (monthEvents.length === 0) {
        DOM.eventList.innerHTML = '<p class="no-events-message">No events for this month.</p>';
    } else {
        DOM.eventList.innerHTML = monthEvents.map(event => `
            <div class="event-item">
                <i class="fas fa-calendar-alt"></i> <div>
                    <h4>${event.title}</h4>
                    <p>${new Date(event.date).toLocaleDateString()} ${event.description ? ` - ${event.description}` : ''}</p>
                </div>
            </div>
        `).join('');
    }
}

function showEventModal(dateString) {
    if (DOM.eventModal && DOM.eventForm) {
        DOM.eventModal.style.display = 'flex';
        DOM.eventForm.dataset.date = dateString; // Store the selected date
        DOM.eventForm.reset(); // Clear previous form data

        // Optionally pre-fill a date input field in the modal form if it exists
        const dateInputField = DOM.eventForm.querySelector('[name="event-date"]');
        if (dateInputField) {
            dateInputField.value = dateString;
        }
    }
}

function closeEventModal() {
    if (DOM.eventModal) {
        DOM.eventModal.style.display = 'none';
    }
}

function addEvent(event) {
    event.preventDefault(); // Prevent page reload
    const formData = new FormData(DOM.eventForm);
    const title = formData.get('title').trim();
    const date = DOM.eventForm.dataset.date; // Get date from dataset
    const description = formData.get('description').trim();

    if (!title || !date) {
        showNotification('Please fill in the event title and date.', 'error');
        return;
    }

    state.events.push({ title, date, description });
    saveToLocalStorage('events', state.events);
    renderCalendar(new Date(date)); // Re-render calendar for the month of the new event
    closeEventModal();
    showNotification('Event added successfully!', 'success');
}

// ---
// Search
// ---

function initializeSearch() {
    if (DOM.searchBtn) {
        DOM.searchBtn.addEventListener('click', handleSearch);
    }
    if (DOM.searchInput) {
        DOM.searchInput.addEventListener('keypress', event => {
            if (event.key === 'Enter') handleSearch();
        });
    }
}

function handleSearch() {
    const query = DOM.searchInput.value.toLowerCase().trim();
    // Assuming a search results container exists in your HTML
    let searchResultsContainer = document.querySelector('.search-results-container');
    if (!searchResultsContainer) {
        searchResultsContainer = document.createElement('div');
        searchResultsContainer.className = 'search-results-container';
        // Append it to a suitable parent, e.g., the search tab content area
        document.getElementById('search-tab-content').appendChild(searchResultsContainer);
    }
    searchResultsContainer.innerHTML = ''; // Clear previous results

    if (!query) {
        showNotification('Please enter a search term.', 'info');
        return;
    }

    const results = [];

    // Search in todos
    state.todos.forEach(todo => {
        if (todo.text.toLowerCase().includes(query)) {
            results.push({ type: 'Todo', content: todo.text, link: '#todo' }); // Link to relevant tab
        }
    });

    // Search in notes
    state.notes.forEach(note => {
        if (note.text.toLowerCase().includes(query)) {
            results.push({ type: 'Note', content: note.text, link: '#notes' });
        }
    });

    // Search in events
    state.events.forEach(event => {
        if (event.title.toLowerCase().includes(query) || event.description.toLowerCase().includes(query)) {
            results.push({ type: 'Event', content: `${event.title} (${new Date(event.date).toLocaleDateString()})`, link: '#calendar' });
        }
    });

    displaySearchResults(results, searchResultsContainer);
}

function displaySearchResults(results, container) {
    if (results.length === 0) {
        container.innerHTML = '<p class="no-results-found">No results found.</p>';
    } else {
        container.innerHTML = results.map(result => `
            <div class="search-result-item">
                <span class="result-type">${result.type}</span>
                <p>${result.content}</p>
                <a href="${result.link}" onclick="activateTabByTarget('${result.link.substring(1)}')">View</a>
            </div>
        `).join('');
    }
}

// Helper to activate a tab after search
function activateTabByTarget(targetId) {
    const targetButton = document.querySelector(`.tab-button[data-target="${targetId}"]`);
    if (targetButton) {
        targetButton.click();
    }
}

// ---
// Sidebar
// ---

function initializeSidebar() {
    if (DOM.sidebarToggle) {
        DOM.sidebarToggle.addEventListener('click', toggleSidebar);
    }
}

function toggleSidebar() {
    if (DOM.sidebar) {
        DOM.sidebar.classList.toggle('active');
    }
}

// ---
// Quick Access
// ---

function initializeQuickAccess() {
    if (DOM.scrollTopBtn) {
        DOM.scrollTopBtn.addEventListener('click', scrollToTop);
    }
    if (DOM.fullscreenBtn) {
        DOM.fullscreenBtn.addEventListener('click', toggleFullscreen);
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error('Fullscreen error:', err);
            showNotification('Fullscreen not supported or allowed.', 'error');
        });
    } else {
        document.exitFullscreen().catch(err => {
            console.error('Exit fullscreen error:', err);
        });
    }
}

// ---
// Loading Screen
// ---

function hideLoadingScreen() {
    if (DOM.loadingScreen) {
        DOM.loadingScreen.style.opacity = '0';
        setTimeout(() => {
            DOM.loadingScreen.style.display = 'none';
            DOM.loadingScreen.remove(); // Clean up the element after fading out
        }, 500); // Matches the CSS transition duration
    }
}

// ---
// Optimized Particles Effect
// ---
let cleanupParticlesFn = null; // Store the cleanup function globally

function initializeParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas'; // Ensure unique ID
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none'; // Allow clicks to pass through
    canvas.style.zIndex = '-1'; // Place behind other content
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;
    let isPageVisible = true; // Renamed to avoid conflict with `isVisible` in `state`

    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            if (entry.target === document.body) { // Ensure it's observing the body or relevant container
                resizeCanvas();
            }
        }
    });
    resizeObserver.observe(document.body);

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);
        initParticles(); // Re-initialize particles on resize
    }

    function createParticle() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1, // Smaller particles
            speedX: (Math.random() - 0.5) * 0.5, // Slower movement
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.2
        };
    }

    function initParticles() {
        particles = [];
        const particleCount = Math.min(50, Math.floor((canvas.width * canvas.height) / 15000)); // Dynamic count
        for (let i = 0; i < particleCount; i++) {
            particles.push(createParticle());
        }
    }

    function animateParticles() {
        if (!isPageVisible) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            // Wrap particles around the screen
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            if (particle.y > canvas.height) particle.y = 0;

            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`; // White particles for contrast
            ctx.fill();
        });

        animationFrameId = requestAnimationFrame(animateParticles);
    }

    document.addEventListener('visibilitychange', () => {
        isPageVisible = !document.hidden;
        if (isPageVisible) {
            animateParticles();
        } else {
            cancelAnimationFrame(animationFrameId);
        }
    });

    // Cleanup function
    function cleanup() {
        cancelAnimationFrame(animationFrameId);
        resizeObserver.disconnect();
        if (canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }
    }

    // Initial setup
    resizeCanvas();
    initParticles();
    animateParticles();

    return cleanup; // Return the cleanup function
}

// Initialize particles and store the cleanup function
cleanupParticlesFn = initializeParticles();

// Cleanup on page unload
window.addEventListener('beforeunload', cleanupParticlesFn);


// ---
// Global Event Listeners & Exports
// ---

window.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        closeEventModal(); // Use specific modal close function
    }
});

// Export functions to global scope for HTML `onclick` attributes
window.scrollToTop = scrollToTop;
window.toggleFullscreen = toggleFullscreen;
window.toggleSidebar = toggleSidebar;
// window.toggleTheme is now handled by toggleDarkMode in the settings section
window.previousMonth = () => navigateCalendarMonth(-1);
window.nextMonth = () => navigateCalendarMonth(1);
window.closeModal = closeEventModal; // Alias for backward compatibility if needed
window.addEvent = addEvent;
window.showEventModal = showEventModal;
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;
window.deleteNote = deleteNote;
window.resetGame = resetGame;
window.clearCalc = clearCalc;
window.deleteLast = deleteLast;
window.appendToCalc = appendToCalc;
window.calculateResult = calculateResult;
window.saveNote = saveNote; // For notes save button
window.filterTodos = filterTodos; // Expose filter function