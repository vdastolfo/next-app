package com.next.subastas.model;
import jakarta.persistence.*;

@Entity
@Table(name = "subastadores")
public class Subastador {
    @Id
    private Integer identificador;

    @OneToOne
    @MapsId
    @JoinColumn(name = "identificador")
    private Persona persona;

    @Column(length = 15)
    private String matricula;

    @Column(length = 50)
    private String region;

    public Integer getIdentificador() { return identificador; }
    public void setIdentificador(Integer identificador) { this.identificador = identificador; }
    public Persona getPersona() { return persona; }
    public void setPersona(Persona persona) { this.persona = persona; }
    public String getMatricula() { return matricula; }
    public void setMatricula(String matricula) { this.matricula = matricula; }
    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }
}
