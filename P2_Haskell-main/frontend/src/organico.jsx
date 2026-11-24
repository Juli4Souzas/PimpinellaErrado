import React from "react";

const n2 = valor => valor.toFixed(2);

function curvaFechada(pontos) {
  const total = pontos.length;
  let d = `M${n2(pontos[0][0])} ${n2(pontos[0][1])}`;
  for (let i = 0; i < total; i++) {
    const [x0, y0] = pontos[(i - 1 + total) % total];
    const [x1, y1] = pontos[i];
    const [x2, y2] = pontos[(i + 1) % total];
    const [x3, y3] = pontos[(i + 2) % total];
    d += `C${n2(x1 + (x2 - x0) / 6)} ${n2(y1 + (y2 - y0) / 6)} ${n2(x2 - (x3 - x1) / 6)} ${n2(y2 - (y3 - y1) / 6)} ${n2(x2)} ${n2(y2)}`;
  }
  return `${d}Z`;
}

// Forma líquida no quadro 0–100. `t` escolhe o desenho do contorno (cada `sem` dá uma forma diferente).
export function formaBlob(t, { pontos = 7, amp = .16, vel = .0005, sem = 1 } = {}) {
  const contorno = [];
  for (let i = 0; i < pontos; i++) {
    const angulo = (i / pontos) * Math.PI * 2;
    const a = Math.sin(t * vel * (1 + (i % 3) * .37) + sem * 3.1 + i * 1.7);
    const b = Math.sin(t * vel * .63 * (1 + (i % 2) * .5) + sem * 5.3 + i * 2.9);
    const raio = 40 * (1 + amp * (.6 * a + .4 * b));
    contorno.push([50 + Math.cos(angulo) * raio, 50 + Math.sin(angulo) * raio]);
  }
  return curvaFechada(contorno);
}


export function Blob({ cor = "ouro", className = "", style, pontos = 7, amp = .16, vel = .0005, sem = 1 }) {
  const d = formaBlob(sem * 2300, { pontos, amp, vel, sem });
  return <svg className={`blob ${className}`} style={style} viewBox="0 0 100 100"
    preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <path d={d} style={{ fill: `var(--${cor})` }} />
  </svg>;
}

const contornoProposito = formaBlob(1100, { pontos: 8, amp: .16, vel: .00055, sem: 2 });

export function MascaraProposito() {
  return <svg className="mascaras" width="0" height="0" aria-hidden="true" focusable="false">
    <defs>
      <clipPath id="mascara-proposito" clipPathUnits="objectBoundingBox">
        <path d={contornoProposito} transform="translate(-0.068 -0.068) scale(0.01136)" />
      </clipPath>
    </defs>
  </svg>;
}


const LARGURA = 1440;
const ALTURA = 120;
const PASSO = 24;
const posicoesGotas = [.11, .29, .47, .66, .83];

function alturaOnda(x, t, lado, amplitude = 1) {
  const base = lado === "cima" ? 60 : 30;
  return base + amplitude * (20 * Math.sin(x / 210 + t * .00055) + 10 * Math.sin(x / 83 - t * .00085));
}

function caminhoOnda(t, lado, amplitude) {
  let d = lado === "cima" ? `M0 ${ALTURA}` : "M0 0";
  for (let x = 0; x <= LARGURA; x += PASSO) d += `L${x} ${n2(alturaOnda(x, t, lado, amplitude))}`;
  return `${d}L${LARGURA} ${lado === "cima" ? ALTURA : 0}Z`;
}

function comprimentoGota(indice, t) {
  const fase = Math.sin(t * .00042 + indice * 2.1);
  return 10 + 30 * (.5 + .5 * fase);
}

export function Divisor({ cor = "rosa", lado = "cima", gotas = 0, amplitude = 1 }) {
  const t = lado === "cima" ? 900 : 3400;
  const quantidade = lado === "baixo" ? Math.min(gotas, posicoesGotas.length) : 0;
  return <svg className={`divisor divisor-${lado} divisor-${cor}`} viewBox={`0 0 ${LARGURA} ${ALTURA}`}
    preserveAspectRatio={lado === "cima" ? "xMidYMax slice" : "xMidYMin slice"} aria-hidden="true" focusable="false">
    <path d={caminhoOnda(t, lado, amplitude)} />
    {Array.from({ length: quantidade }, (_, i) => {
      const x = posicoesGotas[i] * LARGURA;
      const topo = alturaOnda(x, t, lado, amplitude) - 4;
      const ponta = alturaOnda(x, t, lado, amplitude) + comprimentoGota(i, t);
      return <g key={i}>
        <line x1={x} x2={x} y1={n2(topo)} y2={n2(ponta)} />
        <circle cx={x} cy={n2(ponta)} r="11" />
      </g>;
    })}
  </svg>;
}

function Traco({ d }) {
  return <path d={d} />;
}

export function Ramo({ className = "" }) {
  return <svg className={`linha ${className}`} viewBox="0 0 150 170" aria-hidden="true" focusable="false">
    <Traco d="M24 164c19-28 47-57 72-72 16-9 24-22 26-42M62 120c-4-27-14-45-27-62m43 48c14 1 34 3 44 16" />
    <Traco d="M95 92c-1-24 13-50 27-68 7 28-1 53-27 68Zm-47-15C26 76 13 54 13 19c23 10 40 34 35 58Zm16 45c-23 9-43 3-60-11 19-9 45-10 60 11Zm33-13c14-8 35-4 47 13-16 10-36 5-47-13Z" />
    <Traco d="M38 61 20 33m31 86-31-7m92 1 21 7m-30-41 14-38" />
    <Traco d="M74 113c-11 7-18 29-9 42 7 5 24-3 34-12 9-8 1-22-9-26l-10 3-6-7Zm2 2 4-9 8 9 10-1-8 7" />
    <Traco d="m72 134 2 3m11-4 2 2m-13 10 2 2m17-9 2 2" />
  </svg>;
}

export function Limao({ className = "" }) {
  const cunhas = Array.from({ length: 10 }, (_, i) => {
    const a = (i * 36 + 18) * Math.PI / 180;
    const ponto = r => `${n2(60 + Math.cos(a) * r)} ${n2(60 + Math.sin(a) * r)}`;
    return `M${ponto(7)}L${ponto(40)}`;
  }).join("");
  const fibras = Array.from({ length: 10 }, (_, i) => {
    const a = (i * 36) * Math.PI / 180;
    const ponto = r => `${n2(60 + Math.cos(a) * r)} ${n2(60 + Math.sin(a) * r)}`;
    return `M${ponto(24)}L${ponto(35)}`;
  }).join("");
  return <svg className={`linha ${className}`} viewBox="0 0 138 120" aria-hidden="true" focusable="false">
    <Traco d="M112 60a52 52 0 1 1-104 0a52 52 0 1 1 104 0Z" />
    <Traco d="M105 60a45 45 0 1 1-90 0a45 45 0 1 1 90 0Z" />
    <Traco d={cunhas} />
    <Traco d={fibras} />
    <Traco d="M92 22C104 8 123 7 131 14C124 29 104 31 92 22ZM96 20C108 16 118 15 126 15" />
  </svg>;
}

export function Picole({ className = "" }) {
  return <svg className={`linha ${className}`} viewBox="0 0 70 150" aria-hidden="true" focusable="false">
    <Traco d="M10 52C10 14 60 14 60 52V94C60 102 55 106 49 106H21C15 106 10 102 10 94Z" />
    <Traco d="M29 106V138C29 144 41 144 41 138V106" />
    <Traco d="M20 40C20 31 27 26 35 25" />
    <Traco d="M23 62V88M35 58V92M47 62V88" />
  </svg>;
}

export function Morango({ className = "" }) {
  return <svg className={`linha ${className}`} viewBox="0 0 110 120" aria-hidden="true" focusable="false">
    <Traco d="M55 30C26 26 8 50 20 80C28 98 44 110 55 114C66 110 82 98 90 80C102 50 84 26 55 30Z" />
    <Traco d="M55 30C44 30 34 24 30 14C42 14 51 20 55 30ZM55 30C66 30 76 24 80 14C68 14 59 20 55 30ZM55 30C52 22 52 14 55 6C58 14 58 22 55 30Z" />
    <Traco d="M38 52v4M55 50v4M72 52v4M30 70v4M46 68v4M64 68v4M80 70v4M40 86v4M55 88v4M70 86v4" />
  </svg>;
}

export function Rabisco({ className = "" }) {
  return <svg className={`linha ${className}`} viewBox="0 0 220 14" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <Traco d="M3 9C30 2 52 12 80 6S130 3 158 8 200 4 217 7" />
  </svg>;
}

export function Seta() {
  return <svg className="seta" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>;
}
