async function pedir(caminho, metodo = "GET", corpo) {
  let resposta;
  try {
    resposta = await fetch("/api" + caminho, {
      method: metodo,
      headers: corpo ? { "Content-Type": "application/json" } : undefined,
      body: corpo ? JSON.stringify(corpo) : undefined
    });
  } catch {
    throw new Error("Não foi possível conectar à API.");
  }
  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({}));
    throw new Error(erro.erro ?? "Não foi possível concluir a operação.");
  }
  const texto = await resposta.text();
  return texto ? JSON.parse(texto) : null;
}

export async function buscarTudo() {
  const [sabores, categorias, linhas, lotes] = await Promise.all([
    pedir("/sabores"), pedir("/categorias"), pedir("/linhas"), pedir("/lotes")
  ]);
  return {
    sabores: sabores.cadastros,
    categorias: categorias.cadastros,
    linhas: linhas.cadastros,
    lotes: lotes.lotes
  };
}

const rotas = { sabor: "/sabores", linha: "/linhas" };

export function gravar({ tipo, item }, valores) {
  switch (tipo) {
    case "sabor":
    case "linha": {
      const corpo = { id: item?.id ?? 0, nome: valores.get("nome").trim() };
      return item ? pedir(`${rotas[tipo]}/${item.id}`, "PUT", corpo) : pedir(rotas[tipo], "POST", corpo);
    }
    case "lote": {
      const corpo = {
        id: item?.id ?? 0,
        sabor_id: Number(valores.get("sabor_id")),
        categoria_id: Number(valores.get("categoria_id")),
        linha_id: Number(valores.get("linha_id")),
        quantidade: Number(valores.get("quantidade")),
        validade: valores.get("validade")
      };
      return item ? pedir(`/lotes/${item.id}`, "PUT", corpo) : pedir("/lotes", "POST", corpo);
    }
    case "saida":
      return pedir(`/lotes/${item.id}/saida`, "PATCH", { saida: Number(valores.get("saida")) });
    case "excluirCadastro":
      return pedir(`${rotas[item.tipo]}/${item.id}`, "DELETE");
    case "excluirLote":
      return pedir(`/lotes/${item.id}`, "DELETE");
  }
}
