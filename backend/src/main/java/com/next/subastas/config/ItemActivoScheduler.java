package com.next.subastas.config;

import com.next.subastas.model.ItemCatalogo;
import com.next.subastas.model.Subasta;
import com.next.subastas.repository.ItemCatalogoRepository;
import com.next.subastas.repository.SubastaRepository;
import com.next.subastas.service.SubastaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ItemActivoScheduler {

    @Autowired private SubastaRepository subastaRepository;
    @Autowired private ItemCatalogoRepository itemCatalogoRepository;
    @Autowired private SubastaService subastaService;

    // ── Corre cada 10 segundos ────────────────────────────────────────────────
    // La duración de cada ítem se configura en la columna duracionSegundos
    // de la tabla itemsCatalogo (por defecto 120 segundos = 2 minutos).
    // Para cambiar la duración de un ítem específico:
    //   UPDATE itemsCatalogo SET duracionSegundos = 20 WHERE identificador = X;
    @Scheduled(fixedDelay = 10000)
    public void tick() {
        subastaRepository.findAll().stream()
                .filter(s -> "abierta".equals(s.getEstado()))
                .collect(Collectors.toList())
                .forEach(this::procesarSubasta);
    }

    private void procesarSubasta(Subasta subasta) {
        // No activar subastas cuya fecha/hora aún no llegó
        LocalDate hoy = LocalDate.now();
        LocalTime ahora = LocalTime.now();
        if (subasta.getFecha() != null) {
            if (subasta.getFecha().isAfter(hoy)) return;
            if (subasta.getFecha().isEqual(hoy) && subasta.getHora() != null && ahora.isBefore(subasta.getHora())) return;
        }

        Integer subastaId = subasta.getIdentificador();

        if (subasta.getItemActivo() == null) {
            if (subasta.getFechaFin() == null) {
                List<ItemCatalogo> pendientes =
                        itemCatalogoRepository.findItemsActivosBySubasta(subastaId);
                if (!pendientes.isEmpty()) {
                    // Hay ítems pendientes: iniciar el primero
                    subastaService.setItemActivo(subastaId, pendientes.get(0).getIdentificador());
                } else {
                    // No hay ítems pendientes: cerrar la subasta
                    subastaRepository.updateEstado(subastaId, "cerrada");
                }
            }
            return;
        }

        // Verificar si el tiempo del ítem activo expiró
        if (subasta.getFechaFin() != null && LocalDateTime.now().isAfter(subasta.getFechaFin())) {
            subastaService.cerrarItemActivo(subastaId);
        }
    }
}
