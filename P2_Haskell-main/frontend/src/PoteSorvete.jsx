import React, { useEffect, useRef, useState } from "react";

const largura = 224;
const altura = 266;
const colunas = 10;
const totalQuadros = 120;
const msPorQuadro = 50;

export default function PoteSorvete({ pausado }) {
  const tela = useRef(null);
  const quadro = useRef(0);
  const [renderizada, setRenderizada] = useState(false);

  useEffect(() => {
    if (pausado) return;
    const contexto = tela.current.getContext("2d");
    if (!contexto) return;

    const vistas = new Image();
    let animacao;
    let anterior;
    let acumulado = 0;

    function desenhar() {
      const x = quadro.current % colunas * largura;
      const y = Math.floor(quadro.current / colunas) * altura;
      contexto.clearRect(0, 0, largura, altura);
      contexto.drawImage(vistas, x, y, largura, altura, 0, 0, largura, altura);
    }

    function avancar(tempo) {
      if (anterior !== undefined) acumulado += Math.min(tempo - anterior, 150);
      anterior = tempo;
      if (acumulado >= msPorQuadro) {
        const passos = Math.floor(acumulado / msPorQuadro);
        acumulado %= msPorQuadro;
        quadro.current = (quadro.current + passos) % totalQuadros;
        desenhar();
      }
      animacao = requestAnimationFrame(avancar);
    }

    vistas.onload = () => {
      desenhar();
      setRenderizada(true);
      animacao = requestAnimationFrame(avancar);
    };
    vistas.src = "/assets/pote-sorvete-giro.webp";

    return () => {
      vistas.onload = null;
      cancelAnimationFrame(animacao);
    };
  }, [pausado]);

  return <figure className="pote-sorvete" role="img" aria-label="Pote de sorvete de morango em 3D">
    <canvas ref={tela} width={largura} height={altura} className={renderizada ? "" : "sem-render"} aria-hidden="true"/>
    {!renderizada && <img src="/assets/pote-sorvete.webp" width={largura} height={altura} alt=""/>}
  </figure>;
}
