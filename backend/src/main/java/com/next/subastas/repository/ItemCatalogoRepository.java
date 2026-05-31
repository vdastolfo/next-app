package com.next.subastas.repository;

import com.next.subastas.model.ItemCatalogo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ItemCatalogoRepository extends JpaRepository<ItemCatalogo, Integer> {

    List<ItemCatalogo> findByCatalogo(Integer catalogoId);

    // Todos los ítems de una subasta específica
    @Query("""
        SELECT i FROM ItemCatalogo i
        JOIN Catalogo c ON c.identificador = i.catalogo
        WHERE c.subasta = :subastaId AND i.subastado = 'no'
        """)
    List<ItemCatalogo> findItemsActivosBySubasta(@Param("subastaId") Integer subastaId);

    // Buscar ítems por texto en la descripción del producto
    @Query("""
        SELECT i FROM ItemCatalogo i
        WHERE LOWER(i.producto.descripcionCatalogo) LIKE LOWER(CONCAT('%', :texto, '%'))
        OR LOWER(i.producto.descripcionCompleta) LIKE LOWER(CONCAT('%', :texto, '%'))
        """)
    List<ItemCatalogo> buscarPorTexto(@Param("texto") String texto);
}
