package com.next.subastas.dto;
import jakarta.validation.constraints.NotBlank;

public class NuevaTarjetaRequest {
    @NotBlank(message = "El nombre en la tarjeta es obligatorio")
    private String nombreTitular;
    @NotBlank(message = "El número de tarjeta es obligatorio")
    private String numeroTarjeta;
    @NotBlank(message = "La fecha de vencimiento es obligatoria")
    private String vencimiento;
    @NotBlank(message = "El CVV es obligatorio")
    private String cvv;

    public String getNombreTitular() { return nombreTitular; }
    public void setNombreTitular(String nombreTitular) { this.nombreTitular = nombreTitular; }
    public String getNumeroTarjeta() { return numeroTarjeta; }
    public void setNumeroTarjeta(String numeroTarjeta) { this.numeroTarjeta = numeroTarjeta; }
    public String getVencimiento() { return vencimiento; }
    public void setVencimiento(String vencimiento) { this.vencimiento = vencimiento; }
    public String getCvv() { return cvv; }
    public void setCvv(String cvv) { this.cvv = cvv; }
}
