// Apps Script ligado a uma planilha do Google. Guarda todos os nomes gerados
// e controla o Id sequencial central (nunca repete, mesmo com vários usuários).
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
function doPost(e) {                     // gera o Id e grava a linha
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents), c = d.campos || {};
    const p = PropertiesService.getScriptProperties();
    const num = (Number(p.getProperty("ultimoId")) || 0) + 1;
    p.setProperty("ultimoId", String(num));
    const id = num < 1000 ? ("00" + num).slice(-3) : String(num);
    const nome = String(d.nome).replace("{ID}", id);
    const data = Utilities.formatDate(new Date(), "America/Sao_Paulo", "dd/MM/yyyy HH:mm");
    aba_().appendRow([id, nome, c.acao, c.origem, c.segmento, c.vigencia, c.detalhe,
                      c.abrangencia, d.obs || "", d.resp || "", data]);
    return json_({ id: id, nome: nome, data: data });
  } catch (err) {
    return json_({ erro: String(err) });
  } finally {
    lock.releaseLock();
  }
}
