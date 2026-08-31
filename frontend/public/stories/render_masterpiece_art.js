const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const storiesDir = __dirname;
const msedgePath = `"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"`;

const scenes = [
  // ───────────────────────────────────────────────────────────────────────────
  // 1. THIRUVALLUVAR SCENE 2: The Arrogant Test
  // ───────────────────────────────────────────────────────────────────────────
  {
    filename: 'thiruvalluvar_2',
    title: 'Scene 2: The Arrogant Test',
    titleTamil: 'வள்ளுவரை சோதிக்க பட்டுச் சேலையைக் கிழிக்கும் இளைஞன்',
    render: `
      // 1. Background Wall & Village Window
      const wallG = ctx.createLinearGradient(0, 0, 0, 1080);
      wallG.addColorStop(0, '#3f1d18'); wallG.addColorStop(1, '#1a0b08');
      ctx.fillStyle = wallG; ctx.fillRect(0,0,1920,1080);

      // Window to Tamil Village (Center Background)
      ctx.fillStyle = '#0f172a'; ctx.fillRect(450, 100, 1020, 500);
      // Sky in window
      const winSky = ctx.createLinearGradient(450, 100, 450, 600);
      winSky.addColorStop(0, '#fef08a'); winSky.addColorStop(1, '#f97316');
      ctx.fillStyle = winSky; ctx.fillRect(450, 100, 1020, 500);
      // Village Roofs & Palm Trees in window
      ctx.fillStyle = '#b45309';
      ctx.beginPath(); ctx.moveTo(480, 450); ctx.lineTo(650, 320); ctx.lineTo(820, 450); ctx.fill();
      ctx.beginPath(); ctx.moveTo(1100, 450); ctx.lineTo(1300, 300); ctx.lineTo(1450, 450); ctx.fill();
      // Palm tree fronds
      ctx.fillStyle = '#15803d';
      ctx.beginPath(); ctx.arc(950, 350, 100, 0, Math.PI*2); ctx.fill();

      // Window Wooden Frame
      ctx.strokeStyle = '#78350f'; ctx.lineWidth = 24;
      ctx.strokeRect(450, 100, 1020, 500);
      ctx.beginPath(); ctx.moveTo(960, 100); ctx.lineTo(960, 600); ctx.stroke();

      // Teakwood Floor
      const floorG = ctx.createLinearGradient(0, 680, 0, 1080);
      floorG.addColorStop(0, '#78350f'); floorG.addColorStop(1, '#291206');
      ctx.fillStyle = floorG; ctx.fillRect(0, 680, 1920, 400);

      // Kuthuvilakku Oil Lamp (Left Window Frame)
      const lampGlow = ctx.createRadialGradient(320, 450, 10, 320, 450, 400);
      lampGlow.addColorStop(0, 'rgba(251, 191, 36, 0.8)'); lampGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = lampGlow; ctx.beginPath(); ctx.arc(320, 450, 400, 0, Math.PI*2); ctx.fill();
      // Lamp Stand
      ctx.fillStyle = '#f59e0b'; ctx.fillRect(300, 480, 40, 220);
      ctx.beginPath(); ctx.arc(320, 470, 35, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(320, 450, 12, 0, Math.PI*2); ctx.fill(); // Flame

      // Saint Thiruvalluvar (Left Seated)
      // Aura
      ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
      ctx.beginPath(); ctx.arc(380, 420, 160, 0, Math.PI*2); ctx.fill();
      // Body & Robes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.moveTo(280, 520); ctx.lineTo(480, 520); ctx.lineTo(520, 820); ctx.lineTo(240, 820); ctx.closePath(); ctx.fill();
      // Head & Hair Bun
      ctx.fillStyle = '#d97706'; ctx.beginPath(); ctx.arc(380, 380, 50, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.arc(380, 315, 28, 0, Math.PI*2); ctx.fill(); // Hair bun
      ctx.beginPath(); ctx.moveTo(330, 390); ctx.lineTo(430, 390); ctx.lineTo(380, 540); ctx.closePath(); ctx.fill(); // Beard

      // Arrogant Youth (Right Standing Tearing Saree)
      ctx.fillStyle = '#b45309'; ctx.beginPath(); ctx.arc(1500, 320, 55, 0, Math.PI*2); ctx.fill(); // Head
      ctx.fillStyle = '#0284c7'; // Silk Tunic
      ctx.beginPath(); ctx.moveTo(1400, 400); ctx.lineTo(1600, 400); ctx.lineTo(1650, 840); ctx.lineTo(1350, 840); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#b45309'; ctx.lineWidth = 36; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(1420, 440); ctx.lineTo(1120, 500); ctx.stroke(); // Stretched Arm

      // TORN CRIMSON SILK SAREE PIECES (Center)
      // Left Piece held by youth
      ctx.fillStyle = '#e11d48';
      ctx.beginPath(); ctx.moveTo(700, 460); ctx.lineTo(1050, 410); ctx.lineTo(1020, 780); ctx.lineTo(650, 800); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 24; // Gold border
      ctx.beginPath(); ctx.moveTo(700, 460); ctx.lineTo(1050, 410); ctx.stroke();

      // Right Piece
      ctx.fillStyle = '#e11d48';
      ctx.beginPath(); ctx.moveTo(1120, 420); ctx.lineTo(1380, 470); ctx.lineTo(1420, 800); ctx.lineTo(1140, 760); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 24;
      ctx.beginPath(); ctx.moveTo(1120, 420); ctx.lineTo(1380, 470); ctx.stroke();

      // Jagged Tear Crack
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(1050, 410); ctx.lineTo(1080, 520); ctx.lineTo(1040, 640); ctx.lineTo(1120, 760); ctx.stroke();
    `
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 2. THIRUVALLUVAR SCENE 3: Value of Human Labor
  // ───────────────────────────────────────────────────────────────────────────
  {
    filename: 'thiruvalluvar_3',
    title: 'Scene 3: Value of Human Labor',
    titleTamil: 'கந்தலான போதும் உழைப்பின் மதிப்பைக் கற்பித்தல்',
    render: `
      // Background Room
      ctx.fillStyle = '#1e1b4b'; ctx.fillRect(0,0,1920,1080);

      // Light Beam from above
      const beamG = ctx.createLinearGradient(960, 0, 960, 800);
      beamG.addColorStop(0, 'rgba(251, 191, 36, 0.5)'); beamG.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = beamG;
      ctx.beginPath(); ctx.moveTo(600,0); ctx.lineTo(1320,0); ctx.lineTo(1600,850); ctx.lineTo(320,850); ctx.closePath(); ctx.fill();

      // Loom Table
      ctx.fillStyle = '#581c87'; ctx.fillRect(250, 600, 1420, 320);
      ctx.fillStyle = '#3b0764'; ctx.fillRect(250, 600, 1420, 20);

      // Scattered Torn Silk Thread Rags
      const colors = ['#e11d48', '#f59e0b', '#0284c7', '#10b981', '#a855f7', '#ec4899'];
      for (let i=0; i<25; i++) {
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath(); ctx.ellipse(380 + i*55, 660 + (i%4)*35, 55, 25, (i*0.4), 0, Math.PI*2); ctx.fill();
      }

      // Saint Thiruvalluvar Standing (Center)
      ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
      ctx.beginPath(); ctx.arc(960, 300, 180, 0, Math.PI*2); ctx.fill();

      ctx.fillStyle = '#d97706'; ctx.beginPath(); ctx.arc(960, 240, 55, 0, Math.PI*2); ctx.fill(); // Head
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(960, 175, 30, 0, Math.PI*2); ctx.fill(); // Hair bun
      ctx.beginPath(); ctx.moveTo(900, 250); ctx.lineTo(1020, 250); ctx.lineTo(960, 420); ctx.closePath(); ctx.fill(); // Beard
      ctx.beginPath(); ctx.moveTo(840, 340); ctx.lineTo(1080, 340); ctx.lineTo(1120, 640); ctx.lineTo(800, 640); ctx.closePath(); ctx.fill(); // Robe
    `
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 3. THIRUVALLUVAR SCENE 4: Transformation of Heart
  // ───────────────────────────────────────────────────────────────────────────
  {
    filename: 'thiruvalluvar_4',
    title: 'Scene 4: Transformation of Heart',
    titleTamil: 'அகந்தையை விடுத்து திருக்குறளின் பொறையுடைமையைக் கற்றல்',
    render: `
      ctx.fillStyle = '#022c22'; ctx.fillRect(0,0,1920,1080);

      // Radial Aura from Thirukkural Manuscript
      const kGlow = ctx.createRadialGradient(960, 300, 20, 960, 300, 700);
      kGlow.addColorStop(0, 'rgba(251, 191, 36, 0.75)'); kGlow.addColorStop(0.5, 'rgba(16, 185, 129, 0.3)'); kGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = kGlow; ctx.beginPath(); ctx.arc(960, 300, 700, 0, Math.PI*2); ctx.fill();

      // Glowing Palm Leaf Manuscript (Thirukkural)
      ctx.fillStyle = '#f59e0b'; ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 10;
      ctx.fillRect(660, 200, 600, 200); ctx.strokeRect(660, 200, 600, 200);
      ctx.strokeStyle = '#78350f'; ctx.lineWidth = 6;
      for (let y=240; y<=360; y+=40) { ctx.beginPath(); ctx.moveTo(700, y); ctx.lineTo(1220, y); ctx.stroke(); }

      // Bowing Youth at Thiruvalluvar's Feet
      ctx.fillStyle = '#b45309'; ctx.beginPath(); ctx.arc(960, 580, 55, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#0369a1';
      ctx.beginPath(); ctx.moveTo(840, 650); ctx.lineTo(1080, 650); ctx.lineTo(1160, 950); ctx.lineTo(760, 950); ctx.closePath(); ctx.fill();
    `
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 4. CV RAMAN SCENE 1: Prism & Rainbow Light
  // ───────────────────────────────────────────────────────────────────────────
  {
    filename: 'cv_raman_1',
    title: 'Scene 1: Prism & Rainbow Light',
    titleTamil: 'சிறுவன் ராமன் ப்ரிஸத்தில் சூரிய ஒளி வானவில்லாகப் பிரிவதைக் கவனித்தல்',
    render: `
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0,0,1920,1080);

      // Window Frame & Bright Sunlight Beam
      ctx.fillStyle = '#fef08a'; ctx.fillRect(0, 0, 350, 450);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(450,0); ctx.lineTo(960,520); ctx.lineTo(720,520); ctx.closePath(); ctx.fill();

      // Glass Triangular Prism (Center)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(960, 340); ctx.lineTo(1140, 640); ctx.lineTo(780, 640); ctx.closePath(); ctx.fill(); ctx.stroke();

      // 7-Color Rainbow VIBGYOR Spectrum Ray Expanding
      const rainbow = ['#7c3aed', '#4f46e5', '#0284c7', '#10b981', '#eab308', '#f97316', '#ef4444'];
      rainbow.forEach((c, idx) => {
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.moveTo(960, 480); ctx.lineTo(1920, 460 + idx*60); ctx.lineTo(1920, 520 + idx*60); ctx.closePath(); ctx.fill();
      });

      // Young Raman Figure
      ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(480, 440, 60, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.moveTo(400, 520); ctx.lineTo(560, 520); ctx.lineTo(600, 960); ctx.lineTo(360, 960); ctx.closePath(); ctx.fill();
    `
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 5. CV RAMAN SCENE 2: Voyage Across the Ocean
  // ───────────────────────────────────────────────────────────────────────────
  {
    filename: 'cv_raman_2',
    title: 'Scene 2: Voyage Across the Ocean',
    titleTamil: '1921-ல் மத்திய தரைக்கடல் பயணத்தில் ஆழ்கடலின் நீல நிறத்தை ஆராய்தல்',
    render: `
      ctx.fillStyle = '#020617'; ctx.fillRect(0,0,1920,1080);
      // Starry Sky
      ctx.fillStyle = '#ffffff';
      for(let i=0; i<120; i++) { ctx.beginPath(); ctx.arc((i*157)%1920, (i*97)%520, (i%3)+1, 0, Math.PI*2); ctx.fill(); }

      // Deep Blue Mediterranean Ocean Waves
      const seaG = ctx.createLinearGradient(0, 550, 0, 1080);
      seaG.addColorStop(0, '#0284c7'); seaG.addColorStop(1, '#0369a1');
      ctx.fillStyle = seaG; ctx.fillRect(0, 550, 1920, 530);

      // Ship Railing
      ctx.fillStyle = '#334155'; ctx.fillRect(0, 520, 1920, 40);
      for(let x=120; x<1920; x+=280) { ctx.fillRect(x, 520, 32, 350); }

      // C.V. Raman with Spectroscope (Center Deck)
      ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(960, 300, 60, 0, Math.PI*2); ctx.fill(); // Head
      ctx.fillStyle = '#ffffff'; // White Turban
      ctx.beginPath(); ctx.arc(960, 240, 40, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#0f172a'; // Suit
      ctx.beginPath(); ctx.moveTo(880, 380); ctx.lineTo(1040, 380); ctx.lineTo(1080, 850); ctx.lineTo(840, 850); ctx.closePath(); ctx.fill();

      // Brass Spectroscope Instrument
      ctx.fillStyle = '#fbbf24'; ctx.fillRect(1000, 320, 180, 24);
    `
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 6. CV RAMAN SCENE 3: The Raman Effect (1928)
  // ───────────────────────────────────────────────────────────────────────────
  {
    filename: 'cv_raman_3',
    title: 'Scene 3: The Raman Effect (1928)',
    titleTamil: '1928 பிப்ரவரி 28 அன்று ஒளியின் சிதறலை ராமன் விளைவு மூலம் நிரூபித்தல்',
    render: `
      ctx.fillStyle = '#31103f'; ctx.fillRect(0,0,1920,1080);
      const rGlow = ctx.createRadialGradient(960, 540, 20, 960, 540, 650);
      rGlow.addColorStop(0, 'rgba(168, 85, 247, 0.75)'); rGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rGlow; ctx.beginPath(); ctx.arc(960, 540, 650, 0, Math.PI*2); ctx.fill();

      // Water Molecule Structure
      ctx.fillStyle = '#0284c7'; ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 14;
      ctx.beginPath(); ctx.arc(960, 540, 140, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath(); ctx.arc(780, 400, 75, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(1140, 400, 75, 0, Math.PI*2); ctx.fill();

      // Incident & Scattered Beams
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 22;
      ctx.beginPath(); ctx.moveTo(0, 240); ctx.lineTo(840, 480); ctx.stroke();
      ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 22;
      ctx.beginPath(); ctx.moveTo(1080, 480); ctx.lineTo(1920, 180); ctx.stroke();
      ctx.strokeStyle = '#ec4899'; ctx.lineWidth = 22;
      ctx.beginPath(); ctx.moveTo(1080, 600); ctx.lineTo(1920, 900); ctx.stroke();
    `
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 7. CV RAMAN SCENE 4: Nobel Glory
  // ───────────────────────────────────────────────────────────────────────────
  {
    filename: 'cv_raman_4',
    title: 'Scene 4: Nobel Prize & National Science Day',
    titleTamil: '1930-ல் இயற்பியலுக்கான நோபல் பரிசு பெற்று இந்தியாவிற்குப் பெருமை சேர்த்தல்',
    render: `
      ctx.fillStyle = '#451a03'; ctx.fillRect(0,0,1920,1080);
      const nobelG = ctx.createRadialGradient(960, 480, 50, 960, 480, 700);
      nobelG.addColorStop(0, 'rgba(251, 191, 36, 0.85)'); nobelG.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = nobelG; ctx.beginPath(); ctx.arc(960, 480, 700, 0, Math.PI*2); ctx.fill();

      // Giant Nobel Medal
      ctx.fillStyle = '#f59e0b'; ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 20;
      ctx.beginPath(); ctx.arc(960, 480, 260, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#78350f'; ctx.font = 'bold 46px serif'; ctx.textAlign = 'center';
      ctx.fillText('NOBEL PRIZE', 960, 410);
      ctx.font = 'bold 58px serif'; ctx.fillText('PHYSICS 1930', 960, 490);
      ctx.font = 'bold 40px sans-serif'; ctx.fillText('SIR C.V. RAMAN', 960, 560);
    `
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 8. PANCHATANTRA SCENES
  // ───────────────────────────────────────────────────────────────────────────
  {
    filename: 'panchatantra_1',
    title: 'Scene 1: Booming Thunder in the Forest',
    titleTamil: 'காட்டில் எழுப்பப்பட்ட பயங்கர டூம் ஒலியைக் கேட்டு விலங்குகள் பயந்து நடுங்குதல்',
    render: `
      ctx.fillStyle = '#022c22'; ctx.fillRect(0,0,1920,1080);
      for(let r=180; r<=750; r+=140) {
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)'; ctx.lineWidth = 12;
        ctx.beginPath(); ctx.arc(960, 450, r, 0, Math.PI*2); ctx.stroke();
      }
      ctx.fillStyle = '#f59e0b'; ctx.font = '900 120px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('DHOOM! DHOOM!', 960, 480);
    `
  },
  {
    filename: 'panchatantra_2',
    title: 'Scene 2: Courage Over Fear',
    titleTamil: 'பயந்து ஓடாமல் ஒலியின் உண்மையான மூலத்தை ஆராயப் புத்திசாலி நரி துணிதல்',
    render: `
      ctx.fillStyle = '#052e16'; ctx.fillRect(0,0,1920,1080);
      ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(1550, 200, 110, 0, Math.PI*2); ctx.fill(); // Full Moon
      ctx.fillStyle = '#15803d';
      ctx.beginPath(); ctx.arc(350, 820, 320, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(1550, 820, 380, 0, Math.PI*2); ctx.fill();

      // Jackal Sneaking
      ctx.fillStyle = '#d97706';
      ctx.beginPath(); ctx.ellipse(960, 620, 140, 75, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(1080, 560, 50, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(1110, 550); ctx.lineTo(1200, 570); ctx.lineTo(1110, 590); ctx.closePath(); ctx.fill();
    `
  },
  {
    filename: 'panchatantra_3',
    title: 'Scene 3: The Abandoned War Drum',
    titleTamil: 'காற்றில் மரக்கிளைகள் பழைய போர் முரசில் மோதியதால் ஒலி எழுந்தது என அறிதல்',
    render: `
      ctx.fillStyle = '#451a03'; ctx.fillRect(0,0,1920,1080);
      ctx.fillStyle = '#291206'; ctx.fillRect(320, 0, 280, 1080);

      ctx.fillStyle = '#b45309'; ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 18;
      ctx.beginPath(); ctx.ellipse(1080, 600, 260, 180, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.ellipse(1080, 600, 200, 130, 0, 0, Math.PI*2); ctx.fill();

      ctx.strokeStyle = '#78350f'; ctx.lineWidth = 28; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(400, 180); ctx.lineTo(960, 520); ctx.stroke();
    `
  },
  {
    filename: 'panchatantra_4',
    title: 'Scene 4: Rewarding Feast',
    titleTamil: 'பயந்து ஓடாமல் ஆராய்ந்ததால் சுவையான உணவை அடைந்து மகிழ்தல்',
    render: `
      ctx.fillStyle = '#065f46'; ctx.fillRect(0,0,1920,1080);
      const feastGlow = ctx.createRadialGradient(960, 540, 50, 960, 540, 600);
      feastGlow.addColorStop(0, 'rgba(251, 191, 36, 0.75)'); feastGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = feastGlow; ctx.beginPath(); ctx.arc(960, 540, 600, 0, Math.PI*2); ctx.fill();

      ctx.fillStyle = '#d97706'; ctx.beginPath(); ctx.arc(960, 420, 110, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#451a03'; ctx.lineWidth = 12;
      ctx.beginPath(); ctx.arc(960, 450, 45, 0, Math.PI); ctx.stroke();
      ctx.fillStyle = '#b45309'; ctx.fillRect(780, 640, 360, 180);
    `
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 9. KALAM SCENES
  // ───────────────────────────────────────────────────────────────────────────
  {
    filename: 'kalam_1',
    title: 'Scene 1: Stormy Afternoon & Fallen Bird',
    titleTamil: 'மழைக்குப் பின் சேற்றில் அடிபட்டு நடுங்கும் சிட்டுக்குருவியைச் சிறுவன் கலாம் காண்பது',
    render: `
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0,0,1920,1080);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)'; ctx.lineWidth = 5;
      for(let i=0; i<300; i++) {
        const rx = (i*97)%2100 - 100; const ry = (i*149)%1080;
        ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 55, ry + 160); ctx.stroke();
      }

      ctx.fillStyle = '#291206'; ctx.beginPath(); ctx.ellipse(960, 860, 700, 180, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#b45309'; ctx.beginPath(); ctx.arc(960, 780, 50, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#78350f'; ctx.beginPath(); ctx.arc(995, 760, 22, 0, Math.PI*2); ctx.fill();

      ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(640, 500, 65, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.moveTo(550, 580); ctx.lineTo(730, 580); ctx.lineTo(770, 860); ctx.lineTo(510, 860); ctx.closePath(); ctx.fill();
    `
  },
  {
    filename: 'kalam_2',
    title: 'Scene 2: Gentle Care & Healing',
    titleTamil: 'குருவியைக் வீட்டிற்குத் தூக்கி வந்து கனிவோடு பராமரித்துக் குணப்படுத்துதல்',
    render: `
      ctx.fillStyle = '#064e3b'; ctx.fillRect(0,0,1920,1080);
      const careGlow = ctx.createRadialGradient(960, 540, 30, 960, 540, 600);
      careGlow.addColorStop(0, 'rgba(244, 63, 94, 0.55)'); careGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = careGlow; ctx.beginPath(); ctx.arc(960, 540, 600, 0, Math.PI*2); ctx.fill();

      ctx.fillStyle = '#78350f'; ctx.strokeStyle = '#b45309'; ctx.lineWidth = 14;
      ctx.beginPath(); ctx.ellipse(960, 680, 280, 110, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.ellipse(960, 660, 230, 75, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#d97706'; ctx.beginPath(); ctx.arc(960, 620, 60, 0, Math.PI*2); ctx.fill();
    `
  },
  {
    filename: 'kalam_3',
    title: 'Scene 3: Soaring into the Blue Sky',
    titleTamil: '5 நாட்களுக்குப் பின் குணமாகிய குருவி வானில் உயரே பறந்து மகிழ்தல்',
    render: `
      ctx.fillStyle = '#0284c7'; ctx.fillRect(0,0,1920,1080);
      ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(960, 280, 170, 0, Math.PI*2); ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.moveTo(960, 340); ctx.lineTo(1240, 180); ctx.lineTo(960, 300); ctx.lineTo(680, 180); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#d97706'; ctx.beginPath(); ctx.arc(960, 320, 35, 0, Math.PI*2); ctx.fill();
    `
  },
  {
    filename: 'kalam_4',
    title: 'Scene 4: Father\'s Immortal Wisdom',
    titleTamil: '\'விழுந்தவர்களைத் தூக்கி நிறுத்துவதே பெருமை\' எனும் தந்தையின் போதனை',
    render: `
      ctx.fillStyle = '#451a03'; ctx.fillRect(0,0,1920,1080);
      ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(960, 540, 280, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#18181b'; ctx.fillRect(0, 540, 1920, 540);

      ctx.fillStyle = '#09090b';
      ctx.beginPath(); ctx.arc(780, 440, 48, 0, Math.PI*2); ctx.fill(); ctx.fillRect(720, 500, 120, 460);
      ctx.beginPath(); ctx.arc(1080, 510, 38, 0, Math.PI*2); ctx.fill(); ctx.fillRect(1030, 550, 100, 410);
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
    background: rgba(2, 6, 23, 0.94); border-top: 2px solid rgba(255,255,255,0.12);
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
