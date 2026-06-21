package com.next.subastas.controller;

import com.next.subastas.dto.ConsignacionDetalleDTO;
import com.next.subastas.dto.ConsignacionRequest;
import com.next.subastas.dto.ConsignacionResumenDTO;
import com.next.subastas.service.ConsignacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/consignaciones")
public class ConsignacionController {

    @Autowired private ConsignacionService consignacionService;

    @PostMapping
    public ResponseEntity<ConsignacionResumenDTO> crear(
            @RequestBody ConsignacionRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(consignacionService.crearSolicitud(req, user.getUsername()));
    }

    @GetMapping
    public ResponseEntity<List<ConsignacionResumenDTO>> listar(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(consignacionService.listarMisSolicitudes(user.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConsignacionDetalleDTO> detalle(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(consignacionService.getDetalle(id, user.getUsername()));
    }

    @PostMapping("/{id}/confirmar")
    public ResponseEntity<Void> confirmar(
            @PathVariable Integer id,
            @RequestBody Map<String, Boolean> body,
            @AuthenticationPrincipal UserDetails user) {
        boolean acepta = Boolean.TRUE.equals(body.get("acepta"));
        consignacionService.confirmarTerminos(id, acepta, user.getUsername());
        return ResponseEntity.ok().build();
    }
}
