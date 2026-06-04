package com.next.subastas.controller;
 
import com.next.subastas.dto.LoginRequest;
import com.next.subastas.dto.LoginResponse;
import com.next.subastas.dto.RegisterRequest;
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
            LoginResponse response = authService.register(request);
            return ResponseEntity.status(201).body(response);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", "Error al crear la cuenta: " + e.getMessage()));
        }
    }
}