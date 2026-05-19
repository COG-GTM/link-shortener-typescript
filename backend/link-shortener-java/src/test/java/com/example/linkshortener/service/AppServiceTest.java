package com.example.linkshortener.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.example.linkshortener.repository.AppRepositoryHashmap;

class AppServiceTest {

    private AppService appService;

    @BeforeEach
    void setUp() {
        appService = new AppService(new AppRepositoryHashmap());
    }

    @Test
    void getHello() {
        assertEquals("Hello World!", appService.getHello());
    }

    @Test
    void shortenAndRetrieve() {
        String url = "aerabi.com";
        String hash = appService.shorten(url);
        assertNotNull(hash);
        String retrieved = appService.retrieve(hash);
        assertEquals(url, retrieved);
    }
}
