package com.next.subastas.dto;

public class ActiveItemMessage {
    private Integer subastaId;
    private ItemDetalleDTO itemActivo;

    public Integer getSubastaId() { return subastaId; }
    public void setSubastaId(Integer subastaId) { this.subastaId = subastaId; }
    public ItemDetalleDTO getItemActivo() { return itemActivo; }
    public void setItemActivo(ItemDetalleDTO itemActivo) { this.itemActivo = itemActivo; }
}
