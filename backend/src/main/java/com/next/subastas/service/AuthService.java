package com.next.subastas.service;
 
import com.next.subastas.dto.LoginRequest;
import com.next.subastas.dto.LoginResponse;
import com.next.subastas.dto.RegisterRequest;
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
 
@Service
public class AuthService {
 
    @Autowired private UsuarioAppRepository usuarioAppRepository;
    @Autowired private PersonaRepository personaRepository;
    @Autowired private ClienteRepository clienteRepository;
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
 
    @Transactional
    public LoginResponse register(RegisterRequest request) {
        // Verificar si el email ya existe
        if (usuarioAppRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DataIntegrityViolationException("Ya existe una cuenta con ese email");
        }
 
        // 1. Crear Persona
        Persona persona = new Persona();
        persona.setNombre(request.getNombre());
        persona.setDocumento(request.getDocumento());
        persona.setEstado("activo");
        persona = personaRepository.save(persona);
 
        // 2. Crear Cliente vinculado a la Persona
        Cliente cliente = new Cliente();
        cliente.setPersona(persona);
        cliente.setAdmitido("si");
        cliente.setCategoria("standard");
        cliente.setVerificador(0);
        cliente = clienteRepository.save(cliente);
 
        // 3. Crear UsuarioApp
        UsuarioApp usuario = new UsuarioApp();
        usuario.setEmail(request.getEmail());
        usuario.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        usuario.setCliente(cliente);
        usuario.setActivo("si");
        usuarioAppRepository.save(usuario);
 
        // 4. Generar token y retornar LoginResponse
        String token = jwtUtil.generateToken(usuario.getEmail());
 
        return new LoginResponse(
            token,
            usuario.getEmail(),
            persona.getNombre(),
            cliente.getCategoria(),
            cliente.getIdentificador()
        );
    }
}