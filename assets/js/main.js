/* ========================================================================
   FÉNIX — lógica partilhada (dados de demonstração, sem backend real)
   ======================================================================== */

/* ---------- dados de demonstração de um doente ---------- */
const BADGES = {
  "marco-clinico":  { nome: "Marco Ultrapassado",   icon: "🏅", desc: "Por completar um marco clínico importante." },
  "cicatrizacao":   { nome: "Pele em Renovação",    icon: "🩹", desc: "Por progressos na cicatrização." },
  "funcional":      { nome: "Movimento Conquistado", icon: "💪", desc: "Por recuperar mobilidade ou função." },
  "psicossocial":   { nome: "Passo em Frente",      icon: "🌟", desc: "Por retomar rotinas e vida social." },
  "prom":           { nome: "Voz Ouvida",           icon: "📋", desc: "Por completar uma avaliação PROM." },
  "pessoal":        { nome: "Meta Pessoal",         icon: "🔥", desc: "Por alcançar algo que definiu como importante para si." }
};

const DEMO_PATIENT = {
  nome: "Doente Demonstração",
  processo: "PROC-2026-0142",
  tbsa: 25,
  profundidade: "2º e 3º grau",
  zona: "Membro superior esquerdo, tronco anterior",
  dataAlta: "2026-07-15",
  equipa: ["Dr. Cirurgia Plástica", "Enfermagem", "Fisioterapia", "Terapia Ocupacional", "Psicologia", "Nutrição"],
  milestones: [
    { id: 1, label: "Alta hospitalar", data: "15 Jul 2026", estado: "done", tipo: "Marco clínico", categoria: "marco-clinico", origem: "clinica", importante: false, foto: null },
    { id: 2, label: "PROM — 2 semanas", data: "29 Jul 2026", estado: "done", tipo: "Checkpoint PROM", categoria: "prom", origem: "clinica", importante: false, foto: null },
    { id: 3, label: "Encerramento da ferida", data: "05 Ago 2026", estado: "done", tipo: "Cicatrização", categoria: "cicatrizacao", origem: "clinica", importante: true, foto: null },
    { id: 4, label: "PROM — 3 meses", data: "15 Out 2026", estado: "active", tipo: "Checkpoint PROM", categoria: "prom", origem: "clinica", importante: false, foto: null },
    { id: 5, label: "Amplitude de movimento total", data: "prev. Nov 2026", estado: "pending", tipo: "Funcional", categoria: "funcional", origem: "clinica", importante: true, foto: null },
    { id: 6, label: "Voltar a pentear o cabelo sozinha", data: "meta pessoal", estado: "pending", tipo: "Funcional", categoria: "funcional", origem: "doente", importante: true, foto: null },
    { id: 7, label: "Retorno ao trabalho", data: "prev. Dez 2026", estado: "pending", tipo: "Psicossocial", categoria: "psicossocial", origem: "doente", importante: true, foto: null },
    { id: 8, label: "PROM — 6 meses", data: "15 Jan 2027", estado: "pending", tipo: "Checkpoint PROM", categoria: "prom", origem: "clinica", importante: false, foto: null },
    { id: 9, label: "PROM — 12 meses", data: "15 Jul 2027", estado: "pending", tipo: "Checkpoint PROM", categoria: "prom", origem: "clinica", importante: false, foto: null }
  ],
  scores: {
    labels: ["Alta", "2 sem", "6 sem", "3 meses"],
    dor: [7, 5, 3, 2],
    prurido: [6, 6, 4, 3],
    bshsTotal: [null, 58, 68, 74],
    phq9: [null, 11, 7, 5]
  },
  plano: {
    exercicios: [
      {
        id: 0, nome: "Troca de penso e observação da ferida", categoria: "Enfermagem",
        descricao: "Trocar o penso conforme técnica ensinada, observando sinais de infeção (vermelhidão, calor, exsudado, cheiro).",
        prescricao: "1x por dia, de manhã",
        registos: [
          { data: "06 Ago 2026", esforco: 3, nota: "Sem sinais de infeção." }
        ]
      },
      {
        id: 1, nome: "Alongamento do ombro esquerdo", categoria: "Fisioterapia",
        descricao: "Elevação lenta do braço até ao limite tolerável, mantendo 15 segundos.",
        prescricao: "3 séries de 10 repetições · 2x por dia",
        registos: [
          { data: "05 Ago 2026", esforco: 6, nota: "Consegui sem dor forte." },
          { data: "07 Ago 2026", esforco: 5, nota: "" }
        ]
      },
      {
        id: 2, nome: "Exercícios de preensão da mão", categoria: "Terapia Ocupacional",
        descricao: "Apertar e largar uma bola de borracha macia, com controlo do movimento.",
        prescricao: "10 repetições · 3x por dia",
        registos: [
          { data: "06 Ago 2026", esforco: 4, nota: "" }
        ]
      },
      {
        id: 3, nome: "Marcha assistida", categoria: "Fisioterapia",
        descricao: "Caminhada em piso plano, com apoio se necessário.",
        prescricao: "15 minutos · 1x por dia",
        registos: []
      }
    ],
    dieta: {
      prescritoPor: "Nutrição",
      atualizado: "01 Ago 2026",
      orientacoes: "Dieta hiperproteica e hipercalórica para apoiar a cicatrização. Reforçar hidratação ao longo do dia.",
      itens: [
        "Incluir uma fonte de proteína em todas as refeições (carne, peixe, ovos, leguminosas).",
        "Reforçar ingestão de vitamina C e zinco (citrinos, frutos vermelhos, sementes).",
        "Beber pelo menos 1,5 a 2 litros de água por dia, salvo indicação em contrário.",
        "Evitar álcool e tabaco, que atrasam a cicatrização."
      ]
    }
  }
};

/* ========================================================================
   O RIO — desenha a jornada do doente como um percurso serpenteante
   ======================================================================== */
function desenharRio(containerId, milestones, opts = {}) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const w = opts.width || 1040;
  const h = opts.height || 180;
  const n = milestones.length;
  const marginX = 60;
  const usableW = w - marginX * 2;

  // pontos ao longo de uma curva suave (serpenteante)
  const pts = milestones.map((m, i) => {
    const x = marginX + (usableW * i) / (n - 1);
    const y = h / 2 + Math.sin(i * 1.15) * 34;
    return Object.assign({}, m, { x, y });
  });

  // caminho suave via curva de Catmull-Rom -> Bezier aproximada
  function pathFrom(points) {
    if (points.length < 2) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }

  const lastDoneIdx = (() => {
    let idx = -1;
    milestones.forEach((m, i) => { if (m.estado === "done") idx = i; });
    // inclui o nó ativo até meio caminho para o próximo
    const activeIdx = milestones.findIndex(m => m.estado === "active");
    return { idx, activeIdx };
  })();

  const fullPath = pathFrom(pts);
  const progressPoints = pts.slice(0, Math.max(lastDoneIdx.idx + 1, 1) + (lastDoneIdx.activeIdx > -1 ? 1 : 0));
  const progressPath = pathFrom(progressPoints.length > 1 ? progressPoints : pts.slice(0, 2));

  const nodes = pts.map((p, i) => {
    const labelY = (i % 2 === 0) ? p.y - 22 : p.y + 34;
    const dateY = (i % 2 === 0) ? p.y - 9 : p.y + 47;
    const pulse = p.estado === "active"
      ? `<circle class="pulse"><animate attributeName="r" values="9;16;9" dur="2.2s" repeatCount="indefinite" /><animate attributeName="opacity" values=".5;0;.5" dur="2.2s" repeatCount="indefinite" /></circle>`
      : "";
    return `
      <g class="rio-node ${p.estado}" data-tip="${p.label} — ${p.tipo} · ${p.data}" transform="translate(${p.x},${p.y})">
        ${pulse}
        <circle r="9"></circle>
        <text class="label" text-anchor="middle" y="${labelY - p.y}">${quebraLinha(p.label)}</text>
        <text class="date mono" text-anchor="middle" y="${dateY - p.y}">${p.data}</text>
      </g>`;
  }).join("");

  el.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Mapa da jornada de recuperação do doente">
      <path class="rio-path-bg" d="${fullPath}" />
      <path class="rio-path-fg" id="${containerId}-fg" d="${progressPath}" />
      ${nodes}
    </svg>
    <div class="rio-tip" id="${containerId}-tip"></div>
  `;

  // anima o traço de progresso
  const fg = document.getElementById(`${containerId}-fg`);
  if (fg) {
    const len = fg.getTotalLength();
    fg.style.setProperty("--dash", len);
    fg.style.setProperty("--offset", len);
    requestAnimationFrame(() => { fg.style.setProperty("--offset", 0); });
  }

  // tooltip
  const tip = document.getElementById(`${containerId}-tip`);
  el.querySelectorAll(".rio-node").forEach(node => {
    node.addEventListener("mouseenter", (e) => {
      const [label, rest] = node.dataset.tip.split(" — ");
      tip.innerHTML = `<strong>${label}</strong><span>${rest}</span>`;
      tip.style.display = "block";
    });
    node.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      tip.style.left = (e.clientX - rect.left + 14) + "px";
      tip.style.top = (e.clientY - rect.top - 10) + "px";
    });
    node.addEventListener("mouseleave", () => { tip.style.display = "none"; });
  });
}

function quebraLinha(texto) {
  // quebra rótulos longos em duas linhas de tspans
  if (texto.length <= 16) return texto;
  const palavras = texto.split(" ");
  const meio = Math.ceil(palavras.length / 2);
  const l1 = palavras.slice(0, meio).join(" ");
  const l2 = palavras.slice(meio).join(" ");
  return `<tspan x="0" dy="0">${l1}</tspan><tspan x="0" dy="11">${l2}</tspan>`;
}

/* ========================================================================
   Gráficos de evolução dos PROMs (via Chart.js)
   ======================================================================== */
function corTeal() { return "#0056A4"; }   /* azul ULS — reaproveitado como cor primária dos gráficos */
function corSkin() { return "#E2662E"; }   /* chama fénix */
function corAlert() { return "#C6402E"; }

function desenharGraficoLinha(canvasId, labels, dataset, opts = {}) {
  const ctx = document.getElementById(canvasId);
  if (!ctx || typeof Chart === "undefined") return;
  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: opts.label || "",
        data: dataset,
        borderColor: opts.color || corTeal(),
        backgroundColor: (opts.color || corTeal()) + "22",
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: opts.color || corTeal(),
        spanGaps: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: (opts.min !== undefined ? opts.min : 0), max: (opts.max !== undefined ? opts.max : 10), grid: { color: "#E3E8E4" }, ticks: { font: { family: "IBM Plex Mono", size: 10 } } },
        x: { grid: { display: false }, ticks: { font: { family: "IBM Plex Mono", size: 10 } } }
      }
    }
  });
}

/* ========================================================================
   RESUMO DE PROGRESSO DA JORNADA — substitui o mapa "rio" quando há
   muitas metas (o rio deixa de ser legível ao crescer); usado no
   dashboard do doente e na ficha do profissional
   ======================================================================== */
function renderJornadaResumo(containerId, opts) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const linkHref = (opts && opts.linkHref) || "jornada.html";
  const ms = DEMO_PATIENT.milestones;
  const total = ms.length;
  const concluidas = ms.filter(m => m.estado === "done").length;
  const pct = total ? Math.round((concluidas / total) * 100) : 0;

  const proximas = ms.filter(m => m.estado !== "done").slice(0, 3);

  const linhasProximas = proximas.map(m => {
    const pill = m.estado === "active"
      ? `<span class="pill pill-pending">Em curso</span>`
      : `<span class="pill" style="background:var(--paper-tint); color:var(--ink-soft);">Por iniciar</span>`;
    const estrela = m.importante ? " ★" : "";
    return `
      <div class="mini-meta">
        <div>
          <strong>${m.label}${estrela}</strong>
          <span class="hint" style="display:block;">${m.tipo} · ${m.data}</span>
        </div>
        ${pill}
      </div>`;
  }).join("") || `<p class="hint" style="margin:0;">Todas as metas atuais foram concluídas.</p>`;

  el.innerHTML = `
    <div class="progress-row">
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;"></div></div>
      <span class="mono" style="font-size:.8rem; color:var(--ink-soft); white-space:nowrap;">${concluidas}/${total} metas concluídas</span>
    </div>
    <div class="proximas-metas">${linhasProximas}</div>
    <a class="btn btn-flame btn-sm" href="${linkHref}" style="margin-top:14px;">🎯 Ver todas as metas e conquistas</a>
  `;
}

const DUVIDAS_DEMO = [
  {
    id: 1, doente: "Maria Santos", categoria: "Ferida",
    pergunta: "A cicatriz está mais vermelha esta semana, é normal?",
    data: "08 Ago 2026", estado: "pendente",
    resposta: null, respondidoPor: null, dataResposta: null
  },
  {
    id: 2, doente: "Maria Santos", categoria: "Medicação",
    pergunta: "Posso tomar o analgésico em jejum?",
    data: "03 Ago 2026", estado: "respondida",
    resposta: "Sim, mas se sentir desconforto gástrico pode tomá-lo com um pequeno lanche. Se a dor não melhorar, avise-nos.",
    respondidoPor: "Enfermagem", dataResposta: "04 Ago 2026"
  },
  {
    id: 3, doente: "Maria Santos", categoria: "Emocional",
    pergunta: "Tenho-me sentido em baixo por causa da cicatriz. É normal sentir-me assim?",
    data: "30 Jul 2026", estado: "respondida",
    resposta: "É uma reação muito comum e compreensível. Vamos falar sobre isso na próxima consulta de Psicologia — se precisar antes disso, pode contactar-nos.",
    respondidoPor: "Psicologia", dataResposta: "31 Jul 2026"
  },
  {
    id: 4, doente: "João Costa", categoria: "Dor",
    pergunta: "A dor aumenta muito à noite, o que posso fazer?",
    data: "09 Ago 2026", estado: "pendente",
    resposta: null, respondidoPor: null, dataResposta: null
  }
];

/* ---------- área do doente ---------- */
function duvidaCardHTML(d, mostrarDoente) {
  const estadoPill = d.estado === "respondida"
    ? `<span class="pill pill-ok">Respondida</span>`
    : `<span class="pill pill-alert">Por responder</span>`;
  const quem = mostrarDoente ? `<strong>${d.doente}</strong> · ` : "";
  const resposta = d.estado === "respondida"
    ? `<div class="duvida-resposta">
        <p class="hint" style="margin-bottom:4px; font-weight:600; color:var(--blue-deep);">Resposta de ${d.respondidoPor} · ${d.dataResposta}</p>
        <p style="margin:0;">${d.resposta}</p>
      </div>`
    : "";
  return `
    <div class="card milestone-card" style="margin-bottom:14px;">
      <div class="milestone-head">
        <div>
          <div class="milestone-meta"><span class="milestone-tag">${d.categoria}</span></div>
          <p style="margin:0; color:var(--ink);">${quem}${d.pergunta}</p>
          <p class="hint" style="margin:4px 0 0;">${d.data}</p>
        </div>
        ${estadoPill}
      </div>
      ${resposta}
    </div>`;
}

function renderDuvidasDoente(containerId, nomeDoente) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const lista = DUVIDAS_DEMO.filter(d => d.doente === nomeDoente).sort((a, b) => b.id - a.id);
  el.innerHTML = lista.length
    ? lista.map(d => duvidaCardHTML(d, false)).join("")
    : `<p class="hint">Ainda não enviou nenhuma dúvida.</p>`;
}

function submeterDuvida(categoria, texto, nomeDoente) {
  if (!texto || !texto.trim()) return;
  const novoId = Math.max(0, ...DUVIDAS_DEMO.map(d => d.id)) + 1;
  const hoje = new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
  DUVIDAS_DEMO.unshift({
    id: novoId, doente: nomeDoente, categoria, pergunta: texto.trim(),
    data: hoje, estado: "pendente", resposta: null, respondidoPor: null, dataResposta: null
  });
  renderDuvidasDoente("lista-duvidas", nomeDoente);
}

/* ---------- área profissional ---------- */
function duvidaEditorHTML(d) {
  const estadoPill = d.estado === "respondida"
    ? `<span class="pill pill-ok">Respondida</span>`
    : `<span class="pill pill-alert">Por responder</span>`;

  const corpoResposta = d.estado === "respondida"
    ? `<div class="duvida-resposta">
        <p class="hint" style="margin-bottom:4px; font-weight:600; color:var(--blue-deep);">Respondido por ${d.respondidoPor} · ${d.dataResposta}</p>
        <p style="margin:0;">${d.resposta}</p>
      </div>`
    : `
      <div style="margin-top:14px;">
        <select id="resp-por-${d.id}" style="margin-bottom:10px;">
          <option value="Enfermagem">Enfermagem</option>
          <option value="Cirurgia Plástica">Cirurgia Plástica</option>
          <option value="Fisioterapia">Fisioterapia</option>
          <option value="Terapia Ocupacional">Terapia Ocupacional</option>
          <option value="Psicologia">Psicologia</option>
          <option value="Nutrição">Nutrição</option>
        </select>
        <textarea id="resp-texto-${d.id}" rows="3" placeholder="Escreva a resposta para o doente..."></textarea>
        <button type="button" class="btn btn-flame btn-sm" style="margin-top:10px;" onclick="responderDuvida(${d.id})">Enviar resposta</button>
      </div>`;

  return `
    <div class="card milestone-card ${d.estado === "pendente" ? "is-active" : ""}" style="margin-bottom:14px;" id="duvida-${d.id}">
      <div class="milestone-head">
        <div>
          <div class="milestone-meta"><span class="milestone-tag">${d.categoria}</span></div>
          <h3 class="milestone-title" style="font-size:1rem;">${d.doente}</h3>
          <p style="margin:2px 0 0; color:var(--ink);">${d.pergunta}</p>
          <p class="hint" style="margin:4px 0 0;">${d.data}</p>
        </div>
        ${estadoPill}
      </div>
      ${corpoResposta}
    </div>`;
}

function renderDuvidasProfissional(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const lista = [...DUVIDAS_DEMO].sort((a, b) => {
    if (a.estado !== b.estado) return a.estado === "pendente" ? -1 : 1;
    return b.id - a.id;
  });
  el.innerHTML = lista.map(duvidaEditorHTML).join("");
}

function responderDuvida(id) {
  const d = DUVIDAS_DEMO.find(x => x.id === id);
  if (!d) return;
  const texto = document.getElementById(`resp-texto-${id}`).value;
  if (!texto || !texto.trim()) { alert("Escreva uma resposta antes de enviar."); return; }
  const respondidoPor = document.getElementById(`resp-por-${id}`).value;
  const hoje = new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
  d.estado = "respondida";
  d.resposta = texto.trim();
  d.respondidoPor = respondidoPor;
  d.dataResposta = hoje;
  renderDuvidasProfissional("lista-duvidas-prof");
}

/* ---------- toggle simples de menu mobile / tabs, se necessário ---------- */
function ativarTabs(grupoSelector) {
  document.querySelectorAll(grupoSelector).forEach(grupo => {
    grupo.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-tab]");
      if (!btn) return;
      const alvo = btn.dataset.tab;
      grupo.querySelectorAll("[data-tab]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(`[data-tab-panel]`).forEach(p => {
        p.style.display = (p.dataset.tabPanel === alvo) ? "block" : "none";
      });
    });
  });
}

/* ========================================================================
   JORNADA DE RECUPERAÇÃO — metas, badges e fotos (área do doente)
   ======================================================================== */
let fotosTemp = {};

function milestoneCardHTML(m) {
  const b = BADGES[m.categoria] || { icon: "🎯", nome: m.tipo };
  const doneClass = m.estado === "done" ? "is-done" : (m.estado === "active" ? "is-active" : "");
  const estadoPill = m.estado === "done"
    ? `<span class="pill pill-ok">Concluída</span>`
    : (m.estado === "active"
        ? `<span class="pill pill-pending">Em curso</span>`
        : `<span class="pill" style="background:var(--paper-tint); color:var(--ink-soft);">Por iniciar</span>`);
  const origemTag = m.origem === "doente"
    ? `<span class="milestone-tag origem-doente">Meta pessoal</span>`
    : `<span class="milestone-tag">Definida pela equipa</span>`;
  const importanteTag = m.importante ? `<span class="milestone-tag origem-doente">★ Importante para mim</span>` : "";

  let actionHTML;
  if (m.estado === "done") {
    actionHTML = `<div class="milestone-badge-earned"><span class="ic">${b.icon}</span> Conquistou o badge "${b.nome}"</div>`;
    if (m.foto) actionHTML += `<div class="milestone-photo"><img src="${m.foto}" alt="Foto da conquista de ${m.label}"></div>`;
  } else {
    actionHTML = `
      <label class="photo-upload" for="foto-${m.id}">
        <input type="file" accept="image/*" id="foto-${m.id}" onchange="prepararFoto(${m.id}, this)">
        <div class="lbl">📷 Adicionar uma foto (opcional)</div>
      </label>
      <div id="foto-preview-${m.id}"></div>
      <button type="button" class="btn btn-flame btn-sm" style="margin-top:12px;" onclick="marcarConquistada(${m.id})">Marcar como atingida</button>
    `;
  }

  return `
    <div class="milestone-card ${doneClass}" id="milestone-${m.id}">
      <div class="milestone-head">
        <div>
          <div class="milestone-meta">${origemTag}${importanteTag}</div>
          <h3 class="milestone-title">${m.label}</h3>
          <p class="hint" style="margin:0;">${m.tipo} · ${m.data}</p>
        </div>
        ${estadoPill}
      </div>
      ${actionHTML}
    </div>`;
}

function renderMilestonesDoente(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = DEMO_PATIENT.milestones.map(milestoneCardHTML).join("");
}

function renderBadgeShelf(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const earned = new Set(DEMO_PATIENT.milestones.filter(m => m.estado === "done").map(m => m.categoria));
  el.innerHTML = Object.keys(BADGES).map(cat => {
    const b = BADGES[cat];
    const isEarned = earned.has(cat);
    return `
      <div class="badge-item ${isEarned ? "" : "locked"}" title="${b.desc}">
        <div class="ic">${b.icon}</div>
        <strong>${b.nome}</strong>
        <span>${isEarned ? "Conquistada" : "Por conquistar"}</span>
      </div>`;
  }).join("");
}

function prepararFoto(id, input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    fotosTemp[id] = e.target.result;
    const prev = document.getElementById(`foto-preview-${id}`);
    if (prev) prev.innerHTML = `<div class="milestone-photo"><img src="${e.target.result}" alt="Pré-visualização da foto"></div>`;
  };
  reader.readAsDataURL(file);
}

function marcarConquistada(id) {
  const m = DEMO_PATIENT.milestones.find(x => x.id === id);
  if (!m) return;
  m.estado = "done";
  if (fotosTemp[id]) m.foto = fotosTemp[id];
  if (typeof onJornadaUpdate === "function") onJornadaUpdate();
}

function adicionarMetaPessoal(titulo, importante) {
  if (!titulo || !titulo.trim()) return;
  const ids = DEMO_PATIENT.milestones.map(m => m.id);
  const novoId = (ids.length ? Math.max.apply(null, ids) : 0) + 1;
  DEMO_PATIENT.milestones.push({
    id: novoId, label: titulo.trim(), data: "meta pessoal", estado: "pending",
    tipo: "Pessoal", categoria: "pessoal", origem: "doente", importante: !!importante, foto: null
  });
  if (typeof onJornadaUpdate === "function") onJornadaUpdate();
}

/* ========================================================================
   JORNADA DE RECUPERAÇÃO — editor (área profissional)
   ======================================================================== */
function editorRowHTML(m, idx) {
  const catOptions = Object.keys(BADGES).map(k =>
    `<option value="${k}" ${m.categoria === k ? "selected" : ""}>${BADGES[k].nome}</option>`
  ).join("");
  return `
  <div class="card" style="margin-bottom:14px;" id="editor-row-${m.id}">
    <div class="form-row">
      <div class="field" style="margin-bottom:12px;">
        <label>Título da meta</label>
        <input type="text" value="${m.label.replace(/"/g, '&quot;')}" oninput="atualizarMeta(${idx}, 'label', this.value)">
      </div>
      <div class="field" style="margin-bottom:12px;">
        <label>Data alvo</label>
        <input type="text" value="${m.data.replace(/"/g, '&quot;')}" oninput="atualizarMeta(${idx}, 'data', this.value)">
      </div>
    </div>
    <div class="form-row">
      <div class="field" style="margin-bottom:12px;">
        <label>Categoria (badge associado)</label>
        <select onchange="atualizarMeta(${idx}, 'categoria', this.value)">${catOptions}</select>
      </div>
      <div class="field" style="margin-bottom:12px;">
        <label>Estado</label>
        <select onchange="atualizarMeta(${idx}, 'estado', this.value)">
          <option value="pending" ${m.estado === "pending" ? "selected" : ""}>Por iniciar</option>
          <option value="active" ${m.estado === "active" ? "selected" : ""}>Em curso</option>
          <option value="done" ${m.estado === "done" ? "selected" : ""}>Concluída</option>
        </select>
      </div>
    </div>
    <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
      <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
        <label class="star-toggle">
          <input type="checkbox" ${m.importante ? "checked" : ""} onchange="atualizarMeta(${idx}, 'importante', this.checked)">
          <span>★ Importante para o doente</span>
        </label>
        <span class="milestone-tag ${m.origem === "doente" ? "origem-doente" : ""}">${m.origem === "doente" ? "Proposta pelo doente" : "Definida pela equipa"}</span>
      </div>
      <button type="button" class="btn btn-ghost btn-sm" onclick="removerMeta(${idx})">Remover</button>
    </div>
  </div>`;
}

function renderMilestonesEditor(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = DEMO_PATIENT.milestones.map(editorRowHTML).join("");
}

function atualizarMeta(idx, campo, valor) {
  if (!DEMO_PATIENT.milestones[idx]) return;
  DEMO_PATIENT.milestones[idx][campo] = valor;
}

function removerMeta(idx) {
  DEMO_PATIENT.milestones.splice(idx, 1);
  renderMilestonesEditor("editor-metas");
}

function adicionarMetaEditor() {
  const ids = DEMO_PATIENT.milestones.map(m => m.id);
  const novoId = (ids.length ? Math.max.apply(null, ids) : 0) + 1;
  DEMO_PATIENT.milestones.push({
    id: novoId, label: "Nova meta", data: "a definir", estado: "pending",
    tipo: "Funcional", categoria: "funcional", origem: "clinica", importante: false, foto: null
  });
  renderMilestonesEditor("editor-metas");
}

/* ========================================================================
   PLANO DE TRATAMENTO — exercícios (Fisioterapia / Terapia Ocupacional)
   e dieta (Nutrição). Presente em ambas as áreas.
   ======================================================================== */

/* ---------- área do doente: registar sessão + ver histórico ---------- */
function renderPlanoDoente(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = DEMO_PATIENT.plano.exercicios.map(exercicioCardDoente).join("");
}

function exercicioCardDoente(ex) {
  const ultimos = ex.registos.slice(-3).reverse();
  const historico = ultimos.length
    ? `<div class="exercicio-historico">
        ${ultimos.map(r => `
          <div class="mini-meta">
            <div><strong>${r.data}</strong>${r.nota ? `<span class="hint" style="display:block;">${r.nota}</span>` : ""}</div>
            <span class="pill pill-flame">Esforço ${r.esforco}/10</span>
          </div>`).join("")}
      </div>`
    : `<p class="hint" style="margin:10px 0 0;">Ainda sem registos de execução.</p>`;

  return `
    <div class="card milestone-card" style="margin-bottom:16px;">
      <div class="milestone-head">
        <div>
          <div class="milestone-meta"><span class="milestone-tag">${ex.categoria}</span></div>
          <h3 class="milestone-title">${ex.nome}</h3>
          <p class="hint" style="margin:0;">${ex.descricao}</p>
          <p class="hint" style="margin:4px 0 0; font-weight:600; color:var(--blue-deep);">${ex.prescricao}</p>
        </div>
      </div>

      <div class="registo-form" id="registo-form-${ex.id}">
        <p class="scale-note" style="margin-top:14px;">Quanto esforço sentiu ao realizar hoje? (0 = nenhum · 10 = esforço máximo)</p>
        <div class="scale mini-scale" id="esforco-${ex.id}">
          ${Array.from({length: 11}, (_, i) => `<label class="scale-opt"><input type="radio" name="esforco-${ex.id}" value="${i}"><span>${i}</span></label>`).join("")}
        </div>
        <input type="text" id="nota-${ex.id}" placeholder="Nota (opcional)" style="margin-top:10px;">
        <button type="button" class="btn btn-flame btn-sm" style="margin-top:12px;" onclick="registarExercicio(${ex.id})">Registar realização de hoje</button>
      </div>

      <hr class="divider" style="margin:16px 0 10px;">
      <p class="eyebrow" style="margin-bottom:6px;">Histórico recente</p>
      ${historico}
    </div>`;
}

function registarExercicio(id) {
  const ex = DEMO_PATIENT.plano.exercicios.find(e => e.id === id);
  if (!ex) return;
  const selecionado = document.querySelector(`input[name="esforco-${id}"]:checked`);
  if (!selecionado) { alert("Indique o nível de esforço antes de registar."); return; }
  const nota = document.getElementById(`nota-${id}`).value;
  const hoje = new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
  ex.registos.push({ data: hoje, esforco: parseInt(selecionado.value, 10), nota });
  renderPlanoDoente("plano-exercicios");
}

/* ---------- área profissional: prescrever + ver adesão ---------- */
function renderPlanoEditor(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = DEMO_PATIENT.plano.exercicios.map(exercicioEditorHTML).join("");
}

function exercicioEditorHTML(ex) {
  const totalRegistos = ex.registos.length;
  const mediaEsforco = totalRegistos
    ? (ex.registos.reduce((s, r) => s + r.esforco, 0) / totalRegistos).toFixed(1)
    : "—";
  return `
    <div class="card" style="margin-bottom:16px;" id="plano-row-${ex.id}">
      <div class="form-row">
        <div class="field" style="margin-bottom:12px;">
          <label>Nome do exercício</label>
          <input type="text" value="${ex.nome.replace(/"/g, '&quot;')}" oninput="atualizarExercicio(${ex.id}, 'nome', this.value)">
        </div>
        <div class="field" style="margin-bottom:12px;">
          <label>Prescrito por</label>
          <select onchange="atualizarExercicio(${ex.id}, 'categoria', this.value)">
            <option value="Enfermagem" ${ex.categoria === "Enfermagem" ? "selected" : ""}>Enfermagem</option>
            <option value="Fisioterapia" ${ex.categoria === "Fisioterapia" ? "selected" : ""}>Fisioterapia</option>
            <option value="Terapia Ocupacional" ${ex.categoria === "Terapia Ocupacional" ? "selected" : ""}>Terapia Ocupacional</option>
          </select>
        </div>
      </div>
      <div class="field" style="margin-bottom:12px;">
        <label>Descrição</label>
        <textarea rows="2" oninput="atualizarExercicio(${ex.id}, 'descricao', this.value)">${ex.descricao}</textarea>
      </div>
      <div class="field" style="margin-bottom:14px;">
        <label>Prescrição (séries / repetições / frequência)</label>
        <input type="text" value="${ex.prescricao.replace(/"/g, '&quot;')}" oninput="atualizarExercicio(${ex.id}, 'prescricao', this.value)">
      </div>
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
        <span class="pill pill-flame">Adesão: ${totalRegistos} registo(s) · esforço médio ${mediaEsforco}</span>
        <button type="button" class="btn btn-ghost btn-sm" onclick="removerExercicio(${ex.id})">Remover</button>
      </div>
    </div>`;
}

function atualizarExercicio(id, campo, valor) {
  const ex = DEMO_PATIENT.plano.exercicios.find(e => e.id === id);
  if (ex) ex[campo] = valor;
}

function removerExercicio(id) {
  DEMO_PATIENT.plano.exercicios = DEMO_PATIENT.plano.exercicios.filter(e => e.id !== id);
  renderPlanoEditor("plano-editor");
}

function adicionarExercicio() {
  const ids = DEMO_PATIENT.plano.exercicios.map(e => e.id);
  const novoId = (ids.length ? Math.max.apply(null, ids) : 0) + 1;
  DEMO_PATIENT.plano.exercicios.push({
    id: novoId, nome: "Novo exercício", categoria: "Fisioterapia",
    descricao: "", prescricao: "", registos: []
  });
  renderPlanoEditor("plano-editor");
}

/* ---------- dieta / nutrição (leitura no doente, edição no profissional) ---------- */
function renderDietaDoente(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const d = DEMO_PATIENT.plano.dieta;
  el.innerHTML = `
    <p class="hint" style="margin-bottom:10px;">Prescrito por ${d.prescritoPor} · atualizado em ${d.atualizado}</p>
    <p>${d.orientacoes}</p>
    <ul style="margin:10px 0 0; padding-left:20px; font-size:.92rem; color:var(--ink-soft); line-height:1.7;">
      ${d.itens.map(i => `<li>${i}</li>`).join("")}
    </ul>`;
}

function renderDietaEditor(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const d = DEMO_PATIENT.plano.dieta;
  el.innerHTML = `
    <div class="field">
      <label>Orientações gerais</label>
      <textarea rows="2" oninput="DEMO_PATIENT.plano.dieta.orientacoes = this.value">${d.orientacoes}</textarea>
    </div>
    <div class="field" style="margin-bottom:0;">
      <label>Recomendações específicas (uma por linha)</label>
      <textarea rows="5" id="dieta-itens" oninput="atualizarItensDieta(this.value)">${d.itens.join("\n")}</textarea>
    </div>`;
}

function atualizarItensDieta(texto) {
  DEMO_PATIENT.plano.dieta.itens = texto.split("\n").map(s => s.trim()).filter(Boolean);
}
