module Main where

import Data.Maybe (fromMaybe)
import Database.MySQL.Simple (ConnectInfo (..), defaultConnectInfo)
import Network.Wai.Handler.Warp (run)
import System.Environment (lookupEnv)
import Handler (app)

main :: IO ()
main = do
    host  <- fromMaybe "127.0.0.1" <$> lookupEnv "DB_HOST"
    senha <- fromMaybe "stockeasy" <$> lookupEnv "DB_PASSWORD"
    let info = defaultConnectInfo
            { connectHost     = host
            , connectUser     = "stockeasy"
            , connectPassword = senha
            , connectDatabase = "pimpinella"
            }
    putStrLn "StockEasy API rodando em http://localhost:8080/api/lotes"
    run 8080 (app info)
