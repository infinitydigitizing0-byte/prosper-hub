"use strict";
/* ================================================================ GOALS */
function scrGoals(){
  const b = B();
  return `${head("Savings goals", "Little by little, it adds up", `<button class="btn" data-act="addgoal">+ Goal</button>`)}
  <div class="grid g3">${b.goals.map(g => { const sv = goalSaved(g, b), tg = num(g.target), p = tg ? Math.min(100, sv / tg * 100) : 0, left = Math.max(0, tg - sv);
    const mo = g.date && left > 0 ? Math.max(1, Math.ceil(diffD(today(), g.date) / 30.44)) : 0;
    return `<div class="card"><div class="row"><div class="ic" style="font-size:21px;background:var(--save-l)">${esc(g.e || "🎯")}</div><div class="sp"><div style="font-weight:900;font-size:16px">${esc(g.name)}</div><div class="sub">${g.date ? "by " + niceY(g.date) : "no date"}</div></div><button class="btn sm g" data-act="editgoal" data-id="${g.id}">Edit</button></div>
     <div class="big" style="font-size:30px;color:var(--save);margin-top:10px">${money(sv)}</div><div class="sub">of ${money(tg)} · ${p.toFixed(0)}%</div><div class="bar" style="margin:9px 0"><i style="width:${p}%;background:var(--save)"></i></div>
     <div class="sub">${left <= 0 ? "🏆 Done!" : `${money(left)} to go${mo ? ` · ${money(left / mo)}/month` : ""}`}</div><button class="btn sm" style="margin-top:10px;background:var(--save)" data-act="putaway" data-id="${g.id}" data-t="goal">+ Put money in</button></div>`; }).join("") || `<div class="card empty">No goals yet. Emergency fund? Holiday? New car?</div>`}</div>`;
}
/* ================================================================ SINKING FUNDS */
function scrFunds(){
  const b = B(), t = today(); let monthTotal = 0;
  const cards = b.funds.map(f => { const sv = fundSaved(f, b), tg = num(f.target), left = Math.max(0, tg - sv), mo = f.due ? Math.max(1, Math.ceil(diffD(t, f.due) / 30.44)) : 12, per = left / mo; monthTotal += left > 0 ? per : 0;
    return `<div class="it" style="flex-wrap:wrap"><div class="ic">${esc(f.e || "🪣")}</div><div class="sp"><div class="t">${esc(f.name)}</div><div class="s">${money(sv)} of ${money(tg)} · due ${niceY(f.due)} · ${left > 0 ? `<b>${money(per)}/month</b>` : "ready ✓"}</div>
     <div class="bar" style="height:7px;margin-top:5px"><i style="width:${tg ? Math.min(100, sv / tg * 100) : 0}%;background:var(--save)"></i></div></div>
     <button class="btn sm" data-act="putaway" data-id="${f.id}" data-t="fund">+ Add</button><button class="btn sm g" data-act="editfund" data-id="${f.id}">Edit</button></div>`; });
  return `${head("Sinking funds", "Big yearly costs, saved a little each month — no more surprise bills", `<button class="btn" data-act="addfund">+ Fund</button>`)}
  <div class="grid g3">${kpi("Set aside each month", money(monthTotal), "var(--save)", "to be ready on time")}${kpi("Saved in funds", money(b.funds.reduce((s, f) => s + fundSaved(f, b), 0)), "var(--ink)")}${kpi("Total needed", money(b.funds.reduce((s, f) => s + num(f.target), 0)), "var(--ink)")}</div>
  <div class="card" style="margin-top:12px"><div class="list">${cards.join("") || `<div class="empty">Car insurance, birthdays, school fees, holidays… add the big ones.</div>`}</div></div>`;
}
/* ================================================================ DEBT PAYOFF */
function scrDebt(){
  const b = B(), list = b.debts.map(d => ({id: d.id, name: d.name, bal: debtLeft(d, null, b), rate: num(d.rate), min: num(d.min)})), extra = num(b.set.extra);
  const sn = simulateDebts(list, extra, "snowball"), av = simulateDebts(list, extra, "avalanche"), total = list.reduce((s, d) => s + d.bal, 0);
  const when = m => m ? niceY(addM(today(), m)) : "—";
  const panel = (nm, r, col) => `<div class="card"><h2><span style="color:${col}">${nm}</span><span class="sub">${nm === "Snowball" ? "smallest balance first" : "highest interest first"}</span></h2>
    ${r.ok ? `<div class="grid g2" style="gap:8px">${kpi("Debt-free in", r.months + " months", col, when(r.months))}${kpi("Total interest", money(r.interest), "var(--out)")}</div>
    <div class="list" style="margin-top:8px">${r.order.map((o, i) => `<div class="it"><div class="ic">${i + 1}</div><div class="sp t">${esc(o.name)}</div><div class="sub">${when(o.month)}</div></div>`).join("")}</div>` : `<div class="note n-bad">Payments don't cover the interest — raise the extra payment.</div>`}</div>`;
  const better = sn.ok && av.ok && list.length > 1 ? (Math.abs(sn.interest - av.interest) < 1 ? "Both methods cost about the same." : av.interest < sn.interest ? `Avalanche saves ${money(sn.interest - av.interest)} in interest.` : `Snowball saves ${money(av.interest - sn.interest)}.`) : "";
  const tl = (sel.dm === "snowball" ? sn : av).timeline;
  return `${head("Debt payoff", "Snowball vs avalanche — see your debt-free date", `<button class="btn" data-act="adddebt">+ Debt</button>`)}
  <div class="grid g3">${kpi("Total owed", money(total), "var(--debt)")}${kpi("Minimums / month", money(list.reduce((s, d) => s + d.min, 0)), "var(--ink)")}<div class="card kpi"><div class="k">Extra each month</div><input style="margin-top:6px" inputmode="decimal" value="${extra || ""}" placeholder="0" data-act="dextra"></div></div>
  <div class="card" style="margin-top:12px"><h2><span>Your debts</span></h2><div class="list">${b.debts.map(d => { const left = debtLeft(d, null, b), p = num(d.start) ? (1 - left / num(d.start)) * 100 : 0;
    return `<div class="it" style="flex-wrap:wrap"><div class="ic">💳</div><div class="sp"><div class="t">${esc(d.name)}</div><div class="s">${money(left)} left of ${money(num(d.start))} · ${num(d.rate)}% · min ${money(num(d.min))}</div><div class="bar" style="height:7px;margin-top:5px"><i style="width:${p}%;background:var(--debt)"></i></div></div>
     <button class="btn sm" style="background:var(--debt)" data-act="paydebt" data-id="${d.id}">+ Payment</button><button class="btn sm g" data-act="editdebt" data-id="${d.id}">Edit</button></div>`; }).join("") || `<div class="empty">No debts — or add them to watch them shrink.</div>`}</div></div>
  ${list.length ? `<div class="grid g2" style="margin-top:12px">${panel("Snowball", sn, "var(--debt)")}${panel("Avalanche", av, "var(--brand)")}</div>
  ${better ? `<div class="note n-yay" style="margin-top:12px">💡 ${better}</div>` : ""}
  <div class="card" style="margin-top:12px"><h2><span>Total debt over time</span><span class="seg"><button class="${sel.dm === "snowball" ? "on" : ""}" data-act="dm" data-v="snowball">Snowball</button><button class="${sel.dm !== "snowball" ? "on" : ""}" data-act="dm" data-v="avalanche">Avalanche</button></span></h2>
   ${line(tl.map((_, i) => i % 12 === 0 ? MON[dd(addM(today(), i + 1)).getMonth()] + " " + addM(today(), i + 1).slice(2, 4) : ""), [{name: "Debt", color: "var(--debt)", fill: true, values: tl}])}</div>` : ""}`;
}
/* ================================================================ INVESTMENTS */
function scrInvest(){
  const b = B(), val = b.hold.reduce((s, h) => s + num(h.units) * num(h.price || h.cost), 0), cost = b.hold.reduce((s, h) => s + num(h.units) * num(h.cost), 0);
  const fc = sel.fc || {start: Math.round(val) || 5000, monthly: 300, rate: 7, years: 20, inc: 2};
  const rows = []; let v = num(fc.start), put = num(fc.start), mcon = num(fc.monthly);
  for (let y = 1; y <= Math.min(50, num(fc.years)); y++){ for (let m = 0; m < 12; m++){ v = v * (1 + num(fc.rate) / 1200) + mcon; put += mcon; } rows.push({y, v, put}); mcon *= 1 + num(fc.inc) / 100; }
  const last = rows[rows.length - 1] || {v: 0, put: 0};
  return `${head("Investments", "Your portfolio and a growth forecast", `<button class="btn" data-act="addhold">+ Holding</button>`)}
  <div class="grid g3">${kpi("Portfolio value", money(val), "var(--save)")}${kpi("You paid", money(cost), "var(--ink)")}${kpi("Gain / loss", money(val - cost), val - cost >= 0 ? "var(--ok)" : "var(--out)", pct(val - cost, cost))}</div>
  <div class="grid g2" style="margin-top:12px">
   <div class="card"><h2><span>Holdings</span><span class="sub">update prices any time</span></h2><div class="tbl"><table><thead><tr><th>Name</th><th>Units</th><th>Avg cost</th><th>Price</th><th>Value</th><th>+/−</th></tr></thead><tbody>
    ${b.hold.map(h => { const vv = num(h.units) * num(h.price || h.cost), cc = num(h.units) * num(h.cost); return `<tr data-act="edithold" data-id="${h.id}" style="cursor:pointer"><td>${esc(h.name)} <span class="sub">${esc(h.sym || "")}</span></td><td>${num(h.units)}</td><td>${money(num(h.cost))}</td><td>${money(num(h.price || h.cost))}</td><td><b>${money(vv)}</b></td><td class="${vv - cc >= 0 ? "pos" : "neg"}">${pct(vv - cc, cc)}</td></tr>`; }).join("") || `<tr><td colspan="6" class="empty">No holdings yet.</td></tr>`}</tbody></table></div>
    ${b.hold.length ? donut(b.hold.map((h, i) => ({label: h.name, value: num(h.units) * num(h.price || h.cost), color: PAL[i % PAL.length]})), {title: "Portfolio"}) : ""}</div>
   <div class="card"><h2><span>📈 Forecast</span><span class="sub">estimate only, not advice</span></h2>
    <div class="grid g3" style="gap:8px">${[["start", "Start with"], ["monthly", "Add each month"], ["rate", "Yearly return %"], ["years", "Years"], ["inc", "Raise contribution %/yr"]].map(([k, l]) => `<div><label class="f">${l}</label><input inputmode="decimal" value="${fc[k]}" data-act="fc" data-k="${k}"></div>`).join("")}</div>
    <div class="grid g3" style="margin-top:10px">${kpi("Value at the end", money(last.v, false, true), "var(--save)")}${kpi("You put in", money(last.put, false, true))}${kpi("Growth", money(last.v - last.put, false, true), "var(--ok)")}</div>
    ${line(rows.map(r => "Y" + r.y), [{name: "Value", color: "var(--save)", fill: true, values: rows.map(r => r.v)}, {name: "Put in", color: "var(--muted)", values: rows.map(r => r.put)}])}</div>
  </div>`;
}
/* ================================================================ NET WORTH */
function scrNetworth(){
  const b = B(), t = today(), now = netWorth(null, b), [from, to, lab] = scope(), all = YEAR === "all";
  const pts = all ? years().map(y => ({l: String(y), d: y + "-12-31" > t ? t : y + "-12-31"})) : monthly(from, to, (m, e) => ({d: e > t ? t : e})).filter(x => x.m <= t).map(x => ({l: x.label, d: x.d}));
  const vals = pts.map(p => netWorth(p.d, b)); const first = vals[0] ? vals[0].nw : 0;
  return `${head("Net worth", "What you own − what you owe · fills in from your accounts, investments and debts", "", true)}
  <div class="grid g4">${kpi("Net worth", money(now.nw), "var(--save)")}${kpi("Accounts", money(now.accs), "var(--ink)")}${kpi("Investments", money(now.inv), "var(--ok)")}${kpi("Debts", money(now.debts), "var(--debt)")}</div>
  <div class="card" style="margin-top:12px"><h2><span>${lab}</span><span class="sub">${vals.length ? "change " + money(vals[vals.length - 1].nw - first, true) : ""}</span></h2>
   ${bars(pts.map(p => p.l), [{name: "Net worth", color: "var(--save)", values: vals.map(v => v.nw)}], {line: {name: "Debts", color: "var(--debt)", values: vals.map(v => v.debts)}})}</div>
  <div class="card" style="margin-top:12px"><div class="tbl"><table><thead><tr><th>${all ? "Year end" : "Month end"}</th><th>Accounts</th><th>Investments</th><th>Debts</th><th>Net worth</th><th>Change</th></tr></thead><tbody>
   ${pts.map((p, i) => `<tr><td>${p.l}</td><td>${money(vals[i].accs)}</td><td>${money(vals[i].inv)}</td><td>${money(vals[i].debts)}</td><td><b>${money(vals[i].nw)}</b></td><td class="${i && vals[i].nw - vals[i - 1].nw < 0 ? "neg" : "pos"}">${i ? money(vals[i].nw - vals[i - 1].nw, true) : ""}</td></tr>`).join("")}</tbody></table></div>
   <div class="sub" style="margin-top:8px">Add savings, investment and loan accounts on Accounts, holdings on Investments and debts on Debt payoff — they all count here.</div></div>`;
}
/* ================================================================ BUSINESS: INVOICES */
function invStatus(i){ if (i.status === "paid") return ["Paid", "t-ok"]; if (i.status === "draft") return ["Draft", "t-gr"]; if (i.due && i.due < today()) return ["Overdue", "t-late"]; return ["Sent", "t-in"]; }
function scrInvoices(){
  const b = B(), f = sel.invf || "all"; const list = b.inv.filter(i => f === "all" || invStatus(i)[0].toLowerCase() === f).sort((a, c) => a.d < c.d ? 1 : -1);
  const out = b.inv.filter(i => i.status === "sent"), od = out.filter(i => i.due && i.due < today());
  const y0 = today().slice(0, 4) + "-01-01";
  return `${head("Invoices", "Create, send, get paid — paid invoices log the income for you", `<button class="btn" data-act="addinv">+ Invoice</button>`)}
  <div class="grid g4">${kpi("Unpaid", money(out.reduce((s, i) => s + invTotal(i), 0)), "var(--in)", out.length + " invoice" + (out.length === 1 ? "" : "s"))}${kpi("Overdue", money(od.reduce((s, i) => s + invTotal(i), 0)), od.length ? "var(--out)" : "var(--ok)", od.length + " to chase")}
   ${kpi("Paid this year", money(b.inv.filter(i => i.status === "paid" && i.paidOn >= y0).reduce((s, i) => s + invTotal(i), 0)), "var(--ok)")}${kpi("Average invoice", money(b.inv.length ? b.inv.reduce((s, i) => s + invTotal(i), 0) / b.inv.length : 0))}</div>
  <div class="card" style="margin-top:12px"><h2><span class="seg">${["all", "draft", "sent", "overdue", "paid"].map(k => `<button class="${f === k ? "on" : ""}" data-act="invf" data-v="${k}">${k[0].toUpperCase() + k.slice(1)}</button>`).join("")}</span></h2>
   <div class="list">${list.map(i => { const [st, cls] = invStatus(i); return `<div class="it"><div class="ic">📨</div><div class="sp" data-act="editinv" data-id="${i.id}" style="cursor:pointer"><div class="t">${esc(i.no)} · ${esc((client(i.cl) || {}).name || "No client")}</div><div class="s">${niceY(i.d)} · due ${nice(i.due)} · <span class="tag ${cls}">${st}</span></div></div>
     <div class="rt"><div class="amt">${money(invTotal(i))}</div><div class="row" style="gap:5px"><button class="btn sm g" data-act="viewinv" data-id="${i.id}">View</button>${i.status !== "paid" ? `<button class="btn sm" data-act="payinv" data-id="${i.id}">Paid ✓</button>` : ""}</div></div></div>`; }).join("") || `<div class="empty">No invoices here.</div>`}</div></div>`;
}
function invoiceHTML(i){
  const b = B(), c = client(i.cl) || {}, sub = invSub(i), tax = sub * num(i.taxp) / 100;
  return `<div class="inv"><div style="display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap"><div><div style="font-size:28px;font-weight:900">${esc(b.set.bizName || b.name)}</div><div style="white-space:pre-line;color:#6B7C8F;font-size:13px">${esc(b.set.bizAddr || "")}</div></div>
   <div style="text-align:right"><div style="font-size:26px;font-weight:900;color:#0E9F8E">INVOICE</div><div style="font-size:13px">No. <b>${esc(i.no)}</b><br>Date ${niceY(i.d)}<br>Due ${niceY(i.due)}</div></div></div>
   <div style="margin:22px 0 12px;font-size:13px"><div style="color:#6B7C8F;font-weight:800;font-size:11px;letter-spacing:1px">BILL TO</div><b style="font-size:15px">${esc(c.name || "")}</b><br>${esc(c.email || "")}${c.phone ? "<br>" + esc(c.phone) : ""}</div>
   <table style="font-size:13px"><thead><tr><th style="text-align:left">Description</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead><tbody>${i.items.map(x => `<tr><td style="text-align:left;white-space:normal">${esc(x.d)}</td><td>${num(x.q)}</td><td>${money(num(x.p))}</td><td>${money(num(x.q) * num(x.p))}</td></tr>`).join("")}
   <tr><td colspan="3" style="text-align:right">Subtotal</td><td>${money(sub)}</td></tr>${num(i.taxp) ? `<tr><td colspan="3" style="text-align:right">Tax ${num(i.taxp)}%</td><td>${money(tax)}</td></tr>` : ""}<tr class="tot"><td colspan="3" style="text-align:right">Total</td><td style="font-size:16px">${money(sub + tax)}</td></tr></tbody></table>
   ${i.notes ? `<div style="margin-top:16px;font-size:13px;white-space:pre-line;color:#6B7C8F">${esc(i.notes)}</div>` : ""}<div style="margin-top:22px;font-size:12px;color:#6B7C8F">Thank you for your business!</div></div>`;
}
/* ================================================================ CLIENTS */
function scrClients(){
  const b = B(); const rev = id => b.tx.filter(t => t.cl === id && t.k === "in").reduce((s, t) => s + t.a, 0);
  const list = b.clients.map(c => ({c, rev: rev(c.id), open: b.inv.filter(i => i.cl === c.id && i.status === "sent").reduce((s, i) => s + invTotal(i), 0), n: b.inv.filter(i => i.cl === c.id).length})).sort((a, c) => c.rev - a.rev);
  const tot = list.reduce((s, x) => s + x.rev, 0);
  return `${head("Clients", "Who pays you — lifetime revenue and open invoices", `<button class="btn" data-act="addclient">+ Client</button>`)}
  <div class="grid g21"><div class="card"><div class="list">${list.map(x => `<div class="it" data-act="editclient" data-id="${x.c.id}" style="cursor:pointer"><div class="ic">🤝</div><div class="sp"><div class="t">${esc(x.c.name)}</div><div class="s">${esc(x.c.email || "")}${x.n ? " · " + x.n + " invoices" : ""}${x.open ? ` · <b style="color:var(--in)">${money(x.open)} open</b>` : ""}</div></div><div class="rt"><div class="amt i">${money(x.rev)}</div><span class="sub">${pct(x.rev, tot)}</span></div></div>`).join("") || `<div class="empty">No clients yet.</div>`}</div></div>
   <div class="card"><h2><span>Top clients</span><span class="sub">all time</span></h2>${list.length ? donut(list.slice(0, 7).map((x, i) => ({label: x.c.name, value: x.rev, color: PAL[i % PAL.length]})), {title: "Revenue"}) : `<div class="empty">—</div>`}</div></div>`;
}
/* ================================================================ PRODUCTS */
function scrProducts(){
  const b = B(), [from, to, lab] = scope();
  const stats = b.prods.map(p => { const tx = b.tx.filter(t => t.prod === p.id && t.k === "in" && t.d >= from && t.d <= to); const units = tx.reduce((s, t) => s + (num(t.qty) || 1), 0), rev = tx.reduce((s, t) => s + t.a, 0);
    return {p, units, rev, margin: num(p.price) - num(p.cost), profit: rev - units * num(p.cost)}; }).sort((a, c) => c.rev - a.rev);
  return `${head("Products", "Price, cost, margin and what sells", `<button class="btn" data-act="addprod">+ Product</button>`, true)}
  <div class="grid g3">${kpi("Units sold", stats.reduce((s, x) => s + x.units, 0), "var(--ink)", lab)}${kpi("Product revenue", money(stats.reduce((s, x) => s + x.rev, 0)), "var(--in)")}${kpi("Product profit", money(stats.reduce((s, x) => s + x.profit, 0)), "var(--ok)", "revenue − unit costs")}</div>
  <div class="card" style="margin-top:12px"><div class="tbl"><table><thead><tr><th>Product</th><th>Price</th><th>Cost</th><th>Margin</th><th>Sold</th><th>Revenue</th><th>Profit</th></tr></thead><tbody>
   ${stats.map(x => `<tr data-act="editprod" data-id="${x.p.id}" style="cursor:pointer"><td>${esc(x.p.name)} <span class="sub">${esc(x.p.sku || "")}</span></td><td>${money(num(x.p.price))}</td><td>${money(num(x.p.cost))}</td><td class="${x.margin >= 0 ? "pos" : "neg"}">${pct(x.margin, num(x.p.price))}</td><td>${x.units}</td><td>${money(x.rev)}</td><td><b>${money(x.profit)}</b></td></tr>`).join("") || `<tr><td colspan="7" class="empty">Add products, then pick the product when you log a sale.</td></tr>`}</tbody></table></div></div>
  ${stats.some(x => x.rev) ? `<div class="card" style="margin-top:12px"><h2><span>Best sellers</span></h2>${bars(stats.slice(0, 10).map(x => x.p.name.slice(0, 12)), [{name: "Revenue", color: "var(--in)", values: stats.slice(0, 10).map(x => x.rev)}, {name: "Profit", color: "var(--ok)", values: stats.slice(0, 10).map(x => x.profit)}])}</div>` : ""}`;
}
/* ================================================================ P&L */
function scrPnl(){
  const b = B(), [from, to, lab] = scope(), all = YEAR === "all";
  const cols = all ? years().map(y => ({l: String(y), f: y + "-01-01", t: y + "-12-31"})) : monthly(from, to, (m, e) => ({f: m, t: e})).map(x => ({l: x.label, f: x.f, t: x.t}));
  const ps = cols.map(c => pnl(c.f, c.t, b)), T = pnl(from, to, b);
  const prevY = !all ? pnl((+from.slice(0, 4) - 1) + "-01-01", (+from.slice(0, 4) - 1) + "-12-31", b) : null;
  const rowsFor = ty => b.cats.filter(c => c.t === ty).map(c => `<tr><td style="padding-left:18px">${c.e} ${esc(c.n)}</td>${cols.map(col => { const v = totals(col.f, col.t, b).byCat[c.id] || 0; return `<td>${v ? money(v, false, true) : "–"}</td>`; }).join("")}<td><b>${money(totals(from, to, b).byCat[c.id] || 0, false, true)}</b></td></tr>`).join("");
  const line_ = (n, k, cls = "") => `<tr class="tot"><td>${n}</td>${ps.map(p => `<td class="${cls && p[k] < 0 ? "neg" : cls}">${money(p[k], false, true)}</td>`).join("")}<td class="${T[k] < 0 ? "neg" : cls}">${money(T[k], false, true)}</td></tr>`;
  return `${head("Profit & loss", `${lab} · revenue − cost of goods − expenses`, `<button class="btn g" data-act="printpage">🖨️ Print</button>`, true)}
  <div class="grid g4">${kpi("Revenue", money(T.rev), "var(--in)", prevY ? "last year " + money(prevY.rev, false, true) : "")}${kpi("Gross profit", money(T.gross), "var(--ink)", "margin " + pct(T.gross, T.rev))}${kpi("Expenses", money(T.cogs + T.opex), "var(--out)")}${kpi("Net profit", money(T.net), T.net >= 0 ? "var(--ok)" : "var(--out)", "margin " + pct(T.net, T.rev) + (prevY ? " · last year " + money(prevY.net, false, true) : ""))}</div>
  <div class="card" style="margin-top:12px"><h2><span>${all ? "By year" : "By month"}</span></h2>${bars(cols.map(c => c.l), [{name: "Revenue", color: "var(--in)", values: ps.map(p => p.rev)}, {name: "Costs", color: "var(--out)", values: ps.map(p => p.cogs + p.opex)}], {line: {name: "Net profit", color: "var(--ok)", values: ps.map(p => p.net)}})}</div>
  <div class="card" style="margin-top:12px"><div class="tbl"><table><thead><tr><th></th>${cols.map(c => `<th>${c.l}</th>`).join("")}<th>Total</th></tr></thead><tbody>
   <tr><td colspan="${cols.length + 2}" style="font-weight:900;color:var(--in)">Revenue</td></tr>${rowsFor("income")}${line_("Total revenue", "rev")}
   <tr><td colspan="${cols.length + 2}" style="font-weight:900;color:#0891B2">Cost of goods</td></tr>${rowsFor("cogs")}${line_("Gross profit", "gross", "pos")}
   <tr><td colspan="${cols.length + 2}" style="font-weight:900;color:var(--out)">Expenses</td></tr>${rowsFor("bill")}${rowsFor("sub")}${rowsFor("exp")}${line_("Total expenses", "opex")}
   ${line_("Net profit", "net", "pos")}</tbody></table></div><div class="sub" style="margin-top:8px">Tax payments, owner's pay and loan repayments are not business expenses, so they're left out of profit.</div></div>`;
}
/* ================================================================ TAX */
function scrTax(){
  const b = B(), y = YEAR === "all" || !YEAR ? new Date().getFullYear() : YEAR, rate = num(b.set.taxRate);
  const qs = [0, 1, 2, 3].map(q => { const f = `${y}-${pad(q * 3 + 1)}-01`, t = mEnd(`${y}-${pad(q * 3 + 3)}-01`), p = pnl(f, t, b); return {q: "Q" + (q + 1), p, est: Math.max(0, p.net) * rate / 100}; });
  const P = pnl(y + "-01-01", y + "-12-31", b), est = Math.max(0, P.net) * rate / 100;
  return `${head("Tax set-aside", `${y} · a simple estimate to help you save for tax (not tax advice)`)}
  <div class="grid g4">${kpi("Profit", money(P.net), P.net >= 0 ? "var(--ok)" : "var(--out)", String(y))}<div class="card kpi"><div class="k">Set-aside rate %</div><input style="margin-top:6px" inputmode="decimal" value="${rate}" data-act="taxrate"></div>${kpi("Estimated tax", money(est), "var(--debt)")}${kpi("Paid / set aside", money(P.tax), "var(--ok)", est - P.tax > 0 ? money(est - P.tax) + " still to put aside" : "covered ✓")}</div>
  <div class="card" style="margin-top:12px"><div class="tbl"><table><thead><tr><th>Quarter</th><th>Revenue</th><th>Costs</th><th>Profit</th><th>Set aside (${rate}%)</th><th>Paid</th></tr></thead><tbody>
   ${qs.map(x => `<tr><td>${x.q}</td><td>${money(x.p.rev)}</td><td>${money(x.p.cogs + x.p.opex)}</td><td class="${x.p.net < 0 ? "neg" : ""}">${money(x.p.net)}</td><td><b>${money(x.est)}</b></td><td>${money(x.p.tax)}</td></tr>`).join("")}
   <tr class="tot"><td>Year</td><td>${money(P.rev)}</td><td>${money(P.cogs + P.opex)}</td><td>${money(P.net)}</td><td>${money(est)}</td><td>${money(P.tax)}</td></tr></tbody></table></div>
   <div class="sub" style="margin-top:8px">Log tax payments (or transfers to a tax savings account) with the “Tax payments” category. Ask a tax professional for your real rate.</div></div>`;
}
/* ================================================================ REPORTS */
function scrReports(){
  const b = B(), [from, to, lab] = scope(), all = YEAR === "all";
  const cols = all ? years().map(y => ({l: String(y), f: y + "-01-01", t: y + "-12-31"})) : monthly(from, to, (m, e) => ({f: m, t: e})).map(x => ({l: x.label, f: x.f, t: x.t}));
  const T = cols.map(c => totals(c.f, c.t, b)), tot = totals(from, to, b);
  const types = ["income", "bill", "sub", "exp", "cogs", "save", "debt", "tax", "draw"].filter(ty => b.cats.some(c => c.t === ty));
  const catRows = ty => b.cats.filter(c => c.t === ty && (tot.byCat[c.id] || 0)).map(c => `<tr><td style="padding-left:16px">${c.e} ${esc(c.n)}</td>${T.map(x => `<td>${x.byCat[c.id] ? money(x.byCat[c.id], false, true) : "–"}</td>`).join("")}<td><b>${money(tot.byCat[c.id], false, true)}</b></td><td>${money(tot.byCat[c.id] / cols.length, false, true)}</td></tr>`).join("");
  const yrs = years(); const yoy = yrs.map(y => { const x = totals(y + "-01-01", y + "-12-31", b); return {y, ...x}; });
  return `${head("Reports", `${lab} · every category, every ${all ? "year" : "month"}`, `<button class="btn g" data-act="printpage">🖨️ Print</button>`, true)}
  <div class="grid g4">${kpi("Money in", money(tot.in), "var(--in)")}${kpi("Money out", money(tot.out), "var(--out)")}${kpi("Net", money(tot.net), tot.net >= 0 ? "var(--ok)" : "var(--out)")}${kpi(all ? "Per year (avg)" : "Per month (avg)", money(tot.out / cols.length), "var(--ink)", "money out")}</div>
  <div class="card" style="margin-top:12px"><div class="tbl" style="max-height:70vh"><table><thead><tr><th>Category</th>${cols.map(c => `<th>${c.l}</th>`).join("")}<th>Total</th><th>Avg</th></tr></thead><tbody>
   ${types.map(ty => `<tr><td colspan="${cols.length + 3}" style="font-weight:900;color:${CT_COLOR[ty]}">${CTYPES[ty]}</td></tr>${catRows(ty)}<tr class="tot"><td>Total ${CTYPES[ty].toLowerCase()}</td>${T.map(x => `<td>${money(x.byT[ty] || 0, false, true)}</td>`).join("")}<td>${money(tot.byT[ty] || 0, false, true)}</td><td>${money((tot.byT[ty] || 0) / cols.length, false, true)}</td></tr>`).join("")}
   <tr class="tot"><td>Net (in − out)</td>${T.map(x => `<td class="${x.net < 0 ? "neg" : "pos"}">${money(x.net, false, true)}</td>`).join("")}<td class="${tot.net < 0 ? "neg" : "pos"}">${money(tot.net, false, true)}</td><td></td></tr></tbody></table></div></div>
  ${yrs.length > 1 ? `<div class="card" style="margin-top:12px"><h2><span>All-time, year by year</span></h2>${bars(yoy.map(x => String(x.y)), [{name: "In", color: "var(--in)", values: yoy.map(x => x.in)}, {name: "Out", color: "var(--out)", values: yoy.map(x => x.out)}], {line: {name: "Net", color: "var(--brand)", values: yoy.map(x => x.net)}})}</div>` : ""}`;
}
/* ================================================================ COMPARE */
function scrCompare(){
  const b = B(), t = today(), mode = sel.cmpm || "month";
  const A = sel.ca || (mode === "month" ? addM(t, -1).slice(0, 7) : String(+t.slice(0, 4) - 1)), Bp = sel.cb || (mode === "month" ? t.slice(0, 7) : t.slice(0, 4));
  const rng = v => mode === "month" ? [v + "-01", mEnd(v + "-01")] : [v + "-01-01", v + "-12-31"];
  const ta = totals(...rng(A), b), tb = totals(...rng(Bp), b);
  const rows = b.cats.filter(c => ta.byCat[c.id] || tb.byCat[c.id]).map(c => ({c, a: ta.byCat[c.id] || 0, b: tb.byCat[c.id] || 0})).sort((x, y) => Math.abs(y.b - y.a) - Math.abs(x.b - x.a));
  const good = (c, d) => c.t === "income" || c.t === "save" ? d >= 0 : d <= 0;
  const opts = mode === "month" ? (() => { const o = []; for (let i = 0; i < 48; i++) o.push(addM(t, -i).slice(0, 7)); return o; })() : years().map(String).reverse();
  const optL = v => mode === "month" ? FULLM[+v.slice(5, 7) - 1] + " " + v.slice(0, 4) : v;
  return `${head("Compare", "Any two months or years side by side")}
  <div class="card"><div class="row w"><span class="seg"><button class="${mode === "month" ? "on" : ""}" data-act="cmpm" data-v="month">Months</button><button class="${mode === "year" ? "on" : ""}" data-act="cmpm" data-v="year">Years</button></span>
   <select style="width:auto" data-act="cset" data-k="ca">${opts.map(o => `<option value="${o}" ${o === A ? "selected" : ""}>${optL(o)}</option>`).join("")}</select><b>vs</b>
   <select style="width:auto" data-act="cset" data-k="cb">${opts.map(o => `<option value="${o}" ${o === Bp ? "selected" : ""}>${optL(o)}</option>`).join("")}</select></div></div>
  <div class="grid g3" style="margin-top:12px">${kpi("Money in", money(tb.in), "var(--in)", money(tb.in - ta.in, true) + " vs " + optL(A))}${kpi("Money out", money(tb.out), "var(--out)", money(tb.out - ta.out, true))}${kpi("Net", money(tb.net), tb.net >= 0 ? "var(--ok)" : "var(--out)", money(tb.net - ta.net, true))}</div>
  <div class="card" style="margin-top:12px"><h2><span>By category</span><span class="sub">biggest changes first</span></h2><div class="tbl"><table><thead><tr><th>Category</th><th>${optL(A)}</th><th>${optL(Bp)}</th><th>Change</th><th>%</th></tr></thead><tbody>
   ${rows.map(x => { const d = x.b - x.a; return `<tr><td>${x.c.e} ${esc(x.c.n)}</td><td>${money(x.a)}</td><td>${money(x.b)}</td><td class="${d === 0 ? "" : good(x.c, d) ? "pos" : "neg"}">${money(d, true)}</td><td class="${d === 0 ? "" : good(x.c, d) ? "pos" : "neg"}">${x.a ? (d / x.a * 100).toFixed(0) + "%" : "new"}</td></tr>`; }).join("") || `<tr><td colspan="5" class="empty">Nothing to compare.</td></tr>`}</tbody></table></div></div>`;
}
/* ================================================================ CUSTOM REPORT */
function scrCustom(){
  const b = B(), t = today(), r = sel.cr || {from: t.slice(0, 4) + "-01-01", to: t, ty: "", who: "", ac: "", cl: ""};
  const filt = x => (!r.ty || cat(x.c, b).t === r.ty) && (!r.who || x.who === r.who) && (!r.ac || x.ac === r.ac) && (!r.cl || x.cl === r.cl);
  const tt = totals(r.from, r.to, b, filt), list = b.tx.filter(x => x.d >= r.from && x.d <= r.to && x.k !== "move" && filt(x)).sort((a, c) => c.a - a.a);
  const cats = Object.entries(tt.byCat).map(([id, v]) => ({c: cat(id, b), v})).sort((a, c) => c.v - a.v), days = diffD(r.from, r.to) + 1;
  return `${head("Custom report", "Any dates, any type, person, account or client")}
  <div class="card"><div class="grid g3" style="gap:8px"><div><label class="f">From</label><input type="date" value="${r.from}" data-act="crset" data-k="from"></div><div><label class="f">To</label><input type="date" value="${r.to}" data-act="crset" data-k="to"></div>
   <div><label class="f">Type</label><select data-act="crset" data-k="ty"><option value="">Everything</option>${Object.entries(CTYPES).filter(([k]) => b.cats.some(c => c.t === k)).map(([k, v]) => `<option value="${k}" ${r.ty === k ? "selected" : ""}>${v}</option>`).join("")}</select></div>
   <div><label class="f">Person</label><select data-act="crset" data-k="who"><option value="">Everyone</option>${S.people.map(p => `<option ${r.who === p ? "selected" : ""}>${esc(p)}</option>`).join("")}</select></div>
   <div><label class="f">Account</label><select data-act="crset" data-k="ac"><option value="">All accounts</option>${b.accounts.map(a => `<option value="${a.id}" ${r.ac === a.id ? "selected" : ""}>${esc(a.name)}</option>`).join("")}</select></div>
   ${isBiz() ? `<div><label class="f">Client</label><select data-act="crset" data-k="cl"><option value="">All clients</option>${b.clients.map(c => `<option value="${c.id}" ${r.cl === c.id ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select></div>` : ""}</div></div>
  <div class="grid g4" style="margin-top:12px">${kpi("Money in", money(tt.in), "var(--in)")}${kpi("Money out", money(tt.out), "var(--out)")}${kpi("Net", money(tt.net), tt.net >= 0 ? "var(--ok)" : "var(--out)")}${kpi("Out per day", money(tt.out / days), "var(--ink)", days + " days")}</div>
  <div class="grid g2" style="margin-top:12px"><div class="card"><h2><span>By category</span></h2>${cats.length ? donut(cats.slice(0, 8).map((x, i) => ({label: x.c.e + " " + x.c.n, value: x.v, color: PAL[i % PAL.length]}))) : `<div class="empty">Nothing in this range.</div>`}</div>
   <div class="card"><h2><span>Biggest entries</span></h2><div class="list">${list.slice(0, 12).map(x => txRow(x)).join("") || `<div class="empty">—</div>`}</div></div></div>`;
}
/* ================================================================ PEOPLE */
function scrPeople(){
  const b = B(), [from, to, lab] = scope();
  const ppl = [...S.people, ""].map(p => { const x = totals(from, to, b, t => (t.who || "") === p); return {p: p || "No person", ...x}; }).filter(x => x.in || x.out);
  const totOut = ppl.reduce((s, x) => s + x.out, 0), m = monthly(from, to, (a, e) => ({}));
  return `${head("People", "Who earns and who spends — family, partners or team", `<button class="btn g" data-go="settings">Edit people</button>`, true)}
  <div class="grid g3">${ppl.map((x, i) => `<div class="card"><div class="row"><div class="ic" style="background:var(--brand-l)">${["🙂", "😊", "🏠", "👤", "🧑", "👧"][i % 6]}</div><div class="sp" style="font-weight:900;font-size:16px">${esc(x.p)}</div><span class="sub">${pct(x.out, totOut)} of spending</span></div>
    <div class="grid g2" style="gap:8px;margin-top:10px"><div class="kpi"><div class="k">In</div><div class="v" style="color:var(--in);font-size:20px">${money(x.in)}</div></div><div class="kpi"><div class="k">Out</div><div class="v" style="color:var(--out);font-size:20px">${money(x.out)}</div></div></div>
    <div class="bar" style="margin-top:10px"><i style="width:${totOut ? x.out / totOut * 100 : 0}%;background:${PAL[i % PAL.length]}"></i></div></div>`).join("") || `<div class="card empty">Pick “Who” when you add entries to see this.</div>`}</div>
  ${ppl.length ? `<div class="card" style="margin-top:12px"><h2><span>Money out by month</span><span class="sub">${lab}</span></h2>${bars(m.map(x => x.label), ppl.slice(0, 5).map((x, i) => ({name: x.p, color: PAL[i % PAL.length], values: m.map(mm => totals(mm.m, mEnd(mm.m), b, t => (t.who || "No person") === x.p || (x.p === "No person" && !t.who)).out)})))}</div>` : ""}`;
}
/* ================================================================ 50/30/20 */
function scrRule(){
  const b = B(), [from, to, lab] = scope(), tg = sel.r5 || [50, 30, 20];
  const grp = (f, t) => { const x = {need: 0, want: 0, save: 0, inc: 0}; for (const tx of b.tx){ if (tx.d < f || tx.d > t || tx.k === "move") continue; const c = cat(tx.c, b); if (tx.k === "in") x.inc += tx.a; else if (c.grp) x[c.grp] += tx.a; } return x; };
  const T = grp(from, to), ms = monthly(from, to, (m, e) => grp(m, e));
  const st = x => !x.inc ? "–" : x.want / x.inc * 100 > tg[1] ? "Too many wants" : x.need / x.inc * 100 > tg[0] ? "Needs too high" : x.save / x.inc * 100 < tg[2] ? "Save more" : "On target ✓";
  return `${head("50 / 30 / 20", "Needs · wants · savings & debt — how your income splits", "", true)}
  <div class="grid g3">${[["Needs", "need", 0, "var(--in)"], ["Wants", "want", 1, "var(--out)"], ["Savings & debt", "save", 2, "var(--save)"]].map(([n, k, i, c]) => kpi(n, pct(T[k], T.inc), c, `target ${tg[i]}% · ${money(T[k])}`)).join("")}</div>
  <div class="grid g2" style="margin-top:12px"><div class="card"><h2><span>${lab}</span></h2>${donut([{label: "Needs", value: T.need, color: "var(--in)"}, {label: "Wants", value: T.want, color: "var(--out)"}, {label: "Savings & debt", value: T.save, color: "var(--save)"}, {label: "Left over", value: Math.max(0, T.inc - T.need - T.want - T.save), color: "var(--line)"}], {title: "Income"})}
   <div class="sub" style="margin-top:8px">Set each category's group (Need / Want) in Settings → Categories.</div></div>
   <div class="card"><div class="tbl"><table><thead><tr><th>Month</th><th>Income</th><th>Needs</th><th>Wants</th><th>Save</th><th>Status</th></tr></thead><tbody>${ms.map(x => `<tr><td>${x.label}</td><td>${money(x.inc, false, true)}</td><td>${pct(x.need, x.inc)}</td><td>${pct(x.want, x.inc)}</td><td>${pct(x.save, x.inc)}</td><td class="${st(x).includes("✓") ? "pos" : st(x) === "–" ? "" : "neg"}">${st(x)}</td></tr>`).join("")}</tbody></table></div></div></div>`;
}
/* ================================================================ HABITS (no-spend + impulse) */
function scrHabits(){
  const b = B(), y = YEAR === "all" || !YEAR ? new Date().getFullYear() : YEAR, t = today();
  const spentDays = new Set(b.tx.filter(x => x.k === "out" && cat(x.c, b).t === "exp" && !x.rec).map(x => x.d));
  let nsTotal = 0; const rows = FULLM.map((mn, m) => { let cnt = 0; const cells = []; for (let d = 1; d <= 31; d++){ const s = `${y}-${pad(m + 1)}-${pad(d)}`, valid = d <= new Date(y, m + 1, 0).getDate();
      if (!valid || s > t){ cells.push(`<i class="${valid ? "" : "x"}"></i>`); continue; } const ns = !spentDays.has(s); if (ns) cnt++; cells.push(`<i class="${ns ? "y" : "n"}" title="${s}"></i>`); } nsTotal += cnt;
    return `<div class="row" style="gap:8px;margin:3px 0"><b style="width:34px;font-size:12px">${mn.slice(0, 3)}</b><div class="heat sp">${cells.join("")}</div><span class="sub" style="width:30px;text-align:right">${cnt}</span></div>`; });
  const w = b.wish.slice().sort((a, c) => (a.dec === "Waiting" ? 0 : 1) - (c.dec === "Waiting" ? 0 : 1) || (a.d < c.d ? 1 : -1)), wait = num(b.set.wait) || 30;
  const saved = b.wish.filter(x => x.dec === "Skipped").reduce((s, x) => s + num(x.price), 0);
  return `${head("Habits", "No-spend days and impulse control")}
  <div class="grid g4">${kpi("No-spend days", nsTotal, "var(--ok)", String(y))}${kpi("Waiting list", money(b.wish.filter(x => x.dec === "Waiting").reduce((s, x) => s + num(x.price), 0)), "var(--save)")}${kpi("Saved by skipping", money(saved), "var(--ok)")}${kpi("Cooling-off", wait + " days", "var(--ink)", "for wants")}</div>
  <div class="grid g2" style="margin-top:12px">
   <div class="card"><h2><span>🌿 No-spend calendar ${y}</span><span class="sub">green = no everyday spending</span></h2>${rows.join("")}<div class="sub" style="margin-top:8px">Bills and recurring payments don't count — only “Expenses” type spending.</div></div>
   <div class="card"><h2><span>🧘 Impulse control</span><button class="btn sm" data-act="addwish">+ I want…</button></h2><div class="sub" style="margin-bottom:6px">Write it down, wait, then decide. Most urges fade.</div>
    <div class="list">${w.map(x => { const ok = addD(x.d, x.need ? 3 : wait), left = diffD(t, ok), hrs = num(b.set.wage) ? num(x.price) / num(b.set.wage) : 0;
      return `<div class="it" style="flex-wrap:wrap"><div class="ic">${x.dec === "Skipped" ? "🧘" : x.dec === "Bought" ? "🛍️" : "⏳"}</div><div class="sp"><div class="t">${esc(x.name)}</div><div class="s">${money(num(x.price))}${hrs ? ` · ${hrs.toFixed(1)} h of work` : ""} · ${x.dec === "Waiting" ? (left > 0 ? `wait ${left} more day${left === 1 ? "" : "s"}` : "cooling-off over — still want it?") : x.dec}</div></div>
       ${x.dec === "Waiting" ? `<button class="btn sm g" data-act="wishdec" data-id="${x.id}" data-v="Skipped">Skip</button><button class="btn sm" data-act="wishdec" data-id="${x.id}" data-v="Bought">Bought</button>` : `<button class="btn sm g" data-act="delwish" data-id="${x.id}">✕</button>`}</div>`; }).join("") || `<div class="empty">Nothing on the list. Next time you feel the urge, add it here first.</div>`}</div></div>
  </div>`;
}
/* ================================================================ MILESTONES */
function scrMilestones(){
  const f = sel.msf || "all", list = MS.filter(m => f === "all" || (f === "yes" ? S.ms[m[0]] : !S.ms[m[0]]));
  return `${head("Milestones", `${Object.keys(S.ms).length} of ${MS.length} reached`, `<span class="seg">${[["all", "All"], ["yes", "Reached"], ["no", "Not yet"]].map(([k, v]) => `<button class="${f === k ? "on" : ""}" data-act="msf" data-v="${k}">${v}</button>`).join("")}</span>`)}
  <div class="grid g3">${list.map(([k, e, t, d]) => `<div class="badge ${S.ms[k] ? "" : "lock"}"><div class="e">${e}</div><div><div style="font-weight:900">${t}</div><div class="sub">${d}${S.ms[k] ? " · " + nice(S.ms[k]) : ""}</div></div></div>`).join("")}</div>`;
}
/* ================================================================ SETTINGS */
function scrSettings(){
  const b = B(), L = S.look;
  return `${head("Settings", "Make it yours")}
  <div class="grid g2">
   <div class="grid">
    <div class="card"><h2><span>🙂 You</span></h2><div class="grid g2" style="gap:8px"><div><label class="f">Your name</label><input data-set="profile.name" value="${esc(S.profile.name)}"></div>
     <div><label class="f">Currency symbol</label><input data-set="profile.cur" value="${esc(S.profile.cur)}" maxlength="4"></div><div><label class="f">Decimals</label><select data-set="profile.dec">${[0, 2].map(v => `<option ${S.profile.dec == v ? "selected" : ""}>${v}</option>`).join("")}</select></div>
     <div><label class="f">Main number is called</label><select data-set="look.label">${["Safe to spend", "Left to spend", "Remaining to spend"].map(v => `<option ${L.label === v ? "selected" : ""}>${v}</option>`).join("")}</select></div></div></div>
    <div class="card"><h2><span>📚 Books</span><button class="btn sm" data-act="newbook">+ Book</button></h2><div class="sub" style="margin-bottom:6px">Keep home and business money apart. Switch at the top of any screen.</div>
     <div class="list">${S.books.map(x => `<div class="it"><div class="ic">${esc(x.emoji)}</div><div class="sp"><div class="t">${esc(x.name)}</div><div class="s">${x.type === "business" ? "Business" : "Personal"} · ${x.tx.length} entries</div></div><button class="btn sm g" data-act="editbook" data-id="${x.id}">Edit</button></div>`).join("")}</div></div>
    ${b.type === "business" ? `<div class="card"><h2><span>💼 This business</span></h2><div class="grid g2" style="gap:8px"><div><label class="f">Business name (invoices)</label><input data-bset="bizName" value="${esc(b.set.bizName)}"></div><div><label class="f">Monthly revenue target</label><input data-bset="target" inputmode="decimal" value="${b.set.target || ""}"></div>
     <div><label class="f">Next invoice number</label><input data-bset="invNo" inputmode="numeric" value="${b.set.invNo}"></div><div><label class="f">Tax set-aside %</label><input data-bset="taxRate" inputmode="decimal" value="${b.set.taxRate}"></div></div>
     <label class="f">Address / payment details on invoices</label><textarea data-bset="bizAddr" style="min-height:70px">${esc(b.set.bizAddr)}</textarea></div>` : ""}
    <div class="card"><h2><span>👪 People</span></h2><div class="sub">Comma separated — used for “Who” on entries.</div><input style="margin-top:6px" data-act="people" value="${esc(S.people.join(", "))}"></div>
    <div class="card"><h2><span>🧘 Habits</span></h2><div class="grid g3" style="gap:8px"><div><label class="f">Cooling-off days</label><input data-bset="wait" inputmode="numeric" value="${b.set.wait}"></div><div><label class="f">Hourly pay (work hours)</label><input data-bset="wage" inputmode="decimal" value="${b.set.wage || ""}"></div></div></div>
   </div>
   <div class="grid">
    <div class="card"><h2><span>🏷️ Categories</span><button class="btn sm" data-act="addcat">+ Category</button></h2><div class="sub" style="margin-bottom:6px">Tap one to rename, change type, Need/Want group or monthly budget.</div>
     ${Object.keys(CTYPES).filter(ty => b.cats.some(c => c.t === ty)).map(ty => `<div class="sub" style="font-weight:900;margin:8px 0 4px;color:${CT_COLOR[ty]}">${CTYPES[ty]}</div><div class="chips">${b.cats.filter(c => c.t === ty).map(c => `<button class="chip" data-act="editcat" data-id="${c.id}">${c.e} ${esc(c.n)}${c.grp && c.grp !== "save" ? ` <span class="sub">${c.grp}</span>` : ""}</button>`).join("")}</div>`).join("")}</div>
    <div class="card"><h2><span>🎨 Look</span></h2><div class="seg">${[["auto", "Match device"], ["light", "Light"], ["dark", "Dark"]].map(([k, v]) => `<button class="${L.theme === k ? "on" : ""}" data-act="theme" data-v="${k}">${v}</button>`).join("")}</div></div>
    <div class="card"><h2><span>💾 Backup & data</span></h2><div class="sub">Everything is saved only on this device, in this browser. Download a backup regularly and to move to another device.</div>
     <div class="row w" style="margin-top:10px"><button class="btn" data-act="backup">Download backup</button><label class="btn g">Restore backup<input type="file" accept=".json,application/json" data-act="restore" hidden></label><button class="btn g" data-act="csv">Export CSV</button><label class="btn g">Import CSV<input type="file" accept=".csv,text/csv" data-act="importcsv" hidden></label></div>
     <div class="sub" style="margin-top:8px">${S.lastBackup ? "Last backup " + niceY(S.lastBackup) : "No backup yet."} · CSV import columns: Date, Amount, Category, Note (negative amount = money out).</div></div>
    <div class="card"><h2><span>📲 Use it like an app</span></h2><div class="sub" style="line-height:1.65"><b>iPhone / iPad:</b> Safari → Share ⬆️ → Add to Home Screen.<br><b>Android:</b> Chrome → ⋮ → Add to Home screen.<br><b>Windows / Mac:</b> Chrome or Edge → install icon in the address bar.<br>Safari may clear website data after ~7 days unused — Home Screen + backups keep it safe.</div></div>
    <div class="card"><h2><span>🧪 Example data</span></h2><div class="row w"><button class="btn g" data-act="demo">Load example data</button><button class="btn r" data-act="erase">Erase everything</button></div><div class="sub" style="margin-top:8px">Example data replaces everything with 3 years of sample home + business data.</div></div>
   </div></div>`;
}
/* ================================================================ HELP */
function scrHelp(){
  const q = (sel.hq || "").toLowerCase();
  const H = [["Books", "A book is a separate set of money: Home, Business, a side hustle. Each has its own accounts, categories, entries and reports. Switch at the top of any screen. Settings → Books to add more."],
    ["Year & All time", "Screens with 📅 show one year or All time. Your data is kept forever, so you can look back at any year."],
    ["Safe to spend", "On Today (personal books): money in your spending accounts minus unpaid bills before your next payday, shared across the days until payday."],
    ["Logging", "Quick log on Today, or + Add for the full form: date, amount, category, account, person, note — and client / product in business books. Fast: type “12 coffee” and press Enter."],
    ["Recurring & bills", "Add repeating income and payments once. Auto items log themselves on the date. Others: tick ✓ when paid. 10 frequencies, from one time to yearly."],
    ["Budget", "Monthly budget per category. Carry over = money left last month rolls in. Zero-based = give every dollar a job until Left to budget is 0."],
    ["Paycheck budget", "Weekly, every 2 weeks, twice a month, every 4 weeks, monthly or custom. Monthly budgets are scaled to the days in the pay period."],
    ["Goals & sinking funds", "Goals: things you're saving for. Sinking funds: big yearly costs, with how much to set aside each month."],
    ["Debt payoff", "Add debts with interest and minimums. See snowball vs avalanche, debt-free dates and interest — and how an extra monthly payment changes it."],
    ["Net worth", "Accounts + investments − debts, month by month or year by year."],
    ["Invoices", "Business books: create an invoice, View → Print / Save as PDF to send it. Tap Paid ✓ when the money arrives — it logs the income with the client."],
    ["Profit & loss", "Revenue − cost of goods = gross profit; − expenses = net profit. Tax, owner's pay and loan repayments are left out."],
    ["Statement", "Pick an account and dates for a running-balance statement you can print."],
    ["Backup", "Settings → Download backup saves one file with every book. Restore it on any device."],
    ["Privacy", "No account and no bank connection. Everything stays on your device."]];
  const shown = H.filter(([t, x]) => !q || (t + x).toLowerCase().includes(q));
  return `${head("Help", "Plain-language guide", `<button class="btn g" data-act="printpage">🖨️ Print</button>`)}
  <div class="grid g21"><div class="card"><input placeholder="Search help…" value="${esc(sel.hq || "")}" data-act="hq">${shown.map(([t, x]) => `<h3 style="font-size:15px;margin:14px 0 3px">${t}</h3><div class="sub" style="font-size:14px;color:var(--ink)">${x}</div>`).join("") || `<div class="empty">No match.</div>`}</div>
   <div class="card"><h2><span>Keyboard shortcuts</span></h2><div class="sub" style="line-height:2;color:var(--ink)"><span class="kbd">/</span> quick log · <span class="kbd">N</span> new entry<br><span class="kbd">D</span> Dashboard · <span class="kbd">T</span> Today · <span class="kbd">L</span> Transactions · <span class="kbd">B</span> Budget · <span class="kbd">R</span> Reports</div>
    <h2 style="margin-top:14px"><span>Works on</span></h2><div class="sub" style="color:var(--ink)">iPhone & iPad (Safari) · Android (Chrome) · Windows & Mac (Chrome, Edge, Safari). Works offline after the first visit.</div></div></div>`;
}
function scrMore(){
  return `${head("More", "Everything in Prosper Hub")}${navDef().map(([g, items]) => `<div class="sub" style="font-weight:900;margin:14px 0 6px;text-transform:uppercase;letter-spacing:1px;font-size:11px">${g}</div><div class="grid g3">${items.map(([k, e, t]) => `<button class="card row" style="text-align:left;padding:13px" data-go="${k}"><span class="ic" style="background:var(--brand-l)">${e}</span><b>${t}</b></button>`).join("")}</div>`).join("")}`;
}
/* ================================================================ ONBOARDING */
function scrOnboard(){
  const st = sel.ob || 0;
  const steps = [
    `<div style="font-size:46px">🌿</div><h3 style="font-size:28px">Welcome to Prosper Hub</h3><p class="sub" style="font-size:15px;margin:8px 0 14px">Your home money and your business money — budgets, bills, goals, debt, net worth, invoices and profit — in one calm app.</p>
     <div class="grid g2" style="gap:8px"><div><label class="f">Your name</label><input id="ob_name" value="${esc(S.profile.name)}" placeholder="First name"></div><div><label class="f">Currency symbol</label><input id="ob_cur" value="${esc(S.profile.cur)}" maxlength="4"></div></div>`,
    `<h3>What would you like to track?</h3><p class="sub">You can add more books later.</p><div class="list" style="margin-top:8px">${[["personal", "🏡 Home only", "Personal & family budget"], ["business", "💼 Business only", "Income, expenses, invoices, profit"], ["both", "🏡 + 💼 Both", "Two books — switch any time"]].map(([k, t, s]) => `<label class="it" style="cursor:pointer"><input type="radio" name="obt" value="${k}" ${k === (sel.obt || "both") ? "checked" : ""} style="width:22px;height:22px" data-act="obt"><div class="sp"><div class="t">${t}</div><div class="s">${s}</div></div></label>`).join("")}</div>`,
    `<h3>Starting balances</h3><p class="sub">Roughly what's in your main account(s) today. Change any time on Accounts.</p>
     ${(sel.obt || "both") !== "business" ? `<label class="f">Home — main account</label><input id="ob_bal" class="amount" inputmode="decimal" placeholder="${esc(S.profile.cur)}0">` : ""}${(sel.obt || "both") !== "personal" ? `<label class="f">Business — main account</label><input id="ob_bbal" class="amount" inputmode="decimal" placeholder="${esc(S.profile.cur)}0">` : ""}
     ${(sel.obt || "both") !== "business" ? `<div class="grid g3" style="gap:8px;margin-top:6px"><div><label class="f">You get paid</label><select id="ob_freq">${["weekly", "fortnightly", "twicemonthly", "fourweekly", "monthly"].map(k => `<option value="${k}" ${k === "monthly" ? "selected" : ""}>${FREQS[k]}</option>`).join("")}</select></div><div><label class="f">Next payday</label><input id="ob_date" type="date" value="${addD(today(), 7)}"></div><div><label class="f">About</label><input id="ob_amt" inputmode="decimal" placeholder="${esc(S.profile.cur)}0"></div></div>` : ""}`];
  return `<div class="modal" style="background:var(--bg);align-items:center"><div class="sheet" style="border-radius:22px;box-shadow:var(--shadow)">${steps[st]}
   <div class="row" style="margin-top:16px">${st ? `<button class="btn g" data-act="obback">Back</button>` : `<button class="btn g" data-act="demo">Try with example data</button>`}<span class="sp"></span><button class="btn" data-act="obnext">${st === 2 ? "Start" : "Next"}</button></div>
   <div class="row" style="justify-content:center;gap:6px;margin-top:12px">${[0, 1, 2].map(i => `<span style="width:${i === st ? 22 : 8}px;height:8px;border-radius:9px;background:${i === st ? "var(--brand)" : "var(--line)"}"></span>`).join("")}</div></div></div>`;
}
