# Kakuro
# 🧩 Daily Kakuro

### A smart, aesthetically pleasing, and infinite Kakuro puzzle game.
**Play Live:** [Kakuro](https://shivhanda.github.io/Kakuro/)

## 🚀 How It Works

This isn't just a static page. It runs on a **smart automated engine**:

1.  **The Dataset:** We scraped **1,000+ high-quality puzzles** (Hard & Challenging) using a custom Python script.
2.  **Auto-Solving:** The script didn't just scrape the layout; it used a **Backtracking Algorithm** to solve every puzzle instantly and store the solution key locally.
3.  **Daily Rotation:** A manager script calculates a unique index based on the current date:
    > `Index = (Today - Start_Date) % Total_Puzzles`
    
    This guarantees a **fresh, non-repeating puzzle every single day** for the next 3 years without needing a server.

---

## ✨ Key Features

* **📅 Daily Challenges:** A new puzzle automatically appears every 24 hours.
* **📱 No-Scroll UI:** Fully responsive grid that auto-scales to fit any screen (Mobile/Desktop) perfectly.
* **🌙 Pro Dark Mode:** Auto-detects system theme and remembers your preference.
* **⚡ Smart Validation:** Instant feedback—wrong numbers turn <span style="color:red">**RED**</span> immediately.
* **🎉 Assistive Tools:** Includes a built-in Timer and a "Show Solution" feature for when you're stuck.

---

## 🛠️ Installation

1.  **Clone the Repo**
    ```bash
    git clone [https://github.com/ShivHanda/Kakuro.git](https://github.com/ShivHanda/Kakuro.git)
    ```

2.  **Generate Today's Puzzle**
    ```bash
    python generate.py
    ```

3.  **Play**
    Open `index.html` in your browser.

---

## ❤️ Credits

* **Developer:** Shiv Handa

⭐ **Star this repo if you like the logic!**
