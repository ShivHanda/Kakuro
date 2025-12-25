// --- Global State ---
let kakuroData = [];
let gridSize = 0;
let selectedCell = null; // {r, c}
let userGrid = {}; // To store user inputs: "r,c" -> value

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    setupEventListeners();
});

async function initGame() {
    try {
        // 1. Fetch JSON (with cache busting)
        const response = await fetch('daily-kakuro.json?t=' + new Date().getTime());
        if (!response.ok) throw new Error("File not found");
        
        const gameData = await response.json();

        // 2. Set Basic Info
        document.getElementById('date-display').textContent = gameData.date || "Today's Puzzle";
        gridSize = gameData.board_size;

        // 3. Transform Data for easier access
        // Hum array ko ek object/map mein convert kar lenge taaki "row,col" se dhoond sakein
        kakuroData = {};
        gameData.puzzle.forEach(cell => {
            kakuroData[`${cell.row},${cell.col}`] = cell;
        });

        // 4. Render
        renderKakuroBoard();

    } catch (error) {
        console.error("Failed to load puzzle:", error);
        document.getElementById('date-display').textContent = "Error loading puzzle. Check console.";
    }
}

// --- Rendering Logic ---
function renderKakuroBoard() {
    const board = document.getElementById('game-board');
    board.innerHTML = ''; // Clear previous

    // 1. Set CSS Grid Columns dynamically based on size
    board.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

    // 2. Loop through every cell position (0,0 to N,N)
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            
            const cellKey = `${r},${c}`;
            const cellData = kakuroData[cellKey];
            const cellDiv = document.createElement('div');
            
            cellDiv.classList.add('cell');
            cellDiv.dataset.r = r;
            cellDiv.dataset.c = c;

            // Agar JSON mein is cell ka data nahi hai, to ise 'Block' maan lo (Safety fallback)
            if (!cellData) {
                cellDiv.classList.add('block');
                board.appendChild(cellDiv);
                continue;
            }

            // --- TYPE 1: SOLID BLOCK ---
            if (cellData.type === 'block') {
                cellDiv.classList.add('block');
            } 
            
            // --- TYPE 2: CLUE CELL (The Diagonal One) ---
            else if (cellData.type === 'clue') {
                cellDiv.classList.add('clue');
                
                // Add Down Clue (Bottom Left)
                if (cellData.down && cellData.down > 0) {
                    const span = document.createElement('span');
                    span.className = 'clue-val clue-down';
                    span.textContent = cellData.down;
                    cellDiv.appendChild(span);
                }

                // Add Right Clue (Top Right)
                if (cellData.right && cellData.right > 0) {
                    const span = document.createElement('span');
                    span.className = 'clue-val clue-right';
                    span.textContent = cellData.right;
                    cellDiv.appendChild(span);
                }
            } 
            
            // --- TYPE 3: INPUT CELL (Playable) ---
            else if (cellData.type === 'empty') {
                cellDiv.classList.add('input');
                // Click event sirf input cells ke liye
                cellDiv.addEventListener('click', () => selectCell(r, c));
            }

            board.appendChild(cellDiv);
        }
    }
}

// --- Interaction Logic ---
function selectCell(r, c) {
    // Purana selection hatao
    if (selectedCell) {
        const prev = document.querySelector(`.cell[data-r='${selectedCell.r}'][data-c='${selectedCell.c}']`);
        if (prev) prev.classList.remove('selected');
    }

    // Naya selection lagao
    selectedCell = { r, c };
    const current = document.querySelector(`.cell[data-r='${r}'][data-c='${c}']`);
    if (current) current.classList.add('selected');
}

function fillNumber(num) {
    if (!selectedCell) return;

    const { r, c } = selectedCell;
    const key = `${r},${c}`;
    
    // Update State
    userGrid[key] = num;

    // Update UI
    const cell = document.querySelector(`.cell[data-r='${r}'][data-c='${c}']`);
    if (cell) {
        cell.textContent = num;
        cell.classList.remove('error'); // Clear errors on new input
    }
}

function deleteNumber() {
    if (!selectedCell) return;
    const { r, c } = selectedCell;
    const key = `${r},${c}`;
    
    delete userGrid[key];
    
    const cell = document.querySelector(`.cell[data-r='${r}'][data-c='${c}']`);
    if (cell) cell.textContent = '';
}

// --- Event Listeners ---
function setupEventListeners() {
    // 1. Mobile Numpad
    document.querySelectorAll('.num-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // Agar "Action" button hai (like Backspace)
            if (btn.id === 'clear-btn') {
                deleteNumber();
            } else {
                fillNumber(parseInt(btn.dataset.value));
            }
        });
    });

    // 2. Desktop Keyboard
    document.addEventListener('keydown', (e) => {
        const key = e.key;
        if (key >= '1' && key <= '9') {
            fillNumber(parseInt(key));
        } else if (key === 'Backspace' || key === 'Delete') {
            deleteNumber();
        } 
        // Optional: Arrow keys navigation can be added here
    });

    // 3. Extra Actions
    // Abhi ke liye bas alert daal rahe hain kyunki validation logic complex hai
   // NEW CODE
    const checkBtn = document.getElementById('check-btn');
    if(checkBtn) {
        checkBtn.addEventListener('click', () => {
            validateBoard();
        });
    }
}

// --- Validation Logic (Paste at the bottom) ---

function validateBoard() {
    let errorFound = false;
    let isFull = true;
    
    // Reset visual errors first
    document.querySelectorAll('.cell.input').forEach(c => c.classList.remove('error'));

    // Iterate over all CLUE cells to check their sums
    for (const key in kakuroData) {
        const cell = kakuroData[key];
        if (cell.type !== 'clue') continue;

        // 1. Check "Down" Clue
        if (cell.down > 0) {
            validateRun(cell.row, cell.col, 'down', cell.down);
        }

        // 2. Check "Right" Clue
        if (cell.right > 0) {
            validateRun(cell.row, cell.col, 'right', cell.right);
        }
    }

    // Helper to validate a specific run (row or column segment)
    function validateRun(startR, startC, direction, targetSum) {
        let currentSum = 0;
        let cellsInRun = [];
        let numbersSeen = new Set();
        let runIsFull = true;

        let r = startR;
        let c = startC;

        // Walk through the run until we hit a block or edge
        while (true) {
            if (direction === 'down') r++;
            else c++;

            const nextKey = `${r},${c}`;
            const nextCellData = kakuroData[nextKey];

            // Stop if edge or not an input cell (block/clue)
            if (!nextCellData || nextCellData.type !== 'empty') break;

            // Get user value
            const val = userGrid[nextKey];
            const cellDiv = document.querySelector(`.cell[data-r='${r}'][data-c='${c}']`);
            
            cellsInRun.push(cellDiv);

            if (!val) {
                runIsFull = false;
                isFull = false;
            } else {
                currentSum += val;
                // Check Duplicates (Kakuro rule: No repeats in a sum)
                if (numbersSeen.has(val)) {
                    cellDiv.classList.add('error');
                    errorFound = true;
                }
                numbersSeen.add(val);
            }
        }

        // Check Sum (Only if run is fully filled)
        if (runIsFull) {
            if (currentSum !== targetSum) {
                // Mark all cells in this run as error
                cellsInRun.forEach(div => div.classList.add('error'));
                errorFound = true;
            }
        } else {
            // Optional: Check if sum already exceeded target while partially filled
            if (currentSum > targetSum) {
                cellsInRun.forEach(div => {
                    if(div.textContent) div.classList.add('error');
                });
                errorFound = true;
            }
        }
    }

    // If board is full and no errors found -> WIN!
    if (isFull && !errorFound) {
        showWin();
    } else if (errorFound) {
        // Optional shake animation or alert
        console.log("Errors found");
    }
}

function showWin() {
    const overlay = document.getElementById('win-overlay');
    // Stop timer logic here if you added a timer
    document.getElementById('final-time').textContent = "Great Job!"; 
    overlay.classList.remove('hidden');
    
    // Close button logic
    document.getElementById('close-modal-btn').addEventListener('click', () => {
        overlay.classList.add('hidden');
    });
    
    // Confetti launch (Agar aapne wo script add ki hai)
    if (window.confetti) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
}
