package com.next.subastas.service;

import com.next.subastas.dto.LoginRequest;
import com.next.subastas.dto.LoginResponse;
import com.next.subastas.model.UsuarioApp;
import com.next.subastas.repository.UsuarioAppRepository;
import com.next.subastas.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired private UsuarioAppRepository usuarioAppRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private AuthenticationManager authenticationManager;

    public LoginResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (AuthenticationException e) {
            throw new BadCredentialsException("Email o contraseña incorrectos");
        }

        UsuarioApp usuario = usuarioAppRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Usuario no encontrado"));

        if (!"si".equals(usuario.getActivo())) {
            throw new DisabledException("Tu cuenta está desactivada. Contactá al soporte.");
        }

        String token = jwtUtil.generateToken(usuario.getEmail());

        return new LoginResponse(
            token,
            usuario.getEmail(),
            usuario.getCliente().getPersona().getNombre(),
            usuario.getCliente().getCategoria(),
            usuario.getCliente().getIdentificador()
        );
    }
}
