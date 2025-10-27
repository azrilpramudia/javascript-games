# 🚀 3D Space Shooter Game

A modern 3D space shooter game built with **Three.js**, featuring realistic graphics, smooth controls, and engaging gameplay. Destroy enemy ships, avoid collisions, and achieve the highest score!

![Space Shooter](https://img.shields.io/badge/Game-3D%20Space%20Shooter-blue)
![Three.js](https://img.shields.io/badge/Built%20with-Three.js-green)
![JavaScript](https://img.shields.io/badge/Language-JavaScript-yellow)

## 🎮 Features

### ✨ Core Gameplay
- **3D Graphics**: Immersive space environment with realistic lighting and materials
- **Smooth Controls**: Responsive keyboard controls for movement and shooting
- **Score System**: Earn points by destroying enemy ships
- **Lives System**: Three lives with visual feedback on damage
- **Progressive Difficulty**: Game pace gradually increases for challenge

### 🎯 Technical Features
- **Collision Detection**: Advanced spatial hashing for optimized performance
- **Visual Effects**: 
  - Muzzle flashes when shooting
  - Explosion particles when enemies are destroyed
  - Player hit effects with color flashing
  - Rotating starfield background
- **Game States**: Start screen, active gameplay, pause, and game over states
- **Responsive Design**: Adapts to different screen sizes

### 🕹️ Controls
| Key | Action |
|-----|--------|
| **← →** | Move spaceship left/right |
| **Spacebar** | Shoot lasers |
| **ESC** | Pause/Resume game |
| **Mouse** | Not required - keyboard only |

## 🚀 How to Play

1. **Start the Game**: Click "START GAME" on the main menu
2. **Move Your Ship**: Use left/right arrow keys to navigate
3. **Shoot Enemies**: Press spacebar to fire lasers
4. **Avoid Collisions**: Don't let enemy ships hit you
5. **Survive**: You have 3 lives - make them count!
6. **Score Points**: Destroy red enemy ships to increase your score

## 🛠️ Installation & Setup

### Prerequisites
- Modern web browser with WebGL support
- Local web server (for local development)

### Quick Start
1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/javascript-games.git
   cd javascript-games
   ```

2. **Navigate to the game directory**:
   ```bash
   cd space-shooter
   ```

3. **Open with Live Server**:

### File Structure
```
space-shooter/
├── icon.png            # Web Icon
├── index.html          # Main HTML file
├── style.css           # Game styles and UI
├── script.js           # Game logic and Three.js code
└── README.md           # This file
```

## 🎯 Game Mechanics

### Scoring
- **+10 points** for each enemy destroyed
- **High score** tracking (local)

### Enemy Behavior
- Red octahedron ships with yellow details
- Random rotation and movement patterns
- Gradually increasing speed
- Spawn from top of screen

### Player Ship
- Green triangular ship with engine glow
- Wing details for visual appeal
- Smooth horizontal movement
- Cooldown-based shooting system

## 🔧 Technical Details

### Built With
- **Three.js r128** - 3D graphics rendering
- **Vanilla JavaScript** - Game logic and mechanics
- **HTML5 & CSS3** - User interface and styling

### Performance Optimizations
- **Spatial Hashing**: Efficient collision detection (O(n) → O(1) for nearby objects)
- **Bounding Volumes**: Precise collision detection using spheres and boxes
- **Object Pooling**: Efficient memory management
- **Frame Rate Independence**: Smooth gameplay across different devices

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 🎨 Customization

### Easy Modifications
You can easily customize the game by modifying these variables in `game.js`:

```javascript
// Game balance
this.lives = 3                    // Starting lives
this.shotCooldown = 175          // Milliseconds between shots
enemy.userData.speed = 0.015     // Enemy movement speed

// Visual settings
bullet.userData.speed = 0.5      // Bullet speed
this.hashCellSize = 3            // Collision optimization
```

## 🐛 Known Issues & Troubleshooting

### Common Problems
1. **Game doesn't load**: Ensure you're using a local web server (not opening HTML file directly)
2. **Poor performance**: Try disabling browser extensions or using a more powerful device
3. **Controls not working**: Check if keyboard events are being captured by other applications

### Performance Tips
- Close other browser tabs
- Use hardware-accelerated browsers
- Ensure latest graphics drivers are installed

## 🤝 Contributing

Want to improve this space shooter? Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b new-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -am 'Add new feature'`
5. Push to the branch: `git push origin new-feature`
6. Submit a Pull Request

### Areas for Improvement
- Sound effects and background music
- Power-up system (shield, rapid fire, etc.)
- Different enemy types and boss battles
- Mobile touch controls
- Online high score leaderboard


## 🙏 Acknowledgments

- **Three.js community** for excellent 3D graphics library
- **Space shooter genre** inspiration from classic arcade games
- **Open source contributors** who make projects like this possible

---

**Ready to become a space ace?** 🚀 Start playing and see how high you can score!

*May the force of collision detection be with you!* ✨