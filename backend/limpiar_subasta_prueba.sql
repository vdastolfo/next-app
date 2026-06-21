-- =============================================
-- SCRIPT DE LIMPIEZA — SUBASTA DE PRUEBA
-- Borra en orden inverso de FK todo lo creado
-- por crear_subasta_prueba.sql
-- =============================================

DECLARE @catalogoId INT = (
    SELECT identificador FROM catalogos
    WHERE descripcion = 'Catálogo Prueba Parcial'
);
DECLARE @subastaId INT = (
    SELECT subasta FROM catalogos
    WHERE identificador = @catalogoId
);

-- Verificación previa
IF @subastaId IS NULL
BEGIN
    PRINT 'No se encontró la subasta de prueba. ¿Ya fue borrada?';
    RETURN;
END;

PRINT 'Borrando subasta ID: ' + CAST(@subastaId AS VARCHAR);

-- 1. Pujas sobre los ítems de esta subasta
DELETE FROM pujos
WHERE item IN (
    SELECT identificador FROM itemsCatalogo
    WHERE catalogo = @catalogoId
);

-- 2. Asistentes de esta subasta
DELETE FROM asistentes
WHERE subasta = @subastaId;

-- 3. Ítems del catálogo (y sus FKs resueltas ya arriba)
DELETE FROM itemsCatalogo
WHERE catalogo = @catalogoId;

-- 4. Productos de prueba (los 3 con esas descripciones exactas)
DELETE FROM productos
WHERE descripcionCompleta IN (
    'Reloj de bolsillo suizo circa 1920. Caja plateada con grabados florales. En perfecto estado de funcionamiento.',
    'Óleo sobre tela representando paisaje pampeano. Marco original de madera tallada. Firmado por artista anónimo.',
    'Mueble biblioteca de roble macizo, 6 estantes con puertas de vidrio biselado. Excelente estado de conservación.'
);

-- 5. Catálogo
DELETE FROM catalogos
WHERE identificador = @catalogoId;

-- 6. Subasta
DELETE FROM subastas
WHERE identificador = @subastaId;

PRINT 'Limpieza completada correctamente.';
