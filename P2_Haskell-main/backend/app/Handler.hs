{-# LANGUAGE DataKinds #-}
{-# LANGUAGE TypeOperators #-}
{-# LANGUAGE TypeApplications #-}
{-# LANGUAGE OverloadedStrings #-}

module Handler where

import Control.Exception (bracket)
import Control.Monad (when)
import Control.Monad.Except (throwError)
import Control.Monad.IO.Class (liftIO)
import Data.Aeson (encode, object, (.=))
import Data.Proxy (Proxy (..))
import Data.Text (Text)
import qualified Data.Text as T
import Database.MySQL.Simple (ConnectInfo, Connection, close, connect)
import Network.Wai (Application)
import Servant
import Models
import Queries

type RotasCadastro =
       Get '[JSON] CadastrosResposta                                       -- GET    /api/sabores
  :<|> ReqBody '[JSON] Cadastro :> Post '[JSON] Resultado                  -- POST   /api/sabores
  :<|> Capture "id" Int :> ReqBody '[JSON] Cadastro :> Put '[JSON] NoContent -- PUT /api/sabores/:id
  :<|> Capture "id" Int :> Delete '[JSON] NoContent                        -- DELETE /api/sabores/:id

type API = "api" :>
  (    "categorias" :> Get '[JSON] CadastrosResposta
  :<|> "sabores"    :> RotasCadastro
  :<|> "linhas"     :> RotasCadastro
  :<|> "lotes" :> Get '[JSON] LotesResposta
  :<|> "lotes" :> Capture "id" Int :> Get '[JSON] Lote
  :<|> "lotes" :> ReqBody '[JSON] Lote :> Post '[JSON] Resultado
  :<|> "lotes" :> Capture "id" Int :> ReqBody '[JSON] Lote :> Put '[JSON] NoContent
  :<|> "lotes" :> Capture "id" Int :> Delete '[JSON] NoContent
  :<|> "lotes" :> Capture "id" Int :> "saida" :> ReqBody '[JSON] Saida :> Patch '[JSON] NoContent
  )

banco :: ConnectInfo -> (Connection -> IO a) -> Handler a
banco info acao = liftIO (bracket (connect info) close acao)


erro :: ServerError -> Text -> Handler a
erro codigo mensagem = throwError codigo
    { errBody    = encode (object ["erro" .= mensagem])
    , errHeaders = [("Content-Type", "application/json; charset=utf-8")]
    }


handlerCategorias :: ConnectInfo -> Handler CadastrosResposta
handlerCategorias info = handlerListar "categoria" info

handlerListar :: String -> ConnectInfo -> Handler CadastrosResposta
handlerListar tabela info = CadastrosResposta <$> banco info (\conn -> listarCadastros conn tabela)

handlerCriar :: String -> ConnectInfo -> Cadastro -> Handler Resultado
handlerCriar tabela info cadastro = do
    let novoNome = T.strip (nome cadastro)
    when (T.null novoNome) $ erro err400 "Informe o nome."
    repetido <- banco info (\conn -> nomeRepetido conn tabela 0 novoNome)
    when repetido $ erro err409 "Já existe um cadastro com esse nome."
    novoId <- banco info (\conn -> criarCadastro conn tabela novoNome)
    pure (Resultado novoId)

handlerEditar :: String -> ConnectInfo -> Int -> Cadastro -> Handler NoContent
handlerEditar tabela info ident cadastro = do
    let novoNome = T.strip (nome cadastro)
    when (T.null novoNome) $ erro err400 "Informe o nome."
    existe <- banco info (\conn -> existeCadastro conn tabela ident)
    when (not existe) $ erro err404 "Cadastro não encontrado."
    repetido <- banco info (\conn -> nomeRepetido conn tabela ident novoNome)
    when repetido $ erro err409 "Já existe um cadastro com esse nome."
   
    _ <- banco info (\conn -> editarCadastro conn tabela ident novoNome)
    pure NoContent

handlerExcluir :: String -> String -> ConnectInfo -> Int -> Handler NoContent
handlerExcluir tabela coluna info ident = do
    emUso <- banco info (\conn -> cadastroEmUso conn coluna ident)
    when emUso $ erro err409 "Este cadastro está vinculado a lotes e não pode ser excluído."
    apagadas <- banco info (\conn -> excluirCadastro conn tabela ident)
    if apagadas == 1
        then pure NoContent
        else erro err404 "Cadastro não encontrado."


handlerLotes :: ConnectInfo -> Handler LotesResposta
handlerLotes info = LotesResposta <$> banco info listarLotes

handlerLote :: ConnectInfo -> Int -> Handler Lote
handlerLote info ident = do
    encontrado <- banco info (\conn -> buscarLote conn ident)
    case encontrado of
        Just lote -> pure lote
        Nothing   -> erro err404 "Lote não encontrado."

validarLote :: ConnectInfo -> Int -> Lote -> Handler ()
validarLote info minimo lote = do
    when (quantidade lote < minimo) $ erro err400 "Confira a quantidade."
    valido <- banco info (\conn -> referenciasValidas conn lote)
    when (not valido) $ erro err400 "Selecione sabor, categoria e linha."

handlerCriarLote :: ConnectInfo -> Lote -> Handler Resultado
handlerCriarLote info lote = do
    validarLote info 1 lote
    novoId <- banco info (\conn -> criarLote conn lote)
    pure (Resultado novoId)

handlerEditarLote :: ConnectInfo -> Int -> Lote -> Handler NoContent
handlerEditarLote info ident lote = do
    _ <- handlerLote info ident
    validarLote info 0 lote
    _ <- banco info (\conn -> editarLote conn ident lote)
    pure NoContent

handlerExcluirLote :: ConnectInfo -> Int -> Handler NoContent
handlerExcluirLote info ident = do
    apagadas <- banco info (\conn -> excluirLote conn ident)
    if apagadas == 1
        then pure NoContent
        else erro err404 "Lote não encontrado."

handlerSaida :: ConnectInfo -> Int -> Saida -> Handler NoContent
handlerSaida info ident (Saida qtd) = do
    lote <- handlerLote info ident
    when (qtd < 1 || qtd > quantidade lote) $
        erro err400 "Informe uma quantidade dentro do saldo."
    alteradas <- banco info (\conn -> darSaida conn ident qtd)
    if alteradas == 1
        then pure NoContent
        else erro err400 "Informe uma quantidade dentro do saldo."


rotasCadastro :: String -> String -> ConnectInfo -> Server RotasCadastro
rotasCadastro tabela coluna info =
       handlerListar  tabela info
  :<|> handlerCriar   tabela info
  :<|> handlerEditar  tabela info
  :<|> handlerExcluir tabela coluna info

server :: ConnectInfo -> Server API
server info =
       handlerCategorias info
  :<|> rotasCadastro "sabores" "sabor_id" info
  :<|> rotasCadastro "linha"   "linha_id" info
  :<|> handlerLotes info
  :<|> handlerLote info
  :<|> handlerCriarLote info
  :<|> handlerEditarLote info
  :<|> handlerExcluirLote info
  :<|> handlerSaida info

app :: ConnectInfo -> Application
app info = serve (Proxy @API) (server info)
