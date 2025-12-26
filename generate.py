import json
from datetime import datetime

def generate_daily_puzzle():
    today = datetime.now().strftime("%Y-%m-%d")
    
    # --- 5x5 VALID PUZZLE CONFIGURATION ---
    # Solution Matrix (Correct Answers)
    # None = Block/Clue Cell
    solution_grid = [
        [None, None, None, None, None], # Row 0
        [None, 9,    7,    None, None], # Row 1
        [None, 3,    1,    2,    None], # Row 2
        [None, None, 3,    1,    None], # Row 3
        [None, None, None, 3,    1   ]  # Row 4
    ]

    # Puzzle Structure
    # type: block | clue | empty
    # Logic:
    # R1: 9+7=16
    # R2: 3+1+2=6
    # R3: 3+1=4
    # R4: 3+1=4
    
    # C1: 9+3=12
    # C2: 7+1+3=11
    # C3: 2+1+3=6
    # C4: 1 (Ye last wala simple rakha hai valid hone ke liye)

    puzzle_data = {
        "date": today,
        "board_size": 5,
        "solution": solution_grid,
        "puzzle": [
            # --- ROW 0 (Header Row) ---
            {"row": 0, "col": 0, "type": "block"},
            {"row": 0, "col": 1, "type": "clue", "down": 12, "right": 0},
            {"row": 0, "col": 2, "type": "clue", "down": 11, "right": 0},
            {"row": 0, "col": 3, "type": "clue", "down": 2, "right": 0}, # Down sum for Row 2 col 3
            {"row": 0, "col": 4, "type": "block"}, # Last column block

            # --- ROW 1 ---
            {"row": 1, "col": 0, "type": "clue", "down": 0, "right": 16},
            {"row": 1, "col": 1, "type": "empty"}, # Ans: 9
            {"row": 1, "col": 2, "type": "empty"}, # Ans: 7
            {"row": 1, "col": 3, "type": "clue", "down": 4, "right": 0}, # Clue for column below
            {"row": 1, "col": 4, "type": "block"},

            # --- ROW 2 ---
            {"row": 2, "col": 0, "type": "clue", "down": 0, "right": 6},
            {"row": 2, "col": 1, "type": "empty"}, # Ans: 3
            {"row": 2, "col": 2, "type": "empty"}, # Ans: 1
            {"row": 2, "col": 3, "type": "empty"}, # Ans: 2
            {"row": 2, "col": 4, "type": "clue", "down": 1, "right": 0}, # Clue for below

            # --- ROW 3 ---
            {"row": 3, "col": 0, "type": "block"},
            {"row": 3, "col": 1, "type": "block"}, # Block logic
            {"row": 3, "col": 2, "type": "clue", "down": 3, "right": 4}, # Right 4, Down 3 for below
            {"row": 3, "col": 3, "type": "empty"}, # Ans: 3
            {"row": 3, "col": 4, "type": "empty"}, # Ans: 1

             # --- ROW 4 ---
            {"row": 4, "col": 0, "type": "block"},
            {"row": 4, "col": 1, "type": "block"},
            {"row": 4, "col": 2, "type": "empty"}, # Ans: 3 (Vertical sum needs to match) 
            # Wait, Logic check:
            # Col 2 (index 2): Row 0(11) -> 7+1+3 = 11. Correct.
            # Col 3 (index 3): Row 1(4) -> 2+1+? No.
            # Let's simple fix the generated logic below to be perfectly clean:
            
            # --- ROW 4 Corrected Logic ---
            {"row": 4, "col": 3, "type": "empty"}, # Ans: 3
            {"row": 4, "col": 4, "type": "empty"}, # Ans: 1
        ]
    }
    
    # RE-WRITING PUZZLE ARRAY MANUALLY TO ENSURE 100% LOGIC MATCH
    # New valid grid:
    # X  12 11  X  X
    # 16  9  7  X  X
    # 6   3  1  2  X
    # X   X  4  3  1
    # X   X  3  1  2
    
    # Let's go with a simpler 5x5 that is guaranteed valid:
    final_solution = [
        [None, None, None, None, None],
        [None, 9,    7,    None, None],
        [None, 3,    1,    2,    None],
        [None, None, 3,    1,    2   ],
        [None, None, None, 3,    1   ]
    ]
    
    puzzle_entries = [
        # R0
        {"row":0,"col":0,"type":"block"},
        {"row":0,"col":1,"type":"clue", "down":12, "right":0},
        {"row":0,"col":2,"type":"clue", "down":11, "right":0},
        {"row":0,"col":3,"type":"block"},
        {"row":0,"col":4,"type":"block"},
        
        # R1
        {"row":1,"col":0,"type":"clue", "down":0, "right":16},
        {"row":1,"col":1,"type":"empty"}, # 9
        {"row":1,"col":2,"type":"empty"}, # 7
        {"row":1,"col":3,"type":"clue", "down":6, "right":0},
        {"row":1,"col":4,"type":"block"},
        
        # R2
        {"row":2,"col":0,"type":"clue", "down":0, "right":6},
        {"row":2,"col":1,"type":"empty"}, # 3
        {"row":2,"col":2,"type":"empty"}, # 1
        {"row":2,"col":3,"type":"empty"}, # 2
        {"row":2,"col":4,"type":"clue", "down":3, "right":0},
        
        # R3
        {"row":3,"col":0,"type":"block"},
        {"row":3,"col":1,"type":"block"}, # Or a clue if needed
        {"row":3,"col":2,"type":"clue", "down":0, "right":6},
        {"row":3,"col":3,"type":"empty"}, # 3
        {"row":3,"col":4,"type":"empty"}, # 1
        {"row":3,"col":4,"type":"empty"}, # 2 is duplicate? Wait, 3+1+2=6. OK.
        
        # Actually, let's keep it super clean to avoid bugs.
        # Minimalist valid 5x5:
    ]
    
    # --- FINAL CLEAN DATA STRUCTURE ---
    # Solution:
    # .  12 10  .  .
    # 16  9  7  .  .
    # 6   3  1  2  .
    # .   .  2  1  .
    # .   .  .  3  1
    
    clean_puzzle = [
        # R0
        {"row":0,"col":0,"type":"block"},
        {"row":0,"col":1,"type":"clue", "down":12, "right":0},
        {"row":0,"col":2,"type":"clue", "down":10, "right":0},
        {"row":0,"col":3,"type":"clue", "down":6, "right":0}, 
        {"row":0,"col":4,"type":"block"},
        
        # R1 (Right 16) -> 9, 7
        {"row":1,"col":0,"type":"clue", "down":0, "right":16},
        {"row":1,"col":1,"type":"empty"}, 
        {"row":1,"col":2,"type":"empty"},
        {"row":1,"col":3,"type":"block"}, # Space
        {"row":1,"col":4,"type":"block"},

        # R2 (Right 6) -> 3, 1, 2
        {"row":2,"col":0,"type":"clue", "down":0, "right":6},
        {"row":2,"col":1,"type":"empty"},
        {"row":2,"col":2,"type":"empty"},
        {"row":2,"col":3,"type":"empty"},
        {"row":2,"col":4,"type":"clue", "down":1, "right":0}, 

        # R3 (Right 3) -> 2, 1
        {"row":3,"col":0,"type":"block"},
        {"row":3,"col":1,"type":"block"},
        {"row":3,"col":2,"type":"clue", "down":0, "right":3},
        {"row":3,"col":3,"type":"empty"},
        {"row":3,"col":4,"type":"empty"},
        
        # R4 (Right 4) -> 3, 1
        {"row":4,"col":0,"type":"block"},
        {"row":4,"col":1,"type":"block"},
        {"row":4,"col":2,"type":"block"},
        {"row":4,"col":3,"type":"clue", "down":0, "right":4},
        {"row":4,"col":4,"type":"empty"}, # Wait, single cell row?
    ]
    
    # Corrected Final valid data
    final_data = {
        "date": today,
        "board_size": 5,
        "solution": [
            [None, None, None, None, None],
            [None, 9,    7,    None, None],
            [None, 3,    1,    2,    None],
            [None, None, 2,    3,    None],
            [None, None, None, 1,    None] 
        ],
        "puzzle": [
            # R0
            {"row":0, "col":0, "type":"block"},
            {"row":0, "col":1, "type":"clue", "down":12, "right":0},
            {"row":0, "col":2, "type":"clue", "down":10, "right":0},
            {"row":0, "col":3, "type":"clue", "down":6, "right":0},
            {"row":0, "col":4, "type":"block"},

            # R1 (Sum 16: 9+7)
            {"row":1, "col":0, "type":"clue", "down":0, "right":16},
            {"row":1, "col":1, "type":"empty"},
            {"row":1, "col":2, "type":"empty"},
            {"row":1, "col":3, "type":"clue", "down":0, "right":0, "type":"block"}, # Just block
            {"row":1, "col":4, "type":"block"},

            # R2 (Sum 6: 3+1+2)
            {"row":2, "col":0, "type":"clue", "down":0, "right":6},
            {"row":2, "col":1, "type":"empty"},
            {"row":2, "col":2, "type":"empty"},
            {"row":2, "col":3, "type":"empty"},
            {"row":2, "col":4, "type":"block"},

            # R3 (Sum 5: 2+3) -> Starts at col 2
            {"row":3, "col":0, "type":"block"},
            {"row":3, "col":1, "type":"block"},
            {"row":3, "col":2, "type":"empty"},
            {"row":3, "col":3, "type":"empty"},
            {"row":3, "col":4, "type":"block"},

            # R4 (Sum 1) -> Starts at col 3 (Logic fix: Vert sums match?)
            # C2 Down sum was 10. R1(7)+R2(1)+R3(2) = 10. Perfect.
            # C3 Down sum was 6. R2(2)+R3(3)+R4(1) = 6. Perfect.
            {"row":4, "col":0, "type":"block"},
            {"row":4, "col":1, "type":"block"},
            {"row":4, "col":2, "type":"block"},
            {"row":4, "col":3, "type":"empty"}, # 1
            {"row":4, "col":4, "type":"block"}
        ]
    }

    # Add R3 and R4 clues
    # R3 starts at col 1? No, logic says empty starts at 2. So (3,1) must be clue.
    # Fix R3:
    final_data["puzzle"][16] = {"row":3,"col":1,"type":"clue", "down":0, "right":5}
    # Fix R4:
    final_data["puzzle"][22] = {"row":4,"col":2,"type":"clue", "down":0, "right":1}

    with open("daily-kakuro.json", "w") as f:
        json.dump(final_data, f, indent=4)
    
    print(f"✅ 5x5 Puzzle generated for {today}")

if __name__ == "__main__":
    generate_daily_puzzle()
