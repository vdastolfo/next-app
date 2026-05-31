package com.next.subastas.model;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "itemsCatalogo")
public class ItemCatalogo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;
    @Column(nullable = false)
    private Integer catalogo;
    @ManyToOne
    @JoinColumn(name = "producto", nullable = false)
    private Producto producto;
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal precioBase;
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal comision;
    @Column(length = 2)
    private String subastado = "no";

    public Integer getIdentificador() { return identificador; }
    public void setIdentificador(Integer identificador) { this.identificador = identificador; }
    public Integer getCatalogo() { return catalogo; }
    public void setCatalogo(Integer catalogo) { this.catalogo = catalogo; }
    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) { this.producto = producto; }
    public BigDecimal getPrecioBase() { return precioBase; }
    public void setPrecioBase(BigDecimal precioBase) { this.precioBase = precioBase; }
    public BigDecimal getComision() { return comision; }
    public void setComision(BigDecimal comision) { this.comision = comision; }
    public String getSubastado() { return subastado; }
    public void setSubastado(String subastado) { this.subastado = subastado; }
}
