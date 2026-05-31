package com.next.subastas.dto;
import java.time.LocalDate;
import java.time.LocalTime;

public class SubastaResumenDTO {
    private Integer id;
    private String categoria;
    private String estado;
    private String moneda;
    private LocalDate fecha;
    private LocalTime hora;
    private String ubicacion;
    private Integer totalItems;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getMoneda() { return moneda; }
    public void setMoneda(String moneda) { this.moneda = moneda; }
    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
    public LocalTime getHora() { return hora; }
    public void setHora(LocalTime hora) { this.hora = hora; }
    public String getUbicacion() { return ubicacion; }
    public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }
    public Integer getTotalItems() { return totalItems; }
    public void setTotalItems(Integer totalItems) { this.totalItems = totalItems; }
}
