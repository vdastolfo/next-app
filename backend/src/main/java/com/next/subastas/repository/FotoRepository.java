package com.next.subastas.repository;

import com.next.subastas.model.Foto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface FotoRepository extends JpaRepository<Foto, Integer> {

    @Query("SELECT f.identificador FROM Foto f WHERE f.producto.identificador = :productoId")
    List<Integer> findIdsByProductoIdentificador(@Param("productoId") Integer productoId);

    @Query("SELECT f FROM Foto f WHERE f.producto.identificador = :productoId")
    List<Foto> findAllByProductoIdentificador(@Param("productoId") Integer productoId);
}
