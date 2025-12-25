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
    const checkBtn = document.getElementById('check-btn');
    if(checkBtn) {
        checkBtn.addEventListener('click', () => {
            alert("Validation logic will be added in the next step!");
        });
    }
}
