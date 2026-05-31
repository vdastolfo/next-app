package com.next.subastas.dto;
import java.math.BigDecimal;

public class BidRequest {
    private BigDecimal importe;
    private Integer medioDePagoId;

    public BigDecimal getImporte() { return importe; }
    public void setImporte(BigDecimal importe) { this.importe = importe; }
    public Integer getMedioDePagoId() { return medioDePagoId; }
    public void setMedioDePagoId(Integer medioDePagoId) { this.medioDePagoId = medioDePagoId; }
}
