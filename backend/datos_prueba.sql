-- ============================================================
-- DATOS DE PRUEBA — Next Subastas
-- Ejecutar UNA SOLA VEZ en SQL Server Management Studio
-- ============================================================

USE NextSubastas;
GO

-- ── 1. PERSONAS (propietarios de lotes) ──────────────────────

INSERT INTO personas (documento, nombre, apellido, direccion, estado)
VALUES ('20111222', 'Carlos', 'Mendoza', 'Av. Santa Fe 1234, Buenos Aires', 'activo');
DECLARE @p1 INT = SCOPE_IDENTITY();

INSERT INTO personas (documento, nombre, apellido, direccion, estado)
VALUES ('30444555', 'Ana', 'Villanueva', 'Calle Florida 890, Rosario', 'activo');
DECLARE @p2 INT = SCOPE_IDENTITY();

-- ── 2. DUEÑOS ────────────────────────────────────────────────

INSERT INTO duenios (identificador, numeroPais, verificacionFinanciera, verificacionJudicial, calificacionRiesgo, verificador)
VALUES (@p1, 54, 'si', 'si', 1, 1);

INSERT INTO duenios (identificador, numeroPais, verificacionFinanciera, verificacionJudicial, calificacionRiesgo, verificador)
VALUES (@p2, 54, 'si', 'si', 2, 1);

-- ── 3. SUBASTAS ──────────────────────────────────────────────

INSERT INTO subastas (fecha, hora, estado, subastador, ubicacion, capacidadAsistentes, tieneDeposito, seguridadPropia, categoria, moneda)
VALUES ('2026-07-15', '14:00:00', 'abierta', 1,
        'Palacio San José, Palermo, Buenos Aires', 200, 'si', 'si', 'comun', 'pesos');
DECLARE @sub1 INT = SCOPE_IDENTITY();

INSERT INTO subastas (fecha, hora, estado, subastador, ubicacion, capacidadAsistentes, tieneDeposito, seguridadPropia, categoria, moneda)
VALUES ('2026-07-20', '18:00:00', 'abierta', 1,
        'Hotel Alvear Palace, Buenos Aires', 80, 'si', 'si', 'oro', 'dolares');
DECLARE @sub2 INT = SCOPE_IDENTITY();

-- ── 4. CATÁLOGOS ─────────────────────────────────────────────

INSERT INTO catalogos (descripcion, subasta, responsable)
VALUES ('Catálogo Arte y Antigüedades — Julio 2026', @sub1, 1);
DECLARE @cat1 INT = SCOPE_IDENTITY();

INSERT INTO catalogos (descripcion, subasta, responsable)
VALUES ('Catálogo Relojería y Joyería de Lujo — Julio 2026', @sub2, 1);
DECLARE @cat2 INT = SCOPE_IDENTITY();

-- ── 5. PRODUCTOS ─────────────────────────────────────────────

INSERT INTO productos (fecha, disponible, descripcionCatalogo, descripcionCompleta, revisor, duenio)
VALUES (CAST(GETDATE() AS DATE), 'si',
  'Sillón Luis XV — Siglo XVIII',
  'Excepcional sillón de estilo Luis XV, Francia circa 1760. Estructura en madera de nogal tallada con motivos florales y de acantos. Tapizado en seda azul con bordados en hilo de oro. Conserva la tapicería original. Altura: 105 cm, Ancho: 72 cm, Profundidad: 65 cm.',
  1, @p1);
DECLARE @prod1 INT = SCOPE_IDENTITY();

INSERT INTO productos (fecha, disponible, descripcionCatalogo, descripcionCompleta, revisor, duenio)
VALUES (CAST(GETDATE() AS DATE), 'si',
  'Juego de Té Empire — Sèvres, 18 piezas',
  'Extraordinario juego de té de porcelana de Sèvres, período Empire (1804–1814). Decoración en azul cobalto con filetes dorados y medallones pintados a mano con escenas mitológicas. Cada pieza lleva la marca de la manufactura. Conservación excelente.',
  1, @p1);
DECLARE @prod2 INT = SCOPE_IDENTITY();

INSERT INTO productos (fecha, disponible, descripcionCatalogo, descripcionCompleta, revisor, duenio)
VALUES (CAST(GETDATE() AS DATE), 'si',
  'Patek Philippe Calatrava Ref. 96 — 1955',
  'Reloj de bolsillo Patek Philippe Calatrava, referencia 96, fabricado en 1955. Caja en oro amarillo 18K de 44 mm. Calibre 17" 200 con 18 rubíes. Esfera crema original con índices aplicados en oro. Funcionamiento perfecto. Con caja y documentación originales.',
  1, @p2);
DECLARE @prod3 INT = SCOPE_IDENTITY();

INSERT INTO productos (fecha, disponible, descripcionCatalogo, descripcionCompleta, revisor, duenio)
VALUES (CAST(GETDATE() AS DATE), 'si',
  'Vajilla Art Déco — Limoges, 24 piezas',
  'Vajilla completa de porcelana de Limoges, estilo Art Déco, circa 1925. Decoración geométrica en negro, dorado y carmín. Firma de la manufactura en la base de cada pieza. Ideal para coleccionistas o mesa de gala.',
  1, @p2);
DECLARE @prod4 INT = SCOPE_IDENTITY();

INSERT INTO productos (fecha, disponible, descripcionCatalogo, descripcionCompleta, revisor, duenio)
VALUES (CAST(GETDATE() AS DATE), 'si',
  'La Cosecha — Óleo sobre lienzo, F. Molina 1943',
  'Óleo sobre lienzo de Fernando Molina, fechado 1943. Escena rural pampeana de gran formato (120 × 180 cm). Excelente estado de conservación. Marco en madera de cedro. Incluye certificado de autenticidad.',
  1, @p1);
DECLARE @prod5 INT = SCOPE_IDENTITY();

-- ── 6. PIEZAS ────────────────────────────────────────────────

-- Sillón: 1 pieza
INSERT INTO piezas (producto, descripcion, cantidad) VALUES (@prod1, 'Sillón', 1);

-- Juego de té: 18 unidades (1+6+6+1+1+1+2)
INSERT INTO piezas (producto, descripcion, cantidad) VALUES (@prod2, 'Tetera',          1);
INSERT INTO piezas (producto, descripcion, cantidad) VALUES (@prod2, 'Taza de té',      6);
INSERT INTO piezas (producto, descripcion, cantidad) VALUES (@prod2, 'Platillo',        6);
INSERT INTO piezas (producto, descripcion, cantidad) VALUES (@prod2, 'Azucarera',       1);
INSERT INTO piezas (producto, descripcion, cantidad) VALUES (@prod2, 'Lechera',         1);
INSERT INTO piezas (producto, descripcion, cantidad) VALUES (@prod2, 'Bandeja',         1);
INSERT INTO piezas (producto, descripcion, cantidad) VALUES (@prod2, 'Taza de café',    2);

-- Reloj: 2 piezas
INSERT INTO piezas (producto, descripcion, cantidad) VALUES (@prod3, 'Reloj de bolsillo',  1);
INSERT INTO piezas (producto, descripcion, cantidad) VALUES (@prod3, 'Cadena de oro 18K',  1);

-- Vajilla: 24 unidades (6+6+6+6)
INSERT INTO piezas (producto, descripcion, cantidad) VALUES (@prod4, 'Plato playo',    6);
INSERT INTO piezas (producto, descripcion, cantidad) VALUES (@prod4, 'Plato hondo',    6);
INSERT INTO piezas (producto, descripcion, cantidad) VALUES (@prod4, 'Plato de postre',6);
INSERT INTO piezas (producto, descripcion, cantidad) VALUES (@prod4, 'Taza con plato', 6);

-- Pintura: 1 pieza
INSERT INTO piezas (producto, descripcion, cantidad) VALUES (@prod5, 'Óleo sobre lienzo enmarcado', 1);

-- ── 7. FOTOS ─────────────────────────────────────────────────
-- Placeholder: cabecera JPEG válida (FFD8) + fin JPEG (FFD9)
-- No se renderiza como imagen real. Reemplazar con imágenes
-- reales cuando se implemente el endpoint de carga (POST /fotos/upload).
DECLARE @foto VARBINARY(MAX) = 0xFFD8FFE000104A46494600010100000100010000FFD9;

INSERT INTO fotos (producto, foto) VALUES (@prod1, @foto);
INSERT INTO fotos (producto, foto) VALUES (@prod1, @foto);
INSERT INTO fotos (producto, foto) VALUES (@prod1, @foto);

INSERT INTO fotos (producto, foto) VALUES (@prod2, @foto);
INSERT INTO fotos (producto, foto) VALUES (@prod2, @foto);
INSERT INTO fotos (producto, foto) VALUES (@prod2, @foto);
INSERT INTO fotos (producto, foto) VALUES (@prod2, @foto);
INSERT INTO fotos (producto, foto) VALUES (@prod2, @foto);

INSERT INTO fotos (producto, foto) VALUES (@prod3, @foto);
INSERT INTO fotos (producto, foto) VALUES (@prod3, @foto);
INSERT INTO fotos (producto, foto) VALUES (@prod3, @foto);
INSERT INTO fotos (producto, foto) VALUES (@prod3, @foto);
INSERT INTO fotos (producto, foto) VALUES (@prod3, @foto);
INSERT INTO fotos (producto, foto) VALUES (@prod3, @foto);

INSERT INTO fotos (producto, foto) VALUES (@prod4, @foto);
INSERT INTO fotos (producto, foto) VALUES (@prod4, @foto);
INSERT INTO fotos (producto, foto) VALUES (@prod4, @foto);

INSERT INTO fotos (producto, foto) VALUES (@prod5, @foto);
INSERT INTO fotos (producto, foto) VALUES (@prod5, @foto);
INSERT INTO fotos (producto, foto) VALUES (@prod5, @foto);
INSERT INTO fotos (producto, foto) VALUES (@prod5, @foto);
INSERT INTO fotos (producto, foto) VALUES (@prod5, @foto);
INSERT INTO fotos (producto, foto) VALUES (@prod5, @foto);

-- ── 8. ÍTEMS DEL CATÁLOGO ────────────────────────────────────

INSERT INTO itemsCatalogo (catalogo, producto, precioBase, comision, subastado)
VALUES (@cat1, @prod1,  85000.00, 0.12, 'no');

INSERT INTO itemsCatalogo (catalogo, producto, precioBase, comision, subastado)
VALUES (@cat1, @prod2,  42000.00, 0.12, 'no');

INSERT INTO itemsCatalogo (catalogo, producto, precioBase, comision, subastado)
VALUES (@cat2, @prod3, 180000.00, 0.15, 'no');

INSERT INTO itemsCatalogo (catalogo, producto, precioBase, comision, subastado)
VALUES (@cat1, @prod4,  28000.00, 0.12, 'no');

INSERT INTO itemsCatalogo (catalogo, producto, precioBase, comision, subastado)
VALUES (@cat1, @prod5,  95000.00, 0.12, 'no');

-- ── 9. ASISTENTES ────────────────────────────────────────────
-- Inscribe tu usuario de prueba en ambas subastas.
-- REEMPLAZÁ 'tu@email.com' con el email con el que te registraste.

DECLARE @cliente_id INT = (
    SELECT c.identificador
    FROM clientes c
    INNER JOIN usuariosApp u ON u.cliente = c.identificador
    WHERE u.email = 'tu@email.com'
);

IF @cliente_id IS NOT NULL
BEGIN
    INSERT INTO asistentes (numeroPostor, cliente, subasta) VALUES (1, @cliente_id, @sub1);
    INSERT INTO asistentes (numeroPostor, cliente, subasta) VALUES (1, @cliente_id, @sub2);
    PRINT 'Usuario inscrito en ambas subastas correctamente.';
END
ELSE
    PRINT 'ATENCIÓN: no se encontró el usuario. Verificá el email en la línea 9.';

-- ── VERIFICACIÓN ─────────────────────────────────────────────
SELECT 'Productos'  AS Tabla, COUNT(*) AS Total FROM productos
UNION ALL SELECT 'Piezas',      COUNT(*) FROM piezas
UNION ALL SELECT 'Fotos',       COUNT(*) FROM fotos
UNION ALL SELECT 'Items',       COUNT(*) FROM itemsCatalogo
UNION ALL SELECT 'Subastas',    COUNT(*) FROM subastas
UNION ALL SELECT 'Catalogos',   COUNT(*) FROM catalogos
UNION ALL SELECT 'Asistentes',  COUNT(*) FROM asistentes;
