import json
import random
from datetime import datetime

def generate_daily_puzzle():
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Ek Valid 4x4 Kakuro Puzzle (Hardcoded for logic stability)
    # 0 = Empty (User fill karega), -1 = Block/Clue
    # Hum 'solution' grid alag bhejenge taaki check kar sakein
    
    puzzle_data = {
        "date": today,
        "board_size": 4,
        # Ye correct answers hain (Validation ke liye)
        "solution": [
            [None, None, None, None],     # Row 0 (All Blocks/Clues)
            [None, 9, 7, None],           # Row 1
            [None, 3, 1, 2],              # Row 2
            [None, None, 3, 1]            # Row 3
        ],
        # Ye wo data hai jo grid banane ke liye chahiye
        "puzzle": [
            # --- ROW 0 ---
            {"row": 0, "col": 0, "type": "block"}, 
            {"row": 0, "col": 1, "type": "clue", "down": 12, "right": 0},
            {"row": 0, "col": 2, "type": "clue", "down": 11, "right": 0},
            {"row": 0, "col": 3, "type": "clue", "down": 3, "right": 0},

            # --- ROW 1 ---
            {"row": 1, "col": 0, "type": "clue", "down": 0, "right": 16},
            {"row": 1, "col": 1, "type": "empty"}, # Ans: 9
            {"row": 1, "col": 2, "type": "empty"}, # Ans: 7
            {"row": 1, "col": 3, "type": "block"},

            # --- ROW 2 ---
            {"row": 2, "col": 0, "type": "clue", "down": 0, "right": 6},
            {"row": 2, "col": 1, "type": "empty"}, # Ans: 3
            {"row": 2, "col": 2, "type": "empty"}, # Ans: 1
            {"row": 2, "col": 3, "type": "empty"}, # Ans: 2

            # --- ROW 3 ---
            {"row": 3, "col": 0, "type": "block"},
            {"row": 3, "col": 1, "type": "clue", "down": 0, "right": 4},
            {"row": 3, "col": 2, "type": "empty"}, # Ans: 3
            {"row": 3, "col": 3, "type": "empty"}, # Ans: 1
        ]
    }
    
    with open("daily-kakuro.json", "w") as f:
        json.dump(puzzle_data, f, indent=4)
    
    print(f"✅ Puzzle & Solution generated for {today}")

if __name__ == "__main__":
    generate_daily_puzzle()
