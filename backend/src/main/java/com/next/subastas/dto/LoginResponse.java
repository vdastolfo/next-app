package com.next.subastas.dto;

public class LoginResponse {
    private String token;
    private String email;
    private String nombre;
    private String categoria;
    private Integer clienteId;

    public LoginResponse(String token, String email, String nombre, String categoria, Integer clienteId) {
        this.token = token;
        this.email = email;
        this.nombre = nombre;
        this.categoria = categoria;
        this.clienteId = clienteId;
    }

    public String getToken() { return token; }
    public String getEmail() { return email; }
    public String getNombre() { return nombre; }
    public String getCategoria() { return categoria; }
    public Integer getClienteId() { return clienteId; }
}
