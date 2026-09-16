// Builds the self-contained viewer page for an exported shield. Everything is
// inline (styles, script, document JSON) and media uses relative assets/
// paths, so the folder presents from file:// with zero internet and no server.
// The viewer is deliberately dependency-free vanilla JS: it must outlive the
// app that made it.

import type { ShieldDocument } from '../../types/shield'
import type { SchoolConfig } from '../../config/schema'

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function buildViewerHtml(doc: ShieldDocument, config: SchoolConfig): string {
  // Guard against </script> termination inside the embedded JSON.
  const docJson = JSON.stringify(doc).replace(/</g, '\\u003c')
  const c = config.colors

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(doc.studentName)} — The Shield</title>
<style>
  :root { --p:${c.primary}; --s:${c.secondary}; --a:${c.accent}; --bg:${c.background}; --fg:${c.foreground}; }
  * { box-sizing: border-box; }
  html, body { height: 100%; margin: 0; }
  body { background: var(--bg); color: var(--fg); font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; overflow: hidden; }
  .screen { position: fixed; inset: 0; }
  [hidden] { display: none !important; }

  /* ---------- title screen ---------- */
  #montage { position: absolute; inset: 0; overflow: hidden; background: radial-gradient(900px 500px at 50% 20%, color-mix(in srgb, var(--s) 50%, transparent), transparent), var(--bg); }
  #montage .frame { position: absolute; inset: 0; opacity: 0; transition: opacity 1.6s ease; filter: blur(14px) saturate(1.1); transform: scale(1.12); }
  #montage .frame.on { opacity: .35; }
  #montage img, #montage video { width: 100%; height: 100%; object-fit: cover; }
  #montage::after { content:''; position:absolute; inset:0; background: linear-gradient(to top, rgba(0,0,0,.7), transparent 40%, rgba(0,0,0,.5)); }

  #hero { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; }
  #bigname { margin: 34px 0 0; font-size: clamp(40px, 9vw, 96px); font-weight: 900; letter-spacing: .02em;
    background: linear-gradient(180deg, var(--fg), var(--p)); -webkit-background-clip: text; background-clip: text; color: transparent;
    text-shadow: 0 1px 0 rgba(255,255,255,.08); animation: floaty 5s ease-in-out infinite; position: relative; z-index: 3; }
  #bigname::before { content: attr(data-name); position: absolute; left: 2px; top: 4px; z-index: -1; color: transparent;
    background: none; -webkit-text-fill-color: color-mix(in srgb, var(--s) 55%, black); filter: blur(1px); }
  @keyframes floaty { 0%,100% { transform: translateY(0) rotate(-.4deg);} 50% { transform: translateY(-8px) rotate(.4deg);} }

  #cutout-wrap { position: absolute; inset: 130px 0 0 0; display: flex; align-items: flex-end; justify-content: center; }
  #cutout { max-height: 62vh; max-width: 80vw; transform-origin: 50% 100%; filter: drop-shadow(0 0 40px rgba(0,0,0,.6)); }

  #bottom { position: absolute; left: 0; right: 0; bottom: 40px; display: flex; flex-direction: column; align-items: center; gap: 22px; z-index: 3; }
  #badge { display: inline-flex; align-items: center; gap: 8px; border: 1px solid color-mix(in srgb, var(--a) 50%, transparent);
    background: rgba(0,0,0,.4); padding: 6px 20px; border-radius: 999px; color: var(--a); font-weight: 700; letter-spacing: .3em; font-size: 14px; }
  #badge i { width: 6px; height: 6px; border-radius: 999px; background: var(--a); }
  #start { font: inherit; cursor: pointer; border: 2px solid var(--p); color: var(--p); background: rgba(0,0,0,.5);
    padding: 16px 48px; border-radius: 999px; font-size: 20px; font-weight: 900; letter-spacing: .35em; animation: pulse 1.6s ease-in-out infinite; }
  #start:hover { background: var(--p); color: #000; }
  @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--p) 45%, transparent);} 50% { box-shadow: 0 0 32px 4px color-mix(in srgb, var(--p) 35%, transparent); opacity:.85;} }

  /* ---------- shield view ---------- */
  #shield { display: flex; flex-direction: column; }
  #topbar { display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,.1); background: rgba(0,0,0,.4); }
  #topbar button { font: inherit; cursor: pointer; background: none; border: 1px solid rgba(255,255,255,.25); color: rgba(255,255,255,.7); border-radius: 8px; padding: 6px 12px; font-size: 13px; }
  #topbar button:hover { background: rgba(255,255,255,.1); }
  #stage { flex: 1; min-height: 0; position: relative; overflow: hidden; }

  .card { overflow: hidden; border-radius: 12px; border: 1px solid rgba(255,255,255,.1); background: rgba(0,0,0,.3); break-inside: avoid; margin-bottom: 20px; }
  .card img, .card video { width: 100%; height: 176px; object-fit: cover; display: block; }
  .card.lg img, .card.lg video { height: 300px; }
  .card figcaption { padding: 8px 12px; font-size: 14px; color: rgba(255,255,255,.8); display: flex; gap: 8px; align-items: center; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; padding: 32px 48px; overflow-y: auto; height: 100%; }
  .empty { display: flex; height: 100%; align-items: center; justify-content: center; color: rgba(255,255,255,.45); }

  .room { position: absolute; inset: 0; display: flex; flex-direction: column; transition: opacity .48s ease, transform .48s ease; }
  .room.out { opacity: 0; transform: scale(1.12); }
  .room h2 { text-align: center; margin: 34px 0 0; font-size: 34px; font-weight: 900; }
  .room .wall { flex: 1; min-height: 0; overflow-y: auto; }
  .doors { display: flex; justify-content: center; gap: 16px; padding: 14px 0 22px; }
  .door { display: flex; flex-direction: column; align-items: center; gap: 5px; background: none; border: none; cursor: pointer; color: rgba(255,255,255,.55); font: inherit; font-size: 11px; font-weight: 600; }
  .door span { display: flex; width: 56px; height: 80px; border-radius: 28px 28px 0 0; border: 2px solid; align-items: flex-end; justify-content: center; padding-bottom: 8px; font-size: 22px; transition: transform .3s; }
  .door:hover span { transform: translateY(-6px); }

  .tl { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 34px; height: 100%; padding: 0 40px; }
  .tl .stagecard { width: 100%; max-width: 680px; animation: tlin .5s ease; }
  @keyframes tlin { from { opacity: 0; transform: translateX(24px);} }
  .tl .track { display: flex; align-items: center; gap: 12px; width: 100%; max-width: 760px; }
  .tl .rail { position: relative; height: 4px; flex: 1; border-radius: 4px; background: rgba(255,255,255,.1); }
  .tl .dot { position: absolute; top: 50%; width: 14px; height: 14px; border-radius: 999px; border: 2px solid; transform: translate(-50%,-50%); background: var(--bg); cursor: pointer; }
  .tl button.play { font: inherit; cursor: pointer; background: none; border: 1px solid rgba(255,255,255,.25); color: rgba(255,255,255,.7); border-radius: 999px; padding: 6px 16px; font-size: 13px; }

  .scrolly { height: 100%; overflow-y: auto; scroll-behavior: smooth; }
  .scrolly section { min-height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 26px; padding: 60px 64px; }
  .scrolly h3 { font-size: 44px; font-weight: 900; margin: 0; }
  .scrolly .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }

  .story { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 28px; height: 100%; padding: 0 40px; }
  .story .page { width: 100%; max-width: 680px; border: 1px solid rgba(255,255,255,.1); border-radius: 16px; background: rgba(255,255,255,.04); padding: 28px; }
  .story nav { display: flex; gap: 20px; align-items: center; }
  .story nav button { font: inherit; cursor: pointer; background: none; border: 1px solid rgba(255,255,255,.25); color: rgba(255,255,255,.7); border-radius: 999px; padding: 8px 20px; }
  .story nav button:disabled { opacity: .3; }

  @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
</style>
</head>
<body>
  <div id="title" class="screen">
    <div id="montage"></div>
    <div id="hero">
      <h1 id="bigname"></h1>
      <div id="cutout-wrap"><img id="cutout" alt="" /></div>
      <div id="bottom">
        <span id="badge"><i></i><span id="year"></span><i></i></span>
        <button id="start">PRESS&nbsp;START</button>
      </div>
    </div>
  </div>
  <div id="shield" class="screen" hidden>
    <div id="topbar">
      <button id="back">&larr; Title screen</button>
      <strong id="tplname" style="font-size:14px"></strong>
    </div>
    <div id="stage"></div>
  </div>

<script type="application/json" id="doc">${docJson}</script>
<script>
'use strict';
var DOC = JSON.parse(document.getElementById('doc').textContent);
var SUBJECTS = { math:{label:'Math',icon:'\\u00f7',hue:'#38bdf8'}, science:{label:'Science',icon:'\\u269b',hue:'#4ade80'},
  art:{label:'Art',icon:'\\u270e',hue:'#f472b6'}, history:{label:'History',icon:'\\u29d7',hue:'#fbbf24'},
  reading:{label:'Reading',icon:'\\u00b6',hue:'#c084fc'}, life:{label:'My Life',icon:'\\u2600',hue:'#fb923c'} };
var VIBES = { cool:[1.2,.15,3,.3,.008,.22,-1.5], tough:[.4,.12,1.5,.25,.016,.18,0], cute:[2,.35,5,.55,.01,.4,2.5],
  confident:[.8,.18,2.5,.28,.012,.25,0], playful:[2.6,.5,7,.7,.012,.5,1] };

/* ---------- title screen ---------- */
document.getElementById('bigname').textContent = DOC.studentName.toUpperCase();
document.getElementById('bigname').setAttribute('data-name', DOC.studentName.toUpperCase());
document.getElementById('year').textContent = ${JSON.stringify(config.schoolYear)};
var ch = DOC.character;
if (ch && ch.cutoutUrl) document.getElementById('cutout').src = ch.cutoutUrl;

// idle rig
(function () {
  if (!ch) return;
  var el = document.getElementById('cutout');
  var p = VIBES[ch.vibe] || VIBES.confident;
  var phase = Math.random() * 6.28;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.style.transform = 'rotate(' + p[6] + 'deg)'; return; }
  (function tick() {
    var t = performance.now() / 1000;
    var sway = p[0] * Math.sin(6.283 * p[1] * t + phase);
    var bob = p[2] * Math.sin(6.283 * p[3] * t + phase * .7);
    var br = 1 + p[4] * Math.sin(6.283 * p[5] * t + phase * 1.3);
    el.style.transform = 'translateY(' + bob.toFixed(2) + 'px) rotate(' + (p[6] + sway).toFixed(3) + 'deg) scaleY(' + br.toFixed(4) + ')';
    requestAnimationFrame(tick);
  })();
})();

// montage
(function () {
  var urls = (ch && ch.montageUrls) || [];
  if (!urls.length) return;
  var host = document.getElementById('montage');
  var frames = urls.map(function (u) {
    var f = document.createElement('div'); f.className = 'frame';
    var m = /\\.(mp4|webm|mov)$/i.test(u) ? document.createElement('video') : document.createElement('img');
    if (m.tagName === 'VIDEO') { m.muted = true; m.loop = true; m.autoplay = true; m.playsInline = true; }
    m.src = u; f.appendChild(m); host.appendChild(f); return f;
  });
  var i = 0; frames[0].classList.add('on');
  if (frames.length > 1) setInterval(function () {
    frames[i].classList.remove('on'); i = (i + 1) % frames.length; frames[i].classList.add('on');
  }, 6000);
})();

document.getElementById('start').onclick = function () {
  document.getElementById('title').hidden = true;
  document.getElementById('shield').hidden = false;
  renderShield();
};
document.getElementById('back').onclick = function () {
  document.getElementById('shield').hidden = true;
  document.getElementById('title').hidden = false;
};

/* ---------- shield templates ---------- */
function card(a, lg) {
  var fig = document.createElement('figure'); fig.className = 'card' + (lg ? ' lg' : ''); fig.style.margin = 0;
  var s = SUBJECTS[a.subject] || SUBJECTS.life;
  if (a.kind === 'image' && a.url) { var i = document.createElement('img'); i.src = a.url; i.alt = a.caption; fig.appendChild(i); }
  else if (a.kind === 'video' && a.url) { var v = document.createElement('video'); v.src = a.url; v.controls = true; v.muted = true; fig.appendChild(v); }
  else if (a.kind === 'audio' && a.url) { var au = document.createElement('audio'); au.src = a.url; au.controls = true; au.style.margin = '20px'; fig.appendChild(au); }
  var cap = document.createElement('figcaption');
  var ic = document.createElement('span'); ic.style.color = s.hue; ic.textContent = s.icon;
  var tx = document.createElement('span'); tx.textContent = a.caption || s.label;
  cap.appendChild(ic); cap.appendChild(tx); fig.appendChild(cap);
  return fig;
}
function empty(stage, note) { var d = document.createElement('div'); d.className = 'empty'; d.textContent = note; stage.appendChild(d); }

var ROOMS = [
  { id:'hall', name:'Entry Hall', subject:null, icon:'\\u2302', wa:'#101a2b', wb:'#1c2a44', ac:'#22d3ee', fl:'#0a1120' },
  { id:'math', name:'Math Room', subject:'math', icon:'\\u00f7', wa:'#0c1f2e', wb:'#123a52', ac:'#38bdf8', fl:'#081521' },
  { id:'science', name:'Science Lab', subject:'science', icon:'\\u269b', wa:'#0d2417', wb:'#14402a', ac:'#4ade80', fl:'#081a10' },
  { id:'art', name:'Art Studio', subject:'art', icon:'\\u270e', wa:'#2a1220', wb:'#471f38', ac:'#f472b6', fl:'#1d0c16' },
  { id:'history', name:'History Field', subject:'history', icon:'\\u29d7', wa:'#261c0b', wb:'#453413', ac:'#fbbf24', fl:'#1a1307' },
  { id:'reading', name:'Reading Nook', subject:'reading', icon:'\\u00b6', wa:'#1d1230', wb:'#332052', ac:'#c084fc', fl:'#140b22' }
];

function renderMansion(stage) {
  function show(id) {
    var r = ROOMS.find(function (x) { return x.id === id; }) || ROOMS[0];
    var room = document.createElement('div'); room.className = 'room out';
    room.style.background = 'linear-gradient(180deg,' + r.wb + ' 0%,' + r.wa + ' 62%,' + r.fl + ' 62.5%, #000 130%)';
    var h = document.createElement('h2'); h.textContent = r.icon + '  ' + r.name; h.style.color = '#fff'; room.appendChild(h);
    var wall = document.createElement('div'); wall.className = 'wall';
    var items = r.subject ? DOC.artifacts.filter(function (a) { return a.subject === r.subject; }) : DOC.artifacts;
    if (!items.length) { empty(wall, r.subject ? 'Nothing on these walls yet.' : 'Welcome to my mansion.'); }
    else { var g = document.createElement('div'); g.className = 'grid'; items.forEach(function (a) { g.appendChild(card(a)); }); wall.appendChild(g); }
    room.appendChild(wall);
    var doors = document.createElement('nav'); doors.className = 'doors';
    ROOMS.filter(function (x) { return x.id !== id; }).forEach(function (x) {
      var b = document.createElement('button'); b.className = 'door';
      var sp = document.createElement('span'); sp.textContent = x.icon;
      sp.style.borderColor = x.ac; sp.style.color = x.ac; sp.style.background = 'linear-gradient(180deg,' + x.wb + ',' + x.wa + ')';
      b.appendChild(sp); b.appendChild(document.createTextNode(x.name));
      b.onclick = function () { room.classList.add('out'); setTimeout(function () { stage.innerHTML = ''; show(x.id); }, 480); };
      doors.appendChild(b);
    });
    room.appendChild(doors);
    stage.appendChild(room);
    requestAnimationFrame(function () { requestAnimationFrame(function () { room.classList.remove('out'); }); });
  }
  show('hall');
}

function renderTimeline(stage) {
  var items = DOC.artifacts.slice().sort(function (a, b) { return a.createdAt < b.createdAt ? -1 : 1; });
  if (!items.length) return empty(stage, 'Nothing on my timeline yet.');
  var idx = 0, timer = null;
  var wrap = document.createElement('div'); wrap.className = 'tl'; stage.appendChild(wrap);
  function draw() {
    wrap.innerHTML = '';
    var a = items[idx], s = SUBJECTS[a.subject] || SUBJECTS.life;
    var sc = document.createElement('div'); sc.className = 'stagecard';
    var date = document.createElement('p'); date.style.cssText = 'color:rgba(255,255,255,.4);font-size:14px;margin:0 0 8px';
    date.textContent = new Date(a.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) + '  \\u00b7  ' + s.label;
    sc.appendChild(date); sc.appendChild(card(a, true)); wrap.appendChild(sc);
    var track = document.createElement('div'); track.className = 'track';
    var play = document.createElement('button'); play.className = 'play'; play.textContent = timer ? 'Pause' : 'Play my year';
    play.onclick = function () { if (timer) { clearInterval(timer); timer = null; } else { timer = setInterval(next, 4000); } draw(); };
    track.appendChild(play);
    var rail = document.createElement('div'); rail.className = 'rail';
    items.forEach(function (x, i) {
      var d = document.createElement('button'); d.className = 'dot'; var ss = SUBJECTS[x.subject] || SUBJECTS.life;
      d.style.left = (items.length === 1 ? 50 : (i / (items.length - 1)) * 100) + '%';
      d.style.borderColor = ss.hue; if (i === idx) d.style.background = ss.hue;
      d.onclick = function () { idx = i; if (timer) { clearInterval(timer); timer = null; } draw(); };
      rail.appendChild(d);
    });
    track.appendChild(rail);
    var n = document.createElement('span'); n.style.cssText = 'color:rgba(255,255,255,.4);font-size:14px'; n.textContent = (idx + 1) + '/' + items.length;
    track.appendChild(n); wrap.appendChild(track);
  }
  function next() { if (idx + 1 < items.length) { idx++; draw(); } else { clearInterval(timer); timer = null; draw(); } }
  draw();
}

function renderScroll(stage) {
  var host = document.createElement('div'); host.className = 'scrolly'; stage.appendChild(host);
  var opening = document.createElement('section');
  var t = document.createElement('h3'); t.style.fontSize = '56px'; t.textContent = DOC.studentName + "'s Year";
  var sub = document.createElement('p'); sub.style.color = 'rgba(255,255,255,.5)'; sub.textContent = 'Scroll to travel through it.';
  opening.style.alignItems = 'center'; opening.style.textAlign = 'center';
  opening.appendChild(t); opening.appendChild(sub); host.appendChild(opening);
  if (!DOC.artifacts.length) { var e = document.createElement('section'); e.className = 'empty'; e.textContent = 'The story starts soon.'; host.appendChild(e); return; }
  Object.keys(SUBJECTS).forEach(function (sub2) {
    var items = DOC.artifacts.filter(function (a) { return a.subject === sub2; });
    if (!items.length) return;
    var s = SUBJECTS[sub2];
    var sec = document.createElement('section');
    sec.style.background = 'radial-gradient(800px 400px at 15% 20%, color-mix(in srgb,' + s.hue + ' 16%, transparent), transparent)';
    var h = document.createElement('h3'); h.textContent = s.icon + '  ' + s.label; sec.appendChild(h);
    var g = document.createElement('div'); g.className = 'cards';
    items.forEach(function (a) { g.appendChild(card(a)); }); sec.appendChild(g); host.appendChild(sec);
  });
}

function renderStory(stage) {
  var items = DOC.artifacts;
  if (!items.length) return empty(stage, 'Every page of this story is a piece of my work.');
  var idx = 0;
  var wrap = document.createElement('div'); wrap.className = 'story'; stage.appendChild(wrap);
  function draw() {
    wrap.innerHTML = '';
    var a = items[idx], s = SUBJECTS[a.subject] || SUBJECTS.life;
    var page = document.createElement('div'); page.className = 'page';
    var ch2 = document.createElement('p'); ch2.style.cssText = 'margin:0 0 10px;font-size:14px;color:' + s.hue;
    ch2.textContent = 'Chapter ' + (idx + 1) + ' \\u00b7 ' + s.label;
    page.appendChild(ch2); page.appendChild(card(a, true)); wrap.appendChild(page);
    var nav = document.createElement('nav');
    var back = document.createElement('button'); back.textContent = '\\u2190 Back'; back.disabled = idx === 0;
    back.onclick = function () { idx--; draw(); };
    var num = document.createElement('span'); num.style.cssText = 'color:rgba(255,255,255,.4);font-size:14px';
    num.textContent = 'Page ' + (idx + 1) + ' of ' + items.length;
    var fwd = document.createElement('button'); fwd.textContent = 'Next \\u2192'; fwd.disabled = idx >= items.length - 1;
    fwd.onclick = function () { idx++; draw(); };
    nav.appendChild(back); nav.appendChild(num); nav.appendChild(fwd); wrap.appendChild(nav);
  }
  document.addEventListener('keydown', function (e) {
    if (document.getElementById('shield').hidden) return;
    if (e.key === 'ArrowRight' && idx < items.length - 1) { idx++; draw(); }
    if (e.key === 'ArrowLeft' && idx > 0) { idx--; draw(); }
  });
  draw();
}

function renderGrid(stage) {
  if (!DOC.artifacts.length) return empty(stage, 'My shield is just getting started.');
  var g = document.createElement('div'); g.className = 'grid';
  DOC.artifacts.forEach(function (a) { g.appendChild(card(a)); });
  stage.appendChild(g);
}

var RENDERERS = { mansion: renderMansion, timeline: renderTimeline, scroll: renderScroll, story: renderStory, blank: renderGrid, world: renderGrid };
var NAMES = { mansion: 'The Mansion', timeline: 'Timeline', scroll: 'Cinematic Scroll', story: 'Storybook', blank: 'Blank Canvas', world: '3D World' };

function renderShield() {
  var stage = document.getElementById('stage'); stage.innerHTML = '';
  var id = DOC.template && RENDERERS[DOC.template] ? DOC.template : 'blank';
  document.getElementById('tplname').textContent = NAMES[id];
  RENDERERS[id](stage);
}
</script>
</body>
</html>
`
}
