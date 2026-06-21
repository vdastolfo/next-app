package com.next.subastas.model;
import jakarta.persistence.*;

@Entity
@Table(name = "personas")
public class Persona {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;
    @Column(nullable = false, length = 20)
    private String documento;
    @Column(nullable = false, length = 150)
    private String nombre;
    @Column(length = 150)
    private String apellido;
    @Column(length = 250)
    private String direccion;
    @Column(length = 15)
    private String estado;
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String fotoDocFrente;
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String fotoDocDorso;
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String fotoPerfil;

    public Integer getIdentificador() { return identificador; }
    public void setIdentificador(Integer identificador) { this.identificador = identificador; }
    public String getDocumento() { return documento; }
    public void setDocumento(String documento) { this.documento = documento; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getFotoDocFrente() { return fotoDocFrente; }
    public void setFotoDocFrente(String fotoDocFrente) { this.fotoDocFrente = fotoDocFrente; }
    public String getFotoDocDorso() { return fotoDocDorso; }
    public void setFotoDocDorso(String fotoDocDorso) { this.fotoDocDorso = fotoDocDorso; }
    public String getFotoPerfil() { return fotoPerfil; }
    public void setFotoPerfil(String fotoPerfil) { this.fotoPerfil = fotoPerfil; }
}
