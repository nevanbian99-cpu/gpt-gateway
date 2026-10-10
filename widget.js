(() => {
  if (window.__gptWidget) return; window.__gptWidget = 1;
  const SID = window.__GPT_SID; if (!SID) return;
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:2147483647';
  document.body.appendChild(host);
  const root = host.attachShadow({ mode: 'open' });

  const ic = {
    robot: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4M9 13v1M15 13v1M9 17h6"/><circle cx="12" cy="3" r="1"/></svg>',
    chat: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l.9-4.6A8 8 0 1 1 21 12z"/></svg>',
    spark: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z"/></svg>'
  };

  root.innerHTML = `<style>
  *{box-sizing:border-box;font-family:system-ui,sans-serif}
  .fab{width:58px;height:58px;border-radius:50%;border:0;background:#4f46e5;cursor:pointer;display:grid;place-items:center;box-shadow:0 6px 20px #0005;margin-left:auto}
  .panel{display:none;flex-direction:column;gap:10px;width:270px;margin-bottom:12px;padding:12px;background:#fff;color:#1b1f3b;border-radius:16px;box-shadow:0 10px 30px #0004}
  .panel.open{display:flex}
  .opt{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;padding:12px 14px;border:0;border-radius:12px;background:#eef0f7;color:#1b1f3b;font-weight:700;font-size:14px;cursor:pointer;text-align:left}
  .opt:hover{background:#e0e3f6}
  .sq{width:32px;height:32px;border-radius:8px;background:#4f46e5;display:grid;place-items:center;flex:none}
  .view{display:none;flex-direction:column;gap:8px}
  .view.open{display:flex}
  .bar{display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:14px}
  .bar button{border:0;background:none;cursor:pointer;color:#4f46e5;font-weight:700}
  .log{height:260px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:13px;line-height:1.45}
  .m{padding:8px 10px;border-radius:10px;max-width:92%;white-space:pre-wrap;word-break:break-word}
  .u{background:#4f46e5;color:#fff;align-self:flex-end}.a{background:#eef0f7}
  .row{display:flex;gap:6px}
  .row input{flex:1;padding:9px 10px;border:1px solid #d9dcee;border-radius:10px;font-size:13px}
  .row button{border:0;background:#4f46e5;color:#fff;border-radius:10px;padding:0 12px;cursor:pointer}
  </style>
  <div class="panel" id="panel">
    <div class="view open" id="menu">
      <button class="opt" id="oChat">Buka Chat Gpt<span class="sq">${ic.chat}</span></button>
      <button class="opt" id="oAuto">Menjawab Pertanyaan otomatis<span class="sq">${ic.spark}</span></button>
    </div>
    <div class="view" id="chat">
      <div class="bar"><span>Chat GPT</span><button data-back>Kembali</button></div>
      <div class="log" id="clog"></div>
      <div class="row"><input id="cin" placeholder="Tulis pesan..."><button id="csend">Kirim</button></div>
    </div>
    <div class="view" id="auto">
      <div class="bar"><span>Jawaban otomatis</span><button data-back>Kembali</button></div>
      <div class="log" id="alog"></div>
      <button class="opt" id="again" style="justify-content:center">Jawab ulang halaman ini</button>
    </div>
  </div>
  <button class="fab" id="fab" aria-label="Asisten">${ic.robot}</button>`;

  const $ = id => root.getElementById(id);
  const show = id => root.querySelectorAll('.view').forEach(v => v.classList.toggle('open', v.id === id));
  const add = (log, cls, t) => { const d = document.createElement('div'); d.className = 'm ' + cls; d.textContent = t; log.appendChild(d); log.scrollTop = 1e9; return d; };
  const post = async (url, data) => { const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ apiKey: sessionStorage.getItem('k'), model: sessionStorage.getItem('m'), ...data }) }); const j = await r.json(); if (!r.ok) throw new Error(j.error); return j.reply; };

  $('fab').onclick = () => $('panel').classList.toggle('open');
  root.querySelectorAll('[data-back]').forEach(b => b.onclick = () => show('menu'));
  $('oChat').onclick = () => { show('chat'); if (!$('clog').children.length) add($('clog'), 'a', 'Halo! Ada yang bisa dibantu?'); };

  const history = [];
  const send = async () => {
    const t = $('cin').value.trim(); if (!t) return; $('cin').value = '';
    add($('clog'), 'u', t); history.push({ role: 'user', content: t });
    const w = add($('clog'), 'a', '...');
    try { const r = await post('/api/chat', { messages: history }); history.push({ role: 'assistant', content: r }); w.textContent = r; }
    catch (e) { w.textContent = 'Error: ' + e.message; }
  };
  $('csend').onclick = send; $('cin').onkeydown = e => e.key === 'Enter' && send();

  const answer = async () => {
    show('auto'); $('alog').innerHTML = '';
    const w = add($('alog'), 'a', 'Membaca halaman dan meminta jawaban dari ChatGPT...');
    const text = (document.body.innerText || '').replace(/\n{3,}/g, '\n\n');
    try { w.textContent = await post('/api/answer', { text }); }
    catch (e) { w.textContent = 'Error: ' + e.message; }
  };
  $('oAuto').onclick = answer; $('again').onclick = answer;
})();
