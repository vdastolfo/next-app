package com.next.subastas.dto;

import java.util.List;

public class ConsignacionRequest {
    private String descripcion;
    private String datosHistoricos;
    private boolean declaraPropiedad;
    private boolean declaraOrigenLicito;
    private String cuentaVista;
    private List<String> fotos;

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
    public List<String> getFotos() { return fotos; }
    public void setFotos(List<String> fotos) { this.fotos = fotos; }
}
