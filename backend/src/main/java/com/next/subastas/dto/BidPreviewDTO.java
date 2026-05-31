package com.next.subastas.dto;
import java.math.BigDecimal;

public class BidPreviewDTO {
    private Integer itemId;
    private String nombreProducto;
    private BigDecimal mejorPujaActual;
    private BigDecimal tuPuja;
    private BigDecimal comisionComprador;
    private BigDecimal envioEstimado;
    private BigDecimal totalAPagar;

    public Integer getItemId() { return itemId; }
    public void setItemId(Integer itemId) { this.itemId = itemId; }
    public String getNombreProducto() { return nombreProducto; }
    public void setNombreProducto(String nombreProducto) { this.nombreProducto = nombreProducto; }
    public BigDecimal getMejorPujaActual() { return mejorPujaActual; }
    public void setMejorPujaActual(BigDecimal mejorPujaActual) { this.mejorPujaActual = mejorPujaActual; }
    public BigDecimal getTuPuja() { return tuPuja; }
    public void setTuPuja(BigDecimal tuPuja) { this.tuPuja = tuPuja; }
    public BigDecimal getComisionComprador() { return comisionComprador; }
    public void setComisionComprador(BigDecimal comisionComprador) { this.comisionComprador = comisionComprador; }
    public BigDecimal getEnvioEstimado() { return envioEstimado; }
    public void setEnvioEstimado(BigDecimal envioEstimado) { this.envioEstimado = envioEstimado; }
    public BigDecimal getTotalAPagar() { return totalAPagar; }
    public void setTotalAPagar(BigDecimal totalAPagar) { this.totalAPagar = totalAPagar; }
}
