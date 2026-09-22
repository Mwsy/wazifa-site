// صفحة الوظيفة: العدّاد، الحفظ، المشاركة، التقويم
(() => {
  const j = window.JOB; if (!j) return;
  W.updateSaveButtons();
  const cd = document.querySelector('#countdown');
  const dl = W.daysLeft(j.validThrough);
  if (cd) { if (dl === null) cd.innerHTML = '<b>مفتوح</b>لم يُحدَّد موعد إغلاق، سارع بالتقديم'; else if (dl < 0) { cd.classList.add('expired'); cd.innerHTML = `<b>انتهى التقديم</b>أُغلق بتاريخ ${W.fmtDate(j.validThrough)}`; } else cd.innerHTML = `<b>${dl === 0 ? 'اليوم' : dl + ' يوم'}</b>${dl === 0 ? 'آخر يوم للتقديم!' : 'متبقٍ على إغلاق التقديم'}`; }
  const url = location.href, text = `${j.title} — ${j.company}`;
  const share = { wa: `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`, tg: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, x: `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` };
  Object.entries(share).forEach(([k, v]) => { const a = document.querySelector(`[data-share="${k}"]`); if (a) a.href = v; });
  const cp = document.querySelector('[data-copy]'); if (cp) cp.onclick = () => navigator.clipboard.writeText(url).then(() => W.toast('📋 تم نسخ الرابط'));
  // إضافة للتقويم (ملف ics)
  const cal = document.querySelector('[data-ics]');
  if (cal) cal.onclick = () => { const d = new Date(j.validThrough || Date.now() + 7 * 864e5); const ymd = d.toISOString().slice(0, 10).replace(/-/g, ''); const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//wazifa//AR', 'BEGIN:VEVENT', `UID:job-${j.id}@wazifa`, `DTSTART;VALUE=DATE:${ymd}`, `SUMMARY:آخر موعد: ${text}`, `DESCRIPTION:${url}`, 'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:تذكير بموعد التقديم', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n'); const a = document.createElement('a'); a.href = 'data:text/calendar;charset=utf8,' + encodeURIComponent(ics); a.download = `job-${j.id}.ics`; a.click(); W.toast('📅 أُضيف التذكير إلى التقويم'); };
  // سجل المشاهدة
  const seen = (W.LS('seen') || []).filter(x => x !== j.id); seen.unshift(j.id); W.LS('seen', seen.slice(0, 50));
  // تتبع التقديمات
  const ap = document.querySelector('[data-applied]');
  const applied = W.LS('applied') || {};
  const paint = () => { if (!ap) return; ap.textContent = applied[j.id] ? '✅ سجّلت أنك قدّمت — إزالة' : '☑️ سجّل أنك قدّمت على هذه الوظيفة'; ap.classList.toggle('soft', !!applied[j.id]); };
  if (ap) ap.onclick = () => { if (applied[j.id]) delete applied[j.id]; else applied[j.id] = new Date().toISOString(); W.LS('applied', applied); paint(); W.toast(applied[j.id] ? 'تم تسجيل التقديم في متابعاتك' : 'أُزيل من متابعاتك'); };
  paint();
})();
