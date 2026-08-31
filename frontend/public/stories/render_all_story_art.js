const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const storiesDir = __dirname;
const msedgePath = `"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"`;

const scenes = [
  // ── THIRUVALLUVAR SCENES ──────────────────────────────────────────────────
  {
    filename: 'thiruvalluvar_2',
    title: 'Scene 2: The Arrogant Test',
    titleTamil: 'வள்ளுவரை சோதிக்க பட்டுச் சேலையைக் கிழிக்கும் இளைஞன்',
    render: `
      ctx.fillStyle = '#1c0a10'; ctx.fillRect(0,0,1920,1080);
      const lampGlow = ctx.createRadialGradient(400, 500, 20, 400, 500, 600);
      lampGlow.addColorStop(0, 'rgba(251, 191, 36, 0.6)');
      lampGlow.addColorStop(0.4, 'rgba(245, 158, 11, 0.25)');
      lampGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = lampGlow;
      ctx.beginPath(); ctx.arc(400, 500, 600, 0, Math.PI*2); ctx.fill();

      ctx.fillStyle = '#2d131a'; ctx.fillRect(120, 0, 140, 1080); ctx.fillRect(1660, 0, 140, 1080);
      ctx.fillStyle = '#451a03'; ctx.fillRect(0, 750, 1920, 330);

      ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
      ctx.beginPath(); ctx.arc(420, 420, 180, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#d97706'; ctx.beginPath(); ctx.arc(420, 380, 55, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.arc(420, 310, 30, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(370, 390); ctx.lineTo(470, 390); ctx.lineTo(420, 560); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(300, 480); ctx.lineTo(540, 480); ctx.lineTo(580, 780); ctx.lineTo(260, 780); ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#b45309'; ctx.beginPath(); ctx.arc(1420, 340, 55, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#0284c7'; ctx.beginPath(); ctx.moveTo(1340, 420); ctx.lineTo(1500, 420); ctx.lineTo(1540, 800); ctx.lineTo(1300, 800); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#b45309'; ctx.lineWidth = 32; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(1340, 450); ctx.lineTo(1100, 520); ctx.stroke();

      ctx.fillStyle = '#e11d48'; ctx.beginPath(); ctx.moveTo(650, 480); ctx.lineTo(940, 440); ctx.lineTo(920, 760); ctx.lineTo(620, 780); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 20; ctx.beginPath(); ctx.moveTo(650, 480); ctx.lineTo(940, 440); ctx.stroke();

      ctx.fillStyle = '#e11d48'; ctx.beginPath(); ctx.moveTo(1000, 450); ctx.lineTo(1250, 500); ctx.lineTo(1280, 780); ctx.lineTo(1020, 750); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 20; ctx.beginPath(); ctx.moveTo(1000, 450); ctx.lineTo(1250, 500); ctx.stroke();

      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 4;
      for(let i=0; i<25; i++) {
        ctx.beginPath();
        const tx = 930 + (Math.random()*80 - 40); const ty = 440 + i*14;
        ctx.moveTo(tx, ty); ctx.lineTo(tx + (Math.random()*40-20), ty + 20); ctx.stroke();
      }
    `
  },
  {
    filename: 'thiruvalluvar_3',
    title: 'Scene 3: Value of Human Labor',
    titleTamil: 'கந்தலான போதும் உழைப்பின் மதிப்பைக் கற்பித்தல்',
    render: `
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0,0,1920,1080);
      const beamG = ctx.createLinearGradient(960, 0, 960, 800);
      beamG.addColorStop(0, 'rgba(251, 191, 36, 0.4)'); beamG.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = beamG; ctx.beginPath(); ctx.moveTo(700,0); ctx.lineTo(1220,0); ctx.lineTo(1500,800); ctx.lineTo(420,800); ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#451a03'; ctx.strokeStyle = '#78350f'; ctx.lineWidth = 12;
      ctx.fillRect(300, 620, 1320, 300); ctx.strokeRect(300, 620, 1320, 300);

      const colors = ['#e11d48', '#f59e0b', '#0284c7', '#10b981'];
      for (let i=0; i<15; i++) {
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath(); ctx.arc(450 + i*80, 660 + (i%3)*30, 45 + (i%5)*8, 0, Math.PI*2); ctx.fill();
      }

      ctx.fillStyle = '#d97706'; ctx.beginPath(); ctx.arc(960, 260, 60, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(960, 190, 32, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(900, 270); ctx.lineTo(1020, 270); ctx.lineTo(960, 440); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(850, 360); ctx.lineTo(1070, 360); ctx.lineTo(1120, 620); ctx.lineTo(800, 620); ctx.closePath(); ctx.fill();
    `
  },
  {
    filename: 'thiruvalluvar_4',
    title: 'Scene 4: Transformation of Heart',
    titleTamil: 'அகந்தையை விடுத்து திருக்குறளின் பொறையுடைமையைக் கற்றல்',
    render: `
      ctx.fillStyle = '#022c22'; ctx.fillRect(0,0,1920,1080);
      const kuralGlow = ctx.createRadialGradient(960, 320, 30, 960, 320, 650);
      kuralGlow.addColorStop(0, 'rgba(251, 191, 36, 0.6)'); kuralGlow.addColorStop(0.5, 'rgba(16, 185, 129, 0.25)'); kuralGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = kuralGlow; ctx.beginPath(); ctx.arc(960, 320, 650, 0, Math.PI*2); ctx.fill();

      ctx.fillStyle = '#f59e0b'; ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 8;
      ctx.fillRect(720, 240, 480, 160); ctx.strokeRect(720, 240, 480, 160);
      ctx.strokeStyle = '#78350f'; ctx.lineWidth = 5;
      for (let y=280; y<=360; y+=35) { ctx.beginPath(); ctx.moveTo(760, y); ctx.lineTo(1160, y); ctx.stroke(); }

      ctx.fillStyle = '#b45309'; ctx.beginPath(); ctx.arc(960, 620, 50, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#0369a1'; ctx.beginPath(); ctx.moveTo(860, 680); ctx.lineTo(1060, 680); ctx.lineTo(1120, 920); ctx.lineTo(800, 920); ctx.closePath(); ctx.fill();
    `
  },
  {
    filename: 'cv_raman_1',
    title: 'Scene 1: Prism & Rainbow Light',
    titleTamil: 'சிறுவன் ராமன் ப்ரிஸத்தில் சூரிய ஒளி வானவில்லாகப் பிரிவதைக் கவனித்தல்',
    render: `
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0,0,1920,1080);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(400,0); ctx.lineTo(960,540); ctx.lineTo(760,540); ctx.closePath(); ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(960, 360); ctx.lineTo(1120, 620); ctx.lineTo(800, 620); ctx.closePath(); ctx.fill(); ctx.stroke();

      const rainbow = ['#7c3aed', '#4f46e5', '#0284c7', '#10b981', '#eab308', '#f97316', '#ef4444'];
      rainbow.forEach((c, idx) => {
        ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(960, 490); ctx.lineTo(1920, 480 + idx*55); ctx.lineTo(1920, 530 + idx*55); ctx.closePath(); ctx.fill();
      });

      ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(500, 460, 55, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(420, 540); ctx.lineTo(580, 540); ctx.lineTo(620, 950); ctx.lineTo(380, 950); ctx.closePath(); ctx.fill();
    `
  },
  {
    filename: 'cv_raman_2',
    title: 'Scene 2: Voyage Across the Ocean',
    titleTamil: '1921-ல் மத்திய தரைக்கடல் பயணத்தில் ஆழ்கடலின் நீல நிறத்தை ஆராய்தல்',
    render: `
      ctx.fillStyle = '#020617'; ctx.fillRect(0,0,1920,1080);
      ctx.fillStyle = '#ffffff';
      for(let i=0; i<80; i++) { ctx.beginPath(); ctx.arc((i*137)%1920, (i*89)%500, (i%3)+1, 0, Math.PI*2); ctx.fill(); }

      ctx.fillStyle = '#0284c7'; ctx.fillRect(0, 620, 1920, 460);
      ctx.fillStyle = '#0369a1'; ctx.fillRect(0, 720, 1920, 360);

      ctx.fillStyle = '#475569'; ctx.fillRect(0, 580, 1920, 40);
      for(let x=100; x<1920; x+=300) { ctx.fillRect(x, 580, 30, 250); }

      ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(960, 320, 60, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(900, 280); ctx.lineTo(1020, 280); ctx.lineTo(960, 240); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.moveTo(880, 400); ctx.lineTo(1040, 400); ctx.lineTo(1080, 850); ctx.lineTo(840, 850); ctx.closePath(); ctx.fill();
    `
  },
  {
    filename: 'cv_raman_3',
    title: 'Scene 3: The Raman Effect (1928)',
    titleTamil: '1928 பிப்ரவரி 28 அன்று ஒளியின் சிதறலை ராமன் விளைவு மூலம் நிரூபித்தல்',
    render: `
      ctx.fillStyle = '#31103f'; ctx.fillRect(0,0,1920,1080);
      const rGlow = ctx.createRadialGradient(960, 540, 20, 960, 540, 600);
      rGlow.addColorStop(0, 'rgba(168, 85, 247, 0.7)'); rGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rGlow; ctx.beginPath(); ctx.arc(960, 540, 600, 0, Math.PI*2); ctx.fill();

      ctx.fillStyle = '#0284c7'; ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 12;
      ctx.beginPath(); ctx.arc(960, 540, 130, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath(); ctx.arc(800, 420, 70, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(1120, 420, 70, 0, Math.PI*2); ctx.fill();

      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 20; ctx.beginPath(); ctx.moveTo(0, 250); ctx.lineTo(840, 480); ctx.stroke();
      ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 20; ctx.beginPath(); ctx.moveTo(1080, 480); ctx.lineTo(1920, 200); ctx.stroke();
      ctx.strokeStyle = '#ec4899'; ctx.lineWidth = 20; ctx.beginPath(); ctx.moveTo(1080, 580); ctx.lineTo(1920, 880); ctx.stroke();
    `
  },
  {
    filename: 'cv_raman_4',
    title: 'Scene 4: Nobel Prize & National Science Day',
    titleTamil: '1930-ல் இயற்பியலுக்கான நோபல் பரிசு பெற்று இந்தியாவிற்குப் பெருமை சேர்த்தல்',
    render: `
      ctx.fillStyle = '#451a03'; ctx.fillRect(0,0,1920,1080);
      const nobelG = ctx.createRadialGradient(960, 480, 50, 960, 480, 650);
      nobelG.addColorStop(0, 'rgba(251, 191, 36, 0.8)'); nobelG.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = nobelG; ctx.beginPath(); ctx.arc(960, 480, 650, 0, Math.PI*2); ctx.fill();

      ctx.fillStyle = '#f59e0b'; ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 18;
      ctx.beginPath(); ctx.arc(960, 480, 240, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#78350f'; ctx.font = 'bold 42px serif'; ctx.textAlign = 'center';
      ctx.fillText('NOBEL PRIZE', 960, 420);
      ctx.font = 'bold 54px serif'; ctx.fillText('PHYSICS 1930', 960, 490);
      ctx.font = 'bold 36px sans-serif'; ctx.fillText('SIR C.V. RAMAN', 960, 550);
    `
  },
  {
    filename: 'panchatantra_1',
    title: 'Scene 1: Booming Thunder in the Forest',
    titleTamil: 'காட்டில் எழுப்பப்பட்ட பயங்கர டூம் ஒலியைக் கேட்டு விலங்குகள் பயந்து நடுங்குதல்',
    render: `
      ctx.fillStyle = '#022c22'; ctx.fillRect(0,0,1920,1080);
      for(let r=200; r<=700; r+=150) {
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)'; ctx.lineWidth = 10;
        ctx.beginPath(); ctx.arc(960, 450, r, 0, Math.PI*2); ctx.stroke();
      }
      ctx.fillStyle = '#f59e0b'; ctx.font = '900 110px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('DHOOM! DHOOM!', 960, 480);
    `
  },
  {
    filename: 'panchatantra_2',
    title: 'Scene 2: Courage Over Fear',
    titleTamil: 'பயந்து ஓடாமல் ஒலியின் உண்மையான மூலத்தை ஆராயப் புத்திசாலி நரி துணிதல்',
    render: `
      ctx.fillStyle = '#052e16'; ctx.fillRect(0,0,1920,1080);
      ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(1500, 220, 100, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#15803d';
      ctx.beginPath(); ctx.arc(400, 800, 300, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(1500, 800, 350, 0, Math.PI*2); ctx.fill();

      ctx.fillStyle = '#d97706';
      ctx.beginPath(); ctx.ellipse(960, 600, 120, 70, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(1060, 550, 45, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(1090, 540); ctx.lineTo(1170, 560); ctx.lineTo(1090, 580); ctx.closePath(); ctx.fill();
    `
  },
  {
    filename: 'panchatantra_3',
    title: 'Scene 3: The Abandoned War Drum',
    titleTamil: 'காட்டில் மரக்கிளைகள் பழைய போர் முரசில் மோதியதால் ஒலி எழுந்தது என அறிதல்',
    render: `
      ctx.fillStyle = '#451a03'; ctx.fillRect(0,0,1920,1080);
      ctx.fillStyle = '#291206'; ctx.fillRect(350, 0, 250, 1080);

      ctx.fillStyle = '#b45309'; ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 16;
      ctx.beginPath(); ctx.ellipse(1060, 600, 240, 160, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.ellipse(1060, 600, 190, 120, 0, 0, Math.PI*2); ctx.fill();

      ctx.strokeStyle = '#78350f'; ctx.lineWidth = 24; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(400, 200); ctx.lineTo(950, 520); ctx.stroke();
    `
  },
  {
    filename: 'panchatantra_4',
    title: 'Scene 4: Rewarding Feast',
    titleTamil: 'பயந்து ஓடாமல் ஆராய்ந்ததால் சுவையான உணவை அடைந்து மகிழ்தல்',
    render: `
      ctx.fillStyle = '#065f46'; ctx.fillRect(0,0,1920,1080);
      const feastGlow = ctx.createRadialGradient(960, 540, 50, 960, 540, 550);
      feastGlow.addColorStop(0, 'rgba(251, 191, 36, 0.7)'); feastGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = feastGlow; ctx.beginPath(); ctx.arc(960, 540, 550, 0, Math.PI*2); ctx.fill();

      ctx.fillStyle = '#d97706'; ctx.beginPath(); ctx.arc(960, 420, 100, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#451a03'; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.arc(960, 450, 40, 0, Math.PI); ctx.stroke();
      ctx.fillStyle = '#b45309'; ctx.fillRect(800, 650, 320, 160);
    `
  },
  {
    filename: 'kalam_1',
    title: 'Scene 1: Stormy Afternoon & Fallen Bird',
    titleTamil: 'மழைக்குப் பின் சேற்றில் அடிபட்டு நடுங்கும் சிட்டுக்குருவியைச் சிறுவன் கலாம் காண்பது',
    render: `
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0,0,1920,1080);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)'; ctx.lineWidth = 4;
      for(let i=0; i<250; i++) {
        const rx = (i*89)%2100 - 100; const ry = (i*137)%1080;
        ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 50, ry + 150); ctx.stroke();
      }

      ctx.fillStyle = '#291206'; ctx.beginPath(); ctx.ellipse(960, 850, 650, 160, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#b45309'; ctx.beginPath(); ctx.arc(960, 780, 45, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#78350f'; ctx.beginPath(); ctx.arc(990, 760, 20, 0, Math.PI*2); ctx.fill();

      ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(650, 520, 60, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(560, 600); ctx.lineTo(740, 600); ctx.lineTo(780, 850); ctx.lineTo(520, 850); ctx.closePath(); ctx.fill();
    `
  },
  {
    filename: 'kalam_2',
    title: 'Scene 2: Gentle Care & Healing',
    titleTamil: 'குருவியைக் வீட்டிற்குத் தூக்கி வந்து கனிவோடு பராமரித்துக் குணப்படுத்துதல்',
    render: `
      ctx.fillStyle = '#064e3b'; ctx.fillRect(0,0,1920,1080);
      const careGlow = ctx.createRadialGradient(960, 540, 30, 960, 540, 550);
      careGlow.addColorStop(0, 'rgba(244, 63, 94, 0.5)'); careGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = careGlow; ctx.beginPath(); ctx.arc(960, 540, 550, 0, Math.PI*2); ctx.fill();

      ctx.fillStyle = '#78350f'; ctx.strokeStyle = '#b45309'; ctx.lineWidth = 12;
      ctx.beginPath(); ctx.ellipse(960, 680, 260, 100, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.ellipse(960, 660, 210, 70, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#d97706'; ctx.beginPath(); ctx.arc(960, 620, 55, 0, Math.PI*2); ctx.fill();
    `
  },
  {
    filename: 'kalam_3',
    title: 'Scene 3: Soaring into the Blue Sky',
    titleTamil: '5 நாட்களுக்குப் பின் குணமாகிய குருவி வானில் உயரே பறந்து மகிழ்தல்',
    render: `
      ctx.fillStyle = '#0284c7'; ctx.fillRect(0,0,1920,1080);
      ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(960, 300, 160, 0, Math.PI*2); ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.moveTo(960, 360); ctx.lineTo(1220, 200); ctx.lineTo(960, 320); ctx.lineTo(700, 200); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#d97706'; ctx.beginPath(); ctx.arc(960, 340, 30, 0, Math.PI*2); ctx.fill();
    `
  },
  {
    filename: 'kalam_4',
    title: 'Scene 4: Father\'s Immortal Wisdom',
    titleTamil: '\'விழுந்தவர்களைத் தூக்கி நிறுத்துவதே பெருமை\' எனும் தந்தையின் போதனை',
    render: `
      ctx.fillStyle = '#451a03'; ctx.fillRect(0,0,1920,1080);
      ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(960, 540, 260, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#18181b'; ctx.fillRect(0, 540, 1920, 540);

      ctx.fillStyle = '#09090b';
      ctx.beginPath(); ctx.arc(800, 450, 45, 0, Math.PI*2); ctx.fill();
      ctx.fillRect(740, 510, 120, 450);
      ctx.beginPath(); ctx.arc(1060, 520, 35, 0, Math.PI*2); ctx.fill();
      ctx.fillRect(1010, 560, 100, 400);
    `
  }
];

scenes.forEach(s => {
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body, html { width: 1920px; height: 1080px; overflow: hidden; background: #020617; font-family: system-ui, -apple-system, sans-serif; }
  .banner {
    position: absolute; bottom: 0; left: 0; width: 1920px; height: 160px;
    background: rgba(2, 6, 23, 0.92); border-top: 2px solid rgba(255,255,255,0.1);
    display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px;
  }
  .title-en { color: #ffffff; font-size: 42px; font-weight: 800; letter-spacing: 1px; }
  .title-ta { color: #fbbf24; font-size: 26px; font-weight: 600; margin-top: 8px; }
</style>
</head>
<body>
  <canvas id="cv" width="1920" height="1080"></canvas>
  <div class="banner">
    <div class="title-en">${s.title}</div>
    <div class="title-ta">${s.titleTamil}</div>
  </div>
  <script>
    const cv = document.getElementById('cv');
    const ctx = cv.getContext('2d');
    ${s.render}
  </script>
</body>
</html>`;

  const htmlPath = path.join(storiesDir, s.filename + '.html');
  const jpgPath = path.join(storiesDir, s.filename + '.jpg');
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');

  try {
    const cmd = `${msedgePath} --headless --disable-gpu --window-size=1920,1080 --screenshot="${jpgPath}" "file:///${htmlPath.replace(/\\/g, '/')}"`;
    execSync(cmd);
    console.log(`Generated high-res JPG scene: ${s.filename}.jpg`);
  } catch (err) {
    console.error(`Failed to render ${s.filename}:`, err.message);
  }
});
