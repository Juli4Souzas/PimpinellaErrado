export const fuso = "America/Sao_Paulo";

export function hoje() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: fuso }).format(new Date());
}

export function deslocar(data, dias) {
  const dia = new Date(data + "T12:00:00Z");
  dia.setUTCDate(dia.getUTCDate() + dias);
  return dia.toISOString().slice(0, 10);
}

export function mostrarData(data) {
  return data.split("-").reverse().join("/");
}

export function chaveNome(nome) {
  return nome.trim().normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("pt-BR");
}

export function descreverLote(dados, lote) {
  const sabor = dados.sabores.find(item => item.id === lote.sabor_id)?.nome ?? "Sabor indisponível";
  const categoria = dados.categorias.find(item => item.id === lote.categoria_id)?.nome ?? "Categoria indisponível";
  const linha = dados.linhas.find(item => item.id === lote.linha_id)?.nome ?? "Linha indisponível";
  return { sabor, categoria, linha, nome: `${sabor} · ${categoria} · Linha ${linha}` };
}

export function quantidade(lote) {
  const unidade = lote.categoria_id === 1 ? ["picolé", "picolés"] : ["pote", "potes"];
  return `${lote.quantidade} ${unidade[lote.quantidade === 1 ? 0 : 1]}`;
}

export function itensParaReposicao(lotes, data) {
  const saldos = new Map();
  for (const lote of lotes) {
    if (lote.validade < data) continue;
    const chave = `${lote.sabor_id}:${lote.categoria_id}:${lote.linha_id}`;
    const saldo = saldos.get(chave);
    saldos.set(chave, { ...lote, quantidade: (saldo?.quantidade ?? 0) + lote.quantidade });
  }
  return [...saldos.values()].filter(item => item.quantidade <= 5);
}

export function status(lote, data) {
  if (lote.validade < data) return "Vencido";
  if (lote.quantidade === 0) return "Zerado";
  return lote.validade <= deslocar(data, 3) ? "Vence em breve" : "Disponível";
}

export function prazo(lote, data) {
  if (lote.validade === data) return "Vence hoje";
  if (lote.validade === deslocar(data, 1)) return "Vence amanhã";
  return `Vence em ${mostrarData(lote.validade)}`;
}

export function ordenados(lotes) {
  return lotes.slice().sort((a, b) => a.validade.localeCompare(b.validade) || a.id - b.id);
}

export function lotesDaVitrine(lotes, data) {
  const [prioritario, ...outros] = ordenados(lotes.filter(lote => lote.quantidade > 0 && lote.validade >= data));
  return {
    prioritario,
    proximos: outros.filter(lote => lote.validade <= deslocar(data, 3))
  };
}

export function diasAte(validade, data) {
  const [a, m, d] = validade.split("-").map(Number);
  const [a2, m2, d2] = data.split("-").map(Number);
  return Math.round((Date.UTC(a, m - 1, d) - Date.UTC(a2, m2 - 1, d2)) / 86400000);
}

export function urgencia(validade, data) {
  const dias = diasAte(validade, data);
  return dias <= 1 ? "alta" : dias <= 3 ? "media" : "baixa";
}
