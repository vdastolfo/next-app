package com.next.subastas.controller;

import com.next.subastas.dto.CompleteRegistrationRequest;
import com.next.subastas.dto.LoginRequest;
import com.next.subastas.dto.LoginResponse;
import com.next.subastas.dto.RegisterRequest;
import com.next.subastas.dto.VerifyRequest;
import com.next.subastas.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        } catch (DisabledException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            String email = authService.register(request);
            return ResponseEntity.status(201).body(Map.of("email", email));
        } catch (DataIntegrityViolationException e) {
            String msg = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
            if (msg.contains("email") || msg.contains("unique") || msg.contains("ya existe")) {
                return ResponseEntity.status(409).body(Map.of("error", "Ya existe una solicitud con ese correo."));
            }
            return ResponseEntity.status(400).body(Map.of("error", "Error de datos: " + e.getMostSpecificCause().getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", "Error al registrar: " + e.getMessage()));
        }
    }

    @PostMapping("/complete-registration")
    public ResponseEntity<?> completeRegistration(@Valid @RequestBody CompleteRegistrationRequest request) {
        try {
            LoginResponse response = authService.completeRegistration(request);
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    // Endpoint de uso interno para que el administrador apruebe un postor
    @PostMapping("/admin/approve")
    public ResponseEntity<?> adminApprove(@RequestBody Map<String, String> body) {
        try {
            authService.approveAndSendCode(body.get("email"));
            return ResponseEntity.ok(Map.of("message", "Usuario aprobado. Se envió el email de completación."));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/admin/approve/{email}")
    public ResponseEntity<?> adminApproveGet(@PathVariable String email) {
        try {
            authService.approveAndSendCode(email);
            return ResponseEntity.ok(Map.of("message", "Usuario aprobado. Se envió el email de completación a " + email));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verify(@Valid @RequestBody VerifyRequest request) {
        try {
            LoginResponse response = authService.verify(request);
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/resend-code")
    public ResponseEntity<?> resendCode(@RequestBody Map<String, String> body) {
        try {
            authService.resendCode(body.get("email"));
            return ResponseEntity.ok(Map.of("message", "Código reenviado"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }
}
