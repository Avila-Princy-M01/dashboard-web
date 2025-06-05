// Tab functionality
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        // Remove active class from all tabs and buttons
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        // Add active class to clicked button and corresponding tab
        btn.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});

// Clock functionality
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();
    document.getElementById('current-time').innerHTML = `
        <div style="font-size: 2rem; font-weight: bold; color: #667eea;">${timeString}</div>
        <div style="color: #666; margin-top: 10px;">${dateString}</div>
    `;
}
setInterval(updateTime, 1000);
updateTime();

// Calculator functionality
let calcDisplay = document.getElementById('calc-display');
let currentInput = '0';
let shouldResetDisplay = false;

function appendToCalc(value) {
    if (shouldResetDisplay) {
        currentInput = '';
        shouldResetDisplay = false;
    }
    if (currentInput === '0' && value !== '.') {
        currentInput = value;
    } else {
        currentInput += value;
    }
    calcDisplay.textContent = currentInput;
}

function clearCalc() {
    currentInput = '0';
    calcDisplay.textContent = currentInput;
}

function deleteLast() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    calcDisplay.textContent = currentInput;
}

function calculateResult() {
    try {
        const result = eval(currentInput.replace('×', '*'));
        currentInput = result.toString();
        calcDisplay.textContent = currentInput;
        shouldResetDisplay = true;
    } catch (error) {
        calcDisplay.textContent = 'Error';
        currentInput = '0';
        shouldResetDisplay = true;
    }
}

// Todo functionality
let todos = [];
let todoIdCounter = 0;

function addTodo() {
    const input = document.getElementById('todo-input');
    const text = input.value.trim();
    if (text) {
        todos.push({
            id: todoIdCounter++,
            text: text,
            completed: false
        });
        input.value = '';
        renderTodos();
    }
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        renderTodos();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    renderTodos();
}

function renderTodos() {
    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = '';
    todos.forEach(todo => {
        const todoItem = document.createElement('div');
        todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        todoItem.innerHTML = `
            <span>${todo.text}</span>
            <div class="todo-actions">
                <button class="btn btn-primary" onclick="toggleTodo(${todo.id})">
                    ${todo.completed ? 'Undo' : 'Done'}
                </button>
                <button class="btn btn-danger" onclick="deleteTodo(${todo.id})">Delete</button>
            </div>
        `;
        todoList.appendChild(todoItem);
    });
}

function handleTodoKeyPress(event) {
    if (event.key === 'Enter') {
        addTodo();
    }
}

// Tic Tac Toe functionality
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;

function initializeGame() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'game-cell';
        cell.onclick = () => makeMove(i);
        board.appendChild(cell);
    }
    updateGameStatus();
}

function makeMove(index) {
    if (gameBoard[index] === '' && gameActive) {
        gameBoard[index] = currentPlayer;
        updateBoard();
        if (checkWinner()) {
            document.getElementById('game-status').textContent = `Player ${currentPlayer} wins!`;
            gameActive = false;
        } else if (gameBoard.every(cell => cell !== '')) {
            document.getElementById('game-status').textContent = "It's a draw!";
            gameActive = false;
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            updateGameStatus();
        }
    }
}

function updateBoard() {
    const cells = document.querySelectorAll('.game-cell');
    cells.forEach((cell, index) => {
        cell.textContent = gameBoard[index];
        cell.style.color = gameBoard[index] === 'X' ? '#667eea' : '#48bb78';
    });
}

function updateGameStatus() {
    if (gameActive) {
        document.getElementById('game-status').textContent = `Player ${currentPlayer}'s turn`;
    }
}

function checkWinner() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];
    return winPatterns.some(pattern => {
        const [a, b, c] = pattern;
        return gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c];
    });
}

function resetGame() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    initializeGame();
}

// Initialize game on load
initializeGame();

// Animate progress bars on load
window.addEventListener('load', () => {
    setTimeout(() => {
        document.querySelectorAll('.progress-fill').forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = width;
            }, 100);
        });
    }, 500);
}); 