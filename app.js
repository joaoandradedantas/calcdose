/* ════════════════════════════════════════
      CONFIG
      ════════════════════════════════════════ */
var API =
  "https://script.google.com/macros/s/AKfycbyktbHPCqNnVZuJWRyuQ0qjYw4Y0Ut44zcU31zgUXsrPlv6L_C0rJg9lQ1Rs4DsdASYgA/exec";

/* ════════════════════════════════════════
      ROUTING
      ════════════════════════════════════════ */
/*
    ROUTING
======================================== */

var currentUid = null;

async function initUser() {
  const user = await getCurrentUser();

  if (user) {
    currentUid = user.id;

    console.log("UID:", currentUid);

    await loadCloud();
    renderRoute();
    navigate("hub");
    return;
  }

  showOnly("setup");
}
async function loginUser() {
  const email = document.getElementById("login-email").value.trim();

  const password = document.getElementById("login-password").value.trim();

  if (!email || !password) {
    alert("Preencha email e senha");
    return;
  }

  const { data, error } = await sb.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert("Email ou senha inválidos");
    return;
  }

  currentUid = data.user.id;

  await loadCloud();
  renderRoute();
  navigate("hub");
}

async function createAccount() {
  const email = document.getElementById("login-email").value.trim();

  const password = document.getElementById("login-password").value.trim();

  if (!email || !password) {
    alert("Preencha email e senha");
    return;
  }

  const { data, error } = await sb.auth.signUp({
    email,
    password,
  });

  if (error) {
    alert(error.message);
    return;
  }

  alert("Conta criada com sucesso!");

  currentUid = data.user.id;

  await loadCloud();
  renderRoute();
  navigate("hub");
}

async function recoverPassword() {
  const email = prompt("Digite seu email:");

  if (!email) return;

  const { error } = await sb.auth.resetPasswordForEmail(email);

  if (error) {
    alert("Erro ao enviar email");
    return;
  }

  alert("Email de recuperação enviado!");
}

function navigate(p) {
  window.location.hash = p;
}

function renderRoute() {
  if (!currentUid) {
    showOnly("setup");
    return;
  }

  var h = window.location.hash.replace("#", "") || "";

  var valid = ["hub", "calc", "exames"];

  if (valid.indexOf(h) === -1) {
    h = "hub";
  }

  showOnly(h);
}

function showOnly(name) {
  ["setup", "hub", "calc", "exames"].forEach(function (s) {
    var el = document.getElementById("screen-" + s);

    if (el) {
      el.classList.toggle("active", s === name);
    }
  });

  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", renderRoute);

initUser();

/* ════════════════════════════════════════
      THEME
      ════════════════════════════════════════ */
function toggleTheme() {
  var h = document.documentElement;
  h.setAttribute(
    "data-theme",
    h.getAttribute("data-theme") === "dark" ? "light" : "dark",
  );
}

/* ════════════════════════════════════════
      SETUP
      ════════════════════════════════════════ */

/* ════════════════════════════════════════
      CALC TABS
      ════════════════════════════════════════ */
function showTab(t, btn) {
  document.querySelectorAll(".csec").forEach(function (s) {
    s.classList.remove("active");
  });
  document.querySelectorAll(".tab-btn").forEach(function (b) {
    b.classList.remove("active");
  });
  document.getElementById("csec-" + t).classList.add("active");
  btn.classList.add("active");
}

/* ════════════════════════════════════════
      UTILS
      ════════════════════════════════════════ */
function fmt(n, d) {
  if (d === undefined) d = 2;
  return parseFloat(n.toFixed(d));
}
function fl(v) {
  var m = {
    7: "Diária",
    3.5: "Dia sim/não",
    3: "3× semana",
    2: "2× semana",
    1: "1× semana",
    0.5: "Quinzenal",
  };
  return m[String(v)] || v + "×/sem";
}
function esc(s) {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function fd(d) {
  if (!d) return "";
  var p = d.split("-");
  return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : d;
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

/* ════════════════════════════════════════
      HORMÔNIO
      ════════════════════════════════════════ */
function hTipoChange() {
  document.getElementById("h-cw").style.display =
    document.getElementById("h-tipo").value === "Outro" ? "block" : "none";
}
function calcH() {
  var tipo = document.getElementById("h-tipo").value,
    dose = parseFloat(document.getElementById("h-dose").value),
    conc = parseFloat(document.getElementById("h-conc").value),
    fe = document.querySelector('input[name="h-freq"]:checked');
  if (!tipo) {
    alert("Selecione o hormônio.");
    return;
  }
  if (isNaN(dose) || dose <= 0) {
    alert("Informe a dose semanal.");
    return;
  }
  if (isNaN(conc) || conc <= 0) {
    alert("Informe a concentração.");
    return;
  }
  if (!fe) {
    alert("Selecione a frequência.");
    return;
  }
  var freq = parseFloat(fe.value),
    mg = dose / freq,
    ml = mg / conc,
    ui = ml * 100;
  document.getElementById("h-ml").textContent = fmt(ml, ml < 0.1 ? 3 : 2);
  document.getElementById("h-rdose").textContent =
    fmt(mg, mg < 1 ? 2 : 1) + " mg";
  document.getElementById("h-rweek").textContent = fmt(dose, 1) + " mg/sem";
  document.getElementById("h-rfreq").textContent = fl(fe.value);
  var uel = document.getElementById("h-ui"),
    nel = document.getElementById("h-note");
  if (ml < 1) {
    uel.textContent = "= " + fmt(ui, 1) + " UI (seringa insulina)";
    uel.style.display = "block";
    document.getElementById("h-note-txt").innerHTML =
      "<strong>Volume abaixo de 1 ml</strong> — use seringa de insulina. Aspire até <strong>" +
      fmt(ui, 1) +
      " UI</strong>.";
    nel.style.display = "flex";
  } else {
    uel.style.display = "none";
    nel.style.display = "none";
  }
  var b = document.getElementById("h-res");
  b.classList.add("show");
  b.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* ════════════════════════════════════════
      PEPTÍDEO
      ════════════════════════════════════════ */
var pu = "mg";
function setPepUnit(u) {
  pu = u;
  var m = u === "mg";
  document.getElementById("u-mg").classList.toggle("active", m);
  document.getElementById("u-mcg").classList.toggle("active", !m);
  var l = m ? "mg" : "mcg";
  document.getElementById("p-vl").textContent = "Qtd. no frasco (" + l + ")";
  document.getElementById("p-dl").textContent = "Dose Desejada (" + l + ")";
  document.getElementById("p-vs").textContent = l;
  document.getElementById("p-ds").textContent = l;
  document.getElementById("p-vial").placeholder = m ? "Ex: 5" : "Ex: 5000";
  document.getElementById("p-dose").placeholder = m ? "Ex: 0.25" : "Ex: 250";
  document.getElementById("p-vial").value = "";
  document.getElementById("p-dose").value = "";
  document.getElementById("p-cprev").classList.remove("show");
  document.getElementById("p-res").classList.remove("show");
}
function tom(v) {
  return pu === "mg" ? v * 1000 : v;
}
function prevPep() {
  var v = parseFloat(document.getElementById("p-vial").value),
    b = parseFloat(document.getElementById("p-bac").value),
    el = document.getElementById("p-cprev");
  if (!isNaN(v) && !isNaN(b) && v > 0 && b > 0) {
    var c = tom(v) / b;
    document.getElementById("p-cv").textContent =
      fmt(c / 1000, c / 1000 < 1 ? 3 : 2) + " mg/ml (" + fmt(c, 1) + " mcg/ml)";
    el.classList.add("show");
  } else el.classList.remove("show");
}
function calcP() {
  var tipo = document.getElementById("p-tipo").value,
    vR = parseFloat(document.getElementById("p-vial").value),
    bac = parseFloat(document.getElementById("p-bac").value),
    dR = parseFloat(document.getElementById("p-dose").value),
    fe = document.querySelector('input[name="p-freq"]:checked');
  if (
    !tipo ||
    isNaN(vR) ||
    isNaN(bac) ||
    isNaN(dR) ||
    vR <= 0 ||
    bac <= 0 ||
    dR <= 0
  ) {
    alert("Preencha todos os campos.");
    return;
  }
  var vM = tom(vR),
    dM = tom(dR),
    c = vM / bac,
    ml = dM / c,
    ui = ml * 100,
    doses = vM / dM,
    freq = parseFloat(fe.value),
    days = (doses / freq) * 7,
    wM = dM * freq;
  document.getElementById("p-ml").textContent = fmt(ml, ml < 0.1 ? 3 : 2);
  document.getElementById("p-ui").textContent =
    "= " + fmt(ui, 1) + " UI (seringa insulina)";
  document.getElementById("p-rdose").textContent =
    pu === "mg" ? fmt(dR, dR < 1 ? 3 : 2) + " mg" : fmt(dR, 1) + " mcg";
  document.getElementById("p-rweek").textContent =
    pu === "mg"
      ? fmt(wM / 1000, wM / 1000 < 1 ? 3 : 2) + " mg/sem"
      : fmt(wM, 1) + " mcg/sem";
  document.getElementById("p-rfreq").textContent = fl(fe.value);
  document.getElementById("p-rconc").textContent =
    pu === "mg" ? fmt(c / 1000, 3) + " mg/ml" : fmt(c, 1) + " mcg/ml";
  document.getElementById("p-rdoses").textContent = fmt(doses, 1) + " doses";
  document.getElementById("p-rdays").textContent =
    fmt(days, 0) + " dias (~" + fmt(days / 7, 1) + " sem)";
  var b = document.getElementById("p-res");
  b.classList.add("show");
  b.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* ════════════════════════════════════════
      EXAM DATA
      ════════════════════════════════════════ */
var examData = [
  {
    id: "s1",
    name: "Glicose / Metabolismo glicêmico",
    color: "#e67e22",
    exams: [
      "Glicemia de jejum",
      "Hemoglobina glicada (HbA1c)",
      "Insulina",
      "HOMA-IR",
    ],
  },
  {
    id: "s2",
    name: "Perfil Lipídico (Colesterol)",
    color: "#c0392b",
    exams: ["HDL", "LDL", "Triglicerídeos", "ApoB"],
  },
  {
    id: "s3",
    name: "Hormônios",
    color: "#5a47d1",
    exams: [
      "Testosterona total",
      "Testosterona livre",
      "DHT",
      "Estradiol",
      "Estrona",
      "Progesterona",
      "LH (Hormônio Luteinizante)",
      "FSH",
      "Prolactina",
      "SHBG",
      "IGF-1 (Somatomedina)",
      "IGFBP-3",
      "Cortisol matinal",
      "DHEA-S",
    ],
  },
  {
    id: "s4",
    name: "Tireoide",
    color: "#8e44ad",
    exams: ["TSH ultra sensível", "T3 livre", "T4 livre"],
  },
  {
    id: "s5",
    name: "Metabolismo Ósseo / Cálcio",
    color: "#16a085",
    exams: ["PTH (Paratormônio)", "Vitamina D"],
  },
  {
    id: "s6",
    name: "Vitaminas e Micronutrientes",
    color: "#27ae60",
    exams: ["Vitamina B12", "Ferro sérico", "Ferritina"],
  },
  {
    id: "s7",
    name: "Inflamação / Risco Cardiovascular",
    color: "#e74c3c",
    exams: ["Proteína C-reativa (PCR)", "Homocisteína", "Fibrinogênio"],
  },
  {
    id: "s8",
    name: "Função Hepática (Fígado)",
    color: "#d35400",
    exams: ["TGO (AST)", "TGP (ALT)", "Gama GT", "Albumina"],
  },
  {
    id: "s9",
    name: "Função Renal",
    color: "#2980b9",
    exams: ["Ureia", "Creatinina", "eGFR", "Cistatina C", "Ácido úrico"],
  },
  {
    id: "s10",
    name: "Proteínas Sanguíneas",
    color: "#1a5fd6",
    exams: [
      "Proteínas Totais",
      "Albumina",
      "Globulina",
      "Relação Albumina/Globulina",
    ],
  },
  {
    id: "s11",
    name: "Hemograma Completo",
    color: "#c0392b",
    exams: [
      "Eritrócitos",
      "Hemoglobina",
      "Hematócrito",
      "VCM",
      "HCM",
      "CHCM",
      "RDW",
      "Leucócitos",
      "Neutrófilos",
      "Eosinófilos",
      "Basófilos",
      "Linfócitos",
      "Monócitos",
      "Contagem de Plaquetas",
      "VPM",
    ],
  },
  {
    id: "s12",
    name: "Função Pancreática / Digestiva",
    color: "#7f8c8d",
    exams: ["Amilase", "Lipase"],
  },
  {
    id: "s13",
    name: "Saúde Prostática",
    color: "#2c3e50",
    exams: ["PSA Total", "PSA Livre"],
  },
];
var records = {};
var openSecs = {};

function getRecs(sid, en) {
  if (!records[sid]) records[sid] = {};
  if (!records[sid][en]) records[sid][en] = [];
  return records[sid][en];
}

/* ════════════════════════════════════════
      SYNC
      ════════════════════════════════════════ */
var saveTimer = null;

function setSync(state, txt) {
  var b = document.getElementById("sync-badge");
  var icons = {
    ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:11px;height:11px"><polyline points="20 6 9 17 4 12"/></svg>',
    saving: '<span class="spin"></span>',
    err: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:11px;height:11px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg>',
  };
  if (!b) return;
  b.className = "sbadge s-" + state;
  b.innerHTML = icons[state] + '<span id="sync-txt">' + txt + "</span>";
}

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  setSync("saving", "Salvando…");
  saveTimer = setTimeout(saveCloud, 1500);
}

async function saveCloud() {
  if (!currentUid) return;

  setSync("saving", "Salvando...");

  const payload = {
    user_id: currentUid,
    data: {
      sections: examData,
      records: records,
    },
  };

  const { error } = await sb.from("exam_records").upsert(payload, {
    onConflict: "user_id",
  });

  if (error) {
    console.log(error);
    setSync("err", "Erro");
    return;
  }

  setSync("ok", "Salvo");
}

async function loadCloud() {
  if (!currentUid) return;

  setSync("saving", "Carregando...");

  const { data, error } = await sb
    .from("exam_records")
    .select("*")
    .eq("user_id", currentUid)
    .maybeSingle();

  if (error) {
    console.log(error);
    setSync("err", "Offline");
    renderExams();
    renderRoute();
    return;
  }

  if (data && data.data) {
    if (data.data.sections) {
      examData = data.data.sections;
    }

    if (data.data.records) {
      records = data.data.records;
    }
  }

  setSync("ok", "Salvo");
  renderExams();
  renderRoute();
}

/* ════════════════════════════════════════
      RENDER EXAMES
      ════════════════════════════════════════ */
function historyChart(recs) {
  if (!recs || recs.length < 2) return "";

  var vals = recs
    .slice()
    .reverse()
    .map(function (r) {
      return {
        value: parseFloat(String(r.result).replace(",", ".")),
        date: r.date,
      };
    })
    .filter(function (v) {
      return !isNaN(v.value);
    });

  if (vals.length < 2) return "";

  var w = 320;
  var h = 140;
  var pad = 28;

  var min = Math.min(...vals.map((v) => v.value));
  var max = Math.max(...vals.map((v) => v.value));

  if (min === max) max += 1;

  var step = (w - pad * 2) / (vals.length - 1);

  var points = vals.map(function (v, i) {
    var x = pad + i * step;

    var y = h - pad - ((v.value - min) / (max - min)) * (h - pad * 2);

    return {
      x,
      y,
      value: v.value,
      date: v.date,
    };
  });

  var path = points
    .map(function (p, i) {
      return (i === 0 ? "M" : "L") + p.x + " " + p.y;
    })
    .join(" ");

  var svg = `
            <div class="hchart">
            <svg viewBox="0 0 ${w} ${h}">
                <line class="hchart-grid" x1="0" y1="40" x2="${w}" y2="40"></line>
                <line class="hchart-grid" x1="0" y1="90" x2="${w}" y2="90"></line>
                <line class="hchart-grid" x1="0" y1="140" x2="${w}" y2="140"></line>
                <path d="${path}" class="hchart-line"></path>

                ${points
                  .map(function (p) {
                    return `
                    <circle cx="${p.x}" cy="${p.y}" r="4" class="hchart-dot"></circle>

                    <text x="${p.x}" y="${p.y - 10}" class="hchart-value">
                    ${p.value}
                    </text>

                    <text x="${p.x}" y="${h - 6}" class="hchart-date">
                    ${fd(p.date)}
                    </text>
                `;
                  })
                  .join("")}
            </svg>
            </div>
        `;

  return svg;
}
function sparkline(values) {
  if (!values || values.length < 2) return "";

  var nums = values
    .map((v) => parseFloat(String(v).replace(",", ".")))
    .filter((v) => !isNaN(v));

  if (nums.length < 2) return "";

  var w = 72;
  var h = 28;
  var pad = 3;

  var min = Math.min(...nums);
  var max = Math.max(...nums);

  if (min === max) {
    max += 1;
  }

  var step = (w - pad * 4) / (nums.length - 1);

  var points = nums.map((n, i) => {
    var x = pad * 2 + i * step;

    var y = h - pad - ((n - min) / (max - min)) * (h - pad * 2);

    return `${x},${y}`;
  });

  return `
                <div class="espark">
                <svg viewBox="0 0 ${w} ${h}">
                <path d="M${points.join(" L ")}"></path>
                </svg>
                </div>
                `;
}
function renderExams() {
  var c = document.getElementById("exam-container");
  if (!c) return;
  c.innerHTML = "";

  examData.forEach(function (sec) {
    var isOpen = openSecs[sec.id];
    var totalRec = 0;
    (sec.exams || []).forEach(function (en) {
      totalRec += getRecs(sec.id, en).length;
    });

    var h = '<div class="escard" id="ec-' + sec.id + '">';
    // Section header
    h +=
      '<div class="eshdr' +
      (isOpen ? " open" : "") +
      '" onclick="toggleSec(\'' +
      sec.id +
      "')\">";
    h +=
      '<div class="esico" style="background:' +
      sec.color +
      "22;border:1px solid " +
      sec.color +
      '44"><svg style="color:' +
      sec.color +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg></div>';
    h += '<span class="esname">' + esc(sec.name) + "</span>";
    if (totalRec > 0) h += '<span class="escnt">' + totalRec + "</span>";
    h +=
      '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>';
    h += "</div>";

    // Section body
    h += '<div class="esbody"><div class="elist">';
    (sec.exams || []).forEach(function (en) {
      var recs = getRecs(sec.id, en)
        .slice()
        .sort(function (a, b) {
          return new Date(b.date || 0) - new Date(a.date || 0);
        });
      var lat = recs[0];
      var bid = "eh-" + sec.id + "_" + en.replace(/[^a-z0-9]/gi, "_");
      var count = recs.length;

      h += '<div class="eitem">';
      // Main row
      h += '<div class="erow">';
      h += '<span class="ename">' + esc(en) + "</span>";

      if (lat) {
        // Trend chip
        var trend = "";
        if (recs.length >= 2) {
          var cur = parseFloat(lat.result),
            prv = parseFloat(recs[1].result);
          if (!isNaN(cur) && !isNaN(prv) && prv !== 0) {
            var diff = cur - prv,
              pct = Math.abs((diff / prv) * 100).toFixed(0);
            if (diff > 0)
              trend = '<span class="etrend t-up">↑ ' + pct + "%</span>";
            else if (diff < 0)
              trend = '<span class="etrend t-down">↓ ' + pct + "%</span>";
            else trend = '<span class="etrend t-flat">→</span>';
          }
        }
        h += '<div class="echip">';
        h +=
          '<span class="echip-val">' +
          esc(lat.result) +
          (lat.unit
            ? ' <span style="font-size:.75rem;font-weight:400;color:var(--text-muted)">' +
              esc(lat.unit) +
              "</span>"
            : "") +
          "</span>";
        h +=
          '<span class="echip-meta">' +
          (lat.date ? fd(lat.date) : "") +
          "</span>";
        h += "</div>";
        if (trend) h += trend;
      } else {
        h += '<span class="ebadge">Sem registro</span>';
      }

      h += '<div class="eactions" onclick="event.stopPropagation()">';
      h +=
        '<button class="icobtn" onclick="openExamM(\'' +
        sec.id +
        "','" +
        esc(en) +
        '\')" title="Registrar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>';
      if (count > 0)
        h +=
          '<button class="icobtn del" onclick="delRec(\'' +
          sec.id +
          "','" +
          esc(en) +
          '\')" title="Remover último"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg></button>';
      h += "</div></div>"; // erow

      // History (expandable) — only if has records
      if (count > 0) {
        h +=
          '<button class="hist-toggle" id="htbtn-' +
          bid +
          '" onclick="toggleHist(\'' +
          bid +
          "')\">";
        h +=
          "<span>" +
          count +
          " registro" +
          (count !== 1 ? "s" : "") +
          " · ver histórico</span>";
        h +=
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>';
        h += "</button>";

        h += '<div class="ehist" id="' + bid + '">';
        if (lat && lat.ref)
          h +=
            '<div class="ehist-ref">Referência: <strong>' +
            esc(lat.ref) +
            "</strong></div>";
        h += '<div class="ehist-title">Histórico completo</div>';
        h += historyChart(recs);
        recs.forEach(function (r, i) {
          var delta = "";
          if (i < recs.length - 1) {
            var c2 = parseFloat(r.result),
              p2 = parseFloat(recs[i + 1].result);
            if (!isNaN(c2) && !isNaN(p2) && p2 !== 0) {
              var df = c2 - p2,
                pt = ((df / Math.abs(p2)) * 100).toFixed(1);
              delta =
                '<span class="hdelta ' +
                (df > 0 ? "d-up" : "d-down") +
                '">' +
                (df > 0 ? "↑" : "↓") +
                Math.abs(pt) +
                "%</span>";
            }
          }
          h += '<div class="hrow"><div class="hdot"></div>';
          h += '<div class="hdate">' + (r.date ? fd(r.date) : "—") + "</div>";
          h +=
            '<div class="hval">' +
            esc(r.result) +
            (r.unit ? " " + esc(r.unit) : "") +
            "</div>";
          h += delta + "</div>";
          if (r.notes) h += '<div class="hnotes">' + esc(r.notes) + "</div>";
        });
        h += "</div>"; // ehist
      }

      h += "</div>"; // eitem
    });

    h += "</div>"; // elist
    // Section actions
    h += '<div class="sec-actions">';
    h +=
      '<button class="btn btn-ghost btn-sm" onclick="openAddExM(\'' +
      sec.id +
      '\')" style="font-size:.8125rem"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Adicionar exame</button>';
    h +=
      '<button class="btn btn-danger btn-sm" onclick="delSec(\'' +
      sec.id +
      '\')" style="font-size:.8125rem"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg> Remover seção</button>';
    h += "</div></div></div>"; // sec-actions, esbody, escard
    c.innerHTML += h;
  });
}

function toggleSec(id) {
  openSecs[id] = !openSecs[id];
  renderExams();
}
function toggleHist(id) {
  var el = document.getElementById(id),
    btn = document.getElementById("htbtn-" + id);
  if (!el) return;
  el.classList.toggle("open");
  if (btn) btn.classList.toggle("open");
}

/* ════════════════════════════════════════
      EXAM MODAL
      ════════════════════════════════════════ */
function openExamM(sid, en) {
  document.getElementById("m-sid").value = sid;
  document.getElementById("m-ekey").value = en;
  document.getElementById("m-exam-ttl").textContent = en;
  document.getElementById("m-ename").value = en;
  document.getElementById("m-result").value = "";
  document.getElementById("m-unit").value = "";
  document.getElementById("m-ref").value = "";
  document.getElementById("m-date").value = new Date()
    .toISOString()
    .slice(0, 10);
  document.getElementById("m-notes").value = "";
  var recs = getRecs(sid, en);
  if (recs.length > 0) {
    var l = recs[recs.length - 1];
    if (l.unit) document.getElementById("m-unit").value = l.unit;
    if (l.ref) document.getElementById("m-ref").value = l.ref;
  }
  document.getElementById("m-exam").classList.add("show");
}

function saveExam() {
  var res = document.getElementById("m-result").value.trim();
  if (!res) {
    alert("Informe o resultado.");
    return;
  }
  var sid = document.getElementById("m-sid").value,
    en = document.getElementById("m-ekey").value;
  getRecs(sid, en).push({
    id: uid(),
    result: res,
    unit: document.getElementById("m-unit").value.trim(),
    ref: document.getElementById("m-ref").value.trim(),
    date: document.getElementById("m-date").value,
    notes: document.getElementById("m-notes").value.trim(),
  });
  openSecs[sid] = true;
  closeM("m-exam");
  renderExams();
  scheduleSave();
}

function delRec(sid, en) {
  var r = getRecs(sid, en);
  if (!r.length) return;
  if (!confirm('Remover o registro mais recente de "' + en + '"?')) return;
  r.pop();
  renderExams();
  scheduleSave();
}

/* ════════════════════════════════════════
      SECTION
      ════════════════════════════════════════ */
function openAddExM(sid) {
  document.getElementById("m-addsec").value = sid;
  document.getElementById("m-addname").value = "";
  document.getElementById("m-addex").classList.add("show");
}
function saveAddEx() {
  var sid = document.getElementById("m-addsec").value,
    n = document.getElementById("m-addname").value.trim();
  if (!n) {
    alert("Informe o nome.");
    return;
  }
  var sec = examData.find(function (s) {
    return s.id === sid;
  });
  if (sec && sec.exams.indexOf(n) === -1) sec.exams.push(n);
  openSecs[sid] = true;
  closeM("m-addex");
  renderExams();
  scheduleSave();
}
function openSecModal() {
  document.getElementById("m-secname").value = "";
  document.getElementById("m-sec").classList.add("show");
}
function saveSec() {
  var n = document.getElementById("m-secname").value.trim();
  if (!n) {
    alert("Informe o nome.");
    return;
  }
  examData.push({
    id: "s-" + uid(),
    name: n,
    color: "#1a5fd6",
    exams: [],
  });
  closeM("m-sec");
  renderExams();
  scheduleSave();
}
function delSec(id) {
  var sec = examData.find(function (s) {
    return s.id === id;
  });
  if (!sec) return;
  if (!confirm('Remover a seção "' + sec.name + '"?')) return;
  examData = examData.filter(function (s) {
    return s.id !== id;
  });
  renderExams();
  scheduleSave();
}

/* ════════════════════════════════════════
      MODALS
      ════════════════════════════════════════ */
function closeM(id) {
  document.getElementById(id).classList.remove("show");
}
function mOvClose(e, id) {
  if (e.target === document.getElementById(id)) closeM(id);
}

/* ════════════════════════════════════════
      INIT
      ════════════════════════════════════════ */
if (currentUid) {
  loadCloud();
} else {
  showOnly("setup");
}
console.log("Supabase OK:", sb);
