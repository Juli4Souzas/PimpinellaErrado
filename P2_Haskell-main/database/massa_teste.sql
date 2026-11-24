SET NAMES utf8mb4;
SET time_zone = '-03:00';

USE pimpinella;

START TRANSACTION;

SET @hoje = CURDATE();

INSERT INTO sabores (nome) VALUES
    ('Morango'),
    ('Chocolate'),
    ('Limão'),
    ('Manga'),
    ('Baunilha'),
    ('Coco'),
    ('Maracujá')
ON DUPLICATE KEY UPDATE id = sabores.id;

INSERT INTO lote (sabor_id, categoria_id, linha_id, quantidade, validade)
SELECT s.id, c.id, ln.id, amostra.quantidade,
       DATE_ADD(@hoje, INTERVAL amostra.dias DAY)
FROM (
    SELECT 1 AS ordem, 'Morango' AS sabor, 'Picolé' AS categoria,
           'Fruta' AS linha, 6 AS quantidade, 0 AS dias
    UNION ALL SELECT 2, 'Chocolate', 'Pote', 'Leite', 8, 0
    UNION ALL SELECT 3, 'Morango', 'Picolé', 'Fruta', 12, 4
    UNION ALL SELECT 4, 'Limão', 'Picolé', 'Fruta', 7, -2
    UNION ALL SELECT 5, 'Limão', 'Picolé', 'Fruta', 3, 8
    UNION ALL SELECT 6, 'Manga', 'Picolé', 'Fruta', 10, 3
    UNION ALL SELECT 7, 'Baunilha', 'Pote', 'Leite', 2, 1
    UNION ALL SELECT 8, 'Coco', 'Picolé', 'Leite', 0, 2
    UNION ALL SELECT 9, 'Coco', 'Pote', 'Leite', 4, 6
    UNION ALL SELECT 10, 'Maracujá', 'Pote', 'Fruta', 5, -1
    UNION ALL SELECT 11, 'Morango', 'Pote', 'Leite', 9, 10
    UNION ALL SELECT 12, 'Chocolate', 'Picolé', 'Leite', 14, 12
) AS amostra
JOIN sabores AS s ON s.nome = amostra.sabor
JOIN categoria AS c ON c.nome = amostra.categoria
JOIN linha AS ln ON ln.nome = amostra.linha
ORDER BY amostra.ordem;

COMMIT;
