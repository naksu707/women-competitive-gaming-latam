(() => {
  const NS = "http://www.w3.org/2000/svg";
  const C = {
    women: "#dc5a96", men: "#2c9fc4", rest: "#2f3a72",
    ink: "#f3f6ff", ink2: "#c7d0f0", muted: "#8e9ac8", grid: "rgba(220,236,255,0.10)",
    card: "#1c2452"
  };
  const EN = (document.documentElement.lang || "es").toLowerCase().startsWith("en");
  const tr = (es, en) => (EN ? en : es);
  const fmt = (v, d = 1) => v.toLocaleString(EN ? "en-US" : "es-CO", { minimumFractionDigits: d, maximumFractionDigits: d }) + "%";

  function el(tag, attrs = {}, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function svg(host, w, h, label) {
    const s = el("svg", { viewBox: `0 0 ${w} ${h}`, role: "img", "aria-label": label });
    host.appendChild(s);
    return s;
  }
  function text(parent, x, y, str, attrs = {}) {
    const t = el("text", Object.assign({ x, y, fill: C.ink2, "font-size": 14 }, attrs), parent);
    t.textContent = str;
    return t;
  }
  let tableCount = 0;
  function addTable(host, headers, rows) {
    const fig = host.closest("figure");
    const id = "datos-" + (++tableCount);
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <button class="btn btn-sm data-toggle" type="button" data-bs-toggle="collapse" data-bs-target="#${id}" aria-expanded="false" aria-controls="${id}">▸ ${tr("Ver los datos en tabla", "View data as a table")}</button>
      <div class="collapse" id="${id}">
        <div class="table-responsive">
          <table class="table table-sm table-data">
            <thead><tr>${headers.map(h => `<th scope="col">${h}</th>`).join("")}</tr></thead>
            <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
          </table>
        </div>
      </div>`;
    fig.insertBefore(wrap, fig.querySelector("figcaption"));
  }

  /* ---------- tooltip ---------- */
  const tip = document.getElementById("tip");
  function bindTip(node, html, mark) {
    node.addEventListener("mousemove", e => {
      tip.innerHTML = html;
      tip.style.opacity = 1;
      const x = Math.min(e.clientX + 16, window.innerWidth - tip.offsetWidth - 10);
      tip.style.left = x + "px";
      tip.style.top = (e.clientY + 16) + "px";
      if (mark) mark.classList.add("on");
    });
    node.addEventListener("mouseleave", () => { tip.style.opacity = 0; if (mark) mark.classList.remove("on"); });
  }

  /* ---------- 1. waffles ---------- */
  function waffle(hostId, pct, title, n) {
    const host = document.getElementById(hostId);
    const cell = 26, gap = 4, size = 10 * (cell + gap);
    const s = svg(host, size, size + 56, `${title}: ${pct}% ${tr("mujeres", "women")}`);
    s.setAttribute("shape-rendering", "crispEdges");
    text(s, 0, 20, title, { "font-family": "Pixelify Sans", "font-size": 20, fill: C.ink });
    text(s, size, 22, pct + "%", { "text-anchor": "end", "font-family": "Pixelify Sans", "font-size": 30, fill: C.women });
    const g = el("g", { transform: "translate(0,40)" }, s);
    for (let i = 0; i < 100; i++) {
      const col = i % 10, row = Math.floor(i / 10);
      const filled = i < pct;
      const r = el("rect", {
        x: col * (cell + gap), y: row * (cell + gap), width: cell, height: cell,
        fill: filled ? C.women : C.rest, class: "pop"
      }, g);
      r.style.transitionDelay = (i * 12) + "ms";
    }
    const hit = el("rect", { x: 0, y: 40, width: size, height: size, class: "hit" }, s);
    bindTip(hit, `<b>${title}</b><br>${pct}% ${tr("mujeres", "women")} · ${100 - pct}% ${tr("hombres y otras identidades", "men and other identities")}<br><span style="color:#8e9ac8">${n}</span>`);
  }
  waffle("waffle-world", 48, tr("Mundo", "World"), tr("21 países · n = 24.216", "21 countries · n = 24,216"));
  waffle("waffle-brazil", 57, tr("Brasil", "Brazil"), tr("n = 1.348", "n = 1,348"));
  addTable(document.getElementById("waffle-world"), [tr("Territorio", "Territory"), tr("Mujeres", "Women"), tr("Hombres", "Men")], [[tr("Mundo (21 países)", "World (21 countries)"), "48%", "51%"], [tr("Brasil", "Brazil"), "57%", "43%"]]);

  /* ---------- 1b. PGB line ---------- */
  (function () {
    const data = [
      { y: 2019, v: 53.0 }, { y: 2020, v: 53.8 }, { y: 2023, v: 46.2 },
      { y: 2024, v: 50.9 }, { y: 2025, v: 53.2 }, { y: 2026, v: 52.8 }
    ];
    const host = document.getElementById("pgb-line");
    const W = 900, H = 360, m = { t: 30, r: 40, b: 44, l: 56 };
    const s = svg(host, W, H, tr("Línea: porcentaje de mujeres entre quienes juegan en Brasil, 2019 a 2026", "Line chart: share of women among people who play in Brazil, 2019 to 2026"));
    const x = y => m.l + 30 + (y - 2019) / (2026 - 2019) * (W - m.l - m.r - 50);
    const yS = v => m.t + (60 - v) / (60 - 40) * (H - m.t - m.b);
    [40, 45, 50, 55, 60].forEach(v => {
      el("line", { x1: m.l, x2: W - m.r, y1: yS(v), y2: yS(v), stroke: v === 50 ? "rgba(243,236,255,.35)" : C.grid, "stroke-dasharray": v === 50 ? "6 5" : "" }, s);
      text(s, m.l - 12, yS(v) + 5, v + "%", { "text-anchor": "end", fill: C.muted, "font-size": 13 });
    });
    text(s, W - m.r, yS(50) - 8, tr("paridad 50%", "50% parity"), { "text-anchor": "end", fill: C.ink2, "font-size": 13 });
    for (let yr = 2019; yr <= 2026; yr++) text(s, x(yr), H - 14, yr, { "text-anchor": "middle", fill: C.muted, "font-size": 13 });

    const pts = data.map(d => [x(d.y), yS(d.v)]);
    const seg1 = `M${pts[0]} L${pts[1]}`;
    const seg2 = `M${pts[2]} L${pts[3]} L${pts[4]} L${pts[5]}`;
    const gap = el("path", { d: `M${pts[1]} L${pts[2]}`, stroke: C.women, "stroke-width": 2, fill: "none", "stroke-dasharray": "3 7", class: "pop" }, s);
    [seg1, seg2].forEach(d => {
      const p = el("path", { d, stroke: C.women, "stroke-width": 3, fill: "none", "stroke-linejoin": "round" }, s);
      const L = p.getTotalLength ? 1200 : 0;
      p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
      p.style.transition = "stroke-dashoffset 1.6s ease";
      p.dataset.draw = "1";
    });
    data.forEach((d, i) => {
      const g = el("g", { class: "pop mark-hover" }, s);
      g.style.transitionDelay = (300 + i * 150) + "ms";
      el("rect", { x: pts[i][0] - 6, y: pts[i][1] - 6, width: 12, height: 12, fill: C.women, stroke: C.card, "stroke-width": 2 }, g);
      text(g, pts[i][0], pts[i][1] - 16, fmt(d.v), { "text-anchor": "middle", fill: C.ink, "font-weight": 700, "font-size": 14 });
      const hit = el("rect", { x: pts[i][0] - 30, y: m.t, width: 60, height: H - m.t - m.b, class: "hit" }, s);
      bindTip(hit, `<b>PGB ${d.y}</b><br>${fmt(d.v)} ${tr("mujeres", "women")} · ${fmt(100 - d.v)} ${tr("hombres", "men")}`, g);
    });
    const ann = el("g", { class: "pop" }, s);
    ann.style.transitionDelay = "1.3s";
    text(ann, pts[2][0] + 14, pts[2][1] + 30, tr("2023: la única vez desde 2016", "2023: the only year since 2016"), { fill: C.ink, "font-size": 14, "font-weight": 700 });
    text(ann, pts[2][0] + 14, pts[2][1] + 48, tr("en que fueron minoría", "when women were the minority"), { fill: C.ink2, "font-size": 14 });
    addTable(host, [tr("Edición PGB", "PGB edition"), tr("Mujeres", "Women")], data.map(d => [d.y, fmt(d.v)]));
  })();

  /* ---------- 2. age columns ---------- */
  (function () {
    const data = [
      [tr("Menos de 7", "Under 7"), 45.00], [tr("8 a 12", "8 to 12"), 33.18], [tr("13 a 16", "13 to 16"), 11.81], [tr("17 a 22", "17 to 22"), 6.82], [tr("23 o más", "23+"), 3.18]
    ];
    const host = document.getElementById("age-cols");
    const W = 900, H = 340, m = { t: 34, r: 20, b: 50, l: 50 };
    const s = svg(host, W, H, tr("Columnas: edad de inicio en los videojuegos", "Column chart: age when they started playing"));
    const max = 50;
    const y = v => m.t + (1 - v / max) * (H - m.t - m.b);
    [0, 10, 20, 30, 40, 50].forEach(v => {
      el("line", { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: v === 0 ? "rgba(243,236,255,.3)" : C.grid }, s);
      text(s, m.l - 10, y(v) + 5, v + "%", { "text-anchor": "end", fill: C.muted, "font-size": 13 });
    });
    const band = (W - m.l - m.r) / data.length, bw = band * 0.56;
    data.forEach(([lab, v], i) => {
      const cx = m.l + band * i + band / 2;
      const childhood = i < 2;
      const g = el("g", { class: "mark-hover" }, s);
      const r = el("rect", { x: cx - bw / 2, y: y(v), width: bw, height: y(0) - y(v), fill: childhood ? C.women : C.rest, rx: 3, class: "grow-y" }, g);
      r.style.transitionDelay = (i * 120) + "ms";
      const t = text(g, cx, y(v) - 10, fmt(v), { "text-anchor": "middle", fill: C.ink, "font-weight": 700, class: "pop" });
      t.style.transitionDelay = (600 + i * 120) + "ms";
      text(s, cx, H - 24, lab + tr(" años", " years"), { "text-anchor": "middle", fill: C.ink2, "font-size": 14 });
      const hit = el("rect", { x: cx - band / 2, y: m.t, width: band, height: H - m.t - m.b, class: "hit" }, s);
      bindTip(hit, `<b>${lab}${tr(" años", " years")}</b><br>${fmt(v)} ${tr("de las encuestadas", "of respondents")}`, g);
    });
    const b = el("g", { class: "pop" }, s);
    b.style.transitionDelay = "1.2s";
    const x0 = m.l + 10, x1 = m.l + band * 2 - 10;
    el("path", { d: `M${x0} 14 H${x1}`, stroke: C.women, "stroke-width": 2 }, b);
    text(b, (x0 + x1) / 2, 10, tr("78% empezó en la infancia", "78% started in childhood"), { "text-anchor": "middle", fill: C.ink, "font-weight": 700, "font-size": 14 });
    addTable(host, [tr("Edad de inicio", "Starting age"), tr("Porcentaje", "Share")], data.map(d => [d[0] + tr(" años", " years"), fmt(d[1], 2)]));
  })();

  /* ---------- 2b. stacked 100% ---------- */
  (function () {
    const data = [
      [tr("Figuras masculinas", "Male figures"), 58.07, C.women, tr("Hermano, padre, primo, amigo, tío y otros", "Brother, father, cousin, male friend, uncle and others")],
      [tr("Ellas mismas", "Themselves"), 26.36, "#7b8fd6", tr("Empezaron a jugar por su cuenta", "Started playing on their own")],
      [tr("Figuras femeninas", "Female figures"), 14.54, C.men, tr("Madre, hermana, amiga y otras", "Mother, sister, female friend and others")],
      [tr("Otro", "Other"), 1.03, C.rest, tr("Resto de respuestas", "Remaining answers")]
    ];
    const host = document.getElementById("intro-stack");
    const W = 900, H = 170, bx = 0, by = 60, bh = 54;
    const s = svg(host, W, H, tr("Barra al 100%: quién introdujo a las jugadoras a los videojuegos", "100% bar: who introduced women players to video games"));
    let acc = 0;
    data.forEach(([lab, v, col, desc], i) => {
      const w = v / 100 * W;
      const g = el("g", { class: "mark-hover" }, s);
      const r = el("rect", { x: bx + acc / 100 * W, y: by, width: Math.max(w - 2, 1), height: bh, fill: col, class: "grow-x" }, g);
      r.style.transitionDelay = (i * 250) + "ms";
      if (v > 10) {
        const xL = bx + acc / 100 * W;
        const t1 = text(g, xL, by - 30, lab, { fill: C.ink, "font-weight": 700, "font-size": 15, class: "pop" });
        const t2 = text(g, xL, by - 10, fmt(v), { fill: C.ink2, "font-size": 15, class: "pop" });
        t1.style.transitionDelay = t2.style.transitionDelay = (700 + i * 250) + "ms";
      }
      const hit = el("rect", { x: bx + acc / 100 * W, y: by, width: w, height: bh, class: "hit" }, s);
      bindTip(hit, `<b>${lab}</b><br>${fmt(v, 2)}<br><span style="color:#8e9ac8">${desc}</span>`, g);
      acc += v;
    });
    text(s, 0, by + bh + 34, tr("Las figuras masculinas fueron la puerta de entrada para 4 de cada 7 jugadoras.", "Male figures were the gateway for 4 in 7 women players."), { fill: C.muted, "font-size": 14 });
    addTable(host, [tr("Quién las introdujo", "Who introduced them"), tr("Porcentaje", "Share")], data.map(d => [d[0], fmt(d[1], 2)]));
  })();

  /* ---------- 2c. lollipop reasons ---------- */
  (function () {
    const data = [
      [tr("Desafiar sus habilidades y superar retos", "Testing their skills and beating challenges"), 62.27],
      [tr("Placer estético (arte, música, diseño)", "Aesthetic pleasure (art, music, design)"), 56.81],
      [tr("Resistencia o escapismo", "Resilience or escapism"), 54.54],
      [tr("Vivir narrativas y mundos distintos", "Experiencing stories and other worlds"), 47.27],
      [tr("Socializar con otras personas", "Socializing with others"), 27.72],
      [tr("Tiempo para sí mismas", "Time for themselves"), 20.90],
      [tr("Aprender o educarse", "Learning"), 14.54]
    ];
    const host = document.getElementById("reasons-lolli");
    const W = 900, rowH = 46, m = { t: 10, r: 70, b: 30, l: 330 };
    const H = m.t + data.length * rowH + m.b;
    const s = svg(host, W, H, tr("Lollipop: razones por las que juegan", "Lollipop chart: reasons for playing"));
    const x = v => m.l + v / 70 * (W - m.l - m.r);
    [0, 20, 40, 60].forEach(v => {
      el("line", { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b, stroke: C.grid }, s);
      text(s, x(v), H - 8, v + "%", { "text-anchor": "middle", fill: C.muted, "font-size": 13 });
    });
    data.forEach(([lab, v], i) => {
      const cy = m.t + i * rowH + rowH / 2;
      const g = el("g", { class: "mark-hover" }, s);
      const top = i === 0;
      text(s, m.l - 16, cy + 5, lab, { "text-anchor": "end", fill: top ? C.ink : C.ink2, "font-size": 15, "font-weight": top ? 700 : 400 });
      const ln = el("rect", { x: x(0), y: cy - 1.5, width: x(v) - x(0), height: 3, fill: top ? C.women : "#7b8fd6", class: "grow-x" }, g);
      ln.style.transitionDelay = (i * 100) + "ms";
      const dot = el("rect", { x: x(v) - 7, y: cy - 7, width: 14, height: 14, fill: top ? C.women : "#7b8fd6", stroke: C.card, "stroke-width": 2, class: "pop" }, g);
      dot.style.transitionDelay = (700 + i * 100) + "ms";
      const t = text(g, x(v) + 16, cy + 5, fmt(v), { fill: C.ink, "font-weight": 700, "font-size": 14, class: "pop" });
      t.style.transitionDelay = dot.style.transitionDelay;
      const hit = el("rect", { x: 0, y: cy - rowH / 2, width: W, height: rowH, class: "hit" }, s);
      bindTip(hit, `<b>${lab}</b><br>${fmt(v, 2)} ${tr("la eligió", "chose it")}`, g);
    });
    addTable(host, [tr("Razón para jugar", "Reason for playing"), tr("Porcentaje", "Share")], data.map(d => [d[0], fmt(d[1], 2)]));
  })();

  /* ---------- 3. units 73 ---------- */
  (function () {
    const host = document.getElementById("units-73");
    const cols = 20, cell = 30, gap = 6;
    const W = cols * (cell + gap), H = 5 * (cell + gap);
    const s = svg(host, W, H, tr("Gráfico de unidades: 73 de cada 100 han presenciado acoso o discriminación", "Unit chart: 73 in 100 have witnessed harassment or discrimination"));
    s.setAttribute("shape-rendering", "crispEdges");
    for (let i = 0; i < 100; i++) {
      const c = i % cols, r = Math.floor(i / cols);
      const on = i < 73;
      const g = el("g", { class: "pop", transform: `translate(${c * (cell + gap)},${r * (cell + gap)})` }, s);
      g.style.transitionDelay = (i * 18) + "ms";
      // pixel person: head + body
      const col = on ? C.women : C.rest;
      el("rect", { x: 10, y: 2, width: 10, height: 10, fill: col }, g);
      el("rect", { x: 6, y: 14, width: 18, height: 14, fill: col }, g);
    }
    const hit = el("rect", { x: 0, y: 0, width: W, height: H, class: "hit" }, s);
    bindTip(hit, `<b>Mujeres y Videojuegos 2026</b><br>${tr("73 de cada 100 han presenciado discriminación, acoso o malos tratos hacia mujeres en espacios de videojuegos", "73 in 100 have witnessed discrimination, harassment or abuse against women in gaming spaces")}`);
    addTable(host, [tr("Respuesta", "Answer"), tr("Porcentaje", "Share")], [[tr("Lo ha presenciado", "Has witnessed it"), "73%"], [tr("No lo ha presenciado", "Has not witnessed it"), "27%"]]);
  })();

  /* ---------- 3b. types bars ---------- */
  (function () {
    const data = [
      [tr("Comentarios machistas de otros jugadores", "Sexist comments from other players"), 46.3],
      [tr("Acoso", "Harassment"), 36.3],
      [tr("Maltrato e insultos", "Abuse and insults"), 24.3],
      [tr("No quisieron jugar con ellas por ser mujeres", "Others refused to play with them for being women"), 17.7]
    ];
    const host = document.getElementById("types-bars");
    const W = 900, rowH = 56, m = { t: 6, r: 80, b: 10, l: 340 };
    const H = m.t + data.length * rowH + m.b;
    const s = svg(host, W, H, tr("Barras: experiencias de acoso de videojugadoras en México", "Bar chart: harassment experiences of women gamers in Mexico"));
    const x = v => m.l + v / 50 * (W - m.l - m.r);
    data.forEach(([lab, v], i) => {
      const cy = m.t + i * rowH + rowH / 2;
      const g = el("g", { class: "mark-hover" }, s);
      text(s, m.l - 16, cy + 5, lab, { "text-anchor": "end", fill: i === 0 ? C.ink : C.ink2, "font-size": 15, "font-weight": i === 0 ? 700 : 400 });
      el("rect", { x: x(0), y: cy - 15, width: x(50) - x(0), height: 30, fill: "rgba(243,236,255,.04)" }, s);
      const r = el("rect", { x: x(0), y: cy - 15, width: x(v) - x(0), height: 30, fill: i === 0 ? C.women : "#b04a7c", rx: 3, class: "grow-x" }, g);
      r.style.transitionDelay = (i * 150) + "ms";
      const t = text(g, x(v) + 12, cy + 5, fmt(v), { fill: C.ink, "font-weight": 700, class: "pop" });
      t.style.transitionDelay = (700 + i * 150) + "ms";
      const hit = el("rect", { x: 0, y: cy - rowH / 2, width: W, height: rowH, class: "hit" }, s);
      bindTip(hit, `<b>${lab}</b><br>${fmt(v)} ${tr("de las mujeres encuestadas", "of women surveyed")}`, g);
    });
    addTable(host, [tr("Experiencia", "Experience"), tr("Porcentaje", "Share")], data.map(d => [d[0], fmt(d[1])]));
  })();

  /* ---------- 3c. dot plot ---------- */
  (function () {
    const data = [
      [tr("Latinoamérica · Mujeres en VG 2024", "Latin America · Mujeres en VG 2024"), 78.6, tr("Vivió discriminación, acoso o maltrato por género", "Experienced gender-based discrimination, harassment or abuse"), true],
      [tr("Global · mujeres de 18 a 24 años (2023)", "Global · women aged 18 to 24 (2023)"), 75, tr("Sufrió abuso o acoso al jugar o hacer streaming", "Faced abuse or harassment while playing or streaming"), false],
      [tr("Global · todas las mujeres (2023)", "Global · all women (2023)"), 49, tr("Sufrió abuso o acoso al jugar o hacer streaming", "Faced abuse or harassment while playing or streaming"), false],
      [tr("Estados Unidos · ADL 2023", "United States · ADL 2023"), 48, tr("Fue acosada por su género en juegos multijugador", "Harassed because of their gender in multiplayer games"), false]
    ];
    const host = document.getElementById("harass-dots");
    const W = 900, rowH = 58, m = { t: 10, r: 60, b: 34, l: 330 };
    const H = m.t + data.length * rowH + m.b;
    const s = svg(host, W, H, tr("Gráfico de puntos: porcentaje de mujeres que han vivido acoso según distintos estudios", "Dot plot: share of women who have experienced harassment, by study"));
    const x = v => m.l + v / 100 * (W - m.l - m.r);
    [0, 25, 50, 75, 100].forEach(v => {
      el("line", { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b, stroke: v === 50 ? "rgba(243,236,255,.25)" : C.grid, "stroke-dasharray": v === 50 ? "5 5" : "" }, s);
      text(s, x(v), H - 10, v + "%", { "text-anchor": "middle", fill: C.muted, "font-size": 13 });
    });
    data.forEach(([lab, v, desc, hl], i) => {
      const cy = m.t + i * rowH + rowH / 2;
      el("line", { x1: x(0), x2: x(100), y1: cy, y2: cy, stroke: "rgba(243,236,255,.06)", "stroke-width": 2 }, s);
      text(s, m.l - 16, cy + 5, lab, { "text-anchor": "end", fill: hl ? C.ink : C.ink2, "font-size": 15, "font-weight": hl ? 700 : 400 });
      const g = el("g", { class: "pop mark-hover" }, s);
      g.style.transitionDelay = (i * 180) + "ms";
      el("rect", { x: x(v) - 9, y: cy - 9, width: 18, height: 18, fill: hl ? C.women : "#7b8fd6", stroke: C.card, "stroke-width": 2 }, g);
      text(g, x(v), cy - 16, fmt(v), { "text-anchor": "middle", fill: C.ink, "font-weight": 700, "font-size": 14 });
      const hit = el("rect", { x: 0, y: cy - rowH / 2, width: W, height: rowH, class: "hit" }, s);
      bindTip(hit, `<b>${lab}</b><br>${fmt(v)} · ${desc}`, g);
    });
    addTable(host, [tr("Estudio", "Study"), tr("Porcentaje", "Share"), ], data.map(d => [d[0] + " — " + d[2], fmt(d[1])]));
  })();

  /* ---------- 4. dumbbell ---------- */
  (function () {
    const data = [
      [tr("Sola / solo", "Alone"), 72, 77],
      [tr("Con amistades", "With friends"), 26, 43],
      [tr("Con su pareja", "With their partner"), 35, 4],
      [tr("Con sus hijos e hijas", "With their children"), 21, 11]
    ];
    const host = document.getElementById("who-dumbbell");
    const W = 900, rowH = 62, m = { t: 14, r: 50, b: 34, l: 230 };
    const H = m.t + data.length * rowH + m.b;
    const s = svg(host, W, H, tr("Gráfico de pesas: con quién juegan mujeres y hombres en México", "Dumbbell chart: who women and men play with in Mexico"));
    const x = v => m.l + v / 100 * (W - m.l - m.r);
    [0, 25, 50, 75, 100].forEach(v => {
      el("line", { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b, stroke: C.grid }, s);
      text(s, x(v), H - 10, v + "%", { "text-anchor": "middle", fill: C.muted, "font-size": 13 });
    });
    data.forEach(([lab, w, mn], i) => {
      const cy = m.t + i * rowH + rowH / 2;
      text(s, m.l - 16, cy + 5, lab, { "text-anchor": "end", fill: C.ink2, "font-size": 15 });
      const g = el("g", { class: "pop mark-hover" }, s);
      g.style.transitionDelay = (i * 180) + "ms";
      el("line", { x1: x(Math.min(w, mn)), x2: x(Math.max(w, mn)), y1: cy, y2: cy, stroke: "rgba(243,236,255,.3)", "stroke-width": 3 }, g);
      el("rect", { x: x(mn) - 8, y: cy - 8, width: 16, height: 16, fill: C.men, stroke: C.card, "stroke-width": 2 }, g);
      el("rect", { x: x(w) - 8, y: cy - 8, width: 16, height: 16, fill: C.women, stroke: C.card, "stroke-width": 2 }, g);
      const close = Math.abs(w - mn) < 8;
      const wRight = w >= mn;
      text(g, x(w) + (close ? (wRight ? 6 : -6) : 0), cy - 15, w + "%", { "text-anchor": close ? (wRight ? "start" : "end") : "middle", fill: C.ink, "font-weight": 700, "font-size": 14 });
      text(g, x(mn) + (close ? (wRight ? -6 : 6) : 0), cy - 15, mn + "%", { "text-anchor": close ? (wRight ? "end" : "start") : "middle", fill: C.ink2, "font-size": 14 });
      const hit = el("rect", { x: 0, y: cy - rowH / 2, width: W, height: rowH, class: "hit" }, s);
      bindTip(hit, `<b>${lab}</b><br>${tr("Mujeres", "Women")}: ${w}%<br>${tr("Hombres", "Men")}: ${mn}%`, g);
    });
    addTable(host, [tr("Con quién juegan", "Who they play with"), tr("Mujeres", "Women"), tr("Hombres", "Men")], data.map(d => [d[0], d[1] + "%", d[2] + "%"]));
  })();

  /* ---------- 5. ladder ---------- */
  (function () {
    const data = [
      [tr("Personas que juegan videojuegos", "People who play video games"), 48, tr("ESA 2025 · 21 países", "ESA 2025 · 21 countries")],
      [tr("Personas que trabajan en la industria", "People working in the industry"), 23, tr("Encuesta 2024 · UNESCO", "2024 survey · UNESCO")],
      [tr("Fuerza laboral de los esports", "Esports workforce"), 5, "Women in Games · UNESCO"],
      [tr("Jugadoras profesionales de esports", "Professional esports players"), 1, "Women in Games · UNESCO"]
    ];
    const host = document.getElementById("ladder-bars");
    const W = 900, rowH = 64, m = { t: 6, r: 80, b: 10, l: 330 };
    const H = m.t + data.length * rowH + m.b;
    const s = svg(host, W, H, tr("Barras: presencia de mujeres en cada nivel del ecosistema de videojuegos", "Bar chart: share of women at each level of the gaming ecosystem"));
    const x = v => m.l + v / 50 * (W - m.l - m.r);
    data.forEach(([lab, v, src], i) => {
      const cy = m.t + i * rowH + rowH / 2;
      text(s, m.l - 16, cy + 1, lab, { "text-anchor": "end", fill: C.ink, "font-size": 15, "font-weight": 700 });
      text(s, m.l - 16, cy + 20, src, { "text-anchor": "end", fill: C.muted, "font-size": 12 });
      const g = el("g", { class: "mark-hover" }, s);
      const r = el("rect", { x: x(0), y: cy - 16, width: Math.max(x(v) - x(0), 4), height: 32, fill: C.women, rx: 3, class: "grow-x" }, g);
      r.style.opacity = 1 - i * 0.18;
      r.style.transitionDelay = (i * 200) + "ms";
      const t = text(g, Math.max(x(v), x(0) + 4) + 12, cy + 6, (v === 1 ? "< 1%" : v + "%"), { fill: C.ink, "font-weight": 700, "font-size": 16, class: "pop" });
      t.style.transitionDelay = (800 + i * 200) + "ms";
      const hit = el("rect", { x: 0, y: cy - rowH / 2, width: W, height: rowH, class: "hit" }, s);
      bindTip(hit, `<b>${lab}</b><br>${v === 1 ? tr("Menos del 1%", "Less than 1%") : v + "%"} ${tr("mujeres", "women")}<br><span style="color:#8e9ac8">${src}</span>`, g);
    });
    addTable(host, [tr("Nivel", "Level"), tr("Mujeres", "Women"), tr("Fuente", "Source")], data.map(d => [d[0], d[1] === 1 ? "< 1%" : d[1] + "%", d[2]]));
  })();

  /* ---------- pixel scenery ---------- */
  function pixelTree(parent, x, baseY, h, col, dark) {
    const p = 6;
    const g = el("g", {}, parent);
    const levels = Math.floor(h / (p * 3));
    for (let i = 0; i < levels; i++) {
      const w = (levels - i) * 2 + 1;
      el("rect", { x: x - (w * p) / 2, y: baseY - (i + 1) * p * 3 - p * 2, width: w * p, height: p * 3, fill: i % 2 ? col : dark }, g);
    }
    el("rect", { x: x - p, y: baseY - p * 2, width: p * 2, height: p * 2, fill: "#3b2a24" }, g);
    return g;
  }
  (function hero() {
    const host = document.getElementById("heroScene");
    const W = 1600, H = 900;
    const s = el("svg", { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "xMidYMax slice", "shape-rendering": "crispEdges" });
    host.appendChild(s);
    // stars
    for (let i = 0; i < 90; i++) {
      const st = el("rect", { x: Math.random() * W, y: Math.random() * H * 0.55, width: 3, height: 3, fill: i % 7 ? "#cbc2e6" : "#f4a7c8", opacity: 0.3 + Math.random() * 0.6 }, s);
    }
    // moon
    const mx = 1240, my = 170, p = 8;
    const moon = [[2,0,4],[1,1,6],[0,2,8],[0,3,8],[0,4,8],[0,5,8],[1,6,6],[2,7,4]];
    moon.forEach(([ox, oy, w]) => el("rect", { x: mx + ox * p, y: my + oy * p, width: w * p, height: p, fill: "#fbe7c0" }, s));
    el("rect", { x: mx + 2 * p, y: my + 2 * p, width: p * 2, height: p * 2, fill: "#f1d39b" }, s);
    el("rect", { x: mx + 5 * p, y: my + 4 * p, width: p, height: p, fill: "#f1d39b" }, s);
    // hills
    el("rect", { x: 0, y: H - 150, width: W, height: 150, fill: "#1a2a22" }, s);
    // far trees
    for (let i = 0; i < 22; i++) pixelTree(s, 40 + i * 75 + (i % 3) * 10, H - 140, 160 + (i % 4) * 40, "#203a2c", "#1a3024");
    // cottage
    const cx = 260, cy = H - 150;
    el("rect", { x: cx, y: cy - 120, width: 150, height: 120, fill: "#5a3d36" }, s);
    for (let i = 0; i < 8; i++) el("rect", { x: cx - 20 + i * 12, y: cy - 120 - i * 12, width: 190 - i * 24, height: 12, fill: i % 2 ? "#7a4a6b" : "#6a3f5e" }, s);
    el("rect", { x: cx + 25, y: cy - 90, width: 36, height: 30, fill: "#f6c066" }, s);
    el("rect", { x: cx + 41, y: cy - 90, width: 4, height: 30, fill: "#5a3d36" }, s);
    el("rect", { x: cx + 95, y: cy - 70, width: 32, height: 70, fill: "#3b2a24" }, s);
    el("rect", { x: cx + 15, y: cy - 100, width: 56, height: 50, fill: "rgba(246,192,102,.12)" }, s);
    // near trees with blossoms
    [[90, 330], [560, 260], [1120, 300], [1480, 360], [1330, 220]].forEach(([tx, th], i) => {
      pixelTree(s, tx, H - 40, th, "#2d5a3d", "#244a33");
      for (let k = 0; k < 6; k++) el("rect", { x: tx - 40 + ((k * 37) % 80), y: H - 80 - th * 0.3 - ((k * 53) % (th * 0.5)), width: 6, height: 6, fill: "#f4a7c8" }, s);
    });
    el("rect", { x: 0, y: H - 50, width: W, height: 50, fill: "#14211a" }, s);
    // mushrooms
    [[700, 0], [760, 1], [980, 0]].forEach(([mx2]) => {
      el("rect", { x: mx2, y: H - 70, width: 24, height: 10, fill: "#dc5a96" }, s);
      el("rect", { x: mx2 + 6, y: H - 70, width: 4, height: 4, fill: "#fbe7c0" }, s);
      el("rect", { x: mx2 + 8, y: H - 60, width: 8, height: 10, fill: "#e9dcc6" }, s);
    });
    // fireflies
    const heroEl = document.querySelector(".hero");
    for (let i = 0; i < 16; i++) {
      const f = document.createElement("span");
      f.className = "firefly";
      f.style.left = (5 + Math.random() * 90) + "%";
      f.style.top = (45 + Math.random() * 45) + "%";
      f.style.animationDelay = `${-Math.random() * 9}s, ${-Math.random() * 3}s`;
      heroEl.appendChild(f);
    }
  })();
  (function footerTrees() {
    const s = document.getElementById("footerTrees");
    s.setAttribute("viewBox", "0 0 1200 64");
    s.setAttribute("preserveAspectRatio", "xMidYMax meet");
    s.setAttribute("shape-rendering", "crispEdges");
    for (let i = 0; i < 9; i++) pixelTree(s, 600 + (i - 4) * 46, 64, 50 + (i % 3) * 8, "#2d5a3d", "#244a33");
  })();

  /* ---------- glowing butterflies & sparkles ---------- */
  (function () {
    const wingSVG = `<svg viewBox="0 0 34 30" shape-rendering="crispEdges"><g class="wing">
      <rect x="4" y="4" width="10" height="10" fill="#9fe9ff"/><rect x="2" y="6" width="4" height="6" fill="#7fe0ff"/>
      <rect x="20" y="4" width="10" height="10" fill="#9fe9ff"/><rect x="28" y="6" width="4" height="6" fill="#7fe0ff"/>
      <rect x="6" y="16" width="8" height="8" fill="#c8f4ff"/><rect x="20" y="16" width="8" height="8" fill="#c8f4ff"/>
      <rect x="8" y="6" width="4" height="4" fill="#e8fbff"/><rect x="22" y="6" width="4" height="4" fill="#e8fbff"/></g>
      <rect x="15" y="6" width="4" height="18" fill="#e8fbff"/></svg>`;
    const addButterfly = (parent, l, t, scale, delay, dur) => {
      const b = document.createElement("div");
      b.className = "butterfly";
      b.innerHTML = wingSVG;
      b.style.left = l + "%"; b.style.top = t + "%";
      b.style.width = (34 * scale) + "px"; b.style.height = (30 * scale) + "px";
      b.style.animationDelay = `${delay}s`;
      b.style.animationDuration = dur + "s";
      b.querySelector(".wing").style.animationDuration = (0.35 + Math.random() * 0.3) + "s";
      b.setAttribute("aria-hidden", "true");
      parent.appendChild(b);
    };
    // margins on both sides so butterflies never cover the charts
    const spots = [[3, 10], [7, 30], [2, 52], [6, 76], [90, 14], [94, 38], [89, 60], [93, 84]];
    document.querySelectorAll(".chapter").forEach((sec, i) => {
      spots.forEach(([l, t], k) => {
        const jitterT = t + (Math.random() * 8 - 4);
        addButterfly(sec, l, jitterT, 0.7 + Math.random() * 0.8, -(i * 3 + k * 2), 11 + Math.random() * 8);
      });
      for (let k = 0; k < 4; k++) {
        const sp = document.createElement("span");
        sp.className = "sparkle";
        sp.style.left = (3 + Math.random() * 94) + "%";
        sp.style.top = (5 + Math.random() * 90) + "%";
        sp.style.animationDelay = `${-Math.random() * 3}s`;
        sp.setAttribute("aria-hidden", "true");
        sec.appendChild(sp);
      }
    });
    const hero = document.querySelector(".hero");
    [[12, 30], [24, 58], [80, 26], [70, 62], [88, 48], [40, 72], [58, 18]].forEach(([l, t], k) =>
      addButterfly(hero, l, t, 0.8 + Math.random() * 0.9, -k * 2, 12 + Math.random() * 6));
  })();

  /* ---------- scroll behaviour ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      if (e.target.matches("figure.chart")) {
        e.target.querySelectorAll("svg").forEach(s => s.classList.add("drawn"));
        e.target.querySelectorAll("[data-draw]").forEach(p => { p.style.strokeDashoffset = 0; });
      }
      if (e.target.classList.contains("big-number")) countUp(document.getElementById("count73"), 73);
      io.unobserve(e.target);
    });
  }, { threshold: 0.25 });
  document.querySelectorAll(".reveal").forEach(n => io.observe(n));

  function countUp(node, to) {
    const t0 = performance.now(), dur = 1400;
    const step = t => {
      const k = Math.min((t - t0) / dur, 1);
      node.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + "%";
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const bar = document.getElementById("progress");
  const links = [...document.querySelectorAll(".chapter-nav a")];
  const sections = links.map(a => document.querySelector(a.getAttribute("href")));
  window.addEventListener("scroll", () => {
    const h = document.documentElement;
    bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + "%";
    let idx = -1;
    sections.forEach((sec, i) => { if (sec.getBoundingClientRect().top < window.innerHeight * 0.5) idx = i; });
    links.forEach((a, i) => a.classList.toggle("active", i === idx));
  }, { passive: true });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".reveal").forEach(n => n.classList.add("in"));
    document.querySelectorAll("svg").forEach(s => s.classList.add("drawn"));
    document.querySelectorAll("[data-draw]").forEach(p => { p.style.strokeDashoffset = 0; });
    document.getElementById("count73").textContent = "73%";
  }
})();
