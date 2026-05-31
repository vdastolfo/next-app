package com.next.subastas.dto;
import jakarta.validation.constraints.NotBlank;

public class NuevaCuentaRequest {
    @NotBlank(message = "El nombre del banco es obligatorio")
    private String nombreBanco;
    @NotBlank(message = "El número de cuenta es obligatorio")
    private String numeroCuenta;
    @NotBlank(message = "El código de banco es obligatorio")
    private String codigoBanco;
    private Integer paisId;

    public String getNombreBanco() { return nombreBanco; }
    public void setNombreBanco(String nombreBanco) { this.nombreBanco = nombreBanco; }
    public String getNumeroCuenta() { return numeroCuenta; }
    public void setNumeroCuenta(String numeroCuenta) { this.numeroCuenta = numeroCuenta; }
    public String getCodigoBanco() { return codigoBanco; }
    public void setCodigoBanco(String codigoBanco) { this.codigoBanco = codigoBanco; }
    public Integer getPaisId() { return paisId; }
    public void setPaisId(Integer paisId) { this.paisId = paisId; }
}
