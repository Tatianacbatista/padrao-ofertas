(function () {
  const $ = (s) => document.querySelector(s);
  const campos = $("#campos"), nomeEl = $("#nome"), obsEl = $("#obs"), avisoEl = $("#aviso");
  const btnGerar = $("#gerar"), btnCopiar = $("#copiar"), btnLimpar = $("#limpar"), corpo = $("#hist tbody");
  const CHAVE_ID = "padrao-ofertas:ultimo-id", CHAVE_HIST = "padrao-ofertas:historico";

  const ler = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  // Monta uma tag (radio) por opção, uma coluna por fieldset
  window.PADRAO.forEach((col) => {
    const fs = document.createElement("fieldset");
    fs.innerHTML = `<legend>${col.titulo}</legend><div class="tags"></div>`;
    const box = fs.querySelector(".tags");
    col.opcoes.forEach((o, i) => {
      const id = `${col.chave}-${i}`;
      box.insertAdjacentHTML("beforeend",
        `<input type="radio" name="${col.chave}" id="${id}" value="${o.codigo}"><label for="${id}">${o.rotulo}</label>`);
    });
    campos.appendChild(fs);
  });

  // Observação: sem acento, espaço ou hífen; máx. 20
  const limparObs = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 20);

  const escolhas = () => Object.fromEntries(window.PADRAO.map((c) => {
    const r = document.querySelector(`input[name="${c.chave}"]:checked`);
    return [c.chave, r ? r.value : null];
  }));

  const formatarId = (n) => (n < 1000 ? String(n).padStart(3, "0") : String(n));

  function montar(e, id, obs) {
    const base = `${e.acao}-${e.origem}.${e.segmento}.${e.vigencia}.${e.detalhe}.${e.abrangencia}`;
    return `${base}-${id}${obs ? "-" + obs : ""}`;
  }

  function atualizar() {
    const e = escolhas(), obs = limparObs(obsEl.value);
    const completo = Object.values(e).every(Boolean);
    const original = obsEl.value.trim();
    avisoEl.textContent = original && original !== obs
      ? "A observação foi ajustada: sem acento, espaço ou hífen, até 20 caracteres." : "";
    // Prévia usa o próximo Id sem consumi-lo
    const prox = formatarId(ler(CHAVE_ID, 0) + 1);
    nomeEl.textContent = completo ? montar(e, prox, obs) : "Selecione uma tag em cada linha";
    btnGerar.disabled = !completo;
    btnCopiar.disabled = !completo;
  }

  function renderHist() {
    const h = ler(CHAVE_HIST, []);
    corpo.innerHTML = h.length ? h.slice().reverse().map((x) => `<tr><td>${x.nome}</td><td>${x.data}</td></tr>`).join("")
      : `<tr><td colspan="2">Nenhum nome gerado ainda.</td></tr>`;
  }

  btnGerar.addEventListener("click", () => {
    const e = escolhas(), obs = limparObs(obsEl.value);
    const n = ler(CHAVE_ID, 0) + 1;
    gravar(CHAVE_ID, n);
    const nome = montar(e, formatarId(n), obs);
    const h = ler(CHAVE_HIST, []); h.push({ nome, data: new Date().toLocaleString("pt-BR") });
    gravar(CHAVE_HIST, h);
    nomeEl.textContent = nome;
    navigator.clipboard?.writeText(nome).catch(() => {});
    renderHist(); atualizar(); nomeEl.textContent = nome;
  });

  btnCopiar.addEventListener("click", () => navigator.clipboard?.writeText(nomeEl.textContent));
  btnLimpar.addEventListener("click", () => {
    document.querySelectorAll("input[type=radio]").forEach((r) => (r.checked = false));
    obsEl.value = ""; atualizar();
  });
  $("#exportar").addEventListener("click", () => {
    const h = ler(CHAVE_HIST, []);
    const csv = "nome;data\n" + h.map((x) => `${x.nome};${x.data}`).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = "ofertas-geradas.csv"; a.click();
  });

  campos.addEventListener("change", atualizar);
  obsEl.addEventListener("input", atualizar);
  renderHist(); atualizar();
})();
