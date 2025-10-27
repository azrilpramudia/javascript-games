class SpaceShooter {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.stars = [];
        
        this.score = 0;
        this.lives = 3;
        this.gameActive = false;
        this.gamePaused = false;
        
        // Spatial Hashing for optimized collision detection
        this.spatialHash = new Map();
        this.hashCellSize = 3; // Optimal for your game scale
        
        this.keys = {};
        this.lastShotTime = 0;
        this.shotCooldown = 175; // milliseconds between shots
        
        this.init();
        this.setupEventListeners();
    }

    init() {
        // Three.js setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000011);
        document.getElementById('gameCanvas').appendChild(this.renderer.domElement);
        
        // Position camera
        this.camera.position.z = 12.5;
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x333333);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);
        
        // Create stars background
        this.createStars();
        
        // Show start screen
        this.showStartScreen();
    }

    createStars() {
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.1,
            transparent: true
        });

        const starVertices = [];
        for (let i = 0; i < 1000; i++) {
            const x = (Math.random() - 0.5) * 200;
            const y = (Math.random() - 0.5) * 200;
            const z = (Math.random() - 0.5) * 200;
            starVertices.push(x, y, z);
        }

        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
        this.stars = stars;
    }

    createPlayer() {
        // Create a more detailed player ship
        const group = new THREE.Group();
        
        // Ship body (cone)
        const bodyGeometry = new THREE.ConeGeometry(0.5, 2, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x00ff00,
            shininess: 100
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.x = Math.PI;
        group.add(body);
        
        // Wings
        const wingGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.5);
        const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x00cc00 });
        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.position.set(-0.8, 0.3, 0);
        rightWing.position.set(0.8, 0.3, 0);
        group.add(leftWing);
        group.add(rightWing);
        
        // Engine glow
        const engineGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const engineMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ffff,
            transparent: true,
            opacity: 0.7
        });
        const engine = new THREE.Mesh(engineGeometry, engineMaterial);
        engine.position.set(0, -1.2, 0);
        group.add(engine);

        this.player = group;
        this.player.position.y = -8;
        this.scene.add(this.player);

        // Add bounding box for collision detection
        this.player.boundingBox = new THREE.Box3().setFromObject(this.player);
    }

    createEnemy() {
        const group = new THREE.Group();
        
        // Enemy body (octahedron)
        const bodyGeometry = new THREE.OctahedronGeometry(0.8);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff0000,
            shininess: 100
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        group.add(body);
        
        // Enemy details
        const detailGeometry = new THREE.SphereGeometry(0.2, 6, 6);
        const detailMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 });
        const detail1 = new THREE.Mesh(detailGeometry, detailMaterial);
        const detail2 = new THREE.Mesh(detailGeometry, detailMaterial);
        detail1.position.set(0.3, 0.3, 0.3);
        detail2.position.set(-0.3, -0.3, 0.3);
        group.add(detail1);
        group.add(detail2);
        
        // Position enemy randomly at top of screen
        group.position.x = (Math.random() - 0.5) * 8;
        group.position.y = 8;
        group.position.z = (Math.random() - 0.5) * 3;
        
        // Add some rotation for visual effect
        group.userData = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            },
            speed: 0.015 + Math.random() * 0.01,
            health: 1
        };

        // Create bounding box for collision detection
        group.boundingBox = new THREE.Box3().setFromObject(group);
        
        this.scene.add(group);
        this.enemies.push(group);
    }

    shoot() {
        if (!this.gameActive) return;
        
        // Cooldown check
        const currentTime = Date.now();
        if (currentTime - this.lastShotTime < this.shotCooldown) {
            return;
        }
        this.lastShotTime = currentTime;
        
        const geometry = new THREE.SphereGeometry(0.15, 8, 8);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x00ffff,
            emissive: 0x0088ff
        });
        const bullet = new THREE.Mesh(geometry, material);
        
        bullet.position.copy(this.player.position);
        bullet.position.y += 1.2;
        
        // Add bullet properties
        bullet.userData = {
            speed: 0.5,
            damage: 1
        };
        
        // Create bounding sphere for collision detection
        bullet.boundingSphere = new THREE.Sphere(bullet.position, 0.15);
        
        this.scene.add(bullet);
        this.bullets.push(bullet);

        // Add visual effect for shooting
        this.createMuzzleFlash();
    }

    createMuzzleFlash() {
        const flashGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const flashMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        const flash = new THREE.Mesh(flashGeometry, flashMaterial);
        flash.position.copy(this.player.position);
        flash.position.y += 1.2;
        
        this.scene.add(flash);
        
        // Remove flash after short time
        setTimeout(() => {
            this.scene.remove(flash);
        }, 50);
    }

    updatePlayer() {
        if (!this.player) return;
        
        if (this.keys['ArrowLeft'] && this.player.position.x > -4.5) {
            this.player.position.x -= 0.1;
        }
        if (this.keys['ArrowRight'] && this.player.position.x < 4.5) {
            this.player.position.x += 0.1;
        }

        // Update player bounding box
        if (this.player.boundingBox) {
            this.player.boundingBox.setFromObject(this.player);
        }
    }

    updateEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Rotate enemy
            enemy.rotation.x += enemy.userData.rotationSpeed.x;
            enemy.rotation.y += enemy.userData.rotationSpeed.y;
            enemy.rotation.z += enemy.userData.rotationSpeed.z;
            
            // Move enemy downward
            enemy.position.y -= enemy.userData.speed;
            
            // Remove enemy if it goes off screen
            if (enemy.position.y < -10) {
                this.scene.remove(enemy);
                this.enemies.splice(i, 1);
                this.loseLife();
            }
        }
        
        // Spawn new enemies randomly
        if (Math.random() < 0.03) {
            this.createEnemy();
        }
    }

    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.position.y += bullet.userData.speed;
            
            // Remove bullet if it goes off screen
            if (bullet.position.y > 10) {
                this.scene.remove(bullet);
                this.bullets.splice(i, 1);
            }
        }
    }

    // Spatial Hashing Methods
    getHashKey(x, y) {
        const cellX = Math.floor((x + 10) / this.hashCellSize);
        const cellY = Math.floor((y + 10) / this.hashCellSize);
        return `${cellX},${cellY}`;
    }

    updateSpatialHash() {
        this.spatialHash.clear();
        
        for (let enemy of this.enemies) {
            const key = this.getHashKey(enemy.position.x, enemy.position.y);
            if (!this.spatialHash.has(key)) {
                this.spatialHash.set(key, []);
            }
            this.spatialHash.get(key).push(enemy);
        }
    }

    getNearbyEnemies(bullet) {
        const nearby = [];
        const bulletKey = this.getHashKey(bullet.position.x, bullet.position.y);
        
        // Check 3x3 area around bullet
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const [cellX, cellY] = bulletKey.split(',').map(Number);
                const adjacentKey = `${cellX + dx},${cellY + dy}`;
                
                if (this.spatialHash.has(adjacentKey)) {
                    nearby.push(...this.spatialHash.get(adjacentKey));
                }
            }
        }
        
        return nearby;
    }

    checkCollisions() {
        // Update spatial hash for optimized collision detection
        this.updateSpatialHash();
        
        // Check bullet-enemy collisions with spatial optimization
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            let bulletHit = false;
            
            // Update bullet bounding sphere
            if (bullet.boundingSphere) {
                bullet.boundingSphere.center.copy(bullet.position);
            }
            
            // Only check nearby enemies using spatial hashing
            const nearbyEnemies = this.getNearbyEnemies(bullet);
            
            for (let j = nearbyEnemies.length - 1; j >= 0; j--) {
                const enemy = nearbyEnemies[j];
                
                // Update enemy bounding box
                if (enemy.boundingBox) {
                    enemy.boundingBox.setFromObject(enemy);
                }
                
                // Use bounding volumes for collision detection
                if (this.checkBulletEnemyCollision(bullet, enemy)) {
                    // Collision detected
                    enemy.userData.health -= bullet.userData.damage;
                    
                    if (enemy.userData.health <= 0) {
                        this.createExplosion(enemy.position);
                        this.scene.remove(enemy);
                        this.enemies.splice(this.enemies.indexOf(enemy), 1);
                        this.score += 10;
                    }
                    
                    this.scene.remove(bullet);
                    this.bullets.splice(i, 1);
                    this.updateUI();
                    bulletHit = true;
                    break;
                }
            }
        }
        
        // Check player-enemy collisions
        if (this.player && this.player.boundingBox) {
            this.player.boundingBox.setFromObject(this.player);
            
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const enemy = this.enemies[i];
                
                if (enemy.boundingBox) {
                    enemy.boundingBox.setFromObject(enemy);
                }
                
                if (this.player.boundingBox.intersectsBox(enemy.boundingBox)) {
                    this.createExplosion(enemy.position);
                    this.scene.remove(enemy);
                    this.enemies.splice(i, 1);
                    this.loseLife();
                    this.createPlayerHitEffect();
                }
            }
        }
    }

    checkBulletEnemyCollision(bullet, enemy) {
        // Add null checks and ensure bounding volumes exist
        if (!bullet.boundingSphere || !enemy.boundingBox) {
            // Fallback to distance check if bounding volumes are missing
            const distance = bullet.position.distanceTo(enemy.position);
            return distance < 1.2;
        }
        
        // Use bounding sphere (more accurate for spheres)
        return enemy.boundingBox.intersectsSphere(bullet.boundingSphere);
    }

    createExplosion(position) {
        // Create explosion particles
        const particleCount = 8;
        const geometry = new THREE.SphereGeometry(0.1, 4, 4);
        const material = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
        
        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(position);
            
            // Random velocity
            particle.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1
                ),
                life: 1.0
            };
            
            this.scene.add(particle);
            
            // Animate and remove particle
            const animateParticle = () => {
                particle.userData.life -= 0.02;
                if (particle.userData.life <= 0) {
                    this.scene.remove(particle);
                    return;
                }
                
                particle.position.add(particle.userData.velocity);
                particle.material.opacity = particle.userData.life;
                
                requestAnimationFrame(animateParticle);
            };
            
            animateParticle();
        }
    }

    createPlayerHitEffect() {
        // Flash the player red when hit
        const originalColors = [];
        this.player.traverse((child) => {
            if (child.isMesh) {
                originalColors.push({
                    mesh: child,
                    color: child.material.color.clone(),
                    emissive: child.material.emissive ? child.material.emissive.clone() : null
                });
                child.material.color.set(0xff0000);
                if (child.material.emissive) {
                    child.material.emissive.set(0xff0000);
                }
            }
        });

        // Reset colors after delay
        setTimeout(() => {
            originalColors.forEach(original => {
                original.mesh.material.color.copy(original.color);
                if (original.emissive && original.mesh.material.emissive) {
                    original.mesh.material.emissive.copy(original.emissive);
                }
            });
        }, 200);
    }

    loseLife() {
        this.lives--;
        this.updateUI();
        
        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    updateUI() {
        document.getElementById('score').textContent = `Score: ${this.score}`;
        document.getElementById('lives').textContent = `Lives: ${this.lives}`;
    }

    gameOver() {
        this.gameActive = false;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').classList.remove('hidden');
    }

    showStartScreen() {
        document.getElementById('startScreen').classList.remove('hidden');
    }

    startGame() {
        // Reset game state
        this.score = 0;
        this.lives = 3;
        this.gameActive = true;
        this.gamePaused = false;
        this.lastShotTime = 0;
        
        // Clear spatial hash
        this.spatialHash.clear();
        
        // Clear existing objects
        while (this.enemies.length) {
            this.scene.remove(this.enemies.pop());
        }
        while (this.bullets.length) {
            this.scene.remove(this.bullets.pop());
        }
        if (this.player) {
            this.scene.remove(this.player);
        }
        
        // Remove pause screen if exists
        this.hidePauseScreen();
        
        // Create new player
        this.createPlayer();
        
        // Hide UI elements
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('gameOver').classList.add('hidden');
        
        this.updateUI();
        this.gameLoop();
    }

    // Pause functionality
    togglePause() {
        if (!this.gameActive) return;
        
        this.gamePaused = !this.gamePaused;
        
        // Update UI to show pause state
        if (this.gamePaused) {
            this.showPauseScreen();
        } else {
            this.hidePauseScreen();
            // Continue game loop
            this.gameLoop();
        }
    }

    showPauseScreen() {
        const pauseElement = document.createElement('div');
        pauseElement.id = 'pauseScreen';
        pauseElement.innerHTML = `
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                       background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 10px;
                       text-align: center; border: 2px solid yellow;">
                <h2>GAME PAUSED</h2>
                <p>Press ESC to resume</p>
            </div>
        `;
        document.getElementById('gameContainer').appendChild(pauseElement);
    }

    hidePauseScreen() {
        const pauseElement = document.getElementById('pauseScreen');
        if (pauseElement) {
            pauseElement.remove();
        }
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (event) => {
            this.keys[event.key] = true;
            
            if (event.code === 'Space' && this.gameActive && !this.gamePaused) {
                event.preventDefault();
                this.shoot();
            }
            
            // Pause functionality - ESC key
            if (event.code === 'Escape' && this.gameActive) {
                event.preventDefault();
                this.togglePause();
            }
        });
        
        document.addEventListener('keyup', (event) => {
            this.keys[event.key] = false;
        });
        
        // Button events
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    gameLoop() {
        if (!this.gameActive || this.gamePaused) return;
        
        this.updatePlayer();
        this.updateEnemies();
        this.updateBullets();
        this.checkCollisions();
        
        // Rotate stars slowly for background effect
        if (this.stars) {
            this.stars.rotation.y += 0.0005;
        }
        
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new SpaceShooter();
});