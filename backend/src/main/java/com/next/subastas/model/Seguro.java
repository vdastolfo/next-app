package com.next.subastas.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "seguros")
public class Seguro {

    @Id
    @Column(length = 30, nullable = false)
    private String nroPoliza;

    @Column(length = 150, nullable = false)
    private String compania;

    @Column(length = 2)
    private String polizaCombinada;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal importe;

    public String getNroPoliza() { return nroPoliza; }
    public void setNroPoliza(String nroPoliza) { this.nroPoliza = nroPoliza; }
    public String getCompania() { return compania; }
    public void setCompania(String compania) { this.compania = compania; }
    public String getPolizaCombinada() { return polizaCombinada; }
    public void setPolizaCombinada(String polizaCombinada) { this.polizaCombinada = polizaCombinada; }
    public BigDecimal getImporte() { return importe; }
    public void setImporte(BigDecimal importe) { this.importe = importe; }
}
