package com.next.subastas.controller;

import com.next.subastas.model.Foto;
import com.next.subastas.model.Producto;
import com.next.subastas.repository.FotoRepository;
import com.next.subastas.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/fotos")
public class FotoController {

    @Autowired private FotoRepository fotoRepository;
    @Autowired private ProductoRepository productoRepository;

    @GetMapping("/diagnostico/{productoId}")
    public ResponseEntity<List<Integer>> diagnostico(@PathVariable Integer productoId) {
        return ResponseEntity.ok(fotoRepository.findIdsByProductoIdentificador(productoId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getFoto(@PathVariable Integer id) {
        return fotoRepository.findById(id)
                .map(foto -> ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_JPEG_VALUE)
                        .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                        .body(foto.getFoto()))
                .orElse(ResponseEntity.status(404)
                        .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                        .body(null));
    }

    @PostMapping("/upload/{productoId}")
    public ResponseEntity<?> uploadFotos(
            @PathVariable Integer productoId,
            @RequestParam("files") List<MultipartFile> files) {

        Producto producto = productoRepository.findById(productoId).orElse(null);
        if (producto == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Producto no encontrado"));
        }

        List<Integer> createdIds = new ArrayList<>();
        for (MultipartFile file : files) {
            try {
                Foto foto = new Foto();
                foto.setProducto(producto);
                foto.setFoto(file.getBytes());
                fotoRepository.save(foto);
                createdIds.add(foto.getIdentificador());
            } catch (IOException e) {
                return ResponseEntity.status(500).body(Map.of("error", "Error leyendo archivo: " + file.getOriginalFilename()));
            }
        }
        return ResponseEntity.status(201).body(Map.of("fotoIds", createdIds));
    }
}
