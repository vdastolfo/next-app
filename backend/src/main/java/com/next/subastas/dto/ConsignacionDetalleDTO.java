package com.next.subastas.dto;

import java.math.BigDecimal;
import java.util.List;

public class ConsignacionDetalleDTO {
    private Integer id;
    private String estado;
    private String descripcion;
    private String datosHistoricos;
    private boolean declaraPropiedad;
    private boolean declaraOrigenLicito;
    private String cuentaVista;
    private String motivoRechazo;
    private BigDecimal valorBase;
    private BigDecimal comision;
    private String subastaFecha;
    private String subastaHora;
    private String subastaUbicacion;
    private String direccionEnvio;
    private BigDecimal gastosDevolucion;
    private String fechaCreacion;
    private List<String> fotos;
    private String nroPoliza;
    private String companiaSeguro;
    private java.math.BigDecimal importeSeguro;
    private String polizaCombinada;
    private String ubicacionDeposito;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getDatosHistoricos() { return datosHistoricos; }
    public void setDatosHistoricos(String datosHistoricos) { this.datosHistoricos = datosHistoricos; }
    public boolean isDeclaraPropiedad() { return declaraPropiedad; }
    public void setDeclaraPropiedad(boolean declaraPropiedad) { this.declaraPropiedad = declaraPropiedad; }
    public boolean isDeclaraOrigenLicito() { return declaraOrigenLicito; }
    public void setDeclaraOrigenLicito(boolean declaraOrigenLicito) { this.declaraOrigenLicito = declaraOrigenLicito; }
    public String getCuentaVista() { return cuentaVista; }
    public void setCuentaVista(String cuentaVista) { this.cuentaVista = cuentaVista; }
    public String getMotivoRechazo() { return motivoRechazo; }
    public void setMotivoRechazo(String motivoRechazo) { this.motivoRechazo = motivoRechazo; }
    public BigDecimal getValorBase() { return valorBase; }
    public void setValorBase(BigDecimal valorBase) { this.valorBase = valorBase; }
    public BigDecimal getComision() { return comision; }
    public void setComision(BigDecimal comision) { this.comision = comision; }
    public String getSubastaFecha() { return subastaFecha; }
    public void setSubastaFecha(String subastaFecha) { this.subastaFecha = subastaFecha; }
    public String getSubastaHora() { return subastaHora; }
    public void setSubastaHora(String subastaHora) { this.subastaHora = subastaHora; }
    public String getSubastaUbicacion() { return subastaUbicacion; }
    public void setSubastaUbicacion(String subastaUbicacion) { this.subastaUbicacion = subastaUbicacion; }
    public String getDireccionEnvio() { return direccionEnvio; }
    public void setDireccionEnvio(String direccionEnvio) { this.direccionEnvio = direccionEnvio; }
    public BigDecimal getGastosDevolucion() { return gastosDevolucion; }
    public void setGastosDevolucion(BigDecimal gastosDevolucion) { this.gastosDevolucion = gastosDevolucion; }
    public String getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(String fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public List<String> getFotos() { return fotos; }
    public void setFotos(List<String> fotos) { this.fotos = fotos; }
    public String getNroPoliza() { return nroPoliza; }
    public void setNroPoliza(String nroPoliza) { this.nroPoliza = nroPoliza; }
    public String getCompaniaSeguro() { return companiaSeguro; }
    public void setCompaniaSeguro(String companiaSeguro) { this.companiaSeguro = companiaSeguro; }
    public java.math.BigDecimal getImporteSeguro() { return importeSeguro; }
    public void setImporteSeguro(java.math.BigDecimal importeSeguro) { this.importeSeguro = importeSeguro; }
    public String getPolizaCombinada() { return polizaCombinada; }
    public void setPolizaCombinada(String polizaCombinada) { this.polizaCombinada = polizaCombinada; }
    public String getUbicacionDeposito() { return ubicacionDeposito; }
    public void setUbicacionDeposito(String ubicacionDeposito) { this.ubicacionDeposito = ubicacionDeposito; }
}
