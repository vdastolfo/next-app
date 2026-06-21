package com.next.subastas.model;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "productos")
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;
    private LocalDate fecha;
    @Column(length = 2)
    private String disponible;
    @Column(length = 500)
    private String descripcionCatalogo = "No Posee";
    @Column(nullable = false, length = 300)
    private String descripcionCompleta;
    @Column(nullable = false)
    private Integer revisor;
    @ManyToOne
    @JoinColumn(name = "duenio", nullable = false)
    private Duenio duenio;
    @Column(length = 30)
    private String seguro;

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Foto> fotos;

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Pieza> piezas;

    public Integer getIdentificador() { return identificador; }
    public void setIdentificador(Integer identificador) { this.identificador = identificador; }
    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
    public String getDisponible() { return disponible; }
    public void setDisponible(String disponible) { this.disponible = disponible; }
    public String getDescripcionCatalogo() { return descripcionCatalogo; }
    public void setDescripcionCatalogo(String descripcionCatalogo) { this.descripcionCatalogo = descripcionCatalogo; }
    public String getDescripcionCompleta() { return descripcionCompleta; }
    public void setDescripcionCompleta(String descripcionCompleta) { this.descripcionCompleta = descripcionCompleta; }
    public Integer getRevisor() { return revisor; }
    public void setRevisor(Integer revisor) { this.revisor = revisor; }
    public Duenio getDuenio() { return duenio; }
    public void setDuenio(Duenio duenio) { this.duenio = duenio; }
    public String getSeguro() { return seguro; }
    public void setSeguro(String seguro) { this.seguro = seguro; }

    public List<Foto> getFotos() { return fotos; }
    public void setFotos(List<Foto> fotos) { this.fotos = fotos; }

    public List<Pieza> getPiezas() { return piezas; }
    public void setPiezas(List<Pieza> piezas) { this.piezas = piezas; }
}
