package com.next.subastas.repository;

import com.next.subastas.model.Pujo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface PujoRepository extends JpaRepository<Pujo, Integer> {

    // La mejor puja actual de un ítem
    @Query("""
        SELECT p FROM Pujo p
        WHERE p.item.identificador = :itemId
        ORDER BY p.importe DESC
        """)
    List<Pujo> findByItemOrderByImporteDesc(@Param("itemId") Integer itemId);

    // Pujas no ganadoras del usuario en ítems aún activos de subastas abiertas (ordenadas mayor importe primero)
    @Query("""
        SELECT p FROM Pujo p
        WHERE p.asistente.cliente.identificador = :clienteId
        AND p.asistente.subasta.estado = 'abierta'
        AND p.ganador = 'no'
        AND p.item.subastado = 'no'
        ORDER BY p.importe DESC
        """)
    List<Pujo> findPujasActivasByCliente(@Param("clienteId") Integer clienteId);

    // Pujas ganadas por el usuario
    @Query("""
        SELECT p FROM Pujo p
        WHERE p.asistente.cliente.identificador = :clienteId
        AND p.ganador = 'si'
        ORDER BY p.fechaHora DESC
        """)
    List<Pujo> findPujasGanadasByCliente(@Param("clienteId") Integer clienteId);

    // La puja más alta de un ítem (para validaciones)
    default Optional<Pujo> findMejorPujaByItem(Integer itemId) {
        return findByItemOrderByImporteDesc(itemId).stream().findFirst();
    }

    // Pujas ganadoras de un ítem (ganador='si')
    @Query("""
        SELECT p FROM Pujo p
        WHERE p.item.identificador = :itemId
        AND p.ganador = 'si'
        """)
    List<Pujo> findPujasGanadoras(@Param("itemId") Integer itemId);
}
