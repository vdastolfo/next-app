package com.next.subastas.repository;

import com.next.subastas.model.FotoSolicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FotoSolicitudRepository extends JpaRepository<FotoSolicitud, Integer> {
    List<FotoSolicitud> findBySolicitudIdentificador(Integer solicitudId);
    long countBySolicitudIdentificador(Integer solicitudId);
}
