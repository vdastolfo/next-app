package com.next.subastas.repository;

import com.next.subastas.model.MedioDePago;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MedioDePagoRepository extends JpaRepository<MedioDePago, Integer> {
    List<MedioDePago> findByClienteIdentificadorAndActivoOrderByFechaAgregadoDesc(
        Integer clienteId, String activo
    );
    boolean existsByClienteIdentificadorAndVerificado(Integer clienteId, String verificado);
    long countByClienteIdentificadorAndVerificado(Integer clienteId, String verificado);
}
