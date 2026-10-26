// ============================================================
// DADOS DO PADRÃO — extraídos de "Padrão de obertas.xlsx".
// "codigo" entra no nome; "rotulo" é o que o usuário vê.
// Abrangência normalizada para 3 caracteres (L1 -> L01, TD -> TD0, G1 -> G01).
// ============================================================
window.PADRAO = [
  { chave: "acao", titulo: "Ação", opcoes: [
    { codigo: "Lâminas",      rotulo: "Lâminas" },
    { codigo: "Encarte",      rotulo: "Encarte" },
    { codigo: "TV",           rotulo: "TV" },
    { codigo: "Parceria",     rotulo: "Parceria" },
    { codigo: "Guia Digital", rotulo: "Guia Digital" },
    { codigo: "Oferta",       rotulo: "Oferta" }
  ]},
  { chave: "origem", titulo: "Origem", opcoes: [
    { codigo: "IC", rotulo: "Interna Comercial" },
    { codigo: "IL", rotulo: "Interna Loja" },
    { codigo: "ER", rotulo: "Externa Rede" },
    { codigo: "EI", rotulo: "Externa Indústria" },
    { codigo: "EC", rotulo: "Externa Concorrente" }
  ]},
  { chave: "segmento", titulo: "Segmento", opcoes: [
    { codigo: "1",   rotulo: "Varejo" },
    { codigo: "2",   rotulo: "Ifood" },
    { codigo: "3",   rotulo: "Delivery" },
    { codigo: "4",   rotulo: "Superclube" },
    { codigo: "5",   rotulo: "Cafeteria" },
    { codigo: "6",   rotulo: "Restaurante" },
    { codigo: "100", rotulo: "Rockinrio" }
  ]},
  { chave: "vigencia", titulo: "Vigência", opcoes: [
    { codigo: "FD", rotulo: "FDS" },
    { codigo: "MS", rotulo: "Mês" },
    { codigo: "QZ", rotulo: "Quinzena" }
  ]},
  { chave: "detalhe", titulo: "Detalhe", opcoes: [
    { codigo: "RE", rotulo: "Retificação" },
    { codigo: "AP", rotulo: "Com Apuração" },
    { codigo: "SD", rotulo: "Sem Detalhes" }
  ]},
  { chave: "abrangencia", titulo: "Abrangência", opcoes: [
    { codigo: "TD0", rotulo: "Todas" },
    { codigo: "G01", rotulo: "Grupo 1" },
    { codigo: "G02", rotulo: "Grupo 2" },
    { codigo: "G03", rotulo: "Grupo 3" },
    ...[1,5,7,8,9,10,11,12,13,14,15,16,17,18].map(n => ({
      codigo: "L" + String(n).padStart(2, "0"), rotulo: "Loja " + n
    }))
  ]}
];
