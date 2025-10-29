# Word Scramble Story

_A neon-lit, drag-and-drop word game inspired by classic literature. Unscramble famous quotes to unlock fun facts and score points! Built with pure HTML, CSS, and JavaScript for the JavaScript Games for Beginners repo._

## 🎮 Overview

**Word Scramble Story** is a beginner-friendly, interactive web game where players unscramble words from iconic public-domain literary quotes (like those from _Pride and Prejudice_ or _Alice's Adventures in Wonderland_). Drag words to rearrange them correctly within a 30-second timer. Get it right to earn points and reveal a fun fact about the book or author. Miss it? See the correct answer highlighted in red and still learn the fact!

This game emphasizes wordplay, quick thinking, and a love for literature—perfect for Hacktoberfest 2025!

- **Tech Stack**: Pure HTML5, CSS3 (with neon black theme), and vanilla JavaScript (no frameworks or dependencies).
- **Playtime**: 5 quotes, ~5-10 minutes per game.
- **Compatibility**: Works on desktop and mobile browsers (Chrome, Firefox, Safari).

## 🚀 How to Play

1. **Start the Game**: Click "Play" on the welcome modal to begin.
2. **Unscramble**: Drag and drop words to form the correct quote. (Pro tip: Hover for a glow effect!)
3. **Submit**: Hit "Submit Answer" before time runs out.
   - **Correct**: +20 points! Unlock a fun fact and move to the next quote.
   - **Wrong or Timeout**: Your scramble turns red (wrong words highlighted), the correct quote appears below, and the fun fact still shows—no penalties, just learning!
4. **Win the Game**: Complete all 5 quotes for up to 100 points. See your final score and restart if you want more literary fun.
5. **Open the File**: Double-click `index.html` in your browser—no server needed!

## ✨ Features

- **Drag-and-Drop Reordering**: Smooth word swapping with visual feedback (grabbing cursor, rotation on drag).
- **Neon Black Theme**: Dark mode with glowing cyan, green, magenta, and yellow accents for a cyberpunk vibe.
- **Timer & Scoring**: 30s per quote; 20 points each (max 100). Timeouts treated as wrongs but still educational.
- **Feedback System**:
  - Correct: Green glow + fun fact popup.
  - Wrong: Red boxes/highlights for your attempt + correct quote below.
- **Fun Facts**: Bite-sized trivia for every quote, sourced from public-domain classics.
- **Responsive Design**: Plays well on any screen size.
- **Accessibility**: Keyboard-friendly (though drag-focused; future enhancements possible).

## 📚 Sample Quotes

- "It is a truth universally acknowledged..." (_Pride and Prejudice_ by Jane Austen)
- "Alice was beginning to get very tired..." (_Alice's Adventures in Wonderland_ by Lewis Carroll)
- "Call me Ishmael." (_Moby-Dick_ by Herman Melville)
- "It was the best of times..." (_A Tale of Two Cities_ by Charles Dickens)
- "All animals are equal..." (_Animal Farm_ by George Orwell)

All quotes are from public-domain works via [Project Gutenberg](https://www.gutenberg.org/).

## 🛠️ Development & Setup

- **Folder Structure**: Place `index.html` in `games/word-scramble-story/`.
- **Customization**: Edit the `quotes` array in the `<script>` to add more quotes or facts.
- **Testing**: Open `index.html` in a browser. Use dev tools (F12) for debugging drags/timers.
- **Enhancements Ideas**: Add sound effects (e.g., chimes for correct drags) or more quotes.

## 🙌 Credits

- **Game Created By**: Srushti Thombre (Hacktoberfest 2025 Contributor)  
  _Thanks for the inspiration—loving these literary twists!_
- **Original Repo**: [JavaScript Games for Beginners](https://github.com/azrilpramudia/javascript-games) by [azrilpramudia](https://github.com/azrilpramudia).
- **Assets**: Public-domain quotes from Project Gutenberg; neon theme inspired by retro arcade vibes.

## 📄 License

This project is licensed under the [MIT License](LICENSE) – feel free to fork, modify, and contribute!

---

> "The person, be it gentleman or lady, who has not pleasure in a good novel, must be intolerably stupid." – Jane Austen  
> _(Now go unscramble that one!)_
