package getdevnode.backend.config;

import com.google.genai.Client;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Configuration
public class GoogleGenAiConfig {

    @Value("${spring.ai.google.genai.api-key:${GEMINI_API_KEY:${GENAI_API_KEY:AIzaSyD672P1BrDH5IzHWA_wo5F0uhTodCj4bT8}}}")
    private String apiKey;

    @Bean
    public Client googleGenAiClient() {
        String defaultFallback = "AIzaSyD672P1BrDH5IzHWA_wo5F0uhTodCj4bT8";
        String effectiveKey = StringUtils.hasText(apiKey) ? apiKey.trim() : defaultFallback;
        if (effectiveKey.isEmpty()) {
            effectiveKey = defaultFallback;
        }
        return Client.builder().apiKey(effectiveKey).build();
    }
}
