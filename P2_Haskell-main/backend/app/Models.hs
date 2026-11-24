{-# LANGUAGE DeriveGeneric #-}

module Models where

import Data.Aeson
import Data.Text (Text)
import Data.Time.Calendar (Day)
import GHC.Generics (Generic)

opcoesJson :: Options
opcoesJson = defaultOptions { fieldLabelModifier = trocar }
  where
    trocar campo
        | campo == "idCadastro" || campo == "idLote" = "id"
        | otherwise = campo

data Cadastro = Cadastro
    { idCadastro :: Int
    , nome       :: Text
    } deriving (Show, Generic)

instance ToJSON Cadastro where
    toJSON = genericToJSON opcoesJson
instance FromJSON Cadastro where
    parseJSON = genericParseJSON opcoesJson

data Lote = Lote
    { idLote       :: Int
    , sabor_id     :: Int
    , categoria_id :: Int
    , linha_id     :: Int
    , quantidade   :: Int
    , validade     :: Day
    } deriving (Show, Generic)

instance ToJSON Lote where
    toJSON = genericToJSON opcoesJson
instance FromJSON Lote where
    parseJSON = genericParseJSON opcoesJson

newtype CadastrosResposta = CadastrosResposta
    { cadastros :: [Cadastro]
    } deriving (Show, Generic)

instance ToJSON CadastrosResposta

newtype LotesResposta = LotesResposta
    { lotes :: [Lote]
    } deriving (Show, Generic)

instance ToJSON LotesResposta

newtype Resultado = Resultado
    { resultado :: Int
    } deriving (Show, Generic)

instance ToJSON Resultado

newtype Saida = Saida
    { saida :: Int
    } deriving (Show, Generic)

instance FromJSON Saida
