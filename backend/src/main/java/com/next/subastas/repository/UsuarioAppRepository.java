package com.next.subastas.repository;

import com.next.subastas.model.UsuarioApp;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioAppRepository extends JpaRepository<UsuarioApp, Integer> {
    Optional<UsuarioApp> findByEmail(String email);
    boolean existsByEmail(String email);
}
