package getdevnode.backend.config;

import com.google.genai.Client;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Configuration(proxyBeanMethods = false)
public class GoogleGenAiConfig {

    @Value("${spring.ai.google.genai.api-key:${GEMINI_API_KEY:${GENAI_API_KEY:dummy_gemini_key}}}")
    private String apiKey;

    @Bean
    public Client googleGenAiClient() {
        String defaultFallback = "dummy_gemini_key";
        String effectiveKey = StringUtils.hasText(apiKey) ? apiKey.trim() : defaultFallback;
        if (effectiveKey.isEmpty()) {
            effectiveKey = defaultFallback;
        }
        return Client.builder().apiKey(effectiveKey).build();
    }
}
