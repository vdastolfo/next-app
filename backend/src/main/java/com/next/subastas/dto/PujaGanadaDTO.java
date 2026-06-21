package com.next.subastas.dto;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class PujaGanadaDTO {
    private Integer pujaId;
    private Integer itemId;
    private String nombreProducto;
    private BigDecimal importePagado;
    private LocalDateTime fechaGanada;
    private String loteNumero;
    private List<Integer> fotoIds;
    private String estadoPago;
    private String estadoPaquete;
    private String moneda;

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
    public List<Integer> getFotoIds() { return fotoIds; }
    public void setFotoIds(List<Integer> fotoIds) { this.fotoIds = fotoIds; }
    public String getEstadoPago() { return estadoPago; }
    public void setEstadoPago(String estadoPago) { this.estadoPago = estadoPago; }
    public String getEstadoPaquete() { return estadoPaquete; }
    public void setEstadoPaquete(String estadoPaquete) { this.estadoPaquete = estadoPaquete; }
    public String getMoneda() { return moneda; }
    public void setMoneda(String moneda) { this.moneda = moneda; }
}
