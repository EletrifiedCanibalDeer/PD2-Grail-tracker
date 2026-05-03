// Categories are baked into RAW_DATA — no transformation needed
function transformCategory(item) { return item.c; }

// ── VERSION ──
window.GRAIL_VERSION = 'v1.1';
window.GRAIL_SEASON = 'S13 · Betrayal';

const DATA_KEY = 'pd2grail_data_v1';
// Clear any stale localStorage data so new categories take effect
const _savedVersion = localStorage.getItem('pd2grail_data_version');
if (_savedVersion !== '11') {
  localStorage.removeItem(DATA_KEY);
  localStorage.setItem('pd2grail_data_version', '11');
}
const _savedData = localStorage.getItem(DATA_KEY);
const DATA = _savedData ? JSON.parse(_savedData) : RAW_DATA.map(item => ({...item}));
if (!_savedData) {
  localStorage.setItem(DATA_KEY, JSON.stringify(DATA));
}

// App logic
const LS_KEY='pd2grail_v1';
const DATES_KEY='pd2grail_dates_v1';
let found = new Set(JSON.parse(localStorage.getItem(LS_KEY) || '[]'));
let foundDates = JSON.parse(localStorage.getItem(DATES_KEY) || '{}');
let activeTab = 'weapons', activeFilter = 'all', searchVal = '', activeTier = 'all';
const TABS = ['weapons','armor','jewelry','sets','runewords','runes'];

function save(){ localStorage.setItem(LS_KEY, JSON.stringify([...found])); localStorage.setItem(DATES_KEY, JSON.stringify(foundDates)); }

function groupData(){
  const map = new Map();
  DATA.forEach((item, i) => {
    const key = item.tab + '||' + item.c;
    if (!map.has(key)) map.set(key, { tab: item.tab, label: item.c, items: [] });
    map.get(key).items.push({ ...item, id: i });
  });
  const groups = Array.from(map.values());
  groups.sort((a, b) => {
    let aKey = a.label, bKey = b.label;
    if (aKey.startsWith('1h ') || aKey.startsWith('2h ')) aKey = aKey.substring(3);
    if (bKey.startsWith('1h ') || bKey.startsWith('2h ')) bKey = bKey.substring(3);
    return aKey.localeCompare(bKey);
  });
  return groups;
}

const groups = groupData();
const firstRune = DATA.findIndex(d => d.t==='r');

function buildUI(){
  const content = document.getElementById('content');
  content.innerHTML = '';
  groups.forEach(group => {
    const isRune = group.tab === 'runes';
    const sec = document.createElement('div');
    sec.className = 'section open';
    sec.dataset.tab = group.tab;
    const divider = document.createElement('div');
    divider.className = 'search-divider';
    divider.innerHTML = `<div class="sdline"></div><span class="sdpill ${group.tab}">${group.tab.charAt(0).toUpperCase()+group.tab.slice(1)}</span><div class="sdline"></div>`;
    divider.style.display = 'none';
    sec.appendChild(divider);
    const hdr = document.createElement('div');
    hdr.className = 'sh';
    hdr.innerHTML = `<span class="sarrow">▶</span><span class="sname">${group.label}</span><div class="strack"><div class="sfill" style="width:0%"></div></div><span class="sstat">0 / ${group.items.length}</span>`;
    hdr.addEventListener('click', () => sec.classList.toggle('open'));
    sec.appendChild(hdr);
    const body = document.createElement('div');
    body.className = 'sbody';
    const grid = document.createElement('div');
    grid.className = 'grid';
    const sortedItems = group.tab === 'runewords'
      ? [...group.items].sort((a, b) => a.n.localeCompare(b.n))
      : group.items;
    sortedItems.forEach(item => {
      const card = createCard(item, sec, isRune);
      grid.appendChild(card);
    });
    body.appendChild(grid);
    sec.appendChild(body);
    content.appendChild(sec);
  });
  updateAllStats();
  showTab(activeTab);
}

function formatDate(ts){
  if(!ts) return '';
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2,'0');
  const month = String(d.getMonth()+1).padStart(2,'0');
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}-${year}`;
}

function createCard(item, sec, isRune){
  const card = document.createElement('div');
  card.className = `card${found.has(item.id)?' found':''}`;
  card.dataset.id = item.id;
  card.dataset.name = item.n.toLowerCase();
  card.dataset.tab = item.tab;
  card.dataset.tier = (item.tier || '').toLowerCase();
  const tierTag = item.tier ? `<span class="tag tier-${item.tier.toLowerCase()}">${item.tier}</span>` : '';

  // For runewords: split socket count out of base, render runes as individual pills
  let baseDisplay = item.b;
  let socketBadge = '';
  let runesHtml = '';
  if (item.runes) {
    // Extract "N-Socket" prefix from base
    const socketMatch = item.b.match(/^(\d+-Socket)\s*/i);
    if (socketMatch) {
      const count = socketMatch[1];
      socketBadge = `<span class="socket-badge">${count}</span>`;
      baseDisplay = item.b.replace(socketMatch[0], '').replace(/\*$/, '').trim();
    }
    // Render runes as plain text line
    runesHtml = `<div class="rune-text">${item.runes}</div>`;
  }

  const baseTag = `<span class="tag base">${baseDisplay}</span>`;
  const pill = (item.t === 'r') ? `<span class="rp">#${item.id-firstRune+1}</span>` : '';
  const dateStr = foundDates[item.id] ? `<div class="cd">${formatDate(foundDates[item.id])}</div>` : '';
  const sourceLabel = item.src ? `<span class="src-label" title="${item.src}">${item.src}</span>` : '';
  const topRight = socketBadge || sourceLabel;
  card.innerHTML = `${topRight}<div class="dot"></div><div class="ci"><div class="cn">${item.n}</div><div class="tags">${baseTag}</div>${runesHtml || (item.tier ? `<div class="tags">${tierTag}</div>` : '')}</div>${pill}${dateStr}`;
  card.addEventListener('click', () => toggleItem(item.id, card, sec));
  return card;
}

function showTab(tab){
  activeTab = tab;
  document.querySelectorAll('.pc[data-ptab]').forEach(el => el.classList.toggle('active', el.dataset.ptab === tab));
  applyFilter();
}

function toggleItem(id, card, sec){
  if(found.has(id)){
    found.delete(id);
    delete foundDates[id];
    card.classList.remove('found');
    const dateEl = card.querySelector('.cd');
    if(dateEl) dateEl.remove();
  } else {
    found.add(id);
    foundDates[id] = Date.now();
    card.classList.add('found');
    // show date on card
    let dateEl = card.querySelector('.cd');
    if(!dateEl){ dateEl = document.createElement('div'); dateEl.className='cd'; card.appendChild(dateEl); }
    dateEl.textContent = formatDate(foundDates[id]);
  }
  save();
  updateSectionStat(sec);
  updateAllStats();
  
}

function updateSectionStat(sec){
  const total = sec.querySelectorAll('.card').length;
  const got = sec.querySelectorAll('.card.found').length;
  sec.querySelector('.sfill').style.width = (total ? got/total*100 : 0)+'%';
  sec.querySelector('.sstat').textContent = `${got} / ${total}`;
}

function updateAllStats(){
  let grand=0, grandT=0;
  TABS.forEach(tab=>{
    const items = DATA.filter(d=>d.tab===tab);
    const tot = items.length;
    const got = items.filter(d=>found.has(DATA.indexOf(d))).length;
    const pct = tot?Math.round(got/tot*100):0;
    document.getElementById(`pn-${tab}`).textContent = got;
    document.getElementById(`pt-${tab}`).textContent = tot;
    document.getElementById(`pp-${tab}`).textContent = pct+'%';
    document.getElementById(`pf-${tab}`).style.width = pct+'%';
    grand+=got; grandT+=tot;
  });
  document.getElementById('total-pct').textContent = grandT?Math.round(grand/grandT*100)+'%':'0%';
  document.getElementById('total-count').textContent = grand + ' / ' + grandT;
}

// ── CELEBRATIONS ──────────────────────────────────────────────────


function applyFilter(){
  const q = searchVal.toLowerCase().trim();
  const searching = q.length>0;
  document.body.classList.toggle('searching', searching);
  const tabSeen = new Set();
  document.querySelectorAll('.section').forEach(sec=>{
    const secTab = sec.dataset.tab;
    const divider = sec.querySelector('.search-divider');
    if(!searching && secTab !== activeTab){
      sec.classList.add('empty');
      if(divider) divider.style.display = 'none';
      return;
    }
    let anyVisible = false;
    sec.querySelectorAll('.card').forEach(card=>{
      const isFnd = found.has(+card.dataset.id);
      const cardTier = card.dataset.tier || '';
      const itemId = +card.dataset.id;
      const itemData = DATA[itemId];
      let show = true;
      // Search matches: item name OR base type OR runes OR source
      if(q) {
        const nameMatch = card.dataset.name.includes(q);
        const baseMatch = itemData.b.toLowerCase().includes(q);
        const runesMatch = itemData.runes && itemData.runes.toLowerCase().includes(q);
        const sourceMatch = itemData.src && itemData.src.toLowerCase().includes(q);
        if(!nameMatch && !baseMatch && !runesMatch && !sourceMatch) show=false;
      }
      if(activeFilter==='found' && !isFnd) show=false;
      if(activeFilter==='missing' && isFnd) show=false;
      if(activeTier !== 'all' && cardTier !== activeTier) show=false;
      card.classList.toggle('hidden',!show);
      if(show) anyVisible=true;
    });
    sec.classList.toggle('empty',!anyVisible);
    if(divider){
      if(searching && anyVisible && !tabSeen.has(secTab)){
        divider.style.display='flex';
        tabSeen.add(secTab);
      } else {
        divider.style.display='none';
      }
    }
    if(anyVisible) sec.classList.add('open');
  });
}

function clearSearch(){
  document.getElementById('search').value='';
  searchVal='';
  applyFilter();
}

// Event listeners for tier filter
document.querySelectorAll('.tier-fg .fb').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tier-fg .fb').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    activeTier = btn.dataset.tier;
    applyFilter();
  });
});

// Existing filter and search listeners
document.querySelectorAll('.pc[data-ptab]').forEach(el => el.addEventListener('click', () => showTab(el.dataset.ptab)));
document.querySelectorAll('.fg .fb').forEach(b => b.addEventListener('click',()=>{
  document.querySelectorAll('.fg .fb').forEach(x=>x.classList.remove('on'));
  b.classList.add('on'); activeFilter = b.dataset.f; applyFilter();
}));
document.getElementById('search').addEventListener('input',e=>{searchVal=e.target.value; applyFilter();});
document.getElementById('sb-clear').addEventListener('click',clearSearch);
document.addEventListener('keydown',e=>{
  if(e.key==='/' && document.activeElement!==document.getElementById('search')){ e.preventDefault(); document.getElementById('search').focus(); }
  if(e.key==='Escape'){ clearSearch(); document.getElementById('search').blur(); }
});

// Menu toggle
document.getElementById('menu-btn').addEventListener('click',(e)=>{
  e.stopPropagation();
  document.getElementById('menu-dropdown').classList.toggle('open');
});
document.addEventListener('click',()=>{
  document.getElementById('menu-dropdown').classList.remove('open');
});
document.getElementById('menu-dropdown').addEventListener('click',(e)=>{
  e.stopPropagation();
  if(e.target.classList.contains('menu-item')){
    document.getElementById('menu-dropdown').classList.remove('open');
  }
});

document.getElementById('btn-reset').addEventListener('click',()=>{
  document.getElementById('modal').classList.add('open');
  document.getElementById('reset-confirm-check').checked = false;
  document.getElementById('mc').disabled = true;
});
document.getElementById('mx').addEventListener('click',()=>document.getElementById('modal').classList.remove('open'));
document.getElementById('reset-confirm-check').addEventListener('change',(e)=>{
  document.getElementById('mc').disabled = !e.target.checked;
});
document.getElementById('mc').addEventListener('click',()=>{
  found.clear(); foundDates = {}; save();
  document.querySelectorAll('.card.found').forEach(c=>c.classList.remove('found'));
  document.querySelectorAll('.card .cd').forEach(el=>el.remove());
  
  document.querySelectorAll('.section').forEach(s=>updateSectionStat(s));
  updateAllStats();
  document.getElementById('modal').classList.remove('open');
  showToast('Progress reset');
});
document.getElementById('btn-export').addEventListener('click',()=>{
  const payload={version:2,exported:new Date().toISOString(),found:[...found].map(i=>({name:DATA[i]?.n,foundAt:foundDates[i]||null})).filter(x=>x.name)};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url; a.download=`pd2-grail-${new Date().toISOString().slice(0,10)}.json`;
  a.click(); URL.revokeObjectURL(url);
  showToast('Exported ✓');
});
document.getElementById('btn-import').addEventListener('click',()=>document.getElementById('file-input').click());
document.getElementById('file-input').addEventListener('change',e=>{
  const file=e.target.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=ev=>{
    try{
      const data=JSON.parse(ev.target.result);
      const nameToIdx={};
      DATA.forEach((item,i)=>nameToIdx[item.n]=i);
      // support v1 (array of strings) and v2 (array of {name, foundAt})
      const entries = Array.isArray(data.found) ? data.found : [];
      let imported=0;
      entries.forEach(entry=>{
        const name = typeof entry === 'string' ? entry : entry.name;
        const ts = typeof entry === 'object' ? entry.foundAt : null;
        if(nameToIdx[name]!==undefined){
          found.add(nameToIdx[name]);
          if(ts) foundDates[nameToIdx[name]] = ts;
          imported++;
        }
      });
      save();
      document.querySelectorAll('.card').forEach(card=>{
        const isFnd = found.has(+card.dataset.id);
        card.classList.toggle('found', isFnd);
        let dateEl = card.querySelector('.cd');
        if(isFnd && foundDates[+card.dataset.id]){
          if(!dateEl){ dateEl = document.createElement('div'); dateEl.className='cd'; card.appendChild(dateEl); }
          dateEl.textContent = formatDate(foundDates[+card.dataset.id]);
        } else if(dateEl) { dateEl.remove(); }
      });
      document.querySelectorAll('.section').forEach(s=>updateSectionStat(s));
      updateAllStats();
      showToast(`Imported ${imported} items ✓`);
    } catch(e){ showToast('Invalid file'); }
    e.target.value='';
  };
  reader.readAsText(file);
});

let toastTimer;
function showToast(msg, duration = 1500){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('show'), duration);
}

document.getElementById('btn-share').addEventListener('click',()=>{
  const grandT = DATA.length;
  const grandF = found.size;
  const overall = grandT ? Math.round(grandF/grandT*100) : 0;
  const tabLabels = {weapons:'Weapons',armor:'Armor',jewelry:'Jewelry',sets:'Set Items',runewords:'Runewords',runes:'Runes & Misc'};
  const tabColors = {weapons:'#f97316',armor:'#60a5fa',jewelry:'#fbbf24',sets:'#34d399',runewords:'#f87171',runes:'#fb923c'};
  const tabDimColors = {weapons:'#7c2d00',armor:'#1e3a6e',jewelry:'#6b4800',sets:'#0e5a3a',runewords:'#7f1d1d',runes:'#6b3010'};

  const tabStats = TABS.map(tab=>{
    const items = DATA.filter(d=>d.tab===tab);
    const tot = items.length;
    const got = items.filter(d=>found.has(DATA.indexOf(d))).length;
    const pct = tot ? Math.round(got/tot*100) : 0;
    return {tab, label:tabLabels[tab], got, tot, pct, color:tabColors[tab], dim:tabDimColors[tab]};
  });

  // Canvas layout
  const cols = 3, rows = 2;
  const cellW = 280, cellH = 90;
  const sideW = 120;
  const pad = 1;
  const hdrH = 40;
  const W = cols * cellW + pad * (cols-1) + sideW + pad;
  const H = rows * cellH + pad * (rows-1) + hdrH;

  const canvas = document.createElement('canvas');
  canvas.width = W * 2; canvas.height = H * 2;
  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);

  const bg1 = '#141414', bg2 = '#1a1a1a', bg3 = '#222';
  const border = '#2a2a2a';
  const textCol = '#e8e8e8', text2 = '#999', text3 = '#555';
  const orange = '#f97316';

  // Background
  ctx.fillStyle = bg1;
  ctx.fillRect(0, 0, W, H);

  // Header
  ctx.fillStyle = bg2;
  ctx.fillRect(0, 0, W, hdrH);
  ctx.fillStyle = border;
  ctx.fillRect(0, hdrH - 1, W, 1);

  // "PROJECT DIABLO 2" eyebrow
  ctx.fillStyle = orange;
  ctx.font = '600 8px DM Sans, sans-serif';
  ctx.letterSpacing = '1.5px';
  ctx.fillText('PROJECT DIABLO 2', 16, 14);
  ctx.letterSpacing = '0px';

  // "Grail" in white, "Tracker" in orange
  ctx.fillStyle = textCol;
  ctx.font = '600 16px DM Sans, sans-serif';
  ctx.fillText('Grail ', 16, 30);
  const grailW = ctx.measureText('Grail ').width;
  ctx.fillStyle = orange;
  ctx.fillText('Tracker', 16 + grailW, 30);

  // Season — right aligned in header
  const season = window.GRAIL_SEASON || '';
  ctx.fillStyle = text3;
  ctx.font = '500 10px DM Sans, monospace';
  const seasonW = ctx.measureText(season).width;
  ctx.fillText(season, W - 16 - seasonW, 30);

  // Draw each tab cell (offset by hdrH)
  tabStats.forEach((s, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const x = col * (cellW + pad);
    const y = hdrH + row * (cellH + pad);

    ctx.fillStyle = bg1;
    ctx.fillRect(x, y, cellW, cellH);

    ctx.fillStyle = text3;
    ctx.font = '600 9px DM Sans, sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText(s.label.toUpperCase(), x + 16, y + 20);
    ctx.letterSpacing = '0px';

    const barY = y + 30;
    ctx.fillStyle = bg3;
    ctx.beginPath();
    ctx.roundRect(x + 16, barY, cellW - 32, 3, 2);
    ctx.fill();

    if(s.pct > 0){
      const fillW = Math.max(4, (cellW - 32) * s.pct / 100);
      const grad = ctx.createLinearGradient(x + 16, 0, x + 16 + fillW, 0);
      grad.addColorStop(0, s.dim);
      grad.addColorStop(1, s.color);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x + 16, barY, fillW, 3, 2);
      ctx.fill();
    }

    ctx.fillStyle = s.color;
    ctx.font = '500 20px DM Mono, monospace';
    ctx.fillText(s.got, x + 16, y + 68);

    const gotW = ctx.measureText(s.got).width;
    ctx.fillStyle = text3;
    ctx.font = '400 11px DM Mono, monospace';
    ctx.fillText(` / ${s.tot}`, x + 16 + gotW + 2, y + 68);

    const pctStr = s.pct + '%';
    const pctW = ctx.measureText(pctStr).width;
    ctx.fillText(pctStr, x + cellW - 16 - pctW, y + 68);
  });

  // Overall side panel
  const sx = cols * (cellW + pad);
  ctx.fillStyle = bg1;
  ctx.fillRect(sx, hdrH, sideW, H - hdrH);

  ctx.fillStyle = textCol;
  ctx.font = '500 28px DM Mono, monospace';
  const pctText = overall + '%';
  const pctTW = ctx.measureText(pctText).width;
  ctx.fillText(pctText, sx + (sideW - pctTW) / 2, hdrH + (H - hdrH)/2 - 4);

  ctx.fillStyle = text3;
  ctx.font = '400 11px DM Mono, monospace';
  const countText = `${grandF} / ${grandT}`;
  const countW = ctx.measureText(countText).width;
  ctx.fillText(countText, sx + (sideW - countW) / 2, hdrH + (H - hdrH)/2 + 14);

  ctx.fillStyle = text3;
  ctx.font = '600 9px DM Sans, sans-serif';
  ctx.letterSpacing = '1px';
  const ovW = ctx.measureText('OVERALL').width;
  ctx.fillText('OVERALL', sx + (sideW - ovW) / 2, hdrH + (H - hdrH)/2 + 30);
  ctx.letterSpacing = '0px';

  // Border lines
  ctx.fillStyle = border;
  for(let c = 1; c < cols; c++) ctx.fillRect(c*(cellW+pad)-pad, hdrH, pad, H - hdrH);
  for(let r = 1; r < rows; r++) ctx.fillRect(0, hdrH + r*(cellH+pad)-pad, cols*(cellW+pad)-pad, pad);
  ctx.fillRect(sx - pad, hdrH, pad, H - hdrH);

  // Download
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pd2-grail-${new Date().toISOString().slice(0,10)}.png`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Image saved ✓');
  });
});

buildUI();
// Test celebration buttons
document.getElementById('test-lvl1')?.addEventListener('click', () => {
  launchConfetti(50);
  showToast('?? Charms complete!', 2000);
});
document.getElementById('test-lvl2')?.addEventListener('click', () => {
  const tab = 'jewelry';
  flashTab(tab);
  setTimeout(() => launchConfetti(150), 200);
  showToast('?? Jewelry COMPLETE! ??', 3500);
});
document.getElementById('test-lvl3')?.addEventListener('click', () => {
  GRAIL_COMPLETE();
});
document.querySelectorAll('.section').forEach(s=>updateSectionStat(s));

// ═══════════════════════════════