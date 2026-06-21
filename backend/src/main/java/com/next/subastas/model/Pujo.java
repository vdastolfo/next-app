package com.next.subastas.model;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pujos")
public class Pujo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;
    @ManyToOne
    @JoinColumn(name = "asistente", nullable = false)
    private Asistente asistente;
    @ManyToOne
    @JoinColumn(name = "item", nullable = false)
    private ItemCatalogo item;
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal importe;
    @Column(length = 2)
    private String ganador = "no";
    @Column(nullable = false)
    private LocalDateTime fechaHora = LocalDateTime.now();
    @Column(length = 20)
    private String estadoPago;
    @Column(length = 30)
    private String estadoPaquete;
    @ManyToOne
    @JoinColumn(name = "medioDePago")
    private MedioDePago medioDePago;

    public Integer getIdentificador() { return identificador; }
    public void setIdentificador(Integer identificador) { this.identificador = identificador; }
    public Asistente getAsistente() { return asistente; }
    public void setAsistente(Asistente asistente) { this.asistente = asistente; }
    public ItemCatalogo getItem() { return item; }
    public void setItem(ItemCatalogo item) { this.item = item; }
    public BigDecimal getImporte() { return importe; }
    public void setImporte(BigDecimal importe) { this.importe = importe; }
    public String getGanador() { return ganador; }
    public void setGanador(String ganador) { this.ganador = ganador; }
    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }
    public String getEstadoPago() { return estadoPago; }
    public void setEstadoPago(String estadoPago) { this.estadoPago = estadoPago; }
    public String getEstadoPaquete() { return estadoPaquete; }
    public void setEstadoPaquete(String estadoPaquete) { this.estadoPaquete = estadoPaquete; }
    public MedioDePago getMedioDePago() { return medioDePago; }
    public void setMedioDePago(MedioDePago medioDePago) { this.medioDePago = medioDePago; }
}
