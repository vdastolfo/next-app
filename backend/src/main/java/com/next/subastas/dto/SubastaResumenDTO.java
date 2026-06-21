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
    private String rematadorNombre;
    private String rematadorMatricula;
    private Long segundosRestantes;
    private Integer itemActivoId;

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
    public String getRematadorNombre() { return rematadorNombre; }
    public void setRematadorNombre(String rematadorNombre) { this.rematadorNombre = rematadorNombre; }
    public String getRematadorMatricula() { return rematadorMatricula; }
    public void setRematadorMatricula(String rematadorMatricula) { this.rematadorMatricula = rematadorMatricula; }
    public Long getSegundosRestantes() { return segundosRestantes; }
    public void setSegundosRestantes(Long segundosRestantes) { this.segundosRestantes = segundosRestantes; }
    public Integer getItemActivoId() { return itemActivoId; }
    public void setItemActivoId(Integer itemActivoId) { this.itemActivoId = itemActivoId; }
}
