package com.next.subastas.controller;

import com.next.subastas.dto.*;
import com.next.subastas.service.SubastaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auctions")
public class SubastaController {

    @Autowired
    private SubastaService subastaService;

    /**
     * GET /api/auctions
     * Lista las subastas accesibles para el usuario logueado
     * según su categoría.
     */
    @GetMapping
    public ResponseEntity<List<SubastaResumenDTO>> listar(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(subastaService.listarSubastas(user.getUsername()));
    }

    /**
     * GET /api/auctions/search?q=texto&sort=relevancia&category=arte
     * Busca ítems por texto con filtros opcionales.
     */
    @GetMapping("/search")
    public ResponseEntity<List<ItemDetalleDTO>> buscar(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String category) {

        String texto = (q != null) ? q : "";
        return ResponseEntity.ok(subastaService.buscarItems(texto));
    }

    /**
     * GET /api/auctions/items/{itemId}
     * Detalle de un ítem/lote específico (pantalla PRODUCT_DETAILS).
     */
    @GetMapping("/items/{itemId}")
    public ResponseEntity<?> getItemDetalle(@PathVariable Integer itemId) {
        try {
            return ResponseEntity.ok(subastaService.getItemDetalle(itemId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/auctions/items/{itemId}/bid-preview?amount=6690
     * Preview del total antes de confirmar la puja (pantalla BID_CONFIRMATION).
     */
    @GetMapping("/items/{itemId}/bid-preview")
    public ResponseEntity<?> getBidPreview(
            @PathVariable Integer itemId,
            @RequestParam BigDecimal amount) {
        try {
            return ResponseEntity.ok(subastaService.getBidPreview(itemId, amount));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/auctions/items/{itemId}/bids
     * Realiza una puja sobre un ítem.
     * Body: { "importe": 6690, "medioDePagoId": 1 }
     */
    @PostMapping("/items/{itemId}/bids")
    public ResponseEntity<?> pujar(
            @PathVariable Integer itemId,
            @RequestBody BidRequest request,
            @AuthenticationPrincipal UserDetails user) {
        try {
            PujaActivaDTO resultado = subastaService.realizarPuja(
                itemId, request.getImporte(), user.getUsername()
            );
            return ResponseEntity.status(201).body(resultado);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }
}
