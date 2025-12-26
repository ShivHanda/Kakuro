// --- Global State ---
let kakuroData = {};
let solutionGrid = []; // Stores the correct answers
let gridSize = 0;
let selectedCell = null; // {r, c}
let userGrid = {}; // User's input

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    setupEventListeners();
});

async function initGame() {
    try {
        const response = await fetch('daily-kakuro.json?t=' + new Date().getTime());
        if (!response.ok) throw new Error("File not found");
        
        const gameData = await response.json();

        document.getElementById('date-display').textContent = gameData.date || "Today's Puzzle";
        gridSize = gameData.board_size;
        
        // 1. Store Solution separately for validation
        solutionGrid = gameData.solution;

        // 2. Prepare Board Data
        kakuroData = {};
        gameData.puzzle.forEach(cell => {
            kakuroData[`${cell.row},${cell.col}`] = cell;
        });

        renderKakuroBoard();

    } catch (error) {
        console.error("Failed to load puzzle:", error);
        document.getElementById('date-display').textContent = "Run generate.py first!";
    }
}

// --- Rendering ---
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
                // Down = Column Clue
                if (cellData.down > 0) {
                    const span = document.createElement('span');
                    span.className = 'clue-val clue-down';
                    span.textContent = cellData.down;
                    cellDiv.appendChild(span);
                }
                // Right = Row Clue
                if (cellData.right > 0) {
                    const span = document.createElement('span');
                    span.className = 'clue-val clue-right';
                    span.textContent = cellData.right;
                    cellDiv.appendChild(span);
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

// --- Interaction ---
function selectCell(r, c) {
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
    
    // 1. Update UI
    const cell = document.querySelector(`.cell[data-r='${r}'][data-c='${c}']`);
    if (cell) {
        cell.textContent = num;
        
        // 2. IMMEDIATE VALIDATION against Solution Grid
        // Solution grid mein row 'r' aur col 'c' pe kya value hai?
        const correctValue = solutionGrid[r][c];

        if (num !== correctValue) {
            // Wrong number
            cell.classList.add('error');
            // User grid me update karein ya nahi, logic pe depend karta hai.
            // Hum save kar lete hain but valid nahi maante.
            userGrid[key] = num; 
        } else {
            // Correct number
            cell.classList.remove('error');
            userGrid[key] = num;
            
            // 3. Check Win Condition only if number is correct
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

// --- Win Condition ---
function checkWinCondition() {
    // Count total expected inputs
    let totalInputsNeeded = 0;
    for (let r=0; r<gridSize; r++) {
        for (let c=0; c<gridSize; c++) {
            if (solutionGrid[r][c] !== null && solutionGrid[r][c] > 0) {
                totalInputsNeeded++;
            }
        }
    }

    // Check if user has filled all correctly
    let correctCount = 0;
    for (const key in userGrid) {
        const [r, c] = key.split(',').map(Number);
        if (userGrid[key] === solutionGrid[r][c]) {
            correctCount++;
        }
    }

    if (correctCount === totalInputsNeeded) {
        triggerWin();
    }
}

function triggerWin() {
    const overlay = document.getElementById('win-overlay');
    overlay.classList.remove('hidden');
    
    // Confetti
    if (window.confetti) {
        confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 } });
    }

    document.getElementById('close-modal-btn').onclick = () => location.reload();
}

// --- Show Solution Logic ---
function revealSolution() {
    // Confirm before showing? Nah, direct dikhate hain.
    if (!solutionGrid || solutionGrid.length === 0) return;

    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const val = solutionGrid[r][c];
            // Agar ye cell input cell hai (value > 0)
            if (val !== null) {
                const cell = document.querySelector(`.cell[data-r='${r}'][data-c='${c}']`);
                if (cell && cell.classList.contains('input')) {
                    cell.textContent = val;
                    cell.classList.remove('error');
                    userGrid[`${r},${c}`] = val; // State update
                }
            }
        }
    }
    // Disable interaction maybe? Or just let it be.
    // Trigger confetti for fun?
    // checkWinCondition(); // Ye win trigger kar dega
}

// --- Event Listeners ---
function setupEventListeners() {
    // Numpad (Mobile)
    document.querySelectorAll('.num-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (btn.id === 'clear-btn') deleteNumber();
            else fillNumber(parseInt(btn.dataset.value));
        });
    });

    // Keyboard (Desktop)
    document.addEventListener('keydown', (e) => {
        const key = e.key;
        if (key >= '1' && key <= '9') fillNumber(parseInt(key));
        else if (key === 'Backspace' || key === 'Delete') deleteNumber();
    });

    // Show Solution Button
    const solveBtn = document.getElementById('solve-btn');
    if (solveBtn) {
        solveBtn.addEventListener('click', revealSolution);
    }
}
