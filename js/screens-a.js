"use strict";
/* ================================================================ navigation */
function navDef(){
  const biz = isBiz();
  return [
    ["Overview", [["dash", "📊", "Dashboard"], ["today", "☀️", "Today"], ["calendar", "🗓️", "Calendar"]]],
    ["Money", [["tx", "🧾", "Transactions"], ["recurring", "🔁", "Recurring & bills"], ["accounts", "🏦", "Accounts"], ["statement", "📄", "Statement"]]],
    ["Plan", [["budget", "📋", "Budget"], ...(biz ? [] : [["paycheck", "💵", "Paycheck budget"]]), ["goals", "🎯", "Goals"], ["funds", "🪣", "Sinking funds"], ["debt", "💳", "Debt payoff"], ["invest", "📈", "Investments"], ["networth", "🏛️", "Net worth"]]],
    ...(biz ? [["Business", [["invoices", "📨", "Invoices"], ["clients", "🤝", "Clients"], ["products", "📦", "Products"], ["pnl", "💹", "Profit & loss"], ["tax", "🧾", "Tax set-aside"]]]] : []),
    ["Insights", [["reports", "📊", "Reports"], ["compare", "⚖️", "Compare"], ["custom", "🔎", "Custom report"], ["people", "👪", "People"], ...(biz ? [] : [["rule", "🥧", "50/30/20"]]), ["habits", "🌿", "Habits"]]],
    ["App", [["milestones", "🏅", "Milestones"], ["settings", "⚙️", "Settings"], ["help", "❓", "Help"]]],
  ];
}
function renderNav(){
  const bottom = [["dash", "📊", "Home"], ["today", "☀️", "Today"], ["tx", "🧾", "Log"], isBiz() ? ["invoices", "📨", "Invoices"] : ["budget", "📋", "Budget"], ["more", "☰", "More"]];
  const main = bottom.slice(0, 4).map(x => x[0]);
  document.getElementById("bnav").innerHTML = bottom.map(([k, e, t]) => `<button data-go="${k}" class="${view === k || (k === "more" && !main.includes(view)) ? "on" : ""}"><b>${e}</b>${t}</button>`).join("");
  document.getElementById("snav").innerHTML = `<div class="brand">🌿 Prosper Hub</div>` + navDef().map(([g, items]) => `<div class="grp">${g}</div>` +
    items.map(([k, e, t]) => `<button class="nv ${view === k ? "on" : ""}" data-go="${k}">${e} ${t}</button>`).join("")).join("");
}
function bookSel(){
  return `<div class="booksel"><span>${esc(B().emoji)}</span><select data-act="book">${S.books.map(b => `<option value="${b.id}" ${b.id === S.cur ? "selected" : ""}>${esc(b.name)}</option>`).join("")}<option value="__new">+ New book…</option></select></div>`;
}
function yearSel(){
  const ys = years(); const cur = YEAR || new Date().getFullYear();
  return `<div class="booksel"><span>📅</span><select data-act="year">${ys.map(y => `<option ${cur == y ? "selected" : ""}>${y}</option>`).join("")}<option value="all" ${cur === "all" ? "selected" : ""}>All time</option></select></div>`;
}
function head(title, sub, right = "", withYear = false){
  return `<div class="top"><div><div class="ttl">${title}</div><div class="sub">${sub}</div></div><div class="bookbar">${bookSel()}${withYear ? yearSel() : ""}${right}</div></div>`;
}
const kpi = (k, v, color, d = "") => `<div class="card kpi"><div class="k">${k}</div><div class="v" style="color:${color || "var(--ink)"}">${v}</div>${d ? `<div class="d">${d}</div>` : ""}</div>`;
function txRow(t, b = B(), opts = {}){
  const c = cat(t.c, b), mv = t.k === "move", o = t.k === "out";
  const sub = [opts.noDate ? "" : nice(t.d), mv ? acc(t.ac, b).name + " → " + acc(t.to, b).name : (b.accounts.length > 1 ? acc(t.ac, b).name : ""), t.who && S.people.length > 1 ? t.who : "", t.cl && client(t.cl) ? client(t.cl).name : "", t.rec ? "recurring" : ""].filter(Boolean).join(" · ");
  return `<div class="it" data-act="edittx" data-id="${t.id}" style="cursor:pointer"><div class="ic">${mv ? "⇄" : c.e}</div><div class="sp"><div class="t">${esc(mv ? "Transfer" : t.note || c.n)}</div><div class="s">${esc(t.note && !mv ? c.n + (sub ? " · " : "") : "")}${esc(sub)}</div></div>
    <div class="amt ${o ? "o" : mv ? "" : "i"}">${money(o ? -t.a : t.a, !mv)}</div></div>`;
}

/* ================================================================ DASHBOARD */
function scrDash(){
  const b = B(), [from, to, lab] = scope(), t = today(), all = YEAR === "all", biz = isBiz();
  const tt = totals(from, to, b), nw = netWorth(null, b);
  const pt = (f, e) => { if (biz){ const q = pnl(f, e, b); return {in: q.rev, out: q.cogs + q.opex}; } const x = totals(f, e, b); return {in: x.in, out: x.out}; };
  const series = all ? years().map(y => ({label: String(y), ...pt(y + "-01-01", y + "-12-31")})) : monthly(from, to, pt);
  const p = biz ? pnl(from, to, b) : null;
  const cats = Object.entries(tt.byCat).map(([id, v]) => ({c: cat(id, b), v})).filter(x => x.c.t !== "income" && x.c.t !== "move").sort((a, c) => c.v - a.v);
  const due = dueList(t, addD(t, 14), b).filter(x => !x.done).slice(0, 7);
  const recent = b.tx.slice().sort((a, c) => a.d < c.d ? 1 : -1).slice(0, 6);
  const k = biz ? [kpi("Revenue", money(p.rev), "var(--in)", lab), kpi("Profit", money(p.net), p.net >= 0 ? "var(--ok)" : "var(--out)", "margin " + pct(p.net, p.rev)),
                   kpi("Expenses", money(p.cogs + p.opex), "var(--out)", "COGS " + money(p.cogs, false, true)), kpi("Cash in accounts", money(nw.accs), "var(--ink)", b.accounts.length + " account" + (b.accounts.length > 1 ? "s" : ""))]
                : [kpi("Money in", money(tt.in), "var(--in)", lab), kpi("Spending", money(tt.spend), "var(--out)", "bills, subs & everyday"),
                   kpi("Saved", money(tt.net), tt.net >= 0 ? "var(--ok)" : "var(--out)", "savings rate " + pct(Math.max(0, tt.net), tt.in)), kpi("Net worth", money(nw.nw), "var(--save)", "today")];
  return `${head("Dashboard", `${esc(b.name)} · ${lab}`, "", true)}
  <div class="grid g4">${k.join("")}</div>
  <div class="grid g21" style="margin-top:12px">
   <div class="grid">
    <div class="card"><h2><span>${all ? "Year by year" : "Month by month"}</span><span class="sub">${biz ? "revenue vs costs" : "in vs out"}</span></h2>
     ${bars(series.map(x => x.label), [{name: biz ? "Revenue" : "Money in", color: "var(--in)", values: series.map(x => x.in)}, {name: biz ? "Costs" : "Money out", color: "var(--out)", values: series.map(x => x.out)}], {line: {name: biz ? "Profit" : "Net", color: "var(--brand)", values: series.map(x => x.in - x.out)}})}</div>
    <div class="card"><h2><span>Where the money went</span><span class="sub">${lab}</span></h2>${cats.length ? donut(cats.slice(0, 8).map((x, i) => ({label: x.c.e + " " + x.c.n, value: x.v, color: PAL[i % PAL.length]})), {title: "Money out"}) : `<div class="empty">Nothing logged yet.</div>`}</div>
   </div>
   <div class="grid">
    <div class="card"><h2><span>🔔 Smart notifications</span></h2>${notifications(b).map(([c, i, txt, go]) => `<div class="note ${c}" ${go ? `data-go="${go}" style="cursor:pointer"` : ""}><span>${i}</span><span class="sp">${esc(txt)}</span></div>`).join("")}</div>
    <div class="card"><h2><span>⏳ Next 14 days</span><button class="btn sm g" data-go="calendar">Calendar</button></h2><div class="list">${due.length ? due.map(x => `<div class="it"><div class="ic">${x.r.k === "in" ? "💰" : cat(x.r.c).e}</div><div class="sp"><div class="t">${esc(x.r.name)}</div><div class="s">${nice(x.d, true)}${x.d === t ? " · today" : ` · in ${diffD(t, x.d)}d`}${x.r.auto ? " · auto" : ""}</div></div><div class="amt ${x.r.k === "in" ? "i" : "o"}">${money(x.r.k === "in" ? x.r.a : -x.r.a, true)}</div></div>`).join("") : `<div class="empty">Nothing scheduled.</div>`}</div></div>
    <div class="card"><h2><span>🧾 Latest</span><button class="btn sm" data-act="addtx">+ Add</button></h2><div class="list">${recent.map(x => txRow(x)).join("") || `<div class="empty">No entries yet.</div>`}</div></div>
   </div>
  </div>`;
}

/* ================================================================ TODAY */
function scrToday(){
  const b = B(), t = today(), biz = isBiz();
  const todos = S.todos[t] || ["", "", ""], done = S.todos[t + "_d"] || [];
  const ents = b.tx.filter(x => x.d === t).slice().reverse();
  const coming = dueList(t, addD(t, 7), b).filter(x => !x.done);
  let hero;
  if (biz){
    const m0 = mStart(t), p = pnl(m0, mEnd(t), b), tg = num(b.set.target), unpaid = b.inv.filter(i => i.status === "sent");
    hero = `<div class="card hero"><div class="lab">Revenue this month</div><div class="big">${money(p.rev)}</div>
      <div class="sub">${tg ? `${pct(p.rev, tg)} of your ${money(tg)} target · ${money(Math.max(0, tg - p.rev))} to go` : "Set a monthly revenue target in Settings → this book"}</div>
      ${tg ? `<div class="bar" style="margin:10px 0"><i style="width:${Math.min(100, p.rev / tg * 100)}%"></i></div>` : ""}
      <div class="row w" style="margin-top:8px"><span class="pill">💹 Profit: ${money(p.net)}</span><span class="pill">📨 Unpaid invoices: ${unpaid.length} · ${money(unpaid.reduce((s, i) => s + invTotal(i), 0))}</span></div></div>`;
  } else {
    const s = safeToSpend(b), neg = s.left < 0, npTxt = s.np ? "payday " + nice(s.np, true) : "the end of the month";
    hero = `<div class="card hero ${neg ? "neg" : ""}"><div class="lab">${esc(S.look.label)} today</div><div class="big">${money(s.left)}</div>
      <div class="sub">${neg ? "Gone over today's amount — tomorrow resets a little lower. That's okay." : `${money(s.pot)} to last until ${npTxt} · ${s.days} day${s.days === 1 ? "" : "s"}`}</div>
      <div class="row w" style="margin-top:10px"><span class="pill">💳 In spending accounts: ${money(s.bal)}</span><span class="pill">🧾 Bills before payday: ${money(s.bills)}</span><button class="pill" data-act="why">How is this worked out?</button></div>
      ${sel.why ? `<div class="sub" style="margin-top:10px;line-height:1.7">Spending accounts <b>${money(s.bal)}</b> − unpaid bills before ${npTxt} <b>${money(s.bills)}</b> = <b>${money(s.pot)}</b><br>÷ ${s.days} day${s.days === 1 ? "" : "s"} (today's spends added back) = <b>${money(s.perDay)}</b> a day · spent today <b>${money(s.spentToday)}</b><br>Tick “spending account” on the accounts you spend from (Accounts tab). Your paydays come from Recurring (money in).</div>` : ""}</div>`;
  }
  const quickCats = b.cats.filter(c => sel.qk === "in" ? c.t === "income" : c.t !== "income").slice(0, 9);
  return `${head(`${greet()}${S.profile.name ? ", " + esc(S.profile.name) : ""} 👋`, nice(t, true) + " " + t.slice(0, 4))}
  <div class="grid g2">
   <div class="grid">${hero}
    <div class="card"><h2><span>✍️ Quick log</span><span class="seg"><button class="${sel.qk !== "in" ? "on" : ""}" data-act="qk" data-v="out">${biz ? "Expense" : "Spent"}</button><button class="${sel.qk === "in" ? "on" : ""}" data-act="qk" data-v="in">${biz ? "Sale / income" : "Money in"}</button></span></h2>
     <input id="qamt" class="amount" inputmode="decimal" placeholder="${esc(S.profile.cur)}0" value="${esc(sel.qamt || "")}" autocomplete="off">
     <div class="chips" style="margin:9px 0">${[1, 5, 10, 20, 50].map(v => `<button class="chip" data-act="plus" data-v="${v}">+${esc(S.profile.cur)}${v}</button>`).join("")}<button class="chip" data-act="plus" data-v="0">Clear</button></div>
     <div class="chips">${quickCats.map(c => `<button class="chip ${sel.qc === c.id ? "on" : ""}" data-act="qc" data-v="${c.id}">${c.e} ${esc(c.n)}</button>`).join("")}</div>
     <div class="row" style="margin-top:9px"><input id="qnote" placeholder="Note (optional)" value="${esc(sel.qnote || "")}">${b.accounts.length > 1 ? `<select id="qacc" style="max-width:160px">${b.accounts.map(a => `<option value="${a.id}">${esc(a.name)}</option>`).join("")}</select>` : ""}</div>
     <button class="btn" style="width:100%;margin-top:10px" data-act="qlog">${sel.qk === "in" ? "Add money in" : "Log it"}</button>
     <div class="sub" style="margin-top:8px">Fast: type <span class="kbd">12 coffee</span> and press Enter. More details? <button data-act="addtx" style="color:var(--brand);font-weight:800">Full form</button></div></div>
   </div>
   <div class="grid">
    <div class="card"><h2><span>✅ Three small things</span><span class="sub">just for today</span></h2>${todos.map((v, i) => `<div class="check ${done[i] ? "done" : ""}"><input type="checkbox" data-act="todo" data-i="${i}" ${done[i] ? "checked" : ""}><input type="text" data-act="todotext" data-i="${i}" placeholder="${["e.g. Pay the phone bill", biz ? "e.g. Send invoice to Lisa" : "e.g. Check bank balance", "e.g. Cancel one subscription"][i]}" value="${esc(v)}"></div>`).join("")}</div>
    <div class="card"><h2><span>⏳ Coming up</span><span class="sub">7 days</span></h2><div class="list">${coming.length ? coming.map(x => `<div class="it"><div class="ic">${x.r.k === "in" ? "💰" : cat(x.r.c).e}</div><div class="sp"><div class="t">${esc(x.r.name)}</div><div class="s">${nice(x.d, true)}</div></div><div class="amt ${x.r.k === "in" ? "i" : "o"}">${money(x.r.k === "in" ? x.r.a : -x.r.a, true)}</div></div>`).join("") : `<div class="empty">Nothing due this week. 🌤️</div>`}</div></div>
    <div class="card"><h2><span>🧾 Today's entries</span><span class="sub">${ents.length}</span></h2><div class="list">${ents.map(x => txRow(x, b, {noDate: true})).join("") || `<div class="empty">Nothing yet today.</div>`}</div></div>
    <div class="card"><h2><span>🧠 Brain dump</span><span class="sub">saves as you type</span></h2><textarea data-act="brain" placeholder="Things to buy, cancel, remember…">${esc(S.brain)}</textarea></div>
   </div></div>`;
}
const greet = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; };

/* ================================================================ TRANSACTIONS */
function scrTx(){
  const b = B(), f = sel.f || {}; const [from, to, lab] = scope();
  const q = (f.q || "").toLowerCase();
  let list = b.tx.filter(t => t.d >= (f.from || from) && t.d <= (f.to || to) && (!f.k || t.k === f.k) && (!f.c || t.c === f.c) && (!f.ac || t.ac === f.ac || t.to === f.ac) && (!f.who || t.who === f.who)
    && (!q || ((t.note || "") + " " + cat(t.c, b).n + " " + (t.cl && client(t.cl) ? client(t.cl).name : "")).toLowerCase().includes(q) || String(t.a).includes(q)));
  list.sort((a, c) => a.d < c.d ? 1 : a.d > c.d ? -1 : 0);
  const sumIn = list.filter(t => t.k === "in").reduce((s, t) => s + t.a, 0), sumOut = list.filter(t => t.k === "out").reduce((s, t) => s + t.a, 0);
  const lim = sel.lim || 150; const shown = list.slice(0, lim);
  let lastD = "", rows = "";
  for (const t of shown){ if (t.d !== lastD){ rows += `<div class="sub" style="font-weight:900;margin:12px 0 2px">${nice(t.d, true)} ${t.d.slice(0, 4)}</div>`; lastD = t.d; } rows += txRow(t, b, {noDate: true}); }
  return `${head("Transactions", `${list.length} entries · ${lab}`, `<button class="btn" data-act="addtx">+ Add</button>`, true)}
  <div class="card"><div class="grid g4" style="gap:8px">
    <input placeholder="Search notes, categories, amounts…" value="${esc(f.q || "")}" data-act="fq">
    <select data-act="ff" data-k="k"><option value="">All types</option>${[["in", "Money in"], ["out", "Money out"], ["move", "Transfers"]].map(([v, n]) => `<option value="${v}" ${f.k === v ? "selected" : ""}>${n}</option>`).join("")}</select>
    <select data-act="ff" data-k="c"><option value="">All categories</option>${b.cats.map(c => `<option value="${c.id}" ${f.c === c.id ? "selected" : ""}>${c.e} ${esc(c.n)}</option>`).join("")}</select>
    <select data-act="ff" data-k="ac"><option value="">All accounts</option>${b.accounts.map(a => `<option value="${a.id}" ${f.ac === a.id ? "selected" : ""}>${esc(a.name)}</option>`).join("")}</select>
    <select data-act="ff" data-k="who"><option value="">Everyone</option>${S.people.map(p => `<option ${f.who === p ? "selected" : ""}>${esc(p)}</option>`).join("")}</select>
    <input type="date" value="${f.from || ""}" data-act="ff" data-k="from" title="From"><input type="date" value="${f.to || ""}" data-act="ff" data-k="to" title="To">
    <button class="btn g" data-act="fclear">Clear filters</button></div>
   <div class="row w" style="margin-top:10px"><span class="pill" style="color:var(--in)">In ${money(sumIn)}</span><span class="pill" style="color:var(--out)">Out ${money(sumOut)}</span><span class="pill">Net ${money(sumIn - sumOut)}</span><span class="sp"></span><button class="btn sm g" data-act="csv">Export CSV</button></div></div>
  <div class="card" style="margin-top:12px"><div class="list">${rows || `<div class="empty">No entries match.</div>`}</div>${list.length > lim ? `<button class="btn g" style="width:100%;margin-top:10px" data-act="more">Show more (${list.length - lim} left)</button>` : ""}</div>`;
}

/* ================================================================ RECURRING */
function scrRecurring(){
  const b = B(), t = today(), m0 = sel.rm || mStart(t), m1 = mEnd(m0);
  const month = dueList(m0, m1, b), late = dueList(addD(m0, -60), addD(m0, -1), b).filter(x => !x.done && !x.r.auto);
  const left = month.filter(x => !x.done && x.r.k === "out").reduce((s, x) => s + num(x.r.a), 0), paid = month.filter(x => x.done && x.r.k === "out").reduce((s, x) => s + num(x.r.a), 0);
  const income = month.filter(x => x.r.k === "in").reduce((s, x) => s + num(x.r.a), 0);
  const row = x => { const lt = !x.done && x.d < t, n = diffD(t, x.d);
    return `<div class="it"><div class="ic">${x.r.k === "in" ? "💰" : cat(x.r.c).e}</div><div class="sp"><div class="t">${esc(x.r.name)}</div><div class="s">${nice(x.d, true)} · <span class="tag ${x.done ? "t-ok" : lt ? "t-late" : x.r.k === "in" ? "t-in" : "t-due"}">${x.done ? (x.r.auto ? "Auto ✓" : x.r.k === "in" ? "Arrived" : "Paid") : lt ? "Overdue" : n === 0 ? "Today" : "In " + n + "d"}</span></div></div>
     <div class="rt"><div class="amt ${x.r.k === "in" ? "i" : "o"}">${money(x.r.k === "in" ? x.r.a : -x.r.a, true)}</div><button class="btn sm ${x.done ? "g" : ""}" data-act="tickrec" data-id="${x.r.id}" data-d="${x.d}">${x.done ? "Undo" : x.r.k === "in" ? "Arrived ✓" : "Paid ✓"}</button></div></div>`; };
  return `${head("Recurring & bills", "Paydays, bills, subscriptions, loans and savings transfers — set once", `<button class="btn" data-act="addrec">+ Add</button>`)}
  <div class="grid g3">${kpi("Still to pay", money(left), "var(--out)", FULLM[dd(m0).getMonth()])}${kpi("Paid", money(paid), "var(--ok)")}${kpi("Expected in", money(income), "var(--in)")}</div>
  <div class="grid g21" style="margin-top:12px">
   <div class="card"><h2><span class="row"><button class="btn sm g" data-act="rmprev">‹</button>${FULLM[dd(m0).getMonth()]} ${m0.slice(0, 4)}<button class="btn sm g" data-act="rmnext">›</button></span><span class="sub">soonest first</span></h2>
    ${late.length ? `<div class="note n-bad">⏰ ${late.length} from earlier months not ticked</div>${late.map(row).join("")}<hr style="border:0;border-top:2px solid var(--line);margin:8px 0">` : ""}
    <div class="list">${month.map(row).join("") || `<div class="empty">Nothing scheduled this month. Add rent, pay, subscriptions…</div>`}</div></div>
   <div class="card"><h2><span>All recurring items</span><span class="sub">${b.rec.length}</span></h2><div class="list">${b.rec.slice().sort((a, c) => a.k < c.k ? -1 : 1).map(r => { const nx = occ(r, t, addD(t, 400), r.k === "in")[0];
     return `<div class="it" data-act="editrec" data-id="${r.id}" style="cursor:pointer"><div class="ic">${r.k === "in" ? "💰" : cat(r.c).e}</div><div class="sp"><div class="t">${esc(r.name)}</div><div class="s">${FREQS[r.freq]} · next ${nx ? nice(nx) : "—"}${r.auto ? " · auto" : ""}</div></div><div class="amt ${r.k === "in" ? "i" : ""}">${money(num(r.a))}</div></div>`; }).join("") || `<div class="empty">—</div>`}</div>
    <div class="sub" style="margin-top:8px">Auto = logs itself on the date (salary, direct debits). Not auto = tick ✓ when you pay. Weekend paydays move to Friday.</div></div>
  </div>`;
}

/* ================================================================ ACCOUNTS */
function scrAccounts(){
  const b = B(), t = today(); const total = b.accounts.reduce((s, a) => s + balance(a.id, null, b), 0);
  const ms = []; for (let i = 11; i >= 0; i--) ms.push(mEnd(addM(t, -i)));
  const KIND = {bank: "🏦 Bank", cash: "💵 Cash", card: "💳 Credit card", savings: "🐷 Savings", invest: "📈 Investment", loan: "🧾 Loan"};
  return `${head("Accounts", "Every account and card — balances update from your entries", `<button class="btn g" data-act="move">⇄ Transfer</button><button class="btn" data-act="addacc">+ Account</button>`)}
  <div class="grid g3">${kpi("Total in accounts", money(total), total >= 0 ? "var(--ink)" : "var(--out)")}${kpi("Spending accounts", money(b.accounts.filter(a => a.spend).reduce((s, a) => s + balance(a.id, null, b), 0)), "var(--brand)", "count toward safe to spend")}${kpi("Accounts", b.accounts.length, "var(--ink)")}</div>
  <div class="grid g2" style="margin-top:12px">
   <div class="card"><h2><span>Balances</span></h2><div class="list">${b.accounts.map(a => { const v = balance(a.id, null, b); return `<div class="it" data-act="editacc" data-id="${a.id}" style="cursor:pointer"><div class="ic">${KIND[a.kind].split(" ")[0]}</div><div class="sp"><div class="t">${esc(a.name)}</div><div class="s">${KIND[a.kind].split(" ").slice(1).join(" ")}${a.spend ? " · spending" : ""} · started ${money(num(a.start))}</div></div><div class="amt" style="color:${v < 0 ? "var(--out)" : "var(--ink)"}">${money(v)}</div></div>`; }).join("")}</div>
    <div class="sub" style="margin-top:8px">A negative credit card balance is what you owe on it. Use Transfer for card payments, cash withdrawals and savings moves.</div></div>
   <div class="card"><h2><span>Total over the last 12 months</span></h2>${line(ms.map(m => MON[dd(m).getMonth()]), [{name: "Total", color: "var(--brand)", fill: true, values: ms.map(m => b.accounts.reduce((s, a) => s + balance(a.id, m, b), 0))}])}</div>
  </div>`;
}

/* ================================================================ STATEMENT */
function scrStatement(){
  const b = B(), t = today(), a = sel.sa || b.accounts[0].id, from = sel.sf || mStart(t), to = sel.st || mEnd(t);
  const open = balance(a, addD(from, -1), b);
  const rows = b.tx.filter(x => x.d >= from && x.d <= to && (x.ac === a || x.to === a)).sort((x, y) => x.d < y.d ? -1 : x.d > y.d ? 1 : 0);
  let run = open, ins = 0, outs = 0;
  const html = rows.map(x => { const v = x.k === "in" && x.ac === a ? x.a : x.k === "move" && x.to === a ? x.a : -x.a; run += v; if (v > 0) ins += v; else outs -= v;
    return `<tr><td>${nice(x.d)} ${x.d.slice(2, 4)}</td><td style="text-align:left;white-space:normal">${esc(x.k === "move" ? (x.to === a ? "From " + acc(x.ac, b).name : "To " + acc(x.to, b).name) : (x.note || cat(x.c, b).n))}</td><td class="pos">${v > 0 ? money(v) : ""}</td><td class="neg">${v < 0 ? money(-v) : ""}</td><td><b>${money(run)}</b></td></tr>`; }).join("");
  return `${head("Statement", "A bank-style statement for any account and dates", `<button class="btn g" data-act="printstmt">🖨️ Print</button>`)}
  <div class="card"><div class="grid g3" style="gap:8px"><div><label class="f">Account</label><select data-act="sset" data-k="sa">${b.accounts.map(x => `<option value="${x.id}" ${x.id === a ? "selected" : ""}>${esc(x.name)}</option>`).join("")}</select></div>
   <div><label class="f">From</label><input type="date" value="${from}" data-act="sset" data-k="sf"></div><div><label class="f">To</label><input type="date" value="${to}" data-act="sset" data-k="st"></div></div></div>
  <div class="grid g4" style="margin-top:12px">${kpi("Opening", money(open))}${kpi("Money in", money(ins), "var(--in)")}${kpi("Money out", money(outs), "var(--out)")}${kpi("Closing", money(run), "var(--brand)")}</div>
  <div class="card" style="margin-top:12px" id="stmt"><h2><span>${esc(acc(a, b).name)}</span><span class="sub">${niceY(from)} – ${niceY(to)} · ${rows.length} movements</span></h2>
   <div class="tbl"><table><thead><tr><th>Date</th><th style="text-align:left">Description</th><th>In</th><th>Out</th><th>Balance</th></tr></thead><tbody><tr><td>${nice(from)}</td><td style="text-align:left"><b>Opening balance</b></td><td></td><td></td><td><b>${money(open)}</b></td></tr>${html}</tbody></table></div></div>`;
}

/* ================================================================ CALENDAR */
function scrCalendar(){
  const b = B(), t = today(), m = sel.cm || mStart(t), first = dd(m), off = (first.getDay() + 6) % 7, g0 = addD(m, -off), days = [];
  for (let i = 0; i < 42; i++) days.push(addD(g0, i));
  const due = dueList(g0, days[41], b), invs = b.inv.filter(i => i.status !== "paid" && i.due >= g0 && i.due <= days[41]), pick = sel.cd || t;
  const cell = d => { const ds_ = due.filter(x => x.d === d), iv = invs.filter(i => i.due === d), sp = b.tx.filter(x => x.d === d && x.k === "out" && !x.rec).reduce((s, x) => s + x.a, 0);
    return `<div class="d ${d.slice(0, 7) !== m.slice(0, 7) ? "o" : ""} ${d === t ? "td" : ""} ${d === pick ? "sel" : ""}" data-act="cday" data-v="${d}"><div class="n">${dd(d).getDate()}</div>
     ${ds_.map(x => `<span class="m ${x.r.k === "in" ? "p" : "b"}">${x.done ? "✓ " : ""}${esc(x.r.name)}</span>`).join("")}${iv.map(i => `<span class="m v">📨 ${esc(i.no)}</span>`).join("")}${sp ? `<span class="m s">${money(sp, false, true)}</span>` : ""}</div>`; };
  const items = [...due.filter(x => x.d === pick).map(x => `<div class="it"><div class="ic">${x.r.k === "in" ? "💰" : cat(x.r.c).e}</div><div class="sp"><div class="t">${esc(x.r.name)}</div><div class="s">${x.done ? "Done ✓" : "Scheduled"}</div></div><div class="amt ${x.r.k === "in" ? "i" : "o"}">${money(x.r.k === "in" ? x.r.a : -x.r.a, true)}</div></div>`),
                 ...invs.filter(i => i.due === pick).map(i => `<div class="it" data-go="invoices"><div class="ic">📨</div><div class="sp"><div class="t">Invoice ${esc(i.no)} due</div><div class="s">${esc((client(i.cl) || {}).name || "")}</div></div><div class="amt i">${money(invTotal(i))}</div></div>`),
                 ...b.tx.filter(x => x.d === pick && !x.rec).map(x => txRow(x, b, {noDate: true}))];
  return `${head("Calendar", "Bills, paydays, invoices and spending on one calendar")}
  <div class="grid g21"><div class="card"><div class="row" style="margin-bottom:10px"><button class="btn g" data-act="cmprev">‹</button><div class="sp" style="text-align:center;font-weight:900;font-size:18px">${FULLM[first.getMonth()]} ${first.getFullYear()}</div><button class="btn g" data-act="cmnext">›</button></div>
   <div class="cal">${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(h => `<div class="h">${h}</div>`).join("")}${days.map(cell).join("")}</div>
   <div class="row w" style="margin-top:10px"><span class="pill" style="color:var(--in)">💰 Money in</span><span class="pill" style="color:var(--out)">🧾 Bills</span>${isBiz() ? `<span class="pill" style="color:var(--save)">📨 Invoice due</span>` : ""}<span class="pill">Grey = spent that day</span></div></div>
   <div class="card"><h2><span>${nice(pick, true)} ${pick.slice(0, 4)}</span><button class="btn sm" data-act="addtx" data-d="${pick}">+ Add</button></h2><div class="list">${items.join("") || `<div class="empty">Nothing on this day.</div>`}</div></div></div>`;
}

/* ================================================================ BUDGET */
function scrBudget(){
  const b = B(), t = today(), m = sel.bm || mStart(t), e = mEnd(m), tt = totals(m, e, b);
  const groups = ["income", "bill", "sub", "exp", "cogs", "save", "debt"].map(ty => ({ty, cats: b.cats.filter(c => c.t === ty)})).filter(g => g.cats.length);
  const incB = b.cats.filter(c => c.t === "income").reduce((s, c) => s + budgetFor(m, c, b), 0), outB = b.cats.filter(c => !["income", "tax", "draw"].includes(c.t)).reduce((s, c) => s + budgetFor(m, c, b), 0);
  const prev = addM(m, -1), pt = totals(prev, mEnd(prev), b), roll = b.set.strategy === "carry" ? pt.in - pt.out : 0;
  const leftToBudget = incB + roll - outB, actualLeft = roll + tt.in - tt.out;
  const grp = g => { const bs = g.cats.reduce((s, c) => s + budgetFor(m, c, b), 0), as = g.cats.reduce((s, c) => s + (tt.byCat[c.id] || 0), 0);
    return `<div class="card"><h2><span>${CTYPES[g.ty]}</span><span class="sub">${money(as)} of ${money(bs)}</span></h2><div class="list">${g.cats.map(c => { const bud = budgetFor(m, c, b), act = tt.byCat[c.id] || 0, over = g.ty !== "income" && bud > 0 && act > bud;
      return `<div class="it" style="flex-wrap:wrap"><div class="ic">${c.e}</div><div class="sp"><div class="t">${esc(c.n)}</div><div class="s">${money(act)}${bud ? ` of ${money(bud)} · ${g.ty === "income" ? pct(act, bud) : over ? `<b style="color:var(--out)">${money(act - bud)} over</b>` : money(bud - act) + " left"}` : ""}</div>
        ${bud ? `<div class="bar" style="height:7px;margin-top:5px"><i style="width:${Math.min(100, act / bud * 100)}%;background:${over ? "var(--out)" : g.ty === "income" ? "var(--in)" : "var(--brand)"}"></i></div>` : ""}</div>
        <input style="width:96px;padding:7px 9px" inputmode="decimal" placeholder="Budget" value="${bud || ""}" data-act="bud" data-id="${c.id}"></div>`; }).join("")}</div></div>`; };
  return `${head("Budget", `${b.set.strategy === "carry" ? "Carry-over" : "Zero-based"} budget · plan each category, see what's left`, `<div class="seg"><button class="${b.set.strategy === "carry" ? "on" : ""}" data-act="strat" data-v="carry">Carry over</button><button class="${b.set.strategy === "zero" ? "on" : ""}" data-act="strat" data-v="zero">Zero-based</button></div>`)}
  <div class="card"><div class="row"><button class="btn g" data-act="bmprev">‹</button><div class="sp" style="text-align:center;font-weight:900;font-size:18px">${FULLM[dd(m).getMonth()]} ${m.slice(0, 4)}</div><button class="btn g" data-act="bmnext">›</button></div>
   <div class="grid g4" style="margin-top:12px">${kpi(b.set.strategy === "carry" ? "Rolled over" : "Starts at", money(roll), "var(--ink)", b.set.strategy === "carry" ? "left from last month" : "zero-based")}${kpi("Planned income", money(incB), "var(--in)", "actual " + money(tt.in))}
    ${kpi("Left to budget", money(leftToBudget), Math.abs(leftToBudget) < 0.01 ? "var(--ok)" : leftToBudget < 0 ? "var(--out)" : "var(--debt)", b.set.strategy === "zero" ? "aim for exactly 0" : "income − budgets")}${kpi("Left to spend", money(actualLeft), actualLeft >= 0 ? "var(--ok)" : "var(--out)", "actual so far")}</div>
   <div class="sub" style="margin-top:10px">Budget numbers are monthly. Typing one changes it for <b>this month and later months</b>; <button data-act="budonly" style="color:var(--brand);font-weight:800">${sel.budonly ? "✓ only this month" : "change only this month"}</button>.</div></div>
  <div class="grid g2" style="margin-top:12px">${groups.map(grp).join("")}</div>`;
}

/* ================================================================ PAYCHECK BUDGET */
function payPeriod(b){
  const ty = b.set.ptype, st = b.set.pstart || today(), t = sel.pp || today();
  if (ty === "monthly") return [mStart(t), mEnd(t)];
  if (ty === "twicemonthly"){ const d = dd(t).getDate(); return d <= 15 ? [mStart(t), t.slice(0, 8) + "15"] : [t.slice(0, 8) + "16", mEnd(t)]; }
  if (ty === "custom") return [b.set.pstart || mStart(t), b.set.pend || mEnd(t)];
  const len = ty === "weekly" ? 7 : ty === "fourweekly" ? 28 : 14; const k = Math.floor(diffD(st, t) / len); const s = addD(st, k * len); return [s, addD(s, len - 1)];
}
function scrPaycheck(){
  const b = B(), [from, to] = payPeriod(b), days = diffD(from, to) + 1, f = days / 30.44, tt = totals(from, to, b);
  const cats = b.cats.filter(c => c.t !== "income" && c.t !== "tax" && c.t !== "draw");
  const inc = tt.in, planned = cats.reduce((s, c) => s + num(c.bud) * f, 0), spent = tt.out;
  return `${head("Paycheck budget", "Budget around when you actually get paid")}
  <div class="card"><div class="grid g3" style="gap:8px"><div><label class="f">Pay period</label><select data-act="pset" data-k="ptype">${[["weekly", "Weekly"], ["fortnightly", "Every 2 weeks"], ["twicemonthly", "Twice a month"], ["fourweekly", "Every 4 weeks"], ["monthly", "Monthly"], ["custom", "Custom dates"]].map(([v, n]) => `<option value="${v}" ${b.set.ptype === v ? "selected" : ""}>${n}</option>`).join("")}</select></div>
   <div><label class="f">${b.set.ptype === "custom" ? "Start" : "A payday"}</label><input type="date" value="${b.set.pstart || ""}" data-act="pset" data-k="pstart"></div>${b.set.ptype === "custom" ? `<div><label class="f">End</label><input type="date" value="${b.set.pend || ""}" data-act="pset" data-k="pend"></div>` : `<div class="row" style="align-items:flex-end"><button class="btn g" data-act="ppprev">‹ Previous</button><button class="btn g" data-act="ppnext">Next ›</button></div>`}</div>
   <div class="sub" style="margin-top:8px"><b>${niceY(from)} – ${niceY(to)}</b> · ${days} days. Category budgets are your monthly budgets scaled to the days in this period.</div></div>
  <div class="grid g4" style="margin-top:12px">${kpi("Came in", money(inc), "var(--in)")}${kpi("Planned out", money(planned), "var(--ink)")}${kpi("Went out", money(spent), "var(--out)")}${kpi("Left from this pay", money(inc - spent), inc - spent >= 0 ? "var(--ok)" : "var(--out)")}</div>
  <div class="card" style="margin-top:12px"><div class="tbl"><table><thead><tr><th>Category</th><th>Budget</th><th>Actual</th><th>Left</th></tr></thead><tbody>
   ${cats.filter(c => num(c.bud) || tt.byCat[c.id]).map(c => { const bb = num(c.bud) * f, a = tt.byCat[c.id] || 0; return `<tr><td>${c.e} ${esc(c.n)}</td><td>${money(bb)}</td><td>${money(a)}</td><td class="${bb - a < 0 ? "neg" : ""}">${money(bb - a)}</td></tr>`; }).join("")}
   <tr class="tot"><td>Total</td><td>${money(planned)}</td><td>${money(spent)}</td><td class="${planned - spent < 0 ? "neg" : ""}">${money(planned - spent)}</td></tr></tbody></table></div></div>`;
}
