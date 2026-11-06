"use strict";
/* ================================================================ sheets / forms */
function sheet(html){ document.getElementById("layer").innerHTML = `<div class="modal" data-act="closebg"><div class="sheet">${html}</div></div>`; }
function closeSheet(){ document.getElementById("layer").innerHTML = ""; }
const val = id => { const el = document.getElementById(id); return el ? (el.type === "checkbox" ? el.checked : el.value.trim()) : ""; };
const opt = (v, t, s) => `<option value="${esc(v)}" ${s ? "selected" : ""}>${esc(t)}</option>`;
const accOpts = (v, b = B()) => b.accounts.map(a => opt(a.id, a.name, a.id === v)).join("");
const catOpts = (v, k, b = B()) => b.cats.filter(c => k === "in" ? c.t === "income" : k === "out" ? c.t !== "income" : true).map(c => opt(c.id, c.e + " " + c.n, c.id === v)).join("");
const whoOpts = v => opt("", "—", !v) + S.people.map(p => opt(p, p, p === v)).join("");
const btns = (del, saveAct, id) => `<div class="row" style="margin-top:16px">${del || ""}<span class="sp"></span><button class="btn g" data-act="close">Cancel</button><button class="btn" data-act="${saveAct}" data-id="${id || ""}">Save</button></div>`;
const F = {
  tx(t = {}){ const b = B(), k = t.k || sel.fk || "out"; sel.fk = k;
    sheet(`<h3>${t.id ? "Edit entry" : "New entry"}</h3><div class="seg" style="margin:4px 0 6px">${[["out", "Money out"], ["in", "Money in"], ["move", "Transfer"]].map(([v, n]) => `<button class="${k === v ? "on" : ""}" data-act="fk" data-v="${v}" data-id="${t.id || ""}">${n}</button>`).join("")}</div>
     <div class="grid g2" style="gap:8px"><div><label class="f">Amount</label><input id="f_a" class="amount" inputmode="decimal" value="${t.a || ""}"></div><div><label class="f">Date</label><input id="f_d" type="date" value="${t.d || sel.fd || today()}"></div>
     ${k === "move" ? `<div><label class="f">From</label><select id="f_ac">${accOpts(t.ac)}</select></div><div><label class="f">To</label><select id="f_to">${accOpts(t.to || (b.accounts[1] || {}).id)}</select></div>`
       : `<div><label class="f">Category</label><select id="f_c">${catOpts(t.c, k)}</select></div><div><label class="f">Account</label><select id="f_ac">${accOpts(t.ac)}</select></div>
          <div><label class="f">Who</label><select id="f_who">${whoOpts(t.who)}</select></div><div><label class="f">Note</label><input id="f_note" value="${esc(t.note || "")}"></div>
          ${b.type === "business" ? `<div><label class="f">Client</label><select id="f_cl">${opt("", "—")}${b.clients.map(c => opt(c.id, c.name, c.id === t.cl)).join("")}</select></div>${k === "in" ? `<div><label class="f">Product · qty</label><div class="row"><select id="f_prod">${opt("", "—")}${b.prods.map(p => opt(p.id, p.name, p.id === t.prod)).join("")}</select><input id="f_qty" style="width:70px" inputmode="numeric" value="${t.qty || 1}"></div></div>` : ""}` : ""}
          ${k === "out" ? `<div><label class="f">Counts toward</label><select id="f_link">${opt("", "—")}${b.goals.map(g => opt("goal:" + g.id, "🎯 " + g.name, t.goal === g.id)).join("")}${b.funds.map(f => opt("fund:" + f.id, "🪣 " + f.name, t.fund === f.id)).join("")}${b.debts.map(d => opt("debt:" + d.id, "💳 " + d.name, t.debt === d.id)).join("")}</select></div>` : ""}`}</div>
     ${btns(t.id ? `<button class="btn r" data-act="deltx" data-id="${t.id}">Delete</button>` : "", "savetx", t.id)}`); },
  rec(r = {}){ const k = r.k || sel.rk || "out"; sel.rk = k;
    sheet(`<h3>${r.id ? "Edit recurring" : "New recurring"}</h3><div class="seg" style="margin:4px 0">${[["out", "Payment / bill"], ["in", "Income / payday"]].map(([v, n]) => `<button class="${k === v ? "on" : ""}" data-act="rk" data-v="${v}" data-id="${r.id || ""}">${n}</button>`).join("")}</div>
     <div class="grid g2" style="gap:8px"><div><label class="f">Name</label><input id="f_name" value="${esc(r.name || "")}" placeholder="${k === "in" ? "Salary" : "Rent, Netflix…"}"></div><div><label class="f">Amount</label><input id="f_a" inputmode="decimal" value="${r.a || ""}"></div>
      <div><label class="f">How often</label><select id="f_freq">${Object.entries(FREQS).map(([v, n]) => opt(v, n, v === (r.freq || "monthly"))).join("")}</select></div><div><label class="f">First / next date</label><input id="f_anchor" type="date" value="${r.anchor || today()}"></div>
      <div><label class="f">Category</label><select id="f_c">${catOpts(r.c, k)}</select></div><div><label class="f">Account</label><select id="f_ac">${accOpts(r.ac)}</select></div>
      <div><label class="f">Who</label><select id="f_who">${whoOpts(r.who)}</select></div><div><label class="f">End date (optional)</label><input id="f_end" type="date" value="${r.end || ""}"></div>
      <div><label class="f">2nd day (twice a month)</label><input id="f_day2" inputmode="numeric" value="${r.day2 || 15}"></div>${k === "out" ? `<div><label class="f">Pays off debt</label><select id="f_debt">${opt("", "—")}${B().debts.map(d => opt(d.id, d.name, d.id === r.debt)).join("")}</select></div>` : ""}</div>
     <label class="row" style="margin-top:12px;font-weight:800"><input type="checkbox" id="f_auto" ${r.auto ? "checked" : ""} style="width:22px;height:22px"> Logs itself automatically on the date</label>
     ${btns(r.id ? `<button class="btn r" data-act="delrec" data-id="${r.id}">Delete</button>` : "", "saverec", r.id)}`); },
  acc(a = {}){ sheet(`<h3>${a.id ? "Edit account" : "New account"}</h3><div class="grid g2" style="gap:8px"><div><label class="f">Name</label><input id="f_name" value="${esc(a.name || "")}"></div>
     <div><label class="f">Type</label><select id="f_kind">${[["bank", "Bank"], ["cash", "Cash"], ["card", "Credit card"], ["savings", "Savings"], ["invest", "Investment"], ["loan", "Loan"]].map(([v, n]) => opt(v, n, v === (a.kind || "bank"))).join("")}</select></div>
     <div><label class="f">Balance when you started</label><input id="f_start" inputmode="decimal" value="${a.start ?? ""}"></div></div>
     <label class="row" style="margin-top:12px;font-weight:800"><input type="checkbox" id="f_spend" ${a.spend || !a.id ? "checked" : ""} style="width:22px;height:22px"> Spending account (counts toward safe to spend)</label>
     ${a.id ? `<div class="sub" style="margin-top:8px">Balance now ${money(balance(a.id))}. To correct it, change the starting balance.</div>` : ""}${btns(a.id && B().accounts.length > 1 ? `<button class="btn r" data-act="delacc" data-id="${a.id}">Delete</button>` : "", "saveacc", a.id)}`); },
  simple(title, fields, saveAct, obj = {}, delAct){ sheet(`<h3>${title}</h3><div class="grid g2" style="gap:8px">${fields.map(([k, l, ty, ex]) => `<div ${ty === "area" ? 'style="grid-column:1/-1"' : ""}><label class="f">${l}</label>${ty === "area" ? `<textarea id="f_${k}">${esc(obj[k] || "")}</textarea>` : ty === "select" ? `<select id="f_${k}">${ex}</select>` : `<input id="f_${k}" ${ty === "date" ? 'type="date"' : ty === "num" ? 'inputmode="decimal"' : ""} value="${esc(obj[k] ?? "")}">`}</div>`).join("")}</div>
     ${btns(obj.id && delAct ? `<button class="btn r" data-act="${delAct}" data-id="${obj.id}">Delete</button>` : "", saveAct, obj.id)}`); },
  amount(title, act, id, hint, extra = ""){ sheet(`<h3>${title}</h3><p class="sub">${hint}</p><input id="f_a" class="amount" inputmode="decimal" placeholder="${esc(S.profile.cur)}0"><div class="grid g2" style="gap:8px">${extra}</div>${btns("", act, id)}`); },
  inv(i){ const b = B(); i = i || {no: "INV-" + b.set.invNo, d: today(), due: addD(today(), 14), items: [{d: "", q: 1, p: ""}], taxp: 0, status: "draft", notes: ""}; sel.invItems = i.items.map(x => ({...x}));
    sheet(`<h3>${i.id ? "Edit invoice" : "New invoice"}</h3><div class="grid g2" style="gap:8px"><div><label class="f">Invoice no.</label><input id="f_no" value="${esc(i.no)}"></div>
     <div><label class="f">Client</label><select id="f_cl">${opt("", "— choose —")}${b.clients.map(c => opt(c.id, c.name, c.id === i.cl)).join("")}${opt("__new", "+ New client…")}</select></div>
     <div><label class="f">Date</label><input id="f_d" type="date" value="${i.d}"></div><div><label class="f">Due</label><input id="f_due" type="date" value="${i.due}"></div></div>
     <label class="f">Items</label><div id="invitems">${invItemsHTML()}</div><button class="btn sm g" data-act="invitem">+ Line</button>
     <div class="grid g2" style="gap:8px"><div><label class="f">Tax %</label><input id="f_taxp" inputmode="decimal" value="${i.taxp || 0}"></div><div><label class="f">Status</label><select id="f_status">${[["draft", "Draft"], ["sent", "Sent"], ["paid", "Paid"]].map(([v, n]) => opt(v, n, v === i.status)).join("")}</select></div></div>
     <label class="f">Notes / payment details</label><textarea id="f_notes" style="min-height:60px">${esc(i.notes || "")}</textarea>
     ${btns(i.id ? `<button class="btn r" data-act="delinv" data-id="${i.id}">Delete</button>` : "", "saveinv", i.id)}`); },
};
function invItemsHTML(){ return sel.invItems.map((x, j) => `<div class="row" style="gap:6px;margin-bottom:6px"><input placeholder="Description" value="${esc(x.d)}" data-act="ii" data-j="${j}" data-k="d"><input style="width:64px" inputmode="decimal" value="${x.q}" data-act="ii" data-j="${j}" data-k="q"><input style="width:96px" inputmode="decimal" placeholder="Price" value="${x.p}" data-act="ii" data-j="${j}" data-k="p"><button class="btn sm g" data-act="invdel" data-j="${j}">✕</button></div>`).join(""); }
const iconOf = { goal: "🎯", fund: "🪣" };

/* ================================================================ actions */
function quickLog(){
  const b = B(), raw = val("qamt"); let a = num(raw), c = sel.qc, note = val("qnote"); const m = raw.match(/^\s*([\d.,]+)\s+(.+)$/);
  if (m){ a = num(m[1]); const w = m[2].toLowerCase(); const hit = b.cats.find(x => x.n.toLowerCase().startsWith(w) || w.startsWith(x.n.toLowerCase().split(" ")[0])); if (hit) c = hit.id; else note = note || m[2]; }
  if (!a) return toast("Type an amount first");
  const k = sel.qk === "in" ? "in" : "out"; if (!c){ const d = b.cats.find(x => k === "in" ? x.t === "income" : x.n === "Other" || x.t === "exp"); c = d && d.id; }
  if (k === "in" && cat(c, b).t !== "income") c = (b.cats.find(x => x.t === "income") || {}).id;
  addTx({d: today(), a, k, c, note, ac: val("qacc") || b.accounts[0].id}); sel.qamt = ""; sel.qnote = ""; sel.qc = ""; save(); render(); toast(`${k === "in" ? "Added" : "Logged"} ${money(a)} ✓`);
}
function keepQuick(){ ["qamt", "qnote"].forEach(id => { const el = document.getElementById(id); if (el) sel[id] = el.value; }); }
const byId = (arr, id) => arr.find(x => x.id === id);
const ACT = {
  book(e){ if (e.value === "__new"){ e.value = S.cur; return ACT.newbook(); } S.cur = e.value; sel = {}; save(); render(); },
  year(e){ YEAR = e.value === "all" ? "all" : +e.value; render(); },
  why(){ sel.why = !sel.why; render(); },
  qk(e){ keepQuick(); sel.qk = e.dataset.v; sel.qc = ""; render(); },
  plus(e){ keepQuick(); const v = Number(e.dataset.v); sel.qamt = v ? String(r2(num(sel.qamt) + v)) : ""; render(); },
  qc(e){ keepQuick(); sel.qc = sel.qc === e.dataset.v ? "" : e.dataset.v; render(); },
  qlog: quickLog,
  addtx(e){ sel.fd = e && e.dataset && e.dataset.d || ""; F.tx(); }, edittx(e){ F.tx(byId(B().tx, e.dataset.id)); },
  fk(e){ sel.fk = e.dataset.v; const t = e.dataset.id ? {...byId(B().tx, e.dataset.id), k: e.dataset.v} : {k: e.dataset.v, a: val("f_a"), d: val("f_d")}; F.tx(t); },
  savetx(e){ const b = B(), a = num(val("f_a")); if (!a) return toast("Type an amount"); const k = sel.fk || "out";
    let t = byId(b.tx, e.dataset.id); const isNew = !t; if (!t) t = {};
    const link = val("f_link"); Object.assign(t, {a, d: val("f_d") || today(), k, ac: val("f_ac"), to: k === "move" ? val("f_to") : undefined, c: k === "move" ? undefined : val("f_c"), who: val("f_who") || undefined, note: val("f_note") || "",
      cl: val("f_cl") || undefined, prod: val("f_prod") || undefined, qty: val("f_prod") ? num(val("f_qty")) || 1 : undefined, goal: undefined, fund: undefined, debt: undefined});
    if (link){ const [ty, id] = link.split(":"); t[ty] = id; }
    if (k === "move" && t.ac === t.to) return toast("Pick two different accounts");
    if (isNew) addTx(t, b); save(); closeSheet(); render(); toast("Saved ✓"); },
  deltx(e){ if (!confirm("Delete this entry?")) return; const b = B(), t = byId(b.tx, e.dataset.id); b.tx = b.tx.filter(x => x.id !== t.id);
    if (t.rec){ const r = byId(b.rec, t.rec); if (r && r.done) for (const k in r.done) if (r.done[k] === t.id) r.done[k] = "skip"; }
    b.inv.forEach(i => { if (i.paid === t.id){ i.paid = ""; i.status = "sent"; } }); save(); closeSheet(); render(); },
  fq(e){ sel.f = sel.f || {}; sel.f.q = e.value; sel.lim = 0; rerenderKeep(e); },
  ff(e){ sel.f = sel.f || {}; sel.f[e.dataset.k] = e.value; sel.lim = 0; render(); }, fclear(){ sel.f = {}; render(); }, more(){ sel.lim = (sel.lim || 150) + 300; render(); },
  addrec(){ sel.rk = "out"; F.rec(); }, editrec(e){ F.rec(byId(B().rec, e.dataset.id)); },
  rk(e){ sel.rk = e.dataset.v; F.rec(e.dataset.id ? {...byId(B().rec, e.dataset.id), k: e.dataset.v} : {k: e.dataset.v, name: val("f_name"), a: val("f_a")}); },
  saverec(e){ const b = B(), name = val("f_name"), a = num(val("f_a")); if (!name || !a) return toast("Add a name and amount");
    let r = byId(b.rec, e.dataset.id); if (!r){ r = {id: uid(), done: {}}; b.rec.push(r); }
    Object.assign(r, {name, a, k: sel.rk || "out", freq: val("f_freq"), anchor: val("f_anchor") || today(), c: val("f_c"), ac: val("f_ac"), who: val("f_who") || undefined, end: val("f_end") || "", day2: num(val("f_day2")) || 15, auto: val("f_auto"), debt: val("f_debt") || undefined});
    if (r.auto) autoPost(b); save(); closeSheet(); render(); },
  delrec(e){ if (!confirm("Delete this recurring item? Entries already logged stay.")) return; const b = B(); b.rec = b.rec.filter(r => r.id !== e.dataset.id); save(); closeSheet(); render(); },
  tickrec(e){ const b = B(), r = byId(b.rec, e.dataset.id), d = e.dataset.d; r.done = r.done || {};
    if (r.done[d] && r.done[d] !== "skip"){ b.tx = b.tx.filter(x => x.id !== r.done[d]); r.done[d] = r.auto ? "skip" : undefined; if (!r.auto) delete r.done[d]; }
    else { r.done[d] = addTx({d: d > today() ? today() : d, a: r.a, k: r.k, c: r.c, ac: r.ac, note: r.name, who: r.who, rec: r.id, debt: r.debt}, b); toast("✓ " + r.name); }
    save(); render(); },
  rmprev(){ sel.rm = addM(sel.rm || today(), -1); render(); }, rmnext(){ sel.rm = addM(sel.rm || today(), 1); render(); },
  addacc(){ F.acc(); }, editacc(e){ F.acc(byId(B().accounts, e.dataset.id)); },
  saveacc(e){ const b = B(), name = val("f_name"); if (!name) return toast("Add a name"); let a = byId(b.accounts, e.dataset.id); if (!a){ a = {id: uid()}; b.accounts.push(a); }
    Object.assign(a, {name, kind: val("f_kind"), start: num(val("f_start")), spend: val("f_spend")}); save(); closeSheet(); render(); },
  delacc(e){ const b = B(); if (b.tx.some(t => t.ac === e.dataset.id || t.to === e.dataset.id)) return toast("This account has entries — it can't be deleted."); b.accounts = b.accounts.filter(a => a.id !== e.dataset.id); save(); closeSheet(); render(); },
  move(){ sel.fk = "move"; F.tx({k: "move"}); },
  sset(e){ sel[e.dataset.k] = e.value; render(); },
  printstmt(){ printHTML(document.getElementById("stmt").outerHTML); }, printpage(){ printHTML(document.getElementById("app").innerHTML); },
  cmprev(){ sel.cm = addM(sel.cm || today(), -1); render(); }, cmnext(){ sel.cm = addM(sel.cm || today(), 1); render(); }, cday(e){ sel.cd = e.dataset.v; render(); },
  bmprev(){ sel.bm = addM(sel.bm || today(), -1); render(); }, bmnext(){ sel.bm = addM(sel.bm || today(), 1); render(); },
  strat(e){ B().set.strategy = e.dataset.v; save(); render(); }, budonly(){ sel.budonly = !sel.budonly; render(); },
  pset(e){ B().set[e.dataset.k] = e.value; sel.pp = null; save(); render(); },
  ppprev(){ const [f] = payPeriod(B()); sel.pp = addD(f, -1); render(); }, ppnext(){ const [, t] = payPeriod(B()); sel.pp = addD(t, 1); render(); },
  addgoal(){ F.simple("New goal", [["e", "Emoji"], ["name", "Name"], ["target", "Target", "num"], ["saved0", "Already saved", "num"], ["date", "By (optional)", "date"]], "savegoal", {e: "🎯"}); },
  editgoal(e){ F.simple("Edit goal", [["e", "Emoji"], ["name", "Name"], ["target", "Target", "num"], ["saved0", "Saved before using the app", "num"], ["date", "By (optional)", "date"]], "savegoal", byId(B().goals, e.dataset.id), "delgoal"); },
  savegoal(e){ saveSimple("goals", e.dataset.id, ["e", "name", "target", "saved0", "date"], ["target", "saved0"]); }, delgoal(e){ delSimple("goals", e.dataset.id); },
  addfund(){ F.simple("New sinking fund", [["e", "Emoji"], ["name", "Name"], ["target", "Amount needed", "num"], ["due", "Due date", "date"], ["saved0", "Already saved", "num"]], "savefund", {e: "🪣", due: addM(today(), 6)}); },
  editfund(e){ F.simple("Edit sinking fund", [["e", "Emoji"], ["name", "Name"], ["target", "Amount needed", "num"], ["due", "Due date", "date"], ["saved0", "Saved before the app", "num"]], "savefund", byId(B().funds, e.dataset.id), "delfund"); },
  savefund(e){ saveSimple("funds", e.dataset.id, ["e", "name", "target", "due", "saved0"], ["target", "saved0"]); }, delfund(e){ delSimple("funds", e.dataset.id); },
  putaway(e){ const b = B(), ty = e.dataset.t, x = byId(ty === "goal" ? b.goals : b.funds, e.dataset.id); sel.pa = {ty, id: x.id};
    F.amount(`Put money into ${esc(x.name)}`, "saveput", x.id, "Logged as money out to “Savings” from the account you choose (or as a transfer if you pick a savings account).", `<div><label class="f">From</label><select id="f_ac">${accOpts()}</select></div><div><label class="f">Into (optional)</label><select id="f_to">${opt("", "— just log it —")}${accOpts("").replace(/selected/g, "")}</select></div>`); },
  saveput(){ const b = B(), a = num(val("f_a")); if (!a) return; const {ty, id} = sel.pa, to = val("f_to"), sc = b.cats.find(c => c.t === "save");
    if (to && to !== val("f_ac")) addTx({d: today(), k: "move", a, ac: val("f_ac"), to, [ty]: id, note: "Savings"}, b); else addTx({d: today(), k: "out", a, ac: val("f_ac"), c: sc && sc.id, [ty]: id, note: (ty === "goal" ? byId(b.goals, id) : byId(b.funds, id)).name}, b);
    save(); closeSheet(); render(); toast("Saved " + money(a) + " 🐷"); },
  adddebt(){ F.simple("New debt", [["name", "Name"], ["start", "Owed when added", "num"], ["rate", "Interest % a year", "num"], ["min", "Minimum payment / month", "num"]], "savedebt"); },
  editdebt(e){ F.simple("Edit debt", [["name", "Name"], ["start", "Owed when added", "num"], ["rate", "Interest % a year", "num"], ["min", "Minimum payment / month", "num"]], "savedebt", byId(B().debts, e.dataset.id), "deldebt"); },
  savedebt(e){ saveSimple("debts", e.dataset.id, ["name", "start", "rate", "min"], ["start", "rate", "min"]); }, deldebt(e){ delSimple("debts", e.dataset.id); },
  paydebt(e){ const d = byId(B().debts, e.dataset.id); F.amount("Payment on " + esc(d.name), "savedebtpay", d.id, "Minimum is " + money(num(d.min)) + ".", `<div><label class="f">From</label><select id="f_ac">${accOpts()}</select></div>`); },
  savedebtpay(e){ const b = B(), a = num(val("f_a")); if (!a) return; const d = byId(b.debts, e.dataset.id), c = b.cats.find(x => x.t === "debt");
    addTx({d: today(), k: "out", a, ac: val("f_ac"), c: c && c.id, note: d.name, debt: d.id}, b); save(); closeSheet(); render(); toast("Payment logged 💪"); },
  dextra(e){ B().set.extra = num(e.value); save(); render(); }, dm(e){ sel.dm = e.dataset.v; render(); },
  addhold(){ F.simple("New holding", [["name", "Name"], ["sym", "Ticker (optional)"], ["units", "Units", "num"], ["cost", "Average cost per unit", "num"], ["price", "Price now", "num"], ["d", "Bought (date)", "date"]], "savehold", {d: today()}); },
  edithold(e){ F.simple("Edit holding", [["name", "Name"], ["sym", "Ticker"], ["units", "Units", "num"], ["cost", "Average cost per unit", "num"], ["price", "Price now", "num"], ["d", "Bought (date)", "date"]], "savehold", byId(B().hold, e.dataset.id), "delhold"); },
  savehold(e){ saveSimple("hold", e.dataset.id, ["name", "sym", "units", "cost", "price", "d"], ["units", "cost", "price"]); }, delhold(e){ delSimple("hold", e.dataset.id); },
  fc(e){ sel.fc = sel.fc || {start: Math.round(B().hold.reduce((s, h) => s + num(h.units) * num(h.price || h.cost), 0)) || 5000, monthly: 300, rate: 7, years: 20, inc: 2}; sel.fc[e.dataset.k] = num(e.value); render(); },
  addclient(){ F.simple("New client", [["name", "Name"], ["email", "Email"], ["phone", "Phone"], ["note", "Notes", "area"]], "saveclient"); },
  editclient(e){ F.simple("Edit client", [["name", "Name"], ["email", "Email"], ["phone", "Phone"], ["note", "Notes", "area"]], "saveclient", byId(B().clients, e.dataset.id), "delclient"); },
  saveclient(e){ saveSimple("clients", e.dataset.id, ["name", "email", "phone", "note"], []); }, delclient(e){ delSimple("clients", e.dataset.id); },
  addprod(){ F.simple("New product", [["name", "Name"], ["sku", "SKU (optional)"], ["price", "Selling price", "num"], ["cost", "Cost to make (per unit)", "num"]], "saveprod"); },
  editprod(e){ F.simple("Edit product", [["name", "Name"], ["sku", "SKU"], ["price", "Selling price", "num"], ["cost", "Cost per unit", "num"]], "saveprod", byId(B().prods, e.dataset.id), "delprod"); },
  saveprod(e){ saveSimple("prods", e.dataset.id, ["name", "sku", "price", "cost"], ["price", "cost"]); }, delprod(e){ delSimple("prods", e.dataset.id); },
  addinv(){ F.inv(); }, editinv(e){ F.inv(byId(B().inv, e.dataset.id)); },
  invitem(){ syncItems(); sel.invItems.push({d: "", q: 1, p: ""}); document.getElementById("invitems").innerHTML = invItemsHTML(); },
  invdel(e){ syncItems(); sel.invItems.splice(+e.dataset.j, 1); if (!sel.invItems.length) sel.invItems.push({d: "", q: 1, p: ""}); document.getElementById("invitems").innerHTML = invItemsHTML(); },
  saveinv(e){ const b = B(); syncItems(); let cl = val("f_cl");
    if (cl === "__new"){ const n = prompt("Client name:"); if (!n) return; const c = {id: uid(), name: n}; b.clients.push(c); cl = c.id; }
    const items = sel.invItems.filter(x => x.d || num(x.p)); if (!items.length) return toast("Add at least one line");
    let i = byId(b.inv, e.dataset.id); const isNew = !i; if (!i){ i = {id: uid()}; b.inv.push(i); b.set.invNo = (num(b.set.invNo) || 1000) + 1; }
    const was = i.status; Object.assign(i, {no: val("f_no"), cl, d: val("f_d"), due: val("f_due"), items, taxp: num(val("f_taxp")), status: val("f_status"), notes: val("f_notes")});
    if (i.status === "paid" && was !== "paid") markPaid(i); if (i.status !== "paid" && i.paid){ b.tx = b.tx.filter(t => t.id !== i.paid); i.paid = ""; }
    save(); closeSheet(); render(); toast(isNew ? "Invoice created" : "Saved"); },
  delinv(e){ if (!confirm("Delete this invoice?")) return; const b = B(); b.inv = b.inv.filter(i => i.id !== e.dataset.id); save(); closeSheet(); render(); },
  payinv(e){ const i = byId(B().inv, e.dataset.id); markPaid(i); i.status = "paid"; save(); render(); toast("Paid ✓ — income logged"); },
  viewinv(e){ const i = byId(B().inv, e.dataset.id); sel.viewInv = i.id; sheet(`${invoiceHTML(i)}<div class="row" style="margin-top:14px"><span class="sp"></span><button class="btn g" data-act="close">Close</button><button class="btn" data-act="printinv">🖨️ Print / Save PDF</button></div>`); },
  printinv(){ printHTML(invoiceHTML(byId(B().inv, sel.viewInv))); },
  invf(e){ sel.invf = e.dataset.v; render(); },
  taxrate(e){ B().set.taxRate = num(e.value); save(); render(); },
  cmpm(e){ sel.cmpm = e.dataset.v; sel.ca = sel.cb = null; render(); }, cset(e){ sel[e.dataset.k] = e.value; render(); },
  crset(e){ const t = today(); sel.cr = sel.cr || {from: t.slice(0, 4) + "-01-01", to: t, ty: "", who: "", ac: "", cl: ""}; sel.cr[e.dataset.k] = e.value; render(); },
  addwish(){ F.simple("I want…", [["name", "What is it?"], ["price", "Price", "num"], ["why", "Why do I want it?"], ["need", "Is it a need?", "select", opt("", "No — a want") + opt("1", "Yes — a need")]], "savewish"); },
  savewish(){ const b = B(), name = val("f_name"); if (!name) return; b.wish.push({id: uid(), name, price: num(val("f_price")), why: val("f_why"), need: !!val("f_need"), d: today(), dec: "Waiting"}); save(); closeSheet(); render(); },
  wishdec(e){ const w = byId(B().wish, e.dataset.id); w.dec = e.dataset.v; save(); render(); toast(w.dec === "Skipped" ? "Nice — " + money(num(w.price)) + " saved 🧘" : "Enjoy it!"); },
  delwish(e){ const b = B(); b.wish = b.wish.filter(w => w.id !== e.dataset.id); save(); render(); },
  msf(e){ sel.msf = e.dataset.v; render(); },
  newbook(){ F.simple("New book", [["emoji", "Emoji"], ["name", "Name"], ["type", "Type", "select", opt("personal", "Personal / family") + opt("business", "Business")]], "savebook", {emoji: "📘"}); },
  editbook(e){ const x = byId(S.books, e.dataset.id); F.simple("Edit book", [["emoji", "Emoji"], ["name", "Name"]], "savebook", x, S.books.length > 1 ? "delbook" : ""); },
  savebook(e){ const name = val("f_name"); if (!name) return; let x = byId(S.books, e.dataset.id); if (!x){ x = newBook(val("f_type") || "personal", name); S.books.push(x); S.cur = x.id; } x.name = name; x.emoji = val("f_emoji") || x.emoji; save(); closeSheet(); render(); },
  delbook(e){ const x = byId(S.books, e.dataset.id); if (prompt(`Type DELETE to remove “${x.name}” and all its entries.`) !== "DELETE") return; S.books = S.books.filter(b => b.id !== x.id); S.cur = S.books[0].id; save(); closeSheet(); render(); },
  addcat(){ F.simple("New category", [["e", "Emoji"], ["n", "Name"], ["t", "Type", "select", Object.entries(CTYPES).map(([k, v]) => opt(k, v, k === "exp")).join("")], ["grp", "Group (50/30/20)", "select", opt("", "—") + opt("need", "Need") + opt("want", "Want") + opt("save", "Savings & debt")], ["bud", "Monthly budget", "num"]], "savecat", {e: "✨"}); },
  editcat(e){ const c = byId(B().cats, e.dataset.id); F.simple("Edit category", [["e", "Emoji"], ["n", "Name"], ["t", "Type", "select", Object.entries(CTYPES).map(([k, v]) => opt(k, v, k === c.t)).join("")], ["grp", "Group (50/30/20)", "select", opt("", "—", !c.grp) + opt("need", "Need", c.grp === "need") + opt("want", "Want", c.grp === "want") + opt("save", "Savings & debt", c.grp === "save")], ["bud", "Monthly budget", "num"]], "savecat", c, "delcat"); },
  savecat(e){ saveSimple("cats", e.dataset.id, ["e", "n", "t", "grp", "bud"], ["bud"]); },
  delcat(e){ const b = B(); if (b.tx.some(t => t.c === e.dataset.id)) return toast("This category has entries — rename it instead."); delSimple("cats", e.dataset.id); },
  theme(e){ S.look.theme = e.dataset.v; applyTheme(); save(); render(); },
  backup(){ S.lastBackup = today(); save(true); download(`prosper-hub-backup-${today()}.json`, JSON.stringify(S), "application/json"); toast("Backup downloaded 💾"); render(); },
  csv(){ const b = B(); const rows = [["Date", "Type", "Amount", "Category", "Category type", "Account", "To account", "Who", "Client", "Note"]].concat(b.tx.slice().sort((x, y) => x.d < y.d ? -1 : 1).map(t => [t.d, t.k, t.a, t.k === "move" ? "" : cat(t.c, b).n, t.k === "move" ? "transfer" : CTYPES[cat(t.c, b).t], acc(t.ac, b).name, t.to ? acc(t.to, b).name : "", t.who || "", t.cl && client(t.cl) ? client(t.cl).name : "", t.note || ""]));
    download(`prosper-hub-${b.name.replace(/\W+/g, "-")}-${today()}.csv`, rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n"), "text/csv"); },
  demo(){ if (S.onboarded && S.books.some(b => b.tx.length) && !confirm("Replace everything with example data?")) return; S = demoData(); YEAR = null; sel = {}; view = "dash"; save(true); applyTheme(); render(); toast("Example data loaded — explore away!"); },
  erase(){ if (!confirm("Erase everything on this device? There's no undo.")) return; if (prompt("Type ERASE to confirm") !== "ERASE") return; localStorage.removeItem(KEY); S = blank(); sel = {}; view = "dash"; render(); },
  close: closeSheet, closebg(e, ev){ if (ev.target === e) closeSheet(); },
  obt(e){ sel.obt = e.value; },
  obnext(){ const st = sel.ob || 0;
    if (st === 0){ S.profile.name = val("ob_name"); S.profile.cur = val("ob_cur") || "$"; }
    if (st === 2){ const ty = sel.obt || "both"; S.books = [];
      if (ty !== "business"){ const b = newBook("personal", "Home"); b.accounts[0].start = num(val("ob_bal")); const amt = num(val("ob_amt")); const ic = b.cats.find(c => c.t === "income");
        if (amt) b.rec.push({id: uid(), name: "My pay", a: amt, k: "in", freq: val("ob_freq"), anchor: val("ob_date") || today(), c: ic.id, ac: b.accounts[0].id, auto: true, done: {}}); S.books.push(b); }
      if (ty !== "personal"){ const b = newBook("business", "My business"); b.accounts[0].start = num(val("ob_bbal")); S.books.push(b); }
      S.cur = S.books[0].id; S.onboarded = true; S.created = today(); sel = {}; save(true); render(); toast("You're all set 🌿"); try{ navigator.storage && navigator.storage.persist && navigator.storage.persist(); }catch(_){} return; }
    sel.ob = st + 1; render(); },
  obback(){ sel.ob = Math.max(0, (sel.ob || 0) - 1); render(); },
};
function markPaid(i){ const b = B(); if (i.paid && b.tx.some(t => t.id === i.paid)) return; const c = b.cats.find(x => x.n === "Services") || b.cats.find(x => x.t === "income");
  i.paid = addTx({d: today(), k: "in", a: invTotal(i), c: c.id, cl: i.cl, inv: i.id, note: "Invoice " + i.no, ac: b.accounts[0].id}, b); i.paidOn = today(); }
function syncItems(){ document.querySelectorAll('[data-act="ii"]').forEach(el => { const x = sel.invItems[+el.dataset.j]; if (x) x[el.dataset.k] = el.dataset.k === "d" ? el.value : el.value; }); }
function saveSimple(coll, id, keys, nums){ const b = B(); let x = byId(b[coll], id); const isNew = !x; if (!x) x = {id: uid()};
  for (const k of keys){ const v = val("f_" + k); x[k] = nums.includes(k) ? num(v) : v; }
  if (!x.name && !x.n) return toast("Add a name"); if (isNew) b[coll].push(x); save(); closeSheet(); render(); }
function delSimple(coll, id){ if (!confirm("Delete this?")) return; const b = B(); b[coll] = b[coll].filter(x => x.id !== id); save(); closeSheet(); render(); }
function printHTML(html){ const p = document.getElementById("printarea"); p.innerHTML = html; setTimeout(() => window.print(), 50); }
function download(name, text, type){ const bl = new Blob([text], {type}); const a = document.createElement("a"); a.href = URL.createObjectURL(bl); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
function rerenderKeep(el){ const id = el.dataset.act, pos = el.selectionStart; render(); const n = document.querySelector(`[data-act="${id}"]`); if (n){ n.focus(); try{ n.setSelectionRange(pos, pos); }catch(_){} } }
function importCSV(text){
  const b = B(), lines = text.split(/\r?\n/).filter(l => l.trim()); if (lines.length < 2) return toast("Empty file");
  const parse = l => { const out = []; let cur = "", q = false; for (const ch of l){ if (ch === '"') q = !q; else if (ch === "," && !q){ out.push(cur); cur = ""; } else cur += ch; } out.push(cur); return out.map(s => s.trim()); };
  const hd = parse(lines[0]).map(h => h.toLowerCase()), ix = n => hd.findIndex(h => h.includes(n)); const di = ix("date"), ai = ix("amount"), ci = ix("categ"), ni = ix("note") >= 0 ? ix("note") : ix("desc");
  if (di < 0 || ai < 0) return toast("Need at least Date and Amount columns");
  let n = 0; for (const l of lines.slice(1)){ const r = parse(l); let d = r[di]; const a = num(r[ai]); if (!a || !d) continue;
    if (/^\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4}$/.test(d)){ const [x, y, z] = d.split(/[\/.-]/); d = `${z}-${pad(+y)}-${pad(+x)}`; } if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) continue;
    const cn = ci >= 0 ? r[ci] : ""; let c = b.cats.find(x => x.n.toLowerCase() === cn.toLowerCase()); if (!c && cn){ c = {id: uid(), n: cn, e: "✨", t: a > 0 ? "income" : "exp", grp: "", bud: 0}; b.cats.push(c); }
    if (!c) c = b.cats.find(x => a > 0 ? x.t === "income" : x.t === "exp");
    addTx({d, a: Math.abs(a), k: a > 0 ? "in" : "out", c: c.id, note: ni >= 0 ? r[ni] : ""}, b); n++; }
  save(); render(); toast(`Imported ${n} entries ✓`);
}

/* ================================================================ events */
document.addEventListener("click", ev => {
  const g = ev.target.closest("[data-go]"); if (g && !ev.target.closest("select")){ view = g.dataset.go; sel = {}; closeSheet(); render(); window.scrollTo(0, 0); return; }
  const a = ev.target.closest("[data-act]"); if (!a) return; const k = a.dataset.act;
  if (["todo", "todotext", "brain", "fq", "ff", "hq", "book", "year", "restore", "importcsv", "sset", "pset", "bud", "dextra", "fc", "taxrate", "cset", "crset", "people", "ii", "obt"].includes(k)) return;
  if (ACT[k]){ ev.preventDefault(); ACT[k](a, ev); }
});
document.addEventListener("change", ev => {
  const s = ev.target.closest("[data-set]"); if (s){ const [o, k] = s.dataset.set.split("."); S[o][k] = k === "dec" ? Number(s.value) : s.value; save(); if (k !== "name") render(); return; }
  const bs = ev.target.closest("[data-bset]"); if (bs){ const k = bs.dataset.bset; B().set[k] = ["target", "invNo", "taxRate", "wait", "wage"].includes(k) ? num(bs.value) : bs.value; save(); return; }
  const a = ev.target.closest("[data-act]"); if (!a) return; const k = a.dataset.act;
  if (["book", "year", "ff", "sset", "pset", "dextra", "fc", "taxrate", "cset", "crset", "obt"].includes(k)) return ACT[k](a);
  if (k === "todo"){ const t = today(); S.todos[t + "_d"] = S.todos[t + "_d"] || [false, false, false]; S.todos[t + "_d"][a.dataset.i] = a.checked; save(); render(); if (a.checked) toast("Nice one ✨"); }
  if (k === "bud"){ const b = B(), c = byId(b.cats, a.dataset.id), m = (sel.bm || mStart(today())).slice(0, 7), v = num(a.value);
    if (sel.budonly){ b.bud[m] = b.bud[m] || {}; b.bud[m][c.id] = v; } else { c.bud = v; for (const mm in b.bud) if (mm >= m && b.bud[mm][c.id] != null) delete b.bud[mm][c.id]; const pm = addM(m + "-01", -1).slice(0, 7); }
    save(); render(); }
  if (k === "people"){ S.people = a.value.split(",").map(x => x.trim()).filter(Boolean); save(); render(); }
  if (k === "restore"){ const f = a.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try{ const d = JSON.parse(r.result); if (!d || !d.books) throw 0; if (!confirm("Replace the data on this device with this backup?")) return; S = Object.assign(blank(), d); save(true); applyTheme(); render(); toast("Backup restored ✓"); }catch(e){ toast("That file isn't a Prosper Hub backup."); } }; r.readAsText(f); }
  if (k === "importcsv"){ const f = a.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => importCSV(r.result); r.readAsText(f); }
});
let typT;
document.addEventListener("input", ev => {
  const a = ev.target.closest("[data-act]"); if (!a) return; const k = a.dataset.act, t = today();
  if (k === "todotext"){ S.todos[t] = S.todos[t] || ["", "", ""]; S.todos[t][a.dataset.i] = a.value; save(); }
  if (k === "brain"){ S.brain = a.value; save(); }
  if (k === "fq"){ clearTimeout(typT); typT = setTimeout(() => ACT.fq(a), 250); }
  if (k === "hq"){ sel.hq = a.value; rerenderKeep(a); }
  if (k === "ii"){ const x = sel.invItems[+a.dataset.j]; if (x) x[a.dataset.k] = a.value; }
});
document.addEventListener("keydown", ev => {
  if (ev.key === "Enter" && ev.target.id === "qamt"){ ev.preventDefault(); keepQuick(); quickLog(); return; }
  if (ev.key === "Escape") closeSheet();
  if (/INPUT|TEXTAREA|SELECT/.test(ev.target.tagName) || ev.metaKey || ev.ctrlKey || ev.altKey || !S.onboarded) return;
  const m = {d: "dash", t: "today", l: "tx", b: "budget", r: "reports"};
  if (ev.key === "/"){ ev.preventDefault(); view = "today"; render(); setTimeout(() => { const q = document.getElementById("qamt"); if (q) q.focus(); }, 0); }
  else if (ev.key === "n" || ev.key === "N"){ ACT.addtx(); }
  else if (m[ev.key]){ view = m[ev.key]; sel = {}; render(); }
});

/* ================================================================ render */
function applyTheme(){ const t = S.look.theme === "auto" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : S.look.theme;
  document.documentElement.dataset.theme = t; document.querySelector('meta[name="theme-color"]').content = t === "dark" ? "#0D1724" : "#F3F6F8"; }
const SCR = {dash: scrDash, today: scrToday, calendar: scrCalendar, tx: scrTx, recurring: scrRecurring, accounts: scrAccounts, statement: scrStatement, budget: scrBudget, paycheck: scrPaycheck,
  goals: scrGoals, funds: scrFunds, debt: scrDebt, invest: scrInvest, networth: scrNetworth, invoices: scrInvoices, clients: scrClients, products: scrProducts, pnl: scrPnl, tax: scrTax,
  reports: scrReports, compare: scrCompare, custom: scrCustom, people: scrPeople, rule: scrRule, habits: scrHabits, milestones: scrMilestones, settings: scrSettings, help: scrHelp, more: scrMore};
const BIZ_ONLY = ["invoices", "clients", "products", "pnl", "tax"], PERS_ONLY = ["paycheck", "rule"];
function render(){
  const app = document.getElementById("app");
  if (!S.onboarded){ app.innerHTML = scrOnboard(); document.getElementById("bnav").innerHTML = ""; document.getElementById("snav").innerHTML = ""; return; }
  if ((isBiz() && PERS_ONLY.includes(view)) || (!isBiz() && BIZ_ONLY.includes(view))) view = "dash";
  try{ app.innerHTML = (SCR[view] || scrDash)(); }catch(e){ console.error(e); app.innerHTML = `<div class="card"><b>Something went wrong on this screen.</b><div class="sub">${esc(e.message)}</div><button class="btn" data-go="dash" style="margin-top:10px">Back to Dashboard</button></div>`; }
  renderNav();
}

/* ================================================================ example data */
function demoData(){
  const D = blank(); D.onboarded = true; D.profile.name = "Alex"; D.people = ["Alex", "Sam", "Shared"]; const t = today(), y0 = (+t.slice(0, 4) - 2) + "-01-01"; D.created = y0;
  let seed = 11; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280, pick = a => a[Math.floor(rnd() * a.length)], between = (a, b) => r2(a + rnd() * (b - a));
  /* ---------- personal ---------- */
  const P = D.books[0]; P.name = "Home"; S = D; D.cur = P.id;
  const chk = P.accounts[0]; chk.start = 1800; const sav = {id: uid(), name: "Savings", kind: "savings", start: 2500, spend: false}, card = {id: uid(), name: "Credit card", kind: "card", start: 0, spend: false};
  P.accounts.push(sav, card);
  const C = n => P.cats.find(c => c.n === n).id;
  const budgets = {"Rent / Mortgage": 1450, Electricity: 110, Water: 45, Internet: 60, Phone: 70, Insurance: 110, Streaming: 16, Gym: 45, "Apps & cloud": 10, Groceries: 650, "Eating out": 220, Coffee: 45, Transport: 90, Fuel: 150, Shopping: 150, Fun: 120, Health: 60, Kids: 140, Pets: 60, Gifts: 60, Travel: 150, "Home & repairs": 80, Other: 50, Savings: 500, "Debt payments": 620, Salary: 6200};
  P.cats.forEach(c => { if (budgets[c.n]) c.bud = budgets[c.n]; });
  P.debts = [{id: uid(), name: "Credit card (old balance)", start: 4200, rate: 21.9, min: 120}, {id: uid(), name: "Car loan", start: 14500, rate: 6.9, min: 320}, {id: uid(), name: "Student loan", start: 9800, rate: 4.5, min: 180}];
  const R = (name, a, k, c, freq, anchor, auto, who, extra = {}) => P.rec.push({id: uid(), name, a, k, c: C(c), ac: chk.id, freq, anchor, auto, who, done: {}, ...extra});
  R("Salary — Alex", 1650, "in", "Salary", "fortnightly", addD(y0, 4), true, "Alex"); R("Salary — Sam", 2600, "in", "Salary", "monthly", y0.slice(0, 8) + "25", true, "Sam");
  R("Rent", 1450, "out", "Rent / Mortgage", "monthly", y0, true, "Shared"); R("Internet", 60, "out", "Internet", "monthly", y0.slice(0, 8) + "18", true, "Shared");
  R("Phone plans", 70, "out", "Phone", "monthly", y0.slice(0, 8) + "22", true, "Shared"); R("Car insurance", 660, "out", "Insurance", "yearly", y0.slice(0, 5) + "03-05", false, "Alex");
  R("Home insurance", 38, "out", "Insurance", "monthly", y0.slice(0, 8) + "08", false, "Shared"); R("Netflix", 15.49, "out", "Streaming", "monthly", y0.slice(0, 8) + "10", true, "Shared");
  R("Gym", 45, "out", "Gym", "monthly", y0.slice(0, 8) + "03", true, "Sam"); R("Cloud storage", 9.99, "out", "Apps & cloud", "monthly", y0.slice(0, 8) + "15", true, "Alex");
  R("Water bill", 88, "out", "Water", "bimonthly", y0.slice(0, 8) + "12", false, "Shared");
  R("Card payment", 120, "out", "Debt payments", "monthly", y0.slice(0, 8) + "20", true, "Shared", {debt: P.debts[0].id}); R("Car loan", 320, "out", "Debt payments", "monthly", y0.slice(0, 8) + "26", true, "Alex", {debt: P.debts[1].id});
  R("Student loan", 180, "out", "Debt payments", "monthly", y0.slice(0, 8) + "28", true, "Sam", {debt: P.debts[2].id});
  autoPost(P);
  P.rec.filter(r => !r.auto).forEach(r => { for (const d of occ(r, r.anchor, addD(t, -3))) r.done[d] = addTx({d, a: r.a, k: r.k, c: r.c, ac: r.ac, note: r.name, who: r.who, rec: r.id}, P); });
  P.goals = [{id: uid(), name: "Emergency fund", e: "🛟", target: 12000, saved0: 2000, date: addM(t, 10)}, {id: uid(), name: "Japan trip", e: "🗾", target: 5000, saved0: 400, date: addM(t, 7)}, {id: uid(), name: "New laptop", e: "💻", target: 1600, saved0: 0}];
  P.funds = [{id: uid(), name: "Car insurance", e: "🚗", target: 660, due: t.slice(0, 4) + "-03-05" < t ? (+t.slice(0, 4) + 1) + "-03-05" : t.slice(0, 4) + "-03-05", saved0: 180}, {id: uid(), name: "Holiday gifts", e: "🎄", target: 900, due: t.slice(0, 4) + "-12-15", saved0: 520}, {id: uid(), name: "School fees", e: "🎒", target: 1400, due: addM(t, 9), saved0: 300}];
  const seas = [1.25, 1.05, 1, .95, .95, 1.05, 1.15, 1.15, 1, .95, 1.05, 1.4];
  const plan = [["Groceries", .5, 30, 110, chk], ["Eating out", .25, 14, 60, card], ["Coffee", .55, 3.5, 7, card], ["Transport", .3, 3, 14, chk], ["Fuel", .12, 40, 70, card], ["Shopping", .12, 15, 120, card], ["Fun", .12, 12, 60, card],
    ["Health", .05, 10, 60, chk], ["Kids", .1, 8, 60, chk], ["Pets", .07, 10, 45, chk], ["Gifts", .05, 15, 80, card], ["Home & repairs", .04, 15, 140, chk], ["Other", .05, 5, 40, chk]];
  const NOTE = {Groceries: ["Weekly shop", "", "Market", ""], Coffee: ["Flat white", "Latte", ""], "Eating out": ["Pizza night", "Lunch", "Sushi", ""], Fuel: ["Fill up"], Kids: ["School supplies", "Swimming", ""], Pets: ["Vet", "Food"], Health: ["Pharmacy", "Dentist"]};
  for (let d = y0; d <= t; d = addD(d, 1)){
    const m = dd(d).getMonth(); if (rnd() < .09) continue;
    for (const [n, p, lo, hi, ac] of plan) if (rnd() < p * seas[m]) addTx({d, a: between(lo, hi), k: "out", c: C(n), ac: ac.id, who: pick(["Alex", "Sam", "Shared", "Shared"]), note: pick(NOTE[n] || [""])}, P);
    if (dd(d).getDate() === 15){ addTx({d, a: between(70, 140) * (m < 2 || m > 10 ? 1.4 : 1), k: "out", c: C("Electricity"), ac: chk.id, who: "Shared", note: "Electricity"}, P);
      addTx({d, a: 250, k: "out", c: C("Savings"), ac: chk.id, goal: P.goals[0].id, note: "Emergency fund"}, P); addTx({d, a: 150, k: "move", ac: chk.id, to: sav.id, goal: P.goals[1].id, note: "Trip savings"}, P);
      addTx({d, a: 60, k: "out", c: C("Savings"), ac: chk.id, fund: P.funds[pick([0, 1, 2])].id, note: "Sinking fund"}, P); addTx({d: addD(d, 1), a: 1300, k: "move", ac: chk.id, to: sav.id, note: "Monthly savings"}, P); }
    if (dd(d).getDate() === 27){ const ms = mStart(d), owed = P.tx.filter(x => x.ac === card.id && x.k === "out" && x.d >= addM(ms, -1) && x.d < ms).reduce((s, x) => s + x.a, 0); if (owed) addTx({d, a: r2(owed), k: "move", ac: chk.id, to: card.id, note: "Card bill"}, P); }
    if (m === 6 && dd(d).getDate() === 10) addTx({d, a: between(900, 1500), k: "out", c: C("Travel"), ac: card.id, who: "Shared", note: "Summer trip"}, P);
    if ((m === 5 || m === 11) && dd(d).getDate() === 28) addTx({d, a: 1200, k: "in", c: C("Other income"), ac: chk.id, who: "Alex", note: "Bonus"}, P);
    if (dd(d).getDay() === 6 && rnd() < .3) addTx({d, a: between(80, 260), k: "in", c: C("Side income"), ac: chk.id, who: "Sam", note: "Weekend market"}, P);
  }
  P.hold = [{id: uid(), name: "World index fund", sym: "VWRL", units: 140, cost: 92, price: 118, d: y0}, {id: uid(), name: "S&P 500 ETF", sym: "VOO", units: 9, cost: 380, price: 512, d: addM(y0, 8)}, {id: uid(), name: "Bitcoin", sym: "BTC", units: .05, cost: 31000, price: 64000, d: addM(y0, 14)}];
  P.wish = [{id: uid(), name: "Noise-cancelling headphones", price: 349, d: addD(t, -40), dec: "Skipped"}, {id: uid(), name: "Air fryer", price: 129, d: addD(t, -35), dec: "Bought"}, {id: uid(), name: "Designer trainers", price: 220, d: addD(t, -9), dec: "Waiting"}, {id: uid(), name: "Standing desk", price: 480, d: addD(t, -26), dec: "Waiting"}];
  P.set.wage = 32; P.set.ptype = "fortnightly"; P.set.pstart = addD(y0, 4); P.set.extra = 150;
  /* ---------- business ---------- */
  const Bz = newBook("business", "Stitch & Co (Etsy)"); D.books.push(Bz); S = D; D.cur = Bz.id;
  const ba = Bz.accounts[0]; ba.start = 4500; const pp = {id: uid(), name: "Etsy payments", kind: "bank", start: 0, spend: false}; Bz.accounts.push(pp);
  const BC = n => Bz.cats.find(c => c.n === n).id;
  Bz.set = {...Bz.set, bizName: "Stitch & Co", bizAddr: "12 Mill Lane, Leeds\nhello@stitchandco.shop\nBank: 12-34-56 · 87654321", target: 7500, taxRate: 22, invNo: 1001};
  Bz.prods = [["Custom embroidered hoodie", 58, 19], ["Personalised tote bag", 32, 10], ["Wedding hoop art", 85, 21], ["Pet portrait patch", 24, 6], ["Embroidery pattern (PDF)", 12, 0], ["Monogram cap", 29, 9]].map(([name, price, cost], i) => ({id: uid(), name, price, cost, sku: "SC-" + (101 + i)}));
  Bz.clients = ["Bloom Bridal Boutique", "Northside Coffee Co.", "Leeds Rugby Club", "Harper & Finch Events", "Little Paws Rescue", "Maple Primary School"].map((n, i) => ({id: uid(), name: n, email: n.toLowerCase().replace(/[^a-z]+/g, "") + "@mail.com"}));
  const seasB = [.7, .75, .85, .9, 1, 1.05, .95, .95, 1.05, 1.15, 1.55, 1.8];
  for (let d = y0; d <= t; d = addD(d, 1)){
    const m = dd(d).getMonth(), growth = 1 + diffD(y0, d) / 900; const n = Math.floor(rnd() * 4.6 * seasB[m] * growth);
    for (let i = 0; i < n; i++){ const p = pick(Bz.prods), q = rnd() < .15 ? 2 : 1; addTx({d, a: r2(p.price * q), k: "in", c: BC("Sales"), ac: pp.id, prod: p.id, qty: q, note: p.name}, Bz); }
    const dom = dd(d).getDate();
    if (dom === 1){ const ms = addM(d, -1), rev = Bz.tx.filter(x => x.k === "in" && x.d >= ms && x.d < d && x.c === BC("Sales")).reduce((s, x) => s + x.a, 0);
      if (rev){ addTx({d, a: r2(rev * .095), k: "out", c: BC("Platform fees"), ac: pp.id, note: "Etsy fees"}, Bz); addTx({d, a: r2(rev * .9), k: "move", ac: pp.id, to: ba.id, note: "Etsy payout"}, Bz); } }
    if (dom === 3) addTx({d, a: between(380, 900) * seasB[m], k: "out", c: BC("Materials"), ac: ba.id, note: pick(["Thread & fabric", "Blank hoodies", "Hoops & frames"])}, Bz);
    if (dom === 5) addTx({d, a: between(60, 140) * seasB[m], k: "out", c: BC("Packaging"), ac: ba.id, note: "Mailers & tissue"}, Bz);
    if (dom % 7 === 2) addTx({d, a: between(40, 120) * seasB[m], k: "out", c: BC("Shipping"), ac: ba.id, note: "Postage"}, Bz);
    if (dom === 10) addTx({d, a: between(120, 420) * seasB[m], k: "out", c: BC("Advertising"), ac: ba.id, note: pick(["Etsy ads", "Instagram ads", "Pinterest ads"])}, Bz);
    if (dom === 12) addTx({d, a: 39, k: "out", c: BC("Software"), ac: ba.id, note: "Design software"}, Bz);
    if (dom === 20) addTx({d, a: 45, k: "out", c: BC("Internet & phone"), ac: ba.id, note: "Studio internet"}, Bz);
    if (dom === 1 && d >= addM(y0, 12)) addTx({d, a: 550, k: "out", c: BC("Rent / studio"), ac: ba.id, note: "Studio rent"}, Bz);
    if (dom === 28) addTx({d, a: d >= addM(y0, 12) ? 2700 : 1200, k: "out", c: BC("Owner's pay"), ac: ba.id, note: "Owner's pay"}, Bz);
    if (dom === 18 && rnd() < .12) addTx({d, a: between(150, 900), k: "out", c: BC("Equipment"), ac: ba.id, note: pick(["Embroidery machine service", "New hoops", "Heat press"])}, Bz);
    if (dom === 15 && [3, 6, 9, 0].includes(m)){ const f = addM(d, -3), p = pnl(f, addD(d, -1), Bz); if (p.net > 0) addTx({d, a: r2(p.net * .22), k: "out", c: BC("Tax payments"), ac: ba.id, note: "Quarterly tax"}, Bz); }
  }
  let no = 1001; for (let m = addM(y0, 1); m <= t; m = addM(m, 1)){ for (let k = 0; k < (rnd() < .6 ? 2 : 1); k++){ const d = addD(m, Math.floor(rnd() * 25)); if (d > t) continue; const c = pick(Bz.clients);
      const items = [{d: pick(["Embroidered staff polos", "Custom logo patches", "Wedding favour bags", "Team hoodies", "Event table runners"]), q: pick([10, 20, 25, 40, 50]), p: pick([8, 12, 18, 24, 32])}]; if (rnd() < .4) items.push({d: "Digitizing / setup fee", q: 1, p: 45});
      const i = {id: uid(), no: "INV-" + no++, cl: c.id, d, due: addD(d, 14), items, taxp: 0, status: "sent", notes: "Payment by bank transfer within 14 days."}; Bz.inv.push(i);
      const age = diffD(d, t); if (age > 30 || (age > 12 && rnd() < .5)){ i.status = "paid"; const pd = addD(d, 5 + Math.floor(rnd() * 12)); i.paidOn = pd > t ? t : pd; i.paid = addTx({d: i.paidOn, k: "in", a: invTotal(i), c: BC("Services"), cl: c.id, inv: i.id, ac: ba.id, note: "Invoice " + i.no}, Bz); } } }
  Bz.inv.push({id: uid(), no: "INV-" + no++, cl: Bz.clients[0].id, d: t, due: addD(t, 14), items: [{d: "Bridal party robes (embroidered)", q: 8, p: 38}], taxp: 0, status: "draft", notes: ""});
  Bz.inv.push({id: uid(), no: "INV-" + no++, cl: Bz.clients[2].id, d: addD(t, -26), due: addD(t, -12), items: [{d: "Club hoodies with crest", q: 30, p: 26}, {d: "Digitizing / setup fee", q: 1, p: 45}], taxp: 0, status: "sent", notes: "Payment by bank transfer within 14 days."});
  Bz.inv.push({id: uid(), no: "INV-" + no++, cl: Bz.clients[1].id, d: addD(t, -6), due: addD(t, 8), items: [{d: "Barista aprons with logo", q: 14, p: 22}], taxp: 0, status: "sent", notes: "Payment by bank transfer within 14 days."});
  Bz.set.invNo = no; Bz.rec.push({id: uid(), name: "Design software", a: 39, k: "out", c: BC("Software"), ac: ba.id, freq: "monthly", anchor: addD(t, 7).slice(0, 8) + "12", auto: false, done: {}});
  Bz.goals = [{id: uid(), name: "New embroidery machine", e: "🧵", target: 6500, saved0: 2100, date: addM(t, 8)}]; Bz.debts = [{id: uid(), name: "Equipment loan", start: 4800, rate: 7.5, min: 160}];
  for (let m = addM(t, -10); m <= t; m = addM(m, 1)) addTx({d: addD(m, 9), a: 160, k: "out", c: BC("Loan repayment"), ac: ba.id, debt: Bz.debts[0].id, note: "Equipment loan"}, Bz);
  D.cur = P.id; D.todos[t] = ["Tick off the water bill", "Send Bloom Bridal their invoice", "Move $50 to the Japan fund"]; D.todos[t + "_d"] = [true, false, false];
  D.brain = "• Mum's birthday on the 18th — card + flowers\n• Ask Northside Coffee about a reorder\n• Check if the gym has a cheaper plan"; D.lastBackup = addD(t, -12);
  return D;
}

/* ================================================================ boot */
S = load(); S = S ? Object.assign(blank(), S) : blank();
if (S.onboarded) S.books.forEach(b => { if (autoPost(b)) save(true); });
applyTheme();
if (matchMedia("(prefers-color-scheme: dark)").addEventListener) matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { if (S.look.theme === "auto") applyTheme(); });
checkMilestones(); render();
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js").catch(() => {});
