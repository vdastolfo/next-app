package com.next.subastas.dto;

public class ConsignacionResumenDTO {
    private Integer id;
    private String estado;
    private String descripcion;
    private String fechaCreacion;
    private int cantidadFotos;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(String fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public int getCantidadFotos() { return cantidadFotos; }
    public void setCantidadFotos(int cantidadFotos) { this.cantidadFotos = cantidadFotos; }
}
