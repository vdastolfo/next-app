package com.next.subastas.model;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuariosApp")
public class UsuarioApp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;
    @ManyToOne
    @JoinColumn(name = "cliente", nullable = false)
    private Cliente cliente;
    @Column(nullable = false, unique = true, length = 200)
    private String email;
    @Column(nullable = false, length = 500)
    private String passwordHash;
    @Column(length = 2)
    private String activo = "si";
    @Column(name = "fechaCreacion")
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(length = 6)
    private String codigoVerificacion;

    private LocalDateTime codigoExpiracion;

    public Integer getIdentificador() { return identificador; }
    public void setIdentificador(Integer identificador) { this.identificador = identificador; }
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getActivo() { return activo; }
    public void setActivo(String activo) { this.activo = activo; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public String getCodigoVerificacion() { return codigoVerificacion; }
    public void setCodigoVerificacion(String codigoVerificacion) { this.codigoVerificacion = codigoVerificacion; }
    public LocalDateTime getCodigoExpiracion() { return codigoExpiracion; }
    public void setCodigoExpiracion(LocalDateTime codigoExpiracion) { this.codigoExpiracion = codigoExpiracion; }
}
