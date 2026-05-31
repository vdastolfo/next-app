package com.next.subastas.dto;
import java.math.BigDecimal;

public class ItemDetalleDTO {
    private Integer id;
    private String nombreProducto;
    private String descripcionCompleta;
    private BigDecimal precioBase;
    private BigDecimal mejorPujaActual;
    private BigDecimal pujaMinima;
    private BigDecimal pujaMaxima;
    private BigDecimal comision;
    private String subastado;
    private Integer subastaId;
    private String categoriaSubasta;
    private String monedaSubasta;
    private String loteNumero;
    private Long segundosRestantes;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getNombreProducto() { return nombreProducto; }
    public void setNombreProducto(String nombreProducto) { this.nombreProducto = nombreProducto; }
    public String getDescripcionCompleta() { return descripcionCompleta; }
    public void setDescripcionCompleta(String descripcionCompleta) { this.descripcionCompleta = descripcionCompleta; }
    public BigDecimal getPrecioBase() { return precioBase; }
    public void setPrecioBase(BigDecimal precioBase) { this.precioBase = precioBase; }
    public BigDecimal getMejorPujaActual() { return mejorPujaActual; }
    public void setMejorPujaActual(BigDecimal mejorPujaActual) { this.mejorPujaActual = mejorPujaActual; }
    public BigDecimal getPujaMinima() { return pujaMinima; }
    public void setPujaMinima(BigDecimal pujaMinima) { this.pujaMinima = pujaMinima; }
    public BigDecimal getPujaMaxima() { return pujaMaxima; }
    public void setPujaMaxima(BigDecimal pujaMaxima) { this.pujaMaxima = pujaMaxima; }
    public BigDecimal getComision() { return comision; }
    public void setComision(BigDecimal comision) { this.comision = comision; }
    public String getSubastado() { return subastado; }
    public void setSubastado(String subastado) { this.subastado = subastado; }
    public Integer getSubastaId() { return subastaId; }
    public void setSubastaId(Integer subastaId) { this.subastaId = subastaId; }
    public String getCategoriaSubasta() { return categoriaSubasta; }
    public void setCategoriaSubasta(String categoriaSubasta) { this.categoriaSubasta = categoriaSubasta; }
    public String getMonedaSubasta() { return monedaSubasta; }
    public void setMonedaSubasta(String monedaSubasta) { this.monedaSubasta = monedaSubasta; }
    public String getLoteNumero() { return loteNumero; }
    public void setLoteNumero(String loteNumero) { this.loteNumero = loteNumero; }
    public Long getSegundosRestantes() { return segundosRestantes; }
    public void setSegundosRestantes(Long segundosRestantes) { this.segundosRestantes = segundosRestantes; }
}
