/* -------------------------------------------------------------
   1. STARFIELD & SUPERSONIC AIRCRAFT SKY CANVAS ANIMATION
   ------------------------------------------------------------- */
const skyCanvas = document.getElementById('skyCanvas');
if (skyCanvas) {
  const ctx = skyCanvas.getContext('2d');
  let width = (skyCanvas.width = window.innerWidth);
  let height = (skyCanvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = skyCanvas.width = window.innerWidth;
    height = skyCanvas.height = window.innerHeight;
  });

  // Stars particles
  const stars = [];
  const STAR_COUNT = 70;
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      speedX: -(Math.random() * 0.2 + 0.05),
      opacity: Math.random() * 0.8 + 0.2
    });
  }

  // Shooting plane trail
  let jetPlane = {
    x: -100,
    y: height * 0.25,
    speed: 1.8,
    active: true
  };

  function animateSky() {
    ctx.clearRect(0, 0, width, height);

    // Draw stars
    ctx.fillStyle = '#ffffff';
    stars.forEach((star) => {
      ctx.globalAlpha = star.opacity;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();

      star.x += star.speedX;
      if (star.x < 0) {
        star.x = width;
        star.y = Math.random() * height;
      }
    });

    // Draw Jet Plane Trail across sky
    if (jetPlane.active) {
      ctx.globalAlpha = 0.4;
      const trailGrad = ctx.createLinearGradient(
        jetPlane.x - 80,
        jetPlane.y,
        jetPlane.x,
        jetPlane.y
      );
      trailGrad.addColorStop(0, 'transparent');
      trailGrad.addColorStop(1, '#38bdf8');
      ctx.strokeStyle = trailGrad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(jetPlane.x - 80, jetPlane.y);
      ctx.lineTo(jetPlane.x, jetPlane.y);
      ctx.stroke();

      // Plane icon dot
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(jetPlane.x, jetPlane.y, 2, 0, Math.PI * 2);
      ctx.fill();

      jetPlane.x += jetPlane.speed;
      if (jetPlane.x > width + 100) {
        jetPlane.x = -150;
        jetPlane.y = Math.random() * (height * 0.5) + 50;
      }
    }

    requestAnimationFrame(animateSky);
  }
  animateSky();
}

/* -------------------------------------------------------------
   2. MOUSE FOLLOW GLOW EFFECT
   ------------------------------------------------------------- */
const mouseGlow = document.getElementById('mouseGlow');
if (mouseGlow) {
  document.addEventListener('mousemove', (e) => {
    mouseGlow.style.left = `${e.clientX}px`;
    mouseGlow.style.top = `${e.clientY}px`;
    mouseGlow.style.opacity = '1';
  });
}

/* -------------------------------------------------------------
   3. WEB AUDIO JET ENGINE AMBIENT SOUND SYNTHESIZER
   ------------------------------------------------------------- */
let audioCtx = null;
let noiseNode = null;
let isAudioPlaying = false;
const audioToggleBtn = document.getElementById('audioToggleBtn');
const audioIcon = document.getElementById('audioIcon');

function toggleJetSound() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }

  if (!audioCtx) return;

  if (isAudioPlaying) {
    if (noiseNode) {
      try { noiseNode.stop(); noiseNode.disconnect(); } catch (err) {}
      noiseNode = null;
    }
    isAudioPlaying = false;
    if (audioIcon) audioIcon.className = 'fa-solid fa-volume-xmark';
    showToast('Âm thanh buồng lái: ĐÃ TẮT');
  } else {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Generate Pink/Brown Noise buffer for smooth jet turbine hum
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 2.5; // Gain
    }

    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    // Lowpass filter to simulate sound inside pressurized B787 cabin
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, audioCtx.currentTime);

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);

    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    noiseNode.start();
    isAudioPlaying = true;
    if (audioIcon) audioIcon.className = 'fa-solid fa-volume-high text-cyan';
    showToast('Âm thanh buồng lái B787: ĐÃ BẬT', 'Tiếng động cơ turbine êm ái mô phỏng trong cabin.');
  }
}

if (audioToggleBtn) {
  audioToggleBtn.addEventListener('click', toggleJetSound);
}

/* -------------------------------------------------------------
   4. NAVIGATION BAR SCROLL & MOBILE MENU
   ------------------------------------------------------------- */
const header = document.getElementById('header');
const sections = document.querySelectorAll('section');
const navItems = document.querySelectorAll('.nav-links a');
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    header?.classList.add('scrolled');
  } else {
    header?.classList.remove('scrolled');
  }

  let currentSection = '';
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (window.pageYOffset >= sectionTop - sectionHeight / 3.5) {
      currentSection = section.getAttribute('id');
    }
  });

  navItems.forEach((item) => {
    item.classList.remove('active');
    if (item.getAttribute('href').substring(1) === currentSection) {
      item.classList.add('active');
    }
  });
});

if (menuBtn && navLinks) {
  const menuIcon = menuBtn.querySelector('i');
  menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    if (navLinks.classList.contains('active')) {
      menuIcon.className = 'fa-solid fa-xmark';
    } else {
      menuIcon.className = 'fa-solid fa-bars-staggered';
    }
  });

  navItems.forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      if (menuIcon) menuIcon.className = 'fa-solid fa-bars-staggered';
    });
  });
}

/* -------------------------------------------------------------
   5. SCROLL REVEAL ANIMATIONS
   ------------------------------------------------------------- */
const reveals = document.querySelectorAll('.reveal');
const checkReveal = () => {
  const triggerBottom = window.innerHeight * 0.88;
  reveals.forEach((revealEl) => {
    const revealTop = revealEl.getBoundingClientRect().top;
    if (revealTop < triggerBottom) {
      revealEl.classList.add('active');
    }
  });
};
window.addEventListener('scroll', checkReveal);
window.addEventListener('load', checkReveal);

/* -------------------------------------------------------------
   6. SHOWCASE THUMBNAIL SELECTOR
   ------------------------------------------------------------- */
const showcaseMainImg = document.getElementById('showcaseMainImg');
const thumbBtns = document.querySelectorAll('.thumb-btn');

thumbBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    thumbBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const newSrc = btn.getAttribute('data-img');
    if (showcaseMainImg && newSrc) {
      showcaseMainImg.src = newSrc;
    }
  });
});

/* -------------------------------------------------------------
   7. COCKPIT HUD & FLIGHT SIMULATOR LOGIC
   ------------------------------------------------------------- */
const thrustSlider = document.getElementById('thrustSlider');
const thrustSliderVal = document.getElementById('thrustSliderVal');
const hudThrustVal = document.getElementById('hudThrustVal');
const hudThrustBar = document.getElementById('hudThrustBar');
const hudSpeedVal = document.getElementById('hudSpeedVal');
const hudSpeedBar = document.getElementById('hudSpeedBar');

const altSlider = document.getElementById('altSlider');
const altSliderVal = document.getElementById('altSliderVal');
const hudAltVal = document.getElementById('hudAltVal');
const hudAltBar = document.getElementById('hudAltBar');
const hudTipText = document.getElementById('hudTipText');

const flapsBtns = document.querySelectorAll('.flaps-btn');
const flapsVal = document.getElementById('flapsVal');

function updateHUD() {
  const thrust = parseInt(thrustSlider?.value || 85);
  const alt = parseInt(altSlider?.value || 39000);

  // Update Thrust
  if (thrustSliderVal) thrustSliderVal.textContent = `${thrust}% N1`;
  if (hudThrustVal) hudThrustVal.textContent = `${thrust}% N1`;
  if (hudThrustBar) hudThrustBar.style.width = `${thrust}%`;

  // Compute realistic Airspeed (Mach 0.70 to Mach 0.88 depending on thrust & alt)
  const mach = (0.65 + (thrust / 100) * 0.22).toFixed(2);
  const kmh = Math.round(mach * 1062);
  if (hudSpeedVal) hudSpeedVal.textContent = `Mach ${mach} (~ ${kmh} km/h)`;
  if (hudSpeedBar) hudSpeedBar.style.width = `${Math.min(100, (mach / 0.9) * 100)}%`;

  // Update Altitude
  if (altSliderVal) altSliderVal.textContent = `${alt.toLocaleString()} ft`;
  if (hudAltVal) hudAltVal.textContent = `${alt.toLocaleString()} FT (FL${Math.round(alt/100)})`;
  if (hudAltBar) hudAltBar.style.width = `${(alt / 43000) * 100}%`;

  // Dynamic Tips
  if (hudTipText) {
    if (alt >= 40000) {
      hudTipText.innerHTML = `<strong>Tầng bình lưu cao:</strong> Ở độ cao ${alt.toLocaleString()} ft, không khí cực kỳ loãng giúp máy bay giảm tối đa lực cản và tăng tốc độ hành trình tiết kiệm nhiên liệu!`;
    } else if (thrust >= 95) {
      hudTipText.innerHTML = `<strong>Chế độ cất cánh TOGA:</strong> Động cơ GEnx-1B đạt lực đẩy tối đa 340 kN mỗi bên, đưa tàu bay 254 tấn cất cánh mạnh mẽ!`;
    } else {
      hudTipText.innerHTML = `Thân máy bay B787 làm từ composite cho phép duy trì áp suất cabin ở mức 6.000 ft (thay vì 8.000 ft như vỏ nhôm), giúp hành khách không bị mệt mỏi và say độ cao.`;
    }
  }
}

thrustSlider?.addEventListener('input', updateHUD);
altSlider?.addEventListener('input', updateHUD);

flapsBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    flapsBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const fVal = btn.getAttribute('data-flaps');
    if (flapsVal) flapsVal.textContent = fVal;
    showToast(`Cấu hình cánh tà: ${fVal}`);
  });
});

/* -------------------------------------------------------------
   8. QUICK 8-PARTS VIEWER MODAL & TABS
   ------------------------------------------------------------- */
const partsModalBackdrop = document.getElementById('partsModalBackdrop');
const openPartsPreviewModalBtn = document.getElementById('openPartsPreviewModalBtn');
const closePartsModalBtn = document.getElementById('closePartsModalBtn');
const partsTabsRow = document.getElementById('partsTabsRow');
const partsTabContent = document.getElementById('partsTabContent');

const partsData = {
  radome: {
    title: '1. Mũi Máy Bay & Radar Thời Tiết (Radome)',
    eng: 'Nose Cone & Weather Radar Antenna',
    desc: 'Được chế tạo từ vật liệu composite thấm sóng vô tuyến đặc biệt, bảo vệ ăng-ten radar thời tiết Doppler đa tia quét mây giông cách xa tới 500 km.',
    specs: 'Tần số: X-band | Vật liệu: Quartz-fiber composite | Góc quét: 180°'
  },
  pitot: {
    title: '2. Cụm Ống Pitot & Cảm Biến Áp Suất Tĩnh',
    eng: 'Pitot-Static Probes & Air Data Sensors',
    desc: 'Hệ thống cảm biến đo áp suất toàn phần và góc tấn khí động, truyền dữ liệu thời gian thực tới 3 máy tính điều khiển bay Flight Management Computers.',
    specs: 'Trang bị sưởi điện chống đóng băng tự động | Độ chính xác: 0.1 knot'
  },
  cockpit: {
    title: '3. Buồng Lái Kỹ Thuật Số Glass Cockpit',
    eng: 'Advanced Electronic Flight Deck',
    desc: 'Trang bị 5 màn hình hiển thị LCD 15.1-inch siêu nét và 2 màn hình hiển thị trước kính lái (HUD - Head-Up Display) tiêu chuẩn cho cả Cơ trưởng và Cơ phó.',
    specs: '5 Màn hình LCD 15.1 inch | Dual HUD | Hệ thống điều khiển Fly-by-wire số'
  },
  engines: {
    title: '4. Động Cơ Phản Lực GEnx-1B',
    eng: 'General Electric GEnx-1B High-Bypass Turbofan',
    desc: 'Khối động cơ thế hệ mới với cánh quạt sợi carbon composite siêu nhẹ và viền răng cưa Chevrons ở đuôi giúp giảm tới 60% tiếng ồn cabin và tiết kiệm 20% nhiên liệu.',
    specs: 'Lực đẩy: 340 kN (76.000 lbf) | Tỷ số vòng quạt: 9.6:1 | Đường kính quạt: 2.82m'
  },
  wings: {
    title: '5. Cánh Khí Động & Đầu Cánh Vát (Raked Wingtip)',
    eng: 'High-Aspect-Ratio Wings & Raked Wingtips',
    desc: 'Cánh làm từ 100% sợi carbon uốn dẻo linh hoạt khi bay trong gió bão, đầu cánh vát chéo Raked Wingtip giúp triệt tiêu dòng xoáy lốc mà không cần winglet đứng.',
    specs: 'Sải cánh: 60.1 m | Độ uốn cong tối đa: 3.5 m | Diện tích: 377 m²'
  },
  gear: {
    title: '6. Cơ Cấu 3 Cụm Càng Đáp (Càng Trước & 2 Càng Sau)',
    eng: 'Tricycle Gear (Nose Gear & Dual Main Bogies)',
    image: 'images/b787_landing_gear_mechanism.png',
    desc: 'Hệ thống càng đáp gồm 3 cụm: 1 Càng mũi trước (2 bánh dẫn hướng bẻ lái ±70°) và 2 Cụm càng chính sau (mỗi bên 4 bánh búp-bê nghiêng = 8 bánh). Khi thu càng, xi-lanh thủy lực kéo càng mũi về phía trước, 2 càng sau nghiêng góc búp-bê chúc xuống để gập gọn gàng vào hốc bụng, sau đó 2 cánh cửa khoang càng sẽ khép kín phẳng 0°.',
    specs: 'Càng trước: 2 bánh | 2 Càng sau: 8 bánh (4 bánh/bên) | Phanh đĩa Carbon | Chống trượt ABS'
  },
  apu: {
    title: '7. Động Cơ Phụ APU Đuôi (Auxiliary Power Unit)',
    eng: 'Hamilton Sundstrand APS5000 Auxiliary Power Unit',
    image: 'images/b787_apu_closeup.png',
    desc: 'Máy phát điện turbine khí mini nằm ở đuôi máy bay, cung cấp điện 235V AC và hỗ trợ khởi động 2 động cơ chính khi máy bay đỗ tại sân bay.',
    specs: 'Công suất điện: 2 x 225 kVA | Khởi động độc lập không cần xe nguồn mặt đất'
  },
  rudder: {
    title: '8. Bánh Lái Đuôi & Đuôi Đứng (Vertical Stabilizer)',
    eng: 'Vertical Stabilizer & Fly-By-Wire Rudder',
    image: 'images/vietnam_airlines_b787_bg.png',
    desc: 'Đuôi đứng bằng sợi carbon nguyên khối sơn biểu tượng Bông Sen Vàng Vietnam Airlines, kiểm soát độ ổn định hướng và chuyển hướng bằng thủy lực điện tử.',
    specs: 'Chiều cao đuôi: 17.0 m | Điều khiển số hoàn toàn Fly-By-Wire'
  }
};

function renderPartDetail(partKey) {
  const data = partsData[partKey] || partsData.radome;
  if (partsTabContent) {
    const imgHtml = data.image ? `
      <div style="width: 100%; height: 200px; border-radius: 12px; overflow: hidden; margin-bottom: 1rem; border: 1px solid var(--glass-border);">
        <img src="${data.image}" alt="${data.title}" style="width: 100%; height: 100%; object-fit: cover;">
      </div>
    ` : '';
    partsTabContent.innerHTML = `
      <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--glass-border); border-radius: 14px; padding: 1.5rem; margin-top: 1rem;">
        ${imgHtml}
        <span style="font-size: 0.75rem; color: #fbbf24; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">CHI TIẾT KỸ THUẬT</span>
        <h4 style="font-family: var(--font-title); font-size: 1.35rem; color: white; margin: 0.3rem 0;">${data.title}</h4>
        <p style="font-size: 0.85rem; color: #38bdf8; font-family: var(--font-mono); margin-bottom: 0.85rem;">${data.eng}</p>
        <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1rem;">${data.desc}</p>
        <div style="background: rgba(56, 189, 248, 0.08); border-left: 3px solid #38bdf8; padding: 0.75rem 1rem; border-radius: 0 8px 8px 0; font-size: 0.85rem; color: #bae6fd;">
          <strong>Thông số chính:</strong> ${data.specs}
        </div>
      </div>
    `;
  }
}

if (openPartsPreviewModalBtn) {
  openPartsPreviewModalBtn.addEventListener('click', () => {
    if (partsModalBackdrop) partsModalBackdrop.classList.add('show');
    renderPartDetail('radome');
  });
}

if (closePartsModalBtn) {
  closePartsModalBtn.addEventListener('click', () => {
    if (partsModalBackdrop) partsModalBackdrop.classList.remove('show');
  });
}

if (partsModalBackdrop) {
  partsModalBackdrop.addEventListener('click', (e) => {
    if (e.target === partsModalBackdrop) {
      partsModalBackdrop.classList.remove('show');
    }
  });
}

const partTabBtns = document.querySelectorAll('.part-tab-btn');
partTabBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    partTabBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const partKey = btn.getAttribute('data-part');
    renderPartDetail(partKey);
  });
});

/* -------------------------------------------------------------
   9. BOEING 787-9 & AVIATION QUIZ + CERTIFICATE GENERATOR
   ------------------------------------------------------------- */
const quizQuestions = [
  {
    question: "Vật liệu tiên tiến nào chiếm hơn 50% cấu trúc thân và cánh của Boeing 787-9 Dreamliner?",
    options: [
      "Nhôm hàng không truyền thống",
      "Composite sợi carbon (Carbon-fiber)",
      "Thép không gỉ gia cường",
      "Hợp kim Titan nguyên khối"
    ],
    answerIndex: 1,
    feedback: "🎉 Chính xác! Hơn 50% khung thân B787 làm từ sợi carbon composite, giúp máy bay nhẹ hơn, chống ăn mòn và tiết kiệm tới 20% nhiên liệu.",
    image: "images/vietnam_airlines_b787_side_daylight.png"
  },
  {
    question: "Dòng động cơ phản lực siêu tiết kiệm nhiên liệu thế hệ mới nào được Vietnam Airlines trang bị trên Boeing 787-9?",
    options: [
      "General Electric GEnx-1B",
      "Pratt & Whitney PW4000",
      "Rolls-Royce Trent 700",
      "CFM International LEAP-1A"
    ],
    answerIndex: 0,
    feedback: "🎉 Tuyệt vời! Động cơ GEnx-1B sở hữu cánh quạt sợi composite và răng cưa chevron ở đuôi giúp giảm tiếng ồn cabin tới 60%.",
    image: "images/vietnam_airlines_b787_engine_closeup.png"
  },
  {
    question: "Thiết kế đầu cánh đặc trưng nào của Boeing 787-9 giúp triệt tiêu dòng xoáy không khí mà không cần gắn winglet thẳng đứng?",
    options: [
      "Đầu cánh gập (Folding Wingtip)",
      "Cánh cong Sharklet",
      "Đầu cánh vát nghiêng (Raked Wingtip)",
      "Đầu cánh chữ T đối xứng"
    ],
    answerIndex: 2,
    feedback: "🎉 Hoàn toàn đúng! Đầu cánh vát Raked Wingtip tăng sải cánh hiệu dụng và giảm tối đa lực cản cảm ứng khi bay hành trình.",
    image: "images/vietnam_airlines_b787_bg.png"
  },
  {
    question: "Tính năng tiện nghi công nghệ nổi tiếng nào lần đầu tiên xuất hiện trên cửa sổ khoang khách của dòng Boeing 787?",
    options: [
      "Cửa sổ đổi màu điện tử (Electrochromic dimming)",
      "Cửa sổ kính cường lực chống đạn",
      "Màn hình cảm ứng tích hợp trên kính",
      "Cửa sổ mở trượt thủ công cỡ lớn"
    ],
    answerIndex: 0,
    feedback: "🎉 Chuẩn xác! Hành khách có thể chỉnh độ tối sáng của kính cửa sổ bằng nút bấm điện tử mà không cần kéo màn che cơ học.",
    image: "images/vietnam_airlines_b787_tarmac.png"
  },
  {
    question: "Tầm bay tối đa của dòng máy bay thân rộng Boeing 787-9 Dreamliner đạt khoảng bao nhiêu km?",
    options: [
      "Khoảng 7.500 km",
      "Khoảng 10.200 km",
      "Khoảng 14.140 km",
      "Khoảng 20.000 km"
    ],
    answerIndex: 2,
    feedback: "🎉 Xuất sắc! Với tầm bay 14.140 km, B787-9 của Vietnam Airlines có thể bay thẳng không dừng từ Hà Nội/TP.HCM tới Luân Đôn, Paris hoặc Sydney.",
    image: "images/vietnam_airlines_b787_runway_night.png"
  }
];

let currentQuestionIndex = 0;
let score = 0;

const quizIntro = document.getElementById('quiz-intro');
const quizContainer = document.getElementById('quiz-container');
const quizResult = document.getElementById('quiz-result');
const startQuizBtn = document.getElementById('start-quiz-btn');
const restartQuizBtn = document.getElementById('restart-quiz-btn');
const nextQuestionBtn = document.getElementById('next-question-btn');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const questionNumber = document.getElementById('question-number');
const currentScoreTag = document.getElementById('current-score-tag');
const progressBar = document.getElementById('progress-bar');
const quizFeedbackText = document.getElementById('quiz-feedback');
const quizQuestionImage = document.getElementById('quiz-question-image');
const quizImageContainer = document.getElementById('quiz-image-container');
const resultText = document.getElementById('result-text');
const userNameForCert = document.getElementById('userNameForCert');
const certCandidateName = document.getElementById('certCandidateName');
const certScoreText = document.getElementById('certScoreText');
const certDateDisplay = document.getElementById('certDateDisplay');
const downloadCertBtn = document.getElementById('downloadCertBtn');

if (startQuizBtn) {
  startQuizBtn.addEventListener('click', startQuiz);
}

if (restartQuizBtn) {
  restartQuizBtn.addEventListener('click', startQuiz);
}

if (nextQuestionBtn) {
  nextQuestionBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizQuestions.length) {
      showQuestion();
    } else {
      showResult();
    }
  });
}

function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  if (quizIntro) quizIntro.style.display = 'none';
  if (quizResult) quizResult.style.display = 'none';
  if (quizContainer) quizContainer.style.display = 'block';
  showQuestion();
}

function showQuestion() {
  if (nextQuestionBtn) nextQuestionBtn.style.display = 'none';
  if (quizFeedbackText) quizFeedbackText.style.display = 'none';

  const currentQuestion = quizQuestions[currentQuestionIndex];
  if (questionText) questionText.textContent = `${currentQuestionIndex + 1}. ${currentQuestion.question}`;

  if (questionNumber) questionNumber.textContent = `Câu hỏi ${currentQuestionIndex + 1}/${quizQuestions.length}`;
  if (currentScoreTag) currentScoreTag.textContent = `Điểm: ${score}/${quizQuestions.length}`;
  if (progressBar) {
    const progressPercent = (currentQuestionIndex / quizQuestions.length) * 100;
    progressBar.style.width = `${progressPercent}%`;
  }

  if (currentQuestion.image && quizQuestionImage && quizImageContainer) {
    quizQuestionImage.src = currentQuestion.image;
    quizImageContainer.style.display = 'block';
  } else if (quizImageContainer) {
    quizImageContainer.style.display = 'none';
  }

  if (optionsContainer) {
    optionsContainer.innerHTML = '';
    currentQuestion.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.classList.add('option-btn');
      button.innerHTML = `<span style="display: inline-block; width: 24px; height: 24px; border-radius: 50%; background: rgba(255,255,255,0.1); text-align: center; line-height: 24px; margin-right: 8px; font-weight: 700; font-size: 0.8rem;">${String.fromCharCode(65 + index)}</span> ${option}`;
      button.addEventListener('click', () => selectAnswer(index, button));
      optionsContainer.appendChild(button);
    });
  }
}

function selectAnswer(selectedIndex, selectedButton) {
  const currentQuestion = quizQuestions[currentQuestionIndex];
  const buttons = optionsContainer.querySelectorAll('.option-btn');
  buttons.forEach((btn) => (btn.disabled = true));

  if (selectedIndex === currentQuestion.answerIndex) {
    selectedButton.classList.add('correct');
    score++;
    if (quizFeedbackText) {
      quizFeedbackText.innerHTML = currentQuestion.feedback;
      quizFeedbackText.className = 'quiz-feedback';
      quizFeedbackText.style.background = 'rgba(16, 185, 129, 0.15)';
      quizFeedbackText.style.border = '1px solid #10b981';
      quizFeedbackText.style.color = '#34d399';
      quizFeedbackText.style.display = 'block';
    }
  } else {
    selectedButton.classList.add('wrong');
    buttons[currentQuestion.answerIndex].classList.add('correct');
    if (quizFeedbackText) {
      quizFeedbackText.innerHTML = `❌ Chưa chính xác! <strong>Đáp án đúng: ${currentQuestion.options[currentQuestion.answerIndex]}</strong>.<br>${currentQuestion.feedback}`;
      quizFeedbackText.className = 'quiz-feedback';
      quizFeedbackText.style.background = 'rgba(239, 68, 68, 0.15)';
      quizFeedbackText.style.border = '1px solid #ef4444';
      quizFeedbackText.style.color = '#f87171';
      quizFeedbackText.style.display = 'block';
    }
  }

  if (currentScoreTag) currentScoreTag.textContent = `Điểm: ${score}/${quizQuestions.length}`;
  if (nextQuestionBtn) {
    nextQuestionBtn.style.display = 'inline-flex';
    nextQuestionBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function showResult() {
  if (progressBar) progressBar.style.width = '100%';
  if (quizContainer) quizContainer.style.display = 'none';
  if (quizResult) quizResult.style.display = 'block';

  const candidateName = userNameForCert?.value?.trim() || 'HỌC VIÊN XUẤT SẮC';
  if (certCandidateName) certCandidateName.textContent = candidateName.toUpperCase();
  if (certScoreText) {
    certScoreText.textContent = `Đã hoàn thành xuất sắc bài kiểm tra trắc nghiệm kiến thức tàu bay Boeing 787-9 Dreamliner với thành tích ${score}/${quizQuestions.length} điểm.`;
  }
  if (certDateDisplay) {
    const today = new Date();
    certDateDisplay.textContent = today.toISOString().split('T')[0];
  }

  let resultMessage = '';
  if (score === quizQuestions.length) {
    resultMessage = `Tuyệt đối! Bạn đạt <strong>${score}/${quizQuestions.length} điểm</strong>! Bạn thực sự là một "Chuyên Gia Kỹ Thuật Boeing 787-9" tài năng! ✈️`;
  } else if (score >= 3) {
    resultMessage = `Rất tốt! Bạn đạt <strong>${score}/${quizQuestions.length} điểm</strong>! Kiến thức hàng không của bạn vô cùng ấn tượng! 🛫`;
  } else {
    resultMessage = `Bạn đạt <strong>${score}/${quizQuestions.length} điểm</strong>! Hãy ghé thăm dự án B787-9 để bóc tách thêm nhiều linh kiện thú vị nhé! ✈️`;
  }

  if (resultText) resultText.innerHTML = resultMessage;
}

// Draw and download Certificate Canvas Image
if (downloadCertBtn) {
  downloadCertBtn.addEventListener('click', () => {
    const candidateName = userNameForCert?.value?.trim() || 'HỌC VIÊN XUẤT SẮC';
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 650;
    const ctx = canvas.getContext('2d');

    // Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1000, 650);
    bgGrad.addColorStop(0, '#070c18');
    bgGrad.addColorStop(1, '#020408');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1000, 650);

    // Gold Outer Border
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, 940, 590);

    // Inner Dashed Border
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 45, 910, 560);

    // Header text
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('VIETNAM AIRLINES • B787-9 AEROSPACE ACADEMY', 500, 110);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px "Outfit", sans-serif';
    ctx.fillText('CHỨNG NHẬN AM HIỂU KỸ THUẬT HÀNG KHÔNG', 500, 160);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px "Inter", sans-serif';
    ctx.fillText('Chứng nhận được trân trọng trao tặng cho:', 500, 220);

    // Name
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 36px "Outfit", sans-serif';
    ctx.fillText(candidateName.toUpperCase(), 500, 280);

    // Score text
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '18px "Inter", sans-serif';
    ctx.fillText(`Đã hoàn thành bài thi trắc nghiệm Boeing 787-9 Dreamliner với điểm số: ${score}/${quizQuestions.length}`, 500, 340);

    // Signatures
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px "Inter", sans-serif';
    ctx.fillText('Tác giả Website', 250, 480);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Outfit", sans-serif';
    ctx.fillText('Phúc Khánh', 250, 510);
    ctx.fillStyle = '#fbbf24';
    ctx.font = '14px "Inter", sans-serif';
    ctx.fillText('THCS Linh Đàm', 250, 535);

    // Verified Stamp
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(500, 490, 45, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 14px "JetBrains Mono", monospace';
    ctx.fillText('VERIFIED', 500, 495);

    // Date
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px "Inter", sans-serif';
    ctx.fillText('Hệ thống cấp', 750, 480);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    ctx.fillText(new Date().toISOString().split('T')[0], 750, 510);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '14px "Inter", sans-serif';
    ctx.fillText('Simba Learning Platform', 750, 535);

    // Download trigger
    const link = document.createElement('a');
    link.download = `Chung_Chi_B787_${candidateName.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    showToast('Đã tải Chứng chỉ PNG thành công!', 'File ảnh đã được lưu về máy của bạn.');
  });
}

/* -------------------------------------------------------------
   10. SIMBA FAST SUBMISSION & PRODUCT THINKING EXPORTER
   ------------------------------------------------------------- */
const simbaSubmissionText = `=== BÀI TẬP: WEBSITE CÁ NHÂN (TÍCH HỢP DỰ ÁN B787-9 AIRCRAFT PARTS) ===
Họ và tên học sinh: Phúc Khánh
Trường: THCS Linh Đàm (Hà Nội)

1. LINK WEBSITE & MÃ NGUỒN:
- Website Cá Nhân: portfolio-website/index.html
- Website Khám Phá B787-9: b787-9-vietnam-airlines/index.html

2. CÂU TRẢ LỜI PRODUCT THINKING:
- Mục tiêu sản phẩm: Tạo ra không gian số cá nhân trực quan, kết nối đam mê công nghệ hàng không và showcase dự án kỹ thuật B787-9 Aircraft Parts Explorer.
- Đối tượng người xem: Thầy cô giáo chấm bài trên Simba, bạn bè cùng lớp, phụ huynh và cộng đồng người yêu hàng không.

- Chi tiết 4 nội dung trọng tâm:
  1. Em là ai: Phúc Khánh - Học sinh trường THCS Linh Đàm, người luôn tò mò học hỏi và say mê lập trình web tương tác trực quan.
  2. Em thích điều gì: Nghiên cứu công nghệ tàu bay hiện đại Boeing 787-9 Dreamliner (vật liệu thân carbon composite 50%+, động cơ GEnx-1B siêu êm, cánh vát Raked Wingtip), lập trình Frontend và rèn luyện thể thao nâng cao sức khỏe.
  3. Sản phẩm tự hào: "B787-9 Aircraft Parts Interactive Website" - Sơ đồ tương tác Hotspot 8 điểm bóc tách cấu tạo máy bay của Vietnam Airlines kèm hình minh họa vector và thông số kỹ thuật chuẩn.
  4. Người xem tìm hiểu thêm ở đâu: Form liên hệ trực tiếp trên website, email pikalongchen@gmail.com, GitHub và kênh kết nối 2 chiều giữa 2 website.

3. BẰNG CHỨNG KẾT QUẢ:
- Đầy đủ mã nguồn HTML5/CSS3/JavaScript thuần, chạy mượt mà 100%.
- Tích hợp buồng lái kỹ thuật số HUD Simulator, bộ đố vui trắc nghiệm kiến thức và xuất chứng chỉ phi công tự động.
- Giao diện chuẩn Responsive đa thiết bị (PC, Tablet, Mobile).`;

const quickSimbaBtn = document.getElementById('quickSimbaBtn');
const simbaModalBackdrop = document.getElementById('simbaModalBackdrop');
const closeSimbaModalBtn = document.getElementById('closeSimbaModalBtn');
const closeSimbaModalBtn2 = document.getElementById('closeSimbaModalBtn2');
const copySimbaContentBtn = document.getElementById('copySimbaContentBtn');
const copyProductThinkingBtn = document.getElementById('copyProductThinkingBtn');
const simbaCopyTextarea = document.getElementById('simbaCopyTextarea');

function openSimbaModal() {
  if (simbaCopyTextarea) simbaCopyTextarea.value = simbaSubmissionText;
  if (simbaModalBackdrop) simbaModalBackdrop.classList.add('show');
}

if (quickSimbaBtn) quickSimbaBtn.addEventListener('click', openSimbaModal);
if (closeSimbaModalBtn) closeSimbaModalBtn.addEventListener('click', () => simbaModalBackdrop?.classList.remove('show'));
if (closeSimbaModalBtn2) closeSimbaModalBtn2.addEventListener('click', () => simbaModalBackdrop?.classList.remove('show'));

if (copySimbaContentBtn) {
  copySimbaContentBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(simbaSubmissionText).then(() => {
      showToast('Đã sao chép toàn bộ bài nộp Simba!', 'Bạn có thể dán (Ctrl+V) trực tiếp vào ô nộp bài trên Simba.');
    });
  });
}

if (copyProductThinkingBtn) {
  copyProductThinkingBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(simbaSubmissionText).then(() => {
      showToast('Đã sao chép Câu trả lời Product Thinking!', 'Sẵn sàng nộp lên Simba.');
    });
  });
}

/* -------------------------------------------------------------
   11. CONTACT FORM & TOAST NOTIFICATION
   ------------------------------------------------------------- */
const contactForm = document.getElementById('contactForm');
const toast = document.getElementById('toast');
const toastTitle = document.getElementById('toastTitle');
const toastDesc = document.getElementById('toastDesc');

function showToast(title, desc = 'Thao tác đã được thực hiện thành công.') {
  if (toast && toastTitle && toastDesc) {
    toastTitle.textContent = title;
    toastDesc.textContent = desc;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }
}

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name')?.value;
    const email = document.getElementById('email')?.value;
    const subject = document.getElementById('subject')?.value;
    const message = document.getElementById('message')?.value;

    console.log('📬 Nhận tin nhắn từ form:', { name, email, subject, message });
    showToast(`Cảm ơn ${name}!`, 'Phúc Khánh đã nhận được lời nhắn và sẽ phản hồi sớm nhất.');
    contactForm.reset();
  });
}
