package com.next.subastas.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "solicitudesConsignacion")
public class SolicitudConsignacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;

    @ManyToOne
    @JoinColumn(name = "cliente", nullable = false)
    private Cliente cliente;

    @Column(columnDefinition = "VARCHAR(MAX)", nullable = false)
    private String descripcion;

    @Column(columnDefinition = "VARCHAR(MAX)")
    private String datosHistoricos;

    @Column(nullable = false)
    private boolean declaraPropiedad;

    @Column(nullable = false)
    private boolean declaraOrigenLicito;

    @Column(length = 20, nullable = false)
    private String estado = "pendiente";

    @Column(columnDefinition = "VARCHAR(MAX)")
    private String motivoRechazo;

    @Column(precision = 18, scale = 2)
    private BigDecimal valorBase;

    @Column(precision = 5, scale = 2)
    private BigDecimal comision;

    @ManyToOne
    @JoinColumn(name = "subastaAsignada")
    private Subasta subastaAsignada;

    @Column(length = 500)
    private String cuentaVista;

    @Column(length = 500)
    private String direccionEnvio;

    @Column(precision = 18, scale = 2)
    private BigDecimal gastosDevolucion;

    @ManyToOne
    @JoinColumn(name = "seguro")
    private Seguro seguro;

    @Column(length = 500)
    private String ubicacionDeposito;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    public Integer getIdentificador() { return identificador; }
    public void setIdentificador(Integer identificador) { this.identificador = identificador; }
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getDatosHistoricos() { return datosHistoricos; }
    public void setDatosHistoricos(String datosHistoricos) { this.datosHistoricos = datosHistoricos; }
    public boolean isDeclaraPropiedad() { return declaraPropiedad; }
    public void setDeclaraPropiedad(boolean declaraPropiedad) { this.declaraPropiedad = declaraPropiedad; }
    public boolean isDeclaraOrigenLicito() { return declaraOrigenLicito; }
    public void setDeclaraOrigenLicito(boolean declaraOrigenLicito) { this.declaraOrigenLicito = declaraOrigenLicito; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getMotivoRechazo() { return motivoRechazo; }
    public void setMotivoRechazo(String motivoRechazo) { this.motivoRechazo = motivoRechazo; }
    public BigDecimal getValorBase() { return valorBase; }
    public void setValorBase(BigDecimal valorBase) { this.valorBase = valorBase; }
    public BigDecimal getComision() { return comision; }
    public void setComision(BigDecimal comision) { this.comision = comision; }
    public Subasta getSubastaAsignada() { return subastaAsignada; }
    public void setSubastaAsignada(Subasta subastaAsignada) { this.subastaAsignada = subastaAsignada; }
    public String getCuentaVista() { return cuentaVista; }
    public void setCuentaVista(String cuentaVista) { this.cuentaVista = cuentaVista; }
    public String getDireccionEnvio() { return direccionEnvio; }
    public void setDireccionEnvio(String direccionEnvio) { this.direccionEnvio = direccionEnvio; }
    public BigDecimal getGastosDevolucion() { return gastosDevolucion; }
    public void setGastosDevolucion(BigDecimal gastosDevolucion) { this.gastosDevolucion = gastosDevolucion; }
    public Seguro getSeguro() { return seguro; }
    public void setSeguro(Seguro seguro) { this.seguro = seguro; }
    public String getUbicacionDeposito() { return ubicacionDeposito; }
    public void setUbicacionDeposito(String ubicacionDeposito) { this.ubicacionDeposito = ubicacionDeposito; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}
