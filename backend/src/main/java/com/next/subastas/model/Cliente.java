package com.next.subastas.model;
import jakarta.persistence.*;

@Entity
@Table(name = "clientes")
public class Cliente {
    @Id
    private Integer identificador;
    @OneToOne
    @MapsId
    @JoinColumn(name = "identificador")
    private Persona persona;
    @Column(name = "numeroPais")
    private Integer numeroPais;
    @Column(length = 2)
    private String admitido;
    @Column(length = 10)
    private String categoria;
    @Column(nullable = false)
    private Integer verificador;

    public Integer getIdentificador() { return identificador; }
    public void setIdentificador(Integer identificador) { this.identificador = identificador; }
    public Persona getPersona() { return persona; }
    public void setPersona(Persona persona) { this.persona = persona; }
    public Integer getNumeroPais() { return numeroPais; }
    public void setNumeroPais(Integer numeroPais) { this.numeroPais = numeroPais; }
    public String getAdmitido() { return admitido; }
    public void setAdmitido(String admitido) { this.admitido = admitido; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public Integer getVerificador() { return verificador; }
    public void setVerificador(Integer verificador) { this.verificador = verificador; }
}
