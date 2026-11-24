FROM haskell:9.10-bookworm

# Bibliotecas mysql
RUN apt-get update && \
    apt-get install -y default-libmysqlclient-dev libpcre3-dev pkg-config && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Baixa e compila as dependências primeiro (fica em cache)
COPY stockeasy.cabal ./
RUN cabal update && cabal build --only-dependencies

COPY . .
RUN cabal build && cp $(cabal list-bin stockeasy) /usr/local/bin/stockeasy

EXPOSE 8080
CMD ["stockeasy"]
