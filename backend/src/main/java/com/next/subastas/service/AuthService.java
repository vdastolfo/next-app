package com.next.subastas.service;

import com.next.subastas.dto.LoginRequest;
import com.next.subastas.dto.LoginResponse;
import com.next.subastas.dto.RegisterRequest;
import com.next.subastas.dto.VerifyRequest;
import com.next.subastas.model.Cliente;
import com.next.subastas.model.Persona;
import com.next.subastas.model.UsuarioApp;
import com.next.subastas.repository.ClienteRepository;
import com.next.subastas.repository.PersonaRepository;
import com.next.subastas.repository.UsuarioAppRepository;
import com.next.subastas.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class AuthService {

    @Autowired private UsuarioAppRepository usuarioAppRepository;
    @Autowired private PersonaRepository personaRepository;
    @Autowired private ClienteRepository clienteRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private EmailService emailService;

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
            throw new DisabledException("Tu cuenta está pendiente de verificación o desactivada.");
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

    @Transactional
    public String register(RegisterRequest request) {
        if (usuarioAppRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DataIntegrityViolationException("Ya existe una cuenta con ese email");
        }

        Persona persona = new Persona();
        persona.setNombre(request.getNombre());
        persona.setDocumento(request.getDocumento());
        persona.setEstado("activo");
        persona = personaRepository.save(persona);

        Cliente cliente = new Cliente();
        cliente.setPersona(persona);
        cliente.setAdmitido("si");
        cliente.setCategoria("comun");
        cliente.setVerificador(1);
        cliente = clienteRepository.save(cliente);

        String codigo = String.format("%06d", new Random().nextInt(999999));

        UsuarioApp usuario = new UsuarioApp();
        usuario.setEmail(request.getEmail());
        usuario.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        usuario.setCliente(cliente);
        usuario.setActivo("no");
        usuario.setCodigoVerificacion(codigo);
        usuario.setCodigoExpiracion(LocalDateTime.now().plusMinutes(15));
        usuarioAppRepository.save(usuario);

        try {
            emailService.sendVerificationCode(request.getEmail(), codigo);
        } catch (Exception e) {
            throw new RuntimeException("No se pudo enviar el email de verificación: " + e.getMessage());
        }

        return request.getEmail();
    }

    @Transactional
    public LoginResponse verify(VerifyRequest request) {
        UsuarioApp usuario = usuarioAppRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Usuario no encontrado"));

        if (usuario.getCodigoVerificacion() == null || !usuario.getCodigoVerificacion().equals(request.getCodigo())) {
            throw new BadCredentialsException("Código incorrecto");
        }

        if (LocalDateTime.now().isAfter(usuario.getCodigoExpiracion())) {
            throw new BadCredentialsException("El código expiró. Solicitá uno nuevo.");
        }

        usuario.setActivo("si");
        usuario.setCodigoVerificacion(null);
        usuario.setCodigoExpiracion(null);
        usuarioAppRepository.save(usuario);

        String token = jwtUtil.generateToken(usuario.getEmail());

        return new LoginResponse(
            token,
            usuario.getEmail(),
            usuario.getCliente().getPersona().getNombre(),
            usuario.getCliente().getCategoria(),
            usuario.getCliente().getIdentificador()
        );
    }

    @Transactional
    public void resendCode(String email) {
        UsuarioApp usuario = usuarioAppRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Usuario no encontrado"));

        if ("si".equals(usuario.getActivo())) {
            throw new RuntimeException("La cuenta ya está verificada");
        }

        String codigo = String.format("%06d", new Random().nextInt(999999));
        usuario.setCodigoVerificacion(codigo);
        usuario.setCodigoExpiracion(LocalDateTime.now().plusMinutes(15));
        usuarioAppRepository.save(usuario);

        try {
            emailService.sendVerificationCode(email, codigo);
        } catch (Exception e) {
            throw new RuntimeException("No se pudo enviar el email de verificación: " + e.getMessage());
        }
    }
}
