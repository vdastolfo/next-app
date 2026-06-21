package com.next.subastas.repository;

import com.next.subastas.model.Pieza;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PiezaRepository extends JpaRepository<Pieza, Integer> {
    List<Pieza> findByProductoIdentificador(Integer productoId);
}
