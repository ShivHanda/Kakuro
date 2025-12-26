import json
import random
from datetime import datetime

# --- CONFIGURATION ---
GRID_SIZE = 5

# 0 = Block (Black cell)
# 1 = Playable Cell (White cell)
# Ye bas shapes hain. Numbers computer khud soch ke bharega har baar naye.
PATTERNS = [
    [ # Pattern 1: Classic
        [0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 1, 1, 1],
        [0, 0, 1, 1, 1],
        [0, 0, 0, 1, 1]
    ],
    [ # Pattern 2: The Cross
        [0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0],
        [0, 1, 1, 1, 1],
        [0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0] # Last row padded
    ],
    [ # Pattern 3: Stairs
        [0, 0, 0, 0, 0],
        [0, 1, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 1, 1, 1],
        [0, 0, 0, 1, 1]
    ],
    [ # Pattern 4: Dense
        [0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1],
        [0, 1, 1, 1, 1],
        [0, 1, 1, 1, 1],
        [0, 1, 1, 1, 1]
    ],
     [ # Pattern 5: Corner Heavy
        [0, 0, 0, 0, 0],
        [0, 1, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 1, 1, 1],
        [0, 0, 0, 1, 1]
    ]
]

def is_safe(board, row, col, num):
    """Check if 'num' can be placed at board[row][col] without violating Kakuro rules."""
    
    # 1. Row Constraint: Check current continuous horizontal run
    # Find start of the run
    c_start = col
    while c_start > 0 and board[row][c_start-1] != 0:
        c_start -= 1
    
    # Find end of the run
    c_end = col
    while c_end < GRID_SIZE - 1 and board[row][c_end+1] != 0:
        c_end += 1
        
    # Check for duplicates in this run
    for c in range(c_start, c_end + 1):
        if board[row][c] == num:
            return False

    # 2. Column Constraint: Check current continuous vertical run
    r_start = row
    while r_start > 0 and board[r_start-1][col] != 0:
        r_start -= 1
        
    r_end = row
    while r_end < GRID_SIZE - 1 and board[r_end+1][col] != 0:
        r_end += 1
        
    for r in range(r_start, r_end + 1):
        if board[r][col] == num:
            return False
            
    return True

def solve_kakuro(board):
    """
    Backtracking Algorithm to fill the board with valid numbers (1-9).
    Returns True if solved, False otherwise.
    """
    for r in range(GRID_SIZE):
        for c in range(GRID_SIZE):
            # If we find an empty playable cell (marked as -1)
            if board[r][c] == -1:
                # Try random numbers 1-9 to ensure uniqueness every day
                nums = list(range(1, 10))
                random.shuffle(nums)
                
                for num in nums:
                    if is_safe(board, r, c, num):
                        board[r][c] = num # Place number
                        
                        if solve_kakuro(board): # Recurse
                            return True
                        
                        board[r][c] = -1 # Backtrack
                return False # No number worked here
    return True

def generate_puzzle_data():
    # 1. Pick a random pattern layout
    layout = random.choice(PATTERNS)
    
    # 2. Create a board (-1 for empty playable, 0 for block)
    # We copy the layout so we don't modify the original constant
    board = []
    for r in range(GRID_SIZE):
        row = []
        for c in range(GRID_SIZE):
            if layout[r][c] == 1:
                row.append(-1) # Needs filling
            else:
                row.append(0)  # Block
        board.append(row)
        
    # 3. Fill the board with valid numbers using AI
    if not solve_kakuro(board):
        print("Error: Could not generate a valid puzzle solution. Retrying...")
        return generate_puzzle_data() # Recursive retry
    
    # At this point, 'board' contains the SOLUTION (all numbers filled)
    solution_grid = [row[:] for row in board] # Deep copy for solution key
    
    # 4. Generate Clues based on the Solution
    puzzle_output = []
    
    for r in range(GRID_SIZE):
        for c in range(GRID_SIZE):
            cell_data = {"row": r, "col": c}
            
            # If it's a number cell (Playable)
            if board[r][c] > 0:
                cell_data["type"] = "empty"
                # Frontend will look for matches against solution_grid
                
            # If it's a Block (0), it might contain clues
            else:
                down_sum = 0
                right_sum = 0
                
                # Calculate Right Sum (if there are playable cells to the right)
                if c + 1 < GRID_SIZE and board[r][c+1] > 0:
                    temp_c = c + 1
                    while temp_c < GRID_SIZE and board[r][temp_c] > 0:
                        right_sum += board[r][temp_c]
                        temp_c += 1
                
                # Calculate Down Sum (if there are playable cells below)
                if r + 1 < GRID_SIZE and board[r+1][c] > 0:
                    temp_r = r + 1
                    while temp_r < GRID_SIZE and board[temp_r][c] > 0:
                        down_sum += board[temp_r][c]
                        temp_r += 1
                
                if down_sum == 0 and right_sum == 0:
                    cell_data["type"] = "block"
                else:
                    cell_data["type"] = "clue"
                    cell_data["down"] = down_sum
                    cell_data["right"] = right_sum
            
            puzzle_output.append(cell_data)

    # Convert solution grid 0s to Nones for JSON standard
    final_solution = []
    for r in range(GRID_SIZE):
        sol_row = []
        for c in range(GRID_SIZE):
            if solution_grid[r][c] == 0:
                sol_row.append(None)
            else:
                sol_row.append(solution_grid[r][c])
        final_solution.append(sol_row)

    return {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "board_size": GRID_SIZE,
        "solution": final_solution,
        "puzzle": puzzle_output
    }

def generate_daily_puzzle():
    try:
        data = generate_puzzle_data()
        
        with open("daily-kakuro.json", "w") as f:
            json.dump(data, f, indent=4)
        
        print(f"✅ Generated FRESH Unique Puzzle for {data['date']}")
        
    except RecursionError:
        print("⚠️ Generation timed out. Trying again...")
        generate_daily_puzzle()

if __name__ == "__main__":
    generate_daily_puzzle()
