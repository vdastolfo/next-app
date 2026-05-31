package com.next.subastas.dto;

public class MedioDePagoDTO {
    private Integer id;
    private String tipo;
    private String display;
    private String logo;
    private boolean verificado;
    private boolean activo;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getDisplay() { return display; }
    public void setDisplay(String display) { this.display = display; }
    public String getLogo() { return logo; }
    public void setLogo(String logo) { this.logo = logo; }
    public boolean isVerificado() { return verificado; }
    public void setVerificado(boolean verificado) { this.verificado = verificado; }
    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }
}
