-- =============================================
-- DATOS DE PRUEBA - NextSubastas
-- =============================================

-- 1. Persona (dueño del producto)
INSERT INTO personas (documento, nombre, direccion, estado)
VALUES ('99999999', 'Casa de Subastas Next', 'Av. Corrientes 1234, CABA', 'activo');

DECLARE @personaId INT = SCOPE_IDENTITY();

-- 2. Dueño
INSERT INTO duenios (identificador, numeroPais, verificacionFinanciera, verificacionJudicial, calificacionRiesgo, verificador)
VALUES (@personaId, 54, 'si', 'si', 1, 1);

-- 3. Subasta
INSERT INTO subastas (fecha, hora, estado, subastador, ubicacion, capacidadAsistentes, tieneDeposito, seguridadPropia, categoria, moneda)
VALUES ('2026-06-30', '19:00:00', 'activa', 1, 'Av. Alvear 1891, Recoleta, CABA', 200, 'si', 'si', 'arte', 'pesos');

DECLARE @subastaId INT = SCOPE_IDENTITY();

-- 4. Catálogo
INSERT INTO catalogos (subasta)
VALUES (@subastaId);

DECLARE @catalogoId INT = SCOPE_IDENTITY();

-- 5. Productos e Items
-- Producto 1
INSERT INTO productos (fecha, disponible, descripcionCatalogo, descripcionCompleta, revisor, duenio)
VALUES ('2026-01-15', 'si', 'Arte contemporáneo argentino', 'Obra neo-abstracta del artista Marcos Zucker. Técnica mixta sobre tela, 120x90cm. Certificado de autenticidad incluido.', 1, @personaId);

DECLARE @prod1 INT = SCOPE_IDENTITY();

INSERT INTO itemsCatalogo (catalogo, producto, precioBase, comision, subastado)
VALUES (@catalogoId, @prod1, 10000.00, 500.00, 'no');

-- Producto 2
INSERT INTO productos (fecha, disponible, descripcionCatalogo, descripcionCompleta, revisor, duenio)
VALUES ('2026-02-10', 'si', 'Relojería suiza de colección', 'Reloj Chronos Heirloom, edición limitada 1978. Caja de oro 18k, movimiento manual. Uno de 50 ejemplares en el mundo.', 1, @personaId);

DECLARE @prod2 INT = SCOPE_IDENTITY();

INSERT INTO itemsCatalogo (catalogo, producto, precioBase, comision, subastado)
VALUES (@catalogoId, @prod2, 45000.00, 2250.00, 'no');

-- Producto 3
INSERT INTO productos (fecha, disponible, descripcionCatalogo, descripcionCompleta, revisor, duenio)
VALUES ('2026-03-05', 'si', 'Joyería de alta gama', 'Collar Art Déco con diamantes talla brillante y esmeraldas colombianas. Diseño original de los años 30, certificación GIA.', 1, @personaId);

DECLARE @prod3 INT = SCOPE_IDENTITY();

INSERT INTO itemsCatalogo (catalogo, producto, precioBase, comision, subastado)
VALUES (@catalogoId, @prod3, 28000.00, 1400.00, 'no');

-- Producto 4
INSERT INTO productos (fecha, disponible, descripcionCatalogo, descripcionCompleta, revisor, duenio)
VALUES ('2026-03-20', 'si', 'Tecnología vintage', 'Computadora Apple I original (1976), una de las 200 unidades ensambladas por Steve Wozniak. Estado de conservación excepcional.', 1, @personaId);

DECLARE @prod4 INT = SCOPE_IDENTITY();

INSERT INTO itemsCatalogo (catalogo, producto, precioBase, comision, subastado)
VALUES (@catalogoId, @prod4, 120000.00, 6000.00, 'no');

-- Producto 5
INSERT INTO productos (fecha, disponible, descripcionCatalogo, descripcionCompleta, revisor, duenio)
VALUES ('2026-04-01', 'si', 'Moda de alta costura', 'Vestido Balenciaga haute couture, temporada primavera 1962. Seda francesa, bordado artesanal. Pieza de museo en perfecto estado.', 1, @personaId);

DECLARE @prod5 INT = SCOPE_IDENTITY();

INSERT INTO itemsCatalogo (catalogo, producto, precioBase, comision, subastado)
VALUES (@catalogoId, @prod5, 18000.00, 900.00, 'no');

PRINT 'Datos de prueba insertados correctamente.';
