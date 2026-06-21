package com.next.subastas.repository;

import com.next.subastas.model.ItemCatalogo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ItemCatalogoRepository extends JpaRepository<ItemCatalogo, Integer> {

    List<ItemCatalogo> findByCatalogo(Integer catalogoId);

    // Ítems pendientes de subasta (para el scheduler y lógica de avance)
    @Query("""
        SELECT i FROM ItemCatalogo i
        JOIN Catalogo c ON c.identificador = i.catalogo
        WHERE c.subasta = :subastaId AND i.subastado = 'no'
        ORDER BY i.identificador ASC
        """)
    List<ItemCatalogo> findItemsActivosBySubasta(@Param("subastaId") Integer subastaId);

    // Todos los ítems de una subasta (incluyendo vendidos, para el catálogo)
    @Query("""
        SELECT i FROM ItemCatalogo i
        JOIN Catalogo c ON c.identificador = i.catalogo
        WHERE c.subasta = :subastaId
        ORDER BY i.identificador ASC
        """)
    List<ItemCatalogo> findAllItemsBySubasta(@Param("subastaId") Integer subastaId);

    @Query("""
        SELECT COUNT(i) FROM ItemCatalogo i
        JOIN Catalogo c ON c.identificador = i.catalogo
        WHERE c.subasta = :subastaId
        """)
    long countItemsActivosBySubasta(@Param("subastaId") Integer subastaId);

    @Query("""
        SELECT COUNT(i) FROM ItemCatalogo i
        JOIN Catalogo c ON c.identificador = i.catalogo
        WHERE c.subasta = :subastaId AND i.subastado = 'si'
        """)
    long countVendidosBySubasta(@Param("subastaId") Integer subastaId);

    // Todos los ítems de varias subastas (para el home del usuario)
    @Query("""
        SELECT i FROM ItemCatalogo i
        JOIN Catalogo c ON c.identificador = i.catalogo
        WHERE c.subasta IN :subastaIds AND i.subastado = 'no'
        """)
    List<ItemCatalogo> findItemsActivosBySubastas(@Param("subastaIds") List<Integer> subastaIds);

    // Buscar ítems por texto en la descripción del producto
    @Query("""
        SELECT i FROM ItemCatalogo i
        WHERE LOWER(i.producto.descripcionCatalogo) LIKE LOWER(CONCAT('%', :texto, '%'))
        OR LOWER(i.producto.descripcionCompleta) LIKE LOWER(CONCAT('%', :texto, '%'))
        """)
    List<ItemCatalogo> buscarPorTexto(@Param("texto") String texto);
}
