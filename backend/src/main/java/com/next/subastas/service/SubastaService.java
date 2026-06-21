package com.next.subastas.service;

import com.next.subastas.dto.*;
import com.next.subastas.model.*;
import com.next.subastas.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Locale;

@Service
public class SubastaService {

    @Autowired private SubastaRepository subastaRepository;
    @Autowired private ItemCatalogoRepository itemCatalogoRepository;
    @Autowired private PujoRepository pujoRepository;
    @Autowired private AsistenteRepository asistenteRepository;
    @Autowired private UsuarioAppRepository usuarioAppRepository;
    @Autowired private MedioDePagoRepository medioDePagoRepository;
    @Autowired private ClienteRepository clienteRepository;
    @Autowired private FotoRepository fotoRepository;
    @Autowired private PiezaRepository piezaRepository;
    @Autowired private CatalogoRepository catalogoRepository;
    @Autowired private SimpMessagingTemplate messagingTemplate;
    @Autowired private EmailService emailService;

    private static final List<String> CATEGORY_ORDER =
            List.of("comun", "especial", "plata", "oro", "platino");

    private List<String> getCategoriasAccesibles(String categoria) {
        int nivel = CATEGORY_ORDER.indexOf(categoria);
        if (nivel < 0) return List.of("comun");
        return CATEGORY_ORDER.subList(0, nivel + 1);
    }

    private String getSiguienteCategoria(String categoria) {
        int nivel = CATEGORY_ORDER.indexOf(categoria);
        return (nivel >= 0 && nivel < CATEGORY_ORDER.size() - 1)
                ? CATEGORY_ORDER.get(nivel + 1) : null;
    }

    private void evaluarUpgradeCategoria(Cliente cliente, List<Pujo> todosPujos) {
        String categoriaActual = cliente.getCategoria();
        String siguiente = getSiguienteCategoria(categoriaActual);
        if (siguiente == null) return;

        long ganadosEnCategoria = todosPujos.stream()
                .filter(p -> "si".equals(p.getGanador()))
                .filter(p -> categoriaActual.equals(p.getAsistente().getSubasta().getCategoria()))
                .count();
        if (ganadosEnCategoria < 3) return;

        long mediosVerificados = medioDePagoRepository
                .countByClienteIdentificadorAndVerificado(cliente.getIdentificador(), "si");
        if (mediosVerificados < 3) return;

        cliente.setCategoria(siguiente);
        clienteRepository.save(cliente);
    }

    // ---- Listar subastas accesibles para el usuario ----
    public List<SubastaResumenDTO> listarSubastas(String emailUsuario) {
        UsuarioApp usuario = usuarioAppRepository.findByEmail(emailUsuario).orElseThrow();
        String categoria = usuario.getCliente().getCategoria();

        return subastaRepository.findAccesiblesByCategoria(categoria)
                .stream()
                .map(this::toResumenDTO)
                .collect(Collectors.toList());
    }

    // ---- Listar todas las subastas abiertas (invitado) ----
    public List<SubastaResumenDTO> listarSubastasPublicas() {
        return subastaRepository.findAll().stream()
                .filter(s -> "abierta".equals(s.getEstado()) || "cerrada".equals(s.getEstado()))
                .map(this::toResumenDTO)
                .collect(Collectors.toList());
    }

    // ---- Listar ítems de una subasta específica (todos, incluyendo vendidos) ----
    public List<ItemDetalleDTO> listarItemsDeSubasta(Integer subastaId) {
        return itemCatalogoRepository.findAllItemsBySubasta(subastaId)
                .stream()
                .map(this::buildItemDetalle)
                .collect(Collectors.toList());
    }

    // ---- Ver detalle de un ítem del catálogo ----
    public ItemDetalleDTO getItemDetalle(Integer itemId) {
        ItemCatalogo item = itemCatalogoRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Ítem no encontrado"));

        return buildItemDetalle(item);
    }

    // ---- Listar todos los ítems activos (invitado sin sesión) ----
    public List<ItemDetalleDTO> listarItemsPublicos() {
        List<Integer> ids = subastaRepository.findAll()
                .stream()
                .map(Subasta::getIdentificador)
                .collect(Collectors.toList());
        if (ids.isEmpty()) return List.of();
        return itemCatalogoRepository.findItemsActivosBySubastas(ids)
                .stream()
                .map(this::buildItemDetalle)
                .collect(Collectors.toList());
    }

    // ---- Listar ítems accesibles para el usuario (pantalla Home) ----
    public List<ItemDetalleDTO> listarItemsAccesibles(String emailUsuario) {
        List<Integer> subastaIds = listarSubastas(emailUsuario)
                .stream()
                .map(SubastaResumenDTO::getId)
                .collect(Collectors.toList());

        if (subastaIds.isEmpty()) return List.of();

        return itemCatalogoRepository.findItemsActivosBySubastas(subastaIds)
                .stream()
                .map(this::buildItemDetalle)
                .collect(Collectors.toList());
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

        // Obtener la subasta del ítem y auto-registrar al cliente como asistente si no lo está
        Integer subastaId = getCatalogoSubastaId(item);
        Subasta subastaDelItem = subastaRepository.findById(subastaId)
                .orElseThrow(() -> new RuntimeException("Subasta no encontrada"));

        Asistente asistente = asistenteRepository
                .findByClienteIdentificadorAndSubastaIdentificador(
                    cliente.getIdentificador(), subastaId)
                .orElseGet(() -> {
                    long nroPostor = asistenteRepository.countBySubastaIdentificador(subastaId) + 1;
                    Asistente nuevo = new Asistente();
                    nuevo.setCliente(cliente);
                    nuevo.setSubasta(subastaDelItem);
                    nuevo.setNumeroPostor((int) nroPostor);
                    return asistenteRepository.save(nuevo);
                });

        // Verificar que el ítem sea el que está siendo subastado ahora
        Subasta subastaActual = asistente.getSubasta();
        if (subastaActual.getItemActivo() != null
                && !subastaActual.getItemActivo().equals(itemId)) {
            throw new RuntimeException("Este lote no se está subastando en este momento.");
        }

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

        // Broadcast en tiempo real a todos los conectados al ítem
        BidUpdateMessage update = new BidUpdateMessage();
        update.setItemId(itemId);
        update.setMejorPuja(importe);
        update.setPujaMinima(importe.add(
            item.getPrecioBase().multiply(new BigDecimal("0.01")).setScale(2, RoundingMode.HALF_UP)));
        update.setPujaMaxima(importe.add(
            item.getPrecioBase().multiply(new BigDecimal("0.20")).setScale(2, RoundingMode.HALF_UP)));
        messagingTemplate.convertAndSend("/topic/item/" + itemId, update);

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

        // Deduplicar por ítem: la query ya viene ordenada por importe DESC,
        // así que el primero por ítem es siempre la mejor puja del usuario.
        java.util.Map<Integer, Pujo> mejorPorItem = new java.util.LinkedHashMap<>();
        for (Pujo p : pujoRepository.findPujasActivasByCliente(clienteId)) {
            mejorPorItem.putIfAbsent(p.getItem().getIdentificador(), p);
        }

        return mejorPorItem.values().stream()
                .map(p -> {
                    PujaActivaDTO dto = new PujaActivaDTO();
                    dto.setPujaId(p.getIdentificador());
                    dto.setItemId(p.getItem().getIdentificador());
                    dto.setNombreProducto(p.getItem().getProducto().getDescripcionCatalogo());
                    dto.setFotoIds(fotoRepository.findIdsByProductoIdentificador(
                        p.getItem().getProducto().getIdentificador()));
                    dto.setTuPuja(p.getImporte());

                    Pujo mejor = pujoRepository
                        .findMejorPujaByItem(p.getItem().getIdentificador()).orElse(p);
                    dto.setMejorPuja(mejor.getImporte());
                    dto.setEresElMejor(mejor.getIdentificador().equals(p.getIdentificador()));
                    dto.setLoteNumero("LOTE #" + p.getItem().getIdentificador());
                    dto.setEstadoSubasta(p.getAsistente().getSubasta().getEstado());
                    dto.setSegundosRestantes(calcularSegundosRestantes(p.getAsistente().getSubasta()));
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
                    dto.setFotoIds(fotoRepository.findIdsByProductoIdentificador(
                        p.getItem().getProducto().getIdentificador()));
                    dto.setEstadoPago(p.getEstadoPago() != null ? p.getEstadoPago() : "pendiente");
                    dto.setEstadoPaquete(p.getEstadoPaquete() != null ? p.getEstadoPaquete() : "pendiente_de_pago");
                    dto.setMoneda(p.getAsistente().getSubasta().getMoneda());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // ---- Registrar pago de una puja ganada ----
    public void pagarPujaGanada(Integer pujaId, Integer medioDePagoId, String emailUsuario) {
        Pujo pujo = pujoRepository.findById(pujaId)
                .orElseThrow(() -> new RuntimeException("Puja no encontrada"));
        Integer clienteId = usuarioAppRepository.findByEmail(emailUsuario)
                .orElseThrow().getCliente().getIdentificador();
        if (!pujo.getAsistente().getCliente().getIdentificador().equals(clienteId)) {
            throw new RuntimeException("No autorizado");
        }
        MedioDePago medio = medioDePagoRepository.findById(medioDePagoId)
                .orElseThrow(() -> new RuntimeException("Medio de pago no encontrado"));
        if (!medio.getCliente().getIdentificador().equals(clienteId)) {
            throw new RuntimeException("El medio de pago no pertenece al usuario");
        }

        String monedaSubasta = pujo.getAsistente().getSubasta().getMoneda();
        if ("dolares".equals(monedaSubasta) && "cheque".equals(medio.getTipo())) {
            throw new RuntimeException("Las subastas en dólares solo pueden abonarse con tarjeta de crédito o cuenta bancaria.");
        }

        pujo.setEstadoPago("pagado");
        pujo.setEstadoPaquete("empaquetado");
        pujo.setMedioDePago(medio);
        pujoRepository.save(pujo);
    }

    // ---- Activar un ítem específico en la subasta ----
    public void setItemActivo(Integer subastaId, Integer itemId) {
        if (!subastaRepository.existsById(subastaId))
            throw new RuntimeException("Subasta no encontrada");

        if (itemId != null) {
            ItemCatalogo item = itemCatalogoRepository.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("Ítem no encontrado"));
            LocalDateTime fechaFin = LocalDateTime.now().plusSeconds(item.getDuracionSegundos());
            subastaRepository.updateItemActivoAndFechaFin(subastaId, itemId, fechaFin);

            ActiveItemMessage msg = new ActiveItemMessage();
            msg.setSubastaId(subastaId);
            msg.setItemActivo(buildItemDetalle(item));
            messagingTemplate.convertAndSend("/topic/subasta/" + subastaId, msg);
        } else {
            subastaRepository.updateItemActivoAndFechaFin(subastaId, null, null);
            subastaRepository.updateEstado(subastaId, "cerrada");

            ActiveItemMessage msg = new ActiveItemMessage();
            msg.setSubastaId(subastaId);
            msg.setItemActivo(null);
            messagingTemplate.convertAndSend("/topic/subasta/" + subastaId, msg);
        }
    }

    // ---- Cerrar el ítem activo actual y avanzar al siguiente ----
    public void cerrarItemActivo(Integer subastaId) {
        Subasta subasta = subastaRepository.findById(subastaId).orElse(null);
        if (subasta == null || subasta.getItemActivo() == null) return;

        Integer currentItemId = subasta.getItemActivo();

        // Determinar ganador
        Integer ganadorClienteId = null;
        Pujo mejorPuja = pujoRepository.findMejorPujaByItem(currentItemId).orElse(null);
        if (mejorPuja != null) {
            mejorPuja.setGanador("si");
            mejorPuja.setEstadoPago("pendiente");
            mejorPuja.setEstadoPaquete("pendiente_de_pago");
            pujoRepository.save(mejorPuja);
            ganadorClienteId = mejorPuja.getAsistente().getCliente().getIdentificador();
        }

        // Notificar cierre del ítem a todos los suscriptores
        BidUpdateMessage cerrado = new BidUpdateMessage();
        cerrado.setItemId(currentItemId);
        cerrado.setTipo("CERRADO");
        cerrado.setGanadorClienteId(ganadorClienteId);
        messagingTemplate.convertAndSend("/topic/item/" + currentItemId, cerrado);

        // Enviar email privado al ganador con el detalle del pago
        if (mejorPuja != null && ganadorClienteId != null) {
            try {
                usuarioAppRepository.findByClienteIdentificador(ganadorClienteId).ifPresent(usuario -> {
                    try {
                        ItemCatalogo itemCerrado = itemCatalogoRepository.findById(currentItemId).orElse(null);
                        if (itemCerrado == null) return;

                        BigDecimal importe = mejorPuja.getImporte();
                        BigDecimal comision = importe.multiply(new BigDecimal("0.10"))
                                .setScale(2, RoundingMode.HALF_UP);
                        BigDecimal envio = new BigDecimal("75.00");
                        BigDecimal total = importe.add(comision).add(envio);

                        String nombreGanador = usuario.getCliente() != null
                                && usuario.getCliente().getPersona() != null
                                && usuario.getCliente().getPersona().getNombre() != null
                            ? usuario.getCliente().getPersona().getNombre() : "cliente";
                        emailService.sendWinnerNotification(
                            usuario.getEmail(),
                            nombreGanador,
                            "LOTE #" + currentItemId,
                            itemCerrado.getProducto().getDescripcionCatalogo(),
                            String.format(Locale.US, "%.2f", importe),
                            String.format(Locale.US, "%.2f", comision),
                            String.format(Locale.US, "%.2f", envio),
                            String.format(Locale.US, "%.2f", total)
                        );
                    } catch (Exception e) {
                        // Email no crítico — no interrumpe el flujo de la subasta
                    }
                });
            } catch (Exception e) {
                // idem
            }
        }

        // Marcar ítem como subastado; si no hubo pujas, la empresa lo adquiere al valor base
        itemCatalogoRepository.findById(currentItemId).ifPresent(item -> {
            item.setSubastado("si");
            if (mejorPuja == null) {
                item.setCompradoPorEmpresa(true);
            }
            itemCatalogoRepository.save(item);
        });

        // Buscar siguiente ítem (el actual ya pasó a 'si')
        List<ItemCatalogo> restantes = itemCatalogoRepository.findItemsActivosBySubasta(subastaId);
        Integer siguienteId = restantes.isEmpty() ? null : restantes.get(0).getIdentificador();
        setItemActivo(subastaId, siguienteId);
    }

    // ---- Métricas de participación del usuario ----
    public ParticipacionesDTO getParticipaciones(String emailUsuario) {
        UsuarioApp usuario = usuarioAppRepository.findByEmail(emailUsuario).orElseThrow();
        Cliente cliente = usuario.getCliente();
        Integer clienteId = cliente.getIdentificador();

        String categoriaAntes = cliente.getCategoria();

        // Traer TODAS las pujas sin filtro — se usan para evaluar el upgrade
        List<Pujo> todosPujosRaw = pujoRepository.findAllByCliente(clienteId);

        // Evaluar y aplicar upgrade si corresponde
        evaluarUpgradeCategoria(cliente, todosPujosRaw);

        String categoriaActual = cliente.getCategoria();
        boolean subioCategoria = !categoriaAntes.equals(categoriaActual);

        // Categorías visibles para este nivel (acumulativas)
        List<String> accesibles = getCategoriasAccesibles(categoriaActual);

        // Filtrar asistentes y pujas por categorías accesibles al nivel actual
        List<com.next.subastas.model.Asistente> asistentes =
                asistenteRepository.findByClienteIdentificador(clienteId).stream()
                        .filter(a -> accesibles.contains(a.getSubasta().getCategoria()))
                        .collect(Collectors.toList());

        List<Pujo> todosPujos = todosPujosRaw.stream()
                .filter(p -> accesibles.contains(p.getAsistente().getSubasta().getCategoria()))
                .collect(Collectors.toList());

        // Métricas globales
        int subastasAsistidas = asistentes.size();
        int itemsGanados = (int) todosPujos.stream().filter(p -> "si".equals(p.getGanador())).count();
        int itemsPujados = (int) todosPujos.stream()
                .map(p -> p.getItem().getIdentificador()).distinct().count();
        double winRate = itemsPujados > 0
                ? Math.round(itemsGanados * 1000.0 / itemsPujados) / 10.0 : 0.0;

        BigDecimal totalOfertado = todosPujos.stream()
                .map(Pujo::getImporte).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalPagado = todosPujos.stream()
                .filter(p -> "si".equals(p.getGanador()))
                .map(Pujo::getImporte).reduce(BigDecimal.ZERO, BigDecimal::add);

        // Por categoría (orden jerárquico)
        java.util.Map<String, List<com.next.subastas.model.Asistente>> porCat = asistentes.stream()
                .collect(Collectors.groupingBy(a -> a.getSubasta().getCategoria()));

        List<ParticipacionesDTO.MetricaCategoria> metricasCat = porCat.entrySet().stream()
                .map(e -> {
                    java.util.Set<Integer> ids = e.getValue().stream()
                            .map(a -> a.getSubasta().getIdentificador())
                            .collect(java.util.stream.Collectors.toSet());
                    List<Pujo> pCat = todosPujos.stream()
                            .filter(p -> ids.contains(p.getAsistente().getSubasta().getIdentificador()))
                            .collect(Collectors.toList());
                    ParticipacionesDTO.MetricaCategoria mc = new ParticipacionesDTO.MetricaCategoria();
                    mc.setCategoria(e.getKey());
                    mc.setSubastasAsistidas(e.getValue().size());
                    mc.setItemsGanados((int) pCat.stream().filter(p -> "si".equals(p.getGanador())).count());
                    mc.setItemsPujados((int) pCat.stream()
                            .map(p -> p.getItem().getIdentificador()).distinct().count());
                    mc.setTotalOfertado(pCat.stream().map(Pujo::getImporte)
                            .reduce(BigDecimal.ZERO, BigDecimal::add));
                    mc.setTotalPagado(pCat.stream().filter(p -> "si".equals(p.getGanador()))
                            .map(Pujo::getImporte).reduce(BigDecimal.ZERO, BigDecimal::add));
                    return mc;
                })
                .sorted(java.util.Comparator.comparingInt(
                        mc -> CATEGORY_ORDER.indexOf(mc.getCategoria())))
                .collect(Collectors.toList());

        // Historial por subasta (más reciente primero)
        List<ParticipacionesDTO.HistorialSubasta> historial = asistentes.stream()
                .map(a -> {
                    Subasta s = a.getSubasta();
                    List<Pujo> pSub = todosPujos.stream()
                            .filter(p -> p.getAsistente().getSubasta().getIdentificador()
                                    .equals(s.getIdentificador()))
                            .collect(Collectors.toList());
                    ParticipacionesDTO.HistorialSubasta h = new ParticipacionesDTO.HistorialSubasta();
                    h.setSubastaId(s.getIdentificador());
                    h.setCategoria(s.getCategoria());
                    h.setFecha(s.getFecha() != null ? s.getFecha().toString() : null);
                    h.setUbicacion(s.getUbicacion());
                    h.setMoneda(s.getMoneda());
                    h.setPujasRealizadas(pSub.size());
                    h.setItemsPujados((int) pSub.stream()
                            .map(p -> p.getItem().getIdentificador()).distinct().count());
                    h.setItemsGanados((int) pSub.stream()
                            .filter(p -> "si".equals(p.getGanador())).count());
                    h.setTotalOfertado(pSub.stream().map(Pujo::getImporte)
                            .reduce(BigDecimal.ZERO, BigDecimal::add));
                    h.setTotalPagado(pSub.stream().filter(p -> "si".equals(p.getGanador()))
                            .map(Pujo::getImporte).reduce(BigDecimal.ZERO, BigDecimal::add));
                    return h;
                })
                .sorted(java.util.Comparator.comparing(
                        ParticipacionesDTO.HistorialSubasta::getSubastaId).reversed())
                .collect(Collectors.toList());

        ParticipacionesDTO dto = new ParticipacionesDTO();
        dto.setSubastasAsistidas(subastasAsistidas);
        dto.setItemsGanados(itemsGanados);
        dto.setItemsPujados(itemsPujados);
        dto.setWinRate(winRate);
        dto.setTotalOfertado(totalOfertado);
        dto.setTotalPagado(totalPagado);
        dto.setPorCategoria(metricasCat);
        dto.setHistorial(historial);
        dto.setCategoriaActual(categoriaActual);
        dto.setSubioCategoria(subioCategoria);
        return dto;
    }

    // ---- Helpers privados ----

    private SubastaResumenDTO toResumenDTO(Subasta s) {
        SubastaResumenDTO dto = new SubastaResumenDTO();
        dto.setId(s.getIdentificador());
        dto.setCategoria(s.getCategoria());
        dto.setMoneda(s.getMoneda());
        dto.setFecha(s.getFecha());
        dto.setHora(s.getHora());
        dto.setUbicacion(s.getUbicacion());
        long totalItems = itemCatalogoRepository.countItemsActivosBySubasta(s.getIdentificador());
        long vendidos = itemCatalogoRepository.countVendidosBySubasta(s.getIdentificador());
        dto.setTotalItems((int) totalItems);
        LocalDate hoy = LocalDate.now();
        LocalTime ahora = LocalTime.now();
        boolean esFutura = s.getFecha() != null && (
            s.getFecha().isAfter(hoy) ||
            (s.getFecha().isEqual(hoy) && s.getHora() != null && ahora.isBefore(s.getHora()))
        );
        String estadoEfectivo;
        if (esFutura) {
            estadoEfectivo = "proxima";
        } else if (totalItems > 0 && vendidos == totalItems) {
            estadoEfectivo = "cerrada";
        } else {
            estadoEfectivo = s.getEstado();
        }
        dto.setEstado(estadoEfectivo);
        dto.setSegundosRestantes(calcularSegundosRestantes(s));
        dto.setItemActivoId(s.getItemActivo());
        try {
            Persona p = s.getSubastador().getPersona();
            String nombre = (p.getNombre() != null ? p.getNombre() : "")
                    + (p.getApellido() != null ? " " + p.getApellido() : "");
            dto.setRematadorNombre(nombre.trim());
            dto.setRematadorMatricula(s.getSubastador().getMatricula());
        } catch (Exception e) {
            dto.setRematadorNombre(null);
        }
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
        Subasta subasta = getSubastaDeItem(item);
        boolean esActivo = subasta != null && item.getIdentificador().equals(subasta.getItemActivo());
        dto.setEsItemActivo(esActivo);
        dto.setSegundosRestantes(esActivo ? calcularSegundosRestantes(subasta) : 0L);

        try {
            if ("si".equals(item.getSubastado())) {
                // Mostrar el ganador como nuevo dueño
                Pujo ganador = pujoRepository.findPujasGanadoras(item.getIdentificador()).stream().findFirst().orElse(null);
                if (ganador != null) {
                    Persona p = ganador.getAsistente().getCliente().getPersona();
                    String nombre = p.getNombre() != null ? p.getNombre() : "";
                    String apellido = p.getApellido() != null ? " " + p.getApellido() : "";
                    dto.setDuenioActual(nombre + apellido);
                } else {
                    dto.setDuenioActual(null);
                }
            } else {
                Persona persona = item.getProducto().getDuenio().getPersona();
                String nombre = persona.getNombre() != null ? persona.getNombre() : "";
                String apellido = persona.getApellido() != null ? " " + persona.getApellido() : "";
                dto.setDuenioActual(nombre + apellido);
            }
        } catch (Exception e) {
            dto.setDuenioActual(null);
        }

        Integer productoId = item.getProducto().getIdentificador();

        List<Integer> fotoIds = fotoRepository.findIdsByProductoIdentificador(productoId);
        dto.setFotoIds(fotoIds);

        List<PiezaDTO> piezas = piezaRepository.findByProductoIdentificador(productoId)
                .stream()
                .map(p -> new PiezaDTO(p.getIdentificador(), p.getDescripcion(), p.getCantidad()))
                .collect(Collectors.toList());
        dto.setPiezas(piezas);

        return dto;
    }

    private Integer getCatalogoSubastaId(ItemCatalogo item) {
        return catalogoRepository.findById(item.getCatalogo())
                .orElseThrow(() -> new RuntimeException("Catálogo no encontrado"))
                .getSubasta();
    }

    private Subasta getSubastaDeItem(ItemCatalogo item) {
        try {
            Integer subastaId = catalogoRepository.findById(item.getCatalogo())
                    .map(Catalogo::getSubasta).orElse(null);
            if (subastaId == null) return null;
            return subastaRepository.findById(subastaId).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private long calcularSegundosRestantes(Subasta subasta) {
        if (subasta == null) return 0;
        LocalDateTime fin = null;
        if (subasta.getFechaFin() != null) {
            fin = subasta.getFechaFin();
        } else if (subasta.getDuracionMinutos() != null) {
            fin = LocalDateTime.of(subasta.getFecha(), subasta.getHora())
                    .plusMinutes(subasta.getDuracionMinutos());
        }
        if (fin == null) return 0;
        return Math.max(0, ChronoUnit.SECONDS.between(LocalDateTime.now(), fin));
    }
}
