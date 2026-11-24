import React from "react";
import { TituloPagina, cadastros } from "../componentes";

// Página Cardápio: cadastro de sabores e de linhas.
export default function Cardapio({ dados, abrir, marcas }) {
  return <section className="limite operacao operacao-cardapio">
    <TituloPagina titulo="Cardápio"
      descricao="Sabores e linhas são cadastros separados. Combine-os com a categoria ao criar um lote no Estoque."
      foto="/assets/cardapio-picoles-recorte.webp" cores={["ouro", "rosa"]} ritmoFormas={.45} />
    <div className="cadastros-cardapio">
      {Object.entries(cadastros).map(([tipo, cadastro]) => {
        const itens = dados[cadastro.lista].slice().sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
        return <section key={tipo} aria-labelledby={`titulo-${tipo}`}>
          <header className="titulo-cadastro"><h2 id={`titulo-${tipo}`}>{cadastro.titulo}</h2>
            <button className="botao" onClick={() => abrir(tipo)}>{cadastro.novo}</button>
          </header>
          {itens.length ? <div className="tabela" tabIndex={0} role="region" aria-label={cadastro.titulo}><table>
            <thead><tr><th scope="col">Nome</th><th scope="col">Ações</th></tr></thead>
            <tbody>{itens.map(item => <tr key={item.id} className={marcas.has(`${tipo}:${item.id}`) ? "salvo" : undefined}>
              <th scope="row">{item.nome}</th>
              <td><div className="acoes">
                <button aria-label={`Editar ${item.nome}`} onClick={() => abrir(tipo, item)}>Editar</button>
                <button aria-label={`Excluir ${item.nome}`} onClick={() => abrir("excluirCadastro", { ...item, tipo })}>Excluir</button>
              </div></td>
            </tr>)}</tbody>
          </table></div> : <p className="vazio vazio-cartao">Sem registros.</p>}
        </section>;
      })}
    </div>
  </section>;
}
