-- =============================================
-- SCRIPT DE CREACIÓN — SUBASTA DE PRUEBA
-- Categoría: COMÚN | Subastador: 3 | Dueño cliente: 31
--
-- Antes de correr: ajustá @fecha y @hora
-- según cuándo querés que arranque la subasta.
-- =============================================

DECLARE @fecha      DATE = CAST(GETDATE() AS DATE);  -- hoy por defecto
DECLARE @hora       TIME = '10:00:00';               -- hora de inicio

DECLARE @subastaId  INT;
DECLARE @catalogoId INT;
DECLARE @prod1Id    INT;
DECLARE @prod2Id    INT;
DECLARE @prod3Id    INT;
DECLARE @duenioId   INT = (
    SELECT TOP 1 d.identificador
    FROM duenios d
    JOIN clientes c ON c.persona = d.identificador
    WHERE c.identificador = 31
);

-- ── 1. Subasta ──────────────────────────────────────────────────────────────
INSERT INTO subastas (fecha, hora, estado, subastador, ubicacion,
                      capacidadAsistentes, tieneDeposito, seguridadPropia,
                      categoria, moneda, itemActivo)
VALUES (@fecha, @hora, 'abierta', 3,
        'Sala Principal — Next Subastas CABA',
        50, 'si', 'si', 'comun', 'pesos', NULL);

SET @subastaId = SCOPE_IDENTITY();

-- ── 2. Catálogo ─────────────────────────────────────────────────────────────
INSERT INTO catalogos (descripcion, subasta, responsable)
VALUES ('Catálogo Prueba Parcial', @subastaId, 3);

SET @catalogoId = SCOPE_IDENTITY();

-- ── 3. Productos ────────────────────────────────────────────────────────────
INSERT INTO productos (descripcionCatalogo, descripcionCompleta, revisor, duenio, disponible)
VALUES ('Reloj de bolsillo antiguo',
        'Reloj de bolsillo suizo circa 1920. Caja plateada con grabados florales. En perfecto estado de funcionamiento.',
        3, @duenioId, 'si');
SET @prod1Id = SCOPE_IDENTITY();

INSERT INTO productos (descripcionCatalogo, descripcionCompleta, revisor, duenio, disponible)
VALUES ('Pintura al óleo siglo XIX',
        'Óleo sobre tela representando paisaje pampeano. Marco original de madera tallada. Firmado por artista anónimo.',
        3, @duenioId, 'si');
SET @prod2Id = SCOPE_IDENTITY();

INSERT INTO productos (descripcionCatalogo, descripcionCompleta, revisor, duenio, disponible)
VALUES ('Biblioteca de roble macizo',
        'Mueble biblioteca de roble macizo, 6 estantes con puertas de vidrio biselado. Excelente estado de conservación.',
        3, @duenioId, 'si');
SET @prod3Id = SCOPE_IDENTITY();

-- ── 4. Ítems del catálogo ───────────────────────────────────────────────────
INSERT INTO itemsCatalogo (catalogo, producto, precioBase, comision, subastado, duracionSegundos, compradoPorEmpresa)
VALUES (@catalogoId, @prod1Id, 15000.00, 10.00, 'no', 60, 0);

INSERT INTO itemsCatalogo (catalogo, producto, precioBase, comision, subastado, duracionSegundos, compradoPorEmpresa)
VALUES (@catalogoId, @prod2Id, 28000.00, 10.00, 'no', 60, 0);

INSERT INTO itemsCatalogo (catalogo, producto, precioBase, comision, subastado, duracionSegundos, compradoPorEmpresa)
VALUES (@catalogoId, @prod3Id, 45000.00, 10.00, 'no', 60, 0);

-- ── Resumen ──────────────────────────────────────────────────────────────────
SELECT 'Subasta ID'            AS Entidad, @subastaId  AS ID, @fecha AS Fecha, CAST(@hora AS VARCHAR) AS Hora
UNION ALL SELECT 'Catálogo ID',    @catalogoId, NULL, NULL
UNION ALL SELECT 'Ítem 1 · Reloj', @prod1Id,    NULL, NULL
UNION ALL SELECT 'Ítem 2 · Pintura', @prod2Id,  NULL, NULL
UNION ALL SELECT 'Ítem 3 · Biblioteca', @prod3Id, NULL, NULL;
