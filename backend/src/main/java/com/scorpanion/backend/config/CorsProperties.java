package com.scorpanion.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

@ConfigurationProperties(prefix = "app.cors")
public class CorsProperties {

	/**
	 * Origines autorisées pour les requêtes cross-origin (navigateur).
	 * Voir {@code application.yml}, clé {@code app.cors.allowed-origin-patterns}.
	 */
	private List<String> allowedOriginPatterns = new ArrayList<>();

	public List<String> getAllowedOriginPatterns() {
		return allowedOriginPatterns;
	}

	public void setAllowedOriginPatterns(List<String> allowedOriginPatterns) {
		this.allowedOriginPatterns = allowedOriginPatterns;
	}
}
