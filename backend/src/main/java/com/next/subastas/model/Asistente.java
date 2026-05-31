package com.next.subastas.model;
import jakarta.persistence.*;

@Entity
@Table(name = "asistentes")
public class Asistente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;
    @Column(nullable = false)
    private Integer numeroPostor;
    @ManyToOne
    @JoinColumn(name = "cliente", nullable = false)
    private Cliente cliente;
    @ManyToOne
    @JoinColumn(name = "subasta", nullable = false)
    private Subasta subasta;

    public Integer getIdentificador() { return identificador; }
    public void setIdentificador(Integer identificador) { this.identificador = identificador; }
    public Integer getNumeroPostor() { return numeroPostor; }
    public void setNumeroPostor(Integer numeroPostor) { this.numeroPostor = numeroPostor; }
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    public Subasta getSubasta() { return subasta; }
    public void setSubasta(Subasta subasta) { this.subasta = subasta; }
}
