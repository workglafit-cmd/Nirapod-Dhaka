/**
 * Nirapod Dhaka — Full Video Renderer
 * Pipeline: node-canvas → raw RGBA frames → FFmpeg → MP4
 * 1920×1080 @ 30fps, ~180 seconds
 */

const { createCanvas, loadImage, registerFont } = require('canvas');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// ─── CONFIG ──────────────────────────────────────────────────
const W = 1920, H = 1080, FPS = 30;
const TOTAL_DURATION = 175; // seconds
const TOTAL_FRAMES = TOTAL_DURATION * FPS;

const SCREENSHOTS = path.join(__dirname, '..', 'screenshots');
const PUBLIC = path.join(__dirname, '..', 'public');
const VOICEOVER = path.join(__dirname, 'voiceover.mp3');
const OUTPUT = path.join(__dirname, 'output', 'nirapod_dhaka_final.mp4');

// ─── COLORS ─────────────────────────────────────────────────
const C = {
  bgDark: '#0f172a',
  bgDark2: '#1e293b',
  bgNavy: '#16213e',
  bgWhite: '#ffffff',
  bgLight: '#f8f9fa',
  emerald: '#10b981',
  emeraldDark: '#059669',
  cyan: '#06b6d4',
  red: '#ef4444',
  textWhite: '#f1f5f9',
  textDark: '#1e293b',
  gold: '#f59e0b',
  purple: '#8b5cf6',
};

// ─── EASING ─────────────────────────────────────────────────
function easeInOut(t) { return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2; }
function easeOut(t) { return 1 - Math.pow(1-t,3); }
function easeIn(t) { return t*t*t; }
function lerp(a, b, t) { return a + (b-a) * t; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function progress(frame, startFrame, endFrame) {
  return clamp((frame - startFrame) / (endFrame - startFrame), 0, 1);
}

// ─── DRAWING HELPERS ────────────────────────────────────────
function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function fillRoundedRect(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color;
  drawRoundedRect(ctx, x, y, w, h, r);
  ctx.fill();
}

function drawGlow(ctx, x, y, radius, color, alpha) {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
  grad.addColorStop(0, color + Math.round(alpha*255).toString(16).padStart(2,'0'));
  grad.addColorStop(1, color + '00');
  ctx.fillStyle = grad;
  ctx.fillRect(x-radius, y-radius, radius*2, radius*2);
}

function drawGradientBG(ctx, color1, color2, vertical=true) {
  const grad = vertical
    ? ctx.createLinearGradient(0, 0, 0, H)
    : ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, color1);
  grad.addColorStop(1, color2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

function drawGridPattern(ctx, alpha) {
  ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
  ctx.lineWidth = 0.5;
  for (let x = 0; x < W; x += 60) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 60) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
}

function drawSubtleParticles(ctx, frame, count, alpha) {
  ctx.fillStyle = `rgba(16,185,129,${alpha})`;
  for (let i = 0; i < count; i++) {
    const seed = i * 7919;
    const x = ((seed * 13 + frame * 0.3) % W);
    const y = ((seed * 17 + frame * 0.2) % H);
    const size = 1 + (seed % 3);
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function typewriterText(ctx, text, x, y, frame, startFrame, charsPerFrame) {
  const elapsed = Math.max(0, frame - startFrame);
  const chars = Math.min(text.length, Math.floor(elapsed * charsPerFrame));
  ctx.fillText(text.substring(0, chars), x, y);
  // Draw cursor
  if (chars < text.length && Math.floor(frame / 8) % 2 === 0) {
    const metrics = ctx.measureText(text.substring(0, chars));
    ctx.fillRect(x + metrics.width + 2, y - 20, 2, 25);
  }
}

function drawImageFit(ctx, img, x, y, w, h, objectFit='cover') {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;
  let sx=0, sy=0, sw=img.width, sh=img.height;
  if (objectFit === 'cover') {
    if (imgRatio > boxRatio) {
      sw = img.height * boxRatio;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / boxRatio;
      sy = (img.height - sh) / 2;
    }
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function drawImageWithShadow(ctx, img, x, y, w, h, shadowBlur=30) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = shadowBlur;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 10;
  drawRoundedRect(ctx, x, y, w, h, 12);
  ctx.clip();
  drawImageFit(ctx, img, x, y, w, h);
  ctx.restore();
}

function drawScreenshotInDevice(ctx, img, cx, cy, w, h, scale, rotation) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.rotate(rotation);
  // Device frame (browser mockup)
  const bx = -w/2, by = -h/2 - 30;
  fillRoundedRect(ctx, bx-4, by-4, w+8, h+38, 12, '#374151');
  // Title bar
  fillRoundedRect(ctx, bx, by, w, 30, [8,8,0,0], '#1f2937');
  // Traffic lights
  ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(bx+16, by+15, 5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(bx+34, by+15, 5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(bx+52, by+15, 5, 0, Math.PI*2); ctx.fill();
  // URL bar
  fillRoundedRect(ctx, bx+70, by+6, w-140, 18, 9, '#374151');
  ctx.fillStyle = '#9ca3af';
  ctx.font = '10px Arial';
  ctx.fillText('nirapoddhk.vercel.app', bx+80, by+19);
  // Screenshot
  ctx.save();
  drawRoundedRect(ctx, bx, by+30, w, h, [0,0,8,8]);
  ctx.clip();
  drawImageFit(ctx, img, bx, by+30, w, h);
  ctx.restore();
  ctx.restore();
}

// ─── SCENE TIMELINE ─────────────────────────────────────────
// Voiceover starts at frame 150 (5s intro)
const VO_OFFSET = 5; // seconds of silent intro
const SCENES = {
  intro:     { start: 0,    end: 5 },
  scene1:    { start: 5,    end: 33 },
  scene2:    { start: 33,   end: 57 },
  scene3a:   { start: 57,   end: 72 },
  scene3b:   { start: 72,   end: 92 },
  scene3c:   { start: 92,   end: 107 },
  scene4:    { start: 107,  end: 135 },
  scene5:    { start: 135,  end: 165 },
  outro:     { start: 165,  end: 175 },
};

// ─── IMAGE CACHE ────────────────────────────────────────────
const imageCache = {};
async function getImage(filePath) {
  if (!imageCache[filePath]) {
    try {
      imageCache[filePath] = await loadImage(filePath);
    } catch(e) {
      console.error(`Failed to load: ${filePath}`);
      // Return a placeholder
      const c = createCanvas(1920, 1080);
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0,0,1920,1080);
      ctx.fillStyle = '#ef4444';
      ctx.font = '24px Arial';
      ctx.fillText(`Missing: ${path.basename(filePath)}`, 100, 540);
      imageCache[filePath] = c;
    }
  }
  return imageCache[filePath];
}

// ─── SCENE RENDERERS ────────────────────────────────────────

async function renderIntro(ctx, frame) {
  const t = frame / (SCENES.intro.end * FPS);

  // Dark background with gradient
  drawGradientBG(ctx, '#050a15', '#0f172a');

  // Subtle grid
  drawGridPattern(ctx, 0.02 * easeOut(t));

  // Emerald glow center
  const glowAlpha = easeInOut(clamp(t * 2, 0, 1)) * 0.15;
  drawGlow(ctx, W/2, H/2, 400, C.emerald, glowAlpha);

  // Shield / Logo circle
  const logoScale = easeOut(clamp(t * 1.5, 0, 1));
  if (logoScale > 0.01) {
    ctx.save();
    ctx.translate(W/2, H/2 - 40);
    ctx.scale(logoScale, logoScale);
    ctx.globalAlpha = logoScale;

    // Shield shape
    ctx.beginPath();
    ctx.arc(0, 0, 50, 0, Math.PI * 2);
    ctx.fillStyle = C.emerald;
    ctx.fill();

    // Inner checkmark
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.lineTo(-5, 10);
    ctx.lineTo(15, -10);
    ctx.stroke();

    ctx.restore();
  }

  // Title text
  const textAlpha = easeOut(clamp((t - 0.3) * 2, 0, 1));
  if (textAlpha > 0.01) {
    ctx.globalAlpha = textAlpha;
    ctx.textAlign = 'center';

    ctx.fillStyle = C.textWhite;
    ctx.font = 'bold 56px Arial';
    ctx.fillText('NIRAPOD DHAKA', W/2, H/2 + 50);

    ctx.fillStyle = C.emerald;
    ctx.font = '20px Arial';
    ctx.fillText('নিরাপদ ঢাকা', W/2, H/2 + 85);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px Arial';
    ctx.fillText('AI-Orchestrated Civic Safety Network & Urban Digital Twin', W/2, H/2 + 120);

    ctx.globalAlpha = 1;
  }

  ctx.textAlign = 'left';
}

async function renderScene1(ctx, frame, images) {
  const sceneStart = SCENES.scene1.start * FPS;
  const sceneEnd = SCENES.scene1.end * FPS;
  const sceneFrame = frame - sceneStart;
  const sceneDur = sceneEnd - sceneStart;
  const t = sceneFrame / sceneDur;

  // Subsections
  // 0:00–0:10 VO (frames 0-150 of scene): Dhaka intro with home screenshot
  // 0:10–0:20 VO (frames 150-300): Hazards - "void, hotlines fail..."
  // 0:20–0:28 VO (frames 300-390+): "Team ANIMATRIX presents Nirapod Dhaka"

  const sub1End = 0.36; // first 10s of scene
  const sub2End = 0.71; // next 10s
  // sub3 = rest

  // Background
  drawGradientBG(ctx, '#050a15', '#0f172a');

  const homeImg = images['01_home_full'];
  const skylineImg = images['dhaka_skyline_panorama'];
  const citizenMapImg = images['01_citizen_logged_in_map'];

  if (t < sub1End) {
    // Part 1: Dhaka city intro
    const pt = t / sub1End;

    // Skyline panorama with slow pan
    if (skylineImg) {
      ctx.save();
      ctx.globalAlpha = 0.25;
      const panX = -pt * 200;
      drawImageFit(ctx, skylineImg, panX, 0, W + 200, H);
      ctx.restore();
    }

    // Dark overlay
    ctx.fillStyle = 'rgba(5,10,21,0.7)';
    ctx.fillRect(0, 0, W, H);

    // Kinetic typography - stats
    const fadeIn1 = easeOut(clamp(pt * 4, 0, 1));
    const fadeIn2 = easeOut(clamp((pt - 0.25) * 4, 0, 1));
    const fadeIn3 = easeOut(clamp((pt - 0.5) * 4, 0, 1));

    ctx.textAlign = 'center';

    if (fadeIn1 > 0.01) {
      ctx.globalAlpha = fadeIn1;
      ctx.fillStyle = C.textWhite;
      ctx.font = 'bold 72px Arial';
      const yOff1 = (1 - fadeIn1) * 30;
      ctx.fillText('DHAKA', W/2, H/2 - 120 + yOff1);

      ctx.fillStyle = C.emerald;
      ctx.font = 'bold 96px Arial';
      ctx.fillText('20M+ CITIZENS', W/2, H/2 - 20 + yOff1);
    }

    if (fadeIn2 > 0.01) {
      ctx.globalAlpha = fadeIn2;
      ctx.fillStyle = C.gold;
      ctx.font = 'bold 48px Arial';
      const yOff2 = (1 - fadeIn2) * 30;
      ctx.fillText('48,500 PEOPLE / KM²', W/2, H/2 + 60 + yOff2);
    }

    if (fadeIn3 > 0.01) {
      ctx.globalAlpha = fadeIn3;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '24px Arial';
      const yOff3 = (1 - fadeIn3) * 20;
      ctx.fillText('One of the densest megacities on Earth', W/2, H/2 + 120 + yOff3);
    }

    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';

  } else if (t < sub2End) {
    // Part 2: The gap / hazards
    const pt = (t - sub1End) / (sub2End - sub1End);

    drawGradientBG(ctx, '#050a15', '#1a0505');

    // Red alert pulse
    const pulse = Math.sin(frame * 0.15) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(239,68,68,${0.03 + pulse * 0.04})`;
    ctx.fillRect(0, 0, W, H);

    // Hazard labels with red accent
    const hazards = [
      { text: 'OPEN MANHOLES', icon: '⚠' },
      { text: 'WATERLOGGING', icon: '🌊' },
      { text: 'DARK STREETS', icon: '🌑' },
      { text: 'BROKEN DRAINAGE', icon: '🔧' },
    ];

    ctx.textAlign = 'center';

    // Title
    const titleFade = easeOut(clamp(pt * 3, 0, 1));
    ctx.globalAlpha = titleFade;
    ctx.fillStyle = C.red;
    ctx.font = 'bold 20px Arial';
    ctx.fillText('THE CRITICAL GAP', W/2, 120);
    ctx.fillStyle = C.textWhite;
    ctx.font = 'bold 36px Arial';
    ctx.fillText('Siloed Agencies & Panic Hotlines', W/2, 170);

    // Hazard cards
    hazards.forEach((h, i) => {
      const cardFade = easeOut(clamp((pt - 0.15 * i) * 3, 0, 1));
      if (cardFade > 0.01) {
        ctx.globalAlpha = cardFade;
        const cardX = W/2 - 380 + i * 200;
        const cardY = H/2 - 60 + (1-cardFade)*30;
        const cardW = 180;
        const cardH = 160;

        // Card bg
        fillRoundedRect(ctx, cardX, cardY, cardW, cardH, 12, 'rgba(239,68,68,0.15)');

        // Border
        ctx.strokeStyle = `rgba(239,68,68,${0.3 + pulse * 0.3})`;
        ctx.lineWidth = 1.5;
        drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 12);
        ctx.stroke();

        // Icon
        ctx.font = '36px Arial';
        ctx.fillStyle = C.textWhite;
        ctx.fillText(h.icon, cardX + cardW/2, cardY + 60);

        // Label
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = C.red;
        ctx.fillText(h.text, cardX + cardW/2, cardY + 100);
      }
    });

    // Bottom stat
    const bottomFade = easeOut(clamp((pt - 0.5) * 3, 0, 1));
    ctx.globalAlpha = bottomFade;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px Arial';
    ctx.fillText('Citizens face a void when hazards strike', W/2, H - 140);

    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';

  } else {
    // Part 3: Team ANIMATRIX introduces Nirapod Dhaka
    const pt = (t - sub2End) / (1 - sub2End);

    drawGradientBG(ctx, '#050a15', '#0f172a');

    // Home screenshot slides in from right
    if (homeImg) {
      const slideIn = easeOut(clamp(pt * 2, 0, 1));
      const imgX = lerp(W + 100, W/2 - 350, slideIn);
      const imgW = 700;
      const imgH = imgW * (homeImg.height / homeImg.width);

      ctx.save();
      ctx.globalAlpha = slideIn * 0.9;
      drawImageWithShadow(ctx, homeImg, imgX, H/2 - Math.min(imgH, 500)/2, imgW, Math.min(imgH, 500));
      ctx.restore();
    }

    // Text on the left
    const textFade = easeOut(clamp((pt - 0.2) * 3, 0, 1));
    if (textFade > 0.01) {
      ctx.globalAlpha = textFade;
      ctx.textAlign = 'left';
      const tx = 100;
      const tyOff = (1 - textFade) * 20;

      ctx.fillStyle = C.emerald;
      ctx.font = 'bold 18px Arial';
      ctx.fillText('TEAM ANIMATRIX PRESENTS', tx, H/2 - 60 + tyOff);

      ctx.fillStyle = C.textWhite;
      ctx.font = 'bold 52px Arial';
      ctx.fillText('Nirapod Dhaka', tx, H/2 + tyOff);

      ctx.fillStyle = C.emerald;
      ctx.font = '28px Arial';
      ctx.fillText('নিরাপদ ঢাকা', tx, H/2 + 50 + tyOff);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '18px Arial';
      ctx.fillText('AI-Orchestrated Civic Safety Network', tx, H/2 + 90 + tyOff);

      ctx.globalAlpha = 1;
    }
  }

  // Subtle transition fade at scene end
  const fadeOutStart = 0.92;
  if (t > fadeOutStart) {
    const fo = (t - fadeOutStart) / (1 - fadeOutStart);
    ctx.fillStyle = `rgba(15,23,42,${fo * 0.5})`;
    ctx.fillRect(0, 0, W, H);
  }
}

async function renderScene2(ctx, frame, images) {
  const sceneStart = SCENES.scene2.start * FPS;
  const sceneEnd = SCENES.scene2.end * FPS;
  const sceneFrame = frame - sceneStart;
  const sceneDur = sceneEnd - sceneStart;
  const t = sceneFrame / sceneDur;

  drawGradientBG(ctx, '#0f172a', '#050a15');
  drawGridPattern(ctx, 0.015);
  drawSubtleParticles(ctx, frame, 15, 0.3);

  // Section title
  const titleFade = easeOut(clamp(t * 4, 0, 1));
  ctx.globalAlpha = titleFade;
  ctx.textAlign = 'center';
  ctx.fillStyle = C.emerald;
  ctx.font = 'bold 16px Arial';
  ctx.fillText('THE SOLUTION', W/2, 60);
  ctx.fillStyle = C.textWhite;
  ctx.font = 'bold 32px Arial';
  ctx.fillText('3-Tier Civic AI Ecosystem', W/2, 100);
  ctx.globalAlpha = 1;

  // Architecture flow: 4 nodes with connecting lines
  const nodes = [
    { label: 'Citizen\nFrontline', sublabel: 'Voice & Text Reports', color: C.emerald, icon: '👤' },
    { label: 'Autonomous\nAI Triage', sublabel: 'NLP + Classification', color: C.cyan, icon: '🤖' },
    { label: 'Multi-Agency\nHub', sublabel: 'Police · City Corp · DMB', color: C.gold, icon: '🏛' },
    { label: 'Urban\nDigital Twin', sublabel: 'Predictive Simulation', color: C.purple, icon: '🌐' },
  ];

  const nodeW = 200, nodeH = 130;
  const startX = 160, gap = (W - 2 * startX - nodeW * nodes.length) / (nodes.length - 1) + nodeW;
  const nodeY = H/2 - 80;

  nodes.forEach((node, i) => {
    const nodeFade = easeOut(clamp((t - 0.1 - i * 0.12) * 3, 0, 1));
    if (nodeFade < 0.01) return;

    const nx = startX + i * gap;
    const ny = nodeY + (1 - nodeFade) * 40;
    ctx.globalAlpha = nodeFade;

    // Connecting line to next node
    if (i < nodes.length - 1) {
      const nextFade = easeOut(clamp((t - 0.1 - (i+1) * 0.12) * 3, 0, 1));
      if (nextFade > 0.01) {
        const lineProgress = easeOut(clamp((t - 0.15 - i * 0.12) * 4, 0, 1));
        const lx1 = nx + nodeW;
        const lx2 = lerp(lx1, startX + (i+1) * gap, lineProgress);
        const ly = nodeY + nodeH / 2;

        ctx.strokeStyle = node.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.moveTo(lx1 + 5, ly);
        ctx.lineTo(lx2 - 5, ly);
        ctx.stroke();
        ctx.setLineDash([]);

        // Arrow
        if (lineProgress > 0.9) {
          ctx.fillStyle = node.color;
          ctx.beginPath();
          ctx.moveTo(lx2 - 5, ly - 6);
          ctx.lineTo(lx2 + 5, ly);
          ctx.lineTo(lx2 - 5, ly + 6);
          ctx.fill();
        }
      }
    }

    // Node card
    fillRoundedRect(ctx, nx, ny, nodeW, nodeH, 12, 'rgba(30,41,59,0.9)');

    // Top accent bar
    fillRoundedRect(ctx, nx, ny, nodeW, 4, [12,12,0,0], node.color);

    // Glow
    drawGlow(ctx, nx + nodeW/2, ny + nodeH/2, 80, node.color, 0.08);

    // Icon
    ctx.font = '28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(node.icon, nx + nodeW/2, ny + 40);

    // Label
    ctx.fillStyle = C.textWhite;
    ctx.font = 'bold 14px Arial';
    const lines = node.label.split('\n');
    lines.forEach((line, li) => {
      ctx.fillText(line, nx + nodeW/2, ny + 65 + li * 18);
    });

    // Sublabel
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Arial';
    ctx.fillText(node.sublabel, nx + nodeW/2, ny + 115);
  });

  // Bottom: Three pillars
  const pillars = [
    { label: 'Voice NLP', desc: 'Bangla/Banglish understanding', color: C.emerald },
    { label: 'Auto-Routing', desc: 'Zero red tape, instant dispatch', color: C.cyan },
    { label: 'Digital Twin', desc: 'Predictive urban simulation', color: C.purple },
  ];

  const pillarY = H - 180;
  const pillarW = 280;
  const pillarGap = (W - pillarW * 3) / 4;

  // Section label
  const pillarsFade = easeOut(clamp((t - 0.55) * 3, 0, 1));
  if (pillarsFade > 0.01) {
    ctx.globalAlpha = pillarsFade;
    ctx.textAlign = 'center';
    ctx.fillStyle = C.emerald;
    ctx.font = 'bold 14px Arial';
    ctx.fillText('ZERO-FRICTION TO ACTION', W/2, pillarY - 40);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px Arial';
    ctx.fillText('Under 15 Seconds · Zero Red Tape', W/2, pillarY - 18);

    pillars.forEach((p, i) => {
      const pFade = easeOut(clamp((t - 0.6 - i * 0.08) * 4, 0, 1));
      ctx.globalAlpha = pFade;
      const px = pillarGap + i * (pillarW + pillarGap);
      const py = pillarY;

      fillRoundedRect(ctx, px, py, pillarW, 90, 10, 'rgba(30,41,59,0.7)');

      // Left accent
      fillRoundedRect(ctx, px, py, 4, 90, [10,0,0,10], p.color);

      ctx.textAlign = 'left';
      ctx.fillStyle = C.textWhite;
      ctx.font = 'bold 18px Arial';
      ctx.fillText(p.label, px + 20, py + 35);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px Arial';
      ctx.fillText(p.desc, px + 20, py + 60);
    });
  }

  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
}

async function renderScene3a(ctx, frame, images) {
  // Citizen Report Flow
  const sceneStart = SCENES.scene3a.start * FPS;
  const sceneEnd = SCENES.scene3a.end * FPS;
  const sceneFrame = frame - sceneStart;
  const sceneDur = sceneEnd - sceneStart;
  const t = sceneFrame / sceneDur;

  drawGradientBG(ctx, '#0f172a', '#050a15');

  // Section badge
  const badgeFade = easeOut(clamp(t * 5, 0, 1));
  ctx.globalAlpha = badgeFade;
  ctx.textAlign = 'left';
  ctx.fillStyle = C.emerald;
  ctx.font = 'bold 14px Arial';
  ctx.fillText('PRODUCT DEMO', 60, 50);
  ctx.fillStyle = C.textWhite;
  ctx.font = 'bold 24px Arial';
  ctx.fillText('Live 4-Step Citizen Report Flow', 60, 80);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px Arial';
  ctx.fillText('Bangla/Banglish NLP · AI Verification · Instant Dispatch', 60, 105);
  ctx.globalAlpha = 1;

  // Show report flow screenshots in sequence
  const reportSteps = [
    { img: images['02_report_flow_step1_details'], label: 'Step 1: Report Details', time: [0, 0.35] },
    { img: images['04_report_flow_step3_verify'], label: 'Step 2: AI Verification', time: [0.25, 0.65] },
    { img: images['05_report_flow_step4_review'], label: 'Step 3: Review & Submit', time: [0.5, 0.9] },
  ];

  // Citizen map as background
  const mapImg = images['01_citizen_logged_in_map'];
  if (mapImg) {
    ctx.save();
    ctx.globalAlpha = 0.12;
    drawImageFit(ctx, mapImg, 0, 0, W, H);
    ctx.restore();
    ctx.fillStyle = 'rgba(15,23,42,0.85)';
    ctx.fillRect(0, 0, W, H);
  }

  reportSteps.forEach((step, i) => {
    if (!step.img) return;
    const stepT = clamp((t - step.time[0]) / (step.time[1] - step.time[0]), 0, 1);
    const fadeIn = easeOut(clamp(stepT * 3, 0, 1));
    const fadeOut = 1 - easeIn(clamp((stepT - 0.8) * 5, 0, 1));
    const alpha = fadeIn * fadeOut;

    if (alpha < 0.01) return;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Screenshot in browser frame - centered with slight offset per step
    const imgW = 550;
    const imgH = 680;
    const offsetX = i * 80;
    const cx = W/2 + 120 + offsetX;
    const cy = H/2 + 40;

    drawScreenshotInDevice(ctx, step.img, cx, cy, imgW, imgH, 0.75 + fadeIn * 0.05, 0);

    // Step label card on the left
    const cardX = 60;
    const cardY = 160 + i * 100;
    const isActive = stepT > 0.1 && stepT < 0.9;

    fillRoundedRect(ctx, cardX, cardY, 320, 70, 10,
      isActive ? 'rgba(16,185,129,0.15)' : 'rgba(30,41,59,0.5)');

    if (isActive) {
      ctx.strokeStyle = C.emerald;
      ctx.lineWidth = 1.5;
      drawRoundedRect(ctx, cardX, cardY, 320, 70, 10);
      ctx.stroke();
    }

    // Step number
    ctx.fillStyle = isActive ? C.emerald : '#64748b';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${i + 1}`, cardX + 20, cardY + 35);

    // Step label
    ctx.fillStyle = isActive ? C.textWhite : '#94a3b8';
    ctx.font = isActive ? 'bold 16px Arial' : '16px Arial';
    ctx.fillText(step.label, cardX + 50, cardY + 35);

    ctx.restore();
  });

  // AI Analysis highlight
  const aiFade = easeOut(clamp((t - 0.15) * 3, 0, 1));
  if (aiFade > 0.01) {
    ctx.globalAlpha = aiFade;
    const aiX = 60, aiY = H - 220;
    fillRoundedRect(ctx, aiX, aiY, 340, 160, 12, 'rgba(16,185,129,0.1)');
    ctx.strokeStyle = C.emerald + '40';
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, aiX, aiY, 340, 160, 12);
    ctx.stroke();

    ctx.fillStyle = C.emerald;
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('AI SAFETY INTELLIGENCE', aiX + 20, aiY + 30);

    // Classification results
    const results = [
      { label: 'Category', value: 'Infrastructure', color: C.cyan },
      { label: 'Severity', value: 'HIGH', color: C.red },
      { label: 'Priority Score', value: '92/100', color: C.emerald },
    ];

    results.forEach((r, i) => {
      const rFade = easeOut(clamp((t - 0.25 - i * 0.08) * 4, 0, 1));
      ctx.globalAlpha = aiFade * rFade;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Arial';
      ctx.fillText(r.label, aiX + 20, aiY + 65 + i * 38);
      ctx.fillStyle = r.color;
      ctx.font = 'bold 18px Arial';
      ctx.fillText(r.value, aiX + 20, aiY + 85 + i * 38);
    });
    ctx.globalAlpha = 1;
  }

  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
}

async function renderScene3b(ctx, frame, images) {
  // Authority dashboards
  const sceneStart = SCENES.scene3b.start * FPS;
  const sceneEnd = SCENES.scene3b.end * FPS;
  const sceneFrame = frame - sceneStart;
  const sceneDur = sceneEnd - sceneStart;
  const t = sceneFrame / sceneDur;

  drawGradientBG(ctx, '#0f172a', '#050a15');

  // Section badge
  ctx.textAlign = 'left';
  ctx.fillStyle = C.emerald;
  ctx.font = 'bold 14px Arial';
  ctx.fillText('AUTONOMOUS DISPATCH', 60, 50);
  ctx.fillStyle = C.textWhite;
  ctx.font = 'bold 24px Arial';
  ctx.fillText('Logged-In Authority Dashboards', 60, 80);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px Arial';
  ctx.fillText('Police HQ 999 SOS · DNCC Public Works · DMB Disaster Response', 60, 105);

  const policeImg = images['06_police_dashboard_logged_in'];
  const cityImg = images['07_city_corp_dashboard_logged_in'];

  // First half: Police dashboard
  // Second half: City Corp dashboard
  const switchPoint = 0.5;

  if (t < switchPoint + 0.1) {
    const pt = t / switchPoint;
    const slideIn = easeOut(clamp(pt * 1.5, 0, 1));
    const fadeOut = t > switchPoint ? 1 - easeIn((t - switchPoint) / 0.1) : 1;

    if (policeImg) {
      ctx.save();
      ctx.globalAlpha = slideIn * fadeOut;

      // SOS pulse indicator
      const pulse = Math.sin(frame * 0.2) * 0.5 + 0.5;
      drawGlow(ctx, W - 120, 50, 30, C.red, 0.3 + pulse * 0.3);
      ctx.fillStyle = C.red;
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'right';
      ctx.fillText('● LIVE', W - 60, 56);
      ctx.textAlign = 'left';

      // Dashboard in browser frame
      const imgW = W - 140;
      const imgH = H - 180;
      drawScreenshotInDevice(ctx, policeImg, W/2, H/2 + 30, imgW, imgH, 0.8, 0);

      // Highlight overlay on priority card
      const hlFade = easeOut(clamp((pt - 0.3) * 3, 0, 1));
      if (hlFade > 0.01) {
        ctx.globalAlpha = hlFade * fadeOut * 0.4;
        ctx.strokeStyle = C.red;
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 3]);
        // Approximate location of the priority cards in the dashboard
        drawRoundedRect(ctx, W/2 - 400, H/2 - 150, 480, 180, 8);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();
    }

    // Label
    const labelFade = easeOut(clamp((pt - 0.15) * 3, 0, 1));
    ctx.globalAlpha = labelFade * (t > switchPoint ? 1 - easeIn((t - switchPoint) / 0.1) : 1);
    fillRoundedRect(ctx, 60, H - 90, 300, 40, 8, 'rgba(239,68,68,0.15)');
    ctx.fillStyle = C.red;
    ctx.font = 'bold 14px Arial';
    ctx.fillText('🚔 Bangladesh Police — Sub-Inspector Rafiqul Islam', 78, H - 64);
    ctx.globalAlpha = 1;

  }

  if (t > switchPoint - 0.1) {
    const pt = (t - switchPoint) / (1 - switchPoint);
    const fadeIn = t < switchPoint ? 0 : easeOut(clamp(pt * 1.5, 0, 1));

    if (cityImg && fadeIn > 0.01) {
      ctx.save();
      ctx.globalAlpha = fadeIn;

      const imgW = W - 140;
      const imgH = H - 180;
      drawScreenshotInDevice(ctx, cityImg, W/2, H/2 + 30, imgW, imgH, 0.8, 0);

      // Highlight the Policy Studio card
      const hlFade = easeOut(clamp((pt - 0.25) * 3, 0, 1));
      if (hlFade > 0.01) {
        ctx.globalAlpha = fadeIn * hlFade * 0.4;
        ctx.strokeStyle = C.emerald;
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 3]);
        drawRoundedRect(ctx, W/2 - 480, H/2 - 220, 960, 80, 8);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();
    }

    // Label
    if (fadeIn > 0.01) {
      ctx.globalAlpha = fadeIn;
      fillRoundedRect(ctx, 60, H - 90, 340, 40, 8, 'rgba(16,185,129,0.15)');
      ctx.fillStyle = C.emerald;
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('🏛 City Corporation — Ahmadul Karim, DNCC', 78, H - 64);
      ctx.globalAlpha = 1;
    }
  }

  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
}

async function renderScene3c(ctx, frame, images) {
  // Digital Twin Planning Studio
  const sceneStart = SCENES.scene3c.start * FPS;
  const sceneEnd = SCENES.scene3c.end * FPS;
  const sceneFrame = frame - sceneStart;
  const sceneDur = sceneEnd - sceneStart;
  const t = sceneFrame / sceneDur;

  drawGradientBG(ctx, '#0f172a', '#050a15');

  // Section badge
  ctx.textAlign = 'left';
  ctx.fillStyle = C.emerald;
  ctx.font = 'bold 14px Arial';
  ctx.fillText('FLAGSHIP BREAKTHROUGH', 60, 50);
  ctx.fillStyle = C.textWhite;
  ctx.font = 'bold 24px Arial';
  ctx.fillText('Urban Planning Studio — Digital Twin Policy Simulator', 60, 80);

  const planningImg = images['08_digital_twin_planning'];
  const briefImg = images['10_cabinet_policy_brief_modal'];

  const briefSwitch = 0.65;

  // First part: Planning Studio with animated metrics
  if (t < briefSwitch + 0.1) {
    const pt = t / briefSwitch;
    const fadeOut = t > briefSwitch ? 1 - easeIn((t - briefSwitch) / 0.1) : 1;

    if (planningImg) {
      ctx.save();
      const slideIn = easeOut(clamp(pt * 1.5, 0, 1));
      ctx.globalAlpha = slideIn * fadeOut;

      // Show planning studio screenshot
      const imgW = W - 100;
      const imgH = H - 160;
      drawScreenshotInDevice(ctx, planningImg, W/2, H/2 + 30, imgW, imgH, 0.82, 0);

      ctx.restore();
    }

    // Animated metric overlays
    const metricsStart = 0.3;
    const metricsFade = easeOut(clamp((pt - metricsStart) * 3, 0, 1)) * fadeOut;
    if (metricsFade > 0.01) {
      ctx.globalAlpha = metricsFade;

      const metrics = [
        { value: '61%', label: 'Flood Reduction', color: C.cyan },
        { value: '52%', label: 'Pedestrian Safety', color: C.emerald },
        { value: '12.5x', label: '5-Year ROI', color: C.gold },
      ];

      metrics.forEach((m, i) => {
        const mFade = easeOut(clamp((pt - metricsStart - 0.08 * i) * 4, 0, 1));
        ctx.globalAlpha = metricsFade * mFade;

        const mx = 80 + i * 240;
        const my = H - 110;

        fillRoundedRect(ctx, mx, my, 220, 65, 10, 'rgba(0,0,0,0.85)');
        ctx.strokeStyle = m.color + '60';
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, mx, my, 220, 65, 10);
        ctx.stroke();

        ctx.fillStyle = m.color;
        ctx.font = 'bold 26px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(m.value, mx + 15, my + 32);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px Arial';
        ctx.fillText(m.label, mx + 15, my + 52);
      });
    }
  }

  // Second part: Cabinet Policy Brief
  if (t > briefSwitch - 0.05) {
    const pt = (t - briefSwitch) / (1 - briefSwitch);
    const fadeIn = easeOut(clamp(pt * 2, 0, 1));

    if (briefImg && fadeIn > 0.01) {
      ctx.save();
      ctx.globalAlpha = fadeIn;

      // Modal-style presentation
      // Dim background
      ctx.fillStyle = `rgba(0,0,0,${fadeIn * 0.4})`;
      ctx.fillRect(0, 0, W, H);

      const imgW = W - 200;
      const imgH = H - 140;
      const modalScale = 0.85 + fadeIn * 0.05;

      drawScreenshotInDevice(ctx, briefImg, W/2, H/2 + 20, imgW, imgH, modalScale, 0);

      ctx.restore();
    }

    // Button label
    if (fadeIn > 0.5) {
      ctx.globalAlpha = fadeIn;
      fillRoundedRect(ctx, W/2 - 180, H - 80, 360, 40, 20, C.emerald);
      ctx.fillStyle = C.textWhite;
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Cabinet Policy Brief — Auto-Generated', W/2, H - 54);
    }
  }

  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
}

async function renderScene4(ctx, frame, images) {
  // AI Architecture
  const sceneStart = SCENES.scene4.start * FPS;
  const sceneEnd = SCENES.scene4.end * FPS;
  const sceneFrame = frame - sceneStart;
  const sceneDur = sceneEnd - sceneStart;
  const t = sceneFrame / sceneDur;

  drawGradientBG(ctx, '#050a15', '#0f172a');
  drawGridPattern(ctx, 0.02);

  // Section badge
  const titleFade = easeOut(clamp(t * 4, 0, 1));
  ctx.globalAlpha = titleFade;
  ctx.textAlign = 'center';
  ctx.fillStyle = C.cyan;
  ctx.font = 'bold 14px Arial';
  ctx.fillText('REAL AI ARCHITECTURE', W/2, 50);
  ctx.fillStyle = C.textWhite;
  ctx.font = 'bold 30px Arial';
  ctx.fillText('Production-Grade Technical Stack', W/2, 85);
  ctx.globalAlpha = 1;

  // Central AI node
  const centerX = W/2, centerY = H/2 - 20;
  const centralFade = easeOut(clamp((t - 0.05) * 4, 0, 1));

  if (centralFade > 0.01) {
    ctx.globalAlpha = centralFade;

    // Central glow
    drawGlow(ctx, centerX, centerY, 120, C.emerald, 0.12);

    // Central node
    fillRoundedRect(ctx, centerX - 100, centerY - 45, 200, 90, 16, 'rgba(16,185,129,0.2)');
    ctx.strokeStyle = C.emerald;
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, centerX - 100, centerY - 45, 200, 90, 16);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = C.emerald;
    ctx.font = 'bold 14px Arial';
    ctx.fillText('NIRAPOD DHAKA', centerX, centerY - 15);
    ctx.fillStyle = C.textWhite;
    ctx.font = 'bold 11px Arial';
    ctx.fillText('AI Orchestration Engine', centerX, centerY + 8);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Arial';
    ctx.fillText('Real-time Processing Pipeline', centerX, centerY + 28);
  }

  // Surrounding tech nodes
  const techNodes = [
    { label: 'Groq LLaMA-3.3-70B', desc: 'Sub-second intent\nextraction', x: -350, y: -180, color: C.cyan },
    { label: 'Open-Meteo API', desc: 'Live rainfall\ntelemetry', x: 350, y: -180, color: '#3b82f6' },
    { label: 'OpenStreetMap', desc: 'Street-lighting\naudits', x: -350, y: 120, color: C.emerald },
    { label: 'PostGIS Engine', desc: 'Spatial queries &\ngeofencing', x: 350, y: 120, color: C.gold },
  ];

  techNodes.forEach((tn, i) => {
    const nFade = easeOut(clamp((t - 0.12 - i * 0.08) * 3, 0, 1));
    if (nFade < 0.01) return;
    ctx.globalAlpha = nFade;

    const nx = centerX + tn.x;
    const ny = centerY + tn.y;
    const nw = 240, nh = 80;

    // Connect line
    const lineProgress = easeOut(clamp((t - 0.18 - i * 0.08) * 4, 0, 1));
    if (lineProgress > 0.01) {
      ctx.strokeStyle = tn.color + '60';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      const lx1 = tn.x > 0 ? centerX + 100 : centerX - 100;
      const ly1 = centerY;
      const lx2 = tn.x > 0 ? nx - 5 : nx + nw + 5;
      const ly2 = ny + nh/2;
      ctx.beginPath();
      ctx.moveTo(lx1, ly1);
      ctx.bezierCurveTo(lx1 + (lx2-lx1)*0.5, ly1, lx2 - (lx2-lx1)*0.3, ly2, lx2, ly2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Data flow dot
      if (lineProgress > 0.5) {
        const dotT = ((frame * 0.02 + i * 0.25) % 1);
        const dotX = lerp(lx1, lx2, dotT);
        const dotY = lerp(ly1, ly2, dotT);
        ctx.fillStyle = tn.color;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Node card
    fillRoundedRect(ctx, nx, ny, nw, nh, 10, 'rgba(30,41,59,0.9)');
    fillRoundedRect(ctx, nx, ny, 4, nh, [10,0,0,10], tn.color);

    ctx.textAlign = 'left';
    ctx.fillStyle = tn.color;
    ctx.font = 'bold 13px Arial';
    ctx.fillText(tn.label, nx + 16, ny + 25);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Arial';
    const descLines = tn.desc.split('\n');
    descLines.forEach((dl, di) => {
      ctx.fillText(dl, nx + 16, ny + 45 + di * 15);
    });
  });

  // Bottom features strip
  const features = [
    { label: 'Spatial Distance Matching', color: C.gold },
    { label: 'HMAC Evidence Tokens', color: C.red },
    { label: 'Anti-Spam Clustering', color: C.purple },
    { label: 'Metropolitan Geofence', color: C.cyan },
  ];

  const stripY = H - 100;
  const stripFade = easeOut(clamp((t - 0.6) * 3, 0, 1));
  if (stripFade > 0.01) {
    ctx.globalAlpha = stripFade;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('SPATIAL INTELLIGENCE & TRUST LAYER', W/2, stripY - 20);

    const fW = 210;
    const fGap = (W - fW * features.length) / (features.length + 1);
    features.forEach((f, i) => {
      const fFade = easeOut(clamp((t - 0.65 - i * 0.05) * 4, 0, 1));
      ctx.globalAlpha = stripFade * fFade;
      const fx = fGap + i * (fW + fGap);

      fillRoundedRect(ctx, fx, stripY, fW, 50, 8, 'rgba(30,41,59,0.7)');

      // Dot
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.arc(fx + 20, stripY + 25, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = C.textWhite;
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(f.label, fx + 35, stripY + 30);
    });
  }

  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
}

async function renderScene5(ctx, frame, images) {
  // Impact & Future Vision
  const sceneStart = SCENES.scene5.start * FPS;
  const sceneEnd = SCENES.scene5.end * FPS;
  const sceneFrame = frame - sceneStart;
  const sceneDur = sceneEnd - sceneStart;
  const t = sceneFrame / sceneDur;

  drawGradientBG(ctx, '#0f172a', '#050a15');

  const roadmapEnd = 0.5;

  if (t < roadmapEnd + 0.1) {
    // Roadmap section
    const pt = t / roadmapEnd;
    const fadeOut = t > roadmapEnd ? 1 - easeIn((t - roadmapEnd) / 0.1) : 1;

    // Section title
    const titleFade = easeOut(clamp(pt * 3, 0, 1)) * fadeOut;
    ctx.globalAlpha = titleFade;
    ctx.textAlign = 'center';
    ctx.fillStyle = C.emerald;
    ctx.font = 'bold 14px Arial';
    ctx.fillText('UNIFIED ROADMAP', W/2, 80);
    ctx.fillStyle = C.textWhite;
    ctx.font = 'bold 36px Arial';
    ctx.fillText('What Comes Next', W/2, 125);

    // Three roadmap items
    const roadmapItems = [
      {
        title: 'Edge Computer Vision',
        desc: 'Lightweight CV on public city buses\nfor automated pothole & hazard detection',
        icon: '🚌',
        color: C.cyan,
      },
      {
        title: 'IoT Acoustic Sensors',
        desc: 'Gunshot & crash detection sensors\nacross high-risk urban corridors',
        icon: '📡',
        color: C.gold,
      },
      {
        title: 'Autonomous Flood Drones',
        desc: 'Drone-based flood reconnaissance\nfor real-time disaster assessment',
        icon: '🛸',
        color: C.emerald,
      },
    ];

    const cardW = 340, cardH = 200;
    const cardGap = (W - cardW * 3) / 4;

    roadmapItems.forEach((item, i) => {
      const cFade = easeOut(clamp((pt - 0.15 - i * 0.12) * 3, 0, 1)) * fadeOut;
      if (cFade < 0.01) return;
      ctx.globalAlpha = cFade;

      const cx = cardGap + i * (cardW + cardGap);
      const cy = H/2 - 60 + (1 - cFade) * 30;

      fillRoundedRect(ctx, cx, cy, cardW, cardH, 14, 'rgba(30,41,59,0.8)');

      // Top accent line
      fillRoundedRect(ctx, cx, cy, cardW, 4, [14,14,0,0], item.color);

      // Glow
      drawGlow(ctx, cx + cardW/2, cy + cardH/2, 100, item.color, 0.06);

      // Icon
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.icon, cx + cardW/2, cy + 70);

      // Title
      ctx.fillStyle = C.textWhite;
      ctx.font = 'bold 18px Arial';
      ctx.fillText(item.title, cx + cardW/2, cy + 110);

      // Description
      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px Arial';
      const descLines = item.desc.split('\n');
      descLines.forEach((dl, di) => {
        ctx.fillText(dl, cx + cardW/2, cy + 140 + di * 18);
      });
    });

    // Phase indicator
    const phaseFade = easeOut(clamp((pt - 0.5) * 3, 0, 1)) * fadeOut;
    ctx.globalAlpha = phaseFade;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Our preliminary system works today. These expansions transform it into a national platform.', W/2, H - 80);

  }

  // Final brand reveal
  if (t > roadmapEnd - 0.05) {
    const pt = clamp((t - roadmapEnd) / (1 - roadmapEnd), 0, 1);
    const fadeIn = easeOut(clamp(pt * 2, 0, 1));

    if (fadeIn > 0.01) {
      // Background overlay
      ctx.fillStyle = `rgba(5,10,21,${fadeIn})`;
      ctx.fillRect(0, 0, W, H);

      ctx.globalAlpha = fadeIn;

      // Emerald glow
      drawGlow(ctx, W/2, H/2 - 40, 300, C.emerald, 0.1);

      ctx.textAlign = 'center';

      // Shield logo
      const logoScale = easeOut(clamp((pt - 0.05) * 3, 0, 1));
      if (logoScale > 0.01) {
        ctx.save();
        ctx.translate(W/2, H/2 - 120);
        ctx.scale(logoScale, logoScale);

        ctx.beginPath();
        ctx.arc(0, 0, 40, 0, Math.PI * 2);
        ctx.fillStyle = C.emerald;
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.lineTo(-4, 8);
        ctx.lineTo(12, -8);
        ctx.stroke();

        ctx.restore();
      }

      // Team name
      const teamFade = easeOut(clamp((pt - 0.15) * 3, 0, 1));
      ctx.globalAlpha = fadeIn * teamFade;
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('TEAM', W/2, H/2 - 50);
      ctx.fillStyle = C.textWhite;
      ctx.font = 'bold 48px Arial';
      ctx.fillText('ANIMATRIX', W/2, H/2);

      // Project name
      const projFade = easeOut(clamp((pt - 0.25) * 3, 0, 1));
      ctx.globalAlpha = fadeIn * projFade;
      ctx.fillStyle = C.emerald;
      ctx.font = 'bold 36px Arial';
      ctx.fillText('NIRAPOD DHAKA', W/2, H/2 + 60);

      // Tagline
      const tagFade = easeOut(clamp((pt - 0.35) * 3, 0, 1));
      ctx.globalAlpha = fadeIn * tagFade;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '18px Arial';
      ctx.fillText('Vibe to Production  |  Idea to Unicorn', W/2, H/2 + 110);

      // Website
      const urlFade = easeOut(clamp((pt - 0.45) * 3, 0, 1));
      ctx.globalAlpha = fadeIn * urlFade;
      fillRoundedRect(ctx, W/2 - 140, H/2 + 140, 280, 40, 20, 'rgba(16,185,129,0.15)');
      ctx.strokeStyle = C.emerald + '60';
      ctx.lineWidth = 1;
      drawRoundedRect(ctx, W/2 - 140, H/2 + 140, 280, 40, 20);
      ctx.stroke();
      ctx.fillStyle = C.emerald;
      ctx.font = 'bold 16px Arial';
      ctx.fillText('nirapoddhk.vercel.app', W/2, H/2 + 166);

      // Event badge
      const eventFade = easeOut(clamp((pt - 0.55) * 3, 0, 1));
      ctx.globalAlpha = fadeIn * eventFade;
      ctx.fillStyle = '#64748b';
      ctx.font = '14px Arial';
      ctx.fillText('International AI Builders Congress', W/2, H/2 + 220);
    }
  }

  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
}

async function renderOutro(ctx, frame) {
  const sceneStart = SCENES.outro.start * FPS;
  const sceneEnd = SCENES.outro.end * FPS;
  const sceneFrame = frame - sceneStart;
  const sceneDur = sceneEnd - sceneStart;
  const t = sceneFrame / sceneDur;

  drawGradientBG(ctx, '#050a15', '#0f172a');
  drawGlow(ctx, W/2, H/2 - 40, 250, C.emerald, 0.08 * (1 - t));

  // Fade everything out
  const fadeOut = 1 - easeIn(clamp((t - 0.5) * 2, 0, 1));

  ctx.globalAlpha = fadeOut;
  ctx.textAlign = 'center';

  // Logo
  ctx.beginPath();
  ctx.arc(W/2, H/2 - 80, 35, 0, Math.PI * 2);
  ctx.fillStyle = C.emerald;
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(W/2-10, H/2-80);
  ctx.lineTo(W/2-3, H/2-73);
  ctx.lineTo(W/2+10, H/2-90);
  ctx.stroke();

  ctx.fillStyle = C.textWhite;
  ctx.font = 'bold 42px Arial';
  ctx.fillText('NIRAPOD DHAKA', W/2, H/2 - 15);

  ctx.fillStyle = C.emerald;
  ctx.font = '20px Arial';
  ctx.fillText('নিরাপদ ঢাকা', W/2, H/2 + 20);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '16px Arial';
  ctx.fillText('Thank You', W/2, H/2 + 65);

  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
}

// ─── SCENE TRANSITIONS ─────────────────────────────────────
function applySceneTransition(ctx, frame, sceneEnd, duration) {
  const transFrames = duration * FPS;
  const transStart = sceneEnd * FPS - transFrames;
  if (frame >= transStart && frame < sceneEnd * FPS) {
    const tp = (frame - transStart) / transFrames;
    // Subtle fade to dark at scene boundaries
    ctx.fillStyle = `rgba(5,10,21,${easeInOut(tp) * 0.3})`;
    ctx.fillRect(0, 0, W, H);
  }
}

// ─── MAIN RENDER LOOP ───────────────────────────────────────
async function main() {
  console.log('=== Nirapod Dhaka Video Renderer ===');
  console.log(`Resolution: ${W}x${H} @ ${FPS}fps`);
  console.log(`Duration: ${TOTAL_DURATION}s (${TOTAL_FRAMES} frames)`);

  // Load all images
  console.log('Loading images...');
  const images = {};
  const imageFiles = {
    '01_home_full': path.join(SCREENSHOTS, '01_home_full.png'),
    '01_home_full_long': path.join(SCREENSHOTS, '01_home_full_long.png'),
    '01_citizen_logged_in_map': path.join(SCREENSHOTS, '01_citizen_logged_in_map.png'),
    '02_live_safety_map': path.join(SCREENSHOTS, '02_live_safety_map.png'),
    '02_report_flow_step1_details': path.join(SCREENSHOTS, '02_report_flow_step1_details.png'),
    '04_report_flow_step3_verify': path.join(SCREENSHOTS, '04_report_flow_step3_verify.png'),
    '05_report_flow_step4_review': path.join(SCREENSHOTS, '05_report_flow_step4_review.png'),
    '06_police_dashboard_logged_in': path.join(SCREENSHOTS, '06_police_dashboard_logged_in.png'),
    '07_city_corp_dashboard_logged_in': path.join(SCREENSHOTS, '07_city_corp_dashboard_logged_in.png'),
    '08_digital_twin_planning': path.join(SCREENSHOTS, '08_digital_twin_planning.png'),
    '10_cabinet_policy_brief_modal': path.join(SCREENSHOTS, '10_cabinet_policy_brief_modal.png'),
    '11_ai_intelligence_hub': path.join(SCREENSHOTS, '11_ai_intelligence_hub.png'),
    '13_police_command_dashboard': path.join(SCREENSHOTS, '13_police_command_dashboard.png'),
    '14_city_corp_dashboard': path.join(SCREENSHOTS, '14_city_corp_dashboard.png'),
    'dhaka_skyline_panorama': path.join(PUBLIC, 'dhaka_skyline_panorama.jpg'),
    'favicon': path.join(PUBLIC, 'favicon.png'),
  };

  for (const [key, filePath] of Object.entries(imageFiles)) {
    images[key] = await getImage(filePath);
    console.log(`  Loaded: ${key}`);
  }

  console.log('All images loaded. Starting FFmpeg...');

  // Spawn FFmpeg - pipe raw RGBA frames via stdin
  const voiceover = VOICEOVER;

  console.log(`Voiceover: ${voiceover}`);
  console.log(`Output: ${OUTPUT}`);

  const ffmpegArgs = [
    // Input 1: raw video frames from stdin
    '-f', 'rawvideo',
    '-pix_fmt', 'rgba',
    '-s', `${W}x${H}`,
    '-r', `${FPS}`,
    '-i', 'pipe:0',
    // Input 2: voiceover audio (delayed by VO_OFFSET seconds)
    '-i', voiceover,
    // Filter: delay audio, pad video
    '-filter_complex',
    `[1:a]adelay=${VO_OFFSET * 1000}|${VO_OFFSET * 1000}[delayed_vo];[delayed_vo]apad=pad_dur=30[final_audio]`,
    '-map', '0:v',
    '-map', '[final_audio]',
    // Video encoding
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    // Audio encoding
    '-c:a', 'aac',
    '-b:a', '192k',
    '-ar', '44100',
    // Duration limit
    '-t', `${TOTAL_DURATION}`,
    // Output
    '-y',
    OUTPUT
  ];

  const ffmpeg = spawn('ffmpeg', ffmpegArgs, {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  ffmpeg.stderr.on('data', (data) => {
    const msg = data.toString();
    if (msg.includes('Error') || msg.includes('error') || msg.includes('Invalid')) {
      console.error('FFmpeg ERROR:', msg.trim());
    }
    if (msg.includes('frame=') || msg.includes('speed=')) {
      process.stderr.write('\r' + msg.trim().split('\n').pop());
    }
  });

  // Handle pipe errors gracefully
  ffmpeg.stdin.on('error', (err) => {
    if (err.code !== 'EPIPE') {
      console.error('Stdin error:', err.message);
    }
  });

  ffmpeg.on('close', (code) => {
    console.log(`\nFFmpeg exited with code ${code}`);
    if (code === 0) {
      console.log(`✅ Video saved to: ${OUTPUT}`);
      // Get file size
      try {
        const stats = fs.statSync(OUTPUT);
        console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(1)} MB`);
      } catch(e) {}
    }
  });

  // Create canvas for rendering
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Render frames
  const startTime = Date.now();
  let lastReport = 0;

  for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
    const sec = frame / FPS;

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Determine which scene we're in and render
    if (sec < SCENES.intro.end) {
      await renderIntro(ctx, frame);
    } else if (sec < SCENES.scene1.end) {
      await renderScene1(ctx, frame, images);
    } else if (sec < SCENES.scene2.end) {
      await renderScene2(ctx, frame, images);
    } else if (sec < SCENES.scene3a.end) {
      await renderScene3a(ctx, frame, images);
    } else if (sec < SCENES.scene3b.end) {
      await renderScene3b(ctx, frame, images);
    } else if (sec < SCENES.scene3c.end) {
      await renderScene3c(ctx, frame, images);
    } else if (sec < SCENES.scene4.end) {
      await renderScene4(ctx, frame, images);
    } else if (sec < SCENES.scene5.end) {
      await renderScene5(ctx, frame, images);
    } else {
      await renderOutro(ctx, frame);
    }

    // Apply subtle scene transition overlays
    for (const [name, scene] of Object.entries(SCENES)) {
      if (name !== 'outro') {
        applySceneTransition(ctx, frame, scene.end, 0.5);
      }
    }

    // Get raw RGBA buffer and write to FFmpeg
    const buffer = canvas.toBuffer('raw');
    const canWrite = ffmpeg.stdin.write(buffer);

    if (!canWrite) {
      await new Promise(resolve => ffmpeg.stdin.once('drain', resolve));
    }

    // Progress report
    const now = Date.now();
    if (now - lastReport > 3000 || frame === TOTAL_FRAMES - 1) {
      const pct = ((frame + 1) / TOTAL_FRAMES * 100).toFixed(1);
      const elapsed = (now - startTime) / 1000;
      const fps = (frame + 1) / elapsed;
      const eta = ((TOTAL_FRAMES - frame - 1) / fps).toFixed(0);
      console.log(`Frame ${frame + 1}/${TOTAL_FRAMES} (${pct}%) | ${fps.toFixed(1)} fps | ETA: ${eta}s`);
      lastReport = now;
    }
  }

  // Close stdin to signal FFmpeg that input is done
  ffmpeg.stdin.end();
  console.log('All frames rendered. Waiting for FFmpeg to finalize...');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
