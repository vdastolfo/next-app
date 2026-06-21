package com.next.subastas.dto;

import java.math.BigDecimal;

public class BidUpdateMessage {
    private Integer itemId;
    private BigDecimal mejorPuja;
    private BigDecimal pujaMinima;
    private BigDecimal pujaMaxima;
    // null = puja normal; "CERRADO" = ítem cerrado (subasta terminada para ese lote)
    private String tipo;
    private Integer ganadorClienteId;

    public Integer getItemId() { return itemId; }
    public void setItemId(Integer itemId) { this.itemId = itemId; }
    public BigDecimal getMejorPuja() { return mejorPuja; }
    public void setMejorPuja(BigDecimal mejorPuja) { this.mejorPuja = mejorPuja; }
    public BigDecimal getPujaMinima() { return pujaMinima; }
    public void setPujaMinima(BigDecimal pujaMinima) { this.pujaMinima = pujaMinima; }
    public BigDecimal getPujaMaxima() { return pujaMaxima; }
    public void setPujaMaxima(BigDecimal pujaMaxima) { this.pujaMaxima = pujaMaxima; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public Integer getGanadorClienteId() { return ganadorClienteId; }
    public void setGanadorClienteId(Integer ganadorClienteId) { this.ganadorClienteId = ganadorClienteId; }
}
