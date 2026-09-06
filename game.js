// =========================================================
// BOEING 787 FUN HUB - MULTI MINI-GAME ARCADE ENGINE (3 GAMES)
// =========================================================

// --- GAME 1: SKY FLIGHT RUNNER ---
class FlightGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.canvas.width = 900;
    this.canvas.height = 480;
    
    this.state = "MENU";
    this.score = 0;
    this.lotusCount = 0;
    this.combo = 0;
    this.distance = 0;
    this.targetDistance = 3200;
    
    this.plane = {
      x: 120,
      y: 390,
      vx: 3,
      vy: 0,
      pitch: 0,
      throttle: 20,
      altitude: 0,
      speed: 0,
      gearDown: true,
      turboTimer: 0
    };
    
    this.keys = { up: false, down: false, boost: false };
    this.particles = [];
    this.clouds = [];
    this.items = [];
    this.obstacles = [];
    this.groundY = 410;
    
    this.initClouds();
    this.initEventListeners();
    
    this.lastTime = performance.now();
    this.animId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  initClouds() {
    this.clouds = [];
    for (let i = 0; i < 14; i++) {
      this.clouds.push({
        x: Math.random() * this.canvas.width * 2,
        y: 30 + Math.random() * 240,
        size: 30 + Math.random() * 55,
        speed: 0.3 + Math.random() * 0.8,
        opacity: 0.4 + Math.random() * 0.4
      });
    }
  }

  initEventListeners() {
    window.addEventListener('keydown', (e) => {
      if (["Space", "ArrowUp", "ArrowDown", "KeyW", "KeyS"].includes(e.code)) {
        if (this.state !== "MENU" && document.getElementById("tab-game-flight")?.classList.contains("active-game-tab")) {
          e.preventDefault();
        }
      }
      if (e.code === "ArrowUp" || e.code === "KeyW") this.keys.up = true;
      if (e.code === "ArrowDown" || e.code === "KeyS") this.keys.down = true;
      if (e.code === "Space" || e.code === "ShiftLeft") this.keys.boost = true;
      if (e.code === "KeyG") this.toggleGear();
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === "ArrowUp" || e.code === "KeyW") this.keys.up = false;
      if (e.code === "ArrowDown" || e.code === "KeyS") this.keys.down = false;
      if (e.code === "Space" || e.code === "ShiftLeft") this.keys.boost = false;
    });

    const btnUp = document.getElementById("game-btn-up");
    const btnDown = document.getElementById("game-btn-down");
    const btnBoost = document.getElementById("game-btn-boost");
    const btnGear = document.getElementById("game-btn-gear");
    const btnStart = document.getElementById("game-btn-start");
    const btnRestart = document.getElementById("game-btn-restart");

    if (btnUp) {
      btnUp.onpointerdown = (e) => { e.preventDefault(); this.keys.up = true; };
      btnUp.onpointerup = () => { this.keys.up = false; };
      btnUp.onpointerleave = () => { this.keys.up = false; };
    }
    if (btnDown) {
      btnDown.onpointerdown = (e) => { e.preventDefault(); this.keys.down = true; };
      btnDown.onpointerup = () => { this.keys.down = false; };
      btnDown.onpointerleave = () => { this.keys.down = false; };
    }
    if (btnBoost) {
      btnBoost.onpointerdown = (e) => { e.preventDefault(); this.keys.boost = true; };
      btnBoost.onpointerup = () => { this.keys.boost = false; };
      btnBoost.onpointerleave = () => { this.keys.boost = false; };
    }
    if (btnGear) btnGear.onclick = () => this.toggleGear();
    if (btnStart) btnStart.onclick = () => this.startGame();
    if (btnRestart) btnRestart.onclick = () => this.startGame();
  }

  toggleGear() {
    this.plane.gearDown = !this.plane.gearDown;
    if (window.AudioEngine) window.AudioEngine.playClick();
    this.updateHUD();
  }

  startGame() {
    this.state = "TAKEOFF";
    this.score = 0;
    this.lotusCount = 0;
    this.combo = 0;
    this.distance = 0;
    this.plane.x = 100;
    this.plane.y = 390;
    this.plane.vx = 2;
    this.plane.vy = 0;
    this.plane.pitch = 0;
    this.plane.throttle = 40;
    this.plane.speed = 40;
    this.plane.altitude = 0;
    this.plane.gearDown = true;
    this.plane.turboTimer = 0;
    this.items = [];
    this.obstacles = [];
    this.particles = [];
    this.spawnEntities();
    
    if (window.AudioEngine) window.AudioEngine.playEngineSound(1.2);
    this.updateHUD();

    document.getElementById("game-overlay-menu")?.classList.add("hidden");
    document.getElementById("game-overlay-end")?.classList.add("hidden");
  }

  spawnEntities() {
    for (let d = 500; d < this.targetDistance - 600; d += 180 + Math.random() * 140) {
      const rand = Math.random();
      if (rand < 0.65) {
        this.items.push({
          x: d,
          y: 70 + Math.random() * 230,
          type: "lotus",
          collected: false,
          radius: 16
        });
      } else if (rand < 0.85) {
        this.items.push({
          x: d,
          y: 90 + Math.random() * 200,
          type: "rainbow",
          collected: false,
          radius: 24
        });
      } else {
        this.obstacles.push({
          x: d,
          y: 60 + Math.random() * 210,
          type: "storm",
          radius: 28,
          hit: false
        });
      }
    }
  }

  update(dt) {
    if (this.state === "MENU" || this.state === "LANDED") return;

    if (this.plane.turboTimer > 0) {
      this.plane.turboTimer -= dt;
    }

    if (this.keys.up) {
      this.plane.pitch = Math.max(-25, this.plane.pitch - 35 * dt);
    } else if (this.keys.down) {
      this.plane.pitch = Math.min(25, this.plane.pitch + 35 * dt);
    } else {
      this.plane.pitch *= (1 - 2 * dt);
    }

    const turboMult = this.plane.turboTimer > 0 ? 1.6 : 1.0;
    if (this.keys.boost) {
      this.plane.throttle = Math.min(100, this.plane.throttle + 45 * dt);
    } else {
      this.plane.throttle = Math.max(35, this.plane.throttle - 15 * dt);
    }

    const targetSpeed = this.plane.throttle * 4.5 * (this.plane.gearDown ? 0.8 : 1.15) * turboMult;
    this.plane.speed += (targetSpeed - this.plane.speed) * 2.2 * dt;
    
    const lift = (this.plane.speed / 200) * (-this.plane.pitch * 0.12);
    const gravity = 1.2;
    this.plane.vy = (lift * 20) + (this.plane.speed < 120 ? gravity : 0.2);

    this.plane.y += this.plane.vy * dt * 8;
    this.distance += this.plane.speed * dt * 0.7;

    if (this.plane.y < 35) this.plane.y = 35;

    if (this.plane.y >= 390) {
      this.plane.y = 390;
      this.plane.pitch = 0;
      this.plane.altitude = 0;

      if (this.distance >= this.targetDistance - 200 && this.state === "APPROACH") {
        this.finishLanding();
      }
    } else {
      this.plane.altitude = Math.round((390 - this.plane.y) * 85);
    }

    if (this.state === "TAKEOFF" && this.plane.altitude > 1000) {
      this.state = "CRUISE";
    }
    if (this.distance >= this.targetDistance - 800 && this.state === "CRUISE") {
      this.state = "APPROACH";
    }

    if (Math.random() < 0.8) {
      this.particles.push({
        x: this.plane.x - 30,
        y: this.plane.y + 8,
        vx: -this.plane.speed * 0.05 - Math.random() * 2,
        vy: (Math.random() - 0.5) * 1.5,
        life: 1.0,
        color: this.plane.turboTimer > 0 ? '#f43f5e' : (this.keys.boost ? '#f59e0b' : '#38bdf8'),
        size: 3 + Math.random() * 4
      });
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt * 2.5;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    this.clouds.forEach(c => {
      c.x -= (this.plane.speed * 0.02 + c.speed);
      if (c.x < -100) c.x = this.canvas.width + Math.random() * 200;
    });

    const viewOffset = this.distance;

    this.items.forEach(item => {
      const screenX = item.x - viewOffset + this.plane.x + 300;
      if (!item.collected && Math.hypot(screenX - this.plane.x, item.y - this.plane.y) < 35) {
        item.collected = true;
        if (item.type === "lotus") {
          this.lotusCount++;
          this.combo++;
          this.score += 150 + (this.combo * 20);
          if (window.AudioEngine) window.AudioEngine.playLotusChime();
          this.createSparks(this.plane.x, this.plane.y, '#e5a919');
        } else if (item.type === "rainbow") {
          this.plane.turboTimer = 4.0;
          this.score += 300;
          if (window.AudioEngine) window.AudioEngine.playFanfare();
          this.createSparks(this.plane.x, this.plane.y, '#ec4899');
        }
      }
    });

    this.obstacles.forEach(obs => {
      const screenX = obs.x - viewOffset + this.plane.x + 300;
      if (!obs.hit && Math.hypot(screenX - this.plane.x, obs.y - this.plane.y) < 40) {
        obs.hit = true;
        this.combo = 0;
        this.score = Math.max(0, this.score - 50);
        this.plane.speed *= 0.7;
        if (window.AudioEngine) window.AudioEngine.playTurbulence();
        this.createSparks(this.plane.x, this.plane.y, '#94a3b8');
      }
    });

    this.updateHUD();
  }

  createSparks(x, y, color) {
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1.0,
        color: color,
        size: 3 + Math.random() * 3
      });
    }
  }

  finishLanding() {
    this.state = "LANDED";
    let quality = "PERFECT";
    let stars = 3;
    let bonus = 500;

    if (!this.plane.gearDown) {
      quality = "BELLY_SLIDE";
      stars = 1;
      bonus = 100;
    } else if (this.plane.speed > 160) {
      quality = "HARD";
      stars = 2;
      bonus = 250;
    }

    this.score += bonus;
    if (window.AudioEngine) window.AudioEngine.playTouchdown();

    setTimeout(() => {
      if (window.confetti) {
        window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
      this.showEndScreen(quality, stars);
    }, 600);
  }

  showEndScreen(quality, stars) {
    const endOverlay = document.getElementById("game-overlay-end");
    const titleEl = document.getElementById("game-end-title");
    const descEl = document.getElementById("game-end-desc");
    const scoreEl = document.getElementById("game-end-score");
    const starsEl = document.getElementById("game-end-stars");

    if (endOverlay) endOverlay.classList.remove("hidden");
    if (scoreEl) scoreEl.textContent = `${this.score} Điểm`;
    if (starsEl) starsEl.innerHTML = "⭐".repeat(stars) + "☆".repeat(3 - stars);

    if (quality === "PERFECT") {
      if (titleEl) titleEl.textContent = "🏆 BÀN TAY VÀNG LÀNG HẠ CÁNH!";
      if (descEl) descEl.textContent = `Tuyệt đỉnh! Thu thập ${this.lotusCount} đóa Sen Vàng và tiếp đất êm như nhung!`;
    } else if (quality === "HARD") {
      if (titleEl) titleEl.textContent = "✈️ HẠ CÁNH THÀNH CÔNG (HƠI NẢY TƯNG TƯNG)!";
      if (descEl) descEl.textContent = `Hành khách vỗ tay rầm rộ! Thu thập ${this.lotusCount} Sen Vàng.`;
    } else {
      if (titleEl) titleEl.textContent = "🛬 TIẾP ĐẤT TRƯỢT BỤNG NGOẠN MỤC!";
      if (descEl) descEl.textContent = "Bạn quên thả càng đáp (Gear Down) rồi! May mà thân vỏ sợi carbon của 787 cực kỳ bền!";
    }
  }

  updateHUD() {
    const altEl = document.getElementById("hud-altitude");
    const spdEl = document.getElementById("hud-speed");
    const lotusEl = document.getElementById("hud-lotus");
    const scoreEl = document.getElementById("hud-score");
    const gearEl = document.getElementById("hud-gear");
    const progressEl = document.getElementById("hud-progress");
    const guideEl = document.getElementById("hud-guide-text");

    if (altEl) altEl.textContent = `${this.plane.altitude.toLocaleString()} FT`;
    if (spdEl) spdEl.textContent = `${Math.round(this.plane.speed)} KTS`;
    if (lotusEl) lotusEl.textContent = `${this.lotusCount}`;
    if (scoreEl) scoreEl.textContent = `${this.score}`;
    if (gearEl) {
      gearEl.textContent = this.plane.gearDown ? "HẠ CÀNG (DOWN)" : "THU CÀNG (UP)";
      gearEl.className = this.plane.gearDown ? "text-emerald-400 font-bold" : "text-cyan-400 font-bold";
    }
    if (progressEl) {
      const pct = Math.min(100, Math.round((this.distance / this.targetDistance) * 100));
      progressEl.style.width = `${pct}%`;
    }

    if (guideEl) {
      if (this.state === "TAKEOFF") {
        guideEl.textContent = "🚀 Nhấn Mũi Lên (W) để cất cánh! Sau đó bấm Thu Càng (G)!";
      } else if (this.state === "CRUISE") {
        guideEl.textContent = "✨ Thu thập Sen Vàng VNA (+150đ) & Vòng Cầu Vồng Siêu Tốc Turbo!";
      } else if (this.state === "APPROACH") {
        guideEl.textContent = "🛬 Sắp tới đường băng! BẬT HẠ CÀNG ĐÁP (G) & Căn mũi hạ cánh!";
      } else if (this.state === "LANDED") {
        guideEl.textContent = "🎉 Tiếp đất hoàn tất!";
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const grad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    if (this.plane.altitude > 20000) {
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.7, '#0369a1');
      grad.addColorStop(1, '#7dd3fc');
    } else {
      grad.addColorStop(0, '#0284c7');
      grad.addColorStop(0.6, '#38bdf8');
      grad.addColorStop(0.85, '#bae6fd');
      grad.addColorStop(1, '#86efac');
    }
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.clouds.forEach(c => {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${c.opacity})`;
      this.ctx.beginPath();
      this.ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
      this.ctx.arc(c.x + c.size * 0.7, c.y - c.size * 0.2, c.size * 0.8, 0, Math.PI * 2);
      this.ctx.arc(c.x + c.size * 1.3, c.y, c.size * 0.7, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.ctx.fillStyle = '#166534';
    this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);

    if (this.distance < 1200) {
      const startRunwayX = -this.distance + 50;
      this.ctx.fillStyle = '#334155';
      this.ctx.fillRect(startRunwayX, this.groundY - 10, 1000, 15);
      this.ctx.fillStyle = '#f8fafc';
      for (let s = 0; s < 1000; s += 60) {
        this.ctx.fillRect(startRunwayX + s, this.groundY - 4, 30, 4);
      }
    }

    if (this.distance > this.targetDistance - 1500) {
      const endRunwayX = (this.targetDistance - 600) - this.distance + this.plane.x + 300;
      this.ctx.fillStyle = '#1e293b';
      this.ctx.fillRect(endRunwayX, this.groundY - 10, 1200, 15);
      this.ctx.fillStyle = '#eab308';
      for (let s = 0; s < 1200; s += 60) {
        this.ctx.fillRect(endRunwayX + s, this.groundY - 4, 30, 4);
      }
    }

    const viewOffset = this.distance;

    this.items.forEach(item => {
      if (item.collected) return;
      const sx = item.x - viewOffset + this.plane.x + 300;
      if (sx > -50 && sx < this.canvas.width + 50) {
        this.ctx.save();
        this.ctx.translate(sx, item.y);
        if (item.type === "lotus") {
          this.ctx.fillStyle = '#e5a919';
          this.ctx.shadowColor = '#fcd34d';
          this.ctx.shadowBlur = 15;
          this.ctx.beginPath();
          this.ctx.arc(0, 0, 12, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.fillStyle = '#ffffff';
          this.ctx.beginPath();
          this.ctx.arc(0, 0, 5, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (item.type === "rainbow") {
          this.ctx.strokeStyle = '#ec4899';
          this.ctx.lineWidth = 5;
          this.ctx.shadowColor = '#a855f7';
          this.ctx.shadowBlur = 15;
          this.ctx.beginPath();
          this.ctx.arc(0, 0, 18, 0, Math.PI * 2);
          this.ctx.stroke();
          this.ctx.fillStyle = '#f43f5e';
          this.ctx.font = 'bold 12px sans-serif';
          this.ctx.fillText('⚡TURBO', -20, 4);
        }
        this.ctx.restore();
      }
    });

    this.obstacles.forEach(obs => {
      const sx = obs.x - viewOffset + this.plane.x + 300;
      if (sx > -50 && sx < this.canvas.width + 50) {
        this.ctx.save();
        this.ctx.translate(sx, obs.y);
        this.ctx.fillStyle = '#475569';
        this.ctx.shadowColor = '#000000';
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, obs.radius, 0, Math.PI * 2);
        this.ctx.arc(obs.radius * 0.7, -obs.radius * 0.2, obs.radius * 0.7, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#fde047';
        this.ctx.font = 'bold 16px sans-serif';
        this.ctx.fillText('⚡', -6, 6);
        this.ctx.restore();
      }
    });

    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1.0;

    this.drawBoeing787(this.plane.x, this.plane.y, this.plane.pitch, this.plane.gearDown);
  }

  drawBoeing787(x, y, pitchDeg, gearDown) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate((pitchDeg * Math.PI) / 180);

    this.ctx.fillStyle = '#005f63';
    this.ctx.beginPath();
    this.ctx.ellipse(0, 4, 38, 10, 0, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#f8fafc';
    this.ctx.beginPath();
    this.ctx.ellipse(0, -1, 38, 8, 0, Math.PI, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#0f172a';
    this.ctx.beginPath();
    this.ctx.moveTo(30, -3);
    this.ctx.lineTo(38, 0);
    this.ctx.lineTo(34, 3);
    this.ctx.lineTo(28, 0);
    this.ctx.fill();

    this.ctx.fillStyle = '#005f63';
    this.ctx.beginPath();
    this.ctx.moveTo(-28, -2);
    this.ctx.lineTo(-42, -26);
    this.ctx.lineTo(-32, -26);
    this.ctx.lineTo(-18, -2);
    this.ctx.fill();

    this.ctx.fillStyle = '#e5a919';
    this.ctx.beginPath();
    this.ctx.arc(-34, -18, 4, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#cbd5e1';
    this.ctx.beginPath();
    this.ctx.moveTo(-5, 0);
    this.ctx.lineTo(-20, 16);
    this.ctx.lineTo(-12, 16);
    this.ctx.lineTo(10, 0);
    this.ctx.fill();

    this.ctx.fillStyle = '#334155';
    this.ctx.fillRect(-6, 8, 18, 8);
    this.ctx.fillStyle = this.plane.turboTimer > 0 ? '#f43f5e' : '#0284c7';
    this.ctx.beginPath();
    this.ctx.arc(12, 12, 4, 0, Math.PI * 2);
    this.ctx.fill();

    if (gearDown) {
      this.ctx.strokeStyle = '#475569';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(25, 6);
      this.ctx.lineTo(25, 18);
      this.ctx.moveTo(-6, 6);
      this.ctx.lineTo(-6, 18);
      this.ctx.stroke();

      this.ctx.fillStyle = '#0f172a';
      this.ctx.beginPath();
      this.ctx.arc(25, 19, 3, 0, Math.PI * 2);
      this.ctx.arc(-6, 19, 4, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  gameLoop(currentTime) {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;
    this.update(dt);
    this.draw();
    this.animId = requestAnimationFrame((t) => this.gameLoop(t));
  }
}

// --- GAME 2: CABIN SNACK RUSH ---
class SnackGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.canvas.width = 800;
    this.canvas.height = 450;
    
    this.state = "MENU";
    this.score = 0;
    this.timeLeft = 35;
    this.cartX = 350;
    this.cartWidth = 85;
    this.cartSpeed = 450;
    
    this.keys = { left: false, right: false };
    this.items = [];
    this.particles = [];
    
    this.initEventListeners();
    this.lastTime = performance.now();
    this.animId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  initEventListeners() {
    window.addEventListener('keydown', (e) => {
      if (["ArrowLeft", "KeyA"].includes(e.code)) this.keys.left = true;
      if (["ArrowRight", "KeyD"].includes(e.code)) this.keys.right = true;
    });

    window.addEventListener('keyup', (e) => {
      if (["ArrowLeft", "KeyA"].includes(e.code)) this.keys.left = false;
      if (["ArrowRight", "KeyD"].includes(e.code)) this.keys.right = false;
    });

    const btnStart = document.getElementById("snack-btn-start");
    const btnRestart = document.getElementById("snack-btn-restart");
    const btnLeft = document.getElementById("snack-btn-left");
    const btnRight = document.getElementById("snack-btn-right");

    if (btnStart) btnStart.onclick = () => this.startGame();
    if (btnRestart) btnRestart.onclick = () => this.startGame();

    if (btnLeft) {
      btnLeft.onpointerdown = (e) => { e.preventDefault(); this.keys.left = true; };
      btnLeft.onpointerup = () => { this.keys.left = false; };
      btnLeft.onpointerleave = () => { this.keys.left = false; };
    }
    if (btnRight) {
      btnRight.onpointerdown = (e) => { e.preventDefault(); this.keys.right = true; };
      btnRight.onpointerup = () => { this.keys.right = false; };
      btnRight.onpointerleave = () => { this.keys.right = false; };
    }

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.state !== "PLAYING") return;
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * this.canvas.width;
      this.cartX = Math.max(30, Math.min(this.canvas.width - this.cartWidth - 30, mouseX - this.cartWidth / 2));
    });
  }

  startGame() {
    this.state = "PLAYING";
    this.score = 0;
    this.timeLeft = 35;
    this.cartX = 350;
    this.items = [];
    this.particles = [];
    this.spawnTimer = 0;

    document.getElementById("snack-overlay-menu")?.classList.add("hidden");
    document.getElementById("snack-overlay-end")?.classList.add("hidden");
    if (window.AudioEngine) window.AudioEngine.playSeatbeltChime();
  }

  update(dt) {
    if (this.state !== "PLAYING") return;

    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.finishGame();
      return;
    }

    if (this.keys.left) {
      this.cartX = Math.max(30, this.cartX - this.cartSpeed * dt);
    }
    if (this.keys.right) {
      this.cartX = Math.min(this.canvas.width - this.cartWidth - 30, this.cartX + this.cartSpeed * dt);
    }

    this.spawnTimer += dt;
    if (this.spawnTimer > 0.45) {
      this.spawnTimer = 0;
      const types = [
        { icon: "🧋", name: "boba", pts: 25, isHazard: false },
        { icon: "🍜", name: "noodles", pts: 35, isHazard: false },
        { icon: "🥖", name: "banhmi", pts: 20, isHazard: false },
        { icon: "🥜", name: "peanut", pts: 15, isHazard: false },
        { icon: "🍌", name: "banana", pts: -20, isHazard: true },
        { icon: "☕", name: "coffee", pts: -25, isHazard: true }
      ];
      const selected = types[Math.floor(Math.random() * types.length)];
      this.items.push({
        x: 50 + Math.random() * (this.canvas.width - 100),
        y: -30,
        vy: 140 + Math.random() * 120,
        ...selected
      });
    }

    const cartY = 360;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      it.y += it.vy * dt;

      if (it.y >= cartY && it.y <= cartY + 40 && it.x >= this.cartX - 15 && it.x <= this.cartX + this.cartWidth + 15) {
        this.score += it.pts;
        if (it.isHazard) {
          if (window.AudioEngine) window.AudioEngine.playTurbulence();
          this.createSparks(it.x, it.y, '#ef4444');
        } else {
          if (window.AudioEngine) window.AudioEngine.playLotusChime();
          this.createSparks(it.x, it.y, '#f59e0b');
        }
        this.items.splice(i, 1);
        continue;
      }

      if (it.y > this.canvas.height + 40) {
        this.items.splice(i, 1);
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt * 2;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    this.updateHUD();
  }

  createSparks(x, y, color) {
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 1.0,
        color: color,
        size: 3 + Math.random() * 3
      });
    }
  }

  finishGame() {
    this.state = "END";
    if (window.AudioEngine) window.AudioEngine.playFanfare();
    if (window.confetti) window.confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });

    const endOverlay = document.getElementById("snack-overlay-end");
    const scoreEl = document.getElementById("snack-end-score");
    const titleEl = document.getElementById("snack-end-title");
    if (endOverlay) endOverlay.classList.remove("hidden");
    if (scoreEl) scoreEl.textContent = `${this.score} Điểm`;
    if (titleEl) {
      titleEl.textContent = this.score >= 300 ? "👑 THÁNH PHỤC VỤ TRÊN MÂY!" : "👏 TIẾP VIÊN CHĂM CHỈ!";
    }
  }

  updateHUD() {
    const timeEl = document.getElementById("snack-hud-time");
    const scoreEl = document.getElementById("snack-hud-score");
    if (timeEl) timeEl.textContent = `${Math.ceil(this.timeLeft)}s`;
    if (scoreEl) scoreEl.textContent = `${this.score}`;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const grad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(0.5, '#0f172a');
    grad.addColorStop(1, '#020617');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.strokeStyle = '#334155';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 80);
    this.ctx.lineTo(this.canvas.width, 80);
    this.ctx.moveTo(150, 0);
    this.ctx.lineTo(50, this.canvas.height);
    this.ctx.moveTo(this.canvas.width - 150, 0);
    this.ctx.lineTo(this.canvas.width - 50, this.canvas.height);
    this.ctx.stroke();

    this.ctx.fillStyle = '#005f63';
    this.ctx.fillRect(160, 390, this.canvas.width - 320, 60);

    this.ctx.font = '28px sans-serif';
    this.ctx.textAlign = 'center';
    this.items.forEach(it => {
      this.ctx.fillText(it.icon, it.x, it.y);
    });

    const cartY = 360;
    this.ctx.fillStyle = '#e2e8f0';
    this.ctx.fillRect(this.cartX, cartY, this.cartWidth, 42);
    this.ctx.fillStyle = '#005f63';
    this.ctx.fillRect(this.cartX, cartY + 14, this.cartWidth, 14);

    this.ctx.fillStyle = '#0f172a';
    this.ctx.beginPath();
    this.ctx.arc(this.cartX + 16, cartY + 44, 6, 0, Math.PI * 2);
    this.ctx.arc(this.cartX + this.cartWidth - 16, cartY + 44, 6, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#e5a919';
    this.ctx.font = 'bold 12px sans-serif';
    this.ctx.fillText('🪷 VNA', this.cartX + this.cartWidth / 2, cartY + 25);

    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1.0;
  }

  gameLoop(currentTime) {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;
    this.update(dt);
    this.draw();
    this.animId = requestAnimationFrame((t) => this.gameLoop(t));
  }
}

// --- GAME 3: FLAPPY DREAMLINER (VỖ CÁNH BAY XUYÊN MÂY) ---
class FlappyGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.canvas.width = 800;
    this.canvas.height = 450;
    
    this.state = "MENU"; // MENU, PLAYING, GAMEOVER
    this.score = 0;
    this.highScore = 0;
    
    this.bird = {
      x: 140,
      y: 200,
      vy: 0,
      gravity: 750,
      jump: -280,
      size: 20
    };
    
    this.pipes = [];
    this.pipeTimer = 0;
    this.pipeGap = 150;
    this.pipeSpeed = 160;
    
    this.initEventListeners();
    this.lastTime = performance.now();
    this.animId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  initEventListeners() {
    const doFlap = () => {
      if (this.state === "MENU" || this.state === "GAMEOVER") {
        this.startGame();
      } else if (this.state === "PLAYING") {
        this.bird.vy = this.bird.jump;
        if (window.AudioEngine) window.AudioEngine.playClick();
      }
    };

    window.addEventListener('keydown', (e) => {
      if (e.code === "Space" && document.getElementById("tab-game-flappy")?.classList.contains("active-game-tab")) {
        e.preventDefault();
        doFlap();
      }
    });

    this.canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      doFlap();
    });

    const btnStart = document.getElementById("flappy-btn-start");
    const btnRestart = document.getElementById("flappy-btn-restart");
    const btnJump = document.getElementById("flappy-btn-jump");

    if (btnStart) btnStart.onclick = () => this.startGame();
    if (btnRestart) btnRestart.onclick = () => this.startGame();
    if (btnJump) btnJump.onclick = () => doFlap();
  }

  startGame() {
    this.state = "PLAYING";
    this.score = 0;
    this.bird.y = 200;
    this.bird.vy = 0;
    this.pipes = [];
    this.pipeTimer = 0;

    document.getElementById("flappy-overlay-menu")?.classList.add("hidden");
    document.getElementById("flappy-overlay-end")?.classList.add("hidden");
    if (window.AudioEngine) window.AudioEngine.playSeatbeltChime();
  }

  update(dt) {
    if (this.state !== "PLAYING") return;

    this.bird.vy += this.bird.gravity * dt;
    this.bird.y += this.bird.vy * dt;

    if (this.bird.y < 15) this.bird.y = 15;
    if (this.bird.y > this.canvas.height - 20) {
      this.gameOver();
      return;
    }

    // Spawn pipes (storm columns)
    this.pipeTimer += dt;
    if (this.pipeTimer > 1.6) {
      this.pipeTimer = 0;
      const topHeight = 60 + Math.random() * (this.canvas.height - this.pipeGap - 120);
      this.pipes.push({
        x: this.canvas.width + 20,
        top: topHeight,
        bottom: topHeight + this.pipeGap,
        passed: false
      });
    }

    // Update pipes
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const p = this.pipes[i];
      p.x -= this.pipeSpeed * dt;

      // Score check
      if (!p.passed && p.x + 40 < this.bird.x) {
        p.passed = true;
        this.score++;
        if (window.AudioEngine) window.AudioEngine.playLotusChime();
      }

      // Collision check
      if (this.bird.x + 25 > p.x && this.bird.x - 20 < p.x + 50) {
        if (this.bird.y - 10 < p.top || this.bird.y + 10 > p.bottom) {
          this.gameOver();
          return;
        }
      }

      if (p.x < -70) this.pipes.splice(i, 1);
    }

    this.updateHUD();
  }

  gameOver() {
    this.state = "GAMEOVER";
    this.highScore = Math.max(this.highScore, this.score);
    if (window.AudioEngine) window.AudioEngine.playTurbulence();

    const endOverlay = document.getElementById("flappy-overlay-end");
    const scoreEl = document.getElementById("flappy-end-score");
    const highEl = document.getElementById("flappy-end-high");
    if (endOverlay) endOverlay.classList.remove("hidden");
    if (scoreEl) scoreEl.textContent = `${this.score}`;
    if (highEl) highEl.textContent = `Kỷ lục: ${this.highScore}`;
  }

  updateHUD() {
    const scoreEl = document.getElementById("flappy-hud-score");
    if (scoreEl) scoreEl.textContent = `${this.score}`;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Sky gradient
    const grad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(0.7, '#38bdf8');
    grad.addColorStop(1, '#bae6fd');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Clouds Pipes (Thunderstorm obstacles)
    this.pipes.forEach(p => {
      // Top Column
      this.ctx.fillStyle = '#334155';
      this.ctx.fillRect(p.x, 0, 50, p.top);
      this.ctx.fillStyle = '#e5a919';
      this.ctx.fillRect(p.x - 4, p.top - 15, 58, 15);

      // Bottom Column
      this.ctx.fillStyle = '#334155';
      this.ctx.fillRect(p.x, p.bottom, 50, this.canvas.height - p.bottom);
      this.ctx.fillStyle = '#e5a919';
      this.ctx.fillRect(p.x - 4, p.bottom, 58, 15);
    });

    // Draw Cute Boeing 787 Bird
    this.ctx.save();
    this.ctx.translate(this.bird.x, this.bird.y);
    const angle = Math.max(-0.4, Math.min(0.6, this.bird.vy * 0.002));
    this.ctx.rotate(angle);

    // Plane body
    this.ctx.fillStyle = '#005f63';
    this.ctx.beginPath();
    this.ctx.ellipse(0, 2, 24, 7, 0, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.ellipse(0, -2, 24, 6, 0, Math.PI, Math.PI * 2);
    this.ctx.fill();

    // Tail
    this.ctx.fillStyle = '#005f63';
    this.ctx.beginPath();
    this.ctx.moveTo(-16, -2);
    this.ctx.lineTo(-26, -16);
    this.ctx.lineTo(-18, -16);
    this.ctx.lineTo(-8, -2);
    this.ctx.fill();

    // Lotus
    this.ctx.fillStyle = '#e5a919';
    this.ctx.beginPath();
    this.ctx.arc(-20, -10, 2.5, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  gameLoop(currentTime) {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;
    this.update(dt);
    this.draw();
    this.animId = requestAnimationFrame((t) => this.gameLoop(t));
  }
}

// Attach globally
window.FlightGame = FlightGame;
window.SnackGame = SnackGame;
window.FlappyGame = FlappyGame;
