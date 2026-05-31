package com.next.subastas.dto;
import java.math.BigDecimal;

public class PujaActivaDTO {
    private Integer pujaId;
    private Integer itemId;
    private String nombreProducto;
    private String imagenUrl;
    private BigDecimal tuPuja;
    private BigDecimal mejorPuja;
    private boolean eresElMejor;
    private Long segundosRestantes;
    private String loteNumero;
    private String estadoSubasta;

    public Integer getPujaId() { return pujaId; }
    public void setPujaId(Integer pujaId) { this.pujaId = pujaId; }
    public Integer getItemId() { return itemId; }
    public void setItemId(Integer itemId) { this.itemId = itemId; }
    public String getNombreProducto() { return nombreProducto; }
    public void setNombreProducto(String nombreProducto) { this.nombreProducto = nombreProducto; }
    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }
    public BigDecimal getTuPuja() { return tuPuja; }
    public void setTuPuja(BigDecimal tuPuja) { this.tuPuja = tuPuja; }
    public BigDecimal getMejorPuja() { return mejorPuja; }
    public void setMejorPuja(BigDecimal mejorPuja) { this.mejorPuja = mejorPuja; }
    public boolean isEresElMejor() { return eresElMejor; }
    public void setEresElMejor(boolean eresElMejor) { this.eresElMejor = eresElMejor; }
    public Long getSegundosRestantes() { return segundosRestantes; }
    public void setSegundosRestantes(Long segundosRestantes) { this.segundosRestantes = segundosRestantes; }
    public String getLoteNumero() { return loteNumero; }
    public void setLoteNumero(String loteNumero) { this.loteNumero = loteNumero; }
    public String getEstadoSubasta() { return estadoSubasta; }
    public void setEstadoSubasta(String estadoSubasta) { this.estadoSubasta = estadoSubasta; }
}
