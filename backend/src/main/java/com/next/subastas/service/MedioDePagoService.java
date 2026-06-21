package com.next.subastas.service;

import com.next.subastas.dto.*;
import com.next.subastas.model.*;
import com.next.subastas.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedioDePagoService {

    @Autowired private MedioDePagoRepository medioDePagoRepository;
    @Autowired private UsuarioAppRepository usuarioAppRepository;

    public List<MedioDePagoDTO> listarMedios(String emailUsuario) {
        UsuarioApp usuario = usuarioAppRepository.findByEmail(emailUsuario).orElseThrow();
        Integer clienteId = usuario.getCliente().getIdentificador();

        return medioDePagoRepository
                .findByClienteIdentificadorAndActivoOrderByFechaAgregadoDesc(clienteId, "si")
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public MedioDePagoDTO agregarTarjeta(NuevaTarjetaRequest req, String emailUsuario) {
        UsuarioApp usuario = usuarioAppRepository.findByEmail(emailUsuario).orElseThrow();

        // Detectar la marca por el primer dígito
        String primeros = req.getNumeroTarjeta().replaceAll("\\s", "");
        String marca = primeros.startsWith("4") ? "Visa" :
                       primeros.startsWith("5") ? "Mastercard" : "Otra";

        MedioDePago medio = new MedioDePago();
        medio.setCliente(usuario.getCliente());
        medio.setTipo("tarjeta");
        medio.setNombreTitular(req.getNombreTitular());
        medio.setUltimosDigitos(primeros.substring(Math.max(0, primeros.length() - 4)));
        medio.setMarcaTarjeta(marca);
        medio.setVencimiento(req.getVencimiento());
        medio.setVerificado("si");
        medio.setActivo("si");

        medioDePagoRepository.save(medio);
        return toDTO(medio);
    }

    public MedioDePagoDTO agregarCuenta(NuevaCuentaRequest req, String emailUsuario) {
        UsuarioApp usuario = usuarioAppRepository.findByEmail(emailUsuario).orElseThrow();

        MedioDePago medio = new MedioDePago();
        medio.setCliente(usuario.getCliente());
        medio.setTipo("cuenta");
        medio.setNombreBanco(req.getNombreBanco());
        medio.setNumeroCuenta(req.getNumeroCuenta());
        medio.setCodigoBanco(req.getCodigoBanco());
        medio.setPais(req.getPaisId());
        medio.setVerificado("si");
        medio.setActivo("si");

        medioDePagoRepository.save(medio);
        return toDTO(medio);
    }

    public MedioDePagoDTO agregarCheque(NuevoChequeRequest req, String emailUsuario) {
        UsuarioApp usuario = usuarioAppRepository.findByEmail(emailUsuario).orElseThrow();

        MedioDePago medio = new MedioDePago();
        medio.setCliente(usuario.getCliente());
        medio.setTipo("cheque");
        medio.setMontoCheque(req.getMonto());
        medio.setVerificado("si");
        medio.setActivo("si");

        medioDePagoRepository.save(medio);
        return toDTO(medio);
    }

    public void eliminarMedio(Integer medioId, String emailUsuario) {
        UsuarioApp usuario = usuarioAppRepository.findByEmail(emailUsuario).orElseThrow();
        MedioDePago medio = medioDePagoRepository.findById(medioId)
                .orElseThrow(() -> new RuntimeException("Método de pago no encontrado"));

        // Verificar que pertenece al usuario
        if (!medio.getCliente().getIdentificador()
                .equals(usuario.getCliente().getIdentificador())) {
            throw new RuntimeException("No tenés permiso para eliminar este método de pago");
        }

        medio.setActivo("no"); // Soft delete
        medioDePagoRepository.save(medio);
    }

    private MedioDePagoDTO toDTO(MedioDePago m) {
        MedioDePagoDTO dto = new MedioDePagoDTO();
        dto.setId(m.getIdentificador());
        dto.setTipo(m.getTipo());
        dto.setVerificado("si".equals(m.getVerificado()));
        dto.setActivo("si".equals(m.getActivo()));

        switch (m.getTipo()) {
            case "tarjeta" -> {
                dto.setDisplay(m.getMarcaTarjeta() + " XXXX-" + m.getUltimosDigitos());
                dto.setLogo(m.getMarcaTarjeta() != null
                    ? m.getMarcaTarjeta().toLowerCase() : "tarjeta");
            }
            case "cuenta" -> {
                dto.setDisplay(m.getNombreBanco() + "\n" + m.getCodigoBanco());
                dto.setLogo("banco");
            }
            case "cheque" -> {
                dto.setDisplay("Cheque certificado $" + m.getMontoCheque());
                dto.setLogo("cheque");
            }
        }
        return dto;
    }
}
