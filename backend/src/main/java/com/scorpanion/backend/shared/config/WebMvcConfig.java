package com.scorpanion.backend.shared.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableConfigurationProperties(CorsProperties.class)
public class WebMvcConfig implements WebMvcConfigurer {

	private final CorsProperties corsProperties;

	public WebMvcConfig(CorsProperties corsProperties) {
		this.corsProperties = corsProperties;
	}

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		var patterns = corsProperties.getAllowedOriginPatterns();
		if (patterns.isEmpty()) {
			return;
		}
		registry.addMapping("/**")
				.allowedOriginPatterns(patterns.toArray(String[]::new))
				.allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
				.allowedHeaders("*");
	}
}


