package com.next.subastas.model;

import jakarta.persistence.*;

@Entity
@Table(name = "fotosSolicitud")
public class FotoSolicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;

    @ManyToOne
    @JoinColumn(name = "solicitud", nullable = false)
    private SolicitudConsignacion solicitud;

    @Column(columnDefinition = "VARBINARY(MAX)", nullable = false)
    private byte[] foto;

    public Integer getIdentificador() { return identificador; }
    public void setIdentificador(Integer identificador) { this.identificador = identificador; }
    public SolicitudConsignacion getSolicitud() { return solicitud; }
    public void setSolicitud(SolicitudConsignacion solicitud) { this.solicitud = solicitud; }
    public byte[] getFoto() { return foto; }
    public void setFoto(byte[] foto) { this.foto = foto; }
}
