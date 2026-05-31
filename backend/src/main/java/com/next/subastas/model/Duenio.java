package com.next.subastas.model;
import jakarta.persistence.*;

@Entity
@Table(name = "duenios")
public class Duenio {
    @Id
    private Integer identificador;
    @OneToOne
    @MapsId
    @JoinColumn(name = "identificador")
    private Persona persona;
    private Integer numeroPais;
    private String verificacionFinanciera;
    private String verificacionJudicial;
    private Integer calificacionRiesgo;
    private Integer verificador;

    public Integer getIdentificador() { return identificador; }
    public void setIdentificador(Integer identificador) { this.identificador = identificador; }
    public Persona getPersona() { return persona; }
    public void setPersona(Persona persona) { this.persona = persona; }
    public Integer getNumeroPais() { return numeroPais; }
    public void setNumeroPais(Integer numeroPais) { this.numeroPais = numeroPais; }
    public String getVerificacionFinanciera() { return verificacionFinanciera; }
    public void setVerificacionFinanciera(String v) { this.verificacionFinanciera = v; }
    public String getVerificacionJudicial() { return verificacionJudicial; }
    public void setVerificacionJudicial(String v) { this.verificacionJudicial = v; }
    public Integer getCalificacionRiesgo() { return calificacionRiesgo; }
    public void setCalificacionRiesgo(Integer calificacionRiesgo) { this.calificacionRiesgo = calificacionRiesgo; }
    public Integer getVerificador() { return verificador; }
    public void setVerificador(Integer verificador) { this.verificador = verificador; }
}
