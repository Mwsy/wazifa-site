// الصفحة الرئيسية: بحث، فلاتر، ترتيب، صفحات، تنبيهات البحث المحفوظ
(async () => {
  const $ = s => document.querySelector(s);
  const grid = $('#grid'), count = $('#count'), pager = $('#pager');
  const q = new URLSearchParams(location.search);
  const state = { q: q.get('q') || '', cat: q.get('cat') || '', city: q.get('city') || '', company: q.get('company') || '', open: q.has('open') ? q.get('open') !== '0' : q.get('scope') !== 'all', sort: 'new', page: +(q.get('page') || 1), scope: q.get('scope') || 'recent', saved: q.get('saved') === '1' };
  const PER = 24;
  let recent = [], all = null, jobs = [];
  const load = async f => (await fetch(W.ROOT + 'data/' + f, { cache: 'no-cache' })).json();
  recent = await load('recent.json');
  const meta = await load('meta.json');
  // فلاتر
  const fill = (sel, list, cur) => { const s = $(sel); if (!s) return; s.innerHTML = '<option value="">الكل</option>' + list.map(v => `<option ${v === cur ? 'selected' : ''}>${W.esc(v)}</option>`).join(''); };
  fill('#f-cat', meta.categories, state.cat); fill('#f-city', meta.cities, state.city);
  $('#q').value = state.q; $('#f-company').value = state.company; $('#f-open').checked = state.open;
  $('#f-scope').value = state.scope; $('#f-sort').value = state.sort;
  const ensureAll = async () => { if (!all) { grid.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>'; all = await load('all.json'); } return all; };
  const norm = s => (s || '').toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[ًٌٍَُِّْ]/g, '');
  const apply = async () => {
    let src = recent;
    if (state.saved) { src = await ensureAll(); const s = W.saved(); src = src.filter(j => s.includes(j.id)); }
    else if (state.scope === 'all' || state.q || state.company) src = await ensureAll();
    const nq = norm(state.q), nc = norm(state.company);
    jobs = src.filter(j => (!state.cat || j.category === state.cat) && (!state.city || (j.location || '').includes(state.city)) && (!nq || norm(j.title + ' ' + j.company + ' ' + j.category).includes(nq)) && (!nc || norm(j.company).includes(nc)) && (!state.open || state.saved || W.daysLeft(j.validThrough, j.datePosted) === null || W.daysLeft(j.validThrough, j.datePosted) >= 0));
    if (state.sort === 'deadline') jobs.sort((a, b) => (a.validThrough || '9') > (b.validThrough || '9') ? 1 : -1); else jobs.sort((a, b) => a.datePosted < b.datePosted ? 1 : -1);
    render();
  };
  const render = () => {
    const pages = Math.max(1, Math.ceil(jobs.length / PER)); state.page = Math.min(state.page, pages);
    const slice = jobs.slice((state.page - 1) * PER, state.page * PER);
    count.textContent = `${jobs.length.toLocaleString('en')} وظيفة`;
    grid.innerHTML = slice.length ? slice.map(W.card).join('') : `<div class="empty" style="grid-column:1/-1">لا توجد نتائج مطابقة. جرّب توسيع البحث إلى <button class="btn sm soft" onclick="document.querySelector('#f-scope').value='all';document.querySelector('#f-scope').dispatchEvent(new Event('change'))">كل الأرشيف</button></div>`;
    W.updateSaveButtons();
    let h = ''; const win = [...new Set([1, pages, state.page - 1, state.page, state.page + 1, state.page + 2].filter(p => p >= 1 && p <= pages))].sort((a, b) => a - b);
    win.forEach((p, i) => { if (i && p - win[i - 1] > 1) h += '<span>…</span>'; h += `<button class="${p === state.page ? 'on' : ''}" data-p="${p}">${p}</button>`; });
    pager.innerHTML = pages > 1 ? h : '';
    const u = new URL(location); ['q', 'cat', 'city', 'company'].forEach(k => state[k] ? u.searchParams.set(k, state[k]) : u.searchParams.delete(k)); u.searchParams.set('open', state.open ? '1' : '0'); state.scope === 'all' ? u.searchParams.set('scope', 'all') : u.searchParams.delete('scope'); state.page > 1 ? u.searchParams.set('page', state.page) : u.searchParams.delete('page'); history.replaceState(null, '', u);
  };
  pager.onclick = e => { const b = e.target.closest('[data-p]'); if (b) { state.page = +b.dataset.p; render(); window.scrollTo({ top: grid.offsetTop - 90, behavior: 'smooth' }); } };
  const bind = (sel, key, ev = 'change', fn = v => v) => $(sel).addEventListener(ev, e => { state[key] = fn(e.target.type === 'checkbox' ? e.target.checked : e.target.value); state.page = 1; apply(); });
  bind('#f-cat', 'cat'); bind('#f-city', 'city'); bind('#f-open', 'open'); $('#f-scope').addEventListener('change', e => { state.scope = e.target.value; if (state.scope === 'all') { state.open = false; $('#f-open').checked = false; } state.page = 1; apply(); }); bind('#f-sort', 'sort');
  let t; $('#q').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value.trim(); state.page = 1; apply(); }, 300); });
  $('#f-company').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { state.company = e.target.value.trim(); state.page = 1; apply(); }, 300); });
  $('#search-form').addEventListener('submit', e => { e.preventDefault(); state.q = $('#q').value.trim(); state.page = 1; apply(); window.scrollTo({ top: grid.offsetTop - 90, behavior: 'smooth' }); });
  document.querySelectorAll('.quick .chip').forEach(c => c.onclick = () => { const { cat, city, q: qq } = c.dataset; if (cat !== undefined) { state.cat = cat; $('#f-cat').value = cat; } if (city !== undefined) { state.city = city; $('#f-city').value = city; } if (qq !== undefined) { state.q = qq; $('#q').value = qq; } state.page = 1; apply(); window.scrollTo({ top: grid.offsetTop - 90, behavior: 'smooth' }); });
  $('#reset').onclick = () => { Object.assign(state, { q: '', cat: '', city: '', company: '', open: true, page: 1, scope: 'recent', saved: false }); $('#q').value = ''; $('#f-cat').value = ''; $('#f-city').value = ''; $('#f-company').value = ''; $('#f-open').checked = true; $('#f-scope').value = 'recent'; apply(); };
  // تنبيهات البحث المحفوظ
  const alerts = W.LS('alerts') || [];
  const renderAlerts = () => { const box = $('#alerts'); if (!box) return; box.innerHTML = alerts.length ? alerts.map((a, i) => `<span class="chip on" title="اضغط لتطبيق التنبيه" data-i="${i}">🔔 ${W.esc(a.q || a.cat || a.city)} <b style="cursor:pointer" data-del="${i}">✕</b></span>`).join('') : '<span style="color:var(--muted);font-size:.9rem">لا توجد تنبيهات بعد. احفظ بحثك الحالي ليظهر لك عدد الوظائف الجديدة المطابقة في كل زيارة.</span>'; };
  $('#save-alert').onclick = () => { if (!state.q && !state.cat && !state.city) return W.toast('اكتب كلمة بحث أو اختر قسماً/مدينة أولاً'); alerts.unshift({ q: state.q, cat: state.cat, city: state.city, seen: new Date().toISOString() }); W.LS('alerts', alerts.slice(0, 10)); renderAlerts(); W.toast('🔔 تم حفظ التنبيه'); };
  $('#alerts').onclick = e => { const d = e.target.closest('[data-del]'); if (d) { alerts.splice(+d.dataset.del, 1); W.LS('alerts', alerts); renderAlerts(); return; } const c = e.target.closest('[data-i]'); if (c) { const a = alerts[+c.dataset.i]; Object.assign(state, { q: a.q, cat: a.cat, city: a.city, page: 1 }); $('#q').value = a.q; $('#f-cat').value = a.cat; $('#f-city').value = a.city; a.seen = new Date().toISOString(); W.LS('alerts', alerts); apply(); } };
  renderAlerts();
  // عدد الجديد منذ آخر زيارة
  const last = W.LS('lastVisit'); if (last) { const n = recent.filter(j => j.datePosted > last).length; if (n) { const b = $('#newbar'); b.classList.remove('hidden'); b.innerHTML = `✨ <b>${n}</b> وظيفة جديدة منذ زيارتك الأخيرة` + alerts.map(a => { const m = recent.filter(j => j.datePosted > a.seen && (!a.q || norm(j.title + j.company).includes(norm(a.q))) && (!a.cat || j.category === a.cat) && (!a.city || (j.location || '').includes(a.city))).length; return m ? ` · 🔔 <b>${m}</b> تطابق تنبيه «${W.esc(a.q || a.cat || a.city)}»` : ''; }).join(''); } }
  W.LS('lastVisit', new Date().toISOString());
  apply();
})();
