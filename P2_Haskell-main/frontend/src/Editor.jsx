import React, { useEffect, useRef, useState } from "react";
import { chaveNome, descreverLote, mostrarData, quantidade } from "./estoque";
import { buscarTudo, gravar } from "./api";
import { Blob } from "./organico";
import { OpcoesCadastro, cadastros } from "./componentes";

function camposDoEditor(tipo, item, dados) {
  const cadastro = cadastros[tipo];
  if (cadastro) return {
    titulo: item ? `Editar ${cadastro.nome}` : cadastro.novo,
    campos: <label htmlFor="nome">Nome do cadastro<input id="nome" name="nome" required maxLength={cadastro.maximo} defaultValue={item?.nome} /></label>
  };
  switch (tipo) {
    case "lote":
      return {
        titulo: item ? "Editar lote" : "Novo lote",
        campos: <>
          <label htmlFor="sabor-lote">Sabor<select id="sabor-lote" name="sabor_id" required defaultValue={item?.sabor_id ?? ""}>
            <option value="">Selecione o sabor</option><OpcoesCadastro itens={dados.sabores} />
          </select></label>
          <label htmlFor="categoria-lote">Categoria<select id="categoria-lote" name="categoria_id" required defaultValue={item?.categoria_id ?? ""}>
            <option value="">Selecione a categoria</option><OpcoesCadastro itens={dados.categorias} />
          </select></label>
          <label htmlFor="linha-lote">Linha<select id="linha-lote" name="linha_id" required defaultValue={item?.linha_id ?? ""}>
            <option value="">Selecione a linha</option><OpcoesCadastro itens={dados.linhas} />
          </select></label>
          <label htmlFor="quantidade">Quantidade em unidades<input id="quantidade" name="quantidade" type="number" required min={item ? 0 : 1} max="2147483647" step="1" defaultValue={item?.quantidade} /></label>
          <label htmlFor="validade">Validade<input id="validade" name="validade" type="date" required defaultValue={item?.validade} /></label>
        </>
      };
    case "saida":
      return {
        titulo: "Dar saída", acao: "Registrar saída",
        campos: <>
          <p>{descreverLote(dados, item).nome}<br />Saldo atual: {quantidade(item)}</p>
          <label htmlFor="saida">Quantidade a retirar<input id="saida" name="saida" type="number" step="1" min="1" max={item.quantidade} required /></label>
        </>
      };
    case "excluirCadastro":
      return { titulo: `Excluir ${cadastros[item.tipo].nome}?`, acao: "Excluir", campos: <p>{item.nome}</p> };
    case "excluirLote":
      return { titulo: "Excluir lote?", acao: "Excluir", campos: <p>{descreverLote(dados, item).nome} · {mostrarData(item.validade)}</p> };
  }
}

function atualizar(dados, { tipo, item }, valores) {
  const cadastro = cadastros[tipo];
  if (cadastro) {
    const nome = valores.get("nome").trim();
    const itens = dados[cadastro.lista];
    if (!nome || nome.length > cadastro.maximo) return "Confira o nome informado.";
    if (itens.some(outro => outro.id !== item?.id && chaveNome(outro.nome) === chaveNome(nome))) {
      return "Já existe um cadastro com esse nome.";
    }
    if (item) return { ...dados, [cadastro.lista]: itens.map(atual => atual.id === item.id ? { ...atual, nome } : atual) };
    const id = dados[cadastro.contador];
    return { ...dados, [cadastro.lista]: [...itens, { id, nome }], [cadastro.contador]: id + 1 };
  }
  switch (tipo) {
    case "lote": {
      const sabor_id = Number(valores.get("sabor_id"));
      const categoria_id = Number(valores.get("categoria_id"));
      const linha_id = Number(valores.get("linha_id"));
      const numero = Number(valores.get("quantidade"));
      const validade = valores.get("validade");
      if (!dados.sabores.some(sabor => sabor.id === sabor_id) ||
          !dados.categorias.some(categoria => categoria.id === categoria_id) ||
          !dados.linhas.some(linha => linha.id === linha_id)) return "Selecione sabor, categoria e linha.";
      if (!Number.isInteger(numero) || numero < (item ? 0 : 1) || numero > 2147483647 ||
          !/^\d{4}-\d{2}-\d{2}$/.test(validade)) return "Confira a quantidade e a validade.";
      const dadosLote = { sabor_id, categoria_id, linha_id, quantidade: numero, validade };
      return item
        ? { ...dados, lotes: dados.lotes.map(lote => lote.id === item.id ? { ...lote, ...dadosLote } : lote) }
        : { ...dados, lotes: [...dados.lotes, { id: dados.proximoLote, ...dadosLote }], proximoLote: dados.proximoLote + 1 };
    }
    case "saida": {
      const numero = Number(valores.get("saida"));
      const lote = dados.lotes.find(lote => lote.id === item.id);
      if (!lote || !Number.isSafeInteger(numero) || numero < 1 || numero > lote.quantidade) return "Informe uma quantidade dentro do saldo.";
      return { ...dados, lotes: dados.lotes.map(atual => atual.id === item.id ? { ...atual, quantidade: atual.quantidade - numero } : atual) };
    }
    case "excluirCadastro": {
      const registro = cadastros[item.tipo];
      if (dados.lotes.some(lote => lote[registro.campo] === item.id)) return "Este cadastro está vinculado a lotes e não pode ser excluído.";
      return { ...dados, [registro.lista]: dados[registro.lista].filter(atual => atual.id !== item.id) };
    }
    case "excluirLote":
      return { ...dados, lotes: dados.lotes.filter(lote => lote.id !== item.id) };
  }
}

export default function Editor({ editor, dados, fechar, concluir }) {
  const modal = useRef(null);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const { titulo, acao = "Salvar", campos } = camposDoEditor(editor.tipo, editor.item, dados);

  useEffect(() => {
    const dialogo = modal.current;
    dialogo.showModal();
    return () => dialogo.close();
  }, []);

  async function enviar(evento) {
    evento.preventDefault();
    const valores = new FormData(evento.currentTarget);
    const resultado = atualizar(dados, editor, valores);
    if (typeof resultado === "string") { setErro(resultado); return; }
    setEnviando(true);
    try {
      await gravar(editor, valores);
      concluir(await buscarTudo());
    } catch (falha) {
      setErro(falha.message);
      setEnviando(false);
    }
  }

  return <dialog ref={modal} aria-labelledby="modal-titulo" onCancel={evento => { evento.preventDefault(); fechar(); }}>
    <Blob cor="ouro" className="modal-blob modal-blob-a" pontos={7} amp={.2} vel={.0005} sem={17} />
    <Blob cor="salvia" className="modal-blob modal-blob-b" pontos={7} amp={.2} vel={.00045} sem={19} />
    <form onSubmit={enviar}>
      <div className="modal-titulo"><h2 id="modal-titulo">{titulo}</h2><button className="fechar" type="button" aria-label="Fechar" onClick={fechar}>×</button></div>
      <div className="campos">{campos}</div>
      {erro && <p className="erro" role="alert">{erro}</p>}
      <div className="modal-acoes"><button className="botao contorno" type="button" onClick={fechar}>Cancelar</button><button className="botao" disabled={enviando}>{acao}</button></div>
    </form>
  </dialog>;
}
