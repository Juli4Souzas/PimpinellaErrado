import React from "react";
import { Blob, Divisor, Ramo } from "./organico";

export const paginas = [["vitrine", "Vitrine do Dia"], ["estoque", "Estoque"], ["cardapio", "Cardápio"]];
export const situacoes = { Vencido: "Vencidos", "Vence em breve": "Vencem em breve", Disponível: "Disponíveis", Zerado: "Zerados" };

export const cadastros = {
  sabor: { lista: "sabores", nome: "sabor", titulo: "Sabores", novo: "Novo sabor", maximo: 100, campo: "sabor_id", contador: "proximoSabor" },
  linha: { lista: "linhas", nome: "linha", titulo: "Linhas", novo: "Nova linha", maximo: 50, campo: "linha_id", contador: "proximaLinha" }
};

export function Marca() {
  return <a className="marca" href="#vitrine" aria-label="StockEasy, início">StockEasy<span className="marca-ponto" aria-hidden="true" /></a>;
}

// A página atual fica marcada com uma gota amarela atrás do link.
export function Nav({ pagina, rodape = false }) {
  return <nav aria-label={rodape ? "Menu do rodapé" : "Menu principal"}>
    {paginas.map(([id, nome]) => <a key={id} href={`#${id}`} aria-current={pagina === id ? "page" : undefined}>
      {pagina === id && <svg className="gota-nav" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d="M9 5C30 -1 70 -2 92 4C101 11 102 27 93 35C70 42 28 41 8 35C-2 27 -2 11 9 5Z" />
      </svg>}
      <span>{nome}</span>
    </a>)}
  </nav>;
}

export function Rodape({ pagina }) {
  return <footer>
    <Divisor cor="indigo" lado="cima" amplitude={.65} />
    <div className="limite rodape">
      <div className="rodape-marca">
        <Marca />
        <p className="manuscrito-rodape">Primeiro a vencer, primeiro a sair.</p>
      </div>
      <Nav pagina={pagina} rodape />
    </div>
    <div className="rodape-arte" aria-hidden="true"><Ramo className="rodape-ramo ilustracao" /></div>
  </footer>;
}

export function OpcoesCadastro({ itens }) {
  return itens.slice().sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
    .map(item => <option key={item.id} value={item.id}>{item.nome}</option>);
}

// Cabeçalho das páginas Estoque e Cardápio: texto à esquerda, foto com duas manchas à direita.
// ritmoFormas só muda o desenho das manchas (o Cardápio usa outro contorno).
export function TituloPagina({ titulo, descricao, foto, logo, acao, onClick, cores, ritmoFormas = 1 }) {
  return <header className="titulo-pagina">
    <div className="titulo-pagina-texto">
      <h1>{titulo}</h1>
      <p>{descricao}</p>
      {acao && <button className="botao" onClick={onClick}>{acao}</button>}
    </div>
    <div className="titulo-pagina-visual" aria-hidden="true">
      <div className="titulo-formas" aria-hidden="true">
        <Blob cor={cores[0]} className="forma-a" pontos={8} amp={.2} vel={.0005 * ritmoFormas} sem={11} />
        <Blob cor={cores[1]} className="forma-b" pontos={7} amp={.2} vel={.00055 * ritmoFormas} sem={13} />
      </div>
      <figure className="foto-produto">
        <img src={foto} alt="" />
        {logo && <img className="logo-no-pote" src={logo} alt="" />}
      </figure>
    </div>
  </header>;
}

const iconesSituacao = {
  Disponível: <path d="M3.5 8.5l3 3 6-7" />,
  "Vence em breve": <><circle cx="8" cy="8" r="5.8" /><path d="M8 4.8V8l2.2 1.4" /></>,
  Vencido: <><circle cx="8" cy="8" r="5.8" /><path d="M5.8 5.8l4.4 4.4M10.2 5.8l-4.4 4.4" /></>,
  Zerado: <circle cx="8" cy="8" r="5.8" />
};
const classesSituacao = { Disponível: "disponivel", "Vence em breve": "breve", Vencido: "vencido", Zerado: "zerado" };

export function Situacao({ valor }) {
  return <span className={`tag tag-${classesSituacao[valor]}`}>
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{iconesSituacao[valor]}</svg>
    {valor}
  </span>;
}
