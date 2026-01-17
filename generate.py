import json
from datetime import datetime
import os

# --- CONFIGURATION ---
DATASET_FILE = "kakuro_dataset.json"  # Jahan 1000 puzzles hain
OUTPUT_FILE = "daily-kakuro.json"     # Jo Frontend padhega

# Logic Start Date (Is din Puzzle Index 0 hoga)
# Tum ise change karke sequence reset kar sakte ho
START_DATE = datetime(2025, 1, 1) 

def update_daily_puzzle():
    try:
        # 1. Load Dataset
        if not os.path.exists(DATASET_FILE):
            print(f"❌ Error: '{DATASET_FILE}' nahi mila. Pehle scraper chalao!")
            return

        with open(DATASET_FILE, 'r') as f:
            all_puzzles = json.load(f)
        
        total_puzzles = len(all_puzzles)
        if total_puzzles == 0:
            print("❌ Error: Dataset empty hai.")
            return

        # 2. Calculate Day Index
        # Formula: (Aaj ki Date - Start Date) % Total Puzzles
        today = datetime.now()
        delta = today - START_DATE
        days_passed = delta.days
        
        # Loop logic: agar puzzles khatam ho gaye, to wapas 0 se start
        puzzle_index = days_passed % total_puzzles
        
        # 3. Pick Puzzle
        todays_puzzle = all_puzzles[puzzle_index]
        
        # Add Date for Display in Frontend
        # Hum copy banayenge taaki original dataset kharab na ho
        puzzle_for_frontend = todays_puzzle.copy()
        puzzle_for_frontend["date"] = today.strftime("%Y-%m-%d")
        
        # 4. Save to daily file (Frontend isko padhta hai)
        with open(OUTPUT_FILE, 'w') as f:
            json.dump(puzzle_for_frontend, f, indent=4)
            
        print(f"✅ Daily Puzzle Updated for {puzzle_for_frontend['date']}")
        print(f"   Puzzle Number: {puzzle_index + 1} / {total_puzzles}")
        print(f"   ID: {todays_puzzle.get('uid', 'Unknown')} | Size: {todays_puzzle['board_size']}x{todays_puzzle['board_size']}")
        print("👉 Ab index.html open karke refresh karo!")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    update_daily_puzzle()
