package com.next.subastas.dto;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PujaGanadaDTO {
    private Integer pujaId;
    private Integer itemId;
    private String nombreProducto;
    private BigDecimal importePagado;
    private LocalDateTime fechaGanada;
    private String loteNumero;

    public Integer getPujaId() { return pujaId; }
    public void setPujaId(Integer pujaId) { this.pujaId = pujaId; }
    public Integer getItemId() { return itemId; }
    public void setItemId(Integer itemId) { this.itemId = itemId; }
    public String getNombreProducto() { return nombreProducto; }
    public void setNombreProducto(String nombreProducto) { this.nombreProducto = nombreProducto; }
    public BigDecimal getImportePagado() { return importePagado; }
    public void setImportePagado(BigDecimal importePagado) { this.importePagado = importePagado; }
    public LocalDateTime getFechaGanada() { return fechaGanada; }
    public void setFechaGanada(LocalDateTime fechaGanada) { this.fechaGanada = fechaGanada; }
    public String getLoteNumero() { return loteNumero; }
    public void setLoteNumero(String loteNumero) { this.loteNumero = loteNumero; }
}
