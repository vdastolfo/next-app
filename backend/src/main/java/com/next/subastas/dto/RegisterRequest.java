package com.next.subastas.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class RegisterRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    @NotBlank(message = "El documento es obligatorio")
    private String documento;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El formato del email no es válido")
    private String email;

    @NotBlank(message = "El domicilio legal es obligatorio")
    private String domicilio;

    @NotBlank(message = "El país de origen es obligatorio")
    private String pais;

    // Base64 de las fotos — opcionales en el envío pero requeridas en el negocio
    private String fotoDocFrente;
    private String fotoDocDorso;

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }
    public String getDocumento() { return documento; }
    public void setDocumento(String documento) { this.documento = documento; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getDomicilio() { return domicilio; }
    public void setDomicilio(String domicilio) { this.domicilio = domicilio; }
    public String getPais() { return pais; }
    public void setPais(String pais) { this.pais = pais; }
    public String getFotoDocFrente() { return fotoDocFrente; }
    public void setFotoDocFrente(String fotoDocFrente) { this.fotoDocFrente = fotoDocFrente; }
    public String getFotoDocDorso() { return fotoDocDorso; }
    public void setFotoDocDorso(String fotoDocDorso) { this.fotoDocDorso = fotoDocDorso; }
}
