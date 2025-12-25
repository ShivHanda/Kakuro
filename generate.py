import json
import random
from datetime import datetime

# Asli Kakuro logic hum yahan baad mein likhenge.
# Abhi ke liye bas date change kar rahe hain to prove it works.

def generate_daily_puzzle():
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Ye structure frontend ko chahiye hoga
    puzzle_data = {
        "date": today,
        "board_size": 3,
        "puzzle": [
            # Example: [Value, Type (0=Empty, 1=Clue, 2=Block)]
            # Isko hum baad mein complex banayenge
            {"row": 0, "col": 0, "type": "block"},
            {"row": 0, "col": 1, "type": "clue", "down": 16, "right": 0},
            {"row": 0, "col": 2, "type": "clue", "down": 3, "right": 0},
            {"row": 1, "col": 0, "type": "clue", "down": 0, "right": 4},
            {"row": 1, "col": 1, "type": "empty", "val": 0}, # User fills this
            {"row": 1, "col": 2, "type": "empty", "val": 0}, # User fills this
        ]
    }
    
    # JSON file ko overwrite karna
    with open("daily-kakuro.json", "w") as f:
        json.dump(puzzle_data, f, indent=4)
    
    print(f"New puzzle generated for {today}")

if __name__ == "__main__":
    generate_daily_puzzle()
