import React from "react";
import { Blob, Limao, Picole, Rabisco, Ramo } from "./organico";

function proximaSecao() {
  const prioridade = document.getElementById("lote-prioritario");
  prioridade.focus({ preventScroll: true });
  prioridade.scrollIntoView();
}

export function ControleMovimento({ classe, pausado, alternarMovimento }) {
  const rotulo = pausado ? "Retomar giro do sorvete" : "Pausar giro do sorvete";
  return <button className={`controle-movimento ${classe}`} type="button"
    aria-label={rotulo} title={rotulo} onClick={alternarMovimento}>
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
      {pausado ? <path d="M5 3l8 5-8 5z"/> : <path d="M4 3h3v10H4zm5 0h3v10H9z"/>}
    </svg>
  </button>;
}


export default function AbreVitrine({ pausado, alternarMovimento }) {
  return <section className="hero limite" aria-labelledby="titulo-vitrine">
    <div className="hero-intro">
      <h1 id="titulo-vitrine">
        <span className="titulo-linha">Vitrine</span>{" "}
        <span className="titulo-linha">do dia</span>
      </h1>
      <p className="manuscrito">
        <span>O que vender primeiro?</span>
        <Rabisco className="rabisco" />
      </p>
      <p className="hero-texto">Confira o lote prioritário e as próximas validades dos picolés e sorvetes da Pinpinela.</p>
      <button className="botao" onClick={proximaSecao}>Ver lote prioritário</button>
    </div>
    <div className="hero-visual">
      <div className="camada">
        <Blob cor="ouro" className="blob-ouro" pontos={8} amp={.2} vel={.00046} sem={1} />
      </div>
      <div className="camada">
        <Blob cor="salvia" className="blob-salvia" pontos={8} amp={.2} vel={.00041} sem={3} />
      </div>
      <div className="camada">
        <Blob cor="rosa" className="blob-rosa" pontos={6} amp={.18} vel={.00058} sem={5} />
      </div>
      <div className="camada">
        <Limao className="limao ilustracao" />
        <Picole className="picole ilustracao" />
      </div>
      <div className="camada camada-prato">
        <div className="prato-entrada">
          <img className="prato-giro" src="/assets/sorvete-rotacao.webp" width="800" height="800"
            alt="Duas bolas de sorvete de morango em um prato de borda azul, visto de cima" />
        </div>
      </div>
      <div className="camada">
        <Ramo className="ramo ilustracao" />
      </div>
      <ControleMovimento classe="controle-giro" pausado={pausado} alternarMovimento={alternarMovimento} />
    </div>
  </section>;
}
