package com.next.subastas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class NextSubastasApplication {
    public static void main(String[] args) {
        SpringApplication.run(NextSubastasApplication.class, args);
    }
}
