package com.next.subastas.service;

import com.next.subastas.dto.ConsignacionDetalleDTO;
import com.next.subastas.dto.ConsignacionRequest;
import com.next.subastas.dto.ConsignacionResumenDTO;
import com.next.subastas.model.FotoSolicitud;
import com.next.subastas.model.SolicitudConsignacion;
import com.next.subastas.model.UsuarioApp;
import com.next.subastas.repository.FotoSolicitudRepository;
import com.next.subastas.repository.SolicitudConsignacionRepository;
import com.next.subastas.repository.UsuarioAppRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ConsignacionService {

    @Autowired private SolicitudConsignacionRepository solicitudRepository;
    @Autowired private FotoSolicitudRepository fotoRepository;
    @Autowired private UsuarioAppRepository usuarioAppRepository;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public ConsignacionResumenDTO crearSolicitud(ConsignacionRequest req, String email) {
        if (req.getFotos() == null || req.getFotos().size() < 6) {
            throw new RuntimeException("Se requieren al menos 6 fotos.");
        }
        if (!req.isDeclaraPropiedad() || !req.isDeclaraOrigenLicito()) {
            throw new RuntimeException("Debe aceptar ambas declaraciones para continuar.");
        }

        UsuarioApp usuario = usuarioAppRepository.findByEmail(email).orElseThrow();

        SolicitudConsignacion solicitud = new SolicitudConsignacion();
        solicitud.setCliente(usuario.getCliente());
        solicitud.setDescripcion(req.getDescripcion());
        solicitud.setDatosHistoricos(req.getDatosHistoricos());
        solicitud.setDeclaraPropiedad(true);
        solicitud.setDeclaraOrigenLicito(true);
        solicitud.setCuentaVista(req.getCuentaVista());
        solicitud.setEstado("pendiente");
        solicitud = solicitudRepository.save(solicitud);

        for (String base64 : req.getFotos()) {
            FotoSolicitud foto = new FotoSolicitud();
            foto.setSolicitud(solicitud);
            foto.setFoto(Base64.getDecoder().decode(base64));
            fotoRepository.save(foto);
        }

        return toResumen(solicitud, req.getFotos().size());
    }

    public List<ConsignacionResumenDTO> listarMisSolicitudes(String email) {
        UsuarioApp usuario = usuarioAppRepository.findByEmail(email).orElseThrow();
        Integer clienteId = usuario.getCliente().getIdentificador();

        return solicitudRepository
                .findByClienteIdentificadorOrderByFechaCreacionDesc(clienteId)
                .stream()
                .map(s -> toResumen(s, (int) fotoRepository.countBySolicitudIdentificador(s.getIdentificador())))
                .collect(Collectors.toList());
    }

    public ConsignacionDetalleDTO getDetalle(Integer id, String email) {
        UsuarioApp usuario = usuarioAppRepository.findByEmail(email).orElseThrow();
        SolicitudConsignacion s = solicitudRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        if (!s.getCliente().getIdentificador().equals(usuario.getCliente().getIdentificador())) {
            throw new RuntimeException("No autorizado");
        }

        List<String> fotosB64 = fotoRepository.findBySolicitudIdentificador(id)
                .stream()
                .map(f -> Base64.getEncoder().encodeToString(f.getFoto()))
                .collect(Collectors.toList());

        ConsignacionDetalleDTO dto = new ConsignacionDetalleDTO();
        dto.setId(s.getIdentificador());
        dto.setEstado(s.getEstado());
        dto.setDescripcion(s.getDescripcion());
        dto.setDatosHistoricos(s.getDatosHistoricos());
        dto.setDeclaraPropiedad(s.isDeclaraPropiedad());
        dto.setDeclaraOrigenLicito(s.isDeclaraOrigenLicito());
        dto.setCuentaVista(s.getCuentaVista());
        dto.setMotivoRechazo(s.getMotivoRechazo());
        dto.setValorBase(s.getValorBase());
        dto.setComision(s.getComision());
        dto.setFechaCreacion(s.getFechaCreacion() != null ? s.getFechaCreacion().format(FMT) : null);
        dto.setFotos(fotosB64);

        dto.setDireccionEnvio(s.getDireccionEnvio());
        dto.setGastosDevolucion(s.getGastosDevolucion());

        if (s.getSubastaAsignada() != null) {
            dto.setSubastaFecha(s.getSubastaAsignada().getFecha() != null
                    ? s.getSubastaAsignada().getFecha().toString() : null);
            dto.setSubastaHora(s.getSubastaAsignada().getHora() != null
                    ? s.getSubastaAsignada().getHora().toString().substring(0, 5) : null);
            dto.setSubastaUbicacion(s.getSubastaAsignada().getUbicacion());
        }

        if (s.getSeguro() != null) {
            dto.setNroPoliza(s.getSeguro().getNroPoliza());
            dto.setCompaniaSeguro(s.getSeguro().getCompania());
            dto.setImporteSeguro(s.getSeguro().getImporte());
            dto.setPolizaCombinada(s.getSeguro().getPolizaCombinada());
        }
        dto.setUbicacionDeposito(s.getUbicacionDeposito());

        return dto;
    }

    public void confirmarTerminos(Integer id, boolean acepta, String email) {
        UsuarioApp usuario = usuarioAppRepository.findByEmail(email).orElseThrow();
        SolicitudConsignacion s = solicitudRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        if (!s.getCliente().getIdentificador().equals(usuario.getCliente().getIdentificador())) {
            throw new RuntimeException("No autorizado");
        }
        if (!"aceptada".equals(s.getEstado())) {
            throw new RuntimeException("La solicitud no está pendiente de confirmación.");
        }

        s.setEstado(acepta ? "programada" : "devuelta_por_usuario");
        solicitudRepository.save(s);
    }

    private ConsignacionResumenDTO toResumen(SolicitudConsignacion s, int cantFotos) {
        ConsignacionResumenDTO dto = new ConsignacionResumenDTO();
        dto.setId(s.getIdentificador());
        dto.setEstado(s.getEstado());
        dto.setDescripcion(s.getDescripcion());
        dto.setFechaCreacion(s.getFechaCreacion() != null ? s.getFechaCreacion().format(FMT) : null);
        dto.setCantidadFotos(cantFotos);
        return dto;
    }
}
