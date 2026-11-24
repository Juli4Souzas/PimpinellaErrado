import React, { useState } from "react";
import { descreverLote, itensParaReposicao, mostrarData, ordenados, quantidade, status } from "../estoque";
import { OpcoesCadastro, Situacao, TituloPagina, situacoes } from "../componentes";

// Página Estoque: filtros, aviso de estoque baixo e tabela de lotes com as ações.
export default function Estoque({ dados, data, somenteVencidos, abrir, marcas }) {
  const [sabor, setSabor] = useState("");
  const [situacao, setSituacao] = useState(somenteVencidos ? "Vencido" : "");
  const reposicao = itensParaReposicao(dados.lotes, data);
  const lotes = ordenados(dados.lotes.filter(lote =>
    (!sabor || String(lote.sabor_id) === sabor) &&
    (!situacao || status(lote, data) === situacao)));
  return <section className="limite operacao operacao-estoque">
    <TituloPagina titulo="Estoque"
      descricao="Acompanhe os saldos e as validades dos lotes de sorvetes e picolés e registre as saídas."
      foto="/assets/estoque-chocolate-recorte.webp" logo="/assets/logo-pinpinela.png" acao="Novo lote" onClick={() => abrir("lote")}
      cores={["ouro", "salvia"]} />
    {(!dados.sabores.length || !dados.linhas.length) && <p className="orientacao-lote">
      Cadastre pelo menos um sabor e uma linha antes de criar um lote. <a href="#cardapio">Abrir Cardápio</a>
    </p>}
    <div className="filtros">
      <label htmlFor="filtro-sabor">Sabor<select id="filtro-sabor" value={sabor} onChange={evento => setSabor(evento.target.value)}>
        <option value="">Todos os sabores</option><OpcoesCadastro itens={dados.sabores} />
      </select></label>
      <label htmlFor="filtro-situacao">Situação<select id="filtro-situacao" value={situacao} onChange={evento => setSituacao(evento.target.value)}>
        <option value="">Todas as situações</option>
        {Object.entries(situacoes).map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}
      </select></label>
    </div>
    {reposicao.length > 0 && <details className="reposicao">
      <summary>Estoque baixo <span>· {reposicao.length} {reposicao.length === 1 ? "produto" : "produtos"}</span></summary>
      <ul>{reposicao.map(item => <li key={item.id}>{descreverLote(dados, item).nome} <strong>· {quantidade(item)}</strong></li>)}</ul>
    </details>}
    {lotes.length ? <div className="tabela" tabIndex={0} role="region" aria-label="Lotes do estoque"><table>
      <thead><tr>{["Sabor", "Categoria", "Linha", "Saldo", "Validade", "Situação", "Ações"].map(texto => <th scope="col" key={texto}>{texto}</th>)}</tr></thead>
      <tbody>{lotes.map(lote => {
        const item = descreverLote(dados, lote);
        return <tr key={lote.id} className={marcas.has(`lote:${lote.id}`) ? "salvo" : undefined}>
          <th scope="row">{item.sabor}</th><td>{item.categoria}</td><td>{item.linha}</td>
          <td className="saldo">{quantidade(lote)}</td><td><time dateTime={lote.validade}>{mostrarData(lote.validade)}</time></td>
          <td className="estado"><Situacao valor={status(lote, data)} /></td>
          <td><div className="acoes">
            {lote.quantidade > 0 && <button onClick={() => abrir("saida", lote)}>Dar saída</button>}
            <button onClick={() => abrir("lote", lote)}>Editar</button>
            <button onClick={() => abrir("excluirLote", lote)}>Excluir</button>
          </div></td>
        </tr>;
      })}</tbody>
    </table></div> : <p className="vazio">Nenhum lote encontrado.</p>}
  </section>;
}
