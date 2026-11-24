SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS pimpinella
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE pimpinella;

CREATE TABLE IF NOT EXISTS sabores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS linha (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lote (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sabor_id INT NOT NULL,
    categoria_id INT NOT NULL,
    linha_id INT NOT NULL,
    quantidade INT NOT NULL,
    validade DATE NOT NULL,
    FOREIGN KEY (sabor_id) REFERENCES sabores (id) ON DELETE RESTRICT,
    FOREIGN KEY (categoria_id) REFERENCES categoria (id) ON DELETE RESTRICT,
    FOREIGN KEY (linha_id) REFERENCES linha (id) ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

INSERT INTO categoria (nome) VALUES ('Picolé'), ('Pote');
INSERT INTO linha (nome) VALUES ('Fruta'), ('Leite');