package com.next.subastas.dto;

public class PiezaDTO {
    private Integer id;
    private String descripcion;
    private Integer cantidad;

    public PiezaDTO() {}

    public PiezaDTO(Integer id, String descripcion, Integer cantidad) {
        this.id = id;
        this.descripcion = descripcion;
        this.cantidad = cantidad;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
}
