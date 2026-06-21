package com.next.subastas.service;

import com.next.subastas.dto.CompleteRegistrationRequest;
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
import java.util.UUID;

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
        UsuarioApp usuario = usuarioAppRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Email o contraseña incorrectos"));

        if (!"si".equals(usuario.getActivo())) {
            if (usuario.getCodigoVerificacion() != null) {
                throw new DisabledException("Revisá tu correo para completar el registro con el código que recibiste.");
            }
            throw new DisabledException("Tu solicitud está siendo revisada por nuestro equipo. Te avisaremos por correo.");
        }

        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (AuthenticationException e) {
            throw new BadCredentialsException("Email o contraseña incorrectos");
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

    // ── ETAPA 1: el postor ingresa sus datos personales ───────────────────────
    @Transactional
    public String register(RegisterRequest request) {
        if (usuarioAppRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DataIntegrityViolationException("Ya existe una cuenta con ese email");
        }

        Persona persona = new Persona();
        persona.setNombre(request.getNombre());
        persona.setApellido(request.getApellido());
        persona.setDocumento(request.getDocumento());
        persona.setDireccion(request.getDomicilio());
        persona.setFotoDocFrente(request.getFotoDocFrente());
        persona.setFotoDocDorso(request.getFotoDocDorso());
        persona.setEstado("activo");
        persona = personaRepository.save(persona);

        Cliente cliente = new Cliente();
        cliente.setPersona(persona);
        cliente.setAdmitido("no");
        cliente.setCategoria("comun");
        cliente.setPaisOrigen(request.getPais());
        cliente.setVerificador(1);
        cliente = clienteRepository.save(cliente);

        UsuarioApp usuario = new UsuarioApp();
        usuario.setEmail(request.getEmail());
        // Contraseña temporal aleatoria — se reemplaza en la Etapa 2
        usuario.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
        usuario.setCliente(cliente);
        usuario.setActivo("no");
        usuarioAppRepository.save(usuario);

        try {
            emailService.sendRegistrationReceived(request.getEmail(), request.getNombre());
        } catch (Exception e) {
            throw new RuntimeException("No se pudo enviar el email de confirmación: " + e.getMessage());
        }

        return request.getEmail();
    }

    // ── APROBACIÓN ADMIN: genera código y envía email de Etapa 2 ─────────────
    @Transactional
    public void approveAndSendCode(String email) {
        UsuarioApp usuario = usuarioAppRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Usuario no encontrado"));

        if ("si".equals(usuario.getActivo())) {
            throw new RuntimeException("El usuario ya está activo");
        }

        Cliente cliente = usuario.getCliente();
        cliente.setAdmitido("si");
        cliente.setCategoria("comun");
        clienteRepository.save(cliente);

        Persona persona = cliente.getPersona();
        persona.setEstado("activo");
        personaRepository.save(persona);

        String codigo = String.format("%06d", new Random().nextInt(999999));
        usuario.setCodigoVerificacion(codigo);
        usuario.setCodigoExpiracion(LocalDateTime.now().plusHours(24));
        usuarioAppRepository.save(usuario);

        try {
            emailService.sendCompletionCode(email, persona.getNombre(), codigo);
        } catch (Exception e) {
            throw new RuntimeException("No se pudo enviar el email de aprobación: " + e.getMessage());
        }
    }

    // ── ETAPA 2: el postor completa su registro con código + contraseña ───────
    @Transactional
    public LoginResponse completeRegistration(CompleteRegistrationRequest request) {
        UsuarioApp usuario = usuarioAppRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Email no encontrado"));

        if (usuario.getCodigoVerificacion() == null
                || !usuario.getCodigoVerificacion().equals(request.getCodigo())) {
            throw new BadCredentialsException("Código incorrecto");
        }

        if (LocalDateTime.now().isAfter(usuario.getCodigoExpiracion())) {
            throw new BadCredentialsException("El código expiró. Contactá al soporte para recibir uno nuevo.");
        }

        usuario.setPasswordHash(passwordEncoder.encode(request.getPassword()));
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

    // ── Flujo legado de verificación (se mantiene por compatibilidad) ─────────
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
            throw new RuntimeException("La cuenta ya está activa");
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
