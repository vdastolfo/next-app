package com.next.subastas.repository;

import com.next.subastas.model.Subasta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface SubastaRepository extends JpaRepository<Subasta, Integer> {

    List<Subasta> findByEstado(String estado);

    List<Subasta> findByEstadoAndCategoria(String estado, String categoria);

    @Modifying
    @Transactional
    @Query("UPDATE Subasta s SET s.estado = :estado WHERE s.identificador = :id")
    void updateEstado(@Param("id") Integer id, @Param("estado") String estado);

    @Modifying
    @Transactional
    @Query("UPDATE Subasta s SET s.itemActivo = :itemActivo, s.fechaFin = :fechaFin WHERE s.identificador = :id")
    void updateItemActivoAndFechaFin(@Param("id") Integer id, @Param("itemActivo") Integer itemActivo, @Param("fechaFin") java.time.LocalDateTime fechaFin);

    // Subastas accesibles para una categoría de usuario
    // Un usuario puede ver subastas cuya categoría sea <= a la suya
    @Query(value = """
        SELECT * FROM subastas
        WHERE estado IN ('abierta', 'cerrada')
        AND categoria IN (
            SELECT c.categoria FROM (
                VALUES ('comun'),('especial'),('plata'),('oro'),('platino')
            ) AS c(categoria)
            WHERE CHARINDEX(c.categoria,
                SUBSTRING('comun,especial,plata,oro,platino', 1,
                    CHARINDEX(:categoria, 'comun,especial,plata,oro,platino')
                    + LEN(:categoria) - 1
                )
            ) > 0
        )
        """, nativeQuery = true)
    List<Subasta> findAccesiblesByCategoria(@Param("categoria") String categoria);
}
