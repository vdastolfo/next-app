package com.next.subastas.repository;

import com.next.subastas.model.SolicitudConsignacion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SolicitudConsignacionRepository extends JpaRepository<SolicitudConsignacion, Integer> {
    List<SolicitudConsignacion> findByClienteIdentificadorOrderByFechaCreacionDesc(Integer clienteId);
}
