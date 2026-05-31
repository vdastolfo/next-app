package com.next.subastas.dto;
import java.math.BigDecimal;

public class NuevoChequeRequest {
    private BigDecimal monto;
    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }
}
