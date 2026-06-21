-- =============================================
-- RESET DE PUJAS PARA UNA SUBASTA REABIERTA
-- Ejecutar ANTES de empezar una demo nueva
-- en una subasta que ya tuvo una ronda anterior.
--
-- Reemplazá @subastaId con el ID de la subasta.
-- =============================================

DECLARE @subastaId INT = 0;  -- <-- CAMBIAR ESTE VALOR

IF @subastaId = 0
BEGIN
    PRINT 'ERROR: Asigná el ID de la subasta en @subastaId antes de ejecutar.';
    RETURN;
END;

-- 1. Borrar todas las pujas de esa subasta (de cualquier ronda anterior)
DELETE FROM pujos
WHERE item IN (
    SELECT ic.identificador
    FROM itemsCatalogo ic
    JOIN catalogos c ON c.identificador = ic.catalogo
    WHERE c.subasta = @subastaId
);

-- 2. Resetear ítems vendidos para que vuelvan a estar disponibles
UPDATE itemsCatalogo
SET subastado = 'no', compradoPorEmpresa = 0
WHERE catalogo IN (
    SELECT identificador FROM catalogos WHERE subasta = @subastaId
);

-- 3. Limpiar itemActivo y fechaFin de la subasta para que el scheduler arranque limpio
UPDATE subastas
SET itemActivo = NULL, fechaFin = NULL, estado = 'abierta'
WHERE identificador = @subastaId;

-- Resultado
SELECT
    'Pujas borradas:' AS Info,
    (SELECT COUNT(*) FROM pujos
     WHERE item IN (
         SELECT ic.identificador FROM itemsCatalogo ic
         JOIN catalogos c ON c.identificador = ic.catalogo
         WHERE c.subasta = @subastaId
     )) AS Cantidad
UNION ALL
SELECT 'Subasta lista', @subastaId;

PRINT 'Reset completado. El scheduler iniciará el primer ítem automáticamente.';
