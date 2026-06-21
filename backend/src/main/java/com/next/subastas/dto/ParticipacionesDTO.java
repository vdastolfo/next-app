package com.next.subastas.dto;

import java.math.BigDecimal;
import java.util.List;

public class ParticipacionesDTO {

    private int subastasAsistidas;
    private int itemsGanados;
    private int itemsPujados;
    private double winRate;
    private BigDecimal totalOfertado;
    private BigDecimal totalPagado;
    private List<MetricaCategoria> porCategoria;
    private List<HistorialSubasta> historial;
    private String categoriaActual;
    private boolean subioCategoria;

    public static class MetricaCategoria {
        private String categoria;
        private int subastasAsistidas;
        private int itemsGanados;
        private int itemsPujados;
        private BigDecimal totalOfertado;
        private BigDecimal totalPagado;

        public String getCategoria() { return categoria; }
        public void setCategoria(String categoria) { this.categoria = categoria; }
        public int getSubastasAsistidas() { return subastasAsistidas; }
        public void setSubastasAsistidas(int subastasAsistidas) { this.subastasAsistidas = subastasAsistidas; }
        public int getItemsGanados() { return itemsGanados; }
        public void setItemsGanados(int itemsGanados) { this.itemsGanados = itemsGanados; }
        public int getItemsPujados() { return itemsPujados; }
        public void setItemsPujados(int itemsPujados) { this.itemsPujados = itemsPujados; }
        public BigDecimal getTotalOfertado() { return totalOfertado; }
        public void setTotalOfertado(BigDecimal totalOfertado) { this.totalOfertado = totalOfertado; }
        public BigDecimal getTotalPagado() { return totalPagado; }
        public void setTotalPagado(BigDecimal totalPagado) { this.totalPagado = totalPagado; }
    }

    public static class HistorialSubasta {
        private Integer subastaId;
        private String categoria;
        private String fecha;
        private String ubicacion;
        private String moneda;
        private int pujasRealizadas;
        private int itemsPujados;
        private int itemsGanados;
        private BigDecimal totalOfertado;
        private BigDecimal totalPagado;

        public Integer getSubastaId() { return subastaId; }
        public void setSubastaId(Integer subastaId) { this.subastaId = subastaId; }
        public String getCategoria() { return categoria; }
        public void setCategoria(String categoria) { this.categoria = categoria; }
        public String getFecha() { return fecha; }
        public void setFecha(String fecha) { this.fecha = fecha; }
        public String getUbicacion() { return ubicacion; }
        public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }
        public String getMoneda() { return moneda; }
        public void setMoneda(String moneda) { this.moneda = moneda; }
        public int getPujasRealizadas() { return pujasRealizadas; }
        public void setPujasRealizadas(int pujasRealizadas) { this.pujasRealizadas = pujasRealizadas; }
        public int getItemsPujados() { return itemsPujados; }
        public void setItemsPujados(int itemsPujados) { this.itemsPujados = itemsPujados; }
        public int getItemsGanados() { return itemsGanados; }
        public void setItemsGanados(int itemsGanados) { this.itemsGanados = itemsGanados; }
        public BigDecimal getTotalOfertado() { return totalOfertado; }
        public void setTotalOfertado(BigDecimal totalOfertado) { this.totalOfertado = totalOfertado; }
        public BigDecimal getTotalPagado() { return totalPagado; }
        public void setTotalPagado(BigDecimal totalPagado) { this.totalPagado = totalPagado; }
    }

    public int getSubastasAsistidas() { return subastasAsistidas; }
    public void setSubastasAsistidas(int subastasAsistidas) { this.subastasAsistidas = subastasAsistidas; }
    public int getItemsGanados() { return itemsGanados; }
    public void setItemsGanados(int itemsGanados) { this.itemsGanados = itemsGanados; }
    public int getItemsPujados() { return itemsPujados; }
    public void setItemsPujados(int itemsPujados) { this.itemsPujados = itemsPujados; }
    public double getWinRate() { return winRate; }
    public void setWinRate(double winRate) { this.winRate = winRate; }
    public BigDecimal getTotalOfertado() { return totalOfertado; }
    public void setTotalOfertado(BigDecimal totalOfertado) { this.totalOfertado = totalOfertado; }
    public BigDecimal getTotalPagado() { return totalPagado; }
    public void setTotalPagado(BigDecimal totalPagado) { this.totalPagado = totalPagado; }
    public List<MetricaCategoria> getPorCategoria() { return porCategoria; }
    public void setPorCategoria(List<MetricaCategoria> porCategoria) { this.porCategoria = porCategoria; }
    public List<HistorialSubasta> getHistorial() { return historial; }
    public void setHistorial(List<HistorialSubasta> historial) { this.historial = historial; }
    public String getCategoriaActual() { return categoriaActual; }
    public void setCategoriaActual(String categoriaActual) { this.categoriaActual = categoriaActual; }
    public boolean isSubioCategoria() { return subioCategoria; }
    public void setSubioCategoria(boolean subioCategoria) { this.subioCategoria = subioCategoria; }
}
