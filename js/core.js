"use strict";
/* ================================================================ state */
const KEY = "prosperhub.v1";
let S = null, view = "dash", sel = {}, YEAR = null;
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
const pad = n => String(n).padStart(2, "0");
const ds = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const today = () => ds(new Date());
const dd = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const addD = (s, n) => { const d = dd(s); d.setDate(d.getDate() + n); return ds(d); };
const diffD = (a, b) => Math.round((dd(b) - dd(a)) / 864e5);
const mStart = s => s.slice(0, 8) + "01";
const mEnd = s => { const d = dd(mStart(s)); d.setMonth(d.getMonth() + 1); d.setDate(0); return ds(d); };
const addM = (s, n) => { const d = dd(mStart(s)); d.setMonth(d.getMonth() + n); return ds(d); };
const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const FULLM = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const nice = (s, w) => { if (!s) return "—"; const d = dd(s); return (w ? DOW[d.getDay()] + " " : "") + d.getDate() + " " + MON[d.getMonth()]; };
const niceY = s => s ? nice(s) + " " + s.slice(0, 4) : "—";
const num = v => { const n = parseFloat(String(v ?? "").replace(/[^0-9.\-]/g, "")); return isNaN(n) ? 0 : Math.round(n * 100) / 100; };
const r2 = n => Math.round(n * 100) / 100;
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function money(n, sign, short){
  n = Number(n) || 0; const neg = n < 0, a = Math.abs(n);
  let v;
  if (short && a >= 1e6) v = (a / 1e6).toFixed(1) + "M"; else if (short && a >= 1e4) v = (a / 1e3).toFixed(1) + "k";
  else v = a.toLocaleString(undefined, {minimumFractionDigits: S.profile.dec, maximumFractionDigits: S.profile.dec});
  return (neg ? "−" : sign && n > 0 ? "+" : "") + S.profile.cur + v;
}
const pct = (a, b) => b ? (a / b * 100).toFixed(0) + "%" : "–";
function toast(t){ const el = document.createElement("div"); el.className = "toast"; el.textContent = t; document.body.appendChild(el); setTimeout(() => el.remove(), 2600); }

/* ================================================================ categories */
const CTYPES = {income: "Income", bill: "Bills", sub: "Subscriptions", exp: "Expenses", save: "Savings", debt: "Debt payments", cogs: "Cost of goods", tax: "Tax", draw: "Owner's pay"};
const CT_COLOR = {income: "var(--in)", bill: "var(--out)", sub: "#C2559A", exp: "var(--debt)", save: "var(--save)", debt: "#B45309", cogs: "#0891B2", tax: "#64748B", draw: "#475569"};
const SPEND_T = ["bill", "sub", "exp"];
function personalCats(){
  const c = (n, e, t, grp, bud) => ({id: uid(), n, e, t, grp: grp || (t === "save" || t === "debt" ? "save" : ""), bud: bud || 0});
  return [c("Salary","💼","income"), c("Side income","🪙","income"), c("Other income","💰","income"),
    c("Rent / Mortgage","🏠","bill","need"), c("Electricity","⚡","bill","need"), c("Water","🚿","bill","need"), c("Internet","🌐","bill","need"), c("Phone","📱","bill","need"), c("Insurance","🛡️","bill","need"),
    c("Streaming","📺","sub","want"), c("Gym","🏋️","sub","want"), c("Apps & cloud","☁️","sub","want"),
    c("Groceries","🛒","exp","need"), c("Eating out","🍔","exp","want"), c("Coffee","☕","exp","want"), c("Transport","🚌","exp","need"), c("Fuel","⛽","exp","need"),
    c("Shopping","🛍️","exp","want"), c("Fun","🎉","exp","want"), c("Health","💊","exp","need"), c("Kids","🧸","exp","need"), c("Pets","🐾","exp","need"),
    c("Gifts","🎁","exp","want"), c("Travel","✈️","exp","want"), c("Home & repairs","🔧","exp","need"), c("Other","✨","exp","want"),
    c("Savings","🐷","save"), c("Debt payments","💳","debt")];
}
function businessCats(){
  const c = (n, e, t) => ({id: uid(), n, e, t, grp: "", bud: 0});
  return [c("Sales","🛍️","income"), c("Services","🧵","income"), c("Other income","💰","income"),
    c("Materials","🧶","cogs"), c("Packaging","📦","cogs"), c("Shipping","🚚","cogs"),
    c("Platform fees","🏷️","exp"), c("Advertising","📣","exp"), c("Software","💻","sub"), c("Equipment","🖨️","exp"), c("Office","🗂️","exp"),
    c("Contractors","🤝","exp"), c("Travel","✈️","exp"), c("Bank charges","🏦","exp"), c("Rent / studio","🏢","bill"), c("Internet & phone","🌐","bill"),
    c("Tax payments","🧾","tax"), c("Owner's pay","👤","draw"), c("Loan repayment","💳","debt")];
}
function newBook(type, name){
  const b = {id: uid(), name: name || (type === "business" ? "My business" : "Home"), type, emoji: type === "business" ? "💼" : "🏡",
    accounts: [{id: uid(), name: type === "business" ? "Business account" : "Checking", kind: "bank", start: 0, spend: true}],
    cats: type === "business" ? businessCats() : personalCats(), tx: [], rec: [], bud: {}, goals: [], funds: [], debts: [], hold: [], wish: [],
    clients: [], inv: [], prods: [], set: {strategy: "carry", taxRate: 25, target: 0, ptype: "fortnightly", pstart: today(), extra: 0, nsGoal: 10, wait: 30, wage: 0, invNo: 1001, bizName: "", bizAddr: ""}};
  return b;
}
function blank(){ const b = newBook("personal"); return {v: 1, created: today(), profile: {name: "", cur: "$", dec: 2}, look: {theme: "auto", label: "Safe to spend"},
  people: ["Me", "Partner", "Shared"], books: [b], cur: b.id, ms: {}, todos: {}, brain: "", onboarded: false, lastBackup: ""}; }
function load(){ try{ const t = localStorage.getItem(KEY); return t ? JSON.parse(t) : null; }catch(e){ return null; } }
let saveT;
function save(now){ clearTimeout(saveT); const f = () => { try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){ toast("Could not save — storage full or blocked. Download a backup."); } };
  if (now === true) f(); else saveT = setTimeout(f, 150); checkMilestones(); }
const B = () => S.books.find(b => b.id === S.cur) || S.books[0];
const isBiz = () => B().type === "business";
const cat = (id, b = B()) => b.cats.find(c => c.id === id) || {n: "Uncategorised", e: "❔", t: "exp"};
const catT = (tx, b = B()) => tx.k === "move" ? "move" : cat(tx.c, b).t;
const acc = (id, b = B()) => b.accounts.find(a => a.id === id) || b.accounts[0];
const client = id => B().clients.find(c => c.id === id);

/* ================================================================ scope (year / all time) */
function years(b = B()){ const set = new Set([new Date().getFullYear()]); b.tx.forEach(t => set.add(+t.d.slice(0, 4))); return [...set].sort((a, c) => a - c); }
function scope(){ const y = YEAR || new Date().getFullYear(); if (y === "all"){ const ys = years(); return [ys[0] + "-01-01", ys[ys.length - 1] + "-12-31", "All time"]; } return [y + "-01-01", y + "-12-31", String(y)]; }
const txIn = (from, to, b = B()) => b.tx.filter(t => t.d >= from && t.d <= to);

/* ================================================================ schedules */
const FREQS = {once: "One time", weekly: "Every week", fortnightly: "Every 2 weeks", fourweekly: "Every 4 weeks", twicemonthly: "Twice a month", monthly: "Every month",
  bimonthly: "Every 2 months", quarterly: "Every 3 months", halfyearly: "Every 6 months", yearly: "Every year"};
const clampDay = (y, m, day) => ds(new Date(y, m, Math.min(day, new Date(y, m + 1, 0).getDate())));
const shiftWeekend = s => { const w = dd(s).getDay(); return w === 6 ? addD(s, -1) : w === 0 ? addD(s, -2) : s; };
function occ(it, from, to, payday){
  const out = [], a = it.anchor, f = it.freq; if (!a) return out;
  if (f === "once"){ if (a >= from && a <= to) out.push(a); }
  else if (f === "weekly" || f === "fortnightly" || f === "fourweekly"){
    const st = f === "weekly" ? 7 : f === "fortnightly" ? 14 : 28;
    let d = a; if (from > a){ d = addD(a, Math.floor(diffD(a, from) / st) * st); }
    while (d < from) d = addD(d, st);
    while (d <= to){ out.push(d); d = addD(d, st); }
  } else {
    const ad = dd(a), step = {monthly: 1, twicemonthly: 1, bimonthly: 2, quarterly: 3, halfyearly: 6, yearly: 12}[f] || 1;
    const cur = dd(mStart(from > a ? from : a)); cur.setMonth(cur.getMonth() - 1); const end = dd(to);
    while (cur <= end){
      const y = cur.getFullYear(), m = cur.getMonth(), mo = (y - ad.getFullYear()) * 12 + (m - ad.getMonth());
      if (mo >= 0 && mo % step === 0){ const days = [ad.getDate()]; if (f === "twicemonthly") days.push(it.day2 || 15);
        for (const day of days){ const s = clampDay(y, m, day); if (s >= a && s >= from && s <= to) out.push(s); } }
      cur.setMonth(cur.getMonth() + 1);
    }
  }
  let r = out.sort(); if (it.end) r = r.filter(s => s <= it.end);
  return payday ? r.map(shiftWeekend) : r;
}
function addTx(t, b = B()){ t.id = uid(); t.a = num(t.a); if (!t.ac) t.ac = b.accounts[0].id; b.tx.push(t); return t.id; }
function autoPost(b){
  const t = today(); let n = 0;
  for (const r of b.rec){ if (!r.auto) continue; r.done = r.done || {};
    for (const d of occ(r, r.anchor, t, r.k === "in")){ if (r.done[d]) continue; r.done[d] = addTx({d, a: r.a, k: r.k, c: r.c, ac: r.ac, note: r.name, who: r.who, rec: r.id, debt: r.debt}, b); n++; } }
  return n;
}
function dueList(from, to, b = B()){
  const out = [];
  for (const r of b.rec) for (const d of occ(r, from, to, r.k === "in")) out.push({r, d, done: !!(r.done && r.done[d] && r.done[d] !== "skip")});
  return out.sort((x, y) => x.d < y.d ? -1 : x.d > y.d ? 1 : 0);
}

/* ================================================================ balances & totals */
function balance(accId, upto, b = B()){
  const a = acc(accId, b); let v = num(a.start);
  for (const t of b.tx){ if (upto && t.d > upto) continue;
    if (t.k === "in" && t.ac === accId) v += t.a; else if (t.k === "out" && t.ac === accId) v -= t.a;
    else if (t.k === "move"){ if (t.ac === accId) v -= t.a; if (t.to === accId) v += t.a; } }
  return r2(v);
}
function totals(from, to, b = B(), filt){
  const o = {in: 0, out: 0, byCat: {}, byT: {}, spend: 0};
  for (const t of b.tx){ if (t.d < from || t.d > to || t.k === "move") continue; if (filt && !filt(t)) continue;
    const ty = cat(t.c, b).t;
    if (t.k === "in"){ o.in += t.a; } else { o.out += t.a; if (SPEND_T.includes(ty)) o.spend += t.a; }
    o.byCat[t.c] = (o.byCat[t.c] || 0) + (t.k === "in" ? t.a : t.a); o.byT[ty] = (o.byT[ty] || 0) + t.a; }
  o.net = o.in - o.out; return o;
}
function monthly(from, to, fn, b = B()){
  const out = []; let m = mStart(from);
  while (m <= to){ const e = mEnd(m); out.push({m, label: MON[dd(m).getMonth()] + (from.slice(0, 4) !== to.slice(0, 4) ? " " + m.slice(2, 4) : ""), ...fn(m, e)}); m = addM(m, 1); }
  return out;
}
function pnl(from, to, b = B()){
  const t = totals(from, to, b); const rev = t.byT.income || 0, cogs = t.byT.cogs || 0, opex = (t.byT.exp || 0) + (t.byT.bill || 0) + (t.byT.sub || 0);
  return {rev, cogs, gross: rev - cogs, opex, net: rev - cogs - opex, tax: t.byT.tax || 0, draw: t.byT.draw || 0};
}
function debtLeft(d, upto, b = B()){ return Math.max(0, num(d.start) - b.tx.filter(t => t.debt === d.id && (!upto || t.d <= upto)).reduce((s, t) => s + t.a, 0)); }
function goalSaved(g, b = B()){ return num(g.saved0) + b.tx.filter(t => t.goal === g.id).reduce((s, t) => s + t.a, 0); }
function fundSaved(f, b = B()){ return num(f.saved0) + b.tx.filter(t => t.fund === f.id).reduce((s, t) => s + t.a, 0); }
function holdValue(upto, b = B()){ return b.hold.filter(h => !upto || !h.d || h.d <= upto).reduce((s, h) => s + num(h.units) * num(h.price || h.cost), 0); }
function netWorth(upto, b = B()){
  const accs = b.accounts.reduce((s, a) => s + balance(a.id, upto, b), 0);
  const debts = b.debts.reduce((s, d) => s + debtLeft(d, upto, b), 0);
  return {accs, inv: holdValue(upto, b), debts, nw: accs + holdValue(upto, b) - debts};
}
function nextPayday(from, b = B()){
  let best = null; for (const r of b.rec){ if (r.k !== "in") continue; const o = occ(r, from, addD(from, 400), true); if (o.length && (!best || o[0] < best)) best = o[0]; } return best;
}
function safeToSpend(b = B()){
  const t = today(), np = nextPayday(addD(t, 1), b), until = np ? addD(np, -1) : mEnd(t), days = diffD(t, until) + 1;
  const bal = b.accounts.filter(a => a.spend).reduce((s, a) => s + balance(a.id, null, b), 0);
  const due = dueList(addD(t, -45), until, b).filter(x => x.r.k === "out" && !x.done && (!x.r.auto || x.d > t));
  const bills = due.reduce((s, x) => s + num(x.r.a), 0);
  const spentToday = b.tx.filter(x => x.d === t && x.k === "out" && SPEND_T.includes(cat(x.c, b).t) && !x.rec).reduce((s, x) => s + x.a, 0);
  const pot = bal - bills, perDay = (pot + spentToday) / days;
  return {bal, bills, pot, days, np, until, perDay, left: perDay - spentToday, spentToday, due};
}
function budgetFor(m, c, b = B()){ const o = b.bud[m.slice(0, 7)]; return o && o[c.id] != null ? num(o[c.id]) : num(c.bud); }

/* ================================================================ debt planner */
function simulateDebts(list, extra, method){
  let ds_ = list.filter(d => d.bal > 0.005).map(d => ({...d})); const order = []; let month = 0, interest = 0; const timeline = [];
  if (!ds_.length) return {months: 0, interest: 0, order, timeline, ok: true};
  const minSum = ds_.reduce((s, d) => s + d.min, 0);
  while (ds_.some(d => d.bal > 0.005) && month < 600){
    month++; ds_.forEach(d => { if (d.bal > 0.005){ const i = d.bal * d.rate / 1200; interest += i; d.bal += i; } });
    let pool = minSum + extra;
    ds_.forEach(d => { if (d.bal > 0.005){ const p = Math.min(d.min, d.bal); d.bal -= p; pool -= p; } });
    const live = ds_.filter(d => d.bal > 0.005).sort((a, c) => method === "avalanche" ? c.rate - a.rate || a.bal - c.bal : a.bal - c.bal);
    for (const d of live){ if (pool <= 0) break; const p = Math.min(pool, d.bal); d.bal -= p; pool -= p; }
    ds_.forEach(d => { if (d.bal <= 0.005 && !d.doneM){ d.doneM = month; order.push({name: d.name, month}); } });
    timeline.push(ds_.reduce((s, d) => s + Math.max(0, d.bal), 0));
  }
  return {months: month, interest, order, timeline, ok: month < 600};
}

/* ================================================================ charts (SVG) */
const PAL = ["var(--brand)", "var(--in)", "var(--out)", "var(--save)", "var(--debt)", "#C2559A", "#0891B2", "#64748B", "#16A34A", "#EAB308"];
const axf = v => { const a = Math.abs(v), s = v < 0 ? "−" : ""; return s + S.profile.cur + (a >= 1e6 ? +(a / 1e6).toFixed(1) + "M" : a >= 1e3 ? +(a / 1e3).toFixed(1) + "k" : Math.round(a)); };
function niceMax(v){ if (v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; }
function bars(labels, series, o = {}){
  const W = o.w || 640, H = o.h || 220, pl = 46, pb = 26, pt = 10, n = labels.length, gw = (W - pl - 6) / Math.max(1, n), k = series.length;
  const vals = series.flatMap(s => s.values).concat(o.line ? o.line.values : []); const mx = niceMax(Math.max(...vals.map(v => Math.max(0, v)), 0)), mn = Math.min(0, ...vals);
  const span = mx - (mn < 0 ? -niceMax(-mn) : 0) || 1, lo = mn < 0 ? -niceMax(-mn) : 0;
  const y = v => pt + (mx - v) / span * (H - pt - pb);
  let g = ""; for (let i = 0; i <= 4; i++){ const v = lo + span * i / 4; const yy = y(v); g += `<line x1="${pl}" x2="${W}" y1="${yy}" y2="${yy}" stroke="var(--line)" stroke-width="1"/><text x="${pl - 6}" y="${yy + 4}" text-anchor="end" font-size="11">${axf(v)}</text>`; }
  const bw = Math.max(3, Math.min(26, (gw - 6) / k - 2));
  const skip = n > 18 ? Math.ceil(n / 12) : 1;
  labels.forEach((l, i) => { const cx = pl + gw * i + gw / 2;
    series.forEach((s, j) => { const v = s.values[i] || 0, x = cx - (k * (bw + 2)) / 2 + j * (bw + 2), y0 = y(Math.max(0, v)), h = Math.abs(y(v) - y(0));
      g += `<rect x="${x}" y="${y0}" width="${bw}" height="${Math.max(0.5, h)}" rx="${Math.min(5, bw / 3)}" fill="${s.color}"><title>${esc(l)} · ${esc(s.name)}: ${money(v)}</title></rect>`; });
    if (i % skip === 0) g += `<text x="${cx}" y="${H - 8}" text-anchor="middle" font-size="11" font-weight="700">${esc(l)}</text>`; });
  if (o.line){ const pts = o.line.values.map((v, i) => `${pl + gw * i + gw / 2},${y(v)}`).join(" "); g += `<polyline points="${pts}" fill="none" stroke="${o.line.color}" stroke-width="3" stroke-linejoin="round"/>`; }
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img">${g}</svg>${legend(series.concat(o.line ? [o.line] : []))}`;
}
function line(labels, series, o = {}){
  const W = o.w || 640, H = o.h || 220, pl = 50, pb = 26, pt = 10, n = labels.length;
  const vals = series.flatMap(s => s.values); const mxv = Math.max(...vals, 0), mnv = Math.min(...vals, 0);
  const mx = niceMax(mxv), lo = mnv < 0 ? -niceMax(-mnv) : 0, span = mx - lo || 1;
  const x = i => pl + (W - pl - 10) * (n <= 1 ? .5 : i / (n - 1)), y = v => pt + (mx - v) / span * (H - pt - pb);
  let g = ""; for (let i = 0; i <= 4; i++){ const v = lo + span * i / 4; g += `<line x1="${pl}" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${pl - 6}" y="${y(v) + 4}" text-anchor="end" font-size="11">${axf(v)}</text>`; }
  const skip = Math.max(1, Math.ceil(n / 12)); labels.forEach((l, i) => { if (i % skip === 0) g += `<text x="${x(i)}" y="${H - 8}" text-anchor="middle" font-size="11" font-weight="700">${esc(l)}</text>`; });
  series.forEach(s => { const pts = s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
    if (s.fill) g += `<polygon points="${x(0)},${y(Math.max(lo, 0))} ${pts} ${x(n - 1)},${y(Math.max(lo, 0))}" fill="${s.color}" opacity=".12"/>`;
    g += `<polyline points="${pts}" fill="none" stroke="${s.color}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`; });
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img">${g}</svg>${series.length > 1 ? legend(series) : ""}`;
}
function donut(parts, o = {}){
  const tot = parts.reduce((s, p) => s + Math.max(0, p.value), 0) || 1, R = 70, C = 2 * Math.PI * R; let off = 0;
  const segs = parts.filter(p => p.value > 0).map((p, i) => { const len = p.value / tot * C; const s = `<circle r="${R}" cx="90" cy="90" fill="none" stroke="${p.color || PAL[i % PAL.length]}" stroke-width="26" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-off}" transform="rotate(-90 90 90)"><title>${esc(p.label)}: ${money(p.value)}</title></circle>`; off += len; return s; }).join("");
  return `<div class="row w" style="gap:16px;align-items:center"><svg viewBox="0 0 180 180" width="${o.size || 170}" style="flex:none"><circle r="${R}" cx="90" cy="90" fill="none" stroke="var(--soft)" stroke-width="26"/>${segs}
   <text x="90" y="86" text-anchor="middle" font-size="12" font-weight="700">${esc(o.title || "Total")}</text><text x="90" y="106" text-anchor="middle" font-size="17" font-weight="900" style="fill:var(--ink)">${money(tot, false, true)}</text></svg>
   <div class="sp">${parts.filter(p => p.value > 0).slice(0, 8).map((p, i) => `<div class="row" style="font-size:13px;margin:4px 0"><i style="width:11px;height:11px;border-radius:4px;background:${p.color || PAL[i % PAL.length]};flex:none"></i><span class="sp" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.label)}</span><b>${money(p.value, false, true)}</b><span class="sub" style="width:36px;text-align:right">${pct(p.value, tot)}</span></div>`).join("")}</div></div>`;
}
const legend = s => s.length > 1 ? `<div class="row w" style="gap:14px;margin-top:6px">${s.map(x => `<span class="row" style="gap:6px;font-size:12.5px;font-weight:700"><i style="width:11px;height:11px;border-radius:4px;background:${x.color}"></i>${esc(x.name)}</span>`).join("")}</div>` : "";

/* ================================================================ milestones */
const MS = [
  ["first", "🌱", "First step", "Logged your first entry", () => S.books.some(b => b.tx.some(t => !t.rec))],
  ["hundred", "💯", "Habit hero", "100 entries logged", () => S.books.reduce((s, b) => s + b.tx.length, 0) >= 100],
  ["thousand", "🏛️", "Record keeper", "1,000 entries logged", () => S.books.reduce((s, b) => s + b.tx.length, 0) >= 1000],
  ["streak7", "🔥", "A whole week", "Logged something 7 days running", () => streak() >= 7],
  ["bill", "🧾", "Bill boss", "Ticked off a bill", () => S.books.some(b => b.rec.some(r => !r.auto && r.done && Object.keys(r.done).length))],
  ["goal", "🎯", "Dream it", "Set a savings goal", () => S.books.some(b => b.goals.length)],
  ["goaldone", "🏆", "Goal reached", "Filled a goal all the way", () => S.books.some(b => b.goals.some(g => num(g.target) > 0 && goalSaved(g, b) >= num(g.target)))],
  ["debtfree", "🎉", "Debt-free", "Paid a debt down to zero", () => S.books.some(b => b.debts.some(d => num(d.start) > 0 && debtLeft(d, null, b) <= 0))],
  ["nw", "📈", "Growing", "Net worth went up 3 months in a row", () => { const b = S.books.find(x => x.type === "personal"); if (!b) return false; const t = today(); const v = [3, 2, 1, 0].map(i => netWorth(mEnd(addM(t, -i)), b).nw); return v[1] > v[0] && v[2] > v[1] && v[3] > v[2]; }],
  ["invoice", "📨", "Pro invoicer", "Got an invoice paid", () => S.books.some(b => b.inv.some(i => i.status === "paid"))],
  ["profit", "💹", "In profit", "A business month with profit", () => S.books.some(b => b.type === "business" && pnl(mStart(addM(today(), -1)), mEnd(addM(today(), -1)), b).net > 0)],
  ["budget", "📋", "Planner", "Set budgets for 5 categories", () => S.books.some(b => b.cats.filter(c => num(c.bud) > 0).length >= 5)],
  ["backup", "💾", "Safe and sound", "Downloaded a backup", () => !!S.lastBackup],
  ["skip", "🧘", "Not today", "Skipped an impulse buy", () => S.books.some(b => b.wish.some(w => w.dec === "Skipped"))],
  ["twobooks", "📚", "Two worlds", "Set up a second book", () => S.books.length >= 2],
];
function streak(){ const days = new Set(S.books.flatMap(b => b.tx.filter(t => !t.rec).map(t => t.d))); let n = 0, d = today(); if (!days.has(d)) d = addD(d, -1); while (days.has(d)){ n++; d = addD(d, -1); } return n; }
let msReady = false;
function checkMilestones(){
  if (!S || !S.onboarded) return;
  for (const m of MS){ try{ if (!S.ms[m[0]] && m[4]()){ S.ms[m[0]] = today(); if (msReady) toast(m[1] + "  Milestone: " + m[2]); } }catch(e){} }
  msReady = true;
}

/* ================================================================ notifications */
function notifications(b = B()){
  const t = today(), out = [];
  const late = dueList(addD(t, -60), addD(t, -1), b).filter(x => !x.done && !x.r.auto);
  if (late.length) out.push(["n-bad", "⏰", `${late.length} recurring payment${late.length > 1 ? "s" : ""} not ticked off yet`, "recurring"]);
  const soon = dueList(t, addD(t, 7), b).filter(x => !x.done && x.r.k === "out");
  if (soon.length) out.push(["n-info", "📅", `${soon.length} bill${soon.length > 1 ? "s" : ""} due in the next 7 days (${money(soon.reduce((s, x) => s + num(x.r.a), 0))})`, "calendar"]);
  const m0 = mStart(t), m1 = mEnd(t); const tt = totals(m0, m1, b);
  const over = b.cats.filter(c => SPEND_T.includes(c.t) && budgetFor(m0, c, b) > 0 && (tt.byCat[c.id] || 0) > budgetFor(m0, c, b));
  if (over.length) out.push(["n-bad", "⚠️", `Over budget this month: ${over.slice(0, 3).map(c => c.n).join(", ")}${over.length > 3 ? " +" + (over.length - 3) : ""}`, "budget"]);
  if (b.type === "business"){
    const od = b.inv.filter(i => i.status === "sent" && i.due && i.due < t);
    if (od.length) out.push(["n-bad", "📨", `${od.length} overdue invoice${od.length > 1 ? "s" : ""} — ${money(od.reduce((s, i) => s + invTotal(i), 0))} to chase`, "invoices"]);
    const tg = num(b.set.target); if (tg){ const rev = pnl(m0, m1, b).rev; out.push([rev >= tg ? "n-yay" : "n-info", "🎯", `Revenue this month ${money(rev)} of ${money(tg)} target (${pct(rev, tg)})`, "pnl"]); }
    const p = pnl(t.slice(0, 4) + "-01-01", t, b); const setAside = Math.max(0, p.net) * num(b.set.taxRate) / 100 - p.tax;
    if (setAside > 0) out.push(["n-info", "🧾", `Set aside about ${money(setAside)} for tax so far this year`, "tax"]);
  } else {
    const s = safeToSpend(b); if (s.left < 0) out.push(["n-bad", "💸", `Over today's safe-to-spend by ${money(-s.left)}`, "today"]);
  }
  const goals = b.goals.filter(g => num(g.target) > 0 && goalSaved(g, b) >= num(g.target)); if (goals.length) out.push(["n-yay", "🎉", `Goal reached: ${goals.map(g => g.name).join(", ")}`, "goals"]);
  const fundsDue = b.funds.filter(f => f.due && f.due >= t && diffD(t, f.due) <= 45 && fundSaved(f, b) < num(f.target)); if (fundsDue.length) out.push(["n-info", "🪣", `Sinking fund due soon: ${fundsDue[0].name} (${nice(fundsDue[0].due)})`, "funds"]);
  const unc = b.tx.filter(x => x.k !== "move" && !b.cats.some(c => c.id === x.c)).length; if (unc) out.push(["n-info", "🔍", `${unc} entr${unc > 1 ? "ies" : "y"} without a category`, "tx"]);
  if (!S.lastBackup || diffD(S.lastBackup, t) > 30) out.push(["n-info", "💾", S.lastBackup ? `Last backup was ${diffD(S.lastBackup, t)} days ago` : "No backup yet — download one in Settings", "settings"]);
  if (!out.length) out.push(["n-ok", "✅", "All clear — nothing needs you right now.", ""]);
  return out;
}
const invSub = i => i.items.reduce((s, x) => s + num(x.q) * num(x.p), 0);
const invTotal = i => r2(invSub(i) * (1 + num(i.taxp) / 100));
