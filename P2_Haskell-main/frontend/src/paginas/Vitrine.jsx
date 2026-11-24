import React from "react";
import { descreverLote, lotesDaVitrine, mostrarData, prazo, quantidade, urgencia } from "../estoque";
import AbreVitrine from "../AbreVitrine";
import { Blob, Divisor, Limao, MascaraProposito, Seta } from "../organico";

// Página Vitrine do Dia: abertura, lote prioritário, próximos vencimentos e o "para que serve".
export default function Vitrine({ dados, data, pausado, alternarMovimento }) {
  const { prioritario, proximos } = lotesDaVitrine(dados.lotes, data);
  const item = prioritario && descreverLote(dados, prioritario);
  const vencidos = dados.lotes.filter(lote => lote.validade < data).length;
  // A cor da mancha indica a urgência do lote.
  const pressa = prioritario ? urgencia(prioritario.validade, data) : "baixa";
  return <>
    <AbreVitrine pausado={pausado} alternarMovimento={alternarMovimento} />
    <div className="limite destaque-envoltorio">
      <Limao className="destaque-limao ilustracao" />
    <section className={`destaque destaque-${pressa}`} id="lote-prioritario" tabIndex={-1} aria-labelledby="titulo-destaque">
      <div className="destaque-fundo" aria-hidden="true">
        <Blob key={pressa} cor={{ alta: "rosa", media: "ouro", baixa: "salvia" }[pressa]} className="destaque-blob"
          pontos={7} amp={.2} vel={{ alta: .0011, media: .0007, baixa: .00045 }[pressa]} sem={7} />
      </div>
      <div className="dados-destaque">
        <h2 id="titulo-destaque">Lote prioritário</h2>
        {item ? <>
          <h3>{item.sabor}</h3>
          <p>{item.categoria} · Linha {item.linha}</p>
          <a className="botao" href="#estoque">Ver estoque</a>
        </> : <p>Nenhum lote disponível.</p>}
      </div>
      {item && <dl className="ficha-lote">
        <div><dt>Saldo do lote</dt><dd>{quantidade(prioritario)}</dd></div>
        <div><dt>Validade</dt><dd><time dateTime={prioritario.validade}>{mostrarData(prioritario.validade)}</time>
          <span className={`prazo-lote tag tag-${pressa}`}>{prazo(prioritario, data)}</span>
        </dd></div>
      </dl>}
    </section>
    </div>
    <section className="faixa faixa-rosa vencimentos" aria-labelledby="titulo-vencimentos">
      <Divisor cor="rosa" lado="cima" />
      <div className="limite faixa-corpo">
        <header className="titulo-secao">
          <h2 id="titulo-vencimentos">Próximos vencimentos</h2>
          <p>Demais lotes que vencem em até três dias.</p>
        </header>
        {proximos.length ? <div className="grade">
          {proximos.map(lote => {
            const item = descreverLote(dados, lote);
            return <article key={lote.id} className="produto">
              <h3>{item.sabor}</h3>
              <p>{item.categoria} · Linha {item.linha}</p>
              <p className="produto-saldo"><span className={`prazo-lote tag tag-${urgencia(lote.validade, data)}`}>{prazo(lote, data)}</span><strong>{quantidade(lote)}</strong></p>
            </article>;
          })}
        </div> : <p className="vazio">Nenhum outro lote vence nesse período.</p>}
        <div className="atalho">
          <p><strong>{vencidos}</strong> {vencidos === 1 ? "lote vencido" : "lotes vencidos"}</p>
          <a className="botao contorno" href="#estoque-vencidos">Ver vencidos<Seta /></a>
        </div>
      </div>
      <Divisor cor="rosa" lado="baixo" gotas={5} />
    </section>
    <PropositoStockEasy />
  </>;
}

function PropositoStockEasy() {
  return <section className="limite proposito" aria-labelledby="titulo-proposito">
    <figure className="proposito-visual">
      <MascaraProposito />
      <img src="/assets/sorvete-editorial.webp" width="1200" height="900"
        alt="Sorvete de morango servido em uma tigela com borda azul" loading="lazy" />
    </figure>
    <div className="proposito-texto">
      <h2 id="titulo-proposito">Para que serve o StockEasy?</h2>
      <p>O StockEasy ajuda a Sorveteria Pinpinela a organizar o cardápio e controlar o estoque de picolés e sorvetes por lote.</p>
      <p>No dia a dia, a equipe pode conferir o saldo, registrar saídas e priorizar a venda dos lotes que vencem primeiro. Assim, fica mais fácil planejar a reposição e reduzir o desperdício.</p>
    </div>
  </section>;
}
