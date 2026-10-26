// Google Apps Script ligado a uma planilha do Google (Google Sheets / Planilhas Google).
// Guarda todos os nomes gerados e recusa Ids repetidos.
const ABA = "Ofertas";

function aba_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(ABA);
  if (!s) {
    s = ss.insertSheet(ABA);
    s.appendRow(["Id","Nome padrão","Ação","Origem","Segmento","Vigência","Detalhe","Abrangência","Observação","Responsável","Data"]);
    s.getRange("A:B").setNumberFormat("@");
    s.setFrozenRows(1);
  }
  return s;
}
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function doGet() {                       // lista os 500 nomes mais recentes
  const s = aba_(), n = s.getLastRow();
  if (n < 2) return json_({ itens: [] });
  const ini = Math.max(2, n - 499);
  const v = s.getRange(ini, 1, n - ini + 1, 11).getValues().reverse();
  return json_({ itens: v.map(r => ({ id: r[0], nome: r[1], resp: r[9], data: r[10] })) });
}
function doPost(e) {                     // grava o nome (o Id vem da página)
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents), c = d.campos || {};
    if (!/^[A-Z0-9]{4}$/.test(String(d.id))) return json_({ erro: "Id inválido" });
    const s = aba_(), n = s.getLastRow();
    if (n > 1) {
      const ids = s.getRange(2, 1, n - 1, 1).getValues().flat();
      if (ids.indexOf(d.id) > -1) return json_({ duplicado: true });
    }
    const data = Utilities.formatDate(new Date(), "America/Sao_Paulo", "dd/MM/yyyy HH:mm");
    s.appendRow([d.id, String(d.nome), c.acao, c.origem, c.segmento, c.vigencia, c.detalhe,
                 c.abrangencia, d.obs || "", d.resp || "", data]);
    return json_({ id: d.id, nome: d.nome, data: data });
  } catch (err) {
    return json_({ erro: String(err) });
  } finally {
    lock.releaseLock();
  }
}
