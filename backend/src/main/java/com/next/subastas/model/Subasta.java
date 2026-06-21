package com.next.subastas.model;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "subastas")
public class Subasta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;
    private LocalDate fecha;
    @Column(nullable = false)
    private LocalTime hora;
    @Column(length = 10)
    private String estado;
    @ManyToOne
    @JoinColumn(name = "subastador", nullable = false)
    private Subastador subastador;
    @Column(length = 350)
    private String ubicacion;
    private Integer capacidadAsistentes;
    @Column(length = 2)
    private String tieneDeposito;
    @Column(length = 2)
    private String seguridadPropia;
    @Column(length = 10)
    private String categoria;
    @Column(length = 10, nullable = false)
    private String moneda = "pesos";
    private Integer duracionMinutos;
    private LocalDateTime fechaFin;
    private Integer itemActivo;

    public Integer getIdentificador() { return identificador; }
    public void setIdentificador(Integer identificador) { this.identificador = identificador; }
    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
    public LocalTime getHora() { return hora; }
    public void setHora(LocalTime hora) { this.hora = hora; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public Subastador getSubastador() { return subastador; }
    public void setSubastador(Subastador subastador) { this.subastador = subastador; }
    public String getUbicacion() { return ubicacion; }
    public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }
    public Integer getCapacidadAsistentes() { return capacidadAsistentes; }
    public void setCapacidadAsistentes(Integer capacidadAsistentes) { this.capacidadAsistentes = capacidadAsistentes; }
    public String getTieneDeposito() { return tieneDeposito; }
    public void setTieneDeposito(String tieneDeposito) { this.tieneDeposito = tieneDeposito; }
    public String getSeguridadPropia() { return seguridadPropia; }
    public void setSeguridadPropia(String seguridadPropia) { this.seguridadPropia = seguridadPropia; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public String getMoneda() { return moneda; }
    public void setMoneda(String moneda) { this.moneda = moneda; }
    public Integer getDuracionMinutos() { return duracionMinutos; }
    public void setDuracionMinutos(Integer duracionMinutos) { this.duracionMinutos = duracionMinutos; }
    public LocalDateTime getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDateTime fechaFin) { this.fechaFin = fechaFin; }
    public Integer getItemActivo() { return itemActivo; }
    public void setItemActivo(Integer itemActivo) { this.itemActivo = itemActivo; }
}
