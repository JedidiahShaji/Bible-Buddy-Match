document.addEventListener("DOMContentLoaded", () => {
  // ---------- Element refs ----------
  const startBtn = document.getElementById("startBtn");
  const quizSection = document.getElementById("quizSection");
  const resultSection = document.getElementById("resultSection");
  const quizForm = document.getElementById("quizForm");
  const submitQuiz = document.getElementById("submitQuiz");
  const resultText = document.getElementById("resultText");
  const tryAgain = document.getElementById("tryAgain");
  const confettiSound = document.getElementById("confettiSound");
  const muteCheckbox = document.getElementById("muteSfx");
  const btnDownloadSticker = document.getElementById("btnDownloadSticker");
  const btnPrintSticker = document.getElementById("btnPrintSticker");
  const btnChooseFolder = document.getElementById("btnChooseFolder");
  const btnToggleCam = document.getElementById("btnToggleCam");
  const btnCapture = document.getElementById("btnCapture");
  const btnRemovePhoto = document.getElementById("btnRemovePhoto");
  const kidCamArea = document.getElementById("kidCamArea");
  const kidVideo = document.getElementById("kidVideo");
  const kidPreview = document.getElementById("kidPreview");
  const simpleModeToggle = document.getElementById("simpleMode");

  // ---------- State ----------
  let sfxUnlocked = false;
  let lastCelebrationAt = 0;
  let kidStream = null;
  let kidImageEl = null; // optional photo overlay
  let stickersDirHandle = null;

  // ---------- A11y helpers ----------
  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Sound / mute ----------
  if (muteCheckbox) {
    const saved = localStorage.getItem('sfx-muted') === '1';
    muteCheckbox.checked = saved;
    if (confettiSound) confettiSound.muted = saved;
    muteCheckbox.addEventListener('change', () => {
      const m = !!muteCheckbox.checked;
      localStorage.setItem('sfx-muted', m ? '1' : '0');
      if (confettiSound) confettiSound.muted = m;
    });
  }

  function unlockAudioOnce() {
    if (sfxUnlocked || !confettiSound) return;
    confettiSound.volume = 1.0;
    const p = confettiSound.play();
    if (p && typeof p.then === 'function') {
      p.then(() => {
        confettiSound.pause();
        confettiSound.currentTime = 0;
        sfxUnlocked = true;
        window.removeEventListener('pointerdown', unlockAudioOnce);
        window.removeEventListener('keydown', unlockAudioOnce);
      }).catch(() => {});
    } else {
      confettiSound.pause();
      confettiSound.currentTime = 0;
      sfxUnlocked = true;
      window.removeEventListener('pointerdown', unlockAudioOnce);
      window.removeEventListener('keydown', unlockAudioOnce);
    }
  }
  window.addEventListener('pointerdown', unlockAudioOnce, { passive: true });
  window.addEventListener('keydown', unlockAudioOnce);

  function celebrateOnce() {
    const now = Date.now();
    if (now - lastCelebrationAt < 3000) return;
    lastCelebrationAt = now;
    if (!prefersReducedMotion() && window.fireConfetti) {
      window.fireConfetti({ durationMs: 1200, particleCount: 150 });
    }
    if (confettiSound && !prefersReducedMotion() && !(muteCheckbox && muteCheckbox.checked)) {
      try { confettiSound.currentTime = 0; confettiSound.play(); } catch {}
    }
  }

  // ---------- Characters ----------
  const characters = [
    { name: "Barnabas",
      traits: ["kind","teacher","joyful","faithful"],
      reference: "Acts 4 — Known as the “son of encouragement.”",
      whyMatch: "You're an encourager like Barnabas—spreading joy and kindness!"
    },
    { name: "David",
      traits: ["brave","creative","faithful","joyful"],
      reference: "1 Samuel 17 — Faced Goliath with faith.",
      whyMatch: "You're brave like David because you stand up for what's right!"
    },
    { name: "Paul",
      traits: ["adventurous","teacher","faithful","brave","resilient"],
      reference: "Philippians 4:13 — I can do all things through Christ.",
      whyMatch: "You're bold like Paul—adventurous and eager to share good news!"
    }
  ];

  // ---------- Helpers ----------
  const slugify = (str) => str.toLowerCase().replace(/\(.*?\)/g,"").replace(/[^a-z0-9\s-]/g,"").trim().replace(/\s+/g,"-");
  const imagePathFor = (name) => `images/${slugify(name)}.png`;
  const customImageMap = {
    "David": "images/david.png",
    "Barnabas": "images/barnabas.png",
    "Paul": "images/saul-paul.png"
  };
  function getResultCharacterImageEl(){ return document.getElementById('resultCharacterImg'); }
  function loadImage(url){
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  // ---------- Simple mode ----------
  const SIMPLE_MODE_KEY = 'bb-simple-mode';
  if (simpleModeToggle) {
    const savedSimple = localStorage.getItem(SIMPLE_MODE_KEY);
    if (savedSimple !== null) simpleModeToggle.checked = savedSimple === '1';
    simpleModeToggle.addEventListener('change', () => {
      localStorage.setItem(SIMPLE_MODE_KEY, simpleModeToggle.checked ? '1' : '0');
    });
  }
  const isSimpleMode = () => simpleModeToggle ? !!simpleModeToggle.checked : true;

  // ---------- Quiz flow ----------
  startBtn?.addEventListener("click", () => {
    startBtn.style.display = "none";
    resultSection.style.display = "none";
    quizSection.style.display = "block";
  });

  submitQuiz?.addEventListener("click", () => {
    const formData = new FormData(quizForm);
    const answers = [formData.get("q1"), formData.get("q2"), formData.get("q3")].filter(Boolean);
    if (answers.length < 3) { alert("Please answer all questions!"); return; }

    let bestMatch = null, maxScore = -1;
    characters.forEach(c => {
      const score = answers.filter(t => c.traits.includes(t)).length;
      if (score > maxScore) { maxScore = score; bestMatch = c; }
    });

    // Store globally for sticker buttons
    window.__lastMatch = bestMatch;

    // Render result (with local image + fallback)
    quizSection.style.display = "none";
    resultSection.style.display = "block";

    celebrateOnce();

    const imgSrc = customImageMap[bestMatch.name] || imagePathFor(bestMatch.name);
    resultText.innerHTML = `
      <div class="card">
        <img id="resultCharacterImg" src="${imgSrc}" alt="${bestMatch.name}" onerror="this.style.display='none'"/>
        <h3>${bestMatch.name}</h3>
        <p>${bestMatch.whyMatch}</p>
        <p><em>${bestMatch.reference}</em></p>
      </div>
    `;
  });

  tryAgain?.addEventListener("click", () => {
    resultSection.style.display = "none";
    quizSection.style.display = "none";
    startBtn.style.display = "block";
    quizForm.reset();
    window.__lastMatch = null;
  });

  // ---------- Camera (optional) ----------
  function stopKidStream(){
    if (kidStream) { kidStream.getTracks().forEach(t => t.stop()); kidStream = null; }
  }
  async function toggleCam(){
    if (isSimpleMode()) { alert('Simple mode is ON. Turn it off in Booth Settings to enable camera.'); return; }
    if (kidStream) { stopKidStream(); kidCamArea.style.display='none'; btnCapture.style.display='none'; return; }
    try{
      kidStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode:'user', width:640, height:480 }, audio:false });
      kidVideo.srcObject = kidStream;
      kidCamArea.style.display = 'flex';
      btnCapture.style.display = 'inline-block';
    } catch(e){ alert('Camera not available or permission denied.'); }
  }
  function capturePhoto(){
    if (!kidVideo) return;
    const ctx = kidPreview.getContext('2d');
    const vw = kidVideo.videoWidth || 640, vh = kidVideo.videoHeight || 480;
    const side = Math.min(vw, vh);
    const sx = (vw - side)/2, sy = (vh - side)/2;
    ctx.clearRect(0,0,kidPreview.width,kidPreview.height);
    ctx.drawImage(kidVideo, sx, sy, side, side, 0, 0, kidPreview.width, kidPreview.height);
    const dataUrl = kidPreview.toDataURL('image/png');
    kidImageEl = new Image(); kidImageEl.src = dataUrl;
    btnRemovePhoto.style.display = 'inline-block';
  }
  function removePhoto(){
    kidImageEl = null;
    kidPreview.getContext('2d').clearRect(0,0,kidPreview.width,kidPreview.height);
    btnRemovePhoto.style.display = 'none';
  }
  btnToggleCam?.addEventListener('click', toggleCam);
  btnCapture?.addEventListener('click', capturePhoto);
  btnRemovePhoto?.addEventListener('click', removePhoto);
  window.addEventListener('beforeunload', stopKidStream);

  // ---------- Stickers folder (optional) ----------
  if (btnChooseFolder && 'showDirectoryPicker' in window) {
    btnChooseFolder.addEventListener('click', async () => {
      try {
        stickersDirHandle = await window.showDirectoryPicker({ id:'bible-buddy-stickers' });
        btnChooseFolder.textContent = 'Stickers Folder Selected ✓';
      } catch {}
    });
  } else if (btnChooseFolder) {
    btnChooseFolder.disabled = true;
    btnChooseFolder.title = 'Folder saving not supported in this browser';
  }
  async function saveStickerBlob(blob, filename){
    if (stickersDirHandle) {
      try{
        const handle = await stickersDirHandle.getFileHandle(filename, { create:true });
        const writable = await handle.createWritable();
        await writable.write(blob); await writable.close(); return true;
      } catch {}
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url); return false;
  }

  // ---------- Sticker builder ----------
  async function buildStickerCanvas({ name, traits, charImageUrl, kidImage, charImageEl }) {
    const SIZE = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = SIZE; canvas.height = SIZE;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0,0,SIZE,SIZE);
    const cx = SIZE/2, cy = SIZE/2, R = SIZE*0.46;

    // circular clip
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2); ctx.closePath(); ctx.clip();

    // soft background
    const grad = ctx.createRadialGradient(cx, cy, R*0.1, cx, cy, R);
    grad.addColorStop(0, '#fff'); grad.addColorStop(1, '#f2f2f2');
    ctx.fillStyle = grad; ctx.fillRect(cx-R, cy-R, R*2, R*2);

    // Character image
    let img = null;
    if (charImageEl && charImageEl.complete && charImageEl.naturalWidth > 0) { img = charImageEl; }
    else {
      const url = charImageUrl || customImageMap[name] || imagePathFor(name);
      try { img = await loadImage(url); } catch {}
    }
    if (img) {
      const scale = Math.min((R*1.6)/img.width, (R*1.6)/img.height);
      const w = img.width*scale, h = img.height*scale;
      ctx.globalAlpha = 0.98; ctx.drawImage(img, cx - w/2, cy - h*0.65, w, h); ctx.globalAlpha = 1;
    }

    // Kid photo overlay (optional)
    if (kidImage) {
      const r = R*0.28, ox = cx + R*0.42, oy = cy + R*0.42;
      ctx.save(); ctx.beginPath(); ctx.arc(ox, oy, r, 0, Math.PI*2); ctx.closePath(); ctx.clip();
      ctx.drawImage(kidImage, ox - r, oy - r, r*2, r*2);
      ctx.restore();
      ctx.lineWidth = Math.max(6, R*0.03); ctx.strokeStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(ox, oy, r, 0, Math.PI*2); ctx.stroke(); ctx.shadowBlur = 0;
    }

    ctx.restore(); // remove clip

    // outer ring
    ctx.lineWidth = Math.max(6, R*0.03); ctx.strokeStyle = '#222';
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2); ctx.stroke();

    // text
    ctx.fillStyle = '#111'; ctx.textAlign = 'center';
    ctx.font = 'bold 56px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText(name, cx, cy + R*0.18);
    ctx.font = '28px ui-sans-serif, system-ui';
    const line = (traits || []).slice(0,4).join(' • ');
    ctx.fillText(line, cx, cy + R*0.31);

    return canvas;
  }

  async function makeAndDownloadSticker(bestMatch) {
    const charUrl = customImageMap[bestMatch.name] || imagePathFor(bestMatch.name);
    const traits = bestMatch.traits;
    const canvas = await buildStickerCanvas({ name: bestMatch.name, traits, charImageUrl: charUrl, kidImage: kidImageEl, charImageEl: getResultCharacterImageEl() });
    const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
    const fileName = `sticker_${slugify(bestMatch.name)}.png`;
    await saveStickerBlob(blob, fileName);
  }

  async function makeAndPrintSticker(bestMatch) {
    const charUrl = customImageMap[bestMatch.name] || imagePathFor(bestMatch.name);
    const traits = bestMatch.traits;
    const canvas = await buildStickerCanvas({ name: bestMatch.name, traits, charImageUrl: charUrl, kidImage: kidImageEl, charImageEl: getResultCharacterImageEl() });
    const dataUrl = canvas.toDataURL('image/png');
    const w = window.open('', '_blank', 'noopener,noreferrer,width=900,height=900');
    if (!w) return;
    const html = `<!doctype html><title>Print Sticker</title>
      <div class="print-only"><img id="pimg" src="${dataUrl}" alt="Sticker" /></div>`;
    w.document.open(); w.document.write(html); w.document.close();
    const pimg = w.document.getElementById('pimg');
    if (pimg && !pimg.complete) {
      pimg.onload = () => { w.focus(); w.print(); };
      pimg.onerror = () => { w.focus(); w.print(); };
    } else { w.focus(); w.print(); }
  }

  // ---------- Wire sticker buttons ----------
  btnDownloadSticker?.addEventListener('click', async () => {
    if (!window.__lastMatch) { alert('Make a match first!'); return; }
    await makeAndDownloadSticker(window.__lastMatch);
  });
  btnPrintSticker?.addEventListener('click', async () => {
    if (!window.__lastMatch) { alert('Make a match first!'); return; }
    await makeAndPrintSticker(window.__lastMatch);
  });
});
