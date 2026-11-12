let state = {
  showNet: false,
  netGauge: 96,            // Perimetral: 36, 72, 96, 120, 180, 220, 360
  netRoofGauge: 36,        // Techo: 26, 36, 42
  netCocoInches: 10,       // 8, 10, 12 pulgadas
  netSlackRatio: 0.40,     // Demasía perimetral: 0.30, 0.35, 0.40, 0.45, 0.50
  netRoofSlackRatio: 0.30, // Demasía techo: fijo al 30% (+0.30)
  netHeight: 6,
  netPriceLinear: 8.50,    // Precio por Metro Lineal para Perímetro (S/)
  netPriceRoof: 1.10,      // Precio por Metro Cuadrado para Techo (S/)
  hasSardinel: false,      // Sardinel perimetral de concreto
  sardinelSepFondos: 2.00, // Retiro detrás de los arcos / fondos (m)
  sardinelSepLaterales: 1.00, // Retiro en las bandas laterales (m)
  sardinelWidthCm: 15,     // Espesor de sardinel (cm)
  numFields: 1,
  len: 30,
  wid: 20,
  hasBigArea: true,
  areaLen: 6,
  areaWid: 12,
  hasSmallArea: false,
  smallLen: 5.5,
  smallWid: 18.32,
  hasPenaltyArc: false,
  penaltyArcR: 9.15,
  penal: 6,
  circ: 3,
  goalW: 3,
  cornerR: 1,
  gap: 3,
  lineWidthCm: 8,
  lineColorField: '#facc15',
  lineColorVoley: '#38bdf8',
  hasJoinField: false,
  joinFieldColor: '#fb923c',
  joinMode: 'transversal-field',
  hasVoley: true,
  voleyLen: 18,
  voleyWid: 9,
  voleyAtk: 3,
  theme: 'grass',
  grassStripeW: 2.5,
  grassDir: 'vertical',
  grassTone: 'emerald',
  zoom: 1,
  panX: 0,
  panY: 0,
  isPanning: false,
  startX: 0,
  startY: 0
};

const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
const container = document.getElementById('container');

function resizeCanvas() {
  const rect = container.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  cv.width = rect.width * dpr;
  cv.height = rect.height * dpr;
  cv.style.width = rect.width + 'px';
  cv.style.height = rect.height + 'px';
  ctx.resetTransform();
  ctx.scale(dpr, dpr);
  draw();
}

window.addEventListener('resize', () => {
  resizeCanvas();
  resetFit();
});

function setFieldColor(hex, btnId) {
  state.lineColorField = hex;
  document.querySelectorAll('.color-swatch-group:first-of-type .color-swatch-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(btnId);
  if (btn) btn.classList.add('active');
  draw();
}

function setVoleyColor(hex, btnId) {
  state.lineColorVoley = hex;
  document.querySelectorAll('#vcol-white, #vcol-yellow, #vcol-blue, #vcol-orange').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(btnId);
  if (btn) btn.classList.add('active');
  draw();
}

function setJoinColor(hex, btnId) {
  state.joinFieldColor = hex;
  document.querySelectorAll('#jcol-white, #jcol-yellow, #jcol-blue, #jcol-orange').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(btnId);
  if (btn) btn.classList.add('active');
  draw();
}

function updateJoinState() {
  state.hasJoinField = document.getElementById('chk-join-fields').checked;
  document.getElementById('join-config').style.display = state.hasJoinField ? 'flex' : 'none';
  updateDims();
}

function updateGrassConfig() {
  state.grassStripeW = parseFloat(document.getElementById('sel-grass-stripe').value) || 2.5;
  state.grassDir = document.getElementById('sel-grass-dir').value;
  state.grassTone = document.getElementById('sel-grass-tone').value;
  draw();
}

function applyLineWidthPreset(val) {
  document.getElementById('inp-line-w').value = val;
  updateDims();
}

function setTheme(t) {
  state.theme = t;
  document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('th-' + t).classList.add('active');
  document.getElementById('section-grass-settings').style.display = (t === 'grass') ? 'block' : 'none';
  draw();
}

function setFieldsCount(n) {
  state.numFields = n;
  document.querySelectorAll('#btn-c1, #btn-c2, #btn-c3').forEach(b => b.classList.remove('active'));
  document.getElementById('btn-c' + n).classList.add('active');
  document.getElementById('group-gap').style.display = n > 1 ? 'flex' : 'none';
  
  const joinSection = document.getElementById('section-join-fields');
  if (n > 1) {
    joinSection.style.display = 'block';
  } else {
    joinSection.style.display = 'none';
    state.hasJoinField = false;
    document.getElementById('chk-join-fields').checked = false;
    document.getElementById('join-config').style.display = 'none';
  }

  updateDims();
  resetFit();
}

function toggleAreaInputs() {
  state.hasBigArea = document.getElementById('chk-has-big-area').checked;
  state.hasSmallArea = document.getElementById('chk-has-small-area').checked;
  document.getElementById('wrap-big-area').style.display = state.hasBigArea ? 'grid' : 'none';
  document.getElementById('wrap-small-area').style.display = state.hasSmallArea ? 'grid' : 'none';
  updateDims();
}

function togglePenaltyArcInputs() {
  state.hasPenaltyArc = document.getElementById('chk-has-penalty-arc').checked;
  document.getElementById('wrap-penalty-arc').style.display = state.hasPenaltyArc ? 'grid' : 'none';
  updateDims();
}

function applyPreset(p) {
  document.querySelectorAll('.btn-grid button').forEach(b => b.classList.remove('active'));
  const activeBtn = document.getElementById('p-' + p);
  if (activeBtn) activeBtn.classList.add('active');

  if (p === 'fulbito') {
    state.len = 30; state.wid = 20; 
    state.hasBigArea = true; state.areaLen = 6; state.areaWid = 12;
    state.hasSmallArea = false; state.smallLen = 3; state.smallWid = 7;
    state.hasPenaltyArc = false; state.penaltyArcR = 6;
    state.penal = 6; state.circ = 3; state.goalW = 3; state.cornerR = 1; state.hasVoley = true; state.lineWidthCm = 8;
  } else if (p === 'futsal') {
    state.len = 40; state.wid = 20; 
    state.hasBigArea = true; state.areaLen = 6; state.areaWid = 12;
    state.hasSmallArea = false; state.smallLen = 3; state.smallWid = 6;
    state.hasPenaltyArc = false; state.penaltyArcR = 6;
    state.penal = 6; state.circ = 3; state.goalW = 3; state.cornerR = 1; state.hasVoley = false; state.lineWidthCm = 8;
  } else if (p === 'voley') {
    state.len = 18; state.wid = 9; 
    state.hasBigArea = false; state.areaLen = 0; state.areaWid = 0;
    state.hasSmallArea = false; state.smallLen = 0; state.smallWid = 0;
    state.hasPenaltyArc = false; state.penaltyArcR = 0;
    state.penal = 0; state.circ = 0; state.goalW = 0; state.cornerR = 0; state.hasVoley = true; state.lineWidthCm = 5;
  } else if (p === 'futbol11') {
    state.len = 105; state.wid = 68; 
    state.hasBigArea = true; state.areaLen = 16.5; state.areaWid = 40.32;
    state.hasSmallArea = true; state.smallLen = 5.5; state.smallWid = 18.32;
    state.hasPenaltyArc = true; state.penaltyArcR = 9.15;
    state.penal = 11; state.circ = 9.15; state.goalW = 7.32; state.cornerR = 1; state.hasVoley = false; state.lineWidthCm = 12;
  } else if (p === 'balonmano') {
    state.len = 40; state.wid = 20; 
    state.hasBigArea = true; state.areaLen = 6; state.areaWid = 12;
    state.hasSmallArea = false; state.smallLen = 0; state.smallWid = 0;
    state.hasPenaltyArc = false; state.penaltyArcR = 0;
    state.penal = 7; state.circ = 0; state.goalW = 3; state.cornerR = 1; state.hasVoley = false; state.lineWidthCm = 8;
  }
  
  document.getElementById('inp-len').value = state.len;
  document.getElementById('inp-wid').value = state.wid;
  document.getElementById('chk-has-big-area').checked = state.hasBigArea;
  document.getElementById('inp-area-len').value = state.areaLen;
  document.getElementById('inp-area-wid').value = state.areaWid;
  document.getElementById('chk-has-small-area').checked = state.hasSmallArea;
  document.getElementById('inp-small-len').value = state.smallLen;
  document.getElementById('inp-small-wid').value = state.smallWid;
  document.getElementById('chk-has-penalty-arc').checked = state.hasPenaltyArc;
  document.getElementById('inp-penalty-arc-r').value = state.penaltyArcR;
  document.getElementById('inp-penal').value = state.penal;
  document.getElementById('inp-circ').value = state.circ;
  document.getElementById('inp-goal-w').value = state.goalW;
  document.getElementById('inp-corner-r').value = state.cornerR;
  document.getElementById('inp-line-w').value = state.lineWidthCm;
  document.getElementById('chk-voley').checked = state.hasVoley;
  
  toggleAreaInputs();
  togglePenaltyArcInputs();
  resetFit();
}

function calculateArcLength() {
  if (!state.hasPenaltyArc || state.penaltyArcR <= 0 || state.penal <= 0) return 0;
  const d = Math.abs(state.areaLen - state.penal);
  if (d <= 0 || d >= state.penaltyArcR) return 0;
  const alpha = Math.acos(d / state.penaltyArcR);
  return 2 * alpha * state.penaltyArcR;
}

function updateDims() {
  state.len = parseFloat(document.getElementById('inp-len').value) || 30;
  state.wid = parseFloat(document.getElementById('inp-wid').value) || 20;
  state.hasBigArea = document.getElementById('chk-has-big-area').checked;
  state.areaLen = parseFloat(document.getElementById('inp-area-len').value) || 0;
  state.areaWid = parseFloat(document.getElementById('inp-area-wid').value) || 0;
  state.hasSmallArea = document.getElementById('chk-has-small-area').checked;
  state.smallLen = parseFloat(document.getElementById('inp-small-len').value) || 0;
  state.smallWid = parseFloat(document.getElementById('inp-small-wid').value) || 0;
  state.hasPenaltyArc = document.getElementById('chk-has-penalty-arc').checked;
  state.penaltyArcR = parseFloat(document.getElementById('inp-penalty-arc-r').value) || 0;
  state.penal = parseFloat(document.getElementById('inp-penal').value) || 0;
  state.circ = parseFloat(document.getElementById('inp-circ').value) || 0;
  state.goalW = parseFloat(document.getElementById('inp-goal-w').value) || 0;
  state.cornerR = parseFloat(document.getElementById('inp-corner-r').value) || 0;
  state.lineWidthCm = parseFloat(document.getElementById('inp-line-w').value) || 8;
  state.gap = parseFloat(document.getElementById('inp-gap').value) || 3;
  state.hasVoley = document.getElementById('chk-voley').checked;
  state.voleyLen = parseFloat(document.getElementById('inp-voley-len').value) || 18;
  state.voleyWid = parseFloat(document.getElementById('inp-voley-wid').value) || 9;
  state.voleyAtk = parseFloat(document.getElementById('inp-voley-atk').value) || 3;
  state.joinMode = document.getElementById('sel-join-mode').value;

  // Parámetros de Sardinel Perimetral diferenciado
  const chkSardinel = document.getElementById('chk-has-sardinel');
  state.hasSardinel = chkSardinel ? chkSardinel.checked : false;
  const wrapSardinel = document.getElementById('wrap-sardinel');
  if (wrapSardinel) wrapSardinel.style.display = state.hasSardinel ? 'grid' : 'none';

  const inpSardFondos = document.getElementById('inp-sardinel-sep-fondos');
  if (inpSardFondos) state.sardinelSepFondos = parseFloat(inpSardFondos.value) || 2.00;

  const inpSardLaterales = document.getElementById('inp-sardinel-sep-laterales');
  if (inpSardLaterales) state.sardinelSepLaterales = parseFloat(inpSardLaterales.value) || 1.00;

  const inpSardW = document.getElementById('inp-sardinel-w');
  if (inpSardW) state.sardinelWidthCm = parseFloat(inpSardW.value) || 15;

  document.getElementById('voley-config').style.display = state.hasVoley ? 'block' : 'none';

  // Dimensiones del campo de juego demarcado
  const totalPlayHeight = (state.wid * state.numFields) + (state.gap * (state.numFields - 1));
  const diag = Math.sqrt(state.len * state.len + state.wid * state.wid);
  const perimJuego = 2 * (state.len + state.wid);

  // Dimensiones totales cubiertas por Césped Sintético hasta el borde interior del sardinel
  const sepF = state.hasSardinel ? state.sardinelSepFondos : 0;
  const sepL = state.hasSardinel ? state.sardinelSepLaterales : 0;
  const totalGrassLen = state.len + (2 * sepF);
  const totalGrassWid = totalPlayHeight + (2 * sepL);
  const totalGrassArea = totalGrassLen * totalGrassWid;

  // Perímetro lineal del sardinel de concreto
  const perimSardinel = 2 * (totalGrassLen + totalGrassWid);
  
  let lines = (perimJuego + state.wid) * state.numFields;
  if (state.circ > 0) lines += (2 * Math.PI * state.circ) * state.numFields;
  if (state.hasBigArea && state.areaLen > 0 && state.areaWid > 0) {
    lines += (2 * (2 * state.areaLen + state.areaWid)) * state.numFields;
  }
  if (state.hasSmallArea && state.smallLen > 0 && state.smallWid > 0) {
    lines += (2 * (2 * state.smallLen + state.smallWid)) * state.numFields;
  }
  if (state.hasPenaltyArc) {
    const singleArcL = calculateArcLength();
    lines += (2 * singleArcL) * state.numFields;
  }
  if (state.cornerR > 0) lines += (4 * (0.5 * Math.PI * state.cornerR)) * state.numFields;
  if (state.hasVoley) lines += ((2 * (state.voleyLen + state.voleyWid)) + (3 * state.voleyWid)) * state.numFields;

  if (state.numFields > 1 && state.hasJoinField) {
    const joinedPerim = 2 * (state.len + totalPlayHeight);
    lines += joinedPerim;
    if (state.joinMode === 'transversal-field') {
      lines += state.len;
      lines += 2 * Math.PI * 4.5;
      lines += 2 * (2 * 8 + 16);
    }
  }

  const lineArea = lines * (state.lineWidthCm / 100);

  document.getElementById('met-area').innerText = totalGrassArea.toFixed(2) + ' m²';
  document.getElementById('met-perim').innerText = (state.hasSardinel ? perimSardinel : perimJuego * state.numFields).toFixed(2) + ' m';
  document.getElementById('met-diag').innerText = diag.toFixed(2) + ' m';
  document.getElementById('met-paint').innerText = lines.toFixed(1) + ' m';
  document.getElementById('met-paint-area').innerText = lineArea.toFixed(2) + ' m²';

  draw();
}

function resetFit() {
  const rect = container.getBoundingClientRect();
  const sepF = state.hasSardinel ? state.sardinelSepFondos : 0;
  const sepL = state.hasSardinel ? state.sardinelSepLaterales : 0;

  const totalW = state.len + (2 * sepF);
  const totalH = (state.wid * state.numFields) + (state.gap * (state.numFields - 1)) + (2 * sepL);
  
  // Margen proporcional que garantiza que cualquier campo (incluso Fútbol 11 con retiros) encaje entero
  const marginX = Math.max(16, totalW * 0.28);
  const marginY = Math.max(14, totalH * 0.25);
  
  const scaleX = rect.width / (totalW + marginX);
  const scaleY = rect.height / (totalH + marginY);
  
  const scale = Math.min(scaleX, scaleY) * 0.92;
  state.zoom = scale;
  state.panX = rect.width / 2;
  state.panY = rect.height / 2;
  
  const zoomEl = document.getElementById('zoom-val');
  if (zoomEl) zoomEl.innerText = Math.round(state.zoom * 5) + '%';
  draw();
}

function zoomIn() { state.zoom *= 1.15; draw(); }
function zoomOut() { state.zoom /= 1.15; draw(); }

container.addEventListener('mousedown', (e) => {
  state.isPanning = true;
  state.startX = e.clientX - state.panX;
  state.startY = e.clientY - state.panY;
});

window.addEventListener('mousemove', (e) => {
  if (!state.isPanning) return;
  state.panX = e.clientX - state.startX;
  state.panY = e.clientY - state.startY;
  draw();
});

window.addEventListener('mouseup', () => state.isPanning = false);

container.addEventListener('wheel', (e) => {
  e.preventDefault();
  const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
  state.zoom *= zoomFactor;
  draw();
}, { passive: false });

function drawStripedGrass(targetCtx, x, y, w, h, scale) {
  const stripeMeters = state.grassStripeW;
  const stripePx = stripeMeters * scale;
  
  let colA = '#15803d';
  let colB = '#166534';
  if (state.grassTone === 'lime') {
    colA = '#16a34a';
    colB = '#15803d';
  } else if (state.grassTone === 'deep') {
    colA = '#14532d';
    colB = '#052e16';
  }

  targetCtx.save();
  targetCtx.beginPath();
  targetCtx.rect(x, y, w, h);
  targetCtx.clip();

  if (state.grassDir === 'vertical') {
    let i = 0;
    for (let currX = x; currX < x + w; currX += stripePx) {
      const sw = Math.min(stripePx, x + w - currX);
      targetCtx.fillStyle = (i % 2 === 0) ? colA : colB;
      targetCtx.fillRect(currX, y, sw, h);

      targetCtx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      targetCtx.fillRect(currX, y, 1.5, h);
      i++;
    }
  } else {
    let j = 0;
    for (let currY = y; currY < y + h; currY += stripePx) {
      const sh = Math.min(stripePx, y + h - currY);
      targetCtx.fillStyle = (j % 2 === 0) ? colA : colB;
      targetCtx.fillRect(x, currY, w, sh);

      targetCtx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      targetCtx.fillRect(x, currY, w, 1.5);
      j++;
    }
  }

  targetCtx.restore();
}

/* =========================================================
   CONFIGURACIÓN Y CÁLCULOS DE MALLA DEPORTIVA
   ========================================================= */

function updateNetConfig() {
  const chk = document.getElementById('chk-view-net');
  state.showNet = chk ? chk.checked : false;

  const selGauge = document.getElementById('sel-net-gauge');
  if (selGauge) state.netGauge = parseInt(selGauge.value) || 96;

  const selRoofGauge = document.getElementById('sel-net-roof-gauge');
  if (selRoofGauge) state.netRoofGauge = parseInt(selRoofGauge.value) || 36;

  const selCoco = document.getElementById('sel-net-coco');
  if (selCoco) state.netCocoInches = parseInt(selCoco.value) || 10;

  const inpH = document.getElementById('inp-net-height');
  if (inpH) state.netHeight = parseFloat(inpH.value) || 6;

  const inpPLinear = document.getElementById('inp-net-price-linear');
  if (inpPLinear) state.netPriceLinear = parseFloat(inpPLinear.value) || 8.50;

  const inpPRoof = document.getElementById('inp-net-price-roof');
  if (inpPRoof) state.netPriceRoof = parseFloat(inpPRoof.value) || 1.10;

  draw();
}

function setNetSlack(val, btnId) {
  state.netSlackRatio = val;
  ['btn-pct-30', 'btn-pct-35', 'btn-pct-40', 'btn-pct-45', 'btn-pct-50'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
  const btn = document.getElementById(btnId);
  if (btn) btn.classList.add('active');
  draw();
}

function drawFieldNetOverlay(targetCtx, startX, startY, widthPx, heightPx, scale) {
  if (!state.showNet) return;

  targetCtx.save();
  targetCtx.fillStyle = 'rgba(15, 23, 42, 0.22)';
  targetCtx.fillRect(startX, startY, widthPx, heightPx);

  const meshMeters = state.netCocoInches * 0.0254;
  const meshPx = Math.max(3.8, meshMeters * scale);

  targetCtx.strokeStyle = 'rgba(255, 255, 255, 0.50)';
  targetCtx.lineWidth = state.netGauge >= 180 ? 1.2 : 0.7;

  targetCtx.beginPath();
  targetCtx.rect(startX, startY, widthPx, heightPx);
  targetCtx.clip();

  targetCtx.beginPath();
  for (let x = startX - heightPx; x < startX + widthPx + heightPx; x += meshPx * 1.35) {
    targetCtx.moveTo(x, startY);
    targetCtx.lineTo(x + heightPx, startY + heightPx);
  }
  for (let x = startX + widthPx + heightPx; x > startX - heightPx; x -= meshPx * 1.35) {
    targetCtx.moveTo(x, startY);
    targetCtx.lineTo(x - heightPx, startY + heightPx);
  }
  targetCtx.stroke();

  drawNumberBadge(
    targetCtx, 
    startX + widthPx / 2, 
    startY + 15, 
    `PERÍMETRO N°${state.netGauge} (+${Math.round(state.netSlackRatio * 100)}%) | TECHO N°${state.netRoofGauge} (+30%) | COCOS ${state.netCocoInches}"`, 
    '#0284c7', 
    '#ffffff'
  );

  targetCtx.restore();
}

function renderTechnicalPlan(targetCtx, width, height, scale, panX, panY, options = {}) {
  const isExport = options.isExport || false;
  targetCtx.clearRect(0, 0, width, height);

  let lineColor = state.lineColorField;
  let voleyColor = state.lineColorVoley;
  let bgColor = '#070b13';
  let cotaColor = '#38bdf8';
  let smallAreaColor = '#4ade80';
  let arcColor = '#f59e0b';

  if (isExport) {
    bgColor = '#ffffff';
    targetCtx.fillStyle = bgColor;
    targetCtx.fillRect(0, 0, width, height);
    drawGrid(targetCtx, width, height, '#f1f5f9');
    lineColor = state.lineColorField === '#ffffff' ? '#0f172a' : state.lineColorField;
    cotaColor = '#0284c7';
    smallAreaColor = '#16a34a';
    arcColor = '#d97706';
  } else if (state.theme === 'cad') {
    targetCtx.fillStyle = bgColor;
    targetCtx.fillRect(0, 0, width, height);
    drawGrid(targetCtx, width, height, '#0f172a');
    cotaColor = '#38bdf8';
  } else if (state.theme === 'light') {
    bgColor = '#ffffff';
    targetCtx.fillStyle = bgColor;
    targetCtx.fillRect(0, 0, width, height);
    drawGrid(targetCtx, width, height, '#f1f5f9');
    lineColor = state.lineColorField === '#ffffff' ? '#0f172a' : state.lineColorField;
    cotaColor = '#0284c7';
    smallAreaColor = '#16a34a';
    arcColor = '#d97706';
  } else if (state.theme === 'grass') {
    bgColor = '#092512';
    targetCtx.fillStyle = bgColor;
    targetCtx.fillRect(0, 0, width, height);
    cotaColor = '#38bdf8';
  } else {
    bgColor = '#1e293b';
    targetCtx.fillStyle = bgColor;
    targetCtx.fillRect(0, 0, width, height);
    cotaColor = '#38bdf8';
  }

  targetCtx.save();
  targetCtx.translate(panX, panY);

  // Dimensiones del campo de juego demarcado
  const totalH = (state.wid * state.numFields) + (state.gap * (state.numFields - 1));
  const startY = -totalH * scale / 2;
  const startX = -state.len * scale / 2;

  // Retiros asimétricos hacia el sardinel (Fondos y Laterales)
  const sepF = state.hasSardinel ? state.sardinelSepFondos : 0;
  const sepL = state.hasSardinel ? state.sardinelSepLaterales : 0;
  const sepFPx = sepF * scale;
  const sepLPx = sepL * scale;

  const grassStartX = startX - sepFPx;
  const grassStartY = startY - sepLPx;
  const grassTotalW = (state.len + 2 * sepF) * scale;
  const grassTotalH = (totalH + 2 * sepL) * scale;

  const chkExtDims = isExport ? true : document.getElementById('chk-ext-dims').checked;
  const chkLineDim = isExport ? true : document.getElementById('chk-line-dim').checked;
  const chkAreaDims = isExport ? true : document.getElementById('chk-area-dims').checked;
  const chkSmallAreaDims = isExport ? true : document.getElementById('chk-small-area-dims').checked;
  const chkPenArcDims = isExport ? true : document.getElementById('chk-pen-arc-dims').checked;
  const chkGoalDims = isExport ? true : document.getElementById('chk-goal-dims').checked;
  const chkRotDims = isExport ? true : document.getElementById('chk-rot-dims').checked;
  const chkCornerDims = isExport ? true : document.getElementById('chk-corner-dims').checked;
  const chkVoleyDims = isExport ? true : document.getElementById('chk-voley-dims').checked;
  const chkDiag = isExport ? true : document.getElementById('chk-diag').checked;

  const strokeWidthPx = Math.max(1.8, (state.lineWidthCm / 100) * scale);

  // 1. DIBUJO DEL CÉSPED SINTÉTICO (Cubre toda el área hasta el borde interior del sardinel)
  if (!isExport && state.theme === 'grass') {
    drawStripedGrass(targetCtx, grassStartX, grassStartY, grassTotalW, grassTotalH, scale);
  }

  // 2. DIBUJO DEL SARDINEL PERIMETRAL DE CONCRETO (Con retiros diferenciados)
  if (state.hasSardinel) {
    const sThick = Math.max(2.2, (state.sardinelWidthCm / 100) * scale);

    targetCtx.save();
    targetCtx.strokeStyle = isExport ? '#334155' : '#cbd5e1';
    targetCtx.lineWidth = sThick;
    targetCtx.setLineDash([8, 5]);
    targetCtx.strokeRect(grassStartX, grassStartY, grassTotalW, grassTotalH);
    targetCtx.setLineDash([]);

    // Cotas técnicas de separación del sardinel
    if (chkExtDims) {
      // Cota retiro Fondos (Detrás de los arcos)
      drawCadDimension(
        targetCtx,
        startX, startY - 0.8 * scale,
        startX - sepFPx, startY - 0.8 * scale,
        `Fondo: ${state.sardinelSepFondos.toFixed(2)}m`,
        '#f59e0b', false, bgColor
      );

      // Cota retiro Laterales (Bandas)
      drawCadDimension(
        targetCtx,
        startX - 0.8 * scale, startY,
        startX - 0.8 * scale, startY - sepLPx,
        `Banda: ${state.sardinelSepLaterales.toFixed(2)}m`,
        '#f59e0b', true, bgColor
      );
    }

    drawNumberBadge(
      targetCtx,
      grassStartX + grassTotalW / 2,
      grassStartY - 15,
      `SARDINEL DE CONCRETO (e=${state.sardinelWidthCm}cm | Fondos: ${state.sardinelSepFondos.toFixed(2)}m | Bandas: ${state.sardinelSepLaterales.toFixed(2)}m)`,
      '#0f172a',
      '#f59e0b'
    );
    targetCtx.restore();
  }

  // 3. CAPA DE MALLA EN CAMPO
  if (!isExport) {
    drawFieldNetOverlay(targetCtx, grassStartX, grassStartY, grassTotalW, grassTotalH, scale);
  }

  // 4. CANCHAS INDIVIDUALES Y LÍNEAS DE JUEGO REGLAMENTARIAS
  for (let i = 0; i < state.numFields; i++) {
    const fieldY = startY + i * (state.wid + state.gap) * scale;
    const fieldH = state.wid * scale;
    const fieldW = state.len * scale;

    if (!isExport && state.theme === 'court') {
      targetCtx.fillStyle = '#0f766e';
      targetCtx.fillRect(startX, fieldY, fieldW, fieldH);
    }

    targetCtx.strokeStyle = lineColor;
    targetCtx.lineWidth = strokeWidthPx;
    targetCtx.strokeRect(startX, fieldY, fieldW, fieldH);

    const midX = startX + fieldW / 2;
    targetCtx.beginPath();
    targetCtx.moveTo(midX, fieldY);
    targetCtx.lineTo(midX, fieldY + fieldH);
    targetCtx.stroke();

    if (state.circ > 0) {
      const cy = fieldY + fieldH / 2;
      const rPx = state.circ * scale;
      targetCtx.beginPath();
      targetCtx.arc(midX, cy, rPx, 0, Math.PI * 2);
      targetCtx.stroke();

      targetCtx.beginPath();
      targetCtx.fillStyle = lineColor;
      targetCtx.arc(midX, cy, Math.max(2.5, 0.22 * scale), 0, Math.PI * 2);
      targetCtx.fill();

      if (chkRotDims) {
        const angle = -Math.PI / 4;
        const rx = midX + Math.cos(angle) * rPx;
        const ry = cy + Math.sin(angle) * rPx;
        const elbowX = rx + 1.2 * scale;

        targetCtx.save();
        targetCtx.strokeStyle = cotaColor;
        targetCtx.lineWidth = 1.2;
        targetCtx.beginPath();
        targetCtx.moveTo(midX, cy);
        targetCtx.lineTo(rx, ry);
        targetCtx.lineTo(elbowX, ry);
        targetCtx.stroke();
        drawTick(targetCtx, rx, ry, 4);
        targetCtx.restore();

        drawNumberBadge(targetCtx, elbowX + 0.5 * scale, ry, 'R ' + state.circ.toFixed(2), bgColor, cotaColor);
      }
    }

    if (state.cornerR > 0) {
      const cR = state.cornerR * scale;
      targetCtx.strokeStyle = lineColor;
      targetCtx.lineWidth = strokeWidthPx;

      targetCtx.beginPath(); targetCtx.arc(startX, fieldY, cR, 0, Math.PI / 2); targetCtx.stroke();
      targetCtx.beginPath(); targetCtx.arc(startX, fieldY + fieldH, cR, 3 * Math.PI / 2, 0); targetCtx.stroke();
      targetCtx.beginPath(); targetCtx.arc(startX + fieldW, fieldY, cR, Math.PI / 2, Math.PI); targetCtx.stroke();
      targetCtx.beginPath(); targetCtx.arc(startX + fieldW, fieldY + fieldH, cR, Math.PI, 3 * Math.PI / 2); targetCtx.stroke();

      if (chkCornerDims) {
        const cornerAngle = Math.PI / 4;
        const arcX = startX + Math.cos(cornerAngle) * cR;
        const arcY = fieldY + Math.sin(cornerAngle) * cR;
        const outX = arcX + 1.2 * scale;
        const outY = arcY + 0.8 * scale;

        targetCtx.save();
        targetCtx.strokeStyle = cotaColor;
        targetCtx.lineWidth = 1.1;
        targetCtx.beginPath();
        targetCtx.moveTo(startX, fieldY);
        targetCtx.lineTo(arcX, arcY);
        targetCtx.lineTo(outX, outY);
        targetCtx.stroke();
        drawTick(targetCtx, arcX, arcY, 3.5);
        targetCtx.restore();

        drawNumberBadge(targetCtx, outX + 0.6 * scale, outY, 'r ' + state.cornerR.toFixed(2), bgColor, cotaColor);
      }
    }

    if (state.hasBigArea && state.areaLen > 0 && state.areaWid > 0) {
      const aL = state.areaLen * scale;
      const aW = state.areaWid * scale;
      const aY = fieldY + (fieldH - aW) / 2;

      targetCtx.strokeStyle = lineColor;
      targetCtx.lineWidth = strokeWidthPx;
      targetCtx.strokeRect(startX, aY, aL, aW);
      targetCtx.strokeRect(startX + fieldW - aL, aY, aL, aW);

      if (chkAreaDims) {
        const areaDimY = fieldY + fieldH + 1.4 * scale;
        drawCadDimension(targetCtx, startX, areaDimY, startX + aL, areaDimY, state.areaLen.toFixed(2), cotaColor, false, bgColor);

        const areaDimX = startX - 3.4 * scale;
        drawCadDimension(targetCtx, areaDimX, aY, areaDimX, aY + aW, state.areaWid.toFixed(2), cotaColor, true, bgColor);
      }
    }

    if (state.hasSmallArea && state.smallLen > 0 && state.smallWid > 0) {
      const sL = state.smallLen * scale;
      const sW = state.smallWid * scale;
      const sY = fieldY + (fieldH - sW) / 2;

      targetCtx.strokeStyle = lineColor;
      targetCtx.lineWidth = strokeWidthPx;
      targetCtx.strokeRect(startX, sY, sL, sW);
      targetCtx.strokeRect(startX + fieldW - sL, sY, sL, sW);

      if (chkSmallAreaDims) {
        const smallDimY = fieldY - 1.4 * scale;
        drawCadDimension(targetCtx, startX, smallDimY, startX + sL, smallDimY, state.smallLen.toFixed(2), smallAreaColor, false, bgColor);

        const smallDimX = startX - 1.8 * scale;
        drawCadDimension(targetCtx, smallDimX, sY, smallDimX, sY + sW, state.smallWid.toFixed(2), smallAreaColor, true, bgColor);
      }
    }

    if (state.penal > 0) {
      targetCtx.fillStyle = lineColor;
      targetCtx.beginPath();
      targetCtx.arc(startX + state.penal * scale, fieldY + fieldH / 2, Math.max(2.5, 0.22 * scale), 0, Math.PI * 2);
      targetCtx.fill();

      targetCtx.beginPath();
      targetCtx.arc(startX + fieldW - state.penal * scale, fieldY + fieldH / 2, Math.max(2.5, 0.22 * scale), 0, Math.PI * 2);
      targetCtx.fill();

      if (chkAreaDims) {
        const penalY = fieldY + fieldH / 2 + 1.2 * scale;
        drawCadDimension(targetCtx, startX, penalY, startX + state.penal * scale, penalY, state.penal.toFixed(2), cotaColor, false, bgColor);
      }
    }

    // Media luna del área penal reglamentaria
    if (state.hasPenaltyArc && state.penaltyArcR > 0 && state.penal > 0) {
      const pR = state.penaltyArcR * scale;
      const centerY = fieldY + fieldH / 2;
      const p1X = startX + state.penal * scale;
      const p2X = startX + fieldW - state.penal * scale;

      targetCtx.strokeStyle = lineColor;
      targetCtx.lineWidth = strokeWidthPx;

      const distToLine = Math.abs(state.areaLen - state.penal);

      if (state.hasBigArea && distToLine < state.penaltyArcR) {
        const alpha = Math.acos(distToLine / state.penaltyArcR);

        // Abre hacia el centro del campo
        targetCtx.beginPath();
        targetCtx.arc(p1X, centerY, pR, -alpha, alpha, false);
        targetCtx.stroke();

        targetCtx.beginPath();
        targetCtx.arc(p2X, centerY, pR, Math.PI - alpha, Math.PI + alpha, false);
        targetCtx.stroke();
      } else {
        targetCtx.beginPath();
        targetCtx.arc(p1X, centerY, pR, -Math.PI / 2, Math.PI / 2, false);
        targetCtx.stroke();

        targetCtx.beginPath();
        targetCtx.arc(p2X, centerY, pR, Math.PI / 2, 3 * Math.PI / 2, false);
        targetCtx.stroke();
      }

      if (chkPenArcDims && i === 0) {
        const arcAng = -Math.PI / 6;
        const ax = p1X + Math.cos(arcAng) * pR;
        const ay = centerY + Math.sin(arcAng) * pR;
        const elbowX = ax + 1.4 * scale;

        targetCtx.save();
        targetCtx.strokeStyle = arcColor;
        targetCtx.lineWidth = 1.2;
        targetCtx.beginPath();
        targetCtx.moveTo(p1X, centerY);
        targetCtx.lineTo(ax, ay);
        targetCtx.lineTo(elbowX, ay);
        targetCtx.stroke();
        drawTick(targetCtx, ax, ay, 4);
        targetCtx.restore();

        drawNumberBadge(targetCtx, elbowX + 0.6 * scale, ay, 'Arco R ' + state.penaltyArcR.toFixed(2), bgColor, arcColor);
      }
    }

    if (state.goalW > 0) {
      const gW = state.goalW * scale;
      const gD = 1.2 * scale;
      const gY = fieldY + (fieldH - gW) / 2;

      targetCtx.strokeStyle = lineColor;
      targetCtx.lineWidth = strokeWidthPx;
      targetCtx.strokeRect(startX - gD, gY, gD, gW);
      targetCtx.strokeRect(startX + fieldW, gY, gD, gW);

      if (chkGoalDims) {
        const goalDimX = startX - gD - 1.2 * scale;
        drawCadDimension(targetCtx, goalDimX, gY, goalDimX, gY + gW, state.goalW.toFixed(2), cotaColor, true, bgColor);
      }
    }

    if (state.hasVoley) {
      const vL = state.voleyLen * scale;
      const vW = state.voleyWid * scale;
      const vx = startX + (fieldW - vL) / 2;
      const vy = fieldY + (fieldH - vW) / 2;

      targetCtx.save();
      targetCtx.strokeStyle = voleyColor;
      targetCtx.lineWidth = Math.max(1.6, (state.lineWidthCm / 100) * scale);

      targetCtx.strokeRect(vx, vy, vL, vW);

      const vMidX = vx + vL / 2;
      targetCtx.beginPath();
      targetCtx.setLineDash([4, 3]);
      targetCtx.moveTo(vMidX, vy - 0.4 * scale);
      targetCtx.lineTo(vMidX, vy + vW + 0.4 * scale);
      targetCtx.stroke();
      targetCtx.setLineDash([]);

      const atkDist = state.voleyAtk * scale;
      targetCtx.beginPath();
      targetCtx.moveTo(vMidX - atkDist, vy);
      targetCtx.lineTo(vMidX - atkDist, vy + vW);
      targetCtx.stroke();

      targetCtx.beginPath();
      targetCtx.moveTo(vMidX + atkDist, vy);
      targetCtx.lineTo(vMidX + atkDist, vy + vW);
      targetCtx.stroke();
      targetCtx.restore();

      if (chkVoleyDims) {
        const dimY = vy + vW + 0.8 * scale;
        const defLen = (state.voleyLen / 2) - state.voleyAtk;

        drawCadDimension(targetCtx, vx, dimY, vMidX - atkDist, dimY, defLen.toFixed(2), voleyColor, false, bgColor);
        drawCadDimension(targetCtx, vMidX - atkDist, dimY, vMidX, dimY, state.voleyAtk.toFixed(2), voleyColor, false, bgColor);
        drawCadDimension(targetCtx, vMidX, dimY, vMidX + atkDist, dimY, state.voleyAtk.toFixed(2), voleyColor, false, bgColor);
        drawCadDimension(targetCtx, vMidX + atkDist, dimY, vx + vL, dimY, defLen.toFixed(2), voleyColor, false, bgColor);

        drawCadDimension(targetCtx, vx + vL + 0.8 * scale, vy, vx + vL + 0.8 * scale, vy + vW, state.voleyWid.toFixed(2), voleyColor, true, bgColor);
      }
    }

    if (chkLineDim && i === 0) {
      const ptX = startX + fieldW * 0.28;
      const ptY = fieldY;
      const endX = ptX - 2.8 * scale;
      const endY = ptY - 1.6 * scale;
      const elbowLineX = endX - 1.2 * scale;

      targetCtx.save();
      targetCtx.strokeStyle = cotaColor;
      targetCtx.lineWidth = 1.2;

      targetCtx.beginPath();
      targetCtx.moveTo(elbowLineX, endY);
      targetCtx.lineTo(endX, endY);
      targetCtx.lineTo(ptX, ptY);
      targetCtx.stroke();

      targetCtx.fillStyle = cotaColor;
      targetCtx.beginPath();
      targetCtx.arc(ptX, ptY, 3, 0, Math.PI * 2);
      targetCtx.fill();

      targetCtx.restore();

      const textLineW = `Línea: ${state.lineWidthCm} cm (e=${(state.lineWidthCm / 100).toFixed(2)}m)`;
      drawNumberBadge(targetCtx, elbowLineX - 0.4 * scale, endY, textLineW, bgColor, cotaColor);
    }

    if (chkDiag) {
      targetCtx.save();
      targetCtx.strokeStyle = isExport ? '#64748b' : (state.theme === 'light' ? '#94a3b8' : '#e2e8f0');
      targetCtx.setLineDash([6, 6]);
      targetCtx.lineWidth = 1.1;
      targetCtx.beginPath();
      targetCtx.moveTo(startX, fieldY);
      targetCtx.lineTo(startX + fieldW, fieldY + fieldH);
      targetCtx.stroke();
      targetCtx.restore();

      const dVal = Math.sqrt(state.len * state.len + state.wid * state.wid).toFixed(2);
      drawNumberBadge(targetCtx, startX + fieldW / 2, fieldY + fieldH / 2 + 1.2 * scale, 'Diag. ' + dVal + 'm', '#0284c7', '#ffffff');
    }

    if (i < state.numFields - 1) {
      const sepY = fieldY + fieldH + (state.gap * scale) / 2;
      targetCtx.save();
      targetCtx.strokeStyle = '#ef4444';
      targetCtx.lineWidth = 1.4;
      targetCtx.setLineDash([8, 6]);
      targetCtx.beginPath();
      targetCtx.moveTo(startX - 2 * scale, sepY);
      targetCtx.lineTo(startX + fieldW + 2 * scale, sepY);
      targetCtx.stroke();
      targetCtx.restore();

      drawCadDimension(
        targetCtx,
        startX - 2.5 * scale, fieldY + fieldH,
        startX - 2.5 * scale, fieldY + fieldH + state.gap * scale,
        state.gap.toFixed(2), '#ef4444', true, bgColor
      );
    }
  }

  // 5. UNIÓN EN CAMPO MAYOR
  if (state.numFields > 1 && state.hasJoinField) {
    const jColor = state.joinFieldColor;
    const totalW = state.len * scale;
    const totalH_px = totalH * scale;

    targetCtx.save();
    targetCtx.strokeStyle = jColor;
    targetCtx.lineWidth = Math.max(2.2, strokeWidthPx * 1.1);

    targetCtx.strokeRect(startX, startY, totalW, totalH_px);

    if (state.joinMode === 'transversal-field') {
      const joinMidY = startY + totalH_px / 2;
      targetCtx.beginPath();
      targetCtx.moveTo(startX, joinMidY);
      targetCtx.lineTo(startX + totalW, joinMidY);
      targetCtx.stroke();

      const joinMidX = startX + totalW / 2;
      const joinR = Math.min(4.5 * scale, (totalW * 0.15));
      targetCtx.beginPath();
      targetCtx.arc(joinMidX, joinMidY, joinR, 0, Math.PI * 2);
      targetCtx.stroke();

      targetCtx.beginPath();
      targetCtx.fillStyle = jColor;
      targetCtx.arc(joinMidX, joinMidY, Math.max(3, 0.25 * scale), 0, Math.PI * 2);
      targetCtx.fill();

      const jAreaW = Math.min(18 * scale, totalW * 0.65);
      const jAreaD = Math.min(8 * scale, totalH_px * 0.20);
      const jAreaX = startX + (totalW - jAreaW) / 2;

      targetCtx.strokeRect(jAreaX, startY, jAreaW, jAreaD);
      targetCtx.strokeRect(jAreaX, startY + totalH_px - jAreaD, jAreaW, jAreaD);

      const jGoalW = Math.min(5 * scale, totalW * 0.25);
      const jGoalD = 1.2 * scale;
      const jGoalX = startX + (totalW - jGoalW) / 2;

      targetCtx.strokeRect(jGoalX, startY - jGoalD, jGoalW, jGoalD);
      targetCtx.strokeRect(jGoalX, startY + totalH_px, jGoalW, jGoalD);
    }

    targetCtx.restore();

    const joinCotaX = startX - 5.5 * scale;
    drawCadDimension(
      targetCtx,
      joinCotaX, startY,
      joinCotaX, startY + totalH_px,
      'CAMPO UNIDO: ' + totalH.toFixed(2) + 'm',
      jColor, true, bgColor
    );
  }

  // 6. COTAS GENERALES EXTERIORES
  if (chkExtDims) {
    const topY1 = (state.hasSardinel ? grassStartY : startY) - 2.8 * scale;
    drawCadDimension(targetCtx, startX, topY1, startX + state.len * scale, topY1, 'Línea Juego: ' + state.len.toFixed(2) + 'm', cotaColor, false, bgColor);

    for (let i = 0; i < state.numFields; i++) {
      const fY = startY + i * (state.wid + state.gap) * scale;
      const rightX = (state.hasSardinel ? grassStartX + grassTotalW : startX + state.len * scale) + 2.5 * scale;
      drawCadDimension(targetCtx, rightX, fY, rightX, fY + state.wid * scale, state.wid.toFixed(2), cotaColor, true, bgColor);
    }

    if (state.numFields > 1) {
      const grandTotalX = (state.hasSardinel ? grassStartX + grassTotalW : startX + state.len * scale) + 5.0 * scale;
      drawCadDimension(targetCtx, grandTotalX, startY, grandTotalX, startY + totalH * scale, totalH.toFixed(2), cotaColor, true, bgColor);
    }
  }

  targetCtx.restore();

  if (isExport) {
    drawTitleBlock(targetCtx, width, height);
  }
}

function draw() {
  const rect = container.getBoundingClientRect();
  renderTechnicalPlan(ctx, rect.width, rect.height, state.zoom, state.panX, state.panY, { isExport: false });
}

function drawGrid(tCtx, w, h, color) {
  const step = 20;
  tCtx.save();
  tCtx.strokeStyle = color;
  tCtx.lineWidth = 0.5;
  tCtx.beginPath();
  for (let x = 0; x < w; x += step) { tCtx.moveTo(x, 0); tCtx.lineTo(x, h); }
  for (let y = 0; y < h; y += step) { tCtx.moveTo(0, y); tCtx.lineTo(w, y); }
  tCtx.stroke();
  tCtx.restore();
}

function drawCadDimension(tCtx, x1, y1, x2, y2, text, color, isVertical, bg) {
  tCtx.save();
  tCtx.strokeStyle = color;
  tCtx.lineWidth = 1.1;

  tCtx.beginPath();
  tCtx.moveTo(x1, y1);
  tCtx.lineTo(x2, y2);
  tCtx.stroke();

  const tick = 4.5;
  tCtx.beginPath();
  tCtx.moveTo(x1 - tick, y1 + tick);
  tCtx.lineTo(x1 + tick, y1 - tick);
  tCtx.moveTo(x2 - tick, y2 + tick);
  tCtx.lineTo(x2 + tick, y2 - tick);
  tCtx.stroke();

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  tCtx.font = 'bold 10px monospace';
  const tw = tCtx.measureText(text).width;

  tCtx.save();
  tCtx.translate(midX, midY);
  if (isVertical) tCtx.rotate(-Math.PI / 2);

  tCtx.fillStyle = bg;
  tCtx.fillRect(-tw / 2 - 3, -6.5, tw + 6, 13);

  tCtx.fillStyle = color;
  tCtx.textAlign = 'center';
  tCtx.textBaseline = 'middle';
  tCtx.fillText(text, 0, 0);

  tCtx.restore();
  tCtx.restore();
}

function drawTick(tCtx, x, y, size) {
  tCtx.beginPath();
  tCtx.moveTo(x - size, y + size);
  tCtx.lineTo(x + size, y - size);
  tCtx.stroke();
}

function drawNumberBadge(tCtx, x, y, text, bg, fg) {
  tCtx.save();
  tCtx.font = 'bold 10px monospace';
  const tw = tCtx.measureText(text).width;
  tCtx.fillStyle = bg;
  tCtx.strokeStyle = fg;
  tCtx.lineWidth = 1;
  tCtx.beginPath();
  tCtx.roundRect(x - tw / 2 - 4, y - 7, tw + 8, 14, 3);
  tCtx.fill();
  tCtx.stroke();

  tCtx.fillStyle = fg;
  tCtx.textAlign = 'center';
  tCtx.textBaseline = 'middle';
  tCtx.fillText(text, x, y);
  tCtx.restore();
}

function drawTitleBlock(tCtx, w, h) {
  const bw = 410;
  const bh = 124;
  const bx = w - bw - 30;
  const by = h - bh - 30;

  const sepF = state.hasSardinel ? state.sardinelSepFondos : 0;
  const sepL = state.hasSardinel ? state.sardinelSepLaterales : 0;
  const totalH = (state.wid * state.numFields) + (state.gap * (state.numFields - 1));
  const grassL = (state.len + 2 * sepF).toFixed(2);
  const grassW = (totalH + 2 * sepL).toFixed(2);

  tCtx.save();
  tCtx.fillStyle = '#ffffff';
  tCtx.strokeStyle = '#0f172a';
  tCtx.lineWidth = 2;
  tCtx.fillRect(bx, by, bw, bh);
  tCtx.strokeRect(bx, by, bw, bh);

  tCtx.lineWidth = 1;
  tCtx.beginPath();
  tCtx.moveTo(bx, by + 35);
  tCtx.lineTo(bx + bw, by + 35);
  tCtx.moveTo(bx + 250, by + 35);
  tCtx.lineTo(bx + 250, by + bh);
  tCtx.stroke();

  tCtx.fillStyle = '#0f172a';
  tCtx.font = 'bold 12px monospace';
  tCtx.fillText('PLANO DE REPLANTEO TÉCNICO', bx + 12, by + 22);

  tCtx.font = '9px monospace';
  tCtx.fillStyle = '#475569';
  tCtx.fillText('PROYECTO: CAMPO DEPORTIVO DE GRASS SINTÉTICO', bx + 12, by + 52);
  tCtx.fillText(`TRAZADO JUEGO: ${state.len.toFixed(2)}m x ${state.wid.toFixed(2)}m (${state.numFields} Cancha/s)`, bx + 12, by + 68);
  tCtx.fillText(`COBERTURA GRASS: ${grassL}m x ${grassW}m (Área: ${document.getElementById('met-area').innerText})`, bx + 12, by + 84);
  tCtx.fillText(`SARDINEL: ${state.hasSardinel ? `e=${state.sardinelWidthCm}cm (Fondos: ${sepF.toFixed(2)}m, Bandas: ${sepL.toFixed(2)}m)` : 'Sin sardinel'}`, bx + 12, by + 100);

  tCtx.fillText(`ESCALA: 1:${Math.round(2000 / state.zoom)}`, bx + 260, by + 52);
  tCtx.fillText(`FECHA: ${new Date().toLocaleDateString()}`, bx + 260, by + 68);
  tCtx.fillText('ESTADO: APROBADO CAD', bx + 260, by + 84);

  tCtx.restore();
}

function printCleanPdf() {
  document.body.classList.remove('printing-quotation');
  document.body.classList.remove('printing-net-quotation');
  const printCanvas = document.createElement('canvas');
  const pW = 2480;
  const pH = 1754;
  printCanvas.width = pW;
  printCanvas.height = pH;
  const pCtx = printCanvas.getContext('2d');

  const sepF = state.hasSardinel ? state.sardinelSepFondos : 0;
  const sepL = state.hasSardinel ? state.sardinelSepLaterales : 0;
  const totalW = state.len + (2 * sepF);
  const totalH = (state.wid * state.numFields) + (state.gap * (state.numFields - 1)) + (2 * sepL);
  const marginMeters = 24;

  const scaleX = pW / (totalW + marginMeters);
  const scaleY = pH / (totalH + marginMeters);
  const exportScale = Math.min(scaleX, scaleY) * 0.85;

  renderTechnicalPlan(pCtx, pW, pH, exportScale, pW / 2, pH / 2, { isExport: true });

  const printImg = document.getElementById('print-canvas');
  printImg.src = printCanvas.toDataURL('image/png', 1.0);

  setTimeout(() => {
    window.print();
  }, 250);
}

function downloadImage() {
  const link = document.createElement('a');
  link.download = `plano_grass_franjeado_${state.len}x${state.wid}_${state.lineWidthCm}cm.png`;
  link.href = cv.toDataURL('image/png', 1.0);
  link.click();
}

/* =========================================================
   UTILIDAD UNIVERSAL: AUTO-EXPANSIÓN DE TEXTAREAS
   ========================================================= */
function autoExpandTextarea(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = (textarea.scrollHeight) + 'px';
}

/* =========================================================
   FUNCIONES DE COTIZACIÓN DE GRASS (100% DINÁMICO Y EDITABLE)
   ========================================================= */

function calcQuotationTotals() {
  const tbody = document.getElementById('quote-tbody');
  if (!tbody) return;

  const rows = tbody.querySelectorAll('tr');
  let subtotal = 0;

  rows.forEach(row => {
    const qtyInp = row.querySelector('.q-qty-val');
    const priceInp = row.querySelector('.q-price-val');
    const totalInp = row.querySelector('.q-item-total');

    if (qtyInp && priceInp && totalInp) {
      const q = parseFloat(qtyInp.value) || 0;
      const p = parseFloat(priceInp.value) || 0;
      const rowTot = q * p;
      if (rowTot > 0) {
        totalInp.value = rowTot.toFixed(2);
      }
      const val = parseFloat(totalInp.value);
      if (!isNaN(val)) subtotal += val;
    } else if (totalInp) {
      const val = parseFloat(totalInp.value);
      if (!isNaN(val)) subtotal += val;
    }
  });

  const tc = parseFloat(document.getElementById('inp-q-tc').value) || 3.70;
  const igv = subtotal * 0.18;
  const totalUSD = subtotal + igv;
  const totalPEN = totalUSD * tc;

  document.getElementById('inp-q-subtotal').value = subtotal > 0 ? subtotal.toFixed(2) : '0.00';
  document.getElementById('inp-q-igv').value = igv > 0 ? igv.toFixed(2) : '0.00';
  document.getElementById('inp-q-total-usd').value = totalUSD > 0 ? totalUSD.toFixed(2) : '0.00';
  document.getElementById('inp-q-total-pen').value = totalPEN > 0 ? totalPEN.toFixed(2) : '0.00';
}

function calcQuotationTotalsManual() {
  const subtotal = parseFloat(document.getElementById('inp-q-subtotal').value) || 0;
  const tc = parseFloat(document.getElementById('inp-q-tc').value) || 3.70;
  const igv = parseFloat(document.getElementById('inp-q-igv').value) || (subtotal * 0.18);
  
  const totalUSD = subtotal + igv;
  const totalPEN = totalUSD * tc;

  document.getElementById('inp-q-total-usd').value = totalUSD > 0 ? totalUSD.toFixed(2) : '0.00';
  document.getElementById('inp-q-total-pen').value = totalPEN > 0 ? totalPEN.toFixed(2) : '0.00';
}

function addQuoteRow(data = {}) {
  const tbody = document.getElementById('quote-tbody');
  if (!tbody) return;

  const tr = document.createElement('tr');
  const qty = data.qty !== undefined ? data.qty : '';
  const model = data.model || '';
  const desc = data.desc || '';
  const weight = data.weight || '';
  const price = data.price !== undefined ? data.price : '';
  const total = data.total !== undefined ? data.total : '';
  const isGift = data.isGift || false;

  if (isGift) {
    tr.className = 'row-gift';
    tr.innerHTML = `
      <td><input type="text" class="tbl-input font-bold" value="${qty}" placeholder="-"></td>
      <td><input type="text" class="tbl-input font-bold" value="${model}" placeholder="Accesorios / Regalo"></td>
      <td><textarea class="tbl-textarea font-bold" rows="1" placeholder="Descripción del obsequio..." oninput="autoExpandTextarea(this)">${desc}</textarea></td>
      <td><input type="text" class="tbl-input text-center" value="${weight}" placeholder="-"></td>
      <td><input type="text" class="tbl-input text-center font-bold text-green" value="0.00" readonly></td>
      <td><input type="text" class="tbl-input text-center badge-gift font-bold" value="${total || 'REGALO'}"></td>
      <td style="text-align: center; vertical-align: middle;">
        <button type="button" onclick="this.closest('tr').remove(); calcQuotationTotals();" title="Eliminar fila" style="background:none; border:none; color:#ef4444; font-size:12px; cursor:pointer; font-weight:bold;">✕</button>
      </td>
    `;
  } else {
    tr.innerHTML = `
      <td><input type="text" class="tbl-input font-bold q-qty-val" value="${qty}" placeholder="0.00" oninput="calcQuotationTotals()"></td>
      <td><input type="text" class="tbl-input font-bold" value="${model}" placeholder="Modelo..."></td>
      <td><textarea class="tbl-textarea" rows="2" placeholder="Descripción técnica del producto o servicio..." oninput="autoExpandTextarea(this)">${desc}</textarea></td>
      <td><input type="text" class="tbl-input text-center" value="${weight}" placeholder="-"></td>
      <td><input type="number" class="tbl-input text-right q-price-val" step="0.01" value="${price}" placeholder="0.00" oninput="calcQuotationTotals()"></td>
      <td><input type="number" class="tbl-input text-right font-bold q-item-total" step="0.01" value="${total}" placeholder="0.00" oninput="calcQuotationTotals()"></td>
      <td style="text-align: center; vertical-align: middle;">
        <button type="button" onclick="this.closest('tr').remove(); calcQuotationTotals();" title="Eliminar fila" style="background:none; border:none; color:#ef4444; font-size:12px; cursor:pointer; font-weight:bold;">✕</button>
      </td>
    `;
  }

  tbody.appendChild(tr);

  const txt = tr.querySelector('.tbl-textarea');
  if (txt) autoExpandTextarea(txt);

  calcQuotationTotals();
}

function clearQuotationFields() {
  if (!confirm('¿Deseas vaciar todas las partidas de la cotización para empezar de cero?')) return;
  const tbody = document.getElementById('quote-tbody');
  if (tbody) tbody.innerHTML = '';
  calcQuotationTotals();
}

function openQuotationModal() {
  const modal = document.getElementById('modal-quotation');
  if (!modal) return;
  modal.classList.add('active');

  const sepF = state.hasSardinel ? state.sardinelSepFondos : 0;
  const sepL = state.hasSardinel ? state.sardinelSepLaterales : 0;
  const totalPlayHeight = (state.wid * state.numFields) + (state.gap * (state.numFields - 1));

  // Dimensiones que cubren todo el césped sintético hasta el borde interior del sardinel
  const totalGrassLen = state.len + (2 * sepF);
  const totalGrassWid = totalPlayHeight + (2 * sepL);
  const totalGrassArea = totalGrassLen * totalGrassWid;

  document.getElementById('q-dim-wid').value = totalGrassWid.toFixed(2) + ' m';
  document.getElementById('q-dim-len').value = totalGrassLen.toFixed(2) + ' m';
  document.getElementById('q-dim-area').value = totalGrassArea.toFixed(2) + ' m²';

  const today = new Date();
  const dateInput = document.getElementById('q-date');
  if (dateInput) {
    dateInput.value = today.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  const tbody = document.getElementById('quote-tbody');
  if (tbody && tbody.children.length === 0) {
    const grassQty = totalGrassArea.toFixed(2);
    const lineQty = (document.getElementById('met-paint-area') ? parseFloat(document.getElementById('met-paint-area').innerText) : 16.10).toFixed(2);
    const rubberQty = ((totalGrassArea * 7) / 1000).toFixed(2);
    const sandQty = ((totalGrassArea * 28) / 1000).toFixed(2);
    const glueKits = Math.max(2, Math.ceil(totalGrassArea / 100));
    const tapeMeters = (totalGrassArea * 0.45).toFixed(2);

    addQuoteRow({
      qty: `${grassQty} m²`,
      model: 'GOL SPORT 50',
      desc: `Grass Sintético Monofilamento Shape Recto con nervio central (Franjeado: verde lima y esmeralda), 50mm, Dtex. 9 000, puntadas 11 900 /m². Cobertura total hasta sardinel (${totalGrassLen.toFixed(2)}m x ${totalGrassWid.toFixed(2)}m) incluyendo retiros de seguridad.`,
      weight: `${(totalGrassArea * 3 / 1000).toFixed(2)} TN`,
      price: '10.17'
    });

    addQuoteRow({
      qty: `${lineQty} m²`,
      model: 'Líneas Blancas',
      desc: 'Monofilamento 50 mm para demarcación reglamentaria de juego, Dtex. 9 000, puntadas 11 900 /m².',
      weight: '48.50 KG',
      price: '0.00',
      total: '0.00'
    });

    addQuoteRow({
      qty: `${(totalGrassArea * 7).toFixed(0)} kg`,
      model: 'Caucho Granulado',
      desc: 'Granulometría seleccionada 1.5 - 2.5 mm especial para campos deportivos con amortiguación de impacto.',
      weight: `${rubberQty} TN`,
      price: '0.00',
      total: '0.00'
    });

    addQuoteRow({
      qty: `${(totalGrassArea * 28).toFixed(0)} kg`,
      model: 'Arena Silícea',
      desc: 'Arena cuarzosa cernida, seca y libre de impurezas para estabilización del césped.',
      weight: `${sandQty} TN`,
      price: '0.00',
      total: '0.00'
    });

    addQuoteRow({
      qty: `${glueKits} Kits`,
      model: 'Pegamento PU',
      desc: 'Adhesivo bicomponente de poliuretano Duayen A-121 de alta adherencia y resistencia a la humedad.',
      weight: `${glueKits * 23} KG`,
      price: '0.00',
      total: '0.00'
    });

    addQuoteRow({
      qty: `${tapeMeters} ml`,
      model: 'Cinta de Unión',
      desc: 'Cinta de polipropileno tejida de 30cm de ancho para unión y traslape de paños.',
      weight: '-',
      price: '0.00',
      total: '0.00'
    });

    addQuoteRow({
      qty: '1 Glb',
      model: 'Transporte',
      desc: 'Flete y traslado de rollos de grass, arena y materiales puestos en obra.',
      weight: '-',
      price: '250.00'
    });

    addQuoteRow({
      qty: '1 Glb',
      model: 'Instalación',
      desc: 'Mano de obra calificada: cortado, pegado de líneas, lastrado mecánico y cepillado.',
      weight: '-',
      price: '300.00'
    });

    addQuoteRow({
      qty: '01 Juego',
      model: 'Redes de Arco',
      desc: '01 Juego de mallas reglamentarias de arco en nylon con tratamiento UV.',
      weight: '-',
      isGift: true
    });
  } else {
    calcQuotationTotals();
  }
}

function closeQuotationModal() {
  document.getElementById('modal-quotation').classList.remove('active');
  document.body.classList.remove('printing-quotation');
}

function printQuotationOnly() {
  document.body.classList.add('printing-quotation');
  setTimeout(() => window.print(), 200);
}

/* =========================================================
   FUNCIONES DE COTIZACIÓN DE MALLA (7 COLUMNAS Y AUTO-EXPANSIÓN)
   ========================================================= */

function calcNetQuotationTotals() {
  const tbody = document.getElementById('net-quote-tbody');
  if (!tbody) return;

  const rows = tbody.querySelectorAll('tr');
  let subtotal = 0;

  rows.forEach(row => {
    const qtyInp = row.querySelector('.net-qty-val');
    const priceInp = row.querySelector('.net-price-val');
    const totalInp = row.querySelector('.net-total-val');

    if (qtyInp && priceInp && totalInp) {
      const q = parseFloat(qtyInp.value) || 0;
      const p = parseFloat(priceInp.value) || 0;
      const rowTot = q * p;
      totalInp.value = rowTot > 0 ? rowTot.toFixed(2) : '0.00';
      subtotal += rowTot;
    }
  });

  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  const elSub = document.getElementById('net-tot-sub');
  const elIgv = document.getElementById('net-tot-igv');
  const elTot = document.getElementById('net-tot-total');
  const elTotalArea = document.getElementById('net-q-total-area');

  if (elSub) elSub.value = subtotal.toFixed(2);
  if (elIgv) elIgv.value = igv.toFixed(2);
  if (elTot) elTot.value = total.toFixed(2);
  if (elTotalArea) elTotalArea.value = 'S/ ' + total.toFixed(2);
}

function addNetQuoteRow(data = {}) {
  const tbody = document.getElementById('net-quote-tbody');
  if (!tbody) return;

  const tr = document.createElement('tr');
  const qty = data.qty !== undefined ? data.qty : '';
  const unit = data.unit || 'ml';
  const item = data.item || '';
  const desc = data.desc || '';
  const cocos = data.cocos || '-';
  const price = data.price !== undefined ? data.price : '';

  tr.innerHTML = `
    <td>
      <input type="number" class="tbl-input text-right font-bold net-qty-val" step="0.01" value="${qty}" placeholder="0.00" oninput="calcNetQuotationTotals()">
    </td>
    <td>
      <input type="text" class="tbl-input text-center text-muted font-bold" value="${unit}" placeholder="unid">
    </td>
    <td>
      <input type="text" class="tbl-input font-bold" value="${item}" placeholder="Nombre de ítem...">
    </td>
    <td>
      <textarea class="tbl-textarea" rows="2" placeholder="Descripción técnica detallada..." oninput="autoExpandTextarea(this)">${desc}</textarea>
    </td>
    <td>
      <input type="text" class="tbl-input text-center font-bold" value="${cocos}" placeholder="-">
    </td>
    <td>
      <input type="number" class="tbl-input text-right net-price-val" step="0.01" value="${price}" placeholder="0.00" oninput="calcNetQuotationTotals()">
    </td>
    <td>
      <input type="number" class="tbl-input text-right font-bold net-total-val" step="0.01" placeholder="0.00" readonly>
    </td>
    <td style="text-align: center; vertical-align: middle;">
      <button type="button" onclick="this.closest('tr').remove(); calcNetQuotationTotals();" title="Eliminar fila" style="background:none; border:none; color:#ef4444; font-size:12px; cursor:pointer; font-weight:bold;">✕</button>
    </td>
  `;

  tbody.appendChild(tr);

  const txt = tr.querySelector('.tbl-textarea');
  if (txt) autoExpandTextarea(txt);

  calcNetQuotationTotals();
}

function clearNetQuotationFields() {
  if (!confirm('¿Deseas vaciar todas las partidas de la cotización de malla para empezar de cero?')) return;
  const tbody = document.getElementById('net-quote-tbody');
  if (tbody) tbody.innerHTML = '';
  calcNetQuotationTotals();
}

function openNetQuotationModal() {
  const modal = document.getElementById('modal-net-quotation');
  if (!modal) return;
  modal.classList.add('active');

  const today = new Date();
  const dateInput = document.getElementById('net-q-date');
  if (dateInput) {
    dateInput.value = today.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  // Dimensiones exteriores (siguiendo el perímetro del sardinel o juego)
  const sepF = state.hasSardinel ? state.sardinelSepFondos : 0;
  const sepL = state.hasSardinel ? state.sardinelSepLaterales : 0;
  const totalPlayHeight = (state.wid * state.numFields) + (state.gap * (state.numFields - 1));

  const largo = state.len + (2 * sepF);
  const ancho = totalPlayHeight + (2 * sepL);

  // 1. Malla Perimetral (Metros Lineales sobre el sardinel)
  const perimetroLinealBase = 2 * (largo + ancho);
  const perimetroLinealFinal = perimetroLinealBase * (1 + state.netSlackRatio);

  // 2. Malla de Techo (Metros Cuadrados sobre el área total de confinamiento)
  const areaTechoBase = largo * ancho;
  const areaTechoFinal = areaTechoBase * (1 + state.netRoofSlackRatio);

  // Resumen superior
  const elPerim = document.getElementById('net-q-perim');
  const elRoofArea = document.getElementById('net-q-roof-area');
  const elSideArea = document.getElementById('net-q-side-area');

  const pctPerimTexto = Math.round(state.netSlackRatio * 100);
  if (elPerim) elPerim.value = perimetroLinealBase.toFixed(2) + ' ml';
  if (elRoofArea) elRoofArea.value = areaTechoFinal.toFixed(2) + ' m² (+30%)';
  if (elSideArea) elSideArea.value = perimetroLinealFinal.toFixed(2) + ' ml (+' + pctPerimTexto + '%)';

  // Poblado inicial completo de partidas para presupuesto de malla
  const tbody = document.getElementById('net-quote-tbody');
  if (tbody) {
    tbody.innerHTML = '';

    // Fila 1: Perimetral
    addNetQuoteRow({
      qty: perimetroLinealFinal.toFixed(2),
      unit: 'ml',
      item: `Malla Perimetral N° ${state.netGauge}`,
      desc: `Suma perimetral sobre sardinel [2 x (${largo.toFixed(2)}m + ${ancho.toFixed(2)}m) = ${perimetroLinealBase.toFixed(2)} ml] + ${pctPerimTexto}% de demasía para formación de cocos al rombo (H=${state.netHeight.toFixed(2)}m). Red de nylon con aditivo anti-UV.`,
      cocos: `${state.netCocoInches}"`,
      price: state.netPriceLinear.toFixed(2)
    });

    // Fila 2: Techo
    addNetQuoteRow({
      qty: areaTechoFinal.toFixed(2),
      unit: 'm²',
      item: `Malla Aérea Techo N° ${state.netRoofGauge}`,
      desc: `Área superior completa (${largo.toFixed(2)}m x ${ancho.toFixed(2)}m = ${areaTechoBase.toFixed(2)} m²) + 30% adicional para caída, flecha y amarre. Tejido thermo-fijado resistente al sol e intemperie.`,
      cocos: '5"',
      price: state.netPriceRoof.toFixed(2)
    });

    // Fila 3: Cable Tensor
    addNetQuoteRow({
      qty: (perimetroLinealBase * 1.15).toFixed(2),
      unit: 'ml',
      item: 'Cable Acerado Galvanizado',
      desc: 'Cable de acero galvanizado de 3/16" con recubrimiento plastificado para guía perimétrica superior e intermedia.',
      cocos: '3/16"',
      price: '3.20'
    });

    // Fila 4: Accesorios de Anclaje
    addNetQuoteRow({
      qty: '1.00',
      unit: 'Kit',
      item: 'Templadores y Grilletes',
      desc: 'Juego de templadores ojo-gancho de 1/2", guardacabos, grilletes y pernos de anclaje para postes metálicos.',
      cocos: '1/2"',
      price: '180.00'
    });

    // Fila 5: Driza de Amarre
    addNetQuoteRow({
      qty: '4.00',
      unit: 'Kg',
      item: 'Driza Perimetral de Costura',
      desc: 'Driza de polietileno de 3.5mm para cosido continuo de malla al cable acerado tensor.',
      cocos: '3.5mm',
      price: '28.00'
    });

    // Fila 6: Instalación
    addNetQuoteRow({
      qty: '1.00',
      unit: 'Glb',
      item: 'Mano de Obra Especializada',
      desc: 'Tensado de cables, colocación, amarre y calibración de flecha para red perimétrica y cobertura de techo.',
      cocos: '-',
      price: '350.00'
    });
  }
}

function closeNetQuotationModal() {
  const modal = document.getElementById('modal-net-quotation');
  if (modal) modal.classList.remove('active');
  document.body.classList.remove('printing-net-quotation');
}

function printNetQuotationOnly() {
  document.body.classList.add('printing-net-quotation');
  setTimeout(() => window.print(), 200);
}

/* =========================================================
   SUBIDA DE LOGOS
   ========================================================= */
function cargarLogoCotizacion(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const imgPreview = document.getElementById('badge-custom-img');
    const defaultText = document.getElementById('badge-default-text');
    if (imgPreview) {
      imgPreview.src = e.target.result;
      imgPreview.style.display = 'block';
    }
    if (defaultText) defaultText.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function cargarLogoCotizacionMalla(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const imgPreview = document.getElementById('net-badge-custom-img');
    const defaultText = document.getElementById('net-badge-default-text');
    if (imgPreview) {
      imgPreview.src = e.target.result;
      imgPreview.style.display = 'block';
    }
    if (defaultText) defaultText.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeQuotationModal();
    closeNetQuotationModal();
  }
});

document.addEventListener('click', (e) => {
  const modal = document.getElementById('modal-quotation');
  const netModal = document.getElementById('modal-net-quotation');
  if (e.target === modal) closeQuotationModal();
  if (e.target === netModal) closeNetQuotationModal();
});

window.onload = () => {
  setFieldsCount(1);
  setTheme('grass');
  toggleAreaInputs();
  togglePenaltyArcInputs();
  resizeCanvas();
  resetFit();
};
/* =========================================================
   CONEXIÓN CON BASE DE DATOS Y GESTIÓN DE USUARIOS
   ========================================================= */

// Registrar usuario
async function registrarNuevoUsuario(nombre, email, password) {
  try {
    const respuesta = await fetch('http://localhost:3000/api/usuarios/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    });

    const data = await respuesta.json();
    if (!respuesta.ok) {
      alert('Error: ' + data.error);
      return false;
    }

    alert('¡Usuario registrado con éxito!');
    return true;
  } catch (err) {
    console.error('Error de red:', err);
    alert('No se pudo conectar con el servidor.');
    return false;
  }
}

// Iniciar sesión (Login)
async function iniciarSesionUsuario(email, password) {
  try {
    const respuesta = await fetch('http://localhost:3000/api/usuarios/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await respuesta.json();
    if (!respuesta.ok) {
      alert('Error: ' + data.error);
      return false;
    }

    // Guardar token en el navegador para mantener la sesión
    localStorage.setItem('token_sesion', data.token);
    localStorage.setItem('usuario_actual', JSON.stringify(data.usuario));
    alert('Bienvenido, ' + data.usuario.nombre);
    return true;
  } catch (err) {
    console.error('Error de red:', err);
    alert('No se pudo conectar con el servidor.');
    return false;
  }
}

// Guardar el proyecto/cancha actual en la BD
async function guardarProyectoEnBD(nombreProyecto) {
  const token = localStorage.getItem('token_sesion');
  if (!token) {
    alert('Debes iniciar sesión para guardar tus proyectos.');
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/proyectos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        nombre: nombreProyecto,
        configuracion: state // Guarda las medidas, sardinel, mallas y colores actuales
      })
    });

    const data = await res.json();
    if (res.ok) {
      alert('Plano deportivo guardado correctamente.');
    } else {
      alert('Error al guardar: ' + data.error);
    }
  } catch (e) {
    console.error('Error al guardar:', e);
  }
}
/* =========================================================
   SOPORTE TÁCTIL MULTI-DISPOSITIVO (PAN + PINCH ZOOM iOS/ANDROID)
   ========================================================= */
(function initResponsiveTouchAndResize() {
  let initialPinchDist = null;
  let initialZoom = 1;

  function getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  }

  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      state.isPanning = true;
      state.startX = e.touches[0].clientX - state.panX;
      state.startY = e.touches[0].clientY - state.panY;
    } else if (e.touches.length === 2) {
      state.isPanning = false;
      initialPinchDist = getTouchDistance(e.touches);
      initialZoom = state.zoom;
    }
  }, { passive: false });

  container.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && state.isPanning) {
      state.panX = e.touches[0].clientX - state.startX;
      state.panY = e.touches[0].clientY - state.startY;
      draw();
    } else if (e.touches.length === 2 && initialPinchDist) {
      const currentDist = getTouchDistance(e.touches);
      const scaleFactor = currentDist / initialPinchDist;
      state.zoom = Math.max(2, Math.min(80, initialZoom * scaleFactor));
      const zoomEl = document.getElementById('zoom-val');
      if (zoomEl) zoomEl.innerText = Math.round(state.zoom * 5) + '%';
      draw();
    }
  }, { passive: false });

  container.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
      initialPinchDist = null;
    }
    if (e.touches.length === 0) {
      state.isPanning = false;
    } else if (e.touches.length === 1) {
      state.isPanning = true;
      state.startX = e.touches[0].clientX - state.panX;
      state.startY = e.touches[0].clientY - state.panY;
    }
  });

  // Recalcula automáticamente el tamaño del canvas ante cambios de orientación o barras móviles
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => {
      resizeCanvas();
      resetFit();
    });
    ro.observe(container);
  }

  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      resizeCanvas();
      resetFit();
    }, 200);
  });
})();