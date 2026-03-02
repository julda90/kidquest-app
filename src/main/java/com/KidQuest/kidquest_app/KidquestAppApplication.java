package com.KidQuest.kidquest_app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class KidquestAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(KidquestAppApplication.class, args);
	}

}
