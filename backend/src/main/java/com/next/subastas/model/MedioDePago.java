package com.next.subastas.model;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "mediosDePago")
public class MedioDePago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;
    @ManyToOne
    @JoinColumn(name = "cliente", nullable = false)
    private Cliente cliente;
    @Column(nullable = false, length = 20)
    private String tipo;
    private String nombreTitular;
    private String ultimosDigitos;
    private String marcaTarjeta;
    private String vencimiento;
    private String nombreBanco;
    private String numeroCuenta;
    private String codigoBanco;
    private Integer pais;
    private BigDecimal montoCheque;
    @Column(length = 2)
    private String verificado = "no";
    @Column(length = 2)
    private String activo = "si";
    private LocalDateTime fechaAgregado = LocalDateTime.now();

    public Integer getIdentificador() { return identificador; }
    public void setIdentificador(Integer identificador) { this.identificador = identificador; }
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getNombreTitular() { return nombreTitular; }
    public void setNombreTitular(String nombreTitular) { this.nombreTitular = nombreTitular; }
    public String getUltimosDigitos() { return ultimosDigitos; }
    public void setUltimosDigitos(String ultimosDigitos) { this.ultimosDigitos = ultimosDigitos; }
    public String getMarcaTarjeta() { return marcaTarjeta; }
    public void setMarcaTarjeta(String marcaTarjeta) { this.marcaTarjeta = marcaTarjeta; }
    public String getVencimiento() { return vencimiento; }
    public void setVencimiento(String vencimiento) { this.vencimiento = vencimiento; }
    public String getNombreBanco() { return nombreBanco; }
    public void setNombreBanco(String nombreBanco) { this.nombreBanco = nombreBanco; }
    public String getNumeroCuenta() { return numeroCuenta; }
    public void setNumeroCuenta(String numeroCuenta) { this.numeroCuenta = numeroCuenta; }
    public String getCodigoBanco() { return codigoBanco; }
    public void setCodigoBanco(String codigoBanco) { this.codigoBanco = codigoBanco; }
    public Integer getPais() { return pais; }
    public void setPais(Integer pais) { this.pais = pais; }
    public BigDecimal getMontoCheque() { return montoCheque; }
    public void setMontoCheque(BigDecimal montoCheque) { this.montoCheque = montoCheque; }
    public String getVerificado() { return verificado; }
    public void setVerificado(String verificado) { this.verificado = verificado; }
    public String getActivo() { return activo; }
    public void setActivo(String activo) { this.activo = activo; }
    public LocalDateTime getFechaAgregado() { return fechaAgregado; }
    public void setFechaAgregado(LocalDateTime fechaAgregado) { this.fechaAgregado = fechaAgregado; }
}
