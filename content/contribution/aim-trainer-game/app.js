// Variables
let aimCanvas = new canvas("aim");
let cursor = new mouse();

// Setup
aimCanvas.setSize(800, 600);

// Run it !
run();

// Global Class
function canvas(canvasId) {
  // Canvas
  this.canvas = document.querySelector("#" + canvasId);
  this.ctx = this.canvas.getContext("2d");
  this.centerLeft;
  this.centerTop;

  // Cursor
  this.cursorX = -50;
  this.cursorY = -50;
  this.cursorSound = [];

  // Game Settings
  this.currentView = "difficulty";
  this.mode;
  this.baseDifficulty = "easy";

  // Listener
  this.canvas.addEventListener("mousemove", function (e) {
    this.boundingClientRect = this.getBoundingClientRect();
    aimCanvas.cursorX = e.clientX - this.boundingClientRect.left;
    return (aimCanvas.cursorY = e.clientY - this.boundingClientRect.top);
  });
  this.canvas.addEventListener("mousedown", function () {
    // Shoot Sound
    aimCanvas.cursorSound.push(new sound());
    aimCanvas.cursorSound[aimCanvas.cursorSound.length - 1].play();

    // Menu Event
    if (aimCanvas.currentView === "menu") {
      // "Start Game" area
      if (
        aimCanvas.cursorX > aimCanvas.centerLeft - 75 &&
        aimCanvas.cursorX < aimCanvas.centerLeft + 75 &&
        aimCanvas.cursorY > aimCanvas.centerTop - 50 &&
        aimCanvas.cursorY < aimCanvas.centerTop + 100
      ) {
        return (aimCanvas.currentView = "difficulty");
      }
    }

    if (aimCanvas.currentView === "targetMode") {
      aimCanvas.mode.shootFail += 1;

      aimCanvas.mode.targets.find(function (e, index) {
        this.dx = aimCanvas.cursorX - e.x;
        this.dy = aimCanvas.cursorY - e.y;
        this.dist = Math.abs(Math.sqrt(this.dx * this.dx + this.dy * this.dy));

        if (this.dist <= e.size) {
          aimCanvas.mode.shootFail -= 1;
          aimCanvas.mode.score += 1;
          return aimCanvas.mode.targets.splice(index, 1);
        }
      });
    }

    setTimeout(function () {
      aimCanvas.cursorSound.splice(
        aimCanvas.cursorSound[aimCanvas.cursorSound.length - 1],
        1
      );
    }, 2000);
  });
  document.addEventListener("keydown", function (e) {
    if (e.code === "Escape") {
      aimCanvas.mode = null;
      return (aimCanvas.currentView = "menu");
    }
  });

  this.setSize = function (x, y) {
    this.canvas.width = x;
    this.canvas.height = y;
    this.centerLeft = this.canvas.width / 2;
    return (this.centerTop = this.canvas.height / 2);
  };

  this.clear = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  this.controller = function () {
    if (this.currentView === "menu") {
    }

    if (this.currentView === "targetMode") {
      if (this.mode.life <= 0) {
        //console.log('loose');
      }

      this.mode.addTarget();
    }

    return this.view(this.currentView);
  };
  // Helper to start game with chosen difficulty
  this.startGame = function (difficulty) {
    aimCanvas.mode = new targetMode();
    aimCanvas.mode.baseDifficulty = difficulty;
    // Base settings by difficulty
    if (difficulty === "easy") {
      aimCanvas.mode.targetsMaxSize = 40; // bigger target
      aimCanvas.mode.targetsRapidity = 0.3; // slower shrink
      aimCanvas.mode.targetsTime = 3000; // more time before new target
    } else if (difficulty === "medium") {
      aimCanvas.mode.targetsMaxSize = 32;
      aimCanvas.mode.targetsRapidity = 0.4;
      aimCanvas.mode.targetsTime = 2000;
    } else if (difficulty === "hard") {
      aimCanvas.mode.targetsMaxSize = 26;
      aimCanvas.mode.targetsRapidity = 0.5;
      aimCanvas.mode.targetsTime = 1500;
    }

    aimCanvas.currentView = "targetMode";
  };

  this.view = function (type) {
    this.clear();

    if (type === "menu") {
      this.ctx.fillStyle = "#000";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "center";
      this.ctx.font = "30px Open Sans";
      this.ctx.fillText(
        "CANVAS AIM TRAINING",
        this.centerLeft,
        this.centerTop - 100
      );

      this.ctx.fillStyle = "#c8c8c8";
      this.ctx.fillRect(this.centerLeft - 250, this.centerTop - 50, 150, 150);
      this.ctx.fillStyle = "#fff";
      this.ctx.fillRect(this.centerLeft - 75, this.centerTop - 50, 150, 150);
      this.ctx.fillStyle = "#c8c8c8";
      this.ctx.fillRect(this.centerLeft + 100, this.centerTop - 50, 150, 150);

      aimCanvas.ctx.fillStyle = "#c8c8c8";

      aimCanvas.ctx.beginPath();
      aimCanvas.ctx.arc(
        this.centerLeft - 45,
        this.centerTop - 20,
        10,
        0,
        2 * Math.PI
      );
      aimCanvas.ctx.closePath();
      aimCanvas.ctx.fill();

      aimCanvas.ctx.beginPath();
      aimCanvas.ctx.arc(
        this.centerLeft - 25,
        this.centerTop + 20,
        20,
        0,
        2 * Math.PI
      );
      aimCanvas.ctx.closePath();
      aimCanvas.ctx.fill();

      aimCanvas.ctx.beginPath();
      aimCanvas.ctx.arc(
        this.centerLeft - 25,
        this.centerTop + 50,
        5,
        0,
        2 * Math.PI
      );
      aimCanvas.ctx.closePath();
      aimCanvas.ctx.fill();

      aimCanvas.ctx.beginPath();
      aimCanvas.ctx.arc(
        this.centerLeft - 45,
        this.centerTop + 70,
        10,
        0,
        2 * Math.PI
      );
      aimCanvas.ctx.closePath();
      aimCanvas.ctx.fill();

      aimCanvas.ctx.beginPath();
      aimCanvas.ctx.arc(
        this.centerLeft + 5,
        this.centerTop + 60,
        10,
        0,
        2 * Math.PI
      );
      aimCanvas.ctx.closePath();
      aimCanvas.ctx.fill();

      aimCanvas.ctx.beginPath();
      aimCanvas.ctx.arc(
        this.centerLeft + 35,
        this.centerTop,
        15,
        0,
        2 * Math.PI
      );
      aimCanvas.ctx.closePath();
      aimCanvas.ctx.fill();

      aimCanvas.ctx.beginPath();
      aimCanvas.ctx.arc(
        this.centerLeft + 30,
        this.centerTop + 50,
        20,
        0,
        2 * Math.PI
      );
      aimCanvas.ctx.closePath();
      aimCanvas.ctx.fill();

      aimCanvas.ctx.fillStyle = "#e40700";
      aimCanvas.ctx.textAlign = "center";
      aimCanvas.ctx.textBaseline = "center";
      aimCanvas.ctx.font = "30px Open Sans";
      aimCanvas.ctx.fillText("Precision", this.centerLeft, this.centerTop + 40);
    } else if (type === "difficulty") {
      const ctx = this.ctx;
      ctx.fillStyle = "#000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "40px Open Sans";
      ctx.fillText("Select Difficulty", this.centerLeft, this.centerTop - 150);

      const btns = [
        { text: "Easy", y: this.centerTop - 50, color: "#6fcf97", id: "easy" },
        {
          text: "Medium",
          y: this.centerTop + 20,
          color: "#f2c94c",
          id: "medium",
        },
        { text: "Hard", y: this.centerTop + 90, color: "#eb5757", id: "hard" },
      ];

      btns.forEach((b) => {
        ctx.fillStyle = b.color;
        ctx.fillRect(this.centerLeft - 100, b.y - 25, 200, 50);
        ctx.fillStyle = "#fff";
        ctx.font = "28px Open Sans";
        ctx.fillText(b.text, this.centerLeft, b.y);
      });

      // Handle click
      this.canvas.onclick = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        btns.forEach((b) => {
          if (
            x > this.centerLeft - 100 &&
            x < this.centerLeft + 100 &&
            y > b.y - 25 &&
            y < b.y + 25
          ) {
            this.startGame(b.id);
          }
        });
      };
    } else if (type === "targetMode") {
      if (this.mode.life === 0) {
        aimCanvas.ctx.fillStyle = "#404040";
        aimCanvas.ctx.textAlign = "center";
        aimCanvas.ctx.textBaseline = "center";
        aimCanvas.ctx.font = "50px Open Sans";
        aimCanvas.ctx.fillText("End", this.centerLeft, this.centerTop - 20);
        aimCanvas.ctx.font = "30px Open Sans";
        aimCanvas.ctx.fillText(
          "Score : " + this.mode.score,
          this.centerLeft,
          this.centerTop + 20
        );
        aimCanvas.ctx.fillText(
          "Press ESCAPE",
          this.centerLeft,
          this.centerTop + 200
        );
      } else {
        const ctx = aimCanvas.ctx;
        const margin = 20; // distance from the right and top
        const x = this.canvas.width - margin;
        const yStart = 20;
        const lineHeight = 30;

        // ---- Hearts (life) ----
        ctx.fillStyle = "#959595";
        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        ctx.font = "60px Open Sans";
        ctx.fillText("♥".repeat(this.mode.life), x, yStart);

        // ---- Score / Miss / Level ----
        ctx.font = "28px Open Sans";
        ctx.fillStyle = "#404040";
        ctx.fillText("Score: " + this.mode.score, x, yStart + 70);
        ctx.fillText("Miss: " + this.mode.shootFail, x, yStart + 100);

        let level =
          this.mode.score < 10
            ? "Easy"
            : this.mode.score < 20
            ? "Medium"
            : this.mode.score < 35
            ? "Hard"
            : this.mode.score < 50
            ? "Extreme"
            : "Insane";
        ctx.fillText("Level: " + this.mode.baseDifficulty, x, yStart + 130);

        // ---- Draw targets ----
        this.mode.getTargets();
      }
    }

    return cursor.show();
  };
}
function mouse() {
  this.color = "green";

  this.show = function () {
    aimCanvas.ctx.fillStyle = this.color;
    aimCanvas.ctx.beginPath();
    aimCanvas.ctx.fillRect(aimCanvas.cursorX, aimCanvas.cursorY, 3, 3);
    aimCanvas.ctx.fillRect(aimCanvas.cursorX, aimCanvas.cursorY - 15, 3, 10);
    aimCanvas.ctx.fillRect(aimCanvas.cursorX + 8, aimCanvas.cursorY, 10, 3);
    aimCanvas.ctx.fillRect(aimCanvas.cursorX, aimCanvas.cursorY + 8, 3, 10);
    aimCanvas.ctx.fillRect(aimCanvas.cursorX - 15, aimCanvas.cursorY, 10, 3);
    aimCanvas.ctx.closePath();
  };
}

// Game Mode
function targetMode() {
  this.life = 3;
  this.score = 0;
  this.shootFail = 0;
  this.targets = [];
  this.targetsMaxSize = 30; // Starting target size
  this.targetsRapidity = 0.3; // Growth/shrink speed
  this.targetsTime = 2000; // Delay between new targets
  this.targetsLastAdd = Date.now();

  // 🧩 Function to scale difficulty
  this.updateDifficulty = function () {
    // Respect the baseDifficulty initially
    if (this.score < 10) {
      if (this.baseDifficulty === "medium") {
        this.targetsMaxSize = 28;
        this.targetsRapidity = 0.4;
        this.targetsTime = 1500;
        return;
      } else if (this.baseDifficulty === "hard") {
        this.targetsMaxSize = 24;
        this.targetsRapidity = 0.5;
        this.targetsTime = 1200;
        return;
      } else {
        this.targetsMaxSize = 40;
        this.targetsRapidity = 0.3;
        this.targetsTime = 2000;
        return;
      }
    }

    // After the first threshold, scale normally
    if (this.score >= 10 && this.score < 20) {
      this.targetsMaxSize = 25;
      this.targetsRapidity = 0.4;
      this.targetsTime = 2000;
    } else if (this.score >= 20 && this.score < 35) {
      this.targetsMaxSize = 20;
      this.targetsRapidity = 0.5;
      this.targetsTime = 1000;
    } else if (this.score >= 35 && this.score < 50) {
      this.targetsMaxSize = 15;
      this.targetsRapidity = 0.6;
      this.targetsTime = 800;
    } else {
      this.targetsMaxSize = 12;
      this.targetsRapidity = 0.7;
      this.targetsTime = 600;
    }
  };

  this.addTarget = function () {
    this.updateDifficulty(); // ⚡ Update difficulty before adding target

    if (
      this.targets.length < 5 &&
      Date.now() > this.targetsLastAdd + this.targetsTime
    ) {
      this.targets.push(new target());
      this.targetsLastAdd = Date.now();
    }
  };

  this.getTargets = function () {
    this.targets.forEach(function (value, index) {
      if (value.reset === true && value.size <= 0) {
        aimCanvas.mode.targets.splice(index, 1);
        return (aimCanvas.mode.life -= 1);
      }
      return value.draw();
    });
  };
}

function target() {
  this.x = rand(
    aimCanvas.mode.targetsMaxSize,
    aimCanvas.canvas.width - aimCanvas.mode.targetsMaxSize
  );
  this.y = rand(
    aimCanvas.mode.targetsMaxSize,
    aimCanvas.canvas.height - aimCanvas.mode.targetsMaxSize
  );
  this.size = 0;
  this.reset = false;

  this.draw = function () {
    if (this.size < aimCanvas.mode.targetsMaxSize && this.reset === false) {
      this.size += aimCanvas.mode.targetsRapidity;
    } else {
      this.reset = true;

      if (this.size - aimCanvas.mode.targetsRapidity < 0) {
        return (this.size = 0);
      }

      this.size -= aimCanvas.mode.targetsRapidity;
    }

    aimCanvas.ctx.fillStyle = "red";
    aimCanvas.ctx.beginPath();
    aimCanvas.ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    aimCanvas.ctx.closePath();
    aimCanvas.ctx.fill();
  };
}

// Functions
function rand(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}
function sound() {
  this.sound = document.createElement("audio");
  this.sound.src = "shoot.mp3";
  this.sound.setAttribute("preload", "auto");

  this.play = function () {
    this.sound.play();
  };
}
function run() {
  aimCanvas.controller();
  window.requestAnimationFrame(run);
}
