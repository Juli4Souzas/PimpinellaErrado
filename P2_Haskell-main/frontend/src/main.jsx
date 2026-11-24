import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { fuso, hoje } from "./estoque";
import { buscarTudo } from "./api";
import { Marca, Nav, Rodape, paginas } from "./componentes";
import Vitrine from "./paginas/Vitrine";
import Estoque from "./paginas/Estoque";
import Cardapio from "./paginas/Cardapio";
import Editor from "./Editor";
import "./style.css";


function rotaAtual() {
  const rota = location.hash.slice(1);
  return [...paginas.map(([id]) => id), "estoque-vencidos"].includes(rota) ? rota : "vitrine";
}

function marcarAlteracoes(antes, depois) {
  const marcas = new Set();
  for (const [lista, prefixo] of [["lotes", "lote"], ["sabores", "sabor"], ["linhas", "linha"]]) {
    const anteriores = new Map(antes[lista].map(registro => [registro.id, JSON.stringify(registro)]));
    for (const registro of depois[lista]) {
      if (anteriores.get(registro.id) !== JSON.stringify(registro)) marcas.add(`${prefixo}:${registro.id}`);
    }
  }
  return marcas;
}

const semDados = { sabores: [], categorias: [], linhas: [], lotes: [] };

function App() {
  const [dados, setDados] = useState(semDados);
  const [rota, setRota] = useState(rotaAtual);
  const [editor, setEditor] = useState(null);
  const [aviso, setAviso] = useState("");
  const [marcas, setMarcas] = useState(() => new Set());
  
  // Pausa do prato de sorvete girando
  const [pausado, setPausado] = useState(false);
  const alternarMovimento = () => setPausado(valor => !valor);
  const tempoAviso = useRef();
  const tempoMarcas = useRef();
  const pagina = rota === "estoque-vencidos" ? "estoque" : rota;
  const data = hoje();

  useEffect(() => {
    function navegar() {
      setRota(rotaAtual());
      window.scrollTo(0, 0);
    }
    window.addEventListener("hashchange", navegar);
    return () => {
      window.removeEventListener("hashchange", navegar);
      clearTimeout(tempoAviso.current);
      clearTimeout(tempoMarcas.current);
    };
  }, []);

  function avisar(texto) {
    clearTimeout(tempoAviso.current);
    setAviso(texto);
    tempoAviso.current = setTimeout(() => setAviso(""), 3200);
  }

  function abrir(tipo, item) {
    if (tipo === "lote" && !item && (!dados.sabores.length || !dados.linhas.length)) {
      avisar("Cadastre um sabor e uma linha no Cardápio antes de criar um lote.");
      return;
    }
    setEditor({ tipo, item });
  }

  useEffect(() => {
    buscarTudo().then(setDados).catch(falha => avisar(falha.message));
  }, []);

  function concluir(resultado) {
    clearTimeout(tempoMarcas.current);
    setMarcas(marcarAlteracoes(dados, resultado));
    tempoMarcas.current = setTimeout(() => setMarcas(new Set()), 2800);
    setDados(resultado);
    setEditor(null);
    avisar("Alteração salva.");
  }

  return <div className={pausado ? "site movimento-pausado" : "site"} data-pagina={pagina}>
    <header className="limite cabecalho">
      <div className="identidade"><Marca /><span>Sorveteria Pinpinela</span></div>
      <Nav pagina={pagina} />
      <time dateTime={data}>{new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", timeZone: fuso }).format(new Date())}</time>
    </header>
    <main>
      {pagina === "vitrine" && <Vitrine dados={dados} data={data} pausado={pausado} alternarMovimento={alternarMovimento} />}
      {pagina === "estoque" && <Estoque key={rota} dados={dados} data={data} somenteVencidos={rota === "estoque-vencidos"} abrir={abrir} marcas={marcas} />}
      {pagina === "cardapio" && <Cardapio dados={dados} abrir={abrir} marcas={marcas} />}
    </main>
    <Rodape pagina={pagina} />
    {editor && <Editor editor={editor} dados={dados} fechar={() => setEditor(null)} concluir={concluir} />}
    <div className="aviso" role="status" hidden={!aviso}><span className="aviso-ponto" aria-hidden="true" />{aviso}</div>
  </div>;
}

createRoot(document.getElementById("root")).render(<App />);
