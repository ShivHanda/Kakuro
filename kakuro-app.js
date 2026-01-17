// --- Global State ---
let timerInterval;
let secondsElapsed = 0;
let isGameActive = true; // Ensure this is initialized
let hasStarted = false;  // Track if user clicked yet
let kakuroData = {};
let solutionGrid = []; 
let gridSize = 0;
let selectedCell = null; 
let userGrid = {}; 

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initThemeLogic(); // Sudoku Style Theme Init
    initGame();       // Load Game
    setupEventListeners();
});

// --- THEME LOGIC (Exact Sudoku Style) ---
function initThemeLogic() {
    const checkbox = document.getElementById('checkbox');
    const body = document.body;
    const storedTheme = localStorage.getItem('kakuro-theme'); // Unique key

    // 1. Check LocalStorage on Load
    if (storedTheme === 'dark') {
        body.classList.add('dark-mode');
        checkbox.checked = true;
    }

    // 2. Listener for Toggle
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            body.classList.add('dark-mode');
            localStorage.setItem('kakuro-theme', 'dark');
        } else {
            body.classList.remove('dark-mode');
            localStorage.setItem('kakuro-theme', 'light');
        }
    });
}

// --- GAME LOGIC ---
async function initGame() {
    try {
        const response = await fetch('daily-kakuro.json?t=' + new Date().getTime());
        if (!response.ok) throw new Error("File not found. Run generate.py!");
        
        const gameData = await response.json();
        document.getElementById('date-display').textContent = formatDate(gameData.date);
        stopTimer();
        secondsElapsed = 0;
        document.getElementById('timer').textContent = "00:00";
        hasStarted = false;
        isGameActive = true;
        gridSize = gameData.board_size;
        solutionGrid = gameData.solution;

        // Map data for easy access
        kakuroData = {};
        gameData.puzzle.forEach(cell => {
            kakuroData[`${cell.row},${cell.col}`] = cell;
        });

        renderKakuroBoard();

    } catch (error) {
        console.error(error);
        document.getElementById('date-display').textContent = "Error: Run generate.py";
    }
}

function renderKakuroBoard() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const cellKey = `${r},${c}`;
            const cellData = kakuroData[cellKey];
            const cellDiv = document.createElement('div');
            
            cellDiv.classList.add('cell');
            cellDiv.dataset.r = r;
            cellDiv.dataset.c = c;

            if (!cellData) {
                cellDiv.classList.add('block');
                board.appendChild(cellDiv);
                continue;
            }

            if (cellData.type === 'block') {
                cellDiv.classList.add('block');
            } 
            else if (cellData.type === 'clue') {
                cellDiv.classList.add('clue');
                if (cellData.down > 0) {
                    const s = document.createElement('span');
                    s.className = 'clue-val clue-down';
                    s.textContent = cellData.down;
                    cellDiv.appendChild(s);
                }
                if (cellData.right > 0) {
                    const s = document.createElement('span');
                    s.className = 'clue-val clue-right';
                    s.textContent = cellData.right;
                    cellDiv.appendChild(s);
                }
            } 
            else if (cellData.type === 'empty') {
                cellDiv.classList.add('input');
                cellDiv.addEventListener('click', () => selectCell(r, c));
            }
            board.appendChild(cellDiv);
        }
    }
}

function selectCell(r, c) {
    if (!isGameActive) return;
    if (!hasStarted) {
        hasStarted = true;
        startTimer();
    }
    if (selectedCell) {
        const prev = document.querySelector(`.cell[data-r='${selectedCell.r}'][data-c='${selectedCell.c}']`);
        if (prev) prev.classList.remove('selected');
    }
    selectedCell = { r, c };
    const current = document.querySelector(`.cell[data-r='${r}'][data-c='${c}']`);
    if (current) current.classList.add('selected');
}

function fillNumber(num) {
    if (!selectedCell) return;
    const { r, c } = selectedCell;
    const key = `${r},${c}`;
    
    // UI Update
    const cell = document.querySelector(`.cell[data-r='${r}'][data-c='${c}']`);
    if (cell) {
        cell.textContent = num;
        
        // Immediate Validation
        const correctVal = solutionGrid[r][c];
        if (num !== correctVal) {
            cell.classList.add('error');
            userGrid[key] = num; 
        } else {
            cell.classList.remove('error');
            userGrid[key] = num;
            checkWinCondition();
        }
    }
}

function deleteNumber() {
    if (!selectedCell) return;
    const { r, c } = selectedCell;
    const key = `${r},${c}`;
    delete userGrid[key];
    
    const cell = document.querySelector(`.cell[data-r='${r}'][data-c='${c}']`);
    if (cell) {
        cell.textContent = '';
        cell.classList.remove('error');
    }
}

function checkWinCondition() {
    let totalNeeded = 0;
    for (let r=0; r<gridSize; r++) {
        for (let c=0; c<gridSize; c++) {
            if (solutionGrid[r][c] !== null && solutionGrid[r][c] > 0) {
                totalNeeded++;
            }
        }
    }

    let correctCount = 0;
    for (const key in userGrid) {
        const [r, c] = key.split(',').map(Number);
        if (userGrid[key] === solutionGrid[r][c]) correctCount++;
    }

    if (correctCount === totalNeeded) {
        isGameActive = false;
        stopTimer();
        document.getElementById('final-time').textContent = document.getElementById('timer').textContent;
        const overlay = document.getElementById('win-overlay');
        overlay.classList.remove('hidden');
        if (window.confetti) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        document.getElementById('close-modal-btn').onclick = () => location.reload();
    }
}

function revealSolution() {
    if (!solutionGrid || solutionGrid.length === 0) return;

    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const val = solutionGrid[r][c];
            if (val !== null) {
                const cell = document.querySelector(`.cell[data-r='${r}'][data-c='${c}']`);
                if (cell && cell.classList.contains('input')) {
                    cell.textContent = val;
                    cell.classList.remove('error');
                    userGrid[`${r},${c}`] = val;
                }
            }
        }
    }
}

function setupEventListeners() {
    document.querySelectorAll('.num-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (btn.id === 'clear-btn') deleteNumber();
            else fillNumber(parseInt(btn.dataset.value));
        });
    });

    document.addEventListener('keydown', (e) => {
        const key = e.key;
        if (key >= '1' && key <= '9') fillNumber(parseInt(key));
        else if (key === 'Backspace' || key === 'Delete') deleteNumber();
    });

    const solveBtn = document.getElementById('solve-btn');
    if (solveBtn) solveBtn.addEventListener('click', revealSolution);
}

function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        secondsElapsed++;
        const mins = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
        const secs = (secondsElapsed % 60).toString().padStart(2, '0');
        document.getElementById('timer').textContent = `${mins}:${secs}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function formatDate(isoDate) {
    // Handles "YYYY-MM-DD" string from JSON
    if(!isoDate) return "Today's Puzzle";
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(isoDate).toLocaleDateString(undefined, options);
}
