// مشترك: الوضع الليلي، المحفوظات، التنبيهات، الأدوات المساعدة
window.W = (() => {
  const LS = (k, v) => { try { if (v === undefined) return JSON.parse(localStorage.getItem(k)); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } };
  const root = document.documentElement;
  const theme = LS('theme') || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
  root.dataset.theme = theme;
  const toggleTheme = () => { root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'; LS('theme', root.dataset.theme); };
  const saved = () => LS('saved') || [];
  const isSaved = id => saved().includes(String(id));
  const toggleSave = id => { id = String(id); let s = saved(); s = s.includes(id) ? s.filter(x => x !== id) : [id, ...s]; LS('saved', s); toast(s.includes(id) ? '★ تم حفظ الوظيفة' : 'أُزيلت من المحفوظات'); updateSaveButtons(); return s.includes(id); };
  const updateSaveButtons = () => document.querySelectorAll('[data-save]').forEach(b => { const on = isSaved(b.dataset.save); b.classList.toggle('on', on); b.textContent = on ? '★' : '☆'; b.title = on ? 'إزالة من المحفوظات' : 'حفظ الوظيفة'; });
  let tt; const toast = m => { let t = document.querySelector('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); } t.textContent = m; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2200); };
  const fmtDate = s => { if (!s) return '—'; const d = new Date(s); return isNaN(d) ? s : d.toLocaleDateString('ar-SA-u-nu-latn', { year: 'numeric', month: 'short', day: 'numeric' }); };
  const daysLeft = (s, posted) => { if (!s) return posted && daysAgo(posted) > 60 ? -1 : null; const d = new Date(s); d.setHours(23, 59, 59); return Math.ceil((d - Date.now()) / 864e5); };
  const daysAgo = s => Math.floor((Date.now() - new Date(s)) / 864e5);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shortLoc = l => { if (!l) return 'السعودية'; const parts = l.split('،').map(x => x.trim()); return parts.length > 3 ? `${parts.slice(0, 2).join('، ')} (+${parts.length - 2})` : l; };
  const statusBadge = j => { const dl = daysLeft(j.validThrough, j.datePosted); if (dl !== null && dl < 0) return '<span class="badge closed">منتهية</span>'; if (dl !== null && dl <= 3) return `<span class="badge soon">${dl <= 0 ? 'آخر يوم' : 'باقي ' + dl + ' أيام'}</span>`; if (daysAgo(j.datePosted) <= 2) return '<span class="badge new">جديد</span>'; return '<span class="badge open">متاحة</span>'; };
  const card = j => `<article class="ncard"><div class="img">${j.image ? `<img loading="lazy" src="${esc(j.image)}" alt="">` : esc((j.company || 'و')[0])}</div><div class="body"><span class="kicker">${esc(j.category || '')}</span><h3><a href="${j.p ? ROOT + 'jobs/' + j.id + '.html' : ROOT + 'job.html?id=' + j.id}">${esc(j.title)}</a></h3><div class="company">${esc(j.company || '')} · ${esc(shortLoc(j.location))}</div><div class="foot"><span>🗓️ ${fmtDate(j.datePosted)}</span>${statusBadge(j)}<button class="save" data-save="${j.id}" onclick="W.toggleSave('${j.id}')">☆</button></div></div></article>`;
  const ROOT = document.body.dataset.root || './';
  // قائمة التنقل
  document.addEventListener('click', e => { if (e.target.closest('.menu-btn')) document.querySelector('.nav-links').classList.toggle('open'); if (e.target.closest('[data-theme-toggle]')) toggleTheme(); });
  const path = (location.pathname.split('/').pop() || 'index.html') + location.search;
  document.querySelectorAll('.nav-links a').forEach(a => { const h = decodeURIComponent(a.getAttribute('href').split('/').pop()); if (h === path || (h === 'jobs.html' && path.startsWith('jobs.html') && !document.querySelector(`.nav-links a[href$="${CSS.escape(path)}"]`))) a.classList.add('active'); });
  // بادج عدد المحفوظات
  const badge = document.querySelector('[data-saved-count]'); if (badge) { const n = saved().length; badge.textContent = n ? `(${n})` : ''; }
  return { LS, toggleTheme, saved, isSaved, toggleSave, updateSaveButtons, toast, fmtDate, daysLeft, daysAgo, esc, shortLoc, statusBadge, card, ROOT };
})();
