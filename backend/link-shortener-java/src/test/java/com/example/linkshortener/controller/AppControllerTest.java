package com.example.linkshortener.controller;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.example.linkshortener.service.AppService;

@WebMvcTest(AppController.class)
class AppControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AppService appService;

    @Test
    void getHello() throws Exception {
        when(appService.getHello()).thenReturn("Hello World!");
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(content().string("Hello World!"));
    }

    @Test
    void shortenReturnsHash() throws Exception {
        when(appService.shorten(anyString())).thenReturn("abc123");
        mockMvc.perform(post("/shorten")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"url\":\"aerabi.com\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hash").value("abc123"));
    }

    @Test
    void shortenWithoutUrlReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/shorten")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void retrieveAndRedirect() throws Exception {
        when(appService.retrieve("abc123")).thenReturn("https://aerabi.com");
        mockMvc.perform(get("/abc123"))
                .andExpect(status().isFound())
                .andExpect(redirectedUrl("https://aerabi.com"));
    }
}
