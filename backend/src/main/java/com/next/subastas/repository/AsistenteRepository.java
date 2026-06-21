package com.next.subastas.repository;

import com.next.subastas.model.Asistente;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AsistenteRepository extends JpaRepository<Asistente, Integer> {
    Optional<Asistente> findByClienteIdentificadorAndSubastaIdentificador(
        Integer clienteId, Integer subastaId
    );

    List<Asistente> findByClienteIdentificador(Integer clienteId);

    long countBySubastaIdentificador(Integer subastaId);
}
