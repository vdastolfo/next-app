package com.next.subastas.service;

import com.next.subastas.dto.*;
import com.next.subastas.model.*;
import com.next.subastas.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubastaService {

    @Autowired private SubastaRepository subastaRepository;
    @Autowired private ItemCatalogoRepository itemCatalogoRepository;
    @Autowired private PujoRepository pujoRepository;
    @Autowired private AsistenteRepository asistenteRepository;
    @Autowired private UsuarioAppRepository usuarioAppRepository;
    @Autowired private MedioDePagoRepository medioDePagoRepository;

    // ---- Listar subastas accesibles para el usuario ----
    public List<SubastaResumenDTO> listarSubastas(String emailUsuario) {
        UsuarioApp usuario = usuarioAppRepository.findByEmail(emailUsuario).orElseThrow();
        String categoria = usuario.getCliente().getCategoria();

        return subastaRepository.findAccesiblesByCategoria(categoria)
                .stream()
                .map(this::toResumenDTO)
                .collect(Collectors.toList());
    }

    // ---- Ver detalle de un ítem del catálogo ----
    public ItemDetalleDTO getItemDetalle(Integer itemId) {
        ItemCatalogo item = itemCatalogoRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Ítem no encontrado"));

        return buildItemDetalle(item);
    }

    // ---- Buscar ítems por texto ----
    public List<ItemDetalleDTO> buscarItems(String texto) {
        return itemCatalogoRepository.buscarPorTexto(texto)
                .stream()
                .map(this::buildItemDetalle)
                .collect(Collectors.toList());
    }

    // ---- Preview de puja (antes de confirmar) ----
    public BidPreviewDTO getBidPreview(Integer itemId, BigDecimal montoPuja) {
        ItemCatalogo item = itemCatalogoRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Ítem no encontrado"));

        BigDecimal comisionComprador = montoPuja.multiply(new BigDecimal("0.10"))
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal envioEstimado = new BigDecimal("75.00");
        BigDecimal total = montoPuja.add(comisionComprador).add(envioEstimado);

        Pujo mejorPuja = pujoRepository.findMejorPujaByItem(itemId).orElse(null);

        BidPreviewDTO preview = new BidPreviewDTO();
        preview.setItemId(itemId);
        preview.setNombreProducto(item.getProducto().getDescripcionCatalogo());
        preview.setMejorPujaActual(mejorPuja != null ? mejorPuja.getImporte() : item.getPrecioBase());
        preview.setTuPuja(montoPuja);
        preview.setComisionComprador(comisionComprador);
        preview.setEnvioEstimado(envioEstimado);
        preview.setTotalAPagar(total);

        return preview;
    }

    // ---- Realizar una puja ----
    public PujaActivaDTO realizarPuja(Integer itemId, BigDecimal importe, String emailUsuario) {
        UsuarioApp usuario = usuarioAppRepository.findByEmail(emailUsuario).orElseThrow();
        Cliente cliente = usuario.getCliente();
        ItemCatalogo item = itemCatalogoRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Ítem no encontrado"));

        // Verificar que el cliente tenga al menos un medio de pago verificado
        boolean tieneMedioPago = medioDePagoRepository
                .existsByClienteIdentificadorAndVerificado(cliente.getIdentificador(), "si");
        if (!tieneMedioPago) {
            throw new RuntimeException("Necesitás al menos un medio de pago verificado para pujar.");
        }

        // Obtener la subasta del ítem
        // El ítem pertenece a un catálogo, el catálogo pertenece a una subasta
        // (simplificado: buscamos el asistente por cliente y primera subasta disponible)
        Asistente asistente = asistenteRepository
                .findByClienteIdentificadorAndSubastaIdentificador(
                    cliente.getIdentificador(),
                    getCatalogoSubastaId(item)
                )
                .orElseThrow(() -> new RuntimeException("No estás registrado en esta subasta."));

        // Validar rango de puja
        Pujo mejorPujaActual = pujoRepository.findMejorPujaByItem(itemId).orElse(null);
        BigDecimal baseActual = (mejorPujaActual != null)
                ? mejorPujaActual.getImporte()
                : item.getPrecioBase();
        String categoriaSubasta = asistente.getSubasta().getCategoria();

        // Validación de rango solo para subastas que no son oro o platino
        if (!categoriaSubasta.equals("oro") && !categoriaSubasta.equals("platino")) {
            BigDecimal minimoAceptado = baseActual.add(
                item.getPrecioBase().multiply(new BigDecimal("0.01"))
            );
            BigDecimal maximoAceptado = baseActual.add(
                item.getPrecioBase().multiply(new BigDecimal("0.20"))
            );
            if (importe.compareTo(minimoAceptado) < 0) {
                throw new RuntimeException(String.format(
                    "La puja mínima es $%.2f (oferta actual + 1%% del precio base)", minimoAceptado));
            }
            if (importe.compareTo(maximoAceptado) > 0) {
                throw new RuntimeException(String.format(
                    "La puja máxima es $%.2f (oferta actual + 20%% del precio base)", maximoAceptado));
            }
        }

        // Crear la puja
        Pujo nuevaPuja = new Pujo();
        nuevaPuja.setAsistente(asistente);
        nuevaPuja.setItem(item);
        nuevaPuja.setImporte(importe);
        nuevaPuja.setGanador("no");
        nuevaPuja.setFechaHora(LocalDateTime.now());
        pujoRepository.save(nuevaPuja);

        // Armar respuesta
        PujaActivaDTO dto = new PujaActivaDTO();
        dto.setPujaId(nuevaPuja.getIdentificador());
        dto.setItemId(itemId);
        dto.setNombreProducto(item.getProducto().getDescripcionCatalogo());
        dto.setTuPuja(importe);
        dto.setMejorPuja(importe);
        dto.setEresElMejor(true);
        dto.setLoteNumero("LOTE #" + itemId);
        dto.setEstadoSubasta("abierta");
        return dto;
    }

    // ---- Obtener actividad del usuario (pujas activas y ganadas) ----
    public List<PujaActivaDTO> getPujasActivas(String emailUsuario) {
        UsuarioApp usuario = usuarioAppRepository.findByEmail(emailUsuario).orElseThrow();
        Integer clienteId = usuario.getCliente().getIdentificador();

        return pujoRepository.findPujasActivasByCliente(clienteId)
                .stream()
                .map(p -> {
                    PujaActivaDTO dto = new PujaActivaDTO();
                    dto.setPujaId(p.getIdentificador());
                    dto.setItemId(p.getItem().getIdentificador());
                    dto.setNombreProducto(p.getItem().getProducto().getDescripcionCatalogo());
                    dto.setTuPuja(p.getImporte());

                    Pujo mejor = pujoRepository
                        .findMejorPujaByItem(p.getItem().getIdentificador()).orElse(p);
                    dto.setMejorPuja(mejor.getImporte());
                    dto.setEresElMejor(mejor.getIdentificador().equals(p.getIdentificador()));
                    dto.setLoteNumero("LOTE #" + p.getItem().getIdentificador());
                    dto.setEstadoSubasta(p.getAsistente().getSubasta().getEstado());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<PujaGanadaDTO> getPujasGanadas(String emailUsuario) {
        UsuarioApp usuario = usuarioAppRepository.findByEmail(emailUsuario).orElseThrow();
        Integer clienteId = usuario.getCliente().getIdentificador();

        return pujoRepository.findPujasGanadasByCliente(clienteId)
                .stream()
                .map(p -> {
                    PujaGanadaDTO dto = new PujaGanadaDTO();
                    dto.setPujaId(p.getIdentificador());
                    dto.setItemId(p.getItem().getIdentificador());
                    dto.setNombreProducto(p.getItem().getProducto().getDescripcionCatalogo());
                    dto.setImportePagado(p.getImporte());
                    dto.setFechaGanada(p.getFechaHora());
                    dto.setLoteNumero("LOTE #" + p.getItem().getIdentificador());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // ---- Helpers privados ----

    private SubastaResumenDTO toResumenDTO(Subasta s) {
        SubastaResumenDTO dto = new SubastaResumenDTO();
        dto.setId(s.getIdentificador());
        dto.setCategoria(s.getCategoria());
        dto.setEstado(s.getEstado());
        dto.setMoneda(s.getMoneda());
        dto.setFecha(s.getFecha());
        dto.setHora(s.getHora());
        dto.setUbicacion(s.getUbicacion());
        return dto;
    }

    private ItemDetalleDTO buildItemDetalle(ItemCatalogo item) {
        Pujo mejorPuja = pujoRepository.findMejorPujaByItem(item.getIdentificador()).orElse(null);
        BigDecimal mejorImporte = (mejorPuja != null) ? mejorPuja.getImporte() : item.getPrecioBase();

        BigDecimal pujaMinima = mejorImporte.add(
            item.getPrecioBase().multiply(new BigDecimal("0.01")).setScale(2, RoundingMode.HALF_UP)
        );
        BigDecimal pujaMaxima = mejorImporte.add(
            item.getPrecioBase().multiply(new BigDecimal("0.20")).setScale(2, RoundingMode.HALF_UP)
        );

        ItemDetalleDTO dto = new ItemDetalleDTO();
        dto.setId(item.getIdentificador());
        dto.setNombreProducto(item.getProducto().getDescripcionCatalogo());
        dto.setDescripcionCompleta(item.getProducto().getDescripcionCompleta());
        dto.setPrecioBase(item.getPrecioBase());
        dto.setMejorPujaActual(mejorImporte);
        dto.setPujaMinima(pujaMinima);
        dto.setPujaMaxima(pujaMaxima);
        dto.setComision(item.getComision());
        dto.setSubastado(item.getSubastado());
        dto.setLoteNumero("LOTE #" + item.getIdentificador());
        return dto;
    }

    private Integer getCatalogoSubastaId(ItemCatalogo item) {
        // Busca la subasta a través del catálogo del ítem
        // Por ahora devuelve 1 (subasta de prueba) — en producción se haría con join
        return item.getCatalogo();
    }
}
