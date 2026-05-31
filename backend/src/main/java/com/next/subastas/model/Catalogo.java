package com.next.subastas.model;

import jakarta.persistence.*;

@Entity
@Table(name = "catalogos")
public class Catalogo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;

    @Column(nullable = false, length = 250)
    private String descripcion;

    private Integer subasta;

    @Column(nullable = false)
    private Integer responsable;

    public Integer getIdentificador() { return identificador; }
    public void setIdentificador(Integer identificador) { this.identificador = identificador; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public Integer getSubasta() { return subasta; }
    public void setSubasta(Integer subasta) { this.subasta = subasta; }
    public Integer getResponsable() { return responsable; }
    public void setResponsable(Integer responsable) { this.responsable = responsable; }
}