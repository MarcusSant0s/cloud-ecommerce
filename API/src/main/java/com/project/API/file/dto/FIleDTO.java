package com.project.API.file.dto;

public class FIleDTO{

    public FIleDTO(Long id, String Url) {
        this.id = id;
        this.Url = Url;
    }

    private Long id;
    private String Url;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUrl() {
        return Url;
    }

    public void setUrl(String url) {
        Url = url;
    }

}
