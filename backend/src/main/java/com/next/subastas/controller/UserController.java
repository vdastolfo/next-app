package com.next.subastas.controller;

import com.next.subastas.dto.*;
import com.next.subastas.model.Persona;
import com.next.subastas.model.UsuarioApp;
import com.next.subastas.repository.PersonaRepository;
import com.next.subastas.repository.UsuarioAppRepository;
import com.next.subastas.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// =============================================
// ACTIVIDAD del usuario (pantallas 11 y 12)
// =============================================
@RestController
@RequestMapping("/api/user/activity")
class ActividadController {

    @Autowired
    private SubastaService subastaService;

    /**
     * GET /api/user/activity/bidding
     * Pujas activas del usuario (pestaña "Pujando")
     */
    @GetMapping("/bidding")
    public ResponseEntity<List<PujaActivaDTO>> getPujando(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(subastaService.getPujasActivas(user.getUsername()));
    }

    /**
     * GET /api/user/activity/won
     * Pujas ganadas del usuario (pestaña "Ganadas")
     */
    @GetMapping("/won")
    public ResponseEntity<List<PujaGanadaDTO>> getGanadas(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(subastaService.getPujasGanadas(user.getUsername()));
    }

    /**
     * GET /api/user/activity/participaciones
     * Métricas de participación del usuario
     */
    @GetMapping("/participaciones")
    public ResponseEntity<ParticipacionesDTO> getParticipaciones(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(subastaService.getParticipaciones(user.getUsername()));
    }

    /**
     * POST /api/user/activity/won/{pujaId}/pay
     * Registrar pago de una puja ganada
     * Body: { "medioDePagoId": 5 }
     */
    @PostMapping("/won/{pujaId}/pay")
    public ResponseEntity<?> pagar(
            @PathVariable Integer pujaId,
            @RequestBody Map<String, Integer> body,
            @AuthenticationPrincipal UserDetails user) {
        try {
            Integer medioDePagoId = body.get("medioDePagoId");
            if (medioDePagoId == null) {
                return ResponseEntity.status(400).body(java.util.Map.of("error", "Se requiere medioDePagoId"));
            }
            subastaService.pagarPujaGanada(pujaId, medioDePagoId, user.getUsername());
            return ResponseEntity.ok(java.util.Map.of("mensaje", "Pago registrado"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(java.util.Map.of("error", e.getMessage()));
        }
    }
}

// =============================================
// MÉTODOS DE PAGO (pantallas 14, 15, 17)
// =============================================
@RestController
@RequestMapping("/api/user/payment-methods")
class MedioDePagoController {

    @Autowired
    private MedioDePagoService medioDePagoService;

    /**
     * GET /api/user/payment-methods
     * Lista todos los métodos de pago activos del usuario
     */
    @GetMapping
    public ResponseEntity<List<MedioDePagoDTO>> listar(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(medioDePagoService.listarMedios(user.getUsername()));
    }

    /**
     * POST /api/user/payment-methods/card
     * Agregar tarjeta de crédito/débito
     */
    @PostMapping("/card")
    public ResponseEntity<?> agregarTarjeta(
            @RequestBody NuevaTarjetaRequest request,
            @AuthenticationPrincipal UserDetails user) {
        try {
            return ResponseEntity.status(201)
                    .body(medioDePagoService.agregarTarjeta(request, user.getUsername()));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/user/payment-methods/bank-account
     * Agregar cuenta bancaria
     */
    @PostMapping("/bank-account")
    public ResponseEntity<?> agregarCuenta(
            @RequestBody NuevaCuentaRequest request,
            @AuthenticationPrincipal UserDetails user) {
        try {
            return ResponseEntity.status(201)
                    .body(medioDePagoService.agregarCuenta(request, user.getUsername()));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/user/payment-methods/check
     * Agregar cheque certificado
     */
    @PostMapping("/check")
    public ResponseEntity<?> agregarCheque(
            @RequestBody NuevoChequeRequest request,
            @AuthenticationPrincipal UserDetails user) {
        try {
            return ResponseEntity.status(201)
                    .body(medioDePagoService.agregarCheque(request, user.getUsername()));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DELETE /api/user/payment-methods/{id}
     * Eliminar (desactivar) un método de pago
     **/
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails user) {
        try {
            medioDePagoService.eliminarMedio(id, user.getUsername());
            return ResponseEntity.ok(Map.of("mensaje", "Método de pago eliminado"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }
}

// =============================================
// FOTO DE PERFIL
// =============================================
@RestController
@RequestMapping("/api/user/profile")
class PerfilController {

    @Autowired private UsuarioAppRepository usuarioAppRepository;
    @Autowired private PersonaRepository personaRepository;

    @GetMapping("/photo")
    public ResponseEntity<?> getFoto(@AuthenticationPrincipal UserDetails user) {
        UsuarioApp usuario = usuarioAppRepository.findByEmail(user.getUsername()).orElseThrow();
        String foto = usuario.getCliente().getPersona().getFotoPerfil();
        return ResponseEntity.ok(Map.of("foto", foto != null ? foto : ""));
    }

    @PutMapping("/photo")
    public ResponseEntity<?> setFoto(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails user) {
        try {
            UsuarioApp usuario = usuarioAppRepository.findByEmail(user.getUsername()).orElseThrow();
            Persona persona = usuario.getCliente().getPersona();
            persona.setFotoPerfil(body.get("foto"));
            personaRepository.save(persona);
            return ResponseEntity.ok(Map.of("ok", true));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }
}
