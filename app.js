(function () {
  const $ = (s) => document.querySelector(s);
  const campos = $("#campos"), nomeEl = $("#nome"), obsEl = $("#obs"), respEl = $("#resp"), avisoEl = $("#aviso"),
        statusEl = $("#status"), buscaEl = $("#busca"), btnGerar = $("#gerar"), btnCopiar = $("#copiar"),
        btnLimpar = $("#limpar"), corpo = $("#hist tbody");
  const API = (window.API_URL || "").trim();
  const K_ID = "padrao-ofertas:ultimo-id", K_HIST = "padrao-ofertas:historico", K_RESP = "padrao-ofertas:resp";
  let itens = [];

  const ler = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  window.PADRAO.forEach((col) => {
    const fs = document.createElement("fieldset");
    fs.innerHTML = `<legend>${col.titulo}</legend><div class="tags"></div>`;
    const box = fs.querySelector(".tags");
    col.opcoes.forEach((o, i) => {
      const id = `${col.chave}-${i}`;
      box.insertAdjacentHTML("beforeend",
        `<input type="radio" name="${col.chave}" id="${id}" value="${esc(o.codigo)}"><label for="${id}">${esc(o.rotulo)}</label>`);
    });
    campos.appendChild(fs);
  });

  respEl.value = ler(K_RESP, "");
  const limparObs = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 20);
  const escolhas = () => Object.fromEntries(window.PADRAO.map((c) => {
    const r = document.querySelector(`input[name="${c.chave}"]:checked`);
    return [c.chave, r ? r.value : null];
  }));
  const formatarId = (n) => (n < 1000 ? String(n).padStart(3, "0") : String(n));
  const montar = (e, id, obs) => `${e.acao}-${e.origem}.${e.segmento}.${e.vigencia}.${e.detalhe}.${e.abrangencia}-${id}${obs ? "-" + obs : ""}`;

  function atualizar() {
    const e = escolhas(), obs = limparObs(obsEl.value);
    const completo = Object.values(e).every(Boolean) && respEl.value.trim().length > 1;
    const original = obsEl.value.trim();
    avisoEl.textContent = original && original !== obs ? "A observação foi ajustada: sem acento, espaço ou hífen, até 20 caracteres." : "";
    const prev = API ? "XXX" : formatarId(ler(K_ID, 0) + 1);
    const tags = Object.values(e).every(Boolean);
    nomeEl.textContent = tags ? montar(e, prev, obs) : "Selecione uma tag em cada linha";
    btnGerar.disabled = !completo;
    btnCopiar.disabled = !tags;
  }

  function renderLista() {
    const q = buscaEl.value.trim().toLowerCase();
    const f = itens.filter((x) => !q || `${x.nome} ${x.resp}`.toLowerCase().includes(q));
    corpo.innerHTML = f.length
      ? f.map((x) => `<tr><td>${esc(x.nome)}</td><td>${esc(x.resp)}</td><td>${esc(x.data)}</td></tr>`).join("")
      : `<tr><td colspan="3">Nenhum nome encontrado.</td></tr>`;
  }

  async function carregar() {
    if (!API) { itens = ler(K_HIST, []).slice().reverse(); renderLista(); return; }
    statusEl.textContent = "Carregando lista...";
    try {
      const r = await fetch(API); const j = await r.json();
      itens = j.itens || []; statusEl.textContent = "";
    } catch { statusEl.textContent = "Não foi possível carregar a lista. Tente atualizar."; }
    renderLista();
  }

  btnGerar.addEventListener("click", async () => {
    const e = escolhas(), obs = limparObs(obsEl.value), resp = respEl.value.trim();
    gravar(K_RESP, resp);
    let nome, data;
    if (API) {
      btnGerar.disabled = true; statusEl.textContent = "Gerando e gravando...";
      try {
        const r = await fetch(API, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ nome: montar(e, "{ID}", obs), campos: e, obs, resp }) });
        const j = await r.json();
        if (j.erro) throw new Error(j.erro);
        nome = j.nome; data = j.data; statusEl.textContent = "Nome gravado na lista central.";
      } catch (err) {
        statusEl.textContent = "Erro ao gravar: o nome NÃO foi salvo. Tente novamente."; atualizar(); return;
      }
    } else {
      const n = ler(K_ID, 0) + 1; gravar(K_ID, n);
      nome = montar(e, formatarId(n), obs); data = new Date().toLocaleString("pt-BR");
      const h = ler(K_HIST, []); h.push({ nome, resp, data }); gravar(K_HIST, h);
    }
    navigator.clipboard?.writeText(nome).catch(() => {});
    await carregar(); atualizar(); nomeEl.textContent = nome;
  });

  btnCopiar.addEventListener("click", () => navigator.clipboard?.writeText(nomeEl.textContent));
  btnLimpar.addEventListener("click", () => {
    document.querySelectorAll("input[type=radio]").forEach((r) => (r.checked = false));
    obsEl.value = ""; atualizar();
  });
  $("#atualizar").addEventListener("click", carregar);
  $("#exportar").addEventListener("click", () => {
    const csv = "nome;responsavel;data\n" + itens.map((x) => `${x.nome};${x.resp};${x.data}`).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = "ofertas-geradas.csv"; a.click();
  });
  campos.addEventListener("change", atualizar);
  obsEl.addEventListener("input", atualizar);
  respEl.addEventListener("input", atualizar);
  buscaEl.addEventListener("input", renderLista);
  carregar(); atualizar();
})();
