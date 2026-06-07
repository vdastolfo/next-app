package com.next.subastas.controller;

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
        System.out.println(">>> REGISTER REQUEST: " + request.getEmail());
        try {
            String email = authService.register(request);
            System.out.println(">>> REGISTER OK: " + email);
            return ResponseEntity.status(201).body(Map.of("email", email));
        } catch (DataIntegrityViolationException e) {
            System.out.println(">>> REGISTER 409: " + e.getMessage());
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.out.println(">>> REGISTER ERROR: " + e.getClass().getName() + " - " + e.getMessage());
            return ResponseEntity.status(400).body(Map.of("error", "Error al crear la cuenta: " + e.getMessage()));
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
