// =========================================================
// BOEING 787 FUN HUB - INTERACTIVE ENGINE & EXPANDED QUIZZES
// =========================================================

// --- 1. WEB AUDIO SYNTHESIZER ENGINE ---
class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    document.querySelectorAll(".mute-icon").forEach(icon => {
      icon.className = this.muted ? "fa-solid fa-volume-xmark mute-icon" : "fa-solid fa-volume-high mute-icon";
    });
    document.querySelectorAll(".mute-text").forEach(txt => {
      txt.textContent = this.muted ? "Bật Âm Thanh" : "Tắt Âm Thanh";
    });
    return this.muted;
  }

  playSeatbeltChime() {
    if (this.muted) return;
    this.initContext();
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.8);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(523.25, now + 0.45);
    gain2.gain.setValueAtTime(0.4, now + 0.45);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.45);
    osc2.stop(now + 1.4);
  }

  playEngineSound(duration = 2.0) {
    if (this.muted) return;
    this.initContext();
    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(150, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + duration * 0.7);
    filter.frequency.exponentialRampToValueAtTime(300, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.5, now + duration * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + duration);

    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + duration * 0.6);
    osc.frequency.exponentialRampToValueAtTime(120, now + duration);

    oscGain.gain.setValueAtTime(0.02, now);
    oscGain.gain.linearRampToValueAtTime(0.12, now + duration * 0.5);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  playClick() {
    if (this.muted) return;
    this.initContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  playHorn() {
    if (this.muted) return;
    this.initContext();
    const now = this.ctx.currentTime;

    [now, now + 0.2].forEach(startT => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(380, startT);
      gain.gain.setValueAtTime(0.3, startT);
      gain.gain.exponentialRampToValueAtTime(0.01, startT + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startT);
      osc.stop(startT + 0.12);
    });
  }

  playLotusChime() {
    if (this.muted) return;
    this.initContext();
    const now = this.ctx.currentTime;
    const freqs = [587.33, 880, 1174.66];
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.06);
      gain.gain.setValueAtTime(0.25, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.4);
    });
  }

  playTurbulence() {
    if (this.muted) return;
    this.initContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(65, now);
    osc.frequency.linearRampToValueAtTime(45, now + 0.3);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  playTouchdown() {
    if (this.muted) return;
    this.initContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.25);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playFanfare() {
    if (this.muted) return;
    this.initContext();
    const now = this.ctx.currentTime;
    const melody = [
      { f: 523.25, t: 0 },
      { f: 659.25, t: 0.12 },
      { f: 783.99, t: 0.24 },
      { f: 1046.50, t: 0.36 }
    ];
    melody.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, now + note.t);
      gain.gain.setValueAtTime(0.3, now + note.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + note.t);
      osc.stop(now + note.t + 0.5);
    });
  }

  playWheelTick() {
    if (this.muted) return;
    this.initContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }
}

window.AudioEngine = new SoundSynthesizer();

// --- 2. BOARDING PASS GENERATOR ---
function initBoardingPassGenerator() {
  const inputName = document.getElementById("pass-input-name");
  const selectRole = document.getElementById("pass-select-role");
  const selectDest = document.getElementById("pass-select-dest");
  const btnGenerate = document.getElementById("btn-generate-pass");

  const passName = document.getElementById("ticket-passenger-name");
  const passRole = document.getElementById("ticket-role-badge");
  const passDest = document.getElementById("ticket-dest-code");
  const passDestCity = document.getElementById("ticket-dest-city");
  const passFlightNo = document.getElementById("ticket-flight-no");
  const passSeat = document.getElementById("ticket-seat-no");

  const destinations = {
    "HAN": { city: "HÀ NỘI (HAN)", flight: "VN-7871" },
    "SGN": { city: "TP. HỒ CHÍ MINH (SGN)", flight: "VN-7872" },
    "CDG": { city: "PARIS (CDG)", flight: "VN-19" },
    "HND": { city: "TOKYO (HND)", flight: "VN-384" },
    "LHR": { city: "LONDON (LHR)", flight: "VN-55" },
    "MOON": { city: "MẶT TRĂNG GALAXY (MOON)", flight: "VN-8888" }
  };

  function updateTicket() {
    const name = (inputName && inputName.value.trim()) ? inputName.value.trim().toUpperCase() : "NGUYỄN VĂN AN";
    const role = (selectRole && selectRole.value) ? selectRole.value : "CƠ TRƯỞNG TẬP SỰ ⭐⭐⭐";
    const destCode = (selectDest && selectDest.value) ? selectDest.value : "CDG";
    const destInfo = destinations[destCode] || destinations["CDG"];

    if (passName) passName.textContent = name;
    if (passRole) passRole.textContent = role;
    if (passDest) passDest.textContent = destCode;
    if (passDestCity) passDestCity.textContent = destInfo.city;
    if (passFlightNo) passFlightNo.textContent = destInfo.flight;
    if (passSeat) {
      const seats = ["01A", "01B", "02A", "08K", "88A"];
      passSeat.textContent = seats[Math.floor(Math.random() * seats.length)];
    }

    window.AudioEngine.playSeatbeltChime();
    if (window.confetti) window.confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  }

  if (btnGenerate) btnGenerate.onclick = updateTicket;
  if (inputName) {
    inputName.addEventListener("keyup", (e) => {
      if (e.key === "Enter") updateTicket();
    });
  }
}

// --- 3. LUCKY SPIN WHEEL ---
function initLuckyWheel() {
  const wheelCanvas = document.getElementById("wheel-canvas");
  const btnSpin = document.getElementById("btn-spin-wheel");
  const prizeResult = document.getElementById("wheel-prize-result");
  if (!wheelCanvas || !btnSpin) return;

  const ctx = wheelCanvas.getContext("2d");
  wheelCanvas.width = 320;
  wheelCanvas.height = 320;

  const slices = [
    { label: "🏆 Cơ Trưởng VIP", color: "#005f63", textCol: "#ffffff", desc: "Bạn được thăng chức Cơ Trưởng Danh Dự số 1 phi đội!" },
    { label: "🧋 1M Ly Trà Sữa", color: "#e5a919", textCol: "#0f172a", desc: "Khoang hành lý B787 chở đầy trà sữa trân châu cho bạn!" },
    { label: "😴 Thánh Ngủ", color: "#6366f1", textCol: "#ffffff", desc: "Tặng vé ngủ thẳng cẳng từ lúc cất cánh đến hạ cánh!" },
    { label: "🚀 Vé Lên Sao Hỏa", color: "#ec4899", textCol: "#ffffff", desc: "Phi thuyền Dreamliner đưa bạn lên ngắm sao băng!" },
    { label: "🥜 100 Gói Lạc", color: "#14b8a6", textCol: "#0f172a", desc: "Tiếp viên trao tặng bạn kho lạc rang thơm nức mũi!" },
    { label: "👑 Tay Lái Lụa", color: "#f59e0b", textCol: "#0f172a", desc: "Hạ cánh êm như nhung không một giọt nước sánh!" },
    { label: "🕶️ Kính Râm Ngầu", color: "#3b82f6", textCol: "#ffffff", desc: "Nhận danh hiệu Phi Công Đẹp Trai/Xinh Gái Nhất Năm!" },
    { label: "🍌 Vỏ Chuối Vui", color: "#eab308", textCol: "#0f172a", desc: "Bạn vừa trượt chân nhưng tiếp đất phong cách siêu mẫu!" }
  ];

  const numSlices = slices.length;
  const sliceAngle = (2 * Math.PI) / numSlices;
  let currentRotation = 0;
  let isSpinning = false;

  function drawWheel() {
    ctx.clearRect(0, 0, 320, 320);
    const centerX = 160;
    const centerY = 160;
    const radius = 150;

    slices.forEach((s, idx) => {
      const angle = idx * sliceAngle;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + sliceAngle);
      ctx.fillStyle = s.color;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = s.textCol;
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(s.label, radius - 15, 4);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, 28, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#e5a919";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = "#005f63";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🪷", centerX, centerY + 6);
  }

  drawWheel();

  btnSpin.onclick = () => {
    if (isSpinning) return;
    isSpinning = true;
    btnSpin.disabled = true;
    if (prizeResult) prizeResult.innerHTML = `<span class="text-amber-400 font-bold animate-pulse">Đang quay tìm nhân phẩm...</span>`;

    const randomSlices = 5 * numSlices + Math.floor(Math.random() * numSlices);
    const extraDeg = randomSlices * (360 / numSlices) + Math.random() * (360 / numSlices - 4) + 2;
    currentRotation += extraDeg;

    wheelCanvas.style.transform = `rotate(${currentRotation}deg)`;

    let ticks = 0;
    const tickInterval = setInterval(() => {
      window.AudioEngine.playWheelTick();
      ticks++;
      if (ticks > 25) clearInterval(tickInterval);
    }, 140);

    setTimeout(() => {
      isSpinning = false;
      btnSpin.disabled = false;

      const actualDeg = (currentRotation % 360);
      const pointerDeg = (360 - (actualDeg % 360) + 270) % 360;
      const winningIdx = Math.floor(pointerDeg / (360 / numSlices)) % numSlices;
      const winner = slices[winningIdx];

      if (prizeResult) {
        prizeResult.innerHTML = `
          <div class="p-4 bg-amber-500/20 border-2 border-amber-400 rounded-2xl text-center space-y-2 animate-bounce">
            <div class="text-2xl">${winner.label}</div>
            <div class="text-xs sm:text-sm text-slate-100 font-medium">${winner.desc}</div>
          </div>
        `;
      }

      window.AudioEngine.playFanfare();
      if (window.confetti) window.confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }, 4100);
  };
}

// --- 4. PASSENGER SEAT SIMULATOR ---
function initPassengerSeatSimulator() {
  const btnCallAttendant = document.getElementById("seat-btn-call");
  const btnRecline = document.getElementById("seat-btn-recline");
  const btnAirFan = document.getElementById("seat-btn-fan");
  const btnWindowDim = document.getElementById("seat-btn-window");

  const seatBackrest = document.getElementById("seat-backrest-el");
  const rearPassengerMeme = document.getElementById("seat-rear-passenger-meme");
  const foodTrayBox = document.getElementById("seat-food-tray-box");
  const fanWindLines = document.getElementById("seat-fan-wind-lines");
  const windowGlass = document.getElementById("seat-window-glass");

  let isReclined = false;
  let isFanOn = false;
  let windowDimLevel = 0;

  if (btnCallAttendant) {
    btnCallAttendant.onclick = () => {
      window.AudioEngine.playSeatbeltChime();

      const snacks = [
        { name: "🍜 Mì Tôm Hảo Hảo Máy Bay", quote: "Dạ mì tôm nóng hổi thơm nức khoang khách đây ạ!" },
        { name: "🧋 Trà Sữa Trân Châu Hoàng Gia", quote: "Dạ trà sữa full topping 70% đường 30% đá cho khách VIP!" },
        { name: "🥖 Bánh Mì Kẹp Thịt Giòn Tan", quote: "Bánh mì Việt Nam thơm lừng ăn kèm nụ cười tiếp viên!" },
        { name: "☕ Cà Phê Sữa Đá Đậm Đà", quote: "Cà phê sữa đá giúp bạn tỉnh táo ngắm mây trời!" },
        { name: "🧸 Chú Gấu Bông Phi Công", quote: "Món quà đặc biệt dành tặng hành khách dễ thương nhất!" }
      ];
      const s = snacks[Math.floor(Math.random() * snacks.length)];

      if (foodTrayBox) {
        foodTrayBox.innerHTML = `
          <div class="p-3 bg-emerald-950/90 border border-emerald-400 rounded-xl text-center space-y-1 animate-float">
            <div class="text-xs font-bold text-emerald-300">🛎️ TIẾP VIÊN MANG ĐẾN:</div>
            <div class="text-sm font-extrabold text-amber-300">${s.name}</div>
            <div class="text-[11px] text-slate-200">"${s.quote}"</div>
          </div>
        `;
      }
    };
  }

  if (btnRecline) {
    btnRecline.onclick = () => {
      isReclined = !isReclined;
      window.AudioEngine.playClick();

      if (seatBackrest) {
        if (isReclined) seatBackrest.classList.add("seat-recline-active");
        else seatBackrest.classList.remove("seat-recline-active");
      }

      if (rearPassengerMeme) {
        if (isReclined) {
          const memes = [
            "😱 Ủa bạn ơi ngả vừa thôi gãy chân tôi!",
            "😭 Ngả thêm 2cm nữa là nằm chung luôn nè!",
            "☕ Ly cà phê của tôi suýt đổ úp lên mặt rồi bạn ơi!"
          ];
          rearPassengerMeme.textContent = memes[Math.floor(Math.random() * memes.length)];
          rearPassengerMeme.className = "text-xs font-bold text-red-400 p-2 bg-red-950/80 rounded-lg block border border-red-500/40";
        } else {
          rearPassengerMeme.textContent = "😊 Cảm ơn bạn đã trả ghế thẳng thớm!";
          rearPassengerMeme.className = "text-xs font-bold text-emerald-400 p-2 bg-emerald-950/80 rounded-lg block border border-emerald-500/40";
        }
      }
    };
  }

  if (btnAirFan) {
    btnAirFan.onclick = () => {
      isFanOn = !isFanOn;
      window.AudioEngine.playClick();
      if (fanWindLines) {
        if (isFanOn) {
          fanWindLines.classList.remove("hidden");
          btnAirFan.classList.add("bg-cyan-500", "text-slate-950");
        } else {
          fanWindLines.classList.add("hidden");
          btnAirFan.classList.remove("bg-cyan-500", "text-slate-950");
        }
      }
    };
  }

  if (btnWindowDim) {
    btnWindowDim.onclick = () => {
      windowDimLevel = (windowDimLevel + 1) % 4;
      window.AudioEngine.playClick();
      const tints = [
        { filter: "brightness(1.0)", text: "Trong Suốt 100%" },
        { filter: "brightness(0.7)", text: "Kính Râm 60%" },
        { filter: "brightness(0.4)", text: "Kính Tối 30%" },
        { filter: "brightness(0.1)", text: "Đêm Sao Kín Đáo" }
      ];
      const cur = tints[windowDimLevel];
      if (windowGlass) {
        windowGlass.style.filter = cur.filter;
        btnWindowDim.textContent = `🕶️ Cửa Sổ: ${cur.text}`;
      }
    };
  }
}

// --- 5. EXPANDED QUIZ HUB ---
function initQuizHub() {
  const rumorsData = [
    {
      q: "Khi bạn bấm xả bồn cầu máy bay ở độ cao 10.000m, chất thải sẽ biến đi đâu?",
      opts: [
        { text: "A. Xả thẳng xuống trời thành mưa", correct: false, note: "Sai bét! Máy bay không bao giờ xả chất thải ra ngoài trời đâu nha!" },
        { text: "B. Bị hút chân không 150km/h vào bình chứa đáy máy bay", correct: true, note: "Chuẩn 100%! Hút chân không tốc độ bão cấp 13 và giữ lại trong bồn kín!" },
        { text: "C. Biến thành xăng đốt cho động cơ", correct: false, note: "Haha, công nghệ này tương lai chắc mới có!" }
      ]
    },
    {
      q: "Phi công cơ trưởng và cơ phó có được ăn chung một món cơm không?",
      opts: [
        { text: "A. Bắt buộc ăn khác món để ngừa ngộ độc thức ăn cùng lúc", correct: true, note: "Chính xác tuyệt đối! Quy định an toàn hàng không bắt buộc 2 phi công ăn 2 món khác nhau!" },
        { text: "B. Ăn chung một hộp cơm để đoàn kết", correct: false, note: "Sai rồi! Lỡ cơm bị thiu thì ai lái máy bay!" },
        { text: "C. Phi công chỉ được uống nước lọc", correct: false, note: "Phi công cũng đói bụng chứ bạn ơi!" }
      ]
    },
    {
      q: "Kính chắn gió buồng lái máy bay có cần gạt nước mưa không?",
      opts: [
        { text: "A. Có cần gạt nước cực mạnh và xịt nước rửa kính", correct: true, note: "Chuẩn luôn! Có cần gạt nước mưa quét cực nhanh khi cất/hạ cánh lúc trời mưa bão!" },
        { text: "B. Không có, phi công lấy khăn lau tay", correct: false, note: "Kính ở ngoài trời sao thò tay ra lau được!" },
        { text: "C. Bay nhanh quá nước tự bay đi hết", correct: false, note: "Lúc đỗ ở sân bay trời mưa vẫn cần gạt nước chứ!" }
      ]
    },
    {
      q: "Hộp đen (Black Box) máy bay có màu gì?",
      opts: [
        { text: "A. Màu cam dạ quang chói lóa", correct: true, note: "Chính xác! Màu cam dạ quang để đội cứu hộ dễ tìm nhất!" },
        { text: "B. Màu đen tuyền", correct: false, note: "Tên là hộp đen nhưng màu thật là cam chói lóa!" },
        { text: "C. Màu cầu vồng", correct: false, note: "Không phải màu cầu vồng đâu nha!" }
      ]
    },
    {
      q: "Máy bay có còi bấm 'Bim Bim' không?",
      opts: [
        { text: "A. Có còi Ground Call để gọi thợ máy dưới sân", correct: true, note: "Bất ngờ chưa: Máy bay CÓ CÒI để gọi nhân viên mặt đất!" },
        { text: "B. Không có, bấm trên trời ai nghe", correct: false, note: "Dưới mặt đất vẫn cần bấm còi gọi nhau chứ!" },
        { text: "C. Chỉ bấm khi tắc đường bay", correct: false, note: "Bầu trời bao la không sợ kẹt xe nha!" }
      ]
    }
  ];

  let rIdx = 0;
  let rScore = 0;
  const rQTitle = document.getElementById("rumor-q-title");
  const rOptsBox = document.getElementById("rumor-opts-box");
  const rFeedback = document.getElementById("rumor-feedback");
  const rBtnNext = document.getElementById("rumor-btn-next");
  const rProg = document.getElementById("rumor-prog-text");

  function loadRumor(idx) {
    if (idx >= rumorsData.length) {
      if (rQTitle) rQTitle.textContent = "🏆 HOÀN THÀNH ĐỐ VUI BỰA!";
      if (rOptsBox) {
        rOptsBox.innerHTML = `
          <div class="text-center py-6 space-y-4">
            <div class="text-4xl">🎖️</div>
            <div class="text-xl font-bold text-amber-400">Bạn đã đúng ${rScore}/${rumorsData.length} câu!</div>
            <p class="text-slate-300 text-sm">Bạn đúng là một chuyên gia hàng không hài hước!</p>
            <button id="btn-restart-rumors" class="px-6 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl">Chơi Lại</button>
          </div>
        `;
        document.getElementById("btn-restart-rumors")?.addEventListener("click", () => {
          rIdx = 0;
          rScore = 0;
          loadRumor(0);
        });
      }
      if (rFeedback) rFeedback.className = "hidden";
      if (rBtnNext) rBtnNext.classList.add("hidden");
      window.AudioEngine.playFanfare();
      return;
    }

    const cur = rumorsData[idx];
    if (rQTitle) rQTitle.textContent = `Câu ${idx + 1}: ${cur.q}`;
    if (rProg) rProg.textContent = `Câu ${idx + 1}/${rumorsData.length}`;
    if (rFeedback) rFeedback.className = "hidden";
    if (rBtnNext) rBtnNext.classList.add("hidden");

    if (rOptsBox) {
      rOptsBox.innerHTML = "";
      cur.opts.forEach(opt => {
        const b = document.createElement("button");
        b.className = "w-full text-left p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sm font-semibold transition-all";
        b.textContent = opt.text;
        b.onclick = () => {
          rOptsBox.querySelectorAll("button").forEach(btn => btn.disabled = true);
          if (opt.correct) {
            rScore++;
            b.className = "w-full text-left p-3.5 rounded-xl bg-emerald-950 border-2 border-emerald-400 text-emerald-200 text-sm font-bold";
            if (rFeedback) {
              rFeedback.textContent = `🎉 ${opt.note}`;
              rFeedback.className = "text-xs p-3 rounded-xl bg-emerald-900/80 border border-emerald-500 text-emerald-100 block mt-3 font-semibold";
            }
            window.AudioEngine.playLotusChime();
          } else {
            b.className = "w-full text-left p-3.5 rounded-xl bg-red-950 border-2 border-red-400 text-red-200 text-sm font-bold";
            if (rFeedback) {
              rFeedback.textContent = `😅 ${opt.note}`;
              rFeedback.className = "text-xs p-3 rounded-xl bg-red-900/80 border border-red-500 text-red-100 block mt-3 font-semibold";
            }
            window.AudioEngine.playTurbulence();
          }
          if (rBtnNext) rBtnNext.classList.remove("hidden");
        };
        rOptsBox.appendChild(b);
      });
    }
  }

  if (rBtnNext) {
    rBtnNext.onclick = () => {
      rIdx++;
      loadRumor(rIdx);
    };
  }

  loadRumor(0);
  initPassengerPersona();
  initSoundGuessQuiz();
}

// Passenger Persona
function initPassengerPersona() {
  const pData = [
    {
      q: "Vừa bước chân lên máy bay, việc đầu tiên bạn làm là gì?",
      opts: [
        { text: "Đeo bịt mắt, gối chữ C và nhắm mắt ngủ ngay lập tức 😴", type: "sleeper" },
        { text: "Bấm chuông gọi tiếp viên xin ngay cốc nước cam / lon coca 🥤", type: "snacker" },
        { text: "Cầm điện thoại chụp 50 tấm ảnh cửa sổ và cánh máy bay 📸", type: "photographer" },
        { text: "Hồi hộp chờ máy bay hạ cánh để vỗ tay ăn mừng 👏", type: "clapper" }
      ]
    },
    {
      q: "Khi máy bay đi qua vùng thời tiết hơi lắc lư (nhiễu động), bạn sẽ:",
      opts: [
        { text: "Ngủ say như không có chuyện gì xảy ra 💤", type: "sleeper" },
        { text: "Vẫn bình tĩnh nhai tiếp gói hạt điều giòn rụm 🥜", type: "snacker" },
        { text: "Quay video cảnh cánh máy bay uốn dẻo siêu đẹp 📱", type: "photographer" },
        { text: "Nắm chặt tay ghế và sẵn sàng tinh thần vỗ tay khi tiếp đất an toàn 👏", type: "clapper" }
      ]
    }
  ];

  const results = {
    "sleeper": {
      title: "😴 THÁNH NGỦ VÔ CỰC",
      desc: "Bạn có siêu năng lực ngủ xuyên lục địa! Dù máy bay cất cánh, hạ cánh hay rung lắc, bạn vẫn ngủ ngon lành và thức dậy tràn đầy năng lượng khi đến nơi!"
    },
    "snacker": {
      title: "🧋 THÁNH ĂN VẶT TRÊN MÂY",
      desc: "Chuyến bay của bạn là một tour ẩm thực trên không! Bạn nếm trọn trà sữa, mì tôm, bánh ngọt và luôn biết rõ món nào ngon nhất trên máy bay!"
    },
    "photographer": {
      title: "📸 THỢ SĂN MÂY CHECK-IN",
      desc: "Album ảnh của bạn toàn kiệt tác hoàng hôn, cánh uốn 787 và mây bồng bềnh! Bạn là người truyền cảm hứng du lịch tuyệt đỉnh cho bạn bè!"
    },
    "clapper": {
      title: "👏 CHIẾN THẦN VỖ TAY HẠ CÁNH",
      desc: "Bạn là người tràn đầy cảm xúc và tình yêu thương! Khoảnh khắc bánh xe chạm đất, tràng pháo tay giòn giã của bạn làm cả cabin vui lây!"
    }
  };

  let step = 0;
  let scores = { sleeper: 0, snacker: 0, photographer: 0, clapper: 0 };
  const pQTitle = document.getElementById("persona-q-title");
  const pOptsBox = document.getElementById("persona-opts-box");
  const pResultBox = document.getElementById("persona-result-box");

  function renderPersona(s) {
    if (s >= pData.length) {
      let topType = "sleeper";
      let maxScore = -1;
      Object.keys(scores).forEach(k => {
        if (scores[k] > maxScore) {
          maxScore = scores[k];
          topType = k;
        }
      });
      const res = results[topType];
      if (pQTitle) pQTitle.textContent = "✨ KẾT QUẢ TÍNH CÁCH HÀNH KHÁCH ✨";
      if (pOptsBox) pOptsBox.innerHTML = "";
      if (pResultBox) {
        pResultBox.innerHTML = `
          <div class="p-5 bg-gradient-to-r from-amber-500/20 to-teal-500/20 border-2 border-amber-400 rounded-2xl text-center space-y-3">
            <div class="text-xl font-black text-amber-400">${res.title}</div>
            <p class="text-slate-200 text-xs sm:text-sm leading-relaxed">${res.desc}</p>
            <button id="btn-re-persona" class="px-5 py-2 rounded-xl bg-vna-teal text-white font-bold text-xs">Trắc Nghiệm Lại</button>
          </div>
        `;
        document.getElementById("btn-re-persona")?.addEventListener("click", () => {
          step = 0;
          scores = { sleeper: 0, snacker: 0, photographer: 0, clapper: 0 };
          pResultBox.innerHTML = "";
          renderPersona(0);
        });
      }
      window.AudioEngine.playFanfare();
      return;
    }

    const cur = pData[s];
    if (pQTitle) pQTitle.textContent = `Câu ${s + 1}: ${cur.q}`;
    if (pOptsBox) {
      pOptsBox.innerHTML = "";
      cur.opts.forEach(opt => {
        const b = document.createElement("button");
        b.className = "w-full text-left p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sm font-semibold transition-all";
        b.textContent = opt.text;
        b.onclick = () => {
          scores[opt.type] = (scores[opt.type] || 0) + 1;
          step++;
          window.AudioEngine.playClick();
          renderPersona(step);
        };
        pOptsBox.appendChild(b);
      });
    }
  }

  renderPersona(0);
}

// Sound Guessing Quiz
function initSoundGuessQuiz() {
  const soundQuestions = [
    {
      action: () => window.AudioEngine.playSeatbeltChime(),
      q: "Âm thanh 2 tiếng vừa phát ra là gì?",
      opts: [
        { text: "Chuông Ting-Tong nhắc thắt dây an toàn 🔔", correct: true },
        { text: "Tiếng chim hót trong cabin 🐦", correct: false },
        { text: "Tiếng còi báo hết xăng ⛽", correct: false }
      ]
    },
    {
      action: () => window.AudioEngine.playHorn(),
      q: "Âm thanh 'Bim Bim' này dùng để làm gì?",
      opts: [
        { text: "Phi công bấm còi gọi thợ máy dưới mặt đất 📢", correct: true },
        { text: "Bấm còi xin vượt máy bay khác ✈️", correct: false },
        { text: "Bấm để đuổi mây ☁️", correct: false }
      ]
    },
    {
      action: () => window.AudioEngine.playTouchdown(),
      q: "Âm thanh ken két này xuất hiện khi nào?",
      opts: [
        { text: "Bánh xe ma sát mặt đường băng khi tiếp đất 🛞", correct: true },
        { text: "Ai đó mở cánh cửa máy bay trên trời 🚪", correct: false },
        { text: "Mèo kêu trên máy bay 🐱", correct: false }
      ]
    }
  ];

  let sIdx = 0;
  const btnPlaySound = document.getElementById("btn-play-quiz-sound");
  const sQTitle = document.getElementById("sound-q-title");
  const sOptsBox = document.getElementById("sound-opts-box");
  const sFeedback = document.getElementById("sound-feedback");

  function loadSoundQ(idx) {
    if (idx >= soundQuestions.length) {
      if (sQTitle) sQTitle.textContent = "🏆 BẠN CÓ ĐÔI TAI VÀNG HÀNG KHÔNG!";
      if (sOptsBox) {
        sOptsBox.innerHTML = `<div class="text-center text-amber-400 font-bold py-4">Bạn đã đoán đúng tất cả các âm thanh buồng lái!</div>`;
      }
      if (btnPlaySound) btnPlaySound.classList.add("hidden");
      return;
    }

    const cur = soundQuestions[idx];
    if (sQTitle) sQTitle.textContent = `Câu ${idx + 1}: ${cur.q}`;
    if (sFeedback) sFeedback.className = "hidden";

    if (btnPlaySound) {
      btnPlaySound.onclick = () => {
        cur.action();
        btnPlaySound.classList.add("scale-95");
        setTimeout(() => btnPlaySound.classList.remove("scale-95"), 200);
      };
    }

    if (sOptsBox) {
      sOptsBox.innerHTML = "";
      cur.opts.forEach(opt => {
        const b = document.createElement("button");
        b.className = "w-full text-left p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sm font-semibold transition-all";
        b.textContent = opt.text;
        b.onclick = () => {
          if (opt.correct) {
            b.className = "w-full text-left p-3.5 rounded-xl bg-emerald-950 border-2 border-emerald-400 text-emerald-200 text-sm font-bold";
            if (sFeedback) {
              sFeedback.textContent = "🎉 Chính xác tuyệt đối!";
              sFeedback.className = "text-xs p-2 rounded-lg bg-emerald-900 text-emerald-200 block mt-2 font-bold";
            }
            window.AudioEngine.playLotusChime();
            setTimeout(() => {
              sIdx++;
              loadSoundQ(sIdx);
            }, 1200);
          } else {
            b.className = "w-full text-left p-3.5 rounded-xl bg-red-950 border-2 border-red-400 text-red-200 text-sm font-bold";
            if (sFeedback) {
              sFeedback.textContent = "😅 Chưa đúng rồi, hãy bấm nút nghe lại nha!";
              sFeedback.className = "text-xs p-2 rounded-lg bg-red-900 text-red-200 block mt-2 font-bold";
            }
            window.AudioEngine.playTurbulence();
          }
        };
        sOptsBox.appendChild(b);
      });
    }
  }

  loadSoundQ(0);
}

// --- 6. GAME TAB SWITCHER (3 GAMES) ---
function initGameTabs() {
  const tabBtnFlight = document.getElementById("tab-btn-flight");
  const tabBtnSnack = document.getElementById("tab-btn-snack");
  const tabBtnFlappy = document.getElementById("tab-btn-flappy");

  const panelFlight = document.getElementById("tab-game-flight");
  const panelSnack = document.getElementById("tab-game-snack");
  const panelFlappy = document.getElementById("tab-game-flappy");

  const tabs = [
    { btn: tabBtnFlight, panel: panelFlight },
    { btn: tabBtnSnack, panel: panelSnack },
    { btn: tabBtnFlappy, panel: panelFlappy }
  ];

  tabs.forEach(t => {
    if (!t.btn) return;
    t.btn.onclick = () => {
      tabs.forEach(other => {
        if (other.btn) {
          other.btn.className = "px-4 sm:px-5 py-2.5 rounded-xl bg-slate-900 text-slate-300 font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-all flex items-center gap-1.5";
        }
        if (other.panel) {
          other.panel.classList.add("hidden");
          other.panel.classList.remove("active-game-tab");
        }
      });

      t.btn.className = "px-4 sm:px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5";
      if (t.panel) {
        t.panel.classList.remove("hidden");
        t.panel.classList.add("active-game-tab");
      }
    };
  });
}

// DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".btn-toggle-sound").forEach(b => {
    b.onclick = () => window.AudioEngine.toggleMute();
  });

  initBoardingPassGenerator();
  initLuckyWheel();
  initPassengerSeatSimulator();
  initQuizHub();
  initGameTabs();

  // Initialize all 3 mini games
  if (document.getElementById("game-canvas")) {
    window.flightGame = new window.FlightGame("game-canvas");
  }
  if (document.getElementById("snack-canvas")) {
    window.snackGame = new window.SnackGame("snack-canvas");
  }
  if (document.getElementById("flappy-canvas")) {
    window.flappyGame = new window.FlappyGame("flappy-canvas");
  }
});
